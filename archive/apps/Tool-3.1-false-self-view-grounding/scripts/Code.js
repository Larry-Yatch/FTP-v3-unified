

/**
 * Trigger: on form submit (or manual run), copy the new row from
 * "Form Responses 1" into "Working Sheet" (columns A–W),
 * highlight that row in light red, and notify Sarah.
 */
function onFormSubmit(e) {
  FinancialTruPathFunctionLibrary.copyAndNotifySubmission({
    srcSheetName:        'Form Responses 1',
    destSheetName:       'Working Sheet',
    highlightColor:      '#FFCCCC',
    notificationEmail:   'Sarah@TruPathMastery.com',
    notificationSubject: 'New False Self-View Grounding exercise Submission',     //change email subj line and email body with updated link
    notificationBody:    'Someone has submitted a response please go and process their response here: https://docs.google.com/spreadsheets/d/1e_Kzu1PnzlZKjN0H86jPz16DebrrrLVp79tWNUR6QkA/edit?gid=980485329#gid=980485329'
  }, e);
}

/**
 * STEP1: Normalize only specified columns once, verify mapping, highlight any failures
 * Skips rows already processed (column AJ = 'yes'), writes ‘yes’ into AJ when done.
 */
function step1() {
  const sheet    = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow  = sheet.getLastRow();
  if (lastRow < startRow) return;

  // Columns to normalize
  const cols = [4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 25, 26, 27, 28, 29, 32, 33];
  const numRows   = lastRow - startRow + 1;
  const statusCol = 36;  // AJ

  // 1) Read existing status flags from AJ
  const statusRange = sheet.getRange(startRow, statusCol, numRows, 1);
  const statusVals  = statusRange.getValues().flat().map(String);

  // 2) Determine block bounds for normalization
  const minCol  = Math.min(...cols);
  const maxCol  = Math.max(...cols);
  const numCols = maxCol - minCol + 1;

  // 3) Batch‐read the data range
  const range  = sheet.getRange(startRow, minCol, numRows, numCols);
  const rawData = range.getValues();

  // 4) Keep a deep copy of originals
  const originals = rawData.map(row => row.slice());

  // 5) Normalization map
  const map = { '-3': 0, '-2': 1, '-1': 2, '1': 3, '2': 4, '3': 5 };

  // 6) Normalize in memory, skipping processed rows
  rawData.forEach((rowValues, i) => {
    if (statusVals[i].toLowerCase() === 'yes') return;
    cols.forEach(col => {
      const idx = col - minCol;
      const val = String(rowValues[idx]).trim();
      if (map.hasOwnProperty(val)) {
        rowValues[idx] = map[val];
      }
    });
    statusVals[i] = 'yes';
  });

  // 7) Write normalized data and updated status flags back
  range.setValues(rawData);
  statusRange.setValues(statusVals.map(v => [v]));

  // 8) Verification: check only the normalized columns
  const verified = range.getValues();
  const failures = [];
  verified.forEach((rowVals, i) => {
    cols.forEach(col => {
      const idx  = col - minCol;
      const cell = rowVals[idx];
      if (typeof cell !== 'number' || cell < 0 || cell > 5) {
        failures.push({
          row:      startRow + i,
          col:      col,
          original: originals[i][idx],
          current:  cell
        });
      }
    });
  });

  // 9) Highlight any failures and add original value as a comment
  if (failures.length) {
    failures.forEach(f => {
      const c = sheet.getRange(f.row, f.col);
      c.setBackground('#FFCCCC');
      c.setComment(`Was "${f.original}" before normalization`);
    });
    console.error('Normalization verification failed for:', failures);
  }
}



/**
 * STEP2: FSV Quotient → P (sum D, E, G, I, J; divide by 25)
 */
