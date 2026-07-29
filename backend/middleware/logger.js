/**
 * Structured JSON Logger for Express API Gateway
 */
const environment = process.env.NODE_ENV || 'development';
const service = 'express-api';

function formatLog(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    service,
    environment,
    level,
    message,
    ...meta,
  };
  return JSON.stringify(logEntry);
}

export const logger = {
  info(message, meta) {
    console.log(formatLog('info', message, meta));
  },
  warn(message, meta) {
    console.warn(formatLog('warn', message, meta));
  },
  error(message, meta) {
    console.error(formatLog('error', message, meta));
  },
};

/**
 * Middleware that logs HTTP request details in JSON format on completion.
 */
export function requestLoggerMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    const userAgent = req.get('user-agent') || '';

    logger.info('HTTP Request Handled', {
      requestId: req.id,
      method: req.method,
      route: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      clientIp,
      userAgent,
    });
  });

  next();
}
