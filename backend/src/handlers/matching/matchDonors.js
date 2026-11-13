import { withErrorHandler } from '../../middleware/errorHandler.js';
import { requireHospitalStaff } from '../../middleware/authMiddleware.js';
import { findMatchesForRequest } from '../../services/matchingService.js';
import { getBloodRequestById } from '../../services/requestService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  // Enforce hospital staff role
  const authUser = requireHospitalStaff(event);

  const requestId = event.pathParameters?.requestId;
  if (!requestId) {
    return badRequest('requestId path parameter is required');
  }

  const bloodRequest = await getBloodRequestById(requestId);

  // Cross-tenant hospital check:
  // If blood request is associated with a hospital, non-admin staff can only view matches for their hospital
  if (bloodRequest.hospitalId && authUser.role !== 'ADMIN') {
    const userOrg = authUser.hospitalId || authUser.userId;
    if (userOrg && userOrg !== bloodRequest.hospitalId) {
      const err = new Error(
        `Forbidden: Access denied. You cannot inspect matched donors for requests issued by another hospital facility (${bloodRequest.hospitalId}).`
      );
      err.name = 'ForbiddenError';
      throw err;
    }
  }

  const radiusKm = event.queryStringParameters?.radius
    ? Number(event.queryStringParameters.radius)
    : 50;

  const matchResults = await findMatchesForRequest(requestId, radiusKm);
  return success(matchResults);
});

