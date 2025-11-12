/**
 * Tunable configuration object.
 * Adjust these “dials” to tweak system behavior without touching core logic.
 */
const CONFIG = {
  // Satisfaction multiplier settings
  satisfaction: {
    neutralScore: 5,    // score at which no amplification
    step:         0.1,  // percent boost per point above neutralScore
    maxBoost:     0.3   // cap the boost at +30% (i.e. factor = 1.3)
  },

  // Essentials floor (% of income) midpoints by respondent selection
  essentialPctMap: {
    A:  5,   // <10%
    B: 15,   // 10–20%
    C: 25,   // 20–30%
    D: 35,   // 30–40%
    E: 45,   // 40–50%
    F: 55    // >50%
  },
  // Absolute minimum Essentials % for everyone
  minEssentialsAbsolutePct:   40,
  // Overspend warning threshold (uses reported midpoint)
  maxRecommendedEssentialsPct: 35,

  // Flags thresholds
  emergencyFundThresholdMonths: 2,
  highDebtIncomeRanges:        ['A','B','C'],
  minInvestPct:                10,
  maxEnjoymentPct:             40,

  // Modifier caps
  maxPositiveMod: 50,
  maxNegativeMod: 20,

  // Rounding precision: 1 = nearest integer
  roundFactor: 1,

  // New modifiers: Stage of Life, Career Volatility & Financial Confidence
  stageOfLife: {
    preRetirementLabel: 'Pre-Retirement',
    preRetirementMods:  { multiply: -10, freedom: 10 }
  },
  careerVolatility: {
    stabilityLabel: 'Contract/Gig',
    essentials:     10,
    freedom:        5
  },
  financialConfidence: {
    threshold:   3,
    multiply:   -5,
    essentials:  5,
    freedom:     5
  }
};


/**
 * Processes every unhandled row in “Working Sheet”,
 * writes allocations, notes, and trace data.
 */
function processAllocationForAllRows() {
  const ss           = SpreadsheetApp.getActiveSpreadsheet();
  const sheet        = ss.getSheetByName('Working Sheet');
  const headerRow    = 2;
  const dataStartRow = 4;
  const lastRow      = sheet.getLastRow();
  if (lastRow < dataStartRow) return;

  const headers = sheet
    .getRange(headerRow, 1, 1, sheet.getLastColumn())
    .getValues()[0];
  const data = sheet
    .getRange(dataStartRow, 1, lastRow - (dataStartRow - 1), sheet.getLastColumn())
    .getValues();

  data.forEach((row, i) => {
    const rowIndex = dataStartRow + i;
    // Skip if already processed
    if (row[headers.indexOf('Multiply_Percent')] !== '') return;

    const input  = getInputsFromRow(row, headers);
    const result = calculateAllocations(input);

    // 1) Final percentages
    ['Multiply','Essentials','Freedom','Enjoyment'].forEach(bucket => {
      sheet.getRange(rowIndex, headers.indexOf(bucket + '_Percent') + 1)
           .setValue(result.percentages[bucket]);
    });

    // 2) Light notes
    ['Multiply','Essentials','Freedom','Enjoyment'].forEach(bucket => {
      sheet.getRange(rowIndex, headers.indexOf('Note_' + bucket) + 1)
           .setValue(result.lightNotes[bucket]);
    });
    sheet.getRange(rowIndex, headers.indexOf('Note_Summary') + 1)
         .setValue(result.lightNotes.Summary);

    // 3) Trace values
    sheet.getRange(rowIndex, headers.indexOf('Base_Priority_Type') + 1)
         .setValue(result.details.basePriority);
    sheet.getRange(rowIndex, headers.indexOf('Base_Weights') + 1)
         .setValue(result.details.baseWeights);
    sheet.getRange(rowIndex, headers.indexOf('Raw_Score_Totals') + 1)
         .setValue(result.details.rawScores);
    sheet.getRange(rowIndex, headers.indexOf('Normalized_Scores') + 1)
         .setValue(result.details.normalizedScores);

    // 4) Modifier notes with “None” default
    ['Multiply','Essentials','Freedom','Enjoyment'].forEach(bucket => {
      ['Financial','Behavioral','Motivational'].forEach(modType => {
        const colName = `${bucket}_Mod_${modType}`;
        let val = result.details.modifiers[bucket][modType] || '';
        if (!val) val = 'None';
        sheet.getRange(rowIndex, headers.indexOf(colName) + 1)
             .setValue(val);
      });
    });

    // 5) Detailed summary
    sheet.getRange(rowIndex, headers.indexOf('Detailed_Notes_Summary') + 1)
         .setValue(result.details.detailedSummary);
  });

  Logger.log('✅ Allocation processing complete.');
}


