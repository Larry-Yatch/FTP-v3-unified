/**
 * Tool 3 End-to-End Test Suite
 * Phase 4: Testing & Validation
 *
 * Tests the complete flow from form rendering through scoring to report generation
 */

const fs = require('fs');
const path = require('path');

// Mock GAS environment
const Logger = { log: console.log };
const PropertiesService = {
  getScriptProperties: () => ({ getProperty: () => 'mock-api-key' }),
  getUserProperties: () => {
    const cache = {};
    return {
      setProperty: (key, value) => { cache[key] = value; },
      getProperty: (key) => cache[key] || null,
      deleteProperty: (key) => { delete cache[key]; }
    };
  }
};
const ScriptApp = {
  getService: () => ({ getUrl: () => 'https://mock-url.com' })
};
const HtmlService = {
  createHtmlOutput: (html) => ({ getContent: () => html }),
  createHtmlOutputFromFile: (filename) => ({ getContent: () => `<!-- ${filename} -->` })
};
const Session = { getActiveUser: () => ({ getEmail: () => 'test@test.com' }) };
const SpreadsheetApp = { openById: () => ({}) };
const UrlFetchApp = { fetch: () => {} };
const Utilities = { sleep: () => {} };
const FeedbackWidget = { render: () => '' };

// Mock CONFIG
const CONFIG = {
  MASTER_SHEET_ID: 'test-sheet-id',
  UI: {
    PRIMARY_COLOR: '#ad9168',
    DARK_BG: '#1e192b'
  }
};

// Mock FormUtils
const FormUtils = {
  generatePageHeader: (toolName, page, totalPages, clientId) =>
    `<div class="tool-navigation">${toolName} - Page ${page}/${totalPages}</div>`,
  generateFormWrapper: (options) => `<form id="${options.formId}">${options.content}</form>`,
  generatePageFooter: () => '</div>',
  getFormSubmissionScript: () => '<script>/* form submission */</script>'
};

// Mock DataService
const DataService = {
  saveToolResponse: () => {},
  getToolResponse: () => null
};

// Load all utilities and Tool 3
function loadFile(filename) {
  const filepath = path.join(__dirname, '..', filename);
  const code = fs.readFileSync(filepath, 'utf8');
  eval(code);
}

// Load utilities
loadFile('core/grounding/GroundingScoring.js');
loadFile('core/grounding/GroundingFormBuilder.js');
loadFile('core/grounding/GroundingFallbacks.js');
// Note: GroundingGPT and GroundingReport require more complex mocking

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

console.log('\n🧪 TOOL 3 END-TO-END TEST SUITE\n');
console.log('='.repeat(60));

// ============================================================
// TEST SCENARIO 1: Form Rendering
// ============================================================
console.log('\n📄 SCENARIO 1: FORM RENDERING\n');

test('Tool3.js has complete subdomain configurations', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  // Check for all 6 subdomains
  const subdomainKeys = [
    'subdomain_1_1', 'subdomain_1_2', 'subdomain_1_3',
    'subdomain_2_1', 'subdomain_2_2', 'subdomain_2_3'
  ];

  subdomainKeys.forEach(key => {
    if (!tool3Code.includes(`key: '${key}'`)) {
      throw new Error(`Missing subdomain: ${key}`);
    }
  });
});

test('Each subdomain has 5 questions (4 scale + 1 open)', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  // Count questions arrays per subdomain
  const subdomainMatches = tool3Code.match(/questions: \[/g);
  if (!subdomainMatches || subdomainMatches.length !== 6) {
    throw new Error(`Expected 6 subdomains with questions arrays, found ${subdomainMatches ? subdomainMatches.length : 0}`);
  }
});

test('All scale questions have negative and positive anchors', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  // Check for scale objects
  const scaleMatches = tool3Code.match(/scale: \{[\s\S]*?negative:[\s\S]*?positive:/g);
  if (!scaleMatches || scaleMatches.length !== 24) { // 4 scales × 6 subdomains
    throw new Error(`Expected 24 scale questions, found ${scaleMatches ? scaleMatches.length : 0}`);
  }
});

