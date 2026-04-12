/**
 * DataServiceTests.js - Tests for core/DataService.js
 *
 * Tests the data persistence layer: save, retrieve, update status,
 * draft lifecycle, and student tools completed count.
 *
 * Uses real spreadsheet writes with TEST_RUNNER_ prefixed client IDs.
 * Cleans up all test data after each run.
 */

function _runDataServiceTests() {
  var ctx = createTestContext('DataService');
  var clientId = TestFixtures.clientId('ds');

  // Set up: add test student to STUDENTS sheet
  TestFixtures.addTestStudent(clientId, 'DS Test Student', 'ds-test@example.com');

  try {
    _testSaveAndRetrieveResponse(ctx, clientId);
    _testGetLatestResponse(ctx, clientId);
    _testUpdateToolStatus(ctx, clientId);
    _testDraftLifecycle(ctx, clientId);
    _testUpdateStudentToolsCompletedCount(ctx, clientId);
    _testGetToolStatusReturnsNull(ctx, clientId);
    _testUpsertDraftCreatesOnFirstCall(ctx, clientId);
    _testUpsertDraftUpdatesOnSecondCall(ctx, clientId);
    _testUpsertDraftWithStaleRowHint(ctx, clientId);
    _testNoDuplicateIsLatestAfterMultipleSaves(ctx, clientId);
  } catch (e) {
    assert(ctx, false, 'DataService suite error', e.toString());
  } finally {
    // Clean up all test data
    cleanupTestData(clientId);
  }

  printSummary(ctx);
  return ctx;
}

// ── Test: Save and retrieve a tool response ──

function _testSaveAndRetrieveResponse(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var data = TestFixtures.tool1Response();
  var result = DataService.saveToolResponse(clientId, 'tool1', data, 'COMPLETED');

  assertTruthy(ctx, result.success, 'saveToolResponse returns success');

  // Retrieve it
  SpreadsheetCache.clearCache();
  var retrieved = DataService.getToolResponse(clientId, 'tool1');

  assertNotNull(ctx, retrieved, 'getToolResponse returns saved response');
  assertEqual(ctx, retrieved.clientId, clientId, 'Retrieved response has correct clientId');
  assertEqual(ctx, retrieved.toolId, 'tool1', 'Retrieved response has correct toolId');
  assertEqual(ctx, retrieved.data.winner, 'exval', 'Retrieved response data is intact');
}

// ── Test: getLatestResponse returns most recent ──

function _testGetLatestResponse(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save a second version with different winner
  var data2 = TestFixtures.tool1Response();
  data2.winner = 'fsv';
  DataService.saveToolResponse(clientId, 'tool1', data2, 'COMPLETED');

  SpreadsheetCache.clearCache();
  var latest = DataService.getLatestResponse(clientId, 'tool1');

  assertNotNull(ctx, latest, 'getLatestResponse returns a response');
  assertEqual(ctx, latest.status, 'COMPLETED', 'Latest response is COMPLETED');
  assertEqual(ctx, latest.data.winner, 'fsv', 'Latest response has updated data');
  assertTruthy(ctx, latest.isLatest, 'Latest response has isLatest = true');
}

// ── Test: Update tool status ──

function _testUpdateToolStatus(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var result = DataService.updateToolStatus(clientId, 'tool1', 'completed');
  assertTruthy(ctx, result.success, 'updateToolStatus returns success');

  SpreadsheetCache.clearCache();
  var status = DataService.getToolStatus(clientId, 'tool1');
  assertEqual(ctx, status, 'completed', 'getToolStatus returns updated status');
}

// ── Test: Draft save and update lifecycle ──

function _testDraftLifecycle(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save initial draft
  var draftData = { q1: 3, q2: 4, page: 1 };
  var result = DataService.saveDraft(clientId, 'tool3', draftData);
  assertTruthy(ctx, result.success, 'saveDraft returns success');

  // Check that draft is retrievable
  SpreadsheetCache.clearCache();
  var draft = DataService.getActiveDraft(clientId, 'tool3');
  assertNotNull(ctx, draft, 'getActiveDraft returns saved draft');
  assertEqual(ctx, draft.status, 'DRAFT', 'Draft has DRAFT status');
  assertEqual(ctx, draft.data.q1, 3, 'Draft data is intact');

  // Update draft with page 2 data
  var updatedData = { q1: 3, q2: 4, q3: 5, page: 2 };
  var updateResult = DataService.updateDraft(clientId, 'tool3', updatedData);
  assertTruthy(ctx, updateResult.success, 'updateDraft returns success');

  // Verify update
  SpreadsheetCache.clearCache();
  var updatedDraft = DataService.getActiveDraft(clientId, 'tool3');
  assertNotNull(ctx, updatedDraft, 'Updated draft is retrievable');
  assertEqual(ctx, updatedDraft.data.q3, 5, 'Updated draft has new page 2 data');
  assertEqual(ctx, updatedDraft.data.q1, 3, 'Updated draft preserved page 1 data');
}

// ── Test: Update student tools completed count ──

