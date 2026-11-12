import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { recordDonorResponse } from '../../services/requestService.js';
import { created, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const requestId = event.pathParameters?.requestId;
  if (!requestId) {
    return badRequest('requestId path parameter is required');
  }

  const body = parseBody(event);
  requireFields(body, ['donorId', 'status']);

  const response = await recordDonorResponse(requestId, body);
  return created(response, 'Donor response recorded successfully');
});
