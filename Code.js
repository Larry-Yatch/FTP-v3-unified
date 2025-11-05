/**
 * Code.js - Main entry point for Financial TruPath v3
 *
 * This is the ONLY place that Google Apps Script calls directly.
 * Everything else is delegated to the framework.
 */

/**
 * Include function for HTML templates
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    console.error('Include error for file:', filename, e);
    return '';
  }
}

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Admin Tools')
    .addItem('📊 Preview Legacy Tool 1 Migration', 'previewLegacyTool1Migration')
    .addItem('✅ Run Legacy Tool 1 Migration', 'runLegacyTool1Migration')
    .addSeparator()
    .addItem('📋 List All Students', 'menuListStudents')
    .addToUi();
}

/**
 * Menu helper for listing students
 */
function menuListStudents() {
  listStudents();
  const ui = SpreadsheetApp.getUi();
  ui.alert('Students Listed', 'Check the execution log (View → Logs) for the full list.', ui.ButtonSet.OK);
}

/**
 * Register all tools with the framework
 * This runs on every request to ensure tools are available
 */
function registerTools() {
  try {
    // Tool 1: Core Trauma Strategy Assessment
    const tool1Manifest = {
      id: "tool1",
      version: "1.0.0",
      name: "Core Trauma Strategy Assessment",
      pattern: "multi-phase",
      route: "tool1",
      routes: ["/tool1"],
      description: "Top-level psychological assessment to identify core trauma strategies",
      icon: "🧠",
      estimatedTime: "15-20 minutes",
      sections: 5,
      totalQuestions: 26,
      categories: ["FSV", "Control", "Showing", "ExVal", "Fear", "Receiving"],
      outputs: {
        report: true,
        email: true,
        insights: true
      },
      dependencies: [],
      unlocks: ["tool2"]
    };

    Tool1.manifest = tool1Manifest;
    ToolRegistry.register('tool1', Tool1, tool1Manifest);

    // Tool 2: Financial Clarity & Values Assessment
    const tool2Manifest = {
      id: "tool2",
      version: "1.0.0",
      name: "Financial Clarity & Values Assessment",
      pattern: "multi-phase",
      route: "tool2",
      routes: ["/tool2"],
      description: "Comprehensive assessment consolidating Financial Clarity, False Self, and External Validation",
      icon: "💰",
      estimatedTime: "20-30 minutes",
      sections: 5,
      totalQuestions: 30,
      categories: ["financial_clarity", "false_self", "external_validation"],
      outputs: {
        report: true,
        email: true,
        insights: true
      },
      dependencies: ["tool1"],
      unlocks: ["tool3"]
    };

    Tool2.manifest = tool2Manifest;
    ToolRegistry.register('tool2', Tool2, tool2Manifest);

    console.log('Tools registered successfully (Tool 1, Tool 2)');
  } catch (error) {
    console.error('Error registering tools:', error);
  }
}

/**
 * Main entry point for GET requests
 */
function doGet(e) {
  try {
    // Validate configuration
    const configValidation = validateConfig();
    if (!configValidation.valid) {
      return HtmlService.createHtmlOutput(`
        <h1>Configuration Error</h1>
        <ul>${configValidation.errors.map(e => `<li>${e}</li>`).join('')}</ul>
        <p>Please update Config.js with correct values.</p>
      `);
    }

    // Register tools
    registerTools();

    // Route the request
    return Router.route(e);

  } catch (error) {
    console.error('doGet error:', error);
    return HtmlService.createHtmlOutput(`
      <h1>Application Error</h1>
      <p>${error.toString()}</p>
      <pre>${error.stack || ''}</pre>
    `);
  }
}

/**
 * Main entry point for POST requests (form submissions)
 *
 * NOTE: Modern tools should use google.script.run with GET navigation
 * instead of POST to avoid iframe sandbox issues.
 *
 * This handler remains for backward compatibility and non-form routes.
 */
