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
  return PDFGenerator.generateTool1PDF(clientId);
}

/**
 * Generate PDF for Tool 2 Financial Clarity Report
 * @param {string} clientId - Client ID
 * @returns {object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
function generateTool2PDF(clientId) {
  return PDFGenerator.generateTool2PDF(clientId);
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
  return NavigationHelpers.getDashboardPage(clientId);
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
