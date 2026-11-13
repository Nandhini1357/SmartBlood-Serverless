import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { verifyDonorAuthorization } from '../../middleware/authMiddleware.js';
import { recordDonorResponse } from '../../services/requestService.js';
import { getDonorById } from '../../services/donorService.js';
import { sanitizePublicDonorResponse } from '../../models/entities.js';
import { created, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const requestId = event.pathParameters?.requestId;
  if (!requestId) {
    return badRequest('requestId path parameter is required');
  }

  const body = parseBody(event);
  requireFields(body, ['donorId', 'status']);

  // Fetch full donor record to verify authorization
  const donor = await getDonorById(body.donorId, false);

  // Enforce donor authorization (via Cognito claims or verification token)
  verifyDonorAuthorization(event, body.donorId, donor);

  const response = await recordDonorResponse(requestId, body);
  return created(sanitizePublicDonorResponse(response), 'Donor response recorded successfully');
});
