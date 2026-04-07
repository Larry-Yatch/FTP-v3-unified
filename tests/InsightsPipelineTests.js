/**
 * InsightsPipelineTests.js - Tests for core/InsightsPipeline.js
 *
 * Tests condition evaluation (pure logic), insight archiving,
 * relevance filtering, and priority sorting.
 * Uses real spreadsheet writes with TEST_RUNNER_ prefixed client IDs.
 */

function _runInsightsPipelineTests() {
  var ctx = createTestContext('InsightsPipeline');
  var clientId = TestFixtures.clientId('ip');

  // Set up: add test student
  TestFixtures.addTestStudent(clientId, 'IP Test Student', 'ip-test@example.com');

  try {
    _testEvaluateConditionOperators(ctx);
    _testEvaluateConditionEdgeCases(ctx);
    _testSaveAndRetrieveInsights(ctx, clientId);
    _testArchiveOldInsights(ctx, clientId);
    _testGetRelevantInsights(ctx, clientId);
    _testPrioritySorting(ctx, clientId);
    _testCreateInsightFromMapping(ctx, clientId);
  } catch (e) {
    assert(ctx, false, 'InsightsPipeline suite error', e.toString());
  } finally {
    cleanupTestData(clientId);
  }

  printSummary(ctx);
  return ctx;
}

// ── Test: evaluateCondition with all operators (pure logic, no sheet access) ──

function _testEvaluateConditionOperators(ctx) {
  var data = { totalScore: 15, winner: 'exval', label: 'External Validation' };

  // >= operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '>=', value: 15 }, data),
    'evaluateCondition: >= with equal value');
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '>=', value: 10 }, data),
    'evaluateCondition: >= with lesser value');
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '>=', value: 20 }, data),
    'evaluateCondition: >= fails with greater value');

  // > operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '>', value: 10 }, data),
    'evaluateCondition: > with lesser value');
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '>', value: 15 }, data),
    'evaluateCondition: > fails with equal value');

  // < operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '<', value: 20 }, data),
    'evaluateCondition: < with greater value');

  // <= operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '<=', value: 15 }, data),
    'evaluateCondition: <= with equal value');

  // == operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'winner', operator: '==', value: 'exval' }, data),
    'evaluateCondition: == string match');
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'winner', operator: '==', value: 'fsv' }, data),
    'evaluateCondition: == string mismatch');

  // === operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'winner', operator: '===', value: 'exval' }, data),
    'evaluateCondition: === strict match');

  // != operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'winner', operator: '!=', value: 'fsv' }, data),
    'evaluateCondition: != mismatch');

  // includes operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'label', operator: 'includes', value: 'Validation' }, data),
    'evaluateCondition: includes substring');
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'label', operator: 'includes', value: 'Missing' }, data),
    'evaluateCondition: includes fails for missing substring');

  // startsWith operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'label', operator: 'startsWith', value: 'External' }, data),
    'evaluateCondition: startsWith match');

  // endsWith operator
  assertTruthy(ctx,
    InsightsPipeline.evaluateCondition({ field: 'label', operator: 'endsWith', value: 'Validation' }, data),
    'evaluateCondition: endsWith match');
}

// ── Test: evaluateCondition edge cases ──

function _testEvaluateConditionEdgeCases(ctx) {
  var data = { totalScore: 15 };

  // Missing field returns false
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'missingField', operator: '>=', value: 5 }, data),
    'evaluateCondition: missing field returns false');

  // Unknown operator returns false
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: 'INVALID', value: 5 }, data),
    'evaluateCondition: unknown operator returns false');

  // Null/undefined data handled
  assert(ctx,
    !InsightsPipeline.evaluateCondition({ field: 'totalScore', operator: '>=', value: 5 }, {}),
    'evaluateCondition: empty data returns false');
}

// ── Test: Save and retrieve insights ──

function _testSaveAndRetrieveInsights(ctx, clientId) {
  SpreadsheetCache.clearCache();

  var insights = [
    {
      timestamp: new Date(),
      clientId: clientId,
      sourceTool: 'tool1',
      insightType: 'test_high',
      priority: 'HIGH',
      content: 'High priority test insight',
      targetTools: ['tool2', 'tool3'],
      conditionData: { field: 'totalScore', value: 15, operator: '>=' },
      status: 'active'
    },
    {
      timestamp: new Date(),
      clientId: clientId,
      sourceTool: 'tool1',
      insightType: 'test_low',
      priority: 'LOW',
      content: 'Low priority test insight',
      targetTools: ['tool2'],
      conditionData: { field: 'winner', value: 'exval', operator: '==' },
      status: 'active'
    }
  ];

  InsightsPipeline.saveInsights(clientId, 'tool1', insights);
  SpreadsheetCache.clearCache();

  // Retrieve insights targeting tool2
  var retrieved = InsightsPipeline.getRelevantInsights(clientId, 'tool2');
  assert(ctx, retrieved.length >= 2, 'At least 2 insights retrieved for tool2',
    'Got: ' + retrieved.length);

  // Verify data integrity
  var highInsight = retrieved.find(function(i) { return i.insightType === 'test_high'; });
  assertNotNull(ctx, highInsight, 'High priority insight found');
  assertEqual(ctx, highInsight.priority, 'HIGH', 'Insight has correct priority');
  assertEqual(ctx, highInsight.content, 'High priority test insight', 'Insight has correct content');
}

