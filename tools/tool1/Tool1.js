/**
 * Tool 1: Core Trauma Strategy Assessment
 * Top-level psychological assessment
 */

const Tool1 = {
  manifest: null, // Will be injected by ToolRegistry

  /**
   * Render the tool UI
   * @param {Object} params - {clientId, sessionId, page}
   * @returns {HtmlOutput}
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;

    // Get existing data if resuming
    const existingData = this.getExistingData(clientId);

    const template = HtmlService.createTemplate(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Core Trauma Strategy Assessment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          html, body {
            background: linear-gradient(135deg, #4b4166, #1e192b);
            margin: 0;
            padding: 0;
          }
        </style>
        <?!= include('shared/styles') ?>
        <?!= include('shared/loading-animation') ?>
      </head>
      <body>
        <div class="container">
          <div class="tool-navigation">
            <button class="btn-nav" onclick="navigateWithLoading('<?= baseUrl ?>?route=dashboard&client=<?= clientId ?>', 'Loading Dashboard')">
              ← Dashboard
            </button>
            <span>Page <?= page ?> of 5</span>
          </div>

          <div class="card">
            <h1>Core Trauma Strategy Assessment</h1>
            <p class="muted">Page <?= page ?> of 5</p>

            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" style="width: <?= (page / 5) * 100 ?>%"></div>
              </div>
            </div>

            <?!= pageContent ?>
          </div>
        </div>

        <script>
          document.body.classList.add('loaded');
        </script>
      </body>
      </html>
    `);

    template.baseUrl = ScriptApp.getService().getUrl();
    template.clientId = clientId;
    template.page = page;
    template.pageContent = this.renderPage(page, existingData, clientId);

    return template.evaluate()
      .setTitle('TruPath - Core Trauma Strategy Assessment')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Render specific page content
   */
  renderPage(page, existingData, clientId) {
    switch(page) {
      case 1:
        return this.renderPage1(existingData, clientId);
      case 2:
        return this.renderPage2(existingData, clientId);
      case 3:
        return this.renderPage3(existingData, clientId);
      case 4:
        return this.renderPage4(existingData, clientId);
      case 5:
        return this.renderPage5(existingData, clientId);
      default:
        return '<p class="error">Invalid page number</p>';
    }
  },

  /**
   * Page 1: Name and Email
   */
  renderPage1(data, clientId) {
    const name = data?.name || '';
    const email = data?.email || '';

    return `
      <h2>Let's Get Started</h2>
      <p class="muted mb-20">This assessment will help identify your core trauma strategy patterns.</p>

      <form id="page1Form" method="POST" action="${ScriptApp.getService().getUrl()}">
        <input type="hidden" name="route" value="tool1_submit">
        <input type="hidden" name="client" value="${clientId}">
        <input type="hidden" name="page" value="1">

        <div class="form-group">
          <label class="form-label">First and Last Name *</label>
          <input type="text" name="name" value="${name}" placeholder="Your full name" required>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" name="email" value="${email}" placeholder="your@email.com" required>
        </div>

        <button type="submit" class="btn-primary">Continue to Section 1 →</button>
      </form>
    `;
  },

  /**
   * Page 2: Section 1 - FSV & Control (Questions 3-8)
   */
  renderPage2(data, clientId) {
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

      <form id="page2Form" method="POST" action="${ScriptApp.getService().getUrl()}">
        <input type="hidden" name="route" value="tool1_submit">
        <input type="hidden" name="client" value="${clientId}">
        <input type="hidden" name="page" value="2">
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

    html += `
        <button type="submit" class="btn-primary">Continue to Section 2 →</button>
      </form>
    `;

    return html;
  },

  /**
   * Page 3: Section 2 - Showing & Receiving (Questions 10-15)
   */
  renderPage3(data, clientId) {
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

      <form id="page3Form" method="POST" action="${ScriptApp.getService().getUrl()}">
        <input type="hidden" name="route" value="tool1_submit">
        <input type="hidden" name="client" value="${clientId}">
        <input type="hidden" name="page" value="3">
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

    html += `
        <button type="submit" class="btn-primary">Continue to Section 3 →</button>
      </form>
    `;

    return html;
  },

  /**
   * Page 4: Section 3 - Control & Fear (Questions 17-22)
   */
  renderPage4(data, clientId) {
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

      <form id="page4Form" method="POST" action="${ScriptApp.getService().getUrl()}">
        <input type="hidden" name="route" value="tool1_submit">
        <input type="hidden" name="client" value="${clientId}">
        <input type="hidden" name="page" value="4">
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

    html += `
        <button type="submit" class="btn-primary">Continue to Rankings →</button>
      </form>
    `;

    return html;
  },

  /**
   * Page 5: Rankings (Questions 24 & 26)
   */
  renderPage5(data, clientId) {
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

      <form id="page5Form" method="POST" action="${ScriptApp.getService().getUrl()}" onsubmit="return validateRankings()">
        <input type="hidden" name="route" value="tool1_submit">
        <input type="hidden" name="client" value="${clientId}">
        <input type="hidden" name="page" value="5">

        <h3 style="margin-top: 30px;">Ranking Thoughts</h3>
        <p class="muted" style="font-size: 14px;">Rank from 1 (least relevant) to 10 (most relevant)</p>
    `;

    thoughts.forEach(t => {
      const selected = data?.[t.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${t.text} *</label>
          <select name="${t.name}" class="ranking-select thought-ranking" onchange="updateRankingOptions()" required>
            <option value="">Select rank (1-10)</option>
            ${Array.from({length: 10}, (_, i) => i + 1).map(rank =>
              `<option value="${rank}" ${selected == rank ? 'selected' : ''}>${rank}</option>`
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
      const selected = data?.[f.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${f.text} *</label>
          <select name="${f.name}" class="ranking-select feeling-ranking" onchange="updateRankingOptions()" required>
            <option value="">Select rank (1-10)</option>
            ${Array.from({length: 10}, (_, i) => i + 1).map(rank =>
              `<option value="${rank}" ${selected == rank ? 'selected' : ''}>${rank}</option>`
            ).join('')}
          </select>
        </div>
      `;
    });

    html += `
        <div id="rankingError" class="error" style="display: none; margin: 20px 0; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 8px;"></div>

        <button type="submit" class="btn-primary">Submit Assessment →</button>
      </form>

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
   * Handle form submission
   */
  handleSubmit(formData) {
    const clientId = formData.client;
    const page = parseInt(formData.page);

    // Save form data
    this.savePageData(clientId, page, formData);

    // Redirect to next page
    const nextPage = page + 1;
    if (nextPage <= 5) {
      return HtmlService.createHtmlOutput(`
        <script>
          window.top.location.href = '${ScriptApp.getService().getUrl()}?route=tool1&client=${clientId}&page=${nextPage}';
        </script>
      `);
    } else {
      // Process final submission
      return this.processFinalSubmission(clientId);
    }
  },

  /**
   * Save page data using PropertiesService (draft storage)
   */
  savePageData(clientId, page, formData) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = `tool1_draft_${clientId}`;

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
        if (key !== 'route' && key !== 'client' && key !== 'page') {
          draftData[key] = formData[key];
        }
      }

      // Save updated draft
      draftData.lastPage = page;
      draftData.lastUpdate = new Date().toISOString();
      userProperties.setProperty(draftKey, JSON.stringify(draftData));

      Logger.log(`Saved page ${page} data for ${clientId}`);
    } catch (error) {
      Logger.log(`Error saving page data: ${error}`);
    }
  },

  /**
   * Get existing data for a client (from draft storage)
   */
  getExistingData(clientId) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const draftKey = `tool1_draft_${clientId}`;
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
   * Process final submission - Calculate scores and generate report
   */
  processFinalSubmission(clientId) {
    try {
      // Get all submitted data
      const allData = this.getExistingData(clientId);

      if (!allData) {
        return HtmlService.createHtmlOutput('<h1>Error</h1><p>No data found. Please start the assessment again.</p>');
      }

      // Calculate scores
      const scores = this.calculateScores(allData);

      // Determine winner
      const winner = this.determineWinner(scores, allData);

      // Save to RESPONSES sheet (this marks Tool 1 as complete)
      this.saveToResponses(clientId, allData, scores, winner);

      // Unlock Tool 2 (completion is tracked via RESPONSES sheet)
      ToolAccessControl.adminUnlockTool(clientId, 'tool2', 'system', 'Auto-unlocked after Tool 1 completion');

      // Redirect to report page
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool1_report&client=${clientId}`;
      return HtmlService.createHtmlOutput(`
        <script>
          window.top.location.href = '${reportUrl}';
        </script>
      `);

    } catch (error) {
      Logger.log(`Error processing final submission: ${error}`);
      return HtmlService.createHtmlOutput(`<h1>Error</h1><p>${error.toString()}</p>`);
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
   * Save final results to RESPONSES sheet
   */
  saveToResponses(clientId, data, scores, winner) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const row = [
        new Date().toISOString(),           // Timestamp
        clientId,                           // Client_ID
        'tool1',                            // Tool_ID
        JSON.stringify({                    // Data (JSON)
          formData: data,
          scores: scores,
          winner: winner
        }),
        '1.0.0',                           // Version
        'COMPLETED'                        // Status
      ];

      responseSheet.appendRow(row);
      SpreadsheetApp.flush();

      Logger.log(`Saved Tool 1 results for ${clientId} - Winner: ${winner}`);
    } catch (error) {
      Logger.log(`Error saving to responses: ${error}`);
      throw error;
    }
  }
};
