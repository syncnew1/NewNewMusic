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
            console.log('❌ 用户未登录');
            setError('用户未登录，无法获取推荐歌曲。');
            setLoading(false);
            return;
        }
        try {
            console.log('🎵 开始获取推荐歌曲...');
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await songService.getRecommendedSongs();
            console.log('📊 推荐API返回数据:', response);
            console.log('📊 数据类型:', typeof response, '是否为数组:', Array.isArray(response));
            
            // 提取实际的歌曲数据数组
            const data = response.data || response;
            console.log('🎵 提取的歌曲数据:', data);
            console.log('🎵 歌曲数据类型:', typeof data, '是否为数组:', Array.isArray(data));
            
            const uniqueSongs = data.filter((song, index, self) =>
                index === self.findIndex((s) => (
                    s.id === song.id
                ))
            );
            console.log('🎶 去重后歌曲数量:', uniqueSongs.length);
            console.log('🎵 推荐歌曲列表:', uniqueSongs.map(s => s.title));
            
            setRecommendedSongs(uniqueSongs);
            setError(null);
        } catch (err) {
            console.error('❌ 获取推荐歌曲失败:', err);
            console.error('❌ 错误响应:', err.response?.data);
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
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">正在为您生成个性化推荐...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116]">
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
                    <div className="space-y-4">
                        {recommendedSongs.map((song, index) => {
                            const isCurrentSong = currentSong && currentSong.id === song.id;
                            const isFav = isFavorite(song.id);
                            
                            return (
                                <div
                                    key={song.id}
                                    onClick={(e) => handleSongClick(e, song)}
                                    className={`group bg-white dark:bg-[#0f1116] rounded-lg border border-gray-200 dark:border-violet-600/30 hover:border-violet-300 dark:hover:border-violet-500/50 transition-all duration-200 hover:shadow-md cursor-pointer ${
                                        isCurrentSong ? 'ring-2 ring-violet-500 border-violet-500' : ''
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center space-x-4">
                                            {/* Cover Placeholder */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-violet-900/20 dark:to-violet-800/20 rounded-lg flex items-center justify-center">
                                                    {isCurrentSong && isPlaying ? (
                                                        <div className="flex space-x-1">
                                                            <div className="w-1 h-4 bg-violet-500 rounded-full animate-pulse"></div>
                                                            <div className="w-1 h-6 bg-violet-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                                            <div className="w-1 h-4 bg-violet-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                                        </div>
                                                    ) : (
                                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {isCurrentSong && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
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
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            专辑: {song.album}
                                                        </p>
                                                        )}
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                                                {getRecommendationReason(song)}
                                                            </span>
                                                            {song.genre && (
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                    {song.genre}
                                                                </span>
                                                            )}
                                                            {song.duration && (
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">
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
                                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => playSong(song, index)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors hover:shadow-md active:scale-95"
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