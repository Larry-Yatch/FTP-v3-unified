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

          /* Loading Overlay Styles */
          .loading-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #4b4166, #1e192b);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }

          .loading-overlay.active {
            display: flex;
          }

          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(173, 145, 104, 0.2);
            border-top-color: #ad9168;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .loading-text {
            color: #ad9168;
            font-size: 18px;
            font-weight: 500;
            margin-top: 20px;
            text-align: center;
          }

          .loading-dots {
            display: inline-block;
            width: 20px;
          }

          .loading-dots::after {
            content: '';
            animation: dots 1.5s steps(4, end) infinite;
          }

          @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
          }
        </style>
      </head>
      <body>
        <!-- Loading Overlay -->
        <div id="loadingOverlay" class="loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">
            Loading<span class="loading-dots"></span>
          </div>
        </div>

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

          <!-- Loading indicator -->
          <div id="loadingIndicator" style="display: none; text-align: center; margin: 20px;">
            <div class="spinner"></div>
            <p>Generating PDF...</p>
          </div>
        </div>

        <script>
          (function() {
            const baseUrl = '${ScriptApp.getService().getUrl()}';
            const clientId = '${clientId}';

            // Make functions global for onclick handlers
            window.downloadPDF = downloadPDF;
            window.backToDashboard = backToDashboard;

            // Loading overlay functions
            function showLoading(message) {
            const overlay = document.getElementById('loadingOverlay');
            const text = overlay.querySelector('.loading-text');
            if (message) {
              text.innerHTML = message + '<span class="loading-dots"></span>';
            }
            overlay.classList.add('active');
          }

          function hideLoading() {
            const overlay = document.getElementById('loadingOverlay');
            overlay.classList.remove('active');
          }

          // Navigate to dashboard using document.write() pattern (no iframe issues)
          function navigateToDashboard(clientId, message) {
            showLoading(message || 'Loading Dashboard');

            google.script.run
              .withSuccessHandler(function(dashboardHtml) {
                // Save dashboard location BEFORE document.write() to prevent refresh recovery loop
                try {
                  sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                    view: 'dashboard',
                    toolId: null,
                    page: null,
                    clientId: clientId,
                    timestamp: Date.now()
                  }));
                } catch(e) {}
                // Replace current document with dashboard HTML
                document.open();
                document.write(dashboardHtml);
                document.close();
              })
              .withFailureHandler(function(error) {
                hideLoading();
                console.error('Dashboard navigation error:', error);
                alert('Error loading dashboard: ' + error.message);
              })
              .getDashboardPage(clientId);
          }

          function downloadPDF() {
            const btn = event.target;
            btn.disabled = true;
            btn.textContent = 'Generating PDF...';
            document.getElementById('loadingIndicator').style.display = 'block';

            google.script.run
              .withSuccessHandler(function(result) {
                if (result.success) {
                  // Create download link
                  const link = document.createElement('a');
                  link.href = 'data:application/pdf;base64,' + result.pdf;
                  link.download = result.fileName;
                  link.click();

                  btn.disabled = false;
                  btn.textContent = '📥 Download PDF Report';
                  document.getElementById('loadingIndicator').style.display = 'none';
                  alert('PDF downloaded successfully!');
                } else {
                  alert('Error generating PDF: ' + result.error);
                  btn.disabled = false;
                  btn.textContent = '📥 Download PDF Report';
                  document.getElementById('loadingIndicator').style.display = 'none';
                }
              })
              .withFailureHandler(function(error) {
                alert('Error: ' + error.message);
                btn.disabled = false;
                btn.textContent = '📥 Download PDF Report';
                document.getElementById('loadingIndicator').style.display = 'none';
              })
              .generateTool1PDF(clientId);
          }

          function backToDashboard() {
            navigateToDashboard(clientId, 'Loading Dashboard');
          }
          })(); // End IIFE
        </script>

        <?!= FeedbackWidget.render('${clientId}', 'tool1', 'report') ?>
      </body>
      </html>
    `;
  },

  /**
   * CSS styles for report
   */
  getReportStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Rubik', Arial, sans-serif;
        background: linear-gradient(135deg, #4b4166, #1e192b);
        background-attachment: fixed;
        min-height: 100vh;
        padding: 20px;
        color: #fff;
      }

      .report-container {
        max-width: 900px;
        margin: 0 auto;
        background: rgba(20, 15, 35, 0.95);
        border: 1px solid rgba(173, 145, 104, 0.2);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      }

      .report-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 2px solid #ad9168;
      }

      .logo {
        height: 120px;
        width: auto;
        margin-bottom: 20px;
      }

      .main-title {
        font-family: 'Radley', serif;
        color: #ad9168;
        font-size: 32px;
        margin-bottom: 15px;
        font-weight: 400;
      }

      .student-info {
        font-size: 20px;
        color: #fff;
        margin: 10px 0;
      }

      .student-email {
        font-size: 16px;
        color: #94a3b8;
        margin: 5px 0;
      }

      .date {
        font-size: 14px;
        color: #94a3b8;
        margin-top: 10px;
      }

      .report-content {
        line-height: 1.8;
      }

      .report-content h2 {
        color: #ad9168;
        margin: 30px 0 15px 0;
        font-size: 24px;
      }

      .report-content h3 {
        color: #c4a877;
        margin: 25px 0 12px 0;
        font-size: 20px;
      }

      .report-content p {
        margin: 15px 0;
        color: #e2e8f0;
      }

      .report-content ul {
        margin: 15px 0 15px 30px;
        color: #e2e8f0;
      }

      .report-content li {
        margin: 8px 0;
      }

      .intro-section {
        margin-bottom: 30px;
      }

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

      .footer-section {
        margin-top: 40px;
        padding-top: 30px;
        border-top: 2px solid rgba(173, 145, 104, 0.3);
        color: #94a3b8;
      }

      .action-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 40px;
        flex-wrap: wrap;
      }

      .btn-primary, .btn-secondary {
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        font-family: 'Rubik', sans-serif;
      }

      .btn-primary {
        background: #ad9168;
        color: #1e192b;
      }

      .btn-primary:hover {
        background: #c4a877;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(173, 145, 104, 0.3);
      }

      .btn-secondary {
        background: transparent;
        color: #ad9168;
        border: 2px solid #ad9168;
      }

      .btn-secondary:hover {
        background: rgba(173, 145, 104, 0.1);
        transform: translateY(-2px);
      }

      .spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid rgba(173, 145, 104, 0.3);
        border-radius: 50%;
        border-top-color: #ad9168;
        animation: spin 1s ease-in-out infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media print {
        body {
          background: #fff;
          color: #000;
        }
        .report-container {
          background: #fff;
          border: none;
          box-shadow: none;
        }
        .action-buttons {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .report-container {
          padding: 20px;
        }
        .main-title {
          font-size: 24px;
        }
        .scores-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
};
