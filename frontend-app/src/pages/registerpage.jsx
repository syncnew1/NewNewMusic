import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { AuthContext } from '../contexts/AuthContext';

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
                // Assuming response.data contains the user object upon successful registration
                // similar to how login response is handled.
                login(response.data); 
                setLoading(false);
                navigate('/'); // Redirect to home page after successful registration and login
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
        <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4 transition-colors duration-300 ease-in-out">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 transition-colors duration-300 ease-in-out" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out"
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 transition-colors duration-300 ease-in-out" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 transition-colors duration-300 ease-in-out" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <span>Loading...</span> : <span>Sign Up</span>}
                        </button>
                    </div>
                    {message && (
                        <div className={`mt-4 p-2 ${message.includes('Error') ? 'bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-700 text-red-700 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-700 text-green-700 dark:text-green-200'} px-4 py-3 rounded relative transition-colors duration-300 ease-in-out`} role="alert">
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;