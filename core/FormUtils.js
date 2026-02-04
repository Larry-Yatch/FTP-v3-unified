/**
 * FormUtils.js - Reusable form handling utilities
 *
 * Provides standardized patterns for:
 * - Multi-page forms
 * - Form submission via google.script.run (no POST)
 * - Draft auto-save
 * - Progress tracking
 * - Error handling
 *
 * USE THIS for all form-based tools to avoid iframe sandbox issues.
 */

const FormUtils = {

  /**
   * Generate client-side form submission script
   * Call this in your tool's render() to get the standard form handler
   *
   * @param {string} toolId - Tool identifier (e.g., 'tool1')
   * @param {string} baseUrl - Script service URL
   * @returns {string} JavaScript code for form handling
   */
  getFormSubmissionScript(toolId, baseUrl) {
    return `
      <script>
        /**
         * Submit a form page using google.script.run (avoids POST iframe sandbox)
         * @param {string} formId - Form element ID
         * @param {number} page - Current page number
         * @param {string} nextRoute - Where to go next (optional, defaults to next page)
         */
        function submitToolPage(formId, page, nextRoute) {
          const form = document.getElementById(formId);
          if (!form) {
            alert('Form not found: ' + formId);
            return false;
          }

          // Validate form using browser validation
          if (!form.checkValidity()) {
            form.reportValidity();
            return false;
          }

          // Get form data
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          // Show loading
          showLoading('Saving your responses');

          // Save and replace page content (no navigation needed!)
          google.script.run
            .withSuccessHandler(function(result) {
              if (result && result.success === false) {
                hideLoading();
                alert('Error: ' + (result.error || 'Failed to save'));
                return;
              }

              // Data saved successfully
              console.log('Save successful, replacing page content...');

              // Server returned HTML for next page - replace current document
              if (result.nextPageHtml) {
                // Save destination location for refresh recovery (next page = page + 1)
                if (typeof saveLocation === 'function') {
                  saveLocation('tool', { toolId: '${toolId}', page: page + 1 });
                } else {
                  // Fallback: save directly to sessionStorage
                  try {
                    sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                      view: 'tool',
                      toolId: '${toolId}',
                      page: page + 1,
                      clientId: data.client,
                      timestamp: Date.now()
                    }));
                  } catch(e) {}
                }
                document.open();
                document.write(result.nextPageHtml);
                document.close();
                // Scroll to top of new page
                window.scrollTo(0, 0);
                // Note: History state is pushed by initHistoryManager when the new page loads
              } else {
                hideLoading();
                alert('Error: Server did not return next page HTML');
              }
            })
            .withFailureHandler(function(error) {
              hideLoading();
              console.error('Submission error:', error);
              alert('Error saving data: ' + error.message);
            })
            .saveToolPageData('${toolId}', data);

          return false; // Prevent default form submission
        }

        /**
         * Navigate to previous page (saves current page data first)
         * @param {string} toolId - Tool identifier
         * @param {string} clientId - Client ID
         * @param {number} previousPage - Page number to navigate to
         */
        function navigateToPreviousPage(toolId, clientId, previousPage) {
          // Find the current form (search for any form with tool page pattern)
          const forms = document.querySelectorAll('form[id*="Page"]');
          let currentForm = null;

          for (let form of forms) {
            if (form.id.includes(toolId)) {
              currentForm = form;
              break;
            }
          }

          // Get form data (without validation - allow incomplete forms when going back)
          const formData = currentForm ? new FormData(currentForm) : new FormData();
          const data = Object.fromEntries(formData.entries());

          showLoading(\`Loading Page \${previousPage}\`);

          // Helper to save location and write page
          function writePageAndSaveLocation(pageHtml) {
            if (pageHtml) {
              // Save destination location for refresh recovery
              try {
                sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                  view: 'tool',
                  toolId: toolId,
                  page: previousPage,
                  clientId: clientId,
                  timestamp: Date.now()
                }));
              } catch(e) {}
              document.open();
              document.write(pageHtml);
              document.close();
              window.scrollTo(0, 0);
            } else {
              hideLoading();
              alert('Error loading previous page');
            }
          }

          // Save current page data, then load previous page (following Tool 2 pattern)
          google.script.run
            .withSuccessHandler(function() {
              // After saving, load the previous page
              google.script.run
                .withSuccessHandler(writePageAndSaveLocation)
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Navigation error:', error);
                  alert('Error loading page: ' + error.message);
                })
                .getToolPageHtml(toolId, clientId, previousPage);
            })
            .withFailureHandler(function(error) {
              // Even if save fails, still try to navigate (don't block user)
              console.warn('Save failed, navigating anyway:', error);
              google.script.run
                .withSuccessHandler(writePageAndSaveLocation)
                .withFailureHandler(function(error) {
                  hideLoading();
                  console.error('Navigation error:', error);
                  alert('Error loading page: ' + error.message);
                })
                .getToolPageHtml(toolId, clientId, previousPage);
            })
            .saveToolPageData(toolId, data);
        }

        /**
         * Submit final page (calls different handler for completion)
         * @param {string} formId - Form element ID
         * @param {function} customValidation - Optional custom validation function
         */
        function submitFinalPage(formId, customValidation) {
          const form = document.getElementById(formId);
          if (!form) {
            alert('Form not found: ' + formId);
            return false;
          }

          // Browser validation first
          if (!form.checkValidity()) {
            form.reportValidity();
            return false;
          }

          // Custom validation if provided
          if (customValidation && typeof window[customValidation] === 'function') {
            if (!window[customValidation]()) {
              return false; // Custom validation failed
            }
          }

          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          showLoading('Processing your assessment');

          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success) {
                console.log('Processing complete, replacing with report page...');

                // Server returned HTML for report page - replace current document
                if (result.nextPageHtml) {
                  // Save destination location for refresh recovery (report page)
                  try {
                    sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                      view: 'report',
                      toolId: '${toolId}',
                      page: null,
                      clientId: data.client,
                      timestamp: Date.now()
                    }));
                  } catch(e) {}
                  document.open();
                  document.write(result.nextPageHtml);
                  document.close();
                  // Scroll to top of new page
                  window.scrollTo(0, 0);
                  // Note: History state is pushed by initHistoryManager when the new page loads
                } else {
                  hideLoading();
                  alert('Error: Server did not return report HTML');
                }
              } else {
                hideLoading();
                alert('Error: ' + (result.error || 'Failed to process'));
              }
            })
            .withFailureHandler(function(error) {
              hideLoading();
              console.error('Final submission error:', error);
              alert('Error processing assessment: ' + error.message);
            })
            .completeToolSubmission('${toolId}', data);

          return false;
        }

        /**
         * Auto-save draft (call on input change)
         */
        function autoSaveDraft(formId, debounceMs) {
          if (window.autoSaveTimeout) {
            clearTimeout(window.autoSaveTimeout);
          }

          window.autoSaveTimeout = setTimeout(function() {
            const form = document.getElementById(formId);
            if (!form) return;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Silent save (no loading indicator)
            google.script.run
              .withSuccessHandler(function() {
                console.log('Draft auto-saved');
              })
              .withFailureHandler(function(error) {
                console.error('Auto-save failed:', error);
              })
              .saveToolPageData('${toolId}', data);
          }, debounceMs || 2000);
        }
      </script>
    `;
  },

  /**
   * Generate standard form wrapper HTML
   *
   * @param {Object} options - Form options
   * @returns {string} HTML for form wrapper
   */
  generateFormWrapper(options) {
    const {
      formId,
      page,
      totalPages,
      clientId,
      onSubmit,
      content,
      toolId
    } = options;

    const progress = Math.round((page / totalPages) * 100);

    // Generate back button for pages 2+ (following Tool 2 pattern)
    const backButton = page > 1 ? `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <button type="button" class="btn-secondary" onclick="navigateToPreviousPage('${toolId}', '${clientId}', ${page - 1})">
          ← Back to Page ${page - 1}
        </button>
      </div>
    ` : '';

    return `
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="muted text-center" style="font-size: 14px; margin-top: 8px;">
          Page ${page} of ${totalPages}
        </p>
      </div>

      <form id="${formId}" onsubmit="${onSubmit}">
        <input type="hidden" name="client" value="${clientId}">
        <input type="hidden" name="page" value="${page}">

        ${content}

        <button type="submit" class="btn-primary" style="margin-top: 30px;">
          ${page === totalPages ? 'Submit Assessment →' : 'Continue to Next Section →'}
        </button>
      </form>

      ${backButton}
    `;
  },

  /**
   * Generate standard page navigation header
   */
  generatePageHeader(toolName, page, totalPages, clientId) {
    return `
      <div class="tool-navigation">
        <button class="btn-nav" onclick="navigateToDashboard('${clientId}', 'Loading Dashboard')">
          ← Dashboard
        </button>
        <span>Page ${page} of ${totalPages}</span>
      </div>

      <div class="card">
        <h1>${toolName}</h1>
        <p class="muted">Page ${page} of ${totalPages}</p>
    `;
  },

  /**
   * Generate standard page footer (closes card div)
   */
  generatePageFooter() {
    return `
      </div>
    `;
  },

  /**
   * Build complete page HTML with standard structure
   */
  buildStandardPage(options) {
    const {
      toolName,
      toolId,
      page,
      totalPages,
      clientId,
      baseUrl,
      pageContent,
      isFinalPage = false,
      customValidation = null  // Optional: name of validation function for final page
    } = options;

    const formId = `${toolId}Page${page}Form`;
    const dashboardUrl = `${baseUrl}?route=dashboard&client=${clientId}`;

    const onSubmit = isFinalPage
      ? (customValidation
          ? `return submitFinalPage('${formId}', '${customValidation}')`
          : `return submitFinalPage('${formId}')`)
      : `return submitToolPage('${formId}', ${page})`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - ${toolName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
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
      <body>
        <div class="container">
          ${this.generatePageHeader(toolName, page, totalPages, clientId)}

          ${this.generateFormWrapper({
            formId: formId,
            page: page,
            totalPages: totalPages,
            clientId: clientId,
            onSubmit: onSubmit,
            content: pageContent,
            toolId: toolId
          })}

          ${this.generatePageFooter()}
        </div>

        ${this.getFormSubmissionScript(toolId, baseUrl)}

        ${FeedbackWidget.render(clientId, toolId, page)}

        <script>
          document.body.classList.add('loaded');

          // Initialize history manager for browser back button support
          if (typeof initHistoryManager === 'function') {
            initHistoryManager('${clientId}');
          }
        </script>
      </body>
      </html>
    `;
  }
};
