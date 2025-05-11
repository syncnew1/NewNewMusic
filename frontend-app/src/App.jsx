import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { usePlayer } from './contexts/PlayerContext';
import SongList from './components/SongList';
import PlayerControls from './components/PlayerControls';
import FavoritesPage from './pages/FavoritesPage'; // Import FavoritesPage
import SearchPage from './pages/SearchPage'; // Import SearchPage
import { useTheme } from './contexts/ThemeContext'; // Import useTheme

function App() {
  const { theme, toggleTheme } = useTheme();
  const { setSongs } = usePlayer();

  useEffect(() => {
    fetch('/api/songs')
      .then(response => response.json())
      .then(data => {
        setSongs(data);
      })
      .catch(error => console.error('Error fetching songs:', error));
  }, [setSongs]);

  return (
    <div className={`App min-h-screen flex flex-col items-center ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`App-header w-full p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'}`}>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">NewNewMusic</h1>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <nav className={`mt-4 pb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <ul className="flex justify-center space-x-6">
            <li><Link to="/" className={`hover:underline ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Home</Link></li>
            <li><Link to="/favorites" className={`hover:underline ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Favorites</Link></li>
            <li><Link to="/search" className={`hover:underline ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>Search</Link></li>
          </ul>
        </nav>
      </header>
      <main className={`flex flex-col md:flex-row w-full max-w-6xl p-4 gap-8 pb-[96px] min-h-[calc(100vh-220px)] ${theme === 'dark' ? '' : 'text-gray-800'}`}>
        <Routes>
          <Route path="/" element={<SongList />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
      <PlayerControls />
    </div>
  );
}

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;