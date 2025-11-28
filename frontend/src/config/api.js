/**
 * API Configuration
 * Centralized API endpoint configuration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  GET_CONFIG: `${API_BASE_URL.replace('/api', '')}/api/config`,
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
 * API request helper with error handling
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
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

