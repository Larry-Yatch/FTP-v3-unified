/**
 * ReportClientJS - Shared client-side JavaScript for web reports
 *
 * Returns client-side JS strings for embedding in report <script> blocks.
 * Reports build HTML as strings via HtmlService.createHtmlOutput(), so they
 * cannot use <?!= include() ?> template directives. These methods return JS
 * strings for embedding in template literals.
 *
 * Pattern matches ReportStyles.js for CSS strings.
 *
 * Usage in ToolXReport.js:
 *   <script>
 *     (function() {
 *       const clientId = '${clientId}';
 *       ${ReportClientJS.getLoadingFunctions()}
 *       ${ReportClientJS.getNavigationFunction()}
 *       ${ReportClientJS.getDownloadFunction('generateToolXPDF')}
 *       ${ReportClientJS.getBackToDashboard()}
 *       window.downloadPDF = downloadPDF;
 *       window.backToDashboard = backToDashboard;
 *     })();
 *   </script>
 */

const ReportClientJS = {

  /**
   * Loading overlay show/hide functions.
   * Requires ReportStyles.getLoadingHTML() markup in the page.
   * @returns {string} Client-side JS for showLoading() and hideLoading()
   */
  getLoadingFunctions() {
    return `
      function showLoading(message) {
        var overlay = document.getElementById('loadingOverlay');
        var text = overlay.querySelector('.loading-text');
        if (message) {
          text.innerHTML = message + '<span class="loading-dots"></span>';
        }
        overlay.classList.add('active');
      }

      function hideLoading() {
        var overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
      }
    `;
  },

  /**
   * Dashboard navigation via document.write() pattern (GAS-safe, no iframe issues).
   * Depends on: showLoading(), hideLoading(), getDashboardPage() server function.
   * @returns {string} Client-side JS for navigateToDashboard(clientId, message)
   */
  getNavigationFunction() {
    return `
      function navigateToDashboard(cId, message) {
        showLoading(message || 'Loading Dashboard');

        google.script.run
          .withSuccessHandler(function(dashboardHtml) {
            try {
              sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                view: 'dashboard',
                toolId: null,
                page: null,
                clientId: cId,
                timestamp: Date.now()
              }));
            } catch(e) {}
            document.open();
            document.write(dashboardHtml);
            document.close();
          })
          .withFailureHandler(function(error) {
            hideLoading();
            console.error('Dashboard navigation error:', error);
            alert('Error loading dashboard: ' + error.message);
          })
          .getDashboardPage(cId);
      }
    `;
  },

  /**
   * PDF download function calling the specified GAS server function.
   * Depends on: showLoading(), hideLoading(), clientId in scope.
   * @param {string} pdfFunctionName - GAS function name (e.g., 'generateTool1PDF')
   * @returns {string} Client-side JS for downloadPDF()
   */
  getDownloadFunction(pdfFunctionName) {
    return `
      function downloadPDF() {
        var btn = event.target;
        btn.disabled = true;
        btn.textContent = 'Generating PDF...';
        showLoading('Generating PDF');

        google.script.run
          .withSuccessHandler(function(result) {
            hideLoading();
            if (result.success) {
              var link = document.createElement('a');
              link.href = 'data:application/pdf;base64,' + result.pdf;
              link.download = result.fileName;
              link.click();

              btn.disabled = false;
              btn.textContent = String.fromCodePoint(0x1F4E5) + ' Download PDF Report';
              alert('PDF downloaded successfully!');
            } else {
              alert('Error generating PDF: ' + result.error);
              btn.disabled = false;
              btn.textContent = String.fromCodePoint(0x1F4E5) + ' Download PDF Report';
            }
          })
          .withFailureHandler(function(error) {
            hideLoading();
            alert('Error: ' + error.message);
            btn.disabled = false;
            btn.textContent = String.fromCodePoint(0x1F4E5) + ' Download PDF Report';
          })
          .${pdfFunctionName}(clientId);
      }
    `;
  },

  /**
   * Back to dashboard wrapper.
   * Depends on: navigateToDashboard(), clientId in scope.
   * @returns {string} Client-side JS for backToDashboard()
   */
  getBackToDashboard() {
    return `
      function backToDashboard() {
        navigateToDashboard(clientId, 'Loading Dashboard');
      }
    `;
  }
};
