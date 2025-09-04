import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Onam website error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 font-heading">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an error loading the Onam website. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-onam-green text-white px-6 py-3 rounded-lg hover:bg-onam-green/80 transition-colors duration-200 font-medium"
            >
              Refresh Page
            </button>
            <div className="mt-4 text-sm text-gray-500">
              If the problem persists, please check your internet connection.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
