/**
 * Admin Auth Middleware
 * Protects staff-only endpoints with a shared key sent in the X-Admin-Key header.
 * Fails closed: if ADMIN_API_KEY is not configured, every request is rejected.
 */

import { createHash, timingSafeEqual } from 'crypto'
import { getRequestId } from './requestId.js'

const digest = (value) => createHash('sha256').update(String(value)).digest()

export const isValidAdminKey = (provided, expected) => {
  if (!expected || !provided) return false
  return timingSafeEqual(digest(provided), digest(expected))
}

export const requireAdmin = (req, res, next) => {
  if (isValidAdminKey(req.headers['x-admin-key'], process.env.ADMIN_API_KEY)) {
    return next()
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized',
    requestId: getRequestId(req)
  })
}
