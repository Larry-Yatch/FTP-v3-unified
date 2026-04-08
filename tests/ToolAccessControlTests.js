/**
 * ToolAccessControlTests.js - Tests for core/ToolAccessControl.js
 *
 * Tests linear progression, auto-unlock, and admin override.
 * Uses real spreadsheet writes with TEST_RUNNER_ prefixed client IDs.
 */

function _runAccessControlTests() {
  var ctx = createTestContext('ToolAccessControl');
  var clientId = TestFixtures.clientId('ac');

  // Set up: add test student
  TestFixtures.addTestStudent(clientId, 'AC Test Student', 'ac-test@example.com');

  try {
    _testTool1AlwaysAccessible(ctx, clientId);
    _testLinearProgressionBlocks(ctx, clientId);
    _testAutoUnlockAfterCompletion(ctx, clientId);
    _testAdminUnlock(ctx, clientId);
    _testAdminLock(ctx, clientId);
    _testInitializeStudent(ctx, clientId);
    _testGetStudentAccess(ctx, clientId);
    _testCanAccessToolBatch(ctx, clientId);
  } catch (e) {
    assert(ctx, false, 'ToolAccessControl suite error', e.toString());
  } finally {
    cleanupTestData(clientId);
  }

  printSummary(ctx);
  return ctx;
}

// ── Test: Tool 1 is always accessible ──

function _testTool1AlwaysAccessible(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var result = ToolAccessControl.canAccessTool(clientId, 'tool1');
  assertTruthy(ctx, result.allowed, 'Tool 1 is always accessible');
}

// ── Test: Linear progression blocks tool2 when tool1 not completed ──

function _testLinearProgressionBlocks(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Tool2 should be blocked since tool1 is not completed yet
  var result = ToolAccessControl.canAccessTool(clientId, 'tool2');
  assertEqual(ctx, result.allowed, false, 'Tool 2 blocked when tool 1 not completed');
  assertNotNull(ctx, result.reason, 'Blocked result includes reason');

  // Tool3 should also be blocked
  var result3 = ToolAccessControl.canAccessTool(clientId, 'tool3');
  assertEqual(ctx, result3.allowed, false, 'Tool 3 blocked when tool 2 not completed');
}

// ── Test: Auto-unlock after completing prerequisite ──

function _testAutoUnlockAfterCompletion(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Complete tool1
  DataService.saveToolResponse(clientId, 'tool1', TestFixtures.tool1Response(), 'COMPLETED');
  SpreadsheetCache.clearCache();

  // Now tool2 should be accessible
  var result = ToolAccessControl.canAccessTool(clientId, 'tool2');
  assertTruthy(ctx, result.allowed, 'Tool 2 accessible after tool 1 completed');

  // Verify auto-unlock record was created
  SpreadsheetCache.clearCache();
  var accessRecord = ToolAccessControl._getAccessRecord(clientId, 'tool2');
  assertNotNull(ctx, accessRecord, 'Auto-unlock record exists for tool2');
  assertEqual(ctx, accessRecord.status, 'unlocked', 'Tool2 record status is unlocked');

  // Tool3 should still be blocked (tool2 not completed)
  var result3 = ToolAccessControl.canAccessTool(clientId, 'tool3');
  assertEqual(ctx, result3.allowed, false, 'Tool 3 still blocked (tool 2 not completed)');
}

// ── Test: Admin can manually unlock a tool ──

function _testAdminUnlock(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Admin unlock tool5 (skipping tool3 and tool4)
  var result = ToolAccessControl.adminUnlockTool(
    clientId, 'tool5', 'admin@test.com', 'Testing admin unlock'
  );
  assertTruthy(ctx, result.success, 'adminUnlockTool returns success');

  // Tool5 should now be accessible
  SpreadsheetCache.clearCache();
  var access = ToolAccessControl.canAccessTool(clientId, 'tool5');
  assertTruthy(ctx, access.allowed, 'Tool 5 accessible after admin unlock');

  // Verify the record
  var record = ToolAccessControl._getAccessRecord(clientId, 'tool5');
  assertEqual(ctx, record.status, 'unlocked', 'Tool5 record is unlocked');
  assertEqual(ctx, record.lockedBy, 'admin@test.com', 'Unlock recorded admin email');
}

