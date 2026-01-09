# Financial TruPath Tool Integration Guide

**Last Updated:** December 31, 2025
**Version:** v1.0.0

## Overview

Financial TruPath (FTP) is a comprehensive financial coaching system that guides users through an 8-tool journey from psychological self-awareness to actionable financial planning. This document provides a complete overview of each tool's purpose, how they integrate with each other, and the data flow that creates a cohesive user experience.

---

## The TruPath Journey: At a Glance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINANCIAL TRUPATH USER JOURNEY                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: FOUNDATION                                                         │
│  ┌──────────────┐      ┌──────────────┐                                     │
│  │   TOOL 1     │ ───► │   TOOL 2     │                                     │
│  │ Core Trauma  │      │  Financial   │                                     │
│  │  Strategy    │      │   Clarity    │                                     │
│  └──────────────┘      └──────────────┘                                     │
│        │                      │                                              │
│        │    Identifies        │    Establishes financial                    │
│        │    primary trauma    │    baseline & context                       │
│        │    pattern           │                                              │
│        ▼                      ▼                                              │
│  PHASE 2: DEEP GROUNDING (Parallel paths based on Tool 1 winner)            │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │   TOOL 3     │      │   TOOL 5     │      │   TOOL 7     │              │
│  │  Identity &  │      │    Love &    │      │  Security &  │              │
│  │  Validation  │      │  Connection  │      │   Control    │              │
│  │   Grounding  │      │   Grounding  │      │   Grounding  │              │
│  └──────────────┘      └──────────────┘      └──────────────┘              │
│   FSV + ExVal           ISL + IRL            CLI + FLI                      │
│   patterns              patterns             patterns                        │
│        │                      │                      │                       │
│        └──────────────────────┼──────────────────────┘                       │
│                               ▼                                              │
│  PHASE 3: APPLICATION                                                        │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │   TOOL 4     │ ───► │   TOOL 6     │ ───► │   TOOL 8     │              │
│  │   Freedom    │      │  Retirement  │      │  Investment  │              │
│  │  Framework   │      │  Blueprint   │      │   Planning   │              │
│  │ (Calculator) │      │ (Calculator) │      │ (Calculator) │              │
│  └──────────────┘      └──────────────┘      └──────────────┘              │
│   Budget allocation     Vehicle               Long-term                      │
│   recommendations       optimization          projections                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tool Purposes & Integration Summary

| Tool | Name | Purpose | Input From | Output To |
|------|------|---------|------------|-----------|
| **1** | Core Trauma Strategy | Identify primary trauma pattern (FSV, ExVal, ISL, IRL, CLI, FLI) | None (foundation) | Tools 2, 3, 4, 5, 7 |
| **2** | Financial Clarity | Establish financial baseline, income/spending awareness | Tool 1 (name, email) | Tools 3, 4, 5, 6, 7 |
| **3** | Identity & Validation Grounding | Deep-dive into FSV & ExVal patterns | Tools 1, 2 | Tool 4 |
| **4** | Freedom Framework | Budget allocation calculator (MEFJ) | Tools 1, 2, 3 | Tool 6 |
| **5** | Love & Connection Grounding | Deep-dive into ISL & IRL patterns | Tools 1, 2, 3 | Tools 6, 7 |
| **6** | Retirement Blueprint | Retirement vehicle optimization | Tools 2, 4 | Tool 8 |
| **7** | Security & Control Grounding | Deep-dive into CLI & FLI patterns | Tools 1, 2, 5 | Tool 8 |
| **8** | Investment Planning | Long-term investment projections | Tools 6, 7 | Final deliverables |

---

## Phase 1: Foundation Tools

### Tool 1: Core Trauma Strategy Assessment

**Purpose:** The foundational psychological assessment that identifies which of six core trauma strategies most influences a user's relationship with money.

**What It Measures:**
- **False Self-View (FSV):** "I'm not worthy of financial freedom"
- **External Validation (ExVal):** "Money proves my worth to others"
- **Issues Showing Love (ISL):** "I must give to be loved"
- **Issues Receiving Love (IRL):** "I can't make it alone / I owe them everything"
- **Control Leading to Isolation (CLI):** "I must control everything"
- **Fear Leading to Isolation (FLI):** "Everything will go wrong"

**Structure:**
- 5 pages, 26 questions total
- Pages 1: Identity (name, email)
- Pages 2-4: 18 Likert-scale questions (-5 to +5)
- Page 5: 12 ranking questions (thoughts + feelings, 1-10 scale)

**Scoring Methodology:**
```
Category Score = Sum of 3 statements + (2 × Normalized Thought Ranking)
Winner = Highest score (ties broken by feeling ranking)
```

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `winner` | Primary trauma category (e.g., "FSV") | Tools 3, 4, 5, 7 for prioritization |
| `scores` | All 6 category scores | Tools 3, 5, 7 for context |
| `name`, `email` | User identity | All downstream tools |
| `rankings` | Thought/feeling rankings | Deep grounding tools |

**Integration Points:**
- Pre-fills Tool 2 with name/email
- Determines which grounding tool (3, 5, or 7) is most relevant
- Provides trauma context for Tool 4 modifiers

---

### Tool 2: Financial Clarity & Values Assessment

**Purpose:** Establishes the user's financial reality - income, spending, stress levels, and baseline money mindset. Creates the financial context for all downstream tools.

**What It Measures:**
- **Demographics:** Age, marital status, dependents, living situation
- **Employment:** Income streams, employment type, business stage
- **Money Mindset:** Scarcity vs. abundance orientation
- **Income Clarity:** Awareness, sufficiency, consistency, stress
- **Spending Clarity:** Awareness, predictability, review frequency, stress

**Structure:**
- 5 pages, 57+ questions
- Page 1: Demographics & mindset baseline (13 questions)
- Page 2: Income & spending clarity (11 questions)
- Pages 3-5: Domain-specific deep dives with GPT analysis

**Scoring Methodology:**
- Algorithmic domain scores (5 domains)
- Stress weighting (5, 4, 2, 1, 1)
- GPT-enhanced insights for free-text responses
- Priority tiers (High/Med/Low)

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `grossIncome` | Annual gross income | Tool 6 for capacity |
| `netMonthlyIncome` | Monthly net income | Tools 4, 6 for allocation |
| `savingsRate` | Current savings percentage | Tools 4, 6 |
| `clarityScores` | Income/spending awareness | Tools 3, 5, 7 for context |
| `stressLevels` | Financial stress indicators | Grounding tools |
| `mindsetBaseline` | Scarcity/abundance scores | All downstream tools |

**Integration Points:**
- Receives name/email from Tool 1
- Provides financial baseline for Tool 4 calculator
- Informs Tool 6 retirement capacity calculations
- Contextualizes grounding tools (3, 5, 7)

---

## Phase 2: Deep Grounding Tools

The three grounding tools share identical architecture but focus on different trauma domains. They use GPT analysis to generate personalized insights.

### Tool 3: Identity & Validation Grounding

**Purpose:** Deep exploration of "Disconnection from Self" - how False Self-View (FSV) and External Validation (ExVal) patterns manifest in financial behavior.

**Domains & Subdomains:**

| Domain | Subdomain | Pattern |
|--------|-----------|---------|
| **FSV** | 1.1 | "I'm Not Worthy of Financial Freedom" |
| **FSV** | 1.2 | "I'll Never Have Enough" (scarcity) |
| **FSV** | 1.3 | "I Can't See My Financial Reality" (avoidance) |
| **ExVal** | 2.1 | "Money Shows My Worth" (image spending) |
| **ExVal** | 2.2 | "What Will They Think?" (hiding/people-pleasing) |
| **ExVal** | 2.3 | "I Need to Prove Myself" (status spending) |

