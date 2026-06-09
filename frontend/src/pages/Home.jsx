import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import { SectionSkeleton } from '../components/SkeletonLoader'

const VideoSection = lazy(() => import('../components/VideoSection'))
const Shopping = lazy(() => import('../components/Shopping'))
const Sadya = lazy(() => import('../components/Sadya'))
const Events = lazy(() => import('../components/Events'))
const UnderDevelopment = lazy(() => import('../components/UnderDevelopment'))

const Home = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.state?.scrollTo) {
      const elementId = location.state.scrollTo
      const timer = setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  return (
    <>
      <Hero />
      <Suspense fallback={<SectionSkeleton type="video" />}>
        <VideoSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton type="events" />}>
        <Shopping />
      </Suspense>
      <Suspense fallback={<SectionSkeleton type="sadya" />}>
        <Sadya />
      </Suspense>
      <Suspense fallback={<SectionSkeleton type="events" />}>
        <Events />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <UnderDevelopment />
      </Suspense>
    </>
  )
}

export default Home

