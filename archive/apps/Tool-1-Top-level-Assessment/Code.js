/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TruPath Processing')
    .addItem('Process All Unprocessed Rows', 'processAllUnprocessed')
    .addItem('Process Selected Row', 'processSelectedRow')
    .addSeparator()
    .addItem('Setup Automated Cleanup', 'setupAutomatedCleanup')
    .addItem('Remove Automated Cleanup', 'removeAutomatedCleanup')
    .addToUi();
}

/**
 * Runs on each new form submission.
 * Only processes the triggering row, then exits quickly to avoid lock conflicts.
 */
function onFormSubmit(e) {
  const sheet = e.range.getSheet();
  const triggerRow = e.range.getRow();
  
  // Try to get lock with shorter timeout since we're only processing one row
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // 30 seconds should be plenty for one row
  } catch (err) {
    Logger.log(`Trigger for row ${triggerRow} could not obtain lock: ${err}`);
    // Instead of giving up, mark the row for later processing
    markForRetry(sheet, triggerRow);
    return;
  }

  try {
    // Only process THIS row, not all rows
    const success = processRow(sheet, triggerRow);
    if (!success) {
      Logger.log(`Row ${triggerRow} was already processed or failed validation`);
    }
  } catch (error) {
    Logger.log(`Error processing row ${triggerRow}: ${error}`);
    markForRetry(sheet, triggerRow);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Marks a row for retry by setting a flag (you could use column AV for this)
 */
function markForRetry(sheet, row) {
  try {
    // Use column AV (48) as a "needs processing" flag
    sheet.getRange(row, 48).setValue('RETRY_NEEDED');
  } catch (err) {
    Logger.log(`Could not mark row ${row} for retry: ${err}`);
  }
}

/**
 * Automated cleanup function - runs every 10 minutes via time-driven trigger
 * Processes any rows that are unprocessed or marked for retry
 */
function automatedCleanup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // Adjust if your form data is on a different sheet
  
  const lock = LockService.getScriptLock();
  try {
    // Try to get lock, but don't wait long - we'll catch it on the next run
    lock.waitLock(5000); // Only wait 5 seconds
  } catch (err) {
    Logger.log('Automated cleanup could not obtain lock; will retry on next run');
    return;
  }

  try {
    const lastRow = sheet.getLastRow();
    let processedCount = 0;
    let errorCount = 0;
    
    // Only process rows that need processing (AU empty or AV marked for retry)
    for (let r = 3; r <= lastRow; r++) {
      const processedUrl = sheet.getRange(r, 47).getValue();
      const retryFlag = sheet.getRange(r, 48).getValue();
      
      // Skip if already processed and not marked for retry
      if (processedUrl && retryFlag !== 'RETRY_NEEDED') {
        continue;
      }
      
      try {
        const wasProcessed = processRow(sheet, r);
        if (wasProcessed) {
          processedCount++;
          // Clear retry flag if it exists
          sheet.getRange(r, 48).clearContent();
          Logger.log(`Automated cleanup processed row ${r}`);
        }
      } catch (error) {
        Logger.log(`Automated cleanup error on row ${r}: ${error}`);
        errorCount++;
        // Mark for retry on next run
        markForRetry(sheet, r);
      }
    }
    
    if (processedCount > 0 || errorCount > 0) {
      Logger.log(`Automated cleanup complete: ${processedCount} processed, ${errorCount} errors`);
    }
  } finally {
    lock.releaseLock();
  }
}

/**
 * Setup the automated cleanup trigger (run from menu)
 */
function setupAutomatedCleanup() {
  // First, remove any existing triggers to avoid duplicates
  removeAutomatedCleanup();
  
  // Create a time-driven trigger that runs every 10 minutes
  ScriptApp.newTrigger('automatedCleanup')
    .timeBased()
    .everyMinutes(10)
    .create();
  
  SpreadsheetApp.getUi().alert(
    'Automated cleanup enabled!\n\n' +
    'The system will now check for unprocessed rows every 10 minutes.\n\n' +
    'You can disable this anytime using "Remove Automated Cleanup" from the menu.'
  );
}

/**
 * Remove the automated cleanup trigger (run from menu)
 */
function removeAutomatedCleanup() {
  const triggers = ScriptApp.getProjectTriggers();
  let removedCount = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'automatedCleanup') {
      ScriptApp.deleteTrigger(trigger);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    SpreadsheetApp.getUi().alert(`Automated cleanup disabled! (${removedCount} trigger(s) removed)`);
  } else {
    SpreadsheetApp.getUi().alert('No automated cleanup triggers found.');
  }
}

/**
 * Manual menu option: Process all unprocessed rows
 */
function processAllUnprocessed() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(300000); // 5 minutes for batch processing
  } catch (err) {
    SpreadsheetApp.getUi().alert('Could not obtain lock. Please try again in a few minutes.');
    return;
  }

  try {
    const lastRow = sheet.getLastRow();
    let processedCount = 0;
    let errorCount = 0;
    
    // Process all rows that are either unprocessed (AU empty) or marked for retry (AV = RETRY_NEEDED)
    for (let r = 3; r <= lastRow; r++) {
      try {
        const wasProcessed = processRow(sheet, r);
        if (wasProcessed) {
          processedCount++;
          // Clear retry flag if it exists
          sheet.getRange(r, 48).clearContent();
        }
      } catch (error) {
        Logger.log(`Error processing row ${r}: ${error}`);
        errorCount++;
      }
    }
    
    let message = `Processing complete!\n${processedCount} row(s) processed.`;
    if (errorCount > 0) {
      message += `\n${errorCount} row(s) encountered errors. Check the script logs.`;
    }
    
    SpreadsheetApp.getUi().alert(message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Manual menu option: Process currently selected row
 */
function processSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const currentRow = sheet.getActiveCell().getRow();
  
  if (currentRow <= 2) {
    SpreadsheetApp.getUi().alert('Please select a data row (row 3 or below).');
    return;
  }
  
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    SpreadsheetApp.getUi().alert('Could not obtain lock. Please try again.');
    return;
  }

  try {
    const wasProcessed = processRow(sheet, currentRow);
    if (wasProcessed) {
      // Clear retry flag if it exists
      sheet.getRange(currentRow, 48).clearContent();
      SpreadsheetApp.getUi().alert(`Row ${currentRow} processed successfully!`);
    } else {
      SpreadsheetApp.getUi().alert(`Row ${currentRow} was already processed or skipped.`);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error processing row ${currentRow}: ${error.message}`);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Core logic to process a given row: normalization, scoring, document creation, emailing.
 * Returns true if row was processed, false if skipped.
 */
function processRow(sheet, row) {
  // Skip header rows
  if (row <= 2) return false;

  // If already processed (URL in AU), skip
  const existingUrl = sheet.getRange(row, 47).getValue();
  if (existingUrl) return false;

  // --- Normalize Thoughts (V–AA) into AH–AM ---
  const rawThoughts = sheet.getRange(row, 22, 1, 6).getValues()[0];
  const normThoughts = rawThoughts.map(convertThought);
  sheet.getRange(row, 34, 1, 6).setValues([ normThoughts ]);

  // --- Read Feelings (AB–AG) ---
  const rawFeelings = sheet.getRange(row, 28, 1, 6).getValues()[0];

  // --- Read each 3-col block ---
  const fsv       = sheet.getRange(row,  4, 1, 3).getValues()[0];
  const control   = sheet.getRange(row,  7, 1, 3).getValues()[0];
  const showing   = sheet.getRange(row, 10, 1, 3).getValues()[0];
  const exVal     = sheet.getRange(row, 13, 1, 3).getValues()[0];
  const fear      = sheet.getRange(row, 16, 1, 3).getValues()[0];
  const receiving = sheet.getRange(row, 19, 1, 3).getValues()[0];

  // --- Sum helper ---
  const sumArr = arr => arr.reduce((acc, v) => acc + v, 0);

  // --- Compute final scores: sum(trio) + 2 * normalized thought ---
  const finalScores = [
    sumArr(fsv)       + 2 * normThoughts[0],
    sumArr(control)   + 2 * normThoughts[1],
    sumArr(showing)   + 2 * normThoughts[2],
    sumArr(exVal)     + 2 * normThoughts[3],
    sumArr(fear)      + 2 * normThoughts[4],
    sumArr(receiving) + 2 * normThoughts[5]
  ];

  // Write final scores into AN–AS (cols 40–45)
  sheet.getRange(row, 40, 1, 6).setValues([ finalScores ]);

  // --- Determine winner with tie-break by highest feeling ---
  const maxScore = Math.max(...finalScores);
  const tied = finalScores
    .map((s, i) => s === maxScore ? i : -1)
    .filter(i => i >= 0);
  let winnerIndex = tied[0];
  if (tied.length > 1) {
    let topFeel = -Infinity;
    tied.forEach(i => {
      if (rawFeelings[i] > topFeel) {
        topFeel = rawFeelings[i];
        winnerIndex = i;
      }
    });
  }

  // Write winning category into AT (col 46)
  const setNames = ["FSV","Control","Showing","ExVal","Fear","Receiving"];
  const winnerName = setNames[winnerIndex];
  sheet.getRange(row, 46).setValue(winnerName);

  // --- Prepare for document creation & email ---
  const emailAddr  = sheet.getRange(row, 1).getValue();  // Column A
  const personName = sheet.getRange(row, 3).getValue();  // Column C

  const TEMPLATE_IDS = {
    FSV:       '1VkP7VN6FPz5EmqD5lXOww0Y_3-pJCyo0I9_YLe8fyK8',
    Control:   '1OVhbQNcZkUWS3nWLNageOSIBDsjS9CPEJXWynNPjwew',
    Showing:   '1WS2jPxYwOksSpVsne_tij5e3gcjAg8-NesXalDnBfzw',
    ExVal:     '1i7eaifzqQ3RtS00FFNge1A9odCzmZTnFjMT4I4TcKPQ',
    Fear:      '1L4vuSJNUYq-MzUFSD8blx9dNL-ha2kN09t3CwrM4LI8',
    Receiving: '14TwkN8OBvqScv2FdmF6LzxMCBxRm6NQNWyVQxmMIjHU'
  };
  const DEST_FOLDER_ID = '1BF1Tsp9h8D1CPcOhuClaMpSBBWzJPEZi';
  const EMAIL_SUBJECT  = 'Your Core Trauma Strategy';
  const EMAIL_BODY     = 'Hi {{name}},\n\nCongratulations on filling out the TruPath Core Trauma Strategy assessment.\n\nBelow you will find your results attached.\n\nRegards,\nThe TruPath Team';

  // Copy appropriate template & move to destination
  const newTitle = `${personName} Core Trauma Strategy`;
  const newFile = DriveApp.getFileById(TEMPLATE_IDS[winnerName])
                       .makeCopy(newTitle, DriveApp.getFolderById(DEST_FOLDER_ID));

  // Write new doc URL into AU (col 47)
  sheet.getRange(row, 47).setValue(newFile.getUrl());

  // Populate the document
  const docBody = DocumentApp.openById(newFile.getId()).getBody();
  docBody.replaceText('{{FSV_score}}',       finalScores[0]);
  docBody.replaceText('{{Control_score}}',   finalScores[1]);
  docBody.replaceText('{{Showing_score}}',   finalScores[2]);
  docBody.replaceText('{{ExVal_score}}',     finalScores[3]);
  docBody.replaceText('{{Fear_score}}',      finalScores[4]);
  docBody.replaceText('{{Receiving_score}}', finalScores[5]);
  DocumentApp.openById(newFile.getId()).saveAndClose();

  // Export to PDF & send email
  const pdfBlob = newFile.getAs('application/pdf');
  MailApp.sendEmail({
    to: emailAddr,
    subject: EMAIL_SUBJECT,
    body: EMAIL_BODY.replace('{{name}}', personName),
    attachments: [pdfBlob],
    name: 'TruPath Team'
  });
  
  return true;
}

/**
 * Converts raw Thought value (1–10) to target scale: 1→-5 … 5→-1; 6→1 …10→5
 */
function convertThought(v) {
  if (v >= 1 && v <= 5) return v - 6;
  if (v >= 6 && v <= 10) return v - 5;
  return null;
}
