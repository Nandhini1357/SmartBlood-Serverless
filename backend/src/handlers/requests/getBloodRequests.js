import { withErrorHandler } from '../../middleware/errorHandler.js';
import { listBloodRequests } from '../../services/requestService.js';
import { sanitizePublicBloodRequest } from '../../models/entities.js';
import { success } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const status = event.queryStringParameters?.status || null;
  const requests = await listBloodRequests(status);
  const sanitizedRequests = requests.map(sanitizePublicBloodRequest);
  return success(sanitizedRequests);
});

