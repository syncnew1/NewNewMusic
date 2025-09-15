const { User } = require('../models');
const jwtManager = require('../utils/jwt');
const mongoose = require('mongoose');

class UserController {
  // Register new user
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken'
        });
      }

      // Create new user
      const user = new User({ username, email, password });
      await user.save();

      // Generate tokens
      const tokenPair = jwtManager.generateTokenPair({
        userId: user._id.toString(),
        username: user.username,
        email: user.email
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toResponse(),
          ...tokenPair
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ username }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Generate tokens
      const tokenPair = jwtManager.generateTokenPair({
        userId: user._id.toString(),
        username: user.username,
        email: user.email
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toResponse(),
          ...tokenPair
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .populate('favoriteSongs', 'title artist album coverImage')
        .populate('playlists', 'name description isPublic')
        .populate('following', 'username')
        .populate('followers', 'username');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user.toResponse()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { username } = req.body;
      const userId = req.user.id;

      // Check if username is already taken by another user
      if (username) {
        const existingUser = await User.findOne({
          username,
          _id: { $ne: userId }
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Username already taken'
          });
        }
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        { username },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toResponse()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Follow user
  async followUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      if (userId === currentUserId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot follow yourself'
        });
      }

      const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(userId)
      ]);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already following
      if (currentUser.following.includes(userId)) {
        return res.status(409).json({
          success: false,
          message: 'Already following this user'
        });
      }

      // Add to following/followers
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $addToSet: { following: userId }
        }),
        User.findByIdAndUpdate(userId, {
          $addToSet: { followers: currentUserId }
        })
      ]);

      res.json({
        success: true,
        message: 'User followed successfully'
      });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to follow user',
        error: error.message
      });
    }
  }

  // Unfollow user
  async unfollowUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      if (userId === currentUserId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot unfollow yourself'
        });
      }

      const currentUser = await User.findById(currentUserId);
      if (!currentUser.following.includes(userId)) {
        return res.status(409).json({
          success: false,
          message: 'Not following this user'
        });
      }

      // Remove from following/followers
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $pull: { following: userId }
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { followers: currentUserId }
        })
      ]);

      res.json({
        success: true,
        message: 'User unfollowed successfully'
      });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unfollow user',
        error: error.message
      });
    }
  }

  // Get user's followers
  async getFollowers(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'followers',
          select: 'username',
          options: { skip, limit }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const totalFollowers = user.followers.length;
      const totalPages = Math.ceil(totalFollowers / limit);

      res.json({
        success: true,
        data: {
          followers: user.followers,
          pagination: {
            page,
            limit,
            total: totalFollowers,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get followers',
        error: error.message
      });
    }
  }

  // Get user's following
  async getFollowing(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .populate({
          path: 'following',
          select: 'username',
          options: { skip, limit }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const totalFollowing = user.following.length;
      const totalPages = Math.ceil(totalFollowing / limit);

      res.json({
        success: true,
        data: {
          following: user.following,
          pagination: {
            page,
            limit,
            total: totalFollowing,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get following',
        error: error.message
      });
    }
  }

  // Get user stats
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          followingCount: user.following.length,
          followersCount: user.followers.length
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user stats',
        error: error.message
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const searchRegex = new RegExp(q.trim(), 'i');
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex }
        ]
      })
      .select('username')
      .skip(skip)
      .limit(limit)
      .sort({ username: 1 });

      const total = await User.countDocuments({
        $or: [
          { username: searchRegex },
          { email: searchRegex }
        ]
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();