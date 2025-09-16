import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/authContext';
import authService from '../services/authService';
import '../styles/index.css';

function SearchPage() {
  const { theme } = useTheme();
  const { songs, playSong, currentSong, isPlaying, favoriteSongs, addFavorite, removeFavorite, isFavorite } = usePlayer();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [addToPlaylistId, setAddToPlaylistId] = useState(null);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const playlistId = urlParams.get('addToPlaylist');
    if (playlistId) {
      setAddToPlaylistId(playlistId);
    }
  }, [location.search]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // 模拟搜索延迟
    setTimeout(() => {
      const filteredSongs = songs.filter(song => {
        const titleMatch = song.title.toLowerCase().includes(term.toLowerCase());
        const artistMatch = Array.isArray(song.artist) 
          ? song.artist.some(artist => artist.toLowerCase().includes(term.toLowerCase()))
          : song.artist.toLowerCase().includes(term.toLowerCase());
        return titleMatch || artistMatch;
      });
      setSearchResults(filteredSongs);
      setIsSearching(false);
    }, 300);
  };

  const handlePlaySong = (song) => {
    const index = searchResults.findIndex(s => s.id === song.id);
    playSong(song, index);
    
    // 添加到最近搜索
    const newRecentSearches = [searchTerm, ...recentSearches.filter(term => term !== searchTerm)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const handleToggleFavorite = (song) => {
    if (isFavorite(song.id)) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
  };

  const handleRecentSearch = (term) => {
    setSearchTerm(term);
    const event = { target: { value: term } };
    handleSearch(event);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleAddToPlaylist = async (song) => {
    if (!addToPlaylistId || !currentUser) {
      return;
    }
    
    setIsAddingToPlaylist(true);
    try {
      const response = await authService.addSongToPlaylist(addToPlaylistId, song.id);
      alert('歌曲已添加到歌单！');
    } catch (error) {
      alert(`添加失败: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  const handleBackToPlaylist = () => {
    navigate(`/playlist/${addToPlaylistId}`);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {addToPlaylistId && (
              <button
                onClick={handleBackToPlaylist}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {addToPlaylistId ? '添加歌曲到歌单' : '搜索音乐'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {addToPlaylistId ? '搜索并选择要添加的歌曲' : '发现你喜欢的歌曲和艺术家'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <div className="relative bg-white dark:bg-[#0f1116] rounded-2xl shadow-lg border border-outline-light dark:border-violet-600/30 overflow-hidden">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="搜索歌曲、艺术家或专辑..."
              className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Searches */}
        {!searchTerm && recentSearches.length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-[#0f1116] rounded-2xl shadow-lg border border-outline-light dark:border-violet-600/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">最近搜索</h3>
                <button 
                  onClick={clearRecentSearches}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  清除
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(term)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#0f1116] hover:bg-blue-100 dark:hover:bg-[#0f1116]/90 border border-gray-200 dark:border-violet-600/30 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchTerm && (
          <div>
            <div className="bg-white dark:bg-[#0f1116] rounded-2xl shadow-lg border border-outline-light dark:border-violet-600/30 overflow-hidden">
              <div className="p-6 border-b border-outline-light dark:border-violet-600/30 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-violet-900/10 dark:to-purple-900/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {searchResults.length > 0 ? `找到 ${searchResults.length} 首歌曲` : '未找到相关歌曲'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      搜索: "{searchTerm}"
                    </p>
                  </div>
                  {searchResults.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {searchResults.length} 首歌曲
                    </span>
                  )}
                </div>
              </div>
            
              {searchResults.length === 0 && !isSearching && (
                <div className="text-center py-16 px-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">未找到相关歌曲</h3>
                  <p className="text-gray-600 dark:text-gray-400">尝试使用不同的关键词搜索</p>
                </div>
              )}
            
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">搜索中...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-6">
                  <div className="space-y-2">
                    {searchResults.map((song, index) => (
                      <div 
                        key={song.id} 
                        className={`relative group flex items-center p-4 bg-white dark:bg-gray-800 hover:bg-hover-bg border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                          currentSong?.id === song.id ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                        }`}
                      >
                        {/* Current Song Indicator */}
                        {currentSong?.id === song.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                        )}
                        
                        {/* Song Cover Placeholder */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-500/20 rounded-lg flex items-center justify-center border-2 border-primary-500/30 dark:border-primary-400/30 shadow-sm mr-4">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V3zM8 15V9l6 3-6 3z" />
                          </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 dark:text-white font-medium truncate">{song.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{song.artist}</p>
                        </div>
                        
                        <div className="flex-shrink-0 text-sm text-secondary-text mr-4">
                          {song.duration}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePlaySong(song)}
                            className={`p-2 rounded-full transition-all hover:scale-110 ${
                              currentSong?.id === song.id
                                ? 'bg-white/20 text-white hover:bg-white/30'
                                : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700'
                            }`}
                            aria-label="Play song"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          
                          {addToPlaylistId ? (
                            <button
                              onClick={() => handleAddToPlaylist(song)}
                              disabled={isAddingToPlaylist}
                              className="p-2 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-700 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Add to playlist"
                            >
                              {isAddingToPlaylist ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleFavorite(song)}
                              className={`p-2 rounded-full transition-all hover:scale-110 ${
                                isFavorite(song.id)
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                              }`}
                              aria-label="Toggle favorite"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!searchTerm && recentSearches.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto h-20 w-20 text-secondary-text mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-medium text-primary-text mb-2">开始搜索音乐</h3>
            <p className="text-secondary-text max-w-md mx-auto">
              在上方搜索框中输入歌曲名称、艺术家或专辑名称来发现你喜欢的音乐
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;