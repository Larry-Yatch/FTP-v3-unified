/**
 * Diagnose Tool 3 Report Data
 *
 * Use this to inspect what data the report is receiving
 * and why domain boxes might be empty
 */

function diagnoseReportData() {
  // Use the test client ID from your test run
  const clientId = 'test_gpt_flow_1763457162235'; // Update this with your test client ID

  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('🔍 DIAGNOSING TOOL 3 REPORT DATA');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log(`Client ID: ${clientId}\n`);

  try {
    // Step 1: Get raw saved data
    Logger.log('STEP 1: Raw Saved Data from RESPONSES Sheet');
    Logger.log('─────────────────────────────────────────────────');

    const savedData = DataService.getToolResponse(clientId, 'tool3');

    if (!savedData) {
      Logger.log('❌ No data found in RESPONSES sheet!');
      return;
    }

    Logger.log('✅ Data found');
    Logger.log(`   Timestamp: ${savedData.timestamp}`);
    Logger.log(`   Status: ${savedData.status}`);
    Logger.log(`   Version: ${savedData.version}`);

    const assessmentData = savedData.data;
    Logger.log(`\n   Available keys in assessmentData:`);
    Object.keys(assessmentData).forEach(key => {
      Logger.log(`   - ${key}`);
    });

    // Step 2: Check syntheses structure
    Logger.log('\n\nSTEP 2: Syntheses Structure');
    Logger.log('─────────────────────────────────────────────────');

    if (assessmentData.syntheses) {
      Logger.log('✅ assessmentData.syntheses exists\n');

      // Domain 1
      if (assessmentData.syntheses.domain1) {
        Logger.log('✅ Domain 1 synthesis found:');
        Logger.log(`   Keys: ${Object.keys(assessmentData.syntheses.domain1).join(', ')}`);
        Logger.log(`   summary: "${assessmentData.syntheses.domain1.summary?.substring(0, 80)}..."`);
        Logger.log(`   keyThemes: [${assessmentData.syntheses.domain1.keyThemes?.length || 0}] ${JSON.stringify(assessmentData.syntheses.domain1.keyThemes)}`);
        Logger.log(`   priorityFocus: "${assessmentData.syntheses.domain1.priorityFocus?.substring(0, 80)}..."`);
        Logger.log(`   source: ${assessmentData.syntheses.domain1.source}`);
      } else {
        Logger.log('❌ Domain 1 synthesis missing!');
      }

      Logger.log('');

      // Domain 2
      if (assessmentData.syntheses.domain2) {
        Logger.log('✅ Domain 2 synthesis found:');
        Logger.log(`   Keys: ${Object.keys(assessmentData.syntheses.domain2).join(', ')}`);
        Logger.log(`   summary: "${assessmentData.syntheses.domain2.summary?.substring(0, 80)}..."`);
        Logger.log(`   keyThemes: [${assessmentData.syntheses.domain2.keyThemes?.length || 0}] ${JSON.stringify(assessmentData.syntheses.domain2.keyThemes)}`);
        Logger.log(`   priorityFocus: "${assessmentData.syntheses.domain2.priorityFocus?.substring(0, 80)}..."`);
        Logger.log(`   source: ${assessmentData.syntheses.domain2.source}`);
      } else {
        Logger.log('❌ Domain 2 synthesis missing!');
      }

    } else {
      Logger.log('❌ assessmentData.syntheses does NOT exist!');
    }

    // Step 3: Simulate Tool3Report reconstruction
    Logger.log('\n\nSTEP 3: Tool3Report.js Data Reconstruction');
    Logger.log('─────────────────────────────────────────────────');

    Logger.log('Simulating Tool3Report.js lines 53-58...\n');

    const gptInsights = {
      subdomains: assessmentData.gpt_insights?.subdomains || {},
      domain1: assessmentData.syntheses?.domain1,
      domain2: assessmentData.syntheses?.domain2,
      overall: assessmentData.syntheses?.overall
    };

    Logger.log('Reconstructed gptInsights object:');
    Logger.log(`   gptInsights.subdomains: ${Object.keys(gptInsights.subdomains).length} items`);
    Logger.log(`   gptInsights.domain1: ${gptInsights.domain1 ? '✅ exists' : '❌ missing'}`);
    Logger.log(`   gptInsights.domain2: ${gptInsights.domain2 ? '✅ exists' : '❌ missing'}`);
    Logger.log(`   gptInsights.overall: ${gptInsights.overall ? '✅ exists' : '❌ missing'}`);

    if (gptInsights.domain1) {
      Logger.log('\n   gptInsights.domain1 details:');
      Logger.log(`      summary exists: ${!!gptInsights.domain1.summary}`);
      Logger.log(`      summary length: ${gptInsights.domain1.summary?.length || 0}`);
      Logger.log(`      summary content: "${gptInsights.domain1.summary?.substring(0, 80)}..."`);
      Logger.log(`      keyThemes exists: ${!!gptInsights.domain1.keyThemes}`);
      Logger.log(`      keyThemes length: ${gptInsights.domain1.keyThemes?.length || 0}`);
      Logger.log(`      priorityFocus exists: ${!!gptInsights.domain1.priorityFocus}`);
      Logger.log(`      priorityFocus length: ${gptInsights.domain1.priorityFocus?.length || 0}`);
      Logger.log(`      priorityFocus content: "${gptInsights.domain1.priorityFocus?.substring(0, 80)}..."`);
    }

    if (gptInsights.domain2) {
      Logger.log('\n   gptInsights.domain2 details:');
      Logger.log(`      summary exists: ${!!gptInsights.domain2.summary}`);
      Logger.log(`      summary length: ${gptInsights.domain2.summary?.length || 0}`);
      Logger.log(`      summary content: "${gptInsights.domain2.summary?.substring(0, 80)}..."`);
      Logger.log(`      keyThemes exists: ${!!gptInsights.domain2.keyThemes}`);
      Logger.log(`      keyThemes length: ${gptInsights.domain2.keyThemes?.length || 0}`);
      Logger.log(`      priorityFocus exists: ${!!gptInsights.domain2.priorityFocus}`);
      Logger.log(`      priorityFocus length: ${gptInsights.domain2.priorityFocus?.length || 0}`);
      Logger.log(`      priorityFocus content: "${gptInsights.domain2.priorityFocus?.substring(0, 80)}..."`);
    }

    // Step 4: Simulate GroundingReport domain rendering
    Logger.log('\n\nSTEP 4: GroundingReport Domain Rendering Simulation');
    Logger.log('─────────────────────────────────────────────────');

    registerTools();
    const toolConfig = ToolRegistry.get('tool3').module.config;

    Logger.log('Simulating GroundingReport.renderDomainSection() check...\n');

    // Domain 1
    const domain1 = {
      name: toolConfig.domain1Name,
      synthesis: gptInsights.domain1
    };

    Logger.log('Domain 1 rendering check:');
    Logger.log(`   domain.synthesis exists: ${!!domain1.synthesis}`);
    if (domain1.synthesis) {
      Logger.log(`   ✅ Will render domain 1 boxes`);
      Logger.log(`   - Summary box: ${domain1.synthesis.summary ? '✅ has content' : '❌ empty'}`);
      Logger.log(`   - Key Themes: ${domain1.synthesis.keyThemes?.length > 0 ? '✅ has ' + domain1.synthesis.keyThemes.length + ' themes' : '❌ empty'}`);
      Logger.log(`   - Priority Focus: ${domain1.synthesis.priorityFocus ? '✅ has content' : '❌ empty'}`);
    } else {
      Logger.log(`   ❌ Will NOT render domain 1 boxes (synthesis is ${domain1.synthesis})`);
    }

    Logger.log('');

    // Domain 2
    const domain2 = {
      name: toolConfig.domain2Name,
      synthesis: gptInsights.domain2
    };

    Logger.log('Domain 2 rendering check:');
    Logger.log(`   domain.synthesis exists: ${!!domain2.synthesis}`);
    if (domain2.synthesis) {
      Logger.log(`   ✅ Will render domain 2 boxes`);
      Logger.log(`   - Summary box: ${domain2.synthesis.summary ? '✅ has content' : '❌ empty'}`);
      Logger.log(`   - Key Themes: ${domain2.synthesis.keyThemes?.length > 0 ? '✅ has ' + domain2.synthesis.keyThemes.length + ' themes' : '❌ empty'}`);
      Logger.log(`   - Priority Focus: ${domain2.synthesis.priorityFocus ? '✅ has content' : '❌ empty'}`);
    } else {
      Logger.log(`   ❌ Will NOT render domain 2 boxes (synthesis is ${domain2.synthesis})`);
    }

    // Step 5: Full synthesis dump
    Logger.log('\n\nSTEP 5: Full Synthesis Data Dump');
    Logger.log('─────────────────────────────────────────────────');
    Logger.log('\nDomain 1 synthesis (full):');
    Logger.log(JSON.stringify(assessmentData.syntheses?.domain1, null, 2));

    Logger.log('\nDomain 2 synthesis (full):');
    Logger.log(JSON.stringify(assessmentData.syntheses?.domain2, null, 2));

    // Final verdict
    Logger.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('🎯 VERDICT');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (gptInsights.domain1?.summary && gptInsights.domain1?.priorityFocus &&
        gptInsights.domain2?.summary && gptInsights.domain2?.priorityFocus) {
      Logger.log('✅ All data is present and should render correctly!');
      Logger.log('\nIf domain boxes are still empty on the web report:');
      Logger.log('   1. Check browser console for JavaScript errors');
      Logger.log('   2. Try viewing page source to see if HTML is generated');
      Logger.log('   3. Check CSS - boxes might be hidden');
      Logger.log('   4. Clear cache and hard refresh (Cmd/Ctrl + Shift + R)');
    } else {
      Logger.log('❌ Data is missing or incomplete!');
      Logger.log('\nMissing fields:');
      if (!gptInsights.domain1?.summary) Logger.log('   - Domain 1 summary');
      if (!gptInsights.domain1?.priorityFocus) Logger.log('   - Domain 1 priorityFocus');
      if (!gptInsights.domain2?.summary) Logger.log('   - Domain 2 summary');
      if (!gptInsights.domain2?.priorityFocus) Logger.log('   - Domain 2 priorityFocus');
    }

    Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    Logger.log(`\n❌ ERROR: ${error.message}`);
    Logger.log(error.stack);
  }
}

/**
 * Alternative: Use your actual completed assessment client ID
 */
function diagnoseRealAssessment() {
  const clientId = prompt('Enter your Client ID (email):');

  if (!clientId) {
    Logger.log('❌ No client ID provided');
    return;
  }

  Logger.log(`\n🔍 Diagnosing real assessment for: ${clientId}\n`);

  const savedData = DataService.getToolResponse(clientId, 'tool3');

  if (!savedData) {
    Logger.log('❌ No Tool 3 data found for this client');
    return;
  }

  Logger.log('✅ Found Tool 3 data');
  Logger.log(JSON.stringify(savedData.data, null, 2));
}
