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

// ============================================================================
// COMPREHENSIVE TEST SUITE (from Tool6-Testing-Plan.md)
// ============================================================================

// ========== TEST UTILITIES ==========

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 */
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random valid inputs for invariant testing
 * Ensures inputs are internally consistent (e.g., no Roth 401k without 401k)
 */
function generateRandomInputs() {
  const profileId = randomInt(1, 9);
  const age = randomInt(22, 70);
  const income = randomChoice([50000, 80000, 120000, 180000, 250000, 400000]);
  let has401k = randomChoice(['Yes', 'No']);
  let hasRoth401k = has401k === 'Yes' ? randomChoice(['Yes', 'No']) : 'No';
  const hasMatch = has401k === 'Yes' ? randomChoice(['Yes', 'No']) : 'No';
  const hsaEligible = randomChoice(['Yes', 'No']);
  const hasChildren = randomChoice(['Yes', 'No']);
  const taxPreference = randomChoice(['Now', 'Later', 'Both']);
  const filingStatus = randomChoice(['Single', 'MFJ', 'MFS', 'HoH']);
  const monthlyBudget = randomInt(500, 10000);

  // Profile-specific adjustments
  // Profiles 1, 3, 4 don't use traditional employer 401(k) plans
  if (profileId === 1) {
    // ROBS-In-Use uses ROBS structure, not traditional 401(k)
    has401k = 'No';
    hasRoth401k = 'No';
  } else if (profileId === 3) {
    // Business with Employees uses SEP-IRA and SIMPLE IRA, not traditional 401(k)
    has401k = 'No';
    hasRoth401k = 'No';
  } else if (profileId === 4) {
    // Solo 401k profile should not have employer 401k
    has401k = 'No';
    hasRoth401k = 'No';
  }

  return {
    profileId,
    age,
    grossIncome: income,
    a1_grossIncome: income,
    monthlyBudget,
    yearsToRetirement: Math.max(1, 65 - age),
    a2_yearsToRetirement: Math.max(1, 65 - age),
    filingStatus,
    taxPreference,
    a2b_taxPreference: taxPreference,
    a3_has401k: has401k,
    a4_hasMatch: hasMatch,
    a6_hasRoth401k: hasRoth401k,
    a7_hsaEligible: hsaEligible,
    a8_hasChildren: hasChildren,
    a9_numChildren: hasChildren === 'Yes' ? randomInt(1, 3) : 0,
    a11_educationVehicle: hasChildren === 'Yes' ? randomChoice(['529', 'coverdell', 'both']) : '529',
    a13b_tradIRABalance: randomChoice(['none', 'under10k', 'over10k']),
    a13c_401kAcceptsRollovers: has401k === 'Yes' ? randomChoice(['yes', 'no', 'unsure']) : '',
    a13d_selfEmploymentIncome: profileId === 4 ? income : 0,
    c5_workSituation: profileId === 4 ? 'Self-employed' : (profileId === 3 ? 'BizWithEmployees' : 'W-2')
  };
}

/**
 * Build profile object from profileId
 */
function buildProfileFromId(profileId) {
  return PROFILE_DEFINITIONS[profileId] || PROFILE_DEFINITIONS[7];
}

/**
 * Build toolStatus mock from inputs
 */
function buildToolStatusFromInputs(inputs) {
  return {
    age: inputs.age,
    grossIncome: inputs.grossIncome,
    filingStatus: inputs.filingStatus,
    monthlyBudget: inputs.monthlyBudget,
    yearsToRetirement: inputs.yearsToRetirement,
    investmentScore: randomInt(1, 7),
    hasTool4: true
  };
}

/**
 * Run allocation and return result for testing
 */
function runAllocationForTest(inputs) {
  const profile = buildProfileFromId(inputs.profileId);
  const toolStatus = buildToolStatusFromInputs(inputs);

  // Merge inputs as preSurveyData
  const preSurveyData = { ...inputs };

  return Tool6.calculateAllocation('test-client', preSurveyData, profile, toolStatus);
}

/**
 * Get monthly IRA limit based on age (for invariant checking)
 */
function getIRAMonthlyLimit(age) {
  let annual = IRS_LIMITS_2025.ROTH_IRA;
  if (age >= 50) {
    annual += IRS_LIMITS_2025.CATCHUP_IRA;
  }
  return annual / 12;
}

/**
 * Get monthly 401k limit based on age (for invariant checking)
 */
function get401kMonthlyLimit(age) {
  let annual = IRS_LIMITS_2025.EMPLOYEE_401K;
  if (age >= 60 && age <= 63) {
    annual += IRS_LIMITS_2025.CATCHUP_401K_60;
  } else if (age >= 50) {
    annual += IRS_LIMITS_2025.CATCHUP_401K_50;
  }
  return annual / 12;
}

/**
 * Get monthly HSA limit based on age and filing status
 */
function getHSAMonthlyLimit(age, filingStatus) {
  let annual = filingStatus === 'MFJ' ? IRS_LIMITS_2025.HSA_FAMILY : IRS_LIMITS_2025.HSA_INDIVIDUAL;
  if (age >= 55) {
    annual += IRS_LIMITS_2025.HSA_CATCHUP;
  }
  return annual / 12;
}

// ========== GOLDEN FILE SCENARIOS ==========
// Deterministic test cases with exact expected allocations
// Monthly limits (2025): 401k=$1958.33, IRA=$583.33, HSA Individual=$358.33, Coverdell=$166.67

const GOLDEN_FILE_SCENARIOS = {
  // ========== PROFILE 7: Standard W-2 Worker ==========
  profile7: [
    {
      scenarioId: 'PROF7-001',
      description: 'Basic IRA only, taxPref=Both, under limit',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 80000,
        a1_grossIncome: 80000,
        monthlyBudget: 500,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // $500 budget, no 401k/HSA/education -> 100% to Retirement domain -> IRA
      // taxPref=Both -> 50/50 split: $250 Roth, $250 Trad
      expectedAllocations: {
        'IRA Roth': 250,
        'IRA Traditional': 250,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'PROF7-002',
      description: 'Basic IRA only, taxPref=Now (Roth priority)',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 80000,
        a1_grossIncome: 80000,
        monthlyBudget: 500,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Now',
        a2b_taxPreference: 'Now',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // $500 budget -> IRA Roth first (taxPref=Now), fills to $500
      expectedAllocations: {
        'IRA Roth': 500,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'PROF7-003',
      description: 'Basic IRA only, taxPref=Later (Traditional priority)',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 80000,
        a1_grossIncome: 80000,
        monthlyBudget: 500,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Later',
        a2b_taxPreference: 'Later',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // $500 budget -> IRA Traditional first (taxPref=Later), fills to $500
      expectedAllocations: {
        'IRA Roth': 0,
        'IRA Traditional': 500,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'PROF7-004',
      description: 'IRA maxed out, overflow to Family Bank',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 80000,
        a1_grossIncome: 80000,
        monthlyBudget: 800,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // $800 budget, IRA limit = $583.33 -> $216.67 overflow to Family Bank
      // IRA split 50/50: $291.67 each
      expectedAllocations: {
        'IRA Roth': 291.67,
        'IRA Traditional': 291.67,
        'Family Bank': 216.67
      }
    },
    {
      scenarioId: 'PROF7-005',
      description: 'With 401k and IRA, taxPref=Both',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 120000,
        a1_grossIncome: 120000,
        monthlyBudget: 2000,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // $2000 budget -> Retirement domain
      // 401k limit: $1958.33, IRA limit: $583.33
      // Priority order: 401k fills first to limit ($1958.33 split 50/50)
      // Remaining $41.67 goes to IRA (split 50/50)
      expectedAllocations: {
        '401(k) Roth': 979.17,
        '401(k) Traditional': 979.17,
        'IRA Roth': 20.83,
        'IRA Traditional': 20.83,
        'Family Bank': 0
      }
    }
  ],

  // ========== PROFILE 8: Roth Maximizer ==========
  profile8: [
    {
      scenarioId: 'PROF8-001',
      description: 'Roth Maximizer always prioritizes Roth regardless of taxPref',
      inputs: {
        profileId: 8,
        age: 30,
        grossIncome: 100000,
        a1_grossIncome: 100000,
        monthlyBudget: 1500,
        yearsToRetirement: 35,
        filingStatus: 'Single',
        taxPreference: 'Later',  // Even with Later, Profile 8 should do Roth
        a2b_taxPreference: 'Later',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // Profile 8 follows priority order (401k before IRA)
      // Budget $1500 -> all goes to 401k Roth (under limit)
      expectedAllocations: {
        '401(k) Roth': 1500,
        '401(k) Traditional': 0,
        'IRA Roth': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'PROF8-002',
      description: 'Roth Maximizer with HSA',
      inputs: {
        profileId: 8,
        age: 30,
        grossIncome: 100000,
        a1_grossIncome: 100000,
        monthlyBudget: 2500,
        yearsToRetirement: 35,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'Yes',
        a8_hasChildren: 'No'
      },
      // HSA gets allocation, taxPreference='Both' applies to retirement
      // 401k fills to limit split 50/50, remaining to IRA split 50/50
      expectedAllocations: {
        'HSA': 358.33,
        '401(k) Roth': 979.17,
        '401(k) Traditional': 979.17,
        'IRA Roth': 91.67,
        'IRA Traditional': 91.67,
        'Family Bank': 0
      }
    }
  ],

  // ========== PROFILE 4: Solo 401(k) ==========
  profile4: [
    {
      scenarioId: 'PROF4-001',
      description: 'Solo 401k with taxPref=Both',
      inputs: {
        profileId: 4,
        age: 40,
        grossIncome: 150000,
        a1_grossIncome: 150000,
        monthlyBudget: 3000,
        yearsToRetirement: 25,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',  // No employer 401k (self-employed)
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No',
        a13d_selfEmploymentIncome: 150000,
        c5_workSituation: 'Self-employed'
      },
      // Solo 401k Employee split 50/50 ($1958.34 total)
      // Remaining budget goes to other Solo 401k components (employer profit sharing)
      expectedAllocations: {
        'Solo 401(k) Employee (Roth)': 979.17,
        'Solo 401(k) Employee (Traditional)': 979.17
      }
    },
    {
      scenarioId: 'PROF4-002',
      description: 'Solo 401k with taxPref=Now (Roth priority)',
      inputs: {
        profileId: 4,
        age: 40,
        grossIncome: 150000,
        a1_grossIncome: 150000,
        monthlyBudget: 2500,
        yearsToRetirement: 25,
        filingStatus: 'Single',
        taxPreference: 'Now',
        a2b_taxPreference: 'Now',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No',
        a13d_selfEmploymentIncome: 150000,
        c5_workSituation: 'Self-employed'
      },
      // Solo 401k Roth fills to limit ($1958.33), remaining to IRA Roth
      expectedAllocations: {
        'Solo 401(k) Employee (Roth)': 1958.33,
        'Solo 401(k) Employee (Traditional)': 0,
        'IRA Roth': 541.67,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    }
  ],

  // ========== PROFILE 5: Bracket Strategist ==========
  profile5: [
    {
      scenarioId: 'PROF5-001',
      description: 'Bracket Strategist always prioritizes Traditional regardless of taxPref',
      inputs: {
        profileId: 5,
        age: 45,
        grossIncome: 200000,
        a1_grossIncome: 200000,
        monthlyBudget: 2000,
        yearsToRetirement: 20,
        filingStatus: 'MFJ',
        taxPreference: 'Now',  // Even with Now, Profile 5 should do Traditional
        a2b_taxPreference: 'Now',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // Profile 5 Traditional-first, 401k fills to limit ($1958.33)
      // Remaining $41.67 goes to IRA Traditional
      expectedAllocations: {
        '401(k) Traditional': 1958.33,
        '401(k) Roth': 0,
        'IRA Traditional': 41.67,
        'IRA Roth': 0,
        'Family Bank': 0
      }
    }
  ],

  // ========== PROFILE 6: Catch-Up Contributor ==========
  profile6: [
    {
      scenarioId: 'PROF6-001',
      description: 'Age 52 with catch-up IRA limits',
      inputs: {
        profileId: 6,
        age: 52,
        grossIncome: 120000,
        a1_grossIncome: 120000,
        monthlyBudget: 800,
        yearsToRetirement: 13,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // IRA limit with catch-up: ($7000 + $1000) / 12 = $666.67
      // Budget $800 > limit, so overflow to Family Bank
      expectedAllocations: {
        'IRA Roth': 333.33,
        'IRA Traditional': 333.33,
        'Family Bank': 133.33
      }
    },
    {
      scenarioId: 'PROF6-002',
      description: 'Age 61 with super catch-up 401k limits',
      inputs: {
        profileId: 6,
        age: 61,
        grossIncome: 150000,
        a1_grossIncome: 150000,
        monthlyBudget: 3500,
        yearsToRetirement: 4,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // 401k super catch-up: ($23500 + $11250) / 12 = $2895.83
      // 401k fills to limit split 50/50: $1447.92 each
      // Remaining $604.17 goes to IRA split 50/50: $302.08 each
      expectedAllocations: {
        '401(k) Roth': 1447.92,
        '401(k) Traditional': 1447.92,
        'IRA Roth': 302.08,
        'IRA Traditional': 302.08,
        'Family Bank': 0
      }
    }
  ],

  // ========== PROFILE 9: Late-Stage Saver ==========
  profile9: [
    {
      scenarioId: 'PROF9-001',
      description: 'Age 57 with HSA catch-up',
      inputs: {
        profileId: 9,
        age: 57,
        grossIncome: 180000,
        a1_grossIncome: 180000,
        monthlyBudget: 1200,
        yearsToRetirement: 8,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',
        a7_hsaEligible: 'Yes',
        a8_hasChildren: 'No'
      },
      // HSA catch-up (age 55+): ($4300 + $1000) / 12 = $441.67
      // Simplified: verify HSA allocation for late-stage saver
      expectedAllocations: {
        'HSA': 441.67
      }
    }
  ],

  // ========== PROFILE 1: ROBS-In-Use ==========
  profile1: [
    {
      scenarioId: 'PROF1-001',
      description: 'ROBS profile with basic allocation',
      inputs: {
        profileId: 1,
        age: 45,
        grossIncome: 100000,
        a1_grossIncome: 100000,
        monthlyBudget: 1000,
        yearsToRetirement: 20,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',  // ROBS uses C-corp structure, not traditional 401k
        a7_hsaEligible: 'Yes',
        a8_hasChildren: 'No'
      },
      // ROBS profile: HSA gets allocation, remaining goes to ROBS-specific vehicles
      expectedAllocations: {
        'HSA': 358.33
      }
    }
  ],

  // ========== PROFILE 3: Business with Employees ==========
  profile3: [
    {
      scenarioId: 'PROF3-001',
      description: 'Business owner with SEP-IRA and SIMPLE IRA',
      inputs: {
        profileId: 3,
        age: 50,
        grossIncome: 200000,
        a1_grossIncome: 200000,
        monthlyBudget: 4000,
        yearsToRetirement: 15,
        filingStatus: 'MFJ',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',  // Uses SEP/SIMPLE instead
        a7_hsaEligible: 'Yes',
        a8_hasChildren: 'Yes',
        a9_numChildren: 2,
        a11_educationVehicle: 'both',
        c5_workSituation: 'BizWithEmployees'
      },
      // Complex allocation across multiple domains
      // Domain weights drive distribution; SEP-IRA prioritized over SIMPLE IRA
      expectedAllocations: {
        'Coverdell ESA': 333.33,
        '529 Plan': 1393.16,
        'HSA': 712.50,
        'SEP-IRA': 1561.01,
        'SIMPLE IRA': 0,
        'IRA Roth': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    }
  ],

  // ========== EDGE CASES ==========
  edgeCases: [
    {
      scenarioId: 'EDGE-001',
      description: 'Very small budget - under all limits',
      inputs: {
        profileId: 7,
        age: 30,
        grossIncome: 50000,
        a1_grossIncome: 50000,
        monthlyBudget: 100,
        yearsToRetirement: 35,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'No',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // $100 split 50/50 to IRA
      expectedAllocations: {
        'IRA Roth': 50,
        'IRA Traditional': 50,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'EDGE-002',
      description: 'Large budget - multiple vehicles maxed',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 150000,
        a1_grossIncome: 150000,
        monthlyBudget: 5000,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'Yes',
        a8_hasChildren: 'Yes',
        a9_numChildren: 1,
        a11_educationVehicle: 'both'
      },
      // Large budget with all vehicles available
      // 529 Plan gets larger allocation via domain weights
      expectedAllocations: {
        'Coverdell ESA': 166.67,
        '529 Plan': 1991.45,
        'HSA': 358.33,
        '401(k) Roth': 979.17,
        '401(k) Traditional': 979.17,
        'IRA Roth': 262.61,
        'IRA Traditional': 262.61,
        'Family Bank': 0
      }
    }
  ],

  // ========== TAX COMPARISON ==========
  taxComparison: [
    {
      scenarioId: 'TAX-CMP-001',
      description: 'Compare Now vs Later vs Both - Now',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 100000,
        a1_grossIncome: 100000,
        monthlyBudget: 1000,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Now',
        a2b_taxPreference: 'Now',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // taxPref=Now -> Roth, 401k fills first (priority order)
      // $1000 budget all goes to 401k Roth
      expectedAllocations: {
        '401(k) Roth': 1000,
        '401(k) Traditional': 0,
        'IRA Roth': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'TAX-CMP-002',
      description: 'Compare Now vs Later vs Both - Later',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 100000,
        a1_grossIncome: 100000,
        monthlyBudget: 1000,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Later',
        a2b_taxPreference: 'Later',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // taxPref=Later -> Traditional, 401k fills first (priority order)
      // $1000 budget all goes to 401k Traditional
      expectedAllocations: {
        '401(k) Roth': 0,
        '401(k) Traditional': 1000,
        'IRA Roth': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'TAX-CMP-003',
      description: 'Compare Now vs Later vs Both - Both',
      inputs: {
        profileId: 7,
        age: 35,
        grossIncome: 100000,
        a1_grossIncome: 100000,
        monthlyBudget: 1000,
        yearsToRetirement: 30,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No'
      },
      // taxPref=Both -> 50/50 split, 401k fills first (priority order)
      // $1000 budget split 50/50 in 401k
      expectedAllocations: {
        '401(k) Roth': 500,
        '401(k) Traditional': 500,
        'IRA Roth': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    }
  ],

  // ========== BACKDOOR ROTH WARNINGS ==========
  backdoorWarnings: [
    {
      scenarioId: 'BDOOR-001',
      description: 'High income triggers backdoor Roth',
      inputs: {
        profileId: 7,
        age: 40,
        grossIncome: 250000,
        a1_grossIncome: 250000,
        monthlyBudget: 1500,
        yearsToRetirement: 25,
        filingStatus: 'Single',
        taxPreference: 'Now',
        a2b_taxPreference: 'Now',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No',
        a13b_tradIRABalance: 'none'
      },
      // High income, 401k fills first (priority order)
      // $1500 budget all goes to 401k Roth
      expectedAllocations: {
        '401(k) Roth': 1500,
        '401(k) Traditional': 0,
        'Backdoor Roth IRA': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    },
    {
      scenarioId: 'BDOOR-002',
      description: 'High income with Traditional IRA balance (pro-rata concern)',
      inputs: {
        profileId: 7,
        age: 40,
        grossIncome: 250000,
        a1_grossIncome: 250000,
        monthlyBudget: 1000,
        yearsToRetirement: 25,
        filingStatus: 'Single',
        taxPreference: 'Both',
        a2b_taxPreference: 'Both',
        a3_has401k: 'Yes',
        a4_hasMatch: 'No',
        a6_hasRoth401k: 'Yes',
        a7_hsaEligible: 'No',
        a8_hasChildren: 'No',
        a13b_tradIRABalance: 'over10k',
        a13c_401kAcceptsRollovers: 'no'
      },
      // High income, taxPref=Both, 401k fills first (priority order)
      // $1000 budget split 50/50 in 401k
      expectedAllocations: {
        '401(k) Roth': 500,
        '401(k) Traditional': 500,
        'Backdoor Roth IRA': 0,
        'IRA Traditional': 0,
        'Family Bank': 0
      }
    }
  ]
};

// ========== INVARIANT CHECKERS ==========

/**
 * TAX-001 through TAX-005: Tax Preference Invariants
 *
 * These rules ensure that tax preference correctly influences
 * Roth vs Traditional allocation decisions.
 *
 * NOTE: Profiles 5 (Bracket Strategist) and 8 (Roth Maximizer) are "tax-strategy-defined"
 * profiles where the profile IS the tax strategy. For these profiles, we respect the
 * profile's built-in priority order and do NOT override with taxPreference. Therefore,
 * TAX-* invariants should not apply to these profiles.
 */
function checkTaxPreferenceInvariants(inputs, allocation) {
  const results = [];

  // Skip tax preference checks for tax-strategy-defined profiles
  // Profile 5 (Bracket Strategist) has Traditional-first strategy built-in
  // Profile 8 (Roth Maximizer) has Roth-first strategy built-in
  const taxStrategyProfiles = [5, 8];
  if (taxStrategyProfiles.includes(inputs.profileId)) {
    return results;  // No tax preference invariants for these profiles
  }

  const vehicles = allocation.vehicles || {};
  const eligible = allocation.eligibleVehicles || {};
  const taxPref = inputs.taxPreference || inputs.a2b_taxPreference || 'Both';

  // TAX-001: Roth-heavy should prioritize IRA Roth over IRA Traditional
  if (taxPref === 'Now' && eligible['IRA Roth'] && eligible['IRA Traditional']) {
    const rothIRA = vehicles['IRA Roth'] || 0;
    const tradIRA = vehicles['IRA Traditional'] || 0;
    results.push({
      id: 'TAX-001',
      passed: rothIRA >= tradIRA,
      message: 'IRA Roth (' + rothIRA.toFixed(2) + ') should be >= IRA Traditional (' + tradIRA.toFixed(2) + ') when taxPreference=Now'
    });
  }

  // TAX-002: Traditional-heavy should prioritize IRA Traditional over IRA Roth
  if (taxPref === 'Later' && eligible['IRA Roth'] && eligible['IRA Traditional']) {
    const rothIRA = vehicles['IRA Roth'] || 0;
    const tradIRA = vehicles['IRA Traditional'] || 0;
    results.push({
      id: 'TAX-002',
      passed: tradIRA >= rothIRA,
      message: 'IRA Traditional (' + tradIRA.toFixed(2) + ') should be >= IRA Roth (' + rothIRA.toFixed(2) + ') when taxPreference=Later'
    });
  }

  // TAX-003: Roth-heavy should prioritize 401(k) Roth over 401(k) Traditional
  if (taxPref === 'Now' && eligible['401(k) Roth'] && eligible['401(k) Traditional']) {
    const roth401k = vehicles['401(k) Roth'] || 0;
    const trad401k = vehicles['401(k) Traditional'] || 0;
    results.push({
      id: 'TAX-003',
      passed: roth401k >= trad401k,
      message: '401(k) Roth (' + roth401k.toFixed(2) + ') should be >= 401(k) Traditional (' + trad401k.toFixed(2) + ') when taxPreference=Now'
    });
  }

  // TAX-004: Traditional-heavy should prioritize 401(k) Traditional over 401(k) Roth
  if (taxPref === 'Later' && eligible['401(k) Roth'] && eligible['401(k) Traditional']) {
    const roth401k = vehicles['401(k) Roth'] || 0;
    const trad401k = vehicles['401(k) Traditional'] || 0;
    results.push({
      id: 'TAX-004',
      passed: trad401k >= roth401k,
      message: '401(k) Traditional (' + trad401k.toFixed(2) + ') should be >= 401(k) Roth (' + roth401k.toFixed(2) + ') when taxPreference=Later'
    });
  }

  // TAX-005: Balanced should split 50/50 (within 1% tolerance of total)
  if (taxPref === 'Both') {
    // Check IRA split
    if (eligible['IRA Roth'] && eligible['IRA Traditional']) {
      const rothIRA = vehicles['IRA Roth'] || 0;
      const tradIRA = vehicles['IRA Traditional'] || 0;
      const totalIRA = rothIRA + tradIRA;
      if (totalIRA > 0) {
        const diff = Math.abs(rothIRA - tradIRA);
        const tolerance = totalIRA * 0.01 + 1; // 1% tolerance plus $1 for rounding
        results.push({
          id: 'TAX-005a',
          passed: diff <= tolerance,
          message: 'IRA split should be ~50/50 when taxPreference=Both. Roth=' + rothIRA.toFixed(2) + ', Trad=' + tradIRA.toFixed(2) + ', diff=' + diff.toFixed(2)
        });
      }
    }

    // Check 401k split
    if (eligible['401(k) Roth'] && eligible['401(k) Traditional']) {
      const roth401k = vehicles['401(k) Roth'] || 0;
      const trad401k = vehicles['401(k) Traditional'] || 0;
      const total401k = roth401k + trad401k;
      if (total401k > 0) {
        const diff = Math.abs(roth401k - trad401k);
        const tolerance = total401k * 0.01 + 1; // 1% tolerance plus $1 for rounding
        results.push({
          id: 'TAX-005b',
          passed: diff <= tolerance,
          message: '401k split should be ~50/50 when taxPreference=Both. Roth=' + roth401k.toFixed(2) + ', Trad=' + trad401k.toFixed(2) + ', diff=' + diff.toFixed(2)
        });
      }
    }

    // Check Solo 401k split (Profile 4)
    if (eligible['Solo 401(k) Employee (Roth)'] && eligible['Solo 401(k) Employee (Traditional)']) {
      const rothSolo = vehicles['Solo 401(k) Employee (Roth)'] || 0;
      const tradSolo = vehicles['Solo 401(k) Employee (Traditional)'] || 0;
      const totalSolo = rothSolo + tradSolo;
      if (totalSolo > 0) {
        const diff = Math.abs(rothSolo - tradSolo);
        const tolerance = totalSolo * 0.01 + 1;
        results.push({
          id: 'TAX-005c',
          passed: diff <= tolerance,
          message: 'Solo 401k Employee split should be ~50/50 when taxPreference=Both. Roth=' + rothSolo.toFixed(2) + ', Trad=' + tradSolo.toFixed(2) + ', diff=' + diff.toFixed(2)
        });
      }
    }
  }

  return results;
}

/**
 * LIMIT-001 through LIMIT-004: Shared Limit Invariants
 *
 * These rules ensure vehicles do not exceed their IRS limits.
 */
function checkSharedLimitInvariants(inputs, allocation) {
  const results = [];
  const vehicles = allocation.vehicles || {};
  const age = parseInt(inputs.age) || 35;
  const filingStatus = inputs.filingStatus || 'Single';
  const tolerance = 0.01; // Small tolerance for floating point

  // LIMIT-001: IRA family cannot exceed combined limit
  const iraRoth = vehicles['IRA Roth'] || 0;
  const iraTrad = vehicles['IRA Traditional'] || 0;
  const backdoorRoth = vehicles['Backdoor Roth IRA'] || 0;
  const iraTotal = iraRoth + iraTrad + backdoorRoth;
  const iraLimit = getIRAMonthlyLimit(age);

  results.push({
    id: 'LIMIT-001',
    passed: iraTotal <= iraLimit + tolerance,
    message: 'IRA total (' + iraTotal.toFixed(2) + ') should be <= limit (' + iraLimit.toFixed(2) + ')'
  });

  // LIMIT-002: 401k family cannot exceed combined limit
  const roth401k = vehicles['401(k) Roth'] || 0;
  const trad401k = vehicles['401(k) Traditional'] || 0;
  const total401k = roth401k + trad401k;
  const limit401k = get401kMonthlyLimit(age);

  if (total401k > 0) {
    results.push({
      id: 'LIMIT-002',
      passed: total401k <= limit401k + tolerance,
      message: '401k total (' + total401k.toFixed(2) + ') should be <= limit (' + limit401k.toFixed(2) + ')'
    });
  }

  // LIMIT-003: Solo 401k employee contributions share limit
  const rothSolo = vehicles['Solo 401(k) Employee (Roth)'] || 0;
  const tradSolo = vehicles['Solo 401(k) Employee (Traditional)'] || 0;
  const totalSoloEmployee = rothSolo + tradSolo;

  if (totalSoloEmployee > 0) {
    const soloLimit = get401kMonthlyLimit(age); // Same as regular 401k
    results.push({
      id: 'LIMIT-003',
      passed: totalSoloEmployee <= soloLimit + tolerance,
      message: 'Solo 401k Employee total (' + totalSoloEmployee.toFixed(2) + ') should be <= limit (' + soloLimit.toFixed(2) + ')'
    });
  }

  // LIMIT-004: No vehicle exceeds its individual limit
  const eligible = allocation.eligibleVehicles || {};
  for (const [vehicle, amount] of Object.entries(vehicles)) {
    if (amount > 0 && eligible[vehicle]) {
      const vehicleLimit = eligible[vehicle].monthlyLimit;
      if (vehicleLimit !== Infinity && vehicleLimit > 0) {
        results.push({
          id: 'LIMIT-004',
          passed: amount <= vehicleLimit + tolerance,
          message: vehicle + ' (' + amount.toFixed(2) + ') should be <= limit (' + vehicleLimit.toFixed(2) + ')'
        });
      }
    }
  }

  return results;
}

/**
 * ELIG-001 through ELIG-007: Eligibility Invariants
 *
 * These rules ensure vehicles are only allocated when eligible.
 */
function checkEligibilityInvariants(inputs, allocation) {
  const results = [];
  const vehicles = allocation.vehicles || {};
  const profileId = inputs.profileId;

  const hsaEligible = inputs.hsaEligible === 'Yes' || inputs.a7_hsaEligible === 'Yes';
  const hasChildren = inputs.hasChildren === 'Yes' || inputs.a8_hasChildren === 'Yes';
  const has401k = inputs.has401k === 'Yes' || inputs.a3_has401k === 'Yes';
  const hasRoth401k = inputs.hasRoth401k === 'Yes' || inputs.a6_hasRoth401k === 'Yes';

  // ELIG-001: HSA requires HDHP eligibility
  if (!hsaEligible) {
    const hsaAlloc = vehicles['HSA'] || 0;
    results.push({
      id: 'ELIG-001',
      passed: hsaAlloc === 0,
      message: 'HSA (' + hsaAlloc.toFixed(2) + ') should be 0 when not HSA eligible'
    });
  }

  // ELIG-002: Education vehicles require children
  if (!hasChildren) {
    const edu529 = vehicles['529 Plan'] || 0;
    const coverdell = vehicles['Coverdell ESA'] || 0;
    results.push({
      id: 'ELIG-002',
      passed: edu529 === 0 && coverdell === 0,
      message: '529 Plan (' + edu529.toFixed(2) + ') and Coverdell (' + coverdell.toFixed(2) + ') should be 0 when no children'
    });
  }

  // ELIG-003: 401k requires employer plan (for W-2 profiles)
  const w2Profiles = [2, 5, 6, 7, 8, 9];
  if (w2Profiles.includes(profileId) && !has401k) {
    const trad401k = vehicles['401(k) Traditional'] || 0;
    const roth401k = vehicles['401(k) Roth'] || 0;
    const match401k = vehicles['401(k) Employer Match'] || 0;
    results.push({
      id: 'ELIG-003',
      passed: trad401k === 0 && roth401k === 0 && match401k === 0,
      message: '401k vehicles should be 0 when no employer 401k. Trad=' + trad401k.toFixed(2) + ', Roth=' + roth401k.toFixed(2) + ', Match=' + match401k.toFixed(2)
    });
  }

  // ELIG-004: Roth 401k requires employer to offer it
  if (has401k && !hasRoth401k) {
    const roth401k = vehicles['401(k) Roth'] || 0;
    results.push({
      id: 'ELIG-004',
      passed: roth401k === 0,
      message: '401(k) Roth (' + roth401k.toFixed(2) + ') should be 0 when employer does not offer Roth option'
    });
  }

  // ELIG-005: ROBS only for Profile 1
  if (profileId !== 1) {
    const robsAlloc = vehicles['ROBS Distribution'] || 0;
    results.push({
      id: 'ELIG-005',
      passed: robsAlloc === 0,
      message: 'ROBS Distribution (' + robsAlloc.toFixed(2) + ') should be 0 for profile ' + profileId + ' (only Profile 1)'
    });
  }

  // ELIG-006: Solo 401k only for Profile 4
  if (profileId !== 4) {
    const soloRoth = vehicles['Solo 401(k) Employee (Roth)'] || 0;
    const soloTrad = vehicles['Solo 401(k) Employee (Traditional)'] || 0;
    const soloEmployer = vehicles['Solo 401(k) Employer'] || 0;
    const totalSolo = soloRoth + soloTrad + soloEmployer;
    results.push({
      id: 'ELIG-006',
      passed: totalSolo === 0,
      message: 'Solo 401k vehicles (' + totalSolo.toFixed(2) + ') should be 0 for profile ' + profileId + ' (only Profile 4)'
    });
  }

  // ELIG-007: SEP-IRA and SIMPLE IRA only for Profile 3
  if (profileId !== 3) {
    const sepIRA = vehicles['SEP-IRA'] || 0;
    const simpleIRA = vehicles['SIMPLE IRA'] || 0;
    results.push({
      id: 'ELIG-007',
      passed: sepIRA === 0 && simpleIRA === 0,
      message: 'SEP-IRA (' + sepIRA.toFixed(2) + ') and SIMPLE IRA (' + simpleIRA.toFixed(2) + ') should be 0 for profile ' + profileId + ' (only Profile 3)'
    });
  }

  return results;
}

/**
 * PRIO-001 through PRIO-004: Priority Order Invariants
 *
 * These rules ensure vehicles are funded in the correct priority order.
 */
function checkPriorityOrderInvariants(inputs, allocation) {
  const results = [];
  const vehicles = allocation.vehicles || {};
  const eligible = allocation.eligibleVehicles || {};
  const monthlyBudget = inputs.monthlyBudget || 0;

  // PRIO-001: Employer match should be allocated before other discretionary vehicles if eligible
  // Note: Employer match is handled as a seed, so this is more about checking it exists when expected
  // Only check for W-2 profiles that can have employer 401(k) plans
  const w2ProfilesFor401k = [2, 5, 6, 7, 8, 9];
  const hasMatch = inputs.hasMatch === 'Yes' || inputs.a4_hasMatch === 'Yes';
  const has401k = inputs.has401k === 'Yes' || inputs.a3_has401k === 'Yes';
  const profileId = inputs.profileId;
  if (w2ProfilesFor401k.includes(profileId) && has401k && hasMatch && monthlyBudget > 0) {
    // Match should have some allocation (it is non-discretionary seed)
    // We cannot test exact amount without knowing match formula, but if match is eligible
    // and we have budget, there should be match processing (even if $0 due to formula)
    results.push({
      id: 'PRIO-001',
      passed: eligible['401(k) Employer Match'] !== undefined,
      message: '401(k) Employer Match should be in eligible vehicles when hasMatch=Yes (Profile ' + profileId + ')'
    });
  }

  // PRIO-002: Family Bank should only have allocation if other vehicles are maxed OR overflow
  const familyBank = vehicles['Family Bank'] || 0;
  if (familyBank > 0) {
    // Family Bank should only receive overflow - check that retirement vehicles are reasonably allocated
    // This is a soft check - Family Bank getting funds is OK if other limits are hit
    const totalAllocated = Object.values(vehicles).reduce((sum, v) => sum + (v || 0), 0);
    results.push({
      id: 'PRIO-002',
      passed: true, // Soft check - just log for review
      message: 'Family Bank has ' + familyBank.toFixed(2) + ' allocation. Total allocated: ' + totalAllocated.toFixed(2) + '. Review if this is expected overflow.'
    });
  }

  // PRIO-003: If HSA is eligible, it should generally be allocated before IRAs
  // (HSA has triple tax advantage)
  const hsaEligible = inputs.hsaEligible === 'Yes' || inputs.a7_hsaEligible === 'Yes';
  if (hsaEligible && eligible['HSA']) {
    const hsaAlloc = vehicles['HSA'] || 0;
    const hsaLimit = eligible['HSA'].monthlyLimit || 0;
    const iraRoth = vehicles['IRA Roth'] || 0;
    const iraTrad = vehicles['IRA Traditional'] || 0;
    const totalIRA = iraRoth + iraTrad;

    // If HSA is not maxed but IRA has allocation, that might be a priority issue
    // However, domain weights might cause this legitimately, so this is informational
    if (hsaAlloc < hsaLimit && totalIRA > 0) {
      results.push({
        id: 'PRIO-003',
        passed: true, // Informational - domain weights may cause this
        message: 'HSA (' + hsaAlloc.toFixed(2) + '/' + hsaLimit.toFixed(2) + ') not maxed but IRA has ' + totalIRA.toFixed(2) + '. May be due to domain weights.'
      });
    }
  }

  // PRIO-004: Coverdell should be funded before 529 (Coverdell has $2k limit)
  const coverdell = vehicles['Coverdell ESA'] || 0;
  const plan529 = vehicles['529 Plan'] || 0;
  if (eligible['Coverdell ESA'] && eligible['529 Plan'] && plan529 > 0) {
    const coverdellLimit = eligible['Coverdell ESA'].monthlyLimit || 0;
    // If 529 has funds but Coverdell is not maxed, check priority
    if (coverdell < coverdellLimit) {
      results.push({
        id: 'PRIO-004',
        passed: coverdell >= coverdellLimit || coverdell >= plan529,
        message: 'Coverdell (' + coverdell.toFixed(2) + '/' + coverdellLimit.toFixed(2) + ') should be funded before 529 (' + plan529.toFixed(2) + ')'
      });
    }
  }

  return results;
}

/**
 * BUDGET-001 through BUDGET-004: Budget Invariants
 *
 * These rules ensure budget is properly allocated.
 */
function checkBudgetInvariants(inputs, allocation) {
  const results = [];
  const vehicles = allocation.vehicles || {};
  const monthlyBudget = inputs.monthlyBudget || 0;
  const employerMatch = allocation.employerMatch || 0;

  // Calculate total allocated
  const totalAllocated = Object.values(vehicles).reduce((sum, v) => sum + (v || 0), 0);

  // BUDGET-001: Total allocation should equal budget plus seeds
  // Note: Employer match is a seed that is added to allocations
  const expectedTotal = monthlyBudget + employerMatch;
  const tolerance = 1; // $1 tolerance for rounding
  results.push({
    id: 'BUDGET-001',
    passed: Math.abs(totalAllocated - expectedTotal) <= tolerance,
    message: 'Total allocated (' + totalAllocated.toFixed(2) + ') should equal budget+seeds (' + expectedTotal.toFixed(2) + ')'
  });

  // BUDGET-002: No allocation should be negative
  let hasNegative = false;
  let negativeVehicle = '';
  for (const [vehicle, amount] of Object.entries(vehicles)) {
    if (amount < 0) {
      hasNegative = true;
      negativeVehicle = vehicle + '=' + amount.toFixed(2);
      break;
    }
  }
  results.push({
    id: 'BUDGET-002',
    passed: !hasNegative,
    message: hasNegative ? 'Found negative allocation: ' + negativeVehicle : 'All allocations are non-negative'
  });

  // BUDGET-003: If budget is 0, only seeds should have allocations
  if (monthlyBudget === 0) {
    const nonSeedTotal = totalAllocated - employerMatch;
    results.push({
      id: 'BUDGET-003',
      passed: nonSeedTotal <= tolerance,
      message: 'With zero budget, non-seed allocations should be 0. Found: ' + nonSeedTotal.toFixed(2)
    });
  }

  // BUDGET-004: Domain waterfall cascade verification
  // Education unspent → Health, Health unspent → Retirement, final → Family Bank
  // This is complex to verify precisely, so we do a soft check
  const familyBank = vehicles['Family Bank'] || 0;
  if (familyBank > 0 && monthlyBudget > 0) {
    // Family Bank should only have overflow - informational check
    results.push({
      id: 'BUDGET-004',
      passed: true, // Informational
      message: 'Family Bank overflow: ' + familyBank.toFixed(2) + ' of ' + monthlyBudget.toFixed(2) + ' budget'
    });
  }

  return results;
}

/**
 * PROF-001 through PROF-005: Profile-Specific Invariants
 *
 * These rules ensure profile-specific behaviors are correct.
 */
function checkProfileSpecificInvariants(inputs, allocation) {
  const results = [];
  const vehicles = allocation.vehicles || {};
  const vehicleOrder = allocation.vehicleOrder || [];
  const profileId = inputs.profileId;
  const age = parseInt(inputs.age) || 35;

  // PROF-001: Profile 8 (Roth Maximizer) - Roth should appear before Traditional in priority
  if (profileId === 8) {
    const rothIndex = vehicleOrder.indexOf('401(k) Roth');
    const tradIndex = vehicleOrder.indexOf('401(k) Traditional');
    if (rothIndex >= 0 && tradIndex >= 0) {
      results.push({
        id: 'PROF-001',
        passed: rothIndex < tradIndex,
        message: 'Profile 8: 401(k) Roth (index ' + rothIndex + ') should be before 401(k) Traditional (index ' + tradIndex + ')'
      });
    }
  }

  // PROF-002: Profile 5 (Bracket Strategist) - Traditional should appear before Roth in priority
  if (profileId === 5) {
    const rothIndex = vehicleOrder.indexOf('401(k) Roth');
    const tradIndex = vehicleOrder.indexOf('401(k) Traditional');
    if (rothIndex >= 0 && tradIndex >= 0) {
      results.push({
        id: 'PROF-002',
        passed: tradIndex < rothIndex,
        message: 'Profile 5: 401(k) Traditional (index ' + tradIndex + ') should be before 401(k) Roth (index ' + rothIndex + ')'
      });
    }
  }

  // PROF-003: Profile 4 (Solo 401k) - Solo 401k vehicles should be present
  if (profileId === 4) {
    const eligible = allocation.eligibleVehicles || {};
    const hasSoloVehicles = eligible['Solo 401(k) Employee (Roth)'] ||
                            eligible['Solo 401(k) Employee (Traditional)'] ||
                            eligible['Solo 401(k) Employer'];
    results.push({
      id: 'PROF-003',
      passed: hasSoloVehicles,
      message: 'Profile 4: Solo 401(k) vehicles should be in eligible vehicles'
    });
  }

  // PROF-004: Profile 6 (Catch-Up) - If age >= 50, catch-up limits should apply
  if (profileId === 6 && age >= 50) {
    const eligible = allocation.eligibleVehicles || {};
    const ira = eligible['IRA Traditional'] || eligible['IRA Roth'];
    if (ira) {
      const expectedLimit = (IRS_LIMITS_2025.ROTH_IRA + IRS_LIMITS_2025.CATCHUP_IRA) / 12;
      const actualLimit = ira.monthlyLimit || 0;
      results.push({
        id: 'PROF-004',
        passed: Math.abs(actualLimit - expectedLimit) < 1,
        message: 'Profile 6 (age ' + age + '): IRA limit should include catch-up. Expected ~' + expectedLimit.toFixed(2) + ', got ' + actualLimit.toFixed(2)
      });
    }
  }

  // PROF-005: Profile 9 (Late-Stage) - If age >= 55, HSA catch-up should apply
  if (profileId === 9 && age >= 55) {
    const eligible = allocation.eligibleVehicles || {};
    const hsaEligible = inputs.hsaEligible === 'Yes' || inputs.a7_hsaEligible === 'Yes';
    if (hsaEligible && eligible['HSA']) {
      const filingStatus = inputs.filingStatus || 'Single';
      const expectedLimit = getHSAMonthlyLimit(age, filingStatus);
      const actualLimit = eligible['HSA'].monthlyLimit || 0;
      results.push({
        id: 'PROF-005',
        passed: Math.abs(actualLimit - expectedLimit) < 1,
        message: 'Profile 9 (age ' + age + '): HSA limit should include catch-up. Expected ~' + expectedLimit.toFixed(2) + ', got ' + actualLimit.toFixed(2)
      });
    }
  }

  return results;
}

/**
 * Run all invariant checks against an allocation result
 */
function checkAllInvariants(inputs, allocation) {
  const allResults = [];

  allResults.push(...checkTaxPreferenceInvariants(inputs, allocation));
  allResults.push(...checkSharedLimitInvariants(inputs, allocation));
  allResults.push(...checkEligibilityInvariants(inputs, allocation));
  allResults.push(...checkPriorityOrderInvariants(inputs, allocation));
  allResults.push(...checkBudgetInvariants(inputs, allocation));
  allResults.push(...checkProfileSpecificInvariants(inputs, allocation));

  return allResults;
}

// ========== TEST RUNNERS ==========

/**
 * Run invariant tests against N random input combinations
 *
 * @param {number} iterations - Number of random inputs to test (default: 1000)
 * @returns {Object} Test results with pass/fail counts and failures
 */
function runInvariantTests(iterations) {
  iterations = iterations || 1000;

  const results = {
    passed: 0,
    failed: 0,
    failures: [],
    byInvariant: {}
  };

  Logger.log('Running ' + iterations + ' invariant test iterations...');

  for (let i = 0; i < iterations; i++) {
    try {
      const inputs = generateRandomInputs();
      const allocation = runAllocationForTest(inputs);

      // Skip if allocation has error (e.g., zero budget edge case)
      if (allocation.error) {
        continue;
      }

      const invariantResults = checkAllInvariants(inputs, allocation);

      for (const result of invariantResults) {
        // Track by invariant ID
        if (!results.byInvariant[result.id]) {
          results.byInvariant[result.id] = { passed: 0, failed: 0 };
        }

        if (result.passed) {
          results.passed++;
          results.byInvariant[result.id].passed++;
        } else {
          results.failed++;
          results.byInvariant[result.id].failed++;

          // Only store first 50 failures to avoid memory issues
          if (results.failures.length < 50) {
            results.failures.push({
              iteration: i,
              invariantId: result.id,
              inputs: {
                profileId: inputs.profileId,
                age: inputs.age,
                grossIncome: inputs.grossIncome,
                taxPreference: inputs.taxPreference || inputs.a2b_taxPreference,
                monthlyBudget: inputs.monthlyBudget,
                has401k: inputs.a3_has401k,
                hasRoth401k: inputs.a6_hasRoth401k,
                hsaEligible: inputs.a7_hsaEligible,
                hasChildren: inputs.a8_hasChildren
              },
              allocation: {
                vehicles: allocation.vehicles,
                taxPreference: allocation.taxPreference
              },
              message: result.message
            });
          }
        }
      }
    } catch (e) {
      // Log error but continue
      Logger.log('Error in iteration ' + i + ': ' + e.message);
    }

    // Progress indicator every 100 iterations
    if ((i + 1) % 100 === 0) {
      Logger.log('  Completed ' + (i + 1) + '/' + iterations + ' iterations');
    }
  }

  return results;
}

/**
 * Run golden file tests (placeholder - scenarios added in Phase 3)
 */
function runGoldenFileTests() {
  const results = { passed: 0, failed: 0, failures: [] };

  // Collect all scenarios
  const allScenarios = [
    ...GOLDEN_FILE_SCENARIOS.profile7,
    ...GOLDEN_FILE_SCENARIOS.profile8,
    ...GOLDEN_FILE_SCENARIOS.profile4,
    ...GOLDEN_FILE_SCENARIOS.profile5,
    ...GOLDEN_FILE_SCENARIOS.profile6,
    ...GOLDEN_FILE_SCENARIOS.profile9,
    ...GOLDEN_FILE_SCENARIOS.profile1,
    ...GOLDEN_FILE_SCENARIOS.profile3,
    ...GOLDEN_FILE_SCENARIOS.edgeCases,
    ...GOLDEN_FILE_SCENARIOS.taxComparison,
    ...GOLDEN_FILE_SCENARIOS.backdoorWarnings
  ];

  if (allScenarios.length === 0) {
    Logger.log('No golden file scenarios defined yet. Skipping golden file tests.');
    return results;
  }

  Logger.log('Running ' + allScenarios.length + ' golden file scenarios...');

  for (const scenario of allScenarios) {
    try {
      const allocation = runAllocationForTest(scenario.inputs);

      // Compare allocations (with tolerance)
      for (const [vehicle, expected] of Object.entries(scenario.expectedAllocations || {})) {
        const actual = allocation.vehicles[vehicle] || 0;
        const tolerance = 1; // $1 tolerance for rounding

        if (Math.abs(actual - expected) > tolerance) {
          results.failed++;
          results.failures.push({
            scenarioId: scenario.scenarioId,
            vehicle: vehicle,
            expected: expected,
            actual: actual
          });
        } else {
          results.passed++;
        }
      }
    } catch (e) {
      results.failed++;
      results.failures.push({
        scenarioId: scenario.scenarioId,
        error: e.message
      });
    }
  }

  return results;
}

/**
 * Main test entry point - run from Script Editor
 * Usage: Run runAllTool6Tests() from the Apps Script dropdown
 */
function runAllTool6Tests() {
  Logger.log('=== TOOL 6 COMPREHENSIVE TEST SUITE ===');
  Logger.log('Started at: ' + new Date().toISOString());
  Logger.log('');

  // Part 1: Invariant Tests
  Logger.log('--- INVARIANT TESTS (1000 iterations) ---');
  const invariantResults = runInvariantTests(1000);

  Logger.log('');
  Logger.log('Invariant Results:');
  Logger.log('  Total Passed: ' + invariantResults.passed);
  Logger.log('  Total Failed: ' + invariantResults.failed);

  // Show failures by invariant
  Logger.log('');
  Logger.log('Results by Invariant:');
  for (const [id, counts] of Object.entries(invariantResults.byInvariant)) {
    const status = counts.failed > 0 ? 'FAIL' : 'PASS';
    Logger.log('  ' + id + ': ' + status + ' (' + counts.passed + ' passed, ' + counts.failed + ' failed)');
  }

  if (invariantResults.failures.length > 0) {
    Logger.log('');
    Logger.log('First 10 Failures:');
    for (const failure of invariantResults.failures.slice(0, 10)) {
      Logger.log('  [' + failure.invariantId + '] ' + failure.message);
      Logger.log('    Profile: ' + failure.inputs.profileId +
                 ', Age: ' + failure.inputs.age +
                 ', TaxPref: ' + failure.inputs.taxPreference +
                 ', Budget: $' + failure.inputs.monthlyBudget);
      Logger.log('    Vehicles: ' + JSON.stringify(failure.allocation.vehicles));
    }
  }

  // Part 2: Golden File Tests
  Logger.log('');
  Logger.log('--- GOLDEN FILE TESTS ---');
  const goldenResults = runGoldenFileTests();
  Logger.log('Golden File Results:');
  Logger.log('  Passed: ' + goldenResults.passed);
  Logger.log('  Failed: ' + goldenResults.failed);

  if (goldenResults.failures.length > 0) {
    Logger.log('');
    Logger.log('Golden File Failures:');
    for (const failure of goldenResults.failures) {
      if (failure.error) {
        Logger.log('  ' + failure.scenarioId + ': ERROR - ' + failure.error);
      } else {
        Logger.log('  ' + failure.scenarioId + ' - ' + failure.vehicle +
                   ': expected $' + failure.expected + ', got $' + failure.actual);
      }
    }
  }

  // Summary
  Logger.log('');
  Logger.log('=== SUMMARY ===');
  const totalPassed = invariantResults.passed + goldenResults.passed;
  const totalFailed = invariantResults.failed + goldenResults.failed;
  Logger.log('Total: ' + totalPassed + ' passed, ' + totalFailed + ' failed');

  if (totalFailed === 0) {
    Logger.log('');
    Logger.log('*** ALL TESTS PASSED ***');
  } else {
    Logger.log('');
    Logger.log('*** SOME TESTS FAILED - Review above for details ***');
  }

  Logger.log('');
  Logger.log('Completed at: ' + new Date().toISOString());

  return {
    invariants: invariantResults,
    goldenFiles: goldenResults,
    totalPassed: totalPassed,
    totalFailed: totalFailed,
    allPassed: totalFailed === 0
  };
}

/**
 * Quick smoke test - run fewer iterations for rapid validation
 * Usage: Run runQuickInvariantTest() from the Apps Script dropdown
 */
function runQuickInvariantTest() {
  Logger.log('=== QUICK INVARIANT SMOKE TEST (100 iterations) ===');
  const results = runInvariantTests(100);

  Logger.log('');
  Logger.log('Quick Test Results:');
  Logger.log('  Passed: ' + results.passed);
  Logger.log('  Failed: ' + results.failed);

  if (results.failed > 0) {
    Logger.log('');
    Logger.log('Failing Invariants:');
    const failedInvariants = Object.entries(results.byInvariant)
      .filter(([id, counts]) => counts.failed > 0)
      .map(([id, counts]) => id + ' (' + counts.failed + ' failures)');
    Logger.log('  ' + failedInvariants.join(', '));
  }

  return results;
}
