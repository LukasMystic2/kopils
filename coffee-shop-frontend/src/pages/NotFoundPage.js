import React, { useEffect } from 'react';

// The CSS styles, including animations, are stored in this constant.
const pageStyles = `
    /* Menggunakan font Inter untuk konsistensi */
    body {
        font-family: 'Inter', sans-serif;
    }

    /* Animasi untuk teks 404 agar terlihat "melayang" */
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-20px);
        }
    }

    /* Animasi untuk elemen lain agar muncul secara halus */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Animasi denyut untuk partikel di latar belakang */
    @keyframes pulse {
        0%, 100% { 
            transform: scale(1);
            opacity: 0.08;
        }
        50% { 
            transform: scale(1.1);
            opacity: 0.12;
        }
    }

    /* Animasi untuk uap kopi */
    @keyframes steam {
        0% { transform: translateY(0) translateX(0) scale(0.25); opacity: 0.2; }
        25% { transform: translateY(-15px) translateX(5px) scale(0.5); opacity: 0.5; }
        50% { transform: translateY(-30px) translateX(-5px) scale(0.75); opacity: 0.3; }
        75% { transform: translateY(-45px) translateX(8px) scale(1); opacity: 0.1; }
        100% { transform: translateY(-60px) translateX(-8px) scale(1.25); opacity: 0; }
    }

    /* Gaya untuk tombol dengan efek hover */
    .home-button {
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
    }

    .home-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
    }
`;

const NotFoundPage = () => {
    // This useEffect hook injects the styles into the document's head
    // when the component mounts, and removes them when it unmounts.
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = pageStyles;
        document.head.appendChild(styleElement);

        // This is a cleanup function that runs when the component is unmounted.
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []); // The empty array ensures this effect runs only once.

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            {/* Animated background particles with colors from AboutPage */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-400/5 rounded-full animate-pulse"></div>
                <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-400/5 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-purple-400/5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative z-10">
                
                {/* Coffee Cup SVG with Steam Animation */}
                <div className="relative w-24 h-24 mb-[-2rem]">
                    <svg className="w-full h-full text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3.055A2 2 0 0115 1h4a2 2 0 012 2v13a2 2 0 01-2 2h-4.625a2 2 0 00-1.938 1.488l-1.212 4.244A2 2 0 019.289 23H5.71a2 2 0 01-1.938-2.512l1.212-4.244A2 2 0 007.025 14H13zm0 0h- relazione_di_maggioranza" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 10h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
                    </svg>
                    {/* Steam animations */}
                    <div className="absolute top-2 left-1/2 w-1 h-4 bg-white/50 rounded-full" style={{ animation: 'steam 4s linear infinite', animationDelay: '0s' }}></div>
                    <div className="absolute top-4 left-1/2 w-1 h-3 bg-white/40 rounded-full" style={{ animation: 'steam 4s linear infinite', animationDelay: '1s' }}></div>
                    <div className="absolute top-3 left-[55%] w-1 h-5 bg-white/60 rounded-full" style={{ animation: 'steam 4s linear infinite', animationDelay: '2s' }}></div>
                </div>

                {/* Konten Utama */}
                <div className="relative">
                    {/* Teks 404 dengan animasi melayang */}
                    <h1 className="text-9xl md:text-[200px] font-black text-amber-400" style={{ animation: 'float 6s ease-in-out infinite', textShadow: '0 5px 25px rgba(251, 191, 36, 0.2)' }}>
                        404
                    </h1>

                    {/* Judul Pesan Kesalahan */}
                    <div style={{ animation: 'fadeIn 1s ease-out 0.5s forwards', opacity: 0 }}>
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-100 mt-4">
                            Oops! Kopi Anda Belum Siap ☕
                        </h2>
                    </div>
                    
                    {/* Deskripsi Pesan */}
                    <div style={{ animation: 'fadeIn 1s ease-out 0.8s forwards', opacity: 0 }}>
                        <p className="text-gray-400 mt-4 max-w-md mx-auto">
                            Halaman yang Anda cari sepertinya sedang digiling. Mari kembali ke beranda untuk menikmati secangkir kopi.
                        </p>
                    </div>

                    {/* Tombol Kembali ke Beranda */}
                    <div style={{ animation: 'fadeIn 1s ease-out 1.1s forwards', opacity: 0 }} className="mt-10">
                        <a href="/" className="home-button inline-block bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-full text-lg">
                            Kembali ke Beranda
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NotFoundPage;
