/**
 * AdminMigration.js - One-time migration of legacy Tool 1 data
 *
 * Migrates v2 Tool 1 responses to v3 RESPONSES sheet format
 * Run once via Admin menu: "Admin Tools > Migrate Legacy Tool 1"
 *
 * LOGIC: Match by Student ID (column D) first, fall back to Name matching
 */

const AdminMigration = {
  // Legacy spreadsheet ID
  LEGACY_SHEET_ID: '15O-RORGetKX7XEU228REyinUCtXP-d3y6rt_XQSCKZM',

  /**
   * Main migration function - with preview mode
   * @param {boolean} previewOnly - If true, only shows first 5 records without writing
   * @returns {Object} Migration result
   */
  migrateLegacyTool1(previewOnly = false) {
    try {
      Logger.log(`=== Starting Legacy Tool 1 Migration (Preview: ${previewOnly}) ===`);

      // Step 1: Get active students from Students sheet (DESTINATION)
      const activeStudents = this.getActiveStudents();
      Logger.log(`Found ${activeStudents.length} active students in destination`);

      // Step 2: Build legacy data lookups (by Student ID AND by Name)
      const legacyLookups = this.buildLegacyLookups();
      Logger.log(`Found ${legacyLookups.byStudentId.size} legacy records with Student IDs`);
      Logger.log(`Found ${legacyLookups.byName.size} unique names in legacy data`);

      // Step 3: Check existing Tool 1 responses to avoid duplicates
      const existingTool1 = this.getExistingTool1ClientIds();
      Logger.log(`Found ${existingTool1.size} existing Tool 1 responses`);

      // Step 4: Process each active student
      const results = {
        totalStudents: activeStudents.length,
        processed: 0,
        skipped: 0,
        errors: 0,
        matchedByStudentId: 0,
        matchedByName: 0,
        details: []
      };

      const studentsToProcess = previewOnly ? activeStudents.slice(0, 5) : activeStudents;

      studentsToProcess.forEach((student, index) => {
        try {
          const clientId = student.clientId;
          const name = student.name;

          // Check if student already has Tool 1 data
          if (!previewOnly && existingTool1.has(clientId)) {
            results.skipped++;
            results.details.push({
              clientId: clientId,
              name: name,
              status: 'skipped',
              reason: 'Tool 1 already completed'
            });
            Logger.log(`⚠️ Skipped: ${clientId} (${name}) - already has Tool 1 data`);
            return;
          }

          // Try to match by Student ID first
          let legacyRecord = null;
          let matchMethod = null;

          if (legacyLookups.byStudentId.has(clientId)) {
            legacyRecord = legacyLookups.byStudentId.get(clientId);
            matchMethod = 'Student ID';
            results.matchedByStudentId++;
          }
          // Fall back to name matching
          else if (legacyLookups.byName.has(name)) {
            legacyRecord = legacyLookups.byName.get(name);
            matchMethod = 'Name';
            results.matchedByName++;
          }

          // No match found
          if (!legacyRecord) {
            results.skipped++;
            results.details.push({
              clientId: clientId,
              name: name,
              status: 'skipped',
              reason: 'No legacy data found (tried Student ID and Name)'
            });
            Logger.log(`⚠️ Skipped: ${clientId} (${name}) - no legacy data`);
            return;
          }

          // Transform data to v3 format
          const v3Data = this.transformLegacyRecord(legacyRecord);

          // Calculate scores and winner (using Tool1 logic)
          const scores = this.calculateScores(v3Data.formData);
          const winner = this.determineWinner(scores, v3Data.formData);

          const dataPackage = {
            formData: v3Data.formData,
            scores: scores,
            winner: winner
          };

          // Preview mode: just log, don't write
          if (previewOnly) {
            results.processed++;
            results.details.push({
              clientId: clientId,
              name: name,
              status: 'preview',
              matchMethod: matchMethod,
              scores: scores,
              winner: winner,
              timestamp: legacyRecord.timestamp
            });
            Logger.log(`✓ Preview: ${clientId} (${name}) - Matched by ${matchMethod} - Winner: ${winner}`);
          } else {
            // Write to RESPONSES sheet
            DataService.saveToolResponse(clientId, 'tool1', dataPackage, 'COMPLETED');

            results.processed++;
            results.details.push({
              clientId: clientId,
              name: name,
              status: 'migrated',
              matchMethod: matchMethod,
              winner: winner,
              timestamp: legacyRecord.timestamp
            });
            Logger.log(`✓ Migrated: ${clientId} (${name}) - Matched by ${matchMethod} - Winner: ${winner}`);
          }

        } catch (error) {
          results.errors++;
          results.details.push({
            clientId: student.clientId,
            name: student.name,
            status: 'error',
            error: error.toString()
          });
          Logger.log(`❌ Error processing ${student.clientId}: ${error}`);
        }
      });

      // Summary
      Logger.log(`=== Migration ${previewOnly ? 'Preview' : 'Complete'} ===`);
      Logger.log(`Total Students: ${results.totalStudents}`);
      Logger.log(`Processed: ${results.processed}`);
      Logger.log(`  - Matched by Student ID: ${results.matchedByStudentId}`);
      Logger.log(`  - Matched by Name: ${results.matchedByName}`);
      Logger.log(`Skipped: ${results.skipped}`);
      Logger.log(`Errors: ${results.errors}`);

      return results;

    } catch (error) {
      Logger.log(`Fatal migration error: ${error}`);
      throw error;
    }
  },

  /**
   * Get active students from Students sheet (DESTINATION)
   * @returns {Array<Object>} Array of {clientId, name, email}
   */
  getActiveStudents() {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.STUDENTS);

      if (!sheet) {
        throw new Error('Students sheet not found');
      }

      const data = sheet.getDataRange().getValues();
      const students = [];

      // Skip header row
      for (let i = 1; i < data.length; i++) {
        const clientId = data[i][0]; // Column A: Client_ID
        const name = data[i][1];     // Column B: Name
        const email = data[i][2];    // Column C: Email
        const status = data[i][3];   // Column D: Status

        if (clientId && name && status === 'active') {
          students.push({
            clientId: clientId,
            name: name,
            email: email
          });
        }
      }

      return students;

    } catch (error) {
      Logger.log(`Error getting active students: ${error}`);
      throw error;
    }
  },

  /**
   * Build legacy data lookups: by Student ID AND by Name
   * Handles multiple submissions (takes latest by timestamp)
   * @returns {Object} {byStudentId: Map, byName: Map}
   */
  buildLegacyLookups() {
    try {
      const legacySheet = SpreadsheetApp.openById(this.LEGACY_SHEET_ID);
      const sheet = legacySheet.getSheets()[0]; // First sheet
      const data = sheet.getDataRange().getValues();

      const byStudentId = new Map();
      const byName = new Map();

      // Skip header (row 0) and admin/category row (row 1)
      // Data starts at row 2 (index 2)
      for (let i = 2; i < data.length; i++) {
        const row = data[i];

        // Skip empty rows
        if (!row[0]) continue;

        const email = String(row[0]).toLowerCase().trim();
        const timestamp = row[1];
        const name = String(row[2]).trim();
        const studentId = row[3] ? String(row[3]).trim() : null; // Column D

        // Skip invalid entries
        if (!email || email === 'admin') continue;

        const record = {
          email: email,
          timestamp: timestamp,
          name: name,
          studentId: studentId,
          // Questions (columns 4-21: indices 4-21, accounting for new column D)
          q3: row[4],   // FSV
          q4: row[5],   // FSV
          q5: row[6],   // FSV
          q17: row[7],  // Control
          q18: row[8],  // Control
          q19: row[9],  // Control
          q10: row[10],  // Showing
          q11: row[11], // Showing
          q12: row[12], // Showing
          q6: row[13],  // ExVal
          q7: row[14],  // ExVal
          q8: row[15],  // ExVal
          q20: row[16], // Fear
          q21: row[17], // Fear
          q22: row[18], // Fear
          q13: row[19], // Receiving
          q14: row[20], // Receiving
          q15: row[21], // Receiving
          // Thought rankings (columns 22-26: indices 22-26)
          thought_fsv: row[22],
          thought_control: row[23],
          thought_showing: row[24],
          thought_exval: row[25],
          thought_fear: row[26]
        };

        // Index by Student ID if present
        if (studentId) {
          if (byStudentId.has(studentId)) {
            const existing = byStudentId.get(studentId);
            const existingDate = new Date(existing.timestamp);
            const newDate = new Date(timestamp);

            // Only replace if newer
            if (newDate > existingDate) {
              byStudentId.set(studentId, record);
              Logger.log(`Updated: ${studentId} with newer submission (${timestamp})`);
            }
          } else {
            byStudentId.set(studentId, record);
          }
        }

        // Index by Name (for fallback)
        if (name) {
          if (byName.has(name)) {
            const existing = byName.get(name);
            const existingDate = new Date(existing.timestamp);
            const newDate = new Date(timestamp);

            // Only replace if newer
            if (newDate > existingDate) {
              byName.set(name, record);
              Logger.log(`Updated: ${name} with newer submission (${timestamp})`);
            }
          } else {
            byName.set(name, record);
          }
        }
      }

      return {
        byStudentId: byStudentId,
        byName: byName
      };

    } catch (error) {
      Logger.log(`Error building legacy lookups: ${error}`);
      throw new Error(`Failed to read legacy spreadsheet: ${error}`);
    }
  },

  /**
   * Get Client_IDs that already have Tool 1 responses
   * @returns {Set<string>} Set of Client_IDs with existing Tool 1 data
   */
  getExistingTool1ClientIds() {
    try {
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
        .getSheetByName(CONFIG.SHEETS.RESPONSES);

      if (!sheet) {
        return new Set();
      }

      const data = sheet.getDataRange().getValues();
      const existingClients = new Set();

      // Skip header row
      for (let i = 1; i < data.length; i++) {
        const clientId = data[i][1]; // Column B: Client_ID
        const toolId = data[i][2];   // Column C: Tool_ID
        const isLatest = data[i][6]; // Column G: Is_Latest

        if (toolId === 'tool1' && isLatest === 'true') {
          existingClients.add(clientId);
        }
      }

      return existingClients;

    } catch (error) {
      Logger.log(`Error getting existing Tool 1 clients: ${error}`);
      return new Set();
    }
  },

  /**
   * Transform legacy record to v3 format
   * @param {Object} record - Legacy record
   * @returns {Object} v3 formatted data
   */
  transformLegacyRecord(record) {
    // Generate feeling rankings from thought rankings
    const feelingRankings = this.generateFeelingRankings(record);

    return {
      formData: {
        name: record.name,
        email: record.email,
        // Questions
        q3: String(record.q3),
        q4: String(record.q4),
        q5: String(record.q5),
        q6: String(record.q6),
        q7: String(record.q7),
        q8: String(record.q8),
        q10: String(record.q10),
        q11: String(record.q11),
        q12: String(record.q12),
        q13: String(record.q13),
        q14: String(record.q14),
        q15: String(record.q15),
        q17: String(record.q17),
        q18: String(record.q18),
        q19: String(record.q19),
        q20: String(record.q20),
        q21: String(record.q21),
        q22: String(record.q22),
        // Thought rankings
        thought_fsv: String(record.thought_fsv),
        thought_exval: String(record.thought_exval),
        thought_showing: String(record.thought_showing),
        thought_receiving: String(record.thought_receiving || 6), // Default if missing
        thought_control: String(record.thought_control),
        thought_fear: String(record.thought_fear),
        // Feeling rankings (generated)
        feeling_fsv: String(feelingRankings.feeling_fsv),
        feeling_exval: String(feelingRankings.feeling_exval),
        feeling_showing: String(feelingRankings.feeling_showing),
        feeling_receiving: String(feelingRankings.feeling_receiving),
        feeling_control: String(feelingRankings.feeling_control),
        feeling_fear: String(feelingRankings.feeling_fear),
        // Metadata
        _migrated: true,
        _originalTimestamp: record.timestamp,
        _migratedAt: new Date().toISOString()
      }
    };
  },

  /**
   * Generate feeling rankings from thought rankings
   * @param {Object} record - Legacy record
   * @returns {Object} Feeling rankings
   */
  generateFeelingRankings(record) {
    return {
      feeling_fsv: record.thought_fsv,
      feeling_exval: record.thought_exval,
      feeling_showing: record.thought_showing,
      feeling_receiving: record.thought_receiving || 6,
      feeling_control: record.thought_control,
      feeling_fear: record.thought_fear
    };
  },

  /**
   * Calculate scores (copied from Tool1.js)
   * @param {Object} data - Form data
   * @returns {Object} Scores for all 6 categories
   */
  calculateScores(data) {
    // Helper: Normalize thought ranking (1-10) to (-5 to +5)
    const normalizeThought = (rank) => {
      const r = parseInt(rank);
      if (r >= 1 && r <= 5) return r - 6;
      if (r >= 6 && r <= 10) return r - 5;
      return 0;
    };

    // FSV: Q3, Q4, Q5 + thought_fsv
    const fsvStatements = parseInt(data.q3 || 0) + parseInt(data.q4 || 0) + parseInt(data.q5 || 0);
    const fsvThought = normalizeThought(data.thought_fsv || 0);
    const fsvScore = fsvStatements + (2 * fsvThought);

    // ExVal: Q6, Q7, Q8 + thought_exval
    const exValStatements = parseInt(data.q6 || 0) + parseInt(data.q7 || 0) + parseInt(data.q8 || 0);
    const exValThought = normalizeThought(data.thought_exval || 0);
    const exValScore = exValStatements + (2 * exValThought);

    // Showing: Q10, Q11, Q12 + thought_showing
    const showingStatements = parseInt(data.q10 || 0) + parseInt(data.q11 || 0) + parseInt(data.q12 || 0);
    const showingThought = normalizeThought(data.thought_showing || 0);
    const showingScore = showingStatements + (2 * showingThought);

    // Receiving: Q13, Q14, Q15 + thought_receiving
    const receivingStatements = parseInt(data.q13 || 0) + parseInt(data.q14 || 0) + parseInt(data.q15 || 0);
    const receivingThought = normalizeThought(data.thought_receiving || 0);
    const receivingScore = receivingStatements + (2 * receivingThought);

    // Control: Q17, Q18, Q19 + thought_control
    const controlStatements = parseInt(data.q17 || 0) + parseInt(data.q18 || 0) + parseInt(data.q19 || 0);
    const controlThought = normalizeThought(data.thought_control || 0);
    const controlScore = controlStatements + (2 * controlThought);

    // Fear: Q20, Q21, Q22 + thought_fear
    const fearStatements = parseInt(data.q20 || 0) + parseInt(data.q21 || 0) + parseInt(data.q22 || 0);
    const fearThought = normalizeThought(data.thought_fear || 0);
    const fearScore = fearStatements + (2 * fearThought);

    return {
      FSV: fsvScore,
      ExVal: exValScore,
      Showing: showingScore,
      Receiving: receivingScore,
      Control: controlScore,
      Fear: fearScore
    };
  },

  /**
   * Determine winner (copied from Tool1.js)
   * @param {Object} scores - Calculated scores
   * @param {Object} data - Form data (for tie-breaker)
   * @returns {string} Winner category
   */
  determineWinner(scores, data) {
    const categories = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
    const feelingFields = {
      'FSV': 'feeling_fsv',
      'ExVal': 'feeling_exval',
      'Showing': 'feeling_showing',
      'Receiving': 'feeling_receiving',
      'Control': 'feeling_control',
      'Fear': 'feeling_fear'
    };

    // Find max score
    const maxScore = Math.max(...Object.values(scores));

    // Find all categories with max score
    const tied = categories.filter(cat => scores[cat] === maxScore);

    // If no tie, return winner
    if (tied.length === 1) {
      return tied[0];
    }

    // Tie-breaker: Use highest feeling ranking
    let winner = tied[0];
    let highestFeeling = parseInt(data[feelingFields[tied[0]]] || 0);

    for (let i = 1; i < tied.length; i++) {
      const cat = tied[i];
      const feeling = parseInt(data[feelingFields[cat]] || 0);
      if (feeling > highestFeeling) {
        highestFeeling = feeling;
        winner = cat;
      }
    }

    return winner;
  }
};

