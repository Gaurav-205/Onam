import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import VideoSection from './components/VideoSection'
import Shopping from './components/Shopping'
import Sadya from './components/Sadya'
import Events from './components/Events'
// import Festivals from './components/Festivals'
// import Rituals from './components/Rituals'
// import Memories from './components/Memories'
import UnderDevelopment from './components/UnderDevelopment'
import Footer from './components/Footer'

function App() {
  const [currentSection, setCurrentSection] = useState('home')

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setCurrentSection(sectionId)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'shopping', 'sadya', 'events', 'under-development']
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setCurrentSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      <Navbar currentSection={currentSection} scrollToSection={scrollToSection} />
      <Hero />
      <VideoSection />
      <Shopping />
      <Sadya />
      <Events />
      {/* <Festivals />
      <Rituals />
      <Memories /> */}
      <UnderDevelopment />
      <Footer scrollToSection={scrollToSection} />
    </div>
  )
}

export default App