function _testUpdateStudentToolsCompletedCount(ctx, clientId) {
  // We already have tool1 COMPLETED from earlier tests
  // Save tool2 as completed
  SpreadsheetCache.clearCache();
  DataService.saveToolResponse(clientId, 'tool2', TestFixtures.tool2Response(), 'COMPLETED');

  // The count should now be 2 (tool1 + tool2)
  // saveToolResponse already calls updateStudentToolsCompletedCount internally
  SpreadsheetCache.clearCache();

  // Read STUDENTS sheet to verify count
  var studentsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS);
  var found = false;
  for (var i = 1; i < studentsData.length; i++) {
    if (studentsData[i][0] === clientId) {
      // Column G (index 6) is Tools_Completed
      var count = studentsData[i][6];
      assert(ctx, count >= 2, 'Student tools completed count is at least 2',
        'Got count: ' + count);
      found = true;
      break;
    }
  }
  assertTruthy(ctx, found, 'Test student found in STUDENTS sheet');
}

// ── Test: getToolStatus returns null for non-existent ──

function _testGetToolStatusReturnsNull(ctx, clientId) {
  SpreadsheetCache.clearCache();
  var status = DataService.getToolStatus(clientId, 'tool8');
  // tool8 was never completed, so status should be null or empty
  assert(ctx, !status, 'getToolStatus returns null/empty for uncompleted tool',
    'Got: ' + JSON.stringify(status));
}

// ── Test: upsertDraft creates a single DRAFT row on first call ──

function _testUpsertDraftCreatesOnFirstCall(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var data = { q1: 'answer1', page: 1 };
  var result = DataService.upsertDraft(clientId, 'tool5', data, null);

  assertTruthy(ctx, result.success, 'upsertDraft returns success on create');
  assertEqual(ctx, result.action, 'created', 'upsertDraft action is created');
  assertTruthy(ctx, result.rowIndex >= 2, 'upsertDraft returns valid rowIndex');

  // Verify exactly one Is_Latest=true row for this client/tool
  SpreadsheetCache.clearCache();
  var draft = DataService.getActiveDraft(clientId, 'tool5');
  assertNotNull(ctx, draft, 'Draft is retrievable after upsert create');
  assertEqual(ctx, draft.status, 'DRAFT', 'Created row has DRAFT status');
}

// ── Test: upsertDraft updates existing row on second call ──

function _testUpsertDraftUpdatesOnSecondCall(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Second upsert with updated data and the row hint from first call
  var data2 = { q1: 'answer1', q2: 'answer2', page: 2 };
  var firstDraft = DataService.getActiveDraft(clientId, 'tool5');
  var result = DataService.upsertDraft(clientId, 'tool5', data2, null);

  assertTruthy(ctx, result.success, 'upsertDraft returns success on update');
  assertEqual(ctx, result.action, 'updated', 'upsertDraft action is updated');

  // Verify data was merged/replaced
  SpreadsheetCache.clearCache();
  var draft = DataService.getActiveDraft(clientId, 'tool5');
  assertNotNull(ctx, draft, 'Draft still retrievable after upsert update');
  assertEqual(ctx, draft.data.q2, 'answer2', 'Updated draft has new page 2 data');

  // Count Is_Latest=true rows for this client/tool — should be exactly 1
  var sheetData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
  var headers = sheetData[0];
  var clientCol = headers.indexOf('Client_ID');
  var toolCol = headers.indexOf('Tool_ID');
  var isLatestCol = headers.indexOf('Is_Latest');
  var latestCount = 0;
  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][clientCol] === clientId && sheetData[i][toolCol] === 'tool5' &&
        (sheetData[i][isLatestCol] === 'true' || sheetData[i][isLatestCol] === true)) {
      latestCount++;
    }
  }
  assertEqual(ctx, latestCount, 1, 'Exactly one Is_Latest=true row after two upserts');
}

// ── Test: upsertDraft with stale row hint falls back to scan ──

function _testUpsertDraftWithStaleRowHint(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var data = { q1: 'answer1', q3: 'answer3', page: 3 };
  // Pass a bogus row hint — should fall back to scan and still update
  var result = DataService.upsertDraft(clientId, 'tool5', data, 99999);

  assertTruthy(ctx, result.success, 'upsertDraft succeeds with stale row hint');
  assertEqual(ctx, result.action, 'updated', 'Falls back to scan and updates existing row');

  SpreadsheetCache.clearCache();
  var draft = DataService.getActiveDraft(clientId, 'tool5');
  assertEqual(ctx, draft.data.q3, 'answer3', 'Data updated via scan fallback');
}

// ── Test: No duplicate Is_Latest after rapid multi-page saves ──

function _testNoDuplicateIsLatestAfterMultipleSaves(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Simulate rapid page 1-3 saves for a new tool
  var toolId = 'tool7';
  for (var page = 1; page <= 3; page++) {
    var data = {};
    data['page' + page + '_q1'] = 'val' + page;
    DataService.upsertDraft(clientId, toolId, data, null);
  }

  // Count Is_Latest=true rows
  SpreadsheetCache.clearCache();
  var sheetData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
  var headers = sheetData[0];
  var clientCol = headers.indexOf('Client_ID');
  var toolCol = headers.indexOf('Tool_ID');
  var isLatestCol = headers.indexOf('Is_Latest');
  var latestCount = 0;
  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][clientCol] === clientId && sheetData[i][toolCol] === toolId &&
        (sheetData[i][isLatestCol] === 'true' || sheetData[i][isLatestCol] === true)) {
      latestCount++;
    }
  }
  assertEqual(ctx, latestCount, 1, 'Exactly one Is_Latest=true after 3 rapid upserts');
}
