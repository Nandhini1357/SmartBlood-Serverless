import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { updateBankInventory } from '../../services/bloodBankService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const bankId = event.pathParameters?.bankId;
  if (!bankId) {
    return badRequest('bankId path parameter is required');
  }

  const body = parseBody(event);
  requireFields(body, ['bloodType', 'unitsAvailable']);

  const updated = await updateBankInventory(bankId, body);
  return success(updated, 200, 'Blood bank inventory updated successfully');
});

