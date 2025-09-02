const Rituals = () => {
  const ritualData = [
    {
      title: "Pookalam",
      description: "Beautiful flower carpets created in front of homes",
      icon: "🌸",
      color: "from-pink-400 to-pink-500",
      pattern: "🌺🌻🌷"
    },
    {
      title: "Athachamayam",
      description: "Grand procession marking the beginning of Onam",
      icon: "🎭",
      color: "from-blue-400 to-blue-500",
      pattern: "🎪🎨🎊"
    },
    {
      title: "Onathappan",
      description: "Clay pyramid representing Mahabali",
      icon: "🏺",
      color: "from-orange-400 to-orange-500",
      pattern: "🏛️🗿🏺"
    }
  ]

  return (
    <section id="rituals" className="section-padding bg-white relative overflow-hidden">
      {/* Ritual Pattern Background */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-onam-green/5 to-transparent rounded-full -translate-x-40 -translate-y-40"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-onam-gold/5 to-transparent rounded-full translate-x-32 translate-y-32"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-heading">Rituals</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-onam-green to-onam-gold mx-auto"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Legends and myths are a rich part of Onam which is also Kerala's harvest festival.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {ritualData.map((item, index) => (
            <div key={index} className="card p-8 text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-onam-green/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
              
              <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-full mx-auto mb-6 flex items-center justify-center text-4xl relative z-10`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
              <div className="text-2xl animate-pulse-slow">{item.pattern}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Rituals
