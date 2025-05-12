import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = () => {
            const user = AuthService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        };
        
        // 初始检查
        checkUser();
        
        // 添加事件监听器
        window.addEventListener('storage', checkUser);
        
        return () => {
            window.removeEventListener('storage', checkUser);
        };
    }, []);

    const login = (userData) => {
        setCurrentUser(userData);
        // 触发storage事件以通知其他组件用户状态已更新
        window.dispatchEvent(new Event('storage'));
    };

    const logout = () => {
        AuthService.logout();
        setCurrentUser(null);
    };

    // We can add a check here to verify token validity with backend if needed
    // For now, we assume if a user object exists in localStorage, they are "logged in"

    if (loading) {
        return <p>Loading user...</p>; // Or a spinner component
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};