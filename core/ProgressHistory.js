/**
 * ProgressHistory.js - Data layer for Progress Over Time feature
 *
 * Records extracted score snapshots whenever a student completes or re-submits
 * an assessment tool (Tools 1, 2, 3, 5, 7). Stores in a dedicated
 * PROGRESS_HISTORY sheet with a 10-version cap per client+tool pair.
 *
 * Used by ProgressPage.js to render SVG trend charts.
 */

const ProgressHistory = {

  SHEET_NAME: CONFIG.SHEETS.PROGRESS_HISTORY,
  MAX_VERSIONS: 10,

  // Tools that track progress (assessments only, not calculators)
  TRACKED_TOOLS: ['tool1', 'tool2', 'tool3', 'tool5', 'tool7'],

  HEADERS: ['Timestamp', 'Client_ID', 'Tool_ID', 'Version_Number', 'Scores_JSON', 'Summary', 'Source'],

  // ─── Sheet Initialization ──────────────────────────────────────────

  /**
   * Create the PROGRESS_HISTORY sheet if it does not exist
   */
  initSheet() {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      let sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(this.HEADERS);
        sheet.setFrozenRows(1);

        // Format header row
        const headerRange = sheet.getRange(1, 1, 1, this.HEADERS.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#f3f3f3');

        LogUtils.debug('ProgressHistory: Created PROGRESS_HISTORY sheet');
      }

      return sheet;
    } catch (error) {
      LogUtils.error('ProgressHistory: Error initializing sheet: ' + error);
      return null;
    }
  },

  /**
   * Get the sheet, creating it if needed
   */
  _getSheet() {
    var sheet = SpreadsheetCache.getSheet(this.SHEET_NAME);
    if (!sheet) {
      sheet = this.initSheet();
    }
    return sheet;
  },

  // ─── Score Extraction ──────────────────────────────────────────────

  /**
   * Extract key scores from a tool's data payload.
   * Returns a compact object suitable for Scores_JSON column.
   *
   * @param {string} toolId - tool1, tool2, tool3, tool5, or tool7
   * @param {Object} data - The full data payload from RESPONSES
   * @returns {Object|null} Extracted scores or null if data is invalid
   */
  extractScores(toolId, data) {
    try {
      if (!data) return null;

      if (toolId === 'tool1') {
        return this._extractTool1Scores(data);
      } else if (toolId === 'tool2') {
        return this._extractTool2Scores(data);
      } else if (toolId === 'tool3' || toolId === 'tool5' || toolId === 'tool7') {
        return this._extractGroundingScores(toolId, data);
      }

      return null;
    } catch (error) {
      LogUtils.error('ProgressHistory: Error extracting scores for ' + toolId + ': ' + error);
      return null;
    }
  },

  /**
   * Tool 1: 6 strategy scores + winner
   */
  _extractTool1Scores(data) {
    var scores = data.scores;
    if (!scores) return null;

    return {
      scores: {
        FSV: scores.FSV || 0,
        ExVal: scores.ExVal || 0,
        Showing: scores.Showing || 0,
        Receiving: scores.Receiving || 0,
        Control: scores.Control || 0,
        Fear: scores.Fear || 0
      },
      winner: data.winner || ''
    };
  },

  /**
   * Tool 2: 5 domain scores + archetype
   */
  _extractTool2Scores(data) {
    var results = data.results;
    if (!results || !results.domainScores) return null;

    var ds = results.domainScores;
    return {
      domainScores: {
        moneyFlow: ds.moneyFlow || 0,
        obligations: ds.obligations || 0,
        liquidity: ds.liquidity || 0,
        growth: ds.growth || 0,
        protection: ds.protection || 0
      },
      archetype: results.archetype || ''
    };
  },

  /**
   * Tools 3, 5, 7: Grounding quotients (overall, domain, subdomain)
   */
  _extractGroundingScores(toolId, data) {
    var scoring = data.scoring;
    if (!scoring) return null;

    var result = {
      overallQuotient: scoring.overallQuotient || 0,
      domainQuotients: {},
      subdomainQuotients: {}
    };

    // Domain quotients
    if (scoring.domainQuotients) {
      result.domainQuotients.domain1 = scoring.domainQuotients.domain1 || 0;
      result.domainQuotients.domain2 = scoring.domainQuotients.domain2 || 0;
    }

    // Subdomain quotients
    if (scoring.subdomainQuotients) {
      var subs = ['subdomain_1_1', 'subdomain_1_2', 'subdomain_1_3',
                  'subdomain_2_1', 'subdomain_2_2', 'subdomain_2_3'];
      for (var i = 0; i < subs.length; i++) {
        result.subdomainQuotients[subs[i]] = scoring.subdomainQuotients[subs[i]] || 0;
      }
    }

    return result;
  },

  // ─── Summary Generation ────────────────────────────────────────────

  /**
   * Generate a one-line human-readable summary for a history entry
   */
  _generateSummary(toolId, scores) {
    if (!scores) return '';

    if (toolId === 'tool1') {
      var winner = scores.winner || 'Unknown';
      var winnerScore = scores.scores ? (scores.scores[winner] || 0) : 0;
      return 'Dominant: ' + winner + ' (' + winnerScore + ')';
    }

    if (toolId === 'tool2') {
      var archetype = scores.archetype || 'Unknown';
      return 'Archetype: ' + archetype;
    }

    // Grounding tools
    var quotient = Math.round(scores.overallQuotient || 0);
    return 'Overall Quotient: ' + quotient + '/100';
  },

  // ─── Write Operations ──────────────────────────────────────────────

  /**
   * Record a completed assessment in the progress history.
   * Called from DataService.saveToolResponse() and ResponseManager.submitEditedResponse().
   *
   * @param {string} clientId
   * @param {string} toolId
   * @param {Object} data - Full data payload
   */
  recordCompletion(clientId, toolId, data) {
    try {
      // Only track assessment tools
      if (this.TRACKED_TOOLS.indexOf(toolId) === -1) {
        return;
      }

      var scores = this.extractScores(toolId, data);
      if (!scores) {
        LogUtils.debug('ProgressHistory: Could not extract scores for ' + toolId + ', skipping');
        return;
      }

      var sheet = this._getSheet();
      if (!sheet) {
        LogUtils.error('ProgressHistory: Could not get sheet, skipping record');
        return;
      }

      var versionNumber = this._getNextVersion(sheet, clientId, toolId);
      var summary = this._generateSummary(toolId, scores);

      sheet.appendRow([
        new Date(),                   // Timestamp
        clientId,                     // Client_ID
        toolId,                       // Tool_ID
        versionNumber,                // Version_Number
        JSON.stringify(scores),       // Scores_JSON
        summary,                      // Summary
        'completion'                  // Source
      ]);

      // Flush to ensure the appended row is committed before reading for version cap
      SpreadsheetApp.flush();
      SpreadsheetCache.invalidateSheetData(this.SHEET_NAME);

      // Enforce version cap
      this._enforceVersionCap(sheet, clientId, toolId);

      LogUtils.debug('ProgressHistory: Recorded v' + versionNumber + ' for ' + clientId + ' / ' + toolId);

    } catch (error) {
      // Non-fatal: do not break the main save flow
      LogUtils.error('ProgressHistory: Error recording completion: ' + error);
    }
  },

  /**
   * Get the next version number for a client+tool pair
   */
  _getNextVersion(sheet, clientId, toolId) {
    var data = sheet.getDataRange().getValues();
    var maxVersion = 0;

    // Header indices
    var clientIdCol = 1; // B
    var toolIdCol = 2;   // C
    var versionCol = 3;  // D

    for (var i = 1; i < data.length; i++) {
      if (data[i][clientIdCol] === clientId && data[i][toolIdCol] === toolId) {
        var v = parseInt(data[i][versionCol]) || 0;
        if (v > maxVersion) maxVersion = v;
      }
    }

    return maxVersion + 1;
  },

  /**
   * Enforce the version cap (FIFO: delete oldest when over limit)
   */
  _enforceVersionCap(sheet, clientId, toolId) {
    var data = sheet.getDataRange().getValues();
    var clientRows = [];

    var clientIdCol = 1;
    var toolIdCol = 2;
    var timestampCol = 0;

    for (var i = 1; i < data.length; i++) {
      if (data[i][clientIdCol] === clientId && data[i][toolIdCol] === toolId) {
        clientRows.push({
          rowIndex: i + 1, // 1-based sheet row
          timestamp: new Date(data[i][timestampCol])
        });
      }
    }

    if (clientRows.length > this.MAX_VERSIONS) {
      // Sort oldest first
      clientRows.sort(function(a, b) { return a.timestamp - b.timestamp; });

      // Delete oldest rows until within limit
      var toDelete = clientRows.length - this.MAX_VERSIONS;
      // Delete from bottom up to avoid row index shifting
      var rowsToDelete = clientRows.slice(0, toDelete).map(function(r) { return r.rowIndex; });
      rowsToDelete.sort(function(a, b) { return b - a; }); // descending

      for (var j = 0; j < rowsToDelete.length; j++) {
        sheet.deleteRow(rowsToDelete[j]);
      }

      SpreadsheetApp.flush();
      SpreadsheetCache.invalidateSheetData(this.SHEET_NAME);

      LogUtils.debug('ProgressHistory: Deleted ' + toDelete + ' old entries for ' + clientId + ' / ' + toolId);
    }
  },

  // ─── Read Operations ───────────────────────────────────────────────

  /**
   * Get all progress history for a client, grouped by tool
   *
   * @param {string} clientId
   * @returns {Object} { tool1: [...], tool2: [...], tool3: [...], tool5: [...], tool7: [...] }
   *   Each array contains entries sorted by version ascending:
   *   { timestamp, versionNumber, scores, summary, source }
   */
  getAllHistory(clientId) {
    var result = {};
    for (var i = 0; i < this.TRACKED_TOOLS.length; i++) {
      result[this.TRACKED_TOOLS[i]] = [];
    }

    try {
      var sheet = this._getSheet();
      if (!sheet) return result;

      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return result; // Only headers

      for (var r = 1; r < data.length; r++) {
        var rowClientId = data[r][1]; // Client_ID
        if (rowClientId !== clientId) continue;

        var toolId = data[r][2]; // Tool_ID
        if (!result[toolId]) continue; // Not a tracked tool

        var scoresJson = data[r][4]; // Scores_JSON
        var scores = null;
        try {
          scores = typeof scoresJson === 'string' ? JSON.parse(scoresJson) : scoresJson;
        } catch (e) {
          LogUtils.debug('ProgressHistory: Could not parse Scores_JSON for row ' + (r + 1));
          continue;
        }

        result[toolId].push({
          timestamp: data[r][0],       // Timestamp
          versionNumber: data[r][3],   // Version_Number
          scores: scores,
          summary: data[r][5],         // Summary
          source: data[r][6]           // Source
        });
      }

      // Sort each tool's entries by version ascending
      for (var t in result) {
        if (result[t].length > 0) {
          result[t].sort(function(a, b) { return a.versionNumber - b.versionNumber; });
        }
      }

    } catch (error) {
      LogUtils.error('ProgressHistory: Error reading history for ' + clientId + ': ' + error);
    }

    return result;
  },

  /**
   * Get progress history for a specific client+tool
   *
   * @param {string} clientId
   * @param {string} toolId
   * @returns {Array} Entries sorted by version ascending
   */
  getHistory(clientId, toolId) {
    var all = this.getAllHistory(clientId);
    return all[toolId] || [];
  },

  // ─── Migration ─────────────────────────────────────────────────────

  /**
   * One-time migration: backfill PROGRESS_HISTORY from existing RESPONSES rows.
   * Safe to run multiple times (checks for existing migration entries).
   *
   * Call this from the Apps Script editor or an admin function.
   */
  migrateFromResponses() {
    try {
      var responsesSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.RESPONSES);
      if (!responsesSheet) {
        return { success: false, error: 'RESPONSES sheet not found' };
      }

      var historySheet = this._getSheet();
      if (!historySheet) {
        return { success: false, error: 'Could not initialize PROGRESS_HISTORY sheet' };
      }

      // Check which client+tool pairs already have migration entries
      var existingData = historySheet.getDataRange().getValues();
      var migratedPairs = {};
      for (var check = 1; check < existingData.length; check++) {
        if (existingData[check][6] === 'migration') {
          var pairKey = existingData[check][1] + '|' + existingData[check][2];
          migratedPairs[pairKey] = true;
        }
      }

      // Read all COMPLETED responses for tracked tools
      var responsesData = responsesSheet.getDataRange().getValues();
      var headers = responsesData[0];

      var clientIdCol = headers.indexOf('Client_ID');
      var toolIdCol = headers.indexOf('Tool_ID');
      var dataCol = headers.indexOf('Data');
      var statusCol = headers.indexOf('Status');
      var timestampCol = headers.indexOf('Timestamp');

      // Validate required columns exist
      if (clientIdCol === -1 || toolIdCol === -1 || dataCol === -1 || statusCol === -1 || timestampCol === -1) {
        return { success: false, error: 'RESPONSES sheet missing required columns. Found: Client_ID=' + clientIdCol + ', Tool_ID=' + toolIdCol + ', Data=' + dataCol + ', Status=' + statusCol + ', Timestamp=' + timestampCol };
      }

      // Group by client+tool, sorted by timestamp
      var groups = {};
      for (var i = 1; i < responsesData.length; i++) {
        var status = responsesData[i][statusCol];
        if (status !== 'COMPLETED') continue;

        var tId = responsesData[i][toolIdCol];
        if (this.TRACKED_TOOLS.indexOf(tId) === -1) continue;

        var cId = responsesData[i][clientIdCol];
        var key = cId + '|' + tId;

        // Skip pairs that were already migrated
        if (migratedPairs[key]) continue;

        if (!groups[key]) groups[key] = [];

        var rawData = responsesData[i][dataCol];
        var parsed = null;
        try {
          parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        } catch (e) {
          continue; // Skip unparseable rows
        }

        groups[key].push({
          timestamp: responsesData[i][timestampCol],
          clientId: cId,
          toolId: tId,
          data: parsed
        });
      }

      // Write history entries
      var migrated = 0;
      var skippedPairs = Object.keys(migratedPairs).length;
      var rows = [];

      for (var groupKey in groups) {
        var entries = groups[groupKey];
        // Sort by timestamp ascending
        entries.sort(function(a, b) {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });

        // Keep only last MAX_VERSIONS
        if (entries.length > this.MAX_VERSIONS) {
          entries = entries.slice(entries.length - this.MAX_VERSIONS);
        }

        var versionCounter = 0;
        for (var v = 0; v < entries.length; v++) {
          var entry = entries[v];
          var scores = this.extractScores(entry.toolId, entry.data);
          if (!scores) continue;

          versionCounter++;
          rows.push([
            entry.timestamp,
            entry.clientId,
            entry.toolId,
            versionCounter,
            JSON.stringify(scores),
            this._generateSummary(entry.toolId, scores),
            'migration'
          ]);
          migrated++;
        }
      }

      // Batch append for performance
      if (rows.length > 0) {
        historySheet.getRange(historySheet.getLastRow() + 1, 1, rows.length, this.HEADERS.length)
          .setValues(rows);
        SpreadsheetCache.invalidateSheetData(this.SHEET_NAME);
      }

      var message = 'Migrated ' + migrated + ' entries';
      if (skippedPairs > 0) {
        message += ' (' + skippedPairs + ' client+tool pairs already migrated)';
      }
      LogUtils.debug('ProgressHistory: Migration complete. ' + message);
      return { success: true, message: message, migrated: migrated };

    } catch (error) {
      LogUtils.error('ProgressHistory: Migration error: ' + error);
      return { success: false, error: error.toString() };
    }
  }

};