/**
 * Maps a sheet row into a structured input object.
 */
function getInputsFromRow(row, headers) {
  const get = key => row[headers.indexOf(key)];
  return {
    incomeRange:     get('Net_Income_Range'),
    essentialsRange: get('Essentials_Cost_Range'),
    debtLoad:        get('Debt_Load'),
    interestLevel:   get('Interest_Level'),
    emergencyFund:   get('Emergency_Fund'),
    incomeStability: get('Income_Stability'),
    satisfaction:    Number(get('Satisfaction') || 0),
    discipline:      Number(get('Discipline_Level') || 0),
    impulse:         Number(get('Impulse_Control') || 0),
    longTerm:        Number(get('Long_Term_Focus') || 0),
    emotionSpend:    Number(get('Emotional_Spending') || 0),
    emotionSafety:   Number(get('Emotional_Safety') || 0),
    avoidance:       Number(get('Financial_Avoidance') || 0),
    priority:        get('Primary_Priority'),
    lifestyle:       Number(get('Lifestyle_Priority') || 0),
    growth:          Number(get('Growth_Orientation') || 0),
    stability:       Number(get('Stability_Orientation') || 0),
    goalTimeline:    get('Timeline_To_Goal'),
    dependents:      get('Has_Dependents'),
    autonomy:        Number(get('Autonomy_Preference') || 0),
    stageOfLife:     get('Stage of Life'),
    literacyLevel:   Number(get('Financial Confidence') || 0)
  };
}


/**
 * Core engine: base weights, modifiers, floors/flags, normalization, notes/summary.
 */