**Structure:**
- 7 pages (intro + 6 subdomain pages)
- Per subdomain: 4 scale questions (Belief, Behavior, Feeling, Consequence) + 1 open reflection
- GPT analysis triggered after each page

**Scoring:**
- Subdomain scores → Domain quotients → Overall "Disconnection from Self Quotient"
- Three-tier GPT synthesis (subdomain → domain → overall)

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `fsvQuotient` | False Self-View score | Tool 4 modifiers |
| `exvalQuotient` | External Validation score | Tool 4 modifiers |
| `overallQuotient` | Disconnection from Self score | Tool 4 priority |
| `gptInsights` | Personalized pattern analysis | Report generation |
| `subdomainScores` | 6 subdomain breakdowns | Detailed reports |

**Integration Points:**
- Uses Tool 1 FSV/ExVal scores for context
- Uses Tool 2 financial clarity for grounding
- Provides 29 modifiers to Tool 4

---

### Tool 5: Love & Connection Grounding

**Purpose:** Deep exploration of "Disconnection from Others" - how Issues Showing Love (ISL) and Issues Receiving Love (IRL) patterns manifest in financial relationships.

**Domains & Subdomains:**

| Domain | Subdomain | Pattern |
|--------|-----------|---------|
| **ISL** | 1.1 | "I Must Give to Be Loved" (compulsive giving) |
| **ISL** | 1.2 | "Their Needs > My Needs" (self-abandonment) |
| **ISL** | 1.3 | "I Can't Accept Help" (refusing to receive) |
| **IRL** | 2.1 | "I Can't Make It Alone" (financial dependency) |
| **IRL** | 2.2 | "I Owe Them Everything" (debt/obligation) |
| **IRL** | 2.3 | "I Stay in Debt" (chronic debt patterns) |

**Structure:** Identical to Tool 3 (7 pages, same scoring pattern)

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `islQuotient` | Issues Showing Love score | Tools 6, 7 context |
| `irlQuotient` | Issues Receiving Love score | Tools 6, 7 context |
| `overallQuotient` | Disconnection from Others score | Tools 6, 7 |
| `gptInsights` | Relationship pattern analysis | Report generation |

**Integration Points:**
- Uses Tool 1 Showing/Receiving scores
- Uses Tool 2 spending patterns (on others vs. self)
- Informs Tool 7 isolation patterns

---

### Tool 7: Security & Control Grounding

**Purpose:** Deep exploration of "Disconnection from All That's Greater" - how Control and Fear patterns create isolation from support, growth, and trust.

**Domains & Subdomains:**

| Domain | Subdomain | Pattern |
|--------|-----------|---------|
| **CLI** | 1.1 | "I Must Control Everything" (total control need) |
| **CLI** | 1.2 | "I Can't Trust Others" (distrust/self-reliance) |
| **CLI** | 1.3 | "Asking for Help Is Weakness" (martyr suffering) |
| **FLI** | 2.1 | "Everything Will Go Wrong" (catastrophic thinking) |
| **FLI** | 2.2 | "Better the Devil I Know" (fear of change) |
| **FLI** | 2.3 | "I Always Trust the Wrong People" (betrayal expectation) |

**Structure:** Identical to Tools 3 and 5

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `cliQuotient` | Control Leading to Isolation score | Tool 8 context |
| `fliQuotient` | Fear Leading to Isolation score | Tool 8 context |
| `overallQuotient` | Disconnection from Greater score | Tool 8 |
| `gptInsights` | Trust/control pattern analysis | Report generation |

**Integration Points:**
- Uses Tool 1 Control/Fear scores
- Uses Tool 2 financial security patterns
- Compounds with Tool 5 isolation patterns
- Informs Tool 8 risk tolerance context

---

## Phase 3: Application Tools (Calculators)

### Tool 4: Freedom Framework (Budget Allocation Calculator)

**Purpose:** Interactive budget allocation calculator that translates trauma-informed insights into actionable MEFJ (Money/Essential/Freedom/Journey) budget recommendations.

**What It Calculates:**
- **M (Money/Essential):** Fixed essential expenses (housing, utilities, insurance)
- **E (Emergency):** Emergency fund building
- **F (Freedom):** Discretionary spending (lifestyle, wants)
- **J (Journey):** Investments and wealth building

**Architecture:**
- Single-page interactive calculator
- Real-time client-side calculations
- 10 progressively-unlocked financial priorities
- 29 trauma-informed modifiers from Tools 1, 2, 3
- Multiple scenario capability

**Pre-Survey Data Collected:**
- Monthly income
- Monthly essential expenses
- Monthly other expenses
- Current debt level
- Current emergency fund
- Overall financial satisfaction

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `mefjAllocation` | Percentage breakdown | Tool 6 savings input |
| `monthlyAllocation` | Dollar amounts per category | Tool 6 |
| `prioritizedActions` | Ranked action steps | User guidance |
| `scenarios` | Saved allocation scenarios | Comparison |
| `pdfReport` | Downloadable allocation plan | User deliverable |

**Integration Points:**
- Uses Tool 1 winner for priority emphasis
- Uses Tool 2 income/expense baseline
- Uses Tool 3 modifiers (FSV/ExVal patterns)
- Provides savings rate to Tool 6
- Backup survey if Tools 1-3 not completed

---

### Tool 6: Retirement Blueprint (Vehicle Optimization Calculator)

> **Status:** Legacy tool being converted to calculator version

**Purpose:** Optimize retirement savings allocation across 15+ tax-advantaged vehicles based on user profile, income, and goals.

**Current Legacy Architecture:**
- 2-phase Google Forms (46 universal + 46-50 profile-specific questions)
- 9 client profiles (ROBS, Solo 401k, Roth Reclaimer, Foundation Builder, etc.)
- Profile-specific helper functions for vehicle ordering
- Generates branded PDF retirement blueprint documents

**Retirement Vehicles Optimized:**
| Category | Vehicles |
|----------|----------|
| **Employer** | 401(k) Traditional, 401(k) Roth, 401(k) Match |
| **Self-Employed** | Solo 401(k) Employee, Solo 401(k) Employer, SEP IRA |
| **Individual** | Traditional IRA, Roth IRA, Backdoor Roth IRA |
| **Business** | ROBS, Defined Benefit Plan |
| **Health** | HSA (triple tax advantage) |
| **Education** | CESA, 529 Plan, Roth IRA (education use) |

**Key Calculations:**
- IRS contribution limits (with catch-up at 50/60)
- Roth IRA phase-out logic
- Vehicle capacity based on income and employment type
- Future value projections (investment score → return rate)
- Actual vs. Ideal allocation gap analysis

**Key Outputs:**
| Output | Description | Used By |
|--------|-------------|---------|
| `vehicleRecommendations` | Ordered list with amounts | User action plan |
| `monthlyContributions` | Per-vehicle amounts | Tool 8 baseline |
| `futureProjections` | 10/20/30-year projections | Tool 8 validation |
| `pdfBlueprint` | Branded retirement document | User deliverable |
| `opportunityGap` | Current vs. optimized delta | Motivation |

**Planned Calculator Conversion:**
- Interactive single-page calculator (like Tool 4)
- Real-time vehicle allocation updates
- Algorithm-driven vehicle selection (vs. 9 hardcoded profiles)
- Multiple scenario comparison (Conservative/Aggressive/Balanced)
- Embedded document generation

**Integration Points:**
- Uses Tool 2 gross income and savings rate
- Uses Tool 4 MEFJ allocation (specifically "J" Journey category)
- Provides vehicle-level detail to Tool 8
- Generates professional deliverable documents

