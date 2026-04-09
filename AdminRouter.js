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

  const { clientId, name, email, cohortId } = studentData;

  // name and email are always required; clientId is optional (pending students have none)
  if (!name || !email) {
    return { success: false, error: 'Name and email are required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate clientId format only when provided
  if (clientId) {
    const clientIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!clientIdRegex.test(clientId)) {
      return { success: false, error: 'Client ID can only contain letters, numbers, underscores, and hyphens' };
    }
  }

  // Sanitize name (trim whitespace, limit length)
  const sanitizedName = name.trim();
  if (sanitizedName.length === 0 || sanitizedName.length > 100) {
    return { success: false, error: 'Name must be between 1 and 100 characters' };
  }

  return addStudent(clientId || '', sanitizedName, email.trim(), cohortId || 'cohort_1');
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

    // Build multi-cohort lookup from junction table
    const cohortMap = buildCohortLookupMap();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const cid = data[i][0];
      students.push({
        clientId: cid,
        name: data[i][1],
        email: data[i][2],
        status: data[i][3],
        enrolledDate: data[i][4] ? data[i][4].toString() : '',
        lastActivity: data[i][5] ? data[i][5].toString() : '',
        toolsCompleted: data[i][6] || 0,
        currentTool: data[i][7] || 'tool1',
        cohort: data[i][8] || '',
        cohorts: cohortMap[cid] || (data[i][8] ? [data[i][8]] : [])
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
          const isNewSchema = tool2Results.results && tool2Results.results.objectiveHealthScores;
          reportHTML = isNewSchema
            ? Tool2Report.buildNewReportHTML(clientId, tool2Results)
            : Tool2Report.buildLegacyReportHTML(clientId, tool2Results);
        }
        break;

      case 'tool3':
        // Tool3 uses GroundingReport pattern
        const savedData3 = DataService.getToolResponse(clientId, 'tool3');
        const assessmentData3 = savedData3?.data;

        if (assessmentData3 && assessmentData3.scoring && assessmentData3.gpt_insights && assessmentData3.syntheses) {
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
        const assessmentData5 = savedData5?.data;

        if (assessmentData5 && assessmentData5.scoring && assessmentData5.gpt_insights && assessmentData5.syntheses) {
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

      case 'tool7':
        // Tool7 uses GroundingReport pattern
        const savedData7 = DataService.getToolResponse(clientId, 'tool7');
        const assessmentData7 = savedData7?.data;

        if (assessmentData7 && assessmentData7.scoring && assessmentData7.gpt_insights && assessmentData7.syntheses) {
          const gptInsights7 = {
            subdomains: assessmentData7.gpt_insights?.subdomains || {},
            domain1: assessmentData7.syntheses?.domain1,
            domain2: assessmentData7.syntheses?.domain2,
            overall: assessmentData7.syntheses?.overall
          };

          reportHTML = GroundingReport.generateReport({
            toolId: 'tool7',
            toolConfig: Tool7.config,
            clientId: clientId,
            baseUrl: ScriptApp.getService().getUrl(),
            scoringResult: assessmentData7.scoring,
            gptInsights: gptInsights7,
            formData: assessmentData7.responses || {}
          });
        }
        break;

      case 'tool4':
        // Get saved allocations from completion response
        const tool4Allocation = response.data ? {
          Multiply: response.data.multiply,
          Essentials: response.data.essentials,
          Freedom: response.data.freedom,
          Enjoyment: response.data.enjoyment
        } : null;
        const tool4Result = PDFGenerator.generateTool4MainHTML(clientId, tool4Allocation);
        if (tool4Result.success) reportHTML = tool4Result.html;
        break;

      case 'tool6':
        const latestScenario6 = Tool6.getLatestScenario(clientId);
        if (latestScenario6) {
          const tool6Result = Tool6.generateReportHTML(clientId, latestScenario6);
          if (tool6Result.success) reportHTML = tool6Result.html;
        }
        break;

      case 'tool8':
        const scenarios8 = Tool8.getUserScenarios(clientId);
        if (scenarios8 && scenarios8.length > 0) {
          const tool8Result = Tool8Report.generateReportHTML(clientId, scenarios8[0]);
          if (tool8Result.success) reportHTML = tool8Result.html;
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
// COACH INTEGRATION ANALYSIS
// ========================================

/**
 * Handle coach integration analysis request.
 * Returns full integration analysis HTML for a student.
 */
function handleGetIntegrationAnalysisRequest(clientId) {
  console.log('[INTEGRATION_ANALYSIS] Request received for', clientId);

  if (!isAdminAuthenticated()) {
    console.log('[INTEGRATION_ANALYSIS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    var html = CollectiveResults.renderCoachPage(clientId);
    return { success: true, html: html };
  } catch (error) {
    console.error('[INTEGRATION_ANALYSIS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get student progress over time page HTML (coach view)
 * @param {string} clientId - Client ID
 * @returns {Object} { success, html }
 */
function handleGetStudentProgressRequest(clientId) {
  console.log('[STUDENT_PROGRESS] Request received for', clientId);

  if (!isAdminAuthenticated()) {
    console.log('[STUDENT_PROGRESS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Get student name for the header
    var studentName = clientId;
    try {
      var studentsSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.STUDENTS);
      if (studentsSheet) {
        var data = studentsSheet.getDataRange().getValues();
        var headers = data[0];
        var clientIdCol = headers.indexOf('Client_ID');
        var nameCol = headers.indexOf('Name');
        if (clientIdCol >= 0 && nameCol >= 0) {
          for (var i = 1; i < data.length; i++) {
            if (data[i][clientIdCol] === clientId) {
              studentName = data[i][nameCol] || clientId;
              break;
            }
          }
        }
      }
    } catch (e) {
      // Non-fatal: fall back to clientId as name
    }

    var pageOutput = ProgressPage.render(clientId, { isCoach: true, studentName: studentName });
    return { success: true, html: pageOutput.getContent() };
  } catch (error) {
    console.error('[STUDENT_PROGRESS] Error:', error);
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
function handleGetToolCompletionAnalytics(startDate, endDate, cohortId) {
  console.log('[ANALYTICS] Request received, startDate:', startDate, 'endDate:', endDate, 'cohort:', cohortId);

  if (!isAdminAuthenticated()) {
    console.log('[ANALYTICS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();

    // Get active students (optionally filtered by cohort)
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    const studentsData = studentsSheet.getDataRange().getValues();
    const cohortStudentIds = cohortId ? getCohortStudentIds(cohortId) : null;
    const activeStudents = [];

    for (let i = 1; i < studentsData.length; i++) {
      if (studentsData[i][3] !== 'active') continue;
      if (cohortStudentIds && !cohortStudentIds.has(studentsData[i][0])) continue;
      activeStudents.push(studentsData[i][0]); // clientId
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
// ATTENDANCE TRACKING FUNCTIONS
// ========================================

/**
 * Get all course calls with their metadata
 * @returns {Object} { success: boolean, calls: Array }
 */
function handleGetCallsRequest() {
  console.log('[GET_CALLS] Request received');

  if (!isAdminAuthenticated()) {
    console.log('[GET_CALLS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Return calls from CONFIG
    const calls = CONFIG.CALLS || [];
    console.log('[GET_CALLS] Returning', calls.length, 'calls');
    return { success: true, calls: calls };
  } catch (error) {
    console.error('[GET_CALLS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get attendance for a specific call (all students)
 * @param {string} callId - The call ID (e.g., 'c1_call1')
 * @returns {Object} { success: boolean, attendance: Array }
 */
function handleGetCallAttendanceRequest(callId, cohortId) {
  console.log('[GET_CALL_ATTENDANCE] Request received for callId:', callId, 'cohort:', cohortId);

  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();

    // Get active students — filtered by cohort via junction table if provided
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    const cohortStudentIds = cohortId ? getCohortStudentIds(cohortId) : null;
    const studentsData = studentsSheet.getDataRange().getValues();
    const students = [];

    for (let i = 1; i < studentsData.length; i++) {
      if (studentsData[i][3] !== 'active') continue;
      if (cohortStudentIds && !cohortStudentIds.has(studentsData[i][0])) continue;
      students.push({
        clientId: studentsData[i][0],
        name: studentsData[i][1],
        email: studentsData[i][2]
      });
    }

    // Get attendance records for this call + cohort
    const attendanceSheet = ss.getSheetByName(CONFIG.SHEETS.ATTENDANCE);
    const attendanceMap = {};

    if (attendanceSheet) {
      const attendanceData = attendanceSheet.getDataRange().getValues();
      // Columns: Timestamp(0), Client_ID(1), Call_ID(2), Status(3), Marked_By(4), Updated_At(5), Cohort_ID(6)
      for (let i = 1; i < attendanceData.length; i++) {
        if (attendanceData[i][2] !== callId) continue;
        if (cohortId && attendanceData[i][6] !== cohortId) continue;
        attendanceMap[attendanceData[i][1]] = attendanceData[i][3];
      }
    }

    const attendance = students.map(student => ({
      clientId: student.clientId,
      name: student.name,
      email: student.email,
      status: attendanceMap[student.clientId] || 'unmarked'
    }));

    attendance.sort((a, b) => a.name.localeCompare(b.name));

    const stats = {
      total: attendance.length,
      attended: attendance.filter(a => a.status === 'attended').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      unmarked: attendance.filter(a => a.status === 'unmarked').length
    };

    return { success: true, attendance: attendance, stats: stats };

  } catch (error) {
    console.error('[GET_CALL_ATTENDANCE] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get attendance for a specific student (all calls)
 * @param {string} clientId - The student ID
 * @returns {Object} { success: boolean, attendance: Array }
 */
function handleGetStudentAttendanceRequest(clientId, cohortId) {
  console.log('[GET_STUDENT_ATTENDANCE] Request received for clientId:', clientId, 'cohort:', cohortId);

  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();

    // Get attendance records for this student, filtered by cohort
    const attendanceSheet = ss.getSheetByName(CONFIG.SHEETS.ATTENDANCE);
    const attendanceMap = {};

    if (attendanceSheet) {
      const attendanceData = attendanceSheet.getDataRange().getValues();
      // Columns: Timestamp(0), Client_ID(1), Call_ID(2), Status(3), Marked_By(4), Updated_At(5), Cohort_ID(6)
      for (let i = 1; i < attendanceData.length; i++) {
        if (attendanceData[i][1] !== clientId) continue;
        if (cohortId && attendanceData[i][6] !== cohortId) continue;
        attendanceMap[attendanceData[i][2]] = attendanceData[i][3];
      }
    }

    // Build attendance list with all calls
    const calls = CONFIG.CALLS || [];
    const attendance = calls.map(call => ({
      callId: call.id,
      callName: call.name,
      cycle: call.cycle,
      callNumber: call.callNumber,
      cycleName: call.cycleName,
      status: attendanceMap[call.id] || 'unmarked'
    }));

    // Calculate stats
    const stats = {
      total: attendance.length,
      attended: attendance.filter(a => a.status === 'attended').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      unmarked: attendance.filter(a => a.status === 'unmarked').length,
      attendanceRate: 0
    };

    // Calculate attendance rate (attended / total calls)
    const totalCalls = attendance.length;
    if (totalCalls > 0) {
      stats.attendanceRate = Math.round((stats.attended / totalCalls) * 100);
    }

    console.log('[GET_STUDENT_ATTENDANCE] Returning', attendance.length, 'calls, stats:', stats);
    return { success: true, attendance: attendance, stats: stats };

  } catch (error) {
    console.error('[GET_STUDENT_ATTENDANCE] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update attendance status for a student on a specific call
 * @param {string} clientId - The student ID
 * @param {string} callId - The call ID
 * @param {string} status - 'attended', 'absent', or 'unmarked' (to clear)
 * @returns {Object} { success: boolean }
 */
function handleUpdateAttendanceRequest(clientId, callId, cohortId, status) {
  console.log('[UPDATE_ATTENDANCE] Request:', clientId, callId, cohortId, status);

  if (!isAdminAuthenticated()) {
    console.log('[UPDATE_ATTENDANCE] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  // Validate status
  const validStatuses = ['attended', 'absent', 'unmarked'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status. Must be: attended, absent, or unmarked' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    let attendanceSheet = ss.getSheetByName(CONFIG.SHEETS.ATTENDANCE);

    // Create sheet if it doesn't exist
    if (!attendanceSheet) {
      attendanceSheet = ss.insertSheet(CONFIG.SHEETS.ATTENDANCE);
      attendanceSheet.getRange(1, 1, 1, 7).setValues([[
        'Timestamp', 'Client_ID', 'Call_ID', 'Status', 'Marked_By', 'Updated_At', 'Cohort_ID'
      ]]);
      console.log('[UPDATE_ATTENDANCE] Created ATTENDANCE sheet');
    }

    // Get admin info
    const sessionDataStr = PropertiesService.getUserProperties().getProperty('admin_session');
    let markedBy = 'admin';
    if (sessionDataStr) {
      const sessionData = JSON.parse(sessionDataStr);
      markedBy = sessionData.username || sessionData.email || 'admin';
    }

    const now = new Date();

    // Check if record already exists
    const data = attendanceSheet.getDataRange().getValues();
    let existingRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === clientId && data[i][2] === callId && (!cohortId || data[i][6] === cohortId)) {
        existingRowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (status === 'unmarked') {
      // Delete the record if it exists
      if (existingRowIndex > 0) {
        attendanceSheet.deleteRow(existingRowIndex);
        console.log('[UPDATE_ATTENDANCE] Deleted row', existingRowIndex);
      }
    } else if (existingRowIndex > 0) {
      // Update existing record
      attendanceSheet.getRange(existingRowIndex, 4).setValue(status);
      attendanceSheet.getRange(existingRowIndex, 5).setValue(markedBy);
      attendanceSheet.getRange(existingRowIndex, 6).setValue(now);
      console.log('[UPDATE_ATTENDANCE] Updated row', existingRowIndex);
    } else {
      // Create new record
      attendanceSheet.appendRow([
        now,        // Timestamp
        clientId,   // Client_ID
        callId,     // Call_ID
        status,     // Status
        markedBy,   // Marked_By
        now,        // Updated_At
        cohortId || ''  // Cohort_ID
      ]);
      console.log('[UPDATE_ATTENDANCE] Created new record');
    }

    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.ATTENDANCE);

    // Log activity
    DataService.logActivity(clientId, 'attendance_updated', {
      toolId: '',
      details: `Attendance for ${callId}: ${status} (by ${markedBy})`
    });

    return { success: true, message: `Attendance updated: ${clientId} - ${callId} - ${status}` };

  } catch (error) {
    console.error('[UPDATE_ATTENDANCE] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get attendance analytics
 * @returns {Object} { success: boolean, data: Object }
 */
function handleGetAttendanceAnalyticsRequest(cohortId) {
  console.log('[ATTENDANCE_ANALYTICS] Request received, cohort:', cohortId);

  if (!isAdminAuthenticated()) {
    console.log('[ATTENDANCE_ANALYTICS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();

    // Get all active students (optionally filtered by cohort)
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    if (!studentsSheet) {
      return { success: false, error: 'Students sheet not found' };
    }

    const studentsData = studentsSheet.getDataRange().getValues();
    const cohortStudentIds = cohortId ? getCohortStudentIds(cohortId) : null;
    const activeStudents = [];

    for (let i = 1; i < studentsData.length; i++) {
      if (studentsData[i][3] !== 'active') continue;
      if (cohortStudentIds && !cohortStudentIds.has(studentsData[i][0])) continue;
      activeStudents.push({
        clientId: studentsData[i][0],
        name: studentsData[i][1]
      });
    }

    const cohortClientIds = new Set(activeStudents.map(s => s.clientId));

    // Get attendance records — filtered by cohort if provided
    const attendanceSheet = ss.getSheetByName(CONFIG.SHEETS.ATTENDANCE);
    const attendanceRecords = [];

    if (attendanceSheet) {
      const attendanceData = attendanceSheet.getDataRange().getValues();
      // Columns: Timestamp(0), Client_ID(1), Call_ID(2), Status(3), Marked_By(4), Updated_At(5), Cohort_ID(6)
      for (let i = 1; i < attendanceData.length; i++) {
        if (cohortId && attendanceData[i][6] !== cohortId) continue;
        attendanceRecords.push({
          clientId: attendanceData[i][1],
          callId: attendanceData[i][2],
          status: attendanceData[i][3]
        });
      }
    }

    // Calculate per-call stats (scoped to cohort when filtered)
    const calls = CONFIG.CALLS || [];
    const callStats = calls.map(call => {
      const callRecords = attendanceRecords.filter(r => r.callId === call.id && cohortClientIds.has(r.clientId));
      const attended = callRecords.filter(r => r.status === 'attended').length;
      const absent = callRecords.filter(r => r.status === 'absent').length;
      const marked = attended + absent;
      const rate = marked > 0 ? Math.round((attended / marked) * 100) : null;

      return {
        callId: call.id,
        callName: call.name,
        cycle: call.cycle,
        callNumber: call.callNumber,
        attended: attended,
        absent: absent,
        unmarked: activeStudents.length - marked,
        rate: rate
      };
    });

    // Calculate per-student stats
    const studentStats = activeStudents.map(student => {
      const studentRecords = attendanceRecords.filter(r => r.clientId === student.clientId);
      const attended = studentRecords.filter(r => r.status === 'attended').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const marked = attended + absent;
      const rate = calls.length > 0 ? Math.round((attended / calls.length) * 100) : null;

      return {
        clientId: student.clientId,
        name: student.name,
        attended: attended,
        absent: absent,
        unmarked: calls.length - marked,
        rate: rate
      };
    });

    // Sort by attendance rate (nulls last, then by rate descending)
    studentStats.sort((a, b) => {
      if (a.rate === null && b.rate === null) return a.name.localeCompare(b.name);
      if (a.rate === null) return 1;
      if (b.rate === null) return -1;
      return b.rate - a.rate;
    });

    // Overall stats (scoped to cohort when filtered)
    // Rate = total attended / (students × calls) — true participation rate
    const totalAttended = attendanceRecords.filter(r => r.status === 'attended' && cohortClientIds.has(r.clientId)).length;
    const totalPossible = activeStudents.length * calls.length;
    const overallRate = totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 100) : null;

    console.log('[ATTENDANCE_ANALYTICS] Returning analytics');
    return {
      success: true,
      data: {
        totalStudents: activeStudents.length,
        totalCalls: calls.length,
        overallAttendanceRate: overallRate,
        callStats: callStats,
        studentStats: studentStats
      }
    };

  } catch (error) {
    console.error('[ATTENDANCE_ANALYTICS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// COMBINED PROGRESS TRACKING
// ========================================

/**
 * Get combined tool completion + attendance progress per student for a cohort
 * @param {string} cohortId - Required cohort ID
 * @returns {Object} Per-student progress data
 */
function handleGetCohortProgressRequest(cohortId) {
  console.log('[COHORT_PROGRESS] Request for cohort:', cohortId);

  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!cohortId) {
    return { success: false, error: 'Cohort ID is required' };
  }

  try {
    var ss = SpreadsheetCache.getSpreadsheet();

    // Get students in this cohort
    var cohortStudentIds = getCohortStudentIds(cohortId);
    var studentsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS) || [];
    var students = [];

    for (var i = 1; i < studentsData.length; i++) {
      if (studentsData[i][3] !== 'active') continue;
      if (!cohortStudentIds.has(studentsData[i][0])) continue;
      students.push({
        clientId: studentsData[i][0],
        name: studentsData[i][1],
        lastActivity: studentsData[i][5] ? studentsData[i][5].toString() : ''
      });
    }

    // Get tool completions from RESPONSES (global — not cohort-scoped)
    var responsesData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES) || [];
    var toolCompletionMap = {}; // clientId → Set of toolIds

    for (var r = responsesData.length - 1; r > 0; r--) {
      var cid = responsesData[r][1];
      var toolId = responsesData[r][2];
      var status = responsesData[r][5];
      var isLatest = responsesData[r][6];

      if (status !== 'COMPLETED') continue;
      if (isLatest !== 'true' && isLatest !== true) continue;
      if (!cohortStudentIds.has(cid)) continue;

      if (!toolCompletionMap[cid]) toolCompletionMap[cid] = new Set();
      toolCompletionMap[cid].add(toolId);
    }

    // Get attendance for this cohort
    var attendanceData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.ATTENDANCE) || [];
    var attendanceMap = {}; // clientId → { attended: N, marked: N }

    for (var a = 1; a < attendanceData.length; a++) {
      if (attendanceData[a][6] !== cohortId) continue;
      var attCid = attendanceData[a][1];
      var attStatus = attendanceData[a][3];

      if (!attendanceMap[attCid]) attendanceMap[attCid] = { attended: 0, marked: 0 };
      if (attStatus === 'attended' || attStatus === 'absent') {
        attendanceMap[attCid].marked++;
        if (attStatus === 'attended') attendanceMap[attCid].attended++;
      }
    }

    // Build per-student progress
    var totalCalls = (CONFIG.CALLS || []).length;
    var totalTools = 8;
    var studentProgress = [];
    var sumToolRate = 0;
    var sumAttRate = 0;

    for (var s = 0; s < students.length; s++) {
      var st = students[s];
      var tools = toolCompletionMap[st.clientId] || new Set();
      var att = attendanceMap[st.clientId] || { attended: 0, marked: 0 };
      var toolCount = tools.size;
      var toolRate = Math.round((toolCount / totalTools) * 100);
      var attendanceRate = totalCalls > 0 ? Math.round((att.attended / totalCalls) * 100) : 0;
      var progressScore = Math.round((toolRate + attendanceRate) / 2);

      sumToolRate += toolRate;
      sumAttRate += attendanceRate;

      studentProgress.push({
        clientId: st.clientId,
        name: st.name,
        toolsCompleted: Array.from(tools),
        toolCount: toolCount,
        callsAttended: att.attended,
        callsMarked: att.marked,
        totalCalls: totalCalls,
        attendanceRate: attendanceRate,
        lastActivity: st.lastActivity,
        progressScore: progressScore
      });
    }

    // Sort by progress score descending
    studentProgress.sort(function(a, b) { return b.progressScore - a.progressScore; });

    // Get cohort name
    var cohortsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.COHORTS) || [];
    var cohortName = cohortId;
    for (var c = 1; c < cohortsData.length; c++) {
      if (cohortsData[c][0] === cohortId) { cohortName = cohortsData[c][1]; break; }
    }

    var n = students.length;
    return {
      success: true,
      data: {
        cohortName: cohortName,
        totalStudents: n,
        totalTools: totalTools,
        totalCalls: totalCalls,
        avgToolCompletion: n > 0 ? Math.round(sumToolRate / n) : 0,
        avgAttendanceRate: n > 0 ? Math.round(sumAttRate / n) : 0,
        students: studentProgress
      }
    };

  } catch (error) {
    console.error('[COHORT_PROGRESS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// MULTI-COHORT HELPERS
// ========================================

/**
 * Get all cohort IDs for a student from the junction table
 * @param {string} clientId
 * @returns {string[]} Array of cohort IDs
 */
function getStudentCohortIds(clientId) {
  var data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENT_COHORTS);
  if (!data || data.length < 2) return [];
  var cohorts = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === clientId) cohorts.push(data[i][1]);
  }
  return cohorts;
}

/**
 * Get Set of all student IDs in a cohort from the junction table
 * @param {string} cohortId
 * @returns {Set<string>} Set of client IDs
 */
function getCohortStudentIds(cohortId) {
  var data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENT_COHORTS);
  var ids = new Set();
  if (!data || data.length < 2) return ids;
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === cohortId) ids.add(data[i][0]);
  }
  return ids;
}

/**
 * Build a lookup map: clientId → [cohortId, cohortId, ...]
 * @returns {Object} Map of clientId to array of cohort IDs
 */
function buildCohortLookupMap() {
  var data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENT_COHORTS);
  var map = {};
  if (!data || data.length < 2) return map;
  for (var i = 1; i < data.length; i++) {
    var cid = data[i][0];
    var cohort = data[i][1];
    if (!map[cid]) map[cid] = [];
    map[cid].push(cohort);
  }
  return map;
}

/**
 * Add an existing student to an additional cohort
 */
function handleAddStudentToCohortRequest(clientId, cohortId) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Validate student exists
    var studentsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS);
    var studentFound = false;
    for (var i = 1; i < studentsData.length; i++) {
      if (studentsData[i][0] === clientId) { studentFound = true; break; }
    }
    if (!studentFound) return { success: false, error: 'Student not found' };

    // Validate cohort exists
    var cohortsData = SpreadsheetCache.getSheetData(CONFIG.SHEETS.COHORTS);
    var cohortFound = false;
    for (var c = 1; c < cohortsData.length; c++) {
      if (cohortsData[c][0] === cohortId) { cohortFound = true; break; }
    }
    if (!cohortFound) return { success: false, error: 'Cohort not found' };

    // Check not already in this cohort
    var existing = getStudentCohortIds(clientId);
    if (existing.indexOf(cohortId) !== -1) {
      return { success: false, error: 'Student is already in this cohort' };
    }

    // Add to junction table
    var scSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.STUDENT_COHORTS);
    scSheet.appendRow([clientId, cohortId, new Date()]);
    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENT_COHORTS);

    DataService.logActivity(clientId, 'cohort_added', {
      toolId: '',
      details: 'Added to ' + cohortId
    });

    return { success: true, message: 'Student added to ' + cohortId };

  } catch (error) {
    console.error('[ADD_STUDENT_TO_COHORT] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// COHORT MANAGEMENT
// ========================================

/**
 * Get all cohorts
 */
function handleGetCohortsRequest() {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    let cohortsSheet = ss.getSheetByName(CONFIG.SHEETS.COHORTS);

    if (!cohortsSheet) {
      // Auto-create with Cohort 1 if missing
      cohortsSheet = createCohortsSheet(ss);
    }

    const data = cohortsSheet.getDataRange().getValues();
    const cohorts = [];

    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      cohorts.push({
        cohortId: data[i][0],
        name: data[i][1],
        startMonth: data[i][2],
        startYear: String(data[i][3]),
        status: data[i][4] || 'active'
      });
    }

    return { success: true, cohorts: cohorts };
  } catch (error) {
    console.error('[GET_COHORTS] Error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create a new cohort
 */
function handleCreateCohortRequest(cohortData) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  const { name, startMonth, startYear } = cohortData;

  if (!name || !startMonth || !startYear) {
    return { success: false, error: 'Name, start month, and start year are required' };
  }

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    let cohortsSheet = ss.getSheetByName(CONFIG.SHEETS.COHORTS);

    if (!cohortsSheet) {
      cohortsSheet = createCohortsSheet(ss);
    }

    // Generate next cohort ID
    const data = cohortsSheet.getDataRange().getValues();
    const existingCount = data.length - 1; // subtract header
    const cohortNumber = existingCount + 1;
    const cohortId = 'cohort_' + cohortNumber;

    // Check name is unique
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim().toLowerCase() === name.trim().toLowerCase()) {
        return { success: false, error: 'A cohort with that name already exists' };
      }
    }

    cohortsSheet.appendRow([cohortId, name.trim(), startMonth, startYear, 'active']);
    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.COHORTS);

    console.log('[CREATE_COHORT] Created:', cohortId, name);
    return { success: true, cohortId: cohortId, message: cohortId + ' created successfully' };

  } catch (error) {
    console.error('[CREATE_COHORT] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// BATCH IMPORT
// ========================================

/**
 * Batch import students from a Google Sheet
 * @param {string} sheetUrl - URL of the Google Sheet
 * @param {string} cohortId - Cohort to assign all imported students to
 * @param {boolean} dryRun - If true, preview only (no writes)
 */
function handleBatchImportRequest(sheetUrl, cohortId, dryRun) {
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!sheetUrl || !cohortId) {
    return { success: false, error: 'Sheet URL and cohort are required' };
  }

  try {
    // Open the source sheet
    let sourceSheet;
    try {
      const sourceSpreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
      sourceSheet = sourceSpreadsheet.getSheets()[0];
    } catch (e) {
      return {
        success: false,
        error: 'Cannot access that Google Sheet. Make sure it is shared with "Anyone with the link" or owned by the same Google account running this system.'
      };
    }

    const sourceData = sourceSheet.getDataRange().getValues();
    if (sourceData.length < 2) {
      return { success: false, error: 'The sheet appears to be empty (no data rows found)' };
    }

    // Load existing students for duplicate checking
    const ss = SpreadsheetCache.getSpreadsheet();
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);
    const existingData = studentsSheet ? studentsSheet.getDataRange().getValues() : [[]];
    const existingEmails = new Set();
    for (let i = 1; i < existingData.length; i++) {
      const e = String(existingData[i][2] || '').trim().toLowerCase();
      if (e) existingEmails.add(e);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const results = { imported: [], skipped: [], errors: [] };

    // Skip header row (row 0), process data rows
    for (let i = 1; i < sourceData.length; i++) {
      const row = sourceData[i];
      const firstName = String(row[0] || '').trim();
      const lastName = String(row[1] || '').trim();
      const email = String(row[2] || '').trim().toLowerCase();

      // Validation
      if (!firstName && !lastName && !email) continue; // blank row — skip silently

      if (!firstName || !lastName) {
        results.errors.push({ row: i + 1, email: email || '(blank)', reason: 'Missing first or last name' });
        continue;
      }
      if (!email || !emailRegex.test(email)) {
        results.errors.push({ row: i + 1, email: email || '(blank)', reason: 'Invalid or missing email' });
        continue;
      }
      if (existingEmails.has(email)) {
        results.skipped.push({ row: i + 1, name: firstName + ' ' + lastName, email: email, reason: 'Already enrolled' });
        continue;
      }

      const fullName = firstName + ' ' + lastName;
      results.imported.push({ row: i + 1, name: fullName, email: email });
      existingEmails.add(email); // prevent intra-batch duplicates
    }

    if (dryRun) {
      // Preview only — return what would happen without writing
      return { success: true, preview: true, results: results };
    }

    // Commit: create pending records for all valid rows
    let created = 0;
    const successfulImports = [];
    for (const student of results.imported) {
      const createResult = addStudent('', student.name, student.email, cohortId);
      if (createResult.success) {
        created++;
        successfulImports.push(student);
      } else {
        results.errors.push({ name: student.name, email: student.email, reason: createResult.error });
      }
    }
    results.imported = successfulImports; // replace with only successful records

    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENTS);

    console.log('[BATCH_IMPORT] Created:', created, 'Skipped:', results.skipped.length, 'Errors:', results.errors.length);
    return {
      success: true,
      preview: false,
      created: created,
      results: results
    };

  } catch (error) {
    console.error('[BATCH_IMPORT] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// FIRST-LOGIN STUDENT SETUP
// ========================================

/**
 * Complete pending student setup — called when a pending student sets their ID for the first time
 * @param {string} name - Student's full name (used to find their record)
 * @param {string} email - Student's email (used to find their record)
 * @param {string} chosenClientId - The ID the student has chosen (e.g., '4521JS')
 */
function handleCompleteStudentSetupRequest(name, email, chosenClientId) {
  if (!name || !email || !chosenClientId) {
    return { success: false, error: 'Name, email, and chosen Student ID are required' };
  }

  // Validate ID format: 4 digits + 2 uppercase letters (e.g., 4521JS)
  const idRegex = /^\d{4}[A-Za-z]{2,3}$/;
  if (!idRegex.test(chosenClientId)) {
    return {
      success: false,
      error: 'Invalid ID format. Use your last 4 phone digits + your initials (e.g., 4521JS or 4521JSM).'
    };
  }

  const normalizedId = chosenClientId.toUpperCase();

  try {
    const ss = SpreadsheetCache.getSpreadsheet();
    const studentsSheet = ss.getSheetByName(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return { success: false, error: 'Student roster not found' };
    }

    const data = studentsSheet.getDataRange().getValues();

    // Check uniqueness — make sure no active student already has this ID
    for (let i = 1; i < data.length; i++) {
      const existingId = String(data[i][0] || '').trim().toUpperCase();
      if (existingId && existingId === normalizedId) {
        return {
          success: false,
          idTaken: true,
          error: 'That Student ID is already taken. Try adding your middle initial (e.g., ' + normalizedId.slice(0, 4) + normalizedId.slice(4) + 'M) or use a different variation.'
        };
      }
    }

    // Find the pending record matching name + email
    const normalizedName = name.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    let targetRow = -1;

    for (let i = 1; i < data.length; i++) {
      const rowName = String(data[i][1] || '').trim().toLowerCase();
      const rowEmail = String(data[i][2] || '').trim().toLowerCase();
      const rowStatus = String(data[i][3] || '').trim().toLowerCase();
      const rowClientId = String(data[i][0] || '').trim();

      if (rowStatus === 'pending' && !rowClientId && rowEmail === normalizedEmail && rowName === normalizedName) {
        targetRow = i;
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, error: 'No pending account found matching your name and email. Please contact support.' };
    }

    // Update the record: set Client_ID and change status to active
    studentsSheet.getRange(targetRow + 1, 1).setValue(normalizedId);  // Client_ID
    studentsSheet.getRange(targetRow + 1, 4).setValue('active');       // Status
    SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.STUDENTS);

    // Initialize tool access now that we have a real ID
    const initResult = ToolAccessControl.initializeStudent(normalizedId);
    if (!initResult.success) {
      return { success: false, error: 'Account activated but tool access setup failed: ' + initResult.error };
    }

    // Log activity
    DataService.logActivity(normalizedId, 'student_setup_complete', {
      toolId: '',
      details: 'Student completed first-login setup and set their Student ID'
    });

    console.log('[SETUP_COMPLETE] Student activated:', normalizedId);
    return {
      success: true,
      clientId: normalizedId,
      message: 'Setup complete! Your Student ID is ' + normalizedId
    };

  } catch (error) {
    console.error('[SETUP_COMPLETE] Error:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Create COHORTS sheet with Cohort 1 as default
 */
function createCohortsSheet(ss) {
  const cohortsSheet = ss.insertSheet(CONFIG.SHEETS.COHORTS);
  cohortsSheet.getRange(1, 1, 1, 5).setValues([[
    'Cohort_ID', 'Name', 'Start_Month', 'Start_Year', 'Status'
  ]]);
  cohortsSheet.appendRow(['cohort_1', 'Cohort 1', 'April', '2026', 'active']);
  SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.COHORTS);
  console.log('✅ COHORTS sheet created');
  return cohortsSheet;
}

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
