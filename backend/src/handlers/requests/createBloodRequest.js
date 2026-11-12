import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { createBloodRequest } from '../../services/requestService.js';
import { created } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const body = parseBody(event);
  requireFields(body, ['requesterName', 'hospitalName', 'bloodType', 'city', 'contactPhone']);

  const request = await createBloodRequest(body);
  return created(request, 'Emergency blood request published successfully');
});

