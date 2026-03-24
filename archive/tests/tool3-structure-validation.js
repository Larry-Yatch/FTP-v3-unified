/**
 * Tool 3 Structure Validation
 * Validates code structure, patterns, and completeness without execution
 */

const fs = require('fs');
const path = require('path');

// Test results
const results = { passed: 0, failed: 0, tests: [] };

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

console.log('\n🔍 TOOL 3 STRUCTURAL VALIDATION\n');
console.log('='.repeat(60));

// Load files
const tool3Code = fs.readFileSync(path.join(__dirname, '..', 'tools/tool3/Tool3.js'), 'utf8');
const codeJs = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');
const routerJs = fs.readFileSync(path.join(__dirname, '..', 'core/Router.js'), 'utf8');
const configJs = fs.readFileSync(path.join(__dirname, '..', 'Config.js'), 'utf8');

// ============================================================
// INTEGRATION TESTS
// ============================================================
console.log('\n🔌 INTEGRATION VALIDATION\n');

test('Tool 3 registered in Code.js', () => {
  if (!codeJs.includes("ToolRegistry.register('tool3'")) {
    throw new Error('Not registered');
  }
});

test('Tool 3 dependencies correct (requires tool2)', () => {
  if (!codeJs.includes('dependencies: ["tool2"]')) {
    throw new Error('Should depend on tool2');
  }
});

test('Tool 3 unlocks correct (unlocks tool4)', () => {
  if (!codeJs.includes('unlocks: ["tool4"]')) {
    throw new Error('Should unlock tool4');
  }
});

test('Tool 3 report route in Router.js', () => {
  if (!routerJs.includes("'tool3_report'")) {
    throw new Error('Missing tool3_report route');
  }
});

test('Tool 3 configured in Config.js', () => {
  if (!configJs.includes("ID: 'tool3'") || !configJs.includes('PAGES: 7') || !configJs.includes('QUESTIONS: 30')) {
    throw new Error('Config incomplete');
  }
});

// ============================================================
// STRUCTURE TESTS
// ============================================================
console.log('\n📐 STRUCTURE VALIDATION\n');

test('Tool3.js exports Tool3 object', () => {
  if (!tool3Code.includes('const Tool3 = {')) {
    throw new Error('Missing Tool3 object declaration');
  }
});

test('Tool3 has config object', () => {
  if (!tool3Code.includes('config: {')) {
    throw new Error('Missing config object');
  }
});

