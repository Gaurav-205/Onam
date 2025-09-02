const Festivals = () => {
  const festivalDays = [
    "Atham - First day of Onam",
    "Chithira - Second day",
    "Chodhi - Third day",
    "Vishakam - Fourth day",
    "Anizham - Fifth day",
    "Thriketa - Sixth day",
    "Moolam - Seventh day",
    "Pooradam - Eighth day",
    "Uthradom - Ninth day",
    "Thiruvonam - Tenth day (Main day)"
  ]

  return (
    <section id="festivals" className="section-padding bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      {/* Festival Pattern Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-100/30 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-pink-100/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-heading">Festivals</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-onam-green to-onam-gold mx-auto"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The 10 days that follow the day of 'Atham' in the month of 'Chingam' are a period of big festivities in Kerala.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6 font-heading">10 Days of Celebration</h3>
            <div className="space-y-4">
              {festivalDays.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-onam-green to-onam-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{day}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* Festival Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-purple-300 rounded-full"></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-pink-300 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/3 w-18 h-18 bg-purple-400 rounded-full"></div>
                <div className="absolute bottom-1/3 right-1/3 w-14 h-14 bg-pink-400 rounded-full"></div>
              </div>
              <div className="text-center relative z-10">
                <div className="text-8xl mb-4">🎉</div>
                <p className="text-2xl font-bold text-gray-700">Festival Calendar</p>
                <p className="text-gray-600">Mark your dates!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Festivals
