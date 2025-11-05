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
   * PAGE 1: PLACEHOLDER - Financial Clarity Section
   * TODO: Implement actual questions from v2 Financial Clarity tool
   */
  renderPage1Content(data, clientId) {
    return `
      <h2>📊 Financial Clarity Assessment</h2>
      <p class="muted mb-20">Section 1 of 3: Understanding your financial perspective</p>

      <div class="insight-box" style="background: #fff8e1; border-left: 4px solid #f59e0b;">
        <p><strong>📝 Content Placeholder</strong></p>
        <p>Tomorrow: Add Financial Clarity questions from v2 tool</p>
      </div>

      <div class="form-group">
        <label class="form-label">Sample Question 1 *</label>
        <select name="fc_q1" required>
          <option value="">Select a response</option>
          <option value="1">Strongly Disagree</option>
          <option value="2">Disagree</option>
          <option value="3">Neutral</option>
          <option value="4">Agree</option>
          <option value="5">Strongly Agree</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Sample Question 2 *</label>
        <select name="fc_q2" required>
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
