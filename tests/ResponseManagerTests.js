/**
 * ResponseManagerTests.js - Tests for core/ResponseManager.js
 *
 * Tests response versioning, edit drafts, cancel/restore, and version cleanup.
 * Uses real spreadsheet writes with TEST_RUNNER_ prefixed client IDs.
 */

function _runResponseManagerTests() {
  var ctx = createTestContext('ResponseManager');
  var clientId = TestFixtures.clientId('rm');

  // Set up: add test student
  TestFixtures.addTestStudent(clientId, 'RM Test Student', 'rm-test@example.com');

  try {
    _testMarkAsNotLatest(ctx, clientId);
    _testMarkAsNotLatestInvalidatesCache(ctx, clientId);
    _testLoadResponseForEditing(ctx, clientId);
    _testEditModeStoresRowIndex(ctx, clientId);
    _testSubmitEditedResponse(ctx, clientId);
    _testCancelEditClearsDraftRowProperty(ctx, clientId);
    _testCleanupOldVersions(ctx, clientId);
    _testGetPreviousResponse(ctx, clientId);
  } catch (e) {
    assert(ctx, false, 'ResponseManager suite error', e.toString());
  } finally {
    cleanupTestData(clientId);
  }

  printSummary(ctx);
  return ctx;
}

// ── Test: markAsNotLatest ──

function _testMarkAsNotLatest(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save a completed response
  var data = TestFixtures.tool1Response();
  DataService.saveToolResponse(clientId, 'tool1', data, 'COMPLETED');

  // Verify it is latest
  SpreadsheetCache.clearCache();
  var latest = ResponseManager.getLatestResponse(clientId, 'tool1');
  assertTruthy(ctx, latest && latest.isLatest, 'Response starts as isLatest=true');

  // Mark as not latest
  ResponseManager._markAsNotLatest(clientId, 'tool1');
  SpreadsheetCache.clearCache();

  // Verify no response is marked as latest now
  var afterMark = ResponseManager.getLatestResponse(clientId, 'tool1');
  // After marking not latest, getLatestResponse should return null (nothing is latest)
  // OR the same row but with isLatest=false — depends on implementation
  // The _isTrue check on Is_Latest means it should return null
  assertNull(ctx, afterMark, 'No response is latest after markAsNotLatest');

  // Restore: save a new COMPLETED so subsequent tests work
  DataService.saveToolResponse(clientId, 'tool1', data, 'COMPLETED');
}

// ── Test: markAsNotLatest invalidates cache (not just markDirty) ──

function _testMarkAsNotLatestInvalidatesCache(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save a response so there is something to mark
  var data = TestFixtures.tool1Response();
  DataService.saveToolResponse(clientId, 'tool1', data, 'COMPLETED');

  // Pre-warm cache
  SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);

  // Mark as not latest
  ResponseManager._markAsNotLatest(clientId, 'tool1');

  // Read from cache immediately after — should reflect the update (cache was invalidated)
  var sheetData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
  var headers = sheetData[0];
  var clientCol = headers.indexOf('Client_ID');
  var toolCol = headers.indexOf('Tool_ID');
  var isLatestCol = headers.indexOf('Is_Latest');

  var foundLatest = false;
  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][clientCol] === clientId && sheetData[i][toolCol] === 'tool1' &&
        (sheetData[i][isLatestCol] === 'true' || sheetData[i][isLatestCol] === true)) {
      foundLatest = true;
    }
  }
  assert(ctx, !foundLatest, 'Cache reflects markAsNotLatest immediately (no stale data)');

  // Restore for subsequent tests
  DataService.saveToolResponse(clientId, 'tool1', data, 'COMPLETED');
}

// ── Test: loadResponseForEditing creates EDIT_DRAFT ──

function _testLoadResponseForEditing(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var result = ResponseManager.loadResponseForEditing(clientId, 'tool1');

  assertTruthy(ctx, result.success, 'loadResponseForEditing returns success');
  assertNotNull(ctx, result.draft, 'loadResponseForEditing returns draft object');
  assertTruthy(ctx, result.draft._editMode, 'Draft has _editMode=true');

  // Verify an EDIT_DRAFT row exists
  SpreadsheetCache.clearCache();
  var draft = ResponseManager.getActiveDraft(clientId, 'tool1');
  assertNotNull(ctx, draft, 'EDIT_DRAFT is retrievable via getActiveDraft');
  assertEqual(ctx, draft.status, 'EDIT_DRAFT', 'Draft has EDIT_DRAFT status');
}

// ── Test: loadResponseForEditing stores _draftRow_ property ──

function _testEditModeStoresRowIndex(ctx, clientId) {
  // EDIT_DRAFT was created by the previous test — check that row index was stored
  var stored = null;
  try {
    stored = PropertiesService.getUserProperties().getProperty('_draftRow_tool1_' + clientId);
  } catch (e) { /* fall through */ }

  assertNotNull(ctx, stored, '_draftRow_ property is set after loadResponseForEditing');
  var rowIdx = parseInt(stored);
  assert(ctx, rowIdx >= 2, '_draftRow_ is a valid row index (>= 2)', 'Got: ' + rowIdx);
}

// ── Test: submitEditedResponse replaces EDIT_DRAFT with new COMPLETED ──

