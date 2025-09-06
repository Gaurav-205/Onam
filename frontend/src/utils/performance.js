// Performance optimization utilities

/**
 * Detect if the device is low-end based on various factors
 */
export const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const memory = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  
  return (
    // Slow network connection
    (connection && connection.effectiveType === 'slow-2g') ||
    // Low memory device
    (memory && memory <= 2) ||
    // Few CPU cores
    (cores && cores <= 2) ||
    // Mobile devices (generally lower performance)
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}

/**
 * Throttle function calls for better performance
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Debounce function calls for better performance
 */
export const debounce = (func, wait, immediate) => {
  let timeout
  return function() {
    const context = this
    const args = arguments
    const later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontPromises = [
    document.fonts.load('1em Great Vibes'),
    document.fonts.load('1em Noto Serif Malayalam'),
    document.fonts.load('1em Prata'),
    document.fonts.load('1em Montserrat')
  ]
  
  // Add timeout to prevent blocking
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Font loading timeout')), 3000)
  )
  
  return Promise.race([Promise.all(fontPromises), timeoutPromise])
    .then(() => true)
    .catch(() => {
      console.warn('Font loading failed or timed out')
      return false
    })
}

/**
 * Optimize images for lazy loading
 */
export const createImageObserver = (callback) => {
  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })
  }
  return null
}

/**
 * Check if video is supported and can autoplay
 */
export const canAutoplayVideo = () => {
  if (typeof document === 'undefined') return false
  
  const video = document.createElement('video')
  return !!(video.canPlayType && video.canPlayType('video/mp4').replace(/no/, ''))
}

/**
 * Get optimal video preload strategy based on device
 */
export const getVideoPreloadStrategy = () => {
  if (isLowEndDevice()) {
    return 'none'
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
    return 'none'
  }
  
  return 'metadata'
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  start: (name) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`)
    }
  },
  
  end: (name) => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  },
  
  getMetrics: () => {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType('measure')
    }
    return []
  }
}

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = () => {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
    }
  }
  return null
}

/**
 * Network information
 */
export const getNetworkInfo = () => {
  if (typeof navigator !== 'undefined' && navigator.connection) {
    const connection = navigator.connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}
