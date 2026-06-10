import { Outlet, useLocation } from 'react-router-dom'
import { useCallback, useMemo } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import CheckoutModal from './CheckoutModal'

const Layout = () => {
  const location = useLocation()
  

  // Convert pathname to section ID for Navbar compatibility
  const currentSection = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/coming-soon') return 'under-development'
    return 'home'
  }, [location.pathname])

  // Helper function to scroll to a section element using native smooth scroll
  const scrollToElement = useCallback((elementId) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Navigation handler for Navbar - scroll directly on the single-page layout
  const scrollToSection = useCallback((sectionId) => {
    const elementId = sectionId === 'home' ? 'home' : sectionId
    scrollToElement(elementId)
  }, [scrollToElement])

  // Determine if we're on home page (no top padding needed for hero section)
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 overflow-x-hidden">
      <Navbar currentSection={currentSection} scrollToSection={scrollToSection} />
      <main className={isHomePage ? '' : 'pt-16'}>
        <Outlet />
      </main>
      <Footer scrollToSection={scrollToSection} />
      
      {/* Overlays */}
      <CartDrawer />
      <CheckoutModal />
    </div>
  )
}

export default Layout

