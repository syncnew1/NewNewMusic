const express = require('express');
const songController = require('../controllers/songController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validateSongCreation,
  validateObjectId,
  validatePagination,
  validateSearch
} = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.fieldname === 'audioFile' 
      ? process.env.UPLOAD_PATH || 'uploads/songs'
      : process.env.UPLOAD_PATH || 'uploads/covers';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for audioFile'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for coverImage'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 2 // Maximum 2 files (audio + cover)
  }
});

// Public routes
router.get('/', 
  validatePagination,
  validateSearch,
  songController.getAllSongs
);

// Recommendations - must come before parameterized routes
router.get('/recommendations', 
  authenticate,
  validatePagination,
  songController.getRecommendedSongs
);

// Favorite songs management
// Note: More specific routes should come before parameterized routes
router.get('/favorites', 
  authenticate,
  validatePagination,
  songController.getFavoriteSongs
);

router.get('/:id', 
  validateObjectId('id'),
  songController.getSongById
);

router.get('/:id/stream', 
  validateObjectId('id'),
  songController.streamSong
);

// Protected routes
router.post('/', 
  authenticate,
  upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  validateSongCreation,
  songController.createSong
);

router.put('/:id', 
  authenticate,
  validateObjectId('id'),
  upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  songController.updateSong
);

router.delete('/:id', 
  authenticate,
  validateObjectId('id'),
  songController.deleteSong
);

router.post('/:songId/favorite', 
  authenticate,
  validateObjectId('songId'),
  songController.addToFavorites
);

router.delete('/:songId/favorite', 
  authenticate,
  validateObjectId('songId'),
  songController.removeFromFavorites
);

router.get('/:songId/isFavorite', 
  authenticate,
  validateObjectId('songId'),
  songController.isFavorite
);

module.exports = router;