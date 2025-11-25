/**
 * Tool3ManualTests.js
 * Manual debugging functions for Tool 3 submission issues
 * 
 * HOW TO USE:
 * 1. Open Apps Script editor
 * 2. Select the function you want to run from the dropdown
 * 3. Click Run
 * 4. View → Execution log to see results
 * 
 * Run these in order to diagnose the submission failure:
 * 1. checkDraftData() - Verify draft data exists
 * 2. debugScoring() - Test scoring engine
 * 3. checkGPTCache() - Verify GPT insights cached
 * 4. debugSaveData() - Test save/retrieve cycle
 * 5. manualSubmissionTest() - Full end-to-end test
 */

/**
 * STEP 1: Check if draft data exists for the client
 * This verifies data is being saved during form progression
 */
function checkDraftData() {
  const clientId = '6123LY';
  
  Logger.log('======================================');
  Logger.log('CHECKING DRAFT DATA FOR ' + clientId);
  Logger.log('======================================\n');
  
  try {
    // Check DraftService (PropertiesService)
    const draftData = Tool3.getExistingData(clientId);
    Logger.log('✓ Tool3.getExistingData() returned data');
    Logger.log('Field count: ' + Object.keys(draftData).length);
    Logger.log('\nDraft Data:');
    Logger.log(JSON.stringify(draftData, null, 2));
    
    // Check raw PropertiesService
    const props = PropertiesService.getUserProperties();
    const draftKey = 'tool3_draft_' + clientId;
    const propData = props.getProperty(draftKey);
    
    if (propData) {
      Logger.log('\n✓ PropertiesService has data for key: ' + draftKey);
      Logger.log('Data length: ' + propData.length + ' characters');
    } else {
      Logger.log('\n✗ PropertiesService has NO data for key: ' + draftKey);
    }
    
    // Count expected fields
    const expectedFields = {
      scale_responses: 24,  // 6 subdomains × 4 aspects
      label_fields: 24,     // should be present but filtered out
      open_responses: 6,    // 1 per subdomain
      metadata: 2           // lastPage, lastUpdate
    };
    
    Logger.log('\n--- FIELD ANALYSIS ---');
    const scaleCount = Object.keys(draftData).filter(k => 
      !k.endsWith('_label') && !k.endsWith('_open_response') && 
      !['client', 'page', 'lastPage', 'lastUpdate', 'subdomain_index', 'subdomain_key'].includes(k)
    ).length;
    const labelCount = Object.keys(draftData).filter(k => k.endsWith('_label')).length;
    const openCount = Object.keys(draftData).filter(k => k.endsWith('_open_response')).length;
    
    Logger.log('Scale responses found: ' + scaleCount + ' (expected: ' + expectedFields.scale_responses + ')');
    Logger.log('Label fields found: ' + labelCount + ' (expected: ' + expectedFields.label_fields + ')');
    Logger.log('Open responses found: ' + openCount + ' (expected: ' + expectedFields.open_responses + ')');
    
    if (scaleCount === expectedFields.scale_responses && openCount === expectedFields.open_responses) {
      Logger.log('\n✅ DRAFT DATA IS COMPLETE');
    } else {
      Logger.log('\n⚠️ DRAFT DATA IS INCOMPLETE');
    }
    
  } catch (error) {
    Logger.log('\n✗ ERROR checking draft data:');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}

/**
 * STEP 2: Test the scoring engine with current draft data
 * This verifies all responses are valid and scorable
 */
function debugScoring() {
  const clientId = '6123LY';
  
  Logger.log('======================================');
  Logger.log('TESTING SCORING ENGINE FOR ' + clientId);
  Logger.log('======================================\n');
  
  try {
    // Get draft data
    const allData = Tool3.getExistingData(clientId);
    Logger.log('✓ Retrieved draft data (' + Object.keys(allData).length + ' fields)');
    
    // Extract responses (filters out labels)
    const responses = Tool3.extractResponses(allData);
    Logger.log('✓ Extracted responses (' + Object.keys(responses).length + ' fields after filtering)');
    
    Logger.log('\n--- RESPONSES FOR SCORING ---');
    Object.keys(responses).sort().forEach(function(key) {
      const value = responses[key];
      const type = typeof value;
      Logger.log(key + ': ' + value + ' (type: ' + type + ')');
    });
    
    // Try to score
    Logger.log('\n--- ATTEMPTING TO SCORE ---');
    const scoringResult = GroundingScoring.calculateScores(
      responses,
      Tool3.config.subdomains
    );
    
    Logger.log('✅ SCORING SUCCESS!\n');
    Logger.log('Overall Quotient: ' + scoringResult.overallQuotient);
    Logger.log('Domain 1: ' + scoringResult.domainQuotients.domain1);
    Logger.log('Domain 2: ' + scoringResult.domainQuotients.domain2);
    
    Logger.log('\nSubdomain Quotients:');
    Object.keys(scoringResult.subdomainQuotients).forEach(function(key) {
      Logger.log('  ' + key + ': ' + scoringResult.subdomainQuotients[key]);
    });
    
    Logger.log('\nFull Scoring Result:');
    Logger.log(JSON.stringify(scoringResult, null, 2));
    
  } catch (error) {
    Logger.log('\n✗ SCORING FAILED:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
  }
}

/**
 * STEP 3: Check if GPT insights were cached during form
 * This verifies background GPT calls ran successfully
 */
function checkGPTCache() {
  const clientId = '6123LY';
  const toolId = 'tool3';
  
  Logger.log('======================================');
  Logger.log('CHECKING GPT CACHE FOR ' + clientId);
  Logger.log('======================================\n');
  
  const props = PropertiesService.getUserProperties();
  let foundCount = 0;
  let missingCount = 0;
  
  Tool3.config.subdomains.forEach(function(subdomain) {
    const cacheKey = toolId + '_' + clientId + '_' + subdomain.key + '_insight';
    const cached = props.getProperty(cacheKey);
    
    if (cached) {
      foundCount++;
      const parsed = JSON.parse(cached);
      Logger.log('✓ ' + subdomain.key + ': FOUND');
      Logger.log('  Source: ' + parsed.source);
      Logger.log('  Has pattern: ' + (parsed.pattern ? 'YES' : 'NO'));
      Logger.log('  Has insight: ' + (parsed.insight ? 'YES' : 'NO'));
      Logger.log('  Has action: ' + (parsed.action ? 'YES' : 'NO'));
    } else {
      missingCount++;
      Logger.log('✗ ' + subdomain.key + ': MISSING');
    }
  });
  
  Logger.log('\n--- SUMMARY ---');
  Logger.log('Found: ' + foundCount + ' / 6');
  Logger.log('Missing: ' + missingCount + ' / 6');
  
  if (foundCount === 6) {
    Logger.log('\n✅ ALL GPT INSIGHTS CACHED');
  } else if (foundCount > 0) {
    Logger.log('\n⚠️ PARTIAL GPT CACHE (some subdomains missing)');
  } else {
    Logger.log('\n✗ NO GPT INSIGHTS CACHED');
    Logger.log('\nPossible causes:');
    Logger.log('- Background GPT calls never ran');
    Logger.log('- triggerGroundingGPTAnalysis() function not working');
    Logger.log('- Open responses too short (< 10 chars)');
    Logger.log('- Cache was cleared prematurely');
  }
}

/**
 * STEP 4: Test the complete save and retrieve cycle
 * This verifies DataService can save and retrieve data correctly
 */
function debugSaveData() {
  const clientId = '6123LY';
  
  Logger.log('======================================');
  Logger.log('TESTING SAVE/RETRIEVE CYCLE FOR ' + clientId);
  Logger.log('======================================\n');
  
  try {
    // Get what would be saved
    Logger.log('Step 1: Getting draft data...');
    const allData = Tool3.getExistingData(clientId);
    
    Logger.log('Step 2: Extracting responses...');
    const responses = Tool3.extractResponses(allData);
    
    Logger.log('Step 3: Calculating scores...');
    const scoringResult = GroundingScoring.calculateScores(responses, Tool3.config.subdomains);
    
    Logger.log('Step 4: Collecting GPT insights...');
    const gptInsights = Tool3.collectGPTInsights(clientId);
    
    // Create mock syntheses (to avoid running actual GPT)
    const mockSyntheses = {
      domain1: {
        summary: 'Test synthesis for domain 1',
        keyThemes: 'Theme 1\nTheme 2',
        priorityFocus: 'Test priority focus'
      },
      domain2: {
        summary: 'Test synthesis for domain 2',
        keyThemes: 'Theme 1\nTheme 2',
        priorityFocus: 'Test priority focus'
      },
      overall: {
        overview: 'Test overall overview',
        topPatterns: 'Pattern 1\nPattern 2',
        priorityActions: '1. Action 1\n2. Action 2'
      }
    };
    
    const dataToSave = {
      responses: responses,
      scoring: scoringResult,
      gpt_insights: gptInsights,
      syntheses: mockSyntheses,
      timestamp: new Date().toISOString(),
      tool_version: '1.0.0'
    };
    
    Logger.log('\n--- DATA TO SAVE ---');
    Logger.log('Response count: ' + Object.keys(dataToSave.responses).length);
    Logger.log('Overall score: ' + dataToSave.scoring.overallQuotient);
    Logger.log('GPT insights: ' + Object.keys(dataToSave.gpt_insights.subdomains || {}).length + ' subdomains');
    Logger.log('Syntheses: ' + Object.keys(dataToSave.syntheses).length + ' items');
    
    // Try to save
    Logger.log('\nStep 5: Saving to RESPONSES sheet...');
    DataService.saveToolResponse(clientId, 'tool3', dataToSave);
    Logger.log('✓ Save completed without error');
    
    // Try to retrieve
    Logger.log('\nStep 6: Retrieving from RESPONSES sheet...');
    const retrieved = DataService.getToolResponse(clientId, 'tool3');
    
    if (!retrieved) {
      Logger.log('✗ Retrieved data is NULL or undefined');
      Logger.log('\n⚠️ SAVE/RETRIEVE FAILED - Data was saved but cannot be retrieved');
      return;
    }
    
    Logger.log('✓ Retrieved data successfully');
    
    // Validate structure
    Logger.log('\n--- VALIDATING RETRIEVED DATA ---');
    const checks = {
      'Has responses': !!retrieved.responses,
      'Has scoring': !!retrieved.scoring,
      'Has gpt_insights': !!retrieved.gpt_insights,
      'Has syntheses': !!retrieved.syntheses,
      'Scoring has overallQuotient': !!(retrieved.scoring && retrieved.scoring.overallQuotient),
      'GPT insights has subdomains': !!(retrieved.gpt_insights && retrieved.gpt_insights.subdomains),
      'Syntheses has domain1': !!(retrieved.syntheses && retrieved.syntheses.domain1),
      'Syntheses has domain2': !!(retrieved.syntheses && retrieved.syntheses.domain2),
      'Syntheses has overall': !!(retrieved.syntheses && retrieved.syntheses.overall)
    };
    
    let allPassed = true;
    Object.keys(checks).forEach(function(check) {
      const passed = checks[check];
      Logger.log((passed ? '✓' : '✗') + ' ' + check);
      if (!passed) allPassed = false;
    });
    
    if (allPassed) {
      Logger.log('\n✅ SAVE/RETRIEVE CYCLE SUCCESSFUL');
      Logger.log('Data structure is correct and complete');
    } else {
      Logger.log('\n⚠️ SAVE/RETRIEVE CYCLE INCOMPLETE');
      Logger.log('Some expected fields are missing');
    }
    
    Logger.log('\nFull Retrieved Data:');
    Logger.log(JSON.stringify(retrieved, null, 2));
    
  } catch (error) {
    Logger.log('\n✗ ERROR in save/retrieve cycle:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
  }
}

/**
 * STEP 5: Full end-to-end submission test
 * This runs the complete processFinalSubmission flow
 */
function manualSubmissionTest() {
  const clientId = '6123LY';
  
  Logger.log('==========================================');
  Logger.log('MANUAL SUBMISSION TEST FOR ' + clientId);
  Logger.log('==========================================\n');
  
  try {
    Logger.log('Starting Tool3.processFinalSubmission()...\n');
    
    const result = Tool3.processFinalSubmission(clientId);
    
    Logger.log('\n--- SUBMISSION RESULT ---');
    Logger.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      Logger.log('\n✅ SUBMISSION SUCCESSFUL');
      
      // Try to render report
      Logger.log('\nAttempting to render report...');
      const report = Tool3Report.render(clientId);
      Logger.log('✓ Report rendered successfully');
      
      Logger.log('\n✅ COMPLETE END-TO-END TEST PASSED');
      Logger.log('\nThe submission flow works correctly.');
      Logger.log('The issue may be with the web app flow, not the core logic.');
      
    } else {
      Logger.log('\n✗ SUBMISSION RETURNED SUCCESS=FALSE');
      Logger.log('Error: ' + (result.error || 'Unknown error'));
    }
    
  } catch (error) {
    Logger.log('\n✗ SUBMISSION THREW EXCEPTION:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
    
    Logger.log('\n--- ERROR ANALYSIS ---');
    const errorMsg = error.toString();
    
    if (errorMsg.indexOf('Invalid score') !== -1) {
      Logger.log('→ Scoring validation failure');
      Logger.log('→ Run debugScoring() to find the bad value');
    } else if (errorMsg.indexOf('No data found') !== -1) {
      Logger.log('→ Draft data not found');
      Logger.log('→ Run checkDraftData() to verify data exists');
    } else if (errorMsg.indexOf('timeout') !== -1 || errorMsg.indexOf('exceeded') !== -1) {
      Logger.log('→ Execution timeout (likely GPT synthesis)');
      Logger.log('→ Synthesis calls may be taking too long');
    } else {
      Logger.log('→ Unknown error type');
      Logger.log('→ Check stack trace for clues');
    }
  }
}

/**
 * STEP 6: View recent execution logs
 * This shows what happened in previous executions
 */
function viewRecentLogs() {
  Logger.log('======================================');
  Logger.log('RECENT EXECUTION LOGS');
  Logger.log('======================================\n');
  
  const log = Logger.getLog();
  
  if (log && log.length > 0) {
    Logger.log(log);
  } else {
    Logger.log('No logs available in current session.');
    Logger.log('\nTo see logs from web app execution:');
    Logger.log('1. Go to Apps Script editor');
    Logger.log('2. Click "Executions" in left sidebar');
    Logger.log('3. Find recent execution');
    Logger.log('4. Click to view full logs');
  }
}

/**
 * STEP 7: Check RESPONSES sheet directly
 * This verifies if any data exists in the sheet
 */
function checkResponsesSheet() {
  const clientId = '6123LY';
  const toolId = 'tool3';
  
  Logger.log('======================================');
  Logger.log('CHECKING RESPONSES SHEET');
  Logger.log('======================================\n');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('RESPONSES');
    
    if (!sheet) {
      Logger.log('✗ RESPONSES sheet not found!');
      return;
    }
    
    Logger.log('✓ RESPONSES sheet found');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find column indices
    const clientCol = headers.indexOf('Client_ID');
    const toolCol = headers.indexOf('Tool_ID');
    const dataCol = headers.indexOf('Data');
    const statusCol = headers.indexOf('Status');
    const timestampCol = headers.indexOf('Timestamp');
    
    Logger.log('Sheet has ' + (data.length - 1) + ' total rows');
    
    // Find rows for this client and tool
    const matchingRows = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][clientCol] === clientId && data[i][toolCol] === toolId) {
        matchingRows.push({
          row: i + 1,
          status: data[i][statusCol],
          timestamp: data[i][timestampCol],
          hasData: !!data[i][dataCol]
        });
      }
    }
    
    Logger.log('\n--- MATCHING ROWS ---');
    Logger.log('Found ' + matchingRows.length + ' rows for client ' + clientId + ' / tool ' + toolId);
    
    if (matchingRows.length === 0) {
      Logger.log('\n✗ NO DATA FOUND IN RESPONSES SHEET');
      Logger.log('This confirms data is NOT being saved.');
    } else {
      matchingRows.forEach(function(row) {
        Logger.log('\nRow ' + row.row + ':');
        Logger.log('  Status: ' + row.status);
        Logger.log('  Timestamp: ' + row.timestamp);
        Logger.log('  Has Data: ' + (row.hasData ? 'YES' : 'NO'));
      });
      
      // Get the latest row's data
      const latestRow = matchingRows[matchingRows.length - 1];
      const latestData = data[latestRow.row - 1][dataCol];
      
      if (latestData) {
        Logger.log('\n--- LATEST ROW DATA ---');
        try {
          const parsed = JSON.parse(latestData);
          Logger.log('Data structure:');
          Logger.log('  Has responses: ' + !!parsed.responses);
          Logger.log('  Has scoring: ' + !!parsed.scoring);
          Logger.log('  Has gpt_insights: ' + !!parsed.gpt_insights);
          Logger.log('  Has syntheses: ' + !!parsed.syntheses);
          
          Logger.log('\nFull data:');
          Logger.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          Logger.log('✗ Could not parse JSON data:');
          Logger.log(e.toString());
        }
      }
    }
    
  } catch (error) {
    Logger.log('\n✗ ERROR checking RESPONSES sheet:');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}

