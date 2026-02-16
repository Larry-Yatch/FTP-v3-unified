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
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
      if (!data || data.length < 2) {
        return null;
      }

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
      LogUtils.error(`Error getting latest response: ${error}`);
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
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
      if (!data || data.length < 2) {
        return null;
      }

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
      LogUtils.error(`Error getting previous response: ${error}`);
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
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
      if (!data || data.length < 2) {
        return [];
      }

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
      LogUtils.error(`Error getting all responses: ${error}`);
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
      LogUtils.debug(`Loading response for editing: ${clientId} / ${toolId}`);

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
      LogUtils.debug(`=== ResponseManager.loadResponseForEditing DIAGNOSTIC ===`);
      LogUtils.debug(`Original responseData keys: ${JSON.stringify(Object.keys(responseData || {}))}`);
      LogUtils.debug(`Has formData? ${!!responseData.formData}`);
      LogUtils.debug(`Has scores? ${!!responseData.scores}`);
      LogUtils.debug(`Has winner? ${!!responseData.winner}`);

      if (responseData.formData) {
        LogUtils.debug(`formData keys: ${JSON.stringify(Object.keys(responseData.formData || {}))}`);
        LogUtils.debug(`formData.thought_fsv: ${responseData.formData.thought_fsv}`);
        LogUtils.debug(`formData.feeling_fsv: ${responseData.formData.feeling_fsv}`);
      }

      // Extract form data if it's nested (Tool1 structure: {formData, scores, winner})
      // Otherwise use the entire response data
      let formFields;
      if (responseData.formData) {
        // Tool1 pattern: data is nested under formData
        formFields = responseData.formData;
        LogUtils.debug(`Using nested formData extraction`);
      } else if (responseData.responses) {
        // Tool 3/5 pattern: data is nested under responses
        formFields = responseData.responses;
        LogUtils.debug(`Using nested responses extraction`);
      } else if (responseData.data) {
        // Alternative pattern: data nested under data
        formFields = responseData.data;
        LogUtils.debug(`Using nested data extraction`);
      } else {
        // Flat structure: use as-is
        formFields = responseData;
        LogUtils.debug(`Using flat structure`);
      }

      LogUtils.debug(`formFields keys after extraction: ${JSON.stringify(Object.keys(formFields || {}))}`);
      LogUtils.debug(`formFields.thought_fsv: ${formFields.thought_fsv}`);
      LogUtils.debug(`formFields.feeling_fsv: ${formFields.feeling_fsv}`);

      // Create edit draft with metadata
      const editDraftData = {
        ...formFields,  // Spread the actual form fields (not the wrapper)
        _editMode: true,
        _originalTimestamp: latest.timestamp,
        _originalResponseId: latest.timestamp, // Using timestamp as ID for now
        _editStarted: new Date().toISOString()
      };

      LogUtils.debug(`editDraftData keys after spread: ${JSON.stringify(Object.keys(editDraftData || {}))}`);
      LogUtils.debug(`editDraftData.thought_fsv: ${editDraftData.thought_fsv}`);
      LogUtils.debug(`editDraftData.feeling_fsv: ${editDraftData.feeling_fsv}`);

      // Save as EDIT_DRAFT in RESPONSES sheet
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);

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
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);

      LogUtils.debug(`Edit draft created successfully for ${clientId}`);

      return {
        success: true,
        draft: editDraftData,
        message: 'Response loaded for editing'
      };

    } catch (error) {
      LogUtils.error(`Error loading response for editing: ${error}`);
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
      LogUtils.debug(`Submitting edited response: ${clientId} / ${toolId}`);

      // DIAGNOSTIC: Log what we're receiving
      LogUtils.debug(`Data structure keys: ${JSON.stringify(Object.keys(data || {}))}`);
      LogUtils.debug(`Has formData? ${!!data.formData}`);
      LogUtils.debug(`Has scores? ${!!data.scores}`);
      LogUtils.debug(`Has winner? ${!!data.winner}`);
      LogUtils.debug(`Winner value: ${data.winner}`);

      // Remove edit mode metadata from formData (not top level!)
      const cleanData = { ...data };
      if (cleanData.formData) {
        cleanData.formData = { ...cleanData.formData };
        delete cleanData.formData._editMode;
        delete cleanData.formData._originalTimestamp;
        delete cleanData.formData._originalResponseId;
        delete cleanData.formData._editStarted;
      }

      LogUtils.debug(`After cleanup - winner: ${cleanData.winner}`);
      LogUtils.debug(`After cleanup - data: ${JSON.stringify(cleanData).substring(0, 200)}`);

      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);

      // CRITICAL: Delete the EDIT_DRAFT (not just mark as not latest)
      // This prevents the edit loop where user keeps seeing "draft in progress"
      const sheetData = sheet.getDataRange().getValues();
      const headers = sheetData[0];
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');

      // Delete EDIT_DRAFT row
      for (let i = sheetData.length - 1; i >= 1; i--) {
        if (sheetData[i][clientIdCol] === clientId &&
            sheetData[i][toolIdCol] === toolId &&
            sheetData[i][statusCol] === 'EDIT_DRAFT') {
          LogUtils.debug(`Deleting EDIT_DRAFT row at index ${i}`);
          sheet.deleteRow(i + 1);
          break; // Only delete the first EDIT_DRAFT found
        }
      }

      // Mark all previous COMPLETED versions as not latest
      this._markAsNotLatest(clientId, toolId);

      // Save new version as COMPLETED with Is_Latest = true
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
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);

      // Clean up old versions (keep last 2)
      this._cleanupOldVersions(clientId, toolId, 2);

      // Record in progress history for Progress Over Time feature
      if (typeof ProgressHistory !== 'undefined') {
        ProgressHistory.recordCompletion(clientId, toolId, cleanData);
      }

      // Clear PropertiesService draft data (prevents orphaned data)
      if (typeof DraftService !== 'undefined') {
        DraftService.clearDraft(toolId, clientId);
        LogUtils.debug(`Cleared PropertiesService draft for ${clientId} / ${toolId}`);
      }

      LogUtils.debug(`Edited response submitted successfully for ${clientId}`);

      return {
        success: true,
        message: 'Response updated successfully'
      };

    } catch (error) {
      LogUtils.error(`Error submitting edited response: ${error}`);
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
      LogUtils.debug(`Canceling draft: ${clientId} / ${toolId}`);

      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);

      // CRITICAL: Use fresh data, not cache, because we're deleting rows
      // Cached data indices become invalid after the first deleteRow()
      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const statusCol = headers.indexOf('Status');

      // Find and delete DRAFT or EDIT_DRAFT rows (handle both)
      let deletedCount = 0;
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            (data[i][statusCol] === 'DRAFT' || data[i][statusCol] === 'EDIT_DRAFT')) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }

      // Invalidate cache since we modified the sheet
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);

      // Mark most recent COMPLETED as latest again (if one exists)
      // Pass the already-fetched data to avoid redundant getDataRange() call
      this._restoreLatestCompletedFromData(sheet, data, headers, clientId, toolId);

      SpreadsheetApp.flush();

      // ALSO clear PropertiesService draft data
      if (typeof DraftService !== 'undefined') {
        DraftService.clearDraft(toolId, clientId);
        LogUtils.debug(`Cleared PropertiesService draft for ${clientId} / ${toolId}`);
      }

      LogUtils.debug(`Draft canceled for ${clientId} (deleted ${deletedCount} row(s))`);

      return {
        success: true,
        message: 'Draft canceled'
      };

    } catch (error) {
      LogUtils.error(`Error canceling draft: ${error}`);
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
      LogUtils.debug(`Starting fresh attempt: ${clientId} / ${toolId}`);

      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);

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
        LogUtils.debug(`Cleared PropertiesService draft: ${draftKey}`);
      } catch (propError) {
        LogUtils.warn(`Could not clear PropertiesService draft: ${propError}`);
        // Non-critical - continue anyway
      }

      SpreadsheetApp.flush();
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);

      LogUtils.debug(`Fresh attempt ready for ${clientId} - all drafts cleared`);

      return {
        success: true,
        message: 'Ready to start fresh'
      };

    } catch (error) {
      LogUtils.error(`Error starting fresh attempt: ${error}`);
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
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);

      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const isLatestCol = headers.indexOf('Is_Latest');

      if (isLatestCol === -1) {
        LogUtils.warn('Is_Latest column not found');
        return;
      }

      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId &&
            data[i][toolIdCol] === toolId &&
            this._isTrue(data[i][isLatestCol])) {
          sheet.getRange(i + 1, isLatestCol + 1).setValue('false');
        }
      }

      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);

    } catch (error) {
      LogUtils.error(`Error marking as not latest: ${error}`);
    }
  },

  /**
   * Restore most recent COMPLETED as latest (used after canceling edit)
   * @private
   */
  _restoreLatestCompleted(clientId, toolId) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      this._restoreLatestCompletedFromData(sheet, data, headers, clientId, toolId);
    } catch (error) {
      LogUtils.error(`Error restoring latest completed: ${error}`);
    }
  },

  /**
   * Restore most recent COMPLETED as latest using already-fetched data
   * (Optimized version to avoid redundant getDataRange calls)
   * @private
   */
  _restoreLatestCompletedFromData(sheet, data, headers, clientId, toolId) {
    try {
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
      LogUtils.error(`Error restoring latest completed from data: ${error}`);
    }
  },

  /**
   * Clean up old versions (keep only N most recent)
   * @private
   */
  _cleanupOldVersions(clientId, toolId, keepCount = 2) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);

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
        LogUtils.debug(`Cleaned up ${rowsToDelete.length} old versions for ${clientId}/${toolId}`);
        SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);
      }

    } catch (error) {
      LogUtils.error(`Error cleaning up old versions: ${error}`);
    }
  }
};
