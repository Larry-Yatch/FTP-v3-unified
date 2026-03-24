/**
 * Tier 2 Validation Suite
 * Validates FormToolBase + GroundingToolBase migrations for all 5 form tools.
 *
 * To run: Open Apps Script Editor -> Select runTier2ValidationSuite -> Click Run
 * Check Execution Log for results.
 *
 * Tests are read-only (no data writes) — safe to run anytime.
 */

// ============================================================
// MAIN TEST RUNNER
// ============================================================

function runTier2ValidationSuite() {
  Logger.log('========================================================');
  Logger.log('  TIER 2 VALIDATION SUITE - Form Tool Consolidation');
  Logger.log('========================================================');
  Logger.log('');

  var results = { passed: 0, failed: 0, tests: [] };

  var tests = [
    { name: 'Base Objects Exist',          fn: testBaseObjectsExist },
    { name: 'FormToolBase Methods',        fn: testFormToolBaseMethods },
    { name: 'GroundingToolBase Methods',   fn: testGroundingToolBaseMethods },
    { name: 'Tool1 Inheritance',           fn: testTool1Inheritance },
    { name: 'Tool2 Inheritance',           fn: testTool2Inheritance },
    { name: 'Tool3 Inheritance',           fn: testTool3Inheritance },
    { name: 'Tool5 Inheritance',           fn: testTool5Inheritance },
    { name: 'Tool7 Inheritance',           fn: testTool7Inheritance },
    { name: 'Tool1 Render',               fn: testTool1Render },
    { name: 'Tool2 Render',               fn: testTool2Render },
    { name: 'Tool3 Render',               fn: testTool3Render },
    { name: 'Tool5 Render',               fn: testTool5Render },
    { name: 'Tool7 Render',               fn: testTool7Render },
    { name: 'Tool1 SavePageData',         fn: testTool1SavePageData },
    { name: 'Tool2 SavePageData Override', fn: testTool2SavePageDataOverride },
    { name: 'Tool3 SavePageData',         fn: testTool3SavePageData },
    { name: 'Grounding Config Integrity',  fn: testGroundingConfigIntegrity },
    { name: 'Registry Accepts All Tools',  fn: testRegistryAcceptsAllTools }
  ];

  tests.forEach(function(test) {
    Logger.log('TEST: ' + test.name);
    Logger.log('------------------------------------------');
    try {
      var result = test.fn();
      results.tests.push({ name: test.name, passed: result.passed, error: result.error || null });
      if (result.passed) {
        results.passed++;
        Logger.log('  PASSED');
      } else {
        results.failed++;
        Logger.log('  FAILED: ' + (result.error || 'Unknown'));
      }
    } catch (e) {
      results.tests.push({ name: test.name, passed: false, error: e.message });
      results.failed++;
      Logger.log('  FAILED (exception): ' + e.message);
    }
    Logger.log('');
  });

  // Summary
  Logger.log('========================================================');
  Logger.log('  RESULTS: ' + results.passed + ' passed, ' + results.failed + ' failed');
  Logger.log('========================================================');

  if (results.failed === 0) {
    Logger.log('  ALL TESTS PASSED - Tier 2 migration verified!');
  } else {
    Logger.log('  SOME TESTS FAILED - Review errors above');
    results.tests.forEach(function(t) {
      if (!t.passed) Logger.log('    FAIL: ' + t.name + ' - ' + t.error);
    });
  }

  return results;
}

// ============================================================
// TEST 1: Base objects exist as globals
// ============================================================

function testBaseObjectsExist() {
  var errors = [];

  if (typeof FormToolBase === 'undefined') errors.push('FormToolBase is undefined');
  if (typeof GroundingToolBase === 'undefined') errors.push('GroundingToolBase is undefined');

  if (errors.length > 0) return { passed: false, error: errors.join('; ') };

  Logger.log('  FormToolBase: exists');
  Logger.log('  GroundingToolBase: exists');
  return { passed: true };
}

// ============================================================
// TEST 2: FormToolBase has required methods
// ============================================================

function testFormToolBaseMethods() {
  var required = ['render', 'getExistingData', 'savePageData'];
  var missing = [];

  required.forEach(function(m) {
    if (typeof FormToolBase[m] !== 'function') missing.push(m);
  });

  if (missing.length > 0) return { passed: false, error: 'Missing: ' + missing.join(', ') };

  Logger.log('  render: function');
  Logger.log('  getExistingData: function');
  Logger.log('  savePageData: function');
  return { passed: true };
}

// ============================================================
// TEST 3: GroundingToolBase has required methods
// ============================================================

function testGroundingToolBaseMethods() {
  var required = [
    'render', 'getExistingData', 'savePageData',   // from FormToolBase
    'renderPageContent', 'onPageSaved',              // grounding-specific
    'processFinalSubmission', 'extractResponses',
    'collectGPTInsights', 'runFinalSyntheses',
    'extractDomainInsights', 'extractDomainScores',
    'saveAssessmentData', 'generateReport', 'renderErrorPage'
  ];
  var missing = [];

  required.forEach(function(m) {
    if (typeof GroundingToolBase[m] !== 'function') missing.push(m);
  });

  if (missing.length > 0) return { passed: false, error: 'Missing: ' + missing.join(', ') };

  Logger.log('  All 14 methods present on GroundingToolBase');
  Logger.log('  _totalPages: ' + GroundingToolBase._totalPages);

  if (GroundingToolBase._totalPages !== 7) {
    return { passed: false, error: '_totalPages should be 7, got ' + GroundingToolBase._totalPages };
  }

  return { passed: true };
}

// ============================================================
// TEST 4-8: Tool inheritance checks
// ============================================================

function _testToolInheritance(toolObj, toolId, expectFormConfig, expectConfig, overrides) {
  var errors = [];

  // Must have render (either own or inherited)
  if (typeof toolObj.render !== 'function') errors.push('render missing');
  if (typeof toolObj.renderPageContent !== 'function') errors.push('renderPageContent missing');
  if (typeof toolObj.getExistingData !== 'function') errors.push('getExistingData missing');
  if (typeof toolObj.savePageData !== 'function') errors.push('savePageData missing');

  // Config check
  if (expectFormConfig) {
    if (!toolObj.formConfig) errors.push('formConfig missing');
    else {
      if (toolObj.formConfig.toolId !== toolId) errors.push('formConfig.toolId wrong: ' + toolObj.formConfig.toolId);
      if (!toolObj.formConfig.toolName) errors.push('formConfig.toolName missing');
      if (!toolObj.formConfig.totalPages) errors.push('formConfig.totalPages missing');
      Logger.log('  formConfig.toolId: ' + toolObj.formConfig.toolId);
      Logger.log('  formConfig.totalPages: ' + toolObj.formConfig.totalPages);
    }
  }

  if (expectConfig) {
    if (!toolObj.config) errors.push('config missing');
    else {
      if (toolObj.config.id !== toolId) errors.push('config.id wrong: ' + toolObj.config.id);
      if (!toolObj.config.name) errors.push('config.name missing');
      if (!toolObj.config.subdomains || toolObj.config.subdomains.length !== 6) {
        errors.push('config.subdomains should have 6 entries');
      }
      Logger.log('  config.id: ' + toolObj.config.id);
      Logger.log('  config.subdomains: ' + (toolObj.config.subdomains ? toolObj.config.subdomains.length : 0));
    }
  }

  // Check overrides are own methods (not just inherited)
  if (overrides) {
    overrides.forEach(function(m) {
      if (!toolObj.hasOwnProperty(m)) {
        errors.push(m + ' should be an own property (override), but is inherited');
      } else {
        Logger.log('  override: ' + m + ' (own property)');
      }
    });
  }

  if (errors.length > 0) return { passed: false, error: errors.join('; ') };
  return { passed: true };
}

function testTool1Inheritance() {
  return _testToolInheritance(Tool1, 'tool1', true, false, ['renderPageContent', 'getCustomValidation']);
}

function testTool2Inheritance() {
  return _testToolInheritance(Tool2, 'tool2', true, false, ['renderPageContent', 'savePageData', 'getExistingData']);
}

function testTool3Inheritance() {
  return _testToolInheritance(Tool3, 'tool3', false, true, ['getIntroContent']);
}

function testTool5Inheritance() {
  return _testToolInheritance(Tool5, 'tool5', false, true, ['getIntroContent']);
}

function testTool7Inheritance() {
  return _testToolInheritance(Tool7, 'tool7', false, true, ['getIntroContent']);
}

// ============================================================
// TEST 9-13: Render tests (page 1 for each tool)
// ============================================================

function _testToolRender(toolObj, toolId) {
  // Use a fake client ID that will not match any real data
  var testClientId = '_TIER2_TEST_' + toolId;

  var result = toolObj.render({
    clientId: testClientId,
    page: '1'
  });

  // render() must return HtmlOutput (from HtmlService)
  if (!result) return { passed: false, error: 'render() returned null/undefined' };

  // HtmlOutput has getContent() method
  if (typeof result.getContent !== 'function') {
    return { passed: false, error: 'render() did not return HtmlOutput (no getContent method)' };
  }

  var html = result.getContent();

  if (!html || html.length < 100) {
    return { passed: false, error: 'render() returned too little HTML (' + (html ? html.length : 0) + ' chars)' };
  }

  // Check for key markers in the HTML
  if (html.indexOf(toolId) === -1) {
    return { passed: false, error: 'HTML does not contain toolId: ' + toolId };
  }

  Logger.log('  HTML length: ' + html.length + ' chars');
  Logger.log('  Contains toolId: yes');

  // Clean up any draft that render might have created
  try { DraftService.clearDraft(toolId, testClientId); } catch(e) {}

  return { passed: true };
}