---

### Tool 8: Investment Planning (Long-Term Projections)

> **Status:** Integrating as-is into unified system

**Purpose:** Comprehensive retirement projection calculator that answers three key questions:
1. "How much do I need to save monthly?" (Contribution Mode)
2. "What return rate do I need?" (Returns Mode)
3. "How many years until retirement?" (Time Mode)

**Key Features:**
- Three solving modes (contribution, return, time)
- Risk tolerance dial (0-10) → realistic return mapping (4.5%-25%)
- Conservative pacing model (75% effective return for deployment timing)
- Scenario management (save up to 10 scenarios)
- Side-by-side scenario comparison
- Professional PDF report generation

**Primary Inputs (4 dials):**
| Input | Range | Description |
|-------|-------|-------------|
| Monthly Retirement Income Goal | $500-$40,000 | Target income in today's dollars |
| Years Until Retirement | 0-60 | Time horizon |
| Investment Risk Tolerance | 0-10 | Risk appetite (maps to return) |
| Return Rate Override | 0-30% | Optional manual return rate |

**Additional Inputs:**
- Monthly savings capacity
- Current investment balance
- Inflation rate (default 2.5%)
- Retirement duration (default 30 years)
- Maintenance return rate (default 10%)

**Key Calculations:**
```
Risk → Return: Sigmoid curve from 4.5% (very low risk) to 25% (very high risk)
Required Nest Egg: Future income need adjusted for inflation and draw period
Effective Return: Target return × (1 - deployment_drag) + cash_rate × deployment_drag
Three Solvers: Bisection search for contribution, return, or time target
```

**Key Outputs:**
| Output | Description | Format |
|--------|-------------|--------|
| Monthly Savings Required | Contribution mode result | Dollar amount |
| Required Return Rate | Returns mode result | Percentage |
| Years Needed | Time mode result | Years |
| Feasibility Status | ✅ Feasible / ⚠️ Needs Adjustment / ❌ Not Feasible | Badge |
| Required Nest Egg | Total savings target | Dollar amount |
| Individual Scenario PDF | Detailed analysis with recommendations | 8-10 page PDF |
| Comparison PDF | Side-by-side scenario analysis | 8-10 page PDF |

**Integration Points:**
- Standalone authentication (Client ID validation)
- Uses savings capacity from Tool 4/6 (when integrated)
- Uses risk context from Tool 7 (control/fear patterns)
- Scenario data saved to dedicated spreadsheet
- PDF reports saved to shared Drive folder

---

## Data Flow Architecture

### Cross-Tool Data Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TOOL 1 ──────────────────────────────────────────────────────────────────► │
│  │ winner, scores, name, email                                              │
│  │                                                                           │
│  ├──► TOOL 2 ──────────────────────────────────────────────────────────────►│
│  │    │ income, savings, clarity, stress, mindset                           │
│  │    │                                                                      │
│  │    ├──► TOOL 3 ─────────────────────────────────────────────────────────►│
│  │    │    │ FSV quotient, ExVal quotient, GPT insights                     │
│  │    │    │                                                                 │
│  │    │    └──► TOOL 4 ────────────────────────────────────────────────────►│
│  │    │         │ MEFJ allocation, modifiers, priorities                    │
│  │    │         │                                                            │
│  │    ├──► TOOL 5 ─────────────────────────────────────────────────────────►│
│  │    │    │ ISL quotient, IRL quotient, relationship patterns              │
│  │    │    │                                                                 │
│  │    │    └──► TOOL 7 ────────────────────────────────────────────────────►│
│  │    │         │ CLI quotient, FLI quotient, trust patterns                │
│  │    │         │                                                            │
│  │    └──► TOOL 6 ─────────────────────────────────────────────────────────►│
│  │         │ Vehicle recommendations, contributions, projections            │
│  │         │                                                                 │
│  │         └──► TOOL 8 ────────────────────────────────────────────────────►│
│  │              │ Long-term projections, scenarios, feasibility             │
│  │              │                                                            │
│  │              └──► FINAL DELIVERABLES                                     │
│  │                   • Comprehensive financial plan                          │
│  │                   • PDF reports (allocation, retirement, investment)      │
│  │                   • Actionable recommendations                            │
│  │                   • Progress tracking                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Data Handoffs

| From | To | Data Passed | Purpose |
|------|----|-----------:|---------|
| Tool 1 | Tool 2 | `name`, `email` | Pre-fill identity |
| Tool 1 | Tools 3,5,7 | `winner`, `scores` | Contextualize grounding |
| Tool 1 | Tool 4 | `winner`, `scores` | Apply trauma modifiers |
| Tool 2 | Tool 4 | `netMonthlyIncome`, `expenses` | Budget baseline |
| Tool 2 | Tool 6 | `grossIncome`, `savingsRate` | Retirement capacity |
| Tool 2 | Tools 3,5,7 | `clarityScores`, `stress` | Financial context |
| Tool 3 | Tool 4 | 29 modifiers (FSV/ExVal patterns) | Allocation adjustments |
| Tool 4 | Tool 6 | `journeyAllocation` (savings %) | Vehicle fill capacity |
| Tool 5 | Tool 7 | Isolation patterns | Compound analysis |
| Tool 6 | Tool 8 | Vehicle allocations, projections | Baseline for modeling |
| Tool 7 | Tool 8 | Control/fear quotients | Risk context |

---

## User Journey Narrative

### Stage 1: Self-Discovery (Tools 1-2)

**User Experience:**
> "I start by understanding my psychological relationship with money. Tool 1 reveals that my primary pattern is External Validation - I tend to spend to impress others. Tool 2 then grounds this in my actual financial situation: I make $85K/year, but I only save 8% because of lifestyle inflation."

**What Happens:**
1. User completes 26-question trauma assessment
2. System identifies dominant pattern (e.g., ExVal)
3. User completes financial clarity assessment
4. System establishes baseline income, spending, and stress levels

### Stage 2: Deep Understanding (Tools 3, 5, 7)

**User Experience:**
> "Now I dig deeper into WHY I spend this way. Tool 3 explores my 'Money Shows My Worth' belief and 'What Will They Think?' anxiety. I realize I'm spending $500/month on image-maintenance that doesn't align with my values."

**What Happens:**
1. User explores 6 subdomains related to their pattern
2. GPT generates personalized insights based on reflections
3. Quotient scores quantify pattern intensity
4. System builds comprehensive psychological profile

### Stage 3: Practical Application (Tools 4, 6, 8)

**User Experience:**
> "With my patterns understood, Tool 4 helps me create a budget that accounts for my tendencies. I allocate 15% to 'Freedom' (controlled discretionary spending) instead of letting it leak unconsciously. Tool 6 optimizes my retirement vehicles, and Tool 8 shows I can retire at 62 if I stay on track."

**What Happens:**
1. Tool 4 applies 29 modifiers to create trauma-informed budget
2. Tool 6 optimizes retirement vehicle allocation
3. Tool 8 projects long-term outcomes with multiple scenarios
4. User receives actionable PDF reports

---

## Integration Patterns

### Pattern 1: Linear Progression
Tools unlock sequentially as prerequisites are completed:
```
Tool 1 ✓ → Tool 2 unlocks
Tool 2 ✓ → Tools 3, 4, 5, 7 unlock
Tool 3 ✓ → Tool 4 enhanced with modifiers
Tool 4 ✓ → Tool 6 unlocks
Tool 5 ✓ → Tool 7 enhanced
Tool 6 ✓ → Tool 8 unlocks
```

### Pattern 2: Fallback Mechanisms
If upstream tools are not completed, calculators use backup surveys:
```javascript
// Tool 4 example
if (Tool1.isComplete() && Tool2.isComplete() && Tool3.isComplete()) {
  modifiers = collectModifiersFromTools();
} else {
  modifiers = collectModifiersFromBackupSurvey();
}
```

### Pattern 3: GPT Integration (Grounding Tools)
```
Page Submit → Background GPT Analysis → Cache Result
                    ↓
Final Submit → Retrieve Cached Insights → Synthesize → Save
                    ↓
Report Display → Show Personalized Insights
```

### Pattern 4: Calculator Architecture
All three calculators (Tools 4, 6, 8) share similar patterns:
- Single-page interactive UI
- Real-time calculation updates
- Scenario save/compare capability
- PDF export functionality
- Modular configuration objects

---

## Implementation Status

| Tool | Architecture | Status | Notes |
|------|-------------|--------|-------|
| Tool 1 | Multi-page form | ✅ Production | Foundation tool |
| Tool 2 | Multi-page form + GPT | ✅ Production | GPT insights for free-text |
| Tool 3 | Multi-page form + GPT | ✅ Production | Identity grounding |
| Tool 4 | Single-page calculator | ✅ Production | MEFJ allocation |
| Tool 5 | Multi-page form + GPT | ✅ Production | Love grounding |
| Tool 6 | Legacy forms → Calculator | 🔄 Converting | Vehicle optimization |
| Tool 7 | Multi-page form + GPT | ✅ Production | Security grounding |
| Tool 8 | Standalone calculator | 🔄 Integrating | Investment projections |

---

## Technical Reference

### File Locations

```
FTP-v3/
├── tools/
│   ├── tool1/
│   │   ├── Tool1.js          # Main tool logic
│   │   ├── Tool1Report.js    # Report generation
│   │   └── Tool1Templates.js # HTML templates
│   ├── tool2/
│   │   ├── Tool2.js
│   │   ├── Tool2Report.js
│   │   ├── Tool2GPTAnalysis.js
│   │   └── Tool2Fallbacks.js
│   ├── tool3/
│   │   ├── Tool3.js
│   │   └── Tool3Report.js
│   ├── tool4/
│   │   ├── Tool4.js
│   │   ├── Tool4GPTAnalysis.js
│   │   └── Tool4Fallbacks.js
│   ├── tool5/
│   │   ├── Tool5.js
│   │   └── Tool5Report.js
│   └── tool7/
│       ├── Tool7.js
│       └── Tool7Report.js
├── apps/
│   ├── Tool-6-retirement-blueprint-tool/  # Legacy (converting)
│   └── Tool-8-investment-tool/            # Integrating as-is
└── docs/
    ├── ARCHITECTURE.md       # Technical architecture
    └── TOOL-INTEGRATION-GUIDE.md  # This document
```

### Configuration Constants

Key configuration values that connect tools:

```javascript
// Tool ordering and progression
CONFIG.TOOLS = {
  tool1: { prerequisites: [], unlocks: ['tool2'] },
  tool2: { prerequisites: ['tool1'], unlocks: ['tool3', 'tool4', 'tool5', 'tool7'] },
  tool3: { prerequisites: ['tool2'], unlocks: [] },
  tool4: { prerequisites: ['tool2'], unlocks: ['tool6'] },
  tool5: { prerequisites: ['tool2'], unlocks: ['tool7'] },
  tool6: { prerequisites: ['tool4'], unlocks: ['tool8'] },
  tool7: { prerequisites: ['tool5'], unlocks: ['tool8'] },
  tool8: { prerequisites: ['tool6', 'tool7'], unlocks: [] }
};

// Modifier mappings (Tool 4)
CONFIG.MODIFIERS = {
  fromTool1: ['winner', 'fsvScore', 'exvalScore', 'islScore', 'irlScore', 'cliScore', 'fliScore'],
  fromTool2: ['incomeClarity', 'spendingClarity', 'stressLevel', 'mindsetScore'],
  fromTool3: ['fsvQuotient', 'exvalQuotient', 'subdomainScores']
  // ... 29 total modifiers
};
```

---

## Appendix: Tool Comparison Matrix

| Aspect | Tool 1 | Tool 2 | Tool 3 | Tool 4 | Tool 5 | Tool 6 | Tool 7 | Tool 8 |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|
| **Type** | Assessment | Assessment | Grounding | Calculator | Grounding | Calculator | Grounding | Calculator |
| **Pages** | 5 | 5 | 7 | 1 | 7 | TBD | 7 | 1 |
| **Questions** | 26 | 57+ | 30 | Pre-survey | 30 | ~92 | 30 | 10+ |
| **GPT** | No | Yes | Yes | No | Yes | No | Yes | No |
| **PDF Output** | Report | Report | Report | Allocation | Report | Blueprint | Report | Projection |
| **Real-time Calc** | No | No | No | Yes | Yes | Planned | No | Yes |
| **Scenarios** | No | No | No | Yes | No | Planned | No | Yes |

---

## Complete Data Map: Inputs, Outputs & Insights

This section provides the foundation for a complete data map, documenting every input collected, output generated, and insight created by each tool.

---

### Tool 1: Core Trauma Strategy Assessment - Data Map

#### User Inputs

| Page | Field ID | Field Label | Input Type | Values/Range | Required |
|------|----------|-------------|------------|--------------|----------|
| 1 | `name` | Full Name | Text | Free text | Yes |
| 1 | `email` | Email Address | Email | Valid email | Yes |
| 2 | `q3` | "I often feel like I'm not good enough" | Likert | -5 to +5 | Yes |
| 2 | `q4` | "I believe I'll never have enough money" | Likert | -5 to +5 | Yes |
| 2 | `q5` | "I avoid looking at my finances" | Likert | -5 to +5 | Yes |
| 2 | `q6` | "I need others to validate my worth" | Likert | -5 to +5 | Yes |
| 2 | `q7` | "I spend to impress others" | Likert | -5 to +5 | Yes |
| 2 | `q8` | "I hide my financial struggles" | Likert | -5 to +5 | Yes |
| 3 | `q10` | "I give more than I receive" | Likert | -5 to +5 | Yes |
| 3 | `q11` | "Others' needs come before mine" | Likert | -5 to +5 | Yes |
| 3 | `q12` | "I struggle to accept help" | Likert | -5 to +5 | Yes |
| 3 | `q13` | "I feel I can't make it alone" | Likert | -5 to +5 | Yes |
| 3 | `q14` | "I feel obligated to repay kindness" | Likert | -5 to +5 | Yes |
| 3 | `q15` | "I stay in debt to others" | Likert | -5 to +5 | Yes |
| 4 | `q17` | "I must control everything" | Likert | -5 to +5 | Yes |
| 4 | `q18` | "I can't trust others with money" | Likert | -5 to +5 | Yes |
| 4 | `q19` | "Asking for help is weakness" | Likert | -5 to +5 | Yes |
| 4 | `q20` | "I expect things to go wrong" | Likert | -5 to +5 | Yes |
| 4 | `q21` | "I fear change even when stuck" | Likert | -5 to +5 | Yes |
| 4 | `q22` | "I trust the wrong people" | Likert | -5 to +5 | Yes |
| 5 | `thought_fsv` | FSV Thought Ranking | Rank | 1-10 | Yes |
| 5 | `thought_exval` | ExVal Thought Ranking | Rank | 1-10 | Yes |
| 5 | `thought_isl` | ISL Thought Ranking | Rank | 1-10 | Yes |
| 5 | `thought_irl` | IRL Thought Ranking | Rank | 1-10 | Yes |
| 5 | `thought_cli` | CLI Thought Ranking | Rank | 1-10 | Yes |
| 5 | `thought_fli` | FLI Thought Ranking | Rank | 1-10 | Yes |
| 5 | `feeling_fsv` | FSV Feeling Ranking | Rank | 1-10 | Yes |
| 5 | `feeling_exval` | ExVal Feeling Ranking | Rank | 1-10 | Yes |
| 5 | `feeling_isl` | ISL Feeling Ranking | Rank | 1-10 | Yes |
| 5 | `feeling_irl` | IRL Feeling Ranking | Rank | 1-10 | Yes |
| 5 | `feeling_cli` | CLI Feeling Ranking | Rank | 1-10 | Yes |
| 5 | `feeling_fli` | FLI Feeling Ranking | Rank | 1-10 | Yes |

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type | Range |
|-----------|-------------|-------------|-----------|-------|
| `fsvScore` | False Self-View Score | q3 + q4 + q5 + (2 × normalizedThought) | Number | -25 to +25 |
| `exvalScore` | External Validation Score | q6 + q7 + q8 + (2 × normalizedThought) | Number | -25 to +25 |
| `islScore` | Issues Showing Love Score | q10 + q11 + q12 + (2 × normalizedThought) | Number | -25 to +25 |
| `irlScore` | Issues Receiving Love Score | q13 + q14 + q15 + (2 × normalizedThought) | Number | -25 to +25 |
| `cliScore` | Control Leading to Isolation Score | q17 + q18 + q19 + (2 × normalizedThought) | Number | -25 to +25 |
| `fliScore` | Fear Leading to Isolation Score | q20 + q21 + q22 + (2 × normalizedThought) | Number | -25 to +25 |
| `winner` | Primary Trauma Category | Highest score (ties: highest feeling rank) | String | FSV, ExVal, ISL, IRL, CLI, FLI |
| `allScores` | All 6 category scores | Object with all scores | Object | - |

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `primary_pattern` | Dominant trauma pattern identified | Always generated | 2, 3, 4, 5, 7 | HIGH |
| `secondary_pattern` | Second-highest trauma pattern | Score >= 80% of winner | 3, 5, 7 | MEDIUM |
| `pattern_intensity` | Strength of primary pattern | winner score > 15 | 4 | HIGH |
| `disconnection_type` | Category of disconnection | Based on winner pair | 3, 5, 7 | HIGH |

