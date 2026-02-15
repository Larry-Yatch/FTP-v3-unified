# Phase 5: Render Belief Locks, Awareness Gap, and Belief-Behavior Gaps

## Goal
Complete the student-facing Section 3 by adding the remaining three subsections: belief lock chains, awareness gap visualization, and belief-behavior gap table.

## Prerequisites
- Phase 4 complete (Section 3 renders with profile card and warnings)

## Files to Read First
- `core/CollectiveResults.js` — the `_renderSection3()` function (updated in Phase 4)
- `core/CollectiveResults.js` — `_getStyles()` — where Phase 4 CSS was added

## What to Change

### 1. Update _renderSection3() to Include New Subsections

In the `_renderSection3()` function from Phase 4, make TWO changes:

**Step A:** At the top of the function, find the `engines` object and uncomment the three remaining engine calls:

```javascript
  var engines = {
    profile: this._detectProfile(summary),
    warnings: this._generateWarnings(summary),
    // Phase 5: UNCOMMENT these three lines:
    awarenessGap: this._calculateAwarenessGap(summary),
    locks: this._detectBeliefLocks(summary),
    bbGaps: this._detectBeliefBehaviorGaps(summary)
  };
```

**Step B:** Find the comment that says "Placeholder for Phase 5 additions" and replace it with:

```javascript
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
```

**Important:** Use `engines.awarenessGap`, `engines.locks`, and `engines.bbGaps` — do NOT call the engine functions again. They were already called at the top of `_renderSection3()` in Phase 4. This keeps engine execution to exactly once per page load.

### 2. Add _renderAwarenessGap(gap)

Place this after `_renderWarningCards()`:

```javascript
/**
 * Render the Awareness Gap visualization — 3C
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
```

### 3. Add _renderBeliefLocks(locks)

```javascript
/**
 * Render belief lock chains — 3D
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
```

### 4. Add _renderBeliefBehaviorGaps(gaps)

```javascript
/**
 * Render belief-behavior gaps — 3E
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
```

### 5. Add CSS Styles

Add these to `_getStyles()`, right after the Phase 4 styles:

```css
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
```

## Test Procedure

1. **Full section test** — Open Collective Results as a student with 4+ tools:
   - Profile card should appear at top
   - Warnings should appear below profile
   - Awareness Gap should appear (if gap > 15)
   - Belief Locks should appear (if any patterns match)
   - Belief-Behavior Gaps should appear (if aspect data available)

2. **No awareness gap** — Test with a student whose stress scores are proportional to their psych scores. The awareness gap card should NOT appear.

3. **No locks** — Test with a student whose subdomain scores are all below 50. No lock cards should appear.

4. **No behavior gaps** — If no grounding tool stores aspect-level data, this section will not appear. That is OK — it will light up once we confirm the data structure.

5. **Mobile test** — Resize to 375px width. All cards should stack cleanly.

## Verification Checklist

- [ ] Awareness Gap renders with dual bars (amber/green gradient)
- [ ] Gap badge shows correct severity color
- [ ] Gap hidden when severity is "normal" (gap < 15)
- [ ] Belief lock chains render with ↕ connectors between beliefs
- [ ] Lock strength badges show correct colors (red/amber/green)
- [ ] Lock financial impact text appears at bottom of each lock
- [ ] Maximum 3 locks shown, overflow message for additional
- [ ] Belief-behavior gaps render with belief/behavior/gap scores
- [ ] Gap direction label appears correctly
- [ ] Interpretation text is helpful and direct
- [ ] All new sections stack cleanly on mobile
- [ ] `_quotientColor()` is called correctly for lock belief scores (this function already exists in the codebase)
- [ ] No escaped apostrophes in any template string
- [ ] No contractions in user-facing text
- [ ] All existing Section 1 and 2 functionality still works
- [ ] "Back to Dashboard" button still works
- [ ] Page loads without JavaScript errors
