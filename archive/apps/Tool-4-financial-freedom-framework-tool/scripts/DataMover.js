function onFormSubmit(e) {
  // 1) Copy & notify
  FinancialTruPathFunctionLibrary.copyAndNotifySubmission({
    srcSheetName:        'Form Responses 1',
    destSheetName:       'Working Sheet',
    highlightColor:      '#FFCCCC',
    notificationEmail:   'Sarah@TruPathMastery.com',
    notificationSubject: 'New External Validation Grounding exercise Submission',
    notificationBody:    'Someone has submitted a response. Please process their response here: https://docs.google.com/spreadsheets/d/1rYA0Pky8cFR5cizPaGm_xO8SBenBVItFM5nViJhgKIM/edit#gid=710708552'
  }, e);

  // 2) Process all new rows’ allocations
  processAllocationForAllRows();

  // 3) Generate documents & send PDFs/emails
  runGenerateAndSendFinancialTruthReports();
}


const FinancialTruPathFunctionLibrary = {
  copyAndNotifySubmission: function (config, e) {
    const {
      srcSheetName,
      destSheetName,
      highlightColor,
      notificationEmail,
      notificationSubject,
      notificationBody
    } = config;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const srcSheet = ss.getSheetByName(srcSheetName);
    const destSheet = ss.getSheetByName(destSheetName);

    const lastRow = srcSheet.getLastRow();
    const newRow = srcSheet.getRange(lastRow, 1, 1, srcSheet.getLastColumn()).getValues()[0];

    // First 3 rows are headers: Form Qs, Clean Headers, Index
    const headerRows = srcSheet.getRange(1, 1, 3, srcSheet.getLastColumn()).getValues();
    const destLastRow = destSheet.getLastRow();

    // If Working Sheet is empty, add headers
    if (destLastRow === 0) {
      destSheet.getRange(1, 1, 3, headerRows[0].length).setValues(headerRows);
    }

    // Write new row to row 4+ of Working Sheet
    const targetRow = destSheet.getLastRow() + 1;
    destSheet.getRange(targetRow, 1, 1, newRow.length).setValues([newRow]);

    // Highlight row
    destSheet.getRange(targetRow, 1, 1, newRow.length).setBackground(highlightColor || '#FFCCCC');

    // Notify via email
    if (notificationEmail) {
      MailApp.sendEmail({
        to: notificationEmail,
        subject: notificationSubject,
        body: notificationBody
      });
    }

    Logger.log(`Copied 1 row to '${destSheetName}' and notified ${notificationEmail}`);
  }
};