---

### Tool 2: Financial Clarity & Values Assessment - Data Map

#### User Inputs

| Page | Field ID | Field Label | Input Type | Values/Range | Required |
|------|----------|-------------|------------|--------------|----------|
| 1 | `name` | Full Name | Text | Pre-filled from Tool 1 | Yes |
| 1 | `email` | Email Address | Email | Pre-filled from Tool 1 | Yes |
| 1 | `studentId` | Student ID | Text | System-assigned | Yes |
| 1 | `age` | Current Age | Number | 18-100 | Yes |
| 1 | `maritalStatus` | Marital Status | Select | Single, Married, Divorced, Widowed, Partnered | Yes |
| 1 | `dependents` | Number of Dependents | Number | 0-20 | Yes |
| 1 | `livingSituation` | Living Situation | Select | Own, Rent, With Family, Other | Yes |
| 1 | `employmentType` | Employment Type | Multi-select | W-2, Self-Employed, Business Owner, Retired, Unemployed | Yes |
| 1 | `businessStage` | Business Stage | Select | Startup, Growth, Mature, Exit (conditional) | Conditional |
| 1 | `grossAnnualIncome` | Gross Annual Income | Currency | $0+ | Yes |
| 1 | `incomeStreams` | Income Streams | Textarea | Free text list | Yes |
| 1 | `holisticMindset` | Holistic Scarcity-Abundance | Likert | -5 to +5 | Yes |
| 1 | `financialMindset` | Financial Scarcity-Abundance | Likert | -5 to +5 | Yes |
| 1 | `moneyRelationship` | Money Relationship Quality | Likert | -5 to +5 | Yes |
| 2 | `incomeClarity` | Income Awareness Level | Likert | -5 to +5 | Yes |
| 2 | `incomeSufficiency` | Income Adequacy | Likert | -5 to +5 | Yes |
| 2 | `incomeConsistency` | Income Predictability | Likert | -5 to +5 | Yes |
| 2 | `incomeStress` | Income-Related Stress | Likert | -5 to +5 | Yes |
| 2 | `incomeSources` | All Income Sources | Textarea | Free text | Yes |
| 2 | `spendingClarity` | Spending Awareness | Likert | -5 to +5 | Yes |
| 2 | `spendingConsistency` | Spending Predictability | Likert | -5 to +5 | Yes |
| 2 | `spendingReviewFreq` | Review Frequency | Likert | -5 to +5 | Yes |
| 2 | `spendingStress` | Spending-Related Stress | Likert | -5 to +5 | Yes |
| 2 | `majorExpenses` | Largest Spending Categories | Textarea | Free text | Yes |
| 2 | `wastefulSpending` | Unnecessary Spending | Textarea | Free text | Yes |
| 3-5 | `domain_*` | Domain-specific questions | Various | Various | Yes |

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type | Range |
|-----------|-------------|-------------|-----------|-------|
| `netMonthlyIncome` | Net Monthly Income | grossAnnualIncome / 12 × taxFactor | Currency | $0+ |
| `incomeClarityScore` | Income Domain Score | Weighted avg of income questions | Number | 0-100 |
| `spendingClarityScore` | Spending Domain Score | Weighted avg of spending questions | Number | 0-100 |
| `overallClarityScore` | Total Financial Clarity | (income + spending + domains) / 3 | Number | 0-100 |
| `stressIndex` | Financial Stress Level | Weighted stress questions (5,4,2,1,1) | Number | 0-100 |
| `mindsetScore` | Scarcity-Abundance Score | Avg of mindset questions | Number | -5 to +5 |
| `savingsRate` | Estimated Savings Rate | Derived from income/spending | Percentage | 0-100% |
| `domainScores` | 5 Domain Breakdown | Individual domain calculations | Object | - |
| `priorityTiers` | High/Med/Low Priorities | Based on stress × impact | Object | - |
| `gptInsights` | GPT-Enhanced Insights | Analysis of free-text responses | Object | - |

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `income_stability` | Income consistency assessment | incomeConsistency < -2 | 4, 6 | HIGH |
| `spending_awareness` | Spending visibility level | spendingClarity < 0 | 3, 4 | MEDIUM |
| `financial_stress` | Overall stress indicator | stressIndex > 70 | 3, 5, 7 | HIGH |
| `savings_capacity` | Savings potential | savingsRate calculated | 4, 6, 8 | HIGH |
| `mindset_baseline` | Scarcity/abundance orientation | mindsetScore | 3, 4, 5, 7 | MEDIUM |
| `age_urgency` | Time-sensitive recommendations | age >= 55 | 6, 8 | HIGH |
| `business_complexity` | Self-employment factors | employmentType includes Business | 6 | MEDIUM |

---

### Tool 3: Identity & Validation Grounding - Data Map

#### User Inputs

| Page | Field ID | Field Label | Input Type | Values/Range | Required |
|------|----------|-------------|------------|--------------|----------|
| 2 | `sd1_1_belief` | Subdomain 1.1 Belief | Likert | -3 to +3 | Yes |
| 2 | `sd1_1_behavior` | Subdomain 1.1 Behavior | Likert | -3 to +3 | Yes |
| 2 | `sd1_1_feeling` | Subdomain 1.1 Feeling | Likert | -3 to +3 | Yes |
| 2 | `sd1_1_consequence` | Subdomain 1.1 Consequence | Likert | -3 to +3 | Yes |
| 2 | `sd1_1_reflection` | Subdomain 1.1 Reflection | Textarea | Free text (GPT analyzed) | Yes |
| 3 | `sd1_2_belief` | Subdomain 1.2 Belief | Likert | -3 to +3 | Yes |
| 3 | `sd1_2_behavior` | Subdomain 1.2 Behavior | Likert | -3 to +3 | Yes |
| 3 | `sd1_2_feeling` | Subdomain 1.2 Feeling | Likert | -3 to +3 | Yes |
| 3 | `sd1_2_consequence` | Subdomain 1.2 Consequence | Likert | -3 to +3 | Yes |
| 3 | `sd1_2_reflection` | Subdomain 1.2 Reflection | Textarea | Free text (GPT analyzed) | Yes |
| 4 | `sd1_3_*` | Subdomain 1.3 (4 aspects + reflection) | Various | Same pattern | Yes |
| 5 | `sd2_1_*` | Subdomain 2.1 (4 aspects + reflection) | Various | Same pattern | Yes |
| 6 | `sd2_2_*` | Subdomain 2.2 (4 aspects + reflection) | Various | Same pattern | Yes |
| 7 | `sd2_3_*` | Subdomain 2.3 (4 aspects + reflection) | Various | Same pattern | Yes |

**Total: 24 scale questions + 6 open reflections = 30 inputs**

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type | Range |
|-----------|-------------|-------------|-----------|-------|
| `sd1_1_score` | Subdomain 1.1 Score | avg(belief, behavior, feeling, consequence) | Number | -3 to +3 |
| `sd1_2_score` | Subdomain 1.2 Score | avg(belief, behavior, feeling, consequence) | Number | -3 to +3 |
| `sd1_3_score` | Subdomain 1.3 Score | avg(belief, behavior, feeling, consequence) | Number | -3 to +3 |
| `sd2_1_score` | Subdomain 2.1 Score | avg(belief, behavior, feeling, consequence) | Number | -3 to +3 |
| `sd2_2_score` | Subdomain 2.2 Score | avg(belief, behavior, feeling, consequence) | Number | -3 to +3 |
| `sd2_3_score` | Subdomain 2.3 Score | avg(belief, behavior, feeling, consequence) | Number | -3 to +3 |
| `fsvQuotient` | Domain 1: False Self-View | avg(sd1_1, sd1_2, sd1_3) normalized | Number | 0-100 |
| `exvalQuotient` | Domain 2: External Validation | avg(sd2_1, sd2_2, sd2_3) normalized | Number | 0-100 |
| `overallQuotient` | Disconnection from Self | avg(fsvQuotient, exvalQuotient) | Number | 0-100 |
| `gptSubdomainInsights` | Per-subdomain GPT analysis | 6 insights from reflections | Object | - |
| `gptDomainSynthesis` | Domain-level GPT synthesis | 2 domain syntheses | Object | - |
| `gptOverallSynthesis` | Overall GPT synthesis | Combined analysis | String | - |

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `fsv_intensity` | False Self-View pattern strength | fsvQuotient > 60 | 4 | HIGH |
| `exval_intensity` | External Validation pattern strength | exvalQuotient > 60 | 4 | HIGH |
| `worthiness_block` | "Not worthy" belief active | sd1_1_score > 1.5 | 4 | HIGH |
| `scarcity_mindset` | "Never enough" belief active | sd1_2_score > 1.5 | 4 | HIGH |
| `avoidance_pattern` | Financial avoidance active | sd1_3_score > 1.5 | 4 | MEDIUM |
| `image_spending` | Spending for image | sd2_1_score > 1.5 | 4 | HIGH |
| `people_pleasing` | Financial people-pleasing | sd2_2_score > 1.5 | 4 | MEDIUM |
| `status_seeking` | Status spending pattern | sd2_3_score > 1.5 | 4 | MEDIUM |

---

### Tool 4: Freedom Framework Calculator - Data Map

#### User Inputs

| Section | Field ID | Field Label | Input Type | Values/Range | Required |
|---------|----------|-------------|------------|--------------|----------|
| Pre-Survey | `monthlyIncome` | Monthly Net Income | Currency | $0+ | Yes |
| Pre-Survey | `essentialExpenses` | Monthly Essential Expenses | Currency | $0+ | Yes |
| Pre-Survey | `otherExpenses` | Monthly Other Expenses | Currency | $0+ | Yes |
| Pre-Survey | `currentDebt` | Current Total Debt | Currency | $0+ | Yes |
| Pre-Survey | `emergencyFund` | Current Emergency Fund | Currency | $0+ | Yes |
| Pre-Survey | `satisfaction` | Overall Financial Satisfaction | Likert | 1-10 | Yes |
| Calculator | `selectedPriority` | Financial Priority Selection | Select | 10 options (progressive unlock) | Yes |
| Calculator | `mefjSliders` | MEFJ Allocation Adjustments | Sliders | 0-100% each | Yes |
| Backup* | `backupTraumaQuestions` | If Tools 1-3 incomplete | Various | Mirrors Tool 1 | Conditional |

*Backup questions only appear if upstream tools not completed

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type | Range |
|-----------|-------------|-------------|-----------|-------|
| `availableCash` | Monthly Disposable Income | monthlyIncome - essentialExpenses | Currency | $0+ |
| `debtToIncomeRatio` | DTI Ratio | (currentDebt / 12) / monthlyIncome | Percentage | 0-100%+ |
| `emergencyMonths` | Emergency Fund Months | emergencyFund / essentialExpenses | Number | 0-24+ |
| `mAllocation` | Money/Essential % | Based on priority + modifiers | Percentage | 0-100% |
| `eAllocation` | Emergency % | Based on priority + modifiers | Percentage | 0-100% |
| `fAllocation` | Freedom % | Based on priority + modifiers | Percentage | 0-100% |
| `jAllocation` | Journey % | Based on priority + modifiers | Percentage | 0-100% |
| `mDollars` | Money/Essential $ | availableCash × mAllocation | Currency | $0+ |
| `eDollars` | Emergency $ | availableCash × eAllocation | Currency | $0+ |
| `fDollars` | Freedom $ | availableCash × fAllocation | Currency | $0+ |
| `jDollars` | Journey $ | availableCash × jAllocation | Currency | $0+ |
| `prioritizedActions` | Ranked Action Steps | Based on priority + situation | Array | - |
| `modifiersApplied` | Which modifiers affected allocation | From Tools 1, 2, 3 | Object | - |
| `scenarioData` | Saved scenario for comparison | All inputs + outputs | Object | - |

#### Trauma-Informed Modifiers (29 Total)

| Modifier Source | Modifier ID | Effect on Allocation |
|-----------------|-------------|----------------------|
| Tool 1 | `winner` | Emphasizes relevant MEFJ category |
| Tool 1 | `fsvScore` | Adjusts J allocation if high |
| Tool 1 | `exvalScore` | Adjusts F allocation if high |
| Tool 1 | `islScore` | Flags giving patterns in F |
| Tool 1 | `irlScore` | Flags dependency in M |
| Tool 1 | `cliScore` | Adjusts E allocation (safety focus) |
| Tool 1 | `fliScore` | Adjusts E allocation (fear-based) |
| Tool 2 | `incomeClarity` | Confidence in M allocation |
| Tool 2 | `spendingClarity` | Confidence in F allocation |
| Tool 2 | `stressIndex` | Priority weighting |
| Tool 2 | `mindsetScore` | J allocation comfort |
| Tool 2 | `savingsRate` | Baseline for J |
| Tool 3 | `fsvQuotient` | Worth-based J resistance |
| Tool 3 | `exvalQuotient` | Image-based F inflation |
| Tool 3 | `sd1_1_score` | Worthiness modifier |
| Tool 3 | `sd1_2_score` | Scarcity modifier |
| Tool 3 | `sd1_3_score` | Avoidance modifier |
| Tool 3 | `sd2_1_score` | Image spending modifier |
| Tool 3 | `sd2_2_score` | People-pleasing modifier |
| Tool 3 | `sd2_3_score` | Status modifier |
| ... | ... | (29 total modifiers) |

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `savings_potential` | Monthly savings capacity | jDollars calculated | 6 | HIGH |
| `debt_priority` | Debt payoff urgency | debtToIncomeRatio > 36% | 6 | HIGH |
| `emergency_gap` | Emergency fund shortfall | emergencyMonths < 3 | 6 | HIGH |
| `lifestyle_inflation` | Freedom spending high | fAllocation > 30% with debt | 6 | MEDIUM |
| `investment_ready` | Ready for retirement focus | emergencyMonths >= 6, debt low | 6, 8 | HIGH |

