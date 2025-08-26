import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminHeader = ({ activeSection, setActiveSection, adminInfo, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const navItems = [
        { id: 'homepage', label: 'Beranda', icon: '🏠', color: 'from-blue-500 to-cyan-500' },
        { id: 'about', label: 'Tentang Kami', icon: 'ℹ️', color: 'from-green-500 to-emerald-500' },
        { id: 'news', label: 'Berita', icon: '📰', color: 'from-purple-500 to-violet-500' },
        { id: 'products', label: 'Produk', icon: '📦', color: 'from-orange-500 to-red-500' },
        { id: 'categories', label: 'Kategori', icon: '🏷️', color: 'from-pink-500 to-rose-500' },
        { id: 'payment', label: 'Pembayaran', icon: '💳', color: 'from-indigo-500 to-purple-500' },
        { id: 'orders', label: 'Pesanan', icon: '📋', color: 'from-yellow-500 to-orange-500' },
        { id: 'chat', label: 'Obrolan', icon: '💬', color: 'from-green-500 to-teal-500' },
        { id: 'privacy', label: 'Kebijakan Privasi', icon: '🔒', color: 'from-gray-500 to-slate-500' },
        { id: 'terms', label: 'Ketentuan Layanan', icon: '📄', color: 'from-cyan-500 to-blue-500' },
    ];

    const handleNavClick = (sectionId) => {
        setActiveSection(sectionId);
        setIsMobileMenuOpen(false);
    };

    const headerStyle = {
        background: isScrolled 
            ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: isScrolled 
            ? '1px solid rgba(156, 163, 175, 0.3)'
            : '1px solid rgba(75, 85, 99, 0.2)',
        boxShadow: isScrolled 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        opacity: mounted ? 1 : 0,
    };

    const logoStyle = {
        background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };

    const mobileMenuStyle = {
        maxHeight: isMobileMenuOpen ? '80vh' : '0',
        opacity: isMobileMenuOpen ? 1 : 0,
        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: isMobileMenuOpen ? 'auto' : 'hidden', // Changed to allow vertical scrolling
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(75, 85, 99, 0.3)',
    };

    const getTabStyle = (item, isActive) => {
        const baseStyle = {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
        };

        if (isActive) {
            return {
                ...baseStyle,
                background: `linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)`,
                color: '#fbbf24',
                boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
            };
        }

        return {
            ...baseStyle,
            background: 'rgba(75, 85, 99, 0.1)',
            color: '#d1d5db',
            border: '1px solid rgba(75, 85, 99, 0.2)',
        };
    };

    const getMobileTabStyle = (item, isActive) => {
        if (isActive) {
            return {
                background: `linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)`,
                color: '#fbbf24',
                borderLeft: '4px solid #fbbf24',
                transform: 'translateX(4px)',
                boxShadow: '0 2px 10px rgba(251, 191, 36, 0.2)',
            };
        }
        return {
            background: 'transparent',
            color: '#d1d5db',
            borderLeft: '4px solid transparent',
            transform: 'translateX(0)',
        };
    };

    return (
        <header 
            className="sticky top-0 z-50"
            style={headerStyle}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-3">
                        <div 
                            className="text-3xl animate-pulse"
                            style={{
                                animation: 'float 3s ease-in-out infinite',
                                filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3))'
                            }}
                        >
                            🛠️
                        </div>
                        <div>
                            <h1 style={logoStyle}>
                                Panel Admin
                            </h1>
                            <div className="text-xs text-gray-400 mt-1">
                                Management Dashboard
                            </div>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {adminInfo && (
                            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/30">
                                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {adminInfo.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-300">
                                    👋 Selamat datang, <span className="text-amber-400 font-medium">{adminInfo.name}</span>
                                </span>
                            </div>
                        )}
                        
                        <div className="flex space-x-2">
                            <Link 
                                to="/" 
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 rounded-lg border border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                                style={{
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <span className="text-lg">👁️</span>
                                <span className="text-sm font-medium">Lihat Situs</span>
                            </Link>
                            
                            <button 
                                onClick={onLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 rounded-lg border border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                                style={{
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <span className="text-lg">🚪</span>
                                <span className="text-sm font-medium">Keluar</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative p-3 text-white bg-gray-800/50 rounded-lg border border-gray-700/30 transition-all duration-300"
                            style={{
                                backdropFilter: 'blur(10px)',
                                transform: isMobileMenuOpen ? 'scale(0.95)' : 'scale(1)',
                            }}
                        >
                            <div className="relative w-6 h-6">
                                <span 
                                    className="absolute block w-6 h-0.5 bg-current transition-all duration-300"
                                    style={{
                                        top: isMobileMenuOpen ? '50%' : '25%',
                                        transform: isMobileMenuOpen ? 'translateY(-50%) rotate(45deg)' : 'translateY(-50%)',
                                    }}
                                />
                                <span 
                                    className="absolute block w-6 h-0.5 bg-current transition-all duration-300"
                                    style={{
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        opacity: isMobileMenuOpen ? 0 : 1,
                                    }}
                                />
                                <span 
                                    className="absolute block w-6 h-0.5 bg-current transition-all duration-300"
                                    style={{
                                        top: isMobileMenuOpen ? '50%' : '75%',
                                        transform: isMobileMenuOpen ? 'translateY(-50%) rotate(-45deg)' : 'translateY(-50%)',
                                    }}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Desktop Navigation Tabs */}
                <nav className="hidden md:flex space-x-2 border-t border-gray-700/30 pt-4 overflow-x-auto pb-4 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                style={getTabStyle(item, isActive)}
                                className="flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div 
                                        className="absolute inset-0 opacity-20 pointer-events-none"
                                        style={{
                                            background: `linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)`,
                                            animation: 'shimmer 2s infinite',
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Menu */}
            <div style={mobileMenuStyle} className="custom-scrollbar">
                <div className="px-4 py-2">
                    {/* Mobile Admin Info */}
                    {adminInfo && (
                        <div className="flex items-center space-x-3 p-4 mb-4 bg-gray-800/30 rounded-xl border border-gray-700/20">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                {adminInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm text-gray-300">Selamat datang</div>
                                <div className="text-amber-400 font-medium">{adminInfo.name}</div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <nav className="space-y-2 mb-4">
                        {navItems.map((item, index) => {
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    style={{
                                        ...getMobileTabStyle(item, isActive),
                                        animation: isMobileMenuOpen ? `slideInLeft 0.3s ease-out ${index * 0.05}s both` : 'none',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-4 text-left rounded-lg font-medium"
                                >
                                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Mobile Actions */}
                    <div className="border-t border-gray-700/30 pt-4 space-y-2">
                        <Link 
                            to="/" 
                            className="flex items-center space-x-3 w-full px-4 py-4 text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg transition-all duration-300 border border-blue-500/20"
                            style={{
                                animation: isMobileMenuOpen ? 'slideInLeft 0.3s ease-out 0.4s both' : 'none',
                            }}
                        >
                            <span className="text-xl">👁️</span>
                            <span className="font-medium">Lihat Situs</span>
                        </Link>
                        
                        <button 
                            onClick={onLogout}
                            className="flex items-center space-x-3 w-full px-4 py-4 text-red-300 bg-red-600/10 hover:bg-red-600/20 rounded-lg transition-all duration-300 border border-red-500/20"
                            style={{
                                animation: isMobileMenuOpen ? 'slideInLeft 0.3s ease-out 0.45s both' : 'none',
                            }}
                        >
                            <span className="text-xl">🚪</span>
                            <span className="font-medium">Keluar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes slideInLeft {
                    from { 
                        opacity: 0; 
                        transform: translateX(-20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
                
                /* Custom Scrollbar Styles */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(75, 85, 99, 0.2);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(107, 114, 128, 0.5);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
            `}</style>
        </header>
    );
};

export default AdminHeader;
