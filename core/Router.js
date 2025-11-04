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
    const systemRoutes = ['login', 'dashboard', 'admin', 'logout'];
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
    return this._loadTool(tool, clientId, sessionId);
  },

  /**
   * Load tool UI
   * @private
   */
  _loadTool(tool, clientId, sessionId) {
    try {
      // Initialize tool
      const initResult = FrameworkCore.initializeTool(tool.id, clientId);

      if (!initResult.success) {
        return this._handleError(new Error(initResult.error));
      }

      // Create template
      const template = HtmlService.createTemplateFromFile('shared/tool-wrapper');

      // Inject data
      template.toolId = tool.id;
      template.toolName = tool.manifest.name;
      template.toolConfig = JSON.stringify(tool.manifest);
      template.clientId = clientId;
      template.sessionId = sessionId;
      template.insights = JSON.stringify(initResult.insights || []);
      template.adaptations = JSON.stringify(initResult.adaptations || {});
      template.baseUrl = ScriptApp.getService().getUrl();

      return template.evaluate()
        .setTitle(`Financial TruPath - ${tool.manifest.name}`)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');

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
      </head>
      <body id="loginPage">
        <div class="login-container">
          <div class="login-logo">TruPath Financial</div>
          <p class="login-subtitle">Your Journey to Financial Clarity</p>
          ${message ? `<div class="message error">${message}</div>` : ''}
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label">Student ID</label>
              <input type="text" name="clientId" placeholder="Enter your student ID" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" name="password" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn-primary" id="loginBtn">
              <span id="btnText">Sign In</span>
              <span id="btnSpinner" style="display: none;">
                <span class="loading-spinner"></span> Loading...
              </span>
            </button>
          </form>
          <p class="muted mt-20">v3.0.3 | Modular Architecture</p>
        </div>

        <!-- Loading Overlay -->
        <div id="loadingOverlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(30, 25, 43, 0.95); backdrop-filter: blur(10px); z-index: 10000; align-items: center; justify-content: center; flex-direction: column;">
          <div class="loading-spinner" style="width: 50px; height: 50px; border-width: 5px;"></div>
          <p style="color: #ad9168; margin-top: 20px; font-family: 'Rubik', sans-serif; font-size: 16px;">Loading your dashboard...</p>
        </div>

        <script>
          document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const clientId = e.target.clientId.value;
            const btn = document.getElementById('loginBtn');
            const btnText = document.getElementById('btnText');
            const btnSpinner = document.getElementById('btnSpinner');
            const overlay = document.getElementById('loadingOverlay');

            // Show button loading state immediately
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-flex';
            btnSpinner.style.alignItems = 'center';
            btnSpinner.style.gap = '8px';

            // Show full overlay immediately
            setTimeout(function() {
              overlay.style.display = 'flex';
            }, 150);

            // Fade out page before navigation
            setTimeout(function() {
              document.body.style.transition = 'opacity 0.2s ease-out';
              document.body.style.opacity = '0';
            }, 400);

            // Navigate to dashboard (give time for fade-out)
            setTimeout(function() {
              window.location.href = '<?= ScriptApp.getService().getUrl() ?>?route=dashboard&client=' + encodeURIComponent(clientId);
            }, 600);
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
              <button class="btn-primary" onclick="location.href='<?= ScriptApp.getService().getUrl() ?>?route=tool1&client=${clientId || 'TEST001'}'">
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
            <button class="btn-secondary" onclick="location.href='<?= ScriptApp.getService().getUrl() ?>?route=login'">
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
