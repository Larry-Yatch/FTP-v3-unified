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

    // Tool 3: Identity & Validation Grounding Tool
    const tool3Manifest = {
      id: "tool3",
      version: "1.0.0",
      name: "Identity & Validation Grounding Tool",
      pattern: "multi-phase",
      route: "tool3",
      routes: ["/tool3"],
      description: "Grounding assessment revealing patterns of disconnection from self through false self-view and external validation",
      icon: "🪞",
      estimatedTime: "20-25 minutes",
      sections: 7,
      totalQuestions: 30,
      categories: ["false_self_view", "external_validation"],
      outputs: {
        report: true,
        email: true,
        insights: true
      },
      dependencies: ["tool2"],
      unlocks: ["tool4"]
    };

    Tool3.manifest = tool3Manifest;
    ToolRegistry.register('tool3', Tool3, tool3Manifest);

    // Tool 4: Financial Freedom Framework
    const tool4Manifest = {
      id: "tool4",
      version: "1.0.0",
      name: "Financial Freedom Framework",
      pattern: "calculator",
      route: "tool4",
      routes: ["/tool4"],
      description: "Interactive budget allocation calculator for optimal M/E/F/J allocation",
      icon: "💰",
      estimatedTime: "30 minutes",
      categories: ["budget_allocation", "financial_planning"],
      outputs: {
        report: true,
        pdf: true,
        scenarios: true
      },
      dependencies: [],  // Tools 1/2/3 optional (has backup questions)
      unlocks: ["tool5"]
    };

    Tool4.manifest = tool4Manifest;
    const tool4Registration = ToolRegistry.register('tool4', Tool4, tool4Manifest);
    console.log('Tool 4 registration result:', tool4Registration);

    // Tool 5: Love & Connection Grounding Tool
    const tool5Manifest = {
      id: "tool5",
      version: "1.0.0",
      name: "Love & Connection Grounding Tool",
      pattern: "multi-phase",
      route: "tool5",
      routes: ["/tool5"],
      description: "Grounding assessment revealing patterns of disconnection from others through issues showing and receiving love",
      icon: "💝",
      estimatedTime: "20-25 minutes",
      sections: 7,
      totalQuestions: 30,
      categories: ["issues_showing_love", "issues_receiving_love"],
      outputs: {
        report: true,
        email: true,
        insights: true
      },
      dependencies: ["tool4"],
      unlocks: ["tool6"]
    };

    Tool5.manifest = tool5Manifest;
    ToolRegistry.register('tool5', Tool5, tool5Manifest);

    // Tool 6: Retirement Blueprint Calculator
    const tool6Manifest = {
      id: "tool6",
      version: "1.0.0",
      name: "Retirement Blueprint Calculator",
      pattern: "calculator",
      route: "tool6",
      routes: ["/tool6"],
      description: "Interactive retirement vehicle allocation calculator with profile classification and tax-optimized recommendations",
      icon: "🏦",
      estimatedTime: "20-30 minutes",
      categories: ["retirement", "allocation", "tax-planning"],
      outputs: {
        report: true,
        pdf: true,
        scenarios: true
      },
      dependencies: ["tool4"],
      unlocks: ["tool7"]
    };

    Tool6.manifest = tool6Manifest;
    ToolRegistry.register('tool6', Tool6, tool6Manifest);

    // Tool 7: Security & Control Grounding Tool
    const tool7Manifest = {
      id: "tool7",
      version: "1.0.0",
      name: "Security & Control Grounding Tool",
      pattern: "multi-phase",
      route: "tool7",
      routes: ["/tool7"],
      description: "Grounding assessment revealing patterns of disconnection from trust through control and fear-based isolation",
      icon: "🛡️",
      estimatedTime: "20-25 minutes",
      sections: 7,
      totalQuestions: 30,
      categories: ["control_leading_to_isolation", "fear_leading_to_isolation"],
      outputs: {
        report: true,
        email: true,
        insights: true
      },
      dependencies: ["tool5"],
      unlocks: ["tool8"]
    };

    Tool7.manifest = tool7Manifest;
    ToolRegistry.register('tool7', Tool7, tool7Manifest);

    console.log('Tools registered successfully (Tool 1, Tool 2, Tool 3, Tool 4, Tool 5, Tool 6, Tool 7)');
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
  const result = PDFGenerator.generateTool1PDF(clientId);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool1',
      details: 'Downloaded Tool 1 PDF report'
    });
  }

  return result;
}

