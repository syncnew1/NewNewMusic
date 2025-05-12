import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext'; // Assuming favorites will be managed here or a new context

function FavoritesPage() {
  const { theme } = useTheme();
  // const { favoriteSongs } = usePlayer(); // Or a new context for favorites
  const favoriteSongs = []; // Placeholder

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
              className={`p-4 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out`}
            >
              <span className="font-medium">{song.title}</span> - <span className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>{song.artist}</span>
              {/* Add a button to remove from favorites if needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FavoritesPage;