/**
 * SmartBlood - Centralized Lambda Error Handling Middleware
 */
import { badRequest, unauthorized, notFound, internalError } from '../utils/response.js';

export const withErrorHandler = (handlerFn) => {
  return async (event, context) => {
    try {
      return await handlerFn(event, context);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return badRequest(error.message, error.details);
      }

      if (error.name === 'UnauthorizedError') {
        return unauthorized(error.message);
      }

      if (error.name === 'NotFoundError') {
        return notFound(error.message);
      }

      // Log truly unexpected 500 internal errors
      console.error('Unhandled Lambda Exception (500):', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: event.path,
        httpMethod: event.httpMethod
      });

      return internalError('An unexpected server error occurred.', error);
    }
  };
};
