/**
 * Unit tests for price utility functions
 */

import { describe, it, expect } from 'vitest'
import { parsePrice, formatPrice } from '../price.js'

describe('parsePrice', () => {
  it('should parse price string with rupee symbol', () => {
    expect(parsePrice('₹280')).toBe(280)
    expect(parsePrice('₹1,000')).toBe(1000)
  })

  it('should parse price string without rupee symbol', () => {
    expect(parsePrice('280')).toBe(280)
    expect(parsePrice('1,000')).toBe(1000)
  })

  it('should handle number input', () => {
    expect(parsePrice(280)).toBe(280)
    expect(parsePrice(1000)).toBe(1000)
  })

  it('should return fallback for invalid input', () => {
    expect(parsePrice(null, 0)).toBe(0)
    expect(parsePrice(undefined, 0)).toBe(0)
    expect(parsePrice('invalid', 0)).toBe(0)
    expect(parsePrice('', 0)).toBe(0)
  })

  it('should use custom fallback', () => {
    expect(parsePrice('invalid', 100)).toBe(100)
  })
})

describe('formatPrice', () => {
  it('should format number as price string', () => {
    expect(formatPrice(280)).toBe('₹280')
    expect(formatPrice(1000)).toBe('₹1000')
    expect(formatPrice(0)).toBe('₹0')
  })

  it('should round decimal values', () => {
    expect(formatPrice(280.5)).toBe('₹281')
    expect(formatPrice(280.4)).toBe('₹280')
  })

  it('should handle invalid input', () => {
    expect(formatPrice(NaN)).toBe('₹0')
    expect(formatPrice(null)).toBe('₹0')
    expect(formatPrice(undefined)).toBe('₹0')
    expect(formatPrice('invalid')).toBe('₹0')
  })
})

