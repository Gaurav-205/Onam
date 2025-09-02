

import { useEffect, useRef } from 'react'

const VideoSection = () => {
  const videoRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When section comes into view, automatically play video
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(error => {
                  console.log('VideoSection auto-play prevented:', error)
                })
                console.log('VideoSection video playing - in view')
              }
            }, 100)
          } else {
            // When section goes out of view, pause video
            if (videoRef.current) {
              videoRef.current.pause()
              console.log('VideoSection video paused - out of view')
            }
          }
        })
      },
      {
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: '0px 0px -100px 0px' // Start playing slightly before fully in view
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      // Ensure video is paused when component unmounts
      if (videoRef.current) {
        videoRef.current.pause()
        console.log('VideoSection video paused - component unmounting')
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Video Container */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Video Background/Thumbnail */}
          <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">

            
            {/* Video Player */}
            <div className="w-full h-full">
              {/* Local Video File */}
              <video
                ref={videoRef}
                className="w-full h-full rounded-2xl object-cover"
                controls
                autoPlay
                preload="metadata"
                muted
              >
                <source src="/onam-celebration-video.mp4" type="video/mp4" />
                <source src="/onam-celebration-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoSection
