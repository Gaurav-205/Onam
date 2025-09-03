import { useState, useEffect, useCallback, useMemo, memo } from 'react'

// Memoized footer data
const HEADINGS = [
  { text: "Onam", lang: "en" },
  { text: "ഓണം", lang: "ml" }
]

const secondaryLinks = [
  { id: 'home', label: 'HOME' },
  { id: 'shopping', label: 'SHOPPING' },
  { id: 'sadya', label: 'SADYA' },
  { id: 'events', label: 'EVENTS' },
  { id: 'under-development', label: 'COMING SOON' }
]

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/gaurav_khandelwal_/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  {
    name: 'GitHub',
    url: 'https://github.com/Gaurav-205',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/gaurav-khandelwal-17a127358/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
]

// Memoized AnimatedHeading component
const AnimatedHeading = memo(({ currentHeading, isFading }) => {
  const currentHeadingData = HEADINGS[currentHeading]
  
  return (
    <span className={`font-ornate text-yellow-400 transition-all duration-600 ease-in-out transform ${
      isFading 
        ? 'opacity-0 scale-95 translate-y-2' 
        : 'opacity-100 scale-100 translate-y-0'
    }`}>
      {currentHeadingData.text}
    </span>
  )
})

AnimatedHeading.displayName = 'AnimatedHeading'

// Memoized SocialLink component
const SocialLink = memo(({ link }) => {
  const handleClick = useCallback(() => {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }, [link.url])

  return (
    <a 
      href={link.url}
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative w-10 h-10 border border-gray-400 rounded-full flex items-center justify-center text-gray-300 hover:text-yellow-400 hover:border-yellow-400 transition-colors duration-200"
      title={`Visit our ${link.name}`}
      onClick={handleClick}
    >
      {link.icon}
      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {link.name}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </a>
  )
})

SocialLink.displayName = 'SocialLink'

// Memoized ContactLink component
const ContactLink = memo(({ href, icon, children }) => (
  <a 
    href={href}
    className="flex items-center space-x-2 hover:text-yellow-400 transition-colors duration-200"
  >
    {icon}
    <span>{children}</span>
  </a>
))

ContactLink.displayName = 'ContactLink'

const Footer = ({ scrollToSection }) => {
  const [currentHeading, setCurrentHeading] = useState(0)
  const [isFading, setIsFading] = useState(false)

  // Heading rotation with fade transition
  useEffect(() => {
    const headingTimer = setInterval(() => {
      setIsFading(true)
      
      setTimeout(() => {
        setCurrentHeading(prev => (prev + 1) % HEADINGS.length)
        setIsFading(false)
      }, 300)
    }, 3000)

    return () => clearInterval(headingTimer)
  }, [])

  // Memoized secondary links to prevent unnecessary re-renders
  const memoizedSecondaryLinks = useMemo(() => secondaryLinks, [])
  const memoizedSocialLinks = useMemo(() => socialLinks, [])

  // Memoized scroll handler
  const handleScrollToSection = useCallback((sectionId) => {
    scrollToSection(sectionId)
  }, [scrollToSection])

  return (
    <footer className="bg-gray-900 text-white text-center py-12 sm:py-16" role="contentinfo">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Onam Animation - Same as Hero */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
            <AnimatedHeading currentHeading={currentHeading} isFading={isFading} />
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mt-3 sm:mt-4 font-normal drop-shadow-lg font-sans px-4" aria-label="Website description celebrating Kerala's tradition and culture">
            Celebration of Kerala's Tradition & Culture
          </p>
        </div>

        {/* Horizontal Separator */}
        <div className="w-full max-w-2xl mx-auto h-px bg-gray-600 mb-6 sm:mb-8" aria-hidden="true"></div>

        {/* Secondary Navigation Links */}
        <nav className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8 mb-6 sm:mb-8 flex-wrap gap-y-2" role="navigation" aria-label="Footer navigation">
          {memoizedSecondaryLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleScrollToSection(link.id)}
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium tracking-wide text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              aria-label={`Navigate to ${link.label} section`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
          {memoizedSocialLinks.map((link, index) => (
            <SocialLink key={`${link.name}-${index}`} link={link} />
          ))}
        </div>

        {/* Contact Information */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8 mb-6 sm:mb-8 text-gray-300">
          <ContactLink 
            href="mailto:gauravkhadelwal205@gmail.com"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M0 3v18c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H2C.9 1 0 1.9 0 3zm22 0L12 12 2 3h20zM2 19V7l10 9 10-9v12H2z"/>
              </svg>
            }
          >
            <span className="text-sm sm:text-base">gauravkhadelwal205@gmail.com</span>
          </ContactLink>
          <ContactLink 
            href="tel:+91-8955142954"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            }
          >
            <span className="text-sm sm:text-base">+91 895 514 2954</span>
          </ContactLink>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="text-gray-400 text-xs sm:text-sm px-4">
          <p>Copyright © 2025 Onam Festival, Ltd. All rights reserved. Celebrating Kerala's rich cultural heritage.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
