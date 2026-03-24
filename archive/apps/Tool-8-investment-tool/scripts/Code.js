/**
 * Investment Dial Tool – MVP
 * - Client ID gate + roster lookup + personalized saves
 * - Auto-migrates Scenarios header to include Client_ID at column E
 * - Roster lookup by GID (753820167) then by name
 *
 * Scenarios sheet header (A..V) EXACT order:
 *  A Timestamp
 *  B First_Name
 *  C Last_Name
 *  D Email
 *  E Client_ID
 *  F Scenario_Name
 *  G Monthly_Income_Real
 *  H Years_To_Goal
 *  I Risk_Dial
 *  J Target_Return
 *  K Effective_Return
 *  L Contribution_Capacity
 *  M Current_Assets
 *  N Inflation
 *  O Draw_Years
 *  P Maintenance_Return
 *  Q Nominal_Income_At_Start
 *  R Required_Nest_Egg
 *  S Required_Contribution
 *  T Solved_Return
 *  U Solved_Years
 *  V Mode
 */

// ====== SCENARIOS SPREADSHEET (unchanged) ======
const SS_ID = '1_c4JB4VG4q-fekL2T1s6nUo83Ko1nZbAkSkDfFM1X0M'; // Scenarios spreadsheet

// ====== PDF REPORTS FOLDER ======
const REPORTS_FOLDER_ID = '178wIP_cZeTQY4H59qT-KZBlUlqxvCLWf'; // Google Drive folder for all PDF reports

// ====== ROSTER / PARTICIPATION TRACKER (ID gate & profile) ======
const ROSTER_SPREADSHEET_ID = '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo';
const ROSTER_SHEET_NAME     = 'Financial v1'; // fallback by name
const ROSTER_SHEET_GID      = 2054833600; // GID for Financial v1 tab
const ROSTER_ID_COLUMN      = 6;  // F - Student ID
// Financial v1 column mapping:
const ROSTER_FIRST_COL = 2;  // B - First Name
const ROSTER_LAST_COL  = 3;  // C - Last Name
const ROSTER_EMAIL_COL = 4;  // D - Email

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Investment Dial Tool – MVP');
}

/** Normalize IDs for matching (upper, strip spaces/hyphens/underscores/zero-width/dots/slashes) */
function normalizeId_(s) {
  return String(s || '')
    .toUpperCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .replace(/[\s\-_./\\]/g, '')           // spaces, -, _, ., /
    .trim();
}

/** Get roster sheet by GID first, else by name */
function getRosterSheet_() {
  const ss = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);
  const byGid = ss.getSheets().find(sh => sh.getSheetId() === ROSTER_SHEET_GID);
  if (byGid) return byGid;
  const byName = ss.getSheetByName(ROSTER_SHEET_NAME);
  return byName || null;
}

/** Lookup by Client/Student ID (exact match after normalization) */
function lookupStudentById(idRaw) {
  try {
    const input = (idRaw || '').toString().trim();
    if (!input) return { ok: false, error: 'Missing ID.' };

    const idNorm = normalizeId_(input);
    const sh = getRosterSheet_();
    if (!sh) return { ok: false, error: `Roster tab not found (GID ${ROSTER_SHEET_GID} / "${ROSTER_SHEET_NAME}").` };

    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'Roster has no data.' };

    const numRows = lastRow - 1;
    const idCells = sh.getRange(2, ROSTER_ID_COLUMN, numRows, 1).getDisplayValues(); // visible strings

    for (let i = 0; i < idCells.length; i++) {
      const candidate = normalizeId_(idCells[i][0]);
      if (candidate && candidate === idNorm) {
        const row = 2 + i;
        const first = String(sh.getRange(row, ROSTER_FIRST_COL).getDisplayValue() || '').trim();
        const last  = String(sh.getRange(row, ROSTER_LAST_COL ).getDisplayValue() || '').trim();
        const email = String(sh.getRange(row, ROSTER_EMAIL_COL).getDisplayValue() || '').trim();
        return { ok: true, firstName: first, lastName: last, email, normalizedId: idNorm };
      }
    }
    return { ok: false, error: 'ID not found. Please check the format and try again.' };
  } catch (e) {
    return { ok: false, error: `Lookup error: ${e && e.message ? e.message : e}` };
  }
}

/** Lookup by first name, last name, or email (requires 2 out of 3 matches) */
function lookupStudentByName(firstName, lastName, email) {
  try {
    const firstInput = (firstName || '').toString().trim().toLowerCase();
    const lastInput = (lastName || '').toString().trim().toLowerCase();
    const emailInput = (email || '').toString().trim().toLowerCase();
    
    // Count how many fields were provided
    let providedFields = 0;
    if (firstInput) providedFields++;
    if (lastInput) providedFields++;
    if (emailInput) providedFields++;
    
    if (providedFields < 2) {
      return { ok: false, error: 'Please provide at least 2 fields (first name, last name, and/or email).' };
    }

    const sh = getRosterSheet_();
    if (!sh) return { ok: false, error: `Roster tab not found "${ROSTER_SHEET_NAME}".` };

    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'Roster has no data.' };

    const numRows = lastRow - 1;
    // Get all data at once for better performance - columns B through F
    const data = sh.getRange(2, ROSTER_FIRST_COL, numRows, ROSTER_ID_COLUMN - ROSTER_FIRST_COL + 1).getDisplayValues();

    const matches = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      // Adjusted indices for Financial v1 tab (B=First, C=Last, D=Email, F=ID)
      const first = String(row[0] || '').trim().toLowerCase();      // B column (index 0)
      const last = String(row[1] || '').trim().toLowerCase();       // C column (index 1) 
      const emailVal = String(row[2] || '').trim().toLowerCase();   // D column (index 2)
      const studentId = String(row[4] || '').trim();                // F column (index 4, skipping E)
      
      let matchCount = 0;
      let matchType = [];
      
      // Check for matches - require exact match for names, exact or contains for email
      if (firstInput && first === firstInput) {
        matchCount++;
        matchType.push('First name');
      }
      if (lastInput && last === lastInput) {
        matchCount++;
        matchType.push('Last name');
      }
      // Email requires exact match for proper identification
      if (emailInput && emailVal === emailInput) {
        matchCount++;
        matchType.push('Email');
      }
      
      // Require at least 2 out of 3 matches
      if (matchCount >= 2 && studentId) {
        matches.push({
          firstName: String(sh.getRange(2 + i, ROSTER_FIRST_COL).getDisplayValue() || '').trim(),
          lastName: String(sh.getRange(2 + i, ROSTER_LAST_COL).getDisplayValue() || '').trim(),
          email: String(sh.getRange(2 + i, ROSTER_EMAIL_COL).getDisplayValue() || '').trim(),
          normalizedId: normalizeId_(studentId),
          matchType: matchType.join(' & ')
        });
      }
    }
    
    if (matches.length === 0) {
      return { ok: false, error: 'No matching students found (need at least 2 matching fields). Please check the spelling and try again.' };
    }
    
    if (matches.length === 1) {
      // Single match - return it
      return { 
        ok: true, 
        firstName: matches[0].firstName, 
        lastName: matches[0].lastName, 
        email: matches[0].email, 
        normalizedId: matches[0].normalizedId,
        matchType: matches[0].matchType
      };
    }
    
    // Multiple matches - return the list for user to choose
    return { 
      ok: false, 
      error: `Found ${matches.length} possible matches. Please be more specific.`,
      matches: matches
    };
    
  } catch (e) {
    return { ok: false, error: `Name lookup error: ${e && e.message ? e.message : e}` };
  }
}

/** Ensure Scenarios header exists & is in the expected order (auto-migrate if needed) */
function ensureScenariosHeader_(sh) {
  const EXPECTED = [
    'Timestamp','First_Name','Last_Name','Email','Client_ID','Scenario_Name',
    'Monthly_Income_Real','Years_To_Goal','Risk_Dial','Target_Return','Effective_Return',
    'Contribution_Capacity','Current_Assets','Inflation','Draw_Years','Maintenance_Return',
    'Nominal_Income_At_Start','Required_Nest_Egg','Required_Contribution','Solved_Return','Solved_Years','Mode'
  ];

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, EXPECTED.length).setValues([EXPECTED]);
    return;
  }

  const currentLastCol = sh.getLastColumn();
  const header = sh.getRange(1, 1, 1, Math.max(currentLastCol, EXPECTED.length)).getValues()[0];

  // If Client_ID is not exactly at E1, insert a column E and rewrite header
  if (header[4] !== 'Client_ID') {
    sh.insertColumnBefore(5); // new E column
  }

  if (sh.getLastColumn() < EXPECTED.length) {
    sh.insertColumnsAfter(sh.getLastColumn(), EXPECTED.length - sh.getLastColumn());
  }
  sh.getRange(1, 1, 1, EXPECTED.length).setValues([EXPECTED]);
}

/** Get user's saved scenarios from Scenarios tab */
function getUserScenarios(clientId) {
  if (!clientId) return [];
  
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sh = ss.getSheetByName('Scenarios');
    if (!sh) return [];
    
    const data = sh.getDataRange().getValues();
    if (data.length <= 1) return []; // Only header row
    
    const headers = data[0];
    const clientIdCol = headers.indexOf('Client_ID');
    if (clientIdCol === -1) return [];
    
    // Get normalized client ID for comparison
    const normalizedClientId = normalizeId_(clientId);
    
    // Filter scenarios for this user
    const userScenarios = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowClientId = row[clientIdCol];
      const normalizedRowId = normalizeId_(rowClientId);
      
      if (normalizedRowId === normalizedClientId) {
        // Build scenario object from row - INCLUDING client information
        const scenario = {
          // Client information
          firstName: String(row[headers.indexOf('First_Name')] || ''),
          lastName: String(row[headers.indexOf('Last_Name')] || ''),
          email: String(row[headers.indexOf('Email')] || ''),
          clientId: String(row[headers.indexOf('Client_ID')] || ''),
          
          // Scenario data
          name: String(row[headers.indexOf('Scenario_Name')] || ''),
          M_real: Number(row[headers.indexOf('Monthly_Income_Real')] || 0),
          T: Number(row[headers.indexOf('Years_To_Goal')] || 0),
          risk: Number(row[headers.indexOf('Risk_Dial')] || 0),
          C_cap: Number(row[headers.indexOf('Contribution_Capacity')] || 0),
          A0: Number(row[headers.indexOf('Current_Assets')] || 0),
          infl: Number(row[headers.indexOf('Inflation')] || 0.025),
          D: Number(row[headers.indexOf('Draw_Years')] || 30),
          timestamp: String(row[headers.indexOf('Timestamp')] || '')
        };
        userScenarios.push(scenario);
      }
    }
    
    // Return most recent scenarios first
    return userScenarios.reverse().slice(0, 10); // Limit to 10 most recent
    
  } catch (err) {
    return [];
  }
}