function calculateAllocations(input) {
  // 1) Base weights
  const baseMap = {
    'Build Long-Term Wealth':        { M:40, E:25, F:20, J:15 },
    'Get Out of Debt':               { M:15, E:25, F:45, J:15 },
    'Feel Financially Secure':       { M:25, E:35, F:30, J:10 },
    'Enjoy Life Now':                { M:20, E:20, F:15, J:45 },
    'Save for a Big Goal':           { M:15, E:25, F:45, J:15 },
    'Stabilize to Survive':          { M:5,  E:45, F:40, J:10 },
    'Build or Stabilize a Business': { M:20, E:30, F:35, J:15 },
    'Create Generational Wealth':    { M:45, E:25, F:20, J:10 },
    'Create Life Balance':           { M:15, E:25, F:25, J:35 },
    'Reclaim Financial Control':     { M:10, E:35, F:40, J:15 }
  };
  const base = baseMap[input.priority] || { M:25, E:25, F:25, J:25 };

  // 2) Descriptive mappings
  const debtLoadDesc = {
    A:'no non-mortgage debt', B:'< $5K debt',
    C:'$5K–$20K debt', D:'$20K–$50K debt', E:'> $50K debt'
  }[input.debtLoad] || input.debtLoad;
  const efDesc = {
    A:'no emergency savings', B:'<1 mo saved',
    C:'1–2 mo saved', D:'3–5 mo saved', E:'6+ mo saved'
  }[input.emergencyFund] || input.emergencyFund;
  const essentialPctDesc = CONFIG.essentialPctMap[input.essentialsRange] != null
    ? `${CONFIG.essentialPctMap[input.essentialsRange]}% of income`
    : input.essentialsRange;

  // 3) Initialize modifiers & notes
  const mods = { Multiply:0, Essentials:0, Freedom:0, Enjoyment:0 };
  const notes = {
    Multiply:   { Financial:'', Behavioral:'', Motivational:'' },
    Essentials: { Financial:'', Behavioral:'', Motivational:'' },
    Freedom:    { Financial:'', Behavioral:'', Motivational:'' },
    Enjoyment:  { Financial:'', Behavioral:'', Motivational:'' }
  };

  // --- Financial Modifiers ---
  if (input.incomeRange==='A') {
    mods.Multiply   -= 5;
    notes.Multiply.Financial   += 'Low income reduces capacity. ';
  }
  if (input.incomeRange==='E') {
    mods.Multiply   += 10;
    notes.Multiply.Financial   += 'High income boosts capacity. ';
  }
  if (input.debtLoad==='D') {
    mods.Freedom    += 10;
    notes.Freedom.Financial    += 'Moderate debt load. ';
  }
  if (input.debtLoad==='E') {
    mods.Freedom    += 15;
    notes.Freedom.Financial    += 'Severe debt load. ';
  }
  if (input.interestLevel==='High') {
    mods.Freedom    += 10;
    notes.Freedom.Financial    += 'High-interest debt. ';
  }
  if (input.interestLevel==='Low') {
    mods.Freedom    -= 5;
    notes.Freedom.Financial    += 'Low-interest debt. ';
  }
  if (['A','B'].includes(input.emergencyFund)) {
    mods.Freedom    += 10;
    notes.Freedom.Financial    += 'No or low emergency fund. ';
  }
  if (['D','E'].includes(input.emergencyFund)) {
    mods.Freedom    -= 10;
    notes.Freedom.Financial    += 'Sufficient emergency fund. ';
  }
  if (input.incomeStability==='Unstable / irregular') {
    mods.Essentials += 5;
    notes.Essentials.Financial += 'Unstable income needs buffer. ';
    mods.Freedom    += 5;
    notes.Freedom.Financial    += 'Unstable income needs buffer. ';
  }
  if (input.incomeStability==='Very stable') {
    mods.Multiply   += 5;
    notes.Multiply.Financial   += 'Very stable income supports investing. ';
  }

  // --- Behavioral Modifiers (including Satisfaction amplification) ---
  const rawSatFactor = 1 +
    Math.max(0, input.satisfaction - CONFIG.satisfaction.neutralScore) *
    CONFIG.satisfaction.step;
  const satFactor    = Math.min(rawSatFactor, 1 + CONFIG.satisfaction.maxBoost);
  Object.keys(mods).forEach(bucket => {
    if (mods[bucket] > 0) mods[bucket] = Math.round(mods[bucket] * satFactor);
  });

  if (input.discipline >= 8) {
    mods.Multiply   += 10;
    notes.Multiply.Behavioral += 'High discipline. ';
  }
  if (input.discipline <= 3) {
    mods.Multiply   -= 10;
    notes.Multiply.Behavioral += 'Low discipline. ';
  }
  if (input.impulse >= 8) {
    mods.Enjoyment  += 5;
    notes.Enjoyment.Behavioral  += 'Strong impulse control. ';
  }
  if (input.impulse <= 3) {
    mods.Enjoyment  -= 10;
    notes.Enjoyment.Behavioral  += 'Low impulse control. ';
  }
  if (input.longTerm >= 8) {
    mods.Multiply   += 10;
    notes.Multiply.Behavioral += 'Strong long-term focus. ';
  }
  if (input.longTerm <= 3) {
    mods.Multiply   -= 10;
    notes.Multiply.Behavioral += 'Weak long-term focus. ';
  }
  if (input.emotionSpend >= 8) {
    mods.Enjoyment  += 10;
    notes.Enjoyment.Behavioral  += 'High emotional spending. ';
  }
  if (input.emotionSpend <= 3) {
    mods.Enjoyment  -= 5;
    notes.Enjoyment.Behavioral  += 'Low emotional spending. ';
  }
  if (input.emotionSafety >= 8) {
    mods.Essentials += 5;
    notes.Essentials.Behavioral += 'Needs safety. ';
    mods.Freedom    += 5;
    notes.Freedom.Behavioral    += 'Needs safety. ';
  }
  if (input.avoidance >= 7) {
    mods.Multiply   -= 5;
    notes.Multiply.Behavioral += 'Financial avoidance. ';
    mods.Freedom    += 5;
    notes.Freedom.Behavioral   += 'Financial avoidance. ';
  }

  // --- Motivational Modifiers ---
  if (input.lifestyle >= 8) {
    mods.Enjoyment  += 10;
    notes.Enjoyment.Motivational += 'High enjoyment priority. ';
  }
  if (input.lifestyle <= 3) {
    mods.Enjoyment  -= 5;
    notes.Enjoyment.Motivational += 'Low enjoyment priority. ';
  }
  if (input.growth >= 8) {
    mods.Multiply   += 10;
    notes.Multiply.Motivational += 'High growth orientation. ';
  }
  if (input.stability >= 8) {
    mods.Freedom    += 10;
    notes.Freedom.Motivational  += 'High stability orientation. ';
  }
  if (['Within 6 months','6–12 months'].includes(input.goalTimeline)) {
    mods.Freedom    += 10;
    notes.Freedom.Motivational  += 'Short-term goal timeline. ';
  }
  if (input.dependents === 'Yes') {
    mods.Essentials += 5;
    notes.Essentials.Motivational += 'Has dependents. ';
  }
  if (input.autonomy >= 8) {
    mods.Multiply   += 5;
    notes.Multiply.Motivational += 'High autonomy preference. ';
  }
  if (input.autonomy <= 3) {
    mods.Essentials += 5;
    notes.Essentials.Motivational += 'Low autonomy preference. ';
    mods.Freedom    += 5;
    notes.Freedom.Motivational   += 'Low autonomy preference. ';
  }

  // --- New Modifier: Retirement Horizon ---
  if (input.stageOfLife === CONFIG.stageOfLife.preRetirementLabel) {
    mods.Multiply  += CONFIG.stageOfLife.preRetirementMods.multiply;
    notes.Multiply.Motivational += 'Approaching retirement—taper investing. ';
    mods.Freedom   += CONFIG.stageOfLife.preRetirementMods.freedom;
    notes.Freedom.Motivational  += 'Approaching retirement—shift to income stability. ';
  }

  // --- New Modifier: Career Volatility (Contract/Gig) ---
  if (input.incomeStability === CONFIG.careerVolatility.stabilityLabel) {
    mods.Essentials += CONFIG.careerVolatility.essentials;
    notes.Essentials.Financial += 'Variable income—build larger essentials buffer. ';
    mods.Freedom    += CONFIG.careerVolatility.freedom;
    notes.Freedom.Financial  += 'Variable income—boost emergency savings. ';
  }

  // --- New Modifier: Financial Confidence ---
  if (input.literacyLevel <= CONFIG.financialConfidence.threshold) {
    mods.Multiply   += CONFIG.financialConfidence.multiply;
    notes.Multiply.Financial += 'Lower confidence—focus on basic debt/emergency steps. ';
    mods.Essentials += CONFIG.financialConfidence.essentials;
    notes.Essentials.Motivational += 'Lower confidence—secure basics before complex strategies. ';
    mods.Freedom    += CONFIG.financialConfidence.freedom;
    notes.Freedom.Motivational += 'Lower confidence—automate savings and debt payoff. ';
  }

  // --- Modifier Caps (ensure no runaway values) ---
  Object.keys(mods).forEach(bucket => {
    mods[bucket] = Math.max(
      -CONFIG.maxNegativeMod,
      Math.min(mods[bucket], CONFIG.maxPositiveMod)
    );
  });

  // 4) Apply mods and normalize
  const raw = {
    Multiply:   base.M + mods.Multiply,
    Essentials: base.E + mods.Essentials,
    Freedom:    base.F + mods.Freedom,
    Enjoyment:  base.J + mods.Enjoyment
  };
  const totalRaw = raw.Multiply + raw.Essentials + raw.Freedom + raw.Enjoyment;
  let percentages = {
    Multiply:   raw.Multiply   / totalRaw * 100,
    Essentials: raw.Essentials / totalRaw * 100,
    Freedom:    raw.Freedom    / totalRaw * 100,
    Enjoyment:  raw.Enjoyment  / totalRaw * 100
  };

  // Capture raw percentages before floor enforcement
  const rawPercentages = {
    Multiply:   Math.round(percentages.Multiply),
    Essentials: Math.round(percentages.Essentials),
    Freedom:    Math.round(percentages.Freedom),
    Enjoyment:  Math.round(percentages.Enjoyment)
  };

  // 5) Enforce Essentials floor & overspend flag
  const reportedMinPct   = CONFIG.essentialPctMap[input.essentialsRange] || 0;
  const essentialMinPct  = Math.max(reportedMinPct, CONFIG.minEssentialsAbsolutePct);
  if (percentages.Essentials < essentialMinPct) {
    percentages.Essentials = essentialMinPct;
    const pool  = percentages.Multiply + percentages.Freedom + percentages.Enjoyment;
    const avail = 100 - essentialMinPct;
    const factor= avail / pool;
    percentages.Multiply  *= factor;
    percentages.Freedom    *= factor;
    percentages.Enjoyment  *= factor;
  }
  if (reportedMinPct > CONFIG.maxRecommendedEssentialsPct) {
    notes.Essentials.Behavioral +=
      `⚠️ You report spending ${reportedMinPct}% on essentials—over recommended ${CONFIG.maxRecommendedEssentialsPct}%. `;
  }

  // 6) Additional red-flag conditions
  if (['A','B'].includes(input.emergencyFund)) {
    notes.Freedom.Financial +=
      '⚠️ Emergency fund under 2 months—consider boosting to 3–6 months. ';
  }
  if (input.debtLoad==='E' && CONFIG.highDebtIncomeRanges.includes(input.incomeRange)) {
    notes.Freedom.Financial +=
      '⚠️ High debt relative to income—prioritize pay-down. ';
  }
  if (percentages.Multiply < CONFIG.minInvestPct) {
    notes.Multiply.Financial +=
      `⚠️ Investing under ${CONFIG.minInvestPct}%—consider increasing. `;
  }
  if (percentages.Enjoyment > CONFIG.maxEnjoymentPct) {
    notes.Enjoyment.Behavioral +=
      `⚠️ Enjoyment above ${CONFIG.maxEnjoymentPct}%—consider trimming. `;
  }

  // 7) Round final percentages
  const rf = 1 / CONFIG.roundFactor;
  Object.keys(percentages).forEach(k => {
    percentages[k] = Math.round(percentages[k] * rf) / rf;
  });

  // Satisfaction boost percent
  const satBoostPct = Math.round((satFactor - 1) * 100);

  // 8) Build light notes summary
  const lightNotes = {
    Multiply:   (notes.Multiply.Financial   + notes.Multiply.Behavioral   + notes.Multiply.Motivational).trim()
                  || 'Standard Multiply allocation applied.',
    Essentials: (notes.Essentials.Financial + notes.Essentials.Behavioral + notes.Essentials.Motivational).trim()
                  || 'Standard Essentials allocation applied.',
    Freedom:    (notes.Freedom.Financial    + notes.Freedom.Behavioral    + notes.Freedom.Motivational).trim()
                  || 'Standard Freedom allocation applied.',
    Enjoyment:  (notes.Enjoyment.Financial  + notes.Enjoyment.Behavioral  + notes.Enjoyment.Motivational).trim()
                  || 'Standard Enjoyment allocation applied.',
    Summary:    'This plan balances your needs based on your profile, goals, and appetite for change.'
  };

  // 9) Detailed summary & trace
  const details = {
    basePriority:    input.priority,
    baseWeights:     `Multiply ${base.M}%,  Essentials ${base.E}%,  Freedom ${base.F}%,  Enjoyment ${base.J}%`,
    rawScores:       `Multiply ${rawPercentages.Multiply}%,  Essentials ${rawPercentages.Essentials}%,  Freedom ${rawPercentages.Freedom}%,  Enjoyment ${rawPercentages.Enjoyment}%`,
    normalizedScores:`Multiply ${percentages.Multiply}%,  Essentials ${percentages.Essentials}%,  Freedom ${percentages.Freedom}%,  Enjoyment ${percentages.Enjoyment}%`,
    modifiers:       notes,
    detailedSummary:
      `🔹 Base allocations (priority “${input.priority}”): Multiply ${base.M}%, Essentials ${base.E}%, Freedom ${base.F}%, Enjoyment ${base.J}%.  \n` +
      `🔹 After modifiers, raw split: Multiply ${rawPercentages.Multiply}%, Essentials ${rawPercentages.Essentials}%, Freedom ${rawPercentages.Freedom}%, Enjoyment ${rawPercentages.Enjoyment}%.  \n` +
      (satBoostPct > 0
        ? `🔹 Because you’re ${input.satisfaction}/10 dissatisfied, we amplified all positive nudges by ${satBoostPct}%.  \n`
        : '') +
      `🔹 We enforce a minimum Essentials floor of ${essentialMinPct}% (your bracket midpoint was ${reportedMinPct}%), raising Essentials from ${rawPercentages.Essentials}% to ${percentages.Essentials}%.  \n` +
      `🔹 Final recommended split: Multiply ${percentages.Multiply}%, Essentials ${percentages.Essentials}%, Freedom ${percentages.Freedom}%, Enjoyment ${percentages.Enjoyment}%.  \n\n` +
      `**Modifier breakdown:**  \n` +
      `• Multiply: ${notes.Multiply.Financial}${notes.Multiply.Behavioral}${notes.Multiply.Motivational}  \n` +
      `• Essentials: ${notes.Essentials.Financial}${notes.Essentials.Behavioral}${notes.Essentials.Motivational}  \n` +
      `• Freedom: ${notes.Freedom.Financial}${notes.Freedom.Behavioral}${notes.Freedom.Motivational}  \n` +
      `• Enjoyment: ${notes.Enjoyment.Financial}${notes.Enjoyment.Behavioral}${notes.Enjoyment.Motivational}`
  };

  return { percentages, lightNotes, details };
}












