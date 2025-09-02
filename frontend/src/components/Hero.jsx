import { useState, useEffect } from 'react'

const Hero = () => {
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    // Check if video file exists
    const video = document.createElement('video')
    video.src = '/onam-background.mp4'
    
    video.onerror = () => setVideoError(true)
    
    return () => {
      video.onerror = null
    }
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Video Background - Primary */}
      <div className="absolute inset-0 w-full h-full">
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
            onError={() => setVideoError(true)}
          >
            <source src="/onam-background.mp4" type="video/mp4" />
          </video>
        )}
        
        {/* Fallback Background - Clean gradient if no video */}
        {videoError && (
          <div className="w-full h-full bg-gradient-to-br from-onam-green via-onam-gold to-onam-red"></div>
        )}
        
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Main Content - Clean and centered */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        <h1 className="text-8xl md:text-9xl font-bold mb-8 text-white drop-shadow-2xl font-serif">
          ONAM
        </h1>
        <p className="text-3xl md:text-4xl text-white/95 mb-12 font-medium drop-shadow-lg font-serif">
          Celebration of Kerala's Tradition & Culture
        </p>
        <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
          The National Festival of Kerala - A nostalgia that brings back memories from childhood and the simple ways of life that prevailed in the villages back in the day.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="btn-primary text-lg px-8 py-4">Learn More</button>
          <button className="btn-secondary text-lg px-8 py-4">Watch Video</button>
        </div>
      </div>
      
      {/* Simple scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
