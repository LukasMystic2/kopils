// pages/AboutPage.js
import React, { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import SEO from '../components/SEO'; // 1. IMPOR KOMPONEN SEO

const AboutPage = () => {
    const API_URL = `${process.env.SERVER_URL}`;
    const { data: aboutContent, loading, error } = useFetch(`${API_URL}/api/about`);
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [pageImageUrl, setPageImageUrl] = useState(''); // State untuk menyimpan URL gambar dari konten

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // 2. SIAPKAN DATA UNTUK SEO
    const pageTitle = "Tentang Kopi LS - Cerita di Balik Cita Rasa Kopi Dampit";
    const pageDescription = "Pelajari cerita, visi, dan misi Kopi LS. Temukan semangat kami dalam menyajikan kopi Robusta alami terbaik langsung dari petani di Dampit, Malang.";
    const siteUrl = "https://www.kopils.com";
    const logoUrl = `${siteUrl}/assets/Logo_bubuk.png`;

    // --- LOGIKA BARU: Ekstrak gambar pertama dari konten CKEditor ---
    useEffect(() => {
        if (aboutContent && aboutContent.content) {
            // Cari src dari tag <img> pertama dalam string HTML
            const match = aboutContent.content.match(/<img[^>]+src="([^">]+)"/);
            if (match && match[1]) {
                setPageImageUrl(match[1]); // Simpan URL gambar yang ditemukan
            }
        }
    }, [aboutContent]); // Jalankan efek ini setiap kali aboutContent berubah

    // Data Terstruktur yang sudah diperbarui
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CoffeeStore",
        "name": "Kopi LS",
        "description": pageDescription,
        "url": siteUrl,
        "image": pageImageUrl || logoUrl, // Gunakan gambar dari konten, atau logo sebagai fallback
        "logo": logoUrl,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Ahmad Yani Gang Satria Lama Nomor 11",
          "addressLocality": "Blimbing",
          "addressRegion": "Malang",
          "postalCode": "65125",
          "addressCountry": "ID"
        },
        "telephone": "+6289654637971"
    };

    // Enhanced styles with animations and modern UI
    const enhancedStyles = `
        /* Base CKEditor content styles with dark theme */
        .ck-content {
            color: #E5E7EB;
            line-height: 1.8;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .ck-content h1, .ck-content h2, .ck-content h3, .ck-content h4 {
            color: #FFFFFF;
            position: relative;
            overflow: hidden;
        }
        
        .ck-content h1::after, .ck-content h2::after, .ck-content h3::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: -100%;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #FBBF24, transparent);
            animation: slideIn 2s ease-out 0.5s forwards;
        }
        
        .ck-content h1 {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #FFFFFF, #FBBF24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: fadeInUp 1s ease-out;
        }
        
        .ck-content h2 {
            font-size: 2rem;
            margin: 2rem 0 1rem 0;
            animation: fadeInLeft 0.8s ease-out;
        }
        
        .ck-content h3 {
            font-size: 1.5rem;
            margin: 1.5rem 0 1rem 0;
            animation: fadeInRight 0.8s ease-out;
        }
        
        .ck-content p {
            margin-bottom: 1.2rem;
            animation: fadeIn 1s ease-out;
            transition: transform 0.3s ease, color 0.3s ease;
        }
        
        .ck-content p:hover {
            transform: translateX(4px);
            color: #F3F4F6;
        }
        
        .ck-content a {
            color: #FBBF24;
            text-decoration: none;
            position: relative;
            transition: all 0.3s ease;
            border-bottom: 1px solid transparent;
        }
        
        .ck-content a:hover {
            color: #FCD34D;
            border-bottom-color: #FBBF24;
            transform: translateY(-1px);
            text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }
        
        .ck-content a::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #FBBF24, #F59E0B);
            transition: width 0.3s ease;
        }
        
        .ck-content a:hover::before {
            width: 100%;
        }
        
        .ck-content blockquote {
            border-left: 4px solid #FBBF24;
            padding: 1.5rem;
            margin: 2rem 0;
            background: rgba(75, 85, 99, 0.2);
            font-style: italic;
            position: relative;
            border-radius: 0 8px 8px 0;
            transition: all 0.3s ease;
            animation: slideInLeft 0.8s ease-out;
        }
        
        .ck-content blockquote:hover {
            background: rgba(75, 85, 99, 0.3);
            transform: translateX(8px);
            box-shadow: -4px 0 20px rgba(251, 191, 36, 0.1);
        }
        
        .ck-content blockquote::before {
            content: '"';
            position: absolute;
            top: -10px;
            left: 20px;
            font-size: 4rem;
            color: #FBBF24;
            opacity: 0.3;
        }
        
        .ck-content ul, .ck-content ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
        }
        
        .ck-content li {
            margin-bottom: 0.8rem;
            position: relative;
            animation: fadeInUp 0.6s ease-out;
            transition: transform 0.2s ease;
        }
        
        .ck-content li:hover {
            transform: translateX(4px);
        }
        
        .ck-content ul li::marker {
            color: #FBBF24;
        }
        
        /* Enhanced image styles */
        .ck-content .image-style-side,
        .ck-content .image-style-align-left {
            float: left;
            margin: 0 2rem 1.5rem 0;
            max-width: 50%;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            animation: slideInLeft 0.8s ease-out;
        }
        
        .ck-content .image-style-align-right {
            float: right;
            margin: 0 0 1.5rem 2rem;
            max-width: 50%;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            animation: slideInRight 0.8s ease-out;
        }
        
        .ck-content .image-style-align-center {
            display: block;
            margin: 2rem auto;
            border-radius: 12px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            animation: zoomIn 0.8s ease-out;
        }
        
        .ck-content img:hover {
            transform: scale(1.02) translateY(-4px);
            box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
        }
        
        /* Enhanced media styles */
        .ck-content .media {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            max-width: 100%;
            margin: 2rem 0;
            border-radius: 12px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            animation: zoomIn 0.8s ease-out;
        }
        
        .ck-content .media:hover {
            transform: scale(1.01) translateY(-2px);
            box-shadow: 0 20px 64px rgba(0, 0, 0, 0.5);
        }
        
        .ck-content .media iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 12px;
        }
        
        /* Clear floats with animation */
        .ck-content p:after,
        .ck-content h1:after,
        .ck-content h2:after,
        .ck-content h3:after {
            content: "";
            display: table;
            clear: both;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .ck-content {
                font-size: 14px;
                line-height: 1.6;
            }
            
            .ck-content h1 {
                font-size: 2rem;
            }
            
            .ck-content h2 {
                font-size: 1.5rem;
            }
            
            .ck-content h3 {
                font-size: 1.25rem;
            }
            
            .ck-content .image-style-side,
            .ck-content .image-style-align-left,
            .ck-content .image-style-align-right {
                float: none;
                display: block;
                max-width: 100%;
                margin: 1.5rem auto;
            }
            
            .ck-content blockquote {
                padding: 1rem;
                margin: 1.5rem 0;
            }
            
            .ck-content ul, .ck-content ol {
                padding-left: 1.5rem;
            }
        }
        
        @media (max-width: 480px) {
            .ck-content {
                font-size: 13px;
            }
            
            .ck-content h1 {
                font-size: 1.75rem;
            }
            
            .ck-content blockquote {
                padding: 0.75rem;
            }
        }
        
        /* Animation keyframes */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
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
        
        @keyframes slideIn {
            to {
                left: 0;
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes zoomIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;

    const containerStyles = {
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? 0 : 20}px)`,
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    };

    const headerStyles = {
        background: 'linear-gradient(-45deg, #1F2937, #374151, #4B5563, #1F2937)',
        backgroundSize: '400% 400%',
        animation: 'gradient 6s ease infinite',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        position: 'relative',
        transform: `translateY(${scrollY * 0.1}px)`,
    };

    const mainStyles = {
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(75, 85, 99, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
    };

    // Loading animation
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-600 border-t-amber-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-amber-300 rounded-full animate-spin animate-pulse" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <span className="ml-4 text-xl text-white animate-pulse">Memuat konten...</span>
            </div>
        );
    }

    // Error state with animation
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-500/30 backdrop-blur-sm">
                    <div className="text-6xl mb-4 animate-bounce">⚠️</div>
                    <div className="text-red-400 text-xl animate-pulse">{error}</div>
                </div>
            </div>
        );
    }

    if (!aboutContent) return null;

    return (
        <>
            {/* 3. GUNAKAN KOMPONEN SEO DENGAN PROPERTI YANG TEPAT */}
            <SEO 
                title={pageTitle}
                description={pageDescription}
                url="/about"
                imageUrl={pageImageUrl} // Gunakan state yang sudah diekstrak
                structuredData={structuredData}
            />
            <style>{enhancedStyles}</style>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-400/5 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-400/3 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-purple-400/4 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>

                <main 
                    className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10"
                    style={containerStyles}
                >
                    <div style={mainStyles} className="p-6 sm:p-8 lg:p-12">
                        {/* Decorative corner elements */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-400/30 rounded-tl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-400/30 rounded-br-lg"></div>

                        <article>
                            <h1 
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 pb-4 border-b-2 border-amber-500 relative"
                                style={headerStyles}
                            >
                                Tentang Kami
                            </h1>
                            
                            <div 
                                className="ck-content relative z-10"
                                dangerouslySetInnerHTML={{ __html: aboutContent.content }}
                                style={{
                                    animation: 'fadeIn 1.2s ease-out 0.3s both'
                                }}
                            />
                        </article>

                        {/* Floating action indicator */}
                        <div className="fixed bottom-8 right-8 w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-400/30 cursor-pointer hover:bg-amber-400/30 transition-all duration-300 hover:scale-110">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AboutPage;
