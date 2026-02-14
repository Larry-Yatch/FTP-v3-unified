/**
 * Tool8Report.js - PDF Report Generation for Investment Planning Tool
 *
 * Handles single-scenario and comparison PDF reports.
 * Uses PDFGenerator infrastructure (htmlToPDF, buildHeader, buildFooter).
 *
 * Phase 4: Full implementation of scenario reports + comparison reports.
 * Phase 7: Action barriers and trauma-informed insights.
 * Phase 8: GPT-enhanced personalized analysis, milestones, next steps.
 */

const Tool8Report = {

  // ============================================================================
  // REPORT STYLES
  // ============================================================================

  /**
   * Get CSS styles for Tool 8 PDF reports
   * Uses gold/purple color scheme matching the calculator UI
   */
  getReportStyles() {
    var gold = '#ad9168';
    var purple = '#5b4b8a';
    var darkBg = '#1e192b';

    return [
      'body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }',
      'h1 { color: ' + darkBg + '; border-bottom: 3px solid ' + gold + '; padding-bottom: 10px; }',
      'h2 { color: ' + purple + '; margin-top: 25px; font-size: 18px; }',
      'h3 { color: ' + darkBg + '; margin-top: 20px; font-size: 15px; }',
      'p { line-height: 1.6; color: #333; margin: 10px 0; }',
      '.header { text-align: center; margin-bottom: 30px; }',
      '.intro { background: rgba(173, 145, 104, 0.08); padding: 15px 18px; border-left: 4px solid ' + gold + '; margin: 15px 0; border-radius: 6px; font-size: 14px; }',
      '.footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid ' + gold + '; font-size: 13px; color: #666; }',
      '@media print { body { padding: 20px; } .page-break { page-break-before: always; } }',
      '.metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; }',
      '.metric-card { background: rgba(173, 145, 104, 0.06); padding: 12px 15px; border-radius: 8px; border-left: 3px solid ' + gold + '; }',
      '.metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }',
      '.metric-value { font-size: 20px; font-weight: 700; color: ' + purple + '; }',
      '.metric-note { font-size: 12px; color: #888; margin-top: 4px; }',
      '.feasibility-box { padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; }',
      '.feasibility-ok { background: #f0fdf4; border-left: 4px solid #22c55e; }',
      '.feasibility-warn { background: #fffbeb; border-left: 4px solid #f59e0b; }',
      '.feasibility-bad { background: #fef2f2; border-left: 4px solid #ef4444; }',
      '.risk-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }',
      '.summary-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }',
      '.summary-table th { background: ' + purple + '; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }',
      '.summary-table td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }',
      '.summary-table tr:nth-child(even) { background: rgba(173, 145, 104, 0.04); }',
      '.highlight-box { background: linear-gradient(135deg, rgba(173, 145, 104, 0.08) 0%, rgba(91, 75, 138, 0.08) 100%); padding: 18px; border-radius: 10px; border: 1px solid rgba(173, 145, 104, 0.2); margin: 15px 0; }',
      '.section-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 12px 0; page-break-inside: avoid; }',
      '.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }',
      '.comp-card { background: rgba(173, 145, 104, 0.06); padding: 15px; border-radius: 8px; border-top: 3px solid ' + gold + '; }',
      '.comp-card h3 { margin-top: 0; color: ' + purple + '; font-size: 16px; }',
      '.recommendation { background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 15px 0; }',
      '.recommendation strong { color: #1e40af; }',
      '.barrier-section { margin-top: 30px; page-break-inside: avoid; }',
      '.barrier-card { background: linear-gradient(135deg, rgba(91, 75, 138, 0.06) 0%, rgba(173, 145, 104, 0.06) 100%); border: 1px solid rgba(91, 75, 138, 0.2); border-radius: 10px; padding: 18px 20px; margin: 12px 0; page-break-inside: avoid; }',
      '.barrier-card h3 { color: ' + purple + '; margin: 0 0 10px; font-size: 15px; }',
      '.barrier-quote { font-style: italic; color: #444; margin: 8px 0; padding: 10px 15px; border-left: 3px solid ' + gold + '; background: rgba(173, 145, 104, 0.04); border-radius: 0 6px 6px 0; }',
      '.barrier-step { background: rgba(34, 197, 94, 0.06); border-left: 3px solid #22c55e; padding: 10px 15px; border-radius: 0 6px 6px 0; margin: 8px 0; }',
      '.barrier-step strong { color: #15803d; }',
      '.barrier-healing { font-size: 13px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.06); }',
      '.insight-box { background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%); padding: 18px; border-radius: 8px; border-left: 4px solid ' + gold + '; margin: 15px 0; page-break-inside: avoid; }',
      '.insight-box h3 { color: ' + purple + '; margin: 0 0 8px; font-size: 15px; }',
      '.insight-box p { margin: 0; color: #444; font-size: 14px; line-height: 1.7; }',
      '.observation-list { margin: 15px 0; }',
      '.observation-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 3px solid ' + purple + '; border-radius: 0 5px 5px 0; page-break-inside: avoid; }',
      '.observation-number { display: inline-block; width: 24px; height: 24px; background: ' + purple + '; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 10px; }',
      '.focus-box { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 18px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 15px 0; page-break-inside: avoid; }',
      '.focus-box h3 { color: #2e7d32; margin: 0 0 8px; font-size: 15px; }',
      '.milestone-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }',
      '.milestone-table th { background: ' + purple + '; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }',
      '.milestone-table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }',
      '.milestone-table tr:nth-child(even) { background: rgba(173, 145, 104, 0.04); }',
      '.milestone-current { background: #e8f5e9 !important; border-left: 4px solid #4caf50; }',
      '.milestone-table .age-cell { font-weight: 700; color: ' + purple + '; font-size: 15px; }',
      '.milestone-table .balance-cell { font-weight: 600; color: #2d2d44; }',
      '.milestone-table .event-cell { font-size: 12px; color: #555; }',
      '.next-step-item { display: flex; align-items: flex-start; margin: 10px 0; padding: 12px 15px; background: #f9f9f9; border-radius: 6px; }',
      '.next-step-checkbox { width: 18px; height: 18px; border: 2px solid ' + purple + '; border-radius: 3px; margin-right: 12px; flex-shrink: 0; margin-top: 1px; }',
      '.source-note { font-size: 11px; color: #888; font-style: italic; margin-top: 10px; }',
      '.milestone-table .balance-winner { color: #15803d; font-weight: 700; }'
    ].join('\n');
  },

  // ============================================================================
  // FORMATTERS
  // ============================================================================

  /** Format currency */
  fmtUSD(n) {
    if (!isFinite(n)) return '--';
    return '$' + Math.round(n).toLocaleString('en-US');
  },

  /** Format percentage (2 decimal) */
  fmtPct(x) {
    if (!isFinite(x)) return '--';
    return (100 * x).toFixed(2) + '%';
  },

  /** Format percentage (whole number) */
  fmtPctWhole(x) {
    if (!isFinite(x)) return '--';
    return Math.round(100 * x) + '%';
  },

  /** Get risk band label for a risk dial value */
  getRiskBand(R) {
    var bands = TOOL8_SETTINGS.riskBands;
    var band = bands[bands.length - 1];
    for (var i = 0; i < bands.length; i++) {
      if (R >= bands[i].min && R < bands[i].max) { band = bands[i]; break; }
    }
    return band;
  },

  // ============================================================================
  // SINGLE SCENARIO PDF
  // ============================================================================

  /**
   * Generate report HTML for a single investment scenario (without PDF conversion)
   * Used by admin dashboard for report viewing
   * @param {string} clientId - Client ID
   * @param {Object} scenario - Scenario data from calculator
   * @returns {Object} {success, html, studentName} or {success: false, error}
   */
  generateReportHTML(clientId, scenario) {
    try {
      Logger.log('[Tool8Report.generateReportHTML] Called for client ' + clientId);

      if (!scenario) {
        return { success: false, error: 'No scenario data provided' };
      }

      var studentName = Tool8.getStudentName(clientId);
      var riskBand = this.getRiskBand(scenario.risk || 0);

      // Build HTML sections
      var styles = this.getReportStyles();
      var header = PDFGenerator.buildHeader('Investment Planning Report', studentName);

      var intro = '<div class="intro">' +
        '<p style="margin: 0;">This report summarizes your investment planning scenario' +
        (scenario.name ? ' <strong>"' + scenario.name + '"</strong>' : '') +
        '. It shows the inputs you selected, the calculated requirements, and a feasibility assessment.</p>' +
        '</div>';

      // Mode description
      var modeLabels = { contrib: 'Monthly Savings Required', return: 'Returns Required', time: 'Years Required' };
      var modeLabel = modeLabels[scenario.mode] || 'Monthly Savings Required';

      // Input Summary
      var inputSection = '<h2>Your Inputs</h2>' +
        '<div class="metric-grid">' +
        '<div class="metric-card"><div class="metric-label">Monthly Retirement Income Goal</div>' +
        '<div class="metric-value">' + this.fmtUSD(scenario.M_real) + '</div>' +
        '<div class="metric-note">In current dollars (inflation-adjusted)</div></div>' +
        '<div class="metric-card"><div class="metric-label">Years Until Retirement</div>' +
        '<div class="metric-value">' + (scenario.T || 0) + ' years</div></div>' +
        '<div class="metric-card"><div class="metric-label">Monthly Savings Capacity</div>' +
        '<div class="metric-value">' + this.fmtUSD(scenario.C_cap) + '</div></div>' +
        '<div class="metric-card"><div class="metric-label">Current Investment Balance</div>' +
        '<div class="metric-value">' + this.fmtUSD(scenario.A0) + '</div></div>' +
        '</div>' +
        '<div class="section-box">' +
        '<div class="metric-label">Risk Profile</div>' +
        '<div style="margin-top:6px;"><span class="risk-badge" style="background: rgba(173,145,104,0.15); color: #5b4b8a;">' +
        riskBand.label + ' (Risk: ' + Number(scenario.risk).toFixed(1) + '/10)</span></div>' +
        '<div class="metric-note" style="margin-top:6px;">' + riskBand.explain + '</div>' +
        '</div>';

      // Calculation mode
      var modeSection = '<div class="section-box" style="text-align:center; padding:12px;">' +
        '<div class="metric-label">Calculation Mode</div>' +
        '<div style="font-size:16px; font-weight:600; color:#5b4b8a; margin-top:4px;">' + modeLabel + '</div>' +
        '</div>';

      // Results
      var resultsSection = '<h2>Investment Analysis Results</h2>' +
        '<div class="metric-grid">' +
        '<div class="metric-card"><div class="metric-label">Inflation-Adjusted Monthly Income</div>' +
        '<div class="metric-value">' + this.fmtUSD(scenario.M0) + '</div>' +
        '<div class="metric-note">At retirement start</div></div>' +
        '<div class="metric-card"><div class="metric-label">Required Nest Egg</div>' +
        '<div class="metric-value">' + this.fmtUSD(scenario.Areq) + '</div>' +
        '<div class="metric-note">Growing annuity calculation</div></div>';

      if (scenario.mode === 'contrib' && scenario.Creq !== '') {
        resultsSection += '<div class="metric-card"><div class="metric-label">Monthly Savings Required</div>' +
          '<div class="metric-value">' + this.fmtUSD(scenario.Creq) + '</div></div>';
      }
      if (scenario.mode === 'return' && scenario.rSolved !== '') {
        resultsSection += '<div class="metric-card"><div class="metric-label">Target Return Needed</div>' +
          '<div class="metric-value">' + this.fmtPct(scenario.rSolved) + '</div></div>';
      }
      if (scenario.mode === 'time' && scenario.tSolved !== '') {
        resultsSection += '<div class="metric-card"><div class="metric-label">Years Needed</div>' +
          '<div class="metric-value">' + Math.round(scenario.tSolved) + ' years</div></div>';
      }

      resultsSection += '<div class="metric-card"><div class="metric-label">Effective Accumulation Return</div>' +
        '<div class="metric-value">' + this.fmtPctWhole(scenario.rAccEff) + '</div>' +
        '<div class="metric-note">After conservative pacing applied</div></div>' +
        '</div>';

      // Feasibility Assessment
      var feasSection = this.buildFeasibilitySection(scenario);

      // Advanced Settings
      var advSection = '<h2>Assumptions Used</h2>' +
        '<table class="summary-table">' +
        '<tr><th>Parameter</th><th>Value</th></tr>' +
        '<tr><td>Annual Inflation</td><td>' + this.fmtPctWhole(scenario.infl) + '</td></tr>' +
        '<tr><td>Retirement Duration</td><td>' + (scenario.D || 30) + ' years</td></tr>' +
        '<tr><td>Maintenance Return (Retirement Phase)</td><td>' + this.fmtPctWhole(scenario.rRet) + '</td></tr>' +
        '<tr><td>Target Accumulation Return</td><td>' + this.fmtPct(scenario.rAccTarget) + '</td></tr>' +
        '</table>';

      // Resolve client data (used for barriers + GPT trauma context)
      var resolvedData = null;
      try {
        resolvedData = Tool8.resolveClientData(clientId);
      } catch (resolveErr) {
        Logger.log('[Tool8Report.generateReportHTML] resolveClientData error (non-fatal): ' + resolveErr);
      }

      // Phase 8: GPT-enhanced personalized analysis
      var gptInsights = null;
      try {
        gptInsights = Tool8GPTAnalysis.generateSingleReportInsights({
          scenario: scenario,
          resolvedData: resolvedData
        });
      } catch (gptErr) {
        Logger.log('[Tool8Report.generateReportHTML] GPT analysis error (non-fatal): ' + gptErr);
      }

      var gptSection = this.buildGPTSection(gptInsights);
      var milestoneSection = this.buildMilestoneSection(scenario, resolvedData);
      var nextStepsSection = this.buildNextStepsSection(gptInsights);

      // Phase 7: Action barriers (single-scenario PDF only)
      var barrierSection = '';
      if (resolvedData) {
        barrierSection = this.buildActionBarrierSection(resolvedData);
      }

      var sourceNote = '';
      if (gptInsights && gptInsights.source) {
        if (gptInsights.source === 'gpt' || gptInsights.source === 'gpt_retry') {
          sourceNote = 'Analysis generated using AI-powered insights.';
        } else if (gptInsights.source === 'fallback') {
          sourceNote = 'Analysis generated using profile-based templates.';
        }
      }

      var footer = PDFGenerator.buildFooter(
        'This projection uses conservative assumptions including deployment drag. ' +
        'Actual returns will vary. Consult with a financial advisor before making investment decisions.'
      );
      if (sourceNote) {
        footer = footer.replace('</div>', '<p class="source-note">' + sourceNote + '</p></div>');
      }

      // Combine all sections
      var bodyContent = header + intro + modeSection + inputSection + gptSection + resultsSection + milestoneSection + feasSection + nextStepsSection + barrierSection + advSection + footer;
      var htmlContent = PDFGenerator.buildHTMLDocument(styles, bodyContent);

      return { success: true, html: htmlContent, studentName: studentName };

    } catch (error) {
      Logger.log('[Tool8Report.generateReportHTML] Error: ' + error);
      Logger.log('[Tool8Report.generateReportHTML] Stack: ' + error.stack);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Generate PDF for a single investment scenario
   * @param {string} clientId - Client ID
   * @param {Object} scenario - Scenario data from calculator
   * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
   */
  generatePDF(clientId, scenario) {
    var htmlResult = this.generateReportHTML(clientId, scenario);
    if (!htmlResult.success) {
      return htmlResult;
    }

    var fileName = PDFGenerator.generateFileName('InvestmentPlanning', htmlResult.studentName);
    return PDFGenerator.htmlToPDF(htmlResult.html, fileName);
  },

  // ============================================================================
  // COMPARISON PDF
  // ============================================================================

  /**
   * Generate PDF comparing two investment scenarios
   * @param {string} clientId - Client ID
   * @param {Object} s1 - First scenario
   * @param {Object} s2 - Second scenario
   * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
   */
  generateComparisonPDF(clientId, s1, s2) {
    try {
      Logger.log('[Tool8Report.generateComparisonPDF] Called for client ' + clientId);

      if (!s1 || !s2) {
        return { success: false, error: 'Two scenarios are required for comparison' };
      }

      var studentName = Tool8.getStudentName(clientId);
      var styles = this.getReportStyles();
      var header = PDFGenerator.buildHeader('Scenario Comparison Report', studentName);

      var intro = '<div class="intro">' +
        '<p style="margin: 0;">This report compares two investment planning scenarios side-by-side, ' +
        'helping you evaluate different approaches to reaching your retirement goals.</p></div>';

      // Scenario overview cards
      var overviewSection = '<h2>Scenarios Compared</h2>' +
        '<div class="comp-grid">' +
        '<div class="comp-card">' +
        '<h3>Scenario A</h3>' +
        '<p style="font-weight:600; font-size:15px;">' + (s1.name || 'Unnamed') + '</p>' +
        '<table style="width:100%; font-size:13px;">' +
        '<tr><td style="color:#666; padding:3px 0;">Income Goal:</td><td style="text-align:right; font-weight:500;">' + this.fmtUSD(s1.M_real) + '/mo</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Timeline:</td><td style="text-align:right; font-weight:500;">' + (s1.T || 0) + ' years</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Risk Level:</td><td style="text-align:right; font-weight:500;">' + Number(s1.risk || 0).toFixed(1) + '/10</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Monthly Savings:</td><td style="text-align:right; font-weight:500;">' + this.fmtUSD(s1.C_cap) + '</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Current Assets:</td><td style="text-align:right; font-weight:500;">' + this.fmtUSD(s1.A0) + '</td></tr>' +
        '</table></div>' +
        '<div class="comp-card">' +
        '<h3>Scenario B</h3>' +
        '<p style="font-weight:600; font-size:15px;">' + (s2.name || 'Unnamed') + '</p>' +
        '<table style="width:100%; font-size:13px;">' +
        '<tr><td style="color:#666; padding:3px 0;">Income Goal:</td><td style="text-align:right; font-weight:500;">' + this.fmtUSD(s2.M_real) + '/mo</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Timeline:</td><td style="text-align:right; font-weight:500;">' + (s2.T || 0) + ' years</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Risk Level:</td><td style="text-align:right; font-weight:500;">' + Number(s2.risk || 0).toFixed(1) + '/10</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Monthly Savings:</td><td style="text-align:right; font-weight:500;">' + this.fmtUSD(s2.C_cap) + '</td></tr>' +
        '<tr><td style="color:#666; padding:3px 0;">Current Assets:</td><td style="text-align:right; font-weight:500;">' + this.fmtUSD(s2.A0) + '</td></tr>' +
        '</table></div></div>';

      // Detailed comparison table
      var compTable = '<h2>Side-by-Side Comparison</h2>' +
        '<table class="summary-table">' +
        '<tr><th>Metric</th><th>' + (s1.name || 'Scenario A') + '</th><th>' + (s2.name || 'Scenario B') + '</th></tr>';

      var rows = [
        ['Monthly Income Goal', this.fmtUSD(s1.M_real), this.fmtUSD(s2.M_real)],
        ['Years to Retirement', (s1.T || 0) + ' yrs', (s2.T || 0) + ' yrs'],
        ['Risk Level', Number(s1.risk || 0).toFixed(1) + '/10', Number(s2.risk || 0).toFixed(1) + '/10'],
        ['Monthly Savings Capacity', this.fmtUSD(s1.C_cap), this.fmtUSD(s2.C_cap)],
        ['Current Assets', this.fmtUSD(s1.A0), this.fmtUSD(s2.A0)],
        ['Required Nest Egg', this.fmtUSD(s1.Areq), this.fmtUSD(s2.Areq)],
        ['Effective Return', this.fmtPct(s1.rAccEff), this.fmtPct(s2.rAccEff)]
      ];

      // Add mode-specific rows
      if (s1.Creq !== '' || s2.Creq !== '') {
        rows.push(['Required Monthly Savings', s1.Creq !== '' ? this.fmtUSD(s1.Creq) : 'N/A', s2.Creq !== '' ? this.fmtUSD(s2.Creq) : 'N/A']);
      }
      if (s1.rSolved !== '' || s2.rSolved !== '') {
        rows.push(['Required Return', s1.rSolved !== '' ? this.fmtPct(s1.rSolved) : 'N/A', s2.rSolved !== '' ? this.fmtPct(s2.rSolved) : 'N/A']);
      }
      if (s1.tSolved !== '' || s2.tSolved !== '') {
        rows.push(['Years Needed', s1.tSolved !== '' ? Math.round(s1.tSolved) + ' yrs' : 'N/A', s2.tSolved !== '' ? Math.round(s2.tSolved) + ' yrs' : 'N/A']);
      }

      for (var i = 0; i < rows.length; i++) {
        compTable += '<tr><td>' + rows[i][0] + '</td><td style="text-align:center; font-weight:500;">' + rows[i][1] + '</td>' +
          '<td style="text-align:center; font-weight:500;">' + rows[i][2] + '</td></tr>';
      }
      compTable += '</table>';

      // Feasibility comparison
      var f1 = this.assessFeasibility(s1);
      var f2 = this.assessFeasibility(s2);

      var feasCompSection = '<h2>Feasibility Comparison</h2>' +
        '<div class="comp-grid">' +
        '<div class="feasibility-box ' + f1.cssClass + '">' +
        '<div style="font-weight:600; font-size:15px; margin-bottom:6px;">' + (s1.name || 'Scenario A') + '</div>' +
        '<div style="font-size:18px; margin-bottom:4px;">' + f1.label + '</div>' +
        '<div style="font-size:13px; color:#555;">' + f1.summary + '</div></div>' +
        '<div class="feasibility-box ' + f2.cssClass + '">' +
        '<div style="font-weight:600; font-size:15px; margin-bottom:6px;">' + (s2.name || 'Scenario B') + '</div>' +
        '<div style="font-size:18px; margin-bottom:4px;">' + f2.label + '</div>' +
        '<div style="font-size:13px; color:#555;">' + f2.summary + '</div></div>' +
        '</div>';

      // Recommendation (rule-based)
      var recommendation = this.buildComparisonRecommendation(s1, s2, f1, f2);

      // Phase 8: GPT-enhanced comparison analysis
      var compResolvedData = null;
      try {
        compResolvedData = Tool8.resolveClientData(clientId);
      } catch (resolveErr) {
        Logger.log('[Tool8Report.generateComparisonPDF] resolveClientData error (non-fatal): ' + resolveErr);
      }

      var compGptInsights = null;
      try {
        compGptInsights = Tool8GPTAnalysis.generateComparisonInsights({
          s1: s1,
          s2: s2,
          resolvedData: compResolvedData
        });
      } catch (gptErr) {
        Logger.log('[Tool8Report.generateComparisonPDF] GPT analysis error (non-fatal): ' + gptErr);
      }

      var compGptSection = this.buildComparisonGPTSection(compGptInsights);

      // Assumptions
      var advSection = '<h2>Assumptions</h2>' +
        '<table class="summary-table">' +
        '<tr><th>Parameter</th><th>' + (s1.name || 'A') + '</th><th>' + (s2.name || 'B') + '</th></tr>' +
        '<tr><td>Inflation</td><td style="text-align:center;">' + this.fmtPctWhole(s1.infl) + '</td><td style="text-align:center;">' + this.fmtPctWhole(s2.infl) + '</td></tr>' +
        '<tr><td>Retirement Duration</td><td style="text-align:center;">' + (s1.D || 30) + ' yrs</td><td style="text-align:center;">' + (s2.D || 30) + ' yrs</td></tr>' +
        '<tr><td>Maintenance Return</td><td style="text-align:center;">' + this.fmtPctWhole(s1.rRet) + '</td><td style="text-align:center;">' + this.fmtPctWhole(s2.rRet) + '</td></tr>' +
        '</table>';

      var footer = PDFGenerator.buildFooter(
        'This comparison uses conservative assumptions. Discuss these scenarios with your financial advisor to determine the best path forward.'
      );

      var compSourceNote = '';
      if (compGptInsights && compGptInsights.source) {
        if (compGptInsights.source === 'gpt' || compGptInsights.source === 'gpt_retry') {
          compSourceNote = 'Analysis generated using AI-powered insights.';
        } else if (compGptInsights.source === 'fallback') {
          compSourceNote = 'Analysis generated using profile-based templates.';
        }
      }
      if (compSourceNote) {
        footer = footer.replace('</div>', '<p class="source-note">' + compSourceNote + '</p></div>');
      }

      var compMilestoneSection = this.buildComparisonMilestoneSection(s1, s2, compResolvedData);

      var bodyContent = header + intro + overviewSection + compTable + feasCompSection + recommendation + compGptSection + compMilestoneSection + advSection + footer;
      var htmlContent = PDFGenerator.buildHTMLDocument(styles, bodyContent);
      var fileName = PDFGenerator.generateFileName('InvestmentComparison', studentName);

      return PDFGenerator.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log('[Tool8Report.generateComparisonPDF] Error: ' + error);
      Logger.log('[Tool8Report.generateComparisonPDF] Stack: ' + error.stack);
      return { success: false, error: error.toString() };
    }
  },

  // ============================================================================
  // FEASIBILITY HELPERS
  // ============================================================================

  /**
   * Assess feasibility of a scenario
   * @param {Object} scenario
   * @returns {Object} {label, summary, cssClass, feasible, surplus}
   */
  assessFeasibility(scenario) {
    var mode = scenario.mode || 'contrib';
    var tolerance = 1;

    if (mode === 'contrib' && scenario.Creq !== '') {
      var Creq = Number(scenario.Creq);
      var Ccap = Number(scenario.C_cap);
      var gap = Ccap - Creq;

      if (Math.abs(gap) <= tolerance) {
        return { label: 'Perfect Match', summary: 'Your capacity exactly meets the requirement.', cssClass: 'feasibility-ok', feasible: true, surplus: 0 };
      } else if (gap > 0) {
        return { label: 'Feasible', summary: 'Surplus of ' + this.fmtUSD(gap) + '/month above requirement.', cssClass: 'feasibility-ok', feasible: true, surplus: gap };
      } else {
        return { label: 'Needs Adjustment', summary: 'Shortfall of ' + this.fmtUSD(Math.abs(gap)) + '/month.', cssClass: 'feasibility-bad', feasible: false, surplus: gap };
      }
    }

    if (mode === 'return') {
      if (scenario.rSolved !== '' && isFinite(Number(scenario.rSolved))) {
        var reqReturn = Number(scenario.rSolved);
        if (reqReturn <= 0.25) {
          return { label: 'Feasible', summary: 'Required return of ' + this.fmtPct(reqReturn) + ' is within achievable range.', cssClass: 'feasibility-ok', feasible: true, surplus: 0 };
        } else {
          return { label: 'Needs Adjustment', summary: 'Required return of ' + this.fmtPct(reqReturn) + ' exceeds typical market returns.', cssClass: 'feasibility-warn', feasible: false, surplus: 0 };
        }
      }
      return { label: 'Unable to Calculate', summary: 'Could not solve for required return.', cssClass: 'feasibility-warn', feasible: false, surplus: 0 };
    }

    if (mode === 'time') {
      if (scenario.tSolved !== '' && isFinite(Number(scenario.tSolved))) {
        var years = Number(scenario.tSolved);
        return { label: 'Feasible', summary: 'Requires ' + Math.round(years) + ' years to reach your goal.', cssClass: 'feasibility-ok', feasible: true, surplus: 0 };
      }
      return { label: 'Unable to Calculate', summary: 'Could not solve for required time.', cssClass: 'feasibility-warn', feasible: false, surplus: 0 };
    }

    return { label: 'Unknown', summary: '', cssClass: 'feasibility-warn', feasible: false, surplus: 0 };
  },

  /**
   * Build feasibility section for single scenario PDF
   */
  buildFeasibilitySection(scenario) {
    var f = this.assessFeasibility(scenario);
    return '<h2>Feasibility Assessment</h2>' +
      '<div class="feasibility-box ' + f.cssClass + '">' +
      '<div style="font-size:18px; font-weight:600; margin-bottom:6px;">' + f.label + '</div>' +
      '<div style="font-size:14px;">' + f.summary + '</div>' +
      '</div>';
  },

  /**
   * Build recommendation section for comparison PDF
   */
  buildComparisonRecommendation(s1, s2, f1, f2) {
    var rec = '';

    if (f1.feasible && !f2.feasible) {
      rec = '<strong>"' + (s1.name || 'Scenario A') + '"</strong> is the only feasible option. ' +
        'Consider adjusting "' + (s2.name || 'Scenario B') + '" by increasing savings, extending timeline, or reducing the income goal.';
    } else if (!f1.feasible && f2.feasible) {
      rec = '<strong>"' + (s2.name || 'Scenario B') + '"</strong> is the only feasible option. ' +
        'Consider adjusting "' + (s1.name || 'Scenario A') + '" by increasing savings, extending timeline, or reducing the income goal.';
    } else if (f1.feasible && f2.feasible) {
      // Both feasible - compare on surplus/timeline
      if (f1.surplus > f2.surplus && f1.surplus > 50) {
        rec = '<strong>"' + (s1.name || 'Scenario A') + '"</strong> provides ' + this.fmtUSD(f1.surplus - f2.surplus) +
          ' more monthly flexibility. This extra cushion can help absorb unexpected expenses or accelerate wealth building.';
      } else if (f2.surplus > f1.surplus && f2.surplus > 50) {
        rec = '<strong>"' + (s2.name || 'Scenario B') + '"</strong> provides ' + this.fmtUSD(f2.surplus - f1.surplus) +
          ' more monthly flexibility.';
      } else if (Number(s1.T) < Number(s2.T) - 2) {
        rec = '<strong>"' + (s1.name || 'Scenario A') + '"</strong> gets you to retirement ' +
          (Number(s2.T) - Number(s1.T)).toFixed(1) + ' years sooner.';
      } else if (Number(s2.T) < Number(s1.T) - 2) {
        rec = '<strong>"' + (s2.name || 'Scenario B') + '"</strong> gets you to retirement ' +
          (Number(s1.T) - Number(s2.T)).toFixed(1) + ' years sooner.';
      } else {
        rec = 'Both scenarios are feasible with similar profiles. Choose the one that best matches your lifestyle and comfort level.';
      }
    } else {
      // Neither feasible
      var shortfall1 = Math.abs(f1.surplus || 0);
      var shortfall2 = Math.abs(f2.surplus || 0);
      var closer = shortfall1 < shortfall2 ? (s1.name || 'Scenario A') : (s2.name || 'Scenario B');
      rec = 'Neither scenario is currently feasible. <strong>"' + closer + '"</strong> is closer to feasibility. ' +
        'Consider increasing savings capacity, extending your timeline, or adjusting your retirement income goal.';
    }

    return '<h2>Recommendation</h2>' +
      '<div class="recommendation"><p style="margin:0;">' + rec + '</p></div>';
  },

  // ============================================================================
  // GPT-ENHANCED SECTIONS (Phase 8)
  // ============================================================================

  /**
   * Build "Personalized Analysis" section from GPT insights
   * @param {Object} gptInsights - {overview, keyInsights, nextSteps, source}
   * @returns {string} HTML string (empty if no insights)
   */
  buildGPTSection(gptInsights) {
    if (!gptInsights) return '';

    var html = '<div class="page-break"></div><h2>Personalized Analysis</h2>';

    // Overview
    if (gptInsights.overview) {
      html += '<div class="insight-box">' +
        '<h3>Overview</h3>' +
        '<p>' + gptInsights.overview + '</p>' +
        '</div>';
    }

    // Key Insights
    if (gptInsights.keyInsights && gptInsights.keyInsights.length > 0 &&
        gptInsights.keyInsights[0] !== 'Analysis not available') {
      html += '<h3>Key Insights</h3>' +
        '<div class="observation-list">';
      for (var i = 0; i < gptInsights.keyInsights.length; i++) {
        html += '<div class="observation-item">' +
          '<span class="observation-number">' + (i + 1) + '</span>' +
          gptInsights.keyInsights[i] +
          '</div>';
      }
      html += '</div>';
    }

    return html;
  },

  /**
   * Build "Your Investment Timeline" milestone section
   * Shows projected nest egg at 5-year intervals
   *
   * @param {Object} scenario - Scenario data
   * @param {Object} resolvedData - From Tool8.resolveClientData() (for age)
   * @returns {string} HTML string
   */
  buildMilestoneSection(scenario, resolvedData) {
    var years = Number(scenario.T) || 0;
    if (years < 5) return ''; // Too short for meaningful milestones

    var age = (resolvedData && resolvedData.age) ? Number(resolvedData.age) : null;
    var A0 = Number(scenario.A0) || 0;
    var C = Number(scenario.C_cap) || 0;
    var rEff = Number(scenario.rAccEff) || 0;
    var monthlyRate = rEff / 12;

    // Build milestone intervals (every 5 years, plus final year)
    var intervals = [];
    for (var y = 5; y < years; y += 5) {
      intervals.push(y);
    }
    if (intervals[intervals.length - 1] !== years) {
      intervals.push(years);
    }

    // Calculate projected balance at each interval
    var milestones = [];
    for (var m = 0; m < intervals.length; m++) {
      var yr = intervals[m];
      var months = yr * 12;
      var fvPrincipal = A0 * Math.pow(1 + monthlyRate, months);
      var fvContrib = monthlyRate > 0
        ? C * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
        : C * months;
      var balance = Math.round(fvPrincipal + fvContrib);

      // Life events at this age
      var events = [];
      if (age) {
        var milestoneAge = age + yr;
        if (milestoneAge >= 50 && milestoneAge < 55) events.push('IRA/401(k) catch-up eligible');
        if (milestoneAge >= 55 && milestoneAge < 59) events.push('HSA catch-up eligible');
        if (Math.abs(milestoneAge - 59.5) < 2.5) events.push('Penalty-free IRA withdrawals at 59.5');
        if (Math.abs(milestoneAge - 62) < 2.5) events.push('Early Social Security available');
        if (Math.abs(milestoneAge - 65) < 2.5) events.push('Medicare eligibility');
        if (Math.abs(milestoneAge - 67) < 2.5) events.push('Full Social Security benefits');
        if (Math.abs(milestoneAge - 73) < 2.5) events.push('RMD planning begins');
      }
      if (yr === years) events.push('Target retirement date');

      milestones.push({
        year: yr,
        age: age ? age + yr : null,
        balance: balance,
        events: events.join('; ') || 'Continued growth',
        isTarget: yr === years
      });
    }

    var html = '<h2>Your Investment Timeline</h2>' +
      '<p style="font-size:14px; color:#555; margin-bottom:12px;">Projected nest egg growth based on your current plan.</p>' +
      '<table class="milestone-table">' +
      '<thead><tr>' +
      '<th>Year</th>' +
      (age ? '<th>Age</th>' : '') +
      '<th>Projected Balance</th>' +
      '<th>What Happens</th>' +
      '</tr></thead><tbody>';

    for (var k = 0; k < milestones.length; k++) {
      var ms = milestones[k];
      html += '<tr class="' + (ms.isTarget ? 'milestone-current' : '') + '">' +
        '<td>' + ms.year + ' yrs</td>' +
        (age ? '<td class="age-cell">' + ms.age + '</td>' : '') +
        '<td class="balance-cell">' + this.fmtUSD(ms.balance) + '</td>' +
        '<td class="event-cell">' + ms.events + '</td>' +
        '</tr>';
    }

    html += '</tbody></table>';

    // Comparison to required nest egg
    var lastBalance = milestones[milestones.length - 1].balance;
    var Areq = Number(scenario.Areq) || 0;
    if (Areq > 0) {
      var pct = Math.round((lastBalance / Areq) * 100);
      var statusClass = pct >= 100 ? 'feasibility-ok' : pct >= 75 ? 'feasibility-warn' : 'feasibility-bad';
      html += '<div class="feasibility-box ' + statusClass + '" style="margin-top:12px;">' +
        '<div style="font-size:14px;">At year ' + years + ', your projected balance of ' + this.fmtUSD(lastBalance) +
        ' reaches <strong>' + pct + '%</strong> of your ' + this.fmtUSD(Areq) + ' target nest egg.</div></div>';
    }

    return html;
  },

  /**
   * Build side-by-side milestone projection for comparison PDF.
   * Shows projected nest egg at unified 5-year intervals for both scenarios.
   *
   * @param {Object} s1 - First scenario
   * @param {Object} s2 - Second scenario
   * @param {Object} resolvedData - From Tool8.resolveClientData() (for age)
   * @returns {string} HTML string (empty if both timelines < 5 years)
   */
  buildComparisonMilestoneSection(s1, s2, resolvedData) {
    var years1 = Number(s1.T) || 0;
    var years2 = Number(s2.T) || 0;
    var maxYears = Math.max(years1, years2);
    if (maxYears < 5) return '';

    var age = (resolvedData && resolvedData.age) ? Number(resolvedData.age) : null;

    // Build unified intervals (union of both scenarios' 5-year marks + both terminal years)
    var intervalSet = {};
    var y;
    for (y = 5; y <= maxYears; y += 5) {
      intervalSet[y] = true;
    }
    if (years1 > 0) intervalSet[years1] = true;
    if (years2 > 0) intervalSet[years2] = true;

    var intervals = Object.keys(intervalSet).map(function(k) { return Number(k); });
    intervals.sort(function(a, b) { return a - b; });

    // Pre-compute monthly rates
    var A0_1 = Number(s1.A0) || 0;
    var C1 = Number(s1.C_cap) || 0;
    var r1 = Number(s1.rAccEff) || 0;
    var mr1 = r1 / 12;

    var A0_2 = Number(s2.A0) || 0;
    var C2 = Number(s2.C_cap) || 0;
    var r2 = Number(s2.rAccEff) || 0;
    var mr2 = r2 / 12;

    var Areq1 = Number(s1.Areq) || 0;
    var Areq2 = Number(s2.Areq) || 0;

    // Calculate balances at each interval
    var rows = [];
    var s1ReachedAreqYear = null;
    var s2ReachedAreqYear = null;

    for (var i = 0; i < intervals.length; i++) {
      var yr = intervals[i];
      var months = yr * 12;

      // Scenario 1 balance (only if within its timeline)
      var bal1 = null;
      if (yr <= years1) {
        var fvP1 = A0_1 * Math.pow(1 + mr1, months);
        var fvC1 = mr1 > 0
          ? C1 * ((Math.pow(1 + mr1, months) - 1) / mr1)
          : C1 * months;
        bal1 = Math.round(fvP1 + fvC1);
        if (s1ReachedAreqYear === null && Areq1 > 0 && bal1 >= Areq1) {
          s1ReachedAreqYear = yr;
        }
      }

      // Scenario 2 balance (only if within its timeline)
      var bal2 = null;
      if (yr <= years2) {
        var fvP2 = A0_2 * Math.pow(1 + mr2, months);
        var fvC2 = mr2 > 0
          ? C2 * ((Math.pow(1 + mr2, months) - 1) / mr2)
          : C2 * months;
        bal2 = Math.round(fvP2 + fvC2);
        if (s2ReachedAreqYear === null && Areq2 > 0 && bal2 >= Areq2) {
          s2ReachedAreqYear = yr;
        }
      }

      // Life events at this age
      var events = [];
      if (age) {
        var milestoneAge = age + yr;
        if (milestoneAge >= 50 && milestoneAge < 55) events.push('IRA/401(k) catch-up eligible');
        if (milestoneAge >= 55 && milestoneAge < 59) events.push('HSA catch-up eligible');
        if (Math.abs(milestoneAge - 59.5) < 2.5) events.push('Penalty-free IRA withdrawals at 59.5');
        if (Math.abs(milestoneAge - 62) < 2.5) events.push('Early Social Security available');
        if (Math.abs(milestoneAge - 65) < 2.5) events.push('Medicare eligibility');
        if (Math.abs(milestoneAge - 67) < 2.5) events.push('Full Social Security benefits');
        if (Math.abs(milestoneAge - 73) < 2.5) events.push('RMD planning begins');
      }

      var isTarget1 = (yr === years1);
      var isTarget2 = (yr === years2);
      if (isTarget1) events.push((s1.name || 'A') + ' target date');
      if (isTarget2) events.push((s2.name || 'B') + ' target date');

      rows.push({
        year: yr,
        age: age ? age + yr : null,
        bal1: bal1,
        bal2: bal2,
        events: events.join('; ') || 'Continued growth',
        isTarget1: isTarget1,
        isTarget2: isTarget2
      });
    }

    // Build HTML table
    var name1 = s1.name || 'Scenario A';
    var name2 = s2.name || 'Scenario B';

    var html = '<div class="page-break"></div>' +
      '<h2>Investment Timeline Comparison</h2>' +
      '<p style="font-size:14px; color:#555; margin-bottom:12px;">Projected nest egg growth for both scenarios at key milestones.</p>' +
      '<table class="milestone-table">' +
      '<thead><tr>' +
      '<th>Year</th>' +
      (age ? '<th>Age</th>' : '') +
      '<th>' + name1 + '</th>' +
      '<th>' + name2 + '</th>' +
      '<th>Life Events</th>' +
      '</tr></thead><tbody>';

    for (var k = 0; k < rows.length; k++) {
      var row = rows[k];
      var rowClass = (row.isTarget1 || row.isTarget2) ? 'milestone-current' : '';

      // Determine which balance is higher for winner highlight
      var b1Class = 'balance-cell';
      var b2Class = 'balance-cell';
      if (row.bal1 !== null && row.bal2 !== null && row.bal1 > row.bal2) {
        b1Class += ' balance-winner';
      } else if (row.bal2 !== null && row.bal1 !== null && row.bal2 > row.bal1) {
        b2Class += ' balance-winner';
      }

      html += '<tr class="' + rowClass + '">' +
        '<td>' + row.year + ' yrs</td>' +
        (age ? '<td class="age-cell">' + row.age + '</td>' : '') +
        '<td class="' + b1Class + '">' + (row.bal1 !== null ? this.fmtUSD(row.bal1) : '--') + '</td>' +
        '<td class="' + b2Class + '">' + (row.bal2 !== null ? this.fmtUSD(row.bal2) : '--') + '</td>' +
        '<td class="event-cell">' + row.events + '</td>' +
        '</tr>';
    }

    html += '</tbody></table>';

    // Summary: which reaches Areq first
    if (s1ReachedAreqYear !== null || s2ReachedAreqYear !== null) {
      var summaryText = '';
      if (s1ReachedAreqYear !== null && s2ReachedAreqYear !== null) {
        if (s1ReachedAreqYear < s2ReachedAreqYear) {
          summaryText = '"' + name1 + '" reaches its target nest egg of ' + this.fmtUSD(Areq1) +
            ' by year ' + s1ReachedAreqYear + ', while "' + name2 + '" reaches ' +
            this.fmtUSD(Areq2) + ' by year ' + s2ReachedAreqYear + '.';
        } else if (s2ReachedAreqYear < s1ReachedAreqYear) {
          summaryText = '"' + name2 + '" reaches its target nest egg of ' + this.fmtUSD(Areq2) +
            ' by year ' + s2ReachedAreqYear + ', while "' + name1 + '" reaches ' +
            this.fmtUSD(Areq1) + ' by year ' + s1ReachedAreqYear + '.';
        } else {
          summaryText = 'Both scenarios reach their respective targets by year ' + s1ReachedAreqYear + '.';
        }
      } else if (s1ReachedAreqYear !== null) {
        summaryText = '"' + name1 + '" reaches its ' + this.fmtUSD(Areq1) +
          ' target by year ' + s1ReachedAreqYear +
          '. "' + name2 + '" does not reach its ' + this.fmtUSD(Areq2) + ' target within its timeline.';
      } else {
        summaryText = '"' + name2 + '" reaches its ' + this.fmtUSD(Areq2) +
          ' target by year ' + s2ReachedAreqYear +
          '. "' + name1 + '" does not reach its ' + this.fmtUSD(Areq1) + ' target within its timeline.';
      }

      html += '<div class="feasibility-box feasibility-ok" style="margin-top:12px;">' +
        '<div style="font-size:14px;">' + summaryText + '</div></div>';
    }

    return html;
  },

  /**
   * Build "Your Next Steps" section from GPT insights
   * @param {Object} gptInsights - {nextSteps: [...]}
   * @returns {string} HTML string (empty if no insights)
   */
  buildNextStepsSection(gptInsights) {
    if (!gptInsights || !gptInsights.nextSteps || gptInsights.nextSteps.length === 0 ||
        gptInsights.nextSteps[0] === 'Analysis not available') {
      return '';
    }

    var html = '<h2>Your Next Steps</h2>' +
      '<p style="font-size:14px; color:#555; margin-bottom:12px;">Concrete actions to move from plan to execution.</p>';

    for (var i = 0; i < gptInsights.nextSteps.length; i++) {
      html += '<div class="next-step-item">' +
        '<div class="next-step-checkbox"></div>' +
        '<span style="font-size:14px;">' + gptInsights.nextSteps[i] + '</span>' +
        '</div>';
    }

    return html;
  },

  /**
   * Build GPT analysis section for comparison PDF
   * @param {Object} gptInsights - {synthesis, guidance, tradeoffs, source}
   * @returns {string} HTML string (empty if no insights)
   */
  buildComparisonGPTSection(gptInsights) {
    if (!gptInsights) return '';

    var html = '<div class="page-break"></div><h2>Analysis</h2>';

    // Synthesis
    if (gptInsights.synthesis) {
      html += '<div class="insight-box">' +
        '<h3>What Changed</h3>' +
        '<p>' + gptInsights.synthesis + '</p>' +
        '</div>';
    }

    // Decision Guidance
    if (gptInsights.guidance) {
      html += '<div class="focus-box">' +
        '<h3>Decision Guidance</h3>' +
        '<p style="margin:0; color:#333;">' + gptInsights.guidance + '</p>' +
        '</div>';
    }

    // Trade-offs
    if (gptInsights.tradeoffs && gptInsights.tradeoffs.length > 0 &&
        gptInsights.tradeoffs[0] !== 'Analysis not available') {
      html += '<h3>Key Trade-offs to Consider</h3>' +
        '<div class="observation-list">';
      for (var i = 0; i < gptInsights.tradeoffs.length; i++) {
        html += '<div class="observation-item">' +
          '<span class="observation-number">' + (i + 1) + '</span>' +
          gptInsights.tradeoffs[i] +
          '</div>';
      }
      html += '</div>';
    }

    return html;
  },

  // ============================================================================
  // ACTION BARRIER SECTION (Phase 7)
  // ============================================================================

  /**
   * Find the top subdomains scoring above the threshold.
   * Checks Tools 3, 5, and 7 subdomain quotients.
   * Also checks for Fear pattern-level match.
   *
   * @param {Object} resolvedData - From Tool8.resolveClientData()
   * @param {number} threshold - Minimum quotient to include (default 60)
   * @param {number} maxBarriers - Maximum barriers to return (default 2)
   * @returns {Array} Sorted array of {key, quotient, barrier} objects, highest first
   */
  findTopBarriers(resolvedData, threshold, maxBarriers) {
    threshold = threshold || 60;
    maxBarriers = maxBarriers || 2;
    var candidates = [];

    // Check each defined barrier against its corresponding tool scoring
    var barrierKeys = Object.keys(TOOL8_ACTION_BARRIERS);
    for (var i = 0; i < barrierKeys.length; i++) {
      var key = barrierKeys[i];
      var def = TOOL8_ACTION_BARRIERS[key];

      // Skip Fear_general — handled separately below
      if (!def.tool || !def.subdomain) continue;

      // Get the scoring object for the relevant tool
      var scoring = resolvedData[def.tool];
      if (!scoring || !scoring.subdomainQuotients) continue;

      var quotient = Number(scoring.subdomainQuotients[def.subdomain] || 0);
      if (quotient > threshold) {
        candidates.push({ key: key, quotient: quotient, barrier: def });
      }
    }

    // Sort by quotient descending
    candidates.sort(function(a, b) { return b.quotient - a.quotient; });

    // If the primary trauma pattern is Fear and we have fewer than max barriers,
    // add the general Fear barrier
    if (candidates.length < maxBarriers && resolvedData.traumaPattern === 'Fear') {
      var fearDef = TOOL8_ACTION_BARRIERS['Fear_general'];
      if (fearDef) {
        candidates.push({ key: 'Fear_general', quotient: 0, barrier: fearDef });
      }
    }

    return candidates.slice(0, maxBarriers);
  },

  /**
   * Build the "Your Action Barriers" section for the single-scenario PDF.
   * Only included when trauma data exists and at least one subdomain > 60.
   *
   * @param {Object} resolvedData - From Tool8.resolveClientData()
   * @returns {string} HTML string (empty if no barriers apply)
   */
  buildActionBarrierSection(resolvedData) {
    if (!resolvedData) return '';

    // Need at least one of Tools 3/5/7 or Fear pattern
    var hasTraumaScoring = resolvedData.tool3Scoring || resolvedData.tool5Scoring || resolvedData.tool7Scoring;
    if (!hasTraumaScoring && resolvedData.traumaPattern !== 'Fear') return '';

    var barriers = this.findTopBarriers(resolvedData);
    if (barriers.length === 0) return '';

    var html = '<div class="barrier-section">' +
      '<h2>Your Action Barriers</h2>' +
      '<p style="font-size:14px; color:#555; margin-bottom:15px;">' +
      'Based on your earlier work, here is what will most likely try to stop you from following through on this plan ' +
      '— and what to do about it.</p>';

    for (var i = 0; i < barriers.length; i++) {
      var b = barriers[i].barrier;
      html += '<div class="barrier-card">' +
        '<h3>Barrier ' + (i + 1) + ': ' + b.theme + '</h3>' +
        '<div class="barrier-quote">' + b.barrier + '</div>' +
        '<div class="barrier-step"><strong>Your first step:</strong> ' + b.step + '</div>' +
        '<div class="barrier-healing">' + b.healing + '</div>' +
        '</div>';
    }

    html += '</div>';
    return html;
  },

  // ============================================================================
  // SYSTEM ROUTE HANDLER
  // ============================================================================

  /**
   * Render a Tool 8 report page (for system route handler)
   * @param {string} clientId - Student client ID
   * @returns {HtmlOutput} Report HTML
   */
  render(clientId) {
    try {
      var scenarios = Tool8.getUserScenarios(clientId);
      var studentName = Tool8.getStudentName(clientId);
      var historyManager = HtmlService.createHtmlOutputFromFile('shared/history-manager').getContent();

      var html = '<!DOCTYPE html>' +
        '<html><head><meta charset="utf-8"><title>Investment Planning Report</title>' +
        historyManager +
        '<style>' +
        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 40px; }' +
        'h1 { color: #ad9168; }' +
        '.card { background: rgba(20,15,35,0.9); border: 1px solid rgba(173,145,104,0.2); border-radius: 12px; padding: 20px; margin: 12px 0; }' +
        '.btn { appearance: none; border: 2px solid #ad9168; background: transparent; color: #ad9168; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-size: 13px; }' +
        '.btn:hover { background: #ad9168; color: #140f23; }' +
        'p { color: #a0a0a0; }' +
        '.loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.3s; }' +
        '.loading-overlay.active { opacity: 1; pointer-events: all; }' +
        '.loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(173,145,104,0.3); border-top: 3px solid #ad9168; border-radius: 50%; animation: spin 1s linear infinite; }' +
        '@keyframes spin { to { transform: rotate(360deg); } }' +
        '.loading-content { text-align: center; color: #e0e0e0; }' +
        '.loading-text { margin-top: 16px; font-size: 14px; }' +
        '</style></head><body>' +
        '<div class="report-container">' +
        '<div class="loading-overlay" id="loadingOverlay"><div class="loading-content"><div class="loading-spinner"></div><div class="loading-text" id="loadingText">Loading...</div></div></div>' +
        '<div style="margin-bottom: 20px;"><button class="btn" onclick="backToDashboard()">Back to Dashboard</button></div>' +
        '<h1>Investment Planning Report</h1>' +
        '<p>Student: ' + studentName + '</p>';

      if (scenarios.length === 0) {
        html += '<div class="card"><p>No saved scenarios found. Use the Investment Planning Tool to create and save scenarios.</p></div>';
      } else {
        html += '<p>' + scenarios.length + ' saved scenario(s) found.</p>';
        for (var i = 0; i < scenarios.length; i++) {
          var scn = scenarios[i];
          html += '<div class="card">' +
            '<h3 style="color:#ad9168; margin:0 0 8px;">' + (scn.name || 'Unnamed Scenario') + '</h3>' +
            '<p style="margin:4px 0;">Income Goal: ' + this.fmtUSD(scn.M_real) + '/mo | ' +
            'Years: ' + scn.T + ' | Risk: ' + Number(scn.risk).toFixed(1) + '/10 | ' +
            'Nest Egg: ' + this.fmtUSD(scn.Areq) + '</p>' +
            '<p style="font-size:12px; color:#666;">Saved: ' + (scn.timestamp || 'Unknown') + '</p>' +
            '</div>';
        }
      }

      html += '</div>' +  // close report-container
        '<script>' +
        '(function() {' +
        '  var clientId = "' + clientId + '";' +
        '' +
        '  function showLoading(msg) {' +
        '    var overlay = document.getElementById("loadingOverlay");' +
        '    var text = document.getElementById("loadingText");' +
        '    if (text) text.textContent = msg || "Loading...";' +
        '    if (overlay) overlay.classList.add("active");' +
        '  }' +
        '' +
        '  function hideLoading() {' +
        '    var overlay = document.getElementById("loadingOverlay");' +
        '    if (overlay) overlay.classList.remove("active");' +
        '  }' +
        '' +
        '  window.backToDashboard = function() {' +
        '    showLoading("Loading Dashboard");' +
        '    google.script.run' +
        '      .withSuccessHandler(function(dashboardHtml) {' +
        '        try {' +
        '          sessionStorage.setItem("_ftpCurrentLocation", JSON.stringify({' +
        '            view: "dashboard", toolId: null, page: null,' +
        '            clientId: clientId, timestamp: Date.now()' +
        '          }));' +
        '        } catch(e) {}' +
        '        document.open();' +
        '        document.write(dashboardHtml);' +
        '        document.close();' +
        '        window.scrollTo(0, 0);' +
        '      })' +
        '      .withFailureHandler(function(error) {' +
        '        hideLoading();' +
        '        console.error("Dashboard navigation error:", error);' +
        '        alert("Error loading dashboard: " + error.message);' +
        '      })' +
        '      .getDashboardPage(clientId);' +
        '  };' +
        '' +
        '  // Save report location for refresh recovery' +
        '  try {' +
        '    sessionStorage.setItem("_ftpCurrentLocation", JSON.stringify({' +
        '      view: "report", toolId: "tool8", page: null,' +
        '      clientId: clientId, timestamp: Date.now()' +
        '    }));' +
        '  } catch(e) {}' +
        '' +
        '  // Initialize history manager for back button support' +
        '  if (typeof initHistoryManager === "function") {' +
        '    initHistoryManager(clientId, "' + ScriptApp.getService().getUrl() + '");' +
        '  }' +
        '})();' +
        '</script>' +
        '</body></html>';

      return HtmlService.createHtmlOutput(html)
        .setTitle('Investment Planning Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      Logger.log('[Tool8Report.render] Error: ' + error);
      return HtmlService.createHtmlOutput('<h1>Error generating report</h1><p>' + error.toString() + '</p>');
    }
  }
};
