# Comprehensive Implementation Plan: Cross-Tool Middleware & AI Integration

**Project:** Financial TruPath v3 - Intelligent Cross-Tool Analytics
**Created:** 2025-11-28
**Status:** Planning → Implementation Ready
**Owner:** Larry

---

## 🎯 Executive Summary

This document provides a complete implementation roadmap for building:

1. **Configuration-Driven Middleware Layer** - Scalable cross-tool analytics that works with Tools 1-8 without code changes
2. **AI Intelligence Layer** - Qualitative analysis, narrative synthesis, and pattern discovery
3. **Continuous Learning System** - Automatic pattern discovery from growing client data

**Key Principles:**
- ✅ Configuration over code (scales as new tools come online)
- ✅ Hybrid approach (rules detect, AI interprets)
- ✅ Cost-conscious (caching, budget controls, fallbacks)
- ✅ Privacy-aware (PII handling, opt-out capability)

**Expected Impact:**
- 📊 Turn 800+ existing responses into actionable insights
- 🎯 Detect patterns humans miss in qualitative data
- 🚀 Scale automatically as Tools 4-8 come online
- 💰 ~$15-20/month AI costs for 100 new clients
- 📈 Continuously improving insight quality

---

## 📐 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOOL COMPLETION EVENT                        │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────────────┐
    │     EXISTING: InsightsPipeline                    │
    │     Sequential Tool 1→2→3→4→5 insights           │
    └───────────────────────────────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────────────┐
    │   NEW: Cross-Tool Analytics (Configuration)       │
    │   - Read PatternMappings sheet                    │
    │   - Evaluate detection rules (structured data)    │
    │   - Save to DetectedPatterns sheet                │
    │   Cost: FREE | Speed: <1 sec                      │
    └───────────────────────────────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────────────┐
    │   NEW: Qualitative Analyzer (AI)                  │
    │   - Extract themes from open text                 │
    │   - Emotional analysis                            │
    │   - Trauma marker detection                       │
    │   Cost: ~$0.05/client | Speed: 5-10 sec          │
    └───────────────────────────────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────────────┐
    │   NEW: Smart Synthesizer (AI)                     │
    │   - Unified narrative across tools                │
    │   - Personalized recommendations                  │
    │   Cost: ~$0.03/client | Speed: 5 sec             │
    └───────────────────────────────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────────────┐
    │          UNIFIED CLIENT REPORT                     │
    │   - Structured data (patterns, scores)            │
    │   - Qualitative insights (themes, emotions)       │
    │   - AI narrative synthesis                        │
    │   - Trauma-informed recommendations               │
    └───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CONTINUOUS LEARNING LAYER                      │
│                   (Monthly Background Process)                   │
│                                                                  │
│   1. CorrelationEngine: Find statistical patterns               │
│   2. PatternDiscoveryAI: Interpret correlations                 │
│   3. Admin Review: Approve/reject suggestions                   │
│   4. Auto-Update: Add to PatternMappings sheet                  │
│                                                                  │
│   Cost: ~$5-10/month | Runs: Monthly                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ New File Structure

```
/Users/Larry/code/FTP-v3/
├── core/
│   ├── DataService.js                    # EXTEND (5 new methods)
│   ├── InsightsPipeline.js               # EXISTING (no changes)
│   ├── CrossToolAnalytics.js             # NEW (config-driven pattern detection)
│   ├── AIService.js                      # NEW (central AI infrastructure)
│   ├── AIBudgetManager.js                # NEW (cost controls)
│   ├── QualitativeAnalyzer.js            # NEW (analyze open text)
│   ├── SmartSynthesizer.js               # NEW (AI narratives)
│   ├── CorrelationEngine.js              # NEW (find statistical patterns)
│   ├── PatternDiscoveryAI.js             # NEW (AI pattern interpretation)
│   └── UnifiedClientReport.js            # NEW (comprehensive reporting)
├── Config.js                             # EXTEND (new sheet IDs, constants)
└── docs/
    ├── middleware-mapping.md             # EXISTING (reference)
    └── IMPLEMENTATION-PLAN-Middleware-AI.md  # THIS DOCUMENT
```

---

## 📊 New Google Sheets Required

### 1. **PatternMappings Sheet**

**Purpose:** Configuration for cross-tool pattern detection (like InsightMappings)

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Pattern_ID | Text | Unique identifier | `avoid_001` |
| Pattern_Name | Text | Display name | `Financial Avoidance` |
| Required_Tools | JSON Array | Tools needed | `["tool1","tool2","tool3"]` |
| Detection_Rules | JSON Array | Evaluation conditions | `[{"tool":"tool1","path":"scores.FSV","op":">","value":10}]` |
| Evidence_Fields | JSON Array | Fields to show as proof | `[{"tool":"tool1","path":"scores.FSV","label":"FSV Score"}]` |
| Severity | Enum | Impact level | `HIGH` / `MEDIUM` / `LOW` |
| Intervention | Text | Intervention category | `immediate` / `high` / `medium` / `low` |
| Active | Boolean | Enable/disable | `TRUE` / `FALSE` |
| Created_Date | Date | When added | `2025-11-28` |
| Created_By | Text | Who added it | `admin` / `ai_discovery` / `manual` |

**Initial Patterns to Add:** (from middleware-mapping.md)

```
Pattern_ID: avoid_001
Pattern_Name: Financial Avoidance Pattern
Required_Tools: ["tool1", "tool2", "tool3"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.FSV", "op": ">", "value": 10},
  {"tool": "tool2", "path": "formData.spendingClarity", "op": "<", "value": -2},
  {"tool": "tool3", "path": "scoring.subdomainQuotients.subdomain_1_3", "op": ">", "value": 1}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.FSV", "label": "FSV Score"},
  {"tool": "tool2", "path": "formData.spendingClarity", "label": "Spending Clarity"},
  {"tool": "tool3", "path": "scoring.subdomainQuotients.subdomain_1_3", "label": "Can't See Reality Score"}
]
Severity: HIGH
Intervention: immediate
Active: TRUE

---

Pattern_ID: giving_002
Pattern_Name: Over-Giving Pattern
Required_Tools: ["tool1", "tool2"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.Showing", "op": ">", "value": 15},
  {"tool": "tool2", "path": "results.domainScores.obligations", "op": ">", "value": 60}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.Showing", "label": "Showing Score"},
  {"tool": "tool2", "path": "results.domainScores.obligations", "label": "Obligations Score"}
]
Severity: HIGH
Intervention: high
Active: TRUE

---

Pattern_ID: approval_003
Pattern_Name: Approval-Seeking Spending
Required_Tools: ["tool1", "tool2", "tool3"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.ExVal", "op": ">", "value": 12},
  {"tool": "tool2", "path": "formData.wastefulSpending", "op": "contains", "value": "status|brand|image"},
  {"tool": "tool3", "path": "scoring.domainQuotients.domain2", "op": ">", "value": 1}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.ExVal", "label": "External Validation Score"},
  {"tool": "tool2", "path": "formData.wastefulSpending", "label": "Wasteful Spending"},
  {"tool": "tool3", "path": "scoring.domainQuotients.domain2", "label": "External Validation Domain"}
]
Severity: HIGH
Intervention: high
Active: TRUE

---

Pattern_ID: control_004
Pattern_Name: Control Issues Pattern
Required_Tools: ["tool1", "tool2"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.Control", "op": ">", "value": 12},
  {"tool": "tool2", "path": "formData.spendingClarity", "op": "abs>", "value": 4}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.Control", "label": "Control Score"},
  {"tool": "tool2", "path": "formData.spendingClarity", "label": "Spending Clarity (Extreme)"}
]
Severity: MEDIUM
Intervention: medium
Active: TRUE

---

Pattern_ID: scarcity_005
Pattern_Name: Scarcity Mindset Pattern
Required_Tools: ["tool1", "tool2", "tool3"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.FSV", "op": ">", "value": 10},
  {"tool": "tool2", "path": "formData.financialScarcity", "op": "<", "value": -2},
  {"tool": "tool3", "path": "scoring.subdomainQuotients.subdomain_1_2", "op": ">", "value": 1}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.FSV", "label": "FSV Score"},
  {"tool": "tool2", "path": "formData.financialScarcity", "label": "Financial Scarcity"},
  {"tool": "tool3", "path": "scoring.subdomainQuotients.subdomain_1_2", "label": "Never Have Enough Score"}
]
Severity: HIGH
Intervention: high
Active: TRUE

---

Pattern_ID: isolation_006
Pattern_Name: Financial Isolation Pattern
Required_Tools: ["tool1", "tool2", "tool3"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.Receiving", "op": ">", "value": 10},
  {"tool": "tool2", "path": "formData.adaptiveImpact", "op": "regex", "value": "isolat|alone|no one|myself"},
  {"tool": "tool3", "path": "scoring.subdomainQuotients.subdomain_2_2", "op": ">", "value": 0.5}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.Receiving", "label": "Receiving Score"},
  {"tool": "tool2", "path": "formData.adaptiveImpact", "label": "Adaptive Impact (Isolation Language)"},
  {"tool": "tool3", "path": "scoring.subdomainQuotients.subdomain_2_2", "label": "What Will They Think Score"}
]
Severity: HIGH
Intervention: high
Active: TRUE
```

