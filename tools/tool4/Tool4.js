/**
 * Tool4.js
 * Financial Freedom Framework - Budget Allocation Calculator
 *
 * Architecture: Single-page calculator + Report model (like Tool 8)
 * Purpose: Help students discover optimal M/E/F/J allocation based on:
 *   - Selected financial priority (10 priorities, progressively unlocked)
 *   - 29 trauma-informed modifiers from Tools 1/2/3
 *   - Current financial reality (income, debt, emergency fund, spending)
 *   - Student agency (can customize recommendations)
 *
 * Key Features:
 *   - Progressive unlock (priorities lock/unlock based on financial data)
 *   - Multiple scenarios (students can save/compare different allocations)
 *   - Backup questions (if Tools 1/2/3 missing)
 *   - Real-time calculations (client-side JS)
 *   - Comprehensive report + PDF download
 */

const Tool4 = {
  manifest: null, // Will be injected by ToolRegistry

  /**
   * Main render function
   * Single-page calculator interface
   */
  render(params) {
    const clientId = params.clientId;
    const baseUrl = ScriptApp.getService().getUrl();

    try {
      // Validate student ID via roster
      if (!this.validateStudent(clientId)) {
        return this.renderInvalidStudent();
      }

      // Check Tools 1/2/3 completion status
      const toolStatus = this.checkToolCompletion(clientId);

      // Build calculator page
      const template = HtmlService.createTemplate(
        this.buildCalculatorPage(clientId, baseUrl, toolStatus)
      );

      return template.evaluate()
        .setTitle('TruPath - Financial Freedom Framework')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering Tool 4: ${error}`);
      return this.renderError(error);
    }
  },

  /**
   * Validate student via roster
   */
  validateStudent(clientId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const rosterSheet = ss.getSheetByName('ROSTER');

      if (!rosterSheet) {
        Logger.log('ROSTER sheet not found');
        return false;
      }

      const data = rosterSheet.getDataRange().getValues();

      // Check if clientId exists in roster (Column A)
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === clientId) {
          return true;
        }
      }

      return false;
    } catch (error) {
      Logger.log(`Error validating student: ${error}`);
      return false;
    }
  },

  /**
   * Check Tools 1/2/3 completion status
   */
  checkToolCompletion(clientId) {
    try {
      const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
      const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

      return {
        hasTool1: !!tool1Data,
        hasTool2: !!tool2Data,
        hasTool3: !!tool3Data,
        tool1Data: tool1Data,
        tool2Data: tool2Data,
        tool3Data: tool3Data,
        missingCount: [tool1Data, tool2Data, tool3Data].filter(d => !d).length
      };
    } catch (error) {
      Logger.log(`Error checking tool completion: ${error}`);
      return {
        hasTool1: false,
        hasTool2: false,
        hasTool3: false,
        missingCount: 3
      };
    }
  },

  /**
   * Build main calculator page
   */
  buildCalculatorPage(clientId, baseUrl, toolStatus) {
    const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();
    const loadingAnimation = HtmlService.createHtmlOutputFromFile('shared/loading-animation').getContent();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_top">
  ${styles}
  <style>
    /* Tool 4 Specific Styles */
    .tool4-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .calculator-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .section-header {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--color-text-primary);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--color-text-secondary);
    }

    .form-input,
    .form-select {
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      color: var(--color-text-primary);
      font-size: 1rem;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .priority-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }

    .priority-card {
      padding: 15px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s;
    }

    .priority-card.available {
      border-color: var(--color-success);
      cursor: pointer;
    }

    .priority-card.available:hover {
      background: rgba(34, 197, 94, 0.1);
      transform: translateY(-2px);
    }

    .priority-card.locked {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .priority-icon {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    .priority-title {
      font-weight: 600;
      margin-bottom: 5px;
    }

    .priority-hint,
    .unlock-requirement {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .allocation-output {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 30px;
      margin-top: 30px;
    }

    .allocation-bars {
      margin: 20px 0;
    }

    .allocation-bar {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding: 15px;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .allocation-bar::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: currentColor;
      opacity: 0.2;
      transition: width 0.3s ease;
    }

    .allocation-bar.multiply { color: #fbbf24; }
    .allocation-bar.essentials { color: #60a5fa; }
    .allocation-bar.freedom { color: #34d399; }
    .allocation-bar.enjoyment { color: #f472b6; }

    .bar-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .bar-label {
      font-weight: 600;
      font-size: 1rem;
    }

    .bar-percent {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .bar-dollars {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    .btn-group {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-hover);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text-primary);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-badge.complete {
      background: rgba(34, 197, 94, 0.2);
      color: var(--color-success);
    }

    .status-badge.missing {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .btn-group {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  ${loadingAnimation}

  <div class="tool4-container">
    <!-- Header -->
    <header style="margin-bottom: 30px;">
      <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">
        💰 Financial Freedom Framework
      </h1>
      <p style="color: var(--color-text-secondary); font-size: 1.1rem;">
        Discover your optimal budget allocation across 4 buckets: Multiply, Essentials, Freedom, and Enjoyment
      </p>
    </header>

    <!-- Student ID Display -->
    <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <strong>Student ID:</strong> <span style="color: var(--color-primary);">${clientId}</span>
    </div>

    <!-- Tool Status Check -->
    <div class="calculator-section">
      <h2 class="section-header">📊 Data Sources</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="font-weight: 600; margin-bottom: 5px;">Tool 1: Core Trauma</div>
          <span class="status-badge ${toolStatus.hasTool1 ? 'complete' : 'missing'}">
            ${toolStatus.hasTool1 ? '✓ Completed' : '⚠ Missing'}
          </span>
        </div>
        <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="font-weight: 600; margin-bottom: 5px;">Tool 2: Values</div>
          <span class="status-badge ${toolStatus.hasTool2 ? 'complete' : 'missing'}">
            ${toolStatus.hasTool2 ? '✓ Completed' : '⚠ Missing'}
          </span>
        </div>
        <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="font-weight: 600; margin-bottom: 5px;">Tool 3: Identity</div>
          <span class="status-badge ${toolStatus.hasTool3 ? 'complete' : 'missing'}">
            ${toolStatus.hasTool3 ? '✓ Completed' : '⚠ Missing'}
          </span>
        </div>
      </div>

      ${toolStatus.missingCount > 0 ? `
        <div style="margin-top: 15px; padding: 15px; background: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; border-radius: 4px;">
          <strong>⚠ Note:</strong> You're missing ${toolStatus.missingCount} assessment${toolStatus.missingCount > 1 ? 's' : ''}.
          You can continue with backup questions or <a href="${baseUrl}?route=dashboard&client=${clientId}" style="color: var(--color-primary); text-decoration: underline;">go back and complete them</a> for more accurate recommendations.
        </div>
      ` : ''}
    </div>

    <!-- Financial Inputs Section -->
    <div class="calculator-section">
      <h2 class="section-header">💵 Your Financial Reality</h2>

      <div class="form-grid">
        <div class="form-field">
          <label class="form-label">Monthly Income *</label>
          <input type="number" id="income" class="form-input" placeholder="5000" min="0" step="100" required>
          <small style="color: var(--color-text-muted); margin-top: 4px;">Your monthly take-home income</small>
        </div>

        <div class="form-field">
          <label class="form-label">Current Essentials *</label>
          <input type="number" id="essentials" class="form-input" placeholder="2500" min="0" step="100" required>
          <small style="color: var(--color-text-muted); margin-top: 4px;">What you actually spend on essentials now</small>
        </div>

        <div class="form-field">
          <label class="form-label">Debt Balance</label>
          <input type="number" id="debt" class="form-input" placeholder="0" min="0" step="100">
          <small style="color: var(--color-text-muted); margin-top: 4px;">Total outstanding debt (enter 0 if none)</small>
        </div>

        <div class="form-field">
          <label class="form-label">Interest Rate</label>
          <select id="interestRate" class="form-select">
            <option value="High">High (>15%)</option>
            <option value="Medium" selected>Medium (6-15%)</option>
            <option value="Low">Low (<6%)</option>
          </select>
        </div>

        <div class="form-field">
          <label class="form-label">Emergency Fund</label>
          <input type="number" id="emergencyFund" class="form-input" placeholder="0" min="0" step="100">
          <small style="color: var(--color-text-muted); margin-top: 4px;">Current savings set aside for emergencies</small>
        </div>

        <div class="form-field">
          <label class="form-label">Income Stability</label>
          <select id="stability" class="form-select">
            <option value="Very Stable">Very Stable</option>
            <option value="Stable" selected>Stable</option>
            <option value="Variable">Variable</option>
            <option value="Unstable">Unstable</option>
          </select>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="calculateSurplusAndUnlock()">
          Calculate Available Priorities →
        </button>
      </div>
    </div>

    <!-- Available Priorities (populated after calculation) -->
    <div id="prioritiesSection" class="calculator-section" style="display: none;">
      <h2 class="section-header">🎯 Select Your Financial Priority</h2>
      <div id="prioritiesGrid" class="priority-grid"></div>
    </div>

    <!-- Allocation Output (populated after priority selection) -->
    <div id="allocationSection" class="allocation-output" style="display: none;">
      <h2 style="font-size: 1.5rem; margin-bottom: 20px;">📊 Your Recommended Allocation</h2>
      <div id="allocationBars" class="allocation-bars"></div>

      <div class="btn-group">
        <button class="btn btn-secondary" onclick="customizeAllocation()">
          🎛️ Customize This Allocation
        </button>
        <button class="btn btn-primary" onclick="saveScenario()">
          💾 Save Scenario
        </button>
      </div>
    </div>

  </div>

  <script>
    const clientId = '${clientId}';
    const baseUrl = '${baseUrl}';
    const toolStatus = ${JSON.stringify(toolStatus)};

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Tool 4 Calculator initialized');
      console.log('Client ID:', clientId);
      console.log('Tool Status:', toolStatus);
    });

    /**
     * Calculate surplus and unlock appropriate priorities
     */
    function calculateSurplusAndUnlock() {
      const income = parseFloat(document.getElementById('income').value) || 0;
      const essentials = parseFloat(document.getElementById('essentials').value) || 0;
      const debt = parseFloat(document.getElementById('debt').value) || 0;
      const emergencyFund = parseFloat(document.getElementById('emergencyFund').value) || 0;

      // Validate inputs
      if (income <= 0) {
        alert('Please enter your monthly income');
        return;
      }

      if (essentials < 0) {
        alert('Essentials cannot be negative');
        return;
      }

      // Calculate surplus
      const surplus = income - essentials;

      console.log('Financial Data:', { income, essentials, debt, emergencyFund, surplus });

      // TODO: Call server-side progressive unlock logic
      // For now, show mock priorities
      showAvailablePriorities(surplus, emergencyFund, debt);
    }

    /**
     * Show available priorities (mock for now)
     */
    function showAvailablePriorities(surplus, emergencyFund, debt) {
      const prioritiesSection = document.getElementById('prioritiesSection');
      const prioritiesGrid = document.getElementById('prioritiesGrid');

      // Mock priority data (will be replaced with actual unlock logic)
      const priorities = [
        {
          id: 'stabilize',
          name: 'Stabilize to Survive',
          icon: '🚨',
          hint: 'Focus on immediate stability',
          unlocked: true,
          requirement: null
        },
        {
          id: 'reclaim',
          name: 'Reclaim Financial Control',
          icon: '🎯',
          hint: 'Trauma recovery focus',
          unlocked: true,
          requirement: null
        },
        {
          id: 'debt',
          name: 'Get Out of Debt',
          icon: '💳',
          hint: debt > 0 ? \`Debt: $\${debt.toLocaleString()}\` : 'No debt',
          unlocked: debt > 0,
          requirement: debt > 0 ? null : 'Need debt balance > $0'
        },
        {
          id: 'secure',
          name: 'Feel Financially Secure',
          icon: '🛡️',
          hint: \`Emergency fund: $\${emergencyFund.toLocaleString()}\`,
          unlocked: emergencyFund >= 6000 || surplus >= 500,
          requirement: 'Need: Emergency fund ≥ $6,000 OR surplus ≥ $500'
        }
      ];

      let html = '';
      priorities.forEach(priority => {
        html += \`
          <div class="priority-card \${priority.unlocked ? 'available' : 'locked'}"
               onclick="\${priority.unlocked ? \`selectPriority('\${priority.id}')\` : ''}"}>
            <div class="priority-icon">\${priority.unlocked ? '✅' : '🔒'} \${priority.icon}</div>
            <div class="priority-title">\${priority.name}</div>
            <div class="\${priority.unlocked ? 'priority-hint' : 'unlock-requirement'}">
              \${priority.unlocked ? priority.hint : priority.requirement}
            </div>
          </div>
        \`;
      });

      prioritiesGrid.innerHTML = html;
      prioritiesSection.style.display = 'block';
      prioritiesSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Select priority and calculate allocation
     */
    function selectPriority(priorityId) {
      console.log('Selected priority:', priorityId);

      // TODO: Call server-side calculation with modifiers
      // For now, show mock allocation
      showAllocation(priorityId);
    }

    /**
     * Show allocation results (mock for now)
     */
    function showAllocation(priorityId) {
      const income = parseFloat(document.getElementById('income').value) || 0;

      // Mock allocation (will be replaced with actual calculation)
      const allocation = {
        M: 15,
        E: 35,
        F: 40,
        J: 10
      };

      const dollars = {
        M: Math.round((allocation.M / 100) * income),
        E: Math.round((allocation.E / 100) * income),
        F: Math.round((allocation.F / 100) * income),
        J: Math.round((allocation.J / 100) * income)
      };

      const allocationBars = document.getElementById('allocationBars');
      allocationBars.innerHTML = \`
        <div class="allocation-bar multiply" style="--width: \${allocation.M}%">
          <div class="bar-content" style="width: \${allocation.M}%">
            <span class="bar-label">💰 Multiply</span>
            <div style="text-align: right;">
              <div class="bar-percent">\${allocation.M}%</div>
              <div class="bar-dollars">$\${dollars.M.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>

        <div class="allocation-bar essentials" style="--width: \${allocation.E}%">
          <div class="bar-content" style="width: \${allocation.E}%">
            <span class="bar-label">🏠 Essentials</span>
            <div style="text-align: right;">
              <div class="bar-percent">\${allocation.E}%</div>
              <div class="bar-dollars">$\${dollars.E.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>

        <div class="allocation-bar freedom" style="--width: \${allocation.F}%">
          <div class="bar-content" style="width: \${allocation.F}%">
            <span class="bar-label">🦅 Freedom</span>
            <div style="text-align: right;">
              <div class="bar-percent">\${allocation.F}%</div>
              <div class="bar-dollars">$\${dollars.F.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>

        <div class="allocation-bar enjoyment" style="--width: \${allocation.J}%">
          <div class="bar-content" style="width: \${allocation.J}%">
            <span class="bar-label">🎉 Enjoyment</span>
            <div style="text-align: right;">
              <div class="bar-percent">\${allocation.J}%</div>
              <div class="bar-dollars">$\${dollars.J.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>
      \`;

      // Update bar widths visually
      document.querySelectorAll('.allocation-bar').forEach((bar, index) => {
        const width = Object.values(allocation)[index];
        bar.querySelector('.bar-content').style.width = width + '%';
        const before = bar;
        before.style.setProperty('--width', width + '%');
      });

      document.getElementById('allocationSection').style.display = 'block';
      document.getElementById('allocationSection').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Customize allocation
     */
    function customizeAllocation() {
      alert('Customize allocation feature coming in Week 6!');
    }

    /**
     * Save scenario
     */
    function saveScenario() {
      alert('Save scenario feature coming in Week 6!');
    }
  </script>
</body>
</html>
    `;
  },

  /**
   * Render invalid student error
   */
  renderInvalidStudent() {
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: system-ui; padding: 40px; text-align: center; }
          .error { color: #ef4444; font-size: 1.2rem; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Access Denied</h1>
        <p class="error">Student ID not found in roster.</p>
        <p>Please contact your instructor for access.</p>
      </body>
      </html>
    `).setTitle('TruPath - Access Denied');
  },

  /**
   * Render error page
   */
  renderError(error) {
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: system-ui; padding: 40px; }
          .error { background: #fee; padding: 20px; border-left: 4px solid #ef4444; }
        </style>
      </head>
      <body>
        <h1>Error Loading Tool 4</h1>
        <div class="error">
          <strong>Error:</strong> ${error.toString()}
        </div>
        <p>This error has been logged. Please try again or contact support.</p>
      </body>
      </html>
    `).setTitle('TruPath - Error');
  }
};
