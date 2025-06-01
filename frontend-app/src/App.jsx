import React, { useContext, useEffect } from 'react';
import {BrowserRouter as Router, Link, Route, Routes, useNavigate} from 'react-router-dom'; // Import useNavigate
import './App.css';
import {usePlayer} from './contexts/PlayerContext';
import SongList from './components/SongList';
import PlayerControls from './components/PlayerControls';
import FavoritesPage from './pages/FavoritesPage';
import SearchPage from './pages/SearchPage';
import {useTheme} from './contexts/ThemeContext';
import {AuthContext} from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RecommendedSongsPage from './pages/RecommendedSongsPage';
import Icons from './components/Icons';

function App() {
  const { currentUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { setSongs } = usePlayer();
  const navigate = useNavigate(); // Get navigate function

  useEffect(() => {
    fetch('/api/songs')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched songs data:', data); // Log the fetched data
        setSongs(data);
      })
      .catch(error => console.error('Error fetching songs:', error));
  }, [setSongs]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Navigate to login page
  };

  return (
    <div className={`App min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 text-primary-text transition-all duration-500 ease-in-out`}>
      <header className={`w-full p-6 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-blue-200 dark:border-gray-700 transition-all duration-300 ease-in-out`}>
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.078-1.343-4.243a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              NewNewMusic
            </h1>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all duration-200 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            {theme === 'light' ? Icons.themeToggle.light : Icons.themeToggle.dark}
          </button>
        </div>
        <nav className={`mt-6 pb-2 transition-colors duration-300 ease-in-out`}>
          <ul className="flex justify-center space-x-8 max-w-4xl mx-auto">
            <li><Link to="/" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 font-medium`}>🏠 主页</Link></li>
            <li><Link to="/favorites" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-cyan-100 dark:hover:bg-cyan-800 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium`}>❤️ 收藏</Link></li>
            <li><Link to="/search" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 font-medium`}>🔍 搜索</Link></li>
            <li><Link to="/recommendations" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium`}>✨ 推荐</Link></li>
            {!currentUser && (
              <>
                <li><Link to="/login" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-800 hover:text-green-600 dark:hover:text-green-300 font-medium`}>🔑 登录</Link></li>
                <li><Link to="/register" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-yellow-100 dark:hover:bg-yellow-800 hover:text-yellow-600 dark:hover:text-yellow-300 font-medium`}>📝 注册</Link></li>
              </>
            )}
            {currentUser && (
              <>
                <li><Link to="/profile" className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-teal-100 dark:hover:bg-teal-800 hover:text-teal-600 dark:hover:text-teal-300 font-medium`}>👤 个人信息</Link></li>
                <li><button onClick={handleLogout} className={`px-4 py-2 rounded-full transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-800 hover:text-red-600 dark:hover:text-red-300 font-medium`}>🚪 退出</button></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main className={`flex flex-col md:flex-row w-full max-w-7xl mx-auto p-6 gap-8 pb-[120px] min-h-[calc(100vh-220px)] transition-all duration-300 ease-in-out`}>
        <Routes>
          <Route path="/" element={<SongList />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/recommendations" element={<RecommendedSongsPage />} /> 
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