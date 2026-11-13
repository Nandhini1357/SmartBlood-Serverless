import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { verifyDonorAuthorization } from '../../middleware/authMiddleware.js';
import { getDonorById, updateAvailability } from '../../services/donorService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const donorId = event.pathParameters?.donorId;
  if (!donorId) {
    return badRequest('donorId path parameter is required');
  }

  const body = parseBody(event);
  requireFields(body, ['isAvailable']);

  // Retrieve raw donor record and verify authorization
  const donor = await getDonorById(donorId, false);
  verifyDonorAuthorization(event, donorId, donor);

  const updated = await updateAvailability(donorId, body.isAvailable);
  return success(updated, 200, 'Availability updated successfully');
});

