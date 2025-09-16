const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validateCommentCreation,
  validateCommentUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// 公共路由
// 获取歌曲的评论
router.get('/song/:songId', 
  validateObjectId('songId'),
  validatePagination,
  optionalAuth,
  commentController.getSongComments
);

// 获取评论的回复
router.get('/:commentId/replies',
  validateObjectId('commentId'),
  validatePagination,
  optionalAuth,
  commentController.getCommentReplies
);

// 受保护的路由
// 创建评论
router.post('/',
  authenticate,
  validateCommentCreation,
  commentController.createComment
);

// 更新评论
router.put('/:commentId',
  authenticate,
  validateObjectId('commentId'),
  validateCommentUpdate,
  commentController.updateComment
);

// 删除评论
router.delete('/:commentId',
  authenticate,
  validateObjectId('commentId'),
  commentController.deleteComment
);

// 点赞/取消点赞评论
router.post('/:commentId/like',
  authenticate,
  validateObjectId('commentId'),
  commentController.toggleCommentLike
);

// 获取用户的评论
router.get('/user/:userId',
  validateObjectId('userId'),
  validatePagination,
  optionalAuth,
  commentController.getUserComments
);

module.exports = router;