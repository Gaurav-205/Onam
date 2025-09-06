// Resource preloader for better performance

/**
 * Preload critical images
 */
export const preloadImages = () => {
  const criticalImages = [
    '/logo.png',
    '/onam-video-thumbnail.jpg',
    '/sadya-image.jpeg'
  ]
  
  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}

/**
 * Preload critical fonts
 */
export const preloadFonts = () => {
  const fonts = [
    'https://fonts.googleapis.com/css2?family=Prata:wght@400&display=swap',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap'
  ]
  
  fonts.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    document.head.appendChild(link)
  })
}

/**
 * Preload critical videos (metadata only)
 */
export const preloadVideos = () => {
  const videos = [
    '/onam-background.mp4',
    '/onam-celebration-video.mp4'
  ]
  
  videos.forEach(src => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = src
    video.style.display = 'none'
    document.body.appendChild(video)
    
    // Remove after metadata is loaded
    video.addEventListener('loadedmetadata', () => {
      document.body.removeChild(video)
    })
  })
}

/**
 * Initialize all preloading
 */
export const initializePreloading = () => {
  // Preload critical resources immediately
  preloadImages()
  preloadFonts()
  
  // Preload videos after a short delay
  setTimeout(preloadVideos, 500)
}

/**
 * Preload components based on user interaction
 */
export const preloadOnInteraction = () => {
  let hasInteracted = false
  
  const preloadComponents = () => {
    if (hasInteracted) return
    hasInteracted = true
    
    // Preload remaining components
    import('../components/Sadya')
    import('../components/Events')
    import('../components/UnderDevelopment')
    import('../components/Footer')
  }
  
  // Preload on first user interaction
  const events = ['mousedown', 'touchstart', 'keydown', 'scroll']
  events.forEach(event => {
    document.addEventListener(event, preloadComponents, { once: true, passive: true })
  })
  
  // Preload after 3 seconds regardless
  setTimeout(preloadComponents, 3000)
}
