import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import { FavoriteIcon } from '../components/Icons';
function FavoritesPage() {
  const { theme } = useTheme();
  const { favoriteSongs, removeFavorite } = usePlayer(); // Get favoriteSongs and removeFavorite from PlayerContext

  return (
    <div className={`favorites-page flex-1 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors duration-300 ease-in-out`}>
      <h2 className={`text-3xl font-semibold mb-6 text-gray-800 dark:text-white transition-colors duration-300 ease-in-out`}>My Favorite Songs</h2>
      {favoriteSongs.length === 0 ? (
        <p className={`text-gray-500 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>You haven't added any songs to your favorites yet.</p>
      ) : (
        <ul className="space-y-2">
          {favoriteSongs.map(song => (
            <li 
              key={song.id} 
              className={`flex justify-between items-center p-4 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out`}
            >
              <div className="flex-grow">
                <span className="font-medium">{song.title}</span> - <span className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>{song.artist}</span>
              </div>
              <button 
                onClick={() => removeFavorite(song.id)}
                className={`ml-4 p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200`}
                aria-label='Remove from favorites'
              >
                <FavoriteIcon color={'#FCB510'} size={24} />

              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FavoritesPage;