/**
 * Router.js - Registry-based routing
 *
 * Routes requests to tools dynamically based on ToolRegistry.
 * No hardcoded if/else statements!
 */

const Router = {

  /**
   * Route incoming request
   * @param {Object} e - Event object from doGet
   * @returns {HtmlOutput} Response
   */
  route(e) {
    try {
      const route = e.parameter.route || 'login';
      const params = e.parameter || {};

      LogUtils.debug(`Router: Handling route '${route}'`);

      // System routes (non-tool routes)
      if (this._isSystemRoute(route)) {
        return this._handleSystemRoute(route, params);
      }

      // Tool routes (check registry)
      const tool = ToolRegistry.findByRoute(route);

      if (tool) {
        return this._handleToolRoute(tool, params);
      }

      // Not found
      return this._handle404(route);

    } catch (error) {
      LogUtils.error('Router error: ' + error);
      return this._handleError(error);
    }
  },

  /**
   * Check if route is a system route
   * @private
   */
  _isSystemRoute(route) {
    const systemRoutes = ['login', 'dashboard', 'admin', 'admin-login', 'admin-dashboard', 'logout', 'tool1_report', 'tool2_report', 'tool3_report', 'tool5_report', 'tool7_report', 'tool8_report', 'results_summary', 'progress'];
    return systemRoutes.includes(route);
  },

  /**
   * Handle system routes
   * @private
   */
  _handleSystemRoute(route, params) {
    switch (route) {
      case 'login':
        return this._createLoginPage(params.message);

      case 'dashboard':
        return this._createDashboard(params);

      case 'admin':
      case 'admin-login':
        return this._createAdminLogin(params);

      case 'admin-dashboard':
        return this._createAdminDashboard(params);

      case 'logout':
        return this._handleLogout(params);

      case 'tool1_report':
        return Tool1Report.render(params.client || params.clientId);

      case 'tool2_report':
        return Tool2Report.render(params.client || params.clientId);

      case 'tool3_report':
        return Tool3Report.render(params.client || params.clientId);

      case 'tool5_report':
        return Tool5Report.render(params.client || params.clientId);

      case 'tool7_report':
        return Tool7Report.render(params.client || params.clientId);

      case 'tool8_report':
        return Tool8Report.render(params.client || params.clientId);

      case 'results_summary':
        return CollectiveResults.render(params.client || params.clientId);

      case 'progress':
        return ProgressPage.render(params.client || params.clientId);

      default:
        return this._handle404(route);
    }
  },

  /**
   * Handle tool routes
   * @private
   */
  _handleToolRoute(tool, params) {
    const clientId = params.client || params.clientId;
    const sessionId = params.session || params.sessionId;

    // Validate session if provided
    if (sessionId) {
      const validation = DataService.validateSession(sessionId);
      if (!validation.valid) {
        return this._createLoginPage('Session expired. Please log in again.');
      }
    }

    // Check tool access
    if (clientId) {
      const access = ToolAccessControl.canAccessTool(clientId, tool.id);
      if (!access.allowed) {
        return this._createAccessDeniedPage(tool, access.reason);
      }
    }

    // Load tool
    return this._loadTool(tool, params);
  },

  /**
   * Load tool UI
   * @private
   */
  _loadTool(tool, params) {
    try {
      const clientId = params.client || params.clientId;
      const sessionId = params.session || params.sessionId;
      const page = parseInt(params.page) || 1;

      // Log tool_started when accessing page 1 for first time (not edit mode)
      if (page === 1 && clientId) {
        if (params.editMode) {
          // Log edit_started when entering edit mode
          DataService.logActivity(clientId, 'edit_started', {
            toolId: tool.id,
            details: `Started editing ${tool.name}`
          });
        } else {
          const existingResponse = DataService.getToolResponse(clientId, tool.id);
          // Only log if this is truly the first time (no existing response or draft)
          if (!existingResponse || existingResponse.length === 0) {
            DataService.logActivity(clientId, 'tool_started', {
              toolId: tool.id,
              details: `Started ${tool.name}`
            });
          }
        }
      }

      // Initialize tool
      const initResult = FrameworkCore.initializeTool(tool.id, clientId);

      if (!initResult.success) {
        return this._handleError(new Error(initResult.error));
      }

      // Build params for tool render
      const renderParams = {
        clientId: clientId,
        sessionId: sessionId,
        insights: initResult.insights || [],
        adaptations: initResult.adaptations || {},
        page: page,
        // Pass through URL parameters for immediate navigation actions
        editMode: params.editMode,
        clearDraft: params.clearDraft
      };

      // Each tool implements its own render() method
      return tool.module.render(renderParams);

    } catch (error) {
      LogUtils.error('Error loading tool: ' + error);
      return this._handleError(error);
    }
  },

  /**
   * Create login page
   * @private
   */
  _createLoginPage(message) {
    const template = HtmlService.createTemplate(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial TruPath v3 - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          /* Load background FIRST to prevent white flash */
          html, body {
            background: linear-gradient(135deg, #4b4166, #1e192b);
            margin: 0;
            padding: 0;
          }
        </style>
        <?!= include('shared/styles') ?>
        <?!= include('shared/loading-animation') ?>
        <?!= include('shared/history-manager') ?>
      </head>
      <body id="loginPage">
        <div class="login-container">
          <div class="login-logo">TruPath Financial</div>
          <p class="login-subtitle">Your Journey to Financial Clarity</p>

          <div id="alertBox" class="message error" style="display: none;"></div>
          ${message ? `<div class="message error">${message}</div>` : ''}

          <!-- Primary Login Form -->
          <div id="primaryLogin">
            <form id="loginForm">
              <div class="form-group">
                <label class="form-label">Student ID</label>
                <p class="muted" style="font-size: 13px; margin: 5px 0 10px; line-height: 1.5;">
                  Your Student ID follows the pattern: <strong>Last 4 digits of your phone number</strong> + <strong>First 2 initials</strong><br>
                  <span style="opacity: 0.8;">Example: 1111AB</span>
                </p>
                <input type="text" name="clientId" id="clientId" placeholder="e.g., 1111AB" required>
              </div>
              <button type="submit" class="btn-primary" id="loginBtn">
                <span id="btnText">Sign In</span>
                <span id="btnSpinner" style="display: none;">
                  <span class="loading-spinner"></span> Loading...
                </span>
              </button>
            </form>

            <div style="text-align: center; margin: 20px 0;">
              <p class="muted" style="margin-bottom: 10px;">— OR —</p>
              <button type="button" class="btn-secondary" onclick="showBackupLogin()">
                Can't Remember Your ID?
              </button>
            </div>
          </div>

          <!-- Backup Login Form (hidden initially) -->
          <div id="backupLogin" style="display: none;">
            <button onclick="showPrimaryLogin()" class="btn-link" style="margin-bottom: 20px;">
              ← Back to Student ID login
            </button>

            <form id="backupForm">
              <p class="muted" style="margin-bottom: 20px; font-size: 14px;">
                Enter at least 2 of the following:
              </p>

              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" id="studentFirstName" name="firstName" placeholder="Your first name">
              </div>

              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" id="studentLastName" name="lastName" placeholder="Your last name">
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="studentEmail" name="email" placeholder="Your email address">
              </div>

              <button type="submit" class="btn-primary" id="backupBtn">
                <span id="backupBtnText">Look Up My Account</span>
                <span id="backupBtnSpinner" style="display: none;">
                  <span class="loading-spinner"></span> Searching...
                </span>
              </button>
            </form>
          </div>

          <p class="muted mt-20">v3.2.5 | Two-Path Authentication</p>
        </div>

        <script>
          // Show/hide alert messages
          function showAlert(message, isError) {
            const alertBox = document.getElementById('alertBox');
            alertBox.textContent = message;
            alertBox.className = isError ? 'message error' : 'message success';
            alertBox.style.display = 'block';
          }

          function hideAlert() {
            document.getElementById('alertBox').style.display = 'none';
          }

          // Toggle between primary and backup login
          function showPrimaryLogin() {
            document.getElementById('primaryLogin').style.display = 'block';
            document.getElementById('backupLogin').style.display = 'none';
            hideAlert();
          }

          function showBackupLogin() {
            document.getElementById('primaryLogin').style.display = 'none';
            document.getElementById('backupLogin').style.display = 'block';
            hideAlert();
          }

          // Primary login (Student ID)
          document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            hideAlert();

            const clientId = document.getElementById('clientId').value.trim();
            if (!clientId) {
              showAlert('Please enter your Student ID', true);
              return;
            }

            const btn = document.getElementById('loginBtn');
            const btnText = document.getElementById('btnText');
            const btnSpinner = document.getElementById('btnSpinner');

            // Show button loading state
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-flex';
            btnSpinner.style.alignItems = 'center';
            btnSpinner.style.gap = '8px';

            // Show loading overlay
            showLoading('Authenticating');

            // Authenticate and get dashboard in ONE call (faster!)
            google.script.run
                .withSuccessHandler(function(result) {
                  if (result && result.success) {
                    // Clear any stale location from previous session before loading dashboard
                    try {
                      sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                        view: 'dashboard',
                        toolId: null,
                        page: null,
                        clientId: result.clientId || studentIdInput.value.trim(),
                        timestamp: Date.now()
                      }));
                    } catch(e) {}
                    // Got dashboard HTML - load it
                    document.open();
                    document.write(result.dashboardHtml);
                    document.close();
                  } else {
                    hideLoading();
                    btn.disabled = false;
                    btnText.style.display = 'inline';
                    btnSpinner.style.display = 'none';
                    showAlert(result.error || 'Invalid Student ID', true);
                  }
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  btn.disabled = false;
                  btnText.style.display = 'inline';
                  btnSpinner.style.display = 'none';
                  showAlert('System error. Please try again.', true);
                })
                .authenticateAndGetDashboard(clientId);
          });

          // Backup login (Name/Email)
          document.getElementById('backupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            hideAlert();

            const firstName = document.getElementById('studentFirstName').value.trim();
            const lastName = document.getElementById('studentLastName').value.trim();
            const email = document.getElementById('studentEmail').value.trim();

            // Count provided fields
            let fieldCount = 0;
            if (firstName) fieldCount++;
            if (lastName) fieldCount++;
            if (email) fieldCount++;

            if (fieldCount < 2) {
              showAlert('Please provide at least 2 fields', true);
              return;
            }

            const btn = document.getElementById('backupBtn');
            const btnText = document.getElementById('backupBtnText');
            const btnSpinner = document.getElementById('backupBtnSpinner');

            // Show button loading state
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-flex';
            btnSpinner.style.alignItems = 'center';
            btnSpinner.style.gap = '8px';

            // Show loading overlay
            showLoading('Looking up your account');

            // Lookup and get dashboard in ONE call (faster!)
            google.script.run
                .withSuccessHandler(function(result) {
                  if (result && result.success) {
                    // Clear any stale location from previous session before loading dashboard
                    try {
                      sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                        view: 'dashboard',
                        toolId: null,
                        page: null,
                        clientId: result.clientId,
                        timestamp: Date.now()
                      }));
                    } catch(e) {}
                    // Got dashboard HTML - load it
                    document.open();
                    document.write(result.dashboardHtml);
                    document.close();
                  } else {
                    hideLoading();
                    btn.disabled = false;
                    btnText.style.display = 'inline';
                    btnSpinner.style.display = 'none';
                    showAlert(result.error || 'No matching account found', true);
                  }
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  btn.disabled = false;
                  btnText.style.display = 'inline';
                  btnSpinner.style.display = 'none';
                  showAlert('System error. Please try again.', true);
                })
                .lookupAndGetDashboard({ firstName: firstName, lastName: lastName, email: email });
          });
        </script>
      </body>
      </html>
    `);

    return template.evaluate()
      .setTitle('Financial TruPath - Login')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Create dashboard
   * @private
   */
  _createDashboard(params) {
    const clientId = params.client || params.clientId;
    const baseUrl = ScriptApp.getService().getUrl();

    // Handle discardDraft parameter - delete draft BEFORE checking status
    if (params.discardDraft) {
      const toolId = params.discardDraft; // e.g., 'tool1' or 'tool2'
      Logger.log(`Dashboard: Discarding draft for ${clientId} / ${toolId}`);
      DataService.cancelEditDraft(clientId, toolId);
      SpreadsheetApp.flush(); // Ensure changes are committed

      // Log draft discard activity
      DataService.logActivity(clientId, 'draft_discarded', {
        toolId: toolId,
        details: `Draft discarded for ${toolId}`
      });
    }

    // Helper: Auto-expire stale EDIT_DRAFTs older than 7 days
    function autoExpireStaleEdit(cId, toolId, latestResponse) {
      if (latestResponse && latestResponse.status === 'EDIT_DRAFT') {
        const editAge = Date.now() - new Date(latestResponse.timestamp).getTime();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        if (editAge > SEVEN_DAYS) {
          Logger.log(`Dashboard: Auto-expiring stale EDIT_DRAFT for ${cId}/${toolId} (${Math.round(editAge / 86400000)} days old)`);
          DataService.cancelEditDraft(cId, toolId);
          return DataService.getLatestResponse(cId, toolId);
        }
      }
      return latestResponse;
    }

    // Check Tool 1 status
    let tool1Latest = DataService.getLatestResponse(clientId, 'tool1');
    tool1Latest = autoExpireStaleEdit(clientId, 'tool1', tool1Latest);
    const tool1HasDraft = tool1Latest && (tool1Latest.status === 'DRAFT' || tool1Latest.status === 'EDIT_DRAFT');
    const tool1Completed = tool1Latest && tool1Latest.status === 'COMPLETED';

    // Check Tool 2 status
    let tool2Latest = DataService.getLatestResponse(clientId, 'tool2');
    tool2Latest = autoExpireStaleEdit(clientId, 'tool2', tool2Latest);
    const tool2HasDraft = tool2Latest && (tool2Latest.status === 'DRAFT' || tool2Latest.status === 'EDIT_DRAFT');
    const tool2Completed = tool2Latest && tool2Latest.status === 'COMPLETED';
    const tool2Access = ToolAccessControl.canAccessTool(clientId, 'tool2');

    // Check Tool 3 status
    let tool3Latest = DataService.getLatestResponse(clientId, 'tool3');
    tool3Latest = autoExpireStaleEdit(clientId, 'tool3', tool3Latest);
    const tool3HasDraft = tool3Latest && (tool3Latest.status === 'DRAFT' || tool3Latest.status === 'EDIT_DRAFT');
    const tool3Completed = tool3Latest && tool3Latest.status === 'COMPLETED';
    const tool3Access = ToolAccessControl.canAccessTool(clientId, 'tool3');

    // Check Tool 4 status
    let tool4Latest = DataService.getLatestResponse(clientId, 'tool4');
    tool4Latest = autoExpireStaleEdit(clientId, 'tool4', tool4Latest);
    const tool4HasDraft = tool4Latest && (tool4Latest.status === 'DRAFT' || tool4Latest.status === 'EDIT_DRAFT');
    const tool4Completed = tool4Latest && tool4Latest.status === 'COMPLETED';
    const tool4Access = ToolAccessControl.canAccessTool(clientId, 'tool4');

    // Build Tool 4 card HTML based on status
    let tool4CardHTML = '';
    if (tool4Completed) {
      const completedDate = new Date(tool4Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      tool4CardHTML = `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 4: Financial Freedom Framework</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool4Calculator()">
              💰 Open Calculator
            </button>
          </div>
        </div>

        <script>
          function viewTool4Calculator() {
            showLoading('Loading Calculator');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading calculator: ' + error.message);
              })
              .getToolPageHtml('tool4', '${clientId}', 1);
          }
        </script>
      `;
    } else if (tool4Access.allowed) {
      tool4CardHTML = `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 4: Financial Freedom Framework</h3>
          <p class="muted">Discover your optimal budget allocation across 4 buckets (M/E/F/J)</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="openTool4()">
            💰 Open Calculator
          </button>
        </div>

        <script>
          function openTool4() {
            showLoading('Loading Calculator');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading calculator: ' + error.message);
              })
              .getToolPageHtml('tool4', '${clientId}', 1);
          }
        </script>
      `;
    } else {
      tool4CardHTML = `
        <div class="tool-card locked" style="margin-bottom: 15px; opacity: 0.6;">
          <h3>Tool 4: Financial Freedom Framework</h3>
          <p class="muted">Budget allocation calculator</p>
          <span class="badge" style="background: #9E9E9E; color: white;">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 0.9rem;">
            ${tool4Access.reason || 'Complete Tool 3 to unlock'}
          </p>
        </div>
      `;
    }

    // Check Tool 5 status
    let tool5Latest = DataService.getLatestResponse(clientId, 'tool5');
    tool5Latest = autoExpireStaleEdit(clientId, 'tool5', tool5Latest);
    const tool5HasDraft = tool5Latest && (tool5Latest.status === 'DRAFT' || tool5Latest.status === 'EDIT_DRAFT');
    const tool5Completed = tool5Latest && tool5Latest.status === 'COMPLETED';
    const tool5Access = ToolAccessControl.canAccessTool(clientId, 'tool5');

    // Check Tool 6 status
    let tool6Latest = DataService.getLatestResponse(clientId, 'tool6');
    tool6Latest = autoExpireStaleEdit(clientId, 'tool6', tool6Latest);
    const tool6HasDraft = tool6Latest && (tool6Latest.status === 'DRAFT' || tool6Latest.status === 'EDIT_DRAFT');
    const tool6Completed = tool6Latest && tool6Latest.status === 'COMPLETED';
    const tool6Access = ToolAccessControl.canAccessTool(clientId, 'tool6');

    // Check Tool 7 status
    let tool7Latest = DataService.getLatestResponse(clientId, 'tool7');
    tool7Latest = autoExpireStaleEdit(clientId, 'tool7', tool7Latest);
    const tool7HasDraft = tool7Latest && (tool7Latest.status === 'DRAFT' || tool7Latest.status === 'EDIT_DRAFT');
    const tool7Completed = tool7Latest && tool7Latest.status === 'COMPLETED';
    const tool7Access = ToolAccessControl.canAccessTool(clientId, 'tool7');

    // Check Tool 8 status
    let tool8Latest = DataService.getLatestResponse(clientId, 'tool8');
    tool8Latest = autoExpireStaleEdit(clientId, 'tool8', tool8Latest);
    const tool8Completed = tool8Latest && tool8Latest.status === 'COMPLETED';
    const tool8Access = ToolAccessControl.canAccessTool(clientId, 'tool8');

    // Calculate completion count for summary card
    const completedToolCount = [tool1Completed, tool2Completed, tool3Completed, tool4Completed,
                                tool5Completed, tool6Completed, tool7Completed, tool8Completed]
                                .filter(Boolean).length;
    const completionPct = Math.round((completedToolCount / 8) * 100);

    // Build Tool 1 card HTML based on status
    let tool1CardHTML = '';

    if (tool1Completed) {
      // Completed state - show View/Edit/Retake
      const completedDate = new Date(tool1Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      tool1CardHTML = `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 1: Core Trauma Strategy Assessment</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewReport()">
              📊 View Report
            </button>
            <button class="btn-secondary" onclick="editResponse()">
              ✏️ Edit Answers
            </button>
            <button class="btn-secondary" onclick="retakeTool()">
              🔄 Start Fresh
            </button>
          </div>
        </div>
      `;
    } else if (tool1HasDraft) {
      // Draft state - show Continue/Cancel
      tool1CardHTML = `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 1: Core Trauma Strategy Assessment</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">
            ${tool1Latest.status === 'EDIT_DRAFT' ? 'You have unsaved edits' : 'You have a draft in progress'}
          </p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="continueTool1()">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="discardTool1Draft()">
              ❌ Discard Draft
            </button>
          </div>
        </div>
      `;
    } else {
      // Not started - show Start button
      tool1CardHTML = `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 1: Core Trauma Strategy Assessment</h3>
          <p class="muted">Begin your financial journey with a comprehensive assessment</p>
          <span class="badge">Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool1()">
            Start Assessment
          </button>
        </div>
      `;
    }

    const template = HtmlService.createTemplate(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial TruPath - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          /* Prevent white flash - load this FIRST before anything else */
          html {
            background: #1e192b;
          }
          body {
            background: linear-gradient(135deg, #4b4166, #1e192b);
            background-attachment: fixed;
            margin: 0;
            padding: 0;
            opacity: 0;
            transition: opacity 0.3s ease-in;
          }
          body.loaded {
            opacity: 1;
          }
        </style>
        <?!= include('shared/styles') ?>
        <?!= include('shared/loading-animation') ?>
        <?!= include('shared/history-manager') ?>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div class="tool-header" style="flex: 1;">
                <h1>Welcome to TruPath Financial</h1>
                <p class="muted">Your personalized financial journey dashboard</p>
              </div>
              <button class="btn-secondary" onclick="logout()" style="flex-shrink: 0; font-size: 0.85rem; padding: 6px 14px;">Logout</button>
            </div>
            <div class="hr"></div>
            <div class="tool-meta">
              <span>Student: ${clientId || 'Unknown'}</span>
              <span class="badge">v3.0 Active</span>
            </div>
          </div>

          <!-- Results Summary Card -->
          <div class="card" style="border: 1px solid var(--gold, #ad9168); background: linear-gradient(135deg, rgba(173, 145, 104, 0.12) 0%, rgba(20, 15, 35, 0.95) 100%);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <h2 style="margin-bottom: 4px;">Your Results Summary</h2>
                <p class="muted" style="margin: 0;">${completedToolCount} of 8 tools completed</p>
              </div>
              <span class="badge" style="background: var(--gold, #ad9168); color: #140f23; font-weight: 600;">${completionPct}%</span>
            </div>
            <div style="margin: 12px 0 8px; height: 6px; background: rgba(173, 145, 104, 0.15); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${completionPct}%; background: var(--gold, #ad9168); border-radius: 3px; transition: width 0.6s ease;"></div>
            </div>
            ${completedToolCount > 0
              ? '<div style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">'
                + '<button class="btn-primary" onclick="viewResultsSummary()">View Collective Results</button>'
                + '<button class="btn-secondary" onclick="viewProgress()" style="border: 1px solid rgba(173, 145, 104, 0.3); background: rgba(173, 145, 104, 0.1); color: #ad9168;">Progress Over Time</button>'
                + '</div>'
              : '<p class="muted" style="margin-top: 8px; font-size: 0.9rem;">Complete your first tool to see results here.</p>'}
          </div>

          <div class="card">
            <h2>Your Tools</h2>
            <p class="muted mb-20">Complete each tool in order to unlock the next.</p>

            ${tool1CardHTML}

            ${this._buildTool2Card(clientId, baseUrl, tool2Latest, tool2HasDraft, tool2Completed, tool2Access)}

            ${this._buildTool3Card(clientId, baseUrl, tool3Latest, tool3HasDraft, tool3Completed, tool3Access)}

            ${tool4CardHTML}

            ${this._buildTool5Card(clientId, baseUrl, tool5Latest, tool5HasDraft, tool5Completed, tool5Access)}

            ${this._buildTool6Card(clientId, baseUrl, tool6Latest, tool6HasDraft, tool6Completed, tool6Access)}

            ${this._buildTool7Card(clientId, baseUrl, tool7Latest, tool7HasDraft, tool7Completed, tool7Access)}

            ${this._buildTool8Card(clientId, tool8Latest, tool8Completed, tool8Access)}
          </div>

        </div>

        <script>
          (function() {
            const baseUrl = '${baseUrl}';
            const clientId = '${clientId}';

            // Make functions global so onclick handlers can access them
            window.viewReport = viewReport;
            window.editResponse = editResponse;
            window.retakeTool = retakeTool;
            window.continueTool1 = continueTool1;
            window.discardTool1Draft = discardTool1Draft;
            window.startTool1 = startTool1;
            window.logout = logout;
            window.viewResultsSummary = viewResultsSummary;
            window.viewProgress = viewProgress;

            // Helper to save location to sessionStorage for refresh recovery
            function saveLocationForRefresh(view, toolId, page) {
              try {
                sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                  view: view,
                  toolId: toolId || null,
                  page: page || null,
                  clientId: clientId,
                  timestamp: Date.now()
                }));
              } catch(e) {}
            }

            // View report - navigate using document.write() pattern
            function viewReport() {
              showLoading('Loading Report');

              google.script.run
                .withSuccessHandler(function(reportHtml) {
                  saveLocationForRefresh('report', 'tool1', null);
                  document.open();
                  document.write(reportHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Report navigation error:', error);
                  alert('Error loading report: ' + error.message);
                })
                .getReportPage(clientId, 'tool1');
            }

            // Edit response - navigate using document.write() pattern
            function editResponse() {
              showLoading('Loading your responses...');

              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  saveLocationForRefresh('tool', 'tool1', 1);
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Edit navigation error:', error);
                  alert('Error loading assessment: ' + error.message);
                })
                .getToolPageWithOptions('tool1', clientId, 1, { editMode: true });
            }

            // Retake tool - navigate using document.write() pattern
            function retakeTool() {
              if (confirm('Start a completely fresh assessment? This will clear any drafts but keep your previous completed response.')) {
                showLoading('Preparing fresh assessment...');

                google.script.run
                  .withSuccessHandler(function(pageHtml) {
                    saveLocationForRefresh('tool', 'tool1', 1);
                    document.open();
                    document.write(pageHtml);
                    document.close();
                    window.scrollTo(0, 0);
                  })
                  .withFailureHandler(function(error) {
                    hideLoading();
                    console.error('Retake navigation error:', error);
                    alert('Error starting assessment: ' + error.message);
                  })
                  .getToolPageWithOptions('tool1', clientId, 1, { clearDraft: true });
              }
            }

            // Continue Tool 1 - navigate using document.write() pattern
            function continueTool1() {
              showLoading('Loading Assessment');

              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  saveLocationForRefresh('tool', 'tool1', 1);
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Continue navigation error:', error);
                  alert('Error loading assessment: ' + error.message);
                })
                .getToolPageHtml('tool1', clientId, 1);
            }

            // Discard Tool 1 Draft - navigate using document.write() pattern
            function discardTool1Draft() {
              if (confirm('Discard this draft? Your last completed submission will be preserved.')) {
                showLoading('Discarding draft...');

                google.script.run
                  .withSuccessHandler(function(dashboardHtml) {
                    saveLocationForRefresh('dashboard', null, null);
                    document.open();
                    document.write(dashboardHtml);
                    document.close();
                    window.scrollTo(0, 0);
                  })
                  .withFailureHandler(function(error) {
                    hideLoading();
                    console.error('Discard draft error:', error);
                    alert('Error discarding draft: ' + error.message);
                  })
                  .discardDraftAndGetDashboard(clientId, 'tool1');
              }
            }

            // Start Tool 1 - navigate using document.write() pattern
            function startTool1() {
              showLoading('Loading Assessment');

              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  saveLocationForRefresh('tool', 'tool1', 1);
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Start navigation error:', error);
                  alert('Error starting assessment: ' + error.message);
                })
                .getToolPageHtml('tool1', clientId, 1);
            }

            // View Results Summary - navigate using document.write() pattern
            function viewResultsSummary() {
              showLoading('Loading Results Summary');

              google.script.run
                .withSuccessHandler(function(summaryHtml) {
                  saveLocationForRefresh('results_summary', null, null);
                  document.open();
                  document.write(summaryHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Results summary navigation error:', error);
                  alert('Error loading results summary: ' + error.message);
                })
                .getResultsSummaryPage(clientId);
            }

            // View Progress Over Time - navigate using document.write() pattern
            function viewProgress() {
              showLoading('Loading Progress');

              google.script.run
                .withSuccessHandler(function(progressHtml) {
                  saveLocationForRefresh('progress', null, null);
                  document.open();
                  document.write(progressHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Progress page navigation error:', error);
                  alert('Error loading progress page: ' + error.message);
                })
                .getProgressPage(clientId);
            }

            // Logout - navigate to login page
            function logout() {
              showLoading('Logging out');

              // Clear stored location on logout
              try {
                sessionStorage.removeItem('_ftpCurrentLocation');
              } catch(e) {}

              google.script.run
                .withSuccessHandler(function(loginHtml) {
                  document.open();
                  document.write(loginHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  // Fallback - try direct navigation for logout
                  window.top.location.replace(baseUrl + '?route=login');
                })
                .getLoginPage();
            }

          // Fade in page once loaded
          window.addEventListener('load', function() {
            document.body.classList.add('loaded');

            // Initialize history manager for browser back button support
            if (typeof initHistoryManager === 'function') {
              initHistoryManager(clientId, baseUrl);
            }
          });

          // Fallback: show page after 100ms even if not fully loaded
          setTimeout(function() {
            document.body.classList.add('loaded');
          }, 100);
          })(); // End IIFE
        </script>

        <?!= FeedbackWidget.render('${clientId}', 'dashboard', 'main') ?>
      </body>
      </html>
    `);

    return template.evaluate()
      .setTitle('Financial TruPath - Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Build Tool 2 card dynamically based on access and status
   * @private
   */
  _buildTool2Card(clientId, baseUrl, tool2Latest, tool2HasDraft, tool2Completed, tool2Access) {
    if (tool2Completed) {
      // Completed state - show View/Edit/Retake
      const completedDate = new Date(tool2Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 2: Financial Clarity & Values</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool2Report()">
              📊 View Report
            </button>
            <button class="btn-secondary" onclick="editTool2Response()">
              ✏️ Edit Answers
            </button>
            <button class="btn-secondary" onclick="retakeTool2()">
              🔄 Start Fresh
            </button>
          </div>
        </div>

        <script>
          function viewTool2Report() {
            showLoading('Loading Report');
            google.script.run
              .withSuccessHandler(function(reportHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('report', 'tool2', null, '${clientId}');
                document.open();
                document.write(reportHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading report: ' + error.message);
              })
              .getReportPage('${clientId}', 'tool2');
          }

          function editTool2Response() {
            showLoading('Loading your responses...');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool2', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageWithOptions('tool2', '${clientId}', 1, { editMode: true });
          }

          function retakeTool2() {
            if (confirm('Start fresh? This will discard your current response.')) {
              showLoading('Starting Fresh');
              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool2', 1, '${clientId}');
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error starting assessment: ' + error.message);
                })
                .getToolPageWithOptions('tool2', '${clientId}', 1, { clearDraft: true });
            }
          }
        </script>
      `;
    } else if (tool2HasDraft) {
      // Draft state - show Continue/Cancel
      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 2: Financial Clarity & Values</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">
            ${tool2Latest.status === 'EDIT_DRAFT' ? 'You have unsaved edits' : 'You have a draft in progress'}
          </p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="continueTool2()">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="discardTool2Draft()">
              ❌ Discard Draft
            </button>
          </div>
        </div>

        <script>
          function continueTool2() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool2', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageHtml('tool2', '${clientId}', 1);
          }

          function discardTool2Draft() {
            if (confirm('Discard this draft? Your last completed submission will be preserved.')) {
              showLoading('Discarding draft...');
              google.script.run
                .withSuccessHandler(function(dashboardHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('dashboard', null, null, '${clientId}');
                  document.open();
                  document.write(dashboardHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error discarding draft: ' + error.message);
                })
                .discardDraftAndGetDashboard('${clientId}', 'tool2');
            }
          }
        </script>
      `;
    } else if (tool2Access.allowed) {
      // Accessible but not started - show Start button
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 2: Financial Clarity & Values</h3>
          <p class="muted">Comprehensive assessment of your financial situation and values</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool2()">
            Start Assessment
          </button>
        </div>

        <script>
          function startTool2() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool2', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error starting assessment: ' + error.message);
              })
              .getToolPageHtml('tool2', '${clientId}', 1);
          }
        </script>
      `;
    } else {
      // Locked - show reason
      return `
        <div class="tool-card locked" style="margin-bottom: 15px;">
          <h3>Tool 2: Financial Clarity & Values</h3>
          <p class="muted">Comprehensive assessment of your financial situation and values</p>
          <span class="badge">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 14px;">
            ${tool2Access.reason || 'Complete previous tools to unlock'}
          </p>
        </div>
      `;
    }
  },

  _buildTool3Card(clientId, baseUrl, tool3Latest, tool3HasDraft, tool3Completed, tool3Access) {
    if (tool3Completed) {
      const completedDate = new Date(tool3Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 3: Identity & Validation</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool3Report()">
              📊 View Report
            </button>
            <button class="btn-secondary" onclick="editTool3Response()">
              ✏️ Edit Answers
            </button>
            <button class="btn-secondary" onclick="retakeTool3()">
              🔄 Start Fresh
            </button>
          </div>
        </div>

        <script>
          function viewTool3Report() {
            showLoading('Loading Report');
            google.script.run
              .withSuccessHandler(function(reportHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('report', 'tool3', null, '${clientId}');
                document.open();
                document.write(reportHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading report: ' + error.message);
              })
              .getReportPage('${clientId}', 'tool3');
          }

          function editTool3Response() {
            showLoading('Loading your responses...');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool3', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageWithOptions('tool3', '${clientId}', 1, { editMode: true });
          }

          function retakeTool3() {
            if (confirm('Start a completely fresh assessment? This will clear any drafts but keep your previous completed response.')) {
              showLoading('Preparing fresh assessment...');
              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool3', 1, '${clientId}');
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error starting assessment: ' + error.message);
                })
                .getToolPageWithOptions('tool3', '${clientId}', 1, { clearDraft: true });
            }
          }
        </script>
      `;
    } else if (tool3HasDraft) {
      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 3: Identity & Validation</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">You have a draft in progress</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="continueTool3()">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="discardTool3Draft()">
              ❌ Discard Draft
            </button>
          </div>
        </div>

        <script>
          function continueTool3() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool3', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageHtml('tool3', '${clientId}', 1);
          }

          function discardTool3Draft() {
            if (confirm('Discard this draft? Your last completed submission will be preserved.')) {
              showLoading('Discarding draft...');
              google.script.run
                .withSuccessHandler(function(dashboardHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('dashboard', null, null, '${clientId}');
                  document.open();
                  document.write(dashboardHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error discarding draft: ' + error.message);
                })
                .discardDraftAndGetDashboard('${clientId}', 'tool3');
            }
          }
        </script>
      `;
    } else if (tool3Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 3: Identity & Validation</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from self</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool3()">
            Start Assessment
          </button>
        </div>

        <script>
          function startTool3() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool3', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error starting assessment: ' + error.message);
              })
              .getToolPageHtml('tool3', '${clientId}', 1);
          }
        </script>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px;">
          <h3>Tool 3: Identity & Validation</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from self</p>
          <span class="badge">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 14px;">
            ${tool3Access.reason || 'Complete previous tools to unlock'}
          </p>
        </div>
      `;
    }
  },

  _buildTool5Card(clientId, baseUrl, tool5Latest, tool5HasDraft, tool5Completed, tool5Access) {
    if (tool5Completed) {
      const completedDate = new Date(tool5Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 5: Love & Connection</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool5Report()">
              📊 View Report
            </button>
            <button class="btn-secondary" onclick="editTool5Response()">
              ✏️ Edit Answers
            </button>
            <button class="btn-secondary" onclick="retakeTool5()">
              🔄 Start Fresh
            </button>
          </div>
        </div>

        <script>
          function viewTool5Report() {
            showLoading('Loading Report');
            google.script.run
              .withSuccessHandler(function(reportHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('report', 'tool5', null, '${clientId}');
                document.open();
                document.write(reportHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading report: ' + error.message);
              })
              .getReportPage('${clientId}', 'tool5');
          }

          function editTool5Response() {
            showLoading('Loading your responses...');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool5', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageWithOptions('tool5', '${clientId}', 1, { editMode: true });
          }

          function retakeTool5() {
            if (confirm('Start a completely fresh assessment? This will clear any drafts but keep your previous completed response.')) {
              showLoading('Preparing fresh assessment...');
              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool5', 1, '${clientId}');
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error starting assessment: ' + error.message);
                })
                .getToolPageWithOptions('tool5', '${clientId}', 1, { clearDraft: true });
            }
          }
        </script>
      `;
    } else if (tool5HasDraft) {
      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 5: Love & Connection</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">You have a draft in progress</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="continueTool5()">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="discardTool5Draft()">
              ❌ Discard Draft
            </button>
          </div>
        </div>

        <script>
          function continueTool5() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool5', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageHtml('tool5', '${clientId}', 1);
          }

          function discardTool5Draft() {
            if (confirm('Discard this draft? Your last completed submission will be preserved.')) {
              showLoading('Discarding draft...');
              google.script.run
                .withSuccessHandler(function(dashboardHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('dashboard', null, null, '${clientId}');
                  document.open();
                  document.write(dashboardHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error discarding draft: ' + error.message);
                })
                .discardDraftAndGetDashboard('${clientId}', 'tool5');
            }
          }
        </script>
      `;
    } else if (tool5Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 5: Love & Connection</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from others</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool5()">
            Start Assessment
          </button>
        </div>

        <script>
          function startTool5() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool5', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error starting assessment: ' + error.message);
              })
              .getToolPageHtml('tool5', '${clientId}', 1);
          }
        </script>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px;">
          <h3>Tool 5: Love & Connection</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from others</p>
          <span class="badge">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 14px;">
            ${tool5Access.reason || 'Complete previous tools to unlock'}
          </p>
        </div>
      `;
    }
  },

  _buildTool6Card(clientId, baseUrl, tool6Latest, tool6HasDraft, tool6Completed, tool6Access) {
    // Tool 6 is a single-page calculator (like Tool 4), not a multi-page assessment
    if (tool6Completed) {
      const completedDate = new Date(tool6Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 6: Retirement Blueprint</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="openTool6Calculator()">
              📊 Open Calculator
            </button>
          </div>
        </div>

        <script>
          function openTool6Calculator() {
            showLoading('Loading Calculator');
            google.script.run.withSuccessHandler(function(h){document.open();document.write(h);document.close();window.scrollTo(0,0);}).withFailureHandler(function(e){hideLoading();alert('Error: '+e.message);}).getToolPageHtml('tool6','${clientId}',1);
          }
        </script>
      `;
    } else if (tool6Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 6: Retirement Blueprint</h3>
          <p class="muted">Optimize your retirement vehicle allocations for maximum tax efficiency</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool6()">
            📊 Open Calculator
          </button>
        </div>
        <script>
          function startTool6(){showLoading('Loading Calculator');google.script.run.withSuccessHandler(function(h){document.open();document.write(h);document.close();window.scrollTo(0,0);}).withFailureHandler(function(e){hideLoading();alert('Error: '+e.message);}).getToolPageHtml('tool6','${clientId}',1);}
        </script>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px; opacity: 0.6;">
          <h3>Tool 6: Retirement Blueprint</h3>
          <p class="muted">Retirement vehicle allocation calculator</p>
          <span class="badge" style="background: #9E9E9E; color: white;">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 0.9rem;">
            ${tool6Access.reason || 'Complete Tool 5 to unlock'}
          </p>
        </div>
      `;
    }
  },

  _buildTool7Card(clientId, baseUrl, tool7Latest, tool7HasDraft, tool7Completed, tool7Access) {
    if (tool7Completed) {
      const completedDate = new Date(tool7Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 7: Security & Control</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool7Report()">
              📊 View Report
            </button>
            <button class="btn-secondary" onclick="editTool7Response()">
              ✏️ Edit Answers
            </button>
            <button class="btn-secondary" onclick="retakeTool7()">
              🔄 Start Fresh
            </button>
          </div>
        </div>
        <script>
          function viewTool7Report() {
            showLoading('Loading Report');
            google.script.run
              .withSuccessHandler(function(reportHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('report', 'tool7', null, '${clientId}');
                document.open();
                document.write(reportHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading report: ' + error.message);
              })
              .getReportPage('${clientId}', 'tool7');
          }

          function editTool7Response() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool7', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageWithOptions('tool7', '${clientId}', 1, { editMode: true });
          }

          function retakeTool7() {
            if (confirm('Start fresh? This will create a new assessment while preserving your previous results.')) {
              showLoading('Starting Fresh Assessment');
              google.script.run
                .withSuccessHandler(function(pageHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool7', 1, '${clientId}');
                  document.open();
                  document.write(pageHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error starting assessment: ' + error.message);
                })
                .getToolPageWithOptions('tool7', '${clientId}', 1, { clearDraft: true });
            }
          }
        </script>
      `;
    } else if (tool7HasDraft) {
      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 7: Security & Control</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">You have a draft in progress</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="continueTool7()">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="discardTool7Draft()">
              ❌ Discard Draft
            </button>
          </div>
        </div>

        <script>
          function continueTool7() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool7', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error loading assessment: ' + error.message);
              })
              .getToolPageHtml('tool7', '${clientId}', 1);
          }

          function discardTool7Draft() {
            if (confirm('Discard this draft? Your last completed submission will be preserved.')) {
              showLoading('Discarding draft...');
              google.script.run
                .withSuccessHandler(function(dashboardHtml) {
                  if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('dashboard', null, null, '${clientId}');
                  document.open();
                  document.write(dashboardHtml);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  alert('Error discarding draft: ' + error.message);
                })
                .discardDraftAndGetDashboard('${clientId}', 'tool7');
            }
          }
        </script>
      `;
    } else if (tool7Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 7: Security & Control</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from trust</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool7()">
            Start Assessment
          </button>
        </div>

        <script>
          function startTool7() {
            showLoading('Loading Assessment');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool7', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error starting assessment: ' + error.message);
              })
              .getToolPageHtml('tool7', '${clientId}', 1);
          }
        </script>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px;">
          <h3>Tool 7: Security & Control</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from trust</p>
          <span class="badge">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 14px;">
            ${tool7Access.reason || 'Complete previous tools to unlock'}
          </p>
        </div>
      `;
    }
  },

  _buildTool8Card(clientId, tool8Latest, tool8Completed, tool8Access) {
    // Tool 8 is a single-page calculator (like Tool 4/6)
    if (tool8Completed) {
      const completedDate = new Date(tool8Latest.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #4CAF50;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">Tool 8: Investment Planning</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="openTool8Calculator()">
              📈 Open Calculator
            </button>
          </div>
        </div>

        <script>
          function openTool8Calculator() {
            showLoading('Loading Calculator');
            google.script.run.withSuccessHandler(function(h){document.open();document.write(h);document.close();window.scrollTo(0,0);}).withFailureHandler(function(e){hideLoading();alert('Error: '+e.message);}).getToolPageHtml('tool8','${clientId}',1);
          }
        </script>
      `;
    } else if (tool8Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 8: Investment Planning</h3>
          <p class="muted">Retirement investment calculator with scenario planning and comparison</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="startTool8()">
            📈 Open Calculator
          </button>
        </div>
        <script>
          function startTool8() {
            showLoading('Loading Calculator');
            google.script.run
              .withSuccessHandler(function(pageHtml) {
                if (typeof saveLocationForRefresh === 'function') saveLocationForRefresh('tool', 'tool8', 1, '${clientId}');
                document.open();
                document.write(pageHtml);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(error) {
                hideLoading();
                alert('Error: ' + error.message);
              })
              .getToolPageHtml('tool8', '${clientId}', 1);
          }
        </script>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px; opacity: 0.6;">
          <h3>Tool 8: Investment Planning</h3>
          <p class="muted">Retirement investment calculator</p>
          <span class="badge" style="background: #9E9E9E; color: white;">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 0.9rem;">
            ${tool8Access.reason || 'Complete Tool 7 to unlock'}
          </p>
        </div>
      `;
    }
  },

  /**
   * Create admin login page
   * @private
   */
  _createAdminLogin(params) {
    const template = HtmlService.createTemplateFromFile('html/AdminLogin');
    template.getScriptUrl = () => ScriptApp.getService().getUrl();
    return template.evaluate()
      .setTitle('Admin Login - Financial TruPath')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Create admin dashboard
   * @private
   */
  _createAdminDashboard(params) {
    const template = HtmlService.createTemplateFromFile('html/AdminDashboard');
    template.getScriptUrl = () => ScriptApp.getService().getUrl();
    return template.evaluate()
      .setTitle('Admin Dashboard - Financial TruPath')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Handle logout
   * @private
   */
  _handleLogout(params) {
    return this._createLoginPage('You have been logged out.');
  },

  /**
   * Handle access denied
   * @private
   */
  _createAccessDeniedPage(tool, reason) {
    return HtmlService.createHtmlOutput(`
      <h1>Access Denied</h1>
      <p>You cannot access ${tool.manifest.name} yet.</p>
      <p>Reason: ${reason}</p>
      <a href="${ScriptApp.getService().getUrl()}?route=dashboard">Back to Dashboard</a>
    `);
  },

  /**
   * Handle 404
   * @private
   */
  _handle404(route) {
    return HtmlService.createHtmlOutput(`
      <h1>404 - Not Found</h1>
      <p>Route not found: ${route}</p>
      <a href="${ScriptApp.getService().getUrl()}?route=login">Go to Login</a>
    `);
  },

  /**
   * Handle errors
   * @private
   */
  _handleError(error) {
    LogUtils.error('Route handler error: ' + error);
    return HtmlService.createHtmlOutput(
      NavigationHelpers.renderErrorPage('Error', error, null)
    );
  }
};
