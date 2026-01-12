/**
 * Tool6.js
 * Retirement Blueprint Calculator
 *
 * Architecture: Single-page calculator + Report model (like Tool 4)
 * Purpose: Help clients discover optimal retirement vehicle allocation based on:
 *   - Profile classification (1 of 9 investor profiles)
 *   - Ambition Quotient (domain weighting from importance + urgency)
 *   - Current financial state (balances, contributions, employer match)
 *   - Tax strategy preference (Traditional vs Roth focus)
 *   - Investment risk tolerance (from Tool 4)
 *
 * Key Features:
 *   - Auto-profile classification from decision tree
 *   - Waterfall allocation with IRS limit enforcement
 *   - Slider coupling with real-time recalculation
 *   - Multiple scenario save/compare
 *   - Future value projections with safeguards
 *   - PDF report generation
 */

const Tool6 = {
  manifest: null, // Injected by ToolRegistry

  /**
   * Main render function
   * Entry point for Tool 6
   */
  render(params) {
    const clientId = params.clientId;
    console.log('=== Tool6.render START for client: ' + clientId + ' ===');

    try {
      // Check Tools 1-5 completion status
      console.log('Calling checkToolCompletion...');
      const toolStatus = this.checkToolCompletion(clientId);
      console.log('checkToolCompletion returned. hasTool4: ' + toolStatus.hasTool4);

      // Check if pre-survey completed (questionnaire answers)
      const preSurveyData = this.getPreSurvey(clientId);

      // Calculate allocation if pre-survey exists
      let allocation = null;
      let profile = null;

      if (preSurveyData) {
        try {
          // Classify into investor profile
          profile = this.classifyProfile(clientId, preSurveyData, toolStatus);

          // Calculate vehicle allocation
          allocation = this.calculateAllocation(clientId, preSurveyData, profile, toolStatus);
        } catch (calcError) {
          Logger.log(`Error calculating allocation: ${calcError}`);
          Logger.log(`Stack: ${calcError.stack}`);
          // Continue without allocation - will show questionnaire
        }
      }

      // Build unified page (questionnaire + calculator)
      const htmlContent = this.buildUnifiedPage(clientId, toolStatus, preSurveyData, profile, allocation);

      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('TruPath - Retirement Blueprint Calculator')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering Tool 6: ${error}`);
      Logger.log(`Error stack: ${error.stack}`);
      return this.renderError(error);
    }
  },

  /**
   * Check Tools 1-5 completion status
   * Pulls data from previous tools for pre-population
   * Maps fields per spec Data Sources table (Tool6-Consolidated-Specification.md)
   */
  checkToolCompletion(clientId) {
    console.log('=== checkToolCompletion START ===');
    try {
      console.log('Getting tool1Data...');
      const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      console.log('tool1Data: ' + (tool1Data ? 'found' : 'null'));
      const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
      const tool3Data = DataService.getLatestResponse(clientId, 'tool3');
      const tool4Data = DataService.getLatestResponse(clientId, 'tool4');
      const tool5Data = DataService.getLatestResponse(clientId, 'tool5');

      // Map fields from upstream tools per spec
      const mappedFields = this.mapUpstreamFields(tool1Data, tool2Data, tool3Data, tool4Data, tool5Data);

      return {
        // Completion flags
        hasTool1: !!tool1Data,
        hasTool2: !!tool2Data,
        hasTool3: !!tool3Data,
        hasTool4: !!tool4Data,
        hasTool5: !!tool5Data,

        // Raw data (for debugging/advanced use)
        tool1Data,
        tool2Data,
        tool3Data,
        tool4Data,
        tool5Data,

        // Mapped fields for Tool 6 use
        ...mappedFields,

        // Summary stats
        missingCount: [tool1Data, tool2Data, tool3Data, tool4Data, tool5Data].filter(d => !d).length,
        hasCriticalData: !!tool4Data && (tool4Data.data?.multiply > 0 || tool4Data.data?.multiplyAmount > 0)
      };
    } catch (error) {
      Logger.log(`Error checking tool completion: ${error}`);
      return {
        hasTool1: false,
        hasTool2: false,
        hasTool3: false,
        hasTool4: false,
        hasTool5: false,
        missingCount: 5,
        hasCriticalData: false
      };
    }
  },

  /**
   * Map upstream tool fields to Tool 6 field names
   * Per spec Data Sources table (lines 96-111)
   *
   * DATA STRUCTURE NOTES:
   * - getLatestResponse() returns { data: {...}, status, timestamp, ... }
   * - Tools 1/2/3/5 save: { data: formData, results: {...}, ... } -> so form data is at .data.data
   * - Tool 4 saves flat: { scenarioName, multiply, monthlyIncome, ... } -> so data is at .data directly
   */
  mapUpstreamFields(tool1Data, tool2Data, tool3Data, tool4Data, tool5Data) {
    // Extract actual form/result data from each response
    // Each tool has a different save structure:
    //
    // Tool 1 saves: { formData: {...}, scores: {...}, winner: '...' }
    //   -> form data at .data.formData, winner at .data.winner
    //
    // Tools 2/3/5 save: { data: formData, results: {...}, gptInsights: {...} }
    //   -> form data at .data.data, results at .data.results
    //
    // Tool 4 saves flat: { scenarioName, multiply, monthlyIncome, ... }
    //   -> data directly at .data
    //
    const t1Raw = tool1Data?.data || {};
    const t1Winner = t1Raw.winner || t1Raw.winningPattern || null;  // Tool 1's winner
    const t1Scores = t1Raw.scores || {};  // Tool 1's scores

    const t2 = tool2Data?.data?.data || {};
    const t3 = tool3Data?.data?.data || {};
    const t3Scoring = tool3Data?.data?.scoring || {};  // Tool 3 scoring has subdomainQuotients
    const t4 = tool4Data?.data || {};  // Tool 4 saves flat structure
    const t5 = tool5Data?.data?.data || {};
    const t5Scoring = tool5Data?.data?.scoring || {};  // Tool 5 scoring has subdomainQuotients

    // Infer filing status from marital status
    const inferFilingStatus = (maritalStatus) => {
      if (!maritalStatus) return null;
      const lower = String(maritalStatus).toLowerCase();
      if (lower.includes('married') || lower === 'mfj') return 'MFJ';
      if (lower === 'mfs' || lower.includes('separately')) return 'MFS';
      return 'Single';
    };

    // Infer HSA coverage type from filing status (spec section 7)
    const inferHSACoverageType = (filingStatus) => {
      return filingStatus === 'MFJ' ? 'Family' : 'Individual';
    };

    // Tool 2 uses 'marital' field (not maritalStatus)
    const filingStatus = inferFilingStatus(t2.marital || t2.maritalStatus || t2.filingStatus);

    // Tool 4 saves: { multiply, essentials, freedom, enjoyment, monthlyIncome, priority, scenarioName }
    // Note: 'multiply' is lowercase and is a percentage (0-100)
    const monthlyIncome = t4.monthlyIncome || 0;
    const multiplyPercent = t4.multiply || t4.Multiply || (t4.allocations && t4.allocations.Multiply) || 0;
    const monthlyBudget = monthlyIncome > 0 && multiplyPercent > 0
      ? Math.round(monthlyIncome * multiplyPercent / 100)
      : 0;

    return {
      // From Tool 1: Trauma patterns (winner and scores are at top level of saved data)
      traumaPattern: t1Winner,
      traumaScores: t1Scores,

      // From Tool 2: Demographics and employment (field names: age, marital, employment)
      age: t2.age || t2.currentAge || null,
      grossIncome: t2.annualIncome || t2.grossIncome || t2.income || null,
      employmentType: t2.employment || t2.employmentType || t2.workSituation || null,
      businessOwner: t2.businessOwner || t2.isBusinessOwner || false,
      filingStatus: filingStatus,
      hsaCoverageType: inferHSACoverageType(filingStatus),

      // From Tool 3: Identity subdomain scores (in scoring.subdomainQuotients per middleware-mapping.md)
      identitySubdomainScores: t3Scoring.subdomainQuotients || t3.subdomainScores || null,

      // From Tool 4: Financial data (CRITICAL - required for Tool 6)
      // Tool 4 saves: monthlyIncome, goalTimeline, allocations.Multiply (percentage)
      monthlyTakeHome: monthlyIncome,
      yearsToRetirement: t4.goalTimeline || t4.yearsToRetirement || null,
      monthlyBudget: monthlyBudget, // M bucket dollar amount
      multiplyPercent: multiplyPercent, // Keep percentage too
      investmentScore: t4.investmentScore || 4, // Default to Moderate (4)
      tool4Allocation: t4.allocations || t4.allocation || null,

      // From Tool 5: Connection subdomain scores (in scoring.subdomainQuotients per middleware-mapping.md)
      connectionSubdomainScores: t5Scoring.subdomainQuotients || t5.subdomainScores || null
    };
  },

  /**
   * Get data availability status for UI display
   * Returns status badges (green/yellow/red) for each data category
   */
  getDataStatus(toolStatus) {
    // Define field requirements by category
    const categories = {
      demographics: {
        label: 'Demographics',
        fields: ['age', 'grossIncome', 'employmentType', 'filingStatus'],
        source: 'Tool 2',
        critical: false
      },
      financial: {
        label: 'Financial Data',
        fields: ['monthlyBudget', 'monthlyTakeHome', 'yearsToRetirement'],
        source: 'Tool 4',
        critical: true  // Tool 4 is REQUIRED
      },
      investment: {
        label: 'Investment Profile',
        fields: ['investmentScore'],
        source: 'Tool 4',
        critical: false
      },
      trauma: {
        label: 'Trauma Insights',
        fields: ['traumaPattern'],
        source: 'Tool 1',
        critical: false
      },
      identity: {
        label: 'Identity Insights',
        fields: ['identitySubdomainScores'],
        source: 'Tool 3',
        critical: false
      },
      connection: {
        label: 'Connection Insights',
        fields: ['connectionSubdomainScores'],
        source: 'Tool 5',
        critical: false
      }
    };

    const status = {};

    for (const [key, category] of Object.entries(categories)) {
      const presentFields = category.fields.filter(field => {
        const value = toolStatus[field];
        return value !== null && value !== undefined && value !== '' && value !== 0;
      });

      const totalFields = category.fields.length;
      const presentCount = presentFields.length;

      // Determine status: green (all), yellow (partial), red (none)
      let badgeStatus;
      if (presentCount === totalFields) {
        badgeStatus = 'complete';  // Green
      } else if (presentCount > 0) {
        badgeStatus = 'partial';   // Yellow
      } else {
        badgeStatus = 'missing';   // Red
      }

      status[key] = {
        label: category.label,
        source: category.source,
        status: badgeStatus,
        critical: category.critical,
        presentCount,
        totalFields,
        missingFields: category.fields.filter(f => !presentFields.includes(f))
      };
    }

    // Overall readiness check
    const financialReady = status.financial.status !== 'missing' && toolStatus.monthlyBudget > 0;
    const demographicsReady = status.demographics.status !== 'missing';

    status.overall = {
      canProceed: financialReady,
      readyForCalculation: financialReady && demographicsReady,
      blockerMessage: !financialReady
        ? 'Tool 4 must be completed first. Monthly retirement budget is required.'
        : null
    };

    return status;
  },

  /**
   * Get saved pre-survey data
   */
  getPreSurvey(clientId) {
    try {
      const preSurveyKey = `tool6_presurvey_${clientId}`;
      const preSurveyData = PropertiesService.getUserProperties().getProperty(preSurveyKey);
      return preSurveyData ? JSON.parse(preSurveyData) : null;
    } catch (error) {
      Logger.log(`Error getting pre-survey: ${error}`);
      return null;
    }
  },

  /**
   * Save pre-survey data and return updated page HTML
   */
  savePreSurvey(clientId, preSurveyData) {
    try {
      const preSurveyKey = `tool6_presurvey_${clientId}`;
      PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));
      Logger.log(`Pre-survey saved for client: ${clientId}`);

      // Recalculate with new data
      const toolStatus = this.checkToolCompletion(clientId);
      const savedPreSurvey = this.getPreSurvey(clientId);

      let allocation = null;
      let profile = null;

      if (savedPreSurvey) {
        try {
          profile = this.classifyProfile(clientId, savedPreSurvey, toolStatus);
          allocation = this.calculateAllocation(clientId, savedPreSurvey, profile, toolStatus);
        } catch (calcError) {
          Logger.log(`Error calculating allocation: ${calcError}`);
        }
      }

      const htmlContent = this.buildUnifiedPage(clientId, toolStatus, savedPreSurvey, profile, allocation);
      return { success: true, nextPageHtml: htmlContent };
    } catch (error) {
      Logger.log(`Error saving pre-survey: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Classify client into one of 9 investor profiles
   * Decision tree from spec section "Profile Classification System"
   */
  classifyProfile(clientId, preSurveyData, toolStatus) {
    // TODO: Implement profile classification decision tree (Sprint 2.1-2.4)
    // For now, return default profile (Foundation Builder)
    return {
      id: 7,
      name: 'Foundation Builder',
      description: 'Default profile - full classification coming in Sprint 2'
    };
  },

  /**
   * Calculate vehicle allocation using waterfall algorithm
   * Core logic from spec section "Vehicle Allocation Engine"
   */
  calculateAllocation(clientId, preSurveyData, profile, toolStatus) {
    // TODO: Implement allocation engine (Sprint 4.1-4.5)
    // For now, return placeholder with correct default domain weights
    return {
      vehicles: {},
      domainWeights: { Retirement: 0.60, Education: 0.20, Health: 0.20 },
      totalBudget: preSurveyData.monthlyBudget || 0,
      profile: profile,
      taxableBrokerage: 0  // Overflow vehicle - gets remaining after tax-advantaged
    };
  },

  /**
   * Build unified page with questionnaire + calculator
   */
  buildUnifiedPage(clientId, toolStatus, preSurveyData, profile, allocation) {
    const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();
    const hasPreSurvey = !!preSurveyData;
    const hasAllocation = !!allocation && allocation.totalBudget > 0;

    // Get data availability status for badges
    const dataStatus = this.getDataStatus(toolStatus);

    // Pre-fill form values from Tool 2/4 data if available
    const prefillData = this.getPrefillData(toolStatus);

    // Helper to generate status badge HTML
    const statusBadgeHtml = (status, label, source) => {
      const colors = {
        complete: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', icon: '&#10003;' },
        partial: { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', icon: '~' },
        missing: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', icon: '!' }
      };
      const c = colors[status] || colors.missing;
      return '<span class="status-badge status-' + status + '" title="Source: ' + source + '">' +
             '<span class="status-icon">' + c.icon + '</span>' + label + '</span>';
    };

    // Build data status badges HTML
    const dataStatusBadgesHtml = Object.entries(dataStatus)
      .filter(([key]) => key !== 'overall')
      .map(([key, info]) => statusBadgeHtml(info.status, info.label, info.source))
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Retirement Blueprint Calculator</title>
  ${styles}
  <style>
    /* Tool 6 specific styles */
    .tool6-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .section-card {
      background: var(--color-surface);
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .section-header {
      padding: 20px 24px;
      background: rgba(79, 70, 229, 0.1);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header:hover {
      background: rgba(79, 70, 229, 0.15);
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .section-toggle {
      font-size: 1.25rem;
      transition: transform 0.3s ease;
    }

    .section-toggle.collapsed {
      transform: rotate(-90deg);
    }

    .section-body {
      padding: 24px;
      transition: all 0.3s ease;
    }

    .section-body.collapsed {
      max-height: 0;
      padding: 0 24px;
      overflow: hidden;
      opacity: 0;
    }

    .section-summary {
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.02);
      display: none;
      font-size: 0.95rem;
      color: var(--color-text-secondary);
    }

    .section-summary.show {
      display: block;
    }

    .profile-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(79, 70, 229, 0.2);
      border-radius: 20px;
      font-weight: 500;
    }

    /* Data status badges */
    .data-status-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .status-complete {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    .status-complete .status-icon {
      background: #22c55e;
      color: white;
    }

    .status-partial {
      background: rgba(234, 179, 8, 0.2);
      color: #eab308;
    }
    .status-partial .status-icon {
      background: #eab308;
      color: white;
    }

    .status-missing {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .status-missing .status-icon {
      background: #ef4444;
      color: white;
    }

    .blocker-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 16px 20px;
      margin: 16px 0;
      color: #fca5a5;
    }

    .blocker-message strong {
      color: #ef4444;
    }

    .data-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .data-summary-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 12px 16px;
    }

    .data-summary-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .data-summary-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .data-summary-value.missing {
      color: var(--color-text-muted);
      font-style: italic;
      font-weight: normal;
    }

    .vehicle-slider-row {
      display: grid;
      grid-template-columns: 200px 1fr 100px;
      gap: 16px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .vehicle-name {
      font-weight: 500;
    }

    .vehicle-amount {
      font-family: monospace;
      font-size: 1.1rem;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
    }

    .btn-primary:disabled {
      background: rgba(79, 70, 229, 0.3);
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: var(--color-text-primary);
      font-size: 1rem;
    }

    .form-input[type="number"] {
      max-width: 300px;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .placeholder-message {
      padding: 40px;
      text-align: center;
      color: var(--color-text-muted);
    }

    .placeholder-message h3 {
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    /* Questionnaire Styles */
    .questionnaire-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .questionnaire-section:last-child {
      border-bottom: none;
    }

    .section-subtitle {
      color: var(--color-primary);
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .section-description {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      margin-bottom: 20px;
    }

    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group.hidden {
      display: none;
    }

    .required-star {
      color: #ef4444;
      margin-left: 2px;
    }

    .form-help {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 6px;
    }

    .currency-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 12px;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .currency-input {
      padding-left: 28px !important;
    }

    .yesno-buttons {
      display: flex;
      gap: 8px;
    }

    .yesno-btn {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .yesno-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .yesno-btn.selected {
      background: rgba(79, 70, 229, 0.3);
      border-color: var(--color-primary);
      color: var(--color-text-primary);
    }

    .ranking-inputs {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ranking-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .ranking-label {
      flex: 1;
      color: var(--color-text-secondary);
    }

    .ranking-select {
      width: 80px;
    }

    .form-actions {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .form-input:invalid {
      border-color: #ef4444;
    }

    /* Submit Button - matches Tool 4 style */
    .submit-btn {
      background: var(--gold, #ffc107);
      color: #140f23;
      border: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      max-width: 400px;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 20px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(255, 193, 7, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Error Message - matches Tool 4 style */
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 12px 20px;
      border-radius: 8px;
      margin-top: 16px;
      display: none;
      max-width: 400px;
      text-align: center;
    }

    .error-message.show {
      display: block;
    }

    /* Loading overlay - matches Tool 4 style */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-overlay.show {
      display: flex;
    }

    .loading-content {
      text-align: center;
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid #4f46e5;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .loading-subtext {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <!-- Loading Overlay - matches Tool 4 structure -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <div class="loading-text" id="loadingText">Calculating Your Allocation...</div>
      <div class="loading-subtext" id="loadingSubtext">Analyzing your retirement profile</div>
    </div>
  </div>

  <div class="tool6-container">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 2rem; color: var(--color-text-primary); margin-bottom: 8px;">
        Retirement Blueprint Calculator
      </h1>
      <p style="color: var(--color-text-secondary); font-size: 1.1rem;">
        Optimize your retirement vehicle allocations for maximum tax efficiency
      </p>
    </div>

    <!-- Data Status Bar -->
    <div class="section-card" style="margin-bottom: 16px;">
      <div class="data-status-bar">
        <span style="color: var(--color-text-muted); margin-right: 8px;">Data from previous tools:</span>
        ${dataStatusBadgesHtml}
      </div>
      ${!dataStatus.overall.canProceed ? `
      <div class="blocker-message">
        <strong>Action Required:</strong> ${dataStatus.overall.blockerMessage}
      </div>
      ` : ''}
    </div>

    <!-- Section 1: Your Profile (Questionnaire) -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('profile')">
        <div class="section-title">1. Your Financial Profile</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${hasPreSurvey ? '<span class="profile-badge">Profile: ' + (profile?.name || 'Calculating...') + '</span>' : ''}
          <span class="section-toggle ${hasPreSurvey ? 'collapsed' : ''}" id="profileToggle">&#9660;</span>
        </div>
      </div>

      ${hasPreSurvey ? `
      <div class="section-summary show" id="profileSummary">
        <strong>Monthly Budget:</strong> $${(preSurveyData.monthlyBudget || 0).toLocaleString()} |
        <strong>Age:</strong> ${preSurveyData.age || prefillData.age || 'Not set'} |
        <strong>Filing Status:</strong> ${preSurveyData.filingStatus || 'Single'}
      </div>
      ` : ''}

      <div class="section-body ${hasPreSurvey ? 'collapsed' : ''}" id="profileBody">
        <!-- Data Summary from Tools 1-5 -->
        <div style="margin-bottom: 24px;">
          <h4 style="color: var(--color-text-secondary); margin-bottom: 12px;">Data Pulled from Previous Tools</h4>
          <div class="data-summary">
            <div class="data-summary-item">
              <div class="data-summary-label">Age</div>
              <div class="data-summary-value ${!toolStatus.age ? 'missing' : ''}">${toolStatus.age || 'Not available'}</div>
            </div>
            <div class="data-summary-item">
              <div class="data-summary-label">Gross Income</div>
              <div class="data-summary-value ${!toolStatus.grossIncome ? 'missing' : ''}">
                ${toolStatus.grossIncome ? '$' + Number(toolStatus.grossIncome).toLocaleString() : 'Not available'}
              </div>
            </div>
            <div class="data-summary-item">
              <div class="data-summary-label">Filing Status</div>
              <div class="data-summary-value ${!toolStatus.filingStatus ? 'missing' : ''}">${toolStatus.filingStatus || 'Not available'}</div>
            </div>
            <div class="data-summary-item">
              <div class="data-summary-label">Monthly Retirement Budget</div>
              <div class="data-summary-value ${!toolStatus.monthlyBudget ? 'missing' : ''}">
                ${toolStatus.monthlyBudget ? '$' + Number(toolStatus.monthlyBudget).toLocaleString() : 'Not available'}
              </div>
            </div>
            <div class="data-summary-item">
              <div class="data-summary-label">Years to Retirement</div>
              <div class="data-summary-value ${!toolStatus.yearsToRetirement ? 'missing' : ''}">${toolStatus.yearsToRetirement || 'Not available'}</div>
            </div>
            <div class="data-summary-item">
              <div class="data-summary-label">Investment Score</div>
              <div class="data-summary-value">${toolStatus.investmentScore}/7 (${INVESTMENT_SCORE_LABELS[toolStatus.investmentScore] || 'Moderate'})</div>
            </div>
          </div>
        </div>

        <!-- Questionnaire Form -->
        ${this.buildQuestionnaireHtml(preSurveyData, prefillData)}
      </div>
    </div>

    <!-- Section 2: Vehicle Allocation Calculator -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('calculator')">
        <div class="section-title">2. Vehicle Allocation</div>
        <span class="section-toggle" id="calculatorToggle">&#9660;</span>
      </div>

      <div class="section-body" id="calculatorBody">
        ${hasAllocation ? `
        <div class="placeholder-message">
          <h3>Coming Soon: Sprint 4-5</h3>
          <p>Vehicle allocation sliders with IRS limit enforcement.</p>
          <p>Real-time recalculation as you adjust allocations.</p>
        </div>
        ` : `
        <div class="placeholder-message">
          <h3>${dataStatus.overall.canProceed ? 'Complete Your Profile First' : 'Tool 4 Required'}</h3>
          <p>${dataStatus.overall.canProceed
            ? 'Answer the questions above to get your personalized vehicle allocation.'
            : 'Please complete Tool 4 (Financial Freedom Framework) to set your retirement savings budget.'
          }</p>
        </div>
        `}
      </div>
    </div>

    <!-- Section 3: Projections -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('projections')">
        <div class="section-title">3. Future Value Projections</div>
        <span class="section-toggle collapsed" id="projectionsToggle">&#9660;</span>
      </div>

      <div class="section-body collapsed" id="projectionsBody">
        <div class="placeholder-message">
          <h3>Coming Soon: Sprint 6</h3>
          <p>Future value calculations with inflation adjustment.</p>
          <p>Actual vs Ideal scenario comparison.</p>
        </div>
      </div>
    </div>

    <!-- Section 4: Saved Scenarios -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('scenarios')">
        <div class="section-title">4. Saved Scenarios</div>
        <span class="section-toggle collapsed" id="scenariosToggle">&#9660;</span>
      </div>

      <div class="section-body collapsed" id="scenariosBody">
        <div class="placeholder-message">
          <h3>Coming Soon: Sprint 7</h3>
          <p>Save, load, and compare multiple allocation scenarios.</p>
        </div>
      </div>
    </div>

  </div>

  <script>
    var clientId = '${clientId}';
    var formData = ${JSON.stringify(preSurveyData || {})};

    // Conditional visibility rules (must match QUESTIONNAIRE_FIELDS.showIf)
    var visibilityRules = {
      q7_matchFormula: function() { return formData.q6_hasMatch === 'Yes'; },
      q8_hasRoth401k: function() { return formData.q5_has401k === 'Yes'; },
      q10_robsNewBusiness: function() { return ['Yes', 'Interested'].includes(formData.q4_robsInterest); },
      q11_robsBalance: function() { return ['Yes', 'Interested'].includes(formData.q4_robsInterest); },
      q12_robsSetupCost: function() { return ['Yes', 'Interested'].includes(formData.q4_robsInterest); },
      q14_yearsToEducation: function() { return formData.q13_hasChildren === 'Yes'; },
      q17_current401kBalance: function() { return formData.q5_has401k === 'Yes'; },
      q19_currentHSABalance: function() { return formData.q9_hsaEligible === 'Yes'; },
      q20_monthly401kContribution: function() { return formData.q5_has401k === 'Yes'; },
      q22_monthlyHSAContribution: function() { return formData.q9_hsaEligible === 'Yes'; }
    };

    function toggleSection(sectionId) {
      var body = document.getElementById(sectionId + 'Body');
      var toggle = document.getElementById(sectionId + 'Toggle');
      var summary = document.getElementById(sectionId + 'Summary');

      body.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
      if (summary) summary.classList.toggle('show');
    }

    // Handle field value changes
    function handleFieldChange(fieldId, value) {
      formData[fieldId] = value;
      updateVisibility();
    }

    // Handle Yes/No button clicks
    function selectYesNo(fieldId, value) {
      var buttons = document.querySelectorAll('#group_' + fieldId + ' .yesno-btn');
      buttons.forEach(function(btn) {
        btn.classList.remove('selected');
        if (btn.textContent === value) {
          btn.classList.add('selected');
        }
      });
      document.getElementById(fieldId).value = value;
      formData[fieldId] = value;
      updateVisibility();
    }

    // Handle ranking updates
    function updateRanking(fieldId) {
      var ranks = {
        retirement: parseInt(document.getElementById(fieldId + '_retirement').value),
        education: parseInt(document.getElementById(fieldId + '_education').value),
        health: parseInt(document.getElementById(fieldId + '_health').value)
      };
      document.getElementById(fieldId).value = JSON.stringify(ranks);
      formData[fieldId] = ranks;
    }

    // Update conditional field visibility
    function updateVisibility() {
      for (var fieldId in visibilityRules) {
        var group = document.getElementById('group_' + fieldId);
        if (group) {
          var shouldShow = visibilityRules[fieldId]();
          if (shouldShow) {
            group.classList.remove('hidden');
          } else {
            group.classList.add('hidden');
            // Clear value when hidden
            var input = document.getElementById(fieldId);
            if (input) input.value = '';
            formData[fieldId] = null;
          }
        }
      }
    }

    // Validate form before submission
    function validateForm() {
      var errors = [];
      var requiredFields = [
        { id: 'q1_grossIncome', label: 'Gross annual income' },
        { id: 'q2_yearsToRetirement', label: 'Years to retirement' },
        { id: 'q3_hasW2Employees', label: 'W-2 employees question' },
        { id: 'q4_robsInterest', label: 'ROBS interest' },
        { id: 'q5_has401k', label: '401(k) availability' },
        { id: 'q6_hasMatch', label: 'Employer match' },
        { id: 'q9_hsaEligible', label: 'HSA eligibility' },
        { id: 'q13_hasChildren', label: 'Children/education question' },
        { id: 'q15_priorityRanking', label: 'Priority ranking' },
        { id: 'q16_currentRetirementBalance', label: 'Current retirement balance' },
        { id: 'q18_currentIRABalance', label: 'Current IRA balance' },
        { id: 'q21_monthlyIRAContribution', label: 'Monthly IRA contribution' }
      ];

      requiredFields.forEach(function(field) {
        var input = document.getElementById(field.id);
        var group = document.getElementById('group_' + field.id);

        // Skip validation if field is hidden
        if (group && group.classList.contains('hidden')) return;

        if (!input || !input.value || input.value === '') {
          errors.push(field.label + ' is required');
        }
      });

      // Validate grossIncome is positive
      var grossIncome = parseFloat(document.getElementById('q1_grossIncome').value);
      if (grossIncome <= 0) {
        errors.push('Gross income must be greater than 0');
      }

      // Validate yearsToRetirement is reasonable
      var years = parseInt(document.getElementById('q2_yearsToRetirement').value);
      if (years < 1 || years > 50) {
        errors.push('Years to retirement must be between 1 and 50');
      }

      return errors;
    }

    // Submit questionnaire - matches Tool 4 pattern
    function submitQuestionnaire() {
      var errors = validateForm();
      var errorDiv = document.getElementById('errorMessage');

      if (errors.length > 0) {
        errorDiv.innerHTML = errors.join('<br>');
        errorDiv.classList.add('show');
        return;
      }

      errorDiv.classList.remove('show');

      // Collect all form data
      var form = document.getElementById('questionnaireForm');
      var inputs = form.querySelectorAll('input, select');
      var submitData = {};

      inputs.forEach(function(input) {
        if (input.name && input.value) {
          // Parse numbers for currency/number fields
          if (input.type === 'number') {
            submitData[input.name] = parseFloat(input.value) || 0;
          } else if (input.name === 'q15_priorityRanking') {
            try {
              submitData[input.name] = JSON.parse(input.value);
            } catch (e) {
              submitData[input.name] = { retirement: 1, education: 2, health: 3 };
            }
          } else {
            submitData[input.name] = input.value;
          }
        }
      });

      // Add monthlyBudget from Tool 4 (already available in toolStatus)
      submitData.monthlyBudget = ${toolStatus.monthlyBudget || 0};

      // Show loading overlay (matches Tool 4 pattern)
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Calculating Your Allocation...';
        if (loadingSubtext) loadingSubtext.textContent = 'Analyzing your retirement profile';
        loadingOverlay.classList.add('show');
      }

      // Disable submit button
      var submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
      }

      // Submit to server using document.write() pattern (GAS iframe navigation)
      google.script.run
        .withSuccessHandler(function(result) {
          if (result && result.success === false) {
            // Hide loading and show error
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.style.opacity = '1';
            }
            errorDiv.innerHTML = result.error || 'An error occurred. Please try again.';
            errorDiv.classList.add('show');
            return;
          }

          // Use document.write() pattern (GAS iframe navigation)
          if (result && result.nextPageHtml) {
            document.open();
            document.write(result.nextPageHtml);
            document.close();
            window.scrollTo(0, 0);
          }
        })
        .withFailureHandler(function(error) {
          // Hide loading and show error
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
          }
          errorDiv.innerHTML = 'Server error: ' + error.message;
          errorDiv.classList.add('show');
        })
        .savePreSurveyTool6(clientId, submitData);
    }

    // Initialize visibility on page load
    document.addEventListener('DOMContentLoaded', function() {
      updateVisibility();
    });

    // Also run immediately in case DOMContentLoaded already fired
    updateVisibility();
  </script>
</body>
</html>
    `;
  },

  /**
   * Build questionnaire form HTML
   * Renders all questions with conditional visibility handled client-side
   */
  buildQuestionnaireHtml(preSurveyData, prefillData) {
    const savedAnswers = preSurveyData || {};

    // Helper to get value (saved > prefill > empty)
    const getValue = (fieldId, prefillKey) => {
      if (savedAnswers[fieldId] !== undefined && savedAnswers[fieldId] !== null) {
        return savedAnswers[fieldId];
      }
      if (prefillKey && prefillData[prefillKey] !== undefined && prefillData[prefillKey] !== null) {
        return prefillData[prefillKey];
      }
      return '';
    };

    // Build HTML for each section
    let html = '<form id="questionnaireForm" onsubmit="return false;">';

    for (const section of QUESTIONNAIRE_SECTIONS) {
      html += `
        <div class="questionnaire-section" id="section_${section.id}">
          <h4 class="section-subtitle">${section.title}</h4>
          <p class="section-description">${section.description}</p>
          <div class="questions-grid">
      `;

      for (const fieldId of section.fields) {
        const field = QUESTIONNAIRE_FIELDS[fieldId];
        if (!field) continue;

        // Determine prefill key mapping
        let prefillKey = null;
        if (fieldId === 'q1_grossIncome') prefillKey = 'income';
        if (fieldId === 'q2_yearsToRetirement') prefillKey = 'yearsToRetirement';

        const value = getValue(fieldId, prefillKey);
        const isRequired = field.required ? 'required' : '';
        const hasShowIf = field.showIf ? 'data-show-if="true"' : '';

        html += `
          <div class="form-group" id="group_${fieldId}" ${hasShowIf}>
            <label class="form-label" for="${fieldId}">
              ${field.label}
              ${field.required ? '<span class="required-star">*</span>' : ''}
            </label>
        `;

        // Render different input types
        switch (field.type) {
          case 'currency':
            html += `
              <div class="currency-input-wrapper">
                <span class="currency-symbol">$</span>
                <input type="number"
                       id="${fieldId}"
                       name="${fieldId}"
                       class="form-input currency-input"
                       value="${value}"
                       placeholder="${field.placeholder || ''}"
                       min="0"
                       step="1"
                       ${isRequired}
                       onchange="handleFieldChange('${fieldId}', this.value)">
              </div>
            `;
            break;

          case 'number':
            html += `
              <input type="number"
                     id="${fieldId}"
                     name="${fieldId}"
                     class="form-input"
                     value="${value}"
                     placeholder="${field.placeholder || ''}"
                     min="${field.min || 0}"
                     max="${field.max || 999}"
                     ${isRequired}
                     onchange="handleFieldChange('${fieldId}', this.value)">
            `;
            break;

          case 'yesno':
            html += `
              <div class="yesno-buttons">
                <button type="button"
                        class="yesno-btn ${value === 'Yes' ? 'selected' : ''}"
                        onclick="selectYesNo('${fieldId}', 'Yes')">Yes</button>
                <button type="button"
                        class="yesno-btn ${value === 'No' ? 'selected' : ''}"
                        onclick="selectYesNo('${fieldId}', 'No')">No</button>
                <input type="hidden" id="${fieldId}" name="${fieldId}" value="${value}">
              </div>
            `;
            break;

          case 'yesnoNA':
            html += `
              <div class="yesno-buttons">
                <button type="button"
                        class="yesno-btn ${value === 'Yes' ? 'selected' : ''}"
                        onclick="selectYesNo('${fieldId}', 'Yes')">Yes</button>
                <button type="button"
                        class="yesno-btn ${value === 'No' ? 'selected' : ''}"
                        onclick="selectYesNo('${fieldId}', 'No')">No</button>
                <button type="button"
                        class="yesno-btn ${value === 'N/A' ? 'selected' : ''}"
                        onclick="selectYesNo('${fieldId}', 'N/A')">N/A</button>
                <input type="hidden" id="${fieldId}" name="${fieldId}" value="${value}">
              </div>
            `;
            break;

          case 'select':
            html += `<select id="${fieldId}" name="${fieldId}" class="form-input" ${isRequired} onchange="handleFieldChange('${fieldId}', this.value)">`;
            for (const opt of field.options) {
              const selected = value === opt.value ? 'selected' : '';
              html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
            }
            html += '</select>';
            break;

          case 'ranking':
            // Simplified ranking - just 3 dropdowns for now
            const ranks = value ? (typeof value === 'string' ? JSON.parse(value) : value) : { retirement: 1, education: 2, health: 3 };
            html += `
              <div class="ranking-inputs">
                <div class="ranking-row">
                  <span class="ranking-label">Retirement security</span>
                  <select id="${fieldId}_retirement" class="form-input ranking-select" onchange="updateRanking('${fieldId}')">
                    <option value="1" ${ranks.retirement === 1 ? 'selected' : ''}>1st</option>
                    <option value="2" ${ranks.retirement === 2 ? 'selected' : ''}>2nd</option>
                    <option value="3" ${ranks.retirement === 3 ? 'selected' : ''}>3rd</option>
                  </select>
                </div>
                <div class="ranking-row">
                  <span class="ranking-label">Children's education</span>
                  <select id="${fieldId}_education" class="form-input ranking-select" onchange="updateRanking('${fieldId}')">
                    <option value="1" ${ranks.education === 1 ? 'selected' : ''}>1st</option>
                    <option value="2" ${ranks.education === 2 ? 'selected' : ''}>2nd</option>
                    <option value="3" ${ranks.education === 3 ? 'selected' : ''}>3rd</option>
                  </select>
                </div>
                <div class="ranking-row">
                  <span class="ranking-label">Health/medical expenses</span>
                  <select id="${fieldId}_health" class="form-input ranking-select" onchange="updateRanking('${fieldId}')">
                    <option value="1" ${ranks.health === 1 ? 'selected' : ''}>1st</option>
                    <option value="2" ${ranks.health === 2 ? 'selected' : ''}>2nd</option>
                    <option value="3" ${ranks.health === 3 ? 'selected' : ''}>3rd</option>
                  </select>
                </div>
                <input type="hidden" id="${fieldId}" name="${fieldId}" value='${JSON.stringify(ranks)}'>
              </div>
            `;
            break;

          default:
            html += `
              <input type="text"
                     id="${fieldId}"
                     name="${fieldId}"
                     class="form-input"
                     value="${value}"
                     placeholder="${field.placeholder || ''}"
                     ${isRequired}
                     onchange="handleFieldChange('${fieldId}', this.value)">
            `;
        }

        if (field.helpText) {
          html += `<div class="form-help">${field.helpText}</div>`;
        }

        html += '</div>';  // Close form-group
      }

      html += '</div></div>';  // Close questions-grid and section
    }

    html += `
      <div class="form-actions">
        <button type="button" class="submit-btn" onclick="submitQuestionnaire()" id="submitBtn">
          Calculate My Allocation
        </button>
        <div id="errorMessage" class="error-message"></div>
      </div>
    </form>`;

    return html;
  },

  /**
   * Get prefill data from Tool 2/4 responses
   * Now uses mapped fields from checkToolCompletion()
   */
  getPrefillData(toolStatus) {
    // toolStatus now includes mapped fields from mapUpstreamFields()
    // Return a subset for form prefilling
    return {
      age: toolStatus.age || null,
      income: toolStatus.grossIncome || null,
      employmentType: toolStatus.employmentType || null,
      filingStatus: toolStatus.filingStatus || null,
      businessOwner: toolStatus.businessOwner || false,
      monthlyBudget: toolStatus.monthlyBudget || null,
      monthlyTakeHome: toolStatus.monthlyTakeHome || null,
      yearsToRetirement: toolStatus.yearsToRetirement || null,
      investmentScore: toolStatus.investmentScore || 4,
      hsaCoverageType: toolStatus.hsaCoverageType || 'Individual',
      traumaPattern: toolStatus.traumaPattern || null
    };
  },

  /**
   * Render error page
   */
  renderError(error) {
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Tool 6</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; background: #1a1a2e; color: #eee; }
          .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 24px; border-radius: 8px; }
          h1 { color: #ef4444; }
          pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>Tool 6 Error</h1>
          <p>${error.message || error.toString()}</p>
          <pre>${error.stack || 'No stack trace available'}</pre>
        </div>
      </body>
      </html>
    `);
  },

  /**
   * Save scenario to sheet
   */
  saveScenario(clientId, scenario) {
    // TODO: Implement in Sprint 7
    return { success: false, error: 'Not yet implemented' };
  },

  /**
   * Get all scenarios for a client
   */
  getScenarios(clientId) {
    // TODO: Implement in Sprint 7
    return [];
  },

  /**
   * Generate PDF report
   */
  generatePDF(clientId, scenario) {
    // TODO: Implement in Sprint 10
    return { success: false, error: 'Not yet implemented' };
  }
};

// ============================================================================
// GLOBAL FUNCTION WRAPPERS (for google.script.run calls)
// ============================================================================

/**
 * Global wrapper for saving Tool 6 pre-survey data
 * Called from client-side JavaScript via google.script.run
 */
function savePreSurveyTool6(clientId, preSurveyData) {
  return Tool6.savePreSurvey(clientId, preSurveyData);
}
