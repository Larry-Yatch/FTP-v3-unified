/**
 * validate-navigation.js
 * Navigation pattern validator for Financial TruPath v3
 *
 * This acts as a "linter" to catch navigation pattern violations before deployment.
 * Run this in Google Apps Script before every deploy.
 *
 * HOW TO USE:
 * 1. Copy this file to your Google Apps Script project
 * 2. Run: validateNavigationPatterns()
 * 3. Review the report in execution log
 * 4. Fix any CRITICAL or WARNING issues before deploying
 *
 * EXPECTED RESULT: All checks should pass (✅)
 */

/**
 * Main validation function - run this before deployment
 */
function validateNavigationPatterns() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  NAVIGATION PATTERN VALIDATION v3.3.0         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;
  const issues = [];

  // Test 1: Required Server-Side Functions
  console.log('🔧 TEST 1: Server-Side Navigation Functions');
  if (typeof getDashboardPage === 'function') {
    console.log('   ✅ PASS: getDashboardPage() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: getDashboardPage() missing');
    failCount++;
    issues.push('CRITICAL: getDashboardPage() not found in Code.js');
  }

  if (typeof getReportPage === 'function') {
    console.log('   ✅ PASS: getReportPage() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: getReportPage() missing');
    failCount++;
    issues.push('CRITICAL: getReportPage() not found in Code.js');
  }

  if (typeof authenticateAndGetDashboard === 'function') {
    console.log('   ✅ PASS: authenticateAndGetDashboard() exists (login optimization)');
    passCount++;
  } else {
    console.log('   ⚠️  WARN: authenticateAndGetDashboard() missing (login will be slower)');
    warnCount++;
    issues.push('WARNING: authenticateAndGetDashboard() not found - login will require 2 calls');
  }

  // Test 2: ResponseManager Integration
  console.log('\n📦 TEST 2: ResponseManager Integration');
  if (typeof ResponseManager !== 'undefined') {
    console.log('   ✅ PASS: ResponseManager exists');
    passCount++;

    // Check critical methods
    const requiredMethods = [
      'getLatestResponse',
      'loadResponseForEditing',
      'submitEditedResponse',
      'cancelEditDraft',
      'startFreshAttempt',
      '_isTrue',
      '_isFalse'
    ];

    requiredMethods.forEach(method => {
      if (typeof ResponseManager[method] === 'function') {
        console.log(`   ✅ PASS: ResponseManager.${method}() exists`);
        passCount++;
      } else {
        console.log(`   ❌ FAIL: ResponseManager.${method}() missing`);
        failCount++;
        issues.push(`CRITICAL: ResponseManager.${method}() not found`);
      }
    });
  } else {
    console.log('   ❌ FAIL: ResponseManager not found');
    failCount++;
    issues.push('CRITICAL: ResponseManager object not found in core/ResponseManager.js');
  }

  // Test 3: Router Integration
  console.log('\n🚦 TEST 3: Router Configuration');
  if (typeof Router !== 'undefined') {
    console.log('   ✅ PASS: Router exists');
    passCount++;

    if (typeof Router.route === 'function') {
      console.log('   ✅ PASS: Router.route() exists');
      passCount++;
    } else {
      console.log('   ❌ FAIL: Router.route() missing');
      failCount++;
      issues.push('CRITICAL: Router.route() method not found');
    }
  } else {
    console.log('   ❌ FAIL: Router not found');
    failCount++;
    issues.push('CRITICAL: Router object not found in core/Router.js');
  }

  // Test 4: Tool Registration
  console.log('\n🔨 TEST 4: Tool Registration');
  if (typeof ToolRegistry !== 'undefined') {
    console.log('   ✅ PASS: ToolRegistry exists');
    passCount++;

    // Register tools and check
    try {
      registerTools();
      console.log('   ✅ PASS: registerTools() executed successfully');
      passCount++;

      const tool1 = ToolRegistry.get('tool1');
      if (tool1) {
        console.log('   ✅ PASS: Tool 1 registered');
        passCount++;

        // Check Tool1 has required navigation methods
        if (typeof tool1.module.getExistingData === 'function') {
          console.log('   ✅ PASS: Tool1.getExistingData() exists');
          passCount++;
        } else {
          console.log('   ❌ FAIL: Tool1.getExistingData() missing');
          failCount++;
          issues.push('CRITICAL: Tool1.getExistingData() not found - edit mode will fail');
        }

        if (typeof tool1.module.processFinalSubmission === 'function') {
          console.log('   ✅ PASS: Tool1.processFinalSubmission() exists');
          passCount++;
        } else {
          console.log('   ❌ FAIL: Tool1.processFinalSubmission() missing');
          failCount++;
          issues.push('CRITICAL: Tool1.processFinalSubmission() not found - submissions will fail');
        }
      } else {
        console.log('   ❌ FAIL: Tool 1 not registered');
        failCount++;
        issues.push('CRITICAL: Tool 1 not found in ToolRegistry');
      }

      // Check if Tool2 exists (optional)
      const tool2 = ToolRegistry.get('tool2');
      if (tool2) {
        console.log('   ✅ INFO: Tool 2 registered');
        passCount++;
      } else {
        console.log('   ℹ️  INFO: Tool 2 not yet registered (expected if not built yet)');
      }

    } catch (error) {
      console.log('   ❌ FAIL: registerTools() threw error: ' + error.message);
      failCount++;
      issues.push('CRITICAL: registerTools() failed - ' + error.message);
    }
  } else {
    console.log('   ❌ FAIL: ToolRegistry not found');
    failCount++;
    issues.push('CRITICAL: ToolRegistry not found in core/ToolRegistry.js');
  }

  // Test 5: DataService Integration
  console.log('\n💾 TEST 5: DataService Integration');
  if (typeof DataService !== 'undefined') {
    console.log('   ✅ PASS: DataService exists');
    passCount++;

    const requiredMethods = [
      'getLatestResponse',
      'getActiveDraft',
      'loadResponseForEditing',
      'submitEditedResponse',
      'cancelEditDraft',
      'startFreshAttempt'
    ];

    requiredMethods.forEach(method => {
      if (typeof DataService[method] === 'function') {
        console.log(`   ✅ PASS: DataService.${method}() exists`);
        passCount++;
      } else {
        console.log(`   ⚠️  WARN: DataService.${method}() missing`);
        warnCount++;
        issues.push(`WARNING: DataService.${method}() not found - edit mode may not work`);
      }
    });
  } else {
    console.log('   ❌ FAIL: DataService not found');
    failCount++;
    issues.push('CRITICAL: DataService not found in core/DataService.js');
  }

  // Test 6: Google Sheets Structure
  console.log('\n📊 TEST 6: Google Sheets Structure');
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    console.log('   ✅ PASS: Connected to master spreadsheet');
    passCount++;

    // Check RESPONSES sheet
    const responsesSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    if (responsesSheet) {
      console.log('   ✅ PASS: RESPONSES sheet exists');
      passCount++;

      // Check for Is_Latest column
      const headers = responsesSheet.getRange(1, 1, 1, responsesSheet.getLastColumn()).getValues()[0];
      if (headers.includes('Is_Latest')) {
        console.log('   ✅ PASS: Is_Latest column exists in RESPONSES sheet');
        passCount++;
      } else {
        console.log('   ❌ FAIL: Is_Latest column missing from RESPONSES sheet');
        failCount++;
        issues.push('CRITICAL: Is_Latest column not found in RESPONSES sheet - run fix-responses-sheet.js');
      }

      // Check column structure
      const requiredColumns = ['Timestamp', 'Client_ID', 'Tool_ID', 'Data', 'Version', 'Status'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      if (missingColumns.length === 0) {
        console.log('   ✅ PASS: All required columns exist in RESPONSES sheet');
        passCount++;
      } else {
        console.log('   ❌ FAIL: Missing columns in RESPONSES sheet: ' + missingColumns.join(', '));
        failCount++;
        issues.push('CRITICAL: Missing columns in RESPONSES sheet: ' + missingColumns.join(', '));
      }
    } else {
      console.log('   ❌ FAIL: RESPONSES sheet not found');
      failCount++;
      issues.push('CRITICAL: RESPONSES sheet not found - run initializeAllSheets()');
    }

    // Check TOOL_ACCESS sheet
    const toolAccessSheet = ss.getSheetByName(CONFIG.SHEETS.TOOL_ACCESS);
    if (toolAccessSheet) {
      console.log('   ✅ PASS: TOOL_ACCESS sheet exists');
      passCount++;
    } else {
      console.log('   ⚠️  WARN: TOOL_ACCESS sheet not found');
      warnCount++;
      issues.push('WARNING: TOOL_ACCESS sheet not found - run initializeAllSheets()');
    }

    // Check Students sheet
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    if (studentsSheet) {
      console.log('   ✅ PASS: Students sheet exists');
      passCount++;

      // Check for test users
      const studentData = studentsSheet.getDataRange().getValues();
      if (studentData.length > 1) {
        console.log(`   ✅ PASS: Found ${studentData.length - 1} student(s) in system`);
        passCount++;

        // Check for TEST001 specifically
        const testUser = studentData.find(row => row[0] === 'TEST001');
        if (testUser) {
          console.log('   ✅ PASS: TEST001 user exists (ready for testing)');
          passCount++;
        } else {
          console.log('   ⚠️  WARN: TEST001 user not found - run addTestUser() to create');
          warnCount++;
          issues.push('WARNING: TEST001 test user not found - run addTestUser()');
        }
      } else {
        console.log('   ⚠️  WARN: No students in system - run addTestUser() to create test users');
        warnCount++;
        issues.push('WARNING: No students in system');
      }
    } else {
      console.log('   ❌ FAIL: Students sheet not found');
      failCount++;
      issues.push('CRITICAL: Students sheet not found - run initializeAllSheets()');
    }
  } catch (error) {
    console.log('   ❌ FAIL: Cannot connect to spreadsheet: ' + error.message);
    failCount++;
    issues.push('CRITICAL: Spreadsheet connection failed - check CONFIG.MASTER_SHEET_ID');
  }

  // Test 7: Code.js Handler Functions
  console.log('\n⚙️  TEST 7: Code.js Handler Functions');
  const requiredHandlers = [
    'cancelEditDraft',
    'loadResponseForEditing',
    'startFreshAttempt',
    'saveToolPageData',
    'completeToolSubmission'
  ];

  requiredHandlers.forEach(handler => {
    if (typeof eval(handler) === 'function') {
      console.log(`   ✅ PASS: ${handler}() exists`);
      passCount++;
    } else {
      console.log(`   ❌ FAIL: ${handler}() missing`);
      failCount++;
      issues.push(`CRITICAL: ${handler}() not found in Code.js`);
    }
  });

  // Test 8: Configuration Validation
  console.log('\n⚙️  TEST 8: Configuration');
  if (typeof CONFIG !== 'undefined') {
    console.log('   ✅ PASS: CONFIG object exists');
    passCount++;

    if (CONFIG.MASTER_SHEET_ID) {
      console.log('   ✅ PASS: MASTER_SHEET_ID configured');
      passCount++;
    } else {
      console.log('   ❌ FAIL: MASTER_SHEET_ID not set');
      failCount++;
      issues.push('CRITICAL: CONFIG.MASTER_SHEET_ID is empty');
    }

    if (CONFIG.VERSION) {
      console.log(`   ✅ PASS: Version set to ${CONFIG.VERSION}`);
      passCount++;
    } else {
      console.log('   ⚠️  WARN: VERSION not set');
      warnCount++;
    }
  } else {
    console.log('   ❌ FAIL: CONFIG object not found');
    failCount++;
    issues.push('CRITICAL: CONFIG not found - check Config.js');
  }

  // ===== SUMMARY =====
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              VALIDATION SUMMARY                ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log(`✅ PASSED:  ${passCount} checks`);
  console.log(`⚠️  WARNINGS: ${warnCount} checks`);
  console.log(`❌ FAILED:  ${failCount} checks\n`);

  if (issues.length > 0) {
    console.log('📋 ISSUES FOUND:\n');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('');
  }

  // Final verdict
  if (failCount === 0 && warnCount === 0) {
    console.log('🎉 EXCELLENT! All checks passed. Safe to deploy.\n');
    return { status: 'PASS', passed: passCount, warnings: warnCount, failed: failCount };
  } else if (failCount === 0) {
    console.log('✅ GOOD! All critical checks passed. Review warnings before deploy.\n');
    return { status: 'PASS_WITH_WARNINGS', passed: passCount, warnings: warnCount, failed: failCount };
  } else {
    console.log('⚠️  DO NOT DEPLOY! Fix critical failures first.\n');
    return { status: 'FAIL', passed: passCount, warnings: warnCount, failed: failCount };
  }
}

/**
 * Quick validation - just check critical navigation components
 */
function validateNavigationQuick() {
  console.log('🚀 Quick Navigation Check\n');

  const checks = {
    getDashboardPage: typeof getDashboardPage === 'function',
    getReportPage: typeof getReportPage === 'function',
    ResponseManager: typeof ResponseManager !== 'undefined',
    Router: typeof Router !== 'undefined',
    DataService: typeof DataService !== 'undefined',
    Tool1: typeof Tool1 !== 'undefined'
  };

  let allPassed = true;
  for (const [name, passed] of Object.entries(checks)) {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPassed = false;
  }

  console.log('');
  if (allPassed) {
    console.log('✅ Quick check passed!\n');
    return true;
  } else {
    console.log('❌ Quick check failed - run validateNavigationPatterns() for details\n');
    return false;
  }
}

/**
 * Test a specific navigation path with a test user
 * @param {string} clientId - Test user ID (e.g., 'TEST001')
 */
function testNavigationPath(clientId = 'TEST001') {
  console.log(`🧪 Testing Navigation Path with ${clientId}\n`);

  try {
    // Test 1: Get dashboard
    console.log('Test 1: getDashboardPage()');
    const dashboardHtml = getDashboardPage(clientId);
    if (dashboardHtml && dashboardHtml.length > 0) {
      console.log('   ✅ Dashboard HTML generated (' + dashboardHtml.length + ' bytes)');
    } else {
      console.log('   ❌ Dashboard HTML is empty');
      return false;
    }

    // Test 2: Get report (if Tool 1 completed)
    console.log('\nTest 2: getReportPage()');
    try {
      const reportHtml = getReportPage(clientId, 'tool1');
      if (reportHtml && reportHtml.length > 0) {
        console.log('   ✅ Report HTML generated (' + reportHtml.length + ' bytes)');
      } else {
        console.log('   ⚠️  Report HTML is empty (user may not have completed Tool 1 yet)');
      }
    } catch (error) {
      console.log('   ⚠️  Report generation failed (user may not have completed Tool 1 yet)');
      console.log('   Error: ' + error.message);
    }

    // Test 3: Check response data
    console.log('\nTest 3: ResponseManager.getLatestResponse()');
    const latestResponse = ResponseManager.getLatestResponse(clientId, 'tool1');
    if (latestResponse) {
      console.log('   ✅ Found response for Tool 1');
      console.log('   Status: ' + latestResponse.status);
      console.log('   Is Latest: ' + latestResponse.isLatest);
    } else {
      console.log('   ℹ️  No responses found (user hasn\'t completed Tool 1 yet)');
    }

    console.log('\n✅ Navigation path test complete\n');
    return true;

  } catch (error) {
    console.log('\n❌ Navigation path test failed: ' + error.message);
    console.log(error.stack);
    return false;
  }
}

