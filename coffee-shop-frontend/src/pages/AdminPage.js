import React, { useState, useMemo, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminProductForm from '../components/AdminProductForm';
import ProductCard from '../components/ProductCard';
import ManageContentForm from '../components/ManageContentForm';
import ManageNews from '../components/ManageNews';
import ManageWhyUsForm from '../components/ManageWhyUsForm';
import ManageHeroForm from '../components/ManageHeroForm';
import Notification from '../components/Notification';
import useFetch from '../hooks/useFetch';
import ManageCategories from '../components/ManageCategories';
import AdminChatPage from './AdminChatPage';
import ManagePaymentInfo from '../components/ManagePaymentInfo';
import ManageOrders from '../components/ManageOrders';
import ManageAboutPage from '../components/ManageAboutPage';
import ManagePrivacyPolicy from '../components/ManagePrivacyPolicy';
import ManageTermsOfService from '../components/ManageTermsOfService';

const AdminPage = ({ adminInfo, onLogout }) => {
  const API_URL = process.env.SERVER_URL;
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

  const { data: productsData, loading: productsLoading, setData: setProductsData } = useFetch(`${API_URL}/api/products`, token, true);
  const { data: contentData, loading: contentLoading, setData: setContentData } = useFetch(`${API_URL}/api/content`, token, true);
  const { data: categories, loading: categoriesLoading } = useFetch(`${API_URL}/api/categories`, token, true);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeSection, setActiveSection] = useState('homepage');
  const [notification, setNotification] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState('All');
  const [mounted, setMounted] = useState(false);
  const [sectionAnimation, setSectionAnimation] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSectionAnimation('fadeInUp');
    const timer = setTimeout(() => setSectionAnimation(''), 600);
    return () => clearTimeout(timer);
  }, [activeSection]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleDataChange = async (successMessage) => {
    setEditingProduct(null);
    setProductsData(null);
    setContentData(null);
    if (successMessage) {
        showNotification(successMessage);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal menghapus produk');
        handleDataChange("Produk berhasil dihapus!");
      } catch (err) {
        showNotification(err.message, 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setActiveSection('products');
    setTimeout(() => {
        setEditingProduct(product);
        const productForm = document.getElementById('product-form-section');
        if (productForm) {
            productForm.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
  };

  const { regularProducts } = useMemo(() => {
    const productsArray = Array.isArray(productsData) ? productsData : [];
    return { regularProducts: productsArray.filter(p => !p.isFeatured) };
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (filterCategoryId === 'All') {
      return regularProducts;
    }
    return regularProducts.filter(p => p.category?._id === filterCategoryId);
  }, [regularProducts, filterCategoryId]);

  const loading = productsLoading || contentLoading || categoriesLoading;

  // Enhanced Section Component with better styling
  const Section = ({ id, title, children, icon, gradient = 'from-amber-400 to-orange-500' }) => (
    <section 
        style={{
            display: activeSection === id ? 'block' : 'none',
            animation: activeSection === id ? `${sectionAnimation} 0.6s cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
            opacity: activeSection === id ? 1 : 0,
        }}
    >
        {/* Enhanced Section Header */}
        <div 
            className="relative mb-8 p-6 rounded-2xl border"
            style={{
                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Animated Background Pattern */}
            <div 
                className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), 
                                     radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)`,
                    animation: 'float 6s ease-in-out infinite',
                }}
            />
            
            <div className="relative flex items-center space-x-4">
                <div 
                    className="flex items-center justify-center w-16 h-16 rounded-xl text-3xl"
                    style={{
                        background: `linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)`,
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        animation: 'pulse 2s ease-in-out infinite',
                        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)',
                    }}
                >
                    {icon}
                </div>
                <div>
                    <h2 
                        className="text-3xl lg:text-4xl font-bold font-heading"
                        style={{
                            background: `linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {title}
                    </h2>
                    <div 
                        className="mt-2 h-1 rounded-full"
                        style={{
                            width: '60%',
                            background: 'linear-gradient(to right, #fbbf24, transparent)',
                            animation: 'shimmer 2s infinite',
                        }}
                    />
                </div>
            </div>
            
            {/* Floating Decorative Elements */}
            <div 
                className="absolute top-4 right-4 w-3 h-3 rounded-full opacity-60"
                style={{
                    background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                    animation: 'float 3s ease-in-out infinite',
                }}
            />
            <div 
                className="absolute bottom-4 right-8 w-2 h-2 rounded-full opacity-40"
                style={{
                    background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                    animation: 'float 4s ease-in-out infinite 1s',
                }}
            />
        </div>

        {/* Content Container with enhanced styling */}
        <div 
            className="relative"
            style={{
                animation: activeSection === id ? 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both' : 'none'
            }}
        >
            {children}
        </div>
    </section>
  );

  // Enhanced Filter Button Component
  const FilterButton = ({ isActive, onClick, children, index = 0 }) => (
    <button 
        onClick={onClick}
        className="px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
        style={{
            background: isActive 
                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)' 
                : 'linear-gradient(135deg, rgba(75, 85, 99, 0.5) 0%, rgba(55, 65, 81, 0.6) 100%)',
            color: isActive ? '#ffffff' : '#d1d5db',
            border: isActive 
                ? '1px solid rgba(251, 191, 36, 0.5)' 
                : '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: isActive 
                ? '0 8px 25px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                : '0 4px 15px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            animation: `slideInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`,
            textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
        }}
    >
        {children}
        {isActive && (
            <div 
                className="absolute inset-0 opacity-30 pointer-events-none rounded-xl"
                style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                    animation: 'shimmer 2s infinite',
                }}
            />
        )}
    </button>
  );

  // Enhanced Loading Component
  if (loading) return (
    <div 
        className="flex flex-col items-center justify-center min-h-screen text-white relative overflow-hidden"
        style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
        }}
    >
        {/* Animated Background */}
        <div 
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), 
                                 radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.3) 0%, transparent 50%), 
                                 radial-gradient(circle at 40% 40%, rgba(217, 119, 6, 0.2) 0%, transparent 50%)`,
                animation: 'backgroundMove 10s ease-in-out infinite',
            }}
        />
        
        {/* Loading Animation */}
        <div className="relative z-10 flex flex-col items-center">
            <div 
                className="relative mb-8"
                style={{
                    animation: 'float 3s ease-in-out infinite',
                }}
            >
                <div
                    className="w-20 h-20 rounded-full relative"
                    style={{
                        background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
                        animation: 'spin 2s linear infinite',
                        padding: '4px',
                    }}
                >
                    <div 
                        className="w-full h-full rounded-full flex items-center justify-center text-3xl"
                        style={{
                            background: 'linear-gradient(135deg, #1f2937, #111827)',
                        }}
                    >
                        🛠️
                    </div>
                </div>
                
                {/* Orbiting dots */}
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                            top: '50%',
                            left: '50%',
                            transformOrigin: '0 0',
                            transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateX(50px)`,
                            animation: `orbit 3s linear infinite ${i * 0.5}s`,
                            boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
                        }}
                    />
                ))}
            </div>

            <div className="text-center">
                <p 
                    className="text-2xl lg:text-3xl font-bold mb-4"
                    style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'pulse 2s ease-in-out infinite',
                    }}
                >
                    ⚡ Memuat Panel Admin ⚡
                </p>
                <p 
                    className="text-gray-400 text-lg tracking-wide"
                    style={{
                        animation: 'fadeInOut 2s ease-in-out infinite 1s',
                    }}
                >
                    Menyiapkan dashboard management...
                </p>
                
                {/* Loading progress bar */}
                <div className="mt-6 w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
                            animation: 'loadingBar 2s ease-in-out infinite',
                            backgroundSize: '200% 100%',
                        }}
                    />
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <Notification 
        message={notification?.message} 
        type={notification?.type} 
        onClose={() => setNotification(null)} 
      />
      
      <AdminHeader 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        adminInfo={adminInfo} 
        onLogout={onLogout} 
      />
      
      <main 
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white relative min-h-screen"
        style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1s ease-out',
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
        }}
      >
        {/* Animated Background Elements */}
        <div 
            className="fixed inset-0 pointer-events-none opacity-30"
            style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
                animation: 'backgroundMove 15s ease-in-out infinite',
            }}
        />

        <Section id="homepage" title="Kelola Konten Beranda" icon="🏠">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div 
                    className="transform hover:scale-[1.02] transition-all duration-300"
                    style={{
                        animation: 'slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                    }}
                >
                    <ManageHeroForm 
                        initialData={contentData?.hero} 
                        onUpdate={handleDataChange} 
                        showNotification={showNotification} 
                    />
                </div>
                
                <div 
                    className="transform hover:scale-[1.02] transition-all duration-300"
                    style={{
                        animation: 'slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both'
                    }}
                >
                    <ManageContentForm 
                        sectionId="description" 
                        label="Deskripsi" 
                        initialData={contentData?.description} 
                        hasTitle={true} 
                        onUpdate={handleDataChange} 
                        showNotification={showNotification} 
                    />
                </div>
                
                <div 
                    className="transform hover:scale-[1.02] transition-all duration-300"
                    style={{
                        animation: 'slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both'
                    }}
                >
                    <ManageContentForm 
                        sectionId="quote" 
                        label="Kutipan" 
                        initialData={contentData?.quote} 
                        hasCite={true} 
                        onUpdate={handleDataChange} 
                        showNotification={showNotification} 
                    />
                </div>
                
                <div 
                    className="lg:col-span-2 transform hover:scale-[1.01] transition-all duration-300"
                    style={{
                        animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both'
                    }}
                >
                    <ManageWhyUsForm 
                        initialData={contentData?.whyUs} 
                        onUpdate={handleDataChange} 
                        showNotification={showNotification} 
                    />
                </div>
            </div>
        </Section>

        <Section id="about" title="Kelola Halaman Tentang Kami" icon="ℹ️">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManageAboutPage showNotification={showNotification} adminInfo={adminInfo} />
            </div>
        </Section>

        <Section id="news" title="Kelola Berita" icon="📰">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManageNews showNotification={showNotification} />
            </div>
        </Section>
        
        <Section id="categories" title="Kelola Kategori" icon="🏷️">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManageCategories showNotification={showNotification} />
            </div>
        </Section>

        <Section id="products" title="Kelola Produk" icon="📦">
            <div id="product-form-section" className="mb-8">
                <div 
                    className="transform hover:scale-[1.01] transition-all duration-300"
                    style={{
                        animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                    }}
                >
                    <AdminProductForm 
                        onDataChange={handleDataChange} 
                        productToEdit={editingProduct} 
                        showNotification={showNotification} 
                        allProducts={productsData || []} 
                    />
                </div>
            </div>
            
            {/* Enhanced Filter Section */}
            <div 
                className="mb-8 p-6 rounded-2xl border backdrop-blur-md"
                style={{
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both'
                }}
            >
                <div className="flex items-center space-x-4 mb-4">
                    <div className="text-2xl">🔍</div>
                    <span className="font-bold text-xl text-gray-200">Filter Produk</span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <FilterButton
                        isActive={filterCategoryId === 'All'}
                        onClick={() => setFilterCategoryId('All')}
                        index={0}
                    >
                        ✨ Semua
                    </FilterButton>
                    
                    {categories && categories.map((category, index) => (
                        <FilterButton
                            key={category._id}
                            isActive={filterCategoryId === category._id}
                            onClick={() => setFilterCategoryId(category._id)}
                            index={index + 1}
                        >
                            {category.name}
                        </FilterButton>
                    ))}
                </div>
            </div>
            
            {/* Products Grid Header */}
            <div 
                className="flex items-center space-x-3 mb-6"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both'
                }}
            >
                <div className="text-3xl">📋</div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                    Daftar Produk
                    <span 
                        className="ml-3 px-3 py-1 text-sm rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#fbbf24',
                        }}
                    >
                        {filteredProducts.length} produk
                    </span>
                </h3>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <div
                        key={product._id}
                        className="transform hover:scale-105 transition-all duration-300"
                        style={{
                            animation: `slideInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.6 + (index * 0.1)}s both`
                        }}
                    >
                        <ProductCard 
                            product={product} 
                            onDelete={handleDelete} 
                            onEdit={handleEdit} 
                            view="admin" 
                        />
                    </div>
                ))}
            </div>
        </Section>

        <Section id="payment" title="Kelola Pengaturan Pembayaran" icon="💳">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManagePaymentInfo showNotification={showNotification} />
            </div>
        </Section>

        <Section id="orders" title="Kelola Pesanan" icon="📋">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManageOrders showNotification={showNotification} token={token} />
            </div>
        </Section>
        
        <Section id="chat" title="Obrolan Langsung" icon="💬">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <AdminChatPage adminInfo={adminInfo} />
            </div>
        </Section>

        <Section id="privacy" title="Kelola Kebijakan Privasi" icon="🔒">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManagePrivacyPolicy showNotification={showNotification} />
            </div>
        </Section>

        <Section id="terms" title="Kelola Ketentuan Layanan" icon="📄">
            <div 
                className="transform hover:scale-[1.01] transition-all duration-300"
                style={{
                    animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both'
                }}
            >
                <ManageTermsOfService showNotification={showNotification} />
            </div>
        </Section>
      </main>
      
      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
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
        
        @keyframes slideInScale {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes float {
            0%, 100% { 
                transform: translateY(0px); 
            }
            50% { 
                transform: translateY(-10px); 
            }
        }
        
        @keyframes shimmer {
            0% { 
                transform: translateX(-100%); 
            }
            100% { 
                transform: translateX(100%); 
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.8;
                transform: scale(1.05);
            }
        }
        
        @keyframes orbit {
            0% {
                transform: translate(-50%, -50%) rotate(0deg) translateX(50px);
            }
            100% {
                transform: translate(-50%, -50%) rotate(360deg) translateX(50px);
            }
        }
        
        @keyframes backgroundMove {
            0%, 100% {
                transform: translateX(0) translateY(0) rotate(0deg);
            }
            33% {
                transform: translateX(20px) translateY(-20px) rotate(1deg);
            }
            66% {
                transform: translateX(-20px) translateY(20px) rotate(-1deg);
            }
        }
        
        @keyframes fadeInOut {
            0%, 100% {
                opacity: 0.7;
            }
            50% {
                opacity: 1;
            }
        }
        
        @keyframes loadingBar {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
        
        /* Mobile Responsive Enhancements */
        @media (max-width: 768px) {
            .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 {
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1rem;
            }
            
            .text-3xl.lg\\:text-4xl {
                font-size: 1.5rem;
                line-height: 2rem;
            }
            
            .p-6 {
                padding: 1rem;
            }
            
            .space-x-4 > * + * {
                margin-left: 0.75rem;
            }
            
            .gap-6.lg\\:gap-8 {
                gap: 1rem;
            }
        }
        
        @media (max-width: 640px) {
            .text-2xl.lg\\:text-3xl {
                font-size: 1.25rem;
                line-height: 1.75rem;
            }
            
            .flex-wrap.gap-3 {
                gap: 0.5rem;
            }
            
            .px-4.py-3 {
                padding: 0.5rem 0.75rem;
            }
            
            .w-16.h-16 {
                width: 3rem;
                height: 3rem;
            }
            
            .text-3xl {
                font-size: 1.5rem;
            }
        }
        
        /* Enhanced hover effects for touch devices */
        @media (hover: none) and (pointer: coarse) {
            .transform.hover\\:scale-105:hover,
            .transform.hover\\:scale-\\[1\\.02\\]:hover,
            .transform.hover\\:scale-\\[1\\.01\\]:hover {
                transform: none;
            }
            
            .transform.hover\\:scale-105:active,
            .transform.hover\\:scale-\\[1\\.02\\]:active,
            .transform.hover\\:scale-\\[1\\.01\\]:active {
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
        }
        
        /* Smooth scrolling for mobile */
        * {
            -webkit-tap-highlight-color: transparent;
        }
        
        /* Enhanced backdrop blur support */
        @supports (backdrop-filter: blur(20px)) {
            .backdrop-blur-md {
                backdrop-filter: blur(20px);
            }
        }
        
        @supports not (backdrop-filter: blur(20px)) {
            .backdrop-blur-md {
                background: rgba(31, 41, 55, 0.95) !important;
            }
        }
        
        /* Dark mode enhancements */
        @media (prefers-color-scheme: dark) {
            .text-gray-400 {
                color: #9ca3af;
            }
            
            .text-gray-200 {
                color: #e5e7eb;
            }
        }
        
        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.5);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        /* Selection styling */
        ::selection {
            background: rgba(251, 191, 36, 0.3);
            color: #ffffff;
        }
        
        ::-moz-selection {
            background: rgba(251, 191, 36, 0.3);
            color: #ffffff;
        }
        
        /* Focus states for accessibility */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible {
            outline: 2px solid #fbbf24;
            outline-offset: 2px;
            border-radius: 4px;
        }
        
        /* Loading skeleton animations */
        .skeleton {
            background: linear-gradient(90deg, rgba(75, 85, 99, 0.3) 25%, rgba(156, 163, 175, 0.3) 50%, rgba(75, 85, 99, 0.3) 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
        
        /* Enhanced glassmorphism effect */
        .glass-card {
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        /* Smooth transitions for all interactive elements */
        button,
        input,
        textarea,
        select,
        .transform {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Enhanced mobile touch feedback */
        @media (pointer: coarse) {
            button {
                min-height: 44px;
                min-width: 44px;
            }
            
            .px-4.py-3 {
                padding: 0.75rem 1rem;
            }
        }
      `}</style>
    </>
  );
};

export default AdminPage;