function doPost(e) {
  try {
    // Validate configuration
    const configValidation = validateConfig();
    if (!configValidation.valid) {
      return HtmlService.createHtmlOutput(`
        <h1>Configuration Error</h1>
        <ul>${configValidation.errors.map(e => `<li>${e}</li>`).join('')}</ul>
      `);
    }

    // Register tools
    registerTools();

    // Handle form submission based on route
    const route = e.parameter.route;

    // No POST routes currently in use
    // All form submissions use google.script.run + GET navigation

    // Default: unknown route
    return HtmlService.createHtmlOutput(`
      <h1>Error</h1>
      <p>Unknown POST route: ${route}</p>
      <p>Modern tools should use google.script.run instead of POST.</p>
      <a href="${ScriptApp.getService().getUrl()}">← Return to Home</a>
    `);

  } catch (error) {
    console.error('doPost error:', error);
    return HtmlService.createHtmlOutput(`
      <h1>Submission Error</h1>
      <p>${error.toString()}</p>
      <pre>${error.stack || ''}</pre>
    `);
  }
}

/**
 * Cancel edit draft (return to completed response)
 * Called from client-side via google.script.run
 */
function cancelEditDraft(clientId, toolId) {
  try {
    return DataService.cancelEditDraft(clientId, toolId);
  } catch (error) {
    Logger.log(`Error in cancelEditDraft: ${error}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Load response for editing
 * Called from client-side via google.script.run
 */
function loadResponseForEditing(clientId, toolId) {
  try {
    return DataService.loadResponseForEditing(clientId, toolId);
  } catch (error) {
    Logger.log(`Error in loadResponseForEditing: ${error}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Start fresh attempt (clear all drafts)
 * Called from client-side via google.script.run
 */
function startFreshAttempt(clientId, toolId) {
  try {
    return DataService.startFreshAttempt(clientId, toolId);
  } catch (error) {
    Logger.log(`Error in startFreshAttempt: ${error}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Generate PDF for Tool 1 report
 * Called from client-side via google.script.run
 */
function generateTool1PDF(clientId) {
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

    // Build HTML for PDF
    const studentName = results.formData.name || 'Student';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e192b; border-bottom: 3px solid #ad9168; padding-bottom: 10px; }
          h2 { color: #ad9168; margin-top: 25px; }
          h3 { color: #4b4166; margin-top: 20px; }
          p { line-height: 1.6; color: #333; }
          ul { margin: 15px 0 15px 25px; }
          li { margin: 8px 0; }
          .header { text-align: center; margin-bottom: 30px; }
          .intro { background: #f5f5f5; padding: 20px; border-left: 4px solid #ad9168; margin: 20px 0; }
          .scores { margin: 30px 0; }
          .score-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd; }
          .score-label { font-weight: 600; }
          .score-value { color: #ad9168; font-weight: 700; font-size: 18px; }
          .winner { background: #fff8e1; font-weight: 700; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ad9168; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TruPath Financial</h1>
          <h2>Core Trauma Strategy Assessment Report</h2>
          <p><strong>${studentName}</strong></p>
          <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="intro">
          ${Tool1Templates.commonIntro}
        </div>

        <div class="content">
          ${template.content}
        </div>

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

        <div class="footer">
          ${Tool1Templates.commonFooter}
        </div>
      </body>
      </html>
    `;

    // Create blob and convert to PDF
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf');
    const base64 = Utilities.base64Encode(pdf.getBytes());
    const fileName = `TruPath_CoreTraumaStrategy_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      success: true,
      pdf: base64,
      fileName: fileName,
      mimeType: 'application/pdf'
    };

  } catch (error) {
    Logger.log(`Error generating PDF: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate PDF for Tool 2 Financial Clarity Report
 * @param {string} clientId - Client ID
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool2PDF(clientId) {
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

    // Helper to format domain scores as percentages
    const formatScore = (score) => Math.round(score) + '%';

    // Helper to format GPT insights section
    const formatInsightCard = (title, insight) => {
      if (!insight || !insight.pattern) return '';

      const sourceLabel = insight.source === 'fallback' ? '📋 General Guidance' : '✨ Personalized';

      return `
        <div style="background: #f9f9f9; border-left: 4px solid #ad9168; padding: 20px; margin: 20px 0; page-break-inside: avoid;">
          <div style="text-align: right; font-size: 12px; color: #666; margin-bottom: 10px;">${sourceLabel}</div>
          <h3 style="color: #ad9168; margin-bottom: 15px;">${title}</h3>
          <div style="margin: 15px 0;">
            <strong style="color: #ad9168; text-transform: uppercase; font-size: 12px;">Pattern:</strong>
            <p style="margin: 5px 0;">${insight.pattern}</p>
          </div>
          <div style="margin: 15px 0;">
            <strong style="color: #ad9168; text-transform: uppercase; font-size: 12px;">Insight:</strong>
            <p style="margin: 5px 0;">${insight.insight}</p>
          </div>
          <div style="background: #fff8e1; padding: 15px; margin: 15px 0; border-left: 3px solid #ad9168;">
            <strong style="color: #ad9168; text-transform: uppercase; font-size: 12px;">Next Step:</strong>
            <p style="margin: 5px 0; font-weight: 600;">${insight.action}</p>
          </div>
        </div>
      `;
    };

    // Build HTML for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
          h1 { color: #1e192b; border-bottom: 3px solid #ad9168; padding-bottom: 10px; margin-bottom: 5px; }
          h2 { color: #ad9168; margin-top: 30px; margin-bottom: 15px; page-break-after: avoid; }
          h3 { color: #4b4166; margin-top: 20px; }
          p { margin: 10px 0; }
          ul, ol { margin: 15px 0 15px 25px; }
          li { margin: 8px 0; }
          .header { text-align: center; margin-bottom: 30px; }
          .intro { background: #f5f5f5; padding: 20px; border-left: 4px solid #ad9168; margin: 20px 0; }
          .domain-card { background: #f9f9f9; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ad9168; page-break-inside: avoid; }
          .score-value { font-size: 32px; font-weight: 700; color: #ad9168; }
          .archetype-box { background: linear-gradient(135deg, #1e192b 0%, #4b4166 100%); color: white; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; page-break-inside: avoid; }
          .archetype-icon { font-size: 48px; margin-bottom: 15px; }
          .archetype-name { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
          .priority-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #ad9168; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ad9168; font-size: 14px; color: #666; text-align: center; }
          @media print {
            body { padding: 20px; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>TruPath Financial</h1>
          <h2 style="margin-top: 0;">Financial Clarity & Values Assessment Report</h2>
          <p><strong>${studentName}</strong></p>
          <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Intro -->
        <div class="intro">
          <p>Thank you for completing the Financial Clarity & Values Assessment with TruPath. This report provides insight into your current financial clarity across five key domains, helping you understand where you're thriving and where focused attention could create the most impact.</p>
        </div>

        <!-- Growth Archetype -->
        <div class="archetype-box">
          <div class="archetype-icon">🎯</div>
          <div class="archetype-name">${archetype}</div>
          <p style="font-size: 16px; line-height: 1.6;">${Tool2Report.getArchetypeDescription(archetype)}</p>
        </div>

        <!-- Domain Scores -->
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

        <!-- Priority Focus Areas -->
        <div class="page-break"></div>
        <h2>Priority Focus Areas</h2>
        <p>Based on stress-weighted analysis, here are your domains ranked by potential impact:</p>
        ${priorityList.map((item, idx) => `
          <div class="priority-item">
            <strong>${idx + 1}. ${item.domain}</strong> - ${formatScore(item.score)}
            <p style="margin: 5px 0; font-size: 14px; color: #666;">Focus on this area for ${item.tier} impact</p>
          </div>
        `).join('')}

        <!-- Overall GPT Insights -->
        ${overallInsight.overview ? `
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
        ` : ''}

        <!-- Detailed GPT Insights -->
        ${Object.keys(gptInsights).length > 0 ? `
          <div class="page-break"></div>
          <h2>Personalized Insights</h2>
          ${gptInsights.income_sources ? formatInsightCard('💰 Income Sources', gptInsights.income_sources) : ''}
          ${gptInsights.major_expenses ? formatInsightCard('📊 Major Expenses', gptInsights.major_expenses) : ''}
          ${gptInsights.wasteful_spending ? formatInsightCard('🎯 Spending Patterns', gptInsights.wasteful_spending) : ''}
          ${gptInsights.debt_list ? formatInsightCard('📉 Debt Management', gptInsights.debt_list) : ''}
          ${gptInsights.investments ? formatInsightCard('📈 Investment Strategy', gptInsights.investments) : ''}
          ${gptInsights.emotions ? formatInsightCard('💭 Emotional Relationship with Money', gptInsights.emotions) : ''}
          ${gptInsights.adaptive_trauma ? formatInsightCard('🌱 Growth Opportunities', gptInsights.adaptive_trauma) : ''}
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>This assessment is the beginning of your financial clarity journey. Use these insights to guide conversations with your financial advisor and to set priorities for improving your financial confidence and well-being.</p>
          <p style="margin-top: 20px;"><strong>TruPath Financial</strong><br>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and convert to PDF
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf');
    const base64 = Utilities.base64Encode(pdf.getBytes());
    const fileName = `TruPath_FinancialClarity_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      success: true,
      pdf: base64,
      fileName: fileName,
      mimeType: 'application/pdf'
    };

  } catch (error) {
    Logger.log(`Error generating Tool 2 PDF: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * GENERIC: Save tool page data (called from client via google.script.run)
 * Works for ANY tool that implements savePageData()
 *
 * @param {string} toolId - Tool identifier (e.g., 'tool1', 'tool2')
 * @param {Object} data - Form data including client, page, and form fields
 * @returns {Object} Result with success status
 */
function saveToolPageData(toolId, data) {
  try {
    registerTools(); // Ensure tools are registered

    // Get tool from registry
    const toolReg = ToolRegistry.get(toolId);
    if (!toolReg) {
      return { success: false, error: `Tool not found: ${toolId}` };
    }

    const tool = toolReg.module;

    // Check if tool has savePageData method
    if (typeof tool.savePageData !== 'function') {
      return { success: false, error: `Tool ${toolId} does not support page data saving` };
    }

    // Call tool's savePageData
    tool.savePageData(data.client, parseInt(data.page), data);

    Logger.log(`Saved ${toolId} page ${data.page} for ${data.client}`);

    // Return the HTML for the NEXT page instead of just success
    // This allows client to replace document without navigation
    const nextPage = parseInt(data.page) + 1;
    const nextPageHtml = tool.render({
      clientId: data.client,
      page: nextPage
    });

    return {
      success: true,
      nextPageHtml: nextPageHtml.getContent()
    };

  } catch (error) {
    Logger.log(`Error saving ${toolId} page data: ${error}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * GENERIC: Complete tool submission (final page)
 * Works for ANY tool that implements processFinalSubmission()
 *
 * @param {string} toolId - Tool identifier
 * @param {Object} data - Complete form data
 * @returns {Object} Result with redirectUrl
 */
function completeToolSubmission(toolId, data) {
  try {
    registerTools();

    const toolReg = ToolRegistry.get(toolId);
    if (!toolReg) {
      return { success: false, error: `Tool not found: ${toolId}` };
    }

    const tool = toolReg.module;

    // Check if tool has processFinalSubmission method
    if (typeof tool.processFinalSubmission !== 'function') {
      return { success: false, error: `Tool ${toolId} does not support final submission` };
    }

    // CRITICAL: Save the final page data BEFORE processing
    // submitFinalPage() passes form data but it was never being saved!
    // This caused page 5 rankings to be missing from saved responses.
    const clientId = data.client;
    const page = parseInt(data.page) || 5;  // Default to last page if not specified

    if (typeof tool.savePageData === 'function') {
      Logger.log(`Saving final page ${page} data before processing`);
      tool.savePageData(clientId, page, data);
    }

    // Call tool's final submission handler
    const result = tool.processFinalSubmission(clientId);

    Logger.log(`Completed ${toolId} for ${clientId}`);

    // Instead of returning redirect URL, return the report HTML
    // Get the report HTML
    const reportRoute = `${toolId}_report`;
    let reportHtml;

    if (reportRoute === 'tool1_report' && typeof Tool1Report !== 'undefined') {
      reportHtml = Tool1Report.render(clientId).getContent();
    } else if (reportRoute === 'tool2_report' && typeof Tool2Report !== 'undefined') {
      reportHtml = Tool2Report.render(clientId).getContent();
    } else {
      // Fallback - just return success message
      reportHtml = `
        <html>
        <body>
          <h1>Assessment Complete!</h1>
          <p>Your results have been saved.</p>
          <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}">Return to Dashboard</a>
        </body>
        </html>
      `;
    }

    return {
      success: true,
      nextPageHtml: reportHtml
    };

  } catch (error) {
    Logger.log(`Error completing ${toolId} submission: ${error}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get dashboard page HTML (for document.write() navigation pattern)
 * @param {string} clientId - Client ID
 * @returns {string} Dashboard HTML
 */
function getDashboardPage(clientId) {
  try {
    registerTools();

    // Create fake request object for router
    const fakeRequest = {
      parameter: {
        route: 'dashboard',
        client: clientId
      }
    };

    // Get dashboard HTML from router
    const dashboardOutput = Router.route(fakeRequest);
    return dashboardOutput.getContent();

  } catch (error) {
    Logger.log(`Error getting dashboard: ${error}`);
    return `
      <html>
      <body>
        <h1>Error Loading Dashboard</h1>
        <p>${error.toString()}</p>
        <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}">Try Again</a>
      </body>
      </html>
    `;
  }
}

/**
 * Get report page HTML for document.write() navigation
 * @param {string} clientId - Student ID
 * @param {string} toolId - Tool identifier (e.g., 'tool1')
 * @returns {string} Report HTML
 */
function getReportPage(clientId, toolId) {
  try {
    registerTools();

    // Create fake request object for router
    const fakeRequest = {
      parameter: {
        route: `${toolId}_report`,
        client: clientId
      }
    };

    // Get report HTML from router
    const reportOutput = Router.route(fakeRequest);
    return reportOutput.getContent();

  } catch (error) {
    Logger.log(`Error getting report: ${error}`);
    return `
      <html>
      <body style="background: #1e192b; color: white; font-family: sans-serif; padding: 40px;">
        <h1>Error Loading Report</h1>
        <p>${error.toString()}</p>
        <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}" style="color: #ad9168;">Back to Dashboard</a>
      </body>
      </html>
    `;
  }
}

/**
 * Get specific tool page HTML (for back/forward navigation without white flash)
 * @param {string} toolId - Tool identifier (e.g., 'tool2')
 * @param {string} clientId - Client ID
 * @param {number} page - Page number to load
 * @returns {string} Tool page HTML
 */
function getToolPageHtml(toolId, clientId, page) {
  try {
    registerTools();

    // Create fake request object for router
    const fakeRequest = {
      parameter: {
        route: toolId,
        client: clientId,
        page: page.toString()
      }
    };

    // Get page HTML from router
    const pageOutput = Router.route(fakeRequest);
    return pageOutput.getContent();

  } catch (error) {
    Logger.log(`Error getting ${toolId} page ${page}: ${error}`);
    return `
      <html>
      <body style="background: #1e192b; color: white; font-family: sans-serif; padding: 40px;">
        <h1>Error Loading Page</h1>
        <p>${error.toString()}</p>
        <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}" style="color: #ad9168;">Back to Dashboard</a>
      </body>
      </html>
    `;
  }
}

/**
 * OPTIMIZED: Authenticate and get dashboard in one call (faster login)
 * @param {string} clientId - Student ID
 * @returns {Object} Result with dashboard HTML or error
 */
function authenticateAndGetDashboard(clientId) {
  try {
    // Authenticate first
    const authResult = lookupClientById(clientId);

    if (!authResult.success) {
      return authResult; // Return error from authentication
    }

    // Get dashboard HTML
    registerTools();
    const fakeRequest = {
      parameter: {
        route: 'dashboard',
        client: authResult.clientId
      }
    };

    const dashboardOutput = Router.route(fakeRequest);

    return {
      success: true,
      dashboardHtml: dashboardOutput.getContent()
    };

  } catch (error) {
    Logger.log(`Error in authenticateAndGetDashboard: ${error}`);
    return {
      success: false,
      error: 'System error during login. Please try again.'
    };
  }
}

/**
 * OPTIMIZED: Lookup by details and get dashboard in one call (faster backup login)
 * @param {Object} params - Object with firstName, lastName, email
 * @returns {Object} Result with dashboard HTML or error
 */
function lookupAndGetDashboard(params) {
  try {
    // Lookup first
    const lookupResult = lookupClientByDetails(params);

    if (!lookupResult.success) {
      return lookupResult; // Return error from lookup
    }

    // Get dashboard HTML
    registerTools();
    const fakeRequest = {
      parameter: {
        route: 'dashboard',
        client: lookupResult.clientId
      }
    };

    const dashboardOutput = Router.route(fakeRequest);

    return {
      success: true,
      dashboardHtml: dashboardOutput.getContent()
    };

  } catch (error) {
    Logger.log(`Error in lookupAndGetDashboard: ${error}`);
    return {
      success: false,
      error: 'System error during login. Please try again.'
    };
  }
}

/**
 * DEPRECATED: Use saveToolPageData() instead
 * Kept for backward compatibility
 */
function saveTool1Page(data) {
  return saveToolPageData('tool1', data);
}

/**
 * Initialize all Google Sheets
 * Run this once after creating your spreadsheet
 */
function initializeAllSheets() {
  try {
    console.log('Initializing all sheets...');

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);

    // Create sheets if they don't exist
    const sheets = [
      { name: CONFIG.SHEETS.SESSIONS, headers: ['Session_Token', 'Client_ID', 'Created_At', 'Expires_At', 'Last_Activity', 'IP_Address'] },
      { name: CONFIG.SHEETS.RESPONSES, headers: ['Timestamp', 'Client_ID', 'Tool_ID', 'Data', 'Version', 'Status'] },
      { name: CONFIG.SHEETS.TOOL_STATUS, headers: ['Client_ID', 'Tool_1_Status', 'Tool_1_Date', 'Tool_2_Status', 'Tool_2_Date', 'Tool_3_Status', 'Tool_3_Date', 'Tool_4_Status', 'Tool_4_Date', 'Tool_5_Status', 'Tool_5_Date', 'Tool_6_Status', 'Tool_6_Date', 'Tool_7_Status', 'Tool_7_Date', 'Tool_8_Status', 'Tool_8_Date', 'Last_Updated'] },
      { name: CONFIG.SHEETS.TOOL_ACCESS, headers: ['Client_ID', 'Tool_ID', 'Status', 'Prerequisites', 'Unlocked_Date', 'Locked_By', 'Lock_Reason'] },
      { name: CONFIG.SHEETS.CROSS_TOOL_INSIGHTS, headers: ['Timestamp', 'Client_ID', 'Source_Tool', 'Insight_Type', 'Priority', 'Content', 'Target_Tools', 'Condition_Data', 'Status'] },
      { name: CONFIG.SHEETS.INSIGHT_MAPPINGS, headers: ['Tool_ID', 'Insight_Type', 'Condition', 'Condition_Logic', 'Priority', 'Content_Template', 'Target_Tools', 'Adaptation_Type', 'Adaptation_Details'] },
      { name: CONFIG.SHEETS.ACTIVITY_LOG, headers: ['Timestamp', 'Client_ID', 'Action', 'Details', 'Tool_ID', 'Session_ID', 'IP_Address', 'User_Agent'] },
      { name: CONFIG.SHEETS.ADMINS, headers: ['Email', 'Name', 'Role', 'Created_At', 'Last_Login', 'Status'] },
      { name: CONFIG.SHEETS.CONFIG, headers: ['Key', 'Value', 'Type', 'Updated_At', 'Updated_By'] },
      { name: CONFIG.SHEETS.STUDENTS, headers: ['Client_ID', 'Name', 'Email', 'Status', 'Enrolled_Date', 'Last_Activity', 'Tools_Completed', 'Current_Tool'] }
    ];

    sheets.forEach(sheetConfig => {
      let sheet = ss.getSheetByName(sheetConfig.name);

      if (!sheet) {
        sheet = ss.insertSheet(sheetConfig.name);
        console.log(`Created sheet: ${sheetConfig.name}`);
      }

      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(sheetConfig.headers);
        sheet.getRange(1, 1, 1, sheetConfig.headers.length).setFontWeight('bold');
        console.log(`Added headers to: ${sheetConfig.name}`);
      }
    });

    console.log('✅ All sheets initialized successfully!');
    return { success: true, message: 'All sheets initialized' };

  } catch (error) {
    console.error('Error initializing sheets:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Add default insight mappings for Tool 1
 * Run this after initializeAllSheets()
 */
function addDefaultInsightMappings() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
      .getSheetByName(CONFIG.SHEETS.INSIGHT_MAPPINGS);

    if (!sheet) {
      throw new Error('InsightMappings sheet not found. Run initializeAllSheets() first.');
    }

    // Check if already has data
    if (sheet.getLastRow() > 1) {
      console.log('InsightMappings already has data. Skipping.');
      return { success: true, message: 'Mappings already exist' };
    }

    // Add Tool 1 example mappings
    const mappings = [
      [
        'tool1',
        'age_urgency',
        'age >= 55',
        JSON.stringify({ field: 'age', operator: '>=', value: 55 }),
        'HIGH',
        'Near retirement age ({age}) - urgent planning needed',
        JSON.stringify(['tool2', 'tool6']),
        'emphasize_section',
        JSON.stringify({ section: 'retirement_planning' })
      ],
      [
        'tool1',
        'high_debt',
        'totalDebt > 50000',
        JSON.stringify({ field: 'totalDebt', operator: '>', value: 50000 }),
        'HIGH',
        'High debt level (${totalDebt}) requires focused debt management',
        JSON.stringify(['tool2', 'tool3']),
        'add_questions',
        JSON.stringify({
          questions: [
            { id: 'debt_payoff_strategy', text: 'What is your current debt payoff strategy?' },
            { id: 'debt_interest_rates', text: 'What are the interest rates on your debts?' }
          ]
        })
      ],
      [
        'tool1',
        'high_stress',
        'financialStressLevel >= 7',
        JSON.stringify({ field: 'financialStressLevel', operator: '>=', value: 7 }),
        'HIGH',
        'High financial stress (level {financialStressLevel}) - simplifying approach',
        JSON.stringify(['tool2', 'tool3', 'tool7']),
        'skip_questions',
        JSON.stringify({ skip: ['advanced_investment_strategy', 'complex_tax_optimization'] })
      ]
    ];

    mappings.forEach(mapping => sheet.appendRow(mapping));

    console.log('✅ Added default insight mappings!');
    return { success: true, message: 'Default mappings added' };

  } catch (error) {
    console.error('Error adding mappings:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// TESTING FUNCTIONS
// ========================================

/**
 * Test Tool2 GPT integration with Tool1 trauma data
 */
function testTool2GPTWithTraumaData() {
  try {
    const testClientId = 'TEST_TRAUMA_GPT_' + new Date().getTime();
    
    // Simulate Tool1 trauma data
    const traumaData = {
      topTrauma: 'FSV',
      traumaScores: {
        FSV: 75,
        Control: 45,
        ExVal: 30,
        Fear: 20,
        Receiving: 35,
        Showing: 40
      }
    };
    
    // Test data
    const testFormData = {
      q18_income_sources: 'I work as a freelance designer but I don\'t really make that much. Just getting by.',
      q23_major_expenses: 'Rent, food, basic stuff. Nothing fancy.',
      q52_emotions: 'I feel ashamed about money. Like I should be doing better.'
    };
    
    Logger.log('Testing Tool2 GPT with trauma data...');
    Logger.log('Test Client: ' + testClientId);
    Logger.log('Primary Trauma: ' + traumaData.topTrauma);
    
    // Test individual analysis with trauma context
    const incomeInsight = Tool2GPTAnalysis.analyzeResponse({
      clientId: testClientId,
      responseType: 'income_sources',
      responseText: testFormData.q18_income_sources,
      previousInsights: {},
      formData: testFormData,
      domainScores: {moneyFlow: 35, obligations: 45, liquidity: 30, growth: 25, protection: 40},
      traumaData: traumaData
    });
    
    Logger.log('\nIncome Insight:');
    Logger.log('Source: ' + incomeInsight.source);
    Logger.log('Pattern: ' + incomeInsight.pattern);
    Logger.log('Insight: ' + incomeInsight.insight);
    Logger.log('Action: ' + incomeInsight.action);
    
    // Test synthesis with trauma data
    const synthesis = Tool2GPTAnalysis.synthesizeOverall(
      testClientId,
      {income_sources: incomeInsight},
      {moneyFlow: 35, obligations: 45, liquidity: 30, growth: 25, protection: 40},
      traumaData
    );
    
    Logger.log('\nSynthesis Overview:');
    Logger.log(synthesis.overview || 'No overview generated');
    
    Logger.log('\n✅ Test completed successfully');
    
    // Clean up test data
    PropertiesService.getUserProperties().deleteProperty(`tool2_gpt_${testClientId}`);
    
    return {
      success: true,
      insights: incomeInsight,
      synthesis: synthesis
    };
    
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// END OF CODE.JS
// ========================================
//
// ADMIN FUNCTIONS MOVED TO: AdminFunctions.js
//
// For administrative tasks (adding students, managing access, etc.),
// see AdminFunctions.js in the Apps Script Editor.
//
// Common admin tasks:
// - addStudent(clientId, name, email)
// - listStudents()
// - checkStudentAccess(clientId)
// - unlockToolForStudent(clientId, toolId)
//
// ========================================
