/**
 * Phase 1 Validation Suite
 * Run this in Apps Script to validate Phase 1 completion
 *
 * To run: Open Apps Script Editor → Select function → Click Run
 */

/**
 * MAIN TEST RUNNER
 * Execute this function to run all Phase 1 validation tests
 */
function runPhase1ValidationSuite() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║   PHASE 1 VALIDATION SUITE - Tool 4 V1 Engine Integration ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Verify all functions exist
  Logger.log('TEST 1: Verify All Functions Exist');
  Logger.log('═'.repeat(60));
  const existenceTest = testFunctionsExist();
  results.tests.push(existenceTest);
  if (existenceTest.passed) results.passed++; else results.failed++;
  Logger.log('');

  // Test 2: V1 Allocation Engine
  Logger.log('TEST 2: V1 Allocation Engine');
  Logger.log('═'.repeat(60));
  const engineTest = testV1Engine();
  results.tests.push(engineTest);
  if (engineTest.passed) results.passed++; else results.failed++;
  Logger.log('');

  // Test 3: Helper Functions
  Logger.log('TEST 3: Helper Functions');
  Logger.log('═'.repeat(60));
  const helpersTest = testHelperFunctionsExist();
  results.tests.push(helpersTest);
  if (helpersTest.passed) results.passed++; else results.failed++;
  Logger.log('');

  // Test 4: V1 Input Mapper (without DataService - mock data)
  Logger.log('TEST 4: V1 Input Mapper (Mock Data)');
  Logger.log('═'.repeat(60));
  const mapperTest = testInputMapperMock();
  results.tests.push(mapperTest);
  if (mapperTest.passed) results.passed++; else results.failed++;
  Logger.log('');

  // Test 5: End-to-End Flow
  Logger.log('TEST 5: End-to-End Flow (Mock Data)');
  Logger.log('═'.repeat(60));
  const e2eTest = testEndToEndFlow();
  results.tests.push(e2eTest);
  if (e2eTest.passed) results.passed++; else results.failed++;
  Logger.log('');

  // Summary
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║                        TEST SUMMARY                        ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('Total Tests: ' + (results.passed + results.failed));
  Logger.log('✅ Passed: ' + results.passed);
  Logger.log('❌ Failed: ' + results.failed);
  Logger.log('');

  if (results.failed === 0) {
    Logger.log('🎉 ALL TESTS PASSED - Phase 1 is ready for Phase 2!');
  } else {
    Logger.log('⚠️  SOME TESTS FAILED - Review errors above');
  }

  return results;
}

/**
 * Test 1: Verify all functions exist on Tool4 object
 */
function testFunctionsExist() {
  const requiredFunctions = [
    'calculateAllocationV1',
    'buildV1Input',
    'deriveGrowthFromTool2',
    'deriveStabilityFromTool2',
    'deriveStageOfLife',
    'mapEmergencyFundMonths',
    'mapIncomeStability',
    'deriveDebtLoad',
    'deriveInterestLevel'
  ];

  let allExist = true;
  const missing = [];

  requiredFunctions.forEach(function(funcName) {
    if (typeof Tool4[funcName] === 'function') {
      Logger.log('  ✅ ' + funcName);
    } else {
      Logger.log('  ❌ ' + funcName + ' - NOT FOUND');
      allExist = false;
      missing.push(funcName);
    }
  });

  if (allExist) {
    Logger.log('');
    Logger.log('✅ All 9 functions exist on Tool4 object');
    return { name: 'Function Existence', passed: true };
  } else {
    Logger.log('');
    Logger.log('❌ Missing functions: ' + missing.join(', '));
    return { name: 'Function Existence', passed: false, error: 'Missing: ' + missing.join(', ') };
  }
}

/**
 * Test 2: V1 Engine produces valid allocations
 */
function testV1Engine() {
  try {
    const testInput = {
      priority: 'Build Long-Term Wealth',
      incomeRange: 'C',
      essentialsRange: 'C',
      debtLoad: 'B',
      interestLevel: 'Low',
      emergencyFund: 'C',
      incomeStability: 'Stable',
      satisfaction: 7,
      discipline: 9,
      impulse: 8,
      longTerm: 9,
      lifestyle: 5,
      growth: 9,
      stability: 5,
      goalTimeline: '2–5 years',
      dependents: 'No',
      autonomy: 8
    };

    const result = Tool4.calculateAllocationV1(testInput);

    // Validate structure
    if (!result.percentages || !result.lightNotes || !result.details) {
      throw new Error('Missing required properties in result');
    }

    // Validate percentages sum to 100
    const sum = result.percentages.Multiply +
                result.percentages.Essentials +
                result.percentages.Freedom +
                result.percentages.Enjoyment;

    Logger.log('  Percentages:');
    Logger.log('    Multiply:   ' + result.percentages.Multiply + '%');
    Logger.log('    Essentials: ' + result.percentages.Essentials + '%');
    Logger.log('    Freedom:    ' + result.percentages.Freedom + '%');
    Logger.log('    Enjoyment:  ' + result.percentages.Enjoyment + '%');
    Logger.log('  Sum: ' + sum + '%');
    Logger.log('  Satisfaction Boost: ' + result.details.satBoostPct + '%');

    if (sum !== 100) {
      throw new Error('Percentages do not sum to 100% (got ' + sum + '%)');
    }

    Logger.log('');
    Logger.log('✅ V1 engine produces valid allocations');
    return { name: 'V1 Engine', passed: true };

  } catch (error) {
    Logger.log('');
    Logger.log('❌ V1 engine test failed: ' + error.toString());
    return { name: 'V1 Engine', passed: false, error: error.toString() };
  }
}

/**
 * Test 3: Helper functions are callable
 */
