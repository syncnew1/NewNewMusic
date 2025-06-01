import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {usePlayer} from '../contexts/PlayerContext';
import {useTheme} from '../contexts/ThemeContext';
import {FavoriteIcon} from '../components/Icons';

function SongList() {
  const { theme } = useTheme();
  const { songs, currentSong, playSong, addFavorite, removeFavorite, isFavorite, favoriteError, clearFavoriteError, setSongs } = usePlayer();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSongs(items);
  };

  if (!enabled) {
    return null;
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="song-list flex-1 p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">🎵 播放列表</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">暂无歌曲</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">添加一些音乐来开始播放吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="song-list flex-1 p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">🎵 播放列表</h2>
        <div className="ml-auto bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{songs.length} 首歌曲</span>
        </div>
      </div>
      {favoriteError && (
        <div className="mb-6 p-4 rounded-xl flex justify-between items-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 dark:text-red-300">{favoriteError}</span>
          </div>
          <button 
            onClick={clearFavoriteError} 
            className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-red-500 transition-colors duration-200"
            aria-label="Clear error"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="songs">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <ul className="space-y-2">
                {songs.map((song, index) => (
                  <Draggable key={`song-${song.id}`} draggableId={`song-${song.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <li
                          className={`group flex justify-between items-center p-5 rounded-xl transition-all duration-300 ease-in-out ${
                            snapshot.isDragging 
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/50 border-2 border-blue-300 opacity-90'
                              : currentSong?.id === song.id 
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transform hover:scale-[1.02]' 
                                : 'bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 transform hover:scale-[1.02]'
                          }`}
                        >
            <div onClick={() => playSong(song, index)} className="flex items-center space-x-4 flex-grow cursor-pointer">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                currentSong?.id === song.id 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}>
                <svg className={`w-6 h-6 ${
                  currentSong?.id === song.id ? 'text-white' : 'text-white'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-lg truncate ${
                  currentSong?.id === song.id ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>{song.title}</p>
                <p className={`text-sm truncate ${
                  currentSong?.id === song.id 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>{song.artist}</p>
              </div>
              {currentSong?.id === song.id && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                isFavorite(song.id) ? removeFavorite(song.id) : addFavorite(song);
              }}
              className={`ml-4 p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${
                currentSong?.id === song.id 
                  ? 'hover:bg-white/20' 
                  : 'hover:bg-blue-100 dark:hover:bg-blue-800'
              }`}
              aria-label={isFavorite(song.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FavoriteIcon 
                color={isFavorite(song.id) ? '#FCB510' : (currentSong?.id === song.id ? '#ffffff' : '#9ca3af')} 
                size={20} 
              />
            </button>
                         </li>
                       </div>
                     )}
                   </Draggable>
                 ))}
                 {provided.placeholder}
               </ul>
             </div>
           )}
         </Droppable>
       </DragDropContext>
    </div>
  );
}

export default SongList;