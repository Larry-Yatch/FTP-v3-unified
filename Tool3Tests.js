/**
 * Tool3Tests.js
 * Manual test functions for Tool 3 GPT integration
 *
 * HOW TO USE IN GOOGLE APPS SCRIPT:
 * 1. Select the function from the dropdown at the top
 * 2. Click Run
 * 3. View → Execution log to see results
 *
 * AVAILABLE TESTS:
 * - testServerSideGPTTrigger() - Test single subdomain GPT caching
 * - testAllSubdomainsGPT() - Test all 6 subdomains GPT caching
 */

/**
 * TEST SERVER-SIDE GPT TRIGGER
 * Tests the new server-side GPT analysis trigger in savePageData()
 * This verifies that GPT calls are properly cached after form submission
 */
function testServerSideGPTTrigger() {
  const clientId = '6123LY';
  const toolId = 'tool3';

  Logger.log('======================================');
  Logger.log('TESTING SERVER-SIDE GPT TRIGGER');
  Logger.log('======================================\n');

  try {
    // Clear any existing cache for subdomain_1_1
    const subdomainKey = 'subdomain_1_1';
    GroundingGPT.clearCache(toolId, clientId);
    Logger.log('✓ Cleared existing GPT cache\n');

    // Create realistic form data for page 2 (subdomain_1_1)
    const mockFormData = {
      client: clientId,
      page: '2',
      subdomain_index: '0',
      subdomain_key: 'subdomain_1_1',

      // 4 scale questions with scores and labels
      subdomain_1_1_belief: '-2',
      subdomain_1_1_belief_label: 'Agree - I believe financial freedom is for other kinds of people, not someone like me',

      subdomain_1_1_behavior: '-1',
      subdomain_1_1_behavior_label: 'Often - I frequently avoid looking at accounts and/or have money in places I forget about',

      subdomain_1_1_feeling: '-2',
      subdomain_1_1_feeling_label: 'Very often - Shame and unworthiness are heavy, recurring feelings about money',

      subdomain_1_1_consequence: '-1',
      subdomain_1_1_consequence_label: 'Often - I frequently miss opportunities or make poor decisions because of this unworthiness',

      // Open response (must be >= 10 characters)
      subdomain_1_1_open_response: 'I am afraid that if I look at my finances clearly, I will see how badly I have messed things up and confirm that I really am not capable of managing money. I worry I will see debt I cannot handle or realize I have wasted opportunities that I can never get back. It feels safer to stay in the fog than to face the concrete reality of my failures.'
    };

    Logger.log('📋 Mock Form Data:');
    Logger.log('  - Client: ' + clientId);
    Logger.log('  - Page: 2 (subdomain_1_1)');
    Logger.log('  - Belief: ' + mockFormData.subdomain_1_1_belief);
    Logger.log('  - Behavior: ' + mockFormData.subdomain_1_1_behavior);
    Logger.log('  - Feeling: ' + mockFormData.subdomain_1_1_feeling);
    Logger.log('  - Consequence: ' + mockFormData.subdomain_1_1_consequence);
    Logger.log('  - Open Response: ' + mockFormData.subdomain_1_1_open_response.substring(0, 80) + '...');
    Logger.log('');

    // Call Tool3.savePageData() which should trigger GPT analysis
    Logger.log('🚀 Calling Tool3.savePageData()...');
    const saveResult = Tool3.savePageData(clientId, 2, mockFormData);

    if (saveResult && saveResult.success) {
      Logger.log('✓ savePageData() returned success\n');
    } else {
      Logger.log('❌ savePageData() did not return success\n');
    }

    // Wait a moment for GPT call to complete
    Logger.log('⏳ Waiting 5 seconds for GPT analysis to complete...');
    Utilities.sleep(5000);
    Logger.log('');

    // Check if insight was cached
    Logger.log('🔍 Checking GPT cache for ' + subdomainKey + '...');
    const cachedInsight = GroundingGPT.getCachedInsight(toolId, clientId, subdomainKey);

    if (cachedInsight) {
      Logger.log('✅ SUCCESS! GPT insight was cached!');
      Logger.log('\n📊 Cached Insight:');
      Logger.log('  - Source: ' + cachedInsight.source);
      Logger.log('  - Pattern: ' + cachedInsight.pattern);
      Logger.log('  - Insight: ' + cachedInsight.insight);
      Logger.log('  - Action: ' + cachedInsight.action);
      Logger.log('  - Root Belief: ' + cachedInsight.rootBelief);
      Logger.log('  - Timestamp: ' + cachedInsight.timestamp);

      if (cachedInsight.source === 'gpt' || cachedInsight.source === 'gpt_retry') {
        Logger.log('\n🎉 GPT API call succeeded!');
      } else if (cachedInsight.source === 'fallback') {
        Logger.log('\n⚠️ GPT API call failed, fallback used');
        Logger.log('   GPT Error: ' + (cachedInsight.gpt_error || 'Unknown'));
      }

    } else {
      Logger.log('❌ FAILED! No insight found in cache');
      Logger.log('\n🔧 Troubleshooting:');
      Logger.log('1. Check execution logs above for GPT-related errors');
      Logger.log('2. Verify OPENAI_API_KEY is set in Script Properties');
      Logger.log('3. Check if GroundingGPT.analyzeSubdomain() was called');
      Logger.log('4. Look for error messages starting with [TIER 1], [TIER 2], or [TIER 3]');
    }

  } catch (error) {
    Logger.log('\n❌ ERROR during test:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
  }

  Logger.log('\n======================================');
  Logger.log('TEST COMPLETE');
  Logger.log('======================================');
}

/**
 * TEST ALL 6 SUBDOMAINS GPT CACHING
 * Simulates completing all 6 subdomain pages and verifies caching
 */
function testAllSubdomainsGPT() {
  const clientId = '6123LY';
  const toolId = 'tool3';

  Logger.log('======================================');
  Logger.log('TESTING ALL 6 SUBDOMAINS GPT CACHING');
  Logger.log('======================================\n');

  try {
    // Clear all caches
    GroundingGPT.clearCache(toolId, clientId);
    Logger.log('✓ Cleared all GPT caches\n');

    // Test each subdomain (pages 2-7)
    for (let page = 2; page <= 7; page++) {
      const subdomainIndex = page - 2;
      const subdomain = Tool3.config.subdomains[subdomainIndex];

      Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('Testing Page ' + page + ': ' + subdomain.label);
      Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Create mock form data
      const mockFormData = {
        client: clientId,
        page: page.toString(),
        subdomain_index: subdomainIndex.toString(),
        subdomain_key: subdomain.key
      };

      // Add scale questions with realistic scores (avoid 0, not allowed)
      const aspects = ['belief', 'behavior', 'feeling', 'consequence'];
      const scores = [-2, -1, 1, 2]; // Valid scores, skipping 0
      aspects.forEach(function(aspect, idx) {
        const fieldName = subdomain.key + '_' + aspect;
        mockFormData[fieldName] = scores[idx].toString(); // Vary scores: -2, -1, 1, 2
        mockFormData[fieldName + '_label'] = 'Test label for ' + aspect;
      });

      // Add open response
      mockFormData[subdomain.key + '_open_response'] =
        'This is a test response for ' + subdomain.label + '. It contains enough content to trigger GPT analysis and provide meaningful context for the AI to analyze patterns and provide personalized insights.';

      // Save page data (triggers GPT)
      Tool3.savePageData(clientId, page, mockFormData);
      Logger.log('✓ Called savePageData()');

      // Wait for GPT
      Logger.log('⏳ Waiting 3 seconds...');
      Utilities.sleep(3000);

      // Check cache
      const cached = GroundingGPT.getCachedInsight(toolId, clientId, subdomain.key);
      if (cached) {
        Logger.log('✅ Cached successfully (source: ' + cached.source + ')');
      } else {
        Logger.log('❌ NOT cached');
      }
      Logger.log('');
    }

    // Summary
    Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('SUMMARY: Checking all caches');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let successCount = 0;
    let fallbackCount = 0;
    let failCount = 0;

    Tool3.config.subdomains.forEach(function(subdomain) {
      const cached = GroundingGPT.getCachedInsight(toolId, clientId, subdomain.key);
      if (cached) {
        if (cached.source === 'gpt' || cached.source === 'gpt_retry') {
          successCount++;
          Logger.log('✅ ' + subdomain.key + ': GPT success');
        } else if (cached.source === 'fallback') {
          fallbackCount++;
          Logger.log('⚠️  ' + subdomain.key + ': Fallback used');
        }
      } else {
        failCount++;
        Logger.log('❌ ' + subdomain.key + ': NOT cached');
      }
    });

    Logger.log('\n📊 Results:');
    Logger.log('  - GPT Success: ' + successCount + '/6');
    Logger.log('  - Fallback Used: ' + fallbackCount + '/6');
    Logger.log('  - Failed: ' + failCount + '/6');

    if (failCount === 0) {
      Logger.log('\n🎉 ALL SUBDOMAINS CACHED SUCCESSFULLY!');
    } else {
      Logger.log('\n⚠️ Some subdomains failed to cache');
    }

  } catch (error) {
    Logger.log('\n❌ ERROR during test:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
  }

  Logger.log('\n======================================');
  Logger.log('TEST COMPLETE');
  Logger.log('======================================');
}

/**
 * TEST SYNTHESIS CALLS
 * Tests domain and overall synthesis with detailed logging
 * This will reveal why synthesis content is empty
 */
function testSynthesisCalls() {
  const clientId = '6123LY';
  const toolId = 'tool3';

  Logger.log('======================================');
  Logger.log('TESTING SYNTHESIS CALLS');
  Logger.log('======================================\n');

  try {
    // Get existing data
    const allData = Tool3.getExistingData(clientId);

    if (!allData || Object.keys(allData).length === 0) {
      Logger.log('❌ No data found for client. Run testAllSubdomainsGPT() first to populate data.');
      return;
    }

    Logger.log('✓ Found existing data (' + Object.keys(allData).length + ' fields)\n');

    // Extract responses
    const responses = Tool3.extractResponses(allData);
    Logger.log('✓ Extracted ' + Object.keys(responses).length + ' responses\n');

    // Calculate scores
    Logger.log('📊 Calculating scores...');
    const scoringResult = GroundingScoring.calculateScores(
      responses,
      Tool3.config.subdomains
    );
    Logger.log('✓ Scoring complete: Overall = ' + Math.round(scoringResult.overallQuotient) + '\n');

    // Create mock subdomain insights using fallbacks
    // (In real flow these would come from cached GPT calls)
    Logger.log('📋 Creating subdomain insights (using fallbacks for testing)...');
    const subdomainInsights = {};

    Tool3.config.subdomains.forEach(function(subdomain, idx) {
      const aspectScores = {
        belief: -1 - idx % 2,
        behavior: -1 - idx % 2,
        feeling: -1 - idx % 2,
        consequence: -1 - idx % 2
      };

      subdomainInsights[subdomain.key] = GroundingFallbacks.getSubdomainFallback(
        toolId,
        subdomain.key,
        aspectScores,
        {}
      );
    });
    Logger.log('✓ Created insights for all 6 subdomains\n');

    // ============================================================
    // TEST DOMAIN 1 SYNTHESIS
    // ============================================================
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TESTING DOMAIN 1 SYNTHESIS');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const domain1Insights = {};
    domain1Insights[Tool3.config.subdomains[0].key] = subdomainInsights[Tool3.config.subdomains[0].key];
    domain1Insights[Tool3.config.subdomains[1].key] = subdomainInsights[Tool3.config.subdomains[1].key];
    domain1Insights[Tool3.config.subdomains[2].key] = subdomainInsights[Tool3.config.subdomains[2].key];

    const domain1Scores = {};
    domain1Scores[Tool3.config.subdomains[0].key] = scoringResult.subdomainQuotients[Tool3.config.subdomains[0].key];
    domain1Scores[Tool3.config.subdomains[1].key] = scoringResult.subdomainQuotients[Tool3.config.subdomains[1].key];
    domain1Scores[Tool3.config.subdomains[2].key] = scoringResult.subdomainQuotients[Tool3.config.subdomains[2].key];

    const domain1Synthesis = GroundingGPT.synthesizeDomain({
      toolId: toolId,
      clientId: clientId,
      domainConfig: {
        key: 'domain1',
        name: 'False Self-View',
        description: Tool3.config.domain1Description
      },
      subdomainInsights: domain1Insights,
      subdomainScores: domain1Scores,
      domainScore: scoringResult.domainQuotients.domain1,
      subdomainConfigs: Tool3.config.subdomains.slice(0, 3)
    });

    Logger.log('\n📊 Domain 1 Synthesis Result:');
    Logger.log('  - Source: ' + domain1Synthesis.source);
    Logger.log('  - Summary length: ' + (domain1Synthesis.summary ? domain1Synthesis.summary.length : 0));
    Logger.log('  - Key themes count: ' + (domain1Synthesis.keyThemes ? domain1Synthesis.keyThemes.length : 0));
    Logger.log('  - Priority focus length: ' + (domain1Synthesis.priorityFocus ? domain1Synthesis.priorityFocus.length : 0));

    if (domain1Synthesis.source === 'gpt') {
      Logger.log('\n✅ Domain 1 GPT synthesis succeeded!');
      Logger.log('   Summary preview: ' + domain1Synthesis.summary.substring(0, 100) + '...');
    } else {
      Logger.log('\n⚠️ Domain 1 used fallback');
    }

    // ============================================================
    // TEST DOMAIN 2 SYNTHESIS
    // ============================================================
    Logger.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TESTING DOMAIN 2 SYNTHESIS');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const domain2Insights = {};
    domain2Insights[Tool3.config.subdomains[3].key] = subdomainInsights[Tool3.config.subdomains[3].key];
    domain2Insights[Tool3.config.subdomains[4].key] = subdomainInsights[Tool3.config.subdomains[4].key];
    domain2Insights[Tool3.config.subdomains[5].key] = subdomainInsights[Tool3.config.subdomains[5].key];

    const domain2Scores = {};
    domain2Scores[Tool3.config.subdomains[3].key] = scoringResult.subdomainQuotients[Tool3.config.subdomains[3].key];
    domain2Scores[Tool3.config.subdomains[4].key] = scoringResult.subdomainQuotients[Tool3.config.subdomains[4].key];
    domain2Scores[Tool3.config.subdomains[5].key] = scoringResult.subdomainQuotients[Tool3.config.subdomains[5].key];

    const domain2Synthesis = GroundingGPT.synthesizeDomain({
      toolId: toolId,
      clientId: clientId,
      domainConfig: {
        key: 'domain2',
        name: 'External Validation',
        description: Tool3.config.domain2Description
      },
      subdomainInsights: domain2Insights,
      subdomainScores: domain2Scores,
      domainScore: scoringResult.domainQuotients.domain2,
      subdomainConfigs: Tool3.config.subdomains.slice(3, 6)
    });

    Logger.log('\n📊 Domain 2 Synthesis Result:');
    Logger.log('  - Source: ' + domain2Synthesis.source);
    Logger.log('  - Summary length: ' + (domain2Synthesis.summary ? domain2Synthesis.summary.length : 0));
    Logger.log('  - Key themes count: ' + (domain2Synthesis.keyThemes ? domain2Synthesis.keyThemes.length : 0));
    Logger.log('  - Priority focus length: ' + (domain2Synthesis.priorityFocus ? domain2Synthesis.priorityFocus.length : 0));

    if (domain2Synthesis.source === 'gpt') {
      Logger.log('\n✅ Domain 2 GPT synthesis succeeded!');
      Logger.log('   Summary preview: ' + domain2Synthesis.summary.substring(0, 100) + '...');
    } else {
      Logger.log('\n⚠️ Domain 2 used fallback');
    }

    // ============================================================
    // TEST OVERALL SYNTHESIS
    // ============================================================
    Logger.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TESTING OVERALL SYNTHESIS');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const overallSynthesis = GroundingGPT.synthesizeOverall({
      toolId: toolId,
      clientId: clientId,
      toolConfig: Tool3.config,
      domainSyntheses: {
        'False Self-View': domain1Synthesis,
        'External Validation': domain2Synthesis
      },
      allScores: scoringResult
    });

    Logger.log('\n📊 Overall Synthesis Result:');
    Logger.log('  - Source: ' + overallSynthesis.source);
    Logger.log('  - Overview length: ' + (overallSynthesis.overview ? overallSynthesis.overview.length : 0));
    Logger.log('  - Integration length: ' + (overallSynthesis.integration ? overallSynthesis.integration.length : 0));
    Logger.log('  - Core work length: ' + (overallSynthesis.coreWork ? overallSynthesis.coreWork.length : 0));
    Logger.log('  - Next steps count: ' + (overallSynthesis.nextSteps ? overallSynthesis.nextSteps.length : 0));

    if (overallSynthesis.source === 'gpt') {
      Logger.log('\n✅ Overall GPT synthesis succeeded!');
      Logger.log('   Overview preview: ' + overallSynthesis.overview.substring(0, 100) + '...');
    } else {
      Logger.log('\n⚠️ Overall used fallback');
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    Logger.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TEST SUMMARY');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const d1Success = domain1Synthesis.source === 'gpt';
    const d2Success = domain2Synthesis.source === 'gpt';
    const overallSuccess = overallSynthesis.source === 'gpt';

    Logger.log('Results:');
    Logger.log('  - Domain 1: ' + (d1Success ? '✅ GPT' : '⚠️ Fallback'));
    Logger.log('  - Domain 2: ' + (d2Success ? '✅ GPT' : '⚠️ Fallback'));
    Logger.log('  - Overall: ' + (overallSuccess ? '✅ GPT' : '⚠️ Fallback'));

    if (d1Success && d2Success && overallSuccess) {
      Logger.log('\n🎉 ALL SYNTHESES SUCCEEDED!');
    } else {
      Logger.log('\n⚠️ Some syntheses used fallbacks - check logs above for details');
    }

    Logger.log('\n💡 Key logs to review:');
    Logger.log('   - Look for "[SYNTHESIS] Raw GPT response length"');
    Logger.log('   - Look for "[SYNTHESIS] Parsed result"');
    Logger.log('   - Look for any validation failures');

  } catch (error) {
    Logger.log('\n❌ ERROR during test:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
  }

  Logger.log('\n======================================');
  Logger.log('TEST COMPLETE');
  Logger.log('======================================');
}
