import { useEffect } from 'react';
import './App.css';
import { usePlayer } from './context/PlayerContext';
import SongList from './components/SongList';
import PlayerControls from './components/PlayerControls';

function App() {
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
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center">
      <header className="App-header w-full bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">NewNewMusic</h1>
      </header>
      <main className="flex flex-col md:flex-row w-full max-w-6xl p-4 gap-8 pb-[96px] min-h-[calc(100vh-160px)]">
        <SongList />
      </main>
      <PlayerControls />
    </div>
  );
}

export default App;