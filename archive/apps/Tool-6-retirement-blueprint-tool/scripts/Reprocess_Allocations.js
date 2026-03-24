/**
 * REPROCESS ALLOCATIONS WITH FIXES
 * Created to apply employer match and other fixes to existing data
 */

/**
 * Add Reprocess menu to the spreadsheet
 * Call this from main onOpen() function
 */
function addReprocessMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 Reprocess')
    .addItem('Quick Test (Current Row - No Doc/Email)', 'quickTestReprocess')
    .addItem('Test with Options...', 'testReprocessWithPrompt')
    .addSeparator()
    .addItem('Reprocess Current Row (No Doc)', 'reprocessCurrentRow')
    .addItem('Reprocess with Document (No Email)', 'testReprocessSingleRow')
    .addSeparator()
    .addItem('Bulk Reprocess All Rows...', 'reprocessAllRows')
    .addItem('Regenerate All Documents...', 'regenerateAllDocuments')
    .addToUi();
}

/**
 * Helper function to sum object values
 */
function sumValues(obj) {
  return Object.values(obj).reduce((sum, val) => sum + (Number(val) || 0), 0);
}

/**
 * Generate document without sending email
 * This wraps the document generation to suppress email sending
 */
function generateDocumentNoEmail(rowNum) {
  try {
    console.log(`Generating document for row ${rowNum} (email disabled)...`);
    
    // Store original email function
    const originalSendEmail = MailApp.sendEmail;
    
    // Override to prevent sending
    MailApp.sendEmail = function(options) {
      console.log(`Email suppressed - would have sent to: ${options.to || 'unknown'}`);
      return; // Do nothing
    };
    
    try {
      // Generate document (email will be suppressed)
      const docUrl = generateDocumentBrandedForRow(rowNum);
      return docUrl;
    } finally {
      // Restore original function
      MailApp.sendEmail = originalSendEmail;
    }
    
  } catch (error) {
    console.error(`Error generating document: ${error.toString()}`);
    throw error;
  }
}

/**
 * Helper function to get all _actual vehicle keys from headers
 */
function listAllVehicleActualKeys() {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const headers = ws.getRange(2, 1, 1, ws.getLastColumn()).getValues()[0];
  
  const actualKeys = [];
  headers.forEach(header => {
    if (header && header.toString().endsWith('_actual')) {
      actualKeys.push(header);
    }
  });
  
  return actualKeys;
}

/**
 * Reprocess a single row's allocation with the fixed code
 * @param {number} rowNum - The row number to reprocess
 * @param {Object} options - Options object with generateDoc and sendEmail flags
 * @param {boolean} options.generateDoc - Whether to generate document (default: false)
 * @param {boolean} options.sendEmail - Whether to send email with document (default: false)
 */
