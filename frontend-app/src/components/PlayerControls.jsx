import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useTheme } from '../contexts/ThemeContext';

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
    <div className={`player-controls p-4 fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] text-[var(--primary-text)] border-t border-[var(--border-color)] transition-colors duration-300`}>
      {currentSong && currentSong.filePath && (
        <audio 
          ref={audioRef} 
          src={`http://localhost:8080/api/songs/stream/${currentSong.filePath}`}
          onTimeUpdate={updateProgress}
          onLoadedMetadata={updateProgress} 
          onEnded={handlePlayNext} // Automatically play next song when current ends
        />
      )}
      <div className="flex items-center justify-between">
        <div className="song-info w-1/4">
          {currentSong ? (
            <>
              <p className="text-lg font-semibold">{currentSong.title || 'Unknown Title'}</p>
              <p className={`text-sm text-[var(--secondary-text)]`}>{currentSong.artist || 'Unknown Artist'}</p>
            </>
          ) : (
            <p>No song selected</p>
          )}
        </div>

        <div className="controls flex flex-col items-center w-1/2">
          <div className={`flex items-center space-x-4 mb-2 text-[var(--primary-text)]`}>
            <button onClick={handlePlayPrev} disabled={!currentSong || songs.length === 0} className={`px-3 py-1 rounded disabled:opacity-50 bg-[var(--card-bg)] hover:opacity-[var(--button-hover-opacity)] text-[var(--primary-text)] transition-opacity duration-300`}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-skip-back"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg></button>
            <button onClick={togglePlayPause} disabled={!currentSong} className={`px-4 py-2 rounded disabled:opacity-50 bg-[var(--accent-color)] hover:opacity-[var(--button-hover-opacity)] text-[var(--accent-text-color)] transition-opacity duration-300`}>
              {isPlaying ? 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>}
            </button>
            <button onClick={handlePlayNext} disabled={!currentSong || songs.length === 0} className={`px-3 py-1 rounded disabled:opacity-50 bg-[var(--card-bg)] hover:opacity-[var(--button-hover-opacity)] text-[var(--primary-text)] transition-opacity duration-300`}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-skip-forward"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg></button>
          </div>
          {currentSong && (
            <div className="progress-bar w-full flex items-center">
              <span className={`text-xs mr-2 text-[var(--secondary-text)]`}>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={handleProgressChange} 
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--border-color)] dark:bg-gray-700`}
                disabled={!currentSong}
              />
              <span className={`text-xs ml-2 text-[var(--secondary-text)]`}>{formatTime(duration)}</span>
            </div>
          )}
        </div>

        <div className={`volume-control w-1/4 flex items-center justify-end text-[var(--primary-text)]`}>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            className={`w-24 h-2 rounded-lg appearance-none cursor-pointer bg-[var(--border-color)] dark:bg-gray-700`}
          />
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;