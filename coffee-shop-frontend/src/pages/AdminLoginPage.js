import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = process.env.SERVER_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            if (rememberMe) {
                localStorage.setItem('adminToken', data.token);
            } else {
                sessionStorage.setItem('adminToken', data.token);
            }
            onLoginSuccess();
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg border border-gray-700">
                <div>
                    <h2 className="text-center text-4xl font-extrabold text-white font-heading">Admin Login</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm rounded-t-md" placeholder="Admin Email" />
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm rounded-b-md" placeholder="Password" />
                    </div>
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-600 rounded bg-gray-700" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">Remember me</label>
                    </div>
                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default AdminLoginPage;
