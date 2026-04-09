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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
