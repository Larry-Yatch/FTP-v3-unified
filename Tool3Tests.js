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

      // Add scale questions with realistic scores
      const aspects = ['belief', 'behavior', 'feeling', 'consequence'];
      aspects.forEach(function(aspect, idx) {
        const fieldName = subdomain.key + '_' + aspect;
        mockFormData[fieldName] = (-2 + idx).toString(); // Vary scores: -2, -1, 0, 1
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
