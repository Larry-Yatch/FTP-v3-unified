/**
 * Universal Google Sheets Access - One File Solution
 * 
 * SETUP (one line):
 *   npm install googleapis
 * 
 * USAGE:
 *   const sheets = require('./sheets');
 *   const data = await sheets.fetch('1_c4JB4VG4q-...');
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Auto-find token from any of these locations
const TOKEN_SEARCH_PATHS = [
  path.join(os.homedir(), '.google-sheets-auth', 'token.json'),
  path.join(os.homedir(), '.config', 'claude-mcp-global', 'token.json'),
  path.join(os.homedir(), 'code', 'Control_Fear_Investment_Tool', 'mcp-exploration', 'token.json'),
  './token.json',
  '../token.json',
];

// Main spreadsheet IDs
const SPREADSHEET_IDS = {
  V1_SCENARIOS: '1_c4JB4VG4q-fekL2T1s6nUo83Ko1nZbAkSkDfFM1X0M',
  V1_ROSTER: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
  V2_MAIN: '18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24',
  V3_MAIN: '1dEcTk-ODdp4mmYqPl4Du8jgmoUjhpnEjOgFfOOdEznc',
};

// V2 sheet configuration (centralized)
const V2_SHEETS = {
  SESSIONS: 'SESSIONS!A:F',
  RESPONSES: 'RESPONSES!A:H',
  TOOL_STATUS: 'TOOL_STATUS!A:Z',
  TOOL_ACCESS: 'TOOL_ACCESS!A:L',
  ACTIVITY_LOG: 'ACTIVITY_LOG!A:H',
  ADMINS: 'ADMINS!A:F',
  CONFIG: 'CONFIG!A:E',
  STUDENTS: 'Students!A:B',
  TOOL1_ORIENTATION: 'Tool1_Orientation',
};

// V3 sheet configuration
const V3_SHEETS = {
  SESSIONS: 'SESSIONS!A:F',
  RESPONSES: 'RESPONSES!A:F',
  TOOL_STATUS: 'TOOL_STATUS!A:Z',
  TOOL_ACCESS: 'TOOL_ACCESS!A:G',
  CROSS_TOOL_INSIGHTS: 'CrossToolInsights!A:I',
  INSIGHT_MAPPINGS: 'InsightMappings!A:I',
  ACTIVITY_LOG: 'ACTIVITY_LOG!A:H',
  ADMINS: 'ADMINS!A:F',
  CONFIG: 'CONFIG!A:E',
  STUDENTS: 'Students!A:H',
};

// Required sheets for validation
const REQUIRED_SHEETS = [
  'SESSIONS', 'RESPONSES', 'TOOL_STATUS', 'TOOL_ACCESS',
  'ACTIVITY_LOG', 'ADMINS', 'CONFIG', 'Students', 'Tool1_Orientation'
];

// V3 required sheets
const V3_REQUIRED_SHEETS = [
  'SESSIONS', 'RESPONSES', 'TOOL_STATUS', 'TOOL_ACCESS',
  'CrossToolInsights', 'InsightMappings', 'ACTIVITY_LOG',
  'ADMINS', 'CONFIG', 'Students'
];

// Legacy sheet aliases for backwards compatibility
const SHEETS = {
  scenarios: SPREADSHEET_IDS.V1_SCENARIOS,
  roster: SPREADSHEET_IDS.V1_ROSTER,
  v2_data: SPREADSHEET_IDS.V2_MAIN,
  sessions: SPREADSHEET_IDS.V2_MAIN,
  responses: SPREADSHEET_IDS.V2_MAIN,
  tool_status: SPREADSHEET_IDS.V2_MAIN,
};

// Cache auth to avoid re-reading token
let cachedAuth = null;

/**
 * Get authenticated client (auto-finds token)
 */
