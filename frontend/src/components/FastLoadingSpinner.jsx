import React from 'react'

const FastLoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <div className="text-center">
        {/* Simple spinner without heavy animations */}
        <div className="w-12 h-12 border-4 border-onam-green/20 rounded-full animate-spin mx-auto mb-4">
          <div className="w-full h-full border-4 border-transparent border-t-onam-green rounded-full"></div>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800 mb-2">Onam Festival</h2>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}

export default FastLoadingSpinner
