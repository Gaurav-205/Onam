const Shopping = () => {
  const shoppingItems = [
    { 
      name: "Mundu", 
      description: "Traditional white cotton dhoti worn by men", 
      icon: "👔", 
      color: "from-blue-400 to-blue-500",
      details: "Pure cotton, handwoven, traditional Kerala style",
      price: "₹1,200",
      image: "/mundu-image.jpg"
    },
    { 
      name: "Kerala Saree", 
      description: "Elegant silk sarees with golden borders", 
      icon: "👗", 
      color: "from-purple-400 to-purple-500",
      details: "Kerala Kasavu saree, golden zari work, traditional design",
      price: "₹8,500",
      image: "/kerala-saree-image.jpg"
    },
    { 
      name: "Sadya", 
      description: "Traditional 26-course Onam feast", 
      icon: "🍽️", 
      color: "from-orange-400 to-orange-500",
      details: "Complete meal served on banana leaf with all traditional dishes",
      price: "₹500",
      image: "/sadya-image.jpg"
    }
  ]

  const handleBookNow = (itemName) => {
    // You can implement booking logic here
    alert(`Booking request sent for ${itemName}! We'll contact you soon.`)
  }

  return (
    <section id="shopping" className="section-padding bg-white relative overflow-hidden">
      {/* Shopping Bag Pattern */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-onam-gold/5 to-transparent rounded-full translate-x-40 -translate-y-40"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-onam-red/5 to-transparent rounded-full -translate-x-32 translate-y-32"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-heading">Traditional Onam Shopping</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the essential traditional items that make Onam celebrations complete - from traditional attire to the grand feast.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shoppingItems.map((item, index) => (
            <div key={index} className="card overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Top Section - Image Area */}
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Product Icon/Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-5xl text-white shadow-xl`}>
                    {item.icon}
                  </div>
                </div>
                
                {/* Top-left Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Traditional
                  </span>
                </div>
                
                {/* Top-right Brand Element */}
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-gray-800">ON</span>
                  </div>
                </div>
                
                {/* Image Carousel Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                </div>
              </div>
              
              {/* Bottom Section - Product Details */}
              <div className="bg-white p-6">
                {/* Product Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                
                {/* Tagline */}
                <p className="text-gray-600 text-sm mb-3 font-medium">{item.description}</p>
                
                {/* Product Description */}
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{item.details}</p>
                
                {/* Bottom Row - Price and Action */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <div className="bg-gray-100 rounded-full px-4 py-2">
                    <span className="text-lg font-bold text-gray-900">{item.price}</span>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookNow(item.name)
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span>Book Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Shopping
