/**
 * SmartBlood - Blood Request Service
 */
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, updateItem, scanItems } from '../repositories/dynamoRepository.js';
import { createBloodRequestEntity } from '../models/entities.js';
import { isValidBloodType } from '../utils/bloodCompatibility.js';
import { broadcastEmergencyAlert } from './notificationService.js';

export const createBloodRequest = async (payload) => {
  if (!isValidBloodType(payload.bloodType)) {
    const error = new Error(`Invalid blood type: ${payload.bloodType}`);
    error.name = 'ValidationError';
    throw error;
  }

  const requestId = payload.requestId || uuidv4();
  const requestEntity = createBloodRequestEntity({ ...payload, requestId });

  await putItem(requestEntity);

  // Trigger SNS emergency alert if CRITICAL or URGENT
  if (['CRITICAL', 'URGENT'].includes(requestEntity.urgencyLevel)) {
    try {
      await broadcastEmergencyAlert(requestEntity);
    } catch (snsErr) {
      console.error('Failed to dispatch SNS emergency alert:', snsErr);
    }
  }

  return requestEntity;
};

export const getBloodRequestById = async (requestId) => {
  const req = await getItem(`REQUEST#${requestId}`, 'DETAILS');
  if (!req) {
    const error = new Error(`Blood request not found with ID ${requestId}`);
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
        ':status': statusFilter.toUpperCase()
      }
    );
  }

  return await scanItems(
    'entityType = :entityType',
    { ':entityType': 'BLOOD_REQUEST' }
  );
};

export const fulfillBloodRequest = async (requestId, fulfilledByDonorId) => {
  await getBloodRequestById(requestId);

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
