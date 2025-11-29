import { useEffect, useRef, useState, useCallback } from 'react'

const VideoSection = () => {
  const videoRef = useRef(null)
  const sectionRef = useRef(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)



  // Optimized intersection observer callback
  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      const isVisible = entry.isIntersecting
      setIsIntersecting(isVisible)
      
      if (isVisible && videoRef.current && !videoError && isVideoLoaded) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
          if (videoRef.current && isVisible && isVideoLoaded) {
            videoRef.current.play().catch(() => {
              // Autoplay prevented - silent fail (browser policy)
            })
            setIsVideoPlaying(true)
          }
        }, 300)
      } else if (videoRef.current) {
        videoRef.current.pause()
        setIsVideoPlaying(false)
      }
    })
  }, [videoError, isVideoLoaded])

  // Video event handlers
  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true)
    setVideoError(false)
  }, [])

  const handleVideoError = useCallback(() => {
    setVideoError(true)
    setIsVideoLoaded(false)
  }, [])

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true)
  }, [])

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false)
  }, [])

  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false)
    // Auto-restart video if still in view
    if (isIntersecting && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [isIntersecting])

  // Intersection observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    })

    const currentSection = sectionRef.current
    if (currentSection) {
      observer.observe(currentSection)
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection)
      }
      observer.disconnect()
      // Ensure video is paused when component unmounts
      const video = videoRef.current
      if (video) {
        video.pause()
        setIsVideoPlaying(false)
      }
    }
  }, [handleIntersection])

  return (
    <section 
      ref={sectionRef} 
      className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      aria-label="Onam Celebration Video"
    >
      <div className="max-w-7xl mx-auto">
        {/* Video Container */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Video Background/Thumbnail */}
          <div className="relative w-full h-64 sm:h-80 md:h-[500px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
            
            {/* Video Player */}
            <div className="w-full h-full">
              {!videoError ? (
                <video
                  ref={videoRef}
                  className="w-full h-full rounded-xl sm:rounded-2xl object-cover transition-opacity duration-300"
                  style={{ opacity: isVideoLoaded ? 1 : 0 }}
                  controls
                  preload="auto"
                  muted
                  playsInline
                  loop
                  onLoadStart={() => {
                    setIsVideoLoaded(false)
                  }}
                  onLoadedData={() => {
                    handleVideoLoad()
                  }}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                  onError={() => {
                    handleVideoError()
                  }}
                  aria-label="Onam celebration video showing traditional Kerala festival activities"
                  title="Onam Celebration Video"
                >
                  <source src="/onam-celebration-video.mp4" type="video/mp4" />
                  <p className="text-white bg-black/50 p-4 rounded">
                    Your browser does not support the video tag. 
                    <a 
                      href="/onam-celebration-video.mp4" 
                      className="text-blue-400 underline ml-2"
                      download
                    >
                      Download video
                    </a>
                  </p>
                </video>
              ) : (
                // Fallback content when video fails
                <div className="w-full h-full bg-gradient-to-br from-onam-green/20 via-onam-gold/20 to-onam-red/20 flex items-center justify-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-16 sm:w-24 h-16 sm:h-24 bg-onam-green/30 rounded-full blur-sm"></div>
                    <div className="absolute top-1/3 right-1/4 w-12 sm:w-20 h-12 sm:h-20 bg-onam-gold/30 rounded-full blur-sm"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-10 sm:w-16 h-10 sm:h-16 bg-onam-red/30 rounded-full blur-sm"></div>
                  </div>
                  
                  {/* Fallback Content */}
                  <div className="text-center relative z-10 px-4">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 drop-shadow-lg">🎥</div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 font-heading">Onam Celebration Video</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3">Experience the joy of Onam</p>
                    
                    {/* Retry Button */}
                    <button 
                      onClick={() => {
                        setVideoError(false)
                        setIsVideoLoaded(false)
                        if (videoRef.current) {
                          videoRef.current.load()
                        }
                      }}
                      className="bg-onam-green text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-onam-green/80 transition-colors duration-200 font-medium text-sm sm:text-base"
                    >
                      Retry Video
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {!isVideoLoaded && !videoError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl sm:rounded-2xl">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-12 w-12 bg-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-300 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Overlay Heading on Video - Bottom Position */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 sm:p-6 text-white z-10 pointer-events-none">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-heading drop-shadow-2xl text-left ml-3 sm:ml-6">
                Onam Celebration
              </h2>
              {/* Video Status Indicator */}
              {isVideoPlaying && (
                <div className="flex items-center space-x-2 mt-1 sm:mt-2 ml-3 sm:ml-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-green-400 font-medium">Playing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoSection
