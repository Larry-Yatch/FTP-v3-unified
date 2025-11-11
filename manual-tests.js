/**
 * Manual Testing Suite for v3.9.0 Refactoring
 * Run each function individually and check the Execution Log
 */

// ============================================
// TEST 3.1: EditModeBanner
// ============================================
function test_3_1_EditModeBanner() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.1: EditModeBanner');
  Logger.log('='.repeat(50));

  const html = EditModeBanner.render('January 1, 2025', 'TEST001', 'tool1');

  Logger.log('✓ HTML length:', html.length);
  Logger.log('✓ Contains "Edit Mode":', html.includes('Edit Mode') ? 'PASS' : 'FAIL');
  Logger.log('✓ Contains "Cancel Edit":', html.includes('Cancel Edit') ? 'PASS' : 'FAIL');
  Logger.log('✓ Contains TEST001:', html.includes('TEST001') ? 'PASS' : 'FAIL');
  Logger.log('✓ Contains edit-mode-banner class:', html.includes('edit-mode-banner') ? 'PASS' : 'FAIL');

  Logger.log('\n✅ TEST 3.1 COMPLETE');
}

// ============================================
// TEST 3.2: DraftService
// ============================================
function test_3_2_DraftService() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.2: DraftService');
  Logger.log('='.repeat(50));

  try {
    // Save draft
    Logger.log('Step 1: Saving draft...');
    const saveResult = DraftService.saveDraft('tool1', 'TEST_MANUAL', 1, {
      name: 'Manual Test User',
      q1: '3',
      q2: '-2'
    });
    Logger.log('✓ Save result:', JSON.stringify(saveResult));
    Logger.log('✓ Save success:', saveResult.success ? 'PASS' : 'FAIL');

    // Retrieve draft
    Logger.log('\nStep 2: Retrieving draft...');
    const draft = DraftService.getDraft('tool1', 'TEST_MANUAL');
    Logger.log('✓ Draft retrieved:', draft ? 'PASS' : 'FAIL');
    Logger.log('✓ Draft name:', draft?.name);
    Logger.log('✓ Draft q1:', draft?.q1);
    Logger.log('✓ Draft has lastPage:', draft?.lastPage === 1 ? 'PASS' : 'FAIL');
    Logger.log('✓ Draft has lastUpdate:', !!draft?.lastUpdate ? 'PASS' : 'FAIL');

    // Test hasDraft
    Logger.log('\nStep 3: Testing hasDraft...');
    const exists = DraftService.hasDraft('tool1', 'TEST_MANUAL');
    Logger.log('✓ hasDraft returns true:', exists ? 'PASS' : 'FAIL');

    // Clean up
    Logger.log('\nStep 4: Cleaning up...');
    DraftService.clearDraft('tool1', 'TEST_MANUAL');
    const stillExists = DraftService.hasDraft('tool1', 'TEST_MANUAL');
    Logger.log('✓ Draft cleared:', !stillExists ? 'PASS' : 'FAIL');

    Logger.log('\n✅ TEST 3.2 COMPLETE');
  } catch (error) {
    Logger.log('❌ TEST 3.2 FAILED:', error.message);
  }
}

// ============================================
// TEST 3.3: ReportBase
// ============================================
function test_3_3_ReportBase() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.3: ReportBase');
  Logger.log('='.repeat(50));

  try {
    // Use a known client ID from production data
    const clientId = '6123LY';

    Logger.log('Testing with client:', clientId);

    const results = ReportBase.getResults(clientId, 'tool1', (resultData, cId) => {
      return {
        clientId: cId,
        data: resultData,
        hasWinner: !!resultData.winner,
        hasScores: !!resultData.scores
      };
    }, false);

    Logger.log('✓ Results found:', !!results ? 'PASS' : 'FAIL');
    Logger.log('✓ Client ID matches:', results?.clientId === clientId ? 'PASS' : 'FAIL');
    Logger.log('✓ Has winner field:', results?.hasWinner ? 'PASS' : 'FAIL');
    Logger.log('✓ Has scores field:', results?.hasScores ? 'PASS' : 'FAIL');
    Logger.log('✓ Winner value:', results?.data?.winner);

    Logger.log('\n✅ TEST 3.3 COMPLETE');
  } catch (error) {
    Logger.log('❌ TEST 3.3 FAILED:', error.message);
  }
}

