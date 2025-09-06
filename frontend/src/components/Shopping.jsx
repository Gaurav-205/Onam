import { useCallback, useMemo, memo } from 'react'
import { useState } from 'react'
import OptimizedImage from './OptimizedImage'

// Memoized shopping items data
const shoppingItems = [
  { 
    name: "Mundu", 
    description: "Traditional white cotton dhoti worn by men", 
    icon: "👔", 
    color: "from-blue-400 to-blue-500",
    details: "Pure cotton, handwoven, traditional Kerala style",
    price: "₹280",
    image: "/mundu-image.jpeg",
    googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd4jEyZ9EGIBh3Cwe0yJX_6JccFUGceA0qDyW9BMLkotSb6Zw/formResponse"
  },
  { 
    name: "Kerala Saree", 
    description: "Elegant silk sarees with golden borders", 
    icon: "👗", 
    color: "from-purple-400 to-purple-500",
    details: "Kerala Kasavu saree, golden zari work, traditional design",
    price: "₹350",
    image: "/kerala-saree-image.jpeg",
    googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd4jEyZ9EGIBh3Cwe0yJX_6JccFUGceA0qDyW9BMLkotSb6Zw/formResponse"
  },
  { 
    name: "Sadya", 
    description: "Traditional 26-course Onam feast", 
    icon: "🍽️", 
    color: "from-orange-400 to-orange-500",
    details: "Complete meal served on banana leaf with all traditional dishes",
    price: "₹250",
    image: "/sadya-image.jpeg",
    googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd4jEyZ9EGIBh3Cwe0yJX_6JccFUGceA0qDyW9BMLkotSb6Zw/formResponse"
  }
]

// Memoized ProductCard component for better performance
const ProductCard = memo(({ item, onBookNow }) => {

  const handleBookNowClick = useCallback((e) => {
    e.stopPropagation()
    onBookNow(item.name, item.googleFormUrl)
  }, [item.name, item.googleFormUrl, onBookNow])

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      {/* Top Section - Image Area */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
        <OptimizedImage
          src={item.image}
          alt={`${item.name} - ${item.description}`}
          className="w-full h-full"
          fallbackIcon={
            <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-5xl text-white shadow-xl`}>
              {item.icon}
            </div>
          }
          loading="lazy"
        />
        
        {/* Top-left Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full" aria-label="Traditional Onam item">
            Traditional
          </span>
        </div>
      </div>
      
      {/* Bottom Section - Product Details */}
      <div className="bg-white p-6 flex flex-col h-full">
        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2" id={`product-name-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
          {item.name}
        </h3>
        
        {/* Tagline */}
        <p className="text-gray-700 text-sm mb-3 font-medium" id={`product-description-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
          {item.description}
        </p>
        
        {/* Product Description */}
        <p className="text-gray-700 text-sm mb-6 leading-relaxed flex-grow" id={`product-details-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
          {item.details}
        </p>
        
        {/* Bottom Row - Price and Action */}
        <div className="flex items-center justify-between mt-auto">
          {/* Price */}
          <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center border border-gray-200">
            <span className="text-lg font-bold text-gray-900" aria-label={`Price: ${item.price}`}>
              {item.price}
            </span>
          </div>
          
          {/* Action Button */}
          <button 
            onClick={handleBookNowClick}
            className="bg-gray-900 text-white font-semibold py-2 px-6 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            aria-label={`Book ${item.name} now for ${item.price}`}
            aria-describedby={`product-name-${item.name.toLowerCase().replace(/\s+/g, '-')} product-description-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span>Book Now</span>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

const Shopping = () => {
  // Memoized handler for booking
  const handleBookNow = useCallback((itemName, googleFormUrl) => {
    if (googleFormUrl && googleFormUrl !== "https://forms.google.com/your-form-url") {
      // Open Google Form in new tab
      window.open(googleFormUrl, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback if no form URL is set
      alert(`Booking request sent for ${itemName}! We'll contact you soon.`)
    }
  }, [])

  // Memoized shopping items to prevent unnecessary re-renders
  const memoizedShoppingItems = useMemo(() => shoppingItems, [])

  return (
    <section id="shopping" className="section-padding bg-white relative overflow-hidden" aria-label="Traditional Onam Shopping">
      {/* Shopping Bag Pattern */}
      <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-bl from-onam-gold/5 to-transparent rounded-full translate-x-20 sm:translate-x-40 -translate-y-20 sm:-translate-y-40" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-onam-red/5 to-transparent rounded-full -translate-x-16 sm:-translate-x-32 translate-y-16 sm:translate-y-32" aria-hidden="true"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 font-heading">Traditional Onam Shopping</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover the essential traditional items that make Onam celebrations complete - from traditional attire to the grand feast.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {memoizedShoppingItems.map((item, index) => (
            <ProductCard 
              key={`${item.name}-${index}`}
              item={item} 
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Shopping
