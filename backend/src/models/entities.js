/**
 * SmartBlood - Domain Entities and DynamoDB Model Mappings
 */

export const createDonorEntity = ({
  donorId,
  name,
  email,
  phone,
  bloodType,
  city,
  latitude,
  longitude,
  isAvailable = true,
  lastDonationDate = null
}) => ({
  PK: `DONOR#${donorId}`,
  SK: 'PROFILE',
  GSI1PK: `BLOOD#${bloodType.toUpperCase()}`,
  GSI1SK: `STATUS#${isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`,
  entityType: 'DONOR',
  donorId,
  name,
  email,
  phone,
  bloodType: bloodType.toUpperCase(),
  city,
  location: {
    latitude: Number(latitude),
    longitude: Number(longitude)
  },
  isAvailable: Boolean(isAvailable),
  lastDonationDate,
  createdAt: new Date().toISOString()
});

export const createBloodRequestEntity = ({
  requestId,
  requesterId,
  requesterName,
  hospitalName,
  bloodType,
  unitsNeeded = 1,
  urgencyLevel = 'CRITICAL', // CRITICAL | URGENT | NORMAL
  city,
  latitude,
  longitude,
  contactPhone,
  status = 'PENDING'
}) => ({
  PK: `REQUEST#${requestId}`,
  SK: 'DETAILS',
  GSI1PK: `BLOOD#${bloodType.toUpperCase()}`,
  GSI1SK: `STATUS#${status}`,
  entityType: 'BLOOD_REQUEST',
  requestId,
  requesterId,
  requesterName,
  hospitalName,
  bloodType: bloodType.toUpperCase(),
  unitsNeeded: Number(unitsNeeded),
  urgencyLevel,
  city,
  location: {
    latitude: Number(latitude),
    longitude: Number(longitude)
  },
  contactPhone,
  status,
  createdAt: new Date().toISOString()
});

export const createInventoryEntity = ({
  bankId,
  bankName,
  bloodType,
  unitsAvailable,
  location
}) => ({
  PK: `BANK#${bankId}`,
  SK: `INVENTORY#${bloodType.toUpperCase()}`,
  GSI1PK: `BANK#${bankId}`,
  GSI1SK: 'INVENTORY',
  entityType: 'INVENTORY_ITEM',
  bankId,
  bankName,
  bloodType: bloodType.toUpperCase(),
  unitsAvailable: Number(unitsAvailable),
  location,
  lastRestockedAt: new Date().toISOString()
});
