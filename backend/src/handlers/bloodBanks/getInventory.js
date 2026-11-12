import { withErrorHandler } from '../../middleware/errorHandler.js';
import { getBankInventory } from '../../services/bloodBankService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const bankId = event.pathParameters?.bankId;
  if (!bankId) {
    return badRequest('bankId path parameter is required');
  }

  const inventory = await getBankInventory(bankId);
  return success(inventory);
});