### 2. **DetectedPatterns Sheet**

**Purpose:** Store patterns detected for each client

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| Timestamp | Date | When detected |
| Client_ID | Text | Client identifier |
| Pattern_ID | Text | From PatternMappings |
| Pattern_Name | Text | Human-readable name |
| Severity | Text | HIGH/MEDIUM/LOW |
| Intervention | Text | immediate/high/medium/low |
| Evidence | JSON | Evidence fields with values |
| Status | Text | active/archived |

### 3. **AI_Usage Sheet**

**Purpose:** Track AI API usage and costs

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| Timestamp | Date | When called |
| Client_ID | Text | Client identifier |
| Analysis_Type | Text | adaptive_impact/emotions/narrative/etc |
| Source | Text | gpt/gpt_retry/cache/fallback |
| Prompt_Tokens | Number | Input token count |
| Completion_Tokens | Number | Output token count |
| Total_Tokens | Number | Sum |
| Cost | Number | Estimated cost in USD |

### 4. **QualitativeInsights Sheet**

**Purpose:** Store AI-analyzed qualitative data

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| Timestamp | Date | When analyzed |
| Client_ID | Text | Client identifier |
| Tool_ID | Text | Source tool |
| Field_Name | Text | Which field analyzed |
| Analysis_Type | Text | adaptive_impact/emotions/wasteful_spending/etc |
| Extracted_Themes | JSON | Themes, markers, patterns |
| Emotional_Intensity | Number | 1-10 scale |
| Crisis_Indicators | JSON | Red flags if any |
| Source | Text | gpt/cache/fallback |
| Raw_Text | Text | Original text analyzed |

### 5. **SuggestedPatterns Sheet**

**Purpose:** AI-discovered patterns awaiting admin review

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| Discovered_Date | Date | When found |
| Pattern_ID | Text | Suggested ID |
| Suggested_Name | Text | AI-generated name |
| Correlation_Data | JSON | Statistical data |
| Detection_Rules | JSON | Suggested rules |
| AI_Interpretation | JSON | Clinical meaning |
| Confidence | Number | 0.0-1.0 |
| Status | Text | pending_review/approved/rejected |
| Reviewed_By | Text | Admin username |
| Reviewed_Date | Date | When reviewed |
| Notes | Text | Admin notes |

---

## 🔧 Implementation Phases

---

## **PHASE 1: Foundation Layer** (Week 1-2)

**Goal:** Build configuration-driven middleware without AI

### Tasks:

#### 1.1 Create PatternMappings Sheet
- [ ] Create new sheet in Google Sheets
- [ ] Add column headers as specified above
- [ ] Import 6 initial patterns from middleware-mapping.md
- [ ] Test pattern JSON validity

**Deliverable:** PatternMappings sheet with 6 working patterns

---

#### 1.2 Create DetectedPatterns Sheet
- [ ] Create new sheet
- [ ] Add column headers
- [ ] Set up data validation rules

**Deliverable:** Empty DetectedPatterns sheet ready for data

---

#### 1.3 Extend Config.js
- [ ] Add new sheet IDs

```javascript
// In Config.js - ADD THESE

// Cross-Tool Analytics Sheets
PATTERN_MAPPINGS_SHEET_ID: 'YOUR_SHEET_ID',
DETECTED_PATTERNS_SHEET_ID: 'YOUR_SHEET_ID',
AI_USAGE_SHEET_ID: 'YOUR_SHEET_ID',
QUALITATIVE_INSIGHTS_SHEET_ID: 'YOUR_SHEET_ID',
SUGGESTED_PATTERNS_SHEET_ID: 'YOUR_SHEET_ID',

// AI Configuration
OPENAI_API_KEY: PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY'), // Already exists
AI_MONTHLY_BUDGET: 100, // USD
AI_MODEL_DEFAULT: 'gpt-4o-mini',
AI_CACHE_DURATION: 86400, // 24 hours in seconds
```

**Deliverable:** Config.js updated with new constants

---

#### 1.4 Extend DataService.js

Add 5 new methods to existing file:

```javascript
// In core/DataService.js - ADD THESE METHODS

/**
 * Get all completed responses for a client across all tools
 */
getAllClientResponses(clientId) {
  // Implementation from architecture doc
}

/**
 * Get specific fields across multiple tools
 */
getFieldsAcrossTools(clientId, fieldMap) {
  // Implementation from architecture doc
}

/**
 * Check if client has completed specific tools
 */
hasCompletedTools(clientId, toolIds) {
  // Implementation from architecture doc
}

/**
 * Get completion timeline for a client
 */
getCompletionTimeline(clientId) {
  // Implementation from architecture doc
}

/**
 * Get nested value from object using dot notation
 */
getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) =>
    current && current[key] !== undefined ? current[key] : null, obj);
}
```

**Deliverable:** DataService.js with 5 new methods

**Testing:**
```javascript
function testDataServiceExtensions() {
  const testClientId = '0391ES'; // Evelia Salazar from real data

  // Test 1: getAllClientResponses
  const responses = DataService.getAllClientResponses(testClientId);
  Logger.log(`Found ${Object.keys(responses).length} completed tools`);

  // Test 2: getFieldsAcrossTools
  const fields = DataService.getFieldsAcrossTools(testClientId, {
    tool1: ['winner', 'scores.FSV'],
    tool2: ['results.archetype', 'formData.primaryObstacle']
  });
  Logger.log(JSON.stringify(fields, null, 2));

  // Test 3: hasCompletedTools
  const completed = DataService.hasCompletedTools(testClientId, ['tool1', 'tool2', 'tool3']);
  Logger.log(`Completion status: ${JSON.stringify(completed)}`);

  // Test 4: getCompletionTimeline
  const timeline = DataService.getCompletionTimeline(testClientId);
  Logger.log(`Timeline: ${JSON.stringify(timeline, null, 2)}`);
}
```

---

#### 1.5 Create CrossToolAnalytics.js

**File:** `core/CrossToolAnalytics.js`

**Core Methods:**
- `detectPatterns(clientId)` - Main pattern detection
- `evaluateRule(rule, responses)` - Single rule evaluation
- `getPatternMappings()` - Read from sheet with caching
- `saveDetectedPatterns(clientId, patterns)` - Write results
- `getNestedValue(obj, path)` - Utility

**Full implementation:** See architecture document above

**Deliverable:** Complete CrossToolAnalytics.js file

**Testing:**
```javascript
function testPatternDetection() {
  const testClientId = '0391ES'; // Known patterns: Receiving winner

  const patterns = CrossToolAnalytics.detectPatterns(testClientId);
  Logger.log(`Detected ${patterns.length} patterns:`);
  patterns.forEach(p => {
    Logger.log(`  - ${p.patternName} (${p.severity})`);
    Logger.log(`    Evidence: ${JSON.stringify(p.evidence, null, 2)}`);
  });

  // Expected: Should detect "Financial Isolation Pattern" for Evelia
}
```

---

#### 1.6 Integration Test - End to End

**Test Script:**
```javascript
function testPhase1Integration() {
  Logger.log('=== PHASE 1 INTEGRATION TEST ===\n');

  // Test with 3 real clients with different patterns
  const testClients = [
    '0391ES', // Evelia - Receiving pattern
    '2382GS', // Greg - Showing pattern
    '2798AM'  // Adrian - ExVal pattern
  ];

  testClients.forEach(clientId => {
    Logger.log(`\n--- Testing ${clientId} ---`);

    // 1. Get all responses
    const responses = DataService.getAllClientResponses(clientId);
    Logger.log(`Completed tools: ${Object.keys(responses).join(', ')}`);

    // 2. Detect patterns
    const patterns = CrossToolAnalytics.detectPatterns(clientId);
    Logger.log(`Patterns detected: ${patterns.length}`);

    patterns.forEach(p => {
      Logger.log(`  ✓ ${p.patternName} (${p.severity})`);
    });

    // 3. Verify saved to sheet
    const sheet = SpreadsheetApp.openById(Config.DETECTED_PATTERNS_SHEET_ID);
    const data = sheet.getSheetByName('DetectedPatterns').getDataRange().getValues();
    const clientPatterns = data.filter(row => row[1] === clientId);
    Logger.log(`Saved to sheet: ${clientPatterns.length} patterns`);
  });

  Logger.log('\n=== PHASE 1 TEST COMPLETE ===');
}
```

