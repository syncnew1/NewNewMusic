import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
    login(username, password) {
        return axios
            .post(API_URL + 'login', {
                username,
                password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                }
                return response.data;
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('storage')); // 通知AuthContext
                    throw new Error('用户名或密码错误');
                }
                throw error;
            });
    }

    logout() {
        localStorage.removeItem('user');
    }

    register(username, email, password) {
        // 前端验证用户名和密码格式
        if (username.length < 3 || username.length > 20) {
            return Promise.reject(new Error('用户名长度需在3-20个字符之间'));
        }
        if (password.length < 6 || password.length > 40) {
            return Promise.reject(new Error('密码长度需在6-40个字符之间'));
        }
        
        return axios.post(API_URL + 'register', {
            username,
            email,
            password
        })
        .catch(error => {
            if (error.response) {
                if (error.response.status === 400) {
                    throw new Error('注册失败：' + (error.response.data.message || '用户名或密码不符合规范'));
                }
                if (error.response.status === 401) {
                    throw new Error('注册失败，请检查输入信息');
                }
            }
            throw error;
        });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    authHeader() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            return { Authorization: 'Bearer ' + user.accessToken };
        } else {
            return {};
        }
    }

    // 获取我的播放列表
    getMyPlaylists() {
        return axios.get('http://localhost:8080/api/playlists/my', {
            headers: this.authHeader()
        });
    }

    // 添加歌曲到播放列表
    addSongToPlaylist(playlistId, songId) {
        return axios.post(`http://localhost:8080/api/playlists/${playlistId}/songs`, {
            songId: songId
        }, {
            headers: this.authHeader()
        });
    }
}

export default new AuthService();