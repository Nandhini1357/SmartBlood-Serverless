/**
 * SmartBlood - Standardized API Gateway Response Formatter
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
};

export const success = (data, statusCode = 200, message = 'Success') => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
});

export const created = (data, message = 'Resource created successfully') =>
  success(data, 201, message);

export const badRequest = (message = 'Bad Request', details = null) => ({
  statusCode: 400,
  headers: CORS_HEADERS,
  body: JSON.stringify({
    success: false,
    error: 'BadRequest',
    message,
    details,
    timestamp: new Date().toISOString()
  })
});

export const unauthorized = (message = 'Unauthorized') => ({
  statusCode: 401,
  headers: CORS_HEADERS,
  body: JSON.stringify({
    success: false,
    error: 'Unauthorized',
    message,
    timestamp: new Date().toISOString()
  })
});

export const notFound = (message = 'Resource not found') => ({
  statusCode: 404,
  headers: CORS_HEADERS,
  body: JSON.stringify({
    success: false,
    error: 'NotFound',
    message,
    timestamp: new Date().toISOString()
  })
});

export const internalError = (message = 'Internal Server Error', error = null) => ({
  statusCode: 500,
  headers: CORS_HEADERS,
  body: JSON.stringify({
    success: false,
    error: 'InternalServerError',
    message,
    ...(process.env.NODE_ENV !== 'production' && error ? { errorDetails: error.message } : {}),
    timestamp: new Date().toISOString()
  })
});
