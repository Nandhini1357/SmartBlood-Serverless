/**
 * SmartBlood - Domain Entities and DynamoDB Model Mappings
 * Implements strict Single-Table partition and sort key strategies.
 */

import crypto from 'node:crypto';

export const createDonorEntity = ({
  donorId,
  name,
  email,
  phone,
  bloodType,
  city,
  latitude = 0,
  longitude = 0,
  isAvailable = true,
  lastDonationDate = null,
  verificationToken = null
}) => ({
  PK: `DONOR#${donorId}`,
  SK: 'PROFILE',
  GSI1PK: `BLOOD#${bloodType.toUpperCase()}`,
  GSI1SK: `STATUS#${isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`,
  entityType: 'DONOR',
  donorId,
  verificationToken: verificationToken || crypto.randomUUID(),
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
  requesterId = 'ANONYMOUS',
  hospitalId = null,
  requesterName,
  hospitalName,
  bloodType,
  unitsNeeded = 1,
  urgencyLevel = 'CRITICAL', // CRITICAL | URGENT | NORMAL
  city,
  latitude = 0,
  longitude = 0,
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
  hospitalId,
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
  responsesCount: 0,
  createdAt: new Date().toISOString()
});

export const createDonorResponseEntity = ({
  requestId,
  donorId,
  donorName = 'Anonymous Donor',
  bloodType,
  status = 'ACCEPTED', // ACCEPTED | DECLINED | PLEDGED
  etaMinutes = null,
  notes = ''
}) => ({
  PK: `REQUEST#${requestId}`,
  SK: `RESPONSE#${donorId}`,
  GSI1PK: `DONOR#${donorId}`,
  GSI1SK: `RESPONSE#${requestId}`,
  entityType: 'DONOR_RESPONSE',
  requestId,
  donorId,
  donorName,
  bloodType: bloodType ? bloodType.toUpperCase() : null,
  status,
  etaMinutes: etaMinutes != null ? Number(etaMinutes) : null,
  notes,
  createdAt: new Date().toISOString()
});

export const createInventoryEntity = ({
  bankId,
  bankName,
  bloodType,
  unitsAvailable,
  location = null
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

/**
 * Strips sensitive PII (raw email, exact private coordinates) for public matching feeds.
 */
export const sanitizeDonorForMatch = (donor, distanceKm, isExactMatch, matchScore) => ({
  donorId: donor.donorId,
  displayName: donor.name ? donor.name.split(' ')[0] + ' ' + (donor.name.split(' ')[1]?.[0] || '') + '.' : 'Verified Donor',
  bloodType: donor.bloodType,
  city: donor.city,
  distanceKm,
  isExactMatch,
  matchScore,
  isAvailable: donor.isAvailable
});

/**
 * Sanitizes donor profile for the donor themselves or authorized hospital coordination.
 */
export const sanitizeDonorProfile = (donor) => {
  if (!donor) return null;
  const { PK, SK, GSI1PK, GSI1SK, entityType, ...safeProfile } = donor;
  return safeProfile;
};

/**
 * Strips internal and sensitive fields for public emergency broadcast feed.
 */
export const sanitizePublicBloodRequest = (request) => {
  if (!request) return null;
  return {
    requestId: request.requestId,
    hospitalName: request.hospitalName,
    city: request.city,
    bloodType: request.bloodType,
    unitsNeeded: request.unitsNeeded,
    urgencyLevel: request.urgencyLevel,
    contactPhone: request.contactPhone,
    status: request.status,
    responsesCount: request.responsesCount || 0,
    createdAt: request.createdAt
  };
};

/**
 * Sanitizes donor response for public request details feed.
 * Never leaks donor phone, email, or coordinates. Masks donor personal name.
 */
export const sanitizePublicDonorResponse = (response) => {
  if (!response) return null;
  const nameParts = response.donorName ? response.donorName.trim().split(/\s+/) : [];
  const maskedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}.`
      : nameParts[0] || 'Verified Donor';

  return {
    requestId: response.requestId,
    donorId: response.donorId,
    displayName: maskedName,
    bloodType: response.bloodType,
    status: response.status,
    etaMinutes: response.etaMinutes,
    notes: response.notes || '',
    createdAt: response.createdAt
  };
};