/**
 * Menu functions to be called from Apps Script UI
 */

function previewLegacyTool1Migration() {
  const ui = SpreadsheetApp.getUi();

  try {
    const result = AdminMigration.migrateLegacyTool1(true);

    let message = `PREVIEW MODE - No data written\n\n`;
    message += `Total students in destination: ${result.totalStudents}\n`;
    message += `Will process: ${result.processed}\n`;
    message += `  - Matched by Student ID: ${result.matchedByStudentId}\n`;
    message += `  - Matched by Name: ${result.matchedByName}\n`;
    message += `Will skip: ${result.skipped}\n`;
    message += `Errors: ${result.errors}\n\n`;
    message += `First 5 records:\n\n`;

    result.details.slice(0, 5).forEach(detail => {
      if (detail.status === 'preview') {
        message += `✓ ${detail.clientId} - ${detail.name}\n`;
        message += `  Matched by: ${detail.matchMethod}\n`;
        message += `  Winner: ${detail.winner}\n`;
        message += `  Scores: FSV=${detail.scores.FSV}, ExVal=${detail.scores.ExVal}\n\n`;
      } else if (detail.status === 'skipped') {
        message += `⚠️ ${detail.clientId} - ${detail.name}\n`;
        message += `  Reason: ${detail.reason}\n\n`;
      }
    });

    message += `\nCheck logs for full details.`;

    ui.alert('Migration Preview', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('Preview Error', `Failed to preview migration:\n${error}`, ui.ButtonSet.OK);
  }
}

function runLegacyTool1Migration() {
  const ui = SpreadsheetApp.getUi();

  // Confirmation dialog
  const response = ui.alert(
    'Confirm Migration',
    'This will migrate legacy Tool 1 data to v3 format.\n\n' +
    'This action will:\n' +
    '- Process active students from Students sheet\n' +
    '- Match by Student ID first, then by Name\n' +
    '- Skip students who already have Tool 1 data\n' +
    '- Write to RESPONSES sheet\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert('Migration Cancelled', 'No data was modified.', ui.ButtonSet.OK);
    return;
  }

  try {
    const result = AdminMigration.migrateLegacyTool1(false);

    let message = `Migration Complete!\n\n`;
    message += `Total students: ${result.totalStudents}\n`;
    message += `Migrated: ${result.processed}\n`;
    message += `  - Matched by Student ID: ${result.matchedByStudentId}\n`;
    message += `  - Matched by Name: ${result.matchedByName}\n`;
    message += `Skipped: ${result.skipped}\n`;
    message += `Errors: ${result.errors}\n\n`;

    if (result.errors > 0) {
      message += `⚠️ Some records had errors. Check logs for details.`;
    } else if (result.processed > 0) {
      message += `✓ All records migrated successfully!`;
    } else {
      message += `ℹ️ No new records to migrate.`;
    }

    ui.alert('Migration Complete', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('Migration Error', `Failed to run migration:\n${error}`, ui.ButtonSet.OK);
  }
}
