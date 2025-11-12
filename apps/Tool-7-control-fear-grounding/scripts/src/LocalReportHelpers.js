function generateControlFearDocs(configDocs) {
  const {
    sheetName,
    headerRow,
    startRow,
    nameColumn,
    docUrlColumn,
    docCreatedAtCol,
    templateDocId,
    outputFolderId
  } = configDocs;

  // Validate Drive resources upfront
  let templateFile, outputFolder;
  try {
    templateFile = DriveApp.getFileById(templateDocId);
    outputFolder = DriveApp.getFolderById(outputFolderId);
  } catch (e) {
    throw new Error(`Configuration error: Unable to access template or folder. ${e.message}`);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastColumn).getValues()[0];
  const data = sheet.getRange(startRow, 1, lastRow - (startRow - 1), lastColumn).getValues();

  const output = [];
  const dataEndColumn = 100; // System columns start at 101, only use data columns for placeholders

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const existingUrl = row[docUrlColumn - 1];
    const existingCreated = row[docCreatedAtCol - 1];

    if (existingUrl) {
      output.push([existingUrl, existingCreated]);
      continue;
    }

    try {
      const rawName = row[nameColumn - 1];
      const cleanName = rawName ? String(rawName).replace(/\s+/g, '_') : `Row${startRow + i}`;
      const timestampStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const copyName = `ControlFearReport_${cleanName}_${timestampStr}`;

      const newFile = templateFile.makeCopy(copyName, outputFolder);
      const newDocId = newFile.getId();
      const doc = DocumentApp.openById(newDocId);
      const body = doc.getBody();

      // Only replace placeholders for data columns, not system columns
      headers.forEach((headerName, idx) => {
        if (!headerName || idx >= dataEndColumn) return;
        // Escape special regex characters in header name
        const escapedHeader = headerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const placeholder = `{{${escapedHeader}}}`;
        const cellValue = row[idx] != null ? String(row[idx]) : '';
        body.replaceText(placeholder, cellValue);
      });

      doc.saveAndClose();
      const newDocUrl = `https://docs.google.com/document/d/${newDocId}/edit`;
      output.push([newDocUrl, new Date()]);
    } catch (e) {
      console.error(`Error generating document for row ${startRow + i}: ${e.message}`);
      output.push(['', '']); // Keep alignment with row numbers
    }
  }

  const urlsOnly = output.map(pair => [pair[0]]);
  const timesOnly = output.map(pair => [pair[1]]);

  if (urlsOnly.length) {
    sheet.getRange(startRow, docUrlColumn, urlsOnly.length, 1).setValues(urlsOnly);
  }
  if (timesOnly.length) {
    sheet.getRange(startRow, docCreatedAtCol, timesOnly.length, 1).setValues(timesOnly);
  }
}

