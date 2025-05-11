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
    <div className={`search-page flex-1 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}>
      <h2 className={`text-3xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Search Songs</h2>
      <input 
        type="text"
        placeholder="Search by title or artist..."
        value={searchTerm}
        onChange={handleSearch}
        className={`w-full p-3 mb-6 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500' : 'focus:ring-blue-500'}`}
      />
      {searchResults.length === 0 && searchTerm.trim() !== '' && (
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No songs found matching your search.</p>
      )}
      {searchResults.length > 0 && (
        <ul className="space-y-2">
          {searchResults.map((song, index) => (
            <li 
              key={song.id} 
              onClick={() => playSong(song, songs.findIndex(s => s.id === song.id))} // Ensure correct index for global player
              className={`p-4 rounded-md cursor-pointer transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="font-medium">{song.title}</span> - <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{song.artist}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchPage;