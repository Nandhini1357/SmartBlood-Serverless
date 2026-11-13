import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { registerDonor } from '../../services/donorService.js';
import { created, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  // Abuse & payload exhaustion protection
  if (event.body && typeof event.body === 'string' && event.body.length > 10240) {
    return badRequest('Payload exceeds allowable limit of 10KB');
  }

  const body = parseBody(event);
  requireFields(body, ['name', 'email', 'phone', 'bloodType', 'city']);

  // Disallow client from spoofing their own verificationToken
  const { verificationToken, ...safeRegistrationInput } = body;

  const donor = await registerDonor(safeRegistrationInput);
  return created(donor, 'Donor registered successfully');
});

