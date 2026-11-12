/**
 * SmartBlood - Frontend API Service Client
 * Connects to Amazon API Gateway endpoints with a fully interactive
 * offline/mock fallback mode for local testing and hackathon review.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const FORCE_MOCK = import.meta.env.VITE_MOCK_API_FALLBACK !== 'false';

// Helper to determine active mode
export const isMockMode = () => !API_BASE_URL || FORCE_MOCK;

// ==============================================================================
// Realistic Fictional Seed Data for Offline / Hackathon Demo Mode
// ==============================================================================
const mockDonors = [
  {
    donorId: 'd-sf-101',
    name: 'Marcus Vance',
    displayName: 'Marcus V.',
    bloodType: 'O-',
    city: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    phone: '+1 (555) 234-5601',
    isAvailable: true,
    lastDonationDate: '2026-08-14'
  },
  {
    donorId: 'd-oak-102',
    name: 'Elena Rostova',
    displayName: 'Elena R.',
    bloodType: 'O+',
    city: 'Oakland, CA',
    latitude: 37.8044,
    longitude: -122.2712,
    phone: '+1 (555) 234-5602',
    isAvailable: true,
    lastDonationDate: '2026-09-02'
  },
  {
    donorId: 'd-berk-103',
    name: 'Derrick Hayes',
    displayName: 'Derrick H.',
    bloodType: 'A+',
    city: 'Berkeley, CA',
    latitude: 37.8715,
    longitude: -122.2730,
    phone: '+1 (555) 234-5603',
    isAvailable: true,
    lastDonationDate: '2026-07-21'
  },
  {
    donorId: 'd-daly-104',
    name: 'Sophia Zhang',
    displayName: 'Sophia Z.',
    bloodType: 'A-',
    city: 'Daly City, CA',
    latitude: 37.6879,
    longitude: -122.4702,
    phone: '+1 (555) 234-5604',
    isAvailable: true,
    lastDonationDate: '2026-09-10'
  },
  {
    donorId: 'd-sm-105',
    name: 'Rajesh Patel',
    displayName: 'Rajesh P.',
    bloodType: 'B+',
    city: 'San Mateo, CA',
    latitude: 37.5630,
    longitude: -122.3255,
    phone: '+1 (555) 234-5605',
    isAvailable: true,
    lastDonationDate: '2026-06-30'
  },
  {
    donorId: 'd-pa-106',
    name: 'Claire Dubois',
    displayName: 'Claire D.',
    bloodType: 'B-',
    city: 'Palo Alto, CA',
    latitude: 37.4419,
    longitude: -122.1430,
    phone: '+1 (555) 234-5606',
    isAvailable: true,
    lastDonationDate: '2026-08-01'
  },
  {
    donorId: 'd-sj-107',
    name: 'Lucas Silva',
    displayName: 'Lucas S.',
    bloodType: 'AB+',
    city: 'San Jose, CA',
    latitude: 37.3382,
    longitude: -121.8863,
    phone: '+1 (555) 234-5607',
    isAvailable: true,
    lastDonationDate: '2026-05-18'
  },
  {
    donorId: 'd-sf-108',
    name: 'Amina Al-Mansoor',
    displayName: 'Amina M.',
    bloodType: 'AB-',
    city: 'San Francisco, CA',
    latitude: 37.7833,
    longitude: -122.4167,
    phone: '+1 (555) 234-5608',
    isAvailable: false,
    lastDonationDate: '2026-10-05'
  }
];

const mockRequests = [
  {
    requestId: 'req-crit-001',
    requesterName: 'Dr. Eleanor Vance',
    hospitalName: 'San Francisco General Trauma Center',
    bloodType: 'O-',
    unitsNeeded: 3,
    urgencyLevel: 'CRITICAL',
    city: 'San Francisco, CA',
    latitude: 37.7558,
    longitude: -122.4047,
    contactPhone: '+1 (555) 890-1234',
    status: 'PENDING',
    responsesCount: 1,
    responses: [
      {
        donorId: 'd-sf-101',
        donorName: 'Marcus Vance',
        status: 'ACCEPTED',
        etaMinutes: 18,
        notes: 'In transit via 101-North',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    requestId: 'req-urg-002',
    requesterName: 'Dr. Keith Morales',
    hospitalName: 'Highland Hospital Acute Care',
    bloodType: 'A+',
    unitsNeeded: 2,
    urgencyLevel: 'URGENT',
    city: 'Oakland, CA',
    latitude: 37.7997,
    longitude: -122.2312,
    contactPhone: '+1 (555) 789-5678',
    status: 'PENDING',
    responsesCount: 0,
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString()
  },
  {
    requestId: 'req-norm-003',
    requesterName: 'Nurse Supv. Taylor',
    hospitalName: 'Stanford University Medical Center',
    bloodType: 'B-',
    unitsNeeded: 1,
    urgencyLevel: 'NORMAL',
    city: 'Palo Alto, CA',
    latitude: 37.4336,
    longitude: -122.1742,
    contactPhone: '+1 (555) 678-9012',
    status: 'PENDING',
    responsesCount: 0,
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 175).toISOString()
  }
];

let mockInventory = [
  { bloodType: 'O-', unitsAvailable: 3, status: 'Critical', minSafeUnits: 8 },
  { bloodType: 'O+', unitsAvailable: 15, status: 'Optimal', minSafeUnits: 10 },
  { bloodType: 'A-', unitsAvailable: 4, status: 'Low', minSafeUnits: 6 },
  { bloodType: 'A+', unitsAvailable: 18, status: 'Optimal', minSafeUnits: 10 },
  { bloodType: 'B-', unitsAvailable: 2, status: 'Critical', minSafeUnits: 5 },
  { bloodType: 'B+', unitsAvailable: 11, status: 'Optimal', minSafeUnits: 8 },
  { bloodType: 'AB-', unitsAvailable: 1, status: 'Critical', minSafeUnits: 4 },
  { bloodType: 'AB+', unitsAvailable: 9, status: 'Optimal', minSafeUnits: 6 }
];

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

// ==============================================================================
// Unified API Client Implementation
// ==============================================================================
export const bloodApi = {
  /**
   * 1. Get Blood Requests
   */
  async getBloodRequests(status = null) {
    if (!isMockMode()) {
      try {
        const url = new URL(`${API_BASE_URL}/requests`);
        if (status) url.searchParams.append('status', status);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway offline, falling back to mock requests:', err.message);
      }
    }

    // Mock fallback
    return status
      ? mockRequests.filter((r) => r.status === status.toUpperCase())
      : [...mockRequests];
  },

  /**
   * 2. Get Blood Request Details by ID
   */
  async getBloodRequestById(requestId) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/requests/${requestId}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway request details failed, using mock:', err.message);
      }
    }

    const found = mockRequests.find((r) => r.requestId === requestId);
    if (!found) throw new Error('Blood request not found');
    return { ...found };
  },

  /**
   * 3. Create Emergency Blood Request
   */
  async createBloodRequest(payload) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway create request failed, saving to mock state:', err.message);
      }
    }

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
  },

  /**
   * 4. Register Donor
   */
  async registerDonor(payload) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/donors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway register donor failed, using mock:', err.message);
      }
    }

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
  },

  /**
   * 5. Get Donor Profile
   */
  async getDonorProfile(donorId) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/donors/${donorId}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway get donor profile failed:', err.message);
      }
    }

    const donor = mockDonors.find((d) => d.donorId === donorId);
    if (!donor) throw new Error('Donor profile not found');
    return { ...donor };
  },

  /**
   * 6. Update Donor Availability
   */
  async updateDonorAvailability(donorId, isAvailable) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/donors/${donorId}/availability`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAvailable })
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway update availability failed:', err.message);
      }
    }

    const donor = mockDonors.find((d) => d.donorId === donorId);
    if (donor) {
      donor.isAvailable = isAvailable;
      return { ...donor };
    }
    return { donorId, isAvailable };
  },

  /**
   * 7. Intelligent Matching Engine
   */
  async getMatches(requestId, radius = 50) {
    if (!isMockMode()) {
      try {
        const url = new URL(`${API_BASE_URL}/requests/${requestId}/matches`);
        if (radius) url.searchParams.append('radius', radius);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway matches failed, computing client-side mock match:', err.message);
      }
    }

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
  },

  /**
   * 8. Respond to Emergency Request (Donor acceptance / ETA pledge)
   */
  async respondToRequest(requestId, payload) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/requests/${requestId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway respond failed, recording locally:', err.message);
      }
    }

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
  },

  /**
   * 9. Search Donors (Directory view)
   */
  async searchDonors({ bloodType = null, radius = 50, city = '' }) {
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
  },

  /**
   * 10. Blood Bank Inventory Telemetry
   */
  async getBankInventory(bankId = 'main-blood-bank') {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/bloodbanks/${bankId}/inventory`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway get inventory failed:', err.message);
      }
    }

    return [...mockInventory];
  },

  /**
   * 11. Update Blood Bank Inventory
   */
  async updateBankInventory(bankId, payload) {
    if (!isMockMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/bloodbanks/${bankId}/inventory`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        return json.data;
      } catch (err) {
        console.warn('API Gateway update inventory failed:', err.message);
      }
    }

    const item = mockInventory.find((i) => i.bloodType === payload.bloodType);
    if (item) {
      item.unitsAvailable = Math.max(0, payload.unitsAvailable);
      item.status = item.unitsAvailable < 4 ? 'Critical' : item.unitsAvailable < 8 ? 'Low' : 'Optimal';
      return { ...item };
    }
    return payload;
  }
};
