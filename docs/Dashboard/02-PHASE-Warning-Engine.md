# Phase 2: Warning Detection Engine

## Goal
Add the function that analyzes a student's data and produces prioritized warnings about how their psychological patterns are affecting their financial behaviors. No UI changes yet.

## Prerequisites
- Phase 1 complete (INTEGRATION_PROFILES constant and _detectProfile exist)

## Files to Read First
- `core/CollectiveResults.js` — the `GROUNDING_CONFIG` (lines 36-73) for subdomain keys and labels
- `core/CollectiveResults.js` — `getStudentSummary()` (lines 96-139) for the summary shape
- The Phase 1 doc's "Summary Object Shape" section for data structure reference

## What to Add

### 1. Helper Function: _calculateAverageStress(tool2Data)

Add this right after `_detectProfile()` in the Integration Engines section:

```javascript
/**
 * Calculate average stress score across all Tool 2 financial domains.
 * Stress scores come from tool2.data.results.benchmarks[domain].stress
 *
 * @param {Object} tool2Data - tool2.data from summary
 * @returns {number|null} - average stress, or null if no data
 */
_calculateAverageStress(tool2Data) {
  if (!tool2Data || !tool2Data.results || !tool2Data.results.benchmarks) return null;

  var benchmarks = tool2Data.results.benchmarks;
  var domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
  var total = 0;
  var count = 0;

  for (var i = 0; i < domains.length; i++) {
    var domain = domains[i];
    if (benchmarks[domain] && benchmarks[domain].stress !== undefined && benchmarks[domain].stress !== null) {
      total += benchmarks[domain].stress;
      count++;
    }
  }

  return count > 0 ? (total / count) : null;
},
```

### 2. Helper Function: _getSubdomainScore(summary, toolKey, subdomainKey)

```javascript
/**
 * Safely retrieve a subdomain quotient score from the summary.
 *
 * @param {Object} summary - from getStudentSummary()
 * @param {string} toolKey - 'tool3', 'tool5', or 'tool7'
 * @param {string} subdomainKey - e.g. 'subdomain_1_3'
 * @returns {number|null} - the quotient score, or null if unavailable
 */
_getSubdomainScore(summary, toolKey, subdomainKey) {
  var tool = summary.tools[toolKey];
  if (!tool || tool.status !== 'completed' || !tool.data) return null;

  var scoring = tool.data.scoring;
  if (!scoring || !scoring.subdomainQuotients) return null;

  var value = scoring.subdomainQuotients[subdomainKey];
  return (value !== undefined && value !== null) ? value : null;
},
```

### 3. Helper Function: _getOverallQuotient(summary, toolKey)

```javascript
/**
 * Safely retrieve overall grounding quotient for a tool.
 *
 * @param {Object} summary
 * @param {string} toolKey - 'tool3', 'tool5', or 'tool7'
 * @returns {number|null}
 */
_getOverallQuotient(summary, toolKey) {
  var tool = summary.tools[toolKey];
  if (!tool || tool.status !== 'completed' || !tool.data) return null;

  var scoring = tool.data.scoring;
  return (scoring && scoring.overallQuotient !== undefined) ? scoring.overallQuotient : null;
},
```

### 4. Main Function: _generateWarnings(summary)

