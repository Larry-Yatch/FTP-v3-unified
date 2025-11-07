/**
 * Validator - Input validation utilities
 * Provides centralized validation for common data types and patterns
 */

const Validator = {
  /**
   * Validate that a value is a non-empty string
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @throws {AppError} If validation fails
   * @returns {string} Trimmed string value
   */
  requireString(value, fieldName) {
    if (value === null || value === undefined) {
      throw new AppError(
        `${fieldName} is required`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, reason: 'null_or_undefined' }
      );
    }

    if (typeof value !== 'string') {
      throw new AppError(
        `${fieldName} must be a string`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, type: typeof value }
      );
    }

    const trimmed = value.trim();
    if (trimmed === '') {
      throw new AppError(
        `${fieldName} cannot be empty`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName }
      );
    }

    return trimmed;
  },

  /**
   * Validate that a value is a valid number
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @param {Object} options - Options { min, max, allowNaN }
   * @throws {AppError} If validation fails
   * @returns {number} Number value
   */
  requireNumber(value, fieldName, options = {}) {
    const { min = null, max = null, allowNaN = false } = options;

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (typeof num !== 'number' || (!allowNaN && isNaN(num))) {
      throw new AppError(
        `${fieldName} must be a valid number`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, value }
      );
    }

    if (min !== null && num < min) {
      throw new AppError(
        `${fieldName} must be at least ${min}`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, value: num, min }
      );
    }

    if (max !== null && num > max) {
      throw new AppError(
        `${fieldName} must be at most ${max}`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, value: num, max }
      );
    }

    return num;
  },

  /**
   * Validate that a value is a valid integer
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @param {Object} options - Options { min, max }
   * @throws {AppError} If validation fails
   * @returns {number} Integer value
   */
  requireInteger(value, fieldName, options = {}) {
    const num = this.requireNumber(value, fieldName, options);

    if (!Number.isInteger(num)) {
      throw new AppError(
        `${fieldName} must be an integer`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, value: num }
      );
    }

    return num;
  },

  /**
   * Validate that a value is an object
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @throws {AppError} If validation fails
   * @returns {Object} Object value
   */
  requireObject(value, fieldName) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new AppError(
        `${fieldName} must be an object`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, type: typeof value }
      );
    }

    return value;
  },

  /**
   * Validate that a value is an array
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @param {Object} options - Options { minLength, maxLength }
   * @throws {AppError} If validation fails
   * @returns {Array} Array value
   */
  requireArray(value, fieldName, options = {}) {
    const { minLength = null, maxLength = null } = options;

    if (!Array.isArray(value)) {
      throw new AppError(
        `${fieldName} must be an array`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, type: typeof value }
      );
    }

    if (minLength !== null && value.length < minLength) {
      throw new AppError(
        `${fieldName} must have at least ${minLength} items`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, length: value.length, minLength }
      );
    }

    if (maxLength !== null && value.length > maxLength) {
      throw new AppError(
        `${fieldName} must have at most ${maxLength} items`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, length: value.length, maxLength }
      );
    }

    return value;
  },

  /**
   * Validate that a value is a boolean
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @throws {AppError} If validation fails
   * @returns {boolean} Boolean value
   */
  requireBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
      throw new AppError(
        `${fieldName} must be a boolean`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, type: typeof value }
      );
    }

    return value;
  },

  /**
   * Validate that a toolId is valid
   * @param {string} toolId - Tool ID to validate
   * @throws {AppError} If validation fails
   * @returns {string} Valid tool ID
   */
  validateToolId(toolId) {
    const validToolIds = Object.values(CONFIG.TOOLS).map(t => t.ID);

    const trimmed = this.requireString(toolId, 'toolId');

    if (!validToolIds.includes(trimmed)) {
      throw new AppError(
        `Invalid toolId: ${trimmed}`,
        ErrorCodes.TOOL_NOT_FOUND,
        { toolId: trimmed, validToolIds }
      );
    }

    return trimmed;
  },

  /**
   * Validate that a clientId is valid
   * @param {string} clientId - Client ID to validate
   * @throws {AppError} If validation fails
   * @returns {string} Valid client ID
   */
  validateClientId(clientId) {
    const trimmed = this.requireString(clientId, 'clientId');

    // Additional validation: Check if client exists in Students sheet
    // This can be added later if needed

    return trimmed;
  },

  /**
   * Validate that a page number is valid for a tool
   * @param {number} page - Page number to validate
   * @param {string} toolId - Tool ID
   * @throws {AppError} If validation fails
   * @returns {number} Valid page number
   */
  validatePage(page, toolId) {
    const pageNum = this.requireInteger(page, 'page', { min: 1 });

    // Get tool configuration
    const tool = Object.values(CONFIG.TOOLS).find(t => t.ID === toolId);

    if (tool && pageNum > tool.PAGES) {
      throw new AppError(
        `Invalid page ${pageNum} for ${toolId}. Max pages: ${tool.PAGES}`,
        ErrorCodes.INVALID_INPUT,
        { page: pageNum, toolId, maxPages: tool.PAGES }
      );
    }

    return pageNum;
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @param {string} fieldName - Field name for error messages
   * @throws {AppError} If validation fails
   * @returns {string} Valid email
   */
  validateEmail(email, fieldName = 'email') {
    const trimmed = this.requireString(email, fieldName);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      throw new AppError(
        `${fieldName} must be a valid email address`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, value: trimmed }
      );
    }

    return trimmed.toLowerCase();
  },

  /**
   * Validate that a value is one of allowed options
   * @param {*} value - Value to validate
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} fieldName - Field name for error messages
   * @throws {AppError} If validation fails
   * @returns {*} Valid value
   */
  requireOneOf(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
      throw new AppError(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        ErrorCodes.INVALID_INPUT,
        { field: fieldName, value, allowedValues }
      );
    }

    return value;
  },

  /**
   * Validate status value
   * @param {string} status - Status to validate
   * @throws {AppError} If validation fails
   * @returns {string} Valid status
   */
  validateStatus(status) {
    const validStatuses = ['DRAFT', 'EDIT_DRAFT', 'COMPLETED', 'PENDING', 'ARCHIVED'];
    return this.requireOneOf(status, validStatuses, 'status');
  },

  /**
   * Check if a value is optional and return default if not provided
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value if not provided
   * @param {Function} validator - Validator function to apply if value is provided
   * @returns {*} Value or default
   */
  optional(value, defaultValue, validator = null) {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }

    if (validator) {
      return validator(value);
    }

    return value;
  }
};