function saveScenario(scn) {
  if (!scn || typeof scn !== 'object') return { ok: false, error: 'Invalid scenario payload.' };

  const ss = SpreadsheetApp.openById(SS_ID);
  const TAB = 'Scenarios';
  const sh = ss.getSheetByName(TAB) || ss.insertSheet(TAB);

  ensureScenariosHeader_(sh);

  const row = [
    new Date(),                // A Timestamp
    scn.firstName || '',       // B First_Name
    scn.lastName || '',        // C Last_Name
    scn.email || '',           // D Email
    scn.clientId || '',        // E Client_ID
    scn.name || '',            // F Scenario_Name
    scn.M_real ?? '',          // G
    scn.T ?? '',               // H
    scn.risk ?? '',            // I
    scn.rAccTarget ?? '',      // J
    scn.rAccEff ?? '',         // K
    scn.C_cap ?? '',           // L
    scn.A0 ?? '',              // M
    scn.infl ?? '',            // N
    scn.D ?? '',               // O
    scn.rRet ?? '',            // P
    scn.M0 ?? '',              // Q
    scn.Areq ?? '',            // R
    scn.Creq ?? '',            // S
    scn.rSolved ?? '',         // T
    scn.tSolved ?? '',         // U
    scn.mode ?? ''             // V
  ];

  sh.appendRow(row);
  return { ok: true };
}

// ============================================
// REPORT GENERATION HELPER FUNCTIONS
// ============================================

/**
 * Shared formatting helpers for report generation
 */
const ReportFormatters = {
  // Currency formatting with proper thousand separators
  money: (v) => {
    if (v === null || v === undefined || v === '') return '$0';
    const num = Number(v);
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
      return '$' + num.toFixed(0);
    }
  },
  
  // Percentage formatting with consistent decimals
  percent: (v, decimals = 1) => {
    if (v === null || v === undefined || v === '') return '0%';
    return (Number(v) * 100).toFixed(decimals) + '%';
  },
  
  // Format years with proper singular/plural
  years: (n) => {
    const num = Number(n);
    return num === 1 ? '1 year' : `${num} years`;
  },
  
  // Format risk level to descriptive text
  riskLevel: (risk) => {
    const r = Number(risk);
    if (r <= 2) return 'Very Low Risk / Low Returns';
    if (r <= 4) return 'Steady Returns';
    if (r <= 6) return 'Growth Backed by Hard Assets';
    if (r <= 8) return 'High Growth';
    return 'High Risk / High Reward';
  },
  
  // Format date consistently
  date: (d = new Date()) => {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  },
  
  // Format monthly to annual conversion
  annualFromMonthly: (monthly) => {
    return Number(monthly) * 12;
  }
};

/**
 * Apply consistent styling to document elements
 */
const ReportStyles = {
  // Add a styled header
  addHeader: (body, text, level = 1) => {
    const para = body.appendParagraph(text);
    const heading = level === 1 ? 
      DocumentApp.ParagraphHeading.HEADING1 : 
      DocumentApp.ParagraphHeading.HEADING2;
    para.setHeading(heading);
    if (level === 1) {
      para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      para.setSpacingAfter(20);
    } else {
      para.setSpacingAfter(12);
    }
    return para;
  },
  
  // Add a section with consistent spacing
  addSection: (body, title) => {
    body.appendParagraph('').setSpacingBefore(12);
    const section = body.appendParagraph(title);
    section.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    section.setSpacingAfter(8);
    return section;
  },
  
  // Add a section with reduced spacing for comparison reports
  addCompactSection: (body, title) => {
    body.appendParagraph('').setSpacingBefore(9);  // 25% less than 12
    const section = body.appendParagraph(title);
    section.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    section.setSpacingAfter(6);  // 25% less than 8
    return section;
  },
  
  // Add a key-value pair with formatting
  addField: (body, label, value, options = {}) => {
    const para = body.appendParagraph(`${label}: ${value}`);
    if (options.bold) para.setBold(true);
    if (options.color) para.setForegroundColor(options.color);
    if (options.fontSize) para.setFontSize(options.fontSize);
    return para;
  },
  
  // Add a table with consistent styling
  addStyledTable: (body, data, options = {}) => {
    const table = body.appendTable();
    
    // Add header row if provided
    if (options.headers) {
      const headerRow = table.appendTableRow();
      options.headers.forEach(header => {
        const cell = headerRow.appendTableCell(header);
        cell.getChild(0).asParagraph().setBold(true);
        cell.setBackgroundColor('#4b4166');  // Purple from website
        cell.getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
      });
    }
    
    // Add data rows
    data.forEach((row, index) => {
      const tableRow = table.appendTableRow();
      row.forEach((cellData, cellIndex) => {
        // Create cell with content
        const cell = tableRow.appendTableCell(String(cellData || ''));
        
        // Format the text in the cell
        if (cell.getNumChildren() > 0) {
          const para = cell.getChild(0).asParagraph();
          
          // Set text color to black for all body cells
          para.setForegroundColor('#000000');
          
          // Only make first column bold (parameter names)
          if (cellIndex === 0) {
            para.setBold(true);
          } else {
            para.setBold(false);
          }
        }
        
        if (options.alternateRows && index % 2 === 0) {
          cell.setBackgroundColor('#f9fafb');
        }
      });
    });
    
    return table;
  },
  
  // Add a highlighted box for important information
  addHighlightBox: (body, text, color = '#e0f2fe') => {
    const para = body.appendParagraph(text);
    para.setBackgroundColor(color);
    para.setIndentFirstLine(10);
    para.setIndentStart(10);
    para.setIndentEnd(10);
    para.setSpacingBefore(8);
    para.setSpacingAfter(8);
    return para;
  }
};

/**
 * Generate a PDF report for a scenario using Google Docs as template
 * Creates a temporary doc, populates it with data, converts to PDF, then deletes the temp doc
 */