function reprocessSingleRow(rowNum, options = {}) {
  const { generateDoc = false, sendEmail = false } = options;
  try {
    // Validate rowNum
    if (!rowNum || isNaN(rowNum) || rowNum < 3) {
      throw new Error(`Invalid row number: ${rowNum}. Must be 3 or greater.`);
    }
    
    console.log(`========== REPROCESSING ROW ${rowNum} ==========`);
    
    const { sheet: ws, hdr } = initWS();
    const rowData = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
    
    // Get identifying info
    const fullName = getValue(hdr, rowData, HEADERS.FULL_NAME);
    const profileId = getValue(hdr, rowData, HEADERS.PROFILE_ID);
    const email = getValue(hdr, rowData, HEADERS.EMAIL);
    
    console.log(`Processing: ${fullName} (${email})`);
    console.log(`Profile: ${profileId}`);
    
    // Store original values for comparison
    const originalMatch = getValue(hdr, rowData, HEADERS.RETIREMENT_401K_MATCH_TRADITIONAL_IDEAL) || 0;
    
    // Run the allocation engine with fixes
    console.log('Running allocation engine...');
    const results = runUniversalEngine(rowNum);
    
    if (!results) {
      throw new Error('Allocation engine returned no results');
    }
    
    // The rest of handlePhase2 logic writes the results
    // We need to replicate that writing logic here
    console.log('Writing results to sheet...');
    writeAllocationResults(ws, hdr, rowNum, results);
    
    // Check what changed
    const newRowData = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
    const newMatch = getValue(hdr, newRowData, HEADERS.RETIREMENT_401K_MATCH_TRADITIONAL_IDEAL) || 0;
    
    if (originalMatch != newMatch) {
      console.log(`✅ 401(k) Match changed: $${originalMatch} → $${newMatch}`);
    }
    
    // Trigger Phase 3 - Future Value Calculations
    // IMPORTANT: Only run Phase 3 if we're generating documents
    // Otherwise it will create documents even when not requested!
    if (generateDoc) {
      try {
        console.log('Running Phase 3 future value calculations...');
        runPhase3(rowNum);
        console.log('✅ Future values calculated');
      } catch (error) {
        console.log(`⚠️ Phase 3 failed but reprocessing completed: ${error.toString()}`);
        // Don't throw - reprocessing was successful even if Phase 3 fails
      }
    } else {
      // Run ONLY the FV calculations without document generation
      try {
        console.log('Running FV calculations only (no document generation)...');
        const { sheet: ws, hdr } = initWS();
        const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
        const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID);
        calculateAndWriteFutureValues(hdr, rowArr, rowNum, profileId);
        console.log('✅ Future values calculated');
      } catch (error) {
        console.log(`⚠️ FV calculation failed: ${error.toString()}`);
      }
    }
    
    // Generate document if requested
    if (generateDoc) {
      if (sendEmail) {
        console.log('Generating document and sending email...');
        const docUrl = generateDocumentBrandedForRow(rowNum);
        console.log(`Document created and emailed: ${docUrl}`);
      } else {
        console.log('Generating document WITHOUT sending email...');
        const docUrl = generateDocumentNoEmail(rowNum);
        console.log(`Document created (no email sent): ${docUrl}`);
      }
    }
    
    console.log(`========== COMPLETED ROW ${rowNum} ==========\n`);
    return true;
    
  } catch (error) {
    console.error(`Error reprocessing row ${rowNum}: ${error.toString()}`);
    return false;
  }
}

/**
 * Write allocation results to sheet (full implementation from handlePhase2)
 */
