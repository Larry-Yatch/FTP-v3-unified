/**
 * Test Tool 3 GPT Flow
 *
 * Tests the complete GPT analysis flow for Tool 3:
 * - 6 subdomain analyses during form
 * - 3 synthesis calls at submission
 * - Data caching and retrieval
 * - Final data storage in RESPONSES sheet
 *
 * USAGE:
 * 1. Open Google Apps Script Editor
 * 2. Paste this file
 * 3. Run testCompleteFlow() to test entire sequence
 * 4. Run individual test functions to debug specific steps
 * 5. Check execution log for detailed results
 */

// ===================================================================
// TEST CONFIGURATION
// ===================================================================

const TEST_CONFIG = {
  clientId: 'test_gpt_flow_' + new Date().getTime(),
  toolId: 'tool3',

  // Sample form data for one subdomain (all 4 aspects + open response)
  sampleSubdomainData: {
    // Scale responses (-3 to +3)
    subdomain_1_1_belief: -2,
    subdomain_1_1_belief_label: 'Very often - I regularly see myself as fundamentally unworthy or inadequate with money',
    subdomain_1_1_behavior: -1,
    subdomain_1_1_behavior_label: 'Often - I frequently avoid or dismiss positive financial facts about myself',
    subdomain_1_1_feeling: -2,
    subdomain_1_1_feeling_label: 'Very often - Deep shame about my financial self; feel like a failure',
    subdomain_1_1_consequence: -1,
    subdomain_1_1_consequence_label: 'Often - Frequent self-sabotage in financial situations',

    // Open response
    subdomain_1_1_open_response: 'I constantly feel like I\'m not good enough with money. Even when I do something right, like saving $100, I immediately think about how it\'s not enough or how I should have done it sooner. I compare myself to others who seem to have it all together financially, and I just feel inadequate. This makes me avoid looking at my finances because it confirms my worst fears about myself.'
  }
};

// ===================================================================
// FULL FLOW TEST (Run this first)
// ===================================================================

/**
 * Test complete GPT flow from form submission to final report
 * This simulates a real user completing the assessment
 */
