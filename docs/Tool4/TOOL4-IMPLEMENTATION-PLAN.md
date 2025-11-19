# Tool 4: Master Implementation Plan

**Version:** 1.0
**Date:** November 18, 2025
**Status:** 100% Specification Complete - Ready for Development
**Purpose:** THE master guide for implementing Tool 4: Financial Freedom Framework

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Quick Start for Developers](#2-quick-start-for-developers)
3. [Complete Document Map](#3-complete-document-map)
4. [Phase-by-Phase Implementation Guide](#4-phase-by-phase-implementation-guide)
5. [Key Numbers Reference](#5-key-numbers-reference)
6. [Data Flow & Architecture](#6-data-flow--architecture)
7. [Testing Strategy](#7-testing-strategy)
8. [Implementation Checklist](#8-implementation-checklist)

---

## 1. Executive Summary

### 1.1 What is Tool 4?

**Tool 4: Financial Freedom Framework** is an interactive budget allocation calculator that helps students discover their optimal allocation across 4 financial buckets:

- **M**ultiply (Investments, wealth building)
- **E**ssentials (Housing, utilities, food, transportation)
- **F**reedom (Debt payoff, emergency fund)
- **J**oyment (Entertainment, hobbies, lifestyle)

### 1.2 How Tool 4 Differs from Tools 1-3

| Aspect | Tools 1-3 | Tool 4 |
|--------|-----------|--------|
| **Type** | Multi-page assessment questionnaires | Single-page interactive calculator |
| **Interaction** | Sequential form submission | Real-time allocation adjustments |
| **User Agency** | Student answers questions | Student selects priorities + sees recommendations |
| **Processing** | Server-side + GPT analysis | Client-side calculation + GPT enhancement |
| **Output** | Single final report | Multiple saved scenarios + comparison |
| **Data Model** | One response per tool | Multiple scenarios per student |

### 1.3 Key Innovations

#### **1. Progressive Unlock Model**
Not all priorities are available to all students. Priorities unlock based on financial health:
- **Surplus** (income - essentials)
- **Emergency fund** (months of expenses)
- **Debt load** (debt-to-income ratio)

**Example:**
```
Student: $3,000 income, $2,500 essentials, $0 emergency fund
Available: Stabilize to Survive, Reclaim Control, Get Out of Debt
Locked: Build Long-Term Wealth (need $800 surplus + 6mo emergency fund)
```

#### **2. Hybrid Allocation UX**
System shows BOTH allocations and offers 3 paths forward:

**Recommended Allocation** (Based on priority + modifiers)
```
M: 25%, E: 35%, F: 30%, J: 10%
```

**Adjusted Allocation** (Based on current reality)
```
M: 25%, E: 54%, F: 15%, J: 6%
⚠️ Gap: You spend $950/month more on essentials than recommended
```

**3 Paths:**
1. **Optimize Now** - Adjust essentials immediately, execute recommended
2. **Gradual Progress** - Start with adjusted, improve over 30-90 days (most students)
3. **Different Priority** - Choose better-fitting priority

#### **3. Trauma-Informed Design**
- Integrates insights from Tools 1, 2, and 3
- Detects overwhelm vs. motivation (satisfaction + trauma patterns)
- Adjusts modifiers based on trauma patterns (Fear, Control, FSV, Money Avoidance)
- Provides trauma-appropriate recommendations

#### **4. Hybrid Priority Selection**
- System **recommends** best priority based on financial data
- Student can **override** and select different priority
- Balances expert guidance with autonomy

### 1.4 Current Status

**100% SPECIFICATION COMPLETE** across 3 sessions:

**Session 1 (Framework):**
- ✅ Progressive unlock model
- ✅ Hybrid priority selection
- ✅ Top 2 ranking (70%/30%)
- ✅ Hybrid allocation UX (3 paths)
- ✅ All 10 priorities defined
- ✅ Base weights drafted

**Session 2 (Implementation Details):**
- ✅ Complete unlock requirements
- ✅ Recommendation decision tree
- ✅ Tool 2 fallback questions

**Session 3 (Validation & Refinement):**
- ✅ Base weights validated (20 scenarios tested, 3 priorities adjusted)
- ✅ Progress plan algorithm (30-60-90 day milestones)
- ✅ Modifiers system validated (29 modifiers + 3 new trauma modifiers)

**Result:** Zero ambiguity. Every detail finalized. Ready to code.

---

## 2. Quick Start for Developers

### 2.1 Start Here

**If you're brand new to Tool 4 implementation:**

1. **Read this document first** (you're here!)
2. **Read:** `/Users/Larry/code/FTP-v3/docs/Tool4/TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (source of truth, 60KB)
3. **Scan:** Complete Document Map below (Section 3)
4. **Follow:** Phase-by-Phase Implementation Guide (Section 4)

### 2.2 Reading Order for Key Documents

**Core Framework (Read These First):**
1. `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` - All framework decisions (MUST READ)
2. `TOOL4-PROGRESSIVE-UNLOCK-MODEL.md` - All 10 priorities with unlock logic
3. This document (`TOOL4-IMPLEMENTATION-PLAN.md`) - Implementation roadmap

**Algorithm Details (Read During Phase 1 Implementation):**
4. `PROGRESS-PLAN-ALGORITHM.md` - 30-60-90 day milestone generation
5. `MODIFIERS-SYSTEM-VALIDATION.md` - All 29 modifiers + trauma integration
6. `BASE-WEIGHTS-SCENARIO-TESTING.md` - 20 test scenarios + validation results

**Architecture & Integration (Read During Phase 2+):**
7. `TOOL4-SPECIFICATION.md` - System architecture, data storage, GPT integration
8. `TOOL4-IMPLEMENTATION-CHECKLIST.md` - Phase checklist

### 2.3 Where to Find Specific Information

| Need to know... | Look in... |
|----------------|------------|
| Base weights for a priority | `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 4) |
| Unlock requirements | `TOOL4-PROGRESSIVE-UNLOCK-MODEL.md` or `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 5) |
| Progress plan algorithm | `PROGRESS-PLAN-ALGORITHM.md` |
| All modifiers list | `MODIFIERS-SYSTEM-VALIDATION.md` (Section 9) |
| Testing scenarios | `BASE-WEIGHTS-SCENARIO-TESTING.md` |
| Recommendation logic | `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 5) |
| Hybrid UX (3 paths) | `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 6) |
| Data storage strategy | `TOOL4-SPECIFICATION.md` (Section 4) |
| GPT integration | `TOOL4-SPECIFICATION.md` (Section 5) |

---

## 3. Complete Document Map

### 3.1 SOURCE OF TRUTH Documents

**These contain ALL final decisions. Refer to these when implementing.**

#### **TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md** (60KB)
**Status:** ✅ FINALIZED
**Contains:**
- Complete framework decisions (progressive unlock, hybrid selection, top 2 ranking)
- All 10 priorities with VALIDATED base weights (M/E/F/J percentages)
- Complete unlock requirements (surplus, emergency fund, debt thresholds)
- Recommendation triggers for each priority
- Hybrid allocation UX (recommended vs adjusted, 3 paths)
- Tool 2 integration (overspending detection, suggested cuts)
- Modifiers system overview
- Surplus calculation formulas

**When to reference:** Throughout entire implementation. This is THE source of truth.

#### **TOOL4-PROGRESSIVE-UNLOCK-MODEL.md** (8KB)
**Status:** ✅ FINALIZED
**Contains:**
- All 10 priorities organized by tier
- Base weights for each priority
- Unlock requirements (detailed)
- Recommendation triggers
- Example student journey (how priorities unlock over time)
- Progressive unlock UX mockups

**When to reference:** Phase 1 (unlock logic), Phase 2 (priority selection UI)

---

### 3.2 Algorithm Documents

**These contain specific calculation logic for core features.**

#### **PROGRESS-PLAN-ALGORITHM.md** (12KB)
**Status:** ✅ COMPLETE
**Contains:**
- Gap calculation formula (current vs target allocation)
- Timeline determination (2-6 months based on gap size)
- Monthly reduction strategy (progressive: 70%, 100%, 110%, 120%...)
- Monthly focus areas (subscriptions → habits → bills → lifestyle)
- Milestone structure (JSON format)
- Update prompt triggers (time-based, goal-based, overdue)
- Plan adjustment algorithm (when student struggles)
- Success tips generator
- Complete example with 4-month plan

**When to reference:** Phase 3 (progress tracking), when implementing Path 2 (Gradual Progress)

#### **MODIFIERS-SYSTEM-VALIDATION.md** (11KB)
**Status:** ✅ COMPLETE
**Contains:**
- All 26 legacy modifiers (financial, behavioral, motivational)
- 3 NEW trauma-informed modifiers (FSV, Money Avoidance, High Showing)
- Trauma-informed satisfaction amplifier algorithm
- Modifier caps (±50/±20)
- Complete modifier list with code examples
- Test case with trauma patterns
- Edge case handling

**When to reference:** Phase 1 (core algorithm), when implementing modifier system

---

### 3.3 Testing Documents

**These contain validation scenarios and expected outcomes.**

#### **BASE-WEIGHTS-SCENARIO-TESTING.md** (15KB)
**Status:** ✅ COMPLETE
**Contains:**
- 20 realistic student scenarios across all income levels
- Calculated allocations for each scenario
- Gap analysis (current vs recommended essentials)
- Verdict for each scenario (realistic/borderline/unrealistic)
- Identified issues with original base weights
- 3 priorities adjusted based on testing
- Success rate analysis
- Updated base weights table

**When to reference:** Phase 4 (testing & validation), when writing test cases

---

### 3.4 Architecture Documents

**These contain system design, data models, and integration patterns.**

#### **TOOL4-SPECIFICATION.md** (30KB, partial read in this session)
**Status:** ✅ FINALIZED (v3.0)
**Contains:**
- High-level system architecture
- Technology stack
- Component breakdown (frontend + backend)
- AllocationFunction.js analysis
- Data storage strategy (RESPONSES + TOOL4_SCENARIOS sheets)
- GPT integration strategy
- Scenario management (save/load/compare)
- User interface design patterns
- PDF report generation
- Testing strategy overview

**When to reference:** Throughout implementation, especially Phase 2 (UX) and integration work

#### **TOOL4-IMPLEMENTATION-CHECKLIST.md** (Size unknown)
**Status:** Available
**Contains:**
- Phase-by-phase checklist
- Definition of done for each phase
- Dependencies and blockers

**When to reference:** Project management, sprint planning

---

### 3.5 Reference Documents

**These provide context, history, and supporting information.**

#### **SESSION-THREE-HANDOFF.md** (6KB)
**Status:** ✅ COMPLETE
**Contains:**
- Session 3 objectives (Items 3, 4, 5)
- Context from Sessions 1 & 2
- What needs to be done (methodology)
- Deliverables for each item
- Key documents to reference
- Success criteria
- Current status (100% complete)

**When to reference:** Understanding the refinement process, context for decisions

#### **SESSION-THREE-COMPLETE-SUMMARY.md** (Not read in this session)
**Status:** Available
**Contains:**
- Detailed session 3 outcomes
- Full results for Items 3, 4, 5
- Final decisions with rationale

**When to reference:** Detailed understanding of validation results

#### **Legacy Documents** (in `Archive/` folder)
- TOOL4-BASE-WEIGHTS-DEEP-DIVE-PLAN.md (archived)
- TOOL4-PHILOSOPHY-QUESTIONNAIRE.md (archived)
- TOOL4-SESSION-HANDOFF.md (superseded by SESSION-THREE-HANDOFF.md)

**When to reference:** Historical context only, not for implementation

---

## 4. Phase-by-Phase Implementation Guide

### Phase 1: Core Allocation Algorithm

**Goal:** Build the core calculation engine that determines M/E/F/J allocations.

**Duration:** 2-3 weeks

**Dependencies:** None

**Key Documents:**
- `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 4, 9)
- `MODIFIERS-SYSTEM-VALIDATION.md`
- `TOOL4-PROGRESSIVE-UNLOCK-MODEL.md`

---

#### **Task 1.1: Base Weights Implementation**

**File:** `AllocationFunction.js` (or new `Tool4AllocationEngine.js`)

**Implementation:**
```javascript
// Define all 10 priorities with VALIDATED base weights
const PRIORITIES = {
  'Stabilize to Survive': { M: 5, E: 60, F: 30, J: 5 },       // UPDATED 11/18/25
  'Reclaim Financial Control': { M: 10, E: 45, F: 35, J: 10 }, // UPDATED 11/18/25
  'Get Out of Debt': { M: 15, E: 35, F: 40, J: 10 },          // UPDATED 11/18/25
  'Feel Financially Secure': { M: 25, E: 35, F: 30, J: 10 },
  'Create Life Balance': { M: 15, E: 25, F: 25, J: 35 },
  'Build/Stabilize Business': { M: 20, E: 30, F: 35, J: 15 },
  'Save for a Big Goal': { M: 25, E: 25, F: 40, J: 10 },
  'Build Long-Term Wealth': { M: 40, E: 25, F: 20, J: 15 },
  'Enjoy Life Now': { M: 20, E: 20, F: 15, J: 45 },
  'Create Generational Wealth': { M: 50, E: 20, F: 20, J: 10 }
};

// Implement Top 2 ranking (70%/30% weighted average)
function calculateBaseWeights(priority1, priority2) {
  return {
    M: PRIORITIES[priority1].M * 0.7 + PRIORITIES[priority2].M * 0.3,
    E: PRIORITIES[priority1].E * 0.7 + PRIORITIES[priority2].E * 0.3,
    F: PRIORITIES[priority1].F * 0.7 + PRIORITIES[priority2].F * 0.3,
    J: PRIORITIES[priority1].J * 0.7 + PRIORITIES[priority2].J * 0.3
  };
}
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 501-887

**Tests:**
- Verify all 10 priorities have correct base weights
- Test Top 2 weighted average calculation
- Example: "Get Out of Debt" (70%) + "Feel Secure" (30%) should produce:
  - M: 18%, E: 34.5%, F: 37%, J: 10%

---

#### **Task 1.2: Modifiers System**

**Implementation:**

**A. Financial Modifiers** (±5 to ±15 points)
```javascript
function applyFinancialModifiers(input, mods) {
  // Income Level
  if (input.incomeLevel === 'A') mods.M -= 5;
  if (input.incomeLevel === 'E') mods.M += 10;

  // Debt Load
  if (input.debtLoad === 'D') mods.F += 10;
  if (input.debtLoad === 'E') mods.F += 15;

  // Interest Rate
  if (input.interestRate === 'High') mods.F += 10;
  if (input.interestRate === 'Low') mods.F -= 5;

  // Emergency Fund
  if (input.emergencyFund <= 'B') mods.F += 10;
  if (input.emergencyFund >= 'D') mods.F -= 10;

  // Income Stability
  if (input.incomeStability === 'Unstable') {
    mods.E += 5;
    mods.F += 5;
  }
  if (input.incomeStability === 'Very Stable') mods.M += 5;
  if (input.incomeStability === 'Contract/Gig') {
    mods.E += 10;
    mods.F += 5;
  }

  return mods;
}
```

**B. Behavioral Modifiers** (±5 to ±10 points)
```javascript
function applyBehavioralModifiers(input, mods, traumaData) {
  // Discipline
  if (input.discipline >= 8) mods.M += 10;
  if (input.discipline <= 3) mods.M -= 10;

  // Impulse Control
  if (input.impulseControl >= 8) mods.J += 5;
  if (input.impulseControl <= 3) mods.J -= 10;

  // Long-Term Focus
  if (input.longTermFocus >= 8) mods.M += 10;
  if (input.longTermFocus <= 3) mods.M -= 10;

  // Emotional Spending
  if (input.emotionalSpending >= 8) mods.J += 10;
  if (input.emotionalSpending <= 3) mods.J -= 5;

  // Emotional Safety Needs
  if (input.emotionalSafety >= 8) {
    mods.E += 5;
    mods.F += 5;
  }

  // Financial Avoidance
  if (input.financialAvoidance >= 7) {
    mods.M -= 5;
    mods.F += 5;
  }

  // NEW - Tool 1 Integration: FSV Winner
  if (traumaData.tool1Winner === 'FSV') {
    mods.J -= 5;  // Reduce status spending
  }

  // NEW - Tool 2 Integration: Money Avoidance
  if (traumaData.tool2Archetype === 'Money Avoidance') {
    mods.E += 5;
    mods.M -= 5;
  }

  // NEW - Tool 2 Integration: High Showing
  if (traumaData.tool2Showing >= 7) {
    mods.J -= 5;
    mods.F += 5;
  }

  return mods;
}
```

**C. Motivational Modifiers** (±5 to ±10 points)
```javascript
function applyMotivationalModifiers(input, mods) {
  // Lifestyle Priority
  if (input.lifestylePriority >= 8) mods.J += 10;
  if (input.lifestylePriority <= 3) mods.J -= 5;

  // Growth Orientation
  if (input.growthOrientation >= 8) mods.M += 10;

  // Stability Orientation
  if (input.stabilityOrientation >= 8) mods.F += 10;

  // Goal Timeline
  if (input.goalTimeline === '<1 year') mods.F += 10;

  // Dependents
  if (input.dependents === 'Yes') mods.E += 5;

  // Autonomy Preference
  if (input.autonomy >= 8) mods.M += 5;
  if (input.autonomy <= 3) {
    mods.E += 5;
    mods.F += 5;
  }

  // Pre-Retirement
  if (input.stageOfLife === 'Pre-Retirement') {
    mods.M -= 10;
    mods.F += 10;
  }

  // Financial Confidence
  if (input.financialConfidence <= 3) {
    mods.M -= 5;
    mods.E += 5;
    mods.F += 5;
  }

  return mods;
}
```

**D. Trauma-Informed Satisfaction Amplifier**
```javascript
function applySatisfactionAmplifier(mods, satisfaction, traumaData) {
  if (satisfaction < 7) {
    return mods;  // No amplification
  }

  // Check for overwhelm trauma patterns
  if (traumaData.tool1Winner === 'Fear' ||
      traumaData.tool1Winner === 'Control' ||
      traumaData.tool2Archetype === 'Money Vigilance') {

    // OVERWHELMED: Boost stability, don't amplify growth
    mods.E += 10;
    mods.F += 10;
    return mods;
  }

  // MOTIVATED: Amplify positive modifiers by up to 30%
  const satFactor = 1 + Math.min((satisfaction - 5) * 0.1, 0.3);

  Object.keys(mods).forEach(bucket => {
    if (mods[bucket] > 0) {
      mods[bucket] = Math.round(mods[bucket] * satFactor);
    }
  });

  return mods;
}
```

**E. Apply Modifier Caps**
```javascript
function applyModifierCaps(mods) {
  Object.keys(mods).forEach(bucket => {
    mods[bucket] = Math.max(-20, Math.min(mods[bucket], 50));
  });
  return mods;
}
```

**Reference:** `MODIFIERS-SYSTEM-VALIDATION.md` lines 474-598

**Tests:**
- Test each modifier category independently
- Test trauma-informed satisfaction amplifier (overwhelm vs motivation)
- Test modifier caps (ensure max +50, max -20)
- Test complete modifier chain with real student profile

---

#### **Task 1.3: Calculate Recommended Allocation**

**Implementation:**
```javascript
function calculateRecommendedAllocation(priority1, priority2, inputs, traumaData) {
  // Step 1: Base weights from Top 2 priorities
  const base = calculateBaseWeights(priority1, priority2);

  // Step 2: Initialize modifiers
  let mods = { M: 0, E: 0, F: 0, J: 0 };

  // Step 3: Apply all modifier categories
  mods = applyFinancialModifiers(inputs, mods);
  mods = applyBehavioralModifiers(inputs, mods, traumaData);
  mods = applyMotivationalModifiers(inputs, mods);
  mods = applySatisfactionAmplifier(mods, inputs.satisfaction, traumaData);
  mods = applyModifierCaps(mods);

  // Step 4: Calculate raw scores
  const raw = {
    M: base.M + mods.M,
    E: base.E + mods.E,
    F: base.F + mods.F,
    J: base.J + mods.J
  };

  // Step 5: Normalize to 100%
  const total = raw.M + raw.E + raw.F + raw.J;
  const recommended = {
    M: Math.round((raw.M / total) * 100),
    E: Math.round((raw.E / total) * 100),
    F: Math.round((raw.F / total) * 100),
    J: Math.round((raw.J / total) * 100)
  };

  return { recommended, mods, raw };
}
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 1160-1207

**Tests:**
- Test normalization (M + E + F + J = 100%)
- Test with various modifier combinations
- Test edge cases (all positive mods, all negative mods, mixed)

---

#### **Task 1.4: Calculate Adjusted Allocation**

**Implementation:**
```javascript
function calculateAdjustedAllocation(income, actualEssentials, recommended) {
  // Current reality
  const essentialsDollars = actualEssentials;
  const essentialsPercent = Math.round((essentialsDollars / income) * 100);

  // Surplus available for M, F, J
  const surplus = income - essentialsDollars;

  // Distribute surplus according to recommended ratios
  const nonEssentialsTotal = recommended.M + recommended.F + recommended.J;

  const adjusted = {
    M: Math.round((recommended.M / nonEssentialsTotal) * surplus),
    E: essentialsDollars,
    F: Math.round((recommended.F / nonEssentialsTotal) * surplus),
    J: Math.round((recommended.J / nonEssentialsTotal) * surplus)
  };

  // Convert to percentages
  const adjustedPercent = {
    M: Math.round((adjusted.M / income) * 100),
    E: essentialsPercent,
    F: Math.round((adjusted.F / income) * 100),
    J: Math.round((adjusted.J / income) * 100)
  };

  return { adjusted, adjustedPercent };
}
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 289-335

**Tests:**
- Test with various essentials percentages
- Verify surplus distribution maintains recommended ratios
- Test edge case: essentials = 100% of income (no surplus)

---

#### **Task 1.5: Gap Analysis**

**Implementation:**
```javascript
function calculateGap(income, current, target) {
  const gap = {
    essentials: {
      current: current.E,
      target: target.E,
      gap: current.E - target.E,  // Amount to REDUCE
      gapPercent: Math.round(((current.E - target.E) / current.E) * 100)
    },
    freedom: {
      current: current.F,
      target: target.F,
      gap: target.F - current.F,  // Amount to INCREASE
      gapPercent: current.F > 0 ?
        Math.round(((target.F - current.F) / current.F) * 100) : 0
    },
    enjoyment: {
      current: current.J,
      target: target.J,
      gap: target.J - current.J,
      gapPercent: current.J > 0 ?
        Math.round(((target.J - current.J) / current.J) * 100) : 0
    },
    multiply: {
      current: current.M,
      target: target.M,
      gap: target.M - current.M,
      gapPercent: current.M > 0 ?
        Math.round(((target.M - current.M) / current.M) * 100) : 0
    }
  };

  return gap;
}
```

**Reference:** `PROGRESS-PLAN-ALGORITHM.md` lines 23-58

**Tests:**
- Test positive and negative gaps
- Test with zero current values
- Verify percentage calculations

---

#### **Deliverables for Phase 1:**
- ✅ AllocationEngine.js with all calculation functions
- ✅ Unit tests for all functions (80%+ coverage)
- ✅ Test with 20 scenarios from BASE-WEIGHTS-SCENARIO-TESTING.md
- ✅ Validation that all tests produce expected allocations

---

### Phase 2: Progressive Unlock & Priority Selection

**Goal:** Implement priority unlock logic and recommendation engine.

**Duration:** 2 weeks

**Dependencies:** Phase 1 complete

**Key Documents:**
- `TOOL4-PROGRESSIVE-UNLOCK-MODEL.md`
- `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 5)

---

#### **Task 2.1: Surplus Calculation**

**Implementation:**
```javascript
function calculateSurplus(income, essentials) {
  return income - essentials;
}

// Surplus thresholds for unlock
const SURPLUS_THRESHOLDS = {
  'Stabilize to Survive': 0,
  'Reclaim Financial Control': 0,
  'Get Out of Debt': 200,
  'Feel Financially Secure': 300,
  'Create Life Balance': 500,
  'Build/Stabilize Business': 0,  // Self-reported
  'Save for a Big Goal': 500,
  'Build Long-Term Wealth': 800,
  'Enjoy Life Now': 1000,
  'Create Generational Wealth': 2000
};
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 888-950

**Tests:**
- Calculate surplus for various income/essentials combinations
- Verify thresholds match specification

---

#### **Task 2.2: Unlock Requirements**

**Implementation:**
```javascript
function checkUnlockRequirements(priority, financialData) {
  const {
    surplus,
    emergencyFundMonths,
    debtAmount,
    income,
    essentials,
    isBusinessOwner
  } = financialData;

  const requirements = {
    'Stabilize to Survive': () => true,  // Always available

    'Reclaim Financial Control': () => true,  // Always available

    'Get Out of Debt': () =>
      debtAmount > 5000 && surplus >= 200,

    'Feel Financially Secure': () =>
      emergencyFundMonths >= 1 &&
      essentials <= income * 0.6 &&
      surplus >= 300,

    'Create Life Balance': () =>
      emergencyFundMonths >= 2 &&
      debtAmount < income * 12 * 3 &&  // Debt < 3x annual income
      essentials <= income * 0.5 &&
      surplus >= 500,

    'Build/Stabilize Business': () =>
      isBusinessOwner === true,

    'Save for a Big Goal': () =>
      emergencyFundMonths >= 3 &&
      debtAmount < income * 12 * 3 &&
      surplus >= 500,

    'Build Long-Term Wealth': () =>
      emergencyFundMonths >= 6 &&
      debtAmount < income * 12 * 2 &&
      surplus >= 800,

    'Enjoy Life Now': () =>
      emergencyFundMonths >= 3 &&
      debtAmount < income * 12 * 2 &&
      essentials <= income * 0.35 &&
      surplus >= 1000,

    'Create Generational Wealth': () =>
      emergencyFundMonths >= 12 &&
      debtAmount === 0 &&
      surplus >= 2000
  };

  return requirements[priority]();
}

function getAvailablePriorities(financialData) {
  return Object.keys(PRIORITIES).filter(priority =>
    checkUnlockRequirements(priority, financialData)
  );
}
```

**Reference:** `TOOL4-PROGRESSIVE-UNLOCK-MODEL.md` lines 40-433

**Tests:**
- Test each priority's unlock logic with edge cases
- Test scenarios where 0, 3, 5, 10 priorities unlock
- Verify "Stabilize to Survive" and "Reclaim Control" always available

---

#### **Task 2.3: Recommendation Engine**

**Implementation:**
```javascript
function recommendPriority(financialData, traumaData) {
  const {
    emergencyFundMonths,
    debtAmount,
    income,
    surplus,
    interestRate,
    essentials
  } = financialData;

  const available = getAvailablePriorities(financialData);

  // Priority 1: Trauma patterns override
  if (traumaData.tool1Winner === 'Fear' ||
      traumaData.tool1Winner === 'Control' ||
      traumaData.tool2Archetype === 'Money Vigilance' ||
      traumaData.satisfaction >= 7) {
    if (available.includes('Reclaim Financial Control')) {
      return {
        priority: 'Reclaim Financial Control',
        reason: 'Trauma pattern detected - focus on regaining control and stability'
      };
    }
  }

  // Priority 2: Crisis mode
  if (emergencyFundMonths < 1 && surplus < 500) {
    return {
      priority: 'Stabilize to Survive',
      reason: 'Emergency fund < 1 month and limited surplus - focus on stability first'
    };
  }

  // Priority 3: High-interest debt
  if (debtAmount > income * 12 * 6 &&
      interestRate === 'High' &&
      emergencyFundMonths >= 1) {
    if (available.includes('Get Out of Debt')) {
      return {
        priority: 'Get Out of Debt',
        reason: 'High debt with high interest rates - prioritize aggressive payoff'
      };
    }
  }

  // Priority 4: Building emergency fund
  if (emergencyFundMonths >= 1 &&
      emergencyFundMonths < 3 &&
      debtAmount < income * 12 * 4) {
    if (available.includes('Feel Financially Secure')) {
      return {
        priority: 'Feel Financially Secure',
        reason: 'Build emergency fund to 3-6 months for financial security'
      };
    }
  }

  // Priority 5: Wealth building (if qualified)
  if (emergencyFundMonths >= 6 &&
      debtAmount === 0 &&
      surplus >= 1200) {
    if (available.includes('Build Long-Term Wealth')) {
      return {
        priority: 'Build Long-Term Wealth',
        reason: 'Strong foundation in place - focus on long-term wealth building'
      };
    }
  }

  // Priority 6: Generational wealth (if qualified)
  if (surplus >= 3000 &&
      emergencyFundMonths >= 12 &&
      debtAmount === 0) {
    if (available.includes('Create Generational Wealth')) {
      return {
        priority: 'Create Generational Wealth',
        reason: 'Exceptional financial position - build legacy wealth'
      };
    }
  }

  // Default: Return first available priority
  return {
    priority: available[0],
    reason: 'Starting with foundational priority based on your current situation'
  };
}
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (recommendation triggers throughout Section 4)

**Tests:**
- Test recommendation logic with various financial scenarios
- Verify trauma patterns override default recommendations
- Test all 10 priorities can be recommended in appropriate scenarios

---

#### **Task 2.4: Unlock Display UI**

**Implementation:**
```html
<div class="priority-selection">
  <h3>Your Available Priorities</h3>

  <!-- Recommended Priority -->
  <div class="recommended-priority">
    <span class="badge">RECOMMENDED</span>
    <h4>Feel Financially Secure</h4>
    <p>Why: You have 0.74 months emergency fund. Building to 3 months should be priority.</p>
    <button>Use This Recommendation</button>
  </div>

  <!-- Available Priorities -->
  <div class="available-priorities">
    <select id="priority1">
      <option selected>Feel Financially Secure</option>
      <option>Stabilize to Survive</option>
      <option>Reclaim Financial Control</option>
      <option>Get Out of Debt</option>
      <option>Save for a Big Goal</option>
    </select>

    <select id="priority2">
      <option>Get Out of Debt</option>
      <option>Feel Financially Secure</option>
      <option>Stabilize to Survive</option>
    </select>
  </div>

  <!-- Locked Priorities -->
  <div class="locked-priorities">
    <h4>Locked Priorities</h4>
    <div class="locked-item">
      <span>🔒 Build Long-Term Wealth</span>
      <p>Need: $800 surplus ✅ + 6mo emergency fund ❌</p>
      <p>Progress: 12% complete ($2,000 / $16,200)</p>
    </div>
    <div class="locked-item">
      <span>🔒 Create Generational Wealth</span>
      <p>Need: $2,000 surplus ❌ + 12mo emergency fund ❌ + $0 debt ❌</p>
      <p>Progress: 6% complete</p>
    </div>
  </div>
</div>
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 199-274

**Tests:**
- UI displays correct available/locked priorities
- Locked priorities show progress toward unlock
- Recommended priority is highlighted

---

#### **Deliverables for Phase 2:**
- ✅ Unlock logic implemented and tested
- ✅ Recommendation engine working
- ✅ Priority selection UI complete
- ✅ Test with 10+ financial scenarios

---

### Phase 3: Hybrid Allocation UX & Progress Tracking

**Goal:** Implement 3-path choice and progress plan generation.

**Duration:** 3 weeks

**Dependencies:** Phases 1 & 2 complete

**Key Documents:**
- `PROGRESS-PLAN-ALGORITHM.md`
- `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` (Section 3, 6)

---

#### **Task 3.1: Display Both Allocations**

**Implementation:**
```html
<div class="allocation-display">
  <h3>Your Allocation</h3>

  <!-- Recommended -->
  <div class="allocation-section recommended">
    <h4>📊 RECOMMENDED (Your Target)</h4>
    <p>Based on "Feel Financially Secure" priority</p>
    <div class="buckets">
      <div class="bucket">
        <span class="label">M (Multiply)</span>
        <span class="value">25% = $1,250/month</span>
      </div>
      <div class="bucket">
        <span class="label">E (Essentials)</span>
        <span class="value">35% = $1,750/month</span>
      </div>
      <div class="bucket">
        <span class="label">F (Freedom)</span>
        <span class="value">30% = $1,500/month</span>
      </div>
      <div class="bucket">
        <span class="label">J (Enjoyment)</span>
        <span class="value">10% = $500/month</span>
      </div>
    </div>
  </div>

  <!-- Current Reality -->
  <div class="allocation-section current">
    <h4>⚠️ YOUR CURRENT REALITY</h4>
    <p>Income: $5,000</p>
    <p>Essentials: $2,700 (you report)</p>
    <p>Surplus: $2,300 available</p>
  </div>

  <!-- Gap Analysis -->
  <div class="allocation-section gap">
    <h4>💡 GAP ANALYSIS</h4>
    <ul>
      <li>Essentials: $950 OVER recommended</li>
      <li>Freedom: Can fund recommended ✅</li>
      <li>Multiply: Can fund recommended ✅</li>
    </ul>
  </div>

  <!-- Adjusted -->
  <div class="allocation-section adjusted">
    <h4>✏️ ADJUSTED FOR YOUR SITUATION</h4>
    <p>(What you can execute TODAY)</p>
    <div class="buckets">
      <div class="bucket">
        <span class="label">M</span>
        <span class="value">25% = $1,250/month ✅</span>
      </div>
      <div class="bucket warning">
        <span class="label">E</span>
        <span class="value">54% = $2,700/month (your current spending)</span>
      </div>
      <div class="bucket">
        <span class="label">F</span>
        <span class="value">15% = $750/month (reduced from $1,500)</span>
      </div>
      <div class="bucket">
        <span class="label">J</span>
        <span class="value">6% = $300/month (reduced from $500)</span>
      </div>
    </div>
  </div>

  <!-- To Reach Recommended -->
  <div class="allocation-section action">
    <h4>💡 TO REACH RECOMMENDED</h4>
    <p>→ Reduce essentials by $950/month</p>
    <p>(Tool 2 suggests: Subscriptions, Dining out)</p>
    <p>→ This frees up $950 for Freedom + Enjoyment</p>
  </div>
</div>
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 289-335

---

#### **Task 3.2: 3-Path Choice UI**

**Implementation:**
```html
<div class="path-selection">
  <h3>Choose Your Path Forward</h3>

  <!-- Path 1: Optimize Now -->
  <div class="path-option">
    <h4>[1] OPTIMIZE TO MEET RECOMMENDED ⭐</h4>
    <p>Adjust your essentials now to match target:</p>
    <div class="interactive-slider">
      <label>Essentials: <input type="range" min="1750" max="2700" value="2700"></label>
      <span class="value">$2,700 → $1,750</span>
    </div>

    <div class="suggestions">
      <h5>💡 Tool 2 suggests cutting:</h5>
      <ul>
        <li>Subscriptions you don't use: ~$150/month</li>
        <li>Reduce dining out 50%: ~$400/month</li>
        <li>Shop sales for groceries: ~$200/month</li>
        <li>Cancel unused gym membership: ~$50/month</li>
        <li>Switch to generic brands: ~$150/month</li>
        <li><strong>Total savings: ~$950/month ✅</strong></li>
      </ul>
    </div>

    <p>New allocation after optimization:</p>
    <p>M: $1,250, E: $1,750, F: $1,500, J: $500 ✅</p>

    <button class="primary">Use This Plan - Optimize Now</button>
  </div>

  <!-- Path 2: Gradual Progress -->
  <div class="path-option recommended">
    <h4>[2] START WITH ADJUSTED, IMPROVE GRADUALLY ⭐⭐</h4>
    <p>Use a realistic plan based on your current spending, then improve month-by-month:</p>

    <div class="milestones">
      <div class="milestone">
        <h5>MONTH 1 (Starting Today):</h5>
        <p>M: $1,250, E: $2,700, F: $750, J: $300</p>
        <p>Action: Track all spending, identify waste</p>
      </div>

      <div class="milestone">
        <h5>MONTH 2 (30 days):</h5>
        <p>M: $1,250, E: $2,400, F: $1,050, J: $300</p>
        <p>Goal: Cut $300/month from essentials</p>
        <p>Focus: Cancel subscriptions, reduce dining</p>
      </div>

      <div class="milestone">
        <h5>MONTH 3 (60 days):</h5>
        <p>M: $1,250, E: $2,000, F: $1,350, J: $400</p>
        <p>Goal: Cut another $400/month</p>
        <p>Focus: Shop smarter, generic brands</p>
      </div>

      <div class="milestone">
        <h5>MONTH 4+ (90 days):</h5>
        <p>M: $1,250, E: $1,750, F: $1,500, J: $500 ✅</p>
        <p>Goal: Reach recommended allocation!</p>
      </div>
    </div>

    <p>📊 We'll track your progress and prompt you to update your allocation monthly.</p>

    <button class="primary">Use Gradual Plan - Start Realistic</button>
  </div>

  <!-- Path 3: Different Priority -->
  <div class="path-option">
    <h4>[3] CHOOSE A DIFFERENT PRIORITY</h4>
    <p>"Feel Financially Secure" doesn't fit your current situation well.</p>

    <p>Try one of these instead:</p>
    <ul>
      <li><strong>"Get Out of Debt"</strong> (better fit) ✅<br>
        Focus: Pay down $15K debt aggressively<br>
        Works with your $2,300 surplus</li>
      <li><strong>"Stabilize to Survive"</strong><br>
        Focus: Cover essentials + build basic buffer<br>
        If current spending feels essential</li>
    </ul>

    <button>View Other Available Priorities</button>
  </div>
</div>
```

**Reference:** `TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` lines 340-450

---

#### **Task 3.3: Progress Plan Generation**

**Implementation:**
```javascript
function generateProgressPlan(current, target, income, priority) {
  // Step 1: Calculate gap
  const gap = calculateGap(income, current, target);

  // Step 2: Determine timeline (2-6 months based on gap size)
  const totalReduction = Math.abs(gap.essentials.gap);
  let months;

  if (totalReduction < 300) months = 2;
  else if (totalReduction < 600) months = 3;
  else if (totalReduction < 1000) months = 4;
  else if (totalReduction < 1500) months = 5;
  else months = 6;

  // Step 3: Calculate monthly reductions (progressive)
  const baseReduction = totalReduction / months;
  const progressionFactors = [0.7, 1.0, 1.1, 1.2, 1.3, 1.4];
  const reductions = [];

  for (let i = 0; i < months; i++) {
    const factor = progressionFactors[i] || 1.0;
    reductions.push(Math.round(baseReduction * factor));
  }

  // Adjust final month to hit exact target
  const totalPlanned = reductions.reduce((a, b) => a + b, 0);
  reductions[reductions.length - 1] += (totalReduction - totalPlanned);

  // Step 4: Generate milestones
  const milestones = [];
  let runningEssentials = current.E_dollars;

  const focusAreas = {
    1: {
      focus: "Identify and Eliminate Waste",
      actions: [
        "Track all spending for 30 days",
        "Cancel unused subscriptions",
        "Identify impulse purchases",
        "Find one area to optimize"
      ],
      difficulty: "Easy"
    },
    2: {
      focus: "Optimize Daily Habits",
      actions: [
        "Reduce dining out by 50%",
        "Switch to generic brands for groceries",
        "Batch cook meals for the week",
        "Find free/low-cost entertainment"
      ],
      difficulty: "Moderate"
    },
    3: {
      focus: "Negotiate and Shop Smart",
      actions: [
        "Negotiate bills (internet, phone, insurance)",
        "Shop for better rates on utilities",
        "Use coupons and cashback apps",
        "Review and optimize transportation costs"
      ],
      difficulty: "Moderate"
    },
    4: {
      focus: "Lifestyle Adjustments",
      actions: [
        "Consider roommate or housing downgrade if needed",
        "Evaluate car vs. public transit costs",
        "Cut remaining non-essential spending",
        "Optimize insurance coverage"
      ],
      difficulty: "Challenging"
    },
    5: {
      focus: "Final Optimizations",
      actions: [
        "Review all categories for remaining cuts",
        "Make final lifestyle adjustments",
        "Lock in new spending habits",
        "Celebrate progress!"
      ],
      difficulty: "Moderate"
    },
    6: {
      focus: "Reach Target and Maintain",
      actions: [
        "Execute final cuts to reach target",
        "Set up automatic transfers for F bucket",
        "Build accountability system",
        "Plan for long-term maintenance"
      ],
      difficulty: "Easy"
    }
  };

  for (let month = 1; month <= months; month++) {
    runningEssentials -= reductions[month - 1];

    const freedMoney = current.E_dollars - runningEssentials;
    const freedToF = Math.round(freedMoney *
      (gap.freedom.gap / (gap.freedom.gap + gap.enjoyment.gap)));
    const freedToJ = freedMoney - freedToF;

    const focus = focusAreas[month] || focusAreas[months];

    milestones.push({
      month: month,
      target: {
        M: current.M_dollars,
        E: Math.round(runningEssentials),
        F: Math.round(current.F_dollars + freedToF),
        J: Math.round(current.J_dollars + freedToJ)
      },
      changes: {
        essentials_reduction: reductions[month - 1],
        freedom_increase: Math.round(freedToF / month),
        enjoyment_increase: Math.round(freedToJ / month)
      },
      focus: focus.focus,
      actions: focus.actions,
      difficulty: focus.difficulty,
      progress: {
        percentComplete: Math.round((month / months) * 100),
        remainingGap: Math.round(target.E_dollars - runningEssentials)
      }
    });
  }

  return {
    summary: {
      startDate: new Date().toISOString().split('T')[0],
      timeline: months + ' months',
      totalReduction: totalReduction,
      startingEssentials: current.E_dollars,
      targetEssentials: target.E_dollars
    },
    gap: gap,
    milestones: milestones
  };
}
```

**Reference:** `PROGRESS-PLAN-ALGORITHM.md` lines 77-332

**Tests:**
- Test timeline calculation for various gap sizes
- Test progressive reduction strategy
- Test milestone generation
- Verify sum of reductions = total gap

---

#### **Task 3.4: Progress Tracking & Updates**

**Implementation:**
```javascript
function shouldPromptUpdate(milestone, lastUpdateDate) {
  const daysSinceUpdate = getDaysSince(lastUpdateDate);
  const daysInMonth = 30;

  // Trigger 1: Time-based (every 30 days)
  if (daysSinceUpdate >= daysInMonth) {
    return {
      trigger: "time",
      message: "It's been 30 days! Time to update your progress.",
      urgency: "normal"
    };
  }

  // Trigger 2: Approaching milestone date
  const daysUntilMilestone = getDaysUntil(milestone.dueDate);
  if (daysUntilMilestone <= 7 && daysUntilMilestone > 0) {
    return {
      trigger: "milestone_approaching",
      message: "You're 1 week away from Month " + milestone.month + " target. How's it going?",
      urgency: "normal"
    };
  }

  // Trigger 3: Overdue milestone
  if (daysUntilMilestone < 0) {
    return {
      trigger: "milestone_overdue",
      message: "Month " + milestone.month + " target has passed. Let's check in and adjust if needed.",
      urgency: "high"
    };
  }

  return null;
}

function handleProgressUpdate(studentResponse, milestone, progressPlan) {
  const {
    actualEssentials,
    hitTarget,
    challenges,
    confidenceNextMonth
  } = studentResponse;

  const variance = actualEssentials - milestone.target.E;

  if (hitTarget === "Yes" || Math.abs(variance) < 50) {
    // SUCCESS - Move to next milestone
    return {
      status: "success",
      message: "Great job! You hit your target. Let's move to Month " + (milestone.month + 1),
      action: "advance_milestone"
    };

  } else if (variance > 0 && variance <= 200) {
    // CLOSE - Keep same target, try again
    return {
      status: "close",
      message: "You're close! You were $" + variance + " over target. Let's refine and try again this month.",
      action: "retry_milestone"
    };

  } else if (variance > 200) {
    // STRUGGLING - Adjust plan
    const newTimeline = getRemainingMilestones().length + 1;
    return {
      status: "struggling",
      message: "It looks like this target was too aggressive. Let's add an extra month to make it more achievable.",
      action: "adjust_plan",
      newTimeline: newTimeline
    };
  }
}
```

**Reference:** `PROGRESS-PLAN-ALGORITHM.md` lines 400-708

**Tests:**
- Test update prompt triggers (time, milestone, overdue)
- Test progress evaluation logic
- Test plan adjustment algorithm

---

#### **Deliverables for Phase 3:**
- ✅ Both allocations display (recommended + adjusted)
- ✅ 3-path choice UI complete
- ✅ Progress plan generation working
- ✅ Progress tracking & update prompts implemented
- ✅ Test with various gap sizes and timelines

---

### Phase 4: Testing & Validation

**Goal:** Comprehensive testing with all 20 validated scenarios.

**Duration:** 1-2 weeks

**Dependencies:** Phases 1-3 complete

**Key Documents:**
- `BASE-WEIGHTS-SCENARIO-TESTING.md`

---

#### **Task 4.1: Automated Test Suite**

**Implementation:**
```javascript
// Test runner for 20 scenarios
function runScenarioTests() {
  const scenarios = loadScenariosFromDocs();  // From BASE-WEIGHTS-SCENARIO-TESTING.md
  const results = [];

  scenarios.forEach((scenario, index) => {
    const result = testScenario(scenario);
    results.push({
      scenarioNumber: index + 1,
      name: scenario.name,
      priority: scenario.priority,
      passed: result.passed,
      expected: result.expected,
      actual: result.actual,
      variance: result.variance
    });
  });

  return results;
}

function testScenario(scenario) {
  // Run allocation calculation
  const allocation = calculateRecommendedAllocation(
    scenario.priority,
    scenario.priority2 || scenario.priority,  // Use same if no second
    scenario.inputs,
    scenario.traumaData || {}
  );

  // Compare with expected from documentation
  const expected = scenario.expectedAllocation;
  const variance = {
    M: Math.abs(allocation.recommended.M - expected.M),
    E: Math.abs(allocation.recommended.E - expected.E),
    F: Math.abs(allocation.recommended.F - expected.F),
    J: Math.abs(allocation.recommended.J - expected.J)
  };

  // Pass if variance <= 2% (rounding tolerance)
  const passed = variance.M <= 2 && variance.E <= 2 &&
                 variance.F <= 2 && variance.J <= 2;

  return { passed, expected, actual: allocation.recommended, variance };
}
```

**Reference:** `BASE-WEIGHTS-SCENARIO-TESTING.md` (all 20 scenarios lines 27-767)

**Tests:**
- All 20 scenarios from documentation
- Verify allocations match expected values (±2% tolerance)
- Document any failures with rationale

---

#### **Task 4.2: Edge Case Testing**

**Test Cases:**
1. **Zero surplus scenario:**
   - Income: $3,000, Essentials: $3,000
   - Expected: All priorities locked except crisis mode

2. **Maximum modifiers scenario:**
   - All positive modifiers (+50 cap)
   - All negative modifiers (-20 cap)

3. **Trauma overwhelm scenario:**
   - High satisfaction (8+) + Fear/Control winner
   - Expected: E+F boost, no growth amplification

4. **All priorities unlocked:**
   - Income: $20,000, Essentials: $4,000, 12mo emergency fund, $0 debt
   - Expected: All 10 priorities available

5. **Progress plan edge cases:**
   - Gap < $100 (should be 2-month plan)
   - Gap > $2,000 (should be 6-month plan)

**Tests:**
- Verify edge cases don't break system
- Check for divide-by-zero errors
- Validate UI displays edge cases gracefully

---

#### **Task 4.3: Integration Testing**

**Test Flows:**
1. **Complete user journey:**
   - Enter Client ID → See Tool 1/2/3 insights
   - View available priorities → Select Top 2
   - See recommended + adjusted allocations
   - Choose Path 2 (Gradual)
   - View 4-month progress plan
   - Save scenario
   - Compare 2 scenarios

2. **Tool 1/2/3 integration:**
   - Verify trauma data pulls correctly
   - Verify modifiers apply based on trauma
   - Verify recommendations change with trauma patterns

3. **Data persistence:**
   - Save scenario → Reload → Verify data intact
   - Mark scenario as optimal → Verify flag set
   - Delete scenario → Verify removal

**Tests:**
- End-to-end user flows
- Integration with existing FTP-v3 framework
- Data storage and retrieval

---

#### **Task 4.4: Performance Testing**

**Metrics:**
- Page load time: < 2 seconds
- Allocation calculation: < 100ms
- Progress plan generation: < 200ms
- Scenario save: < 500ms
- GPT API call: < 3 seconds (acceptable for enhancement, not blocking)

**Tests:**
- Measure performance with browser dev tools
- Optimize slow functions
- Consider caching for repeated calculations

---

#### **Deliverables for Phase 4:**
- ✅ All 20 scenarios pass automated tests
- ✅ Edge cases handled gracefully
- ✅ Integration tests pass
- ✅ Performance meets targets
- ✅ Bug-free, production-ready code

---

## 5. Key Numbers Reference

### 5.1 All 10 Priorities - VALIDATED Base Weights

| Priority | M | E | F | J | Updated? |
|----------|---|---|---|---|----------|
| Stabilize to Survive | 5% | 60% | 30% | 5% | ✅ 11/18/25 |
| Reclaim Financial Control | 10% | 45% | 35% | 10% | ✅ 11/18/25 |
| Get Out of Debt | 15% | 35% | 40% | 10% | ✅ 11/18/25 |
| Feel Financially Secure | 25% | 35% | 30% | 10% | No change |
| Create Life Balance | 15% | 25% | 25% | 35% | No change |
| Build/Stabilize Business | 20% | 30% | 35% | 15% | No change |
| Save for a Big Goal | 25% | 25% | 40% | 10% | No change |
| Build Long-Term Wealth | 40% | 25% | 20% | 15% | No change |
| Enjoy Life Now | 20% | 20% | 15% | 45% | No change |
| Create Generational Wealth | 50% | 20% | 20% | 10% | No change |

**Note:** 3 priorities adjusted based on 20-scenario validation testing.

### 5.2 Unlock Thresholds Summary

| Priority | Min Surplus | Emergency Fund | Debt Limit | Other |
|----------|------------|----------------|------------|-------|
| Stabilize to Survive | $0 | None | Any | Always available |
| Reclaim Financial Control | $0 | None | Any | Always available |
| Get Out of Debt | $200 | None | > $5K debt | Must have debt |
| Feel Financially Secure | $300 | ≥ 1 month | Any | E ≤ 60% income |
| Create Life Balance | $500 | ≥ 2 months | < 3x annual income | E ≤ 50% income |
| Build/Stabilize Business | $0 | None | Any | Business owner |
| Save for a Big Goal | $500 | ≥ 3 months | < 3x annual income | - |
| Build Long-Term Wealth | $800 | ≥ 6 months | < 2x annual income | - |
| Enjoy Life Now | $1,000 | ≥ 3 months | < 2x annual income | E ≤ 35% income |
| Create Generational Wealth | $2,000 | ≥ 12 months | $0 (debt-free) | - |

### 5.3 Modifier Counts

**Financial Modifiers:** 6 categories
- Income Level, Debt Load, Interest Rate, Emergency Fund, Income Stability, Contract/Gig

**Behavioral Modifiers:** 9 categories (6 legacy + 3 NEW)
- Discipline, Impulse Control, Long-Term Focus, Emotional Spending, Emotional Safety, Financial Avoidance
- **NEW:** FSV Winner, Money Avoidance, High Showing

**Motivational Modifiers:** 8 categories
- Lifestyle Priority, Growth Orientation, Stability Orientation, Goal Timeline, Dependents, Autonomy, Pre-Retirement, Financial Confidence

**Trauma-Informed:** Satisfaction Amplifier (1 special modifier)

**Total:** 29 modifiers + 1 amplifier

**Caps:** Max +50 positive, Max -20 negative

### 5.4 Progress Plan Metrics

**Timeline Calculation:**
- < $300 gap: 2 months
- $300-$600 gap: 3 months
- $600-$1,000 gap: 4 months
- $1,000-$1,500 gap: 5 months
- > $1,500 gap: 6 months

**Progressive Reduction Factors:**
- Month 1: 70% of base (easy wins)
- Month 2: 100% of base (build momentum)
- Month 3: 110% of base (increase effort)
- Month 4: 120% of base (push harder)
- Month 5: 130% of base (final stretch)
- Month 6: 140% of base (reach target)

**Update Triggers:**
- Time-based: Every 30 days
- Milestone-based: 7 days before milestone
- Overdue: When milestone date passed

### 5.5 Quick Reference Card

**Top 2 Priority Weighting:**
- Priority 1: 70%
- Priority 2: 30%

**Hybrid Allocation:**
- Recommended: Based on priority + modifiers
- Adjusted: Based on current essentials spending
- Gap: Recommended - Adjusted

**3 Paths:**
1. Optimize Now (immediate adjustment)
2. Gradual Progress (30-90 days) ← Most students
3. Different Priority (choose better fit)

**Data Storage:**
- RESPONSES sheet: Framework data, optimal scenario flag
- TOOL4_SCENARIOS sheet: Detailed scenario history (last 10)

---

## 6. Data Flow & Architecture

### 6.1 System Components Overview

```
┌────────────────────────────────────────────────────────────┐
│                    User Interface (HTML/JS)                 │
│  • Client ID Gate                                          │
│  • Priority Selection UI                                   │
│  • Allocation Display (Recommended + Adjusted)             │
│  • 3-Path Choice                                           │
│  • Progress Plan View                                      │
│  • Scenario Management (Save/Load/Compare)                 │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│            Client-Side Calculation Engine (JS)              │
│  • calculateBaseWeights()                                  │
│  • applyModifiers()                                        │
│  • calculateRecommendedAllocation()                        │
│  • calculateAdjustedAllocation()                           │
│  • calculateGap()                                          │
│  • generateProgressPlan()                                  │
│  • checkUnlockRequirements()                               │
│  • recommendPriority()                                     │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│          Server-Side Functions (Apps Script)                │
│  • lookupStudentById()                                     │
│  • getToolInsights() [Tools 1/2/3 data]                    │
│  • saveScenario()                                          │
│  • getUserScenarios()                                      │
│  • setOptimalScenario()                                    │
│  • generateGPTGuidance() [Optional enhancement]            │
│  • generateScenarioPDF()                                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│                    Data Storage (Sheets)                    │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ RESPONSES Sheet  │  │ TOOL4_SCENARIOS  │              │
│  │ • Tool status    │  │ • Full history   │              │
│  │ • Optimal scene. │  │ • Last 10 scenes │              │
│  │ • Is_Latest      │  │ • Timestamps     │              │
│  └──────────────────┘  └──────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Function Call Flow

**User Journey: Priority Selection → Allocation → Progress Plan**

```
1. User enters Client ID
   └→ lookupStudentById(clientId)
       ├→ Returns: name, email, status
       └→ getToolInsights(clientId, ['tool1', 'tool2', 'tool3'])
           └→ Returns: trauma patterns, archetypes, scores

2. User enters financial data
   └→ Client-side: checkUnlockRequirements(allPriorities, financialData)
       ├→ Returns: availablePriorities[]
       └→ recommendPriority(financialData, traumaData)
           └→ Returns: recommendedPriority + reason

3. User selects Top 2 priorities
   └→ Client-side: calculateBaseWeights(priority1, priority2)
       └→ Returns: { M: X%, E: Y%, F: Z%, J: W% }

4. User enters behavioral inputs
   └→ Client-side: applyModifiers(inputs, traumaData)
       ├→ applyFinancialModifiers()
       ├→ applyBehavioralModifiers()
       ├→ applyMotivationalModifiers()
       └→ applySatisfactionAmplifier()

5. Calculate allocations
   └→ Client-side: calculateRecommendedAllocation()
       └→ Returns: { M: X%, E: Y%, F: Z%, J: W% }

   └→ Client-side: calculateAdjustedAllocation()
       └→ Returns: { M: X%, E: Y%, F: Z%, J: W% }

   └→ Client-side: calculateGap()
       └→ Returns: { essentials: -$950, freedom: +$750, ... }

6. User chooses Path 2 (Gradual)
   └→ Client-side: generateProgressPlan(current, target, income, priority)
       └→ Returns: { summary, gap, milestones[] }

7. User saves scenario
   └→ saveScenario(clientId, scenarioData)
       ├→ Writes to TOOL4_SCENARIOS sheet
       └→ Updates RESPONSES sheet (optional flag)

8. User marks as optimal
   └→ setOptimalScenario(clientId, scenarioId)
       └→ Updates RESPONSES.TOOL4_OPTIMAL_SCENARIO
```

### 6.3 Integration Points

**Tool 1/2/3 Data Pull:**
```javascript
// Server-side function
function getToolInsights(clientId, toolIds) {
  const responseSheet = getResponsesSheet();
  const row = findRowByClientId(clientId);

  const insights = {};

  if (toolIds.includes('tool1')) {
    insights.tool1 = {
      winner: row.TOOL1_WINNER,
      fsv: row.TOOL1_FSV_SCORE,
      fear: row.TOOL1_FEAR_SCORE,
      control: row.TOOL1_CONTROL_SCORE,
      grounding: row.TOOL1_GROUNDING_SCORE
    };
  }

  if (toolIds.includes('tool2')) {
    insights.tool2 = {
      archetype: row.TOOL2_ARCHETYPE,
      showing: row.TOOL2_SHOWING_SCORE,
      spendingClarity: row.TOOL2_SPENDING_CLARITY,
      wastefulSpending: row.TOOL2_WASTEFUL_SPENDING
    };
  }

  if (toolIds.includes('tool3')) {
    insights.tool3 = {
      overallQuotient: row.TOOL3_OVERALL_QUOTIENT,
      domains: row.TOOL3_DOMAIN_SCORES
    };
  }

  return insights;
}
```

**Scenario Save/Load:**
```javascript
// Save scenario
function saveScenario(clientId, scenarioData) {
  const sheet = getScenariosSheet();

  // Get last 10 scenarios for this client
  const existing = getUserScenarios(clientId, 10);

  // If 10 scenarios exist, remove oldest
  if (existing.length >= 10) {
    deleteOldestScenario(clientId);
  }

  // Add new scenario
  const row = {
    clientId: clientId,
    scenarioId: generateUniqueId(),
    timestamp: new Date(),
    priority1: scenarioData.priority1,
    priority2: scenarioData.priority2,
    recommended: JSON.stringify(scenarioData.recommended),
    adjusted: JSON.stringify(scenarioData.adjusted),
    gap: JSON.stringify(scenarioData.gap),
    progressPlan: JSON.stringify(scenarioData.progressPlan),
    isOptimal: false
  };

  sheet.appendRow(Object.values(row));

  return row.scenarioId;
}

// Load scenarios
function getUserScenarios(clientId, limit = 10) {
  const sheet = getScenariosSheet();
  const data = sheet.getDataRange().getValues();

  return data
    .filter(row => row[0] === clientId)
    .sort((a, b) => b[2] - a[2])  // Sort by timestamp desc
    .slice(0, limit)
    .map(row => parseScenarioRow(row));
}
```

### 6.4 Data Models

**RESPONSES Sheet (Framework):**
```
Columns:
- CLIENT_ID
- FIRST_NAME
- LAST_NAME
- EMAIL
- TOOL1_STATUS
- TOOL1_WINNER
- TOOL1_FSV_SCORE
- TOOL1_FEAR_SCORE
- TOOL1_CONTROL_SCORE
- TOOL2_STATUS
- TOOL2_ARCHETYPE
- TOOL2_SHOWING_SCORE
- TOOL2_SPENDING_CLARITY
- TOOL3_STATUS
- TOOL3_OVERALL_QUOTIENT
- TOOL4_STATUS
- TOOL4_OPTIMAL_SCENARIO  ← Scenario ID
- TOOL4_LAST_UPDATED
```

**TOOL4_SCENARIOS Sheet (Detailed):**
```
Columns:
- CLIENT_ID
- SCENARIO_ID
- TIMESTAMP
- PRIORITY_1
- PRIORITY_2
- RECOMMENDED_M
- RECOMMENDED_E
- RECOMMENDED_F
- RECOMMENDED_J
- ADJUSTED_M
- ADJUSTED_E
- ADJUSTED_F
- ADJUSTED_J
- GAP_JSON  ← JSON string with gap details
- PROGRESS_PLAN_JSON  ← JSON string with milestones
- IS_OPTIMAL  ← Boolean flag
- NOTES  ← User notes
```

---

## 7. Testing Strategy

### 7.1 Unit Testing (Phase 1)

**Test Coverage Target:** 80%+

**Core Functions to Test:**
1. `calculateBaseWeights(priority1, priority2)`
   - Test all 10 priorities
   - Test Top 2 combinations
   - Test 70%/30% weighting

2. `applyFinancialModifiers(inputs, mods)`
   - Test each financial modifier independently
   - Test modifier combinations
   - Test edge cases (all A's, all E's)

3. `applyBehavioralModifiers(inputs, mods, traumaData)`
   - Test legacy modifiers
   - Test NEW trauma modifiers (FSV, Money Avoidance, Showing)
   - Test trauma integration

4. `applyMotivationalModifiers(inputs, mods)`
   - Test all motivational modifiers
   - Test combinations

5. `applySatisfactionAmplifier(mods, satisfaction, traumaData)`
   - Test overwhelm detection (Fear/Control + high satisfaction)
   - Test motivation amplification (other patterns + high satisfaction)
   - Test no amplification (low satisfaction)

6. `applyModifierCaps(mods)`
   - Test max positive (+50)
   - Test max negative (-20)
   - Test mixed scenarios

7. `calculateRecommendedAllocation()`
   - Test complete allocation pipeline
   - Test normalization (sums to 100%)

8. `calculateAdjustedAllocation()`
   - Test various essentials percentages
   - Test surplus distribution

9. `calculateGap()`
   - Test positive and negative gaps
   - Test percentage calculations

**Testing Framework:** Jest or similar for JavaScript unit testing

### 7.2 Scenario Testing (Phase 4)

**20 Validated Scenarios from Documentation:**

Run all 20 scenarios from `BASE-WEIGHTS-SCENARIO-TESTING.md` through the complete system:

**Tier 1 (Crisis):**
1. Recent Grad in Crisis ($2,800 income)
2. Trauma Recovery - Low Income ($3,200 income)
3. Entry-Level with Debt ($3,500 income)

**Tier 2 (Stability):**
4. Building Emergency Fund ($4,500 income)
5. Work-Life Balance Focus ($5,500 income)
6. Business Owner ($6,000 income)

**Tier 3 (Growth):**
7. Saving for House ($5,800 income)
8. Mid-Career Wealth Builder ($7,500 income)
9. YOLO Lifestyle ($8,000 income)

**Tier 4 (Elite):**
10. High Earner - Generational Focus ($12,000 income)

**Mixed/Edge Cases:**
11. Single Parent - Stabilize Mode ($3,200 income)
12. High Debt, Low Income ($3,000 income)
13. Dual Income Couple ($9,500 income)
14. Recent Raise ($6,200 income)
15. Minimalist High Earner ($10,000 income)
16. Career Changer ($4,200 income)
17. Young Professional - Goal Focused ($4,800 income)
18. Mid-Life Career Peak ($11,000 income)
19. Tech Worker - Debt Payoff ($8,500 income)
20. Established Professional ($15,000 income)

**Expected Results:** Documented in `BASE-WEIGHTS-SCENARIO-TESTING.md` lines 27-767

**Pass Criteria:**
- Allocation percentages match expected ±2% (rounding tolerance)
- Gap analysis correct
- Progress plan generates appropriate timeline
- All modifiers apply correctly

### 7.3 Integration Testing (Phase 4)

**Test Flows:**

**Flow 1: Complete User Journey**
1. Enter Client ID → Verify Tool 1/2/3 data loads
2. Enter financial data → Verify unlock logic works
3. See recommended priority → Verify recommendation engine
4. Select Top 2 priorities → Verify allocation calculation
5. See recommended + adjusted allocations → Verify gap analysis
6. Choose Path 2 (Gradual) → Verify progress plan generation
7. Save scenario → Verify data persistence
8. Load scenario → Verify data retrieval
9. Mark as optimal → Verify flag update
10. Generate PDF → Verify report creation

**Flow 2: Trauma Integration**
1. Student with Fear winner + high satisfaction
   - Verify overwhelm detection
   - Verify E+F boost (not amplification)
2. Student with FSV winner
   - Verify J reduction modifier
3. Student with Money Avoidance archetype
   - Verify E boost, M reduction

**Flow 3: Priority Unlock Progression**
1. Low income, no emergency fund
   - Verify only crisis priorities available
2. Build emergency fund to 1 month
   - Verify "Feel Secure" unlocks
3. Build to 3 months + low debt
   - Verify "Save for Goal" unlocks
4. Build to 6 months + pay off debt
   - Verify "Build Wealth" unlocks

### 7.4 Edge Case Testing

**Edge Cases to Test:**

1. **Zero surplus:**
   - Income = Essentials
   - Expected: Only crisis priorities available, adjusted allocation = 100% E

2. **Negative surplus:**
   - Income < Essentials (overspending)
   - Expected: Warning message, only crisis priorities

3. **Maximum modifiers:**
   - All positive modifiers sum > +50
   - Expected: Capped at +50
   - All negative modifiers sum < -20
   - Expected: Capped at -20

4. **All priorities unlocked:**
   - High income, large emergency fund, no debt
   - Expected: All 10 priorities available

5. **No Tool 1/2/3 data:**
   - Student hasn't completed previous tools
   - Expected: Graceful fallback, no trauma modifiers applied

6. **Extreme income:**
   - Very low: $1,000/month
   - Very high: $50,000/month
   - Expected: System handles gracefully

7. **Gap edge cases:**
   - Gap < $50 (very small)
   - Gap > $3,000 (very large)
   - Expected: Appropriate timeline (2-6 months)

### 7.5 Performance Testing

**Metrics to Measure:**

1. **Page Load Time:** < 2 seconds
   - Initial HTML render
   - Client ID lookup
   - Tool insights retrieval

2. **Calculation Speed:** < 100ms
   - Complete allocation calculation
   - All modifiers applied
   - Normalization complete

3. **Progress Plan Generation:** < 200ms
   - Gap calculation
   - Timeline determination
   - Milestone generation (2-6 months)

4. **Scenario Save:** < 500ms
   - Data serialization
   - Sheet write operation
   - Confirmation return

5. **GPT API Call:** < 3 seconds (acceptable for non-blocking enhancement)

**Testing Tools:**
- Chrome DevTools Performance tab
- Lighthouse audit
- Custom JavaScript timers

**Optimization Strategies:**
- Cache trauma data (don't refetch on every calculation)
- Debounce slider inputs (don't recalculate on every pixel)
- Lazy-load progress plan (only when Path 2 selected)
- Minimize sheet read/write operations

### 7.6 User Acceptance Testing

**Test with Real Users:**

1. **Recruit 5-10 beta testers** across income levels:
   - 2 low income ($2K-$4K)
   - 3 medium income ($4K-$8K)
   - 2 high income ($8K-$15K+)

2. **Tasks:**
   - Complete Tool 4 without guidance
   - Create 2-3 scenarios
   - Choose optimal scenario
   - Attempt to follow progress plan for 1 month

3. **Feedback to Collect:**
   - Was the UI intuitive?
   - Were the recommendations helpful?
   - Was the progress plan realistic?
   - Any confusing terminology?
   - Any bugs encountered?

4. **Success Criteria:**
   - 80%+ complete task without help
   - 80%+ find recommendations helpful
   - 80%+ would follow progress plan

---

## 8. Implementation Checklist

### Phase 1: Core Algorithm ✅ READY
- [ ] Define all 10 priorities with validated base weights
- [ ] Implement Top 2 ranking (70%/30% weighted average)
- [ ] Implement financial modifiers (6 categories)
- [ ] Implement behavioral modifiers (9 categories, including 3 NEW trauma modifiers)
- [ ] Implement motivational modifiers (8 categories)
- [ ] Implement trauma-informed satisfaction amplifier
- [ ] Implement modifier caps (±50/±20)
- [ ] Implement calculateRecommendedAllocation()
- [ ] Implement calculateAdjustedAllocation()
- [ ] Implement calculateGap()
- [ ] Write unit tests for all functions (80%+ coverage)
- [ ] Test with 20 scenarios from documentation
- [ ] All tests pass with ±2% tolerance

**Definition of Done:**
- All functions implemented and working
- All unit tests passing
- 20 scenarios validated
- Code reviewed and approved

---

### Phase 2: Progressive Unlock & Priority Selection ✅ READY
- [ ] Implement calculateSurplus()
- [ ] Implement checkUnlockRequirements() for all 10 priorities
- [ ] Implement getAvailablePriorities()
- [ ] Implement recommendPriority() with trauma override
- [ ] Build priority selection UI (recommended + dropdown)
- [ ] Build unlock display UI (available + locked with progress)
- [ ] Test unlock logic with 10+ financial scenarios
- [ ] Test recommendation engine with trauma patterns
- [ ] Verify UI displays correctly for all unlock states

**Definition of Done:**
- Unlock logic working for all priorities
- Recommendation engine tested
- UI complete and functional
- Integration with Phase 1 complete

---

### Phase 3: Hybrid Allocation UX & Progress Tracking ✅ READY
- [ ] Build allocation display UI (recommended + adjusted + gap)
- [ ] Build 3-path choice UI (optimize/gradual/different)
- [ ] Implement Tool 2 integration (suggested cuts)
- [ ] Implement generateProgressPlan() algorithm
- [ ] Build progress plan display UI (milestones)
- [ ] Implement shouldPromptUpdate() triggers
- [ ] Implement handleProgressUpdate() logic
- [ ] Build progress tracking UI (update form)
- [ ] Test with various gap sizes (< $300 to > $1,500)
- [ ] Test plan adjustment logic

**Definition of Done:**
- Both allocations display correctly
- 3-path choice functional
- Progress plans generate correctly (2-6 months)
- Progress tracking works
- UI complete and functional

---

### Phase 4: Testing & Validation ✅ READY
- [ ] Build automated test suite for 20 scenarios
- [ ] All 20 scenarios pass (±2% tolerance)
- [ ] Test all edge cases (zero surplus, max modifiers, etc.)
- [ ] Complete integration testing (3 main flows)
- [ ] Performance testing (all metrics < targets)
- [ ] User acceptance testing (5-10 beta users)
- [ ] Fix all bugs identified
- [ ] Code review and approval
- [ ] Documentation complete
- [ ] Production deployment checklist

**Definition of Done:**
- All tests passing
- No critical bugs
- Performance meets targets
- User feedback positive (80%+)
- Ready for production

---

### Post-Launch (Optional Enhancements)
- [ ] GPT personalization (generate custom guidance)
- [ ] PDF report generation (scenario + comparison reports)
- [ ] Scenario comparison UI (side-by-side view)
- [ ] Mobile-responsive design
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Analytics integration (track user behavior)
- [ ] A/B testing framework

---

## Appendix A: File Paths Reference

**Core Documentation:**
- `/Users/Larry/code/FTP-v3/docs/Tool4/TOOL4-IMPLEMENTATION-PLAN.md` (this file)
- `/Users/Larry/code/FTP-v3/docs/Tool4/TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md`
- `/Users/Larry/code/FTP-v3/docs/Tool4/TOOL4-PROGRESSIVE-UNLOCK-MODEL.md`

**Algorithm Documentation:**
- `/Users/Larry/code/FTP-v3/docs/Tool4/PROGRESS-PLAN-ALGORITHM.md`
- `/Users/Larry/code/FTP-v3/docs/Tool4/MODIFIERS-SYSTEM-VALIDATION.md`
- `/Users/Larry/code/FTP-v3/docs/Tool4/BASE-WEIGHTS-SCENARIO-TESTING.md`

**Architecture Documentation:**
- `/Users/Larry/code/FTP-v3/docs/Tool4/TOOL4-SPECIFICATION.md`
- `/Users/Larry/code/FTP-v3/docs/Tool4/TOOL4-IMPLEMENTATION-CHECKLIST.md`

**Session Summaries:**
- `/Users/Larry/code/FTP-v3/docs/Tool4/SESSION-THREE-HANDOFF.md`
- `/Users/Larry/code/FTP-v3/docs/Tool4/SESSION-THREE-COMPLETE-SUMMARY.md` (if exists)

**Legacy Reference:**
- `/Users/Larry/code/FTP-v3/docs/Tool4/Archive/` (historical documents)

**Source Code (To Be Created):**
- `/Users/Larry/code/FTP-v3/apps/Tool-4-financial-freedom-framework-tool/Tool4.html`
- `/Users/Larry/code/FTP-v3/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationEngine.js`
- `/Users/Larry/code/FTP-v3/apps/Tool-4-financial-freedom-framework-tool/scripts/ProgressPlanGenerator.js`
- `/Users/Larry/code/FTP-v3/apps/Tool-4-financial-freedom-framework-tool/scripts/UnlockLogic.js`
- `/Users/Larry/code/FTP-v3/apps/Tool-4-financial-freedom-framework-tool/scripts/Tool4Server.gs` (Apps Script)

---

## Appendix B: Glossary

**M/E/F/J:** The 4 financial buckets
- **M**ultiply: Investments, wealth building, long-term growth
- **E**ssentials: Housing, utilities, food, transportation, insurance
- **F**reedom: Debt payoff, emergency fund, financial stability
- **J**oyment: Entertainment, hobbies, lifestyle, experiences

**Progressive Unlock:** System where priorities unlock based on financial health (surplus, emergency fund, debt)

**Hybrid Allocation:** Showing both recommended allocation (ideal) and adjusted allocation (current reality)

**Top 2 Ranking:** Student selects 2 priorities, weighted 70% (primary) and 30% (secondary)

**Surplus:** Income - Essentials (key unlock metric)

**Base Weights:** Starting M/E/F/J percentages for each priority

**Modifiers:** Adjustments to base weights based on financial, behavioral, and motivational factors

**Trauma-Informed:** System adapts based on trauma patterns from Tools 1/2/3

**Path 2 (Gradual Progress):** Most common choice - start with adjusted allocation, improve over 30-90 days

**Progress Plan:** 30-60-90 day milestones to bridge gap between current and recommended allocation

**Gap:** Difference between recommended and adjusted allocations (what needs to change)

---

**Document Version:** 1.0
**Last Updated:** November 18, 2025
**Status:** Complete and Ready for Implementation
**Next Action:** Begin Phase 1 development

---

**END OF MASTER IMPLEMENTATION PLAN**
