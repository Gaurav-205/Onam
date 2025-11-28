/**
 * Validation utility functions
 * Handles form and data validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  const cleaned = phone.replace(/\D/g, '')
  return /^[0-9]{10}$/.test(cleaned)
}

/**
 * Validate UPI ID format
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} True if valid UPI ID
 */
export const isValidUPI = (upiId) => {
  if (!upiId || typeof upiId !== 'string') return false
  return /^[\w.-]+@[\w]+$/.test(upiId.trim())
}

/**
 * Validate pincode (6 digits)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if valid pincode
 */
export const isValidPincode = (pincode) => {
  if (!pincode || typeof pincode !== 'string') return false
  return /^[0-9]{6}$/.test(pincode.trim())
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim().length > 0
}

