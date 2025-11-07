/**
 * Refactoring Validation Tests
 * Tests to verify that the refactoring didn't break any functionality
 */

function runRefactoringValidationTests() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  Logger.log('=== Starting Refactoring Validation Tests ===');

  // Test 1: Verify shared utilities exist
  try {
    if (typeof EditModeBanner === 'undefined') throw new Error('EditModeBanner not found');
    if (typeof ReportBase === 'undefined') throw new Error('ReportBase not found');
    if (typeof DraftService === 'undefined') throw new Error('DraftService not found');
    if (typeof ErrorHandler === 'undefined') throw new Error('ErrorHandler not found');
    if (typeof Validator === 'undefined') throw new Error('Validator not found');
    results.passed.push('✓ All shared utilities are defined');
  } catch (error) {
    results.failed.push('✗ Shared utilities check: ' + error.message);
  }

  // Test 2: Verify Config expansions
  try {
    if (!CONFIG.TOOLS) throw new Error('CONFIG.TOOLS not found');
    if (!CONFIG.COLUMN_INDEXES) throw new Error('CONFIG.COLUMN_INDEXES not found');
    if (!CONFIG.COLUMN_NAMES) throw new Error('CONFIG.COLUMN_NAMES not found');
    if (!CONFIG.TIMING) throw new Error('CONFIG.TIMING not found');
    if (!CONFIG.UI) throw new Error('CONFIG.UI not found');
    results.passed.push('✓ Config.js expanded successfully');
  } catch (error) {
    results.failed.push('✗ Config expansion check: ' + error.message);
  }

  // Test 3: Test EditModeBanner.render()
  try {
    const html = EditModeBanner.render('Jan 1, 2025', 'TEST123', 'tool1');
    if (typeof html !== 'string') throw new Error('EditModeBanner.render did not return string');
    if (html.indexOf('edit-mode-banner') === -1) throw new Error('Missing edit-mode-banner class');
    if (html.indexOf('TEST123') === -1) throw new Error('Missing clientId in output');
    results.passed.push('✓ EditModeBanner.render() works');
  } catch (error) {
    results.failed.push('✗ EditModeBanner.render(): ' + error.message);
  }

  // Test 4: Test DraftService key generation
  try {
    const key = DraftService.getDraftKey('tool1', 'TEST123');
    if (key !== 'tool1_draft_TEST123') throw new Error('Unexpected draft key: ' + key);
    results.passed.push('✓ DraftService.getDraftKey() works');
  } catch (error) {
    results.failed.push('✗ DraftService.getDraftKey(): ' + error.message);
  }

  // Test 5: Test Validator.requireString()
  try {
    const result = Validator.requireString('  test  ', 'field');
    if (result !== 'test') throw new Error('Expected "test", got: ' + result);

    try {
      Validator.requireString('', 'field');
      throw new Error('Should have thrown AppError for empty string');
    } catch (e) {
      if (!(e instanceof AppError)) throw new Error('Expected AppError, got: ' + e.constructor.name);
    }

    results.passed.push('✓ Validator.requireString() works');
  } catch (error) {
    results.failed.push('✗ Validator.requireString(): ' + error.message);
  }

  // Test 6: Test ErrorHandler.createErrorResponse()
  try {
    const errorResp = ErrorHandler.createErrorResponse('Test error', 'TEST_CODE', { detail: 'info' });
    if (errorResp.success !== false) throw new Error('Expected success: false');
    if (errorResp.error !== 'Test error') throw new Error('Error message mismatch');
    if (errorResp.code !== 'TEST_CODE') throw new Error('Error code mismatch');
    results.passed.push('✓ ErrorHandler.createErrorResponse() works');
  } catch (error) {
    results.failed.push('✗ ErrorHandler.createErrorResponse(): ' + error.message);
  }

  // Test 7: Test ErrorHandler.createSuccessResponse()
  try {
    const successResp = ErrorHandler.createSuccessResponse({ value: 123 }, 'Success!');
    if (successResp.success !== true) throw new Error('Expected success: true');
    if (successResp.data.value !== 123) throw new Error('Data mismatch');
    if (successResp.message !== 'Success!') throw new Error('Message mismatch');
    results.passed.push('✓ ErrorHandler.createSuccessResponse() works');
  } catch (error) {
    results.failed.push('✗ ErrorHandler.createSuccessResponse(): ' + error.message);
  }

  // Test 8: Test Tool1 still has render method
  try {
    if (typeof Tool1 === 'undefined') throw new Error('Tool1 not found');
    if (typeof Tool1.render !== 'function') throw new Error('Tool1.render is not a function');
    if (typeof Tool1.savePageData !== 'function') throw new Error('Tool1.savePageData is not a function');
    results.passed.push('✓ Tool1 interface intact');
  } catch (error) {
    results.failed.push('✗ Tool1 interface check: ' + error.message);
  }

  // Test 9: Test Tool2 still has render method
  try {
    if (typeof Tool2 === 'undefined') throw new Error('Tool2 not found');
    if (typeof Tool2.render !== 'function') throw new Error('Tool2.render is not a function');
    if (typeof Tool2.savePageData !== 'function') throw new Error('Tool2.savePageData is not a function');
    results.passed.push('✓ Tool2 interface intact');
  } catch (error) {
    results.failed.push('✗ Tool2 interface check: ' + error.message);
  }

  // Test 10: Test Tool1Report methods
  try {
    if (typeof Tool1Report === 'undefined') throw new Error('Tool1Report not found');
    if (typeof Tool1Report.getResults !== 'function') throw new Error('Tool1Report.getResults is not a function');
    results.passed.push('✓ Tool1Report interface intact');
  } catch (error) {
    results.failed.push('✗ Tool1Report interface check: ' + error.message);
  }

  // Test 11: Test Tool2Report methods
  try {
    if (typeof Tool2Report === 'undefined') throw new Error('Tool2Report not found');
    if (typeof Tool2Report.getResults !== 'function') throw new Error('Tool2Report.getResults is not a function');
    results.passed.push('✓ Tool2Report interface intact');
  } catch (error) {
    results.failed.push('✗ Tool2Report interface check: ' + error.message);
  }

  // Test 12: Verify ReportBase methods exist
  try {
    if (typeof ReportBase.getSheet !== 'function') throw new Error('ReportBase.getSheet not found');
    if (typeof ReportBase.getHeaders !== 'function') throw new Error('ReportBase.getHeaders not found');
    if (typeof ReportBase.findLatestRow !== 'function') throw new Error('ReportBase.findLatestRow not found');
    if (typeof ReportBase.getResults !== 'function') throw new Error('ReportBase.getResults not found');
    results.passed.push('✓ ReportBase methods exist');
  } catch (error) {
    results.failed.push('✗ ReportBase methods: ' + error.message);
  }

  // Test 13: Verify DraftService methods exist
  try {
    if (typeof DraftService.saveDraft !== 'function') throw new Error('DraftService.saveDraft not found');
    if (typeof DraftService.getDraft !== 'function') throw new Error('DraftService.getDraft not found');
    if (typeof DraftService.clearDraft !== 'function') throw new Error('DraftService.clearDraft not found');
    if (typeof DraftService.hasDraft !== 'function') throw new Error('DraftService.hasDraft not found');
    if (typeof DraftService.mergeWithEditData !== 'function') throw new Error('DraftService.mergeWithEditData not found');
    results.passed.push('✓ DraftService methods exist');
  } catch (error) {
    results.failed.push('✗ DraftService methods: ' + error.message);
  }

  // Print results
  Logger.log('\n=== Test Results ===');
  Logger.log(`Passed: ${results.passed.length}`);
  Logger.log(`Failed: ${results.failed.length}`);
  Logger.log(`Warnings: ${results.warnings.length}`);

  Logger.log('\n=== Passed Tests ===');
  results.passed.forEach(msg => Logger.log(msg));

  if (results.failed.length > 0) {
    Logger.log('\n=== Failed Tests ===');
    results.failed.forEach(msg => Logger.log(msg));
  }

  if (results.warnings.length > 0) {
    Logger.log('\n=== Warnings ===');
    results.warnings.forEach(msg => Logger.log(msg));
  }

  const allPassed = results.failed.length === 0;
  Logger.log('\n=== Final Status ===');
  Logger.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

  return {
    success: allPassed,
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    details: results
  };
}

/**
 * Quick smoke test for production
 */
function quickSmokeTest() {
  Logger.log('Running quick smoke test...');

  try {
    // Test critical paths
    const tests = [
      typeof EditModeBanner !== 'undefined',
      typeof ReportBase !== 'undefined',
      typeof DraftService !== 'undefined',
      typeof ErrorHandler !== 'undefined',
      typeof Validator !== 'undefined',
      typeof Tool1 !== 'undefined',
      typeof Tool2 !== 'undefined',
      CONFIG.TOOLS !== undefined,
      CONFIG.COLUMN_INDEXES !== undefined
    ];

    const allPassed = tests.every(t => t === true);

    if (allPassed) {
      Logger.log('✅ Quick smoke test PASSED');
      return { success: true };
    } else {
      Logger.log('❌ Quick smoke test FAILED');
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ Quick smoke test ERROR: ' + error);
    return { success: false, error: error.toString() };
  }
}
