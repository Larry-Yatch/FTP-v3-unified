function generateClientDocs(configDocs) {
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

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastColumn).getValues()[0];
  const data = sheet.getRange(startRow, 1, lastRow - (startRow - 1), lastColumn).getValues();

  const output = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const existingUrl = row[docUrlColumn - 1];
    const existingCreated = row[docCreatedAtCol - 1];

    if (existingUrl) {
      output.push([existingUrl, existingCreated]);
      continue;
    }

    const rawName = row[nameColumn - 1];
    const cleanName = rawName ? String(rawName).replace(/\s+/g, '_') : `Row${startRow + i}`;
    const timestampStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const copyName = `Report_${cleanName}_${timestampStr}`;

    const newFile = DriveApp.getFileById(templateDocId).makeCopy(copyName, DriveApp.getFolderById(outputFolderId));
    const newDocId = newFile.getId();
    const doc = DocumentApp.openById(newDocId);
    const body = doc.getBody();

    headers.forEach((headerName, idx) => {
      if (!headerName) return;
      const placeholder = `{{${headerName}}}`;
      const cellValue = row[idx] != null ? String(row[idx]) : '';
      body.replaceText(placeholder, cellValue);
    });

    doc.saveAndClose();
    const newDocUrl = `https://docs.google.com/document/d/${newDocId}/edit`;
    output.push([newDocUrl, new Date()]);
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


/**
 * exportAndEmailClientPdfs – converts Docs to PDF, emails clients,
 * logs PDF URLs & sent timestamps, then updates the student tracker
 * with the PDF link in column Y (or highlights & notifies on failure).
 *
 * @param {Object} config
 *   • sheetName             : string — name of your Working Sheet  
 *   • headerRow             : number — where your headers live  
 *   • startRow              : number — first row of data  
 *   • nameColumn            : number — column index for student name  
 *   • docUrlColumn          : number — column index for the Google Doc URL  
 *   • pdfUrlColumn          : number — column index to write the PDF URL  
 *   • pdfSentAtCol          : number — column index for the PDF-sent timestamp  
 *   • emailColumn           : number — column index for the client’s email  
 *   • outputFolderId        : string — Drive folder ID to store PDFs  
 *   • emailTemplate         : { subject: string, body: string }  
 *   • fromAddress?          : string — optional “from” address  
 *   • trackingSpreadsheetId : string — ID of the student-tracker spreadsheet  
 *   • trackingSheetName     : string — name of the tracker tab (“Financial”)  
 *   • lookupColumn          : string — letter of the tracker’s Student-ID column (“G”)  
 *   • trackerDateColumn     : string — letter of the tracker’s PDF-link column (“Y”)  
 *   • failureSubject        : string — email subject when tracker update fails  
 *   • failureBody           : string — email body when tracker update fails  
 *   • missingHighlightColor : string — highlight color for failures (e.g. '#FFFF00')
 */
function exportAndEmailClientPdfs(config) {
  const {
    sheetName, headerRow, startRow,
    nameColumn, docUrlColumn,
    pdfUrlColumn, pdfSentAtCol,
    emailColumn, outputFolderId,
    emailTemplate, fromAddress,
    trackingSpreadsheetId,
    trackingSheetName,
    lookupColumn,
    trackerDateColumn,
    failureSubject,
    failureBody,
    missingHighlightColor = '#FFFF00'
  } = config;

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  const data    = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol).getValues();

  data.forEach((row, idx) => {
    const rowNum = startRow + idx;
    // Skip if no Doc URL or PDF already sent
    if (!row[docUrlColumn - 1] || row[pdfSentAtCol - 1]) return;

    try {
      // 1) Export Doc to PDF
      const docUrl = String(row[docUrlColumn - 1]);
      const match  = docUrl.match(/\/d\/([A-Za-z0-9_-]+)\//);
      if (!match) throw new Error('Bad Doc URL: ' + docUrl);
      const docId = match[1];

      const rawName  = String(row[nameColumn - 1] || '').trim();
      const clean    = rawName.replace(/\s+/g, '_') || `Row${rowNum}`;
      const dateStr  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const pdfName  = `Report_${clean}_${dateStr}.pdf`;

      const docFile  = DriveApp.getFileById(docId);
      const pdfBlob  = docFile.getBlob().getAs('application/pdf').setName(pdfName);
      const folder   = DriveApp.getFolderById(outputFolderId);
      const pdfFile  = folder.createFile(pdfBlob);
      const pdfUrl   = pdfFile.getUrl();

      // 2) Build & send email
      let body = emailTemplate.body.replace(/{{FirstName}}/g, rawName.split(' ')[0] || '');
      headers.forEach((h, i) => {
        if (h) {
          body = body.replace(new RegExp(`{{${h}}}`, 'g'), String(row[i] || ''));
        }
      });

      const mailOpts = {
        to:          String(row[emailColumn - 1] || ''),
        subject:     emailTemplate.subject,
        body:        body,
        attachments: [pdfFile.getBlob()]
      };
      if (fromAddress) mailOpts.from = fromAddress;
      MailApp.sendEmail(mailOpts);

      // 3) Log PDF URL & timestamp in Working Sheet
      sheet.getRange(rowNum, pdfUrlColumn).setValue(pdfUrl);
      sheet.getRange(rowNum, pdfSentAtCol).setValue(new Date());

      // 4) Update the student-tracker with the PDF URL
      const trackSS = SpreadsheetApp.openById(trackingSpreadsheetId);
      const trackSh = trackSS.getSheetByName(trackingSheetName);
      const lookupVals = trackSh
        .getRange(`${lookupColumn}2:${lookupColumn}${trackSh.getLastRow()}`)
        .getValues().flat();
      const studentId = row[3]; // column D
      const foundIdx  = lookupVals.findIndex(v =>
        String(v).trim() === String(studentId).trim()
      );

      if (foundIdx >= 0) {
        // Write the PDF link into tracker column Y
        trackSh.getRange(`${trackerDateColumn}${foundIdx + 2}`)
               .setValue(pdfUrl);
      } else {
        // Highlight failure in Working Sheet & notify Sarah
        sheet.getRange(rowNum, pdfUrlColumn).setBackground(missingHighlightColor);
        sheet.getRange(rowNum, pdfSentAtCol  ).setBackground(missingHighlightColor);
        MailApp.sendEmail(
          Session.getActiveUser().getEmail(),
          failureSubject,
          failureBody
        );
      }

    } catch (e) {
      Logger.log(`Row ${rowNum} error: ${e}`);
    }
  });
}



function generateThenSendAll(configDocs, configPdfs) {
  Logger.log("generateThenSendAll triggered");
  generateClientDocs(configDocs);
  exportAndEmailClientPdfs(configPdfs);
}
