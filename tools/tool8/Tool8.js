/**
 * Tool8.js - Investment Planning Tool
 *
 * Retirement investment calculator with scenario planning, comparison,
 * upstream data pre-population, and trauma-informed investment guidance.
 *
 * Architecture: Single-page calculator (like Tool4/Tool6)
 * Entry point: Tool8.render(params)
 */

const Tool8 = {
  manifest: null, // Injected by ToolRegistry

  /**
   * Main entry point - renders the Tool 8 calculator page
   * @param {Object} params - Route parameters from Router
   * @param {string} params.clientId - Student client ID
   * @returns {string} Full HTML page
   */
  render(params) {
    try {
      const clientId = params.clientId || params.client;

      if (!clientId) {
        return this.renderError('No client ID provided.');
      }

      const htmlContent = this.buildPage(clientId);
      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('Investment Planning Tool')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      console.error('Tool8.render error:', error);
      return HtmlService.createHtmlOutput(this.renderError(error.toString()))
        .setTitle('Tool 8 - Error')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  },

  /**
   * Build the Tool 8 page HTML
   * Phase 1: Minimal scaffold showing client ID
   * @param {string} clientId
   * @returns {string} HTML
   */
  buildPage(clientId) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Investment Planning Tool</title>
  <style>
    :root {
      --primary: #ad9168;
      --primary-dark: #8b7451;
      --primary-light: #c4a67a;
      --bg-dark: #1a1a2e;
      --bg-card: #16213e;
      --bg-surface: #1c2a4a;
      --text-primary: #e0e0e0;
      --text-secondary: #a0a0a0;
      --text-muted: #707070;
      --accent-gold: #c4a052;
      --accent-gold-light: #f4d378;
      --border: rgba(173, 145, 104, 0.2);
      --shadow: rgba(0, 0, 0, 0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding: 40px 20px;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 28px;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .scaffold-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }

    .scaffold-card .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .scaffold-card h2 {
      color: var(--primary-light);
      margin-bottom: 12px;
      font-size: 20px;
    }

    .scaffold-card p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .scaffold-card .client-id {
      display: inline-block;
      margin-top: 16px;
      padding: 8px 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      color: var(--accent-gold);
    }

    .back-btn {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 24px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
    }

    .back-btn:hover {
      background: var(--primary-dark);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Investment Planning Tool</h1>
      <div class="subtitle">Retirement investment calculator with scenario planning</div>
    </div>

    <div class="scaffold-card">
      <div class="icon">📈</div>
      <h2>Tool 8 - Phase 1 Scaffold</h2>
      <p>The Investment Planning Tool is being integrated into the FTP-v3 framework.</p>
      <p>This page confirms successful routing and rendering.</p>
      <div class="client-id">Client ID: ${clientId}</div>
      <br>
      <button class="back-btn" onclick="goToDashboard()">Back to Dashboard</button>
    </div>
  </div>

  <script>
    function goToDashboard() {
      google.script.run
        .withSuccessHandler(function(html) {
          document.open();
          document.write(html);
          document.close();
          window.scrollTo(0, 0);
        })
        .withFailureHandler(function(err) {
          console.error('Navigation error:', err);
        })
        .getDashboardPage('${clientId}');
    }
  </script>
</body>
</html>`;
  },

  /**
   * Render an error page
   * @param {string} message - Error message
   * @returns {string} HTML
   */
  renderError(message) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tool 8 - Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .error-card {
      background: #16213e;
      border: 1px solid rgba(220, 53, 69, 0.3);
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
    }
    .error-card h2 { color: #dc3545; margin-bottom: 12px; }
    .error-card p { color: #a0a0a0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="error-card">
    <h2>Something went wrong</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;
  }
};
