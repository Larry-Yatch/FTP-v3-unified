/**
 * Status Dashboard - Visual tracking of pipeline progress
 * Creates and updates a "Pipeline Status" sheet
 */

/**
 * Check actual pipeline status by examining Working Sheet data
 */
function checkActualPipelineStatus(workingSheet) {
  const status = {};
  
  if (!workingSheet) {
    return status;
  }
  
  const lastRow = workingSheet.getLastRow();
  if (lastRow < 4) {
    return status; // No data rows
  }
  
  const headers = workingSheet.getRange(2, 1, 1, workingSheet.getLastColumn()).getValues()[0];
  const dataRows = lastRow - 3; // Subtract header rows
  
  // Step 1: Check if scores were extracted (look for _Score columns)
  let extractedCount = 0;
  const firstScoreCol = headers.findIndex(h => h && h.includes('_Type_Score')) + 1;
  if (firstScoreCol > 0) {
    for (let row = 4; row <= lastRow; row++) {
      const scoreValue = workingSheet.getRange(row, firstScoreCol).getValue();
      if (scoreValue !== '' && scoreValue !== null) {
        extractedCount++;
      }
    }
  }
  
  status.step1_responses = {
    complete: extractedCount === dataRows && dataRows > 0,
    partial: extractedCount > 0 && extractedCount < dataRows,
    failed: extractedCount === 0 && dataRows > 0,
    details: `${extractedCount}/${dataRows} rows processed`
  };
  
  // Step 2: Check if quotients were calculated
  let quotientCount = 0;
  const quotientCols = headers.map((h, i) => h && h.includes('_Quotient') ? i + 1 : null).filter(c => c);
  if (quotientCols.length > 0) {
    for (let row = 4; row <= lastRow; row++) {
      const quotientValue = workingSheet.getRange(row, quotientCols[0]).getValue();
      if (quotientValue !== '' && quotientValue !== null && !isNaN(quotientValue)) {
        quotientCount++;
      }
    }
  }
  
  status.step2_quotients = {
    complete: quotientCount === dataRows && dataRows > 0,
    partial: quotientCount > 0 && quotientCount < dataRows,
    failed: quotientCount === 0 && extractedCount > 0,
    details: `${quotientCount}/${dataRows} quotients calculated`
  };
  
  // Step 3: Check GPT analysis (columns 76+)
  let gptRows = [];
  for (let row = 4; row <= lastRow; row++) {
    const gptData = workingSheet.getRange(row, 76, 1, 10).getValues()[0];
    if (gptData.some(cell => cell !== '' && cell !== null)) {
      gptRows.push(row);
    }
  }
  
  const gptCount = gptRows.length;
  const batch1Count = gptRows.filter(r => r >= 4 && r <= 13).length;
  const batch2Count = gptRows.filter(r => r >= 14 && r <= 23).length;
  const remainingCount = gptRows.filter(r => r > 23).length;
  
  // Step 3A: Batch 1 (rows 4-13)
  const batch1Total = Math.min(10, dataRows);
  status.step3a_gpt_batch1 = {
    complete: batch1Count === batch1Total && batch1Total > 0,
    partial: batch1Count > 0 && batch1Count < batch1Total,
    failed: batch1Count === 0 && quotientCount > 0,
    details: `${batch1Count}/${batch1Total} rows analyzed`
  };
  
  // Step 3B: Batch 2 (rows 14-23)
  if (dataRows > 10) {
    const batch2Total = Math.min(10, dataRows - 10);
    status.step3b_gpt_batch2 = {
      complete: batch2Count === batch2Total,
      partial: batch2Count > 0 && batch2Count < batch2Total,
      failed: batch2Count === 0 && batch1Count === 10,
      details: `${batch2Count}/${batch2Total} rows analyzed`
    };
  }
  
  // Step 3C: Remaining
  if (dataRows > 20) {
    const remainingTotal = dataRows - 20;
    status.step3c_gpt_remaining = {
      complete: remainingCount === remainingTotal,
      partial: remainingCount > 0 && remainingCount < remainingTotal,
      failed: remainingCount === 0 && batch2Count === 10,
      details: `${remainingCount}/${remainingTotal} rows analyzed`
    };
  }
  
  // Step 4: Check document generation (column 101)
  let docCount = 0;
  for (let row = 4; row <= lastRow; row++) {
    if (workingSheet.getRange(row, 101).getValue()) {
      docCount++;
    }
  }
  
  status.step4_documents = {
    complete: docCount === dataRows && dataRows > 0,
    partial: docCount > 0 && docCount < dataRows,
    failed: docCount === 0 && gptCount > 0,
    details: `${docCount}/${dataRows} documents generated`
  };
  
  // Step 5: Check PDF sending (column 104)
  let pdfCount = 0;
  for (let row = 4; row <= lastRow; row++) {
    if (workingSheet.getRange(row, 104).getValue()) {
      pdfCount++;
    }
  }
  
  status.step5_pdf_email = {
    complete: pdfCount === dataRows && dataRows > 0,
    partial: pdfCount > 0 && pdfCount < dataRows,
    failed: pdfCount === 0 && docCount > 0,
    details: `${pdfCount}/${dataRows} PDFs sent`
  };
  
  return status;
}

