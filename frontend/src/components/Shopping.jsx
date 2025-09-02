const Shopping = () => {
  const shoppingItems = [
    { name: "Onakkodi", description: "Traditional new clothes", icon: "👗", color: "from-pink-400 to-pink-500" },
    { name: "Jewelry", description: "Gold and silver ornaments", icon: "💍", color: "from-yellow-400 to-yellow-500" },
    { name: "Handicrafts", description: "Local art and crafts", icon: "🎨", color: "from-purple-400 to-purple-500" },
    { name: "Sweets", description: "Traditional Onam sweets", icon: "🍬", color: "from-red-400 to-red-500" }
  ]

  return (
    <section id="shopping" className="section-padding bg-white relative overflow-hidden">
      {/* Shopping Bag Pattern */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-onam-gold/5 to-transparent rounded-full translate-x-40 -translate-y-40"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-onam-red/5 to-transparent rounded-full -translate-x-32 translate-y-32"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-elegant">Shopping</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-onam-green to-onam-gold mx-auto"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            There is no bigger shopping season in Kerala than during the festival of Onam.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shoppingItems.map((item, index) => (
            <div key={index} className="card p-6 text-center relative overflow-hidden">
              {/* Background Accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>
              
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Shopping
