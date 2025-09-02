const Memories = () => {
  const memoriesData = [
    { title: "Pookalam Memories", icon: "🌸", color: "from-pink-400 to-pink-500", pattern: "🌺🌻🌷" },
    { title: "Boat Race Moments", icon: "🚣‍♂️", color: "from-blue-400 to-blue-500", pattern: "⛵🛥️🚤" },
    { title: "Sadya Feasts", icon: "🍽️", color: "from-orange-400 to-orange-500", pattern: "🍚🥘🍛" },
    { title: "Cultural Performances", icon: "💃", color: "from-purple-400 to-purple-500", pattern: "🎭🎨🎪" },
    { title: "Festival Decorations", icon: "🎊", color: "from-yellow-400 to-yellow-500", pattern: "🎉🎈🎊" },
    { title: "Family Celebrations", icon: "👨‍👩‍👧‍👦", color: "from-green-400 to-green-500", pattern: "🏠💕👨‍👩‍👧‍👦" },
    { title: "Traditional Attire", icon: "👗", color: "from-red-400 to-red-500", pattern: "👘👕👖" },
    { title: "Festive Joy", icon: "🎉", color: "from-indigo-400 to-indigo-500", pattern: "🎊🎈🎉" }
  ]

  return (
    <section id="memories" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Memories Pattern Background */}
      <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-blue-100/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-100/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-heading">Memories</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-onam-green to-onam-gold mx-auto"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cherish the beautiful moments and unforgettable experiences of Onam celebrations through the years.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {memoriesData.map((item, index) => (
            <div key={index} className="card p-6 text-center cursor-pointer transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              {/* Background Accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>
              
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full mx-auto mb-4 flex items-center justify-center text-3xl`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <div className="text-sm text-gray-500">{item.pattern}</div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="btn-primary">Share Your Memories</button>
        </div>
      </div>
    </section>
  )
}

export default Memories
