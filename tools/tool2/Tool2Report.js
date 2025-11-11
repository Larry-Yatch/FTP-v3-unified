/**
 * Tool2Report.js
 * Generates the Financial Clarity & Values Assessment report page
 * Step 11: Basic report structure with domain scores and progress bars
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
    return ReportBase.getResults(clientId, 'tool2', (resultData, cId) => {
      return {
        clientId: cId,
        results: resultData.results,
        data: resultData.data,
        formData: resultData.data || resultData.formData, // Handle both formats
        gptInsights: resultData.gptInsights || {},        // Include GPT insights
        overallInsight: resultData.overallInsight || {}   // Include synthesis
      };
    }, true); // checkIsLatest = true for Tool2
  },

  /**
   * Build complete report HTML
   */
  buildReportHTML(clientId, results) {
    const studentName = results.formData?.name || 'Student';
    const studentEmail = results.formData?.email || '';

    // Extract results data
    const domainScores = results.results?.domainScores || {};
    const benchmarks = results.results?.benchmarks || {};
    const archetype = results.results?.archetype || 'Financial Clarity Seeker';
    const priorityList = results.results?.priorityList || [];
    const gptInsights = results.gptInsights || {};        // NEW: GPT insights
    const overallInsight = results.overallInsight || {};  // NEW: Synthesis

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Financial Clarity & Values Report</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          ${this.getReportStyles()}
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
            <h1 class="main-title">Financial Clarity & Values Assessment</h1>
            <p class="student-info">${studentName}</p>
            ${studentEmail ? `<p class="student-email">${studentEmail}</p>` : ''}
            <p class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <!-- Report content -->
          <div class="report-content">
            <!-- Intro section -->
            <div class="intro-section">
              <h2>Your Financial Clarity Assessment Results</h2>
              <p>Thank you for completing the Financial Clarity & Values Assessment with TruPath. This report provides insight into your current financial clarity across five key domains, helping you understand where you're thriving and where focused attention could create the most impact.</p>
            </div>

            <!-- Growth Archetype -->
            <div class="archetype-section">
              <h2>Your Growth Archetype</h2>
              <div class="archetype-card">
                <div class="archetype-icon">🎯</div>
                <div class="archetype-name">${archetype}</div>
                <p class="archetype-description">${this.getArchetypeDescription(archetype)}</p>
              </div>
            </div>

            <!-- Domain Scores -->
            <div class="scores-section">
              <h2>Your Financial Clarity Scores</h2>
              <p class="scores-intro">These scores reflect your clarity and confidence across five financial domains. Higher scores indicate stronger clarity, while lower scores suggest areas where focused attention could be beneficial.</p>

              ${this.buildDomainScoreCards(domainScores, benchmarks)}
            </div>

            <!-- Priority Focus Areas -->
            <div class="priority-section">
              <h2>Priority Focus Areas</h2>
              <p>Based on stress-weighted analysis, here are your domains ranked by potential impact:</p>
              ${this.buildPriorityList(priorityList, benchmarks)}
            </div>

            <!-- NEW: Overall GPT Insights -->
            ${this.buildOverallInsights(overallInsight)}

            <!-- NEW: Detailed GPT Insights by Domain -->
            ${this.buildDetailedInsights(gptInsights)}

            <!-- Footer -->
            <div class="footer-section">
              <h3>Next Steps</h3>
              <p>This assessment is the beginning of your financial clarity journey. Use these insights to guide conversations with your financial advisor and to set priorities for improving your financial confidence and well-being.</p>
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
              document.getElementById('loadingOverlay').style.display = 'flex';

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
                    document.getElementById('loadingOverlay').style.display = 'none';
                    alert('PDF downloaded successfully!');
                  } else {
                    alert('Error generating PDF: ' + result.error);
                    btn.disabled = false;
                    btn.textContent = '📥 Download PDF Report';
                    document.getElementById('loadingOverlay').style.display = 'none';
                  }
                })
                .withFailureHandler(function(error) {
                  alert('Error: ' + error.message);
                  btn.disabled = false;
                  btn.textContent = '📥 Download PDF Report';
                  document.getElementById('loadingOverlay').style.display = 'none';
                })
                .generateTool2PDF(clientId);
            }

            function backToDashboard() {
              navigateToDashboard(clientId, 'Loading Dashboard');
            }
          })(); // End IIFE
        </script>

        <?!= FeedbackWidget.render('${clientId}', 'tool2', 'report') ?>
      </body>
      </html>
    `;
  },

  /**
   * Build domain score cards with progress bars
   */
  buildDomainScoreCards(domainScores, benchmarks) {
    const domains = [
      { key: 'moneyFlow', label: 'Money Flow', icon: '💰', description: 'Income & Spending clarity' },
      { key: 'obligations', label: 'Obligations', icon: '📊', description: 'Debt & Emergency Fund' },
      { key: 'liquidity', label: 'Liquidity', icon: '💧', description: 'Savings & Cash Reserves' },
      { key: 'growth', label: 'Growth', icon: '📈', description: 'Investments & Retirement' },
      { key: 'protection', label: 'Protection', icon: '🛡️', description: 'Insurance & Risk Management' }
    ];

    let html = '<div class="domain-cards">';

    domains.forEach(domain => {
      const benchmark = benchmarks[domain.key] || {};
      const percentage = benchmark.percentage || 0;
      const level = benchmark.level || 'Unknown';
      const raw = benchmark.raw || 0;
      const max = benchmark.max || 100;

      // Determine color based on level
      let levelColor, barColor;
      if (level === 'High') {
        levelColor = '#10b981'; // Green
        barColor = '#10b981';
      } else if (level === 'Medium') {
        levelColor = '#f59e0b'; // Amber
        barColor = '#f59e0b';
      } else {
        levelColor = '#ef4444'; // Red
        barColor = '#ef4444';
      }

      html += `
        <div class="domain-card">
          <div class="domain-header">
            <div class="domain-icon">${domain.icon}</div>
            <div class="domain-info">
              <div class="domain-label">${domain.label}</div>
              <div class="domain-description">${domain.description}</div>
            </div>
          </div>
          <div class="domain-score">
            <div class="score-display">
              <span class="score-number">${raw}</span>
              <span class="score-max">/ ${max}</span>
            </div>
            <div class="level-badge" style="background: ${levelColor};">
              ${level}
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%; background: ${barColor};"></div>
          </div>
          <div class="percentage-label">${percentage}%</div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  /**
   * Build priority list showing stress-weighted ranking with Priority × Clarity matrix
   */
  buildPriorityList(priorityList, benchmarks) {
    if (!priorityList || priorityList.length === 0) {
      return '<p>Priority analysis not available.</p>';
    }

    const domainLabels = {
      moneyFlow: 'Money Flow',
      obligations: 'Obligations',
      liquidity: 'Liquidity',
      growth: 'Growth',
      protection: 'Protection'
    };

    let html = '<div class="priority-list">';

    priorityList.forEach((item, index) => {
      const domainLabel = domainLabels[item.domain] || item.domain;
      const benchmark = benchmarks[item.domain] || {};
      const level = benchmark.level || 'Unknown';

      // Priority badges
      let priorityBadge = '';
      if (index === 0) {
        priorityBadge = '<span class="priority-badge high">Highest Priority</span>';
      } else if (index === 1) {
        priorityBadge = '<span class="priority-badge high">High Priority</span>';
      } else if (index <= 3) {
        priorityBadge = '<span class="priority-badge medium">Medium Priority</span>';
      } else {
        priorityBadge = '<span class="priority-badge low">Lower Priority</span>';
      }

      // Get contextual message from Priority × Clarity matrix
      const contextualMessage = this.getPriorityMessage(index, level);

      html += `
        <div class="priority-item">
          <div class="priority-rank">${index + 1}</div>
          <div class="priority-content">
            <div class="priority-name">${domainLabel}</div>
            <div class="priority-meta">
              ${priorityBadge}
              <span class="priority-level ${level.toLowerCase()}">${level} Clarity</span>
            </div>
            <div class="priority-message">${contextualMessage}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  /**
   * Generate priority message based on Priority × Clarity matrix
   * Priority: Rank in list (0=Highest, 1=High, 2-3=Medium, 4=Lower)
   * Clarity: From benchmarks (Low <20%, Medium 20-60%, High 60%+)
   */
  getPriorityMessage(priorityRank, clarityLevel) {
    const messages = {
      0: { // Highest Priority
        'Low': 'Critical focus area - Address confusion and high stress immediately',
        'Medium': 'High impact area - Improve understanding for better outcomes',
        'High': 'Key strength - Leverage this clarity for overall financial health'
      },
      1: { // High Priority
        'Low': 'Important focus - Resolve unclear areas causing stress',
        'Medium': 'Valuable area - Build on moderate understanding',
        'High': 'Strong area - Maintain confidence and continue growth'
      },
      2: { // Medium Priority (ranks 2-3)
        'Low': 'Moderate priority - Address confusion when ready',
        'Medium': 'Balanced area - Steady improvement recommended',
        'High': 'Solid foundation - Monitor and maintain'
      },
      4: { // Lower Priority
        'Low': 'Lower urgency - Consider when other areas stabilize',
        'Medium': 'Maintenance area - Keep current practices',
        'High': 'Well managed - Continue current approach'
      }
    };

    // Map rank to message tier (2-3 both use tier 2)
    const tier = priorityRank <= 1 ? priorityRank : (priorityRank >= 4 ? 4 : 2);
    return messages[tier][clarityLevel] || 'Focus on this area as needed';
  },

  /**
   * Get archetype description
   */
  getArchetypeDescription(archetype) {
    const descriptions = {
      'Money Flow Optimizer': 'Your primary opportunity for growth lies in optimizing how money moves through your life—both income and spending patterns. Gaining clarity here will reduce daily financial stress and create momentum.',
      'Debt Freedom Builder': 'Your path to financial peace begins with addressing obligations—managing debt and building emergency reserves. This foundation will unlock confidence and stability.',
      'Security Seeker': 'Building liquid savings beyond your emergency fund is your key focus. This cushion will provide the peace of mind needed to pursue longer-term goals with confidence.',
      'Wealth Architect': 'Your growth stage focuses on investments and retirement planning. With stronger foundations in place, you\'re ready to build long-term wealth systematically.',
      'Protection Planner': 'Understanding and optimizing your insurance coverage is your priority. Proper protection creates peace of mind and safeguards the financial progress you\'ve made.',
      'Financial Clarity Seeker': 'Your journey involves building clarity across multiple domains. This comprehensive approach will create a strong foundation for long-term financial confidence.'
    };

    return descriptions[archetype] || descriptions['Financial Clarity Seeker'];
  },

  // ============================================================
  // GPT INSIGHTS DISPLAY FUNCTIONS (NEW)
  // ============================================================

  /**
   * Build overall insights section
   */
  buildOverallInsights(overallInsight) {
    if (!overallInsight.overview) return '';

    return `
      <section class="overall-insights">
        <h2>Your Financial Clarity Journey</h2>

        <div class="overview">
          ${this.formatParagraphs(overallInsight.overview)}
        </div>

        ${overallInsight.topPatterns ? `
          <div class="top-patterns">
            <h3>Key Patterns</h3>
            ${this.formatBulletList(overallInsight.topPatterns)}
          </div>
        ` : ''}

        ${overallInsight.priorityActions ? `
          <div class="priority-actions">
            <h3>Your Next Steps</h3>
            ${this.formatNumberedList(overallInsight.priorityActions)}
          </div>
        ` : ''}
      </section>
    `;
  },

  /**
   * Build detailed insights by domain
   */
  buildDetailedInsights(gptInsights) {
    if (Object.keys(gptInsights).length === 0) return '';

    const insightSections = [
      {key: 'income_sources', title: '💰 Income Sources'},
      {key: 'major_expenses', title: '📊 Major Expenses'},
      {key: 'wasteful_spending', title: '🎯 Spending Patterns'},
      {key: 'debt_list', title: '📉 Debt Management'},
      {key: 'investments', title: '📈 Investment Strategy'},
      {key: 'emotions', title: '💭 Emotional Relationship with Money'},
      {key: 'adaptive_trauma', title: '🌱 Growth Opportunities'}
    ];

    let html = '<section class="detailed-insights"><h2>Personalized Insights</h2>';

    insightSections.forEach(section => {
      const insight = gptInsights[section.key];
      if (insight && insight.pattern) {
        html += this.buildInsightCard(section.title, insight);
      }
    });

    html += '</section>';
    return html;
  },

  /**
   * Build single insight card
   */
  buildInsightCard(title, insight) {
    const sourceTag = insight.source === 'fallback'
      ? '<span class="source-tag fallback">📋 General Guidance</span>'
      : '<span class="source-tag gpt">✨ Personalized</span>';

    return `
      <div class="insight-card">
        ${sourceTag}
        <h3>${title}</h3>

        <div class="insight-section">
          <strong>Pattern:</strong>
          <p>${insight.pattern}</p>
        </div>

        <div class="insight-section">
          <strong>Insight:</strong>
          <p>${insight.insight}</p>
        </div>

        <div class="insight-section action">
          <strong>Next Step:</strong>
          <p>${insight.action}</p>
        </div>
      </div>
    `;
  },

  /**
   * Format paragraphs with proper spacing
   */
  formatParagraphs(text) {
    if (!text) return '';
    return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
  },

  /**
   * Format bullet list
   */
  formatBulletList(text) {
    if (!text) return '';
    const items = text.split('\n').filter(line => line.trim().startsWith('-'));
    return '<ul>' + items.map(item => `<li>${item.substring(1).trim()}</li>`).join('') + '</ul>';
  },

  /**
   * Format numbered list
   */
  formatNumberedList(text) {
    if (!text) return '';
    const items = text.split('\n').filter(line => /^\d+\./.test(line.trim()));
    return '<ol>' + items.map(item => `<li>${item.replace(/^\d+\.\s*/, '').trim()}</li>`).join('') + '</ol>';
  },

  // ============================================================
  // END GPT INSIGHTS DISPLAY FUNCTIONS
  // ============================================================

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

      .intro-section {
        margin-bottom: 30px;
      }

      /* Archetype Section */
      .archetype-section {
        margin: 40px 0;
      }

      .archetype-card {
        background: linear-gradient(135deg, rgba(173, 145, 104, 0.1), rgba(75, 65, 102, 0.1));
        border: 2px solid #ad9168;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
      }

      .archetype-icon {
        font-size: 64px;
        margin-bottom: 15px;
      }

      .archetype-name {
        font-size: 28px;
        font-weight: 700;
        color: #ad9168;
        margin-bottom: 15px;
      }

      .archetype-description {
        font-size: 16px;
        color: #e2e8f0;
        line-height: 1.6;
      }

      /* Domain Score Cards */
      .scores-section {
        margin: 40px 0;
      }

      .scores-intro {
        text-align: center;
        margin: 20px 0 30px 0;
        color: #94a3b8;
      }

      .domain-cards {
        display: grid;
        gap: 20px;
      }

      .domain-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(173, 145, 104, 0.3);
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s;
      }

      .domain-card:hover {
        border-color: #ad9168;
        background: rgba(255, 255, 255, 0.08);
      }

      .domain-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      .domain-icon {
        font-size: 32px;
        margin-right: 15px;
      }

      .domain-info {
        flex: 1;
      }

      .domain-label {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
      }

      .domain-description {
        font-size: 13px;
        color: #94a3b8;
        margin-top: 2px;
      }

      .domain-score {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .score-display {
        display: flex;
        align-items: baseline;
      }

      .score-number {
        font-size: 32px;
        font-weight: 700;
        color: #ad9168;
      }

      .score-max {
        font-size: 16px;
        color: #94a3b8;
        margin-left: 5px;
      }

      .level-badge {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.5s ease;
        border-radius: 4px;
      }

      .percentage-label {
        text-align: right;
        font-size: 14px;
        color: #94a3b8;
      }

      /* Priority List */
      .priority-section {
        margin: 40px 0;
      }

      .priority-list {
        margin-top: 20px;
      }

      .priority-item {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(173, 145, 104, 0.2);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 12px;
      }

      .priority-rank {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ad9168;
        color: #1e192b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
        margin-right: 15px;
        flex-shrink: 0;
      }

      .priority-content {
        flex: 1;
      }

      .priority-name {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 5px;
      }

      .priority-meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .priority-badge {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .priority-badge.high {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
      }

      .priority-badge.medium {
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
        border: 1px solid #f59e0b;
      }

      .priority-badge.low {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border: 1px solid #10b981;
      }

      .priority-level {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }

      .priority-level.high {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
      }

      .priority-level.medium {
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
      }

      .priority-level.low {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      .priority-message {
        margin-top: 10px;
        padding: 10px;
        background: rgba(173, 145, 104, 0.1);
        border-left: 3px solid #ad9168;
        border-radius: 4px;
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.5;
      }

      /* Footer */
      .footer-section {
        margin-top: 40px;
        padding-top: 30px;
        border-top: 2px solid rgba(173, 145, 104, 0.3);
        color: #94a3b8;
      }

      /* Action Buttons */
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

      /* Loading Overlay */
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

      /* GPT Insights Styling (NEW) */
      .overall-insights, .detailed-insights {
        margin: 40px 0;
        padding: 30px;
        background: linear-gradient(135deg, rgba(30, 25, 43, 0.4), rgba(30, 25, 43, 0.2));
        border-radius: 15px;
        border: 1px solid rgba(173, 145, 104, 0.2);
      }

      .overall-insights h2, .detailed-insights h2 {
        color: #ad9168;
        font-size: 28px;
        margin-bottom: 20px;
        font-family: 'Radley', serif;
      }

      .overview {
        margin-bottom: 30px;
        line-height: 1.8;
      }

      .overview p {
        margin: 15px 0;
      }

      .top-patterns, .priority-actions {
        margin-top: 25px;
      }

      .top-patterns h3, .priority-actions h3 {
        color: #ad9168;
        font-size: 20px;
        margin-bottom: 15px;
      }

      .top-patterns ul, .priority-actions ol {
        margin: 15px 0;
        padding-left: 25px;
      }

      .top-patterns li, .priority-actions li {
        margin: 10px 0;
        line-height: 1.6;
      }

      .insight-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 25px;
        margin: 20px 0;
        border-left: 4px solid #ad9168;
        position: relative;
      }

      .insight-card h3 {
        color: #fff;
        font-size: 20px;
        margin-bottom: 20px;
        padding-right: 120px;
      }

      .source-tag {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 12px;
        background: rgba(173, 145, 104, 0.2);
        color: #ad9168;
        font-weight: 500;
      }

      .source-tag.gpt {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
      }

      .source-tag.fallback {
        background: rgba(173, 145, 104, 0.2);
        color: #ad9168;
      }

      .insight-section {
        margin: 15px 0;
      }

      .insight-section strong {
        color: #ad9168;
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .insight-section p {
        line-height: 1.7;
        color: #e0e0e0;
      }

      .insight-section.action {
        background: rgba(173, 145, 104, 0.1);
        padding: 15px;
        border-radius: 8px;
        border-left: 3px solid #ad9168;
        margin-top: 20px;
      }

      .insight-section.action strong {
        color: #ad9168;
      }

      .insight-section.action p {
        color: #fff;
        font-weight: 500;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .report-container {
          padding: 20px;
        }
        .main-title {
          font-size: 24px;
        }
        .archetype-icon {
          font-size: 48px;
        }
        .archetype-name {
          font-size: 22px;
        }
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
    `;
  }
};
