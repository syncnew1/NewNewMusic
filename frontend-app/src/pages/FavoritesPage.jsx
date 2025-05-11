import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext'; // Assuming favorites will be managed here or a new context

function FavoritesPage() {
  const { theme } = useTheme();
  // const { favoriteSongs } = usePlayer(); // Or a new context for favorites
  const favoriteSongs = []; // Placeholder

  return (
    <div className={`favorites-page flex-1 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}>
      <h2 className={`text-3xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>My Favorite Songs</h2>
      {favoriteSongs.length === 0 ? (
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>You haven't added any songs to your favorites yet.</p>
      ) : (
        <ul className="space-y-2">
          {favoriteSongs.map(song => (
            <li 
              key={song.id} 
              className={`p-4 rounded-md transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="font-medium">{song.title}</span> - <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{song.artist}</span>
              {/* Add a button to remove from favorites if needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FavoritesPage;