import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createBloodRequest,
  getBloodRequestById,
  listBloodRequests,
  recordDonorResponse,
  getResponsesForRequest,
  fulfillBloodRequest
} from '../src/services/requestService.js';
import { registerDonor } from '../src/services/donorService.js';
import { clearStore } from '../src/repositories/dynamoRepository.js';
import { getDispatchedAlerts, clearDispatchedAlerts } from '../src/services/notificationService.js';

describe('Blood Request Business Service', () => {
  beforeEach(() => {
    clearStore();
    clearDispatchedAlerts();
  });

  it('should create an emergency blood request and dispatch SNS alert for CRITICAL urgency', async () => {
    const payload = {
      requesterName: 'Dr. Eleanor Vance',
      hospitalName: 'San Francisco General Trauma',
      bloodType: 'O-',
      unitsNeeded: 3,
      urgencyLevel: 'CRITICAL',
      city: 'San Francisco, CA',
      latitude: 37.7558,
      longitude: -122.4047,
      contactPhone: '+1 (555) 890-1234'
    };

    const request = await createBloodRequest(payload);
    assert.ok(request.requestId, 'requestId should be assigned');
    assert.strictEqual(request.bloodType, 'O-');
    assert.strictEqual(request.status, 'PENDING');

    // Verify SNS alert was safely triggered in simulated mode
    const alerts = getDispatchedAlerts();
    assert.strictEqual(alerts.length, 1);
    assert.strictEqual(alerts[0].alert.bloodType, 'O-');
    assert.strictEqual(alerts[0].alert.hospitalName, 'San Francisco General Trauma');
  });

  it('should reject request creation with invalid blood type or missing fields', async () => {
    await assert.rejects(
      async () => await createBloodRequest({
        requesterName: 'Dr. Test',
        bloodType: 'INVALID'
      }),
      (err) => err.name === 'ValidationError'
    );
  });

  it('should retrieve a blood request by ID and throw NotFoundError for invalid IDs', async () => {
    const created = await createBloodRequest({
      requesterName: 'Dr. Keith Morales',
      hospitalName: 'Highland Hospital',
      bloodType: 'A+',
      unitsNeeded: 2,
      urgencyLevel: 'URGENT',
      city: 'Oakland, CA',
      contactPhone: '+1 (555) 789-5678'
    });

    const found = await getBloodRequestById(created.requestId);
    assert.strictEqual(found.requestId, created.requestId);
    assert.strictEqual(found.hospitalName, 'Highland Hospital');

    await assert.rejects(
      async () => await getBloodRequestById('non-existent-request'),
      (err) => err.name === 'NotFoundError'
    );
  });

  it('should list all requests and filter by status', async () => {
    const req1 = await createBloodRequest({
      requesterName: 'Dr. A',
      hospitalName: 'Hospital A',
      bloodType: 'O+',
      contactPhone: '+1 (555) 111-2222',
      city: 'City A'
    });

    const req2 = await createBloodRequest({
      requesterName: 'Dr. B',
      hospitalName: 'Hospital B',
      bloodType: 'B+',
      contactPhone: '+1 (555) 333-4444',
      city: 'City B'
    });

    const all = await listBloodRequests();
    assert.strictEqual(all.length, 2);

    const pendingOnly = await listBloodRequests('PENDING');
    assert.strictEqual(pendingOnly.length, 2);
  });

  it('should record a donor response and update response counts', async () => {
    const donor = await registerDonor({
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      phone: '+1 (555) 234-5601',
      bloodType: 'O-',
      city: 'San Francisco, CA'
    });

    const req = await createBloodRequest({
      requesterName: 'Dr. Vance',
      hospitalName: 'SF Trauma',
      bloodType: 'O-',
      contactPhone: '+1 (555) 123-4567',
      city: 'San Francisco, CA'
    });

    const response = await recordDonorResponse(req.requestId, {
      donorId: donor.donorId,
      status: 'ACCEPTED',
      etaMinutes: 20,
      notes: 'On my way via freeway'
    });

    assert.strictEqual(response.status, 'ACCEPTED');
    assert.strictEqual(response.donorId, donor.donorId);
    assert.strictEqual(response.etaMinutes, 20);

    const recorded = await getResponsesForRequest(req.requestId);
    assert.strictEqual(recorded.length, 1);
    assert.strictEqual(recorded[0].donorName, 'Marcus Vance');
  });

  it('should fulfill a blood request', async () => {
    const donor = await registerDonor({
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      phone: '+1 (555) 234-5601',
      bloodType: 'O-',
      city: 'San Francisco, CA'
    });

    const req = await createBloodRequest({
      requesterName: 'Dr. Vance',
      hospitalName: 'SF Trauma',
      bloodType: 'O-',
      contactPhone: '+1 (555) 123-4567',
      city: 'San Francisco, CA'
    });

    const fulfilled = await fulfillBloodRequest(req.requestId, donor.donorId);
    assert.strictEqual(fulfilled.status, 'FULFILLED');
    assert.strictEqual(fulfilled.fulfilledBy, donor.donorId);
  });
});
