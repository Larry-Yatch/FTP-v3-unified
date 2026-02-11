/**
 * Tool8Report.js - PDF Report Generation for Investment Planning Tool
 *
 * Handles single-scenario and comparison PDF reports.
 * Phase 1: Skeleton only. Full implementation in Phase 4 (scenarios)
 * and Phase 7 (action barriers).
 */

const Tool8Report = {

  /**
   * Render a Tool 8 report page (for system route handler)
   * @param {string} clientId - Student client ID
   * @returns {HtmlOutput} Report HTML
   */
  render(clientId) {
    try {
      // Phase 1: Placeholder report
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Investment Planning Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      padding: 40px;
      text-align: center;
    }
    h1 { color: #ad9168; }
    p { color: #a0a0a0; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Investment Planning Report</h1>
  <p>Report generation will be available after Phase 4 implementation.</p>
  <p>Client: ${clientId}</p>
</body>
</html>`;

      return HtmlService.createHtmlOutput(html)
        .setTitle('Investment Planning Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      console.error('Tool8Report.render error:', error);
      return HtmlService.createHtmlOutput('<h1>Error generating report</h1><p>' + error.toString() + '</p>');
    }
  }
};
