/**
 * DataService.js - Data persistence layer for v3
 *
 * Handles all interactions with Google Sheets.
 * Clean interface for tool data storage and retrieval.
 *
 * Now integrated with ResponseManager for version control and editing.
 */

const DataService = {

  /**
   * Save tool response data
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {Object} data - Response data
   * @param {string} status - Status ('COMPLETED', 'DRAFT', 'EDIT_DRAFT')
   * @returns {Object} Save result
   */
  saveToolResponse(clientId, toolId, data, status = 'COMPLETED') {
    try {
      console.log(`DataService: Saving response for ${clientId} / ${toolId} with status ${status}`);

      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.RESPONSES);

      if (!sheet) {
        return { success: false, error: 'RESPONSES sheet not found' };
      }

      // Mark previous responses as not latest if this is COMPLETED
      if (status === 'COMPLETED' && typeof ResponseManager !== 'undefined') {
        ResponseManager._markAsNotLatest(clientId, toolId);
      }

      sheet.appendRow([
        new Date(),                // Timestamp
        clientId,                  // Client_ID
        toolId,                    // Tool_ID
        JSON.stringify(data),      // Data
        CONFIG.VERSION,            // Version
        status,                    // Status
        'true'                     // Is_Latest
      ]);

      // Update tool status only if COMPLETED
      if (status === 'COMPLETED') {
        this.updateToolStatus(clientId, toolId, 'completed');
      }

      return {
        success: true,
        message: `${toolId} response saved successfully`
      };

    } catch (error) {
      console.error('Error saving tool response:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Save draft response
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {Object} data - Draft data
   * @returns {Object} Save result
   */
  saveDraft(clientId, toolId, data) {
    return this.saveToolResponse(clientId, toolId, data, 'DRAFT');
  },

  /**
   * Get tool response for a client
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Response data or null
   */
  getToolResponse(clientId, toolId) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.RESPONSES);

      if (!sheet) return null;

      const data = sheet.getDataRange().getValues();

      // Find most recent response for this client/tool
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][1] === clientId && data[i][2] === toolId) {
          return {
            timestamp: data[i][0],
            clientId: data[i][1],
            toolId: data[i][2],
            data: JSON.parse(data[i][3] || '{}'),
            version: data[i][4],
            status: data[i][5]
          };
        }
      }

      return null;

    } catch (error) {
      console.error('Error getting tool response:', error);
      return null;
    }
  },

  /**
   * Update tool status
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {string} status - Status ('pending', 'in_progress', 'completed')
   * @returns {Object} Update result
   */
  updateToolStatus(clientId, toolId, status) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.TOOL_STATUS);

      if (!sheet) {
        return { success: false, error: 'TOOL_STATUS sheet not found' };
      }

      const data = sheet.getDataRange().getValues();

      // Find row for this client
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId) {
          rowIndex = i;
          break;
        }
      }

      // If not found, create new row
      if (rowIndex === -1) {
        const newRow = [clientId];
        // Add columns for 8 tools (Status + Date for each)
        for (let i = 1; i <= 8; i++) {
          newRow.push('', '');  // Status, Date
        }
        newRow.push(new Date());  // Last_Updated
        sheet.appendRow(newRow);
        rowIndex = sheet.getLastRow() - 1;
      }

      // Update status for this tool
      const toolNumber = parseInt(toolId.replace('tool', ''));
      const statusCol = 1 + (toolNumber - 1) * 2 + 1;  // Calculate column
      const dateCol = statusCol + 1;

      sheet.getRange(rowIndex + 1, statusCol).setValue(status);
      sheet.getRange(rowIndex + 1, dateCol).setValue(new Date());
      sheet.getRange(rowIndex + 1, sheet.getLastColumn()).setValue(new Date());  // Last_Updated

      return { success: true };

    } catch (error) {
      console.error('Error updating tool status:', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Get tool status for a client
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {string|null} Status or null
   */
  getToolStatus(clientId, toolId) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.TOOL_STATUS);

      if (!sheet) return null;

      const data = sheet.getDataRange().getValues();

      // Find row for this client
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId) {
          const toolNumber = parseInt(toolId.replace('tool', ''));
          const statusCol = 1 + (toolNumber - 1) * 2;
          return data[i][statusCol] || null;
        }
      }

      return null;

    } catch (error) {
      console.error('Error getting tool status:', error);
      return null;
    }
  },

  /**
   * Check if tool is completed
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {boolean} True if completed
   */
  isToolCompleted(clientId, toolId) {
    const status = this.getToolStatus(clientId, toolId);
    return status === 'completed';
  },

  /**
   * Save session
   * @param {string} sessionId - Session identifier
   * @param {string} clientId - Client/student ID
   * @param {Object} options - Session options
   * @returns {Object} Save result
   */
  saveSession(sessionId, clientId, options = {}) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.SESSIONS);

      if (!sheet) {
        return { success: false, error: 'SESSIONS sheet not found' };
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + (CONFIG.SESSION.DURATION_HOURS * 60 * 60 * 1000));

      sheet.appendRow([
        sessionId,
        clientId,
        now,
        expiresAt,
        now,  // Last_Activity
        options.ipAddress || 'unknown'
      ]);

      return { success: true, sessionId: sessionId };

    } catch (error) {
      console.error('Error saving session:', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Validate session
   * @param {string} sessionId - Session identifier
   * @returns {Object} Validation result
   */
  validateSession(sessionId) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.SESSIONS);

      if (!sheet) {
        return { valid: false, reason: 'Session storage unavailable' };
      }

      const data = sheet.getDataRange().getValues();

      // Find session (search from bottom up for latest)
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][0] === sessionId) {
          const expiresAt = new Date(data[i][3]);
          const now = new Date();

          if (expiresAt > now) {
            // Update last activity
            sheet.getRange(i + 1, 5).setValue(now);

            return {
              valid: true,
              clientId: data[i][1],
              sessionId: sessionId
            };
          } else {
            return { valid: false, reason: 'Session expired' };
          }
        }
      }

      return { valid: false, reason: 'Session not found' };

    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false, reason: error.toString() };
    }
  },

  /**
   * Log activity
   * @param {string} clientId - Client/student ID
   * @param {string} action - Action performed
   * @param {Object} details - Additional details
   */
  logActivity(clientId, action, details = {}) {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.ACTIVITY_LOG);

      if (!sheet) return;

      sheet.appendRow([
        new Date(),
        clientId,
        action,
        JSON.stringify(details),
        details.toolId || '',
        details.sessionId || '',
        details.ipAddress || '',
        details.userAgent || ''
      ]);

    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  // ===== RESPONSE LIFECYCLE METHODS (via ResponseManager) =====

  /**
   * Get latest response (COMPLETED or DRAFT)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Latest response
   */
  getLatestResponse(clientId, toolId) {
    if (typeof ResponseManager === 'undefined') {
      return this.getToolResponse(clientId, toolId);
    }
    return ResponseManager.getLatestResponse(clientId, toolId);
  },

  /**
   * Get previous completed response
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Previous response
   */
  getPreviousResponse(clientId, toolId) {
    if (typeof ResponseManager === 'undefined') {
      return null;
    }
    return ResponseManager.getPreviousResponse(clientId, toolId);
  },

  /**
   * Check if student has active draft
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Draft or null
   */
  getActiveDraft(clientId, toolId) {
    if (typeof ResponseManager === 'undefined') {
      return null;
    }
    return ResponseManager.getActiveDraft(clientId, toolId);
  },

  /**
   * Load response for editing
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Result with draft data
   */
  loadResponseForEditing(clientId, toolId) {
    if (typeof ResponseManager === 'undefined') {
      return { success: false, error: 'ResponseManager not available' };
    }
    return ResponseManager.loadResponseForEditing(clientId, toolId);
  },

  /**
   * Submit edited response
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {Object} data - Edited data
   * @returns {Object} Result
   */
  submitEditedResponse(clientId, toolId, data) {
    if (typeof ResponseManager === 'undefined') {
      return { success: false, error: 'ResponseManager not available' };
    }
    return ResponseManager.submitEditedResponse(clientId, toolId, data);
  },

  /**
   * Cancel edit draft
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Result
   */
  cancelEditDraft(clientId, toolId) {
    if (typeof ResponseManager === 'undefined') {
      return { success: false, error: 'ResponseManager not available' };
    }
    return ResponseManager.cancelEditDraft(clientId, toolId);
  },

  /**
   * Start fresh attempt (clear all drafts)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Result
   */
  startFreshAttempt(clientId, toolId) {
    if (typeof ResponseManager === 'undefined') {
      return { success: false, error: 'ResponseManager not available' };
    }
    return ResponseManager.startFreshAttempt(clientId, toolId);
  },

  /**
   * Check if tool has completed response (for dashboard)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {boolean} True if has completed response
   */
  hasCompletedResponse(clientId, toolId) {
    const latest = this.getLatestResponse(clientId, toolId);
    return latest !== null && latest.status === 'COMPLETED';
  }
};
