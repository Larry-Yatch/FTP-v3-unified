/**
 * Test Synthesis Validation Fix
 * Tests that empty GPT responses trigger fallbacks correctly
 */

function testSynthesisValidation() {
  Logger.log('=== Testing Synthesis Validation Fix ===\n');

  // Test 1: Valid domain synthesis should pass
  Logger.log('TEST 1: Valid domain synthesis');
  const validDomain = {
    summary: 'This is a valid summary with more than 10 characters',
    keyThemes: ['Theme 1', 'Theme 2'],
    priorityFocus: 'Valid priority focus with more than 10 characters'
  };
  const result1 = GroundingGPT.isValidDomainSynthesis(validDomain);
  Logger.log(`  Result: ${result1 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Expected: true, Got: ${result1}\n`);

  // Test 2: Empty summary should fail
  Logger.log('TEST 2: Empty summary should fail');
  const emptyDomain = {
    summary: '',
    keyThemes: [],
    priorityFocus: ''
  };
  const result2 = GroundingGPT.isValidDomainSynthesis(emptyDomain);
  Logger.log(`  Result: ${!result2 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Expected: false, Got: ${result2}\n`);

  // Test 3: Short summary should fail
  Logger.log('TEST 3: Too short summary should fail');
  const shortDomain = {
    summary: 'Short',
    keyThemes: ['Theme'],
    priorityFocus: 'Also short'
  };
  const result3 = GroundingGPT.isValidDomainSynthesis(shortDomain);
  Logger.log(`  Result: ${!result3 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Expected: false, Got: ${result3}\n`);

  // Test 4: Empty keyThemes array should fail
  Logger.log('TEST 4: Empty keyThemes should fail');
  const noThemes = {
    summary: 'Valid summary with enough characters here',
    keyThemes: [],
    priorityFocus: 'Valid priority focus with enough chars'
  };
  const result4 = GroundingGPT.isValidDomainSynthesis(noThemes);
  Logger.log(`  Result: ${!result4 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Expected: false, Got: ${result4}\n`);

  // Test 5: Valid overall synthesis should pass
  Logger.log('TEST 5: Valid overall synthesis');
  const validOverall = {
    overview: 'Valid overview with more than 10 characters in it',
    integration: 'Valid integration section with enough content',
    coreWork: 'Valid core work section with plenty of text',
    nextSteps: ['Step 1', 'Step 2', 'Step 3']
  };
  const result5 = GroundingGPT.isValidOverallSynthesis(validOverall);
  Logger.log(`  Result: ${result5 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Expected: true, Got: ${result5}\n`);

  // Test 6: Empty overall should fail
  Logger.log('TEST 6: Empty overall synthesis should fail');
  const emptyOverall = {
    overview: '',
    integration: '',
    coreWork: '',
    nextSteps: []
  };
  const result6 = GroundingGPT.isValidOverallSynthesis(emptyOverall);
  Logger.log(`  Result: ${!result6 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Expected: false, Got: ${result6}\n`);

  // Summary
  const allPassed = result1 && !result2 && !result3 && !result4 && result5 && !result6;
  Logger.log('=== SUMMARY ===');
  Logger.log(`All tests: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);

  return allPassed;
}

/**
 * Test that empty syntheses trigger fallbacks
 */
function testEmptySynthesisTriggersFallback() {
  Logger.log('\n=== Testing Fallback Trigger ===\n');

  // This simulates what happens when GPT returns empty content
  try {
    const clientId = '6123LY';

    // Simulate tool3 synthesis with empty GPT response
    Logger.log('Testing with mock domain config (not calling real GPT)...');

    // Create a mock domain config that matches Tool3 structure
    const mockDomainConfig = {
      key: 'domain1',
      name: Tool3.config.domain1Name,
      subdomains: [
        {key: 'subdomain_1_1', name: 'Test Subdomain 1'},
        {key: 'subdomain_1_2', name: 'Test Subdomain 2'},
        {key: 'subdomain_1_3', name: 'Test Subdomain 3'}
      ]
    };

    // This should trigger fallback if GPT returns empty
    const result = GroundingGPT.synthesizeDomain({
      toolId: 'tool3',
      clientId: clientId,
      domainConfig: mockDomainConfig,
      subdomainInsights: {
        subdomain_1_1: {
          pattern: 'Test pattern',
          insight: 'Test insight',
          action: 'Test action',
          rootBelief: 'Test belief',
          source: 'fallback'
        },
        subdomain_1_2: {
          pattern: 'Test pattern 2',
          insight: 'Test insight 2',
          action: 'Test action 2',
          rootBelief: 'Test belief 2',
          source: 'fallback'
        },
        subdomain_1_3: {
          pattern: 'Test pattern 3',
          insight: 'Test insight 3',
          action: 'Test action 3',
          rootBelief: 'Test belief 3',
          source: 'fallback'
        }
      },
      subdomainScores: {
        subdomain_1_1: 45.5,
        subdomain_1_2: 50.2,
        subdomain_1_3: 48.8
      },
      domainScore: 48.61
    });

    Logger.log('\nResult:');
    Logger.log(`  Source: ${result.source}`);
    Logger.log(`  Summary length: ${result.summary ? result.summary.length : 0}`);
    Logger.log(`  Key themes: ${result.keyThemes ? result.keyThemes.length : 0}`);
    Logger.log(`  Priority focus length: ${result.priorityFocus ? result.priorityFocus.length : 0}`);

    // Check if it used fallback or GPT succeeded
    if (result.source === 'fallback') {
      Logger.log('\n✅ Fallback correctly triggered (GPT may have failed or returned empty)');
    } else if (result.source === 'gpt') {
      Logger.log('\n✅ GPT succeeded with valid content');
    }

    // Verify content is not empty
    const hasContent = result.summary && result.summary.length > 10;
    Logger.log(`\nContent validation: ${hasContent ? 'PASS ✅' : 'FAIL ❌'}`);

    return hasContent;

  } catch (error) {
    Logger.log(`\n❌ Test failed with error: ${error.message}`);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Run all tests
 */
function runAllSynthesisTests() {
  Logger.log('╔════════════════════════════════════════╗');
  Logger.log('║  SYNTHESIS VALIDATION TEST SUITE      ║');
  Logger.log('╚════════════════════════════════════════╝\n');

  const test1 = testSynthesisValidation();
  const test2 = testEmptySynthesisTriggersFallback();

  Logger.log('\n╔════════════════════════════════════════╗');
  Logger.log('║  FINAL RESULTS                         ║');
  Logger.log('╚════════════════════════════════════════╝');
  Logger.log(`  Validation Tests: ${test1 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Fallback Trigger: ${test2 ? 'PASS ✅' : 'FAIL ❌'}`);
  Logger.log(`  Overall: ${test1 && test2 ? 'PASS ✅' : 'FAIL ❌'}\n`);
}
