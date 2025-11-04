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
        <title>Financial TruPath - Login</title>
        <?!= include('shared/styles') ?>
      </head>
      <body>
        <div class="login-container">
          <h1>Financial TruPath v3</h1>
          ${message ? `<div class="message">${message}</div>` : ''}
          <form id="loginForm">
            <input type="text" name="clientId" placeholder="Student ID" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
        </div>
        <script>
          document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const clientId = e.target.clientId.value;
            // TODO: Implement authentication
            window.location.href = '<?= ScriptApp.getService().getUrl() ?>?route=dashboard&client=' + clientId;
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
    // TODO: Implement dashboard
    return HtmlService.createHtmlOutput(`
      <h1>Dashboard</h1>
      <p>Welcome, ${params.client}</p>
      <p>Dashboard coming soon...</p>
    `);
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
