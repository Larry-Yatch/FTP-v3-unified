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

This phase is not about writing new features. It is about systematic verification and fixes. Work through each checklist section in order.

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

### 2. Responsive Design

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

### 3. Animation / Fade-In

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

### 4. Edge Case Testing

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

### 5. Performance Check

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

### 6. Final Visual Review

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

### 7. Pre-Deploy Safety Check (from CLAUDE.md)

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

This phase has no new features. It is pure quality assurance:

1. GAS safety audit (navigation, template literals, contractions)
2. Responsive design at 3 breakpoints
3. Optional card animations
4. Edge case testing across all completion levels
5. Performance verification
6. Final visual review
7. Pre-deploy safety checks

After this phase completes, the Section 3 Integration feature is production-ready.
