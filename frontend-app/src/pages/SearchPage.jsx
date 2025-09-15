import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import '../styles/index.css';

function SearchPage() {
  const { theme } = useTheme();
  const { songs, playSong, currentSong, isPlaying, favoriteSongs, addFavorite, removeFavorite, isFavorite } = usePlayer();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

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

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">搜索音乐</h1>
              <p className="text-gray-600 dark:text-gray-400">发现你喜欢的歌曲和艺术家</p>
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
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
                >
                  清除
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(term)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#0f1116] hover:bg-primary-100 dark:hover:bg-[#0f1116]/90 border border-gray-200 dark:border-violet-600/30 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200"
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
              <div className="p-6 border-b border-outline-light dark:border-violet-600/30 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-violet-900/10 dark:to-purple-900/10">
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
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
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
                        className="group flex items-center p-4 bg-gray-50 dark:bg-[#0f1116] hover:bg-gray-100 dark:hover:bg-[#1a1b26] border border-gray-200 dark:border-violet-600/30 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.933-.685-3.711-1.829-5.1a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 dark:text-gray-100 font-medium truncate">{song.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{song.artist}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePlaySong(song)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleToggleFavorite(song)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isFavorite(song.id)
                                ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
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