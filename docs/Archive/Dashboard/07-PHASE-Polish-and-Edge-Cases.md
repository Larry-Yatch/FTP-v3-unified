# Phase 7: Polish, Responsive Design, and Edge Cases

## Goal
Final quality pass. Make everything bulletproof across screen sizes, handle all edge cases gracefully, and verify GAS safety rules are followed throughout.

## Prerequisites
- Phases 1-6 complete

## Files to Read First
- `core/CollectiveResults.js` — full file, focusing on all new code from Phases 1-5
- `AdminRouter.js` — the new coach view handler from Phase 6
- `docs/Navigation/GAS-NAVIGATION-RULES.md` — refresh on navigation rules
- `CLAUDE.md` — refresh on template literal guidelines and slider CSS warning

## Checklist-Driven Phase

This phase is mostly about systematic verification and fixes. There is ONE new feature: the "Continue Your Journey" incomplete tool navigation section. Work through each section in order.

---

### 1. GAS Safety Audit

Run these checks from the Apps Script editor or a terminal:

```bash
# Check for forbidden navigation patterns
grep -rn "window.location.reload\|location.reload\|location.href" core/CollectiveResults.js
grep -rn "window.location.reload\|location.reload\|location.href" AdminRouter.js

# Check for escaped apostrophes in template literals
grep -n "\\\\'" core/CollectiveResults.js
grep -n "\\\\'" AdminRouter.js

# Check for contractions in user-facing strings
grep -n "don't\|can't\|won't\|shouldn't\|couldn't\|you're\|it's\|they're\|we're\|I'm\|that's\|there's\|here's\|what's\|who's\|doesn't\|isn't\|wasn't\|weren't\|hasn't\|haven't" core/CollectiveResults.js
```

**Fix anything found.** Replace contractions with full words. Replace navigation patterns with `document.write()`.

- [ ] No `window.location.reload()` or `location.href` in any modified file
- [ ] No escaped apostrophes (`\'`) in template literal strings
- [ ] No contractions in user-facing messages

---

### 2. "Continue Your Journey" — Incomplete Tool Navigation

**Goal:** For every tool the student has not completed, show a card with the tool name, a brief reason why it matters for their integration, and a "Start" button that navigates directly to that tool. Cards are ordered by priority — the tools that unlock the most integration value appear first.

**Where it goes:** Add a new rendering method `_renderIncompleteToolCards(summary)` and call it inside the main `renderCollectiveResults()` method. Place it AFTER Section 2 (Financial Structure) and BEFORE Section 3 (The Integration). This way the student sees their completed results first, then a clear call-to-action for what to do next, then whatever integration analysis is available.

**Priority order and messaging:**

The `TOOL_PRIORITY` constant defines the order and the "why it matters" copy. Tools are shown highest priority first. Only incomplete tools appear.

```javascript
// Add this constant alongside TOOL_META (in the constants section at the top)
TOOL_PRIORITY: [
  {
    toolKey: 'tool1',
    priority: 1,
    unlocks: 'Your Integration Profile + all pattern warnings',
    cta: 'This is the foundation — everything else builds on it.'
  },
  {
    toolKey: 'tool3',
    priority: 2,
    unlocks: 'Identity beliefs, Pipeline A + B, belief locks',
    cta: 'See how your identity beliefs drive your financial decisions.'
  },
  {
    toolKey: 'tool2',
    priority: 3,
    unlocks: 'Awareness Gap calculation + financial stress analysis',
    cta: 'Find out if you are seeing the full picture of your financial stress.'
  },
  {
    toolKey: 'tool5',
    priority: 4,
    unlocks: 'Caretaking patterns, Pipeline B, belief locks',
    cta: 'Discover how your relationships shape your spending.'
  },
  {
    toolKey: 'tool7',
    priority: 5,
    unlocks: 'Control patterns, Pipeline A, belief locks',
    cta: 'Understand the security behaviors driving your financial choices.'
  },
  {
    toolKey: 'tool4',
    priority: 6,
    unlocks: 'Budget allocation data for GPT report',
    cta: 'Map your ideal spending across the four financial categories.'
  },
  {
    toolKey: 'tool6',
    priority: 7,
    unlocks: 'Retirement vehicle analysis for GPT report',
    cta: 'Build your long-term financial blueprint.'
  },
  {
    toolKey: 'tool8',
    priority: 8,
    unlocks: 'Investment planning data for GPT report',
    cta: 'Define your investment strategy and risk tolerance.'
  }
],
```

