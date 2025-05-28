import React, { useState, useEffect, useContext } from 'react';
import songService from '../services/songService';
import { usePlayer } from '../contexts/PlayerContext'; // Changed import to usePlayer
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const RecommendedSongsPage = () => {
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { playSong } = usePlayer(); // Changed to use usePlayer hook
    const { currentUser } = useContext(AuthContext);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchRecommendedSongs = async () => {
            if (!currentUser) {
                setError('用户未登录，无法获取推荐歌曲。');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await songService.getRecommendedSongs();
                const uniqueSongs = data.filter((song, index, self) =>
                    index === self.findIndex((s) => (
                        s.id === song.id
                    ))
                );
                setRecommendedSongs(uniqueSongs);
                setError(null);
            } catch (err) {
                console.error("Error fetching recommended songs:", err);
                setError(err.response?.data?.error || '获取推荐歌曲失败，请稍后再试。');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedSongs();

        // Add event listener for window focus to refetch recommendations
        window.addEventListener('focus', fetchRecommendedSongs);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('focus', fetchRecommendedSongs);
        };
    }, [currentUser]);

    if (loading) {
        return <div className={`text-center py-10 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>加载推荐歌曲中...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">错误: {error}</div>;
    }

    if (recommendedSongs.length === 0) {
        return <div className={`text-center py-10 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>暂无推荐歌曲。</div>;
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <h1 className={`text-3xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>为你推荐</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedSongs.map((song, index) => (
                    <div key={song.id || `recommended-song-${index}`} className={`shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                        {song.coverArtPath && (
                            <img 
                                src={`http://localhost:8080/api/songs/cover/${song.coverArtPath}`}
                                alt={song.title} 
                                className="w-full h-48 object-cover"
                                onError={(e) => e.target.style.display = 'none'} // Hide if image fails to load
                            />
                        )}
                        <div className="p-4">
                            <h3 className={`text-lg font-semibold mb-1 truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`} title={song.title}>{song.title}</h3>
                            <p className={`text-sm mb-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} title={song.artist}>{song.artist}</p>
                            <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} title={song.album}>{song.album}</p>
                            <button 
                                onClick={() => playSong(song)} 
                                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
                            >
                                播放
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedSongsPage;