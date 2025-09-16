import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import { PlusIcon, MusicalNoteIcon, EyeIcon, LockClosedIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';
import PlaylistForm from '../components/PlaylistForm';
import PlaylistModal from '../components/PlaylistModal';

const PlaylistsPage = () => {
  const { currentUser } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'delete'
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [operationLoading, setOperationLoading] = useState({});

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authService.getPublicPlaylists();
      // 根据后端API响应结构调整数据解析
        if (response.data && response.data.success) {
          const playlistsData = response.data.data?.playlists || response.data.data || [];
          setPlaylists(playlistsData);
      } else {
        setPlaylists(response.data || []);
      }
    } catch (error) {
      setPlaylists([]);
      // 显示错误提示
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMsg.textContent = '获取歌单失败，请刷新页面重试';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreatePlaylist = async (playlistData) => {
    try {
      await authService.createPlaylist(playlistData);
      setShowCreateForm(false);
      fetchPlaylists();
    } catch (error) {
      // 处理创建歌单失败
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleEditPlaylist = (e, playlist) => {
    e.stopPropagation(); // 防止触发卡片点击事件
    setSelectedPlaylist(playlist);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeletePlaylist = (e, playlist) => {
    e.stopPropagation(); // 防止触发卡片点击事件
    setSelectedPlaylist(playlist);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleUpdatePlaylist = async (playlistData) => {
    setOperationLoading(prev => ({ ...prev, [selectedPlaylist.id]: true }));
    try {
      const response = await authService.updatePlaylist(selectedPlaylist.id, playlistData);
      if (response.data && response.data.success) {
        setShowModal(false);
        setSelectedPlaylist(null);
        fetchPlaylists();
        // 显示成功提示
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successMsg.textContent = '歌单更新成功！';
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);
      } else {
        throw new Error(response.data?.message || '更新失败');
      }
    } catch (error) {
      // 更新歌单失败
      // 显示错误提示
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMsg.textContent = error.response?.data?.message || error.message || '更新歌单失败，请重试';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setOperationLoading(prev => ({ ...prev, [selectedPlaylist.id]: false }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlaylist(null);
  };

  const handleConfirmDelete = async (playlistId, playlistName) => {
    setOperationLoading(prev => ({ ...prev, [playlistId]: true }));
    try {
      const response = await authService.deletePlaylist(playlistId);
      if (response.data && response.data.success) {
        setShowModal(false);
        setSelectedPlaylist(null);
        fetchPlaylists();
        // 显示成功提示
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successMsg.textContent = `歌单「${playlistName}」已删除`;
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);
      } else {
        throw new Error(response.data?.message || '删除失败');
      }
    } catch (error) {
      // 删除歌单失败
      // 显示错误提示
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMsg.textContent = error.response?.data?.message || error.message || '删除歌单失败，请重试';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setOperationLoading(prev => ({ ...prev, [playlistId]: false }));
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
    <div className="min-h-screen bg-gradient-to-br from-primary-bg via-surface to-surface-variant">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-color to-purple-500 bg-clip-text text-transparent mb-2">
              我的歌单
            </h1>
            <p className="text-secondary-text text-lg">管理和创建你的音乐收藏</p>
          </div>
          {currentUser && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-accent-color to-purple-500 text-white font-semibold rounded-xl hover:from-accent-color/90 hover:to-purple-500/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>创建歌单</span>
            </button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-12 animate-fade-in">
            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl border border-border-color/50 shadow-xl p-6">
              <h2 className="text-xl font-semibold text-primary-text mb-4 flex items-center">
                <MusicalNoteIcon className="w-6 h-6 mr-2 text-accent-color" />
                创建新歌单
              </h2>
              <PlaylistForm
                onSubmit={handleCreatePlaylist}
                onCancel={handleCancelCreate}
              />
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {playlists.length > 0 ? (
            playlists.map((playlist, index) => (
              <div 
                key={playlist.id} 
                className="group bg-card-bg/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border-color/30 hover:border-accent-color/50 hover:shadow-xl hover:shadow-accent-color/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer flex flex-col h-full"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => window.location.href = `/playlist/${playlist.id}`}
              >
                {/* 移除内联编辑，统一使用弹窗 */}
                {(
                  <>
                    <div className="aspect-square bg-gradient-to-br from-accent-color/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center relative overflow-hidden group-hover:scale-102 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-color/10 to-purple-600/10 group-hover:from-accent-color/20 group-hover:to-purple-600/20 transition-all duration-300"></div>
                      <MusicalNoteIcon className="w-12 h-12 text-accent-color group-hover:text-purple-500 transition-colors duration-300 relative z-10 drop-shadow-lg" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-base text-primary-text truncate flex-1 group-hover:text-accent-color transition-colors duration-300">
                          {playlist.name}
                        </h3>
                        <div className="flex items-center space-x-1 ml-2">
                          {playlist.isPublic ? (
                            <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                              <EyeIcon className="w-3 h-3 text-green-600" title="公开" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                              <LockClosedIcon className="w-3 h-3 text-gray-600" title="私有" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="min-h-[2.5rem] mb-3">
                        {playlist.description && (
                          <p className="text-secondary-text text-sm line-clamp-2 leading-relaxed">
                            {playlist.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="min-h-[2rem] mb-4">
                        {playlist.tags && playlist.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(playlist.tags) ? playlist.tags : playlist.tags.split(',')).slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gradient-to-r from-accent-color/10 to-purple-500/10 text-accent-color text-xs rounded-full border border-accent-color/20 font-medium"
                              >
                                #{typeof tag === 'string' ? tag.trim() : tag}
                              </span>
                            ))}
                            {(Array.isArray(playlist.tags) ? playlist.tags : playlist.tags.split(',')).length > 2 && (
                              <span className="text-secondary-text text-xs px-2 py-0.5 bg-gray-100 rounded-full">+{(Array.isArray(playlist.tags) ? playlist.tags : playlist.tags.split(',')).length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-secondary-text mb-3 bg-gray-50/50 rounded-lg p-2 mt-auto">
                        <div className="flex items-center space-x-1">
                          <MusicalNoteIcon className="w-3 h-3" />
                          <span className="font-medium">{playlist.songCount || 0} 首</span>
                        </div>
                        <span className="text-xs truncate max-w-20">by {playlist.username}</span>
                      </div>
                      
                      {(() => {
                          const ownerIdString = typeof playlist.ownerId === 'object' ? 
                            (playlist.ownerId._id || playlist.ownerId.id || playlist.ownerId) : 
                            playlist.ownerId;
                          const isOwner = currentUser && currentUser.user && currentUser.user.id === ownerIdString;
                          // 简化权限：只有歌单所有者才能进行所有操作
                          return isOwner;
                        })() && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => handleEditPlaylist(e, playlist)}
                            disabled={operationLoading[playlist.id]}
                            className={`flex-1 px-2 py-1.5 text-white text-xs font-medium rounded-md transition-all duration-300 flex items-center justify-center space-x-1 ${
                              operationLoading[playlist.id] 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-accent-color to-purple-500 hover:from-accent-color/90 hover:to-purple-500/90 transform hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {operationLoading[playlist.id] ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <PencilIcon className="w-3 h-3" />
                            )}
                            <span>{operationLoading[playlist.id] ? '更新中...' : '编辑'}</span>
                          </button>
                          <button
                            onClick={(e) => handleDeletePlaylist(e, playlist)}
                            disabled={operationLoading[playlist.id]}
                            className={`flex-1 px-2 py-1.5 text-white text-xs font-medium rounded-md transition-all duration-300 flex items-center justify-center space-x-1 ${
                              operationLoading[playlist.id] 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {operationLoading[playlist.id] ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <TrashIcon className="w-3 h-3" />
                            )}
                            <span>{operationLoading[playlist.id] ? '删除中...' : '删除'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-color/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <MusicalNoteIcon className="w-12 h-12 text-accent-color" />
              </div>
              <h3 className="text-xl font-bold text-primary-text mb-3">还没有歌单</h3>
              <p className="text-secondary-text mb-6 max-w-md text-sm">
                创建你的第一个歌单，开始收藏你喜欢的音乐吧！
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-accent-color to-purple-500 text-white font-medium rounded-xl hover:from-accent-color/90 hover:to-purple-500/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>创建歌单</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={showModal}
        onClose={handleCloseModal}
        playlist={selectedPlaylist}
        mode={modalMode}
        onEdit={handleUpdatePlaylist}
        onDelete={handleConfirmDelete}
        loading={selectedPlaylist ? operationLoading[selectedPlaylist.id] : false}
      />
    </div>
  );
};

export default PlaylistsPage;