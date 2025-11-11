/**
 * PDFGenerator - Centralized PDF generation for tool reports
 * Provides common infrastructure for converting HTML reports to PDFs
 */

const PDFGenerator = {
  /**
   * Common PDF styles used across all reports
   */
  getCommonStyles() {
    return `
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
      h1 { color: ${CONFIG.UI.DARK_BG}; border-bottom: 3px solid ${CONFIG.UI.PRIMARY_COLOR}; padding-bottom: 10px; }
      h2 { color: ${CONFIG.UI.PRIMARY_COLOR}; margin-top: 25px; }
      h3 { color: #4b4166; margin-top: 20px; }
      p { line-height: 1.6; color: #333; margin: 10px 0; }
      ul, ol { margin: 15px 0 15px 25px; }
      li { margin: 8px 0; }
      .header { text-align: center; margin-bottom: 30px; }
      .intro { background: #f5f5f5; padding: 20px; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; margin: 20px 0; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid ${CONFIG.UI.PRIMARY_COLOR}; font-size: 14px; color: #666; }
      @media print {
        body { padding: 20px; }
        .page-break { page-break-before: always; }
      }
    `;
  },

  /**
   * Build PDF header section
   * @param {string} title - Report title
   * @param {string} studentName - Student name
   * @returns {string} HTML for header
   */
  buildHeader(title, studentName) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="header">
        <h1>TruPath Financial</h1>
        <h2 style="margin-top: 0;">${title}</h2>
        <p><strong>${studentName}</strong></p>
        <p>${date}</p>
      </div>
    `;
  },

  /**
   * Build PDF footer section
   * @param {string} customText - Optional custom footer text
   * @returns {string} HTML for footer
   */
  buildFooter(customText = null) {
    const date = new Date().toLocaleDateString();
    const defaultText = 'This assessment is the beginning of your journey. Use these insights to guide conversations with your financial advisor.';

    return `
      <div class="footer">
        <p>${customText || defaultText}</p>
        <p style="margin-top: 20px;"><strong>TruPath Financial</strong><br>Generated: ${date}</p>
      </div>
    `;
  },

  /**
   * Convert HTML content to PDF blob
   * @param {string} htmlContent - Complete HTML document
   * @param {string} fileName - Desired PDF filename
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  htmlToPDF(htmlContent, fileName) {
    try {
      const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
      const pdf = blob.getAs('application/pdf');
      const base64 = Utilities.base64Encode(pdf.getBytes());

      return {
        success: true,
        pdf: base64,
        fileName: fileName,
        mimeType: 'application/pdf'
      };
    } catch (error) {
      Logger.log(`[PDFGenerator] Error converting HTML to PDF: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Build complete HTML document for PDF
   * @param {string} styles - CSS styles
   * @param {string} bodyContent - HTML body content
   * @returns {string} Complete HTML document
   */
  buildHTMLDocument(styles, bodyContent) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>${styles}</style>
      </head>
      <body>
        ${bodyContent}
      </body>
      </html>
    `;
  },

  /**
   * Generate filename for PDF
   * @param {string} toolName - Tool name (e.g., 'CoreTraumaStrategy', 'FinancialClarity')
   * @param {string} studentName - Student name
   * @returns {string} Sanitized filename
   */
  generateFileName(toolName, studentName) {
    const sanitizedName = studentName.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    return `TruPath_${toolName}_${sanitizedName}_${date}.pdf`;
  },

  /**
   * Generate Tool 1 PDF (Core Trauma Strategy Assessment)
   * @param {string} clientId - Client ID
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  generateTool1PDF(clientId) {
    try {
      // Get results
      const results = Tool1Report.getResults(clientId);
      if (!results) {
        return { success: false, error: 'No results found' };
      }

      // Get template
      const template = Tool1Templates.getTemplate(results.winner);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const studentName = results.formData.name || 'Student';

      // Tool1-specific styles
      const tool1Styles = this.getCommonStyles() + `
        .scores { margin: 30px 0; }
        .score-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd; }
        .score-label { font-weight: 600; }
        .score-value { color: ${CONFIG.UI.PRIMARY_COLOR}; font-weight: 700; font-size: 18px; }
        .winner { background: #fff8e1; font-weight: 700; }
      `;

      // Build scores section
      const scoresHTML = `
        <div class="scores">
          <h3>Raw Scores</h3>
          <p>The higher numbers indicate stronger strategies used by your subconscious. The raw scores range from -25 to 25.</p>

          <div class="score-row ${results.winner === 'FSV' ? 'winner' : ''}">
            <span class="score-label">False Self-View:</span>
            <span class="score-value">${results.scores.FSV}</span>
          </div>
          <div class="score-row ${results.winner === 'ExVal' ? 'winner' : ''}">
            <span class="score-label">External Validation:</span>
            <span class="score-value">${results.scores.ExVal}</span>
          </div>
          <div class="score-row ${results.winner === 'Showing' ? 'winner' : ''}">
            <span class="score-label">Issues Showing Love:</span>
            <span class="score-value">${results.scores.Showing}</span>
          </div>
          <div class="score-row ${results.winner === 'Receiving' ? 'winner' : ''}">
            <span class="score-label">Issues Receiving Love:</span>
            <span class="score-value">${results.scores.Receiving}</span>
          </div>
          <div class="score-row ${results.winner === 'Control' ? 'winner' : ''}">
            <span class="score-label">Control Leading to Isolation:</span>
            <span class="score-value">${results.scores.Control}</span>
          </div>
          <div class="score-row ${results.winner === 'Fear' ? 'winner' : ''}">
            <span class="score-label">Fear Leading to Isolation:</span>
            <span class="score-value">${results.scores.Fear}</span>
          </div>
        </div>
      `;

      // Build body content
      const bodyContent =
        this.buildHeader('Core Trauma Strategy Assessment Report', studentName) +
        `<div class="intro">${Tool1Templates.commonIntro}</div>` +
        `<div class="content">${template.content}</div>` +
        scoresHTML +
        `<div class="footer">${Tool1Templates.commonFooter}</div>`;

      // Build complete HTML
      const htmlContent = this.buildHTMLDocument(tool1Styles, bodyContent);

      // Generate PDF
      const fileName = this.generateFileName('CoreTraumaStrategy', studentName);
      return this.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log(`[PDFGenerator] Error generating Tool 1 PDF: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Generate Tool 2 PDF (Financial Clarity & Values Assessment)
   * @param {string} clientId - Client ID
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  generateTool2PDF(clientId) {
    try {
      // Get results
      const results = Tool2Report.getResults(clientId);
      if (!results) {
        return { success: false, error: 'No results found' };
      }

      // Extract data
      const studentName = results.formData?.name || 'Student';
      const domainScores = results.results?.domainScores || {};
      const archetype = results.results?.archetype || 'Financial Clarity Seeker';
      const priorityList = results.results?.priorityList || [];
      const gptInsights = results.gptInsights || {};
      const overallInsight = results.overallInsight || {};

      // Tool2-specific styles
      const tool2Styles = this.getCommonStyles() + `
        .domain-card { background: #f9f9f9; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; page-break-inside: avoid; }
        .score-value { font-size: 32px; font-weight: 700; color: ${CONFIG.UI.PRIMARY_COLOR}; }
        .archetype-box { background: linear-gradient(135deg, ${CONFIG.UI.DARK_BG} 0%, #4b4166 100%); color: white; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; page-break-inside: avoid; }
        .archetype-icon { font-size: 48px; margin-bottom: 15px; }
        .archetype-name { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
        .priority-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; }
      `;

      // Helper to format scores
      const formatScore = (score) => Math.round(score) + '%';

      // Build body content sections
      const header = this.buildHeader('Financial Clarity & Values Assessment Report', studentName);

      const intro = `
        <div class="intro">
          <p>Thank you for completing the Financial Clarity & Values Assessment with TruPath. This report provides insight into your current financial clarity across five key domains, helping you understand where you're thriving and where focused attention could create the most impact.</p>
        </div>
      `;

      const archetypeSection = `
        <div class="archetype-box">
          <div class="archetype-icon">🎯</div>
          <div class="archetype-name">${archetype}</div>
          <p style="font-size: 16px; line-height: 1.6;">${Tool2Report.getArchetypeDescription(archetype)}</p>
        </div>
      `;

      const domainScoresSection = `
        <h2>Your Financial Clarity Scores</h2>
        <p>These scores reflect your clarity and confidence across five financial domains. Higher scores indicate stronger clarity, while lower scores suggest areas where focused attention could be beneficial.</p>

        <div class="domain-card">
          <h3>💰 Money Flow</h3>
          <div class="score-value">${formatScore(domainScores.moneyFlow || 0)}</div>
          <p>Understanding of income sources, spending patterns, and cash flow management.</p>
        </div>

        <div class="domain-card">
          <h3>📊 Obligations</h3>
          <div class="score-value">${formatScore(domainScores.obligations || 0)}</div>
          <p>Clarity about debt, repayment strategies, and emergency fund preparedness.</p>
        </div>

        <div class="domain-card">
          <h3>💧 Liquidity</h3>
          <div class="score-value">${formatScore(domainScores.liquidity || 0)}</div>
          <p>Awareness of available cash, accessibility, and short-term financial flexibility.</p>
        </div>

        <div class="domain-card">
          <h3>📈 Growth</h3>
          <div class="score-value">${formatScore(domainScores.growth || 0)}</div>
          <p>Understanding of savings, investments, and long-term wealth-building strategies.</p>
        </div>

        <div class="domain-card">
          <h3>🛡️ Protection</h3>
          <div class="score-value">${formatScore(domainScores.protection || 0)}</div>
          <p>Awareness of insurance coverage and risk management strategies.</p>
        </div>
      `;

      /**
       * Generate priority message based on Priority × Clarity matrix
       * Priority: Rank in list (0=Highest, 1=High, 2-3=Medium, 4=Lower)
       * Clarity: From benchmarks (Low <20%, Medium 20-60%, High 60%+)
       */
      const getPriorityMessage = (priorityRank, clarityLevel) => {
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
      };

      const prioritySection = `
        <div class="page-break"></div>
        <h2>Priority Focus Areas</h2>
        <p>Based on stress-weighted analysis, here are your domains ranked by potential impact:</p>
        ${priorityList.map((item, idx) => {
          const benchmark = benchmarks[item.domain] || {};
          const clarityLevel = benchmark.level || 'Medium';
          const domainLabel = item.domain.charAt(0).toUpperCase() + item.domain.slice(1);
          const message = getPriorityMessage(idx, clarityLevel);

          return `
            <div class="priority-item">
              <strong>${idx + 1}. ${domainLabel}</strong> - <em>${clarityLevel} Clarity</em>
              <p style="margin: 5px 0; font-size: 14px; color: #666;">${message}</p>
            </div>
          `;
        }).join('')}
      `;

      const insightsSection = this._buildTool2Insights(overallInsight, gptInsights);

      const footer = this.buildFooter();

      // Combine all sections
      const bodyContent = header + intro + archetypeSection + domainScoresSection + prioritySection + insightsSection + footer;

      // Build complete HTML
      const htmlContent = this.buildHTMLDocument(tool2Styles, bodyContent);

      // Generate PDF
      const fileName = this.generateFileName('FinancialClarity', studentName);
      return this.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log(`[PDFGenerator] Error generating Tool 2 PDF: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Build Tool 2 insights section (helper method)
   * @private
   */
  _buildTool2Insights(overallInsight, gptInsights) {
    const formatInsightCard = (title, insight) => {
      if (!insight || !insight.pattern) return '';

      const sourceLabel = insight.source === 'fallback' ? '📋 General Guidance' : '✨ Personalized';

      return `
        <div style="background: #f9f9f9; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; padding: 20px; margin: 20px 0; page-break-inside: avoid;">
          <div style="text-align: right; font-size: 12px; color: #666; margin-bottom: 10px;">${sourceLabel}</div>
          <h3 style="color: ${CONFIG.UI.PRIMARY_COLOR}; margin-bottom: 15px;">${title}</h3>
          <div style="margin: 15px 0;">
            <strong style="color: ${CONFIG.UI.PRIMARY_COLOR}; text-transform: uppercase; font-size: 12px;">Pattern:</strong>
            <p style="margin: 5px 0;">${insight.pattern}</p>
          </div>
          <div style="margin: 15px 0;">
            <strong style="color: ${CONFIG.UI.PRIMARY_COLOR}; text-transform: uppercase; font-size: 12px;">Insight:</strong>
            <p style="margin: 5px 0;">${insight.insight}</p>
          </div>
          <div style="background: #fff8e1; padding: 15px; margin: 15px 0; border-left: 3px solid ${CONFIG.UI.PRIMARY_COLOR};">
            <strong style="color: ${CONFIG.UI.PRIMARY_COLOR}; text-transform: uppercase; font-size: 12px;">Next Step:</strong>
            <p style="margin: 5px 0; font-weight: 600;">${insight.action}</p>
          </div>
        </div>
      `;
    };

    let html = '';

    // Overall insights
    if (overallInsight.overview) {
      html += `
        <div class="page-break"></div>
        <h2>Your Financial Clarity Journey</h2>
        ${overallInsight.overview.split('\n\n').map(p => `<p>${p}</p>`).join('')}

        ${overallInsight.topPatterns ? `
          <h3>Key Patterns</h3>
          <ul>
            ${overallInsight.topPatterns.split('\n').filter(line => line.trim().startsWith('-')).map(line => `<li>${line.substring(1).trim()}</li>`).join('')}
          </ul>
        ` : ''}

        ${overallInsight.priorityActions ? `
          <h3>Your Next Steps</h3>
          <ol>
            ${overallInsight.priorityActions.split('\n').filter(line => /^\d+\./.test(line.trim())).map(line => `<li>${line.replace(/^\d+\.\s*/, '').trim()}</li>`).join('')}
          </ol>
        ` : ''}
      `;
    }

    // Detailed insights
    if (Object.keys(gptInsights).length > 0) {
      html += `
        <div class="page-break"></div>
        <h2>Personalized Insights</h2>
        ${gptInsights.income_sources ? formatInsightCard('💰 Income Sources', gptInsights.income_sources) : ''}
        ${gptInsights.major_expenses ? formatInsightCard('📊 Major Expenses', gptInsights.major_expenses) : ''}
        ${gptInsights.wasteful_spending ? formatInsightCard('🎯 Spending Patterns', gptInsights.wasteful_spending) : ''}
        ${gptInsights.debt_list ? formatInsightCard('📉 Debt Management', gptInsights.debt_list) : ''}
        ${gptInsights.investments ? formatInsightCard('📈 Investment Strategy', gptInsights.investments) : ''}
        ${gptInsights.emotions ? formatInsightCard('💭 Emotional Relationship with Money', gptInsights.emotions) : ''}
        ${gptInsights.adaptive_trauma ? formatInsightCard('🌱 Growth Opportunities', gptInsights.adaptive_trauma) : ''}
      `;
    }

    return html;
  }
};
