const User = require('../models/User');
const mongoose = require('mongoose');

class FollowController {
  // 关注用户
  async followUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      // 检查是否尝试关注自己
      if (userId === currentUserId) {
        return res.status(400).json({
          success: false,
          message: '不能关注自己'
        });
      }

      // 检查目标用户是否存在
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 检查是否已经关注
      const currentUser = await User.findById(currentUserId);
      if (currentUser.following.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: '已经关注了该用户'
        });
      }

      // 添加到当前用户的关注列表
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: userId } }
      );

      // 添加到目标用户的粉丝列表
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { followers: currentUserId } }
      );

      res.json({
        success: true,
        message: '关注成功'
      });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({
        success: false,
        message: '关注失败',
        error: error.message
      });
    }
  }

  // 取消关注用户
  async unfollowUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      // 检查是否尝试取消关注自己
      if (userId === currentUserId) {
        return res.status(400).json({
          success: false,
          message: '不能取消关注自己'
        });
      }

      // 检查目标用户是否存在
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 检查是否已经关注
      const currentUser = await User.findById(currentUserId);
      if (!currentUser.following.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: '未关注该用户'
        });
      }

      // 从当前用户的关注列表中移除
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { following: userId } }
      );

      // 从目标用户的粉丝列表中移除
      await User.findByIdAndUpdate(
        userId,
        { $pull: { followers: currentUserId } }
      );

      res.json({
        success: true,
        message: '取消关注成功'
      });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({
        success: false,
        message: '取消关注失败',
        error: error.message
      });
    }
  }

  // 获取用户的关注列表
  async getFollowing(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const user = await User.findById(userId)
        .populate({
          path: 'following',
          select: 'username email createdAt',
          options: {
            skip: (page - 1) * limit,
            limit: parseInt(limit)
          }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const totalFollowing = await User.findById(userId).select('following');
      const total = totalFollowing.following.length;

      res.json({
        success: true,
        data: {
          following: user.following,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        success: false,
        message: '获取关注列表失败',
        error: error.message
      });
    }
  }

  // 获取用户的粉丝列表
  async getFollowers(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const user = await User.findById(userId)
        .populate({
          path: 'followers',
          select: 'username email createdAt',
          options: {
            skip: (page - 1) * limit,
            limit: parseInt(limit)
          }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const totalFollowers = await User.findById(userId).select('followers');
      const total = totalFollowers.followers.length;

      res.json({
        success: true,
        data: {
          followers: user.followers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        success: false,
        message: '获取粉丝列表失败',
        error: error.message
      });
    }
  }

  // 检查是否关注某个用户
  async checkFollowStatus(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      if (userId === currentUserId) {
        return res.json({
          success: true,
          data: {
            isFollowing: false,
            isSelf: true
          }
        });
      }

      const currentUser = await User.findById(currentUserId).select('following');
      const isFollowing = currentUser.following.includes(userId);

      res.json({
        success: true,
        data: {
          isFollowing,
          isSelf: false
        }
      });
    } catch (error) {
      console.error('Check follow status error:', error);
      res.status(500).json({
        success: false,
        message: '检查关注状态失败',
        error: error.message
      });
    }
  }

  // 获取用户统计信息（关注数、粉丝数等）
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('following followers');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
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
        message: '获取用户统计失败',
        error: error.message
      });
    }
  }
}

module.exports = new FollowController();