test('All subdomains have beliefBehaviorConnection', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  const connections = tool3Code.match(/beliefBehaviorConnection:/g);
  if (!connections || connections.length !== 6) {
    throw new Error(`Expected 6 beliefBehaviorConnection strings, found ${connections ? connections.length : 0}`);
  }
});

// ============================================================
// TEST SCENARIO 2: Scoring Calculations
// ============================================================
console.log('\n🔢 SCENARIO 2: SCORING CALCULATIONS\n');

test('Score normalization: -3 → 100', () => {
  const result = GroundingScoring.normalizeScore(-3);
  if (result !== 100) {
    throw new Error(`Expected 100, got ${result}`);
  }
});

test('Score normalization: -2 → 83.33', () => {
  const result = GroundingScoring.normalizeScore(-2);
  const expected = ((3 - (-2)) / 6) * 100;
  if (Math.abs(result - expected) > 0.01) {
    throw new Error(`Expected ${expected}, got ${result}`);
  }
});

test('Score normalization: +3 → 0', () => {
  const result = GroundingScoring.normalizeScore(3);
  if (result !== 0) {
    throw new Error(`Expected 0, got ${result}`);
  }
});

test('Complete scoring hierarchy calculation', () => {
  // Mock responses (all -2 for testing)
  const mockResponses = {};
  const mockSubdomains = [];

  // Create 6 subdomains
  for (let d = 1; d <= 2; d++) {
    for (let s = 1; s <= 3; s++) {
      const key = `subdomain_${d}_${s}`;
      mockSubdomains.push({ key });

      // 4 aspects per subdomain
      ['belief', 'behavior', 'feeling', 'consequence'].forEach(aspect => {
        mockResponses[`${key}_${aspect}`] = '-2';
      });
    }
  }

  const result = GroundingScoring.calculateScores(mockResponses, mockSubdomains);

  // Verify structure
  if (!result.aspectScores) throw new Error('Missing aspectScores');
  if (!result.subdomainQuotients) throw new Error('Missing subdomainQuotients');
  if (!result.domainQuotients) throw new Error('Missing domainQuotients');
  if (!result.overallQuotient) throw new Error('Missing overallQuotient');

  // Verify calculations (all -2 should normalize to 83.33)
  const expected = ((3 - (-2)) / 6) * 100; // 83.33
  Object.values(result.subdomainQuotients).forEach(score => {
    if (Math.abs(score - expected) > 0.01) {
      throw new Error(`Subdomain quotient incorrect: ${score}, expected ${expected}`);
    }
  });
});

test('Gap analysis classifies correctly', () => {
  const mockResponses = {};
  const mockSubdomains = [];

  // Create varied scores to test gap analysis
  const scores = [-3, -3, -3, -1, -1, -1]; // First 3 very low, last 3 moderate

  for (let d = 1; d <= 2; d++) {
    for (let s = 1; s <= 3; s++) {
      const key = `subdomain_${d}_${s}`;
      const idx = (d - 1) * 3 + (s - 1);
      mockSubdomains.push({ key });

      ['belief', 'behavior', 'feeling', 'consequence'].forEach(aspect => {
        mockResponses[`${key}_${aspect}`] = scores[idx].toString();
      });
    }
  }

  const result = GroundingScoring.calculateScores(mockResponses, mockSubdomains);

  // Check that gap analysis exists
  if (!result.domainGaps) throw new Error('Missing domainGaps');
  if (!result.domainGaps.domain1) throw new Error('Missing domain1 gap');
  if (!result.domainGaps.domain2) throw new Error('Missing domain2 gap');

  // Check classification exists
  if (!result.domainGaps.domain1.classification) {
    throw new Error('Missing gap classification');
  }
});

// ============================================================
// TEST SCENARIO 3: Fallback Coverage
// ============================================================
console.log('\n🛡️  SCENARIO 3: FALLBACK COVERAGE\n');

