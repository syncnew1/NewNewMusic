import React, { useState } from 'react';
import songService from '../services/songService';
import '../styles/index.css';

const UploadPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        artists: [''], // 改为数组支持多个艺术家
        album: '',
        genre: ''
    });
    const [audioFile, setAudioFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    // 音乐流派选项
    const genreOptions = [
        'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 'Classical',
        'Folk', 'Blues', 'Reggae', 'Punk', 'Metal', 'Alternative', 'Indie', 'Soul',
        'Funk', 'Disco', 'House', 'Techno', 'Ambient', 'World Music', 'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 处理艺术家输入变化
    const handleArtistChange = (index, value) => {
        const newArtists = [...formData.artists];
        newArtists[index] = value;
        setFormData(prev => ({
            ...prev,
            artists: newArtists
        }));
    };

    // 添加艺术家字段
    const addArtist = () => {
        if (formData.artists.length < 5) { // 最多5个艺术家
            setFormData(prev => ({
                ...prev,
                artists: [...prev.artists, '']
            }));
        }
    };

    // 移除艺术家字段
    const removeArtist = (index) => {
        if (formData.artists.length > 1) {
            const newArtists = formData.artists.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                artists: newArtists
            }));
        }
    };

    // 处理拖拽
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelection = (file) => {
        // 验证文件类型
        const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|m4a)$/i)) {
            setError('请选择有效的音频文件 (MP3, WAV, FLAC, M4A)');
            return;
        }
        
        // 验证文件大小 (最大50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('文件大小不能超过50MB');
            return;
        }
        
        setAudioFile(file);
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!audioFile) {
            setError('请选择音频文件');
            return;
        }

        if (!formData.title || !formData.artists[0]) {
            setError('歌曲标题和至少一个艺术家是必填项');
            return;
        }

        // 过滤空的艺术家字段
        const validArtists = formData.artists.filter(artist => artist.trim() !== '');
        if (validArtists.length === 0) {
            setError('至少需要一个艺术家');
            return;
        }

        setUploading(true);
        setError('');
        setMessage('');

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('audioFile', audioFile);
            uploadFormData.append('title', formData.title);
            // 发送艺术家数组
            validArtists.forEach(artist => {
                uploadFormData.append('artist', artist.trim());
            });
            uploadFormData.append('album', formData.album);
            uploadFormData.append('genre', formData.genre);

            const response = await songService.uploadSong(uploadFormData);
            setMessage('歌曲上传成功！');
            
            // 重置表单
            setFormData({
                title: '',
                artists: [''],
                album: '',
                genre: ''
            });
            setAudioFile(null);
            document.getElementById('audio-file').value = '';
            
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.error || '上传失败');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-[#0f1116] rounded-2xl shadow-xl border border-outline-light dark:border-violet-600/30 overflow-hidden">
                {/* Header */}
                <div className="p-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                <path d="M14 2v6h6" />
                                <path d="M12 18v-6l-3 3 3 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">上传新歌曲</h1>
                            <p className="text-white/80 text-sm">分享您的音乐作品</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mx-8 mt-6 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center space-x-3">
                        <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-success-700 dark:text-success-300">{message}</span>
                    </div>
                )}
                
                {error && (
                    <div className="mx-8 mt-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-3">
                        <svg className="w-5 h-5 text-error-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-error-700 dark:text-error-300">{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                            音频文件 <span className="text-error-500">*</span>
                        </label>
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                dragActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : audioFile
                                        ? 'border-success-300 bg-success-50 dark:bg-success-900/20'
                                        : 'border-gray-300 dark:border-violet-600/30 hover:border-violet-400 dark:hover:border-violet-500'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="audio-file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            
                            {audioFile ? (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 bg-success-100 dark:bg-success-800 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{audioFile.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAudioFile(null);
                                            document.getElementById('audio-file').value = '';
                                        }}
                                        className="text-sm text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                                    >
                                        移除文件
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">拖拽文件到此处</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">或点击选择文件</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        支持 MP3, WAV, FLAC, M4A 格式，最大 50MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                            歌曲标题 <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-outline-light dark:border-outline-dark rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="请输入歌曲标题"
                            required
                        />
                    </div>

                    {/* Artists */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                艺术家 <span className="text-error-500">*</span>
                            </label>
                            {formData.artists.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addArtist}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    + 添加艺术家
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {formData.artists.map((artist, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={artist}
                                        onChange={(e) => handleArtistChange(index, e.target.value)}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-outline-light dark:border-outline-dark rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder={`艺术家 ${index + 1}`}
                                        required={index === 0}
                                    />
                                    {formData.artists.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArtist(index)}
                                            className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Album */}
                    <div className="space-y-2">
                        <label htmlFor="album" className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                            专辑
                        </label>
                        <input
                            type="text"
                            id="album"
                            name="album"
                            value={formData.album}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-outline-light dark:border-outline-dark rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="请输入专辑名称"
                        />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                        <label htmlFor="genre" className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                            音乐流派
                        </label>
                        <select
                            id="genre"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-outline-light dark:border-outline-dark rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                        >
                            <option value="">选择音乐流派</option>
                            {genreOptions.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>上传中...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                        <path d="M14 2v6h6" />
                                        <path d="M12 18v-6l-3 3 3 3z" />
                                    </svg>
                                    <span>上传歌曲</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadPage;