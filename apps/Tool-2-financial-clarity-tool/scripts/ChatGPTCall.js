/*** 0. CONFIGURATION ***/
const SHEET_NAME       = 'Form Responses 1';
const TEMPLATE_DOC_ID  = '1q4AOnOvsfv_omfxuQMcBvX1P8i5qQ7Y6X6eS_33LT5Q';
const OUTPUT_FOLDER_ID = '1MGsaskYWyASXpX9VPAPwkaGBiqnrrmDl';
const OPENAI_API_KEY   = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

/*** 1. HELPERS ***/

// 1.1 Fetch new, unprocessed rows
function fetchNewResponses() {
  const sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const procIdx = headers.indexOf('Processed');
  if (procIdx < 0) throw new Error('Add a "Processed" column to the sheet.');

  const newRecs = [];
  values.forEach((row, i) => {
    if (!row[procIdx]) {
      const rec = mapRowToObject(headers, row);
      rec._rowNumber = i + 2;
      newRecs.push(rec);
    }
  });
  return newRecs;
}

// 1.2 Map header+row to object
function mapRowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => obj[h] = row[i]);
  return obj;
}

// 1.3 Find column index by header name
function getColumnByHeader(header) {
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const idx = headers.indexOf(header);
  return idx >= 0 ? idx + 1 : null;
}

// 1.4 Update row metrics (scores, means, gaps, weighted) and mark Processed
function updateRowMetrics(rec, metrics) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row   = rec._rowNumber;
  Object.keys(metrics.scores).forEach(domain => {
    sheet.getRange(row, getColumnByHeader(`Score_${domain}`)).setValue(metrics.scores[domain]);
    sheet.getRange(row, getColumnByHeader(`Mean_${domain}`)).setValue(metrics.cohortMeans[domain]);
    sheet.getRange(row, getColumnByHeader(`Gap_${domain}`)).setValue(metrics.gaps[domain]);
    sheet.getRange(row, getColumnByHeader(`Weighted_${domain}`)).setValue(metrics.weighted[domain]);
  });
  sheet.getRange(row, getColumnByHeader('Processed')).setValue(true);
}

/*** 2. METRICS LOGIC ***/
function computeDomainMetrics(rec) {
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const allData = sheet.getDataRange().getValues();
  const dataRows= allData.slice(1);
  const rowData = dataRows[rec._rowNumber - 2];

  const domainCols = {
    Income:        [6,7,8,9,55],
    Spending:      [12,15],
    Debt:          [21,22,23,24,56],
    EmergencyFund: [28,31],
    Savings:       [33,36],
    Investments:   [38,41],
    Retirement:    [43,44,45,46,57],
    Insurance:     [48,51,52,53]
  };
  const stress = {Income:2,Spending:5,Debt:4,EmergencyFund:3,Savings:2,Investments:1,Retirement:1,Insurance:1};

  function sumCols(arr, cols) {
    let t = 0;
    if (cols.length === 2) {
      for (let c = cols[0]-1; c <= cols[1]-1; c++) t += Number(arr[c])||0;
    } else {
      cols.forEach(c => t += Number(arr[c-1])||0);
    }
    return t;
  }

  const scores = {}, cohortMeans = {};
  Object.entries(domainCols).forEach(([d,cols]) => {
    scores[d] = sumCols(rowData, cols);
    let total = 0;
    dataRows.forEach(r => total += sumCols(r, cols));
    cohortMeans[d] = total / dataRows.length;
  });

  const gaps = {}, weighted = {};
  Object.keys(scores).forEach(d => {
    gaps[d]      = scores[d] - cohortMeans[d];
    weighted[d]  = gaps[d] * stress[d];
  });

  const sorted = Object.keys(scores).sort((a,b) => weighted[a] - weighted[b]);
  const high   = sorted.slice(0,2),
        medium = sorted.slice(2,5),
        low    = sorted.slice(5);

  return {scores, cohortMeans, gaps, weighted, priority:{high,medium,low}, focusDomain: high[0]};
}

