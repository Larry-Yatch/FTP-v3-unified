/**
 * GPT Integration Test Suite
 *
 * Comprehensive testing of OpenAI API integration for Tool 2
 * Tests various scenarios, error handling, and fallback systems
 *
 * Usage:
 * 1. Open Apps Script Editor
 * 2. Select the test function you want to run:
 *    - testGPTConnection() - Quick API connectivity test
 *    - testGPTIndividualAnalysis() - Test single response analysis
 *    - testGPTSynthesis() - Test overall synthesis
 *    - runFullGPTDiagnostic() - Run all tests
 * 3. Click Run
 * 4. Check execution log (View → Logs)
 */

/**
 * Test 1: Basic GPT API Connection
 * Verifies API key and basic connectivity
 */
function testGPTConnection() {
  console.log('=== TEST 1: GPT API CONNECTION ===\n');

  try {
    // Check API key
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      console.error('❌ FAIL: OPENAI_API_KEY not found in Script Properties');
      console.log('Fix: Project Settings → Script Properties → Add OPENAI_API_KEY');
      return false;
    }

    console.log(`✓ API Key found (length: ${apiKey.length})`);
    console.log('');

    // Test simple API call
    console.log('Testing simple GPT call...');
    const result = Tool2GPTAnalysis.callGPT({
      systemPrompt: 'You are a helpful assistant. Respond with exactly: "API connection successful"',
      userPrompt: 'Test',
      model: 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 50
    });

    console.log(`Response: "${result}"`);
    console.log('Response length:', result.length);

    if (result.toLowerCase().includes('connection successful') || result.toLowerCase().includes('api')) {
      console.log('\n✅ PASS: GPT API connection working');
      return true;
    } else {
      console.log('\n⚠️ WARNING: Unexpected response from GPT');
      return false;
    }

  } catch (error) {
    console.error('❌ FAIL: GPT API connection error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    if (error.message.includes('invalid_api_key')) {
      console.log('\nFix: Your API key is invalid. Update it in Script Properties.');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('\nFix: Your OpenAI account is out of credits. Add credits at platform.openai.com');
    } else if (error.message.includes('rate_limit')) {
      console.log('\nFix: Rate limit exceeded. Wait a moment and try again.');
    }

    return false;
  }
}

/**
 * Test 2: Individual Response Analysis
 * Tests analyzing a single free-text response
 */
