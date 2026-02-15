# Phase 9: Report Rendering, PDF Generation, and Download Button

## Goal
Assemble the final Integration Report as a print-ready HTML document, convert it to PDF using the existing `PDFGenerator` infrastructure, wire up a "Download Report" button in Section 3, and register the server-side function.

## Prerequisites
- Phases 1-5 complete (detection engines + student view rendering)
- Phase 8 complete (IntegrationGPT narrative engine)

## Files to Read First
- `shared/PDFGenerator.js` — lines 1-127 for common infrastructure (getCommonStyles, buildHeader, buildFooter, htmlToPDF, generateFileName)
- `shared/PDFGenerator.js` — lines 134-215 for `generateTool1PDF` pattern (the simplest example)
- `tools/tool8/Tool8.js` — lines 1440-1476 for download button JavaScript pattern
- `core/CollectiveResults.js` — `_renderSection3()` and `_getScripts()` for where to add button

## What to Add

### 0. Add _checkReportReadiness(summary) to CollectiveResults.js

This function determines whether there is enough meaningful data for a report. Instead of a simple tool count, it runs the detection engines and checks which sections actually produced content. Add this in the detection engine section of CollectiveResults.js (after `_detectBeliefBehaviorGaps`):

```javascript
/**
 * Check whether enough meaningful data exists for an integration report.
 * Instead of a simple "3 tools" gate, this runs the detection engines and
 * counts how many report sections actually have content.
 *
 * The "golden triangle" for a meaningful report is:
 * - Tool 1 (Core Trauma) — required for profile and warnings
 * - At least 1 grounding tool (Tool 3, 5, or 7) — required for locks and gaps
 * - Tool 2 (Financial Clarity) — required for awareness gap and financial context
 *
 * But we also accept reports that have at least 2 populated sections, even
 * without the full triangle (e.g., Tool 1 + grounding gives profile + warnings).
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Object} {
 *   ready: boolean,
 *   sectionCount: number,          // how many sections have data
 *   totalSections: number,          // 5 possible sections
 *   sections: {                     // what is available
 *     profile: boolean,
 *     warnings: boolean,
 *     awarenessGap: boolean,
 *     beliefLocks: boolean,
 *     beliefBehaviorGaps: boolean
 *   },
 *   missing: string[],              // user-friendly list of what is missing and why
 *   analysisData: Object|null       // the pre-computed engine results (to avoid running twice)
 * }
 */
_checkReportReadiness(summary) {
  var result = {
    ready: false,
    sectionCount: 0,
    totalSections: 5,
    sections: {
      profile: false,
      warnings: false,
      awarenessGap: false,
      beliefLocks: false,
      beliefBehaviorGaps: false
    },
    missing: [],
    analysisData: null
  };

  // Run all detection engines (they handle null data gracefully)
  var profile = this._detectProfile(summary);
  var warnings = this._generateWarnings(summary);
  var gap = this._calculateAwarenessGap(summary);
  var locks = this._detectBeliefLocks(summary);
  var bbGaps = this._detectBeliefBehaviorGaps(summary);

  // Check each section
  if (profile) {
    result.sections.profile = true;
    result.sectionCount++;
  } else {
    result.missing.push('Complete Tool 1 (Core Trauma Assessment) to unlock your integration profile');
  }

  if (warnings && warnings.length > 0) {
    result.sections.warnings = true;
    result.sectionCount++;
  } else if (!profile) {
    // Warnings need Tool 1 at minimum
    // Already covered by profile missing message
  } else {
    result.missing.push('Complete a grounding tool (Tool 3, 5, or 7) to detect cross-tool warning patterns');
  }

  if (gap && gap.severity !== 'normal') {
    result.sections.awarenessGap = true;
    result.sectionCount++;
  } else {
    var hasT2 = summary.tools.tool2 && summary.tools.tool2.status === 'completed';
    var hasGrounding = (summary.tools.tool3 && summary.tools.tool3.status === 'completed') ||
                       (summary.tools.tool5 && summary.tools.tool5.status === 'completed') ||
                       (summary.tools.tool7 && summary.tools.tool7.status === 'completed');
    if (!hasT2 && !hasGrounding) {
      result.missing.push('Complete Tool 2 (Financial Clarity) and a grounding tool to calculate your awareness gap');
    } else if (!hasT2) {
      result.missing.push('Complete Tool 2 (Financial Clarity) to calculate your awareness gap');
    } else if (!hasGrounding) {
      result.missing.push('Complete a grounding tool (Tool 3, 5, or 7) to calculate your awareness gap');
    }
    // If both exist but gap is "normal", that is a valid finding — not missing
  }

  if (locks && locks.length > 0) {
    result.sections.beliefLocks = true;
    result.sectionCount++;
  }
  // Locks require specific cross-tool combinations — no simple missing message needed
  // If the engines found no locks, that is a valid result

  if (bbGaps && bbGaps.length > 0) {
    result.sections.beliefBehaviorGaps = true;
    result.sectionCount++;
  }
  // BB Gaps depend on aspect-level data — absence is not necessarily a "missing" thing

  // Store engine results to avoid running them twice
  result.analysisData = {
    profile: profile,
    warnings: warnings,
    awarenessGap: gap,
    locks: locks,
    bbGaps: bbGaps,
    summary: summary
  };

  // Ready if at least 2 sections have content
  result.ready = result.sectionCount >= 2;

  return result;
},
```

**Why 2 sections minimum?** A report with only 1 section (e.g., just a profile) would feel incomplete and not worth the GPT cost. With 2+ sections, there is enough to weave a meaningful narrative. The GPT prompt and fallback templates already handle missing sections gracefully — they only write about what exists.

### 1. Add generateIntegrationPDF(clientId) to PDFGenerator.js

Add this at the end of the `PDFGenerator` object, following the existing `generateToolXPDF` pattern:

```javascript
/**
 * Generate Integration Report PDF
 * Combines detection engine outputs with GPT narrative into a print-ready PDF.
 *
 * Uses _checkReportReadiness() instead of a simple count gate, so it knows
 * WHICH sections have data and can include explanatory text for missing ones.
 *
 * @param {string} clientId - Student ID
 * @returns {Object} {success, pdf, fileName, mimeType} or {success: false, error}
 */
generateIntegrationPDF(clientId) {
  try {
    Logger.log('[PDFGenerator] Generating Integration PDF for ' + clientId);

    // 1. Get student summary and check readiness
    var summary = CollectiveResults.getStudentSummary(clientId);
    var readiness = CollectiveResults._checkReportReadiness(summary);

    if (!readiness.ready) {
      var reason = readiness.sectionCount === 0
        ? 'No integration data available yet. Complete Tool 1 and at least one other tool.'
        : 'Only ' + readiness.sectionCount + ' section available. Complete more tools for a meaningful report.';
      return { success: false, error: reason };
    }

    // Use pre-computed analysis data from readiness check (avoids running engines twice)
    var analysisData = readiness.analysisData;

    // 2. Generate GPT narrative (with 3-tier fallback)
    var narrative = IntegrationGPT.generateNarrative(analysisData);
    Logger.log('[PDFGenerator] Narrative source: ' + narrative.source);

    // 3. Build report HTML — pass readiness so body builder knows which sections to include
    var styles = this.getCommonStyles() + this.getIntegrationStyles();
    var bodyContent = this.buildIntegrationReportBody(clientId, analysisData, narrative, readiness);
    var html = this.buildHTMLDocument(styles, bodyContent);

    // 4. Convert to PDF
    var fileName = this.generateFileName('IntegrationReport', clientId);
    return this.htmlToPDF(html, fileName);

  } catch (error) {
    Logger.log('[PDFGenerator] Integration PDF error: ' + error);
    return { success: false, error: error.toString() };
  }
},

/**
 * Integration Report specific styles (supplements getCommonStyles)
 */
getIntegrationStyles() {
  return '\n' +
    '.profile-card { background: #f8f6f3; border: 2px solid #ad9168; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }\n' +
    '.profile-name { font-size: 22px; font-weight: 700; color: #ad9168; margin: 10px 0; }\n' +
    '.profile-desc { color: #555; line-height: 1.6; max-width: 600px; margin: 0 auto; }\n' +
    '.warning-box { padding: 12px 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid; }\n' +
    '.warning-critical { background: #fef2f2; border-color: #ef4444; }\n' +
    '.warning-high { background: #fffbeb; border-color: #f59e0b; }\n' +
    '.warning-medium { background: #f9fafb; border-color: #9ca3af; }\n' +
    '.lock-box { background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 15px; margin: 10px 0; }\n' +
    '.lock-belief { padding: 4px 0; font-size: 14px; }\n' +
    '.lock-impact { font-size: 13px; color: #666; margin-top: 8px; font-style: italic; }\n' +
    '.gap-visual { background: #f0f9ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin: 15px 0; }\n' +
    '.gap-bar { height: 18px; border-radius: 9px; margin: 6px 0; }\n' +
    '.gap-bar-psych { background: linear-gradient(90deg, #fbbf24, #ef4444); }\n' +
    '.gap-bar-stress { background: linear-gradient(90deg, #10b981, #22c55e); }\n' +
    '.synthesis-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; font-size: 15px; line-height: 1.7; }\n' +
    '.action-list { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px 15px 15px 35px; margin: 15px 0; }\n' +
    '.action-list li { margin: 10px 0; line-height: 1.5; }\n' +
    '.source-tag { display: inline-block; background: #f3f4f6; padding: 3px 10px; border-radius: 10px; font-size: 11px; color: #6b7280; margin-top: 5px; }\n' +
    '.source-tag.gpt { background: #dcfce7; color: #16a34a; }\n' +
    '.section-divider { border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; }\n' +
    '.bb-gap-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0; }\n' +
    '.bb-gap-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; color: #555; font-size: 12px; }\n' +
    '.bb-gap-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; }\n' +
    '@media print { .page-break { page-break-before: always; } }\n';
},

/**
 * Build the report body HTML from analysis data and GPT narrative.
 *
 * INCOMPLETE DATA HANDLING:
 * The readiness object tells us which sections have data. For sections that
 * do NOT have data, we show a brief explanatory box telling the student
 * which tool(s) to complete to unlock that section. This way the report
 * still feels complete even when partial — the student sees what they have
 * AND what they are missing.
 *
 * @param {string} clientId
 * @param {Object} analysisData - detection engine results
 * @param {Object} narrative - GPT or fallback narrative
 * @param {Object} readiness - from _checkReportReadiness() — tells us which sections exist
 */
buildIntegrationReportBody(clientId, analysisData, narrative, readiness) {
  var profile = analysisData.profile;
  var warnings = analysisData.warnings;
  var gap = analysisData.awarenessGap;
  var locks = analysisData.locks;
  var bbGaps = analysisData.bbGaps;
  var sections = readiness.sections;

  var html = '';

  // Header
  html += this.buildHeader('Your Integration Report', clientId);

  // Source tag
  var sourceLabel = narrative.source === 'gpt' ? 'Personalized Analysis' : (narrative.source === 'gpt_retry' ? 'Personalized Analysis' : 'Standard Analysis');
  var sourceClass = narrative.source.indexOf('gpt') !== -1 ? 'gpt' : '';
  html += '<p style="text-align: right;"><span class="source-tag ' + sourceClass + '">' + sourceLabel + '</span></p>';

  // Completion context — let the student know this is based on partial data if applicable
  if (readiness.sectionCount < readiness.totalSections) {
    html += '<div class="intro">' +
      '<p>This report integrates your results across all completed TruPath assessments. It identifies ' +
      'where your psychological patterns are directly affecting your financial behaviors, and gives you ' +
      'specific areas to focus on.</p>' +
      '<p style="color: #ad9168; font-size: 14px;"><strong>Report Coverage: ' +
        readiness.sectionCount + ' of ' + readiness.totalSections + ' sections.</strong> ' +
        'Complete additional tools to unlock the remaining sections and get a more comprehensive analysis.</p>' +
    '</div>';
  } else {
    html += '<div class="intro">' +
      '<p>This report integrates your results across all completed TruPath assessments. It identifies ' +
      'where your psychological patterns are directly affecting your financial behaviors, and gives you ' +
      'specific areas to focus on.</p>' +
    '</div>';
  }

  // --- Section 1: Your Profile ---
  if (sections.profile && profile && narrative.profileNarrative) {
    html += '<h2>Your Integration Profile</h2>';
    html += '<div class="profile-card">';
    html += '<div style="font-size: 2rem;">' + profile.icon + '</div>';
    html += '<div class="profile-name">' + profile.name + '</div>';
    html += '<p class="profile-desc">' + narrative.profileNarrative + '</p>';
    html += '</div>';
  } else if (!sections.profile) {
    html += '<h2>Your Integration Profile</h2>';
    html += this._buildMissingSectionBox(
      'Your integration profile identifies your core psychological-financial pattern.',
      'Complete Tool 1 (Core Trauma Assessment) to unlock this section.'
    );
  }

  // --- Section 2: Awareness Gap ---
  if (sections.awarenessGap && gap && gap.severity !== 'normal' && narrative.gapNarrative) {
    html += '<hr class="section-divider">';
    html += '<h2>Your Awareness Gap</h2>';
    html += '<div class="gap-visual">';
    html += '<p><strong>Psychological Patterns:</strong> ' + gap.psychScore + '/100</p>';
    html += '<div class="gap-bar gap-bar-psych" style="width: ' + gap.psychScore + '%;"></div>';
    html += '<p><strong>Stress Awareness:</strong> ' + gap.stressScore + '/100</p>';
    html += '<div class="gap-bar gap-bar-stress" style="width: ' + gap.stressScore + '%;"></div>';
    html += '<p style="text-align: center; margin-top: 10px;"><strong>Gap: ' + gap.gapScore + ' points</strong></p>';
    html += '</div>';
    html += '<p>' + narrative.gapNarrative + '</p>';
  } else if (!sections.awarenessGap) {
    // Only show the "missing" box if there is a real gap in tool completion
    // If the gap is "normal", that is a good result — no box needed
    var hasGapData = gap && gap.severity === 'normal';
    if (!hasGapData) {
      html += '<hr class="section-divider">';
      html += '<h2>Your Awareness Gap</h2>';
      html += this._buildMissingSectionBox(
        'The awareness gap measures whether you see the full financial impact of your psychological patterns.',
        'Complete Tool 2 (Financial Clarity) and a grounding tool (Tool 3, 5, or 7) to unlock this section.'
      );
    }
  }

  // --- Section 3: Active Warnings ---
  if (sections.warnings && warnings && warnings.length > 0 && narrative.warningNarrative) {
    html += '<hr class="section-divider">';
    html += '<h2>Active Patterns Affecting Your Finances</h2>';
    html += '<p>' + narrative.warningNarrative + '</p>';

    for (var w = 0; w < Math.min(warnings.length, 6); w++) {
      var warning = warnings[w];
      var wClass = 'warning-medium';
      if (warning.priority === 'CRITICAL') wClass = 'warning-critical';
      else if (warning.priority === 'HIGH') wClass = 'warning-high';

      html += '<div class="warning-box ' + wClass + '">';
      html += '<p><strong>' + warning.type.replace(/_/g, ' ') + '</strong></p>';
      html += '<p>' + warning.message + '</p>';
      html += '<p style="font-size: 12px; color: #888;">Based on: ' + warning.sources.join(' + ') + '</p>';
      html += '</div>';
    }
  }
  // No "missing" box for warnings — their absence just means nothing triggered, which is fine

  // --- Section 4: Belief Locks ---
  if (sections.beliefLocks && locks && locks.length > 0 && narrative.lockNarrative) {
    html += '<hr class="section-divider">';
    html += '<div class="page-break"></div>';
    html += '<h2>Your Belief Locks</h2>';
    html += '<p>' + narrative.lockNarrative + '</p>';

    for (var l = 0; l < Math.min(locks.length, 4); l++) {
      var lock = locks[l];
      html += '<div class="lock-box">';
      html += '<p><strong>' + lock.name + '</strong> <span style="color: #888;">(' + lock.strength + ')</span></p>';

      for (var b = 0; b < lock.beliefs.length; b++) {
        var belief = lock.beliefs[b];
        html += '<p class="lock-belief">"' + belief.label + '" — ' + belief.tool + ': ' + belief.score + '/100</p>';
      }

      html += '<p class="lock-impact">' + lock.financialImpact + '</p>';
      html += '</div>';
    }
  }
  // No "missing" box for locks — they require specific cross-tool combos.
  // Absence means no reinforcing patterns detected, which is a valid finding.

  // --- Section 5: Belief-Behavior Gaps ---
  if (sections.beliefBehaviorGaps && bbGaps && bbGaps.length > 0) {
    html += '<hr class="section-divider">';
    html += '<h2>Where Your Beliefs and Actions Diverge</h2>';
    html += '<p style="color: #555; margin-bottom: 12px;">These gaps show where what you believe does not match how you act. The larger the gap, the more internal conflict is present.</p>';

    html += '<table class="bb-gap-table">';
    html += '<tr><th>Belief</th><th>Tool</th><th>Belief Score</th><th>Action Score</th><th>Gap</th><th>Pattern</th></tr>';

    for (var g = 0; g < Math.min(bbGaps.length, 6); g++) {
      var bbGap = bbGaps[g];
      html += '<tr>';
      html += '<td>"' + bbGap.label + '"</td>';
      html += '<td>' + bbGap.tool + '</td>';
      html += '<td>' + bbGap.beliefScore + '</td>';
      html += '<td>' + bbGap.behaviorScore + '</td>';
      html += '<td style="color: #f59e0b; font-weight: 600;">' + bbGap.gap + '</td>';
      html += '<td>' + bbGap.direction + '</td>';
      html += '</tr>';
    }

    html += '</table>';

    if (bbGaps.length > 6) {
      html += '<p style="font-size: 12px; color: #888; text-align: center; margin-top: 8px;">' +
        (bbGaps.length - 6) + ' additional gap' + (bbGaps.length - 6 > 1 ? 's' : '') + ' detected. Speak with your coach for the complete analysis.</p>';
    }
  }
  // No "missing" box for BB gaps — depends on aspect-level data availability.
  // Absence is a valid result (data may not exist, or beliefs and actions are aligned).

  // --- Section 6: Overall Synthesis ---
  if (narrative.overallSynthesis) {
    html += '<hr class="section-divider">';
    html += '<h2>The Big Picture</h2>';
    html += '<div class="synthesis-box">' + narrative.overallSynthesis + '</div>';
  }

  // --- Section 6: Action Items ---
  if (narrative.actionItems && narrative.actionItems.length > 0) {
    html += '<h2>Your Next Steps</h2>';
    html += '<ol class="action-list">';
    for (var a = 0; a < narrative.actionItems.length; a++) {
      html += '<li>' + narrative.actionItems[a] + '</li>';
    }
    html += '</ol>';
  }

  // --- Missing Tools Summary (if any sections were skipped) ---
  if (readiness.missing.length > 0) {
    html += '<hr class="section-divider">';
    html += '<h2>Unlock More Insights</h2>';
    html += '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">';
    html += '<p style="margin-bottom: 10px;">Complete these tools to get a more comprehensive integration report:</p>';
    html += '<ul style="padding-left: 20px;">';
    for (var m = 0; m < readiness.missing.length; m++) {
      html += '<li style="margin: 8px 0; color: #555;">' + readiness.missing[m] + '</li>';
    }
    html += '</ul>';
    html += '</div>';
  }

  // Footer
  html += this.buildFooter('This integration report connects your psychological assessment results to your financial behaviors. Use it as a guide for your coaching conversations and future tool work.');

  return html;
},

/**
 * Helper: Build a "missing section" placeholder box for the PDF report.
 * Shows when a report section cannot be populated because the required tools
 * have not been completed yet.
 *
 * @param {string} description - What this section does
 * @param {string} instruction - What tool(s) to complete
 * @returns {string} HTML
 */
_buildMissingSectionBox(description, instruction) {
  return '<div style="background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0;">' +
    '<p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">' + description + '</p>' +
    '<p style="color: #ad9168; font-size: 13px; font-weight: 500;">' + instruction + '</p>' +
  '</div>';
},
```

### 2. Register Server-Side Function in Code.js

Add alongside the existing `generateTool1PDF`, `generateTool2PDF`, etc.:

```javascript
/**
 * Generate Integration Report PDF
 * Called from the Collective Results page download button
 * @param {string} clientId
 * @returns {Object} {success, pdf, fileName, mimeType}
 */
function generateIntegrationPDF(clientId) {
  return PDFGenerator.generateIntegrationPDF(clientId);
}
```

### 3. Add Download Button to Section 3

In `CollectiveResults.js`, update `_renderSection3()` to include a download button at the bottom of the section (before the closing `</div>`).

**IMPORTANT:** Do NOT call `_checkReportReadiness()` here. The `engines` object (computed at the top of `_renderSection3()`) already has all the data we need. We count populated sections from that instead. `_checkReportReadiness()` is only used on the server side (in `generateIntegrationPDF`) where we do not have the `engines` object.

```javascript
// Add after the last subsection (Phase 5 gaps), before html += '</div>';

// Determine button state from the engines object we already computed
// Count how many report-relevant sections have data
var reportSections = 0;
var reportTotal = 5;
if (engines.profile) reportSections++;
if (engines.warnings && engines.warnings.length > 0) reportSections++;
if (engines.awarenessGap && engines.awarenessGap.severity !== 'normal') reportSections++;
if (engines.locks && engines.locks.length > 0) reportSections++;
if (engines.bbGaps && engines.bbGaps.length > 0) reportSections++;

var reportReady = reportSections >= 2;

if (reportReady) {
  // Enough data — show active download button
  html += '<div style="text-align: center; margin-top: 25px;">' +
    '<button id="integrationReportBtn" class="cr-report-download-btn" onclick="downloadIntegrationReport()">' +
      '📄 Download Integration Report' +
    '</button>' +
    '<p class="muted" style="font-size: 0.8rem; margin-top: 6px;">' +
      reportSections + ' of ' + reportTotal + ' report sections available' +
    '</p>' +
    '<p id="integrationReportMsg" class="muted" style="font-size: 0.8rem; margin-top: 4px; min-height: 1.2em;"></p>' +
  '</div>';
} else {
  // Not enough data — show disabled button with explanation
  html += '<div style="text-align: center; margin-top: 25px;">' +
    '<button class="cr-report-download-btn" disabled style="opacity: 0.4; cursor: not-allowed;">' +
      '📄 Download Integration Report' +
    '</button>' +
    '<p class="muted" style="font-size: 0.8rem; margin-top: 6px;">' +
      'Complete more tools to unlock your integration report.' +
    '</p>' +
  '</div>';
}
```

**Why show the button at all when it is disabled?** It lets the student know the report exists and gives them motivation to complete more tools. A completely hidden button means they would never know the feature is there.

**Why not use `_checkReportReadiness()` here?** That function runs all 5 detection engines internally. But those engines already ran at the top of `_renderSection3()` and their results are in the `engines` object. Calling `_checkReportReadiness()` would double the engine work. The server-side `generateIntegrationPDF()` uses `_checkReportReadiness()` because it runs in a separate request where the engines have not been called yet.

### 4. Add Download Script to _getScripts()

In the `_getScripts()` method, add the download function alongside the existing `viewToolReport` and `goToDashboard`:

```javascript
// Add inside the IIFE, after window.goToDashboard definition
//
// IMPORTANT: clientId must be injected into the script string by _getScripts().
// Use the same pattern as existing scripts that need the student ID.
// Example: 'var clientId = "' + summary.clientId + '";'
// Place this variable declaration BEFORE the function definition below.
var clientId = '` + summary.clientId + `';

window.downloadIntegrationReport = function() {
  var btn = document.getElementById('integrationReportBtn');
  var msg = document.getElementById('integrationReportMsg');
  if (!btn) return;

  btn.textContent = 'Generating Report...';
  btn.disabled = true;
  if (typeof showLoading === 'function') {
    showLoading('Generating Report...', 'Creating your personalized integration PDF');
  }

  google.script.run
    .withSuccessHandler(function(res) {
      if (typeof hideLoading === 'function') hideLoading();
      btn.textContent = '📄 Download Integration Report';
      btn.disabled = false;

      if (res && res.success) {
        var link = document.createElement('a');
        link.href = 'data:application/pdf;base64,' + res.pdf;
        link.download = res.fileName || 'TruPath_IntegrationReport.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (msg) msg.textContent = 'Report downloaded successfully!';
        setTimeout(function() { if (msg) msg.textContent = ''; }, 5000);
      } else {
        if (msg) msg.textContent = 'Report generation failed: ' + (res ? res.error : 'Unknown error');
      }
    })
    .withFailureHandler(function(err) {
      if (typeof hideLoading === 'function') hideLoading();
      btn.textContent = '📄 Download Integration Report';
      btn.disabled = false;
      if (msg) msg.textContent = 'Report generation failed: ' + err.message;
    })
    .generateIntegrationPDF(clientId);
};
```

