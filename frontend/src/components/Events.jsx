const Events = () => {
  const eventsData = [
    { name: "Athachamayam", description: "Grand procession marking the beginning of Onam", icon: "🎭", color: "from-blue-400 to-blue-500" },
    { name: "Pookalam Competition", description: "Beautiful flower carpet competitions", icon: "🌸", color: "from-pink-400 to-pink-500" },
    { name: "Vallam Kali", description: "Traditional snake boat races", icon: "🚣‍♂️", color: "from-green-400 to-green-500" },
    { name: "Kathakali Performance", description: "Classical dance drama", icon: "🎪", color: "from-purple-400 to-purple-500" },
    { name: "Onasadya Feast", description: "Traditional 26-course meal", icon: "🍽️", color: "from-orange-400 to-orange-500" },
    { name: "Cultural Programs", description: "Music, dance, and traditional arts", icon: "🎨", color: "from-red-400 to-red-500" }
  ]

  return (
    <section id="events" className="section-padding bg-white relative overflow-hidden">
      {/* Event Elements Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-onam-purple/5 to-transparent rounded-full translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-onam-pink/5 to-transparent rounded-full -translate-x-40 translate-y-40"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-heading">Events</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-onam-green to-onam-gold mx-auto"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the vibrant celebrations and cultural events that make Onam the most anticipated festival of Kerala.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsData.map((item, index) => (
            <div key={index} className="card p-6 text-center relative overflow-hidden">
              {/* Background Accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>
              
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Events
