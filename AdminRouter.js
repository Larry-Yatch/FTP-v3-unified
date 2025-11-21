/**
 * AdminRouter.js
 * Handles routing and logic for admin interface
 *
 * PURPOSE:
 * Provides a web-based admin interface for managing students, tool access,
 * and viewing activity logs. Accessible via /admin route.
 *
 * ROUTES:
 * - /admin/login - Admin login page
 * - /admin/dashboard - Main admin dashboard
 * - /admin/students - Student management
 * - /admin/access - Tool access control
 * - /admin/activity - Activity log viewer
 * - /admin/reports - Student reports viewer
 *
 * VERSION: v3.11.0
 * CREATED: November 19, 2025
 */

// ========================================
// ADMIN AUTHENTICATION
// ========================================

/**
 * Check if user is authenticated as admin
 * Checks UserProperties directly (no token needed since it's user-scoped)
 */
function isAdminAuthenticated() {
  // Check against UserProperties (automatically scoped to current user)
  const sessionData = PropertiesService.getUserProperties().getProperty('admin_session');
  console.log('[AUTH] Session data:', sessionData ? 'EXISTS' : 'NULL');

  if (!sessionData) {
    console.log('[AUTH] No session found');
    return false;
  }

  try {
    const session = JSON.parse(sessionData);
    const isValid = session.expiresAt > Date.now();
    console.log('[AUTH] Session valid:', isValid, 'Expires:', new Date(session.expiresAt));
    return isValid;
  } catch (e) {
    console.log('[AUTH] Session parse error:', e);
    return false;
  }
}

/**
 * Validate admin credentials
 */
function validateAdminCredentials(username, password) {
  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    let adminsSheet = ss.getSheetByName(CONFIG.SHEETS.ADMINS);

    if (!adminsSheet) {
      console.warn('ADMINS sheet not found, creating with default admin');
      createAdminsSheet();
      // Refresh reference after creation
      adminsSheet = ss.getSheetByName(CONFIG.SHEETS.ADMINS);
      if (!adminsSheet) {
        return { success: false, error: 'Failed to create ADMINS sheet' };
      }
    }

    const data = adminsSheet.getDataRange().getValues();

    // Check credentials
    for (let i = 1; i < data.length; i++) {
      const [adminUsername, adminPassword, adminEmail, status] = data[i];

      if (adminUsername === username && status === 'active') {
        // IMPORTANT: In production, use proper password hashing (bcrypt, etc.)
        // This is a simple comparison for now
        if (adminPassword === password) {
          return {
            success: true,
            admin: {
              username: adminUsername,
              email: adminEmail
            }
          };
        }
      }
    }

    return { success: false, error: 'Invalid credentials' };

  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return { success: false, error: 'Authentication error' };
  }
}

/**
 * Create admin session
 */
function createAdminSession(adminInfo) {
  const token = Utilities.getUuid();
  const expiresAt = Date.now() + (8 * 60 * 60 * 1000); // 8 hours

  const session = {
    token: token,
    username: adminInfo.username,
    email: adminInfo.email,
    createdAt: Date.now(),
    expiresAt: expiresAt
  };

  PropertiesService.getUserProperties().setProperty('admin_session', JSON.stringify(session));

  return session;
}

/**
 * Clear admin session (logout)
 */
function clearAdminSession() {
  PropertiesService.getUserProperties().deleteProperty('admin_session');
  return { success: true };
}

// ========================================
// ADMIN API ENDPOINTS
// ========================================

/**
 * Handle admin login request
 */
function handleAdminLogin(username, password) {
  console.log('[LOGIN] Attempting login for:', username);
  const validation = validateAdminCredentials(username, password);

  if (validation.success) {
    console.log('[LOGIN] Credentials valid, creating session');
    const session = createAdminSession(validation.admin);
    console.log('[LOGIN] Session created, expires:', new Date(session.expiresAt));

    // Log admin login activity
    DataService.logActivity('ADMIN', 'admin_login', {
      toolId: '',
      details: `Admin login: ${validation.admin.username}`
    });

    return {
      success: true,
      sessionToken: session.token,
      admin: validation.admin
    };
  }

  console.log('[LOGIN] Login failed:', validation.error);
  return validation;
}

/**
 * Handle add student request
 */
function handleAddStudentRequest(studentData) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  const { clientId, name, email } = studentData;

  // Validate inputs
  if (!clientId || !name || !email) {
    return { success: false, error: 'Missing required fields' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate clientId format (alphanumeric, underscores, hyphens only)
  const clientIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!clientIdRegex.test(clientId)) {
    return { success: false, error: 'Client ID can only contain letters, numbers, underscores, and hyphens' };
  }

  // Sanitize name (trim whitespace, limit length)
  const sanitizedName = name.trim();
  if (sanitizedName.length === 0 || sanitizedName.length > 100) {
    return { success: false, error: 'Name must be between 1 and 100 characters' };
  }

  // Use existing addStudent function
  return addStudent(clientId, sanitizedName, email.trim());
}

/**
 * Handle get all students request
 */
function handleGetStudentsRequest() {
  console.log('[GET_STUDENTS] Request received');

  if (!isAdminAuthenticated()) {
    console.log('[GET_STUDENTS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[GET_STUDENTS] Authenticated, fetching students');

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      console.log('[GET_STUDENTS] No students sheet, returning empty array');
      return { success: true, students: [] };
    }

    const data = studentsSheet.getDataRange().getValues();
    console.log('[GET_STUDENTS] Found', data.length - 1, 'students');

    const students = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      students.push({
        clientId: data[i][0],
        name: data[i][1],
        email: data[i][2],
        status: data[i][3],
        enrolledDate: data[i][4] ? data[i][4].toString() : '',
        lastActivity: data[i][5] ? data[i][5].toString() : '',
        toolsCompleted: data[i][6] || 0,
        currentTool: data[i][7] || 'tool1'
      });
    }

    console.log('[GET_STUDENTS] Returning', students.length, 'students');
    return { success: true, students: students };

  } catch (error) {
    console.error('[GET_STUDENTS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get student access request
 */
function handleGetStudentAccessRequest(clientId) {
  console.log('[GET_ACCESS] Request received for clientId:', clientId);

  if (!isAdminAuthenticated()) {
    console.log('[GET_ACCESS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[GET_ACCESS] Authenticated, fetching access');

  try {
    const access = ToolAccessControl.getStudentAccess(clientId);

    // Serialize dates to strings
    const serializedAccess = access.map(record => ({
      clientId: record.clientId,
      toolId: record.toolId,
      status: record.status,
      prerequisites: record.prerequisites,
      unlockedDate: record.unlockedDate ? record.unlockedDate.toString() : '',
      lockedBy: record.lockedBy,
      lockReason: record.lockReason
    }));

    console.log('[GET_ACCESS] Returning', serializedAccess.length, 'access records');
    return { success: true, access: serializedAccess };
  } catch (error) {
    console.error('[GET_ACCESS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle unlock tool request
 */
function handleUnlockToolRequest(clientId, toolId) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const sessionDataStr = PropertiesService.getUserProperties().getProperty('admin_session');
    if (!sessionDataStr) {
      return { success: false, error: 'Session expired' };
    }

    const sessionData = JSON.parse(sessionDataStr);
    const adminEmail = sessionData.email || 'admin@trupath.com';

    const result = ToolAccessControl.adminUnlockTool(
      clientId,
      toolId,
      adminEmail,
      'Manual unlock via admin dashboard'
    );

    return result;
  } catch (error) {
    console.error('Error unlocking tool:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle lock tool request
 */
function handleLockToolRequest(clientId, toolId, reason) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const sessionDataStr = PropertiesService.getUserProperties().getProperty('admin_session');
    if (!sessionDataStr) {
      return { success: false, error: 'Session expired' };
    }

    const sessionData = JSON.parse(sessionDataStr);
    const adminEmail = sessionData.email || 'admin@trupath.com';

    const result = ToolAccessControl.adminLockTool(
      clientId,
      toolId,
      adminEmail,
      reason || 'Manual lock via admin dashboard'
    );

    return result;
  } catch (error) {
    console.error('Error locking tool:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get activity log request
 */
function handleGetActivityLogRequest(filters) {
  console.log('[GET_ACTIVITY] Request received, filters:', JSON.stringify(filters));

  if (!isAdminAuthenticated()) {
    console.log('[GET_ACTIVITY] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[GET_ACTIVITY] Authenticated, fetching activity log');

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    const activitySheet = ss.getSheetByName(CONFIG.SHEETS.ACTIVITY_LOG);

    if (!activitySheet) {
      console.log('[GET_ACTIVITY] No activity sheet, returning empty array');
      return { success: true, activities: [] };
    }

    const data = activitySheet.getDataRange().getValues();
    console.log('[GET_ACTIVITY] Found', data.length - 1, 'activity rows');

    const activities = [];

    // Check if there's any data beyond the header
    if (data.length <= 1) {
      console.log('[GET_ACTIVITY] Only header row, returning empty array');
      return { success: true, activities: [] };
    }

    // Get last 100 activities (or apply filters)
    const limit = filters?.limit || 100;
    const startIndex = Math.max(1, data.length - limit);
    console.log('[GET_ACTIVITY] Reading from index', startIndex, 'to', data.length - 1);

    for (let i = startIndex; i < data.length; i++) {
      const activity = {
        timestamp: data[i][0] ? data[i][0].toString() : '',
        clientId: data[i][1],
        action: data[i][2],
        details: data[i][3],
        toolId: data[i][4],
        sessionId: data[i][5]
      };

      // Apply filters
      if (filters?.clientId && activity.clientId !== filters.clientId) continue;
      if (filters?.toolId && activity.toolId !== filters.toolId) continue;
      if (filters?.action && activity.action !== filters.action) continue;

      activities.push(activity);
    }

    // Reverse to show newest first
    activities.reverse();

    console.log('[GET_ACTIVITY] Returning', activities.length, 'activities');
    return { success: true, activities: activities };

  } catch (error) {
    console.error('[GET_ACTIVITY] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle update student status request
 */
function handleUpdateStudentStatusRequest(clientId, newStatus) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    const data = studentsSheet.getDataRange().getValues();

    // Find student row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === clientId) {
        const oldStatus = data[i][3];

        // Update status (column D, index 3)
        studentsSheet.getRange(i + 1, 4).setValue(newStatus);

        SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENTS);

        // Log activity for status change
        DataService.logActivity(clientId, 'student_status_changed', {
          toolId: '',
          details: `Status changed from ${oldStatus} to ${newStatus}`
        });

        return {
          success: true,
          message: `Student ${clientId} status updated to ${newStatus}`
        };
      }
    }

    return { success: false, error: 'Student not found' };

  } catch (error) {
    console.error('Error updating student status:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get student tools request
 * Returns all tools with completion status for a student
 */
function handleGetStudentToolsRequest(clientId) {
  console.log('[GET_STUDENT_TOOLS] Request received for clientId:', clientId);

  if (!isAdminAuthenticated()) {
    console.log('[GET_STUDENT_TOOLS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[GET_STUDENT_TOOLS] Authenticated, fetching tool data');

  try {
    const ss = SpreadsheetCache.getSpreadsheet();

    // Get completion info from RESPONSES sheet (more reliable than activity log)
    const responsesSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    const completionDates = {};

    if (responsesSheet) {
      const responsesData = responsesSheet.getDataRange().getValues();

      // Find COMPLETED responses for this student
      // Columns: Timestamp, Client_ID, Tool_ID, Data, Version, Status, Is_Latest
      for (let i = responsesData.length - 1; i > 0; i--) {
        const timestamp = responsesData[i][0];
        const responseClientId = responsesData[i][1];
        const toolId = responsesData[i][2];
        const status = responsesData[i][5];
        const isLatest = responsesData[i][6];

        if (responseClientId === clientId && status === 'COMPLETED' && (isLatest === 'true' || isLatest === true)) {
          // Only store if not already found (most recent)
          if (!completionDates[toolId]) {
            completionDates[toolId] = timestamp;
          }
        }
      }
    }

    console.log('[GET_STUDENT_TOOLS] Found completed tools:', Object.keys(completionDates));

    // Get tool names from registry (or use default names)
    const toolNames = {
      'tool1': 'Personal Orientation',
      'tool2': 'Financial Clarity',
      'tool3': 'Identity & Validation',
      'tool4': 'Work & Purpose',
      'tool5': 'Love & Connection',
      'tool6': 'Health & Vitality',
      'tool7': 'Transcendence',
      'tool8': 'Integration & Action'
    };

    // Build tool status array for all 8 tools
    const tools = [];
    for (let i = 1; i <= 8; i++) {
      const toolId = `tool${i}`;
      const isCompleted = !!completionDates[toolId];

      tools.push({
        toolId: toolId,
        name: toolNames[toolId] || toolId,
        status: isCompleted ? 'completed' : 'not_completed',
        completedDate: isCompleted ? completionDates[toolId].toString() : ''
      });
    }

    console.log('[GET_STUDENT_TOOLS] Returning', tools.length, 'tools');
    return { success: true, tools: tools };

  } catch (error) {
    console.error('[GET_STUDENT_TOOLS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get tool report request
 * Returns the completed report data for a specific tool
 */
function handleGetToolReportRequest(clientId, toolId) {
  console.log('[GET_TOOL_REPORT] Request received for', clientId, '/', toolId);

  if (!isAdminAuthenticated()) {
    console.log('[GET_TOOL_REPORT] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[GET_TOOL_REPORT] Authenticated, fetching report data');

  try {
    // Get tool response data
    const response = DataService.getToolResponse(clientId, toolId);

    if (!response) {
      console.log('[GET_TOOL_REPORT] No response found');
      return { success: false, error: 'No report data found for this tool' };
    }

    // Only return completed reports
    if (response.status !== 'COMPLETED') {
      console.log('[GET_TOOL_REPORT] Tool not completed, status:', response.status);
      return { success: false, error: 'This tool has not been completed yet' };
    }

    // Get completion date from activity log
    let completedDate = response.timestamp;
    const ss = SpreadsheetCache.getSpreadsheet();
    const activitySheet = ss.getSheetByName(CONFIG.SHEETS.ACTIVITY_LOG);

    if (activitySheet) {
      const activityData = activitySheet.getDataRange().getValues();

      for (let i = activityData.length - 1; i > 0; i--) {
        const clientIdCol = activityData[i][1];
        const action = activityData[i][2];
        const activityToolId = activityData[i][4];
        const timestamp = activityData[i][0];

        if (clientIdCol === clientId && action === 'tool_completed' && activityToolId === toolId) {
          completedDate = timestamp;
          break;
        }
      }
    }

    // Return report data
    console.log('[GET_TOOL_REPORT] Returning report data');
    return {
      success: true,
      report: {
        toolId: toolId,
        clientId: clientId,
        data: response.data,
        completedDate: completedDate ? completedDate.toString() : '',
        version: response.version
      }
    };

  } catch (error) {
    console.error('[GET_TOOL_REPORT] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Handle get tool report HTML request
 * Returns the formatted HTML that students see (not raw data)
 */
function handleGetToolReportHTMLRequest(clientId, toolId) {
  console.log('[GET_TOOL_REPORT_HTML] Request received for', clientId, '/', toolId);

  if (!isAdminAuthenticated()) {
    console.log('[GET_TOOL_REPORT_HTML] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[GET_TOOL_REPORT_HTML] Authenticated, generating report HTML');

  try {
    // Check if tool is completed
    const response = DataService.getToolResponse(clientId, toolId);

    if (!response) {
      console.log('[GET_TOOL_REPORT_HTML] No response found');
      return { success: false, error: 'No report data found for this tool' };
    }

    if (response.status !== 'COMPLETED') {
      console.log('[GET_TOOL_REPORT_HTML] Tool not completed, status:', response.status);
      return { success: false, error: 'This tool has not been completed yet' };
    }

    // Get the appropriate report renderer
    let reportHTML = '';

    switch (toolId) {
      case 'tool1':
        // Tool1 requires template parameter
        const tool1Results = Tool1Report.getResults(clientId);
        if (tool1Results) {
          const template = Tool1Templates.getTemplate(tool1Results.winner);
          if (template) {
            reportHTML = Tool1Report.buildReportHTML(clientId, tool1Results, template);
          }
        }
        break;

      case 'tool2':
        const tool2Results = Tool2Report.getResults(clientId);
        if (tool2Results) {
          reportHTML = Tool2Report.buildReportHTML(clientId, tool2Results);
        }
        break;

      case 'tool3':
        // Tool3 uses GroundingReport pattern
        const savedData3 = DataService.getToolResponse(clientId, 'tool3');
        const assessmentData3 = savedData3?.data || savedData3;

        if (assessmentData3.scoring && assessmentData3.gpt_insights && assessmentData3.syntheses) {
          const gptInsights3 = {
            subdomains: assessmentData3.gpt_insights?.subdomains || {},
            domain1: assessmentData3.syntheses?.domain1,
            domain2: assessmentData3.syntheses?.domain2,
            overall: assessmentData3.syntheses?.overall
          };

          reportHTML = GroundingReport.generateReport({
            toolId: 'tool3',
            toolConfig: Tool3.config,
            clientId: clientId,
            baseUrl: ScriptApp.getService().getUrl(),
            scoringResult: assessmentData3.scoring,
            gptInsights: gptInsights3,
            formData: assessmentData3.responses || {}
          });
        }
        break;

      case 'tool5':
        // Tool5 uses GroundingReport pattern
        const savedData5 = DataService.getToolResponse(clientId, 'tool5');
        const assessmentData5 = savedData5?.data || savedData5;

        if (assessmentData5.scoring && assessmentData5.gpt_insights && assessmentData5.syntheses) {
          const gptInsights5 = {
            subdomains: assessmentData5.gpt_insights?.subdomains || {},
            domain1: assessmentData5.syntheses?.domain1,
            domain2: assessmentData5.syntheses?.domain2,
            overall: assessmentData5.syntheses?.overall
          };

          reportHTML = GroundingReport.generateReport({
            toolId: 'tool5',
            toolConfig: Tool5.config,
            clientId: clientId,
            baseUrl: ScriptApp.getService().getUrl(),
            scoringResult: assessmentData5.scoring,
            gptInsights: gptInsights5,
            formData: assessmentData5.responses || {}
          });
        }
        break;

      default:
        return {
          success: false,
          error: `Report viewing not yet available for ${toolId}`
        };
    }

    if (!reportHTML) {
      return { success: false, error: 'Could not generate report HTML' };
    }

    console.log('[GET_TOOL_REPORT_HTML] Report HTML generated successfully');
    return {
      success: true,
      html: reportHTML
    };

  } catch (error) {
    console.error('[GET_TOOL_REPORT_HTML] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// ANALYTICS FUNCTIONS
// ========================================

/**
 * Get tool completion analytics with optional date range filtering
 * @param {string} startDate - Optional start date (YYYY-MM-DD)
 * @param {string} endDate - Optional end date (YYYY-MM-DD)
 * @returns {Object} Analytics data
 */
function handleGetToolCompletionAnalytics(startDate, endDate) {
  console.log('[ANALYTICS] Request received, startDate:', startDate, 'endDate:', endDate);

  if (!isAdminAuthenticated()) {
    console.log('[ANALYTICS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();

    // Get active students
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    const studentsData = studentsSheet.getDataRange().getValues();
    const activeStudents = [];

    for (let i = 1; i < studentsData.length; i++) {
      if (studentsData[i][3] === 'active') {
        activeStudents.push(studentsData[i][0]); // clientId
      }
    }

    console.log('[ANALYTICS] Found', activeStudents.length, 'active students');

    // Get completion data from RESPONSES sheet
    const responsesSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    if (!responsesSheet) {
      return { success: false, error: 'Responses sheet not found' };
    }

    const responsesData = responsesSheet.getDataRange().getValues();

    // Parse date range
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

    // Count completions by tool (only for active students)
    // Structure: { toolId: { count: X, students: Set } }
    const toolCompletions = {};
    let totalCompletions = 0;

    // Columns: Timestamp, Client_ID, Tool_ID, Data, Version, Status, Is_Latest
    for (let i = responsesData.length - 1; i > 0; i--) {
      const timestamp = responsesData[i][0];
      const clientId = responsesData[i][1];
      const toolId = responsesData[i][2];
      const status = responsesData[i][5];
      const isLatest = responsesData[i][6];

      // Only count completed, latest responses for active students
      if (status !== 'COMPLETED') continue;
      if (isLatest !== 'true' && isLatest !== true) continue;
      if (!activeStudents.includes(clientId)) continue;

      // Apply date filter
      if (startDateObj && new Date(timestamp) < startDateObj) continue;
      if (endDateObj && new Date(timestamp) > endDateObj) continue;

      // Initialize tool data if needed
      if (!toolCompletions[toolId]) {
        toolCompletions[toolId] = { count: 0, students: new Set() };
      }

      // Only count once per student per tool
      if (!toolCompletions[toolId].students.has(clientId)) {
        toolCompletions[toolId].students.add(clientId);
        toolCompletions[toolId].count++;
        totalCompletions++;
      }
    }

    // Calculate rates
    const totalActiveStudents = activeStudents.length;
    const toolRates = {};

    for (let i = 1; i <= 8; i++) {
      const toolId = `tool${i}`;
      const data = toolCompletions[toolId] || { count: 0, students: new Set() };
      toolRates[toolId] = {
        count: data.count,
        rate: totalActiveStudents > 0 ? data.count / totalActiveStudents : 0
      };
    }

    // Calculate average tools per student
    const avgToolsPerStudent = totalActiveStudents > 0 ? totalCompletions / totalActiveStudents : 0;

    console.log('[ANALYTICS] Total completions:', totalCompletions, 'Avg per student:', avgToolsPerStudent.toFixed(1));

    return {
      success: true,
      data: {
        totalActiveStudents: totalActiveStudents,
        totalCompletions: totalCompletions,
        avgToolsPerStudent: avgToolsPerStudent,
        toolCompletions: toolRates,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    };

  } catch (error) {
    console.error('[ANALYTICS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Create ADMINS sheet with default admin
 */
function createAdminsSheet() {
  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    let adminsSheet = ss.getSheetByName(CONFIG.SHEETS.ADMINS);

    // Only create if it doesn't exist
    if (!adminsSheet) {
      adminsSheet = ss.insertSheet(CONFIG.SHEETS.ADMINS);

      // Set headers
      adminsSheet.getRange(1, 1, 1, 5).setValues([[
        'Username',
        'Password',
        'Email',
        'Status',
        'Created_Date'
      ]]);

      // Add default admin (CHANGE THIS PASSWORD IN PRODUCTION!)
      adminsSheet.appendRow([
        'admin',
        'admin123',  // TODO: Hash this password in production
        'admin@trupath.com',
        'active',
        new Date()
      ]);

      console.log('✅ ADMINS sheet created with default admin');
      console.log('⚠️ WARNING: Change default password in production!');

      SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.ADMINS);
    } else {
      console.log('ℹ️ ADMINS sheet already exists, skipping creation');
    }

  } catch (error) {
    console.error('Error creating ADMINS sheet:', error);
  }
}

/**
 * Initialize admin system
 * Run this once to set up the ADMINS sheet
 */
function initializeAdminSystem() {
  createAdminsSheet();
  console.log('✅ Admin system initialized');
  console.log('📝 Default credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('⚠️ IMPORTANT: Change these credentials in the ADMINS sheet!');
}
