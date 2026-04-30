/**
 * AdminFunctions.js
 * Administrative utility functions for managing students and tool access
 *
 * PURPOSE:
 * These functions are for administrators to manage the system from the
 * Apps Script Editor. They are NOT part of the production web app.
 *
 * ⚠️ PERFORMANCE NOTE:
 * These functions use SpreadsheetApp.openById() directly and bypass the
 * SpreadsheetCache system. This is intentional for occasional manual use,
 * but they should NOT be called frequently or in loops to avoid 429 errors.
 * For high-frequency operations, use the Admin Dashboard instead.
 *
 * USAGE:
 * 1. Open Apps Script Editor
 * 2. Select function from dropdown at top
 * 3. Click "Run" button
 * 4. View results in Execution log (View → Execution log)
 *
 * COMMON TASKS:
 * - Add a student: addStudent('STU123', 'John Doe', 'john@example.com')
 * - List all students: listStudents()
 * - Check student access: checkStudentAccess('STU123')
 * - Initialize access: initializeStudentAccess('STU123')
 * - Unlock a tool: unlockToolForStudent('STU123', 'tool2')
 *
 * VERSION: v3.8.1
 * LAST UPDATED: November 5, 2025
 */

// ========================================
// STUDENT MANAGEMENT
// ========================================

/**
 * Add a new student to the system
 *
 * This creates:
 * - Student record in STUDENTS sheet
 * - Tool access records in TOOL_ACCESS sheet (Tool 1 unlocked, Tools 2-8 locked)
 *
 * @param {string} clientId - Unique student ID (e.g., 'STU001'). Pass '' for pending (batch import).
 * @param {string} name - Student's full name
 * @param {string} email - Student's email address
 * @param {string} cohortId - Cohort ID (e.g., 'cohort_1'). Defaults to 'cohort_1'.
 * @returns {Object} Result object with success status
 *
 * @example
 * addStudent('STU001', 'John Doe', 'john@example.com', 'cohort_1')
 */
function addStudent(clientId, name, email, cohortId) {
  try {
    const isPending = !clientId;
    const effectiveCohort = cohortId || 'cohort_1';
    console.log(`Adding student: ${isPending ? '(pending)' : clientId} - ${name}`);

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    // Check for duplicate clientId (only when ID provided) or duplicate email
    const data = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (clientId && data[i][0] === clientId) {
        console.log('⚠️ Student ID already exists');
        return { success: false, error: 'Student ID already exists' };
      }
      if (email && String(data[i][2] || '').trim().toLowerCase() === email.trim().toLowerCase()) {
        console.log('⚠️ Email already enrolled');
        return { success: false, error: 'A student with that email is already enrolled' };
      }
    }

    const status = isPending ? 'pending' : 'active';

    // Add student to Students sheet
    studentsSheet.appendRow([
      clientId || '',     // Client_ID (blank for pending)
      name,
      email,
      status,             // Status: 'active' or 'pending'
      new Date(),         // Enrolled_Date
      new Date(),         // Last_Activity
      0,                  // Tools_Completed
      'tool1',            // Current_Tool
      effectiveCohort     // Cohort
    ]);

    console.log('✅ Added to Students sheet');

    // Add to STUDENT_COHORTS junction table
    try {
      var scSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.STUDENT_COHORTS);
      if (!scSheet) {
        scSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.SHEETS.STUDENT_COHORTS);
        scSheet.appendRow(['Client_ID', 'Cohort_ID', 'Enrolled_Date']);
      }
      scSheet.appendRow([clientId || email, effectiveCohort, new Date()]);
      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENT_COHORTS);
      console.log('✅ Added to STUDENT_COHORTS junction table');
    } catch (scError) {
      console.error('Warning: Could not write to STUDENT_COHORTS:', scError);
    }

    // Only initialize tool access for active (non-pending) students
    if (!isPending) {
      const result = ToolAccessControl.initializeStudent(clientId);

      if (result.success) {
        console.log('✅ Initialized tool access');
      } else {
        return result;
      }
    }

    // Log activity for student creation
    const logId = clientId || email;
    DataService.logActivity(logId, 'student_created', {
      toolId: '',
      details: `Student created: ${name} (${email}) - status: ${status} - cohort: ${effectiveCohort}`
    });

    console.log(`✅ Student created successfully!`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Status: ${status}`);
    console.log(`   Cohort: ${effectiveCohort}`);
    if (!isPending) {
      console.log(`   Tool 1: Unlocked`);
      console.log(`   Tools 2-8: Locked`);
    }

    return {
      success: true,
      clientId: clientId || null,
      pending: isPending,
      message: isPending
        ? `Pending student created for ${name} — will activate on first login`
        : `Student ${clientId} created successfully`
    };

  } catch (error) {
    console.error('❌ Error adding student:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * List all students in the system
 *
 * Shows:
 * - Student ID, Name, Email
 * - Status (active/inactive)
 * - Enrollment date
 * - Tools completed count
 * - Current tool
 *
 * @example
 * listStudents()
 */
function listStudents() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      console.log('❌ Students sheet not found');
      return;
    }

    const data = studentsSheet.getDataRange().getValues();

    if (data.length < 2) {
      console.log('No students found.');
      return;
    }

    console.log('=== Students List ===\n');

    for (let i = 1; i < data.length; i++) {
      console.log(`ID: ${data[i][0]}`);
      console.log(`Name: ${data[i][1]}`);
      console.log(`Email: ${data[i][2]}`);
      console.log(`Status: ${data[i][3]}`);
      console.log(`Enrolled: ${data[i][4]}`);
      console.log(`Tools Completed: ${data[i][6] || 0}`);
      console.log(`Current Tool: ${data[i][7] || 'tool1'}`);
      console.log('---');
    }

    console.log(`\nTotal: ${data.length - 1} students`);

  } catch (error) {
    console.error('❌ Error listing students:', error);
  }
}

// ========================================
// TOOL ACCESS MANAGEMENT
// ========================================

/**
 * Check a student's tool access status
 *
 * Shows all tools and their status (unlocked/locked) for a student.
 * Helpful for debugging access issues.
 *
 * @param {string} clientId - Student ID to check
 *
 * @example
 * checkStudentAccess('STU001')
 */
function checkStudentAccess(clientId) {
  try {
    console.log(`=== Access Status for ${clientId} ===\n`);

    const access = ToolAccessControl.getStudentAccess(clientId);

    if (access.length === 0) {
      console.log('❌ No access records found for this student');
      console.log('💡 Run: initializeStudentAccess("' + clientId + '")');
      return;
    }

    access.forEach(record => {
      console.log(`${record.toolId}: ${record.status}`);
      if (record.status === 'locked' && record.lockReason) {
        console.log(`  Reason: ${record.lockReason}`);
      }
      if (record.status === 'unlocked' && record.unlockedDate) {
        console.log(`  Unlocked: ${record.unlockedDate}`);
      }
    });

    console.log('\n=== End ===');

  } catch (error) {
    console.error('❌ Error checking access:', error);
  }
}

/**
 * Initialize tool access for a student
 *
 * Creates tool access records if they're missing.
 * Unlocks Tool 1, locks Tools 2-8.
 *
 * Use this if a student is missing access records.
 *
 * @param {string} clientId - Student ID to initialize
 * @returns {Object} Result object with success status
 *
 * @example
 * initializeStudentAccess('STU001')
 */
function initializeStudentAccess(clientId) {
  const result = ToolAccessControl.initializeStudent(clientId);
  console.log(result);
  return result;
}

/**
 * Manually unlock a tool for a student
 *
 * Use this to manually grant access to a tool, bypassing normal progression.
 * Useful for:
 * - Testing specific tools
 * - Allowing students to skip ahead
 * - Fixing access issues
 *
 * @param {string} clientId - Student ID
 * @param {string} toolId - Tool to unlock (e.g., 'tool2', 'tool3')
 * @returns {Object} Result object with success status
 *
 * @example
 * unlockToolForStudent('STU001', 'tool2')
 * unlockToolForStudent('STU001', 'tool3')
 */
function unlockToolForStudent(clientId, toolId) {
  const result = ToolAccessControl.adminUnlockTool(
    clientId,
    toolId,
    'admin@trupath.com',
    'Manual unlock via admin function'
  );
  console.log(result);
  return result;
}

// ========================================
// QUICK REFERENCE
// ========================================

/**
 * QUICK REFERENCE GUIDE
 *
 * ADDING A NEW STUDENT:
 * 1. addStudent('STUDENT_ID', 'Student Name', 'email@example.com')
 * 2. Student gets Tool 1 unlocked automatically
 * 3. Tools 2-8 unlock automatically as they complete tools
 *
 * CHECKING STUDENT STATUS:
 * 1. listStudents() - See all students
 * 2. checkStudentAccess('STUDENT_ID') - See tool access for one student
 *
 * FIXING ACCESS ISSUES:
 * 1. checkStudentAccess('STUDENT_ID') - See current status
 * 2. initializeStudentAccess('STUDENT_ID') - Create missing records
 * 3. unlockToolForStudent('STUDENT_ID', 'tool2') - Manually unlock
 *
 * TESTING:
 * 1. Create test student: addStudent('TEST001', 'Test Student', 'test@example.com')
 * 2. Unlock tools as needed: unlockToolForStudent('TEST001', 'tool2')
 * 3. Delete test data from sheets when done
 *
 * COMMON TASKS:
 * - Unlock Tool 2 for testing: unlockToolForStudent('TEST001', 'tool2')
 * - Unlock all tools for demo: Run unlockToolForStudent 8 times (tool1-tool8)
 * - Check why tool is locked: checkStudentAccess('STUDENT_ID')
 * - Reset student access: Delete rows from TOOL_ACCESS, run initializeStudentAccess
 *
 * DATA MIGRATION:
 * - Preview legacy Tool 1 migration: previewLegacyTool1Migration()
 * - Run legacy Tool 1 migration: runLegacyTool1Migration()
 * - Assign all existing students to Cohort 1: migrateExistingStudentsToCohort1()
 */

// ========================================
// COHORT MIGRATION
// ========================================

/**
 * One-time migration: assign all existing students to Cohort 1
 *
 * Run this ONCE after deploying the cohort feature to backfill
 * the new Cohort column for students enrolled before cohorts existed.
 *
 * @example
 * migrateExistingStudentsToCohort1()
 */
function migrateExistingStudentsToCohort1() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      console.log('❌ Students sheet not found');
      return;
    }

    const data = studentsSheet.getDataRange().getValues();
    if (data.length < 2) {
      console.log('No students found.');
      return;
    }

    // Ensure COHORTS sheet exists with Cohort 1
    ensureCohort1Exists(ss);

    // Ensure header row has 'Cohort' in column 9
    const headerRow = data[0];
    if (!headerRow[8] || String(headerRow[8]).trim() === '') {
      studentsSheet.getRange(1, 9).setValue('Cohort');
      console.log('✅ Added Cohort header to Students sheet');
    }

    let updated = 0;
    let skipped = 0;

    for (let i = 1; i < data.length; i++) {
      const existingCohort = String(data[i][8] || '').trim();
      if (!existingCohort) {
        // Column I (index 8) — set to cohort_1
        studentsSheet.getRange(i + 1, 9).setValue('cohort_1');
        updated++;
        console.log(`✅ Updated: ${data[i][0]} (${data[i][1]})`);
      } else {
        skipped++;
        console.log(`⏭️ Skipped (already set): ${data[i][0]} — ${existingCohort}`);
      }
    }

    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENTS);

    console.log(`\n=== Migration Complete ===`);
    console.log(`Updated: ${updated} students → cohort_1`);
    console.log(`Skipped: ${skipped} students (already had cohort)`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

/**
 * Ensure the COHORTS sheet exists and contains Cohort 1
 * @param {Spreadsheet} ss - Spreadsheet instance
 */
function ensureCohort1Exists(ss) {
  try {
    let cohortsSheet = ss.getSheetByName(CONFIG.SHEETS.COHORTS);

    if (!cohortsSheet) {
      cohortsSheet = ss.insertSheet(CONFIG.SHEETS.COHORTS);
      cohortsSheet.getRange(1, 1, 1, 5).setValues([[
        'Cohort_ID', 'Name', 'Start_Month', 'Start_Year', 'Status'
      ]]);
      console.log('✅ Created COHORTS sheet');
    }

    // Check if cohort_1 already exists
    const data = cohortsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'cohort_1') {
        console.log('ℹ️ Cohort 1 already exists');
        return;
      }
    }

    // Add Cohort 1
    cohortsSheet.appendRow(['cohort_1', 'Cohort 1', 'April', '2026', 'active']);
    console.log('✅ Added Cohort 1 to COHORTS sheet');

  } catch (error) {
    console.error('❌ Error ensuring Cohort 1:', error);
  }
}

/**
 * One-time migration to multi-cohort data model.
 * Creates STUDENT_COHORTS junction table and adds Cohort_ID column to ATTENDANCE.
 * Idempotent — safe to run multiple times.
 */
function migrateToMultiCohortModel() {
  var ss = SpreadsheetCache.getSpreadsheet();
  var results = { studentsProcessed: 0, attendanceProcessed: 0, skipped: [] };

  // --- Step 1: Create STUDENT_COHORTS sheet and populate from STUDENTS ---
  var scSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENT_COHORTS);
  if (!scSheet) {
    scSheet = ss.insertSheet(CONFIG.SHEETS.STUDENT_COHORTS);
    scSheet.appendRow(['Client_ID', 'Cohort_ID', 'Enrolled_Date']);
    console.log('Created STUDENT_COHORTS sheet');
  }

  var scData = scSheet.getDataRange().getValues();
  if (scData.length <= 1) {
    // Empty junction table — populate from STUDENTS column 8
    var studentsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS) || [];
    var junctionRows = [];

    for (var i = 1; i < studentsData.length; i++) {
      var clientId = studentsData[i][0];
      var cohort = studentsData[i][8];
      var enrolledDate = studentsData[i][4] || new Date();

      if (!clientId && !studentsData[i][2]) continue; // skip blank rows
      var id = clientId || studentsData[i][2]; // use email for pending students

      if (cohort) {
        junctionRows.push([id, cohort, enrolledDate]);
      } else {
        // Default to cohort_1 if no cohort assigned
        junctionRows.push([id, 'cohort_1', enrolledDate]);
      }
      results.studentsProcessed++;
    }

    if (junctionRows.length > 0) {
      scSheet.getRange(2, 1, junctionRows.length, 3).setValues(junctionRows);
      console.log('Populated STUDENT_COHORTS with ' + junctionRows.length + ' rows');
    }
  } else {
    results.skipped.push('STUDENT_COHORTS already has data (' + (scData.length - 1) + ' rows)');
    console.log('STUDENT_COHORTS already populated, skipping');
  }

  // --- Step 2: Add Cohort_ID column to ATTENDANCE ---
  var attSheet = ss.getSheetByName(CONFIG.SHEETS.ATTENDANCE);
  if (attSheet) {
    var attData = attSheet.getDataRange().getValues();

    if (attData.length > 0 && attData[0].length < 7) {
      // Need to add Cohort_ID column (G, index 6)
      // Build student → cohort lookup from STUDENTS sheet
      var studentsData2 = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS) || [];
      var cohortLookup = {};
      for (var s = 1; s < studentsData2.length; s++) {
        var sid = studentsData2[s][0];
        if (sid) cohortLookup[sid] = studentsData2[s][8] || 'cohort_1';
      }

      // Add header
      attSheet.getRange(1, 7).setValue('Cohort_ID');

      // Batch update cohort column for all data rows
      if (attData.length > 1) {
        var cohortValues = [];
        for (var a = 1; a < attData.length; a++) {
          var attClientId = attData[a][1];
          cohortValues.push([cohortLookup[attClientId] || 'cohort_1']);
          results.attendanceProcessed++;
        }
        attSheet.getRange(2, 7, cohortValues.length, 1).setValues(cohortValues);
        console.log('Added Cohort_ID to ' + cohortValues.length + ' ATTENDANCE rows');
      }
    } else if (attData.length > 0 && attData[0].length >= 7) {
      results.skipped.push('ATTENDANCE already has 7+ columns');
      console.log('ATTENDANCE already has Cohort_ID column, skipping');
    }
  } else {
    results.skipped.push('No ATTENDANCE sheet found');
  }

  // Invalidate caches
  SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENT_COHORTS);
  SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.ATTENDANCE);

  console.log('Migration complete:', JSON.stringify(results));
  return results;
}

/**
 * Repair TOOL_ACCESS schema for all active students.
 *
 * Symptom this fixes: many older students have a malformed TOOL_ACCESS pattern
 * (e.g. tool1 + tool4×3 + tool5–8, missing tool2 and tool3 entirely) from a
 * historical bug in initializeStudent(). The current code is correct, but
 * legacy data is dirty.
 *
 * For each active student, this function ensures exactly 8 TOOL_ACCESS rows
 * (tool1 through tool8) by:
 *   - **Deduplicating**: when multiple rows exist for the same (clientId, toolId),
 *     keeps the most permissive/authoritative one (unlocked > locked, admin > system,
 *     newest > oldest) and drops the rest.
 *   - **Backfilling**: when a tool row is missing entirely, synthesizes one using
 *     the same defaults `initializeStudent()` would use, with the prerequisite-met
 *     check applied so completed-tool prereqs result in 'unlocked' rather than
 *     'locked'.
 *
 * The function NEVER downgrades an unlocked tool to locked. Rows for inactive
 * students or test accounts (any non-active row in STUDENTS) are passed through
 * unchanged.
 *
 * Implementation note: rebuilds the data area of TOOL_ACCESS in one pass —
 * faster than iterative deleteRow for large dedup volumes.
 *
 * @param {boolean} dryRun - If true (default), reports what would change without writing.
 * @returns {Object} Report with counts and per-student actions.
 */
function repairToolAccessSchema(dryRun) {
  if (dryRun === undefined) dryRun = true;
  console.log('[REPAIR_TOOL_ACCESS] Starting (dryRun=' + dryRun + ')');

  var ss = SpreadsheetCache.getSpreadsheet();
  var taSheet = ss.getSheetByName(CONFIG.SHEETS.TOOL_ACCESS);
  if (!taSheet) return { error: 'TOOL_ACCESS sheet not found' };

  var taData = taSheet.getDataRange().getValues();
  if (taData.length < 1) return { error: 'TOOL_ACCESS sheet is empty (no headers)' };

  // ---- Step 1: Build completion map from RESPONSES (truth source for completion) ----
  var completed = {}; // clientId -> { toolId: true }
  var responsesData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES) || [];
  for (var r = 1; r < responsesData.length; r++) {
    var rcid = String(responsesData[r][1] || '').trim();
    var rtid = String(responsesData[r][2] || '').trim();
    var rstatus = String(responsesData[r][5] || '').trim();
    var rlatest = responsesData[r][6];
    if (!rcid || !rtid) continue;
    if (rstatus !== 'COMPLETED') continue;
    if (rlatest !== true && rlatest !== 'true') continue;
    if (!completed[rcid]) completed[rcid] = {};
    completed[rcid][rtid] = true;
  }

  // ---- Step 2: Identify active students from STUDENTS sheet ----
  var studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
  var studentsData = studentsSheet ? studentsSheet.getDataRange().getValues() : [];
  var activeStudentSet = {};
  var activeStudents = [];
  for (var s = 1; s < studentsData.length; s++) {
    var sid = String(studentsData[s][0] || '').trim();
    var sstatus = String(studentsData[s][3] || '').trim().toLowerCase();
    if (!sid) continue;
    if (sstatus !== 'active') continue;
    if (!activeStudentSet[sid]) {
      activeStudentSet[sid] = true;
      activeStudents.push(sid);
    }
  }

  // ---- Step 3: Partition existing TOOL_ACCESS rows ----
  // - Active students' rows: collect for dedup/repair
  // - Other rows (test accounts, inactive, blank): pass through unchanged
  var byActiveStudent = {}; // cid -> { toolId -> [rowArray, ...] }
  var passthroughRows = [];

  for (var i = 1; i < taData.length; i++) {
    var rowArr = taData[i];
    var cid = String(rowArr[0] || '').trim();
    var tid = String(rowArr[1] || '').trim();
    if (!cid) continue; // drop blank-client rows

    if (activeStudentSet[cid]) {
      if (!byActiveStudent[cid]) byActiveStudent[cid] = {};
      if (!byActiveStudent[cid][tid]) byActiveStudent[cid][tid] = [];
      byActiveStudent[cid][tid].push(rowArr);
    } else {
      passthroughRows.push(rowArr);
    }
  }

  // ---- Step 4: Build canonical 8-row set per active student ----
  var canonicalRows = [];
  var report = {
    studentsScanned: activeStudents.length,
    studentsRepaired: 0,
    duplicatesRemoved: 0,
    rowsAdded: 0,
    rowsBefore: taData.length - 1,
    passthroughRows: passthroughRows.length,
    actionsByStudent: {}
  };

  activeStudents.forEach(function(cid) {
    var perTool = byActiveStudent[cid] || {};
    var actions = [];
    var changedThisStudent = false;

    for (var t = 1; t <= 8; t++) {
      var tid = 'tool' + t;
      var records = perTool[tid] || [];
      var prereqMet = (t === 1) || (completed[cid] && completed[cid]['tool' + (t - 1)]);

      if (records.length === 0) {
        // Synthesize a missing row with the right defaults
        var newStatus, newLockedBy, newReason;
        if (t === 1) {
          newStatus = 'unlocked';
          newLockedBy = 'system';
          newReason = 'Initial unlock';
        } else if (prereqMet) {
          newStatus = 'unlocked';
          newLockedBy = 'system';
          newReason = 'Auto-unlocked (prerequisites met)';
        } else {
          newStatus = 'locked';
          newLockedBy = '';
          newReason = 'Locked until prerequisites met';
        }
        canonicalRows.push([cid, tid, newStatus, '[]', new Date(), newLockedBy, newReason]);
        report.rowsAdded++;
        actions.push('add ' + tid + ' (' + newStatus + ')');
        changedThisStudent = true;
      } else if (records.length === 1) {
        canonicalRows.push(records[0]);
      } else {
        // Multiple — pick canonical and discard rest
        var sorted = records.slice().sort(function(a, b) {
          var aUnlock = a[2] === 'unlocked' ? 1 : 0;
          var bUnlock = b[2] === 'unlocked' ? 1 : 0;
          if (aUnlock !== bUnlock) return bUnlock - aUnlock;
          var aAdmin = (a[5] && a[5] !== 'system') ? 1 : 0;
          var bAdmin = (b[5] && b[5] !== 'system') ? 1 : 0;
          if (aAdmin !== bAdmin) return bAdmin - aAdmin;
          var aDate = a[4] ? new Date(a[4]).getTime() : 0;
          var bDate = b[4] ? new Date(b[4]).getTime() : 0;
          return bDate - aDate;
        });
        canonicalRows.push(sorted[0]);
        var dropped = records.length - 1;
        report.duplicatesRemoved += dropped;
        actions.push('dedup ' + tid + ' (' + records.length + ' → 1, kept ' + sorted[0][2] + ')');
        changedThisStudent = true;
      }
    }

    if (changedThisStudent) {
      report.studentsRepaired++;
      report.actionsByStudent[cid] = actions;
    }
  });

  var allRows = passthroughRows.concat(canonicalRows);
  report.rowsAfter = allRows.length;

  if (dryRun) {
    report.dryRun = true;
    console.log('[REPAIR_TOOL_ACCESS] DRY RUN summary:', JSON.stringify({
      studentsScanned: report.studentsScanned,
      studentsRepaired: report.studentsRepaired,
      duplicatesRemoved: report.duplicatesRemoved,
      rowsAdded: report.rowsAdded,
      rowsBefore: report.rowsBefore,
      rowsAfter: report.rowsAfter
    }));
    return report;
  }

  // ---- Step 5: Apply by rebuilding the data area ----
  var oldLastRow = taSheet.getLastRow();
  if (oldLastRow > 1) {
    taSheet.getRange(2, 1, oldLastRow - 1, 7).clearContent();
  }
  if (allRows.length > 0) {
    taSheet.getRange(2, 1, allRows.length, 7).setValues(allRows);
  }

  SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.TOOL_ACCESS);

  report.dryRun = false;
  console.log('[REPAIR_TOOL_ACCESS] Applied. ' + report.studentsRepaired + ' students repaired, ' +
              report.duplicatesRemoved + ' duplicates removed, ' + report.rowsAdded + ' rows added.');
  return report;
}

/**
 * Editor-friendly wrapper: dry-run the schema repair and log the report.
 * Run this first to preview what will change.
 */
function previewToolAccessRepair() {
  var report = repairToolAccessSchema(true);
  console.log('--- Tool Access Repair PREVIEW ---');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * Editor-friendly wrapper: actually apply the schema repair.
 * Only run this after reviewing the preview.
 */
function applyToolAccessRepair() {
  var report = repairToolAccessSchema(false);
  console.log('--- Tool Access Repair APPLIED ---');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * Backfill TOOL_ACCESS rows for a single student who is missing them.
 *
 * Use case: students whose row was created outside the normal addStudent() flow
 * (e.g., manual spreadsheet edit, or a pending student whose status was flipped
 * to active by hand) end up with no TOOL_ACCESS rows and are locked out of every
 * tool. This function checks for missing rows and initializes them safely —
 * it is a no-op if the student already has TOOL_ACCESS records.
 *
 * @param {string} clientId - The student's Client_ID
 * @returns {Object} { success, message } or { success:false, error }
 */
function backfillToolAccessForStudent(clientId) {
  if (!clientId) return { success: false, error: 'clientId is required' };

  var ss = SpreadsheetCache.getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL_ACCESS);
  if (!sheet) return { success: false, error: 'TOOL_ACCESS sheet not found' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === clientId) {
      return { success: true, message: 'Already has TOOL_ACCESS rows; nothing to do', existing: true };
    }
  }

  // No rows found — initialize via the canonical path
  var result = ToolAccessControl.initializeStudent(clientId);
  if (!result.success) return result;

  console.log('[BACKFILL_TOOL_ACCESS] Initialized 8 rows for', clientId);
  return { success: true, message: 'Backfilled 8 TOOL_ACCESS rows for ' + clientId, created: true };
}

/**
 * Fix duplicate Is_Latest='true' rows on the RESPONSES sheet.
 * Groups by (Client_ID, Tool_ID) and keeps only the newest row as 'true'.
 *
 * @param {boolean} dryRun - If true (default), logs what would change without writing.
 * @returns {Object} Summary of findings and fixes
 */
function fixDuplicateIsLatest(dryRun) {
  if (dryRun === undefined) dryRun = true;

  var ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

  if (!sheet) {
    console.log('RESPONSES sheet not found');
    return { error: 'RESPONSES sheet not found' };
  }

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    console.log('No data rows in RESPONSES');
    return { pairsAffected: 0, rowsFixed: 0 };
  }

  var headers = data[0];
  var clientIdCol = headers.indexOf('Client_ID');
  var toolIdCol = headers.indexOf('Tool_ID');
  var timestampCol = headers.indexOf('Timestamp');
  var isLatestCol = headers.indexOf('Is_Latest');

  if (isLatestCol === -1) {
    console.log('Is_Latest column not found');
    return { error: 'Is_Latest column not found' };
  }

  // Group rows with Is_Latest='true' by (Client_ID|Tool_ID)
  var groups = {};
  for (var i = 1; i < data.length; i++) {
    var isLatest = data[i][isLatestCol];
    if (isLatest === 'true' || isLatest === true) {
      var key = data[i][clientIdCol] + '|' + data[i][toolIdCol];
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        rowIndex: i + 1,  // 1-based sheet row
        timestamp: new Date(data[i][timestampCol]).getTime()
      });
    }
  }

  // Find duplicates and collect rows to fix
  var rowsToFix = [];
  var pairsAffected = 0;

  for (var key in groups) {
    if (groups[key].length > 1) {
      pairsAffected++;
      // Sort by timestamp descending — keep the newest
      groups[key].sort(function(a, b) { return b.timestamp - a.timestamp; });
      // All except the first (newest) need to be set to 'false'
      for (var j = 1; j < groups[key].length; j++) {
        rowsToFix.push(groups[key][j].rowIndex);
      }
      console.log('Duplicate: ' + key + ' — ' + groups[key].length + ' rows with Is_Latest=true, fixing ' + (groups[key].length - 1));
    }
  }

  if (rowsToFix.length === 0) {
    console.log('No duplicate Is_Latest rows found. Data is clean.');
    return { pairsAffected: 0, rowsFixed: 0 };
  }

  console.log('Found ' + pairsAffected + ' client/tool pairs with duplicates, ' + rowsToFix.length + ' rows to fix');

  if (dryRun) {
    console.log('DRY RUN — no changes made. Run fixDuplicateIsLatest(false) to apply.');
  } else {
    var rangeList = rowsToFix.map(function(row) {
      return sheet.getRange(row, isLatestCol + 1).getA1Notation();
    });
    sheet.getRangeList(rangeList).setValue('false');
    console.log('Fixed ' + rowsToFix.length + ' rows — set Is_Latest to false');
  }

  return { pairsAffected: pairsAffected, rowsFixed: dryRun ? 0 : rowsToFix.length, dryRun: dryRun };
}
