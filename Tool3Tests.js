/**
 * Tool3Tests.js
 * Server-side test functions for Tool 3 (Identity & Validation)
 * Run these from Apps Script Editor to test GPT integration
 */

/**
 * TEST SERVER-SIDE GPT TRIGGER
 * Tests that background GPT calls execute and cache properly after page save
 * Run this from Apps Script Editor to verify the fix
 */
function testServerSideGPTTrigger() {
  const clientId = '6123LY';
  const subdomainIndex = 0; // Test first subdomain (subdomain_1_1)

  Logger.log('======================================');
  Logger.log('TESTING SERVER-SIDE GPT TRIGGER');
  Logger.log('======================================\n');

  Logger.log('Setup:');
  Logger.log('  - Client: ' + clientId);
  Logger.log('  - Subdomain Index: ' + subdomainIndex);
  Logger.log('  - Tool: tool3\n');

  try {
    // Get subdomain config
    const subdomain = Tool3.config.subdomains[subdomainIndex];
    const page = subdomainIndex + 2; // Page 2 for first subdomain

    Logger.log('Subdomain:');
    Logger.log('  - Key: ' + subdomain.key);
    Logger.log('  - Label: ' + subdomain.label);
    Logger.log('  - Page: ' + page + '\n');

    // Clear any existing cache for this subdomain
    const cacheKey = 'tool3_' + clientId + '_' + subdomain.key + '_insight';
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
      mockFormData[fieldName] = scores[idx].toString(); // Vary scores: -2, -1, 1, 2
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
    Logger.log('🚀 Calling Tool3.savePageData() (should trigger GPT)...\n');
    const startTime = new Date().getTime();
    const result = Tool3.savePageData(mockFormData);
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
 * Run this before testSynthesisCalls() to ensure all subdomain insights exist
 */
function testAllSubdomainsGPT() {
  const clientId = '6123LY';

  Logger.log('======================================');
  Logger.log('POPULATING ALL SUBDOMAIN INSIGHTS');
  Logger.log('======================================\n');

  try {
    // Process each subdomain (pages 2-7)
    for (let subdomainIndex = 0; subdomainIndex < 6; subdomainIndex++) {
      const subdomain = Tool3.config.subdomains[subdomainIndex];
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
        mockFormData[fieldName] = scores[idx].toString(); // Vary scores: -2, -1, 1, 2
        mockFormData[fieldName + '_label'] = 'Test label for ' + aspect;
      });

      // Add open response
      mockFormData[subdomain.key + '_open_response'] =
        'This is a test response for ' + subdomain.label + '. It contains enough content to trigger GPT analysis and provide meaningful context for the AI to analyze patterns and provide personalized insights.';

      // Save page data (triggers GPT)
      Logger.log('Saving page ' + page + '...');
      const result = Tool3.savePageData(clientId, page, mockFormData);

      if (result.success) {
        // Check cache
        const cacheKey = 'tool3_' + clientId + '_' + subdomain.key + '_insight';
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
    Logger.log('   Run testSynthesisCalls() next to test synthesis\n');

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

/**
 * TEST GPT RESPONSE VARIATION
 * Compare GPT responses for healthy (+2) vs problematic (-2) scores
 * This will reveal if GPT properly differentiates score severity
 */
function testGPTScoreResponse() {
  const clientId = '6123LY';
  const subdomain = Tool3.config.subdomains[0]; // Test first subdomain

  Logger.log('======================================');
  Logger.log('TESTING GPT SCORE RESPONSE VARIATION');
  Logger.log('======================================\n');

  try {
    // Clear cache
    const cacheKey = 'tool3_' + clientId + '_' + subdomain.key + '_insight';
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
      'I struggle with feeling worthy of financial success. I often feel like I don\'t deserve good things and sabotage opportunities when they come my way. This creates a lot of anxiety and keeps me stuck in negative patterns.';

    Logger.log('Calling GPT with problematic scores...\n');
    const problematicInsight = GroundingGPT.analyzeSubdomain({
      toolId: 'tool3',
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
      'I feel worthy of financial success and recognize my value. I embrace opportunities when they come and trust in my ability to handle them well. This creates confidence and keeps me moving forward in positive ways.';

    Logger.log('Calling GPT with healthy scores...\n');
    const healthyInsight = GroundingGPT.analyzeSubdomain({
      toolId: 'tool3',
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
    Logger.log('  Tone: ' + (problematicInsight.insight.match(/struggle|stuck|sabotage|disconnect/i) ? 'Addressing problems ✓' : 'Not addressing problems ✗') + '\n');

    Logger.log('Healthy (+2):');
    Logger.log('  Pattern: ' + healthyInsight.pattern.substring(0, 80) + '...');
    Logger.log('  Tone: ' + (healthyInsight.insight.match(/strength|positive|healthy|resource/i) ? 'Recognizing strengths ✓' : 'Not recognizing strengths ✗') + '\n');

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
