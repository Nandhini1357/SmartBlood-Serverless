/**
 * SmartBlood - Blood Bank Inventory Service
 */
import { queryByPk, putItem } from '../repositories/dynamoRepository.js';
import { createInventoryEntity } from '../models/entities.js';
import { isValidBloodType } from '../utils/bloodCompatibility.js';

export const getBankInventory = async (bankId) => {
  const items = await queryByPk(`BANK#${bankId}`, 'INVENTORY#');
  return items;
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

