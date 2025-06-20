import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import {usePlayer} from '../contexts/PlayerContext';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/authContext';
import {FavoriteIcon} from '../components/Icons';
import { PlusIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';

function SongList() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { songs, currentSong, playSong, addFavorite, removeFavorite, isFavorite, favoriteError, clearFavoriteError, setSongs } = usePlayer();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'compact'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'title', 'artist', 'duration'
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchPlaylists();
    }
  }, [currentUser]);

  const fetchPlaylists = async () => {
    try {
      const response = await authService.getMyPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const handleAddToPlaylist = (song) => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    setSelectedSong(song);
    setShowPlaylistModal(true);
  };

  const addSongToPlaylist = async (playlistId) => {
    try {
      await authService.addSongToPlaylist(playlistId, selectedSong.id);
      alert('歌曲已添加到播放列表');
      setShowPlaylistModal(false);
      setSelectedSong(null);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      alert('添加失败，请重试');
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSongs(items);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSortedSongs = () => {
    if (sortBy === 'default') return songs;
    return [...songs].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          const artistA = Array.isArray(a.artist) ? a.artist.join(', ') : a.artist;
          const artistB = Array.isArray(b.artist) ? b.artist.join(', ') : b.artist;
          return artistA.localeCompare(artistB);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-outline-light dark:border-outline-dark overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-outline-light dark:border-outline-dark bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-1">Playlist</h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Your music collection</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                0 songs
              </span>
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-800 to-secondary-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No songs in your playlist</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Start building your music collection by uploading songs or searching for your favorites.
          </p>
        </div>
      </div>
    );
  }

  const sortedSongs = getSortedSongs();

  return (
    <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-outline-light dark:border-outline-dark overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-outline-light dark:border-outline-dark bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-1">Playlist</h2>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {songs.length} song{songs.length !== 1 ? 's' : ''} • Drag to reorder
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
              {songs.length} songs
            </span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-outline-light dark:border-outline-dark rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="default">Default Order</option>
              <option value="title">Sort by Title</option>
              <option value="artist">Sort by Artist</option>
              <option value="duration">Sort by Duration</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
          
          {/* Play All Button */}
          <button
            onClick={() => playSong(sortedSongs[0], 0)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all hover:shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play All</span>
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {favoriteError && (
        <div className="mx-6 mt-4 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-error-700 dark:text-error-300">{favoriteError}</span>
          </div>
          <button 
            onClick={clearFavoriteError} 
            className="p-1 hover:bg-error-100 dark:hover:bg-error-800 rounded-full transition-colors"
            aria-label="Clear error"
          >
            <svg className="w-4 h-4 text-error-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}
      {/* Song List */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="songs" key="song-list-droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <div className={viewMode === 'list' ? 'space-y-2' : 'space-y-1'}>
                  {sortedSongs.map((song, index) => {
                    const isCurrentSong = currentSong?.id === song.id;
                    const isFav = isFavorite(song.id);
                    const artist = Array.isArray(song.artist) ? song.artist.join(', ') : song.artist;
                    
                    return (
                      <Draggable key={song.id} draggableId={String(song.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative rounded-xl transition-all duration-200 ${
                              snapshot.isDragging
                                ? 'shadow-xl scale-105 rotate-2 z-50'
                                : 'hover:shadow-md'
                            } ${
                              isCurrentSong
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-outline-light dark:border-outline-dark'
                            }`}
                          >
                            {viewMode === 'list' ? (
                              /* List View */
                              <div className="flex items-center p-4 space-x-4">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className={`flex-shrink-0 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${
                                    isCurrentSong
                                      ? 'text-white/70 hover:text-white'
                                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                                  </svg>
                                </div>
                                
                                {/* Song Cover Placeholder */}
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isCurrentSong
                                    ? 'bg-white/20'
                                    : 'bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-800 dark:to-secondary-800'
                                }`}>
                                  <svg className={`w-6 h-6 ${
                                    isCurrentSong
                                      ? 'text-white'
                                      : 'text-primary-600 dark:text-primary-400'
                                  }`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                  </svg>
                                </div>
                                
                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    to={`/song/${song.id}`}
                                    className={`font-semibold truncate block hover:underline ${
                                      isCurrentSong
                                        ? 'text-white'
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                  >
                                    {song.title}
                                  </Link>
                                  <p 
                                    onClick={() => playSong(song, index)}
                                    className={`text-sm truncate cursor-pointer ${
                                      isCurrentSong
                                        ? 'text-white/80'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                  >
                                    {artist}
                                  </p>
                                </div>
                                
                                {/* Duration */}
                                <div className={`text-sm font-medium ${
                                  isCurrentSong
                                    ? 'text-white/80'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {formatDuration(song.duration)}
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                  {/* Play Button */}
                                  <button
                                    onClick={() => playSong(song, index)}
                                    className={`p-2 rounded-full transition-all hover:scale-110 ${
                                      isCurrentSong
                                        ? 'bg-white/20 text-white hover:bg-white/30'
                                        : 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-700'
                                    }`}
                                    aria-label="Play song"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </button>
                                  
                                  {/* Add to Playlist Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToPlaylist(song);
                                    }}
                                    className={`p-2 rounded-full transition-all hover:scale-110 ${
                                      isCurrentSong
                                        ? 'text-white/60 hover:text-white'
                                        : 'text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-500'
                                    }`}
                                    aria-label="Add to playlist"
                                  >
                                    <PlusIcon className="w-4 h-4" />
                                  </button>
                                  
                                  {/* Favorite Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      isFav ? removeFavorite(song.id) : addFavorite(song);
                                    }}
                                    className={`p-2 rounded-full transition-all hover:scale-110 ${
                                      isFav
                                        ? 'text-yellow-500 hover:text-yellow-600'
                                        : isCurrentSong
                                          ? 'text-white/60 hover:text-white'
                                          : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-500'
                                    }`}
                                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                  >
                                    <FavoriteIcon 
                                      color={isFav ? '#EAB308' : 'currentColor'} 
                                      size={16} 
                                    />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Compact View */
                              <div className="flex items-center p-3 space-x-3">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className={`flex-shrink-0 p-1 rounded cursor-grab active:cursor-grabbing transition-colors ${
                                    isCurrentSong
                                      ? 'text-white/70 hover:text-white'
                                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                                  </svg>
                                </div>
                                
                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <Link 
                                        to={`/song/${song.id}`}
                                        className={`font-medium truncate hover:underline ${
                                          isCurrentSong
                                            ? 'text-white'
                                            : 'text-gray-900 dark:text-gray-100'
                                        }`}
                                      >
                                        {song.title}
                                      </Link>
                                      <span className={`mx-2 ${
                                        isCurrentSong
                                          ? 'text-white/60'
                                          : 'text-gray-400 dark:text-gray-500'
                                      }`}>•</span>
                                      <span 
                                        onClick={() => playSong(song, index)}
                                        className={`text-sm cursor-pointer ${
                                          isCurrentSong
                                            ? 'text-white/80'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                      >
                                        {artist}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                      <span className={`text-xs ${
                                        isCurrentSong
                                          ? 'text-white/70'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        {formatDuration(song.duration)}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToPlaylist(song);
                                        }}
                                        className={`p-1 rounded transition-all hover:scale-110 ${
                                          isCurrentSong
                                            ? 'text-white/60 hover:text-white'
                                            : 'text-gray-400 hover:text-green-500 dark:text-gray-500'
                                        }`}
                                        aria-label="Add to playlist"
                                      >
                                        <PlusIcon className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          isFav ? removeFavorite(song.id) : addFavorite(song);
                                        }}
                                        className={`p-1 rounded transition-all hover:scale-110 ${
                                          isFav
                                            ? 'text-yellow-500'
                                            : isCurrentSong
                                              ? 'text-white/60 hover:text-white'
                                              : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500'
                                        }`}
                                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                      >
                                        <FavoriteIcon 
                                          color={isFav ? '#EAB308' : 'currentColor'} 
                                          size={14} 
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Current Song Indicator */}
                            {isCurrentSong && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Playlist Selection Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              选择播放列表
            </h3>
            
            {playlists.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                您还没有创建任何播放列表
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => addSongToPlaylist(playlist.id)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {playlist.name}
                    </div>
                    {playlist.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {playlist.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  setSelectedSong(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SongList;