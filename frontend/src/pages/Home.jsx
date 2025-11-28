import { lazy, Suspense } from 'react'
import Hero from '../components/Hero'
import LoadingSpinner from '../components/LoadingSpinner'

const VideoSection = lazy(() => import('../components/VideoSection'))
const Sadya = lazy(() => import('../components/Sadya'))
const Events = lazy(() => import('../components/Events'))
const UnderDevelopment = lazy(() => import('../components/UnderDevelopment'))

const Home = () => {
  return (
    <>
      <Hero />
      <Suspense fallback={<LoadingSpinner message="Loading video..." />}>
        <VideoSection />
      </Suspense>
      <Suspense fallback={<LoadingSpinner message="Loading Sadya..." />}>
        <Sadya />
      </Suspense>
      <Suspense fallback={<LoadingSpinner message="Loading Events..." />}>
        <Events />
      </Suspense>
      <Suspense fallback={<LoadingSpinner message="Loading..." />}>
        <UnderDevelopment />
      </Suspense>
    </>
  )
}

export default Home

