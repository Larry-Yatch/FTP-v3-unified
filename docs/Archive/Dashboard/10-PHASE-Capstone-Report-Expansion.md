# Phase 10: Capstone Report — Expanding the Integration Report with Per-Tool Data

## Goal
Transform the current Integration Report (which only contains detection engine outputs + GPT narrative) into a comprehensive **Capstone Report** — the definitive document of a student's TruPath journey. The expanded report includes per-tool assessment summaries before the integration analysis, making it a standalone document a student can bring to coaching sessions or review without being logged in.

## Prerequisites
- Phases 1-9 complete (detection engines, GPT narrative, PDF generation, download button)
- All per-tool report infrastructure working (Tool1Report through Tool8, GroundingReport)
- OpenAI API key configured in Script Properties

## Files to Read First
- `shared/PDFGenerator.js` — `generateIntegrationPDF()`, `buildIntegrationReportBody()`, `getIntegrationStyles()` (the current report we are expanding)
- `core/IntegrationGPT.js` — current prompt structure and narrative sections (we are adding 2 new narrative sections)
- `core/CollectiveResults.js` — `getStudentSummary()` for per-tool data access, `_renderSection1()` and `_renderSection2()` for what the web dashboard shows per tool
- `tools/tool1/Tool1Report.js` — `getResults()` for Tool 1 data shape
- `tools/tool2/Tool2Report.js` — `getResults()` for Tool 2 data shape (includes `gptInsights`)
- `core/grounding/GroundingReport.js` — `getResults()` for Tools 3/5/7 data shape (includes `scoring`, `gptInsights`, `syntheses`)
- `tools/tool6/Tool6Report.js` — for Tool 6 data shape
- `tools/tool8/Tool8Report.js` — for Tool 8 data shape

## Architecture

### Current Report Structure (Phase 9)
```
Integration Report PDF
├── Header (TruPath + student name + date)
├── Source tag (Personalized / Standard)
├── Intro paragraph + Report Coverage banner
├── Section 1: Integration Profile (detection engine)
├── Section 2: Awareness Gap (detection engine)
├── Section 3: Active Warnings (detection engine)
├── Section 4: Belief Locks (detection engine)
├── Section 5: Belief-Behavior Gaps (detection engine)
├── The Big Picture (GPT synthesis)
├── Your Next Steps (GPT action items)
├── Unlock More Insights (missing tools)
└── Footer
```

### New Capstone Report Structure (Phase 10)
```
Capstone Report PDF
├── Cover Page
│   ├── TruPath logo + "Your TruPath Capstone Report"
│   ├── Student name + date
│   └── Report completion summary (X of 8 tools)
│
├── PART 1: Your Psychological Foundation
│   ├── Part header + connecting narrative (GPT — NEW)
│   ├── Tool 1: Core Trauma Strategy
│   │   ├── Dominant strategy name + description
│   │   ├── All 6 strategy scores (visual bars)
│   │   └── Key insight about dominant pattern
│   ├── Tool 3: Identity & Validation (if completed)
│   │   ├── Overall quotient score
│   │   ├── 2 domain scores with labels
│   │   ├── Top 3 strongest/weakest subdomains
│   │   └── Reused GPT synthesis from tool submission
│   ├── Tool 5: Love & Connection (if completed)
│   │   ├── (same structure as Tool 3)
│   │   └── Reused GPT synthesis from tool submission
│   └── Tool 7: Security & Control (if completed)
│       ├── (same structure as Tool 3)
│       └── Reused GPT synthesis from tool submission
│
├── PART 2: Your Financial Landscape
│   ├── Part header + connecting narrative (GPT — NEW)
│   ├── Tool 2: Financial Clarity (if completed)
│   │   ├── Archetype name
│   │   ├── 5 domain clarity scores (visual bars)
│   │   ├── Priority domain
│   │   └── Reused GPT overall insight
│   ├── Tool 4: Budget Framework (if completed)
│   │   ├── Monthly income
│   │   ├── M/E/F/J allocation percentages
│   │   ├── Dollar amounts per bucket
│   │   └── Priority selection
│   ├── Tool 6: Retirement Blueprint (if completed)
│   │   ├── Profile ID (e.g., "Early Accumulator")
│   │   ├── Monthly budget + projected balance
│   │   ├── Investment score
│   │   └── Tax strategy
│   └── Tool 8: Investment Planning (if completed)
│       ├── Scenario name + mode
│       ├── Monthly investment + time horizon
│       ├── Risk level + projected balance
│       └── Feasibility assessment
│
├── PART 3: The Integration (existing Phase 9 content)
│   ├── Part header
│   ├── Integration Profile card
│   ├── Awareness Gap visualization
│   ├── Active Warnings
│   ├── Belief Locks
│   ├── Belief-Behavior Gaps
│   └── The Big Picture (GPT synthesis — expanded)
│
├── PART 4: Your Path Forward
│   ├── Personalized action items (5-7, expanded from current 3-5)
│   ├── Incomplete tools list with specific benefits
│   └── Closing statement
│
└── Footer
```

## What This Means for the Student

**Before (Phase 9):** The student downloads a report that tells them what their patterns mean together, but has zero reference to their actual scores, findings, or per-tool data. It is like getting a book review without having read the book.

**After (Phase 10):** The student downloads a comprehensive document they can bring to a coaching session that contains:
1. All their psychological scores and what they mean
2. All their financial data and allocations
3. How these patterns interact (the existing detection engine analysis)
4. What to do next

This is the **capstone of the course** — the single document that captures their entire TruPath journey.

## Data Access Strategy

### What Data is Already Loaded

`getStudentSummary()` already loads `DataService.getLatestResponse()` for ALL 8 tools. For each tool, `response.data` contains the raw assessment data. This is the same data used by Section 1 and Section 2 rendering on the web dashboard.

However, for richer data (GPT insights, scoring breakdowns, syntheses), we need per-tool `getResults()` calls. The tradeoff:

| Approach | Data Richness | Speed | Cost |
|----------|--------------|-------|------|
| Summary data only (`summary.tools.toolX.data`) | Basic scores, no GPT | ~1s | Free |
| Full per-tool results (`ToolXReport.getResults()`) | Scores + GPT insights + syntheses | ~3-5s | Free (already generated) |

**Decision: Use full per-tool results.** This is the capstone document — it should contain the richest possible data. The per-tool GPT insights were already generated and stored during original tool submission. We are reusing them, not re-generating. The added time (~3-5s for data fetching) is well within the 30-second GAS limit since the GPT narrative call takes ~4-6 seconds and that runs in parallel conceptually.

### Data Fetching Plan

Add a `_gatherPerToolData(summary)` method to PDFGenerator.js that:
1. Takes the existing summary object
2. Calls `getResults()` for each completed tool
3. Returns a structured object with all per-tool data
4. Handles missing tools gracefully (null for incomplete tools)

