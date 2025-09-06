import { useState, useCallback, memo, useRef, useEffect } from 'react'
import { createImageObserver } from '../utils/performance'

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = '🖼️',
  loading = 'lazy',
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  // Intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      observerRef.current = createImageObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (observerRef.current) {
              observerRef.current.unobserve(entry.target)
            }
          }
        })
      })

      if (observerRef.current) {
        observerRef.current.observe(imgRef.current)
      }
    } else {
      setIsInView(true)
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current)
      }
    }
  }, [loading])

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Loading state */}
      {!imageLoaded && !imageError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onam-green"></div>
        </div>
      )}

      {/* Actual image */}
      {isInView && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
        />
      )}

      {/* Fallback content */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-4xl text-gray-400">{fallbackIcon}</div>
        </div>
      )}

      {/* Placeholder for lazy loading */}
      {!isInView && loading === 'lazy' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-2xl text-gray-300">{fallbackIcon}</div>
        </div>
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
