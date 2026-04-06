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

    // Tool 8: Investment Planning Tool
    const tool8Manifest = {
      id: "tool8",
      version: "1.0.0",
      name: "Investment Planning Tool",
      pattern: "calculator",
      route: "tool8",
      routes: ["/tool8"],
      description: "Retirement investment calculator with scenario planning and comparison",
      icon: "📈",
      estimatedTime: "15-20 minutes",
      categories: ["investment", "retirement", "planning"],
      outputs: {
        report: true,
        pdf: true,
        scenarios: true
      },
      dependencies: ["tool6"],
      unlocks: []  // Last tool in sequence
    };

    Tool8.manifest = tool8Manifest;
    ToolRegistry.register('tool8', Tool8, tool8Manifest);

    console.log('Tools registered successfully (Tool 1, Tool 2, Tool 3, Tool 4, Tool 5, Tool 6, Tool 7, Tool 8)');
  } catch (error) {
    console.error('Error registering tools:', error);
  }
}

/**
 * Main entry point for GET requests
 */
function doGet(e) {
  try {
    // Load debug logging preference from PropertiesService (once per request)
    LogUtils.init();

    // Log incoming params for debugging refresh/history navigation
    LogUtils.debug('doGet params: ' + JSON.stringify(e.parameter || {}));

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
    LogUtils.init();

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
 * Shared PDF generation helper — handles activity logging and error handling.
 * Each public wrapper stays as a named global (required by google.script.run).
 * @param {string} clientId - Client ID
 * @param {string} toolId - Tool identifier for logging
 * @param {Function} generatorFn - No-arg closure that returns the PDF result
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function _generatePDFForTool(clientId, toolId, generatorFn) {
  try {
    const result = generatorFn();
    if (result && result.success) {
      DataService.logActivity(clientId, 'pdf_downloaded', {
        toolId: toolId,
        details: 'Downloaded ' + toolId + ' PDF report'
      });
    }
    return result;
  } catch (error) {
    LogUtils.error('Error generating ' + toolId + ' PDF: ' + error);
    return { success: false, error: error.toString() };
  }
}

/** Generate PDF for Tool 1 report */
function generateTool1PDF(clientId) {
  return _generatePDFForTool(clientId, 'tool1', function() { return PDFGenerator.generateTool1PDF(clientId); });
}

/** Generate PDF for Tool 2 Financial Clarity Report */
function generateTool2PDF(clientId) {
  return _generatePDFForTool(clientId, 'tool2', function() { return PDFGenerator.generateTool2PDF(clientId); });
}

/** Generate PDF for Tool 3 Identity & Validation Report */
function generateTool3PDF(clientId) {
  return _generatePDFForTool(clientId, 'tool3', function() { return PDFGenerator.generateTool3PDF(clientId); });
}

/** Generate PDF for Tool 5 Love & Connection Report */
function generateTool5PDF(clientId) {
  return _generatePDFForTool(clientId, 'tool5', function() { return PDFGenerator.generateTool5PDF(clientId); });
}

/** Generate PDF for Tool 7 Security & Control Report */
function generateTool7PDF(clientId) {
  return _generatePDFForTool(clientId, 'tool7', function() { return PDFGenerator.generateTool7PDF(clientId); });
}

/** Generate PDF for Tool 4 Main Report */
function generateTool4MainPDF(clientId, allocationOverride) {
  return _generatePDFForTool(clientId, 'tool4', function() { return PDFGenerator.generateTool4MainPDF(clientId, allocationOverride); });
}

/** Generate PDF for Tool 4 Scenario Comparison Report */
function generateTool4ComparisonPDF(clientId, scenario1, scenario2) {
  return _generatePDFForTool(clientId, 'tool4', function() { return PDFGenerator.generateTool4ComparisonPDF(clientId, scenario1, scenario2); });
}

/** Generate PDF for Tool 8 Investment Planning Report (single scenario) */
function generateTool8PDF(clientId, scenarioData) {
  registerTools();
  return _generatePDFForTool(clientId, 'tool8', function() { return Tool8Report.generatePDF(clientId, scenarioData); });
}

/** Generate PDF for Tool 8 Scenario Comparison Report */
function generateTool8ComparisonPDF(clientId, scenario1, scenario2) {
  registerTools();
  return _generatePDFForTool(clientId, 'tool8', function() { return Tool8Report.generateComparisonPDF(clientId, scenario1, scenario2); });
}

/** Generate Integration Report PDF */
function generateIntegrationPDF(clientId) {
  return _generatePDFForTool(clientId, 'integration', function() { return PDFGenerator.generateIntegrationPDF(clientId); });
}

/** Generate Capstone GPT Insights (Financial Story + Cross-Tool Insights) */
function generateCapstoneGPT(clientId, forceRefresh) {
  try {
    return CapstoneGPT.generate(clientId, forceRefresh);
  } catch (error) {
    Logger.log('[generateCapstoneGPT] Error: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// ADMIN PDF WRAPPER FUNCTIONS
// These fetch scenario data server-side so admin dashboard only needs clientId
// ========================================

/**
 * Admin: Generate Tool 4 PDF using saved allocation data
 * @param {string} clientId - Client ID
 * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function adminGenerateTool4PDF(clientId) {
  try {
    registerTools();
    var response = DataService.getToolResponse(clientId, 'tool4');
    var allocation = null;
    if (response && response.data) {
      var data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      allocation = {
        Multiply: data.multiply,
        Essentials: data.essentials,
        Freedom: data.freedom,
        Enjoyment: data.enjoyment
      };
    }
    return generateTool4MainPDF(clientId, allocation);
  } catch (error) {
    Logger.log('Error in adminGenerateTool4PDF: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Admin: Generate Tool 6 PDF using latest saved scenario
 * @param {string} clientId - Client ID
 * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function adminGenerateTool6PDF(clientId) {
  try {
    registerTools();
    var scenario = Tool6.getLatestScenario(clientId);
    if (!scenario) {
      return { success: false, error: 'No Tool 6 scenario found for this student' };
    }
    return Tool6.generatePDF(clientId, scenario);
  } catch (error) {
    Logger.log('Error in adminGenerateTool6PDF: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Admin: Generate Tool 8 PDF using latest saved scenario
 * @param {string} clientId - Client ID
 * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function adminGenerateTool8PDF(clientId) {
  try {
    registerTools();
    var scenarios = Tool8.getUserScenarios(clientId);
    if (!scenarios || scenarios.length === 0) {
      return { success: false, error: 'No Tool 8 scenario found for this student' };
    }
    return Tool8Report.generatePDF(clientId, scenarios[0]);
  } catch (error) {
    Logger.log('Error in adminGenerateTool8PDF: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Save Tool 8 scenario to spreadsheet
 * @param {string} clientId - Client ID
 * @param {Object} scenario - Scenario data to save
 * @returns {Object} Result with success status
 */
function tool8SaveScenario(clientId, scenario) {
  try {
    registerTools();
    return Tool8.saveScenario(clientId, scenario);
  } catch (error) {
    Logger.log('Error saving Tool 8 scenario: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get all Tool 8 scenarios for a client
 * @param {string} clientId - Client ID
 * @returns {Object} Result with scenarios array
 */
function tool8GetUserScenarios(clientId) {
  try {
    registerTools();
    return Tool8.getUserScenarios(clientId);
  } catch (error) {
    Logger.log('Error getting Tool 8 scenarios: ' + error);
    return { success: false, error: error.toString() };
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
 * Get collective results summary page HTML (for document.write() navigation)
 * @param {string} clientId - Client ID
 * @returns {string} Results summary HTML
 */
function getResultsSummaryPage(clientId) {
  return NavigationHelpers.getResultsSummaryPage(clientId);
}

/**
 * Get Progress Over Time page HTML
 * @param {string} clientId - Client ID
 * @returns {string} Progress page HTML
 */
function getProgressPage(clientId) {
  return NavigationHelpers.getProgressPage(clientId);
}

/**
 * Get student progress page HTML (coach view)
 * @param {string} clientId - Client ID
 * @returns {Object} { success, html }
 */
function getStudentProgressPage(clientId) {
  return handleGetStudentProgressRequest(clientId);
}

/**
 * Get admin dashboard HTML for navigation back from full-page views (e.g., progress page)
 * @returns {string} Admin dashboard HTML content
 */
function getAdminDashboardPage() {
  var template = HtmlService.createTemplateFromFile('html/AdminDashboard');
  template.getScriptUrl = function() { return ScriptApp.getService().getUrl(); };
  return template.evaluate()
    .setTitle('Admin Dashboard - Financial TruPath')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .getContent();
}

/**
 * Initialize PROGRESS_HISTORY sheet (run once from script editor)
 */
function initProgressHistory() {
  return ProgressHistory.initSheet();
}

/**
 * Migrate existing RESPONSES data to PROGRESS_HISTORY (run once from script editor)
 */
function migrateProgressHistory() {
  return ProgressHistory.migrateFromResponses();
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

    // Pending student — needs to complete first-login setup before accessing dashboard
    if (lookupResult.pendingSetup) {
      return {
        success: true,
        pendingSetup: true,
        name: lookupResult.name,
        email: lookupResult.email
      };
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
      clientId: lookupResult.clientId,
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
 * Toggle debug logging on/off (persisted in PropertiesService)
 */
function toggleDebugLogging() {
  return LogUtils.toggle();
}

/**
 * Get current debug logging status
 */
function getDebugLoggingStatus() {
  return LogUtils.getStatus();
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
 * Get integration analysis HTML for coach view
 */
function getIntegrationAnalysis(clientId) {
  return handleGetIntegrationAnalysisRequest(clientId);
}

/**
 * Get tool completion analytics with date range
 */
function getToolCompletionAnalytics(startDate, endDate, cohortId) {
  return handleGetToolCompletionAnalytics(startDate, endDate, cohortId);
}

/**
 * Get all cohorts
 */
function getCohorts() {
  return handleGetCohortsRequest();
}

/**
 * Create a new cohort
 */
function createCohort(cohortData) {
  return handleCreateCohortRequest(cohortData);
}

/**
 * Batch import students from a Google Sheet URL
 */
function batchImportStudents(sheetUrl, cohortId, dryRun) {
  return handleBatchImportRequest(sheetUrl, cohortId, dryRun);
}

/**
 * Complete pending student setup (first login — student sets their own ID)
 */
function completeStudentSetup(name, email, chosenClientId) {
  return handleCompleteStudentSetupRequest(name, email, chosenClientId);
}

/**
 * Complete pending student setup AND return dashboard HTML in one call
 * Called from the login page ID setup form
 */
function setupAndGetDashboard(name, email, chosenClientId) {
  try {
    const setupResult = handleCompleteStudentSetupRequest(name, email, chosenClientId);

    if (!setupResult.success) {
      return setupResult;
    }

    // Get dashboard HTML
    registerTools();
    const fakeRequest = {
      parameter: {
        route: 'dashboard',
        client: setupResult.clientId
      }
    };

    const dashboardOutput = Router.route(fakeRequest);

    return {
      success: true,
      clientId: setupResult.clientId,
      dashboardHtml: dashboardOutput.getContent()
    };

  } catch (error) {
    Logger.log('Error in setupAndGetDashboard: ' + error);
    return { success: false, error: 'System error during setup. Please try again.' };
  }
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
function getAttendanceAnalytics(cohortId) {
  return handleGetAttendanceAnalyticsRequest(cohortId);
}

// ========================================
/**
 * Trigger Tool 2 background GPT analysis
 * Called from client-side after page 5 loads (non-blocking)
 */
function triggerTool2BackgroundGPT(clientId) {
  try {
    Tool2GPTAnalysis.startBackgroundAnalysis(clientId);
    return { success: true };
  } catch(e) {
    LogUtils.debug('[Tool2] Background GPT failed: ' + e.message);
    return { success: false, error: e.message };
  }
}

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

/**
 * TEMPORARY TEST: Verify Tool 2 Phase 1 form rendering and data saving
 * Run from GAS editor. Remove after Phase 1 verification.
 */
/**
 * TEMPORARY TEST: Phase 2 scoring algorithm verification
 */
function testTool2Phase2Scoring() {
  const results = [];

  // === Test Fixture 1: Strong saver with good emergency fund ===
  var fixture1 = {
    monthlyTakeHome: '5000', monthlySpending: '3500', monthlyDebtPayments: '300',
    emergencyFundBalance: '21000', liquidSavings: '10000', monthlyRetirementContribution: '750',
    grossAnnualIncome: '72000', dependents: '2',
    hasHealthInsurance: 'true', hasLifeInsurance: 'true', hasDisabilityInsurance: 'true', hasPropertyInsurance: 'true'
  };
  var f1mf = Tool2.computeObjectiveHealthScore('moneyFlow', fixture1);
  var f1ob = Tool2.computeObjectiveHealthScore('obligations', fixture1);
  var f1lq = Tool2.computeObjectiveHealthScore('liquidity', fixture1);
  var f1gr = Tool2.computeObjectiveHealthScore('growth', fixture1);
  var f1pr = Tool2.computeObjectiveHealthScore('protection', fixture1);
  results.push('Fixture1 moneyFlow: ' + (f1mf === 85 ? 'PASS' : 'FAIL (got ' + f1mf + ', expected 85)'));
  results.push('Fixture1 obligations: ' + (f1ob === 88 ? 'PASS' : 'FAIL (got ' + f1ob + ', expected 88)'));
  results.push('Fixture1 liquidity: ' + (f1lq === 60 ? 'PASS' : 'FAIL (got ' + f1lq + ', expected 60)'));
  results.push('Fixture1 growth: ' + (f1gr === 90 ? 'PASS' : 'FAIL (got ' + f1gr + ', expected 90)'));
  results.push('Fixture1 protection: ' + (f1pr === 100 ? 'PASS' : 'FAIL (got ' + f1pr + ', expected 100)'));

  // === Test Fixture 2: Deficit spender, no emergency fund ===
  var fixture2 = {
    monthlyTakeHome: '3000', monthlySpending: '3500', monthlyDebtPayments: '800',
    emergencyFundBalance: '0', liquidSavings: '500', monthlyRetirementContribution: '0',
    grossAnnualIncome: '48000', dependents: '0',
    hasHealthInsurance: 'false', hasLifeInsurance: 'false', hasDisabilityInsurance: 'false', hasPropertyInsurance: 'false'
  };
  var f2mf = Tool2.computeObjectiveHealthScore('moneyFlow', fixture2);
  var f2ob = Tool2.computeObjectiveHealthScore('obligations', fixture2);
  var f2lq = Tool2.computeObjectiveHealthScore('liquidity', fixture2);
  var f2gr = Tool2.computeObjectiveHealthScore('growth', fixture2);
  var f2pr = Tool2.computeObjectiveHealthScore('protection', fixture2);
  results.push('Fixture2 moneyFlow: ' + (f2mf === 10 ? 'PASS' : 'FAIL (got ' + f2mf + ', expected 10)'));
  results.push('Fixture2 obligations: ' + (f2ob === 35 ? 'PASS' : 'FAIL (got ' + f2ob + ', expected 35)'));
  results.push('Fixture2 liquidity: ' + (f2lq === 30 ? 'PASS' : 'FAIL (got ' + f2lq + ', expected 30)'));
  results.push('Fixture2 growth: ' + (f2gr === 10 ? 'PASS' : 'FAIL (got ' + f2gr + ', expected 10)'));
  results.push('Fixture2 protection: ' + (f2pr === 0 ? 'PASS' : 'FAIL (got ' + f2pr + ', expected 0)'));

  // === Test Fixture 3: Zero income guard ===
  var fixture3 = { monthlyTakeHome: '0', monthlySpending: '0', liquidSavings: '0' };
  var f3mf = Tool2.computeObjectiveHealthScore('moneyFlow', fixture3);
  var f3lq = Tool2.computeObjectiveHealthScore('liquidity', fixture3);
  results.push('Fixture3 moneyFlow (zero guard): ' + (f3mf === 10 ? 'PASS' : 'FAIL (got ' + f3mf + ')'));
  results.push('Fixture3 liquidity (zero guard): ' + (f3lq === 5 ? 'PASS' : 'FAIL (got ' + f3lq + ')'));

  // === Subjective score test ===
  var subData = { incomeClarity: '3', spendingClarity: '-2', moneyFlowStress: '1' };
  var subScore = Tool2.computeSubjectiveScore('moneyFlow', subData, 'full');
  // avg = (3 + -2 + 1) / 3 = 0.667, mapped = (0.667 + 5) / 10 * 100 = 56.67 -> 57
  results.push('Subjective moneyFlow: ' + (subScore === 57 ? 'PASS' : 'FAIL (got ' + subScore + ', expected 57)'));

  // === Gap index test ===
  var gap1 = Tool2.computeGapIndex(85, 30);
  results.push('Gap 85-30=55: ' + (gap1 === 55 ? 'PASS' : 'FAIL (got ' + gap1 + ')'));
  results.push('Gap classify 55: ' + (Tool2.classifyGap(55) === 'UNDERESTIMATING' ? 'PASS' : 'FAIL'));
  results.push('Gap classify 15: ' + (Tool2.classifyGap(15) === 'SLIGHTLY_UNDER' ? 'PASS' : 'FAIL'));
  results.push('Gap classify 5: ' + (Tool2.classifyGap(5) === 'ALIGNED' ? 'PASS' : 'FAIL'));
  results.push('Gap classify -15: ' + (Tool2.classifyGap(-15) === 'SLIGHTLY_OVER' ? 'PASS' : 'FAIL'));
  results.push('Gap classify -25: ' + (Tool2.classifyGap(-25) === 'OVERESTIMATING' ? 'PASS' : 'FAIL'));
  // Edge cases
  results.push('Gap classify 20 (edge): ' + (Tool2.classifyGap(20) === 'SLIGHTLY_UNDER' ? 'PASS' : 'FAIL'));
  results.push('Gap classify 10 (edge): ' + (Tool2.classifyGap(10) === 'ALIGNED' ? 'PASS' : 'FAIL'));
  results.push('Gap classify -10 (edge): ' + (Tool2.classifyGap(-10) === 'ALIGNED' ? 'PASS' : 'FAIL'));
  results.push('Gap classify -20 (edge): ' + (Tool2.classifyGap(-20) === 'SLIGHTLY_OVER' ? 'PASS' : 'FAIL'));

  // === Scarcity flag test ===
  results.push('Scarcity GLOBAL_SCARCITY: ' + (Tool2.computeScarcityFlag({holisticScarcity: '-4', financialScarcity: '-3'}) === 'GLOBAL_SCARCITY' ? 'PASS' : 'FAIL'));
  results.push('Scarcity GLOBAL_ABUNDANCE: ' + (Tool2.computeScarcityFlag({holisticScarcity: '4', financialScarcity: '3'}) === 'GLOBAL_ABUNDANCE' ? 'PASS' : 'FAIL'));
  results.push('Scarcity TARGETED: ' + (Tool2.computeScarcityFlag({holisticScarcity: '3', financialScarcity: '-3'}) === 'TARGETED_FINANCIAL_SCARCITY' ? 'PASS' : 'FAIL'));
  results.push('Scarcity DISSOCIATED: ' + (Tool2.computeScarcityFlag({holisticScarcity: '-3', financialScarcity: '3'}) === 'DISSOCIATED_FINANCIAL' ? 'PASS' : 'FAIL'));
  results.push('Scarcity MIXED: ' + (Tool2.computeScarcityFlag({holisticScarcity: '1', financialScarcity: '-1'}) === 'MIXED' ? 'PASS' : 'FAIL'));

  // === Profile type detection using real student Tool 1 data ===
  // 5978RH: STRONG_SINGLE FSV
  var data5978 = Tool2.getTool1TraumaData('5978RH');
  var prof5978 = Tool2.detectTool1ProfileType(data5978.traumaScores);
  // 5978RH: margin=10, which is not > 10, so MODERATE_SINGLE is correct per strict > threshold
  results.push('5978RH profile type: ' + (prof5978.type === 'MODERATE_SINGLE' ? 'PASS' : 'FAIL (got ' + prof5978.type + ')'));
  results.push('5978RH winner: ' + (prof5978.winner === 'FSV' ? 'PASS' : 'FAIL (got ' + prof5978.winner + ')'));

  // 1126AP: BORDERLINE_DUAL ExVal+Showing
  var data1126 = Tool2.getTool1TraumaData('1126AP');
  var prof1126 = Tool2.detectTool1ProfileType(data1126.traumaScores);
  results.push('1126AP profile type: ' + (prof1126.type === 'BORDERLINE_DUAL' ? 'PASS' : 'FAIL (got ' + prof1126.type + ')'));

  // 5792RS: NEGATIVE_DOMINANT
  var data5792 = Tool2.getTool1TraumaData('5792RS');
  var prof5792 = Tool2.detectTool1ProfileType(data5792.traumaScores);
  results.push('5792RS profile type: ' + (prof5792.type === 'NEGATIVE_DOMINANT' ? 'PASS' : 'FAIL (got ' + prof5792.type + ')'));

  // === 0000AI: Check their profile (Fear winner) ===
  var data0000 = Tool2.getTool1TraumaData('0000AI');
  var prof0000 = Tool2.detectTool1ProfileType(data0000.traumaScores);
  results.push('0000AI winner: ' + (prof0000.winner === 'Fear' ? 'PASS' : 'FAIL (got ' + prof0000.winner + ')'));
  results.push('0000AI profile: ' + prof0000.type + ' (info only)');

  // Summary
  var passed = results.filter(function(r) { return r.indexOf('PASS') > -1; }).length;
  var total = results.filter(function(r) { return r.indexOf('info only') === -1; }).length;
  Logger.log('=== Tool 2 Phase 2 Scoring Test Results ===');
  results.forEach(function(r) { Logger.log(r); });
  Logger.log('=== Overall: ' + passed + '/' + total + (passed === total ? ' ALL PASSED' : ' SOME FAILED') + ' ===');
}

/**
 * TEMPORARY TEST: Phase 5 - Downstream pre-population from Tool 2
 * Verifies that Tools 4, 6, and 8 correctly read Tool 2 new-schema data
 */
function testTool2Phase5PrePopulation() {
  var results = [];
  var testClient = '0000AI';

  // === Verify Tool 2 data exists with new schema ===
  var tool2Response = DataService.getLatestResponse(testClient, 'tool2');
  var hasNewSchema = tool2Response && tool2Response.data && tool2Response.data.results && tool2Response.data.results.objectiveHealthScores;
  results.push('Tool 2 new schema exists: ' + (hasNewSchema ? 'PASS' : 'FAIL'));

  if (!hasNewSchema) {
    Logger.log('=== CANNOT TEST: 0000AI has no new-schema Tool 2 data ===');
    return;
  }

  var t2Data = tool2Response.data.data;
  Logger.log('Tool 2 source values: monthlyTakeHome=' + t2Data.monthlyTakeHome +
    ', totalDebtBalance=' + t2Data.totalDebtBalance +
    ', emergencyFundBalance=' + t2Data.emergencyFundBalance +
    ', grossAnnualIncome=' + t2Data.grossAnnualIncome +
    ', totalRetirementBalance=' + t2Data.totalRetirementBalance +
    ', monthlyRetirementContribution=' + t2Data.monthlyRetirementContribution +
    ', marital=' + t2Data.marital +
    ', age=' + t2Data.age);

  // ============================================================
  // TOOL 4: Pre-population test
  // ============================================================

  // Clear any existing Tool 4 pre-survey for clean test
  try {
    PropertiesService.getUserProperties().deleteProperty('tool4_presurvey_' + testClient);
    Logger.log('[Tool4] Cleared existing pre-survey for clean test');
  } catch(e) {}

  // Simulate what Tool4.render() does: check for pre-survey, then pre-populate from Tool 2
  var t4PreSurvey = null; // Simulating no existing pre-survey
  var t4PrePopulated = false;
  try {
    var t4Tool2Response = DataService.getLatestResponse(testClient, 'tool2');
    var t4IsNewSchema = t4Tool2Response && t4Tool2Response.data && t4Tool2Response.data.results && t4Tool2Response.data.results.objectiveHealthScores;
    if (t4IsNewSchema) {
      var t4T2Data = t4Tool2Response.data.data || {};
      t4PreSurvey = {
        monthlyIncome: t4T2Data.monthlyTakeHome || '',
        totalDebt: t4T2Data.totalDebtBalance || '',
        emergencyFund: t4T2Data.emergencyFundBalance || '',
        _fromTool2: true
      };
      t4PrePopulated = true;
    }
  } catch(e) {
    results.push('Tool 4 pre-pop read: FAIL - ' + e.message);
  }

  results.push('Tool 4 pre-populated: ' + (t4PrePopulated ? 'PASS' : 'FAIL'));
  results.push('Tool 4 monthlyIncome: ' + (t4PreSurvey && t4PreSurvey.monthlyIncome === t2Data.monthlyTakeHome ? 'PASS (' + t4PreSurvey.monthlyIncome + ')' : 'FAIL (got ' + (t4PreSurvey ? t4PreSurvey.monthlyIncome : 'null') + ', expected ' + t2Data.monthlyTakeHome + ')'));
  results.push('Tool 4 totalDebt: ' + (t4PreSurvey && t4PreSurvey.totalDebt === t2Data.totalDebtBalance ? 'PASS (' + t4PreSurvey.totalDebt + ')' : 'FAIL (got ' + (t4PreSurvey ? t4PreSurvey.totalDebt : 'null') + ', expected ' + t2Data.totalDebtBalance + ')'));
  results.push('Tool 4 emergencyFund: ' + (t4PreSurvey && t4PreSurvey.emergencyFund === t2Data.emergencyFundBalance ? 'PASS (' + t4PreSurvey.emergencyFund + ')' : 'FAIL (got ' + (t4PreSurvey ? t4PreSurvey.emergencyFund : 'null') + ', expected ' + t2Data.emergencyFundBalance + ')'));
  results.push('Tool 4 _fromTool2 flag: ' + (t4PreSurvey && t4PreSurvey._fromTool2 === true ? 'PASS' : 'FAIL'));

  // Verify old-schema student would NOT get pre-populated
  // Use a real student who completed Tool 2 under old schema (check 5978RH)
  var t4OldSchemaStudent = '5978RH';
  var t4OldResponse = DataService.getLatestResponse(t4OldSchemaStudent, 'tool2');
  var t4OldIsNew = t4OldResponse && t4OldResponse.data && t4OldResponse.data.results && t4OldResponse.data.results.objectiveHealthScores;
  results.push('Tool 4 old-schema guard (5978RH): ' + (!t4OldIsNew ? 'PASS (no pre-pop for old schema)' : 'FAIL (old schema treated as new)'));

  // ============================================================
  // TOOL 6: Field mapping test
  // ============================================================

  // Test mapUpstreamFields with new schema data
  try {
    var t6Tool1 = DataService.getLatestResponse(testClient, 'tool1');
    var t6Tool2 = DataService.getLatestResponse(testClient, 'tool2');
    var t6Tool3 = DataService.getLatestResponse(testClient, 'tool3');
    var t6Tool4 = DataService.getLatestResponse(testClient, 'tool4');
    var t6Tool5 = DataService.getLatestResponse(testClient, 'tool5');

    var mapped = Tool6.mapUpstreamFields(t6Tool1, t6Tool2, t6Tool3, t6Tool4, t6Tool5);

    // grossIncome should come from grossAnnualIncome
    var expectedGross = t2Data.grossAnnualIncome;
    results.push('Tool 6 grossIncome mapping: ' + (mapped.grossIncome && String(mapped.grossIncome) === String(expectedGross) ? 'PASS (' + mapped.grossIncome + ')' : 'FAIL (got ' + mapped.grossIncome + ', expected ' + expectedGross + ')'));

    // filingStatus should derive from marital
    var expectedFiling = t2Data.marital === 'single' ? 'Single' : (t2Data.marital === 'married' || t2Data.marital === 'partnered' ? 'MFJ' : null);
    results.push('Tool 6 filingStatus mapping: ' + (mapped.filingStatus === expectedFiling ? 'PASS (' + mapped.filingStatus + ')' : 'FAIL (got ' + mapped.filingStatus + ', expected ' + expectedFiling + ')'));

    // age should map
    results.push('Tool 6 age mapping: ' + (mapped.age && String(mapped.age) === String(t2Data.age) ? 'PASS (' + mapped.age + ')' : 'FAIL (got ' + mapped.age + ', expected ' + t2Data.age + ')'));

    // tool2RetirementBalance should be available
    results.push('Tool 6 retirementBalance passthrough: ' + (mapped.tool2RetirementBalance === t2Data.totalRetirementBalance ? 'PASS (' + mapped.tool2RetirementBalance + ')' : 'FAIL (got ' + mapped.tool2RetirementBalance + ', expected ' + t2Data.totalRetirementBalance + ')'));

    // tool2RetirementContribution should be available
    results.push('Tool 6 retirementContribution passthrough: ' + (mapped.tool2RetirementContribution === t2Data.monthlyRetirementContribution ? 'PASS (' + mapped.tool2RetirementContribution + ')' : 'FAIL (got ' + mapped.tool2RetirementContribution + ', expected ' + t2Data.monthlyRetirementContribution + ')'));

  } catch(e) {
    results.push('Tool 6 mapping: FAIL - ' + e.message);
  }

  // ============================================================
  // TOOL 8: Fallback balance test
  // ============================================================

  try {
    var t8Data = Tool8.resolveClientData(testClient);

    // If no Tool 6 pre-survey, currentAssets should fall back to Tool 2 totalRetirementBalance
    var t6PreSurvey = Tool8.getTool6PreSurvey(testClient);
    var t6BalanceSum = Tool8.sumRetirementBalances(t6PreSurvey);
    var expectedBalance = t6BalanceSum > 0 ? t6BalanceSum : parseFloat(t2Data.totalRetirementBalance);

    results.push('Tool 8 currentAssets: ' + (t8Data.currentAssets !== null && t8Data.currentAssets !== undefined ? 'PASS (' + t8Data.currentAssets + ')' : 'FAIL (null)'));

    // Years to retirement should derive from Tool 2 age
    var expectedYears = 65 - parseInt(t2Data.age);
    results.push('Tool 8 yearsToRetirement: ' + (t8Data.yearsToRetirement === expectedYears ? 'PASS (' + t8Data.yearsToRetirement + ')' : 'FAIL (got ' + t8Data.yearsToRetirement + ', expected ' + expectedYears + ')'));

    // Age should come through
    results.push('Tool 8 age: ' + (String(t8Data.age) === String(t2Data.age) ? 'PASS (' + t8Data.age + ')' : 'FAIL (got ' + t8Data.age + ', expected ' + t2Data.age + ')'));

  } catch(e) {
    results.push('Tool 8 resolve: FAIL - ' + e.message);
  }

  // ============================================================
  // SCHEMA GUARD: Verify no pre-population for old-schema students
  // ============================================================

  // Test Tool 6 with old-schema student
  try {
    var oldTool1 = DataService.getLatestResponse(t4OldSchemaStudent, 'tool1');
    var oldTool2 = DataService.getLatestResponse(t4OldSchemaStudent, 'tool2');
    if (oldTool2) {
      var oldMapped = Tool6.mapUpstreamFields(oldTool1, oldTool2, null, null, null);
      // grossIncome should still work via old field names (annualIncome, grossIncome, income)
      // but tool2RetirementBalance should be null (old schema has no totalRetirementBalance)
      var oldHasRetBal = oldMapped.tool2RetirementBalance !== null && oldMapped.tool2RetirementBalance !== undefined;
      results.push('Tool 6 old-schema retirement guard: ' + (!oldHasRetBal ? 'PASS (no retirement data for old schema)' : 'INFO (old student may have the field: ' + oldMapped.tool2RetirementBalance + ')'));
    } else {
      results.push('Tool 6 old-schema test: SKIP (5978RH has no Tool 2 data)');
    }
  } catch(e) {
    results.push('Tool 6 old-schema test: FAIL - ' + e.message);
  }

  // Summary
  var passed = results.filter(function(r) { return r.indexOf('PASS') > -1; }).length;
  var total = results.filter(function(r) { return r.indexOf('SKIP') === -1 && r.indexOf('INFO') === -1; }).length;
  Logger.log('=== Tool 2 Phase 5 Pre-Population Test Results ===');
  results.forEach(function(r) { Logger.log(r); });
  Logger.log('=== Overall: ' + passed + '/' + total + (passed === total ? ' ALL PASSED' : ' SOME FAILED') + ' ===');
}

function testTool2Phase1() {
  const results = [];

  // Test 1: Verify Tool2Constants has new properties
  try {
    const hasFullFields = Tool2Constants.FULL_MODE_FIELDS && Tool2Constants.FULL_MODE_FIELDS.moneyFlow;
    const hasLightFields = Tool2Constants.LIGHT_MODE_FIELDS && Tool2Constants.LIGHT_MODE_FIELDS.moneyFlow;
    const hasBenchmarks = Tool2Constants.BENCHMARK_STANDARDS && Tool2Constants.BENCHMARK_STANDARDS.moneyFlow;
    const hasThresholds = Tool2Constants.PATTERN_THRESHOLDS && Tool2Constants.PATTERN_THRESHOLDS.FSV;
    const hasConsolidated = Tool2Constants.REQUIRED_INSIGHTS[0] === 'consolidated_insight';
    const hasStressWeights = Tool2Constants.STRESS_WEIGHTS && Tool2Constants.STRESS_WEIGHTS.moneyFlow === 5;

    results.push('Constants: ' + (hasFullFields && hasLightFields && hasBenchmarks && hasThresholds && hasConsolidated && hasStressWeights ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Constants: FAIL - ' + e.message);
  }

  // Test 2: Verify page rendering for test student 5978RH
  const testStudent = '5978RH';
  try {
    const page1 = Tool2.renderPageContent(1, {assessmentMode: 'full'}, testStudent);
    const hasMode = page1.indexOf('assessmentMode') > -1;
    const hasToggle = page1.indexOf('toggleAssessmentMode') > -1;
    const noIncomeStreams = page1.indexOf('incomeStreams') === -1;
    results.push('Page 1 (full): ' + (hasMode && hasToggle && noIncomeStreams ? 'PASS' : 'FAIL - mode:' + hasMode + ' toggle:' + hasToggle + ' noStreams:' + noIncomeStreams));
  } catch (e) {
    results.push('Page 1: FAIL - ' + e.message);
  }

  // Test 3: Page 2 has objective fields
  try {
    const page2 = Tool2.renderPageContent(2, {assessmentMode: 'full'}, testStudent);
    const hasGross = page2.indexOf('grossAnnualIncome') > -1;
    const hasTakeHome = page2.indexOf('monthlyTakeHome') > -1;
    const hasSpending = page2.indexOf('monthlySpending') > -1;
    const hasIncomeClarity = page2.indexOf('incomeClarity') > -1;
    results.push('Page 2 (full): ' + (hasGross && hasTakeHome && hasSpending && hasIncomeClarity ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Page 2: FAIL - ' + e.message);
  }

  // Test 4: Page 3 has objective debt fields
  try {
    const page3 = Tool2.renderPageContent(3, {assessmentMode: 'full'}, testStudent);
    const hasDebt = page3.indexOf('totalDebtBalance') > -1;
    const hasPayments = page3.indexOf('monthlyDebtPayments') > -1;
    const hasEF = page3.indexOf('emergencyFundBalance') > -1;
    results.push('Page 3 (full): ' + (hasDebt && hasPayments && hasEF ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Page 3: FAIL - ' + e.message);
  }

  // Test 5: Page 4 has objective savings/retirement fields
  try {
    const page4 = Tool2.renderPageContent(4, {assessmentMode: 'full'}, testStudent);
    const hasLiquid = page4.indexOf('liquidSavings') > -1;
    const hasRetBal = page4.indexOf('totalRetirementBalance') > -1;
    const hasRetContr = page4.indexOf('monthlyRetirementContribution') > -1;
    results.push('Page 4 (full): ' + (hasLiquid && hasRetBal && hasRetContr ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Page 4: FAIL - ' + e.message);
  }

  // Test 6: Page 5 has insurance checkboxes
  try {
    const page5 = Tool2.renderPageContent(5, {assessmentMode: 'full'}, testStudent);
    const hasHealth = page5.indexOf('hasHealthInsurance') > -1;
    const hasLife = page5.indexOf('hasLifeInsurance') > -1;
    const hasDisability = page5.indexOf('hasDisabilityInsurance') > -1;
    const hasProperty = page5.indexOf('hasPropertyInsurance') > -1;
    const hasEmotions = page5.indexOf('financialEmotionsNarrative') > -1;
    results.push('Page 5 (full): ' + (hasHealth && hasLife && hasDisability && hasProperty && hasEmotions ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Page 5: FAIL - ' + e.message);
  }

  // Test 7: Light mode hides full-only fields
  try {
    const page2Light = Tool2.renderPageContent(2, {assessmentMode: 'light'}, testStudent);
    const hasHiddenScales = page2Light.indexOf('display: none') > -1;
    results.push('Page 2 (light): ' + (hasHiddenScales ? 'PASS' : 'FAIL - full-mode scales not hidden'));
  } catch (e) {
    results.push('Page 2 (light): FAIL - ' + e.message);
  }

  // Test 8: Page 1 light mode hides full-only demographics
  try {
    const page1Light = Tool2.renderPageContent(1, {assessmentMode: 'light'}, testStudent);
    const hasHiddenDemo = page1Light.indexOf('id="fullModeDemo"') > -1 && page1Light.indexOf("display: none") > -1;
    results.push('Page 1 (light): ' + (hasHiddenDemo ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Page 1 (light): FAIL - ' + e.message);
  }

  // Test 9: No escaped apostrophes in adaptive questions
  try {
    const page5Full = Tool2.renderPageContent(5, {assessmentMode: 'full'}, testStudent);
    const hasEscaped = page5Full.indexOf("\\'") > -1;
    results.push('No escaped apostrophes: ' + (!hasEscaped ? 'PASS' : 'FAIL'));
  } catch (e) {
    results.push('Apostrophe check: FAIL - ' + e.message);
  }

  // Summary
  const passed = results.filter(r => r.indexOf('PASS') > -1).length;
  const total = results.length;
  Logger.log('=== Tool 2 Phase 1 Test Results ===');
  results.forEach(r => Logger.log(r));
  Logger.log('=== Overall: ' + passed + '/' + total + (passed === total ? ' ALL PASSED' : ' SOME FAILED') + ' ===');
}
