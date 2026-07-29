import crypto from 'crypto';

/**
 * Middleware to generate or extract X-Request-ID correlation headers.
 * Attaches req.id to every request and sets X-Request-ID response header.
 */
export function correlationIdMiddleware(req, res, next) {
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId = incomingId && typeof incomingId === 'string'
    ? incomingId
    : `req_${crypto.randomBytes(4).toString('hex')}`;

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
