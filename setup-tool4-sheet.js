/**
 * Setup Script for Tool 4 SCENARIOS Sheet
 *
 * This script creates the TOOL4_SCENARIOS sheet with proper headers.
 *
 * HOW TO USE:
 * 1. Open your Google Spreadsheet:
 *    https://docs.google.com/spreadsheets/d/1dEcTk-ODdp4mmYqPl4Du8jgmoUjhpnEjOgFfOOdEznc/edit
 * 2. Go to Extensions → Apps Script
 * 3. Click the + button next to "Files" → Script
 * 4. Name it "SetupTool4Sheet"
 * 5. Paste this entire file
 * 6. Click the "Run" button (▶) at the top
 * 7. Authorize when prompted
 * 8. Check the execution log for success message
 * 9. Return to your spreadsheet to see the new TOOL4_SCENARIOS sheet
 */

function setupTool4ScenariosSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Check if TOOL4_SCENARIOS sheet already exists
    let sheet = ss.getSheetByName('TOOL4_SCENARIOS');

    if (sheet) {
      const ui = SpreadsheetApp.getUi();
      const response = ui.alert(
        'Sheet Already Exists',
        'TOOL4_SCENARIOS sheet already exists. Do you want to DELETE it and recreate it?\n\n' +
        'WARNING: This will delete all existing data in the sheet!',
        ui.ButtonSet.YES_NO
      );

      if (response === ui.Button.YES) {
        ss.deleteSheet(sheet);
        Logger.log('Deleted existing TOOL4_SCENARIOS sheet');
      } else {
        Logger.log('User cancelled. Keeping existing sheet.');
        ui.alert('Setup Cancelled', 'Keeping existing TOOL4_SCENARIOS sheet.', ui.ButtonSet.OK);
        return;
      }
    }

    // Create new sheet
    sheet = ss.insertSheet('TOOL4_SCENARIOS');
    Logger.log('Created new TOOL4_SCENARIOS sheet');

    // Define all 36 column headers (A-AJ)
    const headers = [
      // A-J: Basic Info & Financial Inputs
      'Timestamp',              // A
      'Client_ID',              // B
      'Scenario_Name',          // C
      'Priority_Selected',      // D
      'Monthly_Income',         // E
      'Current_Essentials',     // F
      'Debt_Balance',           // G
      'Interest_Rate',          // H
      'Emergency_Fund',         // I
      'Income_Stability',       // J

      // K-R: Category Spending Estimates
      'Rent_Mortgage',          // K
      'Groceries',              // L
      'Dining_Takeout',         // M
      'Transportation',         // N
      'Utilities',              // O
      'Insurance',              // P
      'Subscriptions',          // Q
      'Other_Essentials',       // R

      // S-V: Recommended Allocation (Percentages)
      'Rec_M_Percent',          // S
      'Rec_E_Percent',          // T
      'Rec_F_Percent',          // U
      'Rec_J_Percent',          // V

      // W-Z: Recommended Allocation (Dollars)
      'Rec_M_Dollars',          // W
      'Rec_E_Dollars',          // X
      'Rec_F_Dollars',          // Y
      'Rec_J_Dollars',          // Z

      // AA-AD: Custom Allocation (if student adjusted)
      'Custom_M_Percent',       // AA
      'Custom_E_Percent',       // AB
      'Custom_F_Percent',       // AC
      'Custom_J_Percent',       // AD

      // AE-AJ: Metadata
      'Is_Custom',              // AE (boolean)
      'Report_Generated',       // AF (boolean)
      'Tool1_Source',           // AG (completed/backup/missing)
      'Tool2_Source',           // AH (completed/backup/missing)
      'Tool3_Source',           // AI (completed/backup/missing)
      'Backup_Data'             // AJ (JSON string)
    ];

    // Set headers in row 1
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4a5568'); // Dark gray
    headerRange.setFontColor('#ffffff');  // White text
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');

    // Set column widths for better readability
    sheet.setColumnWidth(1, 150);  // Timestamp
    sheet.setColumnWidth(2, 100);  // Client_ID
    sheet.setColumnWidth(3, 200);  // Scenario_Name
    sheet.setColumnWidth(4, 180);  // Priority_Selected

    // Set default width for remaining columns
    for (let i = 5; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 120);
    }

    // Freeze header row
    sheet.setFrozenRows(1);

    // Add data validation for boolean columns
    const booleanRule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .build();

    // Apply to Is_Custom column (AE = column 31)
    sheet.getRange(2, 31, sheet.getMaxRows() - 1, 1).setDataValidation(booleanRule);

    // Apply to Report_Generated column (AF = column 32)
    sheet.getRange(2, 32, sheet.getMaxRows() - 1, 1).setDataValidation(booleanRule);

    // Add data validation for source columns (completed/backup/missing)
    const sourceRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['completed', 'backup', 'missing'], true)
      .build();

    // Apply to Tool1_Source (AG = column 33)
    sheet.getRange(2, 33, sheet.getMaxRows() - 1, 1).setDataValidation(sourceRule);

    // Apply to Tool2_Source (AH = column 34)
    sheet.getRange(2, 34, sheet.getMaxRows() - 1, 1).setDataValidation(sourceRule);

    // Apply to Tool3_Source (AI = column 35)
    sheet.getRange(2, 35, sheet.getMaxRows() - 1, 1).setDataValidation(sourceRule);

    // Add number formatting for currency columns
    const currencyFormat = '$#,##0.00';
    const percentFormat = '0"%"';

    // Format income/expense columns (E-R: columns 5-18)
    sheet.getRange(2, 5, sheet.getMaxRows() - 1, 14).setNumberFormat(currencyFormat);

    // Format percentage columns (S-V, AA-AD: columns 19-22, 27-30)
    sheet.getRange(2, 19, sheet.getMaxRows() - 1, 4).setNumberFormat(percentFormat);
    sheet.getRange(2, 27, sheet.getMaxRows() - 1, 4).setNumberFormat(percentFormat);

    // Format dollar columns (W-Z: columns 23-26)
    sheet.getRange(2, 23, sheet.getMaxRows() - 1, 4).setNumberFormat(currencyFormat);

    // Add alternating row colors for better readability
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, headers.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

    // Protect the header row from accidental edits
    const protection = sheet.getRange(1, 1, 1, headers.length).protect();
    protection.setDescription('Tool 4 Headers - Do Not Edit');
    protection.setWarningOnly(true);

    // Add a note to cell A1 with documentation
    sheet.getRange('A1').setNote(
      'TOOL4_SCENARIOS Sheet\n\n' +
      'This sheet stores all Tool 4 scenario data.\n\n' +
      'Total Columns: 36 (A-AJ)\n' +
      'Created by: Setup Script\n' +
      'Version: 1.0\n\n' +
      'Do not modify column headers!'
    );

    // Move sheet to appropriate position (after RESPONSES if it exists)
    const responsesSheet = ss.getSheetByName('RESPONSES');
    if (responsesSheet) {
      const responsesIndex = responsesSheet.getIndex();
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(responsesIndex + 1);
    }

    Logger.log('✅ TOOL4_SCENARIOS sheet created successfully!');
    Logger.log('Total columns: ' + headers.length);
    Logger.log('Headers: ' + headers.join(', '));

    // Show success message to user
    SpreadsheetApp.getUi().alert(
      '✅ Success!',
      'TOOL4_SCENARIOS sheet has been created successfully!\n\n' +
      'Total Columns: 36 (A-AJ)\n' +
      'Formatting Applied:\n' +
      '  • Header row (bold, dark background)\n' +
      '  • Currency formatting for dollar amounts\n' +
      '  • Percentage formatting for allocations\n' +
      '  • Data validation for dropdowns\n' +
      '  • Alternating row colors\n' +
      '  • Protected headers\n\n' +
      'The sheet is now ready for Tool 4 data!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    Logger.log('❌ Error creating TOOL4_SCENARIOS sheet: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'Failed to create TOOL4_SCENARIOS sheet:\n\n' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Helper function to verify the sheet setup
 * Run this after setupTool4ScenariosSheet() to verify everything is correct
 */
function verifyTool4Setup() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('TOOL4_SCENARIOS');

    if (!sheet) {
      Logger.log('❌ TOOL4_SCENARIOS sheet not found!');
      SpreadsheetApp.getUi().alert(
        '❌ Sheet Not Found',
        'TOOL4_SCENARIOS sheet does not exist.\n\nPlease run setupTool4ScenariosSheet() first.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Get headers
    const headers = sheet.getRange(1, 1, 1, 36).getValues()[0];

    // Expected headers
    const expectedHeaders = [
      'Timestamp', 'Client_ID', 'Scenario_Name', 'Priority_Selected',
      'Monthly_Income', 'Current_Essentials', 'Debt_Balance', 'Interest_Rate',
      'Emergency_Fund', 'Income_Stability', 'Rent_Mortgage', 'Groceries',
      'Dining_Takeout', 'Transportation', 'Utilities', 'Insurance',
      'Subscriptions', 'Other_Essentials', 'Rec_M_Percent', 'Rec_E_Percent',
      'Rec_F_Percent', 'Rec_J_Percent', 'Rec_M_Dollars', 'Rec_E_Dollars',
      'Rec_F_Dollars', 'Rec_J_Dollars', 'Custom_M_Percent', 'Custom_E_Percent',
      'Custom_F_Percent', 'Custom_J_Percent', 'Is_Custom', 'Report_Generated',
      'Tool1_Source', 'Tool2_Source', 'Tool3_Source', 'Backup_Data'
    ];

    // Verify all headers match
    let allMatch = true;
    const mismatches = [];

    for (let i = 0; i < expectedHeaders.length; i++) {
      if (headers[i] !== expectedHeaders[i]) {
        allMatch = false;
        mismatches.push(`Column ${i + 1}: Expected "${expectedHeaders[i]}", got "${headers[i]}"`);
      }
    }

    if (allMatch) {
      Logger.log('✅ All headers are correct!');
      Logger.log('Total columns: ' + headers.length);

      SpreadsheetApp.getUi().alert(
        '✅ Verification Passed!',
        'TOOL4_SCENARIOS sheet is correctly configured!\n\n' +
        'Total Columns: 36\n' +
        'All headers match expected values.\n\n' +
        'The sheet is ready to use!',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      Logger.log('❌ Header mismatch found:');
      mismatches.forEach(m => Logger.log('  ' + m));

      SpreadsheetApp.getUi().alert(
        '⚠️ Verification Failed',
        'Some headers do not match expected values.\n\n' +
        'Check the execution log for details.\n\n' +
        'Recommendation: Delete the sheet and run setupTool4ScenariosSheet() again.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }

  } catch (error) {
    Logger.log('❌ Error verifying setup: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'Failed to verify setup:\n\n' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Create custom menu for easy access
 * This runs automatically when the spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Tool 4 Setup')
    .addItem('📋 Create TOOL4_SCENARIOS Sheet', 'setupTool4ScenariosSheet')
    .addItem('✅ Verify Setup', 'verifyTool4Setup')
    .addSeparator()
    .addItem('ℹ️ About', 'showAbout')
    .addToUi();
}

/**
 * Show information about the setup script
 */
function showAbout() {
  SpreadsheetApp.getUi().alert(
    'Tool 4 Setup Script',
    'This script creates and configures the TOOL4_SCENARIOS sheet for Tool 4.\n\n' +
    'Features:\n' +
    '  • Creates sheet with 36 columns (A-AJ)\n' +
    '  • Applies proper formatting and validation\n' +
    '  • Protects headers from accidental edits\n' +
    '  • Includes verification function\n\n' +
    'Usage:\n' +
    '  1. Click "Create TOOL4_SCENARIOS Sheet"\n' +
    '  2. Authorize if prompted\n' +
    '  3. Click "Verify Setup" to confirm\n\n' +
    'Version: 1.0\n' +
    'Created: November 26, 2025',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
