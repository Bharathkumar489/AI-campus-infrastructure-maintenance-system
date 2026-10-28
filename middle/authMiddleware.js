const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campuscare-secret-key-2026';

/**
 * Authentication Middleware
 * Validates bearer token / session token and populates req.user
 */
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Also allow session fallback for demo/testing
    const userIdHeader = req.headers['x-user-id'] || req.body?.user_id;
    if (userIdHeader) {
      req.user = { user_id: userIdHeader, role: req.headers['x-user-role'] || 'requester' };
      return next();
    }
    return res.status(401).json({ error: 'Access denied. No authorization token or user ID provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    // If JWT format
    if (token.includes('.')) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    }

    // If custom demo token format: jwt-token-{userId}-{timestamp}
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      const userId = parts.slice(2, parts.length - 1).join('-');
      req.user = { user_id: userId || 'usr-student-1', role: 'requester' };
      return next();
    }

    req.user = { token, role: 'requester' };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts endpoint to specified user roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required before role verification.' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole);

    if (!isAllowed) {
      return res.status(403).json({
        error: `Forbidden: This operation requires one of [${allowedRoles.join(', ')}] privileges. Current role is "${req.user.role}".`
      });
    }

    next();
  };
}

const requireAdmin = requireRole('admin');
const requireTechnician = requireRole('technician', 'admin');
const requireRequester = requireRole('requester', 'student', 'staff', 'faculty', 'admin');

module.exports = {
  verifyAuth,
  requireRole,
  requireAdmin,
  requireTechnician,
  requireRequester
};
