const Sadya = () => {
  const sadyaDishes = [
    "Rice", "Sambar", "Rasam", "Avial",
    "Thorans", "Pachadi", "Pickles", "Papadam",
    "Banana", "Payasam", "Jaggery", "Coconut"
  ]

  return (
    <section id="sadya" className="section-padding bg-gradient-to-br from-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Food Pattern Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100/30 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-yellow-100/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Sadya</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-onam-green to-onam-gold mx-auto"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            There is no way that a Malayali will like to miss an 'Onasadya' (Onam feast).
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              {sadyaDishes.map((item, index) => (
                <div key={index} className="bg-white/70 rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-1 md:order-2 text-center">
            <div className="w-full h-96 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* Banana Leaf Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-300 rounded-full"></div>
                <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-green-400 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-green-300 rounded-full"></div>
              </div>
              <div className="text-center relative z-10">
                <div className="text-8xl mb-4">🍽️</div>
                <p className="text-2xl font-bold text-gray-700">Traditional Onam Feast</p>
                <p className="text-gray-600">Served on Banana Leaf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Sadya
