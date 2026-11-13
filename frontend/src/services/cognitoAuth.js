/**
 * SmartBlood - Native Amazon Cognito User Pool Authentication Client
 * Lightweight, zero-dependency client communicating with Cognito Identity Provider
 * in ap-southeast-2 using standard AWS JSON 1.1 protocol.
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const COGNITO_REGION = env?.VITE_COGNITO_REGION || 'ap-southeast-2';
const COGNITO_CLIENT_ID = env?.VITE_COGNITO_CLIENT_ID || '43earif6d8ojmf8ise70iu7q0';
const COGNITO_ENDPOINT = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;

const SESSION_KEY = 'smartblood_cognito_session';

/**
 * Parses JWT token payload without external libraries.
 */
export const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Standard fetch wrapper for AWS Cognito JSON 1.1 API.
 */
const cognitoRequest = async (action, payload) => {
  const res = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errType = data.__type || data.code || 'CognitoError';
    const message = data.message || `Cognito operation failed (${res.status})`;
    const error = new Error(message);
    error.code = errType.split('#').pop(); // Remove namespace prefix if present
    throw error;
  }

  return data;
};

// In-memory token cache to minimize sessionStorage reads
let inMemoryAuth = null;

export const cognitoAuth = {
  /**
   * Restores authenticated session from sessionStorage on app mount.
   */
  getSession() {
    if (inMemoryAuth) {
      if (inMemoryAuth.expiresAt && Date.now() < inMemoryAuth.expiresAt) {
        return inMemoryAuth;
      }
    }

    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!parsed.idToken || !parsed.expiresAt) return null;

      // Check if session has expired
      if (Date.now() >= parsed.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        inMemoryAuth = null;
        return null;
      }

      inMemoryAuth = parsed;
      return parsed;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves active IdToken for Authorization header.
   */
  async getIdToken() {
    const session = this.getSession();
    if (!session) return null;

    // If within 5 minutes of expiration and refreshToken is available, refresh token
    if (session.refreshToken && session.expiresAt - Date.now() < 300000) {
      try {
        const refreshed = await this.refreshToken(session.refreshToken);
        return refreshed.idToken;
      } catch {
        // If refresh fails, fall back to current token if still valid
        return session.idToken;
      }
    }

    return session.idToken;
  },

  /**
   * Sign In with Email & Password using USER_PASSWORD_AUTH.
   */
  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const result = await cognitoRequest('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email.trim(),
        PASSWORD: password
      }
    });

    const authResult = result.AuthenticationResult;
    if (!authResult || !authResult.IdToken) {
      throw new Error('Cognito authentication failed to return token');
    }

    const payload = parseJwtPayload(authResult.IdToken);
    const userRole = (payload?.['custom:userRole'] || payload?.['userRole'] || 'HOSPITAL_STAFF').toUpperCase();
    const hospitalId = payload?.['custom:hospitalId'] || payload?.['hospitalId'] || 'main-hospital';

    const sessionData = {
      idToken: authResult.IdToken,
      accessToken: authResult.AccessToken,
      refreshToken: authResult.RefreshToken || null,
      expiresAt: Date.now() + (authResult.ExpiresIn || 3600) * 1000,
      user: {
        userId: payload?.sub,
        email: payload?.email || email.trim(),
        role: userRole,
        hospitalId,
        facilityName: payload?.['custom:facilityName'] || hospitalId
      }
    };

    // Store in memory and sessionStorage
    inMemoryAuth = sessionData;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

    return sessionData.user;
  },

  /**
   * Register a new hospital staff or admin account.
   */
  async signUp(email, password, options = {}) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const userRole = options.userRole || 'HOSPITAL_STAFF';
    const hospitalId = options.hospitalId || 'aiims-delhi';

    const attributes = [
      { Name: 'email', Value: email.trim() },
      { Name: 'custom:userRole', Value: userRole },
      { Name: 'custom:hospitalId', Value: hospitalId }
    ];

    if (options.facilityName) {
      attributes.push({ Name: 'custom:facilityName', Value: options.facilityName.trim() });
    }

    const result = await cognitoRequest('SignUp', {
      ClientId: COGNITO_CLIENT_ID,
      Username: email.trim(),
      Password: password,
      UserAttributes: attributes
    });

    return {
      userSub: result.UserSub,
      userConfirmed: result.UserConfirmed
    };
  },

  /**
   * Confirm sign-up with email verification code.
   */
  async confirmSignUp(email, code) {
    if (!email || !code) {
      throw new Error('Email and confirmation code are required');
    }

    return await cognitoRequest('ConfirmSignUp', {
      ClientId: COGNITO_CLIENT_ID,
      Username: email.trim(),
      ConfirmationCode: code.trim()
    });
  },

  /**
   * Refresh token using REFRESH_TOKEN_AUTH.
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) throw new Error('Refresh token missing');

    const result = await cognitoRequest('InitiateAuth', {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    });

    const authResult = result.AuthenticationResult;
    const currentSession = this.getSession() || {};

    const updatedSession = {
      ...currentSession,
      idToken: authResult.IdToken,
      accessToken: authResult.AccessToken,
      expiresAt: Date.now() + (authResult.ExpiresIn || 3600) * 1000
    };

    inMemoryAuth = updatedSession;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));

    return updatedSession;
  },

  /**
   * Sign out: Clears session and memory cache.
   */
  signOut() {
    inMemoryAuth = null;
    sessionStorage.removeItem(SESSION_KEY);
  }
};
