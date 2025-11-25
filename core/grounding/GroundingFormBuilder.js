/**
 * GroundingFormBuilder.js
 * Specialized form builder for grounding tools (Tools 3, 5, 7)
 *
 * Handles:
 * - 7-page structure (1 intro + 6 subdomains)
 * - Scale questions (-3 to +3, no zero)
 * - Open response questions (1 per subdomain)
 * - Background GPT triggers
 * - Progressive disclosure (one subdomain at a time)
 *
 * Pattern: Tool calls renderPage(pageNum, clientId, baseUrl)
 * Returns complete HTML for that page
 */

const GroundingFormBuilder = {

  /**
   * Render page content ONLY (for use with FormUtils.buildStandardPage)
   * Returns just the form fields, not the full HTML page
   *
   * @param {Object} params - Page rendering parameters
   * @returns {string} Page content (form fields only)
   */
  renderPageContent(params) {
    const {
      toolId,
      pageNum,
      clientId,
      subdomains,
      intro,
      existingData
    } = params;

    // Page 1: Introduction content
    if (pageNum === 1) {
      return intro || this.getDefaultIntro('Grounding Tool');
    }

    // Pages 2-7: Subdomain form fields
    if (pageNum >= 2 && pageNum <= 7) {
      const subdomainIndex = pageNum - 2; // 0-5

      if (!subdomains || subdomainIndex >= subdomains.length) {
        throw new Error(`GroundingFormBuilder.renderPageContent: Subdomain ${subdomainIndex} not found`);
      }

      return this.renderSubdomainFormContent({
        toolId,
        subdomain: subdomains[subdomainIndex],
        subdomainIndex,
        existingData
      });
    }

    throw new Error(`GroundingFormBuilder.renderPageContent: Invalid page number ${pageNum}`);
  },

  /**
   * Render subdomain form content (for pages 2-7)
   * Returns just the form fields, including special grounding styles
   */
  renderSubdomainFormContent(params) {
    const {toolId, subdomain, subdomainIndex, existingData} = params;

    const subdomainContent = this.buildSubdomainContent(subdomain, subdomainIndex, toolId, existingData);

    // Add custom styles needed for grounding scale questions
    const groundingStyles = `
      <style>
        /* OLD HORIZONTAL LAYOUT - Kept for backward compatibility */
        .scale-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 15px 0;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          border: 1px solid rgba(173, 145, 104, 0.2);
        }
        .scale-label {
          flex: 1;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }
        .scale-inputs {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
        }
        .scale-input {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scale-input input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .scale-input label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 5px;
        }

        /* NEW VERTICAL LAYOUT - Full descriptive labels */
        .scale-container-vertical {
          margin: 20px 0;
          padding: 15px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          border: 1px solid rgba(173, 145, 104, 0.2);
        }
        .scale-option {
          display: flex;
          align-items: flex-start;
          padding: 12px;
          margin: 8px 0;
          border-radius: 6px;
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        .scale-option:hover {
          background: rgba(173, 145, 104, 0.1);
        }
        .scale-option input[type="radio"] {
          margin: 4px 12px 0 0;
          width: 20px;
          height: 20px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .scale-option label {
          display: flex;
          align-items: baseline;
          cursor: pointer;
          flex: 1;
          line-height: 1.5;
        }
        .scale-option .scale-value {
          font-weight: 700;
          font-size: 15px;
          color: #ad9168;
          min-width: 35px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .scale-option .scale-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
        }
        .scale-option input[type="radio"]:checked + label {
          color: #ad9168;
        }
        .scale-option input[type="radio"]:checked + label .scale-description {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 500;
        }

        /* SHARED STYLES */
        .subdomain-description {
          font-size: 17px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 25px;
          line-height: 1.6;
        }
        .question-section {
          margin-bottom: 35px;
        }
        .question-header {
          font-size: 16px;
          font-weight: 600;
          color: #ad9168;
          margin-bottom: 15px;
        }
        .question-text {
          font-size: 17px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .open-response-textarea {
          width: 100%;
          min-height: 120px;
          padding: 15px;
          font-size: 15px;
          line-height: 1.6;
          border-radius: 8px;
          border: 1px solid rgba(173, 145, 104, 0.3);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.95);
          font-family: inherit;
          resize: vertical;
        }
        .open-response-textarea:focus {
          outline: none;
          border-color: #ad9168;
          background: rgba(255, 255, 255, 0.08);
        }
      </style>
    `;

    // Hidden fields for form submission
    const hiddenFields = `
      <input type="hidden" name="subdomain_index" value="${subdomainIndex}">
      <input type="hidden" name="subdomain_key" value="${subdomain.key}">
    `;

    // Background GPT script for mini-insights
    const gptScript = this.getBackgroundGPTScript(toolId, subdomain.key, subdomainIndex);

    return groundingStyles + hiddenFields + subdomainContent + gptScript;
  },

  /**
   * Render a specific page for a grounding tool
   *
   * @param {Object} params - Page rendering parameters
   * @returns {string} Complete HTML for the page
   */
  renderPage(params) {
    const {
      toolId,
      toolName,
      pageNum,
      clientId,
      baseUrl,
      subdomains,
      intro
    } = params;

    // Validate params
    if (!toolId || !toolName || !pageNum || !clientId || !baseUrl) {
      throw new Error('GroundingFormBuilder.renderPage: Missing required parameters');
    }

    // Page 1: Introduction
    if (pageNum === 1) {
      return this.renderIntroPage({
        toolId,
        toolName,
        clientId,
        baseUrl,
        intro: intro || this.getDefaultIntro(toolName)
      });
    }

    // Pages 2-7: Subdomain pages
    if (pageNum >= 2 && pageNum <= 7) {
      const subdomainIndex = pageNum - 2; // 0-5

      if (!subdomains || subdomainIndex >= subdomains.length) {
        throw new Error(`GroundingFormBuilder.renderPage: Subdomain ${subdomainIndex} not found`);
      }

      return this.renderSubdomainPage({
        toolId,
        toolName,
        pageNum,
        clientId,
        baseUrl,
        subdomain: subdomains[subdomainIndex],
        subdomainIndex
      });
    }

    throw new Error(`GroundingFormBuilder.renderPage: Invalid page number ${pageNum}`);
  },

  /**
   * Render introduction page (Page 1)
   */
  renderIntroPage(params) {
    const {toolId, toolName, clientId, baseUrl, intro} = params;

    const formId = `${toolId}Page1Form`;
    const totalPages = 7;
    const dashboardUrl = `${baseUrl}?route=dashboard&client=${clientId}`;

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
          ${FormUtils.generatePageHeader(toolName, 1, totalPages, clientId)}

          ${intro}

          <form id="${formId}" onsubmit="return submitToolPage('${formId}', 1)">
            <input type="hidden" name="client" value="${clientId}">
            <input type="hidden" name="page" value="1">
            <input type="hidden" name="intro_read" value="true">

            <button type="submit" class="btn-primary" style="margin-top: 30px;">
              Begin Assessment →
            </button>
          </form>

          ${FormUtils.generatePageFooter()}
        </div>

        ${FormUtils.getFormSubmissionScript(toolId, baseUrl)}
        ${FeedbackWidget.render(clientId, toolId, 1)}

        <script>
          document.body.classList.add('loaded');
        </script>
      </body>
      </html>
    `;
  },

  /**
   * Render subdomain page (Pages 2-7)
   */
  renderSubdomainPage(params) {
    const {toolId, toolName, pageNum, clientId, baseUrl, subdomain, subdomainIndex} = params;

    const formId = `${toolId}Page${pageNum}Form`;
    const totalPages = 7;
    const isFinalPage = (pageNum === 7);
    const dashboardUrl = `${baseUrl}?route=dashboard&client=${clientId}`;

    const onSubmit = isFinalPage
      ? `return submitFinalPage('${formId}')`
      : `return submitToolPage('${formId}', ${pageNum})`;

    // Build subdomain content (without existingData in legacy rendering path)
    const subdomainContent = this.buildSubdomainContent(subdomain, subdomainIndex, toolId, null);

    // Build progress bar
    const progress = Math.round((pageNum / totalPages) * 100);

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
          .scale-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 15px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            border: 1px solid rgba(173, 145, 104, 0.2);
          }
          .scale-label {
            flex: 1;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
          }
          .scale-inputs {
            display: flex;
            gap: 8px;
            flex-wrap: nowrap;
          }
          .scale-input {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .scale-input input[type="radio"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
          .scale-input label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 5px;
          }
          .question-section {
            margin-bottom: 35px;
          }
          .question-header {
            font-size: 16px;
            font-weight: 600;
            color: #ad9168;
            margin-bottom: 15px;
          }
          .question-text {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 10px;
            line-height: 1.5;
          }
          .open-response-textarea {
            width: 100%;
            min-height: 120px;
            padding: 15px;
            font-size: 15px;
            line-height: 1.6;
            border-radius: 8px;
            border: 1px solid rgba(173, 145, 104, 0.3);
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.95);
            font-family: inherit;
            resize: vertical;
          }
          .open-response-textarea:focus {
            outline: none;
            border-color: #ad9168;
            background: rgba(255, 255, 255, 0.08);
          }
        </style>
        <?!= include('shared/styles') ?>
        <?!= include('shared/loading-animation') ?>
      </head>
      <body>
        <div class="container">
          ${FormUtils.generatePageHeader(toolName, pageNum, totalPages, clientId)}

          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p class="muted text-center" style="font-size: 14px; margin-top: 8px;">
              Page ${pageNum} of ${totalPages} • Subdomain ${subdomainIndex + 1} of 6
            </p>
          </div>

          <form id="${formId}" onsubmit="${onSubmit}">
            <input type="hidden" name="client" value="${clientId}">
            <input type="hidden" name="page" value="${pageNum}">
            <input type="hidden" name="subdomain_index" value="${subdomainIndex}">
            <input type="hidden" name="subdomain_key" value="${subdomain.key}">

            ${subdomainContent}

            <button type="submit" class="btn-primary" style="margin-top: 30px;">
              ${isFinalPage ? 'Submit Assessment →' : 'Continue to Next Section →'}
            </button>
          </form>

          ${FormUtils.generatePageFooter()}
        </div>

        ${FormUtils.getFormSubmissionScript(toolId, baseUrl)}
        ${this.getBackgroundGPTScript(toolId, subdomain.key, subdomainIndex)}
        ${FeedbackWidget.render(clientId, toolId, pageNum)}

        <script>
          document.body.classList.add('loaded');
        </script>
      </body>
      </html>
    `;
  },

  /**
   * Build subdomain content (4 scale questions + 1 open response)
   */
  buildSubdomainContent(subdomain, subdomainIndex, toolId, existingData) {
    const {key, label, description, questions} = subdomain;

    if (!questions || questions.length !== 5) {
      throw new Error(`Subdomain ${key} must have exactly 5 questions (4 scale + 1 open)`);
    }

    let html = `
      <div class="card">
        <h2>${label}</h2>
        <p class="subdomain-description">${description}</p>
    `;

    // 4 scale questions (Belief, Behavior, Feeling, Consequence)
    questions.slice(0, 4).forEach((question, index) => {
      html += this.buildScaleQuestion(question, index, key, existingData);
    });

    // 1 open response question
    html += this.buildOpenResponseQuestion(questions[4], key, existingData);

    html += `
      </div>
    `;

    return html;
  },

  /**
   * Build a single scale question (-3 to +3, no zero)
   * Now supports full descriptive labels for each scale option
   */
  buildScaleQuestion(question, index, subdomainKey, existingData) {
    const {aspect, text, scale} = question;
    const fieldName = `${subdomainKey}_${aspect.toLowerCase()}`;
    const labelFieldName = `${fieldName}_label`;

    // Get existing value if available
    const selectedValue = existingData?.[fieldName] || '';

    // Build scale options HTML (vertical layout)
    let scaleOptionsHTML = '';

    // Handle both old format (object with negative/positive) and new format (array)
    if (Array.isArray(scale)) {
      // New format: array of scale objects with value and label
      scale.forEach(option => {
        const radioId = `${fieldName}_${option.value < 0 ? 'n' : 'p'}${Math.abs(option.value)}`;
        const isChecked = selectedValue === String(option.value);
        const displayValue = option.value > 0 ? `+${option.value}` : option.value;

        scaleOptionsHTML += `
          <div class="scale-option">
            <input
              type="radio"
              id="${radioId}"
              name="${fieldName}"
              value="${option.value}"
              data-label="${this.escapeHtml(option.label)}"
              ${isChecked ? 'checked' : ''}
              required
            >
            <label for="${radioId}">
              <span class="scale-value">${displayValue}</span>
              <span class="scale-description">${option.label}</span>
            </label>
          </div>
        `;
      });
    } else {
      // Old format: object with negative/positive (backward compatibility)
      const values = [-3, -2, -1, 1, 2, 3];
      values.forEach(value => {
        const radioId = `${fieldName}_${value < 0 ? 'n' : 'p'}${Math.abs(value)}`;
        const isChecked = selectedValue === String(value);
        const displayValue = value > 0 ? `+${value}` : value;
        const label = value === -3 ? scale.negative : (value === 3 ? scale.positive : `${displayValue}`);

        scaleOptionsHTML += `
          <div class="scale-option">
            <input
              type="radio"
              id="${radioId}"
              name="${fieldName}"
              value="${value}"
              data-label="${this.escapeHtml(label)}"
              ${isChecked ? 'checked' : ''}
              required
            >
            <label for="${radioId}">
              <span class="scale-value">${displayValue}</span>
              <span class="scale-description">${label}</span>
            </label>
          </div>
        `;
      });
    }

    // Hidden field to store the selected label text for GPT context
    return `
      <div class="question-section">
        <div class="question-header">${aspect}</div>
        <div class="question-text">${text}</div>

        <div class="scale-container-vertical">
          ${scaleOptionsHTML}
        </div>

        <input type="hidden" name="${labelFieldName}" id="${labelFieldName}" value="">

        <script>
          // Store the label text when a radio is selected
          (function() {
            const radios = document.querySelectorAll('input[name="${fieldName}"]');
            const labelField = document.getElementById('${labelFieldName}');

            radios.forEach(radio => {
              radio.addEventListener('change', function() {
                if (this.checked) {
                  labelField.value = this.getAttribute('data-label') || '';
                }
              });

              // Set initial value if already selected
              if (radio.checked) {
                labelField.value = radio.getAttribute('data-label') || '';
              }
            });
          })();
        </script>
      </div>
    `;
  },

  /**
   * Escape HTML entities for use in attributes
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  /**
   * Build open response question
   */
  buildOpenResponseQuestion(question, subdomainKey, existingData) {
    const {text} = question;
    const fieldName = `${subdomainKey}_open_response`;

    // Get existing text if available (need to escape HTML entities)
    const existingText = existingData?.[fieldName] || '';
    const escapedText = existingText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return `
      <div class="question-section">
        <div class="question-header">Reflection</div>
        <div class="question-text">${text}</div>
        <textarea
          id="${fieldName}"
          name="${fieldName}"
          class="open-response-textarea"
          required
          minlength="20"
          placeholder="Please share your thoughts here (minimum 20 characters)..."
        >${escapedText}</textarea>
      </div>
    `;
  },

  /**
   * Generate background GPT trigger script (DEPRECATED - moved to server-side)
   * GPT analysis is now triggered server-side in Tool.savePageData() after draft save
   * This eliminates race conditions where page navigation would cancel GPT calls
   */
  getBackgroundGPTScript(toolId, subdomainKey, subdomainIndex) {
    // Return empty string - no longer needed on client side
    // GPT triggering now happens in Tool3.savePageData() and Tool5.savePageData()
    return '';
  },

  /**
   * Get default intro text
   */
  getDefaultIntro(toolName) {
    return `
      <div class="card">
        <h2>Welcome to ${toolName}</h2>
        <p class="muted" style="margin-bottom: 20px;">
          This assessment explores patterns in how you relate to your financial life.
          It's designed to help you understand the "why" behind your money behaviors.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">How it Works</h3>
        <ul style="line-height: 1.8; color: rgba(255, 255, 255, 0.85);">
          <li>You'll complete <strong>6 sections</strong>, one at a time</li>
          <li>Each section has <strong>4 scale questions</strong> and <strong>1 reflection question</strong></li>
          <li>There are no "right" or "wrong" answers - this is about self-discovery</li>
          <li>Answer honestly based on your actual patterns, not how you wish things were</li>
          <li>This takes about <strong>20-25 minutes</strong> to complete</li>
        </ul>

        <h3 style="color: #ad9168; margin-top: 25px;">Your Privacy</h3>
        <p style="line-height: 1.6; color: rgba(255, 255, 255, 0.85);">
          Your responses are private and used only to generate your personalized insights.
          We use secure AI analysis to understand your patterns and provide meaningful guidance.
        </p>

        <div style="background: rgba(173, 145, 104, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ad9168; margin-top: 25px;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
            💡 <strong>Tip:</strong> Find a quiet space where you can be honest with yourself.
            The more authentic your responses, the more valuable your insights will be.
          </p>
        </div>
      </div>
    `;
  }
};
