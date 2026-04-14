const jwt = require('jsonwebtoken');

// Verify JWT token
const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Role-based access control
const permit = (...allowedRoles) => (req, res, next) => {
  const { role } = req.user || {};
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient role' });
  }
  next();
};

module.exports = { protect, permit };
