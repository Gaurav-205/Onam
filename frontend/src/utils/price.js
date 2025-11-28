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

