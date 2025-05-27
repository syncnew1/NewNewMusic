import React, {useEffect, useState} from 'react';
import userService from '../services/userService';
import authService from '../services/authService';

const ProfilePage = () => {
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
                    setProfileData({
                        username: response.data.username,
                        email: response.data.email,
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
                const updatedUser = { ...currentUser, username: response.data.username, email: response.data.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
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
        <div className="container mx-auto mt-5 p-4 bg-card-bg rounded-lg shadow-lg">
            <h2 class="text-2xl font-semibold mb-4 text-primary-text">用户信息</h2>
            {profileError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{profileError}</div>}
            {profileMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{profileMessage}</div>}
            <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="block text-sm font-medium text-secondary-text">游用户名</label>
                    <input
                        type="text"
                        className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-color focus:border-accent-color sm:text-sm text-primary-text"
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-text">邮箱</label>
                    <input
                        type="email"
                        className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-color focus:border-accent-color sm:text-sm text-primary-text"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                    />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-text-color bg-accent-color hover:opacity-button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color">Update Profile</button>
            </form>

            <hr className="my-5" />

            <h2 class="text-2xl font-semibold mb-4 mt-8 text-primary-text">密码修改</h2>
            {passwordError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{passwordError}</div>}
            {passwordMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{passwordMessage}</div>}
            <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-text">旧密码</label>
                    <input
                        type="password"
                        className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-color focus:border-accent-color sm:text-sm text-primary-text"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-text">新密码</label>
                    <input
                        type="password"
                        className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-color focus:border-accent-color sm:text-sm text-primary-text"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-secondary-text">确认密码</label>
                    <input
                        type="password"
                        className="mt-1 block w-full px-3 py-2 bg-input-bg border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-accent-color focus:border-accent-color sm:text-sm text-primary-text"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-text-color bg-accent-color hover:opacity-button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color">Change Password</button>
            </form>
        </div>
    );
};

export default ProfilePage;