function _testSubmitEditedResponse(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // We should have an EDIT_DRAFT from the previous test
  // Submit edited response with modified data
  var editedData = TestFixtures.tool1Response();
  editedData.winner = 'cli';

  var result = ResponseManager.submitEditedResponse(clientId, 'tool1', editedData);
  assertTruthy(ctx, result.success, 'submitEditedResponse returns success');

  // Verify EDIT_DRAFT is gone
  SpreadsheetCache.clearCache();
  var draft = ResponseManager.getActiveDraft(clientId, 'tool1');
  assertNull(ctx, draft, 'No EDIT_DRAFT remains after submitEditedResponse');

  // Verify new COMPLETED is latest
  var latest = ResponseManager.getLatestResponse(clientId, 'tool1');
  assertNotNull(ctx, latest, 'New COMPLETED response exists');
  assertEqual(ctx, latest.status, 'COMPLETED', 'Latest response is COMPLETED');
  assertEqual(ctx, latest.data.winner, 'cli', 'Latest response has edited data');
  assertTruthy(ctx, latest.isLatest, 'Latest response has isLatest=true');
}

// ── Test: cancelEditDraft removes draft and restores previous COMPLETED ──

function _testCancelEditDraft(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Create an edit draft first
  var loadResult = ResponseManager.loadResponseForEditing(clientId, 'tool1');
  assertTruthy(ctx, loadResult.success, 'loadResponseForEditing for cancel test');

  // Verify draft exists
  SpreadsheetCache.clearCache();
  var draftBefore = ResponseManager.getActiveDraft(clientId, 'tool1');
  assertNotNull(ctx, draftBefore, 'EDIT_DRAFT exists before cancel');

  // Cancel the draft
  var cancelResult = ResponseManager.cancelEditDraft(clientId, 'tool1');
  assertTruthy(ctx, cancelResult.success, 'cancelEditDraft returns success');

  // Verify draft is gone
  SpreadsheetCache.clearCache();
  var draftAfter = ResponseManager.getActiveDraft(clientId, 'tool1');
  assertNull(ctx, draftAfter, 'No draft after cancelEditDraft');

  // Verify a COMPLETED response is restored as latest
  var restored = ResponseManager.getLatestResponse(clientId, 'tool1');
  assertNotNull(ctx, restored, 'COMPLETED response restored after cancel');
  assertEqual(ctx, restored.status, 'COMPLETED', 'Restored response is COMPLETED');
  assertTruthy(ctx, restored.isLatest, 'Restored response has isLatest=true');
}

// ── Test: cancelEditDraft clears _draftRow_ property ──

function _testCancelEditClearsDraftRowProperty(ctx, clientId) {
  // After cancelEditDraft (above), the _draftRow_ property should be deleted
  var stored = null;
  try {
    stored = PropertiesService.getUserProperties().getProperty('_draftRow_tool1_' + clientId);
  } catch (e) { /* fall through */ }

  assertNull(ctx, stored, '_draftRow_ property is cleared after cancelEditDraft');
}

// ── Test: cleanupOldVersions keeps only N most recent ──

function _testCleanupOldVersions(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save 4 more COMPLETED versions of tool1 (there is already at least 1)
  for (var i = 0; i < 4; i++) {
    var data = TestFixtures.tool1Response();
    data.winner = 'version_' + i;
    DataService.saveToolResponse(clientId, 'tool1', data, 'COMPLETED');
    SpreadsheetCache.clearCache();
  }

  // Count COMPLETED versions before cleanup
  var allBefore = ResponseManager.getAllResponses(clientId, 'tool1', 20);
  var completedBefore = allBefore.filter(function(r) { return r.status === 'COMPLETED'; });
  assert(ctx, completedBefore.length >= 4,
    'At least 4 COMPLETED versions exist before cleanup',
    'Got: ' + completedBefore.length);

  // Run cleanup (keep 2)
  ResponseManager._cleanupOldVersions(clientId, 'tool1', 2);
  SpreadsheetCache.clearCache();

  // Count COMPLETED versions after cleanup
  var allAfter = ResponseManager.getAllResponses(clientId, 'tool1', 20);
  var completedAfter = allAfter.filter(function(r) { return r.status === 'COMPLETED'; });
  assertEqual(ctx, completedAfter.length, 2,
    'Only 2 COMPLETED versions remain after cleanup');

  // Verify latest is still accessible
  var latest = ResponseManager.getLatestResponse(clientId, 'tool1');
  assertNotNull(ctx, latest, 'Latest response still accessible after cleanup');
  assertTruthy(ctx, latest.isLatest, 'Latest still has isLatest=true after cleanup');
}

// ── Test: getPreviousResponse returns older COMPLETED ──

function _testGetPreviousResponse(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // We should have 2 COMPLETED versions after cleanup
  var previous = ResponseManager.getPreviousResponse(clientId, 'tool1');

  // Previous should be the older of the 2 COMPLETED versions (isLatest=false)
  assertNotNull(ctx, previous, 'getPreviousResponse returns a response');
  assertEqual(ctx, previous.status, 'COMPLETED', 'Previous response is COMPLETED');
  // isLatest should be false for previous
  assertEqual(ctx, previous.isLatest, false, 'Previous response has isLatest=false');
}
