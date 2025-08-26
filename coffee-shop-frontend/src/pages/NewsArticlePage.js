import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import SEO from '../components/SEO'; // 1. IMPOR KOMPONEN SEO
import 'react-quill/dist/quill.snow.css';

const NewsArticlePage = () => {
    const { slug } = useParams();
    const API_URL = `${process.env.SERVER_URL}`;
    const { data: article, loading, error } = useFetch(`${API_URL}/api/news/${slug}`);
    const [mounted, setMounted] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVisible, setIsVisible] = useState({
        header: false,
        meta: false,
        image: false,
        content: false
    });

    useEffect(() => {
        setMounted(true);
        
        const timeouts = [
            setTimeout(() => setIsVisible(prev => ({ ...prev, header: true })), 200),
            setTimeout(() => setIsVisible(prev => ({ ...prev, meta: true })), 400),
            setTimeout(() => setIsVisible(prev => ({ ...prev, image: true })), 600),
            setTimeout(() => setIsVisible(prev => ({ ...prev, content: true })), 800),
        ];

        const handleScroll = () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight - winHeight;
            const scrollTop = window.pageYOffset;
            const progress = (scrollTop / docHeight) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            timeouts.forEach(clearTimeout);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // --- 2. FUNGSI UNTUK MEMBUAT SNIPPET DESKRIPSI SEO ---
    const createSeoDescription = (htmlContent) => {
        if (!htmlContent) return "Baca artikel lengkapnya di Kopi LS.";
        const plainText = htmlContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
        return plainText.substring(0, 155) + (plainText.length > 155 ? '...' : '');
    };

    const loadingStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9))',
        borderRadius: '1rem',
        margin: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    };

    const spinnerStyle = {
        width: '60px',
        height: '60px',
        border: '5px solid rgba(251, 191, 36, 0.2)',
        borderTop: '5px solid #fbbf24',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite, pulse 2s ease-in-out infinite',
        marginBottom: '1.5rem'
    };

    const loadingTextStyle = {
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#fbbf24',
        letterSpacing: '2px',
        animation: 'textGlow 2s ease-in-out infinite alternate',
        textAlign: 'center'
    };

    if (loading) return (
        <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p style={loadingTextStyle}>📰 Memuat Artikel...</p>
            <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                ✨ Menyiapkan konten luar biasa untuk Anda
            </p>
        </div>
    );

    if (error) return (
        <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#ef4444',
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.1))',
            borderRadius: '1rem',
            margin: '2rem',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            animation: 'shake 0.5s ease-in-out'
        }}>
            🚫 {error}
        </div>
    );

    if (!article) return null; // Jangan render apapun jika artikel belum ada

    // --- 3. SIAPKAN SEMUA DATA SEO SECARA DINAMIS SETELAH ARTIKEL DIDAPATKAN ---
    const siteUrl = "https://www.kopils.com";
    const logoUrl = `${siteUrl}/assets/Logo_bubuk.png`;
    const articleUrl = `${siteUrl}/news/${article.slug}`;
    const articleImage = article.thumbnailUrl || logoUrl;
    const articleTitle = `${article.title} | Kopi LS`;
    const articleDescription = createSeoDescription(article.content);

    // Data terstruktur dinamis untuk artikel berita
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
        },
        "headline": article.title,
        "image": [articleImage],
        "datePublished": article.createdAt,
        "dateModified": article.updatedAt,
        "author": {
            "@type": "Person",
            "name": article.author || "Tim Kopi LS"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Kopi LS",
            "logo": {
                "@type": "ImageObject",
                "url": logoUrl
            }
        },
        "description": articleDescription
    };


    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString))) {
            return "📅 Tanggal tidak tersedia";
        }
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const progressBarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '4px',
        background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
        zIndex: 1000,
        transition: 'width 0.2s ease-out',
        boxShadow: '0 2px 10px rgba(251, 191, 36, 0.5)'
    };

    const backButtonStyle = {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
        border: '2px solid #fbbf24',
        borderRadius: '30px',
        textDecoration: 'none',
        fontWeight: '700',
        color: '#fbbf24',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '2rem',
        fontSize: '0.95rem',
        letterSpacing: '0.5px',
        position: 'relative',
        overflow: 'hidden',
        transform: isVisible.header ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
        opacity: isVisible.header ? 1 : 0,
        animation: isVisible.header ? 'slideInBounce 0.6s ease-out' : 'none'
    };

    const titleStyle = {
        fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
        fontWeight: '900',
        color: 'white',
        marginBottom: '1.5rem',
        lineHeight: '1.2',
        background: 'linear-gradient(135deg, #d97706, #fbbf24, #f59e0b, #fbbf24, #d97706)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundSize: '300% auto',
        animation: isVisible.header ? 'textShimmer 4s linear infinite, titleFloat 3s ease-in-out infinite' : 'none',
        transform: isVisible.header ? 'translateY(0)' : 'translateY(30px)',
        opacity: isVisible.header ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
        textShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
    };

    const metaContainerStyle = {
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.6))',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid rgba(75, 85, 99, 0.5)',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transform: isVisible.meta ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: isVisible.meta ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
        position: 'relative',
        overflow: 'hidden'
    };

    const imageContainerStyle = {
        overflow: 'hidden',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(251, 191, 36, 0.2)',
        transform: isVisible.image ? 'translateY(0) rotateX(0deg)' : 'translateY(30px) rotateX(5deg)',
        opacity: isVisible.image ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
        position: 'relative'
    };

    const imageStyle = {
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        filter: 'brightness(0.9) contrast(1.1) saturate(1.1)'
    };

    const contentContainerStyle = {
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.7), rgba(17, 24, 39, 0.7))',
        backdropFilter: 'blur(15px)',
        borderRadius: '1.5rem',
        padding: '2rem',
        border: '1px solid rgba(75, 85, 99, 0.4)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transform: isVisible.content ? 'translateY(0)' : 'translateY(40px)',
        opacity: isVisible.content ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s',
        position: 'relative',
        overflow: 'hidden'
    };

    const mainContainerStyle = {
    
        margin: '0 auto',
        padding: 'clamp(1rem, 4vw, 2rem)',
        color: '#d1d5db',
        minHeight: '100vh',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '56rem'
    };

    return (
        <>
            {/* 4. GUNAKAN KOMPONEN SEO DENGAN DATA DINAMIS */}
            <SEO
                title={articleTitle}
                description={articleDescription}
                url={`/news/${article.slug}`}
                imageUrl={articleImage}
                structuredData={structuredData}
            />

            <div style={progressBarStyle}></div>
            <main style={mainContainerStyle}>
                <article>
                    <Link 
                        to="/news" 
                        style={backButtonStyle}
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))';
                            target.style.transform = 'translateY(-3px) scale(1.05)';
                            target.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.4)';
                            const arrow = target.querySelector('span');
                            if (arrow) arrow.style.transform = 'translateX(-6px) rotate(-5deg)';
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))';
                            target.style.transform = isVisible.header ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)';
                            target.style.boxShadow = 'none';
                            const arrow = target.querySelector('span');
                            if (arrow) arrow.style.transform = 'translateX(0) rotate(0deg)';
                        }}
                    >
                        <span style={{ 
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '1.2rem'
                        }}>🔙</span> 
                        Kembali ke Semua Berita
                    </Link>

                    <h1 style={titleStyle}>
                         {article.title}
                    </h1>
                    
                    <div style={metaContainerStyle}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
                            animation: 'shimmerLine 3s linear infinite'
                        }}></div>
                        
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                            gap: '1.5rem',
                            alignItems: window.innerWidth < 640 ? 'flex-start' : 'center'
                        }}>
                            <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'rgba(251, 191, 36, 0.1)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(251, 191, 36, 0.3)'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    animation: 'authorPulse 2s ease-in-out infinite'
                                }}>
                                    ✍️
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, marginBottom: '2px' }}>
                                        Diterbitkan oleh
                                    </p>
                                    <p style={{ fontWeight: '700', color: 'white', margin: 0, fontSize: '0.9rem' }}>
                                        {article.author}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>
                                        {formatDate(article.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {article.lastUpdatedBy && new Date(article.updatedAt).getTime() > new Date(article.createdAt).getTime() + 60000 && (
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderLeft: window.innerWidth >= 640 ? '3px solid #22c55e' : '1px solid rgba(34, 197, 94, 0.3)',
                                    paddingLeft: window.innerWidth >= 640 ? '1rem' : '0.75rem',
                                    marginLeft: window.innerWidth >= 640 ? '1rem' : 0,
                                    marginTop: window.innerWidth < 640 ? '0.5rem' : 0
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        animation: 'updatePulse 2s ease-in-out infinite'
                                    }}>
                                        🔄
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, marginBottom: '2px' }}>
                                            Terakhir diperbarui oleh
                                        </p>
                                        <p style={{ fontWeight: '700', color: 'white', margin: 0, fontSize: '0.9rem' }}>
                                            {article.lastUpdatedBy}
                                        </p>
                                        <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>
                                            {formatDate(article.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {article.thumbnailUrl && (
                        <div style={imageContainerStyle}>
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: '#fbbf24',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                backdropFilter: 'blur(10px)',
                                zIndex: 10,
                                animation: 'floatBadge 3s ease-in-out infinite'
                            }}>
            
                            </div>
                            <img 
                                src={article.thumbnailUrl} 
                                alt={article.title} 
                                style={imageStyle}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.filter = 'brightness(1) contrast(1.2) saturate(1.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.filter = 'brightness(0.9) contrast(1.1) saturate(1.1)';
                                }}
                            />
                        </div>
                    )}
                    
                    <div style={contentContainerStyle} className="ql-snow">
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
                            borderRadius: '1.5rem 1.5rem 0 0'
                        }}></div>
                        
                        <div 
                            className="ql-editor"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                            style={{
                                animation: 'contentFadeIn 1s ease-out 1s forwards',
                                opacity: 0
                            }}
                        />
                    </div>
                </article>

                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    
                    @keyframes textGlow {
                        0% { text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); }
                        100% { text-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.6); }
                    }
                    
                    @keyframes textShimmer {
                        0% { background-position: 300% center; }
                        100% { background-position: -300% center; }
                    }
                    
                    @keyframes titleFloat {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-5px); }
                    }
                    
                    @keyframes slideInBounce {
                        0% { transform: translateY(-30px) scale(0.8); opacity: 0; }
                        60% { transform: translateY(5px) scale(1.02); }
                        100% { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    
                    @keyframes authorPulse {
                        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
                        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
                    }
                    
                    @keyframes updatePulse {
                        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    }
                    
                    @keyframes floatBadge {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-3px); }
                    }
                    
                    @keyframes shimmerLine {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    
                    @keyframes contentFadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }

                    /* Enhanced Quill editor content styling */
                    .ql-editor {
                        color: #d1d5db !important;
                        line-height: 1.8;
                        font-size: clamp(1rem, 2.5vw, 1.1rem);
                        padding: 0 !important;
                    }
                    
                    .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                        color: #ffffff !important;
                        border-bottom: none !important;
                        margin: 2rem 0 1rem 0;
                        position: relative;
                    }
                    
                    .ql-editor h1:before, .ql-editor h2:before, .ql-editor h3:before {
                       
                        margin-right: 0.5rem;
                        color: #fbbf24;
                    }
                    
                    .ql-editor p {
                        margin: 1.5rem 0;
                        text-align: justify;
                    }
                    
                    .ql-editor a {
                        color: #fbbf24 !important;
                        text-decoration: underline;
                        transition: all 0.3s ease;
                        position: relative;
                    }
                    
                    .ql-editor a:hover {
                        color: #f59e0b !important;
                        text-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
                    }
                    
                    .ql-editor blockquote {
                        border-left: 4px solid #fbbf24 !important;
                        color: #9ca3af !important;
                        background: rgba(251, 191, 36, 0.05);
                        padding: 1rem 1.5rem;
                        margin: 2rem 0;
                        border-radius: 0 0.5rem 0.5rem 0;
                        position: relative;
                        font-style: italic;
                    }
                    
                    .ql-editor blockquote:before {
                        content: '💬';
                        position: absolute;
                        left: -0.5rem;
                        top: 1rem;
                        background: #111827;
                        padding: 0.25rem;
                        border-radius: 50%;
                    }
                    
                    .ql-editor pre {
                        background-color: #111827 !important;
                        color: #d1d5db !important;
                        border-radius: 0.75rem;
                        padding: 1.5rem;
                        border: 1px solid rgba(75, 85, 99, 0.5);
                        position: relative;
                        overflow-x: auto;
                    }
                    
                    .ql-editor pre:before {
                        content: '💻 Code';
                        position: absolute;
                        top: 0.5rem;
                        right: 1rem;
                        color: #fbbf24;
                        font-size: 0.8rem;
                        font-weight: 600;
                    }
                    
                    .ql-editor ul, .ql-editor ol {
                        padding-left: 2rem;
                        margin: 1.5rem 0;
                    }
                    
                    .ql-editor li {
                        margin: 0.75rem 0;
                        position: relative;
                    }
                    
                    .ql-editor ul li:before {
                        content: '▶';
                        color: #fbbf24;
                        font-size: 0.8rem;
                        position: absolute;
                        left: -1.5rem;
                    }

                    /* Mobile optimizations */
                    @media (max-width: 768px) {
                        .ql-editor {
                            font-size: 1rem;
                        }
                        
                        .ql-editor blockquote {
                            margin: 1.5rem 0;
                            padding: 1rem;
                        }
                        
                        .ql-editor pre {
                            padding: 1rem;
                            font-size: 0.9rem;
                        }
                    }

                    /* Smooth scrolling */
                    html {
                        scroll-behavior: smooth;
                    }

                    /* Custom scrollbar */
                    ::-webkit-scrollbar {
                        width: 8px;
                    }

                    ::-webkit-scrollbar-track {
                        background: #1f2937;
                    }

                    ::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, #fbbf24, #f59e0b);
                        border-radius: 4px;
                    }

                    ::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(180deg, #f59e0b, #d97706);
                    }
                `}</style>
            </main>
        </>
    );
};

export default NewsArticlePage;
