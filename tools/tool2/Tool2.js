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
    switch(page) {
      case 1:
        return this.renderPage1Content(existingData, clientId);
      case 2:
        return this.renderPage2Content(existingData, clientId);
      case 3:
        return this.renderPage3Content(existingData, clientId);
      case 4:
        return this.renderPage4Content(existingData, clientId);
      case 5:
        return this.renderPage5Content(existingData, clientId);
      default:
        return '<p class="error">Invalid page number</p>';
    }
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
   */
  getExistingData(clientId) {
    try {
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
   * TODO: Implement actual scoring/analysis logic tomorrow
   */
  processFinalSubmission(clientId) {
    try {
      // Get all submitted data
      const allData = this.getExistingData(clientId);

      if (!allData) {
        throw new Error('No data found. Please start the assessment again.');
      }

      // Process data (calculate scores, analyze, etc.)
      // TODO: Implement actual processing logic
      const results = this.processResults(allData);

      // Save to RESPONSES sheet
      this.saveToResponses(clientId, allData, results);

      // Unlock next tool
      ToolAccessControl.adminUnlockTool(
        clientId,
        'tool3',
        'system',
        'Auto-unlocked after Tool 2 completion'
      );

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
   * Save final results to RESPONSES sheet
   */
  saveToResponses(clientId, formData, results) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const row = [
        new Date().toISOString(),     // Timestamp
        clientId,                     // Client_ID
        'tool2',                      // Tool_ID
        JSON.stringify({              // Data (JSON)
          formData: formData,
          results: results
        }),
        '1.0.0',                      // Version
        'COMPLETED'                   // Status
      ];

      responseSheet.appendRow(row);
      SpreadsheetApp.flush();

      Logger.log(`Saved Tool 2 results for ${clientId}`);
    } catch (error) {
      Logger.log(`Error saving to responses: ${error}`);
      throw error;
    }
  }
};

/**
 * IMPLEMENTATION CHECKLIST FOR TOMORROW:
 *
 * 1. [ ] Review v2 Financial Clarity questions and port to Page 1-2
 * 2. [ ] Review v2 False Self questions and port to Page 3
 * 3. [ ] Review v2 External Validation questions and port to Page 4
 * 4. [ ] Implement scoring logic in processResults()
 * 5. [ ] Create report templates in Tool2Report.js
 * 6. [ ] Test with TEST001 user
 * 7. [ ] Deploy and verify
 */
