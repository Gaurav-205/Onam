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

  // Handle image path - keep original path if it exists, otherwise try to generate
  // Remove extension from src if present for WebP generation
  const baseSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '')
  
  // Generate image paths - WebP version and fallback
  const webpSrc = `${baseSrc}.webp`
  // Use original src as fallback (it should work if file exists)
  const fallbackSrc = src
  
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

  // For now, use direct img tag to ensure images load
  // WebP optimization can be added later when WebP files are generated
  // The picture element can cause issues if WebP files don't exist
  return (
    <img
      src={fallbackSrc}
      alt={alt || ''}
      className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      loading={loading}
      onError={(e) => {
        handleError(e)
      }}
      onLoad={handleLoad}
      width={width}
      height={height}
      sizes={sizes}
      {...props}
    />
  )
})

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage

