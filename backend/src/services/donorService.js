/**
 * SmartBlood - Donor Business Service
 */
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, updateItem, queryGsi1 } from '../repositories/dynamoRepository.js';
import { createDonorEntity, sanitizeDonorProfile } from '../models/entities.js';
import { validateDonorRegistration } from '../middleware/validator.js';

export const registerDonor = async (payload) => {
  const validated = validateDonorRegistration(payload);
  const donorId = validated.donorId || uuidv4();
  const donorEntity = createDonorEntity({ ...validated, donorId });

  await putItem(donorEntity);
  return sanitizeDonorProfile(donorEntity);
};

export const getDonorById = async (donorId, sanitize = false) => {
  if (!donorId || typeof donorId !== 'string') {
    const error = new Error('A valid donorId string is required');
    error.name = 'ValidationError';
    throw error;
  }

  const donor = await getItem(`DONOR#${donorId.trim()}`, 'PROFILE');
  if (!donor) {
    const error = new Error(`Donor not found with ID: ${donorId}`);
    error.name = 'NotFoundError';
    throw error;
  }

  return sanitize ? sanitizeDonorProfile(donor) : donor;
};

export const updateAvailability = async (donorId, isAvailable) => {
  if (typeof isAvailable !== 'boolean') {
    const error = new Error('isAvailable must be a boolean');
    error.name = 'ValidationError';
    throw error;
  }

  // Ensure donor exists first
  await getDonorById(donorId);

  const newStatus = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';
  const updated = await updateItem(
    `DONOR#${donorId.trim()}`,
    'PROFILE',
    'SET isAvailable = :avail, GSI1SK = :gsi1sk, updatedAt = :updatedAt',
    null,
    {
      ':avail': isAvailable,
      ':gsi1sk': `STATUS#${newStatus}`,
      ':updatedAt': new Date().toISOString()
    }
  );

  return sanitizeDonorProfile(updated);
};

export const getAvailableDonorsByBloodType = async (bloodType) => {
  if (!bloodType) return [];
  return await queryGsi1(`BLOOD#${bloodType.toUpperCase().trim()}`, 'STATUS#AVAILABLE');
};

export const listDonors = async ({ bloodType = null, city = null } = {}) => {
  const VALID_BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  let donors = [];

  if (bloodType && VALID_BLOOD_TYPES.includes(bloodType.toUpperCase().trim())) {
    donors = await getAvailableDonorsByBloodType(bloodType);
  } else {
    const queries = VALID_BLOOD_TYPES.map((bType) => getAvailableDonorsByBloodType(bType));
    const results = await Promise.all(queries);
    donors = results.flat();
  }

  if (city && typeof city === 'string' && city.trim()) {
    const cityLower = city.trim().toLowerCase();
    donors = donors.filter((d) => d.city && d.city.toLowerCase().includes(cityLower));
  }

  return donors;
};
