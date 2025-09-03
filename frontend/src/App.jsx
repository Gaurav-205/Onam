import { useState, useEffect, useCallback, useMemo } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import VideoSection from './components/VideoSection'
import Shopping from './components/Shopping'
import Sadya from './components/Sadya'
import Events from './components/Events'
// import Festivals from './components/Festivals'
// import Rituals from './components/Rituals'
// import Memories from './components/Memories'
import UnderDevelopment from './components/UnderDevelopment'
import Footer from './components/Footer'

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
      <VideoSection />
      <Shopping />
      <Sadya />
      <Events />
      {/* <Festivals />
      <Rituals />
      <Memories /> */}
      <UnderDevelopment />
    </>
  ), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Navbar currentSection={currentSection} scrollToSection={scrollToSection} />
      {mainContent}
      <Footer scrollToSection={scrollToSection} />
    </div>
  )
}

export default App
