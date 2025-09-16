import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PlaylistForm from './PlaylistForm';

const PlaylistModal = ({ 
  isOpen, 
  onClose, 
  playlist, 
  mode, // 'edit' or 'delete'
  onEdit, 
  onDelete,
  loading 
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirmText === playlist.name) {
      onDelete(playlist.id, playlist.name);
      setConfirmText('');
    }
  };

  const handleEdit = (playlistData) => {
    onEdit(playlistData);
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg/95 backdrop-blur-sm rounded-2xl border border-border-color/50 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color/30">
          <h2 className="text-xl font-semibold text-primary-text flex items-center">
            {mode === 'edit' ? (
              <>
                <PencilIcon className="w-6 h-6 mr-2 text-accent-color" />
                编辑歌单
              </>
            ) : (
              <>
                <TrashIcon className="w-6 h-6 mr-2 text-red-500" />
                删除歌单
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface/50 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'edit' ? (
            <PlaylistForm
              initialPlaylist={playlist}
              onSubmit={handleEdit}
              onCancel={handleClose}
              loading={loading}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  ⚠️ 此操作不可撤销！删除后歌单中的所有歌曲将被移除。
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-primary-text mb-2">歌单信息</h3>
                  <div className="bg-surface/50 rounded-lg p-3 space-y-1">
                    <p className="text-primary-text font-medium">{playlist.name}</p>
                    {playlist.description && (
                      <p className="text-secondary-text text-sm">{playlist.description}</p>
                    )}
                    <p className="text-secondary-text text-xs">
                      {playlist.isPublic ? '公开歌单' : '私有歌单'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    请输入歌单名称「{playlist.name}」来确认删除：
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={`请输入：${playlist.name}`}
                    className="w-full px-3 py-2 bg-surface border border-border-color rounded-lg text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-border-color rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface/50 transition-all duration-200"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== playlist.name || loading}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    confirmText === playlist.name && !loading
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>删除中...</span>
                    </div>
                  ) : (
                    '确认删除'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;