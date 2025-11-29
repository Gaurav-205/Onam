import React from 'react'

// Base skeleton element with shimmer effect
const SkeletonElement = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'animate-pulse rounded relative overflow-hidden'
  const variantClasses = {
    default: 'bg-gray-200',
    light: 'bg-gray-100',
    dark: 'bg-gray-300'
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}

// Page Skeleton - Full page loading
export const PageSkeleton = ({ type = 'default' }) => {
  if (type === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
        <div className="h-screen">
          <SkeletonElement className="w-full h-full" />
        </div>
        <div className="bg-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <SkeletonElement className="h-64 sm:h-80 md:h-[500px] lg:h-[600px] w-full mb-8 rounded-xl" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <SkeletonElement className="h-64 md:h-[320px] lg:h-[455px] w-full mb-8 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'shopping') {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonElement className="h-10 w-64 mx-auto mb-4" />
          <SkeletonElement className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <SkeletonElement className="h-64 w-full" />
                <div className="p-6 space-y-3">
                  <SkeletonElement className="h-6 w-3/4" />
                  <SkeletonElement className="h-4 w-full" />
                  <SkeletonElement className="h-4 w-5/6" />
                  <SkeletonElement className="h-8 w-24" />
                  <SkeletonElement className="h-12 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'cart') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SkeletonElement className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex gap-6">
                    <SkeletonElement className="w-32 h-32 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <SkeletonElement className="h-6 w-3/4" />
                      <SkeletonElement className="h-4 w-full" />
                      <SkeletonElement className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <SkeletonElement className="h-6 w-32 mb-4" />
                <div className="space-y-3 mb-6">
                  <SkeletonElement className="h-4 w-full" />
                  <SkeletonElement className="h-4 w-full" />
                  <SkeletonElement className="h-6 w-full" />
                </div>
                <SkeletonElement className="h-12 w-full rounded-full mb-4" />
                <SkeletonElement className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'checkout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SkeletonElement className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                {[...Array(8)].map((_, i) => (
                  <SkeletonElement key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <SkeletonElement className="h-6 w-40 mb-4" />
                <div className="space-y-3 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonElement key={i} className="h-4 w-full" />
                  ))}
                </div>
                <SkeletonElement className="h-12 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default page skeleton
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <SkeletonElement className="h-12 w-3/4 mx-auto" />
        <SkeletonElement className="h-6 w-full" />
        <SkeletonElement className="h-6 w-5/6" />
        <SkeletonElement className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

// Section Skeleton - For lazy-loaded sections
export const SectionSkeleton = ({ type = 'default' }) => {
  if (type === 'video') {
    return (
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonElement className="h-64 sm:h-80 md:h-[500px] lg:h-[600px] w-full rounded-xl sm:rounded-2xl" />
        </div>
      </section>
    )
  }

  if (type === 'sadya') {
    return (
      <section className="bg-gradient-to-br from-orange-50 to-yellow-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonElement className="h-8 w-32 mx-auto mb-4" />
          <SkeletonElement className="h-5 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="grid grid-cols-2 gap-3">
              {[...Array(8)].map((_, i) => (
                <SkeletonElement key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
            <SkeletonElement className="h-64 md:h-[320px] lg:h-[455px] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    )
  }

  if (type === 'events') {
    return (
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SkeletonElement className="h-10 w-48 mx-auto mb-4" />
          <SkeletonElement className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonElement key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default section skeleton
  return (
    <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SkeletonElement className="h-10 w-64 mx-auto mb-8" />
        <SkeletonElement className="h-64 w-full rounded-xl" />
      </div>
    </section>
  )
}

// Video Loading Skeleton
export const VideoSkeleton = () => {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden">
      <SkeletonElement className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <SkeletonElement className="h-12 w-12 rounded-full mx-auto mb-4" />
          <SkeletonElement className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}

// Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col h-full">
      <SkeletonElement className="h-64 w-full" />
      <div className="p-6 space-y-3">
        <SkeletonElement className="h-6 w-3/4" />
        <SkeletonElement className="h-4 w-full" />
        <SkeletonElement className="h-4 w-5/6" />
        <SkeletonElement className="h-8 w-24" />
        <SkeletonElement className="h-12 w-full rounded-full" />
      </div>
    </div>
  )
}

export default PageSkeleton

