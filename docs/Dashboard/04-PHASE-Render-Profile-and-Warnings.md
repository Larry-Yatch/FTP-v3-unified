# Phase 4: Render Profile Card and Warning Cards

## Goal
This is where students start seeing real content. Replace the Section 3 placeholder with the profile card and warning cards. The belief locks and gap sections will be added in Phase 5.

## Prerequisites
- Phases 1-3 complete (all five detection engines working and tested)

## Files to Read First
- `core/CollectiveResults.js` — current `_renderSection3()` (line ~326) — this is what we replace
- `core/CollectiveResults.js` — `_getStyles()` (line ~797) — where to add new CSS
- `core/CollectiveResults.js` — existing card patterns for consistent styling (e.g. `_renderTool1Card`, `cr-tool-card`, `cr-winner-badge`)

## What to Change

### 1. Replace _renderSection3(summary)

Delete the current placeholder (lines 326-348) and replace with:

```javascript
_renderSection3(summary) {
  // Run ALL detection engines once upfront. This avoids running them multiple
  // times — Phase 5 will use these stored results for locks/gaps, and Phase 9
  // will use them for the report readiness check and download button.
  //
  // PERFORMANCE: All engines operate on the already-loaded summary object
  // (no API calls), so running all 5 costs < 100ms total. But we still
  // avoid redundant calls by computing once and passing results around.

  var engines = {
    profile: this._detectProfile(summary),
    warnings: this._generateWarnings(summary),
    // Phase 5 will uncomment these:
    // awarenessGap: this._calculateAwarenessGap(summary),
    // locks: this._detectBeliefLocks(summary),
    // bbGaps: this._detectBeliefBehaviorGaps(summary)
  };

  // Check if we have anything to show
  var hasProfile = engines.profile !== null;
  var hasWarnings = engines.warnings && engines.warnings.length > 0;

  if (!hasProfile && !hasWarnings) {
    // No engine produced content. Show placeholder if they have at least 1 tool,
    // or nothing at all if they have 0 tools.
    //
    // NOTE: This completedCount check is a SECONDARY GUARD — it only controls
    // whether we show the "Almost there" placeholder vs returning empty string.
    // The PRIMARY content gate is above: the engines object. If engines produce
    // nothing (no profile AND no warnings), we never show Section 3 content
    // regardless of how many tools are completed. This is intentional — a student
    // with 3 financial tools (T2+T4+T6) but no Tool 1 will land here because
    // the engines need Tool 1 data to produce a profile.
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

  // Build Section 3 HTML
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

  // Placeholder for Phase 5 additions (locks + gaps)
  // Phase 5: Uncomment the 3 engine calls above, then use engines.awarenessGap,
  // engines.locks, engines.bbGaps here instead of calling the engines again.

  // Placeholder for Phase 9 download button
  // Phase 9: Use the engines object to build readiness check without re-running.

  html += '</div>';
  return html;
},
```

**Key design decision — the `engines` object:** All detection engine results are computed once at the top of `_renderSection3()` and stored in a local `engines` variable. Phase 5 will uncomment the 3 additional engine calls and use `engines.awarenessGap`, `engines.locks`, `engines.bbGaps` directly. Phase 9 will use these same results for the download button instead of calling `_checkReportReadiness()` (which would re-run all engines). This means:

- **Phase 4:** Runs `_detectProfile` + `_generateWarnings` (2 engines)
- **Phase 5:** Uncomments `_calculateAwarenessGap` + `_detectBeliefLocks` + `_detectBeliefBehaviorGaps` (all 5 engines, but only once)
- **Phase 9:** Uses the already-computed `engines` object to determine button state (no extra engine calls)
- **Net result:** Engines run exactly once per page load, regardless of how many features are added

The `_checkReportReadiness()` function from Phase 9 is still used on the **server side** (in `generateIntegrationPDF`) because that is a separate request — not part of the page render. On the client side, Phase 9 will compute readiness from the `engines` object directly.

### 2. Add _renderProfileCard(profile)

Add this right after `_renderSection3` (stays in the rendering section, not the engine section):

```javascript
/**
 * Render the Integration Profile card — 3A
 * Shows the student's assigned profile name and description.
 *
 * @param {Object|null} profile - from _detectProfile()
 * @returns {string} HTML
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
```

### 3. Add _renderWarningCards(warnings)

```javascript
/**
 * Render warning cards — 3B
 * Shows up to 4 highest-priority warnings with color-coded borders.
 *
 * @param {Array} warnings - from _generateWarnings(), already sorted
 * @returns {string} HTML
 */
_renderWarningCards(warnings) {
  // Student view: max 4 warnings
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
      (warnings.length - 4) + ' additional pattern' + (warnings.length - 4 > 1 ? 's' : '') + ' detected. Speak with your coach for the complete analysis.' +
    '</p>';
  }

  html += '</div>';
  return html;
},
```

### 4. Add CSS Styles

Add these styles inside the `_getStyles()` method, at the end of the existing `<style>` block (before the closing `</style>` tag):

```css
/* ============================================= */
/* Section 3: Integration Styles                 */
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
```

## Template Literal Safety Check

Before deploying, search the code you just added:

```bash
grep -n "\\\\'" core/CollectiveResults.js
```

If any escaped apostrophes are found, replace with full words or double quotes.

Also check for reload patterns:

```bash
grep -n "window.location.reload\|location.reload\|location.href" core/CollectiveResults.js
```

Should return no results.

## Test Procedure

1. Open the FTP app as a student who has Tool 1 + at least 1 grounding tool
2. Navigate to the Collective Results page
3. **You should see:**
   - Section 3 now shows "The Integration" with real content
   - A profile card with the student's profile name, icon, and description
   - Warning cards below the profile (if any warnings triggered)
   - Warnings sorted by severity (red critical first, then amber high, then lighter medium)
4. Navigate as a student with Tool 1 only (no grounding tools)
   - Should see profile card but possibly no warnings (depends on Tool 1 data)
5. Navigate as a student with only financial tools (Tool 2, 4, 6 — no Tool 1)
   - Section 3 should show "Almost there" placeholder — engines produce nothing without Tool 1
6. Navigate as a student with 0 tools
   - Section 3 should not appear at all
7. Navigate as a student with Tool 1 + Tool 3 (only 2 tools)
   - Section 3 should show profile + warnings — it works with just 2 tools if the right 2

## Verification Checklist

- [ ] Section 3 placeholder is fully replaced
- [ ] Section 3 visibility is based on engine output, NOT a simple tool count
- [ ] Profile card renders with gradient background and gold border
- [ ] Profile name displays in gold (#ad9168)
- [ ] Profile description is readable
- [ ] Source badges appear below the profile
- [ ] Warning cards render with correct border colors (red/amber)
- [ ] Warning priority icons are correct (🚨 / ⚠️ / 📋)
- [ ] Warning messages are direct and use no contractions
- [ ] "Based on:" sources appear below each warning
- [ ] Maximum 4 warnings shown, overflow message if more exist
- [ ] Student with only financial tools sees "Almost there" placeholder
- [ ] Student with Tool 1 + grounding (2 tools) sees real Section 3 content
- [ ] 0-tool state shows nothing (empty string returned)
- [ ] "Almost there" message mentions Tool 1 AND specifies grounding tools by name
- [ ] Cards do not overflow on mobile (check at 375px width)
- [ ] "View Full Report" buttons on Section 1/2 cards still work
- [ ] "Back to Dashboard" button still works
- [ ] No JavaScript console errors
- [ ] No escaped apostrophes in template literals
- [ ] No window.location.reload() anywhere
