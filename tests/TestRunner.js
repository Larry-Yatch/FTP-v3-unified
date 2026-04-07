/**
 * TestRunner.js - GAS-native test harness for FTP-v3
 *
 * Run tests from Apps Script Editor:
 *   - runAllCoreTests()      → runs everything
 *   - runCacheTests()        → SpreadsheetCache only
 *   - runDataServiceTests()  → DataService only
 *   - runResponseManagerTests() → ResponseManager only
 *   - runAccessControlTests()   → ToolAccessControl only
 *   - runInsightsPipelineTests() → InsightsPipeline only
 *
 * All tests use TEST_RUNNER_ prefixed client IDs and clean up after themselves.
 */

// ─── Test Client ID Prefix ──────────────────────────────────────────
const TEST_CLIENT_PREFIX = 'TEST_RUNNER_';

// ─── Test Harness ───────────────────────────────────────────────────

/**
 * Create a fresh test context for tracking results
 */
function createTestContext(suiteName) {
  return {
    suiteName: suiteName,
    passed: 0,
    failed: 0,
    errors: [],
    tests: [],
    startTime: new Date()
  };
}

/**
 * Assert a condition is true
 */
function assert(ctx, condition, testName, details) {
  if (condition) {
    ctx.passed++;
    ctx.tests.push({ name: testName, passed: true });
    Logger.log('  PASS: ' + testName);
  } else {
    ctx.failed++;
    var errorMsg = testName + (details ? ' — ' + details : '');
    ctx.errors.push(errorMsg);
    ctx.tests.push({ name: testName, passed: false, error: errorMsg });
    Logger.log('  FAIL: ' + errorMsg);
  }
}

/**
 * Assert two values are equal
 */
function assertEqual(ctx, actual, expected, testName) {
  var actualStr = JSON.stringify(actual);
  var expectedStr = JSON.stringify(expected);
  assert(ctx, actualStr === expectedStr, testName,
    'Expected ' + expectedStr + ' but got ' + actualStr);
}

/**
 * Assert value is truthy
 */
function assertTruthy(ctx, value, testName) {
  assert(ctx, !!value, testName, 'Expected truthy but got ' + JSON.stringify(value));
}

/**
 * Assert value is null or undefined
 */
function assertNull(ctx, value, testName) {
  assert(ctx, value === null || value === undefined, testName,
    'Expected null/undefined but got ' + JSON.stringify(value));
}

/**
 * Assert value is not null/undefined
 */
function assertNotNull(ctx, value, testName) {
  assert(ctx, value !== null && value !== undefined, testName,
    'Expected non-null value but got ' + JSON.stringify(value));
}

/**
 * Print test suite summary
 */
function printSummary(ctx) {
  var elapsed = (new Date() - ctx.startTime) / 1000;
  Logger.log('');
  Logger.log('══════════════════════════════════════');
  Logger.log(ctx.suiteName + ' RESULTS');
  Logger.log('══════════════════════════════════════');
  Logger.log('Passed: ' + ctx.passed);
  Logger.log('Failed: ' + ctx.failed);
  Logger.log('Total:  ' + (ctx.passed + ctx.failed));
  Logger.log('Time:   ' + elapsed.toFixed(1) + 's');

  if (ctx.errors.length > 0) {
    Logger.log('');
    Logger.log('FAILURES:');
    ctx.errors.forEach(function(err) {
      Logger.log('  - ' + err);
    });
  }

  Logger.log('══════════════════════════════════════');
  return ctx;
}

// ─── Cleanup Utilities ──────────────────────────────────────────────

/**
 * Remove all test data rows for a given client ID from all relevant sheets.
 * Deletes rows bottom-up to preserve indices.
 */
function cleanupTestData(clientId) {
  var sheetsToClean = [
    { name: CONFIG.SHEETS.RESPONSES, clientCol: 1 },
    { name: CONFIG.SHEETS.TOOL_STATUS, clientCol: 0 },
    { name: CONFIG.SHEETS.TOOL_ACCESS, clientCol: 0 },
    { name: CONFIG.SHEETS.ACTIVITY_LOG, clientCol: 1 },
    { name: CONFIG.SHEETS.CROSS_TOOL_INSIGHTS, clientCol: 1 },
    { name: CONFIG.SHEETS.PROGRESS_HISTORY, clientCol: 1 },
    { name: CONFIG.SHEETS.STUDENTS, clientCol: 0 }
  ];

  var ss = SpreadsheetCache.getSpreadsheet();

  sheetsToClean.forEach(function(sheetInfo) {
    try {
      var sheet = ss.getSheetByName(sheetInfo.name);
      if (!sheet) return;

      var data = sheet.getDataRange().getValues();
      // Delete from bottom up
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][sheetInfo.clientCol] === clientId) {
          sheet.deleteRow(i + 1);
        }
      }
    } catch (e) {
      Logger.log('Cleanup warning for ' + sheetInfo.name + ': ' + e);
    }
  });

  SpreadsheetCache.clearCache();
}

