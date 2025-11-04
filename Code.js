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

    console.log('Tools registered successfully');
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
    return { success: true };

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

    // Call tool's final submission handler
    const clientId = data.client;
    const result = tool.processFinalSubmission(clientId);

    // Tool should return redirect URL
    if (result && result.redirectUrl) {
      Logger.log(`Completed ${toolId} for ${clientId}`);
      return {
        success: true,
        redirectUrl: result.redirectUrl
      };
    }

    // Default redirect to report page
    const reportUrl = `${ScriptApp.getService().getUrl()}?route=${toolId}_report&client=${clientId}`;
    return {
      success: true,
      redirectUrl: reportUrl
    };

  } catch (error) {
    Logger.log(`Error completing ${toolId} submission: ${error}`);
    return { success: false, error: error.toString() };
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

/**
 * Test the framework (useful for debugging)
 */
function testFramework() {
  console.log('=== Testing Framework ===');

  // Test config
  const configValid = validateConfig();
  console.log('Config validation:', configValid);

  // Test registry
  console.log('Registered tools:', ToolRegistry.count());
  ToolRegistry.debug();

  // Test sheets connection
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    console.log('✅ Connected to spreadsheet:', ss.getName());
  } catch (e) {
    console.error('❌ Cannot connect to spreadsheet:', e);
  }

  console.log('=== Test Complete ===');
}

// ========================================
// ADMIN FUNCTIONS - Run these from GAS Editor
// ========================================

/**
 * Add a new student to the system
 * Run this from GAS Editor to create test users
 *
 * @param {string} clientId - Student ID (e.g., 'TEST001')
 * @param {string} name - Student name
 * @param {string} email - Student email
 * @returns {Object} Result
 */
function addStudent(clientId, name, email) {
  try {
    console.log(`Adding student: ${clientId} - ${name}`);

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    // Check if student already exists
    const data = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === clientId) {
        console.log('⚠️ Student already exists');
        return { success: false, error: 'Student already exists' };
      }
    }

    // Add student to Students sheet
    studentsSheet.appendRow([
      clientId,
      name,
      email,
      'active',           // Status
      new Date(),         // Enrolled_Date
      new Date(),         // Last_Activity
      0,                  // Tools_Completed
      'tool1'             // Current_Tool
    ]);

    console.log('✅ Added to Students sheet');

    // Initialize tool access (Tool 1 unlocked, rest locked)
    const result = ToolAccessControl.initializeStudent(clientId);

    if (result.success) {
      console.log('✅ Initialized tool access');
      console.log(`✅ Student ${clientId} created successfully!`);
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Status: Active`);
      console.log(`   Tool 1: Unlocked`);
      console.log(`   Tools 2-8: Locked`);

      return {
        success: true,
        clientId: clientId,
        message: `Student ${clientId} created successfully`
      };
    } else {
      return result;
    }

  } catch (error) {
    console.error('❌ Error adding student:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Quick function to add TEST001 user
 * Just run this to get started!
 */
function addTestUser() {
  return addStudent('TEST001', 'Test Student', 'test@trupath.com');
}

/**
 * Add multiple test users at once
 */
function addTestUsers() {
  console.log('Adding test users...\n');

  const users = [
    ['TEST001', 'Test Student One', 'test1@trupath.com'],
    ['TEST002', 'Test Student Two', 'test2@trupath.com'],
    ['TEST003', 'Test Student Three', 'test3@trupath.com']
  ];

  const results = [];

  users.forEach(([id, name, email]) => {
    const result = addStudent(id, name, email);
    results.push({ id, success: result.success });
    console.log('');  // Blank line between users
  });

  console.log('=== Summary ===');
  results.forEach(r => {
    console.log(`${r.id}: ${r.success ? '✅ Created' : '⚠️ Failed'}`);
  });

  return results;
}

/**
 * List all students in the system
 */
function listStudents() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      console.log('❌ Students sheet not found');
      return;
    }

    const data = studentsSheet.getDataRange().getValues();

    if (data.length < 2) {
      console.log('No students found.');
      return;
    }

    console.log('=== Students List ===\n');

    for (let i = 1; i < data.length; i++) {
      console.log(`ID: ${data[i][0]}`);
      console.log(`Name: ${data[i][1]}`);
      console.log(`Email: ${data[i][2]}`);
      console.log(`Status: ${data[i][3]}`);
      console.log(`Enrolled: ${data[i][4]}`);
      console.log(`Tools Completed: ${data[i][6] || 0}`);
      console.log(`Current Tool: ${data[i][7] || 'tool1'}`);
      console.log('---');
    }

    console.log(`\nTotal: ${data.length - 1} students`);

  } catch (error) {
    console.error('❌ Error listing students:', error);
  }
}

/**
 * Check a student's tool access status
 * @param {string} clientId - Student ID
 */
function checkStudentAccess(clientId) {
  try {
    console.log(`=== Access Status for ${clientId} ===\n`);

    const access = ToolAccessControl.getStudentAccess(clientId);

    if (access.length === 0) {
      console.log('❌ No access records found for this student');
      console.log('💡 Run: initializeStudentAccess("' + clientId + '")');
      return;
    }

    access.forEach(record => {
      console.log(`${record.toolId}: ${record.status}`);
      if (record.status === 'locked' && record.lockReason) {
        console.log(`  Reason: ${record.lockReason}`);
      }
      if (record.status === 'unlocked' && record.unlockedDate) {
        console.log(`  Unlocked: ${record.unlockedDate}`);
      }
    });

    console.log('\n=== End ===');

  } catch (error) {
    console.error('❌ Error checking access:', error);
  }
}

/**
 * Initialize tool access for a student (if missing)
 * @param {string} clientId - Student ID
 */
function initializeStudentAccess(clientId) {
  const result = ToolAccessControl.initializeStudent(clientId);
  console.log(result);
  return result;
}

/**
 * Manually unlock a tool for a student
 * @param {string} clientId - Student ID
 * @param {string} toolId - Tool to unlock (e.g., 'tool2')
 */
function unlockToolForStudent(clientId, toolId) {
  const result = ToolAccessControl.adminUnlockTool(
    clientId,
    toolId,
    'admin@trupath.com',
    'Manual unlock via admin function'
  );
  console.log(result);
  return result;
}

/**
 * Complete admin setup - run this to get started quickly!
 * Creates test users and verifies everything works
 */
function quickAdminSetup() {
  console.log('=== Quick Admin Setup ===\n');

  // Add TEST001
  console.log('Step 1: Adding TEST001...');
  const result = addTestUser();

  if (result.success) {
    console.log('\nStep 2: Verifying access...');
    checkStudentAccess('TEST001');

    console.log('\n✅ Setup Complete!');
    console.log('\nYou can now:');
    console.log('1. Visit your web app URL');
    console.log('2. Enter "TEST001" as Student ID');
    console.log('3. Enter any password (auth not yet implemented)');
    console.log('4. You should see the dashboard!');
    console.log('\nWeb App URL:');
    console.log(ScriptApp.getService().getUrl());
  } else {
    console.log('\n⚠️ Setup had issues:', result.error);
  }
}