function testHelperFunctionsExist() {
  try {
    const mockFormData = {
      age: 35,
      employment: 'full-time',
      dependents: 2,
      incomeConsistency: 3,
      emergencyFundMonths: 2,
      emergencyFundMaintenance: 3,
      insuranceConfidence: 2,
      debtTrending: 1,
      investmentActivity: 4,
      savingsRegularity: 3,
      retirementFunding: 2,
      currentDebts: 'credit card: $5000',
      debtStress: -2
    };

    // Test each helper
    const growth = Tool4.deriveGrowthFromTool2(mockFormData);
    Logger.log('  ✅ deriveGrowthFromTool2: ' + growth);

    const stability = Tool4.deriveStabilityFromTool2(mockFormData);
    Logger.log('  ✅ deriveStabilityFromTool2: ' + stability);

    const stage = Tool4.deriveStageOfLife(mockFormData);
    Logger.log('  ✅ deriveStageOfLife: ' + stage);

    const efTier = Tool4.mapEmergencyFundMonths(2);
    Logger.log('  ✅ mapEmergencyFundMonths: ' + efTier);

    const incomeStability = Tool4.mapIncomeStability(3);
    Logger.log('  ✅ mapIncomeStability: ' + incomeStability);

    const debtLoad = Tool4.deriveDebtLoad('credit card: $5000', -2);
    Logger.log('  ✅ deriveDebtLoad: ' + debtLoad);

    const interestLevel = Tool4.deriveInterestLevel(-2);
    Logger.log('  ✅ deriveInterestLevel: ' + interestLevel);

    Logger.log('');
    Logger.log('✅ All 7 helper functions are callable and return values');
    return { name: 'Helper Functions', passed: true };

  } catch (error) {
    Logger.log('');
    Logger.log('❌ Helper functions test failed: ' + error.toString());
    return { name: 'Helper Functions', passed: false, error: error.toString() };
  }
}

/**
 * Test 4: Input mapper works with mock data
 */
function testInputMapperMock() {
  try {
    // Create a temporary test client
    const testClientId = 'PHASE1_TEST_' + new Date().getTime();

    const mockPreSurvey = {
      incomeRange: 'C',
      essentialsRange: 'D',
      satisfaction: 7,
      discipline: 8,
      impulse: 7,
      longTerm: 8,
      goalTimeline: '1–2 years',
      selectedPriority: 'Build Long-Term Wealth'
    };

    // This will return defaults since no Tool 2 data exists
    const v1Input = Tool4.buildV1Input(testClientId, mockPreSurvey);

    // Validate required fields exist
    const requiredFields = [
      'incomeRange', 'essentialsRange', 'satisfaction', 'discipline',
      'impulse', 'longTerm', 'goalTimeline', 'priority', 'growth',
      'stability', 'emergencyFund', 'incomeStability', 'debtLoad',
      'interestLevel', 'dependents'
    ];

    let allFieldsPresent = true;
    requiredFields.forEach(function(field) {
      if (!(field in v1Input)) {
        Logger.log('  ❌ Missing field: ' + field);
        allFieldsPresent = false;
      }
    });

    if (!allFieldsPresent) {
      throw new Error('buildV1Input missing required fields');
    }

    Logger.log('  ✅ All required fields present in V1 input');
    Logger.log('  Priority: ' + v1Input.priority);
    Logger.log('  Satisfaction: ' + v1Input.satisfaction);
    Logger.log('  Growth: ' + v1Input.growth);
    Logger.log('  Stability: ' + v1Input.stability);

    Logger.log('');
    Logger.log('✅ Input mapper produces valid V1 input');
    return { name: 'Input Mapper', passed: true };

  } catch (error) {
    Logger.log('');
    Logger.log('❌ Input mapper test failed: ' + error.toString());
    return { name: 'Input Mapper', passed: false, error: error.toString() };
  }
}

/**
 * Test 5: End-to-end flow (pre-survey → V1 input → allocation)
 */
function testEndToEndFlow() {
  try {
    const testClientId = 'E2E_TEST_' + new Date().getTime();

    const preSurvey = {
      incomeRange: 'D',
      essentialsRange: 'C',
      satisfaction: 8,
      discipline: 7,
      impulse: 6,
      longTerm: 8,
      goalTimeline: '2–5 years',
      selectedPriority: 'Build Long-Term Wealth'
    };

    Logger.log('  Step 1: Build V1 input from pre-survey');
    const v1Input = Tool4.buildV1Input(testClientId, preSurvey);
    Logger.log('    ✅ V1 input created');

    Logger.log('  Step 2: Calculate allocation');
    const allocation = Tool4.calculateAllocationV1(v1Input);
    Logger.log('    ✅ Allocation calculated');

    Logger.log('  Step 3: Validate results');
    const sum = allocation.percentages.Multiply +
                allocation.percentages.Essentials +
                allocation.percentages.Freedom +
                allocation.percentages.Enjoyment;

    Logger.log('    Multiply:   ' + allocation.percentages.Multiply + '%');
    Logger.log('    Essentials: ' + allocation.percentages.Essentials + '%');
    Logger.log('    Freedom:    ' + allocation.percentages.Freedom + '%');
    Logger.log('    Enjoyment:  ' + allocation.percentages.Enjoyment + '%');
    Logger.log('    Sum: ' + sum + '%');

    if (sum !== 100) {
      throw new Error('Sum is not 100%');
    }

    Logger.log('    ✅ Sum equals 100%');

    Logger.log('');
    Logger.log('✅ End-to-end flow working: Pre-survey → Mapping → Allocation');
    return { name: 'End-to-End Flow', passed: true };

  } catch (error) {
    Logger.log('');
    Logger.log('❌ End-to-end test failed: ' + error.toString());
    return { name: 'End-to-End Flow', passed: false, error: error.toString() };
  }
}
