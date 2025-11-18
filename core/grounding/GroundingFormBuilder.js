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

    // Build subdomain content
    const subdomainContent = this.buildSubdomainContent(subdomain, subdomainIndex, toolId);

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
  buildSubdomainContent(subdomain, subdomainIndex, toolId) {
    const {key, label, description, questions} = subdomain;

    if (!questions || questions.length !== 5) {
      throw new Error(`Subdomain ${key} must have exactly 5 questions (4 scale + 1 open)`);
    }

    let html = `
      <div class="card">
        <h2>${label}</h2>
        <p class="muted" style="margin-bottom: 25px;">${description}</p>
    `;

    // 4 scale questions (Belief, Behavior, Feeling, Consequence)
    questions.slice(0, 4).forEach((question, index) => {
      html += this.buildScaleQuestion(question, index, key);
    });

    // 1 open response question
    html += this.buildOpenResponseQuestion(questions[4], key);

    html += `
      </div>
    `;

    return html;
  },

  /**
   * Build a single scale question (-3 to +3, no zero)
   */
  buildScaleQuestion(question, index, subdomainKey) {
    const {aspect, text, scale} = question;
    const fieldName = `${subdomainKey}_${aspect.toLowerCase()}`;

    return `
      <div class="question-section">
        <div class="question-header">${aspect}</div>
        <div class="question-text">${text}</div>

        <div class="scale-container">
          <div class="scale-label">${scale.negative}</div>
          <div class="scale-inputs">
            <div class="scale-input">
              <input type="radio" id="${fieldName}_n3" name="${fieldName}" value="-3" required>
              <label for="${fieldName}_n3">-3</label>
            </div>
            <div class="scale-input">
              <input type="radio" id="${fieldName}_n2" name="${fieldName}" value="-2" required>
              <label for="${fieldName}_n2">-2</label>
            </div>
            <div class="scale-input">
              <input type="radio" id="${fieldName}_n1" name="${fieldName}" value="-1" required>
              <label for="${fieldName}_n1">-1</label>
            </div>
            <div class="scale-input">
              <input type="radio" id="${fieldName}_p1" name="${fieldName}" value="1" required>
              <label for="${fieldName}_p1">+1</label>
            </div>
            <div class="scale-input">
              <input type="radio" id="${fieldName}_p2" name="${fieldName}" value="2" required>
              <label for="${fieldName}_p2">+2</label>
            </div>
            <div class="scale-input">
              <input type="radio" id="${fieldName}_p3" name="${fieldName}" value="3" required>
              <label for="${fieldName}_p3">+3</label>
            </div>
          </div>
          <div class="scale-label">${scale.positive}</div>
        </div>
      </div>
    `;
  },

  /**
   * Build open response question
   */
  buildOpenResponseQuestion(question, subdomainKey) {
    const {text} = question;
    const fieldName = `${subdomainKey}_open_response`;

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
        ></textarea>
      </div>
    `;
  },

  /**
   * Generate background GPT trigger script
   * Fires after form submission to trigger GPT analysis in background
   */
  getBackgroundGPTScript(toolId, subdomainKey, subdomainIndex) {
    return `
      <script>
        /**
         * Trigger background GPT analysis for this subdomain
         * Called automatically after successful form submission
         */
        function triggerBackgroundGPT(clientId, subdomainKey, subdomainIndex, formData) {
          console.log('[GPT] Triggering background analysis for:', subdomainKey);

          // Fire-and-forget GPT call (don't wait for result)
          google.script.run
            .withSuccessHandler(function() {
              console.log('[GPT] Background analysis started for:', subdomainKey);
            })
            .withFailureHandler(function(error) {
              console.warn('[GPT] Background analysis failed (will use fallback):', error);
            })
            .triggerGroundingGPTAnalysis('${toolId}', clientId, subdomainKey, subdomainIndex, formData);
        }

        // Override the standard submitToolPage to add GPT trigger
        const originalSubmitToolPage = window.submitToolPage;
        window.submitToolPage = function(formId, page, nextRoute) {
          const form = document.getElementById(formId);
          if (!form) return false;

          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          // Trigger background GPT before submission
          triggerBackgroundGPT(
            data.client,
            '${subdomainKey}',
            ${subdomainIndex},
            data
          );

          // Call original submission
          return originalSubmitToolPage(formId, page, nextRoute);
        };
      </script>
    `;
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
