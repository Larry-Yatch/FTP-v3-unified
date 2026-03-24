# Phase 6: Coach View in Admin Section

## Goal
Give coaches/admins a dedicated "Integration Analysis" page for any student. This shows everything the student sees plus deeper analytics: full warning list, pipeline analysis, complete belief lock map, and coaching recommendations.

## Prerequisites
- Phases 1-3 complete (all detection engines working)
- Phase 4-5 recommended but not strictly required (the coach view renders independently)

## Files to Read First
- `AdminRouter.js` — lines 1-48 (auth pattern), lines 605-781 (handleGetToolReportHTMLRequest pattern)
- `Code.js` — lines 930-952 (getReportPage / getToolPageHtml wrappers)
- `shared/NavigationHelpers.js` — lines 69-115 (getReportPage / getResultsSummaryPage patterns)
- `core/CollectiveResults.js` — the detection engine functions from Phases 1-3

## What to Add

### 1. New Function in CollectiveResults.js: renderCoachIntegrationPage(clientId)

Add this as a new section after the rendering functions:

```javascript
// ============================================================
// COACH VIEW: Full Integration Analysis
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
          html += '<p style="padding-left: 15px;">"' + belief.label + '" — ' + belief.tool + ': <span class="score-inline">' + belief.score + '/100</span></p>';
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

    // Back button
    html += '<div style="text-align: center; margin: 20px 0 40px;">' +
      '<button class="back-btn" onclick="history.back()">Back to Student Detail</button>' +
    '</div>';

    html += '</div></body></html>';
    return html;

  } catch (error) {
    Logger.log('[CoachIntegration] Error: ' + error);
    return '<html><body style="background:#1e192b;color:#fff;font-family:sans-serif;padding:40px;">' +
      '<h1>Error</h1><p>' + error.message + '</p>' +
    '</body></html>';
  }
},
```

### 2. Pipeline Detection Helper (Add to Integration Engines section)

```javascript
/**
 * Detect whether a psychological pipeline is active for this student.
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

    // Pipeline A active when at least one of T3 or T7 is elevated (above 40)
    // Both below 40 = not active enough to form a pipeline
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

    // Pipeline B active when at least one of T3 or T5 is elevated (above 40)
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
```

### 3. New Handler in AdminRouter.js

Add this after `handleGetToolReportHTMLRequest()` (around line 781):

```javascript
/**
 * Handle coach integration analysis request
 * Returns full integration analysis HTML for a student
 */
function handleGetIntegrationAnalysisRequest(clientId) {
  console.log('[INTEGRATION_ANALYSIS] Request received for', clientId);

  if (!isAdminAuthenticated()) {
    console.log('[INTEGRATION_ANALYSIS] Not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    var html = CollectiveResults.renderCoachIntegrationPage(clientId);
    return { success: true, html: html };
  } catch (error) {
    console.error('[INTEGRATION_ANALYSIS] Error:', error);
    return { success: false, error: error.toString() };
  }
}
```

### 4. ~~New Wrapper in Code.js~~ — NOT NEEDED

**Note:** A `getIntegrationAnalysisPage(clientId)` wrapper in Code.js is NOT needed for this phase. The admin button calls `handleGetIntegrationAnalysisRequest(clientId)` from AdminRouter.js directly via `google.script.run`, which returns `{ success, html }`. The button handler then uses `document.write()` to render the HTML.

The `getIntegrationAnalysisPage` pattern (returning raw HTML for `getReportPage`-style navigation) would only be needed if we routed through `NavigationHelpers.js`, but we do not — the coach view uses its own button with its own `google.script.run` call.

### 5. Add Button to Admin Student Detail View

The admin student detail area is rendered via `handleGetStudentToolsRequest()` in AdminRouter.js. That function returns tool data as JSON, and the admin frontend renders it as tool cards with "View Report" buttons.

**How to find the exact insertion point:**

