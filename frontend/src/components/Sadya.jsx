import { useCallback, useMemo, memo, useState, useEffect } from 'react'

// Memoized sadya dishes data
const sadyaDishes = [
  { name: "Rice", icon: "🍚", color: "from-amber-400 to-amber-500", image: "/rice-image.jpeg" },
  { name: "Sambar", icon: "🥘", color: "from-orange-400 to-orange-500", image: "/sambar-image.jpeg" },
  { name: "Rasam", icon: "🍲", color: "from-red-400 to-red-500", image: "/rasam-image.jpeg" },
  { name: "Avial", icon: "🥬", color: "from-green-400 to-green-500", image: "/avial-image.jpeg" },
  { name: "Thorans", icon: "🥗", color: "from-emerald-400 to-emerald-500", image: "/thorans-image.jpeg" },
  { name: "Pachadi", icon: "🥒", color: "from-teal-400 to-teal-500", image: "/pachadi-image.jpeg" },
  { name: "Pickles", icon: "🥭", color: "from-yellow-400 to-yellow-500", image: "/pickles-image.jpeg" },
  { name: "Papadam", icon: "🫓", color: "from-amber-400 to-amber-600", image: "/papadam-image.jpeg" },
  { name: "Banana", icon: "🍌", color: "from-yellow-400 to-yellow-500", image: "/banana-image.jpeg" },
  { name: "Payasam", icon: "🍮", color: "from-pink-400 to-pink-500", image: "/payasam-image.jpeg" },
  { name: "Jaggery", icon: "🍯", color: "from-amber-500 to-amber-600", image: "/jaggery-image.jpeg" },
  { name: "Coconut", icon: "🥥", color: "from-gray-400 to-gray-500", image: "/coconut-image.jpeg" }
]

// Memoized DishItem component
const DishItem = memo(({ item }) => {
  const handleImageError = useCallback((e) => {
    // Fallback to icon if image fails to load
    e.target.style.display = 'none'
    const fallbackIcon = e.target.nextSibling
    if (fallbackIcon) {
      fallbackIcon.style.display = 'flex'
    }
  }, [])

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        {/* Ingredient Image on the left */}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 shadow-sm">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          {/* Fallback Icon */}
          <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-md`} style={{display: 'none'}}>
            {item.icon}
          </div>
        </div>
        
        {/* Ingredient Name - No underline */}
        <div className="flex-1">
          <h3 className="text-gray-800 font-medium text-sm">{item.name}</h3>
        </div>
      </div>
    </div>
  )
})

DishItem.displayName = 'DishItem'

// Memoized VideoPlayer component
const VideoPlayer = memo(({ onVideoError }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true)
  }, [])

  const handleVideoError = useCallback(() => {
    onVideoError()
  }, [onVideoError])

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  return (
    <div className="w-full h-[320px] md:h-[455px] bg-black rounded-2xl overflow-hidden shadow-xl relative">
      {/* Video Player with Zoomed Poster */}
      <video
        className="w-full h-full object-cover transition-all duration-300"
        controls
        muted
        loop
        preload="metadata"
        poster="/sadya-image.jpeg"
        playsInline
        controlsList="nodownload"
        onLoadStart={() => setIsVideoLoaded(false)}
        onLoadedData={handleVideoLoad}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        aria-label="Traditional Onam feast video showing 26-course meal preparation and serving"
        title="Traditional Onam Feast Video"
      >
        <source src="/sadya-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video Overlay with Title - Lower z-index to not interfere with controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10 pointer-events-none">
        <h3 className="text-xl font-bold text-white mb-1 font-heading text-left ml-4">Traditional Onam Feast</h3>
        <p className="text-sm text-white/90 text-left ml-4">Served on Banana Leaf</p>
        {isPlaying && (
          <div className="flex items-center mt-2 space-x-2 ml-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Playing</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onam-green mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

const Sadya = () => {
  const [videoError, setVideoError] = useState(false)

  // Test video file accessibility
  useEffect(() => {
    const testVideoAccess = async () => {
      try {
        const response = await fetch('/sadya-video.mp4', { method: 'HEAD' })
        if (response.ok) {
          console.log('Sadya video file is accessible, status:', response.status)
        } else {
          console.error('Sadya video file not accessible, status:', response.status)
        }
      } catch (error) {
        console.error('Sadya video file access error:', error)
      }
    }
    
    testVideoAccess()
  }, [])

  // Memoized dishes data to prevent unnecessary re-renders
  const memoizedSadyaDishes = useMemo(() => sadyaDishes, [])

  const handleVideoError = useCallback(() => {
    setVideoError(true)
  }, [])

  return (
    <section id="sadya" className="section-padding bg-gradient-to-br from-orange-50 to-yellow-50 relative overflow-hidden" aria-label="Traditional Onam Feast">
      {/* Food Pattern Background */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-32 bg-gradient-to-b from-orange-100/30 to-transparent" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-full h-16 sm:h-32 bg-gradient-to-t from-yellow-100/30 to-transparent" aria-hidden="true"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 font-heading">Sadya</h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto px-4">
            There is no way that a Malayali will like to miss an 'Onasadya' (Onam feast).
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
              {memoizedSadyaDishes.map((item, index) => (
                <DishItem key={`${item.name}-${index}`} item={item} />
              ))}
            </div>
          </div>
          
          <div className="order-1 md:order-2 text-center">
            {!videoError ? (
              <VideoPlayer onVideoError={handleVideoError} />
            ) : (
              // Fallback Content - Shown when video fails to load
              <div className="w-full h-64 sm:h-80 md:h-[320px] lg:h-[455px] bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-200 flex items-center justify-center relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/4 w-16 sm:w-24 h-16 sm:h-24 bg-green-300 rounded-full blur-sm"></div>
                  <div className="absolute top-1/3 right-1/4 w-12 sm:w-20 h-12 sm:h-20 bg-green-400 rounded-full blur-sm"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-10 sm:w-16 h-10 sm:h-16 bg-green-300 rounded-full blur-sm"></div>
                </div>
                
                {/* Fallback Content */}
                <div className="text-center relative z-10 px-4">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 drop-shadow-lg">🍽️</div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 font-heading">Traditional Onam Feast</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3">Served on Banana Leaf</p>
                  
                  {/* Additional Info */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 max-w-xs mx-auto">
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      Experience the authentic taste of Kerala with our traditional 26-course feast
                    </p>
                  </div>
                  
                  {/* Retry Button */}
                  <button 
                    onClick={() => setVideoError(false)}
                    className="mt-3 sm:mt-4 bg-onam-green text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-onam-green/80 transition-colors duration-200 font-medium text-sm sm:text-base"
                  >
                    Retry Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Sadya
