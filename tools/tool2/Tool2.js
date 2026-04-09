/**
 * Tool2.js - Financial Clarity & Values Assessment
 *
 * Consolidates three v2 tools:
 * - Financial Clarity
 * - False Self
 * - External Validation
 *
 * SCAFFOLDING: Ready for content implementation tomorrow
 * Uses FormUtils for consistent, error-free form handling
 */

const Tool2 = Object.assign({}, FormToolBase, {
  manifest: null, // Will be injected by ToolRegistry

  formConfig: {
    toolId: 'tool2',
    toolName: 'Financial Clarity & Values Assessment',
    pageTitle: 'Financial Clarity & Values',
    totalPages: 5
  },

  /**
   * Route to appropriate page content
   */
  renderPageContent(page, existingData, clientId) {
    switch(page) {
      case 1: return this.renderPage1Content(existingData, clientId);
      case 2: return this.renderPage2Content(existingData, clientId);
      case 3: return this.renderPage3Content(existingData, clientId);
      case 4: return this.renderPage4Content(existingData, clientId);
      case 5: return this.renderPage5Content(existingData, clientId);
      default: return '<p class="error">Invalid page number</p>';
    }
  },

  /**
   * Quick Check-In hook — called by FormToolBase when quickCheckIn param is set
   * Seeds draft with previous completed response data in light mode
   */
  onQuickCheckIn(clientId) {
    try {
      var latestResponse = DataService.getLatestResponse(clientId, 'tool2');
      if (latestResponse && latestResponse.data) {
        var sourceData = latestResponse.data.data || latestResponse.data.formData || {};
        // Force light mode and mark as quick check-in
        sourceData.assessmentMode = 'light';
        sourceData._quickCheckIn = true;
        // Clear edit mode flags (this is a new submission, not an edit)
        delete sourceData._editMode;
        delete sourceData._originalTimestamp;
        delete sourceData._originalResponseId;
        delete sourceData._editStarted;
        // Clear draft metadata
        delete sourceData.lastPage;
        delete sourceData.lastUpdate;
        // Clear any existing drafts and EDIT_DRAFT rows (prevents stale data from overriding)
        DataService.startFreshAttempt(clientId, 'tool2');
        // Seed the draft with previous response data
        DraftService.saveDraft('tool2', clientId, 1, sourceData);
        LogUtils.debug('[Tool2] Quick Check-In seeded from previous response for ' + clientId);
      }
    } catch(e) {
      LogUtils.error('[Tool2] Quick Check-In seed failed: ' + e.message);
    }
  },

  /**
   * PAGE 1: Identity & Foundation
   * Both modes: name, email, studentId, age, employment, businessStage, assessmentMode, holisticScarcity, financialScarcity
   * Full only: marital, dependents, living, moneyRelationship
   */
  renderPage1Content(data, clientId) {
    // Get Tool 1 data for pre-filling identity fields
    let tool1Data = null;
    try {
      const tool1Response = DataService.getLatestResponse(clientId, 'tool1');
      if (tool1Response && tool1Response.data) {
        tool1Data = tool1Response.data.formData || tool1Response.data;
      }
    } catch (e) {
      LogUtils.error('Could not load Tool 1 data for pre-fill: ' + e);
    }

    // Pre-fill values from draft or Tool 1
    const name = data?.name || tool1Data?.name || '';
    const email = data?.email || tool1Data?.email || '';
    const studentId = clientId;

    // Demographics
    const age = data?.age || '';
    const marital = data?.marital || '';
    const dependents = data?.dependents ?? '';
    const living = data?.living || '';
    const employment = data?.employment || '';
    const businessStage = data?.businessStage || '';

    // Parse employment types (multi-select: stored as JSON array or legacy single string)
    var employmentTypes = [];
    try {
      if (typeof employment === 'string' && employment.charAt(0) === '[') {
        employmentTypes = JSON.parse(employment);
      } else if (typeof employment === 'string' && employment) {
        employmentTypes = [employment];
      } else if (Array.isArray(employment)) {
        employmentTypes = employment;
      }
    } catch(e) { employmentTypes = employment ? [employment] : []; }

    // Mode
    const assessmentMode = data?.assessmentMode || 'full';
    const isFullMode = assessmentMode === 'full';

    // Mindset
    const holisticScarcity = data?.holisticScarcity || '';
    const financialScarcity = data?.financialScarcity || '';
    const moneyRelationship = data?.moneyRelationship || '';

    // Show business stage conditionally
    const showBusinessStage = employmentTypes.indexOf('self-employed') !== -1 ||
                               employmentTypes.indexOf('business-owner') !== -1;

    const isQuickCheckIn = data?._quickCheckIn === true;

    return `
      ${isQuickCheckIn ? '<div style="padding: 12px 16px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; margin-bottom: 20px; color: #93c5fd; font-size: 14px; line-height: 1.5;">Quick Check-In: Review your previous answers and update what has changed.</div>' : ''}
      <h2>Identity and Foundation</h2>
      <p class="muted mb-20">Help us understand your life stage and financial perspective</p>

      <!-- Identity (Pre-filled from Tool 1) -->
      <h3 style="margin-top: 30px;">Identity</h3>

      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" name="name" value="${name}" readonly style="background: #f5f5f5; color: #333; cursor: not-allowed;">
        <p class="muted" style="font-size: 12px; margin-top: 5px;">From Tool 1</p>
      </div>

      <div class="form-group">
        <label class="form-label">Email Address *</label>
        <input type="email" name="email" value="${email}" readonly style="background: #f5f5f5; color: #333; cursor: not-allowed;">
        <p class="muted" style="font-size: 12px; margin-top: 5px;">From Tool 1</p>
      </div>

      <div class="form-group">
        <label class="form-label">Student Identifier *</label>
        <input type="text" name="studentId" value="${studentId}" readonly style="background: #f5f5f5; color: #333; cursor: not-allowed;">
        <p class="muted" style="font-size: 12px; margin-top: 5px;">Your unique ID</p>
      </div>

      <!-- Life Stage Context -->
      <h3 style="margin-top: 40px;">Life Stage Context</h3>

      <div class="form-group">
        <label class="form-label">Age *</label>
        <input type="number" name="age" value="${age}" min="18" max="99" required placeholder="Enter your age">
      </div>

      <div class="form-group">
        <label class="form-label">Employment Type (select all that apply) *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Check every source of income that applies to you.</p>
        <input type="hidden" name="employment" id="employmentHidden" value="">
        <div id="employmentCheckboxes" style="display: flex; flex-direction: column; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(173,145,104,0.2);">
            <input type="checkbox" class="employment-cb" value="w2-employee" onchange="updateEmployment()" ${employmentTypes.indexOf('w2-employee') !== -1 ? 'checked' : ''}>
            <span>W-2 Employee</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(173,145,104,0.2);">
            <input type="checkbox" class="employment-cb" value="self-employed" onchange="updateEmployment()" ${employmentTypes.indexOf('self-employed') !== -1 ? 'checked' : ''}>
            <span>Self-Employed / 1099 / Independent Contractor</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(173,145,104,0.2);">
            <input type="checkbox" class="employment-cb" value="business-owner" onchange="updateEmployment()" ${employmentTypes.indexOf('business-owner') !== -1 ? 'checked' : ''}>
            <span>Business Owner</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(173,145,104,0.2);">
            <input type="checkbox" class="employment-cb" value="investor" onchange="updateEmployment()" ${employmentTypes.indexOf('investor') !== -1 ? 'checked' : ''}>
            <span>Investor / Passive Income</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(173,145,104,0.2);">
            <input type="checkbox" class="employment-cb" value="retired" onchange="updateEmployment()" ${employmentTypes.indexOf('retired') !== -1 ? 'checked' : ''}>
            <span>Retired / Pension</span>
          </label>
        </div>
        <div id="employmentError" style="display: none; color: #ef4444; font-size: 13px; margin-top: 8px;">Please select at least one employment type.</div>
      </div>

      <div class="form-group" id="businessStageGroup" style="display: ${showBusinessStage ? 'block' : 'none'};">
        <label class="form-label">Business Stage *</label>
        <select name="businessStage" id="businessStageSelect">
          <option value="">Select stage</option>
          <option value="idea" ${businessStage === 'idea' ? 'selected' : ''}>Idea/planning stage</option>
          <option value="startup" ${businessStage === 'startup' ? 'selected' : ''}>Startup (0-2 years)</option>
          <option value="growing" ${businessStage === 'growing' ? 'selected' : ''}>Growing (scaling up)</option>
          <option value="established" ${businessStage === 'established' ? 'selected' : ''}>Established (stable, predictable)</option>
        </select>
      </div>

      <!-- Full-mode only demographics -->
      <div id="fullModeDemo" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">Marital Status *</label>
          <select name="marital" id="maritalSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select status</option>
            <option value="single" ${marital === 'single' ? 'selected' : ''}>Single</option>
            <option value="married" ${marital === 'married' ? 'selected' : ''}>Married</option>
            <option value="partnered" ${marital === 'partnered' ? 'selected' : ''}>Partnered</option>
            <option value="divorced" ${marital === 'divorced' ? 'selected' : ''}>Divorced</option>
            <option value="widowed" ${marital === 'widowed' ? 'selected' : ''}>Widowed</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Number of Dependents *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Count children, elderly parents, or anyone financially dependent on you. Enter 0 if none.</p>
          <input type="number" name="dependents" id="dependentsInput" value="${dependents}" min="0" max="20" ${isFullMode ? 'required' : ''} placeholder="Enter number (0 if none)">
        </div>

        <div class="form-group">
          <label class="form-label">Living Situation *</label>
          <select name="living" id="livingSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select situation</option>
            <option value="own-home" ${living === 'own-home' ? 'selected' : ''}>Own Home</option>
            <option value="renting" ${living === 'renting' ? 'selected' : ''}>Renting</option>
            <option value="with-family" ${living === 'with-family' ? 'selected' : ''}>With Family</option>
            <option value="other" ${living === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <!-- Assessment Mode Toggle -->
      <div style="margin: 30px 0; padding: 16px; background: #1a1a2e; border-radius: 8px; border: 1px solid #333;">
        <input type="hidden" name="assessmentMode" id="assessmentModeField" value="${assessmentMode}">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong style="color: #e0e0e0;" id="modeLabel">${isFullMode ? 'Full Assessment (~30 min)' : 'Quick Check-In (~15 min)'}</strong>
            <p class="muted" style="font-size: 12px; margin-top: 4px;" id="modeDescription">${isFullMode ? 'Comprehensive assessment with deeper narrative insights' : 'Faster assessment covering essential financial data'}</p>
          </div>
          <button type="button" id="modeToggleBtn" onclick="toggleAssessmentMode()" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #555; background: #2a2a3e; color: #e0e0e0; cursor: pointer; white-space: nowrap;">
            ${isFullMode ? 'Switch to Quick Check-In' : 'Switch to Full Assessment'}
          </button>
        </div>
      </div>

      <!-- Mindset Baseline -->
      <h3 style="margin-top: 40px;">Scarcity and Mindset</h3>
      <p class="muted" style="margin-bottom: 20px;">Answer honestly based on your current experience.</p>

      <div class="form-group">
        <label class="form-label">In general, my overall sense of life feels... *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = deeply scarce, +5 = deeply abundant</p>
        <select name="holisticScarcity" required>
          <option value="">Select a response</option>
          <option value="-5" ${holisticScarcity === '-5' ? 'selected' : ''}>-5: Full scarcity all the time in all areas of my life</option>
          <option value="-4" ${holisticScarcity === '-4' ? 'selected' : ''}>-4: Extreme scarcity in most areas</option>
          <option value="-3" ${holisticScarcity === '-3' ? 'selected' : ''}>-3: Scarcity and fear in most areas</option>
          <option value="-2" ${holisticScarcity === '-2' ? 'selected' : ''}>-2: Scarcity more often than not</option>
          <option value="-1" ${holisticScarcity === '-1' ? 'selected' : ''}>-1: Scarcity but I know it is not real</option>
          <option value="1" ${holisticScarcity === '1' ? 'selected' : ''}>+1: I will be ok</option>
          <option value="2" ${holisticScarcity === '2' ? 'selected' : ''}>+2: Hopeful, moving toward abundance</option>
          <option value="3" ${holisticScarcity === '3' ? 'selected' : ''}>+3: Abundance but sometimes I block it</option>
          <option value="4" ${holisticScarcity === '4' ? 'selected' : ''}>+4: Strong abundance most of the time</option>
          <option value="5" ${holisticScarcity === '5' ? 'selected' : ''}>+5: I experience abundance in all areas all the time</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">When it comes to money specifically, I feel... *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = constant scarcity, +5 = abundant</p>
        <select name="financialScarcity" required>
          <option value="">Select a response</option>
          <option value="-5" ${financialScarcity === '-5' ? 'selected' : ''}>-5: Full financial scarcity and fear all the time</option>
          <option value="-4" ${financialScarcity === '-4' ? 'selected' : ''}>-4: Constant financial anxiety</option>
          <option value="-3" ${financialScarcity === '-3' ? 'selected' : ''}>-3: Financial scarcity based on it being too hard for me</option>
          <option value="-2" ${financialScarcity === '-2' ? 'selected' : ''}>-2: Often feel financial scarcity</option>
          <option value="-1" ${financialScarcity === '-1' ? 'selected' : ''}>-1: Financial scarcity but I know it is not real</option>
          <option value="1" ${financialScarcity === '1' ? 'selected' : ''}>+1: I will be ok financially</option>
          <option value="2" ${financialScarcity === '2' ? 'selected' : ''}>+2: Moving toward financial abundance</option>
          <option value="3" ${financialScarcity === '3' ? 'selected' : ''}>+3: Financial abundance but sometimes I block it</option>
          <option value="4" ${financialScarcity === '4' ? 'selected' : ''}>+4: Strong financial abundance most of the time</option>
          <option value="5" ${financialScarcity === '5' ? 'selected' : ''}>+5: I experience financial abundance all the time</option>
        </select>
      </div>

      <!-- Full-mode only: moneyRelationship -->
      <div id="fullModeMindset" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">My overall relationship with money is... *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = constant struggle, +5 = healthy partnership</p>
          <select name="moneyRelationship" id="moneyRelationshipSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${moneyRelationship === '-5' ? 'selected' : ''}>-5: Constant combat</option>
            <option value="-4" ${moneyRelationship === '-4' ? 'selected' : ''}>-4: Frequent conflict and stress</option>
            <option value="-3" ${moneyRelationship === '-3' ? 'selected' : ''}>-3: Relatively consistent fear</option>
            <option value="-2" ${moneyRelationship === '-2' ? 'selected' : ''}>-2: Often troubled</option>
            <option value="-1" ${moneyRelationship === '-1' ? 'selected' : ''}>-1: Troubled but getting better</option>
            <option value="1" ${moneyRelationship === '1' ? 'selected' : ''}>+1: Ok</option>
            <option value="2" ${moneyRelationship === '2' ? 'selected' : ''}>+2: Generally positive</option>
            <option value="3" ${moneyRelationship === '3' ? 'selected' : ''}>+3: Good</option>
            <option value="4" ${moneyRelationship === '4' ? 'selected' : ''}>+4: Very good</option>
            <option value="5" ${moneyRelationship === '5' ? 'selected' : ''}>+5: Great</option>
          </select>
        </div>
      </div>

      <script>
        // Collect checked employment types into hidden field as JSON array
        function updateEmployment() {
          var checkboxes = document.querySelectorAll('.employment-cb');
          var selected = [];
          for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) selected.push(checkboxes[i].value);
          }
          document.getElementById('employmentHidden').value = JSON.stringify(selected);

          // Show/hide error
          var errorDiv = document.getElementById('employmentError');
          if (selected.length === 0) {
            errorDiv.style.display = 'block';
          } else {
            errorDiv.style.display = 'none';
          }

          // Toggle business stage based on selection
          toggleBusinessStage(selected);
        }

        // Toggle business stage visibility based on employment selection
        function toggleBusinessStage(selected) {
          if (!selected) {
            var checkboxes = document.querySelectorAll('.employment-cb');
            selected = [];
            for (var i = 0; i < checkboxes.length; i++) {
              if (checkboxes[i].checked) selected.push(checkboxes[i].value);
            }
          }
          var businessStageGroup = document.getElementById('businessStageGroup');
          var businessStageSelect = document.getElementById('businessStageSelect');

          var hasBusinessInvolvement = selected.indexOf('self-employed') !== -1 ||
                                        selected.indexOf('business-owner') !== -1;

          if (hasBusinessInvolvement) {
            businessStageGroup.style.display = 'block';
            businessStageSelect.setAttribute('required', 'required');
          } else {
            businessStageGroup.style.display = 'none';
            businessStageSelect.removeAttribute('required');
            businessStageSelect.value = '';
          }
        }

        // Toggle assessment mode (full vs light)
        function toggleAssessmentMode() {
          var field = document.getElementById('assessmentModeField');
          var label = document.getElementById('modeLabel');
          var desc = document.getElementById('modeDescription');
          var btn = document.getElementById('modeToggleBtn');
          var fullDemo = document.getElementById('fullModeDemo');
          var fullMindset = document.getElementById('fullModeMindset');

          // Full-mode-only form elements
          var maritalSelect = document.getElementById('maritalSelect');
          var dependentsInput = document.getElementById('dependentsInput');
          var livingSelect = document.getElementById('livingSelect');
          var moneyRelSelect = document.getElementById('moneyRelationshipSelect');

          if (field.value === 'full') {
            field.value = 'light';
            label.textContent = 'Quick Check-In (~15 min)';
            desc.textContent = 'Faster assessment covering essential financial data';
            btn.textContent = 'Switch to Full Assessment';
            fullDemo.style.display = 'none';
            fullMindset.style.display = 'none';
            // Remove required from hidden full-mode fields
            if (maritalSelect) maritalSelect.removeAttribute('required');
            if (dependentsInput) dependentsInput.removeAttribute('required');
            if (livingSelect) livingSelect.removeAttribute('required');
            if (moneyRelSelect) moneyRelSelect.removeAttribute('required');
          } else {
            field.value = 'full';
            label.textContent = 'Full Assessment (~30 min)';
            desc.textContent = 'Comprehensive assessment with deeper narrative insights';
            btn.textContent = 'Switch to Quick Check-In';
            fullDemo.style.display = 'block';
            fullMindset.style.display = 'block';
            // Re-add required on full-mode fields
            if (maritalSelect) maritalSelect.setAttribute('required', 'required');
            if (dependentsInput) dependentsInput.setAttribute('required', 'required');
            if (livingSelect) livingSelect.setAttribute('required', 'required');
            if (moneyRelSelect) moneyRelSelect.setAttribute('required', 'required');
          }
        }

        // Run on page load to set initial state
        document.addEventListener('DOMContentLoaded', function() {
          updateEmployment();
        });
      </script>
    `;
  },

  /**
   * PAGE 2: Money Flow — Objective income/spending + subjective scales
   */
  renderPage2Content(data, clientId) {
    const mode = data.assessmentMode || 'full';
    const isFullMode = mode === 'full';

    // Objective fields
    const grossAnnualIncome = data.grossAnnualIncome || '';
    const monthlyTakeHome = data.monthlyTakeHome || '';
    const monthlySpending = data.monthlySpending || '';

    // Subjective fields
    const incomeClarity = data.incomeClarity || '';
    const spendingClarity = data.spendingClarity || '';
    const moneyFlowStress = data.moneyFlowStress || '';

    // Free-text
    const incomeAndSpendingNarrative = data.incomeAndSpendingNarrative || '';
    const incomeNarrative = data.incomeNarrative || incomeAndSpendingNarrative;
    const spendingNarrative = data.spendingNarrative || '';

    return `
      <h2>Money Flow</h2>
      <p class="muted mb-20">Your income and spending reality</p>

      <input type="hidden" name="assessmentMode" value="${mode}">

      <!-- Objective Financial Data (both modes) -->
      <h3 style="margin-top: 30px;">Your Numbers</h3>

      <div class="form-group">
        <label class="form-label">Gross Annual Income (before taxes) *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Your total yearly income from all sources before any deductions.</p>
        <input type="number" name="grossAnnualIncome" value="${grossAnnualIncome}" min="0" required placeholder="Enter dollar amount">
      </div>

      <div class="form-group">
        <label class="form-label">Monthly Take-Home Pay (after taxes) *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">What actually hits your personal bank account each month after taxes and deductions. If you are a business owner, include only personal accounts \u2014 money in your business accounts belongs to the business, not to you personally. If you keep personal funds in a business account, that pattern is something this assessment is designed to surface.</p>
        <input type="number" name="monthlyTakeHome" value="${monthlyTakeHome}" min="0" required placeholder="Enter dollar amount">
      </div>

      <div class="form-group">
        <label class="form-label">Estimated Monthly Total Spending (all expenses combined) *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Your best estimate of everything you spend in a typical month.</p>
        <input type="number" name="monthlySpending" value="${monthlySpending}" min="0" required placeholder="Enter dollar amount">
      </div>

      <!-- Subjective Scales -->
      <h3 style="margin-top: 40px;">Your Perception</h3>

      <div class="form-group">
        <label class="form-label">How clear are you on your total income picture? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">This includes all sources: salary, side income, investment returns, rental income, and any other money coming in. -5 = no idea, +5 = fully clear</p>
        <select name="incomeClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${incomeClarity === '-5' ? 'selected' : ''}>-5: No idea what I earn</option>
          <option value="-4" ${incomeClarity === '-4' ? 'selected' : ''}>-4: Very unclear</option>
          <option value="-3" ${incomeClarity === '-3' ? 'selected' : ''}>-3: Mostly unclear</option>
          <option value="-2" ${incomeClarity === '-2' ? 'selected' : ''}>-2: Vague awareness</option>
          <option value="-1" ${incomeClarity === '-1' ? 'selected' : ''}>-1: Rough idea only</option>
          <option value="1" ${incomeClarity === '1' ? 'selected' : ''}>+1: Somewhat clear</option>
          <option value="2" ${incomeClarity === '2' ? 'selected' : ''}>+2: Fairly clear</option>
          <option value="3" ${incomeClarity === '3' ? 'selected' : ''}>+3: Clear</option>
          <option value="4" ${incomeClarity === '4' ? 'selected' : ''}>+4: Very clear</option>
          <option value="5" ${incomeClarity === '5' ? 'selected' : ''}>+5: Fully clear, track everything</option>
        </select>
      </div>

      <div id="fullModeP2Scales" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">How clear are you on where your money goes each month? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = no idea, +5 = fully clear</p>
          <select name="spendingClarity" id="spendingClaritySelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${spendingClarity === '-5' ? 'selected' : ''}>-5: Complete avoidance</option>
            <option value="-4" ${spendingClarity === '-4' ? 'selected' : ''}>-4: Rarely aware</option>
            <option value="-3" ${spendingClarity === '-3' ? 'selected' : ''}>-3: Only notice problems</option>
            <option value="-2" ${spendingClarity === '-2' ? 'selected' : ''}>-2: Vague awareness</option>
            <option value="-1" ${spendingClarity === '-1' ? 'selected' : ''}>-1: General sense only</option>
            <option value="1" ${spendingClarity === '1' ? 'selected' : ''}>+1: Loose tracking</option>
            <option value="2" ${spendingClarity === '2' ? 'selected' : ''}>+2: Track by categories</option>
            <option value="3" ${spendingClarity === '3' ? 'selected' : ''}>+3: Detailed monthly review</option>
            <option value="4" ${spendingClarity === '4' ? 'selected' : ''}>+4: Specific and consistent tracking</option>
            <option value="5" ${spendingClarity === '5' ? 'selected' : ''}>+5: Complete visibility</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">How stressed do you feel about your income and spending? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = extremely stressed, +5 = completely at ease</p>
          <select name="moneyFlowStress" id="moneyFlowStressSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${moneyFlowStress === '-5' ? 'selected' : ''}>-5: Constant anxiety</option>
            <option value="-4" ${moneyFlowStress === '-4' ? 'selected' : ''}>-4: High stress</option>
            <option value="-3" ${moneyFlowStress === '-3' ? 'selected' : ''}>-3: Frequently stressed</option>
            <option value="-2" ${moneyFlowStress === '-2' ? 'selected' : ''}>-2: Regular stress</option>
            <option value="-1" ${moneyFlowStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
            <option value="1" ${moneyFlowStress === '1' ? 'selected' : ''}>+1: Generally calm</option>
            <option value="2" ${moneyFlowStress === '2' ? 'selected' : ''}>+2: Mostly confident</option>
            <option value="3" ${moneyFlowStress === '3' ? 'selected' : ''}>+3: Confident</option>
            <option value="4" ${moneyFlowStress === '4' ? 'selected' : ''}>+4: Very confident</option>
            <option value="5" ${moneyFlowStress === '5' ? 'selected' : ''}>+5: Completely at ease</option>
          </select>
        </div>

        <!-- Free-text (full only) -->
        <div class="form-group">
          <label class="form-label">Describe your primary income sources. *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Include salary, business income, side income, investment returns, or any other sources.</p>
          <textarea name="incomeNarrative" id="incomeNarrativeField" rows="3" ${isFullMode ? 'required' : ''} placeholder="Share your thoughts...">${incomeNarrative}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">What do you consider your biggest or most wasteful spending areas? *</label>
          <textarea name="spendingNarrative" id="spendingNarrativeField" rows="3" ${isFullMode ? 'required' : ''} placeholder="Share your thoughts...">${spendingNarrative}</textarea>
        </div>
      </div>
    `;
  },

  /**
   * PAGE 3: Obligations & Security — Objective debt/emergency + subjective scales
   */
  renderPage3Content(data, clientId) {
    const mode = data.assessmentMode || 'full';
    const isFullMode = mode === 'full';

    // Objective fields
    const totalDebtBalance = data.totalDebtBalance || '';
    const monthlyDebtPayments = data.monthlyDebtPayments || '';
    const emergencyFundBalance = data.emergencyFundBalance || '';

    // Subjective fields
    const debtClarity = data.debtClarity || '';
    const debtTrending = data.debtTrending || '';
    const obligationsStress = data.obligationsStress || '';

    // Free-text
    const debtNarrative = data.debtNarrative || '';

    return `
      <h2>Obligations and Security</h2>
      <p class="muted mb-20">Your debt and emergency fund reality</p>

      <input type="hidden" name="assessmentMode" value="${mode}">

      <!-- Objective Financial Data (both modes) -->
      <h3 style="margin-top: 30px;">Your Numbers</h3>

      <div class="form-group">
        <label class="form-label">Total Outstanding Debt Balance *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Do not include your mortgage. Include credit cards, student loans, car loans, personal loans, medical debt, etc. Enter 0 if none.</p>
        <input type="number" name="totalDebtBalance" value="${totalDebtBalance}" min="0" required placeholder="Enter dollar amount (0 if none)">
      </div>

      <div class="form-group">
        <label class="form-label">Monthly Minimum Debt Payments *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Do not include mortgage payment. Enter 0 if no debt payments.</p>
        <input type="number" name="monthlyDebtPayments" value="${monthlyDebtPayments}" min="0" required placeholder="Enter dollar amount (0 if none)">
      </div>

      <div class="form-group">
        <label class="form-label">Emergency Fund Balance *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Money set aside specifically for unexpected expenses (car repair, medical bill, job loss) that you would replace immediately after spending. This is different from liquid savings on the next page, which can be used for anything. Enter 0 if none.</p>
        <input type="number" name="emergencyFundBalance" value="${emergencyFundBalance}" min="0" required placeholder="Enter dollar amount (0 if none)">
      </div>

      <!-- Subjective Scales -->
      <h3 style="margin-top: 40px;">Your Perception</h3>

      <div class="form-group">
        <label class="form-label">How clear are you on your total debt situation? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = no idea, +5 = fully clear</p>
        <select name="debtClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${debtClarity === '-5' ? 'selected' : ''}>-5: Complete avoidance</option>
          <option value="-4" ${debtClarity === '-4' ? 'selected' : ''}>-4: Major avoidance</option>
          <option value="-3" ${debtClarity === '-3' ? 'selected' : ''}>-3: Only know when denied credit</option>
          <option value="-2" ${debtClarity === '-2' ? 'selected' : ''}>-2: Rough idea</option>
          <option value="-1" ${debtClarity === '-1' ? 'selected' : ''}>-1: Vague awareness</option>
          <option value="1" ${debtClarity === '1' ? 'selected' : ''}>+1: Basic tracking</option>
          <option value="2" ${debtClarity === '2' ? 'selected' : ''}>+2: Organized, aware of totals</option>
          <option value="3" ${debtClarity === '3' ? 'selected' : ''}>+3: Reviewed monthly</option>
          <option value="4" ${debtClarity === '4' ? 'selected' : ''}>+4: Strategic with payoff plan</option>
          <option value="5" ${debtClarity === '5' ? 'selected' : ''}>+5: Complete clarity</option>
        </select>
      </div>

      <div id="fullModeP3Scales" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">Your debt balance is currently... *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = growing quickly, +5 = shrinking quickly</p>
          <select name="debtTrending" id="debtTrendingSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${debtTrending === '-5' ? 'selected' : ''}>-5: Rapidly increasing</option>
            <option value="-4" ${debtTrending === '-4' ? 'selected' : ''}>-4: Steadily increasing</option>
            <option value="-3" ${debtTrending === '-3' ? 'selected' : ''}>-3: Slowly increasing</option>
            <option value="-2" ${debtTrending === '-2' ? 'selected' : ''}>-2: Mostly stagnant</option>
            <option value="-1" ${debtTrending === '-1' ? 'selected' : ''}>-1: Stagnant for months</option>
            <option value="1" ${debtTrending === '1' ? 'selected' : ''}>+1: Slowly decreasing</option>
            <option value="2" ${debtTrending === '2' ? 'selected' : ''}>+2: Steadily decreasing</option>
            <option value="3" ${debtTrending === '3' ? 'selected' : ''}>+3: Rapidly decreasing</option>
            <option value="4" ${debtTrending === '4' ? 'selected' : ''}>+4: Nearly eliminated</option>
            <option value="5" ${debtTrending === '5' ? 'selected' : ''}>+5: Zero debt or debt-free</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">How stressed do you feel about your debt and emergency fund? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = extremely stressed, +5 = completely at ease</p>
          <select name="obligationsStress" id="obligationsStressSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${obligationsStress === '-5' ? 'selected' : ''}>-5: Crushing anxiety</option>
            <option value="-4" ${obligationsStress === '-4' ? 'selected' : ''}>-4: Severe stress</option>
            <option value="-3" ${obligationsStress === '-3' ? 'selected' : ''}>-3: High stress</option>
            <option value="-2" ${obligationsStress === '-2' ? 'selected' : ''}>-2: Regular stress</option>
            <option value="-1" ${obligationsStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
            <option value="1" ${obligationsStress === '1' ? 'selected' : ''}>+1: Aware but not stressed</option>
            <option value="2" ${obligationsStress === '2' ? 'selected' : ''}>+2: Comfortable</option>
            <option value="3" ${obligationsStress === '3' ? 'selected' : ''}>+3: Confident</option>
            <option value="4" ${obligationsStress === '4' ? 'selected' : ''}>+4: Minimal stress</option>
            <option value="5" ${obligationsStress === '5' ? 'selected' : ''}>+5: No stress at all</option>
          </select>
        </div>

        <!-- Free-text (full only) -->
        <div class="form-group">
          <label class="form-label">List your significant debts (type and approximate balance). Describe your current strategy for managing them. *</label>
          <textarea name="debtNarrative" id="debtNarrativeField" rows="4" ${isFullMode ? 'required' : ''} placeholder="Share your thoughts...">${debtNarrative}</textarea>
        </div>
      </div>
    `;
  },

  /**
   * PAGE 4: Liquidity & Growth — Objective savings/retirement + subjective scales
   */
  renderPage4Content(data, clientId) {
    const mode = data.assessmentMode || 'full';
    const isFullMode = mode === 'full';

    // Objective fields
    const liquidSavings = data.liquidSavings || '';
    const totalRetirementBalance = data.totalRetirementBalance || '';
    const monthlyRetirementContribution = data.monthlyRetirementContribution || '';

    // Subjective fields — liquidity
    const savingsClarity = data.savingsClarity || '';
    const savingsStress = data.savingsStress || '';
    // Subjective fields — growth
    const investmentClarity = data.investmentClarity || '';
    const retirementConfidence = data.retirementConfidence || '';
    const retirementFunding = data.retirementFunding || '';
    const growthStress = data.growthStress || '';

    // Free-text
    const savingsGrowthNarrative = data.savingsGrowthNarrative || '';

    return `
      <h2>Liquidity and Growth</h2>
      <p class="muted mb-20">Your savings, investments, and retirement reality</p>

      <input type="hidden" name="assessmentMode" value="${mode}">

      <!-- Objective Financial Data (both modes) -->
      <h3 style="margin-top: 30px;">Your Numbers</h3>

      <div class="form-group">
        <label class="form-label">Liquid Savings beyond your emergency fund *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Accessible within 1-2 days. Do not include emergency fund or retirement accounts. Enter 0 if none.</p>
        <input type="number" name="liquidSavings" value="${liquidSavings}" min="0" required placeholder="Enter dollar amount (0 if none)">
      </div>

      <div class="form-group">
        <label class="form-label">Total Retirement Account Balance *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">All accounts combined: 401k, IRA, Roth IRA, etc. Enter 0 if none.</p>
        <input type="number" name="totalRetirementBalance" value="${totalRetirementBalance}" min="0" required placeholder="Enter dollar amount (0 if none)">
      </div>

      <div class="form-group">
        <label class="form-label">Total Monthly Retirement Contributions *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">All accounts combined. Enter 0 if not contributing.</p>
        <input type="number" name="monthlyRetirementContribution" value="${monthlyRetirementContribution}" min="0" required placeholder="Enter dollar amount (0 if none)">
      </div>

      <!-- Subjective Scales — Liquidity -->
      <h3 style="margin-top: 40px;">Your Perception — Savings</h3>

      <div class="form-group">
        <label class="form-label">How clear are you on your savings position? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = no idea, +5 = fully clear</p>
        <select name="savingsClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${savingsClarity === '-5' ? 'selected' : ''}>-5: No idea</option>
          <option value="-4" ${savingsClarity === '-4' ? 'selected' : ''}>-4: Very unclear</option>
          <option value="-3" ${savingsClarity === '-3' ? 'selected' : ''}>-3: Unclear</option>
          <option value="-2" ${savingsClarity === '-2' ? 'selected' : ''}>-2: Know approximate balance</option>
          <option value="-1" ${savingsClarity === '-1' ? 'selected' : ''}>-1: Separate but do not track</option>
          <option value="1" ${savingsClarity === '1' ? 'selected' : ''}>+1: Track balance</option>
          <option value="2" ${savingsClarity === '2' ? 'selected' : ''}>+2: Track regularly</option>
          <option value="3" ${savingsClarity === '3' ? 'selected' : ''}>+3: Clear purpose and tracking</option>
          <option value="4" ${savingsClarity === '4' ? 'selected' : ''}>+4: Monthly planning, specific goals</option>
          <option value="5" ${savingsClarity === '5' ? 'selected' : ''}>+5: Strategic allocation, optimized</option>
        </select>
      </div>

      <div id="fullModeP4Liquidity" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">How stressed do you feel about your savings reserves? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = extremely stressed, +5 = completely at ease</p>
          <select name="savingsStress" id="savingsStressSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${savingsStress === '-5' ? 'selected' : ''}>-5: Constant anxiety</option>
            <option value="-4" ${savingsStress === '-4' ? 'selected' : ''}>-4: High stress</option>
            <option value="-3" ${savingsStress === '-3' ? 'selected' : ''}>-3: Significant worry</option>
            <option value="-2" ${savingsStress === '-2' ? 'selected' : ''}>-2: Regular concern</option>
            <option value="-1" ${savingsStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
            <option value="1" ${savingsStress === '1' ? 'selected' : ''}>+1: Generally comfortable</option>
            <option value="2" ${savingsStress === '2' ? 'selected' : ''}>+2: Mostly confident</option>
            <option value="3" ${savingsStress === '3' ? 'selected' : ''}>+3: Confident</option>
            <option value="4" ${savingsStress === '4' ? 'selected' : ''}>+4: Very confident</option>
            <option value="5" ${savingsStress === '5' ? 'selected' : ''}>+5: Completely at ease</option>
          </select>
        </div>
      </div>

      <!-- Subjective Scales — Growth -->
      <h3 style="margin-top: 40px;">Your Perception — Investments and Retirement</h3>

      <div class="form-group">
        <label class="form-label">How clear are you on your investments and retirement picture? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = no idea, +5 = fully clear</p>
        <select name="investmentClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${investmentClarity === '-5' ? 'selected' : ''}>-5: No idea</option>
          <option value="-4" ${investmentClarity === '-4' ? 'selected' : ''}>-4: Very unclear</option>
          <option value="-3" ${investmentClarity === '-3' ? 'selected' : ''}>-3: Know amount, nothing else</option>
          <option value="-2" ${investmentClarity === '-2' ? 'selected' : ''}>-2: Vague awareness</option>
          <option value="-1" ${investmentClarity === '-1' ? 'selected' : ''}>-1: Annual review at best</option>
          <option value="1" ${investmentClarity === '1' ? 'selected' : ''}>+1: Semi-annual reviews</option>
          <option value="2" ${investmentClarity === '2' ? 'selected' : ''}>+2: Quarterly check-ins</option>
          <option value="3" ${investmentClarity === '3' ? 'selected' : ''}>+3: Monthly tracking</option>
          <option value="4" ${investmentClarity === '4' ? 'selected' : ''}>+4: Regular monitoring</option>
          <option value="5" ${investmentClarity === '5' ? 'selected' : ''}>+5: Complete clarity, optimized</option>
        </select>
      </div>

      <div id="fullModeP4Growth" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">How confident do you feel about your retirement trajectory? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = not at all confident, +5 = very confident</p>
          <select name="retirementConfidence" id="retirementConfidenceSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${retirementConfidence === '-5' ? 'selected' : ''}>-5: No confidence</option>
            <option value="-4" ${retirementConfidence === '-4' ? 'selected' : ''}>-4: Very low confidence</option>
            <option value="-3" ${retirementConfidence === '-3' ? 'selected' : ''}>-3: Hoping for luck</option>
            <option value="-2" ${retirementConfidence === '-2' ? 'selected' : ''}>-2: Uncertain</option>
            <option value="-1" ${retirementConfidence === '-1' ? 'selected' : ''}>-1: Trying but unsure</option>
            <option value="1" ${retirementConfidence === '1' ? 'selected' : ''}>+1: Slow progress</option>
            <option value="2" ${retirementConfidence === '2' ? 'selected' : ''}>+2: Decent progress</option>
            <option value="3" ${retirementConfidence === '3' ? 'selected' : ''}>+3: On track</option>
            <option value="4" ${retirementConfidence === '4' ? 'selected' : ''}>+4: Very confident</option>
            <option value="5" ${retirementConfidence === '5' ? 'selected' : ''}>+5: Retirement secured</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">My retirement savings contributions are... *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = not contributing at all, +5 = fully on track</p>
          <select name="retirementFunding" id="retirementFundingSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${retirementFunding === '-5' ? 'selected' : ''}>-5: No contributions</option>
            <option value="-4" ${retirementFunding === '-4' ? 'selected' : ''}>-4: Stopped contributing</option>
            <option value="-3" ${retirementFunding === '-3' ? 'selected' : ''}>-3: Very sporadic</option>
            <option value="-2" ${retirementFunding === '-2' ? 'selected' : ''}>-2: Well below capacity</option>
            <option value="-1" ${retirementFunding === '-1' ? 'selected' : ''}>-1: Inconsistent</option>
            <option value="1" ${retirementFunding === '1' ? 'selected' : ''}>+1: Regular, not full</option>
            <option value="2" ${retirementFunding === '2' ? 'selected' : ''}>+2: To employer match</option>
            <option value="3" ${retirementFunding === '3' ? 'selected' : ''}>+3: Beyond employer match</option>
            <option value="4" ${retirementFunding === '4' ? 'selected' : ''}>+4: Near-maximum</option>
            <option value="5" ${retirementFunding === '5' ? 'selected' : ''}>+5: Maxed out all accounts</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">How stressed do you feel about your long-term financial growth? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = extremely stressed, +5 = completely at ease</p>
          <select name="growthStress" id="growthStressSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${growthStress === '-5' ? 'selected' : ''}>-5: Constant anxiety</option>
            <option value="-4" ${growthStress === '-4' ? 'selected' : ''}>-4: High stress</option>
            <option value="-3" ${growthStress === '-3' ? 'selected' : ''}>-3: Significant worry</option>
            <option value="-2" ${growthStress === '-2' ? 'selected' : ''}>-2: Regular concern</option>
            <option value="-1" ${growthStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
            <option value="1" ${growthStress === '1' ? 'selected' : ''}>+1: Generally comfortable</option>
            <option value="2" ${growthStress === '2' ? 'selected' : ''}>+2: Mostly confident</option>
            <option value="3" ${growthStress === '3' ? 'selected' : ''}>+3: Confident</option>
            <option value="4" ${growthStress === '4' ? 'selected' : ''}>+4: Very confident</option>
            <option value="5" ${growthStress === '5' ? 'selected' : ''}>+5: Completely at ease</option>
          </select>
        </div>

        <!-- Free-text (full only) -->
        <div class="form-group">
          <label class="form-label">Describe your current investment or retirement vehicles and your overall approach to building long-term wealth. *</label>
          <textarea name="savingsGrowthNarrative" id="savingsGrowthNarrativeField" rows="4" ${isFullMode ? 'required' : ''} placeholder="Share your thoughts...">${savingsGrowthNarrative}</textarea>
        </div>
      </div>
    `;
  },

  /**
   * PAGE 5: Protection & Reflection — Insurance checkboxes + subjective scales + free-text + adaptive
   */
  renderPage5Content(data, clientId) {
    const mode = data.assessmentMode || 'full';
    const isFullMode = mode === 'full';

    // Objective fields — insurance checkboxes
    const hasHealthInsurance = data.hasHealthInsurance === 'true' || data.hasHealthInsurance === true;
    const hasLifeInsurance = data.hasLifeInsurance === 'true' || data.hasLifeInsurance === true;
    const hasDisabilityInsurance = data.hasDisabilityInsurance === 'true' || data.hasDisabilityInsurance === true;
    const hasPropertyInsurance = data.hasPropertyInsurance === 'true' || data.hasPropertyInsurance === true;

    // Subjective fields
    const insuranceClarity = data.insuranceClarity || '';
    const insuranceConfidence = data.insuranceConfidence || '';
    const protectionStress = data.protectionStress || '';

    // Free-text (both modes)
    const financialEmotionsNarrative = data.financialEmotionsNarrative || '';

    // Adaptive questions (full mode only)
    const tool1Data = this.getTool1TraumaData(clientId);
    const topTrauma = tool1Data.topTrauma || 'FSV';
    const adaptiveScale = data.adaptiveScale || '';
    const adaptiveImpact = data.adaptiveImpact || '';

    return `
      <h2>Protection and Reflection</h2>
      <p class="muted mb-20">Your insurance coverage and overall financial reflection</p>

      <input type="hidden" name="assessmentMode" value="${mode}">

      <!-- Objective Financial Data — Insurance checkboxes (both modes) -->
      <h3 style="margin-top: 30px;">Your Coverage</h3>

      <div class="form-group">
        <label class="form-label">Which of the following do you currently have active coverage for? (select all that apply)</label>
        <div style="margin-top: 10px;">
          <label style="display: block; margin-bottom: 12px; cursor: pointer;">
            <input type="checkbox" name="hasHealthInsurance" value="true" ${hasHealthInsurance ? 'checked' : ''} style="margin-right: 8px;">
            Health Insurance
          </label>
          <label style="display: block; margin-bottom: 12px; cursor: pointer;">
            <input type="checkbox" name="hasLifeInsurance" value="true" ${hasLifeInsurance ? 'checked' : ''} style="margin-right: 8px;">
            Life Insurance
          </label>
          <label style="display: block; margin-bottom: 12px; cursor: pointer;">
            <input type="checkbox" name="hasDisabilityInsurance" value="true" ${hasDisabilityInsurance ? 'checked' : ''} style="margin-right: 8px;">
            Disability Insurance (short or long-term)
          </label>
          <label style="display: block; margin-bottom: 12px; cursor: pointer;">
            <input type="checkbox" name="hasPropertyInsurance" value="true" ${hasPropertyInsurance ? 'checked' : ''} style="margin-right: 8px;">
            Property and/or Auto Insurance
          </label>
        </div>
      </div>

      <!-- Subjective Scales -->
      <h3 style="margin-top: 40px;">Your Perception</h3>

      <div class="form-group">
        <label class="form-label">How clear are you on your insurance coverage? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = no idea, +5 = fully clear</p>
        <select name="insuranceClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${insuranceClarity === '-5' ? 'selected' : ''}>-5: No idea what I have</option>
          <option value="-4" ${insuranceClarity === '-4' ? 'selected' : ''}>-4: Know I have something</option>
          <option value="-3" ${insuranceClarity === '-3' ? 'selected' : ''}>-3: Do not know details</option>
          <option value="-2" ${insuranceClarity === '-2' ? 'selected' : ''}>-2: Know basic types</option>
          <option value="-1" ${insuranceClarity === '-1' ? 'selected' : ''}>-1: Know coverage amounts</option>
          <option value="1" ${insuranceClarity === '1' ? 'selected' : ''}>+1: Know coverage and deductibles</option>
          <option value="2" ${insuranceClarity === '2' ? 'selected' : ''}>+2: Know details and exclusions</option>
          <option value="3" ${insuranceClarity === '3' ? 'selected' : ''}>+3: Understand all policies</option>
          <option value="4" ${insuranceClarity === '4' ? 'selected' : ''}>+4: Regularly review and optimize</option>
          <option value="5" ${insuranceClarity === '5' ? 'selected' : ''}>+5: Complete clarity</option>
        </select>
      </div>

      <div id="fullModeP5Scales" style="display: ${isFullMode ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label">How adequate do you feel your overall financial protection is? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = very exposed, +5 = fully protected</p>
          <select name="insuranceConfidence" id="insuranceConfidenceSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${insuranceConfidence === '-5' ? 'selected' : ''}>-5: Very exposed</option>
            <option value="-4" ${insuranceConfidence === '-4' ? 'selected' : ''}>-4: Major gaps</option>
            <option value="-3" ${insuranceConfidence === '-3' ? 'selected' : ''}>-3: Likely underinsured</option>
            <option value="-2" ${insuranceConfidence === '-2' ? 'selected' : ''}>-2: Uncertain</option>
            <option value="-1" ${insuranceConfidence === '-1' ? 'selected' : ''}>-1: Hope I am covered</option>
            <option value="1" ${insuranceConfidence === '1' ? 'selected' : ''}>+1: Probably okay</option>
            <option value="2" ${insuranceConfidence === '2' ? 'selected' : ''}>+2: Generally confident</option>
            <option value="3" ${insuranceConfidence === '3' ? 'selected' : ''}>+3: Covered for most events</option>
            <option value="4" ${insuranceConfidence === '4' ? 'selected' : ''}>+4: Very confident</option>
            <option value="5" ${insuranceConfidence === '5' ? 'selected' : ''}>+5: Fully protected</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">How stressed do you feel about your financial protection? *</label>
          <p class="muted" style="font-size: 13px; margin-bottom: 10px;">-5 = extremely stressed, +5 = completely at ease</p>
          <select name="protectionStress" id="protectionStressSelect" ${isFullMode ? 'required' : ''}>
            <option value="">Select a response</option>
            <option value="-5" ${protectionStress === '-5' ? 'selected' : ''}>-5: Constant fear</option>
            <option value="-4" ${protectionStress === '-4' ? 'selected' : ''}>-4: High anxiety</option>
            <option value="-3" ${protectionStress === '-3' ? 'selected' : ''}>-3: Significant worry</option>
            <option value="-2" ${protectionStress === '-2' ? 'selected' : ''}>-2: Regular concern</option>
            <option value="-1" ${protectionStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
            <option value="1" ${protectionStress === '1' ? 'selected' : ''}>+1: Generally feel protected</option>
            <option value="2" ${protectionStress === '2' ? 'selected' : ''}>+2: Mostly confident</option>
            <option value="3" ${protectionStress === '3' ? 'selected' : ''}>+3: Confident</option>
            <option value="4" ${protectionStress === '4' ? 'selected' : ''}>+4: Very confident</option>
            <option value="5" ${protectionStress === '5' ? 'selected' : ''}>+5: Completely at ease</option>
          </select>
        </div>
      </div>

      <!-- Free-text (both modes) -->
      <h3 style="margin-top: 40px;">Overall Reflection</h3>

      <div class="form-group">
        <label class="form-label">How do you feel about your financial situation overall? What is your biggest financial concern right now? *</label>
        <textarea name="financialEmotionsNarrative" rows="4" required placeholder="Share your thoughts...">${financialEmotionsNarrative}</textarea>
      </div>

      <!-- Adaptive Trauma Questions (full mode only) -->
      <div id="fullModeP5Adaptive" style="display: ${isFullMode ? 'block' : 'none'};">
        <h3 style="margin-top: 40px;">Deeper Understanding</h3>
        <p class="muted" style="font-size: 13px; margin-bottom: 20px;">Based on your Financial Trauma Assessment, these questions help us understand your specific patterns.</p>

        ${this.renderAdaptiveQuestions(topTrauma, adaptiveScale, adaptiveImpact, isFullMode)}
      </div>

      <script>
        // Fire GPT background analysis after page 5 loads (non-blocking)
        // Small delay ensures google.script.run is available after document.write()
        setTimeout(function() {
          try {
            console.log('Triggering background GPT analysis...');
            google.script.run
              .withSuccessHandler(function() { console.log('GPT background analysis complete'); })
              .withFailureHandler(function(err) { console.log('GPT background failed (non-blocking): ' + (err && err.message ? err.message : err)); })
              .triggerTool2BackgroundGPT('${clientId}');
          } catch(e) {
            console.log('GPT trigger error (non-blocking): ' + e);
          }
        }, 1000);
      </script>
    `;
  },

  /**
   * Helper: Get Tool 1 trauma data to determine top trauma category
   */
  getTool1TraumaData(clientId) {
    try {
      // Query Tool 1 responses for this client (uses cache)
      const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);
      if (!data) return null;
      const headers = data[0];

      // Find Tool 1 response for this client (most recent, Is_Latest = true)
      const toolIdCol = headers.indexOf('Tool_ID');
      const clientCol = headers.indexOf('Client_ID');
      const isLatestCol = headers.indexOf('Is_Latest');
      const responseCol = headers.indexOf('Data');  // Column is named 'Data', not 'Response_Data'

      LogUtils.debug(`Searching for Tool1 data for client: ${clientId}`);
      
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientCol] === clientId) {
          LogUtils.debug(`Row ${i+1}: Tool_ID=${data[i][toolIdCol]}, Is_Latest=${data[i][isLatestCol]}`);
        }
        
        if (data[i][toolIdCol] === 'tool1' &&
            data[i][clientCol] === clientId &&
            data[i][isLatestCol] === true) {

          // Check if response data exists
          const rawResponseData = data[i][responseCol];
          LogUtils.debug(`Tool1 row found. Response_Data type: ${typeof rawResponseData}, length: ${rawResponseData ? String(rawResponseData).length : 0}`);
          
          if (!rawResponseData || rawResponseData === 'undefined' || rawResponseData === '' || rawResponseData === null) {
            LogUtils.debug(`Tool1 row found but Response_Data is empty/null/undefined for ${clientId}`);
            continue;
          }
          
          // Log first part of data for debugging
          LogUtils.debug(`Response_Data preview: ${String(rawResponseData).substring(0, 200)}`);
          
          const responseData = JSON.parse(rawResponseData);

          // Extract trauma scores and winner from Tool 1
          // Tool1 saves data as: {formData: {...}, scores: {...}, winner: "..."}
          const traumaScores = responseData.scores || {};
          const topTrauma = responseData.winner || 'FSV';
          
          LogUtils.debug(`Tool1 data found for ${clientId} - Winner: ${topTrauma}, Scores: ${JSON.stringify(traumaScores)}`);

          return { topTrauma, traumaScores };
        }
      }
      
      LogUtils.debug(`No Tool1 data found for ${clientId} after checking ${data.length - 1} rows`);
      
    } catch (e) {
      LogUtils.error('Error getting Tool 1 trauma data: ' + e.message);
    }

    // Default if no Tool 1 data found
    LogUtils.debug(`Returning default trauma data for ${clientId}: FSV`);
    return { topTrauma: 'FSV', traumaScores: {} };
  },

  /**
   * Helper: Render adaptive questions based on top trauma category
   * @param {string} topTrauma - Top trauma pattern key
   * @param {string} adaptiveScale - Existing scale value
   * @param {string} adaptiveImpact - Existing impact text
   * @param {boolean} isFullMode - Whether full mode is active (controls required attribute)
   */
  renderAdaptiveQuestions(topTrauma, adaptiveScale, adaptiveImpact, isFullMode) {
    // Default isFullMode to true for backward compatibility
    if (isFullMode === undefined) isFullMode = true;

    const questions = {
      FSV: {
        label: 'How much do you hide your true financial situation from others?',
        scale: [
          '-5: Complete transparency, totally open',
          '-4: Very honest, rarely hide anything',
          '-3: Mostly honest, minor omissions',
          '-2: Some selective sharing',
          '-1: General honesty, some privacy',
          '+1: Some hiding to protect my image',
          '+2: Regular hiding of problems',
          '+3: Significant hiding, fear judgment',
          '+4: Major deception, living a financial lie',
          '+5: Total hiding, no one knows the truth'
        ],
        impactLabel: 'How does hiding your financial situation negatively impact your life?',
        impactPrompt: 'Reflect on the consequences of not being transparent about your finances. Consider stress, isolation, missed help opportunities, relationship strain, etc.'
      },
      Control: {
        label: 'How much does lack of financial control create anxiety for you?',
        scale: [
          '-5: Zero anxiety, completely comfortable with uncertainty',
          '-4: Very little anxiety',
          '-3: Minor discomfort with uncertainty',
          '-2: Some discomfort',
          '-1: Occasional anxiety',
          '+1: Regular mild anxiety',
          '+2: Frequent anxiety about control',
          '+3: Significant anxiety, need to control',
          '+4: Major anxiety, feels unsafe',
          '+5: Paralyzing fear, losing control means crisis'
        ],
        impactLabel: 'How does your need for financial control negatively impact your life?',
        impactPrompt: 'Reflect on how controlling tendencies affect you. Consider stress, rigidity, relationship conflicts, missed opportunities, decision paralysis, etc.'
      },
      ExVal: {
        label: "How much do other people's opinions about your money affect your financial decisions?",
        scale: [
          '-5: Zero influence, completely autonomous',
          '-4: Very little influence',
          '-3: Slight awareness, minimal impact',
          '-2: Some awareness, rare influence',
          '-1: Occasional influence',
          "+1: Moderate influence on some decisions",
          '+2: Regular influence',
          '+3: Significant influence, hard to resist',
          '+4: Major influence, drives many decisions',
          "+5: Completely driven by other people's opinions"
        ],
        impactLabel: 'How does seeking external validation around money negatively impact your life?',
        impactPrompt: "Reflect on how other people's opinions shape your financial choices. Consider overspending, status seeking, hiding problems, authentic self suppression, etc."
      },
      Fear: {
        label: 'How much does financial fear paralyze your decision-making?',
        scale: [
          '-5: Never paralyzed, always take action',
          '-4: Rarely hesitate, action-oriented',
          '-3: Occasionally pause, but move forward',
          '-2: Sometimes hesitate briefly',
          '-1: Minor hesitation, usually overcome it',
          '+1: Sometimes freeze, delay decisions',
          '+2: Frequently hesitate, slow to act',
          '+3: Often paralyzed, hard to move forward',
          '+4: Usually frozen, rarely take action',
          '+5: Constantly paralyzed, cannot make decisions'
        ],
        impactLabel: 'How does financial fear negatively impact your life?',
        impactPrompt: 'Reflect on how fear holds you back financially. Consider missed opportunities, avoidance, inaction, relationship strain, lost time, etc.'
      },
      Receiving: {
        label: 'How comfortable are you receiving help or support around money?',
        scale: [
          '-5: Extremely uncomfortable, refuse all help',
          '-4: Very uncomfortable, major resistance',
          '-3: Uncomfortable, prefer to do it alone',
          '-2: Uncomfortable but open if necessary',
          '-1: Slightly uncomfortable receiving help',
          '+1: Neutral, can accept if offered',
          '+2: Generally comfortable',
          '+3: Comfortable, willing to ask',
          '+4: Very comfortable, seek support',
          '+5: Completely comfortable, embrace collaboration'
        ],
        impactLabel: 'How does difficulty receiving help around money negatively impact your life?',
        impactPrompt: 'Reflect on how resistance to receiving affects you financially. Consider isolation, struggling alone, pride, missed guidance, slower progress, etc.'
      },
      Showing: {
        label: 'How much do you sacrifice your financial security to serve or help others?',
        scale: [
          '-5: Never sacrifice, always prioritize my needs',
          '-4: Rarely sacrifice',
          '-3: Occasionally help, within limits',
          '-2: Sometimes give, protect myself',
          '-1: Balance helping with self-care',
          '+1: Often help others, sometimes at my expense',
          '+2: Regularly sacrifice for others',
          '+3: Frequently sacrifice, even when I should not',
          '+4: Almost always put others first',
          '+5: Always sacrifice my security for others'
        ],
        impactLabel: 'How does over-serving others financially negatively impact your life?',
        impactPrompt: 'Reflect on the cost of prioritizing others over your financial health. Consider resentment, depletion, inability to meet own goals, enablement, etc.'
      }
    };

    const q = questions[topTrauma] || questions.FSV;
    const reqAttr = isFullMode ? 'required' : '';

    return `
      <div class="form-group">
        <label class="form-label">${q.label} *</label>
        <select name="adaptiveScale" ${reqAttr}>
          <option value="">Select a response</option>
          ${q.scale.map((option, idx) => {
            const value = idx < 5 ? (-5 + idx) : (idx - 4);
            return '<option value="' + value + '" ' + (adaptiveScale == value ? 'selected' : '') + '>' + option + '</option>';
          }).join('\n          ')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">${q.impactLabel} *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">${q.impactPrompt}</p>
        <textarea name="adaptiveImpact" rows="4" ${reqAttr} placeholder="Share your thoughts...">${adaptiveImpact}</textarea>
      </div>
    `;
  },

  /**
   * REQUIRED: Save page data (called by saveToolPageData in Code.js)
   * Stores draft in PropertiesService for auto-resume
   */
  savePageData(clientId, page, formData) {
    try {
      // Page 5: Ensure unchecked checkboxes are explicitly set to false
      // (unchecked checkboxes are not included in form submission data)
      if (page === 5) {
        const insuranceFields = ['hasHealthInsurance', 'hasLifeInsurance', 'hasDisabilityInsurance', 'hasPropertyInsurance'];
        insuranceFields.forEach(function(field) {
          if (!formData[field]) {
            formData[field] = 'false';
          }
        });
      }

      // Save to PropertiesService for fast page-to-page navigation
      const result = DraftService.saveDraft('tool2', clientId, page, formData, ['client', 'page']);

      // Get the complete draft data (includes all pages merged)
      const draftData = DraftService.getDraft('tool2', clientId);

      // Also save/update RESPONSES sheet for dashboard detection
      // BUT: Don't create/update if we're in edit mode (EDIT_DRAFT already exists)
      const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
      const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

      if (!isEditMode) {
        // Use complete draft data so RESPONSES sheet has ALL pages
        if (page === 1) {
          // Page 1: Create new DRAFT row and capture row index for fast updates
          var saveResult = DataService.saveDraft(clientId, 'tool2', draftData);
          if (saveResult && saveResult.draftRowIndex) {
            try {
              PropertiesService.getUserProperties().setProperty(
                '_draftRow_tool2_' + clientId, String(saveResult.draftRowIndex)
              );
            } catch (e) { /* non-fatal */ }
          }
        } else {
          // Pages 2-5: Use tracked row index for fast update (skip full sheet scan)
          var rowIdx = null;
          try {
            var stored = PropertiesService.getUserProperties().getProperty('_draftRow_tool2_' + clientId);
            rowIdx = stored ? parseInt(stored) : null;
          } catch (e) { /* fall through */ }

          if (rowIdx) {
            DataService.updateDraftByRow(clientId, 'tool2', draftData, rowIdx);
          } else {
            DataService.updateDraft(clientId, 'tool2', draftData);
          }
        }
      } else {
        // EDIT MODE: Use tracked row index if available
        var editRowIdx = null;
        try {
          var editStored = PropertiesService.getUserProperties().getProperty('_draftRow_tool2_' + clientId);
          editRowIdx = editStored ? parseInt(editStored) : null;
        } catch (e) { /* fall through */ }

        if (editRowIdx) {
          DataService.updateDraftByRow(clientId, 'tool2', draftData, editRowIdx);
        } else {
          LogUtils.debug('[Tool2] Updating EDIT_DRAFT with current data');
          DataService.updateDraft(clientId, 'tool2', draftData);
        }
      }

      // GPT background analysis is triggered client-side after page 5 loads
      // (see renderPage5Content — fires via google.script.run after page render)

      return result;
    } catch (error) {
      LogUtils.error(`Error saving page data: ${error}`);
      throw error;
    }
  },

  /**
   * Get existing data for a client (from draft storage)
   * CRITICAL: PropertiesService is source of truth for in-progress forms
   */
  getExistingData(clientId) {
    try {
      // Check for EDIT_DRAFT first (edit mode takes priority)
      let editDraft = null;
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
        if (activeDraft && activeDraft.status === 'EDIT_DRAFT') {
          editDraft = activeDraft;
          LogUtils.debug(`Found EDIT_DRAFT for ${clientId}`);
        }
      }

      // Get PropertiesService data (page-by-page updates)
      const propertiesData = DraftService.getDraft('tool2', clientId);

      // EDIT MODE: Merge EDIT_DRAFT (base) with PropertiesService (updates)
      if (editDraft) {
        if (propertiesData) {
          // Merge: EDIT_DRAFT has all original data, PropertiesService has page updates
          LogUtils.debug(`Merging EDIT_DRAFT with PropertiesService updates`);
          return { ...editDraft.data, ...propertiesData };
        } else {
          // No PropertiesService yet, use EDIT_DRAFT
          LogUtils.debug(`Using EDIT_DRAFT data (no PropertiesService yet)`);
          return editDraft.data;
        }
      }

      // NEW DRAFT MODE: PropertiesService is source of truth
      if (propertiesData) {
        LogUtils.debug(`Found PropertiesService draft for ${clientId}`);
        return propertiesData;
      }

      // Check for regular DRAFT (for resume)
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
        if (activeDraft && activeDraft.status === 'DRAFT') {
          LogUtils.debug(`Found DRAFT for ${clientId}`);
          return activeDraft.data;
        }
      }

      return null;

    } catch (error) {
      LogUtils.error(`Error getting existing data: ${error}`);
      return null;
    }
  },

  // ============================================================
  // NEW SCORING FUNCTIONS (Phase 2)
  // ============================================================

  /**
   * Compute objective health score (0-100) for a domain
   * Based on financial planning benchmarks — see design doc Section 6.1
   */
  computeObjectiveHealthScore(domain, data) {
    const takeHome = parseFloat(data.monthlyTakeHome) || 0;
    const spending = parseFloat(data.monthlySpending) || 0;
    const debtPay  = parseFloat(data.monthlyDebtPayments) || 0;
    const efBal    = parseFloat(data.emergencyFundBalance) || 0;
    const liquid   = parseFloat(data.liquidSavings) || 0;
    const retContr = parseFloat(data.monthlyRetirementContribution) || 0;
    const annualInc = parseFloat(data.grossAnnualIncome) || 0;
    const deps     = parseInt(data.dependents) || 0;

    switch (domain) {
      case 'moneyFlow': {
        if (takeHome <= 0) return 10;
        const savingsRate = (takeHome - spending) / takeHome * 100;
        if (savingsRate >= 20) return 85;
        if (savingsRate >= 10) return 65;
        if (savingsRate >= 1)  return 35;
        return 10;
      }
      case 'obligations': {
        const dtiScore = (function() {
          if (takeHome <= 0) return 10;
          const dti = debtPay / takeHome * 100;
          if (dti <= 15) return 85;
          if (dti <= 28) return 60;
          if (dti <= 36) return 30;
          return 10;
        })();
        const efScore = (function() {
          if (spending <= 0) return efBal > 0 ? 65 : 10;
          const months = efBal / spending;
          if (months >= 6) return 90;
          if (months >= 3) return 65;
          if (months >= 1) return 35;
          return 10;
        })();
        return Math.round((dtiScore + efScore) / 2);
      }
      case 'liquidity': {
        if (spending <= 0) return liquid > 0 ? 60 : 5;
        const months = liquid / spending;
        if (months >= 3)   return 85;
        if (months >= 1)   return 60;
        if (months >= 0.1) return 30;
        return 5;
      }
      case 'growth': {
        const incomeBase = takeHome > 0 ? takeHome : (annualInc / 12);
        if (incomeBase <= 0) return 10;
        const rate = retContr / incomeBase * 100;
        if (rate >= 15) return 90;
        if (rate >= 10) return 65;
        if (rate >= 5)  return 35;
        return 10;
      }
      case 'protection': {
        function _isTrue(v) { return v === true || v === 'true' || v === 'TRUE'; }
        const applicable = [
          _isTrue(data.hasHealthInsurance),
          _isTrue(data.hasDisabilityInsurance),
          _isTrue(data.hasPropertyInsurance),
          deps > 0 ? _isTrue(data.hasLifeInsurance) : null
        ].filter(function(v) { return v !== null; });
        if (applicable.length === 0) return 50;
        const coveredCount = applicable.filter(Boolean).length;
        return Math.round(coveredCount / applicable.length * 100);
      }
      default:
        return 50;
    }
  },

  /**
   * Compute subjective clarity score (0-100) for a domain
   * Scale normalization: (value + 5) / 10 * 100 maps -5→0, +5→100
   */
  computeSubjectiveScore(domain, data, mode) {
    const fieldMap = mode === 'full' ? Tool2Constants.FULL_MODE_FIELDS : Tool2Constants.LIGHT_MODE_FIELDS;
    const fields = fieldMap[domain] || [];
    const values = fields
      .map(function(f) { return parseFloat(data[f]); })
      .filter(function(v) { return !isNaN(v) && v !== 0; });
    if (values.length === 0) return null;
    const avg = values.reduce(function(a, b) { return a + b; }, 0) / values.length;
    return Math.round((avg + 5) / 10 * 100);
  },

  /**
   * Compute gap index: objective - subjective (-100 to +100)
   */
  computeGapIndex(objectiveScore, subjectiveScore) {
    if (objectiveScore === null || subjectiveScore === null) return null;
    return objectiveScore - subjectiveScore;
  },

  /**
   * Classify gap direction and magnitude
   * Edge values sit in the milder bucket (strict > at 10 and 20 boundaries)
   */
  classifyGap(gapIndex) {
    if (gapIndex === null) return 'UNKNOWN';
    if (gapIndex > 20)  return 'UNDERESTIMATING';
    if (gapIndex > 10)  return 'SLIGHTLY_UNDER';
    if (gapIndex >= -10) return 'ALIGNED';
    if (gapIndex >= -20) return 'SLIGHTLY_OVER';
    return 'OVERESTIMATING';
  },

  /**
   * Compute priority score for a domain (higher = more urgent)
   */
  computePriorityScore(domain, objectiveScore) {
    const weight = Tool2Constants.STRESS_WEIGHTS[domain] || 1;
    const healthScore = objectiveScore !== null ? objectiveScore : 50;
    return weight * (100 - healthScore);
  },

  /**
   * Parse employment types from stored data (backward compatible)
   * Handles: JSON array string, plain string (legacy), or array
   * @param {Object} data - form data containing employment field
   * @returns {Array} Array of employment type strings
   */
  getEmploymentTypes(data) {
    var employment = data.employment || '';
    if (Array.isArray(employment)) return employment;
    if (typeof employment === 'string') {
      if (employment.charAt(0) === '[') {
        try { return JSON.parse(employment); } catch(e) {}
      }
      return employment ? [employment] : [];
    }
    return [];
  },

  /**
   * Compute scarcity flag from holistic and financial scarcity scales
   */
  computeScarcityFlag(data) {
    const holistic  = parseFloat(data.holisticScarcity);
    const financial = parseFloat(data.financialScarcity);
    if (isNaN(holistic) || isNaN(financial)) return 'UNKNOWN';

    // Check targeted cases first (before averaging)
    if (holistic >= 2 && financial <= -2) return 'TARGETED_FINANCIAL_SCARCITY';
    if (holistic <= -2 && financial >= 2)  return 'DISSOCIATED_FINANCIAL';

    const avg = (holistic + financial) / 2;
    if (avg <= -2) return 'GLOBAL_SCARCITY';
    if (avg >= 2)  return 'GLOBAL_ABUNDANCE';
    return 'MIXED';
  },

  /**
   * Detect Tool 1 profile type from trauma scores
   * Returns { type, winner, secondary, margin, highPatterns, lowPatterns, classified }
   */
  detectTool1ProfileType(traumaScores) {
    if (!traumaScores || Object.keys(traumaScores).length === 0) {
      return { type: 'UNKNOWN', winner: null, secondary: null, margin: 0, highPatterns: [], lowPatterns: [], classified: {} };
    }

    const thresholds = Tool2Constants.PATTERN_THRESHOLDS;
    const classified = {};
    Object.keys(traumaScores).forEach(function(p) {
      const t = thresholds[p];
      if (!t) { classified[p] = 'MODERATE'; return; }
      if (traumaScores[p] > t.high) { classified[p] = 'HIGH'; }
      else if (traumaScores[p] < t.low) { classified[p] = 'LOW'; }
      else { classified[p] = 'MODERATE'; }
    });

    const highPatterns = Object.keys(classified).filter(function(p) { return classified[p] === 'HIGH'; });
    const lowPatterns  = Object.keys(classified).filter(function(p) { return classified[p] === 'LOW'; });
    const sorted = Object.entries(traumaScores).sort(function(a, b) { return b[1] - a[1]; });
    const margin = sorted.length >= 2 ? sorted[0][1] - sorted[1][1] : 25;
    const topWinner = sorted[0][0];

    // Negative-dominant: 4+ patterns below their LOW threshold
    if (lowPatterns.length >= 4) {
      return {
        type: 'NEGATIVE_DOMINANT',
        winner: topWinner,
        secondary: null,
        margin: margin,
        highPatterns: [],
        lowPatterns: lowPatterns,
        classified: classified
      };
    }

    // Borderline dual: top two within 5 points
    if (margin <= 5) {
      return {
        type: 'BORDERLINE_DUAL',
        winner: sorted[0][0],
        secondary: sorted[1][0],
        margin: margin,
        highPatterns: highPatterns,
        lowPatterns: lowPatterns,
        classified: classified
      };
    }

    // Strong single: margin > 10 and winner is HIGH
    if (margin > 10 && classified[topWinner] === 'HIGH') {
      return {
        type: 'STRONG_SINGLE',
        winner: topWinner,
        secondary: sorted[1][0],
        margin: margin,
        highPatterns: highPatterns,
        lowPatterns: lowPatterns,
        classified: classified
      };
    }

    // Moderate single: default
    return {
      type: 'MODERATE_SINGLE',
      winner: topWinner,
      secondary: sorted[1][0],
      margin: margin,
      highPatterns: highPatterns,
      lowPatterns: lowPatterns,
      classified: classified
    };
  },

  // ============================================================
  // END NEW SCORING FUNCTIONS
  // ============================================================

  /**
   * REQUIRED: Process final submission
   * Must return {redirectUrl: '...'}
   */
  processFinalSubmission(clientId) {
    try {
      // Get all submitted data
      const allData = this.getExistingData(clientId);

      if (!allData) {
        throw new Error('No data found. Please start the assessment again.');
      }

      // Check if this is an edit or new submission
      const isEditMode = allData._editMode === true;

      LogUtils.debug(`Processing ${isEditMode ? 'edited' : 'new'} submission for ${clientId}`);

      // ============================================================
      // LEGACY SCORING (preserved for backward compatibility)
      // ============================================================
      const legacyResults = this.processResults(allData);

      // ============================================================
      // NEW SCORING PIPELINE (Phase 2)
      // ============================================================
      const traumaData = this.getTool1TraumaData(clientId);
      const mode = allData.assessmentMode || 'full';

      const domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
      const objectiveHealthScores = {};
      const subjectiveScores = {};
      const gapIndexes = {};
      const gapClassifications = {};
      const priorityScores = {};

      domains.forEach(d => {
        objectiveHealthScores[d] = this.computeObjectiveHealthScore(d, allData);
        subjectiveScores[d] = this.computeSubjectiveScore(d, allData, mode);
        gapIndexes[d] = this.computeGapIndex(objectiveHealthScores[d], subjectiveScores[d]);
        gapClassifications[d] = this.classifyGap(gapIndexes[d]);
        priorityScores[d] = this.computePriorityScore(d, objectiveHealthScores[d]);
      });

      // Build new priority list (descending by priority score)
      const newPriorityList = Object.keys(priorityScores)
        .sort(function(a, b) { return priorityScores[b] - priorityScores[a]; })
        .map(function(d) { return { domain: d, priorityScore: priorityScores[d] }; });

      const tool1Profile = this.detectTool1ProfileType(traumaData.traumaScores);
      const scarcityFlag = this.computeScarcityFlag(allData);

      // Merge legacy + new results
      const results = {
        ...legacyResults,
        objectiveHealthScores: objectiveHealthScores,
        subjectiveScores: subjectiveScores,
        gapIndexes: gapIndexes,
        gapClassifications: gapClassifications,
        scarcityFlag: scarcityFlag,
        tool1Profile: tool1Profile,
        assessmentMode: mode,
        newPriorityList: newPriorityList,
        submissionType: allData._quickCheckIn ? 'quick-check-in' : 'full-assessment'
      };

      // ============================================================
      // GPT INSIGHTS PROCESSING (Phase 4 — consolidated)
      // ============================================================

      // Step 1: Check for cached background GPT result (fired on page 4 save)
      var cachedGpt = DraftService.getDraft('tool2_gpt', clientId);
      var gptInsight = cachedGpt ? cachedGpt.insight : null;

      // Step 2: If cached result has valid insight, use it
      var overallInsight;
      if (gptInsight && gptInsight.overview && gptInsight.overview.length > 50) {
        LogUtils.debug('[Tool2] Using cached GPT result');
        overallInsight = gptInsight;
      } else {
        // Step 3: Run consolidated GPT call synchronously (single call, ~10-15s)
        LogUtils.debug('[Tool2] No cached GPT — running consolidated analysis at submission...');
        try {
          overallInsight = Tool2GPTAnalysis.runConsolidatedAnalysis(clientId, allData, results, traumaData);
        } catch(gptErr) {
          LogUtils.debug('[Tool2] GPT call failed: ' + gptErr.message);
          overallInsight = null;
        }

        // Step 4: If GPT failed, use gap-aware deterministic fallback
        if (!overallInsight || !overallInsight.overview) {
          LogUtils.debug('[Tool2] GPT returned no result — using gap-aware fallback');
          overallInsight = Tool2Fallbacks.getConsolidatedFallback(results, allData, traumaData);
          overallInsight.source = 'fallback';
          overallInsight.timestamp = new Date().toISOString();
        }
      }

      var gptInsights = cachedGpt || {};

      // ============================================================
      // END GPT INSIGHTS PROCESSING
      // ============================================================

      // CRITICAL: Use DataService.saveToolResponse() - handles Is_Latest column
      DataService.saveToolResponse(clientId, 'tool2', {
        data: allData,
        results: results,
        gptInsights: gptInsights,
        overallInsight: overallInsight,
        timestamp: new Date().toISOString()
      });

      // Clean up draft and GPT cache
      DraftService.clearDraft('tool2', clientId);
      DraftService.clearDraft('tool2_gpt', clientId);

      // AUTO-UNLOCK DISABLED - Tools are now unlocked manually by admin
      // To re-enable, uncomment the following:
      // if (!isEditMode) {
      //   ToolAccessControl.adminUnlockTool(
      //     clientId,
      //     'tool3',
      //     'system',
      //     'Auto-unlocked after Tool 2 completion'
      //   );
      // }

      // Return redirect URL for client-side navigation
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool2_report&client=${clientId}`;
      return {
        redirectUrl: reportUrl
      };

    } catch (error) {
      LogUtils.error(`Error processing final submission: ${error}`);
      throw error;
    }
  },

  // =========================================================================
  // LEGACY SCORING PIPELINE (pre-overhaul submissions only)
  //
  // These functions (processResults, calculateDomainScores, sumScaleQuestions,
  // applyBenchmarks, applyStressWeights, sortByPriority, determineArchetype)
  // use field names from the OLD form (referenced in Tool2Constants.DOMAIN_QUESTIONS).
  //
  // For NEW submissions (post-Financial Mirror overhaul), these produce
  // near-zero/empty results because the old fields are not collected.
  // This is expected — the legacy output is preserved in saved data for
  // backward compat, but new reports use objectiveHealthScores/subjectiveScores/
  // gapIndexes from the new scoring pipeline above.
  //
  // DO NOT remove these functions — old submissions still need them.
  // DO NOT rely on their output for new submissions.
  // =========================================================================

  /**
   * LEGACY — Process results using old form field names
   * Produces valid output only for pre-overhaul submissions
   */
  processResults(data) {
    // Step 1: Calculate raw domain scores
    const domainScores = this.calculateDomainScores(data);

    // Step 2: Apply benchmarks (High/Med/Low)
    const benchmarks = this.applyBenchmarks(domainScores);

    // Step 3: Apply stress weights
    const weightedScores = this.applyStressWeights(domainScores);

    // Step 4: Sort by priority (lowest weighted score = highest priority)
    const priorityList = this.sortByPriority(weightedScores);

    // Step 5: Determine growth archetype
    const archetype = this.determineArchetype(priorityList);

    return {
      domainScores: domainScores,
      benchmarks: benchmarks,
      weightedScores: weightedScores,
      priorityList: priorityList,
      archetype: archetype,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Calculate raw scores for all 5 domains
   * Each domain sums its scale questions (excluding free-text)
   */
  calculateDomainScores(data) {
    const questions = Tool2Constants.DOMAIN_QUESTIONS;
    const scores = {};
    Object.keys(questions).forEach(domain => {
      scores[domain] = this.sumScaleQuestions(data, questions[domain]);
    });
    return scores;
  },

  /**
   * Helper: Normalize scale values from -5 to +5 range to 0-10 range
   * Original scale: -5, -4, -3, -2, -1, +1, +2, +3, +4, +5 (no zero)
   * Normalized scale: 0, 1, 2, 3, 4, 6, 7, 8, 9, 10
   */
  normalizeScaleValue(value) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return 0;

    // Add 5 to shift range: -5 becomes 0, +5 becomes 10
    return parsed + 5;
  },

  /**
   * Helper: Sum scale question values (normalized to 0-10 range)
   */
  sumScaleQuestions(data, questionKeys) {
    let total = 0;
    questionKeys.forEach(key => {
      const normalized = this.normalizeScaleValue(data[key]);
      total += normalized;
    });
    return total;
  },

  /**
   * Apply absolute benchmarks to convert raw scores to High/Medium/Low
   * High: 60% or above, Medium: 20-59%, Low: Below 20%
   */
  applyBenchmarks(domainScores) {
    const maxScores = Tool2Constants.MAX_SCORES;

    const benchmarks = {};

    Object.keys(domainScores).forEach(domain => {
      const score = domainScores[domain];
      const maxScore = maxScores[domain];
      const percentage = (score / maxScore) * 100;

      let level;
      if (percentage >= 60) {
        level = 'High';
      } else if (percentage >= 20) {
        level = 'Medium';
      } else {
        level = 'Low';
      }

      benchmarks[domain] = {
        raw: score,
        max: maxScore,
        percentage: Math.round(percentage),
        level: level
      };
    });

    return benchmarks;
  },

  /**
   * Apply stress weights to domain scores
   * Money Flow: 5, Obligations: 4, Liquidity: 2, Growth: 1, Protection: 1
   */
  applyStressWeights(domainScores) {
    const stressWeights = Tool2Constants.STRESS_WEIGHTS;

    const weighted = {};

    Object.keys(domainScores).forEach(domain => {
      weighted[domain] = domainScores[domain] * stressWeights[domain];
    });

    return weighted;
  },

  /**
   * Sort domains by weighted score (lowest = highest priority)
   */
  sortByPriority(weightedScores) {
    return Object.keys(weightedScores)
      .sort((a, b) => weightedScores[a] - weightedScores[b])
      .map(domain => ({
        domain: domain,
        weightedScore: weightedScores[domain]
      }));
  },

  /**
   * Determine growth archetype based on highest priority domain
   */
  determineArchetype(priorityList) {
    const topDomain = priorityList[0].domain;

    const archetypes = Tool2Constants.ARCHETYPES;

    return archetypes[topDomain] || 'Financial Clarity Seeker';
  },

  /**
   * DEPRECATED: Do not use this method!
   * Use DataService.saveToolResponse() instead (see processFinalSubmission above)
   *
   * Why? DataService.saveToolResponse():
   * - Handles Is_Latest column correctly (7 columns, not 6)
   * - Marks old versions as Is_Latest = false
   * - Sets new version as Is_Latest = true
   * - Manages version cleanup
   * - Prevents data integrity issues
   *
   * Bug reference: Deploy @58 (ec82987)
   */
});