// ============================================
// TEST 3.4: ErrorHandler
// ============================================
function test_3_4_ErrorHandler() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.4: ErrorHandler');
  Logger.log('='.repeat(50));

  try {
    // Test success response
    Logger.log('Step 1: Testing createSuccessResponse...');
    const success = ErrorHandler.createSuccessResponse({foo: 'bar'}, 'It worked!');
    Logger.log('✓ Success has success:true:', success.success === true ? 'PASS' : 'FAIL');
    Logger.log('✓ Success has data:', !!success.data ? 'PASS' : 'FAIL');
    Logger.log('✓ Success has message:', success.message === 'It worked!' ? 'PASS' : 'FAIL');

    // Test error response
    Logger.log('\nStep 2: Testing createErrorResponse...');
    const error = ErrorHandler.createErrorResponse('Something failed', 'TEST_ERROR');
    Logger.log('✓ Error has success:false:', error.success === false ? 'PASS' : 'FAIL');
    Logger.log('✓ Error has error message:', error.error === 'Something failed' ? 'PASS' : 'FAIL');
    Logger.log('✓ Error has code:', error.code === 'TEST_ERROR' ? 'PASS' : 'FAIL');

    // Test AppError
    Logger.log('\nStep 3: Testing AppError class...');
    try {
      throw new AppError('Test error', 'MANUAL_TEST_CODE', {detail: 'info'});
    } catch (e) {
      Logger.log('✓ AppError caught:', e instanceof AppError ? 'PASS' : 'FAIL');
      Logger.log('✓ AppError has code:', e.code === 'MANUAL_TEST_CODE' ? 'PASS' : 'FAIL');
      Logger.log('✓ AppError has message:', e.message === 'Test error' ? 'PASS' : 'FAIL');
      Logger.log('✓ AppError toJSON works:', typeof e.toJSON === 'function' ? 'PASS' : 'FAIL');
    }

    Logger.log('\n✅ TEST 3.4 COMPLETE');
  } catch (error) {
    Logger.log('❌ TEST 3.4 FAILED:', error.message);
  }
}

// ============================================
// TEST 3.5: Validator
// ============================================
function test_3_5_Validator() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.5: Validator');
  Logger.log('='.repeat(50));

  try {
    // Test requireString - valid
    Logger.log('Step 1: Testing requireString with valid input...');
    const name = Validator.requireString('  John Doe  ', 'Name');
    Logger.log('✓ Trims whitespace:', name === 'John Doe' ? 'PASS' : 'FAIL');

    // Test requireString - invalid
    Logger.log('\nStep 2: Testing requireString with empty string...');
    try {
      Validator.requireString('', 'Name');
      Logger.log('❌ Should have thrown error for empty string: FAIL');
    } catch (e) {
      Logger.log('✓ Rejects empty string:', e instanceof AppError ? 'PASS' : 'FAIL');
    }

    // Test requireNumber
    Logger.log('\nStep 3: Testing requireNumber...');
    const age = Validator.requireNumber(25, 'Age', {min: 0, max: 150});
    Logger.log('✓ Accepts valid number:', age === 25 ? 'PASS' : 'FAIL');

    try {
      Validator.requireNumber(200, 'Age', {min: 0, max: 150});
      Logger.log('❌ Should have rejected number > max: FAIL');
    } catch (e) {
      Logger.log('✓ Rejects number > max:', e instanceof AppError ? 'PASS' : 'FAIL');
    }

    // Test validateScaleValue
    Logger.log('\nStep 4: Testing validateScaleValue...');
    const scaleValue = Validator.validateScaleValue(3, 'Q1');
    Logger.log('✓ Accepts valid scale value:', scaleValue === 3 ? 'PASS' : 'FAIL');

    try {
      Validator.validateScaleValue(0, 'Q1');
      Logger.log('❌ Should have rejected zero: FAIL');
    } catch (e) {
      Logger.log('✓ Rejects zero:', e instanceof AppError ? 'PASS' : 'FAIL');
    }

    Logger.log('\n✅ TEST 3.5 COMPLETE');
  } catch (error) {
    Logger.log('❌ TEST 3.5 FAILED:', error.message);
  }
}

