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
      </head>
      <body>
        <div class="container">
          <div class="tool-navigation">
            <button class="btn-nav" onclick="location.href='<?= baseUrl ?>?route=dashboard&client=<?= clientId ?>'">
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
   * Placeholder for remaining pages
   */
  renderPage3(data, clientId) {
    return '<h2>Section 2</h2><p>Coming soon in Phase 2...</p>';
  },

  renderPage4(data, clientId) {
    return '<h2>Section 3</h2><p>Coming soon in Phase 2...</p>';
  },

  renderPage5(data, clientId) {
    return '<h2>Rankings</h2><p>Coming soon in Phase 2...</p>';
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
   * Save page data to temporary storage
   */
  savePageData(clientId, page, formData) {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName('RESPONSES');
    // TODO: Implement data persistence
    Logger.log(`Saving page ${page} data for ${clientId}`);
  },

  /**
   * Get existing data for a client
   */
  getExistingData(clientId) {
    // TODO: Implement data retrieval
    return null;
  },

  /**
   * Process final submission
   */
  processFinalSubmission(clientId) {
    // TODO: Implement scoring and report generation
    return HtmlService.createHtmlOutput('<h1>Assessment Complete!</h1><p>Your report will be emailed to you shortly.</p>');
  }
};
