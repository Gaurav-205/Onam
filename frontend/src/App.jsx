import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import LoadingSpinner from './components/LoadingSpinner'
import PerformanceMonitor from './components/PerformanceMonitor'

// Lazy load heavy components for better performance with error boundaries
const VideoSection = lazy(() => import('./components/VideoSection').catch(() => ({ default: () => <div className="section-padding bg-white text-center"><p>Video section temporarily unavailable</p></div> })))
const Shopping = lazy(() => import('./components/Shopping').catch(() => ({ default: () => <div className="section-padding bg-white text-center"><p>Shopping section temporarily unavailable</p></div> })))
const Sadya = lazy(() => import('./components/Sadya').catch(() => ({ default: () => <div className="section-padding bg-white text-center"><p>Sadya section temporarily unavailable</p></div> })))
const Events = lazy(() => import('./components/Events').catch(() => ({ default: () => <div className="section-padding bg-white text-center"><p>Events section temporarily unavailable</p></div> })))
const UnderDevelopment = lazy(() => import('./components/UnderDevelopment').catch(() => ({ default: () => <div className="section-padding bg-white text-center"><p>Coming soon section temporarily unavailable</p></div> })))
const Footer = lazy(() => import('./components/Footer').catch(() => ({ default: () => <div className="bg-gray-900 text-white py-8 text-center"><p>Footer temporarily unavailable</p></div> })))

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false)

  // Memoized sections array to prevent recreation
  const sections = useMemo(() => ['home', 'shopping', 'sadya', 'events', 'under-development'], [])

  // Optimized scroll to section function
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setCurrentSection(sectionId)
    }
  }, [])

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 100

    // Find the current section based on scroll position
    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i])
      if (element && element.offsetTop <= scrollPosition) {
        setCurrentSection(sections[i])
        break
      }
    }
  }, [sections])

  // Better throttled scroll handler for performance
  const throttledScroll = useCallback(() => {
    let ticking = false
    let lastScrollPosition = 0
    let lastUpdateTime = 0
    
    return () => {
      const currentScrollPosition = window.scrollY
      const currentTime = Date.now()
      
      // Only update if scroll position changed significantly or enough time passed
      if (Math.abs(currentScrollPosition - lastScrollPosition) < 50 && (currentTime - lastUpdateTime) < 100) {
        return
      }
      
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          lastScrollPosition = currentScrollPosition
          lastUpdateTime = currentTime
          ticking = false
        })
        ticking = true
      }
    }
  }, [handleScroll])

  // Scroll event listener with passive option
  useEffect(() => {
    const scrollHandler = throttledScroll()
    window.addEventListener('scroll', scrollHandler, { passive: true })
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [throttledScroll])

  // Performance monitor toggle (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowPerformanceMonitor(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Memoized main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <>
      <Hero />
      <Suspense fallback={
        <div className="section-padding bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-onam-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Onam Experience...</p>
          </div>
        </div>
      }>
        <VideoSection />
        <Shopping />
        <Sadya />
        <Events />
        <UnderDevelopment />
      </Suspense>
    </>
  ), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#home" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-onam-green focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-onam-green focus:ring-offset-2"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      <Navbar currentSection={currentSection} scrollToSection={scrollToSection} />
      {mainContent}
      <Suspense fallback={
        <div className="bg-gray-800 text-white py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onam-green mx-auto mb-2"></div>
          <p>Loading Footer...</p>
        </div>
      }>
        <Footer scrollToSection={scrollToSection} />
      </Suspense>
      
      {/* Performance Monitor */}
      <PerformanceMonitor show={showPerformanceMonitor} />
    </div>
  )
}

export default App