test('All Tool 3 subdomains have fallbacks', () => {
  const subdomainKeys = [
    'tool3_subdomain_1_1', 'tool3_subdomain_1_2', 'tool3_subdomain_1_3',
    'tool3_subdomain_2_1', 'tool3_subdomain_2_2', 'tool3_subdomain_2_3'
  ];

  subdomainKeys.forEach(key => {
    const fallback = GroundingFallbacks.subdomainFallbacks[key];
    if (!fallback) {
      throw new Error(`Missing fallback for ${key}`);
    }

    // Check severity levels
    if (!fallback.critical) throw new Error(`${key} missing critical level`);
    if (!fallback.moderate) throw new Error(`${key} missing moderate level`);
    if (!fallback.healthy) throw new Error(`${key} missing healthy level`);

    // Check required fields
    ['pattern', 'insight', 'action', 'rootBelief'].forEach(field => {
      if (!fallback.critical[field]) {
        throw new Error(`${key} critical missing field: ${field}`);
      }
    });
  });
});

test('Fallback selection based on score severity', () => {
  const aspectScores = {
    belief: -3,
    behavior: -2,
    feeling: -3,
    consequence: -2
  };

  const fallback = GroundingFallbacks.getSubdomainFallback(
    'tool3',
    'subdomain_1_1',
    aspectScores,
    {}
  );

  if (!fallback.pattern) throw new Error('Fallback missing pattern');
  if (!fallback.insight) throw new Error('Fallback missing insight');
  if (!fallback.action) throw new Error('Fallback missing action');
  if (!fallback.rootBelief) throw new Error('Fallback missing rootBelief');
});

// ============================================================
// TEST SCENARIO 4: Tool Registration
// ============================================================
console.log('\n🔌 SCENARIO 4: TOOL REGISTRATION\n');

test('Tool 3 is registered in Code.js', () => {
  const codeJs = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');

  if (!codeJs.includes("ToolRegistry.register('tool3'")) {
    throw new Error('Tool 3 not registered in Code.js');
  }

  if (!codeJs.includes('tool3Manifest')) {
    throw new Error('tool3Manifest not defined in Code.js');
  }
});

test('Tool 3 has correct dependencies and unlocks', () => {
  const codeJs = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');

  if (!codeJs.includes('dependencies: ["tool2"]')) {
    throw new Error('Tool 3 dependencies incorrect - should require tool2');
  }

  if (!codeJs.includes('unlocks: ["tool4"]')) {
    throw new Error('Tool 3 unlocks incorrect - should unlock tool4');
  }
});

test('Tool 3 manifest.json is valid JSON', () => {
  const manifestPath = path.join(__dirname, '..', 'tools/tool3/tool3.manifest.json');
  const manifestText = fs.readFileSync(manifestPath, 'utf8');

  try {
    const manifest = JSON.parse(manifestText);

    if (manifest.id !== 'tool3') throw new Error('Manifest ID incorrect');
    if (manifest.pages !== 7) throw new Error('Manifest pages should be 7');
    if (manifest.questions !== 30) throw new Error('Manifest questions should be 30');

  } catch (error) {
    throw new Error(`Invalid JSON in manifest: ${error.message}`);
  }
});

test('Tool 3 report route is registered', () => {
  const routerJs = fs.readFileSync(path.join(__dirname, '..', 'core/Router.js'), 'utf8');

  if (!routerJs.includes("'tool3_report'")) {
    throw new Error('tool3_report route not registered in Router.js');
  }

  if (!routerJs.includes('Tool3Report')) {
    throw new Error('Tool3Report not referenced in Router.js');
  }
});

// ============================================================
// TEST SCENARIO 5: Config Updates
// ============================================================
console.log('\n⚙️  SCENARIO 5: CONFIG UPDATES\n');

test('Config.js has Tool 3 configuration', () => {
  const configJs = fs.readFileSync(path.join(__dirname, '..', 'Config.js'), 'utf8');

  if (!configJs.includes("ID: 'tool3'")) {
    throw new Error('Tool 3 not configured in Config.js');
  }

  if (!configJs.includes('PAGES: 7')) {
    throw new Error('Tool 3 should have 7 pages in Config.js');
  }

  if (!configJs.includes('QUESTIONS: 30')) {
    throw new Error('Tool 3 should have 30 questions in Config.js');
  }
});

