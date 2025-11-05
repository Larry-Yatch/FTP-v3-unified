/**
 * ResponseManager.js - Response Lifecycle Management for v3
 *
 * Handles the complete lifecycle of student responses:
 * - View completed responses
 * - Edit existing responses (creates EDIT_DRAFT)
 * - Submit edited responses (marks old as not latest)
 * - Version management (keeps last 2 versions)
 * - Response history and audit trail
 *
 * This module is designed to be reusable across all 8 tools.
 */

const ResponseManager = {

  /**
   * Helper: Check if value is "true" (handles case insensitivity and boolean)
   * @private
   */
  _isTrue(value) {
    return value === 'true' || value === 'TRUE' || value === true;
  },

  /**
   * Helper: Check if value is "false" (handles case insensitivity and boolean)
   * @private
   */
  _isFalse(value) {
    return value === 'false' || value === 'FALSE' || value === false || value === '' || value === null || value === undefined;
  },

  /**
   * Get the latest response for a client/tool (regardless of status)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Latest response or null
   */
  getLatestResponse(clientId, toolId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      if (!sheet || sheet.getLastRow() < 2) {
        return null;
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const dataCol = headers.indexOf('Data');
      const statusCol = headers.indexOf('Status');
      const timestampCol = headers.indexOf('Timestamp');
      const versionCol = headers.indexOf('Version');
      const isLatestCol = headers.indexOf('Is_Latest');

      // If Is_Latest column exists, use it for fast lookup
      if (isLatestCol !== -1) {
        for (let i = data.length - 1; i >= 1; i--) {
          if (data[i][clientIdCol] === clientId &&
              data[i][toolIdCol] === toolId &&
              this._isTrue(data[i][isLatestCol])) {
            return this._parseResponseRow(data[i], headers);
          }
        }
      } else {
        // Fallback: Find most recent by timestamp
        let latestRow = null;
        let latestTimestamp = null;

        for (let i = data.length - 1; i >= 1; i--) {
          if (data[i][clientIdCol] === clientId &&
              data[i][toolIdCol] === toolId) {
            const timestamp = new Date(data[i][timestampCol]);
            if (!latestTimestamp || timestamp > latestTimestamp) {
              latestTimestamp = timestamp;
              latestRow = data[i];
            }
          }
        }

        if (latestRow) {
          return this._parseResponseRow(latestRow, headers);
        }
      }

      return null;

    } catch (error) {
      Logger.log(`Error getting latest response: ${error}`);
      return null;
    }
  },

  /**
   * Get the previous completed response (not latest)
   * Used to show "view previous version" after editing
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Previous response or null
   */
  getPreviousResponse(clientId, toolId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      if (!sheet || sheet.getLastRow() < 2) {
        return null;
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');
      const isLatestCol = headers.indexOf('Is_Latest');
      const timestampCol = headers.indexOf('Timestamp');

      // Find most recent COMPLETED response where Is_Latest = false
      let previousRow = null;
      let previousTimestamp = null;

      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            data[i][statusCol] === 'COMPLETED' &&
            (isLatestCol === -1 || this._isFalse(data[i][isLatestCol]))) {
          const timestamp = new Date(data[i][timestampCol]);
          if (!previousTimestamp || timestamp > previousTimestamp) {
            previousTimestamp = timestamp;
            previousRow = data[i];
          }
        }
      }

      if (previousRow) {
        return this._parseResponseRow(previousRow, headers);
      }

      return null;

    } catch (error) {
      Logger.log(`Error getting previous response: ${error}`);
      return null;
    }
  },

  /**
   * Get all responses for a client/tool (for history view)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {number} limit - Max number to return (default: 10)
   * @returns {Array} Array of responses, sorted newest first
   */
  getAllResponses(clientId, toolId, limit = 10) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');

      const responses = [];

      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId) {
          responses.push(this._parseResponseRow(data[i], headers));

          if (responses.length >= limit) {
            break;
          }
        }
      }

      return responses;

    } catch (error) {
      Logger.log(`Error getting all responses: ${error}`);
      return [];
    }
  },

  /**
   * Check if student has an active draft (including edit drafts)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object|null} Draft info or null
   */
  getActiveDraft(clientId, toolId) {
    const latest = this.getLatestResponse(clientId, toolId);

    if (latest && (latest.status === 'DRAFT' || latest.status === 'EDIT_DRAFT')) {
      return latest;
    }

    return null;
  },

  /**
   * Load a completed response for editing
   * Creates an EDIT_DRAFT copy in RESPONSES sheet
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Result with draft data
   */
  loadResponseForEditing(clientId, toolId) {
    try {
      Logger.log(`Loading response for editing: ${clientId} / ${toolId}`);

      // Get the latest COMPLETED response
      const latest = this.getLatestResponse(clientId, toolId);

      if (!latest) {
        return {
          success: false,
          error: 'No completed response found to edit'
        };
      }

      if (latest.status === 'DRAFT' || latest.status === 'EDIT_DRAFT') {
        return {
          success: false,
          error: 'Cannot edit - you already have a draft in progress'
        };
      }

      // Parse the response data
      let responseData;
      try {
        responseData = typeof latest.data === 'string' ?
          JSON.parse(latest.data) : latest.data;
      } catch (e) {
        return {
          success: false,
          error: 'Could not parse response data'
        };
      }

      // DIAGNOSTIC: Log original response structure
      Logger.log(`=== ResponseManager.loadResponseForEditing DIAGNOSTIC ===`);
      Logger.log(`Original responseData keys: ${JSON.stringify(Object.keys(responseData || {}))}`);
      Logger.log(`Has formData? ${!!responseData.formData}`);
      Logger.log(`Has scores? ${!!responseData.scores}`);
      Logger.log(`Has winner? ${!!responseData.winner}`);

      if (responseData.formData) {
        Logger.log(`formData keys: ${JSON.stringify(Object.keys(responseData.formData || {}))}`);
        Logger.log(`formData.thought_fsv: ${responseData.formData.thought_fsv}`);
        Logger.log(`formData.feeling_fsv: ${responseData.formData.feeling_fsv}`);
      }

      // Extract form data if it's nested (Tool1 structure: {formData, scores, winner})
      // Otherwise use the entire response data
      let formFields;
      if (responseData.formData) {
        // Tool1 pattern: data is nested under formData
        formFields = responseData.formData;
        Logger.log(`Using nested formData extraction`);
      } else if (responseData.data) {
        // Alternative pattern: data nested under data
        formFields = responseData.data;
        Logger.log(`Using nested data extraction`);
      } else {
        // Flat structure: use as-is
        formFields = responseData;
        Logger.log(`Using flat structure`);
      }

      Logger.log(`formFields keys after extraction: ${JSON.stringify(Object.keys(formFields || {}))}`);
      Logger.log(`formFields.thought_fsv: ${formFields.thought_fsv}`);
      Logger.log(`formFields.feeling_fsv: ${formFields.feeling_fsv}`);

      // Create edit draft with metadata
      const editDraftData = {
        ...formFields,  // Spread the actual form fields (not the wrapper)
        _editMode: true,
        _originalTimestamp: latest.timestamp,
        _originalResponseId: latest.timestamp, // Using timestamp as ID for now
        _editStarted: new Date().toISOString()
      };

      Logger.log(`editDraftData keys after spread: ${JSON.stringify(Object.keys(editDraftData || {}))}`);
      Logger.log(`editDraftData.thought_fsv: ${editDraftData.thought_fsv}`);
      Logger.log(`editDraftData.feeling_fsv: ${editDraftData.feeling_fsv}`);

      // Save as EDIT_DRAFT in RESPONSES sheet
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const row = [
        new Date(),                             // Timestamp
        clientId,                               // Client_ID
        toolId,                                 // Tool_ID
        JSON.stringify(editDraftData),          // Data
        CONFIG.VERSION,                         // Version
        'EDIT_DRAFT',                           // Status
        'true'                                  // Is_Latest
      ];

      // Mark previous latest as not latest
      this._markAsNotLatest(clientId, toolId);

      // Append new edit draft
      sheet.appendRow(row);
      SpreadsheetApp.flush();

      Logger.log(`Edit draft created successfully for ${clientId}`);

      return {
        success: true,
        draft: editDraftData,
        message: 'Response loaded for editing'
      };

    } catch (error) {
      Logger.log(`Error loading response for editing: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Submit an edited response (replaces old version)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {Object} data - Form data from edited submission
   * @returns {Object} Result with success status
   */
  submitEditedResponse(clientId, toolId, data) {
    try {
      Logger.log(`Submitting edited response: ${clientId} / ${toolId}`);

      // DIAGNOSTIC: Log what we're receiving
      Logger.log(`Data structure keys: ${JSON.stringify(Object.keys(data || {}))}`);
      Logger.log(`Has formData? ${!!data.formData}`);
      Logger.log(`Has scores? ${!!data.scores}`);
      Logger.log(`Has winner? ${!!data.winner}`);
      Logger.log(`Winner value: ${data.winner}`);

      // Remove edit mode metadata from formData (not top level!)
      const cleanData = { ...data };
      if (cleanData.formData) {
        cleanData.formData = { ...cleanData.formData };
        delete cleanData.formData._editMode;
        delete cleanData.formData._originalTimestamp;
        delete cleanData.formData._originalResponseId;
        delete cleanData.formData._editStarted;
      }

      Logger.log(`After cleanup - winner: ${cleanData.winner}`);
      Logger.log(`After cleanup - data: ${JSON.stringify(cleanData).substring(0, 200)}`);

      // Mark all previous versions as not latest
      this._markAsNotLatest(clientId, toolId);

      // Save new version as COMPLETED with Is_Latest = true
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const row = [
        new Date(),                             // Timestamp
        clientId,                               // Client_ID
        toolId,                                 // Tool_ID
        JSON.stringify(cleanData),              // Data
        CONFIG.VERSION,                         // Version
        'COMPLETED',                            // Status
        'true'                                  // Is_Latest
      ];

      sheet.appendRow(row);
      SpreadsheetApp.flush();

      // Clean up old versions (keep last 2)
      this._cleanupOldVersions(clientId, toolId, 2);

      Logger.log(`Edited response submitted successfully for ${clientId}`);

      return {
        success: true,
        message: 'Response updated successfully'
      };

    } catch (error) {
      Logger.log(`Error submitting edited response: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Cancel edit draft (delete EDIT_DRAFT, restore previous as latest)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Result with success status
   */
  cancelEditDraft(clientId, toolId) {
    try {
      Logger.log(`Canceling edit draft: ${clientId} / ${toolId}`);

      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');

      // Find and delete EDIT_DRAFT row
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            data[i][statusCol] === 'EDIT_DRAFT') {
          sheet.deleteRow(i + 1);
          break;
        }
      }

      // Mark most recent COMPLETED as latest again
      this._restoreLatestCompleted(clientId, toolId);

      SpreadsheetApp.flush();

      Logger.log(`Edit draft canceled for ${clientId}`);

      return {
        success: true,
        message: 'Edit canceled'
      };

    } catch (error) {
      Logger.log(`Error canceling edit draft: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Start fresh (clear all drafts, prepare for new attempt)
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Result with success status
   */
  startFreshAttempt(clientId, toolId) {
    try {
      Logger.log(`Starting fresh attempt: ${clientId} / ${toolId}`);

      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');

      // Delete any DRAFT or EDIT_DRAFT rows from RESPONSES sheet
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            (data[i][statusCol] === 'DRAFT' || data[i][statusCol] === 'EDIT_DRAFT')) {
          sheet.deleteRow(i + 1);
        }
      }

      // ALSO clear PropertiesService draft (legacy system)
      try {
        const userProperties = PropertiesService.getUserProperties();
        const draftKey = `${toolId}_draft_${clientId}`;
        userProperties.deleteProperty(draftKey);
        Logger.log(`Cleared PropertiesService draft: ${draftKey}`);
      } catch (propError) {
        Logger.log(`Warning: Could not clear PropertiesService draft: ${propError}`);
        // Non-critical - continue anyway
      }

      SpreadsheetApp.flush();

      Logger.log(`Fresh attempt ready for ${clientId} - all drafts cleared`);

      return {
        success: true,
        message: 'Ready to start fresh'
      };

    } catch (error) {
      Logger.log(`Error starting fresh attempt: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Parse a response row into object
   * @private
   */
  _parseResponseRow(row, headers) {
    const obj = {};

    headers.forEach((header, index) => {
      if (header === 'Data') {
        try {
          obj.data = typeof row[index] === 'string' ?
            JSON.parse(row[index]) : row[index];
        } catch (e) {
          obj.data = row[index];
        }
      } else if (header === 'Timestamp') {
        obj.timestamp = row[index];
      } else if (header === 'Client_ID') {
        obj.clientId = row[index];
      } else if (header === 'Tool_ID') {
        obj.toolId = row[index];
      } else if (header === 'Status') {
        obj.status = row[index] || 'COMPLETED';
      } else if (header === 'Version') {
        obj.version = row[index];
      } else if (header === 'Is_Latest') {
        obj.isLatest = this._isTrue(row[index]);
      }
    });

    return obj;
  },

  /**
   * Mark all responses for client/tool as not latest
   * @private
   */
  _markAsNotLatest(clientId, toolId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const isLatestCol = headers.indexOf('Is_Latest');

      if (isLatestCol === -1) {
        Logger.log('Warning: Is_Latest column not found');
        return;
      }

      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            this._isTrue(data[i][isLatestCol])) {
          sheet.getRange(i + 1, isLatestCol + 1).setValue('false');
        }
      }

    } catch (error) {
      Logger.log(`Error marking as not latest: ${error}`);
    }
  },

  /**
   * Restore most recent COMPLETED as latest (used after canceling edit)
   * @private
   */
  _restoreLatestCompleted(clientId, toolId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');
      const isLatestCol = headers.indexOf('Is_Latest');
      const timestampCol = headers.indexOf('Timestamp');

      if (isLatestCol === -1) return;

      // Find most recent COMPLETED
      let latestRow = -1;
      let latestTimestamp = null;

      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            data[i][statusCol] === 'COMPLETED') {
          const timestamp = new Date(data[i][timestampCol]);
          if (!latestTimestamp || timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
            latestRow = i;
          }
        }
      }

      if (latestRow !== -1) {
        sheet.getRange(latestRow + 1, isLatestCol + 1).setValue('true');
      }

    } catch (error) {
      Logger.log(`Error restoring latest completed: ${error}`);
    }
  },

  /**
   * Clean up old versions (keep only N most recent)
   * @private
   */
  _cleanupOldVersions(clientId, toolId, keepCount = 2) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');
      const timestampCol = headers.indexOf('Timestamp');

      // Get all COMPLETED responses
      const completedRows = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            data[i][statusCol] === 'COMPLETED') {
          completedRows.push({
            rowIndex: i,
            timestamp: new Date(data[i][timestampCol])
          });
        }
      }

      // Sort by timestamp (newest first)
      completedRows.sort((a, b) => b.timestamp - a.timestamp);

      // Delete rows beyond keepCount
      const rowsToDelete = completedRows.slice(keepCount);

      // Delete in reverse order to maintain row indices
      rowsToDelete.reverse().forEach(row => {
        sheet.deleteRow(row.rowIndex + 1);
      });

      if (rowsToDelete.length > 0) {
        Logger.log(`Cleaned up ${rowsToDelete.length} old versions for ${clientId}/${toolId}`);
      }

    } catch (error) {
      Logger.log(`Error cleaning up old versions: ${error}`);
    }
  }
};