```javascript
/**
 * Generate prioritized warnings based on cross-tool psychological-financial patterns.
 *
 * Warning priorities: CRITICAL, HIGH, MEDIUM
 * Each warning includes: type (ID), priority, message (student-facing), sources (which tools)
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Array} - sorted by priority, highest first
 */
_generateWarnings(summary) {
  var warnings = [];
  var tool1 = summary.tools.tool1;
  var tool2 = summary.tools.tool2;

  // Tool 1 is REQUIRED for any warnings to fire. Without it, we have no
  // psychological anchor for the warnings — they would appear without context.
  // Single-trigger warnings (grounding tool only) are technically possible
  // without Tool 1, but showing warnings with no profile card is confusing UX.
  var hasT1 = tool1 && tool1.status === 'completed' && tool1.data;
  if (!hasT1) return [];

  var hasT2 = tool2 && tool2.status === 'completed' && tool2.data;

  // ---- CRITICAL: Awareness Gap ----
  // High psych scores + low financial stress = denial
  var t3Overall = this._getOverallQuotient(summary, 'tool3');
  var t5Overall = this._getOverallQuotient(summary, 'tool5');
  var t7Overall = this._getOverallQuotient(summary, 'tool7');

  if (hasT2 && (t3Overall >= 50 || t5Overall >= 50 || t7Overall >= 50)) {
    var avgStress = this._calculateAverageStress(tool2.data);
    if (avgStress !== null && avgStress < 0) {
      var highestQuotient = Math.max(t3Overall || 0, t5Overall || 0, t7Overall || 0);
      warnings.push({
        type: 'AWARENESS_GAP',
        priority: 'CRITICAL',
        priorityOrder: 0,
        message: 'Your psychological scores are elevated but you report low financial stress. This gap usually means you are not seeing the financial risks that are building. The patterns that feel normal to you are the ones doing the most damage.',
        sources: ['Grounding Scores (highest: ' + Math.round(highestQuotient) + '/100)', 'Financial Stress (avg: ' + avgStress.toFixed(1) + ')']
      });
    }
  }

  // ---- HIGH: Single-variable triggers ----
  var singleTriggers = [
    {
      toolKey: 'tool7', subdomainKey: 'subdomain_1_3', threshold: 60,
      type: 'CONTROL_DENIAL', priority: 'HIGH', priorityOrder: 1,
      message: 'Your "Only I Can Do It Right" score is elevated. This pattern typically causes you to underreport financial stress across all domains because you believe you have everything handled.',
      label: 'Only I Can Do It Right'
    },
    {
      toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 60,
      type: 'SABOTAGE_RISK', priority: 'HIGH', priorityOrder: 1,
      message: 'Your self-sabotage score is elevated. This pattern typically shows up as undermining your own growth and protection — you set things up and then find ways to tear them down.',
      label: 'I Sabotage Success'
    },
    {
      toolKey: 'tool5', subdomainKey: 'subdomain_1_1', threshold: 60,
      type: 'CODEPENDENT_SPENDING', priority: 'HIGH', priorityOrder: 1,
      message: 'Your tendency to take on the financial responsibilities of others is probably driving the essentials overspending you are seeing right now. Your budget serves everyone before it serves you.',
      label: 'I Must Give to Be Loved'
    },
    {
      toolKey: 'tool3', subdomainKey: 'subdomain_1_3', threshold: 60,
      type: 'REALITY_AVOIDANCE', priority: 'MEDIUM', priorityOrder: 2,
      message: 'Your financial reality avoidance is active. This creates a scarcity mindset regardless of how much money you actually have.',
      label: 'I Cannot See My Financial Reality'
    },
    {
      toolKey: 'tool7', subdomainKey: 'subdomain_2_1', threshold: 60,
      type: 'PROTECTION_GAP', priority: 'MEDIUM', priorityOrder: 2,
      message: 'Your self-protection belief is low. This shows up directly in your protection domain being underserved — you do not protect yourself because you do not believe you are worth protecting.',
      label: 'I Do Not Protect Myself'
    },
    {
      toolKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 50,
      type: 'OBLIGATION_OVERSPEND', priority: 'MEDIUM', priorityOrder: 2,
      message: 'Your sense of owing others is elevated. What shows up in your budget as essentials likely includes perceived debts to other people.',
      label: 'I Owe Them Everything'
    },
    {
      toolKey: 'tool3', subdomainKey: 'subdomain_2_2', threshold: 50,
      type: 'JUDGMENT_SCARCITY', priority: 'MEDIUM', priorityOrder: 2,
      message: 'Fear of judgment is active. This tends to create a scarcity mindset that suppresses confidence across all your financial domains.',
      label: 'What Will They Think?'
    },
    {
      toolKey: 'tool7', subdomainKey: 'subdomain_1_2', threshold: 50,
      type: 'GROWTH_PARALYSIS', priority: 'MEDIUM', priorityOrder: 2,
      message: 'Your money freezing belief is active. You may allocate money to growth on paper, but when it comes time to actually invest, you freeze.',
      label: 'I Have Money But Will Not Use It'
    }
  ];

  for (var i = 0; i < singleTriggers.length; i++) {
    var trigger = singleTriggers[i];
    var score = this._getSubdomainScore(summary, trigger.toolKey, trigger.subdomainKey);

    if (score !== null && score >= trigger.threshold) {
      var toolName = this.TOOL_META[trigger.toolKey].shortName;
      warnings.push({
        type: trigger.type,
        priority: trigger.priority,
        priorityOrder: trigger.priorityOrder,
        message: trigger.message,
        score: Math.round(score),
        sources: [toolName + ': "' + trigger.label + '" (' + Math.round(score) + '/100)']
      });
    }
  }

  // ---- HIGH: Compound patterns (require Tool 1 + grounding tool) ----
  if (hasT1) {
    var t1Scores = tool1.data.scores || {};

    // Control + Self-Reliance = Isolated Controller
    var t7sub13 = this._getSubdomainScore(summary, 'tool7', 'subdomain_1_3');
    if (t1Scores.Control > 10 && t7sub13 !== null && t7sub13 >= 50) {
      warnings.push({
        type: 'ISOLATED_CONTROLLER',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your control pattern combined with your self-reliance score tells a clear story: you are trying to handle everything alone. Your low obligation numbers look like independence, but they are actually isolation.',
        sources: [
          'Tool 1: Control (' + t1Scores.Control + ')',
          'Security: "Only I Can Do It Right" (' + Math.round(t7sub13) + '/100)'
        ]
      });
    }

    // FSV + Unworthiness = Shame Stagnation
    var t3sub11 = this._getSubdomainScore(summary, 'tool3', 'subdomain_1_1');
    if (t1Scores.FSV > 10 && t3sub11 !== null && t3sub11 >= 50) {
      warnings.push({
        type: 'SHAME_STAGNATION',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your shame pattern and your unworthiness score are reinforcing each other. This is likely why your growth allocation stays low — part of you does not believe you deserve to build wealth.',
        sources: [
          'Tool 1: False Self-View (' + t1Scores.FSV + ')',
          'Identity: "I am Not Worthy" (' + Math.round(t3sub11) + '/100)'
        ]
      });
    }

    // Showing + Codependency = Caretaker Drain
    var t5sub11 = this._getSubdomainScore(summary, 'tool5', 'subdomain_1_1');
    if (t1Scores.Showing > 10 && t5sub11 !== null && t5sub11 >= 50) {
      warnings.push({
        type: 'CARETAKER_DRAIN',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your caretaking pattern is being amplified by your codependency beliefs. This combination typically creates chronic financial overextension — you cannot stop giving even when your own accounts are suffering.',
        sources: [
          'Tool 1: Issues Showing Love (' + t1Scores.Showing + ')',
          'Love: "I Must Give to Be Loved" (' + Math.round(t5sub11) + '/100)'
        ]
      });
    }

    // Fear + Sabotage = Self-Destruct Pattern
    var t7sub22 = this._getSubdomainScore(summary, 'tool7', 'subdomain_2_2');
    if (t1Scores.Fear > 10 && t7sub22 !== null && t7sub22 >= 50) {
      warnings.push({
        type: 'SELF_DESTRUCT',
        priority: 'HIGH',
        priorityOrder: 1,
        message: 'Your fear and self-sabotage scores are both elevated. This combination is particularly damaging — the fear creates urgency but the sabotage undermines every protective action you try to take.',
        sources: [
          'Tool 1: Fear (' + t1Scores.Fear + ')',
          'Security: "I Sabotage Success" (' + Math.round(t7sub22) + '/100)'
        ]
      });
    }
  }

  // Sort by priority order (CRITICAL=0, HIGH=1, MEDIUM=2)
  warnings.sort(function(a, b) {
    return a.priorityOrder - b.priorityOrder;
  });

  return warnings;
},
```

