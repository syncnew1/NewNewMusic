import React from 'react';
import { usePlayer } from '../context/PlayerContext';

function SongList() {
  const { songs, currentSong, playSong } = usePlayer();

  if (!songs || songs.length === 0) {
    return (
      <div className="song-list flex-1 bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Playlist</h2>
        <p className="text-gray-400">No songs available. Add some music!</p>
      </div>
    );
  }

  return (
    <div className="song-list flex-1 bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Playlist</h2>
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
  );
}

export default SongList;