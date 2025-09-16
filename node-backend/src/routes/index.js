const express = require('express');
const userRoutes = require('./userRoutes');
const songRoutes = require('./songRoutes');
const playlistRoutes = require('./playlistRoutes');
const commentRoutes = require('./commentRoutes');
const followRoutes = require('./followRoutes');
const path = require('path');

const router = express.Router();

// API路由
router.use('/api/auth', userRoutes); // 认证路由
router.use('/api/users', userRoutes);
router.use('/api/songs', songRoutes);
router.use('/api/playlists', playlistRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/follow', followRoutes);

// 静态文件服务
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 健康检查端点
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API文档端点
router.get('/api', (req, res) => {
  res.json({
    message: 'NewNewMusic API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      songs: '/api/songs',
      playlists: '/api/playlists',
      comments: '/api/comments',
      uploads: '/uploads',
      health: '/health'
    },
    documentation: {
      users: {
        'POST /api/users/register': '用户注册',
        'POST /api/users/login': '用户登录',
        'GET /api/users/profile': '获取个人资料',
        'PUT /api/users/profile': '更新个人资料',
        'POST /api/users/:userId/follow': '关注用户',
        'DELETE /api/users/:userId/follow': '取消关注',
        'GET /api/users/:userId/followers': '获取粉丝列表',
        'GET /api/users/:userId/following': '获取关注列表',
        'GET /api/users/search': '搜索用户'
      },
      songs: {
        'GET /api/songs': '获取歌曲列表',
        'GET /api/songs/:songId': '获取单个歌曲',
        'POST /api/songs': '创建歌曲',
        'PUT /api/songs/:songId': '更新歌曲',
        'DELETE /api/songs/:songId': '删除歌曲',
        'POST /api/songs/:songId/favorite': '添加收藏',
        'DELETE /api/songs/:songId/favorite': '移除收藏',
        'GET /api/songs/favorites': '获取收藏列表',
        'GET /api/songs/:songId/stream': '流式传输歌曲'
      },
      playlists: {
        'GET /api/playlists': '获取公共播放列表',
        'GET /api/playlists/:playlistId': '获取单个播放列表',
        'POST /api/playlists': '创建播放列表',
        'PUT /api/playlists/:playlistId': '更新播放列表',
        'DELETE /api/playlists/:playlistId': '删除播放列表',
        'POST /api/playlists/:playlistId/songs': '添加歌曲到播放列表',
        'DELETE /api/playlists/:playlistId/songs/:songId': '从播放列表移除歌曲',
        'PUT /api/playlists/:playlistId/songs/reorder': '重新排序播放列表歌曲',
        'GET /api/playlists/user/:userId': '获取用户播放列表'
      },
      comments: {
        'GET /api/comments/song/:songId': '获取歌曲评论',
        'GET /api/comments/:commentId/replies': '获取评论回复',
        'POST /api/comments': '创建评论',
        'PUT /api/comments/:commentId': '更新评论',
        'DELETE /api/comments/:commentId': '删除评论',
        'POST /api/comments/:commentId/like': '点赞/取消点赞评论',
        'GET /api/comments/user/:userId': '获取用户评论'
      }
    }
  });
});

// 404处理
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

module.exports = router;