/**
 * QUICK DEPLOYMENT AUTOMATION - Grouped Manual Triggers
 * Breaks the pipeline into safe chunks that won't timeout
 * Each group runs < 3 minutes to ensure safety
 */

// ============================================
// GROUP 1: FORM PROCESSING (< 30 seconds)
// ============================================
/**
 * Step 1: Process new form responses and normalize scores
 * Safe for 50+ responses
 */
function runStep1_ProcessResponses() {
  console.log('🔄 STEP 1: Processing Form Responses & Normalizing...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Working Sheet');
    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Find first score column to check for processing
    const firstScoreCol = headers.findIndex(h => h && h.includes('_Type_Score')) + 1;
    
    // Count unprocessed rows before
    let unprocessedBefore = 0;
    if (firstScoreCol > 0) {
      for (let row = 4; row <= lastRow; row++) {
        const scoreValue = sheet.getRange(row, firstScoreCol).getValue();
        if (scoreValue === '' || scoreValue === null) {
          unprocessedBefore++;
        }
      }
    }
    
    // Extract scores from form responses
    processUnprocessedControlFearResponses();
    console.log('   ✅ Scores extracted from responses');
    
    // Normalize scores from -3/+3 scale to 0-100 scale
    normalizeControlFearResponseScores();
    console.log('   ✅ Scores normalized to 0-100 scale');
    
    // Verify processing actually happened
    let processedCount = 0;
    if (firstScoreCol > 0) {
      for (let row = 4; row <= lastRow; row++) {
        const scoreValue = sheet.getRange(row, firstScoreCol).getValue();
        if (scoreValue !== '' && scoreValue !== null) {
          processedCount++;
        }
      }
    }
    
    const newlyProcessed = processedCount - (lastRow - 3 - unprocessedBefore);
    
    if (processedCount > 0) {
      // Mark completion only if we actually processed data
      markStepComplete('step1_responses', new Date());
      console.log(`✅ STEP 1 Complete: ${processedCount} rows processed and normalized`);
      console.log('⏭️  Next: Run Step 2 - Calculate Quotients');
      return true;
    } else {
      console.error('❌ Step 1: No scores were extracted. Check form response format.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Step 1 Failed:', error);
    return false;
  }
}

// ============================================
// GROUP 2: CALCULATIONS (< 1 minute)
// ============================================
/**
 * Step 2: Calculate quotients and overall impact
 * Safe for 100+ rows
 */
function runStep2_CalculateQuotients() {
  console.log('🔄 STEP 2: Calculating Quotients...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Working Sheet');
    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Find quotient columns to verify calculation
    const quotientCols = headers.map((h, i) => h && h.includes('_Quotient') ? i + 1 : null).filter(c => c);
    
    // Run quotient calculations
    computeControlFearQuotients();
    
    // Verify quotients were actually calculated
    let quotientCount = 0;
    if (quotientCols.length > 0) {
      for (let row = 4; row <= lastRow; row++) {
        const quotientValue = sheet.getRange(row, quotientCols[0]).getValue();
        if (quotientValue !== '' && quotientValue !== null && !isNaN(quotientValue)) {
          quotientCount++;
        }
      }
    }
    
    if (quotientCount > 0) {
      // Mark completion only if quotients were calculated
      markStepComplete('step2_quotients', new Date());
      console.log(`✅ STEP 2 Complete: Quotients calculated for ${quotientCount} rows`);
      console.log('⏭️  Next: Run Step 3 - GPT Analysis');
      return true;
    } else {
      console.error('❌ Step 2: No quotients were calculated. Check score data.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Step 2 Failed:', error);
    return false;
  }
}

// ============================================
// GROUP 3: GPT ANALYSIS - BATCHED FOR SAFETY
// ============================================
/**
 * IMPORTANT: Based on testing, GPT analysis takes ~54 seconds per row
 * Safe limit: 5 rows per batch (4.5 minutes) to stay under 6-minute timeout
 * 
 * For 10+ rows, you must run multiple batches:
 * - Batch 1: Rows 4-8 (5 rows)
 * - Batch 2: Rows 9-13 (5 rows)
 * - Batch 3: Rows 14-18 (5 rows)
 * etc.
 */

/**
 * Process GPT Analysis for a specific range of rows
 * @param {number} startRow - First row to process (default 4)
 * @param {number} endRow - Last row to process (default startRow + 4)
 */