```javascript
/**
 * Gather rich per-tool data for the Capstone Report.
 * Uses existing ToolXReport.getResults() methods to get full data
 * including GPT insights that were generated at submission time.
 *
 * @param {Object} summary - from getStudentSummary()
 * @returns {Object} Per-tool data keyed by tool number
 */
_gatherPerToolData(summary) {
  var clientId = summary.clientId;
  var data = {
    tool1: null,
    tool2: null,
    tool3: null,
    tool4: null,
    tool5: null,
    tool6: null,
    tool7: null,
    tool8: null
  };

  try {
    // Tool 1: Core Trauma Strategy
    if (summary.tools.tool1 && summary.tools.tool1.status === 'completed') {
      try {
        data.tool1 = Tool1Report.getResults(clientId);
      } catch (e) {
        Logger.log('[Capstone] Tool 1 data fetch failed: ' + e.message);
      }
    }

    // Tool 2: Financial Clarity
    if (summary.tools.tool2 && summary.tools.tool2.status === 'completed') {
      try {
        data.tool2 = Tool2Report.getResults(clientId);
      } catch (e) {
        Logger.log('[Capstone] Tool 2 data fetch failed: ' + e.message);
      }
    }

    // Tool 3: Identity & Validation (Grounding)
    if (summary.tools.tool3 && summary.tools.tool3.status === 'completed') {
      try {
        data.tool3 = GroundingReport.getResults(clientId, 'tool3');
      } catch (e) {
        Logger.log('[Capstone] Tool 3 data fetch failed: ' + e.message);
      }
    }

    // Tool 4: Budget Framework
    // Tool 4 data comes from summary directly — no separate Report class
    if (summary.tools.tool4 && summary.tools.tool4.status === 'completed') {
      var t4 = summary.tools.tool4.data;
      if (t4) {
        data.tool4 = {
          monthlyIncome: t4.monthlyIncome || 0,
          multiply: t4.multiply || 0,
          essentials: t4.essentials || 0,
          freedom: t4.freedom || 0,
          enjoyment: t4.enjoyment || 0,
          priority: t4.priority || 'Not selected'
        };
      }
    }

    // Tool 5: Love & Connection (Grounding)
    if (summary.tools.tool5 && summary.tools.tool5.status === 'completed') {
      try {
        data.tool5 = GroundingReport.getResults(clientId, 'tool5');
      } catch (e) {
        Logger.log('[Capstone] Tool 5 data fetch failed: ' + e.message);
      }
    }

    // Tool 6: Retirement Blueprint
    if (summary.tools.tool6 && summary.tools.tool6.status === 'completed') {
      try {
        data.tool6 = Tool6Report.getResults(clientId);
      } catch (e) {
        Logger.log('[Capstone] Tool 6 data fetch failed: ' + e.message);
      }
    }

    // Tool 7: Security & Control (Grounding)
    if (summary.tools.tool7 && summary.tools.tool7.status === 'completed') {
      try {
        data.tool7 = GroundingReport.getResults(clientId, 'tool7');
      } catch (e) {
        Logger.log('[Capstone] Tool 7 data fetch failed: ' + e.message);
      }
    }

    // Tool 8: Investment Planning
    if (summary.tools.tool8 && summary.tools.tool8.status === 'completed') {
      try {
        data.tool8 = Tool8Report.getResults(clientId);
      } catch (e) {
        Logger.log('[Capstone] Tool 8 data fetch failed: ' + e.message);
      }
    }

  } catch (e) {
    Logger.log('[Capstone] Per-tool data gathering error: ' + e.message);
  }

  return data;
},
```

## GPT Prompt Expansion

### Current GPT Narrative (Phase 8)
Produces 6 sections: `profileNarrative`, `warningNarrative`, `lockNarrative`, `gapNarrative`, `overallSynthesis`, `actionItems`

### New GPT Narrative (Phase 10)
Add 2 new sections that connect the per-tool data to the integration analysis:

1. **`psychFoundationNarrative`** — 3-5 sentences connecting Tool 1 findings to the grounding tool patterns. "Your dominant [strategy] from Tool 1 creates a foundation that shows up in how you [domain findings from grounding tools]..."
2. **`financialLandscapeNarrative`** — 3-5 sentences connecting Tool 2 clarity domains to Tool 4 allocations and Tool 6/8 projections. "Your financial clarity in [domains] directly shapes how you allocate your budget and plan for retirement..."

These narratives bridge Parts 1 and 2 (per-tool data) with Part 3 (integration analysis). They give the student context for WHY their scores matter before showing the detection engine findings.

### Updated System Prompt

```javascript
buildSystemPrompt() {
  return 'You are a financial psychology coach writing a personalized capstone report for a student. ' +
    'The student has completed psychological and financial assessments. Your job is to weave the analytical findings ' +
    'into a cohesive narrative that reads like a coach speaking directly to the student. ' +
    '\n\n' +
    'TONE: Direct but compassionate. Do not soften the truth. These students are used to hearing it straight. ' +
    'Use "you" throughout. No hedging language ("might", "perhaps", "could be"). Say what IS happening. ' +
    '\n\n' +
    'LANGUAGE RULES: ' +
    'Do not use contractions (write "do not" instead of the short form, "you are" instead of the short form). ' +
    'Do not use clinical or diagnostic language. This is coaching, not therapy. ' +
    '\n\n' +
    'STRUCTURE: Return your response in exactly this format with these section markers. ' +
    'IMPORTANT: Some sections may have no data if the student has not completed all tools. ' +
    'Only write sections where data is provided. Skip markers for empty sections. ' +
    'OVERALL_SYNTHESIS, ACTION_ITEMS, PSYCH_FOUNDATION_NARRATIVE, and FINANCIAL_LANDSCAPE_NARRATIVE are always required.' +
    '\n\n' +
    'PSYCH_FOUNDATION_NARRATIVE: (3-5 sentences connecting their trauma strategy to their grounding tool patterns. How does their core defense mechanism show up in their identity, relationships, and need for control? This introduces Part 1 of the report.) ' +
    '\n' +
    'FINANCIAL_LANDSCAPE_NARRATIVE: (3-5 sentences connecting their financial clarity to their budget, retirement, and investment choices. How do their clarity gaps shape their financial decisions? This introduces Part 2 of the report.) ' +
    '\n' +
    'PROFILE_NARRATIVE: (2-3 sentences connecting their profile name to their lived experience) ' +
    '\n' +
    'WARNING_NARRATIVE: (3-5 sentences weaving the warnings into a cause-and-effect story) ' +
    '\n' +
    'LOCK_NARRATIVE: (2-4 sentences explaining how their beliefs reinforce each other) ' +
    '\n' +
    'GAP_NARRATIVE: (2-3 sentences about their awareness gap and/or belief-behavior gaps) ' +
    '\n' +
    'OVERALL_SYNTHESIS: (4-6 sentences — the big picture. This is the capstone moment. Connect ALL tools: psychological patterns, financial clarity, budget allocations, retirement projections, and the integration findings. End with a forward-looking, hopeful statement. REQUIRED even with partial data.) ' +
    '\n' +
    'ACTION_ITEMS: (5-7 specific, actionable next steps as a numbered list. Include at least 1 psychological action, 1 financial action, and 1 integration action. If tools are incomplete, include completing specific tools. REQUIRED.)';
},
```

### Updated User Prompt

Add per-tool data context to the existing user prompt:

```javascript
buildUserPrompt(analysisData) {
  var profile = analysisData.profile;
  var warnings = analysisData.warnings;
  var gap = analysisData.awarenessGap;
  var locks = analysisData.locks;
  var bbGaps = analysisData.bbGaps;
  var summary = analysisData.summary;
  var perToolData = analysisData.perToolData; // NEW — from _gatherPerToolData()

  var prompt = 'Here is the student analysis data. Write the capstone narrative based on these findings.\n\n';

  // === NEW: PER-TOOL ASSESSMENT DATA ===

  // Tool 1
  if (perToolData && perToolData.tool1) {
    var t1 = perToolData.tool1;
    prompt += '=== TOOL 1: CORE TRAUMA STRATEGY ===\n';
    prompt += 'Dominant Strategy: ' + t1.winner + '\n';
    if (t1.scores) {
      prompt += 'Scores: ';
      var scoreStrs = [];
      for (var key in t1.scores) {
        scoreStrs.push(key + '=' + t1.scores[key]);
      }
      prompt += scoreStrs.join(', ') + '\n';
    }
    prompt += '\n';
  }

  // Grounding Tools (3, 5, 7)
  var groundingToolNames = { tool3: 'IDENTITY & VALIDATION', tool5: 'LOVE & CONNECTION', tool7: 'SECURITY & CONTROL' };
  var groundingToolNumbers = { tool3: 3, tool5: 5, tool7: 7 };
  ['tool3', 'tool5', 'tool7'].forEach(function(toolKey) {
    if (perToolData && perToolData[toolKey]) {
      var gt = perToolData[toolKey];
      prompt += '=== TOOL ' + groundingToolNumbers[toolKey] + ': ' + groundingToolNames[toolKey] + ' ===\n';
      if (gt.scoring) {
        prompt += 'Overall Quotient: ' + gt.scoring.overallQuotient + '/100\n';
        if (gt.scoring.domainQuotients) {
          for (var dk in gt.scoring.domainQuotients) {
            prompt += 'Domain "' + dk + '": ' + gt.scoring.domainQuotients[dk] + '/100\n';
          }
        }
      }
      if (gt.syntheses && gt.syntheses.overall) {
        prompt += 'Overall Synthesis: ' + gt.syntheses.overall.summary + '\n';
      }
      prompt += '\n';
    }
  });

  // Tool 2
  if (perToolData && perToolData.tool2) {
    var t2 = perToolData.tool2;
    prompt += '=== TOOL 2: FINANCIAL CLARITY ===\n';
    if (t2.results) {
      if (t2.results.archetype) prompt += 'Archetype: ' + t2.results.archetype + '\n';
      if (t2.results.domainScores) {
        prompt += 'Domain Scores: ';
        var domStrs = [];
        for (var dom in t2.results.domainScores) {
          domStrs.push(dom + '=' + t2.results.domainScores[dom] + '%');
        }
        prompt += domStrs.join(', ') + '\n';
      }
      if (t2.results.priorityList && t2.results.priorityList.length > 0) {
        prompt += 'Top Priority: ' + t2.results.priorityList[0].domain + '\n';
      }
    }
    if (t2.overallInsight) {
      prompt += 'Overall Insight: ' + t2.overallInsight.summary + '\n';
    }
    prompt += '\n';
  }

  // Tool 4
  if (perToolData && perToolData.tool4) {
    var t4 = perToolData.tool4;
    prompt += '=== TOOL 4: BUDGET FRAMEWORK ===\n';
    prompt += 'Monthly Income: $' + t4.monthlyIncome + '\n';
    prompt += 'Allocations: Multiply=' + t4.multiply + '%, Essentials=' + t4.essentials + '%, Freedom=' + t4.freedom + '%, Enjoyment=' + t4.enjoyment + '%\n';
    prompt += 'Priority: ' + t4.priority + '\n\n';
  }

  // Tool 6
  if (perToolData && perToolData.tool6) {
    var t6 = perToolData.tool6;
    prompt += '=== TOOL 6: RETIREMENT BLUEPRINT ===\n';
    if (t6.profileId) prompt += 'Profile: ' + t6.profileId + '\n';
    if (t6.monthlyBudget) prompt += 'Monthly Budget: $' + t6.monthlyBudget + '\n';
    if (t6.projectedBalance) prompt += 'Projected Balance: $' + t6.projectedBalance + '\n';
    if (t6.investmentScore !== undefined) prompt += 'Investment Score: ' + t6.investmentScore + '/10\n';
    if (t6.taxStrategy) prompt += 'Tax Strategy: ' + t6.taxStrategy + '\n';
    prompt += '\n';
  }

  // Tool 8
  if (perToolData && perToolData.tool8) {
    var t8 = perToolData.tool8;
    prompt += '=== TOOL 8: INVESTMENT PLANNING ===\n';
    if (t8.scenarioName) prompt += 'Scenario: ' + t8.scenarioName + '\n';
    if (t8.monthlyInvestment) prompt += 'Monthly Investment: $' + t8.monthlyInvestment + '\n';
    if (t8.timeHorizon) prompt += 'Time Horizon: ' + t8.timeHorizon + ' years\n';
    if (t8.risk !== undefined) prompt += 'Risk Level: ' + t8.risk + '/10\n';
    if (t8.projectedBalance) prompt += 'Projected Balance: $' + t8.projectedBalance + '\n';
    if (t8.feasibility) prompt += 'Feasibility: ' + t8.feasibility + '\n';
    prompt += '\n';
  }

  // === EXISTING: DETECTION ENGINE DATA ===

  // Profile (from Phase 8 — unchanged)
  if (profile) {
    prompt += '=== INTEGRATION PROFILE ===\n';
    prompt += 'Profile: ' + profile.name + ' (' + profile.confidence + ' confidence)\n';
    prompt += 'Description: ' + profile.description + '\n';
    prompt += 'Financial Signature: ' + profile.financialSignature + '\n';
    prompt += 'Sources: ' + profile.sources.join(', ') + '\n\n';
  }

  // Warnings (from Phase 8 — unchanged)
  if (warnings && warnings.length > 0) {
    prompt += '=== ACTIVE WARNINGS (' + warnings.length + ') ===\n';
    for (var w = 0; w < warnings.length; w++) {
      var warning = warnings[w];
      prompt += '- ' + warning.type + ' (' + warning.priority + '): ' + warning.message + '\n';
    }
    prompt += '\n';
  }

  // Awareness Gap (from Phase 8 — unchanged)
  if (gap) {
    prompt += '=== AWARENESS GAP ===\n';
    prompt += 'Severity: ' + gap.severity + '\n';
    prompt += 'Psychological Score: ' + gap.psychScore + '/100\n';
    prompt += 'Stress Score: ' + gap.stressScore + '/100\n';
    prompt += 'Gap: ' + gap.gapScore + ' points\n\n';
  }

  // Locks (from Phase 8 — unchanged)
  if (locks && locks.length > 0) {
    prompt += '=== BELIEF LOCKS (' + locks.length + ') ===\n';
    for (var l = 0; l < locks.length; l++) {
      var lock = locks[l];
      prompt += '- ' + lock.name + ' (' + lock.strength + '): ';
      prompt += lock.beliefs.map(function(b) { return b.label + ' (' + b.tool + ': ' + b.score + ')'; }).join(' + ');
      prompt += ' => ' + lock.financialImpact + '\n';
    }
    prompt += '\n';
  }

  // Belief-Behavior Gaps (from Phase 8 — unchanged)
  if (bbGaps && bbGaps.length > 0) {
    prompt += '=== BELIEF-BEHAVIOR GAPS (' + bbGaps.length + ') ===\n';
    for (var g = 0; g < bbGaps.length; g++) {
      var bbGap = bbGaps[g];
      prompt += '- "' + bbGap.label + '" (' + bbGap.tool + '): Belief=' + bbGap.beliefScore +
        ', Action=' + bbGap.behaviorScore + ', Gap=' + bbGap.gap + ' (' + bbGap.direction + ')\n';
    }
    prompt += '\n';
  }

  // Tool completion status (from Phase 8 — unchanged)
  prompt += '=== TOOL COMPLETION ===\n';
  var toolNames = {
    tool1: 'Core Trauma Strategy',
    tool2: 'Financial Clarity',
    tool3: 'Identity & Validation',
    tool4: 'Budget Framework',
    tool5: 'Love & Connection',
    tool6: 'Retirement Blueprint',
    tool7: 'Security & Control',
    tool8: 'Investment Planning'
  };
  for (var toolKey in toolNames) {
    var tool = summary.tools[toolKey];
    var status = (tool && tool.status === 'completed') ? 'COMPLETED' : 'NOT COMPLETED';
    prompt += toolKey + ' (' + toolNames[toolKey] + '): ' + status + '\n';
  }

  return prompt;
},
```

### Updated parseNarrativeResponse

Add extraction of the 2 new section markers:

```javascript
parseNarrativeResponse(text) {
  return {
    psychFoundationNarrative: this.extractSection(text, 'PSYCH_FOUNDATION_NARRATIVE') || '',
    financialLandscapeNarrative: this.extractSection(text, 'FINANCIAL_LANDSCAPE_NARRATIVE') || '',
    profileNarrative: this.extractSection(text, 'PROFILE_NARRATIVE') || '',
    warningNarrative: this.extractSection(text, 'WARNING_NARRATIVE') || '',
    lockNarrative: this.extractSection(text, 'LOCK_NARRATIVE') || '',
    gapNarrative: this.extractSection(text, 'GAP_NARRATIVE') || '',
    overallSynthesis: this.extractSection(text, 'OVERALL_SYNTHESIS') || '',
    actionItems: this.extractActionItems(text)
  };
},
```

### Updated isValidNarrative

The 2 new sections are required (since they introduce Parts 1 and 2):