/**
 * Initialize the Pipeline Status sheet
 */
function initializeStatusDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check if sheet exists, create if not
  let statusSheet = ss.getSheetByName('Pipeline Status');
  if (!statusSheet) {
    statusSheet = ss.insertSheet('Pipeline Status');
    console.log('✅ Created Pipeline Status sheet');
  } else {
    statusSheet.clear();
    console.log('🔄 Cleared existing Pipeline Status sheet');
  }
  
  // Set up headers and formatting - all rows must have 4 columns
  const headers = [
    ['CONTROL FEAR GROUNDING - PIPELINE STATUS DASHBOARD', '', '', ''],
    ['', '', '', ''],
    ['Pipeline Steps', 'Status', 'Last Completed', 'Details'],
    ['', '', '', ''],
    ['Step 1: Process Responses', '', '', ''],
    ['Step 2: Calculate Quotients', '', '', ''],
    ['Step 3A: GPT Analysis (Rows 4-13)', '', '', ''],
    ['Step 3B: GPT Analysis (Rows 14-23)', '', '', ''],
    ['Step 3C: GPT Analysis (Remaining)', '', '', ''],
    ['Step 4: Generate Documents', '', '', ''],
    ['Step 5: Export PDFs & Email', '', '', ''],
    ['', '', '', ''],
    ['Data Summary', '', '', ''],
    ['Total Rows in Working Sheet:', '', '', ''],
    ['Rows with GPT Analysis:', '', '', ''],
    ['Documents Generated:', '', '', ''],
    ['PDFs Sent:', '', '', ''],
    ['', '', '', ''],
    ['System Information', '', '', ''],
    ['Last Dashboard Update:', '', '', ''],
    ['Email Quota Remaining:', '', '', ''],
    ['Next Recommended Action:', '', '', '']
  ];
  
  // Set the title first (before merging)
  statusSheet.getRange(1, 1).setValue(headers[0][0]);
  
  // Then merge and format
  statusSheet.getRange(1, 1, 1, 4).merge()
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#4a86e8')
    .setFontColor('#ffffff');
  
  // Set the rest of the data (skip first row since it's already set)
  statusSheet.getRange(2, 1, headers.length - 1, 4).setValues(headers.slice(1));
  
  // Format section headers
  statusSheet.getRange(3, 1, 1, 4)
    .setFontWeight('bold')
    .setBackground('#cfe2f3');
    
  statusSheet.getRange(13, 1, 1, 4)
    .setFontWeight('bold')
    .setBackground('#cfe2f3');
    
  statusSheet.getRange(19, 1, 1, 4)
    .setFontWeight('bold')
    .setBackground('#cfe2f3');
  
  // Set column widths
  statusSheet.setColumnWidth(1, 250);
  statusSheet.setColumnWidth(2, 120);
  statusSheet.setColumnWidth(3, 180);
  statusSheet.setColumnWidth(4, 300);
  
  // Add borders
  statusSheet.getRange(3, 1, 9, 4).setBorder(true, true, true, true, true, true);
  statusSheet.getRange(13, 1, 5, 4).setBorder(true, true, true, true, true, true);
  statusSheet.getRange(19, 1, 4, 4).setBorder(true, true, true, true, true, true);
  
  console.log('✅ Status Dashboard initialized');
  
  // Update with current status
  updateStatusDashboard();
}

