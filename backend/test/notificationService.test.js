import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  broadcastEmergencyAlert,
  getDispatchedAlerts,
  clearDispatchedAlerts
} from '../src/services/notificationService.js';

describe('Secure Notification Service (Amazon SNS)', () => {
  beforeEach(() => {
    clearDispatchedAlerts();
  });

  it('should safely simulate SNS alert in test mode without calling real AWS services', async () => {
    const alertData = {
      requestId: 'req-test-999',
      bloodType: 'O-',
      unitsNeeded: 4,
      hospitalName: 'Trauma One',
      city: 'San Francisco, CA',
      urgencyLevel: 'CRITICAL',
      contactPhone: '+1 (555) 999-8888'
    };

    const result = await broadcastEmergencyAlert(alertData);
    assert.strictEqual(result.simulated, true);
    assert.ok(result.messageId.startsWith('sim-sns-'));

    const alerts = getDispatchedAlerts();
    assert.strictEqual(alerts.length, 1);
    assert.strictEqual(alerts[0].alert.requestId, 'req-test-999');
    assert.strictEqual(alerts[0].alert.bloodType, 'O-');
    assert.strictEqual(alerts[0].alert.urgencyLevel, 'CRITICAL');
  });

  it('should maintain an accurate dispatch audit trail in memory', async () => {
    await broadcastEmergencyAlert({
      requestId: 'req-1',
      bloodType: 'A+',
      unitsNeeded: 1,
      hospitalName: 'Hosp 1',
      city: 'City 1',
      urgencyLevel: 'URGENT',
      contactPhone: '+1 (555) 111-1111'
    });

    await broadcastEmergencyAlert({
      requestId: 'req-2',
      bloodType: 'B-',
      unitsNeeded: 2,
      hospitalName: 'Hosp 2',
      city: 'City 2',
      urgencyLevel: 'CRITICAL',
      contactPhone: '+1 (555) 222-2222'
    });

    const alerts = getDispatchedAlerts();
    assert.strictEqual(alerts.length, 2);
    assert.strictEqual(alerts[0].alert.bloodType, 'A+');
    assert.strictEqual(alerts[1].alert.bloodType, 'B-');
  });
});