**Success Criteria:**
- ✅ All 3 test clients have patterns detected
- ✅ Patterns match expected from middleware-mapping.md
- ✅ Evidence fields populated correctly
- ✅ Data saved to DetectedPatterns sheet
- ✅ No errors in logs

---

**PHASE 1 DELIVERABLES:**
- ✅ PatternMappings sheet with 6 patterns
- ✅ DetectedPatterns sheet (empty)
- ✅ Config.js updated
- ✅ DataService.js extended
- ✅ CrossToolAnalytics.js created
- ✅ All tests passing

**Time Estimate:** 8-12 hours
**Blocker Risk:** Low (no external dependencies)

---

## **PHASE 2: AI Infrastructure** (Week 3)

**Goal:** Build central AI service layer with cost controls

### Tasks:

#### 2.1 Create AI Sheets
- [ ] AI_Usage sheet
- [ ] QualitativeInsights sheet
- [ ] SuggestedPatterns sheet

**Deliverable:** 3 new sheets ready

---

#### 2.2 Create AIService.js

**File:** `core/AIService.js`

**Core Methods:**
- `analyze({systemPrompt, userPrompt, cacheKey, ...})` - Universal AI call
- `callGPT({systemPrompt, userPrompt, temperature, maxTokens})` - API wrapper
- `logUsage(clientId, analysisType, usage, source)` - Track costs

**Features:**
- 3-tier fallback (GPT → Retry → Fallback)
- Aggressive caching (24hr default)
- Cost tracking per client
- Support for multiple models

**Full implementation:** See architecture document above

**Deliverable:** AIService.js file

**Testing:**
```javascript
function testAIService() {
  const testPrompt = {
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: 'Explain financial trauma in 50 words.',
    cacheKey: 'test_prompt_1',
    temperature: 0.2,
    maxTokens: 100
  };

  // First call - should hit API
  const result1 = AIService.analyze(testPrompt);
  Logger.log(`First call source: ${result1.source}`); // Should be 'gpt'
  Logger.log(`Response: ${result1.content}`);

  // Second call - should hit cache
  const result2 = AIService.analyze(testPrompt);
  Logger.log(`Second call source: ${result2.source}`); // Should be 'cache'

  // Check usage sheet
  const sheet = SpreadsheetApp.openById(Config.AI_USAGE_SHEET_ID);
  const data = sheet.getSheetByName('AI_Usage').getDataRange().getValues();
  Logger.log(`Usage rows: ${data.length - 1}`); // Should have 1 logged call
}
```

---

#### 2.3 Create AIBudgetManager.js

**File:** `core/AIBudgetManager.js`

**Core Methods:**
- `canMakeAICall(estimatedCost)` - Check budget before call
- `getMonthlySpend()` - Calculate current month's spend
- `checkBudgetAlert()` - Send email if approaching limit

**Full implementation:** See architecture document above

**Deliverable:** AIBudgetManager.js file

**Testing:**
```javascript
function testBudgetManager() {
  const currentSpend = AIBudgetManager.getMonthlySpend();
  Logger.log(`Current month spend: $${currentSpend.toFixed(4)}`);

  const canCall = AIBudgetManager.canMakeAICall(0.001);
  Logger.log(`Can make AI call: ${canCall}`);

  // Test alert (set test threshold low)
  AIBudgetManager.checkBudgetAlert();
}
```

---

#### 2.4 Integrate with Existing Tool2GPTAnalysis

**Refactor Tool2GPTAnalysis to use AIService:**

```javascript
// In tools/tool2/Tool2GPTAnalysis.js

// OLD:
callGPT({systemPrompt, userPrompt, model, temperature, maxTokens}) {
  // Direct UrlFetchApp.fetch call
}

// NEW:
callGPT({systemPrompt, userPrompt, model, temperature, maxTokens}) {
  return AIService.callGPT({systemPrompt, userPrompt, temperature, maxTokens, model});
}
```

**Benefits:**
- Unified cost tracking
- Consistent caching
- Budget controls apply to all AI calls

**Deliverable:** Tool2GPTAnalysis.js refactored

**Testing:**
```javascript
function testTool2WithAIService() {
  // Complete Tool 2 for test client
  // Verify AI calls go through AIService
  // Check AI_Usage sheet for logged calls
}
```

---

**PHASE 2 DELIVERABLES:**
- ✅ 3 AI sheets created
- ✅ AIService.js with caching and retry
- ✅ AIBudgetManager.js with cost controls
- ✅ Tool2GPTAnalysis refactored
- ✅ All tests passing

**Time Estimate:** 6-8 hours
**Blocker Risk:** Low (builds on existing GPT code)

---

## **PHASE 3: Qualitative Analysis** (Week 4)

**Goal:** AI analysis of open text fields

### Tasks:

#### 3.1 Create QualitativeAnalyzer.js

**File:** `core/QualitativeAnalyzer.js`

**Core Methods:**
- `analyzeAllQualitativeData(clientId)` - Main orchestrator
- `analyzeAdaptiveImpact(clientId, text, tool1Data)` - Tool 2 field
- `analyzeFinancialEmotions(clientId, text)` - Tool 2 field
- `analyzeWastefulSpending(clientId, text, tool1Data)` - Tool 2 field
- `analyzeTool3OpenResponses(clientId, responses)` - 6 Tool 3 fields
- `synthesizeQualitativeThemes(clientId, insights)` - Cross-tool synthesis

**Full implementation:** See architecture document above

**Deliverable:** QualitativeAnalyzer.js file

---

#### 3.2 Test on Historical Data

**Create batch analysis script:**

```javascript
function analyzeHistoricalQualitative() {
  // Get all clients who completed Tool 2 and/or Tool 3
  const sheet = SpreadsheetApp.openById(Config.RESPONSES_SHEET_ID);
  const data = sheet.getSheetByName('RESPONSES').getDataRange().getValues();
  const headers = data[0];

  const clientsToAnalyze = new Set();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const clientId = row[headers.indexOf('Client_ID')];
    const toolId = row[headers.indexOf('Tool_ID')];
    const status = row[headers.indexOf('Status')];
    const isLatest = row[headers.indexOf('Is_Latest')];

    if ((toolId === 'tool2' || toolId === 'tool3') &&
        status === 'COMPLETED' &&
        isLatest) {
      clientsToAnalyze.add(clientId);
    }
  }

  Logger.log(`Found ${clientsToAnalyze.size} clients to analyze`);

  let analyzed = 0;
  let errors = 0;

  Array.from(clientsToAnalyze).forEach((clientId, index) => {
    try {
      // Check budget
      if (!AIBudgetManager.canMakeAICall(0.10)) {
        Logger.log('⚠️ Monthly budget exceeded. Stopping.');
        return;
      }

      Logger.log(`[${index + 1}/${clientsToAnalyze.size}] Analyzing ${clientId}...`);

      const insights = QualitativeAnalyzer.analyzeAllQualitativeData(clientId);

      // Save to QualitativeInsights sheet
      saveQualitativeInsights(clientId, insights);

      analyzed++;

      // Rate limit: 1 client per 3 seconds to avoid API throttling
      if (index < clientsToAnalyze.size - 1) {
        Utilities.sleep(3000);
      }

    } catch (error) {
      Logger.log(`❌ Error analyzing ${clientId}: ${error.message}`);
      errors++;
    }
  });

  Logger.log(`\n=== BATCH ANALYSIS COMPLETE ===`);
  Logger.log(`Analyzed: ${analyzed}`);
  Logger.log(`Errors: ${errors}`);
  Logger.log(`Total cost: $${AIBudgetManager.getMonthlySpend().toFixed(2)}`);
}

function saveQualitativeInsights(clientId, insights) {
  const sheet = SpreadsheetApp.openById(Config.QUALITATIVE_INSIGHTS_SHEET_ID);
  const insightsSheet = sheet.getSheetByName('QualitativeInsights');

  const timestamp = new Date();

  // Save each analysis type as separate row
  if (insights.tool2) {
    if (insights.tool2.adaptiveImpact && !insights.tool2.adaptiveImpact.skipped) {
      insightsSheet.appendRow([
        timestamp,
        clientId,
        'tool2',
        'adaptiveImpact',
        'adaptive_impact_analysis',
        JSON.stringify(insights.tool2.adaptiveImpact),
        insights.tool2.adaptiveImpact.emotionalIntensity || null,
        JSON.stringify(insights.tool2.adaptiveImpact.crisisIndicators || []),
        insights.tool2.adaptiveImpact.source || 'gpt',
        '' // Raw text stored in responses already
      ]);
    }

    // Similar for financialEmotions and wastefulSpending
  }

  if (insights.tool3 && !insights.tool3.skipped) {
    insightsSheet.appendRow([
      timestamp,
      clientId,
      'tool3',
      'open_responses_all',
      'tool3_synthesis',
      JSON.stringify(insights.tool3),
      insights.tool3.disconnectionSeverity === 'high' ? 9 :
        insights.tool3.disconnectionSeverity === 'medium' ? 6 : 3,
      JSON.stringify(insights.tool3.shameThemes || []),
      insights.tool3.source || 'gpt',
      ''
    ]);
  }

  if (insights.synthesis) {
    insightsSheet.appendRow([
      timestamp,
      clientId,
      'cross_tool',
      'synthesis',
      'cross_tool_synthesis',
      insights.synthesis.narrative,
      null,
      null,
      insights.synthesis.source,
      ''
    ]);
  }
}
```

