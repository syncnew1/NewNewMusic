import axios from 'axios';
import authService from './authService';

const API_URL = '/api/users';

class FollowService {
  // 关注用户
  followUser(userId) {
    return axios.post(`/api/follow/${userId}/follow`, {}, {
      headers: authService.authHeader()
    });
  }

  // 取消关注用户
  unfollowUser(userId) {
    return axios.delete(`/api/follow/${userId}/follow`, {
      headers: authService.authHeader()
    });
  }

  // 获取用户的关注列表
  getFollowing(userId, page = 1, limit = 20) {
    return axios.get(`/api/follow/${userId}/following?page=${page}&limit=${limit}`, {
      headers: authService.authHeader()
    });
  }

  // 获取用户的粉丝列表
  getFollowers(userId, page = 1, limit = 20) {
    return axios.get(`/api/follow/${userId}/followers?page=${page}&limit=${limit}`, {
      headers: authService.authHeader()
    });
  }

  // 检查是否关注某个用户
  checkFollowStatus(userId) {
    return axios.get(`/api/follow/${userId}/follow-status`, {
      headers: authService.authHeader()
    });
  }

  // 获取用户统计信息（关注数、粉丝数等）
  getUserStats(userId) {
    return axios.get(`/api/follow/${userId}/stats`, {
      headers: authService.authHeader()
    });
  }
}

export default new FollowService();