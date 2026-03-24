/**
 * Trigger: on form submit (or manual run), copy the new row from
 * "Form Responses 1" into "Working Sheet",
 * highlight that row in light red, and notify Sarah.
 * 
 * UPDATED: Now includes formula parse error prevention and proper checkbox marking
 */
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = ss.getSheetByName('Form Responses 1');
    const workingSheet = ss.getSheetByName('Working Sheet');
    
    if (!formSheet || !workingSheet) {
      console.error('Required sheets not found');
      return;
    }
    
    // Get the submitted row data
    let rowData;
    if (e && e.values) {
      rowData = e.values;
    } else if (e && e.range) {
      rowData = e.range.getValues()[0];
    } else {
      // Fallback: get last row from Form Responses
      const lastRow = formSheet.getLastRow();
      rowData = formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn()).getValues()[0];
    }
    
    // Clean the data to prevent formula parse errors
    const cleanedData = cleanFormData(rowData);
    
    // Copy to Working Sheet
    const targetRow = workingSheet.getLastRow() + 1;
    workingSheet.getRange(targetRow, 1, 1, cleanedData.length).setValues([cleanedData]);
    
    // Highlight the row in light red
    workingSheet.getRange(targetRow, 1, 1, workingSheet.getLastColumn()).setBackground('#FFCCCC');
    
    console.log(`✅ Copied form response to Working Sheet row ${targetRow}`);
    console.log(`   Name: ${cleanedData[1]}`);
    console.log(`   Email: ${cleanedData[2]}`);
    console.log(`   Student ID: ${cleanedData[3]}`);
    
    // Handle tracking and notification
    const studentId = cleanedData[3]; // Column D (4th column)
    const trackingResult = markStudentTracking(studentId);
    
    // Get spreadsheet URL for the email
    const spreadsheetUrl = ss.getUrl();
    const trackingSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo/edit';
    
    // Send notification email
    const emailConfig = {
      to: 'Sarah@TruPathMastery.com',
      subject: trackingResult.found 
        ? `✅ New Control Fear Grounding Submission - ${cleanedData[1]}` 
        : `⚠️ Control Fear Grounding Submission (Student ID Not Found) - ${cleanedData[1]}`,
      body: trackingResult.found
        ? `Hi Sarah,\n\n` +
          `A new Control Fear Grounding assessment has been submitted and successfully tracked.\n\n` +
          `Student Details:\n` +
          `• Name: ${cleanedData[1]}\n` +
          `• Email: ${cleanedData[2]}\n` +
          `• Student ID: ${studentId}\n` +
          `• Submission Time: ${cleanedData[0]}\n` +
          `• Added to Row: ${targetRow}\n\n` +
          `✅ Tracking Status: Student ID found and marked in row ${trackingResult.rowNumber || 'N/A'}\n\n` +
          `Next Steps:\n` +
          `1. Process the response here:\n   ${spreadsheetUrl}#gid=0&range=${targetRow}:${targetRow}\n\n` +
          `2. Run the processing pipeline functions\n\n` +
          `Best regards,\n` +
          `Control Fear Grounding System`
        : `Hi Sarah,\n\n` +
          `A new Control Fear Grounding assessment has been submitted but requires manual tracking.\n\n` +
          `Student Details:\n` +
          `• Name: ${cleanedData[1]}\n` +
          `• Email: ${cleanedData[2]}\n` +
          `• Student ID: ${studentId || 'Not provided'}\n` +
          `• Submission Time: ${cleanedData[0]}\n` +
          `• Added to Row: ${targetRow} (highlighted in yellow)\n\n` +
          `⚠️ Issue: Student ID "${studentId}" was not found in the tracking sheet.\n\n` +
          `Required Actions:\n` +
          `1. Manually mark submission in tracking sheet:\n   ${trackingSpreadsheetUrl}\n\n` +
          `2. Process the response here:\n   ${spreadsheetUrl}#gid=0&range=${targetRow}:${targetRow}\n\n` +
          `3. Verify the Student ID is correct or add it to the tracking sheet\n\n` +
          `Best regards,\n` +
          `Control Fear Grounding System`
    };
    
    // If student ID not found, highlight in yellow
    if (!trackingResult.found) {
      workingSheet.getRange(targetRow, 1, 1, workingSheet.getLastColumn()).setBackground('#FFFF00');
    }
    
    // Send email notification
    try {
      MailApp.sendEmail(emailConfig);
      console.log(`✅ Notification email sent to ${emailConfig.to}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError.message);
    }
    
  } catch (error) {
    console.error('Error in onFormSubmit:', error.message);
    console.error(error.stack);
  }
}

/**
 * Clean form data to prevent formula parse errors
 * Adds apostrophe prefix to cells starting with =, +, -, @
 */
function cleanFormData(rowData) {
  return rowData.map((cell, idx) => {
    if (cell && typeof cell === 'string') {
      // If it starts with formula characters, prepend with apostrophe
      if (cell.startsWith('=') || cell.startsWith('+') || cell.startsWith('-') || cell.startsWith('@')) {
        return "'" + cell; // Apostrophe forces text interpretation
      }
    }
    return cell;
  });
}

/**
 * Mark student tracking in the tracking spreadsheet
 * Returns {found: boolean, message: string}
 */
function markStudentTracking(studentId) {
  if (!studentId) {
    return {found: false, message: 'No Student ID provided'};
  }
  
  try {
    // Open the tracking spreadsheet
    const trackingSpreadsheet = SpreadsheetApp.openById('104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo');
    const trackingSheet = trackingSpreadsheet.getSheetByName('Financial');
    
    if (!trackingSheet) {
      console.error('Tracking sheet "Financial" not found');
      return {found: false, message: 'Tracking sheet not found'};
    }
    
    // Find the student ID in column G
    const lastRow = trackingSheet.getLastRow();
    const studentIds = trackingSheet.getRange(`G1:G${lastRow}`).getValues();
    
    for (let i = 0; i < studentIds.length; i++) {
      if (String(studentIds[i][0]).trim() === String(studentId).trim()) {
        const rowNumber = i + 1;
        const avColumn = 48; // Column AV
        
        // Mark with TRUE (for checkbox column)
        trackingSheet.getRange(rowNumber, avColumn).setValue(true);
        
        // Add timestamp in next column (AW)
        trackingSheet.getRange(rowNumber, avColumn + 1).setValue(new Date());
        
        console.log(`✅ Marked tracking sheet row ${rowNumber}, column AV with TRUE`);
        return {found: true, message: `Student ID ${studentId} found and marked`, rowNumber: rowNumber};
      }
    }
    
    console.log(`❌ Student ID "${studentId}" not found in tracking sheet`);
    return {found: false, message: `Student ID ${studentId} not found in tracking sheet`};
    
  } catch (error) {
    console.error('Error accessing tracking sheet:', error.message);
    return {found: false, message: `Error accessing tracking sheet: ${error.message}`};
  }
}

/**
 * Manual function to test form submission with the last row
 */
function testFormSubmissionWithLastRow() {
  console.log('=== TESTING FORM SUBMISSION WITH LAST ROW ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName('Form Responses 1');
  
  if (!formSheet) {
    console.error('Form Responses 1 sheet not found');
    return;
  }
  
  const lastRow = formSheet.getLastRow();
  const rowData = formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn()).getValues()[0];
  
  // Create a mock event
  const mockEvent = {
    values: rowData,
    range: formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn())
  };
  
  console.log(`Testing with row ${lastRow}`);
  onFormSubmit(mockEvent);
}