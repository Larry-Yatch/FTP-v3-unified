/**
 * Tool1Report.js
 * Generates the assessment report page and PDF download
 */

const Tool1Report = {

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

      // Get template for winner category
      const template = Tool1Templates.getTemplate(results.winner);

      if (!template) {
        return HtmlService.createHtmlOutput(`
          <h1>Error</h1>
          <p>Template not found for category: ${results.winner}</p>
        `);
      }

      // Build report HTML
      const reportHtml = this.buildReportHTML(clientId, results, template);

      return HtmlService.createHtmlOutput(reportHtml)
        .setTitle('TruPath - Core Trauma Strategy Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      LogUtils.error(`Error rendering report: ${error}`);
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
    return ReportBase.getResults(clientId, 'tool1', (resultData, cId) => {
      return {
        clientId: cId,
        winner: resultData.winner,
        scores: resultData.scores,
        formData: resultData.formData
      };
    });
  },

  /**
   * Build complete report HTML
   */
  buildReportHTML(clientId, results, template) {
    const studentName = results.formData.name || 'Student';
    const studentEmail = results.formData.email || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Core Trauma Strategy Report</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          ${this.getReportStyles()}
        </style>
      </head>
      <body>
        ${ReportStyles.getLoadingHTML()}

        <div class="report-container">
          <!-- Header with logo -->
          <div class="report-header">
            <img src="https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw" alt="TruPath Financial Logo" class="logo">
            <h1 class="main-title">Core Trauma Strategy Assessment</h1>
            <p class="student-info">${studentName}</p>
            ${studentEmail ? `<p class="student-email">${studentEmail}</p>` : ''}
            <p class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <!-- Report content -->
          <div class="report-content">
            <div class="intro-section">
              <h2>Thank you for completing the Core Trauma Strategies Assessment with TruPath.</h2>
              ${Tool1Templates.commonIntro}
            </div>

            <!-- Strategy content -->
            <div class="strategy-section">
              ${template.content}
            </div>

            <!-- Raw scores -->
            <div class="scores-section">
              <h3>Raw Scores</h3>
              <p class="scores-intro">The higher numbers indicate stronger strategies used by your subconscious.<br>
              The raw scores range from -25 to 25.</p>

              <div class="scores-grid">
                <div class="score-card ${results.winner === 'FSV' ? 'winner' : ''}">
                  <div class="score-label">False Self-View</div>
                  <div class="score-value">${results.scores.FSV}</div>
                </div>
                <div class="score-card ${results.winner === 'ExVal' ? 'winner' : ''}">
                  <div class="score-label">External Validation</div>
                  <div class="score-value">${results.scores.ExVal}</div>
                </div>
                <div class="score-card ${results.winner === 'Showing' ? 'winner' : ''}">
                  <div class="score-label">Issues Showing Love</div>
                  <div class="score-value">${results.scores.Showing}</div>
                </div>
                <div class="score-card ${results.winner === 'Receiving' ? 'winner' : ''}">
                  <div class="score-label">Issues Receiving Love</div>
                  <div class="score-value">${results.scores.Receiving}</div>
                </div>
                <div class="score-card ${results.winner === 'Control' ? 'winner' : ''}">
                  <div class="score-label">Control Leading to Isolation</div>
                  <div class="score-value">${results.scores.Control}</div>
                </div>
                <div class="score-card ${results.winner === 'Fear' ? 'winner' : ''}">
                  <div class="score-label">Fear Leading to Isolation</div>
                  <div class="score-value">${results.scores.Fear}</div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-section">
              ${Tool1Templates.commonFooter}
            </div>
          </div>

          <!-- Action buttons -->
          <div class="action-buttons">
            <button class="btn-primary" onclick="downloadPDF()">📥 Download PDF Report</button>
            <button class="btn-secondary" onclick="backToDashboard()">← Back to Dashboard</button>
          </div>

          <p style="text-align: center; color: #999; font-size: 14px; margin-top: 10px;">
            To edit your responses, return to the dashboard and click "Edit Answers"
          </p>

        </div>

        <script>
          (function() {
            var clientId = '${clientId}';
            ${ReportClientJS.getLoadingFunctions()}
            ${ReportClientJS.getNavigationFunction()}
            ${ReportClientJS.getDownloadFunction('generateTool1PDF')}
            ${ReportClientJS.getBackToDashboard()}
            window.downloadPDF = downloadPDF;
            window.backToDashboard = backToDashboard;
          })();
        </script>

        <?!= FeedbackWidget.render('${clientId}', 'tool1', 'report') ?>
      </body>
      </html>
    `;
  },

  /**
   * CSS styles for report (base from ReportStyles + Tool1-specific)
   */
  getReportStyles() {
    return ReportStyles.getBaseCSS() + ReportStyles.getLoadingCSS() + this.getTool1CSS();
  },

  /**
   * Tool1-specific CSS (strategy section, score cards)
   */
  getTool1CSS() {
    return `
      .strategy-section {
        background: rgba(173, 145, 104, 0.05);
        padding: 30px;
        border-radius: 15px;
        border: 1px solid rgba(173, 145, 104, 0.2);
        margin: 30px 0;
      }

      .scores-section {
        margin: 40px 0;
      }

      .scores-intro {
        text-align: center;
        margin: 20px 0;
        color: #94a3b8;
      }

      .scores-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }

      .score-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(173, 145, 104, 0.3);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s;
      }

      .score-card.winner {
        background: rgba(173, 145, 104, 0.15);
        border-color: #ad9168;
        box-shadow: 0 0 20px rgba(173, 145, 104, 0.3);
      }

      .score-label {
        font-size: 14px;
        color: #94a3b8;
        margin-bottom: 10px;
      }

      .score-value {
        font-size: 36px;
        font-weight: 700;
        color: #ad9168;
      }

      .score-card.winner .score-value {
        color: #c4a877;
        font-size: 42px;
      }

      @media (max-width: 768px) {
        .scores-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
};
