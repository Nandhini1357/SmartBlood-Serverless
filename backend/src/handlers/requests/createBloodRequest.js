import { withErrorHandler } from '../../middleware/errorHandler.js';
import { parseBody, requireFields } from '../../middleware/validator.js';
import { requireHospitalStaff } from '../../middleware/authMiddleware.js';
import { createBloodRequest } from '../../services/requestService.js';
import { created } from '../../utils/response.js';

export const handler = withErrorHandler(async (event) => {
  // Enforce hospital staff role (HOSPITAL_STAFF, BLOOD_BANK_MANAGER, ADMIN)
  const authUser = requireHospitalStaff(event);

  const body = parseBody(event);
  requireFields(body, ['requesterName', 'hospitalName', 'bloodType', 'city', 'contactPhone']);

  // Bind authenticated hospital ID and requester ID
  const requestPayload = {
    ...body,
    requesterId: authUser.userId,
    hospitalId: authUser.hospitalId || authUser.userId
  };

  const request = await createBloodRequest(requestPayload);
  return created(request, 'Emergency blood request published successfully');
});

