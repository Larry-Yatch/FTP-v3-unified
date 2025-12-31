# Financial Freedom Journey: Integrated System Vision

> **Status**: Planning Document
> **Created**: 2024-12-14
> **Last Updated**: 2024-12-14
> **Purpose**: Capture the complete vision for integrating Tools 1-8 into a cohesive system

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System State](#current-system-state)
3. [The Two Tracks](#the-two-tracks)
4. [The Helix Model](#the-helix-model)
5. [Structural Track Deep Dive (Tools 2-4-6-8)](#structural-track-deep-dive)
6. [Psychological Track Deep Dive (Tools 1-3-5-7)](#psychological-track-deep-dive)
7. [Cross-Track Integration Points](#cross-track-integration-points)
8. [Data Flow Architecture](#data-flow-architecture)
9. [User Experience Journey](#user-experience-journey)
10. [Implementation Phases](#implementation-phases)
11. [Open Questions](#open-questions)

---

## Executive Summary

### The Vision

Transform 8 individual tools into **one integrated Financial Freedom Journey** where:

- **Psychological tools (1, 3, 5, 7)** reveal subconscious survival strategies blocking financial goals
- **Structural tools (2, 4, 6, 8)** provide the foundational framework to achieve those goals
- **Each pair works together**: Psychology informs structure, structure reveals psychology
- **Data flows forward**: Users never re-enter information; each tool builds on the last

### The Core Insight

**Before**: "I completed 8 assessments and got 8 reports."

**After**: "I discovered my Control pattern was keeping me in cash. I saw it in my financial data. I worked through my identity issues. My budget now honors my healing. My savings strategy addresses my relationship patterns. And I can finally see a future I believe in."

---

## Current System State

### Tool Status Matrix

| Tool | Name | Type | Status | Location | Integration |
|------|------|------|--------|----------|-------------|
| **1** | Core Trauma Strategy Assessment | Psychological | ✅ Production | `tools/tool1/` | Fully integrated |
| **2** | Financial Clarity & Values | Structural | ✅ Production | `tools/tool2/` | Reads Tool 1 |
| **3** | Identity & Validation Grounding | Psychological | ✅ Production | `tools/tool3/` | Unlocks Tool 4 |
| **4** | Financial Freedom Framework | Structural | ✅ Production | `tools/tool4/` | Has T1/T2/T3 backup questions |
| **5** | Love & Connection Grounding | Psychological | ✅ Production | `tools/tool5/` | Unlocks Tool 6 |
| **6** | Retirement Blueprint | Structural | ❌ Legacy | `apps/Tool-6-.../` | Standalone GAS app |
| **7** | Security & Control Grounding | Psychological | 🔶 Branch | `origin/claude/...` | Built, not merged |
| **8** | Investment Dial Tool | Structural | ❌ Legacy | `apps/Tool-8-.../` | Standalone GAS app |

### What Needs to Happen

1. **Merge Tool 7** from feature branch into main
2. **Convert Tool 6** from legacy standalone to integrated v3 tool
3. **Convert Tool 8** from legacy standalone to integrated v3 tool
4. **Build integration layer** connecting all 8 tools

---

## The Two Tracks

### Track 1: Psychological (Odd Tools) - "Why You Struggle"

```
Tool 1: DISCOVER
   │    "What survival patterns drive my behavior?"
   │    Output: 6 trauma scores (FSV, Control, ExVal, Fear, Receiving, Showing)
   │            Top pattern identified
   │
   ▼
Tool 3: GROUND SELF
   │    "How does disconnection from my true self affect my money?"
   │    Focus: FSV (False Self-View) + ExVal (External Validation)
   │    Output: Identity insights, grounding progress
   │
   ▼
Tool 5: GROUND OTHERS
   │    "How do my relationship patterns affect my wealth?"
   │    Focus: Showing (over-giving) + Receiving (difficulty accepting)
   │    Output: Relationship insights, boundary awareness
   │
   ▼
Tool 7: GROUND FUTURE
        "What stops me from planning ahead?"
        Focus: Fear + Control patterns
        Output: Future anxiety level, risk tolerance adjustment
```

### Track 2: Structural (Even Tools) - "How To Succeed"

```
Tool 2: CLARIFY
   │    "Where do I actually stand financially?"
   │    Output: 5 domain scores (Money Flow, Obligations, Liquidity, Growth, Protection)
   │            Stress levels, priority ranking
   │            Free-text: income sources, expenses, debts
   │
   ▼
Tool 4: ALLOCATE
   │    "How should I divide my income?"
   │    Output: M/E/F/J allocation (percentages + dollars)
   │            Multiply budget = wealth-building capacity
   │
   ▼
Tool 6: OPTIMIZE
   │    "Where should my savings go?"
   │    Output: Vehicle allocations (Roth IRA, 401k, HSA, etc.)
   │            Profile type, IRS limit compliance
   │
   ▼
Tool 8: PROJECT
        "Where will this take me?"
        Output: Projected nest egg, retirement income
                Scenario comparisons, readiness score
```

---

## The Helix Model

### Core Principle

**Psychology informs structure. Structure reveals psychology.**

The two tracks don't run in parallel - they **interweave like a double helix**, each informing the other at every stage.

```
                    THE FINANCIAL FREEDOM HELIX

     AWARENESS                              ACTION
    (Psychology)                          (Structure)
         │                                     │
         │    ┌─────────────────────────┐     │
    T1 ──┼───►│ Trauma Pattern Revealed │◄────┼── T2
         │    │ + Financial Reality     │     │
         │    └──────────┬──────────────┘     │
         │               │                     │
         │    ┌──────────▼──────────────┐     │
    T3 ──┼───►│ Identity Patterns +     │◄────┼── T4
         │    │ Budget Alignment        │     │
         │    └──────────┬──────────────┘     │
         │               │                     │
         │    ┌──────────▼──────────────┐     │
    T5 ──┼───►│ Relationship Patterns + │◄────┼── T6
         │    │ Savings Strategy        │     │
         │    └──────────┬──────────────┘     │
         │               │                     │
         │    ┌──────────▼──────────────┐     │
    T7 ──┼───►│ Future Anxiety +        │◄────┼── T8
         │    │ Retirement Projection   │     │
         │    └─────────────────────────┘     │
```

### The Four Integration Points

| Stage | Psychological Tool | Structural Tool | Integration Theme |
|-------|-------------------|-----------------|-------------------|
| **Discovery** | Tool 1 (Patterns) | Tool 2 (Reality) | "See how your patterns show up in your finances" |
| **Identity** | Tool 3 (Self) | Tool 4 (Budget) | "Align your budget with your authentic self" |
| **Connection** | Tool 5 (Others) | Tool 6 (Savings) | "Build wealth without sacrificing relationships" |
| **Future** | Tool 7 (Fear) | Tool 8 (Projection) | "Face the future with clarity, not anxiety" |

---

## Structural Track Deep Dive

### Tool 2 → Tool 4 → Tool 6 → Tool 8 Flow

#### Tool 2: Financial Clarity Assessment

**Purpose**: Establish baseline financial reality

**Key Outputs for Downstream Tools**:
```javascript
{
  // Domain scores (0-100%)
  domainScores: {
    moneyFlow: 65,      // Income + spending clarity
    obligations: 42,    // Debt + emergency fund
    liquidity: 28,      // Savings beyond emergency
    growth: 51,         // Investments + retirement
    protection: 38      // Insurance coverage
  },

  // Stress-weighted priorities
  priorityList: [
    { domain: "liquidity", priority: 1 },
    { domain: "protection", priority: 2 },
    // ...
  ],

  // Free-text data (gold for downstream)
  freeText: {
    incomeSources: "Salary, rental property, freelance",
    majorExpenses: "Mortgage, childcare, car payment",
    currentDebts: "Credit card $8k, student loans $35k",
    wastefulSpending: "Dining out, subscriptions",
    investmentTypes: "401k, some stocks"
  },

  // Mindset baselines
  mindset: {
    scarcityAbundance: 3,      // -5 to +5
    financialScarcity: 1,
    moneyRelationship: 2
  }
}
```

#### Tool 4: Budget Allocation (M/E/F/J)

**Purpose**: Create trauma-aware budget allocation

**Receives from Tool 2**:
- Income/expense free-text → Pre-populate categories
- Domain scores → Inform priority weighting
- Stress levels → Add guardrails

**Key Outputs for Tool 6**:
```javascript
{
  allocation: {
    Multiply: { percent: 20, dollars: 700 },
    Essentials: { percent: 50, dollars: 1750 },
    Freedom: { percent: 15, dollars: 525 },
    Enjoyment: { percent: 15, dollars: 525 }
  },

  // Critical for Tool 6
  multiplyBudget: 700,  // $ available for wealth building

  selectedPriority: "Build Wealth",
  goalTimeline: "10+ years",
  monthlyIncome: 3500,

  // Context for downstream
  debtContext: {
    totalDebt: 43000,
    monthlyDebtPayment: 450
  },
  emergencyFund: {
    current: 5000,
    target: 10500,  // 6 months essentials
    gap: 5500
  }
}
```

#### Tool 6: Retirement Vehicle Optimization

**Purpose**: Allocate Multiply budget across optimal vehicles

**Receives from Tool 4**:
- `multiplyBudget` ($700/mo) → Amount to allocate
- `goalTimeline` → Informs vehicle selection
- `debtContext` → May affect recommendations

**Receives from Tool 2**:
- Current retirement accounts → Starting point
- Employment situation → Determines eligible vehicles

**Key Outputs for Tool 8**:
```javascript
{
  // Profile classification (1 of 9)
  profile: {
    id: "7_Foundation_Builder",
    title: "Foundation Builder",
    description: "Standard investor building retirement foundation"
  },

  // Vehicle allocations
  vehicleAllocations: {
    rothIRA: { monthly: 583, annual: 7000, atLimit: true },
    hsa: { monthly: 117, annual: 1404, atLimit: false },
    traditional401k: { monthly: 0, annual: 0 }
  },

  totalMonthlyContribution: 700,

  // Context for Tool 8
  currentAssets: {
    rothIRA: 25000,
    traditional401k: 85000,
    hsa: 3500,
    taxable: 10000
  },

  yearsToRetirement: 25,
  employerMatch: {
    available: true,
    formula: "100% up to 3%, 50% up to 5%",
    annualValue: 4500
  }
}
```

#### Tool 8: Investment Projections

**Purpose**: Project where the plan leads

**Receives from Tool 6**:
- `vehicleAllocations` → Monthly contribution amounts
- `currentAssets` → Starting balances
- `yearsToRetirement` → Time horizon
- `employerMatch` → Additional contributions

**Receives from Tool 7**:
- Fear/Control scores → Risk tolerance adjustment
- Future anxiety level → Scenario framing

**Key Outputs (Final)**:
```javascript
{
  projection: {
    nestEggAtRetirement: 1250000,
    monthlyRetirementIncome: 4800,
    incomeReplacementRate: 0.82  // 82% of current income
  },

  scenarios: [
    { name: "Current Plan", nestEgg: 1250000 },
    { name: "Aggressive (+$200/mo)", nestEgg: 1580000 },
    { name: "Conservative (-$100/mo)", nestEgg: 1050000 }
  ],

  riskProfile: {
    dial: 6,  // 0-10
    expectedReturn: 0.12,
    adjustedForPsychology: true,
    fearAdjustment: -0.5  // Reduced due to Fear pattern
  },

  readinessScore: {
    financial: 78,
    psychological: 65,
    integrated: 72
  }
}
```

### Structural Track Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     STRUCTURAL TRACK DATA FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TOOL 2                                                                     │
│  ══════                                                                     │
│  Collects:                                                                  │
│    • 57 questions across 5 domains                                          │
│    • Free-text: income, expenses, debts, investments                        │
│    • Mindset scales (-5 to +5)                                              │
│                                                                             │
│  Outputs:                                                                   │
│    domainScores{} ─────────────────────────────┐                           │
│    priorityList[] ─────────────────────────────┤                           │
│    freeText{} ─────────────────────────────────┤                           │
│    mindset{} ──────────────────────────────────┤                           │
│                                                │                           │
│                     ┌──────────────────────────▼───────────────────────┐   │
│                     │                  TOOL 4                          │   │
│                     │                  ══════                          │   │
│                     │  Pre-fills from Tool 2:                          │   │
│                     │    • Parse freeText → expense categories         │   │
│                     │    • Use priorityList → bucket weighting         │   │
│                     │    • Apply mindset → guardrail thresholds        │   │
│                     │                                                  │   │
│                     │  Collects:                                       │   │
│                     │    • Monthly income (validated against T2)       │   │
│                     │    • Bucket preferences                          │   │
│                     │    • Priority selection                          │   │
│                     │                                                  │   │
│                     │  Outputs:                                        │   │
│                     │    allocation{M,E,F,J} ──────────┐               │   │
│                     │    multiplyBudget ───────────────┤               │   │
│                     │    goalTimeline ─────────────────┤               │   │
│                     │    debtContext{} ────────────────┤               │   │
│                     │    emergencyFund{} ──────────────┤               │   │
│                     └──────────────────────────────────┤───────────────┘   │
│                                                        │                   │
│                     ┌──────────────────────────────────▼───────────────┐   │
│                     │                  TOOL 6                          │   │
│                     │                  ══════                          │   │
│                     │  Pre-fills from Tool 4:                          │   │
│                     │    • multiplyBudget → "You have $700 to allocate"│   │
│                     │    • goalTimeline → vehicle filtering            │   │
│                     │                                                  │   │
│                     │  Pre-fills from Tool 2:                          │   │
│                     │    • Retirement accounts → starting point        │   │
│                     │    • Employment → eligible vehicles              │   │
│                     │                                                  │   │
│                     │  Collects:                                       │   │
│                     │    • Profile classification questions            │   │
│                     │    • Vehicle preferences                         │   │
│                     │    • Risk orientation                            │   │
│                     │                                                  │   │
│                     │  Outputs:                                        │   │
│                     │    profile{} ────────────────────┐               │   │
│                     │    vehicleAllocations{} ─────────┤               │   │
│                     │    currentAssets{} ──────────────┤               │   │
│                     │    yearsToRetirement ────────────┤               │   │
│                     └──────────────────────────────────┤───────────────┘   │
│                                                        │                   │
│                     ┌──────────────────────────────────▼───────────────┐   │
│                     │                  TOOL 8                          │   │
│                     │                  ══════                          │   │
│                     │  Pre-fills from Tool 6:                          │   │
│                     │    • vehicleAllocations → contribution inputs    │   │
│                     │    • currentAssets → starting balances           │   │
│                     │    • yearsToRetirement → timeline                │   │
│                     │                                                  │   │
│                     │  Receives from Tool 7:                           │   │
│                     │    • Fear/Control → risk adjustment              │   │
│                     │                                                  │   │
│                     │  Outputs:                                        │   │
│                     │    projection{} ─────────────────┐               │   │
│                     │    scenarios[] ──────────────────┤               │   │
│                     │    riskProfile{} ────────────────┤               │   │
│                     │    readinessScore{} ─────────────┘               │   │
│                     └──────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Psychological Track Deep Dive

### Tool 1 → Tool 3 → Tool 5 → Tool 7 Flow

#### Tool 1: Core Trauma Strategy Assessment

**Purpose**: Identify primary survival patterns

**The 6 Trauma Categories**:
| Pattern | Core Belief | Financial Manifestation |
|---------|-------------|------------------------|
| **FSV** (False Self-View) | "I'm not good enough" | Hiding true financial situation |
| **Control** | "I must control everything" | Hoarding cash, analysis paralysis |
| **ExVal** (External Validation) | "I need others' approval" | Spending to impress |
| **Fear** | "Bad things will happen" | Avoiding investments, catastrophizing |
| **Receiving** | "I don't deserve good things" | Difficulty accepting help/windfalls |
| **Showing** | "I must sacrifice for others" | Over-giving, depleting self |

**Key Outputs**:
```javascript
{
  scores: {
    FSV: 72,
    Control: 85,      // Highest
    ExVal: 45,
    Fear: 68,
    Receiving: 38,
    Showing: 52
  },

  topTrauma: "Control",

  traumaContext: {
    behaviors: ["Checking accounts obsessively", "Difficulty delegating"],
    triggers: ["Unexpected expenses", "Market volatility"],
    healingFocus: "Flexibility and trust"
  }
}
```

#### Tool 3: Identity & Validation Grounding

**Purpose**: Deep dive into FSV + ExVal patterns

**Receives from Tool 1**:
- FSV and ExVal scores → Determine intensity of exploration
- Top trauma → Context for grounding exercises

**Key Outputs**:
```javascript
{
  fsvDeepDive: {
    score: 72,
    primaryPattern: "Minimizing accomplishments",
    financialImpact: "Undervalues own earning potential",
    groundingProgress: 45  // % through exercises
  },

  exvalDeepDive: {
    score: 45,
    primaryPattern: "Seeking approval through purchases",
    financialImpact: "Lifestyle inflation for appearances",
    groundingProgress: 60
  },

  identityInsights: [
    "You hide financial wins from others",
    "You feel guilty when you have more than peers",
    "You deflect compliments about financial success"
  ],

  readyForBudget: true  // Unlocks Tool 4
}
```

#### Tool 5: Love & Connection Grounding

**Purpose**: Deep dive into Showing + Receiving patterns

**Receives from Tool 1**:
- Showing and Receiving scores
- Top trauma context

**Key Outputs**:
```javascript
{
  showingDeepDive: {
    score: 52,
    primaryPattern: "Financial caretaking of family",
    financialImpact: "Depletes savings for others' needs",
    boundaryAwareness: 35  // Low = poor boundaries
  },

  receivingDeepDive: {
    score: 38,
    primaryPattern: "Refuses help even when struggling",
    financialImpact: "Misses employer match, declines raises",
    deservingScore: 40
  },

  relationshipInsights: [
    "You give money to siblings despite own debt",
    "You feel uncomfortable with inheritance/gifts",
    "You pay more than your share consistently"
  ],

  givingBoundaryPlan: {
    monthlyGivingCap: 200,
    emergencyFundProtection: true
  }
}
```

#### Tool 7: Security & Control Grounding

**Purpose**: Deep dive into Fear + Control patterns

**Receives from Tool 1**:
- Fear and Control scores
- Trauma context

**Key Outputs**:
```javascript
{
  fearDeepDive: {
    score: 68,
    primaryPattern: "Catastrophic thinking about retirement",
    financialImpact: "Avoids investing, misses growth",
    futureTrustScore: 30  // Low = high anxiety about future
  },

  controlDeepDive: {
    score: 85,
    primaryPattern: "Cannot delegate financial decisions",
    financialImpact: "Over-manages portfolio, excessive cash",
    flexibilityScore: 25  // Low = rigid
  },

  futureInsights: [
    "You check portfolio multiple times daily",
    "You keep 2+ years expenses in cash",
    "You struggle to commit to long-term investments"
  ],

  riskToleranceAdjustment: {
    baseRisk: 7,          // What they'd select normally
    adjustedRisk: 5,      // After accounting for patterns
    reason: "Control pattern may lead to over-estimation of risk tolerance"
  }
}
```

### Psychological Track Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PSYCHOLOGICAL TRACK DATA FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TOOL 1: DISCOVER                                                           │
│  ════════════════                                                           │
│  26 questions identifying 6 trauma patterns                                 │
│                                                                             │
│  Outputs:                                                                   │
│    scores{FSV, Control, ExVal, Fear, Receiving, Showing}                   │
│         │                                                                   │
│         ├─── FSV + ExVal scores ──────────────────┐                        │
│         │                                          │                        │
│         ├─── Showing + Receiving scores ──────────┼────────┐               │
│         │                                          │        │               │
│         └─── Fear + Control scores ───────────────┼────────┼────────┐      │
│                                                    │        │        │      │
│         topTrauma ────────────────────────────────┼────────┼────────┼──►   │
│         traumaContext{} ──────────────────────────┼────────┼────────┼──►   │
│                                                    │        │        │      │
│                                                    ▼        │        │      │
│  ┌─────────────────────────────────────────────────────────┐│        │      │
│  │  TOOL 3: GROUND SELF                                    ││        │      │
│  │  ══════════════════                                     ││        │      │
│  │  30 questions exploring FSV + ExVal                     ││        │      │
│  │                                                         ││        │      │
│  │  Focus Areas:                                           ││        │      │
│  │    • False Self-View: Hiding true self                  ││        │      │
│  │    • External Validation: Seeking approval              ││        │      │
│  │                                                         ││        │      │
│  │  Outputs:                                               ││        │      │
│  │    fsvDeepDive{} ────────────────────────────►T4        ││        │      │
│  │    exvalDeepDive{} ──────────────────────────►T4        ││        │      │
│  │    identityInsights[] ───────────────────────►T4        ││        │      │
│  └─────────────────────────────────────────────────────────┘│        │      │
│                                                              │        │      │
│                                                              ▼        │      │
│  ┌─────────────────────────────────────────────────────────────────┐ │      │
│  │  TOOL 5: GROUND OTHERS                                          │ │      │
│  │  ═════════════════════                                          │ │      │
│  │  30 questions exploring Showing + Receiving                     │ │      │
│  │                                                                 │ │      │
│  │  Focus Areas:                                                   │ │      │
│  │    • Showing: Over-giving, self-sacrifice                       │ │      │
│  │    • Receiving: Difficulty accepting                            │ │      │
│  │                                                                 │ │      │
│  │  Outputs:                                                       │ │      │
│  │    showingDeepDive{} ────────────────────────────────►T6        │ │      │
│  │    receivingDeepDive{} ──────────────────────────────►T6        │ │      │
│  │    relationshipInsights[] ───────────────────────────►T6        │ │      │
│  │    givingBoundaryPlan{} ─────────────────────────────►T6        │ │      │
│  └─────────────────────────────────────────────────────────────────┘ │      │
│                                                                      │      │
│                                                                      ▼      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  TOOL 7: GROUND FUTURE                                                │  │
│  │  ═════════════════════                                                │  │
│  │  30 questions exploring Fear + Control                                │  │
│  │                                                                       │  │
│  │  Focus Areas:                                                         │  │
│  │    • Fear: Catastrophizing, avoidance                                 │  │
│  │    • Control: Rigidity, over-management                               │  │
│  │                                                                       │  │
│  │  Outputs:                                                             │  │
│  │    fearDeepDive{} ─────────────────────────────────────────►T8        │  │
│  │    controlDeepDive{} ──────────────────────────────────────►T8        │  │
│  │    futureInsights[] ───────────────────────────────────────►T8        │  │
│  │    riskToleranceAdjustment{} ──────────────────────────────►T8        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cross-Track Integration Points

### Integration Point 1: Discovery (T1 + T2)

**How Tool 1 informs Tool 2**:
- Tool 2 shows trauma-specific adaptive questions based on T1's top pattern
- GPT prompts include trauma context for personalized analysis
- Domain score interpretation includes trauma lens

**Example Integration**:
```
Tool 1 Output: topTrauma = "Control"

Tool 2 Adaptation:
- Q55-Q56 become Control-specific questions
- GPT prompt includes: "Look for control patterns in financial behavior"
- Report shows: "Your Control pattern may explain your high Money Flow
  score but low Growth score - you track obsessively but avoid investing"
```

### Integration Point 2: Identity (T3 + T4)

**How Tool 3 informs Tool 4**:
- FSV score → Warns if user underestimates income/overestimates expenses
- ExVal score → Warns if Enjoyment allocation seems approval-driven
- Identity insights → Personalized messaging in calculator

**Example Integration**:
```
Tool 3 Output: exvalScore = 75, pattern = "Spending to impress"

Tool 4 Adaptation:
- If Enjoyment > 20%: "Your External Validation pattern suggests some
  of this spending may be for others' approval. Is this truly for you?"
- Guardrail: Require acknowledgment if Enjoyment > 25%
- Suggest: "Consider which Enjoyment items you'd still want if no one knew"
```

### Integration Point 3: Connection (T5 + T6)

**How Tool 5 informs Tool 6**:
- Showing score → Warns about raiding retirement for others
- Receiving score → Normalizes employer match as earned benefit
- Giving boundary plan → Informs emergency fund buffer

**Example Integration**:
```
Tool 5 Output: showingScore = 80, givingBoundaryPlan.monthlyGivingCap = 200

Tool 6 Adaptation:
- Add "Giving Buffer" category in Essentials review
- Warn: "Your Showing pattern may lead you to raid retirement accounts
  for family needs. Consider: Is it loving to deplete your future?"
- Recommend: "Protect retirement contributions as non-negotiable before giving"
```

### Integration Point 4: Future (T7 + T8)

**How Tool 7 informs Tool 8**:
- Fear score → Adjusts risk dial default (lower if high fear)
- Control score → Shows "hands-off vs active" comparison
- Risk tolerance adjustment → Pre-configures projections

**Example Integration**:
```
Tool 7 Output: fearScore = 70, controlScore = 85, adjustedRisk = 5 (from 7)

Tool 8 Adaptation:
- Default risk dial: 5 (not user's stated 7)
- Show explanation: "Based on your Fear and Control patterns, we've
  adjusted your risk setting. Higher risk may cause you to sell in downturns."
- Include scenario: "What if you stick with your plan through volatility?"
- Add: "Worst case" scenario to address fear directly
```

### Cross-Track Integration Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CROSS-TRACK INTEGRATION MATRIX                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              │  Tool 2    │  Tool 4    │  Tool 6    │  Tool 8              │
│              │ (Clarify)  │ (Allocate) │ (Optimize) │ (Project)            │
│  ────────────┼────────────┼────────────┼────────────┼──────────            │
│  Tool 1      │  Adaptive  │  Backup    │  Profile   │  Risk                │
│  (Discover)  │  questions │  questions │  context   │  baseline            │
│              │  GPT ctx   │  Default   │            │                      │
│  ────────────┼────────────┼────────────┼────────────┼──────────            │
│  Tool 3      │     -      │  FSV/ExVal │  Identity  │     -                │
│  (Self)      │            │  guardrails│  context   │                      │
│              │            │  warnings  │            │                      │
│  ────────────┼────────────┼────────────┼────────────┼──────────            │
│  Tool 5      │     -      │     -      │  Showing/  │  Giving              │
│  (Others)    │            │            │  Receiving │  impact              │
│              │            │            │  guardrails│                      │
│  ────────────┼────────────┼────────────┼────────────┼──────────            │
│  Tool 7      │     -      │     -      │     -      │  Risk adj            │
│  (Future)    │            │            │            │  Fear ctx            │
│              │            │            │            │  Control fx          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Legend:
  - Adaptive questions: Dynamic questions based on psychological profile
  - GPT ctx: Context added to GPT prompts for personalized analysis
  - Backup questions: Fallback if psychological tools not completed
  - Guardrails: Warnings/limits based on psychological patterns
  - Profile context: Psychological data informs profile selection
  - Risk adj: Psychological patterns adjust risk defaults
```

---

## Data Flow Architecture

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE INTEGRATED DATA FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER STARTS JOURNEY                                                        │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │   TOOL 1    │ traumaScores{}, topTrauma, traumaContext{}                │
│  │  DISCOVER   │─────────────────────────────────────────────────┐         │
│  └──────┬──────┘                                                 │         │
│         │                                                        │         │
│         │ unlocks                                                │         │
│         ▼                                                        ▼         │
│  ┌─────────────┐     reads T1 data              ┌─────────────────────┐   │
│  │   TOOL 2    │◄───────────────────────────────│   DataService       │   │
│  │   CLARIFY   │ domainScores{}, priorityList[],│   Cross-Tool Store  │   │
│  └──────┬──────┘ freeText{}, mindset{}          │                     │   │
│         │                     │                  │  Stores:            │   │
│         │ unlocks             │                  │  - All tool outputs │   │
│         ▼                     ▼                  │  - Computed insights│   │
│  ┌─────────────┐     writes to store            │  - Progress state   │   │
│  │   TOOL 3    │─────────────────────────────►  │                     │   │
│  │ GROUND:SELF │ fsvDeepDive{}, exvalDeepDive{},│  Provides:          │   │
│  └──────┬──────┘ identityInsights[]             │  - Pre-fill data    │   │
│         │                                        │  - Guardrail config │   │
│         │ unlocks    ┌───────────────────────►  │  - Context for GPT  │   │
│         ▼            │                          │                     │   │
│  ┌─────────────┐     │  reads T1+T2+T3          └─────────────────────┘   │
│  │   TOOL 4    │◄────┘                                   ▲                │
│  │  ALLOCATE   │ allocation{}, multiplyBudget,           │                │
│  └──────┬──────┘ goalTimeline, debtContext{}             │                │
│         │                     │                          │                │
│         │ unlocks             │ writes                   │                │
│         ▼                     ▼                          │                │
│  ┌─────────────┐     ┌───────────────────────────────────┘                │
│  │   TOOL 5    │     │                                                    │
│  │GROUND:OTHER │─────┘ showingDeepDive{}, receivingDeepDive{},            │
│  └──────┬──────┘       relationshipInsights[], givingBoundaryPlan{}       │
│         │                                                                  │
│         │ unlocks    ┌───────────────────────────────────┐                │
│         ▼            │  reads T4 + T5                    │                │
│  ┌─────────────┐     │                                   │                │
│  │   TOOL 6    │◄────┘                                   │                │
│  │  OPTIMIZE   │ profile{}, vehicleAllocations{},        │                │
│  └──────┬──────┘ currentAssets{}, yearsToRetirement      │                │
│         │                     │                          │                │
│         │ unlocks             │ writes                   │                │
│         ▼                     ▼                          │                │
│  ┌─────────────┐     ┌───────────────────────────────────┘                │
│  │   TOOL 7    │     │                                                    │
│  │GROUND:FUTURE│─────┘ fearDeepDive{}, controlDeepDive{},                 │
│  └──────┬──────┘       futureInsights[], riskToleranceAdjustment{}        │
│         │                                                                  │
│         │ unlocks    ┌───────────────────────────────────┐                │
│         ▼            │  reads T6 + T7                    │                │
│  ┌─────────────┐     │                                   │                │
│  │   TOOL 8    │◄────┘                                   │                │
│  │   PROJECT   │ projection{}, scenarios[], riskProfile{},               │
│  └──────┬──────┘ readinessScore{}                                         │
│         │                                                                  │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    FINAL SYNTHESIS                                   │  │
│  │                                                                      │  │
│  │  Integrates all 8 tools into:                                        │  │
│  │  • Complete psychological profile                                    │  │
│  │  • Trauma-aligned financial plan                                     │  │
│  │  • Projected outcomes                                                │  │
│  │  • Readiness assessment                                              │  │
│  │  • Personalized action plan                                          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Service Enhancements Required

```javascript
// New methods needed for cross-tool integration
const DataService = {
  // Existing
  getLatestResponse(clientId, toolId),
  saveToolResponse(clientId, toolId, data, status),

  // New: Cross-tool queries
  getTraumaProfile(clientId) {
    // Returns compiled trauma data from T1 + T3 + T5 + T7
  },

  getFinancialProfile(clientId) {
    // Returns compiled financial data from T2 + T4 + T6 + T8
  },

  getIntegrationData(clientId, forTool) {
    // Returns all data needed by a specific tool
    // Handles missing tool gracefully (returns nulls)
  },

  getJourneyProgress(clientId) {
    // Returns completion status + key metrics from all tools
  },

  synthesizeJourney(clientId) {
    // Creates final integrated narrative
  }
};
```

---

## User Experience Journey

### The Emotional Arc

| Stage | Tool Pair | User Feeling | Key Moment |
|-------|-----------|--------------|------------|
| **Discovery** | T1 + T2 | "I finally understand why I struggle" | Seeing trauma pattern in financial data |
| **Identity** | T3 + T4 | "I can be my true self with money" | Budget that honors authentic self |
| **Connection** | T5 + T6 | "I can build wealth AND love others" | Savings strategy with healthy boundaries |
| **Future** | T7 + T8 | "I can face the future with peace" | Projection that accounts for psychology |

### Journey Progress Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│              YOUR FINANCIAL FREEDOM JOURNEY                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DISCOVERY        ████████████████████ 100%                    │
│  ├─ Tool 1: ✓ Control pattern identified                       │
│  └─ Tool 2: ✓ Money Flow is your priority domain               │
│                                                                 │
│  IDENTITY         ████████████████░░░░ 80%                     │
│  ├─ Tool 3: ✓ FSV grounding complete                           │
│  └─ Tool 4: ✓ Budget aligned - $700/mo to Multiply             │
│                                                                 │
│  CONNECTION       ████████████░░░░░░░░ 60%                     │
│  ├─ Tool 5: ✓ Showing boundary set at $200/mo                  │
│  └─ Tool 6: ◐ In progress - Profile: Foundation Builder        │
│                                                                 │
│  FUTURE           ░░░░░░░░░░░░░░░░░░░░ 0%                      │
│  ├─ Tool 7: ○ Not started                                      │
│  └─ Tool 8: ○ Locked (requires Tool 7)                         │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  OVERALL PROGRESS: 60%                                          │
│                                                                 │
│  YOUR TOP INSIGHT SO FAR:                                       │
│  "Your Control pattern keeps you checking accounts obsessively  │
│   but avoiding investments. Tool 6 will help you put your       │
│   $700/mo Multiply budget into the right vehicles."             │
│                                                                 │
│  🎯 NEXT STEP: Complete Tool 6 to optimize your savings         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Transition Messaging Between Tools

**Tool 2 → Tool 3**:
> "You've mapped your financial reality. You scored highest in Money Flow clarity but lowest in Growth. Your Tool 1 Control pattern may be keeping you in 'tracking mode' instead of 'building mode.' Let's explore how your identity affects your money in Tool 3."

**Tool 3 → Tool 4**:
> "You've done deep identity work. You discovered that your False Self-View makes you underestimate your earning potential. Now let's create a budget that honors your TRUE self - one that allocates money based on who you really are, not who you've been pretending to be."

**Tool 4 → Tool 5**:
> "Your budget is set: $700/month to Multiply, $1,750 to Essentials, $525 each to Freedom and Enjoyment. Before we decide WHERE to invest that $700, let's explore how your relationships affect your money. Your Showing pattern (52%) may be quietly draining your wealth."

**Tool 5 → Tool 6**:
> "You've set a healthy boundary: no more than $200/month in financial support to others. Your retirement savings are protected. Now let's put your $700/month to work. Based on your profile, we'll identify the best retirement vehicles for YOUR situation."

**Tool 6 → Tool 7**:
> "Your savings strategy is optimized: $583/month to Roth IRA, $117 to HSA. These will grow tax-free for decades. But before we project your future, let's address what might sabotage it - your Fear and Control patterns that could cause you to abandon this plan."

**Tool 7 → Tool 8**:
> "You've faced your fears. You understand how your Control pattern might lead you to over-manage or panic sell. Now let's see where your plan actually takes you - with projections that account for both the math AND your psychology."

---

## Implementation Phases

### Phase 0: Documentation & Planning (Current)
- [x] Document current system state
- [x] Define integrated vision
- [x] Map data flows
- [ ] Review with stakeholders
- [ ] Finalize approach

### Phase 1: Foundation
- [ ] Merge Tool 7 branch into main
- [ ] Test Tool 7 integration with existing tools
- [ ] Enhance DataService with cross-tool methods
- [ ] Create integration test suite

### Phase 2: Convert Tool 6
- [ ] Create `tools/tool6/` directory structure
- [ ] Port profile classification from legacy
- [ ] Port vehicle allocation engine from legacy
- [ ] Build HTML UI following Tool 4 pattern
- [ ] Implement Tool 4 → Tool 6 data flow
- [ ] Implement Tool 5 → Tool 6 psychological integration
- [ ] Add trauma-aware guardrails
- [ ] Port PDF generation

### Phase 3: Convert Tool 8
- [ ] Create `tools/tool8/` directory structure
- [ ] Port projection calculator from legacy
- [ ] Port scenario comparison from legacy
- [ ] Build HTML UI following Tool 4 pattern
- [ ] Implement Tool 6 → Tool 8 data flow
- [ ] Implement Tool 7 → Tool 8 psychological integration
- [ ] Add risk adjustment based on Fear/Control
- [ ] Port PDF generation

### Phase 4: Integration Layer
- [ ] Build Journey Progress dashboard widget
- [ ] Create transition messaging system
- [ ] Implement guardrail framework
- [ ] Build Final Synthesis report
- [ ] Add psychological readiness scoring

### Phase 5: Polish & Testing
- [ ] End-to-end journey testing
- [ ] Edge case handling (missing tools, partial data)
- [ ] Performance optimization
- [ ] User acceptance testing

---

## Open Questions

### Strategic Questions

1. **Tool Ordering**: Should users be able to complete structural tools without psychological tools? (e.g., Tool 4 without Tool 3)
   - Current: Backup questions allow bypass
   - Proposed: Require psychological tool OR explicit skip with warning

2. **Re-assessment**: When a user redoes Tool 1, should downstream tools prompt for review?
   - Example: "Your trauma profile changed. Would you like to review your budget?"

3. **Partial Completion**: What happens if user completes Tool 6 but not Tool 5?
   - Option A: Block Tool 6 until Tool 5 complete
   - Option B: Allow with reduced integration (no Showing/Receiving guardrails)

4. **Data Persistence**: How long should tool data persist?
   - Session only?
   - Permanent with versioning?
   - User-controlled deletion?

### Technical Questions

1. **Legacy Data Migration**: Users with legacy Tool 6/8 data - how to handle?

2. **Performance**: With 8 tools of data, will cross-tool queries be fast enough?

3. **Offline/Draft**: Should users be able to save drafts mid-tool?

4. **Mobile**: Are the calculators (Tool 4, 6, 8) mobile-friendly?

### Content Questions

1. **Guardrail Thresholds**: What trauma score triggers a guardrail?
   - Proposed: Score > 70% triggers warning
   - Score > 85% triggers hard limit with override

2. **GPT Integration**: Should Tools 6 and 8 have GPT analysis like Tools 1-5?

3. **Naming**: Should we rename tools for the integrated journey?
   - Proposed: "Discover, Clarify, Ground:Self, Allocate, Ground:Others, Optimize, Ground:Future, Project"

---

## Appendix: File Locations

### Current Production Tools
- Tool 1: `/tools/tool1/` (Tool1.js, Tool1Report.js, Tool1Templates.js)
- Tool 2: `/tools/tool2/` (Tool2.js, Tool2Report.js, Tool2GPTAnalysis.js, Tool2Fallbacks.js)
- Tool 3: `/tools/tool3/` (Tool3.js, Tool3Report.js)
- Tool 4: `/tools/tool4/` (Tool4.js, Tool4GPTAnalysis.js, Tool4Fallbacks.js)
- Tool 5: `/tools/tool5/` (Tool5.js, Tool5Report.js)

### Pending Integration
- Tool 7: `origin/claude/read-tool3-docs-...` branch (Tool7.js, Tool7Report.js)

### Legacy (Needs Conversion)
- Tool 6: `/apps/Tool-6-retirement-blueprint-tool/scripts/`
- Tool 8: `/apps/Tool-8-investment-tool/scripts/`

### Core Framework
- `/core/DataService.js` - Data persistence
- `/core/Router.js` - Tool routing
- `/core/ToolRegistry.js` - Tool registration
- `/core/ToolInterface.js` - Tool interface contract
- `/core/grounding/` - Shared grounding tool utilities

### Configuration
- `/Config.js` - Main configuration
- `/Code.js` - Entry point and tool registration

---

*This document will be updated as planning progresses and decisions are made.*
