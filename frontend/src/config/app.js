/**
 * Application Configuration
 * Centralized configuration for frontend application
 */

export const APP_CONFIG = {
  // Event Dates
  DATES: {
    ONAM_DATE: '2025-09-12T00:00:00', // Main Onam date
  },
  
  // UI Configuration
  UI: {
    HEADING_INTERVAL: 3000, // Milliseconds between heading changes
    FADE_DURATION: 300, // Animation fade duration
    SCROLL_THRESHOLD: 50, // Pixels scrolled to trigger navbar change
  },
  
  // Payment Configuration
  PAYMENT: {
    // UPI ID should be fetched from backend API endpoint
    // Fallback to env var only for development
    UPI_ID: import.meta.env.VITE_UPI_ID || null,
    METHODS: {
      CASH: 'cash',
      UPI: 'upi',
    },
  },
  
  // Cart Configuration
  CART: {
    STORAGE_KEY: 'onam_cart',
    MAX_QUANTITY: 99,
  },
  
  // API Configuration
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  },
}