1. Open `AdminRouter.js`
2. Search for `handleGetStudentToolsRequest` — this is the server function that returns tool data for a specific student
3. Search for `handleGetToolReportHTMLRequest` — this is the function that the existing "View Report" buttons call. The **frontend JavaScript** that calls this function is where you need to add the new button logic.
4. In the admin frontend HTML template (rendered by `AdminRouter.js`), look for the section that loops through tool cards and creates "View Report" buttons. It will look something like:
   ```javascript
   // Pattern to search for in AdminRouter.js HTML template:
   // - A loop over tool cards or tool results
   // - Calls to handleGetToolReportHTMLRequest
   // - Buttons labeled "View Report" or similar
   ```
5. The `clientId` variable is already available in this template — it is the student ID that was used to load the student detail page. Search for how `handleGetStudentToolsRequest` is called from the frontend to find the variable name used for the student ID.

**Add this JavaScript function** to the admin frontend `<script>` section (the same `<script>` block that contains the "View Report" button handler):

```javascript
function viewIntegrationAnalysis(clientId) {
  // Show loading
  if (typeof showLoading === 'function') showLoading('Loading Analysis...');

  google.script.run
    .withSuccessHandler(function(result) {
      if (result && result.success && result.html) {
        document.open();
        document.write(result.html);
        document.close();
        window.scrollTo(0, 0);
      } else {
        if (typeof hideLoading === 'function') hideLoading();
        alert('Error: ' + (result ? result.error : 'Unknown error'));
      }
    })
    .withFailureHandler(function(err) {
      if (typeof hideLoading === 'function') hideLoading();
      alert('Error loading analysis: ' + err.message);
    })
    .handleGetIntegrationAnalysisRequest(clientId);
}
```

**Add the button HTML** — place it AFTER the tool cards loop, BEFORE the "Back" button. This way the Integration Analysis button appears below all individual tool cards as a summary-level action (not per-tool):

```html
<!-- Place after the tool card loop ends, before the back/nav button -->
<div style="text-align: center; margin: 20px 0;">
  <button onclick="viewIntegrationAnalysis('CLIENT_ID_VARIABLE')"
          style="padding: 10px 20px; background: linear-gradient(135deg, rgba(173,145,104,0.3), rgba(75,65,102,0.3)); border: 1px solid #ad9168; color: #ad9168; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
    🔬 View Integration Analysis
  </button>
</div>
```

**Replace `CLIENT_ID_VARIABLE`** with the actual JavaScript variable that holds the student ID in that template. This is the same variable passed to `handleGetStudentToolsRequest` when loading the page.

**Implementation checklist for this section:**
- [ ] Found the admin frontend `<script>` block in `AdminRouter.js`
- [ ] Identified the student ID variable name used in that template
- [ ] Added `viewIntegrationAnalysis()` function to the `<script>` block
- [ ] Added button HTML after the tool cards, before the back button
- [ ] Replaced `CLIENT_ID_VARIABLE` with the actual variable name
- [ ] Button uses `document.write()` navigation pattern (not `window.location`)

## Test Procedure

1. Log into the admin section
2. Navigate to a student who has 3+ tools completed
3. Click "View Integration Analysis"
4. **You should see:**
   - Header with student ID and tool count
   - Integration Profile with confidence level
   - Awareness Gap with raw scores
   - Pipeline Analysis (A and B)
   - Full list of ALL warnings (not capped at 4)
   - Full list of ALL belief locks with strength scores
   - Full belief-behavior gap table
5. Click "Back to Student Detail" — should return to admin
6. Test with a student who has 0 tools — should show "No Data Available"
7. Verify non-admin cannot access (log out, try direct function call)

## Verification Checklist

- [ ] `handleGetIntegrationAnalysisRequest()` checks `isAdminAuthenticated()` before proceeding
- [ ] Coach page renders all warnings (no max 4 cap)
- [ ] Coach page shows pipeline analysis
- [ ] Coach page shows full lock map with strength scores
- [ ] Coach page shows full gap table with all columns
- [ ] "Back" button works
- [ ] "No Data Available" page shows for students with 0 tools
- [ ] Students with 1 tool show analysis page (engines gracefully handle missing data)
- [ ] No `window.location.reload()` — uses `document.write()` pattern
- [ ] No escaped apostrophes in template strings
- [ ] No contractions in generated messages
- [ ] Auth check prevents unauthorized access
- [ ] Page is self-contained (does not depend on external CSS files the admin may not have loaded)
