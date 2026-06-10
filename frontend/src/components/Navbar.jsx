import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'
import { useCart } from '../context/CartContext'

// Memoized navigation items - all are scroll sections on the single page
const navItems = [
  { id: 'home', label: 'Home', path: '#home', type: 'scroll' },
  { id: 'shopping', label: 'Shopping', path: '#shopping', type: 'scroll' },
  { id: 'sadya', label: 'Sadya', path: '#sadya', type: 'scroll' },
  { id: 'events', label: 'Events', path: '#events', type: 'scroll' },
  { id: 'under-development', label: 'Coming Soon', path: '#under-development', type: 'scroll' }
]

// Memoized NavItem component - handles scroll navigation on the single page
const NavItem = memo(({ item, isActive, isScrolled, onScrollClick }) => {
  const textColor = isActive
    ? 'text-onam-gold-dark font-semibold hover:text-onam-green-dark'
    : isScrolled 
      ? 'text-gray-700 hover:text-onam-gold-dark hover:bg-gray-100' 
      : 'text-white hover:text-onam-gold hover:bg-white/10'

  const handleClick = (e) => {
    e.preventDefault()
    onScrollClick(item.id)
  }

  return (
    <button
      onClick={handleClick}
      className={`relative px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 group font-sans text-sm sm:text-base ${textColor}`}
      aria-label={`Navigate to ${item.label} section`}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </button>
  )
})

NavItem.displayName = 'NavItem'

// Memoized Logo component
const Logo = memo(() => {
  const handleLogoClick = () => {
    // Instant scroll to top when clicking logo (no animation)
    window.scrollTo(0, 0)
  }
  
  return (
    <Link 
      to="/"
      onClick={handleLogoClick}
      className="flex items-center space-x-2 transition-transform duration-200 focus:outline-none rounded-lg p-1 hover:scale-105 sm:hover:scale-105"
      aria-label="Navigate to home page"
    >
    <OptimizedImage 
      src="/logo.png" 
      alt="ONAM Logo" 
      className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 object-contain"
      loading="eager"
      width={56}
      height={56}
      sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, (max-width: 1024px) 48px, (max-width: 1280px) 56px, 56px"
    />
    <span className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-ornate font-normal text-onam-gold-dark">
      Onam
    </span>
  </Link>
  )
})

Logo.displayName = 'Logo'

// Memoized MobileMenuButton component
const MobileMenuButton = memo(({ isScrolled, onClick, isMenuOpen }) => (
  <button 
    className={`p-2 rounded-md transition-colors duration-200 ${isScrolled ? 'text-gray-800' : 'text-white'} hover:bg-white/10`}
    onClick={onClick}
    aria-label="Toggle mobile menu"
    aria-expanded={isMenuOpen}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {isMenuOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>
))

MobileMenuButton.displayName = 'MobileMenuButton'

const Navbar = ({ currentSection, scrollToSection }) => {
  const { openCart, totalItems } = useCart()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Determine if navbar should be transparent (only on home page)
  const isHomePage = location.pathname === '/'
  
  // Determine active section based on scroll position (for home page sections)
  const [activeScrollSection, setActiveScrollSection] = useState('home')
  
  // Scroll handler to detect which section is in view
  const handleScroll = useCallback(() => {
    if (location.pathname !== '/') return
    
    const scrollPosition = window.scrollY + 200
    const sections = ['home', 'shopping', 'sadya', 'events', 'under-development']
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i])
      if (element && element.offsetTop <= scrollPosition) {
        setActiveScrollSection(sections[i])
        break
      }
    }
    
    const scrolled = window.scrollY > 50
    setIsScrolled(scrolled)
  }, [location.pathname])
  
  // Scroll event listener for home page with proper throttling
  useEffect(() => {
    if (location.pathname === '/') {
      handleScroll() // Initial check
      
      let ticking = false
      const scrollHandler = () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(() => {
            handleScroll()
            ticking = false
          })
        }
      }
      
      window.addEventListener('scroll', scrollHandler, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', scrollHandler)
      }
    } else {
      setIsScrolled(true)
      setActiveScrollSection('home')
    }
  }, [location.pathname, handleScroll])


  // Responsive navigation handler
  // Resize event listener for responsive navigation
  useEffect(() => {
    const handleResize = () => {
      setShowMobileMenu(window.innerWidth < 1024)
    }
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu when section changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentSection])

  // Memoized navbar classes
  const navbarClasses = useMemo(() => {
    const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
    const backgroundClasses = (isScrolled || !isHomePage)
      ? 'bg-white/90 backdrop-blur-md shadow-lg' 
      : 'bg-transparent'
    
    return `${baseClasses} ${backgroundClasses}`
  }, [isScrolled, isHomePage])

  // Memoized navigation items to prevent unnecessary re-renders
  const memoizedNavItems = useMemo(() => navItems, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  return (
    <nav className={navbarClasses} role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[64px]">
          {/* Logo */}
          <div className="logo-container flex items-center flex-shrink-0">
            <Logo />
          </div>

          {/* Centered Navigation Links - Show when there's space */}
          {!showMobileMenu && (
            <div className="flex items-center justify-center flex-1 mx-4">
              <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                {memoizedNavItems.map((item) => {
                  const isActive = activeScrollSection === item.id
                  
                  return (
                    <NavItem 
                      key={item.id}
                      item={item}
                      isActive={isActive}
                      isScrolled={isScrolled || !isHomePage}
                      onScrollClick={scrollToSection}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Cart Icon & Mobile Menu Button */}
          <div className="flex items-center justify-end space-x-3 flex-shrink-0">
            <button
              onClick={openCart}
              className={`relative p-2 rounded-full transition-all duration-200 ${
                isScrolled || !isHomePage
                  ? 'text-gray-700 hover:text-onam-green-dark hover:bg-gray-100'
                  : 'text-white hover:text-onam-gold hover:bg-white/10'
              }`}
              aria-label={`Open shopping cart, ${totalItems} items`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-onam-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce-slow">
                  {totalItems}
                </span>
              )}
            </button>

            {showMobileMenu && (
              <MobileMenuButton 
                isScrolled={isScrolled || !isHomePage}
                onClick={toggleMobileMenu}
                isMenuOpen={isMenuOpen}
              />
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && showMobileMenu && (
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 py-2 mx-0">
            <div className="flex flex-col">
              {memoizedNavItems.map((item) => {
                const isActive = activeScrollSection === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.id)
                      setIsMenuOpen(false)
                    }}
                    className={`px-4 py-3 text-left transition-colors duration-200 w-full ${
                      isActive
                        ? 'text-onam-gold-dark font-semibold hover:text-onam-green-dark bg-onam-gold/10'
                        : 'text-gray-700 hover:text-onam-gold-dark hover:bg-gray-50'
                    }`}
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
