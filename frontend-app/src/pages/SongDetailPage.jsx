import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/authContext';
import CommentSection from '../components/CommentSection';
import { PlayIcon, PauseIcon, HeartIcon, ArrowLeftIcon, ShareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import authService from '../services/authService';

const SongDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    songs, 
    currentSong, 
    isPlaying, 
    playSong, 
    pauseSong, 
    addFavorite, 
    removeFavorite, 
    isFavorite 
  } = usePlayer();
  
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSongDetails();
    }
    if (currentUser) {
      fetchPlaylists();
    }
  }, [id, currentUser]);

  const fetchPlaylists = async () => {
    try {
      const response = await authService.getMyPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const handleAddToPlaylist = () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    setShowPlaylistModal(true);
  };

  const addSongToPlaylist = async (playlistId) => {
    try {
      await authService.addSongToPlaylist(playlistId, song.id);
      alert('歌曲已添加到播放列表');
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      alert('添加失败，请重试');
    }
  };

  const fetchSongDetails = async () => {
    try {
      // 首先尝试从本地songs中查找
      const localSong = songs.find(s => s.id === id);
      if (localSong) {
        setSong(localSong);
        setLoading(false);
        return;
      }

      // 如果本地没有，从API获取
      const response = await fetch(`/api/songs/${id}`);
      if (response.ok) {
        const songData = await response.json();
        setSong(songData);
      } else {
        console.error('Song not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching song details:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!song) return;
    
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      const songIndex = songs.findIndex(s => s.id === song.id);
      playSong(song, songIndex >= 0 ? songIndex : 0);
    }
  };

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      alert('请先登录后再收藏歌曲');
      return;
    }
    
    if (isFavorite(song.id)) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `听听这首歌：${song.title} - ${Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('链接已复制到剪贴板');
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-4">歌曲未找到</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const artist = Array.isArray(song.artist) ? song.artist.join(', ') : song.artist;
  const isCurrentSong = currentSong?.id === song.id;
  const isFav = isFavorite(song.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-card-bg transition-colors mr-4"
          >
            <ArrowLeftIcon className="w-6 h-6 text-primary-text" />
          </button>
          <h1 className="text-2xl font-bold text-primary-text">歌曲详情</h1>
        </div>

        {/* Song Info Card */}
        <div className="bg-card-bg rounded-2xl p-8 mb-8 border border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Album Art Placeholder */}
            <div className="w-48 h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-800 dark:to-secondary-800 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-24 h-24 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>

            {/* Song Details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-primary-text mb-2">{song.title}</h2>
              <p className="text-xl text-secondary-text mb-4">{artist}</p>
              
              {song.album && (
                <p className="text-secondary-text mb-2">专辑: {song.album}</p>
              )}
              
              <p className="text-secondary-text mb-6">时长: {formatDuration(song.duration)}</p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                >
                  {isCurrentSong && isPlaying ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                  <span>{isCurrentSong && isPlaying ? '暂停' : '播放'}</span>
                </button>

                <button
                  onClick={handleAddToPlaylist}
                  className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-400 dark:hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-full transition-colors ${
                    isFav
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {isFav ? (
                    <HeartIconSolid className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection songId={song.id} />
      </div>

      {/* Playlist Selection Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              选择播放列表
            </h3>
            
            {playlists.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                您还没有创建任何播放列表
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => addSongToPlaylist(playlist.id)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {playlist.name}
                    </div>
                    {playlist.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {playlist.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongDetailPage;