/**
 * Tool2Report.js
 * Generates the Financial Mirror report
 * Phase 3: 9-section report with gap analysis, pattern synthesis, and progress comparison
 */

const Tool2Report = {

  // Domain metadata used across sections
  DOMAINS: [
    { key: 'moneyFlow', label: 'Money Flow', icon: '💰', desc: 'Income and Spending' },
    { key: 'obligations', label: 'Obligations', icon: '⚖️', desc: 'Debt and Emergency Fund' },
    { key: 'liquidity', label: 'Liquidity', icon: '💧', desc: 'Accessible Savings' },
    { key: 'growth', label: 'Growth', icon: '📈', desc: 'Retirement and Investments' },
    { key: 'protection', label: 'Protection', icon: '🛡️', desc: 'Insurance Coverage' }
  ],

  PATTERN_NAMES: {
    FSV: 'False Self-View',
    ExVal: 'External Validation',
    Showing: 'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control: 'Control Leading to Isolation',
    Fear: 'Fear Leading to Isolation'
  },

  /**
   * Render the report page
   */
  render(clientId) {
    try {
      const results = this.getResults(clientId);

      if (!results) {
        return HtmlService.createHtmlOutput(
          '<h1>Error</h1><p>No assessment results found for client ' + clientId + '</p>' +
          '<a href="' + ScriptApp.getService().getUrl() + '?route=dashboard&client=' + clientId + '">Back to Dashboard</a>'
        );
      }

      // Schema detection: new vs legacy report
      const isNewSchema = results.results && results.results.objectiveHealthScores;
      const reportHtml = isNewSchema
        ? this.buildNewReportHTML(clientId, results)
        : this.buildLegacyReportHTML(clientId, results);

      return HtmlService.createHtmlOutput(reportHtml)
        .setTitle('TruPath - Financial Mirror Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      LogUtils.error('Error rendering report: ' + error);
      return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.toString() + '</p>');
    }
  },

  /**
   * Get assessment results from RESPONSES sheet
   */
  getResults(clientId) {
    return ReportBase.getResults(clientId, 'tool2', (resultData, cId) => {
      return {
        clientId: cId,
        results: resultData.results,
        data: resultData.data,
        formData: resultData.data || resultData.formData,
        gptInsights: resultData.gptInsights || {},
        overallInsight: resultData.overallInsight || {}
      };
    }, true);
  },

  // ============================================================
  // NEW 9-SECTION REPORT (Phase 3)
  // ============================================================

  buildNewReportHTML(clientId, results) {
    const data = results.formData || {};
    const r = results.results || {};
    const studentName = data.name || 'Student';
    const mode = r.assessmentMode || 'full';
    const modeLabel = mode === 'full' ? 'Full Assessment' : 'Quick Check-In';
    const profile = r.tool1Profile || {};
    const winner = profile.winner || 'FSV';

    return '<!DOCTYPE html><html><head>' +
      '<title>TruPath - Financial Mirror Report</title>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<meta name="theme-color" content="#1e192b">' +
      '<style>' + this.getReportStyles() + this.getNewReportCSS() + '</style>' +
      '</head><body>' +
      ReportStyles.getLoadingHTML() +
      '<div class="report-container">' +

      // Section 1: Header
      this.buildSection1Header(studentName, modeLabel, clientId) +

      '<div class="report-content">' +

      // Section 2: Scarcity & Mindset
      this.buildSection2Scarcity(data, r.scarcityFlag) +

      // Progress Comparison (conditional, after Section 3 area)
      this.buildProgressComparison(clientId, r) +

      // Section 3: Financial Reality (Objective)
      this.buildSection3Objective(r.objectiveHealthScores, data) +

      // Section 4: Financial Perception (Subjective)
      this.buildSection4Subjective(r.subjectiveScores, mode) +

      // Section 5: Gap Analysis
      this.buildSection5GapAnalysis(r, winner) +

      // Section 6: Priority Map
      this.buildSection6PriorityMap(r.newPriorityList || [], r.objectiveHealthScores, winner) +

      // Section 7: Pattern Synthesis
      this.buildSection7PatternSynthesis(profile) +

      // Section 8: GPT Insights
      this.buildSection8GPTInsights(results.overallInsight) +

      // Section 9: Growth Archetype
      this.buildSection9Archetype(r.archetype) +

      // Light mode callout
      (mode === 'light' ? '<div class="light-callout"><p>This report is based on the Quick Check-In. Complete the full assessment for deeper narrative insights and more detailed gap analysis.</p></div>' : '') +

      // Footer
      '<div class="footer-section">' +
        '<h3>Next Steps</h3>' +
        '<p>Use this Financial Mirror to guide conversations with your advisor and to set priorities for closing the gaps between your financial reality and your perception of it.</p>' +
      '</div>' +

      '</div>' + // end report-content

      // Action buttons
      '<div class="action-buttons">' +
        '<button class="btn-primary" onclick="downloadPDF()">Download PDF Report</button>' +
        '<button class="btn-secondary" onclick="backToDashboard()">Back to Dashboard</button>' +
      '</div>' +
      '<p style="text-align: center; color: #999; font-size: 14px; margin-top: 10px;">To edit your responses, return to the dashboard and click "Edit Answers"</p>' +

      '</div>' + // end report-container

      '<script>(function() {' +
        'var clientId = "' + clientId + '";' +
        ReportClientJS.getLoadingFunctions() +
        ReportClientJS.getNavigationFunction() +
        ReportClientJS.getDownloadFunction('generateTool2PDF') +
        ReportClientJS.getBackToDashboard() +
        'window.downloadPDF = downloadPDF;' +
        'window.backToDashboard = backToDashboard;' +
      '})();</script>' +

      FeedbackWidget.render(clientId, 'tool2', 'report') +
      '</body></html>';
  },

  // --- Section 1: Header ---
  buildSection1Header(studentName, modeLabel, clientId) {
    var dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return '<div class="report-header">' +
      '<img src="https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw" alt="TruPath Financial Logo" class="logo">' +
      '<h1 class="main-title">' + studentName + "'s Financial Mirror</h1>" +
      '<p class="date">' + dateStr + ' | ' + modeLabel + '</p>' +
    '</div>';
  },

  // --- Section 2: Scarcity & Mindset ---
  buildSection2Scarcity(data, scarcityFlag) {
    var holistic = parseFloat(data.holisticScarcity) || 0;
    var financial = parseFloat(data.financialScarcity) || 0;
    var callout = '';

    if (scarcityFlag === 'GLOBAL_SCARCITY') {
      callout = '<div class="scarcity-callout scarcity-warning">Your responses suggest a global sense of scarcity — a feeling that there is not enough in life broadly. This pattern typically forms early and shapes financial decision-making at a deep level.</div>';
    } else if (scarcityFlag === 'TARGETED_FINANCIAL_SCARCITY') {
      callout = '<div class="scarcity-callout scarcity-warning">You report a generally abundant life outlook but significant scarcity around money specifically. This often points to a specific formative financial experience rather than a global worldview.</div>';
    } else if (scarcityFlag === 'GLOBAL_ABUNDANCE') {
      callout = '<div class="scarcity-callout scarcity-positive">Your responses reflect a sense of abundance across life and finances. This is a protective factor in your financial decision-making.</div>';
    }

    var gapNote = '';
    if (Math.abs(holistic - financial) > 3) {
      gapNote = '<p class="scarcity-gap-note">There is a meaningful gap between your overall life outlook and your financial outlook specifically — see the pattern analysis below for what this may indicate.</p>';
    }

    return '<div class="section-block">' +
      '<h2>Scarcity and Mindset Foundation</h2>' +
      callout +
      '<div class="scarcity-scores">' +
        '<div class="scarcity-item"><div class="scarcity-label">Life Outlook</div><div class="scarcity-value">' + holistic + '</div><div class="scarcity-scale">-5 scarce to +5 abundant</div></div>' +
        '<div class="scarcity-item"><div class="scarcity-label">Financial Outlook</div><div class="scarcity-value">' + financial + '</div><div class="scarcity-scale">-5 scarce to +5 abundant</div></div>' +
      '</div>' +
      gapNote +
    '</div>';
  },

  // --- Progress Comparison (conditional) ---
  buildProgressComparison(clientId, currentResults) {
    try {
      // Find previous Tool 2 response (not the current one)
      var sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID).getSheetByName('RESPONSES');
      var allData = sheet.getDataRange().getValues();
      var headers = allData[0];
      var toolIdCol = headers.indexOf('Tool_ID');
      var clientCol = headers.indexOf('Client_ID');
      var dataCol = headers.indexOf('Data');
      var isLatestCol = headers.indexOf('Is_Latest');

      var previousResponse = null;
      // Find non-latest tool2 rows for this client (previous submissions)
      for (var i = allData.length - 1; i >= 1; i--) {
        if (allData[i][toolIdCol] === 'tool2' && allData[i][clientCol] === clientId && allData[i][isLatestCol] !== true) {
          try {
            var parsed = JSON.parse(allData[i][dataCol]);
            if (parsed && parsed.results && parsed.results.objectiveHealthScores) {
              previousResponse = parsed.results;
              break;
            }
          } catch(e) { /* skip malformed */ }
        }
      }

      if (!previousResponse) return '';

      var html = '<div class="section-block progress-section"><h2>Progress Since Last Assessment</h2><div class="progress-grid">';
      var self = this;
      this.DOMAINS.forEach(function(d) {
        var prev = previousResponse.objectiveHealthScores[d.key] || 0;
        var curr = currentResults.objectiveHealthScores[d.key] || 0;
        var delta = curr - prev;
        var deltaClass = delta > 0 ? 'positive' : (delta < 0 ? 'negative' : 'neutral');
        var deltaSign = delta > 0 ? '+' : '';
        html += '<div class="progress-item"><span class="progress-domain">' + d.label + '</span><span class="progress-delta ' + deltaClass + '">' + deltaSign + delta + '</span></div>';
      });
      html += '</div></div>';
      return html;
    } catch(e) {
      return '';
    }
  },

  // --- Section 3: Financial Reality (Objective) ---
  buildSection3Objective(objectiveScores, data) {
    var html = '<div class="section-block"><h2>Your Financial Reality</h2>' +
      '<p class="section-intro">These scores are based on standard financial planning benchmarks applied to the numbers you provided.</p>' +
      '<div class="domain-cards">';

    var self = this;
    var benchmarkStandards = Tool2Constants.BENCHMARK_STANDARDS;

    this.DOMAINS.forEach(function(d) {
      var score = objectiveScores[d.key];
      if (score === undefined || score === null) score = 0;
      var label = self.getObjectiveLabel(score);
      var color = self.getScoreColor(score);
      var metric = self.getComputedMetric(d.key, data);

      html += '<div class="domain-card">' +
        '<div class="domain-header"><div class="domain-icon">' + d.icon + '</div><div class="domain-info"><div class="domain-label">' + d.label + '</div><div class="domain-description">' + d.desc + '</div></div></div>' +
        '<div class="domain-score"><div class="score-display"><span class="score-number">' + score + '</span><span class="score-max">/ 100</span></div>' +
        '<div class="level-badge" style="background: ' + color + ';">' + label + '</div></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width: ' + score + '%; background: ' + color + ';"></div></div>' +
        (metric ? '<p class="metric-line">' + metric + '</p>' : '') +
        '<p class="benchmark-standard">' + (benchmarkStandards[d.key] || '') + '</p>' +
      '</div>';
    });

    html += '</div></div>';
    return html;
  },

  getObjectiveLabel(score) {
    if (score >= 75) return 'Strong';
    if (score >= 50) return 'Moderate';
    if (score >= 25) return 'Tight';
    return 'At Risk';
  },

  getScoreColor(score) {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#f97316';
    return '#ef4444';
  },

  getComputedMetric(domain, data) {
    var takeHome = parseFloat(data.monthlyTakeHome) || 0;
    var spending = parseFloat(data.monthlySpending) || 0;
    var debtPay = parseFloat(data.monthlyDebtPayments) || 0;
    var efBal = parseFloat(data.emergencyFundBalance) || 0;
    var liquid = parseFloat(data.liquidSavings) || 0;
    var retContr = parseFloat(data.monthlyRetirementContribution) || 0;

    switch(domain) {
      case 'moneyFlow': {
        if (takeHome <= 0) return 'Savings rate: N/A | Standard: 20%+';
        var rate = Math.round((takeHome - spending) / takeHome * 100);
        return 'Your savings rate: ' + rate + '% | Standard: 20%+';
      }
      case 'obligations': {
        var dti = takeHome > 0 ? Math.round(debtPay / takeHome * 100) : 0;
        var efMonths = spending > 0 ? (efBal / spending).toFixed(1) : '0';
        return 'DTI: ' + dti + '% | EF: ' + efMonths + ' months | Standard: DTI below 36%, EF 3-6 months';
      }
      case 'liquidity': {
        var months = spending > 0 ? (liquid / spending).toFixed(1) : '0';
        return 'Liquid buffer: ' + months + ' months | Standard: 3+ months';
      }
      case 'growth': {
        var base = takeHome > 0 ? takeHome : ((parseFloat(data.grossAnnualIncome) || 0) / 12);
        var retRate = base > 0 ? Math.round(retContr / base * 100) : 0;
        return 'Retirement savings rate: ' + retRate + '% | Standard: 15%+';
      }
      case 'protection':
        return '';
    }
    return '';
  },

  // --- Section 4: Financial Perception (Subjective) ---
  buildSection4Subjective(subjectiveScores, mode) {
    var html = '<div class="section-block"><h2>Your Financial Perception</h2>' +
      '<p class="section-intro">These scores reflect how clear and confident you feel about each domain, based on your self-reported perception.</p>' +
      '<div class="domain-cards">';

    var self = this;
    this.DOMAINS.forEach(function(d) {
      var score = subjectiveScores ? subjectiveScores[d.key] : null;
      if (score === null || score === undefined) {
        html += '<div class="domain-card"><div class="domain-header"><div class="domain-icon">' + d.icon + '</div><div class="domain-info"><div class="domain-label">' + d.label + '</div></div></div><p class="muted">No perception data</p></div>';
        return;
      }
      var clarity = score >= 70 ? 'High clarity' : (score >= 40 ? 'Moderate clarity' : 'Low clarity');
      var color = self.getScoreColor(score);

      html += '<div class="domain-card">' +
        '<div class="domain-header"><div class="domain-icon">' + d.icon + '</div><div class="domain-info"><div class="domain-label">' + d.label + '</div><div class="domain-description">' + clarity + '</div></div></div>' +
        '<div class="domain-score"><div class="score-display"><span class="score-number">' + score + '</span><span class="score-max">/ 100</span></div></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width: ' + score + '%; background: ' + color + ';"></div></div>' +
      '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // --- Section 5: Gap Analysis ---
  buildSection5GapAnalysis(r, winner) {
    var objScores = r.objectiveHealthScores || {};
    var subScores = r.subjectiveScores || {};
    var gapIndexes = r.gapIndexes || {};
    var gapClassifications = r.gapClassifications || {};

    var html = '<div class="section-block"><h2>The Gap Analysis</h2>' +
      '<p class="section-intro">The gap between what your finances actually show and how you perceive them is where psychological patterns most visibly shape your financial life.</p>' +
      '<div class="gap-cards">';

    var self = this;
    this.DOMAINS.forEach(function(d) {
      var obj = objScores[d.key] || 0;
      var sub = subScores[d.key];
      var gap = gapIndexes[d.key];
      var classification = gapClassifications[d.key] || 'UNKNOWN';

      if (sub === null || sub === undefined || gap === null) {
        html += '<div class="gap-card"><div class="gap-header">' + d.icon + ' ' + d.label + '</div><p class="muted">Insufficient data for gap analysis</p></div>';
        return;
      }

      var arrow = gap > 10 ? '↑' : (gap < -10 ? '↓' : '→');
      var gapLabel = self.getGapLabel(classification);
      var gapColor = self.getGapColor(classification);
      var narrative = self.getGapNarrative(d.key, classification, winner, obj, sub);

      html += '<div class="gap-card">' +
        '<div class="gap-header">' + d.icon + ' ' + d.label + '</div>' +
        '<div class="gap-bars">' +
          '<div class="gap-bar-row"><span class="gap-bar-label">Reality</span><div class="gap-bar"><div class="gap-bar-fill obj" style="width: ' + obj + '%;"></div></div><span class="gap-bar-value">' + obj + '</span></div>' +
          '<div class="gap-bar-row"><span class="gap-bar-label">Perception</span><div class="gap-bar"><div class="gap-bar-fill sub" style="width: ' + sub + '%;"></div></div><span class="gap-bar-value">' + sub + '</span></div>' +
        '</div>' +
        '<div class="gap-index" style="color: ' + gapColor + ';">' + arrow + ' Gap: ' + gap + ' (' + gapLabel + ')</div>' +
        '<div class="gap-narrative">' + narrative + '</div>' +
      '</div>';
    });

    html += '</div></div>';
    return html;
  },

  getGapLabel(classification) {
    var labels = {
      'UNDERESTIMATING': 'Underestimating your financial health',
      'SLIGHTLY_UNDER': 'Slightly underestimating',
      'ALIGNED': 'Perception aligned with reality',
      'SLIGHTLY_OVER': 'Slightly overestimating',
      'OVERESTIMATING': 'Overestimating your financial health'
    };
    return labels[classification] || 'Unknown';
  },

  getGapColor(classification) {
    if (classification === 'UNDERESTIMATING' || classification === 'SLIGHTLY_UNDER') return '#10b981';
    if (classification === 'ALIGNED') return '#94a3b8';
    if (classification === 'OVERESTIMATING' || classification === 'SLIGHTLY_OVER') return '#f59e0b';
    return '#94a3b8';
  },

  // Gap narrative templates from design doc Section 7.6
  getGapNarrative(domain, classification, pattern, objScore, subScore) {
    if (classification === 'ALIGNED') {
      return 'Your perception of your ' + this.getDomainLabel(domain) + ' situation closely matches your actual financial position. This alignment is a genuine strength — it means you are seeing this area of your finances clearly, without significant distortion from your psychological patterns.';
    }

    // Pattern-specific narratives for key combinations
    var key = pattern + '_' + domain + '_' + (classification === 'UNDERESTIMATING' || classification === 'SLIGHTLY_UNDER' ? 'UNDER' : 'OVER');
    var specific = this.GAP_NARRATIVE_TEMPLATES[key];
    if (specific) {
      return specific;
    }

    // Fallback
    if (classification === 'UNDERESTIMATING' || classification === 'SLIGHTLY_UNDER') {
      return 'There is a gap between your ' + this.getDomainLabel(domain) + ' reality (' + objScore + '/100) and your perception (' + subScore + '/100). Your financial position is stronger than you feel it is. This type of gap often reflects how your psychological patterns shape what you notice and what you avoid about your finances.';
    }
    return 'There is a gap between your ' + this.getDomainLabel(domain) + ' reality (' + objScore + '/100) and your perception (' + subScore + '/100). Your perception is more confident than your numbers support. This type of gap often reflects how your psychological patterns shape what you notice and what you avoid about your finances.';
  },

  GAP_NARRATIVE_TEMPLATES: {
    // FSV + moneyFlow
    'FSV_moneyFlow_UNDER': 'The False Self-View pattern creates persistent feelings of financial insufficiency even when objective income is adequate. The scarcity feels real even when the numbers do not support it.',
    'FSV_moneyFlow_OVER': 'The False Self-View pattern sometimes produces financial blindness — avoiding looking at actual numbers. If perception feels better than reality, check whether avoidance of income tracking is masking the real picture.',
    // ExVal + moneyFlow
    'ExVal_moneyFlow_UNDER': 'This gap rarely occurs with External Validation — ExVal typically produces overestimation.',
    'ExVal_moneyFlow_OVER': 'The External Validation pattern often produces a performance of financial adequacy. The perception of a strong money flow may reflect a curated narrative rather than actual numbers.',
    // Showing + obligations
    'Showing_obligations_UNDER': 'Habitual financial giving to others depletes savings and increases stress, creating an emotional sense of financial burden even when objective debt levels are manageable.',
    'Showing_obligations_OVER': 'The Showing Love pattern sometimes produces denial about debt accumulation — the emotional focus is on giving, not tracking what you owe.',
    // Control + liquidity
    'Control_liquidity_UNDER': 'The Control pattern drives obsessive awareness of what you have, which can feel exposing rather than reassuring. High clarity plus high stress produces a perception of inadequacy despite adequate reserves.',
    'Control_liquidity_OVER': 'The Control pattern rarely produces overestimation of liquidity — the tracking is usually accurate.',
    // Fear + growth
    'Fear_growth_UNDER': 'The Fear pattern produces avoidance of retirement and investment information — you may have more accumulated than you realize because you avoid looking.',
    'Fear_growth_OVER': 'The Fear pattern can produce a false sense of security through avoidance — not engaging with retirement data means the gaps are not consciously registered.',
    // Receiving + protection
    'Receiving_protection_UNDER': 'The Receiving Love pattern correlates with not accessing available resources, including insurance. You may be more covered than you feel, because accepting coverage requires acknowledging dependency on systems.',
    'Receiving_protection_OVER': 'This gap rarely occurs for the protection domain with the Receiving pattern.'
  },

  getDomainLabel(key) {
    for (var i = 0; i < this.DOMAINS.length; i++) {
      if (this.DOMAINS[i].key === key) return this.DOMAINS[i].label.toLowerCase();
    }
    return key;
  },

  // --- Section 6: Priority Map ---
  buildSection6PriorityMap(priorityList, objectiveScores, winner) {
    if (!priorityList || priorityList.length === 0) return '';

    var html = '<div class="section-block"><h2>Priority Map</h2>' +
      '<p class="section-intro">Domains ranked by urgency, weighted by financial impact.</p>' +
      '<div class="priority-list">';

    var self = this;
    var top3 = priorityList.slice(0, 3);
    top3.forEach(function(item, index) {
      var domainLabel = self.getDomainLabel(item.domain);
      domainLabel = domainLabel.charAt(0).toUpperCase() + domainLabel.slice(1);
      var objScore = objectiveScores ? (objectiveScores[item.domain] || 0) : 0;
      var weight = Tool2Constants.STRESS_WEIGHTS[item.domain] || 1;
      var patternName = self.PATTERN_NAMES[winner] || winner;

      html += '<div class="priority-item">' +
        '<div class="priority-rank">' + (index + 1) + '</div>' +
        '<div class="priority-content">' +
          '<div class="priority-name">' + domainLabel + '</div>' +
          '<p class="priority-reason">Objective score: ' + objScore + '/100 | Stress weight: ' + weight + 'x</p>' +
          '<p class="priority-action">With your ' + patternName + ' pattern, focus on building clarity and structure in this domain to counteract pattern-driven avoidance or distortion.</p>' +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';
    return html;
  },

  // --- Section 7: Pattern Synthesis ---
  buildSection7PatternSynthesis(profile) {
    if (!profile || !profile.winner) return '';

    var html = '<div class="section-block"><h2>Pattern Synthesis</h2>';
    var winnerName = this.PATTERN_NAMES[profile.winner] || profile.winner;

    // Profile type statement
    if (profile.type === 'NEGATIVE_DOMINANT') {
      html += '<div class="profile-box neg-dom">' +
        '<p>Your psychological assessment results show low activation across most financial trauma patterns. This can indicate genuine psychological flexibility, OR it can reflect a suppression dynamic where patterns are present but not consciously recognized. Your financial data from this assessment is the most reliable signal of where attention is needed. Focus on the domain scores above rather than pattern-specific narratives. Your highest relative pattern is ' + winnerName + ', noted briefly below.</p>' +
      '</div>';
    } else if (profile.type === 'BORDERLINE_DUAL') {
      var secondaryName = this.PATTERN_NAMES[profile.secondary] || profile.secondary;
      html += '<div class="profile-box">' +
        '<p>Your responses point to two patterns with closely matched scores: <strong>' + winnerName + '</strong> and <strong>' + secondaryName + '</strong>. See if the descriptions below resonate with your experience.</p>' +
      '</div>';

      // Combination narrative
      var comboKey = [profile.winner, profile.secondary].sort().join('_');
      if (Tool1Templates.COMBINATION_NARRATIVES && Tool1Templates.COMBINATION_NARRATIVES[comboKey]) {
        html += '<div class="combo-narrative"><h3>How These Patterns Interact</h3><p>' + Tool1Templates.COMBINATION_NARRATIVES[comboKey] + '</p></div>';
      }
    } else if (profile.type === 'STRONG_SINGLE') {
      html += '<div class="profile-box">' +
        '<p>Based on your responses, the pattern we most commonly associate with these scores is <strong>' + winnerName + '</strong>.</p>' +
      '</div>';
    } else {
      // MODERATE_SINGLE
      html += '<div class="profile-box">' +
        '<p>Your responses suggest <strong>' + winnerName + '</strong> as a primary pattern to explore. Consider which parts feel familiar and which do not.</p>' +
      '</div>';
    }

    // Strength callouts for LOW patterns
    if (profile.lowPatterns && profile.lowPatterns.length > 0 && profile.type !== 'NEGATIVE_DOMINANT') {
      var strengthStatements = Tool1Templates.STRENGTH_STATEMENTS;
      if (strengthStatements) {
        var hasStrengths = false;
        var strengthHtml = '<div class="strengths-section"><h3>Your Strengths</h3>';
        profile.lowPatterns.forEach(function(p) {
          if (strengthStatements[p]) {
            strengthHtml += '<div class="strength-item"><strong>' + (this.PATTERN_NAMES[p] || p) + ':</strong> ' + strengthStatements[p] + '</div>';
            hasStrengths = true;
          }
        }.bind(this));
        strengthHtml += '</div>';
        if (hasStrengths) html += strengthHtml;
      }
    }

    // Polarity insight
    if (profile.highPatterns && profile.lowPatterns && typeof Tool1Templates.getPolarityInsight === 'function') {
      var polarity = Tool1Templates.getPolarityInsight(profile.highPatterns, profile.lowPatterns);
      if (polarity) {
        html += '<div class="polarity-section"><h3>Polarity Insight</h3><p>' + polarity + '</p></div>';
      }
    }

    html += '</div>';
    return html;
  },

  // --- Section 8: GPT Insights ---
  buildSection8GPTInsights(overallInsight) {
    if (!overallInsight || !overallInsight.overview) return '';

    var html = '<div class="section-block gpt-section"><h2>Personalized Insights</h2>';
    html += '<div class="overview">' + this.formatParagraphs(overallInsight.overview) + '</div>';

    if (overallInsight.topPatterns) {
      html += '<div class="top-patterns"><h3>Key Patterns</h3>' + this.formatBulletList(overallInsight.topPatterns) + '</div>';
    }
    if (overallInsight.priorityActions) {
      html += '<div class="priority-actions"><h3>Your Next Steps</h3>' + this.formatNumberedList(overallInsight.priorityActions) + '</div>';
    }

    html += '</div>';
    return html;
  },

  // --- Section 9: Growth Archetype ---
  buildSection9Archetype(archetype) {
    archetype = archetype || 'Financial Clarity Seeker';
    return '<div class="section-block"><h2>Your Growth Archetype</h2>' +
      '<div class="archetype-card">' +
        '<div class="archetype-name">' + archetype + '</div>' +
        '<p class="archetype-description">' + this.getArchetypeDescription(archetype) + '</p>' +
      '</div>' +
    '</div>';
  },

  // ============================================================
  // LEGACY REPORT (for old-schema data)
  // ============================================================

  buildLegacyReportHTML(clientId, results) {
    var studentName = (results.formData && results.formData.name) ? results.formData.name : 'Student';
    var studentEmail = (results.formData && results.formData.email) ? results.formData.email : '';
    var domainScores = (results.results && results.results.domainScores) ? results.results.domainScores : {};
    var benchmarks = (results.results && results.results.benchmarks) ? results.results.benchmarks : {};
    var archetype = (results.results && results.results.archetype) ? results.results.archetype : 'Financial Clarity Seeker';
    var priorityList = (results.results && results.results.priorityList) ? results.results.priorityList : [];
    var overallInsight = results.overallInsight || {};

    return '<!DOCTYPE html><html><head>' +
      '<title>TruPath - Financial Clarity Report</title>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<style>' + this.getReportStyles() + '</style>' +
      '</head><body>' +
      ReportStyles.getLoadingHTML() +
      '<div class="report-container">' +
        '<div class="report-header">' +
          '<img src="https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw" alt="TruPath Financial Logo" class="logo">' +
          '<h1 class="main-title">Financial Clarity and Values Assessment</h1>' +
          '<p class="student-info">' + studentName + '</p>' +
          (studentEmail ? '<p class="student-email">' + studentEmail + '</p>' : '') +
          '<p class="date">' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>' +
        '</div>' +
        '<div class="report-content">' +
          '<div class="intro-section"><h2>Your Financial Clarity Assessment Results</h2><p>Thank you for completing the Financial Clarity and Values Assessment with TruPath. This report provides insight into your current financial clarity across five key domains.</p></div>' +
          '<div class="archetype-section"><h2>Your Growth Archetype</h2><div class="archetype-card"><div class="archetype-name">' + archetype + '</div><p class="archetype-description">' + this.getArchetypeDescription(archetype) + '</p></div></div>' +
          '<div class="scores-section"><h2>Your Financial Clarity Scores</h2>' + this.buildLegacyDomainCards(domainScores, benchmarks) + '</div>' +
          '<div class="priority-section"><h2>Priority Focus Areas</h2>' + this.buildLegacyPriorityList(priorityList, benchmarks) + '</div>' +
          this.buildSection8GPTInsights(overallInsight) +
          '<div class="footer-section"><h3>Next Steps</h3><p>Use these insights to guide conversations with your financial advisor and to set priorities for improving your financial confidence.</p></div>' +
        '</div>' +
        '<div class="action-buttons">' +
          '<button class="btn-primary" onclick="downloadPDF()">Download PDF Report</button>' +
          '<button class="btn-secondary" onclick="backToDashboard()">Back to Dashboard</button>' +
        '</div>' +
      '</div>' +
      '<script>(function() {' +
        'var clientId = "' + clientId + '";' +
        ReportClientJS.getLoadingFunctions() +
        ReportClientJS.getNavigationFunction() +
        ReportClientJS.getDownloadFunction('generateTool2PDF') +
        ReportClientJS.getBackToDashboard() +
        'window.downloadPDF = downloadPDF;' +
        'window.backToDashboard = backToDashboard;' +
      '})();</script>' +
      FeedbackWidget.render(clientId, 'tool2', 'report') +
      '</body></html>';
  },

  buildLegacyDomainCards(domainScores, benchmarks) {
    var domains = this.DOMAINS;
    var html = '<div class="domain-cards">';
    domains.forEach(function(domain) {
      var benchmark = benchmarks[domain.key] || {};
      var percentage = benchmark.percentage || 0;
      var level = benchmark.level || 'Unknown';
      var raw = benchmark.raw || 0;
      var max = benchmark.max || 100;
      var color = level === 'High' ? '#10b981' : (level === 'Medium' ? '#f59e0b' : '#ef4444');

      html += '<div class="domain-card">' +
        '<div class="domain-header"><div class="domain-icon">' + domain.icon + '</div><div class="domain-info"><div class="domain-label">' + domain.label + '</div><div class="domain-description">' + domain.desc + '</div></div></div>' +
        '<div class="domain-score"><div class="score-display"><span class="score-number">' + raw + '</span><span class="score-max">/ ' + max + '</span></div><div class="level-badge" style="background: ' + color + ';">' + level + '</div></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width: ' + percentage + '%; background: ' + color + ';"></div></div>' +
        '<div class="percentage-label">' + percentage + '%</div>' +
      '</div>';
    });
    html += '</div>';
    return html;
  },

  buildLegacyPriorityList(priorityList, benchmarks) {
    if (!priorityList || priorityList.length === 0) return '<p>Priority analysis not available.</p>';
    var html = '<div class="priority-list">';
    var self = this;
    priorityList.forEach(function(item, index) {
      var label = self.getDomainLabel(item.domain);
      label = label.charAt(0).toUpperCase() + label.slice(1);
      var badge = index === 0 ? '<span class="priority-badge high">Highest Priority</span>' : (index === 1 ? '<span class="priority-badge high">High Priority</span>' : '<span class="priority-badge medium">Medium Priority</span>');
      html += '<div class="priority-item"><div class="priority-rank">' + (index + 1) + '</div><div class="priority-content"><div class="priority-name">' + label + '</div><div class="priority-meta">' + badge + '</div></div></div>';
    });
    html += '</div>';
    return html;
  },

  // ============================================================
  // SHARED HELPERS
  // ============================================================

  getArchetypeDescription(archetype) {
    var descriptions = {
      'Money Flow Optimizer': 'Your primary opportunity for growth lies in optimizing how money moves through your life. Gaining clarity here will reduce daily financial stress and create momentum.',
      'Debt Freedom Builder': 'Your path to financial peace begins with addressing obligations. This foundation will unlock confidence and stability.',
      'Security Seeker': 'Building liquid savings beyond your emergency fund is your key focus. This cushion will provide the peace of mind needed to pursue longer-term goals.',
      'Wealth Architect': 'Your growth stage focuses on investments and retirement planning. With stronger foundations in place, you are ready to build long-term wealth systematically.',
      'Protection Planner': 'Understanding and optimizing your insurance coverage is your priority. Proper protection creates peace of mind and safeguards the financial progress you have made.',
      'Financial Clarity Seeker': 'Your journey involves building clarity across multiple domains. This comprehensive approach will create a strong foundation for long-term financial confidence.'
    };
    return descriptions[archetype] || descriptions['Financial Clarity Seeker'];
  },

  formatParagraphs(text) {
    if (!text) return '';
    return text.split('\n\n').map(function(p) { return '<p>' + p + '</p>'; }).join('');
  },

  formatBulletList(text) {
    if (!text) return '';
    var items = text.split('\n').filter(function(line) { return line.trim().indexOf('-') === 0; });
    return '<ul>' + items.map(function(item) { return '<li>' + item.substring(item.indexOf('-') + 1).trim() + '</li>'; }).join('') + '</ul>';
  },

  formatNumberedList(text) {
    if (!text) return '';
    var items = text.split('\n').filter(function(line) { return /^\d+\./.test(line.trim()); });
    return '<ol>' + items.map(function(item) { return '<li>' + item.replace(/^\d+\.\s*/, '').trim() + '</li>'; }).join('') + '</ol>';
  },

  // ============================================================
  // CSS
  // ============================================================

  getReportStyles() {
    return ReportStyles.getBaseCSS() + ReportStyles.getLoadingCSS() + this.getTool2CSS();
  },

  getTool2CSS() {
    return '\
      .archetype-section { margin: 40px 0; }\
      .archetype-card { background: linear-gradient(135deg, rgba(173, 145, 104, 0.1), rgba(75, 65, 102, 0.1)); border: 2px solid #ad9168; border-radius: 15px; padding: 30px; text-align: center; }\
      .archetype-name { font-size: 28px; font-weight: 700; color: #ad9168; margin-bottom: 15px; }\
      .archetype-description { font-size: 16px; color: #e2e8f0; line-height: 1.6; }\
      .scores-section, .scores-intro { margin: 40px 0; text-align: center; color: #94a3b8; }\
      .domain-cards { display: grid; gap: 20px; }\
      .domain-card { background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(173, 145, 104, 0.3); border-radius: 12px; padding: 20px; }\
      .domain-card:hover { border-color: #ad9168; background: rgba(255, 255, 255, 0.08); }\
      .domain-header { display: flex; align-items: center; margin-bottom: 15px; }\
      .domain-icon { font-size: 32px; margin-right: 15px; }\
      .domain-info { flex: 1; }\
      .domain-label { font-size: 18px; font-weight: 600; color: #fff; }\
      .domain-description { font-size: 13px; color: #94a3b8; margin-top: 2px; }\
      .domain-score { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }\
      .score-display { display: flex; align-items: baseline; }\
      .score-number { font-size: 32px; font-weight: 700; color: #ad9168; }\
      .score-max { font-size: 16px; color: #94a3b8; margin-left: 5px; }\
      .level-badge { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #fff; text-transform: uppercase; }\
      .progress-bar { width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }\
      .progress-fill { height: 100%; border-radius: 4px; }\
      .percentage-label { text-align: right; font-size: 14px; color: #94a3b8; }\
      .priority-section { margin: 40px 0; }\
      .priority-list { margin-top: 20px; }\
      .priority-item { display: flex; align-items: flex-start; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(173, 145, 104, 0.2); border-radius: 10px; padding: 15px; margin-bottom: 12px; }\
      .priority-rank { width: 40px; height: 40px; border-radius: 50%; background: #ad9168; color: #1e192b; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; margin-right: 15px; flex-shrink: 0; }\
      .priority-content { flex: 1; }\
      .priority-name { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 5px; }\
      .priority-meta { display: flex; gap: 10px; flex-wrap: wrap; }\
      .priority-badge { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }\
      .priority-badge.high { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; }\
      .priority-badge.medium { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid #f59e0b; }\
      .priority-badge.low { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid #10b981; }\
      .priority-reason { font-size: 13px; color: #94a3b8; margin: 5px 0; }\
      .priority-action { font-size: 14px; color: #e2e8f0; margin-top: 8px; padding: 10px; background: rgba(173, 145, 104, 0.1); border-left: 3px solid #ad9168; border-radius: 4px; }\
      .overall-insights, .detailed-insights, .gpt-section { margin: 40px 0; padding: 30px; background: linear-gradient(135deg, rgba(30, 25, 43, 0.4), rgba(30, 25, 43, 0.2)); border-radius: 15px; border: 1px solid rgba(173, 145, 104, 0.2); }\
      .overview { margin-bottom: 30px; line-height: 1.8; }\
      .overview p { margin: 15px 0; }\
      .top-patterns h3, .priority-actions h3 { color: #ad9168; font-size: 20px; margin-bottom: 15px; }\
      .top-patterns ul, .priority-actions ol { margin: 15px 0; padding-left: 25px; }\
      .top-patterns li, .priority-actions li { margin: 10px 0; line-height: 1.6; }\
      .insight-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #ad9168; }\
      @media (max-width: 768px) { .archetype-name { font-size: 22px; } }\
    ';
  },

  getNewReportCSS() {
    return '\
      .section-block { margin: 40px 0; }\
      .section-intro { color: #94a3b8; margin-bottom: 20px; font-size: 15px; }\
      .metric-line { font-size: 13px; color: #c4a877; margin: 8px 0 4px 0; }\
      .benchmark-standard { font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 4px; }\
      .scarcity-callout { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; line-height: 1.6; }\
      .scarcity-warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }\
      .scarcity-positive { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; }\
      .scarcity-scores { display: flex; gap: 30px; margin: 20px 0; justify-content: center; }\
      .scarcity-item { text-align: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; min-width: 150px; }\
      .scarcity-label { font-size: 14px; color: #94a3b8; margin-bottom: 8px; }\
      .scarcity-value { font-size: 36px; font-weight: 700; color: #ad9168; }\
      .scarcity-scale { font-size: 11px; color: #666; margin-top: 6px; }\
      .scarcity-gap-note { color: #f59e0b; font-style: italic; margin-top: 10px; }\
      .gap-cards { display: grid; gap: 20px; }\
      .gap-card { background: rgba(255,255,255,0.05); border: 2px solid rgba(173,145,104,0.3); border-radius: 12px; padding: 20px; }\
      .gap-header { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 15px; }\
      .gap-bars { margin: 15px 0; }\
      .gap-bar-row { display: flex; align-items: center; margin-bottom: 8px; }\
      .gap-bar-label { width: 80px; font-size: 13px; color: #94a3b8; }\
      .gap-bar { flex: 1; height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin: 0 10px; }\
      .gap-bar-fill { height: 100%; border-radius: 4px; }\
      .gap-bar-fill.obj { background: #3b82f6; }\
      .gap-bar-fill.sub { background: #6b7280; }\
      .gap-bar-value { width: 30px; font-size: 14px; color: #e0e0e0; text-align: right; }\
      .gap-index { font-size: 16px; font-weight: 600; margin: 12px 0; }\
      .gap-narrative { font-size: 14px; color: #e2e8f0; line-height: 1.7; padding: 12px; background: rgba(173,145,104,0.08); border-radius: 6px; }\
      .profile-box { padding: 20px; background: rgba(173,145,104,0.1); border-radius: 10px; margin-bottom: 20px; line-height: 1.7; }\
      .profile-box.neg-dom { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); }\
      .combo-narrative { padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 15px 0; }\
      .combo-narrative h3 { color: #c4a877; margin-bottom: 10px; }\
      .strengths-section { margin: 20px 0; }\
      .strengths-section h3 { color: #10b981; margin-bottom: 12px; }\
      .strength-item { padding: 12px; background: rgba(16,185,129,0.08); border-radius: 6px; margin-bottom: 8px; line-height: 1.6; color: #e2e8f0; }\
      .polarity-section { margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; }\
      .polarity-section h3 { color: #c4a877; margin-bottom: 10px; }\
      .light-callout { padding: 16px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; margin: 20px 0; color: #93c5fd; text-align: center; }\
      .progress-section { margin: 20px 0; }\
      .progress-grid { display: grid; gap: 10px; }\
      .progress-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.05); border-radius: 8px; }\
      .progress-domain { color: #e2e8f0; font-weight: 500; }\
      .progress-delta { font-weight: 700; font-size: 18px; }\
      .progress-delta.positive { color: #10b981; }\
      .progress-delta.negative { color: #ef4444; }\
      .progress-delta.neutral { color: #94a3b8; }\
      @media (max-width: 600px) { .scarcity-scores { flex-direction: column; align-items: center; } .gap-bar-label { width: 60px; font-size: 11px; } }\
    ';
  }
};