function testCompleteFlow() {
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('🧪 TESTING COMPLETE TOOL 3 GPT FLOW');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log(`Client ID: ${TEST_CONFIG.clientId}`);
  Logger.log('');

  const results = {
    subdomainAnalyses: [],
    syntheses: {},
    errors: []
  };

  try {
    // Step 1: Test all 6 subdomain analyses
    Logger.log('STEP 1: Testing 6 subdomain analyses (background calls)');
    Logger.log('─────────────────────────────────────────────────');

    registerTools();
    const tool = ToolRegistry.get(TEST_CONFIG.toolId).module;

    for (let i = 0; i < 6; i++) {
      const subdomain = tool.config.subdomains[i];
      Logger.log(`\n[${i + 1}/6] Testing ${subdomain.key}: ${subdomain.label}`);

      try {
        // Create form data for this subdomain
        const formData = createTestFormData(subdomain.key, i);

        // Trigger GPT analysis (simulates background call during form)
        const result = triggerGroundingGPTAnalysis(
          TEST_CONFIG.toolId,
          TEST_CONFIG.clientId,
          subdomain.key,
          i,
          formData
        );

        if (result.success) {
          Logger.log(`  ✅ Success - Source: ${result.source || result.cached}`);

          // Verify it was cached
          const cached = GroundingGPT.getCachedInsight(
            TEST_CONFIG.toolId,
            TEST_CONFIG.clientId,
            subdomain.key
          );

          if (cached) {
            Logger.log(`  ✅ Cached successfully`);
            Logger.log(`     Pattern: ${cached.pattern?.substring(0, 60)}...`);
            Logger.log(`     Insight: ${cached.insight?.substring(0, 60)}...`);
            Logger.log(`     Action: ${cached.action?.substring(0, 60)}...`);
            Logger.log(`     Root Belief: ${cached.rootBelief?.substring(0, 60)}...`);

            results.subdomainAnalyses.push({
              subdomain: subdomain.key,
              success: true,
              source: cached.source,
              cached: !!cached
            });
          } else {
            Logger.log(`  ⚠️ WARNING: Not found in cache!`);
            results.errors.push(`${subdomain.key}: Not cached`);
          }
        } else {
          Logger.log(`  ❌ Failed: ${result.error}`);
          results.errors.push(`${subdomain.key}: ${result.error}`);
        }

        // Small delay to avoid rate limiting
        Utilities.sleep(500);

      } catch (error) {
        Logger.log(`  ❌ Error: ${error.message}`);
        results.errors.push(`${subdomain.key}: ${error.message}`);
      }
    }

    // Step 2: Test final submission with syntheses
    Logger.log('\n\n');
    Logger.log('STEP 2: Testing final submission (3 synthesis calls)');
    Logger.log('─────────────────────────────────────────────────');

    try {
      // Save all form data to draft storage first
      const allFormData = {};
      for (let i = 0; i < 6; i++) {
        const subdomain = tool.config.subdomains[i];
        const formData = createTestFormData(subdomain.key, i);
        Object.assign(allFormData, formData);
      }

      // Save to PropertiesService (simulates form pages being saved)
      DraftService.saveDraft(TEST_CONFIG.toolId, TEST_CONFIG.clientId, 1, allFormData);

      Logger.log('\n[1/3] Testing Domain 1 Synthesis...');
      const result = tool.processFinalSubmission(TEST_CONFIG.clientId);

      if (result.success) {
        Logger.log('  ✅ Final submission succeeded');

        // Retrieve saved data to verify syntheses
        const saved = DataService.getToolResponse(TEST_CONFIG.clientId, TEST_CONFIG.toolId);

        if (saved) {
          Logger.log('  ✅ Data saved to RESPONSES sheet');

          const data = saved.data;

          // Check domain syntheses
          if (data.syntheses?.domain1) {
            Logger.log('\n  ✅ Domain 1 Synthesis Found:');
            Logger.log(`     Summary: ${data.syntheses.domain1.summary?.substring(0, 80)}...`);
            Logger.log(`     Key Themes: ${data.syntheses.domain1.keyThemes?.length || 0} themes`);
            Logger.log(`     Priority Focus: ${data.syntheses.domain1.priorityFocus?.substring(0, 80)}...`);
            Logger.log(`     Source: ${data.syntheses.domain1.source}`);
            results.syntheses.domain1 = { success: true, source: data.syntheses.domain1.source };
          } else {
            Logger.log('  ⚠️ Domain 1 synthesis missing!');
            results.errors.push('Domain 1 synthesis missing');
          }

          if (data.syntheses?.domain2) {
            Logger.log('\n  ✅ Domain 2 Synthesis Found:');
            Logger.log(`     Summary: ${data.syntheses.domain2.summary?.substring(0, 80)}...`);
            Logger.log(`     Key Themes: ${data.syntheses.domain2.keyThemes?.length || 0} themes`);
            Logger.log(`     Priority Focus: ${data.syntheses.domain2.priorityFocus?.substring(0, 80)}...`);
            Logger.log(`     Source: ${data.syntheses.domain2.source}`);
            results.syntheses.domain2 = { success: true, source: data.syntheses.domain2.source };
          } else {
            Logger.log('  ⚠️ Domain 2 synthesis missing!');
            results.errors.push('Domain 2 synthesis missing');
          }

          if (data.syntheses?.overall) {
            Logger.log('\n  ✅ Overall Synthesis Found:');
            Logger.log(`     Overview: ${data.syntheses.overall.overview?.substring(0, 80)}...`);
            Logger.log(`     Integration: ${data.syntheses.overall.integration?.substring(0, 80)}...`);
            Logger.log(`     Core Work: ${data.syntheses.overall.coreWork?.substring(0, 80)}...`);
            Logger.log(`     Next Steps: ${data.syntheses.overall.nextSteps?.length || 0} steps`);
            Logger.log(`     Source: ${data.syntheses.overall.source}`);
            results.syntheses.overall = { success: true, source: data.syntheses.overall.source };
          } else {
            Logger.log('  ⚠️ Overall synthesis missing!');
            results.errors.push('Overall synthesis missing');
          }

          // Check subdomain insights in saved data
          Logger.log('\n  Checking subdomain insights in saved data:');
          // Check both naming conventions (gptInsights and gpt_insights)
          const insights = data.gptInsights || data.gpt_insights;
          if (insights?.subdomains) {
            const count = Object.keys(insights.subdomains).length;
            Logger.log(`  ✅ Found ${count}/6 subdomain insights in saved data`);

            // Show details of first insight
            const firstKey = Object.keys(insights.subdomains)[0];
            const firstInsight = insights.subdomains[firstKey];
            if (firstInsight) {
              Logger.log(`\n  Sample insight (${firstKey}):`);
              Logger.log(`    Pattern: ${firstInsight.pattern?.substring(0, 60)}...`);
              Logger.log(`    Insight: ${firstInsight.insight?.substring(0, 60)}...`);
              Logger.log(`    Source: ${firstInsight.source}`);
            }
          } else {
            Logger.log('  ⚠️ No subdomain insights found in saved data!');
            Logger.log(`     Checked for: data.gptInsights and data.gpt_insights`);
            Logger.log(`     Available keys: ${Object.keys(data).join(', ')}`);
            results.errors.push('Subdomain insights missing from saved data');
          }

        } else {
          Logger.log('  ❌ Data not found in RESPONSES sheet!');
          results.errors.push('Data not saved to RESPONSES sheet');
        }

      } else {
        Logger.log(`  ❌ Final submission failed: ${result.error}`);
        results.errors.push(`Final submission: ${result.error}`);
      }

    } catch (error) {
      Logger.log(`  ❌ Error in final submission: ${error.message}`);
      Logger.log(error.stack);
      results.errors.push(`Final submission: ${error.message}`);
    }

  } catch (error) {
    Logger.log(`\n❌ FATAL ERROR: ${error.message}`);
    Logger.log(error.stack);
    results.errors.push(`Fatal: ${error.message}`);
  }

  // Print summary
  Logger.log('\n\n');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('📊 TEST SUMMARY');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log(`Subdomain Analyses: ${results.subdomainAnalyses.length}/6 completed`);

  const gptSources = results.subdomainAnalyses.filter(r => r.source === 'gpt' || r.source === 'gpt_retry').length;
  const fallbackSources = results.subdomainAnalyses.filter(r => r.source === 'fallback').length;
  Logger.log(`  - GPT: ${gptSources}`);
  Logger.log(`  - Fallback: ${fallbackSources}`);

  Logger.log(`\nSyntheses:`);
  Logger.log(`  - Domain 1: ${results.syntheses.domain1?.success ? '✅' : '❌'} (${results.syntheses.domain1?.source || 'missing'})`);
  Logger.log(`  - Domain 2: ${results.syntheses.domain2?.success ? '✅' : '❌'} (${results.syntheses.domain2?.source || 'missing'})`);
  Logger.log(`  - Overall: ${results.syntheses.overall?.success ? '✅' : '❌'} (${results.syntheses.overall?.source || 'missing'})`);

  if (results.errors.length > 0) {
    Logger.log(`\n❌ Errors (${results.errors.length}):`);
    results.errors.forEach(err => Logger.log(`  - ${err}`));
  } else {
    Logger.log(`\n✅ ALL TESTS PASSED!`);
  }

  Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return results;
}