/*** 3. CHATGPT CALL ***/
function fetchNarrative(metrics) {
  if (!OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY in Script Properties.');

  const systemPrompt = `
You are a friendly, expert financial coach. I will give you a JSON object called “metrics” containing:
  • scores: each domain’s numeric score  
  • cohortMeans: each domain’s cohort average  
  • gaps: the difference score – cohortMean  
  • priority: three arrays (high, medium, low) listing domains in order  
  • focusDomain: the top high-priority domain name  

Your job is to return **only** a single valid JSON object (no surrounding text) with these keys:
1. Intro_Para2  
2. Intro_Para3  
3. Growth_Archetype_Title  
4. Growth_Archetype_Body  
5. Priority_High, Priority_Medium, Priority_Low (arrays of domain names)  

Then, for **each** domain D in [Income,Spending,Debt,EmergencyFund,Savings,Investments,Retirement,Insurance], provide:
  • Insight_D: one or two sentences interpreting *that person’s* gap and score for D.  
  • Action_D: a single, concrete task they can do today that directly addresses their gap in D.  
  • Lift_D: a specific, measurable benefit or emotional relief they’ll see (quantify if possible).

Rules & examples:
- Do **not** reuse the same Action_D or Lift_D across domains.  
- Use domain-specific language: e.g. for EmergencyFund, “Open a separate savings account and set up an automatic $50 transfer every week,” not “save more.”  
- For Lift_D, quantify the benefit or emotional relief: e.g. “You’ll gain 1 point of clarity by knowing exactly where your reserves stand,” or “Feel 30% less stress by eliminating that uncertainty.”  
- Keep tone encouraging and beginner-friendly.

Mini-example:
\`\`\`json
{
  "Insight_Income": "Your income fluctuates month to month, making it hard to budget reliably.",
  "Action_Income": "Set up an automated calendar reminder on the 1st of every month to log every paycheck.",
  "Lift_Income": "+0.5 clarity by ensuring you never miss recording income."
}
\`\`\`

Now, given the “metrics” JSON, produce the full object with all required keys.
`.trim();

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + OPENAI_API_KEY },
    payload: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system',  content: systemPrompt },
        { role: 'user',    content: JSON.stringify(metrics) }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  let text = JSON.parse(response.getContentText())
                  .choices[0].message.content
                  .replace(/^```json\s*/, '')
                  .replace(/\s*```$/, '')
                  .trim();

  Logger.log('Raw narrative JSON:\n' + text);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('JSON parse error in fetchNarrative:\n' + text);
  }
}


/*** 4. PHASE 1: FETCH & STORE NARRATIVE ***/
function fetchAndStoreNarrative() {
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const records = fetchNewResponses();

  records.forEach(rec => {
    const row     = rec._rowNumber;
    const metrics = computeDomainMetrics(rec);

    // Write metrics & mark processed
    updateRowMetrics(rec, metrics);

    // Fetch narrative & flatten/write
    const narrative = fetchNarrative(metrics);
    Object.entries(narrative).forEach(([k,v]) => {
      if (k.startsWith('Insight_') && typeof v === 'object') {
        const d = k.split('_')[1];
        sheet.getRange(row, getColumnByHeader(`Insight_${d}`)).setValue(v.Insight_D);
        sheet.getRange(row, getColumnByHeader(`Action_${d}`)).setValue(v.Action_D);
        sheet.getRange(row, getColumnByHeader(`Lift_${d}`)).setValue(v.Lift_D);
      } else if (Array.isArray(v)) {
        sheet.getRange(row, getColumnByHeader(k)).setValue(v.join(', '));
      } else {
        sheet.getRange(row, getColumnByHeader(k)).setValue(v);
      }
    });

    // Timestamp narrative fetched
    sheet.getRange(row, getColumnByHeader('NarrativeFetched')).setValue(new Date());
  });

  Logger.log(`Fetched & stored narrative for ${records.length} record(s).`);
}

 /* Phase 2: Merge into a Google Doc template, export PDF, and store links,
 * including numbered High/Med/Low placeholders for the Action Plan section.
 */
