import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProfilePage = () => {
    const { currentUser } = useContext(AuthContext);

    if (!currentUser) {
        // If no user is logged in, redirect to login page
        return <Navigate to="/login" />;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
                <p className="text-gray-700 text-lg">Welcome, {currentUser.username}!</p>
                <p className="text-gray-700">Your email: {currentUser.email}</p>
                {/* Add more profile information or actions here */}
            </div>
        </div>
    );
};

export default ProfilePage;