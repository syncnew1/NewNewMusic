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
        audioRef.current.play().catch(error => {
        // 静默处理音频播放错误
      });
      } else {
        audioRef.current.pause();
      }
    }
    
    // 清理函数：组件卸载时暂停音频
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-bg/95 backdrop-blur-md border-t border-border-color shadow-strong transition-all duration-300 ease-in-out">
      {currentSong && currentSong.filePath && (
        <audio 
          ref={audioRef} 
          src={`http://localhost:8080/api/songs/stream/${currentSong.id}`}
          onTimeUpdate={updateProgress}
          onLoadedMetadata={updateProgress} 
          onEnded={handlePlayNext}
        />
      )}
      
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Song Info */}
            <div className="flex items-center space-x-4 min-w-0 flex-1 max-w-xs">
              {currentSong ? (
                <>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-color to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">♪</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-primary-text truncate">
                      {currentSong.title || 'Unknown Title'}
                    </p>
                    <p className="text-xs text-secondary-text truncate">
                      {Array.isArray(currentSong.artist) ? currentSong.artist.join(', ') : (currentSong.artist || 'Unknown Artist')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center">
                    <span className="text-secondary-text text-lg">♪</span>
                  </div>
                  <p className="text-sm text-secondary-text">No song selected</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-3 flex-1 max-w-md">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handlePlayPrev} 
                  disabled={!currentSong || songs.length === 0} 
                  className="p-2 rounded-full bg-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                  aria-label="Previous song"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                
                <button 
                  onClick={togglePlayPause} 
                  disabled={!currentSong} 
                  className="p-3 rounded-full bg-accent-color text-accent-text-color hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-medium"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={handlePlayNext} 
                  disabled={!currentSong || songs.length === 0} 
                  className="p-2 rounded-full bg-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                  aria-label="Next song"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>
              
              {/* Progress Bar */}
              {currentSong && (
                <div className="w-full flex items-center space-x-3">
                  <span className="text-xs text-secondary-text font-mono min-w-[40px]">
                    {formatTime(audioRef.current?.currentTime || 0)}
                  </span>
                  <div className="flex-1 relative">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={progress} 
                      onChange={handleProgressChange} 
                      className="w-full h-2 bg-outline rounded-full appearance-none cursor-pointer slider"
                      disabled={!currentSong}
                    />
                  </div>
                  <span className="text-xs text-secondary-text font-mono min-w-[40px]">
                    {formatTime(duration)}
                  </span>
                </div>
              )}
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3 min-w-0 flex-1 max-w-xs justify-end">
              <svg className="w-5 h-5 text-secondary-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <div className="w-24 relative">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={handleVolumeChange} 
                  className="w-full h-2 bg-outline rounded-full appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-4 py-3">
          {/* Progress Bar */}
          {currentSong && (
            <div className="mb-3">
              <div className="relative">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={handleProgressChange} 
                  className="w-full h-1 bg-outline rounded-full appearance-none cursor-pointer slider"
                  disabled={!currentSong}
                />
              </div>
              <div className="flex justify-between text-xs text-secondary-text mt-1">
                <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {/* Song Info */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {currentSong ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-color to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">♪</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-primary-text truncate">
                      {currentSong.title || 'Unknown Title'}
                    </p>
                    <p className="text-xs text-secondary-text truncate">
                      {Array.isArray(currentSong.artist) ? currentSong.artist.join(', ') : (currentSong.artist || 'Unknown Artist')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                    <span className="text-secondary-text">♪</span>
                  </div>
                  <p className="text-sm text-secondary-text">No song selected</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePlayPrev} 
                disabled={!currentSong || songs.length === 0} 
                className="p-2 rounded-full bg-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Previous song"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>
              
              <button 
                onClick={togglePlayPause} 
                disabled={!currentSong} 
                className="p-2.5 rounded-full bg-accent-color text-accent-text-color hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <button 
                onClick={handlePlayNext} 
                disabled={!currentSong || songs.length === 0} 
                className="p-2 rounded-full bg-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Next song"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom slider styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--accent-color);
            cursor: pointer;
            border: 2px solid var(--card-bg);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--accent-color);
            cursor: pointer;
            border: 2px solid var(--card-bg);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-webkit-slider-track {
            background: var(--outline);
            border-radius: 4px;
          }
          
          .slider::-moz-range-track {
            background: var(--outline);
            border-radius: 4px;
          }
        `
      }} />
    </div>
  );
}

export default PlayerControls;