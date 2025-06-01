import React from 'react';
import {usePlayer} from '../contexts/PlayerContext';
import {useTheme} from '../contexts/ThemeContext';

function PlayerControls() {
  const { theme } = useTheme();
  const { 
    currentSong, 
    isPlaying, 
    setIsPlaying, 
    volume, 
    setVolume, 
    songs,
    currentSongIndex,
    setCurrentSongIndex,
    setCurrentSong
  } = usePlayer();

  const audioRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayNext = () => {
    if (songs.length === 0) return;
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePlayPrev = () => {
    if (songs.length === 0) return;
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleProgressChange = (e) => {
    if (audioRef.current && currentSong) {
      const newTime = (audioRef.current.duration / 100) * e.target.value;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const updateProgress = () => {
    if (audioRef.current && currentSong) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={`player-controls p-6 fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-blue-200 dark:border-gray-700 shadow-2xl transition-all duration-300`}>
      {currentSong && currentSong.filePath && (
        <audio 
          ref={audioRef} 
          src={`http://localhost:8080/api/songs/stream/${currentSong.filePath}`}
          onTimeUpdate={updateProgress}
          onLoadedMetadata={updateProgress} 
          onEnded={handlePlayNext} // Automatically play next song when current ends
        />
      )}
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="song-info w-1/4 min-w-0">
          {currentSong ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{currentSong.title || 'Unknown Title'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{currentSong.artist || 'Unknown Artist'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No song selected</p>
            </div>
          )}
        </div>

        <div className="controls flex flex-col items-center w-1/2">
          <div className="flex items-center space-x-6 mb-3">
            <button 
              onClick={handlePlayPrev} 
              disabled={!currentSong || songs.length === 0} 
              className="p-2 rounded-full disabled:opacity-50 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>
            <button 
              onClick={togglePlayPause} 
              disabled={!currentSong} 
              className="p-4 rounded-full disabled:opacity-50 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200 transform hover:scale-110 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {isPlaying ? 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              }
            </button>
            <button 
              onClick={handlePlayNext} 
              disabled={!currentSong || songs.length === 0} 
              className="p-2 rounded-full disabled:opacity-50 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>
          {currentSong && (
            <div className="progress-bar w-full flex items-center space-x-3">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono min-w-[40px]">{formatTime(audioRef.current?.currentTime || 0)}</span>
              <div className="flex-1 relative">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={handleProgressChange} 
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 slider"
                  disabled={!currentSong}
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono min-w-[40px]">{formatTime(duration)}</span>
            </div>
          )}
        </div>

        <div className="volume-control w-1/4 flex items-center justify-end space-x-3">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            className="w-24 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;