/**
 * Tool 1: Core Trauma Strategy Assessment
 * Top-level psychological assessment
 */

const Tool1 = {
  manifest: null, // Will be injected by ToolRegistry

  /**
   * Render the tool UI
   * @param {Object} params - {clientId, sessionId, page, editMode, clearDraft}
   * @returns {HtmlOutput}
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // Handle URL parameters for immediate navigation (preserves user gesture)
    const editMode = params.editMode === 'true' || params.editMode === true;
    const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;
    const autoCancelDraft = params.autoCancelDraft === 'true' || params.autoCancelDraft === true;

    // Execute actions on page load (after navigation completes with user gesture)
    // Call loadResponseForEditing to create EDIT_DRAFT from COMPLETED response
    // This happens AFTER navigation so we preserve user gesture (no iframe errors)

    if (editMode && page === 1) {
      Logger.log(`Edit mode detected for ${clientId} - creating EDIT_DRAFT`);
      DataService.loadResponseForEditing(clientId, 'tool1');
    }

    if (clearDraft && page === 1) {
      // Clear all drafts for fresh start
      Logger.log(`Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'tool1');
    }

    if (autoCancelDraft && page === 1) {
      // WORKAROUND for Bug #5: Auto-cancel draft and return to dashboard
      // This piggybacks on the working Form → Dashboard navigation
      Logger.log(`Auto-cancel draft triggered for ${clientId}`);
      DataService.cancelEditDraft(clientId, 'tool1');

      // Return a page that immediately navigates back to dashboard
      // using the proven working navigateToDashboard() method
      return HtmlService.createTemplate(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discarding Draft...</title>
        </head>
        <body>
          <?!= include('shared/loading-animation') ?>
          <script>
            showLoading('Draft discarded. Returning to dashboard...');
            // Use the proven working navigation method
            navigateToDashboard('${clientId}', 'Loading Dashboard');
          </script>
        </body>
        </html>
      `).evaluate().setTitle('Discarding Draft');
    }

    // Get existing data if resuming
    const existingData = this.getExistingData(clientId);

    // Get page-specific content
    const pageContent = this.renderPageContent(page, existingData, clientId);

    // Use FormUtils to build standard page structure
    const template = HtmlService.createTemplate(
      FormUtils.buildStandardPage({
        toolName: 'Core Trauma Strategy Assessment',
        toolId: 'tool1',
        page: page,
        totalPages: 5,
        clientId: clientId,
        baseUrl: baseUrl,
        pageContent: pageContent,
        isFinalPage: (page === 5),
        customValidation: (page === 5) ? 'validateRankings' : null  // Page 5 has custom validation
      })
    );

    return template.evaluate()
      .setTitle('TruPath - Core Trauma Strategy Assessment')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Render page-specific content (just the form fields, not the full page)
   * FormUtils will wrap this in standard page structure
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

      content += EditModeBanner.render(originalDate, clientId, 'tool1');
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
   * Page 1: Name and Email (content only, FormUtils wraps in form)
   */
  renderPage1Content(data, clientId) {
    const name = data?.name || '';
    const email = data?.email || '';

    return `
      <h2>Let's Get Started</h2>
      <p class="muted mb-20">This assessment will help identify your core trauma strategy patterns.</p>

      <div class="form-group">
        <label class="form-label">First and Last Name *</label>
        <input type="text" name="name" value="${name}" placeholder="Your full name" required>
      </div>

      <div class="form-group">
        <label class="form-label">Email Address *</label>
        <input type="email" name="email" value="${email}" placeholder="your@email.com" required>
      </div>
    `;
  },

  /**
   * Page 2: Section 1 - FSV & Control (Questions 3-8)
   */
  renderPage2Content(data, clientId) {
    const questions = [
      {name: 'q3', text: 'I am destined to fail because I am not good enough.'},
      {name: 'q4', text: 'I need to take on big things to prove that I am good enough.'},
      {name: 'q5', text: 'I often feel distant from others, which makes me question my worthiness.'},
      {name: 'q6', text: 'To feel safe, I must gain the approval of others and be accepted by them.'},
      {name: 'q7', text: 'When someone does not recognize my value, I feel like I have to retreat into myself to be safe.'},
      {name: 'q8', text: 'When I am not accepted by others I feel unsafe and question if I will be loved.'}
    ];

    let html = `
      <h2>Section 1: Statement Relevance</h2>
      <p class="muted mb-20">
        <strong>-5:</strong> I never think/feel/experience this, completely irrelevant<br>
        <strong>+5:</strong> I think/feel/experience this very regularly, completely relevant
      </p>
    `;

    questions.forEach(q => {
      const selected = data?.[q.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${q.text} *</label>
          <select name="${q.name}" required>
            <option value="">Select a response</option>
            <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Not relevant at all)</option>
            <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
            <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
            <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
            <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
            <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
            <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
            <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
            <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
            <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Very relevant)</option>
          </select>
        </div>
      `;
    });

    return html;
  },

  /**
   * Page 3: Section 2 - Showing & Receiving (Questions 10-15)
   */
  renderPage3Content(data, clientId) {
    const questions = [
      {name: 'q10', text: 'I will sacrifice my happiness to serve others.'},
      {name: 'q11', text: 'It is ok for me to do things for others, but I am uncomfortable receiving from them.'},
      {name: 'q12', text: 'I need to be valuable to others in order to be loved.'},
      {name: 'q13', text: 'I know that others will hurt me in some way, so I must keep my distance.'},
      {name: 'q14', text: 'Those around me are unable to express their love for me.'},
      {name: 'q15', text: 'The isolation I feel proves that I will never be loved.'}
    ];

    let html = `
      <h2>Section 2: Statement Relevance</h2>
      <p class="muted mb-20">
        <strong>-5:</strong> I never think/feel/experience this, completely irrelevant<br>
        <strong>+5:</strong> I think/feel/experience this very regularly, completely relevant
      </p>
    `;

    questions.forEach(q => {
      const selected = data?.[q.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${q.text} *</label>
          <select name="${q.name}" required>
            <option value="">Select a response</option>
            <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Not relevant at all)</option>
            <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
            <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
            <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
            <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
            <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
            <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
            <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
            <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
            <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Very relevant)</option>
          </select>
        </div>
      `;
    });

    return html;
  },

  /**
   * Page 4: Section 3 - Control & Fear (Questions 17-22)
   */
  renderPage4Content(data, clientId) {
    const questions = [
      {name: 'q17', text: 'If I do not control my world, I know I will suffer.'},
      {name: 'q18', text: 'To avoid emotions I do not like, I distract myself by staying busy.'},
      {name: 'q19', text: 'When I feel alone, I feel like I am out of control / not safe.'},
      {name: 'q20', text: 'I know that I will have experiences that will cause me pain, so I must act to protect myself.'},
      {name: 'q21', text: 'To be safe, I have to keep distance between myself and others, yet feel alone.'},
      {name: 'q22', text: 'I live in constant fear of things going wrong for me.'}
    ];

    let html = `
      <h2>Section 3: Statement Relevance</h2>
      <p class="muted mb-20">
        <strong>-5:</strong> I never think/feel/experience this, completely irrelevant<br>
        <strong>+5:</strong> I think/feel/experience this very regularly, completely relevant
      </p>
    `;

    questions.forEach(q => {
      const selected = data?.[q.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${q.text} *</label>
          <select name="${q.name}" required>
            <option value="">Select a response</option>
            <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Not relevant at all)</option>
            <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
            <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
            <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
            <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
            <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
            <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
            <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
            <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
            <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Very relevant)</option>
          </select>
        </div>
      `;
    });

    return html;
  },

  /**
   * Page 5: Rankings (Questions 24 & 26)
   */
  renderPage5Content(data, clientId) {
    // DIAGNOSTIC: Log data structure (for debugging page 5 dropdown issue)
    Logger.log(`=== Page 5 Data Structure ===`);
    Logger.log(`Data keys: ${JSON.stringify(Object.keys(data || {}))}`);
    Logger.log(`Has formData? ${!!data?.formData}`);
    Logger.log(`Has scores? ${!!data?.scores}`);
    Logger.log(`Has winner? ${!!data?.winner}`);
    Logger.log(`thought_fsv (direct): ${data?.thought_fsv}`);
    Logger.log(`thought_fsv (nested): ${data?.formData?.thought_fsv}`);
    Logger.log(`feeling_fsv (direct): ${data?.feeling_fsv}`);
    Logger.log(`feeling_fsv (nested): ${data?.formData?.feeling_fsv}`);

    // DEFENSIVE: Extract formData if nested (EDIT_DRAFT compatibility)
    // ResponseManager wraps data as {formData, scores, winner}
    // We need just the form fields for rendering
    const formData = data?.formData || data || {};

    Logger.log(`Using formData - thought_fsv: ${formData.thought_fsv}`);
    Logger.log(`Using formData - feeling_fsv: ${formData.feeling_fsv}`);

    const thoughts = [
      {name: 'thought_fsv', text: 'I have to do something / be someone better to be safe.'},
      {name: 'thought_exval', text: 'I need others to value me to be safe.'},
      {name: 'thought_showing', text: 'I need to suffer or sacrifice for others to be safe.'},
      {name: 'thought_receiving', text: 'I have to keep distance from others to be safe.'},
      {name: 'thought_control', text: 'I need to control my environment to be safe.'},
      {name: 'thought_fear', text: 'I need to protect myself to be safe.'}
    ];

    const feelings = [
      {name: 'feeling_fsv', text: 'I feel insufficient.'},
      {name: 'feeling_exval', text: 'I feel like I am not good enough for them.'},
      {name: 'feeling_showing', text: 'I feel the need to sacrifice for others.'},
      {name: 'feeling_receiving', text: 'I feel like nobody loves me.'},
      {name: 'feeling_control', text: 'I feel out of control of my world.'},
      {name: 'feeling_fear', text: 'I feel like I am in danger.'}
    ];

    let html = `
      <h2>Ranking Thoughts and Feelings</h2>
      <p class="muted mb-20">
        Rank each statement from 1-10 based on how much you agree with it and how often it shows up in your mind.<br>
        <strong>Important:</strong> Each statement must have a unique ranking (no duplicates).
      </p>

      <h3 style="margin-top: 30px;">Ranking Thoughts</h3>
      <p class="muted" style="font-size: 14px;">Rank from 1 (least relevant) to 10 (most relevant)</p>
    `;

    thoughts.forEach(t => {
      let selected = '';
      if (formData && formData[t.name]) {
        selected = String(formData[t.name]);
        Logger.log(`Setting ${t.name} selected = ${selected}`);
      }
      html += `
        <div class="form-group">
          <label class="form-label">${t.text} *</label>
          <select name="${t.name}" class="ranking-select thought-ranking" onchange="updateRankingOptions()" required>
            <option value="">Select rank (1-10)</option>
            ${Array.from({length: 10}, (_, i) => i + 1).map(rank =>
              `<option value="${rank}"${selected === String(rank) ? ' selected' : ''}>${rank}</option>`
            ).join('')}
          </select>
        </div>
      `;
    });

    html += `
        <h3 style="margin-top: 40px;">Ranking Feelings</h3>
        <p class="muted" style="font-size: 14px;">Rank from 1 (least relevant) to 10 (most relevant)</p>
    `;

    feelings.forEach(f => {
      let selected = '';
      if (formData && formData[f.name]) {
        selected = String(formData[f.name]);
        Logger.log(`Setting ${f.name} selected = ${selected}`);
      }
      html += `
        <div class="form-group">
          <label class="form-label">${f.text} *</label>
          <select name="${f.name}" class="ranking-select feeling-ranking" onchange="updateRankingOptions()" required>
            <option value="">Select rank (1-10)</option>
            ${Array.from({length: 10}, (_, i) => i + 1).map(rank =>
              `<option value="${rank}"${selected === String(rank) ? ' selected' : ''}>${rank}</option>`
            ).join('')}
          </select>
        </div>
      `;
    });

    html += `
      <div id="rankingError" class="error" style="display: none; margin: 20px 0; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 8px;"></div>

      <script>
        // Update dropdown options to show which ranks are already selected
        function updateRankingOptions() {
          updateGroupRankings('thought-ranking');
          updateGroupRankings('feeling-ranking');
        }

        function updateGroupRankings(groupClass) {
          const selects = document.querySelectorAll('.' + groupClass);
          const selected = Array.from(selects)
            .map(s => s.value)
            .filter(v => v !== '');

          selects.forEach(select => {
            const currentValue = select.value;
            Array.from(select.options).forEach(option => {
              if (option.value && option.value !== currentValue) {
                if (selected.includes(option.value)) {
                  option.disabled = true;
                  option.style.color = '#ccc';
                  option.textContent = option.value + ' (taken)';
                } else {
                  option.disabled = false;
                  option.style.color = '';
                  option.textContent = option.value;
                }
              }
            });
          });
        }

        // Validate rankings before submission
        function validateRankings() {
          const errorDiv = document.getElementById('rankingError');

          // Validate thoughts
          const thoughtSelects = document.querySelectorAll('.thought-ranking');
          const thoughtRanks = Array.from(thoughtSelects).map(s => s.value);
          const thoughtSet = new Set(thoughtRanks.filter(v => v !== ''));

          if (thoughtSet.size !== 6) {
            errorDiv.textContent = 'Each thought must have a unique ranking from 1-10. Please check for duplicates.';
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
          }

          // Validate feelings
          const feelingSelects = document.querySelectorAll('.feeling-ranking');
          const feelingRanks = Array.from(feelingSelects).map(s => s.value);
          const feelingSet = new Set(feelingRanks.filter(v => v !== ''));

          if (feelingSet.size !== 6) {
            errorDiv.textContent = 'Each feeling must have a unique ranking from 1-10. Please check for duplicates.';
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
          }

          errorDiv.style.display = 'none';
          return true;
        }

        // Initialize on page load
        updateRankingOptions();
      </script>
    `;

    return html;
  },

  /**
   * Save page data to both PropertiesService and RESPONSES sheet
   * PropertiesService: Fast page-to-page navigation
   * RESPONSES sheet: Dashboard draft detection
   */
  savePageData(clientId, page, formData) {
    // Save to PropertiesService for fast page-to-page navigation
    DraftService.saveDraft('tool1', clientId, page, formData);

    // Also save to RESPONSES sheet for dashboard detection
    // Only on first page to create the DRAFT row with Is_Latest=true
    if (page === 1) {
      DataService.saveDraft(clientId, 'tool1', formData);
    }

    return { success: true };
  },

  /**
   * Get existing data for a client
   * Checks both EDIT_DRAFT (from ResponseManager) and PropertiesService drafts
   */
  getExistingData(clientId) {
    try {
      let data = null;

      // First check if there's an EDIT_DRAFT in RESPONSES sheet
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool1');

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`Found active draft with status: ${activeDraft.status}`);
          data = activeDraft.data;
        }
      }

      // CRITICAL: Also check PropertiesService and merge (for page 5 data in edit mode)
      // When editing, page 5 data gets saved to PropertiesService but EDIT_DRAFT is in RESPONSES
      const propData = DraftService.getDraft('tool1', clientId);

      if (propData) {
        if (data) {
          // Merge: PropertiesService data takes precedence (has latest page 5 data)
          Logger.log(`Merging PropertiesService data with EDIT_DRAFT`);
          data = { ...data, ...propData };
        } else {
          // No EDIT_DRAFT, use PropertiesService data
          data = propData;
        }
      }

      return data;
    } catch (error) {
      Logger.log(`Error getting existing data: ${error}`);
    }
    return null;
  },

  /**
   * Process final submission - Calculate scores and generate report
   * Handles both new submissions and edited responses
   * Returns redirect URL for completeToolSubmission() handler
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

      // DIAGNOSTIC: Log allData structure
      Logger.log(`allData keys: ${JSON.stringify(Object.keys(allData || {}))}`);
      Logger.log(`allData has thought_fsv? ${!!allData.thought_fsv}`);
      Logger.log(`allData has feeling_fsv? ${!!allData.feeling_fsv}`);

      // Calculate scores
      const scores = this.calculateScores(allData);
      Logger.log(`Calculated scores: ${JSON.stringify(scores)}`);

      // Determine winner
      const winner = this.determineWinner(scores, allData);
      Logger.log(`Determined winner: ${winner}`);

      // Prepare data package
      const dataPackage = {
        formData: allData,
        scores: scores,
        winner: winner
      };

      Logger.log(`dataPackage has winner? ${!!dataPackage.winner}, value: ${dataPackage.winner}`);

      // Save based on mode
      if (isEditMode && typeof DataService !== 'undefined') {
        // Submit edited response (uses ResponseManager)
        const result = DataService.submitEditedResponse(clientId, 'tool1', dataPackage);

        if (!result.success) {
          throw new Error(result.error || 'Failed to save edited response');
        }

        Logger.log('Edited response submitted successfully');
      } else {
        // Save new response to RESPONSES sheet using DataService
        // DataService handles Is_Latest flag and marks old responses as not latest
        const saveResult = DataService.saveToolResponse(clientId, 'tool1', dataPackage, 'COMPLETED');

        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save response');
        }

        Logger.log('New response submitted successfully');
      }

      // Unlock Tool 2 (completion is tracked via RESPONSES sheet)
      // Only unlock if not already unlocked (editing shouldn't re-unlock)
      if (!isEditMode) {
        ToolAccessControl.adminUnlockTool(clientId, 'tool2', 'system', 'Auto-unlocked after Tool 1 completion');
      }

      // Return redirect URL for client-side navigation
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool1_report&client=${clientId}`;
      return {
        redirectUrl: reportUrl
      };

    } catch (error) {
      Logger.log(`Error processing final submission: ${error}`);
      throw error; // Let completeToolSubmission handler deal with errors
    }
  },

  /**
   * Calculate scores for all 6 categories
   * Formula: sum(3 statements) + (2 × normalized_thought_ranking)
   */
  calculateScores(data) {
    // Helper: Normalize thought ranking (1-10) to (-5 to +5)
    const normalizeThought = (rank) => {
      const r = parseInt(rank);
      if (r >= 1 && r <= 5) return r - 6;  // 1→-5, 2→-4, ..., 5→-1
      if (r >= 6 && r <= 10) return r - 5; // 6→1, 7→2, ..., 10→5
      return 0;
    };

    // FSV: Q3, Q4, Q5 + thought_fsv
    const fsvStatements = parseInt(data.q3 || 0) + parseInt(data.q4 || 0) + parseInt(data.q5 || 0);
    const fsvThought = normalizeThought(data.thought_fsv || 0);
    const fsvScore = fsvStatements + (2 * fsvThought);

    // ExVal: Q6, Q7, Q8 + thought_exval
    const exValStatements = parseInt(data.q6 || 0) + parseInt(data.q7 || 0) + parseInt(data.q8 || 0);
    const exValThought = normalizeThought(data.thought_exval || 0);
    const exValScore = exValStatements + (2 * exValThought);

    // Showing: Q10, Q11, Q12 + thought_showing
    const showingStatements = parseInt(data.q10 || 0) + parseInt(data.q11 || 0) + parseInt(data.q12 || 0);
    const showingThought = normalizeThought(data.thought_showing || 0);
    const showingScore = showingStatements + (2 * showingThought);

    // Receiving: Q13, Q14, Q15 + thought_receiving
    const receivingStatements = parseInt(data.q13 || 0) + parseInt(data.q14 || 0) + parseInt(data.q15 || 0);
    const receivingThought = normalizeThought(data.thought_receiving || 0);
    const receivingScore = receivingStatements + (2 * receivingThought);

    // Control: Q17, Q18, Q19 + thought_control
    const controlStatements = parseInt(data.q17 || 0) + parseInt(data.q18 || 0) + parseInt(data.q19 || 0);
    const controlThought = normalizeThought(data.thought_control || 0);
    const controlScore = controlStatements + (2 * controlThought);

    // Fear: Q20, Q21, Q22 + thought_fear
    const fearStatements = parseInt(data.q20 || 0) + parseInt(data.q21 || 0) + parseInt(data.q22 || 0);
    const fearThought = normalizeThought(data.thought_fear || 0);
    const fearScore = fearStatements + (2 * fearThought);

    return {
      FSV: fsvScore,
      ExVal: exValScore,
      Showing: showingScore,
      Receiving: receivingScore,
      Control: controlScore,
      Fear: fearScore
    };
  },

  /**
   * Determine winner with tie-breaker using feeling rankings
   */
  determineWinner(scores, data) {
    const categories = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
    const feelingFields = {
      'FSV': 'feeling_fsv',
      'ExVal': 'feeling_exval',
      'Showing': 'feeling_showing',
      'Receiving': 'feeling_receiving',
      'Control': 'feeling_control',
      'Fear': 'feeling_fear'
    };

    // Find max score
    const maxScore = Math.max(...Object.values(scores));

    // Find all categories with max score
    const tied = categories.filter(cat => scores[cat] === maxScore);

    // If no tie, return winner
    if (tied.length === 1) {
      return tied[0];
    }

    // Tie-breaker: Use highest feeling ranking
    let winner = tied[0];
    let highestFeeling = parseInt(data[feelingFields[tied[0]]] || 0);

    for (let i = 1; i < tied.length; i++) {
      const cat = tied[i];
      const feeling = parseInt(data[feelingFields[cat]] || 0);
      if (feeling > highestFeeling) {
        highestFeeling = feeling;
        winner = cat;
      }
    }

    return winner;
  },

  /**
   * DEPRECATED: This method has been removed.
   * Use DataService.saveToolResponse() instead.
   *
   * DataService properly handles:
   * - Is_Latest flag (7th column)
   * - Marking old responses as not latest
   * - Version control and cleanup
   */
};
