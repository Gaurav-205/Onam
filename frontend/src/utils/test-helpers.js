/**
 * Test helper utilities
 * Common utilities for testing
 */

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    }
  }
}

/**
 * Wait for async operations
 */
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Create mock fetch response
 */
export const createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
})

