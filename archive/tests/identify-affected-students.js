/**
 * Identify students affected by the data loss bug
 * Analyzes COMPLETED responses after November 10, 2025 for incomplete data
 *
 * INSTRUCTIONS:
 * 1. Open Apps Script editor (clasp open or via Google Sheets)
 * 2. Run this function: identifyAffectedStudents()
 * 3. Check Execution log for results
 * 4. Results will also be written to a new sheet: AFFECTED_STUDENTS
 */

function identifyAffectedStudents() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const responsesSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

  if (!responsesSheet) {
    Logger.log('ERROR: RESPONSES sheet not found');
    return;
  }

  const data = responsesSheet.getDataRange().getValues();
  const headers = data[0];

  // Find column indexes
  const timestampCol = headers.indexOf('Timestamp');
  const clientIdCol = headers.indexOf('Client_ID');
  const toolIdCol = headers.indexOf('Tool_ID');
  const dataCol = headers.indexOf('Data');
  const statusCol = headers.indexOf('Status');

  Logger.log('\n=== ANALYZING RESPONSES FOR DATA LOSS ===');
  Logger.log(`Total rows: ${data.length - 1}`);

  // Cutoff date: November 10, 2025
  const cutoffDate = new Date('2025-11-10');

  const affectedStudents = [];
  const analysisResults = [];

  // Analyze each row
  for (let i = 1; i < data.length; i++) {
    const timestamp = new Date(data[i][timestampCol]);
    const clientId = data[i][clientIdCol];
    const toolId = data[i][toolIdCol];
    const status = data[i][statusCol];
    const dataJson = data[i][dataCol];

    // Only check COMPLETED responses after cutoff date
    if (status !== 'COMPLETED') continue;
    if (timestamp < cutoffDate) continue;

    try {
      const parsedData = JSON.parse(dataJson);

      // Extract actual form data based on tool structure
      let formData;
      if (parsedData.data) {
        formData = parsedData.data;
      } else if (parsedData.formData) {
        formData = parsedData.formData;
      } else if (parsedData.responses) {
        formData = parsedData.responses;
      } else {
        formData = parsedData;
      }

      // Count answered questions
      let totalFields = 0;
      let answeredFields = 0;
      let hasPageField = false;
      let pageNumber = null;

      for (const key in formData) {
        if (key === 'page') {
          hasPageField = true;
          pageNumber = formData[key];
        }

        // Count question fields (exclude metadata)
        if (!['client', 'page', 'route', '_editMode', '_originalTimestamp',
              '_originalResponseId', '_editStarted', 'lastPage', 'lastUpdate'].includes(key)) {
          totalFields++;

          const value = formData[key];
          if (value !== null && value !== undefined && value !== '' && value !== 0) {
            answeredFields++;
          }
        }
      }

      const completionRate = totalFields > 0 ? (answeredFields / totalFields) * 100 : 0;

      // Flag as affected if:
      // 1. Completion rate < 50% OR
      // 2. Has 'page' field set to 1 (indicates only page 1 data saved) OR
      // 3. Tool 2/1 with very low field count
      const isAffected = (
        completionRate < 50 ||
        (hasPageField && pageNumber === '1') ||
        (hasPageField && pageNumber === 1) ||
        ((toolId === 'tool2' || toolId === 'tool1') && totalFields < 10)
      );

      const result = {
        row: i + 1,
        timestamp: Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
        clientId: clientId,
        toolId: toolId,
        totalFields: totalFields,
        answeredFields: answeredFields,
        completionRate: completionRate.toFixed(1),
        hasPageField: hasPageField,
        pageNumber: pageNumber,
        isAffected: isAffected
      };

      analysisResults.push(result);

      if (isAffected) {
        affectedStudents.push(result);
        Logger.log(`⚠️ AFFECTED: ${clientId} | ${toolId} | ${result.timestamp} | ${completionRate.toFixed(1)}% | Page: ${pageNumber}`);
      }

    } catch (error) {
      Logger.log(`Error parsing row ${i + 1} (${clientId}): ${error}`);
    }
  }

  // Summary
  Logger.log('\n=== SUMMARY ===');
  Logger.log(`Total COMPLETED responses after ${Utilities.formatDate(cutoffDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')}: ${analysisResults.length}`);
  Logger.log(`Potentially affected students: ${affectedStudents.length}`);

  if (affectedStudents.length === 0) {
    Logger.log('✓ No affected students found!');
    return;
  }

  Logger.log('\n=== AFFECTED STUDENTS LIST ===');
  affectedStudents.forEach(student => {
    Logger.log(`${student.clientId} | ${student.toolId} | ${student.timestamp} | ${student.completionRate}% complete | Page: ${student.pageNumber}`);
  });

  // Create/update AFFECTED_STUDENTS sheet with results
  writeAffectedStudentsSheet(affectedStudents);

  Logger.log('\n✓ Results written to AFFECTED_STUDENTS sheet');
  Logger.log(`\n⚠️ ACTION REQUIRED: Contact ${affectedStudents.length} student(s) to retake affected assessments`);

  return affectedStudents;
}

/**
 * Write affected students to a dedicated sheet
 */
function writeAffectedStudentsSheet(affectedStudents) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);

  // Delete existing sheet if it exists
  let sheet = ss.getSheetByName('AFFECTED_STUDENTS');
  if (sheet) {
    ss.deleteSheet(sheet);
  }

  // Create new sheet
  sheet = ss.insertSheet('AFFECTED_STUDENTS');

  // Write headers
  const headers = [
    'Client ID',
    'Tool ID',
    'Timestamp',
    'Total Fields',
    'Answered Fields',
    'Completion %',
    'Page Number',
    'Action Required'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

  // Write data
  if (affectedStudents.length > 0) {
    const rows = affectedStudents.map(student => [
      student.clientId,
      student.toolId,
      student.timestamp,
      student.totalFields,
      student.answeredFields,
      student.completionRate + '%',
      student.pageNumber || 'N/A',
      'Contact to retake'
    ]);

    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

    // Format
    sheet.autoResizeColumns(1, headers.length);
    sheet.setFrozenRows(1);

    // Color affected rows
    sheet.getRange(2, 1, rows.length, headers.length).setBackground('#fff3cd');
  } else {
    sheet.getRange(2, 1).setValue('No affected students found');
  }
}

/**
 * Quick check for specific student
 */
function checkSpecificStudent(clientId, toolId) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const responsesSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

  const data = responsesSheet.getDataRange().getValues();
  const headers = data[0];

  const clientIdCol = headers.indexOf('Client_ID');
  const toolIdCol = headers.indexOf('Tool_ID');
  const dataCol = headers.indexOf('Data');
  const statusCol = headers.indexOf('Status');
  const timestampCol = headers.indexOf('Timestamp');

  Logger.log(`\n=== Checking ${clientId} / ${toolId} ===`);

  // Find latest COMPLETED response
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][clientIdCol] === clientId &&
        data[i][toolIdCol] === toolId &&
        data[i][statusCol] === 'COMPLETED') {

      const timestamp = data[i][timestampCol];
      const dataJson = data[i][dataCol];

      Logger.log(`Found COMPLETED response from: ${timestamp}`);

      try {
        const parsedData = JSON.parse(dataJson);
        Logger.log(`\nData structure:`);
        Logger.log(`Top-level keys: ${JSON.stringify(Object.keys(parsedData))}`);

        const formData = parsedData.data || parsedData.formData || parsedData.responses || parsedData;
        Logger.log(`Form data keys: ${JSON.stringify(Object.keys(formData))}`);
        Logger.log(`\nSample values:`);

        let count = 0;
        for (const key in formData) {
          if (count++ < 10) {
            Logger.log(`  ${key}: ${JSON.stringify(formData[key]).substring(0, 100)}`);
          }
        }

      } catch (error) {
        Logger.log(`Error parsing data: ${error}`);
      }

      break;
    }
  }
}

/**
 * Example: Check the student we know is affected
 */
function checkKnownAffectedStudent() {
  checkSpecificStudent('7343 RW', 'tool2');
}
