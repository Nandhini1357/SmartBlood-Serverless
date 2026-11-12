import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { broadcastEmergencyAlert } from '../../services/notificationService.js';
import { success } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const body = parseBody(event);
  requireFields(body, ['bloodType', 'unitsNeeded', 'hospitalName', 'city', 'contactPhone']);

  const result = await broadcastEmergencyAlert(body);
  return success(result, 200, 'Emergency alert broadcasted successfully');
});

