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

// ============================================================================
// PHASE 5: CALCULATOR UI TESTS
// ============================================================================

/**
 * Sprint 5.1-5.6 Test: Calculator UI
 * Tests: buildCalculatorSection(), getTaxRecommendation(), vehicle sliders
 *
 * Run from Apps Script Editor to verify Phase 5 implementation
 */
function testPhase5_CalculatorUI() {
  Logger.log('=== Phase 5: Calculator UI Tests ===\n');

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------------------
  // Test 1: buildCalculatorSection with valid allocation
  // -------------------------------------------------------------------------
  Logger.log('Test 1: buildCalculatorSection() - Valid Allocation');
  try {
    const mockPreSurvey = {
      a1_grossIncome: 100000,
      a2_yearsToRetirement: 20,
      a2b_taxPreference: 'Both',
      a3_has401k: 'Yes',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No',
      a12_current401kBalance: 50000,
      a13_currentIRABalance: 25000,
      a14_currentHSABalance: 5000,
      a16_monthly401kContribution: 500,
      a17_monthlyIRAContribution: 200,
      a18_monthlyHSAContribution: 100,
      age: 40
    };

    const mockProfile = {
      id: 7,
      name: 'Foundation Builder',
      icon: '🏗️'
    };

    const mockAllocation = {
      vehicles: {
        '401(k) Traditional': 800,
        '401(k) Roth': 400,
        'IRA Roth': 583,
        'HSA': 358
      },
      eligibleVehicles: {
        '401(k) Traditional': { monthlyLimit: 1958, domain: 'Retirement' },
        '401(k) Roth': { monthlyLimit: 1958, domain: 'Retirement' },
        'IRA Roth': { monthlyLimit: 583, domain: 'Retirement' },
        'HSA': { monthlyLimit: 358, domain: 'Health' }
      },
      totalBudget: 2000,
      totalAllocated: 2141,
      employerMatch: 250,
      taxPreference: 'Both'
    };

    const mockToolStatus = {
      investmentScore: 5,
      age: 40,
      grossIncome: 100000
    };

    const html = Tool6.buildCalculatorSection(mockPreSurvey, mockProfile, mockAllocation, mockToolStatus);

    // Verify key elements are present
    const checks = [
      { name: 'Current State section', pattern: 'Current State' },
      { name: 'Total Balance display', pattern: '\\$80,000' },  // 50k + 25k + 5k
      { name: 'Investment Score buttons', pattern: 'investmentScoreButtons' },
      { name: 'Tax Strategy toggle', pattern: 'tax-strategy-toggle' },
      { name: 'Employer Match display', pattern: '\\$250' },
      { name: 'Vehicle sliders', pattern: 'vehicle-sliders' },
      { name: '401(k) Traditional slider', pattern: '401_k__Traditional' },
      { name: 'HSA slider', pattern: 'slider_HSA' },
      { name: 'Recalculate button', pattern: 'btn-recalc' }
    ];

    let allPassed = true;
    for (const check of checks) {
      const regex = new RegExp(check.pattern);
      if (!regex.test(html)) {
        Logger.log('  ✗ Missing: ' + check.name);
        allPassed = false;
      }
    }

    if (allPassed) {
      Logger.log('  ✓ All ' + checks.length + ' elements present');
      Logger.log('  HTML length: ' + html.length + ' chars');
      passed++;
    } else {
      failed++;
    }
    Logger.log(allPassed ? '  ✓ Test 1 PASSED\n' : '  ✗ Test 1 FAILED\n');
  } catch (e) {
    Logger.log('  ✗ Test 1 FAILED: ' + e.message);
    Logger.log('  Stack: ' + e.stack + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 2: buildCalculatorSection with no allocation (placeholder)
  // -------------------------------------------------------------------------
  Logger.log('Test 2: buildCalculatorSection() - No Allocation (Placeholder)');
  try {
    const html = Tool6.buildCalculatorSection({}, null, null, {});

    const hasPlaceholder = html.includes('Complete the questionnaire');

    Logger.log('  Has placeholder message: ' + hasPlaceholder);
    Logger.log(hasPlaceholder ? '  ✓ Test 2 PASSED\n' : '  ✗ Test 2 FAILED\n');

    if (hasPlaceholder) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 2 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 3: getTaxRecommendation() - Low income
  // -------------------------------------------------------------------------
  Logger.log('Test 3: getTaxRecommendation() - Low Income ($40k)');
  try {
    const recommendation = Tool6.getTaxRecommendation(40000, 30);

    const isRothHeavy = recommendation.includes('Roth-Heavy');
    const hasReason = recommendation.includes('lower tax bracket');

    Logger.log('  Recommendation contains "Roth-Heavy": ' + isRothHeavy);
    Logger.log('  Has reasoning: ' + hasReason);

    const pass = isRothHeavy && hasReason;
    Logger.log(pass ? '  ✓ Test 3 PASSED\n' : '  ✗ Test 3 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 3 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 4: getTaxRecommendation() - High income
  // -------------------------------------------------------------------------
  Logger.log('Test 4: getTaxRecommendation() - High Income ($200k)');
  try {
    const recommendation = Tool6.getTaxRecommendation(200000, 45);

    const isTradHeavy = recommendation.includes('Traditional-Heavy');
    const hasReason = recommendation.includes('higher tax bracket') || recommendation.includes('defer taxes');

    Logger.log('  Recommendation contains "Traditional-Heavy": ' + isTradHeavy);
    Logger.log('  Has reasoning: ' + hasReason);

    const pass = isTradHeavy && hasReason;
    Logger.log(pass ? '  ✓ Test 4 PASSED\n' : '  ✗ Test 4 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 4 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 5: getTaxRecommendation() - Middle income
  // -------------------------------------------------------------------------
  Logger.log('Test 5: getTaxRecommendation() - Middle Income ($80k)');
  try {
    const recommendation = Tool6.getTaxRecommendation(80000, 35);

    const isBalanced = recommendation.includes('Balanced');

    Logger.log('  Recommendation contains "Balanced": ' + isBalanced);

    Logger.log(isBalanced ? '  ✓ Test 5 PASSED\n' : '  ✗ Test 5 FAILED\n');

    if (isBalanced) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 5 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 6: Vehicle name escaping (special characters)
  // -------------------------------------------------------------------------
  Logger.log('Test 6: Vehicle Name Escaping - Special Characters');
  try {
    const mockAllocation = {
      vehicles: {
        '401(k) Traditional': 500,
        "Roth IRA": 300
      },
      eligibleVehicles: {
        '401(k) Traditional': { monthlyLimit: 1958, domain: 'Retirement' },
        "Roth IRA": { monthlyLimit: 583, domain: 'Retirement' }
      },
      totalBudget: 1000,
      totalAllocated: 800,
      employerMatch: 0
    };

    const html = Tool6.buildCalculatorSection({}, null, mockAllocation, {});

    // Check that 401(k) is properly escaped in IDs
    const hasSafeId = html.includes('slider_401_k__Traditional');
    const hasDataVehicleId = html.includes('data-vehicle-id="401_k__Traditional"');

    Logger.log('  Has safe slider ID: ' + hasSafeId);
    Logger.log('  Has data-vehicle-id attribute: ' + hasDataVehicleId);

    const pass = hasSafeId && hasDataVehicleId;
    Logger.log(pass ? '  ✓ Test 6 PASSED\n' : '  ✗ Test 6 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 6 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 7: Slider max value handling (Infinity case)
  // -------------------------------------------------------------------------
  Logger.log('Test 7: Slider Max Value - Infinity Handling');
  try {
    const mockAllocation = {
      vehicles: {
        'Family Bank': 200
      },
      eligibleVehicles: {
        'Family Bank': { monthlyLimit: Infinity, domain: 'Retirement' }
      },
      totalBudget: 1000,
      totalAllocated: 200,
      employerMatch: 0
    };

    const html = Tool6.buildCalculatorSection({}, null, mockAllocation, {});

    // Check that max is NOT "Infinity" (should be budget)
    const hasInfinityMax = html.includes('max="Infinity"');
    const hasBudgetMax = html.includes('max="1000"');

    Logger.log('  Has Infinity in max (BAD): ' + hasInfinityMax);
    Logger.log('  Has budget as max (GOOD): ' + hasBudgetMax);

    const pass = !hasInfinityMax && hasBudgetMax;
    Logger.log(pass ? '  ✓ Test 7 PASSED\n' : '  ✗ Test 7 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 7 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 8: Employer match conditional display
  // -------------------------------------------------------------------------
  Logger.log('Test 8: Employer Match - Conditional Display');
  try {
    // With match
    const withMatch = Tool6.buildCalculatorSection({}, null, {
      vehicles: { 'HSA': 100 },
      eligibleVehicles: { 'HSA': { monthlyLimit: 358, domain: 'Health' } },
      totalBudget: 500,
      totalAllocated: 100,
      employerMatch: 250
    }, {});

    // Without match
    const withoutMatch = Tool6.buildCalculatorSection({}, null, {
      vehicles: { 'HSA': 100 },
      eligibleVehicles: { 'HSA': { monthlyLimit: 358, domain: 'Health' } },
      totalBudget: 500,
      totalAllocated: 100,
      employerMatch: 0
    }, {});

    const showsMatchWhenPresent = withMatch.includes('employer-match-section');
    const hidesMatchWhenZero = !withoutMatch.includes('employer-match-section');

    Logger.log('  Shows match when present: ' + showsMatchWhenPresent);
    Logger.log('  Hides match when zero: ' + hidesMatchWhenZero);

    const pass = showsMatchWhenPresent && hidesMatchWhenZero;
    Logger.log(pass ? '  ✓ Test 8 PASSED\n' : '  ✗ Test 8 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 8 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 9: Education/HSA conditional display in current state
  // -------------------------------------------------------------------------
  Logger.log('Test 9: Conditional Field Display (Education/HSA)');
  try {
    // With children and HSA
    const withBoth = Tool6.buildCalculatorSection({
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'Yes',
      a14_currentHSABalance: 5000,
      a15_currentEducationBalance: 10000
    }, null, {
      vehicles: { 'HSA': 100 },
      eligibleVehicles: { 'HSA': { monthlyLimit: 358, domain: 'Health' } },
      totalBudget: 500,
      totalAllocated: 100,
      employerMatch: 0
    }, {});

    // Without children or HSA
    const withNeither = Tool6.buildCalculatorSection({
      a7_hsaEligible: 'No',
      a8_hasChildren: 'No'
    }, null, {
      vehicles: { 'IRA Roth': 100 },
      eligibleVehicles: { 'IRA Roth': { monthlyLimit: 583, domain: 'Retirement' } },
      totalBudget: 500,
      totalAllocated: 100,
      employerMatch: 0
    }, {});

    const showsHSA = withBoth.includes('HSA: $5,000');
    const showsEducation = withBoth.includes('Education: $10,000');
    const hidesHSA = !withNeither.includes('HSA:');
    const hidesEducation = !withNeither.includes('Education:');

    Logger.log('  Shows HSA when eligible: ' + showsHSA);
    Logger.log('  Shows Education when has children: ' + showsEducation);
    Logger.log('  Hides HSA when not eligible: ' + hidesHSA);
    Logger.log('  Hides Education when no children: ' + hidesEducation);

    const pass = showsHSA && showsEducation && hidesHSA && hidesEducation;
    Logger.log(pass ? '  ✓ Test 9 PASSED\n' : '  ✗ Test 9 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 9 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 10: getTool6Page global wrapper
  // -------------------------------------------------------------------------
  Logger.log('Test 10: getTool6Page() Global Wrapper');
  try {
    // This tests that the function exists and returns proper structure
    // We use a test client ID that may not have data
    const result = getTool6Page('TEST_PHASE5');

    const hasSuccess = result.hasOwnProperty('success');
    const hasHtmlOrError = result.hasOwnProperty('html') || result.hasOwnProperty('error');

    Logger.log('  Returns success property: ' + hasSuccess);
    Logger.log('  Returns html or error: ' + hasHtmlOrError);
    Logger.log('  Success value: ' + result.success);
    if (result.html) {
      Logger.log('  HTML length: ' + result.html.length + ' chars');
    }

    const pass = hasSuccess && hasHtmlOrError;
    Logger.log(pass ? '  ✓ Test 10 PASSED\n' : '  ✗ Test 10 FAILED\n');

    if (pass) passed++;
    else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 10 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  Logger.log('=== Phase 5 Test Summary ===');
  Logger.log('Passed: ' + passed + '/' + (passed + failed));
  Logger.log('Failed: ' + failed + '/' + (passed + failed));

  if (failed === 0) {
    Logger.log('\n✓ ALL TESTS PASSED');
  } else {
    Logger.log('\n✗ SOME TESTS FAILED - Review above for details');
  }

  return { passed, failed, total: passed + failed };
}

/**
 * Integration test: Full render with calculator section
 * Tests the complete flow from render() to buildCalculatorSection()
 */
function testPhase5_Integration(clientId) {
  clientId = clientId || '6123LY';  // Use a known test client
  Logger.log('=== Phase 5 Integration Test (Client: ' + clientId + ') ===\n');

  try {
    // Step 1: Render the full page
    Logger.log('Step 1: Rendering Tool 6 page...');
    const result = Tool6.render({ clientId: clientId });
    const html = result.getContent();
    Logger.log('  Page rendered. Length: ' + html.length + ' chars');

    // Step 2: Check if calculator section is present
    Logger.log('\nStep 2: Checking calculator section...');
    const hasCalculator = html.includes('calculator-controls') || html.includes('calculator-placeholder');

    if (html.includes('calculator-controls')) {
      Logger.log('  ✓ Calculator UI is rendered (user has completed questionnaire)');

      // Check for key elements
      const elements = [
        { name: 'Current State', pattern: 'current-state-grid' },
        { name: 'Investment Score', pattern: 'investment-score-display' },
        { name: 'Tax Strategy', pattern: 'tax-strategy-toggle' },
        { name: 'Vehicle Sliders', pattern: 'vehicle-sliders' }
      ];

      for (const el of elements) {
        const found = html.includes(el.pattern);
        Logger.log('    ' + (found ? '✓' : '✗') + ' ' + el.name);
      }
    } else if (html.includes('Complete Your Profile')) {
      Logger.log('  ℹ Calculator placeholder shown (questionnaire not complete)');
    } else if (html.includes('Tool 4 Required')) {
      Logger.log('  ℹ Blocker message shown (Tool 4 not complete)');
    } else {
      Logger.log('  ? Unknown state');
    }

    // Step 3: Check for JavaScript handlers
    Logger.log('\nStep 3: Checking JavaScript handlers...');
    const handlers = [
      'updateInvestmentScore',
      'updateTaxStrategy',
      'updateVehicleDisplay',
      'updateVehicleAllocation',
      'recalculateAllocation'
    ];

    for (const handler of handlers) {
      const found = html.includes('function ' + handler);
      Logger.log('  ' + (found ? '✓' : '✗') + ' ' + handler + '()');
    }

    // Step 4: Check for CSS styles
    Logger.log('\nStep 4: Checking CSS styles...');
    const styles = [
      'calc-subsection',
      'vehicle-slider-row',
      'score-btn',
      'tax-option'
    ];

    for (const style of styles) {
      const found = html.includes('.' + style);
      Logger.log('  ' + (found ? '✓' : '✗') + ' .' + style);
    }

    Logger.log('\n✓ Integration test complete');
    return { success: true, htmlLength: html.length };

  } catch (e) {
    Logger.log('\n✗ Integration test FAILED: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return { success: false, error: e.message };
  }
}

// ============================================================================
// SPRINT 12: TAX LOGIC IMPROVEMENTS TESTS
// ============================================================================

/**
 * Sprint 12 Test: Backdoor Roth Pro-Rata & Solo 401(k) Dynamic Limits
 * Run from Apps Script Editor: testSprint12()
 */
function testSprint12() {
  Logger.log('=== Sprint 12: Tax Logic Improvements Tests ===\n');

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------------------
  // Test 1: Backdoor Roth - Clean (No Trad IRA)
  // -------------------------------------------------------------------------
  Logger.log('Test 1: Backdoor Roth - Clean (No Trad IRA Balance)');
  try {
    const mockProfile = { id: 7, name: 'Foundation Builder' };
    const mockInputs = {
      age: 40,
      grossIncome: 250000,  // Above Roth phase-out
      filingStatus: 'MFJ',
      a3_has401k: 'Yes',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No',
      a13b_tradIRABalance: 'none',  // No Trad IRA
      a13c_401kAcceptsRollovers: ''
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const hasBackdoor = eligible['Backdoor Roth IRA'] !== undefined;
    const note = eligible['Backdoor Roth IRA']?.note || '';
    const warning = eligible['Backdoor Roth IRA']?.warning;
    const isClean = note.includes('tax-free') && !warning;

    Logger.log('  Has Backdoor Roth: ' + hasBackdoor);
    Logger.log('  Note: ' + note.substring(0, 60) + '...');
    Logger.log('  Warning: ' + (warning || 'None'));
    Logger.log('  Is clean (no warning): ' + isClean);

    const pass = hasBackdoor && isClean;
    Logger.log(pass ? '  ✓ Test 1 PASSED\n' : '  ✗ Test 1 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 1 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 2: Backdoor Roth - Pro-Rata Warning (Has Trad IRA, no rollover)
  // -------------------------------------------------------------------------
  Logger.log('Test 2: Backdoor Roth - Pro-Rata Warning');
  try {
    const mockProfile = { id: 7, name: 'Foundation Builder' };
    const mockInputs = {
      age: 40,
      grossIncome: 250000,
      filingStatus: 'MFJ',
      a3_has401k: 'Yes',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No',
      a13b_tradIRABalance: 'over10k',  // Has Trad IRA
      a13c_401kAcceptsRollovers: 'no'   // Cannot roll
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const backdoor = eligible['Backdoor Roth IRA'];
    const hasWarning = backdoor?.warning && backdoor.warning.toLowerCase().includes('pro-rata');
    const noteHasProRata = backdoor?.note && backdoor.note.toLowerCase().includes('pro-rata');

    Logger.log('  Has warning: ' + !!backdoor?.warning);
    Logger.log('  Warning mentions pro-rata: ' + hasWarning);
    Logger.log('  Note mentions pro-rata: ' + noteHasProRata);

    const pass = hasWarning && noteHasProRata;
    Logger.log(pass ? '  ✓ Test 2 PASSED\n' : '  ✗ Test 2 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 2 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 3: Backdoor Roth - Rollover Suggestion
  // -------------------------------------------------------------------------
  Logger.log('Test 3: Backdoor Roth - Rollover Suggestion');
  try {
    const mockProfile = { id: 7, name: 'Foundation Builder' };
    const mockInputs = {
      age: 40,
      grossIncome: 250000,
      filingStatus: 'MFJ',
      a3_has401k: 'Yes',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No',
      a13b_tradIRABalance: 'over10k',  // Has Trad IRA
      a13c_401kAcceptsRollovers: 'yes'  // CAN roll
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const backdoor = eligible['Backdoor Roth IRA'];
    const hasRolloverNote = backdoor?.note && backdoor.note.includes('Roll');
    const hasRolloverWarning = backdoor?.warning && backdoor.warning.includes('rolling');
    const hasActionItem = eligible['IRA Rollover to 401k'] !== undefined;

    Logger.log('  Note mentions rollover: ' + hasRolloverNote);
    Logger.log('  Warning suggests rollover: ' + hasRolloverWarning);
    Logger.log('  Has IRA Rollover action item: ' + hasActionItem);

    const pass = hasRolloverNote && hasRolloverWarning && hasActionItem;
    Logger.log(pass ? '  ✓ Test 3 PASSED\n' : '  ✗ Test 3 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 3 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 4: Solo 401(k) - Low Income ($80k)
  // -------------------------------------------------------------------------
  Logger.log('Test 4: Solo 401(k) Employer - Low Income ($80k)');
  try {
    const mockProfile = { id: 4, name: 'Solo 401(k) Optimizer' };
    const mockInputs = {
      age: 40,
      grossIncome: 80000,
      filingStatus: 'Single',
      c5_workSituation: 'Self-employed',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No',
      a13d_selfEmploymentIncome: 80000
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const soloEmployer = eligible['Solo 401(k) Employer'];
    const monthlyLimit = soloEmployer?.monthlyLimit || 0;
    const annualLimit = monthlyLimit * 12;
    const expectedLimit = 80000 * 0.20;  // 20% of $80k = $16k

    Logger.log('  Monthly limit: $' + Math.round(monthlyLimit));
    Logger.log('  Annual limit: $' + Math.round(annualLimit));
    Logger.log('  Expected annual: $' + expectedLimit);
    Logger.log('  Note: ' + (soloEmployer?.note || 'None'));

    // Allow 10% tolerance for rounding
    const pass = annualLimit > 0 && Math.abs(annualLimit - expectedLimit) < expectedLimit * 0.1;
    Logger.log(pass ? '  ✓ Test 4 PASSED\n' : '  ✗ Test 4 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 4 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 5: Solo 401(k) - High Income ($250k) - Should hit cap
  // -------------------------------------------------------------------------
  Logger.log('Test 5: Solo 401(k) Employer - High Income ($250k)');
  try {
    const mockProfile = { id: 4, name: 'Solo 401(k) Optimizer' };
    const mockInputs = {
      age: 40,
      grossIncome: 250000,
      filingStatus: 'Single',
      c5_workSituation: 'Self-employed',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No',
      a13d_selfEmploymentIncome: 250000
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const soloEmployer = eligible['Solo 401(k) Employer'];
    const monthlyLimit = soloEmployer?.monthlyLimit || 0;
    const annualLimit = monthlyLimit * 12;
    const maxCap = 46500;  // IRS cap for employer contributions

    Logger.log('  Monthly limit: $' + Math.round(monthlyLimit));
    Logger.log('  Annual limit: $' + Math.round(annualLimit));
    Logger.log('  Max IRS cap: $' + maxCap);

    // Should be at or near the cap (20% of $250k = $50k, but capped at $46.5k)
    const pass = annualLimit > 40000 && annualLimit <= maxCap + 1000;
    Logger.log(pass ? '  ✓ Test 5 PASSED\n' : '  ✗ Test 5 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 5 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 6: Solo 401(k) - Uses grossIncome when SE income not provided
  // -------------------------------------------------------------------------
  Logger.log('Test 6: Solo 401(k) - Falls back to grossIncome');
  try {
    const mockProfile = { id: 4, name: 'Solo 401(k) Optimizer' };
    const mockInputs = {
      age: 40,
      grossIncome: 100000,
      filingStatus: 'Single',
      c5_workSituation: 'Self-employed',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No'
      // a13d_selfEmploymentIncome NOT provided
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const soloEmployer = eligible['Solo 401(k) Employer'];
    const monthlyLimit = soloEmployer?.monthlyLimit || 0;
    const annualLimit = monthlyLimit * 12;
    const expectedLimit = 100000 * 0.20;  // 20% of $100k = $20k

    Logger.log('  Annual limit: $' + Math.round(annualLimit));
    Logger.log('  Expected (from grossIncome): $' + expectedLimit);

    const pass = Math.abs(annualLimit - expectedLimit) < expectedLimit * 0.1;
    Logger.log(pass ? '  ✓ Test 6 PASSED\n' : '  ✗ Test 6 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 6 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Test 7: No Backdoor when income below phase-out
  // -------------------------------------------------------------------------
  Logger.log('Test 7: No Backdoor Roth when income below phase-out');
  try {
    const mockProfile = { id: 7, name: 'Foundation Builder' };
    const mockInputs = {
      age: 40,
      grossIncome: 100000,  // Below MFJ phase-out ($236k)
      filingStatus: 'MFJ',
      a3_has401k: 'Yes',
      a7_hsaEligible: 'Yes',
      a8_hasChildren: 'No'
    };

    const eligible = Tool6.getEligibleVehicles(mockProfile, mockInputs, 'Both');

    const hasBackdoor = eligible['Backdoor Roth IRA'] !== undefined;
    const hasDirectRoth = eligible['IRA Roth'] !== undefined;

    Logger.log('  Has Backdoor Roth: ' + hasBackdoor + ' (expected: false)');
    Logger.log('  Has Direct Roth IRA: ' + hasDirectRoth + ' (expected: true)');

    const pass = !hasBackdoor && hasDirectRoth;
    Logger.log(pass ? '  ✓ Test 7 PASSED\n' : '  ✗ Test 7 FAILED\n');
    if (pass) passed++; else failed++;
  } catch (e) {
    Logger.log('  ✗ Test 7 FAILED: ' + e.message + '\n');
    failed++;
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  Logger.log('=== Sprint 12 Test Summary ===');
  Logger.log('Passed: ' + passed + '/' + (passed + failed));
  Logger.log('Failed: ' + failed + '/' + (passed + failed));

  if (failed === 0) {
    Logger.log('\n✓ ALL SPRINT 12 TESTS PASSED');
  } else {
    Logger.log('\n✗ SOME TESTS FAILED - Review above for details');
  }

  return { passed, failed, total: passed + failed };
}
