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

const Tool2 = {
  manifest: null, // Will be injected by ToolRegistry

  /**
   * REQUIRED: Render the tool UI
   * FormUtils handles all the boilerplate
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // CRITICAL: Handle URL parameters for navigation (preserves user gesture)
    const editMode = params.editMode === 'true' || params.editMode === true;
    const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

    // Execute actions on page 1 AFTER navigation completes (with user gesture)
    // Call loadResponseForEditing to create EDIT_DRAFT from COMPLETED response
    // This happens AFTER navigation so we preserve user gesture (no iframe errors)

    if (editMode && page === 1) {
      Logger.log(`Edit mode detected for ${clientId} - creating EDIT_DRAFT`);
      DataService.loadResponseForEditing(clientId, 'tool2');
    }

    if (clearDraft && page === 1) {
      // Clear all drafts for fresh start
      Logger.log(`Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'tool2');
    }

    // Get existing data if resuming
    const existingData = this.getExistingData(clientId);

    // Get page-specific content
    const pageContent = this.renderPageContent(page, existingData, clientId);

    // Use FormUtils to build standard page structure
    const template = HtmlService.createTemplate(
      FormUtils.buildStandardPage({
        toolName: 'Financial Clarity & Values Assessment',
        toolId: 'tool2',
        page: page,
        totalPages: 5, // TODO: Adjust based on final structure
        clientId: clientId,
        baseUrl: baseUrl,
        pageContent: pageContent,
        isFinalPage: (page === 5),
        customValidation: null
      })
    );

    return template.evaluate()
      .setTitle('TruPath - Financial Clarity & Values')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Route to appropriate page content
   */
  renderPageContent(page, existingData, clientId) {
    let content = '';

    // Add edit mode banner if editing previous response
    if (existingData && existingData._editMode) {
      const originalDate = existingData._originalTimestamp ?
        new Date(existingData._originalTimestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'previous submission';

      content += EditModeBanner.render(originalDate, clientId, 'tool2');
    }

    // Add page-specific content
    switch(page) {
      case 1:
        content += this.renderPage1Content(existingData, clientId);
        break;
      case 2:
        content += this.renderPage2Content(existingData, clientId);
        break;
      case 3:
        content += this.renderPage3Content(existingData, clientId);
        break;
      case 4:
        content += this.renderPage4Content(existingData, clientId);
        break;
      case 5:
        content += this.renderPage5Content(existingData, clientId);
        break;
      default:
        content += '<p class="error">Invalid page number</p>';
    }

    return content;
  },

  /**
   * PAGE 1: Demographics & Mindset Foundation (13 questions)
   */
  renderPage1Content(data, clientId) {
    // Get Tool 1 data for pre-filling Q1-Q3
    let tool1Data = null;
    try {
      const tool1Response = DataService.getLatestResponse(clientId, 'tool1');
      if (tool1Response && tool1Response.data) {
        // Tool 1 saves as: {formData: {...}, scores: {...}, winner: "..."}
        tool1Data = tool1Response.data.formData || tool1Response.data;
      }
    } catch (e) {
      Logger.log('Could not load Tool 1 data for pre-fill: ' + e);
    }

    // Pre-fill values from draft or Tool 1
    const name = data?.name || tool1Data?.name || '';
    const email = data?.email || tool1Data?.email || '';
    const studentId = clientId;

    // Demographics
    const age = data?.age || '';
    const marital = data?.marital || '';
    const dependents = data?.dependents || '';
    const living = data?.living || '';
    const employment = data?.employment || '';
    const incomeStreams = data?.incomeStreams || '';
    const businessStage = data?.businessStage || '';

    // Mindset
    const holisticScarcity = data?.holisticScarcity || '';
    const financialScarcity = data?.financialScarcity || '';
    const moneyRelationship = data?.moneyRelationship || '';

    // Show business stage conditionally (for any business involvement)
    const showBusinessStage = employment === 'self-employed' ||
                               employment === 'business-owner' ||
                               employment === 'full-time-with-business' ||
                               employment === 'part-time-with-business';

    return `
      <h2>📊 Demographics & Mindset Foundation</h2>
      <p class="muted mb-20">Help us understand your life stage and financial perspective (13 questions)</p>

      <!-- Identity (Pre-filled from Tool 1) -->
      <h3 style="margin-top: 30px;">Identity</h3>

      <div class="form-group">
        <label class="form-label">First and Last Name *</label>
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
        <label class="form-label">Q4. What is your age? *</label>
        <input type="number" name="age" value="${age}" min="18" max="100" required placeholder="Enter your age">
      </div>

      <div class="form-group">
        <label class="form-label">Q5. Marital/Relationship Status *</label>
        <select name="marital" required>
          <option value="">Select status</option>
          <option value="single" ${marital === 'single' ? 'selected' : ''}>Single</option>
          <option value="dating" ${marital === 'dating' ? 'selected' : ''}>Dating/partnered</option>
          <option value="married" ${marital === 'married' ? 'selected' : ''}>Married/domestic partnership</option>
          <option value="divorced" ${marital === 'divorced' ? 'selected' : ''}>Divorced/separated</option>
          <option value="widowed" ${marital === 'widowed' ? 'selected' : ''}>Widowed</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q6. How many dependents do you have? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Count children, elderly parents, or anyone financially dependent on you. Enter 0 if none.</p>
        <input type="number" name="dependents" value="${dependents}" min="0" max="20" required placeholder="Enter number (0 if none)">
      </div>

      <div class="form-group">
        <label class="form-label">Q7. Living Situation *</label>
        <select name="living" required>
          <option value="">Select situation</option>
          <option value="rent" ${living === 'rent' ? 'selected' : ''}>Rent apartment/house</option>
          <option value="own-mortgage" ${living === 'own-mortgage' ? 'selected' : ''}>Own home (with mortgage)</option>
          <option value="own-paid" ${living === 'own-paid' ? 'selected' : ''}>Own home (paid off)</option>
          <option value="family" ${living === 'family' ? 'selected' : ''}>Living with family/friends (no rent)</option>
        </select>
      </div>

      <!-- Employment & Income Context -->
      <h3 style="margin-top: 40px;">Employment & Income Context</h3>

      <div class="form-group">
        <label class="form-label">Q8. How many additional income streams do you have beyond your primary source? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Enter 0 if you have only one income source. Count side hustles, rental income, dividends, etc.</p>
        <input type="number" name="incomeStreams" value="${incomeStreams}" min="0" max="10" required placeholder="Enter number (0 if none)">
      </div>

      <div class="form-group">
        <label class="form-label">Q9. Employment Status *</label>
        <select name="employment" id="employmentSelect" required onchange="toggleBusinessStage()">
          <option value="">Select status</option>
          <option value="full-time" ${employment === 'full-time' ? 'selected' : ''}>Full-time employee</option>
          <option value="part-time" ${employment === 'part-time' ? 'selected' : ''}>Part-time employee</option>
          <option value="full-time-with-business" ${employment === 'full-time-with-business' ? 'selected' : ''}>Full-time employee with business</option>
          <option value="part-time-with-business" ${employment === 'part-time-with-business' ? 'selected' : ''}>Part-time employee with business</option>
          <option value="self-employed" ${employment === 'self-employed' ? 'selected' : ''}>Self-employed (solopreneur)</option>
          <option value="business-owner" ${employment === 'business-owner' ? 'selected' : ''}>Business owner (with employees)</option>
          <option value="unemployed" ${employment === 'unemployed' ? 'selected' : ''}>Unemployed (seeking work)</option>
          <option value="retired" ${employment === 'retired' ? 'selected' : ''}>Retired</option>
          <option value="not-working" ${employment === 'not-working' ? 'selected' : ''}>Not working by choice</option>
        </select>
      </div>

      <div class="form-group" id="businessStageGroup" style="display: ${showBusinessStage ? 'block' : 'none'};">
        <label class="form-label">Q10. If Business Owner: Business Stage *</label>
        <select name="businessStage" id="businessStageSelect">
          <option value="">Select stage</option>
          <option value="idea" ${businessStage === 'idea' ? 'selected' : ''}>Idea/planning stage</option>
          <option value="startup" ${businessStage === 'startup' ? 'selected' : ''}>Startup (0-2 years, pre-revenue)</option>
          <option value="early" ${businessStage === 'early' ? 'selected' : ''}>Early stage (generating revenue, not profitable)</option>
          <option value="growth" ${businessStage === 'growth' ? 'selected' : ''}>Growth stage (profitable, scaling)</option>
          <option value="established" ${businessStage === 'established' ? 'selected' : ''}>Established (stable, predictable)</option>
        </select>
      </div>

      <!-- Mindset Baseline -->
      <h3 style="margin-top: 40px;">Mindset Baseline</h3>

      <div class="form-group">
        <label class="form-label">Q11. Where do you fall on your holistic scarcity versus abundance mindset? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">In all domains of your life: love, money, food, friendship, safety</p>
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
        <label class="form-label">Q12. Where do you fall on your financial scarcity versus abundance mindset? *</label>
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

      <div class="form-group">
        <label class="form-label">Q13. How would you describe your relationship with Money? *</label>
        <select name="moneyRelationship" required>
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

      <script>
        // Toggle business stage visibility based on employment selection
        function toggleBusinessStage() {
          const employment = document.getElementById('employmentSelect').value;
          const businessStageGroup = document.getElementById('businessStageGroup');
          const businessStageSelect = document.getElementById('businessStageSelect');

          // Show business stage for any employment with business involvement
          const hasBusinessInvolvement = employment === 'self-employed' ||
                                          employment === 'business-owner' ||
                                          employment === 'full-time-with-business' ||
                                          employment === 'part-time-with-business';

          if (hasBusinessInvolvement) {
            businessStageGroup.style.display = 'block';
            businessStageSelect.setAttribute('required', 'required');
          } else {
            businessStageGroup.style.display = 'none';
            businessStageSelect.removeAttribute('required');
            businessStageSelect.value = ''; // Clear selection
          }
        }

        // Run on page load to set initial state
        document.addEventListener('DOMContentLoaded', function() {
          toggleBusinessStage();
        });
      </script>
    `;
  },

  /**
   * PAGE 2: Money Flow Domain - Income & Spending
   * Q14-Q24: Income and spending clarity and stress
   */
  renderPage2Content(data, clientId) {
    // Extract existing data with defaults
    const incomeClarity = data.incomeClarity || '';
    const incomeSufficiency = data.incomeSufficiency || '';
    const incomeConsistency = data.incomeConsistency || '';
    const incomeStress = data.incomeStress || '';
    const incomeSources = data.incomeSources || '';
    const spendingClarity = data.spendingClarity || '';
    const spendingConsistency = data.spendingConsistency || '';
    const spendingReview = data.spendingReview || '';
    const spendingStress = data.spendingStress || '';
    const majorExpenses = data.majorExpenses || '';
    const wastefulSpending = data.wastefulSpending || '';

    return `
      <h2>💰 Money Flow Domain</h2>
      <p class="muted mb-20">Understanding your income and spending awareness (11 questions)</p>

      <!-- Income Clarity Questions -->
      <h3 style="margin-top: 30px;">Income Clarity</h3>

      <div class="form-group">
        <label class="form-label">Q14. What level of clarity do you hold on your income? *</label>
        <select name="incomeClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${incomeClarity === '-5' ? 'selected' : ''}>-5: Never pay attention, completely avoid it</option>
          <option value="-4" ${incomeClarity === '-4' ? 'selected' : ''}>-4: Rarely look, high avoidance</option>
          <option value="-3" ${incomeClarity === '-3' ? 'selected' : ''}>-3: Only look when there's a problem</option>
          <option value="-2" ${incomeClarity === '-2' ? 'selected' : ''}>-2: Occasional awareness, no structure</option>
          <option value="-1" ${incomeClarity === '-1' ? 'selected' : ''}>-1: Check if there's enough, but no tracking</option>
          <option value="1" ${incomeClarity === '1' ? 'selected' : ''}>+1: Monthly review, somewhat organized</option>
          <option value="2" ${incomeClarity === '2' ? 'selected' : ''}>+2: Organized, reviewed regularly</option>
          <option value="3" ${incomeClarity === '3' ? 'selected' : ''}>+3: Structured, assessed monthly</option>
          <option value="4" ${incomeClarity === '4' ? 'selected' : ''}>+4: Crystal clear, forecasting</option>
          <option value="5" ${incomeClarity === '5' ? 'selected' : ''}>+5: Optimized tracking, strategic planning</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q15. How sufficient is your current income? *</label>
        <select name="incomeSufficiency" required>
          <option value="">Select a response</option>
          <option value="-5" ${incomeSufficiency === '-5' ? 'selected' : ''}>-5: Completely insufficient for basic needs</option>
          <option value="-4" ${incomeSufficiency === '-4' ? 'selected' : ''}>-4: Severely insufficient</option>
          <option value="-3" ${incomeSufficiency === '-3' ? 'selected' : ''}>-3: Covers some needs, not all</option>
          <option value="-2" ${incomeSufficiency === '-2' ? 'selected' : ''}>-2: Barely covers basic needs</option>
          <option value="-1" ${incomeSufficiency === '-1' ? 'selected' : ''}>-1: Covers needs, no flexibility</option>
          <option value="1" ${incomeSufficiency === '1' ? 'selected' : ''}>+1: Covers needs and basic wants</option>
          <option value="2" ${incomeSufficiency === '2' ? 'selected' : ''}>+2: Comfortable, some saving</option>
          <option value="3" ${incomeSufficiency === '3' ? 'selected' : ''}>+3: Covers needs, wants, building savings</option>
          <option value="4" ${incomeSufficiency === '4' ? 'selected' : ''}>+4: More than sufficient, strong savings</option>
          <option value="5" ${incomeSufficiency === '5' ? 'selected' : ''}>+5: Abundant, building wealth</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q16. How consistent is your monthly income? *</label>
        <select name="incomeConsistency" required>
          <option value="">Select a response</option>
          <option value="-5" ${incomeConsistency === '-5' ? 'selected' : ''}>-5: Completely unpredictable, causes crisis</option>
          <option value="-4" ${incomeConsistency === '-4' ? 'selected' : ''}>-4: Highly variable, major stress</option>
          <option value="-3" ${incomeConsistency === '-3' ? 'selected' : ''}>-3: Variable and inconsistent, stressful</option>
          <option value="-2" ${incomeConsistency === '-2' ? 'selected' : ''}>-2: Inconsistent, difficult to plan</option>
          <option value="-1" ${incomeConsistency === '-1' ? 'selected' : ''}>-1: Variable but usually sufficient</option>
          <option value="1" ${incomeConsistency === '1' ? 'selected' : ''}>+1: Relatively consistent, manageable</option>
          <option value="2" ${incomeConsistency === '2' ? 'selected' : ''}>+2: Consistent with minor variations</option>
          <option value="3" ${incomeConsistency === '3' ? 'selected' : ''}>+3: Very consistent, reliable</option>
          <option value="4" ${incomeConsistency === '4' ? 'selected' : ''}>+4: Stable with predictable variations</option>
          <option value="5" ${incomeConsistency === '5' ? 'selected' : ''}>+5: Perfectly stable, always excess</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q17. What is your stress level around income? *</label>
        <select name="incomeStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${incomeStress === '-5' ? 'selected' : ''}>-5: Constant anxiety and fear about income</option>
          <option value="-4" ${incomeStress === '-4' ? 'selected' : ''}>-4: High stress most of the time</option>
          <option value="-3" ${incomeStress === '-3' ? 'selected' : ''}>-3: Frequently stressed and worried</option>
          <option value="-2" ${incomeStress === '-2' ? 'selected' : ''}>-2: Regular stress about income</option>
          <option value="-1" ${incomeStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${incomeStress === '1' ? 'selected' : ''}>+1: Generally calm about income</option>
          <option value="2" ${incomeStress === '2' ? 'selected' : ''}>+2: Mostly confident</option>
          <option value="3" ${incomeStress === '3' ? 'selected' : ''}>+3: Confident and calm</option>
          <option value="4" ${incomeStress === '4' ? 'selected' : ''}>+4: Very confident, minimal stress</option>
          <option value="5" ${incomeStress === '5' ? 'selected' : ''}>+5: Zero stress, complete confidence in income</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q18. List your income sources *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">List each source of income separated by commas. Include employment, self-employment, side hustles, rental income, investments, etc.</p>
        <p class="muted" style="font-size: 12px; margin-bottom: 10px; font-style: italic;">Example: Salary from ABC Corp, rental property income, freelance consulting, dividend income</p>
        <textarea name="incomeSources" rows="4" required placeholder="List your income sources here...">${incomeSources}</textarea>
      </div>

      <!-- Spending Clarity Questions -->
      <h3 style="margin-top: 40px;">Spending Clarity</h3>

      <div class="form-group">
        <label class="form-label">Q19. What level of clarity do you hold on your spending? *</label>
        <select name="spendingClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${spendingClarity === '-5' ? 'selected' : ''}>-5: Never pay attention, complete avoidance</option>
          <option value="-4" ${spendingClarity === '-4' ? 'selected' : ''}>-4: Rarely aware, high avoidance</option>
          <option value="-3" ${spendingClarity === '-3' ? 'selected' : ''}>-3: Only notice when there's a problem</option>
          <option value="-2" ${spendingClarity === '-2' ? 'selected' : ''}>-2: Vague awareness, no tracking</option>
          <option value="-1" ${spendingClarity === '-1' ? 'selected' : ''}>-1: General sense, no details</option>
          <option value="1" ${spendingClarity === '1' ? 'selected' : ''}>+1: Monthly check-ins, loose tracking</option>
          <option value="2" ${spendingClarity === '2' ? 'selected' : ''}>+2: Organized by broad categories</option>
          <option value="3" ${spendingClarity === '3' ? 'selected' : ''}>+3: Detailed categories, reviewed monthly</option>
          <option value="4" ${spendingClarity === '4' ? 'selected' : ''}>+4: Granular tracking, proactive</option>
          <option value="5" ${spendingClarity === '5' ? 'selected' : ''}>+5: Complete visibility, zero surprises</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q20. How consistent is your monthly spending? *</label>
        <select name="spendingConsistency" required>
          <option value="">Select a response</option>
          <option value="-5" ${spendingConsistency === '-5' ? 'selected' : ''}>-5: Chaotic, unpredictable, increasing debt</option>
          <option value="-4" ${spendingConsistency === '-4' ? 'selected' : ''}>-4: Very variable, often excessive</option>
          <option value="-3" ${spendingConsistency === '-3' ? 'selected' : ''}>-3: Variable and often over budget</option>
          <option value="-2" ${spendingConsistency === '-2' ? 'selected' : ''}>-2: Inconsistent, hard to predict</option>
          <option value="-1" ${spendingConsistency === '-1' ? 'selected' : ''}>-1: Variable but staying afloat</option>
          <option value="1" ${spendingConsistency === '1' ? 'selected' : ''}>+1: Relatively predictable</option>
          <option value="2" ${spendingConsistency === '2' ? 'selected' : ''}>+2: Consistent within ranges</option>
          <option value="3" ${spendingConsistency === '3' ? 'selected' : ''}>+3: Very consistent, planned</option>
          <option value="4" ${spendingConsistency === '4' ? 'selected' : ''}>+4: Highly controlled, intentional</option>
          <option value="5" ${spendingConsistency === '5' ? 'selected' : ''}>+5: Perfectly controlled, always saving</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q21. How detailed is your spending review? *</label>
        <select name="spendingReview" required>
          <option value="">Select a response</option>
          <option value="-5" ${spendingReview === '-5' ? 'selected' : ''}>-5: Never look at spending</option>
          <option value="-4" ${spendingReview === '-4' ? 'selected' : ''}>-4: Rarely review</option>
          <option value="-3" ${spendingReview === '-3' ? 'selected' : ''}>-3: Only look when account is low</option>
          <option value="-2" ${spendingReview === '-2' ? 'selected' : ''}>-2: Quick glance at balance</option>
          <option value="-1" ${spendingReview === '-1' ? 'selected' : ''}>-1: Check monthly totals only</option>
          <option value="1" ${spendingReview === '1' ? 'selected' : ''}>+1: Review category totals</option>
          <option value="2" ${spendingReview === '2' ? 'selected' : ''}>+2: Review major categories monthly</option>
          <option value="3" ${spendingReview === '3' ? 'selected' : ''}>+3: Detailed monthly review</option>
          <option value="4" ${spendingReview === '4' ? 'selected' : ''}>+4: Weekly detailed reviews</option>
          <option value="5" ${spendingReview === '5' ? 'selected' : ''}>+5: Track every transaction, optimize continuously</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q22. What is your stress level around spending? *</label>
        <select name="spendingStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${spendingStress === '-5' ? 'selected' : ''}>-5: Constant guilt, shame, and anxiety</option>
          <option value="-4" ${spendingStress === '-4' ? 'selected' : ''}>-4: High stress most of the time</option>
          <option value="-3" ${spendingStress === '-3' ? 'selected' : ''}>-3: Frequently stressed and worried</option>
          <option value="-2" ${spendingStress === '-2' ? 'selected' : ''}>-2: Regular worry about spending</option>
          <option value="-1" ${spendingStress === '-1' ? 'selected' : ''}>-1: Occasional guilt or concern</option>
          <option value="1" ${spendingStress === '1' ? 'selected' : ''}>+1: Generally comfortable</option>
          <option value="2" ${spendingStress === '2' ? 'selected' : ''}>+2: Mostly confident</option>
          <option value="3" ${spendingStress === '3' ? 'selected' : ''}>+3: Confident in spending choices</option>
          <option value="4" ${spendingStress === '4' ? 'selected' : ''}>+4: Calm and intentional</option>
          <option value="5" ${spendingStress === '5' ? 'selected' : ''}>+5: Zero stress, complete confidence</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q23. List your major expense categories *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">List your biggest spending areas separated by commas.</p>
        <p class="muted" style="font-size: 12px; margin-bottom: 10px; font-style: italic;">Example: Mortgage/rent, groceries, transportation, insurance, debt payments, healthcare, childcare, entertainment, dining out</p>
        <textarea name="majorExpenses" rows="4" required placeholder="List your major expense categories here...">${majorExpenses}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Q24. What spending do you consider wasteful or want to reduce? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Be honest about spending that doesn't align with your values or goals.</p>
        <p class="muted" style="font-size: 12px; margin-bottom: 10px; font-style: italic;">Example: Unused gym membership, impulse online shopping, excessive dining out, unused subscriptions, convenience spending</p>
        <textarea name="wastefulSpending" rows="4" required placeholder="Describe wasteful spending you want to reduce...">${wastefulSpending}</textarea>
      </div>
    `;
  },

  /**
   * PAGE 3: Obligations Domain - Debt & Emergency Fund
   * Q25-Q34: Debt and emergency fund clarity and stress
   */
  renderPage3Content(data, clientId) {
    // Extract existing data with defaults
    const debtClarity = data.debtClarity || '';
    const debtTrending = data.debtTrending || '';
    const debtReview = data.debtReview || '';
    const debtStress = data.debtStress || '';
    const currentDebts = data.currentDebts || '';
    const emergencyFundMaintenance = data.emergencyFundMaintenance || '';
    const emergencyFundMonths = data.emergencyFundMonths || '';
    const emergencyFundFrequency = data.emergencyFundFrequency || '';
    const emergencyFundReplenishment = data.emergencyFundReplenishment || '';
    const emergencyFundStress = data.emergencyFundStress || '';

    return `
      <h2>⚖️ Obligations Domain</h2>
      <p class="muted mb-20">Understanding your debt and emergency fund awareness (10 questions)</p>

      <!-- Debt Clarity Questions -->
      <h3 style="margin-top: 30px;">Debt Position</h3>

      <div class="form-group">
        <label class="form-label">Q25. What level of clarity do you hold on your debt? *</label>
        <select name="debtClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${debtClarity === '-5' ? 'selected' : ''}>-5: Complete avoidance, no idea what I owe</option>
          <option value="-4" ${debtClarity === '-4' ? 'selected' : ''}>-4: Major avoidance, vague dread</option>
          <option value="-3" ${debtClarity === '-3' ? 'selected' : ''}>-3: Only know when denied credit</option>
          <option value="-2" ${debtClarity === '-2' ? 'selected' : ''}>-2: Rough idea, very disorganized</option>
          <option value="-1" ${debtClarity === '-1' ? 'selected' : ''}>-1: Vague awareness, no system</option>
          <option value="1" ${debtClarity === '1' ? 'selected' : ''}>+1: Monthly check-ins, basic tracking</option>
          <option value="2" ${debtClarity === '2' ? 'selected' : ''}>+2: Organized list, aware of totals</option>
          <option value="3" ${debtClarity === '3' ? 'selected' : ''}>+3: Organized, reviewed monthly</option>
          <option value="4" ${debtClarity === '4' ? 'selected' : ''}>+4: Strategic tracking with payoff plan</option>
          <option value="5" ${debtClarity === '5' ? 'selected' : ''}>+5: Complete clarity, optimized payoff strategy</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q26. Is your total debt trending up or down? *</label>
        <select name="debtTrending" required>
          <option value="">Select a response</option>
          <option value="-5" ${debtTrending === '-5' ? 'selected' : ''}>-5: Rapidly increasing, losing control</option>
          <option value="-4" ${debtTrending === '-4' ? 'selected' : ''}>-4: Steadily increasing, concerning</option>
          <option value="-3" ${debtTrending === '-3' ? 'selected' : ''}>-3: Slowly increasing</option>
          <option value="-2" ${debtTrending === '-2' ? 'selected' : ''}>-2: Mostly stagnant, slight increase</option>
          <option value="-1" ${debtTrending === '-1' ? 'selected' : ''}>-1: Stagnant for 6+ months</option>
          <option value="1" ${debtTrending === '1' ? 'selected' : ''}>+1: Slowly decreasing</option>
          <option value="2" ${debtTrending === '2' ? 'selected' : ''}>+2: Steadily decreasing</option>
          <option value="3" ${debtTrending === '3' ? 'selected' : ''}>+3: Rapidly decreasing, clear progress</option>
          <option value="4" ${debtTrending === '4' ? 'selected' : ''}>+4: Nearly eliminated</option>
          <option value="5" ${debtTrending === '5' ? 'selected' : ''}>+5: Zero debt or debt-free</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q27. How often do you review your debt position? *</label>
        <select name="debtReview" required>
          <option value="">Select a response</option>
          <option value="-5" ${debtReview === '-5' ? 'selected' : ''}>-5: Never, complete avoidance</option>
          <option value="-4" ${debtReview === '-4' ? 'selected' : ''}>-4: Rarely, only in crisis</option>
          <option value="-3" ${debtReview === '-3' ? 'selected' : ''}>-3: Only when there's a problem</option>
          <option value="-2" ${debtReview === '-2' ? 'selected' : ''}>-2: Sporadic, no pattern</option>
          <option value="-1" ${debtReview === '-1' ? 'selected' : ''}>-1: Occasionally check balance</option>
          <option value="1" ${debtReview === '1' ? 'selected' : ''}>+1: Monthly glance at totals</option>
          <option value="2" ${debtReview === '2' ? 'selected' : ''}>+2: Monthly basic review</option>
          <option value="3" ${debtReview === '3' ? 'selected' : ''}>+3: Monthly strategic review with plan</option>
          <option value="4" ${debtReview === '4' ? 'selected' : ''}>+4: Weekly tracking, active payoff</option>
          <option value="5" ${debtReview === '5' ? 'selected' : ''}>+5: Continuous monitoring, optimized strategy</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q28. What is your stress level around debt? *</label>
        <select name="debtStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${debtStress === '-5' ? 'selected' : ''}>-5: Crushing anxiety, constant fear, affects daily life</option>
          <option value="-4" ${debtStress === '-4' ? 'selected' : ''}>-4: Severe stress, frequent panic</option>
          <option value="-3" ${debtStress === '-3' ? 'selected' : ''}>-3: High stress, major worry</option>
          <option value="-2" ${debtStress === '-2' ? 'selected' : ''}>-2: Regular stress and concern</option>
          <option value="-1" ${debtStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${debtStress === '1' ? 'selected' : ''}>+1: Aware but not stressed</option>
          <option value="2" ${debtStress === '2' ? 'selected' : ''}>+2: Comfortable with repayment plan</option>
          <option value="3" ${debtStress === '3' ? 'selected' : ''}>+3: Confident in strategy</option>
          <option value="4" ${debtStress === '4' ? 'selected' : ''}>+4: Minimal stress, clear path</option>
          <option value="5" ${debtStress === '5' ? 'selected' : ''}>+5: No debt stress (zero debt or well-managed)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q29. List your current debts *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">List each debt type separated by commas. Include approximate amounts if comfortable.</p>
        <p class="muted" style="font-size: 12px; margin-bottom: 10px; font-style: italic;">Example: Credit card ($8,000), student loans ($35,000), car loan ($12,000), personal loan ($5,000), medical debt ($2,500)</p>
        <textarea name="currentDebts" rows="4" required placeholder="List your current debts here...">${currentDebts}</textarea>
      </div>

      <!-- Emergency Fund Questions -->
      <h3 style="margin-top: 40px;">Emergency Fund</h3>

      <div class="form-group">
        <label class="form-label">Q30. Do you maintain a separate emergency fund? *</label>
        <select name="emergencyFundMaintenance" required>
          <option value="">Select a response</option>
          <option value="-5" ${emergencyFundMaintenance === '-5' ? 'selected' : ''}>-5: No fund, no awareness, no plan</option>
          <option value="-4" ${emergencyFundMaintenance === '-4' ? 'selected' : ''}>-4: Aware I should, but nothing set aside</option>
          <option value="-3" ${emergencyFundMaintenance === '-3' ? 'selected' : ''}>-3: Mental number, not actually separate</option>
          <option value="-2" ${emergencyFundMaintenance === '-2' ? 'selected' : ''}>-2: Track amount within checking, not separate</option>
          <option value="-1" ${emergencyFundMaintenance === '-1' ? 'selected' : ''}>-1: Separate tracking, same account</option>
          <option value="1" ${emergencyFundMaintenance === '1' ? 'selected' : ''}>+1: Separate account, access it frequently</option>
          <option value="2" ${emergencyFundMaintenance === '2' ? 'selected' : ''}>+2: Separate account, occasional access</option>
          <option value="3" ${emergencyFundMaintenance === '3' ? 'selected' : ''}>+3: Separate account, rare access</option>
          <option value="4" ${emergencyFundMaintenance === '4' ? 'selected' : ''}>+4: Separate account, only real emergencies</option>
          <option value="5" ${emergencyFundMaintenance === '5' ? 'selected' : ''}>+5: Fully funded, sacred, untouchable except true crisis</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q31. How many months of expenses does your emergency fund cover? *</label>
        <select name="emergencyFundMonths" required>
          <option value="">Select a response</option>
          <option value="-5" ${emergencyFundMonths === '-5' ? 'selected' : ''}>-5: Zero months, no fund</option>
          <option value="-4" ${emergencyFundMonths === '-4' ? 'selected' : ''}>-4: Less than 2 weeks</option>
          <option value="-3" ${emergencyFundMonths === '-3' ? 'selected' : ''}>-3: Less than 1 month</option>
          <option value="-2" ${emergencyFundMonths === '-2' ? 'selected' : ''}>-2: 1 month</option>
          <option value="-1" ${emergencyFundMonths === '-1' ? 'selected' : ''}>-1: 1-2 months</option>
          <option value="1" ${emergencyFundMonths === '1' ? 'selected' : ''}>+1: 2-3 months</option>
          <option value="2" ${emergencyFundMonths === '2' ? 'selected' : ''}>+2: 3-4 months</option>
          <option value="3" ${emergencyFundMonths === '3' ? 'selected' : ''}>+3: 4-6 months</option>
          <option value="4" ${emergencyFundMonths === '4' ? 'selected' : ''}>+4: 6-9 months</option>
          <option value="5" ${emergencyFundMonths === '5' ? 'selected' : ''}>+5: 9+ months</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q32. How often do you tap into your emergency fund? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">If you don't have a fund, select the option that best describes how often you would need emergency money.</p>
        <select name="emergencyFundFrequency" required>
          <option value="">Select a response</option>
          <option value="-5" ${emergencyFundFrequency === '-5' ? 'selected' : ''}>-5: Multiple times per month (not emergencies)</option>
          <option value="-4" ${emergencyFundFrequency === '-4' ? 'selected' : ''}>-4: Weekly or bi-weekly</option>
          <option value="-3" ${emergencyFundFrequency === '-3' ? 'selected' : ''}>-3: Monthly</option>
          <option value="-2" ${emergencyFundFrequency === '-2' ? 'selected' : ''}>-2: Every other month</option>
          <option value="-1" ${emergencyFundFrequency === '-1' ? 'selected' : ''}>-1: Every few months</option>
          <option value="1" ${emergencyFundFrequency === '1' ? 'selected' : ''}>+1: Quarterly</option>
          <option value="2" ${emergencyFundFrequency === '2' ? 'selected' : ''}>+2: 2-3 times per year</option>
          <option value="3" ${emergencyFundFrequency === '3' ? 'selected' : ''}>+3: Once per year</option>
          <option value="4" ${emergencyFundFrequency === '4' ? 'selected' : ''}>+4: Every few years</option>
          <option value="5" ${emergencyFundFrequency === '5' ? 'selected' : ''}>+5: Rarely or never (truly only emergencies)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q33. How quickly can you replenish your emergency fund after use? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">If you don't have a fund, select the option that describes how quickly you could save up emergency money if needed.</p>
        <select name="emergencyFundReplenishment" required>
          <option value="">Select a response</option>
          <option value="-5" ${emergencyFundReplenishment === '-5' ? 'selected' : ''}>-5: Cannot replenish, goes deeper in debt</option>
          <option value="-4" ${emergencyFundReplenishment === '-4' ? 'selected' : ''}>-4: Many months, very painful</option>
          <option value="-3" ${emergencyFundReplenishment === '-3' ? 'selected' : ''}>-3: Several months, difficult</option>
          <option value="-2" ${emergencyFundReplenishment === '-2' ? 'selected' : ''}>-2: 2-3 months, challenging</option>
          <option value="-1" ${emergencyFundReplenishment === '-1' ? 'selected' : ''}>-1: 1-2 months, manageable</option>
          <option value="1" ${emergencyFundReplenishment === '1' ? 'selected' : ''}>+1: 3-4 weeks</option>
          <option value="2" ${emergencyFundReplenishment === '2' ? 'selected' : ''}>+2: 2-3 weeks</option>
          <option value="3" ${emergencyFundReplenishment === '3' ? 'selected' : ''}>+3: 1-2 weeks</option>
          <option value="4" ${emergencyFundReplenishment === '4' ? 'selected' : ''}>+4: Within days</option>
          <option value="5" ${emergencyFundReplenishment === '5' ? 'selected' : ''}>+5: Immediately or single paycheck</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q34. What is your stress level around emergency preparedness? *</label>
        <select name="emergencyFundStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${emergencyFundStress === '-5' ? 'selected' : ''}>-5: Constant fear, paralyzing anxiety about unexpected expenses</option>
          <option value="-4" ${emergencyFundStress === '-4' ? 'selected' : ''}>-4: High anxiety, frequently worried</option>
          <option value="-3" ${emergencyFundStress === '-3' ? 'selected' : ''}>-3: Significant worry about "what if" scenarios</option>
          <option value="-2" ${emergencyFundStress === '-2' ? 'selected' : ''}>-2: Regular concern about preparedness</option>
          <option value="-1" ${emergencyFundStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${emergencyFundStress === '1' ? 'selected' : ''}>+1: Somewhat confident</option>
          <option value="2" ${emergencyFundStress === '2' ? 'selected' : ''}>+2: Generally prepared</option>
          <option value="3" ${emergencyFundStress === '3' ? 'selected' : ''}>+3: Feel prepared for most situations</option>
          <option value="4" ${emergencyFundStress === '4' ? 'selected' : ''}>+4: Very confident, well-prepared</option>
          <option value="5" ${emergencyFundStress === '5' ? 'selected' : ''}>+5: Complete confidence, zero fear, rock-solid security</option>
        </select>
      </div>
    `;
  },

  /**
   * PAGE 4: Growth Domain - Savings, Investments, Retirement
   * Q35-Q47: Growth clarity and stress
   */
  renderPage4Content(data, clientId) {
    // Extract existing data with defaults
    const savingsLevel = data.savingsLevel || '';
    const savingsRegularity = data.savingsRegularity || '';
    const savingsClarity = data.savingsClarity || '';
    const savingsStress = data.savingsStress || '';
    const investmentActivity = data.investmentActivity || '';
    const investmentClarity = data.investmentClarity || '';
    const investmentConfidence = data.investmentConfidence || '';
    const investmentStress = data.investmentStress || '';
    const investmentTypes = data.investmentTypes || '';
    const retirementAccounts = data.retirementAccounts || '';
    const retirementFunding = data.retirementFunding || '';
    const retirementConfidence = data.retirementConfidence || '';
    const retirementStress = data.retirementStress || '';

    return `
      <h2>📈 Growth Domain</h2>
      <p class="muted mb-20">Understanding your savings, investments, and retirement awareness (13 questions)</p>

      <!-- Savings Questions -->
      <h3 style="margin-top: 30px;">Savings</h3>

      <div class="form-group">
        <label class="form-label">Q35. What level of savings do you maintain beyond your emergency fund? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Don't include your emergency fund in this answer. This is money saved for goals, planned purchases, or general cushion.</p>
        <select name="savingsLevel" required>
          <option value="">Select a response</option>
          <option value="-5" ${savingsLevel === '-5' ? 'selected' : ''}>-5: Zero savings beyond emergency fund (or no emergency fund either)</option>
          <option value="-4" ${savingsLevel === '-4' ? 'selected' : ''}>-4: Under $1,000 in additional savings</option>
          <option value="-3" ${savingsLevel === '-3' ? 'selected' : ''}>-3: Less than 1 month income in savings</option>
          <option value="-2" ${savingsLevel === '-2' ? 'selected' : ''}>-2: 1-2 months income</option>
          <option value="-1" ${savingsLevel === '-1' ? 'selected' : ''}>-1: 2-3 months income</option>
          <option value="1" ${savingsLevel === '1' ? 'selected' : ''}>+1: 3-4 months income</option>
          <option value="2" ${savingsLevel === '2' ? 'selected' : ''}>+2: 4-6 months income</option>
          <option value="3" ${savingsLevel === '3' ? 'selected' : ''}>+3: 6-9 months income</option>
          <option value="4" ${savingsLevel === '4' ? 'selected' : ''}>+4: 9-12 months income</option>
          <option value="5" ${savingsLevel === '5' ? 'selected' : ''}>+5: 12+ months income in savings</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q36. How regularly do you contribute to savings? *</label>
        <select name="savingsRegularity" required>
          <option value="">Select a response</option>
          <option value="-5" ${savingsRegularity === '-5' ? 'selected' : ''}>-5: Never, withdrawing instead</option>
          <option value="-4" ${savingsRegularity === '-4' ? 'selected' : ''}>-4: Rarely, almost never</option>
          <option value="-3" ${savingsRegularity === '-3' ? 'selected' : ''}>-3: Very rarely</option>
          <option value="-2" ${savingsRegularity === '-2' ? 'selected' : ''}>-2: Sporadic, no pattern</option>
          <option value="-1" ${savingsRegularity === '-1' ? 'selected' : ''}>-1: When I remember or have extra</option>
          <option value="1" ${savingsRegularity === '1' ? 'selected' : ''}>+1: Trying, but inconsistent</option>
          <option value="2" ${savingsRegularity === '2' ? 'selected' : ''}>+2: Most months, not automatic</option>
          <option value="3" ${savingsRegularity === '3' ? 'selected' : ''}>+3: Consistent monthly contributions</option>
          <option value="4" ${savingsRegularity === '4' ? 'selected' : ''}>+4: Automatic, regular, intentional</option>
          <option value="5" ${savingsRegularity === '5' ? 'selected' : ''}>+5: Automatic, maxed out, strategic</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q37. What level of clarity do you maintain on savings? *</label>
        <select name="savingsClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${savingsClarity === '-5' ? 'selected' : ''}>-5: No idea, mixed with everything else</option>
          <option value="-4" ${savingsClarity === '-4' ? 'selected' : ''}>-4: Vague sense, very unclear</option>
          <option value="-3" ${savingsClarity === '-3' ? 'selected' : ''}>-3: Multiple accounts, unclear purpose</option>
          <option value="-2" ${savingsClarity === '-2' ? 'selected' : ''}>-2: Know approximate balance</option>
          <option value="-1" ${savingsClarity === '-1' ? 'selected' : ''}>-1: Separate but don't track</option>
          <option value="1" ${savingsClarity === '1' ? 'selected' : ''}>+1: Track balance, vague purpose</option>
          <option value="2" ${savingsClarity === '2' ? 'selected' : ''}>+2: Track regularly, general goals</option>
          <option value="3" ${savingsClarity === '3' ? 'selected' : ''}>+3: Track regularly, clear purpose</option>
          <option value="4" ${savingsClarity === '4' ? 'selected' : ''}>+4: Monthly planning, specific goals</option>
          <option value="5" ${savingsClarity === '5' ? 'selected' : ''}>+5: Strategic allocation, optimized for goals</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q38. What is your stress level around savings? *</label>
        <select name="savingsStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${savingsStress === '-5' ? 'selected' : ''}>-5: Constant anxiety about lack of savings</option>
          <option value="-4" ${savingsStress === '-4' ? 'selected' : ''}>-4: High stress, feel financially vulnerable</option>
          <option value="-3" ${savingsStress === '-3' ? 'selected' : ''}>-3: Significant worry about insufficient savings</option>
          <option value="-2" ${savingsStress === '-2' ? 'selected' : ''}>-2: Regular concern about saving enough</option>
          <option value="-1" ${savingsStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${savingsStress === '1' ? 'selected' : ''}>+1: Generally comfortable with savings</option>
          <option value="2" ${savingsStress === '2' ? 'selected' : ''}>+2: Mostly confident in savings trajectory</option>
          <option value="3" ${savingsStress === '3' ? 'selected' : ''}>+3: Confident in savings strategy</option>
          <option value="4" ${savingsStress === '4' ? 'selected' : ''}>+4: Very confident, good cushion</option>
          <option value="5" ${savingsStress === '5' ? 'selected' : ''}>+5: Zero stress, ample savings, secure</option>
        </select>
      </div>

      <!-- Investments Questions -->
      <h3 style="margin-top: 40px;">Investments</h3>

      <div class="form-group">
        <label class="form-label">Q39. Do you invest outside your own business? *</label>
        <select name="investmentActivity" required>
          <option value="">Select a response</option>
          <option value="-5" ${investmentActivity === '-5' ? 'selected' : ''}>-5: Never, no investments, don't understand them</option>
          <option value="-4" ${investmentActivity === '-4' ? 'selected' : ''}>-4: Thought about it, never started</option>
          <option value="-3" ${investmentActivity === '-3' ? 'selected' : ''}>-3: Once or twice, no follow-through</option>
          <option value="-2" ${investmentActivity === '-2' ? 'selected' : ''}>-2: Very randomly, no strategy</option>
          <option value="-1" ${investmentActivity === '-1' ? 'selected' : ''}>-1: Occasionally, no real plan</option>
          <option value="1" ${investmentActivity === '1' ? 'selected' : ''}>+1: Starting, basic strategy</option>
          <option value="2" ${investmentActivity === '2' ? 'selected' : ''}>+2: Regular, developing strategy</option>
          <option value="3" ${investmentActivity === '3' ? 'selected' : ''}>+3: Consistent, solid strategy</option>
          <option value="4" ${investmentActivity === '4' ? 'selected' : ''}>+4: Strategic, diversified, intentional</option>
          <option value="5" ${investmentActivity === '5' ? 'selected' : ''}>+5: Optimized portfolio, sophisticated strategy</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q40. What level of clarity do you maintain on investments? *</label>
        <select name="investmentClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${investmentClarity === '-5' ? 'selected' : ''}>-5: None (or no investments)</option>
          <option value="-4" ${investmentClarity === '-4' ? 'selected' : ''}>-4: Have some, no idea how they're doing</option>
          <option value="-3" ${investmentClarity === '-3' ? 'selected' : ''}>-3: Know amount invested, nothing else</option>
          <option value="-2" ${investmentClarity === '-2' ? 'selected' : ''}>-2: Vague awareness, rarely check</option>
          <option value="-1" ${investmentClarity === '-1' ? 'selected' : ''}>-1: Annual review at best</option>
          <option value="1" ${investmentClarity === '1' ? 'selected' : ''}>+1: Semi-annual reviews</option>
          <option value="2" ${investmentClarity === '2' ? 'selected' : ''}>+2: Quarterly check-ins</option>
          <option value="3" ${investmentClarity === '3' ? 'selected' : ''}>+3: Monthly tracking</option>
          <option value="4" ${investmentClarity === '4' ? 'selected' : ''}>+4: Regular monitoring, adjusting strategy</option>
          <option value="5" ${investmentClarity === '5' ? 'selected' : ''}>+5: Complete clarity, optimized, rebalanced regularly</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q41. How confident are you in your investment strategy? *</label>
        <select name="investmentConfidence" required>
          <option value="">Select a response</option>
          <option value="-5" ${investmentConfidence === '-5' ? 'selected' : ''}>-5: No confidence (or no investments)</option>
          <option value="-4" ${investmentConfidence === '-4' ? 'selected' : ''}>-4: Major doubts, feel lost</option>
          <option value="-3" ${investmentConfidence === '-3' ? 'selected' : ''}>-3: Hope for the best, not confident</option>
          <option value="-2" ${investmentConfidence === '-2' ? 'selected' : ''}>-2: Unsure, questioning choices</option>
          <option value="-1" ${investmentConfidence === '-1' ? 'selected' : ''}>-1: Trying, but not confident</option>
          <option value="1" ${investmentConfidence === '1' ? 'selected' : ''}>+1: Moving in right direction, too slow</option>
          <option value="2" ${investmentConfidence === '2' ? 'selected' : ''}>+2: Somewhat confident</option>
          <option value="3" ${investmentConfidence === '3' ? 'selected' : ''}>+3: Pretty confident, on track</option>
          <option value="4" ${investmentConfidence === '4' ? 'selected' : ''}>+4: Very confident, solid plan</option>
          <option value="5" ${investmentConfidence === '5' ? 'selected' : ''}>+5: 100% confident in reaching goals</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q42. What is your stress level around investments? *</label>
        <select name="investmentStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${investmentStress === '-5' ? 'selected' : ''}>-5: Constant anxiety, afraid to invest or afraid of losses</option>
          <option value="-4" ${investmentStress === '-4' ? 'selected' : ''}>-4: High stress about investment decisions</option>
          <option value="-3" ${investmentStress === '-3' ? 'selected' : ''}>-3: Significant worry about performance or lack of investments</option>
          <option value="-2" ${investmentStress === '-2' ? 'selected' : ''}>-2: Regular concern about investment strategy</option>
          <option value="-1" ${investmentStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${investmentStress === '1' ? 'selected' : ''}>+1: Generally comfortable with investments</option>
          <option value="2" ${investmentStress === '2' ? 'selected' : ''}>+2: Mostly confident in approach</option>
          <option value="3" ${investmentStress === '3' ? 'selected' : ''}>+3: Confident in investment decisions</option>
          <option value="4" ${investmentStress === '4' ? 'selected' : ''}>+4: Very confident, minimal stress</option>
          <option value="5" ${investmentStress === '5' ? 'selected' : ''}>+5: Zero stress, trust the process, long-term mindset</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q43. List your main investment types *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">List your investment types separated by commas. Include approximate amounts if comfortable.</p>
        <p class="muted" style="font-size: 12px; margin-bottom: 10px; font-style: italic;">Example: 401k ($50k), Roth IRA ($25k), taxable brokerage ($15k), rental property, index funds, individual stocks, cryptocurrency</p>
        <textarea name="investmentTypes" rows="4" required placeholder="List your main investment types here...">${investmentTypes}</textarea>
      </div>

      <!-- Retirement Questions -->
      <h3 style="margin-top: 40px;">Retirement</h3>

      <div class="form-group">
        <label class="form-label">Q44. What retirement accounts do you maintain? *</label>
        <select name="retirementAccounts" required>
          <option value="">Select a response</option>
          <option value="-5" ${retirementAccounts === '-5' ? 'selected' : ''}>-5: No retirement accounts, no plan</option>
          <option value="-4" ${retirementAccounts === '-4' ? 'selected' : ''}>-4: Aware I should, but nothing started</option>
          <option value="-3" ${retirementAccounts === '-3' ? 'selected' : ''}>-3: One account, someone else manages, don't track</option>
          <option value="-2" ${retirementAccounts === '-2' ? 'selected' : ''}>-2: One account, rarely review</option>
          <option value="-1" ${retirementAccounts === '-1' ? 'selected' : ''}>-1: One account, sporadic contributions</option>
          <option value="1" ${retirementAccounts === '1' ? 'selected' : ''}>+1: One account, regular contributions</option>
          <option value="2" ${retirementAccounts === '2' ? 'selected' : ''}>+2: Multiple accounts, managing myself</option>
          <option value="3" ${retirementAccounts === '3' ? 'selected' : ''}>+3: Multiple accounts, strategic approach</option>
          <option value="4" ${retirementAccounts === '4' ? 'selected' : ''}>+4: Optimizing multiple account types</option>
          <option value="5" ${retirementAccounts === '5' ? 'selected' : ''}>+5: Maximized all available (401k, IRA, HSA, etc.)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q45. How regularly and fully do you fund retirement accounts? *</label>
        <select name="retirementFunding" required>
          <option value="">Select a response</option>
          <option value="-5" ${retirementFunding === '-5' ? 'selected' : ''}>-5: Never fund, no contributions</option>
          <option value="-4" ${retirementFunding === '-4' ? 'selected' : ''}>-4: Contributed a few times total, stopped</option>
          <option value="-3" ${retirementFunding === '-3' ? 'selected' : ''}>-3: Very rarely, sporadic</option>
          <option value="-2" ${retirementFunding === '-2' ? 'selected' : ''}>-2: Occasionally, well below capacity</option>
          <option value="-1" ${retirementFunding === '-1' ? 'selected' : ''}>-1: Inconsistent, partial contributions</option>
          <option value="1" ${retirementFunding === '1' ? 'selected' : ''}>+1: Regular but not fully funding</option>
          <option value="2" ${retirementFunding === '2' ? 'selected' : ''}>+2: Regular, funding to employer match</option>
          <option value="3" ${retirementFunding === '3' ? 'selected' : ''}>+3: Regular, beyond employer match</option>
          <option value="4" ${retirementFunding === '4' ? 'selected' : ''}>+4: Automatic, near-maximum contributions</option>
          <option value="5" ${retirementFunding === '5' ? 'selected' : ''}>+5: Automatic, maxed out all accounts</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q46. How confident are you in your retirement strategy? *</label>
        <select name="retirementConfidence" required>
          <option value="">Select a response</option>
          <option value="-5" ${retirementConfidence === '-5' ? 'selected' : ''}>-5: No confidence, expect to work forever</option>
          <option value="-4" ${retirementConfidence === '-4' ? 'selected' : ''}>-4: Very low confidence, major anxiety</option>
          <option value="-3" ${retirementConfidence === '-3' ? 'selected' : ''}>-3: Hoping for luck or inheritance</option>
          <option value="-2" ${retirementConfidence === '-2' ? 'selected' : ''}>-2: Uncertain, worried</option>
          <option value="-1" ${retirementConfidence === '-1' ? 'selected' : ''}>-1: Trying but unsure if it's enough</option>
          <option value="1" ${retirementConfidence === '1' ? 'selected' : ''}>+1: Slow progress, long road ahead</option>
          <option value="2" ${retirementConfidence === '2' ? 'selected' : ''}>+2: Decent progress, need to do more</option>
          <option value="3" ${retirementConfidence === '3' ? 'selected' : ''}>+3: Pretty sure I'll get there</option>
          <option value="4" ${retirementConfidence === '4' ? 'selected' : ''}>+4: Very confident, on solid track</option>
          <option value="5" ${retirementConfidence === '5' ? 'selected' : ''}>+5: 100% confident, retirement secured</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q47. What is your stress level around retirement preparedness? *</label>
        <select name="retirementStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${retirementStress === '-5' ? 'selected' : ''}>-5: Constant anxiety, fear of working forever or poverty in old age</option>
          <option value="-4" ${retirementStress === '-4' ? 'selected' : ''}>-4: High stress about retirement security</option>
          <option value="-3" ${retirementStress === '-3' ? 'selected' : ''}>-3: Significant worry about retirement readiness</option>
          <option value="-2" ${retirementStress === '-2' ? 'selected' : ''}>-2: Regular concern about retirement preparation</option>
          <option value="-1" ${retirementStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${retirementStress === '1' ? 'selected' : ''}>+1: Generally hopeful about retirement</option>
          <option value="2" ${retirementStress === '2' ? 'selected' : ''}>+2: Mostly confident in retirement trajectory</option>
          <option value="3" ${retirementStress === '3' ? 'selected' : ''}>+3: Confident in retirement plan</option>
          <option value="4" ${retirementStress === '4' ? 'selected' : ''}>+4: Very confident, on track</option>
          <option value="5" ${retirementStress === '5' ? 'selected' : ''}>+5: Zero stress, retirement secured, clear path</option>
        </select>
      </div>
    `;
  },

  /**
   * PAGE 5: Protection + Psychological + Adaptive
   * Q48-Q56: Protection, psychological, and trauma-adaptive questions
   */
  renderPage5Content(data, clientId) {
    // Extract existing data with defaults
    const insurancePolicies = data.insurancePolicies || '';
    const insuranceClarity = data.insuranceClarity || '';
    const insuranceConfidence = data.insuranceConfidence || '';
    const insuranceStress = data.insuranceStress || '';
    const financialEmotions = data.financialEmotions || '';
    const primaryObstacle = data.primaryObstacle || '';
    const goalConfidence = data.goalConfidence || '';

    // Get Tool 1 trauma data to determine adaptive questions
    const tool1Data = this.getTool1TraumaData(clientId);
    const topTrauma = tool1Data.topTrauma || 'FSV'; // Default to FSV if no Tool 1 data

    // Extract adaptive question data
    const adaptiveScale = data.adaptiveScale || '';
    const adaptiveImpact = data.adaptiveImpact || '';

    return `
      <h2>🛡️ Protection + Psychological</h2>
      <p class="muted mb-20">Understanding your insurance protection and financial psychology (9 questions)</p>

      <!-- Insurance Protection Questions -->
      <h3 style="margin-top: 30px;">Insurance Protection</h3>

      <div class="form-group">
        <label class="form-label">Q48. What insurance policies do you maintain? *</label>
        <select name="insurancePolicies" required>
          <option value="">Select a response</option>
          <option value="-5" ${insurancePolicies === '-5' ? 'selected' : ''}>-5: None, even required by law</option>
          <option value="-4" ${insurancePolicies === '-4' ? 'selected' : ''}>-4: Only what's absolutely forced (car if have one)</option>
          <option value="-3" ${insurancePolicies === '-3' ? 'selected' : ''}>-3: Only legally required, minimal coverage</option>
          <option value="-2" ${insurancePolicies === '-2' ? 'selected' : ''}>-2: Required policies, basic coverage levels</option>
          <option value="-1" ${insurancePolicies === '-1' ? 'selected' : ''}>-1: Required policies, appropriate levels</option>
          <option value="1" ${insurancePolicies === '1' ? 'selected' : ''}>+1: All necessary, sufficient coverage</option>
          <option value="2" ${insurancePolicies === '2' ? 'selected' : ''}>+2: Necessary plus some supplemental</option>
          <option value="3" ${insurancePolicies === '3' ? 'selected' : ''}>+3: Comprehensive coverage (includes disability, umbrella)</option>
          <option value="4" ${insurancePolicies === '4' ? 'selected' : ''}>+4: Sophisticated coverage, wealth protection</option>
          <option value="5" ${insurancePolicies === '5' ? 'selected' : ''}>+5: Optimized insurance strategy, family wealth planning</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q49. What level of clarity do you have on your coverage? *</label>
        <select name="insuranceClarity" required>
          <option value="">Select a response</option>
          <option value="-5" ${insuranceClarity === '-5' ? 'selected' : ''}>-5: No idea what I have or need</option>
          <option value="-4" ${insuranceClarity === '-4' ? 'selected' : ''}>-4: Know I have "insurance," nothing else</option>
          <option value="-3" ${insuranceClarity === '-3' ? 'selected' : ''}>-3: Know I have it, don't know details</option>
          <option value="-2" ${insuranceClarity === '-2' ? 'selected' : ''}>-2: Know basic coverage types</option>
          <option value="-1" ${insuranceClarity === '-1' ? 'selected' : ''}>-1: Know coverage amounts</option>
          <option value="1" ${insuranceClarity === '1' ? 'selected' : ''}>+1: Know coverage and deductibles</option>
          <option value="2" ${insuranceClarity === '2' ? 'selected' : ''}>+2: Know coverage, deductibles, exclusions</option>
          <option value="3" ${insuranceClarity === '3' ? 'selected' : ''}>+3: Understand all policy details</option>
          <option value="4" ${insuranceClarity === '4' ? 'selected' : ''}>+4: Regularly review and optimize</option>
          <option value="5" ${insuranceClarity === '5' ? 'selected' : ''}>+5: Complete clarity, strategically designed</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q50. How confident are you in your insurance protection? *</label>
        <select name="insuranceConfidence" required>
          <option value="">Select a response</option>
          <option value="-5" ${insuranceConfidence === '-5' ? 'selected' : ''}>-5: No confidence, will be ruined if something happens</option>
          <option value="-4" ${insuranceConfidence === '-4' ? 'selected' : ''}>-4: Very worried, major gaps</option>
          <option value="-3" ${insuranceConfidence === '-3' ? 'selected' : ''}>-3: Little confidence, likely underinsured</option>
          <option value="-2" ${insuranceConfidence === '-2' ? 'selected' : ''}>-2: Uncertain, might be okay</option>
          <option value="-1" ${insuranceConfidence === '-1' ? 'selected' : ''}>-1: Hope I'm covered</option>
          <option value="1" ${insuranceConfidence === '1' ? 'selected' : ''}>+1: Probably okay for normal events</option>
          <option value="2" ${insuranceConfidence === '2' ? 'selected' : ''}>+2: Generally confident</option>
          <option value="3" ${insuranceConfidence === '3' ? 'selected' : ''}>+3: Covered for most problems</option>
          <option value="4" ${insuranceConfidence === '4' ? 'selected' : ''}>+4: Very confident, well-protected</option>
          <option value="5" ${insuranceConfidence === '5' ? 'selected' : ''}>+5: 100% confident for any situation</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q51. What is your stress level around insurance and protection? *</label>
        <select name="insuranceStress" required>
          <option value="">Select a response</option>
          <option value="-5" ${insuranceStress === '-5' ? 'selected' : ''}>-5: Constant fear about catastrophic uninsured events</option>
          <option value="-4" ${insuranceStress === '-4' ? 'selected' : ''}>-4: High anxiety about lack of protection</option>
          <option value="-3" ${insuranceStress === '-3' ? 'selected' : ''}>-3: Significant worry about coverage gaps</option>
          <option value="-2" ${insuranceStress === '-2' ? 'selected' : ''}>-2: Regular concern about insurance adequacy</option>
          <option value="-1" ${insuranceStress === '-1' ? 'selected' : ''}>-1: Occasional worry</option>
          <option value="1" ${insuranceStress === '1' ? 'selected' : ''}>+1: Generally feel protected</option>
          <option value="2" ${insuranceStress === '2' ? 'selected' : ''}>+2: Mostly confident in coverage</option>
          <option value="3" ${insuranceStress === '3' ? 'selected' : ''}>+3: Confident in protection strategy</option>
          <option value="4" ${insuranceStress === '4' ? 'selected' : ''}>+4: Very confident, well-insured</option>
          <option value="5" ${insuranceStress === '5' ? 'selected' : ''}>+5: Zero stress, comprehensive protection, secure</option>
        </select>
      </div>

      <!-- Psychological Clarity Section -->
      <h3 style="margin-top: 40px;">Psychological Clarity</h3>

      <div class="form-group">
        <label class="form-label">Q52. What emotions arise when you think about reviewing your finances? *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">Be honest about the emotions that come up. There are no wrong answers.</p>
        <p class="muted" style="font-size: 12px; margin-bottom: 10px; font-style: italic;">Example: Anxiety, guilt, fear, shame, excitement, confidence, overwhelm, dread, hope, paralysis, empowerment, avoidance, etc.</p>
        <textarea name="financialEmotions" rows="4" required placeholder="Describe the emotions you feel...">${financialEmotions}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Q53. What is your PRIMARY obstacle to gaining financial clarity? *</label>
        <select name="primaryObstacle" required>
          <option value="">Select your primary obstacle</option>
          <option value="lack-of-time" ${primaryObstacle === 'lack-of-time' ? 'selected' : ''}>Lack of time / too busy</option>
          <option value="overwhelming-complexity" ${primaryObstacle === 'overwhelming-complexity' ? 'selected' : ''}>Overwhelming complexity, don't know where to start</option>
          <option value="emotional-avoidance" ${primaryObstacle === 'emotional-avoidance' ? 'selected' : ''}>Emotional avoidance (fear, shame, anxiety)</option>
          <option value="lack-of-knowledge" ${primaryObstacle === 'lack-of-knowledge' ? 'selected' : ''}>Lack of knowledge or skills</option>
          <option value="inconsistent-income" ${primaryObstacle === 'inconsistent-income' ? 'selected' : ''}>Inconsistent income makes planning impossible</option>
          <option value="too-much-debt" ${primaryObstacle === 'too-much-debt' ? 'selected' : ''}>Too much debt to face</option>
          <option value="past-trauma" ${primaryObstacle === 'past-trauma' ? 'selected' : ''}>Past financial trauma or mistakes</option>
          <option value="dont-trust-myself" ${primaryObstacle === 'dont-trust-myself' ? 'selected' : ''}>Don't trust myself with money</option>
          <option value="fear-of-discovery" ${primaryObstacle === 'fear-of-discovery' ? 'selected' : ''}>Fear of what I'll discover</option>
          <option value="partner-resistance" ${primaryObstacle === 'partner-resistance' ? 'selected' : ''}>Partner/spouse doesn't want to discuss it</option>
          <option value="other" ${primaryObstacle === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Q54. How confident are you in achieving your financial goals? *</label>
        <select name="goalConfidence" required>
          <option value="">Select a response</option>
          <option value="-5" ${goalConfidence === '-5' ? 'selected' : ''}>-5: No chance, feels completely impossible</option>
          <option value="-4" ${goalConfidence === '-4' ? 'selected' : ''}>-4: Extremely unlikely</option>
          <option value="-3" ${goalConfidence === '-3' ? 'selected' : ''}>-3: Long shot, probably won't happen</option>
          <option value="-2" ${goalConfidence === '-2' ? 'selected' : ''}>-2: Unlikely without major changes</option>
          <option value="-1" ${goalConfidence === '-1' ? 'selected' : ''}>-1: Possible but unlikely</option>
          <option value="1" ${goalConfidence === '1' ? 'selected' : ''}>+1: Maybe, if things go right</option>
          <option value="2" ${goalConfidence === '2' ? 'selected' : ''}>+2: Decent chance</option>
          <option value="3" ${goalConfidence === '3' ? 'selected' : ''}>+3: Probably will get there</option>
          <option value="4" ${goalConfidence === '4' ? 'selected' : ''}>+4: Very likely, on track</option>
          <option value="5" ${goalConfidence === '5' ? 'selected' : ''}>+5: 100% certain, will absolutely achieve them</option>
        </select>
      </div>

      <!-- Adaptive Trauma Questions (Based on Tool 1) -->
      <h3 style="margin-top: 40px;">Deeper Understanding</h3>
      <p class="muted" style="font-size: 13px; margin-bottom: 20px;">Based on your Financial Trauma Assessment, these questions help us understand your specific patterns.</p>

      ${this.renderAdaptiveQuestions(topTrauma, adaptiveScale, adaptiveImpact)}
    `;
  },

  /**
   * Helper: Get Tool 1 trauma data to determine top trauma category
   */
  getTool1TraumaData(clientId) {
    try {
      // Query Tool 1 responses for this client
      const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID).getSheetByName('RESPONSES');
      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      // Find Tool 1 response for this client (most recent, Is_Latest = true)
      const toolIdCol = headers.indexOf('Tool_ID');
      const clientCol = headers.indexOf('Client_ID');
      const isLatestCol = headers.indexOf('Is_Latest');
      const responseCol = headers.indexOf('Data');  // Column is named 'Data', not 'Response_Data'

      Logger.log(`Searching for Tool1 data for client: ${clientId}`);
      
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientCol] === clientId) {
          Logger.log(`Row ${i+1}: Tool_ID=${data[i][toolIdCol]}, Is_Latest=${data[i][isLatestCol]}`);
        }
        
        if (data[i][toolIdCol] === 'tool1' &&
            data[i][clientCol] === clientId &&
            data[i][isLatestCol] === true) {

          // Check if response data exists
          const rawResponseData = data[i][responseCol];
          Logger.log(`Tool1 row found. Response_Data type: ${typeof rawResponseData}, length: ${rawResponseData ? String(rawResponseData).length : 0}`);
          
          if (!rawResponseData || rawResponseData === 'undefined' || rawResponseData === '' || rawResponseData === null) {
            Logger.log(`Tool1 row found but Response_Data is empty/null/undefined for ${clientId}`);
            continue;
          }
          
          // Log first part of data for debugging
          Logger.log(`Response_Data preview: ${String(rawResponseData).substring(0, 200)}`);
          
          const responseData = JSON.parse(rawResponseData);

          // Extract trauma scores and winner from Tool 1
          // Tool1 saves data as: {formData: {...}, scores: {...}, winner: "..."}
          const traumaScores = responseData.scores || {};
          const topTrauma = responseData.winner || 'FSV';
          
          Logger.log(`Tool1 data found for ${clientId} - Winner: ${topTrauma}, Scores: ${JSON.stringify(traumaScores)}`);

          return { topTrauma, traumaScores };
        }
      }
      
      Logger.log(`No Tool1 data found for ${clientId} after checking ${data.length - 1} rows`);
      
    } catch (e) {
      Logger.log('Error getting Tool 1 trauma data: ' + e.message);
    }

    // Default if no Tool 1 data found
    Logger.log(`Returning default trauma data for ${clientId}: FSV`);
    return { topTrauma: 'FSV', traumaScores: {} };
  },

  /**
   * Helper: Render adaptive questions based on top trauma category
   */
  renderAdaptiveQuestions(topTrauma, adaptiveScale, adaptiveImpact) {
    const questions = {
      FSV: {
        label: 'Q55. How much do you hide your true financial situation from others?',
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
        impactLabel: 'Q56. How does hiding your financial situation negatively impact your life?',
        impactPrompt: 'Reflect on the consequences of not being transparent about your finances. Consider stress, isolation, missed help opportunities, relationship strain, etc.'
      },
      Control: {
        label: 'Q55. How much does lack of financial control create anxiety for you?',
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
          '+5: Paralyzing fear, losing control = crisis'
        ],
        impactLabel: 'Q56. How does your need for financial control negatively impact your life?',
        impactPrompt: 'Reflect on how controlling tendencies affect you. Consider stress, rigidity, relationship conflicts, missed opportunities, decision paralysis, etc.'
      },
      ExVal: {
        label: 'Q55. How much do others\' opinions about your money affect your financial decisions?',
        scale: [
          '-5: Zero influence, completely autonomous',
          '-4: Very little influence',
          '-3: Slight awareness, minimal impact',
          '-2: Some awareness, rare influence',
          '-1: Occasional influence',
          '+1: Moderate influence on some decisions',
          '+2: Regular influence',
          '+3: Significant influence, hard to resist',
          '+4: Major influence, drives many decisions',
          '+5: Completely driven by others\' opinions'
        ],
        impactLabel: 'Q56. How does seeking external validation around money negatively impact your life?',
        impactPrompt: 'Reflect on how others\' opinions shape your financial choices. Consider overspending, status seeking, hiding problems, authentic self suppression, etc.'
      },
      Fear: {
        label: 'Q55. How much does financial fear paralyze your decision-making?',
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
          '+5: Constantly paralyzed, can\'t make decisions'
        ],
        impactLabel: 'Q56. How does financial fear negatively impact your life?',
        impactPrompt: 'Reflect on how fear holds you back financially. Consider missed opportunities, avoidance, inaction, relationship strain, lost time, etc.'
      },
      Receiving: {
        label: 'Q55. How comfortable are you receiving help or support around money?',
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
        impactLabel: 'Q56. How does difficulty receiving help around money negatively impact your life?',
        impactPrompt: 'Reflect on how resistance to receiving affects you financially. Consider isolation, struggling alone, pride, missed guidance, slower progress, etc.'
      },
      Showing: {
        label: 'Q55. How much do you sacrifice your financial security to serve or help others?',
        scale: [
          '-5: Never sacrifice, always prioritize my needs',
          '-4: Rarely sacrifice',
          '-3: Occasionally help, within limits',
          '-2: Sometimes give, protect myself',
          '-1: Balance helping with self-care',
          '+1: Often help others, sometimes at my expense',
          '+2: Regularly sacrifice for others',
          '+3: Frequently sacrifice, even when I shouldn\'t',
          '+4: Almost always put others first',
          '+5: Always sacrifice my security for others'
        ],
        impactLabel: 'Q56. How does over-serving others financially negatively impact your life?',
        impactPrompt: 'Reflect on the cost of prioritizing others over your financial health. Consider resentment, depletion, inability to meet own goals, enablement, etc.'
      }
    };

    const q = questions[topTrauma] || questions.FSV;

    return `
      <div class="form-group">
        <label class="form-label">${q.label} *</label>
        <select name="adaptiveScale" required>
          <option value="">Select a response</option>
          ${q.scale.map((option, idx) => {
            const value = idx < 5 ? (-5 + idx) : (idx - 4);
            return `<option value="${value}" ${adaptiveScale == value ? 'selected' : ''}>${option}</option>`;
          }).join('\n          ')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">${q.impactLabel} *</label>
        <p class="muted" style="font-size: 13px; margin-bottom: 10px;">${q.impactPrompt}</p>
        <textarea name="adaptiveImpact" rows="4" required placeholder="Share your thoughts...">${adaptiveImpact}</textarea>
      </div>
    `;
  },

  /**
   * Helper: Count questions in a section
   */
  countSectionQuestions(data, prefix) {
    if (!data) return 0;
    let count = 0;
    for (const key in data) {
      if (key.startsWith(prefix + '_q')) {
        count++;
      }
    }
    return count;
  },

  // ============================================================
  // GPT BACKGROUND PROCESSING FUNCTIONS (NEW)
  // ============================================================

  /**
   * Trigger background GPT analysis for page with free-text responses
   */
  triggerBackgroundGPTAnalysis(page, clientId, formData, allData) {
    const triggers = {
      2: [
        {field: 'q18_income_sources', type: 'income_sources'},
        {field: 'q23_major_expenses', type: 'major_expenses'},
        {field: 'q24_wasteful_spending', type: 'wasteful_spending'}
      ],
      3: [
        {field: 'q29_debt_list', type: 'debt_list'}
      ],
      4: [
        {field: 'q43_investment_types', type: 'investments'}
      ],
      5: [
        {field: 'q52_emotions', type: 'emotions'},
        {field: this.getAdaptiveTraumaField(allData), type: 'adaptive_trauma'}
      ]
    };

    const pageTriggers = triggers[page] || [];

    pageTriggers.forEach(trigger => {
      if (formData[trigger.field]) {
        this.analyzeResponseInBackground(
          clientId,
          trigger.type,
          formData[trigger.field],
          allData
        );
      }
    });
  },

  /**
   * Analyze single response in background (non-blocking)
   */
  analyzeResponseInBackground(clientId, responseType, responseText, allData) {
    try {
      // CRITICAL: Check if we already have this insight (avoid duplicates on back/forward navigation)
      const existingInsights = this.getExistingInsights(clientId);
      if (existingInsights[responseType] && !existingInsights[`${responseType}_error`]) {
        Logger.log(`✓ Insight already exists for ${responseType}, skipping GPT call`);
        return;
      }

      const domainScores = this.getPartialDomainScores(allData);
      
      // NEW: Get Tool1 trauma data for enhanced personalization
      const traumaData = this.getTool1TraumaData(clientId);

      const insight = Tool2GPTAnalysis.analyzeResponse({
        clientId,
        responseType,
        responseText,
        previousInsights: existingInsights,
        formData: allData,
        domainScores,
        traumaData  // NEW: Pass trauma data to GPT analysis
      });

      // Store result in PropertiesService
      const insightKey = `tool2_gpt_${clientId}`;
      existingInsights[responseType] = insight;
      existingInsights[`${responseType}_timestamp`] = new Date().toISOString();

      PropertiesService.getUserProperties().setProperty(
        insightKey,
        JSON.stringify(existingInsights)
      );

      Logger.log(`✅ Background GPT complete: ${clientId} - ${responseType}`);

    } catch (error) {
      Logger.log(`⚠️ Background GPT failed: ${clientId} - ${responseType}: ${error.message}`);

      // Store error for retry at submission
      const insightKey = `tool2_gpt_${clientId}`;
      const existingInsights = this.getExistingInsights(clientId) || {};
      existingInsights[`${responseType}_error`] = {
        message: error.message,
        timestamp: new Date().toISOString()
      };

      PropertiesService.getUserProperties().setProperty(
        insightKey,
        JSON.stringify(existingInsights)
      );
    }
  },

  /**
   * Get existing GPT insights from PropertiesService
   */
  getExistingInsights(clientId) {
    const insightKey = `tool2_gpt_${clientId}`;
    const stored = PropertiesService.getUserProperties().getProperty(insightKey);
    return stored ? JSON.parse(stored) : {};
  },

  /**
   * Get partial domain scores (for background analysis before submission)
   */
  getPartialDomainScores(formData) {
    // Return best estimate of domain scores from partial data
    // These don't have to be perfect - just guide the fallback logic
    return {
      moneyFlow: 50,      // Placeholder
      obligations: 50,
      liquidity: 50,
      growth: 50,
      protection: 50
    };
  },

  /**
   * Get adaptive trauma field name based on Tool 1 data
   */
  getAdaptiveTraumaField(formData) {
    // Detect which Q55/Q56 was shown
    if (formData.q55a_fsv_hiding) return 'q55a_fsv_hiding';
    if (formData.q55b_control_anxiety) return 'q55b_control_anxiety';
    if (formData.q55c_exval_influence) return 'q55c_exval_influence';
    if (formData.q55d_fear_paralysis) return 'q55d_fear_paralysis';
    if (formData.q55e_receiving_discomfort) return 'q55e_receiving_discomfort';
    if (formData.q55f_showing_overserving) return 'q55f_showing_overserving';
    return 'q55b_control_anxiety';  // Default
  },

  /**
   * Get response text for a given insight type
   */
  getResponseTextForKey(key, formData) {
    const mapping = {
      income_sources: 'q18_income_sources',
      major_expenses: 'q23_major_expenses',
      wasteful_spending: 'q24_wasteful_spending',
      debt_list: 'q29_debt_list',
      investments: 'q43_investment_types',
      emotions: 'q52_emotions',
      adaptive_trauma: this.getAdaptiveTraumaField(formData)
    };

    return formData[mapping[key]] || '';
  },

  // ============================================================
  // END GPT BACKGROUND PROCESSING FUNCTIONS
  // ============================================================

  /**
   * REQUIRED: Save page data (called by saveToolPageData in Code.js)
   * Stores draft in PropertiesService for auto-resume
   */
  savePageData(clientId, page, formData) {
    try {
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
          // Page 1: Create new DRAFT row
          DataService.saveDraft(clientId, 'tool2', draftData);
        } else {
          // Pages 2-5: Update existing DRAFT row with complete merged data
          DataService.updateDraft(clientId, 'tool2', draftData);
        }
      } else {
        Logger.log(`[Tool2] Skipping DRAFT save/update - already in edit mode with EDIT_DRAFT`);
      }

      // Trigger background GPT analysis for free-text responses
      if (draftData) {
        this.triggerBackgroundGPTAnalysis(page, clientId, formData, draftData);
      }

      return result;
    } catch (error) {
      Logger.log(`Error saving page data: ${error}`);
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
          Logger.log(`Found EDIT_DRAFT for ${clientId}`);
        }
      }

      // Get PropertiesService data (page-by-page updates)
      const propertiesData = DraftService.getDraft('tool2', clientId);

      // EDIT MODE: Merge EDIT_DRAFT (base) with PropertiesService (updates)
      if (editDraft) {
        if (propertiesData) {
          // Merge: EDIT_DRAFT has all original data, PropertiesService has page updates
          Logger.log(`Merging EDIT_DRAFT with PropertiesService updates`);
          return { ...editDraft.data, ...propertiesData };
        } else {
          // No PropertiesService yet, use EDIT_DRAFT
          Logger.log(`Using EDIT_DRAFT data (no PropertiesService yet)`);
          return editDraft.data;
        }
      }

      // NEW DRAFT MODE: PropertiesService is source of truth
      if (propertiesData) {
        Logger.log(`Found PropertiesService draft for ${clientId}`);
        return propertiesData;
      }

      // Check for regular DRAFT (for resume)
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
        if (activeDraft && activeDraft.status === 'DRAFT') {
          Logger.log(`Found DRAFT for ${clientId}`);
          return activeDraft.data;
        }
      }

      return null;

    } catch (error) {
      Logger.log(`Error getting existing data: ${error}`);
      return null;
    }
  },

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

      Logger.log(`Processing ${isEditMode ? 'edited' : 'new'} submission for ${clientId}`);

      // Process data (calculate scores, analyze, etc.)
      const results = this.processResults(allData);

      // ============================================================
      // NEW: GPT INSIGHTS PROCESSING
      // ============================================================

      // Step 1: Retrieve pre-computed GPT insights
      const gptInsights = this.getExistingInsights(clientId);

      // Step 2: Check for missing or failed insights
      const requiredInsights = [
        'income_sources',
        'major_expenses',
        'wasteful_spending',
        'debt_list',
        'investments',
        'emotions',
        'adaptive_trauma'
      ];

      const missingInsights = requiredInsights.filter(key =>
        !gptInsights[key] || gptInsights[`${key}_error`]
      );

      // Step 3: Get Tool1 trauma data for enhanced personalization
      const traumaData = this.getTool1TraumaData(clientId);

      // Step 4: Run missing analyses synchronously (only if needed)
      if (missingInsights.length > 0) {
        Logger.log(`⚠️ Missing ${missingInsights.length} insights, running now...`);

        missingInsights.forEach(key => {
          const responseText = this.getResponseTextForKey(key, allData);

          if (responseText) {
            const insight = Tool2GPTAnalysis.analyzeResponse({
              clientId,
              responseType: key,
              responseText,
              previousInsights: gptInsights,
              formData: allData,
              domainScores: results.domainScores,
              traumaData  // NEW: Pass trauma data
            });

            gptInsights[key] = insight;
          }
        });
      }

      // Step 5: Run final synthesis (1 call, fast with pre-computed insights)
      const overallInsight = Tool2GPTAnalysis.synthesizeOverall(
        clientId,
        gptInsights,
        results.domainScores,
        traumaData  // NEW: Pass trauma data to synthesis
      );

      // ============================================================
      // END GPT INSIGHTS PROCESSING
      // ============================================================

      // CRITICAL: Use DataService.saveToolResponse() - handles Is_Latest column
      DataService.saveToolResponse(clientId, 'tool2', {
        data: allData,
        results: results,
        gptInsights: gptInsights,           // NEW: Include GPT insights
        overallInsight: overallInsight,     // NEW: Include synthesis
        timestamp: new Date().toISOString()
      });

      // Clean up PropertiesService (NEW)
      PropertiesService.getUserProperties().deleteProperty(`tool2_draft_${clientId}`);
      PropertiesService.getUserProperties().deleteProperty(`tool2_gpt_${clientId}`);

      // Unlock next tool (only on new submission, not edit)
      if (!isEditMode) {
        ToolAccessControl.adminUnlockTool(
          clientId,
          'tool3',
          'system',
          'Auto-unlocked after Tool 2 completion'
        );
      }

      // Return redirect URL for client-side navigation
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool2_report&client=${clientId}`;
      return {
        redirectUrl: reportUrl
      };

    } catch (error) {
      Logger.log(`Error processing final submission: ${error}`);
      throw error;
    }
  },

  /**
   * Process results - Calculate domain scores, benchmarks, priorities, archetype
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
    return {
      // Money Flow: 8 scale questions, max 80 points (normalized 0-10 scale)
      // Includes: Q14-Q17 (income), Q19-Q22 (spending)
      // Excludes: Q18 (income sources text), Q23-Q24 (spending text)
      moneyFlow: this.sumScaleQuestions(data, [
        'incomeClarity', 'incomeSufficiency', 'incomeConsistency', 'incomeStress',
        'spendingClarity', 'spendingConsistency', 'spendingReview', 'spendingStress'
      ]),

      // Obligations: 9 scale questions, max 90 points (normalized 0-10 scale)
      // Includes: Q25-Q28 (debt), Q30-Q34 (emergency fund)
      // Excludes: Q29 (debts text)
      obligations: this.sumScaleQuestions(data, [
        'debtClarity', 'debtTrending', 'debtReview', 'debtStress',
        'emergencyFundMaintenance', 'emergencyFundMonths', 'emergencyFundFrequency',
        'emergencyFundReplenishment', 'emergencyFundStress'
      ]),

      // Liquidity: 4 scale questions, max 40 points (normalized 0-10 scale)
      // All savings questions are scales
      liquidity: this.sumScaleQuestions(data, [
        'savingsLevel', 'savingsRegularity', 'savingsClarity', 'savingsStress'
      ]),

      // Growth: 8 scale questions, max 80 points (normalized 0-10 scale)
      // Includes: Q39-Q42 (investments), Q44-Q47 (retirement)
      // Excludes: Q43 (investment types text)
      growth: this.sumScaleQuestions(data, [
        'investmentActivity', 'investmentClarity', 'investmentConfidence', 'investmentStress',
        'retirementAccounts', 'retirementFunding', 'retirementConfidence', 'retirementStress'
      ]),

      // Protection: 4 scale questions, max 40 points (normalized 0-10 scale)
      // All insurance questions are scales
      protection: this.sumScaleQuestions(data, [
        'insurancePolicies', 'insuranceClarity', 'insuranceConfidence', 'insuranceStress'
      ])
    };
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
    const maxScores = {
      moneyFlow: 80,    // 8 questions × 10 max points (normalized from -5 to +5)
      obligations: 90,  // 9 questions × 10 max points
      liquidity: 40,    // 4 questions × 10 max points
      growth: 80,       // 8 questions × 10 max points
      protection: 40    // 4 questions × 10 max points
    };

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
    const stressWeights = {
      moneyFlow: 5,     // Highest - daily decisions, visible to others
      obligations: 4,   // High - constant pressure, fear
      liquidity: 2,     // Medium - safety anxiety
      growth: 1,        // Low - less immediate
      protection: 1     // Low - background concern
    };

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

    const archetypes = {
      moneyFlow: 'Money Flow Optimizer',
      obligations: 'Debt Freedom Builder',
      liquidity: 'Security Seeker',
      growth: 'Wealth Architect',
      protection: 'Protection Planner'
    };

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
};

/**
 * PHASE 1 COMPLETE: Core structure updated with critical patterns ✅
 *
 * What was added:
 * - ✅ Edit mode & clearDraft URL parameter handling in render()
 * - ✅ Edit mode banner in renderPageContent()
 * - ✅ DataService.getActiveDraft() check in getExistingData()
 * - ✅ Edit mode detection in processFinalSubmission()
 * - ✅ Using DataService.saveToolResponse() instead of manual saves
 *
 * NEXT STEPS:
 * - Phase 2a: Implement Page 1 (demographics + mindset - 13 questions)
 * - Phase 2b: Implement Page 2 (Money Flow - 11 questions)
 * - Phase 2c: Implement Page 3 (Obligations - 11 questions)
 * - Phase 2d: Implement Page 4 (Growth - 13 questions)
 * - Phase 2e: Implement Page 5 (Protection + Psychological + Adaptive - 11 questions)
 */
