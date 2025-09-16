import React, { useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import { FavoriteIcon } from '../components/Icons';
import { PlusIcon } from '@heroicons/react/24/outline';
import '../styles/index.css';

function FavoritesPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { playSong, songs: allSongs, favoriteSongs, removeFavorite, currentSong, isPlaying } = usePlayer();
  const [sortBy, setSortBy] = useState('recent'); // recent, title, artist

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

<<<<<<< HEAD
  const handleSongClick = (e, favSong) => {
    // 如果点击的是收藏按钮，不执行跳转
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/song/${favSong.id}`);
  };

=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
  const playAllFavorites = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] pb-24">
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
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg font-medium"
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
            <div className="bg-white dark:bg-[#0f1116] rounded-2xl shadow-lg border border-outline-light dark:border-violet-600/30 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Sort Options */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">排序:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="recent">最近添加</option>
                    <option value="title">歌曲名称</option>
                    <option value="artist">艺术家</option>
                  </select>
                </div>

                {/* View Mode - List Only */}
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#0f1116] rounded-xl p-1 border border-violet-600/30">
                  <button className="p-2 rounded-lg bg-blue-500 text-white shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
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
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">还没有收藏的歌曲</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                在播放歌曲时点击爱心图标来收藏你喜欢的音乐
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg font-medium">
                去发现音乐
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedFavorites.map((favSong) => (
<<<<<<< HEAD
<<<<<<< HEAD
              viewMode === 'grid' ? (
                // Grid View
                <div
                  key={favSong.id}
<<<<<<< HEAD
                  onClick={(e) => handleSongClick(e, favSong)}
<<<<<<< HEAD
=======
                  onClick={() => handleSongPlay(favSong)}
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
                  className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-surface-variant ${
                    currentSong?.id === favSong.id ? 'bg-accent-color/10 border border-accent-color/20' : 'bg-card-bg hover:bg-surface'
=======
                  className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 shadow-sm ${
                    currentSong?.id === favSong.id 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-white/30' 
                      : 'bg-white dark:bg-[#0f1116] hover:bg-gray-50 dark:hover:bg-[#1a1b26] border-violet-300/50 dark:border-violet-600/30'
>>>>>>> 53bdb00 (feat: 实现音乐平台核心功能与UI改进)
                  }`}
                >
                  <div className="text-center">
                    {/* Album Art */}
                    <div className="relative mb-4">
                      <div className="w-full aspect-square rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-300/50 dark:border-violet-600/30 shadow-sm">
                        <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 24 24">
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
                      
<<<<<<< HEAD
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSongPlay(favSong);
                          }}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            currentSong?.id === favSong.id
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-black/50 dark:bg-white/20 text-white hover:bg-black/70 dark:hover:bg-white/30'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            {currentSong?.id === favSong.id && isPlaying ? (
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            ) : (
                              <path d="M8 5v14l11-7z" />
                            )}
                          </svg>
                        </button>
                        <button
                           onClick={(e) => handleRemoveFavorite(e, favSong.id)}
                           className={`p-2 rounded-full transition-colors duration-200 ${
                             currentSong?.id === favSong.id
                               ? 'bg-white/20 text-red-300 hover:text-red-200 hover:bg-red-400/20'
                               : 'bg-black/50 dark:bg-white/20 text-red-400 hover:text-red-300'
                           }`}
                         >
                           <FavoriteIcon filled={true} />
                         </button>
                       </div>
