import React, { useState, useEffect } from 'react';

const ProfilePage = ({ userInfo, showNotification, onLogout, onUpdate }) => {
    const API_URL = `${process.env.SERVER_URL}`;
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
   

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        
        if (userInfo) {
            setName(userInfo.name || '');
            setEmail(userInfo.email || '');
            setProfilePictureUrl(userInfo.profilePictureUrl || '');
            setAddress(userInfo.address || '');
            setPhoneNumber(userInfo.phoneNumber || '');
        }
        
        return () => clearTimeout(timer);
    }, [userInfo]);

    const enhancedStyles = `
        /* Animation keyframes */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
            }
            50% {
                box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
            }
        }
        
        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.8;
            }
        }

        /* Profile container */
        .profile-container {
            background: linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(75, 85, 99, 0.3);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: relative;
            overflow: hidden;
        }
        
        .profile-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #FBBF24, transparent);
            animation: shimmer 3s ease-in-out infinite;
        }

        /* Header animation */
        .profile-header {
            animation: slideInDown 0.8s ease-out;
            background: linear-gradient(-45deg, #FFFFFF, #FBBF24, #F59E0B);
            background-size: 300% 300%;
            animation: slideInDown 0.8s ease-out, shimmer 4s ease-in-out infinite 1s;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Profile card animations */
        .profile-card {
            animation: fadeInLeft 0.8s ease-out 0.2s both;
            background: linear-gradient(145deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
            backdrop-filter: blur(15px);
            border: 1px solid rgba(75, 85, 99, 0.2);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }
        
        .profile-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: rgba(251, 191, 36, 0.3);
        }

        /* Profile picture styles */
        .profile-picture {
            position: relative;
            transition: all 0.4s ease;
            filter: brightness(0.9) contrast(1.1);
        }
        
        .profile-picture:hover {
            transform: scale(1.05);
            filter: brightness(1) contrast(1.2);
            animation: glow 2s ease-in-out infinite;
        }
        
        .profile-picture::after {
            content: '';
            position: absolute;
            inset: -4px;
            background: linear-gradient(45deg, #FBBF24, #F59E0B, #FBBF24);
            border-radius: 50%;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .profile-picture:hover::after {
            opacity: 0.7;
        }

        /* Form sections */
        .form-section {
            animation: fadeInRight 0.8s ease-out 0.4s both;
            background: linear-gradient(145deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(75, 85, 99, 0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .form-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent);
        }
        
        .form-section:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            border-color: rgba(251, 191, 36, 0.3);
        }

        /* Input field enhancements */
        .enhanced-input {
            background: rgba(17, 24, 39, 0.8);
            border: 1px solid rgba(75, 85, 99, 0.5);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .enhanced-input:focus {
            border-color: #FBBF24;
            box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
            background: rgba(17, 24, 39, 1);
            transform: translateY(-1px);
        }
        
        .enhanced-input:hover:not(:focus) {
            border-color: rgba(251, 191, 36, 0.3);
            background: rgba(17, 24, 39, 0.9);
        }

        /* Button animations */
        .enhanced-button {
            background: linear-gradient(45deg, #FBBF24, #F59E0B);
            border: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .enhanced-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .enhanced-button:hover::before {
            left: 100%;
        }
        
        .enhanced-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(251, 191, 36, 0.4);
            background: linear-gradient(45deg, #FCD34D, #FBBF24);
        }
        
        .enhanced-button:active {
            transform: translateY(0);
            box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
        }
        
        .enhanced-button:disabled {
            background: linear-gradient(45deg, #4B5563, #374151);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* Section headers */
        .section-header {
            position: relative;
            color: #FBBF24;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }
        
        .section-header::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 50px;
            height: 2px;
            background: linear-gradient(90deg, #FBBF24, transparent);
            animation: shimmer 2s ease-in-out infinite;
        }

        /* File upload styling */
        .file-upload {
            position: relative;
            background: rgba(31, 41, 55, 0.8);
            border: 2px dashed rgba(75, 85, 99, 0.5);
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .file-upload:hover {
            border-color: rgba(251, 191, 36, 0.5);
            background: rgba(31, 41, 55, 1);
        }
        
        .file-upload input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }

        /* Remove button */
        .remove-button {
            color: #EF4444;
            transition: all 0.2s ease;
            position: relative;
        }
        
        .remove-button:hover {
            color: #DC2626;
            text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }

        /* Loading states */
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
            .profile-container {
                margin: 1rem;
                border-radius: 16px;
            }
            
            .profile-picture {
                width: 120px;
                height: 120px;
            }
            
            .enhanced-input, .enhanced-button {
                font-size: 16px; /* Prevents zoom on iOS */
            }
            
            .form-section {
                padding: 1rem;
            }
        }

        @media (max-width: 480px) {
            .profile-header {
                font-size: 1.75rem;
            }
            
            .profile-picture {
                width: 100px;
                height: 100px;
            }
        }

        /* Success/Error feedback */
        .feedback-success {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #22C55E;
            animation: fadeInUp 0.3s ease-out;
        }
        
        .feedback-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #EF4444;
            animation: fadeInUp 0.3s ease-out;
        }

        /* Staggered animations */
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
    `;

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (email !== userInfo.email) {
            if (!window.confirm("Changing your email will log you out and require re-verification. Are you sure you want to continue?")) {
                return;
            }
        }
        
        setIsSubmitting(true);
        let finalProfilePictureUrl = profilePictureUrl;

        if (profilePicture && profilePicture.size > 0) {
            try {
                const formData = new FormData();
                formData.append('profilePicture', profilePicture);

                const response = await fetch(`${API_URL}/api/users/profile/upload/picture`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${userInfo.token}` },
                    body: formData,
                });

                if (!response.ok) throw new Error('Failed to upload profile picture');
                const data = await response.json();
                finalProfilePictureUrl = data.url;
            } catch (error) {
                showNotification(error.message, 'error');
                setIsSubmitting(false);
                return;
            }
        } else if (profilePictureUrl === '') {
            finalProfilePictureUrl = '';
        }

        const profileData = {
            name: name,
            email: email,
            address: address,
            phoneNumber: phoneNumber,
            profilePictureUrl: finalProfilePictureUrl,
        };

        try {
            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${userInfo.token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showNotification('Profile updated successfully!');
            
            if(data.needsVerification) {
                showNotification('Please check your new email to re-verify your account.', 'success');
                onLogout();
            } else {
                onUpdate(data);
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return showNotification('Passwords do not match', 'error');
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showNotification('Password updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRemovePicture = () => {
        setProfilePicture(null);
        setProfilePictureUrl('');
    };

    if (!userInfo) {
        return (
            <>
                <style>{enhancedStyles}</style>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="loading-spinner w-8 h-8 border-4 border-gray-600 border-t-amber-400 rounded-full mx-auto mb-4"></div>
                        <div className="text-xl text-white">Loading Profile...</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{enhancedStyles}</style>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
                <main 
                    className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-white"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: `translateY(${isVisible ? 0 : 20}px)`,
                        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                    }}
                >
                    <div className="profile-container rounded-2xl p-6 sm:p-8 lg:p-12">
                        <h1 className="profile-header text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12">
                            Your Profile
                        </h1>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Profile Info Card */}
                            <div className="lg:col-span-1">
                                <div className="profile-card rounded-xl p-6 text-center">
                                    <div className="relative inline-block mb-6">
                                        <img 
                                            src={profilePictureUrl || 'https://placehold.co/200x200/1f2937/4b5563?text=No+Image'} 
                                            alt="Profile" 
                                            className="profile-picture w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-gray-600 mx-auto"
                                        />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2 stagger-1" style={{animation: 'fadeInUp 0.6s ease-out 0.6s both'}}>
                                        {userInfo?.name}
                                    </h2>
                                    <p className="text-gray-400 text-sm sm:text-base stagger-2" style={{animation: 'fadeInUp 0.6s ease-out 0.7s both'}}>
                                        {userInfo?.email}
                                    </p>
                                    {userInfo?.phoneNumber && (
                                        <p className="text-gray-500 text-sm mt-2 stagger-3" style={{animation: 'fadeInUp 0.6s ease-out 0.8s both'}}>
                                            📞 {userInfo.phoneNumber}
                                        </p>
                                    )}
                                    {userInfo?.address && (
                                        <p className="text-gray-500 text-sm mt-2 stagger-4" style={{animation: 'fadeInUp 0.6s ease-out 0.9s both'}}>
                                            📍 {userInfo.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Forms Section */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Profile Details Form */}
                                <div className="form-section rounded-xl p-6">
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <h3 className="section-header text-xl sm:text-2xl">
                                            Update Details
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter your full name" 
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)} 
                                                    className="enhanced-input w-full p-3 rounded-lg text-white placeholder-gray-500"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                                <input 
                                                    type="email" 
                                                    placeholder="Enter your email" 
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    className="enhanced-input w-full p-3 rounded-lg text-white placeholder-gray-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                placeholder="Enter your phone number" 
                                                value={phoneNumber} 
                                                onChange={(e) => setPhoneNumber(e.target.value)} 
                                                className="enhanced-input w-full p-3 rounded-lg text-white placeholder-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Shipping Address</label>
                                            <textarea 
                                                placeholder="Enter your complete address" 
                                                value={address} 
                                                onChange={(e) => setAddress(e.target.value)} 
                                                className="enhanced-input w-full p-3 rounded-lg text-white placeholder-gray-500" 
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Profile Picture</label>
                                            <div className="file-upload">
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => setProfilePicture(e.target.files[0])}
                                                    accept="image/*"
                                                />
                                                <div className="text-center">
                                                    <div className="text-amber-400 text-2xl mb-2">📷</div>
                                                    <div className="text-sm text-gray-400">
                                                        Click to upload new profile picture
                                                    </div>
                                                </div>
                                            </div>
                                            {profilePictureUrl && (
                                                <button 
                                                    type="button" 
                                                    onClick={handleRemovePicture} 
                                                    className="remove-button text-sm mt-2 hover:underline"
                                                >
                                                    ✕ Remove current picture
                                                </button>
                                            )}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting} 
                                            className="enhanced-button w-full p-3 rounded-lg text-black font-semibold"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="loading-spinner mr-2"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Profile'
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Password Change Form */}
                                <div className="form-section rounded-xl p-6">
                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <h3 className="section-header text-xl sm:text-2xl">
                                            🔒 Change Password
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                                                <input 
                                                    type="password" 
                                                    placeholder="Enter new password" 
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    className="enhanced-input w-full p-3 rounded-lg text-white placeholder-gray-500"
                                                    minLength="6"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                                                <input 
                                                    type="password" 
                                                    placeholder="Confirm new password" 
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                                    className="enhanced-input w-full p-3 rounded-lg text-white placeholder-gray-500"
                                                    minLength="6"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting || !password || !confirmPassword} 
                                            className="enhanced-button w-full p-3 rounded-lg text-black font-semibold"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="loading-spinner mr-2"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Change Password'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ProfilePage;