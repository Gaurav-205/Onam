/**
 * Application Configuration
 * Centralized configuration for backend application
 */

export const APP_CONFIG = {
  // Order Configuration
  ORDER: {
    PREFIX: 'ONAM',
    NUMBER_FORMAT: 'YYYYMMDD-XXXX', // Format: ONAM-YYYYMMDD-XXXX
    NUMBER_PADDING: 4, // Number of digits for sequential part
  },
  
  // Date Configuration
  DATES: {
    ONAM_DATE: '2026-08-26T00:00:00', // Main Onam date (Thiruvonam)
  },
  
  // Payment Configuration
  PAYMENT: {
    UPI_ID: process.env.UPI_ID, // UPI ID for payments (required from environment)
    METHODS: ['cash', 'upi'],
  },
  
  // Communication Configuration
  COMMUNICATION: {
    WHATSAPP_GROUP_LINK: process.env.WHATSAPP_GROUP_LINK || null, // WhatsApp group invite link
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Onam Festival - MIT ADT University',
  },
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  },
  
  // Validation
  VALIDATION: {
    PHONE_LENGTH: 10,
    MIN_ORDER_ITEMS: 1,
  },
}

