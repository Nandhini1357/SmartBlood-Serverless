/**
 * SmartBlood - Centralized Lambda Error Handling Middleware
 */
import { badRequest, unauthorized, notFound, internalError } from '../utils/response.js';

export const withErrorHandler = (handlerFn) => {
  return async (event, context) => {
    try {
      return await handlerFn(event, context);
    } catch (error) {
      console.error('Unhandled Lambda Exception:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: event.path,
        httpMethod: event.httpMethod
      });

      if (error.name === 'ValidationError') {
        return badRequest(error.message, error.details);
      }

      if (error.name === 'UnauthorizedError') {
        return unauthorized(error.message);
      }

      if (error.name === 'NotFoundError') {
        return notFound(error.message);
      }

      return internalError('An unexpected server error occurred.', error);
    }
  };
};
