import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx';
import { PlayerProvider } from './contexts/PlayerContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)