**Rendering method:**

```javascript
/**
 * Render "Continue Your Journey" section — shows incomplete tools
 * sorted by integration value, with direct navigation buttons.
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {string} HTML (empty string if all 8 tools are completed)
 */
_renderIncompleteToolCards(summary) {
  var incomplete = [];

  for (var i = 0; i < this.TOOL_PRIORITY.length; i++) {
    var entry = this.TOOL_PRIORITY[i];
    var tool = summary.tools[entry.toolKey];
    var isComplete = tool && tool.status === 'completed';

    if (!isComplete) {
      var meta = this.TOOL_META[entry.toolKey];
      var toolNum = entry.toolKey.replace('tool', '');
      incomplete.push({
        toolKey: entry.toolKey,
        toolNum: toolNum,
        name: meta.shortName,
        icon: meta.icon,
        unlocks: entry.unlocks,
        cta: entry.cta,
        status: (tool && tool.status === 'in_progress') ? 'in_progress' : 'not_started'
      });
    }
  }

  if (incomplete.length === 0) return '';

  var html = '<div class="card cr-section-card">' +
    '<h2 class="cr-section-title">Continue Your Journey</h2>' +
    '<p class="muted">' + incomplete.length + ' tool' + (incomplete.length > 1 ? 's' : '') +
      ' remaining — each one deepens your integration insights</p>' +
    '<div class="hr" style="margin: 15px 0;"></div>';

  for (var j = 0; j < incomplete.length; j++) {
    var t = incomplete[j];

    var statusBadge = '';
    if (t.status === 'in_progress') {
      statusBadge = '<span class="cr-journey-badge cr-journey-badge-progress">In Progress</span>';
    }

    var btnLabel = t.status === 'in_progress' ? 'Continue' : 'Start';

    html += '<div class="cr-journey-card">' +
      '<div class="cr-journey-left">' +
        '<span class="cr-journey-icon">' + t.icon + '</span>' +
        '<div class="cr-journey-info">' +
          '<div class="cr-journey-name">Tool ' + t.toolNum + ': ' + t.name + ' ' + statusBadge + '</div>' +
          '<div class="cr-journey-unlocks">Unlocks: ' + t.unlocks + '</div>' +
          '<div class="cr-journey-cta">' + t.cta + '</div>' +
        '</div>' +
      '</div>' +
      '<button class="cr-journey-btn" onclick="navigateToTool(\'' + t.toolKey + '\')">' +
        btnLabel + ' Tool ' + t.toolNum +
      '</button>' +
    '</div>';
  }

  html += '</div>';
  return html;
},
```

**Key implementation details:**
- The "Start/Continue" button calls `navigateToTool(toolKey)` — a new script function that must be added to `_getScripts()`. It always uses `getToolPageHtml(toolId, clientId, 1)` to navigate to the tool's survey page (page 1). Do NOT use `viewToolReport()` — that function splits between `getReportPage` (for report tools) and `getToolPageHtml` (for calculator tools), which would load the report page instead of the survey for incomplete tools.
- Add this function to `_getScripts()` inside the IIFE, after the existing `viewToolReport` definition:
  ```javascript
  window.navigateToTool = function(toolId) {
    showLoading('Loading...');
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
  };
  ```
- The priority order puts Tool 1 first (it is the foundation for everything), then grounding tools (they unlock locks, gaps, pipelines), then Tool 2 (unlocks awareness gap), then financial tools (they contribute data to the GPT report).
- "In Progress" tools show a yellow badge and "Continue" instead of "Start."
- If all 8 tools are complete, this section does not appear at all.

**Where to call it in `_buildPageHTML()`:**

Find `_buildPageHTML(clientId, summary)` in `CollectiveResults.js` (around line 171). Add the call after Section 2, before Section 3:

```javascript
// After Section 2 rendering...
html += this._renderSection2(summary, clientId);

// NEW: Show incomplete tools with navigation
html += this._renderIncompleteToolCards(summary);

// Section 3: The Integration
html += this._renderSection3(summary);
```

