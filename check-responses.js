/**
 * Check RESPONSES sheet structure and TEST001 data
 * Add this to Code.js and run from Apps Script editor
 */

function checkResponsesSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName('RESPONSES');

  if (!sheet) {
    Logger.log('❌ RESPONSES sheet not found!');
    return;
  }

  // Check headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('📋 Headers: ' + JSON.stringify(headers));

  const hasIsLatest = headers.includes('Is_Latest');
  Logger.log(hasIsLatest ? '✅ Is_Latest column exists' : '❌ Is_Latest column MISSING');

  // Check TEST001 data
  const data = sheet.getDataRange().getValues();
  const test001Rows = data.filter((row, i) => i > 0 && row[1] === 'TEST001' && row[2] === 'tool1');

  Logger.log('\n📊 TEST001 Tool 1 Responses: ' + test001Rows.length);

  test001Rows.forEach((row, i) => {
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const statusCol = headers.indexOf('Status');
    const timestampCol = headers.indexOf('Timestamp');
    const isLatestCol = headers.indexOf('Is_Latest');

    Logger.log(`\n  Row ${i + 1}:`);
    Logger.log(`    Timestamp: ${row[timestampCol]}`);
    Logger.log(`    Status: ${row[statusCol]}`);
    Logger.log(`    Is_Latest: ${isLatestCol >= 0 ? row[isLatestCol] : 'N/A'}`);
  });

  // Test getLatestResponse
  Logger.log('\n🔍 Testing DataService.getLatestResponse("TEST001", "tool1"):');
  try {
    const latest = DataService.getLatestResponse('TEST001', 'tool1');
    if (latest) {
      Logger.log('✅ Found response:');
      Logger.log('   Status: ' + latest.status);
      Logger.log('   Timestamp: ' + latest.timestamp);
      Logger.log('   Has data: ' + (latest.data ? 'Yes' : 'No'));
    } else {
      Logger.log('❌ No response found');
    }
  } catch (error) {
    Logger.log('❌ Error: ' + error);
  }
}
