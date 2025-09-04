import React from 'react'

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <div className="w-16 h-16 border-4 border-onam-green/20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-onam-green rounded-full animate-spin"></div>
          </div>
          
          {/* Onam logo or icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">🎉</div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2 font-heading">Onam Festival</h2>
        <p className="text-gray-600 font-medium">{message}</p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-onam-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-onam-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-onam-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
