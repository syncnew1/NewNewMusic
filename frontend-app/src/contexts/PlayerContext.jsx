import { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [favoriteSongs, setFavoriteSongs] = useState([]); // Manage favorite songs

  const playSong = (song, index) => {
    setCurrentSong(song);
    setCurrentSongIndex(index);
    setIsPlaying(true);
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
        addFavorite: (song) => {
          // Here you would typically call an API to add the song to favorites
          // For now, we'll just update the local state
          setFavoriteSongs(prevFavorites => {
            if (!prevFavorites.find(favSong => favSong.id === song.id)) {
              return [...prevFavorites, song];
            }
            return prevFavorites;
          });
        },
        removeFavorite: (songId) => {
          // Here you would typically call an API to remove the song from favorites
          // For now, we'll just update the local state
          setFavoriteSongs(prevFavorites => prevFavorites.filter(song => song.id !== songId));
        },
        isFavorite: (songId) => {
          return favoriteSongs.some(song => song.id === songId);
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