// ===================================================================
// INDIVIDUAL COMPONENT TESTS
// ===================================================================

/**
 * Test single subdomain GPT call
 */
function testSingleSubdomainAnalysis() {
  Logger.log('Testing single subdomain analysis...\n');

  registerTools();
  const tool = ToolRegistry.get(TEST_CONFIG.toolId).module;
  const subdomain = tool.config.subdomains[0]; // First subdomain

  const formData = createTestFormData(subdomain.key, 0);

  const result = triggerGroundingGPTAnalysis(
    TEST_CONFIG.toolId,
    TEST_CONFIG.clientId,
    subdomain.key,
    0,
    formData
  );

  Logger.log('Result:', JSON.stringify(result, null, 2));

  // Check cache
  const cached = GroundingGPT.getCachedInsight(
    TEST_CONFIG.toolId,
    TEST_CONFIG.clientId,
    subdomain.key
  );

  Logger.log('\nCached Insight:', JSON.stringify(cached, null, 2));

  return { result, cached };
}

/**
 * Test domain synthesis
 */
function testDomainSynthesis() {
  Logger.log('Testing domain synthesis...\n');

  registerTools();
  const tool = ToolRegistry.get(TEST_CONFIG.toolId).module;

  // Create mock subdomain insights
  const subdomainInsights = {
    subdomain_1_1: {
      pattern: 'Test pattern 1',
      insight: 'Test insight 1',
      action: 'Test action 1',
      rootBelief: 'Test root belief 1'
    },
    subdomain_1_2: {
      pattern: 'Test pattern 2',
      insight: 'Test insight 2',
      action: 'Test action 2',
      rootBelief: 'Test root belief 2'
    },
    subdomain_1_3: {
      pattern: 'Test pattern 3',
      insight: 'Test insight 3',
      action: 'Test action 3',
      rootBelief: 'Test root belief 3'
    }
  };

  const subdomainScores = {
    subdomain_1_1: 65,
    subdomain_1_2: 72,
    subdomain_1_3: 58
  };

  const synthesis = GroundingGPT.synthesizeDomain({
    toolId: TEST_CONFIG.toolId,
    clientId: TEST_CONFIG.clientId,
    domainConfig: {
      key: 'false_self_view',
      name: 'False Self-View',
      description: 'How confusion and lack of clarity create blind spots'
    },
    subdomainInsights: subdomainInsights,
    subdomainScores: subdomainScores,
    domainScore: 65
  });

  Logger.log('Domain Synthesis:', JSON.stringify(synthesis, null, 2));

  return synthesis;
}

