import axios from 'axios';
import authService from './authService'; // Import authService instead of authHeader
const API_URL = '/api/user';

const getUserProfile = () => {
    return axios.get(API_URL + '/profile', { headers: authService.authHeader() }); // Call authService.authHeader()
};

const updateUserProfile = (profileData) => {
    return axios.put(API_URL + '/profile', profileData, { headers: authService.authHeader() }); // Call authService.authHeader()
};

const updateUserPassword = (passwordData) => {
    return axios.put(API_URL + '/password', passwordData, { headers: authService.authHeader() }); // Call authService.authHeader()
};

const userService = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
};

export default userService;