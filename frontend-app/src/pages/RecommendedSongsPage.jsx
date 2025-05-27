import React, { useState, useEffect, useContext } from 'react';
import songService from '../services/songService';
import { usePlayer } from '../contexts/PlayerContext'; // Changed import to usePlayer
import { AuthContext } from '../contexts/AuthContext';

const RecommendedSongsPage = () => {
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { playSong } = usePlayer(); // Changed to use usePlayer hook
    const { currentUser } = useContext(AuthContext);

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
                setRecommendedSongs(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching recommended songs:", err);
                setError(err.response?.data?.error || '获取推荐歌曲失败，请稍后再试。');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedSongs();
    }, [currentUser]);

    if (loading) {
        return <div className="text-center py-10">加载推荐歌曲中...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">错误: {error}</div>;
    }

    if (recommendedSongs.length === 0) {
        return <div className="text-center py-10">暂无推荐歌曲。</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">为你推荐</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedSongs.map((song) => (
                    <div key={song.id} className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                        {song.coverArtPath && (
                            <img 
                                src={`http://localhost:8080/api/songs/cover/${song.coverArtPath}`}
                                alt={song.title} 
                                className="w-full h-48 object-cover"
                                onError={(e) => e.target.style.display = 'none'} // Hide if image fails to load
                            />
                        )}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-1 truncate" title={song.title}>{song.title}</h3>
                            <p className="text-gray-600 text-sm mb-1 truncate" title={song.artist}>{song.artist}</p>
                            <p className="text-gray-500 text-xs truncate" title={song.album}>{song.album}</p>
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