/**
 * SmartBlood - Request Validation Middleware & Sanitization Utilities
 */
import { isValidBloodType } from '../utils/bloodCompatibility.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$|^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
const VALID_URGENCY_LEVELS = ['CRITICAL', 'URGENT', 'NORMAL'];
const VALID_RESPONSE_STATUSES = ['ACCEPTED', 'DECLINED', 'PLEDGED'];

export const parseBody = (event) => {
  if (!event || !event.body) {
    return {};
  }
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    const error = new Error('Invalid JSON payload in request body');
    error.name = 'ValidationError';
    throw error;
  }
};

export const requireFields = (body, fields) => {
  const missing = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.name = 'ValidationError';
    error.details = { missingFields: missing };
    throw error;
  }
};

export const validateEmail = (email) => {
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    const error = new Error(`Invalid email address format: ${email}`);
    error.name = 'ValidationError';
    throw error;
  }
  return email.trim().toLowerCase();
};

export const validatePhone = (phone) => {
  if (!phone || !PHONE_REGEX.test(phone.trim())) {
    const error = new Error(`Invalid phone number format: ${phone}`);
    error.name = 'ValidationError';
    throw error;
  }
  return phone.trim();
};

export const validateBloodTypeInput = (bloodType) => {
  if (!isValidBloodType(bloodType)) {
    const error = new Error(`Invalid blood type: ${bloodType}. Allowed types: O-, O+, A-, A+, B-, B+, AB-, AB+`);
    error.name = 'ValidationError';
    throw error;
  }
  return bloodType.trim().toUpperCase();
};

export const validateUrgencyLevel = (level) => {
  const normalized = level ? level.trim().toUpperCase() : 'NORMAL';
  if (!VALID_URGENCY_LEVELS.includes(normalized)) {
    const error = new Error(`Invalid urgency level: ${level}. Allowed: CRITICAL, URGENT, NORMAL`);
    error.name = 'ValidationError';
    throw error;
  }
  return normalized;
};

export const validateUnits = (units) => {
  const num = Number(units);
  if (isNaN(num) || num < 1 || num > 50) {
    const error = new Error(`Units needed must be a number between 1 and 50. Received: ${units}`);
    error.name = 'ValidationError';
    throw error;
  }
  return num;
};

export const validateCoordinates = (lat, lon) => {
  if (lat == null && lon == null) {
    return null;
  }
  const nLat = Number(lat);
  const nLon = Number(lon);
  if (isNaN(nLat) || nLat < -90 || nLat > 90) {
    const error = new Error(`Invalid latitude: ${lat}. Must be between -90 and 90`);
    error.name = 'ValidationError';
    throw error;
  }
  if (isNaN(nLon) || nLon < -180 || nLon > 180) {
    const error = new Error(`Invalid longitude: ${lon}. Must be between -180 and 180`);
    error.name = 'ValidationError';
    throw error;
  }
  return { latitude: nLat, longitude: nLon };
};

export const validateDonorRegistration = (payload) => {
  requireFields(payload, ['name', 'email', 'phone', 'bloodType', 'city']);

  const email = validateEmail(payload.email);
  const phone = validatePhone(payload.phone);
  const bloodType = validateBloodTypeInput(payload.bloodType);
  const location = validateCoordinates(payload.latitude, payload.longitude);

  return {
    ...payload,
    name: payload.name.trim(),
    email,
    phone,
    bloodType,
    city: payload.city.trim(),
    latitude: location?.latitude ?? 0,
    longitude: location?.longitude ?? 0,
    isAvailable: payload.isAvailable !== undefined ? Boolean(payload.isAvailable) : true
  };
};

export const validateBloodRequestInput = (payload) => {
  requireFields(payload, ['requesterName', 'hospitalName', 'bloodType', 'city', 'contactPhone']);

  const bloodType = validateBloodTypeInput(payload.bloodType);
  const contactPhone = validatePhone(payload.contactPhone);
  const unitsNeeded = validateUnits(payload.unitsNeeded ?? 1);
  const urgencyLevel = validateUrgencyLevel(payload.urgencyLevel || 'CRITICAL');
  const location = validateCoordinates(payload.latitude, payload.longitude);

  return {
    ...payload,
    requesterName: payload.requesterName.trim(),
    hospitalName: payload.hospitalName.trim(),
    bloodType,
    unitsNeeded,
    urgencyLevel,
    city: payload.city.trim(),
    contactPhone,
    latitude: location?.latitude ?? 0,
    longitude: location?.longitude ?? 0
  };
};

export const validateDonorResponseInput = (payload) => {
  requireFields(payload, ['donorId', 'status']);

  const normalizedStatus = payload.status.trim().toUpperCase();
  if (!VALID_RESPONSE_STATUSES.includes(normalizedStatus)) {
    const error = new Error(`Invalid response status: ${payload.status}. Allowed: ${VALID_RESPONSE_STATUSES.join(', ')}`);
    error.name = 'ValidationError';
    throw error;
  }

  const etaMinutes = payload.etaMinutes != null ? Number(payload.etaMinutes) : null;
  if (etaMinutes !== null && (isNaN(etaMinutes) || etaMinutes < 0 || etaMinutes > 1440)) {
    const error = new Error('etaMinutes must be a positive number less than 1440 (24 hours)');
    error.name = 'ValidationError';
    throw error;
  }

  return {
    donorId: payload.donorId.trim(),
    status: normalizedStatus,
    donorName: payload.donorName ? payload.donorName.trim() : 'Anonymous Donor',
    etaMinutes,
    notes: payload.notes ? payload.notes.trim() : ''
  };
};
