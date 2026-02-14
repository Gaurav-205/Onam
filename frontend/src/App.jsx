import { lazy, Suspense, useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { PageSkeleton } from './components/SkeletonLoader'

// Scroll restoration component - runs BEFORE paint
function ScrollToTop() {
  const { pathname } = useLocation()

  // Disable browser scroll restoration once
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Scroll to top BEFORE browser paints (synchronous)
  useLayoutEffect(() => {
    // Disable smooth scrolling temporarily
    document.documentElement.classList.add('route-changing')
    
    // Force immediate scroll to top before any rendering
    window.scrollTo(0, 0)
    
    // Re-enable smooth scrolling after a brief delay
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('route-changing')
    }, 50)
    
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Shopping = lazy(() => import('./pages/Shopping'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route 
            index 
            element={
              <Suspense fallback={<PageSkeleton type="home" />}>
                <Home />
              </Suspense>
            } 
          />
          <Route 
            path="shopping" 
            element={
              <Suspense fallback={<PageSkeleton type="shopping" />}>
                <Shopping />
              </Suspense>
            } 
          />
          <Route 
            path="cart" 
            element={
              <Suspense fallback={<PageSkeleton type="cart" />}>
                <Cart />
              </Suspense>
            } 
          />
          <Route 
            path="checkout" 
            element={
              <Suspense fallback={<PageSkeleton type="checkout" />}>
                <Checkout />
              </Suspense>
            } 
          />
          <Route 
            path="coming-soon" 
            element={
              <Suspense fallback={<PageSkeleton />}>
                <ComingSoon />
              </Suspense>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