```javascript
isValidNarrative(parsed) {
  // Must have: overallSynthesis (50+ chars) + at least 2 action items
  // Must also have at least one of the two new narratives
  var hasOverall = parsed.overallSynthesis && parsed.overallSynthesis.length > 50;
  var hasActions = parsed.actionItems && parsed.actionItems.length >= 2;
  var hasFoundation = parsed.psychFoundationNarrative && parsed.psychFoundationNarrative.length > 30;
  var hasLandscape = parsed.financialLandscapeNarrative && parsed.financialLandscapeNarrative.length > 30;
  var hasNewNarrative = hasFoundation || hasLandscape;

  return hasOverall && hasActions && hasNewNarrative;
},
```

### Updated generateFallbackNarrative

Add template-based versions of the 2 new narratives:

```javascript
generateFallbackNarrative(analysisData) {
  var narrative = {
    psychFoundationNarrative: '',
    financialLandscapeNarrative: '',
    profileNarrative: '',
    warningNarrative: '',
    lockNarrative: '',
    gapNarrative: '',
    overallSynthesis: '',
    actionItems: [],
    source: 'fallback',
    timestamp: new Date().toISOString()
  };

  var perToolData = analysisData.perToolData;

  // --- Psych Foundation Narrative (NEW) ---
  if (perToolData && perToolData.tool1) {
    var strategy = perToolData.tool1.winner || 'your dominant strategy';
    var groundingParts = [];
    if (perToolData.tool3 && perToolData.tool3.scoring) {
      groundingParts.push('your identity patterns (scoring ' + perToolData.tool3.scoring.overallQuotient + '/100)');
    }
    if (perToolData.tool5 && perToolData.tool5.scoring) {
      groundingParts.push('your connection patterns (scoring ' + perToolData.tool5.scoring.overallQuotient + '/100)');
    }
    if (perToolData.tool7 && perToolData.tool7.scoring) {
      groundingParts.push('your security patterns (scoring ' + perToolData.tool7.scoring.overallQuotient + '/100)');
    }

    narrative.psychFoundationNarrative = 'Your dominant trauma strategy is ' + strategy +
      '. This core defense mechanism shapes how you approach every financial decision.';
    if (groundingParts.length > 0) {
      narrative.psychFoundationNarrative += ' The grounding assessments reveal how this shows up across ' +
        groundingParts.join(' and ') + '. The sections below show your specific scores and what they mean.';
    }
  }

  // --- Financial Landscape Narrative (NEW) ---
  var financialParts = [];
  if (perToolData && perToolData.tool2 && perToolData.tool2.results) {
    financialParts.push('your financial clarity profile reveals specific areas of strength and opportunity');
  }
  if (perToolData && perToolData.tool4) {
    financialParts.push('your budget allocation shows how you prioritize your income');
  }
  if (perToolData && perToolData.tool6) {
    financialParts.push('your retirement blueprint maps your long-term trajectory');
  }
  if (perToolData && perToolData.tool8) {
    financialParts.push('your investment plan shows how you are building toward your goals');
  }

  if (financialParts.length > 0) {
    narrative.financialLandscapeNarrative = 'Your financial assessments paint a clear picture: ' +
      financialParts.join(', ') + '. Understanding these numbers alongside your psychological patterns is the key to lasting financial change.';
  }

  // --- EXISTING FALLBACK SECTIONS (from Phase 8 — unchanged) ---
  // ... profile, warnings, locks, gap narratives ...
  // ... overallSynthesis ...
  // ... actionItems (expanded to 5-7) ...

  return narrative;
},
```

### Updated maxTokens

Increase from 1500 to 2500 to accommodate the 2 new narrative sections and expanded synthesis + action items:

```javascript
var result = this.callGPT({
  systemPrompt: systemPrompt,
  userPrompt: userPrompt,
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 2500  // was 1500
});
```

**Cost impact:** ~$0.04 per report (up from ~$0.02). Negligible increase for a capstone document.

## PDFGenerator.js Changes

### Updated generateIntegrationPDF

The main entry point needs to gather per-tool data and pass it to the narrative engine:

```javascript
generateIntegrationPDF(clientId) {
  try {
    Logger.log('[PDFGenerator] Generating Capstone Report PDF for ' + clientId);

    // 1. Get student summary and check readiness
    var summary = CollectiveResults.getStudentSummary(clientId);
    var readiness = CollectiveResults._checkReportReadiness(summary);

    if (!readiness.ready) {
      var reason = readiness.sectionCount === 0
        ? 'No integration data available yet. Complete Tool 1 and at least one other tool.'
        : 'Only ' + readiness.sectionCount + ' section available. Complete more tools for a meaningful report.';
      return { success: false, error: reason };
    }

    // Use pre-computed analysis data from readiness check
    var analysisData = readiness.analysisData;

    // 2. NEW: Gather rich per-tool data for Parts 1 and 2
    var perToolData = this._gatherPerToolData(summary);
    analysisData.perToolData = perToolData;

    // 3. Generate GPT narrative (with 3-tier fallback) — now includes per-tool context
    var narrative = IntegrationGPT.generateNarrative(analysisData);
    Logger.log('[PDFGenerator] Narrative source: ' + narrative.source);

    // 4. Build report HTML
    var styles = this.getCommonStyles() + this._getCapstoneStyles();
    var bodyContent = this._buildCapstoneReportBody(clientId, summary, analysisData, narrative, readiness, perToolData);
    var html = this.buildHTMLDocument(styles, bodyContent);

    // 5. Convert to PDF
    var fileName = this.generateFileName('CapstoneReport', clientId);
    return this.htmlToPDF(html, fileName);

  } catch (error) {
    Logger.log('[PDFGenerator] Capstone Report PDF error: ' + error);
    return { success: false, error: error.toString() };
  }
},
```

### New Method: _getCapstoneStyles

Replaces `getIntegrationStyles()`. Includes all existing integration styles plus new per-tool section styles:

```javascript
_getCapstoneStyles() {
  return '\n' +
    // Existing integration styles (unchanged)
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

    // NEW: Capstone-specific styles
    '.part-header { background: linear-gradient(135deg, #f8f6f3, #f0ebe3); border: 1px solid #d4c5a9; border-radius: 10px; padding: 20px; margin: 30px 0 15px 0; }\n' +
    '.part-header h2 { color: #ad9168; margin: 0 0 8px 0; font-size: 20px; }\n' +
    '.part-header p { color: #666; margin: 0; line-height: 1.6; font-size: 14px; }\n' +
    '.tool-section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 12px 0; }\n' +
    '.tool-section-header { font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }\n' +
    '.score-bar-container { margin: 6px 0; }\n' +
    '.score-bar-label { font-size: 13px; color: #555; margin-bottom: 3px; }\n' +
    '.score-bar-track { height: 14px; background: #f3f4f6; border-radius: 7px; overflow: hidden; }\n' +
    '.score-bar-fill { height: 100%; border-radius: 7px; }\n' +
    '.score-bar-fill.positive { background: linear-gradient(90deg, #fbbf24, #ef4444); }\n' +
    '.score-bar-fill.quotient { background: linear-gradient(90deg, #60a5fa, #3b82f6); }\n' +
    '.score-bar-fill.clarity { background: linear-gradient(90deg, #34d399, #10b981); }\n' +
    '.allocation-bar { display: flex; height: 28px; border-radius: 6px; overflow: hidden; margin: 10px 0; }\n' +
    '.allocation-segment { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 600; }\n' +
    '.tool-insight { background: #f9fafb; border-left: 3px solid #ad9168; padding: 10px 12px; margin: 10px 0; font-size: 13px; color: #555; line-height: 1.5; font-style: italic; }\n' +
    '.metric-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }\n' +
    '.metric-label { color: #555; }\n' +
    '.metric-value { font-weight: 600; color: #374151; }\n' +
    '.cover-page { text-align: center; padding: 60px 30px; }\n' +
    '.cover-title { font-size: 28px; font-weight: 700; color: #ad9168; margin: 20px 0 10px 0; }\n' +
    '.cover-subtitle { font-size: 16px; color: #666; margin-bottom: 30px; }\n' +
    '.cover-completion { font-size: 14px; color: #888; }\n' +

    // Print styles
    '@media print { .page-break { page-break-before: always; } }\n';
},
```

