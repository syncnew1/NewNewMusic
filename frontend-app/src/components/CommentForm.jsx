import React, { useState, useCallback } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          disabled={readonly}
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

const CommentForm = ({ initialComment = { content: '', rating: 5 }, onSubmit, onCancel, isEditing = false }) => {
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(comment);
  }, [comment, onSubmit]);

  const handleRatingChange = useCallback((rating) => {
    setComment(prev => ({ ...prev, rating }));
  }, []);

  const handleContentChange = useCallback((e) => {
    setComment(prev => ({ ...prev, content: e.target.value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg rounded-lg p-4 border border-border">
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary-text mb-2">
          评分
        </label>
        <StarRating
          rating={comment.rating}
          onRatingChange={handleRatingChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary-text mb-2">
          评论内容
        </label>
        <textarea
          value={comment.content}
          onChange={handleContentChange}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
          placeholder="分享您对这首歌的看法..."
          required
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-lg text-secondary-text hover:text-primary-text transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isEditing ? '更新' : '发布'}评论
        </button>
      </div>
    </form>
  );
};

export default CommentForm;