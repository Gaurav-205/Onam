import { useState, useCallback, memo } from 'react'

/**
 * OptimizedImage Component
 * Provides responsive images with WebP support and proper sizing
 * 
 * @param {string} src - Image source path (without extension)
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} loading - Loading strategy ('lazy' or 'eager')
 * @param {number} width - Image width for srcset
 * @param {number} height - Image height for srcset
 * @param {string} sizes - Responsive sizes attribute
 * @param {function} onError - Error handler callback
 * @param {function} onLoad - Load handler callback
 */
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  width,
  height,
  sizes,
  onError,
  onLoad,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fallbackError, setFallbackError] = useState(false)

  // Validate src
  if (!src || typeof src !== 'string') {
    return null
  }

  // Remove extension from src if present
  const baseSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '')
  
  // Generate image paths
  const webpSrc = `${baseSrc}.webp`
  const fallbackSrc = src.includes('.') ? src : `${baseSrc}.jpeg`
  
  const handleError = useCallback((e) => {
    // Only set error state if WebP fails and we haven't already tried fallback
    if (!imageError) {
      setImageError(true)
    }
    if (onError) {
      onError(e)
    }
  }, [onError, imageError])
  
  const handleFallbackError = useCallback((e) => {
    // Prevent infinite loop - if fallback also fails, hide the image
    setFallbackError(true)
    if (e?.target) {
      e.target.style.display = 'none'
    }
  }, [])

  const handleLoad = useCallback((e) => {
    setImageLoaded(true)
    if (onLoad) {
      onLoad(e)
    }
  }, [onLoad])

  // If WebP failed, fallback to original (prevent infinite error loop)
  if (imageError && !fallbackError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt || ''}
        className={className}
        loading={loading}
        onError={handleFallbackError}
        onLoad={handleLoad}
        width={width}
        height={height}
        {...props}
      />
    )
  }
  
  // If both WebP and fallback failed, return null
  if (fallbackError) {
    return null
  }

  return (
    <picture>
      {/* WebP source for modern browsers */}
      <source
        srcSet={webpSrc}
        type="image/webp"
        sizes={sizes}
      />
      {/* Fallback for older browsers */}
      <img
        src={fallbackSrc}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        width={width}
        height={height}
        sizes={sizes}
        {...props}
      />
    </picture>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage

