// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3 DOCUMENT GENERATION INTEGRATION
// This file connects Phase 3 completion with automatic document generation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate retirement blueprint after Phase 3 completes
 * This function bridges the gap between Phase 3 and document generation
 * @param {number} rowNum - Row number in the Working Sheet
 */
function generateRetirementBlueprint(rowNum) {
  try {
    Logger.log(`📄 Starting automated document generation for row ${rowNum}`);
    
    // Call the branded document generation function
    // This will create the document, apply branding, and send email
    const docUrl = generateDocumentBrandedForRow(rowNum);
    
    if (docUrl) {
      Logger.log(`✅ Document generation successful: ${docUrl}`);
      
      // Optional: Update Working Sheet with document URL
      try {
        const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
        const headers = ws.getRange(2, 1, 1, ws.getLastColumn()).getValues()[0];
        const docUrlCol = headers.indexOf('retirement_blueprint_url');
        
        if (docUrlCol === -1) {
          // Add the column if it doesn't exist
          const lastCol = ws.getLastColumn();
          ws.getRange(2, lastCol + 1).setValue('retirement_blueprint_url');
          ws.getRange(rowNum, lastCol + 1).setValue(docUrl);
        } else {
          // Update existing column
          ws.getRange(rowNum, docUrlCol + 1).setValue(docUrl);
        }
      } catch (urlError) {
        Logger.log(`⚠️ Could not save document URL to sheet: ${urlError.message}`);
      }
    }
    
    return docUrl;
    
  } catch (error) {
    Logger.log(`❌ Document generation failed for row ${rowNum}: ${error.message}`);
    throw error;
  }
}

/**
 * Modified version of generateDocumentBranded that accepts a row number
 * This allows it to be called automatically from Phase 3
 * @param {number} rowNum - Row number to generate document for
 * @returns {string} Document URL
 */
function generateDocumentBrandedForRow(rowNum) {
  try {
    Logger.log(`Starting BRANDED document generation for row ${rowNum}`);
    
    // First, generate the safe document
    Logger.log('Generating safe document as base...');
    const docUrl = generateRetirementBlueprintSafe(rowNum);
    
    Logger.log(`Safe document returned URL: ${docUrl}`);
    
    if (!docUrl) {
      throw new Error('Failed to generate base document - no URL returned');
    }
    
    // Extract document ID from URL
    const docId = extractDocIdFromUrl(docUrl);
    Logger.log(`Extracted document ID: ${docId}`);
    
    if (!docId) {
      throw new Error(`Could not extract document ID from URL: ${docUrl}`);
    }
    
    Logger.log(`Base document created with ID: ${docId}`);
    
    // Apply branding to the generated document
    applyBrandingToDocument(docId);
    
    Logger.log(`✅ Branded document generation complete for row ${rowNum}`);
    
    return docUrl;
    
  } catch (error) {
    Logger.log(`❌ Error in branded document generation: ${error.message}`);
    throw error;
  }
}

/**
 * Test function to verify document generation works
 * Can be used to manually test a specific row
 */
function testAutomatedDocumentGeneration() {
  const testRow = 3; // Change this to test different rows
  
  try {
    Logger.log('🧪 Testing automated document generation...');
    const docUrl = generateRetirementBlueprint(testRow);
    Logger.log(`✅ Test successful! Document URL: ${docUrl}`);
    
    SpreadsheetApp.getUi().alert('Test Successful', 
      `Document generated successfully!\n\nURL: ${docUrl}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
      
  } catch (error) {
    Logger.log(`❌ Test failed: ${error.message}`);
    SpreadsheetApp.getUi().alert('Test Failed', 
      `Error: ${error.message}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Batch process multiple rows for document generation
 * Useful for generating documents for multiple completed Phase 3 rows
 */
function batchGenerateDocuments() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Batch Document Generation', 
    'Enter row numbers separated by commas (e.g., 3,5,7):', 
    ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const rowNumbers = response.getResponseText()
    .split(',')
    .map(num => parseInt(num.trim()))
    .filter(num => !isNaN(num) && num >= 3);
  
  if (rowNumbers.length === 0) {
    ui.alert('No valid row numbers provided');
    return;
  }
  
  let successful = 0;
  let failed = 0;
  const errors = [];
  
  rowNumbers.forEach(rowNum => {
    try {
      generateRetirementBlueprint(rowNum);
      successful++;
    } catch (error) {
      failed++;
      errors.push(`Row ${rowNum}: ${error.message}`);
    }
  });
  
  const message = `Batch processing complete!\n\nSuccessful: ${successful}\nFailed: ${failed}` +
    (failed > 0 ? `\n\nErrors:\n${errors.join('\n')}` : '');
  
  ui.alert('Batch Results', message, ui.ButtonSet.OK);
}