function mergeToDocAndStoreLink() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  fetchNewResponses()
    .filter(rec => {
      const nf = sheet.getRange(rec._rowNumber, getColumnByHeader('NarrativeFetched')).getValue();
      const nm = sheet.getRange(rec._rowNumber, getColumnByHeader('NarrativeMerged')).getValue();
      return nf && !nm;
    })
    .forEach(rec => {
      const row  = rec._rowNumber;
      const name = rec['First and Last Name'];

      // 1) Read the entire row into mergeData
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const values  = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
      const mergeData = {};
      headers.forEach((h, i) => { mergeData[h] = values[i]; });

      // 2) Expand numbered placeholders for High, Medium, Low
      // High Priority
      (mergeData.Priority_High || '').split(',').map(s=>s.trim()).forEach((domain, idx) => {
        const n = idx + 1;
        mergeData[`High${n}_Domain`] = domain;
        mergeData[`High${n}_Action`] = mergeData[`Action_${domain}`] || '';
        mergeData[`High${n}_Lift`]   = mergeData[`Lift_${domain}`]  || '';
      });
      // Medium Priority
      (mergeData.Priority_Medium || '').split(',').map(s=>s.trim()).forEach((domain, idx) => {
        const n = idx + 1;
        mergeData[`Med${n}_Domain`] = domain;
        mergeData[`Med${n}_Action`] = mergeData[`Action_${domain}`] || '';
        mergeData[`Med${n}_Lift`]   = mergeData[`Lift_${domain}`]  || '';
      });
      // Low Priority
      (mergeData.Priority_Low || '').split(',').map(s=>s.trim()).forEach((domain, idx) => {
        const n = idx + 1;
        mergeData[`Low${n}_Domain`] = domain;
        mergeData[`Low${n}_Action`] = mergeData[`Action_${domain}`] || '';
        mergeData[`Low${n}_Lift`]   = mergeData[`Lift_${domain}`]  || '';
      });

      // 3) Copy the Docs template and open it
      const copyId = DriveApp.getFileById(TEMPLATE_DOC_ID)
        .makeCopy(`Report – ${name}`, DriveApp.getFolderById(OUTPUT_FOLDER_ID))
        .getId();
      const doc  = DocumentApp.openById(copyId);
      const body = doc.getBody();

      // 4) Replace all {{placeholders}}
      Object.entries(mergeData).forEach(([key, val]) => {
        body.replaceText(`{{${key}}}`, (val||'').toString());
      });
      doc.saveAndClose();

      // 5) Export to PDF
      const pdfBlob = DriveApp.getFileById(copyId).getAs('application/pdf');
      const pdfFile = DriveApp.getFolderById(OUTPUT_FOLDER_ID)
        .createFile(pdfBlob)
        .setName(`Report – ${name}.pdf`);

      // 6) Write back the Doc & PDF links and timestamp NarrativeMerged
      sheet.getRange(row, getColumnByHeader('ReportDocLink'))
           .setValue(`https://docs.google.com/document/d/${copyId}/edit`);
      sheet.getRange(row, getColumnByHeader('ReportPDFLink'))
           .setValue(pdfFile.getUrl());
      sheet.getRange(row, getColumnByHeader('NarrativeMerged'))
           .setValue(new Date());

      Logger.log(`Merged report & exported PDF for row ${row} (${name}).`);
    });
}


/*** 6. PHASE 3: SEND EMAILS ***/
function sendReportEmails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  fetchNewResponses()
    .filter(rec => {
      const emailed = sheet.getRange(rec._rowNumber, getColumnByHeader('Emailed')).getValue();
      return !emailed;
    })
    .forEach(rec => {
      const row    = rec._rowNumber;
      const email  = rec['Email'];
      const name   = rec['First and Last Name'].split(' ')[0];
      const pdfUrl = sheet.getRange(row, getColumnByHeader('ReportPDFLink')).getValue();

      // Extract the file ID from the Drive URL
      const match = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
      if (!match) {
        Logger.log(`Could not parse PDF ID from URL: ${pdfUrl}`);
        return;
      }
      const pdfId   = match[1];
      const pdfFile = DriveApp.getFileById(pdfId);

      const subject = 'Your Personalized Financial Coaching Report';
      const body    =
      `Hi ${name},\n\n` +
      `Thank you for your patience.  Here is the actual PDF instead of a link.  \n\nWe look forward to seeing you on that call later today.\n\n` +
      `Best,\n` +
      `Larry\n\n\n`;

      // Send email with the PDF attached
      MailApp.sendEmail({
        to:          email,
        subject:     subject,
        body:        body,
        attachments: [pdfFile.getAs(MimeType.PDF)]
      });

      // Mark as emailed
      sheet.getRange(row, getColumnByHeader('Emailed')).setValue(new Date());
      Logger.log(`Email with PDF attached sent to ${email}`);
    });
}





/*** 7. TEST UTILITIES ***/
function testHeaderMappings() {
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  ['Processed','Score_Income','Mean_Income','Gap_Income','Weighted_Income','Priority_High','Intro_Para2','Insight_Insurance','NarrativeFetched','NarrativeMerged','ReportDocLink','ReportPDFLink','Emailed'].forEach(k=>{
    Logger.log(`${k} → col ${ headers.indexOf(k)>=0 ? headers.indexOf(k)+1 : 'NOT FOUND' }`);
  });
}

function testFetchNarrative() {
  const rec     = fetchNewResponses()[0];
  const metrics = computeDomainMetrics(rec);
  const nar     = fetchNarrative(metrics);
  Logger.log(nar);
}
