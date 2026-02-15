/**
 * InsightsPipeline.js - Configuration-Driven Cross-Tool Intelligence
 *
 * Uses InsightMappings sheet as the source of truth for:
 * - What insights each tool generates
 * - What conditions trigger insights
 * - How insights affect downstream tools
 *
 * This is the CORE of cross-tool intelligence in v3.
 */

const InsightsPipeline = {

  /**
   * Process tool completion and generate insights based on configuration
   * @param {string} toolId - Tool that was completed
   * @param {string} clientId - Client/student ID
   * @param {Object} responseData - Tool response data
   * @returns {Object} Processing result with insights
   */
  processToolCompletion(toolId, clientId, responseData) {
    try {
      console.log(`InsightsPipeline: Processing ${toolId} completion for ${clientId}`);

      // 1. Archive old insights from this tool (new submission = fresh insights)
      this.archiveOldInsights(clientId, toolId);

      // 2. Get insight mappings for this tool from configuration
      const mappings = this.getInsightMappings(toolId);
      console.log(`Found ${mappings.length} insight mappings for ${toolId}`);

      // 3. Evaluate each mapping condition against response data
      const triggeredInsights = [];
      mappings.forEach(mapping => {
        if (this.evaluateCondition(mapping.Condition_Logic, responseData)) {
          const insight = this.createInsightFromMapping(mapping, responseData, clientId, toolId);
          triggeredInsights.push(insight);
        }
      });

      console.log(`Generated ${triggeredInsights.length} insights`);

      // 4. Save triggered insights to CrossToolInsights sheet
      if (triggeredInsights.length > 0) {
        this.saveInsights(clientId, toolId, triggeredInsights);
      }

      return {
        success: true,
        insightsGenerated: triggeredInsights.length,
        insights: triggeredInsights
      };

    } catch (error) {
      console.error('Error processing tool completion:', error);
      return {
        success: false,
        error: error.toString(),
        insightsGenerated: 0
      };
    }
  },

  /**
   * Prepare tool launch with relevant insights
   * @param {string} toolId - Tool being launched
   * @param {string} clientId - Client/student ID
   * @returns {Object} Insights and adaptations
   */
  prepareToolLaunch(toolId, clientId) {
    try {
      console.log(`InsightsPipeline: Preparing ${toolId} for ${clientId}`);

      // Get all insights relevant to this tool
      const insights = this.getRelevantInsights(clientId, toolId);

      console.log(`Found ${insights.length} relevant insights for ${toolId}`);

      return {
        success: true,
        insights: insights,
        insightCount: insights.length
      };

    } catch (error) {
      console.error('Error preparing tool launch:', error);
      return {
        success: false,
        error: error.toString(),
        insights: [],
        insightCount: 0
      };
    }
  },

  /**
   * Get insight mappings for a specific tool from configuration sheet
   * @param {string} toolId - Tool identifier
   * @returns {Array<Object>} Array of insight mappings
   */
  getInsightMappings(toolId) {
    try {
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.INSIGHT_MAPPINGS);
      if (!data || data.length < 2) return [];

      const headers = data[0];

      return data.slice(1)
        .filter(row => row[0] === toolId)  // Filter by Tool_ID
        .map(row => {
          try {
            return {
              Tool_ID: row[0],
              Insight_Type: row[1],
              Condition: row[2],
              Condition_Logic: JSON.parse(row[3] || '{}'),
              Priority: row[4],
              Content_Template: row[5],
              Target_Tools: JSON.parse(row[6] || '[]'),
              Adaptation_Type: row[7],
              Adaptation_Details: JSON.parse(row[8] || '{}')
            };
          } catch (parseError) {
            console.error(`Error parsing mapping row for ${toolId}:`, parseError);
            return null;
          }
        })
        .filter(mapping => mapping !== null);

    } catch (error) {
      console.error('Error getting insight mappings:', error);
      return [];
    }
  },

  /**
   * Evaluate if a condition is met based on response data
   * @param {Object} conditionLogic - Condition configuration
   * @param {Object} responseData - Tool response data
   * @returns {boolean} True if condition met
   */
  evaluateCondition(conditionLogic, responseData) {
    try {
      const field = conditionLogic.field;
      const operator = conditionLogic.operator;
      const value = conditionLogic.value;

      const actualValue = responseData[field];

      // Handle missing field
      if (actualValue === undefined || actualValue === null) {
        return false;
      }

      switch (operator) {
        case '>=':
          return Number(actualValue) >= Number(value);
        case '>':
          return Number(actualValue) > Number(value);
        case '<':
          return Number(actualValue) < Number(value);
        case '<=':
          return Number(actualValue) <= Number(value);
        case '==':
          return actualValue == value;
        case '===':
          return actualValue === value;
        case '!=':
          return actualValue != value;
        case 'includes':
          return actualValue && String(actualValue).includes(value);
        case 'startsWith':
          return actualValue && String(actualValue).startsWith(value);
        case 'endsWith':
          return actualValue && String(actualValue).endsWith(value);
        default:
          console.warn(`Unknown operator: ${operator}`);
          return false;
      }
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  },

  /**
   * Create insight object from mapping template
   * @param {Object} mapping - Insight mapping configuration
   * @param {Object} responseData - Tool response data
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Source tool ID
   * @returns {Object} Insight object
   */
  createInsightFromMapping(mapping, responseData, clientId, toolId) {
    // Replace placeholders in content template
    let content = mapping.Content_Template;

    Object.keys(responseData).forEach(key => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      content = content.replace(placeholder, responseData[key]);
    });

    return {
      timestamp: new Date(),
      clientId: clientId,
      sourceTool: toolId,
      insightType: mapping.Insight_Type,
      priority: mapping.Priority,
      content: content,
      targetTools: mapping.Target_Tools,
      conditionData: {
        field: mapping.Condition_Logic.field,
        value: responseData[mapping.Condition_Logic.field],
        operator: mapping.Condition_Logic.operator
      },
      adaptationType: mapping.Adaptation_Type,
      adaptationDetails: mapping.Adaptation_Details,
      status: 'active'
    };
  },

  /**
   * Save insights to CrossToolInsights sheet
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Source tool ID
   * @param {Array<Object>} insights - Insights to save
   */
  saveInsights(clientId, toolId, insights) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.CROSS_TOOL_INSIGHTS);

      if (!sheet) {
        console.error('CrossToolInsights sheet not found');
        return;
      }

      insights.forEach(insight => {
        sheet.appendRow([
          insight.timestamp,
          insight.clientId,
          insight.sourceTool,
          insight.insightType,
          insight.priority,
          insight.content,
          JSON.stringify(insight.targetTools),
          JSON.stringify(insight.conditionData),
          insight.status
        ]);
      });

      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.CROSS_TOOL_INSIGHTS);
      console.log(`Saved ${insights.length} insights to CrossToolInsights`);

    } catch (error) {
      console.error('Error saving insights:', error);
    }
  },

  /**
   * Get relevant insights for a tool launch
   * @param {string} clientId - Client/student ID
   * @param {string} targetTool - Tool being launched
   * @returns {Array<Object>} Relevant insights
   */
  getRelevantInsights(clientId, targetTool) {
    try {
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.CROSS_TOOL_INSIGHTS);
      if (!data || data.length < 2) return [];

      const insights = data.slice(1)  // Skip headers
        .filter(row => {
          const rowClientId = row[1];
          const targetTools = JSON.parse(row[6] || '[]');
          const status = row[8];

          return rowClientId === clientId &&
                 targetTools.includes(targetTool) &&
                 status === 'active';
        })
        .map(row => ({
          timestamp: row[0],
          clientId: row[1],
          sourceTool: row[2],
          insightType: row[3],
          priority: row[4],
          content: row[5],
          targetTools: JSON.parse(row[6]),
          conditionData: JSON.parse(row[7]),
          status: row[8]
        }));

      // Sort by priority: CRITICAL > HIGH > MEDIUM > LOW
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      insights.sort((a, b) => {
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      return insights;

    } catch (error) {
      console.error('Error getting relevant insights:', error);
      return [];
    }
  },

  /**
   * Archive old insights when new submission happens
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool ID
   */
  archiveOldInsights(clientId, toolId) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.CROSS_TOOL_INSIGHTS);

      if (!sheet) return;

      const data = sheet.getDataRange().getValues();

      // Find and archive old insights from this tool for this client
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === clientId && data[i][2] === toolId && data[i][8] === 'active') {
          sheet.getRange(i + 1, 9).setValue('archived');  // Column 9 is Status
        }
      }

      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.CROSS_TOOL_INSIGHTS);
      console.log(`Archived old insights for ${clientId} / ${toolId}`);

    } catch (error) {
      console.error('Error archiving insights:', error);
    }
  },

  /**
   * Apply insights to adapt tool configuration
   * @param {string} toolId - Tool being adapted
   * @param {Array<Object>} insights - Relevant insights
   * @returns {Object} Adaptations to apply
   */
  adaptToolForInsights(toolId, insights) {
    const adaptations = {
      sectionsToEmphasize: [],
      questionsToAdd: [],
      questionsToSkip: [],
      customGuidance: []
    };

    insights.forEach(insight => {
      // Get the mapping details from the insight
      const adaptationType = insight.adaptationType;
      const adaptationDetails = insight.adaptationDetails;

      if (!adaptationType || !adaptationDetails) return;

      switch (adaptationType) {
        case 'emphasize_section':
          if (adaptationDetails.section) {
            adaptations.sectionsToEmphasize.push(adaptationDetails.section);
          }
          break;

        case 'add_questions':
          if (Array.isArray(adaptationDetails.questions)) {
            adaptations.questionsToAdd.push(...adaptationDetails.questions);
          }
          break;

        case 'skip_questions':
          if (Array.isArray(adaptationDetails.skip)) {
            adaptations.questionsToSkip.push(...adaptationDetails.skip);
          }
          break;

        case 'custom_guidance':
          adaptations.customGuidance.push({
            section: adaptationDetails.section,
            message: this._replacePlaceholders(
              adaptationDetails.message,
              insight.conditionData
            )
          });
          break;
      }
    });

    return adaptations;
  },

  /**
   * Replace placeholders in string
   * @private
   */
  _replacePlaceholders(text, data) {
    let result = text;
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(placeholder, data[key]);
    });
    return result;
  }
};
