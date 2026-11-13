/**
 * SmartBlood - Cognito Authentication & Role-Based Authorization Middleware
 * Extracts authenticated claims from API Gateway request context and enforces
 * strict role-based and facility-level access controls.
 */

export const getAuthUser = (event) => {
  const claims = event?.requestContext?.authorizer?.claims;
  if (!claims) {
    return null;
  }

  return {
    userId: claims.sub,
    email: claims.email,
    role: (claims['custom:userRole'] || claims['userRole'] || 'DONOR').toUpperCase(),
    hospitalId: claims['custom:hospitalId'] || claims['hospitalId'] || null,
    bankId: claims['custom:bankId'] || claims['bankId'] || null,
    bloodType: claims['custom:bloodType'] || null
  };
};

export const requireAuth = (event) => {
  const user = getAuthUser(event);
  if (!user || !user.userId) {
    const error = new Error('Authentication required: Missing or invalid authorization token');
    error.name = 'UnauthorizedError';
    throw error;
  }
  return user;
};

export const requireRole = (event, allowedRoles = []) => {
  const user = requireAuth(event);
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  if (!normalizedAllowed.includes(user.role)) {
    const error = new Error(`Forbidden: Role '${user.role}' is not authorized for this action`);
    error.name = 'ForbiddenError';
    throw error;
  }
  return user;
};

/**
 * Enforces hospital/blood bank authorization server-side.
 * Prevents cross-tenant hospital manipulation (Hospital A cannot alter Hospital B).
 */
export const requireHospitalStaff = (event, targetFacilityId = null) => {
  const user = requireAuth(event);
  const hospitalRoles = ['HOSPITAL_STAFF', 'BLOOD_BANK_MANAGER', 'ADMIN'];

  if (!hospitalRoles.includes(user.role)) {
    const error = new Error(`Forbidden: Hospital authorization required. Role '${user.role}' is not permitted.`);
    error.name = 'ForbiddenError';
    throw error;
  }

  // Cross-tenant tenant isolation:
  // If targetFacilityId is specified and the user is not a global ADMIN,
  // verify user's assigned facility ID matches target.
  if (targetFacilityId && user.role !== 'ADMIN') {
    const userFacility = user.hospitalId || user.bankId;
    if (userFacility && userFacility !== targetFacilityId) {
      const error = new Error(
        `Forbidden: Access denied. Your credentials (${userFacility}) are not authorized for facility '${targetFacilityId}'.`
      );
      error.name = 'ForbiddenError';
      throw error;
    }
  }

  return user;
};

/**
 * Verifies that an action regarding a donor is performed by the donor themselves
 * (via Cognito claims or valid verification token) or by authorized hospital personnel.
 */
export const verifyDonorAuthorization = (event, donorId, donorRecord) => {
  const authUser = getAuthUser(event);

  // 1. Authorized via Cognito as the donor themselves
  if (authUser && authUser.userId === donorId) {
    return { verified: true, method: 'COGNITO_USER', user: authUser };
  }

  // 2. Authorized as hospital staff or admin
  if (authUser && ['HOSPITAL_STAFF', 'ADMIN'].includes(authUser.role)) {
    return { verified: true, method: 'HOSPITAL_STAFF', user: authUser };
  }

  // 3. Authorized via secure donor verification token (header or body)
  const tokenHeader =
    event.headers?.['x-donor-token'] ||
    event.headers?.['X-Donor-Token'] ||
    event.headers?.['x-verification-token'] ||
    event.headers?.['X-Verification-Token'];

  let tokenFromBody = null;
  if (event.body) {
    try {
      const parsed = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      tokenFromBody = parsed.verificationToken || parsed.donorToken;
    } catch {
      // Ignore body parse errors here, validator handles payload syntax
    }
  }

  const providedToken = tokenHeader || tokenFromBody;

  if (donorRecord && donorRecord.verificationToken && providedToken) {
    if (providedToken.trim() === donorRecord.verificationToken.trim()) {
      return { verified: true, method: 'DONOR_VERIFICATION_TOKEN' };
    }
  }

  const error = new Error(
    'Forbidden: Donor authorization failed. You can only respond or modify records for your own verified donor account.'
  );
  error.name = 'ForbiddenError';
  throw error;
};