function writeAllocationResults(ws, hdr, rowNum, results) {
  const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
  const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID);
  
  // Build complete actualMap - all keys default to 0
  const actualMap = {};
  listAllVehicleActualKeys().forEach(key => {
    // skip any family_bank_actual keys
    if (!/family_bank/.test(key)) actualMap[key] = 0;
  });
  
  // Universal actuals
  const actualHsa = Number(getValue(hdr, rowArr, HEADERS.P2_HSA_MONTHLY_CONTRIB)) || 0;
  const actualCesa = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_MONTHLY_CONTRIB)) || 0;
  const actualRet = Number(getValue(hdr, rowArr, HEADERS.P2_RETIREMENT_PERSONAL)) || 0;
  
  actualMap['health_hsa_actual'] = actualHsa;
  actualMap['education_combined_cesa_actual'] = actualCesa;
  actualMap['retirement_traditional_401k_actual'] = actualRet;
  
  // Define profiles with employer match
  const matchProfiles = ['2_ROBS_Curious', '4_Roth_Reclaimer', '5_Bracket_Strategist', 
                         '6_Catch_Up', '7_Foundation_Builder', '9_Late_Stage_Growth'];
  
  // Profile-specific actual contributions
  let actualDist = 0;
  if (profileId === '1_ROBS_In_Use') {
    actualDist = (Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q6)) || 0) / 12;
    actualMap['retirement_robs_solo_401k_profit_distribution_actual'] = actualDist;
  } else if (profileId === '3_Solo401k_Builder') {
    const annualEmployee = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q4)) || 0;
    const annualEmployer = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q5)) || 0;
    actualMap['retirement_solo_401k_employee_actual'] = annualEmployee / 12;
    actualMap['retirement_solo_401k_employer_actual'] = annualEmployer / 12;
  } else if (profileId === '8_Biz_Owner_Group') {
    const annualContribution = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q6)) || 0;
    actualMap['retirement_group_401k_employee_actual'] = annualContribution / 12;
  }
  
  // Add employer match actuals for W-2 profiles
  if (matchProfiles.includes(profileId)) {
    let hasMatch = false;
    let matchPercentage = '';
    
    if (profileId === '2_ROBS_Curious') {
      hasMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
      matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q5) || '';
    } else if (['4_Roth_Reclaimer'].includes(profileId)) {
      hasMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q6) === 'Yes';
      matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q7) || '';
    } else if (['5_Bracket_Strategist', '6_Catch_Up', '7_Foundation_Builder', '9_Late_Stage_Growth'].includes(profileId)) {
      hasMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
      matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q3) || '';
    }
    
    if (hasMatch && matchPercentage) {
      const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 0;
      const matchAmount = calculateEmployerMatch(grossIncome, matchPercentage);
      if (matchAmount > 0) {
        actualMap['retirement_401k_match_traditional_actual'] = matchAmount;
      }
    }
  }
  
  // Write all actuals
  Object.entries(actualMap).forEach(([hdrName, rawAmt]) => {
    const col = hdr[hdrName];
    if (!col) return;
    ws.getRange(rowNum, col)
      .setValue(Math.round(rawAmt))
      .setNumberFormat('$#,##0');
  });
  
  // Build non-discretionary seeds based on profile
  const nonDiscretionarySeeds = { Education: {}, Health: {}, Retirement: {} };
  
  // Profile 1: ROBS In Use - Profit distributions
  if (profileId === '1_ROBS_In_Use' && actualDist > 0) {
    nonDiscretionarySeeds.Retirement['ROBS Solo 401(k) – Profit Distribution'] = actualDist;
  } 
  
  // Profile 3: Solo 401k Builder - Employer contributions
  else if (profileId === '3_Solo401k_Builder') {
    const annualEmployer = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q5)) || 0;
    if (annualEmployer > 0) {
      nonDiscretionarySeeds.Retirement['Solo 401(k) – Employer'] = annualEmployer / 12;
    }
  }
  
  // Profile 8: Business Owner Group - Required contributions
  else if (profileId === '8_Biz_Owner_Group') {
    const planType = getValue(hdr, rowArr, HEADERS.P2_EX_Q5) || '';
    if (planType.includes('Defined Benefit')) {
      const annualDB = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q6)) || 0;
      if (annualDB > 0) {
        nonDiscretionarySeeds.Retirement['Defined Benefit Plan'] = annualDB / 12;
      }
    }
  }
  
  // Check profiles with employer match
  if (matchProfiles.includes(profileId)) {
    let hasMatch = false;
    let matchPercentage = '';
    
    if (profileId === '2_ROBS_Curious') {
      hasMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
      matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q5) || '';
    } else if (['4_Roth_Reclaimer'].includes(profileId)) {
      hasMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q6) === 'Yes';
      matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q7) || '';
    } else if (['5_Bracket_Strategist', '6_Catch_Up', '7_Foundation_Builder', '9_Late_Stage_Growth'].includes(profileId)) {
      hasMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
      matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q3) || '';
    }
    
    if (hasMatch && matchPercentage) {
      const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 0;
      const matchAmount = calculateEmployerMatch(grossIncome, matchPercentage);
      if (matchAmount > 0) {
        nonDiscretionarySeeds.Retirement['401(k) Match Traditional'] = matchAmount;
        // Store match percentage separately if needed for reporting
        nonDiscretionarySeeds.Retirement['401(k) Match Traditional_note'] = matchPercentage;
      }
    }
  }
  
  // Write ideal allocations (discretionary + non-discretionary)
  const writtenIdeal = new Set();
  let sumIdeal = 0;
  
  ['Retirement', 'Education', 'Health'].forEach(domain => {
    // First write discretionary allocations from engine
    for (const [veh, amtRaw] of Object.entries(results.vehicles[domain] || {})) {
      if (veh === 'Family Bank') continue;
      const key = veh.toLowerCase()
        .replace(/[()%–]/g, '')
        .replace(/\s+/g, '_')
        .replace(/__+/g, '_'); // Fix double underscores
      const hdrName = `${domain.toLowerCase()}_${key}_ideal`;
      const col = hdr[hdrName];
      if (!col) continue;
      
      // Add non-discretionary amount if applicable
      // For ROBS profit distribution, use the non-discretionary seed value only (don't add)
      const nonDiscAmt = nonDiscretionarySeeds[domain][veh] || 0;
      let amt;
      if (veh === 'ROBS Solo 401(k) – Profit Distribution' && nonDiscAmt > 0) {
        // For ROBS profit, use only the non-discretionary seed amount
        amt = Math.round(nonDiscAmt);
      } else {
        // For other vehicles, add non-discretionary to discretionary
        amt = Math.round((amtRaw || 0) + nonDiscAmt);
      }
      
      ws.getRange(rowNum, col)
        .setValue(amt)
        .setNumberFormat('$#,##0');
      writtenIdeal.add(hdrName);
      sumIdeal += amt;
    }
    
    // Then add any non-discretionary seeds that weren't in the engine results
    for (const [veh, amtRaw] of Object.entries(nonDiscretionarySeeds[domain])) {
      // Skip note fields
      if (veh.endsWith('_note')) continue;
      if (!results.vehicles[domain] || !results.vehicles[domain][veh]) {
        const key = veh.toLowerCase()
          .replace(/[()%–]/g, '')
          .replace(/\s+/g, '_');
        const hdrName = `${domain.toLowerCase()}_${key}_ideal`;
        const col = hdr[hdrName];
        if (!col) continue;
        const amt = Math.round(amtRaw || 0);
        ws.getRange(rowNum, col)
          .setValue(amt)
          .setNumberFormat('$#,##0');
        writtenIdeal.add(hdrName);
        sumIdeal += amt;
      }
    }
  });
  
  // Calculate and write family bank ideal
  const userPercent = Number(getValue(hdr, rowArr, HEADERS.ALLOCATION_PERCENTAGE)) || 0;
  const targetRate = Math.max(userPercent / 100, CONFIG.OPTIMIZED_SAVINGS_RATE);
  const totalPool = Number(getValue(hdr, rowArr, HEADERS.NET_MONTHLY_INCOME)) * targetRate;
  
  // Add non-discretionary seeds to get true total
  const totalNonDiscretionary = sumValues(nonDiscretionarySeeds.Education) +
                                sumValues(nonDiscretionarySeeds.Health) +
                                sumValues(nonDiscretionarySeeds.Retirement);
  const totalIdealPool = totalPool + totalNonDiscretionary;
  
  const leftover = Math.max(0, Math.round(totalIdealPool - sumIdeal));
  const fbCol = hdr[HEADERS.FAMILY_BANK_IDEAL];
  if (fbCol) {
    ws.getRange(rowNum, fbCol)
      .setValue(leftover)
      .setNumberFormat('$#,##0');
    writtenIdeal.add('family_bank_ideal');
  }
  
  // Collect and store vehicle recommendations with notes
  const recommendations = [];
  ['Retirement', 'Education', 'Health'].forEach(domain => {
    // Find vehicles with notes from the original vehicleOrders
    const domainVehicles = results.vehicleOrders ? results.vehicleOrders[domain] : null;
    if (domainVehicles && Array.isArray(domainVehicles)) {
      domainVehicles.forEach(vehicle => {
        if (vehicle.note) {
          // Only include vehicles that have an allocated amount
          const amtRaw = results.vehicles[domain] ? results.vehicles[domain][vehicle.name] : 0;
          if (amtRaw > 0) {
            recommendations.push(`${vehicle.name}: ${vehicle.note}`);
          } else if (vehicle.note.includes('Action item:')) {
            // Include action items even without allocation
            recommendations.push(vehicle.note);
          }
        }
      });
    }
  });
  
  // Write recommendations to sheet
  const recCol = hdr[HEADERS.VEHICLE_RECOMMENDATIONS];
  if (recCol && recommendations.length > 0) {
    ws.getRange(rowNum, recCol)
      .setValue(recommendations.join('\n'));
  }
  
  // Zero-fill any remaining _actual or _ideal columns
  Object.entries(hdr).forEach(([name, col]) => {
    const cell = ws.getRange(rowNum, col);
    if (name.endsWith('_actual') && !(name in actualMap)) {
      cell.setValue(0).setNumberFormat('$#,##0');
    }
    if (name.endsWith('_ideal') && !writtenIdeal.has(name)) {
      cell.setValue(0).setNumberFormat('$#,##0');
    }
  });
  
  console.log(`✅ Wrote ${Object.keys(actualMap).length} actuals, ${writtenIdeal.size} ideals`);
}