function step2() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;
  const numRows = lastRow - startRow + 1;

  const dCol = sheet.getRange(startRow, 4, numRows, 1).getValues().flat();
  const eCol = sheet.getRange(startRow, 5, numRows, 1).getValues().flat();
  const gCol = sheet.getRange(startRow, 7, numRows, 1).getValues().flat();
  const iCol = sheet.getRange(startRow, 9, numRows, 1).getValues().flat();
  const jCol = sheet.getRange(startRow, 10, numRows, 1).getValues().flat();

  const pct = dCol.map((_, idx) => [
    (dCol[idx] + eCol[idx] + gCol[idx] + iCol[idx] + jCol[idx]) / 25
  ]);

  sheet.getRange(startRow, 16, pct.length, 1)
       .setValues(pct)
       .setNumberFormat('0%');
}

/**
 * STEP3: Sum K–N → /20 → % → R (18) + suggestions → S (19)
 */
function step3() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3, lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;
  // Read raw scores from columns L–O (12–15)
  const raw = sheet.getRange(startRow, 12, lastRow - startRow + 1, 4).getValues();
  // Compute fraction (0–1)
  const pct = raw.map(r => [(r[0] + r[1] + r[2] + r[3]) / 20]);
  // Write percentage to column R (18)
  sheet.getRange(startRow, 18, pct.length, 1)
       .setValues(pct)
       .setNumberFormat('0%');
  // Generate suggestions in column S (19)
  raw.forEach((r, i) => {
    const row = startRow + i;
    // Compare fraction to threshold 0.6
    const fraction = pct[i][0];
    const minIdx = r.indexOf(Math.min(...r));
    let msg = '';
    if (fraction <= 0.6) {
      if (minIdx === 0) msg = 'By focusing on holistic clarity you will be able to increase your Clarity Quotient.';
      if (minIdx === 1) msg = 'By focusing on clarity and consistency with your income you will increase your Clarity Quotient.';
      if (minIdx === 2) msg = 'By focusing on clarity and consistency with your spending you will increase your Clarity Quotient.';
      if (minIdx === 3) msg = 'By learning and implementing tracking practices you will increase your Clarity Quotient.';
    } else {
      if (minIdx === 0) msg = 'Your Clarity Quotient is above average, but you could focus on holistic clarity.';
      if (minIdx === 1) msg = 'Your Clarity Quotient is above average, but you could focus on income clarity.';
      if (minIdx === 2) msg = 'Your Clarity Quotient is above average, but you could focus on spending clarity.';
      if (minIdx === 3) msg = 'Your Clarity Quotient is above average, but you could focus on tracking practices.';
    }
    sheet.getRange(row, 19).setValue(msg);
  });
}

/**
 * STEP4: Financial Behaviors Quotient → Q (sum E, G, L, O; divide by 20)
 */
function step4() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;
  const eCol = sheet.getRange(startRow, 5, lastRow - startRow + 1, 1).getValues().flat();
  const gCol = sheet.getRange(startRow, 7, lastRow - startRow + 1, 1).getValues().flat();
  const lCol = sheet.getRange(startRow, 12, lastRow - startRow + 1, 1).getValues().flat();
  const oCol = sheet.getRange(startRow, 15, lastRow - startRow + 1, 1).getValues().flat();
  const out = eCol.map((v, i) => [ (v + gCol[i] + lCol[i] + oCol[i]) / 20 ]);
  sheet.getRange(startRow, 17, out.length, 1)
       .setValues(out)
       .setNumberFormat('0%');
}


/**
 * STEP5: Import demographics → write Y–AG; highlight & pause rows with no match,
 * and clear highlight on successful import.
 */
