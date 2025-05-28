import {createContext, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Import AuthContext

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [favoriteSongs, setFavoriteSongs] = useState([]); // Manage favorite songs
  const [favoriteError, setFavoriteError] = useState(null); // Added for user-friendly error messages
  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext

  const API_BASE_URL = 'http://localhost:8080/api/songs'; // Base URL for song-related favorite actions

  // Fetch favorite songs when the component mounts or when user logs in/out
  useEffect(() => {
    const fetchInitialFavorites = async () => {
      // Use currentUser from AuthContext instead of localStorage directly
      if (currentUser && currentUser.accessToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/favorites/user`, { 
            headers: { 'Authorization': `Bearer ${currentUser.accessToken}` }
          });
          setFavoriteSongs(response.data); 
        } catch (error) {
          console.error('Error fetching initial favorite songs:', error);
          setFavoriteSongs([]); // Reset favorites on error or if no user
        }
      } else {
        setFavoriteSongs([]); // Clear favorites if no user is logged in
      }
    };
    fetchInitialFavorites();
  }, [currentUser]); // Add currentUser to dependency array

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
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.accessToken) {
            console.error('No token found, cannot add favorite. User or accessToken is missing.');
            setFavoriteError('请先登录再收藏歌曲。');
            return;
          }
          setFavoriteError(null); 
          try {
            await axios.post(`${API_BASE_URL}/${song.id}/favorite`, {}, {
              headers: { 'Authorization': `Bearer ${user.accessToken}` }
            });

            setFavoriteSongs(prevFavorites => [...prevFavorites, { id: song.id, title: song.title, artist: song.artist }]); 
          } catch (error) {
            console.error('Error adding favorite song:', error);
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
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.accessToken) {
            console.error('No token found, cannot remove favorite');
            setFavoriteError('请先登录再操作。');
            return;
          }
          setFavoriteError(null); 
          try {
            await axios.delete(`${API_BASE_URL}/${songId}/favorite`, {
              headers: { 'Authorization': `Bearer ${user.accessToken}` }
            });
            setFavoriteSongs(prevFavorites => prevFavorites.filter(s => s.id !== songId));
          } catch (error) {
            console.error('Error removing favorite song:', error);
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