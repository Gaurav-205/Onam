import { useState, useEffect, useCallback, useMemo, memo } from 'react'

// Memoized navigation items
const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'sadya', label: 'Sadya' },
  { id: 'events', label: 'Events' },
  { id: 'under-development', label: 'Coming Soon' }
]

// Memoized NavItem component
const NavItem = memo(({ item, currentSection, isScrolled, scrollToSection }) => {
  const handleClick = useCallback(() => {
    scrollToSection(item.id)
  }, [item.id, scrollToSection])

  const isActive = currentSection === item.id
  const textColor = isActive
    ? isScrolled 
      ? 'text-onam-gold font-semibold hover:text-onam-green' 
      : 'text-onam-gold font-semibold hover:text-onam-green'
    : isScrolled 
      ? 'text-gray-600 hover:text-onam-gold hover:bg-gray-100' 
      : 'text-white/90 hover:text-onam-gold hover:bg-white/10'

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
})

NavItem.displayName = 'NavItem'

// Memoized Logo component
const Logo = memo(() => (
  <div className="flex items-center space-x-2">
    <img 
      src="/logo.png" 
      alt="ONAM Logo" 
      className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 object-contain"
      loading="eager"
    />
    <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-ornate font-normal text-onam-gold">
      Onam
    </span>
  </div>
))

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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Optimized scroll handler with useCallback
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 50
    setIsScrolled(scrolled)
  }, [])

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

  // Scroll event listener
  useEffect(() => {
    const scrollHandler = throttledScroll()
    window.addEventListener('scroll', scrollHandler, { passive: true })
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [throttledScroll])

  // Close mobile menu when section changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentSection])

  // Memoized navbar classes
  const navbarClasses = useMemo(() => {
    const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
    const backgroundClasses = isScrolled 
      ? 'bg-white/90 backdrop-blur-md shadow-lg' 
      : 'bg-transparent'
    
    return `${baseClasses} ${backgroundClasses}`
  }, [isScrolled])

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
          <Logo />

          {/* Centered Navigation Links - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8">
              {memoizedNavItems.map((item) => (
                <NavItem 
                  key={item.id}
                  item={item}
                  currentSection={currentSection}
                  isScrolled={isScrolled}
                  scrollToSection={scrollToSection}
                />
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton 
            isScrolled={isScrolled}
            onClick={toggleMobileMenu}
            isMenuOpen={isMenuOpen}
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg rounded-lg mt-2 py-2">
            <div className="flex flex-col space-y-1">
              {memoizedNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.id)
                    setIsMenuOpen(false)
                  }}
                  className={`px-4 py-2 text-left transition-colors duration-200 ${
                    currentSection === item.id
                      ? 'text-onam-gold font-semibold hover:text-onam-green'
                      : 'text-gray-600 hover:text-onam-gold hover:bg-gray-50'
                  }`}
                  aria-label={`Navigate to ${item.label} section`}
                  aria-current={currentSection === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