### New Method: _buildCapstoneReportBody

This replaces `buildIntegrationReportBody`. It is the main HTML builder for the entire Capstone Report:

```javascript
/**
 * Build the Capstone Report body HTML.
 *
 * 4-Part structure:
 * - Part 1: Psychological Foundation (per-tool data from Tools 1, 3, 5, 7)
 * - Part 2: Financial Landscape (per-tool data from Tools 2, 4, 6, 8)
 * - Part 3: The Integration (existing detection engine analysis)
 * - Part 4: Your Path Forward (action items + closing)
 *
 * @param {string} clientId
 * @param {Object} summary - from getStudentSummary()
 * @param {Object} analysisData - detection engine results
 * @param {Object} narrative - GPT or fallback narrative
 * @param {Object} readiness - from _checkReportReadiness()
 * @param {Object} perToolData - from _gatherPerToolData()
 */
_buildCapstoneReportBody(clientId, summary, analysisData, narrative, readiness, perToolData) {
  var profile = analysisData.profile;
  var warnings = analysisData.warnings;
  var gap = analysisData.awarenessGap;
  var locks = analysisData.locks;
  var bbGaps = analysisData.bbGaps;
  var sections = readiness.sections;

  var html = '';

  // =============================================
  // COVER PAGE
  // =============================================
  html += '<div class="cover-page">';
  html += this.buildHeader('Your TruPath Capstone Report', clientId);

  // Count completed tools
  var completedCount = 0;
  var toolKeys = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8'];
  for (var i = 0; i < toolKeys.length; i++) {
    if (summary.tools[toolKeys[i]] && summary.tools[toolKeys[i]].status === 'completed') {
      completedCount++;
    }
  }

  // Source tag
  var sourceLabel = narrative.source.indexOf('gpt') !== -1 ? 'Personalized Analysis' : 'Standard Analysis';
  var sourceClass = narrative.source.indexOf('gpt') !== -1 ? 'gpt' : '';
  html += '<p style="text-align: center;"><span class="source-tag ' + sourceClass + '">' + sourceLabel + '</span></p>';

  html += '<p class="cover-completion">' + completedCount + ' of 8 assessments completed</p>';

  html += '<div class="intro" style="text-align: left; margin-top: 20px;">' +
    '<p>This capstone report brings together everything you have discovered through your TruPath assessments. ' +
    'Part 1 covers your psychological foundation — the inner patterns that drive your decisions. ' +
    'Part 2 maps your financial landscape — how those patterns show up in your money. ' +
    'Part 3 is the integration — where psychology meets finance. ' +
    'Part 4 is your path forward.</p>' +
  '</div>';
  html += '</div>';

  // =============================================
  // PART 1: YOUR PSYCHOLOGICAL FOUNDATION
  // =============================================
  html += '<div class="page-break"></div>';
  html += '<div class="part-header">';
  html += '<h2>Part 1: Your Psychological Foundation</h2>';
  if (narrative.psychFoundationNarrative) {
    html += '<p>' + narrative.psychFoundationNarrative + '</p>';
  }
  html += '</div>';

  // Tool 1: Core Trauma Strategy
  if (perToolData.tool1) {
    html += this._buildTool1Section(perToolData.tool1);
  }

  // Grounding Tools (3, 5, 7) — render each if completed
  if (perToolData.tool3) {
    html += this._buildGroundingToolSection(perToolData.tool3, 'Tool 3: Identity and Validation');
  }
  if (perToolData.tool5) {
    html += this._buildGroundingToolSection(perToolData.tool5, 'Tool 5: Love and Connection');
  }
  if (perToolData.tool7) {
    html += this._buildGroundingToolSection(perToolData.tool7, 'Tool 7: Security and Control');
  }

  // If no psychological tools completed at all, show a placeholder
  if (!perToolData.tool1 && !perToolData.tool3 && !perToolData.tool5 && !perToolData.tool7) {
    html += this._buildMissingSectionBox(
      'Your psychological foundation assessments have not been completed yet.',
      'Complete Tool 1 (Core Trauma Assessment) and at least one grounding tool (Tool 3, 5, or 7) to populate this section.'
    );
  }

  // =============================================
  // PART 2: YOUR FINANCIAL LANDSCAPE
  // =============================================
  html += '<div class="page-break"></div>';
  html += '<div class="part-header">';
  html += '<h2>Part 2: Your Financial Landscape</h2>';
  if (narrative.financialLandscapeNarrative) {
    html += '<p>' + narrative.financialLandscapeNarrative + '</p>';
  }
  html += '</div>';

  // Tool 2: Financial Clarity
  if (perToolData.tool2) {
    html += this._buildTool2Section(perToolData.tool2);
  }

  // Tool 4: Budget Framework
  if (perToolData.tool4) {
    html += this._buildTool4Section(perToolData.tool4);
  }

  // Tool 6: Retirement Blueprint
  if (perToolData.tool6) {
    html += this._buildTool6Section(perToolData.tool6);
  }

  // Tool 8: Investment Planning
  if (perToolData.tool8) {
    html += this._buildTool8Section(perToolData.tool8);
  }

  // If no financial tools completed at all, show a placeholder
  if (!perToolData.tool2 && !perToolData.tool4 && !perToolData.tool6 && !perToolData.tool8) {
    html += this._buildMissingSectionBox(
      'Your financial landscape assessments have not been completed yet.',
      'Complete Tool 2 (Financial Clarity) and Tool 4 (Budget Framework) to populate this section.'
    );
  }

  // =============================================
  // PART 3: THE INTEGRATION (existing Phase 9 content)
  // =============================================
  html += '<div class="page-break"></div>';
  html += '<div class="part-header">';
  html += '<h2>Part 3: The Integration</h2>';
  html += '<p>This is where your psychological patterns meet your financial behaviors. The detection engines below analyzed your data across all completed tools to find patterns, warnings, and gaps.</p>';
  html += '</div>';

  // --- Integration Profile ---
  if (sections.profile && profile && narrative.profileNarrative) {
    html += '<h3>Your Integration Profile</h3>';
    html += '<div class="profile-card">';
    html += '<div style="font-size: 2rem;">' + profile.icon + '</div>';
    html += '<div class="profile-name">' + profile.name + '</div>';
    html += '<p class="profile-desc">' + narrative.profileNarrative + '</p>';
    html += '</div>';
  } else if (!sections.profile) {
    html += '<h3>Your Integration Profile</h3>';
    html += this._buildMissingSectionBox(
      'Your integration profile identifies your core psychological-financial pattern.',
      'Complete Tool 1 (Core Trauma Assessment) to unlock this section.'
    );
  }

  // --- Awareness Gap ---
  if (sections.awarenessGap && gap && gap.severity !== 'normal' && narrative.gapNarrative) {
    html += '<hr class="section-divider">';
    html += '<h3>Your Awareness Gap</h3>';
    html += '<div class="gap-visual">';
    html += '<p><strong>Psychological Patterns:</strong> ' + gap.psychScore + '/100</p>';
    html += '<div class="gap-bar gap-bar-psych" style="width: ' + gap.psychScore + '%;"></div>';
    html += '<p><strong>Stress Awareness:</strong> ' + gap.stressScore + '/100</p>';
    html += '<div class="gap-bar gap-bar-stress" style="width: ' + gap.stressScore + '%;"></div>';
    html += '<p style="text-align: center; margin-top: 10px;"><strong>Gap: ' + gap.gapScore + ' points</strong></p>';
    html += '</div>';
    html += '<p>' + narrative.gapNarrative + '</p>';
  } else if (!sections.awarenessGap) {
    var hasGapData = gap && gap.severity === 'normal';
    if (!hasGapData) {
      html += '<hr class="section-divider">';
      html += '<h3>Your Awareness Gap</h3>';
      html += this._buildMissingSectionBox(
        'The awareness gap measures whether you see the full financial impact of your psychological patterns.',
        'Complete Tool 2 (Financial Clarity) and a grounding tool (Tool 3, 5, or 7) to unlock this section.'
      );
    }
  }

  // --- Active Warnings ---
  if (sections.warnings && warnings && warnings.length > 0 && narrative.warningNarrative) {
    html += '<hr class="section-divider">';
    html += '<h3>Active Patterns Affecting Your Finances</h3>';
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

  // --- Belief Locks ---
  if (sections.beliefLocks && locks && locks.length > 0 && narrative.lockNarrative) {
    html += '<hr class="section-divider">';
    html += '<h3>Your Belief Locks</h3>';
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

  // --- Belief-Behavior Gaps ---
  if (sections.beliefBehaviorGaps && bbGaps && bbGaps.length > 0) {
    html += '<hr class="section-divider">';
    html += '<h3>Where Your Beliefs and Actions Diverge</h3>';
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

  // --- The Big Picture ---
  if (narrative.overallSynthesis) {
    html += '<hr class="section-divider">';
    html += '<h3>The Big Picture</h3>';
    html += '<div class="synthesis-box">' + narrative.overallSynthesis + '</div>';
  }

  // =============================================
  // PART 4: YOUR PATH FORWARD
  // =============================================
  html += '<div class="page-break"></div>';
  html += '<div class="part-header">';
  html += '<h2>Part 4: Your Path Forward</h2>';
  html += '</div>';

  // Action Items
  if (narrative.actionItems && narrative.actionItems.length > 0) {
    html += '<h3>Your Next Steps</h3>';
    html += '<ol class="action-list">';
    for (var a = 0; a < narrative.actionItems.length; a++) {
      html += '<li>' + narrative.actionItems[a] + '</li>';
    }
    html += '</ol>';
  }

  // Missing Tools Summary
  if (readiness.missing.length > 0 || completedCount < 8) {
    html += '<h3>Unlock More Insights</h3>';
    html += '<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">';
    html += '<p style="margin-bottom: 10px;">Complete these remaining tools to get the full picture:</p>';
    html += '<ul style="padding-left: 20px;">';

    // Per-tool missing messages
    var toolMissing = {
      tool1: { name: 'Tool 1: Core Trauma Strategy', benefit: 'Unlocks your integration profile and warning patterns' },
      tool2: { name: 'Tool 2: Financial Clarity', benefit: 'Unlocks your awareness gap analysis' },
      tool3: { name: 'Tool 3: Identity and Validation', benefit: 'Deepens belief lock and cross-tool pattern detection' },
      tool4: { name: 'Tool 4: Budget Framework', benefit: 'Shows how your psychology shapes budget allocation' },
      tool5: { name: 'Tool 5: Love and Connection', benefit: 'Reveals how relationships affect financial decisions' },
      tool6: { name: 'Tool 6: Retirement Blueprint', benefit: 'Maps your long-term financial trajectory' },
      tool7: { name: 'Tool 7: Security and Control', benefit: 'Uncovers control-based financial patterns' },
      tool8: { name: 'Tool 8: Investment Planning', benefit: 'Connects your risk tolerance to growth strategy' }
    };

    for (var tk = 0; tk < toolKeys.length; tk++) {
      var tKey = toolKeys[tk];
      if (!summary.tools[tKey] || summary.tools[tKey].status !== 'completed') {
        var info = toolMissing[tKey];
        html += '<li style="margin: 8px 0; color: #555;"><strong>' + info.name + '</strong> — ' + info.benefit + '</li>';
      }
    }

    html += '</ul>';
    html += '</div>';
  }

  // Closing Statement
  html += '<div style="text-align: center; margin-top: 30px; padding: 20px;">';
  html += '<p style="font-size: 15px; color: #555; line-height: 1.7;">This report is a snapshot of where you are today. ' +
    'Your patterns are not your destiny — they are the starting point for change. ' +
    'Bring this document to your next coaching session and use it as a roadmap for your financial transformation.</p>';
  html += '</div>';

  // Footer
  html += this.buildFooter('This capstone report integrates your psychological and financial assessment results. Use it as a comprehensive guide for your coaching conversations and future growth.');

  return html;
},
```

