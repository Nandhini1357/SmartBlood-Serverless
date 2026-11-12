import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  registerDonor,
  getDonorById,
  updateAvailability,
  getAvailableDonorsByBloodType
} from '../src/services/donorService.js';
import { clearStore } from '../src/repositories/dynamoRepository.js';

describe('Donor Business Service', () => {
  beforeEach(() => {
    clearStore();
  });

  it('should successfully register a donor with validated fields and unique ID', async () => {
    const payload = {
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      phone: '+1 (555) 234-5601',
      bloodType: 'O-',
      city: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194
    };

    const registered = await registerDonor(payload);
    assert.ok(registered.donorId, 'donorId should be generated');
    assert.strictEqual(registered.name, 'Marcus Vance');
    assert.strictEqual(registered.bloodType, 'O-');
    assert.strictEqual(registered.isAvailable, true);

    // Ensure DynamoDB internal keys (PK, SK) are omitted in sanitized profile
    assert.strictEqual(registered.PK, undefined);
    assert.strictEqual(registered.SK, undefined);
  });

  it('should reject registration with invalid blood type', async () => {
    const invalidPayload = {
      name: 'Invalid Donor',
      email: 'invalid@example.com',
      phone: '+1 (555) 000-0000',
      bloodType: 'Z+',
      city: 'Nowhere'
    };

    await assert.rejects(
      async () => await registerDonor(invalidPayload),
      (err) => err.name === 'ValidationError'
    );
  });

  it('should retrieve registered donor by donorId', async () => {
    const registered = await registerDonor({
      name: 'Elena Rostova',
      email: 'elena@example.com',
      phone: '+1 (555) 234-5602',
      bloodType: 'O+',
      city: 'Oakland, CA'
    });

    const retrieved = await getDonorById(registered.donorId);
    assert.strictEqual(retrieved.donorId, registered.donorId);
    assert.strictEqual(retrieved.name, 'Elena Rostova');
  });

  it('should throw NotFoundError when donor does not exist', async () => {
    await assert.rejects(
      async () => await getDonorById('non-existent-id'),
      (err) => err.name === 'NotFoundError'
    );
  });

  it('should update donor availability status to false and back to true', async () => {
    const registered = await registerDonor({
      name: 'Derrick Hayes',
      email: 'derrick@example.com',
      phone: '+1 (555) 234-5603',
      bloodType: 'A+',
      city: 'Berkeley, CA'
    });

    // Set to unavailable
    const updatedUnavailable = await updateAvailability(registered.donorId, false);
    assert.strictEqual(updatedUnavailable.isAvailable, false);

    // Verify it is excluded from available query
    let available = await getAvailableDonorsByBloodType('A+');
    assert.strictEqual(available.length, 0);

    // Set back to available
    const updatedAvailable = await updateAvailability(registered.donorId, true);
    assert.strictEqual(updatedAvailable.isAvailable, true);

    available = await getAvailableDonorsByBloodType('A+');
    assert.strictEqual(available.length, 1);
  });
});