// ── Test: Admin can lock a tool ──

function _testAdminLock(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Lock tool5 (which was just unlocked)
  var result = ToolAccessControl.adminLockTool(
    clientId, 'tool5', 'admin@test.com', 'Testing admin lock'
  );
  assertTruthy(ctx, result.success, 'adminLockTool returns success');

  // Tool5 should now be blocked
  SpreadsheetCache.clearCache();
  var access = ToolAccessControl.canAccessTool(clientId, 'tool5');
  assertEqual(ctx, access.allowed, false, 'Tool 5 blocked after admin lock');
}

// ── Test: initializeStudent creates 8 tool records ──

function _testInitializeStudent(ctx, clientId) {
  // Use a separate client for this test to avoid conflicts
  var initClientId = TestFixtures.clientId('ac_init');
  TestFixtures.addTestStudent(initClientId, 'Init Test', 'init@test.com');

  try {
    SpreadsheetCache.clearCache();

    var result = ToolAccessControl.initializeStudent(initClientId);
    assertTruthy(ctx, result.success, 'initializeStudent returns success');

    // Verify 8 records exist
    SpreadsheetCache.clearCache();
    var records = ToolAccessControl.getStudentAccess(initClientId);
    assertEqual(ctx, records.length, 8, 'initializeStudent creates 8 records');

    // Tool1 should be unlocked
    var tool1Record = records.find(function(r) { return r.toolId === 'tool1'; });
    assertNotNull(ctx, tool1Record, 'Tool1 record exists');
    assertEqual(ctx, tool1Record.status, 'unlocked', 'Tool1 starts unlocked');

    // Tool2 should be locked
    var tool2Record = records.find(function(r) { return r.toolId === 'tool2'; });
    assertNotNull(ctx, tool2Record, 'Tool2 record exists');
    assertEqual(ctx, tool2Record.status, 'locked', 'Tool2 starts locked');
  } finally {
    cleanupTestData(initClientId);
  }
}

// ── Test: canAccessToolBatch returns access for all 8 tools ──

function _testCanAccessToolBatch(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // clientId has tool1 completed from earlier tests
  var results = ToolAccessControl.canAccessToolBatch(clientId);

  assertNotNull(ctx, results, 'canAccessToolBatch returns results object');
  assertNotNull(ctx, results['tool1'], 'Batch results include tool1');
  assertNotNull(ctx, results['tool8'], 'Batch results include tool8');

  // Tool1 should be allowed (always accessible)
  assertTruthy(ctx, results['tool1'].allowed, 'Batch: tool1 is allowed');

  // Tool2 should be allowed (tool1 was completed earlier)
  assertTruthy(ctx, results['tool2'].allowed, 'Batch: tool2 is allowed (tool1 completed)');

  // Tool3 should be blocked (tool2 not completed)
  assertEqual(ctx, results['tool3'].allowed, false, 'Batch: tool3 is blocked (tool2 not completed)');

  // Results should match individual canAccessTool calls
  SpreadsheetCache.clearCache();
  var individual = ToolAccessControl.canAccessTool(clientId, 'tool2');
  assertEqual(ctx, results['tool2'].allowed, individual.allowed,
    'Batch result matches individual canAccessTool for tool2');
}

// ── Test: getStudentAccess returns all tool records ──

function _testGetStudentAccess(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var records = ToolAccessControl.getStudentAccess(clientId);
  assert(ctx, records.length > 0, 'getStudentAccess returns records',
    'Got: ' + records.length + ' records');

  // Each record should have the expected fields
  var first = records[0];
  assertNotNull(ctx, first.clientId, 'Record has clientId');
  assertNotNull(ctx, first.toolId, 'Record has toolId');
  assertNotNull(ctx, first.status, 'Record has status');
}
