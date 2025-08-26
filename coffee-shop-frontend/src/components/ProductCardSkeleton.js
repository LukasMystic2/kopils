import React from 'react';
import './ProductCardSkeleton.css'; // We'll update this CSS file

const ProductCardSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-gray-700/50 backdrop-blur-sm">
      {/* Image Skeleton - responsive height */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse skeleton-shimmer"></div>
      
      {/* Content Skeleton - responsive padding */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Category and Stock Row - responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 sm:mb-3">
          <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-20 animate-pulse skeleton-shimmer"></div>
          <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-16 animate-pulse skeleton-shimmer"></div>
        </div>
        
        {/* Product Title - responsive sizing */}
        <div className="space-y-2 mb-2 sm:mb-3">
          <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-3/4 animate-pulse skeleton-shimmer"></div>
          <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-1/2 animate-pulse skeleton-shimmer"></div>
        </div>

        {/* Product Details - mobile optimized spacing */}
        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-pulse skeleton-shimmer flex-shrink-0"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-20 sm:w-24 animate-pulse skeleton-shimmer"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-pulse skeleton-shimmer flex-shrink-0"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-16 sm:w-20 animate-pulse skeleton-shimmer"></div>
          </div>
        </div>
        
        {/* Description - fewer lines on mobile */}
        <div className="space-y-2 mb-3 sm:mb-4">
          <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-full animate-pulse skeleton-shimmer"></div>
          <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-4/5 animate-pulse skeleton-shimmer"></div>
          <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-3/5 animate-pulse skeleton-shimmer hidden sm:block"></div>
        </div>
        
        {/* Price and Rating Row - responsive layout */}
        <div className="flex justify-between items-end">
          <div className="space-y-1 flex-1">
            <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-20 sm:w-24 animate-pulse skeleton-shimmer"></div>
            <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-16 sm:w-20 animate-pulse skeleton-shimmer"></div>
          </div>
          <div className="text-right space-y-1 hidden sm:block">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-3 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-pulse skeleton-shimmer"></div>
              ))}
            </div>
            <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-12 animate-pulse skeleton-shimmer ml-auto"></div>
          </div>
        </div>
      </div>
      
      {/* Button Skeleton - responsive padding and height */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm border-t border-gray-600/50">
        <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-lg sm:rounded-xl animate-pulse skeleton-shimmer"></div>
        <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded w-16 sm:w-20 mx-auto mt-2 animate-pulse skeleton-shimmer"></div>
      </div>

      {/* Animated Dots Indicator - hidden on mobile for performance */}
      <div className="absolute top-2 left-2 hidden sm:block">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse skeleton-pulse-delayed-0"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse skeleton-pulse-delayed-1"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse skeleton-pulse-delayed-2"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;