/**
 * cleanup-edit-drafts.js
 *
 * Removes all orphaned EDIT_DRAFT rows from RESPONSES sheet
 * Run this ONCE from Apps Script Editor after deploying @68
 */

function cleanupEditDrafts() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    if (!sheet) {
      console.log('RESPONSES sheet not found');
      return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const statusCol = headers.indexOf('Status');
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const timestampCol = headers.indexOf('Timestamp');

    console.log('=== Scanning for EDIT_DRAFT rows ===');

    let editDrafts = [];

    // Find all EDIT_DRAFT rows
    for (let i = 1; i < data.length; i++) {
      if (data[i][statusCol] === 'EDIT_DRAFT') {
        editDrafts.push({
          row: i + 1,
          clientId: data[i][clientIdCol],
          toolId: data[i][toolIdCol],
          timestamp: data[i][timestampCol]
        });
      }
    }

    console.log(`Found ${editDrafts.length} EDIT_DRAFT rows`);

    if (editDrafts.length === 0) {
      console.log('✅ No EDIT_DRAFT rows to clean up!');
      return;
    }

    // Show what will be deleted
    console.log('\nEDIT_DRAFT rows to be deleted:');
    editDrafts.forEach((draft, index) => {
      console.log(`${index + 1}. Row ${draft.row}: ${draft.clientId} / ${draft.toolId} - ${draft.timestamp}`);
    });

    // Delete in reverse order (bottom to top) to maintain row indices
    editDrafts.reverse().forEach(draft => {
      console.log(`Deleting row ${draft.row}: ${draft.clientId} / ${draft.toolId}`);
      sheet.deleteRow(draft.row);
    });

    SpreadsheetApp.flush();

    console.log(`\n✅ Cleaned up ${editDrafts.length} EDIT_DRAFT rows!`);
    console.log('Your RESPONSES sheet is now clean.');

  } catch (error) {
    console.error('Error cleaning up EDIT_DRAFTs:', error);
  }
}

/**
 * Preview what will be deleted (doesn't delete anything)
 */
function previewEditDraftCleanup() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    if (!sheet) {
      console.log('RESPONSES sheet not found');
      return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const statusCol = headers.indexOf('Status');
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const timestampCol = headers.indexOf('Timestamp');

    console.log('=== EDIT_DRAFT Cleanup Preview ===\n');

    let editDrafts = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][statusCol] === 'EDIT_DRAFT') {
        editDrafts.push({
          row: i + 1,
          clientId: data[i][clientIdCol],
          toolId: data[i][toolIdCol],
          timestamp: data[i][timestampCol]
        });
      }
    }

    if (editDrafts.length === 0) {
      console.log('✅ No EDIT_DRAFT rows found - sheet is clean!');
      return;
    }

    console.log(`Found ${editDrafts.length} EDIT_DRAFT rows:\n`);
    editDrafts.forEach((draft, index) => {
      console.log(`${index + 1}. Row ${draft.row}: ${draft.clientId} / ${draft.toolId}`);
      console.log(`   Timestamp: ${draft.timestamp}`);
    });

    console.log(`\n⚠️  Run cleanupEditDrafts() to delete these ${editDrafts.length} rows`);

  } catch (error) {
    console.error('Error previewing cleanup:', error);
  }
}