### 5. Add Button CSS to _getStyles()

```css
/* Integration Report Download Button */
.cr-report-download-btn {
  background: linear-gradient(135deg, rgba(173, 145, 104, 0.2), rgba(75, 65, 102, 0.2));
  border: 1px solid #ad9168;
  color: #ad9168;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.cr-report-download-btn:hover {
  background: linear-gradient(135deg, rgba(173, 145, 104, 0.3), rgba(75, 65, 102, 0.3));
  transform: translateY(-1px);
}

.cr-report-download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

## File Changes Summary

| File | Change |
|------|--------|
| `shared/PDFGenerator.js` | Add `generateIntegrationPDF()`, `getIntegrationStyles()`, `buildIntegrationReportBody()` |
| `Code.js` | Add `generateIntegrationPDF(clientId)` wrapper function |
| `core/CollectiveResults.js` | Add download button HTML to `_renderSection3()`, add download script to `_getScripts()`, add button CSS to `_getStyles()` |

## Test Procedure

1. Open Collective Results as a student with 4+ tools completed
2. Section 3 should now show a "Download Integration Report" button at the bottom
3. Click the button
4. Loading overlay should appear with "Generating Report..."
5. After 5-10 seconds, a PDF should download automatically
6. Open the PDF and verify:
   - TruPath header with student name and date
   - Profile card with name and narrative
   - Awareness Gap with visual bars (if applicable)
   - Warning boxes with color-coded borders
   - Belief lock boxes (if applicable)
   - "The Big Picture" synthesis section
   - Numbered action items
   - Footer with TruPath branding
7. Check the source tag — should say "Personalized Analysis" (GPT) or "Standard Analysis" (fallback)

## Test Edge Cases

**Tool Combination Scenarios:**

| Scenario | Expected Button State | Expected Report |
|----------|-----------------------|-----------------|
| Tool 1 only | Disabled — "Complete more tools" | N/A (only 1 section: profile) |
| Tool 1 + Tool 3 | Active — "2 of 5 sections" | Profile + Warnings (maybe locks) |
| Tool 1 + Tool 2 | Active — "2 of 5 sections" | Profile + Awareness Gap |
| Tool 2 only | Disabled — no profile, limited data | N/A |
| Tool 1 + Tool 3 + Tool 2 | Active — "3-4 of 5 sections" | Profile + Warnings + Gap + possibly locks |
| All 8 tools | Active — "5 of 5 sections" | Full report, all sections populated |
| Tool 3 + Tool 5 (no Tool 1) | Disabled — no profile, only gaps might fire | N/A |
| Tool 1 + all grounding + Tool 2 | Active — "4-5 of 5 sections" | Nearly full report |

**Data Edge Cases:**
- API key missing: Should fall through to Tier 3 fallback, report still generates
- GPT returns malformed response: Should fall through to fallback
- Rapid double-click: Button should disable on first click
- All engines return empty (rare but possible): readiness.ready = false, button disabled
- Gap severity is "normal": Gap section skipped but no "missing" box shown (normal gap is a valid finding)
- No belief locks detected: Lock section skipped, no "missing" box (absence is valid)

**Report Content Checks for Partial Data:**
- Missing sections should show dashed-border placeholder boxes with instructions
- "Unlock More Insights" section at bottom should list specific tools to complete
- "Report Coverage: X of 5 sections" banner should appear at top when not all sections present
- Synthesis and Action Items should still generate even with partial data (GPT and fallback both handle this)

## Performance Notes

- Detection engines: < 1 second (runs on already-loaded data)
- GPT call: 4-6 seconds (single GPT-4o call)
- PDF conversion: 1-2 seconds
- Total: ~6-9 seconds
- Well under the 30-second GAS limit

## Verification Checklist

**Readiness Check:**
- [ ] `_checkReportReadiness()` added to CollectiveResults.js (detection engine section)
- [ ] Returns `ready: true` when 2+ sections have data
- [ ] Returns `ready: false` when 0-1 sections have data
- [ ] `missing` array correctly identifies which tools to complete
- [ ] `analysisData` is populated so engines do not run twice
- [ ] Profile section requires Tool 1
- [ ] Awareness gap requires Tool 2 + grounding tool
- [ ] Locks and BB Gaps absence is treated as valid (no "missing" message)

**PDF Generation:**
- [ ] `generateIntegrationPDF()` added to PDFGenerator.js
- [ ] Uses `_checkReportReadiness()` instead of simple count check
- [ ] Passes `readiness` object to `buildIntegrationReportBody()`
- [ ] `getIntegrationStyles()` includes `.missing-section` styles
- [ ] `_buildMissingSectionBox()` helper added
- [ ] PDF generates correctly for student with all 8 tools
- [ ] PDF generates correctly for student with Tool 1 + Tool 3 only (partial report)
- [ ] Missing section placeholder boxes appear with correct instructions
- [ ] "Report Coverage: X of 5" banner appears when data is partial
- [ ] "Unlock More Insights" section appears at bottom when tools are missing
- [ ] GPT narrative works with sparse data (fewer engine outputs)
- [ ] Fallback narrative works with sparse data
- [ ] Source tag correctly shows "Personalized" vs "Standard"

**Download Button:**
- [ ] Active button appears when readiness.ready is true
- [ ] "X of 5 report sections available" text below active button
- [ ] Disabled button appears when readiness.ready is false
- [ ] "Complete more tools" text below disabled button
- [ ] Loading state shows while generating
- [ ] PDF downloads in browser after generation
- [ ] Success message appears after download
- [ ] Error message appears on failure
- [ ] Button re-enables after download or error
- [ ] Double-click prevention works
- [ ] `generateIntegrationPDF()` wrapper added to Code.js

**GAS Safety:**
- [ ] No `window.location.reload()` anywhere
- [ ] No escaped apostrophes
- [ ] No contractions in report text or missing-section messages
- [ ] PDF looks clean when printed (check @media print rules)
- [ ] Page break before Belief Locks section works
