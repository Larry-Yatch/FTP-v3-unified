/**
 * Tool 1: Core Trauma Strategy Assessment
 * Top-level psychological assessment
 */

const Tool1 = Object.assign({}, FormToolBase, {
  manifest: null, // Will be injected by ToolRegistry

  formConfig: {
    toolId: 'tool1',
    toolName: 'Core Trauma Strategy Assessment',
    pageTitle: 'Core Trauma Strategy Assessment',
    totalPages: 6
  },

  /**
   * Custom validation for pages 5 and 6 (unique ranking requirement)
   */
  getCustomValidation(page) {
    if (page === 5) return 'validateThoughtRankings';
    if (page === 6) return 'validateFeelingRankings';
    return null;
  },

  /**
   * Render page-specific content (just the form fields, not the full page)
   * FormToolBase.render() wraps this in standard page structure
   */
  renderPageContent(page, existingData, clientId) {
    switch(page) {
      case 1: return this.renderPage1Content(existingData, clientId);
      case 2: return this.renderPage2Content(existingData, clientId);
      case 3: return this.renderPage3Content(existingData, clientId);
      case 4: return this.renderPage4Content(existingData, clientId);
      case 5: return this.renderPage5Content(existingData, clientId);
      case 6: return this.renderPage6Content(existingData, clientId);
      default: return '<p class="error">Invalid page number</p>';
    }
  },

  /**
   * Page 1: Name and Email (content only, FormUtils wraps in form)
   */
  renderPage1Content(data, clientId) {
    var name = data?.name || '';
    var email = data?.email || '';

    // Auto-populate from Students sheet if not already filled
    if ((!name || !email) && clientId) {
      try {
        var studentsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS) || [];
        for (var i = 1; i < studentsData.length; i++) {
          if (studentsData[i][CONFIG.COLUMN_INDEXES.STUDENTS.CLIENT_ID] === clientId) {
            if (!name) name = studentsData[i][CONFIG.COLUMN_INDEXES.STUDENTS.NAME] || '';
            if (!email) email = studentsData[i][CONFIG.COLUMN_INDEXES.STUDENTS.EMAIL] || '';
            break;
          }
        }
      } catch (e) {
        LogUtils.debug('[Tool1] Could not auto-populate name/email: ' + e.message);
      }
    }

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
   * Shared drag-and-drop ranking styles and script
   * Used by both Page 5 (Thoughts) and Page 6 (Feelings)
   */
  _getRankingStyles() {
    return `
      .ranking-list { list-style: none; padding: 0; margin: 20px 0; }
      .ranking-item {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 16px; margin-bottom: 8px;
        background: #fff; border: 2px solid #e0d6cc;
        border-radius: 10px; cursor: grab;
        transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      .ranking-item:active { cursor: grabbing; }
      .ranking-item.dragging {
        opacity: 0.9; transform: scale(1.02);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        border-color: #ad9168; z-index: 100;
      }
      .ranking-item .rank-number {
        min-width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        background: #f0ebe4; color: #6b5a47; font-weight: 700;
        border-radius: 50%; font-size: 14px; flex-shrink: 0;
      }
      .ranking-item .rank-text { flex: 1; font-size: 15px; line-height: 1.4; color: #333; }
      .ranking-item .drag-handle {
        color: #bbb; font-size: 20px; flex-shrink: 0;
        display: flex; align-items: center;
      }
      .ranking-label-row {
        display: flex; justify-content: space-between;
        padding: 0 16px; margin-bottom: 6px;
        font-size: 12px; color: #999; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.5px;
      }
      .drop-indicator {
        height: 4px; background: #ad9168; border-radius: 2px;
        margin: -4px 0 4px 0; display: none;
      }
      .drop-indicator.visible { display: block; }
    `;
  },

  _getRankingScript(listId, fieldPrefix) {
    return `
      (function() {
        var list = document.getElementById("${listId}");
        var dragItem = null;
        var touchStartY = 0;
        var touchOffsetY = 0;
        var placeholder = null;

        function updateHiddenInputs() {
          var items = list.querySelectorAll(".ranking-item");
          for (var i = 0; i < items.length; i++) {
            var name = items[i].getAttribute("data-name");
            var input = document.querySelector("input[name=" + "'" + name + "'" + "]");
            if (input) input.value = i + 1;
            var numEl = items[i].querySelector(".rank-number");
            if (numEl) numEl.textContent = i + 1;
          }
        }

        // --- Mouse drag ---
        list.addEventListener("mousedown", function(e) {
          var item = e.target.closest(".ranking-item");
          if (!item) return;
          e.preventDefault();
          dragItem = item;
          dragItem.classList.add("dragging");

          function onMouseMove(e) {
            if (!dragItem) return;
            var items = Array.from(list.querySelectorAll(".ranking-item:not(.dragging)"));
            var afterElement = null;
            for (var i = 0; i < items.length; i++) {
              var box = items[i].getBoundingClientRect();
              var offset = e.clientY - box.top - box.height / 2;
              if (offset < 0) { afterElement = items[i]; break; }
            }
            if (afterElement) {
              list.insertBefore(dragItem, afterElement);
            } else {
              list.appendChild(dragItem);
            }
          }

          function onMouseUp() {
            if (dragItem) dragItem.classList.remove("dragging");
            dragItem = null;
            updateHiddenInputs();
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          }

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        });

        // --- Touch drag ---
        list.addEventListener("touchstart", function(e) {
          var item = e.target.closest(".ranking-item");
          if (!item) return;
          dragItem = item;
          var touch = e.touches[0];
          var rect = item.getBoundingClientRect();
          touchOffsetY = touch.clientY - rect.top;
          touchStartY = touch.clientY;

          // Create placeholder
          placeholder = document.createElement("li");
          placeholder.style.height = rect.height + "px";
          placeholder.style.background = "rgba(173,145,104,0.1)";
          placeholder.style.border = "2px dashed #ad9168";
          placeholder.style.borderRadius = "10px";
          placeholder.style.marginBottom = "8px";
          placeholder.style.listStyle = "none";

          // Float the dragged item
          dragItem.classList.add("dragging");
          dragItem.style.position = "fixed";
          dragItem.style.left = rect.left + "px";
          dragItem.style.top = (touch.clientY - touchOffsetY) + "px";
          dragItem.style.width = rect.width + "px";
          dragItem.style.zIndex = "1000";

          list.insertBefore(placeholder, dragItem);
        }, {passive: true});

        list.addEventListener("touchmove", function(e) {
          if (!dragItem || !placeholder) return;
          e.preventDefault();
          var touch = e.touches[0];
          dragItem.style.top = (touch.clientY - touchOffsetY) + "px";

          var items = Array.from(list.querySelectorAll(".ranking-item:not(.dragging)"));
          var afterElement = null;
          for (var i = 0; i < items.length; i++) {
            var box = items[i].getBoundingClientRect();
            if (touch.clientY < box.top + box.height / 2) { afterElement = items[i]; break; }
          }
          if (afterElement) {
            list.insertBefore(placeholder, afterElement);
          } else {
            list.appendChild(placeholder);
          }
        }, {passive: false});

        list.addEventListener("touchend", function(e) {
          if (!dragItem) return;
          dragItem.classList.remove("dragging");
          dragItem.style.position = "";
          dragItem.style.left = "";
          dragItem.style.top = "";
          dragItem.style.width = "";
          dragItem.style.zIndex = "";

          if (placeholder && placeholder.parentNode) {
            list.insertBefore(dragItem, placeholder);
            placeholder.parentNode.removeChild(placeholder);
          }
          placeholder = null;
          dragItem = null;
          updateHiddenInputs();
        });

        // Initialize rank numbers
        updateHiddenInputs();
      })();
    `;
  },

  /**
   * Build a drag-and-drop ranking list from items array
   * Restores previous order from saved data if available
   */
  _buildRankingList(items, formData, listId, fieldPrefix) {
    // Sort items by saved rank if available (for edit mode / back navigation)
    var ordered = items.slice();
    var hasSavedData = false;
    for (var i = 0; i < items.length; i++) {
      if (formData[items[i].name]) { hasSavedData = true; break; }
    }
    if (hasSavedData) {
      ordered.sort(function(a, b) {
        var ra = parseInt(formData[a.name]) || 99;
        var rb = parseInt(formData[b.name]) || 99;
        return ra - rb;
      });
    }

    var html = '<ul id="' + listId + '" class="ranking-list">';
    for (var i = 0; i < ordered.length; i++) {
      var t = ordered[i];
      html += '<li class="ranking-item" data-name="' + t.name + '">' +
        '<span class="rank-number">' + (i + 1) + '</span>' +
        '<span class="rank-text">' + t.text + '</span>' +
        '<span class="drag-handle">&#8661;</span>' +
      '</li>';
    }
    html += '</ul>';

    // Hidden inputs to store rank values
    for (var i = 0; i < items.length; i++) {
      var val = formData[items[i].name] || '';
      html += '<input type="hidden" name="' + items[i].name + '" value="' + val + '">';
    }

    return html;
  },

  /**
   * Page 5: Rank Your Thoughts
   */
  renderPage5Content(data, clientId) {
    // DEFENSIVE: Extract formData if nested (EDIT_DRAFT compatibility)
    const formData = data?.formData || data || {};

    const thoughts = [
      {name: 'thought_fsv', text: 'I have to do something / be someone better to be safe.'},
      {name: 'thought_exval', text: 'I need others to value me to be safe.'},
      {name: 'thought_showing', text: 'I need to suffer or sacrifice for others to be safe.'},
      {name: 'thought_receiving', text: 'I have to keep distance from others to be safe.'},
      {name: 'thought_control', text: 'I need to control my environment to be safe.'},
      {name: 'thought_fear', text: 'I need to protect myself to be safe.'}
    ];

    let html = `
      <h2>Step 5: Rank Your Thoughts</h2>
      <p class="muted mb-20">
        Below are six thought patterns. Read each one and ask yourself: <em>how often does this thought show up in my mind?</em>
      </p>
      <p class="muted mb-20">
        <strong>Drag and drop</strong> to reorder from <strong>least applicable</strong> (top) to <strong>most applicable</strong> (bottom).
      </p>
      <p class="muted mb-20">
        Go with your gut, not what you think sounds right.
      </p>
      <style>${this._getRankingStyles()}</style>
      <div class="ranking-label-row">
        <span>&#9650; Least applicable</span>
        <span>Most applicable &#9660;</span>
      </div>
    `;

    html += this._buildRankingList(thoughts, formData, 'thoughtRankingList', 'thought');
    html += '<input type="hidden" name="_rankFormat" value="drag6">';

    html += `
      <script>${this._getRankingScript('thoughtRankingList', 'thought')}</script>
      <script>
        function validateThoughtRankings() { return true; }
      </script>
    `;

    return html;
  },

  /**
   * Page 6: Rank Your Feelings
   */
  renderPage6Content(data, clientId) {
    // DEFENSIVE: Extract formData if nested (EDIT_DRAFT compatibility)
    const formData = data?.formData || data || {};

    const feelings = [
      {name: 'feeling_fsv', text: 'I feel insufficient.'},
      {name: 'feeling_exval', text: 'I feel like I am not good enough for them.'},
      {name: 'feeling_showing', text: 'I feel the need to sacrifice for others.'},
      {name: 'feeling_receiving', text: 'I feel like nobody loves me.'},
      {name: 'feeling_control', text: 'I feel out of control of my world.'},
      {name: 'feeling_fear', text: 'I feel like I am in danger.'}
    ];

    let html = `
      <h2>Step 6: Rank Your Feelings</h2>
      <p class="muted mb-20">
        Below are six feeling states. Read each one and ask yourself: <em>how familiar does this feeling feel to you?</em>
      </p>
      <p class="muted mb-20">
        <strong>Drag and drop</strong> to reorder from <strong>least familiar</strong> (top) to <strong>most familiar</strong> (bottom).
      </p>
      <p class="muted mb-20">
        These are feelings, not thoughts &mdash; notice your physical response, not just your logic.
      </p>
      <style>${this._getRankingStyles()}</style>
      <div class="ranking-label-row">
        <span>&#9650; Least familiar</span>
        <span>Most familiar &#9660;</span>
      </div>
    `;

    html += this._buildRankingList(feelings, formData, 'feelingRankingList', 'feeling');

    html += `
      <script>${this._getRankingScript('feelingRankingList', 'feeling')}</script>
      <script>
        function validateFeelingRankings() { return true; }
      </script>
    `;

    return html;
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

      LogUtils.debug(`Processing ${isEditMode ? 'edited' : 'new'} submission for ${clientId}`);

      // DIAGNOSTIC: Log allData structure
      LogUtils.debug(`allData keys: ${JSON.stringify(Object.keys(allData || {}))}`);
      LogUtils.debug(`allData has thought_fsv? ${!!allData.thought_fsv}`);
      LogUtils.debug(`allData has feeling_fsv? ${!!allData.feeling_fsv}`);

      // Calculate scores
      const scores = this.calculateScores(allData);
      LogUtils.debug(`Calculated scores: ${JSON.stringify(scores)}`);

      // Determine winner
      const winner = this.determineWinner(scores, allData);
      LogUtils.debug(`Determined winner: ${winner}`);

      // Detect profile type (score classification + profile categorization)
      const profileType = this.detectProfileType(scores, winner);
      LogUtils.debug(`Detected profile type: ${JSON.stringify(profileType)}`);

      // Prepare data package
      const dataPackage = {
        formData: allData,
        scores: scores,
        winner: winner,
        profileType: profileType
      };

      LogUtils.debug(`dataPackage has winner? ${!!dataPackage.winner}, value: ${dataPackage.winner}`);

      // Save based on mode
      if (isEditMode && typeof DataService !== 'undefined') {
        // Submit edited response (uses ResponseManager)
        const result = DataService.submitEditedResponse(clientId, 'tool1', dataPackage);

        if (!result.success) {
          throw new Error(result.error || 'Failed to save edited response');
        }

        LogUtils.debug('Edited response submitted successfully');
      } else {
        // Save new response to RESPONSES sheet using DataService
        // DataService handles Is_Latest flag and marks old responses as not latest
        const saveResult = DataService.saveToolResponse(clientId, 'tool1', dataPackage, 'COMPLETED');

        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save response');
        }

        LogUtils.debug('New response submitted successfully');
      }

      // Clean up PropertiesService (prevent memory leak)
      DraftService.clearDraft('tool1', clientId);

      // AUTO-UNLOCK DISABLED - Tools are now unlocked manually by admin
      // To re-enable, uncomment the following:
      // if (!isEditMode) {
      //   ToolAccessControl.adminUnlockTool(clientId, 'tool2', 'system', 'Auto-unlocked after Tool 1 completion');
      // }

      // Return redirect URL for client-side navigation
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool1_report&client=${clientId}`;
      return {
        redirectUrl: reportUrl
      };

    } catch (error) {
      LogUtils.error(`Error processing final submission: ${error}`);
      throw error; // Let completeToolSubmission handler deal with errors
    }
  },

  /**
   * Calculate scores for all 6 categories
   * Formula: sum(3 statements) + (2 × normalized_thought_ranking)
   */
  calculateScores(data) {
    // Helper: Normalize thought ranking to (-5 to +5)
    // Supports both new drag-and-drop (1-6) and legacy dropdown (1-10)
    const isDrag6 = data._rankFormat === 'drag6';
    const normalizeThought = (rank) => {
      const r = parseInt(rank);
      if (!r || r < 1) return 0;
      if (isDrag6) {
        // New format: 1-6 drag-and-drop (1=least, 6=most)
        // Map: 1→-5, 2→-3, 3→-1, 4→1, 5→3, 6→5
        if (r >= 1 && r <= 6) return (r * 2) - 7;
        return 0;
      }
      // Legacy format: 1-10 dropdowns
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
   * Classify a single pattern score as HIGH, MODERATE, or LOW
   * Uses data-driven thresholds from Tool1Constants.js
   *
   * @param {string} pattern - Pattern key (FSV, ExVal, Showing, Receiving, Control, Fear)
   * @param {number} score - The raw score for this pattern
   * @returns {string} 'HIGH' | 'MODERATE' | 'LOW'
   */
  classifyPatternScore(pattern, score) {
    const t = TOOL1_PATTERN_THRESHOLDS[pattern];
    if (!t) {
      LogUtils.warn('classifyPatternScore: unknown pattern "' + pattern + '", defaulting to MODERATE');
      return 'MODERATE';
    }
    if (score > t.high) return 'HIGH';
    if (score < t.low)  return 'LOW';
    return 'MODERATE';
  },

  /**
   * Detect profile type from scores and winner
   * Returns one of: STRONG_SINGLE, MODERATE_SINGLE, BORDERLINE_DUAL, NEGATIVE_DOMINANT
   *
   * @param {Object} scores - {FSV, ExVal, Showing, Receiving, Control, Fear}
   * @param {string} winner - The winning pattern key
   * @returns {Object} Profile type object with type, winner, and classification data
   */
  detectProfileType(scores, winner) {
    const classified = {};
    Object.keys(scores).forEach(function(p) {
      classified[p] = Tool1.classifyPatternScore(p, scores[p]);
    });

    const highPatterns = Object.keys(classified).filter(function(p) { return classified[p] === 'HIGH'; });
    const lowPatterns  = Object.keys(classified).filter(function(p) { return classified[p] === 'LOW'; });

    // Negative-dominant: 4 or more patterns below their LOW threshold
    if (lowPatterns.length >= 4) {
      var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
      return {
        type: 'NEGATIVE_DOMINANT',
        winner: sorted[0][0],
        secondary: null,
        margin: sorted[0][1] - sorted[1][1],
        highPatterns: [],
        lowPatterns: lowPatterns,
        classified: classified,
        note: 'Winner is least-negative, not a strong positive signal'
      };
    }

    var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
    var margin = sorted[0][1] - sorted[1][1];

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

    // Strong single: margin > 10 and winner is HIGH classification
    if (margin > 10 && classified[winner] === 'HIGH') {
      return {
        type: 'STRONG_SINGLE',
        winner: winner,
        secondary: null,
        margin: margin,
        highPatterns: highPatterns,
        lowPatterns: lowPatterns,
        classified: classified
      };
    }

    // Default: moderate single
    return {
      type: 'MODERATE_SINGLE',
      winner: winner,
      secondary: null,
      margin: margin,
      highPatterns: highPatterns,
      lowPatterns: lowPatterns,
      classified: classified
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

});
