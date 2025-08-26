import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = ({ userInfo, onLogout }) => {
    // FIX: Imported clearCart to reset the cart on logout
    const { cartItems, clearCart } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animate cart when items change
    useEffect(() => {
        if (cartItems.length > 0) {
            setIsCartAnimating(true);
            const timer = setTimeout(() => setIsCartAnimating(false), 600);
            return () => clearTimeout(timer);
        }
    }, [cartItems.length]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
    }, [location]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.user-dropdown')) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const handleLogout = () => {
        // FIX: Clear the cart state before logging out
        clearCart(); 
        onLogout();
        setIsUserDropdownOpen(false);
        if(isMobileMenuOpen) {
            toggleMobileMenu();
        }
        navigate('/');
    };

    const navLinkClasses = ({ isActive }) => 
        `relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
            isActive 
                ? "text-amber-400 bg-amber-400/10" 
                : "text-gray-300 hover:text-amber-400 hover:bg-gray-800/50"
        }`;
    
    const mobileNavLinkClasses = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
            isActive 
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`;

    const cartItemCount = cartItems.reduce((a, c) => a + c.qty, 0);

    // Helper function to render profile picture or initial
    const renderProfileImage = (size) => {
        if (userInfo?.profilePictureUrl) {
            return (
                <img 
                    src={userInfo.profilePictureUrl} 
                    alt="Profile" 
                    className={`w-${size} h-${size} rounded-full object-cover`}
                />
            );
        }
        return (
            <div className={`w-${size} h-${size} bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold ${size === 8 ? 'text-sm' : 'text-lg'}`}>
                {userInfo.name?.charAt(0).toUpperCase() || 'U'}
            </div>
        );
    };


    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 text-white transition-all duration-500 ${
                isScrolled 
                    ? 'bg-gray-950/95 backdrop-blur-xl shadow-2xl border-b border-gray-700/50' 
                    : 'bg-gray-950/90 backdrop-blur-lg shadow-lg border-b border-gray-800'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo - Simplified */}
                        <Link to="/" className="flex items-center group">
                            <div className="relative overflow-hidden rounded-xl">
                                <img 
                                    src="/assets/Logo_bubuk.png" 
                                    alt="Kopi LS Logo" 
                                    className="h-12 w-12 transition-transform duration-500 group-hover:scale-110" 
                                />
                            </div>
                            <div className="ml-3">
                                <span className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Kopi LS
                                </span>
                            </div>
                        </Link>
                        
                        {/* Desktop Navigation - More compact */}
                        <nav className="hidden lg:flex items-center gap-1">
                            <NavLink to="/" className={navLinkClasses}>
                                <i className="fas fa-home"></i>
                                <span>Beranda</span>
                            </NavLink>
                            <NavLink to="/products" className={navLinkClasses}>
                                <i className="fas fa-coffee"></i>
                                <span>Produk</span>
                            </NavLink>
                            <NavLink to="/about" className={navLinkClasses}>
                                <i className="fas fa-info-circle"></i>
                                <span>Tentang Kami</span>
                            </NavLink>
                            <NavLink to="/news" className={navLinkClasses}>
                                <i className="fas fa-newspaper"></i>
                                <span>Berita</span>
                            </NavLink>
                        </nav>

                        {/* Desktop Actions - Simplified */}
                        <div className="hidden lg:flex items-center gap-3">
                            {/* Cart/Order Button */}
                            <Link 
                                to="/order" 
                                className={`relative bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-2 px-4 rounded-full hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/30 transform hover:scale-105 flex items-center gap-2 ${
                                    isCartAnimating ? 'animate-pulse' : ''
                                }`}
                            >
                                <i className="fas fa-shopping-cart"></i>
                                <span className="hidden xl:inline">Pesan</span>
                                {cartItemCount > 0 && (
                                    <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ${
                                        isCartAnimating ? 'animate-bounce' : ''
                                    }`}>
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Actions */}
                            {userInfo ? (
                                <div className="relative user-dropdown">
                                    <button 
                                        onClick={toggleUserDropdown}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {renderProfileImage(8)}
                                        </div>
                                        <span className="hidden xl:block text-gray-300 group-hover:text-white max-w-24 truncate">
                                            {userInfo.name?.split(' ')[0] || 'Pengguna'}
                                        </span>
                                        <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-300 ${
                                            isUserDropdownOpen ? 'rotate-180' : ''
                                        }`}></i>
                                    </button>
                                    
                                    {/* Improved Dropdown Menu */}
                                    <div className={`absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 transition-all duration-300 transform ${
                                        isUserDropdownOpen 
                                            ? 'opacity-100 visible translate-y-0' 
                                            : 'opacity-0 invisible translate-y-2 pointer-events-none'
                                    }`}>
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {renderProfileImage(10)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white font-medium truncate">{userInfo.name || 'Pengguna'}</div>
                                                    <div className="text-xs text-gray-400 truncate">{userInfo.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link 
    to="/my-orders" 
    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-amber-300 hover:bg-amber-500/20 rounded-xl transition-all duration-300"
>
                                                <i className="fas fa-box w-4 text-center"></i>
                                                <span>Pesanan Saya</span>
                                            </Link>
                                            <Link 
    to="/profile" 
    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-amber-300 hover:bg-amber-500/20 rounded-xl transition-all duration-300"
>
                                                <i className="fas fa-user-edit w-4 text-center"></i>
                                                <span>Edit Profil</span>
                                            </Link>
                                            <div className="border-t border-gray-700/50 my-1"></div>
                                            <button 
                                                onClick={handleLogout} 
                                                className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-300 w-full text-left"
                                            >
                                                <i className="fas fa-sign-out-alt w-4 text-center"></i>
                                                <span>Keluar</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 border border-gray-700 hover:border-amber-400/50 text-gray-300 hover:text-amber-400"
                                >
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span className="hidden xl:inline">Masuk</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center gap-3">
                            {/* Mobile Cart Button */}
                            <Link 
                                to="/order" 
                                className={`relative p-2 rounded-lg bg-amber-600 hover:bg-amber-500 transition-all duration-300 ${
                                    isCartAnimating ? 'animate-pulse' : ''
                                }`}
                            >
                                <i className="fas fa-shopping-cart text-white"></i>
                                {cartItemCount > 0 && (
                                    <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ${
                                        isCartAnimating ? 'animate-bounce' : ''
                                    }`}>
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* Hamburger Menu */}
                            <button 
                                onClick={toggleMobileMenu} 
                                className="text-white focus:outline-none p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-300"
                            >
                                <div className="relative w-6 h-6">
                                    <span className={`absolute top-0 left-0 w-full h-0.5 bg-white transform transition-all duration-300 ${
                                        isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                                    }`}></span>
                                    <span className={`absolute top-2.5 left-0 w-full h-0.5 bg-white transform transition-all duration-300 ${
                                        isMobileMenuOpen ? 'opacity-0' : ''
                                    }`}></span>
                                    <span className={`absolute top-5 left-0 w-full h-0.5 bg-white transform transition-all duration-300 ${
                                        isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                                    }`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`lg:hidden bg-gray-950/98 backdrop-blur-xl border-t border-gray-700/50 transition-all duration-500 transform ${
                    isMobileMenuOpen 
                        ? 'max-h-screen opacity-100 translate-y-0' 
                        : 'max-h-0 opacity-0 -translate-y-4 overflow-hidden'
                }`}>
                    <nav className="px-4 pt-4 pb-6 space-y-2">
                        <NavLink to="/" className={mobileNavLinkClasses}>
                            <i className="fas fa-home w-6 text-center"></i>
                            <span>Beranda</span>
                        </NavLink>
                        <NavLink to="/products" className={mobileNavLinkClasses}>
                            <i className="fas fa-coffee w-6 text-center"></i>
                            <span>Produk</span>
                        </NavLink>
                        <NavLink to="/about" className={mobileNavLinkClasses}>
                            <i className="fas fa-info-circle w-6 text-center"></i>
                            <span>Tentang Kami</span>
                        </NavLink>
                        <NavLink to="/news" className={mobileNavLinkClasses}>
                            <i className="fas fa-newspaper w-6 text-center"></i>
                            <span>Berita</span>
                        </NavLink>
                        
                        {userInfo && (
                            <div className="border-t border-gray-700/50 mt-4 pt-4 space-y-3">
                                {/* User Profile Card */}
                                <div className="bg-gray-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                            {renderProfileImage(12)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-amber-400 font-semibold truncate">{userInfo.name || 'Pengguna'}</div>
                                            <div className="text-sm text-gray-400 truncate">{userInfo.email}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <Link 
                                    to="/my-orders" 
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-300"
                                >
                                    <i className="fas fa-box w-6 text-center"></i>
                                    <span>Pesanan Saya</span>
                                </Link>
                                <Link 
                                    to="/profile" 
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-300"
                                >
                                    <i className="fas fa-user-edit w-6 text-center"></i>
                                    <span>Edit Profil</span>
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-300 w-full text-left"
                                >
                                    <i className="fas fa-sign-out-alt w-6 text-center"></i>
                                    <span>Keluar</span>
                                </button>
                            </div>
                        )}

                        {!userInfo && (
                            <div className="border-t border-gray-700/50 mt-4 pt-4">
                                <Link 
                                    to="/login" 
                                    className="flex items-center justify-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 hover:border-amber-400/50 rounded-xl transition-all duration-300"
                                >
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span>Masuk</span>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Spacer to prevent content from hiding behind fixed header */}
            <div className="h-20"></div>
        </>
    );
};

export default Header;
