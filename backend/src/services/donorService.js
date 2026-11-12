/**
 * SmartBlood - Donor Business Service
 */
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, updateItem, queryGsi1 } from '../repositories/dynamoRepository.js';
import { createDonorEntity } from '../models/entities.js';
import { isValidBloodType } from '../utils/bloodCompatibility.js';

export const registerDonor = async (payload) => {
  if (!isValidBloodType(payload.bloodType)) {
    const error = new Error(`Invalid blood type: ${payload.bloodType}`);
    error.name = 'ValidationError';
    throw error;
  }

  const donorId = payload.donorId || uuidv4();
  const donorEntity = createDonorEntity({ ...payload, donorId });
  await putItem(donorEntity);
  return donorEntity;
};

export const getDonorById = async (donorId) => {
  const donor = await getItem(`DONOR#${donorId}`, 'PROFILE');
  if (!donor) {
    const error = new Error(`Donor not found with ID ${donorId}`);
    error.name = 'NotFoundError';
    throw error;
  }
  return donor;
};

export const updateAvailability = async (donorId, isAvailable) => {
  const donor = await getDonorById(donorId);
  const newStatus = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';

  const updated = await updateItem(
    `DONOR#${donorId}`,
    'PROFILE',
    'SET isAvailable = :avail, GSI1SK = :gsi1sk, updatedAt = :updatedAt',
    {
      ':avail': Boolean(isAvailable),
      ':gsi1sk': `STATUS#${newStatus}`,
      ':updatedAt': new Date().toISOString()
    }
  );
  return updated;
};

export const getAvailableDonorsByBloodType = async (bloodType) => {
  return await queryGsi1(`BLOOD#${bloodType.toUpperCase()}`, 'STATUS#AVAILABLE');
};
