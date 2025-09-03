const Sadya = () => {
  const sadyaDishes = [
    { name: "Rice", icon: "🍚", color: "from-amber-400 to-amber-500", image: "/rice-image.jpeg" },
    { name: "Sambar", icon: "🥘", color: "from-orange-400 to-orange-500", image: "/sambar-image.jpeg" },
    { name: "Rasam", icon: "🍲", color: "from-red-400 to-red-500", image: "/rasam-image.jpeg" },
    { name: "Avial", icon: "🥬", color: "from-green-400 to-green-500", image: "/avial-image.jpeg" },
    { name: "Thorans", icon: "🥗", color: "from-emerald-400 to-emerald-500", image: "/thorans-image.jpeg" },
    { name: "Pachadi", icon: "🥒", color: "from-teal-400 to-teal-500", image: "/pachadi-image.jpeg" },
    { name: "Pickles", icon: "🥭", color: "from-yellow-400 to-yellow-500", image: "/pickles-image.jpeg" },
    { name: "Papadam", icon: "🫓", color: "from-amber-400 to-amber-600", image: "/papadam-image.jpeg" },
    { name: "Banana", icon: "🍌", color: "from-yellow-400 to-yellow-500", image: "/banana-image.jpeg" },
    { name: "Payasam", icon: "🍮", color: "from-pink-400 to-pink-500", image: "/payasam-image.jpeg" },
    { name: "Jaggery", icon: "🍯", color: "from-amber-500 to-amber-600", image: "/jaggery-image.jpeg" },
    { name: "Coconut", icon: "🥥", color: "from-gray-400 to-gray-500", image: "/coconut-image.jpeg" }
  ]

  return (
    <section id="sadya" className="section-padding bg-gradient-to-br from-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Food Pattern Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100/30 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-yellow-100/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading">Sadya</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            There is no way that a Malayali will like to miss an 'Onasadya' (Onam feast).
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="order-2 md:order-1">
                        <div className="grid grid-cols-2 gap-3">
              {sadyaDishes.map((item, index) => (
                <div key={index} className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-md border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {/* Ingredient Image on the left */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 shadow-sm">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      {/* Fallback Icon */}
                      <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-md`} style={{display: 'none'}}>
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Ingredient Name - No underline */}
                    <div className="flex-1">
                      <h3 className="text-gray-800 font-medium text-sm">{item.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-1 md:order-2 text-center">
                        <div className="w-full h-[320px] md:h-[455px] bg-black rounded-2xl overflow-hidden shadow-xl relative">
              {/* Video Player with Zoomed Poster */}
              <video
                className="w-full h-full object-cover transition-all duration-300"
                controls
                muted
                loop
                preload="metadata"
                poster="/sadya-image.jpeg"
                playsInline
                controlsList="nodownload"
                onPlay={() => {
                  // Switch to object-contain when video plays to show full content
                  const video = event.target
                  video.classList.remove('object-cover')
                  video.classList.add('object-contain')
                }}
                onPause={() => {
                  // Switch back to object-cover when paused to show zoomed poster
                  const video = event.target
                  video.classList.remove('object-contain')
                  video.classList.add('object-cover')
                }}
                onError={(e) => {
                  // Hide video and show fallback if video fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              >
                <source src="/sadya-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Fallback Content - Shown when video fails to load */}
              <div className="w-full h-full bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-green-300 rounded-full blur-sm"></div>
                  <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-green-400 rounded-full blur-sm"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-green-300 rounded-full blur-sm"></div>
                </div>
                
                {/* Fallback Content */}
                <div className="text-center relative z-10">
                  <div className="text-6xl mb-4 drop-shadow-lg">🍽️</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 font-heading">Traditional Onam Feast</h3>
                  <p className="text-base text-gray-600 mb-3">Served on Banana Leaf</p>
                  
                  {/* Additional Info */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 max-w-xs mx-auto">
                    <p className="text-xs text-gray-700 font-medium">
                      Experience the authentic taste of Kerala with our traditional 26-course feast
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Video Overlay with Title - Lower z-index to not interfere with controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10 pointer-events-none">
                <h3 className="text-xl font-bold text-white mb-1 font-heading">Traditional Onam Feast</h3>
                <p className="text-sm text-white/90">Served on Banana Leaf</p>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Sadya
