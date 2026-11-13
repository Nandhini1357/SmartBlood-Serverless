import { withErrorHandler } from '../../middleware/errorHandler.js';
import { verifyDonorAuthorization } from '../../middleware/authMiddleware.js';
import { getDonorById } from '../../services/donorService.js';
import { sanitizeDonorProfile } from '../../models/entities.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const donorId = event.pathParameters?.donorId;
  if (!donorId) {
    return badRequest('donorId path parameter is required');
  }

  // Retrieve raw donor record to verify credentials
  const donor = await getDonorById(donorId, false);

  // Enforce donor or hospital authorization
  verifyDonorAuthorization(event, donorId, donor);

  return success(sanitizeDonorProfile(donor));
});
