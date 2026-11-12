/**
 * SmartBlood - Cognito Authentication Context Middleware
 * Extracts authenticated claims from API Gateway request context.
 */

export const getAuthUser = (event) => {
  const claims = event?.requestContext?.authorizer?.claims;
  if (!claims) {
    return null;
  }

  return {
    userId: claims.sub,
    email: claims.email,
    role: claims['custom:userRole'] || 'DONOR',
    bloodType: claims['custom:bloodType'] || null
  };
};

export const requireAuth = (event) => {
  const user = getAuthUser(event);
  if (!user || !user.userId) {
    const error = new Error('Authentication required');
    error.name = 'UnauthorizedError';
    throw error;
  }
  return user;
};

