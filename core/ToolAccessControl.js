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
      console.error('Error checking tool access:', error);
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
        // Update existing record
        sheet.getRange(existingRecord.rowIndex, 3).setValue('unlocked');
        sheet.getRange(existingRecord.rowIndex, 5).setValue(new Date());
        sheet.getRange(existingRecord.rowIndex, 6).setValue(adminEmail);
        sheet.getRange(existingRecord.rowIndex, 7).setValue(reason || 'Manual admin unlock');
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

      // Log the action
      DataService.logActivity(clientId, 'tool_unlocked', {
        toolId: toolId,
        by: adminEmail,
        reason: reason
      });

      return {
        success: true,
        message: `${toolId} unlocked for ${clientId}`
      };

    } catch (error) {
      console.error('Error unlocking tool:', error);
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
        // Update existing record
        sheet.getRange(existingRecord.rowIndex, 3).setValue('locked');
        sheet.getRange(existingRecord.rowIndex, 6).setValue(adminEmail);
        sheet.getRange(existingRecord.rowIndex, 7).setValue(reason || 'Manual admin lock');
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

      // Log the action
      DataService.logActivity(clientId, 'tool_locked', {
        toolId: toolId,
        by: adminEmail,
        reason: reason
      });

      return {
        success: true,
        message: `${toolId} locked for ${clientId}`
      };

    } catch (error) {
      console.error('Error locking tool:', error);
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
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) {
        return { success: false, error: 'TOOL_ACCESS sheet not found' };
      }

      const tools = ToolRegistry.getAllTools();

      tools.forEach(tool => {
        const toolNumber = parseInt(tool.id.replace('tool', ''));
        const status = toolNumber === 1 ? 'unlocked' : 'pending';

        sheet.appendRow([
          clientId,
          tool.id,
          status,
          JSON.stringify(tool.manifest.prerequisites || []),
          new Date(),
          '',  // Locked_By
          ''   // Lock_Reason
        ]);
      });

      return {
        success: true,
        message: `Initialized ${tools.length} tools for ${clientId}`
      };

    } catch (error) {
      console.error('Error initializing student:', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Get access status for all tools for a student
   * @param {string} clientId - Client/student ID
   * @returns {Array<Object>} Tool access status
   */
  getStudentAccess(clientId) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) return [];

      const data = sheet.getDataRange().getValues();

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
      console.error('Error getting student access:', error);
      return [];
    }
  },

  /**
   * Auto-unlock tool (internal use)
   * @private
   */
  _autoUnlockTool(clientId, toolId) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) return;

      const data = sheet.getDataRange().getValues();

      // Find and update record
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId && data[i][1] === toolId) {
          sheet.getRange(i + 1, 3).setValue('unlocked');
          sheet.getRange(i + 1, 5).setValue(new Date());
          sheet.getRange(i + 1, 6).setValue('system');
          sheet.getRange(i + 1, 7).setValue('Auto-unlocked (prerequisites met)');
          return;
        }
      }

      // If not found, create record
      sheet.appendRow([
        clientId,
        toolId,
        'unlocked',
        '[]',
        new Date(),
        'system',
        'Auto-unlocked (prerequisites met)'
      ]);

    } catch (error) {
      console.error('Error auto-unlocking tool:', error);
    }
  },

  /**
   * Get access record for a tool
   * @private
   */
  _getAccessRecord(clientId, toolId) {
    try {
      const sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL_ACCESS);

      if (!sheet) return null;

      const data = sheet.getDataRange().getValues();

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
      console.error('Error getting access record:', error);
      return null;
    }
  }
};
