import axios from 'axios';
import authHeader from './authHeader'; // Function to get JWT token for authenticated requests

const API_URL = '/api/user';

const getUserProfile = () => {
    return axios.get(API_URL + '/profile', { headers: authHeader() });
};

const updateUserProfile = (profileData) => {
    return axios.put(API_URL + '/profile', profileData, { headers: authHeader() });
};

const updateUserPassword = (passwordData) => {
    return axios.put(API_URL + '/password', passwordData, { headers: authHeader() });
};

const userService = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
};

export default userService;