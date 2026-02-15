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
  // SECTION 3: INTEGRATION (PLACEHOLDER)
  // ============================================================

  _renderSection3(summary) {
    if (summary.completedCount < 2) return '';

    return `
      <div class="card cr-section-card">
        <h2 class="cr-section-title">The Integration</h2>
        <p class="muted">Where your psychological patterns meet your financial world</p>
        <div class="hr" style="margin: 15px 0;"></div>

        <div class="cr-integration-placeholder">
          <div class="cr-integration-icon">🔬</div>
          <p style="margin: 10px 0 5px; font-size: 1.05rem; color: var(--text);">
            Integration insights coming soon
          </p>
          <p class="muted" style="font-size: 0.9rem; max-width: 500px; margin: 0 auto;">
            We are analyzing patterns across psychological and financial data
            to identify evidence-based connections between your trauma strategies
            and financial behaviors.
          </p>
        </div>
      </div>
    `;
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
