/**
 * Simple Logger Utility
 * Provides structured logging for the application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
}

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info'
    this.logLevelValue = LOG_LEVELS[this.logLevel.toUpperCase()] ?? LOG_LEVELS.INFO
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.logLevelValue
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const levelName = LOG_LEVEL_NAMES[LOG_LEVELS[level]]
    const prefix = `[${timestamp}] [${levelName}]`
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`
    }
    return `${prefix} ${message}`
  }

  error(message, error = null) {
    if (this.shouldLog('ERROR')) {
      const errorData = error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        ...error
      } : null
      console.error(this.formatMessage('ERROR', message, errorData))
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, data))
    }
  }

  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message, data))
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      if (this.isDevelopment) {
        console.debug(this.formatMessage('DEBUG', message, data))
      }
    }
  }

  // Convenience methods for common use cases
  request(method, path, status, duration = null) {
    const message = `${method} ${path} - ${status}`
    const data = duration ? { duration: `${duration}ms` } : null
    if (status >= 400) {
      this.warn(message, data)
    } else {
      this.info(message, data)
    }
  }

  database(operation, collection, duration = null) {
    const message = `DB ${operation} on ${collection}`
    const data = duration ? { duration: `${duration}ms` } : null
    this.debug(message, data)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export class for testing
export default Logger