### Per-Tool Section Builders

These are the 6 new methods that render individual tool data within the capstone report. Each is designed to be self-contained and handle missing sub-data gracefully.

#### _buildTool1Section (Core Trauma Strategy)

```javascript
/**
 * Build Tool 1 section for capstone report.
 * Shows dominant strategy, all 6 scores with visual bars, and key insight.
 *
 * @param {Object} t1Data - from Tool1Report.getResults()
 */
_buildTool1Section(t1Data) {
  var html = '<div class="tool-section">';
  html += '<div class="tool-section-header">Tool 1: Core Trauma Strategy</div>';

  // Dominant strategy
  html += '<p><strong>Your Dominant Strategy:</strong> ' + (t1Data.winner || 'Unknown') + '</p>';

  // Strategy scores — bipolar bars (-25 to +25, center = 0)
  if (t1Data.scores) {
    var strategyNames = {
      FSV: 'Financial Self-Value',
      ExVal: 'External Validation',
      Showing: 'Showing Love',
      Receiving: 'Receiving Love',
      Control: 'Control',
      Fear: 'Fear'
    };

    html += '<div style="margin: 12px 0;">';
    for (var key in t1Data.scores) {
      var score = t1Data.scores[key];
      var name = strategyNames[key] || key;
      var isWinner = key === t1Data.winner;
      var barWidth = Math.abs(score) * 2; // scale -25..25 to 0..50% visual
      var barColor = score > 0 ? '#ef4444' : '#22c55e'; // red for high trauma, green for healthy
      var barDirection = score >= 0 ? 'left' : 'right';

      html += '<div class="score-bar-container">';
      html += '<div class="score-bar-label">' + (isWinner ? '<strong>' : '') + name + ': ' + score + (isWinner ? ' (dominant)</strong>' : '') + '</div>';
      html += '<div class="score-bar-track" style="position: relative;">';
      html += '<div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: #d1d5db;"></div>';
      html += '<div style="position: absolute; ' + (score >= 0 ? 'left: 50%' : 'right: 50%') + '; top: 0; height: 100%; width: ' + barWidth + '%; background: ' + barColor + '; border-radius: 7px;"></div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
},
```

#### _buildGroundingToolSection (Tools 3, 5, 7)

```javascript
/**
 * Build a grounding tool section for capstone report.
 * Shows overall quotient, domain quotients, top subdomains, and GPT synthesis.
 * Works for Tools 3, 5, and 7 (all share the same data shape).
 *
 * @param {Object} gtData - from GroundingReport.getResults()
 * @param {string} title - e.g., "Tool 3: Identity and Validation"
 */
_buildGroundingToolSection(gtData, title) {
  var html = '<div class="tool-section">';
  html += '<div class="tool-section-header">' + title + '</div>';

  if (gtData.scoring) {
    // Overall quotient
    html += '<p><strong>Overall Score:</strong> ' + gtData.scoring.overallQuotient + '/100</p>';

    // Domain scores
    if (gtData.scoring.domainQuotients) {
      for (var dk in gtData.scoring.domainQuotients) {
        var dScore = gtData.scoring.domainQuotients[dk];
        var dColor = dScore >= 70 ? '#22c55e' : (dScore >= 40 ? '#f59e0b' : '#ef4444');
        html += '<div class="score-bar-container">';
        html += '<div class="score-bar-label">' + dk + ': ' + dScore + '/100</div>';
        html += '<div class="score-bar-track">';
        html += '<div class="score-bar-fill quotient" style="width: ' + dScore + '%; background: ' + dColor + ';"></div>';
        html += '</div>';
        html += '</div>';
      }
    }

    // Top 3 strongest and weakest subdomains
    if (gtData.scoring.subdomainQuotients) {
      var subdomains = [];
      for (var sk in gtData.scoring.subdomainQuotients) {
        subdomains.push({ key: sk, score: gtData.scoring.subdomainQuotients[sk] });
      }
      subdomains.sort(function(a, b) { return b.score - a.score; });

      if (subdomains.length > 0) {
        html += '<div style="display: flex; gap: 20px; margin-top: 10px;">';

        // Strongest
        html += '<div style="flex: 1;">';
        html += '<p style="font-size: 13px; color: #16a34a; font-weight: 600;">Strongest Areas</p>';
        for (var s = 0; s < Math.min(3, subdomains.length); s++) {
          html += '<p style="font-size: 13px; color: #555;">' + subdomains[s].key + ': ' + subdomains[s].score + '</p>';
        }
        html += '</div>';

        // Weakest
        html += '<div style="flex: 1;">';
        html += '<p style="font-size: 13px; color: #ef4444; font-weight: 600;">Growth Areas</p>';
        for (var w = subdomains.length - 1; w >= Math.max(0, subdomains.length - 3); w--) {
          html += '<p style="font-size: 13px; color: #555;">' + subdomains[w].key + ': ' + subdomains[w].score + '</p>';
        }
        html += '</div>';

        html += '</div>';
      }
    }
  }

  // GPT synthesis (reused from tool submission — no additional cost)
  if (gtData.syntheses && gtData.syntheses.overall && gtData.syntheses.overall.summary) {
    html += '<div class="tool-insight">' + gtData.syntheses.overall.summary + '</div>';
  }

  html += '</div>';
  return html;
},
```

