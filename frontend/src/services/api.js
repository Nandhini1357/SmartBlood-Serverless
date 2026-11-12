/**
 * SmartBlood - Frontend API Service Client
 * Supports AWS API Gateway live integration with fallback mock data for testing.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = import.meta.env.VITE_MOCK_API_FALLBACK !== 'false';

// Mock state for local testing before backend deployment
const mockRequests = [
  {
    requestId: 'req-001',
    hospitalName: 'Metro General Hospital (ER Trauma)',
    bloodType: 'O-',
    unitsNeeded: 3,
    urgencyLevel: 'CRITICAL',
    city: 'San Francisco, CA',
    contactPhone: '+1 (555) 234-5678',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    requestId: 'req-002',
    hospitalName: 'Children & Maternity Health Center',
    bloodType: 'A+',
    unitsNeeded: 2,
    urgencyLevel: 'URGENT',
    city: 'Oakland, CA',
    contactPhone: '+1 (555) 876-5432',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString()
  },
  {
    requestId: 'req-003',
    hospitalName: 'University Medical Center',
    bloodType: 'B-',
    unitsNeeded: 1,
    urgencyLevel: 'NORMAL',
    city: 'San Jose, CA',
    contactPhone: '+1 (555) 345-6789',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
];

export const bloodApi = {
  // Get all active blood requests
  async getBloodRequests(status = null) {
    if (API_BASE_URL && !USE_MOCK) {
      const url = new URL(`${API_BASE_URL}/requests`);
      if (status) url.searchParams.append('status', status);
      const res = await fetch(url.toString());
      const json = await res.json();
      return json.data;
    }
    // Return mock data
    return status
      ? mockRequests.filter((r) => r.status === status.toUpperCase())
      : mockRequests;
  },

  // Create an emergency blood request
  async createBloodRequest(payload) {
    if (API_BASE_URL && !USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      return json.data;
    }

    const newRequest = {
      requestId: `req-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...payload
    };
    mockRequests.unshift(newRequest);
    return newRequest;
  },

  // Register donor
  async registerDonor(payload) {
    if (API_BASE_URL && !USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      return json.data;
    }

    return {
      donorId: `donor-${Date.now()}`,
      ...payload,
      isAvailable: true,
      createdAt: new Date().toISOString()
    };
  },

  // Get matching donors for request
  async getMatches(requestId) {
    if (API_BASE_URL && !USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}/requests/${requestId}/matches`);
      const json = await res.json();
      return json.data;
    }

    return {
      requestId,
      totalCompatibleDonorsFound: 3,
      matches: [
        {
          donorId: 'd-101',
          name: 'Alex Rivera',
          bloodType: 'O-',
          distanceKm: 4.2,
          isExactMatch: true,
          matchScore: 95.8,
          isAvailable: true
        },
        {
          donorId: 'd-102',
          name: 'Sarah Chen',
          bloodType: 'O-',
          distanceKm: 8.7,
          isExactMatch: true,
          matchScore: 91.3,
          isAvailable: true
        },
        {
          donorId: 'd-103',
          name: 'Michael Davis',
          bloodType: 'O+',
          distanceKm: 12.1,
          isExactMatch: false,
          matchScore: 68.0,
          isAvailable: true
        }
      ]
    };
  }
};
