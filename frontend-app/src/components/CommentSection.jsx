import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import { StarIcon, ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import authService from '../services/authService';
import CommentForm from './CommentForm';

const StarRating = ({ rating, readonly = true }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="cursor-default"
          disabled
        >
          {star <= rating ? (
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
};

const CommentSection = ({ songId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState({ averageRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  // 移除userComment状态，允许用户重复评论

  useEffect(() => {
    if (songId) {
      fetchComments();
      fetchRating();
    }
  }, [songId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/song/${songId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/comments/song/${songId}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRating(data);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleSubmitNewComment = useCallback(async (comment) => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.authHeader()
        },
        body: JSON.stringify({
          songId: songId,
          content: comment.content,
          rating: comment.rating
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prevComments => [data, ...prevComments]);
        setShowCommentForm(false);
        fetchRating();
      } else {
        console.error('Failed to submit comment');
        alert('评论失败');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('评论失败');
    }
  }, [currentUser, songId]);

  const handleUpdateComment = useCallback(async (comment) => {
    try {
      const response = await fetch(`/api/comments/${editingCommentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.authHeader()
        },
        body: JSON.stringify({
          content: comment.content,
          rating: comment.rating
        })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prevComments => 
          prevComments.map(c => c.id === editingCommentId ? updatedComment : c)
        );
        setEditingCommentId(null);
        fetchRating();
      } else {
        console.error('Failed to update comment');
        alert('更新评论失败');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('更新评论失败');
    }
  }, [editingCommentId]);

  const handleCancelNewComment = useCallback(() => {
    setShowCommentForm(false);
  }, []);

  const handleCancelEditComment = useCallback(() => {
    setEditingCommentId(null);
  }, []);

  const deleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          ...authService.authHeader()
        }
      });

      if (response.ok) {
        setComments(prevComments => prevComments.filter(c => c.id !== commentId));
        fetchRating();
      } else {
        console.error('Failed to delete comment');
        alert('删除评论失败');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('删除评论失败');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-card-bg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-text mb-4">评分与评论</h3>
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {rating.averageRating ? rating.averageRating.toFixed(1) : '0.0'}
            </div>
            <StarRating rating={Math.round(rating.averageRating || 0)} />
            <div className="text-sm text-secondary-text mt-1">
              {rating.totalRatings} 个评分
            </div>
          </div>
        </div>
        
        {currentUser && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>写评论</span>
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <CommentForm
          onSubmit={handleSubmitNewComment}
          onCancel={handleCancelNewComment}
        />
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card-bg rounded-lg p-4 border border-border">
              {editingCommentId === comment.id ? (
                <CommentForm
                  initialComment={{ content: comment.content, rating: comment.rating }}
                  onSubmit={handleUpdateComment}
                  onCancel={handleCancelEditComment}
                  isEditing
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {comment.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-primary-text">{comment.username}</div>
                        <div className="flex items-center space-x-2">
                          <StarRating rating={comment.rating} />
                          <span className="text-sm text-secondary-text">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {currentUser && currentUser.id === comment.userId && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingCommentId(comment.id)}
                          className="p-1 text-secondary-text hover:text-primary transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-primary-text">{comment.content}</p>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 text-secondary-text mx-auto mb-3" />
            <p className="text-secondary-text">暂无评论，来写第一条评论吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;