# Phase 3: Belief Lock, Awareness Gap, and Belief-Behavior Gap Engines

## Goal
Add the remaining three detection engines. After this phase, all five engines are functional and testable. Still no UI changes.

## Prerequisites
- Phase 1 complete (INTEGRATION_PROFILES, _detectProfile)
- Phase 2 complete (_generateWarnings, helper functions)

## Files to Read First
- `core/CollectiveResults.js` — the INTEGRATION ENGINES section (where Phases 1 and 2 code lives)
- `core/CollectiveResults.js` — `GROUNDING_CONFIG` (lines 36-73) for subdomain keys

## What to Add

### 1. _calculateAwarenessGap(summary)

This is the single most important finding from our research: students with higher psychological dysfunction consistently report LOWER financial stress. This function quantifies that gap.

```javascript
/**
 * Calculate the Awareness Gap — the difference between psychological
 * dysfunction scores and reported financial stress.
 *
 * A large gap means the student is likely in denial about financial risks.
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Object|null} - { gapScore, psychScore, stressScore, severity }
 *   severity: 'critical' (gap > 30), 'elevated' (gap 15-30), 'normal' (gap < 15)
 */
_calculateAwarenessGap(summary) {
  // Need at least one grounding tool + Tool 2
  var tool2 = summary.tools.tool2;
  if (!tool2 || tool2.status !== 'completed' || !tool2.data) return null;

  var avgStress = this._calculateAverageStress(tool2.data);
  if (avgStress === null) return null;

  // Calculate average grounding quotient across completed grounding tools
  var groundingTools = ['tool3', 'tool5', 'tool7'];
  var totalQuotient = 0;
  var quotientCount = 0;

  for (var i = 0; i < groundingTools.length; i++) {
    var quotient = this._getOverallQuotient(summary, groundingTools[i]);
    if (quotient !== null) {
      totalQuotient += quotient;
      quotientCount++;
    }
  }

  if (quotientCount === 0) return null;

  var avgPsychScore = totalQuotient / quotientCount;

  // Normalize stress to 0-100 scale for comparison
  // Tool 2 stress ranges roughly -10 to +10, normalize to 0-100
  var normalizedStress = Math.max(0, Math.min(100, (avgStress + 10) * 5));

  // Gap = how much higher the psych score is compared to stress awareness
  var gapScore = avgPsychScore - normalizedStress;

  var severity = 'normal';
  if (gapScore > 30) severity = 'critical';
  else if (gapScore > 15) severity = 'elevated';

  return {
    gapScore: Math.round(gapScore),
    psychScore: Math.round(avgPsychScore),
    stressScore: Math.round(normalizedStress),
    rawStress: avgStress,
    severity: severity,
    groundingToolsUsed: quotientCount
  };
},
```

### 2. _detectBeliefLocks(summary)

Belief locks are where beliefs from different tools reinforce each other, creating stable patterns that resist change. Our research found these across triads (3-variable) and quads (4-variable) using cross-tool correlation analysis.

```javascript
/**
 * Detect belief locks — interlocking beliefs across tools that reinforce each other.
 *
 * A lock exists when multiple subdomain scores from different tools all exceed
 * their thresholds simultaneously, creating a mutually reinforcing pattern.
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Array} - sorted by strength (strongest first)
 *   Each lock: { name, beliefs[], financialImpact, strength }
 */
_detectBeliefLocks(summary) {
  var locks = [];

  // Define known lock patterns from our research
  // Each lock has: name, beliefs (tool + subdomain + threshold), financialImpact
  var lockPatterns = [
    {
      name: 'Scarcity + Shame Lock',
      beliefs: [
        { toolKey: 'tool3', subdomainKey: 'subdomain_1_1', threshold: 50, label: 'I am Not Worthy of Financial Freedom' },
        { toolKey: 'tool3', subdomainKey: 'subdomain_1_2', threshold: 50, label: 'I will Never Have Enough' },
        { toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50, label: 'I Sabotage Success' }
      ],
      financialImpact: 'This lock suppresses growth allocation and keeps you from building wealth even when you can afford to. The shame says you do not deserve it, the scarcity says there will never be enough, and the sabotage ensures the pattern continues.'
    },
    {
      name: 'Caretaker Trap Lock',
      beliefs: [
        { toolKey: 'tool5', subdomainKey: 'subdomain_1_1', threshold: 50, label: 'I Must Give to Be Loved' },
        { toolKey: 'tool5', subdomainKey: 'subdomain_1_2', threshold: 50, label: 'Their Needs Are Greater Than My Needs' },
        { toolKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 50, label: 'I Owe Them Everything' }
      ],
      financialImpact: 'This lock keeps your essentials budget inflated with other people. You cannot reduce spending because every expense feels like an obligation to someone you love. Your freedom and growth categories stay underfunded.'
    },
    {
      name: 'Control + Isolation Lock',
      beliefs: [
        { toolKey: 'tool7', subdomainKey: 'subdomain_1_1', threshold: 50, label: 'I Undercharge and Give Away' },
        { toolKey: 'tool7', subdomainKey: 'subdomain_1_3', threshold: 50, label: 'Only I Can Do It Right' },
        { toolKey: 'tool3', subdomainKey: 'subdomain_1_3', threshold: 50, label: 'I Cannot See My Financial Reality' }
      ],
      financialImpact: 'This lock creates financial blindness through control. You undercharge because you do not value your work, you refuse help because no one meets your standards, and you cannot see the damage because you avoid looking at reality.'
    },
    {
      name: 'Fear + Paralysis Lock',
      beliefs: [
        { toolKey: 'tool7', subdomainKey: 'subdomain_2_1', threshold: 50, label: 'I Do Not Protect Myself' },
        { toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50, label: 'I Sabotage Success' },
        { toolKey: 'tool7', subdomainKey: 'subdomain_1_2', threshold: 50, label: 'I Have Money But Will Not Use It' }
      ],
      financialImpact: 'This lock creates complete financial paralysis. You do not protect yourself, you sabotage what you build, and you freeze when you have money to use. The fear feeds the sabotage which feeds the inaction.'
    },
    {
      name: 'Validation + Spending Lock',
      beliefs: [
        { toolKey: 'tool3', subdomainKey: 'subdomain_2_1', threshold: 50, label: 'Money Shows My Worth' },
        { toolKey: 'tool3', subdomainKey: 'subdomain_2_3', threshold: 50, label: 'I Need to Prove I am Successful' },
        { toolKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 45, label: 'I Owe Them Everything' }
      ],
      financialImpact: 'This lock drives spending as proof of worth. You spend to show success, you spend to repay perceived debts, and money becomes your primary tool for proving your value. Savings feel like failure.'
    },
    {
      name: 'Identity + Sabotage Pipeline',
      beliefs: [
        { toolKey: 'tool3', subdomainKey: 'subdomain_1_1', threshold: 50, label: 'I am Not Worthy of Financial Freedom' },
        { toolKey: 'tool3', subdomainKey: 'subdomain_1_3', threshold: 50, label: 'I Cannot See My Financial Reality' },
        { toolKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50, label: 'I Sabotage Success' },
        { toolKey: 'tool7', subdomainKey: 'subdomain_2_1', threshold: 50, label: 'I Do Not Protect Myself' }
      ],
      financialImpact: 'This is the full Pipeline A from our research: Identity beliefs feed directly into sabotage behaviors. The unworthiness creates the blindness, the blindness enables the sabotage, and the lack of self-protection means there is no safety net when things break.'
    }
  ];

  for (var p = 0; p < lockPatterns.length; p++) {
    var pattern = lockPatterns[p];
    var allMet = true;
    var beliefDetails = [];
    var totalScore = 0;

    for (var b = 0; b < pattern.beliefs.length; b++) {
      var belief = pattern.beliefs[b];
      var score = this._getSubdomainScore(summary, belief.toolKey, belief.subdomainKey);

      if (score === null || score < belief.threshold) {
        allMet = false;
        break;
      }

      var toolName = this.TOOL_META[belief.toolKey].shortName;
      beliefDetails.push({
        label: belief.label,
        score: Math.round(score),
        tool: toolName
      });
      totalScore += score;
    }

    if (allMet) {
      var avgScore = totalScore / pattern.beliefs.length;
      var strength = 'moderate';
      if (avgScore > 70) strength = 'strong';
      else if (avgScore < 55) strength = 'emerging';

      locks.push({
        name: pattern.name,
        beliefs: beliefDetails,
        financialImpact: pattern.financialImpact,
        strength: strength,
        avgScore: Math.round(avgScore),
        beliefCount: pattern.beliefs.length
      });
    }
  }

  // Sort by strength (strong first) then by average score
  var strengthOrder = { strong: 0, moderate: 1, emerging: 2 };
  locks.sort(function(a, b) {
    var diff = (strengthOrder[a.strength] || 2) - (strengthOrder[b.strength] || 2);
    if (diff !== 0) return diff;
    return b.avgScore - a.avgScore;
  });

  return locks;
},
```

