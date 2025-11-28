/**
 * Price utility functions
 * Handles price parsing and formatting
 */

/**
 * Safely parse price string to number
 * @param {string|number} price - Price string (e.g., "₹280") or number
 * @param {number} fallback - Fallback value if parsing fails
 * @returns {number} Parsed price value
 */
export const parsePrice = (price, fallback = 0) => {
  if (typeof price === 'number') {
    return price
  }
  
  if (!price || typeof price !== 'string') {
    return fallback
  }
  
  const cleaned = price.replace('₹', '').replace(',', '').trim()
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Format number as price string
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price string (e.g., "₹280")
 */
export const formatPrice = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0'
  }
  
  return `₹${Math.round(amount)}`
}

/**
 * Calculate total price for cart items
 * @param {Array} items - Array of cart items
 * @returns {number} Total price
 */
export const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => {
    const price = item.priceValue || parsePrice(item.price, 0)
    const quantity = item.quantity || 1
    return total + (price * quantity)
  }, 0)
}

