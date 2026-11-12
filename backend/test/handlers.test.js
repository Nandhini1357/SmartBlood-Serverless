import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { clearStore } from '../src/repositories/dynamoRepository.js';
import { clearDispatchedAlerts } from '../src/services/notificationService.js';

import { handler as registerDonorHandler } from '../src/handlers/donors/registerDonor.js';
import { handler as getDonorProfileHandler } from '../src/handlers/donors/getDonorProfile.js';
import { handler as updateAvailabilityHandler } from '../src/handlers/donors/updateDonorAvailability.js';
import { handler as createBloodRequestHandler } from '../src/handlers/requests/createBloodRequest.js';
import { handler as getBloodRequestsHandler } from '../src/handlers/requests/getBloodRequests.js';
import { handler as getRequestDetailsHandler } from '../src/handlers/requests/getRequestDetails.js';
import { handler as respondToRequestHandler } from '../src/handlers/requests/respondToRequest.js';
import { handler as matchDonorsHandler } from '../src/handlers/matching/matchDonors.js';

const createMockEvent = ({
  body = null,
  pathParameters = null,
  queryStringParameters = null,
  headers = {},
  httpMethod = 'GET',
  path = '/'
}) => ({
  body: body ? JSON.stringify(body) : null,
  pathParameters,
  queryStringParameters,
  headers: {
    'Content-Type': 'application/json',
    ...headers
  },
  httpMethod,
  path,
  requestContext: {
    requestId: 'test-lambda-req-id',
    identity: { sourceIp: '127.0.0.1' }
  }
});

