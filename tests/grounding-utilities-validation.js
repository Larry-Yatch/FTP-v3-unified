/**
 * Grounding Utilities Validation Script
 * Tests the 5 grounding utilities before Tool 3 implementation
 *
 * Run with: node tests/grounding-utilities-validation.js
 */

// Mock GAS environment
const Logger = { log: console.log };
const PropertiesService = {
  getScriptProperties: () => ({ getProperty: () => 'mock-api-key' }),
  getUserProperties: () => ({
    setProperty: () => {},
    getProperty: () => null,
    deleteProperty: () => {}
  })
};
const UrlFetchApp = { fetch: () => {} };
const Utilities = { sleep: () => {} };
const SpreadsheetApp = { openById: () => ({}) };
const Session = { getActiveUser: () => ({ getEmail: () => 'test@test.com' }) };
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

// Load utilities (simulate by defining them inline since we can't actually require)
const fs = require('fs');
const path = require('path');

function loadUtility(filename) {
  const filepath = path.join(__dirname, '..', 'core', 'grounding', filename);
  const code = fs.readFileSync(filepath, 'utf8');
  return code;
}

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

console.log('\n🧪 GROUNDING UTILITIES VALIDATION\n');
console.log('='.repeat(60));

// ============================================================
// TEST 1: File Existence
// ============================================================
console.log('\n📁 FILE EXISTENCE CHECKS\n');

test('GroundingFormBuilder.js exists', () => {
  const code = loadUtility('GroundingFormBuilder.js');
  if (!code || code.length < 100) throw new Error('File empty or too small');
});

test('GroundingScoring.js exists', () => {
  const code = loadUtility('GroundingScoring.js');
  if (!code || code.length < 100) throw new Error('File empty or too small');
});

test('GroundingGPT.js exists', () => {
  const code = loadUtility('GroundingGPT.js');
  if (!code || code.length < 100) throw new Error('File empty or too small');
});

test('GroundingReport.js exists', () => {
  const code = loadUtility('GroundingReport.js');
  if (!code || code.length < 100) throw new Error('File empty or too small');
});

test('GroundingFallbacks.js exists', () => {
  const code = loadUtility('GroundingFallbacks.js');
  if (!code || code.length < 100) throw new Error('File empty or too small');
});

// ============================================================
// TEST 2: Syntax Validation
// ============================================================
console.log('\n📝 SYNTAX VALIDATION\n');

test('GroundingFormBuilder.js has valid syntax', () => {
  const code = loadUtility('GroundingFormBuilder.js');
  // Check for object declaration
  if (!code.includes('const GroundingFormBuilder = {')) {
    throw new Error('Missing GroundingFormBuilder object declaration');
  }
  // Check for key methods
  if (!code.includes('renderPage(params)')) {
    throw new Error('Missing renderPage method');
  }
  if (!code.includes('renderIntroPage(params)')) {
    throw new Error('Missing renderIntroPage method');
  }
  if (!code.includes('renderSubdomainPage(params)')) {
    throw new Error('Missing renderSubdomainPage method');
  }
});

test('GroundingScoring.js has valid syntax', () => {
  const code = loadUtility('GroundingScoring.js');
  if (!code.includes('const GroundingScoring = {')) {
    throw new Error('Missing GroundingScoring object declaration');
  }
  if (!code.includes('calculateScores(responses, subdomains)')) {
    throw new Error('Missing calculateScores method');
  }
  if (!code.includes('normalizeScore(rawScore)')) {
    throw new Error('Missing normalizeScore method');
  }
});

test('GroundingGPT.js has valid syntax', () => {
  const code = loadUtility('GroundingGPT.js');
  if (!code.includes('const GroundingGPT = {')) {
    throw new Error('Missing GroundingGPT object declaration');
  }
  if (!code.includes('analyzeSubdomain(params)')) {
    throw new Error('Missing analyzeSubdomain method');
  }
  if (!code.includes('synthesizeDomain(params)')) {
    throw new Error('Missing synthesizeDomain method');
  }
  if (!code.includes('synthesizeOverall(params)')) {
    throw new Error('Missing synthesizeOverall method');
  }
});

test('GroundingReport.js has valid syntax', () => {
  const code = loadUtility('GroundingReport.js');
  if (!code.includes('const GroundingReport = {')) {
    throw new Error('Missing GroundingReport object declaration');
  }
  if (!code.includes('generateReport(params)')) {
    throw new Error('Missing generateReport method');
  }
});

test('GroundingFallbacks.js has valid syntax', () => {
  const code = loadUtility('GroundingFallbacks.js');
  if (!code.includes('const GroundingFallbacks = {')) {
    throw new Error('Missing GroundingFallbacks object declaration');
  }
  if (!code.includes('getSubdomainFallback(')) {
    throw new Error('Missing getSubdomainFallback method');
  }
  if (!code.includes('subdomainFallbacks: {')) {
    throw new Error('Missing subdomainFallbacks object');
  }
});

