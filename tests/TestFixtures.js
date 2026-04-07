/**
 * TestFixtures.js - Mock data factories for FTP-v3 tests
 *
 * Provides helper functions to create test data that matches
 * the production sheet schemas. All test client IDs use the
 * TEST_RUNNER_ prefix for easy cleanup.
 */

var TestFixtures = {

  /**
   * Generate a unique test client ID
   */
  clientId: function(suffix) {
    return TEST_CLIENT_PREFIX + (suffix || 'default') + '_' + Date.now();
  },

  /**
   * Create a minimal Tool 1 response (formData + scores + winner)
   */
  tool1Response: function() {
    return {
      formData: {
        thought_fsv: 4,
        feeling_fsv: 3,
        behavior_fsv: 2,
        thought_exval: 3,
        feeling_exval: 4,
        behavior_exval: 5,
        thought_isl: 2,
        feeling_isl: 2,
        behavior_isl: 1,
        thought_irl: 3,
        feeling_irl: 3,
        behavior_irl: 2,
        thought_cli: 1,
        feeling_cli: 2,
        behavior_cli: 1,
        thought_fli: 2,
        feeling_fli: 1,
        behavior_fli: 3
      },
      scores: {
        fsv: 9,
        exval: 12,
        isl: 5,
        irl: 8,
        cli: 4,
        fli: 6
      },
      winner: 'exval'
    };
  },

  /**
   * Create a minimal Tool 2 response (financial data)
   */
  tool2Response: function() {
    return {
      data: {
        annualIncome: 85000,
        monthlyIncome: 7083,
        totalDebt: 25000,
        savings: 15000,
        retirementBalance: 45000,
        marital: 'Single',
        age: 35,
        assessmentMode: 'full'
      },
      results: {
        objectiveHealthScores: {
          moneyFlow: 72,
          obligations: 65,
          liquidity: 58,
          growth: 45,
          protection: 30
        },
        subjectiveClarityScores: {
          moneyFlow: 60,
          obligations: 70,
          liquidity: 40,
          growth: 35,
          protection: 25
        },
        gapAnalysis: {
          moneyFlow: { gap: 12, classification: 'OVERESTIMATING' },
          obligations: { gap: -5, classification: 'ALIGNED' },
          liquidity: { gap: 18, classification: 'OVERESTIMATING' },
          growth: { gap: 10, classification: 'UNDERESTIMATING' },
          protection: { gap: 5, classification: 'ALIGNED' }
        },
        assessmentMode: 'full'
      }
    };
  },

  /**
   * Create a minimal Tool 4 response (budget data)
   */
  tool4Response: function() {
    return {
      multiply: 16,
      essentials: 50,
      freedom: 20,
      enjoyment: 14,
      monthlyIncome: 7083,
      scenarioName: 'Test Scenario'
    };
  },

  /**
   * Create a simple response for any tool (generic)
   */
  genericResponse: function(toolId) {
    return {
      completed: true,
      toolId: toolId,
      answers: { q1: 3, q2: 4, q3: 2 },
      totalScore: 9
    };
  },

  /**
   * Add a test student to the STUDENTS sheet
   */
  addTestStudent: function(clientId, name, email) {
    var sheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.STUDENTS);
    if (!sheet) return null;

    sheet.appendRow([
      clientId,
      name || 'Test Student',
      email || 'test@example.com',
      'Active',
      new Date(),  // Enrolled_Date
      new Date(),  // Last_Activity
      0            // Tools_Completed
    ]);
    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENTS);
    return clientId;
  },

  /**
   * Create an insight mapping row for testing
   */
  insightMapping: function(toolId, targetTools, condition) {
    return {
      Tool_ID: toolId,
      Insight_Type: 'test_insight',
      Condition: 'Test condition',
      Condition_Logic: condition || { field: 'totalScore', operator: '>=', value: 5 },
      Priority: 'MEDIUM',
      Content_Template: 'Test insight for score {totalScore}',
      Target_Tools: targetTools || ['tool2'],
      Adaptation_Type: 'custom_guidance',
      Adaptation_Details: { section: 'intro', message: 'Test guidance' }
    };
  }
};
