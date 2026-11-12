import { withErrorHandler } from '../../middleware/errorHandler.js';
import { getDonorById } from '../../services/donorService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const donorId = event.pathParameters?.donorId;
  if (!donorId) {
    return badRequest('donorId path parameter is required');
  }

  const donor = await getDonorById(donorId);
  return success(donor);
});
