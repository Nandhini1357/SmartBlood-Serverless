/**
 * SmartBlood - Request Validation Middleware
 */

export const parseBody = (event) => {
  if (!event.body) {
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
