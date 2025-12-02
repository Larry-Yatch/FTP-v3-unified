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
   * Generic grounding tool PDF generator (used by Tool 3 and Tool 5)
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
   * Generate Tool 4 Main Report PDF
   */
  generateTool4MainPDF(clientId) {
    try {
      var preSurveyData = Tool4.getPreSurvey(clientId);
      if (!preSurveyData) return { success: false, error: 'No Tool 4 data found. Please complete the pre-survey first.' };

      var v1Input = Tool4.buildV1Input(clientId, preSurveyData);
      var allocation = Tool4.calculateAllocationV1(v1Input);
      if (!allocation || !allocation.percentages) return { success: false, error: 'Unable to calculate allocation' };

      var validationResults = Tool4.runFullValidation ? Tool4.runFullValidation(clientId, allocation.percentages, preSurveyData) : [];
      var tool1Data = this._getTool1Influences(clientId);
      var tool2Data = this._getTool2Influences(clientId);
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

      // Get GPT-powered personalized insights
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
            tool2Data: tool2Data
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
      var fileName = this.generateFileName('FinancialFreedomFramework', studentName);
      return this.htmlToPDF(htmlContent, fileName);

    } catch (error) {
      Logger.log('[PDFGenerator] Error generating Tool 4 Main PDF: ' + error);
      return { success: false, error: error.toString() };
    }
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

      // Get GPT-powered comparison insights
      var gptComparisonInsights = null;
      try {
        if (typeof Tool4GPTAnalysis !== 'undefined') {
          gptComparisonInsights = Tool4GPTAnalysis.generateComparisonInsights({
            clientId: clientId,
            scenario1: scenario1,
            scenario2: scenario2,
            preSurveyData: preSurveyData,
            comparisonData: comparisonData
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

      var comparisonTable = '<div class="page-break"></div><h2 style="font-size: 18px;">Allocation Comparison</h2>' +
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
  }
};