function exportAndEmailControlFearPdfs(config) {
  const {
    sheetName, headerRow, startRow,
    nameColumn, docUrlColumn,
    pdfUrlColumn, pdfSentAtCol,
    emailColumn, outputFolderId,
    emailTemplate, fromAddress
  } = config;

  // Validate output folder upfront
  let outputFolder;
  try {
    outputFolder = DriveApp.getFolderById(outputFolderId);
  } catch (e) {
    throw new Error(`Configuration error: Unable to access output folder. ${e.message}`);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  const data = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol).getValues();
  
  const dataEndColumn = 100; // System columns start at 101
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const toProcess = data
    .map((row, i) => ({ row, idx: i }))
    .filter(({ row }) => row[docUrlColumn - 1] && !row[pdfSentAtCol - 1]);

  toProcess.forEach(({ row, idx }) => {
    const rowNum = startRow + idx;
    try {
      const docUrl = String(row[docUrlColumn - 1]);
      const match = docUrl.match(/\/d\/([A-Za-z0-9_-]+)\//); 
      if (!match) throw new Error('Invalid document URL format: ' + docUrl);
      const docId = match[1];

      const rawName = String(row[nameColumn - 1] || '').trim();
      const cleanName = rawName.replace(/\s+/g, '_') || `Row${rowNum}`;
      const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const pdfName = `ControlFearReport_${cleanName}_${ts}.pdf`;

      // Safer FirstName extraction with fallback
      const nameParts = rawName.split(' ').filter(part => part);
      const firstName = nameParts[0] || 'Friend';

      const docFile = DriveApp.getFileById(docId);
      const pdfBlob = docFile.getBlob().getAs('application/pdf').setName(pdfName);
      const pdfFile = outputFolder.createFile(pdfBlob);
      const pdfUrl = pdfFile.getUrl();

      // Build email body with safer replacements
      let body = emailTemplate.body.replace(/{{FirstName}}/g, firstName);
      
      // Only replace placeholders for data columns, not system columns
      headers.forEach((h, i) => {
        if (h && i < dataEndColumn) {
          // Escape special regex characters in header name
          const escapedHeader = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          body = body.replace(new RegExp(`{{${escapedHeader}}}`, 'g'), String(row[i] || ''));
        }
      });

      const recipient = String(row[emailColumn - 1] || '').trim();
      
      // Validate email before sending
      if (recipient && emailRegex.test(recipient)) {
        try {
          const mailOpts = {
            to: recipient,
            subject: emailTemplate.subject,
            body: body,
            attachments: [pdfFile.getBlob()]
          };
          if (fromAddress) mailOpts.from = fromAddress;
          MailApp.sendEmail(mailOpts);
          
          // Only mark as sent if email was successful
          data[idx][pdfSentAtCol - 1] = new Date();
          
          // Clear the background color for successfully processed row
          sheet.getRange(rowNum, 1, 1, lastCol).setBackground(null);
        } catch (emailError) {
          console.error(`Failed to send email to ${recipient} for row ${rowNum}: ${emailError.message}`);
          // Don't mark as sent if email failed
        }
      } else if (recipient) {
        console.warn(`Invalid email address for row ${rowNum}: ${recipient}`);
      }

      // Always save PDF URL even if email fails
      data[idx][pdfUrlColumn - 1] = pdfUrl;

    } catch (e) {
      console.error(`Error processing row ${rowNum}: ${e.message}`);
      // Continue processing other rows
    }
  });

  const pdfUrls = data.map(r => [r[pdfUrlColumn - 1]]);
  const sentTimes = data.map(r => [r[pdfSentAtCol - 1]]);
  sheet.getRange(startRow, pdfUrlColumn, pdfUrls.length, 1).setValues(pdfUrls);
  sheet.getRange(startRow, pdfSentAtCol, sentTimes.length, 1).setValues(sentTimes);
}

function generateThenSendControlFearReports(configDocs, configPdfs) {
  Logger.log("generateThenSendControlFearReports triggered");
  generateControlFearDocs(configDocs);
  exportAndEmailControlFearPdfs(configPdfs);
}

/**
 * Validate configuration for document generation
 * Run this before attempting to generate documents
 */
function validateDocumentGenerationConfig() {
  console.log('\n🔍 Validating Document Generation Configuration\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Check template document
  const templateDocId = '11dv4K8Ot9W7VjPjxw9vjSPnwn84_uMdv2zA57Wxd7kk';
  try {
    const templateFile = DriveApp.getFileById(templateDocId);
    const templateDoc = DocumentApp.openById(templateDocId);
    const templateText = templateDoc.getBody().getText();
    
    // Check for expected placeholders
    const expectedPlaceholders = [
      '{{Name_Full}}',
      '{{Email}}',
      '{{Spending_Type}}',
      '{{Spending_Quotient}}',
      '{{Overall_Impact}}'
    ];
    
    const foundPlaceholders = expectedPlaceholders.filter(ph => 
      templateText.includes(ph)
    );
    
    results.passed.push(`✅ Template document accessible: ${templateFile.getName()}`);
    
    if (foundPlaceholders.length > 0) {
      results.passed.push(`✅ Found ${foundPlaceholders.length} expected placeholders in template`);
    } else {
      results.warnings.push(`⚠️ No expected placeholders found in template - verify template format`);
    }
    
  } catch (e) {
    results.failed.push(`❌ Cannot access template document: ${e.message}`);
  }
  
  // Check output folder
  const outputFolderId = '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN';
  try {
    const folder = DriveApp.getFolderById(outputFolderId);
    results.passed.push(`✅ Output folder accessible: ${folder.getName()}`);
    
    // Check write permissions
    try {
      const testFile = folder.createFile('test_write_permission.txt', 'test');
      testFile.setTrashed(true);
      results.passed.push(`✅ Write permissions confirmed for output folder`);
    } catch (e) {
      results.failed.push(`❌ No write permissions for output folder: ${e.message}`);
    }
    
  } catch (e) {
    results.failed.push(`❌ Cannot access output folder: ${e.message}`);
  }
  
  // Check spreadsheet structure
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Working Sheet');
    
    if (sheet) {
      results.passed.push(`✅ Working Sheet found`);
      
      // Check for data
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      
      if (lastRow >= 4) {
        const testRow = sheet.getRange(4, 1, 1, Math.min(lastCol, 10)).getValues()[0];
        const hasData = testRow.some(cell => cell !== '');
        
        if (hasData) {
          results.passed.push(`✅ Data found in Working Sheet (${lastRow - 3} rows)`);
        } else {
          results.warnings.push(`⚠️ Row 4 appears empty - verify data is present`);
        }
      } else {
        results.warnings.push(`⚠️ No data rows found (sheet only has ${lastRow} rows)`);
      }
      
      // Check critical columns
      if (lastCol >= 104) {
        results.passed.push(`✅ Sheet has expected column count (${lastCol} columns)`);
      } else {
        results.warnings.push(`⚠️ Sheet has ${lastCol} columns, expected at least 104`);
      }
      
    } else {
      results.failed.push(`❌ Working Sheet not found`);
    }
  } catch (e) {
    results.failed.push(`❌ Error checking spreadsheet: ${e.message}`);
  }
  
  // Check email quota
  try {
    const emailQuota = MailApp.getRemainingDailyQuota();
    if (emailQuota > 0) {
      results.passed.push(`✅ Email quota available: ${emailQuota} emails remaining today`);
    } else {
      results.failed.push(`❌ No email quota remaining for today`);
    }
  } catch (e) {
    results.warnings.push(`⚠️ Could not check email quota: ${e.message}`);
  }
  
  // Print results
  console.log('\n📋 VALIDATION RESULTS:\n');
  
  if (results.passed.length > 0) {
    console.log('Passed Checks:');
    results.passed.forEach(msg => console.log(msg));
  }
  
  if (results.warnings.length > 0) {
    console.log('\nWarnings:');
    results.warnings.forEach(msg => console.log(msg));
  }
  
  if (results.failed.length > 0) {
    console.log('\nFailed Checks:');
    results.failed.forEach(msg => console.log(msg));
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.failed.length === 0) {
    console.log('\n✅ Configuration is valid! Ready to generate documents.');
    return true;
  } else {
    console.log('\n❌ Configuration has errors. Please fix the failed checks before proceeding.');
    return false;
  }
}