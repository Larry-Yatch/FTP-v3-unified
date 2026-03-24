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


function exportAndEmailClientPdfs(config) {
  const {
    sheetName, headerRow, startRow,
    nameColumn, docUrlColumn,
    pdfUrlColumn, pdfSentAtCol,
    emailColumn, outputFolderId,
    emailTemplate, fromAddress
  } = config;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  const data = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol).getValues();

  const toProcess = data
    .map((row, i) => ({ row, idx: i }))
    .filter(({ row }) => row[docUrlColumn - 1] && !row[pdfSentAtCol - 1]);

  toProcess.forEach(({ row, idx }) => {
    const rowNum = startRow + idx;
    try {
      const docUrl = String(row[docUrlColumn - 1]);
      const match = docUrl.match(/\/d\/([A-Za-z0-9_-]+)\//);
      if (!match) throw new Error('Bad Doc URL: ' + docUrl);
      const docId = match[1];

      const rawName = String(row[nameColumn - 1] || '').trim();
      const cleanName = rawName.replace(/\s+/g, '_') || `Row${rowNum}`;
      const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const pdfName = `Report_${cleanName}_${ts}.pdf`;

      const docFile = DriveApp.getFileById(docId);
      const pdfBlob = docFile.getBlob().getAs('application/pdf').setName(pdfName);
      const folder = DriveApp.getFolderById(outputFolderId);
      const pdfFile = folder.createFile(pdfBlob);
      const pdfUrl = pdfFile.getUrl();

      let body = emailTemplate.body.replace(/{{FirstName}}/g, rawName.split(' ')[0] || '');
      headers.forEach((h, i) => {
        if (h) {
          body = body.replace(new RegExp(`{{${h}}}`, 'g'), String(row[i] || ''));
        }
      });

      const recipient = String(row[emailColumn - 1] || '');
      if (recipient) {
        const mailOpts = {
          to: recipient,
          subject: emailTemplate.subject,
          body: body,
          attachments: [pdfFile.getBlob()]
        };
        if (fromAddress) mailOpts.from = fromAddress;
        MailApp.sendEmail(mailOpts);
      }

      data[idx][pdfUrlColumn - 1] = pdfUrl;
      data[idx][pdfSentAtCol - 1] = new Date();

    } catch (e) {
      Logger.log(`exportAndEmailClientPdfs row ${rowNum} error: ${e}`);
    }
  });

  const pdfUrls = data.map(r => [r[pdfUrlColumn - 1]]);
  const sentTimes = data.map(r => [r[pdfSentAtCol - 1]]);
  sheet.getRange(startRow, pdfUrlColumn, pdfUrls.length, 1).setValues(pdfUrls);
  sheet.getRange(startRow, pdfSentAtCol, sentTimes.length, 1).setValues(sentTimes);
}


function generateThenSendAll(configDocs, configPdfs) {
  Logger.log("generateThenSendAll triggered");
  generateClientDocs(configDocs);
  exportAndEmailClientPdfs(configPdfs);
}