**Deliverable:**
- Qualitative insights for all historical clients
- QualitativeInsights sheet populated
- Cost report

---

#### 3.3 Validation Study

**Manual validation of AI insights:**

1. Select 20 random clients
2. Read their qualitative data manually
3. Compare to AI analysis
4. Calculate accuracy metrics:
   - Theme detection accuracy
   - Emotion classification accuracy
   - Crisis indicator sensitivity/specificity
   - Clinical usefulness rating (1-5)

**Document in:** `docs/AI-Validation-Study.md`

**Success Criteria:**
- ✅ Theme detection accuracy > 80%
- ✅ Emotion classification accuracy > 75%
- ✅ Crisis indicators: Sensitivity > 90%, Specificity > 70%
- ✅ Clinical usefulness rating > 4.0/5.0

---

**PHASE 3 DELIVERABLES:**
- ✅ QualitativeAnalyzer.js created
- ✅ Historical analysis complete (800+ clients)
- ✅ QualitativeInsights sheet populated
- ✅ Validation study completed
- ✅ AI prompts refined based on validation

**Time Estimate:** 10-12 hours + 24-48 hours for batch processing
**Blocker Risk:** Medium (depends on API reliability)
**Cost Estimate:** ~$40-80 for historical analysis (one-time)

---

## **PHASE 4: Unified Reporting** (Week 5)

**Goal:** Comprehensive cross-tool reports with AI narratives

### Tasks:

#### 4.1 Create SmartSynthesizer.js

**File:** `core/SmartSynthesizer.js`

**Core Methods:**
- `generateUnifiedNarrative(clientId)` - AI synthesis
- `buildNarrativePrompt(responses, patterns, qualitative)` - Prompt builder
- `getDataHash(responses)` - For caching

**Full implementation:** See architecture document above

**Deliverable:** SmartSynthesizer.js file

---

#### 4.2 Create UnifiedClientReport.js

**File:** `core/UnifiedClientReport.js`

**Core Method:**
- `generateUnifiedReport(clientId)` - Orchestrates all analytics

**Report Structure:**
```javascript
{
  clientId: string,
  generatedAt: Date,
  completedTools: string[],

  // Executive summary
  executive_summary: {
    primary_trauma_pattern: string,
    financial_archetype: string,
    overall_stress_level: string,
    key_patterns: string[],
    alignment_score: number,
    critical_flags: number
  },

  // Individual tool summaries
  tool_summaries: {
    tool1: {...},
    tool2: {...},
    tool3: {...}
  },

  // Rule-based analytics
  analytics: {
    stress_breakdown: {...},
    detected_patterns: [...],
    alignment_scores: {...},
    consistency_check: [...]
  },

  // AI-powered insights
  ai_insights: {
    qualitative_analysis: {...},
    unified_narrative: string,
    personalized_recommendations: [...]
  },

  // Actionable recommendations
  recommendations: [
    {
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      area: string,
      action: string,
      rationale: string,
      next_steps: string[]
    }
  ],

  // Timeline
  completion_timeline: [...],

  // Raw data export
  raw_data: {...}
}
```

**Full implementation:** See architecture document above

**Deliverable:** UnifiedClientReport.js file

---

#### 4.3 Create Admin Dashboard Endpoint

**Add to AdminRouter.js:**

```javascript
function doGet(e) {
  const route = e.parameter.route;

  // Existing routes...

  // NEW: Unified report endpoint
  if (route === 'unified-report') {
    const clientId = e.parameter.clientId;

    if (!clientId) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'clientId parameter required'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      const report = UnifiedClientReport.generateUnifiedReport(clientId);

      return ContentService.createTextOutput(JSON.stringify(report, null, 2))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        error: error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // NEW: List clients with completion status
  if (route === 'clients-list') {
    const clients = getClientsWithCompletionStatus();
    return ContentService.createTextOutput(JSON.stringify(clients, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getClientsWithCompletionStatus() {
  const sheet = SpreadsheetApp.openById(Config.STUDENTS_SHEET_ID);
  const data = sheet.getSheetByName('STUDENTS').getDataRange().getValues();
  const headers = data[0];

  const clients = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const clientId = row[headers.indexOf('Client_ID')];
    const name = row[headers.indexOf('Name')];

    const completed = DataService.hasCompletedTools(clientId,
      ['tool1', 'tool2', 'tool3', 'tool4', 'tool5']);

    clients.push({
      clientId,
      name,
      completed,
      toolsCompleted: Object.values(completed).filter(Boolean).length
    });
  }

  return clients;
}
```

**Access URLs:**
- `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?route=unified-report&clientId=0391ES`
- `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?route=clients-list`

**Deliverable:** Admin API endpoints

---

#### 4.4 Create Simple HTML Admin Dashboard

**File:** `admin/UnifiedReportViewer.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Unified Client Reports</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    .header { margin-bottom: 30px; }
    .client-select { margin-bottom: 20px; }
    select { padding: 8px; font-size: 14px; }
    button { padding: 8px 16px; background: #4285f4; color: white; border: none; cursor: pointer; }
    button:hover { background: #3367d6; }
    .report-container { margin-top: 20px; }
    .section { background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
    .section h3 { margin-top: 0; color: #333; }
    .pattern { background: white; padding: 10px; margin: 10px 0; border-left: 4px solid #ff6b6b; }
    .pattern.high { border-color: #ff6b6b; }
    .pattern.medium { border-color: #ffa726; }
    .pattern.low { border-color: #66bb6a; }
    .narrative { background: white; padding: 20px; line-height: 1.6; white-space: pre-wrap; }
    .loading { color: #666; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Unified Client Reports</h1>
    <p>Comprehensive cross-tool analytics with AI insights</p>
  </div>

  <div class="client-select">
    <label>Select Client: </label>
    <select id="clientSelect">
      <option value="">-- Loading clients --</option>
    </select>
    <button onclick="loadReport()">Generate Report</button>
  </div>

  <div id="reportContainer" class="report-container"></div>

  <script>
    const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';

    // Load clients on page load
    window.addEventListener('load', loadClients);

    async function loadClients() {
      try {
        const response = await fetch(`${WEB_APP_URL}?route=clients-list`);
        const clients = await response.json();

        const select = document.getElementById('clientSelect');
        select.innerHTML = '<option value="">-- Select a client --</option>';

        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client.clientId;
          option.textContent = `${client.name} (${client.toolsCompleted}/5 tools)`;
          select.appendChild(option);
        });
      } catch (error) {
        console.error('Error loading clients:', error);
        alert('Failed to load clients');
      }
    }

    async function loadReport() {
      const clientId = document.getElementById('clientSelect').value;
      if (!clientId) {
        alert('Please select a client');
        return;
      }

      const container = document.getElementById('reportContainer');
      container.innerHTML = '<p class="loading">Generating report... This may take 10-15 seconds.</p>';

      try {
        const response = await fetch(`${WEB_APP_URL}?route=unified-report&clientId=${clientId}`);
        const report = await response.json();

        if (report.error) {
          container.innerHTML = `<p style="color: red;">Error: ${report.error}</p>`;
          return;
        }

        displayReport(report);

      } catch (error) {
        console.error('Error loading report:', error);
        container.innerHTML = `<p style="color: red;">Failed to load report: ${error.message}</p>`;
      }
    }

    function displayReport(report) {
      const container = document.getElementById('reportContainer');

      let html = `
        <div class="section">
          <h3>Executive Summary</h3>
          <p><strong>Primary Trauma Pattern:</strong> ${report.executive_summary.primary_trauma_pattern}</p>
          <p><strong>Financial Archetype:</strong> ${report.executive_summary.financial_archetype}</p>
          <p><strong>Overall Stress Level:</strong> ${report.executive_summary.overall_stress_level}</p>
          <p><strong>Key Patterns:</strong> ${report.executive_summary.key_patterns.join(', ') || 'None detected'}</p>
          <p><strong>Alignment Score:</strong> ${report.executive_summary.alignment_score}%</p>
        </div>
      `;

      // Detected patterns
      if (report.analytics.detected_patterns && report.analytics.detected_patterns.length > 0) {
        html += '<div class="section"><h3>Detected Patterns</h3>';
        report.analytics.detected_patterns.forEach(pattern => {
          html += `
            <div class="pattern ${pattern.severity.toLowerCase()}">
              <strong>${pattern.patternName}</strong> (${pattern.severity})
              <br><small>Intervention: ${pattern.intervention}</small>
            </div>
          `;
        });
        html += '</div>';
      }

      // AI narrative
      if (report.ai_insights && report.ai_insights.unified_narrative) {
        html += `
          <div class="section">
            <h3>Clinical Narrative (AI-Generated)</h3>
            <div class="narrative">${report.ai_insights.unified_narrative}</div>
          </div>
        `;
      }

      // Recommendations
      if (report.recommendations && report.recommendations.length > 0) {
        html += '<div class="section"><h3>Recommendations</h3>';
        report.recommendations.forEach(rec => {
          html += `
            <div class="pattern ${rec.priority.toLowerCase()}">
              <strong>[${rec.priority}] ${rec.area}</strong>
              <p>${rec.action}</p>
              <p><small><em>Rationale:</em> ${rec.rationale}</small></p>
              ${rec.next_steps ? `<ul>${rec.next_steps.map(step => `<li>${step}</li>`).join('')}</ul>` : ''}
            </div>
          `;
        });
        html += '</div>';
      }

      container.innerHTML = html;
    }
  </script>
</body>
</html>
```

**Deploy:**
1. Create HTML file in Apps Script
2. Add `doGet()` handler to serve it
3. Deploy as web app

**Deliverable:** Working admin dashboard

---

#### 4.5 Test Complete Flow

**End-to-end test:**

```javascript
function testCompleteUnifiedReport() {
  const testClientId = '0391ES';

  Logger.log('=== UNIFIED REPORT GENERATION TEST ===\n');

  // Step 1: Rule-based pattern detection
  Logger.log('Step 1: Detecting patterns...');
  const patterns = CrossToolAnalytics.detectPatterns(testClientId);
  Logger.log(`✓ Detected ${patterns.length} patterns\n`);

  // Step 2: Qualitative analysis
  Logger.log('Step 2: Analyzing qualitative data...');
  const qualitative = QualitativeAnalyzer.analyzeAllQualitativeData(testClientId);
  Logger.log(`✓ Qualitative analysis complete\n`);

  // Step 3: AI narrative synthesis
  Logger.log('Step 3: Generating AI narrative...');
  const narrative = SmartSynthesizer.generateUnifiedNarrative(testClientId);
  Logger.log(`✓ Narrative generated (${narrative.narrative.length} chars)\n`);

  // Step 4: Complete unified report
  Logger.log('Step 4: Building unified report...');
  const report = UnifiedClientReport.generateUnifiedReport(testClientId);
  Logger.log(`✓ Report generated\n`);

  // Verify report structure
  Logger.log('=== REPORT STRUCTURE ===');
  Logger.log(`Executive Summary: ${JSON.stringify(report.executive_summary, null, 2)}`);
  Logger.log(`\nPatterns: ${report.analytics.detected_patterns.length}`);
  Logger.log(`\nNarrative length: ${report.ai_insights.unified_narrative.length} chars`);
  Logger.log(`\nRecommendations: ${report.recommendations.length}`);

  // Check costs
  const monthlyCost = AIBudgetManager.getMonthlySpend();
  Logger.log(`\n=== COST ===`);
  Logger.log(`Monthly spend: $${monthlyCost.toFixed(4)}`);

  Logger.log('\n=== TEST COMPLETE ===');
}
```

---

**PHASE 4 DELIVERABLES:**
- ✅ SmartSynthesizer.js created
- ✅ UnifiedClientReport.js created
- ✅ Admin API endpoints working
- ✅ Admin dashboard deployed
- ✅ End-to-end test passing

**Time Estimate:** 8-10 hours
**Blocker Risk:** Low
**Cost per Report:** ~$0.08-0.12

---

## **PHASE 5: Tools 4-8 Integration** (Weeks 6-8)

**Goal:** Extend patterns as new tools come online

### 5.1 Tool 4 Integration (Financial Freedom Framework)

**When Tool 4 is complete:**

1. **Add Tool 4 manifest with output schema:**

```json
{
  "id": "tool4",
  "name": "Financial Freedom Framework",
  "version": "1.0.0",
  "pattern": "calculator",
  "dependencies": ["tool2"],
  "unlocks": ["tool5"],
  "outputSchema": {
    "scores": {
      "weeklyBudget": {"type": "number", "description": "Calculated weekly budget"},
      "monthlyBudget": {"type": "number", "description": "Calculated monthly budget"},
      "freedomNumber": {"type": "number", "description": "Financial freedom target"},
      "actualVsBudget": {"type": "number", "description": "% gap between actual and budget"},
      "categoryBreakdown": {"type": "object", "description": "Spending by category"}
    }
  }
}
```

2. **Add patterns to PatternMappings sheet:**

```
Pattern_ID: budget_gap_007
Pattern_Name: Budget Reality Gap
Required_Tools: ["tool2", "tool4"]
Detection_Rules: [
  {"tool": "tool2", "path": "formData.spendingClarity", "op": "<", "value": 0},
  {"tool": "tool4", "path": "scores.actualVsBudget", "op": ">", "value": 20}
]
Evidence_Fields: [
  {"tool": "tool2", "path": "formData.spendingClarity", "label": "Spending Clarity"},
  {"tool": "tool4", "path": "scores.actualVsBudget", "label": "Budget Gap %"}
]
Severity: HIGH
Intervention: high
Active: TRUE

---

Pattern_ID: freedom_scarcity_008
Pattern_Name: Freedom Number vs Scarcity Mindset Gap
Required_Tools: ["tool1", "tool4"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.FSV", "op": ">", "value": 12},
  {"tool": "tool4", "path": "scores.freedomNumber", "op": ">", "value": 100000}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.FSV", "label": "FSV Score"},
  {"tool": "tool4", "path": "scores.freedomNumber", "label": "Freedom Number"}
]
Severity: MEDIUM
Intervention: medium
Active: TRUE
```

3. **Test pattern detection:**

```javascript
function testTool4Patterns() {
  // Find clients who completed Tool 1, 2, and 4
  const clients = getClientsWithTools(['tool1', 'tool2', 'tool4']);

  clients.forEach(clientId => {
    const patterns = CrossToolAnalytics.detectPatterns(clientId);
    const tool4Patterns = patterns.filter(p =>
      p.patternId.includes('budget_gap') || p.patternId.includes('freedom_scarcity'));

    Logger.log(`${clientId}: ${tool4Patterns.length} Tool 4-related patterns`);
  });
}
```

**NO CODE CHANGES REQUIRED** - Everything is configuration-driven!

---

### 5.2 Tool 5 Integration (Love & Connection Grounding)

**When Tool 5 is complete:**

1. **Add Tool 5 manifest:**

```json
{
  "id": "tool5",
  "name": "Love & Connection Grounding Tool",
  "version": "1.0.0",
  "pattern": "multi-phase",
  "dependencies": ["tool4"],
  "unlocks": ["tool6"],
  "outputSchema": {
    "scoring": {
      "subdomainQuotients": {"type": "object"},
      "domainQuotients": {"type": "object"},
      "overallQuotient": {"type": "number"}
    }
  }
}
```

