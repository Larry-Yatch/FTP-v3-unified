/**
 * Test Subdomain Label Fix
 *
 * Tests that GPT syntheses use user-friendly labels instead of technical keys
 * Uses existing test client data and re-runs only the synthesis calls
 */

function testSubdomainLabels() {
  const clientId = 'test_gpt_flow_1763457162235';  // Update if needed

  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('🧪 TESTING SUBDOMAIN LABEL FIX');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log(`Client ID: ${clientId}\n`);

  try {
    // Register tools
    registerTools();
    const tool = ToolRegistry.get('tool3').module;

    // Get existing data
    const savedData = DataService.getToolResponse(clientId, 'tool3');
    if (!savedData) {
      Logger.log('❌ No data found for this client');
      return;
    }

    const assessmentData = savedData.data;

    Logger.log('✅ Found existing assessment data');
    Logger.log(`   Subdomain insights: ${Object.keys(assessmentData.gpt_insights?.subdomains || {}).length}/6`);
    Logger.log('');

    // Extract what we need for synthesis
    const gptInsights = {
      subdomains: assessmentData.gpt_insights?.subdomains || {}
    };

    const scoringResult = assessmentData.scoring;

    // Re-run syntheses with the fix
    Logger.log('STEP 1: Re-running Domain 1 Synthesis');
    Logger.log('─────────────────────────────────────────────────');

    const domain1Synthesis = GroundingGPT.synthesizeDomain({
      toolId: 'tool3',
      clientId: clientId,
      domainConfig: {
        key: tool.config.domain1Key,
        name: tool.config.domain1Name,
        description: tool.config.domain1Description
      },
      subdomainInsights: tool.extractDomainInsights(gptInsights.subdomains, 0, 3),
      subdomainScores: tool.extractDomainScores(scoringResult.subdomainQuotients, 0, 3),
      domainScore: scoringResult.domainQuotients.domain1,
      subdomainConfigs: tool.config.subdomains.slice(0, 3)  // The fix!
    });

    Logger.log('\n✅ Domain 1 Synthesis Complete\n');
    Logger.log('Summary:');
    Logger.log(domain1Synthesis.summary);
    Logger.log('\nKey Themes:');
    domain1Synthesis.keyThemes.forEach((theme, i) => {
      Logger.log(`  ${i + 1}. ${theme}`);
    });
    Logger.log('\nPriority Focus:');
    Logger.log(domain1Synthesis.priorityFocus);

    // Check for technical keys
    Logger.log('\n\n🔍 Checking for Technical Keys...');
    Logger.log('─────────────────────────────────────────────────');

    const technicalKeyPattern = /subdomain_[12]_[123]/gi;
    const allText = [
      domain1Synthesis.summary,
      ...domain1Synthesis.keyThemes,
      domain1Synthesis.priorityFocus
    ].join(' ');

    const technicalKeys = allText.match(technicalKeyPattern);

    if (technicalKeys && technicalKeys.length > 0) {
      Logger.log(`❌ FAIL: Found ${technicalKeys.length} technical key(s):`);
      technicalKeys.forEach(key => Logger.log(`   - ${key}`));
      Logger.log('\n⚠️ The fix did NOT work - GPT is still using technical keys');
    } else {
      Logger.log('✅ PASS: No technical keys found!');
      Logger.log('✅ GPT is using user-friendly labels');
    }

    // Check for expected labels
    Logger.log('\n\n🔍 Checking for User-Friendly Labels...');
    Logger.log('─────────────────────────────────────────────────');

    const expectedLabels = [
      "I'm Not Worthy of Financial Freedom",
      "I'll Never Have Enough",
      "I Can't See My Financial Reality"
    ];

    let labelsFound = 0;
    expectedLabels.forEach(label => {
      // Check with and without quotes
      if (allText.includes(label) || allText.includes(`"${label}"`)) {
        Logger.log(`✅ Found: "${label}"`);
        labelsFound++;
      } else {
        Logger.log(`⚠️ Not found: "${label}"`);
      }
    });

    Logger.log('');
    if (labelsFound > 0) {
      Logger.log(`✅ Found ${labelsFound}/3 expected labels`);
    } else {
      Logger.log('ℹ️ No specific labels found (this is OK if syntheses are generic)');
    }

    // Run Domain 2 as well
    Logger.log('\n\nSTEP 2: Re-running Domain 2 Synthesis');
    Logger.log('─────────────────────────────────────────────────');

    const domain2Synthesis = GroundingGPT.synthesizeDomain({
      toolId: 'tool3',
      clientId: clientId,
      domainConfig: {
        key: tool.config.domain2Key,
        name: tool.config.domain2Name,
        description: tool.config.domain2Description
      },
      subdomainInsights: tool.extractDomainInsights(gptInsights.subdomains, 3, 6),
      subdomainScores: tool.extractDomainScores(scoringResult.subdomainQuotients, 3, 6),
      domainScore: scoringResult.domainQuotients.domain2,
      subdomainConfigs: tool.config.subdomains.slice(3, 6)  // The fix!
    });

    Logger.log('\n✅ Domain 2 Synthesis Complete\n');
    Logger.log('Summary:');
    Logger.log(domain2Synthesis.summary);
    Logger.log('\nKey Themes:');
    domain2Synthesis.keyThemes.forEach((theme, i) => {
      Logger.log(`  ${i + 1}. ${theme}`);
    });
    Logger.log('\nPriority Focus:');
    Logger.log(domain2Synthesis.priorityFocus);

    // Check Domain 2 for technical keys
    const allText2 = [
      domain2Synthesis.summary,
      ...domain2Synthesis.keyThemes,
      domain2Synthesis.priorityFocus
    ].join(' ');

    const technicalKeys2 = allText2.match(technicalKeyPattern);

    Logger.log('\n\n🔍 Domain 2 Check for Technical Keys...');
    Logger.log('─────────────────────────────────────────────────');

    if (technicalKeys2 && technicalKeys2.length > 0) {
      Logger.log(`❌ FAIL: Found ${technicalKeys2.length} technical key(s) in Domain 2`);
      technicalKeys2.forEach(key => Logger.log(`   - ${key}`));
    } else {
      Logger.log('✅ PASS: No technical keys in Domain 2!');
    }

    // Final verdict
    Logger.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('🎯 FINAL VERDICT');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalTechnicalKeys = (technicalKeys?.length || 0) + (technicalKeys2?.length || 0);

    if (totalTechnicalKeys === 0) {
      Logger.log('✅ SUCCESS! The fix is working correctly.');
      Logger.log('   GPT is now using user-friendly labels instead of technical keys.');
    } else {
      Logger.log(`❌ FAILED! Found ${totalTechnicalKeys} technical key(s) across both domains.`);
      Logger.log('   The fix needs adjustment.');
    }

    Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      domain1: domain1Synthesis,
      domain2: domain2Synthesis,
      technicalKeysFound: totalTechnicalKeys,
      passed: totalTechnicalKeys === 0
    };

  } catch (error) {
    Logger.log(`\n❌ ERROR: ${error.message}`);
    Logger.log(error.stack);
    return { passed: false, error: error.message };
  }
}