function step5() {
  const sheet    = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow  = sheet.getLastRow();
  if (lastRow < startRow) return;
  const numRows  = lastRow - startRow + 1;

  // 1) Read student IDs from column C
  const keys = sheet.getRange(startRow, 3, numRows, 1).getValues().flat();

  // 2) Build lookup from demographics file
  const DEMO_ID  = '18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0';
  const srcSheet = SpreadsheetApp.openById(DEMO_ID).getSheets()[0];
  const srcData  = srcSheet.getRange(2, 2, srcSheet.getLastRow() - 1, 31).getValues();
  const lookup   = {};
  srcData.forEach(r => {
    lookup[r[0]] = {
      H:  String(r[6]),
      X:  String(r[22]),
      Y:  String(r[23]),
      Z:  String(r[24]),
      AC: String(r[27]),
      R:  String(r[16]),
      S:  String(r[17]),
      F:  String(r[4]),
      G:  String(r[5])
    };
  });

  // 3) Loop and import or highlight/pause
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    // Skip if demographics already imported (column Y)
    if (sheet.getRange(row, 25).getValue()) continue;

    const id  = keys[i];
    const rec = lookup[id];
    if (rec) {
      // --- FOUND: write demographics into Y–AG ---
      sheet.getRange(row, 25, 1, 9).setValues([[
        rec.H, rec.X, rec.Y, rec.Z,
        rec.AC, rec.R, rec.S, rec.F, rec.G
      ]]);

      // Clear any existing pause flag in AS
      if (sheet.getRange(row, 45).getValue() === 'X') {
        sheet.getRange(row, 45).clearContent();
      }
      // **NEW**: clear any red highlight from columns A–C
      sheet.getRange(row, 1, 1, 3).setBackground(null);

    } else {
      // --- NOT FOUND: highlight A–C and mark pause in AS ---
      sheet.getRange(row, 1, 1, 3).setBackground('#FFCCCC');
      sheet.getRange(row, 45).setValue('X');
    }
  }
}

/**
 * Wrapper for the menu: scans all rows 3→last, and for any row
 * where column Y (25) is blank, calls notifyMissingDemographics.
 */
function notifyAllMissingDemographics() {
  const sheet    = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow  = sheet.getLastRow();
  for (let row = startRow; row <= lastRow; row++) {
    // skip rows already imported
    if (sheet.getRange(row, 25).getValue()) continue;
    const name  = sheet.getRange(row, 1).getValue(); // Col A
    const email = sheet.getRange(row, 2).getValue(); // Col B
    notifyMissingDemographics(row, name, email);
  }
}

/**
 * Handles a single “missing demographics” case:
 *  • highlights A–C in red
 *  • emails the student
 *  • emails Sarah
 *  • marks X in AS
 */
function notifyMissingDemographics(row, name, email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 1) highlight A–C
  sheet.getRange(row, 1, 1, 3).setBackground('#FFCCCC');

  // 2) email to student
  const subj1 = 'Urgent request from TruPath regarding your False Self-View Results.';
  const body1 = `Thanks for submitting your False Self-View worksheet!

We use a custom algorithm to analyze your input and generate personalized coaching to help you shift your financial reality.

Before we can process your results, we need you to complete the Orientation Demographics worksheet:
👉 Complete it here: https://forms.gle/pWV3cHxncB7wGZYR6

It only takes about 20 minutes and is essential not just for this module, but for future work in the course. It will also give you valuable insight into your current financial position.

If you have any questions, reach out to your small group facilitator or contact our program manager, Sarah Last, at Sarah@TruPathMastery.com or (613) 327-0845.

Thanks again,
Larry Yatch
(or more accurately, the helpful software Larry built)`;
  MailApp.sendEmail(email, subj1, body1);

  // 3) email to Sarah
  const subj2 = `${name} was sent a request to complete the Demographics Worksheet; their FSV data was paused`;
  const body2 = 'Please monitor their completion so that we can process their FSV data.';
  MailApp.sendEmail('sarah@trupathmastery.com', subj2, body2);

  // 4) mark pause flag in AS (45)
  sheet.getRange(row, 45).setValue('X');
}



/**
 * STEP6: Demographic Calculations → AH (34) & AI (35)
 */
function step6() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow  = sheet.getLastRow();
  if (lastRow < startRow) return;

  const numRows = lastRow - startRow + 1;
  const m1 = sheet.getRange(startRow, 25, numRows, 5).getValues(); // Y–AC
  const m2 = sheet.getRange(startRow, 32, numRows, 2).getValues(); // AF–AG

  const BASE1 = 25, BASE2 = 10;
  const out1 = [], out2 = [];

  for (let i = 0; i < numRows; i++) {
    let sum1 = 0, miss1 = 0;
    m1[i].forEach(v => typeof v === 'number' ? sum1 += v : miss1++);
    const denom1 = BASE1 - miss1 * 5;
    out1.push([ denom1 > 0 ? sum1 / denom1 : 0 ]);

    let sum2 = 0, miss2 = 0;
    m2[i].forEach(v => typeof v === 'number' ? sum2 += v : miss2++);
    const denom2 = BASE2 - miss2 * 5;
    out2.push([ denom2 > 0 ? sum2 / denom2 : 0 ]);
  }

  // Write to AH (34) & AI (35)
  sheet.getRange(startRow, 34, out1.length, 1).setValues(out1).setNumberFormat('0%');
  sheet.getRange(startRow, 35, out2.length, 1).setValues(out2).setNumberFormat('0%');
}

