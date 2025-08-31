import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// CSS for custom animations, defined outside the component to prevent re-creation on every render.
const customAnimations = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
`;

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const socialLinks = [
        {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            url: 'https://www.instagram.com/kopils_dampit/',
            color: 'hover:text-pink-400',
            bgColor: 'hover:bg-pink-500/20',
            gradient: 'hover:from-pink-500 hover:to-purple-600'
        },
        {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            url: 'https://www.facebook.com/profile.php?id=61554725036649&mibextid=ZbWKwL',
            color: 'hover:text-blue-400',
            bgColor: 'hover:bg-blue-500/20',
            gradient: 'hover:from-blue-500 hover:to-blue-700'
        },
        {
            name: 'TikTok',
            icon: 'fab fa-tiktok',
            url: 'https://www.tiktok.com/@kopi.ls',
            color: 'hover:text-white',
            bgColor: 'hover:bg-gray-800',
            gradient: 'hover:from-gray-800 hover:to-black'
        },
        {
            name: 'WhatsApp',
            icon: 'fab fa-whatsapp',
            url: 'http://wa.me/+6289654637971',
            color: 'hover:text-green-400',
            bgColor: 'hover:bg-green-500/20',
            gradient: 'hover:from-green-500 hover:to-green-600'
        },
        {
            name: 'Shopee',
            icon: 'fas fa-shopping-bag',
            url: 'http://shopee.co.id/kopils157',
            color: 'hover:text-orange-400',
            bgColor: 'hover:bg-orange-500/20',
            gradient: 'hover:from-orange-500 hover:to-red-500'
        }
    ];

    const quickLinks = [
        { name: 'Beranda', href: '/', icon: 'fas fa-home' },
        { name: 'Produk', href: '/products', icon: 'fas fa-coffee' },
        { name: 'Tentang Kami', href: '/about', icon: 'fas fa-users' },
        { name: 'Berita', href: '/news', icon: 'fas fa-newspaper' }
    ];

    const deliveryLinks = [
        { name: 'GoFood', href: 'https://gofood.link/a/R8bbwFf', icon: 'fas fa-motorcycle' },
        { name: 'GrabFood', href: 'https://r.grab.com/g/2-1-6-C7MBE2NZN3AGJJ', icon: 'fas fa-motorcycle' },
        { name: 'ShopeeFood', href: 'https://shopee.co.id/universal-link/now-food/shop/22341330?deep_and_deferred=1&shareChannel=whatsapp', icon: 'fas fa-motorcycle' }
    ];

    const legalLinks = [
        { name: 'Kebijakan Layanan', href: '/terms-of-service', icon: 'fas fa-shield-alt' },
        { name: 'Kebijakan Privasi', href: '/privacy-policy', icon: 'fas fa-lock' }
    ];

    return (
        <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 text-white overflow-hidden">
            {/* Injecting custom animations into the component */}
            <style>{customAnimations}</style>

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 animate-pulse" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    backgroundSize: '60px 60px'
                }}></div>
            </div>
            
            {/* Floating Coffee Beans */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-3 h-3 bg-amber-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute top-20 right-20 w-2 h-2 bg-amber-400 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                <div className="absolute bottom-20 left-20 w-2.5 h-2.5 bg-amber-600 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
            </div>

            {/* Glowing Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse"></div>

            {/* Main Footer Content */}
            <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                
                {/* Brand Section with Enhanced Animation */}
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center mb-4 group">
                        <div className="relative">
                            <img 
                                src="/assets/Logo_bubuk.png" 
                                alt="Logo Kopi LS" 
                                className="h-16 w-16 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" 
                            />
                            <div className="absolute inset-0 bg-amber-400 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent hover:from-amber-300 hover:to-amber-700 transition-all duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Kopi LS
                            </h3>
                            <p className="text-sm text-amber-300 opacity-80 hover:opacity-100 transition-opacity duration-300">Cita Rasa Terbaik Dampit</p>
                        </div>
                    </div>
                    
                    {/* Animated Divider */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-32 animate-pulse"></div>
                        <div className="mx-3 text-amber-400">
                            <i className="fas fa-coffee animate-bounce"></i>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-32 animate-pulse"></div>
                    </div>
                </div>

                {/* Main Content Grid with Staggered Animation */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    
                    {/* Quick Links with Enhanced Styling */}
                    <div className={`text-center md:text-left transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{ transitionDelay: '200ms' }}>
                        <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center justify-center md:justify-start gap-2 group">
                            <i className="fas fa-compass text-sm group-hover:rotate-180 transition-transform duration-500"></i>
                            Menu Utama
                            <div className="h-0.5 bg-gradient-to-r from-amber-400 to-transparent w-8 group-hover:w-12 transition-all duration-300"></div>
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index} className="transform hover:translate-x-2 transition-transform duration-300">
                                    <Link
                                        to={link.href}
                                        className="text-gray-300 hover:text-amber-400 transition-all duration-300 text-sm flex items-center justify-center md:justify-start gap-3 group py-1 px-2 rounded-lg hover:bg-amber-500/10"
                                    >
                                        <i className={`${link.icon} text-xs opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}></i>
                                        <span className="relative">
                                            {link.name}
                                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></div>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Delivery Links Section */}
                    <div className={`text-center md:text-left transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
                        <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center justify-center md:justify-start gap-2 group">
                            <i className="fas fa-shipping-fast text-sm group-hover:animate-pulse"></i>
                            Pesan Antar
                            <div className="h-0.5 bg-gradient-to-r from-amber-400 to-transparent w-8 group-hover:w-12 transition-all duration-300"></div>
                        </h4>
                        <ul className="space-y-3">
                            {deliveryLinks.map((link, index) => (
                                <li key={index} className="transform hover:translate-x-2 transition-transform duration-300">
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-amber-400 transition-all duration-300 text-sm flex items-center justify-center md:justify-start gap-3 group py-1 px-2 rounded-lg hover:bg-amber-500/10"
                                    >
                                        <i className={`${link.icon} text-xs opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}></i>
                                        <span className="relative">
                                            {link.name}
                                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></div>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info with Animation */}
                    <div className={`text-center md:text-left transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
                        <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center justify-center md:justify-start gap-2 group">
                            <i className="fas fa-phone text-sm group-hover:animate-pulse"></i>
                            Kontak
                            <div className="h-0.5 bg-gradient-to-r from-amber-400 to-transparent w-8 group-hover:w-12 transition-all duration-300"></div>
                        </h4>
                        <div className="space-y-3">
                            <a 
                                href="mailto:lskopi760@gmail.com" 
                                className="text-gray-300 hover:text-amber-400 transition-all duration-300 flex items-center justify-center md:justify-start gap-3 text-sm group py-2 px-3 rounded-lg hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20"
                            >
                                <div className="relative">
                                    <i className="fas fa-envelope text-xs group-hover:animate-bounce"></i>
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                </div>
                                lskopi760@gmail.com
                            </a>
                            
                            <a 
                                href="http://wa.me/+6289654637971" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-green-400 transition-all duration-300 flex items-center justify-center md:justify-start gap-3 text-sm group py-2 px-3 rounded-lg hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/20"
                            >
                                <div className="relative">
                                    <i className="fab fa-whatsapp text-xs group-hover:animate-bounce"></i>
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                </div>
                                +62 896 5463 7971
                            </a>
                        </div>
                    </div>

                    {/* Legal Links with Animation */}
                    <div className={`text-center md:text-left transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`} style={{ transitionDelay: '800ms' }}>
                        <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center justify-center md:justify-start gap-2 group">
                            <i className="fas fa-shield-alt text-sm group-hover:animate-pulse"></i>
                            Kebijakan
                            <div className="h-0.5 bg-gradient-to-r from-amber-400 to-transparent w-8 group-hover:w-12 transition-all duration-300"></div>
                        </h4>
                        <ul className="space-y-3">
                            {legalLinks.map((link, index) => (
                                <li key={index} className="transform hover:translate-x-2 transition-transform duration-300">
                                    <Link
                                        to={link.href}
                                        className="text-gray-300 hover:text-amber-400 transition-all duration-300 text-sm flex items-center justify-center md:justify-start gap-3 group py-1 px-2 rounded-lg hover:bg-amber-500/10"
                                    >
                                        <i className={`${link.icon} text-xs opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}></i>
                                        <span className="relative">
                                            {link.name}
                                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></div>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section with Enhanced Animation */}
                <div className="pt-8 border-t border-gray-700/50 relative">
                    {/* Animated gradient line */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse"></div>
                    
                    <div className={`flex flex-col items-center gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '1000ms' }}>
                        
                        {/* Social Media with Enhanced Effects */}
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm font-medium">Ikuti kami:</span>
                            <div className="flex gap-3">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`relative w-10 h-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${social.color} hover:border-transparent hover:shadow-lg hover:shadow-amber-500/20 group`}
                                        title={social.name}
                                        style={{ 
                                            transitionDelay: `${index * 100}ms`,
                                            animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        <i className={`${social.icon} text-sm group-hover:animate-pulse`}></i>
                                        <div
  className={`absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${social.gradient}`}
></div>

                                        
                                        {/* Ripple effect on hover */}
                                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute inset-0 rounded-xl animate-ping bg-amber-400/20"></div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Copyright with Typewriter Effect */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                &copy; 2025 
                                <span className="text-amber-400 font-semibold mx-2 hover:text-amber-300 transition-colors duration-300">
                                    Kopi LS
                                </span> 
                                Seluruh Hak Cipta Dilindungi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Decorative Bottom Wave with Animation */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </footer>
    );
};

export default Footer;