function generateReport(scenario) {
  try {
    if (!scenario || typeof scenario !== 'object') {
      return { ok: false, error: 'Invalid scenario data' };
    }
    
    // Ensure all calculated fields exist (for backward compatibility)
    const infl = scenario.infl || 0.025;
    const D = scenario.D || 25;
    const rRet = scenario.rRet || 0.03;
    
    // Calculate M0 if missing
    if (scenario.M0 === undefined && scenario.M_real !== undefined && scenario.T !== undefined) {
      scenario.M0 = scenario.M_real * Math.pow(1 + infl, scenario.T);
    }
    
    // Calculate Areq if missing
    if (scenario.Areq === undefined && scenario.M_real !== undefined && scenario.T !== undefined) {
      const M0 = scenario.M0 || (scenario.M_real * Math.pow(1 + infl, scenario.T));
      const monthlyInRet = M0 * 12;
      const pvFactor = (1 - Math.pow(1 + rRet, -D)) / rRet;
      scenario.Areq = monthlyInRet * pvFactor;
    }
    
    // Calculate rAccTarget if missing
    if (scenario.rAccTarget === undefined && scenario.risk !== undefined) {
      const R = scenario.risk;
      const [rMin, rMax] = [0.02, 0.12];
      scenario.rAccTarget = rMin + (rMax - rMin) * (R / 10);
    }
    
    // Calculate rAccEff if missing
    if (scenario.rAccEff === undefined && scenario.rAccTarget !== undefined) {
      scenario.rAccEff = 0.75 * scenario.rAccTarget;
    }

    // Create a new Google Doc for the report
    const doc = DocumentApp.create(`Investment Report - ${scenario.name || 'Unnamed'} - ${new Date().toLocaleDateString()}`);
    const docId = doc.getId();
    const body = doc.getBody();
    
    // Add document header with title
    const header = doc.addHeader();
    const headerPara1 = header.appendParagraph('TRUPATH FINANCIAL');
    headerPara1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    headerPara1.setBold(true);
    headerPara1.setFontSize(16);
    const headerPara2 = header.appendParagraph('Investment Planning Report');
    headerPara2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    headerPara2.setItalic(true);
    headerPara2.setFontSize(12);
    
    // Use new shared formatters
    const fmt = ReportFormatters;
    const styles = ReportStyles;
    
    // Clear default content
    body.clear();
    
    // Client Information Section with plain text formatting
    styles.addSection(body, 'CLIENT INFORMATION');
    
    // Display client info as plain text without table
    const namePara = body.appendParagraph(`Name: ${scenario.firstName || ''} ${scenario.lastName || ''}`);
    namePara.setBold(false);
    namePara.setSpacingAfter(4);
    
    const idPara = body.appendParagraph(`Client ID: ${scenario.clientId || ''}`);
    idPara.setBold(false);
    idPara.setSpacingAfter(4);
    
    const emailPara = body.appendParagraph(`Email: ${scenario.email || ''}`);
    emailPara.setBold(false);
    emailPara.setSpacingAfter(4);
    
    const datePara = body.appendParagraph(`Report Date: ${fmt.date()}`);
    datePara.setBold(false);
    datePara.setSpacingAfter(4);
    
    const scenarioPara = body.appendParagraph(`Scenario: ${scenario.name || 'Unnamed Scenario'}`);
    scenarioPara.setBold(false);
    scenarioPara.setSpacingAfter(4);
    
    body.appendParagraph('').setSpacingAfter(16);
    
    // Executive Summary Section with enhanced formatting
    styles.addSection(body, 'EXECUTIVE SUMMARY');
    
    // Determine feasibility with tolerance for floating point comparison
    // Consider feasible if capacity is within $1 of requirement (rounding tolerance)
    const tolerance = 1; // $1 tolerance for floating point comparison
    const capacity = Number(scenario.C_cap);
    const required = Number(scenario.Creq);
    
    // Check feasibility based on mode
    let isFeasible = false;
    if (scenario.mode === 'contrib') {
      isFeasible = (capacity >= required - tolerance);
    } else if (scenario.mode === 'return') {
      // For return mode: feasible if solved return is valid and within reasonable bounds (0-30%)
      const rSolved = Number(scenario.rSolved);
      isFeasible = rSolved > 0 && rSolved <= 0.30;
    } else if (scenario.mode === 'time') {
      // For time mode: feasible if solved time is reasonable (less than 50 years)
      const tSolved = Number(scenario.tSolved);
      isFeasible = tSolved > 0 && tSolved <= 50;
    }
    
    // Add feasibility status WITHOUT highlighting
    const statusText = isFeasible ? 
      '✅ Your retirement plan is FEASIBLE with your current parameters.' :
      '⚠️ Your retirement plan requires adjustments to become feasible.';
    
    const statusPara = body.appendParagraph(statusText);
    statusPara.setBold(true);
    statusPara.setForegroundColor(isFeasible ? '#22c55e' : '#f59e0b');
    statusPara.setFontSize(12);
    
    // Add proper spacing between status and summary
    body.appendParagraph('').setSpacingAfter(12);
    
    // Add detailed summary paragraph WITHOUT highlighting
    const summaryText = `Based on your goal to generate ${fmt.money(scenario.M_real)} per month in retirement income ` +
      `(${fmt.money(fmt.annualFromMonthly(scenario.M_real))} annually in today's dollars), ` +
      `with ${fmt.years(scenario.T)} until retirement and a ${scenario.D}-year retirement period, ` +
      `you will need to accumulate a nest egg of ${fmt.money(scenario.Areq)} by retirement.\n`;
    
    const summaryPara = body.appendParagraph(summaryText);
    summaryPara.setBold(false);
    summaryPara.setForegroundColor('#000000');
    
    // Add specific feasibility explanation
    if (scenario.mode === 'contrib') {
      const gap = capacity - required;
      
      // Handle different scenarios with appropriate messaging
      let explanationText = '';
      if (Math.abs(gap) <= tolerance) {
        // Exactly on target (within tolerance)
        explanationText = `Perfect match! Your current savings capacity of ${fmt.money(capacity)} per month exactly meets the required ${fmt.money(required)}. You're right on track, though consider building a small buffer for unexpected expenses.`;
      } else if (gap > 0) {
        // Surplus scenario
        explanationText = `Good news! Your current savings capacity of ${fmt.money(capacity)} per month exceeds the required ${fmt.money(required)}, giving you a comfortable surplus of ${fmt.money(gap)} monthly. This surplus provides flexibility for market volatility or unexpected expenses.`;
      } else {
        // Shortfall scenario
        explanationText = `Your current savings capacity of ${fmt.money(capacity)} per month falls short of the required ${fmt.money(required)} by ${fmt.money(Math.abs(gap))}. See our recommendations below for strategies to bridge this gap.`;
      }
      const explanationPara = body.appendParagraph(explanationText);
      explanationPara.setBold(false);
      explanationPara.setForegroundColor('#000000');
    } else if (scenario.mode === 'return') {
      const explanationPara = body.appendParagraph(`To achieve your retirement goals with your current savings capacity, you would need an annual return of ${fmt.percent(scenario.rSolved)}. This analysis helps you understand the investment performance required given your constraints.`);
      explanationPara.setBold(false);
      explanationPara.setForegroundColor('#000000');
    } else if (scenario.mode === 'time') {
      const explanationPara = body.appendParagraph(`With your current savings capacity and expected returns, you would need ${fmt.years(scenario.tSolved)} to reach your retirement goal. This timeline analysis helps you plan your career and retirement transition.`);
      explanationPara.setBold(false);
      explanationPara.setForegroundColor('#000000');
    }
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Add Key Takeaways section at the end of Executive Summary
    const takeawaysHeader = body.appendParagraph('📊 KEY TAKEAWAYS');
    takeawaysHeader.setBold(true);
    takeawaysHeader.setFontSize(12);
    takeawaysHeader.setForegroundColor('#000000');
    body.appendParagraph('').setSpacingAfter(8);
    
    // Build key takeaway bullets based on feasibility and mode
    const takeaways = [];
    
    // Always include nest egg requirement
    takeaways.push(`• Nest Egg Required: ${fmt.money(scenario.Areq)} to fund your retirement`);
    
    // Mode-specific takeaways
    if (scenario.mode === 'contrib') {
      const gap = capacity - required;
      if (Math.abs(gap) <= tolerance) {
        takeaways.push(`• Monthly Investment: ${fmt.money(required)} (exactly matches your capacity)`);
      } else if (gap > 0) {
        takeaways.push(`• Monthly Investment: ${fmt.money(required)} needed (you have ${fmt.money(capacity)} capacity)`);
        takeaways.push(`• Surplus: ${fmt.money(gap)} monthly buffer for flexibility`);
      } else {
        takeaways.push(`• Monthly Investment: ${fmt.money(required)} needed (you have ${fmt.money(capacity)} capacity)`);
        takeaways.push(`• Gap to Close: ${fmt.money(Math.abs(gap))} additional monthly savings required`);
      }
    } else if (scenario.mode === 'return') {
      takeaways.push(`• Required Return: ${fmt.percent(scenario.rSolved)} annual return needed`);
      takeaways.push(`• Your Risk Level: ${scenario.risk}/10 targets ${fmt.percent(scenario.rAccTarget)} returns`);
    } else if (scenario.mode === 'time') {
      takeaways.push(`• Time Required: ${fmt.years(scenario.tSolved)} to reach your goal`);
      takeaways.push(`• Monthly Savings: ${fmt.money(scenario.C_cap)} at ${fmt.percent(scenario.rAccEff)} returns`);
    }
    
    // Add time horizon and status
    takeaways.push(`• Time Horizon: ${fmt.years(scenario.T)} with ${fmt.percent(scenario.rAccEff)} expected returns`);
    takeaways.push(`• Status: ${isFeasible ? '✅ Plan is feasible - ready to implement' : '⚠️ Adjustments needed - see recommendations'}`);
    
    // Add the takeaway bullets
    takeaways.forEach(takeaway => {
      const bulletPara = body.appendParagraph(takeaway);
      bulletPara.setBold(false);
      bulletPara.setForegroundColor('#000000');
      bulletPara.setIndentFirstLine(20);
      bulletPara.setSpacingAfter(4);
    });
    
    body.appendParagraph('').setSpacingAfter(16);
    
    // Investment Parameters Section
    styles.addSection(body, 'YOUR INVESTMENT PARAMETERS');
    
    body.appendParagraph('These are the key inputs that drive your retirement planning calculations. Each parameter below reflects your personal goals and constraints. Review these carefully to ensure they accurately represent your situation. Small changes in these inputs can have significant impacts on your required savings or returns.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    // Use table for better readability
    const paramsData = [
      ['Monthly Income Goal', fmt.money(scenario.M_real), 'Your desired monthly income in today\'s purchasing power'],
      ['Annual Income Goal', fmt.money(fmt.annualFromMonthly(scenario.M_real)), 'Equivalent annual income in today\'s dollars'],
      ['Years to Retirement', fmt.years(scenario.T || 0), 'Time horizon for accumulating your nest egg'],
      ['Risk Tolerance', `${String(scenario.risk || 0)}/10 - ${fmt.riskLevel(scenario.risk)}`, 'Your comfort level with investment volatility'],
      ['Monthly Savings Capacity', fmt.money(scenario.C_cap), 'Amount you can invest each month'],
      ['Current Assets', fmt.money(scenario.A0), 'Existing retirement savings to build upon']
    ];
    
    styles.addStyledTable(body, paramsData, {
      headers: ['Parameter', 'Value', 'Description'],
      alternateRows: true
    });
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Calculations & Projections Section
    styles.addSection(body, 'KEY CALCULATIONS & PROJECTIONS');
    
    body.appendParagraph('Based on your inputs, here are the critical numbers for your retirement plan. The "Required Nest Egg" is the total amount you need saved by retirement to generate your desired income. The return rates shown reflect what\'s needed to reach that target. Pay special attention to whether your required monthly savings fits within your budget.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    // Add page break before the calculations table
    body.appendPageBreak();
    
    // Add section title again on new page
    styles.addSection(body, 'KEY CALCULATIONS & PROJECTIONS');
    
    // Build calculations data
    const calcData = [
      ['Future Monthly Income', fmt.money(scenario.M0), 
        `Your ${fmt.money(scenario.M_real)} goal adjusted for ${fmt.years(scenario.T)} of inflation`],
      ['Future Annual Income', fmt.money(fmt.annualFromMonthly(scenario.M0)),
        'Annual retirement income in future dollars'],
      ['Required Nest Egg', fmt.money(scenario.Areq), 
        'Total savings needed at retirement to generate your income stream'],
      ['Target Return', fmt.percent(scenario.rAccTarget), 
        'Investment return based on your risk tolerance level'],
      ['Effective Return', fmt.percent(scenario.rAccEff), 
        'Conservative estimate accounting for deployment timing']
    ];
    
    // Add mode-specific calculations
    if (scenario.mode === 'contrib') {
      const gap = Number(scenario.C_cap) - Number(scenario.Creq);
      
      // Only show capacity and surplus/shortfall if they're meaningful (not equal)
      if (Math.abs(gap) > tolerance) {
        // There's a meaningful difference between capacity and requirement
        calcData.push(
          ['Required Monthly Savings', fmt.money(scenario.Creq),
            'Minimum monthly investment needed to reach your goal'],
          ['Your Savings Capacity', fmt.money(scenario.C_cap),
            'Amount you indicated you can save monthly']
        );
        if (gap >= 0) {
          calcData.push(['Monthly Surplus', fmt.money(gap),
            'Extra savings providing a safety buffer']);
        } else {
          calcData.push(['Monthly Shortfall', fmt.money(Math.abs(gap)),
            'Additional savings needed to meet your goal']);
        }
      } else {
        // Capacity equals requirement (likely auto-apply mode)
        calcData.push(
          ['Required Monthly Savings', fmt.money(scenario.Creq),
            'Monthly investment amount to reach your retirement goal']
        );
      }
    } else if (scenario.mode === 'return') {
      calcData.push(['Required Annual Return', fmt.percent(scenario.rSolved),
        'Investment return needed with your current savings capacity']);
    } else if (scenario.mode === 'time') {
      calcData.push(['Years Needed', fmt.years(scenario.tSolved || 0),
        'Time required to reach your goal with current parameters']);
    }
    
    // Use table for better readability
    styles.addStyledTable(body, calcData, {
      headers: ['Key Metric', 'Value', 'What This Means'],
      alternateRows: true
    });
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Scenario Summary Section
    styles.addSection(body, 'SCENARIO SUMMARY');
    
    // Create summary based on scenario analysis
    let summaryAnalysis = '';
    const summaryTolerance = 1;
    
    if (scenario.mode === 'contrib' || !scenario.mode) {
      const capacity = Number(scenario.C_cap || 0);
      const required = Number(scenario.Creq || 0);
      const surplus = capacity - required;
      
      if (capacity >= required - summaryTolerance) {
        if (surplus > 50) {
          summaryAnalysis = `Your retirement plan is well-positioned with a comfortable ${fmt.money(surplus)} monthly buffer above the required ${fmt.money(required)} savings. This cushion provides protection against market volatility and gives you flexibility to increase your retirement income goal if desired. Your disciplined approach to saving ${fmt.money(capacity)} monthly will build a solid foundation for your ${fmt.money(scenario.M_real)} retirement income target.`;
        } else {
          summaryAnalysis = `Your retirement plan is precisely calibrated, with your ${fmt.money(capacity)} monthly savings capacity matching what's needed for your ${fmt.money(scenario.M_real)} retirement goal. While mathematically sound, consider building a small buffer for unexpected expenses or market downturns. Even an extra $50-100 monthly could provide valuable peace of mind.`;
        }
      } else {
        const shortfall = required - capacity;
        summaryAnalysis = `Your retirement plan faces a ${fmt.money(shortfall)} monthly savings gap. While your ${fmt.money(scenario.M_real)} retirement income goal is achievable, it requires ${fmt.money(required)} monthly versus your current ${fmt.money(capacity)} capacity. Consider extending your timeline, increasing risk tolerance for higher returns, or finding ways to boost monthly savings.`;
      }
    } else if (scenario.mode === 'return') {
      const requiredReturn = Number(scenario.rSolved || 0);
      if (requiredReturn <= 0.08) {
        summaryAnalysis = `Your retirement plan requires a conservative ${fmt.percent(requiredReturn)} annual return, achievable with low-risk investments. Your ${fmt.years(scenario.T)}-year timeline and ${fmt.money(scenario.C_cap)} monthly capacity create a realistic path to ${fmt.money(scenario.M_real)} retirement income.`;
      } else if (requiredReturn <= 0.15) {
        summaryAnalysis = `Your plan requires a moderate ${fmt.percent(requiredReturn)} annual return, achievable with balanced investments but requiring market risk tolerance. Monitor progress regularly and be prepared to adjust if conditions change.`;
      } else {
        summaryAnalysis = `Your plan requires an aggressive ${fmt.percent(requiredReturn)} annual return. While possible, this carries significant risk. Consider extending your timeline, increasing monthly capacity, or moderating retirement expectations for a more reliable plan.`;
      }
    } else if (scenario.mode === 'time') {
      const yearsNeeded = Number(scenario.tSolved || 0);
      if (yearsNeeded <= 20) {
        summaryAnalysis = `Your accelerated ${Math.round(yearsNeeded)}-year timeline will quickly reach your ${fmt.money(scenario.M_real)} retirement goal, but requires discipline with ${fmt.money(scenario.C_cap)} monthly savings. Stay consistent and monitor investment performance closely.`;
      } else if (yearsNeeded <= 35) {
        summaryAnalysis = `Your balanced ${Math.round(yearsNeeded)}-year timeline provides reasonable flexibility for market fluctuations while keeping retirement within a realistic timeframe. This represents an achievable approach to your retirement goals.`;
      } else {
        summaryAnalysis = `Your extended ${Math.round(yearsNeeded)}-year timeline assumes continued earning well into later working years. Consider whether increasing monthly savings might allow for an earlier retirement date.`;
      }
    }
    
    const summaryParagraph = body.appendParagraph(summaryAnalysis);
    summaryParagraph.setBold(false);
    summaryParagraph.setForegroundColor('#000000');
    
    body.appendParagraph('').setSpacingAfter(8);
    
    // Add page break before Key Assumptions
    body.appendPageBreak();
    
    // Key Assumptions Section
    styles.addSection(body, 'KEY ASSUMPTIONS');
    
    body.appendParagraph('This analysis is based on the following assumptions. Understanding these helps you evaluate the reliability of projections and identify which factors might change over time. Consider reviewing these assumptions annually and adjusting your plan as needed.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    // Build assumptions data
    const assumptionsData = [
      ['Inflation Rate', fmt.percent(scenario.infl || 0.025), 'Annual increase in cost of living'],
      ['Retirement Duration', `${scenario.D || 30} years`, 'Expected length of retirement'],
      ['Maintenance Rate', fmt.percent(scenario.rRet || 0.03), 'Annual return during retirement phase'],
      ['Withdrawal Rate', fmt.percent(0.10), 'Safe withdrawal rate from nest egg'],
      ['Deployment Drag', '25% reduction', 'Conservative pacing factor (75% effective)'],
      ['Return Consistency', 'Steady annual returns', 'Assumes no market volatility'],
      ['Contribution Pattern', 'Monthly contributions', 'Same amount invested each month'],
      ['Tax Treatment', 'Not included', 'Returns shown are pre-tax']
    ];
    
    styles.addStyledTable(body, assumptionsData, {
      headers: ['Assumption', 'Value', 'Description'],
      alternateRows: true
    });
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Risk Profile Section
    styles.addSection(body, 'YOUR RISK PROFILE & INVESTMENT STRATEGY');
    
    body.appendParagraph('Your risk tolerance determines the types of investments suitable for your portfolio and the returns you can reasonably expect. Higher risk levels generally offer higher potential returns but come with greater volatility and possible losses. The strategy below aligns with your selected risk level and shows typical investment types and important considerations.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    const riskLevel = Number(scenario.risk || 0);
    const riskCategory = fmt.riskLevel(riskLevel);
    let riskDescription = '';
    let typicalInvestments = '';
    let considerations = '';
    
    if (riskLevel <= 2) {
      riskDescription = 'Your conservative approach prioritizes capital preservation over growth. This strategy is appropriate for investors who cannot afford to lose principal or need access to funds in the near term.';
      typicalInvestments = 'Cash equivalents, Treasury bills, high-grade corporate bonds, stable value funds';
      considerations = '✓ High liquidity and stability\n✓ Minimal volatility\n✗ Returns may not outpace inflation\n✗ Limited growth potential';
    } else if (riskLevel <= 4) {
      riskDescription = 'Your moderate approach balances safety with modest growth potential. This strategy suits investors seeking predictable income with some appreciation.';
      typicalInvestments = 'Fixed income funds, dividend-paying stocks, balanced funds, corporate bonds';
      considerations = '✓ Predictable income streams\n✓ Lower volatility than equities\n✓ Some inflation protection\n✗ Moderate growth potential';
    } else if (riskLevel <= 6) {
      riskDescription = 'Your growth-oriented approach focuses on tangible assets that provide both income and appreciation. This strategy offers inflation protection and steady cash flows.';
      typicalInvestments = 'Multi-family real estate, REITs, infrastructure funds, commodities';
      considerations = '✓ Inflation hedge\n✓ Regular income potential\n✓ Asset-backed security\n✗ Less liquid than stocks\n✗ Market cycle sensitivity';
    } else if (riskLevel <= 8) {
      riskDescription = 'Your aggressive growth strategy seeks above-market returns through sophisticated investment vehicles. This approach requires tolerance for volatility and longer time horizons.';
      typicalInvestments = 'Hedge funds, growth stocks, emerging markets, alternative investments';
      considerations = '✓ High return potential\n✓ Professional management\n✓ Portfolio diversification\n✗ Higher fees\n✗ Reduced liquidity\n✗ Significant volatility';
    } else {
      riskDescription = 'Your maximum growth strategy pursues exceptional returns through high-risk alternatives. This approach is suitable only for sophisticated investors with long time horizons.';
      typicalInvestments = 'Private equity, venture capital, leveraged strategies, cryptocurrency';
      considerations = '✓ Exceptional return potential\n✓ Access to exclusive opportunities\n✗ Very high volatility\n✗ Long lock-up periods\n✗ Potential for significant losses\n✗ Complex tax implications';
    }
    
    // Add risk level with proper formatting
    const riskLevelPara = body.appendParagraph(`Your Selected Risk Level: ${riskLevel}/10`);
    riskLevelPara.setBold(true);
    riskLevelPara.setFontSize(12);
    
    const categoryPara = body.appendParagraph(`Category: ${riskCategory}`);
    categoryPara.setBold(false);
    categoryPara.setFontSize(11);
    
    body.appendParagraph('').setSpacingAfter(8);
    body.appendParagraph(riskDescription).setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    // Add risk profile details in a table format
    const riskData = [
      ['Risk Category', riskCategory],
      ['Typical Investments', typicalInvestments],
      ['Key Considerations', considerations]
    ];
    
    const riskTable = body.appendTable();
    riskData.forEach(row => {
      const tableRow = riskTable.appendTableRow();
      const labelCell = tableRow.appendTableCell(row[0]);
      labelCell.getChild(0).asParagraph().setBold(true);
      labelCell.getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text on purple
      labelCell.setWidth(120);  // Reduced from 150
      labelCell.setBackgroundColor('#4b4166');  // Purple from website
      const valueCell = tableRow.appendTableCell(row[1]);
      valueCell.getChild(0).asParagraph().setForegroundColor('#000000');  // Black text
      valueCell.setWidth(380);  // Reduced from 420
    });
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Recommendations Section
    styles.addSection(body, 'PERSONALIZED RECOMMENDATIONS & ACTION PLAN');
    
    body.appendParagraph('This section provides specific, actionable steps based on your plan\'s feasibility. If your plan is feasible, we focus on optimization strategies. If adjustments are needed, we prioritize the most effective changes to get you on track. Follow these recommendations in order, starting with immediate actions.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    if (isFeasible) {
      body.appendParagraph('Congratulations! Your retirement plan is achievable with your current strategy.');
      body.appendParagraph('');
      
      body.appendParagraph('Immediate Action Items:').setBold(true);
      body.appendParagraph('1. Set up automatic monthly transfers of ' + fmt.money(required) + ' to your investment account').setBold(false);
      body.appendParagraph('2. Review and optimize your current investment allocations to align with your risk level').setBold(false);
      body.appendParagraph('3. Establish an emergency fund separate from retirement savings (3-6 months expenses)').setBold(false);
      body.appendParagraph('');
      
      body.appendParagraph('Optimization Strategies:').setBold(true);
      const gap = capacity - required;
      if (gap > tolerance) {
        body.appendParagraph(`• You have a ${fmt.money(gap)} monthly surplus - consider investing this for faster growth or earlier retirement`).setBold(false);
      } else if (Math.abs(gap) <= tolerance) {
        body.appendParagraph(`• You're exactly on target - consider building a 5-10% buffer for market volatility`).setBold(false);
      }
      body.appendParagraph('• Maximize tax-advantaged accounts (401k, IRA, Roth IRA) before taxable investments').setBold(false);
      body.appendParagraph('• Review insurance coverage to protect your retirement plan from unexpected events').setBold(false);
      body.appendParagraph('• Consider dollar-cost averaging to reduce market timing risk').setBold(false);
      body.appendParagraph('');
      
      body.appendParagraph('Annual Review Checklist:').setBold(true);
      body.appendParagraph('☐ Reassess your retirement income needs and adjust for lifestyle changes').setBold(false);
      body.appendParagraph('☐ Review investment performance against benchmarks').setBold(false);
      body.appendParagraph('☐ Rebalance portfolio to maintain target risk level').setBold(false);
      body.appendParagraph('☐ Increase contributions with salary raises (at least 50% of raises)').setBold(false);
      body.appendParagraph('☐ Update beneficiary information on all accounts').setBold(false);
      
    } else {
      body.appendParagraph('Your retirement goal requires some adjustments to become achievable.');
      body.appendParagraph('');
      
      const shortfall = Math.abs(capacity - required);
      
      body.appendParagraph('Primary Recommendations:').setBold(true);
      body.appendParagraph(`1. Increase monthly savings by ${fmt.money(shortfall)} through:`).setBold(false);
      body.appendParagraph('   • Reducing discretionary spending').setBold(false);
      body.appendParagraph('   • Increasing income through side work or career advancement').setBold(false);
      body.appendParagraph('   • Refinancing debts to lower monthly payments').setBold(false);
      body.appendParagraph('');
      
      body.appendParagraph('Alternative Strategies:').setBold(true);
      body.appendParagraph('2. Extend your working years by 3-5 years to allow more accumulation time').setBold(false);
      body.appendParagraph('3. Adjust retirement income goal to ' + fmt.money(scenario.M_real * 0.8) + ' (80% of current target)').setBold(false);
      body.appendParagraph('4. Consider increasing risk tolerance if your time horizon permits (discuss with advisor)').setBold(false);
      body.appendParagraph('5. Explore part-time work during early retirement to reduce withdrawal needs').setBold(false);
      body.appendParagraph('');
      
      body.appendParagraph('Immediate Steps:').setBold(true);
      body.appendParagraph('☐ Schedule a detailed budget review to identify savings opportunities').setBold(false);
      body.appendParagraph('☐ Meet with your financial advisor to discuss strategy adjustments').setBold(false);
      body.appendParagraph('☐ Research additional income opportunities').setBold(false);
      body.appendParagraph('☐ Review and reduce investment fees where possible').setBold(false);
    }
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Important Disclaimers Section
    styles.addSection(body, 'IMPORTANT INFORMATION & DISCLAIMERS');
    
    body.appendParagraph('Please read this section carefully to understand the assumptions and limitations of this analysis. This report provides educational projections based on simplified models and should not be considered personalized investment advice.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    body.appendParagraph('Understanding Your Projections:').setBold(true);
    body.appendParagraph('• All calculations assume consistent monthly contributions and steady returns').setBold(false);
    body.appendParagraph('• Real-world returns fluctuate significantly year to year').setBold(false);
    body.appendParagraph('• Inflation rate of ' + fmt.percent(scenario.infl) + ' is an estimate; actual inflation may vary').setBold(false);
    body.appendParagraph('• Conservative pacing model accounts for deployment timing in alternative investments').setBold(false);
    body.appendParagraph('• Tax implications are not included in these calculations').setBold(false);
    body.appendParagraph('');
    
    body.appendParagraph('Risk Disclosure:').setBold(true);
    body.appendParagraph('Investment returns are not guaranteed and you may lose money. Higher potential returns generally involve higher risk of losses. Alternative investments may have limited liquidity, higher fees, and complex tax implications. Past performance does not guarantee future results.').setBold(false);
    body.appendParagraph('');
    
    body.appendParagraph('Professional Guidance:').setBold(true);
    body.appendParagraph('This report is for educational and planning purposes only. It is not personalized investment advice. Please consult with qualified financial, tax, and legal advisors before making investment decisions. Your advisor can help you:').setBold(false);
    body.appendParagraph('• Select specific investments aligned with your goals').setBold(false);
    body.appendParagraph('• Optimize for tax efficiency').setBold(false);
    body.appendParagraph('• Adjust for changing life circumstances').setBold(false);
    body.appendParagraph('• Navigate complex investment structures').setBold(false);
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Footer with TruPath Financial branding
    body.appendParagraph('').setSpacingBefore(20);
    body.appendHorizontalRule();
    const footerText = body.appendParagraph('TruPath Financial | Investment Planning Tool');
    footerText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footerText.setFontSize(11);
    footerText.setBold(true);
    const dateFooter = body.appendParagraph('Report generated on ' + fmt.date());
    dateFooter.setFontSize(10);
    dateFooter.setForegroundColor('#666666');
    dateFooter.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    // Save and close the document
    doc.saveAndClose();
    
    // Convert to PDF
    const docFile = DriveApp.getFileById(docId);
    const pdfBlob = docFile.getAs('application/pdf');
    
    // Create PDF file in specific Drive folder
    const folder = DriveApp.getFolderById(REPORTS_FOLDER_ID);
    const clientName = `${scenario.firstName || ''}_${scenario.lastName || ''}`.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setName(`Investment_Report_${clientName}_${scenario.clientId}_${timestamp}.pdf`);
    
    // Make the PDF accessible to anyone with the link
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get download URL
    const pdfId = pdfFile.getId();
    const pdfUrl = `https://drive.google.com/uc?export=download&id=${pdfId}`;
    
    // Delete the temporary Doc file
    DriveApp.getFileById(docId).setTrashed(true);
    
    // Return success with PDF URL
    return { 
      ok: true, 
      pdfUrl: pdfUrl,
      pdfId: pdfId,
      fileName: pdfFile.getName()
    };
    
  } catch (error) {
    console.error('Report generation error:', error);
    return { 
      ok: false, 
      error: 'Failed to generate report: ' + error.toString() 
    };
  }
}

/**
 * Generate a comparison report for two scenarios
 * Creates a side-by-side comparison showing differences and trade-offs
 */
function generateComparisonReport(scenario1, scenario2) {
  try {
    if (!scenario1 || !scenario2 || typeof scenario1 !== 'object' || typeof scenario2 !== 'object') {
      return { ok: false, error: 'Invalid scenario data for comparison' };
    }
    
    // Helper function to ensure all calculated fields exist
    const ensureCalculatedFields = (scenario) => {
      // Set defaults for optional fields
      const infl = scenario.infl || 0.025;
      const D = scenario.D || 25;
      const rRet = scenario.rRet || 0.03;
      
      // Calculate M0 (Future Monthly Income) if missing
      if (scenario.M0 === undefined && scenario.M_real !== undefined && scenario.T !== undefined) {
        scenario.M0 = scenario.M_real * Math.pow(1 + infl, scenario.T);
      }
      
      // Calculate Areq (Required Nest Egg) if missing
      if (scenario.Areq === undefined && scenario.M_real !== undefined && scenario.T !== undefined) {
        const M0 = scenario.M0 || (scenario.M_real * Math.pow(1 + infl, scenario.T));
        const monthlyInRet = M0 * 12;
        const pvFactor = (1 - Math.pow(1 + rRet, -D)) / rRet;
        scenario.Areq = monthlyInRet * pvFactor;
      }
      
      // Calculate rAccTarget if missing (from risk level)
      if (scenario.rAccTarget === undefined && scenario.risk !== undefined) {
        // Using the returnFromRisk logic from index.html
        const R = scenario.risk;
        const [rMin, rMax] = [0.02, 0.12];
        scenario.rAccTarget = rMin + (rMax - rMin) * (R / 10);
      }
      
      // Calculate rAccEff if missing
      if (scenario.rAccEff === undefined && scenario.rAccTarget !== undefined) {
        // Using the effectiveAccReturn logic (75% of target)
        scenario.rAccEff = 0.75 * scenario.rAccTarget;
      }
      
      return scenario;
    };
    
    // Ensure all calculated fields exist for both scenarios
    ensureCalculatedFields(scenario1);
    ensureCalculatedFields(scenario2);

    // Create a new Google Doc for the comparison report
    const doc = DocumentApp.create(`Comparison Report - ${scenario1.name || 'Scenario 1'} vs ${scenario2.name || 'Scenario 2'} - ${new Date().toLocaleDateString()}`);
    const docId = doc.getId();
    const body = doc.getBody();
    
    // Add document header with title
    const header = doc.addHeader();
    const headerPara1 = header.appendParagraph('TRUPATH FINANCIAL');
    headerPara1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    headerPara1.setBold(true);
    headerPara1.setFontSize(16);
    const headerPara2 = header.appendParagraph('Scenario Comparison Report');
    headerPara2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    headerPara2.setItalic(true);
    headerPara2.setFontSize(12);
    
    // Use new shared formatters
    const fmt = ReportFormatters;
    const styles = ReportStyles;
    
    // Clear default content
    body.clear();
    
    // Client Information Section with plain text formatting
    styles.addCompactSection(body, 'CLIENT INFORMATION');
    
    // Display client info as plain text without table - data is directly on scenario
    const firstName = scenario1.firstName || '';
    const lastName = scenario1.lastName || '';
    const fullName = (firstName + ' ' + lastName).trim();
    
    const namePara = body.appendParagraph(`Name: ${fullName}`);
    namePara.setBold(false);
    namePara.setSpacingAfter(4);
    
    const idPara = body.appendParagraph(`Client ID: ${scenario1.clientId || ''}`);
    idPara.setBold(false);
    idPara.setSpacingAfter(4);
    
    const emailPara = body.appendParagraph(`Email: ${scenario1.email || ''}`);
    emailPara.setBold(false);
    emailPara.setSpacingAfter(4);
    
    const datePara = body.appendParagraph(`Report Date: ${fmt.date()}`);
    datePara.setBold(false);
    datePara.setSpacingAfter(4);
    
    const typePara = body.appendParagraph('Report Type: Scenario Comparison Analysis');
    typePara.setBold(false);
    typePara.setSpacingAfter(4);
    
    body.appendParagraph('').setSpacingAfter(8);  // Reduced from 16
    
    // Scenarios Being Compared without highlight box
    styles.addCompactSection(body, 'SCENARIOS UNDER COMPARISON');
    
    const comparisonNames = `Comparing: "${scenario1.name || 'Scenario 1'}" vs "${scenario2.name || 'Scenario 2'}"`;
    const compPara = body.appendParagraph(comparisonNames);
    compPara.setBold(false);
    compPara.setForegroundColor('#000000');
    
    body.appendParagraph('').setSpacingAfter(8);  // Reduced from 12
    
    // Executive Summary with Feasibility Analysis
    styles.addCompactSection(body, 'EXECUTIVE SUMMARY');
    
    // Determine feasibility for both scenarios
    const tolerance = 1;
    
    // Check feasibility for scenario 1
    let isFeasible1 = false;
    if (scenario1.mode === 'contrib' || !scenario1.mode) {  // Default to contrib if mode not set
      const cap1 = Number(scenario1.C_cap || 0);
      const req1 = Number(scenario1.Creq || 0);
      isFeasible1 = (cap1 >= req1 - tolerance);
    } else if (scenario1.mode === 'return') {
      const rSolved = Number(scenario1.rSolved);
      isFeasible1 = rSolved > 0 && rSolved <= 0.30;
    } else if (scenario1.mode === 'time') {
      const tSolved = Number(scenario1.tSolved);
      isFeasible1 = tSolved > 0 && tSolved <= 50;
    }
    
    // Check feasibility for scenario 2
    let isFeasible2 = false;
    if (scenario2.mode === 'contrib' || !scenario2.mode) {  // Default to contrib if mode not set
      const cap2 = Number(scenario2.C_cap || 0);
      const req2 = Number(scenario2.Creq || 0);
      isFeasible2 = (cap2 >= req2 - tolerance);
    } else if (scenario2.mode === 'return') {
      const rSolved = Number(scenario2.rSolved);
      isFeasible2 = rSolved > 0 && rSolved <= 0.30;
    } else if (scenario2.mode === 'time') {
      const tSolved = Number(scenario2.tSolved);
      isFeasible2 = tSolved > 0 && tSolved <= 50;
    }
    
    // Status line (colored and bold)
    let statusText = '';
    let statusColor = '#22c55e';
    if (isFeasible1 && isFeasible2) {
      statusText = '✅ Both scenarios are FEASIBLE.';
    } else if (isFeasible1 && !isFeasible2) {
      statusText = `✅ Scenario 1 ("${scenario1.name}") is FEASIBLE. ❌ Scenario 2 ("${scenario2.name}") requires adjustments.`;
      statusColor = '#f59e0b';
    } else if (!isFeasible1 && isFeasible2) {
      statusText = `❌ Scenario 1 ("${scenario1.name}") requires adjustments. ✅ Scenario 2 ("${scenario2.name}") is FEASIBLE.`;
      statusColor = '#f59e0b';
    } else {
      statusText = '⚠️ Both scenarios require adjustments to become feasible.';
      statusColor = '#f59e0b';
    }
    
    // Add feasibility status WITHOUT highlighting
    const statusPara = body.appendParagraph(statusText);
    statusPara.setBold(true);
    statusPara.setForegroundColor(statusColor);
    statusPara.setFontSize(12);
    
    // Add space after status line
    body.appendParagraph('').setSpacingAfter(12);
    
    // Add explanation text (regular black text, not bold)
    let explanationText = '';
    if (isFeasible1 && isFeasible2) {
      explanationText = 'This comparison will help you choose between two viable retirement paths. Both scenarios meet your requirements, allowing you to select based on your preferences and risk tolerance.';
    } else if ((isFeasible1 && !isFeasible2) || (!isFeasible1 && isFeasible2)) {
      explanationText = 'This comparison shows one feasible scenario and one that needs adjustment. Review the key differences to understand what changes would make both scenarios viable.';
    } else {
      explanationText = 'This comparison shows the relative trade-offs between two scenarios that both need adjustments. Use this analysis to guide your planning toward feasibility.';
    }
    
    const explanationPara = body.appendParagraph(explanationText);
    explanationPara.setBold(false);
    explanationPara.setForegroundColor('#000000');
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Add Key Takeaways section at the end of Executive Summary  
    const takeawaysHeader = body.appendParagraph('📊 KEY TAKEAWAYS');
    takeawaysHeader.setBold(true);
    takeawaysHeader.setFontSize(12);
    takeawaysHeader.setForegroundColor('#000000');
    body.appendParagraph('').setSpacingAfter(8);
    
    // Build key takeaway bullets for comparison
    const takeaways = [];
    
    // Feasibility summary
    if (isFeasible1 && isFeasible2) {
      takeaways.push('• Winner: Both scenarios are feasible - choose based on preferences');
    } else if (isFeasible1 && !isFeasible2) {
      takeaways.push(`• Winner: Scenario 1 ("${scenario1.name}") is the only feasible option`);
    } else if (!isFeasible1 && isFeasible2) {
      takeaways.push(`• Winner: Scenario 2 ("${scenario2.name}") is the only feasible option`);
    } else {
      const gap1 = Math.abs(Number(scenario1.C_cap) - Number(scenario1.Creq));
      const gap2 = Math.abs(Number(scenario2.C_cap) - Number(scenario2.Creq));
      if (gap1 < gap2) {
        takeaways.push(`• Closer to Goal: Scenario 1 needs ${fmt.money(gap1)} more monthly`);
      } else {
        takeaways.push(`• Closer to Goal: Scenario 2 needs ${fmt.money(gap2)} more monthly`);
      }
    }
    
    // Key differences
    const nestEggDiff = Math.abs(Number(scenario1.Areq) - Number(scenario2.Areq));
    if (nestEggDiff > 50000) {
      const higher = Number(scenario1.Areq) > Number(scenario2.Areq) ? 'Scenario 1' : 'Scenario 2';
      takeaways.push(`• Nest Egg: ${higher} requires ${fmt.money(nestEggDiff)} more savings`);
    }
    
    // Time difference
    const timeDiffAbs = Math.abs(Number(scenario1.T) - Number(scenario2.T));
    if (timeDiffAbs > 1) {
      const longer = Number(scenario1.T) > Number(scenario2.T) ? 'Scenario 1' : 'Scenario 2';
      takeaways.push(`• Timeline: ${longer} takes ${timeDiffAbs.toFixed(1)} years longer`);
    }
    
    // Risk difference
    const riskDiffAbs = Math.abs(Number(scenario1.risk) - Number(scenario2.risk));
    if (riskDiffAbs > 1) {
      const riskier = Number(scenario1.risk) > Number(scenario2.risk) ? 'Scenario 1' : 'Scenario 2';
      takeaways.push(`• Risk Level: ${riskier} requires higher risk tolerance (${Math.max(scenario1.risk, scenario2.risk)}/10 vs ${Math.min(scenario1.risk, scenario2.risk)}/10)`);
    }
    
    // Decision point
    if (isFeasible1 || isFeasible2) {
      takeaways.push('• Next Step: Implement the feasible scenario or adjust the other to match');
    } else {
      takeaways.push('• Next Step: Adjust parameters to make at least one scenario feasible');
    }
    
    // Add the takeaway bullets
    takeaways.forEach(takeaway => {
      const bulletPara = body.appendParagraph(takeaway);
      bulletPara.setBold(false);
      bulletPara.setForegroundColor('#000000');
      bulletPara.setIndentFirstLine(20);
      bulletPara.setSpacingAfter(4);
    });
    
    body.appendParagraph('').setSpacingAfter(8);
    
    // Side-by-Side Input Comparison
    styles.addCompactSection(body, 'SCENARIO DETAILS COMPARISON');
    
    body.appendParagraph('This side-by-side comparison shows the key differences between your two scenarios. Pay attention to parameters with significant differences (highlighted in color) as these drive the different outcomes. Use this comparison to understand which inputs have the most impact on your retirement feasibility.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    const inputTable = body.appendTable();
    const headerRow = inputTable.appendTableRow();
    headerRow.appendTableCell('Parameter').getChild(0).asParagraph().setBold(true);
    headerRow.getCell(0).setBackgroundColor('#4b4166');  // Purple
    headerRow.getCell(0).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    headerRow.appendTableCell('Scenario 1').getChild(0).asParagraph().setBold(true);
    headerRow.getCell(1).setBackgroundColor('#4b4166');  // Purple
    headerRow.getCell(1).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    headerRow.appendTableCell('Scenario 2').getChild(0).asParagraph().setBold(true);
    headerRow.getCell(2).setBackgroundColor('#4b4166');  // Purple
    headerRow.getCell(2).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    headerRow.appendTableCell('Difference').getChild(0).asParagraph().setBold(true);
    headerRow.getCell(3).setBackgroundColor('#4b4166');  // Purple
    headerRow.getCell(3).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    
    // Helper to add comparison row with highlighting
    const addCompareRow = (label, val1, val2, formatter, showDiff = true) => {
      const row = inputTable.appendTableRow();
      // First column - parameter name (bold)
      const labelCell = row.appendTableCell(label);
      labelCell.getChild(0).asParagraph().setBold(true);
      labelCell.getChild(0).asParagraph().setForegroundColor('#000000');
      
      // Second column - scenario 1 value (no color)
      const val1Cell = row.appendTableCell(formatter(val1));
      val1Cell.getChild(0).asParagraph().setBold(false);
      val1Cell.getChild(0).asParagraph().setForegroundColor('#000000');
      
      // Third column - scenario 2 value (no color)
      const val2Cell = row.appendTableCell(formatter(val2));
      val2Cell.getChild(0).asParagraph().setBold(false);
      val2Cell.getChild(0).asParagraph().setForegroundColor('#000000');
      
      // Calculate and show difference
      let diffCell;
      if (showDiff && typeof val1 === 'number' && typeof val2 === 'number') {
        const diff = val2 - val1;
        const pctDiff = val1 !== 0 ? ((val2 - val1) / val1 * 100) : 0;
        
        if (formatter === fmt.money) {
          diffCell = row.appendTableCell(`${diff >= 0 ? '+' : ''}${fmt.money(diff)}`);
        } else if (formatter === fmt.percent) {
          diffCell = row.appendTableCell(`${diff >= 0 ? '+' : ''}${formatter(diff)}`);
        } else {
          diffCell = row.appendTableCell(`${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`);
        }
        
        // Color only the difference column based on positive/negative
        if (diff > 0) {
          diffCell.getChild(0).asParagraph().setForegroundColor('#059669');  // Green for positive
        } else if (diff < 0) {
          diffCell.getChild(0).asParagraph().setForegroundColor('#dc2626');  // Red for negative
        } else {
          diffCell.getChild(0).asParagraph().setForegroundColor('#000000');  // Black for zero
        }
        diffCell.getChild(0).asParagraph().setBold(false);
      } else {
        diffCell = row.appendTableCell('—');
        // Ensure em dash has gray color
        diffCell.getChild(0).asParagraph().setForegroundColor('#666666');
        diffCell.getChild(0).asParagraph().setBold(false);
      }
    };
    
    addCompareRow('Monthly Income Goal', scenario1.M_real, scenario2.M_real, fmt.money);
    addCompareRow('Years to Retirement', scenario1.T, scenario2.T, v => fmt.years(v));
    addCompareRow('Risk Tolerance', scenario1.risk, scenario2.risk, v => `${v}/10 - ${fmt.riskLevel(v)}`);
    addCompareRow('Monthly Savings Capacity', scenario1.C_cap, scenario2.C_cap, fmt.money);
    addCompareRow('Current Assets', scenario1.A0, scenario2.A0, fmt.money);
    
    // Only show inflation and retirement duration if they differ from defaults
    const defaultInflation = 0.025;  // 2.5% default
    const defaultDuration = 30;  // 30 years default
    
    const infl1 = Number(scenario1.infl || defaultInflation);
    const infl2 = Number(scenario2.infl || defaultInflation);
    const dur1 = Number(scenario1.D || defaultDuration);
    const dur2 = Number(scenario2.D || defaultDuration);
    
    // Show inflation if either scenario differs from default
    if (Math.abs(infl1 - defaultInflation) > 0.0001 || Math.abs(infl2 - defaultInflation) > 0.0001) {
      addCompareRow('Inflation Rate', scenario1.infl, scenario2.infl, fmt.percent);
    }
    
    // Show duration if either scenario differs from default  
    if (Math.abs(dur1 - defaultDuration) > 0.1 || Math.abs(dur2 - defaultDuration) > 0.1) {
      addCompareRow('Retirement Duration', scenario1.D, scenario2.D, v => fmt.years(v));
    }
    
    body.appendParagraph('').setSpacingAfter(6);  // Reduced from 12
    
    // Key Calculations Comparison
    styles.addCompactSection(body, 'KEY CALCULATIONS COMPARISON');
    
    body.appendParagraph('These calculations show the financial outcomes for each scenario based on your inputs. Compare the required nest eggs and monthly savings to see which scenario better aligns with your capabilities. The "Impact" column explains what each metric represents for your planning.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    const calcTable = body.appendTable();
    const calcHeader = calcTable.appendTableRow();
    calcHeader.appendTableCell('Metric').getChild(0).asParagraph().setBold(true);
    calcHeader.getCell(0).setBackgroundColor('#4b4166');  // Purple
    calcHeader.getCell(0).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    calcHeader.appendTableCell('Scenario 1').getChild(0).asParagraph().setBold(true);
    calcHeader.getCell(1).setBackgroundColor('#4b4166');  // Purple
    calcHeader.getCell(1).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    calcHeader.appendTableCell('Scenario 2').getChild(0).asParagraph().setBold(true);
    calcHeader.getCell(2).setBackgroundColor('#4b4166');  // Purple
    calcHeader.getCell(2).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    calcHeader.appendTableCell('Impact').getChild(0).asParagraph().setBold(true);
    calcHeader.getCell(3).setBackgroundColor('#4b4166');  // Purple
    calcHeader.getCell(3).getChild(0).asParagraph().setForegroundColor('#ffffff');  // White text
    
    // Add calculation comparisons
    const addCalcRow = (label, val1, val2, formatter, impact) => {
      const row = calcTable.appendTableRow();
      // First column - label (bold, black text)
      const labelCell = row.appendTableCell(label);
      labelCell.getChild(0).asParagraph().setBold(true);
      labelCell.getChild(0).asParagraph().setForegroundColor('#000000');
      
      // Second column - scenario 1 value (black text)
      const val1Cell = row.appendTableCell(formatter(val1));
      val1Cell.getChild(0).asParagraph().setBold(false);
      val1Cell.getChild(0).asParagraph().setForegroundColor('#000000');
      
      // Third column - scenario 2 value (black text)
      const val2Cell = row.appendTableCell(formatter(val2));
      val2Cell.getChild(0).asParagraph().setBold(false);
      val2Cell.getChild(0).asParagraph().setForegroundColor('#000000');
      
      // Fourth column - impact (gray text)
      const impactCell = row.appendTableCell(impact);
      impactCell.getChild(0).asParagraph().setForegroundColor('#666666');
      impactCell.getChild(0).asParagraph().setFontSize(10);
    };
    
    addCalcRow('Future Monthly Income', scenario1.M0, scenario2.M0, fmt.money, 
      'Inflation-adjusted income at retirement');
    
    addCalcRow('Required Nest Egg', scenario1.Areq, scenario2.Areq, fmt.money,
      'Total savings needed at retirement');
    
    addCalcRow('Target Return', scenario1.rAccTarget, scenario2.rAccTarget, fmt.percent,
      'Based on risk tolerance');
    
    addCalcRow('Effective Return', scenario1.rAccEff, scenario2.rAccEff, fmt.percent,
      'Conservative estimate for planning');
    
    // Mode-specific calculations
    if (scenario1.mode === 'contrib' && scenario2.mode === 'contrib') {
      addCalcRow('Required Monthly Savings', scenario1.Creq, scenario2.Creq, fmt.money,
        'Minimum needed to reach goal');
      
      const surplus1 = Number(scenario1.C_cap) - Number(scenario1.Creq);
      const surplus2 = Number(scenario2.C_cap) - Number(scenario2.Creq);
      addCalcRow('Surplus/Shortfall', surplus1, surplus2, fmt.money,
        surplus1 >= 0 && surplus2 >= 0 ? 'Monthly buffer available' : 'Additional savings needed');
    }
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Comparison Summary Section
    styles.addCompactSection(body, 'COMPARISON SUMMARY');
    
    // Create comparison analysis
    let comparisonAnalysis = '';
    const compTolerance = 1;
    
    // Check feasibility for both scenarios
    let scenario1Feasible = false, scenario2Feasible = false;
    
    if (scenario1.mode === 'contrib' || !scenario1.mode) {
      scenario1Feasible = (Number(scenario1.C_cap) >= Number(scenario1.Creq) - compTolerance);
    } else if (scenario1.mode === 'return') {
      const r1 = Number(scenario1.rSolved);
      scenario1Feasible = r1 > 0 && r1 <= 0.30;
    } else if (scenario1.mode === 'time') {
      const t1 = Number(scenario1.tSolved);
      scenario1Feasible = t1 > 0 && t1 <= 50;
    }
    
    if (scenario2.mode === 'contrib' || !scenario2.mode) {
      scenario2Feasible = (Number(scenario2.C_cap) >= Number(scenario2.Creq) - compTolerance);
    } else if (scenario2.mode === 'return') {
      const r2 = Number(scenario2.rSolved);
      scenario2Feasible = r2 > 0 && r2 <= 0.30;
    } else if (scenario2.mode === 'time') {
      const t2 = Number(scenario2.tSolved);
      scenario2Feasible = t2 > 0 && t2 <= 50;
    }
    
    // Generate comparison analysis
    if (scenario1Feasible && scenario2Feasible) {
      comparisonAnalysis = `Both scenarios are mathematically feasible, giving you genuine options. "${scenario1.name || 'Scenario 1'}" targets ${fmt.money(scenario1.M_real)} monthly retirement income, while "${scenario2.name || 'Scenario 2'}" aims for ${fmt.money(scenario2.M_real)}. The choice comes down to which combination of savings requirements, timeline, and retirement lifestyle aligns better with your personal priorities and current financial capacity.`;
    } else if (scenario1Feasible && !scenario2Feasible) {
      comparisonAnalysis = `"${scenario1.name || 'Scenario 1'}" presents the only viable path forward, offering a clear route to ${fmt.money(scenario1.M_real)} monthly retirement income with realistic requirements. "${scenario2.name || 'Scenario 2'}" faces feasibility challenges that would require adjustments to timeline, savings capacity, or retirement expectations. Focus on implementing the viable scenario while using the comparison as a reference for future planning.`;
    } else if (!scenario1Feasible && scenario2Feasible) {
      comparisonAnalysis = `"${scenario2.name || 'Scenario 2'}" presents the only viable path forward, offering a clear route to ${fmt.money(scenario2.M_real)} monthly retirement income with realistic requirements. "${scenario1.name || 'Scenario 1'}" faces feasibility challenges that would require adjustments to timeline, savings capacity, or retirement expectations. Focus on implementing the viable scenario while using the comparison as a reference for future planning.`;
    } else {
      comparisonAnalysis = `Both scenarios require significant adjustments before either can serve as a reliable retirement plan. This comparison highlights important trade-offs between retirement income goals, savings capacity, and timeline expectations. Use these insights to develop a modified approach that balances your aspirations with realistic financial constraints.`;
    }
    
    const comparisonParagraph = body.appendParagraph(comparisonAnalysis);
    comparisonParagraph.setBold(false);
    comparisonParagraph.setForegroundColor('#000000');
    
    body.appendParagraph('').setSpacingAfter(8);
    
    // Add page break before Key Assumptions
    body.appendPageBreak();
    
    // Key Assumptions Section for Comparison Report
    styles.addCompactSection(body, 'KEY ASSUMPTIONS');
    
    body.appendParagraph('Both scenarios in this comparison are based on the following shared assumptions. Any differences in assumptions between scenarios are shown in the parameters comparison above. Consider how changes to these assumptions might affect your decision between scenarios.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    // Build assumptions data - showing both scenarios where different
    const assumptionsData = [];
    
    // Check if inflation rates differ (reuse variables from earlier)
    if (Math.abs(infl1 - infl2) < 0.0001) {
      assumptionsData.push(['Inflation Rate', fmt.percent(infl1), 'Annual cost of living increase (same for both)']);
    } else {
      assumptionsData.push(['Inflation Rate', `S1: ${fmt.percent(infl1)}, S2: ${fmt.percent(infl2)}`, 'Annual cost of living increase']);
    }
    
    // Check if retirement durations differ (reuse variables from earlier)
    if (Math.abs(dur1 - dur2) < 0.1) {
      assumptionsData.push(['Retirement Duration', `${dur1} years`, 'Expected retirement period (same for both)']);
    } else {
      assumptionsData.push(['Retirement Duration', `S1: ${dur1} years, S2: ${dur2} years`, 'Expected retirement period']);
    }
    
    // Common assumptions
    assumptionsData.push(
      ['Withdrawal Rate', fmt.percent(0.03), 'Annual withdrawal rate during retirement'],
      ['Market Behavior', 'Steady returns', 'No volatility or market crashes assumed'],
      ['Contribution Pattern', 'Monthly investments', 'Same amount each month'],
      ['Tax Treatment', 'Not included', 'All returns shown are pre-tax'],
      ['Conservative Pacing', '75% of target', 'Effective return accounts for deployment'],
      ['Healthcare Costs', 'Included in income goal', 'No separate healthcare inflation']
    );
    
    styles.addStyledTable(body, assumptionsData, {
      headers: ['Assumption', 'Value', 'Impact on Comparison'],
      alternateRows: true
    });
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Trade-off Analysis
    styles.addCompactSection(body, 'TRADE-OFF ANALYSIS');
    
    body.appendParagraph('Understanding the trade-offs between scenarios helps you make an informed decision. This analysis highlights the key differences and their implications for your retirement planning. Consider which trade-offs align best with your personal circumstances and priorities.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    const tradeoffs = [];
    
    // Analyze key differences
    const timeDiff = Number(scenario2.T) - Number(scenario1.T);
    const riskDiff = Number(scenario2.risk) - Number(scenario1.risk);
    const incomeDiff = Number(scenario2.M_real) - Number(scenario1.M_real);
    const savingsDiff = Number(scenario2.C_cap) - Number(scenario1.C_cap);
    
    if (Math.abs(timeDiff) > 1) {
      if (timeDiff > 0) {
        tradeoffs.push(`• Scenario 2 adds ${Math.abs(timeDiff).toFixed(1)} years before retirement, reducing required monthly savings but delaying your goals.`);
      } else {
        tradeoffs.push(`• Scenario 1 adds ${Math.abs(timeDiff).toFixed(1)} years before retirement, providing more accumulation time.`);
      }
    }
    
    if (Math.abs(riskDiff) > 1) {
      if (riskDiff > 0) {
        tradeoffs.push(`• Scenario 2 accepts higher risk (${scenario2.risk}/10 vs ${scenario1.risk}/10) for potentially higher returns.`);
      } else {
        tradeoffs.push(`• Scenario 1 accepts higher risk (${scenario1.risk}/10 vs ${scenario2.risk}/10) for potentially higher returns.`);
      }
    }
    
    if (Math.abs(incomeDiff) > 500) {
      if (incomeDiff > 0) {
        tradeoffs.push(`• Scenario 2 targets ${fmt.money(Math.abs(incomeDiff))} more monthly income, requiring a larger nest egg.`);
      } else {
        tradeoffs.push(`• Scenario 1 targets ${fmt.money(Math.abs(incomeDiff))} more monthly income, requiring a larger nest egg.`);
      }
    }
    
    if (Math.abs(savingsDiff) > 100) {
      if (savingsDiff > 0) {
        tradeoffs.push(`• Scenario 2 commits ${fmt.money(Math.abs(savingsDiff))} more monthly savings, accelerating wealth accumulation.`);
      } else {
        tradeoffs.push(`• Scenario 1 commits ${fmt.money(Math.abs(savingsDiff))} more monthly savings, accelerating wealth accumulation.`);
      }
    }
    
    if (tradeoffs.length === 0) {
      tradeoffs.push('• These scenarios are very similar. Consider adjusting parameters for more meaningful comparison.');
    }
    
    body.appendParagraph('Key Trade-offs:').setBold(true);
    tradeoffs.forEach(tradeoff => {
      const tradeoffPara = body.appendParagraph(tradeoff);
      tradeoffPara.setBold(false);
    });
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Recommendation
    styles.addCompactSection(body, 'RECOMMENDATION');
    
    body.appendParagraph('Based on the comparison above, here is our recommendation for which scenario best suits your situation. This recommendation considers feasibility, financial flexibility, and alignment with your goals. Remember that you can always adjust parameters to explore additional options.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    let recommendation = '';
    let rationale = [];
    
    if (isFeasible1 && !isFeasible2) {
      recommendation = `Scenario 1 ("${scenario1.name}") is the clear choice as it's the only feasible option.`;
      rationale.push('It fits within your current financial capacity');
      rationale.push('No adjustments needed to start immediately');
    } else if (!isFeasible1 && isFeasible2) {
      recommendation = `Scenario 2 ("${scenario2.name}") is the clear choice as it's the only feasible option.`;
      rationale.push('It fits within your current financial capacity');
      rationale.push('No adjustments needed to start immediately');
    } else if (isFeasible1 && isFeasible2) {
      // Both feasible - need to analyze which is better
      const surplus1 = Number(scenario1.C_cap) - Number(scenario1.Creq || 0);
      const surplus2 = Number(scenario2.C_cap) - Number(scenario2.Creq || 0);
      
      if (surplus1 > surplus2 && surplus1 > 50) {
        recommendation = `Scenario 1 ("${scenario1.name}") provides more financial flexibility.`;
        rationale.push(`Larger monthly surplus (${fmt.money(surplus1)}) for unexpected expenses`);
        rationale.push('Lower stress on monthly budget');
      } else if (surplus2 > surplus1 && surplus2 > 50) {
        recommendation = `Scenario 2 ("${scenario2.name}") provides more financial flexibility.`;
        rationale.push(`Larger monthly surplus (${fmt.money(surplus2)}) for unexpected expenses`);
        rationale.push('Lower stress on monthly budget');
      } else if (Number(scenario1.T) < Number(scenario2.T) - 2) {
        recommendation = `Scenario 1 ("${scenario1.name}") gets you to retirement ${(Number(scenario2.T) - Number(scenario1.T)).toFixed(1)} years sooner.`;
        rationale.push('Earlier financial independence');
        rationale.push('More years to enjoy retirement');
      } else if (Number(scenario2.T) < Number(scenario1.T) - 2) {
        recommendation = `Scenario 2 ("${scenario2.name}") gets you to retirement ${(Number(scenario1.T) - Number(scenario2.T)).toFixed(1)} years sooner.`;
        rationale.push('Earlier financial independence');
        rationale.push('More years to enjoy retirement');
      } else {
        recommendation = `Both scenarios are viable. Choose based on your risk tolerance and lifestyle preferences.`;
        rationale.push('Similar feasibility and outcomes');
        rationale.push('Decision depends on personal preferences');
      }
    } else {
      // Neither feasible - calculate gaps correctly
      const gap1 = Number(scenario1.Creq || 0) - Number(scenario1.C_cap || 0);
      const gap2 = Number(scenario2.Creq || 0) - Number(scenario2.C_cap || 0);
      
      if (gap1 < gap2 && gap1 > 0) {
        recommendation = `Scenario 1 ("${scenario1.name}") is closer to feasibility, requiring an additional ${fmt.money(gap1)} per month in savings capacity.`;
        rationale.push(`Current capacity: ${fmt.money(scenario1.C_cap)}, Required: ${fmt.money(scenario1.Creq)}`);
        rationale.push('Smaller gap to close compared to Scenario 2');
        rationale.push('Consider ways to increase monthly savings or adjust goals');
      } else if (gap2 > 0) {
        recommendation = `Scenario 2 ("${scenario2.name}") is closer to feasibility, requiring an additional ${fmt.money(gap2)} per month in savings capacity.`;
        rationale.push(`Current capacity: ${fmt.money(scenario2.C_cap)}, Required: ${fmt.money(scenario2.Creq)}`);
        rationale.push('Smaller gap to close compared to Scenario 1');
        rationale.push('Consider ways to increase monthly savings or adjust goals');
      } else {
        recommendation = 'Both scenarios need adjustment. Review your parameters to find a feasible path.';
        rationale.push('Consider extending your timeline');
        rationale.push('Explore ways to increase savings capacity');
        rationale.push('Adjust retirement income expectations');
      }
    }
    
    const recPara = body.appendParagraph(recommendation);
    recPara.setBold(true);
    recPara.setForegroundColor('#0369a1');
    recPara.setFontSize(12);
    
    if (rationale.length > 0) {
      body.appendParagraph('');
      body.appendParagraph('Supporting Rationale:').setBold(true);
      rationale.forEach(point => {
        const pointPara = body.appendParagraph(`• ${point}`);
        pointPara.setBold(false);
        pointPara.setForegroundColor('#000000');  // Ensure rationale bullets are black
      });
    }
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Action Steps
    styles.addCompactSection(body, 'RECOMMENDED ACTION STEPS');
    
    if (isFeasible1 || isFeasible2) {
      body.appendParagraph('Immediate Actions:').setBold(true);
      body.appendParagraph('1. Review and confirm the selected scenario aligns with your goals').setBold(false);
      body.appendParagraph('2. Set up automatic monthly transfers for the required savings amount').setBold(false);
      body.appendParagraph('3. Schedule quarterly reviews to track progress').setBold(false);
      body.appendParagraph('4. Consider saving any surplus for additional security').setBold(false);
    } else {
      body.appendParagraph('To Make Your Plan Feasible:').setBold(true);
      body.appendParagraph('1. Explore ways to increase monthly savings capacity').setBold(false);
      body.appendParagraph('2. Consider extending your timeline by 2-3 years').setBold(false);
      body.appendParagraph('3. Review your retirement income goals for possible adjustment').setBold(false);
      body.appendParagraph('4. Consult with a financial advisor about optimizing returns').setBold(false);
    }
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Sensitivity Analysis
    styles.addCompactSection(body, 'SENSITIVITY CONSIDERATIONS');
    body.appendParagraph('Small changes can significantly impact your outcomes:').setBold(false);
    body.appendParagraph('• Adding 2 years to your timeline can reduce required monthly savings by 15-20%').setBold(false);
    body.appendParagraph('• Increasing risk tolerance by 2 points might reduce required savings by 10-15%').setBold(false);
    body.appendParagraph('• Every $500/month less in retirement income reduces nest egg needs by ~$75,000').setBold(false);
    body.appendParagraph('• Starting with even $10,000 in current assets can reduce monthly requirements by $50-100').setBold(false);
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Important Disclaimers Section - matching single scenario report
    styles.addCompactSection(body, 'IMPORTANT INFORMATION & DISCLAIMERS');
    
    body.appendParagraph('Please read this section carefully to understand the assumptions and limitations of this analysis. This comparison provides educational projections based on simplified models and should not be considered personalized investment advice.').setBold(false);
    body.appendParagraph('').setSpacingAfter(8);
    
    body.appendParagraph('Understanding Your Projections:').setBold(true);
    body.appendParagraph('• All calculations assume consistent monthly contributions and steady returns').setBold(false);
    body.appendParagraph('• Real-world returns fluctuate significantly year to year').setBold(false);
    body.appendParagraph('• Both scenarios use estimated inflation rates; actual inflation may vary').setBold(false);
    body.appendParagraph('• Conservative pacing model accounts for deployment timing in alternative investments').setBold(false);
    body.appendParagraph('• Tax implications are not included in these calculations').setBold(false);
    body.appendParagraph('');
    
    body.appendParagraph('Risk Disclosure:').setBold(true);
    body.appendParagraph('Investment returns are not guaranteed and you may lose money. Higher potential returns generally involve higher risk of losses. Alternative investments may have limited liquidity, higher fees, and complex tax implications. Past performance does not guarantee future results.').setBold(false);
    body.appendParagraph('');
    
    body.appendParagraph('Professional Guidance:').setBold(true);
    body.appendParagraph('This comparison is for educational and planning purposes only. It is not personalized investment advice. Please consult with qualified financial, tax, and legal advisors before making investment decisions. Your advisor can help you:').setBold(false);
    body.appendParagraph('• Select specific investments aligned with your goals').setBold(false);
    body.appendParagraph('• Optimize for tax efficiency').setBold(false);
    body.appendParagraph('• Adjust for changing life circumstances').setBold(false);
    body.appendParagraph('• Navigate complex investment structures').setBold(false);
    
    body.appendParagraph('').setSpacingAfter(12);
    
    // Footer with TruPath Financial branding
    body.appendParagraph('').setSpacingBefore(20);
    body.appendHorizontalRule();
    const footerText = body.appendParagraph('TruPath Financial | Investment Planning Tool');
    footerText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footerText.setFontSize(11);
    footerText.setBold(true);
    const dateFooter = body.appendParagraph('Report generated on ' + fmt.date());
    dateFooter.setFontSize(10);
    dateFooter.setForegroundColor('#666666');
    dateFooter.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    // Save and close the document
    doc.saveAndClose();
    
    // Convert to PDF
    const docFile = DriveApp.getFileById(docId);
    const pdfBlob = docFile.getAs('application/pdf');
    
    // Create PDF file in specific Drive folder
    const folder = DriveApp.getFolderById(REPORTS_FOLDER_ID);
    const clientName = `${scenario1.firstName || ''}_${scenario1.lastName || ''}`.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setName(`Comparison_Report_${clientName}_${scenario1.clientId}_${timestamp}.pdf`);
    
    // Make the PDF accessible to anyone with the link
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get download URL
    const pdfId = pdfFile.getId();
    const pdfUrl = `https://drive.google.com/uc?export=download&id=${pdfId}`;
    
    // Delete the temporary Doc file
    DriveApp.getFileById(docId).setTrashed(true);
    
    // Return success with PDF URL
    return { 
      ok: true, 
      pdfUrl: pdfUrl,
      pdfId: pdfId,
      fileName: pdfFile.getName()
    };
    
  } catch (error) {
    console.error('Comparison report generation error:', error);
    return { 
      ok: false, 
      error: 'Failed to generate comparison report: ' + error.toString() 
    };
  }
}

/* -------- Optional debug helpers (run from Apps Script editor) --------
function _debugRosterMeta_() {
  const ss = SpreadsheetApp.openById(ROSTER_SPREADSHEET_ID);
  const tabs = ss.getSheets().map(s => ({name: s.getName(), gid: s.getSheetId()}));
  Logger.log(tabs);
}
function _debugLookup_(id) { Logger.log(lookupStudentById(id)); }
*/
