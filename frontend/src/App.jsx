import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Shopping = lazy(() => import('./pages/Shopping'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route 
            index 
            element={
              <Suspense fallback={<LoadingSpinner message="Loading Onam Experience..." />}>
                <Home />
              </Suspense>
            } 
          />
          <Route 
            path="shopping" 
            element={
              <Suspense fallback={<LoadingSpinner message="Loading Shopping..." />}>
                <Shopping />
              </Suspense>
            } 
          />
          <Route 
            path="cart" 
            element={
              <Suspense fallback={<LoadingSpinner message="Loading Cart..." />}>
                <Cart />
              </Suspense>
            } 
          />
          <Route 
            path="checkout" 
            element={
              <Suspense fallback={<LoadingSpinner message="Loading Checkout..." />}>
                <Checkout />
              </Suspense>
            } 
          />
          <Route 
            path="coming-soon" 
            element={
              <Suspense fallback={<LoadingSpinner message="Loading..." />}>
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
