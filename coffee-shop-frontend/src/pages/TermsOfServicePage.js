import React, { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';

const TermsOfServicePage = () => {
    const API_URL = `${process.env.SERVER_URL}`;
    const { data: terms, loading, error } = useFetch(`${API_URL}/api/terms-of-service`);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (loading) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'white' }}>
            <div style={{
                display: 'inline-block',
                width: '50px',
                height: '50px',
                border: '4px solid rgba(251, 191, 36, 0.3)',
                borderTop: '4px solid #fbbf24',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
            }}></div>
            <p style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>Memuat Ketentuan Layanan...</p>
        </div>
    );
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

    const sanitizeHtml = (html) => {
        return { __html: html };
    };

    return (
        <main 
            className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-white"
            style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 
                    className="text-4xl font-heading font-bold"
                    style={{
                        background: 'linear-gradient(135deg, #d97706, #fbbf24, #f59e0b, #fbbf24, #d97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '0.5rem',
                        backgroundSize: '200% auto',
                        animation: 'textShimmer 3s linear infinite',
                    }}
                >
                    Ketentuan Layanan
                </h1>
                <div 
                    style={{
                        width: '100px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                        margin: '0 auto',
                        borderRadius: '2px',
                    }}
                />
            </div>
            <div 
                className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg border border-gray-700 text-gray-300 ck-content"
                style={{
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
                    lineHeight: '1.8'
                }}
                dangerouslySetInnerHTML={sanitizeHtml(terms.content)}
            ></div>
            <style>{`
                @keyframes textShimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
};

export default TermsOfServicePage;
