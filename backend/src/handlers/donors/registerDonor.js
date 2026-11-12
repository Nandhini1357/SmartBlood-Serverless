import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { registerDonor } from '../../services/donorService.js';
import { created } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const body = parseBody(event);
  requireFields(body, ['name', 'email', 'phone', 'bloodType', 'city']);

  const donor = await registerDonor(body);
  return created(donor, 'Donor registered successfully');
});
