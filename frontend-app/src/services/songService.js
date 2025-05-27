import axios from 'axios';
import authHeader from './authHeader';

const API_URL = 'http://localhost:8080/api/songs';

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
    return axios.get(`${API_URL}/favorites/user`, { headers: authHeader() });
};

const isSongFavorited = (songId) => {
    return axios.get(`${API_URL}/${songId}/isFavorite`, { headers: authHeader() });
};

const getRecommendedSongs = () => {
    return axios.get(`${API_URL}/recommendations`, { headers: authHeader() }).then(response => response.data);
};

const uploadSong = (formData) => {
    return axios.post(`${API_URL}/upload`, formData, {
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