function runGPTAnalysisBatch(startRow = 4, endRow = null) {
  if (!endRow) {
    endRow = startRow + 4; // Default to 5 rows
  }
  
  console.log(`🔄 GPT Analysis: Processing rows ${startRow} to ${endRow}...`);
  const startTime = new Date();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Working Sheet');
    const lastRow = sheet.getLastRow();
    
    // Validate row range
    if (startRow < 4) startRow = 4;
    if (endRow > lastRow) endRow = lastRow;
    if (startRow > endRow) {
      console.log('   No rows to process in this range');
      return true;
    }
    
    // Temporarily limit GPT processing to this range
    PropertiesService.getScriptProperties().setProperty('GPT_START_ROW', startRow.toString());
    PropertiesService.getScriptProperties().setProperty('GPT_END_ROW', endRow.toString());
    
    // Run all domain analyses for this batch
    console.log(`   Processing ${endRow - startRow + 1} rows...`);
    
    runGPTAnalysisControlFearSpending();
    runGPTAnalysisControlFearHidingMoney();
    runGPTAnalysisControlFearUndervaluingWorth();
    runGPTAnalysisControlFearMisplacedTrust();
    runGPTAnalysisControlFearContractsProtections();
    runGPTAnalysisControlFearOverall();
    
    const elapsed = (new Date() - startTime) / 1000;
    console.log(`   ⏱️ Completed in ${elapsed.toFixed(1)} seconds`);
    
    if (elapsed > 300) {
      console.log('   ⚠️ WARNING: Approaching timeout limit!');
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ GPT Batch Failed:`, error);
    return false;
  } finally {
    // Clean up properties
    PropertiesService.getScriptProperties().deleteProperty('GPT_START_ROW');
    PropertiesService.getScriptProperties().deleteProperty('GPT_END_ROW');
  }
}

/**
 * Step 3A: Process first 5 rows (4-8)
 * Safe execution time: ~4.5 minutes
 */
function runStep3A_GPTBatch1() {
  console.log('🔄 STEP 3A: GPT Analysis Batch 1 (Rows 4-8)...');
  const success = runGPTAnalysisBatch(4, 8);
  
  if (success) {
    markStepComplete('step3a_gpt_batch1', new Date());
    console.log('✅ STEP 3A Complete: First 5 rows analyzed');
    console.log('⏭️  Next: Run Step 3B for rows 9-13 (if they exist)');
  }
  
  return success;
}

/**
 * Step 3B: Process next 5 rows (9-13)
 * Safe execution time: ~4.5 minutes
 */
function runStep3B_GPTBatch2() {
  console.log('🔄 STEP 3B: GPT Analysis Batch 2 (Rows 9-13)...');
  const success = runGPTAnalysisBatch(9, 13);
  
  if (success) {
    markStepComplete('step3b_gpt_batch2', new Date());
    console.log('✅ STEP 3B Complete: Rows 9-13 analyzed');
    console.log('⏭️  Next: Run Step 3C for rows 14+ (if they exist)');
  }
  
  return success;
}

/**
 * Step 3C: Process next 5 rows (14-18)
 * Safe execution time: ~4.5 minutes
 */
function runStep3C_GPTBatch3() {
  console.log('🔄 STEP 3C: GPT Analysis Batch 3 (Rows 14-18)...');
  const success = runGPTAnalysisBatch(14, 18);
  
  if (success) {
    markStepComplete('step3c_gpt_batch3', new Date());
    console.log('✅ STEP 3C Complete: Rows 14-18 analyzed');
    console.log('⏭️  Next: Continue with more batches or Step 4 - Generate Documents');
  }
  
  return success;
}

/**
 * Step 3D: Process rows 19-23
 */
function runStep3D_GPTBatch4() {
  console.log('🔄 STEP 3D: GPT Analysis Batch 4 (Rows 19-23)...');
  const success = runGPTAnalysisBatch(19, 23);
  
  if (success) {
    markStepComplete('step3d_gpt_batch4', new Date());
    console.log('✅ STEP 3D Complete: Rows 19-23 analyzed');
  }
  
  return success;
}

/**
 * Step 3E: Process rows 24-28
 */
function runStep3E_GPTBatch5() {
  console.log('🔄 STEP 3E: GPT Analysis Batch 5 (Rows 24-28)...');
  const success = runGPTAnalysisBatch(24, 28);
  
  if (success) {
    markStepComplete('step3e_gpt_batch5', new Date());
    console.log('✅ STEP 3E Complete: Rows 24-28 analyzed');
  }
  
  return success;
}

/**
 * Step 3F: Process rows 29-33
 */
function runStep3F_GPTBatch6() {
  console.log('🔄 STEP 3F: GPT Analysis Batch 6 (Rows 29-33)...');
  const success = runGPTAnalysisBatch(29, 33);
  
  if (success) {
    markStepComplete('step3f_gpt_batch6', new Date());
    console.log('✅ STEP 3F Complete: Rows 29-33 analyzed');
  }
  
  return success;
}

/**
 * Step 3G: Process rows 34-38
 */
function runStep3G_GPTBatch7() {
  console.log('🔄 STEP 3G: GPT Analysis Batch 7 (Rows 34-38)...');
  const success = runGPTAnalysisBatch(34, 38);
  
  if (success) {
    markStepComplete('step3g_gpt_batch7', new Date());
    console.log('✅ STEP 3G Complete: Rows 34-38 analyzed');
  }
  
  return success;
}

/**
 * Step 3H: Process rows 39-43
 */
function runStep3H_GPTBatch8() {
  console.log('🔄 STEP 3H: GPT Analysis Batch 8 (Rows 39-43)...');
  const success = runGPTAnalysisBatch(39, 43);
  
  if (success) {
    markStepComplete('step3h_gpt_batch8', new Date());
    console.log('✅ STEP 3H Complete: Rows 39-43 analyzed');
  }
  
  return success;
}

/**
 * Step 3I: Process rows 44-48
 */
function runStep3I_GPTBatch9() {
  console.log('🔄 STEP 3I: GPT Analysis Batch 9 (Rows 44-48)...');
  const success = runGPTAnalysisBatch(44, 48);
  
  if (success) {
    markStepComplete('step3i_gpt_batch9', new Date());
    console.log('✅ STEP 3I Complete: Rows 44-48 analyzed');
  }
  
  return success;
}

/**
 * Step 3J: Process rows 49-53
 */
function runStep3J_GPTBatch10() {
  console.log('🔄 STEP 3J: GPT Analysis Batch 10 (Rows 49-53)...');
  const success = runGPTAnalysisBatch(49, 53);
  
  if (success) {
    markStepComplete('step3j_gpt_batch10', new Date());
    console.log('✅ STEP 3J Complete: Rows 49-53 analyzed');
  }
  
  return success;
}

/**
 * Step 3K: Process rows 54-55 (final batch)
 */
function runStep3K_GPTBatch11() {
  console.log('🔄 STEP 3K: GPT Analysis Batch 11 (Rows 54-55)...');
  const success = runGPTAnalysisBatch(54, 55);
  
  if (success) {
    markStepComplete('step3k_gpt_batch11', new Date());
    console.log('✅ STEP 3K Complete: Rows 54-55 analyzed - All GPT batches done!');
  }
  
  return success;
}

/**
 * WARNING: This function will likely timeout with 10+ rows
 * Only use for testing or very small batches
 */
function runStep3A_GPTAnalysisBatch1_OLD() {
  console.log('🔄 STEP 3A: Running GPT Analysis for all domains...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Working Sheet');
    const lastRow = sheet.getLastRow();
    
    // Count rows needing analysis before running
    // Check specifically for the Spending_Analysis column (should be around column 76)
    const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    const spendingAnalysisCol = headers.findIndex(h => h === 'Spending_Analysis') + 1;
    
    let rowsNeedingAnalysis = 0;
    let rowsWithAnalysis = 0;
    
    if (spendingAnalysisCol > 0) {
      for (let row = 4; row <= lastRow; row++) {
        // Check if the first domain (Spending) has analysis
        const hasAnalysis = sheet.getRange(row, spendingAnalysisCol).getValue();
        if (!hasAnalysis || hasAnalysis === '') {
          rowsNeedingAnalysis++;
        } else {
          rowsWithAnalysis++;
        }
      }
    } else {
      // If we can't find the column, assume all rows need analysis
      rowsNeedingAnalysis = lastRow - 3;
      console.log('   ⚠️ Could not find Spending_Analysis column, assuming all rows need processing');
    }
    
    console.log(`   Status: ${rowsWithAnalysis} rows have analysis, ${rowsNeedingAnalysis} need processing`);
    
    if (rowsNeedingAnalysis === 0) {
      console.log('   ℹ️ All rows already have GPT analysis. Nothing to process.');
      markStepComplete('step3a_gpt_batch1', new Date());
      return true;
    }
    
    console.log(`   Found ${rowsNeedingAnalysis} rows needing GPT analysis`);
    
    // Run each domain's GPT analysis
    console.log('   Running Spending domain analysis...');
    runGPTAnalysisControlFearSpending();
    
    console.log('   Running Hiding Money domain analysis...');
    runGPTAnalysisControlFearHidingMoney();
    
    console.log('   Running Undervaluing Worth domain analysis...');
    runGPTAnalysisControlFearUndervaluingWorth();
    
    console.log('   Running Misplaced Trust domain analysis...');
    runGPTAnalysisControlFearMisplacedTrust();
    
    console.log('   Running Contracts & Protections domain analysis...');
    runGPTAnalysisControlFearContractsProtections();
    
    console.log('   Running Overall integration analysis...');
    runGPTAnalysisControlFearOverall();
    
    // Verify that analysis was actually written
    let successCount = 0;
    if (spendingAnalysisCol > 0) {
      for (let row = 4; row <= lastRow; row++) {
        const hasAnalysis = sheet.getRange(row, spendingAnalysisCol).getValue();
        if (hasAnalysis && hasAnalysis !== '') {
          successCount++;
        }
      }
    }
    
    const newlyProcessed = successCount - (lastRow - 3 - rowsNeedingAnalysis);
    
    if (newlyProcessed > 0) {
      console.log(`   ✅ Successfully analyzed ${newlyProcessed} rows`);
      markStepComplete('step3a_gpt_batch1', new Date());
      console.log('✅ STEP 3A Complete: GPT analyses completed');
      console.log('⏭️  Next: Run Step 4 - Generate Documents');
      return true;
    } else {
      console.error(`   ❌ No new GPT analysis was written. Check API keys and errors.`);
      console.log('   Failed rows still need processing.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Step 3A Failed:', error);
    return false;
  }
}

// Note: Steps 3B and 3C removed since GPT functions process all rows at once
// If needed for very large batches, would need to modify the underlying GPT functions

/**
 * Clear GPT analysis columns to force re-processing
 * Use this if the analysis columns have bad/partial data
 */
function clearGPTAnalysisColumns() {
  console.log('🧹 Clearing GPT Analysis columns...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();
  
  // Find all analysis columns
  const analysisCols = [];
  const analysisPatterns = ['_Analysis', '_Summary', '_ReflectionPrompt', 'Overall_'];
  
  headers.forEach((header, index) => {
    if (header && analysisPatterns.some(pattern => header.includes(pattern))) {
      analysisCols.push(index + 1);
      console.log(`   Found column ${index + 1}: ${header}`);
    }
  });
  
  if (analysisCols.length === 0) {
    console.log('   No analysis columns found to clear');
    return;
  }
  
  // Clear the data in these columns
  let clearedCount = 0;
  for (let row = 4; row <= lastRow; row++) {
    analysisCols.forEach(col => {
      const currentValue = sheet.getRange(row, col).getValue();
      if (currentValue) {
        sheet.getRange(row, col).setValue('');
        clearedCount++;
      }
    });
  }
  
  console.log(`✅ Cleared ${clearedCount} cells from analysis columns`);
  console.log('   You can now run Step 3A to process GPT analysis');
}

/**
 * Test function to diagnose GPT analysis issues
 */
function testGPTAnalysis() {
  console.log('🔍 Testing GPT Analysis Functions...\n');
  
  try {
    // Test if functions exist
    console.log('Checking function availability:');
    console.log(`  runGPTAnalysisControlFearSpending: ${typeof runGPTAnalysisControlFearSpending}`);
    console.log(`  runGPTAnalysisControlFearHidingMoney: ${typeof runGPTAnalysisControlFearHidingMoney}`);
    console.log(`  runGPTAnalysisControlFearUndervaluingWorth: ${typeof runGPTAnalysisControlFearUndervaluingWorth}`);
    console.log(`  runGPTAnalysisControlFearMisplacedTrust: ${typeof runGPTAnalysisControlFearMisplacedTrust}`);
    console.log(`  runGPTAnalysisControlFearContractsProtections: ${typeof runGPTAnalysisControlFearContractsProtections}`);
    console.log(`  runGPTAnalysisControlFearOverall: ${typeof runGPTAnalysisControlFearOverall}`);
    
    // Check API key
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
    console.log(`\nAPI Key configured: ${apiKey ? 'Yes' : 'No'}`);
    
    // Check ColumnMapper
    console.log(`\nColumnMapper available: ${typeof ColumnMapper}`);
    
    // Test running just one domain
    console.log('\nTesting Spending domain analysis...');
    runGPTAnalysisControlFearSpending();
    console.log('✅ Spending analysis completed (or at least didn\'t throw error)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// ============================================
// GROUP 4: DOCUMENT GENERATION (< 3 minutes)
// ============================================
/**
 * Step 4: Generate all documents
 * ~10 seconds per document, safe for ~15-20 docs
 */
function runStep4_GenerateDocuments() {
  console.log('🔄 STEP 4: Generating Documents...');
  
  try {
    const configDocs = {
      sheetName: 'Working Sheet',
      headerRow: 2,
      startRow: 4,
      nameColumn: 2,
      docUrlColumn: 101,
      docCreatedAtCol: 102,
      templateDocId: '11dv4K8Ot9W7VjPjxw9vjSPnwn84_uMdv2zA57Wxd7kk',
      outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN'
    };
    
    generateControlFearDocs(configDocs);
    
    markStepComplete('step4_documents', new Date());
    
    console.log('✅ STEP 4 Complete: Documents generated');
    console.log('⏭️  Next: Run Step 5 - Export PDFs and Send Emails');
    
    return true;
  } catch (error) {
    console.error('❌ Step 4 Failed:', error);
    return false;
  }
}

// ============================================
// GROUP 5: PDF & EMAIL (< 3 minutes)
// ============================================
/**
 * Step 5: Export PDFs and send emails
 * ~5 seconds per PDF+email, safe for ~30 emails
 */
function runStep5_ExportAndEmail() {
  console.log('🔄 STEP 5: Exporting PDFs and Sending Emails...');
  
  try {
    const configPdfs = {
      sheetName: 'Working Sheet',
      headerRow: 2,
      startRow: 4,
      nameColumn: 2,
      emailColumn: 3,
      docUrlColumn: 101,
      pdfUrlColumn: 103,
      pdfSentAtCol: 104,
      outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN',
      emailTemplate: {
        subject: 'Your Control Fear Grounding Assessment Report',
        body: `Hi {{FirstName}},\n\n` +
          `Thank you for completing the Control Fear Grounding Assessment.\n\n` +
          `Your personalized report is attached as a PDF. This report explores your patterns around financial fear and control across five key domains:\n\n` +
          `• Spending - How guilt and impulse affect your purchases\n` +
          `• Hiding Money - Your relationship with financial transparency\n` +
          `• Undervaluing Worth - Patterns around pricing and collecting payment\n` +
          `• Misplaced Trust - How you honor or override your intuition\n` +
          `• Contracts & Protections - Your approach to financial safeguards\n\n` +
          `Take time to review your insights and reflection questions. Remember, awareness is the first step toward transformation.\n\n` +
          `If you have any questions, please reach out to Sarah@TruPathMastery.com\n\n` +
          `Here's to your financial freedom!\n` +
          `The TruPath Team`
      }
    };
    
    exportAndEmailControlFearPdfs(configPdfs);
    
    markStepComplete('step5_pdf_email', new Date());
    
    console.log('✅ STEP 5 Complete: PDFs exported and emails sent');
    console.log('🎉 PIPELINE COMPLETE!');
    
    // Clear all step markers for next run
    clearAllStepMarkers();
    
    return true;
  } catch (error) {
    console.error('❌ Step 5 Failed:', error);
    return false;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Mark step completion in properties and update dashboard
 */
function markStepComplete(stepName, timestamp) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(`STEP_${stepName}`, timestamp.toISOString());
  
  // Auto-update dashboard if it exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss.getSheetByName('Pipeline Status')) {
      updateStatusDashboard();
    }
  } catch (e) {
    // Silent fail - dashboard is optional
  }
}