/**
 * STEP7: False Self-View Calculation
 * Only processes rows where AK–AQ are all blank, and skips any row
 * where those output columns already have values.
 */
function step7() {
  const sheet    = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow  = sheet.getLastRow();
  if (lastRow < startRow) return;

  const CQ       = 0.16; // tuning threshold

  for (let row = startRow; row <= lastRow; row++) {
    // 0) Check AK–AQ (cols 37–43): if *any* value exists, skip this row
    const outputs = sheet.getRange(row, 37, 1, 7)
                         .getValues()[0];
    const alreadyDone = outputs.some(cell => cell !== '' && cell !== null);
    if (alreadyDone) continue;

    // Read all the inputs once
    const dVal = sheet.getRange(row, 4).getValue();   // D
    const lVal = sheet.getRange(row, 12).getValue();  // L
    const hVal = sheet.getRange(row, 8).getValue();   // H
    const y    = sheet.getRange(row, 25).getValue();  // Y

    const pVal = sheet.getRange(row, 16).getValue();  // P
    const qVal = sheet.getRange(row, 17).getValue();  // Q
    const rVal = sheet.getRange(row, 18).getValue();  // R
    const ah   = sheet.getRange(row, 34).getValue();  // AH
    const aiVal= sheet.getRange(row, 35).getValue();  // AI

    // Composite metric
    const first = ((y / 5) + ah) / 2;

    // Comparison 1 → AK
    let result1 = 'No';
    if ( first > pVal + CQ ) {
      result1 = dVal <= 3 ? 'Yes' : 'Maybe';
    }
    sheet.getRange(row, 37).setValue(result1);

    // Comparison 2 → AL
    let result2 = 'No';
    if ( first > qVal + CQ ) {
      result2 = dVal <= 3 ? 'Yes' : 'Maybe';
    }
    sheet.getRange(row, 38).setValue(result2);

    // Comparison 3 → AM
    let result3 = 'No';
    if ( rVal > (lVal / 5) + CQ ) {
      result3 = 'Yes';
    }
    sheet.getRange(row, 39).setValue(result3);

    // Comparison 4 → AN
    let result4 = 'No';
    if ( ah > (y / 5) + CQ/2 ) {
      result4 = dVal <= 3 ? 'Yes' : 'Maybe';
    }
    sheet.getRange(row, 40).setValue(result4);

    // Comparison 6 → AP
    let result6 = 'No';
    if ( first > (hVal / 5) + CQ ) {
      result6 = aiVal <= 0.5 ? 'Yes' : 'Maybe';
    }
    sheet.getRange(row, 42).setValue(result6);

    // Comparison 7 → AQ
    let result7 = 'No';
    if ( first > (hVal / 5) + CQ ) {
      result7 = dVal <= 3 ? 'Yes' : 'Maybe';
    }
    sheet.getRange(row, 43).setValue(result7);

        // Comparison 5 → AO (only if AN was Yes/Maybe)
    let result5 = 'No';
    if (result4 === 'Yes' || result4 === 'Maybe' ||result1 === 'Yes' || result1 === 'Maybe' || result2 === 'Yes' || result2 === 'Maybe' ||result3 === 'Yes' || result3 === 'Maybe' ||result6 === 'Yes' || result6 === 'Maybe' ||result7 === 'Yes' || result7 === 'Maybe') {
      if ( rVal <= 0.5 ) result5 = 'Yes';
    }
    sheet.getRange(row, 41).setValue(result5);
  }
}

 
/**
 * GPT ANALYSIS
 */
