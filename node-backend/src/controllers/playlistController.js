const { Playlist, User, Song } = require('../models');
const mongoose = require('mongoose');

class PlaylistController {
  // Create new playlist
  async createPlaylist(req, res) {
    try {
      const { name, description, isPublic, tags } = req.body;
      const ownerId = req.user.id;

      const playlist = new Playlist({
        name,
        description,
        ownerId,
        isPublic: isPublic || false,
        tags: tags || []
      });

      await playlist.save();

      // Add playlist to user's playlists
      await User.findByIdAndUpdate(
        ownerId,
        { $addToSet: { playlists: playlist._id } }
      );

      // Populate owner information
      const populatedPlaylist = await Playlist.findById(playlist._id)
        .populate('ownerId', 'username');

      res.status(201).json({
        success: true,
        message: 'Playlist created successfully',
        data: populatedPlaylist.toResponse(populatedPlaylist.ownerId.username)
      });
    } catch (error) {
      console.error('Create playlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create playlist',
        error: error.message
      });
    }
  }

  // Get all public playlists with pagination
  async getPublicPlaylists(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { q, tags } = req.query;

      // Build search query
      let searchQuery = { isPublic: true };
      if (q) {
        const searchRegex = new RegExp(q.trim(), 'i');
        searchQuery.$or = [
          { name: searchRegex },
          { description: searchRegex }
        ];
      }
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        searchQuery.tags = { $in: tagArray };
      }

      const [playlists, total] = await Promise.all([
        Playlist.find(searchQuery)
          .populate('ownerId', 'username')
          .populate('songs', 'title artist album coverImage duration')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Playlist.countDocuments(searchQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          playlists: playlists.map(playlist => 
            playlist.toResponse(playlist.ownerId.username)
          ),
          pagination: {
            page,
            limit,
            total,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get public playlists error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get playlists',
        error: error.message
      });
    }
  }

  // Get user's playlists
  async getUserPlaylists(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user ? req.user.id : null;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query - show public playlists or user's own playlists
      let searchQuery = { ownerId: userId };
      if (userId !== currentUserId) {
        searchQuery.isPublic = true;
      }

      const [playlists, total] = await Promise.all([
        Playlist.find(searchQuery)
          .populate('ownerId', 'username')
          .populate('songs', 'title artist album coverImage duration')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Playlist.countDocuments(searchQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          playlists: playlists.map(playlist => 
            playlist.toResponse(playlist.ownerId.username)
          ),
          pagination: {
            page,
            limit,
            total,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get user playlists error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user playlists',
        error: error.message
      });
    }
  }

  // Get current user's playlists
  async getMyPlaylists(req, res) {
    try {
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [playlists, total] = await Promise.all([
        Playlist.find({ ownerId: currentUserId })
          .populate('ownerId', 'username')
          .populate('songs', 'title artist album coverImage duration')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Playlist.countDocuments({ ownerId: currentUserId })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          playlists: playlists.map(playlist => 
            playlist.toResponse(playlist.ownerId.username)
          ),
          pagination: {
            page,
            limit,
            total,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get my playlists error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get my playlists',
        error: error.message
      });
    }
  }

  // Get playlist by ID
  async getPlaylistById(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.id : null;

      const playlist = await Playlist.findById(id)
        .populate('ownerId', 'username')
        .populate('songs', 'title artist album coverImage duration');

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      // Check if user can access this playlist
      if (!playlist.isPublic && playlist.ownerId._id.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to private playlist'
        });
      }

      res.json({
        success: true,
        data: playlist.toResponse(playlist.ownerId.username)
      });
    } catch (error) {
      console.error('Get playlist by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get playlist',
        error: error.message
      });
    }
  }

  // Update playlist
  async updatePlaylist(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      // Check if playlist exists and user owns it
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (playlist.ownerId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own playlists'
        });
      }

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate('ownerId', 'username');

      res.json({
        success: true,
        message: 'Playlist updated successfully',
        data: updatedPlaylist.toResponse(updatedPlaylist.ownerId.username)
      });
    } catch (error) {
      console.error('Update playlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update playlist',
        error: error.message
      });
    }
  }

  // Delete playlist
  async deletePlaylist(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if playlist exists and user owns it
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (playlist.ownerId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own playlists'
        });
      }

      // Remove playlist from user's playlists
      await User.findByIdAndUpdate(
        userId,
        { $pull: { playlists: id } }
      );

      await Playlist.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Playlist deleted successfully'
      });
    } catch (error) {
      console.error('Delete playlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete playlist',
        error: error.message
      });
    }
  }

  // Add song to playlist
  async addSongToPlaylist(req, res) {
    try {
      const { id, songId } = req.params;
      const userId = req.user.id;

      // Check if playlist exists and user owns it
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (playlist.ownerId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own playlists'
        });
      }

      // Check if song exists
      const song = await Song.findById(songId);
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      // Check if song is already in playlist
      if (playlist.songs.includes(songId)) {
        return res.status(409).json({
          success: false,
          message: 'Song already in playlist'
        });
      }

      // Add song to playlist
      await Playlist.findByIdAndUpdate(
        id,
        { $addToSet: { songs: songId } }
      );

      res.json({
        success: true,
        message: 'Song added to playlist successfully'
      });
    } catch (error) {
      console.error('Add song to playlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add song to playlist',
        error: error.message
      });
    }
  }

  // Remove song from playlist
  async removeSongFromPlaylist(req, res) {
    try {
      const { id, songId } = req.params;
      const userId = req.user.id;

      // Check if playlist exists and user owns it
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (playlist.ownerId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own playlists'
        });
      }

      // Check if song is in playlist
      if (!playlist.songs.includes(songId)) {
        return res.status(409).json({
          success: false,
          message: 'Song not in playlist'
        });
      }

      // Remove song from playlist
      await Playlist.findByIdAndUpdate(
        id,
        { $pull: { songs: songId } }
      );

      res.json({
        success: true,
        message: 'Song removed from playlist successfully'
      });
    } catch (error) {
      console.error('Remove song from playlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove song from playlist',
        error: error.message
      });
    }
  }

  // Reorder songs in playlist
  async reorderPlaylistSongs(req, res) {
    try {
      const { id } = req.params;
      const { songIds } = req.body;
      const userId = req.user.id;

      // Check if playlist exists and user owns it
      const playlist = await Playlist.findById(id);
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }

      if (playlist.ownerId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own playlists'
        });
      }

      // Validate that all songIds exist in the playlist
      const playlistSongIds = playlist.songs.map(id => id.toString());
      const providedSongIds = songIds.map(id => id.toString());
      
      if (playlistSongIds.length !== providedSongIds.length ||
          !playlistSongIds.every(id => providedSongIds.includes(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid song order. All songs must be included'
        });
      }

      // Update playlist with new order
      await Playlist.findByIdAndUpdate(
        id,
        { songs: songIds }
      );

      res.json({
        success: true,
        message: 'Playlist songs reordered successfully'
      });
    } catch (error) {
      console.error('Reorder playlist songs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder playlist songs',
        error: error.message
      });
    }
  }
}

module.exports = new PlaylistController();