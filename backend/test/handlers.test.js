import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { clearStore } from '../src/repositories/dynamoRepository.js';
import { clearDispatchedAlerts } from '../src/services/notificationService.js';

import { handler as registerDonorHandler } from '../src/handlers/donors/registerDonor.js';
import { handler as getDonorProfileHandler } from '../src/handlers/donors/getDonorProfile.js';
import { handler as updateAvailabilityHandler } from '../src/handlers/donors/updateDonorAvailability.js';
import { handler as searchDonorsHandler } from '../src/handlers/donors/searchDonors.js';
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
  claims = null,
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
    identity: { sourceIp: '127.0.0.1' },
    ...(claims ? { authorizer: { claims } } : {})
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
    const donorObj = JSON.parse(regRes.body).data;
    const donorId = donorObj.donorId;
    const token = donorObj.verificationToken;

    // 2. Retrieve donor using donor verification token
    const getEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/donors/${donorId}`,
      pathParameters: { donorId },
      headers: { 'x-donor-token': token }
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
      pathParameters: { donorId: 'nonexistent' },
      claims: { sub: 'nonexistent', 'custom:userRole': 'DONOR' }
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
    const donorObj = JSON.parse(regRes.body).data;
    const donorId = donorObj.donorId;
    const token = donorObj.verificationToken;

    // Toggle availability using donor token
    const putEvent = createMockEvent({
      httpMethod: 'PUT',
      path: `/donors/${donorId}/availability`,
      pathParameters: { donorId },
      headers: { 'x-donor-token': token },
      body: { isAvailable: false }
    });
    const putRes = await updateAvailabilityHandler(putEvent);
    assert.strictEqual(putRes.statusCode, 200);
    assert.strictEqual(JSON.parse(putRes.body).data.isAvailable, false);
  });

  it('searchDonorsHandler should return 200 with sanitized donor list', async () => {
    // Register a donor
    await registerDonorHandler(createMockEvent({
      httpMethod: 'POST',
      path: '/donors',
      body: {
        name: 'Krish Kumaresh',
        email: 'krish@example.com',
        phone: '+919876543210',
        bloodType: 'A+',
        city: 'Nagercoil'
      }
    }));

    const searchRes = await searchDonorsHandler(createMockEvent({
      httpMethod: 'GET',
      path: '/donors',
      queryStringParameters: { bloodType: 'A+' }
    }));

    assert.strictEqual(searchRes.statusCode, 200);
    const donors = JSON.parse(searchRes.body).data;
    assert.ok(Array.isArray(donors));
    assert.ok(donors.length >= 1);
    assert.strictEqual(donors[0].bloodType, 'A+');
    assert.strictEqual(donors[0].city, 'Nagercoil');
    // Ensure PII is not leaked
    assert.strictEqual(donors[0].phone, undefined);
    assert.strictEqual(donors[0].email, undefined);
  });

  it('createBloodRequestHandler and getBloodRequestsHandler should work end-to-end with hospital auth', async () => {
    // 1. Unauthenticated request should be rejected with 401
    const unauthEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/requests',
      body: {
        requesterName: 'Dr. Sarah Adams',
        hospitalName: 'San Francisco General Trauma',
        bloodType: 'O-',
        unitsNeeded: 3,
        urgencyLevel: 'CRITICAL',
        city: 'San Francisco, CA',
        contactPhone: '+1 (555) 890-1234'
      }
    });
    const unauthRes = await createBloodRequestHandler(unauthEvent);
    assert.strictEqual(unauthRes.statusCode, 401);

    // 2. Authenticated hospital staff should succeed
    const createEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/requests',
      claims: {
        sub: 'staff-user-01',
        'custom:userRole': 'HOSPITAL_STAFF',
        'custom:hospitalId': 'sf-trauma'
      },
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

    // 3. Public list of requests (sanitized emergency information)
    const listEvent = createMockEvent({
      httpMethod: 'GET',
      path: '/requests'
    });
    const listRes = await getBloodRequestsHandler(listEvent);
    assert.strictEqual(listRes.statusCode, 200);
    const listData = JSON.parse(listRes.body).data;
    assert.strictEqual(listData.length, 1);
    assert.strictEqual(listData[0].hospitalName, 'San Francisco General Trauma');
    // Ensure no private internal fields leak
    assert.strictEqual(listData[0].PK, undefined);
    assert.strictEqual(listData[0].SK, undefined);
  });

  it('matchDonorsHandler should enforce hospital authorization and cross-facility isolation', async () => {
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

    // Create O- blood request for Hospital A (sf-trauma)
    const reqRes = await createBloodRequestHandler(createMockEvent({
      httpMethod: 'POST',
      claims: {
        sub: 'staff-user-01',
        'custom:userRole': 'HOSPITAL_STAFF',
        'custom:hospitalId': 'sf-trauma'
      },
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

    // 1. Staff from different hospital (oakland-general) should be rejected with 403 Forbidden
    const crossFacilityEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/requests/${requestId}/matches`,
      pathParameters: { requestId },
      claims: {
        sub: 'other-staff-99',
        'custom:userRole': 'HOSPITAL_STAFF',
        'custom:hospitalId': 'oakland-general'
      }
    });
    const crossRes = await matchDonorsHandler(crossFacilityEvent);
    assert.strictEqual(crossRes.statusCode, 403);

    // 2. Authorized hospital staff (sf-trauma) should succeed
    const matchEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/requests/${requestId}/matches`,
      pathParameters: { requestId },
      claims: {
        sub: 'staff-user-01',
        'custom:userRole': 'HOSPITAL_STAFF',
        'custom:hospitalId': 'sf-trauma'
      },
      queryStringParameters: { radius: '50' }
    });

    const matchRes = await matchDonorsHandler(matchEvent);
    assert.strictEqual(matchRes.statusCode, 200);

    const matchData = JSON.parse(matchRes.body).data;
    assert.strictEqual(matchData.requestedBloodType, 'O-');
    assert.strictEqual(matchData.matches.length, 1);
    assert.strictEqual(matchData.matches[0].bloodType, 'O-');
    // Ensure donor privacy in matches (no phone, no email, no coordinates)
    assert.strictEqual(matchData.matches[0].phone, undefined);
    assert.strictEqual(matchData.matches[0].email, undefined);
    assert.strictEqual(matchData.matches[0].location, undefined);
  });

  it('respondToRequestHandler should enforce donor verification and protect donor privacy', async () => {
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
    const donorObj = JSON.parse(donorRes.body).data;
    const donorId = donorObj.donorId;
    const token = donorObj.verificationToken;

    // Create request with hospital credentials
    const reqRes = await createBloodRequestHandler(createMockEvent({
      httpMethod: 'POST',
      claims: {
        sub: 'doc-vance',
        'custom:userRole': 'HOSPITAL_STAFF',
        'custom:hospitalId': 'highland'
      },
      body: {
        requesterName: 'Dr. Vance',
        hospitalName: 'Highland Hospital',
        bloodType: 'O+',
        contactPhone: '+1 (555) 789-5678',
        city: 'Oakland, CA'
      }
    }));
    const requestId = JSON.parse(reqRes.body).data.requestId;

    // 1. Unverified / forged response attempt should return 403 Forbidden
    const forgedEvent = createMockEvent({
      httpMethod: 'POST',
      path: `/requests/${requestId}/respond`,
      pathParameters: { requestId },
      body: {
        donorId,
        status: 'ACCEPTED',
        etaMinutes: 25
      }
    });
    const forgedRes = await respondToRequestHandler(forgedEvent);
    assert.strictEqual(forgedRes.statusCode, 403);

    // 2. Legitimate response with donor verification token should succeed (201 Created)
    const validRespondEvent = createMockEvent({
      httpMethod: 'POST',
      path: `/requests/${requestId}/respond`,
      pathParameters: { requestId },
      headers: { 'x-donor-token': token },
      body: {
        donorId,
        status: 'ACCEPTED',
        etaMinutes: 25,
        notes: 'In transit on highway'
      }
    });

    const respondRes = await respondToRequestHandler(validRespondEvent);
    assert.strictEqual(respondRes.statusCode, 201);
    const recordedResponse = JSON.parse(respondRes.body).data;
    // Verify personal name is masked
    assert.strictEqual(recordedResponse.displayName, 'Elena R.');
    assert.strictEqual(recordedResponse.phone, undefined);

    // 3. Retrieve public details - ensure responses are masked
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
    assert.strictEqual(detailsData.responses[0].displayName, 'Elena R.');
    assert.strictEqual(detailsData.responses[0].status, 'ACCEPTED');
    assert.strictEqual(detailsData.responses[0].etaMinutes, 25);
    // Crucial privacy check: no phone or email exposed in public responses
    assert.strictEqual(detailsData.responses[0].phone, undefined);
    assert.strictEqual(detailsData.responses[0].email, undefined);
  });
});