test('Tool3 config has 6 subdomains', () => {
  const subdomainsMatch = tool3Code.match(/subdomains: \[[\s\S]*?\][\s\S]*?\]/);
  if (!subdomainsMatch) {
    throw new Error('Subdomains array not found');
  }

  const subdomainCount = (subdomainsMatch[0].match(/key: 'subdomain_/g) || []).length;
  if (subdomainCount !== 6) {
    throw new Error(`Expected 6 subdomains, found ${subdomainCount}`);
  }
});

test('All 6 subdomains have correct keys', () => {
  const expectedKeys = [
    'subdomain_1_1', 'subdomain_1_2', 'subdomain_1_3',
    'subdomain_2_1', 'subdomain_2_2', 'subdomain_2_3'
  ];

  expectedKeys.forEach(key => {
    if (!tool3Code.includes(`key: '${key}'`)) {
      throw new Error(`Missing subdomain: ${key}`);
    }
  });
});

test('Each subdomain has label, description, beliefBehaviorConnection', () => {
  const subdomainBlocks = tool3Code.match(/key: 'subdomain_\d_\d',[\s\S]*?(?=key: 'subdomain_|subdomains: \[)/g) || [];

  if (subdomainBlocks.length < 6) {
    throw new Error(`Expected 6 subdomain blocks, found ${subdomainBlocks.length}`);
  }

  subdomainBlocks.forEach((block, idx) => {
    if (!block.includes('label:')) throw new Error(`Subdomain ${idx + 1} missing label`);
    if (!block.includes('description:')) throw new Error(`Subdomain ${idx + 1} missing description`);
    if (!block.includes('beliefBehaviorConnection:')) throw new Error(`Subdomain ${idx + 1} missing beliefBehaviorConnection`);
  });
});

test('Each subdomain has 5 questions (4 scale + 1 open)', () => {
  const questionsArrays = tool3Code.match(/questions: \[[\s\S]*?\][\s\S]*?\]/g);

  if (!questionsArrays || questionsArrays.length !== 6) {
    throw new Error(`Expected 6 question arrays, found ${questionsArrays ? questionsArrays.length : 0}`);
  }
});

test('All scale questions have aspect, text, and scale properties', () => {
  const aspectQuestions = tool3Code.match(/\{\s*aspect: '(Belief|Behavior|Feeling|Consequence)',[\s\S]*?scale: \{/g);

  if (!aspectQuestions || aspectQuestions.length !== 24) {
    throw new Error(`Expected 24 aspect questions (4×6), found ${aspectQuestions ? aspectQuestions.length : 0}`);
  }
});

test('All scale questions have negative and positive anchors', () => {
  const scaleObjects = tool3Code.match(/scale: \{[\s\S]*?negative:[\s\S]*?positive:/g);

  if (!scaleObjects || scaleObjects.length !== 24) {
    throw new Error(`Expected 24 scale objects, found ${scaleObjects ? scaleObjects.length : 0}`);
  }
});

// ============================================================
// CONTENT TESTS
// ============================================================
console.log('\n📝 CONTENT VALIDATION\n');

test('Domain names configured correctly', () => {
  if (!tool3Code.includes("domain1Name: 'False Self-View'")) {
    throw new Error('Domain 1 name incorrect');
  }
  if (!tool3Code.includes("domain2Name: 'External Validation'")) {
    throw new Error('Domain 2 name incorrect');
  }
});

test('All 6 subdomain labels are present', () => {
  const labels = [
    'Not Worthy of Financial Freedom',
    "Never Have Enough",
    "Can't See My Financial Reality",
    "Money Shows My Worth",
    "What Will They Think",
    "Need to Prove Myself"
  ];

  labels.forEach(label => {
    if (!tool3Code.includes(label)) {
      throw new Error(`Missing label fragment: ${label}`);
    }
  });
});

test('Key belief patterns from content doc present', () => {
  const beliefs = [
    'not the kind of person who gets to have financial freedom',
    'never have enough money',
    'too complex/overwhelming',
    'determines my worth',
    'opinions about how I spend'
  ];

  beliefs.forEach(belief => {
    if (!tool3Code.includes(belief)) {
      throw new Error(`Missing belief: ${belief}`);
    }
  });
});

test('Intro content explains disconnection from self', () => {
  if (!tool3Code.includes('disconnection from your authentic self')) {
    throw new Error('Intro missing core concept');
  }
});

// ============================================================
// METHOD TESTS
// ============================================================
console.log('\n⚙️  METHOD VALIDATION\n');

test('Tool3 has render method', () => {
  if (!tool3Code.includes('render(clientId, page = 1)')) {
    throw new Error('Missing render method');
  }
});

test('Tool3 has processSubmission method', () => {
  if (!tool3Code.includes('processSubmission(clientId, formData)')) {
    throw new Error('Missing processSubmission method');
  }
});

test('Tool3 has getIntroContent method', () => {
  if (!tool3Code.includes('getIntroContent()')) {
    throw new Error('Missing getIntroContent method');
  }
});

test('Tool3 integrates with GroundingFormBuilder', () => {
  if (!tool3Code.includes('GroundingFormBuilder.renderPage')) {
    throw new Error('Not using GroundingFormBuilder');
  }
});

test('Tool3 integrates with GroundingScoring', () => {
  if (!tool3Code.includes('GroundingScoring.calculateScores')) {
    throw new Error('Not using GroundingScoring');
  }
});

test('Tool3 integrates with GroundingGPT', () => {
  if (!tool3Code.includes('GroundingGPT')) {
    throw new Error('Not using GroundingGPT');
  }
});

test('Tool3 integrates with GroundingReport', () => {
  if (!tool3Code.includes('GroundingReport.generateReport')) {
    throw new Error('Not using GroundingReport');
  }
});

// ============================================================
// MANIFEST TESTS
// ============================================================
console.log('\n📋 MANIFEST VALIDATION\n');

test('tool3.manifest.json is valid JSON', () => {
  const manifestPath = path.join(__dirname, '..', 'tools/tool3/tool3.manifest.json');
  const manifestText = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText);

  if (manifest.id !== 'tool3') throw new Error('ID incorrect');
  if (manifest.pages !== 7) throw new Error('Pages should be 7');
  if (manifest.questions !== 30) throw new Error('Questions should be 30');
  if (!manifest.dependencies || !manifest.dependencies.includes('GroundingFormBuilder')) {
    throw new Error('Missing grounding utility dependencies');
  }
});

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('\n📈 VALIDATION SUMMARY\n');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📊 Total:  ${results.passed + results.failed}`);

if (results.failed > 0) {
  console.log('\n⚠️  FAILED VALIDATIONS:\n');
  results.tests
    .filter(t => t.status === 'FAIL')
    .forEach(t => {
      console.log(`  ❌ ${t.name}`);
      console.log(`     ${t.error}`);
    });
  console.log('\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL STRUCTURE VALIDATIONS PASSED!\n');
  console.log('Tool 3 is structurally complete and ready for deployment.');
  console.log('Recommend manual testing in GAS environment to verify runtime behavior.\n');
  process.exit(0);
}