/**
 * Generate PDF for Tool 2 Financial Clarity Report
 * @param {string} clientId - Client ID
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool2PDF(clientId) {
  const result = PDFGenerator.generateTool2PDF(clientId);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool2',
      details: 'Downloaded Tool 2 PDF report'
    });
  }

  return result;
}

/**
 * Generate PDF for Tool 3 Identity & Validation Report
 * @param {string} clientId - Client ID
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool3PDF(clientId) {
  const result = PDFGenerator.generateTool3PDF(clientId);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool3',
      details: 'Downloaded Tool 3 PDF report'
    });
  }

  return result;
}

/**
 * Generate PDF for Tool 5 Love & Connection Report
 * @param {string} clientId - Client ID
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool5PDF(clientId) {
  const result = PDFGenerator.generateTool5PDF(clientId);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool5',
      details: 'Downloaded Tool 5 PDF report'
    });
  }

  return result;
}

/**
 * Generate PDF for Tool 7 Security & Control Report
 * @param {string} clientId - Client ID
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool7PDF(clientId) {
  const result = PDFGenerator.generateTool7PDF(clientId);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool7',
      details: 'Downloaded Tool 7 PDF report'
    });
  }

  return result;
}

/**
 * Generate PDF for Tool 4 Financial Freedom Framework Main Report
 * @param {string} clientId - Client ID
 * @param {Object} [allocationOverride] - Optional allocation percentages to use instead of recalculating
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool4MainPDF(clientId, allocationOverride) {
  const result = PDFGenerator.generateTool4MainPDF(clientId, allocationOverride);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool4',
      details: 'Downloaded Tool 4 Main PDF report'
    });
  }

  return result;
}

/**
 * Generate PDF for Tool 4 Scenario Comparison Report
 * @param {string} clientId - Client ID
 * @param {Object} scenario1 - First scenario data
 * @param {Object} scenario2 - Second scenario data
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool4ComparisonPDF(clientId, scenario1, scenario2) {
  const result = PDFGenerator.generateTool4ComparisonPDF(clientId, scenario1, scenario2);

  // Log PDF download activity if successful
  if (result.success) {
    DataService.logActivity(clientId, 'pdf_downloaded', {
      toolId: 'tool4',
      details: 'Downloaded Tool 4 Comparison PDF report'
    });
  }

  return result;
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
 * GROUNDING TOOLS: Trigger background GPT analysis
 * Called via google.script.run from GroundingFormBuilder.js
 * Runs subdomain analysis in background (non-blocking for user)
 *
 * @param {string} toolId - Tool identifier ('tool3', 'tool5', 'tool7')
 * @param {string} clientId - Client identifier
 * @param {string} subdomainKey - Subdomain key (e.g., 'subdomain_1_1')
 * @param {number} subdomainIndex - Index of subdomain (0-5)
 * @param {Object} formData - Form data from this subdomain page
 * @returns {Object} Result with success status
 */
