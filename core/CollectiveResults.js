/**
 * CollectiveResults - Unified summary dashboard showing key results from all tools
 *
 * Three-section architecture:
 *   Section 1: Psychological Landscape (Tools 1, 3, 5, 7)
 *   Section 2: Financial Structure (Tools 2, 4, 6, 8)
 *   Section 3: Integration (placeholder for AI-discovered patterns)
 */

const CollectiveResults = {

  // ============================================================
  // CONSTANTS & METADATA
  // ============================================================

  TOOL_META: {
    tool1: { name: 'Core Trauma Strategy Assessment', shortName: 'Trauma Strategy', icon: '🧠' },
    tool2: { name: 'Financial Clarity & Values', shortName: 'Financial Clarity', icon: '📊' },
    tool3: { name: 'Identity & Validation', shortName: 'Identity & Validation', icon: '🪞' },
    tool4: { name: 'Financial Freedom Framework', shortName: 'Budget Framework', icon: '💰' },
    tool5: { name: 'Love & Connection', shortName: 'Love & Connection', icon: '❤️' },
    tool6: { name: 'Retirement Blueprint', shortName: 'Retirement Blueprint', icon: '🏦' },
    tool7: { name: 'Security & Control', shortName: 'Security & Control', icon: '🛡️' },
    tool8: { name: 'Investment Planning', shortName: 'Investment Planning', icon: '📈' }
  },

  STRATEGY_LABELS: {
    FSV: 'False Self-View',
    ExVal: 'External Validation',
    Showing: 'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control: 'Control Leading to Isolation',
    Fear: 'Fear Leading to Isolation'
  },

  GROUNDING_CONFIG: {
    tool3: {
      domain1Name: 'False Self-View (FSV)',
      domain2Name: 'External Validation (ExVal)',
      subdomains: {
        subdomain_1_1: "I am Not Worthy of Financial Freedom",
        subdomain_1_2: "I will Never Have Enough",
        subdomain_1_3: "I Cannot See My Financial Reality",
        subdomain_2_1: "Money Shows My Worth",
        subdomain_2_2: "What Will They Think?",
        subdomain_2_3: "I Need to Prove I am Successful"
      }
    },
    tool5: {
      domain1Name: 'Issues Showing Love (ISL)',
      domain2Name: 'Issues Receiving Love (IRL)',
      subdomains: {
        subdomain_1_1: "I Must Give to Be Loved",
        subdomain_1_2: "Their Needs Are Greater Than My Needs",
        subdomain_1_3: "I Cannot Accept Help",
        subdomain_2_1: "I Cannot Make It Alone",
        subdomain_2_2: "I Owe Them Everything",
        subdomain_2_3: "I Will Always Be in Debt"
      }
    },
    tool7: {
      domain1Name: 'Control Leading to Isolation (CLI)',
      domain2Name: 'Fear Leading to Isolation (FLI)',
      subdomains: {
        subdomain_1_1: "I Undercharge and Give Away",
        subdomain_1_2: "I Have Money But Will Not Use It",
        subdomain_1_3: "Only I Can Do It Right",
        subdomain_2_1: "I Do Not Protect Myself",
        subdomain_2_2: "I Sabotage Success",
        subdomain_2_3: "I Am Destined to Be Betrayed"
      }
    }
  },

  DOMAIN_LABELS: {
    moneyFlow: 'Money Flow',
    obligations: 'Obligations',
    liquidity: 'Liquidity',
    growth: 'Growth',
    protection: 'Protection'
  },

  // Integration profile archetypes — triggered by Tool 1 winner + grounding tool subdomain scores
  INTEGRATION_PROFILES: {
    guardian: {
      name: 'The Guardian',
      icon: '🛡️',
      triggers: { tool1Winner: 'Control', groundingKey: 'tool7', subdomainKey: 'subdomain_1_3', threshold: 50 },
      description: 'You take full responsibility for your financial world. That strength becomes a wall when it blocks you from accepting help or delegating financial decisions.',
      financialSignature: 'Low obligation spending, high self-reliance, growth may stagnate from isolation.'
    },
    provider: {
      name: 'The Provider',
      icon: '❤️',
      triggers: { tool1Winner: 'Showing', groundingKey: 'tool5', subdomainKey: 'subdomain_1_1', threshold: 50 },
      description: 'You pour your financial energy into others. Your budgets often prioritize everyone else before they prioritize you.',
      financialSignature: 'High essentials allocation, low personal savings, freedom category underfunded.'
    },
    achiever: {
      name: 'The Achiever',
      icon: '🏆',
      triggers: { tool1Winner: 'FSV', groundingKey: 'tool3', subdomainKey: 'subdomain_2_1', threshold: 50 },
      description: 'You build wealth to prove something. Your financial engine runs hot, but the fuel is shame rather than strategy.',
      financialSignature: 'Growth-focused allocation, but motivation is compensatory rather than strategic.'
    },
    protector: {
      name: 'The Protector',
      icon: '🔒',
      triggers: { tool1Winner: 'Fear', groundingKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50 },
      description: 'You know the dangers but cannot bring yourself to build real protection. The fear that should motivate you has become the thing that freezes you.',
      financialSignature: 'Protection domain underserved, growth paralyzed, sabotage risk elevated.'
    },
    connector: {
      name: 'The Connector',
      icon: '🔗',
      triggers: { tool1Winner: 'Receiving', groundingKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 50 },
      description: 'You experience money as a relationship currency. Financial obligations feel like emotional obligations, and both keep growing.',
      financialSignature: 'Obligation spending elevated, debt patterns, essentials include perceived debts to others.'
    },
    seeker: {
      name: 'The Seeker',
      icon: '🔍',
      triggers: null,
      description: 'Your patterns do not point to a single dominant strategy. You are navigating multiple influences at once, which means broad awareness matters more than any single fix.',
      financialSignature: 'Mixed financial indicators, no single pattern dominates.'
    }
  },

  // Tools with dedicated report pages vs calculator tools
  REPORT_TOOLS: ['tool1', 'tool2', 'tool3', 'tool5', 'tool7', 'tool8'],
  CALCULATOR_TOOLS: ['tool4', 'tool6'],

  // ============================================================
  // DATA AGGREGATION
  // ============================================================

  /**
   * Collect all tool results for a student
   * @param {string} clientId
   * @returns {Object} Summary object with status and data per tool
   */
  getStudentSummary(clientId) {
    const toolIds = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8'];
    const summary = {
      clientId: clientId,
      completedCount: 0,
      totalTools: 8,
      tools: {}
    };

    for (var i = 0; i < toolIds.length; i++) {
      var toolId = toolIds[i];
      try {
        var response = DataService.getLatestResponse(clientId, toolId);

        if (response && response.status === 'COMPLETED') {
          var data = response.data;
          if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { data = null; }
          }
          summary.tools[toolId] = {
            status: 'completed',
            data: data,
            timestamp: response.timestamp
          };
          summary.completedCount++;
        } else if (response && (response.status === 'DRAFT' || response.status === 'EDIT_DRAFT')) {
          summary.tools[toolId] = {
            status: 'in_progress',
            data: null
          };
        } else {
          summary.tools[toolId] = {
            status: 'not_started',
            data: null
          };
        }
      } catch (err) {
        Logger.log('[CollectiveResults] Error fetching ' + toolId + ': ' + err);
        summary.tools[toolId] = { status: 'not_started', data: null };
      }
    }

    return summary;
  },

  // ============================================================
  // MAIN RENDERER
  // ============================================================

  /**
   * Render the collective results page
   * @param {string} clientId
   * @returns {HtmlOutput}
   */
  render(clientId) {
    try {
      const summary = this.getStudentSummary(clientId);
      const html = this._buildPageHTML(clientId, summary);
      const template = HtmlService.createTemplate(html);
      return template.evaluate()
        .setTitle('TruPath - Your Results Summary')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      Logger.log('[CollectiveResults] Render error: ' + error);
      return HtmlService.createHtmlOutput(
        '<html><body style="background:#1e192b;color:#fff;font-family:sans-serif;padding:40px;">' +
        '<h1>Error Loading Results</h1><p>' + error.message + '</p></body></html>'
      );
    }
  },

  // ============================================================
  // PAGE HTML BUILDER
  // ============================================================

  _buildPageHTML(clientId, summary) {
    const completionPct = Math.round((summary.completedCount / summary.totalTools) * 100);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Your Results Summary</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#1e192b">
        <style>
          html { background: #1e192b; }
          body {
            background: linear-gradient(135deg, #4b4166, #1e192b);
            background-attachment: fixed;
            margin: 0; padding: 0;
            opacity: 0;
            transition: opacity 0.3s ease-in;
          }
          body.loaded { opacity: 1; }
        </style>
        <?!= include('shared/styles') ?>
        <?!= include('shared/loading-animation') ?>
        ${this._getStyles()}
      </head>
      <body>
        <div class="container">

          <!-- Header -->
          <div class="card">
            <div class="tool-header">
              <h1>Your TruPath Results</h1>
              <p class="muted">Collective summary across all assessments</p>
            </div>
            <div class="hr"></div>
            <div class="tool-meta">
              <span>Student: ${clientId || 'Unknown'}</span>
              <span class="badge">${summary.completedCount} of ${summary.totalTools} Complete</span>
            </div>
            <!-- Progress Bar -->
            <div class="cr-progress-container">
              <div class="cr-progress-track">
                <div class="cr-progress-fill" style="width: ${completionPct}%;"></div>
              </div>
              <div class="cr-progress-dots">
                ${this._renderProgressDots(summary)}
              </div>
            </div>
          </div>

          <!-- Section 1: Psychological Landscape -->
          ${this._renderSection1(summary, clientId)}

          <!-- Section 2: Financial Structure -->
          ${this._renderSection2(summary, clientId)}

          <!-- Section 3: Integration (Placeholder) -->
          ${this._renderSection3(summary)}

          <!-- Back to Dashboard -->
          <div class="text-center" style="margin: 30px 0 40px;">
            <button class="btn-primary" onclick="goToDashboard()">
              Back to Dashboard
            </button>
          </div>

        </div>

        ${this._getScripts(clientId)}

        <script>
          window.addEventListener('load', function() {
            document.body.classList.add('loaded');
          });
          setTimeout(function() {
            document.body.classList.add('loaded');
          }, 100);
        </script>
      </body>
      </html>
    `;
  },

  // ============================================================
  // PROGRESS DOTS
  // ============================================================

  _renderProgressDots(summary) {
    const toolIds = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8'];
    let dots = '';
    for (var i = 0; i < toolIds.length; i++) {
      var toolId = toolIds[i];
      var tool = summary.tools[toolId];
      var statusClass = 'dot-not-started';
      var label = (i + 1);
      if (tool.status === 'completed') statusClass = 'dot-completed';
      else if (tool.status === 'in_progress') statusClass = 'dot-in-progress';
      dots += '<div class="cr-dot ' + statusClass + '" title="Tool ' + label + '">' + label + '</div>';
    }
    return dots;
  },

  // ============================================================
  // SECTION 1: PSYCHOLOGICAL LANDSCAPE
  // ============================================================

  _renderSection1(summary, clientId) {
    return `
      <div class="card cr-section-card">
        <h2 class="cr-section-title">Your Psychological Landscape</h2>
        <p class="muted">How your core trauma strategies shape your relationship with money</p>
        <div class="hr" style="margin: 15px 0;"></div>

        <!-- Tool 1: Overview -->
        ${this._renderTool1Card(summary.tools.tool1, clientId)}

        <!-- Tools 3, 5, 7: Deep Dives -->
        <div class="cr-grid" style="margin-top: 15px;">
          ${this._renderGroundingCard('tool3', summary.tools.tool3, clientId)}
          ${this._renderGroundingCard('tool5', summary.tools.tool5, clientId)}
        </div>
        <div style="margin-top: 15px;">
          ${this._renderGroundingCard('tool7', summary.tools.tool7, clientId)}
        </div>
      </div>
    `;
  },

  // ============================================================
  // SECTION 2: FINANCIAL STRUCTURE
  // ============================================================

  _renderSection2(summary, clientId) {
    return `
      <div class="card cr-section-card">
        <h2 class="cr-section-title">Your Financial Structure</h2>
        <p class="muted">Clarity &rarr; Allocation &rarr; Strategy &rarr; Projection</p>
        <div class="hr" style="margin: 15px 0;"></div>

        <div class="cr-grid">
          ${this._renderTool2Card(summary.tools.tool2, clientId)}
          ${this._renderTool4Card(summary.tools.tool4, clientId)}
        </div>
        <div class="cr-grid" style="margin-top: 15px;">
          ${this._renderTool6Card(summary.tools.tool6, clientId)}
          ${this._renderTool8Card(summary.tools.tool8, clientId)}
        </div>
      </div>
    `;
  },

  // ============================================================
  // SECTION 3: THE INTEGRATION
  // ============================================================

  _renderSection3(summary) {
    // Run all detection engines once — results reused by Phases 4, 5, and 9
    var engines = {
      profile: this._detectProfile(summary),
      warnings: this._generateWarnings(summary),
      awarenessGap: this._calculateAwarenessGap(summary),
      locks: this._detectBeliefLocks(summary),
      bbGaps: this._detectBeliefBehaviorGaps(summary)
    };

    var hasProfile = engines.profile !== null;
    var hasWarnings = engines.warnings && engines.warnings.length > 0;

    // Gate: if no engines produced content, show placeholder or nothing
    if (!hasProfile && !hasWarnings) {
      if (summary.completedCount >= 1) {
        return '<div class="card cr-section-card">' +
          '<h2 class="cr-section-title">The Integration</h2>' +
          '<p class="muted">Where your psychological patterns meet your financial world</p>' +
          '<div class="hr" style="margin: 15px 0;"></div>' +
          '<div class="cr-integration-placeholder">' +
            '<div class="cr-integration-icon">🔬</div>' +
            '<p style="margin: 10px 0 5px; font-size: 1.05rem; color: var(--text);">' +
              'Almost there' +
            '</p>' +
            '<p class="muted" style="font-size: 0.9rem; max-width: 500px; margin: 0 auto;">' +
              'Complete Tool 1 (Core Trauma Assessment) and at least one grounding tool ' +
              '(Identity, Love and Connection, or Financial Security) to unlock your integration insights.' +
            '</p>' +
          '</div>' +
        '</div>';
      }
      return '';
    }

    // Build Section 3 with real engine output
    var html = '<div class="card cr-section-card">' +
      '<h2 class="cr-section-title">The Integration</h2>' +
      '<p class="muted">Where your psychological patterns meet your financial world</p>' +
      '<div class="hr" style="margin: 15px 0;"></div>';

    // 3A: Profile Card
    html += this._renderProfileCard(engines.profile);

    // 3B: Warning Cards
    if (hasWarnings) {
      html += this._renderWarningCards(engines.warnings);
    }

    // 3C: Awareness Gap (render before locks — it is the most important finding)
    if (engines.awarenessGap && engines.awarenessGap.severity !== 'normal') {
      html += this._renderAwarenessGap(engines.awarenessGap);
    }

    // 3D: Belief Locks
    if (engines.locks && engines.locks.length > 0) {
      html += this._renderBeliefLocks(engines.locks);
    }

    // 3E: Belief-Behavior Gaps
    if (engines.bbGaps && engines.bbGaps.length > 0) {
      html += this._renderBeliefBehaviorGaps(engines.bbGaps);
    }

    // Phase 9: Download button will be added here

    html += '</div>';
    return html;
  },

  /**
   * Phase 4: Render the student's integration profile as a styled card.
   * @param {Object|null} profile - from _detectProfile()
   * @returns {string} HTML string
   */
  _renderProfileCard(profile) {
    if (!profile) return '';

    var confidenceNote = '';
    if (profile.confidence === 'partial') {
      confidenceNote = '<p class="muted" style="font-size: 0.8rem; margin-top: 10px;">' +
        'Note: Complete more grounding tools for a more precise profile.' +
      '</p>';
    }

    var sourcesHtml = '';
    if (profile.sources && profile.sources.length > 0) {
      sourcesHtml = '<div class="cr-profile-sources">';
      for (var i = 0; i < profile.sources.length; i++) {
        sourcesHtml += '<span class="cr-profile-source">' + profile.sources[i] + '</span>';
      }
      sourcesHtml += '</div>';
    }

    return '<div class="cr-profile-card">' +
      '<div class="cr-profile-icon">' + profile.icon + '</div>' +
      '<div class="cr-profile-name">' + profile.name + '</div>' +
      '<p class="cr-profile-description">' + profile.description + '</p>' +
      '<p class="cr-profile-financial muted" style="font-size: 0.85rem; margin-top: 8px;">' +
        profile.financialSignature +
      '</p>' +
      sourcesHtml +
      confidenceNote +
    '</div>';
  },

  /**
   * Phase 4: Render prioritized warning cards with color-coded borders.
   * Student view limited to 4 warnings max.
   * @param {Array} warnings - from _generateWarnings()
   * @returns {string} HTML string
   */
  _renderWarningCards(warnings) {
    var maxWarnings = Math.min(warnings.length, 4);
    if (maxWarnings === 0) return '';

    var html = '<div class="cr-warnings-section" style="margin-top: 20px;">' +
      '<h3 style="color: var(--text); font-size: 1rem; margin-bottom: 12px;">Active Patterns Affecting Your Finances</h3>';

    for (var i = 0; i < maxWarnings; i++) {
      var w = warnings[i];

      var priorityClass = 'cr-warning-medium';
      var priorityLabel = 'Pattern';
      var priorityIcon = '📋';

      if (w.priority === 'CRITICAL') {
        priorityClass = 'cr-warning-critical';
        priorityLabel = 'Critical Pattern';
        priorityIcon = '🚨';
      } else if (w.priority === 'HIGH') {
        priorityClass = 'cr-warning-high';
        priorityLabel = 'Active Warning';
        priorityIcon = '⚠️';
      }

      var sourcesText = w.sources ? w.sources.join(' + ') : '';

      html += '<div class="cr-warning-card ' + priorityClass + '">' +
        '<div class="cr-warning-header">' +
          '<span class="cr-warning-icon">' + priorityIcon + '</span>' +
          '<span class="cr-warning-label">' + priorityLabel + '</span>' +
        '</div>' +
        '<div class="cr-warning-message">' + w.message + '</div>' +
        '<div class="cr-warning-source muted" style="font-size: 0.8rem; margin-top: 8px;">' +
          'Based on: ' + sourcesText +
        '</div>' +
      '</div>';
    }

    if (warnings.length > 4) {
      html += '<p class="muted" style="font-size: 0.85rem; text-align: center; margin-top: 8px;">' +
        (warnings.length - 4) + ' additional pattern' + (warnings.length - 4 > 1 ? 's' : '') +
        ' detected. Speak with your coach for the complete analysis.' +
      '</p>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Phase 5: Render the Awareness Gap visualization — 3C
   * Shows dual progress bars comparing psych score vs stress awareness.
   *
   * @param {Object} gap - from _calculateAwarenessGap()
   * @returns {string} HTML
   */
  _renderAwarenessGap(gap) {
    if (!gap || gap.severity === 'normal') return '';

    var severityClass = gap.severity === 'critical' ? 'cr-gap-critical' : 'cr-gap-elevated';
    var severityIcon = gap.severity === 'critical' ? '🚨' : '👁️';

    var gapMessage = '';
    if (gap.severity === 'critical') {
      gapMessage = 'This is a significant gap. The patterns that feel normal to you are likely the ones doing the most financial damage. Your psychological scores show active patterns, but your stress levels suggest you are not seeing the impact.';
    } else {
      gapMessage = 'There is a moderate gap between your psychological patterns and your stress awareness. Some financial impacts may be going unnoticed.';
    }

    return '<div class="cr-awareness-gap ' + severityClass + '" style="margin-top: 20px;">' +
      '<h3 style="color: var(--text); font-size: 1rem; margin-bottom: 12px;">' +
        severityIcon + ' Your Awareness Gap' +
      '</h3>' +
      '<p class="cr-gap-message" style="font-size: 0.9rem; color: var(--text); line-height: 1.5; margin-bottom: 15px;">' +
        gapMessage +
      '</p>' +

      // Psych score bar
      '<div class="cr-gap-bar-row">' +
        '<span class="cr-gap-bar-label muted">Psychological Patterns</span>' +
        '<div class="cr-gap-bar-container">' +
          '<div class="cr-gap-bar">' +
            '<div class="cr-gap-fill cr-gap-fill-psych" style="width: ' + gap.psychScore + '%;"></div>' +
          '</div>' +
          '<span class="cr-gap-bar-value">' + gap.psychScore + '</span>' +
        '</div>' +
      '</div>' +

      // Stress score bar
      '<div class="cr-gap-bar-row">' +
        '<span class="cr-gap-bar-label muted">Stress Awareness</span>' +
        '<div class="cr-gap-bar-container">' +
          '<div class="cr-gap-bar">' +
            '<div class="cr-gap-fill cr-gap-fill-stress" style="width: ' + gap.stressScore + '%;"></div>' +
          '</div>' +
          '<span class="cr-gap-bar-value">' + gap.stressScore + '</span>' +
        '</div>' +
      '</div>' +

      // Gap indicator
      '<div style="text-align: center; margin-top: 10px;">' +
        '<span class="cr-gap-badge ' + severityClass + '">' +
          'Gap: ' + gap.gapScore + ' points' +
        '</span>' +
      '</div>' +
      '<p class="muted" style="font-size: 0.8rem; margin-top: 8px; text-align: center;">' +
        'Based on ' + gap.groundingToolsUsed + ' grounding tool' + (gap.groundingToolsUsed > 1 ? 's' : '') +
      '</p>' +
    '</div>';
  },

  /**
   * Phase 5: Render belief lock chains — 3D
   * Shows interlocking beliefs as connected chains.
   * Student view: max 3 locks.
   *
   * @param {Array} locks - from _detectBeliefLocks()
   * @returns {string} HTML
   */
  _renderBeliefLocks(locks) {
    var maxLocks = Math.min(locks.length, 3);
    if (maxLocks === 0) return '';

    var html = '<div class="cr-locks-section" style="margin-top: 20px;">' +
      '<h3 style="color: var(--text); font-size: 1rem; margin-bottom: 5px;">Your Belief Locks</h3>' +
      '<p class="muted" style="font-size: 0.85rem; margin-bottom: 12px;">' +
        'A belief lock happens when beliefs from different parts of your psychology all reinforce each other, making the overall pattern very stable and hard to change without targeted work.' +
      '</p>';

    for (var i = 0; i < maxLocks; i++) {
      var lock = locks[i];

      var strengthBadge = '';
      if (lock.strength === 'strong') {
        strengthBadge = '<span class="cr-lock-strength cr-lock-strong">Strong</span>';
      } else if (lock.strength === 'moderate') {
        strengthBadge = '<span class="cr-lock-strength cr-lock-moderate">Moderate</span>';
      } else {
        strengthBadge = '<span class="cr-lock-strength cr-lock-emerging">Emerging</span>';
      }

      html += '<div class="cr-lock-chain">' +
        '<div class="cr-lock-header">' +
          '<span>🔒 ' + lock.name + '</span>' +
          strengthBadge +
        '</div>';

      // Render belief chain with connectors
      for (var b = 0; b < lock.beliefs.length; b++) {
        var belief = lock.beliefs[b];

        if (b > 0) {
          html += '<div class="cr-lock-connector">↕</div>';
        }

        var scoreColor = this._quotientColor(belief.score);
        html += '<div class="cr-lock-belief">' +
          '<span class="cr-lock-belief-text">"' + belief.label + '"</span>' +
          '<span class="cr-lock-belief-meta muted">' +
            belief.tool + ': <span style="color: ' + scoreColor + ';">' + belief.score + '/100</span>' +
          '</span>' +
        '</div>';
      }

      // Financial impact
      html += '<div class="cr-lock-impact">' +
        '<span class="cr-lock-impact-icon">⚠️</span>' +
        '<span class="cr-lock-impact-text">' + lock.financialImpact + '</span>' +
      '</div>';

      html += '</div>';
    }

    if (locks.length > 3) {
      html += '<p class="muted" style="font-size: 0.85rem; text-align: center; margin-top: 8px;">' +
        (locks.length - 3) + ' additional lock' + (locks.length - 3 > 1 ? 's' : '') + ' detected. Speak with your coach for the complete analysis.' +
      '</p>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Phase 5: Render belief-behavior gaps — 3E
   * Shows where stated beliefs diverge from actual behaviors.
   * Student view: max 3 gaps.
   *
   * @param {Array} gaps - from _detectBeliefBehaviorGaps()
   * @returns {string} HTML
   */
  _renderBeliefBehaviorGaps(gaps) {
    var maxGaps = Math.min(gaps.length, 3);
    if (maxGaps === 0) return '';

    var html = '<div class="cr-bb-gaps-section" style="margin-top: 20px;">' +
      '<h3 style="color: var(--text); font-size: 1rem; margin-bottom: 5px;">' +
        '🪞 Where Your Beliefs and Actions Do Not Match' +
      '</h3>' +
      '<p class="muted" style="font-size: 0.85rem; margin-bottom: 12px;">' +
        'These are areas where what you say you believe does not match how you actually behave. This kind of gap often signals internal conflict.' +
      '</p>';

    for (var i = 0; i < maxGaps; i++) {
      var g = gaps[i];

      html += '<div class="cr-bb-gap-card">' +
        '<div class="cr-bb-gap-title">"' + g.label + '"</div>' +
        '<div class="cr-bb-gap-subtitle muted">' + g.tool + '</div>' +

        '<div class="cr-bb-gap-scores">' +
          '<div class="cr-bb-gap-score-item">' +
            '<span class="muted">What you believe</span>' +
            '<span class="cr-bb-gap-value">' + g.beliefScore + ' / 10</span>' +
          '</div>' +
          '<div class="cr-bb-gap-score-item">' +
            '<span class="muted">How you act</span>' +
            '<span class="cr-bb-gap-value">' + g.behaviorScore + ' / 10</span>' +
          '</div>' +
          '<div class="cr-bb-gap-score-item">' +
            '<span class="muted">Gap</span>' +
            '<span class="cr-bb-gap-value cr-bb-gap-highlight">' + g.gap + ' points</span>' +
          '</div>' +
        '</div>' +

        '<div class="cr-bb-gap-direction">' +
          '<span class="cr-bb-gap-direction-label">' + g.direction + '</span>' +
        '</div>' +

        '<p class="cr-bb-gap-interpretation muted" style="font-size: 0.85rem; margin-top: 8px;">' +
          g.interpretation +
        '</p>' +
      '</div>';
    }

    html += '</div>';
    return html;
  },

  // ============================================================
  // PHASE 6: COACH INTEGRATION PAGE
  // ============================================================

  /**
   * Render the full integration analysis page for coach/admin view.
   * Shows everything the student sees plus additional analytics.
   *
   * @param {string} clientId - Student to analyze
   * @returns {string} Full HTML page
   */
  renderCoachIntegrationPage(clientId) {
    try {
      var summary = this.getStudentSummary(clientId);

      if (summary.completedCount < 1) {
        return '<html><body style="background:#1e192b;color:#fff;font-family:sans-serif;padding:40px;">' +
          '<h1>No Data Available</h1>' +
          '<p>This student has not completed any tools yet.</p>' +
          '<button onclick="history.back()" style="margin-top:20px;padding:10px 20px;background:#ad9168;color:#fff;border:none;border-radius:6px;cursor:pointer;">Go Back</button>' +
        '</body></html>';
      }

      // Run all detection engines
      var profile = this._detectProfile(summary);
      var warnings = this._generateWarnings(summary);
      var awarenessGap = this._calculateAwarenessGap(summary);
      var locks = this._detectBeliefLocks(summary);
      var bbGaps = this._detectBeliefBehaviorGaps(summary);

      // Detect pipelines
      var pipelineA = this._detectPipeline(summary, 'A');
      var pipelineB = this._detectPipeline(summary, 'B');

      var html = '<!DOCTYPE html><html><head>' +
        '<title>Integration Analysis: ' + clientId + '</title>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' +
          'html { background: #1e192b; }' +
          'body { background: linear-gradient(135deg, #4b4166, #1e192b); background-attachment: fixed; margin:0; padding:20px; font-family: -apple-system, sans-serif; color: #e5e0eb; }' +
          '.container { max-width: 900px; margin: 0 auto; }' +
          '.card { background: rgba(30, 25, 43, 0.85); border: 1px solid rgba(173, 145, 104, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 16px; }' +
          '.muted { color: #8b8498; }' +
          '.gold { color: #ad9168; }' +
          'h1 { color: #ad9168; font-size: 1.4rem; }' +
          'h2 { color: #ad9168; font-size: 1.1rem; margin-top: 0; }' +
          'h3 { color: #e5e0eb; font-size: 1rem; margin-top: 0; }' +
          '.badge { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: 500; }' +
          '.badge-critical { background: rgba(239,68,68,0.2); color: #fca5a5; }' +
          '.badge-high { background: rgba(245,158,11,0.2); color: #fcd34d; }' +
          '.badge-medium { background: rgba(107,114,128,0.2); color: #9ca3af; }' +
          '.badge-strong { background: rgba(239,68,68,0.2); color: #fca5a5; }' +
          '.badge-moderate { background: rgba(245,158,11,0.2); color: #fcd34d; }' +
          '.badge-emerging { background: rgba(16,185,129,0.2); color: #6ee7b7; }' +
          '.warning-row { padding: 10px; margin: 6px 0; border-radius: 6px; border-left: 3px solid; }' +
          '.warning-critical { background: rgba(239,68,68,0.08); border-color: #ef4444; }' +
          '.warning-high { background: rgba(245,158,11,0.08); border-color: #f59e0b; }' +
          '.warning-medium { background: rgba(107,114,128,0.08); border-color: #6b7280; }' +
          '.lock-row { background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; padding: 12px; margin: 8px 0; }' +
          '.gap-row { background: rgba(30,25,43,0.5); border: 1px solid rgba(173,145,104,0.15); border-radius: 8px; padding: 12px; margin: 6px 0; }' +
          '.pipeline-card { padding: 14px; border-radius: 8px; margin: 8px 0; }' +
          '.pipeline-a { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); }' +
          '.pipeline-b { background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.2); }' +
          '.score-inline { font-weight: 600; }' +
          '.back-btn { display: inline-block; padding: 10px 20px; background: #ad9168; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.9rem; margin-top: 20px; }' +
          'table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }' +
          'th { text-align: left; padding: 8px; border-bottom: 1px solid rgba(173,145,104,0.2); color: #ad9168; }' +
          'td { padding: 8px; border-bottom: 1px solid rgba(173,145,104,0.1); }' +
        '</style>' +
      '</head><body><div class="container">';

      // Header
      html += '<div class="card">' +
        '<h1>Integration Analysis</h1>' +
        '<p class="muted">Student: <strong style="color:#e5e0eb;">' + clientId + '</strong></p>' +
        '<p class="muted">Tools Completed: ' + summary.completedCount + ' / 8</p>' +
      '</div>';

      // Profile
      if (profile) {
        html += '<div class="card">' +
          '<h2>Integration Profile</h2>' +
          '<p style="font-size: 1.3rem; font-weight: 700; color: #ad9168;">' + profile.icon + ' ' + profile.name + '</p>' +
          '<p>' + profile.description + '</p>' +
          '<p class="muted" style="font-style:italic;">' + profile.financialSignature + '</p>' +
          '<p class="muted">Confidence: ' + profile.confidence + ' | Sources: ' + profile.sources.join(', ') + '</p>' +
        '</div>';
      }

      // Awareness Gap
      if (awarenessGap) {
        html += '<div class="card">' +
          '<h2>Awareness Gap</h2>' +
          '<p>Psychological Score: <span class="score-inline">' + awarenessGap.psychScore + '/100</span></p>' +
          '<p>Stress Awareness: <span class="score-inline">' + awarenessGap.stressScore + '/100</span></p>' +
          '<p>Gap: <span class="score-inline">' + awarenessGap.gapScore + ' points</span> ' +
            '<span class="badge badge-' + (awarenessGap.severity === 'critical' ? 'critical' : awarenessGap.severity === 'elevated' ? 'high' : 'medium') + '">' + awarenessGap.severity + '</span>' +
          '</p>' +
          '<p class="muted">Raw avg stress: ' + (awarenessGap.rawStress !== null ? awarenessGap.rawStress.toFixed(2) : 'N/A') + ' | Grounding tools used: ' + awarenessGap.groundingToolsUsed + '</p>' +
        '</div>';
      }

      // Pipeline Analysis
      html += '<div class="card">' +
        '<h2>Pipeline Analysis</h2>' +
        '<p class="muted" style="margin-bottom: 12px;">Which psychological pipeline is this student running through?</p>';

      if (pipelineA) {
        html += '<div class="pipeline-card pipeline-a">' +
          '<h3>Pipeline A: Identity to Sabotage (T3 to T7)</h3>' +
          '<p>Strength: <span class="badge badge-' + (pipelineA.strength === 'strong' ? 'strong' : pipelineA.strength === 'moderate' ? 'moderate' : 'emerging') + '">' + pipelineA.strength + '</span></p>' +
          '<p class="muted">' + pipelineA.description + '</p>' +
        '</div>';
      } else {
        html += '<p class="muted">Pipeline A (Identity to Sabotage): Not enough data or not active</p>';
      }

      if (pipelineB) {
        html += '<div class="pipeline-card pipeline-b">' +
          '<h3>Pipeline B: Identity to Caretaking (T3 to T5)</h3>' +
          '<p>Strength: <span class="badge badge-' + (pipelineB.strength === 'strong' ? 'strong' : pipelineB.strength === 'moderate' ? 'moderate' : 'emerging') + '">' + pipelineB.strength + '</span></p>' +
          '<p class="muted">' + pipelineB.description + '</p>' +
        '</div>';
      } else {
        html += '<p class="muted">Pipeline B (Identity to Caretaking): Not enough data or not active</p>';
      }

      html += '</div>';

      // ALL Warnings (coach sees all, not just top 4)
      html += '<div class="card">' +
        '<h2>All Warnings (' + warnings.length + ' detected)</h2>';

      if (warnings.length === 0) {
        html += '<p class="muted">No warnings triggered for this student.</p>';
      } else {
        for (var w = 0; w < warnings.length; w++) {
          var warning = warnings[w];
          var wClass = 'warning-medium';
          if (warning.priority === 'CRITICAL') wClass = 'warning-critical';
          else if (warning.priority === 'HIGH') wClass = 'warning-high';

          html += '<div class="warning-row ' + wClass + '">' +
            '<p><strong>[' + warning.priority + '] ' + warning.type + '</strong></p>' +
            '<p>' + warning.message + '</p>' +
            '<p class="muted">Sources: ' + warning.sources.join(' + ') + '</p>' +
          '</div>';
        }
      }

      html += '</div>';

      // ALL Belief Locks (coach sees all)
      html += '<div class="card">' +
        '<h2>Belief Locks (' + locks.length + ' detected)</h2>';

      if (locks.length === 0) {
        html += '<p class="muted">No belief locks detected. Student subdomain scores may not meet lock thresholds.</p>';
      } else {
        for (var l = 0; l < locks.length; l++) {
          var lock = locks[l];
          html += '<div class="lock-row">' +
            '<p><strong>' + lock.name + '</strong> ' +
              '<span class="badge badge-' + lock.strength + '">' + lock.strength + ' (avg: ' + lock.avgScore + ')</span>' +
            '</p>';

          for (var b = 0; b < lock.beliefs.length; b++) {
            var belief = lock.beliefs[b];
            html += '<p style="padding-left: 15px;">"' + belief.label + '" - ' + belief.tool + ': <span class="score-inline">' + belief.score + '/100</span></p>';
          }

          html += '<p class="muted" style="margin-top: 6px; font-style: italic;">' + lock.financialImpact + '</p>' +
          '</div>';
        }
      }

      html += '</div>';

      // ALL Belief-Behavior Gaps (full table)
      html += '<div class="card">' +
        '<h2>Belief-Behavior Gaps (' + bbGaps.length + ' detected)</h2>';

      if (bbGaps.length === 0) {
        html += '<p class="muted">No belief-behavior gaps detected. This may mean aspect-level data is not available for this student, or their beliefs and behaviors are aligned.</p>';
      } else {
        html += '<table>' +
          '<tr><th>Subdomain</th><th>Tool</th><th>Belief</th><th>Behavior</th><th>Gap</th><th>Direction</th></tr>';

        for (var g = 0; g < bbGaps.length; g++) {
          var gap = bbGaps[g];
          html += '<tr>' +
            '<td>"' + gap.label + '"</td>' +
            '<td>' + gap.tool + '</td>' +
            '<td>' + gap.beliefScore + '</td>' +
            '<td>' + gap.behaviorScore + '</td>' +
            '<td style="color: #f59e0b; font-weight: 600;">' + gap.gap + '</td>' +
            '<td>' + gap.direction + '</td>' +
          '</tr>';
        }

        html += '</table>';
      }

      html += '</div>';

      // No back button needed — coach view renders in admin modal with its own close button

      html += '</div></body></html>';
      return html;

    } catch (error) {
      Logger.log('[CoachIntegration] Error: ' + error);
      return '<html><body style="background:#1e192b;color:#fff;font-family:sans-serif;padding:40px;">' +
        '<h1>Error</h1><p>' + error.message + '</p>' +
      '</body></html>';
    }
  },

  // ============================================================
  // INTEGRATION ENGINES (Section 3 Data Detection)
  // ============================================================

  /**
   * Phase 1: Detect the student's integration profile based on Tool 1 winner
   * and corresponding grounding tool subdomain scores.
   *
   * @param {Object} summary - from getStudentSummary()
   * @returns {Object|null} - { key, name, icon, description, financialSignature, confidence, sources }
   */
  _detectProfile(summary) {
    var tool1 = summary.tools.tool1;
    if (!tool1 || tool1.status !== 'completed' || !tool1.data) return null;

    var winner = tool1.data.winner;
    if (!winner) return null;

    // Check each profile trigger condition against Tool 1 winner
    var profileKeys = ['guardian', 'provider', 'achiever', 'protector', 'connector'];

    for (var i = 0; i < profileKeys.length; i++) {
      var key = profileKeys[i];
      var profile = this.INTEGRATION_PROFILES[key];
      var triggers = profile.triggers;

      // Does Tool 1 winner match this profile?
      if (triggers.tool1Winner !== winner) continue;

      // Winner matches — check if grounding tool has data
      var groundingTool = summary.tools[triggers.groundingKey];
      if (!groundingTool || groundingTool.status !== 'completed' || !groundingTool.data) {
        // Winner matches but grounding tool not completed — partial confidence
        return {
          key: key,
          name: profile.name,
          icon: profile.icon,
          description: profile.description,
          financialSignature: profile.financialSignature,
          confidence: 'partial',
          sources: ['Tool 1: ' + this.STRATEGY_LABELS[winner]]
        };
      }

      // Grounding tool completed — check subdomain score against threshold
      var scoring = groundingTool.data.scoring;
      var subdomainQuotients = scoring && scoring.subdomainQuotients;
      var subdomainScore = subdomainQuotients ? subdomainQuotients[triggers.subdomainKey] : null;

      if (subdomainScore !== null && subdomainScore !== undefined && subdomainScore >= triggers.threshold) {
        // Full match — high confidence
        var groundingName = this.TOOL_META[triggers.groundingKey].shortName;
        var subdomainLabel = this.GROUNDING_CONFIG[triggers.groundingKey].subdomains[triggers.subdomainKey];

        return {
          key: key,
          name: profile.name,
          icon: profile.icon,
          description: profile.description,
          financialSignature: profile.financialSignature,
          confidence: 'high',
          sources: [
            'Tool 1: ' + this.STRATEGY_LABELS[winner],
            groundingName + ': "' + subdomainLabel + '" (' + Math.round(subdomainScore) + '/100)'
          ]
        };
      }

      // Winner matches, grounding completed, but subdomain below threshold — partial
      return {
        key: key,
        name: profile.name,
        icon: profile.icon,
        description: profile.description,
        financialSignature: profile.financialSignature,
        confidence: 'partial',
        sources: ['Tool 1: ' + this.STRATEGY_LABELS[winner]]
      };
    }

    // No specific profile matched — ExVal winner or unmatched pattern
    var seekerProfile = this.INTEGRATION_PROFILES.seeker;
    return {
      key: 'seeker',
      name: seekerProfile.name,
      icon: seekerProfile.icon,
      description: seekerProfile.description,
      financialSignature: seekerProfile.financialSignature,
      confidence: 'default',
      sources: ['Tool 1: ' + this.STRATEGY_LABELS[winner] + ' (no specific profile match)']
    };
  },

  // --- Phase 2 Helper Functions ---

  /**
   * Calculate average stress score across all Tool 2 financial domains.
   * @param {Object|null} tool2Data - the tool2.data object from summary
   * @returns {number|null} - average stress value, or null if no data
   */
  _calculateAverageStress(tool2Data) {
    if (!tool2Data || !tool2Data.results || !tool2Data.results.benchmarks) return null;

    var benchmarks = tool2Data.results.benchmarks;
    var domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
    var total = 0;
    var count = 0;

    for (var i = 0; i < domains.length; i++) {
      var domain = benchmarks[domains[i]];
      if (domain && domain.stress !== undefined && domain.stress !== null) {
        total += domain.stress;
        count++;
      }
    }

    return count > 0 ? total / count : null;
  },

  /**
   * Safely retrieve a subdomain quotient score from the summary.
   * @param {Object} summary - from getStudentSummary()
   * @param {string} toolKey - 'tool3', 'tool5', or 'tool7'
   * @param {string} subdomainKey - e.g., 'subdomain_1_3'
   * @returns {number|null} - quotient score (0-100), or null if unavailable
   */
  _getSubdomainScore(summary, toolKey, subdomainKey) {
    var tool = summary.tools[toolKey];
    if (!tool || tool.status !== 'completed' || !tool.data) return null;
    var scoring = tool.data.scoring;
    if (!scoring || !scoring.subdomainQuotients) return null;
    var score = scoring.subdomainQuotients[subdomainKey];
    return (score !== undefined && score !== null) ? score : null;
  },

  /**
   * Safely retrieve overall grounding quotient for a tool.
   * @param {Object} summary - from getStudentSummary()
   * @param {string} toolKey - 'tool3', 'tool5', or 'tool7'
   * @returns {number|null} - overall quotient (0-100), or null if unavailable
   */
  _getOverallQuotient(summary, toolKey) {
    var tool = summary.tools[toolKey];
    if (!tool || tool.status !== 'completed' || !tool.data) return null;
    var scoring = tool.data.scoring;
    if (!scoring || scoring.overallQuotient === undefined) return null;
    return scoring.overallQuotient;
  },

  /**
   * Phase 2: Generate prioritized warnings based on cross-tool patterns.
   * Analyzes psychological-financial connections and returns sorted warning array.
   *
   * @param {Object} summary - from getStudentSummary()
   * @returns {Array} - warning objects sorted by priority (CRITICAL first)
   */
  _generateWarnings(summary) {
    var warnings = [];

    // --- CRITICAL: Awareness Gap ---
    // High psych scores + low financial stress = denial
    var groundingTools = ['tool3', 'tool5', 'tool7'];
    var highestGrounding = 0;
    for (var g = 0; g < groundingTools.length; g++) {
      var oq = this._getOverallQuotient(summary, groundingTools[g]);
      if (oq !== null && oq > highestGrounding) highestGrounding = oq;
    }

    var tool2Data = (summary.tools.tool2 && summary.tools.tool2.status === 'completed') ? summary.tools.tool2.data : null;
    var avgStress = this._calculateAverageStress(tool2Data);

    if (highestGrounding >= 50 && avgStress !== null && avgStress < 0) {
      warnings.push({
        type: 'AWARENESS_GAP',
        priority: 'CRITICAL',
        priorityOrder: 0,
        message: 'Your psychological scores are elevated but you report low financial stress. This gap usually means you are not seeing the financial risks that are building. The patterns that feel normal to you are the ones doing the most damage.',
        sources: [
          'Grounding Scores (highest: ' + Math.round(highestGrounding) + '/100)',
          'Financial Stress (avg: ' + avgStress.toFixed(1) + ')'
        ]
      });
    }

    // --- HIGH: Single-Variable Triggers ---

    // CONTROL_DENIAL — Tool 7, subdomain_1_3 ("Only I Can Do It Right") >= 60
    var controlDenialScore = this._getSubdomainScore(summary, 'tool7', 'subdomain_1_3');
    if (controlDenialScore !== null && controlDenialScore >= 60) {
      warnings.push({
        type: 'CONTROL_DENIAL',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your "Only I Can Do It Right" score is elevated. This pattern typically causes you to underreport financial stress across all domains because you believe you have everything handled.',
        score: Math.round(controlDenialScore),
        sources: ['Tool 7: "Only I Can Do It Right" (' + Math.round(controlDenialScore) + '/100)']
      });
    }

    // SABOTAGE_RISK — Tool 7, subdomain_2_2 ("I Sabotage Success") >= 60
    var sabotageScore = this._getSubdomainScore(summary, 'tool7', 'subdomain_2_2');
    if (sabotageScore !== null && sabotageScore >= 60) {
      warnings.push({
        type: 'SABOTAGE_RISK',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your self-sabotage score is elevated. This pattern typically shows up as undermining your own growth and protection — you set things up and then find ways to tear them down.',
        score: Math.round(sabotageScore),
        sources: ['Tool 7: "I Sabotage Success" (' + Math.round(sabotageScore) + '/100)']
      });
    }

    // CODEPENDENT_SPENDING — Tool 5, subdomain_1_1 ("I Must Give to Be Loved") >= 60
    var codependentScore = this._getSubdomainScore(summary, 'tool5', 'subdomain_1_1');
    if (codependentScore !== null && codependentScore >= 60) {
      warnings.push({
        type: 'CODEPENDENT_SPENDING',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your tendency to take on the financial responsibilities of others is probably driving the essentials overspending you are seeing right now. Your budget serves everyone before it serves you.',
        score: Math.round(codependentScore),
        sources: ['Tool 5: "I Must Give to Be Loved" (' + Math.round(codependentScore) + '/100)']
      });
    }

    // --- HIGH: Compound Patterns (require Tool 1 data) ---
    var tool1 = summary.tools.tool1;
    if (tool1 && tool1.status === 'completed' && tool1.data && tool1.data.scores) {
      var scores = tool1.data.scores;

      // ISOLATED_CONTROLLER — Control > 10 + Tool 7 subdomain_1_3 >= 50
      var t7sub13 = this._getSubdomainScore(summary, 'tool7', 'subdomain_1_3');
      if (scores.Control > 10 && t7sub13 !== null && t7sub13 >= 50) {
        warnings.push({
          type: 'ISOLATED_CONTROLLER',
          priority: 'HIGH',
          priorityOrder: 1,
          message: 'Your control pattern combined with your self-reliance score tells a clear story: you are trying to handle everything alone. Your low obligation numbers look like independence, but they are actually isolation.',
          sources: [
            'Tool 1: Control (' + Math.round(scores.Control) + ')',
            'Security: "Only I Can Do It Right" (' + Math.round(t7sub13) + '/100)'
          ]
        });
      }

      // SHAME_STAGNATION — FSV > 10 + Tool 3 subdomain_1_1 ("I am Not Worthy") >= 50
      var t3sub11 = this._getSubdomainScore(summary, 'tool3', 'subdomain_1_1');
      if (scores.FSV > 10 && t3sub11 !== null && t3sub11 >= 50) {
        warnings.push({
          type: 'SHAME_STAGNATION',
          priority: 'HIGH',
          priorityOrder: 1,
          message: 'Your shame pattern and your unworthiness score are reinforcing each other. This is likely why your growth allocation stays low — part of you does not believe you deserve to build wealth.',
          sources: [
            'Tool 1: False Self-View (' + Math.round(scores.FSV) + ')',
            'Identity: "I am Not Worthy of Financial Freedom" (' + Math.round(t3sub11) + '/100)'
          ]
        });
      }

      // CARETAKER_DRAIN — Showing > 10 + Tool 5 subdomain_1_1 ("I Must Give to Be Loved") >= 50
      var t5sub11 = this._getSubdomainScore(summary, 'tool5', 'subdomain_1_1');
      if (scores.Showing > 10 && t5sub11 !== null && t5sub11 >= 50) {
        warnings.push({
          type: 'CARETAKER_DRAIN',
          priority: 'HIGH',
          priorityOrder: 1,
          message: 'Your caretaking pattern is being amplified by your codependency beliefs. This combination typically creates chronic financial overextension — you cannot stop giving even when your own accounts are suffering.',
          sources: [
            'Tool 1: Issues Showing Love (' + Math.round(scores.Showing) + ')',
            'Love: "I Must Give to Be Loved" (' + Math.round(t5sub11) + '/100)'
          ]
        });
      }

      // SELF_DESTRUCT — Fear > 10 + Tool 7 subdomain_2_2 ("I Sabotage Success") >= 50
      var t7sub22 = this._getSubdomainScore(summary, 'tool7', 'subdomain_2_2');
      if (scores.Fear > 10 && t7sub22 !== null && t7sub22 >= 50) {
        warnings.push({
          type: 'SELF_DESTRUCT',
          priority: 'HIGH',
          priorityOrder: 1,
          message: 'Your fear and self-sabotage scores are both elevated. This combination is particularly damaging — the fear creates urgency but the sabotage undermines every protective action you try to take.',
          sources: [
            'Tool 1: Fear (' + Math.round(scores.Fear) + ')',
            'Security: "I Sabotage Success" (' + Math.round(t7sub22) + '/100)'
          ]
        });
      }
    }

    // --- MEDIUM: Secondary Pattern Indicators ---

    // REALITY_AVOIDANCE — Tool 3, subdomain_1_3 >= 60
    var realityScore = this._getSubdomainScore(summary, 'tool3', 'subdomain_1_3');
    if (realityScore !== null && realityScore >= 60) {
      warnings.push({
        type: 'REALITY_AVOIDANCE',
        priority: 'MEDIUM',
        priorityOrder: 2,
        message: 'Your financial reality avoidance is active. This creates a scarcity mindset regardless of how much money you actually have.',
        score: Math.round(realityScore),
        sources: ['Tool 3: "I Cannot See My Financial Reality" (' + Math.round(realityScore) + '/100)']
      });
    }

    // PROTECTION_GAP — Tool 7, subdomain_2_1 >= 60
    var protectionScore = this._getSubdomainScore(summary, 'tool7', 'subdomain_2_1');
    if (protectionScore !== null && protectionScore >= 60) {
      warnings.push({
        type: 'PROTECTION_GAP',
        priority: 'MEDIUM',
        priorityOrder: 2,
        message: 'Your self-protection belief is low. This shows up directly in your protection domain being underserved — you do not protect yourself because you do not believe you are worth protecting.',
        score: Math.round(protectionScore),
        sources: ['Tool 7: "I Do Not Protect Myself" (' + Math.round(protectionScore) + '/100)']
      });
    }

    // OBLIGATION_OVERSPEND — Tool 5, subdomain_2_2 >= 50
    var obligationScore = this._getSubdomainScore(summary, 'tool5', 'subdomain_2_2');
    if (obligationScore !== null && obligationScore >= 50) {
      warnings.push({
        type: 'OBLIGATION_OVERSPEND',
        priority: 'MEDIUM',
        priorityOrder: 2,
        message: 'Your sense of owing others is elevated. What shows up in your budget as essentials likely includes perceived debts to other people.',
        score: Math.round(obligationScore),
        sources: ['Tool 5: "I Owe Them Everything" (' + Math.round(obligationScore) + '/100)']
      });
    }

    // JUDGMENT_SCARCITY — Tool 3, subdomain_2_2 >= 50
    var judgmentScore = this._getSubdomainScore(summary, 'tool3', 'subdomain_2_2');
    if (judgmentScore !== null && judgmentScore >= 50) {
      warnings.push({
        type: 'JUDGMENT_SCARCITY',
        priority: 'MEDIUM',
        priorityOrder: 2,
        message: 'Fear of judgment is active. This tends to create a scarcity mindset that suppresses confidence across all your financial domains.',
        score: Math.round(judgmentScore),
        sources: ['Tool 3: "What Will They Think?" (' + Math.round(judgmentScore) + '/100)']
      });
    }

    // GROWTH_PARALYSIS — Tool 7, subdomain_1_2 >= 50
    var growthScore = this._getSubdomainScore(summary, 'tool7', 'subdomain_1_2');
    if (growthScore !== null && growthScore >= 50) {
      warnings.push({
        type: 'GROWTH_PARALYSIS',
        priority: 'MEDIUM',
        priorityOrder: 2,
        message: 'Your money freezing belief is active. You may allocate money to growth on paper, but when it comes time to actually invest, you freeze.',
        score: Math.round(growthScore),
        sources: ['Tool 7: "I Have Money But Will Not Use It" (' + Math.round(growthScore) + '/100)']
      });
    }

    // Sort by priority order (CRITICAL=0, HIGH=1, MEDIUM=2)
    warnings.sort(function(a, b) {
      return a.priorityOrder - b.priorityOrder;
    });

    return warnings;
  },

  // --- Phase 3: Awareness Gap, Belief Locks, Belief-Behavior Gaps ---

  /**
   * Phase 3: Quantify the disconnect between psychological scores and
   * reported financial stress. High psych + low stress = denial.
   *
   * @param {Object} summary - from getStudentSummary()
   * @returns {Object|null} - { gapScore, psychScore, stressScore, rawStress, severity, groundingToolsUsed }
   */
  _calculateAwarenessGap(summary) {
    // Need Tool 2 for stress data
    var tool2 = summary.tools.tool2;
    if (!tool2 || tool2.status !== 'completed' || !tool2.data) return null;

    // Calculate average psychological score from grounding tools
    var groundingTools = ['tool3', 'tool5', 'tool7'];
    var totalQuotient = 0;
    var quotientCount = 0;

    for (var i = 0; i < groundingTools.length; i++) {
      var oq = this._getOverallQuotient(summary, groundingTools[i]);
      if (oq !== null) {
        totalQuotient += oq;
        quotientCount++;
      }
    }

    if (quotientCount === 0) return null;

    var avgPsychScore = totalQuotient / quotientCount;

    // Calculate normalized stress score from Tool 2
    var avgStress = this._calculateAverageStress(tool2.data);
    if (avgStress === null) return null;

    // Normalize stress from roughly -10..+10 range to 0-100 scale
    var normalizedStress = Math.max(0, Math.min(100, (avgStress + 10) * 5));

    // Gap = psychological score minus stress awareness
    var gapScore = avgPsychScore - normalizedStress;

    // Classify severity
    var severity;
    if (gapScore > 30) {
      severity = 'critical';
    } else if (gapScore > 15) {
      severity = 'elevated';
    } else {
      severity = 'normal';
    }

    return {
      gapScore: Math.round(gapScore),
      psychScore: Math.round(avgPsychScore),
      stressScore: Math.round(normalizedStress),
      rawStress: avgStress,
      severity: severity,
      groundingToolsUsed: quotientCount
    };
  },

  /**
   * Phase 3: Detect interlocking beliefs across tools that reinforce each other.
   * Six known lock patterns based on cross-tool correlation analysis.
   *
   * @param {Object} summary - from getStudentSummary()
   * @returns {Array} - lock objects sorted by strength (strong first)
   */
  _detectBeliefLocks(summary) {
    var self = this;

    // Define the 6 known lock patterns
    var lockPatterns = [
      {
        name: 'Scarcity + Shame Lock',
        beliefs: [
          { toolKey: 'tool3', subdomainKey: 'subdomain_1_1', threshold: 50 },
          { toolKey: 'tool3', subdomainKey: 'subdomain_1_2', threshold: 50 },
          { toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50 }
        ],
        financialImpact: 'Suppresses growth allocation and prevents wealth building despite affordability. Shame says you do not deserve it, scarcity says there is never enough, sabotage ensures the pattern continues.'
      },
      {
        name: 'Caretaker Trap Lock',
        beliefs: [
          { toolKey: 'tool5', subdomainKey: 'subdomain_1_1', threshold: 50 },
          { toolKey: 'tool5', subdomainKey: 'subdomain_1_2', threshold: 50 },
          { toolKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 50 }
        ],
        financialImpact: 'Inflated essentials budget driven by obligation to others, underfunded freedom and growth categories. Love equals giving, others come first, perpetual obligation.'
      },
      {
        name: 'Control + Isolation Lock',
        beliefs: [
          { toolKey: 'tool7', subdomainKey: 'subdomain_1_1', threshold: 50 },
          { toolKey: 'tool7', subdomainKey: 'subdomain_1_3', threshold: 50 },
          { toolKey: 'tool3', subdomainKey: 'subdomain_1_3', threshold: 50 }
        ],
        financialImpact: 'Financial blindness through isolation and perfectionism. Undercharging erodes income, refusing help creates isolation, and reality avoidance prevents seeing the damage.'
      },
      {
        name: 'Fear + Paralysis Lock',
        beliefs: [
          { toolKey: 'tool7', subdomainKey: 'subdomain_2_1', threshold: 50 },
          { toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50 },
          { toolKey: 'tool7', subdomainKey: 'subdomain_1_2', threshold: 50 }
        ],
        financialImpact: 'Complete financial paralysis. Cannot protect, actively sabotages, and freezes when money is available. Fear feeds sabotage feeds inaction in a self-reinforcing cycle.'
      },
      {
        name: 'Validation + Spending Lock',
        beliefs: [
          { toolKey: 'tool3', subdomainKey: 'subdomain_2_1', threshold: 50 },
          { toolKey: 'tool3', subdomainKey: 'subdomain_2_3', threshold: 50 },
          { toolKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 45 }
        ],
        financialImpact: 'Spending as proof of worth. Money becomes the primary tool for proving value to others, and savings feel like failure. Self-worth is externally validated through financial displays.'
      },
      {
        name: 'Identity + Sabotage Pipeline',
        beliefs: [
          { toolKey: 'tool3', subdomainKey: 'subdomain_1_1', threshold: 50 },
          { toolKey: 'tool3', subdomainKey: 'subdomain_1_3', threshold: 50 },
          { toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50 },
          { toolKey: 'tool7', subdomainKey: 'subdomain_2_1', threshold: 50 }
        ],
        financialImpact: 'Full pipeline from identity to sabotage. Unworthiness creates blindness, blindness enables sabotage, and lack of self-protection removes the safety net. The most comprehensive lock pattern.'
      }
    ];

    var locks = [];

    for (var p = 0; p < lockPatterns.length; p++) {
      var pattern = lockPatterns[p];
      var allMet = true;
      var totalScore = 0;
      var beliefDetails = [];

      for (var b = 0; b < pattern.beliefs.length; b++) {
        var belief = pattern.beliefs[b];
        var score = self._getSubdomainScore(summary, belief.toolKey, belief.subdomainKey);

        if (score === null || score < belief.threshold) {
          allMet = false;
          break;
        }

        totalScore += score;
        var toolShortName = self.TOOL_META[belief.toolKey].shortName;
        var subdomainLabel = self.GROUNDING_CONFIG[belief.toolKey].subdomains[belief.subdomainKey];

        beliefDetails.push({
          label: subdomainLabel,
          score: Math.round(score),
          tool: toolShortName
        });
      }

      if (allMet) {
        var avgScore = totalScore / pattern.beliefs.length;
        var strength;
        if (avgScore > 70) {
          strength = 'strong';
        } else if (avgScore < 55) {
          strength = 'emerging';
        } else {
          strength = 'moderate';
        }

        locks.push({
          name: pattern.name,
          beliefs: beliefDetails,
          financialImpact: pattern.financialImpact,
          strength: strength,
          avgScore: Math.round(avgScore),
          beliefCount: pattern.beliefs.length
        });
      }
    }

    // Sort by strength order (strong first), then by avgScore descending
    var strengthOrder = { strong: 0, moderate: 1, emerging: 2 };
    locks.sort(function(a, b) {
      var strengthDiff = strengthOrder[a.strength] - strengthOrder[b.strength];
      if (strengthDiff !== 0) return strengthDiff;
      return b.avgScore - a.avgScore;
    });

    return locks;
  },

  /**
   * Phase 3: Detect gaps between stated beliefs and actual behaviors within
   * grounding tool subdomains. Each subdomain has 4 aspects: belief, behavior,
   * feeling, consequence. Gaps > 2.0 indicate internal conflict or autopilot.
   *
   * @param {Object} summary - from getStudentSummary()
   * @returns {Array} - gap objects sorted by magnitude (largest first)
   */
  _detectBeliefBehaviorGaps(summary) {
    var gaps = [];
    var groundingTools = ['tool3', 'tool5', 'tool7'];

    for (var t = 0; t < groundingTools.length; t++) {
      var toolKey = groundingTools[t];
      var tool = summary.tools[toolKey];
      if (!tool || tool.status !== 'completed' || !tool.data) continue;

      var config = this.GROUNDING_CONFIG[toolKey];
      var subdomainKeys = Object.keys(config.subdomains);

      for (var s = 0; s < subdomainKeys.length; s++) {
        var sdKey = subdomainKeys[s];
        var beliefScore = null;
        var behaviorScore = null;

        // Method 1: Direct aspectScores object
        // GroundingScoring stores nested: aspectScores[sdKey] = { belief, behavior, feeling, consequence }
        var aspectScores = tool.data.scoring && tool.data.scoring.aspectScores;
        if (aspectScores && aspectScores[sdKey]) {
          var sdAspects = aspectScores[sdKey];

          if (sdAspects.belief !== undefined && sdAspects.belief !== null) {
            beliefScore = sdAspects.belief;
          }

          // Average the action aspects (behavior, feeling, consequence)
          var actionScores = [];
          if (sdAspects.behavior !== undefined && sdAspects.behavior !== null) actionScores.push(sdAspects.behavior);
          if (sdAspects.feeling !== undefined && sdAspects.feeling !== null) actionScores.push(sdAspects.feeling);
          if (sdAspects.consequence !== undefined && sdAspects.consequence !== null) actionScores.push(sdAspects.consequence);

          if (actionScores.length > 0) {
            var actionTotal = 0;
            for (var a = 0; a < actionScores.length; a++) actionTotal += actionScores[a];
            behaviorScore = actionTotal / actionScores.length;
          }
        }

        // Method 2: Question-level data array (fallback)
        if (beliefScore === null && tool.data.formData && tool.data.formData.questions) {
          var questions = tool.data.formData.questions;
          var subdomainQs = [];
          for (var q = 0; q < questions.length; q++) {
            if (questions[q].subdomain === sdKey) {
              subdomainQs.push(questions[q]);
            }
          }

          if (subdomainQs.length >= 4) {
            var actionQScores = [];
            for (var sq = 0; sq < subdomainQs.length; sq++) {
              if (subdomainQs[sq].aspect === 'belief') {
                beliefScore = subdomainQs[sq].score;
              } else {
                if (subdomainQs[sq].score !== undefined && subdomainQs[sq].score !== null) {
                  actionQScores.push(subdomainQs[sq].score);
                }
              }
            }

            if (actionQScores.length > 0) {
              var aqTotal = 0;
              for (var aq = 0; aq < actionQScores.length; aq++) aqTotal += actionQScores[aq];
              behaviorScore = aqTotal / actionQScores.length;
            }
          }
        }

        // Calculate gap if both scores available
        if (beliefScore !== null && behaviorScore !== null) {
          var rawGap = beliefScore - behaviorScore;
          var absGap = Math.abs(rawGap);

          if (absGap > 2.0) {
            var direction, interpretation;
            if (rawGap > 0) {
              direction = 'Belief exceeds action';
              interpretation = 'You believe this strongly but your behavior does not fully reflect it. This suggests internal conflict — part of you resists what another part believes.';
            } else {
              direction = 'Action exceeds belief';
              interpretation = 'You act on this more than you consciously believe it. This pattern often runs on autopilot without your awareness.';
            }

            gaps.push({
              subdomain: sdKey,
              tool: this.TOOL_META[toolKey].shortName,
              toolKey: toolKey,
              label: config.subdomains[sdKey],
              beliefScore: Math.round(beliefScore * 10) / 10,
              behaviorScore: Math.round(behaviorScore * 10) / 10,
              gap: Math.round(absGap * 10) / 10,
              direction: direction,
              interpretation: interpretation
            });
          }
        }
      }
    }

    // Sort by gap magnitude (largest first)
    gaps.sort(function(a, b) {
      return b.gap - a.gap;
    });

    return gaps;
  },

  /**
   * Phase 6: Detect whether a psychological pipeline is active for this student.
   *
   * Pipeline A: Identity (T3) to Sabotage (T7) — FSV/ExVal beliefs feed into control/fear behaviors
   * Pipeline B: Identity (T3) to Caretaking (T5) — FSV/ExVal beliefs feed into showing/receiving behaviors
   *
   * @param {Object} summary
   * @param {string} pipeline - 'A' or 'B'
   * @returns {Object|null} - { strength, description } or null if not active
   */
  _detectPipeline(summary, pipeline) {
    var t3Overall = this._getOverallQuotient(summary, 'tool3');
    if (t3Overall === null) return null;

    if (pipeline === 'A') {
      var t7Overall = this._getOverallQuotient(summary, 'tool7');
      if (t7Overall === null) return null;

      if (t3Overall < 40 && t7Overall < 40) return null;

      var avgScore = (t3Overall + t7Overall) / 2;
      var strength = 'emerging';
      if (avgScore > 65) strength = 'strong';
      else if (avgScore > 50) strength = 'moderate';

      return {
        strength: strength,
        t3Score: Math.round(t3Overall),
        t7Score: Math.round(t7Overall),
        description: 'Identity beliefs (T3: ' + Math.round(t3Overall) + '/100) are feeding into security and control patterns (T7: ' + Math.round(t7Overall) + '/100). This student may be using control and fear-based behaviors as a response to identity-level wounds.'
      };
    }

    if (pipeline === 'B') {
      var t5Overall = this._getOverallQuotient(summary, 'tool5');
      if (t5Overall === null) return null;

      if (t3Overall < 40 && t5Overall < 40) return null;

      var avgScoreB = (t3Overall + t5Overall) / 2;
      var strengthB = 'emerging';
      if (avgScoreB > 65) strengthB = 'strong';
      else if (avgScoreB > 50) strengthB = 'moderate';

      return {
        strength: strengthB,
        t3Score: Math.round(t3Overall),
        t5Score: Math.round(t5Overall),
        description: 'Identity beliefs (T3: ' + Math.round(t3Overall) + '/100) are feeding into love and connection patterns (T5: ' + Math.round(t5Overall) + '/100). This student may be using caretaking and codependent behaviors as a response to identity-level wounds.'
      };
    }

    return null;
  },

  // ============================================================
  // TOOL 1 CARD: Trauma Strategy Overview
  // ============================================================

  _renderTool1Card(toolData, clientId) {
    if (toolData.status === 'in_progress') return this._renderInProgressCard('tool1');
    if (toolData.status !== 'completed' || !toolData.data) return this._renderLockedCard('tool1');

    const data = toolData.data;
    const winner = data.winner || 'Unknown';
    const scores = data.scores || {};
    const strategies = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];

    let scoreBars = '';
    for (var i = 0; i < strategies.length; i++) {
      var key = strategies[i];
      var score = scores[key] || 0;
      var isWinner = (key === winner);
      var label = this.STRATEGY_LABELS[key] || key;

      // Normalize -25..+25 to position on bar
      var pct = Math.abs(score) / 25 * 50;
      var barStyle = '';
      var barColor = '';
      if (score >= 0) {
        barStyle = 'left: 50%; width: ' + pct + '%;';
        barColor = 'background: var(--ok);';
      } else {
        var leftPos = 50 - pct;
        barStyle = 'left: ' + leftPos + '%; width: ' + pct + '%;';
        barColor = 'background: var(--bad);';
      }
      if (isWinner) {
        barColor = 'background: var(--gold);';
      }

      scoreBars += `
        <div class="cr-score-row ${isWinner ? 'cr-winner-row' : ''}">
          <div class="cr-score-label">${label}</div>
          <div class="cr-bipolar-bar">
            <div class="cr-bipolar-center"></div>
            <div class="cr-bipolar-fill" style="${barStyle} ${barColor}"></div>
          </div>
          <div class="cr-score-value">${score > 0 ? '+' : ''}${score}</div>
        </div>
      `;
    }

    return `
      <div class="cr-tool-card cr-completed">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${this.TOOL_META.tool1.icon}</span>
            <span class="cr-card-title">Tool 1: ${this.TOOL_META.tool1.shortName}</span>
          </div>
          <button class="cr-report-link" onclick="viewToolReport('tool1')">View Full Report</button>
        </div>
        <div class="cr-winner-badge">
          Dominant Strategy: <strong>${this.STRATEGY_LABELS[winner] || winner}</strong>
        </div>
        <div class="cr-score-bars">
          ${scoreBars}
        </div>
      </div>
    `;
  },

  // ============================================================
  // GROUNDING CARDS: Tools 3, 5, 7 (shared renderer)
  // ============================================================

  _renderGroundingCard(toolId, toolData, clientId) {
    if (toolData.status === 'in_progress') return this._renderInProgressCard(toolId);
    if (toolData.status !== 'completed' || !toolData.data) return this._renderLockedCard(toolId);

    const data = toolData.data;
    const scoring = data.scoring || {};
    const config = this.GROUNDING_CONFIG[toolId];
    const meta = this.TOOL_META[toolId];
    const toolNum = toolId.replace('tool', '');

    var overall = scoring.overallQuotient || 0;
    var d1 = (scoring.domainQuotients && scoring.domainQuotients.domain1) || 0;
    var d2 = (scoring.domainQuotients && scoring.domainQuotients.domain2) || 0;
    var subs = scoring.subdomainQuotients || {};

    // Build subdomain bars for domain 1
    var d1Subs = '';
    var d1Keys = ['subdomain_1_1', 'subdomain_1_2', 'subdomain_1_3'];
    for (var i = 0; i < d1Keys.length; i++) {
      var subKey = d1Keys[i];
      var subVal = Math.round(subs[subKey] || 0);
      var subLabel = (config && config.subdomains && config.subdomains[subKey]) || subKey;
      d1Subs += this._renderSubdomainBar(subLabel, subVal);
    }

    // Build subdomain bars for domain 2
    var d2Subs = '';
    var d2Keys = ['subdomain_2_1', 'subdomain_2_2', 'subdomain_2_3'];
    for (var j = 0; j < d2Keys.length; j++) {
      var subKey2 = d2Keys[j];
      var subVal2 = Math.round(subs[subKey2] || 0);
      var subLabel2 = (config && config.subdomains && config.subdomains[subKey2]) || subKey2;
      d2Subs += this._renderSubdomainBar(subLabel2, subVal2);
    }

    return `
      <div class="cr-tool-card cr-completed">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${meta.icon}</span>
            <span class="cr-card-title">Tool ${toolNum}: ${meta.shortName}</span>
          </div>
          <button class="cr-report-link" onclick="viewToolReport('${toolId}')">View Full Report</button>
        </div>

        <!-- Overall Quotient -->
        <div class="cr-quotient-display">
          <span class="cr-big-number" style="color: ${this._quotientColor(overall)};">${Math.round(overall)}</span>
          <span class="cr-big-suffix">/100</span>
          <span class="muted" style="margin-left: 8px; font-size: 0.85rem;">Overall Quotient</span>
        </div>

        <!-- Domain 1 -->
        <div class="cr-domain-section">
          <div class="cr-domain-header">
            <span class="cr-domain-name">${config ? config.domain1Name : 'Domain 1'}</span>
            <span class="cr-domain-score" style="color: ${this._quotientColor(d1)};">${Math.round(d1)}</span>
          </div>
          ${d1Subs}
        </div>

        <!-- Domain 2 -->
        <div class="cr-domain-section">
          <div class="cr-domain-header">
            <span class="cr-domain-name">${config ? config.domain2Name : 'Domain 2'}</span>
            <span class="cr-domain-score" style="color: ${this._quotientColor(d2)};">${Math.round(d2)}</span>
          </div>
          ${d2Subs}
        </div>
      </div>
    `;
  },

  _renderSubdomainBar(label, value) {
    var color = this._quotientColor(value);
    return `
      <div class="cr-subdomain-row">
        <div class="cr-subdomain-label">${label}</div>
        <div class="cr-subdomain-bar-track">
          <div class="cr-subdomain-bar-fill" style="width: ${value}%; background: ${color};"></div>
        </div>
        <div class="cr-subdomain-value" style="color: ${color};">${value}</div>
      </div>
    `;
  },

  _quotientColor(value) {
    if (value >= 70) return '#10b981';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  },

  // ============================================================
  // TOOL 2 CARD: Financial Clarity
  // ============================================================

  _renderTool2Card(toolData, clientId) {
    if (toolData.status === 'in_progress') return this._renderInProgressCard('tool2');
    if (toolData.status !== 'completed' || !toolData.data) return this._renderLockedCard('tool2');

    const data = toolData.data;
    const results = data.results || {};
    const benchmarks = results.benchmarks || {};
    const archetype = results.archetype || 'Not determined';
    const priorityList = results.priorityList || [];
    const topPriority = priorityList.length > 0 ? priorityList[0].domain : null;

    const domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
    var domainBars = '';
    for (var i = 0; i < domains.length; i++) {
      var domain = domains[i];
      var bench = benchmarks[domain] || {};
      var pct = bench.percentage || 0;
      var level = bench.level || 'Low';
      var color = level === 'High' ? '#10b981' : (level === 'Medium' ? '#f59e0b' : '#ef4444');
      var isTop = (domain === topPriority);
      var label = this.DOMAIN_LABELS[domain] || domain;

      domainBars += `
        <div class="cr-domain-bar-row ${isTop ? 'cr-priority-highlight' : ''}">
          <div class="cr-domain-bar-label">
            ${label}
            ${isTop ? '<span class="cr-priority-tag">Top Priority</span>' : ''}
          </div>
          <div class="cr-domain-bar-track">
            <div class="cr-domain-bar-fill" style="width: ${pct}%; background: ${color};"></div>
          </div>
          <div class="cr-domain-bar-value">${Math.round(pct)}%</div>
        </div>
      `;
    }

    return `
      <div class="cr-tool-card cr-completed">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${this.TOOL_META.tool2.icon}</span>
            <span class="cr-card-title">Tool 2: ${this.TOOL_META.tool2.shortName}</span>
          </div>
          <button class="cr-report-link" onclick="viewToolReport('tool2')">View Full Report</button>
        </div>
        <div class="cr-archetype-badge">${archetype}</div>
        <div class="cr-domain-bars" style="margin-top: 12px;">
          ${domainBars}
        </div>
      </div>
    `;
  },

  // ============================================================
  // TOOL 4 CARD: Budget Framework
  // ============================================================

  _renderTool4Card(toolData, clientId) {
    if (toolData.status === 'in_progress') return this._renderInProgressCard('tool4');
    if (toolData.status !== 'completed' || !toolData.data) return this._renderLockedCard('tool4');

    const data = toolData.data;
    var multiply = data.multiply || 0;
    var essentials = data.essentials || 0;
    var freedom = data.freedom || 0;
    var enjoyment = data.enjoyment || 0;
    var income = data.monthlyIncome || 0;
    var priority = data.priority || 'Not selected';

    // Format income
    var incomeFormatted = '$' + Number(income).toLocaleString('en-US');

    // Build stacked allocation bar segments
    var segments = [
      { label: 'M', value: multiply, color: '#188bf6' },
      { label: 'E', value: essentials, color: '#6b7280' },
      { label: 'F', value: freedom, color: '#10b981' },
      { label: 'J', value: enjoyment, color: '#ad9168' }
    ];

    var barSegments = '';
    var legendItems = '';
    var segmentLabels = { M: 'Multiply', E: 'Essentials', F: 'Freedom', J: 'Joy' };
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (seg.value > 0) {
        barSegments += '<div class="cr-alloc-segment" style="width: ' + seg.value +
          '%; background: ' + seg.color + ';">' +
          (seg.value >= 8 ? seg.value + '%' : '') + '</div>';
      }
      legendItems += '<span class="cr-legend-item">' +
        '<span class="cr-legend-dot" style="background: ' + seg.color + ';"></span>' +
        segmentLabels[seg.label] + ': ' + seg.value + '%</span>';
    }

    return `
      <div class="cr-tool-card cr-completed">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${this.TOOL_META.tool4.icon}</span>
            <span class="cr-card-title">Tool 4: ${this.TOOL_META.tool4.shortName}</span>
          </div>
          <button class="cr-report-link" onclick="viewToolReport('tool4')">Open Calculator</button>
        </div>

        <div class="cr-alloc-bar">${barSegments}</div>
        <div class="cr-legend">${legendItems}</div>

        <div class="cr-meta-row" style="margin-top: 12px;">
          <div class="cr-meta-item">
            <span class="muted">Monthly Income</span>
            <span class="cr-meta-value">${incomeFormatted}</span>
          </div>
          <div class="cr-meta-item">
            <span class="muted">Priority</span>
            <span class="cr-meta-value">${priority}</span>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================
  // TOOL 6 CARD: Retirement Blueprint
  // ============================================================

  _renderTool6Card(toolData, clientId) {
    if (toolData.status === 'in_progress') return this._renderInProgressCard('tool6');
    if (toolData.status !== 'completed' || !toolData.data) return this._renderLockedCard('tool6');

    const data = toolData.data;
    var profileId = data.profileId || 'Not determined';
    var monthlyBudget = data.monthlyBudget || 0;
    var projectedBalance = data.projectedBalance || 0;
    var investmentScore = data.investmentScore || 0;
    var taxStrategy = data.taxStrategy || 'Not set';

    var budgetFormatted = '$' + Number(monthlyBudget).toLocaleString('en-US');
    var projectedFormatted = '$' + Number(projectedBalance).toLocaleString('en-US');

    return `
      <div class="cr-tool-card cr-completed">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${this.TOOL_META.tool6.icon}</span>
            <span class="cr-card-title">Tool 6: ${this.TOOL_META.tool6.shortName}</span>
          </div>
          <button class="cr-report-link" onclick="viewToolReport('tool6')">Open Calculator</button>
        </div>

        <div class="cr-archetype-badge">${profileId}</div>

        <div class="cr-meta-row" style="margin-top: 12px;">
          <div class="cr-meta-item">
            <span class="muted">Monthly Budget</span>
            <span class="cr-meta-value">${budgetFormatted}</span>
          </div>
          <div class="cr-meta-item">
            <span class="muted">Projected Balance</span>
            <span class="cr-meta-value">${projectedFormatted}</span>
          </div>
        </div>
        <div class="cr-meta-row">
          <div class="cr-meta-item">
            <span class="muted">Investment Score</span>
            <span class="cr-meta-value">${investmentScore}/10</span>
          </div>
          <div class="cr-meta-item">
            <span class="muted">Tax Strategy</span>
            <span class="cr-meta-value">${taxStrategy}</span>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================
  // TOOL 8 CARD: Investment Planning
  // ============================================================

  _renderTool8Card(toolData, clientId) {
    if (toolData.status === 'in_progress') return this._renderInProgressCard('tool8');
    if (toolData.status !== 'completed' || !toolData.data) return this._renderLockedCard('tool8');

    const data = toolData.data;
    var mode = data.mode || 'Unknown';
    var monthlyInvestment = data.M_real || 0;
    var timeHorizon = data.T || 0;
    var risk = data.risk || 0;
    var scenarioName = data.scenarioName || 'Unnamed Scenario';

    var monthlyFormatted = '$' + Number(monthlyInvestment).toLocaleString('en-US');

    // Risk label
    var riskLabel = 'Conservative';
    if (risk >= 7) riskLabel = 'Aggressive';
    else if (risk >= 4) riskLabel = 'Moderate';

    return `
      <div class="cr-tool-card cr-completed">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${this.TOOL_META.tool8.icon}</span>
            <span class="cr-card-title">Tool 8: ${this.TOOL_META.tool8.shortName}</span>
          </div>
          <button class="cr-report-link" onclick="viewToolReport('tool8')">View Full Report</button>
        </div>

        <div class="cr-scenario-name">${scenarioName}</div>

        <div class="cr-meta-row" style="margin-top: 12px;">
          <div class="cr-meta-item">
            <span class="muted">Monthly Investment</span>
            <span class="cr-meta-value">${monthlyFormatted}</span>
          </div>
          <div class="cr-meta-item">
            <span class="muted">Time Horizon</span>
            <span class="cr-meta-value">${timeHorizon} years</span>
          </div>
        </div>
        <div class="cr-meta-row">
          <div class="cr-meta-item">
            <span class="muted">Risk Level</span>
            <span class="cr-meta-value">${riskLabel} (${risk}/10)</span>
          </div>
          <div class="cr-meta-item">
            <span class="muted">Calculation Mode</span>
            <span class="cr-meta-value">${mode}</span>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================
  // LOCKED / IN-PROGRESS PLACEHOLDER CARDS
  // ============================================================

  _renderLockedCard(toolId) {
    const meta = this.TOOL_META[toolId];
    const toolNum = toolId.replace('tool', '');
    return `
      <div class="cr-tool-card cr-locked">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon" style="opacity: 0.4;">${meta.icon}</span>
            <span class="cr-card-title" style="opacity: 0.5;">Tool ${toolNum}: ${meta.shortName}</span>
          </div>
          <span class="cr-status-badge cr-badge-locked">Not Started</span>
        </div>
        <p class="muted" style="margin: 8px 0 0; font-size: 0.85rem;">
          Complete this tool to see your results here.
        </p>
      </div>
    `;
  },

  _renderInProgressCard(toolId) {
    const meta = this.TOOL_META[toolId];
    const toolNum = toolId.replace('tool', '');
    return `
      <div class="cr-tool-card cr-in-progress">
        <div class="cr-card-header">
          <div>
            <span class="cr-card-icon">${meta.icon}</span>
            <span class="cr-card-title">Tool ${toolNum}: ${meta.shortName}</span>
          </div>
          <span class="cr-status-badge cr-badge-progress">In Progress</span>
        </div>
        <p class="muted" style="margin: 8px 0 0; font-size: 0.85rem;">
          Finish this tool to see your results here.
        </p>
      </div>
    `;
  },

  // ============================================================
  // STYLES
  // ============================================================

  _getStyles() {
    return `
      <style>
        /* Section cards */
        .cr-section-card {
          margin-bottom: 20px;
        }
        .cr-section-title {
          color: var(--gold);
          margin-bottom: 5px;
        }

        /* Progress bar + dots */
        .cr-progress-container {
          margin-top: 15px;
        }
        .cr-progress-track {
          height: 6px;
          background: rgba(173, 145, 104, 0.15);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .cr-progress-fill {
          height: 100%;
          background: var(--gold);
          border-radius: 3px;
          transition: width 0.6s ease;
        }
        .cr-progress-dots {
          display: flex;
          justify-content: space-between;
          gap: 6px;
        }
        .cr-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .dot-completed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }
        .dot-in-progress {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }
        .dot-not-started {
          background: rgba(107, 114, 128, 0.15);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.3);
        }

        /* Grid layout */
        .cr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        @media (max-width: 768px) {
          .cr-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Tool cards */
        .cr-tool-card {
          background: linear-gradient(315deg, rgba(173, 145, 104, 0.08) 0%, rgba(30, 25, 43, 0.4) 100%);
          border: 1px solid rgba(173, 145, 104, 0.2);
          border-radius: 12px;
          padding: 16px;
        }
        .cr-tool-card.cr-completed {
          border-color: rgba(76, 175, 80, 0.35);
        }
        .cr-tool-card.cr-locked {
          opacity: 0.5;
          border-color: rgba(107, 114, 128, 0.2);
        }
        .cr-tool-card.cr-in-progress {
          border-color: rgba(255, 152, 0, 0.4);
        }

        /* Card header */
        .cr-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cr-card-icon {
          margin-right: 6px;
        }
        .cr-card-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text);
        }

        /* Report link button */
        .cr-report-link {
          background: transparent;
          border: 1px solid var(--gold);
          color: var(--gold);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cr-report-link:hover {
          background: rgba(173, 145, 104, 0.15);
        }

        /* Status badges */
        .cr-status-badge {
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 500;
        }
        .cr-badge-locked {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }
        .cr-badge-progress {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        /* Tool 1: Winner badge */
        .cr-winner-badge {
          background: linear-gradient(135deg, rgba(173, 145, 104, 0.2), rgba(173, 145, 104, 0.05));
          border: 1px solid rgba(173, 145, 104, 0.3);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 0.9rem;
          color: var(--text);
          margin-bottom: 12px;
        }

        /* Tool 1: Bipolar score bars */
        .cr-score-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cr-score-row {
          display: grid;
          grid-template-columns: 140px 1fr 40px;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 480px) {
          .cr-score-row {
            grid-template-columns: 90px 1fr 35px;
          }
        }
        .cr-winner-row {
          background: rgba(173, 145, 104, 0.1);
          border-radius: 6px;
          padding: 4px 6px;
          margin: -4px -6px;
        }
        .cr-score-label {
          font-size: 0.8rem;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cr-score-value {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: right;
          color: var(--text);
        }
        .cr-bipolar-bar {
          position: relative;
          height: 8px;
          background: rgba(173, 145, 104, 0.12);
          border-radius: 4px;
        }
        .cr-bipolar-center {
          position: absolute;
          left: 50%;
          top: -2px;
          bottom: -2px;
          width: 1px;
          background: rgba(173, 145, 104, 0.4);
        }
        .cr-bipolar-fill {
          position: absolute;
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        /* Grounding tool quotient display */
        .cr-quotient-display {
          margin-bottom: 14px;
        }
        .cr-big-number {
          font-family: 'Radley', serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 1;
        }
        .cr-big-suffix {
          font-size: 16px;
          color: var(--muted);
        }

        /* Grounding domain sections */
        .cr-domain-section {
          margin-bottom: 12px;
          padding: 10px;
          background: rgba(30, 25, 43, 0.3);
          border-radius: 8px;
        }
        .cr-domain-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .cr-domain-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
        }
        .cr-domain-score {
          font-size: 1.1rem;
          font-weight: 700;
        }

        /* Subdomain bars */
        .cr-subdomain-row {
          display: grid;
          grid-template-columns: 1fr 80px 30px;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .cr-subdomain-label {
          font-size: 0.75rem;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cr-subdomain-bar-track {
          height: 5px;
          background: rgba(173, 145, 104, 0.12);
          border-radius: 3px;
          overflow: hidden;
        }
        .cr-subdomain-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        .cr-subdomain-value {
          font-size: 0.75rem;
          font-weight: 600;
          text-align: right;
        }

        /* Tool 2: Domain bars */
        .cr-archetype-badge {
          background: linear-gradient(135deg, rgba(24, 139, 246, 0.2), rgba(24, 139, 246, 0.05));
          border: 1px solid rgba(24, 139, 246, 0.3);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.9rem;
          color: var(--accent-blue);
          font-weight: 600;
          display: inline-block;
        }
        .cr-domain-bar-row {
          display: grid;
          grid-template-columns: 100px 1fr 40px;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .cr-domain-bar-label {
          font-size: 0.8rem;
          color: var(--muted);
        }
        .cr-domain-bar-track {
          height: 6px;
          background: rgba(173, 145, 104, 0.12);
          border-radius: 3px;
          overflow: hidden;
        }
        .cr-domain-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        .cr-domain-bar-value {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: right;
          color: var(--text);
        }
        .cr-priority-highlight {
          background: rgba(173, 145, 104, 0.08);
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }
        .cr-priority-tag {
          font-size: 0.65rem;
          background: var(--gold);
          color: #140f23;
          padding: 1px 6px;
          border-radius: 4px;
          margin-left: 6px;
          font-weight: 600;
        }

        /* Tool 4: Allocation bar */
        .cr-alloc-bar {
          display: flex;
          height: 28px;
          border-radius: 8px;
          overflow: hidden;
          margin: 10px 0 8px;
        }
        .cr-alloc-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          transition: width 0.5s ease;
        }
        .cr-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 0.78rem;
        }
        .cr-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--muted);
        }
        .cr-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        /* Meta rows (Tool 4, 6, 8) */
        .cr-meta-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .cr-meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 120px;
        }
        .cr-meta-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
        }

        /* Tool 8: Scenario name */
        .cr-scenario-name {
          font-size: 0.85rem;
          color: var(--gold);
          font-weight: 500;
        }

        /* Section 3: Integration placeholder */
        .cr-integration-placeholder {
          text-align: center;
          padding: 30px 20px;
          background: rgba(30, 25, 43, 0.3);
          border-radius: 12px;
          border: 1px dashed rgba(173, 145, 104, 0.25);
        }
        .cr-integration-icon {
          font-size: 2rem;
        }

        /* ============================================= */
        /* Section 3: Integration — Profile & Warnings   */
        /* ============================================= */

        /* Profile Card */
        .cr-profile-card {
          background: linear-gradient(135deg, rgba(173, 145, 104, 0.1), rgba(75, 65, 102, 0.1));
          border: 2px solid #ad9168;
          border-radius: 15px;
          padding: 25px;
          text-align: center;
          margin-top: 15px;
        }
        .cr-profile-icon {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }
        .cr-profile-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ad9168;
          margin-bottom: 10px;
        }
        .cr-profile-description {
          color: var(--text);
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 600px;
          margin: 0 auto;
        }
        .cr-profile-financial {
          font-style: italic;
        }
        .cr-profile-sources {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        .cr-profile-source {
          background: rgba(173, 145, 104, 0.15);
          border: 1px solid rgba(173, 145, 104, 0.25);
          border-radius: 12px;
          padding: 3px 10px;
          font-size: 0.75rem;
          color: var(--muted);
        }

        /* Warning Cards */
        .cr-warnings-section {
          margin-top: 20px;
        }
        .cr-warning-card {
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          font-size: 14px;
        }
        .cr-warning-critical {
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
        }
        .cr-warning-high {
          background: rgba(245, 158, 11, 0.1);
          border-left: 4px solid #f59e0b;
        }
        .cr-warning-medium {
          background: rgba(245, 158, 11, 0.05);
          border-left: 4px solid rgba(245, 158, 11, 0.5);
        }
        .cr-warning-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .cr-warning-icon {
          font-size: 1.1rem;
        }
        .cr-warning-label {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text);
        }
        .cr-warning-message {
          color: var(--text);
          line-height: 1.5;
          font-size: 0.9rem;
        }
        .cr-warning-source {
          font-size: 0.8rem;
        }

        /* ============================================= */
        /* Section 3: Awareness Gap Styles               */
        /* ============================================= */

        .cr-awareness-gap {
          background: rgba(30, 25, 43, 0.3);
          border: 1px solid rgba(173, 145, 104, 0.2);
          border-radius: 10px;
          padding: 18px;
        }

        .cr-gap-critical {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .cr-gap-elevated {
          border-color: rgba(245, 158, 11, 0.4);
        }

        .cr-gap-bar-row {
          display: flex;
          align-items: center;
          margin: 8px 0;
          gap: 10px;
        }

        .cr-gap-bar-label {
          width: 140px;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .cr-gap-bar-label {
            width: 90px;
            font-size: 0.75rem;
          }
        }

        .cr-gap-bar-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cr-gap-bar {
          flex: 1;
          height: 10px;
          background: rgba(255,255,255,0.08);
          border-radius: 5px;
          overflow: hidden;
        }

        .cr-gap-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.6s ease;
        }

        .cr-gap-fill-psych {
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }

        .cr-gap-fill-stress {
          background: linear-gradient(90deg, #10b981, #22c55e);
        }

        .cr-gap-bar-value {
          font-size: 0.8rem;
          font-weight: 600;
          width: 30px;
          text-align: right;
          color: var(--text);
        }

        .cr-gap-badge {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .cr-gap-badge.cr-gap-critical {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .cr-gap-badge.cr-gap-elevated {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
        }

        /* ============================================= */
        /* Section 3: Belief Lock Styles                 */
        /* ============================================= */

        .cr-lock-chain {
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 10px;
          padding: 16px;
          margin: 10px 0;
        }

        .cr-lock-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text);
          margin-bottom: 12px;
        }

        .cr-lock-strength {
          font-size: 0.75rem;
          padding: 2px 10px;
          border-radius: 10px;
          font-weight: 500;
        }

        .cr-lock-strong {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .cr-lock-moderate {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
        }

        .cr-lock-emerging {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }

        .cr-lock-connector {
          text-align: center;
          color: rgba(139, 92, 246, 0.4);
          font-size: 0.8rem;
          padding: 2px 0;
        }

        .cr-lock-belief {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: rgba(139, 92, 246, 0.05);
          border-radius: 6px;
        }

        .cr-lock-belief-text {
          font-size: 0.85rem;
          color: var(--text);
        }

        .cr-lock-belief-meta {
          font-size: 0.8rem;
          white-space: nowrap;
          margin-left: 10px;
        }

        .cr-lock-impact {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding: 10px;
          background: rgba(245, 158, 11, 0.06);
          border-radius: 6px;
          align-items: flex-start;
        }

        .cr-lock-impact-icon {
          flex-shrink: 0;
        }

        .cr-lock-impact-text {
          font-size: 0.85rem;
          color: var(--text);
          line-height: 1.4;
        }

        /* ============================================= */
        /* Section 3: Belief-Behavior Gap Styles         */
        /* ============================================= */

        .cr-bb-gap-card {
          background: rgba(30, 25, 43, 0.3);
          border: 1px solid rgba(173, 145, 104, 0.2);
          border-radius: 10px;
          padding: 16px;
          margin: 10px 0;
        }

        .cr-bb-gap-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text);
        }

        .cr-bb-gap-subtitle {
          font-size: 0.8rem;
          margin-bottom: 10px;
        }

        .cr-bb-gap-scores {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .cr-bb-gap-score-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cr-bb-gap-score-item .muted {
          font-size: 0.75rem;
        }

        .cr-bb-gap-value {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text);
        }

        .cr-bb-gap-highlight {
          color: #f59e0b;
        }

        .cr-bb-gap-direction {
          margin-top: 8px;
        }

        .cr-bb-gap-direction-label {
          font-size: 0.8rem;
          padding: 2px 10px;
          border-radius: 10px;
          background: rgba(173, 145, 104, 0.15);
          color: var(--muted);
        }

        .cr-bb-gap-interpretation {
          line-height: 1.4;
        }
      </style>
    `;
  },

  // ============================================================
  // SCRIPTS
  // ============================================================

  _getScripts(clientId) {
    // Tools with report pages vs calculator tools
    var reportToolsStr = "'" + this.REPORT_TOOLS.join("','") + "'";

    return `
      <script>
        (function() {
          var clientId = '${clientId}';
          var reportTools = [${reportToolsStr}];

          window.viewToolReport = function(toolId) {
            showLoading('Loading...');
            if (reportTools.indexOf(toolId) !== -1) {
              google.script.run
                .withSuccessHandler(function(html) {
                  document.open();
                  document.write(html);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(err) {
                  hideLoading();
                  alert('Error loading report: ' + err.message);
                })
                .getReportPage(clientId, toolId);
            } else {
              google.script.run
                .withSuccessHandler(function(html) {
                  document.open();
                  document.write(html);
                  document.close();
                  window.scrollTo(0, 0);
                })
                .withFailureHandler(function(err) {
                  hideLoading();
                  alert('Error loading tool: ' + err.message);
                })
                .getToolPageHtml(toolId, clientId, 1);
            }
          };

          window.goToDashboard = function() {
            showLoading('Loading Dashboard');
            google.script.run
              .withSuccessHandler(function(html) {
                document.open();
                document.write(html);
                document.close();
                window.scrollTo(0, 0);
              })
              .withFailureHandler(function(err) {
                hideLoading();
                alert('Error: ' + err.message);
              })
              .getDashboardPage(clientId);
          };
        })();
      </script>
    `;
  }

};