// ── Test: Archive old insights ──

function _testArchiveOldInsights(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Archive insights from tool1
  InsightsPipeline.archiveOldInsights(clientId, 'tool1');
  SpreadsheetCache.clearCache();

  // Verify insights are archived (no active insights from tool1)
  var data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.CROSS_TOOL_INSIGHTS);
  var activeFromTool1 = 0;
  var archivedFromTool1 = 0;

  if (data && data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === clientId && data[i][2] === 'tool1') {
        if (data[i][8] === 'active') activeFromTool1++;
        if (data[i][8] === 'archived') archivedFromTool1++;
      }
    }
  }

  assertEqual(ctx, activeFromTool1, 0, 'No active insights remain after archive');
  assert(ctx, archivedFromTool1 >= 2, 'Archived insights exist',
    'Got: ' + archivedFromTool1);
}

// ── Test: getRelevantInsights filters correctly ──

function _testGetRelevantInsights(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save fresh insights targeting different tools
  var insights = [
    {
      timestamp: new Date(),
      clientId: clientId,
      sourceTool: 'tool2',
      insightType: 'tool3_only',
      priority: 'MEDIUM',
      content: 'Only for tool3',
      targetTools: ['tool3'],
      conditionData: { field: 'test', value: 1, operator: '==' },
      status: 'active'
    },
    {
      timestamp: new Date(),
      clientId: clientId,
      sourceTool: 'tool2',
      insightType: 'tool4_only',
      priority: 'HIGH',
      content: 'Only for tool4',
      targetTools: ['tool4'],
      conditionData: { field: 'test', value: 1, operator: '==' },
      status: 'active'
    }
  ];

  InsightsPipeline.saveInsights(clientId, 'tool2', insights);
  SpreadsheetCache.clearCache();

  // Get insights for tool3
  var tool3Insights = InsightsPipeline.getRelevantInsights(clientId, 'tool3');
  var hasCorrect = tool3Insights.some(function(i) { return i.insightType === 'tool3_only'; });
  var hasCrosstalk = tool3Insights.some(function(i) { return i.insightType === 'tool4_only'; });

  assertTruthy(ctx, hasCorrect, 'tool3 receives its targeted insight');
  assert(ctx, !hasCrosstalk, 'tool3 does not receive tool4-targeted insight');
}

// ── Test: Priority sorting (CRITICAL > HIGH > MEDIUM > LOW) ──

function _testPrioritySorting(ctx, clientId) {
  SpreadsheetCache.clearCache();

  // Save insights with mixed priorities targeting tool5
  var insights = [
    {
      timestamp: new Date(), clientId: clientId, sourceTool: 'tool3',
      insightType: 'low_test', priority: 'LOW', content: 'Low',
      targetTools: ['tool5'], conditionData: {}, status: 'active'
    },
    {
      timestamp: new Date(), clientId: clientId, sourceTool: 'tool3',
      insightType: 'critical_test', priority: 'CRITICAL', content: 'Critical',
      targetTools: ['tool5'], conditionData: {}, status: 'active'
    },
    {
      timestamp: new Date(), clientId: clientId, sourceTool: 'tool3',
      insightType: 'medium_test', priority: 'MEDIUM', content: 'Medium',
      targetTools: ['tool5'], conditionData: {}, status: 'active'
    }
  ];

  InsightsPipeline.saveInsights(clientId, 'tool3', insights);
  SpreadsheetCache.clearCache();

  var sorted = InsightsPipeline.getRelevantInsights(clientId, 'tool5');

  // Filter to just our test insights
  var testInsights = sorted.filter(function(i) {
    return i.insightType === 'low_test' ||
           i.insightType === 'critical_test' ||
           i.insightType === 'medium_test';
  });

  assert(ctx, testInsights.length >= 3, 'All 3 test insights retrieved',
    'Got: ' + testInsights.length);

  if (testInsights.length >= 3) {
    assertEqual(ctx, testInsights[0].priority, 'CRITICAL', 'CRITICAL sorted first');
    assertEqual(ctx, testInsights[1].priority, 'MEDIUM', 'MEDIUM sorted second');
    assertEqual(ctx, testInsights[2].priority, 'LOW', 'LOW sorted third');
  }
}

// ── Test: createInsightFromMapping replaces placeholders ──

function _testCreateInsightFromMapping(ctx, clientId) {
  var mapping = {
    Insight_Type: 'pattern_detected',
    Priority: 'HIGH',
    Content_Template: 'Your {winner} score of {totalScore} indicates a strong pattern',
    Target_Tools: ['tool2'],
    Adaptation_Type: 'custom_guidance',
    Adaptation_Details: { section: 'intro', message: 'Focus on {winner}' },
    Condition_Logic: { field: 'totalScore', operator: '>=', value: 10 }
  };

  var responseData = { winner: 'exval', totalScore: 15 };

  var insight = InsightsPipeline.createInsightFromMapping(mapping, responseData, clientId, 'tool1');

  assertEqual(ctx, insight.content,
    'Your exval score of 15 indicates a strong pattern',
    'Placeholders replaced in content template');
  assertEqual(ctx, insight.priority, 'HIGH', 'Priority preserved');
  assertEqual(ctx, insight.sourceTool, 'tool1', 'Source tool set correctly');
  assertEqual(ctx, insight.clientId, clientId, 'Client ID set correctly');
  assertEqual(ctx, insight.status, 'active', 'Status defaults to active');
}
