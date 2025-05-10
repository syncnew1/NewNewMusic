import { useEffect } from 'react'
import { useState } from 'react'
import './App.css'
import { PlayerProvider, usePlayer } from './context/PlayerContext';

function App() {
  const { songs, setSongs, currentSong, setCurrentSong, currentSongIndex, setCurrentSongIndex, isPlaying, setIsPlaying, volume, setVolume } = usePlayer();
  const [preloadedSongs, setPreloadedSongs] = useState({});

  useEffect(() => {
    fetch('/api/songs')
      .then(response => response.json())
      .then(data => {
        setSongs(data);
      })
      .catch(error => console.error('Error fetching songs:', error));
  }, [setSongs]);

  useEffect(() => {
    if (songs.length > 0 && currentSongIndex >= 0) {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      const nextSong = songs[nextIndex];
      if (nextSong && !preloadedSongs[nextSong.id]) {
        const audio = new Audio(`/api/songs/stream/${nextSong.filePath}`);
        audio.preload = 'auto';
        setPreloadedSongs(prev => ({
          ...prev,
          [nextSong.id]: audio
        }));
      }
    }
  }, [currentSongIndex, songs, preloadedSongs]);

  const audioRef = useRef(null);

const playSong = (song, index) => {
  // 清理之前的音频实例
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.removeEventListener('ended', handleAudioEnded);
  }
  
  // 创建新的音频实例
  const audio = new Audio(`/api/songs/stream/${song.filePath}`);
  audioRef.current = audio;
  
  setCurrentSong(song);
  setCurrentSongIndex(index);
  setIsPlaying(true);
  
  audio.play().catch(e => console.error('Play error:', e));
  
  audio.addEventListener('ended', handleAudioEnded);
};