---

### Tool 5: Love & Connection Grounding - Data Map

#### User Inputs

| Page | Field ID | Field Label | Input Type | Values/Range | Required |
|------|----------|-------------|------------|--------------|----------|
| 2-4 | `sd1_*` | ISL Subdomains (1.1, 1.2, 1.3) | Same as Tool 3 | -3 to +3 + text | Yes |
| 5-7 | `sd2_*` | IRL Subdomains (2.1, 2.2, 2.3) | Same as Tool 3 | -3 to +3 + text | Yes |

**Total: 24 scale questions + 6 open reflections = 30 inputs** (identical structure to Tool 3)

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type | Range |
|-----------|-------------|-------------|-----------|-------|
| `sd1_1_score` through `sd2_3_score` | 6 Subdomain Scores | Same as Tool 3 | Number | -3 to +3 |
| `islQuotient` | Domain 1: Issues Showing Love | avg(sd1_1, sd1_2, sd1_3) normalized | Number | 0-100 |
| `irlQuotient` | Domain 2: Issues Receiving Love | avg(sd2_1, sd2_2, sd2_3) normalized | Number | 0-100 |
| `overallQuotient` | Disconnection from Others | avg(islQuotient, irlQuotient) | Number | 0-100 |
| `gptSubdomainInsights` | Per-subdomain GPT analysis | 6 insights | Object | - |
| `gptDomainSynthesis` | Domain-level synthesis | 2 syntheses | Object | - |
| `gptOverallSynthesis` | Overall synthesis | Combined analysis | String | - |

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `giving_compulsion` | Compulsive giving pattern | sd1_1_score > 1.5 | 6, 7 | HIGH |
| `self_abandonment` | Self-abandonment for others | sd1_2_score > 1.5 | 6, 7 | HIGH |
| `help_refusal` | Difficulty accepting help | sd1_3_score > 1.5 | 7 | MEDIUM |
| `financial_dependency` | Over-reliance on others | sd2_1_score > 1.5 | 6, 7 | HIGH |
| `obligation_burden` | Feeling of owing others | sd2_2_score > 1.5 | 6 | MEDIUM |
| `chronic_debt_pattern` | Staying in debt to others | sd2_3_score > 1.5 | 6 | HIGH |
| `relationship_money_conflict` | Money causing relationship stress | islQuotient + irlQuotient > 120 | 7 | HIGH |

---

### Tool 6: Retirement Blueprint - Data Map

#### User Inputs (Legacy - 2-Phase Form)

**Phase 1: Universal Questions (46)**

| Field ID | Field Label | Input Type | Values/Range |
|----------|-------------|------------|--------------|
| `profileSelection` | Client Profile Type | Select | 9 profiles (ROBS, Solo 401k, etc.) |
| `currentAge` | Current Age | Number | 18-80 |
| `targetRetirementAge` | Target Retirement Age | Number | 50-80 |
| `investmentInvolvement` | Investment Time/Interest | Likert | 1-7 |
| `investmentConfidence` | Investment Confidence | Likert | 1-7 |
| `hsaEligibility` | HSA Eligibility | Boolean | Yes/No |
| `hsaBalance` | Current HSA Balance | Currency | $0+ |
| `hsaMonthlyContrib` | Monthly HSA Contribution | Currency | $0+ |
| `cesaChildren` | Number of Children (CESA) | Number | 0-10 |
| `currentRetirementBalance` | Current Retirement Savings | Currency | $0+ |
| `currentContributions` | Current Monthly Contributions | Currency | $0+ |
| `goalPriorities` | Goal Rankings (Retirement, Education, Health) | Rank | 1-3 |
| ... | (46 questions total) | ... | ... |

**Phase 2: Profile-Specific (46-50 per profile)**

| Profile | Example Unique Fields |
|---------|----------------------|
| ROBS In Use | ROBS profit distribution, structure type, contribution frequency |
| Solo 401k Builder | Business type, employee/employer splits, net business income |
| Roth Reclaimer | Traditional IRA balance, rollover eligibility, backdoor viability |
| Foundation Builder | Employer 401k availability, match %, Roth 401k option |

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type |
|-----------|-------------|-------------|-----------|
| `vehicleOrder_Retirement` | Prioritized retirement vehicles | Profile-specific algorithm | Array |
| `vehicleOrder_Education` | Prioritized education vehicles | Profile-specific algorithm | Array |
| `vehicleOrder_Health` | Prioritized health vehicles | Profile-specific algorithm | Array |
| `vehicleCaps` | IRS limit for each vehicle | 2025 IRS tables + catch-up | Object |
| `vehicleSeeds` | Pre-populated contribution amounts | Current contributions | Object |
| `actualAllocation` | Current monthly allocation by vehicle | From form data | Object |
| `idealAllocation` | Optimized allocation by vehicle | Solver algorithm | Object |
| `opportunityGap` | Improvement potential | ideal - actual | Currency |
| `futureValue_10y` | 10-year projection | FV calculation | Currency |
| `futureValue_20y` | 20-year projection | FV calculation | Currency |
| `futureValue_30y` | 30-year projection | FV calculation | Currency |
| `rothPhaseOutApplied` | Roth → Backdoor Roth swap | Income-based | Boolean |
| `pdfDocumentUrl` | Generated blueprint document | Google Docs API | URL |

#### Key Formulas

```javascript
// Vehicle capacity (example: Solo 401k)
solo401kEmployeeLimit = 23500 + (age >= 50 ? 7500 : 0) + (age >= 60 ? 3750 : 0);
solo401kEmployerLimit = Math.min(netIncome * 0.25, 70000 - solo401kEmployeeLimit);

// Future Value
FV = PV × (1 + monthlyRate)^months + monthlyContrib × ((1 + monthlyRate)^months - 1) / monthlyRate;

// Risk to Return (from investment confidence score)
returnRate = 0.08 + (confidenceScore - 1) × (0.12 / 6); // 8% to 20%
```

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `retirement_capacity` | Monthly savings capacity | idealAllocation total | 8 | HIGH |
| `vehicle_optimization` | Opportunity for better vehicles | opportunityGap > $200/mo | 8 | HIGH |
| `tax_efficiency` | Roth vs Traditional recommendation | Based on income/age | 8 | MEDIUM |
| `catch_up_eligible` | Age-based catch-up available | age >= 50 | 8 | MEDIUM |
| `time_horizon` | Years until retirement | targetAge - currentAge | 8 | HIGH |

---

### Tool 7: Security & Control Grounding - Data Map

#### User Inputs

