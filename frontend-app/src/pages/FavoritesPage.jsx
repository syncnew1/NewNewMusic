import React from 'react';
import {useTheme} from '../contexts/ThemeContext';
import {usePlayer} from '../contexts/PlayerContext';
import {FavoriteIcon} from '../components/Icons';

function FavoritesPage() {
  const { theme } = useTheme();
  // Use favoriteSongs and removeFavorite from PlayerContext
  const { playSong, songs: allSongs, favoriteSongs, removeFavorite } = usePlayer(); 
  // No need for local loading state if PlayerContext handles it or if data is readily available
  // If PlayerContext doesn't have a loading state for favorites, you might need to add one there
  // or infer loading state based on whether favoriteSongs is populated.

  return (
    <div className={`favorites-page flex-1 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors duration-300 ease-in-out`}>
      <h2 className={`text-3xl font-semibold mb-6 text-gray-800 dark:text-white transition-colors duration-300 ease-in-out`}>My Favorite Songs</h2>
      {/* Assuming PlayerContext provides favoriteSongs directly and handles loading state implicitly or explicitly */}
      {favoriteSongs.length === 0 ? (
        <p className={`text-gray-500 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>You haven't added any songs to your favorites yet.</p>
      ) : (
        <ul className="space-y-2">
          {favoriteSongs.map(favSong => {
            // Find the song in the global songs list to get its index for playback context
            const songIndex = allSongs.findIndex(s => s.id === favSong.id);
            return (
            <li 
              key={favSong.id}
              onClick={() => {
                // It's better to play the song object from favoriteSongs directly
                // as it's guaranteed to be the correct song object.
                // The index is for the context of the 'allSongs' list if needed by playSong.
                if (songIndex !== -1) {
                  playSong(favSong, songIndex); 
                } else {
                  // If the song is a favorite but not in the current general playlist (e.g., from search results)
                  // play it individually. PlayerContext's playSong should handle this gracefully.
                  playSong(favSong, 0); // Or pass a special index like -1 if playSong handles it
                  console.warn("Favorite song played individually as it's not in the current main playlist.");
                }
              }}
              className={`flex justify-between items-center p-4 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out cursor-pointer`}
            >
              <div className="flex-grow">
                <span className="font-medium">{favSong.title}</span> - <span className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>{favSong.artist}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent li's onClick from firing
                  removeFavorite(favSong.id); // Use removeFavorite from PlayerContext
                }}
                className={`ml-4 p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200`}
                aria-label='Remove from favorites'
              >
                <FavoriteIcon color={'#FCB510'} size={24} />
              </button>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default FavoritesPage;