/**
 * FrameworkCore.js - Core framework logic
 *
 * Generic tool lifecycle management.
 * Works with ANY tool that implements ToolInterface.
 * NO tool-specific code here!
 */

const FrameworkCore = {

  /**
   * Initialize a tool with dependencies and insights
   * @param {string} toolId - Tool identifier
   * @param {string} clientId - Client/student ID
   * @returns {Object} Initialization result
   */
  initializeTool(toolId, clientId) {
    try {
      console.log(`FrameworkCore: Initializing ${toolId} for ${clientId}`);

      // Get tool from registry
      const toolReg = ToolRegistry.get(toolId);
      if (!toolReg) {
        return {
          success: false,
          error: `Tool not found: ${toolId}`
        };
      }

      // Check access
      const access = ToolAccessControl.canAccessTool(clientId, toolId);
      if (!access.allowed) {
        return {
          success: false,
          error: access.reason,
          accessDenied: true
        };
      }

      // Get relevant insights
      const insightsResult = InsightsPipeline.prepareToolLaunch(toolId, clientId);
      const insights = insightsResult.insights || [];

      // Prepare dependencies
      const dependencies = {
        dataService: DataService,
        accessControl: ToolAccessControl,
        insightsPipeline: InsightsPipeline,
        config: CONFIG
      };

      // Call tool's initialize method if it exists (optional)
      if (typeof toolReg.module.initialize === 'function') {
        const initResult = toolReg.module.initialize(dependencies, insights);

        if (!initResult.success) {
          return initResult;
        }
      }

      // Apply adaptations if tool supports it
      let adaptations = null;
      if (typeof toolReg.module.adaptBasedOnInsights === 'function') {
        adaptations = toolReg.module.adaptBasedOnInsights(insights);
      } else {
        // Use pipeline's default adaptation
        adaptations = InsightsPipeline.adaptToolForInsights(toolId, insights);
      }

      return {
        success: true,
        toolConfig: toolReg.manifest,
        insights: insights,
        adaptations: adaptations,
        insightCount: insights.length
      };

    } catch (error) {
      console.error(`Error initializing tool ${toolId}:`, error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Process tool submission
   * @param {string} toolId - Tool identifier
   * @param {string} clientId - Client/student ID
   * @param {Object} data - Form data
   * @returns {Object} Processing result
   */
  processToolSubmission(toolId, clientId, data) {
    try {
      console.log(`FrameworkCore: Processing submission for ${toolId} / ${clientId}`);

      // Get tool from registry
      const toolReg = ToolRegistry.get(toolId);
      if (!toolReg) {
        return {
          success: false,
          error: `Tool not found: ${toolId}`
        };
      }

      // Validate data using tool's validator
      const validation = toolReg.module.validate(data);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          validationFailed: true
        };
      }

      // Call onSave hook if exists
      let processData = data;
      if (typeof toolReg.module.onSave === 'function') {
        const onSaveResult = toolReg.module.onSave(data);
        if (onSaveResult.data) {
          processData = onSaveResult.data;
        }
      }

      // Process using tool's processor
      const processResult = toolReg.module.process(clientId, processData);
      if (!processResult.success) {
        return processResult;
      }

      // Save to data service
      const saveResult = DataService.saveToolResponse(clientId, toolId, processData);
      if (!saveResult.success) {
        return saveResult;
      }

      // Generate insights using tool's insight generator
      const insights = toolReg.module.generateInsights(processData, clientId);

      // Process insights through pipeline
      const insightsResult = InsightsPipeline.processToolCompletion(
        toolId,
        clientId,
        processData
      );

      // Call onComplete hook if exists
      if (typeof toolReg.module.onComplete === 'function') {
        toolReg.module.onComplete(clientId, processResult);
      }

      // Determine next tool
      const nextTool = this.getNextTool(clientId, toolId);

      return {
        success: true,
        result: processResult.result,
        insights: insights,
        insightsGenerated: insightsResult.insightsGenerated,
        nextTool: nextTool,
        message: `${toolId} completed successfully`
      };

    } catch (error) {
      console.error(`Error processing submission for ${toolId}:`, error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Get next recommended tool
   * @param {string} clientId - Client/student ID
   * @param {string} currentToolId - Just completed tool
   * @returns {string|null} Next tool ID or null
   */
  getNextTool(clientId, currentToolId) {
    try {
      const toolNumber = parseInt(currentToolId.replace('tool', ''));
      const nextToolId = 'tool' + (toolNumber + 1);

      // Check if next tool exists in registry
      if (ToolRegistry.isRegistered(nextToolId)) {
        // Check if accessible
        const access = ToolAccessControl.canAccessTool(clientId, nextToolId);
        if (access.allowed) {
          return nextToolId;
        }
      }

      return null;

    } catch (error) {
      console.error('Error getting next tool:', error);
      return null;
    }
  },

  /**
   * Get tool progress
   * @param {string} toolId - Tool identifier
   * @param {string} clientId - Client/student ID
   * @param {Object} currentData - Current form data
   * @returns {Object} Progress information
   */
  getToolProgress(toolId, clientId, currentData) {
    try {
      const toolReg = ToolRegistry.get(toolId);
      if (!toolReg) {
        return { percent: 0, section: 'unknown' };
      }

      // If tool has getProgress method, use it
      if (typeof toolReg.module.getProgress === 'function') {
        return toolReg.module.getProgress(currentData);
      }

      // Default: Calculate based on filled fields
      const fields = Object.keys(currentData);
      const totalFields = fields.length;
      const filledFields = fields.filter(key => {
        const value = currentData[key];
        return value !== null && value !== undefined && value !== '';
      }).length;

      return {
        percent: totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0,
        section: 'general'
      };

    } catch (error) {
      console.error('Error getting tool progress:', error);
      return { percent: 0, section: 'error' };
    }
  }
};