/**
 * Clear all step markers
 */
function clearAllStepMarkers() {
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();
  
  Object.keys(allProps).forEach(key => {
    if (key.startsWith('STEP_')) {
      props.deleteProperty(key);
    }
  });
}

/**
 * Check pipeline status
 */
function checkPipelineStatus() {
  console.log('📊 PIPELINE STATUS CHECK\n');
  
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();
  
  const steps = [
    {id: 'step1_responses', name: 'Process Responses'},
    {id: 'step2_quotients', name: 'Calculate Quotients'},
    {id: 'step3a_gpt_batch1', name: 'GPT Batch 1 (rows 4-8)'},
    {id: 'step3b_gpt_batch2', name: 'GPT Batch 2 (rows 9-13)'},
    {id: 'step3c_gpt_batch3', name: 'GPT Batch 3 (rows 14-18)'},
    {id: 'step3d_gpt_batch4', name: 'GPT Batch 4 (rows 19-23)'},
    {id: 'step3e_gpt_batch5', name: 'GPT Batch 5 (rows 24-28)'},
    {id: 'step3f_gpt_batch6', name: 'GPT Batch 6 (rows 29-33)'},
    {id: 'step3g_gpt_batch7', name: 'GPT Batch 7 (rows 34-38)'},
    {id: 'step3h_gpt_batch8', name: 'GPT Batch 8 (rows 39-43)'},
    {id: 'step3i_gpt_batch9', name: 'GPT Batch 9 (rows 44-48)'},
    {id: 'step3j_gpt_batch10', name: 'GPT Batch 10 (rows 49-53)'},
    {id: 'step3k_gpt_batch11', name: 'GPT Batch 11 (rows 54-55)'},
    {id: 'step4_documents', name: 'Generate Documents'},
    {id: 'step5_pdf_email', name: 'Export PDFs & Email'}
  ];
  
  steps.forEach(step => {
    const completed = allProps[`STEP_${step.id}`];
    if (completed) {
      console.log(`✅ ${step.name}: Completed at ${new Date(completed).toLocaleString()}`);
    } else {
      console.log(`⏳ ${step.name}: Not yet run`);
    }
  });
  
  // Check data status
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const lastRow = sheet.getLastRow();
  
  console.log(`\n📈 Data Status:`);
  console.log(`   Total rows to process: ${lastRow - 3}`);
  
  // Check for pending work
  let pendingDocs = 0;
  let pendingEmails = 0;
  
  for (let row = 4; row <= lastRow; row++) {
    const docUrl = sheet.getRange(row, 101).getValue();
    const pdfSent = sheet.getRange(row, 104).getValue();
    
    if (!docUrl) pendingDocs++;
    if (docUrl && !pdfSent) pendingEmails++;
  }
  
  if (pendingDocs > 0) console.log(`   ⚠️ Pending documents: ${pendingDocs}`);
  if (pendingEmails > 0) console.log(`   ⚠️ Pending emails: ${pendingEmails}`);
  
  if (pendingDocs === 0 && pendingEmails === 0) {
    console.log(`   ✅ All processing complete!`);
  }
}

