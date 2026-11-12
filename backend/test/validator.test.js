import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateEmail,
  validatePhone,
  validateBloodTypeInput,
  validateUrgencyLevel,
  validateUnits,
  validateCoordinates,
  validateDonorRegistration,
  validateBloodRequestInput,
  validateDonorResponseInput
} from '../src/middleware/validator.js';

describe('Input Validation & Sanitization', () => {
  describe('Email validation', () => {
    it('should accept valid email formats', () => {
      assert.strictEqual(validateEmail('test@hospital.org'), 'test@hospital.org');
      assert.strictEqual(validateEmail('  USER@Domain.COM '), 'user@domain.com');
    });

    it('should reject invalid email formats', () => {
      assert.throws(() => validateEmail('invalid-email'), /Invalid email/);
      assert.throws(() => validateEmail('test@'), /Invalid email/);
      assert.throws(() => validateEmail(''), /Invalid email/);
    });
  });

  describe('Phone validation', () => {
    it('should accept valid international and US phone formats', () => {
      assert.strictEqual(validatePhone('+1 (555) 234-5678'), '+1 (555) 234-5678');
      assert.strictEqual(validatePhone('+15552345678'), '+15552345678');
    });

    it('should reject invalid phone numbers', () => {
      assert.throws(() => validatePhone('abc'), /Invalid phone/);
      assert.throws(() => validatePhone(''), /Invalid phone/);
    });
  });

  describe('Blood type & Urgency validation', () => {
    it('should validate and normalize blood types', () => {
      assert.strictEqual(validateBloodTypeInput('o-'), 'O-');
      assert.strictEqual(validateBloodTypeInput(' AB+ '), 'AB+');
      assert.throws(() => validateBloodTypeInput('X+'), /Invalid blood type/);
    });

    it('should validate urgency levels', () => {
      assert.strictEqual(validateUrgencyLevel('critical'), 'CRITICAL');
      assert.strictEqual(validateUrgencyLevel('urgent'), 'URGENT');
      assert.strictEqual(validateUrgencyLevel('normal'), 'NORMAL');
      assert.throws(() => validateUrgencyLevel('LOW'), /Invalid urgency/);
    });
  });

  describe('Units needed & Coordinates', () => {
    it('should validate unit quantities between 1 and 50', () => {
      assert.strictEqual(validateUnits(1), 1);
      assert.strictEqual(validateUnits('5'), 5);
      assert.throws(() => validateUnits(0), /Units needed must be a number/);
      assert.throws(() => validateUnits(51), /Units needed must be a number/);
      assert.throws(() => validateUnits('abc'), /Units needed must be a number/);
    });

    it('should validate GPS coordinates', () => {
      const coords = validateCoordinates(37.7749, -122.4194);
      assert.strictEqual(coords.latitude, 37.7749);
      assert.strictEqual(coords.longitude, -122.4194);

      assert.throws(() => validateCoordinates(95, 0), /Invalid latitude/);
      assert.throws(() => validateCoordinates(0, 190), /Invalid longitude/);
    });
  });

  describe('Composite Schemas', () => {
    it('should validate complete donor registration payload', () => {
      const donor = validateDonorRegistration({
        name: ' John Doe ',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        bloodType: 'O-',
        city: 'San Francisco, CA',
        latitude: 37.77,
        longitude: -122.41
      });
      assert.strictEqual(donor.name, 'John Doe');
      assert.strictEqual(donor.bloodType, 'O-');
      assert.strictEqual(donor.isAvailable, true);
    });

    it('should validate donor response payload', () => {
      const res = validateDonorResponseInput({
        donorId: 'd-123',
        status: 'ACCEPTED',
        etaMinutes: 30
      });
      assert.strictEqual(res.donorId, 'd-123');
      assert.strictEqual(res.status, 'ACCEPTED');
      assert.strictEqual(res.etaMinutes, 30);
    });
  });
});
