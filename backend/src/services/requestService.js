/**
 * SmartBlood - Blood Request Service
 */
import { v4 as uuidv4 } from 'uuid';
import {
  putItem,
  getItem,
  updateItem,
  scanItems,
  queryByPk
} from '../repositories/dynamoRepository.js';
import {
  createBloodRequestEntity,
  createDonorResponseEntity
} from '../models/entities.js';
import {
  validateBloodRequestInput,
  validateDonorResponseInput
} from '../middleware/validator.js';
import { broadcastEmergencyAlert } from './notificationService.js';
import { getDonorById } from './donorService.js';

export const createBloodRequest = async (payload) => {
  const validated = validateBloodRequestInput(payload);
  const requestId = validated.requestId || uuidv4();
  const requestEntity = createBloodRequestEntity({ ...validated, requestId });

  await putItem(requestEntity);

  // Trigger SNS emergency alert if CRITICAL or URGENT
  if (['CRITICAL', 'URGENT'].includes(requestEntity.urgencyLevel)) {
    try {
      await broadcastEmergencyAlert(requestEntity);
    } catch (snsErr) {
      console.error('Failed to dispatch SNS emergency alert:', snsErr.message);
    }
  }

  return requestEntity;
};

export const getBloodRequestById = async (requestId) => {
  if (!requestId || typeof requestId !== 'string') {
    const error = new Error('A valid requestId string is required');
    error.name = 'ValidationError';
    throw error;
  }

  const req = await getItem(`REQUEST#${requestId.trim()}`, 'DETAILS');
  if (!req) {
    const error = new Error(`Blood request not found with ID: ${requestId}`);
    error.name = 'NotFoundError';
    throw error;
  }
  return req;
};

export const listBloodRequests = async (statusFilter = null) => {
  if (statusFilter) {
    return await scanItems(
      'entityType = :entityType AND #status = :status',
      {
        ':entityType': 'BLOOD_REQUEST',
        ':status': statusFilter.toUpperCase().trim()
      }
    );
  }

  return await scanItems(
    'entityType = :entityType',
    { ':entityType': 'BLOOD_REQUEST' }
  );
};

export const recordDonorResponse = async (requestId, payload) => {
  // Ensure request exists
  const request = await getBloodRequestById(requestId);

  const validated = validateDonorResponseInput(payload);

  // Validate donor exists to ensure response is from a registered donor
  const donor = await getDonorById(validated.donorId);

  const responseEntity = createDonorResponseEntity({
    requestId: request.requestId,
    donorId: donor.donorId,
    donorName: donor.name,
    bloodType: donor.bloodType,
    status: validated.status,
    etaMinutes: validated.etaMinutes,
    notes: validated.notes
  });

  await putItem(responseEntity);

  // Increment response counter on the blood request
  try {
    await updateItem(
      `REQUEST#${requestId}`,
      'DETAILS',
      'SET responsesCount = if_not_exists(responsesCount, :zero) + :inc, updatedAt = :updatedAt',
      {},
      {
        ':zero': 0,
        ':inc': 1,
        ':updatedAt': new Date().toISOString()
      }
    );
  } catch (err) {
    console.warn('Could not update response count on request:', err.message);
  }

  return responseEntity;
};

export const getResponsesForRequest = async (requestId) => {
  await getBloodRequestById(requestId);
  return await queryByPk(`REQUEST#${requestId}`, 'RESPONSE#');
};

export const fulfillBloodRequest = async (requestId, fulfilledByDonorId) => {
  if (!fulfilledByDonorId) {
    const error = new Error('fulfilledByDonorId is required to fulfill request');
    error.name = 'ValidationError';
    throw error;
  }

  await getBloodRequestById(requestId);
  await getDonorById(fulfilledByDonorId);

  const updated = await updateItem(
    `REQUEST#${requestId}`,
    'DETAILS',
    'SET #status = :fulfilled, fulfilledBy = :donorId, GSI1SK = :gsi1sk, fulfilledAt = :fulfilledAt',
    {
      '#status': 'status'
    },
    {
      ':fulfilled': 'FULFILLED',
      ':donorId': fulfilledByDonorId,
      ':gsi1sk': 'STATUS#FULFILLED',
      ':fulfilledAt': new Date().toISOString()
    }
  );

  return updated;
};
