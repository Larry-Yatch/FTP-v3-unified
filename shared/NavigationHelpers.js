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
   * Render error page with consistent styling
   * @param {string} title - Error page title
   * @param {Error|string} error - Error object or message
   * @param {string} clientId - Client ID for back link
   * @param {boolean} styled - Use dark theme styling (default: false)
   * @returns {string} Error page HTML
   */
  renderErrorPage(title, error, clientId, styled = false) {
    const errorMessage = error instanceof Error ? error.toString() : error;
    const backUrl = `${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}`;

    if (styled) {
      return `
        <html>
        <body style="background: ${CONFIG.UI.DARK_BG}; color: white; font-family: sans-serif; padding: 40px;">
          <h1>${title}</h1>
          <p>${errorMessage}</p>
          <a href="${backUrl}" style="color: ${CONFIG.UI.PRIMARY_COLOR};">Back to Dashboard</a>
        </body>
        </html>
      `;
    }

    return `
      <html>
      <body>
        <h1>${title}</h1>
        <p>${errorMessage}</p>
        <a href="${backUrl}">Try Again</a>
      </body>
      </html>
    `;
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
