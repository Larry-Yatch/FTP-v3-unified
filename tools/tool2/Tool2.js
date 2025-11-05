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
   * PAGE 2: PLACEHOLDER - Financial Clarity Continued
   * TODO: Add more Financial Clarity questions
   */
  renderPage2Content(data, clientId) {
    return `
      <h2>📊 Financial Clarity - Part 2</h2>
      <p class="muted mb-20">Continuing financial perspective assessment</p>

      <div class="insight-box" style="background: #fff8e1; border-left: 4px solid #f59e0b;">
        <p><strong>📝 Content Placeholder</strong></p>
        <p>Tomorrow: Add more Financial Clarity questions</p>
      </div>

      <div class="form-group">
        <label class="form-label">Sample Question 3 *</label>
        <select name="fc_q3" required>
          <option value="">Select a response</option>
          <option value="1">Strongly Disagree</option>
          <option value="2">Disagree</option>
          <option value="3">Neutral</option>
          <option value="4">Agree</option>
          <option value="5">Strongly Agree</option>
        </select>
      </div>
    `;
  },

  /**
   * PAGE 3: PLACEHOLDER - False Self Section
   * TODO: Implement actual questions from v2 False Self tool
   */
  renderPage3Content(data, clientId) {
    return `
      <h2>🎭 False Self Assessment</h2>
      <p class="muted mb-20">Section 2 of 3: Understanding authentic vs. false self</p>

      <div class="insight-box" style="background: #e0f2fe; border-left: 4px solid #0284c7;">
        <p><strong>📝 Content Placeholder</strong></p>
        <p>Tomorrow: Add False Self questions from v2 tool</p>
      </div>

      <div class="form-group">
        <label class="form-label">Sample Question 1 *</label>
        <select name="fs_q1" required>
          <option value="">Select a response</option>
          <option value="1">Strongly Disagree</option>
          <option value="2">Disagree</option>
          <option value="3">Neutral</option>
          <option value="4">Agree</option>
          <option value="5">Strongly Agree</option>
        </select>
      </div>
    `;
  },

  /**
   * PAGE 4: PLACEHOLDER - External Validation Section
   * TODO: Implement actual questions from v2 External Validation tool
   */
  renderPage4Content(data, clientId) {
    return `
      <h2>⭐ External Validation Assessment</h2>
      <p class="muted mb-20">Section 3 of 3: Understanding external validation patterns</p>

      <div class="insight-box" style="background: #f3e8ff; border-left: 4px solid #9333ea;">
        <p><strong>📝 Content Placeholder</strong></p>
        <p>Tomorrow: Add External Validation questions from v2 tool</p>
      </div>

      <div class="form-group">
        <label class="form-label">Sample Question 1 *</label>
        <select name="ev_q1" required>
          <option value="">Select a response</option>
          <option value="1">Strongly Disagree</option>
          <option value="2">Disagree</option>
          <option value="3">Neutral</option>
          <option value="4">Agree</option>
          <option value="5">Strongly Agree</option>
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
