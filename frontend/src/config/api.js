/**
 * API Configuration
 * Centralized API endpoint configuration
 */

// Get API base URL from environment or use default
// Can be either: 'http://localhost:3000' or 'http://localhost:3000/api'
const envApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_BASE_URL = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`

// Helper to normalize URL and ensure proper /api path
const normalizeApiUrl = (url) => {
  // Remove trailing slash
  url = url.replace(/\/$/, '')
  // Remove /api if it exists at the end
  url = url.replace(/\/api$/, '')
  // Add /api/config
  return `${url}/api/config`
}

export const API_ENDPOINTS = {
  GET_CONFIG: normalizeApiUrl(envApiUrl),
  CREATE_ORDER: `${API_BASE_URL}/orders`,
  GET_ORDER: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
  GET_ORDERS: `${API_BASE_URL}/orders`,
}

/**
 * Default fetch options
 */
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * API request helper with error handling, timeout, and retry logic
 */
const REQUEST_TIMEOUT = 60000 // 60 seconds (increased for order creation)
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

export const apiRequest = async (url, options = {}, retryCount = 0) => {
  let timeoutId = null
  let abortController = null
  
  try {
    abortController = new AbortController()
    
    // Use a single timeout mechanism - AbortController
    timeoutId = setTimeout(() => {
      if (abortController) {
        abortController.abort()
      }
    }, REQUEST_TIMEOUT)

    // Use fetch directly with AbortController signal
    // The timeout is handled by AbortController, not by Promise.race
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      signal: abortController.signal,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    if (timeoutId) clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (parseError) {
        // Response is not JSON, use default error
        errorData = { message: `HTTP error! status: ${response.status}` }
      }
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      error.status = response.status
      throw error
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    
    // Handle AbortError (timeout) - don't retry, just throw with clear message
    if (error.name === 'AbortError' || error.message === 'Request timeout') {
      throw new Error('Request timeout. The server is taking too long to respond. Please try again.')
    }
    
    // Retry logic for network errors and 5xx errors (but not timeouts)
    if (retryCount < MAX_RETRIES && (
      error.message === 'Network request failed' ||
      error.message === 'Failed to fetch' ||
      (error.status && error.status >= 500 && error.status !== 408)
    )) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
      return apiRequest(url, options, retryCount + 1)
    }

    if (error instanceof Error) {
      throw error
    }
    throw new Error(error.message || 'Network request failed')
  }
}

/**
 * Create order API call
 */
export const createOrder = async (orderData) => {
  return apiRequest(API_ENDPOINTS.CREATE_ORDER, {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

/**
 * Get app configuration from backend
 */
export const getConfig = async () => {
  return apiRequest(API_ENDPOINTS.GET_CONFIG, {
    method: 'GET',
  })
}