function triggerGroundingGPTAnalysis(toolId, clientId, subdomainKey, subdomainIndex, formData) {
  try {
    Logger.log(`[GPT] Triggering analysis: ${toolId} - ${clientId} - ${subdomainKey}`);

    registerTools();

    // Get tool from registry
    const toolReg = ToolRegistry.get(toolId);
    if (!toolReg) {
      Logger.log(`[GPT] Tool not found: ${toolId}`);
      return { success: false, error: `Tool not found: ${toolId}` };
    }

    const tool = toolReg.module;
    const subdomain = tool.config.subdomains[subdomainIndex];

    if (!subdomain || subdomain.key !== subdomainKey) {
      Logger.log(`[GPT] Subdomain mismatch: expected ${subdomainKey}, got ${subdomain?.key}`);
      return { success: false, error: 'Subdomain configuration mismatch' };
    }

    // Extract responses for this subdomain (4 scale + 1 open response)
    const responses = {};
    const aspects = ['belief', 'behavior', 'feeling', 'consequence'];

    aspects.forEach(aspect => {
      const fieldName = `${subdomainKey}_${aspect}`;
      responses[aspect] = parseInt(formData[fieldName]);
      // Also capture the label text for GPT context
      responses[`${aspect}_label`] = formData[`${fieldName}_label`] || '';
    });

    const openResponseField = `${subdomainKey}_open_response`;
    responses.openResponse = formData[openResponseField] || '';

    // Calculate aspect scores for this subdomain
    const aspectScores = {};
    aspects.forEach(aspect => {
      aspectScores[aspect] = responses[aspect];
    });

    // Check if we have enough data for GPT analysis
    if (!responses.openResponse || responses.openResponse.trim().length < 10) {
      Logger.log(`[GPT] Skipping - insufficient open response for ${subdomainKey}`);
      return { success: true, skipped: true, reason: 'insufficient_open_response' };
    }

    // DUPLICATE PREVENTION: Check if we already analyzed this subdomain
    // Prevents duplicate API calls on back/forward navigation (Tool 2 pattern)
    const existingInsight = GroundingGPT.getCachedInsight(toolId, clientId, subdomainKey);
    if (existingInsight && existingInsight.source) {
      Logger.log(`✓ Insight already exists for ${subdomainKey} (source: ${existingInsight.source}), skipping GPT call`);
      return {
        success: true,
        cached: true,
        source: existingInsight.source
      };
    }

    // Get existing insights (for context in progressive chaining)
    // Only include insights from previous subdomains (not current one)
    const previousInsights = {};
    try {
      for (let i = 0; i < subdomainIndex; i++) {
        const prevSubdomain = tool.config.subdomains[i];
        const cached = GroundingGPT.getCachedInsight(toolId, clientId, prevSubdomain.key);
        if (cached) {
          previousInsights[prevSubdomain.key] = cached;
        }
      }
      Logger.log(`[GPT] Found ${Object.keys(previousInsights).length} previous insights for context`);
    } catch (e) {
      Logger.log(`[GPT] Could not retrieve previous insights: ${e.message}`);
    }

    // Call GroundingGPT to analyze this subdomain
    const insight = GroundingGPT.analyzeSubdomain({
      toolId: toolId,
      clientId: clientId,
      subdomainKey: subdomainKey,
      subdomainConfig: subdomain,
      responses: responses,
      aspectScores: aspectScores,
      previousInsights: previousInsights
    });

    Logger.log(`[GPT] Analysis complete: ${subdomainKey} (source: ${insight.source})`);

    return {
      success: true,
      source: insight.source,
      hasFallback: insight.source === 'fallback'
    };

  } catch (error) {
    Logger.log(`[GPT] Error in triggerGroundingGPTAnalysis: ${error.message}`);
    Logger.log(error.stack);
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
    } else if (reportRoute === 'tool3_report' && typeof Tool3Report !== 'undefined') {
      reportHtml = Tool3Report.render(clientId).getContent();
    } else if (reportRoute === 'tool5_report' && typeof Tool5Report !== 'undefined') {
      reportHtml = Tool5Report.render(clientId).getContent();
    } else if (reportRoute === 'tool7_report' && typeof Tool7Report !== 'undefined') {
      reportHtml = Tool7Report.render(clientId).getContent();
    } else {
      // Fallback - just return success message
      reportHtml = `
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px;">
          <h1>Assessment Complete!</h1>
          <p>Your results have been saved.</p>
          <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}"
             style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ad9168; color: white; text-decoration: none; border-radius: 6px;">
             Return to Dashboard
          </a>
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
  return NavigationHelpers.getDashboardPage(clientId);
}

/**
 * Get login page HTML for document.write() navigation (logout)
 * @param {string} message - Optional message to display
 * @returns {string} Login page HTML
 */
function getLoginPage(message) {
  return NavigationHelpers.getLoginPage(message);
}

/**
 * Get report page HTML for document.write() navigation
 * @param {string} clientId - Student ID
 * @param {string} toolId - Tool identifier (e.g., 'tool1')
 * @returns {string} Report HTML
 */
function getReportPage(clientId, toolId) {
  return NavigationHelpers.getReportPage(clientId, toolId);
}

/**
 * Get specific tool page HTML (for back/forward navigation without white flash)
 * @param {string} toolId - Tool identifier (e.g., 'tool2')
 * @param {string} clientId - Client ID
 * @param {number} page - Page number to load
 * @returns {string} Tool page HTML
 */
function getToolPageHtml(toolId, clientId, page) {
  return NavigationHelpers.getToolPageHtml(toolId, clientId, page);
}

/**
 * Get tool page HTML with options (editMode, clearDraft) for document.write() navigation
 * @param {string} toolId - Tool identifier (e.g., 'tool2')
 * @param {string} clientId - Client ID
 * @param {number} page - Page number to load
 * @param {Object} options - Additional options {editMode, clearDraft}
 * @returns {string} Tool page HTML
 */
function getToolPageWithOptions(toolId, clientId, page, options) {
  return NavigationHelpers.getToolPageWithOptions(toolId, clientId, page, options);
}

/**
 * Discard draft and return dashboard HTML for document.write() navigation
 * @param {string} clientId - Client ID
 * @param {string} toolId - Tool to discard draft for
 * @returns {string} Dashboard HTML
 */
function discardDraftAndGetDashboard(clientId, toolId) {
  return NavigationHelpers.discardDraftAndGetDashboard(clientId, toolId);
}

/**
 * Submit feedback/support request
 * Called from client-side via google.script.run
 * @param {Object} feedbackData - Feedback data from form
 * @returns {Object} Result with success status
 */
function submitFeedback(feedbackData) {
  try {
    Logger.log(`Feedback received from ${feedbackData.clientId}: ${feedbackData.type}`);

    // Log to FEEDBACK sheet
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    let feedbackSheet = ss.getSheetByName('FEEDBACK');

    // Create FEEDBACK sheet if it doesn't exist
    if (!feedbackSheet) {
      feedbackSheet = ss.insertSheet('FEEDBACK');
      feedbackSheet.appendRow([
        'Timestamp',
        'Client_ID',
        'Type',
        'Message',
        'Email',
        'Tool_ID',
        'Page',
        'URL',
        'User_Agent',
        'Status'
      ]);
      feedbackSheet.getRange(1, 1, 1, 10).setFontWeight('bold');
      Logger.log('Created FEEDBACK sheet');
    }

    // Add feedback row
    feedbackSheet.appendRow([
      new Date(feedbackData.timestamp),
      feedbackData.clientId,
      feedbackData.type,
      feedbackData.message,
      feedbackData.email || '',
      feedbackData.toolId,
      feedbackData.page,
      feedbackData.url,
      feedbackData.userAgent,
      'NEW'
    ]);

    SpreadsheetApp.flush();

    Logger.log('Feedback logged to spreadsheet successfully');

    return {
      success: true,
      message: 'Thank you for your feedback! We\'ll review it soon.'
    };

  } catch (error) {
    Logger.log(`Error submitting feedback: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Trigger function for new feedback submissions
 * Set up as an onEdit trigger in Apps Script to send email notifications
 * @param {Object} e - Edit event object
 */
function onFeedbackSubmitted(e) {
  try {
    // Check if event object exists (trigger vs manual run)
    if (!e || !e.range) {
      Logger.log('onFeedbackSubmitted: No event object (manually triggered or no edit)');
      return;
    }

    // Only process if edit happened in FEEDBACK sheet
    const sheet = e.source.getActiveSheet();
    if (sheet.getName() !== 'FEEDBACK') {
      return; // Not the FEEDBACK sheet, ignore
    }

    // Only process if a new row was added (column A = Timestamp)
    const range = e.range;
    if (range.getColumn() !== 1) {
      return; // Not timestamp column, ignore
    }

    const row = range.getRow();
    if (row <= 1) {
      return; // Header row, ignore
    }

    // Get the feedback data from the row
    const data = sheet.getRange(row, 1, 1, 10).getValues()[0];
    const timestamp = data[0];
    const clientId = data[1];
    const type = data[2];
    const message = data[3];
    const email = data[4];
    const toolId = data[5];
    const page = data[6];
    const url = data[7];
    const userAgent = data[8];
    const status = data[9];

    // Only send email for NEW feedback
    if (status !== 'NEW') {
      return;
    }

    // Format email
    const emailBody = `
New feedback received from TruPath Financial Assessment:

TYPE: ${type}
FROM: ${clientId}
${email ? `EMAIL: ${email}` : ''}
TIMESTAMP: ${timestamp}

MESSAGE:
${message}

CONTEXT:
- Tool: ${toolId}
- Page: ${page}
- URL: ${url}
- Browser: ${userAgent}

---
To mark as reviewed, change the Status column in the FEEDBACK sheet.
View feedback: ${e.source.getUrl()}#gid=${sheet.getSheetId()}
    `.trim();

    // Send email notification
    MailApp.sendEmail({
      to: 'support@trupathmastery.com',
      subject: `TruPath Feedback: ${type} from ${clientId}`,
      body: emailBody
    });

    Logger.log(`Email notification sent for feedback from ${clientId}`);

  } catch (error) {
    Logger.log(`Error in onFeedbackSubmitted trigger: ${error}`);
    // Don't throw error - we don't want to break the sheet edit
  }
}

/**
 * Test function to trigger email authorization
 * Run this once in Apps Script editor to authorize email permissions
 */
function testEmailAuthorization() {
  try {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: 'TruPath Email Test',
      body: 'Email authorization successful! Feedback system is now ready to use.'
    });
    Logger.log('✅ Email authorization successful');
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    Logger.log('❌ Email authorization failed: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Send daily summary email of today's feedback
 * Set up as a time-based trigger (daily, 9-10am recommended)
 */
function sendDailyFeedbackSummary() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const feedbackSheet = ss.getSheetByName('FEEDBACK');

    if (!feedbackSheet) {
      Logger.log('No FEEDBACK sheet found');
      return;
    }

    // Get all data
    const data = feedbackSheet.getDataRange().getValues();
    const headers = data[0];

    // Get today's date range (midnight to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find feedback from today
    const todaysFeedback = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const timestamp = new Date(row[0]); // Column A = Timestamp

      if (timestamp >= today && timestamp < tomorrow) {
        todaysFeedback.push({
          timestamp: timestamp,
          clientId: row[1],
          type: row[2],
          message: row[3],
          email: row[4],
          toolId: row[5],
          page: row[6],
          url: row[7],
          userAgent: row[8],
          status: row[9]
        });
      }
    }

    // If no feedback today, log and exit
    if (todaysFeedback.length === 0) {
      Logger.log('No feedback received today');
      return;
    }

    // Build email body
    let emailBody = `TruPath Daily Feedback Summary\n`;
    emailBody += `Date: ${Utilities.formatDate(today, Session.getScriptTimeZone(), 'MMMM dd, yyyy')}\n`;
    emailBody += `Total feedback received: ${todaysFeedback.length}\n`;
    emailBody += `\n${'='.repeat(70)}\n\n`;

    // Add each feedback item
    todaysFeedback.forEach((feedback, index) => {
      emailBody += `FEEDBACK #${index + 1}\n`;
      emailBody += `${'─'.repeat(70)}\n`;
      emailBody += `Type: ${feedback.type}\n`;
      emailBody += `From: ${feedback.clientId}\n`;
      if (feedback.email) {
        emailBody += `Email: ${feedback.email}\n`;
      }
      emailBody += `Time: ${Utilities.formatDate(feedback.timestamp, Session.getScriptTimeZone(), 'HH:mm:ss')}\n`;
      emailBody += `\nMessage:\n${feedback.message}\n`;
      emailBody += `\nContext:\n`;
      emailBody += `  Tool: ${feedback.toolId}\n`;
      emailBody += `  Page: ${feedback.page}\n`;
      emailBody += `  URL: ${feedback.url}\n`;
      emailBody += `  Browser: ${feedback.userAgent}\n`;
      emailBody += `  Status: ${feedback.status}\n`;
      emailBody += `\n${'='.repeat(70)}\n\n`;
    });

    // Add footer
    emailBody += `View all feedback: ${ss.getUrl()}#gid=${feedbackSheet.getSheetId()}\n`;

    // Send email
    MailApp.sendEmail({
      to: 'support@trupathmastery.com',
      subject: `TruPath Daily Feedback (${todaysFeedback.length} items) - ${Utilities.formatDate(today, Session.getScriptTimeZone(), 'MMM dd, yyyy')}`,
      body: emailBody
    });

    Logger.log(`✅ Daily summary sent: ${todaysFeedback.length} feedback items`);

  } catch (error) {
    Logger.log(`❌ Error in sendDailyFeedbackSummary: ${error}`);
    // Don't throw - we don't want the trigger to fail
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
// ADMIN DASHBOARD API
// ========================================
// Exposed functions for admin dashboard (called via google.script.run)
// No sessionToken needed - UserProperties is automatically user-scoped

/**
 * Check if admin is authenticated
 */
function checkAdminAuth() {
  return { authenticated: isAdminAuthenticated() };
}

/**
 * Admin login handler
 */
function adminLogin(username, password) {
  return handleAdminLogin(username, password);
}

/**
 * Get all students
 */
function getStudents() {
  return handleGetStudentsRequest();
}

/**
 * Add new student
 */
function addStudentViaAdmin(studentData) {
  return handleAddStudentRequest(studentData);
}

/**
 * Get student access
 */
function getStudentAccess(clientId) {
  return handleGetStudentAccessRequest(clientId);
}

/**
 * Unlock tool for student
 */
function unlockTool(clientId, toolId) {
  return handleUnlockToolRequest(clientId, toolId);
}

/**
 * Lock tool for student
 */
function lockTool(clientId, toolId, reason) {
  return handleLockToolRequest(clientId, toolId, reason);
}

/**
 * Get activity log
 */
function getActivityLog(filters) {
  return handleGetActivityLogRequest(filters);
}

/**
 * Update student status
 */
function updateStudentStatus(clientId, newStatus) {
  return handleUpdateStudentStatusRequest(clientId, newStatus);
}

/**
 * Admin logout
 */
function adminLogout() {
  return clearAdminSession();
}

/**
 * Get student tools with completion status
 */
function getStudentTools(clientId) {
  return handleGetStudentToolsRequest(clientId);
}

/**
 * Get tool report data
 */
function getToolReport(clientId, toolId) {
  return handleGetToolReportRequest(clientId, toolId);
}

/**
 * Get tool report HTML (formatted view for admins)
 */
function getToolReportHTML(clientId, toolId) {
  return handleGetToolReportHTMLRequest(clientId, toolId);
}

/**
 * Get tool completion analytics with date range
 */
function getToolCompletionAnalytics(startDate, endDate) {
  return handleGetToolCompletionAnalytics(startDate, endDate);
}

// ========================================
// ATTENDANCE TRACKING API
// ========================================

/**
 * Get all course calls
 */
function getCalls() {
  return handleGetCallsRequest();
}

/**
 * Get attendance for a specific call
 */
function getCallAttendance(callId) {
  return handleGetCallAttendanceRequest(callId);
}

/**
 * Get attendance for a specific student
 */
function getStudentAttendance(clientId) {
  return handleGetStudentAttendanceRequest(clientId);
}

/**
 * Update attendance status
 */
function updateAttendance(clientId, callId, status) {
  return handleUpdateAttendanceRequest(clientId, callId, status);
}

/**
 * Get attendance analytics
 */
function getAttendanceAnalytics() {
  return handleGetAttendanceAnalyticsRequest();
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