## Where to Place the Code

All four functions go inside the `CollectiveResults` object, in the `// INTEGRATION ENGINES` section that was created in Phase 1, right after `_detectProfile()`.

Order should be:
1. `_detectProfile()` (from Phase 1)
2. `_calculateAverageStress()`
3. `_getSubdomainScore()`
4. `_getOverallQuotient()`
5. `_generateWarnings()`

## Test Function

```javascript
function testPhase2_WarningEngine() {
  var testClientId = 'TEST_STUDENT_EMAIL';

  var summary = CollectiveResults.getStudentSummary(testClientId);
  Logger.log('Student: ' + testClientId);
  Logger.log('Completed tools: ' + summary.completedCount);

  // Test helpers
  var avgStress = CollectiveResults._calculateAverageStress(
    summary.tools.tool2 ? summary.tools.tool2.data : null
  );
  Logger.log('Average stress: ' + avgStress);

  var t7sub13 = CollectiveResults._getSubdomainScore(summary, 'tool7', 'subdomain_1_3');
  Logger.log('T7 subdomain_1_3 (Only I Can Do It Right): ' + t7sub13);

  // Test main function
  var warnings = CollectiveResults._generateWarnings(summary);
  Logger.log('--- Warnings Generated: ' + warnings.length + ' ---');

  for (var i = 0; i < warnings.length; i++) {
    var w = warnings[i];
    Logger.log('[' + w.priority + '] ' + w.type);
    Logger.log('  Message: ' + w.message.substring(0, 80) + '...');
    Logger.log('  Sources: ' + w.sources.join(' | '));
  }
}
```

## Verification Checklist

- [ ] `_calculateAverageStress()` returns a number for students with Tool 2 data
- [ ] `_calculateAverageStress()` returns null for students without Tool 2
- [ ] `_getSubdomainScore()` returns correct scores for completed grounding tools
- [ ] `_getSubdomainScore()` returns null for uncompleted tools
- [ ] `_getOverallQuotient()` returns correct overall quotient
- [ ] `_generateWarnings()` produces CRITICAL warning when awareness gap detected
- [ ] `_generateWarnings()` produces HIGH warnings for compound patterns
- [ ] `_generateWarnings()` produces MEDIUM warnings for single-variable triggers
- [ ] Warnings are sorted by priority (CRITICAL first)
- [ ] Each warning has type, priority, message, and sources
- [ ] Test with student who has many tools completed (expect multiple warnings)
- [ ] Test with student who has only Tool 1 (expect no warnings or minimal — single triggers need grounding tools)
- [ ] Test with student who has only grounding tools but NO Tool 1 (expect zero warnings — Tool 1 is required)
- [ ] No UI changes visible — Section 3 still shows placeholder
- [ ] No escaped apostrophes in any string
- [ ] All messages use "do not", "cannot", "you are" (no contractions)
- [ ] All grounding tool subdomain threshold checks use `>=` (not `>`) — must match Phase 1 operator
- [ ] Tool 1 score checks use `>` (different scale: -25 to +25, "clearly elevated" threshold)