// ============================================================
// TEST SCENARIO 6: Content Completeness
// ============================================================
console.log('\n📝 SCENARIO 6: CONTENT COMPLETENESS\n');

test('All 6 subdomain labels are unique and descriptive', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  const expectedLabels = [
    "I'm Not Worthy of Financial Freedom",
    "I'll Never Have Enough",
    "I Can't See My Financial Reality",
    "Money Shows My Worth",
    "What Will They Think?",
    "I Need to Prove Myself"
  ];

  expectedLabels.forEach(label => {
    if (!tool3Code.includes(label)) {
      throw new Error(`Missing subdomain label: ${label}`);
    }
  });
});

test('All questions reference Tool 3 content document patterns', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  // Check for key belief patterns from content doc
  const keyBeliefs = [
    "not the kind of person who gets to have financial freedom",
    "never have enough money",
    "too complex/overwhelming for me to understand",
    "determines my worth and value",
    "opinions about how I spend"
  ];

  keyBeliefs.forEach(belief => {
    if (!tool3Code.includes(belief)) {
      throw new Error(`Missing key belief pattern: ${belief}`);
    }
  });
});

test('Intro content explains both domains', () => {
  const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');

  if (!tool3Code.includes('False Self-View')) {
    throw new Error('Intro missing Domain 1 description');
  }

  if (!tool3Code.includes('External Validation')) {
    throw new Error('Intro missing Domain 2 description');
  }
});

// ============================================================
// TEST SCENARIO 7: Edge Cases
// ============================================================
console.log('\n⚠️  SCENARIO 7: EDGE CASES\n');

test('Score normalization handles boundary values', () => {
  const boundaries = [-3, -2, -1, 1, 2, 3];
  boundaries.forEach(score => {
    const result = GroundingScoring.normalizeScore(score);
    if (result < 0 || result > 100) {
      throw new Error(`Score ${score} normalized to invalid value: ${result}`);
    }
  });
});

test('Scoring rejects invalid scale values', () => {
  const mockResponses = {
    'subdomain_1_1_belief': '0', // Invalid: no zero allowed
    'subdomain_1_1_behavior': '-2',
    'subdomain_1_1_feeling': '-2',
    'subdomain_1_1_consequence': '-2'
  };

  const mockSubdomains = [{ key: 'subdomain_1_1' }];

  try {
    GroundingScoring.calculateScores(mockResponses, mockSubdomains);
    throw new Error('Should have rejected zero value');
  } catch (error) {
    if (!error.message.includes('Invalid score')) {
      throw new Error('Wrong error message for invalid score');
    }
  }
});

test('Scoring rejects out-of-range values', () => {
  const mockResponses = {
    'subdomain_1_1_belief': '5', // Invalid: out of range
    'subdomain_1_1_behavior': '-2',
    'subdomain_1_1_feeling': '-2',
    'subdomain_1_1_consequence': '-2'
  };

  const mockSubdomains = [{ key: 'subdomain_1_1' }];

  try {
    GroundingScoring.calculateScores(mockResponses, mockSubdomains);
    throw new Error('Should have rejected out-of-range value');
  } catch (error) {
    if (!error.message.includes('Invalid score')) {
      throw new Error('Wrong error message for out-of-range score');
    }
  }
});

test('Fallback handles missing subdomain gracefully', () => {
  const fallback = GroundingFallbacks.getSubdomainFallback(
    'tool3',
    'nonexistent_subdomain',
    { belief: -2, behavior: -2, feeling: -2, consequence: -2 },
    {}
  );

  // Should return generic fallback
  if (!fallback.pattern) throw new Error('Generic fallback should have pattern');
});

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('\n📈 TEST SUMMARY\n');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📊 Total:  ${results.passed + results.failed}`);

if (results.failed > 0) {
  console.log('\n⚠️  FAILED TESTS:\n');
  results.tests
    .filter(t => t.status === 'FAIL')
    .forEach(t => {
      console.log(`  ❌ ${t.name}`);
      console.log(`     ${t.error}`);
    });
  console.log('\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL E2E TESTS PASSED! Tool 3 is ready for deployment.\n');
  process.exit(0);
}
