import React, { useContext, useEffect } from 'react';
import {BrowserRouter as Router, Link, Route, Routes, useNavigate} from 'react-router-dom'; // 导入useNavigate
import './App.css';
import {usePlayer} from './contexts/PlayerContext';
import SongList from './components/SongList';
import PlayerControls from './components/PlayerControls';
import FavoritesPage from './pages/FavoritesPage';
import SearchPage from './pages/SearchPage';
import {useTheme} from './contexts/ThemeContext';
import {AuthContext} from './contexts/authContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RecommendedSongsPage from './pages/RecommendedSongsPage';
import UploadPage from './pages/UploadPage';
<<<<<<< HEAD
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import FollowPage from './pages/FollowPage';
import SongDetailPage from './pages/SongDetailPage';
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
import Icons from './components/Icons';
import songService from './services/songService';

function App() {
  const { currentUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { setSongs } = usePlayer();
  const navigate = useNavigate(); // 获取导航函数

  useEffect(() => {
    songService.getAllSongs()
      .then(response => {
        setSongs(response.data);
      })
      .catch(error => {
        // 静默处理错误，避免在控制台显示
      });
  }, [setSongs]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // 导航到登录页面
  };

  return (
    <div className={`App min-h-screen flex flex-col bg-primary-bg text-primary-text transition-all duration-300 ease-in-out`}>
      {/* Mobile-first responsive header */}
      <header className={`sticky top-0 z-50 w-full bg-card-bg/95 backdrop-blur-md border-b border-border-color shadow-soft transition-all duration-300 ease-in-out`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar with logo and theme toggle */}
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-color to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg sm:text-xl">♪</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-accent-color via-purple-500 to-pink-500 bg-clip-text text-transparent">
               NewNewMusic
              </h1>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User menu for mobile */}
              <div className="md:hidden">
                {currentUser ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-text truncate max-w-20">{currentUser.username}</span>
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-surface hover:bg-surface-variant transition-colors duration-200"
                    >
                      <span className="text-xs">退出</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="px-3 py-1.5 text-sm bg-accent-color text-accent-text-color rounded-lg hover:opacity-90 transition-opacity duration-200"
                  >
                    登录
                  </Link>
                )}
              </div>
              
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className={`p-2 sm:p-3 rounded-xl bg-surface hover:bg-surface-variant transition-all duration-200 transform hover:scale-105 active:scale-95`}
                aria-label="切换主题"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6">
                  {theme === 'light' ? Icons.themeToggle.light : Icons.themeToggle.dark}
                </div>
              </button>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block pb-4">
            <ul className="flex justify-center items-center space-x-8 lg:space-x-12">
              <li>
                <Link 
                  to="/" 
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                >
                  主页
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/favorites" 
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                >
                  收藏
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                >
                  搜索
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/recommendations" 
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                >
                  推荐
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </li>
              {!currentUser && (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 bg-accent-color text-accent-text-color rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                    >
                      登录
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 border border-accent-color text-accent-color rounded-lg hover:bg-accent-color hover:text-accent-text-color transition-all duration-200 font-medium"
                    >
                      注册
                    </Link>
                  </li>
                </>
              )}
              {currentUser && (
                <>
                  <li>
                    <Link 
<<<<<<< HEAD
                      to="/playlists" 
                      className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                    >
                      播放列表
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/follow" 
                      className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                    >
                      关注
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                  </li>
                  <li>
                    <Link 
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
                      to="/upload" 
                      className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                    >
                      上传音乐
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/profile" 
                      className="text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium relative group"
                    >
                      个人信息
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-color transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="px-4 py-2 text-secondary-text hover:text-primary-text transition-colors duration-200 font-medium"
                    >
                      退出
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-20 left-0 right-0 z-40 bg-card-bg/95 backdrop-blur-md border-t border-border-color">
        <div className="flex justify-around items-center py-2">
          <Link to="/" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
            <span className="text-xs mt-1">主页</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
            <span className="text-xs mt-1">搜索</span>
          </Link>
          <Link to="/favorites" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
            <span className="text-xs mt-1">收藏</span>
          </Link>
          <Link to="/recommendations" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
            <span className="text-xs mt-1">推荐</span>
          </Link>
          {currentUser && (
<<<<<<< HEAD
            <>
              <Link to="/playlists" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
                <span className="text-xs mt-1">列表</span>
              </Link>
              <Link to="/follow" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
                <span className="text-xs mt-1">关注</span>
              </Link>
            </>
=======
            <Link to="/upload" className="flex flex-col items-center p-2 text-secondary-text hover:text-accent-color transition-colors duration-200">
              <span className="text-xs mt-1">上传</span>
            </Link>
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
          )}
        </div>
      </nav>
      
      {/* Main content area */}
      <main className={`flex-1 w-full pb-32 md:pb-24 transition-all duration-300 ease-in-out animate-fade-in`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Routes>
            <Route path="/" element={<SongList />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/recommendations" element={<RecommendedSongsPage />} />
<<<<<<< HEAD
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
              <Route path="/follow" element={<FollowPage />} />
              <Route path="/song/:id" element={<SongDetailPage />} /> 
=======
            <Route path="/upload" element={<UploadPage />} /> 
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
          </Routes>
        </div>
      </main>
      
      {/* Player controls - always at bottom */}
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