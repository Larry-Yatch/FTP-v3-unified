/**
 * Tool6Tests.js
 * Manual test functions for Tool 6 development
 * Run these in the GAS Script Editor to verify functionality
 *
 * Usage: Open Script Editor, run testSprint1_1() from the dropdown
 */

/**
 * Sprint 1.1 Test: Upstream Data Pull
 * Tests: checkToolCompletion(), mapUpstreamFields(), getDataStatus()
 */
function testSprint1_1() {
  Logger.log('=== Sprint 1.1: Upstream Data Pull Tests ===\n');

  // Test 1: Check constants are accessible
  Logger.log('Test 1: Constants Accessibility');
  try {
    Logger.log('  INVESTMENT_SCORE_LABELS defined: ' + (typeof INVESTMENT_SCORE_LABELS !== 'undefined'));
    Logger.log('  INVESTMENT_SCORE_LABELS[4]: ' + INVESTMENT_SCORE_LABELS[4]);
    Logger.log('  IRS_LIMITS_2025.EMPLOYEE_401K: ' + IRS_LIMITS_2025.EMPLOYEE_401K);
    Logger.log('  PROFILE_DEFINITIONS[7].name: ' + PROFILE_DEFINITIONS[7].name);
    Logger.log('  ✓ Test 1 PASSED\n');
  } catch (e) {
    Logger.log('  ✗ Test 1 FAILED: ' + e.message + '\n');
  }

  // Test 2: mapUpstreamFields with mock data
  // NOTE: Mock data must match actual DataService.getLatestResponse() structure
  // Tool 2 saves: { data: formData, results: {...} } -> access via .data.data
  // Tool 4 saves flat: { multiply, monthlyIncome, ... } -> access via .data
  Logger.log('Test 2: mapUpstreamFields()');
  try {
    // Tool 2 structure: { data: { data: formData } }
    const mockTool2 = {
      data: {
        data: {
          age: 35,
          annualIncome: 85000,
          employmentType: 'W-2',
          marital: 'Married'  // Tool 2 uses 'marital' not 'maritalStatus'
        }
      }
    };
    // Tool 4 structure: { data: { multiply, monthlyIncome, ... } } (flat)
    const mockTool4 = {
      data: {
        multiply: 16,  // This is a percentage (16%)
        monthlyIncome: 5000,  // Monthly income
        goalTimeline: 25,
        investmentScore: 5
      }
    };

    const mapped = Tool6.mapUpstreamFields(null, mockTool2, null, mockTool4, null);

    // Expected: monthlyBudget = monthlyIncome * multiply / 100 = 5000 * 16 / 100 = 800
    Logger.log('  age: ' + mapped.age + ' (expected: 35)');
    Logger.log('  grossIncome: ' + mapped.grossIncome + ' (expected: 85000)');
    Logger.log('  filingStatus: ' + mapped.filingStatus + ' (expected: MFJ)');
    Logger.log('  hsaCoverageType: ' + mapped.hsaCoverageType + ' (expected: Family)');
    Logger.log('  monthlyBudget: ' + mapped.monthlyBudget + ' (expected: 800)');
    Logger.log('  investmentScore: ' + mapped.investmentScore + ' (expected: 5)');

    const pass = mapped.age === 35 &&
                 mapped.grossIncome === 85000 &&
                 mapped.filingStatus === 'MFJ' &&
                 mapped.hsaCoverageType === 'Family' &&
                 mapped.monthlyBudget === 800 &&
                 mapped.investmentScore === 5;

    Logger.log(pass ? '  ✓ Test 2 PASSED\n' : '  ✗ Test 2 FAILED\n');
  } catch (e) {
    Logger.log('  ✗ Test 2 FAILED: ' + e.message + '\n');
  }

  // Test 3: mapUpstreamFields with Single filing status
  Logger.log('Test 3: Filing Status Inference - Single');
  try {
    // Tool 2 structure with Single status
    const mockTool2Single = {
      data: {
        data: {
          marital: 'Single'
        }
      }
    };
    const mapped = Tool6.mapUpstreamFields(null, mockTool2Single, null, null, null);

    Logger.log('  filingStatus: ' + mapped.filingStatus + ' (expected: Single)');
    Logger.log('  hsaCoverageType: ' + mapped.hsaCoverageType + ' (expected: Individual)');

    const pass = mapped.filingStatus === 'Single' && mapped.hsaCoverageType === 'Individual';
    Logger.log(pass ? '  ✓ Test 3 PASSED\n' : '  ✗ Test 3 FAILED\n');
  } catch (e) {
    Logger.log('  ✗ Test 3 FAILED: ' + e.message + '\n');
  }

  // Test 4: getDataStatus with complete data
  Logger.log('Test 4: getDataStatus() - Complete Data');
  try {
    const completeToolStatus = {
      age: 35,
      grossIncome: 85000,
      employmentType: 'W-2',
      filingStatus: 'MFJ',
      monthlyBudget: 800,
      monthlyTakeHome: 5000,
      yearsToRetirement: 25,
      investmentScore: 5,
      traumaPattern: 'Scarcity',
      identitySubdomainScores: { test: 1 },
      connectionSubdomainScores: { test: 1 }
    };

    const status = Tool6.getDataStatus(completeToolStatus);

    Logger.log('  demographics.status: ' + status.demographics.status + ' (expected: complete)');
    Logger.log('  financial.status: ' + status.financial.status + ' (expected: complete)');
    Logger.log('  overall.canProceed: ' + status.overall.canProceed + ' (expected: true)');

    const pass = status.demographics.status === 'complete' &&
                 status.financial.status === 'complete' &&
                 status.overall.canProceed === true;

    Logger.log(pass ? '  ✓ Test 4 PASSED\n' : '  ✗ Test 4 FAILED\n');
  } catch (e) {
    Logger.log('  ✗ Test 4 FAILED: ' + e.message + '\n');
  }

  // Test 5: getDataStatus with missing Tool 4
  Logger.log('Test 5: getDataStatus() - Missing Tool 4');
  try {
    const missingTool4Status = {
      age: 35,
      grossIncome: 85000,
      monthlyBudget: 0,  // Missing!
      investmentScore: 4
    };

    const status = Tool6.getDataStatus(missingTool4Status);

    Logger.log('  financial.status: ' + status.financial.status + ' (expected: missing)');
    Logger.log('  overall.canProceed: ' + status.overall.canProceed + ' (expected: false)');
    Logger.log('  overall.blockerMessage exists: ' + (!!status.overall.blockerMessage));

    const pass = status.financial.status === 'missing' &&
                 status.overall.canProceed === false &&
                 !!status.overall.blockerMessage;

    Logger.log(pass ? '  ✓ Test 5 PASSED\n' : '  ✗ Test 5 FAILED\n');
  } catch (e) {
    Logger.log('  ✗ Test 5 FAILED: ' + e.message + '\n');
  }

  // Test 6: getDataStatus with partial data
  Logger.log('Test 6: getDataStatus() - Partial Demographics');
  try {
    const partialStatus = {
      age: 35,
      grossIncome: null,  // Missing
      employmentType: 'W-2',
      filingStatus: null,  // Missing
      monthlyBudget: 800,
      monthlyTakeHome: 5000,
      yearsToRetirement: 25,
      investmentScore: 5
    };

    const status = Tool6.getDataStatus(partialStatus);

    Logger.log('  demographics.status: ' + status.demographics.status + ' (expected: partial)');
    Logger.log('  demographics.presentCount: ' + status.demographics.presentCount + ' (expected: 2)');
    Logger.log('  demographics.missingFields: ' + JSON.stringify(status.demographics.missingFields));

    const pass = status.demographics.status === 'partial' &&
                 status.demographics.presentCount === 2;

    Logger.log(pass ? '  ✓ Test 6 PASSED\n' : '  ✗ Test 6 FAILED\n');
  } catch (e) {
    Logger.log('  ✗ Test 6 FAILED: ' + e.message + '\n');
  }

  Logger.log('=== Sprint 1.1 Tests Complete ===');
}

