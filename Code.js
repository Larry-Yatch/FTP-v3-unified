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
      route: "tool1",
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
 * Main entry point - ALL requests come through here
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
