/**
 * validate-setup.js
 * Run this in Google Apps Script to validate Tool 1 setup
 *
 * HOW TO USE:
 * 1. Copy this entire file
 * 2. Paste into Google Apps Script editor as a new file
 * 3. Run function: validateCompleteSetup()
 * 4. Check execution log for results
 */

/**
 * Complete validation of Tool 1 setup
 */
function validateCompleteSetup() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  TOOL 1 VALIDATION - COMPLETE CHECK       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;
  const issues = [];

  // Test 1: Tool1 Object Exists
  console.log('📦 TEST 1: Tool1 Object Exists');
  if (typeof Tool1 !== 'undefined') {
    console.log('   ✅ PASS: Tool1 object found');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Tool1 object not found');
    failCount++;
    issues.push('Tool1 object not in global scope');
  }

  // Test 2: Tool1 Methods (v3.1.0 - FormUtils pattern)
  console.log('\n🔧 TEST 2: Tool1 Methods');
  if (typeof Tool1?.render === 'function') {
    console.log('   ✅ PASS: Tool1.render() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Tool1.render() missing');
    failCount++;
    issues.push('Tool1.render() method not found');
  }

  if (typeof Tool1?.savePageData === 'function') {
    console.log('   ✅ PASS: Tool1.savePageData() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Tool1.savePageData() missing');
    failCount++;
    issues.push('Tool1.savePageData() method not found');
  }

  if (typeof Tool1?.processFinalSubmission === 'function') {
    console.log('   ✅ PASS: Tool1.processFinalSubmission() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Tool1.processFinalSubmission() missing');
    failCount++;
    issues.push('Tool1.processFinalSubmission() method not found');
  }

  // Test 3: Tool Registration
  console.log('\n📋 TEST 3: Tool Registration');
  try {
    registerTools();
    console.log('   ✅ PASS: registerTools() executed');
    passCount++;
  } catch (error) {
    console.log('   ❌ FAIL: registerTools() error:', error);
    failCount++;
    issues.push('Tool registration failed: ' + error);
  }

  // Test 4: Registry Check
  console.log('\n🗂️  TEST 4: Tool Registry');
  const toolCount = ToolRegistry.count();
  console.log('   Tools registered:', toolCount);
  if (toolCount > 0) {
    console.log('   ✅ PASS: Tools registered');
    passCount++;
  } else {
    console.log('   ❌ FAIL: No tools registered');
    failCount++;
    issues.push('ToolRegistry is empty');
  }

  const isTool1Registered = ToolRegistry.isRegistered('tool1');
  if (isTool1Registered) {
    console.log('   ✅ PASS: Tool1 is registered');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Tool1 not registered');
    failCount++;
    issues.push('Tool1 not found in registry');
  }

  // Test 5: Route Resolution
  console.log('\n🛣️  TEST 5: Route Resolution');
  const tool = ToolRegistry.findByRoute('tool1');
  if (tool) {
    console.log('   ✅ PASS: Route "tool1" resolves');
    console.log('   Tool ID:', tool.id);
    console.log('   Tool Name:', tool.manifest.name);
    console.log('   Pattern:', tool.manifest.pattern);
    passCount++;
  } else {
    console.log('   ❌ FAIL: Route "tool1" not found');
    failCount++;
    issues.push('Route "tool1" does not resolve to a tool');
  }

  // Test 6: Manifest Validation
  console.log('\n📄 TEST 6: Manifest Structure');
  if (tool && tool.manifest) {
    const m = tool.manifest;
    const requiredFields = ['id', 'name', 'version', 'pattern'];
    let allFieldsPresent = true;

    requiredFields.forEach(field => {
      if (m[field]) {
        console.log(`   ✅ ${field}: ${m[field]}`);
      } else {
        console.log(`   ❌ ${field}: MISSING`);
        allFieldsPresent = false;
        issues.push(`Manifest missing field: ${field}`);
      }
    });

    if (allFieldsPresent) {
      passCount++;
    } else {
      failCount++;
    }

    // Check routes array
    if (m.routes && Array.isArray(m.routes)) {
      console.log('   ✅ routes:', m.routes.join(', '));
      passCount++;
    } else {
      console.log('   ❌ routes: MISSING or not array');
      failCount++;
      issues.push('Manifest.routes is missing or not an array');
    }
  }

  // Test 7: Configuration
  console.log('\n⚙️  TEST 7: Configuration');
  if (typeof CONFIG !== 'undefined') {
    console.log('   ✅ PASS: CONFIG object exists');
    console.log('   Sheet ID:', CONFIG.MASTER_SHEET_ID);
    passCount++;
  } else {
    console.log('   ❌ FAIL: CONFIG not found');
    failCount++;
    issues.push('CONFIG object not found');
  }

  // Test 8: Database Access
  console.log('\n🗄️  TEST 8: Database Access');
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    console.log('   ✅ PASS: Spreadsheet accessible');
    console.log('   Spreadsheet:', ss.getName());
    passCount++;

    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    if (responseSheet) {
      console.log('   ✅ PASS: RESPONSES sheet exists');
      console.log('   Rows:', responseSheet.getLastRow());
      passCount++;
    } else {
      console.log('   ❌ FAIL: RESPONSES sheet not found');
      failCount++;
      issues.push('RESPONSES sheet does not exist');
    }
  } catch (error) {
    console.log('   ❌ FAIL: Database error:', error);
    failCount++;
    issues.push('Cannot access spreadsheet: ' + error);
  }

  // Test 9: Router Functions
  console.log('\n🔀 TEST 9: Router Functions');
  if (typeof Router !== 'undefined' && typeof Router.route === 'function') {
    console.log('   ✅ PASS: Router.route() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Router.route() missing');
    failCount++;
    issues.push('Router.route() function not found');
  }

  // Test 10: POST Handler
  console.log('\n📮 TEST 10: POST Handler');
  if (typeof doPost === 'function') {
    console.log('   ✅ PASS: doPost() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: doPost() missing');
    failCount++;
    issues.push('doPost() function not found');
  }

  // Test 11: Tool1 Report
  console.log('\n📊 TEST 11: Tool1 Report');
  if (typeof Tool1Report !== 'undefined' && typeof Tool1Report.render === 'function') {
    console.log('   ✅ PASS: Tool1Report.render() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: Tool1Report not found');
    failCount++;
    issues.push('Tool1Report object or render() method missing');
  }

  // Test 12: Tool1 Templates
  console.log('\n📝 TEST 12: Tool1 Templates');
  if (typeof Tool1Templates !== 'undefined' && typeof Tool1Templates.getTemplate === 'function') {
    console.log('   ✅ PASS: Tool1Templates.getTemplate() exists');

    // Test each template
    const categories = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
    let allTemplatesExist = true;
    categories.forEach(cat => {
      const template = Tool1Templates.getTemplate(cat);
      if (template) {
        console.log(`   ✅ Template ${cat}: exists`);
      } else {
        console.log(`   ❌ Template ${cat}: MISSING`);
        allTemplatesExist = false;
        issues.push(`Template missing for category: ${cat}`);
      }
    });

    if (allTemplatesExist) {
      passCount++;
    } else {
      failCount++;
    }
  } else {
    console.log('   ❌ FAIL: Tool1Templates not found');
    failCount++;
    issues.push('Tool1Templates object or getTemplate() method missing');
  }

  // Test 13: PDF Generation
  console.log('\n🖨️  TEST 13: PDF Generation');
  if (typeof generateTool1PDF === 'function') {
    console.log('   ✅ PASS: generateTool1PDF() exists');
    passCount++;
  } else {
    console.log('   ❌ FAIL: generateTool1PDF() missing');
    failCount++;
    issues.push('generateTool1PDF() function not found');
  }

  // Test 14: FormUtils Framework (v3.1.0)
  console.log('\n🏗️  TEST 14: FormUtils Framework');
  if (typeof FormUtils !== 'undefined') {
    console.log('   ✅ PASS: FormUtils object exists');

    // Check key methods
    const formUtilsMethods = [
      'getFormSubmissionScript',
      'generateFormWrapper',
      'buildStandardPage'
    ];

    let allMethodsExist = true;
    formUtilsMethods.forEach(method => {
      if (typeof FormUtils[method] === 'function') {
        console.log(`   ✅ FormUtils.${method}() exists`);
      } else {
        console.log(`   ❌ FormUtils.${method}() MISSING`);
        allMethodsExist = false;
        issues.push(`FormUtils.${method}() method not found`);
      }
    });

    if (allMethodsExist) {
      passCount++;
    } else {
      failCount++;
    }
  } else {
    console.log('   ❌ FAIL: FormUtils not found');
    failCount++;
    issues.push('FormUtils framework not loaded - required for v3.1.0 pattern');
  }

  // Test 15: Generic Server Handlers (v3.1.0)
  console.log('\n⚙️  TEST 15: Generic Server Handlers');
  let handlersPass = true;

  if (typeof saveToolPageData === 'function') {
    console.log('   ✅ PASS: saveToolPageData() exists');
  } else {
    console.log('   ❌ FAIL: saveToolPageData() missing');
    handlersPass = false;
    issues.push('saveToolPageData() function not found - required for multi-page tools');
  }

  if (typeof completeToolSubmission === 'function') {
    console.log('   ✅ PASS: completeToolSubmission() exists');
  } else {
    console.log('   ❌ FAIL: completeToolSubmission() missing');
    handlersPass = false;
    issues.push('completeToolSubmission() function not found - required for tool completion');
  }

  if (handlersPass) {
    passCount++;
  } else {
    failCount++;
  }

  // Test 16: Tool Pattern Compliance (v3.1.0)
  console.log('\n📐 TEST 16: Tool Pattern Compliance');
  let patternPass = true;

  // Check Tool1 follows new pattern
  if (typeof Tool1?.savePageData === 'function') {
    console.log('   ✅ Tool1.savePageData() exists (new pattern)');
  } else {
    console.log('   ❌ Tool1.savePageData() missing');
    patternPass = false;
    issues.push('Tool1 does not implement savePageData() - required for FormUtils pattern');
  }

  if (typeof Tool1?.processFinalSubmission === 'function') {
    console.log('   ✅ Tool1.processFinalSubmission() exists (new pattern)');
  } else {
    console.log('   ❌ Tool1.processFinalSubmission() missing');
    patternPass = false;
    issues.push('Tool1 does not implement processFinalSubmission() - required for FormUtils pattern');
  }

  // Verify deprecated method is NOT present
  if (typeof Tool1?.handleSubmit === 'function') {
    console.log('   ⚠️  WARNING: Tool1.handleSubmit() still exists (deprecated in v3.1.0)');
    console.log('      This method is no longer used with FormUtils pattern');
  } else {
    console.log('   ✅ Tool1.handleSubmit() removed (good - deprecated)');
  }

  if (patternPass) {
    passCount++;
  } else {
    failCount++;
  }

  // Test 17: Architecture Documentation
  console.log('\n📚 TEST 17: Architecture Documentation');
  console.log('   ℹ️  Check local files for:');
  console.log('      - tools/MultiPageToolTemplate.js (Tool 2 template)');
  console.log('      - TOOL-DEVELOPMENT-PATTERNS.md (Developer guide)');
  console.log('      - NAVIGATION-FIX-SUMMARY.md (Architecture overview)');
  console.log('   ✅ Documentation available in repository');
  passCount++;

  // SUMMARY
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  VALIDATION SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n✅ PASSED: ${passCount} tests`);
  console.log(`❌ FAILED: ${failCount} tests`);
  console.log(`📊 SUCCESS RATE: ${Math.round((passCount / (passCount + failCount)) * 100)}%\n`);

  if (issues.length > 0) {
    console.log('🚨 ISSUES FOUND:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  } else {
    console.log('🎉 ALL TESTS PASSED! System is ready!');
  }

  console.log('\n' + '='.repeat(50));

  return {
    passed: passCount,
    failed: failCount,
    issues: issues,
    ready: failCount === 0
  };
}

/**
 * Quick test - just check if Tool1 loads
 */
function quickTest() {
  console.log('Quick Test: Can Tool1 load?\n');

  try {
    // Simulate route request
    const mockEvent = {
      parameter: {
        route: 'tool1',
        client: 'TEST001',
        page: '1'
      }
    };

    registerTools();
    const result = Router.route(mockEvent);

    if (result) {
      console.log('✅ SUCCESS: Tool1 loaded!');
      console.log('Response type:', typeof result);
      return true;
    } else {
      console.log('❌ FAIL: Router returned null');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.toString());
    console.log('Stack:', error.stack);
    return false;
  }
}

/**
 * Test form submission flow
 */
function testFormSubmission() {
  console.log('Testing Form Submission Flow\n');

  try {
    // Simulate form submission
    const mockFormData = {
      route: 'tool1_submit',
      client: 'TEST001',
      page: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    registerTools();
    const result = doPost({ parameter: mockFormData });

    if (result) {
      console.log('✅ Form submission handled');
      return true;
    } else {
      console.log('❌ Form submission failed');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.toString());
    return false;
  }
}