function runGenerateFinancialTruthDocs() {
  const configDocs = {
    sheetName:       'Working Sheet',
    headerRow:       2,
    startRow:        4,
    nameColumn:      2,  // Column for {{Name}}
    docUrlColumn:    53,
    docCreatedAtCol: 54,
    templateDocId:   '1TiQ26_LWbu4OeU2Bw6QX_1wJPJNVLX0P0jhZbqmpyiY', // Your Financial Truth template
    outputFolderId:  '1yf3g3t_3tKJzsKD2C8qK7W5BippPiN4D'
  };

  generateClientDocs(configDocs);  // use local version
}

function runEmailFinancialTruthPdfs() {
  const configPdfs = {
    sheetName:      'Working Sheet',
    headerRow:      2,
    startRow:       4,
    nameColumn:     2,
    docUrlColumn:   53,
    pdfUrlColumn:   55,
    pdfSentAtCol:   56,
    emailColumn:    3,
    outputFolderId: '1yf3g3t_3tKJzsKD2C8qK7W5BippPiN4D',
    emailTemplate: {
      subject: 'Your Personalized Financial Truth Framework Report',
      body:
        `Hi {{Name}},\n\n` +
        `Your personalized Financial Truth Framework report is attached.\n\n` +
        `This report outlines a behavioral and financial strategy designed specifically for your current goals, income structure, and mindset. ` +
        `We encourage you to read both the summary and the detailed insights to better understand how to apply your recommended allocations.\n\n` +
        `If you have questions or want help implementing it, don’t hesitate to reach out.\n\n` +
        `You can always contact Sarah at Sarah@TruPathMastery.com\n\n` +
        `Here's to your financial clarity,\nThe TruPath Team\n\n\n`
    }
  };

  exportAndEmailClientPdfs(configPdfs);  // use local version
}

