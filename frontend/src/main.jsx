import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initializePreloading, preloadOnInteraction } from './utils/resourcePreloader.js'

const container = document.getElementById('root')
const root = createRoot(container)

// Initialize preloading for better performance
initializePreloading()
preloadOnInteraction()

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
