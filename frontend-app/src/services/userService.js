import axios from 'axios';
import authService from './authService'; // 导入authService而不是authHeader
const API_URL = '/api/users';

const getUserProfile = () => {
    return axios.get(API_URL + '/profile', { headers: authService.authHeader() }); // 调用authService.authHeader()
};

const updateUserProfile = (profileData) => {
    return axios.put(API_URL + '/profile', profileData, { headers: authService.authHeader() }); // 调用authService.authHeader()
};

const updateUserPassword = (passwordData) => {
    return axios.put(API_URL + '/password', passwordData, { headers: authService.authHeader() }); // 调用authService.authHeader()
};

const userService = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
};

export default userService;