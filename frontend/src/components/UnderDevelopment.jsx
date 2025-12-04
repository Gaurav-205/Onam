const UnderDevelopment = () => {
  return (
    <section id="under-development" className="section-padding bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 font-heading">
            More Features Coming Soon
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-sans px-4">
            We're working hard to bring you more amazing Onam experiences. Stay tuned for exciting updates!
          </p>
        </div>

        {/* Development Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Festivals Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 font-heading">Festivals</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 font-sans">
              Explore the rich tapestry of Kerala's festivals and celebrations
            </p>
            <div className="inline-flex items-center text-xs sm:text-sm text-purple-600 font-medium">
              <span className="bg-purple-100 px-2 sm:px-3 py-1 rounded-full">In Development</span>
            </div>
          </div>

          {/* Rituals Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 font-heading">Rituals</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 font-sans">
              Discover the sacred traditions and spiritual practices of Onam
            </p>
            <div className="inline-flex items-center text-xs sm:text-sm font-medium">
              <span className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full">In Development</span>
            </div>
          </div>

          {/* Memories Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 font-heading">Memories</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 font-sans">
              Share and relive precious Onam moments and experiences
            </p>
            <div className="inline-flex items-center text-xs sm:text-sm font-medium">
              <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full">In Development</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UnderDevelopment
