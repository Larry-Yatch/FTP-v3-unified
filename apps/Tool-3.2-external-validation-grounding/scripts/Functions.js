


function runSTEP1Import() {
 const ss     = SpreadsheetApp.getActiveSpreadsheet();
 //Target sheet destination
 const calcSh = ss.getSheetByName("Working Sheet");


 FinancialTruPathFunctionLibrary.importCore({
   targetSheet:         calcSh,                   // or "Calculations"
   sourceSpreadsheetId: "18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0",  // source file ID
   sourceSheetName:     "Form Responses 1",       // tab in source
   matchColumnSource:   2,                        // student ID in source
   sourceColumns:       [7,20,21,24],                  // read from columns of source


   matchColumnTarget:   4,                        // student ID in Target
   destinationColumns:  [24,26,27,28],                  // write into columns
   checkColumnTarget:   58,                        // success column mark “yes”
   pauseFlagColumn:     59,                        // Pause Flag column mark “X” if no match
   highlightRangeWidth: 3                         // highlight columns on miss
 });
}


function runSTEP1IFNEEDEDNotifyMissingImport() {
  FinancialTruPathFunctionLibrary.notifyMissingImport({
    sheet: SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Working Sheet"),  //Update Sheet Here
    dataCheckColumn: 58,              // Column to check if Import worked
    nameColumn: 2,
    emailColumn: 3,
    pauseFlagColumn: 59,              // Pause Flag Column
    emailSentColumn: 60,              // New “emailed at” column
    // row: 5,                        // Uncomment to process only row 5
    mode: 'flag-and-email',

    studentSubject: 'Urgent: TruPath Worksheet Missing',
    studentBody: [
      'Hi {{Name}},',
      '',
      'We need your Orientation Demographics worksheet to complete your financial coaching reports.  It supports the worksheet you did in class.\n\n',
      '👉 https://forms.gle/pWV3cHxncB7wGZYR6',
      '',
      'Thanks,',
      'Larry Yatch'
    ].join('\n'),

    adminSubject: '{{Name}} was sent a request to complete their orientation worksheet',
    adminBody: 'Please follow up with {{Name}} so their latest report can be processed.  Once they have filled out the orientation form we need to process their latest worksheet.'
  });
}

/**
 * Wrapper to run all processing functions in sequence,
 * with a 3-second pause between each.
 */
function runSTEP2AllUpToGPTCalls() {
  // 1) Scale conversion
  runScaleConversionRange();

  // wait 3 seconds
  Utilities.sleep(3000);

  // 2) Compute external validation quotient
  computeExtValQuotient();

  // wait 3 seconds
  Utilities.sleep(3000);

  // 3) Compute high-or-low concern classifications
  computeHighorLowConcern();

  // wait 3 seconds
  Utilities.sleep(3000);

  // 4) Compute top judgment and value
  computeTopJudgmentAndValue();
}


/**
 * Runner #1: Continuous range of columns
 *
 * Processes “Working Sheet”:
 *  • skip the first 3 header rows
 *  • process rows 14–14 and columns 1–28
 */
function runScaleConversionRange() {
  FinancialTruPathFunctionLibrary.convertScaleValuesRange(
    'Working Sheet', // sheetName
    3,               // headerRows
    4,              // startRow
    1000,              // endRow
    5,               // startCol (A=1)
    60               // endCol   (AB=28)
  );
}



/**
 * Calculates ExtVal Quotient and writes to column 29.
 */
function computeExtValQuotient() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  if (!sheet) throw new Error('Sheet "Working Sheet" not found');

  const headerRows = 3;
  const startRow   = headerRows + 1;
  const lastRow    = sheet.getLastRow();
  if (lastRow < startRow) return;  // no data rows

  const getNum = v => { 
    const n = parseFloat(v);
    return isNaN(n) ? NaN : n;
  };

  for (let r = startRow; r <= lastRow; r++) {
    // Skip if col 29 already has a value
    const existing = sheet.getRange(r, 29).getValue();
    if (existing !== '' && existing != null) continue;

    // Read cols 5 & 6 and take min
    const v5    = getNum(sheet.getRange(r, 5).getValue());
    const v6    = getNum(sheet.getRange(r, 6).getValue());
    const min56 = Math.min(v5, v6);

    // Read cols 8, 11, 13, 15, 17
    const otherCols = [8, 11, 13, 15, 17];
    const others    = otherCols.map(c => getNum(sheet.getRange(r, c).getValue()));
    const valid     = others.filter(n => !isNaN(n));
    const sum       = valid.reduce((acc, n) => acc + n, 0);

    // Compute rounded average (min + sum )/ count
    const count  = 1 + valid.length;
    const rawAvg = count > 0 ? (min56 + sum) / count : NaN;
    const rounded = Math.round(rawAvg);

    sheet.getRange(r, 29).setValue(isNaN(rounded) ? '' : rounded);
  }
}


