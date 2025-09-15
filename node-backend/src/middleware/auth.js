const jwtManager = require('../utils/jwt');
const { User } = require('../models');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = jwtManager.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const { success, decoded, error } = await jwtManager.verifyToken(token);
    
    if (!success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Add user info to request
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = jwtManager.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      req.user = null;
      return next();
    }

    const { success, decoded } = await jwtManager.verifyToken(token);
    
    if (!success) {
      req.user = null;
      return next();
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      req.user = null;
      return next();
    }

    // Add user info to request
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

// Authorization middleware for specific roles/permissions
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // For now, we don't have role-based access control
    // This can be extended later if needed
    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceIdParam = 'id', userIdField = 'ownerId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // This will be implemented in specific controllers
      // as it requires knowledge of the specific model
      req.checkOwnership = { resourceId, userId, userIdField };
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership
};