function analyzeResponses() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const startRow = 3;
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;
  for (let i = 0; i < lastRow - startRow + 1; i++) {
    const r = startRow + i;
    // Skip if column T (20) already has a value
    if (sheet.getRange(r, 20).getValue()) continue;
    const e = sheet.getRange(r, 6).getValue();  // column F
    const j = sheet.getRange(r, 11).getValue(); // column K
    if (e && j) {
      const prompt = `${e}
${j}`;
      const resp = callChatGPT(prompt, r);
      let data = {};
      try { data = JSON.parse(resp); } catch {}
      sheet.getRange(r, 20).setValue(data.Behavior || '');
      sheet.getRange(r, 21).setValue(data.Description || '');
      sheet.getRange(r, 22).setValue(data.Assessment || '');
      sheet.getRange(r, 23).setValue(data.Connection || '');
      sheet.getRange(r, 24).setValue(data.Limitation || '');
      Utilities.sleep(1000);
    }
  }
}



/**
 * CALL CHATGPT
 */
function callChatGPT(text, row) {
  const key = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!key) throw Error('API key missing');

  const sys = `You are an expert at financial analysis and emotional psychology.
Analyze two responses:
1) "Describe how you are with money"
2) "Shortcomings with money"
Tasks:
1. Identify the main behavior.
2. Provide a concise description.
3. Assess if it is positive or negative for financial freedom.
4. Identify the connection.
5. Identify the biggest limitation.
Answer as if you are speaking to your client and have all 5 answers read as a coherent narrative.  For example, "The main behavior that limits your financial freedom is overspending. You tend to ..."
Respond ONLY in JSON with keys: Behavior,Description,Assessment,Connection,Limitation.`;

  const payload = {
    model: 'gpt-4.1-nano',
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: `Row ${row}: "${text}"` }
    ],
    temperature: 0.2,
    max_tokens: 350
  };

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify(payload)
  });

  let txt = '';
  try {
    txt = JSON.parse(res.getContentText()).choices[0].message.content.trim();
  } catch {
    txt = res.getContentText();
  }
  return txt.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
}

/**
 * STEP8: Generate Reports
 * Copies the template, replaces {{placeholders}} with sheet values,
 * exports to PDF and emails it, then writes the Google Doc link to column 44,
 * skipping any row marked “X” in column AS (45).
 */
function step8() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const TEMPLATE_ID = '1H-7lDVkG7Bj3I3FB7DYf-nZDJZqFUZIBIKvnO6mDqbU';
  const FOLDER_ID   = '15nfGn8ogvKeeqiycTqoR1tyfUjJds8sl';
  const headers     = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const startRow    = 3;
  const lastRow     = sheet.getLastRow();
  const folder      = DriveApp.getFolderById(FOLDER_ID);

  for (let row = startRow; row <= lastRow; row++) {
    // Skip paused rows
    if (sheet.getRange(row, 45).getValue() === 'X') continue;

    // Skip already‐generated reports
    const existing = sheet.getRange(row, 44).getValue();
    if (existing) continue;

    const name  = sheet.getRange(row, 1).getValue(); // Column A
    const email = sheet.getRange(row, 2).getValue(); // Column B
    const fileName = `${name} Financial False Self-View Report`;

    // Copy template and replace placeholders
    const copyFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy(fileName, folder);
    const doc      = DocumentApp.openById(copyFile.getId());
    const body     = doc.getBody();
    headers.forEach((h, i) => {
      const placeholder = `{{${h}}}`;
      const value       = sheet.getRange(row, i + 1).getDisplayValue();
      body.replaceText(placeholder, value);
    });
    doc.saveAndClose();

    // Export to PDF and email
    const pdfBlob = copyFile.getAs('application/pdf');
    const subject = 'Your Financial False Self-View Grounding Report';
    const message = `Hi ${name},

Thank you for your patience as we worked out all the bugs in the new software.

Please find attached your personalized Financial False Self-View Grounding Report.

Best,
Larry Yatch
(or more accurately, the helpful software Larry built)`;
    MailApp.sendEmail(email, subject, message, { attachments: [pdfBlob] });

    // Write Google Doc link in column 44 (AR)
    sheet.getRange(row, 44).setValue(copyFile.getUrl());
  }
}