#### _buildTool2Section (Financial Clarity)

```javascript
/**
 * Build Tool 2 section for capstone report.
 * Shows archetype, domain clarity scores with bars, priority, and GPT insight.
 *
 * @param {Object} t2Data - from Tool2Report.getResults()
 */
_buildTool2Section(t2Data) {
  var html = '<div class="tool-section">';
  html += '<div class="tool-section-header">Tool 2: Financial Clarity</div>';

  if (t2Data.results) {
    // Archetype
    if (t2Data.results.archetype) {
      html += '<p><strong>Your Archetype:</strong> ' + t2Data.results.archetype + '</p>';
    }

    // Domain scores
    if (t2Data.results.domainScores) {
      var domainLabels = {
        moneyFlow: 'Money Flow',
        obligations: 'Obligations',
        liquidity: 'Liquidity',
        growth: 'Growth',
        protection: 'Protection'
      };

      for (var dom in t2Data.results.domainScores) {
        var score = t2Data.results.domainScores[dom];
        var label = domainLabels[dom] || dom;
        var color = score >= 70 ? '#22c55e' : (score >= 40 ? '#f59e0b' : '#ef4444');

        html += '<div class="score-bar-container">';
        html += '<div class="score-bar-label">' + label + ': ' + score + '%</div>';
        html += '<div class="score-bar-track">';
        html += '<div class="score-bar-fill clarity" style="width: ' + score + '%; background: ' + color + ';"></div>';
        html += '</div>';
        html += '</div>';
      }
    }

    // Priority domain
    if (t2Data.results.priorityList && t2Data.results.priorityList.length > 0) {
      html += '<p style="margin-top: 8px;"><strong>Priority Focus:</strong> ' + t2Data.results.priorityList[0].domain + '</p>';
    }
  }

  // GPT overall insight (reused from tool submission)
  if (t2Data.overallInsight && t2Data.overallInsight.summary) {
    html += '<div class="tool-insight">' + t2Data.overallInsight.summary + '</div>';
  }

  html += '</div>';
  return html;
},
```

#### _buildTool4Section (Budget Framework)

```javascript
/**
 * Build Tool 4 section for capstone report.
 * Shows monthly income, MEFI allocation bar, dollar amounts, and priority.
 *
 * @param {Object} t4Data - budget allocation data
 */
_buildTool4Section(t4Data) {
  var html = '<div class="tool-section">';
  html += '<div class="tool-section-header">Tool 4: Budget Framework</div>';

  // Monthly income
  html += '<div class="metric-row">';
  html += '<span class="metric-label">Monthly Income</span>';
  html += '<span class="metric-value">$' + (t4Data.monthlyIncome || 0).toLocaleString() + '</span>';
  html += '</div>';

  // Allocation bar (MEFI — Multiply, Essentials, Freedom, Enjoyment)
  var colors = { multiply: '#ad9168', essentials: '#6366f1', freedom: '#22c55e', enjoyment: '#f59e0b' };
  var labels = { multiply: 'Multiply', essentials: 'Essentials', freedom: 'Freedom', enjoyment: 'Enjoyment' };
  var allocations = {
    multiply: t4Data.multiply || 0,
    essentials: t4Data.essentials || 0,
    freedom: t4Data.freedom || 0,
    enjoyment: t4Data.enjoyment || 0
  };

  html += '<div class="allocation-bar">';
  for (var key in allocations) {
    var pct = allocations[key];
    if (pct > 0) {
      html += '<div class="allocation-segment" style="width: ' + pct + '%; background: ' + colors[key] + ';">' +
        labels[key][0] + ' ' + pct + '%</div>';
    }
  }
  html += '</div>';

  // Dollar amounts
  var income = t4Data.monthlyIncome || 0;
  html += '<div style="display: flex; justify-content: space-around; margin: 10px 0; font-size: 13px;">';
  for (var aKey in allocations) {
    var dollars = Math.round(income * allocations[aKey] / 100);
    html += '<div style="text-align: center;">';
    html += '<div style="color: ' + colors[aKey] + '; font-weight: 600;">' + labels[aKey] + '</div>';
    html += '<div>$' + dollars.toLocaleString() + '</div>';
    html += '</div>';
  }
  html += '</div>';

  // Priority
  if (t4Data.priority && t4Data.priority !== 'Not selected') {
    html += '<p style="margin-top: 8px;"><strong>Selected Priority:</strong> ' + t4Data.priority + '</p>';
  }

  html += '</div>';
  return html;
},
```

#### _buildTool6Section (Retirement Blueprint)

```javascript
/**
 * Build Tool 6 section for capstone report.
 * Shows retirement profile, key metrics, and investment score.
 *
 * @param {Object} t6Data - from Tool6Report.getResults()
 */
_buildTool6Section(t6Data) {
  var html = '<div class="tool-section">';
  html += '<div class="tool-section-header">Tool 6: Retirement Blueprint</div>';

  // Profile
  if (t6Data.profileId) {
    html += '<p><strong>Your Profile:</strong> ' + t6Data.profileId + '</p>';
  }

  // Key metrics
  var metrics = [];
  if (t6Data.monthlyBudget) metrics.push({ label: 'Monthly Retirement Budget', value: '$' + Number(t6Data.monthlyBudget).toLocaleString() });
  if (t6Data.projectedBalance) metrics.push({ label: 'Projected Balance', value: '$' + Number(t6Data.projectedBalance).toLocaleString() });
  if (t6Data.investmentScore !== undefined) metrics.push({ label: 'Investment Score', value: t6Data.investmentScore + '/10' });
  if (t6Data.yearsToRetirement) metrics.push({ label: 'Years to Retirement', value: t6Data.yearsToRetirement + ' years' });
  if (t6Data.taxStrategy) metrics.push({ label: 'Tax Strategy', value: t6Data.taxStrategy });

  for (var m = 0; m < metrics.length; m++) {
    html += '<div class="metric-row">';
    html += '<span class="metric-label">' + metrics[m].label + '</span>';
    html += '<span class="metric-value">' + metrics[m].value + '</span>';
    html += '</div>';
  }

  html += '</div>';
  return html;
},
```

#### _buildTool8Section (Investment Planning)

