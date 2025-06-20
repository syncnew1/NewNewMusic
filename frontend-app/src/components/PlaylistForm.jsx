import React, { useState, useCallback } from 'react';

const PlaylistForm = ({ onSubmit, onCancel, initialPlaylist = null }) => {
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
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg bg-input-bg text-primary-text focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="用逗号分隔多个标签"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            checked={playlist.isPublic}
            onChange={handleInputChange}
            className="mr-2 rounded border-border text-primary focus:ring-primary"
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
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {initialPlaylist ? '更新' : '创建'}歌单
        </button>
      </div>
    </form>
  );
};

export default PlaylistForm;