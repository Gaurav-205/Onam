import { useState, useEffect } from 'react'

const Navbar = ({ currentSection, scrollToSection }) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'sadya', label: 'Sadya' },
    { id: 'events', label: 'Events' },
    { id: 'under-development', label: 'Coming Soon' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="ONAM Logo" 
              className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-40 xl:h-40 object-contain"
            />
          </div>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 group font-sans ${
                    currentSection === item.id
                      ? isScrolled 
                        ? 'text-onam-green font-semibold' 
                        : 'text-white font-semibold'
                      : isScrolled 
                        ? 'text-gray-600 hover:text-onam-green hover:bg-gray-100' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {/* Hover underline effect */}
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-onam-green via-onam-gold to-onam-red transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className={`p-2 rounded-md ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
