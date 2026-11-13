import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  requireAuth,
  requireRole,
  requireHospitalStaff,
  verifyDonorAuthorization
} from '../src/middleware/authMiddleware.js';
import {
  sanitizePublicBloodRequest,
  sanitizePublicDonorResponse,
  sanitizeDonorForMatch
} from '../src/models/entities.js';

describe('Server-Side Route Authorization & Privacy Protection', () => {
  describe('Hospital Authorization & Cross-Tenant Isolation', () => {
    it('should throw UnauthorizedError when request context lacks authorizer claims', () => {
      const event = { requestContext: {} };
      assert.throws(
        () => requireHospitalStaff(event),
        (err) => err.name === 'UnauthorizedError'
      );
    });

    it('should throw ForbiddenError when user has DONOR role instead of HOSPITAL_STAFF', () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: 'donor-user-123',
              'custom:userRole': 'DONOR'
            }
          }
        }
      };
      assert.throws(
        () => requireHospitalStaff(event),
        (err) => err.name === 'ForbiddenError' && err.message.includes('Hospital authorization required')
      );
    });

    it('should allow HOSPITAL_STAFF when target facility matches their assigned hospital', () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: 'doctor-456',
              'custom:userRole': 'HOSPITAL_STAFF',
              'custom:hospitalId': 'sf-general-trauma'
            }
          }
        }
      };
      const user = requireHospitalStaff(event, 'sf-general-trauma');
      assert.equal(user.hospitalId, 'sf-general-trauma');
      assert.equal(user.role, 'HOSPITAL_STAFF');
    });

    it('should block cross-tenant hospital manipulation when facility does not match', () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: 'doctor-456',
              'custom:userRole': 'HOSPITAL_STAFF',
              'custom:hospitalId': 'hospital-A'
            }
          }
        }
      };
      assert.throws(
        () => requireHospitalStaff(event, 'hospital-B'),
        (err) => err.name === 'ForbiddenError' && err.message.includes('not authorized for facility')
      );
    });

    it('should allow global ADMIN to access any facility', () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: 'admin-super',
              'custom:userRole': 'ADMIN'
            }
          }
        }
      };
      const user = requireHospitalStaff(event, 'any-hospital-facility');
      assert.equal(user.role, 'ADMIN');
    });
  });

  describe('Donor Verification Security', () => {
    const donorRecord = {
      donorId: 'd-101',
      name: 'Samantha Ray',
      verificationToken: 'secret-token-uuid-1234'
    };

    it('should verify donor using matching x-donor-token header', () => {
      const event = {
        headers: { 'x-donor-token': 'secret-token-uuid-1234' }
      };
      const result = verifyDonorAuthorization(event, 'd-101', donorRecord);
      assert.equal(result.verified, true);
      assert.equal(result.method, 'DONOR_VERIFICATION_TOKEN');
    });

    it('should verify donor using matching body verificationToken', () => {
      const event = {
        body: JSON.stringify({ verificationToken: 'secret-token-uuid-1234' })
      };
      const result = verifyDonorAuthorization(event, 'd-101', donorRecord);
      assert.equal(result.verified, true);
    });

    it('should reject unauthenticated and unverified response attempts with ForbiddenError', () => {
      const event = { headers: {}, body: JSON.stringify({ donorId: 'd-101' }) };
      assert.throws(
        () => verifyDonorAuthorization(event, 'd-101', donorRecord),
        (err) => err.name === 'ForbiddenError' && err.message.includes('Donor authorization failed')
      );
    });

    it('should reject forged tokens with ForbiddenError', () => {
      const event = {
        headers: { 'x-donor-token': 'wrong-attacker-token' }
      };
      assert.throws(
        () => verifyDonorAuthorization(event, 'd-101', donorRecord),
        (err) => err.name === 'ForbiddenError'
      );
    });
  });

  describe('Data Privacy and Information Masking', () => {
    it('sanitizePublicBloodRequest should never expose internal DynamoDB partition keys or private data', () => {
      const rawRequest = {
        PK: 'REQUEST#req-999',
        SK: 'DETAILS',
        GSI1PK: 'BLOOD#O-',
        GSI1SK: 'STATUS#PENDING',
        requestId: 'req-999',
        hospitalName: 'Childrens Hospital',
        city: 'Oakland, CA',
        bloodType: 'O-',
        unitsNeeded: 2,
        urgencyLevel: 'CRITICAL',
        contactPhone: '+1 (555) 333-4444',
        status: 'PENDING',
        responsesCount: 1,
        createdAt: '2026-11-12T10:00:00Z',
        internalAuditLog: 'secret-audit-notes'
      };

      const sanitized = sanitizePublicBloodRequest(rawRequest);
      assert.equal(sanitized.requestId, 'req-999');
      assert.equal(sanitized.hospitalName, 'Childrens Hospital');
      assert.equal(sanitized.PK, undefined);
      assert.equal(sanitized.SK, undefined);
      assert.equal(sanitized.GSI1PK, undefined);
      assert.equal(sanitized.internalAuditLog, undefined);
    });

    it('sanitizePublicDonorResponse should mask personal names and strictly omit phone, email, coordinates', () => {
      const rawResponse = {
        requestId: 'req-999',
        donorId: 'd-555',
        donorName: 'Alexander Hamilton',
        phone: '+1 (555) 999-0000',
        email: 'alexander@example.com',
        latitude: 37.7749,
        longitude: -122.4194,
        bloodType: 'A+',
        status: 'ACCEPTED',
        etaMinutes: 15,
        notes: 'Driving down',
        createdAt: '2026-11-12T10:05:00Z'
      };

      const sanitized = sanitizePublicDonorResponse(rawResponse);
      assert.equal(sanitized.displayName, 'Alexander H.');
      assert.equal(sanitized.phone, undefined);
      assert.equal(sanitized.email, undefined);
      assert.equal(sanitized.latitude, undefined);
      assert.equal(sanitized.longitude, undefined);
      assert.equal(sanitized.etaMinutes, 15);
      assert.equal(sanitized.status, 'ACCEPTED');
    });

    it('sanitizeDonorForMatch should protect donor email, phone, and exact coordinates from matching lists', () => {
      const fullDonor = {
        donorId: 'd-777',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        phone: '+1 (555) 888-1234',
        bloodType: 'O-',
        city: 'San Francisco, CA',
        location: { latitude: 37.78, longitude: -122.41 },
        isAvailable: true
      };

      const match = sanitizeDonorForMatch(fullDonor, 12.5, true, 88);
      assert.equal(match.displayName, 'Grace H.');
      assert.equal(match.city, 'San Francisco, CA');
      assert.equal(match.distanceKm, 12.5);
      assert.equal(match.email, undefined);
      assert.equal(match.phone, undefined);
      assert.equal(match.location, undefined);
    });
  });
});