/**
 * Clean up ALL test data (any client ID starting with TEST_RUNNER_)
 */
function cleanupAllTestData() {
  var sheetsToClean = [
    { name: CONFIG.SHEETS.RESPONSES, clientCol: 1 },
    { name: CONFIG.SHEETS.TOOL_STATUS, clientCol: 0 },
    { name: CONFIG.SHEETS.TOOL_ACCESS, clientCol: 0 },
    { name: CONFIG.SHEETS.ACTIVITY_LOG, clientCol: 1 },
    { name: CONFIG.SHEETS.CROSS_TOOL_INSIGHTS, clientCol: 1 },
    { name: CONFIG.SHEETS.PROGRESS_HISTORY, clientCol: 1 },
    { name: CONFIG.SHEETS.STUDENTS, clientCol: 0 }
  ];

  var ss = SpreadsheetCache.getSpreadsheet();

  sheetsToClean.forEach(function(sheetInfo) {
    try {
      var sheet = ss.getSheetByName(sheetInfo.name);
      if (!sheet) return;

      var data = sheet.getDataRange().getValues();
      var deleted = 0;
      for (var i = data.length - 1; i >= 1; i--) {
        var cellValue = String(data[i][sheetInfo.clientCol] || '');
        if (cellValue.indexOf(TEST_CLIENT_PREFIX) === 0) {
          sheet.deleteRow(i + 1);
          deleted++;
        }
      }
      if (deleted > 0) {
        Logger.log('Cleaned ' + deleted + ' test row(s) from ' + sheetInfo.name);
      }
    } catch (e) {
      Logger.log('Cleanup warning for ' + sheetInfo.name + ': ' + e);
    }
  });

  SpreadsheetCache.clearCache();
  Logger.log('All test data cleaned up.');
}

// ─── Master Test Runner ─────────────────────────────────────────────

/**
 * Run ALL core tests. Call from Apps Script Editor.
 */
function runAllCoreTests() {
  Logger.log('');
  Logger.log('╔══════════════════════════════════════════╗');
  Logger.log('║  FTP-v3 CORE TEST SUITE                  ║');
  Logger.log('║  ' + new Date().toISOString() + '  ║');
  Logger.log('╚══════════════════════════════════════════╝');
  Logger.log('');

  var totalPassed = 0;
  var totalFailed = 0;
  var suiteResults = [];

  // Run each suite
  var suites = [
    { name: 'SpreadsheetCache', fn: _runCacheTests },
    { name: 'DataService', fn: _runDataServiceTests },
    { name: 'ResponseManager', fn: _runResponseManagerTests },
    { name: 'ToolAccessControl', fn: _runAccessControlTests },
    { name: 'InsightsPipeline', fn: _runInsightsPipelineTests }
  ];

  suites.forEach(function(suite) {
    Logger.log('');
    Logger.log('── ' + suite.name + ' ──────────────────────────');
    try {
      var ctx = suite.fn();
      totalPassed += ctx.passed;
      totalFailed += ctx.failed;
      suiteResults.push({ name: suite.name, passed: ctx.passed, failed: ctx.failed });
    } catch (e) {
      Logger.log('SUITE ERROR: ' + suite.name + ' — ' + e);
      totalFailed++;
      suiteResults.push({ name: suite.name, passed: 0, failed: 1, error: e.toString() });
    }
  });

  // Grand summary
  Logger.log('');
  Logger.log('╔══════════════════════════════════════════╗');
  Logger.log('║  GRAND TOTAL                             ║');
  Logger.log('╠══════════════════════════════════════════╣');
  suiteResults.forEach(function(s) {
    var status = s.failed === 0 ? 'PASS' : 'FAIL';
    Logger.log('║  ' + status + '  ' + s.name + ' (' + s.passed + '/' + (s.passed + s.failed) + ')');
  });
  Logger.log('╠══════════════════════════════════════════╣');
  Logger.log('║  Passed: ' + totalPassed + '  Failed: ' + totalFailed + '  Total: ' + (totalPassed + totalFailed));
  Logger.log('╚══════════════════════════════════════════╝');

  return { passed: totalPassed, failed: totalFailed, suites: suiteResults };
}

// ─── Individual Suite Runners (callable from Editor) ────────────────

function runCacheTests() {
  var ctx = _runCacheTests();
  printSummary(ctx);
  return ctx;
}

function runDataServiceTests() {
  var ctx = _runDataServiceTests();
  printSummary(ctx);
  return ctx;
}

function runResponseManagerTests() {
  var ctx = _runResponseManagerTests();
  printSummary(ctx);
  return ctx;
}

function runAccessControlTests() {
  var ctx = _runAccessControlTests();
  printSummary(ctx);
  return ctx;
}

function runInsightsPipelineTests() {
  var ctx = _runInsightsPipelineTests();
  printSummary(ctx);
  return ctx;
}
