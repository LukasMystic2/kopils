import React, { useState, useRef, useEffect } from 'react';
import ProductModal from './ProductModal';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onDelete, onEdit, view }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [addToCartClicked, setAddToCartClicked] = useState(false);
  const cardRef = useRef(null);
  const { addToCart } = useCart();

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const isSoldOut = product.stock === 0;
  const discountedPrice = product.price * (1 - product.discount / 100);

  const descriptionText = product.description
    ? product.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
    : '';

  const handleCardClick = () => {
    if (view === 'guest') {
      setModalIsOpen(true);
    }
  };

  const handleAdminActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };
  
  const handleAddToCart = (e) => {
    e.stopPropagation();
    setAddToCartClicked(true);
    addToCart({ ...product, price: discountedPrice });
    
    // Reset animation after delay
    setTimeout(() => setAddToCartClicked(false), 1000);
  };

  return (
    <>
      <div 
        ref={cardRef}
        className={`relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden flex flex-col group border border-gray-700/50 backdrop-blur-sm transition-all duration-500 ${
          isSoldOut 
            ? 'opacity-70 grayscale' 
            : 'transform sm:hover:scale-105 sm:hover:-translate-y-2 hover:shadow-xl sm:hover:shadow-2xl sm:hover:shadow-amber-500/20'
        } ${view === 'guest' ? 'cursor-pointer' : ''} ${isInView ? 'opacity-100 animate-fadeInUp' : 'opacity-0'}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glowing border effect - reduced on mobile */}
        <div className="absolute inset-0 rounded-lg sm:rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/10 sm:via-amber-500/20 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Image Section with Enhanced Effects */}
        <div className="relative overflow-hidden">
          <div className="relative">
            <img 
              src={product.imageUrl || 'https://placehold.co/600x400/111827/4b5563?text=Kopi+LS'} 
              alt={product.name} 
              className={`w-full h-40 sm:h-48 md:h-56 object-cover transition-all duration-700 ${
                isSoldOut 
                  ? 'grayscale' 
                  : 'sm:group-hover:scale-110 sm:group-hover:brightness-110'
              }`}
            />
            
            {/* Image overlay gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent transition-opacity duration-500 ${
              isHovered ? 'opacity-60' : 'opacity-30'
            }`}></div>
            
            {/* Floating particles effect on hover - hidden on mobile for performance */}
            {isHovered && !isSoldOut && (
              <div className="absolute inset-0 pointer-events-none hidden sm:block">
                <div className="absolute top-4 left-4 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-8 left-6 w-1 h-1 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
            )}
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-times-circle text-red-400 text-2xl sm:text-3xl mb-2"></i>
                <span className="text-white text-lg sm:text-xl font-bold">STOK HABIS</span>
              </div>
            </div>
          )}
          
          {/* Discount Badge with Animation - responsive sizing */}
          {product.discount > 0 && !isSoldOut && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-lg animate-pulse border-2 border-red-400/50">
              <i className="fas fa-fire text-xs mr-1"></i>
              {product.discount}% DISKON
            </div>
          )}

          {/* Featured Badge - responsive sizing */}
          {product.isFeatured && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-lg">
              <i className="fas fa-star text-xs mr-1"></i>
              Unggulan
            </div>
          )}

          {/* Quick Action Overlay for Guest View - mobile optimized */}
          {view === 'guest' && !isSoldOut && (
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-3 sm:pb-4 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 sm:translate-y-4'
            } sm:opacity-0 hover:opacity-100`}>
              <button 
                onClick={handleAddToCart}
                className={`bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 sm:px-6 rounded-full font-semibold shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm ${
                  addToCartClicked ? 'animate-bounce' : ''
                }`}
              >
                <i className={`fas ${addToCartClicked ? 'fa-check' : 'fa-cart-plus'} text-sm`}></i>
                {addToCartClicked ? 'Ditambahkan!' : 'Tambah Cepat'}
              </button>
            </div>
          )}
        </div>

        {/* Content Section with Enhanced Styling - mobile spacing */}
        <div className="p-3 sm:p-4 md:p-5 flex-grow flex flex-col relative">
          {/* Category Badge - responsive layout */}
          {product.category && (
            <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-full px-2 py-1 sm:px-3 backdrop-blur-sm w-fit">
                {product.category.name}
              </span>
              {typeof product.stock === 'number' && (
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                  product.stock > 10 
                    ? 'text-green-400 bg-green-500/20 border border-green-500/30' 
                    : product.stock > 0 
                    ? 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30' 
                    : 'text-red-400 bg-red-500/20 border border-red-500/30'
                }`}>
                  Stok: {product.stock}
                </span>
              )}
            </div>
          )}

          {/* Product Name with Hover Effect - responsive text size */}
          <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-white font-heading group-hover:text-amber-100 transition-colors duration-300 line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Product Details - responsive spacing */}
          <div className="space-y-1 mb-2 sm:mb-3 text-sm text-gray-400">
            {product.weight && (
              <div className="flex items-center gap-2">
                <i className="fas fa-weight-hanging text-xs text-amber-400 w-3"></i>
                <span className="text-xs sm:text-sm">Berat: {product.weight}</span>
              </div>
            )}
            {product.volume && (
              <div className="flex items-center gap-2">
                <i className="fas fa-flask text-xs text-amber-400 w-3"></i>
                <span className="text-xs sm:text-sm">Volume: {product.volume}</span>
              </div>
            )}
          </div>

          {/* Description - responsive text and truncation */}
          <p className="text-gray-300 text-sm flex-grow font-body leading-relaxed">
            {descriptionText.substring(0, 80)}{descriptionText.length > 80 ? '...' : ''}
          </p>

          {/* Price Section with Enhanced Animation - responsive layout */}
          <div className="mt-3 sm:mt-4 flex justify-between items-end">
            <div className="space-y-1 flex-1">
              {product.discount > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-lg sm:text-xl text-white">{formatPrice(discountedPrice)}</span>
                    <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                  </div>
                  <div className="text-xs text-green-400 font-semibold flex items-center gap-1">
                    <i className="fas fa-piggy-bank"></i>
                    <span className="truncate">Hemat {formatPrice(product.price - discountedPrice)}</span>
                  </div>
                </div>
              ) : (
                <span className="font-bold text-lg sm:text-xl text-white break-words">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Section - mobile optimized */}
        {view === 'admin' ? (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm border-t border-gray-600/50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              {product.discount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-semibold">
                    Diskon: {product.discount}%
                  </span>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3 sm:ml-auto">
                <button 
                  onClick={(e) => handleAdminActionClick(e, () => onEdit(product))} 
                  className="flex-1 sm:flex-none text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-edit text-xs"></i>
                  <span className="hidden sm:inline">Ubah</span>
                </button>
                <button 
                  onClick={(e) => handleAdminActionClick(e, () => onDelete(product._id))} 
                  className="flex-1 sm:flex-none text-sm bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash text-xs"></i>
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm border-t border-gray-600/50" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleAddToCart} 
              disabled={isSoldOut} 
              className={`w-full text-sm py-3 px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform flex items-center justify-center gap-2 ${
                isSoldOut 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : `bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 active:scale-95 shadow-lg hover:shadow-green-500/25 ${
                      addToCartClicked ? 'animate-pulse bg-gradient-to-r from-green-500 to-green-400' : ''
                    }`
              }`}
            >
              <i className={`fas ${
                isSoldOut 
                  ? 'fa-times' 
                  : addToCartClicked 
                  ? 'fa-check animate-bounce' 
                  : 'fa-cart-plus'
              } text-sm`}></i>
              {isSoldOut ? 'Stok Habis' : addToCartClicked ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
            </button>

            {/* Quick View Button for Mobile - always visible on mobile */}
            {!isSoldOut && view === 'guest' && (
              <button
                onClick={() => setModalIsOpen(true)}
                className="w-full mt-2 text-xs text-amber-400 hover:text-amber-300 active:text-amber-500 transition-colors duration-300 flex items-center justify-center gap-1 py-1"
              >
                <i className="fas fa-eye text-xs"></i>
                Lihat Rincian Cepat
              </button>
            )}
          </div>
        )}

        {/* Subtle Animation Indicators - hidden on mobile for performance */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>
            <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Product Modal */}
      {view === 'guest' && (
        <ProductModal 
          isOpen={modalIsOpen} 
          onRequestClose={() => setModalIsOpen(false)} 
          product={{...product, price: discountedPrice}} 
        />
      )}

      {/* Custom CSS for animations */}
      <style>{`
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
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .group:hover .animate-ping {
            animation: none;
          }
          
          .backdrop-blur-sm {
            backdrop-filter: blur(2px);
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;
