import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';

function SearchPage() {
  const { theme } = useTheme();
  const { songs, playSong } = usePlayer(); // Assuming songs are available globally
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filteredSongs = songs.filter(song => 
      song.title.toLowerCase().includes(term.toLowerCase()) || 
      song.artist.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filteredSongs);
  };

  return (
    <div className={`search-page flex-1 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors duration-300 ease-in-out`}>
      <h2 className={`text-3xl font-semibold mb-6 text-gray-800 dark:text-white transition-colors duration-300 ease-in-out`}>Search Songs</h2>
      <input 
        type="text"
        placeholder="Search by title or artist..."
        value={searchTerm}
        onChange={handleSearch}
        className={`w-full p-3 mb-6 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ease-in-out`}
      />
      {searchResults.length === 0 && searchTerm.trim() !== '' && (
        <p className={`text-gray-500 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>No songs found matching your search.</p>
      )}
      {searchResults.length > 0 && (
        <ul className="space-y-2">
          {searchResults.map((song, index) => (
            <li 
              key={song.id} 
              onClick={() => playSong(song, songs.findIndex(s => s.id === song.id))} // Ensure correct index for global player
              className={`p-4 rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out`}
            >
              <span className="font-medium">{song.title}</span> - <span className={`text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out`}>{song.artist}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchPage;