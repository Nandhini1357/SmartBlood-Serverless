import { withErrorHandler } from '../../middleware/errorHandler.js';
import { getBloodRequestById, getResponsesForRequest } from '../../services/requestService.js';
import { sanitizePublicBloodRequest, sanitizePublicDonorResponse } from '../../models/entities.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const requestId = event.pathParameters?.requestId;
  if (!requestId) {
    return badRequest('requestId path parameter is required');
  }

  const request = await getBloodRequestById(requestId);
  const responses = await getResponsesForRequest(requestId);

  // Return public sanitized emergency request and responses
  // Masking donor personal names and never exposing phone/email/exact coordinates
  return success({
    ...sanitizePublicBloodRequest(request),
    responses: responses.map(sanitizePublicDonorResponse)
  });
});
