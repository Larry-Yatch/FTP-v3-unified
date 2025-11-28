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
      // Check Tools 1/2/3 completion status
      const toolStatus = this.checkToolCompletion(clientId);

      // Build calculator page (already processed with JS template literals)
      const htmlContent = this.buildCalculatorPage(clientId, baseUrl, toolStatus);

      // Use createHtmlOutput (not createTemplate) since we've already done variable substitution
      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('TruPath - Financial Freedom Framework')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering Tool 4: ${error}`);
      return this.renderError(error);
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
    // REMOVED loading-animation.html - Tool4 is a calculator, not a multi-page form
    // The loading-animation file contains document.write() which breaks template literals

    // Safely escape JSON for embedding in HTML - encode to base64 to avoid ALL special char issues
    const toolStatusJson = Utilities.base64Encode(JSON.stringify(toolStatus));

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

    /* Week 3: Category Breakdown Styles */
    .recommended-amount {
      display: block;
      margin-top: 4px;
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }

    .category-input {
      transition: border-color 0.2s;
    }

    .category-input.over-budget {
      border-color: #ef4444;
    }

    .category-input.under-budget {
      border-color: #fbbf24;
    }

    .category-input.on-target {
      border-color: #22c55e;
    }

    .validation-ok {
      background: rgba(34, 197, 94, 0.1);
      border-left: 4px solid #22c55e;
      color: #22c55e;
    }

    .validation-warning {
      background: rgba(251, 191, 36, 0.1);
      border-left: 4px solid #fbbf24;
      color: #fbbf24;
    }

    .validation-error {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      color: #ef4444;
    }

    .gap-bar-container {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .gap-bar-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .gap-bar-wrapper {
      position: relative;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
    }

    .gap-bar-recommended {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: rgba(59, 130, 246, 0.3);
      border-right: 2px solid #3b82f6;
      display: flex;
      align-items: center;
      padding-left: 10px;
      font-size: 0.9rem;
    }

    .gap-bar-actual {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: rgba(34, 197, 94, 0.5);
      display: flex;
      align-items: center;
      padding-left: 10px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .gap-bar-actual.over {
      background: rgba(239, 68, 68, 0.5);
    }

    .gap-difference {
      margin-top: 5px;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .gap-difference.positive {
      color: #22c55e;
    }

    .gap-difference.negative {
      color: #ef4444;
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
    </div>

    <!-- Category Breakdown Section (Week 3) -->
    <div id="categorySection" class="calculator-section" style="display: none;">
      <h2 class="section-header">🏷️ Break Down Your Spending by Category</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: 20px;">
        Enter how much you plan to allocate to each category. We'll show you how it compares to your recommended allocation.
      </p>

      <div class="form-grid">
        <div class="form-field">
          <label class="form-label" for="cat_housing">🏠 Housing (Rent/Mortgage)</label>
          <input type="number" id="cat_housing" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_housing"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_food">🍽️ Food (Groceries & Dining)</label>
          <input type="number" id="cat_food" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_food"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_transportation">🚗 Transportation</label>
          <input type="number" id="cat_transportation" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_transportation"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_healthcare">🏥 Healthcare & Insurance</label>
          <input type="number" id="cat_healthcare" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_healthcare"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_debt">💳 Debt Payments</label>
          <input type="number" id="cat_debt" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_debt"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_savings">💰 Savings & Investments</label>
          <input type="number" id="cat_savings" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_savings"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_discretionary">🎉 Discretionary & Fun</label>
          <input type="number" id="cat_discretionary" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_discretionary"></small>
        </div>

        <div class="form-field">
          <label class="form-label" for="cat_personal">📦 Personal & Other</label>
          <input type="number" id="cat_personal" class="form-input category-input" placeholder="0" min="0" step="10">
          <small class="recommended-amount" id="rec_personal"></small>
        </div>
      </div>

      <!-- Category Validation Feedback -->
      <div id="categoryValidation" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <strong>Category Total:</strong> <span id="categoryTotal">$0</span>
          </div>
          <div>
            <strong>Monthly Income:</strong> <span id="incomeDisplay">$0</span>
          </div>
        </div>
        <div id="validationMessage"></div>
      </div>

      <div class="btn-group" style="margin-top: 20px;">
        <button class="btn btn-secondary" onclick="autoDistributeCategories()">
          🎯 Auto-Distribute to Recommended
        </button>
        <button class="btn btn-primary" onclick="showGapAnalysis()">
          📊 Show Gap Analysis →
        </button>
      </div>
    </div>

    <!-- Gap Analysis Section (Week 3) -->
    <div id="gapAnalysisSection" class="calculator-section" style="display: none;">
      <h2 class="section-header">📈 Gap Analysis: Your Allocation vs Recommended</h2>
      <div id="gapAnalysisContent"></div>

      <div class="btn-group" style="margin-top: 30px;">
        <button class="btn btn-secondary" onclick="goBackToCategories()">
          ← Edit Categories
        </button>
        <button class="btn btn-primary" onclick="saveScenario(event)">
          💾 Save This Scenario
        </button>
      </div>
    </div>

  </div>

  <script>
    // Make variables and functions globally accessible
    window.clientId = '${clientId}';
    window.baseUrl = '${baseUrl}';

    // Decode base64-encoded JSON to avoid special character issues
    window.toolStatus = JSON.parse(atob('${toolStatusJson}'));

    // Financial data object
    window.financialData = {
      income: 0,
      essentials: 0,
      debt: 0,
      emergencyFund: 0,
      surplus: 0,
      isBusinessOwner: false
    };

    // Check Tool 2 data for business ownership
    if (window.toolStatus.hasTool2 && window.toolStatus.tool2Data && window.toolStatus.tool2Data.employment) {
      window.financialData.isBusinessOwner = (window.toolStatus.tool2Data.employment === 'business-owner' ||
                                                window.toolStatus.tool2Data.employment === 'self-employed');
    }

    // BASE WEIGHTS DATA (Final Spec - TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md)
    const BASE_WEIGHTS = {
      stabilize: { M: 5, E: 60, F: 30, J: 5 },
      reclaim: { M: 10, E: 45, F: 35, J: 10 },
      debt: { M: 15, E: 35, F: 40, J: 10 },
      secure: { M: 25, E: 35, F: 30, J: 10 },
      balance: { M: 15, E: 25, F: 25, J: 35 },
      business: { M: 20, E: 30, F: 35, J: 15 },
      big_goal: { M: 25, E: 25, F: 40, J: 10 },
      wealth: { M: 40, E: 25, F: 20, J: 15 },
      enjoy: { M: 20, E: 20, F: 15, J: 45 },
      generational: { M: 50, E: 20, F: 20, J: 10 }
    };

    // PRIORITIES DATA (Final Spec - 10 Priorities)
    const PRIORITIES = [
      {
        id: 'stabilize',
        name: 'Stabilize to Survive',
        icon: '🚨',
        tier: 1,
        checkUnlock: function() { return true; }
      },
      {
        id: 'reclaim',
        name: 'Reclaim Financial Control',
        icon: '🎯',
        tier: 1,
        checkUnlock: function() { return true; }
      },
      {
        id: 'debt',
        name: 'Get Out of Debt',
        icon: '💳',
        tier: 1,
        checkUnlock: function(data) {
          // Unlock if: Has significant debt + can make progress
          return data.debt > 5000 && data.surplus >= 200;
        }
      },
      {
        id: 'secure',
        name: 'Feel Financially Secure',
        icon: '🛡️',
        tier: 2,
        checkUnlock: function(data) {
          // Unlock if: Emergency fund >= 1 month essentials + not overspending + has surplus
          return data.emergencyFund >= data.essentials &&
                 data.essentials <= (data.income * 0.6) &&
                 data.surplus >= 300;
        }
      },
      {
        id: 'balance',
        name: 'Create Life Balance',
        icon: '⚖️',
        tier: 2,
        checkUnlock: function(data) {
          // Unlock if: 2 months emergency fund + manageable debt + room for enjoyment + surplus
          return data.emergencyFund >= (data.essentials * 2) &&
                 data.debt < (data.income * 3) &&
                 data.essentials <= (data.income * 0.5) &&
                 data.surplus >= 500;
        }
      },
      {
        id: 'business',
        name: 'Build/Stabilize Business',
        icon: '💼',
        tier: 2,
        checkUnlock: function(data) {
          // Unlock if business owner (from Tool 2) or self-employed
          return data.isBusinessOwner === true;
        }
      },
      {
        id: 'big_goal',
        name: 'Save for a Big Goal',
        icon: '🏆',
        tier: 3,
        checkUnlock: function(data) {
          // Unlock if: 3 months emergency fund + manageable debt + can save meaningfully
          return data.emergencyFund >= (data.essentials * 3) &&
                 data.debt < (data.income * 3) &&
                 data.surplus >= 500;
        }
      },
      {
        id: 'wealth',
        name: 'Build Long-Term Wealth',
        icon: '📈',
        tier: 3,
        checkUnlock: function(data) {
          // Unlock if: 6 months emergency fund + minimal debt + can invest 40%
          return data.emergencyFund >= (data.essentials * 6) &&
                 data.debt < (data.income * 2) &&
                 data.surplus >= 800;
        }
      },
      {
        id: 'enjoy',
        name: 'Enjoy Life Now',
        icon: '🎉',
        tier: 3,
        checkUnlock: function(data) {
          // HARD TO UNLOCK: 3mo fund + low debt + can sustain <35% essentials + high surplus
          return data.emergencyFund >= (data.essentials * 3) &&
                 data.debt < (data.income * 2) &&
                 data.essentials < (data.income * 0.35) &&
                 data.surplus >= 1000;
        }
      },
      {
        id: 'generational',
        name: 'Create Generational Wealth',
        icon: '👨‍👩‍👧‍👦',
        tier: 4,
        checkUnlock: function(data) {
          // Unlock if: 12 months emergency fund + no debt + can invest 50%
          return data.emergencyFund >= (data.essentials * 12) &&
                 data.debt === 0 &&
                 data.surplus >= 2000;
        }
      }
    ];

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Tool 4 Calculator initialized');
      console.log('Client ID:', clientId);
      console.log('Tool Status:', toolStatus);
    });

    /**
     * Calculate surplus and unlock appropriate priorities
     * Attach to window to make accessible from onclick handlers
     */
    window.calculateSurplusAndUnlock = function() {
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

      if (essentials > income) {
        alert('Essentials ($' + essentials.toLocaleString() + ') cannot exceed your income ($' + income.toLocaleString() + '). Please adjust your numbers.');
        return;
      }

      if (debt < 0) {
        alert('Debt cannot be negative. Enter 0 if you have no debt.');
        return;
      }

      if (emergencyFund < 0) {
        alert('Emergency fund cannot be negative. Enter 0 if you have no emergency fund.');
        return;
      }

      // Calculate surplus and update financial data
      const surplus = income - essentials;
      window.financialData = {
        income,
        essentials,
        debt,
        emergencyFund,
        surplus,
        isBusinessOwner: window.financialData.isBusinessOwner // Preserve business owner flag
      };

      console.log('Financial Data:', window.financialData);

      // Evaluate all priorities with unlock logic
      calculatePriorities();
    }

    /**
     * Calculate and display priorities with progressive unlock
     */
    function calculatePriorities() {
      // Evaluate all priorities
      const evaluatedPriorities = PRIORITIES.map(function(priority) {
        const unlocked = priority.checkUnlock(window.financialData);

        let hint, lockReason;
        if (unlocked) {
          if (priority.id === 'debt') {
            hint = window.financialData.debt > 0 ? 'Debt: $' + window.financialData.debt.toLocaleString() : 'No debt';
          } else if (priority.id === 'secure' || priority.id === 'enjoy' || priority.tier >= 2) {
            hint = 'Emergency fund: $' + window.financialData.emergencyFund.toLocaleString() + ', Surplus: $' + window.financialData.surplus.toLocaleString();
          } else {
            hint = priority.id === 'stabilize' ? 'Focus on immediate stability' : 'Trauma recovery focus';
          }
        } else {
          if (priority.id === 'debt') {
            lockReason = 'Need: Debt > $5,000 + $200 surplus to make progress';
          } else if (priority.id === 'secure') {
            var needFund = Math.round(window.financialData.essentials);
            lockReason = 'Need: $' + needFund.toLocaleString() + ' emergency fund (1 month) + essentials <= 60% income + $300 surplus';
          } else if (priority.id === 'balance') {
            var needFund = Math.round(window.financialData.essentials * 2);
            lockReason = 'Need: $' + needFund.toLocaleString() + ' emergency fund (2 months) + debt < 3x income + essentials <= 50% income + $500 surplus';
          } else if (priority.id === 'business') {
            lockReason = 'For business owners and self-employed only (complete Tool 2 or update employment status)';
          } else if (priority.id === 'big_goal') {
            var needFund = Math.round(window.financialData.essentials * 3);
            lockReason = 'Need: $' + needFund.toLocaleString() + ' emergency fund (3 months) + debt < 3x income + $500 surplus';
          } else if (priority.id === 'wealth') {
            var needFund = Math.round(window.financialData.essentials * 6);
            lockReason = 'Need: $' + needFund.toLocaleString() + ' emergency fund (6 months) + debt < 2x income + $800 surplus';
          } else if (priority.id === 'enjoy') {
            var needFund = Math.round(window.financialData.essentials * 3);
            var maxEssentials = Math.round(window.financialData.income * 0.35);
            var essentialsPercent = Math.round((window.financialData.essentials / window.financialData.income) * 100);
            lockReason = 'Need: $' + needFund.toLocaleString() + ' emergency fund (3 months) + debt < 2x income + essentials <= $' + maxEssentials.toLocaleString() + ' (35%) + $1,000 surplus | You: ' + essentialsPercent + '% essentials';
          } else if (priority.id === 'generational') {
            var needFund = Math.round(window.financialData.essentials * 12);
            lockReason = 'Need: $' + needFund.toLocaleString() + ' emergency fund (12 months) + NO debt + $2,000 surplus';
          } else {
            lockReason = 'Requires higher emergency fund and surplus';
          }
        }

        return {
          id: priority.id,
          name: priority.name,
          icon: priority.icon,
          tier: priority.tier,
          unlocked: unlocked,
          hint: hint,
          lockReason: lockReason
        };
      });

      // Recommend best priority
      const recommended = recommendPriority(evaluatedPriorities, window.financialData);

      // Render priority grid
      const prioritiesGrid = document.getElementById('prioritiesGrid');
      let html = '';

      evaluatedPriorities.forEach(function(priority) {
        const isRecommended = recommended && priority.id === recommended.id;
        const cssClass = priority.unlocked ? 'priority-card available' : 'priority-card locked';
        const clickHandler = priority.unlocked ? "onclick=\\"selectPriority('" + priority.id + "')\\"" : '';

        html += '<div class="' + cssClass + '" ' + clickHandler + '>';
        html += '<div class="priority-icon">' + (priority.unlocked ? '✅' : '🔒') + ' ' + priority.icon + '</div>';
        html += '<div class="priority-title">' + priority.name;
        if (isRecommended) {
          html += '<div style="font-size: 0.75rem; color: #fbbf24; margin-top: 4px;">⭐ Recommended</div>';
        }
        html += '</div>';
        html += '<div class="' + (priority.unlocked ? 'priority-hint' : 'unlock-requirement') + '">';
        html += priority.unlocked ? priority.hint : priority.lockReason;
        html += '</div></div>';
      });

      prioritiesGrid.innerHTML = html;
      document.getElementById('prioritiesSection').style.display = 'block';
      document.getElementById('prioritiesSection').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Recommend best priority based on financial situation
     */
    function recommendPriority(priorities, data) {
      const unlocked = priorities.filter(function(p) { return p.unlocked; });
      if (unlocked.length === 0) return null;

      // Recommendation logic based on financial situation (ordered by priority)
      if (data.surplus < 0) return unlocked.find(function(p) { return p.id === 'stabilize'; });
      if (data.emergencyFund < data.essentials * 3) return unlocked.find(function(p) { return p.id === 'secure'; });
      if (data.debt > data.income * 0.5) return unlocked.find(function(p) { return p.id === 'debt'; });
      if (data.emergencyFund >= data.essentials * 12 && data.surplus >= data.income * 0.40) return unlocked.find(function(p) { return p.id === 'generational'; });
      if (data.emergencyFund >= data.essentials * 6 && data.surplus >= data.income * 0.20) return unlocked.find(function(p) { return p.id === 'wealth'; });

      return unlocked.sort(function(a, b) { return b.tier - a.tier; })[0];
    }

    /**
     * Select priority and calculate allocation
     * Attach to window to make accessible from onclick handlers
     */
    window.selectPriority = function(priorityId) {
      console.log('Selected priority:', priorityId);

      // Get base weights for this priority
      const weights = BASE_WEIGHTS[priorityId];
      if (!weights) {
        alert('Error: Priority weights not found');
        return;
      }

      // Store selected priority
      window.selectedPriority = priorityId;
      window.selectedWeights = weights;

      // Calculate dollar amounts
      const dollars = {
        M: Math.round((weights.M / 100) * window.financialData.income),
        E: Math.round((weights.E / 100) * window.financialData.income),
        F: Math.round((weights.F / 100) * window.financialData.income),
        J: Math.round((weights.J / 100) * window.financialData.income)
      };

      window.selectedDollars = dollars;

      // Render allocation
      const allocationBars = document.getElementById('allocationBars');
      let html = '';

      html += '<div class="allocation-bar multiply">';
      html += '<div class="bar-content">';
      html += '<span class="bar-label">💰 Multiply</span>';
      html += '<div style="text-align: right;">';
      html += '<div class="bar-percent">' + weights.M + '%</div>';
      html += '<div class="bar-dollars">$' + dollars.M.toLocaleString() + '/mo</div>';
      html += '</div></div></div>';

      html += '<div class="allocation-bar essentials">';
      html += '<div class="bar-content">';
      html += '<span class="bar-label">🏠 Essentials</span>';
      html += '<div style="text-align: right;">';
      html += '<div class="bar-percent">' + weights.E + '%</div>';
      html += '<div class="bar-dollars">$' + dollars.E.toLocaleString() + '/mo</div>';
      html += '</div></div></div>';

      html += '<div class="allocation-bar freedom">';
      html += '<div class="bar-content">';
      html += '<span class="bar-label">🦅 Freedom</span>';
      html += '<div style="text-align: right;">';
      html += '<div class="bar-percent">' + weights.F + '%</div>';
      html += '<div class="bar-dollars">$' + dollars.F.toLocaleString() + '/mo</div>';
      html += '</div></div></div>';

      html += '<div class="allocation-bar enjoyment">';
      html += '<div class="bar-content">';
      html += '<span class="bar-label">🎉 Enjoyment</span>';
      html += '<div style="text-align: right;">';
      html += '<div class="bar-percent">' + weights.J + '%</div>';
      html += '<div class="bar-dollars">$' + dollars.J.toLocaleString() + '/mo</div>';
      html += '</div></div></div>';

      allocationBars.innerHTML = html;

      // Show allocation section
      document.getElementById('allocationSection').style.display = 'block';
      document.getElementById('allocationSection').scrollIntoView({ behavior: 'smooth' });

      // Week 3: Show category breakdown section
      showCategoryBreakdown();
    }

    /**
     * Week 3: Show category breakdown section
     */
    function showCategoryBreakdown() {
      if (!window.selectedDollars || !window.selectedPriority) {
        console.error('No priority selected');
        return;
      }

      // Calculate recommended category amounts based on bucket allocation
      const recommended = calculateRecommendedCategories(window.selectedDollars);
      window.recommendedCategories = recommended;

      // Populate recommended amounts
      document.getElementById('rec_housing').textContent = 'Recommended: $' + recommended.housing.toLocaleString();
      document.getElementById('rec_food').textContent = 'Recommended: $' + recommended.food.toLocaleString();
      document.getElementById('rec_transportation').textContent = 'Recommended: $' + recommended.transportation.toLocaleString();
      document.getElementById('rec_healthcare').textContent = 'Recommended: $' + recommended.healthcare.toLocaleString();
      document.getElementById('rec_debt').textContent = 'Recommended: $' + recommended.debt.toLocaleString();
      document.getElementById('rec_savings').textContent = 'Recommended: $' + recommended.savings.toLocaleString();
      document.getElementById('rec_discretionary').textContent = 'Recommended: $' + recommended.discretionary.toLocaleString();
      document.getElementById('rec_personal').textContent = 'Recommended: $' + recommended.personal.toLocaleString();

      // Auto-fill with recommended amounts
      document.getElementById('cat_housing').value = recommended.housing;
      document.getElementById('cat_food').value = recommended.food;
      document.getElementById('cat_transportation').value = recommended.transportation;
      document.getElementById('cat_healthcare').value = recommended.healthcare;
      document.getElementById('cat_debt').value = recommended.debt;
      document.getElementById('cat_savings').value = recommended.savings;
      document.getElementById('cat_discretionary').value = recommended.discretionary;
      document.getElementById('cat_personal').value = recommended.personal;

      // Add event listeners for real-time validation
      const categoryInputs = document.querySelectorAll('.category-input');
      categoryInputs.forEach(function(input) {
        input.addEventListener('input', validateCategories);
      });

      // Show category section
      document.getElementById('categorySection').style.display = 'block';
      document.getElementById('incomeDisplay').textContent = '$' + window.financialData.income.toLocaleString();
      validateCategories();
      document.getElementById('categorySection').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Calculate recommended category amounts based on M/E/F/J allocation
     * Uses typical breakdown percentages per Implementation Details spec
     */
    function calculateRecommendedCategories(dollars) {
      // Validate input
      if (!dollars || typeof dollars.M !== 'number' || typeof dollars.E !== 'number' ||
          typeof dollars.F !== 'number' || typeof dollars.J !== 'number') {
        console.error('Invalid dollars object:', dollars);
        // Return safe defaults
        return {
          housing: 0, food: 0, transportation: 0, healthcare: 0,
          personal: 0, debt: 0, savings: 0, discretionary: 0
        };
      }

      // Essentials bucket breakdown (Housing, Food, Transportation, Healthcare, Personal)
      // Freedom bucket breakdown (Debt Payments, Savings)
      // Enjoyment bucket breakdown (Discretionary)
      // Multiply bucket goes to Savings

      const income = window.financialData.income;
      const isLowIncome = income < 3500;
      const isMidIncome = income >= 3500 && income < 7000;

      // Essentials breakdown - based on income tier
      let housingPct, foodPct, transPct, healthPct, personalPct;
      if (isLowIncome) {
        housingPct = 0.50; foodPct = 0.25; transPct = 0.15; healthPct = 0.05; personalPct = 0.05;
      } else if (isMidIncome) {
        housingPct = 0.45; foodPct = 0.22; transPct = 0.18; healthPct = 0.10; personalPct = 0.05;
      } else {
        housingPct = 0.40; foodPct = 0.20; transPct = 0.20; healthPct = 0.15; personalPct = 0.05;
      }

      // Freedom bucket splits between debt and savings
      const hasDebt = window.financialData.debt > 0;
      const debtPct = hasDebt ? 0.60 : 0.0; // 60% of Freedom to debt if exists
      const freedomSavingsPct = hasDebt ? 0.40 : 1.0; // Rest to savings

      return {
        housing: Math.round(dollars.E * housingPct),
        food: Math.round(dollars.E * foodPct),
        transportation: Math.round(dollars.E * transPct),
        healthcare: Math.round(dollars.E * healthPct),
        personal: Math.round(dollars.E * personalPct),
        debt: Math.round(dollars.F * debtPct),
        savings: Math.round(dollars.M + (dollars.F * freedomSavingsPct)), // Multiply + Freedom savings
        discretionary: Math.round(dollars.J)
      };
    }

    /**
     * Validate category totals with tolerance
     */
    function validateCategories() {
      const housing = parseFloat(document.getElementById('cat_housing').value) || 0;
      const food = parseFloat(document.getElementById('cat_food').value) || 0;
      const transportation = parseFloat(document.getElementById('cat_transportation').value) || 0;
      const healthcare = parseFloat(document.getElementById('cat_healthcare').value) || 0;
      const debt = parseFloat(document.getElementById('cat_debt').value) || 0;
      const savings = parseFloat(document.getElementById('cat_savings').value) || 0;
      const discretionary = parseFloat(document.getElementById('cat_discretionary').value) || 0;
      const personal = parseFloat(document.getElementById('cat_personal').value) || 0;

      const total = housing + food + transportation + healthcare + debt + savings + discretionary + personal;
      const income = window.financialData.income;

      // Update total display
      document.getElementById('categoryTotal').textContent = '$' + total.toLocaleString();

      // Validation tolerance: ±$50 or ±2% (whichever is larger)
      const tolerance = Math.max(50, income * 0.02);
      const difference = Math.abs(total - income);

      const validationDiv = document.getElementById('categoryValidation');
      const messageDiv = document.getElementById('validationMessage');

      validationDiv.style.display = 'block';

      if (difference <= tolerance) {
        validationDiv.className = 'validation-ok';
        messageDiv.innerHTML = '<strong>✓ Allocation looks good!</strong> Your categories are within tolerance.';
      } else if (total > income) {
        validationDiv.className = 'validation-error';
        const over = total - income;
        messageDiv.innerHTML = '<strong>⚠ Over budget by $' + over.toLocaleString() + '</strong><br>You are allocating more than your income. Please reduce some categories.';
      } else {
        validationDiv.className = 'validation-warning';
        const under = income - total;
        messageDiv.innerHTML = '<strong>⚠ $' + under.toLocaleString() + ' unallocated</strong><br>You have money not assigned to any category. Consider increasing savings or another category.';
      }
    }

    /**
     * Auto-distribute categories to recommended amounts
     */
    window.autoDistributeCategories = function() {
      if (!window.recommendedCategories) {
        alert('No recommendations available');
        return;
      }

      const rec = window.recommendedCategories;
      document.getElementById('cat_housing').value = rec.housing;
      document.getElementById('cat_food').value = rec.food;
      document.getElementById('cat_transportation').value = rec.transportation;
      document.getElementById('cat_healthcare').value = rec.healthcare;
      document.getElementById('cat_debt').value = rec.debt;
      document.getElementById('cat_savings').value = rec.savings;
      document.getElementById('cat_discretionary').value = rec.discretionary;
      document.getElementById('cat_personal').value = rec.personal;

      validateCategories();
    };

    /**
     * Show gap analysis comparing actual vs recommended
     */
    window.showGapAnalysis = function() {
      // Get current category values
      const actual = {
        housing: parseFloat(document.getElementById('cat_housing').value) || 0,
        food: parseFloat(document.getElementById('cat_food').value) || 0,
        transportation: parseFloat(document.getElementById('cat_transportation').value) || 0,
        healthcare: parseFloat(document.getElementById('cat_healthcare').value) || 0,
        debt: parseFloat(document.getElementById('cat_debt').value) || 0,
        savings: parseFloat(document.getElementById('cat_savings').value) || 0,
        discretionary: parseFloat(document.getElementById('cat_discretionary').value) || 0,
        personal: parseFloat(document.getElementById('cat_personal').value) || 0
      };

      window.actualCategories = actual;

      const recommended = window.recommendedCategories;
      const income = window.financialData.income;

      // Build gap analysis HTML
      let html = '<div style="margin-bottom: 30px;">';
      html += '<p style="color: var(--color-text-secondary);">Here is how your planned allocation compares to our recommendation based on your "' + getPriorityName(window.selectedPriority) + '" priority.</p>';
      html += '</div>';

      const categories = [
        { key: 'housing', label: '🏠 Housing', icon: '🏠' },
        { key: 'food', label: '🍽️ Food', icon: '🍽️' },
        { key: 'transportation', label: '🚗 Transportation', icon: '🚗' },
        { key: 'healthcare', label: '🏥 Healthcare', icon: '🏥' },
        { key: 'debt', label: '💳 Debt Payments', icon: '💳' },
        { key: 'savings', label: '💰 Savings & Investments', icon: '💰' },
        { key: 'discretionary', label: '🎉 Discretionary', icon: '🎉' },
        { key: 'personal', label: '📦 Personal', icon: '📦' }
      ];

      categories.forEach(function(cat) {
        const rec = recommended[cat.key];
        const act = actual[cat.key];
        const diff = act - rec;
        const diffPct = rec > 0 ? Math.round((diff / rec) * 100) : 0;

        html += '<div class="gap-bar-container">';
        html += '<div class="gap-bar-header">';
        html += '<span>' + cat.label + '</span>';
        html += '<span>Your: $' + act.toLocaleString() + ' | Recommended: $' + rec.toLocaleString() + '</span>';
        html += '</div>';

        html += '<div class="gap-bar-wrapper">';
        // Constrain widths to max 100% to prevent overflow
        const recWidth = Math.min(100, (rec / income) * 100);
        const actWidth = Math.min(100, (act / income) * 100);

        html += '<div class="gap-bar-recommended" style="width: ' + recWidth + '%;">';
        if (recWidth > 10) html += '$' + rec.toLocaleString();
        html += '</div>';

        html += '<div class="gap-bar-actual ' + (act > rec ? 'over' : '') + '" style="width: ' + actWidth + '%;">';
        if (actWidth > 10) html += '$' + act.toLocaleString();
        html += '</div>';
        html += '</div>';

        if (diff !== 0) {
          html += '<div class="gap-difference ' + (diff > 0 ? 'negative' : 'positive') + '">';
          html += diff > 0 ? '+$' + diff.toLocaleString() + ' over' : '$' + Math.abs(diff).toLocaleString() + ' under';
          html += ' (' + (diffPct > 0 ? '+' : '') + diffPct + '%)';
          html += '</div>';
        }

        html += '</div>';
      });

      document.getElementById('gapAnalysisContent').innerHTML = html;
      document.getElementById('gapAnalysisSection').style.display = 'block';
      document.getElementById('gapAnalysisSection').scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Go back to edit categories
     */
    window.goBackToCategories = function() {
      document.getElementById('gapAnalysisSection').style.display = 'none';
      document.getElementById('categorySection').scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Get priority display name
     */
    function getPriorityName(priorityId) {
      const priority = PRIORITIES.find(function(p) { return p.id === priorityId; });
      return priority ? priority.name : priorityId;
    }

    /**
     * Save scenario to TOOL4_SCENARIOS sheet
     */
    window.saveScenario = function(event) {
      // Validate we have all required data
      if (!window.selectedPriority || !window.actualCategories) {
        alert('Please complete the category breakdown before saving');
        return;
      }

      const scenarioName = prompt('Name this scenario:', 'Scenario ' + new Date().toLocaleDateString());
      if (!scenarioName) return;

      // Prepare scenario data
      const scenarioData = {
        clientId: window.clientId,
        scenarioName: scenarioName,
        priority: window.selectedPriority,
        financialInputs: window.financialData,
        recommendedAllocation: {
          percentages: window.selectedWeights,
          dollars: window.selectedDollars
        },
        categoryBreakdown: {
          recommended: window.recommendedCategories,
          actual: window.actualCategories
        },
        timestamp: new Date().toISOString()
      };

      console.log('Saving scenario:', scenarioData);

      // Show loading state (use event.target if available, otherwise querySelector)
      const btn = event && event.target ? event.target : document.querySelector('button[onclick*="saveScenario"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '💾 Saving...';
      }

      // Call server-side save function
      google.script.run
        .withSuccessHandler(function(result) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = '💾 Save This Scenario';
          }
          alert('✓ Scenario saved successfully!\\n\\n"' + scenarioName + '" has been saved to your scenarios.');
        })
        .withFailureHandler(function(error) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = '💾 Save This Scenario';
          }
          alert('Error saving scenario: ' + error.message);
          console.error('Save error:', error);
        })
        .Tool4.saveScenarioToSheet(scenarioData);
    };

    /**
     * Customize allocation (Week 6 feature)
     */
    window.customizeAllocation = function() {
      alert('Customize allocation feature coming in Week 6!');
    };
  </script>
</body>
</html>
    `;
  },

  /**
   * Week 3: Save scenario to TOOL4_SCENARIOS sheet
   */
  saveScenarioToSheet(scenarioData) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName('TOOL4_SCENARIOS');

      // Create sheet if it doesn't exist
      if (!sheet) {
        sheet = ss.insertSheet('TOOL4_SCENARIOS');
        // Add header row (36 columns A-AJ per spec)
        const headers = [
          'Timestamp', 'Client_ID', 'Scenario_Name', 'Priority_Selected',
          // Financial Inputs
          'Monthly_Income', 'Current_Essentials', 'Debt_Balance', 'Interest_Rate',
          'Emergency_Fund', 'Income_Stability',
          // Category Breakdown - Recommended
          'Rec_Housing', 'Rec_Food', 'Rec_Transportation', 'Rec_Healthcare',
          'Rec_Debt', 'Rec_Savings', 'Rec_Discretionary', 'Rec_Personal',
          // Category Breakdown - Actual
          'Act_Housing', 'Act_Food', 'Act_Transportation', 'Act_Healthcare',
          'Act_Debt', 'Act_Savings', 'Act_Discretionary', 'Act_Personal',
          // Recommended Allocation (M/E/F/J)
          'Rec_M_Percent', 'Rec_E_Percent', 'Rec_F_Percent', 'Rec_J_Percent',
          'Rec_M_Dollars', 'Rec_E_Dollars', 'Rec_F_Dollars', 'Rec_J_Dollars',
          // Metadata
          'Tool_Status'
        ];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      }

      // Prepare row data
      const rowData = [
        new Date(scenarioData.timestamp),
        scenarioData.clientId,
        scenarioData.scenarioName,
        scenarioData.priority,
        // Financial inputs
        scenarioData.financialInputs.income,
        scenarioData.financialInputs.essentials,
        scenarioData.financialInputs.debt,
        'Medium', // Default interest rate
        scenarioData.financialInputs.emergencyFund,
        'Stable', // Default stability
        // Recommended categories
        scenarioData.categoryBreakdown.recommended.housing,
        scenarioData.categoryBreakdown.recommended.food,
        scenarioData.categoryBreakdown.recommended.transportation,
        scenarioData.categoryBreakdown.recommended.healthcare,
        scenarioData.categoryBreakdown.recommended.debt,
        scenarioData.categoryBreakdown.recommended.savings,
        scenarioData.categoryBreakdown.recommended.discretionary,
        scenarioData.categoryBreakdown.recommended.personal,
        // Actual categories
        scenarioData.categoryBreakdown.actual.housing,
        scenarioData.categoryBreakdown.actual.food,
        scenarioData.categoryBreakdown.actual.transportation,
        scenarioData.categoryBreakdown.actual.healthcare,
        scenarioData.categoryBreakdown.actual.debt,
        scenarioData.categoryBreakdown.actual.savings,
        scenarioData.categoryBreakdown.actual.discretionary,
        scenarioData.categoryBreakdown.actual.personal,
        // Recommended allocation percentages
        scenarioData.recommendedAllocation.percentages.M,
        scenarioData.recommendedAllocation.percentages.E,
        scenarioData.recommendedAllocation.percentages.F,
        scenarioData.recommendedAllocation.percentages.J,
        // Recommended allocation dollars
        scenarioData.recommendedAllocation.dollars.M,
        scenarioData.recommendedAllocation.dollars.E,
        scenarioData.recommendedAllocation.dollars.F,
        scenarioData.recommendedAllocation.dollars.J,
        // Metadata
        'COMPLETED'
      ];

      // Append to sheet
      sheet.appendRow(rowData);

      Logger.log('Scenario saved successfully for client: ' + scenarioData.clientId);
      return { success: true, message: 'Scenario saved successfully' };

    } catch (error) {
      Logger.log('Error saving scenario: ' + error);
      throw new Error('Failed to save scenario: ' + error.message);
    }
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
