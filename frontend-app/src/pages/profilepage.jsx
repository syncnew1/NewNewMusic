import React, {useContext, useEffect, useState} from 'react'; // 导入useContext
import userService from '../services/userService';
import authService from '../services/authService';
import { AuthContext } from '../contexts/authContext'; // 导入AuthContext
import '../styles/index.css';

const ProfilePage = () => {
    const { login } = useContext(AuthContext); // 从AuthContext获取login
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (currentUser) {
            userService.getUserProfile()
                .then(response => {
                    const userData = response.data.data || response.data;
                    setProfileData({
                        username: userData.username,
                        email: userData.email,
                    });
                })
                .catch(error => {
                    const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                    setProfileError(resMessage);
                });
        }
    }, [currentUser]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setProfileMessage('');
        setProfileError('');
        userService.updateUserProfile(profileData)
            .then(response => {
                setProfileMessage('Profile updated successfully!');
                const userData = response.data.data || response.data;
                let updatedUser = { 
                    ...currentUser, 
                    username: userData.username, 
                    email: userData.email 
                };
                // 检查后端是否返回新的accessToken
                if (userData.accessToken) {
                    updatedUser.accessToken = userData.accessToken;
                }
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
                // 如果有新令牌，或刷新可能包含新用户名/邮箱的上下文
                login(updatedUser); 
            })
            .catch(error => {
                const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                setProfileError(resMessage);
            });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');
        userService.updateUserPassword(passwordData)
            .then(() => {
                setPasswordMessage('Password updated successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            })
            .catch(error => {
                const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                setPasswordError(resMessage);
            });
    };

    if (!currentUser) {
        return <div>请登陆后查看</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-[#0f1116] dark:via-[#0f1116] dark:to-[#0f1116] p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">个人资料</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">管理您的账户信息和密码设置</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white dark:bg-[#0f1116] rounded-2xl shadow-lg border border-outline-light dark:border-violet-600/30 overflow-hidden mb-8">
                    <div className="p-6 border-b border-outline-light dark:border-outline-dark bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">基本信息</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">更新您的用户名和邮箱地址</p>
                    </div>
                    <div className="p-6">
                        {profileError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4" role="alert">
                                {profileError}
                            </div>
                        )}
                        {profileMessage && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-4" role="alert">
                                {profileMessage}
                            </div>
                        )}
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        用户名
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={profileData.username}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                        placeholder="请输入用户名"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        邮箱
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                        placeholder="请输入邮箱地址"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                            >
                                更新资料
                            </button>
                        </form>
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-white dark:bg-[#0f1116] rounded-2xl shadow-lg border border-outline-light dark:border-violet-600/30 overflow-hidden">
                    <div className="p-6 border-b border-outline-light dark:border-outline-dark bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">密码修改</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">更新您的登录密码</p>
                    </div>
                    <div className="p-6">
                        {passwordError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4" role="alert">
                                {passwordError}
                            </div>
                        )}
                        {passwordMessage && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-4" role="alert">
                                {passwordMessage}
                            </div>
                        )}
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">旧密码</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="请输入当前密码"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新密码</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="请输入新密码"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">确认密码</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                                        id="confirmNewPassword"
                                        name="confirmNewPassword"
                                        value={passwordData.confirmNewPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="请再次输入新密码"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                            >
                                更新密码
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;