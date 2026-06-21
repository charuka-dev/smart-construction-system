import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next({ status: 401, message: 'Missing token' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next({ status: 401, message: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next({ status: 401, message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return next({ status: 403, message: 'Forbidden' });
    }
    next();
  };
}