/**
 * Test with a real client ID (if you have test data)
 * @param {string} clientId - Client ID to test with
 */
function testWithRealClient(clientId) {
  clientId = clientId || 'TEST001';
  Logger.log('=== Testing with Client: ' + clientId + ' ===\n');

  try {
    const toolStatus = Tool6.checkToolCompletion(clientId);

    Logger.log('Tool Completion Status:');
    Logger.log('  hasTool1: ' + toolStatus.hasTool1);
    Logger.log('  hasTool2: ' + toolStatus.hasTool2);
    Logger.log('  hasTool3: ' + toolStatus.hasTool3);
    Logger.log('  hasTool4: ' + toolStatus.hasTool4);
    Logger.log('  hasTool5: ' + toolStatus.hasTool5);
    Logger.log('  hasCriticalData: ' + toolStatus.hasCriticalData);

    Logger.log('\nMapped Fields:');
    Logger.log('  age: ' + toolStatus.age);
    Logger.log('  grossIncome: ' + toolStatus.grossIncome);
    Logger.log('  filingStatus: ' + toolStatus.filingStatus);
    Logger.log('  monthlyBudget: ' + toolStatus.monthlyBudget);
    Logger.log('  yearsToRetirement: ' + toolStatus.yearsToRetirement);
    Logger.log('  investmentScore: ' + toolStatus.investmentScore);

    const dataStatus = Tool6.getDataStatus(toolStatus);
    Logger.log('\nData Status:');
    for (const [key, info] of Object.entries(dataStatus)) {
      if (key !== 'overall') {
        Logger.log('  ' + info.label + ': ' + info.status);
      }
    }
    Logger.log('\nOverall:');
    Logger.log('  canProceed: ' + dataStatus.overall.canProceed);
    Logger.log('  blockerMessage: ' + (dataStatus.overall.blockerMessage || 'None'));

  } catch (e) {
    Logger.log('Error: ' + e.message);
    Logger.log('Stack: ' + e.stack);
  }
}

/**
 * Quick render test - renders Tool 6 page for a client
 * Check the returned HTML for errors
 */
function testRender(clientId) {
  clientId = clientId || 'TEST001';
  try {
    const result = Tool6.render({ clientId: clientId });
    Logger.log('Render successful. Content length: ' + result.getContent().length + ' chars');
    return result;
  } catch (e) {
    Logger.log('Render FAILED: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return null;
  }
}
