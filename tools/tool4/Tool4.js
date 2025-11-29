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

    .survey-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 8px;
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
            1. How dissatisfied are you with your current financial situation?
            <span class="question-required">*</span>
          </label>
          <div class="scale-input-group">
            <span class="scale-labels" style="min-width: 80px">Not at all</span>
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
            <span class="scale-labels" style="min-width: 80px; text-align: right">Extremely</span>
            <span class="scale-value" id="satisfactionValue">5</span>
          </div>
          <div class="question-help">Higher dissatisfaction amplifies our recommendations to help you change faster</div>
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
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      user-select: none;
    }

    .priority-picker-header:hover {
      background: rgba(255, 255, 255, 0.03);
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
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
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
      color: var(--color-primary);
      margin-bottom: 5px;
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
      <div class="loading-text">Calculating Your Personalized Allocation...</div>
      <div class="loading-subtext">Analyzing your financial profile</div>
    </div>
  </div>

  <div class="unified-container">

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
          ${hasPreSurvey ? '📊 Your Budget Profile' : '📊 Quick Budget Profile Setup (8 questions, 2-3 minutes)'}
        </div>
        <div class="presurvey-toggle ${hasPreSurvey ? 'collapsed' : ''}" id="preSurveyToggle">▼</div>
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
            <div class="question-help">After taxes, how much money hits your bank account each month? If it varies, estimate your average.</div>
            <input type="number" id="monthlyIncome" class="form-input" placeholder="e.g., 3500" min="0" step="1" value="${formValues.monthlyIncome || ''}" required>
          </div>

          <!-- Q2: Monthly Essentials -->
          <div class="form-question">
            <label class="question-label">2. What is your monthly essentials spending?</label>
            <div class="question-help">Rent/mortgage + utilities + groceries + insurance + minimum debt payments. Not including entertainment, dining out, or discretionary spending.</div>
            <input type="number" id="monthlyEssentials" class="form-input" placeholder="e.g., 2000" min="0" step="1" value="${formValues.monthlyEssentials || ''}" required>
          </div>

          <!-- Q3: Financial Satisfaction Slider -->
          <div class="form-question">
            <label class="question-label">3. How satisfied are you with your current financial situation?</label>
            <div class="question-help">Your satisfaction level helps us understand how urgent change feels to you.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="satisfactionDisplay">${sliderLabels.satisfaction[formValues.satisfaction]}</div>
              <input type="range" id="satisfaction" class="slider-input" min="0" max="10" value="${formValues.satisfaction}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q4: Discipline Slider -->
          <div class="form-question">
            <label class="question-label">4. How would you rate your financial discipline?</label>
            <div class="question-help">Your ability to stick to financial plans and resist temptation.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="disciplineDisplay">${sliderLabels.discipline[formValues.discipline]}</div>
              <input type="range" id="discipline" class="slider-input" min="0" max="10" value="${formValues.discipline}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q5: Impulse Control Slider -->
          <div class="form-question">
            <label class="question-label">5. How strong is your impulse control with spending?</label>
            <div class="question-help">How well you resist unplanned purchases and stay on budget.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="impulseDisplay">${sliderLabels.impulse[formValues.impulse]}</div>
              <input type="range" id="impulse" class="slider-input" min="0" max="10" value="${formValues.impulse}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q6: Long-Term Focus Slider -->
          <div class="form-question">
            <label class="question-label">6. How focused are you on long-term financial goals?</label>
            <div class="question-help">Your orientation toward future versus present financial needs.</div>
            <div class="slider-container">
              <div class="slider-value-display" id="longTermDisplay">${sliderLabels.longTerm[formValues.longTerm]}</div>
              <input type="range" id="longTerm" class="slider-input" min="0" max="10" value="${formValues.longTerm}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q7: Lifestyle Priority Slider -->
          <div class="form-question">
            <label class="question-label">7. How do you prioritize enjoying life now versus saving for later?</label>
            <div class="question-help">Where do you fall on the spectrum from maximum saving to maximum present enjoyment?</div>
            <div class="slider-container">
              <div class="slider-value-display" id="lifestyleDisplay">${sliderLabels.lifestyle[formValues.lifestyle]}</div>
              <input type="range" id="lifestyle" class="slider-input" min="0" max="10" value="${formValues.lifestyle}" required>
              <div class="slider-scale">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <!-- Q8: Autonomy Preference Slider -->
          <div class="form-question">
            <label class="question-label">8. Do you prefer following expert guidance or making your own financial choices?</label>
            <div class="question-help">How much autonomy do you want in shaping your budget?</div>
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
        <div class="calculator-title">Your Personalized Budget</div>
        <div class="calculator-subtitle">
          ${allocation ? 'Based on your profile and financial goals' : 'Complete the profile above to see your personalized allocation'}
        </div>
      </div>

      ${allocation ? `
        <div class="allocation-grid">
          <div class="allocation-bucket">
            <div class="bucket-name">Multiply</div>
            <div class="bucket-percentage">${allocation.percentages.Multiply}%</div>
            <div class="bucket-amount">Long-term wealth building</div>
          </div>
          <div class="allocation-bucket">
            <div class="bucket-name">Essentials</div>
            <div class="bucket-percentage">${allocation.percentages.Essentials}%</div>
            <div class="bucket-amount">Core living expenses</div>
          </div>
          <div class="allocation-bucket">
            <div class="bucket-name">Freedom</div>
            <div class="bucket-percentage">${allocation.percentages.Freedom}%</div>
            <div class="bucket-amount">Debt & emergency fund</div>
          </div>
          <div class="allocation-bucket">
            <div class="bucket-name">Enjoyment</div>
            <div class="bucket-percentage">${allocation.percentages.Enjoyment}%</div>
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
          <div style="color: var(--color-text-secondary); line-height: 1.6;">
            <p><strong>Multiply:</strong> ${allocation.lightNotes.Multiply}</p>
            <p><strong>Essentials:</strong> ${allocation.lightNotes.Essentials}</p>
            <p><strong>Freedom:</strong> ${allocation.lightNotes.Freedom}</p>
            <p><strong>Enjoyment:</strong> ${allocation.lightNotes.Enjoyment}</p>
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

    function calculateAllocation() {
      if (!selectedPriorityName) {
        alert('Please select a priority first');
        return;
      }
      const timeline = document.getElementById('goalTimeline').value;
      if (!timeline) {
        alert('Please select a timeline');
        return;
      }

      // Show loading
      const btn = document.getElementById('calculateAllocationBtn');
      btn.disabled = true;
      btn.textContent = 'Calculating...';

      // Call server to calculate allocation with selected priority
      google.script.run
        .withSuccessHandler(function(result) {
          // Reload page to show calculator with allocations
          window.location.reload();
        })
        .withFailureHandler(function(error) {
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
        document.getElementById('errorMessage').textContent = 'Please answer all 8 questions.';
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
        autonomy: parseInt(document.getElementById('autonomy').value)
      };

      // Show loading overlay
      var loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
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
          if (result && result.nextPageHtml) {
            document.open();
            document.write(result.nextPageHtml);
            document.close();
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

    // --- Behavioral Modifiers (with Satisfaction Amplification) ---
    const rawSatFactor = 1 + Math.max(0, input.satisfaction - CONFIG.satisfaction.neutralScore) * CONFIG.satisfaction.step;
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
        (satBoostPct > 0 ? 'Because you are ' + input.satisfaction + '/10 dissatisfied, we amplified all positive nudges by ' + satBoostPct + '%.\n' : '') +
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

        // Derived from Tool 2 data
        growth: this.deriveGrowthFromTool2(tool2Form),
        stability: this.deriveStabilityFromTool2(tool2Form),
        stageOfLife: this.deriveStageOfLife(tool2Form),
        emergencyFund: this.mapEmergencyFundMonths(tool2Form.emergencyFundMonths),
        incomeStability: this.mapIncomeStability(tool2Form.incomeConsistency),
        debtLoad: this.deriveDebtLoad(tool2Form.currentDebts, tool2Form.debtStress),
        interestLevel: this.deriveInterestLevel(tool2Form.debtStress),
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
    const { discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle } = data;

    // Recommended factors
    if (discipline >= 7) score += 30;
    if (longTerm >= 7) score += 30;
    if (['A','B'].includes(debtLoad)) score += 20;
    if (incomeStability === 'Very stable' || incomeStability === 'Stable') score += 15;
    if (growth >= 7) score += 20;
    if (['D','E'].includes(emergencyFund)) score += 15;
    if (autonomy >= 7) score += 10;

    // Cautioned factors
    if (discipline <= 3) score -= 40;
    if (longTerm <= 3) score -= 30;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 25;
    if (lifestyle >= 7) score -= 20;

    return score;
  },

  /**
   * Score: Get Out of Debt
   */
  scoreDebtPriority(data) {
    let score = 0;
    const { debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle } = data;

    // Recommended factors
    if (['D','E'].includes(debtLoad)) score += 50;
    if (interestLevel === 'High') score += 30;
    if (satisfaction <= 3) score += 20;
    if (stability >= 7) score += 20;
    if (['A','B'].includes(emergencyFund)) score += 15;

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
    const { incomeStability, emergencyFund, dependents, satisfaction, stability, impulse, discipline, growth } = data;

    // Recommended factors
    if (incomeStability === 'Unstable / irregular') score += 40;
    if (['A','B'].includes(emergencyFund)) score += 40;
    if (dependents === 'Yes') score += 25;
    if (satisfaction <= 3 && stability >= 7) score += 20; // High emotional safety need
    if (impulse <= 3) score += 15;
    if (discipline <= 3) score += 15;

    // Cautioned factors
    if (incomeStability === 'Very stable') score -= 25;
    if (['D','E'].includes(emergencyFund)) score -= 30;
    if (dependents === 'No') score -= 10;
    if (growth >= 7) score -= 20;

    return score;
  },

  /**
   * Score: Enjoy Life Now
   */
  scoreEnjoymentPriority(data) {
    let score = 0;
    const { satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, impulse, incomeRange, dependents } = data;

    // Recommended factors
    if (satisfaction <= 3) score += 30;
    if (lifestyle >= 7) score += 40;
    if (incomeStability === 'Stable' || incomeStability === 'Very stable') score += 25;
    if (['A','B'].includes(debtLoad)) score += 30;
    if (['D','E'].includes(emergencyFund)) score += 20;
    if (impulse >= 7) score += 15;

    // Cautioned factors
    if (['D','E'].includes(debtLoad)) score -= 50;
    if (incomeStability === 'Unstable / irregular') score -= 40;
    if (['A','B'].includes(emergencyFund)) score -= 35;
    if (dependents === 'Yes') score -= 25; // Simplified - would check count if available
    if (impulse <= 3) score -= 30;
    if (incomeRange === 'A') score -= 20;

    return score;
  },

  /**
   * Score: Save for a Big Goal
   */
  scoreBigGoalPriority(data) {
    let score = 0;
    const { debtLoad, emergencyFund, discipline, incomeStability } = data;

    // Recommended factors
    if (['C'].includes(debtLoad)) score += 10; // Moderate debt ok
    if (['D','E'].includes(emergencyFund)) score += 20;
    if (discipline >= 7) score += 25;
    if (incomeStability === 'Stable' || incomeStability === 'Very stable') score += 20;

    // Cautioned factors
    if (debtLoad === 'E') score -= 35;
    if (incomeStability === 'Unstable / irregular') score -= 25;
    if (['A','B'].includes(emergencyFund)) score -= 30;
    if (discipline <= 3) score -= 25;

    return score;
  },

  /**
   * Score: Stabilize to Survive
   */
  scoreSurvivalPriority(data) {
    let score = 0;
    const { debtLoad, incomeStability, emergencyFund, dependents, satisfaction, incomeRange } = data;

    // Recommended factors
    if (debtLoad === 'E') score += 40;
    if (incomeStability === 'Unstable / irregular') score += 50;
    if (emergencyFund === 'A') score += 50;
    if (dependents === 'Yes') score += 30;
    if (satisfaction <= 3) score += 25;
    if (incomeRange === 'A') score += 30;

    // Cautioned factors
    if (['A','B'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Very stable') score -= 40;
    if (['D','E'].includes(emergencyFund)) score -= 40;
    if (dependents === 'No') score -= 20;
    if (incomeRange === 'E') score -= 25;

    return score;
  },

  /**
   * Score: Build or Stabilize a Business
   */
  scoreBusinessPriority(data) {
    let score = 0;
    const { autonomy, growth, emergencyFund, incomeStability, discipline, debtLoad, dependents } = data;

    // Recommended factors
    if (autonomy >= 7) score += 30;
    if (growth >= 7) score += 25;
    if (emergencyFund === 'C') score += 20; // Moderate reserves
    if (incomeStability === 'Stable') score += 15;
    if (discipline >= 7) score += 20;

    // Cautioned factors
    if (debtLoad === 'E') score -= 35;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 40;
    if (autonomy <= 3) score -= 25;
    if (discipline <= 3) score -= 30;
    if (dependents === 'Yes') score -= 20; // Simplified

    return score;
  },

  /**
   * Score: Create Generational Wealth
   */
  scoreGenerationalPriority(data) {
    let score = 0;
    const { incomeRange, growth, discipline, emergencyFund, debtLoad, longTerm, dependents } = data;

    // Recommended factors
    if (incomeRange === 'E') score += 30;
    if (growth >= 7) score += 35;
    if (discipline >= 7) score += 30;
    if (['D','E'].includes(emergencyFund)) score += 25;
    if (['A','B'].includes(debtLoad)) score += 25;
    if (longTerm >= 7) score += 30;
    if (dependents === 'Yes') score += 20;

    // Cautioned factors
    if (['A','B'].includes(incomeRange)) score -= 40;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (discipline <= 3) score -= 40;
    if (['A','B'].includes(emergencyFund)) score -= 30;
    if (longTerm <= 3) score -= 35;

    return score;
  },

  /**
   * Score: Create Life Balance
   */
  scoreBalancePriority(data) {
    let score = 0;
    const { satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund } = data;

    // Recommended factors (moderate everything)
    if (satisfaction >= 4 && satisfaction <= 6) score += 20;
    if (lifestyle >= 4 && lifestyle <= 6) score += 15;
    if (incomeStability === 'Stable') score += 20;
    if (['B','C'].includes(debtLoad)) score += 10;
    if (emergencyFund === 'C') score += 15;

    // Cautioned factors (extremes)
    if (debtLoad === 'A' || debtLoad === 'E') score -= 25;
    if (satisfaction <= 2) score -= 20;
    if (incomeStability === 'Unstable / irregular') score -= 20;
    if (emergencyFund === 'A') score -= 25;

    return score;
  },

  /**
   * Score: Reclaim Financial Control
   */
  scoreControlPriority(data) {
    let score = 0;
    const { satisfaction, debtLoad, discipline, emergencyFund, incomeStability, impulse } = data;

    // Recommended factors
    if (satisfaction <= 3) score += 40;
    if (['D','E'].includes(debtLoad)) score += 30;
    if (discipline <= 3) score += 30;
    if (['A','B'].includes(emergencyFund)) score += 25;
    if (incomeStability === 'Unstable / irregular') score += 25;
    if (impulse <= 3) score += 20;

    // Cautioned factors
    if (satisfaction >= 7) score -= 30;
    if (debtLoad === 'A') score -= 25;
    if (discipline >= 7) score -= 25;
    if (['D','E'].includes(emergencyFund)) score -= 20;
    if (incomeStability === 'Very stable') score -= 20;

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
   * Calculate priority recommendations based on pre-survey + Tool 2 data
   * Returns array of priorities sorted by recommendation strength
   */
  calculatePriorityRecommendations(preSurveyData, tool2Data) {
    // Derive tiers from pre-survey
    const incomeRange = this.mapIncomeToRange(preSurveyData.monthlyIncome);
    const essentialsRange = this.mapEssentialsToRange(preSurveyData.monthlyEssentials, preSurveyData.monthlyIncome);

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

    // Calculate scores for each priority
    const priorities = [
      {
        name: 'Build Long-Term Wealth',
        score: this.scoreWealthPriority({ discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle }),
        baseAllocation: { M:40, E:25, F:20, J:15 }
      },
      {
        name: 'Get Out of Debt',
        score: this.scoreDebtPriority({ debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle }),
        baseAllocation: { M:15, E:25, F:45, J:15 }
      },
      {
        name: 'Feel Financially Secure',
        score: this.scoreSecurityPriority({ incomeStability, emergencyFund, dependents, satisfaction, stability, impulse, discipline, growth }),
        baseAllocation: { M:25, E:35, F:30, J:10 }
      },
      {
        name: 'Enjoy Life Now',
        score: this.scoreEnjoymentPriority({ satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, impulse, incomeRange, dependents }),
        baseAllocation: { M:20, E:20, F:15, J:45 }
      },
      {
        name: 'Save for a Big Goal',
        score: this.scoreBigGoalPriority({ debtLoad, emergencyFund, discipline, incomeStability }),
        baseAllocation: { M:15, E:25, F:45, J:15 }
      },
      {
        name: 'Stabilize to Survive',
        score: this.scoreSurvivalPriority({ debtLoad, incomeStability, emergencyFund, dependents, satisfaction, incomeRange }),
        baseAllocation: { M:5, E:45, F:40, J:10 }
      },
      {
        name: 'Build or Stabilize a Business',
        score: this.scoreBusinessPriority({ autonomy, growth, emergencyFund, incomeStability, discipline, debtLoad, dependents }),
        baseAllocation: { M:20, E:30, F:35, J:15 }
      },
      {
        name: 'Create Generational Wealth',
        score: this.scoreGenerationalPriority({ incomeRange, growth, discipline, emergencyFund, debtLoad, longTerm, dependents }),
        baseAllocation: { M:45, E:25, F:20, J:10 }
      },
      {
        name: 'Create Life Balance',
        score: this.scoreBalancePriority({ satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund }),
        baseAllocation: { M:15, E:25, F:25, J:35 }
      },
      {
        name: 'Reclaim Financial Control',
        score: this.scoreControlPriority({ satisfaction, debtLoad, discipline, emergencyFund, incomeStability, impulse }),
        baseAllocation: { M:10, E:35, F:40, J:15 }
      }
    ];

    // Add indicators and reasons
    return priorities.map(p => ({
      ...p,
      indicator: p.score >= 50 ? 'recommended' : p.score <= -50 ? 'challenging' : 'available',
      icon: p.score >= 50 ? '⭐' : p.score <= -50 ? '⚠️' : '⚪',
      reason: this.getPriorityReason(p.name, p.indicator)
    })).sort((a, b) => b.score - a.score); // Sort by recommendation strength
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
          <span class="section-icon">🎯</span>
          <span class="section-title">Choose Your Financial Priority</span>
          <span class="toggle-icon">${isCollapsed ? '▼' : '▲'}</span>
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
            You can choose any priority below - the recommendations are guidance, not restrictions.
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
