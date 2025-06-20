import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { usePlayer } from '../contexts/PlayerContext';
import { PlayIcon, PauseIcon, PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentSong, isPlaying, playSong, pauseSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaylistDetail();
  }, [id]);

  const fetchPlaylistDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/playlists/${id}`, {
        headers: authService.authHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data);
        
        // 获取歌单中的歌曲详情
        if (data.songs && data.songs.length > 0) {
          const songsResponse = await fetch(`/api/playlists/${id}/songs`, {
            headers: authService.authHeader()
          });
          
          if (songsResponse.ok) {
            const songsData = await songsResponse.json();
            setSongs(songsData);
          }
        }
      } else {
        setError('歌单不存在或无权访问');
      }
    } catch (error) {
      console.error('Error fetching playlist detail:', error);
      setError('获取歌单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0]);
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
      console.error('Error removing song from playlist:', error);
      alert('移除失败，请重试');
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
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          返回歌单列表
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.user?.id === playlist?.ownerId;

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
            <div className="flex items-center space-x-4 text-sm text-secondary-text">
              <span>{songs.length} 首歌曲</span>
              <span>创建者: {playlist?.ownerName}</span>
              {playlist?.isPublic ? (
                <span className="text-green-500">公开</span>
              ) : (
                <span className="text-yellow-500">私有</span>
              )}
            </div>
            {playlist?.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(Array.isArray(playlist.tags) ? playlist.tags : playlist.tags.split(',')).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
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
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlayIcon className="w-5 h-5" />
                <span>播放全部</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-card-bg rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary-text">歌曲列表</h2>
        </div>
        
        {songs.length > 0 ? (
          <div className="divide-y divide-border">
            {songs.map((song, index) => (
              <div key={song.id} className="p-4 hover:bg-hover-bg transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 text-center text-secondary-text">
                    {index + 1}
                  </div>
                  
                  <button
                    onClick={() => handlePlaySong(song)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <PauseIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <PlayIcon className="w-5 h-5 text-primary" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary-text truncate">{song.title}</h3>
                    <p className="text-sm text-secondary-text truncate">{song.artist}</p>
                  </div>
                  
                  <div className="flex-shrink-0 text-sm text-secondary-text">
                    {song.duration}
                  </div>
                  
                  {isOwner && (
                    <button
                      onClick={() => removeSongFromPlaylist(song.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-500/10 transition-colors"
                      title="从歌单中移除"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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