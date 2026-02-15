# Phase 1: Constants and Profile Detection Engine

## Goal
Add the Integration Profile system — constants and detection logic. No UI changes. Students see no difference after this phase.

## Files to Read First
- `core/CollectiveResults.js` — lines 1-95 (constants section + getStudentSummary)
- Understand the `summary` object shape returned by `getStudentSummary()`

## Summary Object Shape (For Reference)

This is what `getStudentSummary(clientId)` returns. All detection engines receive this object.

```javascript
{
  clientId: 'student@email.com',
  completedCount: 5,
  totalTools: 8,
  tools: {
    tool1: {
      status: 'completed',     // or 'in_progress' or 'not_started'
      data: {
        winner: 'Control',     // One of: FSV, ExVal, Showing, Receiving, Control, Fear
        scores: {
          FSV: -5,             // Range: -25 to +25
          ExVal: 12,
          Showing: -8,
          Receiving: 3,
          Control: 18,
          Fear: 7
        }
      },
      timestamp: '2025-01-15T...'
    },
    tool2: {
      status: 'completed',
      data: {
        archetype: 'Wealth Architect',
        results: {
          benchmarks: {
            moneyFlow:   { score: 72, stress: 3 },
            obligations: { score: 45, stress: -2 },
            liquidity:   { score: 58, stress: 1 },
            growth:      { score: 80, stress: 5 },
            protection:  { score: 35, stress: -1 }
          }
        }
      }
    },
    tool3: {
      status: 'completed',
      data: {
        scoring: {
          overallQuotient: 62,
          domain1Quotient: 58,
          domain2Quotient: 66,
          subdomainQuotients: {
            subdomain_1_1: 72,  // "I am Not Worthy of Financial Freedom"
            subdomain_1_2: 45,  // "I will Never Have Enough"
            subdomain_1_3: 58,  // "I Cannot See My Financial Reality"
            subdomain_2_1: 70,  // "Money Shows My Worth"
            subdomain_2_2: 55,  // "What Will They Think?"
            subdomain_2_3: 73   // "I Need to Prove I am Successful"
          }
        }
      }
    },
    // tool5 and tool7 have same structure as tool3
    tool4: {
      status: 'completed',
      data: {
        allocations: {
          M: 15,   // Multiply %
          E: 55,   // Essentials %
          F: 20,   // Freedom %
          J: 10    // Joy %
        }
      }
    },
    // tool6, tool8 similar
  }
}
```

## What to Add

### 1. INTEGRATION_PROFILES Constant

Add this immediately after the existing `DOMAIN_LABELS` constant (around line 81 in CollectiveResults.js):

```javascript
INTEGRATION_PROFILES: {
  guardian: {
    name: 'The Guardian',
    icon: '🛡️',
    triggers: { tool1Winner: 'Control', groundingKey: 'tool7', subdomainKey: 'subdomain_1_3', threshold: 50 },
    description: 'You take full responsibility for your financial world. That strength becomes a wall when it blocks you from accepting help or delegating financial decisions.',
    financialSignature: 'Low obligation spending, high self-reliance, growth may stagnate from isolation.'
  },
  provider: {
    name: 'The Provider',
    icon: '❤️',
    triggers: { tool1Winner: 'Showing', groundingKey: 'tool5', subdomainKey: 'subdomain_1_1', threshold: 50 },
    description: 'You pour your financial energy into others. Your budgets often prioritize everyone else before they prioritize you.',
    financialSignature: 'High essentials allocation, low personal savings, freedom category underfunded.'
  },
  achiever: {
    name: 'The Achiever',
    icon: '🏆',
    triggers: { tool1Winner: 'FSV', groundingKey: 'tool3', subdomainKey: 'subdomain_2_1', threshold: 50 },
    description: 'You build wealth to prove something. Your financial engine runs hot, but the fuel is shame rather than strategy.',
    financialSignature: 'Growth-focused allocation, but motivation is compensatory rather than strategic.'
  },
  protector: {
    name: 'The Protector',
    icon: '🔒',
    triggers: { tool1Winner: 'Fear', groundingKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50 },
    description: 'You know the dangers but cannot bring yourself to build real protection. The fear that should motivate you has become the thing that freezes you.',
    financialSignature: 'Protection domain underserved, growth paralyzed, sabotage risk elevated.'
  },
  connector: {
    name: 'The Connector',
    icon: '🔗',
    triggers: { tool1Winner: 'Receiving', groundingKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 50 },
    description: 'You experience money as a relationship currency. Financial obligations feel like emotional obligations, and both keep growing.',
    financialSignature: 'Obligation spending elevated, debt patterns, essentials include perceived debts to others.'
  },
  seeker: {
    name: 'The Seeker',
    icon: '🔍',
    triggers: null, // Fallback — no dominant pattern
    description: 'Your patterns do not point to a single dominant strategy. You are navigating multiple influences at once, which means broad awareness matters more than any single fix.',
    financialSignature: 'Mixed financial indicators, no single pattern dominates.'
  }
},
```

### 2. _detectProfile(summary) Function

Add this as a new method on the `CollectiveResults` object. Place it after `_renderSection3` (around line 348) with a clear section comment:

