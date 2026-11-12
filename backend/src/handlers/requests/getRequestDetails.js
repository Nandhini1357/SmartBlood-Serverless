import { withErrorHandler } from '../../middleware/errorHandler.js';
import { getBloodRequestById, getResponsesForRequest } from '../../services/requestService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const requestId = event.pathParameters?.requestId;
  if (!requestId) {
    return badRequest('requestId path parameter is required');
  }

  const request = await getBloodRequestById(requestId);
  const responses = await getResponsesForRequest(requestId);

  return success({
    ...request,
    responses
  });
});
