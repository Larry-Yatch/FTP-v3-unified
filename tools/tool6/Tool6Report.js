/**
 * Tool6Report.js
 * PDF report generation for Tool 6: Retirement Blueprint Calculator
 *
 * Generates two types of reports:
 * 1. Single Scenario Report - Full retirement blueprint for one scenario
 * 2. Comparison Report - Side-by-side analysis of two scenarios
 */

const Tool6Report = {

  // ============================================================
  // STYLES
  // ============================================================

  /**
   * Get Tool 6 specific PDF styles
   */
  getReportStyles() {
    return `
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        max-width: 850px;
        margin: 0 auto;
        line-height: 1.6;
        color: #333;
      }

      h1 {
        color: #2d2d44;
        border-bottom: 3px solid #c4a052;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      h2 {
        color: #5b4b8a;
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 8px;
      }

      h3 {
        color: #4b4166;
        margin-top: 20px;
        margin-bottom: 10px;
      }

      p {
        line-height: 1.7;
        color: #444;
        margin: 10px 0;
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
      }

      .header h1 {
        font-size: 28px;
        margin-bottom: 5px;
        border-bottom: none;
      }

      .header .subtitle {
        font-size: 18px;
        color: #5b4b8a;
        margin: 5px 0;
      }

      .header .date {
        font-size: 14px;
        color: #666;
      }

      .profile-card {
        background: linear-gradient(135deg, #2d2d44 0%, #4b4166 100%);
        color: white;
        padding: 25px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
      }

      .profile-card .icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .profile-card .name {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .profile-card .description {
        font-size: 14px;
        opacity: 0.9;
      }

      .summary-grid {
        display: table;
        width: 100%;
        margin: 20px 0;
        border-collapse: collapse;
      }

      .summary-row {
        display: table-row;
      }

      .summary-label {
        display: table-cell;
        padding: 12px 15px;
        background: #f5f5f5;
        font-weight: 600;
        width: 40%;
        border: 1px solid #e0e0e0;
      }

      .summary-value {
        display: table-cell;
        padding: 12px 15px;
        border: 1px solid #e0e0e0;
      }

      .allocation-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }

      .allocation-table th {
        background: #5b4b8a;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
      }

      .allocation-table td {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
      }

      .allocation-table tr:nth-child(even) {
        background: #f9f9f9;
      }

      .allocation-table .total-row {
        background: #f0f0f0;
        font-weight: 700;
      }

      .section-box {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #5b4b8a;
        margin: 20px 0;
        page-break-inside: avoid;
      }

      .insight-box {
        background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #c4a052;
        margin: 20px 0;
        page-break-inside: avoid;
      }

      .focus-box {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #4caf50;
        margin: 20px 0;
        page-break-inside: avoid;
      }

      .projection-card {
        background: white;
        border: 2px solid #5b4b8a;
        border-radius: 10px;
        padding: 20px;
        margin: 15px 0;
        text-align: center;
        page-break-inside: avoid;
      }

      .projection-card .value {
        font-size: 32px;
        font-weight: 700;
        color: #5b4b8a;
        margin: 10px 0;
      }

      .projection-card .label {
        font-size: 14px;
        color: #666;
      }

      .projection-card .sublabel {
        font-size: 12px;
        color: #888;
        margin-top: 5px;
      }

      .tax-bar {
        height: 30px;
        border-radius: 15px;
        overflow: hidden;
        display: flex;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .tax-segment-roth {
        background: #4caf50;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
      }

      .tax-segment-traditional {
        background: #2196f3;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
      }

      .tax-segment-taxable {
        background: #9e9e9e;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
      }

      .tax-legend {
        display: flex;
        justify-content: space-around;
        margin: 10px 0 20px 0;
        font-size: 13px;
      }

      .tax-legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tax-legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .observation-list {
        margin: 15px 0;
      }

      .observation-item {
        background: #f9f9f9;
        padding: 15px;
        margin: 10px 0;
        border-left: 3px solid #5b4b8a;
        border-radius: 0 5px 5px 0;
      }

      .observation-number {
        display: inline-block;
        width: 24px;
        height: 24px;
        background: #5b4b8a;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        font-size: 12px;
        font-weight: 700;
        margin-right: 10px;
      }

      .action-section {
        margin: 20px 0;
      }

      .action-group {
        margin: 15px 0;
      }

      .action-group h4 {
        color: #5b4b8a;
        margin-bottom: 10px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .action-item {
        display: flex;
        align-items: flex-start;
        margin: 8px 0;
        padding-left: 20px;
      }

      .action-checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid #5b4b8a;
        border-radius: 3px;
        margin-right: 10px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }

      .comparison-table th {
        background: #5b4b8a;
        color: white;
        padding: 12px;
        text-align: center;
      }

      .comparison-table td {
        padding: 12px;
        border: 1px solid #e0e0e0;
        text-align: center;
      }

      .comparison-table .metric-label {
        text-align: left;
        font-weight: 600;
        background: #f5f5f5;
      }

      .comparison-table .diff-positive {
        color: #4caf50;
        font-weight: 600;
      }

      .comparison-table .diff-negative {
        color: #f44336;
        font-weight: 600;
      }

      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #c4a052;
        font-size: 12px;
        color: #666;
        page-break-inside: avoid;
      }

      .footer .disclaimer {
        font-style: italic;
        margin-bottom: 15px;
      }

      .source-note {
        font-size: 11px;
        color: #888;
        font-style: italic;
        margin-top: 10px;
      }

      @media print {
        body { padding: 20px; }
        .page-break { page-break-before: always; }
      }
    `;
  },

  // ============================================================
  // SINGLE SCENARIO REPORT
  // ============================================================

  /**
   * Generate complete HTML for Single Scenario Report
   *
   * @param {Object} params - Report parameters
   * @returns {string} Complete HTML document
   */
  generateSingleReportHTML(params) {
    const {
      clientName,
      profile,
      allocation,
      projections,
      inputs,
      gptInsights
    } = params;

    const styles = this.getReportStyles();
    const bodyContent = [
      this.buildHeader(clientName, 'Retirement Blueprint Report'),
      this.buildProfileSection(profile),
      this.buildExecutiveSummary(profile, inputs, projections),
      this.buildAllocationSection(allocation, inputs),
      this.buildGPTSection(gptInsights),
      this.buildProjectionsSection(projections, inputs),
      this.buildEducationSection(projections, inputs),
      this.buildImplementationSection(gptInsights),
      this.buildFooter(gptInsights?.source)
    ].join('\n');

    return this.buildHTMLDocument(styles, bodyContent);
  },

  /**
   * Build report header
   */
  buildHeader(clientName, reportTitle) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="header">
        <h1>TruPath Financial</h1>
        <div class="subtitle">${reportTitle}</div>
        <p style="font-weight: 600; margin: 10px 0;">${clientName || 'Client'}</p>
        <div class="date">${date}</div>
      </div>
    `;
  },

  /**
   * Build profile classification section
   */
  buildProfileSection(profile) {
    if (!profile) return '';

    return `
      <div class="profile-card">
        <div class="icon">${profile.icon || '📊'}</div>
        <div class="name">${profile.name || 'Retirement Strategist'}</div>
        <div class="description">${profile.description || ''}</div>
      </div>
    `;
  },

  /**
   * Build executive summary section
   */
  buildExecutiveSummary(profile, inputs, projections) {
    const age = inputs?.age || 40;
    const yearsToRetirement = inputs?.yearsToRetirement || 25;
    const monthlyBudget = inputs?.monthlyBudget || 0;
    const income = inputs?.income || 0;
    const investmentScore = inputs?.investmentScore || 4;
    const taxPreference = inputs?.taxPreference || 'Balanced';

    const investmentLabels = {
      1: 'Very Conservative', 2: 'Conservative', 3: 'Moderately Conservative',
      4: 'Moderate', 5: 'Moderately Aggressive', 6: 'Aggressive', 7: 'Very Aggressive'
    };

    const savingsRate = income > 0 ? Math.round((monthlyBudget * 12 / income) * 100) : 0;

    return `
      <h2>Executive Summary</h2>
      <div class="summary-grid">
        <div class="summary-row">
          <div class="summary-label">Investor Profile</div>
          <div class="summary-value">${profile?.name || 'Foundation Builder'}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Current Age</div>
          <div class="summary-value">${age}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Years to Retirement</div>
          <div class="summary-value">${yearsToRetirement}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Monthly Retirement Budget</div>
          <div class="summary-value">$${monthlyBudget.toLocaleString()}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Annual Retirement Savings</div>
          <div class="summary-value">$${(monthlyBudget * 12).toLocaleString()} (${savingsRate}% of income)</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Investment Risk Tolerance</div>
          <div class="summary-value">${investmentScore}/7 - ${investmentLabels[investmentScore] || 'Moderate'}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Tax Strategy</div>
          <div class="summary-value">${taxPreference}</div>
        </div>
      </div>
    `;
  },

  /**
   * Build allocation table section
   */
  buildAllocationSection(allocation, inputs) {
    if (!allocation || Object.keys(allocation).length === 0) {
      return '<h2>Vehicle Allocation</h2><p>No allocation data available.</p>';
    }

    // Filter out zero allocations and sort by amount
    const vehicles = Object.entries(allocation)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);

    if (vehicles.length === 0) {
      return '<h2>Vehicle Allocation</h2><p>No allocations in this scenario.</p>';
    }

    const totalMonthly = vehicles.reduce((sum, [_, amount]) => sum + amount, 0);
    const monthlyBudget = inputs?.monthlyBudget || totalMonthly;

    let tableRows = vehicles.map(([vehicle, monthly]) => {
      const annual = monthly * 12;
      const pct = monthlyBudget > 0 ? Math.round((monthly / monthlyBudget) * 100) : 0;
      return `
        <tr>
          <td>${vehicle}</td>
          <td style="text-align: right;">$${monthly.toLocaleString()}</td>
          <td style="text-align: right;">$${annual.toLocaleString()}</td>
          <td style="text-align: right;">${pct}%</td>
        </tr>
      `;
    }).join('');

    // Add total row
    tableRows += `
      <tr class="total-row">
        <td>Total</td>
        <td style="text-align: right;">$${totalMonthly.toLocaleString()}</td>
        <td style="text-align: right;">$${(totalMonthly * 12).toLocaleString()}</td>
        <td style="text-align: right;">100%</td>
      </tr>
    `;

    return `
      <h2>Your Vehicle Allocation</h2>
      <p>Your retirement savings are distributed across the following vehicles based on your profile, priorities, and tax preferences:</p>
      <table class="allocation-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th style="text-align: right;">Monthly</th>
            <th style="text-align: right;">Annual</th>
            <th style="text-align: right;">% of Budget</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  },

  /**
   * Build GPT insights section
   */
  buildGPTSection(gptInsights) {
    if (!gptInsights) return '';

    let html = '<div class="page-break"></div><h2>Personalized Analysis</h2>';

    // Overview
    if (gptInsights.overview) {
      html += `
        <div class="insight-box">
          <h3>Overview</h3>
          <p>${gptInsights.overview}</p>
        </div>
      `;
    }

    // Key Observations
    if (gptInsights.keyObservations && gptInsights.keyObservations.length > 0) {
      html += `
        <h3>Key Observations</h3>
        <div class="observation-list">
          ${gptInsights.keyObservations.map((obs, idx) => `
            <div class="observation-item">
              <span class="observation-number">${idx + 1}</span>
              ${obs}
            </div>
          `).join('')}
        </div>
      `;
    }

    // Focus Area
    if (gptInsights.focus) {
      html += `
        <div class="focus-box">
          <h3>Your Primary Focus</h3>
          <p>${gptInsights.focus}</p>
        </div>
      `;
    }

    return html;
  },

  /**
   * Build projections section
   */
  buildProjectionsSection(projections, inputs) {
    if (!projections) return '';

    const projectedBalance = projections.projectedBalance || 0;
    const inflationAdjusted = projections.inflationAdjusted || 0;
    const monthlyRetirementIncome = projections.monthlyRetirementIncome || 0;
    const taxFreePercent = projections.taxFreePercent || 0;
    const traditionalPercent = projections.traditionalPercent || 0;
    const taxablePercent = projections.taxablePercent || 0;

    const retirementAge = (inputs?.age || 40) + (inputs?.yearsToRetirement || 25);
    const investmentScore = inputs?.investmentScore || 4;
    const returnRate = this.getReturnRate(investmentScore);

    let html = `
      <h2>Retirement Projections</h2>
      <div class="section-box">
        <p><strong>Assumptions:</strong> ${inputs?.yearsToRetirement || 25} years to retirement, ${returnRate}% average annual return (based on investment score ${investmentScore}/7), 2.5% inflation adjustment.</p>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
        <div class="projection-card" style="flex: 1; min-width: 200px;">
          <div class="label">Projected Balance at ${retirementAge}</div>
          <div class="value">$${projectedBalance.toLocaleString()}</div>
          <div class="sublabel">Nominal value</div>
        </div>

        <div class="projection-card" style="flex: 1; min-width: 200px;">
          <div class="label">Inflation-Adjusted Value</div>
          <div class="value">$${inflationAdjusted.toLocaleString()}</div>
          <div class="sublabel">In today's dollars</div>
        </div>

        <div class="projection-card" style="flex: 1; min-width: 200px;">
          <div class="label">Monthly Retirement Income</div>
          <div class="value">$${monthlyRetirementIncome.toLocaleString()}</div>
          <div class="sublabel">Based on 4% withdrawal rule</div>
        </div>
      </div>

      <h3>Tax Diversification</h3>
      <p>Your retirement assets are distributed across different tax treatments:</p>

      <div class="tax-bar">
        ${taxFreePercent > 0 ? `<div class="tax-segment-roth" style="width: ${taxFreePercent}%">${taxFreePercent > 10 ? Math.round(taxFreePercent) + '%' : ''}</div>` : ''}
        ${traditionalPercent > 0 ? `<div class="tax-segment-traditional" style="width: ${traditionalPercent}%">${traditionalPercent > 10 ? Math.round(traditionalPercent) + '%' : ''}</div>` : ''}
        ${taxablePercent > 0 ? `<div class="tax-segment-taxable" style="width: ${taxablePercent}%">${taxablePercent > 10 ? Math.round(taxablePercent) + '%' : ''}</div>` : ''}
      </div>

      <div class="tax-legend">
        <div class="tax-legend-item">
          <div class="tax-legend-dot" style="background: #4caf50;"></div>
          <span>Tax-Free (Roth): ${Math.round(taxFreePercent)}%</span>
        </div>
        <div class="tax-legend-item">
          <div class="tax-legend-dot" style="background: #2196f3;"></div>
          <span>Tax-Deferred (Traditional): ${Math.round(traditionalPercent)}%</span>
        </div>
        <div class="tax-legend-item">
          <div class="tax-legend-dot" style="background: #9e9e9e;"></div>
          <span>Taxable: ${Math.round(taxablePercent)}%</span>
        </div>
      </div>
    `;

    // Tax insight message
    if (taxFreePercent >= 50) {
      html += `<p><strong>Tax Insight:</strong> With ${Math.round(taxFreePercent)}% in tax-free accounts, you will have significant flexibility and tax-free income in retirement.</p>`;
    } else if (taxFreePercent >= 25) {
      html += `<p><strong>Tax Insight:</strong> Your balanced tax diversification provides flexibility to manage taxable income in retirement.</p>`;
    } else {
      html += `<p><strong>Tax Insight:</strong> Most of your retirement income will be taxable. Consider Roth conversions before retirement to increase tax-free assets.</p>`;
    }

    return html;
  },

  /**
   * Build education section (conditional)
   */
  buildEducationSection(projections, inputs) {
    if (!inputs?.hasChildren || !projections?.educationProjection) {
      return '';
    }

    const eduProj = projections.educationProjection;

    return `
      <h2>Education Planning</h2>
      <div class="section-box">
        <p><strong>Children:</strong> ${inputs.numChildren || 1}</p>
        <p><strong>Years to Education:</strong> ${inputs.yearsToEducation || 18}</p>
        <p><strong>Education Vehicle:</strong> ${inputs.educationVehicle || '529 Plan'}</p>
        <p><strong>Projected Education Fund:</strong> $${(eduProj.projectedBalance || 0).toLocaleString()}</p>
      </div>
    `;
  },

  /**
   * Build implementation steps section
   */
  buildImplementationSection(gptInsights) {
    if (!gptInsights?.implementationSteps) return '';

    const steps = gptInsights.implementationSteps;

    return `
      <div class="page-break"></div>
      <h2>Your Implementation Roadmap</h2>

      <div class="action-section">
        <div class="action-group">
          <h4>This Week</h4>
          ${(steps.thisWeek || ['Review your current contribution rates']).map(action => `
            <div class="action-item">
              <div class="action-checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>

        <div class="action-group">
          <h4>Within 30 Days</h4>
          ${(steps.thirtyDays || ['Implement vehicle allocation changes']).map(action => `
            <div class="action-item">
              <div class="action-checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Build footer
   */
  buildFooter(source) {
    const date = new Date().toLocaleDateString();

    let sourceNote = '';
    if (source === 'gpt') {
      sourceNote = 'Analysis generated using AI-powered insights.';
    } else if (source === 'gpt_retry') {
      sourceNote = 'Analysis generated using AI-powered insights (retry).';
    } else if (source === 'fallback') {
      sourceNote = 'Analysis generated using profile-based templates.';
    }

    return `
      <div class="footer">
        <p class="disclaimer">This report is for educational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor before making investment decisions. Projections are estimates based on assumed returns and do not guarantee future results.</p>
        <p><strong>TruPath Financial</strong></p>
        <p>Generated: ${date}</p>
        ${sourceNote ? `<p class="source-note">${sourceNote}</p>` : ''}
      </div>
    `;
  },

  // ============================================================
  // COMPARISON REPORT
  // ============================================================

  /**
   * Generate complete HTML for Comparison Report
   *
   * @param {Object} params - Report parameters
   * @returns {string} Complete HTML document
   */
  generateComparisonReportHTML(params) {
    const {
      clientName,
      scenario1,
      scenario2,
      gptInsights
    } = params;

    const styles = this.getReportStyles();
    const bodyContent = [
      this.buildHeader(clientName, 'Scenario Comparison Report'),
      this.buildScenarioCards(scenario1, scenario2),
      this.buildComparisonTable(scenario1, scenario2),
      this.buildProjectionComparison(scenario1, scenario2),
      this.buildComparisonGPTSection(gptInsights),
      this.buildFooter(gptInsights?.source)
    ].join('\n');

    return this.buildHTMLDocument(styles, bodyContent);
  },

  /**
   * Build scenario cards for comparison
   */
  buildScenarioCards(scenario1, scenario2) {
    return `
      <h2>Scenarios Being Compared</h2>
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div class="section-box" style="flex: 1; min-width: 250px;">
          <h3>${scenario1?.name || 'Scenario A'}</h3>
          <p><strong>Profile:</strong> ${scenario1?.profileName || 'Not specified'}</p>
          <p><strong>Monthly Budget:</strong> $${(scenario1?.monthlyBudget || 0).toLocaleString()}</p>
          <p><strong>Tax Strategy:</strong> ${scenario1?.taxPreference || 'Balanced'}</p>
        </div>
        <div class="section-box" style="flex: 1; min-width: 250px;">
          <h3>${scenario2?.name || 'Scenario B'}</h3>
          <p><strong>Profile:</strong> ${scenario2?.profileName || 'Not specified'}</p>
          <p><strong>Monthly Budget:</strong> $${(scenario2?.monthlyBudget || 0).toLocaleString()}</p>
          <p><strong>Tax Strategy:</strong> ${scenario2?.taxPreference || 'Balanced'}</p>
        </div>
      </div>
    `;
  },

  /**
   * Build comparison table for allocations
   */
  buildComparisonTable(scenario1, scenario2) {
    const alloc1 = scenario1?.allocation || {};
    const alloc2 = scenario2?.allocation || {};

    // Get all unique vehicles
    const allVehicles = [...new Set([...Object.keys(alloc1), ...Object.keys(alloc2)])];

    if (allVehicles.length === 0) {
      return '<h2>Allocation Comparison</h2><p>No allocation data available.</p>';
    }

    const rows = allVehicles
      .filter(v => (alloc1[v] || 0) > 0 || (alloc2[v] || 0) > 0)
      .map(vehicle => {
        const val1 = alloc1[vehicle] || 0;
        const val2 = alloc2[vehicle] || 0;
        const diff = val2 - val1;
        const diffClass = diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : '';
        const diffStr = diff > 0 ? `+$${diff.toLocaleString()}` : diff < 0 ? `-$${Math.abs(diff).toLocaleString()}` : '-';

        return `
          <tr>
            <td class="metric-label">${vehicle}</td>
            <td>$${val1.toLocaleString()}</td>
            <td>$${val2.toLocaleString()}</td>
            <td class="${diffClass}">${diffStr}</td>
          </tr>
        `;
      }).join('');

    return `
      <h2>Allocation Comparison</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>${scenario1?.name || 'Scenario A'}</th>
            <th>${scenario2?.name || 'Scenario B'}</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  },

  /**
   * Build projection comparison
   */
  buildProjectionComparison(scenario1, scenario2) {
    const metrics = [
      { label: 'Projected Balance', key: 'projectedBalance', format: 'currency' },
      { label: 'Inflation-Adjusted Value', key: 'inflationAdjusted', format: 'currency' },
      { label: 'Monthly Retirement Income', key: 'monthlyRetirementIncome', format: 'currency' },
      { label: 'Tax-Free Percentage', key: 'taxFreePercent', format: 'percent' }
    ];

    const rows = metrics.map(m => {
      const val1 = scenario1?.[m.key] || 0;
      const val2 = scenario2?.[m.key] || 0;
      const diff = val2 - val1;
      const diffClass = diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : '';

      let val1Str, val2Str, diffStr;
      if (m.format === 'currency') {
        val1Str = `$${val1.toLocaleString()}`;
        val2Str = `$${val2.toLocaleString()}`;
        diffStr = diff > 0 ? `+$${diff.toLocaleString()}` : diff < 0 ? `-$${Math.abs(diff).toLocaleString()}` : '-';
      } else {
        val1Str = `${Math.round(val1)}%`;
        val2Str = `${Math.round(val2)}%`;
        diffStr = diff > 0 ? `+${Math.round(diff)}%` : diff < 0 ? `${Math.round(diff)}%` : '-';
      }

      return `
        <tr>
          <td class="metric-label">${m.label}</td>
          <td>${val1Str}</td>
          <td>${val2Str}</td>
          <td class="${diffClass}">${diffStr}</td>
        </tr>
      `;
    }).join('');

    return `
      <h2>Projection Comparison</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>${scenario1?.name || 'Scenario A'}</th>
            <th>${scenario2?.name || 'Scenario B'}</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  },

  /**
   * Build GPT section for comparison report
   */
  buildComparisonGPTSection(gptInsights) {
    if (!gptInsights) return '';

    let html = '<div class="page-break"></div><h2>Analysis</h2>';

    // Synthesis
    if (gptInsights.synthesis) {
      html += `
        <div class="insight-box">
          <h3>What Changed</h3>
          <p>${gptInsights.synthesis}</p>
        </div>
      `;
    }

    // Decision Guidance
    if (gptInsights.decisionGuidance) {
      html += `
        <div class="focus-box">
          <h3>Decision Guidance</h3>
          <p>${gptInsights.decisionGuidance}</p>
        </div>
      `;
    }

    // Trade-offs
    if (gptInsights.tradeoffs && gptInsights.tradeoffs.length > 0) {
      html += `
        <h3>Key Trade-offs to Consider</h3>
        <div class="observation-list">
          ${gptInsights.tradeoffs.map((tradeoff, idx) => `
            <div class="observation-item">
              <span class="observation-number">${idx + 1}</span>
              ${tradeoff}
            </div>
          `).join('')}
        </div>
      `;
    }

    return html;
  },

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Build complete HTML document
   */
  buildHTMLDocument(styles, bodyContent) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>${styles}</style>
      </head>
      <body>
        ${bodyContent}
      </body>
      </html>
    `;
  },

  /**
   * Get return rate from investment score
   */
  getReturnRate(score) {
    const rates = { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16, 6: 18, 7: 20 };
    return rates[score] || 14;
  },

  /**
   * Generate filename for PDF
   */
  generateFileName(clientName, reportType) {
    const sanitizedName = (clientName || 'Client').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const typeStr = reportType === 'comparison' ? 'Comparison' : 'Blueprint';
    return `TruPath_Retirement${typeStr}_${sanitizedName}_${date}.pdf`;
  }
};
