import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx';
import {PlayerProvider} from './contexts/PlayerContext';
import {ThemeProvider} from './contexts/ThemeContext'; 
import {AuthProvider} from './contexts/authContext.jsx'; 
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>,
)