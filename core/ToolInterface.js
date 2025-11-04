/**
 * ToolInterface - Standard interface that ALL tools must implement
 *
 * This is the contract between the framework and individual tools.
 * Every tool module must implement these required methods.
 */

const ToolInterface = {

  /**
   * Required methods that every tool MUST implement
   */
  REQUIRED_METHODS: [
    'initialize',          // Setup tool with dependencies and insights
    'validate',            // Validate form data
    'process',             // Process tool submission
    'generateInsights',    // Generate insights for other tools
    'getConfig'            // Return tool configuration
  ],

  /**
   * Optional methods that tools CAN implement based on their needs
   */
  OPTIONAL_METHODS: [
    'adaptBasedOnInsights',  // Adapt questions based on previous tool insights
    'onLoad',                // Called when tool first loads
    'onSave',                // Called before saving data
    'onComplete',            // Called after successful completion
    'getProgress',           // Return current completion progress
    'getDraft',              // Get saved draft data
    'saveDraft'              // Save draft data
  ],

  /**
   * Validate that a tool implementation meets the interface requirements
   * @param {Object} toolModule - The tool module to validate
   * @returns {Object} Validation result
   */
  validate(toolModule) {
    const errors = [];

    // Check required methods
    this.REQUIRED_METHODS.forEach(method => {
      if (typeof toolModule[method] !== 'function') {
        errors.push(`Missing required method: ${method}`);
      }
    });

    // Check if module has an ID
    if (!toolModule.id) {
      errors.push('Tool must have an "id" property');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      optionalMethods: this.OPTIONAL_METHODS.filter(
        method => typeof toolModule[method] === 'function'
      )
    };
  },

  /**
   * Get method signature documentation
   */
  getMethodSignatures() {
    return {
      // REQUIRED METHODS

      /**
       * Initialize tool with dependencies and previous insights
       * @param {Object} dependencies - Framework services (dataService, etc.)
       * @param {Array} previousInsights - Insights from completed tools
       * @returns {Object} { success: boolean, error?: string }
       */
      initialize: function(dependencies, previousInsights) {},

      /**
       * Validate tool submission data
       * @param {Object} data - Form data to validate
       * @returns {Object} { valid: boolean, errors: Array<string> }
       */
      validate: function(data) {},

      /**
       * Process tool submission
       * @param {string} clientId - Client/student ID
       * @param {Object} data - Validated form data
       * @returns {Object} { success: boolean, result: any, error?: string }
       */
      process: function(clientId, data) {},

      /**
       * Generate insights for other tools
       * @param {Object} data - Submitted form data
       * @param {string} clientId - Client/student ID
       * @returns {Array<Object>} Array of insight objects
       */
      generateInsights: function(data, clientId) {},

      /**
       * Get tool configuration/manifest
       * @returns {Object} Tool manifest
       */
      getConfig: function() {},

      // OPTIONAL METHODS

      /**
       * Adapt tool based on insights from previous tools
       * @param {Array} insights - Relevant insights
       * @returns {Object} Adaptations to apply
       */
      adaptBasedOnInsights: function(insights) {},

      /**
       * Called when tool first loads
       * @param {string} clientId - Client/student ID
       * @returns {Object} Initial state/data
       */
      onLoad: function(clientId) {},

      /**
       * Called before saving data (for validation/transformation)
       * @param {Object} data - Data about to be saved
       * @returns {Object} Modified data or validation result
       */
      onSave: function(data) {},

      /**
       * Called after successful completion
       * @param {string} clientId - Client/student ID
       * @param {Object} result - Process result
       * @returns {void}
       */
      onComplete: function(clientId, result) {},

      /**
       * Get current completion progress
       * @param {Object} data - Current form data
       * @returns {Object} { percent: number, section: string }
       */
      getProgress: function(data) {},

      /**
       * Get saved draft for this tool
       * @param {string} clientId - Client/student ID
       * @returns {Object|null} Draft data or null
       */
      getDraft: function(clientId) {},

      /**
       * Save draft data
       * @param {string} clientId - Client/student ID
       * @param {Object} data - Draft data to save
       * @returns {Object} { success: boolean }
       */
      saveDraft: function(clientId, data) {}
    };
  }
};
