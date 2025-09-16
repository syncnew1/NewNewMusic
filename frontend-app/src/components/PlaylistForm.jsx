import React, { useState, useCallback } from 'react';

const PlaylistForm = ({ onSubmit, onCancel, initialPlaylist = null, loading = false }) => {
  const [playlist, setPlaylist] = useState({
    name: initialPlaylist?.name || '',
    description: initialPlaylist?.description || '',
    tags: initialPlaylist?.tags || '',
    isPublic: initialPlaylist?.isPublic || false
  });

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setPlaylist(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!playlist.name.trim()) {
      alert('请输入歌单名称');
      return;
    }
    
    // Convert tags string to array
    const playlistData = {
      ...playlist,
      tags: playlist.tags ? playlist.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    
    onSubmit(playlistData);
  }, [playlist, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-primary-text mb-4">
        {initialPlaylist ? '编辑歌单' : '创建新歌单'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            歌单名称 *
          </label>
          <input
            type="text"
            name="name"
            value={playlist.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入歌单名称"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            歌单描述
          </label>
          <textarea
            name="description"
            value={playlist.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="描述您的歌单..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            标签
          </label>
          <input
            type="text"
            name="tags"
            value={playlist.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="用逗号分隔多个标签"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            checked={playlist.isPublic}
            onChange={handleInputChange}
            className="mr-2 rounded border-border text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-primary-text">
            公开歌单
          </label>
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-lg text-secondary-text hover:text-primary-text transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-accent-color to-purple-500 text-white hover:from-accent-color/90 hover:to-purple-500/90 transform hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{initialPlaylist ? '更新中...' : '创建中...'}</span>
            </div>
          ) : (
            `${initialPlaylist ? '更新' : '创建'}歌单`
          )}
        </button>
      </div>
    </form>
  );
};

export default PlaylistForm;