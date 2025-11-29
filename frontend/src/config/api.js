/**
 * API Configuration
 * Centralized API endpoint configuration
 */

// Get API base URL from environment or use default
// Can be either: 'http://localhost:3000' or 'http://localhost:3000/api'
const envApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_BASE_URL = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`

export const API_ENDPOINTS = {
  GET_CONFIG: `${envApiUrl.replace(/\/api$/, '')}/api/config`,
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

const fetchWithTimeout = (url, options, timeout) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}

export const apiRequest = async (url, options = {}, retryCount = 0) => {
  let timeoutId = null
  
  try {
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetchWithTimeout(url, {
      ...defaultOptions,
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    if (timeoutId) clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      error.status = response.status
      throw error
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    
    // Retry logic for network errors and 5xx errors
    if (retryCount < MAX_RETRIES && (
      error.message === 'Request timeout' ||
      error.name === 'AbortError' ||
      error.message === 'Network request failed' ||
      (error.status && error.status >= 500)
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

