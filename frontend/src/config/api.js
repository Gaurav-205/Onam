/**
 * API Configuration
 * Centralized API endpoint configuration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  // Config endpoint
  GET_CONFIG: `${API_BASE_URL.replace('/api', '')}/api/config`,
  
  // Order endpoints
  CREATE_ORDER: `${API_BASE_URL}/orders`,
  GET_ORDER: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
  GET_ORDERS: `${API_BASE_URL}/orders`,
  
  // Payment endpoints (not implemented yet)
  VERIFY_PAYMENT: `${API_BASE_URL}/payments/verify`,
  CREATE_PAYMENT: `${API_BASE_URL}/payments/create`,
  
  // Student endpoints (not implemented yet)
  VERIFY_STUDENT: `${API_BASE_URL}/students/verify`,
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

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
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

/**
 * Verify payment API call (not implemented yet)
 */
export const verifyPayment = async (paymentData) => {
  return apiRequest(API_ENDPOINTS.VERIFY_PAYMENT, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })
}

