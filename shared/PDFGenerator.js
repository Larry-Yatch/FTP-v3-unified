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
      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid ${CONFIG.UI.PRIMARY_COLOR}; font-size: 13px; color: #666; }
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
      <div class="header" style="margin-bottom: 15px;">
        <h1 style="font-size: 24px; margin-bottom: 5px;">TruPath Financial</h1>
        <h2 style="margin-top: 0; font-size: 18px; color: #5b4b8a;">${title}</h2>
        <p style="margin: 5px 0; font-size: 14px;"><strong>${studentName}</strong></p>
        <p style="margin: 3px 0; font-size: 13px; color: #666;">${date}</p>
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
      <div class="footer" style="font-size: 13px;">
        <p style="margin: 0 0 10px 0;">${customText || defaultText}</p>
        <p style="margin-top: 15px;"><strong>TruPath Financial</strong><br>Generated: ${date}</p>
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
      const benchmarks = results.results?.benchmarks || {};
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
  },

  /**
   * Generate PDF for Tool 3 (Identity & Validation Grounding)
   * @param {string} clientId - Client ID
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  generateTool3PDF(clientId) {
    return this.generateGroundingPDF('tool3', Tool3Report, Tool3.config, clientId);
  },

  /**
   * Generate PDF for Tool 5 (Love & Connection Grounding)
   * @param {string} clientId - Client ID
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  generateTool5PDF(clientId) {
    return this.generateGroundingPDF('tool5', Tool5Report, Tool5.config, clientId);
  },

  /**
   * Generate PDF for Tool 7 (Security & Control Grounding)
   * @param {string} clientId - Client ID
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  generateTool7PDF(clientId) {
    return this.generateGroundingPDF('tool7', Tool7Report, Tool7.config, clientId);
  },

  /**
   * Generic grounding tool PDF generator (used by Tool 3, Tool 5, and Tool 7)
   * @param {string} toolId - Tool identifier
   * @param {Object} ToolReport - Tool report object
   * @param {Object} toolConfig - Tool configuration
   * @param {string} clientId - Client ID
   * @returns {Object} {success, pdf, fileName, mimeType} or error
   */
  generateGroundingPDF(toolId, ToolReport, toolConfig, clientId) {
    try {
      // Get results
      const results = ToolReport.getResults(clientId);
      if (!results) {
        return { success: false, error: 'No results found' };
      }

      // Extract data
      const studentName = results.formData?.name || results.formData?.studentName || 'Student';
      const scoring = results.scoring;
      const gptInsights = results.gptInsights;

      // Grounding tool styles
      const groundingStyles = this.getCommonStyles() + `
        .score-card { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; page-break-inside: avoid; }
        .score-large { font-size: 48px; font-weight: 700; color: ${CONFIG.UI.PRIMARY_COLOR}; margin: 15px 0; }
        .domain-section { margin: 30px 0; page-break-inside: avoid; }
        .domain-header { background: linear-gradient(135deg, rgba(173, 145, 104, 0.1), rgba(75, 65, 102, 0.1)); padding: 20px; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; border-radius: 8px; margin-bottom: 15px; }
        .domain-title { font-size: 22px; font-weight: 600; color: ${CONFIG.UI.PRIMARY_COLOR}; margin-bottom: 10px; }
        .domain-score { font-size: 36px; font-weight: 700; color: ${CONFIG.UI.PRIMARY_COLOR}; }
        .subdomain-card { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid ${CONFIG.UI.PRIMARY_COLOR}; }
        .subdomain-name { font-weight: 600; margin-bottom: 8px; }
        .subdomain-score { font-size: 24px; font-weight: 700; color: ${CONFIG.UI.PRIMARY_COLOR}; margin: 5px 0; }
        .insight-box { background: #f9f9f9; padding: 20px; margin: 15px 0; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; border-radius: 8px; }
        .insight-label { font-size: 12px; text-transform: uppercase; color: ${CONFIG.UI.PRIMARY_COLOR}; font-weight: 600; margin-bottom: 8px; }
        .action-item { background: rgba(173, 145, 104, 0.1); padding: 15px; margin: 10px 0; border-left: 3px solid ${CONFIG.UI.PRIMARY_COLOR}; border-radius: 5px; }
      `;

      // Build header
      const header = this.buildHeader(`${toolConfig.name}`, studentName);

      // Build overall score section
      const overallScore = Math.round(scoring.overallQuotient);
      const overallInterpretation = GroundingScoring.interpretQuotient(scoring.overallQuotient);

      const overallSection = `
        <div class="score-card">
          <h2>Overall ${toolConfig.scoreName}</h2>
          <div class="score-large">${overallScore}</div>
          <p><strong>${overallInterpretation.label}</strong></p>
          <p>${overallInterpretation.description}</p>
        </div>
      `;

      // Build overall synthesis
      let overallSynthesis = '';
      if (gptInsights.overall) {
        overallSynthesis = `
          <div class="page-break"></div>
          <h2>Your Journey</h2>
          ${gptInsights.overall.overview ? `
            <div class="insight-box">
              <div class="insight-label">Overview</div>
              <p>${gptInsights.overall.overview}</p>
            </div>
          ` : ''}
          ${gptInsights.overall.integration ? `
            <div class="insight-box">
              <div class="insight-label">Integration</div>
              <p>${gptInsights.overall.integration}</p>
            </div>
          ` : ''}
          ${gptInsights.overall.coreWork ? `
            <div class="insight-box">
              <div class="insight-label">Core Work</div>
              <p>${gptInsights.overall.coreWork}</p>
            </div>
          ` : ''}
        `;
      }

      // Build domain sections
      let domainSections = '<div class="page-break"></div><h2>Domain Analysis</h2>';

      // Domain 1
      const domain1Score = Math.round(scoring.domainQuotients.domain1);
      const domain1Interpretation = GroundingScoring.interpretQuotient(scoring.domainQuotients.domain1);
      domainSections += `
        <div class="domain-section">
          <div class="domain-header">
            <div class="domain-title">${toolConfig.domain1Name}</div>
            <div class="domain-score">${domain1Score}</div>
            <p>${domain1Interpretation.label}</p>
          </div>
          ${gptInsights.domain1 ? `
            <div class="insight-box">
              <div class="insight-label">Summary</div>
              <p>${gptInsights.domain1.summary || ''}</p>
            </div>
            ${gptInsights.domain1.keyThemes && gptInsights.domain1.keyThemes.length > 0 ? `
              <div class="insight-box">
                <div class="insight-label">Key Themes</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${gptInsights.domain1.keyThemes.map(theme => `<li style="margin: 5px 0;">${theme}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${gptInsights.domain1.priorityFocus ? `
              <div class="insight-box">
                <div class="insight-label">Priority Focus</div>
                <p>${gptInsights.domain1.priorityFocus}</p>
              </div>
            ` : ''}
          ` : ''}

          <h3 style="margin: 20px 0 10px; color: ${CONFIG.UI.PRIMARY_COLOR};">Subdomain Breakdown</h3>
          ${this.buildSubdomainBreakdown(toolConfig.subdomains.slice(0, 3), scoring, gptInsights.subdomains)}
        </div>
      `;

      // Domain 2
      const domain2Score = Math.round(scoring.domainQuotients.domain2);
      const domain2Interpretation = GroundingScoring.interpretQuotient(scoring.domainQuotients.domain2);
      domainSections += `
        <div class="domain-section">
          <div class="domain-header">
            <div class="domain-title">${toolConfig.domain2Name}</div>
            <div class="domain-score">${domain2Score}</div>
            <p>${domain2Interpretation.label}</p>
          </div>
          ${gptInsights.domain2 ? `
            <div class="insight-box">
              <div class="insight-label">Summary</div>
              <p>${gptInsights.domain2.summary || ''}</p>
            </div>
            ${gptInsights.domain2.keyThemes && gptInsights.domain2.keyThemes.length > 0 ? `
              <div class="insight-box">
                <div class="insight-label">Key Themes</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${gptInsights.domain2.keyThemes.map(theme => `<li style="margin: 5px 0;">${theme}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${gptInsights.domain2.priorityFocus ? `
              <div class="insight-box">
                <div class="insight-label">Priority Focus</div>
                <p>${gptInsights.domain2.priorityFocus}</p>
              </div>
            ` : ''}
          ` : ''}

          <h3 style="margin: 20px 0 10px; color: ${CONFIG.UI.PRIMARY_COLOR};">Subdomain Breakdown</h3>
          ${this.buildSubdomainBreakdown(toolConfig.subdomains.slice(3, 6), scoring, gptInsights.subdomains)}
        </div>
      `;

      // Build action plan
      let actionPlan = '';
      if (gptInsights.overall && gptInsights.overall.nextSteps && gptInsights.overall.nextSteps.length > 0) {
        actionPlan = `
          <div class="page-break"></div>
          <h2>Your Action Plan</h2>
          ${gptInsights.overall.nextSteps.map((step, index) => `
            <div class="action-item">
              <strong>Step ${index + 1}:</strong> ${step}
            </div>
          `).join('')}
        `;
      }

      // Combine all sections
      const bodyHTML = header + overallSection + overallSynthesis + domainSections + actionPlan;

      // Build complete HTML document
      const htmlContent = this.buildHTMLDocument(groundingStyles, bodyHTML);

      // Generate PDF
      const fileName = this.generateFileName(toolConfig.name, studentName);
      return this.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log(`Error generating ${toolId} PDF: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Build subdomain breakdown section for PDF
   * @param {Array} subdomains - Subdomain configurations
   * @param {Object} scoring - Scoring results
   * @param {Object} subdomainInsights - GPT insights for subdomains
   * @returns {string} HTML for subdomain breakdown
   */
  buildSubdomainBreakdown(subdomains, scoring, subdomainInsights) {
    if (!subdomains || subdomains.length === 0) return '';

    return subdomains.map(subdomain => {
      const score = Math.round(scoring.subdomainQuotients[subdomain.key]);
      const interpretation = GroundingScoring.interpretQuotient(scoring.subdomainQuotients[subdomain.key]);
      const insight = subdomainInsights[subdomain.key];

      return `
        <div class="subdomain-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="subdomain-name">${subdomain.label}</div>
            <div class="subdomain-score">${score}</div>
          </div>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">${interpretation.label}</p>

          ${insight ? `
            <div style="margin-top: 15px;">
              <div style="font-size: 12px; color: ${CONFIG.UI.PRIMARY_COLOR}; font-weight: 600; margin: 10px 0 5px;">PATTERN</div>
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">${insight.pattern}</p>

              <div style="font-size: 12px; color: ${CONFIG.UI.PRIMARY_COLOR}; font-weight: 600; margin: 10px 0 5px;">INSIGHT</div>
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">${insight.insight}</p>

              ${insight.rootBelief ? `
                <div style="font-size: 12px; color: ${CONFIG.UI.PRIMARY_COLOR}; font-weight: 600; margin: 10px 0 5px;">ROOT BELIEF</div>
                <p style="margin: 0; font-size: 14px; line-height: 1.5;">${insight.rootBelief}</p>
              ` : ''}

              <div style="font-size: 12px; color: ${CONFIG.UI.PRIMARY_COLOR}; font-weight: 600; margin: 10px 0 5px;">ACTION</div>
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">${insight.action}</p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  // ============================================================================
  // TOOL 4 PDF GENERATION - Financial Freedom Framework
  // ============================================================================

  /**
   * Tool 4 specific styles
   */
  getTool4Styles() {
    // Tool 4 uses purple color scheme - darker tones for better PDF readability
    var purple = '#5b4b8a';       // Muted dark purple for headings
    var purpleLight = 'rgba(91, 75, 138, 0.08)';  // Very light purple tint for backgrounds
    var purpleBorder = 'rgba(91, 75, 138, 0.3)';
    var darkPurple = '#4b4166';   // Matches existing TruPath dark purple

    return `
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
      h1 { color: #1e192b; border-bottom: 3px solid ${purple}; padding-bottom: 10px; }
      h2 { color: ${purple}; margin-top: 25px; }
      h3 { color: ${darkPurple}; margin-top: 20px; }
      p { line-height: 1.6; color: #333; margin: 10px 0; }
      ul, ol { margin: 15px 0 15px 25px; }
      li { margin: 8px 0; }
      .header { text-align: center; margin-bottom: 30px; }
      .intro { background: ${purpleLight}; padding: 12px 15px; border-left: 3px solid ${purple}; margin: 12px 0; border-radius: 6px; font-size: 13px; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid ${purple}; font-size: 13px; color: #666; }
      @media print {
        body { padding: 20px; }
        .page-break { page-break-before: always; }
      }
      .allocation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
      .allocation-card { background: ${purpleLight}; padding: 10px 12px; border-radius: 6px; border-left: 3px solid ${purple}; }
      .allocation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
      .allocation-name { font-size: 14px; font-weight: 600; color: #333; }
      .allocation-percentage { font-size: 22px; font-weight: 700; color: ${purple}; }
      .allocation-dollars { font-size: 13px; color: #666; margin-top: 2px; }
      .allocation-note { font-size: 12px; color: #555; margin-top: 6px; line-height: 1.4; }
      .priority-box { background: ${purpleLight}; border: 1px solid ${purpleBorder}; padding: 15px; text-align: center; margin: 15px 0; border-radius: 8px; }
      .priority-label { font-size: 12px; text-transform: uppercase; color: ${purple}; margin-bottom: 5px; letter-spacing: 0.5px; }
      .priority-value { font-size: 18px; font-weight: 700; color: ${darkPurple}; }
      .helper-card { background: #f9fafb; border-left: 4px solid ${purple}; padding: 20px; margin: 15px 0; border-radius: 8px; page-break-inside: avoid; }
      .helper-critical { background: #fef2f2; border-left-color: #ef4444; }
      .helper-suggestion { background: #eff6ff; border-left-color: #3b82f6; }
      .helper-title { font-weight: 600; font-size: 16px; margin-bottom: 10px; color: #333; }
      .helper-content { font-size: 14px; line-height: 1.6; color: #555; }
      .helper-action { background: rgba(79, 70, 229, 0.08); padding: 10px; margin-top: 10px; border-radius: 5px; font-weight: 500; color: ${darkPurple}; }
      .insight-section { background: ${purpleLight}; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${purple}; }
      .insight-title { font-size: 16px; font-weight: 600; color: ${purple}; margin-bottom: 15px; }
      .modifier-item { padding: 8px 0; border-bottom: 1px solid #eee; }
      .modifier-item:last-child { border-bottom: none; }
      .trauma-influence { background: ${purpleLight}; padding: 15px; margin: 15px 0; border-left: 3px solid ${purple}; border-radius: 5px; }
      .summary-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
      .summary-table th { background: ${purple}; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
      .summary-table td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
      .summary-table tr:nth-child(even) { background: ${purpleLight}; }
      .bottom-line-box { background: ${purpleLight}; border: 2px solid ${purpleBorder}; padding: 25px; margin: 25px 0; border-radius: 10px; }
      .bottom-line-box p { color: #333; font-size: 16px; line-height: 1.8; margin: 0; }
      .decision-section { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
      .decision-section h3 { color: ${purple}; margin-top: 0; }
      .decision-section ul { margin: 10px 0 20px 20px; }
      .remember-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; margin-top: 20px; }
      .gpt-section { margin: 10px 0; page-break-inside: avoid; }
      .gpt-overview { background: ${purpleLight}; padding: 10px 12px; border-radius: 6px; border-left: 3px solid ${purple}; margin-bottom: 8px; }
      .gpt-overview p { margin: 0 0 6px 0; line-height: 1.4; color: #333; font-size: 13px; }
      .gpt-overview p:last-child { margin-bottom: 0; }
      .strategic-insights { background: #f9fafb; padding: 8px 10px 8px 25px; border-radius: 4px; margin: 8px 0; }
      .strategic-insights li { margin: 5px 0; line-height: 1.4; color: #444; font-size: 13px; }
      .recommendation-box { background: linear-gradient(135deg, ${purpleLight} 0%, rgba(91, 75, 138, 0.12) 100%); padding: 10px 12px; border-radius: 6px; border: 1px solid ${purpleBorder}; margin-top: 8px; }
      .recommendation-box h3 { margin: 0 0 5px 0; font-size: 14px; }
      .recommendation-box p { margin: 0; line-height: 1.4; color: #333; font-size: 13px; }
      .gpt-comparison-synthesis { background: ${purpleLight}; padding: 15px 18px; border-radius: 8px; border-left: 4px solid ${purple}; margin-bottom: 12px; }
      .gpt-comparison-synthesis p { margin: 0 0 10px 0; line-height: 1.5; font-size: 14px; }
      .gpt-comparison-synthesis p:last-child { margin-bottom: 0; }
      .gpt-decision-guidance { background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); padding: 15px 18px; border-radius: 6px; border: 1px solid #c7d2fe; }
      .gpt-decision-guidance p { margin: 0; line-height: 1.5; color: #333; font-size: 14px; }
      .gpt-source-note { font-size: 10px; color: #999; text-align: right; margin-top: 6px; font-style: italic; }
    `;
  },

  /** Format currency for Tool 4 reports */
  formatMoney(value) {
    if (value === null || value === undefined || value === '') return '$0';
    var num = Number(value);
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return '$' + num.toFixed(0);
  },

  /** Format percentage for Tool 4 reports */
  formatPercent(value) {
    if (value === null || value === undefined || value === '') return '0%';
    return Math.round(Number(value)) + '%';
  },

  /** Get priority display name */
  getPriorityDisplayName(priority) {
    var names = {
      'wealth': 'Build Long-Term Wealth', 'debt': 'Get Out of Debt', 'secure': 'Feel Financially Secure',
      'enjoy': 'Enjoy Life Now', 'bigGoal': 'Save for a Big Goal', 'survival': 'Just Survive Right Now',
      'business': 'Grow My Business/Income', 'generational': 'Build Generational Wealth',
      'balance': 'Find Balance Across Everything', 'control': 'Take Control of My Finances'
    };
    return names[priority] || priority;
  },

  /** Get bucket icon */
  getBucketIcon(bucket) {
    var icons = { 'Multiply': '💰', 'Essentials': '🏠', 'Freedom': '🚀', 'Enjoyment': '🎉' };
    return icons[bucket] || '📊';
  },

  /** Get strategy description */
  _getStrategyDescription(strategy) {
    var descriptions = {
      'Debt Payoff Focus': 'Prioritizes aggressive debt elimination with higher Freedom allocation.',
      'Wealth Building': 'Focuses on long-term wealth accumulation through higher Multiply allocation.',
      'Balanced': 'Maintains equilibrium across all buckets for steady progress.',
      'Lifestyle Priority': 'Emphasizes current quality of life with higher Enjoyment allocation.',
      'Security Focus': 'Prioritizes financial safety through higher Essentials and Freedom allocations.'
    };
    return descriptions[strategy] || 'A balanced approach to financial allocation.';
  },

  /** Get Tool 1 influences */
  _getTool1Influences(clientId) {
    try {
      if (typeof Tool1Report !== 'undefined' && Tool1Report.getResults) {
        var results = Tool1Report.getResults(clientId);
        if (results && results.winner) return { winner: results.winner, scores: results.scores };
      }
    } catch (e) { Logger.log('[PDFGenerator] Error getting Tool 1 data: ' + e); }
    return null;
  },

  /** Get Tool 2 influences */
  _getTool2Influences(clientId) {
    try {
      if (typeof Tool2Report !== 'undefined' && Tool2Report.getResults) {
        var results = Tool2Report.getResults(clientId);
        if (results && results.results) return { archetype: results.results.archetype, domainScores: results.results.domainScores };
      }
    } catch (e) { Logger.log('[PDFGenerator] Error getting Tool 2 data: ' + e); }
    return null;
  },

  /** Get Tool 3 grounding data (scoring and syntheses) */
  _getTool3Data(clientId) {
    try {
      if (typeof DataService !== 'undefined' && DataService.getLatestResponse) {
        var response = DataService.getLatestResponse(clientId, 'tool3');
        // getLatestResponse returns {timestamp, clientId, toolId, data, status, version}
        // The actual tool data is in response.data
        if (response && response.data) {
          var tool3Data = response.data;
          return {
            scoring: tool3Data.scoring || tool3Data.scoringResult,
            syntheses: tool3Data.syntheses
          };
        }
      }
    } catch (e) { Logger.log('[PDFGenerator] Error getting Tool 3 data: ' + e); }
    return null;
  },

  /** Get student name */
  _getStudentName(clientId) {
    try {
      if (typeof Tool1Report !== 'undefined' && Tool1Report.getResults) {
        var r1 = Tool1Report.getResults(clientId);
        if (r1 && r1.formData && r1.formData.name) return r1.formData.name;
      }
      if (typeof Tool2Report !== 'undefined' && Tool2Report.getResults) {
        var r2 = Tool2Report.getResults(clientId);
        if (r2 && r2.formData && r2.formData.name) return r2.formData.name;
      }
    } catch (e) { Logger.log('[PDFGenerator] Error getting student name: ' + e); }
    return null;
  },

  /**
   * Build GPT insights section for Tool 4 Main Report
   * @param {Object} gptInsights - { overview, strategicInsights, recommendation, source }
   * @returns {string} HTML for GPT section
   */
  buildTool4GPTSection(gptInsights) {
    if (!gptInsights) return '';

    var purpleColor = '#5b4b8a';
    var sourceNote = gptInsights.source === 'fallback' ? '' :
      '<div class="gpt-source-note">Analysis generated with AI assistance</div>';

    // Split overview into paragraphs
    var overviewParagraphs = (gptInsights.overview || '')
      .split('\n\n')
      .filter(function(p) { return p.trim().length > 0; })
      .map(function(p) { return '<p>' + p.trim() + '</p>'; })
      .join('');

    // Build strategic insights list
    var insightsList = '';
    if (gptInsights.strategicInsights && gptInsights.strategicInsights.length > 0) {
      insightsList = '<ol class="strategic-insights">' +
        gptInsights.strategicInsights.map(function(insight) {
          return '<li>' + insight + '</li>';
        }).join('') +
        '</ol>';
    }

    return '<h2 style="margin-top: 12px; margin-bottom: 6px; font-size: 18px;">Your Personalized Analysis</h2>' +
      '<div class="gpt-section">' +
      '<div class="gpt-overview">' + overviewParagraphs + '</div>' +
      '<h3 style="color: ' + purpleColor + '; margin-top: 8px; margin-bottom: 5px; font-size: 14px;">Key Observations</h3>' +
      insightsList +
      '<div class="recommendation-box">' +
      '<h3 style="color: ' + purpleColor + ';">Your Priority Focus</h3>' +
      '<p>' + (gptInsights.recommendation || '') + '</p>' +
      '</div>' +
      sourceNote +
      '</div>';
  },

  /**
   * Build GPT insights section for Tool 4 Comparison Report
   * @param {Object} gptInsights - { synthesis, decisionGuidance, source }
   * @returns {string} HTML for GPT comparison section
   */
  buildTool4ComparisonGPTSection(gptInsights) {
    if (!gptInsights) return '';

    var purpleColor = '#5b4b8a';
    var sourceNote = gptInsights.source === 'fallback' ? '' :
      '<div class="gpt-source-note">Analysis generated with AI assistance</div>';

    // Split synthesis into paragraphs
    var synthesisParagraphs = (gptInsights.synthesis || '')
      .split('\n\n')
      .filter(function(p) { return p.trim().length > 0; })
      .map(function(p) { return '<p>' + p.trim() + '</p>'; })
      .join('');

    return '<h2 style="margin-top: 20px; font-size: 18px;">Personalized Comparison Analysis</h2>' +
      '<div class="gpt-section">' +
      '<div class="gpt-comparison-synthesis">' + synthesisParagraphs + '</div>' +
      '<h3 style="color: ' + purpleColor + '; margin-top: 12px; margin-bottom: 8px; font-size: 14px;">Decision Guidance</h3>' +
      '<div class="gpt-decision-guidance">' +
      '<p>' + (gptInsights.decisionGuidance || '') + '</p>' +
      '</div>' +
      sourceNote +
      '</div>';
  },

  /**
   * Generate Tool 4 Main Report HTML (without PDF conversion)
   * Used by admin dashboard for report viewing
   * @param {string} clientId - Client ID
   * @param {Object} [allocationOverride] - Optional allocation percentages to use instead of recalculating
   * @returns {Object} {success, html, studentName} or {success: false, error}
   */
  generateTool4MainHTML(clientId, allocationOverride) {
    try {
      var preSurveyData = Tool4.getPreSurvey(clientId);
      if (!preSurveyData) return { success: false, error: 'No Tool 4 data found. Please complete the pre-survey first.' };

      var v1Input = Tool4.buildV1Input(clientId, preSurveyData);
      var allocation = Tool4.calculateAllocationV1(v1Input);
      if (!allocation || !allocation.percentages) return { success: false, error: 'Unable to calculate allocation' };

      // If allocation override provided (from loaded scenario), use those percentages
      if (allocationOverride && allocationOverride.Multiply !== undefined) {
        allocation.percentages = {
          Multiply: allocationOverride.Multiply,
          Essentials: allocationOverride.Essentials,
          Freedom: allocationOverride.Freedom,
          Enjoyment: allocationOverride.Enjoyment
        };
      }

      var validationResults = Tool4.runFullValidation ? Tool4.runFullValidation(clientId, allocation.percentages, preSurveyData) : [];
      var tool1Data = this._getTool1Influences(clientId);
      var tool2Data = this._getTool2Influences(clientId);
      var tool3Data = this._getTool3Data(clientId);
      var studentName = this._getStudentName(clientId) || 'Student';
      var monthlyIncome = Number(preSurveyData.monthlyIncome) || 0;

      var dollarAmounts = {
        Multiply: Math.round(monthlyIncome * allocation.percentages.Multiply / 100),
        Essentials: Math.round(monthlyIncome * allocation.percentages.Essentials / 100),
        Freedom: Math.round(monthlyIncome * allocation.percentages.Freedom / 100),
        Enjoyment: Math.round(monthlyIncome * allocation.percentages.Enjoyment / 100)
      };

      var header = this.buildHeader('Financial Freedom Framework Report', studentName);
      var self = this;

      var executiveSummary = '<div class="intro"><p style="margin: 0;">This report presents your personalized Financial Freedom Framework allocation, designed based on your unique financial situation, behavioral patterns, and life priorities.</p></div>' +
        '<div class="priority-box"><div class="priority-label">Your Selected Priority</div><div class="priority-value">' + this.getPriorityDisplayName(preSurveyData.selectedPriority) + '</div>' +
        '<p style="margin-top: 6px; font-size: 12px; opacity: 0.9;">Timeline: ' + (preSurveyData.goalTimeline || 'Not specified') + '</p></div>' +
        '<h2 style="font-size: 18px; margin-top: 15px; margin-bottom: 8px;">Financial Overview</h2><table class="summary-table"><tr><th>Metric</th><th>Value</th></tr>' +
        '<tr><td>Monthly Income</td><td><strong>' + this.formatMoney(monthlyIncome) + '</strong></td></tr>' +
        '<tr><td>Monthly Essentials</td><td>' + this.formatMoney(preSurveyData.monthlyEssentials) + '</td></tr>' +
        '<tr><td>Total Debt</td><td>' + this.formatMoney(preSurveyData.totalDebt || 0) + '</td></tr>' +
        '<tr><td>Emergency Fund</td><td>' + this.formatMoney(preSurveyData.emergencyFund || 0) + '</td></tr></table>';

      var buckets = ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'];
      var allocationCards = buckets.map(function(bucket) {
        return '<div class="allocation-card"><div class="allocation-header"><span class="allocation-name">' + self.getBucketIcon(bucket) + ' ' + bucket + '</span>' +
          '<span class="allocation-percentage">' + self.formatPercent(allocation.percentages[bucket]) + '</span></div>' +
          '<div class="allocation-dollars">' + self.formatMoney(dollarAmounts[bucket]) + '/month</div>' +
          '<div class="allocation-note">' + (allocation.lightNotes ? allocation.lightNotes[bucket] || '' : '') + '</div></div>';
      }).join('');

      var allocationSection = '<div class="page-break"></div><h2 style="margin-top: 0; margin-bottom: 6px; font-size: 18px;">Your Personalized Allocation</h2>' +
        '<p style="margin: 0 0 8px 0; font-size: 12px; color: #555;">Based on your priority, financial situation, and behavioral profile:</p><div class="allocation-grid">' + allocationCards + '</div>';

      var insightsSection = '<h2 style="margin-top: 15px; font-size: 16px;">Why These Numbers?</h2><div class="insight-section" style="padding: 12px; margin: 8px 0;"><div class="insight-title" style="font-size: 14px; margin-bottom: 8px;">Base Allocation from Priority</div>' +
        '<p style="font-size: 13px; margin: 0;">Your "' + this.getPriorityDisplayName(preSurveyData.selectedPriority) + '" priority established starting weights adjusted for your personal factors.</p></div>';

      if (allocation.details && allocation.details.satBoostPct > 0) {
        insightsSection += '<div class="insight-section"><div class="insight-title">Dissatisfaction Amplification: +' + Math.round(allocation.details.satBoostPct) + '%</div>' +
          '<p>Because your satisfaction level is only ' + preSurveyData.satisfaction + '/10, we amplified positive modifiers to help you change faster.</p></div>';
      }

      var influencesSection = '<div class="page-break"></div><h2 style="margin-top: 0; font-size: 18px;">How Your Profile Influenced This Allocation</h2>';
      var purpleColor = '#5b4b8a';
      if (tool1Data) {
        var traumaNames = { 'FSV': 'False Self-View', 'ExVal': 'External Validation', 'Showing': 'Issues Showing Love', 'Receiving': 'Issues Receiving Love', 'Control': 'Control Leading to Isolation', 'Fear': 'Fear Leading to Isolation' };
        influencesSection += '<div class="trauma-influence" style="padding: 10px; margin: 10px 0;"><h3 style="margin-top: 0; color: ' + purpleColor + '; font-size: 14px;">Core Trauma Strategy (Tool 1)</h3>' +
          '<p style="font-size: 13px; margin: 5px 0;"><strong>Primary Pattern:</strong> ' + (traumaNames[tool1Data.winner] || tool1Data.winner) + '</p>' +
          '<p style="font-size: 12px; margin: 5px 0; color: #555;">This pattern influenced your allocation through behavioral modifiers based on your psychological profile.</p></div>';
      }
      if (tool2Data) {
        influencesSection += '<div class="trauma-influence" style="padding: 10px; margin: 10px 0;"><h3 style="margin-top: 0; color: ' + purpleColor + '; font-size: 14px;">Financial Clarity Profile (Tool 2)</h3>' +
          '<p style="font-size: 13px; margin: 5px 0;"><strong>Your Archetype:</strong> ' + (tool2Data.archetype || 'Financial Clarity Seeker') + '</p></div>';
      }
      if (!tool1Data && !tool2Data) {
        influencesSection += '<div class="insight-section" style="padding: 10px;"><p style="font-size: 13px; margin: 0;">Complete Tools 1-3 for deeper personalization based on your unique patterns.</p></div>';
      }

      // Get helper insights (Emergency Fund Timeline, Debt Payoff, etc.)
      var helperInsights = Tool4.generateHelperInsights ? Tool4.generateHelperInsights(allocation.percentages, preSurveyData) : [];

      // Get GPT-powered personalized insights (now with trauma-informed context)
      var gptInsights = null;
      try {
        if (typeof Tool4GPTAnalysis !== 'undefined') {
          gptInsights = Tool4GPTAnalysis.generateMainReportInsights({
            clientId: clientId,
            preSurveyData: preSurveyData,
            allocation: allocation,
            validationResults: validationResults,
            helperInsights: helperInsights,
            tool1Data: tool1Data,
            tool2Data: tool2Data,
            tool3Data: tool3Data
          });
          Logger.log('[PDFGenerator] GPT insights generated, source: ' + (gptInsights ? gptInsights.source : 'none'));
        }
      } catch (gptError) {
        Logger.log('[PDFGenerator] GPT insights error: ' + gptError);
        // Continue without GPT section if it fails
      }

      // Build GPT section
      var gptSection = this.buildTool4GPTSection(gptInsights);

      var validationSection = '<h2 style="margin-top: 15px; font-size: 18px;">Validation Results</h2>';
      if ((!validationResults || validationResults.length === 0) && (!helperInsights || helperInsights.length === 0)) {
        validationSection += '<div class="helper-card helper-suggestion" style="background: #f0fdf4; border-left-color: #22c55e; padding: 12px;">' +
          '<div class="helper-title" style="font-size: 14px;">Your Allocation Looks Good!</div><div class="helper-content" style="font-size: 13px;">No significant issues detected.</div></div>';
      } else {
        // Show validation warnings first
        if (validationResults && validationResults.length > 0) {
          validationResults.forEach(function(item) {
            var cardClass = item.severity === 'Critical' ? 'helper-critical' : (item.severity === 'Suggestion' ? 'helper-suggestion' : '');
            validationSection += '<div class="helper-card ' + cardClass + '" style="padding: 12px; margin: 10px 0;"><div class="helper-title" style="font-size: 14px; margin-bottom: 6px;">' + (item.title || item.severity) + '</div>' +
              '<div class="helper-content" style="font-size: 13px;">' + item.message + '</div>';
            if (item.action) {
              validationSection += '<div class="helper-action" style="font-size: 12px; padding: 8px; margin-top: 8px;"><strong>Recommendation:</strong> ' + item.action + '</div>';
            }
            validationSection += '</div>';
          });
        }

        // Show helper insights with detailed calculations
        if (helperInsights && helperInsights.length > 0) {
          validationSection += '<h3 style="margin-top: 25px; color: ' + purpleColor + ';">Detailed Analysis</h3>';
          helperInsights.forEach(function(helper) {
            var cardClass = helper.severity === 'Critical' ? 'helper-critical' : (helper.severity === 'Suggestion' ? 'helper-suggestion' : '');
            validationSection += '<div class="helper-card ' + cardClass + '">';
            validationSection += '<div class="helper-title">' + helper.title + '</div>';
            validationSection += '<div class="helper-content">' + helper.message + '</div>';

            // Add detailed breakdown for specific helpers
            if (helper.type === 'emergency-fund' && helper.current && helper.suggested) {
              validationSection += '<div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 5px;">';
              validationSection += '<strong>Current:</strong> $' + helper.current.emergencyFund.toLocaleString() + ' (' + helper.current.monthsOfCoverage + ' months coverage)<br>';
              validationSection += '<strong>Target:</strong> $' + helper.current.targetAmount.toLocaleString() + ' (4 months)<br>';
              validationSection += '<strong>Gap:</strong> $' + helper.current.gap.toLocaleString();
              validationSection += '</div>';
            }

            if (helper.type === 'debt-payoff' && helper.current && helper.suggested) {
              validationSection += '<div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 5px;">';
              validationSection += '<strong>Total Debt:</strong> $' + helper.current.totalDebt.toLocaleString() + '<br>';
              if (helper.current.payoffMonths < 999) {
                validationSection += '<strong>Current Timeline:</strong> ' + helper.current.payoffMonths + ' months at ' + helper.current.freedomPercent + '% Freedom<br>';
                validationSection += '<strong>Suggested Timeline:</strong> ' + helper.suggested.payoffMonths + ' months at ' + helper.suggested.freedomPercent + '% Freedom<br>';
                if (helper.suggested.interestSaved > 0) {
                  validationSection += '<strong>Potential Savings:</strong> $' + helper.suggested.interestSaved.toLocaleString() + ' in interest';
                }
              }
              validationSection += '</div>';
            }

            if (helper.type === 'lifestyle-inflation' && helper.current && helper.suggested) {
              validationSection += '<div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 5px;">';
              validationSection += '<strong>10-Year Wealth Projection:</strong><br>';
              validationSection += 'Current path (' + helper.current.multiplyPercent + '% Multiply): $' + helper.current.tenYearWealth.toLocaleString() + '<br>';
              validationSection += 'Optimized path (' + helper.suggested.multiplyPercent + '% Multiply): $' + helper.suggested.tenYearWealth.toLocaleString() + '<br>';
              validationSection += '<strong>Potential Wealth Gap:</strong> $' + helper.suggested.wealthGap.toLocaleString();
              validationSection += '</div>';
            }

            validationSection += '</div>';
          });
        }
      }

      var nextStepsSection = '<h2 style="margin-top: 20px; font-size: 18px;">Your Next Steps</h2><div class="decision-section" style="padding: 12px; font-size: 13px;">' +
        '<h3 style="color: ' + purpleColor + '; margin-top: 0; font-size: 14px;">Immediate Actions</h3><ol style="margin: 8px 0 12px 20px;">' +
        '<li style="margin: 4px 0;"><strong>Set Up Your Buckets:</strong> Open separate accounts or use envelope budgeting.</li>' +
        '<li style="margin: 4px 0;"><strong>Automate Transfers:</strong> Set up automatic transfers on payday.</li>' +
        '<li style="margin: 4px 0;"><strong>Track for 30 Days:</strong> Monitor spending before making adjustments.</li></ol>' +
        '<h3 style="color: ' + purpleColor + '; font-size: 14px; margin-top: 10px;">Ongoing Optimization</h3><ul style="margin: 8px 0 8px 20px;">' +
        '<li style="margin: 4px 0;">Review quarterly or when major life changes occur</li>' +
        '<li style="margin: 4px 0;">Adjust as income grows - consider increasing Multiply</li>' +
        '<li style="margin: 4px 0;">Revisit if priorities shift significantly</li></ul></div>';

      var footer = this.buildFooter('This allocation framework is a starting point. Adjust as needed and consult with a financial advisor for personalized advice.');

      var bodyContent = header + executiveSummary + allocationSection + gptSection + insightsSection + influencesSection + validationSection + nextStepsSection + footer;
      var htmlContent = this.buildHTMLDocument(this.getTool4Styles(), bodyContent);

      return { success: true, html: htmlContent, studentName: studentName };

    } catch (error) {
      Logger.log('[PDFGenerator] Error generating Tool 4 Main HTML: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Generate Tool 4 Main Report PDF
   * @param {string} clientId - Client ID
   * @param {Object} [allocationOverride] - Optional allocation percentages to use instead of recalculating
   */
  generateTool4MainPDF(clientId, allocationOverride) {
    var htmlResult = this.generateTool4MainHTML(clientId, allocationOverride);
    if (!htmlResult.success) {
      return htmlResult;
    }

    var fileName = this.generateFileName('FinancialFreedomFramework', htmlResult.studentName);
    return this.htmlToPDF(htmlResult.html, fileName);
  },

  /**
   * Generate Tool 4 Comparison Report PDF
   */
  generateTool4ComparisonPDF(clientId, scenario1, scenario2) {
    try {
      if (!scenario1 || !scenario2) return { success: false, error: 'Two scenarios are required for comparison' };

      var preSurveyData = Tool4.getPreSurvey(clientId);
      var monthlyIncome = preSurveyData ? Number(preSurveyData.monthlyIncome) || 0 : 0;
      var studentName = this._getStudentName(clientId) || 'Student';
      var tool1Data = this._getTool1Influences(clientId);
      var tool3Data = this._getTool3Data(clientId);
      var self = this;

      var scenario1Dollars = {
        Multiply: Math.round(monthlyIncome * (scenario1.allocations ? scenario1.allocations.Multiply || 0 : 0) / 100),
        Essentials: Math.round(monthlyIncome * (scenario1.allocations ? scenario1.allocations.Essentials || 0 : 0) / 100),
        Freedom: Math.round(monthlyIncome * (scenario1.allocations ? scenario1.allocations.Freedom || 0 : 0) / 100),
        Enjoyment: Math.round(monthlyIncome * (scenario1.allocations ? scenario1.allocations.Enjoyment || 0 : 0) / 100)
      };
      var scenario2Dollars = {
        Multiply: Math.round(monthlyIncome * (scenario2.allocations ? scenario2.allocations.Multiply || 0 : 0) / 100),
        Essentials: Math.round(monthlyIncome * (scenario2.allocations ? scenario2.allocations.Essentials || 0 : 0) / 100),
        Freedom: Math.round(monthlyIncome * (scenario2.allocations ? scenario2.allocations.Freedom || 0 : 0) / 100),
        Enjoyment: Math.round(monthlyIncome * (scenario2.allocations ? scenario2.allocations.Enjoyment || 0 : 0) / 100)
      };

      var comparisonData = Tool4.generateComparisonNarrative ? Tool4.generateComparisonNarrative(scenario1, scenario2, preSurveyData) : {};

      // Get GPT-powered comparison insights (now with trauma-informed context)
      var gptComparisonInsights = null;
      try {
        if (typeof Tool4GPTAnalysis !== 'undefined') {
          gptComparisonInsights = Tool4GPTAnalysis.generateComparisonInsights({
            clientId: clientId,
            scenario1: scenario1,
            scenario2: scenario2,
            preSurveyData: preSurveyData,
            comparisonData: comparisonData,
            tool1Data: tool1Data,
            tool3Data: tool3Data
          });
          Logger.log('[PDFGenerator] GPT comparison insights generated, source: ' + (gptComparisonInsights ? gptComparisonInsights.source : 'none'));
        }
      } catch (gptError) {
        Logger.log('[PDFGenerator] GPT comparison insights error: ' + gptError);
        // Continue without GPT section if it fails
      }

      // Build GPT comparison section
      var gptComparisonSection = this.buildTool4ComparisonGPTSection(gptComparisonInsights);

      var header = this.buildHeader('Scenario Comparison Report', studentName);

      var executiveSummary = '<div class="intro"><p style="margin: 0;">This report compares two allocation scenarios, helping you understand the trade-offs of each approach.</p></div>';

      // Unified Scenarios Section - combines scenario info with profile context
      var profile1 = scenario1.profileSnapshot || {};
      var profile2 = scenario2.profileSnapshot || {};
      var profileDiffers = (
        scenario1.monthlyIncome !== scenario2.monthlyIncome ||
        profile1.currentEssentials !== profile2.currentEssentials ||
        profile1.debtBalance !== profile2.debtBalance ||
        profile1.emergencyFund !== profile2.emergencyFund ||
        scenario1.priority !== scenario2.priority
      );

      var scenariosSection = '<h2 style="font-size: 18px;">Scenarios Being Compared</h2>';

      if (profileDiffers) {
        scenariosSection += '<div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 10px 12px; border-radius: 6px; margin-bottom: 15px; font-size: 13px;">' +
          '<strong style="color: #b45309;">Note:</strong> These scenarios were saved with different profile settings. ' +
          'Dollar amounts may reflect different underlying circumstances.</div>';
      }

      // Side-by-side scenario cards with page-break prevention
      scenariosSection += '<div class="allocation-grid" style="page-break-inside: avoid;">';

      // Scenario A card
      var date1 = scenario1.timestamp ? new Date(scenario1.timestamp).toLocaleDateString() : 'Unknown';
      scenariosSection += '<div class="allocation-card">' +
        '<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #5b4b8a;">' +
        '<h3 style="margin: 0; color: #5b4b8a; font-size: 16px;">Scenario A</h3>' +
        '<span style="font-size: 12px; color: #888;">Saved ' + date1 + '</span></div>' +
        '<div style="font-weight: 600; color: #333; margin-bottom: 10px; font-size: 14px;">' + (scenario1.name || 'Unnamed') + '</div>' +
        '<table style="width: 100%; font-size: 13px;">' +
        '<tr><td style="color: #666; padding: 3px 0;">Income:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(scenario1.monthlyIncome || 0) + '/mo</td></tr>' +
        '<tr><td style="color: #666; padding: 3px 0;">Priority:</td><td style="text-align: right; font-weight: 500;">' + (scenario1.priority || 'Not set') + '</td></tr>';
      if (profile1.currentEssentials) {
        scenariosSection += '<tr><td style="color: #666; padding: 3px 0;">Essentials:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(profile1.currentEssentials) + '/mo</td></tr>';
      }
      if (profile1.debtBalance) {
        scenariosSection += '<tr><td style="color: #666; padding: 3px 0;">Debt:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(profile1.debtBalance) + '</td></tr>';
      }
      if (profile1.emergencyFund) {
        scenariosSection += '<tr><td style="color: #666; padding: 3px 0;">Emergency Fund:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(profile1.emergencyFund) + '</td></tr>';
      }
      scenariosSection += '</table></div>';

      // Scenario B card
      var date2 = scenario2.timestamp ? new Date(scenario2.timestamp).toLocaleDateString() : 'Unknown';
      scenariosSection += '<div class="allocation-card">' +
        '<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #5b4b8a;">' +
        '<h3 style="margin: 0; color: #5b4b8a; font-size: 16px;">Scenario B</h3>' +
        '<span style="font-size: 12px; color: #888;">Saved ' + date2 + '</span></div>' +
        '<div style="font-weight: 600; color: #333; margin-bottom: 10px; font-size: 14px;">' + (scenario2.name || 'Unnamed') + '</div>' +
        '<table style="width: 100%; font-size: 13px;">' +
        '<tr><td style="color: #666; padding: 3px 0;">Income:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(scenario2.monthlyIncome || 0) + '/mo</td></tr>' +
        '<tr><td style="color: #666; padding: 3px 0;">Priority:</td><td style="text-align: right; font-weight: 500;">' + (scenario2.priority || 'Not set') + '</td></tr>';
      if (profile2.currentEssentials) {
        scenariosSection += '<tr><td style="color: #666; padding: 3px 0;">Essentials:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(profile2.currentEssentials) + '/mo</td></tr>';
      }
      if (profile2.debtBalance) {
        scenariosSection += '<tr><td style="color: #666; padding: 3px 0;">Debt:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(profile2.debtBalance) + '</td></tr>';
      }
      if (profile2.emergencyFund) {
        scenariosSection += '<tr><td style="color: #666; padding: 3px 0;">Emergency Fund:</td><td style="text-align: right; font-weight: 500;">' + this.formatMoney(profile2.emergencyFund) + '</td></tr>';
      }
      scenariosSection += '</table></div>';

      scenariosSection += '</div>'; // close allocation-grid

      var buckets = ['Multiply', 'Essentials', 'Freedom', 'Enjoyment'];
      var comparisonRows = buckets.map(function(bucket) {
        var pct1 = scenario1.allocations ? scenario1.allocations[bucket] || 0 : 0;
        var pct2 = scenario2.allocations ? scenario2.allocations[bucket] || 0 : 0;
        var diff = pct2 - pct1;
        var diffColor = diff > 0 ? '#059669' : (diff < 0 ? '#dc2626' : '#666');
        return '<tr><td><strong>' + self.getBucketIcon(bucket) + ' ' + bucket + '</strong></td>' +
          '<td>' + self.formatPercent(pct1) + ' (' + self.formatMoney(scenario1Dollars[bucket]) + ')</td>' +
          '<td>' + self.formatPercent(pct2) + ' (' + self.formatMoney(scenario2Dollars[bucket]) + ')</td>' +
          '<td style="color: ' + diffColor + '; font-weight: 600;">' + (diff > 0 ? '+' : '') + diff + '%</td></tr>';
      }).join('');

      var comparisonTable = '<h2 style="font-size: 18px;">Allocation Comparison</h2>' +
        '<table class="summary-table"><tr><th>Bucket</th><th>' + (scenario1.name || 'Scenario A') + '</th><th>' + (scenario2.name || 'Scenario B') + '</th><th>Difference</th></tr>' +
        comparisonRows + '</table>';

      // Extract strategy names (strategy objects have .name, .description, .reflection)
      var strategy1Name = comparisonData && comparisonData.strategy1 ? (comparisonData.strategy1.name || 'Balanced') : 'Balanced';
      var strategy2Name = comparisonData && comparisonData.strategy2 ? (comparisonData.strategy2.name || 'Balanced') : 'Balanced';
      var strategy1Desc = comparisonData && comparisonData.strategy1 ? (comparisonData.strategy1.description || '') : '';
      var strategy2Desc = comparisonData && comparisonData.strategy2 ? (comparisonData.strategy2.description || '') : '';
      var strategy1Reflection = comparisonData && comparisonData.strategy1 ? (comparisonData.strategy1.reflection || '') : '';
      var strategy2Reflection = comparisonData && comparisonData.strategy2 ? (comparisonData.strategy2.reflection || '') : '';

      var impactSection = '<h2 style="font-size: 18px;">Impact Analysis</h2>';
      // bucketNarratives is an array of impact objects from generateBucketImpact
      // Each narrative has: title, impact (array), and tradeoff or benefit
      if (comparisonData && comparisonData.bucketNarratives && comparisonData.bucketNarratives.length > 0) {
        comparisonData.bucketNarratives.forEach(function(narrative) {
          if (narrative) {
            var content = '';
            if (narrative.impact && Array.isArray(narrative.impact)) {
              content = '<ul style="margin: 10px 0; padding-left: 20px; font-size: 13px;">';
              narrative.impact.forEach(function(item) {
                content += '<li style="margin: 4px 0;">' + item + '</li>';
              });
              content += '</ul>';
            }
            if (narrative.tradeoff) {
              content += '<p style="margin-top: 10px; color: #dc2626; font-size: 13px;"><strong>Trade-off:</strong> ' + narrative.tradeoff + '</p>';
            }
            if (narrative.benefit) {
              content += '<p style="margin-top: 10px; color: #059669; font-size: 13px;"><strong>Benefit:</strong> ' + narrative.benefit + '</p>';
            }
            impactSection += '<div class="helper-card">' +
              '<div class="helper-title">' + (narrative.title || 'Impact') + '</div>' +
              '<div class="helper-content">' + content + '</div></div>';
          }
        });
      } else {
        impactSection += '<p style="font-size: 13px;">No significant differences detected between scenarios.</p>';
      }

      var strategySection = '<h2 style="font-size: 18px;">Strategy Analysis</h2><div class="allocation-grid">' +
        '<div class="allocation-card"><h3 style="margin-top: 0; color: #5b4b8a; font-size: 14px;">' + (scenario1.name || 'Scenario A') + '</h3>' +
        '<p style="font-size: 13px;"><strong>Strategy:</strong> ' + strategy1Name + '</p>' +
        '<p style="font-size: 13px; color: #666;">' + strategy1Desc + '</p>' +
        (strategy1Reflection ? '<p style="font-size: 12px; color: #888; font-style: italic; margin-top: 10px;">' + strategy1Reflection + '</p>' : '') + '</div>' +
        '<div class="allocation-card"><h3 style="margin-top: 0; color: #5b4b8a; font-size: 14px;">' + (scenario2.name || 'Scenario B') + '</h3>' +
        '<p style="font-size: 13px;"><strong>Strategy:</strong> ' + strategy2Name + '</p>' +
        '<p style="font-size: 13px; color: #666;">' + strategy2Desc + '</p>' +
        (strategy2Reflection ? '<p style="font-size: 12px; color: #888; font-style: italic; margin-top: 10px;">' + strategy2Reflection + '</p>' : '') + '</div></div>';

      // Generate bottom line and recommendations based on strategies and allocations
      var sameStrategy = (strategy1Name === strategy2Name);
      var bottomLine = '';
      var recommendationSection = '';

      // Calculate key differences for better recommendations
      var alloc1 = scenario1.allocations || {};
      var alloc2 = scenario2.allocations || {};
      var freedomDiff = (alloc2.Freedom || 0) - (alloc1.Freedom || 0);
      var multiplyDiff = (alloc2.Multiply || 0) - (alloc1.Multiply || 0);
      var enjoymentDiff = (alloc2.Enjoyment || 0) - (alloc1.Enjoyment || 0);
      var essentialsDiff = (alloc2.Essentials || 0) - (alloc1.Essentials || 0);

      if (sameStrategy) {
        // Same strategy - focus on the specific allocation differences
        bottomLine = 'Both scenarios follow a <strong>' + strategy1Name + '</strong> approach, but with different emphasis. ';

        // Identify the biggest differences
        var diffs = [
          { name: 'Freedom', diff: freedomDiff, dollars: Math.abs(freedomDiff) * monthlyIncome / 100 },
          { name: 'Multiply', diff: multiplyDiff, dollars: Math.abs(multiplyDiff) * monthlyIncome / 100 },
          { name: 'Enjoyment', diff: enjoymentDiff, dollars: Math.abs(enjoymentDiff) * monthlyIncome / 100 },
          { name: 'Essentials', diff: essentialsDiff, dollars: Math.abs(essentialsDiff) * monthlyIncome / 100 }
        ].filter(function(d) { return Math.abs(d.diff) >= 5; })
         .sort(function(a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });

        if (diffs.length > 0) {
          var biggestDiff = diffs[0];
          var scenario1Higher = biggestDiff.diff < 0;
          bottomLine += '"' + (scenario1Higher ? (scenario1.name || 'Scenario A') : (scenario2.name || 'Scenario B')) + '" allocates ' +
            Math.abs(biggestDiff.diff) + '% more to ' + biggestDiff.name + ' ($' + Math.round(biggestDiff.dollars).toLocaleString() + '/month difference). ';
        }
        bottomLine += 'The right choice depends on your current priorities and which trade-offs feel most sustainable.';

        // Build differentiated recommendations based on actual allocations
        recommendationSection = '<h2 style="font-size: 18px;">Making Your Decision</h2><div class="decision-section" style="font-size: 13px;">';

        // Scenario 1 recommendations
        recommendationSection += '<h3 style="font-size: 14px;">Consider ' + (scenario1.name || 'Scenario A') + ' If:</h3><ul style="margin: 8px 0 12px 20px;">';
        if ((alloc1.Freedom || 0) > (alloc2.Freedom || 0)) {
          recommendationSection += '<li>You want to pay down debt faster or build emergency savings quicker</li>';
        }
        if ((alloc1.Multiply || 0) > (alloc2.Multiply || 0)) {
          recommendationSection += '<li>Long-term wealth building is your top priority right now</li>';
        }
        if ((alloc1.Enjoyment || 0) > (alloc2.Enjoyment || 0)) {
          recommendationSection += '<li>Maintaining quality of life keeps you motivated and consistent</li>';
        }
        if ((alloc1.Essentials || 0) > (alloc2.Essentials || 0)) {
          recommendationSection += '<li>You need more cushion for fixed expenses and bills</li>';
        }
        recommendationSection += '<li style="margin: 4px 0;">The $' + self.formatMoney(scenario1Dollars.Freedom + scenario1Dollars.Multiply).replace('$', '') + '/month toward Freedom + Multiply feels right</li>';
        recommendationSection += '</ul>';

        // Scenario 2 recommendations
        recommendationSection += '<h3 style="font-size: 14px;">Consider ' + (scenario2.name || 'Scenario B') + ' If:</h3><ul style="margin: 8px 0 12px 20px;">';
        if ((alloc2.Freedom || 0) > (alloc1.Freedom || 0)) {
          recommendationSection += '<li>You want to pay down debt faster or build emergency savings quicker</li>';
        }
        if ((alloc2.Multiply || 0) > (alloc1.Multiply || 0)) {
          recommendationSection += '<li>Long-term wealth building is your top priority right now</li>';
        }
        if ((alloc2.Enjoyment || 0) > (alloc1.Enjoyment || 0)) {
          recommendationSection += '<li>Maintaining quality of life keeps you motivated and consistent</li>';
        }
        if ((alloc2.Essentials || 0) > (alloc1.Essentials || 0)) {
          recommendationSection += '<li>You need more cushion for fixed expenses and bills</li>';
        }
        recommendationSection += '<li style="margin: 4px 0;">The $' + self.formatMoney(scenario2Dollars.Freedom + scenario2Dollars.Multiply).replace('$', '') + '/month toward Freedom + Multiply feels right</li>';
        recommendationSection += '</ul>';

        recommendationSection += '<div class="remember-box" style="font-size: 13px;"><strong>Remember:</strong> The best choice is one you can consistently follow. Small differences in allocation matter less than sticking with a plan.</div></div>';
      } else {
        // Different strategies - original logic with better formatting
        bottomLine = '"' + (scenario1.name || 'Scenario A') + '" takes a <strong>' + strategy1Name + '</strong> approach, while "' +
          (scenario2.name || 'Scenario B') + '" uses a <strong>' + strategy2Name + '</strong> approach. ' +
          'Consider which trade-offs align with your current life situation and short-term needs.';

        recommendationSection = '<h2 style="font-size: 18px;">Making Your Decision</h2><div class="decision-section" style="font-size: 13px;">' +
          '<h3 style="font-size: 14px;">Consider ' + (scenario1.name || 'Scenario A') + ' If:</h3><ul style="margin: 8px 0 12px 20px;">' +
          '<li style="margin: 4px 0;">The ' + strategy1Name + ' approach matches your current priorities</li>' +
          '<li style="margin: 4px 0;">' + (strategy1Desc || 'These dollar amounts feel sustainable for your lifestyle') + '</li>' +
          '<li style="margin: 4px 0;">You can commit to $' + self.formatMoney(scenario1Dollars.Freedom).replace('$', '') + '/month toward Freedom</li></ul>' +
          '<h3 style="font-size: 14px;">Consider ' + (scenario2.name || 'Scenario B') + ' If:</h3><ul style="margin: 8px 0 12px 20px;">' +
          '<li style="margin: 4px 0;">The ' + strategy2Name + ' approach better addresses your pressing concerns</li>' +
          '<li style="margin: 4px 0;">' + (strategy2Desc || 'This allocation feels more aligned with where you are now') + '</li>' +
          '<li style="margin: 4px 0;">You can commit to $' + self.formatMoney(scenario2Dollars.Freedom).replace('$', '') + '/month toward Freedom</li></ul>' +
          '<div class="remember-box" style="font-size: 13px;"><strong>Remember:</strong> The best choice is one you can consistently follow.</div></div>';
      }

      var bottomLineSection = '<h2 style="font-size: 18px;">The Bottom Line</h2>' +
        '<div class="bottom-line-box"><p>' + bottomLine + '</p></div>';

      var footer = this.buildFooter('This comparison helps you explore different approaches. Choose the one that resonates with your current needs.');

      var bodyContent = header + executiveSummary + gptComparisonSection + scenariosSection + comparisonTable + impactSection + strategySection + bottomLineSection + recommendationSection + footer;
      var htmlContent = this.buildHTMLDocument(this.getTool4Styles(), bodyContent);
      var fileName = this.generateFileName('ScenarioComparison', studentName);
      return this.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log('[PDFGenerator] Error generating Tool 4 Comparison PDF: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  // ============================================================
  // INTEGRATION REPORT PDF
  // ============================================================

  /**
   * Generate Integration Report PDF.
   * Combines detection engine outputs with GPT narrative into a print-ready PDF.
   *
   * Uses _checkReportReadiness() to determine which sections have data and
   * to avoid running detection engines twice.
   *
   * @param {string} clientId - Student ID
   * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
   */
  generateIntegrationPDF(clientId) {
    try {
      Logger.log('[PDFGenerator] Generating Capstone Report PDF for ' + clientId);

      // 1. Get student summary and check readiness
      var summary = CollectiveResults.getStudentSummary(clientId);
      var readiness = CollectiveResults._checkReportReadiness(summary);

      if (!readiness.ready) {
        var reason = readiness.sectionCount === 0
          ? 'No integration data available yet. Complete Tool 1 and at least one other tool.'
          : 'Only ' + readiness.sectionCount + ' section available. Complete more tools for a meaningful report.';
        return { success: false, error: reason };
      }

      // Use pre-computed analysis data from readiness check (avoids running engines twice)
      var analysisData = readiness.analysisData;

      // 2. Gather rich per-tool data for Parts 1 and 2
      var perToolData = this._gatherPerToolData(summary);
      analysisData.perToolData = perToolData;

      // 3. Generate GPT narrative (with 3-tier fallback) — now includes per-tool context
      var narrative = IntegrationGPT.generateNarrative(analysisData);
      Logger.log('[PDFGenerator] Narrative source: ' + narrative.source);

      // 4. Build report HTML
      var studentName = this._getStudentName(clientId) || 'Student';
      var styles = this.getCommonStyles() + this._getIntegrationStyles() + this._getCapstoneStyles();
      var bodyContent = this._buildCapstoneReportBody(clientId, studentName, summary, analysisData, narrative, readiness, perToolData);
      var html = this.buildHTMLDocument(styles, bodyContent);

      // 5. Convert to PDF
      var fileName = this.generateFileName('CapstoneReport', studentName);
      return this.htmlToPDF(html, fileName);

    } catch (error) {
      Logger.log('[PDFGenerator] Capstone Report PDF error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Integration Report specific styles (supplements getCommonStyles)
   */
  _getIntegrationStyles() {
    return '\n' +
      '.profile-card { background: #f8f6f3; border: 2px solid #ad9168; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }\n' +
      '.profile-name { font-size: 22px; font-weight: 700; color: #ad9168; margin: 10px 0; }\n' +
      '.profile-desc { color: #555; line-height: 1.6; max-width: 600px; margin: 0 auto; }\n' +
      '.warning-box { padding: 12px 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid; }\n' +
      '.warning-critical { background: #fef2f2; border-color: #ef4444; }\n' +
      '.warning-high { background: #fffbeb; border-color: #f59e0b; }\n' +
      '.warning-medium { background: #f9fafb; border-color: #9ca3af; }\n' +
      '.lock-box { background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 15px; margin: 10px 0; }\n' +
      '.lock-belief { padding: 4px 0; font-size: 14px; }\n' +
      '.lock-impact { font-size: 13px; color: #666; margin-top: 8px; font-style: italic; }\n' +
      '.gap-visual { background: #f0f9ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin: 15px 0; }\n' +
      '.synthesis-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; font-size: 15px; line-height: 1.7; }\n' +
      '.action-list { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px 15px 15px 35px; margin: 15px 0; }\n' +
      '.action-list li { margin: 10px 0; line-height: 1.5; }\n' +
      '.source-tag { display: inline-block; background: #f3f4f6; padding: 3px 10px; border-radius: 10px; font-size: 11px; color: #6b7280; margin-top: 5px; }\n' +
      '.source-tag.gpt { background: #dcfce7; color: #16a34a; }\n' +
      '.section-divider { border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; }\n' +
      '.bb-gap-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0; }\n' +
      '.bb-gap-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; color: #555; font-size: 12px; }\n' +
      '.bb-gap-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; }\n' +
      '.missing-section-box { background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0; }\n' +
      '@media print { .page-break { page-break-before: always; } }\n';
  },

  /**
   * Build the Integration Report body HTML from analysis data and GPT narrative.
   *
   * For sections without data, shows a brief explanatory box telling the student
   * which tool(s) to complete to unlock that section.
   *
   * @param {string} clientId
   * @param {string} studentName
   * @param {Object} analysisData - detection engine results
   * @param {Object} narrative - GPT or fallback narrative
   * @param {Object} readiness - from _checkReportReadiness()
   */
  _buildIntegrationReportBody(clientId, studentName, analysisData, narrative, readiness) {
    var profile = analysisData.profile;
    var warnings = analysisData.warnings;
    var gap = analysisData.awarenessGap;
    var locks = analysisData.locks;
    var bbGaps = analysisData.bbGaps;
    var sections = readiness.sections;

    var html = '';

    // Header
    html += this.buildHeader('Your Integration Report', studentName);

    // Source tag
    var sourceLabel = (narrative.source && narrative.source.indexOf('gpt') !== -1) ? 'Personalized Analysis' : 'Standard Analysis';
    var sourceClass = (narrative.source && narrative.source.indexOf('gpt') !== -1) ? 'gpt' : '';
    html += '<p style="text-align: right;"><span class="source-tag ' + sourceClass + '">' + sourceLabel + '</span></p>';

    // Completion context
    if (readiness.sectionCount < readiness.totalSections) {
      html += '<div style="margin-bottom: 20px;">' +
        '<p style="line-height: 1.6;">This report integrates your results across all completed TruPath assessments. It identifies ' +
        'where your psychological patterns are directly affecting your financial behaviors, and gives you ' +
        'specific areas to focus on.</p>' +
        '<p style="color: #ad9168; font-size: 14px;"><strong>Report Coverage: ' +
          readiness.sectionCount + ' of ' + readiness.totalSections + ' sections.</strong> ' +
          'Complete additional tools to unlock the remaining sections and get a more comprehensive analysis.</p>' +
      '</div>';
    } else {
      html += '<div style="margin-bottom: 20px;">' +
        '<p style="line-height: 1.6;">This report integrates your results across all completed TruPath assessments. It identifies ' +
        'where your psychological patterns are directly affecting your financial behaviors, and gives you ' +
        'specific areas to focus on.</p>' +
      '</div>';
    }

    // --- Section 1: Your Profile ---
    if (sections.profile && profile && narrative.profileNarrative) {
      html += '<h2>Your Integration Profile</h2>';
      html += '<div class="profile-card">';
      html += '<div style="font-size: 2rem;">' + (profile.icon || '') + '</div>';
      html += '<div class="profile-name">' + profile.name + '</div>';
      html += '<p class="profile-desc">' + narrative.profileNarrative + '</p>';
      html += '</div>';
    } else if (!sections.profile) {
      html += '<h2>Your Integration Profile</h2>';
      html += this._buildMissingSectionBox(
        'Your integration profile identifies your core psychological-financial pattern.',
        'Complete Tool 1 (Core Trauma Assessment) to unlock this section.'
      );
    }

    // --- Section 2: Awareness Gap ---
    if (sections.awarenessGap && gap && gap.severity !== 'normal' && narrative.gapNarrative) {
      html += '<hr class="section-divider">';
      html += '<h2>Your Awareness Gap</h2>';
      html += '<div class="gap-visual">';
      html += '<p><strong>Psychological Patterns:</strong> ' + gap.psychScore + '/100</p>';
      html += this._buildPercentageBar(gap.psychScore, '#f59e0b', 18);
      html += '<p><strong>Stress Awareness:</strong> ' + gap.stressScore + '/100</p>';
      html += this._buildPercentageBar(gap.stressScore, '#22c55e', 18);
      html += '<p style="text-align: center; margin-top: 10px;"><strong>Gap: ' + gap.gapScore + ' points</strong></p>';
      html += '</div>';
      html += '<p>' + narrative.gapNarrative + '</p>';
    } else if (!sections.awarenessGap) {
      // Check if the required tools are actually completed — if so, the gap is
      // either "normal" or the calculation returned null (data extraction issue).
      // In either case, do NOT show the misleading "complete tools to unlock" message.
      var gapSummary = analysisData.summary || {};
      var gapTools = gapSummary.tools || {};
      var hasT2Done = gapTools.tool2 && gapTools.tool2.status === 'completed';
      var hasGroundingDone = (gapTools.tool3 && gapTools.tool3.status === 'completed') ||
                             (gapTools.tool5 && gapTools.tool5.status === 'completed') ||
                             (gapTools.tool7 && gapTools.tool7.status === 'completed');

      if (hasT2Done && hasGroundingDone) {
        // Tools are complete but no significant gap detected — this is a valid finding
        html += '<hr class="section-divider">';
        html += '<h2>Your Awareness Gap</h2>';
        html += this._buildMissingSectionBox(
          'The awareness gap measures whether you see the full financial impact of your psychological patterns.',
          'No significant awareness gap detected in your results.'
        );
      } else if (!(gap && gap.severity === 'normal')) {
        // Tools genuinely missing — show unlock hint
        var gapHint = 'Complete ';
        if (!hasT2Done && !hasGroundingDone) {
          gapHint += 'Tool 2 (Financial Clarity) and a grounding tool (Tool 3, 5, or 7)';
        } else if (!hasT2Done) {
          gapHint += 'Tool 2 (Financial Clarity)';
        } else {
          gapHint += 'a grounding tool (Tool 3, 5, or 7)';
        }
        gapHint += ' to unlock this section.';

        html += '<hr class="section-divider">';
        html += '<h2>Your Awareness Gap</h2>';
        html += this._buildMissingSectionBox(
          'The awareness gap measures whether you see the full financial impact of your psychological patterns.',
          gapHint
        );
      }
    }

    // --- Section 3: Active Warnings ---
    if (sections.warnings && warnings && warnings.length > 0 && narrative.warningNarrative) {
      html += '<hr class="section-divider">';
      html += '<h2>Active Patterns Affecting Your Finances</h2>';
      html += '<p>' + narrative.warningNarrative + '</p>';

      for (var w = 0; w < Math.min(warnings.length, 6); w++) {
        var warning = warnings[w];
        var wClass = 'warning-medium';
        if (warning.priority === 'CRITICAL') wClass = 'warning-critical';
        else if (warning.priority === 'HIGH') wClass = 'warning-high';

        html += '<div class="warning-box ' + wClass + '">';
        html += '<p><strong>' + warning.type.replace(/_/g, ' ') + '</strong></p>';
        html += '<p>' + warning.message + '</p>';
        html += '<p style="font-size: 12px; color: #888;">Based on: ' + warning.sources.join(' + ') + '</p>';
        html += '</div>';
      }
    }

    // --- Section 4: Belief Locks ---
    if (sections.beliefLocks && locks && locks.length > 0 && narrative.lockNarrative) {
      html += '<hr class="section-divider">';
      html += '<div class="page-break"></div>';
      html += '<h2>Your Belief Locks</h2>';
      html += '<p>' + narrative.lockNarrative + '</p>';

      for (var l = 0; l < Math.min(locks.length, 4); l++) {
        var lock = locks[l];
        html += '<div class="lock-box">';
        html += '<p><strong>' + lock.name + '</strong> <span style="color: #888;">(' + lock.strength + ')</span></p>';

        for (var b = 0; b < lock.beliefs.length; b++) {
          var belief = lock.beliefs[b];
          html += '<p class="lock-belief">"' + belief.label + '" - ' + belief.tool + ': ' + belief.score + '/100</p>';
        }

        html += '<p class="lock-impact">' + lock.financialImpact + '</p>';
        html += '</div>';
      }
    }

    // --- Section 5: Belief-Behavior Gaps ---
    if (sections.beliefBehaviorGaps && bbGaps && bbGaps.length > 0) {
      html += '<hr class="section-divider">';
      html += '<h2>Where Your Beliefs and Actions Diverge</h2>';
      html += '<p style="color: #555; margin-bottom: 12px;">These gaps show where what you believe does not match how you act. The larger the gap, the more internal conflict is present.</p>';

      html += '<table class="bb-gap-table">';
      html += '<tr><th>Belief</th><th>Tool</th><th>Belief Score</th><th>Action Score</th><th>Gap</th><th>Pattern</th></tr>';

      for (var g = 0; g < Math.min(bbGaps.length, 6); g++) {
        var bbGap = bbGaps[g];
        html += '<tr>';
        html += '<td>"' + bbGap.label + '"</td>';
        html += '<td>' + bbGap.tool + '</td>';
        html += '<td>' + bbGap.beliefScore + '</td>';
        html += '<td>' + bbGap.behaviorScore + '</td>';
        html += '<td style="color: #f59e0b; font-weight: 600;">' + bbGap.gap + '</td>';
        html += '<td>' + bbGap.direction + '</td>';
        html += '</tr>';
      }

      html += '</table>';

      if (bbGaps.length > 6) {
        html += '<p style="font-size: 12px; color: #888; text-align: center; margin-top: 8px;">' +
          (bbGaps.length - 6) + ' additional gap' + (bbGaps.length - 6 > 1 ? 's' : '') + ' detected. Speak with your coach for the complete analysis.</p>';
      }
    }

    // --- Overall Synthesis ---
    if (narrative.overallSynthesis) {
      html += '<hr class="section-divider">';
      html += '<h2>The Big Picture</h2>';
      html += '<div class="synthesis-box">' + narrative.overallSynthesis + '</div>';
    }

    // --- Action Items ---
    if (narrative.actionItems && narrative.actionItems.length > 0) {
      html += '<h2>Your Next Steps</h2>';
      html += '<ol class="action-list">';
      for (var a = 0; a < narrative.actionItems.length; a++) {
        html += '<li>' + narrative.actionItems[a] + '</li>';
      }
      html += '</ol>';
    }

    // --- Missing Tools Summary ---
    if (readiness.missing.length > 0) {
      html += '<hr class="section-divider">';
      html += '<h2>Unlock More Insights</h2>';
      html += '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">';
      html += '<p style="margin-bottom: 10px;">Complete these tools to get a more comprehensive integration report:</p>';
      html += '<ul style="padding-left: 20px;">';
      for (var m = 0; m < readiness.missing.length; m++) {
        html += '<li style="margin: 8px 0; color: #555;">' + readiness.missing[m] + '</li>';
      }
      html += '</ul>';
      html += '</div>';
    }

    // Footer
    html += this.buildFooter('This integration report connects your psychological assessment results to your financial behaviors. Use it as a guide for your coaching conversations and future tool work.');

    return html;
  },

  /**
   * Build a "missing section" placeholder box for the PDF report.
   * @param {string} description - What this section does
   * @param {string} instruction - What tool(s) to complete
   * @returns {string} HTML
   */
  // ============================================================
  // PHASE 10: CAPSTONE REPORT — Per-Tool Data + Expanded Report
  // ============================================================

  /**
   * Capstone-specific styles that supplement _getIntegrationStyles().
   * Adds per-tool section styles, cover page, allocation bars, etc.
   */
  _getCapstoneStyles() {
    return '\n' +
      '.part-header { background: linear-gradient(135deg, #f8f6f3, #f0ebe3); border: 1px solid #d4c5a9; border-radius: 10px; padding: 20px; margin: 30px 0 15px 0; }\n' +
      '.part-header h2 { color: #ad9168; margin: 0 0 8px 0; font-size: 20px; }\n' +
      '.part-header p { color: #666; margin: 0; line-height: 1.6; font-size: 14px; }\n' +
      '.tool-section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 12px 0; }\n' +
      '.tool-section-header { font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }\n' +
      '.allocation-bar { display: flex; height: 28px; border-radius: 6px; overflow: hidden; margin: 10px 0; }\n' +
      '.allocation-segment { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 600; }\n' +
      '.tool-insight { background: #f9fafb; border-left: 3px solid #ad9168; padding: 10px 12px; margin: 10px 0; font-size: 13px; color: #555; line-height: 1.5; font-style: italic; }\n' +
      '.metric-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }\n' +
      '.metric-label { color: #555; }\n' +
      '.metric-value { font-weight: 600; color: #374151; }\n' +
      '.cover-page { text-align: center; padding: 40px 30px 20px 30px; }\n' +
      '.cover-completion { font-size: 14px; color: #888; margin-top: 10px; }\n';
  },

  /**
   * Gather rich per-tool data for the Capstone Report.
   * Uses existing ToolXReport.getResults() methods to get full data
   * including GPT insights that were generated at submission time.
   *
   * @param {Object} summary - from getStudentSummary()
   * @returns {Object} Per-tool data keyed by tool number
   */
  _gatherPerToolData(summary) {
    var clientId = summary.clientId;
    var data = {
      tool1: null,
      tool2: null,
      tool3: null,
      tool4: null,
      tool5: null,
      tool6: null,
      tool7: null,
      tool8: null
    };

    try {
      // Tool 1: Core Trauma Strategy
      if (summary.tools.tool1 && summary.tools.tool1.status === 'completed') {
        try {
          data.tool1 = Tool1Report.getResults(clientId);
        } catch (e) {
          Logger.log('[Capstone] Tool 1 data fetch failed: ' + e.message);
        }
      }

      // Tool 2: Financial Clarity
      if (summary.tools.tool2 && summary.tools.tool2.status === 'completed') {
        try {
          data.tool2 = Tool2Report.getResults(clientId);
        } catch (e) {
          Logger.log('[Capstone] Tool 2 data fetch failed: ' + e.message);
        }
      }

      // Tool 3: Identity & Validation (Grounding) — data already in summary
      if (summary.tools.tool3 && summary.tools.tool3.status === 'completed' && summary.tools.tool3.data) {
        data.tool3 = summary.tools.tool3.data;
      }

      // Tool 4: Budget Framework — data comes from summary directly
      if (summary.tools.tool4 && summary.tools.tool4.status === 'completed') {
        var t4raw = summary.tools.tool4.data;
        if (t4raw) {
          data.tool4 = {
            monthlyIncome: t4raw.monthlyIncome || 0,
            multiply: t4raw.multiply || 0,
            essentials: t4raw.essentials || 0,
            freedom: t4raw.freedom || 0,
            enjoyment: t4raw.enjoyment || 0,
            priority: t4raw.priority || 'Not selected'
          };
        }
      }

      // Tool 5: Love & Connection (Grounding) — data already in summary
      if (summary.tools.tool5 && summary.tools.tool5.status === 'completed' && summary.tools.tool5.data) {
        data.tool5 = summary.tools.tool5.data;
      }

      // Tool 6: Retirement Blueprint — data already in summary
      if (summary.tools.tool6 && summary.tools.tool6.status === 'completed' && summary.tools.tool6.data) {
        data.tool6 = summary.tools.tool6.data;
      }

      // Tool 7: Security & Control (Grounding) — data already in summary
      if (summary.tools.tool7 && summary.tools.tool7.status === 'completed' && summary.tools.tool7.data) {
        data.tool7 = summary.tools.tool7.data;
      }

      // Tool 8: Investment Planning — data already in summary, map field names
      if (summary.tools.tool8 && summary.tools.tool8.status === 'completed' && summary.tools.tool8.data) {
        var t8raw = summary.tools.tool8.data;
        data.tool8 = {
          scenarioName: t8raw.scenarioName || '',
          monthlyInvestment: t8raw.M_real || t8raw.monthlyInvestment || 0,
          timeHorizon: t8raw.T || t8raw.timeHorizon || 0,
          risk: t8raw.risk,
          projectedBalance: t8raw.projectedBalance || 0,
          feasibility: t8raw.feasibility || ''
        };
      }

    } catch (e) {
      Logger.log('[Capstone] Per-tool data gathering error: ' + e.message);
    }

    return data;
  },

  /**
   * Build the Capstone Report body HTML.
   *
   * 4-Part structure:
   * - Cover Page
   * - Part 1: Psychological Foundation (per-tool data from Tools 1, 3, 5, 7)
   * - Part 2: Financial Landscape (per-tool data from Tools 2, 4, 6, 8)
   * - Part 3: The Integration (existing detection engine analysis)
   * - Part 4: Your Path Forward (action items + closing)
   */
  _buildCapstoneReportBody(clientId, studentName, summary, analysisData, narrative, readiness, perToolData) {
    var profile = analysisData.profile;
    var warnings = analysisData.warnings;
    var gap = analysisData.awarenessGap;
    var locks = analysisData.locks;
    var bbGaps = analysisData.bbGaps;
    var sections = readiness.sections;

    var html = '';

    // =============================================
    // COVER PAGE
    // =============================================
    html += '<div class="cover-page">';
    html += this.buildHeader('Your TruPath Capstone Report', studentName);

    // Count completed tools
    var completedCount = 0;
    var toolKeys = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8'];
    for (var i = 0; i < toolKeys.length; i++) {
      if (summary.tools[toolKeys[i]] && summary.tools[toolKeys[i]].status === 'completed') {
        completedCount++;
      }
    }

    // Source tag
    var sourceLabel = (narrative.source && narrative.source.indexOf('gpt') !== -1) ? 'Personalized Analysis' : 'Standard Analysis';
    var sourceClass = (narrative.source && narrative.source.indexOf('gpt') !== -1) ? 'gpt' : '';
    html += '<p style="text-align: center;"><span class="source-tag ' + sourceClass + '">' + sourceLabel + '</span></p>';

    html += '<p class="cover-completion">' + completedCount + ' of 8 assessments completed</p>';

    html += '<div style="text-align: left; margin-top: 20px;">' +
      '<p style="line-height: 1.6;">This capstone report brings together everything you have discovered through your TruPath assessments. ' +
      'Part 1 covers your psychological foundation — the inner patterns that drive your decisions. ' +
      'Part 2 maps your financial landscape — how those patterns show up in your money. ' +
      'Part 3 is the integration — where psychology meets finance. ' +
      'Part 4 is your path forward.</p>' +
    '</div>';
    html += '</div>';

    // =============================================
    // PART 1: YOUR PSYCHOLOGICAL FOUNDATION
    // =============================================
    html += '<div class="page-break"></div>';
    html += '<div class="part-header">';
    html += '<h2>Part 1: Your Psychological Foundation</h2>';
    if (narrative.psychFoundationNarrative) {
      html += '<p>' + narrative.psychFoundationNarrative + '</p>';
    }
    html += '</div>';

    // Tool 1: Core Trauma Strategy
    if (perToolData.tool1) {
      html += this._buildTool1Section(perToolData.tool1);
    }

    // Grounding Tools (3, 5, 7)
    if (perToolData.tool3) {
      html += this._buildGroundingToolSection(perToolData.tool3, 'Tool 3: Identity and Validation');
    }
    if (perToolData.tool5) {
      html += this._buildGroundingToolSection(perToolData.tool5, 'Tool 5: Love and Connection');
    }
    if (perToolData.tool7) {
      html += this._buildGroundingToolSection(perToolData.tool7, 'Tool 7: Security and Control');
    }

    // If no psychological tools completed, show placeholder
    if (!perToolData.tool1 && !perToolData.tool3 && !perToolData.tool5 && !perToolData.tool7) {
      html += this._buildMissingSectionBox(
        'Your psychological foundation assessments have not been completed yet.',
        'Complete Tool 1 (Core Trauma Assessment) and at least one grounding tool (Tool 3, 5, or 7) to populate this section.'
      );
    }

    // =============================================
    // PART 2: YOUR FINANCIAL LANDSCAPE
    // =============================================
    html += '<div class="page-break"></div>';
    html += '<div class="part-header">';
    html += '<h2>Part 2: Your Financial Landscape</h2>';
    if (narrative.financialLandscapeNarrative) {
      html += '<p>' + narrative.financialLandscapeNarrative + '</p>';
    }
    html += '</div>';

    // Tool 2: Financial Clarity
    if (perToolData.tool2) {
      html += this._buildTool2Section(perToolData.tool2);
    }

    // Tool 4: Budget Framework
    if (perToolData.tool4) {
      html += this._buildTool4Section(perToolData.tool4);
    }

    // Tool 6: Retirement Blueprint
    if (perToolData.tool6) {
      html += this._buildTool6Section(perToolData.tool6);
    }

    // Tool 8: Investment Planning
    if (perToolData.tool8) {
      html += this._buildTool8Section(perToolData.tool8);
    }

    // If no financial tools completed, show placeholder
    if (!perToolData.tool2 && !perToolData.tool4 && !perToolData.tool6 && !perToolData.tool8) {
      html += this._buildMissingSectionBox(
        'Your financial landscape assessments have not been completed yet.',
        'Complete Tool 2 (Financial Clarity) and Tool 4 (Budget Framework) to populate this section.'
      );
    }

    // =============================================
    // PART 3: THE INTEGRATION (existing Phase 9 content)
    // =============================================
    html += '<div class="page-break"></div>';
    html += '<div class="part-header">';
    html += '<h2>Part 3: The Integration</h2>';
    html += '<p>This is where your psychological patterns meet your financial behaviors. The detection engines below analyzed your data across all completed tools to find patterns, warnings, and gaps.</p>';
    html += '</div>';

    // --- Integration Profile ---
    if (sections.profile && profile && narrative.profileNarrative) {
      html += '<h3>Your Integration Profile</h3>';
      html += '<div class="profile-card">';
      html += '<div style="font-size: 2rem;">' + (profile.icon || '') + '</div>';
      html += '<div class="profile-name">' + profile.name + '</div>';
      html += '<p class="profile-desc">' + narrative.profileNarrative + '</p>';
      html += '</div>';
    } else if (!sections.profile) {
      html += '<h3>Your Integration Profile</h3>';
      html += this._buildMissingSectionBox(
        'Your integration profile identifies your core psychological-financial pattern.',
        'Complete Tool 1 (Core Trauma Assessment) to unlock this section.'
      );
    }

    // --- Awareness Gap ---
    if (sections.awarenessGap && gap && gap.severity !== 'normal' && narrative.gapNarrative) {
      html += '<hr class="section-divider">';
      html += '<h3>Your Awareness Gap</h3>';
      html += '<div class="gap-visual">';
      html += '<p><strong>Psychological Patterns:</strong> ' + gap.psychScore + '/100</p>';
      html += this._buildPercentageBar(gap.psychScore, '#f59e0b', 18);
      html += '<p><strong>Stress Awareness:</strong> ' + gap.stressScore + '/100</p>';
      html += this._buildPercentageBar(gap.stressScore, '#22c55e', 18);
      html += '<p style="text-align: center; margin-top: 10px;"><strong>Gap: ' + gap.gapScore + ' points</strong></p>';
      html += '</div>';
      html += '<p>' + narrative.gapNarrative + '</p>';
    } else if (!sections.awarenessGap) {
      // Check if required tools are completed — if so, gap is normal or data
      // extraction returned null. Do not show misleading "complete tools" message.
      var capTools = summary.tools || {};
      var capHasT2 = capTools.tool2 && capTools.tool2.status === 'completed';
      var capHasGrounding = (capTools.tool3 && capTools.tool3.status === 'completed') ||
                            (capTools.tool5 && capTools.tool5.status === 'completed') ||
                            (capTools.tool7 && capTools.tool7.status === 'completed');

      if (capHasT2 && capHasGrounding) {
        // Tools complete but no significant gap — valid finding
        html += '<hr class="section-divider">';
        html += '<h3>Your Awareness Gap</h3>';
        html += this._buildMissingSectionBox(
          'The awareness gap measures whether you see the full financial impact of your psychological patterns.',
          'No significant awareness gap detected in your results.'
        );
      } else if (!(gap && gap.severity === 'normal')) {
        // Tools genuinely missing — show specific unlock hint
        var capGapHint = 'Complete ';
        if (!capHasT2 && !capHasGrounding) {
          capGapHint += 'Tool 2 (Financial Clarity) and a grounding tool (Tool 3, 5, or 7)';
        } else if (!capHasT2) {
          capGapHint += 'Tool 2 (Financial Clarity)';
        } else {
          capGapHint += 'a grounding tool (Tool 3, 5, or 7)';
        }
        capGapHint += ' to unlock this section.';

        html += '<hr class="section-divider">';
        html += '<h3>Your Awareness Gap</h3>';
        html += this._buildMissingSectionBox(
          'The awareness gap measures whether you see the full financial impact of your psychological patterns.',
          capGapHint
        );
      }
    }

    // --- Active Warnings ---
    if (sections.warnings && warnings && warnings.length > 0 && narrative.warningNarrative) {
      html += '<hr class="section-divider">';
      html += '<h3>Active Patterns Affecting Your Finances</h3>';
      html += '<p>' + narrative.warningNarrative + '</p>';

      for (var w = 0; w < Math.min(warnings.length, 6); w++) {
        var warning = warnings[w];
        var wClass = 'warning-medium';
        if (warning.priority === 'CRITICAL') wClass = 'warning-critical';
        else if (warning.priority === 'HIGH') wClass = 'warning-high';

        html += '<div class="warning-box ' + wClass + '">';
        html += '<p><strong>' + warning.type.replace(/_/g, ' ') + '</strong></p>';
        html += '<p>' + warning.message + '</p>';
        html += '<p style="font-size: 12px; color: #888;">Based on: ' + warning.sources.join(' + ') + '</p>';
        html += '</div>';
      }
    }

    // --- Belief Locks ---
    if (sections.beliefLocks && locks && locks.length > 0 && narrative.lockNarrative) {
      html += '<hr class="section-divider">';
      html += '<h3>Your Belief Locks</h3>';
      html += '<p>' + narrative.lockNarrative + '</p>';

      for (var l = 0; l < Math.min(locks.length, 4); l++) {
        var lock = locks[l];
        html += '<div class="lock-box">';
        html += '<p><strong>' + lock.name + '</strong> <span style="color: #888;">(' + lock.strength + ')</span></p>';

        for (var b = 0; b < lock.beliefs.length; b++) {
          var belief = lock.beliefs[b];
          html += '<p class="lock-belief">"' + belief.label + '" - ' + belief.tool + ': ' + belief.score + '/100</p>';
        }

        html += '<p class="lock-impact">' + lock.financialImpact + '</p>';
        html += '</div>';
      }
    }

    // --- Belief-Behavior Gaps ---
    if (sections.beliefBehaviorGaps && bbGaps && bbGaps.length > 0) {
      html += '<hr class="section-divider">';
      html += '<h3>Where Your Beliefs and Actions Diverge</h3>';
      html += '<p style="color: #555; margin-bottom: 12px;">These gaps show where what you believe does not match how you act. The larger the gap, the more internal conflict is present.</p>';

      html += '<table class="bb-gap-table">';
      html += '<tr><th>Belief</th><th>Tool</th><th>Belief Score</th><th>Action Score</th><th>Gap</th><th>Pattern</th></tr>';

      for (var g = 0; g < Math.min(bbGaps.length, 6); g++) {
        var bbGap = bbGaps[g];
        html += '<tr>';
        html += '<td>"' + bbGap.label + '"</td>';
        html += '<td>' + bbGap.tool + '</td>';
        html += '<td>' + bbGap.beliefScore + '</td>';
        html += '<td>' + bbGap.behaviorScore + '</td>';
        html += '<td style="color: #f59e0b; font-weight: 600;">' + bbGap.gap + '</td>';
        html += '<td>' + bbGap.direction + '</td>';
        html += '</tr>';
      }

      html += '</table>';

      if (bbGaps.length > 6) {
        html += '<p style="font-size: 12px; color: #888; text-align: center; margin-top: 8px;">' +
          (bbGaps.length - 6) + ' additional gap' + (bbGaps.length - 6 > 1 ? 's' : '') + ' detected. Speak with your coach for the complete analysis.</p>';
      }
    }

    // --- The Big Picture ---
    if (narrative.overallSynthesis) {
      html += '<hr class="section-divider">';
      html += '<h3>The Big Picture</h3>';
      html += '<div class="synthesis-box">' + narrative.overallSynthesis + '</div>';
    }

    // =============================================
    // PART 4: YOUR PATH FORWARD
    // =============================================
    html += '<div class="page-break"></div>';
    html += '<div class="part-header">';
    html += '<h2>Part 4: Your Path Forward</h2>';
    html += '</div>';

    // Action Items
    if (narrative.actionItems && narrative.actionItems.length > 0) {
      html += '<h3>Your Next Steps</h3>';
      html += '<ol class="action-list">';
      for (var a = 0; a < narrative.actionItems.length; a++) {
        html += '<li>' + narrative.actionItems[a] + '</li>';
      }
      html += '</ol>';
    }

    // Missing Tools Summary
    if (completedCount < 8) {
      html += '<h3>Unlock More Insights</h3>';
      html += '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">';
      html += '<p style="margin-bottom: 10px;">Complete these remaining tools to get the full picture:</p>';
      html += '<ul style="padding-left: 20px;">';

      var toolMissing = {
        tool1: { name: 'Tool 1: Core Trauma Strategy', benefit: 'Unlocks your integration profile and warning patterns' },
        tool2: { name: 'Tool 2: Financial Clarity', benefit: 'Unlocks your awareness gap analysis' },
        tool3: { name: 'Tool 3: Identity and Validation', benefit: 'Deepens belief lock and cross-tool pattern detection' },
        tool4: { name: 'Tool 4: Budget Framework', benefit: 'Shows how your psychology shapes budget allocation' },
        tool5: { name: 'Tool 5: Love and Connection', benefit: 'Reveals how relationships affect financial decisions' },
        tool6: { name: 'Tool 6: Retirement Blueprint', benefit: 'Maps your long-term financial trajectory' },
        tool7: { name: 'Tool 7: Security and Control', benefit: 'Uncovers control-based financial patterns' },
        tool8: { name: 'Tool 8: Investment Planning', benefit: 'Connects your risk tolerance to growth strategy' }
      };

      for (var tk = 0; tk < toolKeys.length; tk++) {
        var tKey = toolKeys[tk];
        if (!summary.tools[tKey] || summary.tools[tKey].status !== 'completed') {
          var info = toolMissing[tKey];
          html += '<li style="margin: 8px 0; color: #555;"><strong>' + info.name + '</strong> — ' + info.benefit + '</li>';
        }
      }

      html += '</ul>';
      html += '</div>';
    }

    // Closing Statement + Footer (kept together to avoid orphan footer page)
    html += '<div style="page-break-inside: avoid;">';
    html += '<div style="text-align: center; margin-top: 20px; padding: 15px 20px;">';
    html += '<p style="font-size: 15px; color: #555; line-height: 1.7;">This report is a snapshot of where you are today. ' +
      'Your patterns are not your destiny — they are the starting point for change. ' +
      'Bring this document to your next coaching session and use it as a roadmap for your financial transformation.</p>';
    html += '</div>';
    html += '<div class="footer" style="font-size: 13px; margin-top: 15px;">' +
      '<p style="margin: 0 0 10px 0;">This capstone report integrates your psychological and financial assessment results. Use it as a comprehensive guide for your coaching conversations and future growth.</p>' +
      '<p style="margin-top: 10px;"><strong>TruPath Financial</strong><br>Generated: ' + new Date().toLocaleDateString() + '</p>' +
    '</div>';
    html += '</div>';

    return html;
  },

  // ============================================================
  // PER-TOOL SECTION BUILDERS (Phase 10)
  // ============================================================

  /**
   * Build Tool 1 section: Core Trauma Strategy
   * Shows dominant strategy and all 6 scores with visual bars.
   */
  _buildTool1Section(t1Data) {
    var html = '<div class="tool-section">';
    html += '<div class="tool-section-header">Tool 1: Core Trauma Strategy</div>';

    // Dominant strategy
    html += '<p><strong>Your Dominant Strategy:</strong> ' + (t1Data.winner || 'Unknown') + '</p>';

    // Strategy scores with bipolar bars (table-based for GAS PDF compatibility)
    if (t1Data.scores) {
      var strategyNames = CollectiveResults.STRATEGY_LABELS || {
        FSV: 'False Self-View',
        ExVal: 'External Validation',
        Showing: 'Issues Showing Love',
        Receiving: 'Issues Receiving Love',
        Control: 'Control Leading to Isolation',
        Fear: 'Fear Leading to Isolation'
      };

      html += '<div style="margin: 12px 0;">';
      for (var key in t1Data.scores) {
        var score = t1Data.scores[key];
        var name = strategyNames[key] || key;
        var isWinner = key === t1Data.winner;

        html += '<div style="margin: 6px 0;">';
        html += '<div style="font-size: 13px; color: #555; margin-bottom: 3px;">' + (isWinner ? '<strong>' : '') + name + ': ' + score + (isWinner ? ' (dominant)</strong>' : '') + '</div>';
        html += this._buildBipolarBar(score);
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Build a grounding tool section: Tools 3, 5, or 7.
   * Shows overall quotient, domain quotients, top subdomains, and GPT synthesis.
   * All three tools share the same data shape via GroundingReport.
   */
  _buildGroundingToolSection(gtData, title) {
    var html = '<div class="tool-section">';
    html += '<div class="tool-section-header">' + title + '</div>';

    if (gtData.scoring) {
      // Overall quotient
      html += '<p><strong>Overall Score:</strong> ' + gtData.scoring.overallQuotient + '/100</p>';

      // Domain scores
      if (gtData.scoring.domainQuotients) {
        for (var dk in gtData.scoring.domainQuotients) {
          var dScore = gtData.scoring.domainQuotients[dk];
          var dColor = dScore >= 70 ? '#22c55e' : (dScore >= 40 ? '#f59e0b' : '#ef4444');
          html += '<div style="margin: 6px 0;">';
          html += '<div style="font-size: 13px; color: #555; margin-bottom: 3px;">' + dk + ': ' + dScore + '/100</div>';
          html += this._buildPercentageBar(dScore, dColor);
          html += '</div>';
        }
      }

      // Top 3 strongest and weakest subdomains
      if (gtData.scoring.subdomainQuotients) {
        var subdomains = [];
        for (var sk in gtData.scoring.subdomainQuotients) {
          subdomains.push({ key: sk, score: gtData.scoring.subdomainQuotients[sk] });
        }
        subdomains.sort(function(a, b) { return b.score - a.score; });

        if (subdomains.length > 0) {
          html += '<div style="display: flex; gap: 20px; margin-top: 10px;">';

          // Strongest
          html += '<div style="flex: 1;">';
          html += '<p style="font-size: 13px; color: #16a34a; font-weight: 600;">Strongest Areas</p>';
          for (var s = 0; s < Math.min(3, subdomains.length); s++) {
            html += '<p style="font-size: 13px; color: #555;">' + subdomains[s].key + ': ' + subdomains[s].score + '</p>';
          }
          html += '</div>';

          // Weakest
          html += '<div style="flex: 1;">';
          html += '<p style="font-size: 13px; color: #ef4444; font-weight: 600;">Growth Areas</p>';
          for (var wk = subdomains.length - 1; wk >= Math.max(0, subdomains.length - 3); wk--) {
            html += '<p style="font-size: 13px; color: #555;">' + subdomains[wk].key + ': ' + subdomains[wk].score + '</p>';
          }
          html += '</div>';

          html += '</div>';
        }
      }
    }

    // GPT synthesis (reused from tool submission — no additional cost)
    if (gtData.syntheses && gtData.syntheses.overall && gtData.syntheses.overall.summary) {
      html += '<div class="tool-insight">' + gtData.syntheses.overall.summary + '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Build Tool 2 section: Financial Clarity
   * Shows archetype, domain clarity scores with bars, priority, and GPT insight.
   */
  _buildTool2Section(t2Data) {
    var html = '<div class="tool-section">';
    html += '<div class="tool-section-header">Tool 2: Financial Clarity</div>';

    if (t2Data.results) {
      // Archetype
      if (t2Data.results.archetype) {
        html += '<p><strong>Your Archetype:</strong> ' + t2Data.results.archetype + '</p>';
      }

      // Domain scores
      if (t2Data.results.domainScores) {
        var domainLabels = {
          moneyFlow: 'Money Flow',
          obligations: 'Obligations',
          liquidity: 'Liquidity',
          growth: 'Growth',
          protection: 'Protection'
        };

        for (var dom in t2Data.results.domainScores) {
          var score = t2Data.results.domainScores[dom];
          var label = domainLabels[dom] || dom;
          var color = score >= 70 ? '#22c55e' : (score >= 40 ? '#f59e0b' : '#ef4444');

          html += '<div style="margin: 6px 0;">';
          html += '<div style="font-size: 13px; color: #555; margin-bottom: 3px;">' + label + ': ' + score + '%</div>';
          html += this._buildPercentageBar(score, color);
          html += '</div>';
        }
      }

      // Priority domain
      if (t2Data.results.priorityList && t2Data.results.priorityList.length > 0) {
        var domainName = t2Data.results.priorityList[0].domain;
        domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
        html += '<p style="margin-top: 8px;"><strong>Priority Focus:</strong> ' + domainName + '</p>';
      }
    }

    // GPT overall insight (reused from tool submission)
    if (t2Data.overallInsight && t2Data.overallInsight.summary) {
      html += '<div class="tool-insight">' + t2Data.overallInsight.summary + '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Build Tool 4 section: Budget Framework
   * Shows monthly income, MEFI allocation bar, dollar amounts, and priority.
   */
  _buildTool4Section(t4Data) {
    var html = '<div class="tool-section">';
    html += '<div class="tool-section-header">Tool 4: Budget Framework</div>';

    // Monthly income
    var income = t4Data.monthlyIncome || 0;
    html += '<div class="metric-row">';
    html += '<span class="metric-label">Monthly Income</span>';
    html += '<span class="metric-value">$' + Number(income).toLocaleString() + '</span>';
    html += '</div>';

    // Allocation bar (MEFI)
    var colors = { multiply: '#ad9168', essentials: '#6366f1', freedom: '#22c55e', enjoyment: '#f59e0b' };
    var labels = { multiply: 'Multiply', essentials: 'Essentials', freedom: 'Freedom', enjoyment: 'Enjoyment' };
    var allocations = {
      multiply: t4Data.multiply || 0,
      essentials: t4Data.essentials || 0,
      freedom: t4Data.freedom || 0,
      enjoyment: t4Data.enjoyment || 0
    };

    html += '<div class="allocation-bar">';
    for (var aKey in allocations) {
      var pct = allocations[aKey];
      if (pct > 0) {
        html += '<div class="allocation-segment" style="width: ' + pct + '%; background: ' + colors[aKey] + ';">' +
          labels[aKey].charAt(0) + ' ' + pct + '%</div>';
      }
    }
    html += '</div>';

    // Dollar amounts
    html += '<div style="display: flex; justify-content: space-around; margin: 10px 0; font-size: 13px;">';
    for (var dKey in allocations) {
      var dollars = Math.round(income * allocations[dKey] / 100);
      html += '<div style="text-align: center;">';
      html += '<div style="color: ' + colors[dKey] + '; font-weight: 600;">' + labels[dKey] + '</div>';
      html += '<div>$' + Number(dollars).toLocaleString() + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Priority
    if (t4Data.priority && t4Data.priority !== 'Not selected') {
      html += '<p style="margin-top: 8px;"><strong>Selected Priority:</strong> ' + t4Data.priority + '</p>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Build Tool 6 section: Retirement Blueprint
   * Shows retirement profile, key metrics, and investment score.
   */
  _buildTool6Section(t6Data) {
    var html = '<div class="tool-section">';
    html += '<div class="tool-section-header">Tool 6: Retirement Blueprint</div>';

    // Profile
    if (t6Data.profileId) {
      html += '<p><strong>Your Profile:</strong> ' + t6Data.profileId + '</p>';
    }

    // Key metrics
    var metrics = [];
    if (t6Data.monthlyBudget) metrics.push({ label: 'Monthly Retirement Budget', value: '$' + Number(t6Data.monthlyBudget).toLocaleString() });
    if (t6Data.projectedBalance) metrics.push({ label: 'Projected Balance', value: '$' + Number(t6Data.projectedBalance).toLocaleString() });
    if (t6Data.investmentScore !== undefined) metrics.push({ label: 'Investment Score', value: t6Data.investmentScore + '/10' });
    if (t6Data.yearsToRetirement) metrics.push({ label: 'Years to Retirement', value: t6Data.yearsToRetirement + ' years' });
    if (t6Data.taxStrategy) metrics.push({ label: 'Tax Strategy', value: t6Data.taxStrategy });

    for (var m = 0; m < metrics.length; m++) {
      html += '<div class="metric-row">';
      html += '<span class="metric-label">' + metrics[m].label + '</span>';
      html += '<span class="metric-value">' + metrics[m].value + '</span>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Build Tool 8 section: Investment Planning
   * Shows scenario details, risk, projections, and feasibility.
   */
  _buildTool8Section(t8Data) {
    var html = '<div class="tool-section">';
    html += '<div class="tool-section-header">Tool 8: Investment Planning</div>';

    // Scenario name
    if (t8Data.scenarioName) {
      html += '<p><strong>Scenario:</strong> ' + t8Data.scenarioName + '</p>';
    }

    // Key metrics
    var metrics = [];
    if (t8Data.monthlyInvestment) metrics.push({ label: 'Monthly Investment', value: '$' + Number(t8Data.monthlyInvestment).toLocaleString() });
    if (t8Data.timeHorizon) metrics.push({ label: 'Time Horizon', value: t8Data.timeHorizon + ' years' });
    if (t8Data.risk !== undefined) {
      var riskLabel = t8Data.risk <= 3 ? 'Conservative' : (t8Data.risk <= 6 ? 'Moderate' : 'Aggressive');
      metrics.push({ label: 'Risk Level', value: riskLabel + ' (' + t8Data.risk + '/10)' });
    }
    if (t8Data.projectedBalance) metrics.push({ label: 'Projected Balance', value: '$' + Number(t8Data.projectedBalance).toLocaleString() });
    if (t8Data.feasibility) {
      var feasLabel = t8Data.feasibility === 'OK' ? 'On Track' : (t8Data.feasibility === 'WARN' ? 'Needs Attention' : 'At Risk');
      metrics.push({ label: 'Feasibility', value: feasLabel });
    }

    for (var m = 0; m < metrics.length; m++) {
      html += '<div class="metric-row">';
      html += '<span class="metric-label">' + metrics[m].label + '</span>';
      html += '<span class="metric-value">' + metrics[m].value + '</span>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Build a table-based percentage bar for GAS PDF compatibility.
   * GAS PDF renderer does not support nested-div height:100% or position:absolute.
   * Native HTML tables render reliably.
   *
   * @param {number} percent - Fill percentage (0-100)
   * @param {string} color - Hex color for the filled portion
   * @param {number} [height=14] - Bar height in pixels
   * @returns {string} HTML table element
   */
  _buildPercentageBar(percent, color, height) {
    var h = height || 14;
    var p = Math.max(0, Math.min(100, Math.round(percent)));
    var html = '<table style="width:100%;border-collapse:collapse;margin:4px 0;"><tr>';
    if (p > 0) {
      html += '<td style="width:' + p + '%;background:' + color + ';height:' + h + 'px;padding:0;"></td>';
    }
    if (p < 100) {
      html += '<td style="width:' + (100 - p) + '%;background:#f3f4f6;height:' + h + 'px;padding:0;"></td>';
    }
    html += '</tr></table>';
    return html;
  },

  /**
   * Build a table-based bipolar bar for Tool 1 scores (negative-to-positive, centered).
   * Left half = negative territory, right half = positive territory.
   * Center line uses a 1px-wide cell with gray background.
   *
   * @param {number} score - Raw score (can be negative or positive)
   * @returns {string} HTML table element
   */
  _buildBipolarBar(score) {
    var barWidth = Math.min(Math.abs(score) * 2, 50);
    var barColor = score > 0 ? '#ef4444' : '#22c55e';
    var html = '<table style="width:100%;border-collapse:collapse;margin:4px 0;"><tr>';

    if (score < 0) {
      var leftEmpty = 50 - barWidth;
      if (leftEmpty > 0) {
        html += '<td style="width:' + leftEmpty + '%;background:#f3f4f6;height:14px;padding:0;"></td>';
      }
      html += '<td style="width:' + barWidth + '%;background:' + barColor + ';height:14px;padding:0;"></td>';
      html += '<td style="width:1px;background:#9ca3af;height:14px;padding:0;"></td>';
      html += '<td style="width:50%;background:#f3f4f6;height:14px;padding:0;"></td>';
    } else if (score > 0) {
      var rightEmpty = 50 - barWidth;
      html += '<td style="width:50%;background:#f3f4f6;height:14px;padding:0;"></td>';
      html += '<td style="width:1px;background:#9ca3af;height:14px;padding:0;"></td>';
      html += '<td style="width:' + barWidth + '%;background:' + barColor + ';height:14px;padding:0;"></td>';
      if (rightEmpty > 0) {
        html += '<td style="width:' + rightEmpty + '%;background:#f3f4f6;height:14px;padding:0;"></td>';
      }
    } else {
      html += '<td style="width:50%;background:#f3f4f6;height:14px;padding:0;"></td>';
      html += '<td style="width:1px;background:#9ca3af;height:14px;padding:0;"></td>';
      html += '<td style="width:50%;background:#f3f4f6;height:14px;padding:0;"></td>';
    }

    html += '</tr></table>';
    return html;
  },

  _buildMissingSectionBox(description, instruction) {
    return '<div class="missing-section-box">' +
      '<p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">' + description + '</p>' +
      '<p style="color: #ad9168; font-size: 13px; font-weight: 500;">' + instruction + '</p>' +
    '</div>';
  }
};
