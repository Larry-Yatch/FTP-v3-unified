/**
 * Tool5Tests.js
 * Server-side test functions for Tool 5 (Love & Connection)
 * Run these from Apps Script Editor to test GPT integration
 */

/**
 * TEST SERVER-SIDE GPT TRIGGER
 * Tests that background GPT calls execute and cache properly after page save
 * Run this from Apps Script Editor to verify the fix
 */
function testTool5ServerSideGPTTrigger() {
  const clientId = '6123LY';
  const subdomainIndex = 0; // Test first subdomain (subdomain_1_1)

  Logger.log('======================================');
  Logger.log('TESTING TOOL 5 SERVER-SIDE GPT TRIGGER');
  Logger.log('======================================\n');

  Logger.log('Setup:');
  Logger.log('  - Client: ' + clientId);
  Logger.log('  - Subdomain Index: ' + subdomainIndex);
  Logger.log('  - Tool: tool5\n');

  try {
    // Get subdomain config
    const subdomain = Tool5.config.subdomains[subdomainIndex];
    const page = subdomainIndex + 2; // Page 2 for first subdomain

    Logger.log('Subdomain:');
    Logger.log('  - Key: ' + subdomain.key);
    Logger.log('  - Label: ' + subdomain.label);
    Logger.log('  - Page: ' + page + '\n');

    // Clear any existing cache for this subdomain
    const cacheKey = 'tool5_' + clientId + '_' + subdomain.key + '_insight';
    PropertiesService.getUserProperties().deleteProperty(cacheKey);
    Logger.log('✓ Cleared existing cache\n');

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
      mockFormData[fieldName] = scores[idx].toString();
      mockFormData[fieldName + '_label'] = 'Test label for ' + aspect;
    });

    // Add open response
    mockFormData[subdomain.key + '_open_response'] =
      'This is a test response for ' + subdomain.label + '. It contains enough content to trigger GPT analysis and provide meaningful context for the AI to analyze patterns and provide personalized insights.';

    Logger.log('Form Data:');
    Logger.log('  - Belief: ' + mockFormData[subdomain.key + '_belief']);
    Logger.log('  - Behavior: ' + mockFormData[subdomain.key + '_behavior']);
    Logger.log('  - Feeling: ' + mockFormData[subdomain.key + '_feeling']);
    Logger.log('  - Consequence: ' + mockFormData[subdomain.key + '_consequence']);
    Logger.log('  - Open response length: ' + mockFormData[subdomain.key + '_open_response'].length + ' chars\n');

    // Save page data (triggers GPT)
    Logger.log('🚀 Calling Tool5.savePageData() (should trigger GPT)...\n');
    const startTime = new Date().getTime();
    const result = Tool5.savePageData(clientId, page, mockFormData);
    const elapsed = new Date().getTime() - startTime;

    Logger.log('✓ savePageData() completed in ' + elapsed + 'ms\n');

    if (!result.success) {
      Logger.log('❌ savePageData() failed');
      return;
    }

    // Check if GPT insight was cached
    Logger.log('🔍 Checking cache for GPT insight...\n');
    const cached = PropertiesService.getUserProperties().getProperty(cacheKey);

    if (cached) {
      const insight = JSON.parse(cached);
      Logger.log('✅ SUCCESS! GPT insight cached:');
      Logger.log('  - Pattern: ' + insight.pattern);
      Logger.log('  - Insight: ' + insight.insight);
      Logger.log('  - Action: ' + insight.action);
      Logger.log('  - Root Belief: ' + insight.rootBelief);
      Logger.log('  - Source: ' + insight.source);
      Logger.log('  - Timestamp: ' + insight.timestamp + '\n');

      if (insight.source !== 'gpt') {
        Logger.log('⚠️ Warning: Insight source is "' + insight.source + '" (expected "gpt")');
      }
    } else {
      Logger.log('❌ FAILED: No GPT insight found in cache');
      Logger.log('   This means the server-side trigger did not execute or failed silently\n');
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
 * TEST ALL SUBDOMAINS GPT
 * Saves data for all 6 subdomains to populate GPT cache
 * Run this before testTool5SynthesisCalls() to ensure all subdomain insights exist
 */
function testTool5AllSubdomainsGPT() {
  const clientId = '6123LY';

  Logger.log('======================================');
  Logger.log('POPULATING ALL TOOL 5 SUBDOMAIN INSIGHTS');
  Logger.log('======================================\n');

  try {
    // Process each subdomain (pages 2-7)
    for (let subdomainIndex = 0; subdomainIndex < 6; subdomainIndex++) {
      const subdomain = Tool5.config.subdomains[subdomainIndex];
      const page = subdomainIndex + 2;

      Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('Subdomain ' + (subdomainIndex + 1) + '/6: ' + subdomain.label);
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
        mockFormData[fieldName] = scores[idx].toString();
        mockFormData[fieldName + '_label'] = 'Test label for ' + aspect;
      });

      // Add open response
      mockFormData[subdomain.key + '_open_response'] =
        'This is a test response for ' + subdomain.label + '. It contains enough content to trigger GPT analysis and provide meaningful context for the AI to analyze patterns and provide personalized insights.';

      // Save page data (triggers GPT)
      Logger.log('Saving page ' + page + '...');
      const result = Tool5.savePageData(clientId, page, mockFormData);

      if (result.success) {
        // Check cache
        const cacheKey = 'tool5_' + clientId + '_' + subdomain.key + '_insight';
        const cached = PropertiesService.getUserProperties().getProperty(cacheKey);

        if (cached) {
          const insight = JSON.parse(cached);
          Logger.log('✅ Cached: ' + insight.source);
        } else {
          Logger.log('⚠️ No cache found');
        }
      } else {
        Logger.log('❌ Save failed');
      }

      Logger.log('');
    }

    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('ALL SUBDOMAINS PROCESSED');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    Logger.log('✅ All 6 subdomain insights should now be cached');
    Logger.log('   Run testTool5SynthesisCalls() next to test synthesis\n');

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
 * TEST GPT RESPONSE VARIATION
 * Compare GPT responses for healthy (+2) vs problematic (-2) scores
 * This validates score-based tone differentiation for Tool 5
 */
function testTool5GPTScoreResponse() {
  const clientId = '6123LY';
  const subdomain = Tool5.config.subdomains[0]; // Test first subdomain

  Logger.log('======================================');
  Logger.log('TESTING TOOL 5 GPT SCORE RESPONSE VARIATION');
  Logger.log('======================================\n');

  try {
    // Clear cache
    const cacheKey = 'tool5_' + clientId + '_' + subdomain.key + '_insight';
    PropertiesService.getUserProperties().deleteProperty(cacheKey);

    // ============================================================
    // TEST 1: PROBLEMATIC SCORES (-2, -2, -2, -2)
    // ============================================================
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TEST 1: PROBLEMATIC SCORES');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const problematicScores = {
      belief: -2,
      behavior: -2,
      feeling: -2,
      consequence: -2
    };

    Logger.log('Scores: All -2 (highly problematic)');
    Logger.log('Normalized: ~83 (problematic)\n');

    const problematicResponses = {};
    Object.keys(problematicScores).forEach(function(aspect) {
      const fieldName = subdomain.key + '_' + aspect;
      problematicResponses[fieldName] = problematicScores[aspect];
      problematicResponses[fieldName + '_label'] = 'Test label';
    });
    problematicResponses[subdomain.key + '_open_response'] =
      'I struggle with using money to show love in relationships. I often give compulsively or sacrifice my own needs to maintain connections, and this creates anxiety and resentment.';

    Logger.log('Calling GPT with problematic scores...\n');
    const problematicInsight = GroundingGPT.analyzeSubdomain({
      toolId: 'tool5',
      clientId: clientId + '_problematic',
      subdomainKey: subdomain.key,
      subdomainConfig: subdomain,
      responses: problematicResponses,
      aspectScores: problematicScores,
      previousInsights: {}
    });

    Logger.log('📋 Problematic Score Response:');
    Logger.log('  - Pattern: ' + problematicInsight.pattern);
    Logger.log('  - Insight: ' + problematicInsight.insight);
    Logger.log('  - Action: ' + problematicInsight.action);
    Logger.log('  - Root Belief: ' + problematicInsight.rootBelief);
    Logger.log('  - Source: ' + problematicInsight.source + '\n\n');

    // Clear cache for next test
    PropertiesService.getUserProperties().deleteProperty(cacheKey);
    Utilities.sleep(1000); // Brief pause between API calls

    // ============================================================
    // TEST 2: HEALTHY SCORES (+2, +2, +2, +2)
    // ============================================================
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TEST 2: HEALTHY SCORES');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const healthyScores = {
      belief: 2,
      behavior: 2,
      feeling: 2,
      consequence: 2
    };

    Logger.log('Scores: All +2 (very healthy)');
    Logger.log('Normalized: ~17 (healthy)\n');

    const healthyResponses = {};
    Object.keys(healthyScores).forEach(function(aspect) {
      const fieldName = subdomain.key + '_' + aspect;
      healthyResponses[fieldName] = healthyScores[aspect];
      healthyResponses[fieldName + '_label'] = 'Test label';
    });
    healthyResponses[subdomain.key + '_open_response'] =
      'I use money thoughtfully in relationships, showing care without sacrificing my own needs. I maintain healthy boundaries and feel confident in how I express love financially.';

    Logger.log('Calling GPT with healthy scores...\n');
    const healthyInsight = GroundingGPT.analyzeSubdomain({
      toolId: 'tool5',
      clientId: clientId + '_healthy',
      subdomainKey: subdomain.key,
      subdomainConfig: subdomain,
      responses: healthyResponses,
      aspectScores: healthyScores,
      previousInsights: {}
    });

    Logger.log('📋 Healthy Score Response:');
    Logger.log('  - Pattern: ' + healthyInsight.pattern);
    Logger.log('  - Insight: ' + healthyInsight.insight);
    Logger.log('  - Action: ' + healthyInsight.action);
    Logger.log('  - Root Belief: ' + healthyInsight.rootBelief);
    Logger.log('  - Source: ' + healthyInsight.source + '\n\n');

    // ============================================================
    // COMPARISON
    // ============================================================
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('COMPARISON');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    Logger.log('Does GPT differentiate between problematic and healthy scores?\n');

    Logger.log('Problematic (-2):');
    Logger.log('  Pattern: ' + problematicInsight.pattern.substring(0, 80) + '...');
    Logger.log('  Tone: ' + (problematicInsight.insight.match(/struggle|stuck|sacrifice|disconnect|anxiet/i) ? 'Addressing problems ✓' : 'Not addressing problems ✗') + '\n');

    Logger.log('Healthy (+2):');
    Logger.log('  Pattern: ' + healthyInsight.pattern.substring(0, 80) + '...');
    Logger.log('  Tone: ' + (healthyInsight.insight.match(/strength|positive|healthy|resource|solid|empowers/i) ? 'Recognizing strengths ✓' : 'Not recognizing strengths ✗') + '\n');

    if (problematicInsight.source === 'gpt' && healthyInsight.source === 'gpt') {
      Logger.log('✅ Both insights from GPT - comparison valid');
    } else {
      Logger.log('⚠️ One or both used fallback - comparison may not be valid');
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
