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

      console.log(`Router: Handling route '${route}'`);

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
      console.error('Router error:', error);
      return this._handleError(error);
    }
  },

  /**
   * Check if route is a system route
   * @private
   */
  _isSystemRoute(route) {
    const systemRoutes = ['login', 'dashboard', 'admin', 'logout', 'tool1_report', 'tool2_report', 'tool3_report', 'tool5_report'];
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
        return this._createAdminPanel(params);

      case 'logout':
        return this._handleLogout(params);

      case 'tool1_report':
        return Tool1Report.render(params.client || params.clientId);

      case 'tool2_report':
        return Tool2Report.render(params.client || params.clientId);

      case 'tool3_report':
        return Tool3Report.regenerate(params.client || params.clientId);

      case 'tool5_report':
        return Tool5Report.regenerate(params.client || params.clientId);

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
        page: parseInt(params.page) || 1,
        // Pass through URL parameters for immediate navigation actions
        editMode: params.editMode,
        clearDraft: params.clearDraft
      };

      // Each tool implements its own render() method
      return tool.module.render(renderParams);

    } catch (error) {
      console.error('Error loading tool:', error);
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
                <input type="text" name="clientId" id="clientId" placeholder="Enter your student ID" required>
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
    }

    // Check Tool 1 status
    const tool1Latest = DataService.getLatestResponse(clientId, 'tool1');
    const tool1HasDraft = tool1Latest && (tool1Latest.status === 'DRAFT' || tool1Latest.status === 'EDIT_DRAFT');
    const tool1Completed = tool1Latest && tool1Latest.status === 'COMPLETED';

    // Check Tool 2 status
    const tool2Latest = DataService.getLatestResponse(clientId, 'tool2');
    const tool2HasDraft = tool2Latest && (tool2Latest.status === 'DRAFT' || tool2Latest.status === 'EDIT_DRAFT');
    const tool2Completed = tool2Latest && tool2Latest.status === 'COMPLETED';
    const tool2Access = ToolAccessControl.canAccessTool(clientId, 'tool2');

    // Check Tool 3 status
    const tool3Latest = DataService.getLatestResponse(clientId, 'tool3');
    const tool3HasDraft = tool3Latest && (tool3Latest.status === 'DRAFT' || tool3Latest.status === 'EDIT_DRAFT');
    const tool3Completed = tool3Latest && tool3Latest.status === 'COMPLETED';
    const tool3Access = ToolAccessControl.canAccessTool(clientId, 'tool3');

    // Check Tool 5 status
    const tool5Latest = DataService.getLatestResponse(clientId, 'tool5');
    const tool5HasDraft = tool5Latest && (tool5Latest.status === 'DRAFT' || tool5Latest.status === 'EDIT_DRAFT');
    const tool5Completed = tool5Latest && tool5Latest.status === 'COMPLETED';
    const tool5Access = ToolAccessControl.canAccessTool(clientId, 'tool5');

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
            <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool1&client=${clientId}&page=1'">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="if(confirm('Discard your draft and lose all progress?')) { showLoading('Discarding draft...'); window.top.location.href='${baseUrl}?route=dashboard&client=${clientId}&discardDraft=tool1'; }">
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
          <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool1&client=${clientId}'">
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
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="tool-header">
              <h1>Welcome to TruPath Financial</h1>
              <p class="muted">Your personalized financial journey dashboard</p>
            </div>
            <div class="hr"></div>
            <div class="tool-meta">
              <span>Student: ${clientId || 'Unknown'}</span>
              <span class="badge">v3.0 Active</span>
            </div>
          </div>

          <div class="card">
            <h2>Your Tools</h2>
            <p class="muted mb-20">Complete each tool in order to unlock the next.</p>

            ${tool1CardHTML}

            ${this._buildTool2Card(clientId, baseUrl, tool2Latest, tool2HasDraft, tool2Completed, tool2Access)}

            ${this._buildTool3Card(clientId, baseUrl, tool3Latest, tool3HasDraft, tool3Completed, tool3Access)}

            ${this._buildTool5Card(clientId, baseUrl, tool5Latest, tool5HasDraft, tool5Completed, tool5Access)}

            <p class="muted mt-20 text-center">More tools will unlock as you progress</p>
          </div>

          <div class="text-center mt-20">
            <button class="btn-secondary" onclick="logout()">
              Logout
            </button>
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
            window.logout = logout;

            // View report - navigate using document.write() pattern
            function viewReport() {
              showLoading('Loading Report');

              google.script.run
                .withSuccessHandler(function(reportHtml) {
                  // Replace current document with report HTML
                  document.open();
                  document.write(reportHtml);
                  document.close();
                })
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Report navigation error:', error);
                  alert('Error loading report: ' + error.message);
                })
                .getReportPage(clientId, 'tool1');
            }

            // Edit response - navigate immediately to preserve user gesture
            function editResponse() {
              showLoading('Loading your responses...');
              // Navigate IMMEDIATELY - async callbacks lose user gesture in iframe
              window.top.location.href = baseUrl + '?route=tool1&client=' + clientId + '&page=1&editMode=true';
            }

          // Retake tool - navigate immediately to preserve user gesture
          function retakeTool() {
            if (confirm('Start a completely fresh assessment? This will clear any drafts but keep your previous completed response.')) {
              showLoading('Preparing fresh assessment...');
              // Navigate IMMEDIATELY - async callbacks lose user gesture in iframe
              window.top.location.href = baseUrl + '?route=tool1&client=' + clientId + '&page=1&clearDraft=true';
            }
          }

          // Logout - navigate to login using document.write pattern
          function logout() {
            showLoading('Logging out');

            // For logout, we actually want to do a full page reload to clear all state
            // Use window.location.replace to avoid iframe issues
            window.top.location.replace(baseUrl + '?route=login');
          }

          // Fade in page once loaded
          window.addEventListener('load', function() {
            document.body.classList.add('loaded');
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
            window.top.location.href = '${baseUrl}?route=tool2_report&client=${clientId}';
          }

          function editTool2Response() {
            showLoading('Loading your responses...');
            // Navigate IMMEDIATELY - async callbacks lose user gesture in iframe
            window.top.location.href = '${baseUrl}?route=tool2&client=${clientId}&page=1&editMode=true';
          }

          function retakeTool2() {
            if (confirm('Start fresh? This will discard your current response.')) {
              showLoading('Starting Fresh');
              window.top.location.href = '${baseUrl}?route=tool2&client=${clientId}&page=1&clearDraft=true';
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
            <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool2&client=${clientId}&page=1'">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="if(confirm('Discard your draft and lose all progress?')) { showLoading('Discarding draft...'); window.top.location.href='${baseUrl}?route=dashboard&client=${clientId}&discardDraft=tool2'; }">
              ❌ Discard Draft
            </button>
          </div>
        </div>
      `;
    } else if (tool2Access.allowed) {
      // Accessible but not started - show Start button
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>Tool 2: Financial Clarity & Values</h3>
          <p class="muted">Comprehensive assessment of your financial situation and values</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool2&client=${clientId}&page=1'">
            Start Assessment
          </button>
        </div>
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
            <h3 style="margin: 0;">🪞 Tool 3: Identity & Validation</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool3Report()">
              📊 View Report
            </button>
          </div>
        </div>

        <script>
          function viewTool3Report() {
            showLoading('Loading Report');
            window.top.location.href = '${baseUrl}?route=tool3_report&client=${clientId}';
          }
        </script>
      `;
    } else if (tool3HasDraft) {
      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">🪞 Tool 3: Identity & Validation</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">You have a draft in progress</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool3&client=${clientId}&page=1'">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="if(confirm('Discard your draft and lose all progress?')) { showLoading('Discarding draft...'); window.top.location.href='${baseUrl}?route=dashboard&client=${clientId}&discardDraft=tool3'; }">
              ❌ Discard Draft
            </button>
          </div>
        </div>
      `;
    } else if (tool3Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>🪞 Tool 3: Identity & Validation</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from self</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool3&client=${clientId}&page=1'">
            Start Assessment
          </button>
        </div>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px;">
          <h3>🪞 Tool 3: Identity & Validation</h3>
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
            <h3 style="margin: 0;">💝 Tool 5: Love & Connection</h3>
            <span class="badge" style="background: #4CAF50; color: white;">✓ Completed</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">Completed on ${completedDate}</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="viewTool5Report()">
              📊 View Report
            </button>
          </div>
        </div>

        <script>
          function viewTool5Report() {
            showLoading('Loading Report');
            window.top.location.href = '${baseUrl}?route=tool5_report&client=${clientId}';
          }
        </script>
      `;
    } else if (tool5HasDraft) {
      return `
        <div class="tool-card" style="margin-bottom: 15px; border: 2px solid #FF9800;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0;">💝 Tool 5: Love & Connection</h3>
            <span class="badge" style="background: #FF9800; color: white;">⏸️ In Progress</span>
          </div>
          <p class="muted" style="margin-bottom: 10px;">You have a draft in progress</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool5&client=${clientId}&page=1'">
              ▶️ Continue
            </button>
            <button class="btn-secondary" onclick="if(confirm('Discard your draft and lose all progress?')) { showLoading('Discarding draft...'); window.top.location.href='${baseUrl}?route=dashboard&client=${clientId}&discardDraft=tool5'; }">
              ❌ Discard Draft
            </button>
          </div>
        </div>
      `;
    } else if (tool5Access.allowed) {
      return `
        <div class="tool-card" style="margin-bottom: 15px;">
          <h3>💝 Tool 5: Love & Connection</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from others</p>
          <span class="badge" style="background: #2196F3; color: white;">✓ Ready</span>
          <br><br>
          <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.top.location.href='${baseUrl}?route=tool5&client=${clientId}&page=1'">
            Start Assessment
          </button>
        </div>
      `;
    } else {
      return `
        <div class="tool-card locked" style="margin-bottom: 15px;">
          <h3>💝 Tool 5: Love & Connection</h3>
          <p class="muted">Grounding assessment revealing patterns of disconnection from others</p>
          <span class="badge">🔒 Locked</span>
          <p class="muted mt-10" style="font-size: 14px;">
            ${tool5Access.reason || 'Complete previous tools to unlock'}
          </p>
        </div>
      `;
    }
  },

  /**
   * Create admin panel
   * @private
   */
  _createAdminPanel(params) {
    // TODO: Implement admin panel
    return HtmlService.createHtmlOutput(`
      <h1>Admin Panel</h1>
      <p>Admin interface coming soon...</p>
    `);
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
    console.error('Route handler error:', error);
    return HtmlService.createHtmlOutput(`
      <h1>Error</h1>
      <p>${error.toString()}</p>
      <a href="${ScriptApp.getService().getUrl()}?route=login">Go to Login</a>
    `);
  }
};
