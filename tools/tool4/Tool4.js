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
   * Phase 2: Pre-survey → Calculator flow
   */
  render(params) {
    const clientId = params.clientId;
    const baseUrl = ScriptApp.getService().getUrl();

    try {
      // Check Tools 1/2/3 completion status
      const toolStatus = this.checkToolCompletion(clientId);

      // Check if pre-survey completed
      const preSurveyData = this.getPreSurvey(clientId);

      // Calculate V1 allocation if pre-survey exists
      let allocation = null;
      if (preSurveyData) {
        try {
          const v1Input = this.buildV1Input(clientId, preSurveyData);
          allocation = this.calculateAllocationV1(v1Input);
        } catch (allocError) {
          Logger.log(`Error calculating allocation: ${allocError}`);
          Logger.log(`Pre-survey data: ${JSON.stringify(preSurveyData)}`);
          // Continue without allocation - will show empty calculator
        }
      }

      // Always show unified page (pre-survey + calculator in one view)
      const htmlContent = this.buildUnifiedPage(clientId, baseUrl, toolStatus, preSurveyData, allocation);

      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('TruPath - Financial Freedom Framework')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering Tool 4: ${error}`);
      Logger.log(`Error stack: ${error.stack}`);
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
   * Prefill test data for faster testing (dev mode)
   */
  prefillTestData(clientId) {
    const testData = {
      monthlyIncome: 3500,
      monthlyEssentials: 2000,
      satisfaction: 5,
      discipline: 7,
      impulse: 6,
      longTerm: 8,
      lifestyle: 4,
      autonomy: 6
    };

    return this.savePreSurvey(clientId, testData);
  },

  /**
   * Save pre-survey data and return updated page HTML (Phase 2)
   */
  savePreSurvey(clientId, preSurveyData) {
    try {
      const preSurveyKey = `tool4_presurvey_${clientId}`;
      PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));
      Logger.log(`Pre-survey saved for client: ${clientId}`);

      // Return updated HTML - calculate allocation ONLY if priority already selected
      const baseUrl = ScriptApp.getService().getUrl();
      const toolStatus = this.checkToolCompletion(clientId);
      const savedPreSurvey = this.getPreSurvey(clientId);

      // If user already selected a priority (updating profile), recalculate allocation
      // If no priority yet (first time), show priority picker with no allocation
      let allocation = null;
      if (savedPreSurvey && savedPreSurvey.selectedPriority && savedPreSurvey.goalTimeline) {
        try {
          const v1Input = this.buildV1Input(clientId, savedPreSurvey);
          allocation = this.calculateAllocationV1(v1Input);
          Logger.log(`Recalculated allocation for priority: ${savedPreSurvey.selectedPriority}`);
        } catch (allocError) {
          Logger.log(`Error calculating allocation: ${allocError}`);
        }
      }

      const htmlContent = this.buildUnifiedPage(clientId, baseUrl, toolStatus, savedPreSurvey, allocation);
      return { success: true, nextPageHtml: htmlContent };
    } catch (error) {
      Logger.log(`Error saving pre-survey: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get saved pre-survey data (Phase 2)
   */
  getPreSurvey(clientId) {
    try {
      const preSurveyKey = `tool4_presurvey_${clientId}`;
      const preSurveyData = PropertiesService.getUserProperties().getProperty(preSurveyKey);
      return preSurveyData ? JSON.parse(preSurveyData) : null;
    } catch (error) {
      Logger.log(`Error getting pre-survey: ${error}`);
      return null;
    }
  },

  /**
   * Save priority selection and calculate allocation (Phase 3)
   */
  savePrioritySelection(clientId, selectedPriority, goalTimeline) {
    try {
      // Get existing pre-survey data
      const savedPreSurvey = this.getPreSurvey(clientId);
      if (!savedPreSurvey) {
        throw new Error('Pre-survey data not found. Please complete the profile first.');
      }

      // Update pre-survey with selected priority and timeline
      savedPreSurvey.selectedPriority = selectedPriority;
      savedPreSurvey.goalTimeline = goalTimeline;

      // Save updated pre-survey
      const preSurveyKey = `tool4_presurvey_${clientId}`;
      PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(savedPreSurvey));
      Logger.log(`Priority selection saved for client: ${clientId} - Priority: ${selectedPriority}, Timeline: ${goalTimeline}`);

      // Calculate V1 allocation with the selected priority
      const baseUrl = ScriptApp.getService().getUrl();
      const toolStatus = this.checkToolCompletion(clientId);
      let allocation = null;

      try {
        const v1Input = this.buildV1Input(clientId, savedPreSurvey);
        allocation = this.calculateAllocationV1(v1Input);
      } catch (allocError) {
        Logger.log(`Error calculating allocation: ${allocError}`);
      }

      // Return updated page HTML with priority picker collapsed and calculator showing allocation
      const htmlContent = this.buildUnifiedPage(clientId, baseUrl, toolStatus, savedPreSurvey, allocation);
      return { success: true, nextPageHtml: htmlContent };
    } catch (error) {
      Logger.log(`Error saving priority selection: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save a custom allocation scenario (Phase 3B)
   * Stores user's custom allocation for comparison and future reference
   */
  saveScenario(clientId, scenario) {
    try {
      Logger.log(`saveScenario called for client ${clientId}`);
      Logger.log(`Scenario data: ${JSON.stringify(scenario)}`);

      // Validate scenario data
      if (!scenario || !scenario.name || !scenario.allocations) {
        throw new Error('Invalid scenario data');
      }

      // Validate allocations exist and sum to 100%
      if (!scenario.allocations.Multiply && scenario.allocations.Multiply !== 0) {
        throw new Error('Missing Multiply allocation');
      }
      if (!scenario.allocations.Essentials && scenario.allocations.Essentials !== 0) {
        throw new Error('Missing Essentials allocation');
      }
      if (!scenario.allocations.Freedom && scenario.allocations.Freedom !== 0) {
        throw new Error('Missing Freedom allocation');
      }
      if (!scenario.allocations.Enjoyment && scenario.allocations.Enjoyment !== 0) {
        throw new Error('Missing Enjoyment allocation');
      }

      const total = scenario.allocations.Multiply + scenario.allocations.Essentials +
                    scenario.allocations.Freedom + scenario.allocations.Enjoyment;
      Logger.log(`Allocations total: ${total}%`);
      if (Math.abs(total - 100) > 1) {
        throw new Error(`Allocations must sum to 100% (currently ${total}%)`);
      }

      // Get TOOL4_SCENARIOS sheet using SpreadsheetCache
      let scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL4_SCENARIOS);

      // Create sheet if it doesn't exist
      if (!scenariosSheet) {
        Logger.log('TOOL4_SCENARIOS sheet does not exist, creating...');
        const ss = SpreadsheetCache.getSpreadsheet();
        scenariosSheet = ss.insertSheet(CONFIG.SHEETS.TOOL4_SCENARIOS);

        // Add headers to match the existing TOOL4_SCENARIOS tab structure
        scenariosSheet.appendRow([
          'Timestamp', 'Client_ID', 'Scenario_Name', 'Priority_Selected', 'Monthly_Income',
          'Current_Essentials', 'Debt_Balance', 'Interest_Rate', 'Emergency_Fund', 'Income_Stability',
          'Rent_Mortgage', 'Groceries', 'Dining_Takeout', 'Transportation', 'Utilities', 'Insurance',
          'Subscriptions', 'Other_Essentials', 'Rec_M_Percent', 'Rec_E_Percent', 'Rec_F_Percent',
          'Rec_J_Percent', 'Rec_M_Dollars', 'Rec_E_Dollars', 'Rec_F_Dollars', 'Rec_J_Dollars',
          'Custom_M_Percent', 'Custom_E_Percent', 'Custom_F_Percent', 'Custom_J_Percent', 'Is_Custom',
          'Report_Generated', 'Tool1_Source', 'Tool2_Source', 'Tool3_Source', 'Backup_Data'
        ]);

        // Flush to ensure headers are written
        SpreadsheetApp.flush();
        Logger.log('TOOL4_SCENARIOS sheet created with headers');
      }

      // Calculate dollar amounts
      const monthlyIncome = scenario.monthlyIncome || 0;
      const multiplyDollar = Math.round(monthlyIncome * scenario.allocations.Multiply / 100);
      const essentialsDollar = Math.round(monthlyIncome * scenario.allocations.Essentials / 100);
      const freedomDollar = Math.round(monthlyIncome * scenario.allocations.Freedom / 100);
      const enjoymentDollar = Math.round(monthlyIncome * scenario.allocations.Enjoyment / 100);

      // Get pre-survey data for full scenario context
      const preSurveyData = this.getPreSurvey(clientId) || {};

      // Save scenario to TOOL4_SCENARIOS sheet (matching all headers)
      const row = [
        new Date(),                                    // Timestamp
        clientId,                                       // Client_ID
        scenario.name,                                  // Scenario_Name
        scenario.priority || '',                        // Priority_Selected
        monthlyIncome,                                  // Monthly_Income
        preSurveyData.monthlyEssentials || '',          // Current_Essentials
        preSurveyData.debtBalance || '',                // Debt_Balance
        preSurveyData.interestRate || '',               // Interest_Rate
        preSurveyData.emergencyFund || '',              // Emergency_Fund
        preSurveyData.incomeStability || '',            // Income_Stability
        '', '', '', '', '', '', '', '',                 // Category breakdowns (not captured yet)
        scenario.allocations.Multiply,                  // Rec_M_Percent (using custom as recommended for saved scenario)
        scenario.allocations.Essentials,                // Rec_E_Percent
        scenario.allocations.Freedom,                   // Rec_F_Percent
        scenario.allocations.Enjoyment,                 // Rec_J_Percent
        multiplyDollar,                                 // Rec_M_Dollars
        essentialsDollar,                               // Rec_E_Dollars
        freedomDollar,                                  // Rec_F_Dollars
        enjoymentDollar,                                // Rec_J_Dollars
        scenario.allocations.Multiply,                  // Custom_M_Percent
        scenario.allocations.Essentials,                // Custom_E_Percent
        scenario.allocations.Freedom,                   // Custom_F_Percent
        scenario.allocations.Enjoyment,                 // Custom_J_Percent
        true,                                           // Is_Custom
        false,                                          // Report_Generated
        '', '', '', ''                                  // Tool1/2/3_Source, Backup_Data
      ];

      Logger.log(`Row data to append (${row.length} columns):`);
      Logger.log(`  [0] Timestamp: ${row[0]}`);
      Logger.log(`  [1] Client_ID: ${row[1]}`);
      Logger.log(`  [2] Scenario_Name: ${row[2]}`);
      Logger.log(`  [3] Priority: ${row[3]}`);
      Logger.log(`  [4] Monthly_Income: ${row[4]}`);
      Logger.log(`  [18-21] Rec M/E/F/J: ${row[18]}, ${row[19]}, ${row[20]}, ${row[21]}`);
      Logger.log(`  [26-29] Custom M/E/F/J: ${row[26]}, ${row[27]}, ${row[28]}, ${row[29]}`);
      Logger.log(`  [30] Is_Custom: ${row[30]}`);

      // Verify sheet before append
      Logger.log(`Sheet name: ${scenariosSheet.getName()}, Sheet ID: ${scenariosSheet.getSheetId()}`);
      Logger.log(`Current row count before append: ${scenariosSheet.getLastRow()}`);

      // Append the row
      scenariosSheet.appendRow(row);

      // Flush to ensure data is written immediately
      SpreadsheetApp.flush();
      Logger.log(`Scenario row appended and flushed for client ${clientId}`);

      // Verify the append worked
      const newRowCount = scenariosSheet.getLastRow();
      Logger.log(`Row count after append: ${newRowCount}`);

      // Read back the last row to verify
      if (newRowCount > 1) {
        const lastRow = scenariosSheet.getRange(newRowCount, 1, 1, 5).getValues()[0];
        Logger.log(`Verification - Last row data: ${JSON.stringify(lastRow)}`);
      }

      // Count scenarios for this client and enforce limit
      const MAX_SCENARIOS_PER_CLIENT = 10;
      const dataRange = scenariosSheet.getDataRange().getValues();
      const headers = dataRange[0];
      const timestampCol = headers.indexOf('Timestamp');
      const clientIdCol = headers.indexOf('Client_ID');
      const scenarioNameCol = headers.indexOf('Scenario_Name');

      // Find all scenarios for this client with their row indices
      const clientScenarioRows = [];
      for (let i = 1; i < dataRange.length; i++) {
        if (dataRange[i][clientIdCol] === clientId) {
          clientScenarioRows.push({
            rowIndex: i + 1, // 1-indexed for sheet operations
            timestamp: dataRange[i][timestampCol],
            name: dataRange[i][scenarioNameCol]
          });
        }
      }

      Logger.log(`Client ${clientId} now has ${clientScenarioRows.length} scenario(s)`);

      // If over limit, delete the oldest scenario (FIFO)
      let deletedScenario = null;
      if (clientScenarioRows.length > MAX_SCENARIOS_PER_CLIENT) {
        // Sort by timestamp ascending (oldest first)
        clientScenarioRows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const oldestScenario = clientScenarioRows[0];

        Logger.log(`Deleting oldest scenario "${oldestScenario.name}" at row ${oldestScenario.rowIndex} to enforce ${MAX_SCENARIOS_PER_CLIENT} limit`);

        scenariosSheet.deleteRow(oldestScenario.rowIndex);
        SpreadsheetApp.flush();
        deletedScenario = oldestScenario.name;

        Logger.log(`Oldest scenario deleted. Client now has ${clientScenarioRows.length - 1} scenarios`);
      }

      const isFirstScenario = clientScenarioRows.length === 1;

      // If this is the first scenario, mark Tool4 as completed in Responses tab
      if (isFirstScenario) {
        try {
          const dataPackage = {
            scenarioName: scenario.name,
            priority: scenario.priority || 'Not specified',
            multiply: scenario.allocations.Multiply,
            essentials: scenario.allocations.Essentials,
            freedom: scenario.allocations.Freedom,
            enjoyment: scenario.allocations.Enjoyment,
            monthlyIncome: monthlyIncome
          };

          DataService.saveToolResponse(clientId, 'tool4', dataPackage, 'COMPLETED');
          Logger.log(`Tool4 marked as completed for client ${clientId}`);
        } catch (responseError) {
          Logger.log(`Warning: Could not update Responses tab: ${responseError}`);
          // Don't fail the save if Responses update fails
        }
      }

      Logger.log(`Scenario saved for client ${clientId}: ${scenario.name}`);
      return {
        success: true,
        message: 'Scenario saved successfully',
        totalScenarios: clientScenarioRows.length - (deletedScenario ? 1 : 0),
        isFirstScenario: isFirstScenario,
        deletedScenario: deletedScenario
      };
    } catch (error) {
      Logger.log(`Error saving scenario: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all saved scenarios for a client
   */
  getScenarios(clientId) {
    try {
      const scenariosKey = `tool4_scenarios_${clientId}`;
      const scenariosStr = PropertiesService.getUserProperties().getProperty(scenariosKey);
      return scenariosStr ? JSON.parse(scenariosStr) : [];
    } catch (error) {
      Logger.log(`Error getting scenarios: ${error}`);
      return [];
    }
  },

  /**
   * Phase 2: Build Pre-Survey Page
   * 7 critical questions + 5 optional questions
   */
  buildPreSurveyPage(clientId, baseUrl, toolStatus) {
    const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_top">
  ${styles}
  <style>
    /* Pre-Survey Specific Styles */
    .pre-survey-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .survey-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .survey-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--color-text-primary);
    }

    .survey-header p {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .btn-nav {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--color-text);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .btn-nav:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--color-primary);
      transform: translateX(-2px);
    }

    .survey-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .required-badge {
      background: var(--color-error);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .optional-badge {
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text-secondary);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .section-description {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .question-group {
      margin-bottom: 28px;
    }

    .question-label {
      display: block;
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--color-text-primary);
    }

    .question-required {
      color: var(--color-error);
      margin-left: 4px;
    }

    .question-help {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-style: italic;
      margin-top: 6px;
    }

    .scale-input-group {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
    }

    .scale-input {
      flex: 1;
      height: 8px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      outline: none;
    }

    .scale-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: var(--color-primary);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
    }

    .scale-input::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      background: var(--color-primary-dark);
    }

    .scale-value {
      min-width: 40px;
      text-align: center;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-primary);
    }

    .scale-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .form-select,
    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      color: var(--color-text-primary);
      font-size: 1rem;
      transition: all 0.2s;
    }

    .form-select:focus,
    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .optional-section {
      border: 2px dashed rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 24px;
      margin-top: 32px;
    }

    .toggle-optional-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 12px 24px;
      border-radius: 8px;
      color: var(--color-text-primary);
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      margin-bottom: 20px;
    }

    .toggle-optional-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-primary);
    }

    .optional-questions {
      display: none;
    }

    .optional-questions.show {
      display: block;
    }

    .submit-section {
      margin-top: 40px;
      text-align: center;
    }

    .submit-btn {
      background: var(--color-primary);
      color: white;
      padding: 16px 48px;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-btn:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .submit-btn:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.3);
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--color-error);
      color: var(--color-error);
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      display: none;
    }

    .error-message.show {
      display: block;
    }

    .loading-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }

    .loading-overlay.show {
      display: flex;
    }

    .loading-content {
      text-align: center;
      color: white;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .progress-indicator {
      margin-bottom: 24px;
      text-align: center;
    }

    .progress-text {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-primary);
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="pre-survey-container">
    <!-- Header -->
    <div class="survey-header">
      <button type="button" class="btn-nav" onclick="returnToDashboard()" style="margin-bottom: 15px;">
        ← Return to Dashboard
      </button>
      <h1>🎯 Financial Freedom Framework</h1>
      <p>Before we build your personalized budget, let's understand your unique financial situation and goals. This will help us create recommendations tailored specifically to you.</p>
    </div>

    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div class="progress-text">7 required questions</div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
    </div>

    <form id="preSurveyForm">
      <!-- Critical Questions Section -->
      <div class="survey-section">
        <div class="section-title">
          <span>Essential Information</span>
          <span class="required-badge">REQUIRED</span>
        </div>
        <div class="section-description">
          These 7 questions help us create your baseline allocation. Each question takes just a moment to answer.
        </div>

        <!-- Q1: Satisfaction -->
        <div class="question-group">
          <label class="question-label">
            1. How satisfied are you with your current financial situation?
            <span class="question-required">*</span>
          </label>
          <div class="scale-input-group">
            <span class="scale-labels" style="min-width: 80px">Very stressed</span>
            <input
              type="range"
              class="scale-input"
              id="satisfaction"
              name="satisfaction"
              min="0"
              max="10"
              value="5"
              required
            >
            <span class="scale-labels" style="min-width: 80px; text-align: right">Very satisfied</span>
            <span class="scale-value" id="satisfactionValue">5</span>
          </div>
          <div class="question-help">Lower satisfaction amplifies our recommendations to help you change faster</div>
        </div>

        <!-- Q2: Discipline -->
        <div class="question-group">
          <label class="question-label">
            2. How would you rate your financial discipline?
            <span class="question-required">*</span>
          </label>
          <div class="scale-input-group">
            <span class="scale-labels" style="min-width: 80px">Very low</span>
            <input
              type="range"
              class="scale-input"
              id="discipline"
              name="discipline"
              min="0"
              max="10"
              value="5"
              required
            >
            <span class="scale-labels" style="min-width: 80px; text-align: right">Very high</span>
            <span class="scale-value" id="disciplineValue">5</span>
          </div>
          <div class="question-help">Your ability to stick to financial plans and resist temptation</div>
        </div>

        <!-- Q3: Impulse Control -->
        <div class="question-group">
          <label class="question-label">
            3. How strong is your impulse control with spending?
            <span class="question-required">*</span>
          </label>
          <div class="scale-input-group">
            <span class="scale-labels" style="min-width: 80px">Very weak</span>
            <input
              type="range"
              class="scale-input"
              id="impulse"
              name="impulse"
              min="0"
              max="10"
              value="5"
              required
            >
            <span class="scale-labels" style="min-width: 80px; text-align: right">Very strong</span>
            <span class="scale-value" id="impulseValue">5</span>
          </div>
          <div class="question-help">How well you resist unplanned purchases</div>
        </div>

        <!-- Q4: Long-term Focus -->
        <div class="question-group">
          <label class="question-label">
            4. How focused are you on long-term financial goals?
            <span class="question-required">*</span>
          </label>
          <div class="scale-input-group">
            <span class="scale-labels" style="min-width: 80px">Not at all</span>
            <input
              type="range"
              class="scale-input"
              id="longTerm"
              name="longTerm"
              min="0"
              max="10"
              value="5"
              required
            >
            <span class="scale-labels" style="min-width: 80px; text-align: right">Very focused</span>
            <span class="scale-value" id="longTermValue">5</span>
          </div>
          <div class="question-help">Your orientation toward future vs. present financial needs</div>
        </div>

        <!-- Q5: Goal Timeline -->
        <div class="question-group">
          <label class="question-label">
            5. When do you want to reach your primary financial goal?
            <span class="question-required">*</span>
          </label>
          <select class="form-select" id="goalTimeline" name="goalTimeline" required>
            <option value="">-- Select timeline --</option>
            <option value="Within 6 months">Within 6 months</option>
            <option value="6–12 months">6-12 months</option>
            <option value="1–2 years">1-2 years</option>
            <option value="2–5 years">2-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>

        <!-- Q6: Income Range -->
        <div class="question-group">
          <label class="question-label">
            6. What is your monthly net income (after taxes)?
            <span class="question-required">*</span>
          </label>
          <select class="form-select" id="incomeRange" name="incomeRange" required>
            <option value="">-- Select income range --</option>
            <option value="A">Less than $2,500/month</option>
            <option value="B">$2,500 - $5,000/month</option>
            <option value="C">$5,000 - $10,000/month</option>
            <option value="D">$10,000 - $20,000/month</option>
            <option value="E">More than $20,000/month</option>
          </select>
        </div>

        <!-- Q7: Essentials Percentage -->
        <div class="question-group">
          <label class="question-label">
            7. What percentage of your income goes to essentials (housing, food, utilities, insurance)?
            <span class="question-required">*</span>
          </label>
          <select class="form-select" id="essentialsRange" name="essentialsRange" required>
            <option value="">-- Select percentage --</option>
            <option value="A">Less than 10%</option>
            <option value="B">10-20%</option>
            <option value="C">20-30%</option>
            <option value="D">30-40%</option>
            <option value="E">40-50%</option>
            <option value="F">More than 50%</option>
          </select>
        </div>

        <!-- Priority Selection (from existing Tool 4) -->
        <div class="question-group">
          <label class="question-label">
            8. What is your primary financial priority right now?
            <span class="question-required">*</span>
          </label>
          <select class="form-select" id="selectedPriority" name="selectedPriority" required>
            <option value="">-- Select your priority --</option>
            <option value="Build Long-Term Wealth">Build Long-Term Wealth</option>
            <option value="Get Out of Debt">Get Out of Debt</option>
            <option value="Feel Financially Secure">Feel Financially Secure</option>
            <option value="Enjoy Life Now">Enjoy Life Now</option>
            <option value="Save for a Big Goal">Save for a Big Goal</option>
            <option value="Stabilize to Survive">Stabilize to Survive</option>
            <option value="Build or Stabilize a Business">Build or Stabilize a Business</option>
            <option value="Create Generational Wealth">Create Generational Wealth</option>
            <option value="Create Life Balance">Create Life Balance</option>
            <option value="Reclaim Financial Control">Reclaim Financial Control</option>
          </select>
        </div>
      </div>

      <!-- Optional Questions Section -->
      <div class="optional-section">
        <button type="button" class="toggle-optional-btn" id="toggleOptionalBtn">
          📊 Want even better recommendations? Answer 5 more optional questions ▼
        </button>

        <div class="optional-questions" id="optionalQuestions">
          <div class="section-title">
            <span>Optional Refinements</span>
            <span class="optional-badge">OPTIONAL</span>
          </div>
          <div class="section-description">
            These questions help fine-tune your allocation for even more personalized recommendations.
          </div>

          <!-- Optional Q1: Lifestyle Priority -->
          <div class="question-group">
            <label class="question-label">
              How important is enjoying life now vs. saving for later?
            </label>
            <div class="scale-input-group">
              <span class="scale-labels" style="min-width: 80px">Save for later</span>
              <input
                type="range"
                class="scale-input"
                id="lifestyle"
                name="lifestyle"
                min="0"
                max="10"
                value="5"
              >
              <span class="scale-labels" style="min-width: 80px; text-align: right">Enjoy now</span>
              <span class="scale-value" id="lifestyleValue">5</span>
            </div>
          </div>

          <!-- Optional Q2: Autonomy Preference -->
          <div class="question-group">
            <label class="question-label">
              Do you prefer following expert advice or making your own financial choices?
            </label>
            <div class="scale-input-group">
              <span class="scale-labels" style="min-width: 80px">Expert advice</span>
              <input
                type="range"
                class="scale-input"
                id="autonomy"
                name="autonomy"
                min="0"
                max="10"
                value="5"
              >
              <span class="scale-labels" style="min-width: 80px; text-align: right">My own choices</span>
              <span class="scale-value" id="autonomyValue">5</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message" id="errorMessage"></div>

      <!-- Submit Button -->
      <div class="submit-section">
        <button type="submit" class="submit-btn" id="submitBtn">
          Build My Personalized Budget →
        </button>
      </div>
    </form>
  </div>

  <!-- Loading Overlay -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <h2>Building Your Personalized Plan...</h2>
      <p>Analyzing your unique financial profile and goals</p>
    </div>
  </div>

  <script>
    // Update scale value displays
    const scaleInputs = [
      'satisfaction', 'discipline', 'impulse', 'longTerm',
      'lifestyle', 'autonomy'
    ];

    scaleInputs.forEach(id => {
      const input = document.getElementById(id);
      const valueDisplay = document.getElementById(id + 'Value');
      if (input && valueDisplay) {
        input.addEventListener('input', () => {
          valueDisplay.textContent = input.value;
          updateProgress();
        });
      }
    });

    // Toggle optional questions
    document.getElementById('toggleOptionalBtn').addEventListener('click', function() {
      const optionalSection = document.getElementById('optionalQuestions');
      optionalSection.classList.toggle('show');
      this.textContent = optionalSection.classList.contains('show')
        ? '📊 Hide optional questions ▲'
        : '📊 Want even better recommendations? Answer 5 more optional questions ▼';
    });

    // Update progress indicator
    function updateProgress() {
      const requiredInputs = document.querySelectorAll('[required]');
      let filled = 0;
      requiredInputs.forEach(input => {
        if (input.value && input.value !== '') filled++;
      });
      const progress = (filled / requiredInputs.length) * 100;
      document.getElementById('progressFill').style.width = progress + '%';
    }

    // Add change listeners to all required fields
    document.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('change', updateProgress);
      input.addEventListener('input', updateProgress);
    });

    // Form validation and submission
    document.getElementById('preSurveyForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // Validate all required fields
      const requiredInputs = document.querySelectorAll('[required]');
      let allValid = true;
      requiredInputs.forEach(input => {
        if (!input.value || input.value === '') {
          allValid = false;
          input.style.borderColor = 'var(--color-error)';
        } else {
          input.style.borderColor = '';
        }
      });

      if (!allValid) {
        document.getElementById('errorMessage').textContent = 'Please answer all required questions before continuing.';
        document.getElementById('errorMessage').classList.add('show');
        return;
      }

      // Collect form data
      const formData = {
        satisfaction: parseInt(document.getElementById('satisfaction').value),
        discipline: parseInt(document.getElementById('discipline').value),
        impulse: parseInt(document.getElementById('impulse').value),
        longTerm: parseInt(document.getElementById('longTerm').value),
        goalTimeline: document.getElementById('goalTimeline').value,
        incomeRange: document.getElementById('incomeRange').value,
        essentialsRange: document.getElementById('essentialsRange').value,
        selectedPriority: document.getElementById('selectedPriority').value,
        lifestyle: parseInt(document.getElementById('lifestyle').value) || 5,
        autonomy: parseInt(document.getElementById('autonomy').value) || 5
      };

      // Show loading overlay
      document.getElementById('loadingOverlay').classList.add('show');

      // Save pre-survey data
      google.script.run
        .withSuccessHandler(function(result) {
          // Close and reopen Tool 4 to show calculator
          google.script.host.close();
        })
        .withFailureHandler(function(error) {
          document.getElementById('loadingOverlay').classList.remove('show');
          document.getElementById('errorMessage').textContent = 'Error saving your data: ' + error.message;
          document.getElementById('errorMessage').classList.add('show');
        })
        .savePreSurvey('${clientId}', formData);
    });
  </script>
