const { findSessionByToken, findUserById } = require('../utils/memoryStorage');

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Get token from cookie if not in header
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Find session
    const session = findSessionByToken(token);
    if (!session) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    // Get user from session
    const user = findUserById(session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin middleware (not used in current implementation)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

module.exports = { 
  protect, 
  admin, 
  errorHandler, 
  notFound 
};
