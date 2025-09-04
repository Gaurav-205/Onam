import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load heavy components for better performance
const VideoSection = lazy(() => import('./components/VideoSection'))
const Shopping = lazy(() => import('./components/Shopping'))
const Sadya = lazy(() => import('./components/Sadya'))
const Events = lazy(() => import('./components/Events'))
const UnderDevelopment = lazy(() => import('./components/UnderDevelopment'))
const Footer = lazy(() => import('./components/Footer'))

function App() {
  const [currentSection, setCurrentSection] = useState('home')

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

  // Throttled scroll handler for better performance
  const throttledScroll = useCallback(() => {
    let ticking = false
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
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

  // Memoized main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <>
      <Hero />
      <Suspense fallback={<LoadingSpinner message="Loading Onam Experience..." />}>
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
    </div>
  )
}

export default App
