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

      /* ============================================================
         SPRINT 13: IMPLEMENTATION BLUEPRINT STYLES
         ============================================================ */

      /* Dashboard KPI Cards */
      .dashboard-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin: 20px 0;
      }

      .kpi-card {
        flex: 1;
        min-width: 140px;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 15px;
        text-align: center;
      }

      .kpi-card.status-good {
        border-color: #4caf50;
        background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
      }

      .kpi-card.status-warning {
        border-color: #ff9800;
        background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%);
      }

      .kpi-card.status-alert {
        border-color: #f44336;
        background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
      }

      .kpi-card .kpi-value {
        font-size: 28px;
        font-weight: 700;
        color: #2d2d44;
        margin: 5px 0;
      }

      .kpi-card .kpi-label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .kpi-card .kpi-status {
        font-size: 11px;
        margin-top: 5px;
        font-weight: 600;
      }

      .kpi-card.status-good .kpi-status { color: #2e7d32; }
      .kpi-card.status-warning .kpi-status { color: #ef6c00; }
      .kpi-card.status-alert .kpi-status { color: #c62828; }

      /* Vehicle Implementation Cards */
      .vehicle-impl-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 20px 0;
      }

      .vehicle-impl-card {
        background: white;
        border: 2px solid #5b4b8a;
        border-radius: 12px;
        overflow: hidden;
        page-break-inside: avoid;
      }

      .vehicle-impl-header {
        background: linear-gradient(135deg, #5b4b8a 0%, #4b4166 100%);
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .vehicle-impl-header .vehicle-name {
        font-size: 18px;
        font-weight: 700;
      }

      .vehicle-impl-header .vehicle-amount {
        font-size: 16px;
        opacity: 0.95;
      }

      .vehicle-impl-body {
        padding: 20px;
      }

      .vehicle-impl-row {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;
      }

      .vehicle-impl-row .label {
        width: 120px;
        font-weight: 600;
        color: #555;
        flex-shrink: 0;
      }

      .vehicle-impl-row .value {
        flex: 1;
        color: #333;
      }

      .setup-checklist {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 15px;
        margin-top: 15px;
      }

      .setup-checklist h5 {
        margin: 0 0 12px 0;
        color: #5b4b8a;
        font-size: 14px;
      }

      .setup-step {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .setup-step .checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid #5b4b8a;
        border-radius: 3px;
        margin-right: 10px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .vehicle-warning {
        background: #fff3e0;
        border-left: 4px solid #ff9800;
        padding: 10px 15px;
        margin-top: 15px;
        font-size: 13px;
        color: #e65100;
        border-radius: 0 4px 4px 0;
      }

      /* Milestone Timeline */
      .milestone-timeline {
        margin: 20px 0;
      }

      .milestone-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .milestone-table th {
        background: #5b4b8a;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
      }

      .milestone-table td {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
        vertical-align: top;
      }

      .milestone-table tr:nth-child(even) {
        background: #f9f9f9;
      }

      .milestone-table .age-cell {
        font-weight: 700;
        color: #5b4b8a;
        font-size: 16px;
      }

      .milestone-table .balance-cell {
        font-weight: 600;
        color: #2d2d44;
      }

      .milestone-table .event-cell {
        font-size: 13px;
        color: #555;
      }

      .milestone-current {
        background: #e8f5e9 !important;
        border-left: 4px solid #4caf50;
      }

      /* Financial Calendar */
      .calendar-section {
        margin: 20px 0;
      }

      .calendar-item {
        display: flex;
        margin-bottom: 15px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 8px;
        border-left: 4px solid #5b4b8a;
      }

      .calendar-date {
        width: 100px;
        flex-shrink: 0;
        font-weight: 700;
        color: #5b4b8a;
        font-size: 14px;
      }

      .calendar-details {
        flex: 1;
      }

      .calendar-event {
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
      }

      .calendar-action {
        font-size: 13px;
        color: #666;
      }

      .calendar-item.priority-high {
        border-left-color: #f44336;
        background: #ffebee;
      }

      /* Gap Analysis */
      .gap-analysis {
        margin: 20px 0;
      }

      .benchmark-meter {
        height: 25px;
        background: #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        margin: 15px 0;
        position: relative;
      }

      .benchmark-fill {
        height: 100%;
        background: linear-gradient(90deg, #4caf50, #8bc34a);
        border-radius: 12px;
        transition: width 0.3s ease;
      }

      .benchmark-fill.behind {
        background: linear-gradient(90deg, #ff9800, #ffc107);
      }

      .benchmark-fill.far-behind {
        background: linear-gradient(90deg, #f44336, #ff5722);
      }

      .benchmark-target {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #2d2d44;
        border-radius: 3px;
      }

      .benchmark-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }

      .catch-up-box {
        background: linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%);
        border-left: 4px solid #2196f3;
        padding: 15px 20px;
        border-radius: 0 8px 8px 0;
        margin: 15px 0;
      }

      .catch-up-box .amount {
        font-size: 24px;
        font-weight: 700;
        color: #1565c0;
      }

      .catch-up-box .description {
        font-size: 14px;
        color: #555;
        margin-top: 5px;
      }

      /* Enhanced Roadmap - 5 Tier */
      .roadmap-tier {
        margin-bottom: 25px;
        page-break-inside: avoid;
      }

      .roadmap-tier h4 {
        background: #5b4b8a;
        color: white;
        padding: 10px 15px;
        margin: 0;
        border-radius: 8px 8px 0 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .roadmap-tier.tier-immediate h4 { background: #c62828; }
      .roadmap-tier.tier-week1 h4 { background: #ef6c00; }
      .roadmap-tier.tier-month1 h4 { background: #2196f3; }
      .roadmap-tier.tier-quarterly h4 { background: #7b1fa2; }
      .roadmap-tier.tier-annual h4 { background: #00695c; }

      .roadmap-actions {
        background: #f9f9f9;
        border: 1px solid #e0e0e0;
        border-top: none;
        border-radius: 0 0 8px 8px;
        padding: 15px;
      }

      .roadmap-action {
        display: flex;
        align-items: flex-start;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .roadmap-action:last-child {
        margin-bottom: 0;
      }

      .roadmap-action .checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid #5b4b8a;
        border-radius: 3px;
        margin-right: 12px;
        flex-shrink: 0;
        margin-top: 1px;
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
      gptInsights,
      enhancedInsights  // Sprint 13: GPT-generated implementation guidance
    } = params;

    const styles = this.getReportStyles();
    const bodyContent = [
      this.buildHeader(clientName, 'Retirement Blueprint Report'),
      this.buildProfileSection(profile),
      // Sprint 13: Dashboard at top for quick snapshot
      this.buildDashboardSection(inputs, projections, allocation),
      this.buildExecutiveSummary(profile, inputs, projections),
      this.buildAllocationSection(allocation, inputs),
      this.buildGPTSection(gptInsights),
      this.buildProjectionsSection(projections, inputs),
      // Sprint 13: Gap Analysis - how they compare to benchmarks
      this.buildGapAnalysisSection(inputs, projections, enhancedInsights),
      this.buildEducationSection(projections, inputs),
      // Sprint 13: Milestone Timeline - balance at key ages
      this.buildMilestoneSection(inputs, projections, enhancedInsights),
      // Sprint 13: Vehicle Implementation Cards - setup instructions
      this.buildVehicleImplementationCards(allocation, inputs, enhancedInsights),
      // Sprint 13: Financial Calendar - key deadlines
      this.buildCalendarSection(allocation, inputs, enhancedInsights),
      // Sprint 13: Enhanced 5-Tier Roadmap
      this.buildEnhancedRoadmapSection(allocation, inputs, gptInsights, enhancedInsights),
      this.buildFooter(gptInsights?.source || enhancedInsights?.source)
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
      // Sprint 13: Normalize vehicle name for display
      const displayName = this.normalizeVehicleName(vehicle);
      return `
        <tr>
          <td>${displayName}</td>
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
   * Validates education projection data before rendering
   */
  buildEducationSection(projections, inputs) {
    // Skip if no children or no education projection data
    if (!inputs?.hasChildren || !projections?.educationProjection) {
      return '';
    }

    const eduProj = projections.educationProjection;

    // Validate educationProjection is an object with expected properties
    // It could be a number (old format) or an object (new format)
    let projectedBalance = 0;
    if (typeof eduProj === 'object' && eduProj !== null) {
      projectedBalance = eduProj.projectedBalance || eduProj.balance || 0;
    } else if (typeof eduProj === 'number') {
      projectedBalance = eduProj;
    }

    // Skip section if projected balance is 0 or invalid
    if (!projectedBalance || projectedBalance <= 0) {
      return '';
    }

    return `
      <h2>Education Planning</h2>
      <div class="section-box">
        <p><strong>Children:</strong> ${inputs.numChildren || 1}</p>
        <p><strong>Years to Education:</strong> ${inputs.yearsToEducation || 18}</p>
        <p><strong>Education Vehicle:</strong> ${inputs.educationVehicle || '529 Plan'}</p>
        <p><strong>Projected Education Fund:</strong> $${projectedBalance.toLocaleString()}</p>
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
  // SPRINT 13: IMPLEMENTATION BLUEPRINT SECTIONS
  // ============================================================

  /**
   * Build executive dashboard with KPI cards
   * Shows critical numbers at a glance with status indicators
   */
  buildDashboardSection(inputs, projections, allocation) {
    const income = inputs?.income || inputs?.grossIncome || 0;
    const monthlyBudget = inputs?.monthlyBudget || 0;
    const savingsRate = income > 0 ? (monthlyBudget * 12 / income) : 0;
    const yearsToRetirement = inputs?.yearsToRetirement || 25;
    const age = inputs?.age || 40;

    // Calculate tax efficiency (% in Roth/HSA)
    let rothHSAAmount = 0;
    let totalAmount = 0;
    if (allocation) {
      Object.entries(allocation).forEach(([vehicle, amount]) => {
        if (amount > 0) {
          totalAmount += amount;
          if (vehicle.includes('Roth') || vehicle.includes('HSA')) {
            rothHSAAmount += amount;
          }
        }
      });
    }
    const taxEfficiency = totalAmount > 0 ? (rothHSAAmount / totalAmount) : 0;

    // Catch-up eligibility
    const yearsToIRACatchUp = Math.max(0, 50 - age);
    const yearsToHSACatchUp = Math.max(0, 55 - age);
    const catchUpStatus = age >= 50 ? 'Currently Eligible' :
                          yearsToIRACatchUp <= 5 ? `${yearsToIRACatchUp} years away` :
                          `${yearsToIRACatchUp} years`;

    // Status logic
    const savingsStatus = savingsRate >= 0.15 ? 'good' : savingsRate >= 0.10 ? 'warning' : 'alert';
    const taxStatus = taxEfficiency >= 0.50 ? 'good' : taxEfficiency >= 0.30 ? 'warning' : 'alert';

    return `
      <h2>Your Financial Snapshot</h2>
      <div class="dashboard-grid">
        <div class="kpi-card status-${savingsStatus}">
          <div class="kpi-label">Savings Rate</div>
          <div class="kpi-value">${Math.round(savingsRate * 100)}%</div>
          <div class="kpi-status">${savingsRate >= 0.15 ? 'On Track' : savingsRate >= 0.10 ? 'Room to Grow' : 'Needs Attention'}</div>
        </div>

        <div class="kpi-card status-${taxStatus}">
          <div class="kpi-label">Tax-Free %</div>
          <div class="kpi-value">${Math.round(taxEfficiency * 100)}%</div>
          <div class="kpi-status">${taxEfficiency >= 0.50 ? 'Well Diversified' : 'Build Roth/HSA'}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Years to Goal</div>
          <div class="kpi-value">${yearsToRetirement}</div>
          <div class="kpi-status">Age ${age + yearsToRetirement}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Catch-Up Status</div>
          <div class="kpi-value" style="font-size: 18px;">${catchUpStatus}</div>
          <div class="kpi-status">${age >= 50 ? 'Add extra $' : 'Plan ahead'}</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Monthly Budget</div>
          <div class="kpi-value" style="font-size: 22px;">$${monthlyBudget.toLocaleString()}</div>
          <div class="kpi-status">$${(monthlyBudget * 12).toLocaleString()}/year</div>
        </div>
      </div>
    `;
  },

  /**
   * Build vehicle implementation cards with setup instructions
   * Each vehicle gets detailed steps, provider info, and deadlines
   */
  buildVehicleImplementationCards(allocation, inputs, enhancedInsights) {
    if (!allocation || Object.keys(allocation).length === 0) {
      return '';
    }

    // Filter and sort vehicles by amount
    const vehicles = Object.entries(allocation)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);

    if (vehicles.length === 0) return '';

    const age = inputs?.age || 40;

    let html = '<div class="page-break"></div><h2>How to Set Up Each Account</h2>';
    html += '<p style="color: #666; margin-bottom: 20px;">Follow these steps to implement your allocation. Check off each step as you complete it.</p>';
    html += '<div class="vehicle-impl-grid">';

    vehicles.forEach(([vehicleName, monthlyAmount]) => {
      const annualAmount = monthlyAmount * 12;
      // Sprint 13: Use normalized name for lookup and display
      const displayName = this.normalizeVehicleName(vehicleName);
      const setup = this.getVehicleSetupInstructions(vehicleName);

      // Get annual limit for this vehicle (try both original and normalized names)
      let limitInfo = '';
      const vehicleDef = VEHICLE_DEFINITIONS[vehicleName] || VEHICLE_DEFINITIONS[displayName];
      if (vehicleDef?.annualLimit) {
        let limit = vehicleDef.annualLimit;
        // Add catch-up if eligible
        if (vehicleDef.catchUpAge && age >= vehicleDef.catchUpAge) {
          limit += vehicleDef.catchUpAmount || 0;
          limitInfo = `$${limit.toLocaleString()} (includes catch-up)`;
        } else {
          limitInfo = `$${limit.toLocaleString()}`;
        }
      }

      html += `
        <div class="vehicle-impl-card">
          <div class="vehicle-impl-header">
            <span class="vehicle-name">${displayName}</span>
            <span class="vehicle-amount">$${monthlyAmount.toLocaleString()}/mo ($${annualAmount.toLocaleString()}/yr)</span>
          </div>
          <div class="vehicle-impl-body">
            <div class="vehicle-impl-row">
              <span class="label">Where:</span>
              <span class="value">${setup?.provider || 'Contact your provider'}</span>
            </div>
            ${limitInfo ? `
            <div class="vehicle-impl-row">
              <span class="label">2025 Limit:</span>
              <span class="value">${limitInfo}</span>
            </div>
            ` : ''}
            <div class="vehicle-impl-row">
              <span class="label">Contribution:</span>
              <span class="value">${setup?.autoTransfer || 'Set up recurring transfer'}</span>
            </div>
            <div class="vehicle-impl-row">
              <span class="label">Deadline:</span>
              <span class="value">${setup?.deadline || 'Check with provider'}</span>
            </div>
            <div class="vehicle-impl-row">
              <span class="label">Tax Forms:</span>
              <span class="value">${setup?.taxForms?.join(', ') || 'Varies'}</span>
            </div>

            ${setup?.setupSteps ? `
            <div class="setup-checklist">
              <h5>Setup Steps</h5>
              ${setup.setupSteps.map(step => `
                <div class="setup-step">
                  <div class="checkbox"></div>
                  <span>${step}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${setup?.warning ? `
            <div class="vehicle-warning">
              <strong>Important:</strong> ${setup.warning}
            </div>
            ` : ''}

            ${setup?.note ? `
            <div style="margin-top: 10px; font-size: 13px; color: #666; font-style: italic;">
              Note: ${setup.note}
            </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    html += '</div>';

    // Add personalized GPT guidance if available
    if (enhancedInsights?.vehicleGuidance) {
      html += `
        <div class="insight-box">
          <h3>Personalized Guidance</h3>
          <p>${enhancedInsights.vehicleGuidance}</p>
        </div>
      `;
    }

    return html;
  },

  /**
   * Build milestone projections timeline
   * Shows projected balance at key life stages
   */
  buildMilestoneSection(inputs, projections, enhancedInsights) {
    const age = inputs?.age || 40;
    const yearsToRetirement = inputs?.yearsToRetirement || 25;
    const retirementAge = age + yearsToRetirement;
    const monthlyContribution = inputs?.monthlyBudget || 0;
    const currentBalance = projections?.currentBalance || 0;
    const returnRate = this.getReturnRate(inputs?.investmentScore || 4) / 100;

    // Key milestone ages to show
    const milestoneAges = [50, 55, 59.5, 62, 65, 67, 70].filter(m => m > age && m <= 75);

    // Calculate projected balance at each milestone
    const milestones = milestoneAges.map(milestoneAge => {
      const yearsAway = milestoneAge - age;
      // FV = PV(1+r)^n + PMT * (((1+r)^n - 1) / r)
      const monthlyRate = returnRate / 12;
      const months = yearsAway * 12;
      const fvPrincipal = currentBalance * Math.pow(1 + monthlyRate, months);
      const fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      const balance = fvPrincipal + fvContributions;

      // What happens at this age
      let events = [];
      if (milestoneAge === 50) events.push('IRA/401(k) catch-up begins (+$8,500/yr potential)');
      if (milestoneAge === 55) events.push('HSA catch-up begins (+$1,000/yr)');
      if (milestoneAge === 59.5) events.push('Penalty-free IRA withdrawals');
      if (milestoneAge === 62) events.push('Early Social Security available (reduced)');
      if (milestoneAge === 65) events.push('Medicare eligibility');
      if (milestoneAge === 67) events.push('Full Social Security benefits');
      if (milestoneAge === 70) events.push('Consider RMD planning (begins at 73)');

      return {
        age: milestoneAge,
        yearsAway: Math.round(yearsAway * 10) / 10,
        balance: Math.round(balance),
        events: events.join('; ') || 'Continued growth'
      };
    });

    let html = '<h2>Your Retirement Timeline</h2>';
    html += '<p style="color: #666; margin-bottom: 15px;">Projected balances at key life stages based on your current plan.</p>';
    html += '<div class="milestone-timeline">';
    html += '<table class="milestone-table">';
    html += '<thead><tr><th>Age</th><th>Years Away</th><th>Projected Balance</th><th>What Happens</th></tr></thead>';
    html += '<tbody>';

    milestones.forEach(m => {
      const isRetirement = Math.abs(m.age - retirementAge) < 1;
      html += `
        <tr class="${isRetirement ? 'milestone-current' : ''}">
          <td class="age-cell">${m.age}</td>
          <td>${m.yearsAway}</td>
          <td class="balance-cell">$${m.balance.toLocaleString()}</td>
          <td class="event-cell">${m.events}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';

    // Add personalized milestone insights if available
    if (enhancedInsights?.milestoneInsights) {
      html += `
        <div class="insight-box">
          <h3>What This Means for You</h3>
          <p>${enhancedInsights.milestoneInsights}</p>
        </div>
      `;
    }

    return html;
  },

  /**
   * Build financial calendar section
   * Shows key deadlines based on user's vehicles
   */
  buildCalendarSection(allocation, inputs, enhancedInsights) {
    if (!allocation) return '';

    const userVehicles = Object.keys(allocation).filter(v => allocation[v] > 0);
    const isSelfEmployed = inputs?.workSituation === 'Self-employed' || inputs?.workSituation === 'Both';

    // Filter calendar to relevant deadlines
    const relevantDeadlines = [];

    Object.entries(FINANCIAL_CALENDAR).forEach(([date, info]) => {
      // Check if any user vehicle matches
      const isRelevant = info.vehicles.includes('all') ||
                         (info.vehicles.includes('self-employed') && isSelfEmployed) ||
                         info.vehicles.some(v => userVehicles.some(uv => uv.includes(v) || v.includes(uv)));

      if (isRelevant) {
        relevantDeadlines.push({ date, ...info });
      }
    });

    if (relevantDeadlines.length === 0) return '';

    let html = '<h2>Your Financial Calendar</h2>';
    html += '<p style="color: #666; margin-bottom: 15px;">Key deadlines based on your retirement vehicles.</p>';
    html += '<div class="calendar-section">';

    relevantDeadlines.forEach(deadline => {
      const isPriority = deadline.date === 'April 15' || deadline.date === 'December 31';
      html += `
        <div class="calendar-item ${isPriority ? 'priority-high' : ''}">
          <div class="calendar-date">${deadline.date}</div>
          <div class="calendar-details">
            <div class="calendar-event">${deadline.event}</div>
            <div class="calendar-action">${deadline.action}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';

    // Add personalized calendar reminders if available
    if (enhancedInsights?.calendarReminders) {
      html += `
        <div class="insight-box">
          <h3>Your Priority Deadlines</h3>
          <p>${enhancedInsights.calendarReminders}</p>
        </div>
      `;
    }

    return html;
  },

  /**
   * Build gap analysis and benchmarks section
   * Shows where user stands vs age-appropriate targets
   */
  buildGapAnalysisSection(inputs, projections, enhancedInsights) {
    const age = inputs?.age || 40;
    const income = inputs?.income || inputs?.grossIncome || 0;
    const currentBalance = projections?.currentBalance || 0;
    const monthlyBudget = inputs?.monthlyBudget || 0;

    // Find appropriate benchmark
    const benchmarkAges = [30, 35, 40, 45, 50, 55, 60, 67];
    let targetAge = benchmarkAges.find(a => a >= age) || 67;
    const benchmark = AGE_BENCHMARKS[targetAge];
    const targetBalance = income * (benchmark?.multiple || 3);

    // Calculate progress
    const progress = targetBalance > 0 ? (currentBalance / targetBalance) : 0;
    const progressPct = Math.min(progress * 100, 150); // Cap at 150% for display

    // Determine status
    let statusClass = 'far-behind';
    let statusText = 'Needs Attention';
    if (progress >= 1.0) {
      statusClass = '';
      statusText = 'On Track or Ahead';
    } else if (progress >= 0.75) {
      statusClass = '';
      statusText = 'Nearly There';
    } else if (progress >= 0.5) {
      statusClass = 'behind';
      statusText = 'Building Momentum';
    }

    // Calculate catch-up needed
    const gap = Math.max(0, targetBalance - currentBalance);
    const yearsToTarget = Math.max(1, targetAge - age);
    const additionalMonthlyNeeded = gap > 0 ? Math.round(gap / (yearsToTarget * 12)) : 0;

    // Current savings rate
    const savingsRate = income > 0 ? (monthlyBudget * 12 / income) : 0;
    let rateStatus = 'alert';
    let rateAdvice = 'Try to increase to at least 10%';
    if (savingsRate >= 0.20) {
      rateStatus = 'good';
      rateAdvice = 'Excellent - maximizing wealth building';
    } else if (savingsRate >= 0.15) {
      rateStatus = 'good';
      rateAdvice = 'Great - on track for comfortable retirement';
    } else if (savingsRate >= 0.10) {
      rateStatus = 'warning';
      rateAdvice = 'Good start - consider increasing to 15%+';
    }

    let html = '<h2>How You Compare</h2>';

    // Savings Rate Analysis
    html += `
      <h3>Your Savings Rate</h3>
      <div class="benchmark-meter">
        <div class="benchmark-fill ${rateStatus === 'alert' ? 'far-behind' : rateStatus === 'warning' ? 'behind' : ''}" style="width: ${Math.min(savingsRate * 100 / 0.25 * 100, 100)}%;"></div>
        <div class="benchmark-target" style="left: 60%;" title="15% recommended"></div>
      </div>
      <div class="benchmark-labels">
        <span>0%</span>
        <span style="margin-left: 35%;">10%</span>
        <span style="margin-left: 15%;">15%</span>
        <span style="margin-left: 10%;">20%+</span>
      </div>
      <p style="margin-top: 10px;"><strong>Your rate: ${Math.round(savingsRate * 100)}%</strong> - ${rateAdvice}</p>
    `;

    // Balance vs Benchmark
    html += `
      <h3 style="margin-top: 25px;">Balance vs Age Benchmark</h3>
      <p style="color: #666; font-size: 14px;">${benchmark?.note || 'Target based on Fidelity guidelines'}</p>
      <div class="benchmark-meter">
        <div class="benchmark-fill ${statusClass}" style="width: ${Math.min(progressPct, 100)}%;"></div>
      </div>
      <div class="benchmark-labels">
        <span>$0</span>
        <span>Target: $${targetBalance.toLocaleString()}</span>
      </div>
      <p style="margin-top: 10px;"><strong>Current: $${currentBalance.toLocaleString()}</strong> (${Math.round(progress * 100)}% of target) - ${statusText}</p>
    `;

    // Catch-up recommendation if behind
    if (gap > 0 && additionalMonthlyNeeded > 0) {
      html += `
        <div class="catch-up-box">
          <div class="amount">+$${additionalMonthlyNeeded.toLocaleString()}/month</div>
          <div class="description">Additional savings needed to reach your age ${targetAge} benchmark of $${targetBalance.toLocaleString()}</div>
        </div>
      `;
    }

    // Add personalized gap analysis if available
    if (enhancedInsights?.gapAnalysis) {
      html += `
        <div class="insight-box">
          <h3>Personalized Assessment</h3>
          <p>${enhancedInsights.gapAnalysis}</p>
        </div>
      `;
    }

    return html;
  },

  /**
   * Build enhanced 5-tier implementation roadmap
   */
  buildEnhancedRoadmapSection(allocation, inputs, gptInsights, enhancedInsights) {
    const actionPlan = enhancedInsights?.actionPlan;

    // Default actions if GPT not available
    const defaultActions = {
      immediate: [
        'Review your current contribution rates in all accounts',
        'Verify employer match is being captured'
      ],
      week1: [
        'Update contribution amounts to match your allocation plan',
        'Set up any new accounts needed (IRA, HSA, etc.)'
      ],
      month1: [
        'Verify first contributions have been processed',
        'Review investment selections in each account'
      ],
      quarterly: [
        'Review account balances and contribution progress',
        'Rebalance if allocation has drifted significantly'
      ],
      annual: [
        'Check for new contribution limits',
        'Update beneficiary designations if needed',
        'Review overall strategy and make adjustments'
      ]
    };

    const actions = actionPlan || defaultActions;

    let html = '<div class="page-break"></div><h2>Your Implementation Roadmap</h2>';
    html += '<p style="color: #666; margin-bottom: 20px;">Follow this step-by-step action plan. Check off each item as you complete it.</p>';

    // Tier 1: Immediate
    html += `
      <div class="roadmap-tier tier-immediate">
        <h4>Immediate (Today)</h4>
        <div class="roadmap-actions">
          ${(actions.immediate || defaultActions.immediate).map(action => `
            <div class="roadmap-action">
              <div class="checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Tier 2: Week 1
    html += `
      <div class="roadmap-tier tier-week1">
        <h4>Week 1</h4>
        <div class="roadmap-actions">
          ${(actions.week1 || defaultActions.week1).map(action => `
            <div class="roadmap-action">
              <div class="checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Tier 3: Month 1
    html += `
      <div class="roadmap-tier tier-month1">
        <h4>Month 1</h4>
        <div class="roadmap-actions">
          ${(actions.month1 || defaultActions.month1).map(action => `
            <div class="roadmap-action">
              <div class="checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Tier 4: Quarterly
    html += `
      <div class="roadmap-tier tier-quarterly">
        <h4>Quarterly Check-In</h4>
        <div class="roadmap-actions">
          ${(actions.quarterly || defaultActions.quarterly).map(action => `
            <div class="roadmap-action">
              <div class="checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Tier 5: Annual
    html += `
      <div class="roadmap-tier tier-annual">
        <h4>Annual Review</h4>
        <div class="roadmap-actions">
          ${(actions.annual || defaultActions.annual).map(action => `
            <div class="roadmap-action">
              <div class="checkbox"></div>
              <span>${action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

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
  },

  /**
   * Sprint 13: Normalize vehicle names from underscore format to proper names
   * Converts "529_Plan" -> "529 Plan", "Solo_401_k__Employee" -> "Solo 401(k) Employee"
   */
  normalizeVehicleName(name) {
    if (!name) return '';

    // First, replace underscores with spaces
    let normalized = name.replace(/_/g, ' ');

    // Fix common patterns
    normalized = normalized
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/401 k/gi, '401(k)')   // 401 k -> 401(k)
      .replace(/\( /g, '(')           // Remove space after (
      .replace(/ \)/g, ')')           // Remove space before )
      .trim();

    return normalized;
  },

  /**
   * Sprint 13: Get setup instructions for a vehicle, handling name normalization
   * Uses priority-based matching to avoid false positives (e.g., "IRA" matching "SIMPLE IRA")
   */
  getVehicleSetupInstructions(vehicleName) {
    if (!vehicleName) return null;

    // Try exact match first
    if (VEHICLE_SETUP_INSTRUCTIONS[vehicleName]) {
      return VEHICLE_SETUP_INSTRUCTIONS[vehicleName];
    }

    // Try normalized name
    const normalized = this.normalizeVehicleName(vehicleName);
    if (VEHICLE_SETUP_INSTRUCTIONS[normalized]) {
      return VEHICLE_SETUP_INSTRUCTIONS[normalized];
    }

    // Canonical name mapping for common variations
    // More specific patterns listed first to match before generic ones
    const vehicleAliases = {
      // 401(k) variations - most specific first
      'mega backdoor roth': 'Mega Backdoor Roth',
      'solo 401(k) employer': 'Solo 401(k) Employer',
      'solo 401(k) employee': 'Solo 401(k) Employee',
      'solo 401k employer': 'Solo 401(k) Employer',
      'solo 401k employee': 'Solo 401(k) Employee',
      '401(k) employer match': '401(k) Employer Match',
      '401(k) traditional': '401(k) Traditional',
      '401(k) roth': '401(k) Roth',
      '401k employer match': '401(k) Employer Match',
      '401k traditional': '401(k) Traditional',
      '401k roth': '401(k) Roth',
      'employer match': '401(k) Employer Match',
      // IRA variations - most specific first
      'backdoor roth ira': 'Backdoor Roth IRA',
      'backdoor roth': 'Backdoor Roth IRA',
      'sep-ira': 'SEP-IRA',
      'sep ira': 'SEP-IRA',
      'simple ira': 'SIMPLE IRA',
      'ira traditional': 'IRA Traditional',
      'traditional ira': 'IRA Traditional',
      'ira roth': 'IRA Roth',
      'roth ira': 'IRA Roth',
      // Other accounts
      'health savings account': 'HSA',
      'hsa': 'HSA',
      '529 plan': '529 Plan',
      '529': '529 Plan',
      'coverdell esa': 'Coverdell ESA',
      'coverdell': 'Coverdell ESA',
      'family bank': 'Family Bank',
      'taxable brokerage': 'Family Bank'
    };

    // Try alias matching (case-insensitive)
    const normalizedLower = normalized.toLowerCase();
    if (vehicleAliases[normalizedLower]) {
      const canonicalName = vehicleAliases[normalizedLower];
      if (VEHICLE_SETUP_INSTRUCTIONS[canonicalName]) {
        return VEHICLE_SETUP_INSTRUCTIONS[canonicalName];
      }
    }

    // Try partial alias matching - check if normalized name contains any alias
    // Sorted by key length descending to match most specific first
    const sortedAliases = Object.keys(vehicleAliases).sort((a, b) => b.length - a.length);
    for (const alias of sortedAliases) {
      if (normalizedLower.includes(alias)) {
        const canonicalName = vehicleAliases[alias];
        if (VEHICLE_SETUP_INSTRUCTIONS[canonicalName]) {
          return VEHICLE_SETUP_INSTRUCTIONS[canonicalName];
        }
      }
    }

    // Return null if no match found - safer than guessing wrong
    return null;
  }
};
