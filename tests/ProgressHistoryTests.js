/**
 * ProgressHistoryTests.js - Tests for ProgressHistory
 *
 * Tests score extraction, version numbering, history retrieval,
 * and cache integration.
 *
 * Run: runProgressHistoryTests() from Apps Script Editor
 */

function _runProgressHistoryTests() {
  var ctx = createTestContext('ProgressHistory');
  var clientId = TEST_CLIENT_PREFIX + 'PROGRESS';

  try {
    // Clean up before tests
    cleanupTestData(clientId);
    SpreadsheetCache.clearCache();

    // ─── extractScores Tests ──────────────────────────────────────

    // Tool 1: valid data
    var tool1Data = {
      scores: { FSV: 12, ExVal: 8, Showing: 10, Receiving: 6, Control: 14, Fear: 9 },
      winner: 'Control'
    };
    var t1Scores = ProgressHistory.extractScores('tool1', tool1Data);
    assertNotNull(ctx, t1Scores, 'extractScores: tool1 returns scores');
    assertEqual(ctx, t1Scores.scores.Control, 14, 'extractScores: tool1 Control score correct');
    assertEqual(ctx, t1Scores.winner, 'Control', 'extractScores: tool1 winner correct');

    // Tool 2: valid data
    var tool2Data = {
      results: {
        domainScores: { moneyFlow: 75, obligations: 60, liquidity: 80, growth: 55, protection: 70 },
        archetype: 'Builder'
      }
    };
    var t2Scores = ProgressHistory.extractScores('tool2', tool2Data);
    assertNotNull(ctx, t2Scores, 'extractScores: tool2 returns scores');
    assertEqual(ctx, t2Scores.domainScores.moneyFlow, 75, 'extractScores: tool2 moneyFlow correct');
    assertEqual(ctx, t2Scores.archetype, 'Builder', 'extractScores: tool2 archetype correct');

    // Grounding tool: valid data
    var tool3Data = {
      scoring: {
        overallQuotient: 72,
        domainQuotients: { domain1: 65, domain2: 79 },
        subdomainQuotients: {
          subdomain_1_1: 60, subdomain_1_2: 65, subdomain_1_3: 70,
          subdomain_2_1: 75, subdomain_2_2: 80, subdomain_2_3: 82
        }
      }
    };
    var t3Scores = ProgressHistory.extractScores('tool3', tool3Data);
    assertNotNull(ctx, t3Scores, 'extractScores: tool3 returns scores');
    assertEqual(ctx, t3Scores.overallQuotient, 72, 'extractScores: tool3 overallQuotient correct');
    assertEqual(ctx, t3Scores.domainQuotients.domain1, 65, 'extractScores: tool3 domain1 correct');

    // Null/missing data
    assertNull(ctx, ProgressHistory.extractScores('tool1', null), 'extractScores: null data returns null');
    assertNull(ctx, ProgressHistory.extractScores('tool1', {}), 'extractScores: empty object returns null (no scores)');
    assertNull(ctx, ProgressHistory.extractScores('tool4', tool1Data), 'extractScores: non-tracked tool returns null');

    // Tool 2 missing domainScores
    assertNull(ctx, ProgressHistory.extractScores('tool2', { results: {} }),
      'extractScores: tool2 missing domainScores returns null');

    // Grounding tool missing scoring
    assertNull(ctx, ProgressHistory.extractScores('tool5', {}),
      'extractScores: grounding tool missing scoring returns null');

    // ─── _getNextVersion Tests ────────────────────────────────────

    // Simulated sheet data array (as returned by SpreadsheetCache.getSheetData)
    var mockData = [
      ['Timestamp', 'Client_ID', 'Tool_ID', 'Version_Number', 'Scores_JSON', 'Summary', 'Source'],
      [new Date(), clientId, 'tool1', 1, '{}', 'v1', 'completion'],
      [new Date(), clientId, 'tool1', 2, '{}', 'v2', 'completion'],
      [new Date(), clientId, 'tool2', 1, '{}', 'v1', 'completion'],
      [new Date(), 'OTHER_CLIENT', 'tool1', 5, '{}', 'v5', 'completion']
    ];

    var nextV = ProgressHistory._getNextVersion(mockData, clientId, 'tool1');
    assertEqual(ctx, nextV, 3, '_getNextVersion: returns max+1 for existing entries');

    var nextV2 = ProgressHistory._getNextVersion(mockData, clientId, 'tool3');
    assertEqual(ctx, nextV2, 1, '_getNextVersion: returns 1 for new tool');

    var nextVOther = ProgressHistory._getNextVersion(mockData, 'OTHER_CLIENT', 'tool1');
    assertEqual(ctx, nextVOther, 6, '_getNextVersion: respects client isolation');

    // Empty data (headers only)
    var emptyData = [['Timestamp', 'Client_ID', 'Tool_ID', 'Version_Number', 'Scores_JSON', 'Summary', 'Source']];
    assertEqual(ctx, ProgressHistory._getNextVersion(emptyData, clientId, 'tool1'), 1,
      '_getNextVersion: returns 1 for empty sheet');

    // ─── _generateSummary Tests ───────────────────────────────────

    var summary1 = ProgressHistory._generateSummary('tool1', t1Scores);
    assert(ctx, summary1.indexOf('Control') !== -1, '_generateSummary: tool1 mentions winner');

    var summary2 = ProgressHistory._generateSummary('tool2', t2Scores);
    assert(ctx, summary2.indexOf('Builder') !== -1, '_generateSummary: tool2 mentions archetype');

    var summary3 = ProgressHistory._generateSummary('tool3', t3Scores);
    assert(ctx, summary3.indexOf('72') !== -1, '_generateSummary: tool3 mentions quotient');

    assertEqual(ctx, ProgressHistory._generateSummary('tool1', null), '',
      '_generateSummary: null scores returns empty string');

    // ─── Integration: recordCompletion + getAllHistory ─────────────

    // Record a completion
    ProgressHistory.recordCompletion(clientId, 'tool1', tool1Data);
    SpreadsheetCache.clearCache();

    var history = ProgressHistory.getAllHistory(clientId);
    assert(ctx, history.tool1.length >= 1, 'recordCompletion+getAllHistory: tool1 has entries');
    assertEqual(ctx, history.tool1[0].scores.winner, 'Control',
      'recordCompletion+getAllHistory: scores round-trip correctly');

    // Record a second completion
    var tool1DataV2 = {
      scores: { FSV: 15, ExVal: 10, Showing: 8, Receiving: 7, Control: 11, Fear: 12 },
      winner: 'FSV'
    };
    ProgressHistory.recordCompletion(clientId, 'tool1', tool1DataV2);
    SpreadsheetCache.clearCache();

    var history2 = ProgressHistory.getAllHistory(clientId);
    assert(ctx, history2.tool1.length >= 2, 'recordCompletion: second entry recorded');
    // Should be sorted by version ascending
    assert(ctx, history2.tool1[0].versionNumber < history2.tool1[1].versionNumber,
      'getAllHistory: entries sorted by version ascending');

    // Non-tracked tool should be skipped
    ProgressHistory.recordCompletion(clientId, 'tool4', { some: 'data' });
    SpreadsheetCache.clearCache();
    var history3 = ProgressHistory.getAllHistory(clientId);
    assert(ctx, !history3.tool4, 'recordCompletion: non-tracked tool not recorded');

  } catch (error) {
    ctx.failed++;
    ctx.errors.push('SUITE ERROR: ' + error);
    Logger.log('SUITE ERROR: ' + error);
  } finally {
    // Cleanup
    cleanupTestData(clientId);
    SpreadsheetCache.clearCache();
  }

  printSummary(ctx);
  return ctx;
}
