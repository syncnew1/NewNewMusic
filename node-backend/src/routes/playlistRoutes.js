const express = require('express');
const playlistController = require('../controllers/playlistController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validatePlaylistCreation,
  validatePlaylistUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Public routes
router.get('/', 
  validatePagination,
  playlistController.getPublicPlaylists
);

router.get('/:id', 
  optionalAuth,
  validateObjectId('id'),
  playlistController.getPlaylistById
);

router.get('/user/:userId', 
  optionalAuth,
  validateObjectId('userId'),
  validatePagination,
  playlistController.getUserPlaylists
);

// Protected routes
router.post('/', 
  authenticate,
  validatePlaylistCreation,
  playlistController.createPlaylist
);

router.put('/:id', 
  authenticate,
  validateObjectId('id'),
  validatePlaylistUpdate,
  playlistController.updatePlaylist
);

router.delete('/:id', 
  authenticate,
  validateObjectId('id'),
  playlistController.deletePlaylist
);

// Song management in playlists
router.post('/:id/songs/:songId', 
  authenticate,
  validateObjectId('id'),
  validateObjectId('songId'),
  playlistController.addSongToPlaylist
);

router.delete('/:id/songs/:songId', 
  authenticate,
  validateObjectId('id'),
  validateObjectId('songId'),
  playlistController.removeSongFromPlaylist
);

router.put('/:id/reorder', 
  authenticate,
  validateObjectId('id'),
  [
    body('songIds')
      .isArray({ min: 0 })
      .withMessage('songIds must be an array'),
    body('songIds.*')
      .isMongoId()
      .withMessage('Each songId must be a valid ObjectId')
  ],
  playlistController.reorderPlaylistSongs
);

module.exports = router;