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

  // Scroll to top whenever route changes
  useEffect(() => {
    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      smoothScrollToTop()
    })
  }, [location.pathname, smoothScrollToTop])

  // Convert pathname to section ID for Navbar compatibility
  const currentSection = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/shopping') return 'shopping'
    if (path === '/coming-soon') return 'under-development'
    return 'home'
  }, [location.pathname])

  // Navigation handler for Navbar - always scrolls to top first smoothly
  const scrollToSection = useCallback((sectionId) => {
    // Always scroll to top first when clicking any navbar button (smooth)
    smoothScrollToTop()
    
    // Sections that are on the home page (scroll navigation)
    const homePageSections = ['home', 'sadya', 'events', 'under-development']
    
    // Sections that have separate pages (route navigation)
    const routeMap = {
      'shopping': '/shopping',
      'under-development': '/coming-soon'
    }
    
    // If it's a home page section
    if (homePageSections.includes(sectionId)) {
      // If we're on home page, wait for scroll to top, then scroll to section
      if (location.pathname === '/') {
        // Wait for smooth scroll to top to complete (typically 500-800ms)
        setTimeout(() => {
          const element = document.getElementById(sectionId === 'home' ? 'home' : sectionId)
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 600) // Wait for smooth scroll animation
      } else {
        // Navigate to home first, then scroll to section after navigation
        navigate('/')
        setTimeout(() => {
          // Wait for route change and scroll to top
          requestAnimationFrame(() => {
            setTimeout(() => {
              const element = document.getElementById(sectionId === 'home' ? 'home' : sectionId)
              if (element) {
                element.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }
            }, 100)
          })
        }, 100)
      }
    } else if (routeMap[sectionId]) {
      // Navigate to separate page (scroll to top happens in useEffect)
      const route = routeMap[sectionId]
      if (route !== location.pathname) {
        navigate(route)
      }
    }
  }, [location.pathname, navigate, smoothScrollToTop])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Navbar currentSection={currentSection} scrollToSection={scrollToSection} />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer scrollToSection={scrollToSection} />
    </div>
  )
}

export default Layout

