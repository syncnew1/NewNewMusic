import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import AuthService from '../services/authService';
import {AuthContext} from '../contexts/authContext';
import '../styles/index.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { currentUser, login } = useContext(AuthContext);

    useEffect(() => {
        if (currentUser) {
            navigate('/profile');
        }
    }, [currentUser, navigate]);

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        AuthService.register(username, email, password).then(
            (response) => {
                login(response.data.data); 
                setLoading(false);
                navigate('/'); 
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white dark:bg-[#0f1116] rounded-2xl shadow-xl border border-outline-light dark:border-violet-600/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">♪</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary-text">注册</h1>
                                <p className="text-secondary-text">加入我们的音乐社区</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    用户名
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    placeholder="请输入邮箱地址"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    密码
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0f1116] border border-gray-200 dark:border-violet-600/30 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    placeholder="请输入密码"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-accent-text-color border-t-transparent rounded-full animate-spin"></div>
                                        <span>注册中...</span>
                                    </>
                                ) : (
                                    <span>注册</span>
                                )}
                            </button>
                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-medium ${
                                    message.includes('成功') 
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                }`}>
                                    {message}
                                </div>
                            )}
                        </form>
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-violet-600/30 text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                已有账户？{' '}
                                <a href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                                    立即登录
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;