/**
 * MANUAL CLEANUP: Clear all cached data for a client
 * Use this to start completely fresh
 */
function clearAllClientData() {
  const clientId = '6123LY';
  const toolId = 'tool3';

  Logger.log('======================================');
  Logger.log('CLEARING ALL CLIENT DATA');
  Logger.log('======================================\n');

  const props = PropertiesService.getUserProperties();

  // Clear draft
  const draftKey = toolId + '_draft_' + clientId;
  props.deleteProperty(draftKey);
  Logger.log('✓ Cleared draft: ' + draftKey);

  // Clear GPT cache (all 6 subdomains)
  Tool3.config.subdomains.forEach(function(subdomain) {
    const cacheKey = toolId + '_' + clientId + '_' + subdomain.key + '_insight';
    props.deleteProperty(cacheKey);
  });
  Logger.log('✓ Cleared GPT cache (6 subdomains)');

  Logger.log('\n✅ ALL CLIENT DATA CLEARED');
  Logger.log('\nClient ' + clientId + ' now has:');
  Logger.log('- No draft data');
  Logger.log('- No GPT cache');
  Logger.log('- RESPONSES sheet data unchanged (clear manually if needed)');
  Logger.log('\nYou can now start Tool 3 completely fresh.');
}

/**
 * RUN ALL TESTS
 * Execute all tests in sequence for comprehensive diagnosis
 */
