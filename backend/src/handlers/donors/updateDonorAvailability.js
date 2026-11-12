import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { updateAvailability } from '../../services/donorService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const donorId = event.pathParameters?.donorId;
  if (!donorId) {
    return badRequest('donorId path parameter is required');
  }

  const body = parseBody(event);
  requireFields(body, ['isAvailable']);

  const updated = await updateAvailability(donorId, body.isAvailable);
  return success(updated, 200, 'Availability updated successfully');
});