/**
 * Quick test function - reprocess without document or email
 * For rapid testing of allocation calculations only
 */
function quickTestReprocess() {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (!sheet || sheet.getName() !== 'Working Sheet') {
    SpreadsheetApp.getUi().alert(
      'Wrong Sheet',
      'Please select a row in the Working Sheet',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const rowNum = sheet.getActiveRange().getRow();
  if (rowNum < 3) {
    SpreadsheetApp.getUi().alert(
      'Invalid Row',
      'Please select a data row (row 3 or below)',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  console.log(`Quick test on row ${rowNum} - allocations only, no document/email`);
  const success = reprocessSingleRow(rowNum, { generateDoc: false, sendEmail: false });
  
  if (success) {
    SpreadsheetApp.getUi().alert(
      'Quick Test Complete',
      `Row ${rowNum} allocations reprocessed.\nNo document generated, no email sent.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Simple test function - prompts for row number and options
 */
function testReprocessWithPrompt() {
  const ui = SpreadsheetApp.getUi();
  
  // First prompt for row number
  const rowResponse = ui.prompt(
    'Test Reprocess',
    'Enter row number to reprocess (3 or higher):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (rowResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const rowNum = parseInt(rowResponse.getResponseText());
  if (!rowNum || rowNum < 3) {
    ui.alert('Invalid', 'Please enter a valid row number (3 or higher)', ui.ButtonSet.OK);
    return;
  }
  
  // Ask about document generation
  const docResponse = ui.alert(
    'Document Generation',
    'Generate document for this row?',
    ui.ButtonSet.YES_NO
  );
  
  const generateDoc = (docResponse === ui.Button.YES);
  let sendEmail = false;
  
  // If generating doc, ask about email
  if (generateDoc) {
    const emailResponse = ui.alert(
      'Email Document',
      'Send email with the document?',
      ui.ButtonSet.YES_NO
    );
    sendEmail = (emailResponse === ui.Button.YES);
  }
  
  // Process with options
  const success = reprocessSingleRow(rowNum, { generateDoc, sendEmail });
  
  if (success) {
    let message = `Row ${rowNum} reprocessed successfully.`;
    if (generateDoc) {
      message += sendEmail ? '\nDocument generated and emailed.' : '\nDocument generated (no email sent).';
    }
    ui.alert('Success', message, ui.ButtonSet.OK);
  }
}

/**
 * Test reprocessing on a single row first
 * @param {number} rowNum - Optional row number to test (defaults to current row)
 */
function testReprocessSingleRow(rowNum = null) {
  // Use provided row or get current selected row
  if (!rowNum) {
    const sheet = SpreadsheetApp.getActiveSheet();
    if (!sheet || sheet.getName() !== 'Working Sheet') {
      SpreadsheetApp.getUi().alert(
        'Wrong Sheet',
        'Please select a row in the Working Sheet',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    rowNum = sheet.getActiveRange().getRow();
    
    if (rowNum < 3) {
      SpreadsheetApp.getUi().alert(
        'Invalid Row',
        'Please select a data row (row 3 or below)',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
  }
  
  console.log('Testing reprocess on row ' + rowNum);
  
  // For testing, generate doc but don't send email
  const success = reprocessSingleRow(rowNum, { generateDoc: true, sendEmail: false });
  
  if (success) {
    SpreadsheetApp.getUi().alert(
      'Test Complete', 
      `Row ${rowNum} has been reprocessed.\nDocument generated (no email sent).\nCheck the values and document.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Reprocess currently selected row
 */
function reprocessCurrentRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const rowNum = sheet.getActiveRange().getRow();
  
  if (rowNum < 3) {
    SpreadsheetApp.getUi().alert(
      'Invalid Row',
      'Please select a data row (row 3 or below)',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Confirm Reprocess',
    `Reprocess allocations for row ${rowNum}?`,
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    // Just reprocess, no document generation for quick testing
    reprocessSingleRow(rowNum, { generateDoc: false, sendEmail: false });
    ui.alert('Complete', `Row ${rowNum} has been reprocessed (no document generated).`, ui.ButtonSet.OK);
  }
}

/**
 * Reprocess all rows with data
 * BE CAREFUL - This will update all rows!
 */
function reprocessAllRows(startRow = 3, endRow = null) {
  const ui = SpreadsheetApp.getUi();
  
  // Safety confirmation
  const response = ui.alert(
    '⚠️ Confirm Bulk Reprocess',
    'This will reprocess allocations for ALL rows with data.\n\n' +
    'This will update ideal allocation values based on the fixed code.\n\n' +
    'Are you sure you want to continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    console.log('Reprocess cancelled by user');
    return;
  }
  
  const { sheet: ws, hdr } = initWS();
  const lastRow = endRow || ws.getLastRow();
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  console.log(`Starting reprocess from row ${startRow} to ${lastRow}`);
  
  for (let row = startRow; row <= lastRow; row++) {
    try {
      // Skip empty rows
      const profileId = ws.getRange(row, hdr[HEADERS.PROFILE_ID]).getValue();
      if (!profileId || profileId === '') {
        console.log(`Skipping row ${row} - no profile ID`);
        continue;
      }
      
      // Bulk reprocess without documents or emails
      const success = reprocessSingleRow(row, { generateDoc: false, sendEmail: false });
      if (success) {
        successCount++;
      } else {
        errorCount++;
        errors.push(row);
      }
      
      // Add a small delay to prevent timeout
      Utilities.sleep(500);
      
    } catch (error) {
      console.error(`Error on row ${row}: ${error.toString()}`);
      errorCount++;
      errors.push(row);
    }
  }
  
  // Report results
  let message = `Reprocessing complete!\n\n`;
  message += `✅ Success: ${successCount} rows\n`;
  message += `❌ Errors: ${errorCount} rows\n`;
  
  if (errors.length > 0) {
    message += `\nError rows: ${errors.join(', ')}`;
  }
  
  ui.alert('Reprocess Complete', message, ui.ButtonSet.OK);
}

/**
 * Generate documents and send emails for all reprocessed rows
 */
function regenerateAllDocuments(startRow = 3, endRow = null) {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '📄 Regenerate Documents',
    'This will generate new documents and send emails for all rows.\n\n' +
    'Make sure you have reprocessed allocations first!\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const { sheet: ws, hdr } = initWS();
  const lastRow = endRow || ws.getLastRow();
  
  let count = 0;
  
  for (let row = startRow; row <= lastRow; row++) {
    try {
      const profileId = ws.getRange(row, hdr[HEADERS.PROFILE_ID]).getValue();
      if (!profileId || profileId === '') continue;
      
      console.log(`Generating document for row ${row}...`);
      generateDocumentBrandedForRow(row);
      count++;
      
      // Delay to prevent hitting limits
      Utilities.sleep(2000);
      
    } catch (error) {
      console.error(`Error generating document for row ${row}: ${error.toString()}`);
    }
  }
  
  ui.alert('Documents Generated', `Generated ${count} documents`, ui.ButtonSet.OK);
}