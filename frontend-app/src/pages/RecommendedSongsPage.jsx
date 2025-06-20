import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import songService from '../services/songService';
import { usePlayer } from '../contexts/PlayerContext';
import { AuthContext } from '../contexts/authContext';
import { useTheme } from '../contexts/ThemeContext';
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

        // Check for exact artist match
        for (const favSong of favoriteSongs) {
            const favArtists = Array.isArray(favSong.artist) ? favSong.artist : [favSong.artist];
            const songArtists = Array.isArray(song.artist) ? song.artist : [song.artist];
            
            for (const favArtist of favArtists) {
                for (const songArtist of songArtists) {
                    if (favArtist === songArtist) {
                        return `因为您喜欢 ${favArtist}`;
                    }
                }
            }
        }

        // Check for genre match
        for (const favSong of favoriteSongs) {
            if (favSong.genre === song.genre && song.genre) {
                return `因为您喜欢 ${song.genre} 音乐`;
            }
        }

        // Check for album match
        for (const favSong of favoriteSongs) {
            if (favSong.album === song.album && song.album) {
                return `来自专辑《${song.album}》`;
            }
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
            const data = await songService.getRecommendedSongs();
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
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">正在为您生成个性化推荐...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">为您推荐</h1>
                                <p className="text-gray-600 dark:text-gray-400">基于您的音乐喜好智能推荐</p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchRecommendedSongs(true)}
                            disabled={refreshing}
                            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-outline-light dark:border-outline-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                            <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {refreshing ? '刷新中...' : '刷新推荐'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-6 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-error-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="text-lg font-semibold text-error-700 dark:text-error-300">获取推荐失败</h3>
                                <p className="text-error-600 dark:text-error-400">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchRecommendedSongs()}
                            className="mt-4 px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg transition-colors"
                        >
                            重试
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && recommendedSongs.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">暂无推荐歌曲</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">添加一些喜欢的歌曲，我们将为您生成个性化推荐</p>
                        <button
                            onClick={() => fetchRecommendedSongs()}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg transition-all"
                        >
                            重新生成推荐
                        </button>
                    </div>
                )}

                {/* Songs List */}
                {!loading && !error && recommendedSongs.length > 0 && (
                    <div className="space-y-4">
                        {recommendedSongs.map((song, index) => {
                            const isCurrentSong = currentSong && currentSong.id === song.id;
                            const isFav = isFavorite(song.id);
                            
                            return (
                                <div
                                    key={song.id}
                                    onClick={(e) => handleSongClick(e, song)}
                                    className={`group bg-white dark:bg-gray-800 rounded-xl border border-outline-light dark:border-outline-dark hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                                        isCurrentSong ? 'ring-2 ring-primary-500 border-primary-500' : ''
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center space-x-4">
                                            {/* Cover Placeholder */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 rounded-lg flex items-center justify-center">
                                                    {isCurrentSong && isPlaying ? (
                                                        <div className="flex space-x-1">
                                                            <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                                                            <div className="w-1 h-6 bg-primary-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                                            <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                                        </div>
                                                    ) : (
                                                        <svg className="w-8 h-8 text-primary-400 dark:text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {isCurrentSong && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Song Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                            {song.title}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 truncate">
                                                            {Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}
                                                        </p>
                                                        {song.album && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                                                                专辑: {song.album}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                                                                {getRecommendationReason(song)}
                                                            </span>
                                                            {song.genre && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {song.genre}
                                                                </span>
                                                            )}
                                                            {song.duration && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatDuration(song.duration)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isFav) {
                                                            removeFavorite(song.id);
                                                        } else {
                                                            addFavorite(song.id);
                                                        }
                                                    }}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        isFav
                                                            ? 'text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20'
                                                            : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => playSong(song, index)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-lg transition-all hover:shadow-lg active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        {isCurrentSong && isPlaying ? (
                                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                        ) : (
                                                            <path d="M8 5v14l11-7z" />
                                                        )}
                                                    </svg>
                                                    <span className="text-sm font-medium">
                                                        {isCurrentSong && isPlaying ? '暂停' : '播放'}
                                                    </span>
                                                </button>
                                            </div>
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