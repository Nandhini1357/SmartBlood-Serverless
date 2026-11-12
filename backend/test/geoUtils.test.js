import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateDistanceKm } from '../src/utils/geoUtils.js';

describe('Geolocation & Haversine Distance Utility', () => {
  it('should return 0 km for identical coordinates', () => {
    const distance = calculateDistanceKm(37.7749, -122.4194, 37.7749, -122.4194);
    assert.strictEqual(distance, 0);
  });

  it('should calculate accurate distance between San Francisco and Oakland (~13-14 km)', () => {
    // SF: 37.7749, -122.4194 | Oakland: 37.8044, -122.2712
    const distance = calculateDistanceKm(37.7749, -122.4194, 37.8044, -122.2712);
    assert.ok(distance > 12 && distance < 15, `Expected ~13.5km, got ${distance}`);
  });

  it('should calculate accurate distance between San Francisco and San Jose (~65-70 km)', () => {
    // SF: 37.7749, -122.4194 | San Jose: 37.3382, -121.8863
    const distance = calculateDistanceKm(37.7749, -122.4194, 37.3382, -121.8863);
    assert.ok(distance > 65 && distance < 75, `Expected ~70km, got ${distance}`);
  });

  it('should be symmetric (distance A to B equals distance B to A)', () => {
    const d1 = calculateDistanceKm(37.7749, -122.4194, 37.8715, -122.2730);
    const d2 = calculateDistanceKm(37.8715, -122.2730, 37.7749, -122.4194);
    assert.strictEqual(d1, d2);
  });
});
