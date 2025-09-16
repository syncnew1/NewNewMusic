import axios from 'axios';
import authHeader from './authHeader';

const API_URL = '/api/songs';

const getAllSongs = () => {
    return axios.get(API_URL);
};

const getSongById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const addFavoriteSong = (songId) => {
    return axios.post(`${API_URL}/${songId}/favorite`, {}, { headers: authHeader() });
};

const removeFavoriteSong = (songId) => {
    return axios.delete(`${API_URL}/${songId}/favorite`, { headers: authHeader() });
};

const getFavoriteSongs = () => {
    return axios.get(`${API_URL}/favorites`, { headers: authHeader() });
};

const isSongFavorited = (songId) => {
    return axios.get(`${API_URL}/${songId}/isFavorite`, { headers: authHeader() });
};

const getRecommendedSongs = () => {
    console.log('🔗 调用推荐API:', `${API_URL}/recommendations`);
    console.log('🔑 请求头:', authHeader());
    return axios.get(`${API_URL}/recommendations`, { headers: authHeader() })
        .then(response => {
            console.log('✅ 推荐API响应:', response);
            console.log('📊 响应数据:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('❌ 推荐API错误:', error);
            console.error('❌ 错误详情:', error.response?.data);
            throw error;
        });
};

const uploadSong = (formData) => {
    return axios.post(API_URL, formData, {
        headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
        },
    });
};


export default {
    getAllSongs,
    getSongById,
    addFavoriteSong,
    removeFavoriteSong,
    getFavoriteSongs,
    isSongFavorited,
    getRecommendedSongs,
    uploadSong,
};