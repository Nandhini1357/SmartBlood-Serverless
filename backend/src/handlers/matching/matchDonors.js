import { withErrorHandler } from '../../middleware/errorHandler.js';
import { findMatchesForRequest } from '../../services/matchingService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const requestId = event.pathParameters?.requestId;
  if (!requestId) {
    return badRequest('requestId path parameter is required');
  }

  const radiusKm = event.queryStringParameters?.radius
    ? Number(event.queryStringParameters.radius)
    : 50;

  const matchResults = await findMatchesForRequest(requestId, radiusKm);
  return success(matchResults);
});