```javascript
/**
 * Build Tool 8 section for capstone report.
 * Shows scenario details, risk, projections, and feasibility.
 *
 * @param {Object} t8Data - from Tool8Report.getResults()
 */
_buildTool8Section(t8Data) {
  var html = '<div class="tool-section">';
  html += '<div class="tool-section-header">Tool 8: Investment Planning</div>';

  // Scenario name
  if (t8Data.scenarioName) {
    html += '<p><strong>Scenario:</strong> ' + t8Data.scenarioName + '</p>';
  }

  // Key metrics
  var metrics = [];
  if (t8Data.monthlyInvestment) metrics.push({ label: 'Monthly Investment', value: '$' + Number(t8Data.monthlyInvestment).toLocaleString() });
  if (t8Data.timeHorizon) metrics.push({ label: 'Time Horizon', value: t8Data.timeHorizon + ' years' });
  if (t8Data.risk !== undefined) {
    var riskLabel = t8Data.risk <= 3 ? 'Conservative' : (t8Data.risk <= 6 ? 'Moderate' : 'Aggressive');
    metrics.push({ label: 'Risk Level', value: riskLabel + ' (' + t8Data.risk + '/10)' });
  }
  if (t8Data.projectedBalance) metrics.push({ label: 'Projected Balance', value: '$' + Number(t8Data.projectedBalance).toLocaleString() });
  if (t8Data.feasibility) {
    var feasLabel = t8Data.feasibility === 'OK' ? 'On Track' : (t8Data.feasibility === 'WARN' ? 'Needs Attention' : 'At Risk');
    metrics.push({ label: 'Feasibility', value: feasLabel });
  }

  for (var m = 0; m < metrics.length; m++) {
    html += '<div class="metric-row">';
    html += '<span class="metric-label">' + metrics[m].label + '</span>';
    html += '<span class="metric-value">' + metrics[m].value + '</span>';
    html += '</div>';
  }

  html += '</div>';
  return html;
},
```

## CollectiveResults.js Changes

### Update Button Text

Change the download button label from "Download Integration Report" to "Download Capstone Report":

In `_renderSection3()`, find the button HTML and update:

```javascript
// BEFORE:
'📄 Download Integration Report'

// AFTER:
'📄 Download Capstone Report'
```

Update both the active and disabled button states, and the `downloadIntegrationReport()` success handler text.

### Update the Section Breakdown Text

The section breakdown below the button currently shows 5 integration sections. Update to reflect the expanded report:

```javascript
// BEFORE:
reportSections + ' of ' + reportTotal + ' report sections available'

// AFTER:
reportSections + ' of ' + reportTotal + ' integration sections available — includes per-tool summaries for all completed assessments'
```

## Code.js Changes

**None required.** The existing `generateIntegrationPDF(clientId)` wrapper function calls `PDFGenerator.generateIntegrationPDF(clientId)`, which we are modifying in place. The function signature and return format are unchanged.

## Performance Budget

| Step | Time | Cost |
|------|------|------|
| getStudentSummary() | ~1s | Free |
| _gatherPerToolData() (8 getResults calls) | ~3-5s | Free (reads stored data) |
| _checkReportReadiness() (5 engines) | ~1s | Free |
| IntegrationGPT.generateNarrative() | ~4-8s | ~$0.04 (2500 tokens) |
| HTML → PDF conversion | ~1-2s | Free |
| **Total** | **~10-16s** | **~$0.04** |

The 30-second GAS limit gives us plenty of headroom. The data gathering and engine runs are all in-memory operations (reading from spreadsheet, doing math). The GPT call is the bottleneck, and even with the expanded prompt, it stays well under the limit.

## File Changes Summary

| File | Changes |
|------|---------|
| `core/IntegrationGPT.js` | Expand system prompt (2 new section markers), expand user prompt (per-tool data), update parseNarrativeResponse (2 new fields), update isValidNarrative, update fallback (2 new templates), increase maxTokens to 2500 |
| `shared/PDFGenerator.js` | Add `_gatherPerToolData()`, replace `getIntegrationStyles()` with `_getCapstoneStyles()`, replace `buildIntegrationReportBody()` with `_buildCapstoneReportBody()`, add 6 new per-tool section builders (`_buildTool1Section`, `_buildGroundingToolSection`, `_buildTool2Section`, `_buildTool4Section`, `_buildTool6Section`, `_buildTool8Section`), update `generateIntegrationPDF()` to gather per-tool data |
| `core/CollectiveResults.js` | Update button text to "Download Capstone Report", update section breakdown text |
| `Code.js` | No changes needed |

## Test Procedure

### 1. Basic Generation Test
1. Open Collective Results as a student with 4+ tools completed
2. Click "Download Capstone Report"
3. PDF should download within ~15 seconds
4. Verify 4-part structure: Cover → Psychological Foundation → Financial Landscape → Integration → Path Forward

### 2. Content Verification
- **Cover page**: Student name, date, "X of 8 assessments completed", source tag
- **Part 1**: Check that each completed psychological tool shows its data
  - Tool 1: Strategy name + all 6 score bars
  - Tools 3/5/7: Overall quotient, domain bars, subdomains, GPT synthesis
- **Part 2**: Check that each completed financial tool shows its data
  - Tool 2: Archetype, domain bars, priority, GPT insight
  - Tool 4: Income, MEFI allocation bar, dollar amounts, priority
  - Tool 6: Profile, metrics (budget, balance, score, years, strategy)
  - Tool 8: Scenario, metrics (investment, horizon, risk, balance, feasibility)
- **Part 3**: Unchanged from Phase 9 — profile, warnings, gap, locks, BB gaps, big picture
- **Part 4**: 5-7 action items, missing tools list with benefits, closing statement

### 3. Partial Data Test
| Scenario | Expected Part 1 | Expected Part 2 |
|----------|-----------------|-----------------|
| Tool 1 only | Tool 1 section only | Placeholder box |
| Tool 1 + Tool 3 | Tool 1 + Tool 3 | Placeholder box |
| Tool 2 + Tool 4 | Placeholder box | Tool 2 + Tool 4 |
| All tools | All 4 psychological tools | All 4 financial tools |

### 4. GPT Narrative Test
- **With GPT**: Check that `psychFoundationNarrative` and `financialLandscapeNarrative` appear in Part headers
- **Fallback mode**: Disconnect API key, verify template fallbacks appear in Part headers
- **Source tag**: "Personalized Analysis" for GPT, "Standard Analysis" for fallback

### 5. Edge Cases
- Student with only Tool 1 completed: Report should still generate (2+ integration sections needed) — but Part 1 shows only Tool 1, Part 2 shows placeholder
- Student with all 8 tools: Full report, no placeholders, no "Unlock More Insights" section
- Tool data fetch failure: _gatherPerToolData catches per-tool errors individually — other tools still appear
- Empty grounding tool scores: _buildGroundingToolSection handles null scoring gracefully

## Verification Checklist

**IntegrationGPT.js:**
- [ ] System prompt includes PSYCH_FOUNDATION_NARRATIVE and FINANCIAL_LANDSCAPE_NARRATIVE markers
- [ ] User prompt includes per-tool assessment data (Tools 1-8)
- [ ] parseNarrativeResponse extracts psychFoundationNarrative and financialLandscapeNarrative
- [ ] isValidNarrative requires at least one new narrative section
- [ ] Fallback generates template-based foundation and landscape narratives
- [ ] maxTokens increased to 2500

**PDFGenerator.js:**
- [ ] _gatherPerToolData() fetches all 8 tools with individual try-catch
- [ ] _getCapstoneStyles() includes all existing + new per-tool CSS classes
- [ ] _buildCapstoneReportBody() has 4-part structure with cover page
- [ ] _buildTool1Section() shows dominant strategy + 6 score bars
- [ ] _buildGroundingToolSection() shows quotients + domains + subdomains + GPT synthesis
- [ ] _buildTool2Section() shows archetype + domain bars + priority + GPT insight
- [ ] _buildTool4Section() shows income + MEFI allocation bar + dollar amounts
- [ ] _buildTool6Section() shows profile + all key metrics
- [ ] _buildTool8Section() shows scenario + metrics + feasibility
- [ ] generateIntegrationPDF() calls _gatherPerToolData() and passes to narrative + body builder
- [ ] Missing tool sections show placeholder boxes with specific instructions

**CollectiveResults.js:**
- [ ] Button text updated to "Download Capstone Report"
- [ ] Section breakdown text updated

**GAS Safety:**
- [ ] No `window.location.reload()` anywhere in new code
- [ ] No escaped apostrophes in any string within template literals
- [ ] No contractions in any user-facing text
- [ ] All text uses "do not", "cannot", "you are" etc.
- [ ] Number.toLocaleString() calls are inside methods (not inside template literals that get document.write'd)

**Performance:**
- [ ] Total generation time stays under 20 seconds
- [ ] GPT token budget (2500) is sufficient for all sections
- [ ] Per-tool data fetch errors do not crash the entire report