/**
 * Quick check - just see if prompts have labels
 */
function inspectPrompts() {
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('🔍 INSPECTING GPT PROMPTS');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  registerTools();
  const tool = ToolRegistry.get('tool3').module;

  // Mock data
  const subdomainConfigs = tool.config.subdomains.slice(0, 3);
  const subdomainScores = {
    subdomain_1_1: 75,
    subdomain_1_2: 75,
    subdomain_1_3: 75
  };
  const domainScore = 75;
  const domainConfig = {
    key: 'domain1',
    name: 'False Self-View',
    description: 'Test description'
  };

  const subdomainInsights = {
    subdomain_1_1: {
      pattern: 'Test pattern 1',
      insight: 'Test insight 1',
      rootBelief: 'Test belief 1'
    },
    subdomain_1_2: {
      pattern: 'Test pattern 2',
      insight: 'Test insight 2',
      rootBelief: 'Test belief 2'
    },
    subdomain_1_3: {
      pattern: 'Test pattern 3',
      insight: 'Test insight 3',
      rootBelief: 'Test belief 3'
    }
  };

  // Build prompts
  const systemPrompt = GroundingGPT.buildDomainSynthesisPrompt(
    domainConfig,
    subdomainScores,
    domainScore,
    subdomainConfigs
  );

  const userPrompt = GroundingGPT.buildDomainUserPrompt(
    subdomainInsights,
    subdomainConfigs
  );

  Logger.log('SYSTEM PROMPT:');
  Logger.log('═════════════════════════════════════════════════');
  Logger.log(systemPrompt);

  Logger.log('\n\nUSER PROMPT:');
  Logger.log('═════════════════════════════════════════════════');
  Logger.log(userPrompt);

  // Check for labels
  Logger.log('\n\n🔍 CHECKING FOR LABELS IN PROMPTS:');
  Logger.log('═════════════════════════════════════════════════');

  const hasLabelsInSystem = systemPrompt.includes('"I\'m Not Worthy of Financial Freedom"');
  const hasLabelsInUser = userPrompt.includes('"I\'m Not Worthy of Financial Freedom"');
  const hasTechnicalKeysInUser = userPrompt.includes('subdomain_1_1:');

  Logger.log(`System prompt has labels: ${hasLabelsInSystem ? '✅ YES' : '❌ NO'}`);
  Logger.log(`User prompt has labels: ${hasLabelsInUser ? '✅ YES' : '❌ NO'}`);
  Logger.log(`User prompt has technical keys: ${hasTechnicalKeysInUser ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);

  if (hasLabelsInSystem && hasLabelsInUser && !hasTechnicalKeysInUser) {
    Logger.log('\n✅ Prompts look correct! Labels are being used.');
  } else {
    Logger.log('\n⚠️ Issue with prompts - check above');
  }

  Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