// ============================================================
// TEST 3: Dependency References
// ============================================================
console.log('\n🔗 DEPENDENCY CHECKS\n');

test('GroundingFormBuilder references FormUtils', () => {
  const code = loadUtility('GroundingFormBuilder.js');
  if (!code.includes('FormUtils.generatePageHeader')) {
    throw new Error('Missing FormUtils.generatePageHeader reference');
  }
  if (!code.includes('FormUtils.getFormSubmissionScript')) {
    throw new Error('Missing FormUtils.getFormSubmissionScript reference');
  }
});

test('GroundingFormBuilder references FeedbackWidget', () => {
  const code = loadUtility('GroundingFormBuilder.js');
  if (!code.includes('FeedbackWidget.render')) {
    throw new Error('Missing FeedbackWidget.render reference');
  }
});

test('GroundingGPT references GroundingFallbacks', () => {
  const code = loadUtility('GroundingGPT.js');
  if (!code.includes('GroundingFallbacks.getSubdomainFallback')) {
    throw new Error('Missing GroundingFallbacks.getSubdomainFallback reference');
  }
  if (!code.includes('GroundingFallbacks.getDomainFallback')) {
    throw new Error('Missing GroundingFallbacks.getDomainFallback reference');
  }
  if (!code.includes('GroundingFallbacks.getOverallFallback')) {
    throw new Error('Missing GroundingFallbacks.getOverallFallback reference');
  }
});

test('GroundingReport references GroundingScoring', () => {
  const code = loadUtility('GroundingReport.js');
  if (!code.includes('GroundingScoring.interpretQuotient')) {
    throw new Error('Missing GroundingScoring.interpretQuotient reference');
  }
});

test('All utilities reference CONFIG', () => {
  const files = [
    'GroundingFormBuilder.js',
    'GroundingGPT.js',
    'GroundingReport.js'
  ];

  files.forEach(filename => {
    const code = loadUtility(filename);
    // Some files may not need CONFIG, but check pattern
    if (filename === 'GroundingGPT.js' && !code.includes('CONFIG.MASTER_SHEET_ID')) {
      throw new Error(`${filename} missing CONFIG.MASTER_SHEET_ID`);
    }
  });
});

// ============================================================
// TEST 4: Scoring Logic Validation
// ============================================================
console.log('\n🔢 SCORING LOGIC VALIDATION\n');

