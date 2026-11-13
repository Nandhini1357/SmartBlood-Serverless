import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { requireHospitalStaff } from '../../middleware/authMiddleware.js';
import { updateBankInventory } from '../../services/bloodBankService.js';
import { success, badRequest } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  const bankId = event.pathParameters?.bankId;
  if (!bankId) {
    return badRequest('bankId path parameter is required');
  }

  // Enforce hospital/bank staff role and facility isolation
  requireHospitalStaff(event, bankId);

  const body = parseBody(event);
  requireFields(body, ['bloodType', 'unitsAvailable']);

  const updated = await updateBankInventory(bankId, body);
  return success(updated, 200, 'Blood bank inventory updated successfully');
});

