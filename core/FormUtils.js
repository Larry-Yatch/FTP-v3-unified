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
                document.open();
                document.write(result.nextPageHtml);
                document.close();
                // Scroll to top of new page
                window.scrollTo(0, 0);
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
                  document.open();
                  document.write(result.nextPageHtml);
                  document.close();
                  // Scroll to top of new page
                  window.scrollTo(0, 0);
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
      content
    } = options;

    const progress = Math.round((page / totalPages) * 100);

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
            content: pageContent
          })}

          ${this.generatePageFooter()}
        </div>

        ${this.getFormSubmissionScript(toolId, baseUrl)}

        ${FeedbackWidget.render(clientId, toolId, page)}

        <script>
          document.body.classList.add('loaded');
        </script>
      </body>
      </html>
    `;
  }
};
