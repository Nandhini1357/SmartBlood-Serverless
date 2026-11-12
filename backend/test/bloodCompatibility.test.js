import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getCompatibleDonorBloodTypes,
  isValidBloodType,
  VALID_BLOOD_TYPES
} from '../src/utils/bloodCompatibility.js';

describe('Medical Blood Compatibility Matrix', () => {
  it('should recognize all 8 valid human blood types', () => {
    assert.strictEqual(VALID_BLOOD_TYPES.length, 8);
    for (const b of ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']) {
      assert.strictEqual(isValidBloodType(b), true);
      assert.strictEqual(isValidBloodType(b.toLowerCase()), true);
    }
  });

  it('should reject invalid blood types', () => {
    assert.strictEqual(isValidBloodType('C+'), false);
    assert.strictEqual(isValidBloodType('O'), false);
    assert.strictEqual(isValidBloodType(''), false);
    assert.strictEqual(isValidBloodType(null), false);
    assert.strictEqual(isValidBloodType(undefined), false);
  });

  it('O- recipient can ONLY receive O- blood (strictly exclusive)', () => {
    const donors = getCompatibleDonorBloodTypes('O-');
    assert.deepStrictEqual(donors, ['O-']);
  });

  it('O+ recipient can receive O- and O+', () => {
    const donors = getCompatibleDonorBloodTypes('O+');
    assert.deepStrictEqual(donors, ['O-', 'O+']);
  });

  it('A- recipient can receive O- and A-', () => {
    const donors = getCompatibleDonorBloodTypes('A-');
    assert.deepStrictEqual(donors, ['O-', 'A-']);
  });

  it('A+ recipient can receive O-, O+, A-, A+', () => {
    const donors = getCompatibleDonorBloodTypes('A+');
    assert.deepStrictEqual(donors, ['O-', 'O+', 'A-', 'A+']);
  });

  it('B- recipient can receive O- and B-', () => {
    const donors = getCompatibleDonorBloodTypes('B-');
    assert.deepStrictEqual(donors, ['O-', 'B-']);
  });

  it('B+ recipient can receive O-, O+, B-, B+', () => {
    const donors = getCompatibleDonorBloodTypes('B+');
    assert.deepStrictEqual(donors, ['O-', 'O+', 'B-', 'B+']);
  });

  it('AB- recipient can receive O-, A-, B-, AB-', () => {
    const donors = getCompatibleDonorBloodTypes('AB-');
    assert.deepStrictEqual(donors, ['O-', 'A-', 'B-', 'AB-']);
  });

  it('AB+ is the universal recipient (can receive all 8 types)', () => {
    const donors = getCompatibleDonorBloodTypes('AB+');
    assert.strictEqual(donors.length, 8);
    assert.deepStrictEqual(donors, ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']);
  });
});