2. **Add patterns:**

```
Pattern_ID: financial_intimacy_009
Pattern_Name: Financial Intimacy Avoidance
Required_Tools: ["tool2", "tool5"]
Detection_Rules: [
  {"tool": "tool2", "path": "formData.primaryObstacle", "op": "===", "value": "partner-resistance"},
  {"tool": "tool5", "path": "scoring.domainQuotients.connection", "op": ">", "value": 1.5}
]
Evidence_Fields: [
  {"tool": "tool2", "path": "formData.primaryObstacle", "label": "Primary Obstacle"},
  {"tool": "tool5", "path": "scoring.domainQuotients.connection", "label": "Connection Domain Score"}
]
Severity: HIGH
Intervention: high
Active: TRUE

---

Pattern_ID: isolation_cascade_010
Pattern_Name: Multi-Domain Isolation Pattern
Required_Tools: ["tool1", "tool2", "tool3", "tool5"]
Detection_Rules: [
  {"tool": "tool1", "path": "scores.Receiving", "op": ">", "value": 10},
  {"tool": "tool2", "path": "formData.adaptiveImpact", "op": "regex", "value": "isolat|alone"},
  {"tool": "tool3", "path": "scoring.domainQuotients.domain2", "op": ">", "value": 1},
  {"tool": "tool5", "path": "scoring.overallQuotient", "op": ">", "value": 1.5}
]
Evidence_Fields: [
  {"tool": "tool1", "path": "scores.Receiving", "label": "Receiving Score"},
  {"tool": "tool2", "path": "formData.adaptiveImpact", "label": "Adaptive Impact"},
  {"tool": "tool3", "path": "scoring.domainQuotients.domain2", "label": "Tool 3 Domain 2"},
  {"tool": "tool5", "path": "scoring.overallQuotient", "label": "Tool 5 Overall"}
]
Severity: CRITICAL
Intervention: immediate
Active: TRUE
```

3. **Add qualitative analysis for Tool 5:**

```javascript
// In QualitativeAnalyzer.js - ADD METHOD

analyzeTool5OpenResponses(clientId, tool5Responses) {
  // Similar to Tool 3 analysis
  // Extract from Tool 5 open response fields
  // Look for connection themes, intimacy avoidance, etc.
}
```

---

### 5.3 Tools 6, 7, 8 Integration

**Process for each tool:**

1. Create manifest with output schema
2. Add 2-5 new patterns to PatternMappings
3. Add qualitative analysis if tool has open text fields
4. Test pattern detection
5. Document in `docs/Tool-N-Integration.md`

**Estimated time per tool:** 2-4 hours

---

**PHASE 5 DELIVERABLES:**
- ✅ Tool 4 patterns added and tested
- ✅ Tool 5 patterns added and tested
- ✅ Tools 6, 7, 8 ready for quick integration
- ✅ Pattern library grown to 15-20 patterns

**Time Estimate:** 10-15 hours (spread across tool completion)
**Blocker Risk:** Low (repeatable process)

---

## **PHASE 6: Continuous Learning** (Month 3+)

**Goal:** Automated pattern discovery from accumulated data

### 6.1 Create CorrelationEngine.js

**File:** `core/CorrelationEngine.js`

**Core Methods:**
- `analyzeCorrelations()` - Calculate Pearson correlations
- `extractNumericFields(allClients)` - Get all numeric fields
- `calculateCorrelation(values1, values2)` - Math
- `isStatisticallySignificant(r, n)` - P-value test
- `suggestPatternMappings(correlations)` - Convert to pattern suggestions

**Implementation:**

```javascript
const CorrelationEngine = {

  /**
   * Find statistically significant correlations across all numeric fields
   */
  analyzeCorrelations() {
    Logger.log('Starting correlation analysis...');

    // Get all client data
    const allClients = this.getAllClientData();
    Logger.log(`Analyzing ${allClients.length} clients`);

    // Extract all numeric fields from all tools
    const numericFields = this.extractNumericFields(allClients);
    Logger.log(`Found ${numericFields.length} numeric fields`);

    const correlations = [];
    let comparisons = 0;

    // Calculate correlation for each pair
    for (let i = 0; i < numericFields.length; i++) {
      for (let j = i + 1; j < numericFields.length; j++) {
        const field1 = numericFields[i];
        const field2 = numericFields[j];

        // Skip fields from same tool (we want cross-tool correlations)
        if (field1.tool === field2.tool) continue;

        // Get values for both fields across all clients
        const values1 = allClients.map(c => field1.getValue(c)).filter(v => v !== null);
        const values2 = allClients.map(c => field2.getValue(c)).filter(v => v !== null);

        // Need at least 30 data points
        if (values1.length < 30 || values2.length < 30) continue;

        const r = this.calculateCorrelation(values1, values2);
        comparisons++;

        // Only save significant correlations (|r| > 0.4)
        if (Math.abs(r) > 0.4) {
          const pValue = this.calculatePValue(r, values1.length);

          if (pValue < 0.05) { // Statistically significant
            correlations.push({
              field1: {tool: field1.tool, path: field1.path, label: field1.label},
              field2: {tool: field2.tool, path: field2.path, label: field2.label},
              correlation: r,
              sampleSize: values1.length,
              pValue: pValue,
              strength: Math.abs(r) > 0.7 ? 'strong' :
                        Math.abs(r) > 0.5 ? 'moderate' : 'weak'
            });
          }
        }
      }
    }

    Logger.log(`Completed ${comparisons} comparisons`);
    Logger.log(`Found ${correlations.length} significant correlations`);

    // Save to SuggestedPatterns sheet
    this.saveSuggestedCorrelations(correlations);

    return correlations;
  },

  /**
   * Get all client data across all tools
   */
  getAllClientData() {
    const sheet = SpreadsheetApp.openById(Config.RESPONSES_SHEET_ID);
    const data = sheet.getSheetByName('RESPONSES').getDataRange().getValues();
    const headers = data[0];

    const clientData = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const clientId = row[headers.indexOf('Client_ID')];
      const toolId = row[headers.indexOf('Tool_ID')];
      const status = row[headers.indexOf('Status')];
      const isLatest = row[headers.indexOf('Is_Latest')];

      if (status === 'COMPLETED' && isLatest) {
        if (!clientData[clientId]) {
          clientData[clientId] = {clientId};
        }

        const dataJson = row[headers.indexOf('Data')];
        clientData[clientId][toolId] = JSON.parse(dataJson);
      }
    }

    return Object.values(clientData);
  },

  /**
   * Extract all numeric fields from client data
   */
  extractNumericFields(allClients) {
    const fields = [];

    // Get sample client
    const sample = allClients[0];

    // Recursively find numeric fields
    Object.keys(sample).forEach(toolId => {
      if (toolId === 'clientId') return;

      const toolData = sample[toolId];
      this.findNumericPaths(toolData, [], toolId, fields);
    });

    // Add getValue function to each field
    fields.forEach(field => {
      field.getValue = (client) => {
        if (!client[field.tool]) return null;
        return this.getNestedValue(client[field.tool], field.path);
      };
    });

    return fields;
  },

  /**
   * Recursively find numeric fields in object
   */
  findNumericPaths(obj, pathSoFar, tool, fields) {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'number') {
      fields.push({
        tool: tool,
        path: pathSoFar.join('.'),
        label: pathSoFar[pathSoFar.length - 1]
      });
    } else if (typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        this.findNumericPaths(obj[key], [...pathSoFar, key], tool, fields);
      });
    }
  },

  /**
   * Calculate Pearson correlation coefficient
   */
  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;

    return numerator / denominator;
  },

  /**
   * Calculate p-value for correlation
   */
  calculatePValue(r, n) {
    // T-test for correlation significance
    const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
    const df = n - 2;

    // Simplified p-value estimation
    // For production, use proper t-distribution
    if (Math.abs(t) > 2.576) return 0.01;  // 99% confidence
    if (Math.abs(t) > 1.96) return 0.05;   // 95% confidence
    return 0.10;
  },

  /**
   * Save correlations to SuggestedPatterns sheet
   */
  saveSuggestedCorrelations(correlations) {
    const sheet = SpreadsheetApp.openById(Config.SUGGESTED_PATTERNS_SHEET_ID);
    const suggestedSheet = sheet.getSheetByName('SuggestedPatterns');

    correlations.forEach(corr => {
      suggestedSheet.appendRow([
        new Date(),
        `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        `${corr.field1.label} ↔ ${corr.field2.label}`,
        JSON.stringify(corr),
        JSON.stringify([
          {tool: corr.field1.tool, path: corr.field1.path, op: '>', value: 'PERCENTILE_75'},
          {tool: corr.field2.tool, path: corr.field2.path, op: corr.correlation > 0 ? '>' : '<', value: 'PERCENTILE_75'}
        ]),
        null, // AI interpretation - will be filled by PatternDiscoveryAI
        corr.strength === 'strong' ? 0.9 : corr.strength === 'moderate' ? 0.7 : 0.5,
        'pending_review',
        null, // Reviewed by
        null, // Reviewed date
        `Correlation: ${corr.correlation.toFixed(3)}, p=${corr.pValue}, n=${corr.sampleSize}`
      ]);
    });
  },

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) =>
      current && current[key] !== undefined ? current[key] : null, obj);
  }
};
```

**Deliverable:** CorrelationEngine.js file

---

### 6.2 Create PatternDiscoveryAI.js

**File:** `core/PatternDiscoveryAI.js`

(Full implementation in architecture document above)

**Core Methods:**
- `interpretCorrelation(correlation)` - AI interprets single correlation
- `interpretAllCorrelations(correlations)` - Batch process with rate limiting

**Deliverable:** PatternDiscoveryAI.js file

---

### 6.3 Create Monthly Analysis Trigger

**Script:**

```javascript
function runMonthlyPatternDiscovery() {
  Logger.log('=== MONTHLY PATTERN DISCOVERY ===\n');

  // Step 1: Find correlations
  Logger.log('Step 1: Finding correlations...');
  const correlations = CorrelationEngine.analyzeCorrelations();
  Logger.log(`Found ${correlations.length} significant correlations\n`);

  if (correlations.length === 0) {
    Logger.log('No new correlations found. Exiting.');
    return;
  }

  // Step 2: AI interpretation
  Logger.log('Step 2: AI interpretation...');
  const interpretations = PatternDiscoveryAI.interpretAllCorrelations(correlations);
  Logger.log(`Generated ${interpretations.length} interpretations\n`);

  // Step 3: Update SuggestedPatterns sheet with AI interpretations
  Logger.log('Step 3: Updating SuggestedPatterns sheet...');
  updateSuggestedPatternsWithAI(interpretations);

  // Step 4: Send email to admin
  Logger.log('Step 4: Notifying admin...');
  const meaningfulPatterns = interpretations.filter(i =>
    i.aiInterpretation.isClinicallyMeaningful &&
    i.aiInterpretation.confidence > 0.6
  );

  MailApp.sendEmail({
    to: Config.ADMIN_EMAIL,
    subject: `📊 Monthly Pattern Discovery - ${meaningfulPatterns.length} New Patterns Found`,
    body: `
Monthly pattern analysis complete.

SUMMARY:
- Total correlations analyzed: ${correlations.length}
- AI interpretations generated: ${interpretations.length}
- Clinically meaningful patterns: ${meaningfulPatterns.length}
- Review needed: ${meaningfulPatterns.filter(i => i.aiInterpretation.severity === 'HIGH').length} high priority

TOP 3 PATTERNS:
${meaningfulPatterns.slice(0, 3).map((p, i) => `
${i + 1}. ${p.aiInterpretation.suggestedPatternName}
   Correlation: ${p.correlation.toFixed(3)} (${p.strength})
   Clinical meaning: ${p.aiInterpretation.psychologicalMechanism}
   Confidence: ${(p.aiInterpretation.confidence * 100).toFixed(0)}%
`).join('\n')}

Review all patterns at: ${Config.WEB_APP_URL}/admin/patterns/review

Total AI cost this month: $${AIBudgetManager.getMonthlySpend().toFixed(2)}
    `.trim()
  });

  Logger.log('\n=== PATTERN DISCOVERY COMPLETE ===');
  Logger.log(`Review: ${Config.WEB_APP_URL}/admin/patterns/review`);
}

