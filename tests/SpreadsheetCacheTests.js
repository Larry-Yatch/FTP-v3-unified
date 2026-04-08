/**
 * SpreadsheetCacheTests.js - Tests for core/SpreadsheetCache.js
 *
 * Tests cache hit/miss behavior, invalidation, and data caching.
 * These tests use the real spreadsheet (reads only, no writes).
 */

function _runCacheTests() {
  var ctx = createTestContext('SpreadsheetCache');

  // Reset cache state before tests
  SpreadsheetCache.clearCache();

  // ── Test 1: First call is a cache miss ──
  try {
    SpreadsheetCache.clearCache();
    var stats1 = SpreadsheetCache.getStats();
    assertEqual(ctx, stats1.isCached, false, 'Cache starts empty');

    var ss = SpreadsheetCache.getSpreadsheet();
    assertNotNull(ctx, ss, 'getSpreadsheet returns spreadsheet object');

    var stats2 = SpreadsheetCache.getStats();
    assertEqual(ctx, stats2.misses, 1, 'First call is a cache miss');
    assertEqual(ctx, stats2.isCached, true, 'Spreadsheet is now cached');
  } catch (e) {
    assert(ctx, false, 'Cache miss test', e.toString());
  }

  // ── Test 2: Second call is a cache hit ──
  try {
    var ss2 = SpreadsheetCache.getSpreadsheet();
    assertNotNull(ctx, ss2, 'Second getSpreadsheet returns object');

    var stats3 = SpreadsheetCache.getStats();
    assertEqual(ctx, stats3.hits, 1, 'Second call is a cache hit');
    assertEqual(ctx, stats3.misses, 1, 'Miss count unchanged');
  } catch (e) {
    assert(ctx, false, 'Cache hit test', e.toString());
  }

  // ── Test 3: getSheetData caches per sheet ──
  try {
    SpreadsheetCache.clearCache();
    var data1 = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
    assertNotNull(ctx, data1, 'getSheetData returns data for RESPONSES');
    assert(ctx, Array.isArray(data1), 'Data is an array');
    assert(ctx, data1.length >= 1, 'Data has at least header row');

    // Second call should use data cache
    var data2 = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
    assertNotNull(ctx, data2, 'Second getSheetData returns data');
    assertEqual(ctx, data1.length, data2.length, 'Cached data matches original length');
  } catch (e) {
    assert(ctx, false, 'Sheet data cache test', e.toString());
  }

  // ── Test 4: invalidateSheetData clears specific sheet cache ──
  try {
    // Ensure RESPONSES is cached
    SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);

    // Also cache TOOL_STATUS
    SpreadsheetCache.getSheetData(CONFIG.SHEETS.TOOL_STATUS);

    // Invalidate only RESPONSES
    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);

    // RESPONSES should be cleared from _dataCache
    assertEqual(ctx, SpreadsheetCache._dataCache[CONFIG.SHEETS.RESPONSES], undefined,
      'RESPONSES cache cleared after invalidation');

    // TOOL_STATUS should still be cached
    assertNotNull(ctx, SpreadsheetCache._dataCache[CONFIG.SHEETS.TOOL_STATUS],
      'TOOL_STATUS cache preserved after RESPONSES invalidation');
  } catch (e) {
    assert(ctx, false, 'Selective invalidation test', e.toString());
  }

  // ── Test 5: clearCache resets everything ──
  try {
    // Populate some cache state
    SpreadsheetCache.getSpreadsheet();
    SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);

    SpreadsheetCache.clearCache();

    var stats = SpreadsheetCache.getStats();
    assertEqual(ctx, stats.hits, 0, 'Hits reset to 0 after clearCache');
    assertEqual(ctx, stats.misses, 0, 'Misses reset to 0 after clearCache');
    assertEqual(ctx, stats.isCached, false, 'Spreadsheet cleared after clearCache');
    assertEqual(ctx, Object.keys(SpreadsheetCache._dataCache).length, 0,
      'Data cache empty after clearCache');
  } catch (e) {
    assert(ctx, false, 'clearCache test', e.toString());
  }

  // ── Test 6: getSheet returns null for nonexistent sheet ──
  try {
    var badSheet = SpreadsheetCache.getSheet('NONEXISTENT_SHEET_12345');
    assertNull(ctx, badSheet, 'getSheet returns null for nonexistent sheet');
  } catch (e) {
    assert(ctx, false, 'Nonexistent sheet test', e.toString());
  }

  // ── Test 7: getSheetData returns null for nonexistent sheet ──
  try {
    var badData = SpreadsheetCache.getSheetData('NONEXISTENT_SHEET_12345');
    assertNull(ctx, badData, 'getSheetData returns null for nonexistent sheet');
  } catch (e) {
    assert(ctx, false, 'Nonexistent sheet data test', e.toString());
  }

  // Clean up
  SpreadsheetCache.clearCache();

  printSummary(ctx);
  return ctx;
}