async function getAuth() {
  if (cachedAuth) return cachedAuth;
  
  // Find token
  let tokenPath = null;
  for (const searchPath of TOKEN_SEARCH_PATHS) {
    if (fs.existsSync(searchPath)) {
      tokenPath = searchPath;
      console.log(`📁 Using token from: ${searchPath}`);
      break;
    }
  }
  
  if (!tokenPath) {
    console.error('❌ No Google Sheets token found!');
    console.error('Run authentication in the mcp-exploration project first.');
    process.exit(1);
  }
  
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  cachedAuth = google.auth.fromJSON(token);
  return cachedAuth;
}

/**
 * Fetch any Google Sheet
 * @param {string} spreadsheetId - Sheet ID or key from SHEETS object
 * @param {string} range - Optional range (default 'A:Z')
 * @returns {Array} Sheet data as 2D array
 */
async function fetch(spreadsheetId, range = 'A:Z') {
  // Allow using shorthand keys
  if (SHEETS[spreadsheetId]) {
    spreadsheetId = SHEETS[spreadsheetId];
  }
  
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    return response.data.values || [];
  } catch (error) {
    if (error.code === 403) {
      console.error('❌ Permission denied. Make sure the sheet is shared or APIs are enabled.');
    } else if (error.code === 404) {
      console.error('❌ Sheet not found. Check the ID.');
    } else {
      console.error('❌ Error fetching sheet:', error.message);
    }
    throw error;
  }
}

/**
 * Fetch and convert to objects using header row
 */
async function fetchAsObjects(spreadsheetId, range = 'A:Z') {
  const data = await fetch(spreadsheetId, range);
  
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

/**
 * Quick test function
 */
async function test() {
  try {
    console.log('🧪 Testing Google Sheets connection...');
    const data = await fetch(SHEETS.scenarios, 'A1:C2');
    console.log('✅ Success! First few cells:', data);
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Save data locally for debugging
 */
async function saveLocal(spreadsheetId, filename = 'sheet-data.json') {
  const data = await fetchAsObjects(spreadsheetId);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`💾 Saved ${data.length} rows to ${filename}`);
  return data;
}

/**
 * Fetch V2 sheet data with consistent error handling
 */
async function fetchV2Sheet(sheetName) {
  if (!V2_SHEETS[sheetName]) {
    throw new Error(`Unknown V2 sheet: ${sheetName}`);
  }
  return await fetchAsObjects(SPREADSHEET_IDS.V2_MAIN, V2_SHEETS[sheetName]);
}

/**
 * Get row count for a V2 sheet
 */
async function getV2SheetRowCount(sheetName) {
  try {
    const range = sheetName === 'STUDENTS' ? 'Students!A:A' : `${sheetName}!A:A`;
    const data = await fetch(SPREADSHEET_IDS.V2_MAIN, range);
    return Math.max(0, data.length - 1); // Subtract header row
  } catch (error) {
    return 0;
  }
}

/**
 * Check if V2 sheet exists and get basic info
 */
async function checkV2Sheet(sheetName) {
  try {
    const range = sheetName === 'STUDENTS' ? 'Students!A:Z' : `${sheetName}!A:Z`;
    const data = await fetch(SPREADSHEET_IDS.V2_MAIN, range);
    return {
      exists: true,
      rows: data.length,
      cols: data[0]?.length || 0,
      hasData: data.length > 1
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

// Export everything
module.exports = {
  // Core functions
  fetch,
  fetchAsObjects,
  test,
  saveLocal,
  
  // V2 helpers
  fetchV2Sheet,
  getV2SheetRowCount,
  checkV2Sheet,
  
  // Constants
  SHEETS, // Legacy compatibility
  SPREADSHEET_IDS,
  V2_SHEETS,
  REQUIRED_SHEETS,
  
  // Convenience shortcuts
  scenarios: () => fetchAsObjects(SHEETS.scenarios),
  roster: () => fetchAsObjects(SHEETS.roster),
  
  // Test helper to reset cached auth
  __resetAuth: () => { cachedAuth = null; }
};

// If run directly, test connection
if (require.main === module) {
  test();
}