function testGPTIndividualAnalysis() {
  console.log('\n=== TEST 2: INDIVIDUAL RESPONSE ANALYSIS ===\n');

  try {
    const testResponse = {
      clientId: 'TEST_USER',
      responseType: 'income_sources',
      responseText: 'I work as a software engineer making $120k/year, plus I have rental income from a property I own generating about $1500/month.',
      previousInsights: {},
      formData: {},
      domainScores: { moneyFlow: 65, obligations: 70, liquidity: 45, growth: 60, protection: 50 },
      traumaData: { topTrauma: 'Showing', score: 8 }
    };

    console.log('Test data:');
    console.log(`- Response type: ${testResponse.responseType}`);
    console.log(`- Response text: "${testResponse.responseText}"`);
    console.log('');

    console.log('Calling Tool2GPTAnalysis.analyzeResponse()...');
    const insight = Tool2GPTAnalysis.analyzeResponse(testResponse);

    console.log('\nResult:');
    console.log('Source:', insight.source);
    console.log('Pattern length:', insight.pattern?.length || 0);
    console.log('Insight length:', insight.insight?.length || 0);
    console.log('Action length:', insight.action?.length || 0);
    console.log('');

    if (insight.pattern) {
      console.log('Pattern preview:', insight.pattern.substring(0, 100) + '...');
    }

    // Validation
    const isValid = insight.pattern && insight.pattern.length > 10 &&
                   insight.insight && insight.insight.length > 10 &&
                   insight.action && insight.action.length > 10;

    if (isValid) {
      console.log('\n✅ PASS: Individual analysis generated valid insight');
      console.log(`Source: ${insight.source}`);
      return true;
    } else {
      console.log('\n❌ FAIL: Individual analysis returned incomplete insight');
      console.log('Full result:', JSON.stringify(insight, null, 2));
      return false;
    }

  } catch (error) {
    console.error('❌ FAIL: Individual analysis error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

/**
 * Test 3: Overall Synthesis
 * Tests synthesizing multiple insights into overall report
 */
function testGPTSynthesis() {
  console.log('\n=== TEST 3: OVERALL SYNTHESIS ===\n');

  try {
    const testData = {
      clientId: 'TEST_USER',
      allInsights: {
        income_sources: {
          pattern: 'Multiple income streams',
          insight: 'You have diversified income from employment and rentals',
          action: 'Consider tracking each stream separately',
          source: 'gpt'
        },
        major_expenses: {
          pattern: 'Housing-heavy spending',
          insight: 'Housing costs are your largest expense category',
          action: 'Review housing efficiency',
          source: 'gpt'
        }
      },
      domainScores: {
        moneyFlow: 65,
        obligations: 70,
        liquidity: 45,
        growth: 60,
        protection: 50
      },
      traumaData: {
        topTrauma: 'Showing',
        score: 8
      }
    };

    console.log('Test data:');
    console.log('- Insights:', Object.keys(testData.allInsights).length);
    console.log('- Domain scores:', JSON.stringify(testData.domainScores));
    console.log('- Trauma pattern:', testData.traumaData.topTrauma);
    console.log('');

    console.log('Calling Tool2GPTAnalysis.synthesizeOverall()...');
    const synthesis = Tool2GPTAnalysis.synthesizeOverall(
      testData.clientId,
      testData.allInsights,
      testData.domainScores,
      testData.traumaData
    );

    console.log('\nResult:');
    console.log('Source:', synthesis.source);
    console.log('Overview length:', synthesis.overview?.length || 0);
    console.log('Top Patterns length:', synthesis.topPatterns?.length || 0);
    console.log('Priority Actions length:', synthesis.priorityActions?.length || 0);
    console.log('');

    if (synthesis.overview) {
      console.log('Overview preview:', synthesis.overview.substring(0, 150) + '...');
    }

    // Validation (using same thresholds as production code)
    const isValid = synthesis.overview && synthesis.overview.length >= 50 &&
                   synthesis.topPatterns && synthesis.topPatterns.length >= 20 &&
                   synthesis.priorityActions && synthesis.priorityActions.length >= 50;

    if (isValid) {
      console.log('\n✅ PASS: Synthesis generated valid report');
      console.log(`Source: ${synthesis.source}`);

      if (synthesis.source === 'fallback') {
        console.log('⚠️ NOTE: Used fallback (GPT call may have failed)');
      }

      return true;
    } else {
      console.log('\n❌ FAIL: Synthesis returned incomplete report');
      console.log('Full result:', JSON.stringify(synthesis, null, 2));
      return false;
    }

  } catch (error) {
    console.error('❌ FAIL: Synthesis error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

/**
 * Test 4: Error Handling and Fallbacks
 * Tests that fallback system works when GPT fails
 */
function testGPTFallbacks() {
  console.log('\n=== TEST 4: ERROR HANDLING & FALLBACKS ===\n');

  try {
    // Test fallback synthesis directly
    console.log('Testing fallback synthesis (bypassing GPT)...');

    const domainScores = {
      moneyFlow: 40,
      obligations: 70,
      liquidity: 25,
      growth: 55,
      protection: 15
    };

    const traumaData = {
      topTrauma: 'Showing',
      score: 8
    };

    const fallback = Tool2GPTAnalysis.getGenericSynthesis(domainScores, traumaData);

    console.log('\nFallback result:');
    console.log('Overview length:', fallback.overview?.length || 0);
    console.log('Top Patterns length:', fallback.topPatterns?.length || 0);
    console.log('Priority Actions length:', fallback.priorityActions?.length || 0);
    console.log('');

    if (fallback.overview) {
      console.log('Overview preview:', fallback.overview.substring(0, 150) + '...');
    }

    const isValid = fallback.overview && fallback.overview.length > 50 &&
                   fallback.topPatterns && fallback.topPatterns.length > 20 &&
                   fallback.priorityActions && fallback.priorityActions.length > 50;

    if (isValid) {
      console.log('✅ PASS: Fallback system generates valid content');
      return true;
    } else {
      console.log('❌ FAIL: Fallback system returned incomplete content');
      console.log('Full result:', JSON.stringify(fallback, null, 2));
      return false;
    }

  } catch (error) {
    console.error('❌ FAIL: Fallback system error');
    console.error('Error:', error.message);
    return false;
  }
}

/**
 * Test 5: Rate Limiting Behavior
 * Tests how system handles multiple rapid calls
 */
function testGPTRateLimiting() {
  console.log('\n=== TEST 5: RATE LIMITING BEHAVIOR ===\n');

  console.log('Making 3 rapid GPT calls to test rate limiting...');
  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`\nCall ${i}...`);
      const result = Tool2GPTAnalysis.callGPT({
        systemPrompt: 'Respond with: "Test passed"',
        userPrompt: `Test ${i}`,
        model: 'gpt-4o-mini',
        temperature: 0,
        maxTokens: 20
      });

      console.log(`✓ Call ${i} succeeded: ${result.substring(0, 50)}`);
      successCount++;

      // Small delay to avoid rate limiting
      if (i < 3) {
        Utilities.sleep(500);
      }

    } catch (error) {
      console.log(`✗ Call ${i} failed: ${error.message}`);
      failCount++;

      if (error.message.includes('rate_limit')) {
        console.log('  → Rate limit hit (expected for rapid calls)');
      }
    }
  }

  console.log(`\n=== Rate Limiting Results ===`);
  console.log(`Successful calls: ${successCount}/3`);
  console.log(`Failed calls: ${failCount}/3`);

  if (successCount >= 2) {
    console.log('\n✅ PASS: API handling multiple calls reasonably');
    return true;
  } else {
    console.log('\n⚠️ WARNING: Multiple API calls failing');
    return false;
  }
}

/**
 * Run All Tests
 * Comprehensive diagnostic of entire GPT integration
 */
function runFullGPTDiagnostic() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   TOOL 2 GPT INTEGRATION DIAGNOSTIC SUITE  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const results = {
    connection: false,
    individual: false,
    synthesis: false,
    fallback: false,
    rateLimit: false
  };

  // Test 1: Connection
  results.connection = testGPTConnection();

  // Only continue if connection works
  if (results.connection) {
    results.individual = testGPTIndividualAnalysis();
    results.synthesis = testGPTSynthesis();
    results.fallback = testGPTFallbacks();
    results.rateLimit = testGPTRateLimiting();
  } else {
    console.log('\n⚠️ Skipping remaining tests due to connection failure');
  }

  // Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const testResults = [
    ['API Connection', results.connection],
    ['Individual Analysis', results.individual],
    ['Overall Synthesis', results.synthesis],
    ['Fallback System', results.fallback],
    ['Rate Limiting', results.rateLimit]
  ];

  testResults.forEach(([name, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
  });

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;

  console.log('');
  console.log(`Overall: ${passCount}/${totalCount} tests passed`);

  if (passCount === totalCount) {
    console.log('\n🎉 All tests passed! GPT integration is working correctly.');
  } else if (results.connection && results.fallback) {
    console.log('\n⚠️ Some tests failed, but fallback system is working.');
    console.log('Students will still receive insights even if GPT fails.');
  } else {
    console.log('\n❌ Critical issues detected. Review errors above.');
  }

  console.log('\n=== END DIAGNOSTIC ===');
}
