import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useTheme } from '../contexts/ThemeContext';
import { FavoriteIcon } from '../components/Icons';

function SongList() {
  const { theme } = useTheme();
  const { songs, currentSong, playSong, addFavorite, removeFavorite, isFavorite } = usePlayer();

  if (!songs || songs.length === 0) {
    return (
      <div className={`song-list flex-1 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Playlist</h2>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No songs available. Add some music!</p>
      </div>
    );
  }

  return (
    <div className={`song-list flex-1 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Playlist</h2>
      <ul className="space-y-2">
        {songs.map((song, index) => (
          <li
            key={song.id}
            className={`flex justify-between items-center p-4 rounded-md transition-all duration-300 ease-in-out ${currentSong?.id === song.id ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg') : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800')}`}
          >
            <div onClick={() => playSong(song, index)} className="flex-grow cursor-pointer">
              <span className="font-medium">{song.title}</span> - <span className={currentSong?.id === song.id ? (theme === 'dark' ? 'text-blue-200' : 'text-blue-100') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>{song.artist}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent li's onClick from firing
                isFavorite(song.id) ? removeFavorite(song.id) : addFavorite(song);
              }}
              className={`ml-4 p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200`}
              aria-label={isFavorite(song.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
                <FavoriteIcon color={isFavorite(song.id) ? '#FCB510' : '#cdcdcd'} size={24} />

            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SongList;