/**
 * ProgressPage.js - UI layer for Progress Over Time feature
 *
 * Renders a single scrollable page with SVG trend charts showing
 * how a student's assessment scores have changed across completions.
 *
 * Supports both student view (own data) and coach view (any student).
 */

const ProgressPage = {

  // Tool metadata (subset of tracked tools only)
  TOOL_META: {
    tool1: { name: 'Core Trauma Strategy Assessment', shortName: 'Trauma Strategy', icon: '🧠' },
    tool2: { name: 'Financial Clarity & Values', shortName: 'Financial Clarity', icon: '📊' },
    tool3: { name: 'Identity & Validation', shortName: 'Identity & Validation', icon: '🪞' },
    tool5: { name: 'Love & Connection', shortName: 'Love & Connection', icon: '❤️' },
    tool7: { name: 'Security & Control', shortName: 'Security & Control', icon: '🛡️' }
  },

  STRATEGY_LABELS: {
    FSV: 'False Self-View',
    ExVal: 'External Validation',
    Showing: 'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control: 'Control Leading to Isolation',
    Fear: 'Fear Leading to Isolation'
  },

  DOMAIN_LABELS: {
    moneyFlow: 'Money Flow',
    obligations: 'Obligations',
    liquidity: 'Liquidity',
    growth: 'Growth',
    protection: 'Protection'
  },

  GROUNDING_CONFIG: {
    tool3: {
      domain1Name: 'False Self-View (FSV)',
      domain2Name: 'External Validation (ExVal)',
      subdomains: {
        subdomain_1_1: 'I am Not Worthy of Financial Freedom',
        subdomain_1_2: 'I will Never Have Enough',
        subdomain_1_3: 'I Cannot See My Financial Reality',
        subdomain_2_1: 'Money Shows My Worth',
        subdomain_2_2: 'What Will They Think?',
        subdomain_2_3: 'I Need to Prove I am Successful'
      }
    },
    tool5: {
      domain1Name: 'Issues Showing Love (ISL)',
      domain2Name: 'Issues Receiving Love (IRL)',
      subdomains: {
        subdomain_1_1: 'I Must Give to Be Loved',
        subdomain_1_2: 'Their Needs Are Greater Than My Needs',
        subdomain_1_3: 'I Cannot Accept Help',
        subdomain_2_1: 'I Cannot Make It Alone',
        subdomain_2_2: 'I Owe Them Everything',
        subdomain_2_3: 'I Will Always Be in Debt'
      }
    },
    tool7: {
      domain1Name: 'Control Leading to Isolation (CLI)',
      domain2Name: 'Fear Leading to Isolation (FLI)',
      subdomains: {
        subdomain_1_1: 'I Undercharge and Give Away',
        subdomain_1_2: 'I Have Money But Will Not Use It',
        subdomain_1_3: 'Only I Can Do It Right',
        subdomain_2_1: 'I Do Not Protect Myself',
        subdomain_2_2: 'I Sabotage Success',
        subdomain_2_3: 'I Am Destined to Be Betrayed'
      }
    }
  },

  TOOL_ORDER: ['tool1', 'tool2', 'tool3', 'tool5', 'tool7'],

  // ─── Main Render ───────────────────────────────────────────────────

  /**
   * Render the full progress page
   * @param {string} clientId
   * @param {Object} options - { isCoach: boolean, studentName: string }
   * @returns {GoogleAppsScript.HTML.HtmlOutput}
   */
  render(clientId, options) {
    options = options || {};
    var isCoach = options.isCoach || false;
    var studentName = options.studentName || clientId;

    var history = ProgressHistory.getAllHistory(clientId);

    var title = isCoach
      ? 'Student Progress: ' + studentName
      : 'Your Progress Over Time';

    var html = '<!DOCTYPE html><html><head>'
      + '<meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1">'
      + '<title>TruPath - Progress Over Time</title>'
      + '<style>' + this._getStyles() + '</style>'
      + '</head><body>'
      + '<div class="progress-container">'
      + this._renderHeader(title, clientId, isCoach)
      + this._renderOverviewStrip(history)
      + this._renderToolSections(history)
      + this._renderFooter()
      + '</div>'
      + '<script>' + this._getScripts(clientId, isCoach) + '</script>'
      + '</body></html>';

    return HtmlService.createHtmlOutput(html)
      .setTitle('TruPath - Progress Over Time')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  // ─── Header ────────────────────────────────────────────────────────

  _renderHeader(title, clientId, isCoach) {
    return '<div class="progress-header">'
      + '<h1 class="progress-title">' + title + '</h1>'
      + '<p class="progress-subtitle">Track how your assessment results change over time as you grow through the program.</p>'
      + '<button class="back-btn" onclick="goBack(\'' + clientId + '\', ' + isCoach + ')">Back to Dashboard</button>'
      + '</div>';
  },

  // ─── Overview Strip ────────────────────────────────────────────────

  _renderOverviewStrip(history) {
    var html = '<div class="overview-strip">';

    for (var i = 0; i < this.TOOL_ORDER.length; i++) {
      var toolId = this.TOOL_ORDER[i];
      var meta = this.TOOL_META[toolId];
      var entries = history[toolId] || [];
      var count = entries.length;

      var statusClass = count === 0 ? 'status-none' : count === 1 ? 'status-single' : 'status-tracking';
      var statusText = count === 0 ? 'Not started' : count === 1 ? '1 completion' : count + ' completions';

      html += '<div class="overview-badge ' + statusClass + '">'
        + '<span class="overview-icon">' + meta.icon + '</span>'
        + '<span class="overview-name">' + meta.shortName + '</span>'
        + '<span class="overview-count">' + statusText + '</span>'
        + '</div>';
    }

    html += '</div>';
    return html;
  },

  // ─── Tool Sections ─────────────────────────────────────────────────

  _renderToolSections(history) {
    var html = '';
    for (var i = 0; i < this.TOOL_ORDER.length; i++) {
      var toolId = this.TOOL_ORDER[i];
      var entries = history[toolId] || [];
      html += this._renderToolSection(toolId, entries);
    }
    return html;
  },

  _renderToolSection(toolId, entries) {
    var meta = this.TOOL_META[toolId];

    var html = '<div class="tool-section">'
      + '<div class="tool-section-header" onclick="toggleSection(\'' + toolId + '\')">'
      + '<div class="tool-section-title">'
      + '<span class="tool-icon">' + meta.icon + '</span>'
      + '<span>' + meta.name + '</span>'
      + '</div>'
      + '<div class="tool-section-right">';

    if (entries.length >= 2) {
      html += this._renderOverallTrend(toolId, entries);
    }

    html += '<span class="expand-arrow" id="arrow-' + toolId + '">&#9660;</span>'
      + '</div>'
      + '</div>';

    html += '<div class="tool-section-body" id="body-' + toolId + '">';

    if (entries.length === 0) {
      html += this._renderEmptyState(toolId, 'not_started');
    } else if (entries.length === 1) {
      html += this._renderEmptyState(toolId, 'single');
    } else {
      html += this._renderCharts(toolId, entries);
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Render a trend badge (improving/declining/stable) based on headline metric
   */
  _renderOverallTrend(toolId, entries) {
    var first = entries[0];
    var last = entries[entries.length - 1];
    var delta = 0;
    var inverted = false; // For grounding tools: lower = better

    if (toolId === 'tool1') {
      // Compare max strategy score
      var firstMax = this._getMaxScore(first.scores.scores);
      var lastMax = this._getMaxScore(last.scores.scores);
      delta = lastMax - firstMax;
    } else if (toolId === 'tool2') {
      // Compare average domain score
      delta = this._avgDomainScore(last.scores.domainScores) - this._avgDomainScore(first.scores.domainScores);
    } else {
      // Grounding: compare overall quotient (lower = better)
      delta = last.scores.overallQuotient - first.scores.overallQuotient;
      inverted = true;
    }

    var isImproving = inverted ? (delta < -2) : (delta > 2);
    var isDeclining = inverted ? (delta > 2) : (delta < -2);

    if (isImproving) {
      return '<span class="trend-badge trend-improving">Improving</span>';
    } else if (isDeclining) {
      return '<span class="trend-badge trend-declining">Needs Attention</span>';
    } else {
      return '<span class="trend-badge trend-stable">Stable</span>';
    }
  },

  _getMaxScore(scores) {
    var max = -Infinity;
    for (var key in scores) {
      if (scores[key] > max) max = scores[key];
    }
    return max;
  },

  _avgDomainScore(domainScores) {
    var total = 0;
    var count = 0;
    for (var key in domainScores) {
      total += domainScores[key];
      count++;
    }
    return count > 0 ? total / count : 0;
  },

  // ─── Empty States ──────────────────────────────────────────────────

  _renderEmptyState(toolId, type) {
    var meta = this.TOOL_META[toolId];
    if (type === 'not_started') {
      return '<div class="empty-state">'
        + '<p class="empty-text">You have not completed this assessment yet.</p>'
        + '<p class="empty-hint">Complete ' + meta.shortName + ' to start tracking your progress.</p>'
        + '</div>';
    } else {
      return '<div class="empty-state">'
        + '<p class="empty-text">You have completed this assessment once.</p>'
        + '<p class="empty-hint">Complete ' + meta.shortName + ' again to see how your results have changed.</p>'
        + '</div>';
    }
  },

  // ─── Chart Rendering ──────────────────────────────────────────────

  _renderCharts(toolId, entries) {
    if (toolId === 'tool1') {
      return this._renderTool1Charts(entries);
    } else if (toolId === 'tool2') {
      return this._renderTool2Charts(entries);
    } else {
      return this._renderGroundingCharts(toolId, entries);
    }
  },

  /**
   * Tool 1: 6 strategy scores + dominant strategy changes
   */
  _renderTool1Charts(entries) {
    var html = '';

    // Dominant strategy timeline
    html += '<div class="chart-group">'
      + '<h3 class="chart-group-title">Dominant Strategy Over Time</h3>'
      + '<div class="strategy-timeline">';

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var date = this._formatDate(e.timestamp);
      var label = this.STRATEGY_LABELS[e.scores.winner] || e.scores.winner;
      var isCurrent = i === entries.length - 1;
      var changed = i > 0 && entries[i - 1].scores.winner !== e.scores.winner;

      html += '<div class="strategy-entry' + (isCurrent ? ' current' : '') + (changed ? ' changed' : '') + '">'
        + '<div class="strategy-date">' + date + '</div>'
        + '<div class="strategy-label">' + label + '</div>'
        + (changed ? '<div class="strategy-change-badge">Changed</div>' : '')
        + '</div>';
    }

    html += '</div></div>';

    // Individual strategy trend lines
    var strategies = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
    html += '<div class="chart-group">'
      + '<h3 class="chart-group-title">Strategy Scores</h3>'
      + '<div class="chart-grid">';

    for (var s = 0; s < strategies.length; s++) {
      var key = strategies[s];
      var dataPoints = [];
      for (var j = 0; j < entries.length; j++) {
        dataPoints.push({
          value: entries[j].scores.scores[key] || 0,
          date: this._formatDate(entries[j].timestamp),
          version: entries[j].versionNumber
        });
      }
      html += this._renderTrendChart(dataPoints, this.STRATEGY_LABELS[key], { inverted: false });
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Tool 2: 5 domain scores + archetype changes
   */
  _renderTool2Charts(entries) {
    var html = '';

    // Archetype timeline
    html += '<div class="chart-group">'
      + '<h3 class="chart-group-title">Financial Archetype Over Time</h3>'
      + '<div class="strategy-timeline">';

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var date = this._formatDate(e.timestamp);
      var isCurrent = i === entries.length - 1;
      var changed = i > 0 && entries[i - 1].scores.archetype !== e.scores.archetype;

      html += '<div class="strategy-entry' + (isCurrent ? ' current' : '') + (changed ? ' changed' : '') + '">'
        + '<div class="strategy-date">' + date + '</div>'
        + '<div class="strategy-label">' + (e.scores.archetype || 'Unknown') + '</div>'
        + (changed ? '<div class="strategy-change-badge">Changed</div>' : '')
        + '</div>';
    }

    html += '</div></div>';

    // Domain score trends
    var domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
    html += '<div class="chart-group">'
      + '<h3 class="chart-group-title">Financial Domain Scores</h3>'
      + '<div class="chart-grid">';

    for (var d = 0; d < domains.length; d++) {
      var dk = domains[d];
      var dataPoints = [];
      for (var j = 0; j < entries.length; j++) {
        dataPoints.push({
          value: entries[j].scores.domainScores[dk] || 0,
          date: this._formatDate(entries[j].timestamp),
          version: entries[j].versionNumber
        });
      }
      html += this._renderTrendChart(dataPoints, this.DOMAIN_LABELS[dk], { inverted: false });
    }

    html += '</div></div>';
    return html;
  },

  /**
   * Tools 3, 5, 7: Overall quotient, domain quotients, subdomain quotients
   */
  _renderGroundingCharts(toolId, entries) {
    var config = this.GROUNDING_CONFIG[toolId];
    var html = '';

    // Overall quotient headline chart
    html += '<div class="chart-group">';

    var overallPoints = [];
    for (var i = 0; i < entries.length; i++) {
      overallPoints.push({
        value: entries[i].scores.overallQuotient || 0,
        date: this._formatDate(entries[i].timestamp),
        version: entries[i].versionNumber
      });
    }
    html += this._renderTrendChart(overallPoints, 'Overall Quotient (lower = healthier)', {
      inverted: true,
      large: true,
      maxValue: 100
    });

    html += '</div>';

    // Domain quotients
    html += '<div class="chart-group">'
      + '<h3 class="chart-group-title">Domain Quotients</h3>'
      + '<div class="chart-grid">';

    var domainNames = [config.domain1Name, config.domain2Name];
    var domainKeys = ['domain1', 'domain2'];

    for (var d = 0; d < domainKeys.length; d++) {
      var dp = [];
      for (var j = 0; j < entries.length; j++) {
        dp.push({
          value: entries[j].scores.domainQuotients[domainKeys[d]] || 0,
          date: this._formatDate(entries[j].timestamp),
          version: entries[j].versionNumber
        });
      }
      html += this._renderTrendChart(dp, domainNames[d], { inverted: true, maxValue: 100 });
    }

    html += '</div></div>';

    // Subdomain quotients (collapsible)
    html += '<div class="chart-group">'
      + '<h3 class="chart-group-title clickable" onclick="toggleSubdomains(\'' + toolId + '\')">'
      + 'Subdomain Quotients <span class="expand-arrow" id="sub-arrow-' + toolId + '">&#9654;</span>'
      + '</h3>'
      + '<div class="subdomain-charts" id="subdomains-' + toolId + '" style="display:none;">'
      + '<div class="chart-grid">';

    var subKeys = ['subdomain_1_1', 'subdomain_1_2', 'subdomain_1_3',
                   'subdomain_2_1', 'subdomain_2_2', 'subdomain_2_3'];

    for (var s = 0; s < subKeys.length; s++) {
      var sk = subKeys[s];
      var sp = [];
      for (var k = 0; k < entries.length; k++) {
        sp.push({
          value: entries[k].scores.subdomainQuotients[sk] || 0,
          date: this._formatDate(entries[k].timestamp),
          version: entries[k].versionNumber
        });
      }
      var subLabel = config.subdomains[sk] || sk;
      html += this._renderTrendChart(sp, subLabel, { inverted: true, maxValue: 100 });
    }

    html += '</div></div></div>';
    return html;
  },

  // ─── SVG Trend Chart ──────────────────────────────────────────────

  /**
   * Render an inline SVG sparkline trend chart for one metric
   *
   * @param {Array} dataPoints - [{ value, date, version }, ...]
   * @param {string} label - Metric name
   * @param {Object} options - { inverted, large, maxValue }
   */
  _renderTrendChart(dataPoints, label, options) {
    options = options || {};
    var inverted = options.inverted || false;
    var isLarge = options.large || false;

    var width = isLarge ? 500 : 280;
    var height = isLarge ? 140 : 100;
    var padding = { top: 15, right: 40, bottom: 30, left: 10 };

    var chartW = width - padding.left - padding.right;
    var chartH = height - padding.top - padding.bottom;

    // Calculate value range
    var values = dataPoints.map(function(p) { return p.value; });
    var minVal = Math.min.apply(null, values);
    var maxVal = Math.max.apply(null, values);

    // Add some padding to the range
    if (options.maxValue) {
      maxVal = Math.max(maxVal, options.maxValue);
      minVal = Math.min(minVal, 0);
    } else {
      var rangePad = (maxVal - minVal) * 0.15 || 2;
      maxVal = maxVal + rangePad;
      minVal = Math.max(0, minVal - rangePad);
    }

    var range = maxVal - minVal || 1;

    // Build SVG points
    var points = [];
    var circles = '';
    var dateLabels = '';

    for (var i = 0; i < dataPoints.length; i++) {
      var x = padding.left + (dataPoints.length === 1 ? chartW / 2 : (i / (dataPoints.length - 1)) * chartW);
      var y = padding.top + chartH - ((dataPoints[i].value - minVal) / range) * chartH;

      points.push(Math.round(x) + ',' + Math.round(y));

      var isLast = i === dataPoints.length - 1;
      var radius = isLast ? 5 : 3;
      var fillColor = isLast ? '#ad9168' : 'rgba(173, 145, 104, 0.6)';

      circles += '<circle cx="' + Math.round(x) + '" cy="' + Math.round(y) + '" r="' + radius + '" fill="' + fillColor + '" />';

      // Score label on last point
      if (isLast) {
        circles += '<text x="' + (Math.round(x) + 8) + '" y="' + (Math.round(y) + 4) + '" '
          + 'fill="#ad9168" font-size="12" font-weight="600">'
          + Math.round(dataPoints[i].value) + '</text>';
      }

      // Date label on x-axis
      dateLabels += '<text x="' + Math.round(x) + '" y="' + (height - 4) + '" '
        + 'text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9">'
        + dataPoints[i].date + '</text>';
    }

    // Delta calculation (first vs last)
    var delta = dataPoints[dataPoints.length - 1].value - dataPoints[0].value;
    var deltaRounded = Math.round(delta * 10) / 10;
    var isImproving = inverted ? delta < 0 : delta > 0;
    var isWorsening = inverted ? delta > 0 : delta < 0;
    var deltaColor = isImproving ? '#4ade80' : isWorsening ? '#f87171' : 'rgba(255,255,255,0.5)';
    var deltaArrow = isImproving ? (inverted ? '↓' : '↑') : isWorsening ? (inverted ? '↑' : '↓') : '→';
    var deltaText = deltaArrow + ' ' + (delta > 0 ? '+' : '') + deltaRounded;

    // Trend line color
    var lineColor = isImproving ? '#4ade80' : isWorsening ? '#f87171' : '#ad9168';

    var svg = '<svg width="100%" viewBox="0 0 ' + width + ' ' + height + '" class="trend-svg">'
      + '<polyline points="' + points.join(' ') + '" '
      + 'fill="none" stroke="' + lineColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />'
      + circles
      + dateLabels
      + '</svg>';

    return '<div class="trend-card' + (isLarge ? ' trend-card-large' : '') + '">'
      + '<div class="trend-label">'
      + '<span class="trend-metric-name">' + label + '</span>'
      + '<span class="trend-delta" style="color:' + deltaColor + ';">' + deltaText + '</span>'
      + '</div>'
      + svg
      + '</div>';
  },

  // ─── Footer ────────────────────────────────────────────────────────

  _renderFooter() {
    return '<div class="progress-footer">'
      + '<p>Progress tracking helps you see how your awareness and financial clarity evolve over time.</p>'
      + '</div>';
  },

  // ─── Helpers ───────────────────────────────────────────────────────

  _formatDate(timestamp) {
    try {
      var d = new Date(timestamp);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[d.getMonth()] + ' ' + d.getDate();
    } catch (e) {
      return '';
    }
  },

  // ─── Styles ────────────────────────────────────────────────────────

  _getStyles() {
    return "@import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');"

      + '* { margin: 0; padding: 0; box-sizing: border-box; }'

      + 'body {'
      + '  font-family: "Rubik", Arial, sans-serif;'
      + '  background: linear-gradient(135deg, #4b4166, #1e192b);'
      + '  background-attachment: fixed;'
      + '  min-height: 100vh;'
      + '  padding: 20px;'
      + '  color: #fff;'
      + '}'

      + '.progress-container {'
      + '  max-width: 900px;'
      + '  margin: 0 auto;'
      + '}'

      // Header
      + '.progress-header {'
      + '  text-align: center;'
      + '  margin-bottom: 30px;'
      + '  padding-bottom: 20px;'
      + '  border-bottom: 2px solid #ad9168;'
      + '}'
      + '.progress-title {'
      + '  font-family: "Radley", serif;'
      + '  font-size: 2rem;'
      + '  color: #ad9168;'
      + '  margin-bottom: 8px;'
      + '}'
      + '.progress-subtitle {'
      + '  color: rgba(255,255,255,0.6);'
      + '  font-size: 0.95rem;'
      + '  margin-bottom: 16px;'
      + '}'
      + '.back-btn {'
      + '  background: rgba(173, 145, 104, 0.15);'
      + '  border: 1px solid rgba(173, 145, 104, 0.3);'
      + '  color: #ad9168;'
      + '  padding: 8px 20px;'
      + '  border-radius: 8px;'
      + '  cursor: pointer;'
      + '  font-size: 0.9rem;'
      + '  transition: all 0.2s;'
      + '}'
      + '.back-btn:hover { background: rgba(173, 145, 104, 0.25); }'

      // Overview strip
      + '.overview-strip {'
      + '  display: flex;'
      + '  gap: 10px;'
      + '  margin-bottom: 30px;'
      + '  flex-wrap: wrap;'
      + '  justify-content: center;'
      + '}'
      + '.overview-badge {'
      + '  display: flex;'
      + '  flex-direction: column;'
      + '  align-items: center;'
      + '  padding: 12px 16px;'
      + '  border-radius: 12px;'
      + '  background: rgba(20, 15, 35, 0.7);'
      + '  border: 1px solid rgba(255,255,255,0.1);'
      + '  min-width: 120px;'
      + '  transition: all 0.2s;'
      + '}'
      + '.overview-badge.status-tracking { border-color: rgba(173, 145, 104, 0.4); }'
      + '.overview-badge.status-single { border-color: rgba(255,255,255,0.2); }'
      + '.overview-badge.status-none { opacity: 0.5; }'
      + '.overview-icon { font-size: 1.3rem; margin-bottom: 4px; }'
      + '.overview-name { font-size: 0.75rem; color: rgba(255,255,255,0.7); margin-bottom: 2px; }'
      + '.overview-count { font-size: 0.7rem; color: rgba(255,255,255,0.4); }'

      // Tool sections
      + '.tool-section {'
      + '  background: rgba(20, 15, 35, 0.95);'
      + '  border: 1px solid rgba(173, 145, 104, 0.2);'
      + '  border-radius: 16px;'
      + '  margin-bottom: 20px;'
      + '  overflow: hidden;'
      + '}'
      + '.tool-section-header {'
      + '  display: flex;'
      + '  justify-content: space-between;'
      + '  align-items: center;'
      + '  padding: 16px 20px;'
      + '  cursor: pointer;'
      + '  transition: background 0.2s;'
      + '}'
      + '.tool-section-header:hover { background: rgba(173, 145, 104, 0.05); }'
      + '.tool-section-title {'
      + '  display: flex;'
      + '  align-items: center;'
      + '  gap: 10px;'
      + '  font-size: 1.1rem;'
      + '  font-weight: 500;'
      + '}'
      + '.tool-icon { font-size: 1.3rem; }'
      + '.tool-section-right {'
      + '  display: flex;'
      + '  align-items: center;'
      + '  gap: 12px;'
      + '}'
      + '.expand-arrow {'
      + '  color: rgba(255,255,255,0.4);'
      + '  font-size: 0.8rem;'
      + '  transition: transform 0.3s;'
      + '}'
      + '.expand-arrow.open { transform: rotate(180deg); }'
      + '.tool-section-body {'
      + '  padding: 0 20px 20px;'
      + '}'
      + '.tool-section-body.collapsed { display: none; }'

      // Trend badges
      + '.trend-badge {'
      + '  font-size: 0.75rem;'
      + '  padding: 3px 10px;'
      + '  border-radius: 12px;'
      + '  font-weight: 500;'
      + '}'
      + '.trend-improving { background: rgba(74, 222, 128, 0.15); color: #4ade80; }'
      + '.trend-declining { background: rgba(248, 113, 113, 0.15); color: #f87171; }'
      + '.trend-stable { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }'

      // Empty states
      + '.empty-state {'
      + '  text-align: center;'
      + '  padding: 30px 20px;'
      + '}'
      + '.empty-text { color: rgba(255,255,255,0.6); margin-bottom: 6px; }'
      + '.empty-hint { color: rgba(255,255,255,0.35); font-size: 0.85rem; }'

      // Chart groups
      + '.chart-group { margin-bottom: 20px; }'
      + '.chart-group-title {'
      + '  font-size: 0.9rem;'
      + '  color: rgba(255,255,255,0.5);'
      + '  text-transform: uppercase;'
      + '  letter-spacing: 1px;'
      + '  margin-bottom: 12px;'
      + '  padding-left: 4px;'
      + '}'
      + '.chart-group-title.clickable { cursor: pointer; }'
      + '.chart-group-title.clickable:hover { color: rgba(255,255,255,0.7); }'

      + '.chart-grid {'
      + '  display: grid;'
      + '  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));'
      + '  gap: 12px;'
      + '}'

      // Trend cards
      + '.trend-card {'
      + '  background: rgba(255,255,255,0.03);'
      + '  border: 1px solid rgba(255,255,255,0.08);'
      + '  border-radius: 12px;'
      + '  padding: 12px;'
      + '}'
      + '.trend-card-large {'
      + '  grid-column: 1 / -1;'
      + '  max-width: 560px;'
      + '}'
      + '.trend-label {'
      + '  display: flex;'
      + '  justify-content: space-between;'
      + '  align-items: center;'
      + '  margin-bottom: 8px;'
      + '}'
      + '.trend-metric-name {'
      + '  font-size: 0.8rem;'
      + '  color: rgba(255,255,255,0.7);'
      + '  font-weight: 400;'
      + '}'
      + '.trend-delta {'
      + '  font-size: 0.8rem;'
      + '  font-weight: 600;'
      + '}'
      + '.trend-svg { display: block; }'

      // Strategy timeline
      + '.strategy-timeline {'
      + '  display: flex;'
      + '  gap: 8px;'
      + '  overflow-x: auto;'
      + '  padding-bottom: 8px;'
      + '  margin-bottom: 16px;'
      + '}'
      + '.strategy-entry {'
      + '  flex: 0 0 auto;'
      + '  background: rgba(255,255,255,0.03);'
      + '  border: 1px solid rgba(255,255,255,0.08);'
      + '  border-radius: 10px;'
      + '  padding: 10px 14px;'
      + '  text-align: center;'
      + '  min-width: 130px;'
      + '  position: relative;'
      + '}'
      + '.strategy-entry.current {'
      + '  border-color: rgba(173, 145, 104, 0.4);'
      + '  background: rgba(173, 145, 104, 0.08);'
      + '}'
      + '.strategy-entry.changed { border-color: rgba(245, 158, 11, 0.4); }'
      + '.strategy-date { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-bottom: 4px; }'
      + '.strategy-label { font-size: 0.85rem; color: #fff; font-weight: 500; }'
      + '.strategy-change-badge {'
      + '  position: absolute;'
      + '  top: -8px;'
      + '  right: -4px;'
      + '  background: #f59e0b;'
      + '  color: #000;'
      + '  font-size: 0.6rem;'
      + '  font-weight: 600;'
      + '  padding: 2px 6px;'
      + '  border-radius: 6px;'
      + '}'

      // Footer
      + '.progress-footer {'
      + '  text-align: center;'
      + '  padding: 20px;'
      + '  color: rgba(255,255,255,0.3);'
      + '  font-size: 0.8rem;'
      + '}'

      // Mobile
      + '@media (max-width: 480px) {'
      + '  .progress-title { font-size: 1.5rem; }'
      + '  .chart-grid { grid-template-columns: 1fr; }'
      + '  .overview-strip { gap: 6px; }'
      + '  .overview-badge { min-width: 90px; padding: 8px 10px; }'
      + '  .tool-section-header { padding: 12px 14px; }'
      + '  .tool-section-body { padding: 0 14px 14px; }'
      + '}';
  },

  // ─── Scripts ───────────────────────────────────────────────────────

  _getScripts(clientId, isCoach) {
    return 'function goBack(clientId, isCoach) {'
      + '  if (isCoach) {'
      + '    window.history.back();'
      + '  } else {'
      + '    var overlay = document.createElement("div");'
      + '    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;color:#fff;font-size:1.1rem;";'
      + '    overlay.textContent = "Loading dashboard...";'
      + '    document.body.appendChild(overlay);'
      + '    google.script.run'
      + '      .withSuccessHandler(function(html) {'
      + '        document.open();'
      + '        document.write(html);'
      + '        document.close();'
      + '        window.scrollTo(0, 0);'
      + '      })'
      + '      .withFailureHandler(function(err) {'
      + '        overlay.textContent = "Error: " + err.message;'
      + '      })'
      + '      .getDashboardPage(clientId);'
      + '  }'
      + '}'

      + 'function toggleSection(toolId) {'
      + '  var body = document.getElementById("body-" + toolId);'
      + '  var arrow = document.getElementById("arrow-" + toolId);'
      + '  if (body.classList.contains("collapsed")) {'
      + '    body.classList.remove("collapsed");'
      + '    arrow.classList.add("open");'
      + '  } else {'
      + '    body.classList.add("collapsed");'
      + '    arrow.classList.remove("open");'
      + '  }'
      + '}'

      + 'function toggleSubdomains(toolId) {'
      + '  var el = document.getElementById("subdomains-" + toolId);'
      + '  var arrow = document.getElementById("sub-arrow-" + toolId);'
      + '  if (el.style.display === "none") {'
      + '    el.style.display = "block";'
      + '    arrow.innerHTML = "&#9660;";'
      + '  } else {'
      + '    el.style.display = "none";'
      + '    arrow.innerHTML = "&#9654;";'
      + '  }'
      + '}';
  }
};