// ============================================
// TEST 3.6: NavigationHelpers
// ============================================
function test_3_6_NavigationHelpers() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.6: NavigationHelpers');
  Logger.log('='.repeat(50));

  try {
    // Test getDashboardPage
    Logger.log('Step 1: Testing getDashboardPage...');
    const dashboard = NavigationHelpers.getDashboardPage('6123LY');
    Logger.log('✓ Returns HTML:', typeof dashboard === 'string' ? 'PASS' : 'FAIL');
    Logger.log('✓ HTML length > 0:', dashboard.length > 0 ? 'PASS' : 'FAIL');
    Logger.log('✓ Contains script tag:', dashboard.includes('<script>') ? 'PASS' : 'FAIL');

    // Test getReportPage
    Logger.log('\nStep 2: Testing getReportPage...');
    const report = NavigationHelpers.getReportPage('6123LY', 'tool1');
    Logger.log('✓ Returns HTML:', typeof report === 'string' ? 'PASS' : 'FAIL');
    Logger.log('✓ HTML length > 0:', report.length > 0 ? 'PASS' : 'FAIL');

    // Test renderErrorPage
    Logger.log('\nStep 3: Testing renderErrorPage...');
    const errorPage = NavigationHelpers.renderErrorPage('Test Error', 'This is a test error message');
    Logger.log('✓ Returns HTML:', typeof errorPage === 'string' ? 'PASS' : 'FAIL');
    Logger.log('✓ Contains error message:', errorPage.includes('Test Error') ? 'PASS' : 'FAIL');

    Logger.log('\n✅ TEST 3.6 COMPLETE');
  } catch (error) {
    Logger.log('❌ TEST 3.6 FAILED:', error.message);
  }
}

// ============================================
// TEST 3.7: PDFGenerator
// ============================================
function test_3_7_PDFGenerator() {
  Logger.log('='.repeat(50));
  Logger.log('TEST 3.7: PDFGenerator');
  Logger.log('='.repeat(50));

  try {
    // Test common methods
    Logger.log('Step 1: Testing getCommonStyles...');
    const styles = PDFGenerator.getCommonStyles();
    Logger.log('✓ Returns string:', typeof styles === 'string' ? 'PASS' : 'FAIL');
    Logger.log('✓ Contains CSS:', styles.includes('body') ? 'PASS' : 'FAIL');
    Logger.log('✓ Uses CONFIG colors:', styles.includes('CONFIG') ? 'PASS' : 'FAIL');

    Logger.log('\nStep 2: Testing buildHeader...');
    const header = PDFGenerator.buildHeader('Test Report', 'Test Student');
    Logger.log('✓ Returns HTML:', typeof header === 'string' ? 'PASS' : 'FAIL');
    Logger.log('✓ Contains student name:', header.includes('Test Student') ? 'PASS' : 'FAIL');
    Logger.log('✓ Contains title:', header.includes('Test Report') ? 'PASS' : 'FAIL');

    Logger.log('\nStep 3: Testing buildFooter...');
    const footer = PDFGenerator.buildFooter();
    Logger.log('✓ Returns HTML:', typeof footer === 'string' ? 'PASS' : 'FAIL');
    Logger.log('✓ Contains footer class:', footer.includes('footer') ? 'PASS' : 'FAIL');

    // Test PDF generation for Tool1
    Logger.log('\nStep 4: Testing generateTool1PDF...');
    const pdfResult = PDFGenerator.generateTool1PDF('6123LY');
    Logger.log('✓ Returns object:', typeof pdfResult === 'object' ? 'PASS' : 'FAIL');
    Logger.log('✓ Has success flag:', 'success' in pdfResult ? 'PASS' : 'FAIL');

    if (pdfResult.success) {
      Logger.log('✓ PDF generated:', 'PASS');
      Logger.log('✓ Has pdf data:', !!pdfResult.pdf ? 'PASS' : 'FAIL');
      Logger.log('✓ Has filename:', !!pdfResult.fileName ? 'PASS' : 'FAIL');
      Logger.log('✓ Filename:', pdfResult.fileName);
    } else {
      Logger.log('⚠️ PDF generation failed:', pdfResult.error);
    }

    Logger.log('\n✅ TEST 3.7 COMPLETE');
  } catch (error) {
    Logger.log('❌ TEST 3.7 FAILED:', error.message);
  }
}

// ============================================
// RUN ALL MANUAL TESTS
// ============================================
function runAllManualTests() {
  Logger.log('\n');
  Logger.log('#'.repeat(60));
  Logger.log('RUNNING ALL MANUAL TESTS FOR v3.9.0 REFACTORING');
  Logger.log('#'.repeat(60));
  Logger.log('\n');

  test_3_1_EditModeBanner();
  Logger.log('\n');

  test_3_2_DraftService();
  Logger.log('\n');

  test_3_3_ReportBase();
  Logger.log('\n');

  test_3_4_ErrorHandler();
  Logger.log('\n');

  test_3_5_Validator();
  Logger.log('\n');

  test_3_6_NavigationHelpers();
  Logger.log('\n');

  test_3_7_PDFGenerator();
  Logger.log('\n');

  Logger.log('#'.repeat(60));
  Logger.log('ALL MANUAL TESTS COMPLETE');
  Logger.log('#'.repeat(60));
}