| Page | Field ID | Field Label | Input Type | Values/Range |
|------|----------|-------------|------------|--------------|
| 2-4 | `sd1_*` | CLI Subdomains (1.1, 1.2, 1.3) | Same as Tool 3 | -3 to +3 + text |
| 5-7 | `sd2_*` | FLI Subdomains (2.1, 2.2, 2.3) | Same as Tool 3 | -3 to +3 + text |

**Total: 24 scale questions + 6 open reflections = 30 inputs**

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type | Range |
|-----------|-------------|-------------|-----------|-------|
| `cliQuotient` | Domain 1: Control Leading to Isolation | avg(sd1_1, sd1_2, sd1_3) normalized | Number | 0-100 |
| `fliQuotient` | Domain 2: Fear Leading to Isolation | avg(sd2_1, sd2_2, sd2_3) normalized | Number | 0-100 |
| `overallQuotient` | Disconnection from Greater | avg(cliQuotient, fliQuotient) | Number | 0-100 |
| `gptSubdomainInsights` | Per-subdomain GPT analysis | 6 insights | Object | - |
| `gptDomainSynthesis` | Domain-level synthesis | 2 syntheses | Object | - |
| `gptOverallSynthesis` | Overall synthesis | Combined analysis | String | - |

#### Insights Generated

| Insight ID | Description | Condition | Target Tools | Priority |
|------------|-------------|-----------|--------------|----------|
| `control_need` | Total control requirement | sd1_1_score > 1.5 | 8 | HIGH |
| `trust_deficit` | Difficulty trusting others | sd1_2_score > 1.5 | 8 | HIGH |
| `help_as_weakness` | Seeing help as weakness | sd1_3_score > 1.5 | 8 | MEDIUM |
| `catastrophic_thinking` | Expecting worst outcomes | sd2_1_score > 1.5 | 8 | HIGH |
| `change_resistance` | Fear of change | sd2_2_score > 1.5 | 8 | HIGH |
| `betrayal_expectation` | Expecting to be betrayed | sd2_3_score > 1.5 | 8 | MEDIUM |
| `risk_tolerance_context` | Psychological risk factors | cliQuotient + fliQuotient | 8 | HIGH |

---

### Tool 8: Investment Planning - Data Map

#### User Inputs

| Section | Field ID | Field Label | Input Type | Values/Range |
|---------|----------|-------------|------------|--------------|
| Auth | `clientId` | Client ID | Text | Last 4 phone + 2 letters |
| Main | `monthlyIncomeGoal` | Monthly Retirement Income Goal | Slider | $500-$40,000 |
| Main | `yearsUntilRetirement` | Years Until Retirement | Slider | 0-60 |
| Main | `riskTolerance` | Investment Risk Tolerance | Dial | 0-10 |
| Main | `returnOverride` | Return Rate Override | Slider | 0-30% (optional) |
| Main | `monthlySavingsCapacity` | Monthly Savings Capacity | Number | $0+ |
| Main | `currentInvestmentBalance` | Current Investment Balance | Number | $0+ |
| Advanced | `inflationRate` | Assumed Inflation Rate | Slider | 0-10% (default 2.5%) |
| Advanced | `retirementDuration` | Retirement Duration | Slider | 10-50 years (default 30) |
| Advanced | `maintenanceReturn` | Return During Retirement | Slider | 0-20% (default 10%) |
| Advanced | `deploymentDrag` | Deployment Drag | Slider | 0-50% (default 25%) |
| Mode | `calculationMode` | Calculation Mode | Radio | contribution, return, time |

#### Calculated Outputs

| Output ID | Description | Calculation | Data Type |
|-----------|-------------|-------------|-----------|
| `targetReturn` | Risk-mapped return rate | Sigmoid: 4.5% - 25% | Percentage |
| `effectiveReturn` | After deployment drag | targetReturn × (1 - drag) | Percentage |
| `inflationAdjustedGoal` | Future income need | goal × (1 + inflation)^years | Currency |
| `requiredNestEgg` | Total savings needed | Complex FV formula | Currency |
| `monthlyContributionRequired` | Contribution mode result | Solver | Currency |
| `returnRequired` | Return mode result | Bisection solver | Percentage |
| `yearsRequired` | Time mode result | Bisection solver | Number |
| `feasibilityStatus` | Feasible / Needs Adjustment / Not Feasible | Logic check | String |
| `feasibilityDetails` | Why feasible/not | Explanation | String |
| `riskCategory` | Risk profile description | Based on risk dial | String |
| `scenarioData` | All inputs + outputs for saving | Object | Object |

#### Key Formulas

```javascript
// Risk to Return (sigmoid curve)
sigmoid = (x) => 1 / (1 + Math.exp(-x));
targetReturn = rMin + (rMax - rMin) * sigmoid(k * (riskTolerance - m));
// rMin=4.5%, rMax=25%, k=0.6, m=5

// Required Nest Egg
M0 = monthlyGoal * Math.pow(1 + inflation, years);
Areq = 12 * M0 * (1 - Math.pow((1 + monthlyInflation) / (1 + monthlyReturn), 12 * duration))
       / (annualReturn - inflation);

// Contribution Solver
monthlyContrib = (Areq - currentBalance * Math.pow(1 + monthlyRate, months))
                 / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
```

#### Insights Generated (Standalone)

| Insight ID | Description | Output Location |
|------------|-------------|-----------------|
| `feasibility_assessment` | Overall plan viability | PDF Report |
| `risk_profile_match` | Risk tolerance implications | PDF Report |
| `time_sensitivity` | Urgency based on years | PDF Report |
| `capacity_gap` | Savings shortfall amount | PDF Report |
| `scenario_comparison` | Trade-offs between scenarios | Comparison PDF |

---

## Master Data Dictionary

### Field Types Reference

| Type | Description | Example Values |
|------|-------------|----------------|
| Likert | Scale rating | -5 to +5, -3 to +3, 1-10 |
| Currency | Dollar amount | $0, $5,000, $150,000 |
| Percentage | Ratio as percent | 0%, 15%, 100% |
| Text | Free text entry | "John Smith" |
| Textarea | Multi-line text | Reflections, lists |
| Select | Dropdown choice | "Single", "Married" |
| Multi-select | Multiple choices | ["W-2", "Self-Employed"] |
| Rank | Ordered preference | 1-6, 1-10 |
| Boolean | Yes/No | true/false |
| Number | Numeric value | 35, 2.5 |
| Slider | Continuous range | 0-100 |
| Dial | Visual control | 0-10 |

### Insight Priority Levels

| Priority | Meaning | Action |
|----------|---------|--------|
| HIGH | Critical for downstream tools | Must be passed; affects major calculations |
| MEDIUM | Important context | Should be passed; enhances recommendations |
| LOW | Nice to have | Optional; adds personalization |

### Data Storage Locations

| Data Type | Storage | Sheet/Table |
|-----------|---------|-------------|
| Tool Responses | Google Sheets | RESPONSES |
| Cross-Tool Insights | Google Sheets | CrossToolInsights |
| Tool Access Status | Google Sheets | TOOL_ACCESS |
| Client Roster | Google Sheets | ROSTER |
| GPT Cache | PropertiesService | User Properties |
| Draft Data | PropertiesService | User Properties |
| Scenarios (Tool 8) | Google Sheets | Scenarios |
| PDF Reports | Google Drive | Reports Folder |

---

## Next Steps

1. **Tool 6 Conversion:** Transform legacy form-based tool into interactive calculator
2. **Tool 8 Integration:** Connect authentication and data flow to unified system
3. **Cross-Tool Insights:** Enhance InsightMappings sheet for all tool combinations
4. **Unified Dashboard:** Show progress across all 8 tools
5. **Comprehensive Report:** Generate master report combining insights from all tools

---

**Document Maintained By:** Financial TruPath Development Team
**For Technical Details:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