**CSS to add to `_getStyles()`:**

```css
/* Continue Your Journey Section */
.cr-journey-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  margin: 8px 0;
  background: rgba(30, 25, 43, 0.4);
  border: 1px solid rgba(173, 145, 104, 0.12);
  border-radius: 10px;
  gap: 12px;
}

.cr-journey-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.cr-journey-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.cr-journey-info {
  flex: 1;
  min-width: 0;
}

.cr-journey-name {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
  margin-bottom: 3px;
}

.cr-journey-unlocks {
  font-size: 0.8rem;
  color: #ad9168;
  margin-bottom: 2px;
}

.cr-journey-cta {
  font-size: 0.8rem;
  color: var(--muted);
  font-style: italic;
}

.cr-journey-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 6px;
  vertical-align: middle;
}

.cr-journey-badge-progress {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

.cr-journey-btn {
  background: linear-gradient(135deg, rgba(173, 145, 104, 0.15), rgba(75, 65, 102, 0.15));
  border: 1px solid rgba(173, 145, 104, 0.3);
  color: #ad9168;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.cr-journey-btn:hover {
  background: linear-gradient(135deg, rgba(173, 145, 104, 0.25), rgba(75, 65, 102, 0.25));
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .cr-journey-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .cr-journey-left {
    flex-direction: column;
    text-align: center;
  }

  .cr-journey-btn {
    width: 100%;
  }
}
```

**Verification checklist for this section:**

- [ ] `TOOL_PRIORITY` constant added alongside `TOOL_META`
- [ ] `navigateToTool()` function added to `_getScripts()` — uses `getToolPageHtml` for ALL tools
- [ ] `_renderIncompleteToolCards()` renders only tools not yet completed
- [ ] Tools are sorted by priority (Tool 1 first, then grounding, then financial)
- [ ] "In Progress" tools show yellow badge and "Continue" button text
- [ ] "Not Started" tools show "Start" button text
- [ ] Clicking "Start/Continue" navigates to the correct tool **survey page** (not the report page)
- [ ] Section does not appear when all 8 tools are complete
- [ ] Section appears between Section 2 and Section 3
- [ ] Cards do not overflow on mobile (flex wraps correctly at 480px)
- [ ] No escaped apostrophes in template strings
- [ ] No contractions in user-facing copy
- [ ] "Unlocks" descriptions are accurate (match what engines actually need)

---

### 3. Responsive Design

Test at these breakpoints:
- **Desktop:** 1200px+ (two-column grid should work)
- **Tablet:** 768px (grid should collapse to single column)
- **Mobile:** 375px (everything stacks, text remains readable)

**Specific items to check:**

```
Profile card:
- [ ] Name text wraps properly on mobile
- [ ] Source badges wrap to multiple lines if needed

Warning cards:
- [ ] Long messages do not overflow
- [ ] Icon + label stay on same line

Belief locks:
- [ ] Belief label + score wrap correctly when label is long
- [ ] Connector arrows stay centered

Awareness Gap:
- [ ] Bar labels shrink gracefully (140px -> 90px at 480px)
- [ ] Score numbers do not overlap bars

Belief-Behavior Gaps:
- [ ] Score items wrap to new line on mobile
- [ ] Gap values remain readable

Coach View (Phase 6):
- [ ] Warning table scrolls horizontally if needed
- [ ] Full gap table scrolls on mobile
```

**CSS Additions (if needed):**

```css
/* Add to _getStyles() if not already present */
@media (max-width: 480px) {
  .cr-profile-name {
    font-size: 1.2rem;
  }

  .cr-profile-description {
    font-size: 0.85rem;
  }

  .cr-lock-belief {
    flex-direction: column;
    gap: 4px;
  }

  .cr-lock-belief-meta {
    margin-left: 0;
  }

  .cr-bb-gap-scores {
    flex-direction: column;
    gap: 8px;
  }
}
```

---

### 4. Animation / Fade-In

The existing page uses `body.loaded` class with opacity transition. Section 3 cards should benefit from this automatically since they render inside the same page.

If individual card animations are wanted:

```css
/* Optional: Sequential fade-in for Section 3 cards */
.cr-section-card .cr-profile-card,
.cr-section-card .cr-warning-card,
.cr-section-card .cr-awareness-gap,
.cr-section-card .cr-lock-chain,
.cr-section-card .cr-bb-gap-card {
  opacity: 0;
  transform: translateY(10px);
  animation: crFadeIn 0.4s ease forwards;
}

@keyframes crFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger the animations */
.cr-section-card .cr-profile-card { animation-delay: 0.1s; }
.cr-section-card .cr-warning-card:nth-child(1) { animation-delay: 0.2s; }
.cr-section-card .cr-warning-card:nth-child(2) { animation-delay: 0.3s; }
.cr-section-card .cr-warning-card:nth-child(3) { animation-delay: 0.35s; }
.cr-section-card .cr-warning-card:nth-child(4) { animation-delay: 0.4s; }
.cr-section-card .cr-awareness-gap { animation-delay: 0.45s; }
.cr-section-card .cr-lock-chain { animation-delay: 0.5s; }
.cr-section-card .cr-bb-gap-card { animation-delay: 0.55s; }
```

- [ ] Cards appear smoothly (no flash of unstyled content)
- [ ] Animations do not feel sluggish (total animation time < 1 second)

---

### 5. Edge Case Testing

Test each scenario below. For each, the system should handle gracefully — no JavaScript errors, no blank sections, no broken layout.

**Tool Completion Scenarios:**

Section 3 visibility is based on **engine output**, not tool count. The engines run and we check if profile or warnings have data.

| Scenario | Expected Behavior |
|----------|-------------------|
| 0 tools completed | Section 3 not rendered (returns empty string) |
| 1 tool (non-Tool-1, e.g. Tool 2) | Section 3 shows "Almost there" (engines produce nothing) |
| Tool 1 only | Profile card shows (partial confidence), may have no warnings |
| Tool 1 + 1 grounding (2 tools) | Profile shows, warnings fire, possibly locks — full Section 3 |
| Tool 2 + 1 grounding (no Tool 1) | "Almost there" — no profile, no warnings (engines need Tool 1) |
| 3 financial tools (T2 + T4 + T6, no Tool 1) | "Almost there" — engines produce nothing without Tool 1 |
| Tool 1 + Tool 3 + Tool 2 | Profile + Warnings + Awareness Gap + possibly locks |
| All 8 tools | Full Section 3 with all subsections + active download button |

**Download Button States (Phase 9):**

| Scenario | Button State |
|----------|-------------|
| 0-1 populated sections | Disabled — "Complete more tools" |
| 2+ populated sections | Active — "X of 5 report sections available" |
| All 5 sections populated | Active — "5 of 5 report sections available" |

**Data Edge Cases:**

| Scenario | Expected Behavior |
|----------|-------------------|
| Tool data is null | That tool treated as not started |
| Tool data has missing `scoring` | Helper functions return null, subsections skip |
| Tool data has `scoring` but no `subdomainQuotients` | Subdomain score returns null |
| All subdomain scores below 50 | No locks detected, fewer warnings |
| All subdomain scores above 80 | Many locks and warnings (verify max caps work) |
| Tool 2 stress all zero | Awareness gap still calculates correctly |
| Student with no grounding tools | Only profile from Tool 1 (if completed) |

**Run this comprehensive test function:**

```javascript
function testPhase7_EdgeCases() {
  // Test with an array of students covering different completion levels
  var students = [
    'STUDENT_WITH_ALL_8',
    'STUDENT_WITH_3_TOOLS',
    'STUDENT_WITH_1_TOOL',
    'STUDENT_WITH_0_TOOLS'
  ];

  for (var s = 0; s < students.length; s++) {
    var clientId = students[s];
    Logger.log('=== Testing: ' + clientId + ' ===');

    try {
      var summary = CollectiveResults.getStudentSummary(clientId);
      Logger.log('Completed: ' + summary.completedCount);

      // Test each engine
      var profile = CollectiveResults._detectProfile(summary);
      Logger.log('Profile: ' + (profile ? profile.name + ' (' + profile.confidence + ')' : 'null'));

      var warnings = CollectiveResults._generateWarnings(summary);
      Logger.log('Warnings: ' + warnings.length);

      var gap = CollectiveResults._calculateAwarenessGap(summary);
      Logger.log('Gap: ' + (gap ? gap.severity + ' (' + gap.gapScore + ')' : 'null'));

      var locks = CollectiveResults._detectBeliefLocks(summary);
      Logger.log('Locks: ' + locks.length);

      var bbGaps = CollectiveResults._detectBeliefBehaviorGaps(summary);
      Logger.log('B-B Gaps: ' + bbGaps.length);

      // Test full render (should not throw)
      var html = CollectiveResults._renderSection3(summary);
      Logger.log('Section 3 HTML length: ' + (html ? html.length : 0));
      Logger.log('---');

    } catch (err) {
      Logger.log('ERROR for ' + clientId + ': ' + err.message);
    }
  }
}
```

