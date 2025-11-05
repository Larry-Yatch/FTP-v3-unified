/**
 * AdminFunctions.js
 * Administrative utility functions for managing students and tool access
 *
 * PURPOSE:
 * These functions are for administrators to manage the system from the
 * Apps Script Editor. They are NOT part of the production web app.
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
 * @param {string} clientId - Unique student ID (e.g., 'STU001', 'JOHN_DOE')
 * @param {string} name - Student's full name
 * @param {string} email - Student's email address
 * @returns {Object} Result object with success status
 *
 * @example
 * addStudent('STU001', 'John Doe', 'john@example.com')
 */
function addStudent(clientId, name, email) {
  try {
    console.log(`Adding student: ${clientId} - ${name}`);

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    // Check if student already exists
    const data = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === clientId) {
        console.log('⚠️ Student already exists');
        return { success: false, error: 'Student already exists' };
      }
    }

    // Add student to Students sheet
    studentsSheet.appendRow([
      clientId,
      name,
      email,
      'active',           // Status
      new Date(),         // Enrolled_Date
      new Date(),         // Last_Activity
      0,                  // Tools_Completed
      'tool1'             // Current_Tool
    ]);

    console.log('✅ Added to Students sheet');

    // Initialize tool access (Tool 1 unlocked, rest locked)
    const result = ToolAccessControl.initializeStudent(clientId);

    if (result.success) {
      console.log('✅ Initialized tool access');
      console.log(`✅ Student ${clientId} created successfully!`);
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Status: Active`);
      console.log(`   Tool 1: Unlocked`);
      console.log(`   Tools 2-8: Locked`);

      return {
        success: true,
        clientId: clientId,
        message: `Student ${clientId} created successfully`
      };
    } else {
      return result;
    }

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
 */