/**
 * For each row on “Working Sheet” (below 3 header rows):
 *  • If both col 30 and col 31 are already non-empty → skip
 *  • Otherwise:
 *     – Compute col 30 (“Cares more about being seen as good/bad”):
 *         • avgA = mean(cols 5, 13, 19)
 *         • avgB = mean(cols 6, 11, 15, 20)
 *         • Writes:
 *             • “No ExtVal Concern”   if avgA === 0 && avgB === 0
 *             • “Even”                if avgA === avgB (non-zero)
 *             • “Cares more about being seen as good” if avgA > avgB
 *             • “Cares more about being seen as bad”  if avgB > avgA
 *     – Compute col 31 (“Difference classification”):
 *         • First recompute avgA and avgB as above
 *         • diff = |avgA – avgB|
 *         • Writes:
 *             • “No Difference”        if diff === 0
 *             • “Small difference”     if  1 ≤ diff ≤ 30
 *             • “Medium Difference”    if 30 < diff ≤ 50
 *             • “Large Difference”     if diff > 50
 */
function computeHighorLowConcern() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  if (!sheet) throw new Error('Sheet "Working Sheet" not found');

  const headerRows = 3;
  const startRow   = headerRows + 1;
  const lastRow    = sheet.getLastRow();
  if (lastRow < startRow) return;

  // Helper to parse a value into a number, or NaN if blank/non-numeric
  const toNum = v => {
    const n = parseFloat(v);
    return isNaN(n) ? NaN : n;
  };

  for (let r = startRow; r <= lastRow; r++) {
    const val30 = sheet.getRange(r, 30).getValue();
    const val31 = sheet.getRange(r, 31).getValue();
    // If both col 30 & col 31 are already populated, skip entirely
    if (val30 !== '' && val31 !== '') continue;

    //
    // ─── Step 1: Compute avgA and avgB ─────────────────────────────────────────
    //
    // avgA = mean(cols 5, 13, 19)
    const colsA  = [5, 13, 19];
    const valsA  = colsA.map(c => toNum(sheet.getRange(r, c).getValue()));
    const validA = valsA.filter(x => !isNaN(x));
    const avgA   = validA.length
                  ? validA.reduce((sum, x) => sum + x, 0) / validA.length
                  : NaN;

    // avgB = mean(cols 6, 11, 15, 20)
    const colsB  = [6, 11, 15, 20];
    const valsB  = colsB.map(c => toNum(sheet.getRange(r, c).getValue()));
    const validB = valsB.filter(x => !isNaN(x));
    const avgB   = validB.length
                  ? validB.reduce((sum, x) => sum + x, 0) / validB.length
                  : NaN;

    //
    // ─── Step 2: Write col 30 if missing ────────────────────────────────────────
    //
    if (val30 === '' || val30 == null) {
      let message30 = '';
      if (!isNaN(avgA) && !isNaN(avgB)) {
        if (avgA === 0 && avgB === 0) {
          message30 = 'You do not show any tendencies to having External Validation impact your financial life.';
        } else if (avgA === avgB) {
          message30 = 'You care as much about being seen as doing better than you are as being seen as doing bad.  Which means that can be influenced via both types of judgment.';
        } else if (avgA > avgB) {
          message30 = 'You have a tendancy to have a greater concern for being seen doing better than you are.  Which means that you will feel more anxiety about your progress than your errors.';
        } else {
          message30 = 'You have a tendancy to have a greater concern for not being seen as doing bad. Which means that you will feel more anxiety about your errors then your progress.';
        }
      }
      sheet.getRange(r, 30).setValue(message30);
    }

    //
    // ─── Step 3: Write col 31 if missing ────────────────────────────────────────
    //
    if (val31 === '' || val31 == null) {
      let message31 = '';
      if (!isNaN(avgA) && !isNaN(avgB)) {
        const diff = Math.abs(avgA - avgB);
        if      (diff === 0)               message31 = 'There is no difference between the two.';
        else if (diff >= 1   && diff <= 20) message31 = 'There is a small difference between the two.';
        else if (diff >  20  && diff <= 40) message31 = 'There is a medium difference between the two.';
        else if (diff >  40)               message31 = 'There is a large difference between the two.';
      }
      sheet.getRange(r, 31).setValue(message31);
    }
  }
}