=======
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleRemoveFavorite(e, favSong.id)}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <FavoriteIcon filled={true} />
                      </button>
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
                    </div>

                    {/* Song Info */}
                    <h4 className={`font-semibold truncate mb-1 ${
                      currentSong?.id === favSong.id ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {favSong.title || 'Unknown Title'}
                    </h4>
                    <p className={`text-sm truncate mb-2 ${
                      currentSong?.id === favSong.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {Array.isArray(favSong.artist) ? favSong.artist.join(', ') : (favSong.artist || 'Unknown Artist')}
                    </p>
                    <p className={`text-xs font-mono ${
                      currentSong?.id === favSong.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDuration(favSong.duration)}
                    </p>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={favSong.id}
<<<<<<< HEAD
                  onClick={(e) => handleSongClick(e, favSong)}
<<<<<<< HEAD
=======
                  onClick={() => handleSongPlay(favSong)}
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-surface-variant ${
                    currentSong?.id === favSong.id ? 'bg-accent-color/10 border border-accent-color/20' : 'hover:bg-surface'
=======
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 shadow-sm ${
                    currentSong?.id === favSong.id 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-white/30' 
                      : 'bg-white dark:bg-[#0f1116] hover:bg-gray-50 dark:hover:bg-[#1a1b26] border-violet-300/50 dark:border-violet-600/30'
>>>>>>> 53bdb00 (feat: 实现音乐平台核心功能与UI改进)
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Song Cover */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-300/50 dark:border-violet-600/30 shadow-sm">
                        <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 24 24">
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
=======
              <div
                 key={favSong.id}
                 onClick={(e) => handleSongClick(e, favSong)}
                 className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                   currentSong?.id === favSong.id ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                 } p-3`}
               >
                <div className="flex items-center space-x-4">
                  {/* Current Song Indicator */}
                  {currentSong?.id === favSong.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  {/* Song Cover Placeholder */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-500/20 rounded-lg flex items-center justify-center border-2 border-primary-500/30 dark:border-primary-400/30 shadow-sm">
                     <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                       <path d="M18 3a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V3zM8 15V9l6 3-6 3z" />
                     </svg>
                   </div>

                  {/* Song Info */}
                   <div className="flex-1 min-w-0">
                     <h3 className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                       {favSong.title || 'Unknown Title'}
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400 truncate text-sm">
                       {Array.isArray(favSong.artist) ? favSong.artist.join(', ') : (favSong.artist || 'Unknown Artist')}
                     </p>
                   </div>
                   
                   <div className="flex-shrink-0 text-sm text-secondary-text">
                     {formatDuration(favSong.duration)}
                   </div>
>>>>>>> 0f2cacc (feat: 添加音频文件上传和播放功能)

=======
              <div
                 key={favSong.id}
                 onClick={(e) => handleSongClick(e, favSong)}
                 className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                   currentSong?.id === favSong.id ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                 } p-3`}
               >
                <div className="flex items-center space-x-4">
                  {/* Current Song Indicator */}
                  {currentSong?.id === favSong.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  {/* Song Cover Placeholder */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-500/20 rounded-lg flex items-center justify-center border-2 border-primary-500/30 dark:border-primary-400/30 shadow-sm">
                     <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                       <path d="M18 3a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V3zM8 15V9l6 3-6 3z" />
                     </svg>
                   </div>

                  {/* Song Info */}
                   <div className="flex-1 min-w-0">
                     <h3 className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                       {favSong.title || 'Unknown Title'}
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400 truncate text-sm">
                       {Array.isArray(favSong.artist) ? favSong.artist.join(', ') : (favSong.artist || 'Unknown Artist')}
                     </p>
                   </div>
                   
                   <div className="flex-shrink-0 text-sm text-secondary-text">
                     {formatDuration(favSong.duration)}
                   </div>

>>>>>>> 71a2c6553c7e9d77bbc1d431aa3d1ba15a5506a7
                  {/* Actions */}
                   <div className="flex items-center space-x-2">
                     {/* Play Button */}
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleSongPlay(favSong);
                       }}
                       className={`p-2 rounded-full transition-all hover:scale-110 ${
                         currentSong?.id === favSong.id
                           ? 'bg-white/20 text-white hover:bg-white/30'
                           : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700'
                       }`}
                       aria-label="Play song"
                     >
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M8 5v14l11-7z" />
                       </svg>
                     </button>
                     {/* Add to Playlist Button */}
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         // handleAddToPlaylist(favSong);
                       }}
                       className={`p-2 rounded-full transition-all hover:scale-110 ${
                         currentSong?.id === favSong.id
                           ? 'text-white/60 hover:text-white'
                           : 'text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400'
                       }`}
                       aria-label="Add to playlist"
                     >
                       <PlusIcon className="w-4 h-4" />
                     </button>
                     
                     {/* Favorite Button */}
                     <button
                        onClick={(e) => handleRemoveFavorite(e, favSong.id)}
<<<<<<< HEAD
<<<<<<< HEAD
                        className={`p-2 rounded-full transition-all duration-200 ${
                          currentSong?.id === favSong.id 
                            ? 'text-red-300 hover:text-red-200 hover:bg-red-400/20' 
                            : 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                        }`}
=======
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
                          currentSong?.id === favSong.id
                            ? 'text-white/60 hover:text-white'
                            : 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                        }`}
                        aria-label="Remove from favorites"
>>>>>>> 71a2c6553c7e9d77bbc1d431aa3d1ba15a5506a7
                      >
                        <FavoriteIcon 
                          color="currentColor" 
                          size={16} 
                          filled={true}
                        />
                      </button>
<<<<<<< HEAD
                      
<<<<<<< HEAD
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSongPlay(favSong);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all duration-200 transform hover:scale-105 ${
=======
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
>>>>>>> 0f2cacc (feat: 添加音频文件上传和播放功能)
                          currentSong?.id === favSong.id
                            ? 'text-white/60 hover:text-white'
                            : 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                        }`}
                        aria-label="Remove from favorites"
                      >
<<<<<<< HEAD
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          {currentSong?.id === favSong.id && isPlaying ? (
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          ) : (
                            <path d="M8 5v14l11-7z"/>
                          )}
=======
                      <button className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-accent-color text-accent-text-color transition-all duration-200 transform hover:scale-105">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
                        </svg>
=======
                        <FavoriteIcon 
                          color="currentColor" 
                          size={16} 
                          filled={true}
                        />
>>>>>>> 0f2cacc (feat: 添加音频文件上传和播放功能)
                      </button>
=======
>>>>>>> 71a2c6553c7e9d77bbc1d431aa3d1ba15a5506a7
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;