function runAllTests() {
  Logger.log('##################################################');
  Logger.log('RUNNING ALL DIAGNOSTIC TESTS');
  Logger.log('##################################################\n\n');

  checkDraftData();
  Logger.log('\n\n');

  debugScoring();
  Logger.log('\n\n');

  checkGPTCache();
  Logger.log('\n\n');

  checkResponsesSheet();
  Logger.log('\n\n');

  debugSaveData();
  Logger.log('\n\n');

  manualSubmissionTest();

  Logger.log('\n\n##################################################');
  Logger.log('ALL TESTS COMPLETE');
  Logger.log('##################################################');
}
/**
 * Check what's actually in the RESPONSES sheet for 6123LY / tool3
 */
function checkResponsesSheetData() {
  const clientId = '6123LY';
  const toolId = 'tool3';
  
  Logger.log('============================================');
  Logger.log('CHECKING RESPONSES SHEET - ACTUAL DATA');
  Logger.log('============================================\n');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('RESPONSES');
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Log headers first
    Logger.log('HEADERS:');
    headers.forEach((h, i) => Logger.log(`  ${i}: ${h}`));
    
    // Find column indices
    const clientCol = headers.indexOf('Client_ID');
    const toolCol = headers.indexOf('Tool_ID');
    const dataCol = headers.indexOf('Data');
    const statusCol = headers.indexOf('Status');
    const timestampCol = headers.indexOf('Timestamp');
    const versionCol = headers.indexOf('Version');
    
    Logger.log('\n--- SEARCHING FOR MATCHING ROWS ---');
    Logger.log(`Looking for Client_ID='${clientId}' AND Tool_ID='${toolId}'`);
    
    // Find ALL rows for this client/tool
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row[clientCol] === clientId && row[toolCol] === toolId) {
        Logger.log(`\n========== ROW ${i + 1} ==========`);
        Logger.log('Client_ID: ' + row[clientCol]);
        Logger.log('Tool_ID: ' + row[toolCol]);
        Logger.log('Status: ' + row[statusCol]);
        Logger.log('Timestamp: ' + row[timestampCol]);
        Logger.log('Version: ' + row[versionCol]);
        Logger.log('Data length: ' + (row[dataCol] ? row[dataCol].length : 0) + ' chars');
        
        if (row[dataCol]) {
          try {
            const parsed = JSON.parse(row[dataCol]);
            Logger.log('\nPARSED DATA STRUCTURE:');
            Logger.log('  Keys at top level: ' + Object.keys(parsed).join(', '));
            
            if (parsed.responses) {
              Logger.log('  responses: EXISTS (' + Object.keys(parsed.responses).length + ' fields)');
            } else {
              Logger.log('  responses: MISSING');
            }
            
            if (parsed.scoring) {
              Logger.log('  scoring: EXISTS');
              Logger.log('    - overallQuotient: ' + (parsed.scoring.overallQuotient || 'MISSING'));
              Logger.log('    - domainQuotients: ' + (parsed.scoring.domainQuotients ? 'EXISTS' : 'MISSING'));
            } else {
              Logger.log('  scoring: MISSING');
            }
            
            if (parsed.gpt_insights) {
              Logger.log('  gpt_insights: EXISTS');
              Logger.log('    - subdomains: ' + (parsed.gpt_insights.subdomains ? Object.keys(parsed.gpt_insights.subdomains).length + ' subdomains' : 'MISSING'));
            } else {
              Logger.log('  gpt_insights: MISSING');
            }
            
            if (parsed.syntheses) {
              Logger.log('  syntheses: EXISTS');
              Logger.log('    - domain1: ' + (parsed.syntheses.domain1 ? 'EXISTS' : 'MISSING'));
              Logger.log('    - domain2: ' + (parsed.syntheses.domain2 ? 'EXISTS' : 'MISSING'));
              Logger.log('    - overall: ' + (parsed.syntheses.overall ? 'EXISTS' : 'MISSING'));
            } else {
              Logger.log('  syntheses: MISSING');
            }
            
          } catch (e) {
            Logger.log('ERROR PARSING JSON: ' + e.message);
            Logger.log('First 500 chars of data:');
            Logger.log(row[dataCol].substring(0, 500));
          }
        } else {
          Logger.log('NO DATA IN THIS ROW!');
        }
      }
    }
    
    // Now try DataService.getToolResponse() to see what IT returns
    Logger.log('\n\n========== TESTING DataService.getToolResponse() ==========');
    const retrieved = DataService.getToolResponse(clientId, toolId);
    
    if (!retrieved) {
      Logger.log('❌ DataService.getToolResponse() returned NULL/undefined');
    } else {
      Logger.log('✓ DataService.getToolResponse() returned data');
      Logger.log('\nRETURNED STRUCTURE:');
      Logger.log('  Top-level keys: ' + Object.keys(retrieved).join(', '));
      
      // Check if data is nested
      if (retrieved.data) {
        Logger.log('  data property: EXISTS');
        Logger.log('    Keys in data: ' + Object.keys(retrieved.data).join(', '));
      } else {
        Logger.log('  data property: MISSING');
      }
      
      // Check Tool3Report's validation logic
      Logger.log('\n--- TOOL3REPORT VALIDATION ---');
      const assessmentData = retrieved?.data || retrieved;
      Logger.log('Using assessmentData = retrieved?.data || retrieved');
      Logger.log('  assessmentData exists: ' + !!assessmentData);
      Logger.log('  assessmentData.scoring: ' + !!assessmentData.scoring);
      Logger.log('  assessmentData.gpt_insights: ' + !!assessmentData.gpt_insights);
      Logger.log('  assessmentData.syntheses: ' + !!assessmentData.syntheses);
      
      if (!savedData || !assessmentData.scoring || !assessmentData.gpt_insights || !assessmentData.syntheses) {
        Logger.log('\n❌ WOULD SHOW ERROR PAGE');
      } else {
        Logger.log('\n✅ WOULD SHOW REPORT');
      }
    }
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    Logger.log(error.stack);
  }
}

