/**
 * Tool2Report.js
 * Generates the Financial Clarity & Values Assessment report page and PDF download
 *
 * SCAFFOLDING: Report structure ready for content tomorrow
 */

const Tool2Report = {

  /**
   * Render the report page
   * @param {string} clientId - Client ID
   * @returns {HtmlOutput} Report page
   */
  render(clientId) {
    try {
      // Get saved results from RESPONSES sheet
      const results = this.getResults(clientId);

      if (!results) {
        return HtmlService.createHtmlOutput(`
          <h1>Error</h1>
          <p>No assessment results found for client ${clientId}</p>
          <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}">← Back to Dashboard</a>
        `);
      }

      // Build report HTML
      const reportHtml = this.buildReportHTML(clientId, results);

      return HtmlService.createHtmlOutput(reportHtml)
        .setTitle('TruPath - Financial Clarity & Values Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering report: ${error}`);
      return HtmlService.createHtmlOutput(`
        <h1>Error</h1>
        <p>${error.toString()}</p>
      `);
    }
  },

  /**
   * Get assessment results from RESPONSES sheet
   */
  getResults(clientId) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

      const data = responseSheet.getDataRange().getValues();
      const headers = data[0];

      const clientIdCol = headers.indexOf('Client_ID');
      const toolIdCol = headers.indexOf('Tool_ID');
      const dataCol = headers.indexOf('Data') !== -1 ? headers.indexOf('Data') : headers.indexOf('Version');

      // Find most recent Tool 2 result for this client
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][clientIdCol] === clientId && data[i][toolIdCol] === 'tool2') {
          const resultData = JSON.parse(data[i][dataCol]);
          return {
            clientId: clientId,
            results: resultData.results,
            formData: resultData.formData
          };
        }
      }

      return null;
    } catch (error) {
      Logger.log(`Error getting results: ${error}`);
      return null;
    }
  },

  /**
   * Build complete report HTML
   * TODO: Implement actual report content tomorrow
   */
  buildReportHTML(clientId, results) {
    const studentName = results.formData.name || 'Student';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Financial Clarity & Values Report</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <?!= include('shared/styles') ?>
        <?!= include('shared/loading-animation') ?>
      </head>
      <body id="reportPage">
        <div class="report-container" style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div class="login-logo" style="font-size: 36px; margin-bottom: 10px;">TruPath Financial</div>
            <h1 style="color: var(--gold); margin: 20px 0;">Financial Clarity & Values Report</h1>
            <p style="color: var(--muted);">${studentName} | ${new Date().toLocaleDateString()}</p>
          </div>

          <!-- Navigation -->
          <div style="margin-bottom: 30px; text-align: center;">
            <button onclick="navigateToDashboard('${clientId}')" class="btn-secondary">
              ← Back to Dashboard
            </button>
            <button onclick="downloadReport()" class="btn-primary" style="margin-left: 10px;">
              📄 Download PDF
            </button>
          </div>

          <!-- PLACEHOLDER: Report Content -->
          <div class="card" style="margin: 30px 0;">
            <div class="insight-box" style="background: #fff8e1; border-left: 4px solid #f59e0b;">
              <h3>📝 Report Content Placeholder</h3>
              <p><strong>Tomorrow: Implement three section reports:</strong></p>
              <ul>
                <li>📊 Financial Clarity Analysis</li>
                <li>🎭 False Self Assessment Results</li>
                <li>⭐ External Validation Patterns</li>
              </ul>
            </div>
          </div>

          <!-- Placeholder Section: Financial Clarity -->
          <div class="card" style="margin: 30px 0;">
            <h2 style="color: var(--gold); border-bottom: 2px solid var(--border); padding-bottom: 15px;">
              📊 Financial Clarity Analysis
            </h2>
            <p style="color: var(--muted); margin: 20px 0;">
              TODO: Add Financial Clarity results and interpretation
            </p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Score:</strong> ${results.results?.financialClarity?.score || 'To be calculated'}</p>
              <p><strong>Level:</strong> ${results.results?.financialClarity?.level || 'To be calculated'}</p>
            </div>
          </div>

          <!-- Placeholder Section: False Self -->
          <div class="card" style="margin: 30px 0;">
            <h2 style="color: var(--gold); border-bottom: 2px solid var(--border); padding-bottom: 15px;">
              🎭 False Self Assessment
            </h2>
            <p style="color: var(--muted); margin: 20px 0;">
              TODO: Add False Self results and interpretation
            </p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Score:</strong> ${results.results?.falseSelf?.score || 'To be calculated'}</p>
              <p><strong>Level:</strong> ${results.results?.falseSelf?.level || 'To be calculated'}</p>
            </div>
          </div>

          <!-- Placeholder Section: External Validation -->
          <div class="card" style="margin: 30px 0;">
            <h2 style="color: var(--gold); border-bottom: 2px solid var(--border); padding-bottom: 15px;">
              ⭐ External Validation Patterns
            </h2>
            <p style="color: var(--muted); margin: 20px 0;">
              TODO: Add External Validation results and interpretation
            </p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Score:</strong> ${results.results?.externalValidation?.score || 'To be calculated'}</p>
              <p><strong>Level:</strong> ${results.results?.externalValidation?.level || 'To be calculated'}</p>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="card" style="margin: 30px 0; background: linear-gradient(135deg, rgba(173, 145, 104, 0.1), rgba(75, 65, 102, 0.1));">
            <h2 style="color: var(--gold);">🚀 Next Steps</h2>
            <p>Continue your journey with the next assessment tool.</p>
            <button onclick="navigateToDashboard('${clientId}')" class="btn-primary" style="margin-top: 20px;">
              Continue to Dashboard
            </button>
          </div>

        </div>

        <script>
          // TODO: Implement PDF download functionality
          function downloadReport() {
            alert('PDF download will be implemented tomorrow with actual report content');
            // Will call google.script.run.generateTool2PDF('${clientId}')
          }
        </script>
      </body>
      </html>
    `;
  }
};

/**
 * IMPLEMENTATION CHECKLIST FOR TOMORROW:
 *
 * 1. [ ] Add actual Financial Clarity analysis content
 * 2. [ ] Add actual False Self analysis content
 * 3. [ ] Add actual External Validation analysis content
 * 4. [ ] Implement PDF generation (similar to Tool1)
 * 5. [ ] Add actionable insights/recommendations
 * 6. [ ] Test with real data
 */