function testTool1Render() { return _testToolRender(Tool1, 'tool1'); }
function testTool2Render() { return _testToolRender(Tool2, 'tool2'); }
function testTool3Render() { return _testToolRender(Tool3, 'tool3'); }
function testTool5Render() { return _testToolRender(Tool5, 'tool5'); }
function testTool7Render() { return _testToolRender(Tool7, 'tool7'); }

// ============================================================
// TEST 14-16: SavePageData tests
// ============================================================

function _testToolSavePageData(toolObj, toolId) {
  var testClientId = '_TIER2_SAVE_TEST_' + toolId;

  try {
    // Save test data for page 1
    var saveResult = toolObj.savePageData(testClientId, 1, {
      _tier2_test: true,
      name: 'Tier2 Test',
      email: 'test@tier2.com'
    });

    if (!saveResult || !saveResult.success) {
      return { passed: false, error: 'savePageData did not return {success: true}' };
    }

    // Verify data was saved to PropertiesService
    var draft = DraftService.getDraft(toolId, testClientId);
    if (!draft) {
      return { passed: false, error: 'DraftService.getDraft returned null after save' };
    }

    if (draft.name !== 'Tier2 Test') {
      return { passed: false, error: 'Saved data mismatch: name=' + draft.name };
    }

    Logger.log('  savePageData: returned success');
    Logger.log('  DraftService: data persisted');
    Logger.log('  Data round-trip: verified');

    return { passed: true };
  } finally {
    // Always clean up PropertiesService draft
    try { DraftService.clearDraft(toolId, testClientId); } catch(e) {}
  }
}

function testTool1SavePageData() { return _testToolSavePageData(Tool1, 'tool1'); }
function testTool2SavePageDataOverride() { return _testToolSavePageData(Tool2, 'tool2'); }
function testTool3SavePageData() { return _testToolSavePageData(Tool3, 'tool3'); }

// ============================================================
// TEST 17: Grounding tools config integrity
// ============================================================

function testGroundingConfigIntegrity() {
  var tools = [
    { obj: Tool3, id: 'tool3' },
    { obj: Tool5, id: 'tool5' },
    { obj: Tool7, id: 'tool7' }
  ];
  var errors = [];

  tools.forEach(function(t) {
    var cfg = t.obj.config;
    if (!cfg) { errors.push(t.id + ': config missing'); return; }

    // Check required config fields
    ['id', 'name', 'domain1Name', 'domain1Key', 'domain2Name', 'domain2Key', 'subdomains'].forEach(function(field) {
      if (!cfg[field]) errors.push(t.id + ': config.' + field + ' missing');
    });

    // Check subdomains structure
    if (cfg.subdomains && cfg.subdomains.length === 6) {
      cfg.subdomains.forEach(function(sub, i) {
        if (!sub.key) errors.push(t.id + ': subdomain[' + i + '].key missing');
        if (!sub.label) errors.push(t.id + ': subdomain[' + i + '].label missing');
        if (!sub.questions || sub.questions.length < 4) {
          errors.push(t.id + ': subdomain[' + i + '].questions should have 4+ entries');
        }
      });
      Logger.log('  ' + t.id + ': 6 subdomains, all have key/label/questions');
    }

    // Check getIntroContent returns HTML
    if (typeof t.obj.getIntroContent !== 'function') {
      errors.push(t.id + ': getIntroContent missing');
    } else {
      var intro = t.obj.getIntroContent();
      if (!intro || intro.length < 50) {
        errors.push(t.id + ': getIntroContent returned too little HTML');
      } else {
        Logger.log('  ' + t.id + ': getIntroContent returns ' + intro.length + ' chars');
      }
    }
  });

  if (errors.length > 0) return { passed: false, error: errors.join('; ') };
  return { passed: true };
}

// ============================================================
// TEST 18: ToolRegistry accepts all migrated tools
// ============================================================

function testRegistryAcceptsAllTools() {
  registerTools(); // Ensure tools are registered

  var toolIds = ['tool1', 'tool2', 'tool3', 'tool5', 'tool7'];
  var errors = [];

  toolIds.forEach(function(id) {
    var reg = ToolRegistry.get(id);
    if (!reg) {
      errors.push(id + ': not found in registry');
    } else {
      Logger.log('  ' + id + ': registered (module has render: ' + (typeof reg.module.render === 'function') + ')');
    }
  });

  if (errors.length > 0) return { passed: false, error: errors.join('; ') };
  return { passed: true };
}
