const { Song, User } = require('../models');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

class SongController {
  // Get all songs with pagination and search
  async getAllSongs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { q, genre, artist } = req.query;

      // Build search query
      let searchQuery = {};
      if (q) {
        const searchRegex = new RegExp(q.trim(), 'i');
        searchQuery.$or = [
          { title: searchRegex },
          { artist: { $in: [searchRegex] } },
          { album: searchRegex }
        ];
      }
      if (genre) {
        searchQuery.genre = new RegExp(genre.trim(), 'i');
      }
      if (artist) {
        searchQuery.artist = { $in: [new RegExp(artist.trim(), 'i')] };
      }

      const [songs, total] = await Promise.all([
        Song.find(searchQuery)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Song.countDocuments(searchQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: songs.map(song => song.toResponse()),
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        }
      });
    } catch (error) {
      console.error('Get all songs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get songs',
        error: error.message
      });
    }
  }

  // Get song by ID
  async getSongById(req, res) {
    try {
      const { id } = req.params;
      const song = await Song.findById(id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      res.json({
        success: true,
        data: song.toResponse()
      });
    } catch (error) {
      console.error('Get song by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get song',
        error: error.message
      });
    }
  }

  // Create new song
  async createSong(req, res) {
    try {
      const { title, artist, album, genre, duration } = req.body;
      let { filePath, coverImage } = req.body;

      // Handle file uploads if files were uploaded
      if (req.files) {
        if (req.files.audioFile) {
          filePath = req.files.audioFile[0].path;
        }
        if (req.files.coverImage) {
          coverImage = req.files.coverImage[0].path;
        }
      }

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'Audio file is required'
        });
      }

      const song = new Song({
        title,
        artist,
        album,
        genre,
        duration,
        filePath,
        coverImage: coverImage || ''
      });

      await song.save();

      res.status(201).json({
        success: true,
        message: 'Song created successfully',
        data: song.toResponse()
      });
    } catch (error) {
      console.error('Create song error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create song',
        error: error.message
      });
    }
  }

  // Update song
  async updateSong(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Handle file uploads if files were uploaded
      if (req.files) {
        if (req.files.audioFile) {
          updates.filePath = req.files.audioFile[0].path;
        }
        if (req.files.coverImage) {
          updates.coverImage = req.files.coverImage[0].path;
        }
      }

      const song = await Song.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      res.json({
        success: true,
        message: 'Song updated successfully',
        data: song.toResponse()
      });
    } catch (error) {
      console.error('Update song error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update song',
        error: error.message
      });
    }
  }

  // Delete song
  async deleteSong(req, res) {
    try {
      const { id } = req.params;
      const song = await Song.findById(id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      // Remove song from all users' favorites
      await User.updateMany(
        { favoriteSongs: id },
        { $pull: { favoriteSongs: id } }
      );

      // Delete associated files
      try {
        if (song.filePath) {
          await fs.unlink(song.filePath);
        }
        if (song.coverImage) {
          await fs.unlink(song.coverImage);
        }
      } catch (fileError) {
        console.warn('Failed to delete song files:', fileError.message);
      }

      await Song.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Song deleted successfully'
      });
    } catch (error) {
      console.error('Delete song error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete song',
        error: error.message
      });
    }
  }

  // Add song to favorites
  async addToFavorites(req, res) {
    try {
      const { songId } = req.params;
      const userId = req.user.id;

      // Check if song exists
      const song = await Song.findById(songId);
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      // Check if already in favorites
      const user = await User.findById(userId);
      if (user.favoriteSongs.includes(songId)) {
        return res.status(409).json({
          success: false,
          message: 'Song already in favorites'
        });
      }

      // Add to favorites
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favoriteSongs: songId } }
      );

      res.json({
        success: true,
        message: 'Song added to favorites'
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add song to favorites',
        error: error.message
      });
    }
  }

  // Remove song from favorites
  async removeFromFavorites(req, res) {
    try {
      const { songId } = req.params;
      const userId = req.user.id;

      // Check if song exists
      const song = await Song.findById(songId);
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      // Check if in favorites
      const user = await User.findById(userId);
      if (!user.favoriteSongs.includes(songId)) {
        return res.status(409).json({
          success: false,
          message: 'Song not in favorites'
        });
      }

      // Remove from favorites
      await User.findByIdAndUpdate(
        userId,
        { $pull: { favoriteSongs: songId } }
      );

      res.json({
        success: true,
        message: 'Song removed from favorites'
      });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove song from favorites',
        error: error.message
      });
    }
  }

  // Get user's favorite songs
  async getFavoriteSongs(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'favoriteSongs',
          options: { skip, limit, sort: { createdAt: -1 } }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const totalFavorites = user.favoriteSongs.length;
      const totalPages = Math.ceil(totalFavorites / limit);

      res.json({
        success: true,
        data: user.favoriteSongs.map(song => song.toResponse()),
        pagination: {
          page,
          limit,
          total: totalFavorites,
          pages: totalPages
        }
      });
    } catch (error) {
      console.error('Get favorite songs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get favorite songs',
        error: error.message
      });
    }
  }

  // Check if song is in user's favorites
  async isFavorite(req, res) {
    try {
      const { songId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      const isFavorite = user.favoriteSongs.includes(songId);

      res.json({
        success: true,
        data: { isFavorite }
      });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check favorite status',
        error: error.message
      });
    }
  }

  // Stream song file
  async streamSong(req, res) {
    try {
      const { id } = req.params;
      const song = await Song.findById(id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      const filePath = path.resolve(song.filePath);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Song file not found'
        });
      }

      // Set appropriate headers for audio streaming
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Stream the file
      const readStream = require('fs').createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error('Stream song error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stream song',
        error: error.message
      });
    }
  }

  // Get recommended songs based on user preferences
  async getRecommendedSongs(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const skip = (page - 1) * limit;

      console.log('🎵 Getting recommendations for user:', userId);
      console.log('📄 Page:', page, 'Limit:', limit);

      // Get user's favorite songs to understand preferences
      const user = await User.findById(userId).populate('favoriteSongs');
      const favoriteSongs = user.favoriteSongs || [];
      
      console.log('❤️ User favorite songs count:', favoriteSongs.length);
      
      // Get all songs
      const allSongs = await Song.find().sort({ createdAt: -1 });
      
      console.log('🎶 Total songs in database:', allSongs.length);
      
      let recommendedSongs = [];
      
      if (favoriteSongs.length === 0) {
        // For new users, recommend diverse popular songs
        console.log('👤 New user - providing default recommendations');
        recommendedSongs = allSongs.slice(0, limit);
        console.log('📋 Default recommendations count:', recommendedSongs.length);
      } else {
        console.log('🔍 Analyzing user preferences...');
        // Extract user preferences
        const favoriteGenres = {};
        const favoriteArtists = {};
        const favoriteIds = new Set(favoriteSongs.map(song => song._id.toString()));
        
        favoriteSongs.forEach(song => {
          if (song.genre) {
            favoriteGenres[song.genre] = (favoriteGenres[song.genre] || 0) + 1;
          }
          song.artist.forEach(artist => {
            if (artist) {
              favoriteArtists[artist] = (favoriteArtists[artist] || 0) + 1;
            }
          });
        });
        
        // Score songs based on preferences
        const scoredSongs = allSongs
          .filter(song => !favoriteIds.has(song._id.toString()))
          .map(song => {
            let score = 0;
            
            // Genre matching
            if (song.genre && favoriteGenres[song.genre]) {
              score += favoriteGenres[song.genre] * 3;
            }
            
            // Artist matching
            song.artist.forEach(artist => {
              if (favoriteArtists[artist]) {
                score += favoriteArtists[artist] * 2;
              }
            });
            
            // Add some randomness for diversity
            score += Math.random();
            
            return { song, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.song);
          
        recommendedSongs = scoredSongs;
        console.log('🎯 Scored recommendations count:', recommendedSongs.length);
        
        // If not enough recommendations, fill with random songs
        if (recommendedSongs.length < limit) {
          const remainingSlots = limit - recommendedSongs.length;
          console.log('🔄 Need', remainingSlots, 'more songs to fill recommendations');
          const remainingSongs = allSongs
            .filter(song => 
              !favoriteIds.has(song._id.toString()) && 
              !recommendedSongs.some(rec => rec._id.toString() === song._id.toString())
            )
            .slice(0, remainingSlots);
          recommendedSongs = [...recommendedSongs, ...remainingSongs];
          console.log('➕ Added', remainingSongs.length, 'additional songs');
        }
      }
      
      // Apply pagination to recommended songs
      const paginatedSongs = recommendedSongs.slice(skip, skip + limit);
      const total = recommendedSongs.length;
      const totalPages = Math.ceil(total / limit);
      
      console.log('📊 Final recommendations - Total:', total, 'Page size:', paginatedSongs.length);
      console.log('🎵 Recommended song titles:', paginatedSongs.map(s => s.title));
      
      res.json({
        success: true,
        data: paginatedSongs.map(song => song.toResponse()),
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        }
      });
      
    } catch (error) {
      console.error('Get recommended songs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommended songs',
        error: error.message
      });
    }
  }
}

module.exports = new SongController();