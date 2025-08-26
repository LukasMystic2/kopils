import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import SEO from '../components/SEO'; // 1. IMPOR KOMPONEN SEO

const NewsPage = () => {
  const API_URL = `${process.env.SERVER_URL}`;
  const { data: news, loading, error } = useFetch(`${API_URL}/api/news`);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const articlesPerPage = 6;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. SIAPKAN DATA UNTUK SEO
  const pageTitle = "Berita & Pembaruan Terbaru dari Kopi LS";
  const pageDescription = "Ikuti berita, cerita, dan pengumuman terbaru dari Kopi LS. Dapatkan wawasan tentang perjalanan kopi kami, acara komunitas, dan pembaruan produk.";
  const siteUrl = "https://www.kopils.com";
  const logoUrl = `${siteUrl}/assets/Logo_bubuk.png`;

  // --- LOGIKA BARU: Dapatkan gambar dari artikel terbaru secara dinamis ---
  const primaryImageUrl = useMemo(() => {
    if (news && news.length > 0) {
      // Urutkan berita untuk memastikan yang terbaru ada di paling atas
      const sortedNews = [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Cari artikel pertama yang memiliki thumbnail
      const firstArticleWithImage = sortedNews.find(article => article.thumbnailUrl);
      if (firstArticleWithImage) {
        return firstArticleWithImage.thumbnailUrl;
      }
    }
    // Jika tidak ada berita atau tidak ada thumbnail, gunakan logo sebagai fallback
    return logoUrl;
  }, [news, logoUrl]);


  // Data terstruktur untuk halaman daftar berita (Blog)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Berita Kopi LS",
    "url": `${siteUrl}/news`,
    "description": pageDescription,
    "image": primaryImageUrl || logoUrl, // Gunakan gambar dinamis
    "publisher": {
      "@type": "Organization",
      "name": "Kopi LS",
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      }
    }
  };

  const { topNews, regularNews } = useMemo(() => {
    if (!news) return { topNews: [], regularNews: [] };
    const top = news.filter(n => n.isTopNews);
    const regular = news.filter(n => !n.isTopNews);
    return { topNews: top, regularNews: regular };
  }, [news]);

  const filteredAndSortedNews = useMemo(() => {
    if (!regularNews) return [];
    let processedNews = [...regularNews];

    if (searchTerm) {
        processedNews = processedNews.filter(n => 
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.replace(/<[^>]+>/g, '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    switch (sortOrder) {
        case 'date-asc':
            processedNews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'title-asc':
            processedNews.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            processedNews.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'date-desc':
        default:
            processedNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    return processedNews;
  }, [regularNews, searchTerm, sortOrder]);

  // Enhanced inline styles
  const enhancedStyles = `
    /* Global animations */
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
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes scaleIn {
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
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
      50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.4); }
    }
    
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Header animations */
    .news-header {
      animation: slideInDown 0.8s ease-out;
    }
    
    .news-subtitle {
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }

    /* Card animations */
    .news-card {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
      background: linear-gradient(145deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95));
      border: 1px solid rgba(75, 85, 99, 0.3);
      backdrop-filter: blur(10px);
    }
    
    .news-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.1), transparent);
      transition: left 0.5s ease;
      z-index: 1;
    }
    
    .news-card:hover::before {
      left: 100%;
    }
    
    .news-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(251, 191, 36, 0.2);
      border-color: rgba(251, 191, 36, 0.5);
    }
    
    .news-card img {
      transition: all 0.4s ease;
      filter: brightness(0.9);
    }
    
    .news-card:hover img {
      transform: scale(1.1);
      filter: brightness(1.1);
    }
    
    .news-card-content {
      position: relative;
      z-index: 2;
    }
    
    .news-card h3 {
      position: relative;
      transition: all 0.3s ease;
    }
    
    .news-card h3::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #FBBF24, #F59E0B);
      transition: width 0.3s ease;
    }
    
    .news-card:hover h3::after {
      width: 100%;
    }
    
    /* Top News special effects */
    .top-news-card {
      background: linear-gradient(145deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05));
      border: 1px solid rgba(251, 191, 36, 0.3);
      position: relative;
    }
    
    .top-news-card::after {
      content: '★ TOP';
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(45deg, #FBBF24, #F59E0B);
      color: #000;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      z-index: 3;
      animation: glow 2s ease-in-out infinite;
    }

    /* Search and filter section */
    .filter-section {
      background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
      backdrop-filter: blur(15px);
      border: 1px solid rgba(75, 85, 99, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .filter-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent);
      animation: shimmer 3s ease-in-out infinite;
    }
    
    .search-input {
      background: rgba(17, 24, 39, 0.8);
      border: 1px solid rgba(75, 85, 99, 0.5);
      transition: all 0.3s ease;
      position: relative;
    }
    
    .search-input:focus {
      border-color: #FBBF24;
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
      background: rgba(17, 24, 39, 1);
    }
    
    .sort-select {
      background: rgba(17, 24, 39, 0.8);
      border: 1px solid rgba(75, 85, 99, 0.5);
      transition: all 0.3s ease;
    }
    
    .sort-select:focus {
      border-color: #FBBF24;
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
      background: rgba(17, 24, 39, 1);
    }

    /* Pagination styles */
    .pagination-button {
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    
    .pagination-button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(251, 191, 36, 0.2);
      border-radius: 50%;
      transition: all 0.3s ease;
      transform: translate(-50%, -50%);
    }
    
    .pagination-button:hover::before {
      width: 100%;
      height: 100%;
    }
    
    .pagination-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .pagination-active {
      background: linear-gradient(45deg, #FBBF24, #F59E0B);
      color: #000;
      font-weight: bold;
      animation: glow 2s ease-in-out infinite;
    }

    /* Loading and error states */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
    }
    
    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(75, 85, 99, 0.3);
      border-top: 4px solid #FBBF24;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-dots {
      display: flex;
      gap: 4px;
      margin-top: 20px;
    }
    
    .loading-dot {
      width: 8px;
      height: 8px;
      background: #FBBF24;
      border-radius: 50%;
      animation: pulse 1.4s ease-in-out infinite;
    }
    
    .loading-dot:nth-child(2) { animation-delay: 0.2s; }
    .loading-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .news-card {
        margin-bottom: 1rem;
      }
      
      .news-card:hover {
        transform: translateY(-4px) scale(1.01);
      }
      
      .filter-section {
        padding: 1rem;
      }
      
      .search-input, .sort-select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
    }
    
    @media (max-width: 480px) {
      .news-card h3 {
        font-size: 1.1rem;
      }
      
      .pagination-button {
        padding: 8px 12px;
        font-size: 14px;
      }
    }

    /* Staggered animations for grid items */
    .grid-item-1 { animation: scaleIn 0.6s ease-out 0.1s both; }
    .grid-item-2 { animation: scaleIn 0.6s ease-out 0.2s both; }
    .grid-item-3 { animation: scaleIn 0.6s ease-out 0.3s both; }
    .grid-item-4 { animation: scaleIn 0.6s ease-out 0.4s both; }
    .grid-item-5 { animation: scaleIn 0.6s ease-out 0.5s both; }
    .grid-item-6 { animation: scaleIn 0.6s ease-out 0.6s both; }

    /* Floating elements */
    .floating-element {
      animation: float 3s ease-in-out infinite;
    }
  `;

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredAndSortedNews.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredAndSortedNews.length / articlesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return "Tanggal tidak tersedia";
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const createSnippet = (htmlContent) => {
    if (!htmlContent) return '';
    const plainText = htmlContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
    return plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '');
  };

  // Loading state with enhanced animation
  if (loading) {
    return (
      <>
        <style>{enhancedStyles}</style>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="text-xl text-white mt-4">Memuat berita luar biasa...</div>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      </>
    );
  }

  // Error state with animation
  if (error) {
    return (
      <>
        <style>{enhancedStyles}</style>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-500/30 backdrop-blur-sm">
            <div className="text-6xl mb-4 floating-element">📰</div>
            <div className="text-red-400 text-xl">{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 3. GUNAKAN KOMPONEN SEO */}
      <SEO 
        title={pageTitle}
        description={pageDescription}
        url="/news"
        imageUrl={primaryImageUrl}
        structuredData={structuredData}
      />

      <style>{enhancedStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-400/5 rounded-full floating-element"></div>
          <div className="absolute top-1/3 right-20 w-96 h-96 bg-blue-400/3 rounded-full floating-element" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-purple-400/4 rounded-full floating-element" style={{animationDelay: '2s'}}></div>
        </div>

        <main 
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white relative z-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? 0 : 20}px)`,
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          {/* Header Section */}
          <section className="mt-12 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent rounded-lg"></div>
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 news-header relative z-10"
              style={{
                background: 'linear-gradient(-45deg, #FFFFFF, #FBBF24, #F59E0B, #FFFFFF)',
                backgroundSize: '400% 400%',
                animation: 'gradientMove 4s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: `translateY(${scrollY * 0.05}px)`,
              }}
            >
              Berita & Pembaruan
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto news-subtitle relative z-10">
              Tetap update dengan cerita, acara, dan pengumuman terbaru dari Kopi LS.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4 rounded-full"></div>
          </section>

          {/* Top News Section */}
          {topNews.length > 0 && (
            <section className="my-16">
              <h2 className="text-3xl font-heading font-bold text-amber-400 mb-8 text-center relative">
                ⭐ Berita Teratas
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-amber-400 rounded-full"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topNews.map((article, index) => (
                  <Link 
                    to={`/news/${article.slug}`} 
                    key={article._id} 
                    className={`block news-card top-news-card rounded-lg shadow-lg overflow-hidden group grid-item-${index + 1}`}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={article.thumbnailUrl || 'https://placehold.co/600x400/111827/4b5563?text=Kopi+LS'} 
                        alt={article.title} 
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6 news-card-content">
                      <p className="text-sm text-amber-300 mb-2 font-medium">{formatDate(article.createdAt)}</p>
                      <h3 className="font-bold text-xl mb-3 text-white font-heading">{article.title}</h3>
                      <p className="text-gray-300 text-sm font-body leading-relaxed">{createSnippet(article.content)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Search and Filter Section */}
          <section 
            className="my-12 p-6 filter-section rounded-lg"
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.4s both'
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <input 
                  type="text"
                  placeholder="Cari berita..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 search-input rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-white placeholder-gray-400"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  🔍
                </div>
              </div>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="p-3 sort-select rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-white"
              >
                <option value="date-desc">Urutkan: Terbaru</option>
                <option value="date-asc">Urutkan: Terlama</option>
                <option value="title-asc">Urutkan: Judul A-Z</option>
                <option value="title-desc">Urutkan: Judul Z-A</option>
              </select>
            </div>
          </section>

          {/* All News Section */}
          <section>
            <h2 className="text-3xl font-heading font-bold text-white mb-8 text-center relative">
              Semua Berita
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-white rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.length > 0 ? (
                currentArticles.map((article, index) => (
                  <Link 
                    to={`/news/${article.slug}`} 
                    key={article._id} 
                    className={`block news-card rounded-lg shadow-lg overflow-hidden group grid-item-${index + 1}`}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={article.thumbnailUrl || 'https://placehold.co/600x400/111827/4b5563?text=Kopi+LS'} 
                        alt={article.title} 
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6 news-card-content">
                      <p className="text-sm text-gray-400 mb-2">{formatDate(article.createdAt)}</p>
                      <h3 className="font-bold text-xl mb-3 text-amber-400 font-heading">{article.title}</h3>
                      <p className="text-gray-300 text-sm font-body leading-relaxed">{createSnippet(article.content)}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4 floating-element">📭</div>
                  <p className="text-gray-500 text-lg">Tidak ada artikel berita yang cocok dengan kriteria Anda.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2 flex-wrap gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1} 
                  className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600 pagination-button"
                >
                  ← Sebelumnya
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <button 
                    key={number + 1} 
                    onClick={() => paginate(number + 1)} 
                    className={`px-4 py-2 rounded pagination-button ${
                      currentPage === number + 1 
                        ? 'pagination-active' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                  className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600 pagination-button"
                >
                  Berikutnya →
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default NewsPage;
