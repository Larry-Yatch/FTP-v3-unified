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
