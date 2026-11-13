import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { clearStore } from '../src/repositories/dynamoRepository.js';
import { clearDispatchedAlerts, getDispatchedAlerts } from '../src/services/notificationService.js';

import { registerDonor, getDonorById, updateAvailability } from '../src/services/donorService.js';
import {
  createBloodRequest,
  getBloodRequestById,
  recordDonorResponse,
  getResponsesForRequest,
  fulfillBloodRequest
} from '../src/services/requestService.js';
import { findMatchesForRequest } from '../src/services/matchingService.js';
import { getBankInventory, updateBankInventory } from '../src/services/bloodBankService.js';

describe('SmartBlood Full End-to-End Workflow Verification', () => {
  beforeEach(() => {
    clearStore();
    clearDispatchedAlerts();
  });

  it('verifies complete lifecycle: Register -> Availability -> Emergency Request -> Matching -> Response & ETA -> Hospital Telemetry -> Restock & Fulfillment', async () => {
    // -------------------------------------------------------------------------
    // Step 1: Register a donor (O- Universal Donor in San Francisco)
    // -------------------------------------------------------------------------
    const donorPayload = {
      name: 'Marcus Vance',
      email: 'marcus.vance@example.org',
      phone: '+1 (555) 234-5601',
      bloodType: 'O-',
      city: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      isAvailable: true
    };

    const registeredDonor = await registerDonor(donorPayload);
    assert.ok(registeredDonor.donorId, 'Donor must receive a unique donorId');
    assert.strictEqual(registeredDonor.bloodType, 'O-');
    assert.strictEqual(registeredDonor.isAvailable, true);

    // Verify donor PII is not leaked in internal keys
    assert.strictEqual(registeredDonor.PK, undefined);
    assert.strictEqual(registeredDonor.SK, undefined);

    // -------------------------------------------------------------------------
    // Step 2: Set donor availability (Toggle off and back on)
    // -------------------------------------------------------------------------
    const paused = await updateAvailability(registeredDonor.donorId, false);
    assert.strictEqual(paused.isAvailable, false);

    const resumed = await updateAvailability(registeredDonor.donorId, true);
    assert.strictEqual(resumed.isAvailable, true);

    // -------------------------------------------------------------------------
    // Step 3: Create an emergency blood request from SF General Trauma
    // -------------------------------------------------------------------------
    const requestPayload = {
      requesterName: 'Dr. Eleanor Vance',
      hospitalName: 'San Francisco General Trauma Center',
      bloodType: 'O-',
      unitsNeeded: 2,
      urgencyLevel: 'CRITICAL',
      city: 'San Francisco, CA',
      latitude: 37.7558,
      longitude: -122.4047,
      contactPhone: '+1 (555) 890-1234'
    };

    const emergencyRequest = await createBloodRequest(requestPayload);
    assert.ok(emergencyRequest.requestId, 'Request must receive a unique requestId');
    assert.strictEqual(emergencyRequest.status, 'PENDING');
    assert.strictEqual(emergencyRequest.bloodType, 'O-');

    // Verify Amazon SNS alert was triggered safely
    const alerts = getDispatchedAlerts();
    assert.strictEqual(alerts.length, 1);
    assert.strictEqual(alerts[0].alert.requestId, emergencyRequest.requestId);
    assert.strictEqual(alerts[0].alert.bloodType, 'O-');
    assert.strictEqual(alerts[0].alert.urgencyLevel, 'CRITICAL');

    // -------------------------------------------------------------------------
    // Step 4: Find medically compatible donors using Intelligent Matcher
    // -------------------------------------------------------------------------
    const matchingResult = await findMatchesForRequest(emergencyRequest.requestId, 50);
    assert.strictEqual(matchingResult.requestedBloodType, 'O-');
    assert.strictEqual(matchingResult.totalCompatibleDonorsFound, 1);

    const matchedDonor = matchingResult.matches[0];
    assert.strictEqual(matchedDonor.donorId, registeredDonor.donorId);
    assert.strictEqual(matchedDonor.bloodType, 'O-');
    assert.strictEqual(matchedDonor.isExactMatch, true);
    assert.ok(matchedDonor.matchScore >= 90, 'Close exact match should score >= 90%');
    assert.ok(matchedDonor.distanceKm < 5, 'Distance within SF should be < 5 km');

    // Verify privacy protection: raw email & private phone must be omitted from match list
    assert.strictEqual(matchedDonor.email, undefined);
    assert.strictEqual(matchedDonor.phone, undefined);
    assert.ok(matchedDonor.displayName, 'Masked displayName should be present');

    // -------------------------------------------------------------------------
    // Step 5: Submit donor response with ETA
    // -------------------------------------------------------------------------
    const responsePayload = {
      donorId: registeredDonor.donorId,
      status: 'ACCEPTED',
      etaMinutes: 18,
      notes: 'In transit via 101-North with hazard signals'
    };

    const recordedResponse = await recordDonorResponse(emergencyRequest.requestId, responsePayload);
    assert.strictEqual(recordedResponse.status, 'ACCEPTED');
    assert.strictEqual(recordedResponse.etaMinutes, 18);
    assert.strictEqual(recordedResponse.donorId, registeredDonor.donorId);

    // -------------------------------------------------------------------------
    // Step 6: Track response in Hospital Dashboard telemetry
    // -------------------------------------------------------------------------
    const hospitalRequestView = await getBloodRequestById(emergencyRequest.requestId);
    assert.strictEqual(hospitalRequestView.responsesCount, 1);

    const responsesList = await getResponsesForRequest(emergencyRequest.requestId);
    assert.strictEqual(responsesList.length, 1);
    assert.strictEqual(responsesList[0].donorName, 'Marcus Vance');
    assert.strictEqual(responsesList[0].etaMinutes, 18);
    assert.strictEqual(responsesList[0].status, 'ACCEPTED');

    // -------------------------------------------------------------------------
    // Step 7: Update blood bank inventory and fulfill request
    // -------------------------------------------------------------------------
    // Update inventory stock
    const bankId = 'sf-general-bank';
    const inventoryUpdate = await updateBankInventory(bankId, {
      bloodType: 'O-',
      unitsAvailable: 6
    });
    assert.strictEqual(inventoryUpdate.bloodType, 'O-');
    assert.strictEqual(inventoryUpdate.unitsAvailable, 6);

    const bankInventory = await getBankInventory(bankId);
    assert.strictEqual(bankInventory.length, 1);
    assert.strictEqual(bankInventory[0].unitsAvailable, 6);

    // Mark emergency blood request as fulfilled by Marcus Vance
    const fulfilledRequest = await fulfillBloodRequest(
      emergencyRequest.requestId,
      registeredDonor.donorId
    );
    assert.strictEqual(fulfilledRequest.status, 'FULFILLED');
    assert.strictEqual(fulfilledRequest.fulfilledBy, registeredDonor.donorId);
    assert.ok(fulfilledRequest.fulfilledAt);
  });
});