function computeTopJudgmentAndValue() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  if (!sheet) throw new Error('Sheet "Working Sheet" not found');

  const headerRows   = 3;
  const firstDataRow = headerRows + 1;  // row 4
  const lastRow      = sheet.getLastRow();
  if (lastRow < firstDataRow) return;

  // 1) Batch‐read all data and headers
  const numCols = sheet.getLastColumn();
  const data    = sheet
    .getRange(firstDataRow, 1, lastRow - headerRows, numCols)
    .getValues();
  const headers = sheet
    .getRange(2, 1, 1, numCols)
    .getValues()[0];  // row 2 as zero-based array

  // 2) Which columns to compare (1-based indices)
  const compareCols = [5, 6, 8, 11, 13, 15, 17];

  // 3) Map header codes → descriptive text
  const headerMap = {
    Judgment_Too_Much:      'Judgment that I have too much',
    Judgment_Not_Enough:    'Judgment that I have too little',
    Judgment_Spending:      'Judgment around my spending',
    Judgment_Past_Mistakes: 'Judgment around my past mistakes with money',
    Judgment_Wins:          'Judgment around my past wins with money',
    Judgment_Shortcomings:  'Judgment around my shortcomings with money',
    Judgment_Skill:         'Judgment around my skill with money'
  };

  // 4) Prepare an array to collect [column 32 text, column 33 number]
  const output = [];

  // 5) Loop through each row of data
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // 5a) Skip if both columns 32 (index 31) and 33 (index 32) are already filled:
    if (row[31] !== '' && row[32] !== '') {
      // Preserve existing values instead of overriding them:
      output.push([row[31], row[32]]);
      continue;
    }

    // 5b) Extract numeric values (use -Infinity for blank/non-numeric)
    const values = compareCols.map(c => {
      const raw = row[c - 1];            // zero-based in `row`
      const num = parseFloat(raw);
      return isNaN(num) ? -Infinity : num;
    });

    // 5c) Determine the highest value among those columns
    const highest = Math.max(...values);

    // 5d) If highest ≤ 0, write default message + 0
    if (highest <= 0) {
      output.push([
        'No Need for External Validation in Finances',
        0
      ]);
      continue;
    }

    // 5e) Otherwise, find all compareCols tied for that highest
    const tiedCols = compareCols.filter((colIndex, idx) => values[idx] === highest);

    // 5f) Map each tied column’s header code → descriptive text
    const tiedDescriptions = tiedCols.map(colIndex => {
      const code = headers[colIndex - 1];   // header row, zero-based
      return headerMap[code] || code;       // fallback to raw code if unmapped
    });

    // 5g) Join with comma + space
    const tiedHeadersText = tiedDescriptions.join(', ');

    // 5h) Add to output: [mapped text, numeric highest]
    output.push([tiedHeadersText, highest]);
  }

  // 6) Write the entire output array back into columns 32 and 33 in one go
  sheet
    .getRange(firstDataRow, 32, output.length, 2)
    .setValues(output);
}


function runSTEP3AllGPTAnalysesWithTimingOnlyforupto7rows() {
  const startTotal = new Date();
  Logger.log('▶️ START TOTAL at %s', startTotal);

  // helper to run a step and log its duration
  function runStep(name, fn) {
    const t0 = new Date();
    Logger.log('  – %s START at %s', name, t0);
    try {
      fn();
    } catch (e) {
      Logger.log('    ✖ %s ERROR: %s', name, e);
    }
    const t1 = new Date();
    Logger.log('  – %s END at %s  (Δ %d ms)', name, t1, t1 - t0);
    Utilities.sleep(2000);
  }

  runStep('Skill',           runGPTAnalysisSkill);
  runStep('Spending',        runGPTAnalysisSpending);
  runStep('Mistakes',        runGPTAnalysisMistakes);
  runStep('Wins',            runGPTAnalysisWins);
  runStep('Shortcomings',    runGPTAnalysisShortcomings);
  runStep('TooMuchTooLittle',runGPTAnalysisTooMuchTooLittle);
  runStep('Misrepresent',    runGPTAnalysisMisrepresent);
  runStep('SummaryInsights', runGPTAnalysisSummaryInsights);
  runStep('SuggestionInsights', runGPTAnalysisSuggestionInsights);
  runStep('Consequences',    runGPTAnalysisConsequences);

  const endTotal = new Date();
  Logger.log('✅ END TOTAL at %s  (Δ %d ms)', endTotal, endTotal - startTotal);
}





function runGPTAnalysisSkill() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [17, 18, 29],
    inputLabels:    [
      "Concern for Judgment of Skill",
      "Self Assessment",
      "External Validation Quotient"
    ],
    outputColumns:  { Analysis: 34, Suggestion: 35 },
    checkColumn:    34,
    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides three values:

1. Concern for Judgment of Skill (0–100): How much you care about others’ opinions of your financial skill.  
2. Self Assessment (text): How you describe your own skill with money.  
3. External Validation Quotient (0–100): How much external validation impacts your financial world.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the three inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    200,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment around your financial skill."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}