describe('AWS Lambda Handlers (Simulated API Gateway Events)', () => {
  beforeEach(() => {
    clearStore();
    clearDispatchedAlerts();
  });

  it('registerDonorHandler should return 201 Created with valid payload', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donors',
      body: {
        name: 'Marcus Vance',
        email: 'marcus@example.com',
        phone: '+1 (555) 234-5601',
        bloodType: 'O-',
        city: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194
      }
    });

    const response = await registerDonorHandler(event);
    assert.strictEqual(response.statusCode, 201);

    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, 'Marcus Vance');
    assert.strictEqual(body.data.bloodType, 'O-');
  });

  it('getDonorProfileHandler should return 200 for existing donor, and 404 for unknown donor', async () => {
    // 1. Register donor
    const regEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/donors',
      body: {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        phone: '+1 (555) 234-5602',
        bloodType: 'O+',
        city: 'Oakland, CA'
      }
    });
    const regRes = await registerDonorHandler(regEvent);
    const donorId = JSON.parse(regRes.body).data.donorId;

    // 2. Retrieve donor
    const getEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/donors/${donorId}`,
      pathParameters: { donorId }
    });
    const getRes = await getDonorProfileHandler(getEvent);
    assert.strictEqual(getRes.statusCode, 200);
    const donorData = JSON.parse(getRes.body).data;
    assert.strictEqual(donorData.donorId, donorId);
    assert.strictEqual(donorData.name, 'Elena Rostova');

    // 3. Test 404 NotFound
    const notFoundEvent = createMockEvent({
      httpMethod: 'GET',
      path: '/donors/nonexistent',
      pathParameters: { donorId: 'nonexistent' }
    });
    const notFoundRes = await getDonorProfileHandler(notFoundEvent);
    assert.strictEqual(notFoundRes.statusCode, 404);
  });

  it('updateAvailabilityHandler should update donor availability and return 200', async () => {
    // Register donor
    const regEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/donors',
      body: {
        name: 'Derrick Hayes',
        email: 'derrick@example.com',
        phone: '+1 (555) 234-5603',
        bloodType: 'A+',
        city: 'Berkeley, CA'
      }
    });
    const regRes = await registerDonorHandler(regEvent);
    const donorId = JSON.parse(regRes.body).data.donorId;

    // Toggle availability
    const putEvent = createMockEvent({
      httpMethod: 'PUT',
      path: `/donors/${donorId}/availability`,
      pathParameters: { donorId },
      body: { isAvailable: false }
    });
    const putRes = await updateAvailabilityHandler(putEvent);
    assert.strictEqual(putRes.statusCode, 200);
    assert.strictEqual(JSON.parse(putRes.body).data.isAvailable, false);
  });

  it('createBloodRequestHandler and getBloodRequestsHandler should work end-to-end', async () => {
    // Create emergency request
    const createEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/requests',
      body: {
        requesterName: 'Dr. Sarah Adams',
        hospitalName: 'San Francisco General Trauma',
        bloodType: 'O-',
        unitsNeeded: 3,
        urgencyLevel: 'CRITICAL',
        city: 'San Francisco, CA',
        contactPhone: '+1 (555) 890-1234',
        latitude: 37.7558,
        longitude: -122.4047
      }
    });

    const createRes = await createBloodRequestHandler(createEvent);
    assert.strictEqual(createRes.statusCode, 201);
    const createdReq = JSON.parse(createRes.body).data;
    assert.strictEqual(createdReq.bloodType, 'O-');

    // List all requests
    const listEvent = createMockEvent({
      httpMethod: 'GET',
      path: '/requests'
    });
    const listRes = await getBloodRequestsHandler(listEvent);
    assert.strictEqual(listRes.statusCode, 200);
    const listData = JSON.parse(listRes.body).data;
    assert.strictEqual(listData.length, 1);
  });

  it('matchDonorsHandler should return matches for an active blood request', async () => {
    // Register compatible donor
    await registerDonorHandler(createMockEvent({
      httpMethod: 'POST',
      body: {
        name: 'Marcus Vance',
        email: 'marcus@example.com',
        phone: '+1 (555) 234-5601',
        bloodType: 'O-',
        city: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194
      }
    }));

    // Create O- blood request
    const reqRes = await createBloodRequestHandler(createMockEvent({
      httpMethod: 'POST',
      body: {
        requesterName: 'Dr. Adams',
        hospitalName: 'SF Trauma',
        bloodType: 'O-',
        unitsNeeded: 2,
        urgencyLevel: 'CRITICAL',
        city: 'San Francisco, CA',
        contactPhone: '+1 (555) 890-1234',
        latitude: 37.7558,
        longitude: -122.4047
      }
    }));
    const requestId = JSON.parse(reqRes.body).data.requestId;

    // Query matches
    const matchEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/requests/${requestId}/matches`,
      pathParameters: { requestId },
      queryStringParameters: { radius: '50' }
    });

    const matchRes = await matchDonorsHandler(matchEvent);
    assert.strictEqual(matchRes.statusCode, 200);

    const matchData = JSON.parse(matchRes.body).data;
    assert.strictEqual(matchData.requestedBloodType, 'O-');
    assert.strictEqual(matchData.matches.length, 1);
    assert.strictEqual(matchData.matches[0].bloodType, 'O-');
  });

  it('respondToRequestHandler and getRequestDetailsHandler should record response and return details', async () => {
    // Register donor
    const donorRes = await registerDonorHandler(createMockEvent({
      httpMethod: 'POST',
      body: {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        phone: '+1 (555) 234-5602',
        bloodType: 'O+',
        city: 'Oakland, CA'
      }
    }));
    const donorId = JSON.parse(donorRes.body).data.donorId;

    // Create request
    const reqRes = await createBloodRequestHandler(createMockEvent({
      httpMethod: 'POST',
      body: {
        requesterName: 'Dr. Vance',
        hospitalName: 'Highland Hospital',
        bloodType: 'O+',
        contactPhone: '+1 (555) 789-5678',
        city: 'Oakland, CA'
      }
    }));
    const requestId = JSON.parse(reqRes.body).data.requestId;

    // Respond to request
    const respondEvent = createMockEvent({
      httpMethod: 'POST',
      path: `/requests/${requestId}/respond`,
      pathParameters: { requestId },
      body: {
        donorId,
        status: 'ACCEPTED',
        etaMinutes: 25,
        notes: 'En route'
      }
    });

    const respondRes = await respondToRequestHandler(respondEvent);
    assert.strictEqual(respondRes.statusCode, 201);

    // Retrieve details
    const detailsEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/requests/${requestId}`,
      pathParameters: { requestId }
    });

    const detailsRes = await getRequestDetailsHandler(detailsEvent);
    assert.strictEqual(detailsRes.statusCode, 200);

    const detailsData = JSON.parse(detailsRes.body).data;
    assert.strictEqual(detailsData.requestId, requestId);
    assert.strictEqual(detailsData.responses.length, 1);
    assert.strictEqual(detailsData.responses[0].status, 'ACCEPTED');
    assert.strictEqual(detailsData.responses[0].etaMinutes, 25);
  });
});
