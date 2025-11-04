/**
 * ToolRegistry.js - Central registry for all tools
 *
 * Tools register themselves at startup.
 * Framework queries registry to discover and route to tools.
 */

const ToolRegistry = {
  // Storage for registered tools
  _tools: {},

  /**
   * Register a tool in the registry
   * @param {string} toolId - Unique tool identifier (e.g., 'tool1')
   * @param {Object} toolModule - The tool implementation
   * @param {Object} manifest - Tool manifest configuration
   * @returns {Object} Registration result
   */
  register(toolId, toolModule, manifest) {
    try {
      // Validate tool implements ToolInterface
      const validation = ToolInterface.validate(toolModule);

      if (!validation.valid) {
        console.error(`Tool registration failed for ${toolId}:`, validation.errors);
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Validate manifest
      const manifestValidation = this._validateManifest(manifest);
      if (!manifestValidation.valid) {
        console.error(`Manifest validation failed for ${toolId}:`, manifestValidation.errors);
        return {
          success: false,
          errors: manifestValidation.errors
        };
      }

      // Register the tool
      this._tools[toolId] = {
        id: toolId,
        module: toolModule,
        manifest: manifest,
        registeredAt: new Date(),
        optionalMethods: validation.optionalMethods
      };

      console.log(`✅ Tool registered: ${toolId} (${manifest.name})`);

      return {
        success: true,
        toolId: toolId,
        optionalMethods: validation.optionalMethods
      };

    } catch (error) {
      console.error(`Error registering tool ${toolId}:`, error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Get a registered tool by ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Tool registration object or null
   */
  get(toolId) {
    return this._tools[toolId] || null;
  },

  /**
   * Get all registered tools
   * @returns {Array<Object>} Array of tool registrations
   */
  getAllTools() {
    return Object.values(this._tools);
  },

  /**
   * Get tool IDs in registration order
   * @returns {Array<string>} Array of tool IDs
   */
  getToolIds() {
    return Object.keys(this._tools);
  },

  /**
   * Check if a tool is registered
   * @param {string} toolId - Tool identifier
   * @returns {boolean} True if registered
   */
  isRegistered(toolId) {
    return toolId in this._tools;
  },

  /**
   * Find tool by route
   * @param {string} route - URL route (e.g., '/tool1', '/orientation')
   * @returns {Object|null} Tool registration or null
   */
  findByRoute(route) {
    // Normalize route
    const normalizedRoute = route.startsWith('/') ? route : '/' + route;

    for (const tool of Object.values(this._tools)) {
      const routes = tool.manifest.routes || [];

      if (routes.includes(normalizedRoute)) {
        return tool;
      }

      // Check if tool ID matches
      if (normalizedRoute === `/${tool.id}`) {
        return tool;
      }
    }

    return null;
  },

  /**
   * Get tools by pattern type
   * @param {string} pattern - Pattern type (e.g., 'form', 'calculator')
   * @returns {Array<Object>} Matching tools
   */
  getToolsByPattern(pattern) {
    return Object.values(this._tools)
      .filter(tool => tool.manifest.pattern === pattern);
  },

  /**
   * Get tool count
   * @returns {number} Number of registered tools
   */
  count() {
    return Object.keys(this._tools).length;
  },

  /**
   * Unregister a tool (useful for testing)
   * @param {string} toolId - Tool identifier
   * @returns {boolean} True if unregistered
   */
  unregister(toolId) {
    if (toolId in this._tools) {
      delete this._tools[toolId];
      console.log(`Tool unregistered: ${toolId}`);
      return true;
    }
    return false;
  },

  /**
   * Clear all registrations (useful for testing)
   */
  clearAll() {
    this._tools = {};
    console.log('All tool registrations cleared');
  },

  /**
   * Get registry statistics
   * @returns {Object} Statistics about registered tools
   */
  getStats() {
    const tools = Object.values(this._tools);

    return {
      totalTools: tools.length,
      byPattern: this._groupBy(tools, tool => tool.manifest.pattern),
      byStatus: this._groupBy(tools, tool => tool.manifest.status || 'unknown'),
      registrationOrder: tools.map(t => ({ id: t.id, name: t.manifest.name }))
    };
  },

  /**
   * Validate tool manifest
   * @private
   */
  _validateManifest(manifest) {
    const errors = [];
    const required = ['id', 'name', 'version', 'pattern'];

    required.forEach(field => {
      if (!manifest[field]) {
        errors.push(`Manifest missing required field: ${field}`);
      }
    });

    // Validate pattern is recognized
    const validPatterns = ['form', 'adaptive-form', 'calculator', 'multi-phase'];
    if (manifest.pattern && !validPatterns.includes(manifest.pattern)) {
      errors.push(`Invalid pattern: ${manifest.pattern}. Must be one of: ${validPatterns.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Group array by key
   * @private
   */
  _groupBy(array, keyFn) {
    return array.reduce((result, item) => {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    }, {});
  },

  /**
   * Debug: Print registry contents
   */
  debug() {
    console.log('=== Tool Registry Debug ===');
    console.log(`Total tools: ${this.count()}`);

    Object.values(this._tools).forEach(tool => {
      console.log(`\n📦 ${tool.id}`);
      console.log(`   Name: ${tool.manifest.name}`);
      console.log(`   Pattern: ${tool.manifest.pattern}`);
      console.log(`   Routes: ${(tool.manifest.routes || []).join(', ')}`);
      console.log(`   Optional methods: ${tool.optionalMethods.join(', ')}`);
    });

    console.log('\n=========================');
  }
};
