/**
 * ErrorHandler - Centralized error handling and logging
 * Provides consistent error responses across the application
 */

/**
 * AppError - Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, code = 'UNKNOWN', details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  toString() {
    return `[${this.code}] ${this.message}`;
  }
}

/**
 * ErrorHandler - Utility for wrapping functions with error handling
 */
const ErrorHandler = {
  /**
   * Wrap a function with try-catch error handling
   * @param {Function} fn - Function to wrap
   * @param {string} contextName - Context name for logging
   * @param {Object} options - Options { logSuccess, returnError }
   * @returns {Function} Wrapped function
   */
  wrap(fn, contextName, options = {}) {
    const { logSuccess = true, returnError = true } = options;

    return function(...args) {
      try {
        const result = fn.apply(this, args);

        if (logSuccess) {
          Logger.log(`[${contextName}] Success`);
        }

        if (returnError) {
          return { success: true, data: result };
        }

        return result;
      } catch (error) {
        Logger.log(`[${contextName}] Error: ${error}`);

        if (returnError) {
          if (error instanceof AppError) {
            return error.toJSON();
          }
          return {
            success: false,
            error: error.toString(),
            code: 'UNKNOWN_ERROR'
          };
        }

        throw error;
      }
    };
  },

  /**
   * Wrap an async function with try-catch error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} contextName - Context name for logging
   * @param {Object} options - Options { logSuccess, returnError }
   * @returns {Function} Wrapped async function
   */
  wrapAsync(fn, contextName, options = {}) {
    const { logSuccess = true, returnError = true } = options;

    return async function(...args) {
      try {
        const result = await fn.apply(this, args);

        if (logSuccess) {
          Logger.log(`[${contextName}] Success`);
        }

        if (returnError) {
          return { success: true, data: result };
        }

        return result;
      } catch (error) {
        Logger.log(`[${contextName}] Error: ${error}`);

        if (returnError) {
          if (error instanceof AppError) {
            return error.toJSON();
          }
          return {
            success: false,
            error: error.toString(),
            code: 'UNKNOWN_ERROR'
          };
        }

        throw error;
      }
    };
  },

  /**
   * Execute a function with error handling and return standardized result
   * @param {Function} fn - Function to execute
   * @param {string} contextName - Context name for logging
   * @returns {Object} Result object { success, data?, error?, code? }
   */
  execute(fn, contextName) {
    try {
      const result = fn();
      Logger.log(`[${contextName}] Success`);
      return { success: true, data: result };
    } catch (error) {
      Logger.log(`[${contextName}] Error: ${error}`);

      if (error instanceof AppError) {
        return error.toJSON();
      }

      return {
        success: false,
        error: error.toString(),
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  /**
   * Execute an async function with error handling and return standardized result
   * @param {Function} fn - Async function to execute
   * @param {string} contextName - Context name for logging
   * @returns {Promise<Object>} Result object { success, data?, error?, code? }
   */
  async executeAsync(fn, contextName) {
    try {
      const result = await fn();
      Logger.log(`[${contextName}] Success`);
      return { success: true, data: result };
    } catch (error) {
      Logger.log(`[${contextName}] Error: ${error}`);

      if (error instanceof AppError) {
        return error.toJSON();
      }

      return {
        success: false,
        error: error.toString(),
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  /**
   * Log an error with consistent formatting
   * @param {string} context - Context where error occurred
   * @param {Error|string} error - Error object or message
   * @param {Object} details - Additional details
   */
  logError(context, error, details = {}) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : '';

    Logger.log(`[ERROR] ${context}: ${errorMessage}`);

    if (Object.keys(details).length > 0) {
      Logger.log(`[ERROR] Details: ${JSON.stringify(details)}`);
    }

    if (errorStack && CONFIG.DEBUG && CONFIG.DEBUG.ENABLED) {
      Logger.log(`[ERROR] Stack: ${errorStack}`);
    }
  },

  /**
   * Create a standardized error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Additional details
   * @returns {Object} Error response object
   */
  createErrorResponse(message, code = 'ERROR', details = {}) {
    return {
      success: false,
      error: message,
      code: code,
      details: details,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Create a standardized success response
   * @param {*} data - Success data
   * @param {string} message - Optional success message
   * @returns {Object} Success response object
   */
  createSuccessResponse(data, message = null) {
    const response = {
      success: true,
      data: data
    };

    if (message) {
      response.message = message;
    }

    return response;
  }
};

/**
 * Error Codes - Standard error codes used throughout the application
 */
const ErrorCodes = {
  // Authentication Errors
  AUTH_FAILED: 'AUTH_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Data Errors
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DATA_CORRUPTED: 'DATA_CORRUPTED',

  // Tool Errors
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  TOOL_LOCKED: 'TOOL_LOCKED',
  TOOL_NOT_ACCESSIBLE: 'TOOL_NOT_ACCESSIBLE',

  // Sheet Errors
  SHEET_NOT_FOUND: 'SHEET_NOT_FOUND',
  SHEET_READ_ERROR: 'SHEET_READ_ERROR',
  SHEET_WRITE_ERROR: 'SHEET_WRITE_ERROR',

  // General Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
  TIMEOUT: 'TIMEOUT'
};
