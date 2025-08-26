import React, { useState, useMemo, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import SEO from '../components/SEO'; // 1. IMPOR KOMPONEN SEO

const ProductsPage = () => {
  const API_URL = process.env.REACT_APP_SERVER_URL;
  const { data: products, loading: productsLoading, error: productsError } = useFetch(`${API_URL}/api/products`);
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useFetch(`${API_URL}/api/categories`);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Effect for animations
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Effect for the "Back to Top" button
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showBackToTop && window.pageYOffset > 400) {
        setShowBackToTop(true);
      } else if (showBackToTop && window.pageYOffset <= 400) {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showBackToTop]);

  // 2. SIAPKAN DATA UNTUK SEO
  const pageTitle = "Koleksi Kopi Premium Kopi LS";
  const pageDescription = "Jelajahi semua koleksi produk Kopi LS. Dari biji kopi Robusta Dampit pilihan hingga minuman kopi siap saji yang menyegarkan.";
  const siteUrl = "https://www.kopils.com";
  const logoUrl = `${siteUrl}/assets/Logo_bubuk.png`;

  // --- LOGIKA BARU: Dapatkan gambar dari produk terbaru secara dinamis ---
  const primaryImageUrl = useMemo(() => {
    if (products && products.length > 0) {
      // Asumsikan produk memiliki field `createdAt`. Jika tidak, urutkan berdasarkan kriteria lain atau ambil yang pertama.
      const sortedProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const firstProductWithImage = sortedProducts.find(product => product.imageUrl);
      if (firstProductWithImage) {
        return firstProductWithImage.imageUrl;
      }
    }
    return logoUrl; // Fallback ke logo jika tidak ada gambar produk
  }, [products, logoUrl]);

  // Data terstruktur untuk halaman koleksi produk
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "url": `${siteUrl}/products`,
    "description": pageDescription,
    "image": primaryImageUrl || logoUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Kopi LS",
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      }
    }
  };

  const { featuredProducts, regularProducts } = useMemo(() => {
    if (!products) return { featuredProducts: [], regularProducts: [] };
    const featured = products.filter(p => p.isFeatured);
    const regular = products.filter(p => !p.isFeatured);
    return { featuredProducts: featured, regularProducts: regular };
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!regularProducts) return [];
    let processedProducts = [...regularProducts];

    if (filterCategoryId !== 'All') {
      processedProducts = processedProducts.filter(p => p.category?._id === filterCategoryId);
    }
    if (searchTerm) {
      processedProducts = processedProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.replace(/<[^>]+>/g, '').toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    switch (sortOrder) {
      case 'price-asc':
        processedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        processedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        processedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        processedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return processedProducts;
  }, [regularProducts, searchTerm, filterCategoryId, sortOrder]);

  const error = productsError || categoriesError;
  const loading = productsLoading || categoriesLoading;

  // Dynamic heading for search/filter feedback
  const resultsHeading = useMemo(() => {
    if (searchTerm) return `Hasil untuk "${searchTerm}"`;
    if (filterCategoryId !== 'All') {
        const category = categories?.find(c => c._id === filterCategoryId);
        return `Menampilkan: ${category?.name || '...'}`;
    }
    return 'Semua Produk';
  }, [searchTerm, filterCategoryId, categories]);

  return (
    <>
      {/* 3. GUNAKAN KOMPONEN SEO */}
      <SEO
        title={pageTitle}
        description={pageDescription}
        url="/products"
        imageUrl={primaryImageUrl}
        structuredData={structuredData}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-amber-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-amber-400/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Hero Section with Enhanced Animation */}
        <section className={`mt-12 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-block mb-6">
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-white mb-4 bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent hover:from-amber-200 hover:to-white transition-all duration-700">
              Koleksi Kopi Kami
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse"></div>
          </div>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Jelajahi rangkaian kopi premium pilihan kami, dari biji utuh hingga es kopi susu andalan kami.
          </p>
          
          {/* Decorative coffee icons */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <i className="fas fa-coffee text-amber-500 text-xl animate-bounce" style={{ animationDelay: '0s' }}></i>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <i className="fas fa-leaf text-amber-400 text-lg animate-bounce" style={{ animationDelay: '0.5s' }}></i>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <i className="fas fa-coffee text-amber-500 text-xl animate-bounce" style={{ animationDelay: '1s' }}></i>
          </div>
        </section>

        {/* Featured Products with Staggered Animation */}
        {!loading && featuredProducts.length > 0 && (
          <section className={`my-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
            <div className="text-center mb-8 relative">
              <h2 className="text-3xl font-heading font-bold text-amber-400 mb-2 relative inline-block">
                Produk Unggulan
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse"></div>
              </h2>
              <p className="text-gray-400 text-sm">Pilihan terpopuler kami</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product._id}
                  className="transform transition-all duration-700"
                  style={{ 
                    transitionDelay: `${400 + index * 200}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
                  }}
                >
                  <ProductCard product={product} view="guest" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Search and Filter Section */}
        <section className={`my-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
          <div className="relative p-6 bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-amber-500/30 transition-all duration-500">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Enhanced Search Input */}
              <div className="lg:col-span-4 relative group">
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm ${searchFocused ? 'opacity-100' : ''}`}></div>
                <input 
                  type="text"
                  placeholder="Cari koleksi kopi kami..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="relative w-full p-4 bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 pl-12 hover:border-amber-400"
                />
                <i className={`fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 ${searchFocused ? 'text-amber-400 animate-pulse' : ''}`}></i>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-300"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              {/* Enhanced Category Filters */}
              <div className="lg:col-span-5">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-amber-400 font-semibold text-sm whitespace-nowrap flex items-center gap-2">
                    <i className="fas fa-filter text-xs"></i>
                    Saring:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setFilterCategoryId('All')} 
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                        filterCategoryId === 'All' 
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/25' 
                          : 'bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600 hover:border-amber-500/50'
                      }`}
                    >
                      Semua
                    </button>
                    {categories && categories.map((category, index) => (
                      <button 
                        key={category._id} 
                        onClick={() => setFilterCategoryId(category._id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                          filterCategoryId === category._id 
                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/25' 
                            : 'bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600 hover:border-amber-500/50'
                        }`}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="lg:col-span-3">
                <div className="relative group">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 hover:border-amber-400 appearance-none pr-12"
                  >
                    <option value="default">Urutkan...</option>
                    <option value="price-asc">Harga: Terendah ke Tertinggi</option>
                    <option value="price-desc">Harga: Tertinggi ke Terendah</option>
                    <option value="name-asc">Nama: A ke Z</option>
                    <option value="name-desc">Nama: Z ke A</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-amber-400 transition-colors duration-300"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section with Enhanced Animation */}
        <section className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
              {resultsHeading}
              {filteredAndSortedProducts.length > 0 && (
                <span className="text-sm bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
                  {filteredAndSortedProducts.length} produk
                </span>
              )}
            </h2>
          </div>

          {error && (
            <div className="text-center p-8 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl mb-3"></i>
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="transform transition-all duration-500"
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: 1,
                    transform: 'translateY(0)'
                  }}
                >
                  <ProductCardSkeleton />
                </div>
              ))
            ) : filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="transform transition-all duration-500"
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
                  }}
                >
                  <ProductCard product={product} view="guest" />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="inline-block p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                  <i className="fas fa-search text-gray-500 text-4xl mb-4"></i>
                  <p className="text-gray-500 text-xl mb-2">Tidak ada produk yang cocok</p>
                  <p className="text-gray-600 text-sm">Coba ubah pencarian atau filter Anda</p>
                </div>
              </div>
            )}
          </div>
        </section>
        {/* Custom CSS for animations */}
        <style>{`
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3) translateY(20px);
            }
            50% {
              opacity: 1;
              transform: scale(1.1) translateY(-5px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
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
          
          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `}</style>
      </main>
    </>
  );
};

export default ProductsPage;
