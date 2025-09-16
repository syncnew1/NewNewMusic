import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { usePlayer } from '../contexts/PlayerContext';
import { PlayIcon, PauseIcon, PlusIcon, TrashIcon, ArrowLeftIcon, ShareIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/solid';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import authService from '../services/authService';
import followService from '../services/followService';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentSong, isPlaying, playSong, pauseSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });

  useEffect(() => {
    fetchPlaylistDetail();
  }, [id]);

  useEffect(() => {
    if (playlist && playlist.ownerId && currentUser && playlist.ownerId.id !== currentUser.user.id) {
      checkFollowStatus();
      fetchFollowStats();
    }
  }, [playlist, currentUser]);

  const fetchPlaylistDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/playlists/${id}`, {
        headers: authService.authHeader()
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPlaylist(result.data);
          setSongs(result.data.songs || []);
        } else {
          setError('歌单数据格式错误');
        }
      } else {
        setError('歌单不存在或无权访问');
      }
    } catch (error) {
      setError('获取歌单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    // 为歌曲添加音频URL
    const songWithAudio = {
      ...song,
      audioUrl: `/api/songs/${song.id}/stream`
    };
    
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong(songWithAudio);
    }
  };

  // 检查关注状态
  const checkFollowStatus = async () => {
    try {
      const response = await followService.checkFollowStatus(playlist.ownerId.id);
      if (response.data.success) {
        setIsFollowing(response.data.data.isFollowing);
      }
    } catch (error) {
      // 静默处理关注状态检查失败
    }
  };

  // 获取关注统计
  const fetchFollowStats = async () => {
    try {
      const response = await followService.getUserStats(playlist.ownerId.id);
      if (response.data.success) {
        setFollowStats(response.data.data);
      }
    } catch (error) {
      // 静默处理关注统计获取失败
    }
  };

  // 处理关注/取消关注
  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(playlist.ownerId.id);
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        await followService.followUser(playlist.ownerId.id);
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (error) {
      alert(error.response?.data?.message || '操作失败，请重试');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      const songWithAudio = {
        ...songs[0],
        audioUrl: `/api/songs/${songs[0].id}/stream`
      };
      playSong(songWithAudio);
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    try {
      const response = await fetch(`/api/playlists/${id}/songs/${songId}`, {
        method: 'DELETE',
        headers: authService.authHeader()
      });
      
      if (response.ok) {
        setSongs(songs.filter(song => song.id !== songId));
        alert('歌曲已从歌单中移除');
      } else {
        alert('移除失败，请重试');
      }
    } catch (error) {
      alert('移除失败，请重试');
    }
  };

  const handleSharePlaylist = async () => {
    try {
      const shareUrl = `${window.location.origin}/playlists/${id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: playlist.name,
          text: `分享歌单：${playlist.name}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('歌单链接已复制到剪贴板');
      }
    } catch (error) {
      alert('分享失败，请重试');
    }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // 更新本地状态
    setSongs(items);
    
    // 调用后端API更新排序
    try {
      const songIds = items.map(song => song.id);
      const response = await fetch(`/api/playlists/${id}/songs/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songIds })
      });
      
      if (!response.ok) {
        // 如果失败，恢复原来的顺序
        fetchPlaylistDetail();
      }
    } catch (error) {
      // 如果失败，恢复原来的顺序
      fetchPlaylistDetail();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-secondary-text">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/playlists')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回歌单列表
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.user?.id === playlist?.ownerId?.id;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/playlists')}
          className="flex items-center space-x-2 text-secondary-text hover:text-primary-text transition-colors mr-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>返回</span>
        </button>
      </div>

      {/* Playlist Info */}
      <div className="bg-card-bg rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-text mb-2">{playlist?.name}</h1>
            {playlist?.description && (
              <p className="text-secondary-text mb-4">{playlist.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-secondary-text mb-3">
              <span>{songs.length} 首歌曲</span>
              <span>创建者: {playlist?.ownerName}</span>
              {playlist?.isPublic ? (
                <span className="text-green-500">公开</span>
              ) : (
                <span className="text-yellow-500">私有</span>
              )}
            </div>
            
            {/* 创建者信息和关注按钮 */}
            {playlist?.ownerId && currentUser && playlist.ownerId.id !== currentUser.user.id && (
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-secondary-text">
                  <span>粉丝: {followStats.followersCount}</span>
                  <span>关注: {followStats.followingCount}</span>
                </div>
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                  } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {followLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <UserMinusIcon className="w-4 h-4" />
                  ) : (
                    <UserPlusIcon className="w-4 h-4" />
                  )}
                  <span>{followLoading ? '处理中...' : isFollowing ? '取消关注' : '关注'}</span>
                </button>
              </div>
            )}
            {playlist?.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(Array.isArray(playlist.tags) ? playlist.tags : playlist.tags.split(',')).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full"
                  >
                    {typeof tag === 'string' ? tag.trim() : tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            {songs.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent-color to-purple-500 text-white rounded-xl hover:from-accent-color/90 hover:to-purple-500/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PlayIcon className="w-4 h-4" />
                <span>播放全部</span>
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => navigate('/search?addToPlaylist=' + id)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5" />
                <span>添加歌曲</span>
              </button>
            )}
            <button
              onClick={handleSharePlaylist}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ShareIcon className="w-5 h-5" />
              <span>分享</span>
            </button>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-card-bg rounded-xl shadow-lg border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10">
          <h2 className="text-xl font-bold text-primary-text flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V3zM8 15V9l6 3-6 3z" />
            </svg>
            <span>歌曲列表</span>
            <span className="text-sm font-normal text-secondary-text bg-blue-100/50 dark:bg-blue-800/30 px-2 py-1 rounded-full">({songs.length})</span>
          </h2>
        </div>
        
        {songs.length > 0 ? (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="playlist-songs">
              {(provided) => (
                <div 
                  className="divide-y divide-border/30 bg-gradient-to-b from-transparent to-blue-50/10 dark:to-blue-900/5"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {songs.map((song, index) => (
                    <Draggable key={song.id} draggableId={song.id.toString()} index={index} isDragDisabled={!isOwner}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative p-3 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 ease-in-out hover:shadow-md rounded-lg mx-1 my-0.5 ${
                            currentSong?.id === song.id ? 'bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-800/40 dark:to-indigo-800/40 ring-2 ring-blue-400/50 shadow-lg' : ''
                          } ${
                            snapshot.isDragging ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/60 dark:to-indigo-800/60 shadow-xl scale-105 rotate-1' : ''
                          }`}
                        >
                          {/* Current Song Indicator */}
                          {currentSong?.id === song.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full shadow-sm" />
                          )}
                          <div className="flex items-center space-x-2">
                            {/* Drag Handle */}
                            {isOwner && (
                              <div 
                                {...provided.dragHandleProps}
                                className="flex-shrink-0 w-8 text-center text-secondary-text cursor-grab active:cursor-grabbing hover:text-primary-text transition-colors"
                              >
                                <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="flex-shrink-0 w-8 text-center text-secondary-text">
                              {index + 1}
                            </div>
                            
                            {/* Song Cover */}
                            <div className="relative group">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 via-indigo-500/30 to-purple-500/30 dark:from-blue-400/30 dark:via-indigo-400/30 dark:to-purple-400/30 rounded-lg flex items-center justify-center border border-blue-200/50 dark:border-blue-600/30 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-300 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M18 3a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V3zM8 15V9l6 3-6 3z" />
                                </svg>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-0.5">
                               <h3 className="font-semibold text-primary-text truncate text-base leading-tight">{song.title}</h3>
                               <p className="text-sm text-secondary-text/80 truncate">{song.artist}</p>
                             </div>
                            
                            <div className="flex-shrink-0 text-xs text-secondary-text/70 font-mono bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                              {song.duration}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                              {/* Play Button */}
                              <button
                                onClick={() => handlePlaySong(song)}
                                className={`group relative p-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md ${
                                  currentSong?.id === song.id
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/25'
                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/70 dark:hover:to-indigo-800/70'
                                }`}
                                aria-label="Play song"
                              >
                                <div className="relative z-10">
                                  {currentSong?.id === song.id && isPlaying ? (
                                    <PauseIcon className="w-4 h-4" />
                                  ) : (
                                    <PlayIcon className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </button>
                              
                              {isOwner && (
                                <button
                                  onClick={() => removeSongFromPlaylist(song.id)}
                                  className="group relative p-2 rounded-lg text-red-500 hover:text-red-600 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100/70 dark:hover:bg-red-900/40 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                                  title="从歌单中移除"
                                >
                                  <div className="relative z-10">
                                    <TrashIcon className="w-4 h-4" />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="p-12 text-center">
            <div className="text-secondary-text mb-4">这个歌单还没有歌曲</div>
            {isOwner && (
              <p className="text-sm text-secondary-text">去主页添加一些喜欢的歌曲到这个歌单吧！</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;