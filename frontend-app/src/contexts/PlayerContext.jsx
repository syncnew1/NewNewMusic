import {createContext, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import { AuthContext } from './authContext'; // 导入AuthContext

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [favoriteSongs, setFavoriteSongs] = useState([]); // 管理收藏歌曲
  const [favoriteError, setFavoriteError] = useState(null); // 添加用户友好的错误消息
  const { currentUser, loading: authLoading, logout } = useContext(AuthContext); // 从AuthContext获取currentUser、加载状态和logout

  const API_BASE_URL = 'http://localhost:8080/api'; // API基础URL

  // 当组件挂载或用户登录/登出时获取收藏歌曲
  useEffect(() => {
    const fetchInitialFavorites = async () => {
      // 使用AuthContext中的currentUser而不是直接使用localStorage
      // 仅在认证未加载且用户已登录时获取
      if (!authLoading && currentUser && currentUser.accessToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/songs/favorites`, { 
            headers: { 'Authorization': `Bearer ${currentUser.accessToken}` }
          });
          if (response.data.success && response.data.data) {
            setFavoriteSongs(response.data.data);
          } else {
            setFavoriteSongs([]);
          } 
        } catch (error) {
          // 获取初始收藏歌曲时出错
          if (error.response && error.response.status === 401) {
            setFavoriteError('登录已过期，请重新登录。');
            logout(); // 如果401错误则从AuthContext调用logout
          } else {
            setFavoriteError('获取收藏列表失败。'); 
          }
          setFavoriteSongs([]); // 错误时重置收藏
        }
      } else {
        setFavoriteSongs([]); // 如果没有用户登录或认证正在加载则清除收藏
        if (!authLoading && !currentUser) {
            // 仅在未加载且无用户时清除错误，避免在加载期间清除合法的获取错误
            setFavoriteError(null); 
        }
      }
    };
    fetchInitialFavorites();
  }, [currentUser, authLoading, logout]); // 将logout添加到依赖数组

  const playSong = (song, index) => {
    setCurrentSong(song);
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const clearFavoriteError = () => {
    setFavoriteError(null);
  };

  return (
    <PlayerContext.Provider
      value={{
        songs,
        setSongs,
        currentSong,
        setCurrentSong,
        currentSongIndex,
        setCurrentSongIndex,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        playSong,
        favoriteSongs,
        favoriteError,
        clearFavoriteError,
        addFavorite: async (song) => {
          if (!currentUser || !currentUser.accessToken) {
            // 未找到令牌，无法添加收藏。用户或accessToken缺失
            setFavoriteError('请先登录再收藏歌曲。');
            return;
          }
          setFavoriteError(null); 
          try {
            await axios.post(`${API_BASE_URL}/songs/${song.id}/favorite`, {}, {
              headers: { 'Authorization': `Bearer ${currentUser.accessToken}` }
            });

            setFavoriteSongs(prevFavorites => [...prevFavorites, { id: song.id, title: song.title, artist: song.artist }]); 
          } catch (error) {
            // 添加收藏歌曲时出错
            if (error.response && error.response.status === 400) {
              setFavoriteError('歌曲已被收藏或请求无效。');
            } else if (error.response && error.response.status === 401) {
              setFavoriteError('登录已过期，请重新登录。');
            } else {
              setFavoriteError('添加收藏失败，请稍后再试。');
            }
          }
        },
        removeFavorite: async (songId) => {
          if (!currentUser || !currentUser.accessToken) {
            // 未找到令牌，无法移除收藏。用户或accessToken缺失
            setFavoriteError('请先登录再操作。');
            return;
          }
          setFavoriteError(null); 
          try {
            await axios.delete(`${API_BASE_URL}/songs/${songId}/favorite`, {
              headers: { 'Authorization': `Bearer ${currentUser.accessToken}` }
            });
            setFavoriteSongs(prevFavorites => prevFavorites.filter(s => s.id !== songId));
          } catch (error) {
            // 移除收藏歌曲时出错
            if (error.response && error.response.status === 401) {
              setFavoriteError('登录已过期，请重新登录。');
            } else {
              setFavoriteError('取消收藏失败，请稍后再试。');
            }
          }
        },
        isFavorite: (songId) => {
          return favoriteSongs.some(s => s.id === songId);
        }
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}