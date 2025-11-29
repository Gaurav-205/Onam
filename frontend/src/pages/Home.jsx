import { lazy, Suspense } from 'react'
import Hero from '../components/Hero'
import { SectionSkeleton } from '../components/SkeletonLoader'

const VideoSection = lazy(() => import('../components/VideoSection'))
const Sadya = lazy(() => import('../components/Sadya'))
const Events = lazy(() => import('../components/Events'))
const UnderDevelopment = lazy(() => import('../components/UnderDevelopment'))

const Home = () => {
  return (
    <>
      <Hero />
      <Suspense fallback={<SectionSkeleton type="video" />}>
        <VideoSection />
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

