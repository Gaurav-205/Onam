import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Smooth scroll to top helper function
  const smoothScrollToTop = useCallback(() => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    })
  }, [])

  // Scroll to top whenever route changes (except for home page sections)
  useEffect(() => {
    // Only scroll to top for separate pages, not for home page sections
    if (location.pathname !== '/') {
      // Use setTimeout to ensure content is rendered before scrolling
      setTimeout(() => {
        smoothScrollToTop()
      }, 100)
    }
  }, [location.pathname, smoothScrollToTop])

  // Convert pathname to section ID for Navbar compatibility
  const currentSection = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/coming-soon') return 'under-development'
    return 'home'
  }, [location.pathname])

  // Helper function to scroll to a section element
  const scrollToElement = useCallback((elementId) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [])

  // Navigation handler for Navbar - smart scrolling based on context
  const scrollToSection = useCallback((sectionId) => {
    // Sections that are on the home page (scroll navigation)
    const homePageSections = ['home', 'sadya', 'events', 'under-development']
    
    // Sections that have separate pages (route navigation)
    const routeMap = {
      'under-development': '/coming-soon'
    }
    
    // If it's a home page section
    if (homePageSections.includes(sectionId)) {
      const elementId = sectionId === 'home' ? 'home' : sectionId
      
      // If we're already on home page, scroll directly to section
      if (location.pathname === '/') {
        scrollToElement(elementId)
      } else {
        // Navigate to home first, then scroll to section after navigation
        navigate('/')
        setTimeout(() => {
          // Wait for route change and DOM update
          requestAnimationFrame(() => {
            setTimeout(() => scrollToElement(elementId), 100)
          })
        }, 100)
      }
    } else if (routeMap[sectionId]) {
      // Navigate to separate page (scroll to top happens in useEffect)
      const route = routeMap[sectionId]
      if (route !== location.pathname) {
        navigate(route)
      } else {
        // If already on the page, just scroll to top
        smoothScrollToTop()
      }
    }
  }, [location.pathname, navigate, smoothScrollToTop, scrollToElement])

  // Determine if we're on home page (no top padding needed for hero section)
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Navbar currentSection={currentSection} scrollToSection={scrollToSection} />
      <main className={isHomePage ? '' : 'pt-16'}>
        <Outlet />
      </main>
      <Footer scrollToSection={scrollToSection} />
    </div>
  )
}

export default Layout

