const { Comment, User, Song } = require('../models');
const mongoose = require('mongoose');

class CommentController {
  // Create new comment
  async createComment(req, res) {
    try {
      const { content, parentId } = req.body;
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

      // If parentId is provided, check if parent comment exists
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }

        // Ensure parent comment belongs to the same song
        if (parentComment.songId.toString() !== songId) {
          return res.status(400).json({
            success: false,
            message: 'Parent comment does not belong to this song'
          });
        }
      }

      const comment = new Comment({
        content,
        userId,
        songId,
        parentId: parentId || null
      });

      await comment.save();

      // Populate user information
      const populatedComment = await Comment.findById(comment._id)
        .populate('userId', 'username');

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: populatedComment.toResponse(populatedComment.userId.username)
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment',
        error: error.message
      });
    }
  }

  // Get comments for a song
  async getSongComments(req, res) {
    try {
      const { songId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Check if song exists
      const song = await Song.findById(songId);
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }

      // Get top-level comments (no parent)
      const [comments, total] = await Promise.all([
        Comment.find({ 
          songId, 
          parentId: null, 
          isDeleted: false 
        })
          .populate('userId', 'username')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Comment.countDocuments({ 
          songId, 
          parentId: null, 
          isDeleted: false 
        })
      ]);

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await Comment.find({
            parentId: comment._id,
            isDeleted: false
          })
            .populate('userId', 'username')
            .sort({ createdAt: 1 })
            .limit(10); // Limit replies to prevent excessive data

          const repliesData = replies.map(reply => 
            reply.toResponse(reply.userId.username)
          );

          return comment.toResponse(comment.userId.username, repliesData);
        })
      );

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          comments: commentsWithReplies,
          pagination: {
            page,
            limit,
            total,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get song comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get comments',
        error: error.message
      });
    }
  }

  // Get replies for a comment
  async getCommentReplies(req, res) {
    try {
      const { commentId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Check if parent comment exists
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      const [replies, total] = await Promise.all([
        Comment.find({ 
          parentId: commentId, 
          isDeleted: false 
        })
          .populate('userId', 'username')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: 1 }),
        Comment.countDocuments({ 
          parentId: commentId, 
          isDeleted: false 
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          replies: replies.map(reply => 
            reply.toResponse(reply.userId.username)
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
      console.error('Get comment replies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get replies',
        error: error.message
      });
    }
  }

  // Update comment
  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Check if comment exists and user owns it
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own comments'
        });
      }

      if (comment.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update deleted comment'
        });
      }

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true, runValidators: true }
      ).populate('userId', 'username');

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment.toResponse(updatedComment.userId.username)
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error.message
      });
    }
  }

  // Delete comment
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      // Check if comment exists and user owns it
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own comments'
        });
      }

      // Soft delete - mark as deleted instead of removing
      await Comment.findByIdAndUpdate(
        commentId,
        { 
          isDeleted: true,
          content: '[This comment has been deleted]'
        }
      );

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error.message
      });
    }
  }

  // Like/Unlike comment
  async toggleCommentLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      // Check if comment exists
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Cannot like deleted comment'
        });
      }

      const isLiked = comment.likes.includes(userId);
      let updatedComment;

      if (isLiked) {
        // Unlike comment
        updatedComment = await Comment.findByIdAndUpdate(
          commentId,
          { $pull: { likes: userId } },
          { new: true }
        );
      } else {
        // Like comment
        updatedComment = await Comment.findByIdAndUpdate(
          commentId,
          { $addToSet: { likes: userId } },
          { new: true }
        );
      }

      res.json({
        success: true,
        message: isLiked ? 'Comment unliked' : 'Comment liked',
        data: {
          isLiked: !isLiked,
          likesCount: updatedComment.likes.length
        }
      });
    } catch (error) {
      console.error('Toggle comment like error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle comment like',
        error: error.message
      });
    }
  }

  // Get user's comments
  async getUserComments(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const [comments, total] = await Promise.all([
        Comment.find({ 
          userId, 
          isDeleted: false 
        })
          .populate('userId', 'username')
          .populate('songId', 'title artist')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Comment.countDocuments({ 
          userId, 
          isDeleted: false 
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          comments: comments.map(comment => ({
            ...comment.toResponse(comment.userId.username),
            song: {
              id: comment.songId._id,
              title: comment.songId.title,
              artist: comment.songId.artist
            }
          })),
          pagination: {
            page,
            limit,
            total,
            pages: totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get user comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user comments',
        error: error.message
      });
    }
  }
}

module.exports = new CommentController();