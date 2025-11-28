import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CartIcon from './CartIcon'

// Memoized navigation items - some are routes, some are scroll sections
const navItems = [
  { id: 'home', label: 'Home', path: '/', type: 'scroll' },
  { id: 'shopping', label: 'Shopping', path: '/shopping', type: 'route' },
  { id: 'sadya', label: 'Sadya', path: '/sadya', type: 'scroll' },
  { id: 'events', label: 'Events', path: '/events', type: 'scroll' },
  { id: 'under-development', label: 'Coming Soon', path: '/coming-soon', type: 'route' }
]

// Memoized NavItem component - handles both scroll and route navigation
const NavItem = memo(({ item, isActive, isScrolled, onScrollClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const textColor = isActive
    ? isScrolled 
      ? 'text-onam-gold font-semibold hover:text-onam-green' 
      : 'text-onam-gold font-semibold hover:text-onam-green'
    : isScrolled 
      ? 'text-gray-600 hover:text-onam-gold hover:bg-gray-100' 
      : 'text-white/90 hover:text-onam-gold hover:bg-white/10'

  const handleClick = (e) => {
    if (item.type === 'scroll') {
      e.preventDefault()
      onScrollClick(item.id)
    }
    // For route type, Link will handle navigation
  }

  if (item.type === 'scroll') {
    return (
      <button
        onClick={handleClick}
        className={`relative px-4 py-2 rounded-lg transition-all duration-300 group font-sans ${textColor}`}
        aria-label={`Navigate to ${item.label} section`}
        aria-current={isActive ? 'page' : undefined}
      >
        {item.label}
      </button>
    )
  }

  const handleLinkClick = () => {
    // Smooth scroll to top when clicking route-based navigation
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    })
  }

  return (
    <Link
      to={item.path}
      onClick={handleLinkClick}
      className={`relative px-4 py-2 rounded-lg transition-all duration-300 group font-sans ${textColor}`}
      aria-label={`Navigate to ${item.label} page`}
      aria-current={location.pathname === item.path ? 'page' : undefined}
    >
      {item.label}
    </Link>
  )
})

NavItem.displayName = 'NavItem'

// Memoized Logo component
const Logo = memo(() => {
  const handleLogoClick = () => {
    // Smooth scroll to top when clicking logo
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    })
  }
  
  return (
    <Link 
      to="/"
      onClick={handleLogoClick}
      className="flex items-center space-x-2 transition-transform duration-200 focus:outline-none rounded-lg p-1 hover:scale-105 sm:hover:scale-105"
      aria-label="Navigate to home page"
    >
    <img 
      src="/logo.png" 
      alt="ONAM Logo" 
      className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 object-contain"
      loading="eager"
    />
    <span className="text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-ornate font-normal text-onam-gold">
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
    const sections = ['home', 'sadya', 'events', 'under-development']
    
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
  
  // Throttled scroll handler
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
  
  // Scroll event listener for home page
  useEffect(() => {
    if (location.pathname === '/') {
      handleScroll() // Initial check
      let scrollHandler = null
      if (throttledScroll) {
        scrollHandler = throttledScroll()
        window.addEventListener('scroll', scrollHandler, { passive: true })
      }
      return () => {
        if (scrollHandler) {
          window.removeEventListener('scroll', scrollHandler)
        }
      }
    } else {
      setIsScrolled(true)
      setActiveScrollSection('home')
    }
  }, [location.pathname, handleScroll, throttledScroll])


  // Responsive navigation handler
  const handleResize = useCallback(() => {
    const navbar = document.querySelector('nav')
    if (navbar) {
      const navWidth = navbar.offsetWidth
      const logoWidth = navbar.querySelector('.logo-container')?.offsetWidth || 0
      const availableWidth = navWidth - logoWidth - 80 // 80px for padding and mobile button
      
      // Calculate if we have enough space for all nav items
      const navItemWidth = 120 // Approximate width per nav item
      const totalNavWidth = navItems.length * navItemWidth
      
      setShowMobileMenu(availableWidth < totalNavWidth)
    }
  }, [])


  // Resize event listener for responsive navigation
  useEffect(() => {
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="logo-container">
            <Logo />
          </div>

          {/* Centered Navigation Links - Show when there's space */}
          {!showMobileMenu && (
            <div className="flex items-center justify-center flex-1">
              <div className="flex space-x-6 lg:space-x-8">
                {memoizedNavItems.map((item) => {
                  // Determine if item is active
                  let isActive = false
                  if (item.type === 'route') {
                    isActive = location.pathname === item.path
                  } else if (item.type === 'scroll') {
                    isActive = location.pathname === '/' && activeScrollSection === item.id
                  }
                  
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

          {/* Cart Icon and Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <CartIcon 
              isScrolled={isScrolled || !isHomePage}
              isActive={location.pathname === '/cart'}
            />
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
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 py-2">
            <div className="flex flex-col space-y-1">
              {memoizedNavItems.map((item) => {
                const isActive = item.type === 'route' 
                  ? location.pathname === item.path
                  : location.pathname === '/' && activeScrollSection === item.id
                
                if (item.type === 'scroll') {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        scrollToSection(item.id)
                        setIsMenuOpen(false)
                      }}
                      className={`px-4 py-2 text-left transition-colors duration-200 ${
                        isActive
                          ? 'text-onam-gold font-semibold hover:text-onam-green'
                          : 'text-gray-600 hover:text-onam-gold hover:bg-gray-50'
                      }`}
                      aria-label={`Navigate to ${item.label} section`}
                    >
                      {item.label}
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => {
                      requestAnimationFrame(() => {
                        window.scrollTo({ 
                          top: 0, 
                          behavior: 'smooth' 
                        })
                      })
                      setIsMenuOpen(false)
                    }}
                    className={`px-4 py-2 text-left transition-colors duration-200 ${
                      isActive
                        ? 'text-onam-gold font-semibold hover:text-onam-green'
                        : 'text-gray-600 hover:text-onam-gold hover:bg-gray-50'
                    }`}
                    aria-label={`Navigate to ${item.label} page`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
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
