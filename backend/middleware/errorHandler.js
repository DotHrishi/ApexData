import { logger } from './logger.js';

/**
 * Centralized Global Error Handler Middleware
 */
export function globalErrorHandler(err, req, res, next) {
  const requestId = req.id || 'req_unknown';
  const statusCode = err.status || err.statusCode || 500;
  const code = err.code || (statusCode === 400 ? 'INVALID_REQUEST' : statusCode === 503 ? 'MODEL_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR');
  const message = err.publicMessage || err.message || 'An unexpected error occurred.';

  // Log error internally with stack trace for diagnostics
  logger.error('Unhandled Server Error', {
    requestId,
    statusCode,
    code,
    error: err.message,
    stack: err.stack,
  });

  // Return clean standardized response to client WITHOUT stack trace
  res.status(statusCode).json({
    success: false,
    requestId,
    code,
    message,
  });
}
