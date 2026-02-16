/**
 * NavigationHelpers - Utilities for client-side navigation
 * Provides helpers to fetch page HTML for document.write() navigation without white flash
 */

const NavigationHelpers = {
  /**
   * Get dashboard page HTML for client-side navigation
   * @param {string} clientId - Client ID
   * @returns {string} Dashboard HTML content
   */
  getDashboardPage(clientId) {
    try {
      registerTools();

      // Create fake request object for router
      const fakeRequest = {
        parameter: {
          route: 'dashboard',
          client: clientId
        }
      };

      // Get dashboard HTML from router
      const dashboardOutput = Router.route(fakeRequest);
      return dashboardOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error getting dashboard: ${error}`);
      return this.renderErrorPage('Error Loading Dashboard', error, clientId);
    }
  },

  /**
   * Get login page HTML for client-side navigation (logout)
   * @param {string} message - Optional message to display
   * @returns {string} Login page HTML content
   */
  getLoginPage(message) {
    try {
      registerTools();

      // Create fake request object for router
      const fakeRequest = {
        parameter: {
          route: 'login',
          message: message || ''
        }
      };

      // Get login HTML from router
      const loginOutput = Router.route(fakeRequest);
      return loginOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error getting login page: ${error}`);
      // Return a simple login redirect as fallback
      const baseUrl = ScriptApp.getService().getUrl();
      return '<html><head><meta http-equiv="refresh" content="0;url=' + baseUrl + '?route=login"></head></html>';
    }
  },

  /**
   * Get report page HTML for client-side navigation
   * @param {string} clientId - Client ID
   * @param {string} toolId - Tool identifier (e.g., 'tool1')
   * @returns {string} Report HTML content
   */
  getReportPage(clientId, toolId) {
    try {
      registerTools();

      // Create fake request object for router
      const fakeRequest = {
        parameter: {
          route: `${toolId}_report`,
          client: clientId
        }
      };

      // Get report HTML from router
      const reportOutput = Router.route(fakeRequest);
      return reportOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error getting report: ${error}`);
      return this.renderErrorPage('Error Loading Report', error, clientId, true);
    }
  },

  /**
   * Get results summary page HTML for client-side navigation
   * @param {string} clientId - Client ID
   * @returns {string} Results summary HTML content
   */
  getResultsSummaryPage(clientId) {
    try {
      registerTools();

      const fakeRequest = {
        parameter: {
          route: 'results_summary',
          client: clientId
        }
      };

      const pageOutput = Router.route(fakeRequest);
      return pageOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error getting results summary: ${error}`);
      return this.renderErrorPage('Error Loading Results Summary', error, clientId, true);
    }
  },

  /**
   * Get specific tool page HTML for client-side navigation
   * @param {string} toolId - Tool identifier (e.g., 'tool2')
   * @param {string} clientId - Client ID
   * @param {number} page - Page number to load
   * @returns {string} Tool page HTML content
   */
  getToolPageHtml(toolId, clientId, page) {
    try {
      registerTools();

      // Create fake request object for router
      const fakeRequest = {
        parameter: {
          route: toolId,
          client: clientId,
          page: page.toString()
        }
      };

      // Get page HTML from router
      const pageOutput = Router.route(fakeRequest);
      return pageOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error getting ${toolId} page ${page}: ${error}`);
      return this.renderErrorPage('Error Loading Page', error, clientId, true);
    }
  },

  /**
   * Get tool page HTML with additional options (editMode, clearDraft)
   * @param {string} toolId - Tool identifier (e.g., 'tool2')
   * @param {string} clientId - Client ID
   * @param {number} page - Page number to load
   * @param {Object} options - Additional options {editMode, clearDraft}
   * @returns {string} Tool page HTML content
   */
  getToolPageWithOptions(toolId, clientId, page, options = {}) {
    try {
      registerTools();

      // Create fake request object for router with options
      const fakeRequest = {
        parameter: {
          route: toolId,
          client: clientId,
          page: page.toString()
        }
      };

      // Add optional parameters
      if (options.editMode) {
        fakeRequest.parameter.editMode = 'true';
      }
      if (options.clearDraft) {
        fakeRequest.parameter.clearDraft = 'true';
      }

      // Get page HTML from router
      const pageOutput = Router.route(fakeRequest);
      return pageOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error getting ${toolId} page ${page} with options: ${error}`);
      return this.renderErrorPage('Error Loading Page', error, clientId, true);
    }
  },

  /**
   * Discard draft and return dashboard HTML
   * @param {string} clientId - Client ID
   * @param {string} toolId - Tool to discard draft for
   * @returns {string} Dashboard HTML content
   */
  discardDraftAndGetDashboard(clientId, toolId) {
    try {
      registerTools();

      // Create fake request with discardDraft parameter
      // The Router._createDashboard handles discardDraft
      const fakeRequest = {
        parameter: {
          route: 'dashboard',
          client: clientId,
          discardDraft: toolId
        }
      };

      // Get dashboard HTML from router (which will discard the draft)
      const dashboardOutput = Router.route(fakeRequest);
      return dashboardOutput.getContent();

    } catch (error) {
      Logger.log(`[NavigationHelpers] Error discarding draft for ${toolId}: ${error}`);
      return this.renderErrorPage('Error Discarding Draft', error, clientId);
    }
  },

  /**
   * Render error page with consistent styling
   * @param {string} title - Error page title
   * @param {Error|string} error - Error object or message
   * @param {string} clientId - Client ID for back link
   * @param {boolean|Object} optionsOrStyled - Options object { styled, navigable, showStack } or boolean for legacy compat
   * @returns {string} Error page HTML
   */
  renderErrorPage(title, error, clientId, optionsOrStyled) {
    // Backwards-compatible: 4th arg can be boolean (legacy) or options object
    var options = {};
    if (typeof optionsOrStyled === 'boolean') {
      options = { styled: optionsOrStyled };
    } else if (optionsOrStyled && typeof optionsOrStyled === 'object') {
      options = optionsOrStyled;
    }
    var styled = options.styled || false;
    var navigable = options.navigable || false;
    var showStack = options.showStack || false;

    var errorMessage = error instanceof Error ? (error.message || error.toString()) : String(error);
    var errorStack = (showStack && error instanceof Error && error.stack) ? error.stack : '';
    var baseUrl = ScriptApp.getService().getUrl();
    var backUrl = clientId
      ? baseUrl + '?route=dashboard&client=' + clientId
      : baseUrl + '?route=login';

    if (!styled) {
      // Minimal unstyled error page
      return '<html><body>' +
        '<h1>' + title + '</h1>' +
        '<p>' + errorMessage + '</p>' +
        (clientId
          ? '<a href="' + backUrl + '">Back to Dashboard</a>'
          : '<a href="' + backUrl + '">Go to Login</a>') +
        '</body></html>';
    }

    // Styled dark-theme error page
    var html = '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
        '<title>TruPath - Error</title>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' +
          'body { font-family: "Rubik", system-ui, sans-serif; background: linear-gradient(135deg, #4b4166, #1e192b); background-attachment: fixed; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; margin: 0; color: #e0e0e0; }' +
          '.error-card { background: rgba(20, 15, 35, 0.95); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 40px; max-width: 600px; width: 100%; }' +
          '.error-card h1 { color: #ef4444; margin: 0 0 16px 0; font-size: 24px; }' +
          '.error-card p { color: #a0a0a0; line-height: 1.6; margin: 12px 0; }' +
          '.error-msg { background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; font-family: monospace; font-size: 14px; color: #fca5a5; word-break: break-word; }' +
          (errorStack ? 'pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #94a3b8; margin-top: 16px; white-space: pre-wrap; }' : '') +
          '.btn-back { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #ad9168; color: #1e192b; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; font-family: "Rubik", sans-serif; }' +
          '.btn-back:hover { background: #c4a877; }' +
        '</style>' +
      '</head>' +
      '<body>' +
        '<div class="error-card">' +
          '<h1>' + title + '</h1>' +
          '<div class="error-msg">' + errorMessage + '</div>' +
          (errorStack ? '<pre>' + errorStack + '</pre>' : '');

    if (navigable && clientId) {
      // Interactive button with document.write() navigation (GAS-safe)
      html += '<button class="btn-back" onclick="returnToDashboard()">Return to Dashboard</button>' +
        '</div>' +
        '<script>' +
          'function returnToDashboard() {' +
            'var btn = document.querySelector(".btn-back");' +
            'if (btn) { btn.disabled = true; btn.textContent = "Loading..."; }' +
            'google.script.run' +
              '.withSuccessHandler(function(dashboardHtml) {' +
                'try {' +
                  'sessionStorage.setItem("_ftpCurrentLocation", JSON.stringify({' +
                    'view: "dashboard",' +
                    'toolId: null,' +
                    'page: null,' +
                    'clientId: "' + clientId + '",' +
                    'timestamp: Date.now()' +
                  '}));' +
                '} catch(e) {}' +
                'document.open();' +
                'document.write(dashboardHtml);' +
                'document.close();' +
                'window.scrollTo(0, 0);' +
              '})' +
              '.withFailureHandler(function(err) {' +
                'console.error("Navigation error:", err);' +
                'alert("Error returning to dashboard: " + err.message);' +
                'if (btn) { btn.disabled = false; btn.textContent = "Return to Dashboard"; }' +
              '})' +
              '.getDashboardPage("' + clientId + '");' +
          '}' +
        '</script>';
    } else if (clientId) {
      html += '<a class="btn-back" href="' + backUrl + '">Back to Dashboard</a>' +
        '</div>';
    } else {
      html += '<a class="btn-back" href="' + backUrl + '">Go to Login</a>' +
        '</div>';
    }

    html += '</body></html>';
    return html;
  },

  /**
   * Create a fake request object for router
   * @param {string} route - Route name
   * @param {Object} params - Additional parameters
   * @returns {Object} Fake request object
   */
  createFakeRequest(route, params = {}) {
    return {
      parameter: {
        route: route,
        ...params
      }
    };
  }
};
