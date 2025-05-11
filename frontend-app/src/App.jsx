import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { usePlayer } from './contexts/PlayerContext'; // Path is already correct, no change needed here if PlayerContext.jsx is already in /contexts
import SongList from './components/SongList';
import PlayerControls from './components/PlayerControls';
import FavoritesPage from './pages/FavoritesPage'; // Import FavoritesPage
import SearchPage from './pages/SearchPage'; // Import SearchPage
import { useTheme } from './contexts/ThemeContext';

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
    <div className={`App min-h-screen flex flex-col items-center bg-primary-bg text-primary-text transition-colors duration-300 ease-in-out`}>
      <header className={`w-full p-6 shadow-lg bg-card-bg/80 backdrop-blur-sm border-b border-border-color transition-colors duration-300 ease-in-out`}>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">NewNewMusic</h1>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors duration-200 bg-accent-color text-accent-text-color hover:opacity-button-hover`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <nav className={`mt-4 pb-2 text-secondary-text transition-colors duration-300 ease-in-out`}>
          <ul className="flex justify-center space-x-6">
            <li><Link to="/" className={`hover:underline hover:text-link-hover-color`}>Home</Link></li>
            <li><Link to="/favorites" className={`hover:underline hover:text-link-hover-color`}>Favorites</Link></li>
            <li><Link to="/search" className={`hover:underline hover:text-link-hover-color`}>Search</Link></li>
          </ul>
        </nav>
      </header>
      <main className={`flex flex-col md:flex-row w-full max-w-6xl p-4 gap-8 pb-[96px] min-h-[calc(100vh-220px)] text-primary-text transition-colors duration-300 ease-in-out`}>
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