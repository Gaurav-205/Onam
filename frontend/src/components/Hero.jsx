import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import { HEADINGS } from '../constants/headings'
import { APP_CONFIG } from '../config/app'

const ONAM_DATE = new Date(APP_CONFIG.DATES.ONAM_DATE).getTime()
const HEADING_INTERVAL = APP_CONFIG.UI.HEADING_INTERVAL
const FADE_DURATION = APP_CONFIG.UI.FADE_DURATION
const SCROLL_THRESHOLD = APP_CONFIG.UI.SCROLL_THRESHOLD

// Font loading utility with error handling
const loadFonts = async () => {
  try {
    await Promise.all([
      document.fonts.load('1em Great Vibes'),
      document.fonts.load('1em Noto Serif Malayalam'),
      document.fonts.load('1em Prata'),
      document.fonts.load('1em Montserrat')
    ])
    return true
  } catch {
    return false
  }
}

// Memoized CountdownCard component with performance optimizations
const CountdownCard = memo(({ value, label, maxValue }) => {
  const { strokeDasharray, strokeDashoffset } = useMemo(() => {
    // Prevent division by zero
    const safeMaxValue = maxValue || 1
    const percentage = (value / safeMaxValue) * 100
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    return { strokeDasharray, strokeDashoffset }
  }, [value, maxValue])

  return (
    <div className="text-center">
      {/* Circular Progress Arc */}
      <div className="relative flex items-center justify-center mb-2 sm:mb-3">
        <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="30"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
            fill="transparent"
          />
          {/* Progress arc */}
          <circle
            cx="40"
            cy="40"
            r="30"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Number overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-heading">
            {value.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-xs sm:text-sm text-white/90 font-sans uppercase tracking-wider font-medium text-center">
        {label}
      </div>
    </div>
  )
})

CountdownCard.displayName = 'CountdownCard'

// Memoized ScrollIndicator component
const ScrollIndicator = memo(({ showScrollIndicator, isScrolled }) => (
  <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-in-out ${
    showScrollIndicator && !isScrolled 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-4 pointer-events-none'
  }`}>
    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
      <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
    </div>
  </div>
))

ScrollIndicator.displayName = 'ScrollIndicator'

const Hero = () => {
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoCanPlay, setVideoCanPlay] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentHeading, setCurrentHeading] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  // Memoized heading text and classes
  const currentHeadingData = useMemo(() => HEADINGS[currentHeading], [currentHeading])
  const headingClasses = useMemo(() => {
    if (!fontsLoaded) {
      return 'opacity-0' // Hide until fonts are loaded
    }
    
    const baseClasses = 'transition-all duration-600 ease-in-out transform'
    const fadeClasses = isFading 
      ? 'opacity-0 scale-95 translate-y-2' 
      : 'opacity-100 scale-100 translate-y-0'
    const fontClasses = currentHeadingData.lang === 'en' 
      ? 'font-ornate text-yellow-400' 
      : 'font-malayalam text-yellow-400'
    
    return `${baseClasses} ${fadeClasses} ${fontClasses}`
  }, [currentHeadingData.lang, isFading, fontsLoaded])

  // Memoized countdown data
  const countdownData = useMemo(() => [
    { value: timeLeft.days, label: "Days", maxValue: 365 },
    { value: timeLeft.hours, label: "Hours", maxValue: 24 },
    { value: timeLeft.minutes, label: "Minutes", maxValue: 60 },
    { value: timeLeft.seconds, label: "Seconds", maxValue: 60 }
  ], [timeLeft])

  // Optimized video error handling - only set error if video truly fails
  const handleVideoError = useCallback((e) => {
    // Only set error if video element itself has an error
    const video = e?.target
    if (video) {
      // Check if there's a real error (network, codec, etc.)
      if (video.error) {
        const errorCode = video.error.code
        // MEDIA_ERR_ABORTED (1) - user aborted, don't treat as error
        // MEDIA_ERR_NETWORK (2) - network error, might recover - don't show error immediately
        // MEDIA_ERR_DECODE (3) - decode error, real problem
        // MEDIA_ERR_SRC_NOT_SUPPORTED (4) - format not supported
        if (errorCode === 3 || errorCode === 4) {
          if (import.meta.env.MODE === 'development') {
            console.warn('Video failed to load:', video.error)
          }
          setVideoError(true)
          setVideoLoaded(false)
          setVideoCanPlay(false)
        } else if (errorCode === 2) {
          // Network error - might recover, give it time before showing error
          // Don't set error immediately - wait and retry
          setTimeout(() => {
            if (video && video.error && video.error.code === 2) {
              video.load() // Retry loading
            }
          }, 3000)
        }
        // For error code 1 (aborted), don't set error - might be intentional
      }
    }
  }, [])
  
  // Handle video loaded metadata
  const handleVideoLoadedMetadata = useCallback(() => {
    setVideoLoaded(true)
    setVideoError(false)
  }, [])
  
  // Handle video can play (ready to play)
  const handleVideoCanPlay = useCallback(() => {
    setVideoCanPlay(true)
    setVideoError(false)
    setVideoLoaded(true)
  }, [])
  
  // Handle video loaded data
  const handleVideoLoadedData = useCallback(() => {
    setVideoLoaded(true)
    setVideoError(false)
  }, [])
  
  useEffect(() => {
    if (videoCanPlay && !videoError) {
      const video = videoRef.current
      if (video) {
        // Try to play the video
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video is playing successfully
              setVideoError(false)
              setVideoLoaded(true)
            })
            .catch(() => {
              setVideoError(false)
              setVideoLoaded(true) // Mark as loaded so it shows
            })
        }
      }
    }
  }, [videoCanPlay, videoError])
  
  // Also try to show video when metadata is loaded (for mobile where autoplay might fail)
  useEffect(() => {
    if (videoLoaded && !videoCanPlay && !videoError) {
      // Video metadata is loaded but canPlay hasn't fired yet
      // Show the video anyway - it might just be slow to decode
      const video = document.querySelector('#hero-background-video')
      if (video) {
        // Try to seek to first frame to make it visible
        video.currentTime = 0.1
      }
    }
  }, [videoLoaded, videoCanPlay, videoError])
  
  // Video loading timeout handled by browser - no need for manual timeout

  // Optimized scroll handlers with useCallback
  const handleVideoScroll = useCallback(() => {
    const heroSection = document.querySelector('#home')
    if (!heroSection) return

    const rect = heroSection.getBoundingClientRect()
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0
    
    const backgroundVideo = document.querySelector('#hero-background-video')
    if (backgroundVideo && (videoCanPlay || videoLoaded) && !videoError) {
      if (isVisible) {
        backgroundVideo.play().catch(() => {
          // Autoplay prevented - normal on mobile, don't treat as error
        })
      } else {
        backgroundVideo.pause()
      }
    }
  }, [videoCanPlay, videoLoaded, videoError])

  const handleScrollState = useCallback(() => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD
    setIsScrolled(scrolled)
  }, [])

  // Throttled scroll handler with useCallback
  const throttledScroll = useCallback(() => {
    let ticking = false
    return () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          handleVideoScroll()
          handleScrollState()
          ticking = false
        })
      }
    }
  }, [handleVideoScroll, handleScrollState])

  // Consolidated useEffect for scroll handling
  useEffect(() => {
    const scrollHandler = throttledScroll()
    window.addEventListener('scroll', scrollHandler, { passive: true })
    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [throttledScroll])

  // Scroll indicator timer
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollIndicator(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Heading rotation with fade transition
  useEffect(() => {
    const headingTimer = setInterval(() => {
      setIsFading(true)
      
      setTimeout(() => {
        setCurrentHeading(prev => (prev + 1) % HEADINGS.length)
        setIsFading(false)
      }, FADE_DURATION)
    }, HEADING_INTERVAL)

    return () => clearInterval(headingTimer)
  }, [])

  // Optimized countdown timer with useCallback and reduced updates
  const updateCountdown = useCallback(() => {
    const now = new Date().getTime()
    const distance = ONAM_DATE - now
    
    if (distance > 0) {
      setTimeLeft(prevTime => {
        const newTime = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        }
        
        // Only update if values actually changed
        if (JSON.stringify(prevTime) === JSON.stringify(newTime)) {
          return prevTime
        }
        
        return newTime
      })
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    }
  }, [])

  // Countdown timer effect with cleanup
  useEffect(() => {
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [updateCountdown])

  // Font loading effect with error handling
  useEffect(() => {
    loadFonts().then(() => {
      setFontsLoaded(true)
    }).catch(() => {
      // Fallback: show content even if fonts fail to load
      setFontsLoaded(true)
    })
  }, [])

  return (
    <>
      <section id="home" className="min-h-screen h-screen flex items-center justify-center relative overflow-hidden">
        {/* Video Background - Primary */}
        <div className="absolute inset-0 w-full h-full">
          {/* Always show video element - let browser handle loading */}
          {/* Video should always be in DOM, just control visibility */}
          <video
            ref={videoRef}
            id="hero-background-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`w-full h-full object-cover transition-opacity duration-700 absolute inset-0 ${
              videoCanPlay || videoLoaded ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
            style={{ objectPosition: 'center center' }}
            onError={handleVideoError}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onLoadedData={handleVideoLoadedData}
            onCanPlay={handleVideoCanPlay}
            onCanPlayThrough={handleVideoCanPlay}
            aria-hidden="true"
          >
            <source src="/onam-background.mp4" type="video/mp4" />
            {/* Fallback message for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
          
          {/* Fallback Background - Show behind video, only fully visible if video fails */}
          <div 
            className={`w-full h-full bg-gradient-to-br from-onam-green via-onam-gold to-onam-red absolute inset-0 transition-opacity duration-700 ${
              videoError 
                ? 'opacity-100 z-20' 
                : videoLoaded || videoCanPlay 
                  ? 'opacity-0 z-0' 
                  : 'opacity-50 z-0'
            }`}
          ></div>
          
          {/* Minimal overlay for text readability */}
          <div className="absolute inset-0 bg-black/30 z-30 pointer-events-none"></div>
        </div>
        
        {/* Main Content - Centered in full viewport */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 md:mt-24 lg:mt-32">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 text-white drop-shadow-2xl leading-tight">
            <span className={headingClasses} aria-label={`Onam heading in ${currentHeadingData.lang === 'en' ? 'English' : 'Malayalam'}`}>
              {currentHeadingData.text}
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 font-normal drop-shadow-lg font-sans max-w-2xl mx-auto px-2">
            Celebration of Kerala's Tradition & Culture
          </p>
          
          {/* Clean Countdown Timer with Circular Progress */}
          <div className="flex justify-center items-center space-x-2 sm:space-x-3 md:space-x-4 mb-6 sm:mb-8 flex-wrap gap-y-3">
            {countdownData.map((item) => (
              <CountdownCard 
                key={item.label}
                value={item.value} 
                label={item.label} 
                maxValue={item.maxValue}
              />
            ))}
          </div>

          {/* Event Details */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 px-4">
              <div className="w-full sm:w-auto">
                <p className="text-white font-semibold text-xs sm:text-sm md:text-base drop-shadow-lg">
                  Open for All - Everyone Welcome!
                </p>
              </div>
              
              {/* Visual Separator Wall */}
              <div className="hidden sm:block w-0.5 h-8 bg-white/70 mx-2"></div>
              
              <div className="w-full sm:w-auto">
                <p className="text-white font-semibold text-xs sm:text-sm md:text-base drop-shadow-lg">
                  MIT ADT University
                </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="mt-4 sm:mt-6 px-4">
              <p className="text-white/90 font-medium text-xs sm:text-sm drop-shadow-sm">
                Join us in celebrating Kerala's rich traditions and culture
              </p>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <ScrollIndicator 
          showScrollIndicator={showScrollIndicator} 
          isScrolled={isScrolled} 
        />
      </section>
      
      {/* About Onam Section */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 font-heading">
            The National Festival of Kerala
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-sans px-2">
            Onam is a nostalgia that brings back memories from childhood and the simple ways of life that prevailed in the villages back in the day. It is the celebration of the myth of Mahabali – the demon king who once ruled the land and is believed to visit his old subjects every year around this time. Onam is also an agricultural festival that celebrates the rich harvest of the land, thus symbolising joy and prosperity.
          </p>
        </div>
      </section>
    </>
  )
}

export default Hero