function runGenerateAndSendFinancialTruthReports() {
  Logger.log("Starting runGenerateAndSendFinancialTruthReports");

  const configDocs = {
    sheetName:       'Working Sheet',
    headerRow:       2,
    startRow:        4,
    nameColumn:      2,
    docUrlColumn:    53,
    docCreatedAtCol: 54,
    templateDocId:   '1TiQ26_LWbu4OeU2Bw6QX_1wJPJNVLX0P0jhZbqmpyiY',
    outputFolderId:  '1yf3g3t_3tKJzsKD2C8qK7W5BippPiN4D'
  };

  const configPdfs = {
    sheetName:      'Working Sheet',
    headerRow:      2,
    startRow:       4,
    nameColumn:     2,
    docUrlColumn:   53,
    pdfUrlColumn:   55,
    pdfSentAtCol:   56,
    emailColumn:    3,
    outputFolderId: '1yf3g3t_3tKJzsKD2C8qK7W5BippPiN4D',
    emailTemplate: {
      subject: 'Your Personalized Financial Truth Framework Report',
      body:
        `Hi {{Name}},\n\n` +
        `Your personalized Financial Truth Framework report is attached.\n\n` +
        `This report outlines a behavioral and financial strategy designed specifically for your current goals, income structure, and mindset. ` +
        `We encourage you to read both the summary and the detailed insights to better understand how to apply your recommended allocations.\n\n` +
        `If you have questions or want help implementing it, don’t hesitate to reach out.\n\n` +
        `You can always contact Sarah at Sarah@TruPathMastery.com\n\n` +
        `Here's to your financial clarity,\nThe TruPath Team\n\n\n`
    }
  };

  Logger.log("Calling generateThenSendAll...");
  generateThenSendAll(configDocs, configPdfs);  // use local version
  Logger.log("generateThenSendAll finished.");
}