/**
 * TEST GPT SYNTHESIS: Test if synthesis calls work or return empty
 * This will show us exactly what GroundingGPT.synthesizeDomain() returns
 */
function testGPTSynthesis() {
  const clientId = '6123LY';
  const toolId = 'tool3';

  Logger.log('============================================');
  Logger.log('TESTING GPT SYNTHESIS CALLS');
  Logger.log('============================================\n');

  try {
    // Get real data from the submission
    const allData = Tool3.getExistingData(clientId);
    const responses = Tool3.extractResponses(allData);
    const scoringResult = GroundingScoring.calculateScores(responses, Tool3.config.subdomains);

    Logger.log('✓ Retrieved scoring data');
    Logger.log('Overall Quotient: ' + scoringResult.overallQuotient);
    Logger.log('Domain 1: ' + scoringResult.domainQuotients.domain1);
    Logger.log('Domain 2: ' + scoringResult.domainQuotients.domain2);

    // Collect GPT insights (even if empty)
    const gptInsights = Tool3.collectGPTInsights(clientId);
    Logger.log('\n✓ Collected GPT insights');
    Logger.log('Subdomain insights found: ' + Object.keys(gptInsights.subdomains || {}).length);

    // Test synthesizing Domain 1
    Logger.log('\n--- TESTING DOMAIN 1 SYNTHESIS ---');
    Logger.log('Calling GroundingGPT.synthesizeDomain()...');

    const domain1Config = {
      name: Tool3.config.domains[0].name,
      description: Tool3.config.domains[0].description,
      subdomains: Tool3.config.subdomains.slice(0, 3)
    };

    const domain1Scores = {
      subdomain_1_1: scoringResult.subdomainQuotients.subdomain_1_1,
      subdomain_1_2: scoringResult.subdomainQuotients.subdomain_1_2,
      subdomain_1_3: scoringResult.subdomainQuotients.subdomain_1_3
    };

    const domain1Synthesis = GroundingGPT.synthesizeDomain({
      toolId: toolId,
      clientId: clientId,
      domainConfig: domain1Config,
      domainScores: domain1Scores,
      subdomainInsights: gptInsights.subdomains
    });

    Logger.log('\n=== DOMAIN 1 RESULT ===');
    Logger.log('Type: ' + typeof domain1Synthesis);
    Logger.log('Has summary: ' + !!domain1Synthesis.summary);
    Logger.log('Summary length: ' + (domain1Synthesis.summary ? domain1Synthesis.summary.length : 0));
    Logger.log('Summary content: ' + (domain1Synthesis.summary || '[EMPTY]'));
    Logger.log('Has keyThemes: ' + !!domain1Synthesis.keyThemes);
    Logger.log('keyThemes type: ' + typeof domain1Synthesis.keyThemes);
    Logger.log('keyThemes length: ' + (Array.isArray(domain1Synthesis.keyThemes) ? domain1Synthesis.keyThemes.length : 'N/A'));
    Logger.log('keyThemes content: ' + JSON.stringify(domain1Synthesis.keyThemes));
    Logger.log('Has priorityFocus: ' + !!domain1Synthesis.priorityFocus);
    Logger.log('priorityFocus length: ' + (domain1Synthesis.priorityFocus ? domain1Synthesis.priorityFocus.length : 0));
    Logger.log('priorityFocus content: ' + (domain1Synthesis.priorityFocus || '[EMPTY]'));
    Logger.log('Source: ' + (domain1Synthesis.source || '[MISSING]'));

    if (!domain1Synthesis.summary || domain1Synthesis.summary.trim().length === 0) {
      Logger.log('\n⚠️ DOMAIN 1 SYNTHESIS IS EMPTY!');
    } else {
      Logger.log('\n✅ DOMAIN 1 SYNTHESIS HAS CONTENT');
    }

    // Test synthesizing Overall
    Logger.log('\n--- TESTING OVERALL SYNTHESIS ---');
    Logger.log('Calling GroundingGPT.synthesizeOverall()...');

    const allSyntheses = {
      domain1: domain1Synthesis,
      domain2: { summary: 'Mock domain 2', keyThemes: [], priorityFocus: 'Mock' }
    };

    const overallSynthesis = GroundingGPT.synthesizeOverall({
      toolId: toolId,
      clientId: clientId,
      toolConfig: Tool3.config,
      overallScore: scoringResult.overallQuotient,
      domainScores: scoringResult.domainQuotients,
      domainSyntheses: allSyntheses
    });

    Logger.log('\n=== OVERALL RESULT ===');
    Logger.log('Type: ' + typeof overallSynthesis);
    Logger.log('Has overview: ' + !!overallSynthesis.overview);
    Logger.log('Overview length: ' + (overallSynthesis.overview ? overallSynthesis.overview.length : 0));
    Logger.log('Overview content: ' + (overallSynthesis.overview || '[EMPTY]'));
    Logger.log('Has topPatterns: ' + !!overallSynthesis.topPatterns);
    Logger.log('topPatterns type: ' + typeof overallSynthesis.topPatterns);
    Logger.log('topPatterns length: ' + (Array.isArray(overallSynthesis.topPatterns) ? overallSynthesis.topPatterns.length : 'N/A'));
    Logger.log('topPatterns content: ' + JSON.stringify(overallSynthesis.topPatterns));
    Logger.log('Has priorityActions: ' + !!overallSynthesis.priorityActions);
    Logger.log('priorityActions length: ' + (overallSynthesis.priorityActions ? overallSynthesis.priorityActions.length : 0));
    Logger.log('priorityActions content: ' + (overallSynthesis.priorityActions || '[EMPTY]'));
    Logger.log('Source: ' + (overallSynthesis.source || '[MISSING]'));

    if (!overallSynthesis.overview || overallSynthesis.overview.trim().length === 0) {
      Logger.log('\n⚠️ OVERALL SYNTHESIS IS EMPTY!');
    } else {
      Logger.log('\n✅ OVERALL SYNTHESIS HAS CONTENT');
    }

    // Summary
    Logger.log('\n============================================');
    Logger.log('SYNTHESIS TEST SUMMARY');
    Logger.log('============================================');

    const domain1Empty = !domain1Synthesis.summary || domain1Synthesis.summary.trim().length === 0;
    const overallEmpty = !overallSynthesis.overview || overallSynthesis.overview.trim().length === 0;

    if (domain1Empty && overallEmpty) {
      Logger.log('❌ BOTH syntheses are EMPTY');
      Logger.log('\nPossible causes:');
      Logger.log('1. GPT API is timing out');
      Logger.log('2. GPT API is returning errors');
      Logger.log('3. Fallback content is empty');
      Logger.log('4. Parsing is broken');
    } else if (domain1Empty) {
      Logger.log('⚠️ Domain synthesis is EMPTY, but overall has content');
      Logger.log('Check domain synthesis logic specifically');
    } else if (overallEmpty) {
      Logger.log('⚠️ Overall synthesis is EMPTY, but domain has content');
      Logger.log('Check overall synthesis logic specifically');
    } else {
      Logger.log('✅ BOTH syntheses have content - synthesis calls are WORKING!');
      Logger.log('\nIf production still fails, issue is likely:');
      Logger.log('1. Timing/execution context difference');
      Logger.log('2. Data being cleared after synthesis');
      Logger.log('3. Different code path in production vs test');
    }

  } catch (error) {
    Logger.log('\n❌ ERROR during synthesis test:');
    Logger.log(error.toString());
    Logger.log('\nStack trace:');
    Logger.log(error.stack);
  }
}

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