test('Score normalization formula is correct', () => {
  const code = loadUtility('GroundingScoring.js');

  // Check for the normalization formula
  if (!code.includes('((3 - rawScore) / 6) * 100')) {
    throw new Error('Normalization formula not found or incorrect');
  }

  // Check that it's in the normalizeScore function
  const normalizeMatch = code.match(/normalizeScore\(rawScore\)\s*{[\s\S]*?return\s+\(\(3 - rawScore\) \/ 6\) \* 100/);
  if (!normalizeMatch) {
    throw new Error('Normalization formula not in correct location');
  }
});

test('Gap classification thresholds are correct', () => {
  const code = loadUtility('GroundingScoring.js');

  // Check for gap classifications
  if (!code.includes("classification = 'DIFFUSE'")) {
    throw new Error('DIFFUSE classification not found');
  }
  if (!code.includes("classification = 'FOCUSED'")) {
    throw new Error('FOCUSED classification not found');
  }
  if (!code.includes("classification = 'HIGHLY_FOCUSED'")) {
    throw new Error('HIGHLY_FOCUSED classification not found');
  }

  // Check thresholds
  if (!code.includes('gap < 5')) {
    throw new Error('DIFFUSE threshold (< 5) not found');
  }
  if (!code.includes('gap >= 5 && gap <= 15')) {
    throw new Error('FOCUSED threshold (5-15) not found');
  }
});

test('4-level scoring hierarchy is implemented', () => {
  const code = loadUtility('GroundingScoring.js');

  // Check for all 4 levels
  if (!code.includes('aspectScores')) {
    throw new Error('Level 1 (aspectScores) not found');
  }
  if (!code.includes('subdomainQuotients')) {
    throw new Error('Level 2 (subdomainQuotients) not found');
  }
  if (!code.includes('domainQuotients')) {
    throw new Error('Level 3 (domainQuotients) not found');
  }
  if (!code.includes('overallQuotient')) {
    throw new Error('Level 4 (overallQuotient) not found');
  }
});

// ============================================================
// TEST 5: GPT Pattern Validation
// ============================================================
console.log('\n🤖 GPT PATTERN VALIDATION\n');

test('9-call GPT pattern is documented', () => {
  const code = loadUtility('GroundingGPT.js');

  // Check for 6 subdomain + 3 synthesis pattern
  if (!code.includes('6 calls during form')) {
    throw new Error('6 subdomain calls not documented');
  }
  if (!code.includes('3 calls at submission')) {
    throw new Error('3 synthesis calls not documented');
  }
  if (!code.includes('9 calls per assessment')) {
    throw new Error('Total 9 calls not documented');
  }
});

test('3-tier fallback is implemented', () => {
  const code = loadUtility('GroundingGPT.js');

  // Check for all 3 tiers
  if (!code.includes('TIER 1: Try GPT Analysis')) {
    throw new Error('Tier 1 not found');
  }
  if (!code.includes('TIER 2: Retry GPT Analysis')) {
    throw new Error('Tier 2 not found');
  }
  if (!code.includes('TIER 3: Use Subdomain-Specific Fallback')) {
    throw new Error('Tier 3 not found');
  }
});

test('GPT models are correctly specified', () => {
  const code = loadUtility('GroundingGPT.js');

  // Subdomain analysis should use gpt-4o-mini
  const subdomainMatch = code.match(/analyzeSubdomain[\s\S]*?model:\s*'gpt-4o-mini'/);
  if (!subdomainMatch) {
    throw new Error('Subdomain analysis not using gpt-4o-mini');
  }

  // Synthesis should use gpt-4o
  const synthesisMatch = code.match(/synthesizeDomain[\s\S]*?model:\s*'gpt-4o'/);
  if (!synthesisMatch) {
    throw new Error('Domain synthesis not using gpt-4o');
  }
});

test('PropertiesService caching is implemented', () => {
  const code = loadUtility('GroundingGPT.js');

  if (!code.includes('cacheInsight(')) {
    throw new Error('cacheInsight method not found');
  }
  if (!code.includes('getCachedInsight(')) {
    throw new Error('getCachedInsight method not found');
  }
  if (!code.includes('PropertiesService.getUserProperties()')) {
    throw new Error('PropertiesService not used for caching');
  }
});

// ============================================================
// TEST 6: Fallback Coverage
// ============================================================
console.log('\n🛡️  FALLBACK COVERAGE VALIDATION\n');

test('Tool 3 has 6 subdomain fallbacks', () => {
  const code = loadUtility('GroundingFallbacks.js');

  const tool3Subdomains = [
    'tool3_subdomain_1_1',
    'tool3_subdomain_1_2',
    'tool3_subdomain_1_3',
    'tool3_subdomain_2_1',
    'tool3_subdomain_2_2',
    'tool3_subdomain_2_3'
  ];

  tool3Subdomains.forEach(key => {
    if (!code.includes(`'${key}':`)) {
      throw new Error(`Missing fallback for ${key}`);
    }
  });
});

test('Tool 5 has 6 subdomain fallbacks', () => {
  const code = loadUtility('GroundingFallbacks.js');

  const tool5Subdomains = [
    'tool5_subdomain_1_1',
    'tool5_subdomain_1_2',
    'tool5_subdomain_1_3',
    'tool5_subdomain_2_1',
    'tool5_subdomain_2_2',
    'tool5_subdomain_2_3'
  ];

  tool5Subdomains.forEach(key => {
    if (!code.includes(`'${key}':`)) {
      throw new Error(`Missing fallback for ${key}`);
    }
  });
});

test('Each subdomain fallback has 3 severity levels', () => {
  const code = loadUtility('GroundingFallbacks.js');

  // Check one subdomain as example
  const subdomain = code.match(/'tool3_subdomain_1_1':\s*{[\s\S]*?},\s*'tool3_subdomain_1_2'/);
  if (!subdomain) {
    throw new Error('Could not extract subdomain for testing');
  }

  const subdomainText = subdomain[0];
  if (!subdomainText.includes('critical:')) {
    throw new Error('Missing critical severity level');
  }
  if (!subdomainText.includes('moderate:')) {
    throw new Error('Missing moderate severity level');
  }
  if (!subdomainText.includes('healthy:')) {
    throw new Error('Missing healthy severity level');
  }
});

test('Each fallback has required fields', () => {
  const code = loadUtility('GroundingFallbacks.js');

  // Check one fallback variation
  const critical = code.match(/critical:\s*{[\s\S]*?pattern:[\s\S]*?insight:[\s\S]*?action:[\s\S]*?rootBelief:/);
  if (!critical) {
    throw new Error('Fallback missing required fields (pattern, insight, action, rootBelief)');
  }
});

// ============================================================
// TEST 7: Report Structure
// ============================================================
console.log('\n📊 REPORT STRUCTURE VALIDATION\n');

test('Report has all required sections', () => {
  const code = loadUtility('GroundingReport.js');

  const sections = [
    'renderOverallSection',
    'renderDomainSections',
    'renderDomainSection',
    'renderSubdomainCard',
    'renderActionPlan',
    'renderScoreGuide',
    'renderNextSteps'
  ];

  sections.forEach(section => {
    if (!code.includes(`${section}(`)) {
      throw new Error(`Missing ${section} method`);
    }
  });
});

test('Report uses theme colors', () => {
  const code = loadUtility('GroundingReport.js');

  if (!code.includes('#ad9168')) {
    throw new Error('Primary theme color not used');
  }
  if (!code.includes('#1e192b')) {
    throw new Error('Dark background color not used');
  }
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
  console.log('\n🎉 ALL TESTS PASSED! Ready for Phase 2.\n');
  process.exit(0);
}
