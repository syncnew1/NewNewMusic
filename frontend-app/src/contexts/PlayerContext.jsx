import {createContext, useContext, useEffect, useState} from 'react';
import axios from 'axios';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [favoriteSongs, setFavoriteSongs] = useState([]); // Manage favorite songs
  const [favoriteError, setFavoriteError] = useState(null); // Added for user-friendly error messages

  const API_BASE_URL = 'http://localhost:8080/api/songs'; // Base URL for song-related favorite actions

  // Fetch favorite songs when the component mounts or when user logs in
  useEffect(() => {
    const fetchInitialFavorites = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.accessToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/favorites/user`, { 
            headers: { 'Authorization': `Bearer ${user.accessToken}` }
          });
          // Map UserFavoriteSong objects to a consistent structure for the frontend state
          // UserFavoriteSong has: id (of the favorite record), userId, songId, songTitle, songArtist
          // We need objects with: id (as songId), title, artist for consistency with 'song' objects used elsewhere
          const mappedFavorites = response.data.map(fav => ({
            id: fav.songId,       // This 'id' will be the song's actual ID
            title: fav.songTitle,
            artist: fav.songArtist,
            // Optionally, keep the favorite record's ID if needed for specific operations, though not currently used by removeFavorite
            // favoriteRecordId: fav.id 
          }));
          setFavoriteSongs(mappedFavorites);
        } catch (error) {
          console.error('Error fetching initial favorite songs:', error);
          setFavoriteSongs([]);
        }
      }
    };
    fetchInitialFavorites();
  }, []);

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
        favoriteError, // Expose error state
        clearFavoriteError, // Expose clear error function
        addFavorite: async (song) => { // song here is a Song object { id, title, artist, ... }
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.accessToken) {
            console.error('No token found, cannot add favorite. User or accessToken is missing.');
            setFavoriteError('请先登录再收藏歌曲。');
            return;
          }
          setFavoriteError(null); 
          try {
            // Client-side check (optional, backend is the source of truth)
            // if (favoriteSongs.some(favSong => favSong.id === song.id)) {
            //   console.log('Song already in favorites (client-side check)');
            //   setFavoriteError('歌曲已在您的收藏列表中。');
            //   return;
            // }

            await axios.post(`${API_BASE_URL}/${song.id}/favorite`, {}, {
              headers: { 'Authorization': `Bearer ${user.accessToken}` }
            });
            // Optimistically update UI with the song object that was passed in
            // This song object should have id, title, artist
            setFavoriteSongs(prevFavorites => [...prevFavorites, { id: song.id, title: song.title, artist: song.artist }]); 
          } catch (error) {
            console.error('Error adding favorite song:', error);
            if (error.response && error.response.status === 400) {
              // Assuming 400 from this endpoint means "already favorited" or a similar validation error
              // For a more specific message, the backend could return a structured error response
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
          setFavoriteError(null); // Clear previous errors
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
          // This should now work correctly as all items in favoriteSongs will have an 'id' property representing songId
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