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
    // NOTE: We do NOT call loadResponseForEditing() here anymore
    // It's already called from the dashboard/report before navigation
    // Calling it twice creates duplicate EDIT_DRAFTs!

    if (editMode && page === 1) {
      Logger.log(`Edit mode detected for ${clientId} - EDIT_DRAFT should already exist`);
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

      content += `
        <div class="edit-mode-banner" style="
          background: rgba(173, 145, 104, 0.1);
          border: 2px solid #ad9168;
          border-radius: 10px;
          padding: 15px 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <strong style="color: #ad9168; font-size: 16px;">✏️ Edit Mode</strong>
            <p style="margin: 5px 0 0 0; color: #fff; font-size: 14px;">
              You're editing your response from ${originalDate}
            </p>
          </div>
          <button
            type="button"
            onclick="cancelEdit()"
            style="
              background: transparent;
              color: #ad9168;
              border: 1px solid #ad9168;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.3s;
            "
            onmouseover="this.style.background='rgba(173, 145, 104, 0.1)'"
            onmouseout="this.style.background='transparent'"
          >
            Cancel Edit
          </button>
        </div>

        <script>
          function cancelEdit() {
            if (confirm('Cancel editing and discard changes?')) {
              google.script.run
                .withSuccessHandler(function() {
                  window.location.href = '${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}';
                })
                .withFailureHandler(function(error) {
                  alert('Error canceling edit: ' + error.message);
                })
                .cancelEditDraft('${clientId}', 'tool2');
            }
          }
        </script>
      `;
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
   * PAGE 4: Growth Domain - Savings Section
   * Q35-Q38: Savings clarity and stress
   */
  renderPage4Content(data, clientId) {
    // Extract existing data with defaults
    const savingsLevel = data.savingsLevel || '';
    const savingsRegularity = data.savingsRegularity || '';
    const savingsClarity = data.savingsClarity || '';
    const savingsStress = data.savingsStress || '';

    return `
      <h2>📈 Growth Domain - Savings</h2>
      <p class="muted mb-20">Understanding your savings awareness and stress levels (4 questions)</p>

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
    `;
  },

  /**
   * PAGE 5: Review & Submit
   * TODO: Add summary of all three sections
   */
  renderPage5Content(data, clientId) {
    return `
      <h2>📋 Review & Submit</h2>
      <p class="muted mb-20">Please review your responses and submit when ready.</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Assessment Summary</h3>

        <div style="margin: 15px 0;">
          <strong>📊 Financial Clarity:</strong> ${this.countSectionQuestions(data, 'fc')} questions completed
        </div>

        <div style="margin: 15px 0;">
          <strong>🎭 False Self:</strong> ${this.countSectionQuestions(data, 'fs')} questions completed
        </div>

        <div style="margin: 15px 0;">
          <strong>⭐ External Validation:</strong> ${this.countSectionQuestions(data, 'ev')} questions completed
        </div>
      </div>

      <div class="insight-box" style="background: #dcfce7; border-left: 4px solid #16a34a;">
        <p><strong>✅ Ready to Submit</strong></p>
        <p>Your comprehensive assessment will generate a detailed report with personalized insights.</p>
      </div>

      <p class="muted">Click Submit to complete your assessment and view your report.</p>
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

  /**
   * REQUIRED: Save page data (called by saveToolPageData in Code.js)
   * Stores draft in PropertiesService for auto-resume
   */
  savePageData(clientId, page, formData) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = `tool2_draft_${clientId}`;

      // Get existing draft or create new
      let draftData = {};
      const existingDraft = userProperties.getProperty(draftKey);
      if (existingDraft) {
        try {
          draftData = JSON.parse(existingDraft);
        } catch (e) {
          Logger.log('Error parsing existing draft, starting fresh');
        }
      }

      // Merge new page data
      for (const key in formData) {
        if (key !== 'client' && key !== 'page') {
          draftData[key] = formData[key];
        }
      }

      // Save updated draft
      draftData.lastPage = page;
      draftData.lastUpdate = new Date().toISOString();
      userProperties.setProperty(draftKey, JSON.stringify(draftData));

      Logger.log(`Saved tool2 page ${page} data for ${clientId}`);
    } catch (error) {
      Logger.log(`Error saving page data: ${error}`);
      throw error;
    }
  },

  /**
   * Get existing data for a client (from draft storage)
   * CRITICAL: Check DataService first for ResponseManager compatibility
   */
  getExistingData(clientId) {
    try {
      // FIRST: Check for active draft from ResponseManager (EDIT_DRAFT or DRAFT)
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool2');

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`Found active draft with status: ${activeDraft.status}`);
          return activeDraft.data;
        }
      }

      // FALLBACK: Legacy PropertiesService (for backward compatibility)
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = `tool2_draft_${clientId}`;
      const draftData = userProperties.getProperty(draftKey);

      if (draftData) {
        return JSON.parse(draftData);
      }
    } catch (error) {
      Logger.log(`Error getting existing data: ${error}`);
    }
    return null;
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
      // TODO: Implement actual processing logic
      const results = this.processResults(allData);

      // CRITICAL: Use DataService.saveToolResponse() - handles Is_Latest column
      DataService.saveToolResponse(clientId, 'tool2', {
        data: allData,
        results: results,
        timestamp: new Date().toISOString()
      });

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
   * Process results (PLACEHOLDER)
   * TODO: Implement actual scoring/analysis logic tomorrow
   */
  processResults(data) {
    // TODO: Calculate actual scores for each section
    // For now, just placeholder calculations

    return {
      financialClarity: {
        score: 0, // TODO: Calculate from fc_* questions
        level: 'To be calculated'
      },
      falseSelf: {
        score: 0, // TODO: Calculate from fs_* questions
        level: 'To be calculated'
      },
      externalValidation: {
        score: 0, // TODO: Calculate from ev_* questions
        level: 'To be calculated'
      },
      timestamp: new Date().toISOString()
    };
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
