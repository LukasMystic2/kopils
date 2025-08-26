import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useCart } from '../context/CartContext';

const ProductModal = ({ isOpen, onRequestClose, product }) => {
  const { addToCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [addToCartClicked, setAddToCartClicked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Effect to prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Start animation after a short delay
      const timer = setTimeout(() => setIsAnimating(true), 10);
      setImageLoaded(false);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
      setAddToCartClicked(false);
    }
  }, [isOpen]);

  const handleAddToCart = () => {
    setAddToCartClicked(true);
    addToCart(product);
    
    // Close modal after animation
    setTimeout(() => {
      onRequestClose();
    }, 1200);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onRequestClose();
    }, 500); // Match this to the transition duration
  };

  if (!isOpen) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const isSoldOut = product.stock === 0;
  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

  // The modal content is now returned inside a Portal
  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ease-out ${
          isAnimating ? 'bg-black/70 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={handleClose}
      >
        
        {/* Modal Content - Centered and Portrait */}
        <div
          className={`bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white w-full max-w-sm max-h-[90vh] transition-all duration-500 ease-out border border-gray-700/50 shadow-2xl relative overflow-hidden rounded-2xl flex flex-col
                    ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-green-500/5 animate-gradient-shift"></div>

          {/* Close Button with Animation */}
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-gray-800/80 hover:bg-red-600/80 rounded-full z-20 transition-all duration-300 transform hover:scale-110 hover:rotate-90 backdrop-blur-sm border border-gray-600/50 group"
            aria-label="Tutup modal"
          >
            <i className="fas fa-times text-gray-300 group-hover:text-white transition-colors duration-300"></i>
          </button>

          {/* Discount Badge */}
          {product.discount > 0 && !isSoldOut && (
            <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg animate-pulse border-2 border-red-400/50">
              <i className="fas fa-fire mr-1"></i>
              {product.discount}% Diskon
            </div>
          )}

          {/* Image Section with Loading Animation */}
          <div className="relative w-full h-96 overflow-hidden rounded-t-2xl group flex-shrink-0">
            <img 
              src={product.imageUrl || 'https://placehold.co/600x400/111827/4b5563?text=Kopi+LS'} 
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              } ${isSoldOut ? 'grayscale' : 'group-hover:scale-105'}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 w-2 h-2 bg-amber-400/60 rounded-full animate-float-1"></div>
              <div className="absolute top-16 right-12 w-1.5 h-1.5 bg-green-400/60 rounded-full animate-float-2"></div>
              <div className="absolute bottom-12 left-12 w-1 h-1 bg-blue-400/60 rounded-full animate-float-3"></div>
              <div className="absolute bottom-8 right-8 w-2 h-2 bg-purple-400/60 rounded-full animate-float-4"></div>
            </div>

            {isSoldOut && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center transform animate-bounce">
                  <i className="fas fa-times-circle text-red-400 text-4xl mb-2"></i>
                  <span className="text-white text-xl font-bold">STOK HABIS</span>
                </div>
              </div>
            )}

            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
            )}
          </div>

          {/* Content Section with Scroll */}
          <div className="flex flex-col relative z-10 flex-grow min-h-0">
            <div className="p-6 flex-shrink-0">
              {product.category && (
                <div className="inline-block mb-3">
                  <span className="text-xs font-semibold text-amber-400 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-full px-3 py-1 backdrop-blur-sm animate-glow">
                    {product.category.name}
                  </span>
                </div>
              )}

              <h2 className="text-2xl font-bold text-white font-heading mb-3 animate-slide-in-right bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text">
                {product.name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4 animate-slide-in-left">
                {product.weight && <span>Berat: {product.weight}</span>}
                {product.volume && <span>Volume: {product.volume}</span>}
                {product.stock !== undefined && <span className={product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}>Stok: {product.stock}</span>}
              </div>
            </div>

            <div className="px-6 pb-4 overflow-y-auto flex-grow custom-scrollbar">
              <div 
                className="text-gray-300 leading-relaxed prose-content animate-fade-in-up"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>Deskripsi tidak tersedia.</p>' }} 
              />
            </div>

            <div className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  {product.discount > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-white animate-price-bounce">{formatPrice(discountedPrice)}</span>
                        <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                      </div>
                      <div className="text-sm text-green-400 font-semibold flex items-center gap-2 animate-savings-flash">
                        <i className="fas fa-piggy-bank"></i>
                        <span>Hemat {formatPrice(product.price - discountedPrice)}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-white animate-price-bounce">{formatPrice(product.price)}</span>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut || addToCartClicked}
                  className={`w-full sm:w-auto font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform flex items-center justify-center gap-2 min-w-[160px] ${
                    isSoldOut 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : addToCartClicked
                      ? 'bg-gradient-to-r from-green-500 to-green-400 text-white animate-success-pulse cursor-wait'
                      : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 hover:shadow-green-500/30 hover:scale-105 active:scale-95 animate-button-glow'
                  }`}
                >
                  <i className={`fas ${isSoldOut ? 'fa-times' : addToCartClicked ? 'fa-check animate-check-bounce' : 'fa-cart-plus'}`}></i>
                  {isSoldOut ? 'Stok Habis' : addToCartClicked ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style>{`
        .prose-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .prose-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .prose-content li { margin-bottom: 0.5rem; line-height: 1.6; }
        .prose-content a { color: #f59e0b; text-decoration: underline; transition: color 0.3s ease; }
        .prose-content a:hover { color: #fbbf24; }
        .prose-content img, .prose-content video { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .prose-content p { margin-bottom: 1rem; line-height: 1.7; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(55, 65, 81, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #f59e0b, #d97706); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #fbbf24, #f59e0b); }
        @keyframes float1 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(10px, -10px) rotate(90deg); } 50% { transform: translate(-5px, -20px) rotate(180deg); } 75% { transform: translate(-10px, -5px) rotate(270deg); } }
        @keyframes float2 { 0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; } 33% { transform: translate(-15px, 10px) rotate(120deg); opacity: 1; } 66% { transform: translate(8px, -15px) rotate(240deg); opacity: 0.8; } }
        @keyframes float3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(15px, -10px) scale(1.2); } }
        @keyframes float4 { 0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); } 25% { transform: translate(-8px, -12px) rotate(90deg) scale(1.1); } 50% { transform: translate(12px, -8px) rotate(180deg) scale(0.9); } 75% { transform: translate(-6px, 8px) rotate(270deg) scale(1.2); } }
        .animate-float-1 { animation: float1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float3 5s ease-in-out infinite; }
        .animate-float-4 { animation: float4 7s ease-in-out infinite; }
        @keyframes gradientShift { 0%, 100% { opacity: 0.3; transform: rotate(0deg); } 50% { opacity: 0.6; transform: rotate(180deg); } }
        .animate-gradient-shift { animation: gradientShift 10s ease-in-out infinite; }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in-right { animation: slideInRight 0.6s ease-out forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        @keyframes priceBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes savingsFlash { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes buttonGlow { 0%, 100% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); } 50% { box-shadow: 0 10px 25px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -2px rgba(34, 197, 94, 0.1); } }
        @keyframes successPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } }
        @keyframes checkBounce { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.3); } 75% { transform: scale(0.9); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.3); } 50% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.6), 0 0 25px rgba(245, 158, 11, 0.3); } }
        .animate-price-bounce { animation: priceBounce 2s ease-in-out infinite; }
        .animate-savings-flash { animation: savingsFlash 2s ease-in-out infinite; }
        .animate-button-glow { animation: buttonGlow 2s ease-in-out infinite; }
        .animate-success-pulse { animation: successPulse 1s ease-in-out infinite; }
        .animate-check-bounce { animation: checkBounce 0.6s ease-in-out; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
      `}</style>
    </>,
    document.body // The modal will be rendered into the body tag
  );
};

export default ProductModal;
