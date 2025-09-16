const express = require('express');
const followController = require('../controllers/followController');
const auth = require('../middleware/auth');

const router = express.Router();

// 所有关注相关的路由都需要认证
router.use(auth.authenticate);

// 关注用户
router.post('/:userId/follow', followController.followUser);

// 取消关注用户
router.delete('/:userId/follow', followController.unfollowUser);

// 获取用户的关注列表
router.get('/:userId/following', followController.getFollowing);

// 获取用户的粉丝列表
router.get('/:userId/followers', followController.getFollowers);

// 检查是否关注某个用户
router.get('/:userId/follow-status', followController.checkFollowStatus);

// 获取用户统计信息
router.get('/:userId/stats', followController.getUserStats);

module.exports = router;