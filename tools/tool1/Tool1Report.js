/**
 * Tool1Report.js
 * Generates the assessment report page and PDF download
 *
 * Report structure (7 sections):
 *   1. Header (name, email, date)
 *   2. Your Profile Type (STRONG_SINGLE / BORDERLINE_DUAL / MODERATE_SINGLE / NEGATIVE_DOMINANT)
 *   3. Your Psychological Patterns (primary + secondary if dual)
 *   4. Pattern Tensions & Combinations (conditional)
 *   5. Your Strengths (LOW pattern callouts)
 *   6. Polarity Insight (conditional)
 *   7. All Pattern Scores (score cards grid)
 */

const Tool1Report = {

  /** Human-readable names for pattern keys */
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
   * @param {string} clientId - Client ID
   * @returns {HtmlOutput} Report page
   */
  render(clientId) {
    try {
      // Get saved results from RESPONSES sheet
      const results = this.getResults(clientId);

      if (!results) {
        return HtmlService.createHtmlOutput(
          '<h1>Error</h1>' +
          '<p>No assessment results found for client ' + clientId + '</p>' +
          '<a href="' + ScriptApp.getService().getUrl() + '?route=dashboard&client=' + clientId + '">Back to Dashboard</a>'
        );
      }

      // Get template for winner category
      const template = Tool1Templates.getTemplate(results.winner);

      if (!template) {
        return HtmlService.createHtmlOutput(
          '<h1>Error</h1>' +
          '<p>Template not found for category: ' + results.winner + '</p>'
        );
      }

      // Build report HTML
      const reportHtml = this.buildReportHTML(clientId, results, template);

      return HtmlService.createHtmlOutput(reportHtml)
        .setTitle('TruPath - Core Trauma Strategy Report')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      LogUtils.error('Error rendering report: ' + error);
      return HtmlService.createHtmlOutput(
        '<h1>Error</h1>' +
        '<p>' + error.toString() + '</p>'
      );
    }
  },

  /**
   * Get assessment results from RESPONSES sheet
   * Includes backward compatibility: computes profileType if absent
   */
  getResults(clientId) {
    return ReportBase.getResults(clientId, 'tool1', function(resultData, cId) {
      var profileType = resultData.profileType;

      // Backward compatibility: compute profileType on-the-fly if absent
      if (!profileType && resultData.scores && resultData.winner) {
        profileType = Tool1.detectProfileType(resultData.scores, resultData.winner);
        LogUtils.debug('Tool1Report: computed profileType on-the-fly for ' + cId);
      }

      return {
        clientId: cId,
        winner: resultData.winner,
        scores: resultData.scores,
        formData: resultData.formData,
        profileType: profileType || null
      };
    });
  },

  /**
   * Build complete report HTML with 8-section structure
   */
  buildReportHTML(clientId, results, template) {
    var studentName = (results.formData && results.formData.name) || 'Student';
    var studentEmail = (results.formData && results.formData.email) || '';
    var profile = results.profileType;
    var scores = results.scores;
    var winner = results.winner;
    var self = this;

    return '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
        '<title>TruPath - Core Trauma Strategy Report</title>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<meta name="theme-color" content="#1e192b">' +
        '<style>' + this.getReportStyles() + '</style>' +
      '</head>' +
      '<body>' +
        ReportStyles.getLoadingHTML() +
        '<div class="report-container">' +

          // === SECTION 1: Header ===
          this.buildHeaderSection(studentName, studentEmail) +

          '<div class="report-content">' +

            // === SECTION 2: Your Profile Type ===
            this.buildProfileTypeSection(profile, scores, winner) +

            // === SECTION 3: Your Psychological Patterns ===
            this.buildPatternsSection(profile, template, winner) +

            // === SECTION 4: Pattern Tensions & Combinations ===
            this.buildCombinationsSection(profile) +

            // === SECTION 5: Your Strengths ===
            this.buildStrengthsSection(profile) +

            // === SECTION 6: Polarity Insight ===
            this.buildPolaritySection(profile) +

            // === SECTION 7: All Pattern Scores ===
            this.buildScoresSection(scores, winner, profile) +

            // === Footer ===
            '<div class="footer-section">' +
              Tool1Templates.commonFooter +
            '</div>' +

          '</div>' +

          // === Action Buttons ===
          '<div class="action-buttons">' +
            '<button class="btn-primary" onclick="downloadPDF()">Download PDF Report</button>' +
            '<button class="btn-secondary" onclick="backToDashboard()">Back to Dashboard</button>' +
          '</div>' +

          '<p style="text-align: center; color: #999; font-size: 14px; margin-top: 10px;">' +
            'To edit your responses, return to the dashboard and click "Edit Answers"' +
          '</p>' +

        '</div>' +

        '<script>' +
          '(function() {' +
            'var clientId = "' + clientId + '";' +
            ReportClientJS.getLoadingFunctions() +
            ReportClientJS.getNavigationFunction() +
            ReportClientJS.getDownloadFunction('generateTool1PDF') +
            ReportClientJS.getBackToDashboard() +
            'window.downloadPDF = downloadPDF;' +
            'window.backToDashboard = backToDashboard;' +
          '})();' +
        '</script>' +

      '</body>' +
      '</html>';
  },

  // =========================================================================
  // Section builders
  // =========================================================================

  /** Section 1: Header */
  buildHeaderSection(studentName, studentEmail) {
    var dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return '<div class="report-header">' +
      '<img src="https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw" alt="TruPath Financial Logo" class="logo">' +
      '<h1 class="main-title">Core Trauma Strategy Assessment</h1>' +
      '<p class="student-info">' + studentName + '</p>' +
      (studentEmail ? '<p class="student-email">' + studentEmail + '</p>' : '') +
      '<p class="date">' + dateStr + '</p>' +
    '</div>';
  },

  /** Section 2: Profile Type */
  buildProfileTypeSection(profile, scores, winner) {
    if (!profile) return '';

    var winnerName = this.PATTERN_NAMES[winner] || winner;
    var html = '<div class="profile-type-section">';

    if (profile.type === 'STRONG_SINGLE') {
      var secondKey = this.getSecondHighest(scores, winner);
      var secondName = this.PATTERN_NAMES[secondKey] || secondKey;
      html += '<h2>Your Profile Type</h2>' +
        '<div class="profile-callout profile-strong">' +
          '<p>Based on your responses, the pattern we most commonly associate with these scores is <strong>' + winnerName + '</strong>. ' +
          'Your score of ' + scores[winner] + ' is notably higher than your next-highest score ' +
          '(' + secondName + ' at ' + scores[secondKey] + '). In our experience, this kind of gap often suggests this pattern may be worth exploring further.</p>' +
        '</div>';

    } else if (profile.type === 'BORDERLINE_DUAL') {
      var secondaryName = this.PATTERN_NAMES[profile.secondary] || profile.secondary;
      html += '<h2>Your Profile Type</h2>' +
        '<div class="profile-callout profile-dual">' +
          '<p>Your responses point to two patterns with closely matched scores: <strong>' + winnerName + '</strong> (' + scores[winner] + ') ' +
          'and <strong>' + secondaryName + '</strong> (' + scores[profile.secondary] + '). ' +
          'When we see two patterns this close, it often suggests both may be playing a role. The interplay between them is described below \u2014 see if it resonates with your experience.</p>' +
        '</div>';

    } else if (profile.type === 'MODERATE_SINGLE') {
      html += '<h2>Your Profile Type</h2>' +
        '<div class="profile-callout profile-moderate">' +
          '<p>Your responses suggest <strong>' + winnerName + '</strong> as a primary pattern to explore. ' +
          'The description below reflects what we commonly see with this pattern \u2014 consider which parts feel familiar and which do not.</p>' +
        '</div>';

    } else if (profile.type === 'NEGATIVE_DOMINANT') {
      html += '<h2>Your Profile Type</h2>' +
        '<div class="profile-callout profile-negative">' +
          Tool1Templates.NEGATIVE_DOMINANT_INTRO(winnerName, scores[winner]) +
        '</div>';
    }

    html += '</div>';
    return html;
  },

  /** Section 3: Psychological Patterns (primary + secondary if dual) */
  buildPatternsSection(profile, template, winner) {
    if (!profile) {
      // Fallback: render old-style intro + winner template
      return '<div class="intro-section">' +
          '<h2>Thank you for completing the Core Trauma Strategies Assessment with TruPath.</h2>' +
          Tool1Templates.commonIntro +
        '</div>' +
        '<div class="strategy-section">' +
          template.content +
        '</div>';
    }

    var html = '';

    if (profile.type === 'NEGATIVE_DOMINANT') {
      // Condensed winner section with caveat
      html += '<div class="strategy-section strategy-condensed">' +
        '<p class="condensed-note"><em>Note: The following reflects your relative tendency rather than a dominant pattern.</em></p>' +
        template.content +
      '</div>';

    } else {
      // Common intro
      html += '<div class="intro-section">' +
        '<h2>Thank you for completing the Core Trauma Strategies Assessment with TruPath.</h2>' +
        Tool1Templates.commonIntro +
      '</div>';

      // Primary pattern (full template)
      html += '<div class="strategy-section">' +
        template.content +
      '</div>';

      // Secondary pattern (if BORDERLINE_DUAL)
      if (profile.type === 'BORDERLINE_DUAL' && profile.secondary) {
        var secondaryTemplate = Tool1Templates.getTemplate(profile.secondary);
        if (secondaryTemplate) {
          html += '<div class="strategy-section strategy-secondary">' +
            '<h2>Your Secondary Pattern</h2>' +
            secondaryTemplate.content +
          '</div>';
        }
      }
    }

    return html;
  },

  /** Section 4: Pattern Tensions & Combinations */
  buildCombinationsSection(profile) {
    if (!profile) return '';

    var narratives = [];

    if (profile.type === 'BORDERLINE_DUAL' && profile.secondary) {
      // Get combination narrative for the pair
      var key = this.getCombinationKey(profile.winner, profile.secondary);
      if (key && Tool1Templates.COMBINATION_NARRATIVES[key]) {
        narratives.push(Tool1Templates.COMBINATION_NARRATIVES[key]);
      }
    } else if (profile.highPatterns && profile.highPatterns.length >= 2) {
      // Multiple HIGH patterns (non-borderline): render relevant combinations
      var highs = profile.highPatterns;
      for (var i = 0; i < highs.length; i++) {
        for (var j = i + 1; j < highs.length; j++) {
          var key = this.getCombinationKey(highs[i], highs[j]);
          if (key && Tool1Templates.COMBINATION_NARRATIVES[key]) {
            narratives.push(Tool1Templates.COMBINATION_NARRATIVES[key]);
          }
        }
      }
    }

    if (narratives.length === 0) return '';

    var html = '<div class="combination-section">' +
      '<h2>Pattern Tensions and Combinations</h2>';

    for (var n = 0; n < narratives.length; n++) {
      html += '<div class="combination-narrative">' +
        '<p>' + narratives[n] + '</p>' +
      '</div>';
    }

    html += '</div>';
    return html;
  },

  /** Section 5: Your Strengths (LOW pattern callouts) */
  buildStrengthsSection(profile) {
    if (!profile || !profile.lowPatterns || profile.lowPatterns.length === 0) return '';

    // For negative-dominant profiles, skip strengths section (it would list too many)
    if (profile.type === 'NEGATIVE_DOMINANT') return '';

    var html = '<div class="strengths-section">' +
      '<h2>Patterns You Do Not Show: Your Financial Strengths</h2>' +
      '<p class="strengths-intro">Low scores on a pattern indicate that the associated behaviors are largely absent from your financial life. These are meaningful positive signals.</p>';

    for (var i = 0; i < profile.lowPatterns.length; i++) {
      var pattern = profile.lowPatterns[i];
      var statement = Tool1Templates.STRENGTH_STATEMENTS[pattern];
      if (statement) {
        html += '<div class="strength-card">' +
          '<h3>' + (this.PATTERN_NAMES[pattern] || pattern) + '</h3>' +
          '<p>' + statement + '</p>' +
        '</div>';
      }
    }

    html += '</div>';
    return html;
  },

  /** Section 6: Polarity Insight */
  buildPolaritySection(profile) {
    if (!profile) return '';

    var insight = Tool1Templates.getPolarityInsight(profile);
    if (!insight) return '';

    return '<div class="polarity-section">' +
      '<h2>Polarity Insight</h2>' +
      '<div class="polarity-callout">' +
        '<p>' + insight + '</p>' +
      '</div>' +
    '</div>';
  },

  /** Section 7: All Pattern Scores */
  buildScoresSection(scores, winner, profile) {
    var patterns = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
    var self = this;

    var html = '<div class="scores-section">' +
      '<h3>Raw Scores</h3>' +
      '<p class="scores-intro">The higher numbers indicate stronger strategies used by your subconscious.<br>' +
      'The raw scores range from -25 to 25.</p>' +
      '<div class="scores-grid">';

    for (var i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      var isWinner = (winner === p);
      var classification = '';
      if (profile && profile.classified) {
        classification = profile.classified[p] || '';
      }

      html += '<div class="score-card' + (isWinner ? ' winner' : '') + '">' +
        '<div class="score-label">' + self.PATTERN_NAMES[p] + '</div>' +
        '<div class="score-value">' + scores[p] + '</div>' +
        (classification ? '<div class="score-classification classification-' + classification.toLowerCase() + '">' + classification + '</div>' : '') +
      '</div>';
    }

    html += '</div>';

    // Threshold explanation note
    html += '<p class="scores-note">Scores classified as <strong>HIGH</strong> indicate strong pattern activation. ' +
      'Scores classified as <strong>LOW</strong> indicate the pattern is largely absent \u2014 a positive signal.</p>';

    html += '</div>';
    return html;
  },

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Get the second-highest scoring pattern
   */
  getSecondHighest(scores, winner) {
    var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i][0] !== winner) return sorted[i][0];
    }
    return sorted[1] ? sorted[1][0] : winner;
  },

  /**
   * Get alphabetically-sorted combination key for two patterns
   * Returns null if no narrative exists for this pair
   */
  getCombinationKey(pattern1, pattern2) {
    var sorted = [pattern1, pattern2].sort();
    var key = sorted[0] + '_' + sorted[1];
    return key;
  },

  // =========================================================================
  // Styles
  // =========================================================================

  /**
   * CSS styles for report (base from ReportStyles + Tool1-specific)
   */
  getReportStyles() {
    return ReportStyles.getBaseCSS() + ReportStyles.getLoadingCSS() + this.getTool1CSS();
  },

  /**
   * Tool1-specific CSS
   */
  getTool1CSS() {
    return `
      .strategy-section {
        background: rgba(173, 145, 104, 0.05);
        padding: 30px;
        border-radius: 15px;
        border: 1px solid rgba(173, 145, 104, 0.2);
        margin: 30px 0;
      }

      .strategy-secondary {
        border-style: dashed;
      }

      .strategy-condensed {
        opacity: 0.9;
      }

      .condensed-note {
        color: #ad9168;
        font-size: 15px;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(173, 145, 104, 0.2);
      }

      /* Profile type callouts */
      .profile-type-section {
        margin: 30px 0;
      }

      .profile-callout {
        padding: 25px 30px;
        border-radius: 15px;
        margin: 15px 0 30px 0;
        line-height: 1.8;
      }

      .profile-strong {
        background: rgba(173, 145, 104, 0.1);
        border-left: 4px solid #ad9168;
      }

      .profile-dual {
        background: rgba(173, 145, 104, 0.08);
        border-left: 4px solid #c4a877;
      }

      .profile-moderate {
        background: rgba(173, 145, 104, 0.06);
        border-left: 4px solid rgba(173, 145, 104, 0.5);
      }

      .profile-negative {
        background: rgba(148, 163, 184, 0.08);
        border-left: 4px solid #94a3b8;
      }

      /* Combination narratives */
      .combination-section {
        margin: 40px 0;
      }

      .combination-narrative {
        background: rgba(173, 145, 104, 0.06);
        padding: 25px 30px;
        border-radius: 12px;
        border: 1px solid rgba(173, 145, 104, 0.15);
        margin: 20px 0;
        line-height: 1.8;
      }

      /* Strengths section */
      .strengths-section {
        margin: 40px 0;
      }

      .strengths-intro {
        color: #94a3b8;
        margin-bottom: 20px;
      }

      .strength-card {
        background: rgba(34, 197, 94, 0.06);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 12px;
        padding: 20px 25px;
        margin: 15px 0;
      }

      .strength-card h3 {
        color: #4ade80;
        font-size: 16px;
        margin-bottom: 8px;
      }

      .strength-card p {
        color: #cbd5e1;
        line-height: 1.7;
      }

      /* Polarity insight */
      .polarity-section {
        margin: 40px 0;
      }

      .polarity-callout {
        background: rgba(139, 92, 246, 0.06);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-left: 4px solid #8b5cf6;
        border-radius: 12px;
        padding: 25px 30px;
        line-height: 1.8;
      }

      /* Score classification badges */
      .score-classification {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        margin-top: 8px;
        padding: 3px 10px;
        border-radius: 12px;
        display: inline-block;
      }

      .classification-high {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      .classification-moderate {
        background: rgba(234, 179, 8, 0.15);
        color: #facc15;
      }

      .classification-low {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
      }

      /* Scores section */
      .scores-section {
        margin: 40px 0;
      }

      .scores-intro {
        text-align: center;
        margin: 20px 0;
        color: #94a3b8;
      }

      .scores-note {
        text-align: center;
        font-size: 14px;
        color: #94a3b8;
        margin-top: 15px;
      }

      .scores-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }

      .score-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(173, 145, 104, 0.3);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s;
      }

      .score-card.winner {
        background: rgba(173, 145, 104, 0.15);
        border-color: #ad9168;
        box-shadow: 0 0 20px rgba(173, 145, 104, 0.3);
      }

      .score-label {
        font-size: 14px;
        color: #94a3b8;
        margin-bottom: 10px;
      }

      .score-value {
        font-size: 36px;
        font-weight: 700;
        color: #ad9168;
      }

      .score-card.winner .score-value {
        color: #c4a877;
        font-size: 42px;
      }

      @media (max-width: 768px) {
        .scores-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
};
