import { withErrorHandler } from '../../middleware/errorHandler.js';
import { listBloodRequests } from '../../services/requestService.js';
import { success } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const status = event.queryStringParameters?.status || null;
  const requests = await listBloodRequests(status);
  return success(requests);
});

