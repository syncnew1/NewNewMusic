import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import { FavoriteIcon } from '../components/Icons';
import '../styles/index.css';

function FavoritesPage() {
  const { theme } = useTheme();
  const { playSong, songs: allSongs, favoriteSongs, removeFavorite, currentSong, isPlaying } = usePlayer();
  const [sortBy, setSortBy] = useState('recent'); // recent, title, artist
  const [viewMode, setViewMode] = useState('list'); // list, grid

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const sortedFavorites = [...favoriteSongs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'artist':
        const artistA = Array.isArray(a.artist) ? a.artist.join(', ') : (a.artist || '');
        const artistB = Array.isArray(b.artist) ? b.artist.join(', ') : (b.artist || '');
        return artistA.localeCompare(artistB);
      case 'recent':
      default:
        return 0; // 保持原有顺序
    }
  });

  const handleSongPlay = (favSong) => {
    const songIndex = allSongs.findIndex(s => s.id === favSong.id);
    if (songIndex !== -1) {
      playSong(favSong, songIndex);
    } else {
      // 收藏歌曲单独播放，因为它不在当前主播放列表中
      playSong(favSong, 0);
    }
  };

  const handleRemoveFavorite = (e, songId) => {
    e.stopPropagation();
    removeFavorite(songId);
  };

  const playAllFavorites = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">我的收藏</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {favoriteSongs.length > 0 ? `${favoriteSongs.length} 首歌曲` : '还没有收藏的歌曲'}
              </p>
            </div>
          </div>
          
          {favoriteSongs.length > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={playAllFavorites}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>播放全部</span>
              </button>
            </div>
          )}

          {/* Controls */}
          {favoriteSongs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-outline-light dark:border-outline-dark p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Sort Options */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">排序:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="recent">最近添加</option>
                    <option value="title">歌曲名称</option>
                    <option value="artist">艺术家</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {favoriteSongs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-outline-light dark:border-outline-dark">
            <div className="text-center py-16 px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">还没有收藏的歌曲</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                在播放歌曲时点击爱心图标来收藏你喜欢的音乐
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg font-medium">
                去发现音乐
              </button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-2'}>
            {sortedFavorites.map((favSong) => (
              viewMode === 'grid' ? (
                // Grid View
                <div
                  key={favSong.id}
                  onClick={() => handleSongPlay(favSong)}
                  className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-surface-variant ${
                    currentSong?.id === favSong.id ? 'bg-accent-color/10 border border-accent-color/20' : 'bg-card-bg hover:bg-surface'
                  }`}
                >
                  <div className="text-center">
                    {/* Album Art */}
                    <div className="relative mb-4">
                      <div className="w-full aspect-square rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      {currentSong?.id === favSong.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          {isPlaying ? (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </div>
                      )}
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleRemoveFavorite(e, favSong.id)}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <FavoriteIcon filled={true} />
                      </button>
                    </div>

                    {/* Song Info */}
                    <h4 className={`font-semibold truncate mb-1 ${
                      currentSong?.id === favSong.id ? 'text-accent-color' : 'text-primary-text'
                    }`}>
                      {favSong.title || 'Unknown Title'}
                    </h4>
                    <p className="text-sm text-secondary-text truncate mb-2">
                      {Array.isArray(favSong.artist) ? favSong.artist.join(', ') : (favSong.artist || 'Unknown Artist')}
                    </p>
                    <p className="text-xs text-secondary-text font-mono">
                      {formatDuration(favSong.duration)}
                    </p>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={favSong.id}
                  onClick={() => handleSongPlay(favSong)}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-surface-variant ${
                    currentSong?.id === favSong.id ? 'bg-accent-color/10 border border-accent-color/20' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Song Cover */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      {currentSong?.id === favSong.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          {isPlaying ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate ${
                        currentSong?.id === favSong.id ? 'text-accent-color' : 'text-primary-text'
                      }`}>
                        {favSong.title || 'Unknown Title'}
                      </h4>
                      <p className="text-sm text-secondary-text truncate">
                        {Array.isArray(favSong.artist) ? favSong.artist.join(', ') : (favSong.artist || 'Unknown Artist')}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-secondary-text font-mono hidden sm:block">
                      {formatDuration(favSong.duration)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleRemoveFavorite(e, favSong.id)}
                        className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200"
                      >
                        <FavoriteIcon filled={true} />
                      </button>
                      
                      <button className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-accent-color text-accent-text-color transition-all duration-200 transform hover:scale-105">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;