/**
 * Test overall synthesis
 */
function testOverallSynthesis() {
  Logger.log('Testing overall synthesis...\n');

  const domainSyntheses = {
    'False Self-View': {
      summary: 'Test domain 1 summary',
      keyThemes: ['Theme 1', 'Theme 2', 'Theme 3'],
      priorityFocus: 'Test priority focus 1',
      source: 'gpt'
    },
    'External Validation': {
      summary: 'Test domain 2 summary',
      keyThemes: ['Theme A', 'Theme B', 'Theme C'],
      priorityFocus: 'Test priority focus 2',
      source: 'gpt'
    }
  };

  const allScores = {
    overallQuotient: 68,
    domainQuotients: {
      domain1: 65,
      domain2: 71
    }
  };

  registerTools();
  const tool = ToolRegistry.get(TEST_CONFIG.toolId).module;

  const synthesis = GroundingGPT.synthesizeOverall({
    toolId: TEST_CONFIG.toolId,
    clientId: TEST_CONFIG.clientId,
    toolConfig: tool.config,
    domainSyntheses: domainSyntheses,
    allScores: allScores
  });

  Logger.log('Overall Synthesis:', JSON.stringify(synthesis, null, 2));

  return synthesis;
}

/**
 * Test cache operations
 */
function testCacheOperations() {
  Logger.log('Testing cache operations...\n');

  const testInsight = {
    pattern: 'Test pattern',
    insight: 'Test insight',
    action: 'Test action',
    rootBelief: 'Test root belief',
    source: 'test',
    timestamp: new Date().toISOString()
  };

  // Test cache storage
  Logger.log('1. Storing insight in cache...');
  GroundingGPT.cacheInsight(
    TEST_CONFIG.toolId,
    TEST_CONFIG.clientId,
    'subdomain_1_1',
    testInsight
  );

  // Test cache retrieval
  Logger.log('2. Retrieving insight from cache...');
  const retrieved = GroundingGPT.getCachedInsight(
    TEST_CONFIG.toolId,
    TEST_CONFIG.clientId,
    'subdomain_1_1'
  );

  Logger.log('Retrieved:', JSON.stringify(retrieved, null, 2));

  // Test cache clearing
  Logger.log('3. Clearing cache...');
  GroundingGPT.clearCache(TEST_CONFIG.toolId, TEST_CONFIG.clientId);

  const afterClear = GroundingGPT.getCachedInsight(
    TEST_CONFIG.toolId,
    TEST_CONFIG.clientId,
    'subdomain_1_1'
  );

  Logger.log('After clear:', afterClear);

  return {
    stored: testInsight,
    retrieved: retrieved,
    afterClear: afterClear
  };
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Create test form data for a subdomain
 */
function createTestFormData(subdomainKey, subdomainIndex) {
  const aspects = ['belief', 'behavior', 'feeling', 'consequence'];
  const formData = {};

  aspects.forEach((aspect, i) => {
    const value = [-2, -1, -2, -1][i]; // Vary the scores
    formData[`${subdomainKey}_${aspect}`] = value;
    formData[`${subdomainKey}_${aspect}_label`] = `Test label for ${aspect} (${value})`;
  });

  formData[`${subdomainKey}_open_response`] =
    `This is a test open response for ${subdomainKey}. ` +
    `It contains enough text to trigger GPT analysis. ` +
    `I'm describing my financial patterns and beliefs here. ` +
    `This response is authentic and provides context for the scale responses above.`;

  formData.client = TEST_CONFIG.clientId;
  formData.page = subdomainIndex + 2;
  formData.subdomain_index = subdomainIndex;
  formData.subdomain_key = subdomainKey;

  return formData;
}

/**
 * Clean up test data
 */
function cleanupTestData() {
  Logger.log('Cleaning up test data...\n');

  // Clear cache
  GroundingGPT.clearCache(TEST_CONFIG.toolId, TEST_CONFIG.clientId);
  Logger.log('✅ Cache cleared');

  // Clear draft storage
  DraftService.clearDraft(TEST_CONFIG.toolId, TEST_CONFIG.clientId);
  Logger.log('✅ Draft storage cleared');

  Logger.log('\nCleanup complete!');
}

// ===================================================================
// DIAGNOSTIC FUNCTIONS
// ===================================================================

/**
 * Check what's in the cache right now
 */
function inspectCache() {
  Logger.log('Inspecting cache for test client...\n');

  registerTools();
  const tool = ToolRegistry.get(TEST_CONFIG.toolId).module;

  tool.config.subdomains.forEach((subdomain, i) => {
    const cached = GroundingGPT.getCachedInsight(
      TEST_CONFIG.toolId,
      TEST_CONFIG.clientId,
      subdomain.key
    );

    if (cached) {
      Logger.log(`✅ ${subdomain.key}:`);
      Logger.log(`   Source: ${cached.source}`);
      Logger.log(`   Pattern: ${cached.pattern?.substring(0, 60)}...`);
    } else {
      Logger.log(`❌ ${subdomain.key}: Not cached`);
    }
  });
}

/**
 * Check what's in RESPONSES sheet
 */
function inspectResponsesSheet() {
  Logger.log('Inspecting RESPONSES sheet for test client...\n');

  const saved = DataService.getToolResponse(TEST_CONFIG.clientId, TEST_CONFIG.toolId);

  if (saved) {
    Logger.log('✅ Data found in RESPONSES sheet');
    Logger.log(`   Timestamp: ${saved.timestamp}`);
    Logger.log(`   Status: ${saved.status}`);
    Logger.log(`   Version: ${saved.version}`);

    const data = saved.data;

    if (data.syntheses) {
      Logger.log('\n   Syntheses:');
      Logger.log(`   - Domain 1: ${data.syntheses.domain1 ? '✅' : '❌'}`);
      Logger.log(`   - Domain 2: ${data.syntheses.domain2 ? '✅' : '❌'}`);
      Logger.log(`   - Overall: ${data.syntheses.overall ? '✅' : '❌'}`);
    }

    if (data.gptInsights?.subdomains) {
      const count = Object.keys(data.gptInsights.subdomains).length;
      Logger.log(`\n   Subdomain insights: ${count}/6`);
    }

    Logger.log('\n   Full data:');
    Logger.log(JSON.stringify(data, null, 2));

  } else {
    Logger.log('❌ No data found in RESPONSES sheet');
  }
}
