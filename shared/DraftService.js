/**
 * DraftService - Shared utility for managing tool drafts via PropertiesService
 * Provides centralized draft storage and retrieval for all tools
 */

const DraftService = {
  /**
   * Get the draft key for a tool and client
   * @param {string} toolId - Tool ID (tool1, tool2, etc.)
   * @param {string} clientId - Client ID
   * @returns {string} The draft key
   */
  getDraftKey(toolId, clientId) {
    return `${toolId}_draft_${clientId}`;
  },

  /**
   * Save page data to draft storage
   * @param {string} toolId - Tool ID
   * @param {string} clientId - Client ID
   * @param {number} page - Current page number
   * @param {Object} formData - Form data to save
   * @param {Array<string>} excludeKeys - Keys to exclude from saving (default: ['route', 'client', 'page'])
   */
  saveDraft(toolId, clientId, page, formData, excludeKeys = ['route', 'client', 'page']) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = this.getDraftKey(toolId, clientId);

      // Get existing draft or create new
      let draftData = this.getDraft(toolId, clientId) || {};

      // Merge new page data
      for (const key in formData) {
        if (!excludeKeys.includes(key)) {
          draftData[key] = formData[key];
        }
      }

      // Save metadata
      draftData.lastPage = page;
      draftData.lastUpdate = new Date().toISOString();

      // Store updated draft
      userProperties.setProperty(draftKey, JSON.stringify(draftData));

      Logger.log(`[DraftService] Saved ${toolId} page ${page} data for ${clientId}`);
      return { success: true };
    } catch (error) {
      Logger.log(`[DraftService] Error saving draft: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Get draft data for a client and tool
   * @param {string} toolId - Tool ID
   * @param {string} clientId - Client ID
   * @returns {Object|null} Draft data or null if not found
   */
  getDraft(toolId, clientId) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = this.getDraftKey(toolId, clientId);
      const draftData = userProperties.getProperty(draftKey);

      if (draftData) {
        try {
          const parsed = JSON.parse(draftData);
          Logger.log(`[DraftService] Found draft for ${clientId} on ${toolId}`);
          return parsed;
        } catch (parseError) {
          Logger.log(`[DraftService] Error parsing draft, returning null: ${parseError}`);
          return null;
        }
      }

      return null;
    } catch (error) {
      Logger.log(`[DraftService] Error getting draft: ${error}`);
      return null;
    }
  },

  /**
   * Clear/delete a draft
   * @param {string} toolId - Tool ID
   * @param {string} clientId - Client ID
   * @returns {Object} Success result
   */
  clearDraft(toolId, clientId) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = this.getDraftKey(toolId, clientId);
      userProperties.deleteProperty(draftKey);

      Logger.log(`[DraftService] Cleared draft for ${clientId} on ${toolId}`);
      return { success: true };
    } catch (error) {
      Logger.log(`[DraftService] Error clearing draft: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Check if a draft exists
   * @param {string} toolId - Tool ID
   * @param {string} clientId - Client ID
   * @returns {boolean} True if draft exists
   */
  hasDraft(toolId, clientId) {
    const draft = this.getDraft(toolId, clientId);
    return draft !== null;
  },

  /**
   * Get all drafts for a client (across all tools)
   * @param {string} clientId - Client ID
   * @returns {Object} Map of toolId -> draft data
   */
  getAllDrafts(clientId) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const allProps = userProperties.getProperties();
      const drafts = {};

      // Search for all draft keys matching this client
      for (const key in allProps) {
        if (key.endsWith(`_draft_${clientId}`)) {
          const toolId = key.replace(`_draft_${clientId}`, '');
          try {
            drafts[toolId] = JSON.parse(allProps[key]);
          } catch (parseError) {
            Logger.log(`[DraftService] Error parsing draft for ${toolId}: ${parseError}`);
          }
        }
      }

      return drafts;
    } catch (error) {
      Logger.log(`[DraftService] Error getting all drafts: ${error}`);
      return {};
    }
  },

  /**
   * Merge draft with edit data (for edit mode)
   * Prioritizes session draft data over edit draft data
   * @param {Object} editData - Data from EDIT_DRAFT
   * @param {string} toolId - Tool ID
   * @param {string} clientId - Client ID
   * @returns {Object} Merged data
   */
  mergeWithEditData(editData, toolId, clientId) {
    const sessionDraft = this.getDraft(toolId, clientId);

    if (sessionDraft) {
      Logger.log(`[DraftService] Merging EDIT_DRAFT with session updates for ${clientId}`);
      return Object.assign({}, editData, sessionDraft);
    }

    return editData;
  }
};
