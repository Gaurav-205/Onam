import { useState, useEffect, useCallback, useMemo, memo } from 'react'

// Constants moved outside component to prevent recreation
const HEADINGS = [
  { text: "Onam", lang: "en" },
  { text: "ഓണം", lang: "ml" }
]

const ONAM_DATE = new Date('2025-09-12T00:00:00').getTime()
const HEADING_INTERVAL = 3000
const FADE_DURATION = 300
const SCROLL_THRESHOLD = 50

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
  } catch (error) {
    console.warn('Some fonts failed to load:', error)
    return false
  }
}

// Memoized CountdownCard component with performance optimizations
const CountdownCard = memo(({ value, label, maxValue }) => {
  const { strokeDasharray, strokeDashoffset } = useMemo(() => {
    const percentage = (value / maxValue) * 100
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    return { strokeDasharray, strokeDashoffset }
  }, [value, maxValue])

  return (
    <div className="text-center">
      {/* Circular Progress Arc */}
      <div className="relative flex items-center justify-center mb-3">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
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
          <div className="text-2xl md:text-3xl font-bold text-white font-heading">
            {value.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-xs md:text-sm text-white/90 font-sans uppercase tracking-wider font-medium text-center">
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

// Memoized EventBadge component
const EventBadge = memo(({ children, className = "" }) => (
  <div className={`bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 ${className}`}>
    <p className="text-white font-semibold text-sm md:text-base drop-shadow-md tracking-wide">
      {children}
    </p>
  </div>
))

EventBadge.displayName = 'EventBadge'

const Hero = () => {
  const [videoError, setVideoError] = useState(false)
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

  // Optimized video error handling
  const handleVideoError = useCallback(() => setVideoError(true), [])

  // Optimized scroll handlers with useCallback
  const handleVideoScroll = useCallback(() => {
    const heroSection = document.getElementById('home')
    if (!heroSection) return

    const rect = heroSection.getBoundingClientRect()
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0
    
    const backgroundVideo = document.querySelector('#home video')
    if (backgroundVideo) {
      if (isVisible) {
        backgroundVideo.play().catch(() => {}) // Silent error handling
      } else {
        backgroundVideo.pause()
      }
    }
  }, [])

  const handleScrollState = useCallback(() => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD
    setIsScrolled(scrolled)
  }, [])

  // Throttled scroll handler with useCallback
  const throttledScroll = useCallback(() => {
    let ticking = false
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleVideoScroll()
          handleScrollState()
          ticking = false
        })
        ticking = true
      }
    }
  }, [handleVideoScroll, handleScrollState])

  // Consolidated useEffect for scroll handling
  useEffect(() => {
    const scrollHandler = throttledScroll()
    window.addEventListener('scroll', scrollHandler, { passive: true })
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [throttledScroll])

  // Video file check with error handling
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/onam-background.mp4'
    video.onerror = handleVideoError
    
    return () => {
      video.onerror = null
    }
  }, [handleVideoError])

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

  // Optimized countdown timer with useCallback
  const updateCountdown = useCallback(() => {
    const now = new Date().getTime()
    const distance = ONAM_DATE - now
    
    if (distance > 0) {
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    }
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [updateCountdown])

  // Font loading effect with error handling
  useEffect(() => {
    loadFonts().then((success) => {
      setFontsLoaded(true)
    }).catch(() => {
      // Fallback: show content even if fonts fail to load
      setFontsLoaded(true)
    })
  }, [])

  return (
    <>
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Video Background - Primary */}
        <div className="absolute inset-0 w-full h-full">
          {!videoError && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
              onError={handleVideoError}
              aria-hidden="true"
            >
              <source src="/onam-background.mp4" type="video/mp4" />
            </video>
          )}
          
          {/* Fallback Background - Clean gradient if no video */}
          {videoError && (
            <div className="w-full h-full bg-gradient-to-br from-onam-green via-onam-gold to-onam-red"></div>
          )}
          
          {/* Minimal overlay for text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Main Content - Clean and minimal like Kerala website */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 mt-20 md:mt-32">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 text-white drop-shadow-2xl leading-tight">
            <span className={headingClasses}>
              {currentHeadingData.text}
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-12 font-normal drop-shadow-lg font-sans max-w-3xl mx-auto">
            Celebration of Kerala's Tradition & Culture
          </p>
          
          {/* Clean Countdown Timer with Circular Progress */}
          <div className="flex justify-center items-center space-x-3 md:space-x-6 mb-12">
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
          <div className="text-center mb-20">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <EventBadge>
                🎉 Open for All - Everyone Welcome! 🎉
              </EventBadge>
              
              <EventBadge>
                📍 MIT ADT University
              </EventBadge>
            </div>
            
            {/* Description */}
            <div className="mt-8">
              <p className="text-white/90 font-medium text-sm md:text-base drop-shadow-sm">
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
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-heading">
            The National Festival of Kerala
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-sans">
            Onam is a nostalgia that brings back memories from childhood and the simple ways of life that prevailed in the villages back in the day. It is the celebration of the myth of Mahabali – the demon king who once ruled the land and is believed to visit his old subjects every year around this time. Onam is also an agricultural festival that celebrates the rich harvest of the land, thus symbolising joy and prosperity.
          </p>
        </div>
      </section>
    </>
  )
}

export default Hero
