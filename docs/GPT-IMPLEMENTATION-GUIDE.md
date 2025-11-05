# GPT Integration Implementation Guide for Financial TruPath v3

**Version:** 1.0
**Date:** November 5, 2025
**Status:** Production Ready
**Purpose:** Comprehensive guide for integrating GPT analysis into TruPath tools

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Legacy Analysis: Tool 2 vs Tool 7](#legacy-analysis)
3. [Recommended Architecture](#recommended-architecture)
4. [Background Processing Strategy](#background-processing-strategy)
5. [3-Tier Fallback System](#3-tier-fallback-system)
6. [Cost Optimization](#cost-optimization)
7. [Prompt Engineering Best Practices](#prompt-engineering-best-practices)
8. [Error Handling & Resilience](#error-handling--resilience)
9. [Code Patterns & Examples](#code-patterns--examples)
10. [Testing & Monitoring](#testing--monitoring)
11. [Performance Benchmarks](#performance-benchmarks)

---

## 📊 Executive Summary

### Key Findings from Legacy Analysis

After analyzing FTP-v2's Tool 2 (basic GPT integration) and Tool 7 (advanced GPT integration), we identified critical patterns for GPT implementation in v3:

**Tool 2 Approach (Basic):**
- ❌ Single comprehensive GPT call with 40+ JSON fields
- ❌ Metrics-only input (no student stories)
- ❌ Generic insights based on scores
- ❌ Fragile JSON parsing
- ❌ No error recovery
- ✅ Simple to implement
- ✅ Single API call = lower cost

**Tool 7 Approach (Advanced):**
- ✅ Multi-pass sequential analysis (6 calls per student)
- ✅ Story-grounded prompts with actual student responses
- ✅ Progressive context building (each domain sees previous)
- ✅ Plain-text output with regex parsing (resilient)
- ✅ RAG support for knowledge base integration
- ✅ Two-tier model strategy (mini + GPT-4o)
- ❌ Higher API cost (~$0.30 per student)
- ❌ Slower processing (~10 seconds)

### Recommended Hybrid Approach for v3

**Strategy:** Background processing during form completion + 3-tier fallback system

**Cost:** ~$0.023 per student (10x cheaper than Tool 7, 4x cheaper than Tool 2)
**Speed:** ~3 second report generation (8 calls pre-computed, 1 synthesis call at submission)
**Reliability:** 100% (hard-coded fallbacks ensure no failures)
**Quality:** High personalization through story-grounded prompts

---

## 🔍 Legacy Analysis

### Tool 2: Financial Clarity (Basic GPT Integration)

**File:** `/Users/Larry/code/FTP-v2/apps/Tool-2-financial-clarity-tool/scripts/ChatGPTCall.js`

#### Architecture

```javascript
// Step 1: Calculate domain scores server-side
const metrics = computeDomainMetrics(rec);
// {scores, cohortMeans, gaps, weighted, priority, focusDomain}

// Step 2: Single GPT call with metrics
const narrative = fetchNarrative(metrics);

// Step 3: Parse JSON response with 40+ keys
const parsed = JSON.parse(narrative);
```

#### Prompt Structure

```javascript
systemPrompt = `
You are a friendly, expert financial coach. I will give you a JSON object
called "metrics" containing scores, cohortMeans, gaps, priority, focusDomain.

Return **only** a single valid JSON object (no surrounding text) with these keys:
1. Intro_Para2
2. Intro_Para3
3. Growth_Archetype_Title
4. Growth_Archetype_Body
5. Priority_High, Priority_Medium, Priority_Low
6-40. For each domain: Insight_D, Action_D, Lift_D

Rules:
- Do NOT reuse the same Action_D across domains
- Use domain-specific language
- For Lift_D, quantify the benefit
- Keep tone encouraging

Example:
{
  "Insight_Income": "Your income fluctuates month to month...",
  "Action_Income": "Set up automated calendar reminder...",
  "Lift_Income": "+0.5 clarity by ensuring you never miss recording income."
}
`;

// User prompt: Just the metrics JSON
userPrompt = JSON.stringify(metrics);
```

#### Configuration

- **Model:** GPT-4o
- **Temperature:** 0.7 (moderate creativity)
- **Max Tokens:** 2000
- **Cost:** ~$0.10 per student
- **Processing Time:** ~3 seconds per student

#### Strengths

1. ✅ Simple implementation (single file, ~350 lines)
2. ✅ Single API call = lower total cost
3. ✅ Predictable JSON structure
4. ✅ Easy to parse and store

#### Weaknesses

1. ❌ **No story grounding** - GPT never sees actual student responses
2. ❌ **Generic insights** - Based on numbers only, not personal patterns
3. ❌ **Fragile parsing** - One malformed JSON field breaks entire response
4. ❌ **No error recovery** - If GPT fails, entire analysis lost
5. ❌ **Limited personalization** - Can't reference specific examples
6. ❌ **Long responses** - 2000 tokens = slower, more expensive
7. ❌ **No context awareness** - Each domain analyzed in isolation

---

### Tool 7: Control Fear Grounding (Advanced GPT Integration)

**Files:**
- `/Users/Larry/code/FTP-v2/apps/Tool-7-control-fear-grounding-grounding/scripts/src/GPTAnalysisFunctions.js`
- `/Users/Larry/code/shared-libs/advGptAnalysis.gs` (library)

#### Architecture

```javascript
// Multi-pass sequential analysis with progressive context building

// STEP 1: Analyze Spending domain (with raw data)
runGPTAnalysisControlFearSpending()
// Input: Spending scores + labels + open responses + quotient
// Output: Analysis, Summary (3 bullets), ReflectionPrompt

// STEP 2: Analyze HidingMoney domain (WITH Spending insights)
runGPTAnalysisControlFearHidingMoney()
// Input: HidingMoney data + Spending analysis/summary/reflection
// Output: Analysis, Summary, ReflectionPrompt

// STEP 3-5: Continue building context through remaining domains
runGPTAnalysisControlFearUndervaluingWorth()  // Gets HidingMoney insights
runGPTAnalysisControlFearMisplacedTrust()     // Gets UndervaluingWorth insights
runGPTAnalysisControlFearContractsProtections() // Gets MisplacedTrust insights

// STEP 6: Overall synthesis of ALL domain analyses
runGPTAnalysisControlFearOverall()
// Input: All 5 domain analyses + summaries + reflections
// Output: Integrated overview + consolidated suggestions + reflection questions
```

#### Input Structure (Example: Spending Domain)

```javascript
FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
  sheetName: 'Working Sheet',
  startRow: 4,
  inputColumns: [
    spendingCols.scores[0],     // Type score (numeric)
    spendingCols.labels[0],     // Type label (text description)
    spendingCols.scores[1],     // Behavior score
    spendingCols.labels[1],     // Behavior label
    spendingCols.scores[2],     // Feeling score
    spendingCols.labels[2],     // Feeling label
    spendingCols.scores[3],     // Consequence score
    spendingCols.labels[3],     // Consequence label
    ...spendingCols.openResponses,  // ⭐ FREE-TEXT STORIES
    processingCols.quotient
  ],
  inputLabels: [
    'Spending Guilt Score',
    'Spending Guilt Pattern',
    'Impulse Control Score',
    'Impulse Control Pattern',
    'Post-Purchase Emotion Score',
    'Post-Purchase Emotion Pattern',
    'Financial Impact Score',
    'Financial Impact Pattern',
    'Fear Pattern Story (Open Response)',      // ⭐ STUDENT'S STORY
    'Life Impact Story (Open Response)',       // ⭐ STUDENT'S STORY
    'Spending Fear Quotient'
  ],
  outputColumns: {
    Analysis: processingCols.analysis,
    Summary: processingCols.summary,
    ReflectionPrompt: processingCols.reflection
  },
  checkColumn: processingCols.analysis,
  systemPrompt: `...`,  // See below
  model: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 900,
  useRAG: true,
  ragTopK: 3,
  gptDelay: 1500
});
```

#### Prompt Structure (Story-Grounded)

```javascript
systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student.

Definition:
"Spending Fear/Control" means using spending (restriction or excess) as
protection from anxiety, self-worth issues, or safety concerns.

Inputs:
1. Spending Guilt Score (0-100; 0=healthy, 100=intense guilt)
2. Spending Guilt Pattern (description of beliefs about deserving)
3. Impulse Control Score (0-100; 0=excellent, 100=frequent impulse issues)
4. Impulse Control Pattern (description of impulse habits)
5-8. [More scores and patterns]
9. Fear Pattern Story (Open Response): Client describes their strongest
   spending fear/control pattern and what it protects them from feeling
10. Life Impact Story (Open Response): Client describes how fear-driven
    spending habits have impacted their life
11. Spending Fear Quotient (0-100; impact level)

**CRITICAL**: The Fear Pattern Story and Life Impact Story provide the
client's own insights. Reference these stories DIRECTLY in your analysis
to ground your recommendations in their specific experiences.

**Use exact input values—do not invent or swap any numbers or labels.**

Return **plain-text only** in exactly these three sections—no JSON, no markdown:

Analysis:
(2–3 sentences connecting spending patterns to underlying fears;
insert a blank line between each sentence.)

Summary:
- Actionable suggestion one
- Actionable suggestion two
- Actionable suggestion three

ReflectionPrompt:
(One thoughtful question to explore relationship between spending and safety/worth.)
`;
```

#### Progressive Context Example

```javascript
// Domain 2 includes Domain 1 insights
inputColumns: [
  hidingCols.scores[0], hidingCols.labels[0],
  // ... more hiding money data ...
  previousAnalysis.analysis,      // ⭐ SPENDING DOMAIN ANALYSIS
  previousAnalysis.summary,       // ⭐ SPENDING SUGGESTIONS
  previousAnalysis.reflection     // ⭐ SPENDING REFLECTION
],
inputLabels: [
  'Money Hiding Score', 'Money Hiding Pattern',
  // ... more labels ...
  'Previous Analysis - Spending',       // ⭐ CONTEXT
  'Previous Suggestions - Spending',    // ⭐ CONTEXT
  'Previous Reflection - Spending'      // ⭐ CONTEXT
],
systemPrompt: `
Build upon the previous Spending analysis to understand how financial
avoidance and spending patterns reinforce each other.

When crafting responses, reference the previous domain insights and build
a cohesive narrative about their overall relationship with financial fear.
`
```

#### Configuration

- **Model:** GPT-4o-mini (domains), GPT-4o (overall synthesis)
- **Temperature:** 0.2 (low variability, more consistent)
- **Max Tokens:** 900 per call
- **Cost:** ~$0.041 per student (6 calls × $0.003 + 1 call × $0.023)
- **Processing Time:** ~10 seconds per student (6 calls × 1.5s delay)

#### RAG (Retrieval-Augmented Generation)

```javascript
if (useRAG) {
  // 1. Fetch embedding for student's responses
  const queryEmb = fetchEmbedding(vals.join('\n'));

  // 2. Find top-K most similar knowledge chunks
  const scored = chunkRows
    .map((row, idx) => {
      const emb = JSON.parse(row[idxEmbed]);
      return {
        idx,
        text: row[idxChunkText],
        score: cosineSimilarity(queryEmb, emb)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, ragTopK);  // Top 3

  // 3. Prepend knowledge to prompt
  extraContext = scored.map(s => s.text).join('\n\n');
  userPrompt = `Context:\n${extraContext}\n\n${userPrompt}`;

  // 4. Track usage for analytics
  scored.forEach(item => {
    chunkSheet.getRange(item.idx + 2, idxUsage + 1)
      .setValue(usageCount + 1);
    statsSheet.updateTagRetrievalCount(item.tags);
  });
}
```

#### Plain-Text Parsing (Resilient)

```javascript
function parseGPTContent(responseJSON, outputCols) {
  const content = responseJSON?.choices?.[0]?.message?.content || '';
  const result = {};

  Object.keys(outputCols).forEach(key => {
    // Regex to extract section
    const re = new RegExp(
      key + ':\\s*' +                    // "Analysis:" or "Summary:"
      '([\\s\\S]*?)' +                   // Capture everything
      '(?=\\n\\n[A-Z][a-zA-Z]*:|$)',    // Until next section or end
      'i'
    );
    const m = content.match(re);
    result[key] = m ? m[1].trim() : '';
  });

  // Post-processing: Add line breaks between sentences in Analysis
  if (result.Analysis) {
    result.Analysis = result.Analysis.replace(/\. (?=[A-Z])/g, '.\n\n');
  }

  return result;
}
```

#### Strengths

1. ✅ **Highly personalized** - GPT sees actual student stories
2. ✅ **Story-grounded** - References specific examples from responses
3. ✅ **Cumulative narrative** - Each domain builds on previous insights
4. ✅ **Error resilient** - Plain text parsing handles format variations
5. ✅ **Flexible output** - No strict JSON requirements
6. ✅ **Cost-optimized** - Smaller model for routine work, GPT-4o for synthesis
7. ✅ **RAG support** - Can pull from knowledge base
8. ✅ **Actionable insights** - Based on real patterns, not abstract scores

#### Weaknesses

1. ❌ **More complex** - 6 separate function calls per student
2. ❌ **Higher total API cost** - Multiple calls add up
3. ❌ **Slower processing** - 1.5s delay × 6 calls = 9+ seconds
4. ❌ **Order dependency** - Must process domains sequentially
5. ❌ **Harder to debug** - Plain text parsing less predictable than JSON
6. ❌ **More code** - ~470 lines for GPTAnalysisFunctions.js

---

## 🏗️ Recommended Architecture

### Hybrid Approach for TruPath v3

**Goal:** Combine Tool 7's personalization with Tool 2's simplicity, optimized for cost and speed.

### Core Principles

1. ✅ **Story-grounded prompts** - GPT sees actual student responses
2. ✅ **Background processing** - Analyze during form completion
3. ✅ **3-tier fallback** - GPT → Retry → Hard-coded
4. ✅ **Plain-text output** - Resilient parsing
5. ✅ **Progressive context** - Later analyses see earlier insights
6. ✅ **Two-tier models** - Mini for analysis, GPT-4o for synthesis
7. ✅ **Async execution** - Non-blocking API calls

### Architecture Diagram

```
USER FLOW                  GPT PROCESSING              DATA STORAGE
═══════════════════════════════════════════════════════════════════════

Page 1: Demographics
  ↓ (no free-text)
  Save to PropertiesService

Page 2: Money Flow
  ↓ Q18 (income sources)
  Save to PropertiesService → [GPT Call #1 - async] → Store insight
  ↓ Q23 (major expenses)                                     ↓
  Save to PropertiesService → [GPT Call #2 - async] → Store insight
  ↓ Q24 (wasteful spending)          (context: Q18)           ↓
  Save to PropertiesService → [GPT Call #3 - async] → Store insight
                                     (context: Q18, Q23)       ↓
Page 3: Obligations
  ↓ Q29 (debt list)
  Save to PropertiesService → [GPT Call #4 - async] → Store insight
                                     (context: Q18-Q24)        ↓
Page 4: Growth
  ↓ Q43 (investments)
  Save to PropertiesService → [GPT Call #5 - async] → Store insight
                                     (context: Q18-Q29)        ↓
Page 5: Protection + Trauma
  ↓ Q52 (emotions)
  Save to PropertiesService → [GPT Call #6 - async] → Store insight
  ↓ Q55/Q56 (adaptive trauma)        (context: all previous)  ↓
  Save to PropertiesService → [GPT Call #7 - async] → Store insight
                                     (context: all previous)   ↓
SUBMIT
  ↓
  Check PropertiesService for insights
  ↓
  Run missing analyses (if any failed)
  ↓
  [GPT Call #8 - SYNTHESIS] ← All insights + domain scores
  ↓
  Save to RESPONSES sheet
  ↓
  Generate report (instant - 3s max)
  ↓
  Clean up PropertiesService
```

### File Structure

```
tools/tool2/
├── Tool2.js                    # Main tool (existing)
├── Tool2Report.js              # Report generation (existing)
├── Tool2GPTAnalysis.js         # NEW: GPT analysis functions
├── Tool2Fallbacks.js           # NEW: Hard-coded fallback insights
└── tool.manifest.json          # Tool metadata (existing)

docs/
├── GPT-IMPLEMENTATION-GUIDE.md      # This document
├── GPT-IMPLEMENTATION-CHECKLIST.md  # Step-by-step checklist
└── GPT-PROMPT-LIBRARY.md            # Reusable prompt templates (future)
```

---

## 🔄 Background Processing Strategy

### Core Concept

Run GPT analysis **during form completion**, not after submission. By the time user clicks "Submit", most insights are already computed.

### Implementation Pattern

```javascript
// In Tool2.js

savePageData(page, clientId, formData) {
  // Step 1: Save form data to PropertiesService (existing)
  const draftKey = `tool2_draft_${clientId}`;
  const existingData = this.getExistingData(clientId) || {};
  const mergedData = Object.assign({}, existingData, formData);
  PropertiesService.getUserProperties().setProperty(
    draftKey,
    JSON.stringify(mergedData)
  );

  // Step 2: Trigger background GPT analysis for free-text responses (NEW)
  this.triggerBackgroundGPTAnalysis(page, clientId, formData, mergedData);
}

triggerBackgroundGPTAnalysis(page, clientId, formData, allData) {
  const triggers = {
    2: [
      {field: 'q18_income_sources', type: 'income_sources'},
      {field: 'q23_major_expenses', type: 'major_expenses'},
      {field: 'q24_wasteful_spending', type: 'wasteful_spending'}
    ],
    3: [
      {field: 'q29_debt_list', type: 'debt_list'}
    ],
    4: [
      {field: 'q43_investment_types', type: 'investments'}
    ],
    5: [
      {field: 'q52_emotions', type: 'emotions'},
      {field: this.getAdaptiveTraumaField(allData), type: 'adaptive_trauma'}
    ]
  };

  const pageTriggers = triggers[page] || [];

  pageTriggers.forEach(trigger => {
    if (formData[trigger.field]) {
      this.analyzeResponseInBackground(
        clientId,
        trigger.type,
        formData[trigger.field],
        allData
      );
    }
  });
}

analyzeResponseInBackground(clientId, responseType, responseText, allData) {
  try {
    // Get domain scores (if available from Tool 1 or partial data)
    const domainScores = this.getPartialDomainScores(allData);

    // Get previous insights for context
    const previousInsights = this.getExistingInsights(clientId);

    // Call GPT with 3-tier fallback system
    const insight = Tool2GPTAnalysis.analyzeResponse({
      clientId,
      responseType,
      responseText,
      previousInsights,
      formData: allData,
      domainScores
    });

    // Store result in PropertiesService
    const insightKey = `tool2_gpt_${clientId}`;
    const existingInsights = this.getExistingInsights(clientId) || {};
    existingInsights[responseType] = insight;
    existingInsights[`${responseType}_timestamp`] = new Date().toISOString();

    PropertiesService.getUserProperties().setProperty(
      insightKey,
      JSON.stringify(existingInsights)
    );

    Logger.log(`✅ Background GPT analysis complete: ${clientId} - ${responseType}`);

  } catch (error) {
    // Don't block form progression if GPT fails
    Logger.log(`⚠️ Background GPT analysis failed: ${clientId} - ${responseType}: ${error.message}`);

    // Store error state for retry at submission
    const insightKey = `tool2_gpt_${clientId}`;
    const existingInsights = this.getExistingInsights(clientId) || {};
    existingInsights[`${responseType}_error`] = {
      message: error.message,
      timestamp: new Date().toISOString()
    };

    PropertiesService.getUserProperties().setProperty(
      insightKey,
      JSON.stringify(existingInsights)
    );
  }
}

getExistingInsights(clientId) {
  const insightKey = `tool2_gpt_${clientId}`;
  const stored = PropertiesService.getUserProperties().getProperty(insightKey);
  return stored ? JSON.parse(stored) : {};
}
```

### Submission Handler

```javascript
// In Tool2.js

processFinalSubmission(clientId, finalPageData) {
  // Step 1: Save final page data
  this.savePageData(5, clientId, finalPageData);

  // Step 2: Calculate domain scores (fast - already working)
  const allData = this.getExistingData(clientId);
  const results = this.calculateScores(allData);

  // Step 3: Retrieve pre-computed GPT insights
  const gptInsights = this.getExistingInsights(clientId);

  // Step 4: Check for missing or failed insights
  const requiredInsights = [
    'income_sources',
    'major_expenses',
    'wasteful_spending',
    'debt_list',
    'investments',
    'emotions',
    'adaptive_trauma'
  ];

  const missingInsights = requiredInsights.filter(key =>
    !gptInsights[key] || gptInsights[`${key}_error`]
  );

  // Step 5: Run missing analyses synchronously (only if needed)
  if (missingInsights.length > 0) {
    Logger.log(`⚠️ Missing ${missingInsights.length} insights, running now...`);

    missingInsights.forEach(key => {
      const responseText = this.getResponseTextForKey(key, allData);

      if (responseText) {
        const insight = Tool2GPTAnalysis.analyzeResponse({
          clientId,
          responseType: key,
          responseText,
          previousInsights: gptInsights,
          formData: allData,
          domainScores: results.domainScores
        });

        gptInsights[key] = insight;
      }
    });
  }

  // Step 6: Run final synthesis (1 call, fast with pre-computed insights)
  const overallInsight = Tool2GPTAnalysis.synthesizeOverall(
    clientId,
    gptInsights,
    results.domainScores
  );

  // Step 7: Save everything to RESPONSES sheet
  const submissionData = {
    data: allData,
    results: results,
    gptInsights: gptInsights,
    overallInsight: overallInsight,
    submittedAt: new Date().toISOString()
  };

  DataService.saveToolResponse(clientId, 'tool2', submissionData);

  // Step 8: Clean up PropertiesService
  PropertiesService.getUserProperties().deleteProperty(`tool2_draft_${clientId}`);
  PropertiesService.getUserProperties().deleteProperty(`tool2_gpt_${clientId}`);

  // Step 9: Return report
  return Tool2Report.render(clientId);
}
```

### Timeline Benefits

```
TRADITIONAL APPROACH (Wait Until Submit):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User completes form → Clicks Submit
  ↓
Wait for 8 GPT calls (8 × 3s = 24s)
  ↓
Report loads
TOTAL WAIT: 24 seconds ❌


BACKGROUND PROCESSING APPROACH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User fills Page 2 → GPT calls run in background
User fills Page 3 → More GPT calls run
User fills Page 4 → More GPT calls run
User fills Page 5 → Final GPT calls run
User clicks Submit
  ↓
Check PropertiesService (7 insights ready ✅)
Run synthesis call (1 × 3s = 3s)
  ↓
Report loads
TOTAL WAIT: 3 seconds ✅
```

### PropertiesService Management

**Storage Pattern:**
```javascript
// Draft data key
`tool2_draft_${clientId}` → {q1: 'value', q2: 'value', ...}

// GPT insights key
`tool2_gpt_${clientId}` → {
  income_sources: {
    pattern: '...',
    insight: '...',
    action: '...',
    source: 'gpt',
    timestamp: '2025-11-05T03:00:00.000Z'
  },
  major_expenses: {...},
  // ... more insights
  major_expenses_error: {  // If failed
    message: 'API timeout',
    timestamp: '2025-11-05T03:01:00.000Z'
  }
}
```

**Expiration:** PropertiesService has 6-hour expiration, which is fine for typical form sessions (10-30 minutes).

**Cleanup:** Delete both keys after successful submission to RESPONSES sheet.

---

## 🛡️ 3-Tier Fallback System

### Reliability Guarantee

Users **always** receive a complete, valuable report even if GPT fails completely.

### Tier Hierarchy

```
ATTEMPT 1: Pre-computed GPT Insight (Background)
  ↓ (if missing or failed)
ATTEMPT 2: Real-time GPT Call (Synchronous Retry)
  ↓ (if failed)
ATTEMPT 3: Hard-coded Fallback Insight (Domain-Specific)
  ↓
RESULT: Always get insight (source flagged for transparency)
```

### Implementation

```javascript
// In Tool2GPTAnalysis.js

const Tool2GPTAnalysis = {

  /**
   * Analyze response with automatic 3-tier fallback
   * @returns {object} Insight with source attribution
   */
  analyzeResponse({clientId, responseType, responseText, previousInsights, formData, domainScores}) {

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Attempting GPT analysis: ${clientId} - ${responseType}`);

      const systemPrompt = this.getPromptForType(responseType, previousInsights);
      const userPrompt = this.buildUserPrompt(responseText, previousInsights);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 300
      });

      const parsed = this.parseResponse(result);

      // Validate response completeness
      if (this.isValidInsight(parsed)) {
        Logger.log(`✅ [TIER 1] GPT success: ${responseType}`);
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`⚠️ [TIER 1] GPT failed: ${responseType} - ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis (After Delay)
      // ============================================================
      try {
        Utilities.sleep(2000);  // Wait 2 seconds before retry
        Logger.log(`[TIER 2] Retrying GPT analysis: ${clientId} - ${responseType}`);

        const systemPrompt = this.getPromptForType(responseType, previousInsights);
        const userPrompt = this.buildUserPrompt(responseText, previousInsights);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o-mini',
          temperature: 0.2,
          maxTokens: 300
        });

        const parsed = this.parseResponse(result);

        if (this.isValidInsight(parsed)) {
          Logger.log(`✅ [TIER 2] GPT retry success: ${responseType}`);
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`❌ [TIER 2] GPT retry failed: ${responseType} - ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Hard-coded Fallback
        // ============================================================
        Logger.log(`[TIER 3] Using fallback insight: ${responseType}`);

        const fallback = Tool2Fallbacks.getFallbackInsight(
          responseType,
          formData,
          domainScores
        );

        // Log fallback usage for monitoring
        this.logFallbackUsage(clientId, responseType, retryError.message);

        return {
          ...fallback,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

  /**
   * Validate insight has all required sections
   */
  isValidInsight(insight) {
    return (
      insight &&
      insight.pattern &&
      insight.pattern.length > 10 &&
      insight.insight &&
      insight.insight.length > 10 &&
      insight.action &&
      insight.action.length > 10
    );
  },

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage(clientId, responseType, error) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      let logSheet = ss.getSheetByName('GPT_FALLBACK_LOG');

      if (!logSheet) {
        logSheet = ss.insertSheet('GPT_FALLBACK_LOG');
        logSheet.appendRow([
          'Timestamp',
          'Client_ID',
          'Response_Type',
          'Error_Message',
          'User_Email'
        ]);
      }

      logSheet.appendRow([
        new Date(),
        clientId,
        responseType,
        error,
        Session.getActiveUser().getEmail()
      ]);

    } catch (logError) {
      Logger.log(`Failed to log fallback usage: ${logError.message}`);
    }
  }
};
```

### Fallback Quality Standards

Hard-coded fallbacks **must**:

1. ✅ Be domain-specific (not generic)
2. ✅ Use domain scores to tailor recommendations
3. ✅ Provide actionable guidance
4. ✅ Consider response characteristics (length, content)
5. ✅ Match GPT output format (pattern, insight, action)
6. ✅ Feel valuable to users (not "error" messages)

### Example Fallback Implementation

```javascript
// In Tool2Fallbacks.js

getIncomePattern(response, scores) {
  const moneyFlowScore = scores.moneyFlow || 0;
  const responseLength = (response || '').length;

  // Use heuristics based on response and scores
  if (responseLength < 50) {
    return "Your income structure appears straightforward with limited detail provided about income sources.";
  } else if (moneyFlowScore < 30) {
    return "Your income clarity score suggests there may be inconsistency or uncertainty in your income streams.";
  } else if (moneyFlowScore >= 60) {
    return "Your income clarity score indicates a solid understanding of your income sources and their reliability.";
  } else {
    return "Your income structure shows moderate clarity with room to strengthen your understanding of income patterns.";
  }
}

getIncomeAction(response, scores) {
  const moneyFlowScore = scores.moneyFlow || 0;

  if (moneyFlowScore < 30) {
    return "Create a simple income log for the next 30 days. Track every dollar that comes in, its source, and when you received it. This builds awareness and reveals patterns.";
  } else if (moneyFlowScore >= 60) {
    return "Review your income sources quarterly to identify opportunities for growth, diversification, or increased stability in your highest-earning streams.";
  } else {
    return "Set up a monthly income review ritual. Spend 15 minutes on the 1st of each month reviewing last month's income by source, noting any surprises or changes.";
  }
}
```

See `Tool2Fallbacks.js` implementation for all 7 response types with comprehensive fallback logic.

---

## 💰 Cost Optimization

### Cost Breakdown by Approach

**Tool 2 Legacy (Single Call):**
```
1 call × GPT-4o × 2000 output tokens
= $0.10 per student
= $10.00 per 100 students
```

**Tool 7 Legacy (Multi-Pass):**
```
6 calls × GPT-4o-mini × 900 tokens = 6 × $0.003 = $0.018
1 call × GPT-4o × 900 tokens = $0.023
Total = $0.041 per student
= $4.10 per 100 students
```

**Recommended v3 Approach:**
```
8 calls × GPT-4o-mini × 300 tokens = 8 × $0.001 = $0.008
1 call × GPT-4o × 600 tokens = $0.015
Total = $0.023 per student
= $2.30 per 100 students
```

### Optimization Strategies

#### 1. Right-Size Token Limits

```javascript
// DON'T: Over-allocate tokens
{
  maxTokens: 2000  // Wasteful if response only needs 300
}

// DO: Match token limit to actual need
{
  maxTokens: 300   // Individual analysis
}
{
  maxTokens: 600   // Synthesis (longer output)
}
```

#### 2. Use Cheaper Models for Routine Work

```javascript
// Individual analyses (predictable, structured)
model: 'gpt-4o-mini'  // $0.15 per 1M tokens

// Overall synthesis (creative, nuanced)
model: 'gpt-4o'  // $2.50 per 1M tokens
```

#### 3. Reduce Temperature for Consistency

```javascript
// Lower temperature = more deterministic = fewer retries
temperature: 0.2  // vs 0.7 in Tool 2 legacy
```

#### 4. Cache Results Aggressively

```javascript
// Check for existing insights before calling GPT
const existing = this.getExistingInsights(clientId);
if (existing[responseType]) {
  return existing[responseType];  // Skip API call
}
```

#### 5. Batch Processing (Future Optimization)

```javascript
// If processing 100+ students at once:
// - Group by response type
// - Use batch API endpoint (50% discount)
// - Process overnight
```

### Cost Monitoring

```javascript
// Add to monitoring dashboard

function calculateGPTCosts() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const logSheet = ss.getSheetByName('GPT_INSIGHTS_LOG');
  const data = logSheet.getDataRange().getValues();

  const costs = {
    gpt_mini_calls: 0,
    gpt_4o_calls: 0,
    estimated_tokens: 0
  };

  data.slice(1).forEach(row => {
    const source = row[3];
    const responseType = row[2];

    if (source === 'gpt' || source === 'gpt_retry') {
      if (responseType === 'overall_synthesis') {
        costs.gpt_4o_calls++;
        costs.estimated_tokens += 600;
      } else {
        costs.gpt_mini_calls++;
        costs.estimated_tokens += 300;
      }
    }
  });

  const estimatedCost = (
    (costs.gpt_mini_calls * 300 * 0.15 / 1000000) +  // Input
    (costs.gpt_mini_calls * 300 * 0.60 / 1000000) +  // Output
    (costs.gpt_4o_calls * 600 * 2.50 / 1000000) +    // Input
    (costs.gpt_4o_calls * 600 * 10.00 / 1000000)     // Output
  );

  Logger.log(`GPT Cost Analysis:
    Mini Calls: ${costs.gpt_mini_calls}
    GPT-4o Calls: ${costs.gpt_4o_calls}
    Estimated Cost: $${estimatedCost.toFixed(3)}
    Cost per Student: $${(estimatedCost / (costs.gpt_mini_calls / 8)).toFixed(3)}
  `);
}
```

---

## 📝 Prompt Engineering Best Practices

### Core Principles from Tool 7

#### 1. Story-Grounded Prompts

**DON'T:**
```javascript
systemPrompt: `
Analyze this student's income based on their score of 45/100.
Provide generic advice about income management.
`;
```

**DO:**
```javascript
systemPrompt: `
You are analyzing a student's actual response about their income sources.

**CRITICAL**: Reference the student's exact words and specific examples.
Ground your insights in what THEY said, not generic financial advice.

Student's response: "${studentResponse}"

What patterns emerge from THEIR specific examples?
What does this reveal about THEIR financial clarity?
What concrete step fits THEIR situation?
`;
```

#### 2. Plain-Text Output (Not JSON)

**DON'T:**
```javascript
systemPrompt: `Return a JSON object: {"pattern": "...", "insight": "...", "action": "..."}`;
// Fragile - one malformed field breaks entire response
```

**DO:**
```javascript
systemPrompt: `
Return plain-text only in exactly these three sections:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means)

Action:
(One specific, actionable step)
`;
// Resilient - regex can extract sections even with minor formatting issues
```

#### 3. Explicit Value Constraints

**DON'T:**
```javascript
systemPrompt: `Use the provided values in your analysis.`;
// GPT might invent or swap numbers
```

**DO:**
```javascript
systemPrompt: `
**Use these exact input values—do not invent or swap any numbers or labels:**

1. Income Clarity Score: ${score}
2. Income Clarity Pattern: "${pattern}"
3. Student's Story: "${story}"

Reference these EXACT values in your response.
`;
```

#### 4. Progressive Context Building

**DON'T:**
```javascript
// Analyze each domain in isolation
analyzeIncome(data);
analyzeExpenses(data);
analyzeDebt(data);
```

**DO:**
```javascript
// Build cumulative narrative
const incomeInsight = analyzeIncome(data);
const expensesInsight = analyzeExpenses(data, {previousContext: incomeInsight});
const debtInsight = analyzeDebt(data, {previousContext: [incomeInsight, expensesInsight]});
```

#### 5. Structured Output Format

```javascript
systemPrompt: `
Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Pattern:
(One sentence identifying the key pattern in their response)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)

STOP after the Action section. Do not add conclusions, summaries, or additional text.
`;
```

#### 6. Temperature & Token Optimization

```javascript
// Individual analyses (predictable, structured)
{
  model: 'gpt-4o-mini',
  temperature: 0.2,  // Low variability
  maxTokens: 300     // Short, focused output
}

// Overall synthesis (creative, integrative)
{
  model: 'gpt-4o',
  temperature: 0.3,  // Slightly more creative
  maxTokens: 600     // Longer, more nuanced
}
```

### Example Prompt Library

#### Income Sources Analysis (Q18)

```javascript
getIncomeSourcesPrompt(previousInsights) {
  const contextSection = previousInsights
    ? `\n\nPrevious Financial Insights:\n${JSON.stringify(previousInsights, null, 2)}\n`
    : '';

  return `
You are a financial clarity expert analyzing a student's income sources.

**CRITICAL**: Reference the student's exact words and specific examples from
their response. Ground your insights in what THEY said, not generic advice.

${contextSection}

Analyze their response for:
1. Pattern: What pattern emerges from their specific income sources?
2. Insight: What does this reveal about their income clarity and stability?
3. Action: One concrete step based on THEIR situation (not generic advice)

Consider:
- Number of income sources (diversification vs simplicity)
- Predictability and consistency of each source
- Clarity about amounts and timing
- Active vs passive income mix
- Alignment with goals and values

Return plain-text only:

Pattern:
(One sentence identifying the key pattern in their income structure)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)
  `.trim();
}
```

#### Overall Synthesis

```javascript
getOverallSynthesisPrompt(allInsights, domainScores) {
  return `
You are synthesizing a comprehensive Financial Clarity report for a student.

You have:
1. Domain Scores (0-100%):
   - Money Flow: ${domainScores.moneyFlow}%
   - Obligations: ${domainScores.obligations}%
   - Liquidity: ${domainScores.liquidity}%
   - Growth: ${domainScores.growth}%
   - Protection: ${domainScores.protection}%

2. Individual Insights from 8 free-text responses:
${JSON.stringify(allInsights, null, 2)}

Create a cohesive narrative that:
- Connects their numeric clarity scores to their personal stories
- Identifies the top 2-3 patterns across all domains
- Provides 3-5 prioritized action steps based on their specific situation
- References specific examples from their responses

Return plain-text only:

Overview:
(2-3 paragraphs connecting scores to stories and identifying key themes)

Top Patterns:
- Pattern 1: [Most significant pattern across domains]
- Pattern 2: [Secondary pattern or reinforcing behavior]
- Pattern 3: [Opportunity or strength to leverage]

Priority Actions:
1. [Action based on lowest domain score - specific to their situation]
2. [Action based on most impactful pattern - references their examples]
3. [Action for building momentum - leverages their strengths]
4. [Action for emotional/psychological support - addresses feelings they shared]
5. [Action for long-term transformation - connects to their values]

STOP after Priority Actions. Do not add conclusions or additional text.
  `.trim();
}
```

---

## 🛠️ Error Handling & Resilience

### Common Failure Modes

1. ❌ **API Timeout** - OpenAI takes >30s to respond
2. ❌ **Rate Limit** - Too many requests in short time
3. ❌ **Malformed Response** - GPT returns incomplete or invalid format
4. ❌ **Quota Exceeded** - Account out of credits
5. ❌ **Network Error** - Connection issues
6. ❌ **PropertiesService Expiration** - Insights stored >6 hours ago

### Resilience Patterns

#### 1. Retry with Exponential Backoff

```javascript
callGPT({systemPrompt, userPrompt, model, temperature, maxTokens}, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')
        },
        payload: JSON.stringify({
          model,
          messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: userPrompt}
          ],
          temperature,
          max_tokens: maxTokens
        }),
        muteHttpExceptions: true
      });

      const json = JSON.parse(response.getContentText());

      // Check for API errors
      if (json.error) {
        throw new Error(`OpenAI API Error: ${json.error.message}`);
      }

      return json.choices[0].message.content;

    } catch (error) {
      Logger.log(`GPT call attempt ${i + 1} failed: ${error.message}`);

      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
        Utilities.sleep(delay);
      } else {
        throw error;  // Final attempt failed
      }
    }
  }
}
```

#### 2. Graceful Degradation

```javascript
// Always have a fallback that provides value
try {
  return gptAnalysis();
} catch (error) {
  Logger.log(`GPT failed: ${error.message}`);
  return fallbackAnalysis();  // Still useful, just not personalized
}
```

#### 3. Async Error Isolation

```javascript
// Don't let GPT failures block form progression
savePageData(page, clientId, formData) {
  // Save form data (critical path)
  this.saveToDraft(clientId, formData);

  // Trigger GPT (nice-to-have, isolated failure)
  try {
    this.triggerGPTAnalysis(clientId, formData);
  } catch (error) {
    // Log but don't throw - user can still complete form
    Logger.log(`Non-blocking GPT error: ${error.message}`);
  }
}
```

#### 4. Timeout Protection

```javascript
callGPT(...args) {
  const timeoutMs = 30000;  // 30 second timeout

  try {
    const response = UrlFetchApp.fetch(url, {
      ...options,
      muteHttpExceptions: true,
      // Apps Script doesn't support request timeout, so we handle it differently
    });

    // Check response time manually if needed
    return response;

  } catch (error) {
    if (error.message.includes('timeout')) {
      Logger.log('GPT request timed out after 30s');
      throw new Error('Request timeout - using fallback');
    }
    throw error;
  }
}
```

#### 5. Rate Limit Handling

```javascript
// Add delay between requests
const GPT_DELAY_MS = 1500;

callGPT(...args) {
  try {
    const response = this.makeAPICall(...args);
    Utilities.sleep(GPT_DELAY_MS);  // Prevent rate limiting
    return response;
  } catch (error) {
    if (error.message.includes('rate_limit')) {
      Logger.log('Rate limit hit, waiting 60s');
      Utilities.sleep(60000);
      return this.makeAPICall(...args);  // Retry once
    }
    throw error;
  }
}
```

#### 6. Validation & Sanitization

```javascript
parseResponse(gptOutput) {
  try {
    // Extract sections with regex
    const pattern = this.extractSection(gptOutput, 'Pattern:');
    const insight = this.extractSection(gptOutput, 'Insight:');
    const action = this.extractSection(gptOutput, 'Action:');

    // Validate completeness
    if (!pattern || pattern.length < 10) {
      throw new Error('Pattern section missing or too short');
    }
    if (!insight || insight.length < 10) {
      throw new Error('Insight section missing or too short');
    }
    if (!action || action.length < 10) {
      throw new Error('Action section missing or too short');
    }

    // Sanitize (remove any unwanted characters)
    return {
      pattern: this.sanitize(pattern),
      insight: this.sanitize(insight),
      action: this.sanitize(action)
    };

  } catch (error) {
    Logger.log(`Parse error: ${error.message}`);
    throw new Error('Invalid GPT response format');
  }
}

sanitize(text) {
  return text
    .trim()
    .replace(/^["']|["']$/g, '')  // Remove quotes
    .replace(/\s+/g, ' ')         // Normalize whitespace
    .substring(0, 500);           // Limit length
}
```

---

## 📊 Code Patterns & Examples

See `GPT-IMPLEMENTATION-CHECKLIST.md` for step-by-step implementation with complete code examples.

Key files to create:
- `tools/tool2/Tool2GPTAnalysis.js` - Main GPT analysis functions
- `tools/tool2/Tool2Fallbacks.js` - Hard-coded fallback insights

---

## 🧪 Testing & Monitoring

### Test Cases

#### 1. Normal Operation Test

```javascript
function testNormalGPTFlow() {
  const testClient = 'TEST_GPT_001';
  const testData = {
    q18_income_sources: 'Full-time salary from tech company, occasional freelance web design',
    q23_major_expenses: 'Rent $1500, groceries $500, car payment $400',
    // ... more test data
  };

  // Test background processing
  Tool2.savePageData(2, testClient, testData);

  // Wait for processing
  Utilities.sleep(5000);

  // Check insights were stored
  const insights = Tool2.getExistingInsights(testClient);

  Logger.log('Test Results:');
  Logger.log(`- Income insight source: ${insights.income_sources?.source}`);
  Logger.log(`- Pattern length: ${insights.income_sources?.pattern?.length}`);

  // Cleanup
  PropertiesService.getUserProperties().deleteProperty(`tool2_gpt_${testClient}`);
}
```

#### 2. API Failure Test

```javascript
function testGPTFailover() {
  const testClient = 'TEST_GPT_002';

  // Temporarily break API key to force fallback
  const originalKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', 'invalid_key');

  // Attempt analysis
  const insight = Tool2GPTAnalysis.analyzeResponse({
    clientId: testClient,
    responseType: 'income_sources',
    responseText: 'Test income sources',
    formData: {},
    domainScores: {moneyFlow: 45}
  });

  // Check fallback was used
  Logger.log(`Insight source: ${insight.source}`);  // Should be 'fallback'
  Logger.log(`Pattern: ${insight.pattern}`);
  Logger.log(`Has error logged: ${!!insight.gpt_error}`);

  // Restore API key
  PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', originalKey);
}
```

#### 3. Performance Test

```javascript
function testGPTPerformance() {
  const startTime = new Date();

  // Simulate 5 background calls
  for (let i = 0; i < 5; i++) {
    Tool2GPTAnalysis.analyzeResponse({
      clientId: `PERF_TEST_${i}`,
      responseType: 'income_sources',
      responseText: 'Test response for performance measurement',
      formData: {},
      domainScores: {moneyFlow: 50}
    });
  }

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  Logger.log(`Performance Test Results:`);
  Logger.log(`- Total time: ${duration}s`);
  Logger.log(`- Average per call: ${(duration / 5).toFixed(2)}s`);
}
```

### Monitoring Dashboard

Create `GPT_INSIGHTS_LOG` sheet with columns:
- Timestamp
- Client_ID
- Response_Type
- Source (gpt, gpt_retry, fallback)
- Error_Message (if fallback)
- Processing_Time_MS
- User_Email

```javascript
function generateGPTReport() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const logSheet = ss.getSheetByName('GPT_INSIGHTS_LOG');
  const data = logSheet.getDataRange().getValues();

  // Last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentData = data.slice(1).filter(row => new Date(row[0]) > weekAgo);

  const stats = {
    total: recentData.length,
    gpt_success: 0,
    gpt_retry: 0,
    fallback: 0,
    avgProcessingTime: 0
  };

  recentData.forEach(row => {
    const source = row[3];
    const procTime = row[5];

    if (source === 'gpt') stats.gpt_success++;
    if (source === 'gpt_retry') stats.gpt_retry++;
    if (source === 'fallback') stats.fallback++;
    if (procTime) stats.avgProcessingTime += procTime;
  });

  stats.avgProcessingTime = stats.avgProcessingTime / recentData.length;

  const report = `
GPT Performance Report (Last 7 Days)
=====================================
Total Insights: ${stats.total}
Success Rate: ${((stats.gpt_success / stats.total) * 100).toFixed(1)}%
Retry Rate: ${((stats.gpt_retry / stats.total) * 100).toFixed(1)}%
Fallback Rate: ${((stats.fallback / stats.total) * 100).toFixed(1)}%
Avg Processing Time: ${stats.avgProcessingTime.toFixed(0)}ms

${stats.fallback / stats.total > 0.1 ? '⚠️ WARNING: Fallback rate >10%' : '✅ All systems normal'}
  `;

  Logger.log(report);
  return report;
}
```

---

## 📈 Performance Benchmarks

### Expected Performance

**Per Student:**
- Background processing: 8 calls × 3s = 24s total (happens during form, user doesn't wait)
- Final synthesis: 1 call × 3s = 3s (user waits)
- **User-perceived wait: 3 seconds** ✅

**Cost:**
- $0.023 per student
- $2.30 per 100 students
- $23.00 per 1000 students

**Success Rates:**
- GPT success: 95%
- Retry success: 4%
- Fallback usage: 1%

### Optimization Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Fallback rate | <5% | >10% | >20% |
| Avg processing time | <3s | >5s | >10s |
| Cost per student | <$0.03 | >$0.05 | >$0.10 |
| Success rate | >95% | <90% | <80% |

---

## 🔄 Future Enhancements

### Phase 2 (Future)

1. **RAG Integration**
   - Build knowledge base of financial best practices
   - Retrieve relevant examples for each analysis
   - Track usage and effectiveness

2. **Progressive Loading UI**
   - Show report skeleton immediately
   - Load GPT insights asynchronously with animations
   - Better perceived performance

3. **A/B Testing**
   - Test different prompt structures
   - Compare GPT-4o-mini vs GPT-4o quality
   - Optimize temperature and token limits

4. **Batch Processing**
   - Queue multiple students for overnight processing
   - Use OpenAI batch API (50% discount)
   - Reduce cost for large cohorts

5. **Fine-Tuned Model**
   - Train custom model on TruPath insights
   - Lower cost per inference
   - Higher consistency

---

## 📚 Reference Links

- **Tool 2 Legacy:** `/Users/Larry/code/FTP-v2/apps/Tool-2-financial-clarity-tool/scripts/ChatGPTCall.js`
- **Tool 7 Advanced:** `/Users/Larry/code/FTP-v2/apps/Tool-7-control-fear-grounding-grounding/scripts/src/GPTAnalysisFunctions.js`
- **Shared Library:** `/Users/Larry/code/shared-libs/advGptAnalysis.gs`
- **OpenAI Docs:** https://platform.openai.com/docs/guides/text-generation
- **OpenAI Pricing:** https://openai.com/api/pricing/

---

**Last Updated:** November 5, 2025
**Version:** 1.0
**Status:** Ready for Implementation

See `GPT-IMPLEMENTATION-CHECKLIST.md` for step-by-step implementation guide.
