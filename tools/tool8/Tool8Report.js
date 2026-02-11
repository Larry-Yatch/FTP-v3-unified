/**
 * Tool8Report.js - PDF Report Generation for Investment Planning Tool
 *
 * Handles single-scenario and comparison PDF reports.
 * Uses PDFGenerator infrastructure (htmlToPDF, buildHeader, buildFooter).
 *
 * Phase 4: Full implementation of scenario reports + comparison reports.
 * Phase 7: Will add action barriers and trauma-informed insights.
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
      '.recommendation strong { color: #1e40af; }'
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
   * Generate PDF for a single investment scenario
   * @param {string} clientId - Client ID
   * @param {Object} scenario - Scenario data from calculator
   * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
   */
  generatePDF(clientId, scenario) {
    try {
      Logger.log('[Tool8Report.generatePDF] Called for client ' + clientId);

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

      var footer = PDFGenerator.buildFooter(
        'This projection uses conservative assumptions including deployment drag. ' +
        'Actual returns will vary. Consult with a financial advisor before making investment decisions.'
      );

      // Combine all sections
      var bodyContent = header + intro + modeSection + inputSection + resultsSection + feasSection + advSection + footer;
      var htmlContent = PDFGenerator.buildHTMLDocument(styles, bodyContent);
      var fileName = PDFGenerator.generateFileName('InvestmentPlanning', studentName);

      return PDFGenerator.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log('[Tool8Report.generatePDF] Error: ' + error);
      Logger.log('[Tool8Report.generatePDF] Stack: ' + error.stack);
      return { success: false, error: error.toString() };
    }
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

      // Recommendation
      var recommendation = this.buildComparisonRecommendation(s1, s2, f1, f2);

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

      var bodyContent = header + intro + overviewSection + compTable + feasCompSection + recommendation + advSection + footer;
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

      var html = '<!DOCTYPE html>' +
        '<html><head><meta charset="utf-8"><title>Investment Planning Report</title>' +
        '<style>' +
        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 40px; }' +
        'h1 { color: #ad9168; }' +
        '.card { background: rgba(20,15,35,0.9); border: 1px solid rgba(173,145,104,0.2); border-radius: 12px; padding: 20px; margin: 12px 0; }' +
        '.btn { appearance: none; border: 2px solid #ad9168; background: transparent; color: #ad9168; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-size: 13px; }' +
        '.btn:hover { background: #ad9168; color: #140f23; }' +
        'p { color: #a0a0a0; }' +
        '</style></head><body>' +
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

      html += '</body></html>';

      return HtmlService.createHtmlOutput(html)
        .setTitle('Investment Planning Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      Logger.log('[Tool8Report.render] Error: ' + error);
      return HtmlService.createHtmlOutput('<h1>Error generating report</h1><p>' + error.toString() + '</p>');
    }
  }
};
