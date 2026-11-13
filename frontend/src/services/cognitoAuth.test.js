import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { parseJwtPayload, cognitoAuth } from './cognitoAuth.js';

// Mock browser global environment if running in Node test runner
if (typeof globalThis.sessionStorage === 'undefined') {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

describe('Amazon Cognito User Pool Client (Frontend)', () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear();
    cognitoAuth.signOut();
  });

  describe('JWT Payload Parsing', () => {
    it('should return null for null, empty or invalid tokens', () => {
      assert.strictEqual(parseJwtPayload(null), null);
      assert.strictEqual(parseJwtPayload(''), null);
      assert.strictEqual(parseJwtPayload('invalid-token-string'), null);
    });

    it('should accurately parse standard JWT claims', () => {
      // Base64URL encoded payload: {"sub":"user-123","email":"dr.adams@sfgeneral.org","custom:userRole":"HOSPITAL_STAFF","custom:hospitalId":"sf-general"}
      const payloadObj = {
        sub: 'user-123',
        email: 'dr.adams@sfgeneral.org',
        'custom:userRole': 'HOSPITAL_STAFF',
        'custom:hospitalId': 'sf-general'
      };
      const base64UrlPayload = Buffer.from(JSON.stringify(payloadObj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64UrlPayload}.mockSignature`;

      const parsed = parseJwtPayload(fakeJwt);
      assert.ok(parsed);
      assert.strictEqual(parsed.sub, 'user-123');
      assert.strictEqual(parsed.email, 'dr.adams@sfgeneral.org');
      assert.strictEqual(parsed['custom:userRole'], 'HOSPITAL_STAFF');
      assert.strictEqual(parsed['custom:hospitalId'], 'sf-general');
    });
  });

  describe('Session Storage & Token Management', () => {
    it('should return null when no session is present', () => {
      assert.strictEqual(cognitoAuth.getSession(), null);
    });

    it('should reject expired stored sessions', () => {
      const expiredSession = {
        idToken: 'expired-token',
        expiresAt: Date.now() - 10000,
        user: { email: 'staff@sfgeneral.org', role: 'HOSPITAL_STAFF' }
      };
      globalThis.sessionStorage.setItem('smartblood_cognito_session', JSON.stringify(expiredSession));

      const session = cognitoAuth.getSession();
      assert.strictEqual(session, null);
      assert.strictEqual(globalThis.sessionStorage.getItem('smartblood_cognito_session'), null);
    });

    it('should restore valid, unexpired sessions', () => {
      const validSession = {
        idToken: 'valid-id-token-xyz',
        refreshToken: 'valid-refresh-token',
        expiresAt: Date.now() + 3600000,
        user: { email: 'staff@sfgeneral.org', role: 'HOSPITAL_STAFF', hospitalId: 'sf-general' }
      };
      globalThis.sessionStorage.setItem('smartblood_cognito_session', JSON.stringify(validSession));

      const session = cognitoAuth.getSession();
      assert.ok(session);
      assert.strictEqual(session.idToken, 'valid-id-token-xyz');
      assert.strictEqual(session.user.email, 'staff@sfgeneral.org');
    });

    it('should clear session upon signOut', () => {
      const validSession = {
        idToken: 'valid-id-token-xyz',
        expiresAt: Date.now() + 3600000,
        user: { email: 'staff@sfgeneral.org' }
      };
      globalThis.sessionStorage.setItem('smartblood_cognito_session', JSON.stringify(validSession));

      cognitoAuth.signOut();
      assert.strictEqual(cognitoAuth.getSession(), null);
      assert.strictEqual(globalThis.sessionStorage.getItem('smartblood_cognito_session'), null);
    });
  });
});

