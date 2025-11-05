/**
 * MultiPageToolTemplate.js
 *
 * TEMPLATE for creating new multi-page form-based tools
 * Copy this file to tools/toolN/ToolN.js and customize
 *
 * This template uses FormUtils for consistent, error-free form handling
 * NO POST submissions - all forms use google.script.run + GET navigation
 */

const ToolN = {  // ← RENAME THIS
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
    if (editMode && page === 1) {
      Logger.log(`Edit mode triggered for ${clientId}`);
      DataService.loadResponseForEditing(clientId, 'toolN');  // ← CUSTOMIZE: change toolN
    }

    if (clearDraft && page === 1) {
      Logger.log(`Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'toolN');  // ← CUSTOMIZE: change toolN
    }

    // Get existing data if resuming
    const existingData = this.getExistingData(clientId);

    // Get page-specific content
    const pageContent = this.renderPageContent(page, existingData, clientId);

    // Use FormUtils to build standard page structure
    const template = HtmlService.createTemplate(
      FormUtils.buildStandardPage({
        toolName: 'Your Tool Name Here',  // ← CUSTOMIZE
        toolId: 'toolN',                  // ← CUSTOMIZE
        page: page,
        totalPages: 3,                    // ← CUSTOMIZE: number of pages
        clientId: clientId,
        baseUrl: baseUrl,
        pageContent: pageContent,
        isFinalPage: (page === 3),        // ← CUSTOMIZE: last page number
        customValidation: null            // ← OPTIONAL: 'validateMyForm' for custom validation
      })
    );

    return template.evaluate()
      .setTitle('TruPath - Your Tool Name')  // ← CUSTOMIZE
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Route to appropriate page content
   */
  renderPageContent(page, existingData, clientId) {
    switch(page) {
      case 1:
        return this.renderPage1Content(existingData, clientId);
      case 2:
        return this.renderPage2Content(existingData, clientId);
      case 3:
        return this.renderPage3Content(existingData, clientId);
      // Add more pages as needed
      default:
        return '<p class="error">Invalid page number</p>';
    }
  },

  /**
   * PAGE 1: Basic Info (example)
   *
   * IMPORTANT: Return ONLY the form fields
   * FormUtils wraps this in <form>, progress bar, and submit button
   */
  renderPage1Content(data, clientId) {
    const name = data?.name || '';
    const email = data?.email || '';

    return `
      <h2>Welcome</h2>
      <p class="muted mb-20">Let's begin your assessment.</p>

      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" name="name" value="${name}" placeholder="Your full name" required>
      </div>

      <div class="form-group">
        <label class="form-label">Email Address *</label>
        <input type="email" name="email" value="${email}" placeholder="your@email.com" required>
      </div>
    `;
  },

  /**
   * PAGE 2: Questions (example)
   */
  renderPage2Content(data, clientId) {
    const questions = [
      {name: 'q1', text: 'Sample question 1'},
      {name: 'q2', text: 'Sample question 2'},
      {name: 'q3', text: 'Sample question 3'}
    ];

    let html = `
      <h2>Assessment Questions</h2>
      <p class="muted mb-20">Please answer the following questions.</p>
    `;

    questions.forEach(q => {
      const selected = data?.[q.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${q.text} *</label>
          <select name="${q.name}" required>
            <option value="">Select a response</option>
            <option value="1" ${selected === '1' ? 'selected' : ''}>Strongly Disagree</option>
            <option value="2" ${selected === '2' ? 'selected' : ''}>Disagree</option>
            <option value="3" ${selected === '3' ? 'selected' : ''}>Neutral</option>
            <option value="4" ${selected === '4' ? 'selected' : ''}>Agree</option>
            <option value="5" ${selected === '5' ? 'selected' : ''}>Strongly Agree</option>
          </select>
        </div>
      `;
    });

    // BEST PRACTICE: Add back navigation button
    html += `
      <!-- Navigation: Back to Page 1 -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button type="button" class="btn-secondary" onclick="goBackToPage1('${clientId}')">
          ← Back to Page 1
        </button>
      </div>

      <script>
        function goBackToPage1(clientId) {
          showLoading('Loading Page 1');

          // Use document.write() pattern (no white flash!)
          google.script.run
            .withSuccessHandler(function(pageHtml) {
              if (pageHtml) {
                document.open();
                document.write(pageHtml);
                document.close();
              } else {
                hideLoading();
                alert('Error loading Page 1');
              }
            })
            .withFailureHandler(function(error) {
              hideLoading();
              console.error('Navigation error:', error);
              alert('Error loading Page 1: ' + error.message);
            })
            .getToolPageHtml('toolN', clientId, 1);  // ← CUSTOMIZE: change toolN
        }
      </script>
    `;

    return html;
  },

  /**
   * PAGE 3: Final page (example)
   */
  renderPage3Content(data, clientId) {
    return `
      <h2>Review & Submit</h2>
      <p class="muted mb-20">Please review your responses and submit when ready.</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${data?.name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${data?.email || 'Not provided'}</p>
        <p><strong>Questions completed:</strong> ${this.countCompletedQuestions(data)}</p>
      </div>

      <p class="muted">Click Submit to complete your assessment.</p>

      <!-- BEST PRACTICE: Add back navigation button on final page too -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button type="button" class="btn-secondary" onclick="goBackToPage2('${clientId}')">
          ← Back to Page 2
        </button>
      </div>

      <script>
        function goBackToPage2(clientId) {
          showLoading('Loading Page 2');

          // Use document.write() pattern (no white flash!)
          google.script.run
            .withSuccessHandler(function(pageHtml) {
              if (pageHtml) {
                document.open();
                document.write(pageHtml);
                document.close();
              } else {
                hideLoading();
                alert('Error loading Page 2');
              }
            })
            .withFailureHandler(function(error) {
              hideLoading();
              console.error('Navigation error:', error);
              alert('Error loading Page 2: ' + error.message);
            })
            .getToolPageHtml('toolN', clientId, 2);  // ← CUSTOMIZE: change toolN
        }
      </script>
    `;
  },

  /**
   * Helper: Count completed questions
   */
  countCompletedQuestions(data) {
    if (!data) return 0;
    let count = 0;
    ['q1', 'q2', 'q3'].forEach(q => {
      if (data[q]) count++;
    });
    return count;
  },

  /**
   * REQUIRED: Save page data (called by saveToolPageData in Code.js)
   * Stores draft in PropertiesService for auto-resume
   */
  savePageData(clientId, page, formData) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = `toolN_draft_${clientId}`;  // ← CUSTOMIZE: change toolN

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

      Logger.log(`Saved toolN page ${page} data for ${clientId}`);  // ← CUSTOMIZE
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
        const activeDraft = DataService.getActiveDraft(clientId, 'toolN');  // ← CUSTOMIZE: change toolN

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`Found active draft with status: ${activeDraft.status}`);
          return activeDraft.data;
        }
      }

      // FALLBACK: Legacy PropertiesService (for backward compatibility)
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = `toolN_draft_${clientId}`;  // ← CUSTOMIZE
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
      const results = this.processResults(allData);

      // CRITICAL: Use DataService.saveToolResponse() - handles Is_Latest column
      DataService.saveToolResponse(clientId, 'toolN', {  // ← CUSTOMIZE: change toolN
        data: allData,
        results: results,
        timestamp: new Date().toISOString()
      });

      // Unlock next tool (only on new submission, not edit)
      if (!isEditMode) {
        ToolAccessControl.adminUnlockTool(
          clientId,
          'toolX',  // ← CUSTOMIZE: next tool ID
          'system',
          'Auto-unlocked after Tool N completion'  // ← CUSTOMIZE
        );
      }

      // Return redirect URL for client-side navigation
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=toolN_report&client=${clientId}`;  // ← CUSTOMIZE
      return {
        redirectUrl: reportUrl
      };

    } catch (error) {
      Logger.log(`Error processing final submission: ${error}`);
      throw error; // Let completeToolSubmission handler deal with errors
    }
  },

  /**
   * Process results (customize based on your tool's logic)
   */
  processResults(data) {
    // Calculate scores, analyze responses, generate insights
    // Example:
    const score = parseInt(data.q1 || 0) + parseInt(data.q2 || 0) + parseInt(data.q3 || 0);

    return {
      totalScore: score,
      category: score > 10 ? 'High' : score > 5 ? 'Medium' : 'Low',
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
 * QUICK START CHECKLIST:
 *
 * 1. Copy this file to tools/toolN/ToolN.js
 * 2. Find & replace "ToolN" with your tool name (e.g., "Tool2")
 * 3. Find & replace "toolN" with your tool ID (e.g., "tool2")
 * 4. Customize:
 *    - Tool name
 *    - Number of pages
 *    - Page content methods
 *    - Processing logic
 *    - Results calculation
 * 5. Create manifest in Code.js registerTools()
 * 6. Create report page (ToolNReport.js)
 * 7. Test with TEST001 user
 *
 * CRITICAL PATTERNS (MUST FOLLOW):
 * ✅ Handle editMode and clearDraft params in render() - page 1 only
 * ✅ Check DataService.getActiveDraft() FIRST in getExistingData()
 * ✅ Use DataService.saveToolResponse() - NEVER manual sheet.appendRow()
 * ✅ Check _editMode flag before unlocking next tool
 * ✅ Always check for null in google.script.run handlers
 *
 * BENEFITS OF THIS PATTERN:
 * ✅ No POST submissions - no iframe sandbox issues
 * ✅ User gesture preservation (immediate navigation)
 * ✅ Consistent UI/UX across all tools
 * ✅ Auto-save/resume functionality
 * ✅ Edit mode support (view/edit/retake)
 * ✅ Version control with Is_Latest column
 * ✅ Proper error handling
 * ✅ Loading animations
 * ✅ Progress indicators
 * ✅ Mobile-friendly
 * ✅ Easy to maintain
 *
 * BUG REFERENCES:
 * - Deploy @58 (ec82987): Is_Latest column fix
 * - Deploy @56 (99d0eeb): User gesture navigation fix
 */
