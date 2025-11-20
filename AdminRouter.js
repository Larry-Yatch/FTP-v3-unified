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
 *
 * VERSION: v3.9.0
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
