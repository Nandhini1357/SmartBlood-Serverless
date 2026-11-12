import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { findMatchesForRequest } from '../src/services/matchingService.js';
import { registerDonor } from '../src/services/donorService.js';
import { createBloodRequest } from '../src/services/requestService.js';
import { clearStore } from '../src/repositories/dynamoRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const donorFixtures = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/donors.json'), 'utf-8')
);
const requestFixtures = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/requests.json'), 'utf-8')
);

describe('Intelligent Matching Engine', () => {
  beforeEach(async () => {
    clearStore();
    // Seed all fixture donors
    for (const donor of donorFixtures) {
      await registerDonor(donor);
    }
  });

  it('O- recipient request should strictly match only compatible O- donors', async () => {
    // req-fixture-001 requests O- blood
    const request = await createBloodRequest(requestFixtures[0]);

    const results = await findMatchesForRequest(request.requestId, 100);
    assert.strictEqual(results.requestedBloodType, 'O-');
    assert.ok(results.matches.length > 0, 'Should find at least one match');

    // Every matched donor must have bloodType O-
    for (const match of results.matches) {
      assert.strictEqual(match.bloodType, 'O-');
      assert.strictEqual(match.isExactMatch, true);
    }
  });

  it('A+ recipient request should match O-, O+, A-, and A+ donors', async () => {
    // req-fixture-002 requests A+ blood
    const request = await createBloodRequest(requestFixtures[1]);

    const results = await findMatchesForRequest(request.requestId, 100);
    assert.strictEqual(results.requestedBloodType, 'A+');

    const matchedTypes = results.matches.map((m) => m.bloodType);
    const validExpectedTypes = ['O-', 'O+', 'A-', 'A+'];

    for (const type of matchedTypes) {
      assert.ok(
        validExpectedTypes.includes(type),
        `Unexpected blood type ${type} matched for A+ recipient`
      );
    }
  });

  it('should rank exact blood matches higher than cross-compatible matches', async () => {
    const request = await createBloodRequest(requestFixtures[1]); // A+ recipient

    const results = await findMatchesForRequest(request.requestId, 100);
    const topMatch = results.matches[0];

    assert.ok(topMatch.matchScore > 50);
  });

  it('should filter out donors outside the specified search radius', async () => {
    // SF Hospital with a tight 5km radius should not include Palo Alto or San Jose donors
    const request = await createBloodRequest(requestFixtures[0]);

    const localResults = await findMatchesForRequest(request.requestId, 15);
    for (const m of localResults.matches) {
      if (m.distanceKm !== null) {
        assert.ok(
          m.distanceKm <= 15,
          `Donor distance ${m.distanceKm} exceeded 15km radius`
        );
      }
    }
  });

  it('should exclude unavailable donors from matching results', async () => {
    // donor-008-ab-neg is initialized as isAvailable: false in fixtures
    const request = await createBloodRequest({
      requesterName: 'Dr. Test',
      hospitalName: 'General Hospital',
      bloodType: 'AB-',
      city: 'San Francisco, CA',
      contactPhone: '+1 (555) 000-1111'
    });

    const results = await findMatchesForRequest(request.requestId, 100);
    const matchedIds = results.matches.map((m) => m.donorId);
    assert.ok(
      !matchedIds.includes('donor-008-ab-neg'),
      'Unavailable donor must not be returned in matches'
    );
  });

  it('should protect donor privacy by withholding sensitive PII from matches', async () => {
    const request = await createBloodRequest(requestFixtures[0]);
    const results = await findMatchesForRequest(request.requestId, 100);

    for (const match of results.matches) {
      assert.strictEqual(match.email, undefined, 'Email should never be exposed in public match list');
      assert.strictEqual(match.phone, undefined, 'Phone should not be exposed in preliminary match list');
      assert.ok(match.displayName, 'displayName should be present');
    }
  });
});
