/**
 * Diagnostic script to check if COMPLETED responses have full data
 * even though DRAFT rows were incomplete
 *
 * Run this in Apps Script to check student data
 */

function checkCompletedDataForStudent() {
  const clientId = '7343 RW';  // Change this to test different students
  const toolId = 'tool2';

  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
    .getSheetByName(CONFIG.SHEETS.RESPONSES);

  if (!sheet) {
    Logger.log('RESPONSES sheet not found');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const clientIdCol = headers.indexOf('Client_ID');
  const toolIdCol = headers.indexOf('Tool_ID');
  const dataCol = headers.indexOf('Data');
  const statusCol = headers.indexOf('Status');
  const timestampCol = headers.indexOf('Timestamp');

  Logger.log(`\n=== Checking responses for ${clientId} / ${toolId} ===\n`);

  // Find all responses for this client/tool
  let foundResponses = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][clientIdCol] === clientId && data[i][toolIdCol] === toolId) {
      foundResponses.push({
        row: i + 1,
        timestamp: data[i][timestampCol],
        status: data[i][statusCol],
        dataJson: data[i][dataCol]
      });
    }
  }

  if (foundResponses.length === 0) {
    Logger.log('No responses found for this student/tool');
    return;
  }

  Logger.log(`Found ${foundResponses.length} response(s):\n`);

  foundResponses.forEach((response, idx) => {
    Logger.log(`--- Response ${idx + 1} (Row ${response.row}) ---`);
    Logger.log(`Timestamp: ${response.timestamp}`);
    Logger.log(`Status: ${response.status}`);

    try {
      const parsedData = JSON.parse(response.dataJson);

      // Check if this is wrapped in a data object (COMPLETED format)
      const actualData = parsedData.data || parsedData;

      // Count how many questions have answers
      let answeredQuestions = 0;
      let totalFields = 0;
      let sampleFields = [];

      for (const key in actualData) {
        if (key.startsWith('q') || key.includes('_')) {
          totalFields++;
          if (actualData[key] !== null && actualData[key] !== undefined && actualData[key] !== '') {
            answeredQuestions++;
          }
          // Collect sample fields
          if (sampleFields.length < 10) {
            sampleFields.push(`${key}: ${JSON.stringify(actualData[key]).substring(0, 50)}`);
          }
        }
      }

      Logger.log(`Total fields: ${totalFields}`);
      Logger.log(`Answered fields: ${answeredQuestions}`);
      Logger.log(`Completion rate: ${((answeredQuestions / totalFields) * 100).toFixed(1)}%`);
      Logger.log('\nSample fields:');
      sampleFields.forEach(field => Logger.log(`  ${field}`));

      // Check for page-specific questions
      const page2Fields = Object.keys(actualData).filter(k => k.includes('financial_clarity') || k.includes('income') || k.includes('expenses'));
      const page3Fields = Object.keys(actualData).filter(k => k.includes('false_self'));
      const page4Fields = Object.keys(actualData).filter(k => k.includes('external_validation'));

      Logger.log(`\nPage 2 (Financial Clarity) fields: ${page2Fields.length}`);
      Logger.log(`Page 3 (False Self) fields: ${page3Fields.length}`);
      Logger.log(`Page 4 (External Validation) fields: ${page4Fields.length}`);

    } catch (error) {
      Logger.log(`Error parsing data: ${error}`);
      Logger.log(`Raw data (first 500 chars): ${response.dataJson.substring(0, 500)}`);
    }

    Logger.log('');
  });
}

/**
 * Check all Tool 2 COMPLETED responses for missing data
 */
function checkAllTool2CompletedResponses() {
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
    .getSheetByName(CONFIG.SHEETS.RESPONSES);

  if (!sheet) {
    Logger.log('RESPONSES sheet not found');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const clientIdCol = headers.indexOf('Client_ID');
  const toolIdCol = headers.indexOf('Tool_ID');
  const dataCol = headers.indexOf('Data');
  const statusCol = headers.indexOf('Status');
  const timestampCol = headers.indexOf('Timestamp');

  Logger.log('\n=== Checking ALL Tool 2 COMPLETED responses ===\n');

  let completedResponses = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][toolIdCol] === 'tool2' && data[i][statusCol] === 'COMPLETED') {
      try {
        const parsedData = JSON.parse(data[i][dataCol]);
        const actualData = parsedData.data || parsedData;

        let answeredQuestions = 0;
        let totalFields = 0;

        for (const key in actualData) {
          if (key.startsWith('q') || key.includes('_')) {
            totalFields++;
            if (actualData[key] !== null && actualData[key] !== undefined && actualData[key] !== '') {
              answeredQuestions++;
            }
          }
        }

        const completionRate = totalFields > 0 ? (answeredQuestions / totalFields) * 100 : 0;

        completedResponses.push({
          clientId: data[i][clientIdCol],
          timestamp: data[i][timestampCol],
          totalFields,
          answeredQuestions,
          completionRate
        });

      } catch (error) {
        Logger.log(`Error parsing data for row ${i + 1}: ${error}`);
      }
    }
  }

  Logger.log(`Found ${completedResponses.length} COMPLETED Tool 2 responses\n`);

  // Sort by completion rate
  completedResponses.sort((a, b) => a.completionRate - b.completionRate);

  // Show potentially affected students (low completion rate)
  const affected = completedResponses.filter(r => r.completionRate < 50);

  if (affected.length > 0) {
    Logger.log(`⚠️ Found ${affected.length} potentially affected students:\n`);
    affected.forEach(r => {
      Logger.log(`${r.clientId}: ${r.answeredQuestions}/${r.totalFields} fields (${r.completionRate.toFixed(1)}%) - ${r.timestamp}`);
    });
  } else {
    Logger.log('✓ All COMPLETED responses appear to have good data\n');
  }

  Logger.log('\nAll responses summary:');
  completedResponses.forEach(r => {
    const status = r.completionRate < 50 ? '⚠️' : '✓';
    Logger.log(`${status} ${r.clientId}: ${r.completionRate.toFixed(1)}%`);
  });
}
