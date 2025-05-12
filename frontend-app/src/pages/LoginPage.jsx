import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { AuthContext } from '../contexts/AuthContext'; // Use AuthContext

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Use AuthContext

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        AuthService.login(username, password).then(
            (response) => {
                login(response.data); // Update AuthContext with user data from response
                navigate('/'); // Redirect to home page
                // window.location.reload(); // Consider removing if context update handles UI refresh
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
            <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
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
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <span>Loading...</span> : <span>Login</span>}
                        </button>
                    </div>
                    {message && (
                        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;