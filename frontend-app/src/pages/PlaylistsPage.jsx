import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import { PlusIcon, MusicalNoteIcon, EyeIcon, LockClosedIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';
import PlaylistForm from '../components/PlaylistForm';

const PlaylistsPage = () => {
  const { currentUser } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await authService.getMyPlaylists();
      if (response.data && response.data.success) {
        setPlaylists(response.data.data.playlists || []);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = useCallback(async (playlistData) => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.authHeader()
        },
        body: JSON.stringify(playlistData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        if (result.data) {
          setPlaylists(prevPlaylists => [result.data, ...prevPlaylists]);
          setShowCreateForm(false);
        }
      } else {
        console.error('Failed to create playlist');
        alert(result.message || '创建歌单失败，请重试');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('网络错误，请检查连接后重试');
    }
  }, [currentUser]);

  const handleUpdatePlaylist = useCallback(async (playlistData) => {
    try {
      const response = await fetch(`/api/playlists/${editingPlaylistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.authHeader()
        },
        body: JSON.stringify(playlistData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        if (result.data) {
          setPlaylists(prevPlaylists => 
            prevPlaylists.map(p => p.id === editingPlaylistId ? result.data : p)
          );
          setEditingPlaylistId(null);
          setEditingPlaylist(null);
        }
      } else {
        console.error('Failed to update playlist');
        alert(result.message || '更新歌单失败，请重试');
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('网络错误，请检查连接后重试');
    }
  }, [editingPlaylistId]);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPlaylistId(null);
    setEditingPlaylist(null);
  }, []);

  const handleEditPlaylist = useCallback((playlist) => {
    setEditingPlaylistId(playlist.id);
    setEditingPlaylist({
      name: playlist.name,
      description: playlist.description || '',
      tags: playlist.tags || '',
      isPublic: playlist.isPublic
    });
  }, []);

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('确定要删除这个歌单吗？')) return;

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          ...authService.authHeader()
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setPlaylists(prevPlaylists => prevPlaylists.filter(p => p.id !== playlistId));
      } else {
        console.error('Failed to delete playlist');
        alert(result.message || '删除歌单失败，请重试');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('网络错误，请检查连接后重试');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-text">我的歌单</h1>
        {currentUser && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>创建歌单</span>
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-8">
          <PlaylistForm
            onSubmit={handleCreatePlaylist}
            onCancel={handleCancelCreate}
          />
        </div>
      )}

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div key={playlist.id} className="bg-card-bg rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow">
              {editingPlaylistId === playlist.id ? (
                <div className="p-4">
                  <PlaylistForm
                    initialPlaylist={editingPlaylist}
                    onSubmit={handleUpdatePlaylist}
                    onCancel={handleCancelEdit}
                  />
                </div>
              ) : (
                <>
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                     <MusicalNoteIcon className="w-16 h-16 text-primary" />
                   </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-primary-text truncate flex-1">
                        {playlist.name}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        {playlist.isPublic ? (
                          <EyeIcon className="w-4 h-4 text-green-500" title="公开" />
                        ) : (
                          <LockClosedIcon className="w-4 h-4 text-gray-500" title="私有" />
                        )}
                      </div>
                    </div>
                    
                    {playlist.description && (
                      <p className="text-sm text-secondary-text mb-3 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                    
                    {playlist.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {playlist.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-secondary-text mb-3">
                      <span>{playlist.songCount || 0} 首歌曲</span>
                      <span>by {playlist.username}</span>
                    </div>
                    
                    {currentUser && currentUser.id === playlist.userId && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPlaylist(playlist)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-border rounded-lg text-secondary-text hover:text-primary-text hover:border-primary transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => deletePlaylist(playlist.id)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-red-300 rounded-lg text-red-500 hover:text-red-700 hover:border-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>删除</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
             <MusicalNoteIcon className="w-16 h-16 text-secondary-text mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-text mb-2">暂无歌单</h3>
            <p className="text-secondary-text mb-4">创建您的第一个歌单来开始收藏喜欢的音乐</p>
            {currentUser && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>创建歌单</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;