import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// FIX: Moved FormInput outside of the ResetPasswordPage component
// This prevents it from being re-created on every render, which was causing the input to lose focus.
const FormInput = ({ id, value, onChange, type, placeholder, children, roundedClass }) => (
    <div className="relative">
        <input 
            id={id}
            value={value} 
            onChange={onChange} 
            type={type}
            required 
            className="form-input appearance-none relative block w-full px-4 py-3 border-2 border-transparent bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none sm:text-sm"
            placeholder={placeholder}
            style={{
                borderRadius: roundedClass === 'rounded-t-md' ? '12px 12px 0 0' : '0 0 12px 12px',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
        />
        {children}
    </div>
);

const ResetPasswordPage = ({ showNotification }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const API_URL = `${process.env.SERVER_URL}`;

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showNotification("Passwords do not match", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/users/resetpassword/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showNotification(data.message);
            navigate('/login');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main 
            className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8"
            style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
            }}
        >
            <div 
                className="max-w-md w-full space-y-8 p-8 sm:p-10 rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.2s',
                }}
            >
                <div>
                    <h2 
                        className="mt-6 text-center text-4xl font-extrabold text-white font-heading"
                        style={{
                            background: 'linear-gradient(135deg, #d97706, #fbbf24, #f59e0b, #fbbf24, #d97706)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            backgroundSize: '200% auto',
                            animation: 'textShimmer 3s linear infinite',
                        }}
                    >
                        Reset Password 🔑
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-px">
                        <FormInput
                            id="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            roundedClass="rounded-t-md"
                        >
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-amber-400 transition-colors">
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </FormInput>
                        <FormInput
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            roundedClass="rounded-b-md"
                        >
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-amber-400 transition-colors">
                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </FormInput>
                    </div>

                    <div>
                        <button type="submit" disabled={isSubmitting} className="action-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white">
                            {isSubmitting ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes textShimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                .form-input:focus {
                    border-color: #fbbf24;
                    box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
                }
                .action-button {
                    background: linear-gradient(135deg, #f59e0b, #d97706, #b45309);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
                }
                .action-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6);
                }
                .action-button:disabled {
                    background: #4b5563;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
            `}</style>
        </main>
    );
};

export default ResetPasswordPage;
