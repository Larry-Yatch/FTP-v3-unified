# Tool 4: Financial Freedom Framework - Detailed Specification

**Version:** 1.0
**Date:** November 17, 2025
**Status:** Planning Phase
**Author:** Claude Code

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [AllocationFunction Analysis & Optimization](#3-allocationfunction-analysis--optimization)
4. [Data Storage Strategy](#4-data-storage-strategy)
5. [GPT Integration Strategy](#5-gpt-integration-strategy)
6. [Scenario Management & Selection](#6-scenario-management--selection)
7. [User Interface Design](#7-user-interface-design)
8. [Integration with FTP-v3 Framework](#8-integration-with-ftp-v3-framework)
9. [PDF Report Generation](#9-pdf-report-generation)
10. [Testing Strategy](#10-testing-strategy)
11. [Open Questions & Design Decisions](#11-open-questions--design-decisions)

---

## 1. Executive Summary

### 1.1 Purpose
Tool 4 (Financial Freedom Framework) is an **interactive budget allocation calculator** that helps students discover their optimal allocation across 4 financial buckets based on:
- Financial situation (income, debt, emergency fund, stability)
- Behavioral patterns (discipline, impulse control, emotional spending)
- Motivational drivers (goals, priorities, timeline, values)
- **Trauma insights from Tools 1, 2, and 3** (NEW)

### 1.2 Key Differentiators from Tools 1-3

| Aspect | Tools 1-3 | Tool 4 |
|--------|-----------|--------|
| **Type** | Multi-page assessment questionnaires | Single-page interactive calculator |
| **Interaction** | Sequential form submission | Real-time dial adjustments |
| **Processing** | Server-side + GPT analysis | Client-side JS + GPT enhancement |
| **Output** | Single final report | Multiple saved scenarios + comparison |
| **Data Model** | One response per tool | Multiple scenarios per student |
| **Navigation** | document.write() page-to-page | SPA (no page refresh) |

### 1.3 The 4 Buckets

1. **Multiply (M)** - Investments, wealth building, long-term growth
2. **Essentials (E)** - Housing, utilities, food, transportation, insurance
3. **Freedom (F)** - Debt payoff, emergency fund, financial stability
4. **Enjoyment (J)** - Entertainment, hobbies, lifestyle, experiences

### 1.4 Success Criteria
- ✅ Students can create and compare multiple financial scenarios
- ✅ Allocations adapt to trauma patterns from Tools 1-3
- ✅ GPT provides personalized guidance based on full student profile
- ✅ Clear visual feedback on feasibility and red flags
- ✅ Students select an "optimal scenario" that flows to future tools
- ✅ Zero bugs, smooth UX, fast performance

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FTP-v3 Framework                        │
│  doGet() → Router → ToolAccessControl → Tool4.render()     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Tool 4: Single-Page Web App (HTML)             │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Client ID Gate  │→ │   Welcome Card   │               │
│  └──────────────────┘  └──────────────────┘               │
│                              ↓                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │          Interactive Calculator Interface          │     │
│  │  • Input Dials (Financial, Behavioral, Goals)     │     │
│  │  • Real-time Allocation Display (M, E, F, J)      │     │
│  │  • GPT Personalization Panel                      │     │
│  │  • Scenario Management (Save/Load/Compare)        │     │
│  │  • Red Flags & Recommendations                    │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               Server-Side Functions (Apps Script)            │
│                                                             │
│  • lookupStudentById(id)                                   │
│  • getToolInsights(clientId, toolIds)  [NEW]              │
│  • generateGPTGuidance(profile, insights, scenario) [NEW]  │
│  • saveScenario(clientId, scenario)                        │
│  • getUserScenarios(clientId, limit=10)                    │
│  • setOptimalScenario(clientId, scenarioId)                │
│  • generateScenarioPDF(clientId, scenarioId)               │
│  • generateComparisonPDF(clientId, id1, id2)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                       │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ RESPONSES Sheet  │  │ TOOL4_SCENARIOS  │               │
│  │  (Framework)     │  │  (Detailed)      │               │
│  │                  │  │                  │               │
│  │ • Tool status    │  │ • Full history   │               │
│  │ • Optimal scene. │  │ • Last 10 scenes │               │
│  │ • Is_Latest      │  │ • Timestamps     │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3 (Tailwind-inspired), Vanilla JavaScript |
| **Backend** | Google Apps Script (ES5-compatible) |
| **AI** | OpenAI GPT-4 API (via Apps Script) |
| **Storage** | Google Sheets (RESPONSES + TOOL4_SCENARIOS) |
| **Reports** | Google Docs API → PDF export |
| **Deployment** | Google Apps Script Web App (doGet) |

### 2.3 Component Breakdown

#### 2.3.1 Frontend Components
```javascript
// Main UI Sections
- WelcomeGate           // Client ID verification
- PersonalizationPanel  // GPT insights from Tools 1-3
- InputControls         // 20+ input dials/dropdowns
- AllocationDisplay     // Real-time M/E/F/J percentages
- NotesPanel            // Modifier explanations
- RedFlagsPanel         // Warnings and recommendations
- ScenarioManager       // Save/Load/Compare UI
- ComparisonView        // Side-by-side scenario comparison
- PDFActions            // Generate reports
```

#### 2.3.2 Backend Functions
```javascript
// Authentication & Data Retrieval
Tool4.lookupStudentById(id)
Tool4.getToolInsights(clientId, ['tool1', 'tool2', 'tool3'])

// GPT Integration (NEW)
Tool4.generatePersonalization(clientId, scenario)

// Scenario Persistence
Tool4.saveScenario(clientId, scenarioData)
Tool4.getUserScenarios(clientId)
Tool4.setOptimalScenario(clientId, scenarioId)
Tool4.deleteScenario(clientId, scenarioId)

// Report Generation
Tool4.generateScenarioPDF(clientId, scenarioId)
Tool4.generateComparisonPDF(clientId, id1, id2)
```

---

## 3. AllocationFunction Analysis & Optimization

### 3.1 Current Logic Review

The existing `AllocationFunction.js` implements a **weighted scoring system** with modifiers:

```
FINAL ALLOCATION = Normalize(BASE_WEIGHTS + MODIFIERS - CONSTRAINTS)

Where:
  BASE_WEIGHTS    = Priority-based starting point (10 options)
  MODIFIERS       = Financial + Behavioral + Motivational adjustments
  CONSTRAINTS     = Essentials floor, red flags, caps
```

#### 3.1.1 Base Weights (10 Priority Options)

| Priority | M | E | F | J | Use Case |
|----------|---|---|---|---|----------|
| Build Long-Term Wealth | 40 | 25 | 20 | 15 | Growth-focused, stable income |
| Get Out of Debt | 15 | 25 | 45 | 15 | High debt load |
| Feel Financially Secure | 25 | 35 | 30 | 10 | Risk-averse, needs safety |
| Enjoy Life Now | 20 | 20 | 15 | 45 | YOLO mindset |
| Save for a Big Goal | 15 | 25 | 45 | 15 | Short-term target (house, car) |
| Stabilize to Survive | 5 | 45 | 40 | 10 | Living paycheck-to-paycheck |
| Build/Stabilize Business | 20 | 30 | 35 | 15 | Entrepreneur, irregular income |
| Create Generational Wealth | 45 | 25 | 20 | 10 | High net worth, legacy focus |
| Create Life Balance | 15 | 25 | 25 | 35 | Work-life harmony |
| Reclaim Financial Control | 10 | 35 | 40 | 15 | Financial avoidance recovery |

#### 3.1.2 Modifiers (Current Implementation)

**A. Financial Modifiers** (+/- 5 to 15 points)
```javascript
Income Range (A-E)
  A (Low):   M -5
  E (High):  M +10

Debt Load (A-E)
  D (Moderate): F +10
  E (Severe):   F +15

Interest Level
  High: F +10
  Low:  F -5

Emergency Fund (A-E)
  A,B (None/Low): F +10
  D,E (3+ months): F -10

Income Stability
  Unstable:     E +5, F +5
  Very Stable:  M +5
  Contract/Gig: E +10, F +5  [NEW]
```

**B. Behavioral Modifiers** (+/- 5 to 10 points)
```javascript
Discipline (1-10)
  ≥8: M +10
  ≤3: M -10

Impulse Control (1-10)
  ≥8: J +5
  ≤3: J -10

Long-term Focus (1-10)
  ≥8: M +10
  ≤3: M -10

Emotional Spending (1-10)
  ≥8: J +10
  ≤3: J -5

Emotional Safety Needs (1-10)
  ≥8: E +5, F +5

Financial Avoidance (1-10)
  ≥7: M -5, F +5

Financial Confidence (1-10)
  ≤3: M -5, E +5, F +5  [NEW]
```

**C. Motivational Modifiers** (+/- 5 to 10 points)
```javascript
Lifestyle Priority (1-10)
  ≥8: J +10
  ≤3: J -5

Growth Orientation (1-10)
  ≥8: M +10

Stability Orientation (1-10)
  ≥8: F +10

Goal Timeline
  <1 year: F +10

Dependents
  Yes: E +5

Autonomy Preference (1-10)
  ≥8: M +5
  ≤3: E +5, F +5

Stage of Life
  Pre-Retirement: M -10, F +10  [NEW]
```

**D. Satisfaction Amplifier** (NEW - multiplicative)
```javascript
If Satisfaction ≥ 6:
  Boost all positive modifiers by:
    (Satisfaction - 5) * 10%
    Capped at +30%
```

#### 3.1.3 Constraints & Floors

**Essentials Floor**
```javascript
Reported Essentials % (from dropdown):
  A: 5%   (<10%)
  B: 15%  (10-20%)
  C: 25%  (20-30%)
  D: 35%  (30-40%)
  E: 45%  (40-50%)
  F: 55%  (>50%)

Absolute Minimum: 40% (even if they report lower)
Recommended Max: 35%

If E_final < max(reported, 40%):
  Raise E to floor
  Scale down M, F, J proportionally
```

**Red Flags**
```javascript
⚠️ Emergency Fund < 2 months
⚠️ High debt (E) + Low income (A-C)
⚠️ Multiply < 10%
⚠️ Enjoyment > 40%
⚠️ Essentials > 35% (reported spending)
```

**Modifier Caps**
```javascript
Any bucket modifier:
  Max positive: +50
  Max negative: -20
```

### 3.2 Identified Issues & Optimization Opportunities

#### 🔴 **Issue 1: Satisfaction Amplifier Complexity**
**Current:** Multiplicative boost on positive modifiers only
**Problem:** Hard to explain to students, inconsistent with additive model
**Proposed Fix:**
- **Option A:** Convert to additive modifier (+5 to +15 based on satisfaction)
- **Option B:** Keep multiplicative but simplify (e.g., 1.2x if satisfaction ≥ 7)
- **Option C:** Remove entirely, integrate satisfaction into behavioral modifiers

**Recommendation:** Option A (additive) for consistency

---

#### 🔴 **Issue 2: Missing Trauma Integration**
**Current:** No connection to Tool 1, 2, 3 insights
**Problem:** Tool 4 doesn't leverage deep trauma analysis
**Proposed Fix:** Add trauma-based modifiers (see Section 5)

---

#### 🔴 **Issue 3: Base Weight Selection is Binary**
**Current:** Student picks 1 of 10 priorities → entire allocation hinges on that
**Problem:** Most students have multiple priorities (e.g., "Build Wealth" AND "Get Out of Debt")
**Proposed Fix:**
- **Option A:** Multi-select priorities (pick top 3, average their weights)
- **Option B:** Ranking system (rank top 3, weighted average: 50%, 30%, 20%)
- **Option C:** Infer priorities from behavioral data + GPT analysis

**Recommendation:** Option B (ranking) for better personalization

---

#### 🔴 **Issue 4: Essentials Floor is Too Rigid**
**Current:** Absolute 40% minimum, even if student reports 5%
**Problem:** Ignores legitimate low-cost lifestyles (minimalists, tiny homes, etc.)
**Proposed Fix:**
- Use 40% as **recommended** floor, not absolute
- Flag as warning if < 40%, but allow student to override
- GPT explains risks if they choose < 40%

**Recommendation:** Implement warning system instead of hard floor

---

#### 🔴 **Issue 5: No Income Amount Consideration**
**Current:** Only income range (A-E), not actual dollar amount
**Problem:** $30K vs $300K have very different allocation strategies
**Proposed Fix:**
- Add optional "Actual Monthly Income" input
- Apply scaling factors:
  - < $3K/mo: Essentials +5, Multiply -5
  - > $15K/mo: Multiply +10, Enjoyment +5
- Use for better GPT personalization

**Recommendation:** Add as optional "Advanced Settings" input

---

#### 🔴 **Issue 6: Modifier Overlap & Redundancy**
**Current:** Some modifiers trigger similar adjustments
- "Emotional Safety ≥8" → E +5, F +5
- "Stability Orientation ≥8" → F +10
- These often co-occur (correlation)

**Problem:** Double-counting similar traits
**Proposed Fix:**
- Group correlated modifiers into composite scores
- E.g., "Safety Index" = avg(emotionSafety, stability, financialConfidence)
- Apply one modifier based on composite

**Recommendation:** Analyze modifier correlation, consolidate groups

---

#### 🔴 **Issue 7: No Consideration for Existing Assets**
**Current:** Allocation is % of income, ignores existing wealth
**Problem:** Someone with $500K invested shouldn't get "Multiply < 10%" warning
**Proposed Fix:**
- Add optional "Current Investment Balance" input
- If balance > 2x annual income: reduce M floor warning
- GPT adjusts recommendations based on net worth

**Recommendation:** Add to Advanced Settings

---

#### 🔴 **Issue 8: Missing Life Events & Context**
**Current:** Static snapshot, no consideration for changes
**Problem:** What if they're about to have a baby? Buy a house? Change careers?
**Proposed Fix:**
- Add "Anticipated Life Events (next 12 months)" multi-select
  - Marriage/Partnership
  - Having a child
  - Buying a home
  - Starting a business
  - Career change
  - Health issues
- Apply event-specific modifiers (e.g., baby → E +10, F +10, J -10)

**Recommendation:** Add as optional input with GPT integration

---

### 3.3 Proposed Optimized Allocation Algorithm

```javascript
// STEP 1: Calculate Base Weights (NEW - Ranking System)
priorities = student.rankTopThree()
baseWeights = {
  M: 0.5 * priority1.M + 0.3 * priority2.M + 0.2 * priority3.M,
  E: 0.5 * priority1.E + 0.3 * priority2.E + 0.2 * priority3.E,
  F: 0.5 * priority1.F + 0.3 * priority2.F + 0.2 * priority3.F,
  J: 0.5 * priority1.J + 0.3 * priority2.J + 0.2 * priority3.J
}

// STEP 2: Calculate Composite Indices (NEW)
safetyIndex = avg(emotionalSafety, stabilityOrientation, financialConfidence)
growthIndex = avg(growthOrientation, longTermFocus, autonomy)
spendingIndex = avg(emotionalSpending, impulseControl, discipline)

// STEP 3: Apply Consolidated Modifiers
modifiers = {
  M: financialMods.M + behavioralMods.M + motivationalMods.M + traumaMods.M,
  E: financialMods.E + behavioralMods.E + motivationalMods.E + traumaMods.E,
  F: financialMods.F + behavioralMods.F + motivationalMods.F + traumaMods.F,
  J: financialMods.J + behavioralMods.J + motivationalMods.J + traumaMods.J
}

// STEP 4: Satisfaction Adjustment (SIMPLIFIED)
if (satisfaction >= 7) {
  Object.keys(modifiers).forEach(bucket => {
    if (modifiers[bucket] > 0) {
      modifiers[bucket] *= 1.2  // 20% boost
    }
  })
}

// STEP 5: Apply Modifiers & Normalize
raw = {
  M: baseWeights.M + modifiers.M,
  E: baseWeights.E + modifiers.E,
  F: baseWeights.F + modifiers.F,
  J: baseWeights.J + modifiers.J
}
total = raw.M + raw.E + raw.F + raw.J
normalized = {
  M: raw.M / total * 100,
  E: raw.E / total * 100,
  F: raw.F / total * 100,
  J: raw.J / total * 100
}

// STEP 6: Apply Essentials Floor (WARNING, not hard constraint)
recommendedEMin = max(reportedEssentials, 40)
if (normalized.E < recommendedEMin) {
  addWarning("⚠️ Essentials below recommended minimum")
  // Optionally auto-adjust (user can override)
}

// STEP 7: Red Flags
checkRedFlags(normalized, inputs)

// STEP 8: GPT Personalization
gptGuidance = generateGPTGuidance(profile, insights, normalized)

return {
  allocations: normalized,
  modifiers: modifiers,
  warnings: warnings,
  gptGuidance: gptGuidance
}
```

### 3.4 New Input Fields (Proposed)

| Category | Field | Type | Purpose |
|----------|-------|------|---------|
| **Priorities** | Top 3 Financial Priorities | Ranking (1-3) | Replace single priority selection |
| **Financial** | Actual Monthly Income | Optional $ | Better personalization |
| **Financial** | Current Investment Balance | Optional $ | Adjust M recommendations |
| **Context** | Anticipated Life Events | Multi-select | Event-specific modifiers |
| **Trauma** | Tool 1 Winner Category | Auto-filled | Apply trauma-specific modifiers |
| **Trauma** | Tool 2 Top Domain | Auto-filled | Financial behavior insights |
| **Trauma** | Tool 3 Identity Score | Auto-filled | Self-view alignment |

---

## 4. Data Storage Strategy

### 4.1 The Challenge

Tool 4 has **fundamentally different data requirements** than Tools 1-3:

| Requirement | Tools 1-3 | Tool 4 |
|-------------|-----------|--------|
| **Responses per student** | 1 (with edit history) | Multiple scenarios (10+) |
| **Data size** | ~50 fields | ~40 fields per scenario × 10 scenarios |
| **Update frequency** | Once (submit), rarely edited | Frequent (save/load/compare) |
| **Access pattern** | Write once, read for reports | Read/write constantly |
| **Cross-tool reference** | One-time lookup | Ongoing (optimal scenario flows forward) |

### 4.2 Proposed Hybrid Storage Model

```
┌─────────────────────────────────────────────────────────────┐
│                     RESPONSES SHEET                         │
│              (Framework-level, Tool Status)                 │
├─────────────────────────────────────────────────────────────┤
│ Timestamp | Client_ID | Tool_ID | Data        | Status | ...│
│ 11/17/25  | 6123LY    | tool4   | {optimal:..}| COMPLETED  │
│                                                             │
│ Data = {                                                    │
│   optimalScenarioId: "scenario_uuid_123",                  │
│   scenarioName: "Conservative Balanced Plan",              │
│   allocations: {M: 25, E: 35, F: 30, J: 10},               │
│   lastModified: "2025-11-17T14:30:00Z",                   │
│   totalScenariosCreated: 7                                 │
│ }                                                           │
│                                                             │
│ Purpose:                                                    │
│  ✅ Mark tool as COMPLETED                                 │
│  ✅ Store current "optimal scenario" for cross-tool use    │
│  ✅ Quick lookup for dashboard                             │
│  ✅ Lightweight (only current state, not full history)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   TOOL4_SCENARIOS SHEET                     │
│              (Detailed Scenario History)                    │
├─────────────────────────────────────────────────────────────┤
│ Scenario_ID | Client_ID | Name   | Created  | Is_Optimal | │
│ uuid_123    | 6123LY    | Consrv | 11/17 14:30 | TRUE    | │
│ uuid_456    | 6123LY    | Aggrsv | 11/17 15:00 | FALSE   | │
│ uuid_789    | 6123LY    | Balanc | 11/17 15:30 | FALSE   | │
│ ...         | ...       | ...    | ...         | ...     | │
│                                                             │
│ Columns (50+ total):                                        │
│  • Scenario_ID (UUID)                                       │
│  • Client_ID, Student_Name, Email                           │
│  • Scenario_Name                                            │
│  • Created_At, Updated_At                                   │
│  • Is_Optimal (TRUE/FALSE)                                  │
│  • All Input Fields (40+)                                   │
│    - Priority_1, Priority_2, Priority_3                     │
│    - Income_Range, Debt_Load, Emergency_Fund, etc.          │
│  • All Allocation Results (M, E, F, J)                      │
│  • All Modifier Details (Financial, Behavioral, Motivational)│
│  • Red Flags & Warnings (JSON string)                       │
│  • GPT_Guidance (text)                                      │
│  • Comparison_Count (how many times compared)               │
│                                                             │
│ Constraints:                                                │
│  ✅ Max 10 scenarios per student (FIFO cleanup)            │
│  ✅ Auto-delete oldest when 11th is saved                  │
│  ✅ Only 1 scenario has Is_Optimal = TRUE per student      │
│                                                             │
│ Purpose:                                                    │
│  ✅ Full scenario history (last 10)                        │
│  ✅ Comparison support (load 2+ scenarios)                 │
│  ✅ PDF generation (all details needed)                    │
│  ✅ Student can revisit old scenarios                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow Diagram

```
┌──────────────────┐
│  Student Creates │
│  New Scenario    │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│ saveScenario(clientId, data)     │
│  1. Generate UUID for scenario   │
│  2. Check scenario count         │
│  3. If count >= 10, delete oldest│
│  4. Insert row in TOOL4_SCENARIOS│
│  5. Do NOT update RESPONSES yet  │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Student Loads Scenarios          │
│ getUserScenarios(clientId)       │
│  → Returns last 10 from sheet    │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Student Marks Scenario as Optimal│
│ setOptimalScenario(clientId, id) │
│  1. Update TOOL4_SCENARIOS:      │
│     Set all Is_Optimal = FALSE   │
│     Set selected Is_Optimal=TRUE │
│  2. Update RESPONSES:            │
│     Store optimal scenario data  │
│     Set Status = COMPLETED       │
│     Set Is_Latest = TRUE         │
│  3. Unlock Tool 5                │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Tool 5 (or later) Needs Allocation│
│ DataService.getToolResponse(     │
│   clientId, 'tool4'              │
│ )                                │
│  → Returns optimal scenario from │
│     RESPONSES sheet              │
└──────────────────────────────────┘
```

### 4.4 Implementation Functions

```javascript
/**
 * Save a new scenario (or update existing)
 * @param {string} clientId - Student ID
 * @param {Object} scenarioData - Full scenario data
 * @returns {Object} {ok: true, scenarioId: "uuid"}
 */
function saveScenario(clientId, scenarioData) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName('TOOL4_SCENARIOS');

  // Generate UUID
  const scenarioId = scenarioData.scenarioId || Utilities.getUuid();

  // Check if editing existing or creating new
  const existingRow = findScenarioRow(sheet, scenarioId);

  if (existingRow) {
    // Update existing
    updateScenarioRow(sheet, existingRow, scenarioData);
  } else {
    // Check count, delete oldest if needed
    const count = getScenarioCount(sheet, clientId);
    if (count >= 10) {
      deleteOldestScenario(sheet, clientId);
    }

    // Insert new row
    appendScenarioRow(sheet, clientId, scenarioId, scenarioData);
  }

  return {ok: true, scenarioId: scenarioId};
}

/**
 * Get all scenarios for a student (last 10, newest first)
 */
function getUserScenarios(clientId) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName('TOOL4_SCENARIOS');

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const clientIdCol = headers.indexOf('Client_ID');
  const createdAtCol = headers.indexOf('Created_At');

  // Filter and sort
  const scenarios = data.slice(1)
    .filter(row => normalizeId(row[clientIdCol]) === normalizeId(clientId))
    .map(row => parseScenarioRow(row, headers))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return scenarios;
}

/**
 * Mark a scenario as optimal (and update RESPONSES)
 */
function setOptimalScenario(clientId, scenarioId) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const scenarioSheet = ss.getSheetByName('TOOL4_SCENARIOS');

  // 1. Clear all Is_Optimal for this student
  const data = scenarioSheet.getDataRange().getValues();
  const headers = data[0];
  const clientIdCol = headers.indexOf('Client_ID');
  const isOptimalCol = headers.indexOf('Is_Optimal');

  for (let i = 1; i < data.length; i++) {
    if (normalizeId(data[i][clientIdCol]) === normalizeId(clientId)) {
      scenarioSheet.getRange(i + 1, isOptimalCol + 1).setValue(false);
    }
  }

  // 2. Set selected scenario as optimal
  const scenarioRow = findScenarioRow(scenarioSheet, scenarioId);
  scenarioSheet.getRange(scenarioRow, isOptimalCol + 1).setValue(true);

  // 3. Get full scenario data
  const scenarioData = parseScenarioRow(
    data[scenarioRow - 1],
    headers
  );

  // 4. Update RESPONSES sheet
  DataService.saveToolResponse(clientId, 'tool4', {
    optimalScenarioId: scenarioId,
    scenarioName: scenarioData.name,
    allocations: scenarioData.allocations,
    lastModified: new Date().toISOString(),
    totalScenariosCreated: getScenarioCount(scenarioSheet, clientId)
  }, 'COMPLETED');

  // 5. Unlock Tool 5
  ToolAccessControl.adminUnlockTool(clientId, 'tool5', 'system', 'Tool 4 completed');

  return {ok: true};
}

/**
 * Delete oldest scenario for a student
 */
function deleteOldestScenario(sheet, clientId) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const clientIdCol = headers.indexOf('Client_ID');
  const createdAtCol = headers.indexOf('Created_At');

  // Find oldest scenario for this client
  let oldestRow = null;
  let oldestDate = new Date();

  for (let i = 1; i < data.length; i++) {
    if (normalizeId(data[i][clientIdCol]) === normalizeId(clientId)) {
      const date = new Date(data[i][createdAtCol]);
      if (date < oldestDate) {
        oldestDate = date;
        oldestRow = i + 1;
      }
    }
  }

  if (oldestRow) {
    sheet.deleteRow(oldestRow);
  }
}
```

### 4.5 TOOL4_SCENARIOS Sheet Schema

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Scenario_ID | String (UUID) | Unique identifier | "abc123..." |
| Client_ID | String | Student ID | "6123LY" |
| Student_Name | String | Full name | "John Doe" |
| Email | String | Email address | "john@..." |
| Scenario_Name | String | User-provided name | "Conservative Plan" |
| Created_At | DateTime | Creation timestamp | 2025-11-17 14:30 |
| Updated_At | DateTime | Last edit | 2025-11-17 15:00 |
| Is_Optimal | Boolean | Current optimal? | TRUE |
| **Inputs** | | | |
| Priority_1 | String | Top priority | "Build Long-Term Wealth" |
| Priority_2 | String | 2nd priority | "Feel Financially Secure" |
| Priority_3 | String | 3rd priority | "Enjoy Life Now" |
| Income_Range | String (A-E) | Income bracket | "C" |
| Actual_Income | Number | Optional $ amount | 6500 |
| Essentials_Range | String (A-F) | Essential costs | "C" |
| Debt_Load | String (A-E) | Debt level | "C" |
| Interest_Level | String | Debt interest | "Moderate" |
| Emergency_Fund | String (A-E) | Savings level | "C" |
| Income_Stability | String | Job stability | "Stable" |
| Satisfaction | Number (1-10) | Financial satisfaction | 4 |
| Discipline | Number (1-10) | Financial discipline | 6 |
| Impulse_Control | Number (1-10) | Impulse control | 7 |
| Long_Term_Focus | Number (1-10) | Long-term thinking | 8 |
| Emotional_Spending | Number (1-10) | Emotional spending | 5 |
| Emotional_Safety | Number (1-10) | Safety needs | 7 |
| Financial_Avoidance | Number (1-10) | Avoidance tendency | 3 |
| Lifestyle_Priority | Number (1-10) | Lifestyle importance | 6 |
| Growth_Orientation | Number (1-10) | Growth mindset | 8 |
| Stability_Orientation | Number (1-10) | Stability preference | 6 |
| Goal_Timeline | String | Time to goal | "1-2 years" |
| Has_Dependents | String | Dependents? | "Yes" |
| Autonomy_Preference | Number (1-10) | Autonomy need | 7 |
| Stage_Of_Life | String | Life stage | "Mid-Career" |
| Financial_Confidence | Number (1-10) | Confidence level | 5 |
| Life_Events | String (JSON) | Anticipated events | ["Baby", "Home"] |
| **Allocations** | | | |
| Multiply_Percent | Number | Final M% | 25 |
| Essentials_Percent | Number | Final E% | 35 |
| Freedom_Percent | Number | Final F% | 30 |
| Enjoyment_Percent | Number | Final J% | 10 |
| **Modifiers** | | | |
| Multiply_Mod_Financial | String | Financial mods | "+10 (high income)" |
| Multiply_Mod_Behavioral | String | Behavioral mods | "+10 (discipline)" |
| Multiply_Mod_Motivational | String | Motivational mods | "+5 (autonomy)" |
| Multiply_Mod_Trauma | String | Trauma mods | "-5 (FSV winner)" |
| Essentials_Mod_Financial | String | ... | ... |
| Essentials_Mod_Behavioral | String | ... | ... |
| Essentials_Mod_Motivational | String | ... | ... |
| Essentials_Mod_Trauma | String | ... | ... |
| Freedom_Mod_Financial | String | ... | ... |
| Freedom_Mod_Behavioral | String | ... | ... |
| Freedom_Mod_Motivational | String | ... | ... |
| Freedom_Mod_Trauma | String | ... | ... |
| Enjoyment_Mod_Financial | String | ... | ... |
| Enjoyment_Mod_Behavioral | String | ... | ... |
| Enjoyment_Mod_Motivational | String | ... | ... |
| Enjoyment_Mod_Trauma | String | ... | ... |
| **GPT & Insights** | | | |
| Tool1_Winner | String | Trauma winner | "FSV" |
| Tool2_Top_Domain | String | Top financial domain | "Money Avoidance" |
| Tool3_Identity_Quotient | Number | Identity score | -1.2 |
| GPT_Personalization | Text | GPT guidance | "Based on your..." |
| Red_Flags | String (JSON) | Warnings | ["Low emergency fund"] |
| **Metadata** | | | |
| Comparison_Count | Number | Times compared | 3 |
| PDF_Generated | Boolean | PDF created? | TRUE |
| PDF_URL | String | PDF link | "https://..." |

**Total Columns:** ~60

---

## 5. GPT Integration Strategy

### 5.1 The Vision

Tool 4 should **leverage AI to provide personalized guidance** that connects:
- Trauma patterns from Tool 1 (6 categories: FSV, ExVal, Showing, Receiving, Control, Fear)
- Financial behaviors from Tool 2 (5 domains: Money Avoidance, Money Worship, Money Status, Money Vigilance, Relational Money)
- Identity alignment from Tool 3 (External Validation, False Self-View)
- Current financial situation and goals

**Example GPT Output:**
```
"John, I notice from your Tool 1 results that Fear is your primary trauma pattern,
and from Tool 2 we see you have high Money Vigilance. This combination suggests
you may be holding onto cash out of safety concerns rather than optimizing growth.

Your current allocation (M: 15%, E: 40%, F: 35%, J: 10%) reflects this - you're
prioritizing safety (Essentials + Freedom = 75%) over growth.

Consider this: Your emergency fund is already at 6 months, and your debt load is
low. You could safely increase Multiply to 25% without compromising security.
The extra 10% compounded over 20 years could mean $400K more in retirement.

Your false self-view from Tool 3 suggests you may be underestimating your financial
competence. Trust the numbers - you're more stable than you feel."
```

### 5.2 GPT Integration Points

| Stage | When | Purpose |
|-------|------|---------|
| **Initial Load** | Student enters Tool 4 | Show personalized welcome based on Tools 1-3 |
| **After First Scenario** | Student creates first allocation | Validate alignment with trauma/behavior patterns |
| **Scenario Comparison** | Student compares 2+ scenarios | Explain which aligns better with their profile |
| **Optimal Selection** | Student marks scenario as optimal | Confirm choice, suggest refinements |
| **PDF Generation** | Student downloads report | Include full personalized guidance |

### 5.3 Data Retrieval Function

```javascript
/**
 * Get insights from Tools 1, 2, 3 for GPT context
 * @param {string} clientId
 * @returns {Object} Combined insights
 */
function getToolInsights(clientId) {
  const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
  const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
  const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

  return {
    tool1: {
      winner: tool1Data?.data?.winner || null,  // "FSV", "ExVal", "Control", etc.
      scores: tool1Data?.data?.scores || {},    // {FSV: 18, ExVal: 12, ...}
      topThought: tool1Data?.data?.formData?.thought_ranking?.[0] || null,
      topFeeling: tool1Data?.data?.formData?.feeling_ranking?.[0] || null
    },
    tool2: {
      archetype: tool2Data?.data?.results?.archetype || null,  // "The Vigilant Worrier"
      topDomain: tool2Data?.data?.results?.topDomain || null,  // "Money Vigilance"
      domainScores: tool2Data?.data?.results?.domainScores || {},
      priorities: tool2Data?.data?.results?.priorities || {},
      stressLevel: tool2Data?.data?.results?.stressLevel || null
    },
    tool3: {
      overallQuotient: tool3Data?.data?.results?.overallQuotient || null,  // -1.5
      externalValidation: tool3Data?.data?.results?.domain1Quotient || null,
      falseSelfView: tool3Data?.data?.results?.domain2Quotient || null,
      topSubdomain: tool3Data?.data?.results?.topSubdomain || null
    }
  };
}
```

### 5.4 GPT Prompt Architecture

**System Prompt (Fixed):**
```
You are a financial psychology expert integrated into the Financial TruPath system.
Your role is to help students understand how their trauma patterns and behavioral
tendencies should inform their budget allocation across 4 buckets:
- Multiply (M): Investments, wealth building
- Essentials (E): Living costs
- Freedom (F): Debt payoff, emergency fund
- Enjoyment (J): Lifestyle, experiences

You have access to:
1. Tool 1 (Trauma Assessment): 6 trauma categories with scores
2. Tool 2 (Financial Clarity): 5 behavioral domains and archetype
3. Tool 3 (Identity & Validation): Self-view alignment scores
4. Current scenario: Student's inputs and calculated allocations

Your guidance should:
- Be empathetic and non-judgmental
- Connect trauma patterns to financial behaviors
- Explain WHY certain allocations make sense for them
- Suggest adjustments based on psychological insights
- Be concise (200-300 words max)
- Avoid jargon, use plain language
```

**User Prompt (Dynamic):**
```
Student Profile:
- Name: {{studentName}}
- Tool 1 Winner: {{tool1.winner}} (score: {{tool1.scores[winner]}})
- Tool 2 Archetype: {{tool2.archetype}}
- Tool 2 Top Domain: {{tool2.topDomain}}
- Tool 3 Overall Quotient: {{tool3.overallQuotient}}

Current Scenario:
- Name: {{scenario.name}}
- Allocations: M {{M}}%, E {{E}}%, F {{F}}%, J {{J}}%
- Top Priority: {{priority1}}
- Debt Load: {{debtLoad}}
- Emergency Fund: {{emergencyFund}}
- Financial Satisfaction: {{satisfaction}}/10

Modifiers Applied:
{{modifierSummary}}

Red Flags:
{{redFlags}}

Task: Provide personalized guidance on this allocation. Specifically:
1. Does this allocation align with their trauma patterns and behavioral tendencies?
2. Are there any psychological blind spots they should consider?
3. What adjustments might better serve their long-term wellbeing?
4. How does this scenario compare to their stated priorities?

Keep response to 200-300 words, empathetic tone, actionable insights.
```

### 5.5 GPT Response Structure

```javascript
{
  "guidance": "John, I notice from your Tool 1 results...",
  "alignmentScore": 8.5,  // 0-10 how well scenario matches profile
  "suggestedAdjustments": [
    {
      "bucket": "Multiply",
      "currentPercent": 15,
      "suggestedPercent": 25,
      "reason": "Your emergency fund is strong (6 months) and debt is low. You can safely increase growth allocation."
    }
  ],
  "psychologicalInsights": [
    "Your Fear trauma pattern may be causing you to over-prioritize safety at the expense of growth.",
    "Your Money Vigilance (Tool 2) is aligned with high Freedom allocation, which is healthy for your profile."
  ],
  "affirmations": [
    "Your discipline score (8/10) suggests you're ready to commit to a Multiply-focused strategy.",
    "You're more financially stable than you may feel (Tool 3 false self-view)."
  ]
}
```

### 5.6 GPT Integration Function

```javascript
/**
 * Generate personalized GPT guidance for a scenario
 * @param {string} clientId
 * @param {Object} scenarioData - Current scenario inputs & allocations
 * @returns {Object} GPT response
 */
function generateGPTGuidance(clientId, scenarioData) {
  const insights = getToolInsights(clientId);
  const student = getStudentProfile(clientId);

  // Build dynamic prompt
  const systemPrompt = GPT_SYSTEM_PROMPT;  // Constant
  const userPrompt = buildUserPrompt(student, insights, scenarioData);

  try {
    const response = callOpenAI({
      model: "gpt-4-turbo-preview",
      messages: [
        {role: "system", content: systemPrompt},
        {role: "user", content: userPrompt}
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: {type: "json_object"}  // Structured output
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    return {
      ok: true,
      guidance: parsed.guidance,
      alignmentScore: parsed.alignmentScore,
      suggestions: parsed.suggestedAdjustments || [],
      insights: parsed.psychologicalInsights || [],
      affirmations: parsed.affirmations || []
    };

  } catch (error) {
    Logger.log(`GPT error: ${error}`);
    return {
      ok: false,
      error: error.message,
      guidance: "Unable to generate personalized guidance at this time. Please proceed with your scenario."
    };
  }
}
```

### 5.7 Trauma-Based Modifiers (NEW)

Based on Tool 1 winner category, apply specific modifiers:

| Tool 1 Winner | Financial Impact | Recommended Modifiers |
|---------------|------------------|----------------------|
| **FSV** (False Self-View) | Over-investing in appearance, lifestyle inflation | J -5, E +5 (reduce Enjoyment, increase Essentials buffer) |
| **ExVal** (External Validation) | Seeking approval through financial status | J -10, M +5 (reduce status spending, increase growth) |
| **Showing Love** | Over-sacrificing for others, poor boundaries | E +5, F +10 (protect yourself first) |
| **Receiving Love** | Difficulty accepting help, lone wolf mentality | F +5 (build independence), M +5 (self-reliance) |
| **Control** | Risk-averse, micro-managing | M -5, F +10 (comfort with control via emergency fund) |
| **Fear** | Hoarding cash, avoiding growth | M -10, E +10, F +10 (prioritize safety) |

**Tool 2 Domain Modifiers:**

| Tool 2 Top Domain | Financial Impact | Recommended Modifiers |
|-------------------|------------------|----------------------|
| **Money Avoidance** | Underspending, poor tracking | E +5 (ensure needs are met), J +5 (permission to enjoy) |
| **Money Worship** | Belief that money solves everything | M +10 (align with belief), J -5 (reduce impulse) |
| **Money Status** | Overspending on image | J -10, M +5 (shift to wealth building) |
| **Money Vigilance** | Anxious saving, frugality | E +5, F +10 (validate security needs), M -5 (comfort) |
| **Relational Money** | Money = love/connection | J -5 (reduce gifting), F +10 (build independence) |

**Tool 3 Identity Score Modifiers:**

| Tool 3 Overall Quotient | Interpretation | Recommended Modifiers |
|-------------------------|----------------|----------------------|
| **< -2.0** | Severe disconnection from financial reality | E +10 (ground in basics), M -10 (avoid complex strategies) |
| **-2.0 to -0.5** | Moderate false self-view | E +5, Financial Confidence training |
| **-0.5 to +0.5** | Aligned self-view | No modifier (healthy baseline) |
| **+0.5 to +2.0** | Slightly over-confident | M +5 (can handle complexity) |
| **> +2.0** | Possibly delusional confidence | F +10 (build safety net), seek professional help |

### 5.8 GPT Fallback Strategy

**3-Tier Reliability:**
1. **Primary:** GPT-4 Turbo with structured output
2. **Fallback 1:** GPT-4 (slower, more expensive, but reliable)
3. **Fallback 2:** Template-based guidance (no API call)

```javascript
function generateGPTGuidance(clientId, scenarioData) {
  try {
    // Try GPT-4 Turbo
    return callGPT4Turbo(clientId, scenarioData);
  } catch (e1) {
    Logger.log(`GPT-4 Turbo failed: ${e1}. Trying GPT-4...`);
    try {
      // Fallback to GPT-4
      return callGPT4(clientId, scenarioData);
    } catch (e2) {
      Logger.log(`GPT-4 failed: ${e2}. Using template fallback.`);
      // Fallback to template
      return generateTemplateGuidance(clientId, scenarioData);
    }
  }
}

function generateTemplateGuidance(clientId, scenarioData) {
  const insights = getToolInsights(clientId);
  const template = selectTemplate(insights.tool1.winner, insights.tool2.topDomain);

  return {
    ok: true,
    guidance: fillTemplate(template, scenarioData, insights),
    alignmentScore: null,  // Can't calculate without GPT
    suggestions: [],
    insights: [],
    affirmations: [],
    isTemplate: true  // Flag for UI
  };
}
```

---

## 6. Scenario Management & Selection

### 6.1 User Journey

```
┌──────────────────────────────────────────────────────┐
│  STEP 1: Create First Scenario                      │
│  • Student enters Tool 4                            │
│  • Sees personalized welcome (GPT from Tools 1-3)   │
│  • Adjusts input dials                              │
│  • Sees allocations update in real-time             │
│  • Clicks "Save Scenario" → Names it                │
│  • Scenario saved to TOOL4_SCENARIOS                │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  STEP 2: Experiment with Alternatives               │
│  • Student clicks "New Scenario" → Clears form      │
│  • Adjusts dials (e.g., prioritize "Enjoy Life")    │
│  • Saves as "Aggressive Plan"                       │
│  • Repeats 3-5 times with variations               │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  STEP 3: Compare Scenarios                          │
│  • Student selects 2 scenarios from dropdown        │
│  • Clicks "Compare"                                 │
│  • Sees side-by-side comparison:                    │
│    - Input differences                              │
│    - Allocation differences                         │
│    - GPT comparison analysis                        │
│  • Can generate comparison PDF                      │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  STEP 4: Select Optimal Scenario                    │
│  • Student reviews all scenarios                    │
│  • Clicks "Mark as Optimal" on chosen one          │
│  • GPT provides confirmation/refinement suggestions │
│  • RESPONSES sheet updated                          │
│  • Tool 5 unlocked                                  │
│  • Dashboard shows "Tool 4: COMPLETED"              │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  STEP 5: Future Tool Integration                    │
│  • Tool 5 (or later) needs Tool 4 allocation       │
│  • Reads optimal scenario from RESPONSES            │
│  • Uses M/E/F/J percentages in its logic           │
│  • Can reference scenario name in reports           │
└──────────────────────────────────────────────────────┘
```

### 6.2 Scenario Actions

| Action | Button/UI | Backend Function | Effect |
|--------|-----------|------------------|--------|
| **Create New** | "New Scenario" button | Clears form, keeps student context | Reset inputs, ready for new scenario |
| **Save** | "Save Scenario" button | `saveScenario(clientId, data)` | Save to TOOL4_SCENARIOS sheet |
| **Load** | Dropdown + "Load" button | `getUserScenarios(clientId)` | Populate form with saved inputs |
| **Compare** | Select 2 + "Compare" | `compareScenarios(id1, id2)` | Show side-by-side + GPT analysis |
| **Mark Optimal** | Star icon or checkbox | `setOptimalScenario(clientId, id)` | Update RESPONSES, unlock Tool 5 |
| **Delete** | Trash icon | `deleteScenario(clientId, id)` | Remove from TOOL4_SCENARIOS |
| **Generate PDF** | "Download PDF" button | `generateScenarioPDF(clientId, id)` | Create PDF report |
| **Compare PDF** | "Compare Report" button | `generateComparisonPDF(id1, id2)` | Create comparison PDF |

### 6.3 Optimal Scenario Selection UI

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│         Your Saved Scenarios (7)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⭐ Conservative Balanced  [OPTIMAL]                │
│     M: 25% | E: 35% | F: 30% | J: 10%             │
│     Created: Nov 17, 14:30                          │
│     [View] [Edit] [PDF]                            │
│                                                     │
│  ☆ Aggressive Growth                                │
│     M: 45% | E: 25% | F: 20% | J: 10%             │
│     Created: Nov 17, 15:00                          │
│     [View] [Mark as Optimal] [PDF] [Delete]        │
│                                                     │
│  ☆ Debt Payoff Focus                                │
│     M: 15% | E: 25% | F: 50% | J: 10%             │
│     Created: Nov 17, 15:30                          │
│     [View] [Mark as Optimal] [PDF] [Delete]        │
│                                                     │
│  [+ Create New Scenario]                            │
└─────────────────────────────────────────────────────┘
```

**Optimal Scenario Badge:**
- Only ONE scenario can have the ⭐ (gold star) at a time
- Clicking "Mark as Optimal" on another scenario:
  1. Shows confirmation dialog: "This will replace your current optimal scenario. Continue?"
  2. If confirmed:
     - Removes ⭐ from old optimal
     - Adds ⭐ to new optimal
     - Updates TOOL4_SCENARIOS (Is_Optimal column)
     - Updates RESPONSES sheet
     - Calls GPT for confirmation message
     - Unlocks Tool 5 (if not already unlocked)

### 6.4 Comparison Feature

**UI Flow:**
```
┌─────────────────────────────────────────────────────┐
│     Compare Scenarios                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Scenario 1: [Conservative Balanced ▼]             │
│  Scenario 2: [Aggressive Growth ▼]                 │
│                                                     │
│  [Compare Side-by-Side] [Generate Comparison PDF]  │
└─────────────────────────────────────────────────────┘
                       ↓ (after clicking Compare)
┌─────────────────────────────────────────────────────┐
│     Comparison Results                              │
├──────────────────────┬──────────────────────────────┤
│  Conservative        │  Aggressive                  │
├──────────────────────┼──────────────────────────────┤
│  Allocations:        │  Allocations:                │
│  • Multiply: 25%     │  • Multiply: 45% (+20)      │
│  • Essentials: 35%   │  • Essentials: 25% (-10)    │
│  • Freedom: 30%      │  • Freedom: 20% (-10)       │
│  • Enjoyment: 10%    │  • Enjoyment: 10% (same)    │
├──────────────────────┼──────────────────────────────┤
│  Key Inputs:         │  Key Inputs:                 │
│  • Priority: Secure  │  • Priority: Build Wealth   │
│  • Risk: Low         │  • Risk: High                │
│  • Timeline: 5+ yrs  │  • Timeline: 20+ yrs        │
├──────────────────────┴──────────────────────────────┤
│  GPT Analysis:                                      │
│  "Conservative aligns better with your Fear trauma  │
│   pattern (Tool 1) and Money Vigilance (Tool 2).   │
│   Aggressive may cause anxiety despite higher       │
│   potential returns. Consider a middle path:        │
│   M: 35%, E: 30%, F: 25%, J: 10%"                 │
└─────────────────────────────────────────────────────┘
```

**Comparison GPT Prompt:**
```
You are comparing two budget scenarios for a student. Provide:
1. Which scenario better aligns with their trauma patterns and behavioral tendencies?
2. Pros and cons of each scenario
3. If neither is ideal, suggest a middle-path allocation
4. Specific recommendations

Student Profile:
{{insights}}

Scenario 1: {{scenario1}}
Scenario 2: {{scenario2}}

Keep response to 150-200 words, actionable insights only.
```

---

## 7. User Interface Design

### 7.1 Visual Design System (Tool 8 Style)

**Color Palette:**
```css
:root {
  --bg-primary: #1e192b;          /* Dark purple background */
  --bg-gradient: linear-gradient(135deg, #4b4166, #1e192b);
  --card-bg: rgba(20, 15, 35, 0.9); /* Card background */
  --accent-gold: #ad9168;          /* Primary accent (buttons, highlights) */
  --accent-blue: #188bf6;          /* Secondary accent (links) */
  --text-primary: #ffffff;         /* White text */
  --text-muted: #94a3b8;           /* Gray text */
  --border: rgba(173, 145, 104, 0.2); /* Gold border with opacity */
  --success: #9ae6b4;              /* Green for success */
  --warning: #f59e0b;              /* Orange for warnings */
  --error: #ef4444;                /* Red for errors */
}
```

**Typography:**
```css
font-family-primary: 'Rubik', sans-serif;   /* Body, UI elements */
font-family-heading: 'Radley', serif;       /* Headings, section titles */
```

**Component Styles:**
- **Cards:** Rounded (20px), semi-transparent, backdrop blur, subtle shadow
- **Buttons:** Pill-shaped (50px radius), gold border, hover state (fill + shadow)
- **Inputs:** Pill-shaped, dark background, gold border on focus
- **Sliders:** Custom gold thumb, subtle track, smooth transitions
- **Badges:** Inline pills with muted background for categories/labels

### 7.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Logo + Student Welcome + Tutorial Button)         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  GPT PERSONALIZATION PANEL (Collapsed by default)          │
│  "Based on your trauma patterns..." [Expand ▼]             │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────┬──────────────────────────────────┐
│  LEFT COLUMN             │  RIGHT COLUMN                    │
│  (Input Controls)        │  (Results & Actions)             │
├──────────────────────────┼──────────────────────────────────┤
│  Section 1: Priorities   │  Section 4: Your Allocation      │
│  • Rank Top 3            │  • M, E, F, J percentages        │
│                          │  • Visual bar chart              │
│  Section 2: Financial    │  • Alignment score (GPT)         │
│  • Income range          │                                  │
│  • Debt load             │  Section 5: Modifiers Applied    │
│  • Emergency fund        │  • Financial: ...                │
│  • Stability             │  • Behavioral: ...               │
│                          │  • Motivational: ...             │
│  Section 3: Behavioral   │  • Trauma: ...                   │
│  • Satisfaction (1-10)   │                                  │
│  • Discipline (1-10)     │  Section 6: Red Flags            │
│  • Impulse (1-10)        │  • ⚠️ Low emergency fund        │
│  • ... (10 sliders)      │  • ⚠️ Multiply < 10%            │
│                          │                                  │
│  Section 4: Goals        │  Section 7: Scenario Actions     │
│  • Timeline              │  • [Save Scenario]               │
│  • Dependents            │  • [Load Scenario ▼]            │
│  • Life events           │  • [Compare (2 selected)]        │
│  • Stage of life         │  • [Mark as Optimal ⭐]         │
│                          │  • [Generate PDF]                │
│  [Advanced Settings ▼]   │                                  │
│  • Actual income         │                                  │
│  • Investment balance    │                                  │
└──────────────────────────┴──────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  SAVED SCENARIOS LIST (Bottom section)                     │
│  [Scenario cards with View/Edit/Delete/Compare actions]    │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Input Controls Specification

#### 7.3.1 Section 1: Financial Priorities (NEW - Ranking System)

**UI Component:** Drag-and-drop ranking interface

```html
<div class="section-box">
  <div class="badge">🎯 Your Top 3 Financial Priorities</div>
  <p class="muted">Drag to rank your top 3 priorities (1 = most important)</p>

  <div class="ranking-container">
    <div class="rank-slot" data-rank="1">
      <div class="rank-number">1st Priority</div>
      <select name="priority1" required>
        <option value="">-- Select --</option>
        <option value="Build Long-Term Wealth">Build Long-Term Wealth</option>
        <option value="Get Out of Debt">Get Out of Debt</option>
        <!-- ... all 10 options -->
      </select>
    </div>

    <div class="rank-slot" data-rank="2">
      <div class="rank-number">2nd Priority</div>
      <select name="priority2" required>
        <!-- Same options -->
      </select>
    </div>

    <div class="rank-slot" data-rank="3">
      <div class="rank-number">3rd Priority</div>
      <select name="priority3" required>
        <!-- Same options -->
      </select>
    </div>
  </div>
</div>
```

**Alternative (Simpler):** Just 3 dropdowns, no drag-and-drop

#### 7.3.2 Section 2: Financial Situation

| Input | Type | Options | Default |
|-------|------|---------|---------|
| Net Income Range | Dropdown | A: <$30K, B: $30-60K, C: $60-100K, D: $100-150K, E: >$150K | - |
| Essentials Cost % | Dropdown | A: <10%, B: 10-20%, C: 20-30%, D: 30-40%, E: 40-50%, F: >50% | - |
| Debt Load | Dropdown | A: None, B: <$5K, C: $5-20K, D: $20-50K, E: >$50K | - |
| Interest Level | Dropdown | High (>10%), Moderate (5-10%), Low (<5%), None | - |
| Emergency Fund | Dropdown | A: None, B: <1mo, C: 1-2mo, D: 3-5mo, E: 6+mo | - |
| Income Stability | Dropdown | Very Stable, Stable, Unstable/Irregular, Contract/Gig | - |

#### 7.3.3 Section 3: Behavioral Patterns

**All use slider + number input (synced)**

| Input | Range | Label -5 | Label +5 | Default |
|-------|-------|----------|----------|---------|
| Financial Satisfaction | 1-10 | Very Dissatisfied | Very Satisfied | 5 |
| Discipline Level | 1-10 | Very Low | Very High | 5 |
| Impulse Control | 1-10 | Very Low | Very High | 5 |
| Long-term Focus | 1-10 | Very Low | Very High | 5 |
| Emotional Spending | 1-10 | Never | Very Often | 5 |
| Emotional Safety Needs | 1-10 | Very Low | Very High | 5 |
| Financial Avoidance | 1-10 | Never Avoid | Always Avoid | 5 |
| Lifestyle Priority | 1-10 | Not Important | Very Important | 5 |
| Growth Orientation | 1-10 | Very Low | Very High | 5 |
| Stability Orientation | 1-10 | Very Low | Very High | 5 |
| Autonomy Preference | 1-10 | Low Need | High Need | 5 |
| Financial Confidence | 1-10 | Very Low | Very High | 5 |

**Total sliders:** 12

#### 7.3.4 Section 4: Goals & Context

| Input | Type | Options | Default |
|-------|------|---------|---------|
| Goal Timeline | Dropdown | <6mo, 6-12mo, 1-2yrs, 2-5yrs, 5+yrs, No specific goal | - |
| Dependents | Radio | Yes, No | - |
| Stage of Life | Dropdown | Early Career, Mid-Career, Pre-Retirement, Retired, Student, Business Owner | - |
| Anticipated Life Events | Multi-select checkboxes | Marriage, Baby, Home Purchase, Career Change, Business Start, Health Issues | None |

#### 7.3.5 Advanced Settings (Collapsible)

| Input | Type | Purpose | Optional |
|-------|------|---------|----------|
| Actual Monthly Income | Number ($) | Better personalization | Yes |
| Current Investment Balance | Number ($) | Adjust M recommendations | Yes |
| Current Debt Amount | Number ($) | More precise than range | Yes |

### 7.4 Output Display Specification

#### 7.4.1 Allocation Display (Main Result)

**Visual:** Horizontal stacked bar chart + percentage labels

```
┌─────────────────────────────────────────────────────┐
│  Your Allocation                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Multiply (Investment & Growth)         25%        │
│  ██████████                                         │
│                                                     │
│  Essentials (Living Costs)              35%        │
│  ██████████████                                     │
│                                                     │
│  Freedom (Debt & Emergency Fund)        30%        │
│  ████████████                                       │
│                                                     │
│  Enjoyment (Lifestyle & Fun)            10%        │
│  ████                                               │
│                                                     │
│  GPT Alignment Score: 8.5/10 ⭐⭐⭐⭐               │
└─────────────────────────────────────────────────────┘
```

**Color Coding:**
- Multiply: Blue gradient (#188bf6)
- Essentials: Green (#9ae6b4)
- Freedom: Gold (#ad9168)
- Enjoyment: Purple (#8b5cf6)

#### 7.4.2 Modifier Breakdown (Expandable)

```
┌─────────────────────────────────────────────────────┐
│  How We Calculated Your Allocation  [Expand ▼]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Multiply (25%)                                     │
│  • Base (Priority): 20%                            │
│  • Financial: +10% (high income)                   │
│  • Behavioral: +10% (high discipline)              │
│  • Motivational: +5% (growth orientation)          │
│  • Trauma: -5% (Fear pattern)                      │
│  • Satisfaction Boost: +2% (8/10 satisfaction)     │
│  • After normalization: 25%                        │
│                                                     │
│  [Similar breakdowns for E, F, J]                  │
└─────────────────────────────────────────────────────┘
```

#### 7.4.3 Red Flags Panel

```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Important Considerations                        │
├─────────────────────────────────────────────────────┤
│  • Your emergency fund is below 2 months            │
│    → Consider increasing Freedom allocation         │
│                                                     │
│  • Your Essentials spending (45%) exceeds the       │
│    recommended 35%                                  │
│    → Review your living costs for optimization     │
│                                                     │
│  • Your Multiply allocation (15%) is below 10%     │
│    → This may limit long-term wealth building      │
└─────────────────────────────────────────────────────┘
```

#### 7.4.4 GPT Personalization Panel

```
┌─────────────────────────────────────────────────────┐
│  💡 Personalized Insights for You  [Collapse ▲]    │
├─────────────────────────────────────────────────────┤
│  John, based on your Tool 1 results (Fear as       │
│  primary trauma pattern) and Tool 2 profile        │
│  (Money Vigilance archetype), your current         │
│  allocation reflects a strong need for safety.     │
│                                                     │
│  However, I notice your emergency fund is already  │
│  at 6 months and your debt load is low. You may   │
│  be over-prioritizing Freedom (40%) at the expense │
│  of Multiply (15%).                                │
│                                                     │
│  Consider: Increase Multiply to 25% and reduce     │
│  Freedom to 30%. This still maintains strong       │
│  safety (E+F = 65%) while optimizing for growth.   │
│                                                     │
│  Your Tool 3 results show some false self-view -   │
│  you're more financially stable than you feel.     │
│  Trust the numbers.                                │
│                                                     │
│  [Apply Suggested Adjustments]                     │
└─────────────────────────────────────────────────────┘
```

**"Apply Suggested Adjustments" button:**
- Clicking this auto-fills the form with GPT's recommended allocation
- Student can then tweak and save as a new scenario

### 7.5 Scenario Management UI

```
┌─────────────────────────────────────────────────────┐
│  📂 Your Saved Scenarios (7/10)                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Scenario Name: [Conservative Plan________]        │
│  [Save New Scenario] [Update Current]              │
│                                                     │
│  Load Existing: [Select scenario... ▼]             │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ⭐ Conservative Balanced  [OPTIMAL]           │ │
│  │    M: 25% | E: 35% | F: 30% | J: 10%         │ │
│  │    Nov 17, 14:30                              │ │
│  │    [Load] [PDF] [Compare]                     │ │
│  ├───────────────────────────────────────────────┤ │
│  │ ☐ Aggressive Growth                           │ │
│  │    M: 45% | E: 25% | F: 20% | J: 10%         │ │
│  │    Nov 17, 15:00                              │ │
│  │    [Load] [★ Set Optimal] [PDF] [Delete]     │ │
│  ├───────────────────────────────────────────────┤ │
│  │ ☐ Debt Payoff Focus                           │ │
│  │    M: 15% | E: 25% | F: 50% | J: 10%         │ │
│  │    Nov 17, 15:30                              │ │
│  │    [Load] [★ Set Optimal] [PDF] [Delete]     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Compare: ☑ Aggressive Growth                      │
│           ☑ Debt Payoff Focus                      │
│  [View Comparison] [Generate Comparison PDF]       │
└─────────────────────────────────────────────────────┘
```

### 7.6 Responsive Design

**Breakpoints:**
- Desktop: 1200px+ (two-column layout)
- Tablet: 768-1199px (single column, stacked sections)
- Mobile: <768px (simplified sliders, larger touch targets)

**Mobile Optimizations:**
- Replace sliders with number inputs + +/- buttons
- Stack allocation bars vertically
- Collapse GPT panel by default
- Simplified scenario cards (swipeable carousel)

---

## 8. Integration with FTP-v3 Framework

### 8.1 Tool Registration

**File:** `/tools/tool4/Tool4.js`

```javascript
const Tool4 = {
  manifest: {
    id: 'tool4',
    version: '1.0.0',
    name: 'Financial Freedom Framework',
    pattern: 'interactive-calculator',  // NEW pattern type
    route: 'tool4',
    routes: ['/tool4'],
    description: 'Interactive budget allocation calculator across 4 buckets (M, E, F, J)',
    icon: '💰',
    estimatedTime: '30-45 minutes',
    sections: 0,  // Not applicable (single-page)
    totalQuestions: 0,  // Not applicable (interactive dials)
    dependencies: ['tool1', 'tool2', 'tool3'],
    unlocks: ['tool5']
  },

  /**
   * Render the complete single-page application
   * Unlike Tools 1-3, this returns the ENTIRE app, not just first page
   */
  render(params) {
    const clientId = params.clientId || '';
    const editMode = params.editMode === 'true';

    // Get student profile
    const student = AuthService.getStudent(clientId);
    if (!student) {
      return ErrorHandler.createErrorPage('Student not found');
    }

    // Get insights from Tools 1-3
    const insights = this.getToolInsights(clientId);

    // Get existing scenarios
    const scenarios = this.getUserScenarios(clientId);

    // Generate initial GPT welcome message
    const welcomeMessage = this.generateWelcomeMessage(clientId, insights);

    // Return complete HTML (single-page app)
    return this.buildSinglePageApp({
      student: student,
      insights: insights,
      scenarios: scenarios,
      welcomeMessage: welcomeMessage
    });
  },

  /**
   * Build the complete single-page application HTML
   * Based on Tool 8 pattern
   */
  buildSinglePageApp(data) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Financial Freedom Framework - TruPath Financial</title>
        <style>
          ${this.getStyles()}
        </style>
      </head>
      <body>
        ${this.buildHeader()}
        ${this.buildPersonalizationPanel(data.welcomeMessage)}
        ${this.buildMainLayout(data)}
        ${this.buildScenarioList(data.scenarios)}
        ${this.buildComparisonModal()}
        <script>
          ${this.getJavaScript(data)}
        </script>
      </body>
      </html>
    `;

    return HtmlService.createHtmlOutput(html)
      .setTitle('Financial Freedom Framework')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  // ... rest of Tool4 methods
};

// Register in Code.js
ToolRegistry.register('tool4', Tool4, Tool4.manifest);
```

### 8.2 Framework Compatibility

**Key Differences from Tools 1-3:**

| Method | Tools 1-3 | Tool 4 | Reason |
|--------|-----------|--------|--------|
| `render()` | Returns first page HTML | Returns complete SPA | No page-by-page navigation |
| `renderPageContent()` | ✅ Required | ❌ Not used | Single page only |
| `savePageData()` | ✅ Required | ❌ Not used | Real-time, no draft progression |
| `processFinalSubmission()` | ✅ Required | ❌ Not used | No final submission (scenarios) |
| `getExistingData()` | ✅ Required | ❌ Not used | Load scenarios instead |
| `saveScenario()` | ❌ Not used | ✅ NEW | Save to TOOL4_SCENARIOS |
| `getUserScenarios()` | ❌ Not used | ✅ NEW | Load from TOOL4_SCENARIOS |
| `setOptimalScenario()` | ❌ Not used | ✅ NEW | Mark optimal + update RESPONSES |
| `generateGPTGuidance()` | ❌ Not used | ✅ NEW | Real-time GPT calls |

**Shared Methods (Still Used):**
- `DataService.saveToolResponse()` - For optimal scenario storage in RESPONSES
- `DataService.getToolResponse()` - For reading optimal scenario in later tools
- `ToolAccessControl.canAccessTool()` - Access control
- `ToolAccessControl.adminUnlockTool()` - Unlock Tool 5
- `PDFGenerator.generateTool4PDF()` - PDF generation

### 8.3 Config.js Integration

```javascript
CONFIG.TOOLS.TOOL4 = {
  id: 'tool4',
  name: 'Financial Freedom Framework',
  route: 'tool4',
  icon: '💰',
  description: 'Budget allocation calculator',
  estimatedTime: '30-45 minutes',
  pattern: 'interactive-calculator',
  dependencies: ['tool1', 'tool2', 'tool3'],
  unlocks: ['tool5'],

  // Tool 4 specific settings
  maxScenarios: 10,  // Max scenarios per student
  gptModel: 'gpt-4-turbo-preview',
  gptMaxTokens: 500,
  gptTemperature: 0.7,

  // Allocation constraints
  minMultiply: 10,     // Minimum recommended Multiply %
  minEssentials: 40,   // Recommended minimum Essentials %
  maxEnjoyment: 40,    // Maximum recommended Enjoyment %

  // Red flag thresholds
  emergencyFundThreshold: 2,  // months
  highDebtRanges: ['D', 'E'],
  lowIncomeRanges: ['A', 'B', 'C']
};
```

### 8.4 Router Integration

**No changes needed!** Router already handles custom render() responses:

```javascript
// In Router.js (existing code)
function route(req) {
  const path = req.path || '/';

  if (path.startsWith('/tool')) {
    const toolId = extractToolId(path);  // 'tool4'
    const tool = ToolRegistry.get(toolId);

    if (tool) {
      // Check access
      if (!ToolAccessControl.canAccessTool(clientId, toolId)) {
        return ErrorHandler.createErrorPage('Access denied');
      }

      // Call render() - works for both multi-page and SPA tools
      return tool.render(req.params);
    }
  }

  // ... other routes
}
```

**Tool 4's render() returns HtmlOutput (SPA), Router serves it directly. ✅**

---

## 9. PDF Report Generation

### 9.1 Report Types

| Report Type | Purpose | Trigger | Content |
|-------------|---------|---------|---------|
| **Single Scenario** | Document one allocation plan | "Download PDF" button on scenario | Full scenario details + GPT guidance |
| **Comparison** | Compare 2 scenarios side-by-side | "Compare PDF" button | Input differences, allocation differences, GPT analysis |
| **Optimal Selection Summary** | Confirmation of optimal choice | Auto-generated when optimal is set | Why this scenario, next steps |

### 9.2 Single Scenario PDF Structure

```
┌─────────────────────────────────────────────────────┐
│  TruPath Financial - Financial Freedom Framework    │
│  Budget Allocation Report                           │
│  Generated: November 17, 2025                       │
└─────────────────────────────────────────────────────┘

Student: John Doe (6123LY)
Scenario: Conservative Balanced Plan
Created: November 17, 2025 at 2:30 PM

─────────────────────────────────────────────────────

YOUR ALLOCATION

  Multiply (Investment & Growth):        25%
  Essentials (Living Costs):             35%
  Freedom (Debt & Emergency Fund):       30%
  Enjoyment (Lifestyle & Fun):           10%

─────────────────────────────────────────────────────

FINANCIAL SITUATION

  • Income Range: $60,000 - $100,000/year
  • Essentials Spending: 20-30% of income
  • Debt Load: $5,000 - $20,000
  • Interest Level: Moderate (5-10%)
  • Emergency Fund: 1-2 months saved
  • Income Stability: Stable employment

─────────────────────────────────────────────────────

YOUR PRIORITIES & GOALS

  1st Priority: Feel Financially Secure
  2nd Priority: Build Long-Term Wealth
  3rd Priority: Enjoy Life Now

  Goal Timeline: 2-5 years
  Dependents: Yes
  Stage of Life: Mid-Career
  Anticipated Life Events: Home Purchase

─────────────────────────────────────────────────────

BEHAVIORAL PROFILE

  Financial Satisfaction:     4/10 (Dissatisfied)
  Discipline Level:           6/10 (Moderate)
  Impulse Control:            7/10 (Good)
  Long-term Focus:            8/10 (Very Strong)
  Financial Confidence:       5/10 (Moderate)

─────────────────────────────────────────────────────

HOW WE CALCULATED YOUR ALLOCATION

  Multiply (25%):
    • Base (weighted priorities): 28%
    • Financial modifiers: +5% (stable income)
    • Behavioral modifiers: +10% (long-term focus)
    • Trauma modifiers: -5% (Fear pattern from Tool 1)
    • After normalization: 25%

  Essentials (35%):
    • Base: 30%
    • Financial modifiers: +5% (dependents)
    • Trauma modifiers: +10% (Money Vigilance from Tool 2)
    • Floor enforcement: Minimum 35% applied
    • Final: 35%

  [Similar for Freedom and Enjoyment]

─────────────────────────────────────────────────────

PERSONALIZED INSIGHTS

  John, based on your Tool 1 results (Fear as primary
  trauma pattern) and Tool 2 profile (Money Vigilance
  archetype), your allocation reflects a strong need
  for safety.

  Your emergency fund is currently 1-2 months, which
  is below the recommended 3-6 months. Prioritizing
  Freedom (30%) is wise for your profile.

  However, your long-term focus (8/10) and stable
  income suggest you could handle a bit more risk.
  Consider gradually increasing Multiply as your
  emergency fund grows.

  Your Tool 3 results show moderate alignment between
  your self-view and financial reality. Continue
  building confidence through small wins.

─────────────────────────────────────────────────────

IMPORTANT CONSIDERATIONS

  ⚠️ Emergency Fund Below 3 Months
     Your current emergency fund (1-2 months) is below
     the recommended minimum of 3-6 months. Consider
     prioritizing Freedom allocation until you reach
     this milestone.

  ⚠️ Home Purchase Planned
     You indicated a home purchase in your anticipated
     life events. Ensure your Freedom allocation
     includes down payment savings alongside emergency
     fund and debt payoff.

─────────────────────────────────────────────────────

ACTION STEPS

  1. Build Emergency Fund
     Allocate 30% (Freedom) toward reaching 3-6 months
     of expenses in liquid savings.

  2. Start Investing Consistently
     Begin with 25% (Multiply) in low-cost index funds
     or employer 401(k) match.

  3. Review in 6 Months
     Reassess allocation as emergency fund grows and
     financial confidence increases.

  4. Seek Professional Guidance
     Consider working with a fee-only financial planner
     to optimize for home purchase goal.

─────────────────────────────────────────────────────

Generated by TruPath Financial - Financial Freedom Framework
www.trupathmastery.com
```

### 9.3 Comparison PDF Structure

```
┌─────────────────────────────────────────────────────┐
│  TruPath Financial - Scenario Comparison Report     │
│  Generated: November 17, 2025                       │
└─────────────────────────────────────────────────────┘

Student: John Doe (6123LY)

Scenario 1: Conservative Balanced
Scenario 2: Aggressive Growth

─────────────────────────────────────────────────────

ALLOCATION COMPARISON

                    Conservative    Aggressive    Difference
  Multiply              25%             45%          +20%
  Essentials            35%             25%          -10%
  Freedom               30%             20%          -10%
  Enjoyment             10%             10%          same

─────────────────────────────────────────────────────

KEY INPUT DIFFERENCES

  Priority 1:         Feel Secure     Build Wealth
  Priority 2:         Build Wealth    Enjoy Life
  Priority 3:         Enjoy Life      Feel Secure

  Discipline:         6/10            8/10
  Long-term Focus:    8/10            9/10
  Risk Tolerance:     Moderate        High

─────────────────────────────────────────────────────

EXPERT ANALYSIS

  Conservative aligns better with your current Fear
  trauma pattern (Tool 1) and Money Vigilance profile
  (Tool 2). Aggressive may cause anxiety despite
  higher potential returns.

  However, your strong long-term focus (8/10) and
  improving discipline suggest you could handle a
  middle path.

  RECOMMENDED MIDDLE PATH:
    Multiply:    35%  (split the difference)
    Essentials:  30%  (reduce slightly)
    Freedom:     25%  (maintain safety net)
    Enjoyment:   10%  (keep stable)

  This maintains security while optimizing growth.

─────────────────────────────────────────────────────

WHICH SCENARIO IS RIGHT FOR YOU?

  Choose Conservative if:
    ✓ Emergency fund < 3 months
    ✓ Job stability is uncertain
    ✓ Anxiety about money is high
    ✓ Major expense coming in < 2 years

  Choose Aggressive if:
    ✓ Emergency fund ≥ 6 months
    ✓ Very stable income
    ✓ No major expenses for 5+ years
    ✓ High risk tolerance

  Choose Middle Path if:
    ✓ Emergency fund = 3-5 months
    ✓ Stable income, some uncertainty
    ✓ Comfortable with moderate risk
    ✓ Timeline: 2-5 years

─────────────────────────────────────────────────────

NEXT STEPS

  1. Review your emergency fund status
  2. Assess your risk comfort level honestly
  3. Consider starting with Conservative, shifting to
     Aggressive as confidence builds
  4. Mark your chosen scenario as Optimal in Tool 4
  5. Revisit quarterly and adjust as needed

─────────────────────────────────────────────────────
```

### 9.4 PDF Generation Implementation

**Add to PDFGenerator.js:**

```javascript
PDFGenerator.generateTool4PDF = function(clientId, scenarioId) {
  try {
    // Get scenario data
    const scenario = Tool4.getScenario(clientId, scenarioId);
    if (!scenario) {
      return {ok: false, error: 'Scenario not found'};
    }

    // Get student profile
    const student = getStudentProfile(clientId);

    // Build HTML content
    const html = this.buildTool4HTML(scenario, student);

    // Convert to PDF
    const fileName = `FinancialFreedom_${student.lastName}_${scenario.name}_${timestamp()}.pdf`;
    const pdfBlob = this.htmlToPDF(html, fileName);

    // Save to Drive
    const folder = DriveApp.getFolderById(CONFIG.REPORTS_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Update scenario with PDF URL
    Tool4.updateScenarioPDF(scenarioId, pdfFile.getUrl());

    return {
      ok: true,
      pdfUrl: pdfFile.getUrl(),
      fileName: fileName
    };

  } catch (error) {
    Logger.log(`PDF generation error: ${error}`);
    return {ok: false, error: error.message};
  }
};

PDFGenerator.generateTool4ComparisonPDF = function(clientId, scenarioId1, scenarioId2) {
  try {
    const scenario1 = Tool4.getScenario(clientId, scenarioId1);
    const scenario2 = Tool4.getScenario(clientId, scenarioId2);

    if (!scenario1 || !scenario2) {
      return {ok: false, error: 'Scenarios not found'};
    }

    // Generate GPT comparison analysis
    const comparison = Tool4.compareScenarios(clientId, scenario1, scenario2);

    // Build HTML
    const html = this.buildTool4ComparisonHTML(scenario1, scenario2, comparison);

    // Convert to PDF
    const fileName = `Comparison_${scenario1.name}_vs_${scenario2.name}_${timestamp()}.pdf`;
    const pdfBlob = this.htmlToPDF(html, fileName);

    // Save to Drive
    const folder = DriveApp.getFolderById(CONFIG.REPORTS_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    return {
      ok: true,
      pdfUrl: pdfFile.getUrl(),
      fileName: fileName
    };

  } catch (error) {
    Logger.log(`Comparison PDF error: ${error}`);
    return {ok: false, error: error.message};
  }
};
```

---

## 10. Testing Strategy

### 10.1 Unit Testing (Manual)

**Test Coverage:**

| Component | Test Cases | Expected Behavior |
|-----------|-----------|-------------------|
| **AllocationFunction** | Base weights calculation | Correct weighted average of top 3 priorities |
| | Financial modifiers | Correct +/- based on income, debt, fund, stability |
| | Behavioral modifiers | Correct +/- based on 12 sliders |
| | Trauma modifiers | Correct +/- based on Tool 1/2/3 insights |
| | Normalization | Always sums to 100% |
| | Essentials floor | Warning if < 40%, optional enforcement |
| | Red flags | Correct warnings for emergency fund, debt, etc. |
| **Data Storage** | Save scenario | Row added to TOOL4_SCENARIOS |
| | Load scenarios | Returns last 10, newest first |
| | Set optimal | Updates RESPONSES + TOOL4_SCENARIOS |
| | Delete oldest | Auto-deletes when count > 10 |
| | Update scenario | Existing row updated, not duplicated |
| **GPT Integration** | Generate guidance | Valid JSON response, 200-300 words |
| | Handle API errors | Graceful fallback to template |
| | Comparison analysis | Specific recommendations, middle path |
| **PDF Generation** | Single scenario PDF | Complete, formatted, no errors |
| | Comparison PDF | Side-by-side, GPT analysis included |
| | File naming | Consistent format, no special chars |

### 10.2 Integration Testing

**Test Scenarios:**

1. **Happy Path - New Student**
   - Student completes Tools 1, 2, 3
   - Enters Tool 4
   - Sees personalized welcome message
   - Creates 3 scenarios
   - Compares 2 scenarios
   - Marks 1 as optimal
   - Tool 5 unlocks
   - RESPONSES sheet updated correctly
   - Dashboard shows "Tool 4: COMPLETED"

2. **Edge Case - No Tool 1/2/3 Data**
   - Student enters Tool 4 without completing prerequisites
   - Should show error: "Please complete Tools 1-3 first"
   - OR: Show warning but allow access with generic guidance

3. **Edge Case - 10 Scenarios Limit**
   - Student creates 10 scenarios
   - Creates 11th scenario
   - Oldest scenario auto-deleted
   - No errors

4. **Edge Case - GPT API Failure**
   - Mock GPT API failure
   - System falls back to template guidance
   - No UI crash
   - Clear indication that guidance is template-based

5. **Edit Mode**
   - Student completes Tool 4
   - Clicks "Edit" from dashboard
   - Can modify inputs
   - Can save as new scenario OR update optimal
   - Is_Latest flag managed correctly

### 10.3 User Acceptance Testing (UAT)

**Test with 5-10 real students:**

| Test | Metric | Target |
|------|--------|--------|
| Time to complete | Average minutes | < 45 min |
| Scenarios created | Average count | 3-5 |
| Comparison used | % of students | > 60% |
| Optimal selected | % of students | 100% |
| GPT guidance helpful | Likert 1-5 | ≥ 4.0 |
| UI clarity | Likert 1-5 | ≥ 4.2 |
| Would recommend | Yes/No | ≥ 80% |

### 10.4 Performance Testing

**Metrics:**

| Operation | Target Time | Notes |
|-----------|-------------|-------|
| Initial page load | < 3 sec | Full SPA HTML |
| Allocation recalculation | < 100ms | Client-side JS only |
| GPT guidance generation | < 5 sec | Server-side API call |
| Save scenario | < 2 sec | Sheet write operation |
| Load scenarios | < 2 sec | Sheet read operation |
| Generate PDF | < 10 sec | Doc creation + conversion |

### 10.5 Browser Compatibility

**Test Browsers:**
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Known Issues to Check:**
- Slider styling (Safari has different defaults)
- Range input sync (Firefox sometimes lags)
- Document.write issues (should not apply since SPA)
- Modal overlay z-index (test on all browsers)

---

## 11. Open Questions & Design Decisions

### 11.1 Critical Decisions Needed

#### ❓ **Decision 1: Satisfaction Amplifier - Keep, Simplify, or Remove?**

**Options:**
- **A.** Keep multiplicative (current): Complex but powerful
- **B.** Convert to additive: Simpler, easier to explain
- **C.** Remove entirely: Integrate into behavioral scoring

**Recommendation:** Option B (additive)

**Rationale:** Easier for students to understand "High satisfaction adds +10 to positive modifiers" vs "1.2x multiplier on positive modifiers"

---

#### ❓ **Decision 2: Priority Selection - Single or Multi-Select?**

**Options:**
- **A.** Single priority (current): Simple, forces clarity
- **B.** Rank top 3: More nuanced, weighted average
- **C.** Multi-select with sliders: Most flexible, most complex

**Recommendation:** Option B (rank top 3)

**Rationale:** Most students have multiple priorities. Ranking forces prioritization while allowing nuance.

---

#### ❓ **Decision 3: Essentials Floor - Hard Constraint or Warning?**

**Options:**
- **A.** Hard 40% floor (current): Safety-first, prevents dangerous allocations
- **B.** Recommended 40% with override: Warn but allow student choice
- **C.** Dynamic floor based on income: Higher income → lower floor

**Recommendation:** Option B (warning with override)

**Rationale:** Respects student autonomy, avoids forcing unrealistic allocations on low-cost lifestyles

---

#### ❓ **Decision 4: GPT Integration Frequency**

**Options:**
- **A.** Only on demand (button click): Cheapest, slowest
- **B.** Auto-generate after scenario save: Good UX, moderate cost
- **C.** Real-time as inputs change: Best UX, expensive
- **D.** Hybrid: Template + on-demand GPT upgrade: Balanced

**Recommendation:** Option D (hybrid)

**Rationale:** Show instant template guidance, offer "Get AI Analysis" button for full GPT

---

#### ❓ **Decision 5: Scenario Limit - 10 vs 20 vs Unlimited?**

**Options:**
- **A.** 10 scenarios max (current proposal): Keeps data manageable
- **B.** 20 scenarios max: More flexibility
- **C.** Unlimited: No artificial constraints
- **D.** Tiered: Free users = 5, paid = unlimited

**Recommendation:** Option A (10 max)

**Rationale:** Prevents analysis paralysis, keeps sheet performance good, encourages decisiveness

---

#### ❓ **Decision 6: Optimal Scenario Requirement**

**Options:**
- **A.** Required to unlock Tool 5: Forces completion
- **B.** Optional, Tool 5 uses most recent: More flexible
- **C.** Required for final graduation: Deferred enforcement

**Recommendation:** Option A (required)

**Rationale:** Tool 4 is about making a decision. Forcing optimal selection ensures student commits to a plan.

---

#### ❓ **Decision 7: Data Migration for Existing Students**

**Challenge:** If Tool 4 is added after students have completed Tools 1-3, how do we handle them?

**Options:**
- **A.** Retroactively unlock Tool 4 for all who completed Tool 3
- **B.** Require re-completion of Tool 3 to unlock Tool 4
- **C.** Manual admin unlock on request
- **D.** Grandfather clause: Skip Tool 4 if already past it

**Recommendation:** Option A (auto-unlock)

**Rationale:** Tool 4 is not assessment-based, can be done anytime. No need to block progress.

---

#### ❓ **Decision 8: AllocationFunction.js Rewrite - Full or Incremental?**

**Options:**
- **A.** Full rewrite with all optimizations: Clean slate, risky
- **B.** Incremental improvements: Safer, maintains compatibility
- **C.** AB test: Run both algorithms, compare results
- **D.** Use current logic, document improvements for v2

**Recommendation:** Option B (incremental)

**Rationale:** Current logic works. Improve gradually, test thoroughly, avoid breaking changes.

---

### 11.2 Technical Constraints to Clarify

#### 🔧 **Constraint 1: Apps Script Quotas**

**Relevant Quotas:**
- URL Fetch calls (GPT API): 20,000/day (whole account)
- Execution time: 6 min/execution
- Sheet reads: 20,000/day
- Sheet writes: 20,000/day
- Drive files created: 250/user/day (PDFs)

**Impact on Tool 4:**
- If 100 students use Tool 4 in one day:
  - Scenario saves: ~500 writes (5 scenarios/student)
  - GPT calls: ~100-500 (1-5/student)
  - PDF generation: ~100-300 (1-3/student)

**Risk:** GPT quota may be exceeded on high-traffic days

**Mitigation:**
- Implement caching for common GPT prompts
- Use template fallback when quota exhausted
- Rate limit GPT calls (max 3/student/day)

---

#### 🔧 **Constraint 2: Sheet Performance with Large Datasets**

**Scenario:**
- 500 students × 10 scenarios = 5,000 rows in TOOL4_SCENARIOS
- 60 columns per row
- Total cells: 300,000

**Apps Script Performance:**
- getDataRange() on 5,000 rows: ~2-3 seconds
- Filter + sort in memory: ~1-2 seconds
- Total query time: ~4-5 seconds

**Risk:** Slow load times for scenario list

**Mitigation:**
- Use getRange() with specific row range (only fetch student's rows)
- Cache scenario list in PropertiesService (5 min TTL)
- Archive old scenarios to separate sheet after 1 year

---

#### 🔧 **Constraint 3: Client-Side JavaScript Bundle Size**

**Estimate:**
- AllocationFunction logic: ~15KB
- UI framework (vanilla JS): ~10KB
- Styles (embedded CSS): ~20KB
- Total HTML file: ~50-60KB

**Impact:** Minimal (< 100KB is fine for web apps)

**Optimization:** Minify JavaScript in production

---

### 11.3 User Experience Questions

#### 🎨 **UX Question 1: Onboarding / Tutorial**

**Question:** Should we include a tutorial video/walkthrough?

**Options:**
- **A.** No tutorial, self-explanatory UI: Simplest
- **B.** Modal tutorial on first visit: Helpful but dismissible
- **C.** Embedded video (like Tool 8): Best for complex tools
- **D.** Interactive tooltips: Contextual help

**Recommendation:** Option C (embedded video)

**Rationale:** Tool 8 has tutorial, Tool 4 is similar complexity. Reuse pattern.

---

#### 🎨 **UX Question 2: Mobile Experience**

**Question:** How important is mobile optimization?

**Assumption:** Most students will use desktop/laptop for 45-min tool

**Options:**
- **A.** Desktop only, mobile not supported: Risky
- **B.** Mobile-friendly but not optimized: Acceptable
- **C.** Fully responsive, mobile-first: Best UX

**Recommendation:** Option C (fully responsive)

**Rationale:** Millennials/Gen Z expect mobile support. Don't lose students due to device constraints.

---

#### 🎨 **UX Question 3: Real-time vs Debounced Updates**

**Question:** Should allocations update on every slider movement or after pause?

**Options:**
- **A.** Real-time (every input event): Instant feedback, CPU-intensive
- **B.** Debounced (300ms pause): Smoother, still feels instant
- **C.** Manual "Calculate" button: Slowest, most intentional

**Recommendation:** Option B (debounced 300ms)

**Rationale:** Feels instant, prevents calculation spam, smooth UX

---

### 11.4 Integration Questions

#### 🔗 **Integration 1: How do later tools use Tool 4 data?**

**Example Use Cases:**

**Tool 5 (Love Connection Assessment):**
- "Based on your Enjoyment allocation (10%), we see you prioritize stability over lifestyle. How does this affect your relationships?"
- Adapt questions based on M/E/F/J balance

**Tool 6 (Retirement Blueprint):**
- Use Multiply % as starting point for retirement allocation
- If Multiply < 15%, flag need for retirement catch-up plan

**Tool 8 (Investment Tool):**
- Pre-fill "Monthly Savings" with Multiply % × Income
- Use Risk tolerance from Tool 4 in investment dial

**Question:** Should Tool 4 create "recommendations" for future tools?

**Recommendation:** Yes, store in RESPONSES as:
```javascript
{
  optimalScenarioId: "...",
  allocations: {M: 25, E: 35, F: 30, J: 10},
  recommendations: {
    tool5: "Consider how your low Enjoyment (10%) reflects relationship priorities",
    tool6: "Multiply allocation (25%) is healthy for mid-career. Maintain or increase.",
    tool8: "Pre-filled monthly savings: $1,625 (25% of $6,500 income)"
  }
}
```

---

#### 🔗 **Integration 2: Should Tool 4 update if student edits Tool 1/2/3?**

**Scenario:**
- Student completes Tool 1 (Fear winner)
- Completes Tool 4 (allocations influenced by Fear)
- Goes back and edits Tool 1 (now ExVal winner)
- Tool 4 allocations are now based on outdated insights

**Options:**
- **A.** No retroactive updates: Student must manually re-visit Tool 4
- **B.** Notify student: "Tool 1 changed, review Tool 4"
- **C.** Auto-invalidate Tool 4: Force re-completion
- **D.** Offer "Recalculate with new insights" button in Tool 4

**Recommendation:** Option D (recalculate button)

**Rationale:** Respects student autonomy, doesn't force re-work, but offers easy update path

---

### 11.5 Next Steps Before Implementation

**Required Actions:**

1. ✅ **Review & Approve This Spec**
   - Stakeholder review of all design decisions
   - Confirm GPT integration strategy
   - Confirm data storage model
   - Sign-off on AllocationFunction optimizations

2. ✅ **Create Implementation Plan** (separate document)
   - Break down into development phases
   - Estimate hours per task
   - Identify dependencies
   - Set milestones

3. ✅ **Finalize AllocationFunction Logic**
   - Decide on satisfaction amplifier approach
   - Decide on priority selection (single vs rank 3)
   - Decide on essentials floor (hard vs warning)
   - Document final modifier calculations

4. ✅ **Design GPT Prompts**
   - Write system prompt
   - Write user prompt templates
   - Test with sample data
   - Validate response format

5. ✅ **Create UI Mockups** (optional but recommended)
   - Wireframes for desktop layout
   - Wireframes for mobile layout
   - Design scenario comparison view
   - Design PDF templates

6. ⏳ **Set Up Development Environment**
   - Create Tool 4 branch in Git (if using version control)
   - Set up local testing with clasp
   - Create test Google Sheet for TOOL4_SCENARIOS
   - Set up test OpenAI API account (or use main)

7. ⏳ **Begin Implementation** (Phase 1: Core Calculator)
   - Implement AllocationFunction.js
   - Create single-page HTML/CSS/JS
   - Test allocation calculations
   - Add input validation

---

## Appendix A: File Structure

```
/tools/tool4/
├── Tool4.js                   # Main tool implementation
├── Tool4AllocationEngine.js   # Core allocation calculation logic
├── Tool4GPT.js                # GPT integration functions
├── Tool4Scenarios.js          # Scenario CRUD operations
├── Tool4Report.js             # PDF report generation
├── Tool4Templates.js          # HTML templates for SPA
└── tool.manifest.json         # Tool metadata (optional)

/shared/
└── (existing shared utilities, no changes needed)

/Config.js
  └── Add CONFIG.TOOLS.TOOL4 section

/Code.js
  └── Add Tool4 registration in registerTools()

/docs/Tool4/
├── TOOL4-SPECIFICATION.md     # This document
├── TOOL4-IMPLEMENTATION-PLAN.md  # Next document to create
└── TOOL4-USER-GUIDE.md        # End-user documentation
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Multiply (M)** | Investment & wealth building bucket |
| **Essentials (E)** | Living costs & necessities bucket |
| **Freedom (F)** | Debt payoff & emergency fund bucket |
| **Enjoyment (J)** | Lifestyle & entertainment bucket |
| **Scenario** | One complete set of inputs + calculated allocations |
| **Optimal Scenario** | Student's chosen "best fit" scenario that flows to future tools |
| **SPA** | Single-Page Application (no page refreshes) |
| **Trauma Modifier** | Adjustment to allocation based on Tool 1/2/3 insights |
| **Base Weights** | Starting allocation percentages based on priority selection |
| **Normalization** | Ensuring M + E + F + J = 100% |
| **Red Flag** | Warning about potentially problematic allocation or financial situation |
| **GPT Guidance** | AI-generated personalized advice based on student profile |
| **Comparison** | Side-by-side analysis of 2 scenarios |
| **TOOL4_SCENARIOS** | Google Sheet storing all scenario history |
| **RESPONSES** | Framework sheet storing optimal scenario for cross-tool use |

---

## End of Specification

**Document Status:** DRAFT v1.0
**Next Document:** TOOL4-IMPLEMENTATION-PLAN.md
**Estimated Implementation Time:** 40-60 hours (based on complexity and testing requirements)

**Questions or feedback? Please review and approve before proceeding to implementation plan.**