// ============================================
// QUICK RUN OPTIONS
// ============================================

/**
 * Run entire pipeline (for small batches < 10 rows)
 */
function runCompletePipeline() {
  console.log('🚀 RUNNING COMPLETE PIPELINE\n');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 13) {
    console.log('⚠️ WARNING: More than 10 rows detected.');
    console.log('   Recommend running steps individually to avoid timeout.');
    console.log('   Continue? (If this times out, run steps individually)\n');
  }
  
  // Run all steps
  if (runStep1_ProcessResponses()) {
    if (runStep2_CalculateQuotients()) {
      if (runStep3A_GPTAnalysisBatch1()) {
        if (lastRow > 13) {
          runStep3B_GPTAnalysisBatch2();
        }
        if (runStep4_GenerateDocuments()) {
          runStep5_ExportAndEmail();
        }
      }
    }
  }
}

/**
 * Quick setup for common scenarios
 */
function quickProcessNewSubmission() {
  console.log('🆕 PROCESSING NEW SUBMISSION\n');
  
  // Run steps 1 & 2 (very fast)
  runStep1_ProcessResponses();
  runStep2_CalculateQuotients();
  
  console.log('\n⏸️ Steps 1-2 complete.');
  console.log('   Run GPT analysis steps (3A/3B/3C) when ready.');
}

/**
 * Run all except GPT (fast steps only)
 */
function runAllExceptGPT() {
  console.log('⚡ RUNNING ALL FAST STEPS (No GPT)\n');
  
  runStep1_ProcessResponses();
  runStep2_CalculateQuotients();
  runStep4_GenerateDocuments();
  runStep5_ExportAndEmail();
}