/**
 * SmartBlood - Blood Bank Inventory Service
 */
import { queryByPk, putItem } from '../repositories/dynamoRepository.js';
import { createInventoryEntity } from '../models/entities.js';
import { isValidBloodType } from '../utils/bloodCompatibility.js';

export const getBankInventory = async (bankId) => {
  const items = await queryByPk(`BANK#${bankId}`, 'INVENTORY#');
  if (items && items.length > 0) {
    return items;
  }
  const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  return BLOOD_TYPES.map((bType) => ({
    bankId,
    bloodType: bType,
    unitsAvailable: 0,
    minSafeUnits: 6,
    status: 'Critical'
  }));
};

export const updateBankInventory = async (bankId, payload) => {
  if (!isValidBloodType(payload.bloodType)) {
    const error = new Error(`Invalid blood type: ${payload.bloodType}`);
    error.name = 'ValidationError';
    throw error;
  }

  const inventoryEntity = createInventoryEntity({
    bankId,
    bankName: payload.bankName || 'City Blood Bank',
    bloodType: payload.bloodType,
    unitsAvailable: payload.unitsAvailable,
    location: payload.location || null
  });

  await putItem(inventoryEntity);
  return inventoryEntity;
};