```javascript
// ============================================================
// INTEGRATION ENGINES (Section 3 Data Detection)
// ============================================================

/**
 * Detect the student's integration profile based on Tool 1 winner
 * and corresponding grounding tool scores.
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Object|null} - { key, name, icon, description, financialSignature, confidence, sources }
 */
_detectProfile(summary) {
  var tool1 = summary.tools.tool1;
  if (!tool1 || tool1.status !== 'completed' || !tool1.data) return null;

  var winner = tool1.data.winner;
  if (!winner) return null;

  // Check each profile's trigger conditions
  var profileKeys = ['guardian', 'provider', 'achiever', 'protector', 'connector'];

  for (var i = 0; i < profileKeys.length; i++) {
    var key = profileKeys[i];
    var profile = this.INTEGRATION_PROFILES[key];
    var triggers = profile.triggers;

    // Does Tool 1 winner match?
    if (triggers.tool1Winner !== winner) continue;

    // Does the grounding tool have data?
    var groundingTool = summary.tools[triggers.groundingKey];
    if (!groundingTool || groundingTool.status !== 'completed' || !groundingTool.data) {
      // Winner matches but grounding not completed — assign with low confidence
      return {
        key: key,
        name: profile.name,
        icon: profile.icon,
        description: profile.description,
        financialSignature: profile.financialSignature,
        confidence: 'partial',
        sources: ['Tool 1: ' + this.STRATEGY_LABELS[winner]]
      };
    }

    // Check subdomain score against threshold
    var scoring = groundingTool.data.scoring;
    var subdomainQuotients = scoring && scoring.subdomainQuotients;
    var subdomainScore = subdomainQuotients && subdomainQuotients[triggers.subdomainKey];

    if (subdomainScore !== null && subdomainScore !== undefined && subdomainScore >= triggers.threshold) {
      // Full match — high confidence
      var groundingName = this.TOOL_META[triggers.groundingKey].shortName;
      var subdomainLabel = this.GROUNDING_CONFIG[triggers.groundingKey].subdomains[triggers.subdomainKey];

      return {
        key: key,
        name: profile.name,
        icon: profile.icon,
        description: profile.description,
        financialSignature: profile.financialSignature,
        confidence: 'high',
        sources: [
          'Tool 1: ' + this.STRATEGY_LABELS[winner],
          groundingName + ': "' + subdomainLabel + '" (' + Math.round(subdomainScore) + '/100)'
        ]
      };
    }

    // Winner matches but subdomain below threshold — partial confidence
    return {
      key: key,
      name: profile.name,
      icon: profile.icon,
      description: profile.description,
      financialSignature: profile.financialSignature,
      confidence: 'partial',
      sources: ['Tool 1: ' + this.STRATEGY_LABELS[winner]]
    };
  }

  // No specific profile matched — ExVal winner or other edge case
  var seekerProfile = this.INTEGRATION_PROFILES.seeker;
  return {
    key: 'seeker',
    name: seekerProfile.name,
    icon: seekerProfile.icon,
    description: seekerProfile.description,
    financialSignature: seekerProfile.financialSignature,
    confidence: 'default',
    sources: ['Tool 1: ' + this.STRATEGY_LABELS[winner] + ' (no specific profile match)']
  };
},
```

## Where to Place the Code

1. `INTEGRATION_PROFILES` constant → right after `DOMAIN_LABELS` (line ~81), before the `REPORT_TOOLS` line
2. `_detectProfile()` method → right after the closing of `_renderSection3()` (line ~348), with a new section comment block

## Test Function

Create this temporary test function in the Apps Script editor (not in CollectiveResults.js — put it in a scratch file or at the bottom of Code.js temporarily):

```javascript
function testPhase1_ProfileDetection() {
  // Replace with a real student email who has Tool 1 + at least one grounding tool completed
  var testClientId = 'TEST_STUDENT_EMAIL';

  var summary = CollectiveResults.getStudentSummary(testClientId);
  Logger.log('Student: ' + testClientId);
  Logger.log('Completed tools: ' + summary.completedCount);
  Logger.log('Tool 1 winner: ' + (summary.tools.tool1.data ? summary.tools.tool1.data.winner : 'N/A'));

  var profile = CollectiveResults._detectProfile(summary);
  if (profile) {
    Logger.log('--- Profile Detected ---');
    Logger.log('Name: ' + profile.name);
    Logger.log('Confidence: ' + profile.confidence);
    Logger.log('Description: ' + profile.description);
    Logger.log('Sources: ' + profile.sources.join(' | '));
  } else {
    Logger.log('No profile detected (Tool 1 not completed)');
  }
}
```

Run this function from the Apps Script editor. You should see a profile name logged.

## Verification Checklist

- [ ] `INTEGRATION_PROFILES` constant added after `DOMAIN_LABELS`
- [ ] `_detectProfile()` function added after `_renderSection3()`
- [ ] Section comment block `// INTEGRATION ENGINES` is clear and visible
- [ ] Test function runs without errors
- [ ] Profile returns correctly for a student with Tool 1 + grounding tool
- [ ] Profile returns with `confidence: 'partial'` when grounding tool not completed
- [ ] Profile returns `seeker` for ExVal winner or unmatched winner
- [ ] No UI changes visible — Section 3 still shows placeholder
- [ ] No escaped apostrophes in any string literals
- [ ] No `window.location.reload()` added
