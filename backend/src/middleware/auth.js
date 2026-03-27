import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { findById } from '../models/user.js';

/**
 * Verify JWT and attach req.user (id, email, role).
 * Use on routes that require authentication.
 */
export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(err);
  }
}

/**
 * Optional auth: attach user if token present, do not reject if missing.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await findById(decoded.userId);
    req.user = user ? { id: user.id, email: user.email, role: user.role } : null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

/**
 * Require admin role. Must be used after auth middleware.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
