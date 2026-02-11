/**
 * Tool8.js - Investment Planning Tool
 *
 * Retirement investment calculator with scenario planning, comparison,
 * upstream data pre-population, and trauma-informed investment guidance.
 *
 * Architecture: Single-page calculator (like Tool4/Tool6)
 * Entry point: Tool8.render(params)
 *
 * Phase 3: Core calculator with 3 modes, sliders, feasibility analysis.
 *          No upstream data pre-population, no trauma, no scenarios yet.
 */

const Tool8 = {
  manifest: null, // Injected by ToolRegistry

  /**
   * Main entry point - renders the Tool 8 calculator page
   * @param {Object} params - Route parameters from Router
   * @param {string} params.clientId - Student client ID
   * @returns {HtmlOutput} Full HTML page
   */
  render(params) {
    try {
      const clientId = params.clientId || params.client;

      if (!clientId) {
        return HtmlService.createHtmlOutput(this.renderError('No client ID provided.'))
          .setTitle('Tool 8 - Error')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      }

      const htmlContent = this.buildPage(clientId);
      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('Investment Planning Tool')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      console.error('Tool8.render error:', error);
      return HtmlService.createHtmlOutput(this.renderError(error.toString()))
        .setTitle('Tool 8 - Error')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  },

  /**
   * Build the Tool 8 page HTML - Full calculator
   * @param {string} clientId
   * @returns {string} HTML
   */
  buildPage(clientId) {
    // Inject settings as JSON for client-side use
    var settingsJson = JSON.stringify(TOOL8_SETTINGS);

    return '<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>Investment Planning Tool</title>\n' +
'  <style>\n' +
    this._buildCSS() +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
    this._buildHTML(clientId) +
'  <script>\n' +
'    var SETTINGS = ' + settingsJson + ';\n' +
'    var CLIENT_ID = "' + clientId + '";\n' +
    this._buildJS(clientId) +
'  </script>\n' +
'</body>\n' +
'</html>';
  },

  /**
   * Build CSS for the calculator page
   * Ported from legacy index.html with FTP-v3 design tokens
   */
  _buildCSS() {
    return [
      ':root {',
      '  --bg: #1e192b;',
      '  --bg-gradient: linear-gradient(135deg, #4b4166, #1e192b);',
      '  --card: rgba(20, 15, 35, 0.9);',
      '  --muted: #94a3b8;',
      '  --text: #ffffff;',
      '  --accent: #ad9168;',
      '  --ok: #9ae6b4;',
      '  --warn: #f59e0b;',
      '  --bad: #ef4444;',
      '  --border: rgba(173, 145, 104, 0.2);',
      '  --gold: #ad9168;',
      '}',
      '* { box-sizing: border-box; }',
      'body {',
      '  margin: 0; padding: 24px;',
      '  background: var(--bg-gradient);',
      '  background-attachment: fixed;',
      '  min-height: 100vh;',
      '  color: var(--text);',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  font-size: 15px;',
      '  position: relative;',
      '}',
      'h1, h2, h3, h4, h5, h6 {',
      '  font-weight: 400;',
      '  color: var(--text);',
      '}',
      'h1 { margin: 0 0 16px 0; font-size: 29px; letter-spacing: 0.5px; }',
      '.wrap { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; max-width: 1200px; margin: 0 auto; }',
      '.card {',
      '  background: var(--card);',
      '  backdrop-filter: blur(10px);',
      '  border: 1px solid var(--border);',
      '  border-radius: 20px;',
      '  padding: 20px;',
      '  box-shadow: 0 8px 30px rgba(0,0,0,0.4);',
      '}',
      '.row { display: grid; grid-template-columns: 1fr 120px; gap: 10px; align-items: center; margin-bottom: 10px; }',
      '.row .label {',
      '  font-size: 14px;',
      '  color: var(--text);',
      '  font-weight: 500;',
      '}',
      // Range input styling - CRITICAL for slider drag functionality
      '.row input[type="range"] {',
      '  width: 100%;',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  height: 6px;',
      '  background: rgba(173, 145, 104, 0.2);',
      '  border-radius: 5px;',
      '  outline: none;',
      '}',
      // Track styling required for drag to work with appearance: none
      '.row input[type="range"]::-webkit-slider-runnable-track {',
      '  height: 6px;',
      '  background: rgba(173, 145, 104, 0.2);',
      '  border-radius: 5px;',
      '}',
      '.row input[type="range"]::-moz-range-track {',
      '  height: 6px;',
      '  background: rgba(173, 145, 104, 0.2);',
      '  border-radius: 5px;',
      '}',
      '.row input[type="range"]::-webkit-slider-thumb {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  width: 18px;',
      '  height: 18px;',
      '  background: var(--gold);',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  margin-top: -6px;',
      '}',
      '.row input[type="range"]::-moz-range-thumb {',
      '  width: 18px;',
      '  height: 18px;',
      '  background: var(--gold);',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  border: none;',
      '}',
      '.row input[type="number"] {',
      '  width: 120px;',
      '  padding: 10px;',
      '  border-radius: 50px;',
      '  border: 1px solid var(--border);',
      '  background: rgba(20, 15, 35, 0.6);',
      '  color: var(--text);',
      '  font-size: 14px;',
      '}',
      '.input-with-symbol { position: relative; display: inline-block; }',
      '.input-with-symbol input[type="number"] { padding-left: 25px; }',
      '.input-with-symbol.percent input[type="number"] { padding-left: 10px; padding-right: 25px; text-align: right; }',
      '.input-symbol { position: absolute; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 14px; pointer-events: none; }',
      '.input-symbol.prefix { left: 12px; }',
      '.input-symbol.suffix { right: 12px; }',
      '.muted { color: var(--muted); font-size: 13px; }',
      '.hr { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 16px 0; }',
      '.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
      '.badge {',
      '  display: inline-block;',
      '  padding: 8px 16px;',
      '  font-size: 19px;',
      '  color: var(--gold);',
      '  font-weight: 400;',
      '  letter-spacing: 0.5px;',
      '}',
      '.section-box {',
      '  padding: 20px;',
      '  border-radius: 20px;',
      '  border: 1px solid var(--border);',
      '  margin-bottom: 20px;',
      '  backdrop-filter: blur(5px);',
      '  background: linear-gradient(315deg, rgba(173, 145, 104, 0.2) 0%, rgba(30, 25, 43, 0.4) 100%);',
      '}',
      '.pill {',
      '  padding: 8px 14px;',
      '  border-radius: 50px;',
      '  background: rgba(20, 15, 35, 0.6);',
      '  border: 1px solid var(--border);',
      '  font-size: 13px;',
      '  color: #94a3b8;',
      '}',
      '.out .num {',
      '  font-weight: 600;',
      '  letter-spacing: 0.3px;',
      '  color: var(--gold);',
      '}',
      '.btn {',
      '  appearance: none;',
      '  border: 2px solid var(--gold);',
      '  background: transparent;',
      '  color: var(--gold);',
      '  padding: 10px 20px;',
      '  border-radius: 50px;',
      '  cursor: pointer;',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  text-transform: uppercase;',
      '  transition: all 0.3s;',
      '  letter-spacing: 0.5px;',
      '}',
      '.btn:hover {',
      '  background: var(--gold);',
      '  color: #140f23;',
      '  box-shadow: 0 4px 15px rgba(173, 145, 104, 0.3);',
      '  transform: translateY(-2px);',
      '}',
      '.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }',
      '.small { font-size: 12px; color: var(--muted); }',
      // Advanced settings control styling
      '.ctrl { margin-bottom: 16px; }',
      '.ctrl label { display: block; font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 2px; }',
      // Advanced settings range inputs
      '.ctrl input[type="range"] {',
      '  flex: 1;',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  height: 6px;',
      '  background: rgba(173, 145, 104, 0.2);',
      '  border-radius: 5px;',
      '  outline: none;',
      '}',
      '.ctrl input[type="range"]::-webkit-slider-runnable-track {',
      '  height: 6px;',
      '  background: rgba(173, 145, 104, 0.2);',
      '  border-radius: 5px;',
      '}',
      '.ctrl input[type="range"]::-moz-range-track {',
      '  height: 6px;',
      '  background: rgba(173, 145, 104, 0.2);',
      '  border-radius: 5px;',
      '}',
      '.ctrl input[type="range"]::-webkit-slider-thumb {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  width: 18px;',
      '  height: 18px;',
      '  background: var(--gold);',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  margin-top: -6px;',
      '}',
      '.ctrl input[type="range"]::-moz-range-thumb {',
      '  width: 18px;',
      '  height: 18px;',
      '  background: var(--gold);',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  border: none;',
      '}',
      // Back button
      '.back-bar {',
      '  text-align: center;',
      '  margin-top: 24px;',
      '  padding: 16px;',
      '}',
      '.back-bar .btn {',
      '  padding: 12px 32px;',
      '}',
      // Responsive
      '@media (max-width: 768px) {',
      '  .wrap { grid-template-columns: 1fr; }',
      '  body { padding: 12px; }',
      '  .section-box { padding: 14px; }',
      '}'
    ].join('\n');
  },

  /**
   * Build HTML structure for the calculator
   * Ported from legacy index.html (skip gate/auth, skip scenarios/comparison for Phase 4)
   */
  _buildHTML(clientId) {
    return [
      // Header bar
      '<div class="wrap">',
      '  <div style="grid-column: 1 / -1; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; background: rgba(20, 15, 35, 0.6); border-radius: 15px; backdrop-filter: blur(10px);">',
      '    <div style="font-size: 14px; color: #94a3b8;">Investment Planning Tool</div>',
      '    <button class="btn" style="padding: 6px 16px; font-size: 11px;" onclick="goToDashboard()">Back to Dashboard</button>',
      '  </div>',

      // LEFT: Controls
      '  <div class="card">',

      // Section 1: Mode Selection
      '    <div class="section-box">',
      '      <div style="display:flex; justify-content:space-between; align-items:center;">',
      '        <div>',
      '          <div class="badge">What would you like to calculate?</div>',
      '          <div class="hr"></div>',
      '        </div>',
      '      </div>',
      '      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:nowrap;">',
      '        <label style="padding: 8px; border: 1px solid #1f2937; border-radius: 6px; cursor: pointer; flex: 1; text-align: center;">',
      '          <input type="radio" name="mode" value="contrib" checked>',
      '          <span style="font-weight: 500;">Monthly Savings</span>',
      '        </label>',
      '        <label style="padding: 8px; border: 1px solid #1f2937; border-radius: 6px; cursor: pointer; flex: 1; text-align: center;">',
      '          <input type="radio" name="mode" value="return">',
      '          <span style="font-weight: 500;">Returns Required</span>',
      '        </label>',
      '        <label style="padding: 8px; border: 1px solid #1f2937; border-radius: 6px; cursor: pointer; flex: 1; text-align: center;">',
      '          <input type="radio" name="mode" value="time">',
      '          <span style="font-weight: 500;">Years Required</span>',
      '        </label>',
      '      </div>',
      '    </div>',

      // Section 2: Top-level Inputs
      '    <div class="section-box">',
      '      <div class="badge">Top-level Inputs</div>',
      '      <div class="hr"></div>',
      '      <div class="row">',
      '        <div class="label">Monthly Savings Capacity</div>',
      '        <div class="input-with-symbol">',
      '          <span class="input-symbol prefix">$</span>',
      '          <input id="capN" type="number" step="50" value="1500">',
      '        </div>',
      '      </div>',
      '      <div class="small muted" style="margin-left:12px; margin-bottom:16px;">How much can you invest each month?</div>',
      '      <div class="row">',
      '        <div class="label">Current Investment Balance</div>',
      '        <div class="input-with-symbol">',
      '          <span class="input-symbol prefix">$</span>',
      '          <input id="a0N" type="number" step="1000" value="0">',
      '        </div>',
      '      </div>',
      '      <div class="small muted" style="margin-left:12px; margin-bottom:16px;">What you have already saved for retirement</div>',
      '    </div>',

      // Section 3: Four Dials
      '    <div class="section-box">',
      '      <div class="badge">Four Dials</div>',
      '      <div class="hr"></div>',
      // Dial 1: Monthly Retirement Income Goal
      '      <div class="row">',
      '        <div>',
      '          <div class="label">Monthly Retirement Income Goal</div>',
      '          <input id="income" type="range" min="500" max="40000" step="100" value="10000">',
      '        </div>',
      '        <div class="input-with-symbol">',
      '          <span class="input-symbol prefix">$</span>',
      '          <input id="incomeN" type="number" step="100" value="10000">',
      '        </div>',
      '      </div>',
      '      <div class="small muted" style="margin-left:12px; margin-top:-8px; margin-bottom:20px;">In current dollars - we will adjust for inflation automatically</div>',
      // Dial 2: Years Until Retirement
      '      <div class="row">',
      '        <div>',
      '          <div class="label">Years Until Retirement</div>',
      '          <input id="years" type="range" min="0" max="60" step="0.1" value="20">',
      '        </div>',
      '        <input id="yearsN" type="number" step="0.1" value="20">',
      '      </div>',
      '      <div class="small muted" style="margin-left:12px; margin-top:-8px; margin-bottom:20px;">How many years until you start withdrawing from investments?</div>',
      // Dial 3: Risk Tolerance
      '      <div class="row">',
      '        <div>',
      '          <div class="label">Investment Risk Tolerance (0-10)</div>',
      '          <input id="risk" type="range" min="0" max="10" step="0.1" value="6">',
      '        </div>',
      '        <input id="riskN" type="number" step="0.1" value="6">',
      '      </div>',
      '      <div class="small muted" style="margin-left:12px; margin-top:-8px; margin-bottom:12px;">Higher risk = higher potential returns</div>',
      '      <div class="small" style="margin-bottom:20px;">Effective Accumulation Return Rate (conservative): <span id="rAccEffLabel"></span></div>',
      '      <div class="hr"></div>',
      // Dial 4: Custom Return Override
      '      <div style="margin-top:16px; margin-bottom:8px;">',
      '        <div class="badge">Advanced Option</div>',
      '      </div>',
      '      <div class="row" style="margin-top:8px;">',
      '        <div>',
      '          <div class="label">Return Rate Override % (shows Required Return Rate when disabled)</div>',
      '          <input id="rAccOverride" type="range" min="0" max="30" step="0.1" value="7" disabled>',
      '        </div>',
      '        <div class="input-with-symbol percent">',
      '          <input id="rAccOverrideN" type="number" step="0.1" value="7" disabled>',
      '          <span class="input-symbol suffix">%</span>',
      '        </div>',
      '      </div>',
      '      <div class="small">',
      '        <label><input type="checkbox" id="overrideToggle"> Enable custom return override</label>',
      '      </div>',
      '      <div class="small muted" style="margin-top:8px; padding:10px; background:rgba(245,158,11,0.1); border-radius:6px; line-height:1.5;">',
      '        <strong>What this does:</strong> Overrides the automatic risk-to-return calculation with your own return estimate.',
      '        Use this if you have specific investment returns in mind that differ from our risk-based projections.',
      '        <span style="color:var(--warn);">Note: This disables the Risk dial above.</span>',
      '      </div>',
      '    </div>',
      '  </div>',

      // RIGHT: Outputs
      '  <div class="card">',

      // Section 4: Investment Analysis
      '    <div class="section-box">',
      '      <div class="badge">Your Investment Analysis</div>',
      '      <div class="hr"></div>',
      '      <div class="grid2 out">',
      '        <div>Monthly income at retirement <div class="muted small">(adjusted for inflation)</div></div>',
      '        <div class="num" id="outM0">$--</div>',
      '        <div>Required nest egg at start <div class="muted small">(growing annuity)</div></div>',
      '        <div class="num" id="outAreq">$--</div>',
      '        <div id="outRowC" style="display:contents;">',
      '          <div>Monthly Savings Required</div>',
      '          <div class="num" id="outCreq">$--</div>',
      '        </div>',
      '        <div id="outRowR" style="display:none;">',
      '          <div>Target Investment Return Needed</div>',
      '          <div class="num" id="outRreq">--%</div>',
      '        </div>',
      '        <div id="outRowT" style="display:none;">',
      '          <div>Years Needed to Reach Goal</div>',
      '          <div class="num" id="outTreq">-- yrs</div>',
      '        </div>',
      '      </div>',
      '      <div class="hr"></div>',
      '      <div id="feasBox" class="small" style="margin-top: 12px; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.03);"></div>',
      '      <div style="margin-top:10px;" class="small">',
      '        Risk profile: <span id="riskBadge" class="pill">--</span>',
      '        <span id="riskExplain" class="muted" style="margin-left:8px;"></span>',
      '      </div>',
      '    </div>',

      // Scenario management placeholder (Phase 4)
      '    <div class="section-box">',
      '      <div class="badge">Scenario Management</div>',
      '      <div class="hr"></div>',
      '      <div style="margin-top:12px;">',
      '        <div class="small" style="margin-bottom:6px; font-weight:500; color:#94a3b8;">Load Saved Scenario:</div>',
      '        <select id="scenarioList" class="pill" style="width:100%; margin-bottom:16px;">',
      '          <option value="">-- Select a saved scenario --</option>',
      '        </select>',
      '      </div>',
      '      <div style="margin-bottom:8px;">',
      '        <div class="small" style="margin-bottom:6px; font-weight:500; color:#94a3b8;">Current Scenario Name:</div>',
      '        <input id="scnName" placeholder="Name this scenario" class="pill" style="width:100%;">',
      '      </div>',
      '      <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">',
      '        <button class="btn" id="saveBtn" title="Save current settings">Save</button>',
      '        <button class="btn" id="loadBtn" title="Load selected scenario" disabled>Load</button>',
      '        <button class="btn" id="reportBtn" title="Generate PDF report">Generate PDF</button>',
      '      </div>',
      '      <div id="scenarioMsg" class="small" style="margin-top:8px; min-height:20px; color: var(--accent);"></div>',
      '    </div>',

      // Comparison placeholder (Phase 4)
      '    <div class="section-box">',
      '      <div class="badge">Compare Two Scenarios</div>',
      '      <div class="hr"></div>',
      '      <div class="small muted" style="margin-bottom:8px;">Select 2 saved scenarios to compare side-by-side:</div>',
      '      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">',
      '        <select id="compareScenario1" class="pill">',
      '          <option value="">-- Scenario 1 --</option>',
      '        </select>',
      '        <select id="compareScenario2" class="pill">',
      '          <option value="">-- Scenario 2 --</option>',
      '        </select>',
      '      </div>',
      '      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">',
      '        <button class="btn" id="viewCompareBtn" title="View comparison" disabled>View Comparison</button>',
      '        <button class="btn" id="compareBtn" title="Generate PDF report" disabled>Generate PDF</button>',
      '      </div>',
      '      <div id="compareMsg" class="small" style="margin-top:8px; color: var(--accent);"></div>',
      '      <div id="comparisonView" style="display:none; margin-top:16px; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid var(--border);">',
      '        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">',
      '          <h3 style="margin:0; font-size:16px; color:var(--accent);">Quick Comparison</h3>',
      '          <button class="btn" id="hideCompareBtn" style="padding:4px 8px; font-size:12px;">Hide</button>',
      '        </div>',
      '        <div id="comparisonContent"></div>',
      '      </div>',
      '    </div>',

      // Advanced Settings (collapsible)
      '    <div class="section-box" style="grid-column: 1;">',
      '      <details id="advancedDetails">',
      '        <summary class="badge" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 100%;">',
      '          <span style="display: flex; align-items: center; gap: 8px;">Advanced Settings</span>',
      '          <span style="color: white; font-size: 13px; font-weight: 500;">Click to open</span>',
      '        </summary>',
      '        <div class="hr"></div>',
      '        <div style="padding: 8px 0;">',
      '          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">',
      '            <p class="small" style="margin: 0;">Adjust these parameters to fine-tune your retirement calculations.</p>',
      '            <button id="resetDefaultsBtn" class="btn" style="padding: 4px 8px; font-size: 11px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);" title="Reset all settings to default values">Reset</button>',
      '          </div>',
      // Inflation
      '          <div class="ctrl">',
      '            <label for="inflAdv">Inflation Rate</label>',
      '            <div class="small muted" style="margin-bottom: 6px;">Annual cost of living increase that reduces purchasing power</div>',
      '            <div style="display:flex; gap:8px; align-items:center;">',
      '              <input type="range" id="inflAdv" min="0" max="10" step="0.1" value="2.5">',
      '              <input type="number" id="inflAdvN" min="0" max="10" step="0.1" value="2.5" class="pill" style="width:80px;">',
      '              <span class="small">%</span>',
      '            </div>',
      '          </div>',
      // Retirement Duration
      '          <div class="ctrl">',
      '            <label for="drawAdv">Retirement Duration</label>',
      '            <div class="small muted" style="margin-bottom: 6px;">Expected length of retirement period</div>',
      '            <div style="display:flex; gap:8px; align-items:center;">',
      '              <input type="range" id="drawAdv" min="10" max="50" step="1" value="30">',
      '              <input type="number" id="drawAdvN" min="10" max="50" step="1" value="30" class="pill" style="width:80px;">',
      '              <span class="small">years</span>',
      '            </div>',
      '          </div>',
      // Maintenance Rate
      '          <div class="ctrl">',
      '            <label for="rRetAdv">Maintenance Rate (Retirement Phase Return)</label>',
      '            <div class="small muted" style="margin-bottom: 6px;">Conservative annual return during retirement</div>',
      '            <div style="display:flex; gap:8px; align-items:center;">',
      '              <input type="range" id="rRetAdv" min="0" max="20" step="0.1" value="10">',
      '              <input type="number" id="rRetAdvN" min="0" max="20" step="0.1" value="10" class="pill" style="width:80px;">',
      '              <span class="small">%</span>',
      '            </div>',
      '          </div>',
      // Deployment Drag
      '          <div class="ctrl">',
      '            <label for="dragAdv">Deployment Drag (Conservative Pacing)</label>',
      '            <div class="small muted" style="margin-bottom: 6px;">Reduction in effective returns due to gradual deployment</div>',
      '            <div style="display:flex; gap:8px; align-items:center;">',
      '              <input type="range" id="dragAdv" min="0" max="50" step="1" value="20">',
      '              <input type="number" id="dragAdvN" min="0" max="50" step="1" value="20" class="pill" style="width:80px;">',
      '              <span class="small">%</span>',
      '            </div>',
      '          </div>',
      '          <div class="small" style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">',
      '            <strong>Note:</strong> These settings affect all calculations. Defaults are based on conservative assumptions suitable for most retirement planning.',
      '          </div>',
      '        </div>',
      '      </details>',
      '    </div>',
      '  </div>',

      // Back to Dashboard
      '  <div class="back-bar" style="grid-column: 1 / -1;">',
      '    <button class="btn" onclick="goToDashboard()">Back to Dashboard</button>',
      '  </div>',
      '</div>'
    ].join('\n');
  },

  /**
   * Build all client-side JavaScript for the calculator
   * Ported from legacy index.html - core math, UI sync, recalc, feasibility
   */
  _buildJS(clientId) {
    return [
      '// ===== Utils =====',
      'var fmtUSD = function(n) { return isFinite(n) ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "--"; };',
      'var fmtPct = function(x) { return isFinite(x) ? (100 * x).toFixed(2) + "%" : "--"; };',
      'var fmtPctWhole = function(x) { return isFinite(x) ? Math.round(100 * x) + "%" : "--"; };',
      'var clamp = function(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); };',
      'var nearlyEqual = function(a, b, eps) { if (!eps) eps = 1e-4; return Math.abs(a - b) < eps; };',
      'var sigmoid = function(x) { return 1 / (1 + Math.exp(-x)); };',
      'var logit = function(p) { return Math.log(p / (1 - p)); };',
      '',
      '// ===== Core Math =====',
      'function returnFromRisk(R, map) {',
      '  if (!map) map = SETTINGS.riskMap;',
      '  var r = clamp(R, 0, 10);',
      '  var x = sigmoid(map.k * (r - map.m));',
      '  return map.rMin + (map.rMax - map.rMin) * x;',
      '}',
      'function riskFromReturn(r, map) {',
      '  if (!map) map = SETTINGS.riskMap;',
      '  var p = (r - map.rMin) / (map.rMax - map.rMin);',
      '  if (p <= 0) return 0;',
      '  if (p >= 1) return 10;',
      '  return clamp(map.m + (1 / map.k) * logit(p), 0, 10);',
      '}',
      'function effectiveAccReturn(rAcc, drag, cash) {',
      '  if (drag === undefined) drag = SETTINGS.deploymentDrag;',
      '  if (cash === undefined) cash = SETTINGS.cashOnDrag;',
      '  return rAcc * (1 - drag) + cash * drag;',
      '}',
      'function requiredNestEgg(M_real, T, infl, rRet, D) {',
      '  var M0 = M_real * Math.pow(1 + infl, T);',
      '  if (!(rRet > infl)) return NaN;',
      '  var j = rRet / 12, g = infl / 12;',
      '  var num = 1 - Math.pow((1 + g) / (1 + j), 12 * D);',
      '  return 12 * M0 * (num / (rRet - infl));',
      '}',
      'function fvA0(A0, rEff, T) { return A0 * Math.pow(1 + rEff, T); }',
      'function fvContrib(C, rEff, T) {',
      '  var i = rEff / 12;',
      '  if (Math.abs(i) < 1e-12) return C * 12 * T;',
      '  return C * ((Math.pow(1 + i, 12 * T) - 1) / i);',
      '}',
      'function requiredContribution(Areq, A0, rEff, T) {',
      '  var target = Areq - fvA0(A0, rEff, T);',
      '  if (target <= 0) return 0;',
      '  if (T === 0) return target > 0 ? Infinity : 0;',
      '  var i = rEff / 12;',
      '  if (Math.abs(i) < 1e-12) return target / (12 * T);',
      '  var factor = (Math.pow(1 + i, 12 * T) - 1) / i;',
      '  return target / factor;',
      '}',
      'function solveBisection(f, lo, hi, tol, maxIt) {',
      '  if (!tol) tol = 1e-8;',
      '  if (!maxIt) maxIt = 100;',
      '  var flo = f(lo), fhi = f(hi);',
      '  if (!isFinite(flo) || !isFinite(fhi)) return NaN;',
      '  if (flo * fhi > 0) return NaN;',
      '  for (var k = 0; k < maxIt; k++) {',
      '    var mid = 0.5 * (lo + hi);',
      '    var fm = f(mid);',
      '    if (!isFinite(fm)) return NaN;',
      '    if (Math.abs(fm) < tol) return mid;',
      '    if (flo * fm <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }',
      '  }',
      '  return 0.5 * (lo + hi);',
      '}',
      '',
      'function solveReturnAtCapacity(Areq, A0, T, Ccap) {',
      '  var f = function(r) {',
      '    var rEff = effectiveAccReturn(r);',
      '    return fvA0(A0, rEff, T) + fvContrib(Ccap, rEff, T) - Areq;',
      '  };',
      '  var lo = SETTINGS.rSolveRange[0], hi = SETTINGS.rSolveRange[1];',
      '  var flo = f(lo), fhi = f(hi);',
      '  if (!(flo <= 0 && fhi >= 0)) return { ok: false, value: NaN, flag: "" };',
      '  var r = solveBisection(f, lo, hi);',
      '  var flag = "";',
      '  if (isFinite(r) && r > SETTINGS.riskMap.rMax) {',
      '    flag = "<span style=\\"color:var(--warn)\\">(beyond dial ceiling " + fmtPct(SETTINGS.riskMap.rMax) + "; Risk pinned at 10)</span>";',
      '  }',
      '  return { ok: isFinite(r), value: r, flag: flag };',
      '}',
      'function solveTimeAtCapacity(Areq, A0, rEff, Ccap) {',
      '  var f = function(T) { return fvA0(A0, rEff, T) + fvContrib(Ccap, rEff, T) - Areq; };',
      '  var lo = SETTINGS.tSolveRange[0], hi = SETTINGS.tSolveRange[1];',
      '  var flo = f(lo), fhi = f(hi);',
      '  if (!(flo <= 0 && fhi >= 0)) return { ok: false, value: NaN };',
      '  var Tsol = solveBisection(f, lo, hi);',
      '  return { ok: isFinite(Tsol), value: Tsol };',
      '}',
      '',
      '// ===== DOM refs =====',
      'var el = function(id) { return document.getElementById(id); };',
      'var income = el("income"), incomeN = el("incomeN");',
      'var years = el("years"), yearsN = el("yearsN");',
      'var risk = el("risk"), riskN = el("riskN");',
      'var rAccOverride = el("rAccOverride"), rAccOverrideN = el("rAccOverrideN");',
      'var overrideToggle = el("overrideToggle");',
      'var capN = el("capN"), a0N = el("a0N");',
      'var scnName = el("scnName"), saveBtn = el("saveBtn");',
      'var scenarioList = el("scenarioList"), loadBtn = el("loadBtn");',
      'var scenarioMsg = el("scenarioMsg");',
      'var inflAdv = el("inflAdv"), inflAdvN = el("inflAdvN");',
      'var drawAdv = el("drawAdv"), drawAdvN = el("drawAdvN");',
      'var rRetAdv = el("rRetAdv"), rRetAdvN = el("rRetAdvN");',
      'var dragAdv = el("dragAdv"), dragAdvN = el("dragAdvN");',
      'var outM0 = el("outM0"), outAreq = el("outAreq");',
      'var outCreq = el("outCreq"), outRreq = el("outRreq"), outTreq = el("outTreq");',
      'var outRowC = el("outRowC"), outRowR = el("outRowR"), outRowT = el("outRowT");',
      'var riskBadge = el("riskBadge"), riskExplain = el("riskExplain");',
      'var rAccEffLabel = el("rAccEffLabel"), feasBox = el("feasBox");',
      '',
      '// Session state',
      'var lastScenario = null;',
      '',
      '// ===== Input sync =====',
      'function bindPair(range, number, onChange) {',
      '  var sync = function(v) { range.value = v; number.value = v; if (onChange) onChange(); };',
      '  range.addEventListener("input", function() { sync(range.value); });',
      '  number.addEventListener("input", function() { sync(number.value); });',
      '  return sync;',
      '}',
      'var syncIncome = bindPair(income, incomeN, recalc);',
      'var syncYears = bindPair(years, yearsN, recalc);',
      'var syncRisk = bindPair(risk, riskN, recalc);',
      '',
      '// Custom return override with risk sync',
      'var syncRAccO = function(v) {',
      '  rAccOverride.value = v;',
      '  rAccOverrideN.value = v;',
      '  if (overrideToggle.checked) {',
      '    var returnRate = parseFloat(v) / 100;',
      '    var equivalentRisk = riskFromReturn(returnRate);',
      '    risk.value = equivalentRisk;',
      '    riskN.value = equivalentRisk.toFixed(1);',
      '    setRiskBadges(equivalentRisk);',
      '  }',
      '  recalc();',
      '};',
      'rAccOverride.addEventListener("input", function() { syncRAccO(rAccOverride.value); });',
      'rAccOverrideN.addEventListener("input", function() { syncRAccO(rAccOverrideN.value); });',
      '',
      'overrideToggle.addEventListener("change", function() {',
      '  var on = overrideToggle.checked;',
      '  rAccOverride.disabled = !on;',
      '  rAccOverrideN.disabled = !on;',
      '  if (on) {',
      '    var returnRate = parseFloat(rAccOverrideN.value) / 100;',
      '    var equivalentRisk = riskFromReturn(returnRate);',
      '    risk.value = equivalentRisk;',
      '    riskN.value = equivalentRisk.toFixed(1);',
      '    setRiskBadges(equivalentRisk);',
      '  }',
      '  recalc();',
      '});',
      '',
      '[capN, a0N].forEach(function(inp) { inp.addEventListener("input", recalc); });',
      'Array.from(document.querySelectorAll("input[name=\\"mode\\"]")).forEach(function(r) { r.addEventListener("change", recalc); });',
      'scnName.addEventListener("input", recalc);',
      '',
      '// Advanced Settings bindings',
      'var syncInflAdv = bindPair(inflAdv, inflAdvN, function() {',
      '  SETTINGS.inflation = parseFloat(inflAdvN.value) / 100;',
      '  recalc();',
      '});',
      'var syncDrawAdv = bindPair(drawAdv, drawAdvN, function() {',
      '  SETTINGS.drawYears = parseFloat(drawAdvN.value);',
      '  recalc();',
      '});',
      'var syncRRetAdv = bindPair(rRetAdv, rRetAdvN, function() {',
      '  SETTINGS.rRet = parseFloat(rRetAdvN.value) / 100;',
      '  recalc();',
      '});',
      'var syncDragAdv = bindPair(dragAdv, dragAdvN, function() {',
      '  SETTINGS.deploymentDrag = parseFloat(dragAdvN.value) / 100;',
      '  recalc();',
      '});',
      '',
      '// Advanced Settings toggle text',
      'var advancedDetails = el("advancedDetails");',
      'advancedDetails.addEventListener("toggle", function() {',
      '  var span = advancedDetails.querySelector("summary span:last-child");',
      '  span.textContent = advancedDetails.open ? "Click to close" : "Click to open";',
      '});',
      '',
      '// Reset defaults',
      'el("resetDefaultsBtn").addEventListener("click", function() {',
      '  inflAdv.value = 2.5; inflAdvN.value = 2.5; SETTINGS.inflation = 0.025;',
      '  drawAdv.value = 30; drawAdvN.value = 30; SETTINGS.drawYears = 30;',
      '  rRetAdv.value = 10; rRetAdvN.value = 10; SETTINGS.rRet = 0.10;',
      '  dragAdv.value = 20; dragAdvN.value = 20; SETTINGS.deploymentDrag = 0.20;',
      '  var btn = el("resetDefaultsBtn");',
      '  btn.textContent = "Done";',
      '  setTimeout(function() { btn.textContent = "Reset"; }, 1500);',
      '  recalc();',
      '});',
      '',
      '// ===== Risk badges =====',
      'function setRiskBadges(R) {',
      '  var bands = SETTINGS.riskBands;',
      '  var band = bands[bands.length - 1];',
      '  for (var i = 0; i < bands.length; i++) {',
      '    if (R >= bands[i].min && R < bands[i].max) { band = bands[i]; break; }',
      '  }',
      '  riskBadge.textContent = band.label + " (R=" + (+R).toFixed(1) + ")";',
      '  riskExplain.textContent = band.explain;',
      '}',
      '',
      'function currentMode() {',
      '  var r = document.querySelector("input[name=\\"mode\\"]:checked");',
      '  return r ? r.value : "contrib";',
      '}',
      '',
      '// ===== Master recalculation =====',
      'function recalc() {',
      '  var M_real = parseFloat(incomeN.value) || 0;',
      '  var T = Math.max(0, parseFloat(yearsN.value) || 0);',
      '  var R = parseFloat(riskN.value) || 0;',
      '  var infl = SETTINGS.inflation;',
      '  var D = SETTINGS.drawYears;',
      '  var rRet = SETTINGS.rRet;',
      '  var C_cap = Math.max(0, parseFloat(capN.value) || 0);',
      '  var A0 = Math.max(0, parseFloat(a0N.value) || 0);',
      '',
      '  var useOverride = overrideToggle.checked;',
      '  var rAccTarget = useOverride ? Math.max(0, (parseFloat(rAccOverrideN.value) || 0) / 100) : returnFromRisk(R);',
      '  var rAccEff = effectiveAccReturn(rAccTarget);',
      '',
      '  rAccEffLabel.textContent = fmtPctWhole(rAccEff);',
      '  setRiskBadges(useOverride ? riskFromReturn(rAccTarget) : R);',
      '',
      '  if (!(rRet > infl)) {',
      '    outM0.textContent = "$--";',
      '    outAreq.textContent = "--";',
      '    outCreq.textContent = "--";',
      '    outRreq.textContent = "--";',
      '    outTreq.textContent = "--";',
      '    feasBox.innerHTML = "<span style=\\"color:var(--bad)\\">Maintenance return must exceed inflation. Increase maintenance rate or lower inflation.</span>";',
      '    return;',
      '  }',
      '',
      '  var M0 = M_real * Math.pow(1 + infl, T);',
      '  var Areq = requiredNestEgg(M_real, T, infl, rRet, D);',
      '  outM0.textContent = fmtUSD(M0);',
      '  outAreq.textContent = fmtUSD(Areq);',
      '',
      '  // Update override dial to show required return when disabled',
      '  if (!useOverride && C_cap > 0 && isFinite(Areq)) {',
      '    var requiredReturnSolve = solveReturnAtCapacity(Areq, A0, T, C_cap);',
      '    if (isFinite(requiredReturnSolve.value)) {',
      '      var pctVal = Math.min(30, Math.max(0, requiredReturnSolve.value * 100)).toFixed(1);',
      '      rAccOverride.value = pctVal;',
      '      rAccOverrideN.value = pctVal;',
      '    }',
      '  }',
      '',
      '  var mode = currentMode();',
      '  outRowC.style.display = (mode === "contrib") ? "contents" : "none";',
      '  outRowR.style.display = (mode === "return") ? "block" : "none";',
      '  outRowT.style.display = (mode === "time") ? "block" : "none";',
      '',
      '  var msg = "<span class=\\"small\\">Conservative pacing applied.</span>";',
      '  var rSolvedVal = ""; var tSolvedVal = ""; var CreqVal = "";',
      '',
      '  // Special handling for T = 0',
      '  if (T === 0) {',
      '    var currentBalanceEnough = A0 >= Areq;',
      '    if (currentBalanceEnough) {',
      '      msg = "<span style=\\"color:var(--ok); font-weight:600\\">Ready to Retire!</span><br>"',
      '        + "Your current balance of <b>" + fmtUSD(A0) + "</b> meets the required <b>" + fmtUSD(Areq) + "</b>.<br>"',
      '        + "<span class=\\"small\\">Note: With 0 years there is no time for growth. To model returns set Years > 0.</span>";',
      '    } else {',
      '      var gap = Areq - A0;',
      '      msg = "<span style=\\"color:var(--warn); font-weight:600\\">Immediate Retirement Analysis</span><br>"',
      '        + "Current balance: <b>" + fmtUSD(A0) + "</b><br>"',
      '        + "Required for retirement: <b>" + fmtUSD(Areq) + "</b><br>"',
      '        + "Shortfall: <b style=\\"color:var(--bad)\\">" + fmtUSD(gap) + "</b><br>"',
      '        + "<span class=\\"small\\" style=\\"color:var(--accent)\\">Tip: To see how returns affect your balance over time, set Years > 0.</span>";',
      '    }',
      '    feasBox.innerHTML = msg;',
      '    return;',
      '  }',
      '',
      '  if (mode === "contrib") {',
      '    var Creq = requiredContribution(Areq, A0, rAccEff, T);',
      '    CreqVal = Creq;',
      '    outCreq.textContent = isFinite(Creq) ? fmtUSD(Creq) : "N/A (no time)";',
      '',
      '    // Auto-apply: update capacity to match requirement',
      '    var effectiveCapacity = C_cap;',
      '    if (isFinite(Creq)) {',
      '      effectiveCapacity = Creq;',
      '      capN.value = Math.round(Creq);',
      '    }',
      '',
      '    if (effectiveCapacity > 0 || C_cap > 0) {',
      '      var tolerance = 1;',
      '      var gapC = effectiveCapacity - Creq;',
      '      if (Math.abs(gapC) <= tolerance) {',
      '        msg = "<span style=\\"color:var(--ok); font-weight:600\\">Perfect Match!</span><br>Your capacity exactly meets the requirement. <span class=\\"small\\">Consider adding a small buffer for flexibility.</span>";',
      '      } else if (gapC > 0) {',
      '        msg = "<span style=\\"color:var(--ok); font-weight:600\\">Feasible - You are on track!</span><br>Surplus vs required: <b>" + fmtUSD(gapC) + "</b>/mo. <span class=\\"small\\">Conservative pacing applied.</span>";',
      '      } else {',
      '        var shortfall = Math.abs(gapC);',
      '        var rSolve = solveReturnAtCapacity(Areq, A0, T, effectiveCapacity);',
      '        var tSolve = solveTimeAtCapacity(Areq, A0, rAccEff, effectiveCapacity);',
      '        tSolvedVal = tSolve.value;',
      '        msg = "<span style=\\"color:var(--bad); font-weight:600\\">Not Feasible - Adjustments needed</span><br>Shortfall: <b>" + fmtUSD(shortfall) + "</b>/mo."',
      '          + "<br>Target return needed at capacity: <b>" + fmtPct(rSolve.value) + "</b> " + (rSolve.flag || "")',
      '          + "<br>Time needed at capacity: <b>" + (tSolve.value).toFixed(1) + " yrs</b>";',
      '      }',
      '    }',
      '',
      '  } else if (mode === "return") {',
      '    var rS = solveReturnAtCapacity(Areq, A0, T, C_cap);',
      '    rSolvedVal = rS.value;',
      '    outRreq.textContent = isFinite(rS.value) ? fmtPctWhole(rS.value) : "--";',
      '',
      '    if (isFinite(rS.value)) {',
      '      if (useOverride) {',
      '        if (!nearlyEqual((parseFloat(rAccOverrideN.value) / 100), rS.value, 1e-4)) {',
      '          var pv = (rS.value * 100).toFixed(1);',
      '          rAccOverride.value = pv;',
      '          rAccOverrideN.value = pv;',
      '        }',
      '      } else {',
      '        var newR = riskFromReturn(rS.value);',
      '        if (!nearlyEqual(parseFloat(riskN.value), newR, 0.05)) {',
      '          risk.value = newR.toFixed(1);',
      '          riskN.value = newR.toFixed(1);',
      '        }',
      '      }',
      '    }',
      '',
      '    msg = rS.ok',
      '      ? "<span style=\\"color:var(--ok); font-weight:600\\">Feasible</span><br>Required <b>target</b> return: <b>" + fmtPct(rS.value) + "</b> " + (useOverride ? "(applied to override)" : "(Risk dial adjusted)") + ". <span class=\\"small\\">Conservative pacing applied.</span>"',
      '      : "<span style=\\"color:var(--bad)\\">Required return exceeds search bound (" + fmtPct(SETTINGS.rSolveRange[1]) + ").</span> Consider more time, higher capacity, or lower target.";',
      '',
      '  } else if (mode === "time") {',
      '    var tS = solveTimeAtCapacity(Areq, A0, rAccEff, C_cap);',
      '    tSolvedVal = tS.value;',
      '    outTreq.textContent = isFinite(tS.value) ? Math.round(tS.value) + " yrs" : "--";',
      '',
      '    if (isFinite(tS.value) && !nearlyEqual(parseFloat(yearsN.value), tS.value, 0.05)) {',
      '      years.value = tS.value.toFixed(1);',
      '      yearsN.value = tS.value.toFixed(1);',
      '    }',
      '',
      '    msg = tS.ok',
      '      ? "<span style=\\"color:var(--ok); font-weight:600\\">Feasible</span><br>Required years: <b>" + Math.round(tS.value) + "</b> (Time dial adjusted). <span class=\\"small\\">Conservative pacing applied.</span>"',
      '      : "<span style=\\"color:var(--bad)\\">Even at current effective return (" + fmtPct(rAccEff) + "), capacity is too low up to " + SETTINGS.tSolveRange[1] + " yrs.</span>";',
      '  }',
      '  feasBox.innerHTML = msg;',
      '',
      '  // Build scenario payload',
      '  lastScenario = {',
      '    firstName: "", lastName: "", email: "", clientId: CLIENT_ID,',
      '    name: scnName.value || "",',
      '    M_real: M_real, T: parseFloat(yearsN.value), risk: parseFloat(riskN.value),',
      '    C_cap: parseFloat(capN.value), A0: A0, infl: infl, D: D, rRet: rRet,',
      '    rAccTarget: rAccTarget, rAccEff: rAccEff,',
      '    M0: M0, Areq: Areq,',
      '    Creq: (mode === "contrib") ? CreqVal : "",',
      '    rSolved: (mode === "return") ? rSolvedVal : "",',
      '    tSolved: (mode === "time") ? tSolvedVal : "",',
      '    mode: mode',
      '  };',
      '}',
      '',
      '// ===== Scenario Management (Phase 4 - placeholders) =====',
      'function loadUserScenarios() {',
      '  if (!CLIENT_ID) return;',
      '  google.script.run',
      '    .withSuccessHandler(function(scenarios) {',
      '      scenarioList.innerHTML = "<option value=\\"\\">-- Select a saved scenario --</option>";',
      '      var cs1 = el("compareScenario1");',
      '      var cs2 = el("compareScenario2");',
      '      cs1.innerHTML = "<option value=\\"\\">-- Scenario 1 --</option>";',
      '      cs2.innerHTML = "<option value=\\"\\">-- Scenario 2 --</option>";',
      '      if (scenarios && scenarios.length > 0) {',
      '        scenarios.forEach(function(scn, idx) {',
      '          var opt = document.createElement("option");',
      '          opt.value = idx;',
      '          opt.textContent = scn.name || ("Scenario " + (idx + 1));',
      '          opt.dataset.scenario = JSON.stringify(scn);',
      '          scenarioList.appendChild(opt);',
      '          var o1 = opt.cloneNode(true); o1.dataset.scenario = JSON.stringify(scn);',
      '          var o2 = opt.cloneNode(true); o2.dataset.scenario = JSON.stringify(scn);',
      '          cs1.appendChild(o1);',
      '          cs2.appendChild(o2);',
      '        });',
      '        scenarioMsg.textContent = "Found " + scenarios.length + " saved scenario(s)";',
      '        setTimeout(function() { scenarioMsg.textContent = ""; }, 5000);',
      '      } else {',
      '        scenarioMsg.textContent = "No saved scenarios yet";',
      '        setTimeout(function() { scenarioMsg.textContent = ""; }, 3000);',
      '      }',
      '    })',
      '    .withFailureHandler(function(err) {',
      '      console.error("Failed to load scenarios:", err);',
      '      scenarioMsg.textContent = "Error loading scenarios";',
      '      setTimeout(function() { scenarioMsg.textContent = ""; }, 3000);',
      '    })',
      '    .tool8GetUserScenarios(CLIENT_ID);',
      '}',
      '',
      '// Scenario selection',
      'scenarioList.addEventListener("change", function() {',
      '  var selected = scenarioList.selectedOptions[0];',
      '  if (selected && selected.value) {',
      '    loadBtn.disabled = false;',
      '    var scn = JSON.parse(selected.dataset.scenario || "{}");',
      '    if (scn.name) scenarioMsg.textContent = "Selected: " + scn.name;',
      '  } else {',
      '    loadBtn.disabled = true;',
      '    scenarioMsg.textContent = "";',
      '  }',
      '});',
      '',
      '// Load scenario',
      'loadBtn.addEventListener("click", function() {',
      '  var selected = scenarioList.selectedOptions[0];',
      '  if (selected && selected.dataset.scenario) {',
      '    var scn = JSON.parse(selected.dataset.scenario);',
      '    if (scn.M_real) { syncIncome(scn.M_real); incomeN.value = scn.M_real; }',
      '    if (scn.T) { syncYears(scn.T); yearsN.value = scn.T; }',
      '    if (scn.risk !== undefined) { syncRisk(scn.risk); riskN.value = scn.risk; }',
      '    if (scn.C_cap !== undefined) capN.value = scn.C_cap;',
      '    if (scn.A0 !== undefined) a0N.value = scn.A0;',
      '    if (scn.infl !== undefined) {',
      '      inflAdvN.value = (scn.infl * 100).toFixed(1);',
      '      inflAdv.value = (scn.infl * 100).toFixed(1);',
      '      SETTINGS.inflation = scn.infl;',
      '    }',
      '    if (scn.D !== undefined) {',
      '      drawAdvN.value = scn.D;',
      '      drawAdv.value = scn.D;',
      '      SETTINGS.drawYears = scn.D;',
      '    }',
      '    if (scn.name) scnName.value = scn.name;',
      '    scenarioMsg.textContent = "Loaded: " + (scn.name || "Unnamed scenario");',
      '    setTimeout(function() { scenarioMsg.textContent = ""; }, 3000);',
      '    recalc();',
      '  }',
      '});',
      '',
      '// Save scenario',
      'var isSaving = false;',
      'saveBtn.addEventListener("click", function() {',
      '  if (isSaving) return;',
      '  recalc();',
      '  isSaving = true;',
      '  saveBtn.disabled = true;',
      '  saveBtn.textContent = "Saving...";',
      '  google.script.run',
      '    .withSuccessHandler(function(res) {',
      '      isSaving = false;',
      '      saveBtn.disabled = false;',
      '      if (res && res.success) {',
      '        saveBtn.textContent = "Saved";',
      '        setTimeout(function() { saveBtn.textContent = "Save"; loadUserScenarios(); }, 1500);',
      '        scenarioMsg.textContent = "Saved: " + (scnName.value || "Unnamed scenario");',
      '        setTimeout(function() { scenarioMsg.textContent = ""; }, 3000);',
      '      } else {',
      '        saveBtn.textContent = "Save";',
      '        scenarioMsg.textContent = "Save failed: " + (res && res.error ? res.error : "Unknown error");',
      '      }',
      '    })',
      '    .withFailureHandler(function(err) {',
      '      isSaving = false;',
      '      saveBtn.disabled = false;',
      '      saveBtn.textContent = "Save";',
      '      scenarioMsg.textContent = "Save failed: " + err;',
      '    })',
      '    .tool8SaveScenario(CLIENT_ID, lastScenario);',
      '});',
      '',
      '// Generate PDF',
      'var isGeneratingReport = false;',
      'el("reportBtn").addEventListener("click", function() {',
      '  if (isGeneratingReport) return;',
      '  recalc();',
      '  isGeneratingReport = true;',
      '  var btn = el("reportBtn");',
      '  btn.textContent = "Generating...";',
      '  btn.disabled = true;',
      '  google.script.run',
      '    .withSuccessHandler(function(res) {',
      '      btn.textContent = "Generate PDF";',
      '      btn.disabled = false;',
      '      isGeneratingReport = false;',
      '      if (res && res.success) {',
      '        var link = document.createElement("a");',
      '        link.href = "data:application/pdf;base64," + res.pdf;',
      '        link.download = res.fileName || "Investment_Report.pdf";',
      '        document.body.appendChild(link);',
      '        link.click();',
      '        document.body.removeChild(link);',
      '        scenarioMsg.textContent = "Report generated successfully!";',
      '        setTimeout(function() { scenarioMsg.textContent = ""; }, 5000);',
      '      } else {',
      '        scenarioMsg.textContent = "Report failed: " + (res && res.error ? res.error : "Unknown error");',
      '      }',
      '    })',
      '    .withFailureHandler(function(err) {',
      '      btn.textContent = "Generate PDF";',
      '      btn.disabled = false;',
      '      isGeneratingReport = false;',
      '      scenarioMsg.textContent = "Report failed: " + err;',
      '    })',
      '    .generateTool8PDF(CLIENT_ID, lastScenario);',
      '});',
      '',
      '// Comparison selection',
      'var cs1 = el("compareScenario1"), cs2 = el("compareScenario2");',
      'var compBtn = el("compareBtn"), viewCBtn = el("viewCompareBtn");',
      'var compMsg = el("compareMsg");',
      'function checkCompareReady() {',
      '  var has1 = cs1.value !== "";',
      '  var has2 = cs2.value !== "";',
      '  var diff = cs1.value !== cs2.value;',
      '  var ready = has1 && has2 && diff;',
      '  compBtn.disabled = !ready;',
      '  viewCBtn.disabled = !ready;',
      '  if (has1 && has2 && !diff) compMsg.textContent = "Please select two different scenarios";',
      '  else if (has1 && has2) compMsg.textContent = "Ready to compare";',
      '  else compMsg.textContent = "";',
      '}',
      'cs1.addEventListener("change", checkCompareReady);',
      'cs2.addEventListener("change", checkCompareReady);',
      '',
      '// View on-site comparison',
      'viewCBtn.addEventListener("click", function() {',
      '  var s1 = JSON.parse(cs1.selectedOptions[0].dataset.scenario || "{}");',
      '  var s2 = JSON.parse(cs2.selectedOptions[0].dataset.scenario || "{}");',
      '  // Ensure calculated fields',
      '  [s1, s2].forEach(function(s) {',
      '    if (s.Areq === undefined && s.M_real && s.T && s.D) {',
      '      s.Areq = requiredNestEgg(s.M_real, s.T, s.infl || 0.025, s.rRet || 0.03, s.D);',
      '    }',
      '    if (s.rAccEff === undefined) {',
      '      if (s.rAccTarget !== undefined) s.rAccEff = effectiveAccReturn(s.rAccTarget);',
      '      else if (s.risk !== undefined) s.rAccEff = effectiveAccReturn(returnFromRisk(s.risk));',
      '    }',
      '  });',
      '  var html = "";',
      '  var tol = 1;',
      '  var f1 = s1.mode === "contrib" ? (Number(s1.C_cap) >= Number(s1.Creq) - tol) : true;',
      '  var f2 = s2.mode === "contrib" ? (Number(s2.C_cap) >= Number(s2.Creq) - tol) : true;',
      '  html += "<div style=\\"margin-bottom:16px; padding:10px; background:rgba(255,255,255,0.02); border-radius:6px;\\">";',
      '  html += "<div style=\\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; text-align:center;\\">";',
      '  html += "<div><div class=\\"small muted\\">Scenario 1</div><div style=\\"font-weight:600; color:var(--text)\\">" + (s1.name || "Unnamed") + "</div><div style=\\"margin-top:4px; font-size:18px\\">" + (f1 ? "Feasible" : "Needs Adjustment") + "</div></div>";',
      '  html += "<div><div class=\\"small muted\\">Scenario 2</div><div style=\\"font-weight:600; color:var(--text)\\">" + (s2.name || "Unnamed") + "</div><div style=\\"margin-top:4px; font-size:18px\\">" + (f2 ? "Feasible" : "Needs Adjustment") + "</div></div>";',
      '  html += "</div></div>";',
      '  html += "<table style=\\"width:100%; border-collapse:collapse; font-size:13px;\\">";',
      '  html += "<thead><tr style=\\"border-bottom:1px solid var(--border)\\"><th style=\\"text-align:left; padding:8px; color:var(--muted)\\">Metric</th><th style=\\"text-align:right; padding:8px; color:var(--accent)\\">S1</th><th style=\\"text-align:right; padding:8px; color:var(--warn)\\">S2</th></tr></thead><tbody>";',
      '  function addCompRow(label, v1, v2, fmt) {',
      '    html += "<tr style=\\"border-bottom:1px solid rgba(255,255,255,0.05)\\"><td style=\\"padding:8px; color:var(--muted)\\">" + label + "</td><td style=\\"padding:8px; text-align:right; font-weight:500\\">" + fmt(v1) + "</td><td style=\\"padding:8px; text-align:right; font-weight:500\\">" + fmt(v2) + "</td></tr>";',
      '  }',
      '  addCompRow("Income Goal", s1.M_real, s2.M_real, fmtUSD);',
      '  addCompRow("Years", s1.T, s2.T, function(v) { return v + " yrs"; });',
      '  addCompRow("Risk", s1.risk, s2.risk, function(v) { return v + "/10"; });',
      '  addCompRow("Monthly Savings", s1.C_cap, s2.C_cap, fmtUSD);',
      '  addCompRow("Current Assets", s1.A0, s2.A0, fmtUSD);',
      '  addCompRow("Required Nest Egg", s1.Areq, s2.Areq, fmtUSD);',
      '  addCompRow("Effective Return", s1.rAccEff, s2.rAccEff, fmtPct);',
      '  html += "</tbody></table>";',
      '  el("comparisonContent").innerHTML = html;',
      '  el("comparisonView").style.display = "block";',
      '  el("comparisonView").scrollIntoView({ behavior: "smooth", block: "nearest" });',
      '});',
      '',
      '// Hide comparison',
      'el("hideCompareBtn").addEventListener("click", function() {',
      '  el("comparisonView").style.display = "none";',
      '});',
      '',
      '// Generate comparison PDF',
      'var isGenComp = false;',
      'compBtn.addEventListener("click", function() {',
      '  if (isGenComp) return;',
      '  var s1 = JSON.parse(cs1.selectedOptions[0].dataset.scenario || "{}");',
      '  var s2 = JSON.parse(cs2.selectedOptions[0].dataset.scenario || "{}");',
      '  isGenComp = true;',
      '  compBtn.textContent = "Generating...";',
      '  compBtn.disabled = true;',
      '  google.script.run',
      '    .withSuccessHandler(function(res) {',
      '      compBtn.textContent = "Generate PDF";',
      '      checkCompareReady();',
      '      isGenComp = false;',
      '      if (res && res.success) {',
      '        var link = document.createElement("a");',
      '        link.href = "data:application/pdf;base64," + res.pdf;',
      '        link.download = res.fileName || "Comparison_Report.pdf";',
      '        document.body.appendChild(link);',
      '        link.click();',
      '        document.body.removeChild(link);',
      '        compMsg.textContent = "Comparison report generated!";',
      '        setTimeout(function() { compMsg.textContent = ""; }, 5000);',
      '      } else {',
      '        compMsg.textContent = "Failed: " + (res && res.error ? res.error : "Unknown error");',
      '      }',
      '    })',
      '    .withFailureHandler(function(err) {',
      '      compBtn.textContent = "Generate PDF";',
      '      checkCompareReady();',
      '      isGenComp = false;',
      '      compMsg.textContent = "Failed: " + err;',
      '    })',
      '    .generateTool8ComparisonPDF(CLIENT_ID, s1, s2);',
      '});',
      '',
      '// ===== Navigation =====',
      'function goToDashboard() {',
      '  google.script.run',
      '    .withSuccessHandler(function(html) {',
      '      document.open();',
      '      document.write(html);',
      '      document.close();',
      '      window.scrollTo(0, 0);',
      '    })',
      '    .withFailureHandler(function(err) {',
      '      console.error("Navigation error:", err);',
      '    })',
      '    .getDashboardPage("' + clientId + '");',
      '}',
      '',
      '// ===== Initialize =====',
      'recalc();',
      'loadUserScenarios();'
    ].join('\n');
  },

  // ============================================================================
  // SCENARIO MANAGEMENT (Phase 4)
  // ============================================================================

  /**
   * Column header for the TOOL8_SCENARIOS sheet (22 columns A-V)
   */
  SCENARIO_HEADERS: [
    'Timestamp',              // A
    'Client_ID',              // B
    'Scenario_Name',          // C
    'Monthly_Income_Real',    // D
    'Years_To_Goal',          // E
    'Risk_Dial',              // F
    'Target_Return',          // G
    'Effective_Return',       // H
    'Contribution_Capacity',  // I
    'Current_Assets',         // J
    'Inflation',              // K
    'Draw_Years',             // L
    'Maintenance_Return',     // M
    'Nominal_Income_At_Start', // N
    'Required_Nest_Egg',      // O
    'Required_Contribution',  // P
    'Solved_Return',          // Q
    'Solved_Years',           // R
    'Mode',                   // S
    'Is_Latest',              // T
    'First_Name',             // U
    'Last_Name'               // V
  ],

  /**
   * Save a scenario to the TOOL8_SCENARIOS sheet
   * @param {string} clientId - Client ID
   * @param {Object} scenario - Scenario data from calculator
   * @returns {Object} {success, message, totalScenarios} or {success: false, error}
   */
  saveScenario(clientId, scenario) {
    try {
      Logger.log('[Tool8.saveScenario] Called for client ' + clientId);

      if (!scenario || typeof scenario !== 'object') {
        return { success: false, error: 'Invalid scenario data' };
      }
      if (!clientId) {
        return { success: false, error: 'Client ID is required' };
      }

      // Get or create TOOL8_SCENARIOS sheet
      var scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL8_SCENARIOS);

      if (!scenariosSheet) {
        Logger.log('[Tool8.saveScenario] Creating TOOL8_SCENARIOS sheet');
        var ss = SpreadsheetCache.getSpreadsheet();
        scenariosSheet = ss.insertSheet(CONFIG.SHEETS.TOOL8_SCENARIOS);
        scenariosSheet.appendRow(this.SCENARIO_HEADERS);
        scenariosSheet.getRange(1, 1, 1, this.SCENARIO_HEADERS.length).setFontWeight('bold');
        SpreadsheetApp.flush();
      }

      // Mark previous scenarios for this client as not latest
      var allData = scenariosSheet.getDataRange().getValues();
      var clientIdCol = 1;  // Column B (0-indexed)
      var isLatestCol = 19; // Column T (0-indexed)

      for (var i = 1; i < allData.length; i++) {
        if (String(allData[i][clientIdCol]) === String(clientId) && allData[i][isLatestCol] === true) {
          scenariosSheet.getRange(i + 1, isLatestCol + 1).setValue(false);
        }
      }

      // Build row data (22 columns A-V)
      var row = [
        new Date(),                         // A: Timestamp
        clientId,                           // B: Client_ID
        scenario.name || '',                // C: Scenario_Name
        scenario.M_real || 0,               // D: Monthly_Income_Real
        scenario.T || 0,                    // E: Years_To_Goal
        scenario.risk || 0,                 // F: Risk_Dial
        scenario.rAccTarget || '',          // G: Target_Return
        scenario.rAccEff || '',             // H: Effective_Return
        scenario.C_cap || 0,                // I: Contribution_Capacity
        scenario.A0 || 0,                   // J: Current_Assets
        scenario.infl || 0.025,             // K: Inflation
        scenario.D || 30,                   // L: Draw_Years
        scenario.rRet || 0.10,              // M: Maintenance_Return
        scenario.M0 || '',                  // N: Nominal_Income_At_Start
        scenario.Areq || '',                // O: Required_Nest_Egg
        scenario.Creq || '',                // P: Required_Contribution
        scenario.rSolved || '',             // Q: Solved_Return
        scenario.tSolved || '',             // R: Solved_Years
        scenario.mode || 'contrib',         // S: Mode
        true,                               // T: Is_Latest
        scenario.firstName || '',           // U: First_Name
        scenario.lastName || ''             // V: Last_Name
      ];

      scenariosSheet.appendRow(row);
      SpreadsheetApp.flush();

      // Count scenarios for this client and enforce 10-max limit
      var MAX_SCENARIOS = 10;
      var clientRows = [];
      var refreshedData = scenariosSheet.getDataRange().getValues();

      for (var j = 1; j < refreshedData.length; j++) {
        if (String(refreshedData[j][clientIdCol]) === String(clientId)) {
          clientRows.push({ rowIndex: j + 1, timestamp: refreshedData[j][0], name: refreshedData[j][2] });
        }
      }

      // If over limit, delete oldest (FIFO)
      var deletedScenario = null;
      if (clientRows.length > MAX_SCENARIOS) {
        clientRows.sort(function(a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
        var oldest = clientRows[0];
        Logger.log('[Tool8.saveScenario] Deleting oldest scenario "' + oldest.name + '" to enforce limit');
        scenariosSheet.deleteRow(oldest.rowIndex);
        SpreadsheetApp.flush();
        deletedScenario = oldest.name;
      }

      var isFirstScenario = clientRows.length === 1;

      // If first scenario, mark Tool 8 as completed in Responses tab
      if (isFirstScenario) {
        try {
          DataService.saveToolResponse(clientId, 'tool8', {
            scenarioName: scenario.name,
            mode: scenario.mode,
            M_real: scenario.M_real,
            T: scenario.T,
            risk: scenario.risk
          }, 'COMPLETED');
          Logger.log('[Tool8.saveScenario] Tool 8 marked as completed for client ' + clientId);
        } catch (responseError) {
          Logger.log('[Tool8.saveScenario] Warning: Could not update Responses tab: ' + responseError);
        }
      }

      Logger.log('[Tool8.saveScenario] Saved "' + (scenario.name || 'Unnamed') + '" for client ' + clientId + ' (' + clientRows.length + ' total)');

      return {
        success: true,
        message: 'Scenario saved successfully',
        totalScenarios: clientRows.length - (deletedScenario ? 1 : 0),
        isFirstScenario: isFirstScenario,
        deletedScenario: deletedScenario
      };

    } catch (error) {
      Logger.log('[Tool8.saveScenario] Error: ' + error);
      Logger.log('[Tool8.saveScenario] Stack: ' + error.stack);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all scenarios for a client from TOOL8_SCENARIOS sheet
   * @param {string} clientId - Client ID
   * @returns {Array} Array of scenario objects (newest first), or empty array
   */
  getUserScenarios(clientId) {
    try {
      if (!clientId) return [];

      var scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL8_SCENARIOS);
      if (!scenariosSheet) return [];

      var allData = scenariosSheet.getDataRange().getValues();
      if (allData.length <= 1) return [];

      // Column indices (0-indexed)
      var COL = {
        TIMESTAMP: 0, CLIENT_ID: 1, NAME: 2,
        M_REAL: 3, T: 4, RISK: 5,
        R_ACC_TARGET: 6, R_ACC_EFF: 7,
        C_CAP: 8, A0: 9, INFL: 10,
        D: 11, R_RET: 12, M0: 13,
        AREQ: 14, CREQ: 15,
        R_SOLVED: 16, T_SOLVED: 17,
        MODE: 18, IS_LATEST: 19,
        FIRST_NAME: 20, LAST_NAME: 21
      };

      var scenarios = [];

      for (var i = 1; i < allData.length; i++) {
        var row = allData[i];
        if (String(row[COL.CLIENT_ID]) !== String(clientId)) continue;

        // Convert Date to ISO string for serialization
        var ts = row[COL.TIMESTAMP];
        var tsStr = '';
        if (ts instanceof Date) {
          tsStr = ts.toISOString();
        } else if (ts) {
          tsStr = String(ts);
        }

        scenarios.push({
          timestamp: tsStr,
          name: String(row[COL.NAME] || ''),
          M_real: Number(row[COL.M_REAL] || 0),
          T: Number(row[COL.T] || 0),
          risk: Number(row[COL.RISK] || 0),
          rAccTarget: Number(row[COL.R_ACC_TARGET] || 0),
          rAccEff: Number(row[COL.R_ACC_EFF] || 0),
          C_cap: Number(row[COL.C_CAP] || 0),
          A0: Number(row[COL.A0] || 0),
          infl: Number(row[COL.INFL] || 0.025),
          D: Number(row[COL.D] || 30),
          rRet: Number(row[COL.R_RET] || 0.10),
          M0: Number(row[COL.M0] || 0),
          Areq: Number(row[COL.AREQ] || 0),
          Creq: row[COL.CREQ] !== '' ? Number(row[COL.CREQ]) : '',
          rSolved: row[COL.R_SOLVED] !== '' ? Number(row[COL.R_SOLVED]) : '',
          tSolved: row[COL.T_SOLVED] !== '' ? Number(row[COL.T_SOLVED]) : '',
          mode: String(row[COL.MODE] || 'contrib'),
          isLatest: row[COL.IS_LATEST] === true
        });
      }

      // Sort newest first
      scenarios.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });

      Logger.log('[Tool8.getUserScenarios] Found ' + scenarios.length + ' scenarios for client ' + clientId);
      return scenarios;

    } catch (error) {
      Logger.log('[Tool8.getUserScenarios] Error: ' + error);
      return [];
    }
  },

  /**
   * Get student name from upstream tool data
   * @param {string} clientId
   * @returns {string} Student name or 'Student'
   */
  getStudentName(clientId) {
    try {
      var tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      if (tool1Data && tool1Data.data && tool1Data.data.name) return tool1Data.data.name;
      var tool2Data = DataService.getLatestResponse(clientId, 'tool2');
      if (tool2Data && tool2Data.data && tool2Data.data.name) return tool2Data.data.name;
    } catch (e) {
      Logger.log('[Tool8.getStudentName] Error: ' + e);
    }
    return 'Student';
  },

  /**
   * Render an error page
   * @param {string} message - Error message
   * @returns {string} HTML
   */
  renderError(message) {
    return '<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <title>Tool 8 - Error</title>\n' +
'  <style>\n' +
'    body {\n' +
'      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
'      background: #1a1a2e;\n' +
'      color: #e0e0e0;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: center;\n' +
'      min-height: 100vh;\n' +
'      padding: 20px;\n' +
'    }\n' +
'    .error-card {\n' +
'      background: #16213e;\n' +
'      border: 1px solid rgba(220, 53, 69, 0.3);\n' +
'      border-radius: 12px;\n' +
'      padding: 40px;\n' +
'      max-width: 500px;\n' +
'      text-align: center;\n' +
'    }\n' +
'    .error-card h2 { color: #dc3545; margin-bottom: 12px; }\n' +
'    .error-card p { color: #a0a0a0; line-height: 1.6; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="error-card">\n' +
'    <h2>Something went wrong</h2>\n' +
'    <p>' + message + '</p>\n' +
'  </div>\n' +
'</body>\n' +
'</html>';
  }
};