/**
 * Update the Pipeline Status sheet with current data
 */
function updateStatusDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let statusSheet = ss.getSheetByName('Pipeline Status');
  
  if (!statusSheet) {
    console.log('Pipeline Status sheet not found. Creating...');
    initializeStatusDashboard();
    return;
  }
  
  // Get Working Sheet first
  const workingSheet = ss.getSheetByName('Working Sheet');
  
  // Get current state from Properties
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();
  
  // Define step mappings
  const steps = [
    {row: 5, id: 'step1_responses', name: 'Process Responses'},
    {row: 6, id: 'step2_quotients', name: 'Calculate Quotients'},
    {row: 7, id: 'step3a_gpt_batch1', name: 'GPT Batch 1'},
    {row: 8, id: 'step3b_gpt_batch2', name: 'GPT Batch 2'},
    {row: 9, id: 'step3c_gpt_remaining', name: 'GPT Remaining'},
    {row: 10, id: 'step4_documents', name: 'Generate Documents'},
    {row: 11, id: 'step5_pdf_email', name: 'Export & Email'}
  ];
  
  // Get actual status from Working Sheet data
  const actualStatus = checkActualPipelineStatus(workingSheet);
  
  // Update step statuses based on actual data
  steps.forEach(step => {
    const stepStatus = actualStatus[step.id];
    if (stepStatus && stepStatus.complete) {
      statusSheet.getRange(step.row, 2).setValue('✅ Complete')
        .setFontColor('#0d7813');
      statusSheet.getRange(step.row, 3).setValue(stepStatus.timestamp || '-');
      statusSheet.getRange(step.row, 4).setValue(stepStatus.details);
    } else if (stepStatus && stepStatus.partial) {
      statusSheet.getRange(step.row, 2).setValue('⚠️ Partial')
        .setFontColor('#ff9900');
      statusSheet.getRange(step.row, 3).setValue('-');
      statusSheet.getRange(step.row, 4).setValue(stepStatus.details);
    } else if (stepStatus && stepStatus.failed) {
      statusSheet.getRange(step.row, 2).setValue('❌ Failed')
        .setFontColor('#cc0000');
      statusSheet.getRange(step.row, 3).setValue('-');
      statusSheet.getRange(step.row, 4).setValue(stepStatus.details);
    } else {
      statusSheet.getRange(step.row, 2).setValue('⏳ Pending')
        .setFontColor('#bf9000');
      statusSheet.getRange(step.row, 3).setValue('-');
      statusSheet.getRange(step.row, 4).setValue('Not yet run');
    }
  });
  
  // Get Working Sheet data
  let dataRows = 0; // Initialize here
  
  if (workingSheet) {
    const lastRow = workingSheet.getLastRow();
    dataRows = Math.max(0, lastRow - 3); // Subtract header rows
    
    // Count various completions
    let gptCount = 0;
    let docCount = 0;
    let pdfCount = 0;
    
    if (dataRows > 0) {
      for (let row = 4; row <= lastRow; row++) {
        // Check for GPT analysis (column 76+)
        const gptData = workingSheet.getRange(row, 76, 1, 10).getValues()[0];
        if (gptData.some(cell => cell !== '')) gptCount++;
        
        // Check for document URL (column 101)
        if (workingSheet.getRange(row, 101).getValue()) docCount++;
        
        // Check for PDF sent (column 104)
        if (workingSheet.getRange(row, 104).getValue()) pdfCount++;
      }
    }
    
    // Update data summary
    statusSheet.getRange(14, 2).setValue(dataRows);
    statusSheet.getRange(15, 2).setValue(gptCount);
    statusSheet.getRange(16, 2).setValue(docCount);
    statusSheet.getRange(17, 2).setValue(pdfCount);
    
    // Add progress indicators
    statusSheet.getRange(14, 3).setValue(`${dataRows} total rows`);
    statusSheet.getRange(15, 3).setValue(`${gptCount}/${dataRows} completed`);
    statusSheet.getRange(16, 3).setValue(`${docCount}/${dataRows} generated`);
    statusSheet.getRange(17, 3).setValue(`${pdfCount}/${dataRows} sent`);
    
    // Color code based on completion
    if (gptCount === dataRows && dataRows > 0) {
      statusSheet.getRange(15, 2, 1, 2).setBackground('#d9ead3');
    }
    if (docCount === dataRows && dataRows > 0) {
      statusSheet.getRange(16, 2, 1, 2).setBackground('#d9ead3');
    }
    if (pdfCount === dataRows && dataRows > 0) {
      statusSheet.getRange(17, 2, 1, 2).setBackground('#d9ead3');
    }
  }
  
  // Update system information
  statusSheet.getRange(20, 2).setValue(new Date().toLocaleString());
  
  // Check email quota
  try {
    const emailQuota = MailApp.getRemainingDailyQuota();
    statusSheet.getRange(21, 2).setValue(emailQuota);
    statusSheet.getRange(21, 3).setValue(emailQuota > 0 ? 'Available' : 'Exhausted');
  } catch (e) {
    statusSheet.getRange(21, 2).setValue('Unknown');
  }
  
  // Determine next recommended action
  const nextAction = determineNextAction(allProps, dataRows);
  statusSheet.getRange(22, 2).setValue(nextAction);
  // Merge cells B22:D22 for longer text
  try {
    statusSheet.getRange(22, 2, 1, 3).merge();
  } catch (e) {
    // Cells might already be merged
  }
  
  console.log('✅ Status Dashboard updated');
}