function runGPTAnalysisSpending() {
  const config = {
    sheetName:      'Working Sheet',           // ← unchanged
    startRow:       4,                         // ← unchanged
    inputColumns:   [8, 9, 29],                // ← unchanged
    inputLabels:    [                          // ← NEW
      "Concern for Judgment on Spending",
      "Self Assessment",
      "External Validation Quotient"
    ],  
    outputColumns:  { Analysis: 36, Suggestion: 37 },  
    checkColumn:    36,                        // ← unchanged

    // ——— NEW/CHANGED ———
    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides three values:

1. Concern for Judgment on Spending (0–100): How much you care about others’ opinions of your spending.  
2. Self Assessment (text): How you describe your own spending habits.  
3. External Validation Quotient (0–100): How much external validation impacts your financial world.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the three inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',               // ← unchanged
    temperature:  0.2,                         // ← unchanged
    maxTokens:    200,                         // ← unchanged
    useRAG:       true,                        // ← unchanged
    ragTopK:      3,                           // ← unchanged
    gptDelay:     1500                         // ← ADDED
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment around your spending."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}



function runGPTAnalysisMistakes() {
  const config = {
    sheetName:      'Working Sheet',           // ← unchanged
    startRow:       4,                         // ← unchanged
    inputColumns:   [11, 12, 29],              // ← unchanged
    inputLabels:    [                          // ← NEW
      "Concern for Judgment on Mistakes",
      "Past Mistake",
      "External Validation Quotient"
    ],
    outputColumns:  { Analysis: 38, Suggestion: 39 },
    checkColumn:    38,                        // ← unchanged

    // ——— NEW/CHANGED ———
    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides three values:

1. Concern for Judgment on Mistakes (0–100): How much you care about others’ opinions of your past financial mistakes.  
2. Past Mistake (text): What mistake causes the most anxiety if someone found out?  
3. External Validation Quotient (0–100): How much external validation impacts your financial world.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the three inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',               // ← unchanged
    temperature:  0.2,                         // ← unchanged
    maxTokens:    200,                         // ← unchanged
    useRAG:       true,                        // ← unchanged
    ragTopK:      3,                           // ← unchanged
    gptDelay:     1500                         // ← ADDED
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment on your past mistakes."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}







function runGPTAnalysisWins() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [13, 14, 29, 22],
    inputLabels: [                                             // ← NEW
      "Concern for Judgment on Wins",
      "Biggest Win",
      "External Validation Quotient",
      "Financial Self View"
    ],
    outputColumns:  { Analysis: 40, Suggestion: 41 },
    checkColumn:    40,

    // ——— NEW/CHANGED ———
    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides four values:

1. Concern for Judgment on Wins (0–100): How much you care about others’ opinions of your past financial wins.  
2. Biggest Win (text): What financial win are you the most proud of?  
3. External Validation Quotient (0–100): How much external validation drives your sense of success.  
4. Financial Self View (text): How you describe your current overall financial situation.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the four inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    200,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500                                        // ← ADDED
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment on financial wins."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}


function runGPTAnalysisWins() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [13, 14, 29, 22],
    inputLabels: [                                             // ← NEW
      "Concern for Judgment on Wins",
      "Biggest Win",
      "External Validation Quotient",
      "Financial Self View"
    ],
    outputColumns:  { Analysis: 40, Suggestion: 41 },
    checkColumn:    40,

    // ——— NEW/CHANGED ———
    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides four values:

1. Concern for Judgment on Wins (0–100): How much you care about others’ opinions of your past financial wins.  
2. Biggest Win (text): What financial win are you the most proud of?  
3. External Validation Quotient (0–100): How much external validation drives your sense of success.  
4. Financial Self View (text): How you describe your current overall financial situation.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the four inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    200,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500                                        // ← ADDED
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment on financial wins."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}



function runGPTAnalysisShortcomings() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [15, 16, 18, 29],
    inputLabels: [
      "Concern for Judgment on Shortcomings",
      "Biggest Shortcoming",
      "Feelings on Financial Skill",
      "External Validation Quotient"
    ],
    outputColumns:  { Analysis: 42, Suggestion: 43 },
    checkColumn:    42,

    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides four values:

1. Concern for Judgment on Shortcomings (0–100): How much you care about others’ opinions of your financial shortcomings.  
2. Biggest Shortcoming (text): What is your single biggest shortcoming with money?  
3. Feelings on Financial Skill (text): How you describe your own skill with money.  
4. External Validation Quotient (0–100): How much external validation impacts your financial world.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the four inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    200,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment on financial shortcomings."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}



function runGPTAnalysisTooMuchTooLittle() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [5, 6, 7, 22, 29],
    inputLabels: [
      "Judgment—Too Much",
      "Judgment—Too Little",
      "Feelings on Amount",
      "Feelings on Situation",
      "External Validation Quotient"
    ],
    outputColumns:  { Analysis: 44, Suggestion: 45 },
    checkColumn:    44,

    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides five values:

1. Judgment—Too Much (0–100): How much you care about others judging you as having too much.  
2. Judgment—Too Little (0–100): How much you care about others judging you as having too little.  
3. Feelings on Amount (text): How you currently feel about how much money you have.  
4. Feelings on Situation (text): What you think about your current financial situation.  
5. External Validation Quotient (0–100): How much external validation impacts your financial world.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the five inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    200,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No concern for judgment on your current financial situation."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}




function runGPTAnalysisMisrepresent() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [19, 20, 21, 22, 29],
    inputLabels: [
      "Misrepresent High",
      "Misrepresent Low",
      "Fear if Others Knew",
      "Feelings on Situation",
      "External Validation Quotient"
    ],
    outputColumns:  { Analysis: 46, Suggestion: 47 },
    checkColumn:    46,

    systemPrompt: `
You are a sensitive financial coach and psychologist. Each row provides five values:

1. Misrepresent High (0–100): How often you misrepresent your financial situation to others, letting them think you are better off than you are.  
2. Misrepresent Low (0–100): How often you misrepresent your financial situation to others, letting them think you are worse off than you are.  
3. Fear if Others Knew (text): What do you fear others will think if they knew your complete financial situation?  
4. Feelings on Situation (text): What do you think about your current financial situation?  
5. External Validation Quotient (0–100): How much external validation impacts your financial world.

Speak in a sensitive coaching tone as if talking directly to the client.  
Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(2–3 sentences connecting the five inputs.)

Suggestion:
• One concrete step  
• A second concrete step  
• A third concrete step

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    200,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "You do not have any problems misrepresenting your financial situation."
      );
      sheet.getRange(r, config.outputColumns.Suggestion).setValue(
        "There are no suggestions."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}



function runGPTAnalysisSummaryInsights() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [34, 36, 38, 40, 42, 44, 46],
    inputLabels: [
      "Analysis—Skill Judgment",
      "Analysis—Spending Judgment",
      "Analysis—Mistakes Judgment",
      "Analysis—Wins Judgment",
      "Analysis—Shortcomings Judgment",
      "Analysis—Too Much/Too Little Judgment",
      "Analysis—Misrepresent Judgment"
    ],
    outputColumns:  { Analysis: 48, Summary: 49 },
    checkColumn:    48,

    systemPrompt: `
You are a sensitive financial coach and psychologist speaking directly to the client. Each row provides seven analysis values:

1. Analysis—Skill Judgment  
2. Analysis—Spending Judgment  
3. Analysis—Mistakes Judgment  
4. Analysis—Wins Judgment  
5. Analysis—Shortcomings Judgment  
6. Analysis—Too Much/Too Little Judgment  
7. Analysis—Misrepresent Judgment  

Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(Up to 5 sentences explaining how these seven analyses connect. Separate each sentence by a blank line.)

Summary:
• One key insight  
• A second key insight  
• A third key insight  

Make sure each section begins with its label plus a colon, leave a blank line before the next label, and format bullets with “• ” on separate lines.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    400,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}


function runGPTAnalysisSuggestionInsights() {
  // 1) Quick-skip config
  const config = {
    sheetName:     'Working Sheet',
    startRow:      4,
    inputColumns:  [35, 37, 39, 41, 43, 45, 47],
    inputLabels: [
      "Suggestion—Skill",
      "Suggestion—Spending",
      "Suggestion—Past Mistakes",
      "Suggestion—Past Wins",
      "Suggestion—Shortcomings",
      "Suggestion—Situation",
      "Suggestion—Representation"
    ],
    outputColumns: { Analysis: 50, Summary: 51 },
    checkColumn:   50,
    
    systemPrompt: `
You are a sensitive financial coach and psychologist speaking directly to the client. Each row provides seven suggestion values:

1. Suggestion—Skill  
2. Suggestion—Spending  
3. Suggestion—Past Mistakes  
4. Suggestion—Past Wins  
5. Suggestion—Shortcomings  
6. Suggestion—Situation  
7. Suggestion—Representation  

Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(Up to 3 sentences explaining the common thread among these seven suggestions. Separate each sentence by a blank line.)

Summary:
• One overarching bullet  
• A second overarching bullet  
• A third overarching bullet  

Make sure each section begins with its label plus a colon, leave a blank line before the next label, and format bullets with “• ” on separate lines.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    400,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "You do not have any tendencies to use external validation around your finances."
      );
      sheet.getRange(r, config.outputColumns.Summary).setValue(
        "There are no suggestions; keep doing what you are doing."
      );
    }
  }

  // 2) Full GPT-analysis config
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}


function runGPTAnalysisConsequences() {
  const config = {
    sheetName:      'Working Sheet',
    startRow:       4,
    inputColumns:   [48, 49, 50, 51, 23, 26],
    inputLabels: [
      "Analysis Summary",
      "Analysis Bullet Points",
      "Analysis Suggestions",
      "Suggestion Bullet Points",
      "Felt External Validation Consequences",
      "Biggest Financial Obstacle"
    ],
    outputColumns:  { Analysis: 52, Summary: 53 },
    checkColumn:    52,

    systemPrompt: `
You are a sensitive financial coach and psychologist speaking directly to the client. Each row provides six values:

1. Analysis Summary  
2. Analysis Bullet Points  
3. Analysis Suggestions  
4. Suggestion Bullet Points  
5. Felt External Validation Consequences  
6. Biggest Financial Obstacle  

Return **plain text only**, with exactly these two labeled sections (no JSON, no code fences, no extra keys):

Analysis:
(Up to 3 sentences explaining the causal relationship between the felt consequences, the biggest obstacle, and the prior analyses and suggestions. Separate each sentence by a blank line.)

Summary:
(Up to 3 motivational sentences encouraging them to implement the suggestions, tied to their felt consequences. Separate each sentence by a blank line.)

Make sure each section begins with its label plus a colon, and leave a blank line before the next label.
`,
    model:        'gpt-4.1-nano',
    temperature:  0.2,
    maxTokens:    400,
    useRAG:       true,
    ragTopK:      3,
    gptDelay:     1500
  };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`Sheet "${config.sheetName}" not found`);

  const lastRow = sheet.getLastRow();
  for (let r = config.startRow; r <= lastRow; r++) {
    const vals = config.inputColumns.map(c => sheet.getRange(r, c).getValue());
    const allEmpty = vals.every(v => v === "" || v === null);
    if (allEmpty) {
      sheet.getRange(r, config.outputColumns.Analysis).setValue(
        "No data to analyze consequences."
      );
      sheet.getRange(r, config.outputColumns.Summary).setValue(
        "There are no recommendations."
      );
    }
  }

  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis(config);
}





function runGenerateClientDocs() {
  const configDocs = {
    sheetName:       'Working Sheet',       // your tab name
    headerRow:       2,                     // adjust if your headers live on row 2
    startRow:        4,                     // adjust to your first data row
    nameColumn:      2,                     // column index for “Name”
    docUrlColumn:    55,                    // where to write Doc URLs
    docCreatedAtCol: 54,                    // where to write CreatedAt
    templateDocId:   '1b-31-VFvLpfrlbz5Mb-fX9xWsjuhmuIzqpciOxjgmj0',
    outputFolderId:  '1PdGDbt6U67eZo4oKEfGcs6YkHBi3tmqe'
  };

  // Use local function instead of library
  generateClientDocs(configDocs);
}

function runExportAndEmailClientPdfs() {
  const configPdfs = {
    sheetName:      'Working Sheet',        // ← sheet tab name
    headerRow:      2,                      // ← row where headers live
    startRow:       4,                      // ← first data row
    nameColumn:     2,                      // ← column index (1-based) for client name
    docUrlColumn:   55,                     // ← column index (1-based) where Doc URL lives
    pdfUrlColumn:   56,                     // ← column index (1-based) where you want PDF URL written
    pdfSentAtCol:   57,                     // ← column index (1-based) where “PDF Sent At” goes
    emailColumn:    3,                      // ← column index (1-based) for client email address
    outputFolderId: '1PdGDbt6U67eZo4oKEfGcs6YkHBi3tmqe', // ← Drive folder ID for new PDFs
    emailTemplate: {
      subject: 'Your Personalized Financial TruPath Report',
      body:    'Hi {{Name}},\n\nPlease find your report attached.\n\nThanks!'
    },
  };

  // Use local function instead of library
  exportAndEmailClientPdfs(configPdfs);
}



function runSTEP4GenerateThenSendAll() {
 const configDocs = {
   sheetName:       'Working Sheet',
   headerRow:       2,
   startRow:        4,
   nameColumn:      2,
   docUrlColumn:    55,
   docCreatedAtCol: 54,
   templateDocId:   '1b-31-VFvLpfrlbz5Mb-fX9xWsjuhmuIzqpciOxjgmj0',
   outputFolderId:  '1PdGDbt6U67eZo4oKEfGcs6YkHBi3tmqe'
 };


 const configPdfs = {
   sheetName:             'Working Sheet',
   headerRow:             2,
   startRow:              4,
   nameColumn:            2,
   docUrlColumn:          55,
   pdfUrlColumn:          56,
   pdfSentAtCol:          57,
   emailColumn:           3,
   outputFolderId:        '1PdGDbt6U67eZo4oKEfGcs6YkHBi3tmqe',
   emailTemplate: {
     subject: 'Your Personalized Financial TruPath Report',
     body:    'Hi {{FirstName}},\n\nPlease find your report attached.\n\nThanks!'
   },
   // Tracking params
   trackingSpreadsheetId: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
   trackingSheetName:     'Financial',
   lookupColumn:          'G',
   trackerDateColumn:     'Y',
   failureSubject:        'ExtVal Grounding Output Tracker Update Failure',
   failureBody:           'The ExtVal Grounding Output was sent but due to a mismatch in Student IDs the Tracker was not updated.  Update it manually here: https://docs.google.com/spreadsheets/d/104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo/edit?gid=2054833600',
   missingHighlightColor: '#FFFF00'
 };


 // First generate docs (fills columns 54/55)
 generateClientDocs(configDocs);
 // Then export to PDF, email, log URLs & timestamps, and update tracker
 exportAndEmailClientPdfs(configPdfs);
}





function testRAGSpendingRows4to6() {
  const config = {
    sheetName:     'Working Sheet',
    startRow:      38,
    endRow:        42, // inclusive
    inputColumns:  [8, 9, 29],
    outputColumns: {
      AnalysisRAG: 61,
      SuggestionRAG: 62
    },
    checkColumn:   61,
    model:         'gpt-4.1-nano',
    temperature:   0.18,
    maxTokens:     300,
    delay:         1500
  };

  runRAGAnalysisWithConfig(config);
}

function getEmbedding(text) {
  const payload = {
    model: "text-embedding-ada-002",
    input: text
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY")
    },
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch("https://api.openai.com/v1/embeddings", options);
  const json = JSON.parse(response.getContentText());
  return json.data[0].embedding;
}

function getTopMatchingChunks(queryEmbedding, topN) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ChunkedandTaggedData");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const embedIndex = headers.indexOf("Embedding");
  const textIndex = headers.indexOf("Chunk Text");

  const scored = rows
    .map((row, i) => {
      try {
        const emb = JSON.parse(row[embedIndex]);
        const score = cosineSimilarity(queryEmbedding, emb);
        return { text: row[textIndex], score };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored.map(item => item.text);
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}


function runRAGAnalysisWithConfig(config) {
  const {
    sheetName,
    startRow,
    endRow,
    inputColumns,
    outputColumns,
    checkColumn,
    model       = 'gpt-4.1-nano',
    temperature = 0.2,
    maxTokens   = 400,
    delay       = 1500
  } = config;

  // Active sheet for student data
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

  // RAG data in another spreadsheet
  const ragSheet   = SpreadsheetApp.openById('1Reyrze0CbNcaBENn09gmSEzY2q5hfQSbJYtioZEiiq4');
  const chunkSheet = ragSheet.getSheetByName("ChunkedandTaggedData");
  const statsSheet = ragSheet.getSheetByName("ThemeTagStats");
  if (!chunkSheet || !statsSheet) throw new Error("RAG sheets not found");

  const rowCount    = endRow - startRow + 1;
  const displayData = sheet.getRange(startRow, 1, rowCount, sheet.getLastColumn()).getDisplayValues();
  const checkData   = sheet.getRange(startRow, checkColumn, rowCount, 1).getValues().flat();

  const result     = {};
  const outputKeys = Object.keys(outputColumns);
  outputKeys.forEach(k => result[k] = []);

  // Preload chunk data for RAG
  const chunkData    = chunkSheet.getDataRange().getValues();
  const chunkHeaders = chunkData[0];
  const chunkRows    = chunkData.slice(1);
  const idxText      = chunkHeaders.indexOf("Chunk Text");
  const idxEmbed     = chunkHeaders.indexOf("Embedding");
  const idxUsage     = chunkHeaders.indexOf("Usage Count");
  const idxLastUsed  = chunkHeaders.indexOf("Last Used Timestamp");
  const idxTags      = chunkHeaders.indexOf("Tags");

  // Preload stats data
  const statsData    = statsSheet.getDataRange().getValues();
  const statsHeaders = statsData[0];
  const idxRetrieval = statsHeaders.indexOf("Retrieval Count");

  for (let i = 0; i < rowCount; i++) {
    // Skip if already processed
    if (checkData[i]) {
      outputKeys.forEach(k => result[k].push(['']));
      continue;
    }

    // ZERO-CONCERN SHORT-CIRCUIT
    const concernRaw = displayData[i][ inputColumns[0] - 1 ];
    const concernVal = parseFloat(concernRaw);
    if (!isNaN(concernVal) && concernVal === 0) {
      result.AnalysisRAG    .push([ "No concern for Judgment on spending." ]);
      result.SuggestionRAG  .push([ "No Suggestions." ]);
      continue;
    }

    // Build query text
    const inputs    = inputColumns.map(c => displayData[i][c - 1]);
    const queryText = inputs.join('\n');

    // RAG: embed student query
    const embedding = getEmbedding(queryText);

    // RAG: find top 3 chunk matches
    const scored = chunkRows
      .map((row, idx) => {
        try {
          const emb   = JSON.parse(row[idxEmbed]);
          const score = cosineSimilarity(embedding, emb);
          return { idx, text: row[idxText], score };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topChunks = scored.map(item => item.text).join('\n\n');

    // Update chunk usage + timestamp + tag stats
    const now = new Date();
    scored.forEach(item => {
      const rowNum       = item.idx + 2; // +2 for header + zero-based
      const usageCell    = chunkSheet.getRange(rowNum, idxUsage + 1);
      const lastUsedCell = chunkSheet.getRange(rowNum, idxLastUsed + 1);

      usageCell   .setValue((parseInt(usageCell.getValue() || 0, 10) + 1));
      lastUsedCell.setValue(now);

      // Increment per-tag retrieval counts
      const tagCell = chunkRows[item.idx][idxTags];
      if (tagCell) {
        const tags = tagCell.split(',')
                            .map(t => t.trim().toLowerCase());
        tags.forEach(tag => {
          const statRow = statsData.findIndex(
            r => r[0] === "Tag" && r[1].toLowerCase() === tag
          );
          if (statRow > 0 && idxRetrieval >= 0) {
            const cell = statsSheet.getRange(statRow + 1, idxRetrieval + 1);
            cell.setValue(parseInt(cell.getValue() || 0, 10) + 1);
          }
        });
      }
    });

    // Build the precise, rule-enforced prompt
    const prompt = `
You are a sensitive financial coach and psychologist trained in the TruPath system.

You will receive relevant course context followed by three values:
1. Concern for Judgment on spending (0–100): “How much do you care about the judgment of others in your spending?”
2. Self Assessment: “How would you describe your spending?”
3. External Validation Quotient (0–100): The higher the value, the greater the negative impact external validation has on their financial world.

Use the course context to deepen your analysis.

---

Course Material Context (retrieved from internal training library):
${topChunks}

---

Student Input:
${queryText}

Rules:
1) IF Concern for Judgment is exactly 0, respond IMMEDIATELY with:
{"Analysis":"No concern for Judgment on spending.","Suggestion":""}
   and STOP.

2) Otherwise, respond with EXACTLY valid JSON using only these two keys:
  • "Analysis" (describe the emotional and behavioral pattern across the three inputs)
  • "Suggestion" (offer advice to reduce external validation pressure)

DO NOT include:
- extra keys
- plain text summaries
- markdown code blocks
- explanation or filler

Speak in a compassionate, coaching tone as if you a speaking directly to the client.

Correct response format (strictly enforced):
{"Analysis":"...", "Suggestion":"..."}
`;

    // Call GPT
    try {
      const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
        method: "post",
        contentType: "application/json",
        headers: {
          Authorization: "Bearer " + PropertiesService
            .getScriptProperties().getProperty("OPENAI_API_KEY")
        },
        payload: JSON.stringify({
          model, messages: [
            { role: "system", content: "You are a sensitive financial coach trained in the TruPath system. Use context to respond thoughtfully." },
            { role: "user",   content: prompt }
          ],
          temperature, max_tokens: maxTokens
        })
      });

      const txt   = JSON.parse(response.getContentText()).choices[0].message.content;
      const clean = txt.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      result.AnalysisRAG   .push([ parsed.Analysis   || "" ]);
      result.SuggestionRAG .push([ parsed.Suggestion || "" ]);

    } catch (e) {
      // on any error, push blanks
      result.AnalysisRAG   .push([ "" ]);
      result.SuggestionRAG .push([ "" ]);
    }

    // pace the calls
    Utilities.sleep(delay);
  }

  // Finally, write the results back to the Working Sheet
  outputKeys.forEach(key => {
    sheet.getRange(startRow, outputColumns[key], rowCount, 1)
         .setValues(result[key]);
  });
}

function testRegisteredLibraryFunctions() {
  Logger.log('generateThenSendAll: ' + typeof FinancialTruPathFunctionLibrary.generateThenSendAll);
  Logger.log('generateClientDocs: ' + typeof FinancialTruPathFunctionLibrary.generateClientDocs);
  Logger.log('exportAndEmailClientPdfs: ' + typeof FinancialTruPathFunctionLibrary.exportAndEmailClientPdfs);
  Logger.log('AdvancedGPTAnalysis: ' + typeof FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis);
}


