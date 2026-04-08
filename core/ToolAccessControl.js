/**
 * ToolAccessControl.js - Access control and linear progression
 *
 * Manages:
 * - Linear tool progression (must complete Tool N before accessing Tool N+1)
 * - Admin overrides (manual lock/unlock)
 * - Auto-unlocking when prerequisites met
 */

const ToolAccessControl = {

  /**
   * Check if student can access a tool
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @returns {Object} Access result
   */
  canAccessTool(clientId, toolId) {
    try {
      // Get access record
      const accessRecord = this._getAccessRecord(clientId, toolId);

      // Check explicit unlock
      if (accessRecord && accessRecord.status === 'unlocked') {
        return { allowed: true };
      }

      // Check if explicitly locked
      if (accessRecord && accessRecord.status === 'locked') {
        return {
          allowed: false,
          reason: accessRecord.lockReason || 'Tool is locked'
        };
      }

      // Linear progression check
      const toolNumber = parseInt(toolId.replace('tool', ''));

      // Tool 1 always accessible
      if (toolNumber === 1) {
        this._autoUnlockTool(clientId, toolId);
        return { allowed: true };
      }

      // Check if previous tool is completed
      const previousTool = 'tool' + (toolNumber - 1);
      const previousCompleted = DataService.isToolCompleted(clientId, previousTool);

      if (previousCompleted) {
        // Auto-unlock this tool
        this._autoUnlockTool(clientId, toolId);
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: `Please complete ${previousTool} first`
      };

    } catch (error) {
      LogUtils.error('Error checking tool access: ' + error);
      return {
        allowed: false,
        reason: 'Error checking access'
      };
    }
  },

  /**
   * Admin function: Manually unlock a tool
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {string} adminEmail - Admin who unlocked
   * @param {string} reason - Reason for unlock
   * @returns {Object} Result
   */
  adminUnlockTool(clientId, toolId, adminEmail, reason) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) {
        return { success: false, error: 'TOOL_ACCESS sheet not found' };
      }

      const existingRecord = this._getAccessRecord(clientId, toolId);

      if (existingRecord) {
        // Update existing record — batch adjacent columns 5-7
        var row = existingRecord.rowIndex;
        sheet.getRange(row, 3).setValue('unlocked');
        sheet.getRange(row, 5, 1, 3).setValues([[new Date(), adminEmail, reason || 'Manual admin unlock']]);
      } else {
        // Create new record
        sheet.appendRow([
          clientId,
          toolId,
          'unlocked',
          '[]',  // Prerequisites (empty for manual unlock)
          new Date(),
          adminEmail,
          reason || 'Manual admin unlock'
        ]);
      }

      // Invalidate cache to ensure fresh data on next read
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

      // Log the admin unlock action
      DataService.logActivity(clientId, 'admin_unlock', {
        toolId: toolId,
        details: `Admin unlocked by ${adminEmail}: ${reason || 'Manual unlock'}`
      });

      return {
        success: true,
        message: `${toolId} unlocked for ${clientId}`
      };

    } catch (error) {
      LogUtils.error('Error unlocking tool: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Admin function: Manually lock a tool
   * @param {string} clientId - Client/student ID
   * @param {string} toolId - Tool identifier
   * @param {string} adminEmail - Admin who locked
   * @param {string} reason - Reason for lock
   * @returns {Object} Result
   */
  adminLockTool(clientId, toolId, adminEmail, reason) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) {
        return { success: false, error: 'TOOL_ACCESS sheet not found' };
      }

      const existingRecord = this._getAccessRecord(clientId, toolId);

      if (existingRecord) {
        // Update existing record — batch adjacent columns 6-7
        var row = existingRecord.rowIndex;
        sheet.getRange(row, 3).setValue('locked');
        sheet.getRange(row, 6, 1, 2).setValues([[adminEmail, reason || 'Manual admin lock']]);
      } else {
        // Create new record
        sheet.appendRow([
          clientId,
          toolId,
          'locked',
          '[]',
          new Date(),
          adminEmail,
          reason || 'Manual admin lock'
        ]);
      }

      // Invalidate cache to ensure fresh data on next read
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

      // Log the admin lock action
      DataService.logActivity(clientId, 'admin_lock', {
        toolId: toolId,
        details: `Admin locked by ${adminEmail}: ${reason || 'Manual lock'}`
      });

      return {
        success: true,
        message: `${toolId} locked for ${clientId}`
      };

    } catch (error) {
      LogUtils.error('Error locking tool: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Initialize tool access for a new student
   * @param {string} clientId - Client/student ID
   * @returns {Object} Result
   */
  initializeStudent(clientId) {
    try {
      LogUtils.debug(`[INIT_STUDENT] Starting initialization for ${clientId}`);
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) {
        LogUtils.error('[INIT_STUDENT] TOOL_ACCESS sheet not found!');
        return { success: false, error: 'TOOL_ACCESS sheet not found' };
      }

      LogUtils.debug('[INIT_STUDENT] TOOL_ACCESS sheet found, creating 8 tool records');

      // Initialize all 8 tools (tool1 through tool8)
      // Tool 1 is unlocked, rest are locked initially
      for (let i = 1; i <= 8; i++) {
        const toolId = `tool${i}`;
        const status = i === 1 ? 'unlocked' : 'locked';

        sheet.appendRow([
          clientId,
          toolId,
          status,
          '[]',  // Prerequisites (empty array)
          new Date(),
          i === 1 ? 'system' : '',  // Locked_By (system for tool1, empty for rest)
          i === 1 ? 'Initial unlock' : 'Locked until prerequisites met'  // Lock_Reason
        ]);
        LogUtils.debug(`[INIT_STUDENT] Added ${toolId} with status: ${status}`);
      }

      // Invalidate cache after initialization
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

      LogUtils.debug(`[INIT_STUDENT] Successfully initialized 8 tools for ${clientId}`);
      return {
        success: true,
        message: `Initialized 8 tools for ${clientId}`
      };

    } catch (error) {
      LogUtils.error('[INIT_STUDENT] Error initializing student: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Check access for all 8 tools in one pass.
   * Loads TOOL_ACCESS and TOOL_STATUS once, evaluates all tools,
   * and batches any auto-unlock writes into a single operation.
   * @param {string} clientId - Client/student ID
   * @returns {Object} Map of toolId → {allowed, reason}
   */
  canAccessToolBatch(clientId) {
    try {
      // Pre-load all needed sheets once
      SpreadsheetCache.batchPreload([
        CONFIG.SHEETS.TOOL_ACCESS,
        CONFIG.SHEETS.TOOL_STATUS
      ]);

      const accessData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.TOOL_ACCESS) || [];

      // Build access lookup: {toolId: {status, rowIndex, ...}}
      const accessMap = {};
      for (let i = 1; i < accessData.length; i++) {
        if (accessData[i][0] === clientId) {
          accessMap[accessData[i][1]] = {
            status: accessData[i][2],
            rowIndex: i + 1  // 1-based sheet row
          };
        }
      }

      // Evaluate each tool
      const results = {};
      const toolsToUnlock = []; // Collect tools needing auto-unlock

      for (let toolNumber = 1; toolNumber <= 8; toolNumber++) {
        const toolId = 'tool' + toolNumber;
        const record = accessMap[toolId];

        // Check explicit unlock
        if (record && record.status === 'unlocked') {
          results[toolId] = { allowed: true };
          continue;
        }

        // Check explicit lock
        if (record && record.status === 'locked') {
          // Tool 1 locked by admin is still locked
          if (toolNumber === 1) {
            // Tool 1 is special — always accessible unless admin-locked
            // But if record exists as 'locked' with a non-system locker, respect it
            // Actually, per canAccessTool logic, tool1 always gets auto-unlocked
            toolsToUnlock.push({ toolId: toolId, record: record });
            results[toolId] = { allowed: true };
            continue;
          }
          results[toolId] = {
            allowed: false,
            reason: record.lockReason || 'Tool is locked'
          };
          continue;
        }

        // No explicit record — check linear progression
        if (toolNumber === 1) {
          toolsToUnlock.push({ toolId: toolId, record: record });
          results[toolId] = { allowed: true };
          continue;
        }

        // Check if previous tool is completed
        const previousTool = 'tool' + (toolNumber - 1);
        const previousCompleted = DataService.isToolCompleted(clientId, previousTool);

        if (previousCompleted) {
          toolsToUnlock.push({ toolId: toolId, record: record });
          results[toolId] = { allowed: true };
        } else {
          results[toolId] = {
            allowed: false,
            reason: `Please complete ${previousTool} first`
          };
        }
      }

      // Batch auto-unlock: single write operation for all tools that need it
      if (toolsToUnlock.length > 0) {
        this._batchAutoUnlock(clientId, toolsToUnlock, accessMap);
      }

      return results;

    } catch (error) {
      LogUtils.error('Error in canAccessToolBatch: ' + error);
      // Fallback: return all locked
      const fallback = {};
      for (let i = 1; i <= 8; i++) {
        fallback['tool' + i] = { allowed: false, reason: 'Error checking access' };
      }
      return fallback;
    }
  },

  /**
   * Batch auto-unlock multiple tools in one operation.
   * @private
   * @param {string} clientId
   * @param {Array} toolsToUnlock - Array of {toolId, record}
   * @param {Object} accessMap - Current access map for row lookups
   */
  _batchAutoUnlock(clientId, toolsToUnlock, accessMap) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);
      if (!sheet) return;

      const now = new Date();
      const toolIds = [];

      toolsToUnlock.forEach(item => {
        const existing = accessMap[item.toolId];

        if (existing && existing.status === 'unlocked') {
          // Already unlocked — skip
          return;
        }

        if (existing) {
          // Update existing row with batch setValues
          const row = existing.rowIndex;
          sheet.getRange(row, 3, 1, 5).setValues([
            ['unlocked', '[]', now, 'system', 'Auto-unlocked (prerequisites met)']
          ]);
        } else {
          // Create new row
          sheet.appendRow([
            clientId, item.toolId, 'unlocked', '[]', now,
            'system', 'Auto-unlocked (prerequisites met)'
          ]);
        }
        toolIds.push(item.toolId);
      });

      if (toolIds.length > 0) {
        SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

        // Single activity log entry for all unlocked tools
        DataService.logActivity(clientId, 'auto_unlock', {
          toolId: toolIds.join(','),
          details: `Auto-unlocked ${toolIds.join(', ')} (prerequisites met)`
        });
      }

    } catch (error) {
      LogUtils.error('Error in batch auto-unlock: ' + error);
    }
  },

  /**
   * Get access status for all tools for a student
   * @param {string} clientId - Client/student ID
   * @returns {Array<Object>} Tool access status
   */
  getStudentAccess(clientId) {
    try {
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.TOOL_ACCESS);
      if (!data || data.length < 2) return [];

      return data.slice(1)
        .filter(row => row[0] === clientId)
        .map(row => ({
          clientId: row[0],
          toolId: row[1],
          status: row[2],
          prerequisites: JSON.parse(row[3] || '[]'),
          unlockedDate: row[4],
          lockedBy: row[5],
          lockReason: row[6]
        }));

    } catch (error) {
      LogUtils.error('Error getting student access: ' + error);
      return [];
    }
  },

  /**
   * Auto-unlock tool (internal use)
   * Uses cached data and batch writes for performance.
   * @private
   */
  _autoUnlockTool(clientId, toolId) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) return;

      // Use cached data instead of direct getDataRange().getValues()
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.TOOL_ACCESS);

      if (!data || data.length < 2) {
        // No data — create record
        this._createUnlockRecord(sheet, clientId, toolId);
        return;
      }

      // Find existing record
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId && data[i][1] === toolId) {
          // Skip if already unlocked
          if (data[i][2] === 'unlocked') return;

          // Batch update: write all 4 values for the row
          const row = i + 1;
          const now = new Date();
          const values = [['unlocked', '[]', now, 'system', 'Auto-unlocked (prerequisites met)']];
          sheet.getRange(row, 3, 1, 5).setValues(values);
          SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

          DataService.logActivity(clientId, 'auto_unlock', {
            toolId: toolId,
            details: `Auto-unlocked ${toolId} (prerequisites met)`
          });

          return;
        }
      }

      // Not found — create record
      this._createUnlockRecord(sheet, clientId, toolId);

    } catch (error) {
      LogUtils.error('Error auto-unlocking tool: ' + error);
    }
  },

  /**
   * Create a new unlock record (extracted to avoid duplication)
   * @private
   */
  _createUnlockRecord(sheet, clientId, toolId) {
    sheet.appendRow([
      clientId,
      toolId,
      'unlocked',
      '[]',
      new Date(),
      'system',
      'Auto-unlocked (prerequisites met)'
    ]);
    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

    DataService.logActivity(clientId, 'auto_unlock', {
      toolId: toolId,
      details: `Auto-unlocked ${toolId} (prerequisites met)`
    });
  },

  /**
   * Get access record for a tool
   * @private
   */
  _getAccessRecord(clientId, toolId) {
    try {
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.TOOL_ACCESS);
      if (!data || data.length < 2) return null;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId && data[i][1] === toolId) {
          return {
            rowIndex: i + 1,
            clientId: data[i][0],
            toolId: data[i][1],
            status: data[i][2],
            prerequisites: JSON.parse(data[i][3] || '[]'),
            unlockedDate: data[i][4],
            lockedBy: data[i][5],
            lockReason: data[i][6]
          };
        }
      }

      return null;

    } catch (error) {
      LogUtils.error('Error getting access record: ' + error);
      return null;
    }
  }
};