- [ ] Test function completes without errors for all student types
- [ ] No blank/broken pages for any completion level
- [ ] No "undefined" text appearing in rendered HTML

---

### 6. Performance Check

Google Apps Script has a 30-second execution limit. The detection engines run on already-loaded data (from `getStudentSummary`), so they should be fast. But verify:

```javascript
function testPhase7_Performance() {
  var clientId = 'STUDENT_WITH_ALL_8';
  var start = new Date().getTime();

  var summary = CollectiveResults.getStudentSummary(clientId);
  var summaryTime = new Date().getTime() - start;

  // NOTE: _renderSection3() now runs all engines internally (in the engines{} object)
  // so we just time the full render, which includes engine computation.
  start = new Date().getTime();
  var html = CollectiveResults._renderSection3(summary);
  var renderTime = new Date().getTime() - start;

  Logger.log('Summary fetch: ' + summaryTime + 'ms');
  Logger.log('Section 3 render (includes all engines): ' + renderTime + 'ms');
  Logger.log('Total: ' + (summaryTime + renderTime) + 'ms');

  // Also time engines separately for diagnostics
  start = new Date().getTime();
  var profile = CollectiveResults._detectProfile(summary);
  var warnings = CollectiveResults._generateWarnings(summary);
  var gap = CollectiveResults._calculateAwarenessGap(summary);
  var locks = CollectiveResults._detectBeliefLocks(summary);
  var bbGaps = CollectiveResults._detectBeliefBehaviorGaps(summary);
  var engineOnlyTime = new Date().getTime() - start;
  Logger.log('Engine-only time (separate call for diagnostics): ' + engineOnlyTime + 'ms');
}
```

**Target:** Total under 3 seconds. If over 5 seconds, optimize.

- [ ] Total execution time < 3 seconds
- [ ] No approach to the 30-second GAS limit

---

### 7. Final Visual Review

Open the Collective Results page as a student and carefully review:

- [ ] Section 1 (Psychological Landscape) unchanged — still renders correctly
- [ ] Section 2 (Financial Structure) unchanged — still renders correctly
- [ ] Section 3 (Integration) appears between Section 2 and "Back to Dashboard"
- [ ] All colors consistent with existing design (gold #ad9168, dark purple #1e192b)
- [ ] Text is readable against background
- [ ] No orphaned headings (heading without content below it)
- [ ] "Back to Dashboard" button still at bottom of page and works
- [ ] "View Full Report" buttons in Section 1/2 still work
- [ ] Page does not feel significantly slower to load

---

### 8. Pre-Deploy Safety Check (from CLAUDE.md)

Run the full CLAUDE.md pre-deploy checks:

```bash
# Forbidden navigation patterns
grep -rn "window.location.reload\|location.reload" core/CollectiveResults.js AdminRouter.js

# Escaped apostrophes in template literals
grep -n "\\\\'" core/CollectiveResults.js AdminRouter.js

# Verify slider CSS still intact (Tool 6 safety check from CLAUDE.md)
grep -n "webkit-slider-runnable-track\|moz-range-track" tools/tool6/Tool6.js
```

- [ ] All checks pass
- [ ] No unrelated files were accidentally modified
- [ ] Git diff shows only expected changes

---

## Summary

This phase has one new feature and comprehensive quality assurance:

1. GAS safety audit (navigation, template literals, contractions)
2. **"Continue Your Journey" — incomplete tool navigation** (new feature)
3. Responsive design at 3 breakpoints
4. Optional card animations
5. Edge case testing across all completion levels
6. Performance verification
7. Final visual review
8. Pre-deploy safety checks

After this phase completes, the Section 3 Integration feature is production-ready.