/**
 * Determine the next recommended action based on current state
 */
function determineNextAction(props, dataRows) {
  if (dataRows === 0) {
    return 'No data to process. Waiting for form submissions.';
  }
  
  if (!props['STEP_step1_responses']) {
    return 'Run Step 1: Process Responses';
  }
  if (!props['STEP_step2_quotients']) {
    return 'Run Step 2: Calculate Quotients';
  }
  if (!props['STEP_step3a_gpt_batch1']) {
    return 'Run Step 3A: GPT Analysis (First Batch)';
  }
  if (dataRows > 10 && !props['STEP_step3b_gpt_batch2']) {
    return 'Run Step 3B: GPT Analysis (Second Batch)';
  }
  if (dataRows > 20 && !props['STEP_step3c_gpt_remaining']) {
    return 'Run Step 3C: GPT Analysis (Remaining)';
  }
  if (!props['STEP_step4_documents']) {
    return 'Run Step 4: Generate Documents';
  }
  if (!props['STEP_step5_pdf_email']) {
    return 'Run Step 5: Export PDFs & Send Emails';
  }
  
  return '✅ All steps complete! Pipeline finished.';
}

/**
 * Auto-refresh dashboard after each step
 */
function autoUpdateDashboard() {
  // This function is called at the end of each step
  try {
    updateStatusDashboard();
  } catch (e) {
    console.log('Dashboard update skipped:', e.message);
  }
}

/**
 * Create a simple text status report
 */
function getStatusReport() {
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();
  
  let report = '📊 PIPELINE STATUS REPORT\n';
  report += '========================\n\n';
  
  // Check each step
  const steps = [
    {id: 'step1_responses', name: 'Step 1: Process Responses'},
    {id: 'step2_quotients', name: 'Step 2: Calculate Quotients'},
    {id: 'step3a_gpt_batch1', name: 'Step 3A: GPT Batch 1'},
    {id: 'step3b_gpt_batch2', name: 'Step 3B: GPT Batch 2'},
    {id: 'step3c_gpt_remaining', name: 'Step 3C: GPT Remaining'},
    {id: 'step4_documents', name: 'Step 4: Generate Documents'},
    {id: 'step5_pdf_email', name: 'Step 5: Export PDFs & Email'}
  ];
  
  steps.forEach(step => {
    const completed = allProps[`STEP_${step.id}`];
    if (completed) {
      report += `✅ ${step.name}: ${new Date(completed).toLocaleString()}\n`;
    } else {
      report += `⏳ ${step.name}: Pending\n`;
    }
  });
  
  report += '\n' + determineNextAction(allProps, 0);
  
  return report;
}