/**
 * Validate Is_Latest column integrity
 * Checks that exactly one response per client/tool is marked as latest
 */
function validateIsLatestIntegrity() {
  console.log('🔍 Validating Is_Latest Column Integrity\n');

  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    if (!sheet) {
      console.log('❌ RESPONSES sheet not found');
      return false;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const isLatestCol = headers.indexOf('Is_Latest');
    const statusCol = headers.indexOf('Status');

    if (isLatestCol === -1) {
      console.log('❌ Is_Latest column not found');
      return false;
    }

    // Group by client + tool
    const groups = {};
    for (let i = 1; i < data.length; i++) {
      const clientId = data[i][clientIdCol];
      const toolId = data[i][toolIdCol];
      const isLatest = data[i][isLatestCol];
      const status = data[i][statusCol];
      const key = `${clientId}_${toolId}`;

      if (!groups[key]) {
        groups[key] = { latestCount: 0, totalCount: 0, rows: [] };
      }

      groups[key].totalCount++;
      groups[key].rows.push(i + 1); // Row number (1-indexed)

      if (ResponseManager._isTrue(isLatest)) {
        groups[key].latestCount++;
      }
    }

    // Check integrity
    let issueCount = 0;
    for (const [key, group] of Object.entries(groups)) {
      if (group.latestCount === 0) {
        console.log(`⚠️  ${key}: No Is_Latest=true found (${group.totalCount} rows)`);
        issueCount++;
      } else if (group.latestCount > 1) {
        console.log(`❌ ${key}: Multiple Is_Latest=true found (${group.latestCount} of ${group.totalCount} rows)`);
        console.log(`   Rows: ${group.rows.join(', ')}`);
        issueCount++;
      } else {
        console.log(`✅ ${key}: Correct (1 latest of ${group.totalCount} rows)`);
      }
    }

    console.log('');
    if (issueCount === 0) {
      console.log('✅ Is_Latest integrity check passed\n');
      return true;
    } else {
      console.log(`⚠️  Found ${issueCount} issue(s) - run fix-responses-sheet.js to repair\n`);
      return false;
    }

  } catch (error) {
    console.log('❌ Validation failed: ' + error.message);
    return false;
  }
}

/**
 * Run all validation checks in sequence
 */
function runAllValidations() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  COMPLETE VALIDATION SUITE - Financial TruPath v3');
  console.log('════════════════════════════════════════════════════════\n');

  // 1. Navigation patterns
  const navResult = validateNavigationPatterns();
  console.log('\n' + '─'.repeat(60) + '\n');

  // 2. Is_Latest integrity
  validateIsLatestIntegrity();
  console.log('─'.repeat(60) + '\n');

  // 3. Navigation path test
  testNavigationPath('TEST001');

  console.log('═'.repeat(60));
  console.log('  VALIDATION SUITE COMPLETE');
  console.log('═'.repeat(60) + '\n');

  if (navResult.status === 'PASS') {
    console.log('🎉 System is ready for deployment!\n');
  } else if (navResult.status === 'PASS_WITH_WARNINGS') {
    console.log('⚠️  System is deployable but review warnings\n');
  } else {
    console.log('❌ DO NOT DEPLOY - Fix critical issues first\n');
  }

  return navResult;
}