</body>
</html>
    `;
  },

  /**
   * Build unified page with collapsible pre-survey + calculator (Phase 3)
   * @param {string} clientId - Client ID
   * @param {string} baseUrl - Base URL for navigation
   * @param {Object} toolStatus - Tool completion status
   * @param {Object|null} preSurveyData - Existing pre-survey data (null if first visit)
   * @param {Object|null} allocation - V1 allocation result (null if no pre-survey)
   */
// COMPLETE REWRITE OF buildUnifiedPage with redesigned pre-survey
// This will replace Tool4.js lines 813-1433

buildUnifiedPage(clientId, baseUrl, toolStatus, preSurveyData, allocation) {
  const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();
  const hasPreSurvey = !!preSurveyData;
  const hasTool2 = toolStatus.hasTool2;

  // Pre-fill form values if pre-survey exists
  // Handle both old format (incomeRange/essentialsRange) and new format (monthlyIncome/monthlyEssentials)
  const formValues = preSurveyData ? {
    selectedPriority: preSurveyData.selectedPriority || '',
    goalTimeline: preSurveyData.goalTimeline || '',
    monthlyIncome: preSurveyData.monthlyIncome || '',
    monthlyEssentials: preSurveyData.monthlyEssentials || '',
    satisfaction: preSurveyData.satisfaction || 5,
    discipline: preSurveyData.discipline || 5,
    impulse: preSurveyData.impulse || 5,
    longTerm: preSurveyData.longTerm || 5,
    lifestyle: preSurveyData.lifestyle || 5,
    autonomy: preSurveyData.autonomy || 5
  } : {
    selectedPriority: '',
    goalTimeline: '',
    monthlyIncome: '',
    monthlyEssentials: '',
    satisfaction: 5,
    discipline: 5,
    impulse: 5,
    longTerm: 5,
    lifestyle: 5,
    autonomy: 5
  };

  // Calculate priority recommendations if pre-survey data exists
  let priorityRecommendations = [];
  if (hasPreSurvey) {
    try {
      // Get Tool 2 data if available
      const tool2Data = hasTool2 ? toolStatus.tool2Data : null;
      Logger.log(`Calculating priorities for client ${clientId}`);
      priorityRecommendations = this.calculatePriorityRecommendations(preSurveyData, tool2Data);
      Logger.log(`Calculated ${priorityRecommendations.length} priority recommendations`);
    } catch (error) {
      Logger.log(`Error calculating priority recommendations: ${error.message}`);
      Logger.log(`Stack: ${error.stack}`);
      // Continue with empty array - will just not show picker
      priorityRecommendations = [];
    }
  }

  // Slider label definitions
  const sliderLabels = {
    satisfaction: [
      "Extremely stressed - overwhelming financial anxiety daily",
      "Very dissatisfied - constant worry about money",
      "Quite dissatisfied - frequent financial stress",
      "Moderately dissatisfied - regular money concerns",
      "Somewhat dissatisfied - occasional worry",
      "Neutral - neither satisfied nor dissatisfied",
      "Somewhat satisfied - generally comfortable",
      "Moderately satisfied - feel stable most days",
      "Quite satisfied - confident in my finances",
      "Very satisfied - rarely worry about money",
      "Extremely satisfied - complete financial peace"
    ],
    discipline: [
      "Struggle to stick to plans",
      "Very difficult to maintain",
      "Often lose focus",
      "Sometimes stay on track",
      "Moderately inconsistent",
      "Sometimes follow through",
      "Usually stick to it",
      "Good self-control",
      "Strong follow-through",
      "Very disciplined",
      "Extremely disciplined"
    ],
    impulse: [
      "Buy on impulse constantly",
      "Very hard to resist",
      "Often make unplanned purchases",
      "Sometimes lose control",
      "Moderately impulsive",
      "Neutral impulse control",
      "Usually think it through",
      "Good at resisting temptation",
      "Strong impulse control",
      "Very controlled",
      "Never buy impulsively"
    ],
    longTerm: [
      "Only focused on today - can't think past this week",
      "Very present-focused - next month feels too far",
      "Mostly short-term - think a few months ahead",
      "Some future planning - occasionally think 6+ months out",
      "Slightly future-oriented - starting to plan ahead",
      "Balanced - equal focus on now and later",
      "Somewhat future-focused - often plan 1+ year ahead",
      "Good long-term planning - regularly think 2-5 years out",
      "Strong future orientation - actively plan 5+ years ahead",
      "Very long-term focused - always thinking decades ahead",
      "Maximum future focus - retirement and legacy planning is priority"
    ],
    lifestyle: [
      "Save everything possible - minimize current spending",
      "Heavy saver - rarely spend on enjoyment",
      "Strong saver - occasionally treat myself",
      "Moderate saver - some room for fun",
      "Balanced saver - regular small treats",
      "Equal focus - save and enjoy equally",
      "Balanced enjoyer - save but prioritize experiences",
      "Moderate enjoyer - save less to live better now",
      "Strong enjoyer - prioritize current quality of life",
      "Heavy enjoyer - minimal saving, maximum living",
      "Live fully now - save very little for later"
    ],
    autonomy: [
      "Tell me exactly what to do - I want clear instructions",
      "Strong preference for expert guidance",
      "Mostly follow expert advice with small tweaks",
      "Prefer expert recommendations with some input",
      "Lean toward expert guidance but customize",
      "Equal mix - expert insight plus my judgment",
      "Lean toward my own choices with expert input",
      "Mostly my decisions with expert validation",
      "Strong preference for making my own choices",
      "Heavy autonomy - just give me the framework",
      "Complete autonomy - I'll decide everything myself"
    ]
  };

  // Priority descriptions
  const priorities = [
    { value: "Build Long-Term Wealth", desc: "Focus on investments, retirement, and growing net worth" },
    { value: "Get Out of Debt", desc: "Prioritize paying down credit cards, loans, and becoming debt-free" },
    { value: "Feel Financially Secure", desc: "Build emergency fund and reduce financial anxiety" },
    { value: "Enjoy Life Now", desc: "Balance present quality of life with future planning" },
    { value: "Balance Everything", desc: "Equal focus across all financial areas" },
    { value: "Prepare for Major Purchase", desc: "Save for house, car, or other large expense" },
    { value: "Start Investing", desc: "Begin building investment portfolio and learning markets" },
    { value: "Increase Financial Knowledge", desc: "Learn money management and financial literacy" },
    { value: "Gain More Control", desc: "Take charge of finances and reduce chaos" },
    { value: "Build Emergency Fund", desc: "Create safety net for unexpected expenses" }
  ];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_top">
  ${styles}
  <style>
    .unified-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Tool 2 Banner */
    .tool2-banner {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%);
      border: 2px solid rgba(79, 70, 229, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .tool2-banner-icon {
      font-size: 2rem;
    }

    .tool2-banner-content {
      flex: 1;
    }

    .tool2-banner-title {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 5px;
    }

    .tool2-banner-text {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .tool2-banner-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }

    /* Pre-Survey Section */
    .presurvey-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      margin-bottom: 30px;
      overflow: hidden;
    }

    .presurvey-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      cursor: pointer;
      background: rgba(79, 70, 229, 0.1);
      border-bottom: 2px solid rgba(79, 70, 229, 0.3);
    }

    .presurvey-header:hover {
      background: rgba(79, 70, 229, 0.15);
    }

    .presurvey-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .presurvey-toggle {
      font-size: 1.5rem;
      transition: transform 0.3s ease;
    }

    .presurvey-toggle.collapsed {
      transform: rotate(-90deg);
    }

    .presurvey-body {
      max-height: 5000px;
      opacity: 1;
      transition: max-height 0.4s ease, opacity 0.3s ease;
      padding: 30px;
    }

    .presurvey-body.collapsed {
      max-height: 0;
      opacity: 0;
      padding: 0 30px;
      overflow: hidden;
    }

    .presurvey-summary {
      padding: 15px 30px;
      display: none;
      background: rgba(255, 255, 255, 0.02);
    }

    .presurvey-summary.show {
      display: block;
    }

    .intro-section {
      background: rgba(79, 70, 229, 0.1);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .intro-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 10px;
    }

    .intro-text {
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* Form Styles */
    .form-question {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .form-question:last-of-type {
      border-bottom: none;
    }

    .question-label {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 8px;
      display: block;
    }

    .question-help {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
      font-style: italic;
    }

    .form-select, .form-input {
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

    .priority-option {
      padding: 8px 0;
    }

    .priority-desc {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-left: 10px;
      font-style: italic;
    }

    /* Slider Styles */
    .slider-container {
      margin-top: 15px;
    }

    .slider-value-display {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-primary);
      min-height: 50px;
      padding: 10px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 8px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .slider-input {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      outline: none;
      -webkit-appearance: none;
    }

    .slider-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: var(--color-primary);
      border-radius: 50%;
      cursor: pointer;
    }

    .slider-input::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: var(--color-primary);
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    .slider-scale {
      display: flex;
      justify-content: space-between;
      margin-top: 5px;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    /* Priority Picker Section */
    .priority-picker-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 0;
      margin-bottom: 30px;
      transition: all 0.3s ease;
    }

    .priority-picker-header {
      padding: 20px 30px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(79, 70, 229, 0.1);
      border-bottom: 2px solid rgba(79, 70, 229, 0.3);
      user-select: none;
    }

    .priority-picker-header:hover {
      background: rgba(79, 70, 229, 0.15);
    }

    .priority-picker-summary {
      padding: 15px 30px;
      display: flex;
      gap: 30px;
      align-items: center;
      font-size: 0.95em;
      color: var(--color-text-secondary);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .priority-picker-body {
      padding: 30px;
    }

    .picker-intro {
      color: var(--color-text-secondary);
      margin-bottom: 30px;
      text-align: center;
    }

    .priority-group {
      margin-bottom: 30px;
    }

    .group-title {
      font-size: 1.1em;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .priority-group.recommended .group-title {
      color: #10b981;
    }

    .priority-group.available .group-title {
      color: var(--color-text);
    }

    .priority-group.challenging .group-title {
      color: #f59e0b;
    }

    .priority-card {
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .priority-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--color-primary);
      transform: translateX(4px);
    }

    .priority-card.selected {
      background: rgba(139, 92, 246, 0.1);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }

    .priority-card.recommended {
      border-left: 4px solid #10b981;
    }

    .priority-card.challenging {
      border-left: 4px solid #f59e0b;
    }

    .priority-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .priority-icon {
      font-size: 1.3em;
    }

    .priority-name {
      font-weight: 600;
      flex: 1;
    }

    .selected-badge {
      background: var(--color-primary);
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .priority-reason {
      color: var(--color-text-secondary);
      font-size: 0.95em;
      margin-bottom: 8px;
      padding-left: 35px;
    }

    .priority-allocation {
      color: var(--color-text-muted);
      font-size: 0.85em;
      font-family: 'Courier New', monospace;
      padding-left: 35px;
    }

    .timeline-selector {
      margin-top: 30px;
      margin-bottom: 25px;
    }

    .timeline-selector label {
      display: block;
      margin-bottom: 10px;
      color: var(--color-text);
    }

    .timeline-selector select {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--color-text);
      font-size: 1em;
    }

    /* Calculator Section */
    .calculator-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 30px;
    }

    .calculator-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .calculator-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--color-text-primary);
    }

    .calculator-subtitle {
      font-size: 1rem;
      color: var(--color-text-secondary);
    }

    .allocation-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      .allocation-grid {
        grid-template-columns: 1fr;
      }
    }

    .allocation-bucket {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .bucket-name {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-text-secondary);
      margin-bottom: 10px;
    }

    .bucket-percentage {
      font-size: 2.5rem;
      font-weight: 700;
      color: #ffc107;
      margin-bottom: 5px;
    }

    .bucket-dollar-amount {
      font-size: 1.2rem;
      font-weight: 600;
      color: #ffc107;
      opacity: 0.8;
      margin-bottom: 8px;
    }

    .bucket-amount {
      font-size: 1.1rem;
      color: var(--color-text-primary);
      opacity: 0.8;
    }

    .calculation-status {
      text-align: center;
      padding: 40px;
      color: var(--color-text-secondary);
    }

    /* Interactive Calculator Styles */
    .interactive-calculator {
      margin-top: 30px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 25px;
    }

    .calculator-controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }

    .btn-secondary {
      background: rgba(79, 70, 229, 0.2);
      color: var(--color-text-primary);
      border: 1px solid rgba(79, 70, 229, 0.4);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: rgba(79, 70, 229, 0.3);
      border-color: rgba(79, 70, 229, 0.6);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .bucket-slider-container {
      margin-bottom: 25px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .bucket-slider-container.locked {
      background: rgba(255, 255, 255, 0.01);
      border-color: rgba(255, 193, 7, 0.3);
    }

    .bucket-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .bucket-slider-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bucket-slider-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .bucket-slider-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .bucket-slider-locked-value {
      color: #ffc107;
    }

    .lock-button {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;
    }

    .lock-button:hover {
      border-color: rgba(255, 255, 255, 0.4);
      color: rgba(255, 255, 255, 0.8);
    }

    .lock-button.locked {
      background: rgba(255, 193, 7, 0.2);
      border-color: #ffc107;
      color: #ffc107;
    }

    .bucket-slider-track {
      position: relative;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      margin-bottom: 10px;
    }

    .bucket-slider-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      border-radius: 5px;
      transition: width 0.15s ease-out;
    }

    .bucket-slider-fill.locked {
      background: linear-gradient(90deg, #f59e0b, #ffc107);
    }

    .bucket-range-input {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 10px;
      background: transparent;
      outline: none;
      position: relative;
      z-index: 2;
      cursor: pointer;
    }

    .bucket-range-input:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .bucket-range-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      background: var(--color-primary);
      border: 3px solid rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .bucket-range-input::-moz-range-thumb {
      width: 24px;
      height: 24px;
      background: var(--color-primary);
      border: 3px solid rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .bucket-range-input.locked::-webkit-slider-thumb {
      background: #ffc107;
    }

    .bucket-range-input.locked::-moz-range-thumb {
      background: #ffc107;
    }

    .bucket-description {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-top: 5px;
      font-style: italic;
    }

    .submit-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 20px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
    }

    .error-message.show {
      display: block;
    }

    /* Loading overlay */
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
  <script>
    var clientId = '${clientId}';
  </script>
</head>
<body>
  <!-- Loading Overlay -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <div class="loading-text" id="loadingText">Loading...</div>
      <div class="loading-subtext" id="loadingSubtext"></div>
    </div>
  </div>

  <div class="unified-container">

    <!-- Page Header -->
    <div style="margin-bottom: 20px;">
      <button type="button" class="btn-nav" onclick="returnToDashboard()">
        ← Return to Dashboard
      </button>
    </div>

    ${!hasTool2 ? `
    <!-- Tool 2 Banner -->
    <div class="tool2-banner">
      <div class="tool2-banner-icon">💡</div>
      <div class="tool2-banner-content">
        <div class="tool2-banner-title">Want Better Recommendations?</div>
        <div class="tool2-banner-text">Complete Tool 2: Financial Clarity Grounding first for more personalized results.</div>
      </div>
      <a href="${baseUrl}?tool=tool2&clientId=${clientId}" class="tool2-banner-btn">Go to Tool 2</a>
    </div>
    ` : ''}

    <!-- Pre-Survey Section -->
    <div class="presurvey-section">
      <div class="presurvey-header" onclick="togglePreSurvey()">
        <div class="presurvey-title">
          ${hasPreSurvey ? '📊 Your Allocation Profile' : '📊 Quick Allocation Profile Setup (10 questions, 2-3 minutes)'}
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <span style="font-size: 12px; color: var(--color-text-muted);">(Click to ${hasPreSurvey ? 'expand/collapse' : 'collapse'})</span>
          <div class="presurvey-toggle ${hasPreSurvey ? 'collapsed' : ''}" id="preSurveyToggle">▼</div>
        </div>
      </div>

      <!-- Summary (shown when collapsed) -->
      ${hasPreSurvey ? `
      <div class="presurvey-summary show" id="preSurveySummary">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 0.9rem;">
          <div style="color: var(--color-text-secondary);">
            <strong style="color: var(--color-text-primary);">Income:</strong> $${formValues.monthlyIncome || 'Not set'}
          </div>
          <div style="color: var(--color-text-secondary);">
            <strong style="color: var(--color-text-primary);">Essentials:</strong> $${formValues.monthlyEssentials || 'Not set'}
          </div>
          <div style="color: var(--color-text-secondary);">
            <strong style="color: var(--color-text-primary);">Satisfaction:</strong> ${formValues.satisfaction || 5}/10
          </div>
          <div style="color: var(--color-text-primary);">
            <strong style="color: var(--color-text-primary);">Discipline:</strong> ${formValues.discipline || 5}/10
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Pre-Survey Form -->
      <div class="presurvey-body ${hasPreSurvey ? 'collapsed' : ''}" id="preSurveyBody">

        <!-- Intro Section -->
        <div class="intro-section">
          <div class="intro-title">Welcome to Your Financial Freedom Framework</div>
          <div class="intro-text">
            This personalized budget tool uses your unique financial situation and behavioral patterns to recommend the best financial priorities for you, then creates a customized allocation across four key areas: Multiply (wealth building), Essentials (living expenses), Freedom (debt & security), and Enjoyment (quality of life).
            <br><br>
            <strong>How it works:</strong> Answer 8 questions about your finances and preferences. We'll analyze your situation and show you which priorities are recommended for you. Then you'll choose your priority and timeline to get your personalized budget.
            <br><br>
            <strong>Time needed:</strong> 2-3 minutes
          </div>
        </div>

        <form id="preSurveyForm">

          <!-- Q1: Monthly Income -->
          <div class="form-question">
            <label class="question-label">1. What is your average monthly take-home income?</label>
            <div class="question-help">After taxes, how much money hits your bank account each month? If it varies, estimate your average. Include all sources: salary, side income, benefits, etc.</div>
            <input type="number" id="monthlyIncome" class="form-input" placeholder="e.g., 3500" min="0" step="1" value="${formValues.monthlyIncome || ''}" required>
          </div>

          <!-- Q2: Monthly Essentials -->
          <div class="form-question">
            <label class="question-label">2. What is your monthly essentials spending?</label>
            <div class="question-help">Your core fixed expenses: rent/mortgage, utilities, groceries, insurance, transportation, minimum debt payments. Do not include dining out, entertainment, or other discretionary spending.</div>
            <input type="number" id="monthlyEssentials" class="form-input" placeholder="e.g., 2000" min="0" step="1" value="${formValues.monthlyEssentials || ''}" required>
          </div>

          <!-- Q3: Total Debt (excluding mortgage) -->
          <div class="form-question">
            <label class="question-label">3. What is your total debt (excluding mortgage)?</label>
            <div class="question-help">Add up all non-mortgage debt: credit cards, student loans, car loans, medical debt, personal loans. Enter 0 if you have no debt. Do not include your mortgage or rent.</div>
            <input type="number" id="totalDebt" class="form-input" placeholder="Enter 0 if none" min="0" step="1" value="${formValues.totalDebt || ''}" required>
          </div>

          <!-- Q4: Emergency Fund Amount -->
          <div class="form-question">
            <label class="question-label">4. How much money do you currently have in an emergency fund?</label>
            <div class="question-help">Money set aside specifically for emergencies - liquid savings you could access quickly but would not touch for normal expenses. Enter 0 if you do not have an emergency fund yet.</div>
            <input type="number" id="emergencyFund" class="form-input" placeholder="Enter 0 if none" min="0" step="1" value="${formValues.emergencyFund || ''}" required>
          </div>

          <!-- Q5: Financial Satisfaction Slider -->
          <div class="form-question">
            <label class="question-label">5. How satisfied are you with your current financial situation?</label>
            <div class="question-help">Rate your current level of satisfaction or stress with money. Move the slider to see descriptive labels.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="satisfactionDisplay">${sliderLabels.satisfaction[formValues.satisfaction]}</div>
              <input type="range" id="satisfaction" class="slider-input" min="0" max="10" value="${formValues.satisfaction}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q6: Discipline Slider -->
          <div class="form-question">
            <label class="question-label">6. How would you rate your financial discipline?</label>
            <div class="question-help">Your ability to stick to financial plans and resist temptation. Be honest - this helps us give you realistic recommendations.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="disciplineDisplay">${sliderLabels.discipline[formValues.discipline]}</div>
              <input type="range" id="discipline" class="slider-input" min="0" max="10" value="${formValues.discipline}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q7: Impulse Control Slider -->
          <div class="form-question">
            <label class="question-label">7. How strong is your impulse control with spending?</label>
            <div class="question-help">How well you resist unplanned purchases and stay on budget. No judgment - honest answers help us help you.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="impulseDisplay">${sliderLabels.impulse[formValues.impulse]}</div>
              <input type="range" id="impulse" class="slider-input" min="0" max="10" value="${formValues.impulse}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q8: Long-Term Focus Slider -->
          <div class="form-question">
            <label class="question-label">8. How focused are you on long-term financial goals?</label>
            <div class="question-help">Your orientation toward future versus present financial needs. Are you a planner or do you focus on today?</div>
            <div class="slider-container">
              <div class="slider-value-display" id="longTermDisplay">${sliderLabels.longTerm[formValues.longTerm]}</div>
              <input type="range" id="longTerm" class="slider-input" min="0" max="10" value="${formValues.longTerm}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q9: Lifestyle Priority Slider -->
          <div class="form-question">
            <label class="question-label">9. How do you prioritize enjoying life now versus saving for later?</label>
            <div class="question-help">Your philosophy about money and happiness. Do you save aggressively or enjoy life now?</div>
            <div class="slider-container">
              <div class="slider-value-display" id="lifestyleDisplay">${sliderLabels.lifestyle[formValues.lifestyle]}</div>
              <input type="range" id="lifestyle" class="slider-input" min="0" max="10" value="${formValues.lifestyle}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q10: Autonomy Preference Slider -->
          <div class="form-question">
            <label class="question-label">10. Do you prefer following expert guidance or making your own financial choices?</label>
            <div class="question-help">Do you want clear rules to follow or prefer to make your own decisions? This helps us calibrate how much flexibility you get.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="autonomyDisplay">${sliderLabels.autonomy[formValues.autonomy]}</div>
              <input type="range" id="autonomy" class="slider-input" min="0" max="10" value="${formValues.autonomy}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div class="error-message" id="errorMessage"></div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" id="calculateBtn">
            ${hasPreSurvey ? 'Update My Profile' : 'Calculate My Available Priorities →'}
          </button>
        </form>
      </div>
    </div>

    <!-- Priority Picker Section (shown after pre-survey completion) -->
    ${hasPreSurvey && priorityRecommendations && priorityRecommendations.length > 0 ? this.buildPriorityPickerHtml(
      priorityRecommendations,
      formValues.selectedPriority,
      formValues.goalTimeline,
      !allocation  // Expanded if no allocation yet, collapsed if allocation exists
    ) : hasPreSurvey ? `
      <!-- Debug: Priority recommendations failed or empty -->
      <div style="background: rgba(239, 68, 68, 0.1); padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="color: var(--color-text-primary);">Debug: Priority calculation issue</p>
        <p style="color: var(--color-text-secondary); font-size: 0.9rem;">
          Recommendations calculated: ${priorityRecommendations ? priorityRecommendations.length : 'null'}
        </p>
      </div>
    ` : ''}

    <!-- Calculator Section -->
    <div class="calculator-section">
      <div class="calculator-header">
        <div class="calculator-title">Your Personalized Allocation</div>
        <div class="calculator-subtitle">
          ${allocation ? 'Based on your profile and financial goals' : 'Complete the profile above to see your personalized allocation'}
        </div>
      </div>

      ${allocation ? `
        <div class="allocation-grid">
          <div class="allocation-bucket">
            <div class="bucket-name">Multiply</div>
            <div class="bucket-percentage">${allocation.percentages.Multiply}%</div>
            ${preSurveyData && preSurveyData.monthlyIncome ? `
              <div class="bucket-dollar-amount">$${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Multiply / 100).toLocaleString()}/mo</div>
            ` : ''}
            <div class="bucket-amount">Long-term wealth building</div>
          </div>
          <div class="allocation-bucket">
            <div class="bucket-name">Essentials</div>
            <div class="bucket-percentage">${allocation.percentages.Essentials}%</div>
            ${preSurveyData && preSurveyData.monthlyIncome ? `
              <div class="bucket-dollar-amount">$${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Essentials / 100).toLocaleString()}/mo</div>
            ` : ''}
            <div class="bucket-amount">Core living expenses</div>
          </div>
          <div class="allocation-bucket">
            <div class="bucket-name">Freedom</div>
            <div class="bucket-percentage">${allocation.percentages.Freedom}%</div>
            ${preSurveyData && preSurveyData.monthlyIncome ? `
              <div class="bucket-dollar-amount">$${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Freedom / 100).toLocaleString()}/mo</div>
            ` : ''}
            <div class="bucket-amount">Debt, Emergency Fund, Savings</div>
          </div>
          <div class="allocation-bucket">
            <div class="bucket-name">Enjoyment</div>
            <div class="bucket-percentage">${allocation.percentages.Enjoyment}%</div>
            ${preSurveyData && preSurveyData.monthlyIncome ? `
              <div class="bucket-dollar-amount">$${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Enjoyment / 100).toLocaleString()}/mo</div>
            ` : ''}
            <div class="bucket-amount">Present quality of life</div>
          </div>
        </div>

        ${allocation.validationWarnings && allocation.validationWarnings.length > 0 ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h3 style="margin-top: 0; color: #fca5a5;">⚠️ Allocation Check</h3>
          <div style="color: var(--color-text-secondary); line-height: 1.6;">
            ${allocation.validationWarnings.map(w => `
              <p><strong>${w.message}</strong></p>
              <p style="margin-top: 10px;">You have two options:</p>
              <ul style="margin: 10px 0;">
                <li><strong>Reduce Essentials:</strong> Find ways to cut your core expenses from ${w.actual}% to ${w.recommended}%</li>
                <li><strong>Adjust Allocation:</strong> Recalculate with Essentials at ${w.actual}% (reduces other buckets)</li>
              </ul>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div style="background: rgba(79, 70, 229, 0.1); padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h3 style="margin-top: 0; color: var(--color-text-primary);">💡 Why These Numbers?</h3>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: -10px; margin-bottom: 15px;">
            Personalized reasoning based on your financial profile and goals
          </p>
          <div style="color: var(--color-text-secondary); line-height: 1.6;">
            <p><strong>Multiply:</strong> ${allocation.lightNotes.Multiply}</p>
            <p><strong>Essentials:</strong> ${allocation.lightNotes.Essentials}</p>
            <p><strong>Freedom:</strong> ${allocation.lightNotes.Freedom}</p>
            <p><strong>Enjoyment:</strong> ${allocation.lightNotes.Enjoyment}</p>
          </div>
        </div>

        <!-- Interactive Calculator -->
        <div class="interactive-calculator">
          <h3 style="margin-top: 0; color: var(--color-text-primary); text-align: center; margin-bottom: 20px;">
            🎛️ Adjust Your Allocation
          </h3>

          <div class="calculator-controls">
            <button type="button" class="btn-secondary" onclick="resetToRecommended()">
              ↻ Reset to Recommended
            </button>
            <button type="button" class="btn-secondary" onclick="checkMyPlan()">
              ✓ Check My Plan
            </button>
            <button type="button" class="btn-secondary" onclick="saveScenario()">
              💾 Save Scenario
            </button>
            <button type="button" class="btn-secondary" onclick="downloadMainReport()">
              📄 Download Report
            </button>
          </div>

          <!-- Validation Results (inline display) -->
          <div id="validationResults" style="display: none; margin: 20px 0; padding: 20px; border-radius: 8px; background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3);"></div>

          <!-- Multiply Slider -->
          <div class="bucket-slider-container" id="multiplyContainer">
            <div class="bucket-slider-header">
              <div class="bucket-slider-title">
                <span class="bucket-slider-name">💰 Multiply</span>
                <span class="bucket-slider-value">
                  <span id="multiplyValue">${allocation.percentages.Multiply}%</span>
                  <span id="multiplyDollar" style="color: #ffc107; margin-left: 8px; font-size: 0.9em;">
                    ${preSurveyData && preSurveyData.monthlyIncome ? `($${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Multiply / 100).toLocaleString()})` : ''}
                  </span>
                </span>
              </div>
              <button type="button" class="lock-button" id="multiplyLock" onclick="toggleLock('Multiply')">
                🔓 Unlocked
              </button>
            </div>
            <div class="bucket-slider-track">
              <div class="bucket-slider-fill" id="multiplyFill" style="width: ${allocation.percentages.Multiply}%"></div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value="${allocation.percentages.Multiply}"
              class="bucket-range-input"
              id="multiplySlider"
              oninput="adjustBucket('Multiply', this.value)"
            />
            <div class="bucket-description">Long-term wealth building through investments</div>
          </div>

          <!-- Essentials Slider -->
          <div class="bucket-slider-container" id="essentialsContainer">
            <div class="bucket-slider-header">
              <div class="bucket-slider-title">
                <span class="bucket-slider-name">🏠 Essentials</span>
                <span class="bucket-slider-value">
                  <span id="essentialsValue">${allocation.percentages.Essentials}%</span>
                  <span id="essentialsDollar" style="color: #ffc107; margin-left: 8px; font-size: 0.9em;">
                    ${preSurveyData && preSurveyData.monthlyIncome ? `($${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Essentials / 100).toLocaleString()})` : ''}
                  </span>
                </span>
              </div>
              <button type="button" class="lock-button" id="essentialsLock" onclick="toggleLock('Essentials')">
                🔓 Unlocked
              </button>
            </div>
            <div class="bucket-slider-track">
              <div class="bucket-slider-fill" id="essentialsFill" style="width: ${allocation.percentages.Essentials}%"></div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value="${allocation.percentages.Essentials}"
              class="bucket-range-input"
              id="essentialsSlider"
              oninput="adjustBucket('Essentials', this.value)"
            />
            <div class="bucket-description">Core living expenses (housing, food, utilities)</div>
          </div>

          <!-- Freedom Slider -->
          <div class="bucket-slider-container" id="freedomContainer">
            <div class="bucket-slider-header">
              <div class="bucket-slider-title">
                <span class="bucket-slider-name">🚀 Freedom</span>
                <span class="bucket-slider-value">
                  <span id="freedomValue">${allocation.percentages.Freedom}%</span>
                  <span id="freedomDollar" style="color: #ffc107; margin-left: 8px; font-size: 0.9em;">
                    ${preSurveyData && preSurveyData.monthlyIncome ? `($${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Freedom / 100).toLocaleString()})` : ''}
                  </span>
                </span>
              </div>
              <button type="button" class="lock-button" id="freedomLock" onclick="toggleLock('Freedom')">
                🔓 Unlocked
              </button>
            </div>
            <div class="bucket-slider-track">
              <div class="bucket-slider-fill" id="freedomFill" style="width: ${allocation.percentages.Freedom}%"></div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value="${allocation.percentages.Freedom}"
              class="bucket-range-input"
              id="freedomSlider"
              oninput="adjustBucket('Freedom', this.value)"
            />
            <div class="bucket-description">Debt payoff and emergency fund building</div>
          </div>

          <!-- Enjoyment Slider -->
          <div class="bucket-slider-container" id="enjoymentContainer">
            <div class="bucket-slider-header">
              <div class="bucket-slider-title">
                <span class="bucket-slider-name">🎉 Enjoyment</span>
                <span class="bucket-slider-value">
                  <span id="enjoymentValue">${allocation.percentages.Enjoyment}%</span>
                  <span id="enjoymentDollar" style="color: #ffc107; margin-left: 8px; font-size: 0.9em;">
                    ${preSurveyData && preSurveyData.monthlyIncome ? `($${Math.round(preSurveyData.monthlyIncome * allocation.percentages.Enjoyment / 100).toLocaleString()})` : ''}
                  </span>
                </span>
              </div>
              <button type="button" class="lock-button" id="enjoymentLock" onclick="toggleLock('Enjoyment')">
                🔓 Unlocked
              </button>
            </div>
            <div class="bucket-slider-track">
              <div class="bucket-slider-fill" id="enjoymentFill" style="width: ${allocation.percentages.Enjoyment}%"></div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value="${allocation.percentages.Enjoyment}"
              class="bucket-range-input"
              id="enjoymentSlider"
              oninput="adjustBucket('Enjoyment', this.value)"
            />
            <div class="bucket-description">Present quality of life and discretionary spending</div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
            <div style="font-size: 0.9rem; color: var(--color-text-secondary);">
              Total Allocation: <span id="totalAllocation" style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary);">100%</span>
            </div>
          </div>
        </div>

        <!-- Saved Scenarios Section (Collapsible) -->
        <div class="saved-scenarios-section" style="margin-top: 30px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
          <div class="scenarios-header" onclick="toggleSavedScenarios()" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; cursor: pointer; background: rgba(79, 70, 229, 0.1); border-bottom: 2px solid rgba(79, 70, 229, 0.3);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--color-text-primary);">💾 Saved Scenarios</span>
              <span id="scenarioCount" style="font-size: 0.85rem; color: var(--color-text-muted);"></span>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="font-size: 12px; color: var(--color-text-muted);">(Click to expand/collapse)</span>
              <div class="scenarios-toggle" id="scenariosToggle" style="transition: transform 0.3s ease; font-size: 14px;">▼</div>
            </div>
          </div>

          <div class="scenarios-body" id="scenariosBody" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease; opacity: 0; padding: 0 25px;">
            <div style="padding-bottom: 25px;">
              <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                <button type="button" class="btn-secondary" onclick="event.stopPropagation(); refreshScenarioList();" style="font-size: 0.85rem; padding: 6px 12px;">
                  ↻ Refresh
                </button>
              </div>

              <div id="scenarioListContainer">
                <p style="color: var(--color-text-muted); font-style: italic;">Loading saved scenarios...</p>
              </div>

              <!-- Comparison View (hidden by default) -->
              <div id="comparisonView" style="display: none; margin-top: 25px; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="color: var(--color-text-primary); margin-bottom: 15px;">📊 Compare Scenarios</h4>
                <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                  <select id="scenario1Select" onchange="updateComparison()" style="flex: 1; min-width: 200px; padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--color-text-primary); border: 1px solid rgba(255,255,255,0.2);">
                    <option value="">Select first scenario...</option>
                  </select>
                  <span style="color: var(--color-text-muted); padding: 10px;">vs</span>
                  <select id="scenario2Select" onchange="updateComparison()" style="flex: 1; min-width: 200px; padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--color-text-primary); border: 1px solid rgba(255,255,255,0.2);">
                    <option value="">Select second scenario...</option>
                  </select>
                </div>
                <div id="comparisonResults"></div>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="calculation-status">
          <p style="font-size: 1.2rem; margin-bottom: 10px;">👆 Start by filling out your profile above</p>
          <p>We'll calculate your personalized budget allocations based on your unique situation and goals.</p>
        </div>
      `}
    </div>

  </div>

  <script>
    // Slider label definitions
    var sliderLabels = ${JSON.stringify(sliderLabels)};

    // Update slider displays
    function updateSliderDisplay(sliderId) {
      var slider = document.getElementById(sliderId);
      var display = document.getElementById(sliderId + 'Display');
      var value = parseInt(slider.value);
      display.textContent = sliderLabels[sliderId][value];
    }

    // Initialize all sliders
    ['satisfaction', 'discipline', 'impulse', 'longTerm', 'lifestyle', 'autonomy'].forEach(function(id) {
      var slider = document.getElementById(id);
      slider.addEventListener('input', function() { updateSliderDisplay(id); });
    });

    // Toggle pre-survey section
    function togglePreSurvey() {
      var body = document.getElementById('preSurveyBody');
      var toggle = document.getElementById('preSurveyToggle');
      var summary = document.getElementById('preSurveySummary');

      body.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
      if (summary) summary.classList.toggle('show');
    }

    // Toggle saved scenarios section
    var scenariosExpanded = false;
    function toggleSavedScenarios() {
      var body = document.getElementById('scenariosBody');
      var toggle = document.getElementById('scenariosToggle');

      scenariosExpanded = !scenariosExpanded;

      if (scenariosExpanded) {
        body.style.maxHeight = body.scrollHeight + 500 + 'px'; // Add buffer for dynamic content
        body.style.opacity = '1';
        body.style.padding = '0 25px';
        toggle.style.transform = 'rotate(180deg)';
      } else {
        body.style.maxHeight = '0';
        body.style.opacity = '0';
        body.style.padding = '0 25px';
        toggle.style.transform = 'rotate(0deg)';
      }
    }

    // Return to Dashboard function
    function returnToDashboard() {
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Returning to Dashboard...';
        if (loadingSubtext) loadingSubtext.textContent = 'Loading your overview';
        loadingOverlay.classList.add('show');
      }

      google.script.run
        .withSuccessHandler(function(dashboardHtml) {
          if (dashboardHtml) {
            document.open();
            document.write(dashboardHtml);
            document.close();
            window.scrollTo(0, 0);
          } else {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            alert('Error loading dashboard');
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          console.error('Dashboard navigation error:', error);
          alert('Error loading dashboard: ' + error.message);
        })
        .getDashboardPage('${clientId}');
    }

    // Priority picker functions
    var selectedPriorityName = '${formValues.selectedPriority || ''}';

    function togglePriorityPicker() {
      const section = document.querySelector('.priority-picker-section');
      const body = document.querySelector('.priority-picker-body');
      const isCollapsed = section.classList.toggle('collapsed');
      body.style.display = isCollapsed ? 'none' : 'block';
    }

    function selectPriority(priorityName) {
      selectedPriorityName = priorityName;
      // Update UI - remove selected from all cards, add to clicked one
      document.querySelectorAll('.priority-card').forEach(card => {
        card.classList.remove('selected');
        card.querySelector('.selected-badge')?.remove();
      });
      const clickedCard = Array.from(document.querySelectorAll('.priority-card'))
        .find(card => card.querySelector('.priority-name').textContent === priorityName);
      if (clickedCard) {
        clickedCard.classList.add('selected');
        const header = clickedCard.querySelector('.priority-header');
        if (!header.querySelector('.selected-badge')) {
          const badge = document.createElement('span');
          badge.className = 'selected-badge';
          badge.textContent = '✓ Selected';
          header.appendChild(badge);
        }
      }
    }

    // ============ INTERACTIVE CALCULATOR LOGIC ============

    // State management for calculator
    var calculatorState = {
      buckets: {
        Multiply: ${allocation ? allocation.percentages.Multiply : 25},
        Essentials: ${allocation ? allocation.percentages.Essentials : 35},
        Freedom: ${allocation ? allocation.percentages.Freedom : 25},
        Enjoyment: ${allocation ? allocation.percentages.Enjoyment : 15}
      },
      locked: {
        Multiply: false,
        Essentials: false,
        Freedom: false,
        Enjoyment: false
      },
      recommended: {
        Multiply: ${allocation ? allocation.percentages.Multiply : 25},
        Essentials: ${allocation ? allocation.percentages.Essentials : 35},
        Freedom: ${allocation ? allocation.percentages.Freedom : 25},
        Enjoyment: ${allocation ? allocation.percentages.Enjoyment : 15}
      },
      monthlyIncome: ${preSurveyData && preSurveyData.monthlyIncome ? preSurveyData.monthlyIncome : 0},
      monthlyEssentials: ${preSurveyData && preSurveyData.monthlyEssentials ? preSurveyData.monthlyEssentials : 0},
      priority: '${preSurveyData && preSurveyData.selectedPriority ? preSurveyData.selectedPriority : ''}',
      actualEssentialsPercent: ${preSurveyData && preSurveyData.monthlyEssentials && preSurveyData.monthlyIncome ? Math.round((preSurveyData.monthlyEssentials / preSurveyData.monthlyIncome) * 100) : 0},
      // Pre-survey behavioral data for validation
      preSurvey: {
        satisfaction: ${preSurveyData && preSurveyData.satisfaction ? preSurveyData.satisfaction : 5},
        discipline: ${preSurveyData && preSurveyData.discipline ? preSurveyData.discipline : 5},
        impulse: ${preSurveyData && preSurveyData.impulse ? preSurveyData.impulse : 5},
        longTerm: ${preSurveyData && preSurveyData.longTerm ? preSurveyData.longTerm : 5},
        lifestyle: ${preSurveyData && preSurveyData.lifestyle ? preSurveyData.lifestyle : 5},
        totalDebt: ${preSurveyData && preSurveyData.totalDebt ? preSurveyData.totalDebt : 0},
        emergencyFund: ${preSurveyData && preSurveyData.emergencyFund ? preSurveyData.emergencyFund : 0}
      }
    };

    // Toggle lock on a bucket
    function toggleLock(bucketName) {
      calculatorState.locked[bucketName] = !calculatorState.locked[bucketName];
      var lockBtn = document.getElementById(bucketName.toLowerCase() + 'Lock');
      var container = document.getElementById(bucketName.toLowerCase() + 'Container');
      var slider = document.getElementById(bucketName.toLowerCase() + 'Slider');
      var fill = document.getElementById(bucketName.toLowerCase() + 'Fill');
      var value = document.getElementById(bucketName.toLowerCase() + 'Value');

      if (calculatorState.locked[bucketName]) {
        lockBtn.textContent = '🔒 Locked';
        lockBtn.classList.add('locked');
        container.classList.add('locked');
        slider.disabled = true;
        slider.classList.add('locked');
        fill.classList.add('locked');
        value.classList.add('bucket-slider-locked-value');
      } else {
        lockBtn.textContent = '🔓 Unlocked';
        lockBtn.classList.remove('locked');
        container.classList.remove('locked');
        slider.disabled = false;
        slider.classList.remove('locked');
        fill.classList.remove('locked');
        value.classList.remove('bucket-slider-locked-value');
      }
    }

    // Adjust bucket value with proportional redistribution
    function adjustBucket(bucketName, newValue) {
      newValue = parseFloat(newValue);
      var oldValue = calculatorState.buckets[bucketName];
      var delta = newValue - oldValue;

      // Update the adjusted bucket
      calculatorState.buckets[bucketName] = newValue;

      // Find unlocked buckets (excluding the one being adjusted)
      var unlockedBuckets = [];
      var unlockedTotal = 0;

      for (var key in calculatorState.buckets) {
        if (key !== bucketName && !calculatorState.locked[key]) {
          unlockedBuckets.push(key);
          unlockedTotal += calculatorState.buckets[key];
        }
      }

      // If there are unlocked buckets, redistribute proportionally
      if (unlockedBuckets.length > 0 && unlockedTotal > 0) {
        unlockedBuckets.forEach(function(key) {
          var proportion = calculatorState.buckets[key] / unlockedTotal;
          var adjustment = delta * proportion;
          calculatorState.buckets[key] = Math.max(0, calculatorState.buckets[key] - adjustment);
        });
      } else if (unlockedBuckets.length > 0) {
        // If all unlocked buckets are at 0, distribute evenly
        var evenShare = Math.max(0, (100 - newValue - getLockedTotal()) / unlockedBuckets.length);
        unlockedBuckets.forEach(function(key) {
          calculatorState.buckets[key] = evenShare;
        });
      }

      // Normalize to ensure total is exactly 100%
      normalizeAllocations();

      // Update UI
      updateAllBucketDisplays();
    }

    // Get total of locked buckets
    function getLockedTotal() {
      var total = 0;
      for (var key in calculatorState.locked) {
        if (calculatorState.locked[key]) {
          total += calculatorState.buckets[key];
        }
      }
      return total;
    }

    // Normalize allocations to sum to exactly 100%
    function normalizeAllocations() {
      // First, round all values to whole numbers
      for (var key in calculatorState.buckets) {
        calculatorState.buckets[key] = Math.round(calculatorState.buckets[key]);
      }

      // Then check if total is exactly 100%
      var total = 0;
      for (var key in calculatorState.buckets) {
        total += calculatorState.buckets[key];
      }

      // If not exactly 100%, adjust the largest unlocked bucket
      if (total !== 100) {
        var diff = 100 - total;
        var largestUnlocked = null;
        var largestValue = -1;

        for (var key in calculatorState.buckets) {
          if (!calculatorState.locked[key] && calculatorState.buckets[key] > largestValue) {
            largestValue = calculatorState.buckets[key];
            largestUnlocked = key;
          }
        }

        if (largestUnlocked) {
          calculatorState.buckets[largestUnlocked] = Math.max(0, calculatorState.buckets[largestUnlocked] + diff);
        }
      }
    }

    // Update all bucket displays
    function updateAllBucketDisplays() {
      ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'].forEach(function(bucketName) {
        var value = calculatorState.buckets[bucketName];
        var lowerName = bucketName.toLowerCase();

        document.getElementById(lowerName + 'Value').textContent = value + '%';
        document.getElementById(lowerName + 'Slider').value = value;
        document.getElementById(lowerName + 'Fill').style.width = value + '%';

        // Update dollar amount if we have monthly income
        if (calculatorState.monthlyIncome > 0) {
          var dollarAmount = Math.round(calculatorState.monthlyIncome * value / 100);
          var dollarElem = document.getElementById(lowerName + 'Dollar');
          if (dollarElem) {
            dollarElem.textContent = '($' + dollarAmount.toLocaleString() + ')';
          }
        }
      });

      // Update total display
      var total = 0;
      for (var key in calculatorState.buckets) {
        total += calculatorState.buckets[key];
      }
      document.getElementById('totalAllocation').textContent = Math.round(total) + '%';

      // Color code total (green if 100%, red if not)
      var totalElem = document.getElementById('totalAllocation');
      if (Math.abs(total - 100) < 0.5) {
        totalElem.style.color = '#10b981'; // green
      } else {
        totalElem.style.color = '#ef4444'; // red
      }
    }

    // Reset to recommended values
    function resetToRecommended() {
      // Reset all buckets to recommended values
      for (var key in calculatorState.recommended) {
        calculatorState.buckets[key] = calculatorState.recommended[key];
      }

      // Unlock all buckets
      for (var key in calculatorState.locked) {
        if (calculatorState.locked[key]) {
          toggleLock(key);
        }
      }

      // Update UI
      updateAllBucketDisplays();

      // Close any open helper
      toggleHelper(null);

      // Re-run validation
      checkMyPlan();
    }

    // ============ ENHANCED VALIDATION SYSTEM (Phase 4A) ============

    // Helper function to format dollar amount
    function formatDollars(percent) {
      if (calculatorState.monthlyIncome > 0) {
        var amount = Math.round(calculatorState.monthlyIncome * percent / 100);
        return percent + '% ($' + amount.toLocaleString() + ')';
      }
      return percent + '%';
    }

    // Behavioral Validation: Cross-reference allocations with behavioral traits
    function validateBehavioralAlignment() {
      var warnings = [];
      var buckets = calculatorState.buckets;
      var preSurvey = calculatorState.preSurvey;

      // Low discipline + high Multiply = risky
      if (preSurvey.discipline <= 3 && buckets.Multiply >= 30) {
        warnings.push({
          severity: 'warning',
          bucket: 'Multiply',
          message: 'Your Multiply allocation (' + formatDollars(buckets.Multiply) + ') is ambitious given your discipline level (' + preSurvey.discipline + '/10). Consider starting lower and increasing as habits strengthen.'
        });
      }

      // Low impulse control + high Enjoyment = danger
      if (preSurvey.impulse <= 3 && buckets.Enjoyment >= 30) {
        warnings.push({
          severity: 'warning',
          bucket: 'Enjoyment',
          message: 'With lower impulse control (' + preSurvey.impulse + '/10), a ' + formatDollars(buckets.Enjoyment) + ' Enjoyment allocation may lead to overspending. Consider starting with a smaller amount.'
        });
      }

      // High satisfaction (stressed) but low Enjoyment = burnout risk
      if (preSurvey.satisfaction >= 8 && buckets.Enjoyment <= 10) {
        warnings.push({
          severity: 'suggestion',
          bucket: 'Enjoyment',
          message: 'You report high financial stress (' + preSurvey.satisfaction + '/10). Consider allocating more to Enjoyment (currently ' + formatDollars(buckets.Enjoyment) + ') to avoid burnout.'
        });
      }

      // Low long-term focus + high Multiply = mismatch
      if (preSurvey.longTerm <= 3 && buckets.Multiply >= 25) {
        warnings.push({
          severity: 'warning',
          bucket: 'Multiply',
          message: 'Your long-term focus score (' + preSurvey.longTerm + '/10) suggests wealth-building may feel challenging. Start small or work on building this skill first.'
        });
      }

      return warnings;
    }

    // Values Alignment: Detect mismatches between priority and allocation
    function validateValuesAlignment() {
      var warnings = [];
      var buckets = calculatorState.buckets;
      var priority = calculatorState.priority;

      // Expected ranges for each priority
      var expectedRanges = {
        'Build Long-Term Wealth': { Multiply: [25, 100], Freedom: [0, 30] },
        'Get Out of Debt': { Freedom: [30, 100], Multiply: [0, 20] },
        'Feel Financially Secure': { Essentials: [30, 50], Freedom: [20, 40] },
        'Enjoy Life Now': { Enjoyment: [30, 100] },
        'Save for a Big Goal': { Freedom: [25, 100] },
        'Stabilize to Survive': { Essentials: [40, 100], Freedom: [15, 40] },
        'Build or Stabilize a Business': { Multiply: [20, 50], Freedom: [15, 30] },
        'Create Generational Wealth': { Multiply: [35, 100], Essentials: [20, 35] },
        'Create Life Balance': {}, // All buckets should be 15-35%
        'Reclaim Financial Control': { Freedom: [25, 100] }
      };

      var expected = expectedRanges[priority];
      if (!expected) return warnings;

      // Check each bucket against expected range
      Object.keys(expected).forEach(function(bucket) {
        var range = expected[bucket];
        var min = range[0];
        var max = range[1];
        var actual = buckets[bucket];

        if (actual < min) {
          warnings.push({
            severity: 'suggestion',
            bucket: bucket,
            message: 'Your "' + priority + '" priority typically allocates ' + min + '%+ to ' + bucket + ', but you are at ' + formatDollars(actual) + '. Consider adjusting or re-evaluating your priority.'
          });
        } else if (actual > max) {
          warnings.push({
            severity: 'suggestion',
            bucket: bucket,
            message: 'Your "' + priority + '" priority typically keeps ' + bucket + ' at or below ' + max + '%, but you are at ' + formatDollars(actual) + '. Consider adjusting or re-evaluating your priority.'
          });
        }
      });

      return warnings;
    }

    // Financial Reality Checks: Debt and emergency fund validation
    function validateFinancialReality() {
      var warnings = [];
      var buckets = calculatorState.buckets;
      var preSurvey = calculatorState.preSurvey;
      var monthlyIncome = calculatorState.monthlyIncome;
      var monthlyEssentials = calculatorState.monthlyEssentials;

      // Calculate key metrics
      var totalDebt = preSurvey.totalDebt || 0;
      var emergencyFund = preSurvey.emergencyFund || 0;
      var monthsOfCoverage = monthlyEssentials > 0 ? emergencyFund / monthlyEssentials : 0;

      // Critical: No emergency fund + low Freedom allocation
      if (monthsOfCoverage < 1 && buckets.Freedom < 20) {
        warnings.push({
          severity: 'critical',
          bucket: 'Freedom',
          message: 'You have less than 1 month emergency coverage ($' + emergencyFund.toLocaleString() + '). Your Freedom allocation (' + formatDollars(buckets.Freedom) + ') may be too low to build a safety net quickly.',
          action: 'emergency-fund-helper'
        });
      }

      // Also trigger helper if emergency fund < 3 months AND Freedom < 20%
      if (monthsOfCoverage >= 1 && monthsOfCoverage < 3 && buckets.Freedom < 20) {
        warnings.push({
          severity: 'warning',
          bucket: 'Freedom',
          message: 'Your emergency fund has ' + monthsOfCoverage.toFixed(1) + ' months coverage. Consider increasing Freedom allocation to build to 4+ months faster.',
          action: 'emergency-fund-helper'
        });
      }

      // Warning: High debt + low Freedom allocation
      if (totalDebt > monthlyIncome * 3 && buckets.Freedom < 25) {
        warnings.push({
          severity: 'warning',
          bucket: 'Freedom',
          message: 'With $' + totalDebt.toLocaleString() + ' in debt, consider allocating more to Freedom (currently ' + formatDollars(buckets.Freedom) + ') for debt paydown.'
        });
      }

      // Suggestion: Good emergency fund but still high Freedom
      if (monthsOfCoverage >= 6 && totalDebt < monthlyIncome && buckets.Freedom > 40) {
        warnings.push({
          severity: 'suggestion',
          bucket: 'Freedom',
          message: 'Your emergency fund is solid (' + monthsOfCoverage.toFixed(1) + ' months). You might redirect some Freedom allocation to Multiply for growth.'
        });
      }

      // Existing financial rules
      if (calculatorState.actualEssentialsPercent > 0 && buckets.Essentials < calculatorState.actualEssentialsPercent) {
        var shortfall = calculatorState.actualEssentialsPercent - buckets.Essentials;
        var shortfallDollars = monthlyIncome > 0 ? ' ($' + Math.round(monthlyIncome * shortfall / 100).toLocaleString() + ')' : '';
        warnings.push({
          severity: 'critical',
          bucket: 'Essentials',
          message: 'Your Essentials allocation (' + formatDollars(buckets.Essentials) + ') is less than your actual essential spending (' + formatDollars(calculatorState.actualEssentialsPercent) + '). You may need to reduce expenses by ' + shortfall + '%' + shortfallDollars + ' or adjust your allocation.'
        });
      }

      if (buckets.Essentials > 50) {
        warnings.push({
          severity: 'warning',
          bucket: 'Essentials',
          message: 'Your Essentials allocation (' + formatDollars(buckets.Essentials) + ') is quite high. Consider finding ways to reduce fixed expenses.'
        });
      }

      if (buckets.Multiply < 10) {
        var tenPercent = monthlyIncome > 0 ? ' ($' + Math.round(monthlyIncome * 10 / 100).toLocaleString() + ')' : '';
        warnings.push({
          severity: 'suggestion',
          bucket: 'Multiply',
          message: 'Consider increasing Multiply to at least 10%' + tenPercent + ' for long-term wealth building.'
        });
      }

      if (buckets.Enjoyment > 35) {
        warnings.push({
          severity: 'warning',
          bucket: 'Enjoyment',
          message: 'Your Enjoyment allocation (' + formatDollars(buckets.Enjoyment) + ') is very high. Make sure this aligns with your financial goals.',
          action: 'enjoyment-reality-check'
        });
      }

      if (buckets.Freedom < 10) {
        var tenPercent = monthlyIncome > 0 ? ' ($' + Math.round(monthlyIncome * 10 / 100).toLocaleString() + ')' : '';
        warnings.push({
          severity: 'suggestion',
          bucket: 'Freedom',
          message: 'Consider allocating at least 10%' + tenPercent + ' to Freedom for emergency fund and debt management.'
        });
      }

      return warnings;
    }

    // ============ PHASE 4B: INTERACTIVE HELPERS ============

    // Track currently open helper
    var currentOpenHelper = null;

    // Helper: Emergency Fund Timeline
    function renderEmergencyFundHelper() {
      var monthlyIncome = calculatorState.monthlyIncome || 0;
      var monthlyEssentials = calculatorState.monthlyEssentials || 0;
      var emergencyFund = calculatorState.preSurvey.emergencyFund || 0;
      var currentFreedom = calculatorState.buckets.Freedom;

      if (monthlyEssentials === 0 || monthlyIncome === 0) {
        return '<p>Unable to calculate timeline without income and essentials data.</p>';
      }

      var monthsOfCoverage = emergencyFund / monthlyEssentials;
      var targetAmount = monthlyEssentials * 4; // 4-month target
      var gap = Math.max(0, targetAmount - emergencyFund);

      var currentFreedomDollars = Math.round(monthlyIncome * currentFreedom / 100);
      var suggestedFreedom = 25;
      var suggestedFreedomDollars = Math.round(monthlyIncome * suggestedFreedom / 100);

      var currentTimeline = currentFreedomDollars > 0 ? gap / currentFreedomDollars : 999;
      var suggestedTimeline = suggestedFreedomDollars > 0 ? gap / suggestedFreedomDollars : 999;
      var savings = currentTimeline - suggestedTimeline;

      var html = '<div style="background: rgba(79, 70, 229, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">';
      html += '<h4 style="margin: 0 0 10px 0; color: var(--color-text-primary);">Emergency Fund Timeline</h4>';

      html += '<div style="color: var(--color-text-secondary); margin-bottom: 10px;">';
      html += '<strong>Current:</strong> $' + emergencyFund.toLocaleString() + ' (' + monthsOfCoverage.toFixed(1) + ' months)<br>';
      html += '<strong>Recommended:</strong> $' + targetAmount.toLocaleString() + ' (4 months)<br>';
      html += '<strong>Gap:</strong> $' + gap.toLocaleString();
      html += '</div>';

      html += '<div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #60a5fa; color: #374151;">';
      html += '<strong>At ' + currentFreedom + '% Freedom allocation:</strong><br>';
      html += '$' + currentFreedomDollars.toLocaleString() + '/month to Freedom bucket<br>';
      html += 'Timeline: <strong>' + currentTimeline.toFixed(1) + ' months</strong> to reach 4-month fund';
      html += '</div>';

      if (currentFreedom < suggestedFreedom) {
        html += '<div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #10b981; color: #374151;">';
        html += '<strong>If you increased to ' + suggestedFreedom + '% Freedom:</strong><br>';
        html += '$' + suggestedFreedomDollars.toLocaleString() + '/month to Freedom bucket<br>';
        html += 'Timeline: <strong>' + suggestedTimeline.toFixed(1) + ' months</strong> (' + savings.toFixed(1) + ' months faster!)';
        html += '</div>';

        html += '<div style="margin-top: 15px;">';
        html += '<button onclick="adjustFreedomTo(' + suggestedFreedom + ')" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Adjust Freedom to ' + suggestedFreedom + '%</button>';
        html += '<button onclick="toggleHelper(null)" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Keep Current Plan</button>';
        html += '</div>';
      }

      html += '</div>';
      return html;
    }

    // Helper: Gap Analysis
    function renderGapAnalysisHelper() {
      var html = '<div style="background: rgba(79, 70, 229, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">';
      html += '<h4 style="margin: 0 0 10px 0; color: var(--color-text-primary);">Your Plan vs Recommended</h4>';

      html += '<table style="width: 100%; border-collapse: collapse; color: var(--color-text-secondary);">';
      html += '<thead><tr style="border-bottom: 2px solid #e5e7eb;">';
      html += '<th style="text-align: left; padding: 8px;"></th>';
      html += '<th style="text-align: right; padding: 8px;">Recommended</th>';
      html += '<th style="text-align: right; padding: 8px;">Current</th>';
      html += '<th style="text-align: right; padding: 8px;">Difference</th>';
      html += '</tr></thead><tbody>';

      ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'].forEach(function(bucket) {
        var recommended = calculatorState.recommended[bucket] || 0;
        var current = calculatorState.buckets[bucket] || 0;
        var diff = current - recommended;
        var diffStr = (diff > 0 ? '+' : '') + diff.toFixed(0) + 'pp';
        var diffColor = Math.abs(diff) >= 15 ? '#ef4444' : '#6b7280';

        html += '<tr style="border-bottom: 1px solid #f3f4f6;">';
        html += '<td style="padding: 8px;"><strong>' + bucket + ':</strong></td>';
        html += '<td style="text-align: right; padding: 8px;">' + recommended.toFixed(0) + '%</td>';
        html += '<td style="text-align: right; padding: 8px;">' + current.toFixed(0) + '%</td>';
        html += '<td style="text-align: right; padding: 8px; color: ' + diffColor + ';"><strong>' + diffStr + '</strong></td>';
        html += '</tr>';
      });

      html += '</tbody></table>';

      html += '<div style="margin-top: 15px;">';
      html += '<button onclick="resetToRecommended()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Reset to Recommended</button>';
      html += '<button onclick="toggleHelper(null)" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Keep My Changes</button>';
      html += '</div>';

      html += '</div>';
      return html;
    }

    // Helper: Priority Re-Check
    function renderPriorityReCheckHelper(warning) {
      var priority = calculatorState.priority;

      var html = '<div style="background: rgba(79, 70, 229, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">';
      html += '<h4 style="margin: 0 0 10px 0; color: var(--color-text-primary);">Priority Alignment Check</h4>';

      html += '<div style="color: var(--color-text-secondary); margin-bottom: 15px;">';
      html += 'Your current allocation does not align with your selected priority: <strong>' + priority + '</strong>';
      html += '</div>';

      // Priority-specific explanation
      var explanation = getPriorityExplanation(priority);
      if (explanation) {
        html += '<div style="background: white; padding: 12px; border-radius: 6px; margin: 10px 0; color: #374151; border-left: 3px solid #4f46e5;">';
        html += '<strong style="display: block; margin-bottom: 8px;">Why this priority works this way:</strong>';
        html += explanation;
        html += '</div>';
      }

      html += '<div style="color: var(--color-text-secondary); margin-top: 15px;">';
      html += 'Your allocation mismatch might mean:';
      html += '<ul style="margin: 10px 0; padding-left: 20px;">';
      html += '<li>You accidentally selected the wrong priority</li>';
      html += '<li>Your true priority differs from what you thought</li>';
      html += '<li>You have intentional reasons for this allocation</li>';
      html += '</ul>';
      html += '</div>';

      html += '<div style="margin-top: 15px;">';
      html += '<p style="color: var(--color-text-secondary); margin-bottom: 10px;">What would you like to do?</p>';
      html += '<button onclick="toggleHelper(null)" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; margin-bottom: 8px;">Keep Current Setup (I have my reasons)</button>';
      html += '<button onclick="resetToRecommended()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%;">Adjust Allocation to Match Priority</button>';
      html += '</div>';

      html += '</div>';
      return html;
    }

    // Get priority-specific explanation
    function getPriorityExplanation(priority) {
      var explanations = {
        'Build Long-Term Wealth': '<strong>Multiply (25%+):</strong> You need aggressive wealth-building through investments and income growth.<br><strong>Freedom (≤30%):</strong> Debt paydown takes a backseat to growth - you are betting on higher returns than interest rates.',

        'Get Out of Debt': '<strong>Freedom (30%+):</strong> Aggressive debt paydown is the fastest path to financial peace.<br><strong>Multiply (≤20%):</strong> Growth investments wait until debt is cleared - freedom from payments is your wealth strategy.',

        'Feel Financially Secure': '<strong>Essentials (30-50%):</strong> Stability means comfortable coverage of needs without stress.<br><strong>Freedom (20-40%):</strong> Building emergency cushion and paying down debt creates security.',

        'Enjoy Life Now': '<strong>Enjoyment (30%+):</strong> Your priority is present-day quality of life - experiences, hobbies, dining, travel.<br>Other buckets stay moderate to fund what brings you joy today.',

        'Save for a Big Goal': '<strong>Freedom (25%+):</strong> Whether it is a house, wedding, or sabbatical - you are building a targeted fund.<br>This is not debt paydown or investing, it is dedicated saving for a specific goal.',

        'Stabilize to Survive': '<strong>Essentials (40%+):</strong> You are in crisis mode - covering basics is the only priority right now.<br><strong>Freedom (15-40%):</strong> Building a small buffer to prevent total collapse.',

        'Build or Stabilize a Business': '<strong>Multiply (20-50%):</strong> Reinvesting in your business for growth or survival.<br><strong>Freedom (15-30%):</strong> Covering business debt or building working capital reserves.',

        'Create Generational Wealth': '<strong>Multiply (35%+):</strong> Maximum investment for legacy - you are building wealth to pass down.<br><strong>Essentials (20-35%):</strong> Living lean to maximize what you leave behind.',

        'Create Life Balance': 'All buckets stay moderate (15-35%) - no single area dominates. You are seeking sustainable equilibrium across needs, joy, freedom, and growth.',

        'Reclaim Financial Control': '<strong>Freedom (25%+):</strong> You are clawing back power from debt, chaos, or dependence.<br>This is about gaining breathing room and options - freedom is your foundation.'
      };

      return explanations[priority] || '';
    }

    // Helper: Enjoyment Reality Check
    function renderEnjoymentRealityCheckHelper() {
      var monthlyIncome = calculatorState.monthlyIncome || 0;
      var enjoymentPercent = calculatorState.buckets.Enjoyment;

      if (monthlyIncome === 0) {
        return '<p>Unable to calculate without income data.</p>';
      }

      var monthlyAmount = Math.round(monthlyIncome * enjoymentPercent / 100);
      var weeklyAmount = Math.round(monthlyAmount / 4.33);
      var diningWeekly = Math.round(weeklyAmount / 2);
      var hobbiesWeekly = weeklyAmount - diningWeekly;

      var html = '<div style="background: rgba(79, 70, 229, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">';
      html += '<h4 style="margin: 0 0 10px 0; color: var(--color-text-primary);">Enjoyment Reality Check</h4>';

      html += '<div style="color: var(--color-text-secondary); margin-bottom: 10px;">';
      html += 'Your <strong>$' + monthlyAmount.toLocaleString() + '/month</strong> Enjoyment allocation breaks down to about:';
      html += '</div>';

      html += '<div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0; color: #374151;">';
      html += '• <strong>$' + diningWeekly.toLocaleString() + '/week</strong> for dining and entertainment<br>';
      html += '• <strong>$' + hobbiesWeekly.toLocaleString() + '/week</strong> for hobbies and shopping';
      html += '</div>';

      html += '<p style="color: var(--color-text-secondary); margin: 15px 0;">Does this feel realistic for your lifestyle?</p>';

      html += '<div style="margin-top: 15px;">';
      html += '<button onclick="toggleHelper(null)" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Keep It</button>';
      html += '<button onclick="focusOnBucket(' + String.fromCharCode(39) + 'Enjoyment' + String.fromCharCode(39) + ')" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Adjust Enjoyment</button>';
      html += '</div>';

      html += '</div>';
      return html;
    }

    // Helper: Debt Payoff Timeline
    function renderDebtPayoffTimelineHelper() {
      var monthlyIncome = calculatorState.monthlyIncome || 0;
      var totalDebt = calculatorState.preSurvey.totalDebt || 0;
      var currentFreedom = calculatorState.buckets.Freedom;

      if (monthlyIncome === 0 || totalDebt === 0) {
        return '<p>Unable to calculate timeline without income and debt data.</p>';
      }

      // Calculate current and suggested payoff scenarios
      var currentFreedomDollars = Math.round(monthlyIncome * currentFreedom / 100);
      var suggestedFreedom = 30; // Recommended for aggressive debt payoff
      var suggestedFreedomDollars = Math.round(monthlyIncome * suggestedFreedom / 100);

      // Assume 15% average interest rate for rough calculations
      var avgInterestRate = 0.15;
      var monthlyInterest = avgInterestRate / 12;

      // Calculate payoff timeline (simplified - assumes consistent payments)
      function calculatePayoffMonths(debt, monthlyPayment, rate) {
        if (monthlyPayment <= debt * rate) {
          return 999; // Payment does not cover interest
        }
        // Using loan payoff formula: n = -log(1 - r*P/M) / log(1 + r)
        // where P = principal, M = monthly payment, r = monthly rate
        return Math.ceil(-Math.log(1 - rate * debt / monthlyPayment) / Math.log(1 + rate));
      }

      var currentMonths = calculatePayoffMonths(totalDebt, currentFreedomDollars, monthlyInterest);
      var suggestedMonths = calculatePayoffMonths(totalDebt, suggestedFreedomDollars, monthlyInterest);
      var monthsSaved = currentMonths - suggestedMonths;

      // Calculate total interest paid in each scenario
      function calculateTotalInterest(debt, monthlyPayment, months, rate) {
        if (months >= 999) return debt; // Cannot pay off
        return (monthlyPayment * months) - debt;
      }

      var currentInterest = calculateTotalInterest(totalDebt, currentFreedomDollars, currentMonths, monthlyInterest);
      var suggestedInterest = calculateTotalInterest(totalDebt, suggestedFreedomDollars, suggestedMonths, monthlyInterest);
      var interestSaved = currentInterest - suggestedInterest;

      var html = '<div style="background: rgba(79, 70, 229, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">';
      html += '<h4 style="margin: 0 0 10px 0; color: var(--color-text-primary);">Debt Payoff Timeline</h4>';

      html += '<div style="color: var(--color-text-secondary); margin-bottom: 10px;">';
      html += '<strong>Current Total Debt:</strong> $' + totalDebt.toLocaleString();
      html += '<br><small>Estimated at ~15% average interest rate</small>';
      html += '</div>';

      // Current scenario
      html += '<div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #60a5fa; color: #374151;">';
      html += '<strong>At ' + currentFreedom + '% Freedom allocation:</strong><br>';
      html += '$' + currentFreedomDollars.toLocaleString() + '/month to debt paydown<br>';
      if (currentMonths >= 999) {
        html += 'Timeline: <strong style="color: #ef4444;">Cannot pay off</strong> (payment does not cover interest)<br>';
        html += 'Total interest: <strong style="color: #ef4444;">Debt grows indefinitely</strong>';
      } else {
        html += 'Timeline: <strong>' + currentMonths + ' months</strong> (' + Math.floor(currentMonths / 12) + ' years, ' + (currentMonths % 12) + ' months)<br>';
        html += 'Total interest paid: <strong>$' + Math.round(currentInterest).toLocaleString() + '</strong>';
      }
      html += '</div>';

      // Suggested scenario (only show if current < suggested)
      if (currentFreedom < suggestedFreedom) {
        html += '<div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #10b981; color: #374151;">';
        html += '<strong>If you increased to ' + suggestedFreedom + '% Freedom:</strong><br>';
        html += '$' + suggestedFreedomDollars.toLocaleString() + '/month to debt paydown<br>';
        if (suggestedMonths >= 999) {
          html += 'Timeline: <strong style="color: #ef4444;">Cannot pay off</strong> (payment does not cover interest)';
        } else {
          html += 'Timeline: <strong>' + suggestedMonths + ' months</strong> (' + Math.floor(suggestedMonths / 12) + ' years, ' + (suggestedMonths % 12) + ' months)<br>';
          html += 'Total interest paid: <strong>$' + Math.round(suggestedInterest).toLocaleString() + '</strong><br>';
          if (monthsSaved > 0) {
            html += '<span style="color: #10b981;">✓ <strong>' + monthsSaved + ' months faster</strong> and save <strong>$' + Math.round(interestSaved).toLocaleString() + '</strong> in interest!</span>';
          }
        }
        html += '</div>';

        html += '<div style="margin-top: 15px;">';
        html += '<button onclick="adjustFreedomTo(' + suggestedFreedom + ')" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Adjust Freedom to ' + suggestedFreedom + '%</button>';
        html += '<button onclick="toggleHelper(null)" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Keep Current Plan</button>';
        html += '</div>';
      } else {
        html += '<div style="margin-top: 15px;">';
        html += '<button onclick="toggleHelper(null)" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close</button>';
        html += '</div>';
      }

      html += '</div>';
      return html;
    }

    // Helper: Lifestyle Inflation Check
    function renderLifestyleInflationCheckHelper() {
      var monthlyIncome = calculatorState.monthlyIncome || 0;
      var enjoymentPercent = calculatorState.buckets.Enjoyment;
      var multiplyPercent = calculatorState.buckets.Multiply;

      if (monthlyIncome === 0) {
        return '<p>Unable to calculate without income data.</p>';
      }

      var enjoymentDollars = Math.round(monthlyIncome * enjoymentPercent / 100);
      var multiplyDollars = Math.round(monthlyIncome * multiplyPercent / 100);

      // Determine income level (rough percentiles)
      var incomeLevel = '';
      var incomePercentile = '';
      if (monthlyIncome >= 15000) {
        incomeLevel = 'Very High';
        incomePercentile = 'Top 5%';
      } else if (monthlyIncome >= 10000) {
        incomeLevel = 'High';
        incomePercentile = 'Top 15%';
      } else if (monthlyIncome >= 7000) {
        incomeLevel = 'Above Average';
        incomePercentile = 'Top 35%';
      } else if (monthlyIncome >= 4000) {
        incomeLevel = 'Average';
        incomePercentile = 'Middle 50%';
      } else {
        incomeLevel = 'Below Average';
        incomePercentile = 'Lower 50%';
      }

      // Calculate what wealth could look like with shift
      var suggestedEnjoyment = 20;
      var suggestedMultiply = Math.min(multiplyPercent + (enjoymentPercent - suggestedEnjoyment), 50);
      var shiftAmount = enjoymentPercent - suggestedEnjoyment;

      var currentMultiplyAnnual = multiplyDollars * 12;
      var suggestedMultiplyDollars = Math.round(monthlyIncome * suggestedMultiply / 100);
      var suggestedMultiplyAnnual = suggestedMultiplyDollars * 12;

      // 10-year projection at 7% average return
      var years = 10;
      var annualReturn = 0.07;
      function futureValue(monthlyContribution, years, rate) {
        var months = years * 12;
        var monthlyRate = rate / 12;
        return monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      }

      var currentWealth = futureValue(multiplyDollars, years, annualReturn);
      var suggestedWealth = futureValue(suggestedMultiplyDollars, years, annualReturn);
      var wealthGap = suggestedWealth - currentWealth;

      var html = '<div style="background: rgba(79, 70, 229, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">';
      html += '<h4 style="margin: 0 0 10px 0; color: var(--color-text-primary);">Lifestyle Inflation Check</h4>';

      html += '<div style="color: var(--color-text-secondary); margin-bottom: 10px;">';
      html += '<strong>Your Income Level:</strong> $' + monthlyIncome.toLocaleString() + '/month (' + incomeLevel + ', ~' + incomePercentile + ')';
      html += '</div>';

      html += '<div style="background: white; padding: 12px; border-radius: 6px; margin: 10px 0; color: #374151; border-left: 3px solid #fbbf24;">';
      html += '<strong>Current Allocation Comparison:</strong><br>';
      html += 'Enjoyment: <strong>' + enjoymentPercent + '%</strong> ($' + enjoymentDollars.toLocaleString() + '/month)<br>';
      html += 'Multiply: <strong>' + multiplyPercent + '%</strong> ($' + multiplyDollars.toLocaleString() + '/month)';
      html += '</div>';

      if (enjoymentPercent > suggestedEnjoyment) {
        html += '<div style="background: white; padding: 12px; border-radius: 6px; margin: 10px 0; color: #374151; border-left: 3px solid #10b981;">';
        html += '<strong>10-Year Wealth Projection (7% avg return):</strong><br><br>';
        html += '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">';
        html += '<div>Current path (' + multiplyPercent + '% Multiply):</div>';
        html += '<div><strong>$' + Math.round(currentWealth).toLocaleString() + '</strong></div>';
        html += '</div>';
        html += '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">';
        html += '<div>If shifted to ' + suggestedMultiply + '% Multiply:</div>';
        html += '<div><strong style="color: #10b981;">$' + Math.round(suggestedWealth).toLocaleString() + '</strong></div>';
        html += '</div>';
        html += '<div style="border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between;">';
        html += '<div>Potential Wealth Gap:</div>';
        html += '<div><strong style="color: #ef4444; font-size: 16px;">$' + Math.round(wealthGap).toLocaleString() + '</strong></div>';
        html += '</div>';
        html += '</div>';

        html += '<div style="color: var(--color-text-secondary); margin: 15px 0; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 6px;">';
        html += '<strong>The Lifestyle Creep Reality:</strong><br>';
        html += 'As income grows, spending often grows with it. Your ' + enjoymentPercent + '% Enjoyment allocation suggests you might be prioritizing present comfort over future wealth.';
        html += '<br><br>';
        html += 'Question to consider: <em>Are you living like you earn $' + monthlyIncome.toLocaleString() + '/month, or building wealth like someone who earns that much?</em>';
        html += '</div>';

        html += '<div style="margin-top: 15px;">';
        html += '<button onclick="shiftEnjoymentToMultiply(' + suggestedEnjoyment + ', ' + suggestedMultiply + ')" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Shift to ' + suggestedMultiply + '% Multiply</button>';
        html += '<button onclick="toggleHelper(null)" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Keep Current Plan</button>';
        html += '</div>';
      } else {
        html += '<div style="color: var(--color-text-secondary); margin: 15px 0;">';
        html += '✓ Your current allocation prioritizes wealth-building appropriately for your income level.';
        html += '</div>';
        html += '<div style="margin-top: 15px;">';
        html += '<button onclick="toggleHelper(null)" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close</button>';
        html += '</div>';
      }

      html += '</div>';
      return html;
    }

    // Get helper title for button text
    function getHelperTitle(helperType) {
      var titles = {
        'emergency-fund-helper': 'Emergency Fund Timeline',
        'gap-analysis': 'Gap Analysis',
        'priority-recheck': 'Priority Re-Check',
        'enjoyment-reality-check': 'Enjoyment Reality Check',
        'debt-payoff-timeline': 'Debt Payoff Timeline',
        'lifestyle-inflation-check': 'Lifestyle Inflation Check'
      };
      return titles[helperType] || 'Details';
    }

    // Render helper by type
    function renderHelperByType(helperType) {
      switch(helperType) {
        case 'emergency-fund-helper':
          return renderEmergencyFundHelper();
        case 'gap-analysis':
          return renderGapAnalysisHelper();
        case 'priority-recheck':
          return renderPriorityReCheckHelper();
        case 'enjoyment-reality-check':
          return renderEnjoymentRealityCheckHelper();
        case 'debt-payoff-timeline':
          return renderDebtPayoffTimelineHelper();
        case 'lifestyle-inflation-check':
          return renderLifestyleInflationCheckHelper();
        default:
          return '<p>Helper not found.</p>';
      }
    }

    // Toggle helper display
    function toggleHelper(helperType) {
      // Close currently open helper
      if (currentOpenHelper) {
        var currentContent = document.getElementById('helper-content-' + currentOpenHelper);
        if (currentContent) {
          currentContent.style.display = 'none';
        }
      }

      // If same helper, just close it
      if (currentOpenHelper === helperType) {
        currentOpenHelper = null;
        return;
      }

      // Open new helper
      if (helperType) {
        var newContent = document.getElementById('helper-content-' + helperType);
        if (newContent) {
          newContent.style.display = 'block';
          currentOpenHelper = helperType;

          // Scroll to helper
          newContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        currentOpenHelper = null;
      }
    }

    // Helper action: Adjust Freedom to specific percentage
    function adjustFreedomTo(targetPercent) {
      calculatorState.buckets.Freedom = targetPercent;

      // Redistribute from other buckets proportionally
      var remaining = 100 - targetPercent;
      var otherBuckets = ['Multiply', 'Essentials', 'Enjoyment'];
      var otherTotal = 0;
      otherBuckets.forEach(function(bucket) {
        if (!calculatorState.locked[bucket]) {
          otherTotal += calculatorState.buckets[bucket];
        }
      });

      if (otherTotal > 0) {
        otherBuckets.forEach(function(bucket) {
          if (!calculatorState.locked[bucket]) {
            calculatorState.buckets[bucket] = Math.round((calculatorState.buckets[bucket] / otherTotal) * remaining);
          }
        });
      }

      // Normalize to 100%
      var total = 0;
      for (var key in calculatorState.buckets) {
        total += calculatorState.buckets[key];
      }
      var diff = 100 - total;
      if (diff !== 0) {
        calculatorState.buckets.Multiply += diff;
      }

      // Update UI
      updateAllBucketDisplays();

      // Close helper and re-run validation
      toggleHelper(null);
      checkMyPlan();
    }

    // Helper action: Focus on specific bucket slider
    function focusOnBucket(bucketName) {
      toggleHelper(null);
      var slider = document.getElementById(bucketName.toLowerCase() + 'Slider');
      if (slider) {
        slider.scrollIntoView({ behavior: 'smooth', block: 'center' });
        slider.focus();
      }
    }

    // Helper action: Shift Enjoyment to Multiply for lifestyle inflation check
    function shiftEnjoymentToMultiply(targetEnjoyment, targetMultiply) {
      calculatorState.buckets.Enjoyment = targetEnjoyment;
      calculatorState.buckets.Multiply = targetMultiply;

      // Redistribute remaining to other buckets proportionally
      var remaining = 100 - targetEnjoyment - targetMultiply;
      var otherBuckets = ['Essentials', 'Freedom'];
      var otherTotal = 0;
      otherBuckets.forEach(function(bucket) {
        if (!calculatorState.locked[bucket]) {
          otherTotal += calculatorState.buckets[bucket];
        }
      });

      if (otherTotal > 0) {
        otherBuckets.forEach(function(bucket) {
          if (!calculatorState.locked[bucket]) {
            calculatorState.buckets[bucket] = Math.round((calculatorState.buckets[bucket] / otherTotal) * remaining);
          }
        });
      }

      // Normalize to 100%
      var total = 0;
      for (var key in calculatorState.buckets) {
        total += calculatorState.buckets[key];
      }
      var diff = 100 - total;
      if (diff !== 0) {
        calculatorState.buckets.Essentials += diff;
      }

      // Update UI
      updateAllBucketDisplays();

      // Close helper and re-run validation
      toggleHelper(null);
      checkMyPlan();
    }

    // Detect gap between recommended and current (15pp threshold)
    function detectGap() {
      var hasGap = false;
      ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'].forEach(function(bucket) {
        var recommended = calculatorState.recommended[bucket] || 0;
        var current = calculatorState.buckets[bucket] || 0;
        var diff = Math.abs(current - recommended);
        if (diff >= 15) {
          hasGap = true;
        }
      });
      return hasGap;
    }

    // Detect priority mismatch (2+ buckets out of expected range)
    function detectPriorityMismatch() {
      var valuesWarnings = validateValuesAlignment();
      // Count suggestions from values alignment (these indicate buckets out of expected range)
      var mismatchCount = 0;
      valuesWarnings.forEach(function(warning) {
        if (warning.severity === 'suggestion') {
          mismatchCount++;
        }
      });
      return mismatchCount >= 2;
    }

    // Detect if debt payoff timeline helper should trigger
    function detectDebtPayoffTimeline() {
      var totalDebt = calculatorState.preSurvey.totalDebt || 0;
      var freedom = calculatorState.buckets.Freedom;
      return totalDebt > 0 && freedom < 30;
    }

    // Detect if lifestyle inflation check should trigger
    function detectLifestyleInflation() {
      var monthlyIncome = calculatorState.monthlyIncome || 0;
      var enjoyment = calculatorState.buckets.Enjoyment;
      var multiply = calculatorState.buckets.Multiply;

      // Trigger if income > $5000/month AND Enjoyment > 30% AND Multiply < 15%
      return monthlyIncome > 5000 && enjoyment > 30 && multiply < 15;
    }

    // ============ END PHASE 4B HELPERS ============

    // Main validation function
    function checkMyPlan() {
      // Run all validation types
      var financialWarnings = validateFinancialReality();
      var behavioralWarnings = validateBehavioralAlignment();
      var valuesWarnings = validateValuesAlignment();

      // Add Gap Analysis helper if needed (15pp threshold)
      if (detectGap()) {
        behavioralWarnings.push({
          severity: 'suggestion',
          bucket: 'All Buckets',
          message: 'Your current allocation has drifted 15+ percentage points from recommended in at least one bucket. Review the differences to see if this aligns with your goals.',
          action: 'gap-analysis'
        });
      }

      // Add Priority Re-Check helper if needed (2+ values mismatches)
      if (detectPriorityMismatch()) {
        valuesWarnings.push({
          severity: 'suggestion',
          bucket: 'Priority',
          message: 'Your allocation pattern suggests a different priority than you selected. Double-check that your selected priority matches your actual goals.',
          action: 'priority-recheck'
        });
      }

      // Add Debt Payoff Timeline helper if needed
      if (detectDebtPayoffTimeline()) {
        financialWarnings.push({
          severity: 'warning',
          bucket: 'Freedom',
          message: 'You have debt but are allocating less than 30% to Freedom. See how increasing your Freedom allocation could accelerate your debt payoff.',
          action: 'debt-payoff-timeline'
        });
      }

      // Add Lifestyle Inflation Check helper if needed
      if (detectLifestyleInflation()) {
        behavioralWarnings.push({
          severity: 'warning',
          bucket: 'Enjoyment / Multiply',
          message: 'Your income supports wealth-building, but your allocation prioritizes present enjoyment over future wealth. Consider the long-term impact.',
          action: 'lifestyle-inflation-check'
        });
      }

      // Categorize by severity
      var allWarnings = {
        critical: [],
        warning: [],
        suggestion: []
      };

      [].concat(financialWarnings, behavioralWarnings, valuesWarnings).forEach(function(warning) {
        allWarnings[warning.severity].push(warning);
      });

      // Display results
      var resultsDiv = document.getElementById('validationResults');
      var html = '';

      var totalCount = allWarnings.critical.length + allWarnings.warning.length + allWarnings.suggestion.length;

      if (totalCount === 0) {
        html = '<div style="color: var(--color-text-primary); text-align: center;"><strong>✅ Your allocation looks balanced!</strong><br><br>All buckets are within recommended ranges and align with your behavioral profile.</div>';
        resultsDiv.style.background = 'rgba(34, 197, 94, 0.1)';
        resultsDiv.style.borderColor = 'rgba(34, 197, 94, 0.3)';
      } else {
        html = '<div style="color: var(--color-text-primary);">';

        if (allWarnings.critical.length > 0) {
          html += '<div style="margin-bottom: 15px;"><strong style="color: #ef4444;">🔴 CRITICAL:</strong></div>';
          allWarnings.critical.forEach(function(warning) {
            html += '<div style="margin: 10px 0; padding-left: 15px;">';
            html += '<p style="margin: 0 0 5px 0; color: var(--color-text-secondary);"><strong>' + warning.bucket + ':</strong> ' + warning.message + '</p>';

            // Add "Learn More" button if helper exists
            if (warning.action) {
              html += '<button onclick="toggleHelper(' + String.fromCharCode(39) + warning.action + String.fromCharCode(39) + ')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; margin-top: 5px;">Learn More: ' + getHelperTitle(warning.action) + '</button>';
              html += '<div id="helper-content-' + warning.action + '" style="display: none;">';
              html += renderHelperByType(warning.action);
              html += '</div>';
            }

            html += '</div>';
          });
        }

        if (allWarnings.warning.length > 0) {
          html += '<div style="margin-top: 20px; margin-bottom: 15px;"><strong style="color: #fbbf24;">🟡 WARNINGS:</strong></div>';
          allWarnings.warning.forEach(function(warning) {
            html += '<div style="margin: 10px 0; padding-left: 15px;">';
            html += '<p style="margin: 0 0 5px 0; color: var(--color-text-secondary);"><strong>' + warning.bucket + ':</strong> ' + warning.message + '</p>';

            // Add "Learn More" button if helper exists
            if (warning.action) {
              html += '<button onclick="toggleHelper(' + String.fromCharCode(39) + warning.action + String.fromCharCode(39) + ')" style="background: #fbbf24; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; margin-top: 5px;">Learn More: ' + getHelperTitle(warning.action) + '</button>';
              html += '<div id="helper-content-' + warning.action + '" style="display: none;">';
              html += renderHelperByType(warning.action);
              html += '</div>';
            }

            html += '</div>';
          });
        }

        if (allWarnings.suggestion.length > 0) {
          html += '<div style="margin-top: 20px; margin-bottom: 15px;"><strong style="color: #60a5fa;">🔵 SUGGESTIONS:</strong></div>';
          allWarnings.suggestion.forEach(function(warning) {
            html += '<div style="margin: 10px 0; padding-left: 15px;">';
            html += '<p style="margin: 0 0 5px 0; color: var(--color-text-secondary);"><strong>' + warning.bucket + ':</strong> ' + warning.message + '</p>';

            // Add "Learn More" button if helper exists
            if (warning.action) {
              html += '<button onclick="toggleHelper(' + String.fromCharCode(39) + warning.action + String.fromCharCode(39) + ')" style="background: #60a5fa; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; margin-top: 5px;">Learn More: ' + getHelperTitle(warning.action) + '</button>';
              html += '<div id="helper-content-' + warning.action + '" style="display: none;">';
              html += renderHelperByType(warning.action);
              html += '</div>';
            }

            html += '</div>';
          });
        }

        html += '</div>';
        resultsDiv.style.background = 'rgba(79, 70, 229, 0.1)';
        resultsDiv.style.borderColor = 'rgba(79, 70, 229, 0.3)';
      }

      resultsDiv.innerHTML = html;
      resultsDiv.style.display = 'block';

      // Scroll to validation results
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Save scenario functionality
    var MAX_SCENARIOS = 10;

    function saveScenario() {
      // Check if we are at the limit and warn user
      if (savedScenarios.length >= MAX_SCENARIOS) {
        // Find the oldest scenario (last in the sorted array since we sort newest first)
        var oldestScenario = savedScenarios[savedScenarios.length - 1];
        var oldestName = oldestScenario ? oldestScenario.name : 'oldest scenario';

        var confirmSave = confirm(
          'You have reached the maximum of ' + MAX_SCENARIOS + ' saved scenarios.\\n\\n' +
          'Saving a new scenario will delete your oldest one:\\n"' + oldestName + '"\\n\\n' +
          'Do you want to continue?'
        );

        if (!confirmSave) {
          return;
        }
      }

      var scenarioName = prompt('Enter a name for this scenario:', 'My Custom Allocation');

      if (scenarioName) {
        var scenario = {
          name: scenarioName,
          allocations: JSON.parse(JSON.stringify(calculatorState.buckets)),
          timestamp: new Date().toISOString(),
          monthlyIncome: calculatorState.monthlyIncome || 0,
          priority: calculatorState.priority || ''
        };

        // Show loading
        var loadingOverlay = document.getElementById('loadingOverlay');
        var loadingText = document.getElementById('loadingText');
        var loadingSubtext = document.getElementById('loadingSubtext');

        if (loadingOverlay) {
          if (loadingText) loadingText.textContent = 'Saving Scenario...';
          if (loadingSubtext) loadingSubtext.textContent = 'Storing your custom allocation';
          loadingOverlay.classList.add('show');
        }

        // Call server-side save function
        google.script.run
          .withSuccessHandler(function(result) {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            if (result.success) {
              var message = '✅ Scenario saved successfully!\\n\\n"' + scenarioName + '" has been saved.';
              if (result.deletedScenario) {
                message += '\\n\\nOldest scenario "' + result.deletedScenario + '" was removed to stay within the ' + MAX_SCENARIOS + ' scenario limit.';
              }
              alert(message);
              // Refresh the scenario list to show the new scenario
              if (typeof refreshScenarioList === 'function') {
                refreshScenarioList();
              }
            } else {
              alert('❌ Error saving scenario: ' + (result.error || 'Unknown error'));
            }
          })
          .withFailureHandler(function(error) {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            console.error('Save scenario error:', error);
            alert('❌ Error saving scenario: ' + error.message);
          })
          .saveScenario('${clientId}', scenario);
      }
    }

    // ============ REPORT DOWNLOAD FUNCTIONS ============

    // Download main report PDF
    function downloadMainReport() {
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Generating Report...';
        if (loadingSubtext) loadingSubtext.textContent = 'Creating your personalized PDF';
        loadingOverlay.classList.add('show');
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          if (result.success) {
            // Trigger download
            var link = document.createElement('a');
            link.href = 'data:application/pdf;base64,' + result.pdf;
            link.download = result.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            alert('Error generating report: ' + (result.error || 'Unknown error'));
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          console.error('Report generation error:', error);
          alert('Error generating report: ' + error.message);
        })
        .generateTool4MainPDF('${clientId}');
    }

    // Download comparison report PDF
    function downloadComparisonReport() {
      var select1 = document.getElementById('scenario1Select');
      var select2 = document.getElementById('scenario2Select');

      if (!select1 || !select2 || select1.value === '' || select2.value === '' || select1.value === select2.value) {
        alert('Please select two different scenarios to compare before downloading.');
        return;
      }

      var scenario1 = savedScenarios[parseInt(select1.value)];
      var scenario2 = savedScenarios[parseInt(select2.value)];

      if (!scenario1 || !scenario2) {
        alert('Could not find the selected scenarios. Please try again.');
        return;
      }

      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Generating Comparison Report...';
        if (loadingSubtext) loadingSubtext.textContent = 'Creating your scenario comparison PDF';
        loadingOverlay.classList.add('show');
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          if (result.success) {
            // Trigger download
            var link = document.createElement('a');
            link.href = 'data:application/pdf;base64,' + result.pdf;
            link.download = result.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            alert('Error generating comparison report: ' + (result.error || 'Unknown error'));
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          console.error('Comparison report generation error:', error);
          alert('Error generating comparison report: ' + error.message);
        })
        .generateTool4ComparisonPDF('${clientId}', scenario1, scenario2);
    }

    // ============ SCENARIO MANAGEMENT FUNCTIONS ============

    // Store scenarios for client-side access
    var savedScenarios = [];
    var preSurveyDataForComparison = ${JSON.stringify(preSurveyData || {})};

    // Load and display scenarios on page load
    function refreshScenarioList() {
      var container = document.getElementById('scenarioListContainer');
      container.innerHTML = '<p style="color: var(--color-text-muted); font-style: italic;">Loading...</p>';

      google.script.run
        .withSuccessHandler(function(scenarios) {
          console.log('getScenariosFromSheet success:', scenarios);
          console.log('scenarios type:', typeof scenarios);
          console.log('scenarios length:', scenarios ? scenarios.length : 'null/undefined');
          savedScenarios = scenarios || [];
          renderScenarioList(scenarios);
          updateComparisonDropdowns(scenarios);
        })
        .withFailureHandler(function(error) {
          console.error('getScenariosFromSheet error:', error);
          container.innerHTML = '<p style="color: #ef4444;">Error loading scenarios: ' + error.message + '</p>';
        })
        .getScenariosFromSheet('${clientId}');
    }

    // Render the scenario list
    function renderScenarioList(scenarios) {
      var container = document.getElementById('scenarioListContainer');
      var countEl = document.getElementById('scenarioCount');

      // Update the count in the header
      if (countEl) {
        countEl.textContent = scenarios && scenarios.length > 0 ? '(' + scenarios.length + ')' : '';
      }

      if (!scenarios || scenarios.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted);">No saved scenarios yet. Use the "Save Scenario" button above to save your allocation.</p>';
        document.getElementById('comparisonView').style.display = 'none';
        return;
      }

      var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

      scenarios.forEach(function(scenario, index) {
        var timestamp = new Date(scenario.timestamp);
        var dateStr = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        html += '<div class="scenario-card" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">';
        html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">';
        html += '<div>';
        html += '<div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 5px;">' + scenario.name + '</div>';
        html += '<div style="font-size: 0.85rem; color: var(--color-text-muted);">';
        html += 'M:' + scenario.allocations.Multiply + '% ';
        html += 'E:' + scenario.allocations.Essentials + '% ';
        html += 'F:' + scenario.allocations.Freedom + '% ';
        html += 'J:' + scenario.allocations.Enjoyment + '%';
        html += '</div>';
        html += '<div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 3px;">Saved: ' + dateStr + '</div>';
        html += '</div>';
        html += '<div style="display: flex; gap: 8px;">';
        html += '<button type="button" onclick="loadScenario(' + index + ')" style="padding: 6px 12px; font-size: 0.85rem; background: rgba(79, 70, 229, 0.2); border: 1px solid rgba(79, 70, 229, 0.4); color: var(--color-primary); border-radius: 6px; cursor: pointer;">Load</button>';
        html += '<button type="button" onclick="deleteScenarioConfirm(' + index + ')" style="padding: 6px 12px; font-size: 0.85rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 6px; cursor: pointer;">Delete</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      });

      html += '</div>';

      // Show compare button if 2+ scenarios
      if (scenarios.length >= 2) {
        html += '<div style="margin-top: 15px; text-align: center;">';
        html += '<button type="button" onclick="showComparisonView()" class="btn-secondary" style="padding: 10px 20px;">📊 Compare Scenarios</button>';
        html += '</div>';
      }

      container.innerHTML = html;
    }

    // Load a scenario into the calculator
    function loadScenario(index) {
      var scenario = savedScenarios[index];
      if (!scenario) return;

      // Update calculator state
      calculatorState.buckets.Multiply = scenario.allocations.Multiply;
      calculatorState.buckets.Essentials = scenario.allocations.Essentials;
      calculatorState.buckets.Freedom = scenario.allocations.Freedom;
      calculatorState.buckets.Enjoyment = scenario.allocations.Enjoyment;

      // Update UI
      updateAllBucketDisplays();

      // Scroll to calculator
      document.querySelector('.interactive-calculator').scrollIntoView({ behavior: 'smooth' });

      alert('Loaded scenario: "' + scenario.name + '"');
    }

    // Delete confirmation
    function deleteScenarioConfirm(index) {
      var scenario = savedScenarios[index];
      if (!scenario) return;

      if (confirm('Delete scenario "' + scenario.name + '"?\\n\\nThis cannot be undone.')) {
        google.script.run
          .withSuccessHandler(function(result) {
            if (result.success) {
              alert('Scenario deleted.');
              refreshScenarioList();
            } else {
              alert('Error deleting scenario: ' + (result.error || 'Unknown error'));
            }
          })
          .withFailureHandler(function(error) {
            alert('Error deleting scenario: ' + error.message);
          })
          .deleteScenario('${clientId}', scenario.name);
      }
    }

    // Show comparison view
    function showComparisonView() {
      document.getElementById('comparisonView').style.display = 'block';
      document.getElementById('comparisonView').scrollIntoView({ behavior: 'smooth' });
    }

    // Update comparison dropdowns
    function updateComparisonDropdowns(scenarios) {
      var select1 = document.getElementById('scenario1Select');
      var select2 = document.getElementById('scenario2Select');

      // Guard against null elements (comparison view may be hidden)
      if (!select1 || !select2) return;
      if (!scenarios || !scenarios.length) return;

      var options = '<option value="">Select scenario...</option>';
      scenarios.forEach(function(scenario, index) {
        options += '<option value="' + index + '">' + scenario.name + ' (M:' + scenario.allocations.Multiply + '% E:' + scenario.allocations.Essentials + '% F:' + scenario.allocations.Freedom + '% J:' + scenario.allocations.Enjoyment + '%)</option>';
      });

      select1.innerHTML = options;
      select2.innerHTML = options;
    }

    // Update comparison when selections change
    function updateComparison() {
      var select1 = document.getElementById('scenario1Select');
      var select2 = document.getElementById('scenario2Select');
      var resultsContainer = document.getElementById('comparisonResults');

      var index1 = select1.value;
      var index2 = select2.value;

      if (index1 === '' || index2 === '' || index1 === index2) {
        resultsContainer.innerHTML = '<p style="color: var(--color-text-muted); font-style: italic;">Select two different scenarios to compare.</p>';
        return;
      }

      var scenario1 = savedScenarios[parseInt(index1)];
      var scenario2 = savedScenarios[parseInt(index2)];

      if (!scenario1 || !scenario2) return;

      // Generate comparison
      var monthlyIncome = preSurveyDataForComparison.monthlyIncome || scenario1.monthlyIncome || scenario2.monthlyIncome || 0;
      renderComparisonResults(scenario1, scenario2, monthlyIncome);
    }

    // Render comparison results with impact narratives
    function renderComparisonResults(scenario1, scenario2, monthlyIncome) {
      var resultsContainer = document.getElementById('comparisonResults');
      var hasDebt = preSurveyDataForComparison.totalDebt && preSurveyDataForComparison.totalDebt > 0;

      // Calculate differences
      var diffs = {};
      ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'].forEach(function(bucket) {
        var pct1 = scenario1.allocations[bucket] || 0;
        var pct2 = scenario2.allocations[bucket] || 0;
        var dollar1 = Math.round(monthlyIncome * pct1 / 100);
        var dollar2 = Math.round(monthlyIncome * pct2 / 100);
        diffs[bucket] = {
          pct1: pct1,
          pct2: pct2,
          pctDiff: pct2 - pct1,
          dollar1: dollar1,
          dollar2: dollar2,
          dollarDiff: dollar2 - dollar1,
          isSignificant: Math.abs(dollar2 - dollar1) >= 200 || Math.abs(pct2 - pct1) >= 5
        };
      });

      // Build HTML
      var html = '';

      // Check for profile differences between scenarios
      var profile1 = scenario1.profileSnapshot || {};
      var profile2 = scenario2.profileSnapshot || {};
      var profileDiffers = (
        scenario1.monthlyIncome !== scenario2.monthlyIncome ||
        profile1.currentEssentials !== profile2.currentEssentials ||
        profile1.debtBalance !== profile2.debtBalance ||
        profile1.emergencyFund !== profile2.emergencyFund ||
        scenario1.priority !== scenario2.priority
      );

      // Profile Context Section (always show, highlight differences)
      html += '<div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid ' + (profileDiffers ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255,255,255,0.1)') + ';">';
      html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">';
      html += '<span style="font-size: 1rem;">📋</span>';
      html += '<h4 style="color: var(--color-text-primary); margin: 0; font-size: 0.95rem;">Profile Context When Saved</h4>';
      if (profileDiffers) {
        html += '<span style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; margin-left: auto;">Profiles Differ</span>';
      }
      html += '</div>';

      html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.85rem;">';

      // Scenario 1 profile
      html += '<div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 6px;">';
      html += '<div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">' + scenario1.name + '</div>';
      html += '<div style="color: var(--color-text-secondary); line-height: 1.6;">';
      html += '<div>Income: <span style="color: var(--color-text-primary);">$' + (scenario1.monthlyIncome || 0).toLocaleString() + '/mo</span></div>';
      html += '<div>Priority: <span style="color: var(--color-text-primary);">' + (scenario1.priority || 'Not set') + '</span></div>';
      if (profile1.currentEssentials) html += '<div>Essentials: <span style="color: var(--color-text-primary);">$' + profile1.currentEssentials.toLocaleString() + '/mo</span></div>';
      if (profile1.debtBalance) html += '<div>Debt: <span style="color: var(--color-text-primary);">$' + profile1.debtBalance.toLocaleString() + '</span></div>';
      if (profile1.emergencyFund) html += '<div>Emergency Fund: <span style="color: var(--color-text-primary);">$' + profile1.emergencyFund.toLocaleString() + '</span></div>';
      html += '</div></div>';

      // Scenario 2 profile
      html += '<div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 6px;">';
      html += '<div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">' + scenario2.name + '</div>';
      html += '<div style="color: var(--color-text-secondary); line-height: 1.6;">';
      html += '<div>Income: <span style="color: var(--color-text-primary);">$' + (scenario2.monthlyIncome || 0).toLocaleString() + '/mo</span></div>';
      html += '<div>Priority: <span style="color: var(--color-text-primary);">' + (scenario2.priority || 'Not set') + '</span></div>';
      if (profile2.currentEssentials) html += '<div>Essentials: <span style="color: var(--color-text-primary);">$' + profile2.currentEssentials.toLocaleString() + '/mo</span></div>';
      if (profile2.debtBalance) html += '<div>Debt: <span style="color: var(--color-text-primary);">$' + profile2.debtBalance.toLocaleString() + '</span></div>';
      if (profile2.emergencyFund) html += '<div>Emergency Fund: <span style="color: var(--color-text-primary);">$' + profile2.emergencyFund.toLocaleString() + '</span></div>';
      html += '</div></div>';

      html += '</div>'; // grid

      if (profileDiffers) {
        html += '<div style="margin-top: 12px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 6px; font-size: 0.8rem; color: #fbbf24;">';
        html += '⚠️ These scenarios were saved with different profile settings. The comparison shows allocation differences, but dollar amounts may reflect different underlying circumstances.';
        html += '</div>';
      }

      html += '</div>'; // profile context section

      // Allocation comparison table
      html += '<div style="background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; margin-bottom: 20px;">';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
      html += '<thead><tr style="background: rgba(79, 70, 229, 0.2);">';
      html += '<th style="padding: 12px; text-align: left; color: var(--color-text-primary);">Bucket</th>';
      html += '<th style="padding: 12px; text-align: center; color: var(--color-text-primary);">' + scenario1.name + '</th>';
      html += '<th style="padding: 12px; text-align: center; color: var(--color-text-primary);">' + scenario2.name + '</th>';
      html += '<th style="padding: 12px; text-align: center; color: var(--color-text-primary);">Difference</th>';
      html += '</tr></thead><tbody>';

      ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'].forEach(function(bucket) {
        var d = diffs[bucket];
        var diffColor = d.dollarDiff > 0 ? '#10b981' : (d.dollarDiff < 0 ? '#ef4444' : 'var(--color-text-muted)');
        var diffSign = d.dollarDiff > 0 ? '+' : '';
        var icon = bucket === 'Multiply' ? '💰' : (bucket === 'Essentials' ? '🏠' : (bucket === 'Freedom' ? '🚀' : '🎉'));

        html += '<tr style="border-top: 1px solid rgba(255,255,255,0.1);">';
        html += '<td style="padding: 12px; color: var(--color-text-primary);">' + icon + ' ' + bucket + '</td>';
        html += '<td style="padding: 12px; text-align: center; color: var(--color-text-secondary);">' + d.pct1 + '% <span style="color: #ffc107;">($' + d.dollar1.toLocaleString() + ')</span></td>';
        html += '<td style="padding: 12px; text-align: center; color: var(--color-text-secondary);">' + d.pct2 + '% <span style="color: #ffc107;">($' + d.dollar2.toLocaleString() + ')</span></td>';
        html += '<td style="padding: 12px; text-align: center; color: ' + diffColor + '; font-weight: 600;">' + diffSign + d.pctDiff + '% (' + diffSign + '$' + Math.abs(d.dollarDiff).toLocaleString() + ')</td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';

      // Impact narratives for significant changes
      html += '<div style="margin-bottom: 20px;">';
      html += '<h4 style="color: var(--color-text-primary); margin-bottom: 15px;">💡 What This Difference Means</h4>';

      var hasSignificantChanges = false;
      ['Multiply', 'Freedom', 'Enjoyment', 'Essentials'].forEach(function(bucket) {
        var d = diffs[bucket];
        if (d.isSignificant) {
          hasSignificantChanges = true;
          html += renderBucketImpactHtml(bucket, d, hasDebt, monthlyIncome);
        }
      });

      if (!hasSignificantChanges) {
        html += '<p style="color: var(--color-text-muted);">These scenarios are quite similar - differences are minor.</p>';
      }

      html += '</div>';

      // Bottom line summary
      html += renderBottomLine(scenario1, scenario2, diffs, hasDebt);

      // Action buttons - use data attributes to avoid escaping issues
      var idx1 = document.getElementById('scenario1Select').value;
      var idx2 = document.getElementById('scenario2Select').value;
      html += '<div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">';
      html += '<button type="button" onclick="loadScenario(' + idx1 + ')" class="btn-secondary">Load "' + scenario1.name + '"</button>';
      html += '<button type="button" onclick="loadScenario(' + idx2 + ')" class="btn-secondary">Load "' + scenario2.name + '"</button>';
      html += '<button type="button" onclick="downloadComparisonReport()" class="btn-secondary">📄 Download Comparison</button>';
      html += '</div>';

      resultsContainer.innerHTML = html;

      // Update parent container max-height to accommodate new content
      var body = document.getElementById('scenariosBody');
      if (body && scenariosExpanded) {
        // Use setTimeout to allow DOM to update before measuring
        setTimeout(function() {
          body.style.maxHeight = body.scrollHeight + 200 + 'px';
        }, 50);
      }
    }

    // Render individual bucket impact HTML
    function renderBucketImpactHtml(bucket, diff, hasDebt, monthlyIncome) {
      var direction = diff.dollarDiff > 0 ? 'positive' : 'negative';
      var absDollar = Math.abs(diff.dollarDiff);
      var absPct = Math.abs(diff.pctDiff);
      var yearlyDiff = absDollar * 12;

      var title, impacts, tradeoff;
      var icon = bucket === 'Multiply' ? '💰' : (bucket === 'Essentials' ? '🏠' : (bucket === 'Freedom' ? '🚀' : '🎉'));
      var borderColor = direction === 'positive' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      var bgColor = direction === 'positive' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)';

      if (bucket === 'Multiply') {
        if (direction === 'positive') {
          title = icon + ' Multiply: +$' + absDollar + '/month (+' + absPct + '%)';
          impacts = [
            'Over one year, that is $' + yearlyDiff.toLocaleString() + ' MORE working for you',
            'The difference between building wealth slowly vs building momentum',
            'Starting compound growth earlier vs waiting'
          ];
          tradeoff = 'Trade-off: Less available now for ' + (hasDebt ? 'debt payoff and ' : '') + 'day-to-day needs';
        } else {
          title = icon + ' Multiply: -$' + absDollar + '/month (-' + absPct + '%)';
          impacts = [
            'Over one year, that is $' + yearlyDiff.toLocaleString() + ' LESS invested',
            'Wealth building takes a back seat in this approach',
            'Could delay financial independence by years'
          ];
          tradeoff = 'Benefit: More available for other priorities right now';
        }
      } else if (bucket === 'Freedom') {
        if (direction === 'positive') {
          title = icon + ' Freedom: +$' + absDollar + '/month (+' + absPct + '%)';
          if (hasDebt) {
            impacts = [
              'Extra $' + absDollar + ' toward debt = paying off faster',
              'Could save thousands in interest over time',
              'Debt freedom months or years sooner'
            ];
          } else {
            impacts = [
              'Extra $' + absDollar + ' for emergency fund or big goals',
              'Building financial cushion faster',
              'More flexibility for opportunities'
            ];
          }
          tradeoff = 'Trade-off: Less available for investing and lifestyle now';
        } else {
          title = icon + ' Freedom: -$' + absDollar + '/month (-' + absPct + '%)';
          if (hasDebt) {
            impacts = [
              'Less going toward debt payoff each month',
              'Debt takes longer to clear, more interest paid',
              'Financial freedom delayed'
            ];
          } else {
            impacts = [
              'Smaller safety cushion being built',
              'Less flexibility for emergencies',
              'Slower progress on big goals'
            ];
          }
          tradeoff = 'Benefit: More available for other priorities now';
        }
      } else if (bucket === 'Enjoyment') {
        var lifestyleExample = translateToLifestyleClient(diff.dollar2);
        if (direction === 'positive') {
          title = icon + ' Enjoyment: +$' + absDollar + '/month (+' + absPct + '%)';
          impacts = [
            'That could be: ' + lifestyleExample,
            'Breathing room to avoid burnout',
            'Small joys now can prevent big binges later'
          ];
          tradeoff = hasDebt ? 'Trade-off: Debt payoff takes longer' : 'Trade-off: Less going toward future you';
        } else {
          title = icon + ' Enjoyment: -$' + absDollar + '/month (-' + absPct + '%)';
          impacts = [
            'Tighter lifestyle in exchange for faster progress',
            'Requires discipline and sustainable habits',
            'Risk: Could lead to feeling deprived'
          ];
          tradeoff = 'Benefit: More going toward wealth building or financial freedom';
        }
      } else { // Essentials
        if (direction === 'positive') {
          title = icon + ' Essentials: +$' + absDollar + '/month (+' + absPct + '%)';
          impacts = [
            'More cushion for fixed expenses',
            'Accounts for variable costs',
            'Less stress about staying on budget'
          ];
          tradeoff = 'Trade-off: Less available for other financial goals';
        } else {
          title = icon + ' Essentials: -$' + absDollar + '/month (-' + absPct + '%)';
          impacts = [
            'Tighter budget for necessities',
            'May require cutting expenses',
            'Risk: Could be unrealistic'
          ];
          tradeoff = 'Benefit: More available for wealth building, freedom, or enjoyment';
        }
      }

      var html = '<div style="background: ' + bgColor + '; border: 1px solid ' + borderColor + '; border-radius: 8px; padding: 15px; margin-bottom: 12px;">';
      html += '<div style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px;">' + title + '</div>';
      html += '<ul style="margin: 0 0 10px 20px; padding: 0; color: var(--color-text-secondary);">';
      impacts.forEach(function(impact) {
        html += '<li style="margin-bottom: 4px;">' + impact + '</li>';
      });
      html += '</ul>';
      html += '<div style="font-size: 0.85rem; color: var(--color-text-muted); font-style: italic;">' + tradeoff + '</div>';
      html += '</div>';

      return html;
    }

    // Client-side lifestyle translation
    function translateToLifestyleClient(monthlyAmount) {
      if (monthlyAmount >= 500) return '2-3 nice dinners out per month, or a weekend trip every quarter';
      if (monthlyAmount >= 250) return 'One nice dinner per week, or a monthly hobby budget';
      if (monthlyAmount >= 100) return 'Coffee dates with friends, occasional treats';
      return 'Small pleasures - a book, a coffee, breathing room';
    }

    // Render bottom line summary
    function renderBottomLine(scenario1, scenario2, diffs, hasDebt) {
      var strategy1 = detectStrategyClient(scenario1, hasDebt);
      var strategy2 = detectStrategyClient(scenario2, hasDebt);

      var html = '<div style="background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 8px; padding: 20px; margin-top: 15px;">';
      html += '<h4 style="color: var(--color-text-primary); margin: 0 0 15px 0;">🎯 Bottom Line</h4>';
      html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">';
      html += '<div><strong style="color: var(--color-primary);">' + scenario1.name + '</strong><br><span style="color: var(--color-text-secondary);">' + strategy1.description + '</span></div>';
      html += '<div><strong style="color: var(--color-primary);">' + scenario2.name + '</strong><br><span style="color: var(--color-text-secondary);">' + strategy2.description + '</span></div>';
      html += '</div>';
      html += '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(79, 70, 229, 0.2); text-align: center; color: var(--color-text-muted); font-style: italic;">' + strategy2.reflection + '</div>';
      html += '</div>';

      return html;
    }

    // Client-side strategy detection
    function detectStrategyClient(scenario, hasDebt) {
      var allocs = scenario.allocations;

      if (allocs.Freedom > 35) {
        return {
          name: hasDebt ? 'Debt Payoff Focus' : 'Safety Cushion Focus',
          description: hasDebt ? 'Prioritizes debt payoff and getting financially free' : 'Prioritizes building safety cushion and emergency fund',
          reflection: hasDebt ? 'Do you have the discipline to stay tight for faster debt freedom?' : 'Do you have stable income to justify aggressive saving?'
        };
      }
      if (allocs.Multiply > 30) {
        return {
          name: 'Wealth Building Focus',
          description: 'Aggressive wealth building, requires stability',
          reflection: 'Do you have the safety net to invest aggressively?'
        };
      }
      var values = [allocs.Multiply, allocs.Freedom, allocs.Enjoyment, allocs.Essentials];
      var range = Math.max.apply(null, values) - Math.min.apply(null, values);
      if (range < 15) {
        return {
          name: 'Balanced Approach',
          description: 'Balanced approach, makes progress on all fronts',
          reflection: 'Sometimes good enough on everything beats perfect on one thing'
        };
      }
      if (allocs.Enjoyment > 25) {
        return {
          name: 'Lifestyle Priority',
          description: 'Values quality of life now, slower financial progress',
          reflection: 'Is this sustainable joy or are you avoiding the hard stuff?'
        };
      }
      return {
        name: 'Custom Approach',
        description: 'Your unique allocation based on personal priorities',
        reflection: 'What matters most to you right now?'
      };
    }

    // Load scenario by name (for comparison action buttons)
    function loadScenarioByName(name) {
      for (var i = 0; i < savedScenarios.length; i++) {
        if (savedScenarios[i].name === name) {
          loadScenario(i);
          return;
        }
      }
    }

    // Initialize: Load scenarios on page load
    if (document.getElementById('scenarioListContainer')) {
      refreshScenarioList();
    }

    // ============ END INTERACTIVE CALCULATOR LOGIC ============

    function calculateAllocation() {
      console.log('calculateAllocation() called');
      console.log('selectedPriorityName:', selectedPriorityName);

      if (!selectedPriorityName) {
        alert('Please select a priority first');
        return;
      }
      const timeline = document.getElementById('goalTimeline').value;
      console.log('timeline:', timeline);

      if (!timeline) {
        alert('Please select a timeline');
        return;
      }

      console.log('About to call server with priority:', selectedPriorityName, 'timeline:', timeline);

      // Show loading overlay with specific message
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Calculating Your Personalized Allocation...';
        if (loadingSubtext) loadingSubtext.textContent = 'Analyzing your financial profile and goals';
        loadingOverlay.classList.add('show');
      }

      // Disable button
      const btn = document.getElementById('calculateAllocationBtn');
      btn.disabled = true;
      btn.textContent = 'Calculating...';

      // Call server to calculate allocation with selected priority
      google.script.run
        .withSuccessHandler(function(result) {
          console.log('Server response received:', result);
          // Use document.write() pattern to avoid breaking GAS iframe chain
          // (FormUtils pattern - lines 67-75)
          if (result && result.nextPageHtml) {
            console.log('Writing new page HTML');
            document.open();
            document.write(result.nextPageHtml);
            document.close();
            window.scrollTo(0, 0);
          } else {
            console.error('No nextPageHtml in result:', result);
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            alert('Error: Server did not return page HTML');
            btn.disabled = false;
            btn.textContent = 'Calculate My Allocation';
          }
        })
        .withFailureHandler(function(error) {
          console.error('Server error:', error);
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          alert('Error: ' + error.message);
          btn.disabled = false;
          btn.textContent = 'Calculate My Allocation';
        })
        .savePrioritySelection('${clientId}', selectedPriorityName, timeline);
    }

    // Form submission
    document.getElementById('preSurveyForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // Validate required fields
      const requiredInputs = this.querySelectorAll('[required]');
      let allValid = true;
      requiredInputs.forEach(input => {
        if (!input.value || input.value === '') {
          allValid = false;
          input.style.borderColor = '#ef4444';
        } else {
          input.style.borderColor = '';
        }
      });

      if (!allValid) {
        document.getElementById('errorMessage').textContent = 'Please answer all 10 questions.';
        document.getElementById('errorMessage').classList.add('show');
        return;
      }

      // Collect form data (no priority/timeline - those come from picker)
      var formData = {
        monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value),
        monthlyEssentials: parseFloat(document.getElementById('monthlyEssentials').value),
        satisfaction: parseInt(document.getElementById('satisfaction').value),
        discipline: parseInt(document.getElementById('discipline').value),
        impulse: parseInt(document.getElementById('impulse').value),
        longTerm: parseInt(document.getElementById('longTerm').value),
        lifestyle: parseInt(document.getElementById('lifestyle').value),
        autonomy: parseInt(document.getElementById('autonomy').value),
        totalDebt: parseFloat(document.getElementById('totalDebt').value),
        emergencyFund: parseFloat(document.getElementById('emergencyFund').value)
      };

      // Show loading overlay with specific message
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Building Your Priority Recommendations...';
        if (loadingSubtext) loadingSubtext.textContent = 'Analyzing your financial profile';
        loadingOverlay.classList.add('show');
      }

      // Disable submit button
      var submitBtn = document.getElementById('calculateBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
      }

      // Use document.write() pattern like FormUtils (no navigation needed!)
      google.script.run
        .withSuccessHandler(function(result) {
          if (result && result.success === false) {
            // Hide loading and show error
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.style.opacity = '1';
            }
            alert('Error: ' + (result.error || 'Failed to save'));
            return;
          }

          // Use document.write() pattern (GAS iframe navigation)
          // (FormUtils pattern - lines 67-75)
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
          alert('Error saving pre-survey: ' + error.message);
        })
        .savePreSurvey(clientId, formData);
    });
  </script>
</body>
</html>
  `;
},

  /**
   * Build main calculator page (LEGACY - kept for reference)
   */
  buildCalculatorPage(clientId, baseUrl, toolStatus, allocation, preSurveyData) {
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
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      margin: -30px -30px 25px -30px;
      background: rgba(79, 70, 229, 0.1);
      border-bottom: 2px solid rgba(79, 70, 229, 0.3);
      border-radius: 12px 12px 0 0;
      font-size: 1.25rem;
      font-weight: 600;
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
      overflow: hidden;
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
      <h2 class="section-header">📊 Your Recommended Allocation</h2>
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
   * Week 4: V1 Allocation Engine Port
   * Calculates personalized M/E/F/J allocations using 3-tier modifier system
   *
   * Input Format:
   * {
   *   // Financial (from Tools 1/2/3 or pre-survey)
   *   incomeRange: 'A'|'B'|'C'|'D'|'E',
   *   essentialsRange: 'A'|'B'|'C'|'D'|'E'|'F',
   *   debtLoad: 'A'|'B'|'C'|'D'|'E',
   *   interestLevel: 'High'|'Medium'|'Low',
   *   emergencyFund: 'A'|'B'|'C'|'D'|'E',
   *   incomeStability: 'Unstable / irregular'|'Stable'|'Very stable',
   *
   *   // Behavioral (from pre-survey)
   *   satisfaction: 0-10,
   *   discipline: 0-10,
   *   impulse: 0-10,
   *   longTerm: 0-10,
   *
   *   // Motivational (optional refinements)
   *   lifestyle: 0-10,
   *   growth: 0-10,
   *   stability: 0-10,
   *   goalTimeline: 'Within 6 months'|'6–12 months'|'1–2 years'|'2–5 years'|'5+ years',
   *   dependents: 'Yes'|'No',
   *   autonomy: 0-10,
   *
   *   // Selected Priority
   *   priority: string (one of 10 priorities)
   * }
   *
   * Returns:
   * {
   *   percentages: { Multiply, Essentials, Freedom, Enjoyment },
   *   lightNotes: { Multiply, Essentials, Freedom, Enjoyment },
   *   details: { basePriority, baseWeights, rawScores, modifiers, satBoostPct, detailedSummary }
   * }
   */
  calculateAllocationV1(input) {
    // Configuration
    const CONFIG = {
      satisfaction: { neutralScore: 5, step: 0.1, maxBoost: 0.3 },
      essentialPctMap: { A: 5, B: 15, C: 25, D: 35, E: 45, F: 55 },
      minEssentialsAbsolutePct: 40,
      maxRecommendedEssentialsPct: 35,
      maxPositiveMod: 50,
      maxNegativeMod: 20
    };

    // Base weights map (V1 priorities)
    const baseMap = {
      'Build Long-Term Wealth':        { M:40, E:25, F:20, J:15 },
      'Get Out of Debt':               { M:15, E:25, F:45, J:15 },
      'Feel Financially Secure':       { M:25, E:35, F:30, J:10 },
      'Enjoy Life Now':                { M:20, E:20, F:15, J:45 },
      'Save for a Big Goal':           { M:15, E:25, F:45, J:15 },
      'Stabilize to Survive':          { M:5,  E:45, F:40, J:10 },
      'Build or Stabilize a Business': { M:20, E:30, F:35, J:15 },
      'Create Generational Wealth':    { M:45, E:25, F:20, J:10 },
      'Create Life Balance':           { M:15, E:25, F:25, J:35 },
      'Reclaim Financial Control':     { M:10, E:35, F:40, J:15 }
    };
    const base = baseMap[input.priority] || { M:25, E:25, F:25, J:25 };

    // Initialize modifiers and notes
    const mods = { Multiply:0, Essentials:0, Freedom:0, Enjoyment:0 };
    const notes = {
      Multiply:   { Financial:'', Behavioral:'', Motivational:'' },
      Essentials: { Financial:'', Behavioral:'', Motivational:'' },
      Freedom:    { Financial:'', Behavioral:'', Motivational:'' },
      Enjoyment:  { Financial:'', Behavioral:'', Motivational:'' }
    };

    // --- Financial Modifiers ---
    if (input.incomeRange==='A') {
      mods.Multiply -= 5;
      notes.Multiply.Financial += 'Low income reduces capacity. ';
    }
    if (input.incomeRange==='E') {
      mods.Multiply += 10;
      notes.Multiply.Financial += 'High income boosts capacity. ';
    }
    if (input.debtLoad==='D') {
      mods.Freedom += 10;
      notes.Freedom.Financial += 'Moderate debt load. ';
    }
    if (input.debtLoad==='E') {
      mods.Freedom += 15;
      notes.Freedom.Financial += 'Severe debt load. ';
    }
    if (input.interestLevel==='High') {
      mods.Freedom += 10;
      notes.Freedom.Financial += 'High-interest debt. ';
    }
    if (input.interestLevel==='Low') {
      mods.Freedom -= 5;
      notes.Freedom.Financial += 'Low-interest debt. ';
    }
    if (['A','B'].includes(input.emergencyFund)) {
      mods.Freedom += 10;
      notes.Freedom.Financial += 'No or low emergency fund. ';
    }
    if (['D','E'].includes(input.emergencyFund)) {
      mods.Freedom -= 10;
      notes.Freedom.Financial += 'Sufficient emergency fund. ';
    }
    if (input.incomeStability==='Unstable / irregular') {
      mods.Essentials += 5;
      notes.Essentials.Financial += 'Unstable income needs buffer. ';
      mods.Freedom += 5;
      notes.Freedom.Financial += 'Unstable income needs buffer. ';
    }
    if (input.incomeStability==='Very stable') {
      mods.Multiply += 5;
      notes.Multiply.Financial += 'Very stable income supports investing. ';
    }

    // --- Behavioral Modifiers (with Dissatisfaction Amplification) ---
    // Note: satisfaction scale is 0=extremely stressed to 10=extremely satisfied
    // Amplification happens when DISSATISFIED (low satisfaction scores)
    // So we invert: (neutralScore - satisfaction) gives positive value when dissatisfied
    const rawSatFactor = 1 + Math.max(0, CONFIG.satisfaction.neutralScore - input.satisfaction) * CONFIG.satisfaction.step;
    const satFactor = Math.min(rawSatFactor, 1 + CONFIG.satisfaction.maxBoost);

    // Apply satisfaction amplification to all positive modifiers
    Object.keys(mods).forEach(function(bucket) {
      if (mods[bucket] > 0) mods[bucket] = Math.round(mods[bucket] * satFactor);
    });

    if (input.discipline >= 8) {
      mods.Multiply += 10;
      notes.Multiply.Behavioral += 'High discipline. ';
    }
    if (input.discipline <= 3) {
      mods.Multiply -= 10;
      notes.Multiply.Behavioral += 'Low discipline. ';
    }
    if (input.impulse >= 8) {
      mods.Enjoyment += 5;
      notes.Enjoyment.Behavioral += 'Strong impulse control. ';
    }
    if (input.impulse <= 3) {
      mods.Enjoyment -= 10;
      notes.Enjoyment.Behavioral += 'Low impulse control. ';
    }
    if (input.longTerm >= 8) {
      mods.Multiply += 10;
      notes.Multiply.Behavioral += 'Strong long-term focus. ';
    }
    if (input.longTerm <= 3) {
      mods.Multiply -= 10;
      notes.Multiply.Behavioral += 'Weak long-term focus. ';
    }

    // --- Motivational Modifiers ---
    if (input.lifestyle >= 8) {
      mods.Enjoyment += 10;
      notes.Enjoyment.Motivational += 'High enjoyment priority. ';
    }
    if (input.lifestyle <= 3) {
      mods.Enjoyment -= 5;
      notes.Enjoyment.Motivational += 'Low enjoyment priority. ';
    }
    if (input.growth >= 8) {
      mods.Multiply += 10;
      notes.Multiply.Motivational += 'High growth orientation. ';
    }
    if (input.stability >= 8) {
      mods.Freedom += 10;
      notes.Freedom.Motivational += 'High stability orientation. ';
    }
    if (['Within 6 months','6–12 months'].includes(input.goalTimeline)) {
      mods.Freedom += 10;
      notes.Freedom.Motivational += 'Short-term goal timeline. ';
    }
    if (input.dependents === 'Yes') {
      mods.Essentials += 5;
      notes.Essentials.Motivational += 'Has dependents. ';
    }
    if (input.autonomy >= 8) {
      mods.Multiply += 5;
      notes.Multiply.Motivational += 'High autonomy preference. ';
    }
    if (input.autonomy <= 3) {
      mods.Essentials += 5;
      notes.Essentials.Motivational += 'Low autonomy preference. ';
      mods.Freedom += 5;
      notes.Freedom.Motivational += 'Low autonomy preference. ';
    }

    // --- Modifier Caps ---
    Object.keys(mods).forEach(function(bucket) {
      mods[bucket] = Math.max(-CONFIG.maxNegativeMod, Math.min(mods[bucket], CONFIG.maxPositiveMod));
    });

    // Apply modifiers to base weights
    const raw = {
      Multiply:   base.M + mods.Multiply,
      Essentials: base.E + mods.Essentials,
      Freedom:    base.F + mods.Freedom,
      Enjoyment:  base.J + mods.Enjoyment
    };
    const totalRaw = raw.Multiply + raw.Essentials + raw.Freedom + raw.Enjoyment;
    let percentages = {
      Multiply:   raw.Multiply   / totalRaw * 100,
      Essentials: raw.Essentials / totalRaw * 100,
      Freedom:    raw.Freedom    / totalRaw * 100,
      Enjoyment:  raw.Enjoyment  / totalRaw * 100
    };

    // Capture raw percentages before floor enforcement
    const rawPercentages = {
      Multiply:   Math.round(percentages.Multiply),
      Essentials: Math.round(percentages.Essentials),
      Freedom:    Math.round(percentages.Freedom),
      Enjoyment:  Math.round(percentages.Enjoyment)
    };

    // Calculate user's actual essentials percentage from their income/expenses
    // (This is calculated in buildV1Input at line 3436: monthlyEssentials / monthlyIncome * 100)
    const actualEssentialsPct = CONFIG.essentialPctMap[input.essentialsRange] || 40;

    // Validation: Check if recommended Essentials is lower than actual spending
    const validationWarnings = [];
    if (percentages.Essentials < actualEssentialsPct - 5) { // 5% tolerance
      validationWarnings.push({
        type: 'essentials_too_low',
        recommended: Math.round(percentages.Essentials),
        actual: actualEssentialsPct,
        message: 'Your recommended Essentials (' + Math.round(percentages.Essentials) + '%) is lower than your current spending (' + actualEssentialsPct + '%). You may need to reduce expenses or adjust your allocation.'
      });
      Logger.log('VALIDATION WARNING: Recommended Essentials (' + percentages.Essentials.toFixed(1) + '%) < Actual (' + actualEssentialsPct + '%)');
    }

    // Round final percentages
    Object.keys(percentages).forEach(function(k) {
      percentages[k] = Math.round(percentages[k]);
    });

    // Ensure no negative percentages (can happen with extreme modifiers)
    Object.keys(percentages).forEach(function(k) {
      if (percentages[k] < 0) {
        Logger.log('WARNING: Negative percentage detected for ' + k + ': ' + percentages[k] + '%. Setting to 0.');
        percentages[k] = 0;
      }
    });

    // Ensure percentages sum to exactly 100% after rounding
    const sum = percentages.Multiply + percentages.Essentials + percentages.Freedom + percentages.Enjoyment;
    if (sum !== 100) {
      // Adjust the largest bucket to make sum = 100
      const diff = 100 - sum;
      const largest = Object.keys(percentages).reduce(function(a, b) {
        return percentages[a] > percentages[b] ? a : b;
      });
      percentages[largest] += diff;
      Logger.log('Adjusted ' + largest + ' by ' + diff + '% to make sum = 100%');
    }

    // Build light notes
    const lightNotes = {
      Multiply:   (notes.Multiply.Financial   + notes.Multiply.Behavioral   + notes.Multiply.Motivational).trim() || 'Standard Multiply allocation applied.',
      Essentials: (notes.Essentials.Financial + notes.Essentials.Behavioral + notes.Essentials.Motivational).trim() || 'Standard Essentials allocation applied.',
      Freedom:    (notes.Freedom.Financial    + notes.Freedom.Behavioral    + notes.Freedom.Motivational).trim() || 'Standard Freedom allocation applied.',
      Enjoyment:  (notes.Enjoyment.Financial  + notes.Enjoyment.Behavioral  + notes.Enjoyment.Motivational).trim() || 'Standard Enjoyment allocation applied.'
    };

    // Build detailed summary
    const satBoostPct = Math.round((satFactor - 1) * 100);
    const details = {
      basePriority: input.priority,
      baseWeights: 'Multiply ' + base.M + '%, Essentials ' + base.E + '%, Freedom ' + base.F + '%, Enjoyment ' + base.J + '%',
      rawScores: 'Multiply ' + rawPercentages.Multiply + '%, Essentials ' + rawPercentages.Essentials + '%, Freedom ' + rawPercentages.Freedom + '%, Enjoyment ' + rawPercentages.Enjoyment + '%',
      normalizedScores: 'Multiply ' + percentages.Multiply + '%, Essentials ' + percentages.Essentials + '%, Freedom ' + percentages.Freedom + '%, Enjoyment ' + percentages.Enjoyment + '%',
      modifiers: notes,
      satBoostPct: satBoostPct,
      detailedSummary:
        'Base allocations (priority "' + input.priority + '"): Multiply ' + base.M + '%, Essentials ' + base.E + '%, Freedom ' + base.F + '%, Enjoyment ' + base.J + '%.\n' +
        'After modifiers, raw split: Multiply ' + rawPercentages.Multiply + '%, Essentials ' + rawPercentages.Essentials + '%, Freedom ' + rawPercentages.Freedom + '%, Enjoyment ' + rawPercentages.Enjoyment + '%.\n' +
        (satBoostPct > 0 ? 'Because your satisfaction is only ' + input.satisfaction + '/10, we amplified all positive nudges by ' + satBoostPct + '% to help you change faster.\n' : '') +
        'Final recommended split: Multiply ' + percentages.Multiply + '%, Essentials ' + percentages.Essentials + '%, Freedom ' + percentages.Freedom + '%, Enjoyment ' + percentages.Enjoyment + '%.'
    };

    return {
      percentages,
      lightNotes,
      details,
      validationWarnings: validationWarnings,
      actualEssentialsPct: actualEssentialsPct
    };
  },

  /**
   * Phase 1: Build V1 Input Mapper
   * Maps Tool 1/2/3 data + pre-survey answers → V1 allocation engine input format
   *
   * @param {string} clientId - Client identifier
   * @param {object} preSurveyAnswers - Pre-survey responses
   * @returns {object} V1 engine input format
   */
  buildV1Input(clientId, preSurveyAnswers) {
    try {
      // Get Tool 1/2/3 data via DataService
      const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
      const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

      // Extract Tool 2 form data (with safe defaults)
      const tool2Form = tool2Data?.formData || {};

      // Calculate income and essentials ranges from dollar amounts
      const monthlyIncome = preSurveyAnswers.monthlyIncome || 3500;
      const monthlyEssentials = preSurveyAnswers.monthlyEssentials || 2000;
      const incomeRange = this.mapIncomeToTier(monthlyIncome);
      const essentialsPct = (monthlyEssentials / monthlyIncome) * 100;
      const essentialsRange = this.mapEssentialsPctToTier(essentialsPct);

      // Calculate debt and emergency fund tiers from pre-survey dollar inputs
      const totalDebt = preSurveyAnswers.totalDebt || 0;
      const emergencyFund = preSurveyAnswers.emergencyFund || 0;
      const debtLoad = this.mapDebtToTier(totalDebt, monthlyIncome);
      const emergencyFundTier = this.mapEmergencyFundToTier(emergencyFund, monthlyEssentials);

      // Map to V1 input structure
      return {
        // Calculated from dollar inputs
        incomeRange: incomeRange,
        essentialsRange: essentialsRange,

        // From pre-survey (behavioral questions)
        satisfaction: preSurveyAnswers.satisfaction || 5,
        discipline: preSurveyAnswers.discipline || 5,
        impulse: preSurveyAnswers.impulse || 5,
        longTerm: preSurveyAnswers.longTerm || 5,
        lifestyle: preSurveyAnswers.lifestyle || 5,
        autonomy: preSurveyAnswers.autonomy || 5,

        // From pre-survey (goal/priority)
        goalTimeline: preSurveyAnswers.goalTimeline || '1–2 years',
        priority: preSurveyAnswers.selectedPriority || 'Feel Financially Secure',

        // From pre-survey (financial reality)
        debtLoad: debtLoad,
        emergencyFund: emergencyFundTier,
        interestLevel: this.deriveInterestLevelFromDebt(debtLoad),

        // Derived from Tool 2 data (with fallbacks)
        growth: this.deriveGrowthFromTool2(tool2Form),
        stability: this.deriveStabilityFromTool2(tool2Form),
        stageOfLife: this.deriveStageOfLife(tool2Form),
        incomeStability: this.mapIncomeStability(tool2Form.incomeConsistency),
        dependents: (tool2Form.dependents && tool2Form.dependents > 0) ? 'Yes' : 'No'
      };
    } catch (error) {
      Logger.log('Error in buildV1Input: ' + error);
      // Return safe defaults on error
      return {
        incomeRange: 'C',
        essentialsRange: 'C',
        satisfaction: 5,
        discipline: 5,
        impulse: 5,
        longTerm: 5,
        lifestyle: 5,
        growth: 5,
        stability: 5,
        goalTimeline: '1–2 years',
        dependents: 'No',
        autonomy: 5,
        emergencyFund: 'C',
        incomeStability: 'Stable',
        debtLoad: 'C',
        interestLevel: 'Medium',
        stageOfLife: 'Mid-Career',
        priority: preSurveyAnswers?.selectedPriority || 'Feel Financially Secure'
      };
    }
  },

  /**
   * Helper: Map monthly income (dollars) to A-E tier
   */
  mapIncomeToTier(monthlyIncome) {
    if (monthlyIncome < 2500) return 'A';       // < $2,500/mo
    if (monthlyIncome < 5000) return 'B';       // $2,500-$5,000/mo
    if (monthlyIncome < 10000) return 'C';      // $5,000-$10,000/mo
    if (monthlyIncome < 20000) return 'D';      // $10,000-$20,000/mo
    return 'E';                                  // > $20,000/mo
  },

  /**
   * Helper: Map essentials percentage to A-F tier
   */
  mapEssentialsPctToTier(pct) {
    if (pct < 10) return 'A';      // < 10%
    if (pct < 20) return 'B';      // 10-20%
    if (pct < 30) return 'C';      // 20-30%
    if (pct < 40) return 'D';      // 30-40%
    if (pct < 50) return 'E';      // 40-50%
    return 'F';                     // > 50%
  },

  /**
   * Helper: Map total debt to A-E tier based on debt-to-income ratio
   * A = No/minimal debt (<10% of annual income)
   * B = Low debt (10-30% of annual income)
   * C = Moderate debt (30-100% of annual income)
   * D = High debt (100-200% of annual income)
   * E = Severe debt (>200% of annual income)
   */
  mapDebtToTier(totalDebt, monthlyIncome) {
    const annualIncome = monthlyIncome * 12;
    const debtToIncomeRatio = totalDebt / annualIncome;

    if (debtToIncomeRatio < 0.10) return 'A';   // Less than 10% of annual income
    if (debtToIncomeRatio < 0.30) return 'B';   // 10-30% of annual income
    if (debtToIncomeRatio < 1.00) return 'C';   // 30-100% of annual income
    if (debtToIncomeRatio < 2.00) return 'D';   // 100-200% of annual income
    return 'E';                                  // More than 200% of annual income
  },

  /**
   * Helper: Map emergency fund dollars to A-E tier based on months of coverage
   * A = 0-0.5 months
   * B = 0.5-1 month
   * C = 1-3 months
   * D = 3-6 months
   * E = 6+ months
   */
  mapEmergencyFundToTier(emergencyFund, monthlyEssentials) {
    if (monthlyEssentials === 0) return 'A';  // Can't calculate, assume minimal

    const monthsOfCoverage = emergencyFund / monthlyEssentials;

    if (monthsOfCoverage < 0.5) return 'A';   // Less than 2 weeks
    if (monthsOfCoverage < 1.0) return 'B';   // 2 weeks to 1 month
    if (monthsOfCoverage < 3.0) return 'C';   // 1-3 months
    if (monthsOfCoverage < 6.0) return 'D';   // 3-6 months
    return 'E';                                // 6+ months (excellent)
  },

  /**
   * Helper: Derive interest level from debt tier
   * Maps debt load to High/Medium/Low interest urgency
   */
  deriveInterestLevelFromDebt(debtTier) {
    if (debtTier === 'E' || debtTier === 'D') return 'High';
    if (debtTier === 'C') return 'Medium';
    return 'Low';
  },

  /**
   * Helper: Derive growth orientation from Tool 2 data
   * Maps investment activity, savings regularity, retirement funding → 0-10 scale
   */
  deriveGrowthFromTool2(formData) {
    if (!formData) return 5;

    const investmentActivity = formData.investmentActivity || 0;
    const savingsRegularity = formData.savingsRegularity || 0;
    const retirementFunding = formData.retirementFunding || 0;

    // Average the three fields (Tool 2 uses -5 to +5 scale)
    // Convert to 0-10 scale
    const avg = (investmentActivity + savingsRegularity + retirementFunding) / 3;
    const normalized = Math.round(((avg + 5) / 10) * 10); // -5 to +5 → 0 to 10

    return Math.max(0, Math.min(10, normalized));
  },

  /**
   * Helper: Derive stability orientation from Tool 2 data
   * Maps emergency fund maintenance, insurance confidence, debt trending → 0-10 scale
   */
  deriveStabilityFromTool2(formData) {
    if (!formData) return 5;

    const emergencyFundMaintenance = formData.emergencyFundMaintenance || 0;
    const insuranceConfidence = formData.insuranceConfidence || 0;
    const debtTrending = formData.debtTrending || 0;

    // Average the three fields
    const avg = (emergencyFundMaintenance + insuranceConfidence + debtTrending) / 3;
    const normalized = Math.round(((avg + 5) / 10) * 10);

    return Math.max(0, Math.min(10, normalized));
  },

  /**
   * Helper: Derive life stage from age and employment
   */
  deriveStageOfLife(formData) {
    if (!formData) return 'Mid-Career';

    const age = formData.age || 35;
    const employment = formData.employment || '';

    if (employment.toLowerCase().includes('retired')) return 'Retirement';
    if (age < 25) return 'Early Career';
    if (age < 40) return 'Mid-Career';
    if (age < 55) return 'Late Career';
    if (age < 65) return 'Pre-Retirement';
    return 'Retirement';
  },

  /**
   * Helper: Map emergency fund months to V1 tier (A-E)
   * Tool 2 uses -5 to +5 scale, need to map to A-E tiers
   */
  mapEmergencyFundMonths(months) {
    if (months === undefined || months === null) return 'C';

    // Tool 2 scale: -5 (worst) to +5 (best)
    // Map to V1 tiers: A (0-1 month), B (1-2), C (2-3), D (3-6), E (6+)
    if (months <= -3) return 'A';  // 0-1 months
    if (months <= -1) return 'B';  // 1-2 months
    if (months <= 1) return 'C';   // 2-3 months
    if (months <= 3) return 'D';   // 3-6 months
    return 'E';                     // 6+ months
  },

  /**
   * Helper: Map income stability to categorical
   */
  mapIncomeStability(consistency) {
    if (consistency === undefined || consistency === null) return 'Stable';

    // Tool 2 scale: -5 (very inconsistent) to +5 (very consistent)
    if (consistency <= -2) return 'Unstable / irregular';
    if (consistency >= 3) return 'Very stable';
    return 'Stable';
  },

  /**
   * Helper: Derive debt load from text analysis + stress level
   * Returns A (no debt) to E (severe debt)
   */
  deriveDebtLoad(debtsText, stressLevel) {
    if (!debtsText || debtsText.trim() === '') {
      return 'A'; // No debt
    }

    // Text analysis: Count debt types
    const lowerText = debtsText.toLowerCase();
    const hasMultiple = (lowerText.match(/,|;|\band\b/g) || []).length > 0;

    // High-risk debt keywords
    const hasHighInterest = /credit card|payday|personal loan/i.test(debtsText);
    const hasMortgage = /mortgage|home/i.test(debtsText);
    const hasStudent = /student/i.test(debtsText);

    // Stress level factor (Tool 2: -5 to +5, where negative = more stress)
    const stress = stressLevel || 0;
    const highStress = stress <= -3;
    const moderateStress = stress <= -1;

    // Categorize
    if (highStress && (hasHighInterest || hasMultiple)) return 'E'; // Severe
    if (moderateStress || (hasHighInterest && hasMultiple)) return 'D'; // High
    if (hasMultiple || hasMortgage) return 'C'; // Moderate
    if (hasStudent || hasHighInterest) return 'B'; // Low
    return 'A'; // No significant debt
  },

  /**
   * Helper: Derive interest level from debt stress
   */
  deriveInterestLevel(stressLevel) {
    if (stressLevel === undefined || stressLevel === null) return 'Medium';

    // Tool 2 scale: -5 (high stress) to +5 (no stress)
    // High stress = high interest debt likely
    if (stressLevel <= -3) return 'High';
    if (stressLevel <= 0) return 'Medium';
    return 'Low';
  },

  // ============================================================================
  // PRIORITY RECOMMENDATION FUNCTIONS
  // Calculate which priorities are recommended/cautioned based on user data
  // ============================================================================

  /**
   * Map monthly income to tier (A-E)
   */
  mapIncomeToRange(monthlyIncome) {
    if (monthlyIncome < 2500) return 'A';
    if (monthlyIncome < 5000) return 'B';
    if (monthlyIncome < 10000) return 'C';
    if (monthlyIncome < 20000) return 'D';
    return 'E';
  },

  /**
   * Map monthly essentials to tier (A-F based on percentage of income)
   */
  mapEssentialsToRange(monthlyEssentials, monthlyIncome) {
    const pct = (monthlyEssentials / monthlyIncome) * 100;
    if (pct < 10) return 'A';
    if (pct < 20) return 'B';
    if (pct < 30) return 'C';
    if (pct < 40) return 'D';
    if (pct < 50) return 'E';
    return 'F';
  },

  /**
   * Score: Build Long-Term Wealth
   */
  scoreWealthPriority(data) {
    let score = 0;
    const { discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle, essentialsPct, surplus } = data;

    // Recommended factors
    if (discipline >= 7) score += 30;
    if (longTerm >= 7) score += 30;
    if (['A','B'].includes(debtLoad)) score += 20;
    if (incomeStability === 'Very stable' || incomeStability === 'Stable') score += 15;
    if (growth >= 7) score += 20;
    if (['D','E'].includes(emergencyFund)) score += 15;
    if (autonomy >= 7) score += 10;

    // Cash flow health (critical for wealth building)
    if (essentialsPct < 50) score += 25;  // Large surplus = excellent position
    if (surplus >= 2000) score += 20;     // $2k+/mo surplus = wealth building ready

    // Cautioned factors
    if (discipline <= 3) score -= 40;
    if (longTerm <= 3) score -= 30;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 25;
    if (lifestyle >= 7) score -= 20;

    // Cash flow challenges (major barriers to wealth building)
    if (essentialsPct > 80) score -= 40;  // Tight budget = hard to invest
    if (essentialsPct > 90) score -= 60;  // Paycheck to paycheck = not viable
    if (surplus < 500) score -= 30;       // Less than $500/mo = challenging

    return score;
  },

  /**
   * Score: Get Out of Debt
   */
  scoreDebtPriority(data) {
    let score = 0;
    const { debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle, essentialsPct, surplus } = data;

    // Recommended factors
    if (['D','E'].includes(debtLoad)) score += 50;
    if (interestLevel === 'High') score += 30;
    if (satisfaction <= 3) score += 20;
    if (stability >= 7) score += 20;
    if (['A','B'].includes(emergencyFund)) score += 15;

    // Cash flow impact on debt payoff ability
    if (essentialsPct < 70 && surplus >= 800) score += 25;  // Room to attack debt
    if (essentialsPct > 85) score -= 20;  // Tight budget = harder to pay extra

    // Cautioned factors
    if (['A','B'].includes(debtLoad)) score -= 60;
    if (['D','E'].includes(emergencyFund)) score -= 20;
    if (lifestyle >= 7) score -= 25;

    return score;
  },

  /**
   * Score: Feel Financially Secure
   */
  scoreSecurityPriority(data) {
    let score = 0;
    const { incomeStability, emergencyFund, dependents, satisfaction, stability, impulse, discipline, growth, essentialsPct, surplus } = data;

    // Recommended factors
    if (incomeStability === 'Unstable / irregular') score += 40;
    if (['A','B'].includes(emergencyFund)) score += 40;
    if (dependents === 'Yes') score += 25;
    if (satisfaction <= 3 && stability >= 7) score += 20; // High emotional safety need
    if (impulse <= 3) score += 15;
    if (discipline <= 3) score += 15;

    // Cash flow and security relationship
    if (essentialsPct > 75 && essentialsPct < 90) score += 30;  // Tight but not crisis = security focus
    if (surplus < 800 && surplus >= 200) score += 20;           // Modest surplus = build buffer

    // Cautioned factors
    if (incomeStability === 'Very stable') score -= 25;
    if (['D','E'].includes(emergencyFund)) score -= 30;
    if (dependents === 'No') score -= 10;
    if (growth >= 7) score -= 20;

    // Already very secure cash flow
    if (essentialsPct < 50 && surplus >= 2000) score -= 35;  // Already secure, aim higher

    return score;
  },

  /**
   * Score: Enjoy Life Now
   */
  scoreEnjoymentPriority(data) {
    let score = 0;
    const { satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, impulse, incomeRange, dependents, essentialsPct, surplus } = data;

    // Recommended factors
    if (satisfaction <= 3) score += 30;
    if (lifestyle >= 7) score += 40;
    if (incomeStability === 'Stable' || incomeStability === 'Very stable') score += 25;
    if (['A','B'].includes(debtLoad)) score += 30;
    if (['D','E'].includes(emergencyFund)) score += 20;
    if (impulse >= 7) score += 15;

    // Cash flow enables enjoyment
    if (surplus >= 1000 && essentialsPct < 70) score += 30;  // Ample room for enjoyment

    // Cautioned factors
    if (['D','E'].includes(debtLoad)) score -= 50;
    if (incomeStability === 'Unstable / irregular') score -= 40;
    if (['A','B'].includes(emergencyFund)) score -= 35;
    if (dependents === 'Yes') score -= 25; // Simplified - would check count if available
    if (impulse <= 3) score -= 30;
    if (incomeRange === 'A') score -= 20;

    // Cash flow limits enjoyment
    if (essentialsPct > 85) score -= 45;  // Tight budget = can't enjoy much
    if (surplus < 300) score -= 40;       // Little room for extras

    return score;
  },

  /**
   * Score: Save for a Big Goal
   */
  scoreBigGoalPriority(data) {
    let score = 0;
    const { debtLoad, emergencyFund, discipline, incomeStability, essentialsPct, surplus } = data;

    // Recommended factors
    if (['C'].includes(debtLoad)) score += 10; // Moderate debt ok
    if (['D','E'].includes(emergencyFund)) score += 20;
    if (discipline >= 7) score += 25;
    if (incomeStability === 'Stable' || incomeStability === 'Very stable') score += 20;

    // Cash flow enables goal saving
    if (surplus >= 600 && essentialsPct < 75) score += 25;  // Room to save for goal

    // Cautioned factors
    if (debtLoad === 'E') score -= 35;
    if (incomeStability === 'Unstable / irregular') score -= 25;
    if (['A','B'].includes(emergencyFund)) score -= 30;
    if (discipline <= 3) score -= 25;

    // Cash flow limits goal saving
    if (essentialsPct > 85) score -= 30;  // Tight budget = hard to save
    if (surplus < 400) score -= 25;       // Need surplus to save for goals

    return score;
  },

  /**
   * Score: Stabilize to Survive
   */
  scoreSurvivalPriority(data) {
    let score = 0;
    const { debtLoad, incomeStability, emergencyFund, dependents, satisfaction, incomeRange, essentialsPct, surplus } = data;

    // Recommended factors
    if (debtLoad === 'E') score += 40;
    if (incomeStability === 'Unstable / irregular') score += 50;
    if (emergencyFund === 'A') score += 50;
    if (dependents === 'Yes') score += 30;
    if (satisfaction <= 3) score += 25;
    if (incomeRange === 'A') score += 30;

    // Cash flow crisis indicators (CRITICAL)
    if (essentialsPct > 100) score += 70;  // Spending more than earning = CRISIS
    if (essentialsPct > 95) score += 60;   // Less than 5% breathing room = urgent
    if (essentialsPct > 90) score += 50;   // Paycheck to paycheck = survival mode
    if (surplus < 200) score += 40;        // Less than $200/mo = very tight
    if (surplus < 0) score += 80;          // Negative cash flow = immediate crisis

    // Cautioned factors
    if (['A','B'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Very stable') score -= 40;
    if (['D','E'].includes(emergencyFund)) score -= 40;
    if (dependents === 'No') score -= 20;
    if (incomeRange === 'E') score -= 25;

    // Cash flow health (reduces survival need)
    if (essentialsPct < 60) score -= 40;   // Healthy surplus = not survival mode
    if (surplus >= 1500) score -= 50;      // $1.5k+ surplus = beyond survival

    return score;
  },

  /**
   * Score: Build or Stabilize a Business
   */
  scoreBusinessPriority(data) {
    let score = 0;
    const { autonomy, growth, emergencyFund, incomeStability, discipline, debtLoad, dependents, essentialsPct, surplus } = data;

    // Recommended factors
    if (autonomy >= 7) score += 30;
    if (growth >= 7) score += 25;
    if (emergencyFund === 'C') score += 20; // Moderate reserves
    if (incomeStability === 'Stable') score += 15;
    if (discipline >= 7) score += 20;

    // Cash flow for business investment
    if (surplus >= 1200 && essentialsPct < 70) score += 25;  // Capital available for business

    // Cautioned factors
    if (debtLoad === 'E') score -= 35;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 40;
    if (autonomy <= 3) score -= 25;
    if (discipline <= 3) score -= 30;
    if (dependents === 'Yes') score -= 20; // Simplified

    // Cash flow too tight for business risk
    if (essentialsPct > 90) score -= 45;  // Need buffer for business volatility
    if (surplus < 500) score -= 35;       // Need capital cushion

    return score;
  },

  /**
   * Score: Create Generational Wealth
   */
  scoreGenerationalPriority(data) {
    let score = 0;
    const { incomeRange, growth, discipline, emergencyFund, debtLoad, longTerm, dependents, essentialsPct, surplus } = data;

    // Recommended factors
    if (incomeRange === 'E') score += 30;
    if (growth >= 7) score += 35;
    if (discipline >= 7) score += 30;
    if (['D','E'].includes(emergencyFund)) score += 25;
    if (['A','B'].includes(debtLoad)) score += 25;
    if (longTerm >= 7) score += 30;
    if (dependents === 'Yes') score += 20;

    // Cash flow enables long-term wealth building
    if (surplus >= 2500 && essentialsPct < 50) score += 35;  // Significant capital for generational wealth

    // Cautioned factors
    if (['A','B'].includes(incomeRange)) score -= 40;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (discipline <= 3) score -= 40;
    if (['A','B'].includes(emergencyFund)) score -= 30;
    if (longTerm <= 3) score -= 35;

    // Cash flow insufficient for generational wealth
    if (essentialsPct > 75) score -= 45;  // Need large surplus for generational goals
    if (surplus < 1000) score -= 40;      // Generational wealth needs significant capital

    return score;
  },

  /**
   * Score: Create Life Balance
   */
  scoreBalancePriority(data) {
    let score = 0;
    const { satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, essentialsPct, surplus } = data;

    // Recommended factors (moderate everything)
    if (satisfaction >= 4 && satisfaction <= 6) score += 20;
    if (lifestyle >= 4 && lifestyle <= 6) score += 15;
    if (incomeStability === 'Stable') score += 20;
    if (['B','C'].includes(debtLoad)) score += 10;
    if (emergencyFund === 'C') score += 15;

    // Moderate cash flow enables balance
    if (essentialsPct >= 60 && essentialsPct <= 75) score += 20;  // Balanced spending
    if (surplus >= 500 && surplus <= 1500) score += 15;           // Moderate surplus

    // Cautioned factors (extremes)
    if (debtLoad === 'A' || debtLoad === 'E') score -= 25;
    if (satisfaction <= 2) score -= 20;
    if (incomeStability === 'Unstable / irregular') score -= 20;
    if (emergencyFund === 'A') score -= 25;

    // Cash flow extremes reduce balance
    if (essentialsPct > 90 || essentialsPct < 40) score -= 20;  // Either too tight or too loose
    if (surplus < 300) score -= 25;                              // Too tight for balance

    return score;
  },

  /**
   * Score: Reclaim Financial Control
   */
  scoreControlPriority(data) {
    let score = 0;
    const { satisfaction, debtLoad, discipline, emergencyFund, incomeStability, impulse, essentialsPct, surplus } = data;

    // Recommended factors
    if (satisfaction <= 3) score += 40;
    if (['D','E'].includes(debtLoad)) score += 30;
    if (discipline <= 3) score += 30;
    if (['A','B'].includes(emergencyFund)) score += 25;
    if (incomeStability === 'Unstable / irregular') score += 25;
    if (impulse <= 3) score += 20;

    // Cash flow out of control indicates need
    if (essentialsPct > 90) score += 35;  // Paycheck to paycheck = need control
    if (surplus < 300) score += 30;       // Very tight = need control
    if (surplus < 0) score += 50;         // Deficit = urgent control needed

    // Cautioned factors
    if (satisfaction >= 7) score -= 30;
    if (debtLoad === 'A') score -= 25;
    if (discipline >= 7) score -= 25;
    if (['D','E'].includes(emergencyFund)) score -= 20;
    if (incomeStability === 'Very stable') score -= 20;

    // Already have control
    if (essentialsPct < 60 && surplus >= 1000) score -= 30;  // Healthy cash flow = already in control

    return score;
  },

  /**
   * Get one-line reason for priority recommendation
   */
  getPriorityReason(priorityName, indicator) {
    const reasons = {
      'Build Long-Term Wealth': {
        recommended: 'Your discipline and long-term focus make this achievable',
        challenging: 'Consider addressing debt/stability first before aggressive wealth building',
        available: 'A solid long-term goal if you have the discipline and stability'
      },
      'Get Out of Debt': {
        recommended: 'Your debt level suggests this should be your primary focus',
        challenging: 'This priority is for those with significant debt to eliminate',
        available: 'Consider this if debt is creating financial stress'
      },
      'Feel Financially Secure': {
        recommended: 'Building security first will give you a stable foundation',
        challenging: 'You may be ready for more growth-focused priorities',
        available: 'A good foundation for long-term financial health'
      },
      'Enjoy Life Now': {
        recommended: 'Your stable situation allows room for present enjoyment',
        challenging: 'Consider addressing financial stability before increasing enjoyment spending',
        available: 'Balance present enjoyment with future security'
      },
      'Save for a Big Goal': {
        recommended: 'Your discipline and timeline align well with targeted saving',
        challenging: 'Build emergency fund and stabilize income before big goal saving',
        available: 'Good for specific short-term financial targets'
      },
      'Stabilize to Survive': {
        recommended: 'Your situation calls for crisis-mode focus on stability',
        challenging: 'This is for urgent financial crisis situations',
        available: 'For those needing immediate financial stabilization'
      },
      'Build or Stabilize a Business': {
        recommended: 'Your autonomy and discipline support entrepreneurial goals',
        challenging: 'Stabilize personal finances before business investments',
        available: 'Consider if you have reserves and entrepreneurial drive'
      },
      'Create Generational Wealth': {
        recommended: 'Your long-term vision and resources support legacy building',
        challenging: 'This requires financial stability and long-term commitment',
        available: 'A multi-generational wealth building strategy'
      },
      'Create Life Balance': {
        recommended: 'Balanced priorities fit your moderate risk profile',
        challenging: 'Consider more focused priorities given your current situation',
        available: 'A balanced approach across all four buckets'
      },
      'Reclaim Financial Control': {
        recommended: 'Time to reset and rebuild your financial foundation',
        challenging: 'This is for those needing a fresh start after struggle',
        available: 'For those ready to take back control of their finances'
      }
    };

    return reasons[priorityName]?.[indicator] || 'A valid financial priority';
  },

  /**
   * Get personalized reason based on user's actual data
   */
  getPersonalizedReason(priorityName, indicator, data) {
    const { discipline, longTerm, debtLoad, satisfaction, incomeStability, emergencyFund, lifestyle, autonomy, essentialsPct, surplus } = data;

    // Translate tiers to plain English
    const debtText = {
      'A': 'minimal debt', 'B': 'low debt', 'C': 'moderate debt',
      'D': 'significant debt', 'E': 'high debt'
    };
    const savingsText = {
      'A': 'little emergency savings', 'B': 'limited emergency savings',
      'C': 'some emergency savings', 'D': 'a good emergency fund', 'E': 'a strong emergency fund'
    };

    // Format surplus for readability
    const surplusFormatted = surplus < 0 ? `$${Math.abs(surplus)} deficit` : `$${Math.round(surplus)} surplus`;
    const essentialsText = Math.round(essentialsPct);

    // Build personalized reasons based on actual data
    const reasons = {
      'Build Long-Term Wealth': {
        recommended: surplus >= 2000 ? `Your ${surplusFormatted}/month gives you excellent wealth-building capacity` :
                     discipline >= 7 && surplus >= 1000 ? `Your high discipline (${discipline}/10) and ${surplusFormatted}/month support wealth building` :
                     incomeStability === 'Very stable' ? `Your stable income and ${savingsText[emergencyFund]} support this goal` :
                     `Your financial discipline and planning ability make this achievable`,
        challenging: essentialsPct > 90 ? `With essentials at ${essentialsText}% of income, focus on cash flow first` :
                     surplus < 500 ? `Your ${surplusFormatted}/month makes aggressive investing challenging - build buffer first` :
                     debtLoad >= 'D' ? `Your ${debtText[debtLoad]} suggests focusing on debt elimination first` :
                     emergencyFund <= 'B' ? `Build your emergency fund (currently ${savingsText[emergencyFund]}) before aggressive investing` :
                     `Consider building more financial stability before aggressive wealth building`,
        available: `A solid long-term goal with discipline ${discipline}/10 and ${debtText[debtLoad]}`
      },
      'Get Out of Debt': {
        recommended: debtLoad >= 'D' ? `Your ${debtText[debtLoad]} makes this your top priority` :
                     satisfaction <= 3 ? `Your low satisfaction (${satisfaction}/10) and debt stress suggest this focus` :
                     `Your debt situation calls for focused elimination`,
        challenging: debtLoad <= 'B' ? `Your ${debtText[debtLoad]} means this isn't your primary concern` :
                     `Your minimal debt doesn't require this priority`,
        available: `Consider if your ${debtText[debtLoad]} is creating stress`
      },
      'Feel Financially Secure': {
        recommended: essentialsPct > 75 && essentialsPct < 90 ? `With essentials at ${essentialsText}% of income, building a buffer will provide security` :
                     surplus < 800 && surplus >= 200 ? `Your ${surplusFormatted}/month suggests building security reserves` :
                     emergencyFund <= 'B' ? `You have ${savingsText[emergencyFund]} - building this up will provide security` :
                     incomeStability === 'Unstable / irregular' ? `Your unstable income requires a strong safety net` :
                     `Building security will provide the foundation you need`,
        challenging: essentialsPct < 50 && surplus >= 2000 ? `With ${surplusFormatted}/month, you're beyond security - aim for growth` :
                     emergencyFund >= 'D' && incomeStability === 'Very stable' ? `You have ${savingsText[emergencyFund]} and stable income - you're ready for growth` :
                     `You may be ready for more growth-focused priorities`,
        available: `A good foundation goal with ${savingsText[emergencyFund]}`
      },
      'Enjoy Life Now': {
        recommended: debtLoad <= 'B' && emergencyFund >= 'D' ? `Your ${debtText[debtLoad]} and ${savingsText[emergencyFund]} allow for enjoyment` :
                     incomeStability === 'Very stable' && satisfaction <= 5 ? `Your stable income allows room to improve satisfaction (${satisfaction}/10)` :
                     `Your stable situation supports present enjoyment`,
        challenging: debtLoad >= 'D' ? `Your ${debtText[debtLoad]} requires focus before increasing lifestyle spending` :
                     emergencyFund <= 'B' ? `Build emergency savings (${savingsText[emergencyFund]}) before increasing enjoyment spending` :
                     `Address financial stability before increasing enjoyment spending`,
        available: `Balance enjoyment with ${debtText[debtLoad]} and ${savingsText[emergencyFund]}`
      },
      'Save for a Big Goal': {
        recommended: discipline >= 7 && emergencyFund >= 'C' ? `Your discipline (${discipline}/10) and ${savingsText[emergencyFund]} support targeted saving` :
                     `Your financial discipline supports focused goal saving`,
        challenging: emergencyFund <= 'B' ? `Build emergency fund (${savingsText[emergencyFund]}) before big goal saving` :
                     `Stabilize finances before big goal saving`,
        available: `Viable with discipline ${discipline}/10 and ${savingsText[emergencyFund]}`
      },
      'Stabilize to Survive': {
        recommended: surplus < 0 ? `With a ${surplusFormatted}/month, you need immediate cash flow stabilization` :
                     essentialsPct > 95 ? `With essentials at ${essentialsText}% of income, you're in crisis mode` :
                     essentialsPct > 90 && debtLoad === 'E' ? `Paycheck-to-paycheck with ${debtText[debtLoad]} requires immediate stabilization` :
                     debtLoad === 'E' && emergencyFund === 'A' ? `Your ${debtText[debtLoad]} and ${savingsText[emergencyFund]} require crisis-mode focus` :
                     incomeStability === 'Unstable / irregular' && emergencyFund <= 'B' ? `Your unstable income and ${savingsText[emergencyFund]} require immediate stabilization` :
                     `Your situation requires immediate stabilization focus`,
        challenging: essentialsPct < 60 && surplus >= 1500 ? `With ${surplusFormatted}/month, you're beyond survival mode` :
                     debtLoad <= 'B' && emergencyFund >= 'D' ? `Your ${debtText[debtLoad]} and ${savingsText[emergencyFund]} don't require crisis mode` :
                     `This is for urgent crisis situations`,
        available: `For immediate stabilization with ${debtText[debtLoad]} and ${savingsText[emergencyFund]}`
      },
      'Build or Stabilize a Business': {
        recommended: autonomy >= 7 && emergencyFund >= 'C' ? `Your autonomy drive (${autonomy}/10) and ${savingsText[emergencyFund]} support entrepreneurship` :
                     `Your entrepreneurial drive and reserves support business goals`,
        challenging: emergencyFund <= 'B' || debtLoad >= 'D' ? `Build personal stability (${savingsText[emergencyFund]}, ${debtText[debtLoad]}) before business investment` :
                     `Stabilize personal finances before business investments`,
        available: `Consider with autonomy ${autonomy}/10 and ${savingsText[emergencyFund]}`
      },
      'Create Generational Wealth': {
        recommended: longTerm >= 8 && debtLoad <= 'B' && emergencyFund >= 'D' ? `Your long-term vision (${longTerm}/10), ${debtText[debtLoad]}, and ${savingsText[emergencyFund]} support legacy building` :
                     `Your long-term focus and stability support generational wealth`,
        challenging: debtLoad >= 'D' || emergencyFund <= 'B' ? `Build current stability (${debtText[debtLoad]}, ${savingsText[emergencyFund]}) before multi-generational planning` :
                     `This requires significant financial stability first`,
        available: `A long-term strategy with ${debtText[debtLoad]} and ${savingsText[emergencyFund]}`
      },
      'Create Life Balance': {
        recommended: satisfaction >= 4 && satisfaction <= 6 && debtLoad === 'C' ? `Your moderate satisfaction (${satisfaction}/10) and ${debtText[debtLoad]} fit a balanced approach` :
                     `Balanced priorities match your moderate financial profile`,
        challenging: debtLoad === 'A' || debtLoad === 'E' || satisfaction <= 2 ? `Your situation (${debtText[debtLoad]}, satisfaction ${satisfaction}/10) needs focused priorities` :
                     `Consider more focused priorities for your situation`,
        available: `A balanced approach with ${debtText[debtLoad]} and satisfaction ${satisfaction}/10`
      },
      'Reclaim Financial Control': {
        recommended: satisfaction <= 3 && (debtLoad >= 'D' || discipline <= 3) ? `Your low satisfaction (${satisfaction}/10) and challenges (${debtText[debtLoad]}, discipline ${discipline}/10) call for a reset` :
                     `Your situation calls for rebuilding financial control`,
        challenging: satisfaction >= 7 && discipline >= 7 ? `Your high satisfaction (${satisfaction}/10) and discipline (${discipline}/10) suggest you already have control` :
                     `This is for those needing a major financial reset`,
        available: `For rebuilding control with satisfaction ${satisfaction}/10 and discipline ${discipline}/10`
      }
    };

    return reasons[priorityName]?.[indicator] || 'A valid financial priority';
  },

  /**
   * Calculate priority recommendations based on pre-survey + Tool 2 data
   * Returns array of priorities sorted by recommendation strength
   */
  calculatePriorityRecommendations(preSurveyData, tool2Data) {
    // Derive tiers from pre-survey
    const monthlyIncome = preSurveyData.monthlyIncome || 3500;
    const monthlyEssentials = preSurveyData.monthlyEssentials || 2000;
    const incomeRange = this.mapIncomeToRange(monthlyIncome);
    const essentialsRange = this.mapEssentialsToRange(monthlyEssentials, monthlyIncome);

    // Calculate surplus/deficit (critical financial health indicator)
    const surplus = monthlyIncome - monthlyEssentials;
    const essentialsPct = (monthlyEssentials / monthlyIncome) * 100;
    const surplusRate = (surplus / monthlyIncome) * 100; // Percentage of income left after essentials

    // Get Tool 2 derived data (or use safe defaults)
    const debtLoad = tool2Data ? this.deriveDebtLoad(tool2Data.currentDebts, tool2Data.debtStress) : 'C';
    const interestLevel = tool2Data ? this.deriveInterestLevel(tool2Data.debtStress) : 'Medium';
    const emergencyFund = tool2Data ? this.mapEmergencyFundMonths(tool2Data.emergencyFundMonths) : 'C';
    const incomeStability = tool2Data ? this.mapIncomeStability(tool2Data.incomeConsistency) : 'Stable';
    const dependents = tool2Data?.dependents || 'No';
    const growth = tool2Data ? this.deriveGrowthFromTool2(tool2Data) : 5;
    const stability = tool2Data ? this.deriveStabilityFromTool2(tool2Data) : 5;

    // Extract pre-survey values
    const { satisfaction, discipline, impulse, longTerm, lifestyle, autonomy } = preSurveyData;

    // Bundle all data for personalized reason generation
    const allData = {
      satisfaction, discipline, impulse, longTerm, lifestyle, autonomy,
      debtLoad, interestLevel, emergencyFund, incomeStability, dependents,
      growth, stability, incomeRange, essentialsRange,
      monthlyIncome, monthlyEssentials, surplus, essentialsPct, surplusRate
    };

    // Calculate scores for each priority (now including surplus/essentialsPct data)
    const priorities = [
      {
        name: 'Build Long-Term Wealth',
        score: this.scoreWealthPriority({ discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle, essentialsPct, surplus }),
        baseAllocation: { M:40, E:25, F:20, J:15 }
      },
      {
        name: 'Get Out of Debt',
        score: this.scoreDebtPriority({ debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle, essentialsPct, surplus }),
        baseAllocation: { M:15, E:25, F:45, J:15 }
      },
      {
        name: 'Feel Financially Secure',
        score: this.scoreSecurityPriority({ incomeStability, emergencyFund, dependents, satisfaction, stability, impulse, discipline, growth, essentialsPct, surplus }),
        baseAllocation: { M:25, E:35, F:30, J:10 }
      },
      {
        name: 'Enjoy Life Now',
        score: this.scoreEnjoymentPriority({ satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, impulse, incomeRange, dependents, essentialsPct, surplus }),
        baseAllocation: { M:20, E:20, F:15, J:45 }
      },
      {
        name: 'Save for a Big Goal',
        score: this.scoreBigGoalPriority({ debtLoad, emergencyFund, discipline, incomeStability, essentialsPct, surplus }),
        baseAllocation: { M:15, E:25, F:45, J:15 }
      },
      {
        name: 'Stabilize to Survive',
        score: this.scoreSurvivalPriority({ debtLoad, incomeStability, emergencyFund, dependents, satisfaction, incomeRange, essentialsPct, surplus }),
        baseAllocation: { M:5, E:45, F:40, J:10 }
      },
      {
        name: 'Build or Stabilize a Business',
        score: this.scoreBusinessPriority({ autonomy, growth, emergencyFund, incomeStability, discipline, debtLoad, dependents, essentialsPct, surplus }),
        baseAllocation: { M:20, E:30, F:35, J:15 }
      },
      {
        name: 'Create Generational Wealth',
        score: this.scoreGenerationalPriority({ incomeRange, growth, discipline, emergencyFund, debtLoad, longTerm, dependents, essentialsPct, surplus }),
        baseAllocation: { M:45, E:25, F:20, J:10 }
      },
      {
        name: 'Create Life Balance',
        score: this.scoreBalancePriority({ satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, essentialsPct, surplus }),
        baseAllocation: { M:15, E:25, F:25, J:35 }
      },
      {
        name: 'Reclaim Financial Control',
        score: this.scoreControlPriority({ satisfaction, debtLoad, discipline, emergencyFund, incomeStability, impulse, essentialsPct, surplus }),
        baseAllocation: { M:10, E:35, F:40, J:15 }
      }
    ];

    // Add indicators and personalized reasons
    return priorities.map(p => {
      const indicator = p.score >= 50 ? 'recommended' : p.score <= -50 ? 'challenging' : 'available';
      const icon = p.score >= 50 ? '⭐' : p.score <= -50 ? '⚠️' : '⚪';
      const reason = this.getPersonalizedReason(p.name, indicator, allData);

      return {
        ...p,
        indicator: indicator,
        icon: icon,
        reason: reason
      };
    }).sort((a, b) => b.score - a.score); // Sort by recommendation strength
  },

  /**
   * Build priority picker HTML section
   * @param {Array} priorities - Sorted array of priorities with scores and indicators
   * @param {string} selectedPriority - Currently selected priority (if any)
   * @param {string} selectedTimeline - Currently selected timeline (if any)
   * @param {boolean} isExpanded - Whether picker should be expanded
   * @returns {string} HTML for priority picker section
   */
  buildPriorityPickerHtml(priorities, selectedPriority, selectedTimeline, isExpanded) {
    const isCollapsed = !isExpanded;

    // Group priorities by indicator
    const recommended = priorities.filter(p => p.indicator === 'recommended');
    const available = priorities.filter(p => p.indicator === 'available');
    const challenging = priorities.filter(p => p.indicator === 'challenging');

    return `
      <!-- Priority Picker Section -->
      <div class="priority-picker-section ${isCollapsed ? 'collapsed' : ''}">
        <div class="priority-picker-header" onclick="togglePriorityPicker()">
          <div class="presurvey-title">🎯 Choose Your Financial Priority</div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 12px; color: var(--color-text-muted); font-weight: normal;">(Click to expand/collapse)</span>
            <span class="toggle-icon">${isCollapsed ? '▼' : '▲'}</span>
          </div>
        </div>

        ${isCollapsed ? `
        <div class="priority-picker-summary">
          <span><strong>Selected:</strong> ${selectedPriority || 'Not yet selected'}</span>
          ${selectedTimeline ? `<span><strong>Timeline:</strong> ${selectedTimeline}</span>` : ''}
        </div>
        ` : ''}

        <div class="priority-picker-body" style="display: ${isCollapsed ? 'none' : 'block'}">
          <p class="picker-intro">
            Based on your responses, we've analyzed which priorities best fit your current situation.
            <strong>Select one priority below and choose your timeline</strong>, then click "Calculate My Allocation"
            to see your personalized allocation breakdown. The recommendations are guidance - you can choose any priority.
          </p>

          ${recommended.length > 0 ? `
          <div class="priority-group recommended">
            <h3 class="group-title">⭐ Recommended for You</h3>
            ${recommended.map(p => this.buildPriorityCard(p, selectedPriority)).join('')}
          </div>
          ` : ''}

          ${available.length > 0 ? `
          <div class="priority-group available">
            <h3 class="group-title">⚪ Other Options</h3>
            ${available.map(p => this.buildPriorityCard(p, selectedPriority)).join('')}
          </div>
          ` : ''}

          ${challenging.length > 0 ? `
          <div class="priority-group challenging">
            <h3 class="group-title">⚠️ May Be Challenging</h3>
            ${challenging.map(p => this.buildPriorityCard(p, selectedPriority)).join('')}
          </div>
          ` : ''}

          <div class="timeline-selector">
            <label for="goalTimeline">
              <strong>When do you want to reach this goal?</strong>
            </label>
            <select id="goalTimeline" name="goalTimeline" required>
              <option value="">-- Select timeline --</option>
              <option value="Within 6 months" ${selectedTimeline === 'Within 6 months' ? 'selected' : ''}>Within 6 months</option>
              <option value="6–12 months" ${selectedTimeline === '6–12 months' ? 'selected' : ''}>6–12 months</option>
              <option value="1–2 years" ${selectedTimeline === '1–2 years' ? 'selected' : ''}>1–2 years</option>
              <option value="2–5 years" ${selectedTimeline === '2–5 years' ? 'selected' : ''}>2–5 years</option>
              <option value="5+ years" ${selectedTimeline === '5+ years' ? 'selected' : ''}>5+ years</option>
            </select>
          </div>

          <button type="button" class="btn-primary" id="calculateAllocationBtn" onclick="calculateAllocation()">
            Calculate My Allocation
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Build individual priority card HTML
   * @param {Object} priority - Priority object with name, score, indicator, icon, reason
   * @param {string} selectedPriority - Currently selected priority
   * @returns {string} HTML for priority card
   */
  buildPriorityCard(priority, selectedPriority) {
    const isSelected = priority.name === selectedPriority;
    return `
      <div class="priority-card ${priority.indicator} ${isSelected ? 'selected' : ''}"
           onclick="selectPriority('${priority.name}')">
        <div class="priority-header">
          <span class="priority-icon">${priority.icon}</span>
          <span class="priority-name">${priority.name}</span>
          ${isSelected ? '<span class="selected-badge">✓ Selected</span>' : ''}
        </div>
        <div class="priority-reason">${priority.reason}</div>
        <div class="priority-allocation">
          Starting: M${priority.baseAllocation.M}% · E${priority.baseAllocation.E}% · F${priority.baseAllocation.F}% · J${priority.baseAllocation.J}%
        </div>
      </div>
    `;
  },

  // ============================================================================
  // PHASE 5: SCENARIO COMPARISON SYSTEM
  // ============================================================================

  /**
   * Calculate differences between two scenarios
   */
  calculateScenarioDifferences(scenario1, scenario2, monthlyIncome) {
    const diffs = {};
    ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'].forEach(bucket => {
      const pct1 = scenario1.allocations[bucket] || 0;
      const pct2 = scenario2.allocations[bucket] || 0;
      const pctDiff = pct2 - pct1;
      const dollar1 = Math.round(monthlyIncome * pct1 / 100);
      const dollar2 = Math.round(monthlyIncome * pct2 / 100);
      const dollarDiff = dollar2 - dollar1;
      diffs[bucket] = {
        pct1, pct2, pctDiff, dollar1, dollar2, dollarDiff,
        isSignificant: Math.abs(dollarDiff) >= 200 || Math.abs(pctDiff) >= 5
      };
    });
    return diffs;
  },

  /**
   * Translate dollar amount to lifestyle examples
   */
  translateToLifestyle(monthlyAmount) {
    if (monthlyAmount >= 500) return '2-3 nice dinners out per month, or a weekend trip every quarter';
    if (monthlyAmount >= 250) return 'One nice dinner per week, or a monthly hobby budget';
    if (monthlyAmount >= 100) return 'Coffee dates with friends, occasional treats';
    return 'Small pleasures - a book, a coffee, breathing room';
  },

  /**
   * Detect overall strategy of a scenario
   */
  detectStrategy(scenario, preSurveyData) {
    const { Multiply, Freedom, Enjoyment, Essentials } = scenario.allocations;
    const hasDebt = preSurveyData && preSurveyData.totalDebt > 0;

    if (Freedom > 35) {
      return {
        name: hasDebt ? 'Debt Payoff Focus' : 'Safety Cushion Focus',
        description: hasDebt ? 'Prioritizes debt payoff and getting financially free' : 'Prioritizes building safety cushion and emergency fund',
        reflection: hasDebt ? 'Do you have the discipline to stay tight for faster debt freedom?' : 'Do you have stable income to justify aggressive saving?'
      };
    }
    if (Multiply > 30) {
      return {
        name: 'Wealth Building Focus',
        description: 'Aggressive wealth building, requires stability',
        reflection: 'Do you have the safety net to invest aggressively?'
      };
    }
    const values = [Multiply, Freedom, Enjoyment, Essentials];
    const range = Math.max(...values) - Math.min(...values);
    if (range < 15) {
      return {
        name: 'Balanced Approach',
        description: 'Balanced approach, makes progress on all fronts',
        reflection: 'Sometimes good enough on everything beats perfect on one thing'
      };
    }
    if (Enjoyment > 25) {
      return {
        name: 'Lifestyle Priority',
        description: 'Values quality of life now, slower financial progress',
        reflection: 'Is this sustainable joy or are you avoiding the hard stuff?'
      };
    }
    return {
      name: 'Custom Approach',
      description: 'Your unique allocation based on personal priorities',
      reflection: 'What matters most to you right now?'
    };
  },

  /**
   * Generate impact narrative for a bucket change
   */
  generateBucketImpact(bucket, diff, preSurveyData) {
    const hasDebt = preSurveyData && preSurveyData.totalDebt > 0;
    const direction = diff.dollarDiff > 0 ? 'positive' : 'negative';
    const absDollar = Math.abs(diff.dollarDiff);
    const absPct = Math.abs(diff.pctDiff);
    const yearlyDiff = absDollar * 12;

    const narratives = {
      Multiply: {
        positive: {
          title: 'Multiply: +$' + absDollar + '/month (+' + absPct + '%)',
          impact: [
            'Over one year, that is $' + yearlyDiff + ' MORE working for you',
            'The difference between building wealth slowly vs building momentum',
            'Starting compound growth earlier vs waiting'
          ],
          tradeoff: 'Less available now for ' + (hasDebt ? 'debt payoff and ' : '') + 'day-to-day needs'
        },
        negative: {
          title: 'Multiply: -$' + absDollar + '/month (-' + absPct + '%)',
          impact: [
            'Over one year, that is $' + yearlyDiff + ' LESS invested',
            'Wealth building takes a back seat in this approach',
            'Could delay financial independence by years'
          ],
          benefit: 'More available for other priorities right now'
        }
      },
      Freedom: {
        positive: hasDebt ? {
          title: 'Freedom: +$' + absDollar + '/month (+' + absPct + '%)',
          impact: [
            'Extra $' + absDollar + ' toward debt = paying off faster',
            'Could save thousands in interest over time',
            'Debt freedom months or years sooner'
          ],
          tradeoff: 'Less available for investing and lifestyle now'
        } : {
          title: 'Freedom: +$' + absDollar + '/month (+' + absPct + '%)',
          impact: [
            'Extra $' + absDollar + ' for emergency fund or big goals',
            'Building financial cushion faster',
            'More flexibility for opportunities'
          ],
          tradeoff: 'Less available for investing and enjoyment now'
        },
        negative: hasDebt ? {
          title: 'Freedom: -$' + absDollar + '/month (-' + absPct + '%)',
          impact: [
            'Less going toward debt payoff each month',
            'Debt takes longer to clear, more interest paid',
            'Financial freedom delayed'
          ],
          benefit: 'More available for other priorities now'
        } : {
          title: 'Freedom: -$' + absDollar + '/month (-' + absPct + '%)',
          impact: [
            'Smaller safety cushion being built',
            'Less flexibility for emergencies',
            'Slower progress on big goals'
          ],
          benefit: 'More available for investing or lifestyle'
        }
      },
      Enjoyment: {
        positive: {
          title: 'Enjoyment: +$' + absDollar + '/month (+' + absPct + '%)',
          impact: [
            'That could be: ' + this.translateToLifestyle(diff.dollar2),
            'Breathing room to avoid burnout',
            'Small joys now can prevent big binges later'
          ],
          tradeoff: hasDebt ? 'Debt payoff takes longer, more interest paid' : 'Less going toward future you'
        },
        negative: {
          title: 'Enjoyment: -$' + absDollar + '/month (-' + absPct + '%)',
          impact: [
            'Tighter lifestyle in exchange for faster progress',
            'Requires discipline and sustainable habits',
            'Risk: Could lead to feeling deprived'
          ],
          benefit: 'More going toward wealth building or financial freedom'
        }
      },
      Essentials: {
        positive: {
          title: 'Essentials: +$' + absDollar + '/month (+' + absPct + '%)',
          impact: [
            'More cushion for fixed expenses',
            'Accounts for variable costs (utilities, groceries)',
            'Less stress about staying on budget'
          ],
          tradeoff: 'Less available for other financial goals'
        },
        negative: {
          title: 'Essentials: -$' + absDollar + '/month (-' + absPct + '%)',
          impact: [
            'Tighter budget for necessities',
            'May require cutting expenses or lifestyle changes',
            'Risk: Could be unrealistic if expenses are actually higher'
          ],
          benefit: 'More available for wealth building, freedom, or enjoyment'
        }
      }
    };
    return narratives[bucket][direction];
  },

  /**
   * Generate complete comparison narrative
   */
  generateComparisonNarrative(scenario1, scenario2, preSurveyData) {
    const monthlyIncome = preSurveyData.monthlyIncome || 0;
    const diffs = this.calculateScenarioDifferences(scenario1, scenario2, monthlyIncome);
    const strategy1 = this.detectStrategy(scenario1, preSurveyData);
    const strategy2 = this.detectStrategy(scenario2, preSurveyData);

    const bucketNarratives = [];
    ['Multiply', 'Freedom', 'Enjoyment', 'Essentials'].forEach(bucket => {
      const diff = diffs[bucket];
      if (diff.isSignificant) {
        bucketNarratives.push(this.generateBucketImpact(bucket, diff, preSurveyData));
      }
    });

    return { diffs, strategy1, strategy2, bucketNarratives };
  },

  /**
   * Run full validation (server-side version for PDF generation)
   * Mirrors the client-side checkMyPlan() validation logic
   * @param {string} clientId - Client ID
   * @param {Object} allocations - Current allocation percentages {Multiply, Essentials, Freedom, Enjoyment}
   * @param {Object} preSurveyData - Pre-survey data
   * @returns {Array} Array of validation warnings with severity, title, message, action
   */
  runFullValidation(clientId, allocations, preSurveyData) {
    const warnings = [];
    const buckets = allocations || {};
    const monthlyIncome = Number(preSurveyData.monthlyIncome) || 0;
    const monthlyEssentials = Number(preSurveyData.monthlyEssentials) || 0;
    const totalDebt = Number(preSurveyData.totalDebt) || 0;
    const emergencyFund = Number(preSurveyData.emergencyFund) || 0;
    const actualEssentialsPct = monthlyIncome > 0 ? (monthlyEssentials / monthlyIncome) * 100 : 0;

    // Helper function to format dollars
    const formatDollars = (pct) => {
      const dollars = Math.round(monthlyIncome * pct / 100);
      return pct + '% ($' + dollars.toLocaleString() + ')';
    };

    // Calculate emergency fund coverage
    const monthsOfCoverage = monthlyEssentials > 0 ? emergencyFund / monthlyEssentials : 0;

    // === FINANCIAL REALITY CHECKS ===

    // Critical: No emergency fund + low Freedom allocation
    if (monthsOfCoverage < 1 && buckets.Freedom < 20) {
      warnings.push({
        severity: 'Critical',
        title: 'Low Emergency Fund Coverage',
        message: 'You have less than 1 month emergency coverage ($' + emergencyFund.toLocaleString() + '). Your Freedom allocation (' + formatDollars(buckets.Freedom) + ') may be too low to build a safety net quickly.',
        action: 'Increase Freedom allocation to build emergency fund faster'
      });
    }

    // Warning: Low emergency fund (1-3 months) + low Freedom
    if (monthsOfCoverage >= 1 && monthsOfCoverage < 3 && buckets.Freedom < 20) {
      warnings.push({
        severity: 'Warning',
        title: 'Emergency Fund Needs Growth',
        message: 'Your emergency fund has ' + monthsOfCoverage.toFixed(1) + ' months coverage. Consider increasing Freedom allocation to build to 4+ months faster.',
        action: 'Target 4+ months of essential expenses'
      });
    }

    // Warning: High debt + low Freedom allocation
    if (totalDebt > monthlyIncome * 3 && buckets.Freedom < 25) {
      warnings.push({
        severity: 'Warning',
        title: 'High Debt with Low Freedom',
        message: 'With $' + totalDebt.toLocaleString() + ' in debt, consider allocating more to Freedom (currently ' + formatDollars(buckets.Freedom) + ') for debt paydown.',
        action: 'Increase Freedom to accelerate debt payoff'
      });
    }

    // Suggestion: Good emergency fund but still high Freedom
    if (monthsOfCoverage >= 6 && totalDebt < monthlyIncome && buckets.Freedom > 40) {
      warnings.push({
        severity: 'Suggestion',
        title: 'Consider Rebalancing Freedom',
        message: 'Your emergency fund is solid (' + monthsOfCoverage.toFixed(1) + ' months). You might redirect some Freedom allocation to Multiply for growth.',
        action: 'Consider shifting some Freedom to Multiply'
      });
    }

    // Critical: Essentials below actual spending
    if (actualEssentialsPct > 0 && buckets.Essentials < actualEssentialsPct) {
      const shortfall = Math.round(actualEssentialsPct - buckets.Essentials);
      const shortfallDollars = Math.round(monthlyIncome * shortfall / 100);
      warnings.push({
        severity: 'Critical',
        title: 'Essentials Underfunded',
        message: 'Your Essentials allocation (' + formatDollars(buckets.Essentials) + ') is less than your actual essential spending (' + formatDollars(Math.round(actualEssentialsPct)) + '). You may need to reduce expenses by ' + shortfall + '% ($' + shortfallDollars.toLocaleString() + ') or adjust your allocation.',
        action: 'Increase Essentials or reduce fixed expenses'
      });
    }

    // Warning: Very high Essentials
    if (buckets.Essentials > 50) {
      warnings.push({
        severity: 'Warning',
        title: 'High Essentials Allocation',
        message: 'Your Essentials allocation (' + formatDollars(buckets.Essentials) + ') is quite high. Consider finding ways to reduce fixed expenses.',
        action: 'Review essential expenses for reduction opportunities'
      });
    }

    // Suggestion: Low Multiply
    if (buckets.Multiply < 10) {
      warnings.push({
        severity: 'Suggestion',
        title: 'Low Wealth Building',
        message: 'Consider increasing Multiply to at least 10% ($' + Math.round(monthlyIncome * 10 / 100).toLocaleString() + ') for long-term wealth building.',
        action: 'Increase Multiply for compound growth'
      });
    }

    // Warning: High Enjoyment
    if (buckets.Enjoyment > 35) {
      warnings.push({
        severity: 'Warning',
        title: 'High Enjoyment Allocation',
        message: 'Your Enjoyment allocation (' + formatDollars(buckets.Enjoyment) + ') is very high. Make sure this aligns with your financial goals.',
        action: 'Review if lifestyle spending matches priorities'
      });
    }

    // Suggestion: Low Freedom
    if (buckets.Freedom < 10) {
      warnings.push({
        severity: 'Suggestion',
        title: 'Low Freedom Allocation',
        message: 'Consider allocating at least 10% ($' + Math.round(monthlyIncome * 10 / 100).toLocaleString() + ') to Freedom for emergency fund and debt management.',
        action: 'Increase Freedom for financial security'
      });
    }

    // === BEHAVIORAL ALIGNMENT CHECKS ===
    const discipline = Number(preSurveyData.discipline) || 5;
    const impulse = Number(preSurveyData.impulse) || 5;
    const longTerm = Number(preSurveyData.longTerm) || 5;

    // Low discipline + high Multiply
    if (discipline <= 3 && buckets.Multiply >= 30) {
      warnings.push({
        severity: 'Warning',
        title: 'Discipline-Multiply Mismatch',
        message: 'Your low discipline score (' + discipline + '/10) may make it hard to maintain ' + formatDollars(buckets.Multiply) + ' in Multiply consistently.',
        action: 'Consider a more achievable Multiply target'
      });
    }

    // Low impulse control + high Enjoyment
    if (impulse <= 3 && buckets.Enjoyment >= 30) {
      warnings.push({
        severity: 'Warning',
        title: 'Impulse-Enjoyment Risk',
        message: 'With low impulse control (' + impulse + '/10), ' + formatDollars(buckets.Enjoyment) + ' in Enjoyment may lead to overspending.',
        action: 'Consider reducing Enjoyment or using spending guardrails'
      });
    }

    // Short-term focus + high Multiply
    if (longTerm <= 3 && buckets.Multiply >= 35) {
      warnings.push({
        severity: 'Suggestion',
        title: 'Focus-Multiply Tension',
        message: 'Your present-focus orientation (' + longTerm + '/10) may conflict with ' + formatDollars(buckets.Multiply) + ' in Multiply. Ensure you can sustain this.',
        action: 'Balance immediate needs with long-term goals'
      });
    }

    // === DEBT/LIFESTYLE CHECKS ===

    // Has debt but low Freedom allocation
    if (totalDebt > 0 && buckets.Freedom < 30) {
      warnings.push({
        severity: 'Warning',
        title: 'Debt Payoff Opportunity',
        message: 'You have debt but are allocating less than 30% to Freedom. See how increasing your Freedom allocation could accelerate your debt payoff.',
        action: 'Consider increasing Freedom for faster debt payoff'
      });
    }

    // High income + high Enjoyment + low Multiply (lifestyle inflation risk)
    if (monthlyIncome >= 8000 && buckets.Enjoyment >= 25 && buckets.Multiply < 20) {
      warnings.push({
        severity: 'Warning',
        title: 'Lifestyle Inflation Risk',
        message: 'Your income supports wealth-building, but your allocation prioritizes present enjoyment over future wealth. Consider the long-term impact.',
        action: 'Consider shifting some Enjoyment to Multiply'
      });
    }

    return warnings;
  },

  /**
   * Generate helper insights for PDF (server-side version)
   * Calculates data for Emergency Fund Timeline, Debt Payoff Timeline, etc.
   * @param {Object} allocations - Current allocation percentages
   * @param {Object} preSurveyData - Pre-survey data
   * @returns {Array} Array of helper insights with title, content, and calculations
   */
  generateHelperInsights(allocations, preSurveyData) {
    const helpers = [];
    const buckets = allocations || {};
    const monthlyIncome = Number(preSurveyData.monthlyIncome) || 0;
    const monthlyEssentials = Number(preSurveyData.monthlyEssentials) || 0;
    const totalDebt = Number(preSurveyData.totalDebt) || 0;
    const emergencyFund = Number(preSurveyData.emergencyFund) || 0;

    // === EMERGENCY FUND TIMELINE HELPER ===
    if (monthlyEssentials > 0 && monthlyIncome > 0) {
      const monthsOfCoverage = emergencyFund / monthlyEssentials;
      const targetAmount = monthlyEssentials * 4; // 4-month target
      const gap = Math.max(0, targetAmount - emergencyFund);

      if (gap > 0 && buckets.Freedom < 25) {
        const currentFreedomDollars = Math.round(monthlyIncome * buckets.Freedom / 100);
        const suggestedFreedom = 25;
        const suggestedFreedomDollars = Math.round(monthlyIncome * suggestedFreedom / 100);

        const currentTimeline = currentFreedomDollars > 0 ? Math.ceil(gap / currentFreedomDollars) : 999;
        const suggestedTimeline = suggestedFreedomDollars > 0 ? Math.ceil(gap / suggestedFreedomDollars) : 999;
        const monthsSaved = currentTimeline - suggestedTimeline;

        helpers.push({
          type: 'emergency-fund',
          title: 'Emergency Fund Timeline',
          severity: monthsOfCoverage < 1 ? 'Critical' : 'Warning',
          current: {
            emergencyFund: emergencyFund,
            monthsOfCoverage: monthsOfCoverage.toFixed(1),
            targetAmount: targetAmount,
            gap: gap,
            freedomPercent: buckets.Freedom,
            freedomDollars: currentFreedomDollars,
            timeline: currentTimeline
          },
          suggested: {
            freedomPercent: suggestedFreedom,
            freedomDollars: suggestedFreedomDollars,
            timeline: suggestedTimeline,
            monthsSaved: monthsSaved
          },
          message: 'At ' + buckets.Freedom + '% Freedom ($' + currentFreedomDollars.toLocaleString() + '/month), it will take ' + currentTimeline + ' months to reach a 4-month emergency fund. Increasing to ' + suggestedFreedom + '% could save ' + monthsSaved + ' months.'
        });
      }
    }

    // === DEBT PAYOFF TIMELINE HELPER ===
    if (totalDebt > 0 && buckets.Freedom < 30) {
      const currentFreedomDollars = Math.round(monthlyIncome * buckets.Freedom / 100);
      const suggestedFreedom = 35;
      const suggestedFreedomDollars = Math.round(monthlyIncome * suggestedFreedom / 100);

      // Simple payoff calculation (assuming ~15% APR average)
      const monthlyInterestRate = 0.15 / 12;

      const calculatePayoffMonths = (principal, monthlyPayment, monthlyRate) => {
        if (monthlyPayment <= principal * monthlyRate) return 999; // Cannot pay off
        const months = Math.ceil(
          Math.log(monthlyPayment / (monthlyPayment - principal * monthlyRate)) / Math.log(1 + monthlyRate)
        );
        return Math.min(months, 999);
      };

      const calculateTotalInterest = (principal, monthlyPayment, months, monthlyRate) => {
        if (months >= 999) return 0;
        return (monthlyPayment * months) - principal;
      };

      const currentMonths = calculatePayoffMonths(totalDebt, currentFreedomDollars, monthlyInterestRate);
      const suggestedMonths = calculatePayoffMonths(totalDebt, suggestedFreedomDollars, monthlyInterestRate);
      const monthsSaved = currentMonths - suggestedMonths;

      const currentInterest = calculateTotalInterest(totalDebt, currentFreedomDollars, currentMonths, monthlyInterestRate);
      const suggestedInterest = calculateTotalInterest(totalDebt, suggestedFreedomDollars, suggestedMonths, monthlyInterestRate);
      const interestSaved = currentInterest - suggestedInterest;

      helpers.push({
        type: 'debt-payoff',
        title: 'Debt Payoff Timeline',
        severity: 'Warning',
        current: {
          totalDebt: totalDebt,
          freedomPercent: buckets.Freedom,
          freedomDollars: currentFreedomDollars,
          payoffMonths: currentMonths,
          totalInterest: Math.round(currentInterest)
        },
        suggested: {
          freedomPercent: suggestedFreedom,
          freedomDollars: suggestedFreedomDollars,
          payoffMonths: suggestedMonths,
          totalInterest: Math.round(suggestedInterest),
          monthsSaved: monthsSaved,
          interestSaved: Math.round(interestSaved)
        },
        message: currentMonths < 999
          ? 'At ' + buckets.Freedom + '% Freedom, debt payoff takes ' + currentMonths + ' months. At ' + suggestedFreedom + '%, it takes ' + suggestedMonths + ' months (' + monthsSaved + ' months faster, saving $' + Math.round(interestSaved).toLocaleString() + ' in interest).'
          : 'Your current Freedom allocation may not cover interest. Consider increasing to ' + suggestedFreedom + '% for effective debt payoff.'
      });
    }

    // === LIFESTYLE INFLATION CHECK HELPER ===
    if (monthlyIncome >= 8000 && buckets.Enjoyment >= 25 && buckets.Multiply < 20) {
      const enjoymentDollars = Math.round(monthlyIncome * buckets.Enjoyment / 100);
      const multiplyDollars = Math.round(monthlyIncome * buckets.Multiply / 100);

      const suggestedEnjoyment = 20;
      const suggestedMultiply = Math.min(buckets.Multiply + (buckets.Enjoyment - suggestedEnjoyment), 50);
      const suggestedMultiplyDollars = Math.round(monthlyIncome * suggestedMultiply / 100);

      // 10-year projection at 7% average return
      const futureValue = (monthlyContribution, years, rate) => {
        const months = years * 12;
        const monthlyRate = rate / 12;
        return monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      };

      const currentWealth = futureValue(multiplyDollars, 10, 0.07);
      const suggestedWealth = futureValue(suggestedMultiplyDollars, 10, 0.07);
      const wealthGap = suggestedWealth - currentWealth;

      helpers.push({
        type: 'lifestyle-inflation',
        title: 'Lifestyle Inflation Check',
        severity: 'Warning',
        current: {
          enjoymentPercent: buckets.Enjoyment,
          enjoymentDollars: enjoymentDollars,
          multiplyPercent: buckets.Multiply,
          multiplyDollars: multiplyDollars,
          tenYearWealth: Math.round(currentWealth)
        },
        suggested: {
          enjoymentPercent: suggestedEnjoyment,
          multiplyPercent: suggestedMultiply,
          multiplyDollars: suggestedMultiplyDollars,
          tenYearWealth: Math.round(suggestedWealth),
          wealthGap: Math.round(wealthGap)
        },
        message: 'Your income ($' + monthlyIncome.toLocaleString() + '/month) supports significant wealth-building. Current allocation: ' + buckets.Enjoyment + '% Enjoyment vs ' + buckets.Multiply + '% Multiply. Shifting to ' + suggestedEnjoyment + '%/' + suggestedMultiply + '% could add $' + Math.round(wealthGap).toLocaleString() + ' to your 10-year wealth.'
      });
    }

    // === ENJOYMENT REALITY CHECK HELPER ===
    if (buckets.Enjoyment > 35) {
      const enjoymentDollars = Math.round(monthlyIncome * buckets.Enjoyment / 100);

      // Break down what this could buy
      const weeklyBudget = Math.round(enjoymentDollars / 4);
      const dailyBudget = Math.round(enjoymentDollars / 30);

      helpers.push({
        type: 'enjoyment-reality',
        title: 'Enjoyment Reality Check',
        severity: 'Suggestion',
        current: {
          enjoymentPercent: buckets.Enjoyment,
          enjoymentDollars: enjoymentDollars,
          weeklyBudget: weeklyBudget,
          dailyBudget: dailyBudget
        },
        message: 'Your Enjoyment budget of $' + enjoymentDollars.toLocaleString() + '/month breaks down to $' + weeklyBudget + '/week or $' + dailyBudget + '/day. Make sure this spending aligns with what truly brings you joy.'
      });
    }

    return helpers;
  },

  /**
   * Delete a saved scenario
   */
  deleteScenario(clientId, scenarioName) {
    try {
      const scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL4_SCENARIOS);
      if (!scenariosSheet) {
        return { success: false, error: 'Scenarios sheet not found' };
      }

      const data = scenariosSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const rowClientId = data[i][1];
        const rowScenarioName = data[i][2];
        if (rowClientId === clientId && rowScenarioName === scenarioName) {
          scenariosSheet.deleteRow(i + 1);
          SpreadsheetApp.flush();
          Logger.log('Deleted scenario "' + scenarioName + '" for client ' + clientId);
          return { success: true };
        }
      }
      return { success: false, error: 'Scenario not found' };
    } catch (error) {
      Logger.log('Error deleting scenario: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Get all scenarios for a client from the sheet
   */
  getScenariosFromSheet(clientId) {
    try {
      Logger.log('getScenariosFromSheet called with clientId: ' + clientId);

      const scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL4_SCENARIOS);
      if (!scenariosSheet) {
        Logger.log('TOOL4_SCENARIOS sheet not found');
        return [];
      }

      const data = scenariosSheet.getDataRange().getValues();
      const headers = data[0];
      Logger.log('Found ' + (data.length - 1) + ' rows in TOOL4_SCENARIOS');
      const scenarios = [];

      const clientIdCol = headers.indexOf('Client_ID');
      const nameCol = headers.indexOf('Scenario_Name');
      const timestampCol = headers.indexOf('Timestamp');
      const priorityCol = headers.indexOf('Priority_Selected');
      const incomeCol = headers.indexOf('Monthly_Income');
      const multiplyCol = headers.indexOf('Custom_M_Percent');
      const essentialsCol = headers.indexOf('Custom_E_Percent');
      const freedomCol = headers.indexOf('Custom_F_Percent');
      const enjoymentCol = headers.indexOf('Custom_J_Percent');

      // Pre-survey snapshot columns for comparison context
      const currentEssentialsCol = headers.indexOf('Current_Essentials');
      const debtBalanceCol = headers.indexOf('Debt_Balance');
      const emergencyFundCol = headers.indexOf('Emergency_Fund');
      const incomeStabilityCol = headers.indexOf('Income_Stability');

      // Helper to parse percentage strings like "16%" to numbers
      function parsePercent(val) {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          return parseFloat(val.replace('%', '').replace(',', '')) || 0;
        }
        return 0;
      }

      // Helper to parse currency strings like "$13,000.00" to numbers
      function parseCurrency(val) {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          return parseFloat(val.replace(/[$,]/g, '')) || 0;
        }
        return 0;
      }

      for (let i = 1; i < data.length; i++) {
        if (data[i][clientIdCol] === clientId) {
          // Convert Date to ISO string for serialization to client
          var timestampVal = data[i][timestampCol];
          var timestampStr = '';
          if (timestampVal instanceof Date) {
            timestampStr = timestampVal.toISOString();
          } else if (timestampVal) {
            timestampStr = String(timestampVal);
          }

          scenarios.push({
            name: String(data[i][nameCol] || ''),
            timestamp: timestampStr,
            priority: String(data[i][priorityCol] || ''),
            monthlyIncome: parseCurrency(data[i][incomeCol]),
            allocations: {
              Multiply: parsePercent(data[i][multiplyCol]),
              Essentials: parsePercent(data[i][essentialsCol]),
              Freedom: parsePercent(data[i][freedomCol]),
              Enjoyment: parsePercent(data[i][enjoymentCol])
            },
            // Pre-survey snapshot for comparison context
            profileSnapshot: {
              currentEssentials: parseCurrency(data[i][currentEssentialsCol]),
              debtBalance: parseCurrency(data[i][debtBalanceCol]),
              emergencyFund: parseCurrency(data[i][emergencyFundCol]),
              incomeStability: String(data[i][incomeStabilityCol] || '')
            }
          });
        }
      }

      scenarios.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      Logger.log('Found ' + scenarios.length + ' scenarios for clientId: ' + clientId);
      return scenarios;
    } catch (error) {
      Logger.log('Error getting scenarios from sheet: ' + error);
      return [];
    }
  },

  // ============================================================================
  // RENDERING METHODS
  // ============================================================================

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

// ============================================================================
// GLOBAL WRAPPERS FOR CLIENT-SIDE CALLS
// These functions are called by google.script.run from client-side JavaScript
// ============================================================================

/**
 * Global wrapper for saving pre-survey data
 * Called by: Pre-survey form submission (buildPreSurveyPage)
 */
function savePreSurvey(clientId, preSurveyData) {
  return Tool4.savePreSurvey(clientId, preSurveyData);
}

/**
 * Global wrapper for retrieving pre-survey data
 * Called by: Pre-survey form (if needed for draft recovery)
 */
function getPreSurvey(clientId) {
  return Tool4.getPreSurvey(clientId);
}

/**
 * Global wrapper for saving priority selection
 * Called by: Priority picker (calculateAllocation button)
 */
function savePrioritySelection(clientId, selectedPriority, goalTimeline) {
  return Tool4.savePrioritySelection(clientId, selectedPriority, goalTimeline);
}

/**
 * Global wrapper for saving a custom allocation scenario
 * Called by: Interactive calculator (Save Scenario button)
 */
function saveScenario(clientId, scenario) {
  return Tool4.saveScenario(clientId, scenario);
}

/**
 * Global wrapper for deleting a scenario
 * Called by: Scenario list (Delete button)
 */
function deleteScenario(clientId, scenarioName) {
  return Tool4.deleteScenario(clientId, scenarioName);
}

/**
 * Global wrapper for getting all scenarios from sheet
 * Called by: Scenario list component
 */
function getScenariosFromSheet(clientId) {
  return Tool4.getScenariosFromSheet(clientId);
}

/**
 * Global wrapper for generating comparison narrative
 * Called by: Comparison view
 */
function generateComparisonNarrative(scenario1, scenario2, preSurveyData) {
  return Tool4.generateComparisonNarrative(scenario1, scenario2, preSurveyData);
}
