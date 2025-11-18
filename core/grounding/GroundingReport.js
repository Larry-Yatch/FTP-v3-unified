/**
 * GroundingReport.js
 * Multi-level report generation for grounding tools (Tools 3, 5, 7)
 *
 * Report Structure:
 * 1. Overall Summary (Level 4)
 * 2. Domain Breakdowns (Level 3)
 * 3. Subdomain Details (Level 2)
 * 4. Action Plan
 * 5. Understanding Your Scores
 *
 * Integrates:
 * - Scoring data from GroundingScoring
 * - GPT insights from GroundingGPT
 * - Fallback content when needed
 */

const GroundingReport = {

  /**
   * Generate complete report HTML
   *
   * @param {Object} params - Report parameters
   * @returns {string} Complete HTML report page
   */
  generateReport(params) {
    const {
      toolId,
      toolConfig,
      clientId,
      baseUrl,
      scoringResult,
      gptInsights,
      formData = {}
    } = params;

    // Validate params
    if (!toolId || !toolConfig || !clientId || !scoringResult || !gptInsights) {
      throw new Error('GroundingReport.generateReport: Missing required parameters');
    }

    const dashboardUrl = `${baseUrl}?route=dashboard&client=${clientId}`;

    // Extract student info for header
    const studentName = formData.name || formData.studentName || 'Student';
    const studentEmail = formData.email || formData.studentEmail || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - ${toolConfig.name} Report</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');

          * {
            box-sizing: border-box;
          }

          html, body {
            background: linear-gradient(135deg, #4b4166, #1e192b);
            margin: 0;
            padding: 0;
            font-family: 'Rubik', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #ffffff;
            min-height: 100vh;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }

          .card {
            background: rgba(30, 25, 43, 0.6);
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
          }

          .tool-navigation {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 0;
            margin-bottom: 20px;
          }

          .btn-nav {
            background: transparent;
            border: 2px solid #ad9168;
            color: #ad9168;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Rubik', sans-serif;
            transition: all 0.3s ease;
          }

          .btn-nav:hover {
            background: rgba(173, 145, 104, 0.1);
            transform: translateY(-2px);
          }

          .btn-primary, .btn-secondary {
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
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

          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(30, 25, 43, 0.95);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            flex-direction: column;
          }

          .loading-overlay.active {
            display: flex;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(173, 145, 104, 0.3);
            border-top-color: #ad9168;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .loading-text {
            color: #ad9168;
            font-size: 18px;
            margin-top: 20px;
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
          .score-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            border: 2px solid rgba(173, 145, 104, 0.3);
          }
          .score-large {
            font-size: 64px;
            font-weight: 700;
            text-align: center;
            margin: 20px 0;
            background: linear-gradient(135deg, #ad9168, #c9a76a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .score-interpretation {
            text-align: center;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.85);
            margin-bottom: 15px;
          }
          .domain-section {
            margin: 30px 0;
          }
          .domain-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            background: rgba(173, 145, 104, 0.1);
            border-radius: 10px;
            border-left: 4px solid #ad9168;
            margin-bottom: 15px;
          }
          .domain-title {
            font-size: 22px;
            font-weight: 600;
            color: #ad9168;
          }
          .domain-score {
            font-size: 36px;
            font-weight: 700;
            color: #ad9168;
          }
          .subdomain-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .subdomain-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid rgba(173, 145, 104, 0.2);
          }
          .subdomain-name {
            font-size: 16px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 10px;
          }
          .subdomain-score {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .subdomain-level {
            font-size: 13px;
            padding: 4px 12px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 12px;
          }
          .insight-box {
            background: rgba(255, 255, 255, 0.03);
            border-left: 4px solid #ad9168;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .insight-label {
            font-size: 13px;
            text-transform: uppercase;
            color: #ad9168;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .insight-text {
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.7;
          }
          .action-list {
            list-style: none;
            padding: 0;
            margin: 20px 0;
          }
          .action-item {
            background: rgba(173, 145, 104, 0.08);
            padding: 18px;
            margin: 12px 0;
            border-radius: 8px;
            border-left: 3px solid #ad9168;
            line-height: 1.6;
          }
          .gap-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
          }
          .gap-diffuse {
            background: rgba(23, 162, 184, 0.2);
            color: #17a2b8;
          }
          .gap-focused {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
          }
          .gap-highly-focused {
            background: rgba(220, 53, 69, 0.2);
            color: #dc3545;
          }
        </style>
      </head>
      <body>
        <!-- Loading Overlay -->
        <div id="loadingOverlay" class="loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading...</div>
        </div>

        <div class="container">
          <div class="tool-navigation">
            <button class="btn-nav" onclick="navigateToDashboard('${clientId}', 'Loading Dashboard')">
              ← Dashboard
            </button>
            <span>${toolConfig.name} Report</span>
          </div>

          <div class="card">
            <div class="report-header">
              <img src="https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw" alt="TruPath Financial Logo" class="logo">
              <h1 class="main-title">${toolConfig.name}</h1>
              <p class="student-info">${studentName}</p>
              ${studentEmail ? `<p class="student-email">${studentEmail}</p>` : ''}
              <p class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            ${this.renderOverallSection(toolConfig, scoringResult, gptInsights.overall)}

            ${this.renderDomainSections(toolConfig, scoringResult, gptInsights)}

            ${this.renderActionPlan(gptInsights.overall, scoringResult)}

            ${this.renderScoreGuide()}

            ${this.renderNextSteps(toolId, clientId, dashboardUrl)}
          </div>
        </div>

        ${FeedbackWidget.render(clientId, toolId, 'report')}

        <script>
          const baseUrl = '${baseUrl}';
          const clientId = '${clientId}';
          const toolId = '${toolId}';

          // Loading overlay functions
          function showLoading(message) {
            const overlay = document.getElementById('loadingOverlay');
            const text = overlay.querySelector('.loading-text');
            if (message) {
              text.textContent = message;
            }
            overlay.classList.add('active');
          }

          function hideLoading() {
            const overlay = document.getElementById('loadingOverlay');
            overlay.classList.remove('active');
          }

          // Navigate to dashboard using server-side routing
          function navigateToDashboard(clientId, message) {
            showLoading(message || 'Loading Dashboard');

            google.script.run
              .withSuccessHandler(function(dashboardHtml) {
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

          // Download PDF report
          function downloadPDF() {
            showLoading('Generating PDF...');

            // Determine which PDF function to call based on toolId
            const pdfFunction = toolId === 'tool3' ? 'generateTool3PDF' : 'generateTool5PDF';

            google.script.run
              .withSuccessHandler(function(result) {
                hideLoading();
                if (result.success) {
                  // Create download link
                  const link = document.createElement('a');
                  link.href = 'data:application/pdf;base64,' + result.pdf;
                  link.download = result.fileName;
                  link.click();
                  alert('PDF downloaded successfully!');
                } else {
                  alert('Error generating PDF: ' + result.error);
                }
              })
              .withFailureHandler(function(error) {
                hideLoading();
                console.error('PDF generation error:', error);
                alert('Error generating PDF: ' + error.message);
              })
              [pdfFunction](clientId);
          }

          // Alias for onclick handlers
          function backToDashboard() {
            navigateToDashboard(clientId, 'Loading Dashboard');
          }

          // Make functions global for onclick handlers
          window.backToDashboard = backToDashboard;
          window.navigateToDashboard = navigateToDashboard;
          window.downloadPDF = downloadPDF;

          // Hide loading on page load
          window.addEventListener('load', function() {
            hideLoading();
          });
        </script>
      </body>
      </html>
    `;
  },

  /**
   * Render overall summary section (Level 4)
   */
  renderOverallSection(toolConfig, scoringResult, overallInsight) {
    const score = scoringResult.overallQuotient;
    const interpretation = GroundingScoring.interpretQuotient(score);

    return `
      <div class="score-card">
        <h2 style="text-align: center; margin-bottom: 15px;">Overall ${toolConfig.scoreName}</h2>
        <div class="score-large">${Math.round(score)}</div>
        <div class="score-interpretation">${interpretation.label}</div>
        <p style="text-align: center; color: rgba(255, 255, 255, 0.7); max-width: 600px; margin: 0 auto;">
          ${interpretation.description}
        </p>
      </div>

      ${overallInsight ? `
        <div class="insight-box">
          <div class="insight-label">Overview</div>
          <div class="insight-text">${this.formatText(overallInsight.overview)}</div>
        </div>

        <div class="insight-box">
          <div class="insight-label">Integration</div>
          <div class="insight-text">${this.formatText(overallInsight.integration)}</div>
        </div>

        <div class="insight-box">
          <div class="insight-label">Core Work</div>
          <div class="insight-text">${this.formatText(overallInsight.coreWork)}</div>
        </div>
      ` : ''}
    `;
  },

  /**
   * Render domain sections (Level 3)
   */
  renderDomainSections(toolConfig, scoringResult, gptInsights) {
    const domains = [
      {
        name: toolConfig.domain1Name,
        description: toolConfig.domain1Description,
        score: scoringResult.domainQuotients.domain1,
        gap: scoringResult.domainGaps.domain1,
        subdomains: toolConfig.subdomains.slice(0, 3),
        synthesis: gptInsights.domain1
      },
      {
        name: toolConfig.domain2Name,
        description: toolConfig.domain2Description,
        score: scoringResult.domainQuotients.domain2,
        gap: scoringResult.domainGaps.domain2,
        subdomains: toolConfig.subdomains.slice(3, 6),
        synthesis: gptInsights.domain2
      }
    ];

    return domains.map(domain => this.renderDomainSection(domain, scoringResult, gptInsights)).join('\n');
  },

  /**
   * Render single domain section
   */
  renderDomainSection(domain, scoringResult, gptInsights) {
    const interpretation = GroundingScoring.interpretQuotient(domain.score);
    const gapClass = this.getGapClass(domain.gap.classification);

    return `
      <div class="domain-section">
        <div class="domain-header">
          <div>
            <div class="domain-title">${domain.name}</div>
            <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-top: 5px;">
              ${domain.description}
            </div>
          </div>
          <div class="domain-score">${Math.round(domain.score)}</div>
        </div>

        <div style="padding: 0 20px;">
          <p style="color: rgba(255, 255, 255, 0.8);">
            <strong>Pattern Level:</strong> ${interpretation.label}
            <span class="gap-badge ${gapClass}">
              ${domain.gap.classification.replace('_', ' ')}
            </span>
          </p>
          <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">
            ${domain.gap.recommendation}
          </p>
        </div>

        ${domain.synthesis ? `
          <div class="insight-box">
            <div class="insight-label">Summary</div>
            <div class="insight-text">${this.formatText(domain.synthesis.summary)}</div>
          </div>

          ${domain.synthesis.keyThemes && domain.synthesis.keyThemes.length > 0 ? `
            <div class="insight-box">
              <div class="insight-label">Key Themes</div>
              <ul style="margin: 10px 0; padding-left: 20px; color: rgba(255, 255, 255, 0.9);">
                ${domain.synthesis.keyThemes.map(theme => `<li style="margin: 8px 0;">${theme}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="insight-box">
            <div class="insight-label">Priority Focus</div>
            <div class="insight-text">${this.formatText(domain.synthesis.priorityFocus)}</div>
          </div>
        ` : ''}

        <h3 style="color: #ad9168; margin: 25px 20px 15px;">Subdomain Breakdown</h3>
        <div class="subdomain-grid">
          ${domain.subdomains.map(subdomain =>
            this.renderSubdomainCard(subdomain, scoringResult, gptInsights.subdomains)
          ).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render subdomain card (Level 2)
   */
  renderSubdomainCard(subdomain, scoringResult, subdomainInsights) {
    const score = scoringResult.subdomainQuotients[subdomain.key];
    const interpretation = GroundingScoring.interpretQuotient(score);
    const insight = subdomainInsights[subdomain.key];

    const colorStyle = `color: ${interpretation.color};`;
    const bgStyle = `background: ${interpretation.color}33;`;

    return `
      <div class="subdomain-card">
        <div class="subdomain-name">${subdomain.label}</div>
        <div class="subdomain-score" style="${colorStyle}">${Math.round(score)}</div>
        <div class="subdomain-level" style="${bgStyle} ${colorStyle}">
          ${interpretation.label}
        </div>

        ${insight ? `
          <div style="margin-top: 15px;">
            <div style="font-size: 13px; color: #ad9168; font-weight: 600; margin-bottom: 6px;">
              PATTERN
            </div>
            <div style="font-size: 14px; color: rgba(255, 255, 255, 0.85); line-height: 1.5;">
              ${insight.pattern}
            </div>

            <div style="font-size: 13px; color: #ad9168; font-weight: 600; margin: 12px 0 6px;">
              INSIGHT
            </div>
            <div style="font-size: 14px; color: rgba(255, 255, 255, 0.85); line-height: 1.5;">
              ${insight.insight}
            </div>

            ${insight.rootBelief ? `
              <div style="font-size: 13px; color: #ad9168; font-weight: 600; margin: 12px 0 6px;">
                ROOT BELIEF
              </div>
              <div style="font-size: 14px; color: rgba(255, 255, 255, 0.85); line-height: 1.5;">
                ${insight.rootBelief}
              </div>
            ` : ''}

            <div style="font-size: 13px; color: #ad9168; font-weight: 600; margin: 12px 0 6px;">
              ACTION
            </div>
            <div style="font-size: 14px; color: rgba(255, 255, 255, 0.85); line-height: 1.5;">
              ${insight.action}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Render action plan section
   */
  renderActionPlan(overallInsight, scoringResult) {
    const nextSteps = overallInsight?.nextSteps || this.getDefaultNextSteps(scoringResult);

    return `
      <div style="margin: 40px 0;">
        <h2 style="color: #ad9168; margin-bottom: 20px;">Your Action Plan</h2>
        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 20px;">
          Based on your assessment, here are your prioritized next steps:
        </p>

        <ul class="action-list">
          ${nextSteps.map((step, index) => `
            <li class="action-item">
              <strong style="color: #ad9168;">Step ${index + 1}:</strong> ${step}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  },

  /**
   * Render score understanding guide
   */
  renderScoreGuide() {
    return `
      <div style="margin: 40px 0; padding: 25px; background: rgba(255, 255, 255, 0.03); border-radius: 10px;">
        <h3 style="color: #ad9168; margin-bottom: 15px;">Understanding Your Scores</h3>

        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 15px;">
          Scores range from <strong>0-100</strong>, where:
        </p>

        <ul style="color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
          <li><strong style="color: #20c997;">0-20 (Healthy Pattern):</strong> Strong awareness and healthy patterns in this area</li>
          <li><strong style="color: #28a745;">20-40 (Mild Pattern):</strong> Generally healthy with minor areas for growth</li>
          <li><strong style="color: #17a2b8;">40-60 (Moderate Pattern):</strong> Room for significant improvement</li>
          <li><strong style="color: #ffc107;">60-80 (Significant Pattern):</strong> Problematic patterns that would benefit from focused work</li>
          <li><strong style="color: #dc3545;">80-100 (Critical Pattern):</strong> Highly problematic patterns requiring immediate attention</li>
        </ul>

        <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px; font-size: 14px;">
          <strong>Remember:</strong> Higher scores indicate more problematic patterns. These scores are not judgments—they're
          guideposts showing where you have the greatest opportunity for growth and healing.
        </p>
      </div>
    `;
  },

  /**
   * Render next steps section
   */
  renderNextSteps(toolId, clientId, dashboardUrl) {
    return `
      <div style="margin: 40px 0; padding: 25px; background: rgba(173, 145, 104, 0.1); border-radius: 10px; border-left: 4px solid #ad9168;">
        <h3 style="color: #ad9168; margin-bottom: 15px;">What's Next?</h3>

        <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 15px; line-height: 1.7;">
          Your assessment results have been saved to your dashboard. You can review them anytime
          and track your progress as you work through your action plan.
        </p>

        <!-- Action buttons -->
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
          <button class="btn-primary" onclick="downloadPDF()">
            📥 Download PDF Report
          </button>
          <button class="btn-secondary" onclick="backToDashboard()">
            ← Back to Dashboard
          </button>
        </div>

        <p style="text-align: center; color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 15px;">
          To edit your responses, return to the dashboard and click "Edit Answers"
        </p>
      </div>
    `;
  },

  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Get CSS class for gap classification
   */
  getGapClass(classification) {
    const classes = {
      'DIFFUSE': 'gap-diffuse',
      'FOCUSED': 'gap-focused',
      'HIGHLY_FOCUSED': 'gap-highly-focused'
    };
    return classes[classification] || 'gap-diffuse';
  },

  /**
   * Format text (convert newlines to <br>, etc.)
   */
  formatText(text) {
    if (!text) return '';
    return text
      .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
      .replace(/\n/g, '<br>');
  },

  /**
   * Get default next steps if GPT synthesis fails
   */
  getDefaultNextSteps(scoringResult) {
    // Find highest domain
    const domain1 = scoringResult.domainQuotients.domain1;
    const domain2 = scoringResult.domainQuotients.domain2;
    const highestDomain = domain1 > domain2 ? 'Domain 1' : 'Domain 2';

    return [
      `Focus on ${highestDomain} as your starting point - this is where your patterns are most pronounced`,
      'Work with the specific subdomain that scored highest within that domain',
      'Practice the concrete action step provided for that subdomain',
      'Journal about the root belief driving this pattern and notice when it shows up',
      'Review your assessment in 30 days to track your progress and insights'
    ];
  }
};