### 3. _detectBeliefBehaviorGaps(summary)

From our internal structure analysis: within each subdomain, the belief aspect and the behavior/feeling/consequence aspects form somewhat independent clusters. This means what students say they believe does not always match how they act.

```javascript
/**
 * Detect gaps between a student's stated beliefs and their actual behaviors
 * within grounding tool subdomains.
 *
 * Each grounding subdomain has 4 question aspects: belief, behavior, feeling, consequence.
 * Belief can diverge from the behavior/feeling/consequence cluster.
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Array} - gaps > 2.0 points, sorted by magnitude
 *   Each gap: { subdomain, tool, beliefScore, behaviorScore, gap, direction, label }
 */
_detectBeliefBehaviorGaps(summary) {
  var gaps = [];
  var groundingTools = ['tool3', 'tool5', 'tool7'];

  for (var t = 0; t < groundingTools.length; t++) {
    var toolKey = groundingTools[t];
    var tool = summary.tools[toolKey];
    if (!tool || tool.status !== 'completed' || !tool.data) continue;

    var formData = tool.data.formData || tool.data.scoring;
    if (!formData) continue;

    var config = this.GROUNDING_CONFIG[toolKey];
    if (!config) continue;

    // Check each subdomain for belief vs behavior gap
    var subdomainKeys = Object.keys(config.subdomains);

    for (var s = 0; s < subdomainKeys.length; s++) {
      var sdKey = subdomainKeys[s];
      var label = config.subdomains[sdKey];

      // Try to get aspect-level scores
      // Naming convention: sdKey + '_belief', sdKey + '_behavior', etc.
      // Or from formData questions array
      var beliefScore = null;
      var behaviorScore = null;

      // Method 1: Direct aspect keys in scoring
      if (formData.aspectScores) {
        beliefScore = formData.aspectScores[sdKey + '_belief'];
        var beh = formData.aspectScores[sdKey + '_behavior'];
        var feel = formData.aspectScores[sdKey + '_feeling'];
        var cons = formData.aspectScores[sdKey + '_consequence'];

        // Average behavior/feeling/consequence as the "action" cluster
        var actionParts = [beh, feel, cons].filter(function(v) { return v !== null && v !== undefined; });
        if (actionParts.length > 0) {
          behaviorScore = actionParts.reduce(function(sum, v) { return sum + v; }, 0) / actionParts.length;
        }
      }

      // Method 2: From question-level data (questions grouped by subdomain)
      if (beliefScore === null && formData.questions) {
        var sdQuestions = formData.questions.filter(function(q) {
          return q.subdomain === sdKey;
        });

        if (sdQuestions.length >= 4) {
          // First question is typically belief, rest are behavior/feeling/consequence
          var beliefQ = sdQuestions.find(function(q) { return q.aspect === 'belief'; });
          var actionQs = sdQuestions.filter(function(q) { return q.aspect !== 'belief'; });

          if (beliefQ) beliefScore = beliefQ.score;
          if (actionQs.length > 0) {
            behaviorScore = actionQs.reduce(function(sum, q) { return sum + q.score; }, 0) / actionQs.length;
          }
        }
      }

      // Calculate gap if both scores available
      if (beliefScore !== null && behaviorScore !== null) {
        var gap = beliefScore - behaviorScore;
        var absGap = Math.abs(gap);

        if (absGap > 2.0) {
          var direction = gap > 0 ? 'Belief exceeds action' : 'Action exceeds belief';
          var interpretation = gap > 0
            ? 'You believe this strongly but your behavior does not fully reflect it. This suggests internal conflict — part of you resists what another part believes.'
            : 'You act on this more than you consciously believe it. This pattern often runs on autopilot without your awareness.';

          var toolName = this.TOOL_META[toolKey].shortName;
          gaps.push({
            subdomain: sdKey,
            tool: toolName,
            toolKey: toolKey,
            label: label,
            beliefScore: Math.round(beliefScore * 10) / 10,
            behaviorScore: Math.round(behaviorScore * 10) / 10,
            gap: Math.round(absGap * 10) / 10,
            direction: direction,
            interpretation: interpretation
          });
        }
      }
    }
  }

  // Sort by gap magnitude (largest first)
  gaps.sort(function(a, b) {
    return b.gap - a.gap;
  });

  return gaps;
},
```

## Where to Place the Code

All three functions go in the `// INTEGRATION ENGINES` section, right after `_generateWarnings()` from Phase 2.

Order in the section should now be:
1. `_detectProfile()` (Phase 1)
2. `_calculateAverageStress()` (Phase 2)
3. `_getSubdomainScore()` (Phase 2)
4. `_getOverallQuotient()` (Phase 2)
5. `_generateWarnings()` (Phase 2)
6. `_calculateAwarenessGap()` (Phase 3 — this file)
7. `_detectBeliefLocks()` (Phase 3 — this file)
8. `_detectBeliefBehaviorGaps()` (Phase 3 — this file)

## Test Function

```javascript
function testPhase3_AllEngines() {
  var testClientId = 'TEST_STUDENT_EMAIL';

  var summary = CollectiveResults.getStudentSummary(testClientId);
  Logger.log('=== PHASE 3 TEST: ' + testClientId + ' ===');
  Logger.log('Completed tools: ' + summary.completedCount);

  // Test Awareness Gap
  var gap = CollectiveResults._calculateAwarenessGap(summary);
  if (gap) {
    Logger.log('--- Awareness Gap ---');
    Logger.log('Psych Score: ' + gap.psychScore + '/100');
    Logger.log('Stress Score: ' + gap.stressScore + '/100');
    Logger.log('Gap: ' + gap.gapScore + ' points');
    Logger.log('Severity: ' + gap.severity);
  } else {
    Logger.log('Awareness Gap: Not enough data');
  }

  // Test Belief Locks
  var locks = CollectiveResults._detectBeliefLocks(summary);
  Logger.log('--- Belief Locks: ' + locks.length + ' detected ---');
  for (var i = 0; i < locks.length; i++) {
    var lock = locks[i];
    Logger.log('[' + lock.strength + '] ' + lock.name + ' (avg: ' + lock.avgScore + ')');
    for (var b = 0; b < lock.beliefs.length; b++) {
      Logger.log('  - ' + lock.beliefs[b].label + ' (' + lock.beliefs[b].score + '/100) via ' + lock.beliefs[b].tool);
    }
  }

  // Test Belief-Behavior Gaps
  var bbGaps = CollectiveResults._detectBeliefBehaviorGaps(summary);
  Logger.log('--- Belief-Behavior Gaps: ' + bbGaps.length + ' detected ---');
  for (var j = 0; j < bbGaps.length; j++) {
    var g = bbGaps[j];
    Logger.log(g.tool + ': "' + g.label + '"');
    Logger.log('  Belief: ' + g.beliefScore + ' | Action: ' + g.behaviorScore + ' | Gap: ' + g.gap);
    Logger.log('  Direction: ' + g.direction);
  }

  // Run ALL engines together as integration test
  Logger.log('--- FULL ENGINE RUN ---');
  var profile = CollectiveResults._detectProfile(summary);
  var warnings = CollectiveResults._generateWarnings(summary);
  Logger.log('Profile: ' + (profile ? profile.name : 'none'));
  Logger.log('Warnings: ' + warnings.length);
  Logger.log('Locks: ' + locks.length);
  Logger.log('Awareness Gap: ' + (gap ? gap.severity : 'none'));
  Logger.log('B-B Gaps: ' + bbGaps.length);
}
```

## Important Notes on Belief-Behavior Gaps

The `_detectBeliefBehaviorGaps()` function tries two methods to get aspect-level data:

1. **Method 1**: Looks for `data.scoring.aspectScores` — a pre-computed object with keys like `subdomain_1_1_belief`
2. **Method 2**: Looks for `data.formData.questions` — an array of question objects with `.aspect` and `.score` properties

During testing, check what your grounding tools actually store. If neither method finds data, the function will simply return an empty array — it will not error. If both methods fail for all students, we will need to check the actual grounding tool data structure and adjust the key names. This is a known variable that we will validate during testing.

## Verification Checklist

- [ ] `_calculateAwarenessGap()` returns correct gap for student with grounding + Tool 2
- [ ] `_calculateAwarenessGap()` returns null when Tool 2 missing
- [ ] `_calculateAwarenessGap()` severity correctly classifies: > 30 = critical, 15-30 = elevated, < 15 = normal
- [ ] `_detectBeliefLocks()` finds locks where ALL belief scores exceed thresholds
- [ ] `_detectBeliefLocks()` returns empty array when no patterns fully match
- [ ] `_detectBeliefLocks()` correctly classifies strength: strong (avg > 70), moderate, emerging (avg < 55)
- [ ] `_detectBeliefBehaviorGaps()` returns gaps or empty array (no errors either way)
- [ ] All five engines run together without conflicts
- [ ] No UI changes — Section 3 still shows placeholder
- [ ] No escaped apostrophes
- [ ] All messages use full words (no contractions)
