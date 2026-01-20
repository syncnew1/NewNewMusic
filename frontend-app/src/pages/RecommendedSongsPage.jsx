import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import songService from '../services/songService';
import { usePlayer } from '../contexts/PlayerContext';
import { AuthContext } from '../contexts/authContext';
import { useTheme } from '../contexts/ThemeContext';
import { FavoriteIcon } from '../components/Icons';
import { PlusIcon } from '@heroicons/react/24/outline';
import '../styles/index.css';

const RecommendedSongsPage = () => {
    const navigate = useNavigate();
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { playSong, favoriteSongs, addFavorite, removeFavorite, isFavorite, currentSong, isPlaying } = usePlayer();
    const { currentUser } = useContext(AuthContext);
    const { theme } = useTheme();

    // Optimization: Pre-calculate sets for O(1) lookups
    const { favArtistsSet, favGenresSet, favAlbumsSet } = useMemo(() => {
        const artists = new Set();
        const genres = new Set();
        const albums = new Set();

        if (favoriteSongs) {
            favoriteSongs.forEach(favSong => {
                if (favSong.artist) {
                    const songArtists = Array.isArray(favSong.artist) ? favSong.artist : [favSong.artist];
                    songArtists.forEach(artist => artists.add(artist));
                }
                if (favSong.genre) genres.add(favSong.genre);
                if (favSong.album) albums.add(favSong.album);
            });
        }
        return {
            favArtistsSet: artists,
            favGenresSet: genres,
            favAlbumsSet: albums
        };
    }, [favoriteSongs]);

    const formatDuration = (duration) => {
        if (!duration) return '0:00';
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getRecommendationReason = (song) => {
        if (!favoriteSongs || favoriteSongs.length === 0) {
            return '为您精选';
        }

        const songArtists = Array.isArray(song.artist) ? song.artist : [song.artist];

        // Check for artist match
        for (const songArtist of songArtists) {
            if (favArtistsSet.has(songArtist)) {
                return `因为您喜欢 ${songArtist}`;
            }
        }

        // Check for genre match
        if (song.genre && favGenresSet.has(song.genre)) {
            return `因为您喜欢 ${song.genre} 音乐`;
        }

        // Check for album match
        if (song.album && favAlbumsSet.has(song.album)) {
            return `来自专辑《${song.album}》`;
        }

        return '为您推荐';
    };

    const fetchRecommendedSongs = async (isRefresh = false) => {
        if (!currentUser) {
            setError('用户未登录，无法获取推荐歌曲。');
            setLoading(false);
            return;
        }
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await songService.getRecommendedSongs();
            
            // 提取实际的歌曲数据数组
            const data = response.data || response;
            
            const uniqueSongs = data.filter((song, index, self) =>
                index === self.findIndex((s) => (
                    s.id === song.id
                ))
            );
            
            setRecommendedSongs(uniqueSongs);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || '获取推荐歌曲失败，请稍后再试。');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSongClick = (e, song) => {
        // 如果点击的是按钮，不执行跳转
        if (e.target.closest('button')) {
            return;
        }
        navigate(`/song/${song.id}`);
    };

    useEffect(() => {
        fetchRecommendedSongs();
    }, [currentUser]);

    if (loading && !refreshing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">正在为您生成个性化推荐...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116]">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">为您推荐</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">基于您的音乐喜好智能推荐</p>
                        </div>
                        <button
                        onClick={() => fetchRecommendedSongs(true)}
                        disabled={refreshing}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-violet-600/30 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-[#0f1116] hover:bg-gray-50 dark:hover:bg-[#0f1116]/90 disabled:opacity-50 transition-colors"
                    >
                            <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {refreshing ? '刷新中...' : '刷新推荐'}
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-700 dark:text-red-200 mb-2">获取推荐失败</h3>
                        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                        <button
                            onClick={() => fetchRecommendedSongs()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            重试
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && recommendedSongs.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无推荐歌曲</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">添加一些喜欢的歌曲，我们将为您生成个性化推荐</p>
                        <button
                            onClick={() => fetchRecommendedSongs()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            重新生成推荐
                        </button>
                    </div>
                )}

                {/* Songs List */}
                {!loading && !error && recommendedSongs.length > 0 && (
                    <div className="space-y-2">
                        {recommendedSongs.map((song, index) => {
                            const isCurrentSong = currentSong && currentSong.id === song.id;
                            const isFav = isFavorite(song.id);
                            const artist = Array.isArray(song.artist) ? song.artist.join(', ') : song.artist;
                            
                            return (
                                <div
                                    key={song.id}
                                    onClick={(e) => handleSongClick(e, song)}
                                    className={`group relative rounded-xl transition-all duration-200 hover:shadow-md ${
                                        isCurrentSong
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-outline-light dark:border-outline-dark'
                                    }`}
                                >
                                    <div className="flex items-center p-4 space-x-4">
                                         {/* Current Song Indicator */}
                                         {isCurrentSong && (
                                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                                         )}
                                        {/* Song Cover Placeholder */}
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border-2 shadow-sm ${
                                            isCurrentSong
                                                ? 'bg-white/20 border-white/30'
                                                : 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-500/20 border-primary-500/30 dark:border-primary-400/30'
                                        }`}>
                                            <svg className={`w-6 h-6 ${
                                                isCurrentSong
                                                    ? 'text-white'
                                                    : 'text-blue-600 dark:text-blue-400'
                                            }`} fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                            </svg>
                                        </div>
                                        
                                        {/* Song Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold truncate block ${
                                                isCurrentSong
                                                    ? 'text-white'
                                                    : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                                {song.title}
                                            </div>
                                            <p className={`text-sm truncate ${
                                                isCurrentSong
                                                    ? 'text-white/80'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {artist}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    isCurrentSong
                                                        ? 'bg-white/20 text-white/80'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {getRecommendationReason(song)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Duration */}
                                        <div className={`text-sm font-medium ${
                                            isCurrentSong
                                                ? 'text-white/80'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {formatDuration(song.duration)}
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            {/* Play Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playSong(song, index);
                                                }}
                                                className={`p-2 rounded-full transition-all hover:scale-110 ${
                                                    isCurrentSong
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
                                                     // handleAddToPlaylist(song);
                                                 }}
                                                 className={`p-2 rounded-full transition-all hover:scale-110 ${
                                                     isCurrentSong
                                                         ? 'text-white/60 hover:text-white'
                                                         : 'text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400'
                                                 }`}
                                                 aria-label="Add to playlist"
                                             >
                                                 <PlusIcon className="w-4 h-4" />
                                             </button>
                                             
                                             {/* Favorite Button */}
                                             <button
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      isFav ? removeFavorite(song.id) : addFavorite(song);
                                                  }}
                                                  className={`p-2 rounded-full transition-all hover:scale-110 ${
                                                      isFav
                                                          ? 'text-red-500 hover:text-red-600'
                                                          : isCurrentSong
                                                              ? 'text-white/60 hover:text-white'
                                                              : 'text-blue-400 hover:text-red-500 dark:text-blue-500 dark:hover:text-red-400'
                                                  }`}
                                                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                              >
                                                  <FavoriteIcon 
                                                      color="currentColor" 
                                                      size={16} 
                                                      filled={isFav}
                                                  />
                                              </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendedSongsPage;