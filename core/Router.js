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
    const systemRoutes = ['login', 'dashboard', 'admin', 'logout', 'tool1_report'];
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
        page: parseInt(params.page) || 1
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
                Enter your information to look up your Student ID:
              </p>

              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="studentName" name="name" placeholder="Enter your full name">
              </div>

              <div class="form-group">
                <label class="form-label">Email Address (optional)</label>
                <input type="email" id="studentEmail" name="email" placeholder="Enter your email address">
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

            // Authenticate via server
            google.script.run
                .withSuccessHandler(function(result) {
                  if (result && result.success) {
                    // Success - get dashboard
                    google.script.run
                        .withSuccessHandler(function(dashboardHtml) {
                          document.open();
                          document.write(dashboardHtml);
                          document.close();
                        })
                        .withFailureHandler(function(error) {
                          hideLoading();
                          btn.disabled = false;
                          btnText.style.display = 'inline';
                          btnSpinner.style.display = 'none';
                          showAlert('Error loading dashboard: ' + error.message, true);
                        })
                        .getDashboardPage(result.clientId);
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
                .lookupClientById(clientId);
          });

          // Backup login (Name/Email)
          document.getElementById('backupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            hideAlert();

            const name = document.getElementById('studentName').value.trim();
            const email = document.getElementById('studentEmail').value.trim();

            if (!name && !email) {
              showAlert('Please enter at least your name or email', true);
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

            // Lookup via server
            google.script.run
                .withSuccessHandler(function(result) {
                  if (result && result.success) {
                    // Found - get dashboard
                    showAlert('Account found! Loading...', false);
                    google.script.run
                        .withSuccessHandler(function(dashboardHtml) {
                          document.open();
                          document.write(dashboardHtml);
                          document.close();
                        })
                        .withFailureHandler(function(error) {
                          hideLoading();
                          btn.disabled = false;
                          btnText.style.display = 'inline';
                          btnSpinner.style.display = 'none';
                          showAlert('Error loading dashboard: ' + error.message, true);
                        })
                        .getDashboardPage(result.clientId);
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
                .lookupClientByDetails({ name: name, email: email });
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

            <div class="tool-card" style="margin-bottom: 15px;">
              <h3>Tool 1: Orientation Assessment</h3>
              <p class="muted">Begin your financial journey with a comprehensive assessment</p>
              <span class="badge">Ready</span>
              <br><br>
              <button class="btn-primary" onclick="showLoading('Loading Assessment'); window.location.href='<?= ScriptApp.getService().getUrl() ?>?route=tool1&client=${clientId || 'TEST001'}'">
                Start Assessment
              </button>
            </div>

            <div class="tool-card locked" style="margin-bottom: 15px;">
              <h3>Tool 2: Financial Clarity</h3>
              <p class="muted">Deep dive into your financial situation</p>
              <span class="badge">Locked</span>
            </div>

            <p class="muted mt-20 text-center">More tools will unlock as you progress</p>
          </div>

          <div class="text-center mt-20">
            <button class="btn-secondary" onclick="window.location.href='<?= ScriptApp.getService().getUrl() ?>?route=login'">
              Logout
            </button>
          </div>
        </div>

        <script>
          // Fade in page once loaded
          window.addEventListener('load', function() {
            document.body.classList.add('loaded');
          });

          // Fallback: show page after 100ms even if not fully loaded
          setTimeout(function() {
            document.body.classList.add('loaded');
          }, 100);
        </script>
      </body>
      </html>
    `);

    return template.evaluate()
      .setTitle('Financial TruPath - Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
