/**
 * EMERGENCY FIX: Add Is_Latest column and mark existing responses
 * Run this ONCE from Apps Script editor
 */

function fixResponsesSheetStructure() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName('RESPONSES');

  if (!sheet) {
    Logger.log('❌ RESPONSES sheet not found!');
    return;
  }

  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('Current headers: ' + JSON.stringify(headers));

  // Check if Is_Latest exists
  const isLatestCol = headers.indexOf('Is_Latest');

  if (isLatestCol === -1) {
    Logger.log('⚠️ Is_Latest column missing! Adding it...');

    // Add Is_Latest column in position G (column 7)
    // Expected structure: Timestamp | Client_ID | Tool_ID | Data | Results | Status | Is_Latest
    const targetCol = 7; // Column G

    // Add header
    sheet.getRange(1, targetCol).setValue('Is_Latest');
    Logger.log('✅ Added Is_Latest header in column ' + targetCol);

    // Now mark existing rows
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      Logger.log(`Updating ${lastRow - 1} existing rows...`);

      // Get all data
      const data = sheet.getDataRange().getValues();
      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const timestampCol = headers.indexOf('Timestamp');

      // Group by client+tool to find latest
      const latestMap = {};

      for (let i = 1; i < data.length; i++) {
        const clientId = data[i][clientIdCol];
        const toolId = data[i][toolIdCol];
        const timestamp = new Date(data[i][timestampCol]).getTime();
        const key = clientId + '_' + toolId;

        if (!latestMap[key] || timestamp > latestMap[key].timestamp) {
          latestMap[key] = {
            row: i + 1, // 1-indexed for sheets
            timestamp: timestamp
          };
        }
      }

      // Mark all as false first
      const isLatestValues = [];
      for (let i = 1; i < data.length; i++) {
        isLatestValues.push(['false']);
      }
      sheet.getRange(2, targetCol, isLatestValues.length, 1).setValues(isLatestValues);

      // Mark latest as true
      let markedCount = 0;
      Object.values(latestMap).forEach(item => {
        sheet.getRange(item.row, targetCol).setValue('true');
        markedCount++;
      });

      Logger.log(`✅ Marked ${markedCount} rows as Is_Latest=true`);
    }

    Logger.log('✅ Fix complete!');

  } else {
    Logger.log('✅ Is_Latest column already exists at position ' + (isLatestCol + 1));

    // Verify data integrity
    const data = sheet.getDataRange().getValues();
    let trueCount = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][isLatestCol] === 'true') {
        trueCount++;
      }
    }
    Logger.log(`   Found ${trueCount} rows marked as Is_Latest=true`);
  }

  // Show TEST001 status
  Logger.log('\n📊 TEST001 Tool 1 Status:');
  const test001 = sheet.createTextFinder('TEST001').findAll();
  Logger.log(`   Found ${test001.length} TEST001 rows total`);

  const testData = sheet.getDataRange().getValues();
  const clientIdCol = headers.indexOf('Client_ID');
  const toolIdCol = headers.indexOf('Tool_ID');
  const statusCol = headers.indexOf('Status');
  const isLatestColFinal = headers.indexOf('Is_Latest');

  for (let i = 1; i < testData.length; i++) {
    if (testData[i][clientIdCol] === 'TEST001' && testData[i][toolIdCol] === 'tool1') {
      Logger.log(`   Row ${i + 1}: Status=${testData[i][statusCol]}, Is_Latest=${testData[i][isLatestColFinal]}`);
    }
  }
}

/**
 * Quick test to verify ResponseManager can find TEST001 data
 */
function testResponseManager() {
  Logger.log('Testing ResponseManager with TEST001...\n');

  try {
    const latest = ResponseManager.getLatestResponse('TEST001', 'tool1');

    if (latest) {
      Logger.log('✅ ResponseManager.getLatestResponse() found data:');
      Logger.log('   Status: ' + latest.status);
      Logger.log('   Timestamp: ' + latest.timestamp);
      Logger.log('   Has data: ' + (latest.data ? 'Yes' : 'No'));
    } else {
      Logger.log('❌ ResponseManager.getLatestResponse() returned null');
      Logger.log('   This means either:');
      Logger.log('   1. No TEST001 data exists');
      Logger.log('   2. Is_Latest column is missing/incorrect');
      Logger.log('   3. There\'s a bug in ResponseManager');
    }
  } catch (error) {
    Logger.log('❌ Error calling ResponseManager: ' + error);
  }

  // Also test DataService
  try {
    const latest2 = DataService.getLatestResponse('TEST001', 'tool1');

    if (latest2) {
      Logger.log('\n✅ DataService.getLatestResponse() found data:');
      Logger.log('   Status: ' + latest2.status);
    } else {
      Logger.log('\n❌ DataService.getLatestResponse() returned null');
    }
  } catch (error) {
    Logger.log('\n❌ Error calling DataService: ' + error);
  }
}
