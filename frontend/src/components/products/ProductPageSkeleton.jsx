// src/components/product/ProductPageSkeleton.jsx
import React from 'react';

const SkeletonBox = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ProductPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SkeletonBox className="h-6 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <SkeletonBox className="w-full aspect-square rounded-lg border border-gray-200" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <SkeletonBox key={i} className="h-16 w-16 rounded border border-gray-200" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="lg:col-span-4 space-y-4">
            <SkeletonBox className="h-6 w-24" />
            <SkeletonBox className="h-8 w-3/4" />
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-4 w-24" />
            <div className="py-4 border-y border-gray-200 space-y-2">
              <SkeletonBox className="h-8 w-40" />
              <SkeletonBox className="h-4 w-20" />
            </div>
            <SkeletonBox className="h-10 w-full" />
            <SkeletonBox className="h-10 w-full" />
            <SkeletonBox className="h-20 w-full rounded-lg border border-gray-200" />
          </div>

          {/* Buy Box Skeleton */}
          <div className="lg:col-span-3">
            <SkeletonBox className="h-80 w-full rounded-lg border border-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;