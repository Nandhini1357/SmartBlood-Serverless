/**
 * SmartBlood - Frontend API Service Client
 * Connects to Amazon API Gateway endpoints with a fully interactive
 * offline/mock fallback mode for local testing and hackathon review.
 */

import { cognitoAuth } from './cognitoAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const FORCE_MOCK = import.meta.env.VITE_MOCK_API_FALLBACK !== 'false';

// Helper to determine active mode
export const isMockMode = () => !API_BASE_URL || FORCE_MOCK;

/**
 * Attaches Cognito Bearer ID Token to protected API Gateway requests.
 */
const getAuthHeaders = async (extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  try {
    const token = await cognitoAuth.getIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Could not resolve Cognito IdToken for request:', err?.message);
  }
  return headers;
};

// ==============================================================================
// Clean Offline Fallback Structures (Empty - Real Data only from AWS Backend)
// ==============================================================================
const mockDonors = [];

const mockRequests = [];
let mockInventory = [];

// Helper: Haversine distance in km
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Helper for robust live API error handling
const handleApiResponse = async (res, context = 'API request') => {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      errorBody?.message ||
      errorBody?.error ||
      `AWS API Gateway error during ${context}: HTTP ${res.status} (${res.statusText || 'Request failed'})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
};

// ==============================================================================
// Unified API Client Implementation
// ==============================================================================
export const bloodApi = {
  /**
   * 1. Get Blood Requests
   */
  async getBloodRequests(status = null) {
    if (isMockMode()) {
      return status
        ? mockRequests.filter((r) => r.status === status.toUpperCase())
        : [...mockRequests];
    }

    const url = new URL(`${API_BASE_URL}/requests`);
    if (status) url.searchParams.append('status', status);
    const res = await fetch(url.toString());
    return await handleApiResponse(res, 'fetch blood requests');
  },

  /**
   * 2. Get Blood Request Details by ID
   */
  async getBloodRequestById(requestId) {
    if (isMockMode()) {
      const found = mockRequests.find((r) => r.requestId === requestId);
      if (!found) throw new Error('Blood request not found');
      return { ...found };
    }

    const res = await fetch(`${API_BASE_URL}/requests/${requestId}`);
    return await handleApiResponse(res, `fetch request details for ${requestId}`);
  },

  /**
   * 3. Create Emergency Blood Request
   */
  async createBloodRequest(payload) {
    if (isMockMode()) {
      const newRequest = {
        requestId: `req-live-${Date.now()}`,
        status: 'PENDING',
        responsesCount: 0,
        responses: [],
        createdAt: new Date().toISOString(),
        ...payload
      };
      mockRequests.unshift(newRequest);
      return newRequest;
    }

    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return await handleApiResponse(res, 'create blood request');
  },

  /**
   * 4. Register Donor
   */
  async registerDonor(payload) {
    if (isMockMode()) {
      const newDonor = {
        donorId: `donor-${Date.now()}`,
        displayName: payload.name.split(' ')[0] + ' ' + (payload.name.split(' ')[1]?.[0] || '') + '.',
        isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
        lastDonationDate: null,
        createdAt: new Date().toISOString(),
        ...payload
      };
      mockDonors.unshift(newDonor);
      return newDonor;
    }

    const res = await fetch(`${API_BASE_URL}/donors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleApiResponse(res, 'register donor');
  },

  /**
   * 5. Get Donor Profile
   */
  async getDonorProfile(donorId) {
    if (isMockMode()) {
      const donor = mockDonors.find((d) => d.donorId === donorId);
      if (!donor) throw new Error('Donor profile not found');
      return { ...donor };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/donors/${donorId}`, { headers });
    return await handleApiResponse(res, `fetch donor profile ${donorId}`);
  },

  /**
   * 6. Update Donor Availability
   */
  async updateDonorAvailability(donorId, isAvailable) {
    if (isMockMode()) {
      const donor = mockDonors.find((d) => d.donorId === donorId);
      if (donor) {
        donor.isAvailable = isAvailable;
        return { ...donor };
      }
      return { donorId, isAvailable };
    }

    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(`${API_BASE_URL}/donors/${donorId}/availability`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isAvailable })
    });
    return await handleApiResponse(res, `update availability for donor ${donorId}`);
  },

  /**
   * 7. Intelligent Matching Engine
   */
  async getMatches(requestId, radius = 50) {
    if (isMockMode()) {
      const request = mockRequests.find((r) => r.requestId === requestId) || mockRequests[0];
      const compMap = {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'AB-': ['O-', 'A-', 'B-', 'AB-'],
        'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
      };
      const compatibleTypes = compMap[request.bloodType] || [];

      const matches = mockDonors
        .filter((d) => d.isAvailable && compatibleTypes.includes(d.bloodType))
        .map((d) => {
          let distanceKm = null;
          if (request.latitude && request.longitude && d.latitude && d.longitude) {
            distanceKm = haversineDistance(request.latitude, request.longitude, d.latitude, d.longitude);
          }
          const isExactMatch = d.bloodType === request.bloodType;
          const score = Math.max(10, Math.round((isExactMatch ? 100 : 70) - (distanceKm ? Math.min(distanceKm, 50) : 0)));
          return {
            donorId: d.donorId,
            displayName: d.displayName || d.name,
            bloodType: d.bloodType,
            city: d.city,
            distanceKm,
            isExactMatch,
            matchScore: score,
            isAvailable: d.isAvailable
          };
        })
        .filter((m) => radius == null || m.distanceKm == null || m.distanceKm <= radius)
        .sort((a, b) => b.matchScore - a.matchScore);

      return {
        requestId: request.requestId,
        requestedBloodType: request.bloodType,
        hospitalName: request.hospitalName,
        city: request.city,
        totalCompatibleDonorsFound: matches.length,
        searchRadiusKm: radius,
        matches
      };
    }

    const url = new URL(`${API_BASE_URL}/requests/${requestId}/matches`);
    if (radius) url.searchParams.append('radius', radius);
    const headers = await getAuthHeaders();
    const res = await fetch(url.toString(), { headers });
    return await handleApiResponse(res, `fetch matching donors for ${requestId}`);
  },

  /**
   * 8. Respond to Emergency Request (Donor acceptance / ETA pledge)
   */
  async respondToRequest(requestId, payload) {
    if (isMockMode()) {
      const req = mockRequests.find((r) => r.requestId === requestId);
      const donor = mockDonors.find((d) => d.donorId === payload.donorId) || { name: 'Verified Donor' };

      const newResponse = {
        donorId: payload.donorId,
        donorName: donor.name,
        status: payload.status,
        etaMinutes: payload.etaMinutes,
        notes: payload.notes || '',
        createdAt: new Date().toISOString()
      };

      if (req) {
        req.responses = req.responses || [];
        req.responses.unshift(newResponse);
        req.responsesCount = (req.responsesCount || 0) + 1;
      }

      return newResponse;
    }

    const headers = await getAuthHeaders({
      'Content-Type': 'application/json',
      ...(payload.verificationToken ? { 'x-donor-token': payload.verificationToken } : {})
    });

    const res = await fetch(`${API_BASE_URL}/requests/${requestId}/respond`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return await handleApiResponse(res, `record response for request ${requestId}`);
  },

  /**
   * 9. Search Donors (Directory view)
   */
  async searchDonors({ bloodType = null, radius = 50, city = '' }) {
    if (isMockMode()) {
      let filtered = mockDonors.filter((d) => d.isAvailable);

      if (bloodType) {
        filtered = filtered.filter((d) => d.bloodType === bloodType.toUpperCase());
      }

      if (city) {
        filtered = filtered.filter((d) => d.city.toLowerCase().includes(city.toLowerCase()));
      }

      return filtered.map((d) => ({
        donorId: d.donorId,
        displayName: d.displayName || d.name,
        bloodType: d.bloodType,
        city: d.city,
        distanceKm: Math.floor(Math.random() * 25) + 3,
        isAvailable: d.isAvailable
      }));
    }

    const params = new URLSearchParams();
    if (bloodType && bloodType !== 'All') {
      params.append('bloodType', bloodType);
    }
    if (city && city.trim()) {
      params.append('city', city.trim());
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/donors${queryStr}`);
    const results = await handleApiResponse(res, 'search donors');

    // Also reconcile with locally registered active donor profile if present
    try {
      const saved = localStorage.getItem('smartblood_active_donor');
      if (saved) {
        const localDonor = JSON.parse(saved);
        if (localDonor && (localDonor.isAvailable === undefined || localDonor.isAvailable)) {
          const alreadyIn = results.some((d) => d.donorId === localDonor.donorId);
          if (!alreadyIn) {
            const matchesBlood = !bloodType || bloodType === 'All' || localDonor.bloodType === bloodType.toUpperCase();
            const matchesCity = !city || (localDonor.city && localDonor.city.toLowerCase().includes(city.toLowerCase()));
            if (matchesBlood && matchesCity) {
              const nameParts = localDonor.name ? localDonor.name.trim().split(/\s+/) : [];
              const displayName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : (nameParts[0] || 'Verified Donor');
              results.unshift({
                donorId: localDonor.donorId,
                displayName: `${displayName} (You)`,
                bloodType: localDonor.bloodType,
                city: localDonor.city,
                distanceKm: 0,
                isAvailable: true
              });
            }
          }
        }
      }
    } catch (e) {
      // Ignore local storage parse errors
    }

    return results;
  },

  /**
   * 10. Blood Bank Inventory Telemetry
   */
  async getBankInventory(bankId = 'main-blood-bank') {
    if (isMockMode()) {
      return [...mockInventory];
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/bloodbanks/${bankId}/inventory`, { headers });
    return await handleApiResponse(res, `fetch inventory for ${bankId}`);
  },

  /**
   * 11. Update Blood Bank Inventory
   */
  async updateBankInventory(bankId, payload) {
    if (isMockMode()) {
      const item = mockInventory.find((i) => i.bloodType === payload.bloodType);
      if (item) {
        item.unitsAvailable = Math.max(0, payload.unitsAvailable);
        item.status = item.unitsAvailable < 4 ? 'Critical' : item.unitsAvailable < 8 ? 'Low' : 'Optimal';
        return { ...item };
      }
      return payload;
    }

    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(`${API_BASE_URL}/bloodbanks/${bankId}/inventory`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });
    return await handleApiResponse(res, `update inventory for ${bankId}`);
  }
};