function updateSuggestedPatternsWithAI(interpretations) {
  const sheet = SpreadsheetApp.openById(Config.SUGGESTED_PATTERNS_SHEET_ID);
  const suggestedSheet = sheet.getSheetByName('SuggestedPatterns');
  const data = suggestedSheet.getDataRange().getValues();
  const headers = data[0];

  interpretations.forEach(interp => {
    // Find matching row by correlation data
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const corrData = JSON.parse(row[headers.indexOf('Correlation_Data')]);

      if (corrData.field1.path === interp.field1.path &&
          corrData.field2.path === interp.field2.path) {
        // Update AI interpretation column
        const aiCol = headers.indexOf('AI_Interpretation') + 1;
        const confCol = headers.indexOf('Confidence') + 1;
        const nameCol = headers.indexOf('Suggested_Name') + 1;

        suggestedSheet.getRange(i + 1, aiCol).setValue(JSON.stringify(interp.aiInterpretation));
        suggestedSheet.getRange(i + 1, confCol).setValue(interp.aiInterpretation.confidence);
        suggestedSheet.getRange(i + 1, nameCol).setValue(interp.aiInterpretation.suggestedPatternName);
        break;
      }
    }
  });
}
```

**Set up trigger:**
1. Apps Script Editor → Triggers
2. Add Trigger: `runMonthlyPatternDiscovery`
3. Time-driven → Month timer → First of month → 2-3am

**Deliverable:** Monthly analysis automation

---

### 6.4 Create Pattern Review UI

**Simple HTML page:**

```html
<!-- admin/PatternReview.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Pattern Review Dashboard</title>
  <style>
    /* Similar styling to UnifiedReportViewer.html */
    .pattern-card {
      background: white;
      border: 1px solid #ddd;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
    }
    .approve-btn { background: #4caf50; }
    .reject-btn { background: #f44336; }
    button { padding: 10px 20px; margin: 5px; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Suggested Patterns Review</h1>
  <div id="patternsContainer"></div>

  <script>
    // Load suggested patterns
    // Display with approve/reject buttons
    // On approve: Add to PatternMappings sheet, mark as approved
    // On reject: Mark as rejected with note
  </script>
</body>
</html>
```

---

**PHASE 6 DELIVERABLES:**
- ✅ CorrelationEngine.js created
- ✅ PatternDiscoveryAI.js created
- ✅ Monthly analysis automation set up
- ✅ Pattern review UI deployed
- ✅ First monthly analysis run successfully

**Time Estimate:** 12-15 hours
**Blocker Risk:** Medium (requires sufficient data)
**Cost:** ~$5-10/month for AI interpretation

---

## 📊 Testing Strategy

### Unit Tests

```javascript
// tests/TestSuite.js

function runAllTests() {
  Logger.log('=== RUNNING ALL TESTS ===\n');

  const tests = [
    testDataServiceExtensions,
    testPatternDetection,
    testAIService,
    testQualitativeAnalyzer,
    testUnifiedReport,
    testCorrelationEngine
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      Logger.log(`Running ${test.name}...`);
      test();
      Logger.log(`✅ ${test.name} PASSED\n`);
      passed++;
    } catch (error) {
      Logger.log(`❌ ${test.name} FAILED: ${error.message}\n`);
      failed++;
    }
  });

  Logger.log(`\n=== TEST RESULTS ===`);
  Logger.log(`Passed: ${passed}/${tests.length}`);
  Logger.log(`Failed: ${failed}/${tests.length}`);

  if (failed > 0) {
    throw new Error(`${failed} test(s) failed`);
  }
}
```

### Integration Tests

Test with real client data:
- 3 clients with different trauma patterns
- Verify patterns detected correctly
- Verify AI insights generated
- Verify unified report structure

### Performance Tests

```javascript
function testPerformance() {
  const startTime = Date.now();

  // Generate unified report for 10 clients
  const testClients = ['0391ES', '2382GS', '2798AM', ...];

  testClients.forEach(clientId => {
    const report = UnifiedClientReport.generateUnifiedReport(clientId);
  });

  const endTime = Date.now();
  const avgTime = (endTime - startTime) / testClients.length;

  Logger.log(`Average report generation time: ${avgTime}ms`);
  Logger.log(`Total cost: $${AIBudgetManager.getMonthlySpend().toFixed(4)}`);

  // Assertions
  if (avgTime > 15000) {
    throw new Error('Report generation too slow');
  }
}
```

---

## 💰 Cost Projections

### Initial Setup Costs (One-Time)
- Historical qualitative analysis (800 clients): **$40-80**
- Testing and validation: **$10-20**
- **Total setup: ~$50-100**

### Ongoing Monthly Costs (per 100 new clients)
| Item | Cost per Client | Monthly (100 clients) |
|------|----------------|----------------------|
| Qualitative analysis (3 calls) | $0.05 | $5.00 |
| Unified narrative (1 call) | $0.03 | $3.00 |
| Pattern discovery AI (monthly batch) | - | $5.00 |
| Miscellaneous/retries | $0.02 | $2.00 |
| **Total** | **~$0.10** | **~$15.00** |

### Annual Cost Projection
- 1,200 new clients/year: **$120/year**
- Monthly pattern discovery: **$60/year**
- **Total: ~$180/year**

**Note:** Costs decrease over time due to caching effectiveness.

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ Pattern detection accuracy > 85%
- ✅ Report generation time < 15 seconds
- ✅ AI cache hit rate > 60%
- ✅ Monthly AI costs < $20
- ✅ Zero downtime from AI failures (fallbacks work)

### Clinical Metrics
- ✅ Clinician usefulness rating > 4.0/5.0
- ✅ Pattern suggestions approval rate > 40%
- ✅ Crisis detection sensitivity > 90%
- ✅ Intervention recommendation relevance > 80%

### Business Metrics
- ✅ Time saved per client review: 15-20 minutes
- ✅ Insights generated not previously detected: 30%+
- ✅ Pattern library growth: 3-5 new patterns/month
- ✅ Client engagement with personalized insights: +25%

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Create PatternMappings sheet
- [ ] Create DetectedPatterns sheet
- [ ] Update Config.js
- [ ] Extend DataService.js (5 methods)
- [ ] Create CrossToolAnalytics.js
- [ ] Test with 3 real clients
- [ ] Verify patterns detected correctly

### Phase 2: AI Infrastructure (Week 3)
- [ ] Create AI_Usage sheet
- [ ] Create QualitativeInsights sheet
- [ ] Create SuggestedPatterns sheet
- [ ] Create AIService.js
- [ ] Create AIBudgetManager.js
- [ ] Refactor Tool2GPTAnalysis
- [ ] Test AI calls and caching

### Phase 3: Qualitative Analysis (Week 4)
- [ ] Create QualitativeAnalyzer.js
- [ ] Test on sample clients
- [ ] Run historical batch analysis
- [ ] Validation study (20 clients)
- [ ] Refine prompts based on validation
- [ ] Document AI accuracy metrics

### Phase 4: Unified Reporting (Week 5)
- [ ] Create SmartSynthesizer.js
- [ ] Create UnifiedClientReport.js
- [ ] Add admin API endpoints
- [ ] Create admin dashboard HTML
- [ ] Deploy dashboard
- [ ] Test end-to-end flow
- [ ] Document report structure

### Phase 5: Tools 4-8 Integration (Weeks 6-8)
- [ ] Add Tool 4 manifest
- [ ] Add Tool 4 patterns (2-3)
- [ ] Test Tool 4 integration
- [ ] Add Tool 5 manifest
- [ ] Add Tool 5 patterns (2-3)
- [ ] Add Tool 5 qualitative analysis
- [ ] Test Tool 5 integration
- [ ] Document integration process

### Phase 6: Continuous Learning (Month 3+)
- [ ] Create CorrelationEngine.js
- [ ] Create PatternDiscoveryAI.js
- [ ] Test correlation analysis
- [ ] Set up monthly trigger
- [ ] Create pattern review UI
- [ ] Run first monthly analysis
- [ ] Review and approve first patterns

---

## 🚨 Risk Management

### Technical Risks

**Risk: OpenAI API rate limits**
- Mitigation: 2-second delays between calls, retry logic, fallbacks
- Impact: Low (fallbacks ensure continuity)

**Risk: AI costs exceed budget**
- Mitigation: Budget manager blocks calls, monthly alerts
- Impact: Low (costs capped at $100/month)

**Risk: Cache invalidation issues**
- Mitigation: 24-hour TTL, hash-based cache keys
- Impact: Low (just higher costs, not broken functionality)

### Data Risks

**Risk: PII exposure to AI APIs**
- Mitigation: Strip names before AI calls, use Client_ID only
- Impact: Medium
- Plan: Add PII scrubbing layer, client opt-out option

**Risk: AI generates inappropriate recommendations**
- Mitigation: Fallbacks are clinically reviewed, AI marked as source
- Impact: Medium
- Plan: Human review workflow, disclaimers in reports

### Operational Risks

**Risk: Pattern mappings become too complex to manage**
- Mitigation: Version control, clear documentation, review process
- Impact: Low
- Plan: Quarterly pattern audit, deactivate unused patterns

**Risk: Insufficient data for correlation analysis**
- Mitigation: Require minimum 30 samples, wait until data available
- Impact: Low
- Plan: Start monthly analysis when 100+ clients complete all tools

---

## 📚 Documentation

### Developer Documentation
- [ ] `docs/API-Reference.md` - All new methods documented
- [ ] `docs/PatternMappings-Guide.md` - How to add patterns
- [ ] `docs/AI-Integration-Guide.md` - AI architecture and costs
- [ ] `docs/Testing-Guide.md` - How to run tests

### User Documentation
- [ ] `docs/Admin-Dashboard-Guide.md` - How to use dashboard
- [ ] `docs/Pattern-Review-Guide.md` - How to review suggestions
- [ ] `docs/Report-Interpretation-Guide.md` - Understanding reports

### Clinical Documentation
- [ ] `docs/Pattern-Library.md` - All patterns with clinical meanings
- [ ] `docs/Intervention-Recommendations.md` - Intervention framework
- [ ] `docs/AI-Validation-Study.md` - AI accuracy metrics

---

## 🎓 Training Plan

### For Developers
- Code walkthrough session (2 hours)
- How to add new tools (1 hour)
- How to add new patterns (30 min)
- Troubleshooting guide (30 min)

### For Clinicians/Admins
- Dashboard usage training (1 hour)
- Pattern review workflow (1 hour)
- Report interpretation training (1 hour)
- Understanding AI vs rule-based insights (30 min)

---

## 🔄 Maintenance Plan

### Weekly Tasks
- [ ] Check AI budget status
- [ ] Review error logs
- [ ] Verify cache performance

### Monthly Tasks
- [ ] Review pattern discovery suggestions
- [ ] Approve/reject new patterns
- [ ] Analyze AI accuracy metrics
- [ ] Update documentation if needed

### Quarterly Tasks
- [ ] Pattern library audit (deactivate unused)
- [ ] AI prompt refinement based on feedback
- [ ] Performance optimization review
- [ ] Cost analysis and budget adjustment

### Annual Tasks
- [ ] Full validation study
- [ ] Pattern effectiveness analysis
- [ ] AI provider evaluation (OpenAI vs alternatives)
- [ ] Architecture review and optimization

---

## 📞 Support & Contact

**Technical Issues:**
- Check logs first: Apps Script → Executions
- Review error patterns in AI_Usage sheet
- Test with sample client: `testPhase1Integration()`

**Pattern Questions:**
- Reference: `docs/middleware-mapping.md`
- Examples: See real student data section
- Clinical consultation: [Consult with trauma-informed advisor]

**AI Cost Concerns:**
- Current spend: Run `AIBudgetManager.getMonthlySpend()`
- Breakdown: Check AI_Usage sheet
- Adjust budget: Update `Config.AI_MONTHLY_BUDGET`

---

## 🎉 Next Steps

**Immediate (This Week):**
1. Review this plan with team
2. Set up development branch in Git
3. Create Google Sheets (PatternMappings, etc.)
4. Begin Phase 1 implementation

**Short Term (This Month):**
1. Complete Phases 1-2 (Foundation + AI Infrastructure)
2. Test with real data
3. Get clinician feedback on first insights

**Medium Term (Next 3 Months):**
1. Complete Phases 3-4 (Qualitative + Reporting)
2. Integrate Tools 4-5 as they complete
3. Accumulate data for correlation analysis

**Long Term (6-12 Months):**
1. Launch continuous learning system
2. Build 20+ pattern library
3. Measure intervention effectiveness
4. Consider ML/predictive analytics

---

## ✅ Approval & Sign-Off

**Reviewed By:**
- [ ] Technical Lead
- [ ] Clinical Director
- [ ] Product Owner

**Approved By:**
- [ ] Larry (Project Owner)

**Start Date:** __________
**Target Completion:** __________

---

**Document Version:** 1.0
**Last Updated:** 2025-11-28
**Author:** Claude (AI Assistant)
**Next Review:** After Phase 1 completion
