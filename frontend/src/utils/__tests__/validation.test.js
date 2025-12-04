/**
 * Unit tests for validation utility functions
 */

import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPhone, isValidUPI, isRequired } from '../validation.js'

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('user@domain')).toBe(false)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail(null)).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('should validate 10-digit phone numbers', () => {
    expect(isValidPhone('1234567890')).toBe(true)
    expect(isValidPhone('9876543210')).toBe(true)
  })

  it('should handle phone numbers with formatting', () => {
    expect(isValidPhone('+91 1234567890')).toBe(true)
    expect(isValidPhone('(123) 456-7890')).toBe(true)
    expect(isValidPhone('123-456-7890')).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('12345')).toBe(false)
    expect(isValidPhone('12345678901')).toBe(false)
    expect(isValidPhone('abc1234567')).toBe(false)
    expect(isValidPhone('')).toBe(false)
    expect(isValidPhone(null)).toBe(false)
  })
})

describe('isValidUPI', () => {
  it('should validate correct UPI IDs', () => {
    expect(isValidUPI('user@paytm')).toBe(true)
    expect(isValidUPI('user.name@phonepe')).toBe(true)
    expect(isValidUPI('user_123@gpay')).toBe(true)
  })

  it('should reject invalid UPI IDs', () => {
    expect(isValidUPI('invalid')).toBe(false)
    expect(isValidUPI('@paytm')).toBe(false)
    expect(isValidUPI('user@')).toBe(false)
    expect(isValidUPI('user@domain.com')).toBe(false) // UPI doesn't use .com
    expect(isValidUPI('')).toBe(false)
    expect(isValidUPI(null)).toBe(false)
  })
})

describe('isRequired', () => {
  it('should validate non-empty strings', () => {
    expect(isRequired('text')).toBe(true)
    expect(isRequired('  text  ')).toBe(true)
  })

  it('should reject empty or whitespace-only strings', () => {
    expect(isRequired('')).toBe(false)
    expect(isRequired('   ')).toBe(false)
    expect(isRequired(null)).toBe(false)
    expect(isRequired(undefined)).toBe(false)
  })

  it('should handle number input', () => {
    expect(isRequired(0)).toBe(true)
    expect(isRequired(123)).toBe(true)
  })
})

