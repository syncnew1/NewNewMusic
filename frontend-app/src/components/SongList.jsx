import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {usePlayer} from '../contexts/PlayerContext';
import {useTheme} from '../contexts/ThemeContext';
import {FavoriteIcon} from '../components/Icons';

function SongList() {
  const { theme } = useTheme();
  const { songs, currentSong, playSong, addFavorite, removeFavorite, isFavorite, favoriteError, clearFavoriteError, setSongs } = usePlayer(); // 从上下文添加setSongs

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSongs(items); // 在上下文中更新歌曲
  };

  if (!songs || songs.length === 0) {
    return (
      <div className={`song-list flex-1 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Playlist</h2>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No songs available. Add some music!</p>
      </div>
    );
  }

  return (
    <div className={`song-list flex-1 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Playlist</h2>
      {favoriteError && (
        <div className={`mb-4 p-3 rounded-md flex justify-between items-center ${theme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700'}`}>
          <span>{favoriteError}</span>
          <button 
            onClick={clearFavoriteError} 
            className={`ml-2 p-1 rounded-full ${theme === 'dark' ? 'hover:bg-red-700' : 'hover:bg-red-200'}`}
            aria-label="Clear error"
          >
            ✕
          </button>
        </div>
      )}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="songs" key="song-list-droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <ul className="space-y-2">
                {songs.map((song, index) => (
                  <Draggable key={song.id} draggableId={String(song.id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <li
                          className={`flex justify-between items-center p-4 rounded-md transition-all duration-300 ease-in-out ${currentSong?.id === song.id ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg') : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800')}`}
                        >
                          <div onClick={() => playSong(song, index)} className="flex-grow cursor-pointer">
                            <span className="font-medium">{song.title}</span> - <span className={currentSong?.id === song.id ? (theme === 'dark' ? 'text-blue-200' : 'text-blue-100') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>{song.artist}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              isFavorite(song.id) ? removeFavorite(song.id) : addFavorite(song);
                            }}
                            className={`ml-4 p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200`}
                            aria-label={isFavorite(song.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <FavoriteIcon color={isFavorite(song.id) ? '#FCB510' : '#cdcdcd'} size={24} />
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