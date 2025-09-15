const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');
const { body, query } = require('express-validator');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, userController.register);
router.post('/login', validateUserLogin, userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', 
  authenticate,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ],
  userController.updateProfile
);

// Follow/Unfollow routes
router.post('/follow/:userId', 
  authenticate, 
  validateObjectId('userId'), 
  userController.followUser
);
router.delete('/follow/:userId', 
  authenticate, 
  validateObjectId('userId'), 
  userController.unfollowUser
);

// Get followers/following
router.get('/:userId/followers', 
  validateObjectId('userId'),
  validatePagination,
  userController.getFollowers
);
router.get('/:userId/following', 
  validateObjectId('userId'),
  validatePagination,
  userController.getFollowing
);
router.get('/:userId/stats', 
  validateObjectId('userId'),
  userController.getUserStats
);

// Search users
router.get('/search', 
  [
    ...validatePagination,
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Search query must be between 1 and 50 characters')
  ],
  userController.searchUsers
);

module.exports = router;