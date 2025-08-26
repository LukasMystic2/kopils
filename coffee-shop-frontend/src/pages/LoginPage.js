import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import Notification from '../components/Notification';

const LoginPage = ({ userInfo, onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (userInfo) {
            navigate('/');
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setNotification({ message: 'Email verified successfully! You can now log in.', type: 'success' });
        }
    }, [searchParams]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    return (
        <>
            <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />
            <ForgotPasswordModal 
                isOpen={isModalOpen} 
                onRequestClose={() => setIsModalOpen(false)} 
                showNotification={showNotification}
            />
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
                            {activeTab === 'login' ? 'Welcome Back 👋' : 'Create Account 📝'}
                        </h2>
                    </div>
                    
                    <div className="flex border-b border-gray-700 relative">
                        <button 
                            onClick={() => setActiveTab('login')}
                            className={`w-1/2 py-4 text-center font-medium text-lg transition-colors duration-300 ${activeTab === 'login' ? 'text-amber-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setActiveTab('register')}
                            className={`w-1/2 py-4 text-center font-medium text-lg transition-colors duration-300 ${activeTab === 'register' ? 'text-amber-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            Register
                        </button>
                        <div 
                            className="absolute bottom-0 h-0.5 bg-amber-400 transition-all duration-500"
                            style={{
                                width: '50%',
                                left: activeTab === 'login' ? '0%' : '50%',
                                boxShadow: '0 0 8px #fbbf24',
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{
                            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                            opacity: activeTab === 'login' ? 1 : 0,
                            transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(-20px)',
                            display: activeTab === 'login' ? 'block' : 'none',
                        }}>
                            <LoginForm showNotification={showNotification} onForgotPassword={() => setIsModalOpen(true)} onLoginSuccess={onLoginSuccess} />
                        </div>
                        <div style={{
                            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                            opacity: activeTab === 'register' ? 1 : 0,
                            transform: activeTab === 'register' ? 'translateX(0)' : 'translateX(20px)',
                            display: activeTab === 'register' ? 'block' : 'none',
                        }}>
                            <RegisterForm showNotification={showNotification} setActiveTab={setActiveTab} />
                        </div>
                    </div>
                </div>
            </main>
            <style>{`
                @keyframes textShimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
            `}</style>
        </>
    );
};

const FormInput = ({ id, name, type, value, onChange, placeholder, required, children, roundedClass }) => (
    <div className="relative">
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className={`form-input appearance-none relative block w-full px-4 py-3 border-2 border-transparent bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none sm:text-sm ${roundedClass}`}
            placeholder={placeholder}
            style={{
                borderRadius: roundedClass === 'rounded-t-md' ? '12px 12px 0 0' : roundedClass === 'rounded-b-md' ? '0 0 12px 12px' : '12px',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
        />
        {children}
    </div>
);

const LoginForm = ({ showNotification, onForgotPassword, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [showResendButton, setShowResendButton] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.needsVerification) {
                    showNotification(data.message, 'warning');
                    setShowResendButton(true);
                    setResendEmail(data.email);
                    return;
                }
                throw new Error(data.message);
            }
            
            if (rememberMe) localStorage.setItem('userInfo', JSON.stringify(data));
            else sessionStorage.setItem('userInfo', JSON.stringify(data));

            onLoginSuccess();
            navigate('/');
            showNotification('Login successful!');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            showNotification(data.message, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-px">
                <FormInput id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required roundedClass="rounded-t-md" />
                <FormInput id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required roundedClass="rounded-b-md">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-amber-400 transition-colors">
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                </FormInput>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-600 rounded bg-gray-700" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">Remember me</label>
                </div>
                <div className="text-sm">
                    <button type="button" onClick={onForgotPassword} className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
                        Forgot password?
                    </button>
                </div>
            </div>
            <div>
                <button type="submit" disabled={isSubmitting} className="action-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white">
                    {isSubmitting ? 'Signing In...' : 'Sign In →'}
                </button>
            </div>
            {showResendButton && (
                <div className="text-center mt-4">
                    <button type="button" onClick={handleResend} disabled={isResending} className={`font-medium text-amber-500 hover:text-amber-400 ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isResending ? 'Resending...' : 'Resend verification link'}
                    </button>
                </div>
            )}
            <style>{`
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
        </form>
    );
};

const RegisterForm = ({ showNotification, setActiveTab }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const termsOfServiceUrl = `${process.env.SERVER_URL}/terms-of-service`;
    const privacyPolicyUrl = `${process.env.SERVER_URL}/privacy-policy`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreedToTerms) {
            showNotification('You must agree to the Terms of Service and Privacy Policy.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showNotification(data.message);
            setActiveTab('login');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-px">
                <FormInput id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required roundedClass="rounded-t-md" />
                <FormInput id="email-register" name="email-register" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required roundedClass="" />
                <FormInput id="password-register" name="password-register" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required roundedClass="rounded-b-md">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-amber-400 transition-colors">
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                </FormInput>
            </div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="terms-and-privacy" name="terms-and-privacy" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-600 rounded bg-gray-700" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="terms-and-privacy" className="font-medium text-gray-300">
                        I agree to the <a href={termsOfServiceUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Terms of Service</a> and <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Privacy Policy</a>.
                    </label>
                </div>
            </div>
            <div>
                <button type="submit" disabled={isSubmitting} className="action-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white">
                    {isSubmitting ? 'Creating Account...' : 'Create Account 🚀'}
                </button>
            </div>
             <style>{`
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
        </form>
    );
};

export default LoginPage;