const handleAudioEnded = () => {
  setIsPlaying(false);
};

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playNextSong = () => {
  if (songs.length === 0) return;
  
  const nextIndex = (currentSongIndex + 1) % songs.length;
  const nextSong = songs[nextIndex];
  
  if (preloadedSongs[nextSong.id]) {
    // 清理之前的音频实例
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleAudioEnded);
    }
    
    // 使用预加载的音频
    audioRef.current = preloadedSongs[nextSong.id];
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.error('Play error:', e));
    
    setIsPlaying(true);
    setCurrentSong(nextSong);
    setCurrentSongIndex(nextIndex);
    
    audioRef.current.addEventListener('ended', handleAudioEnded);
  } else {
    playSong(nextSong, nextIndex);
  }
};

  const playPreviousSong = () => {
  if (songs.length === 0) return;
  
  const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  const prevSong = songs[prevIndex];
  
  if (preloadedSongs[prevSong.id]) {
    // 清理之前的音频实例
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleAudioEnded);
    }
    
    // 使用预加载的音频
    audioRef.current = preloadedSongs[prevSong.id];
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.error('Play error:', e));
    
    setIsPlaying(true);
    setCurrentSong(prevSong);
    setCurrentSongIndex(prevIndex);
    
    audioRef.current.addEventListener('ended', handleAudioEnded);
  } else {
    playSong(prevSong, prevIndex);
  }
};

  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center">
      <header className="App-header w-full bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">NewNewMusic</h1>
      </header>
      <main className="flex flex-col md:flex-row w-full max-w-6xl p-4 gap-8 pb-[96px] min-h-[calc(100vh-160px)]">
        <div className="song-list flex-1 bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Playlist</h2>
          {songs.length === 0 && <p className="text-gray-400">No songs available. Add some music!</p>}
          <ul className="space-y-2">
            {songs.map((song, index) => (
              <li
                key={song.id}
                onClick={() => playSong(song, index)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${currentSong?.id === song.id ? 'bg-gradient-to-r from-purple-700/80 to-blue-700/80 shadow-lg' : 'bg-gray-700/50 hover:bg-gray-600/30'}`}
              >
                <span className="font-medium">{song.title}</span> - <span className="text-gray-400">{song.artist}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="now-playing fixed bottom-0 left-0 right-0 w-full bg-neutral-900/90 backdrop-blur-md text-white z-50 border-t border-neutral-700/50 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
            <div className="flex items-center space-x-4 w-1/4">
              <div className="w-16 h-16 bg-neutral-700 rounded-md flex-shrink-0 overflow-hidden">
                {currentSong?.coverUrl ? (
                  <img src={currentSong.coverUrl} alt="Album cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                    <svg className="w-8 h-8 text-neutral-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2zm2-10v8h8v-8H8z"/></svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold truncate" title={currentSong?.title}>{currentSong?.title}</p>
                <p className="text-xs text-neutral-400 truncate" title={currentSong?.artist}>{currentSong?.artist}</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 px-4">
              <div className="flex items-center space-x-5 mb-2">
                <button onClick={playPreviousSong} className="text-neutral-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.516 10.126a.75.75 0 000-1.061L9.293 4.29a.75.75 0 00-1.06-1.06L3.21 8.252a2.25 2.25 0 000 3.182l5.023 5.023a.75.75 0 001.06-1.06l-4.777-4.777zM15.75 5.25a.75.75 0 00-1.06 0L9.914 9.027a.75.75 0 000 1.06L14.69 14.86a.75.75 0 001.06-1.06l-4.224-4.223 4.224-4.224a.75.75 0 000-1.06z"/></svg>
                </button>
                <button onClick={togglePlayPause} className="bg-green-500 hover:bg-green-600 text-black rounded-full p-3 transition-all duration-200 shadow-md">
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.75 4.75a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75v-9.5a.75.75 0 00-.75-.75h-1.5zm6.5 0a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75v-9.5a.75.75 0 00-.75-.75h-1.5z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 4.03A.75.75 0 005 4.75v10.5c0 .67.734 1.074 1.301.723l8.25-5.25a.75.75 0 000-1.246l-8.25-5.25A.75.75 0 006.3 4.03z" /></svg>
                  )}
                </button>
                <button onClick={playNextSong} className="text-neutral-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15.484 9.874a.75.75 0 010 1.061l-4.777 4.777a.75.75 0 11-1.06-1.06L14.172 10 9.646 5.477a.75.75 0 011.06-1.06l4.777 4.777zM4.25 14.75a.75.75 0 011.06 0L10.086 11a.75.75 0 010-1.06L5.31 5.163a.75.75 0 11-1.06 1.06l4.224 4.224-4.224 4.224a.75.75 0 010 1.06z"/></svg>
                </button>
              </div>
              <div className="w-full flex items-center space-x-2">
                <span className="text-xs text-neutral-400">0:00</span>
                <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden cursor-pointer group"
                  onClick={(e) => {
                    const audioElement = document.querySelector('audio');
                    if (!audioElement) return;
                    const progressBar = e.currentTarget;
                    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
                    const progressBarWidth = progressBar.offsetWidth;
                    const seekPercentage = clickPosition / progressBarWidth;
                    audioElement.currentTime = seekPercentage * audioElement.duration;
                    if (!isPlaying) {
                      audioElement.play().catch(e => console.error('Play error:', e));
                      setIsPlaying(true);
                    }
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const audioElement = document.querySelector('audio');
                    if (!audioElement) return;
                    const progressBar = e.currentTarget;
                    const touch = e.touches[0];
                    const clickPosition = touch.clientX - progressBar.getBoundingClientRect().left;
                    const progressBarWidth = progressBar.offsetWidth;
                    const seekPercentage = clickPosition / progressBarWidth;
                    audioElement.currentTime = seekPercentage * audioElement.duration;
                    if (!isPlaying) {
                      audioElement.play().catch(e => console.error('Play error:', e));
                      setIsPlaying(true);
                    }
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const audioElement = document.querySelector('audio');
                    if (!audioElement) return;
                    const progressBar = e.currentTarget;
                    const touch = e.touches[0];
                    const clickPosition = touch.clientX - progressBar.getBoundingClientRect().left;
                    const progressBarWidth = progressBar.offsetWidth;
                    const seekPercentage = clickPosition / progressBarWidth;
                    audioElement.currentTime = seekPercentage * audioElement.duration;
                  }}
                >
                  <div className="h-full bg-green-500 group-hover:bg-green-400 progress-bar" style={{ width: '30%' }}></div>
                </div>
                <span className="text-xs text-neutral-400">{currentSong?.duration || '3:45'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-1/4 justify-end">
              <button className="text-neutral-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14.75z"/></svg>
              </button>
              <div className="flex items-center space-x-1">
                <button className="text-neutral-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.03 3.58a.75.75 0 011.06-.02l5.567 5.22c.304.284.443.708.443 1.128s-.14.844-.443 1.128l-5.567 5.22a.75.75 0 01-1.142-.962L14.018 11H3.75a.75.75 0 010-1.5h10.268L8.948 4.542a.75.75 0 01.082-.962zM15.536 8.464a5 5 0 010 7.072M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728 2.728" /></svg>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    const audioElement = document.querySelector('audio');
                    if (audioElement) {
                      audioElement.volume = newVolume;
                    }
                  }}
                  className="w-20 h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-green-500"
                />
              </div>
            </div>
            {isPlaying && currentSong && currentSong.filePath && (
              <audio
                controls
                autoPlay
                src={`/api/songs/stream/${currentSong.filePath}`}
                className="hidden"
                onEnded={() => setIsPlaying(false)}
                volume={volume}
                onTimeUpdate={(e) => {
                  const audioElement = e.target;
                  const progressBar = document.querySelector('.progress-bar');
                  if (progressBar) {
                    const progressPercentage = (audioElement.currentTime / audioElement.duration) * 100;
                    progressBar.style.width = `${progressPercentage}%`;
                  }
                }}
              >
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppWithProvider() {
  return (
    <PlayerProvider>
      <App />
    </PlayerProvider>
  );
}