# Tool 4: Technical Architecture & Calculation Logic

**Purpose:** Complete technical reference for how Tool 4 calculates priority recommendations and budget allocations.

**Last Updated:** December 2025

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Flow Diagram](#2-data-flow-diagram)
3. [Input Sources](#3-input-sources)
4. [Priority Recommendation Engine](#4-priority-recommendation-engine)
5. [Allocation Calculation Engine (V1)](#5-allocation-calculation-engine-v1)
6. [Tier Mapping Functions](#6-tier-mapping-functions)
7. [Tool 1/2/3 Data Integration](#7-tool-123-data-integration)
8. [Configuration Constants](#8-configuration-constants)
9. [Example Calculation Walkthrough](#9-example-calculation-walkthrough)

---

## 1. System Overview

Tool 4 is a **trauma-informed budget allocation calculator** that personalizes financial recommendations based on:

- **Financial reality** (income, expenses, debt, savings)
- **Behavioral profile** (discipline, impulse control, satisfaction)
- **Prior tool responses** (trauma patterns from Tool 1, behaviors from Tool 2, disconnection from Tool 3)
- **Stated priority** (what the student wants to focus on)

The system produces two outputs:
1. **Priority Recommendations** — Ranked list of 10 financial priorities with "recommended", "available", or "challenging" indicators
2. **M/E/F/J Allocation** — Percentage split across Multiply, Essentials, Freedom, and Enjoyment buckets

---

## 2. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT SOURCES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   PRE-SURVEY    │    │   TOOL 1/2/3    │    │  BACKUP QUESTIONS│     │
│  │   (10 questions)│    │  (DataService)  │    │  (if tools missing)│   │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘      │
│           │                      │                      │                │
└───────────┼──────────────────────┼──────────────────────┼────────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         buildV1Input()                                   │
│  Converts all inputs to standardized format with tier mappings           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
        ▼                                                  ▼
┌───────────────────────┐                    ┌───────────────────────┐
│  PRIORITY ENGINE      │                    │  ALLOCATION ENGINE    │
│  (Progressive Unlock) │                    │  (calculateAllocationV1)│
├───────────────────────┤                    ├───────────────────────┤
│ 1. Evaluate unlocks   │                    │ 1. Look up base weights│
│ 2. Score all 10       │                    │ 2. Apply financial mods│
│ 3. Apply trauma mods  │                    │ 3. Amplify by satisfaction│
│ 4. Rank & recommend   │                    │ 4. Apply behavioral mods│
└───────────┬───────────┘                    │ 5. Cap modifiers       │
            │                                │ 6. Normalize to 100%   │
            │                                │ 7. Round & validate    │
            ▼                                └───────────┬───────────┘
┌───────────────────────┐                                │
│  Priority Selection   │                                │
│  (user picks one)     │────────────────────────────────┤
└───────────────────────┘                                │
                                                         ▼
                                            ┌───────────────────────┐
                                            │  FINAL ALLOCATION     │
                                            │  M: 25%, E: 35%,      │
                                            │  F: 30%, J: 10%       │
                                            │  + dollar amounts     │
                                            │  + explanation notes  │
                                            └───────────────────────┘
```

---

## 3. Input Sources

### 3.1 Pre-Survey Questions (Primary Input)

**Financial Reality (4 questions):**

| Field | Type | Description |
|-------|------|-------------|
| `monthlyIncome` | Dollar amount | Take-home pay after taxes |
| `monthlyEssentials` | Dollar amount | Rent, food, utilities, insurance, etc. |
| `totalDebt` | Dollar amount | Credit cards, loans (excluding mortgage) |
| `emergencyFund` | Dollar amount | Savings available for emergencies |

**Behavioral Profile (6 sliders, 0-10 scale):**

| Field | 0 = | 10 = |
|-------|-----|------|
| `satisfaction` | Extremely stressed | Complete financial peace |
| `discipline` | Cannot stick to plans | Extremely disciplined |
| `impulse` | Buy on impulse constantly | Never buy impulsively |
| `longTerm` | Only focused on today | Maximum future focus |
| `lifestyle` | Save everything possible | Live fully now |
| `autonomy` | Tell me what to do | Complete independence |

### 3.2 Tool 1/2/3 Data (Secondary Input)

**Tool 1 (Trauma Patterns):**
- `winner` field contains dominant trauma pattern
- Values: `FSV`, `ExVal`, `Showing`, `Receiving`, `Control`, `Fear`
- Used to adjust priority recommendations

**Tool 2 (Financial Behaviors):**
- `investmentActivity` (-5 to +5) → Derived to `growth` (0-10)
- `savingsRegularity` (-5 to +5) → Derived to `growth` (0-10)
- `retirementFunding` (-5 to +5) → Derived to `growth` (0-10)
- `emergencyFundMaintenance` (-5 to +5) → Derived to `stability` (0-10)
- `insuranceConfidence` (-5 to +5) → Derived to `stability` (0-10)
- `debtTrending` (-5 to +5) → Derived to `stability` (0-10)
- `incomeConsistency` → Maps to `incomeStability`
- `dependents` → Yes/No for household composition

**Tool 3 (Disconnection Score):**
- `overallQuotient` (0-100) measures financial disconnection
- Higher = more disconnected from financial well-being
- Scales trauma modifier intensity (0.5x to 1.25x)

### 3.3 Backup Questions (Fallback)

If Tools 1/2/3 are incomplete, the pre-survey includes backup questions:

**Tool 2 Backup:**
- `backupGrowthOrientation` (0-10)
- `backupStabilityOrientation` (0-10)
- `backupIncomeConsistency` (unstable/stable/very-stable)
- `backupDependents` (yes/no)

---

## 4. Priority Recommendation Engine

### 4.1 The 10 Priorities

All 10 priorities are **always selectable**. They are scored and categorized into three groups based on how well they fit the student's situation:

| Category | Score Threshold | Meaning |
|----------|----------------|---------|
| **Recommended** | score ≥ 50 | Strong fit for current situation |
| **Available** | -50 < score < 50 | Reasonable option |
| **Challenging** | score ≤ -50 | Conflicts with current situation |

**The 10 Priorities:**

| Priority | Icon | Base Allocation (M/E/F/J) |
|----------|------|---------------------------|
| Stabilize to Survive | 🚨 | 5/45/40/10 |
| Reclaim Financial Control | 🎯 | 10/45/35/10 |
| Get Out of Debt | 💳 | 15/35/40/10 |
| Feel Financially Secure | 🛡️ | 25/35/30/10 |
| Enjoy Life More | 🎉 | 15/25/25/35 |
| Reduce Working Hours | ⏰ | 20/30/35/15 |
| Save for Kids' Education | 🎓 | 25/25/40/10 |
| Build Long-Term Wealth | 📈 | 40/25/20/15 |
| Upgrade My Lifestyle | ✨ | 20/20/15/45 |
| Create Generational Wealth | 👨‍👩‍👧‍👦 | 50/20/20/10 |

**Note:** `Tool4ProgressiveUnlock.js` contains legacy tier-based unlock logic that is no longer used. The current implementation uses score-based categorization in `calculatePriorityRecommendations()`.

### 4.2 Priority Scoring Algorithm

Each priority receives a score based on point accumulation:

```
Score = Σ(Recommended Factors) - Σ(Cautioned Factors)
```

**Example: "Build Long-Term Wealth" scoring factors:**

| Factor | Condition | Points |
|--------|-----------|--------|
| Recommended | discipline ≥ 7 | +30 |
| Recommended | longTerm ≥ 7 | +30 |
| Recommended | debtLoad A/B | +20 |
| Recommended | income stable | +15 |
| Recommended | growth ≥ 7 | +20 |
| Recommended | emergencyFund D/E | +15 |
| Recommended | surplus ≥ $2,000 | +20 |
| Cautioned | discipline ≤ 3 | -40 |
| Cautioned | debtLoad D/E | -40 |
| Cautioned | income unstable | -30 |
| Cautioned | emergencyFund A/B | -25 |
| Cautioned | essentials > 80% | -40 |

### 4.3 Trauma-Aware Adjustments

After base scoring, trauma patterns from Tool 1 apply adjustments:

| Trauma Pattern | Boosted Priorities | Penalized Priorities |
|----------------|-------------------|---------------------|
| FSV (False Self-View) | Secure, Balance, Stabilize | Generational |
| ExVal (External Validation) | Wealth, Secure, Control | Enjoyment, Balance |
| Showing (Over-giving) | Balance, Enjoyment, Wealth | Generational |
| Receiving (Dependency) | Wealth, Secure, Control | — |
| Control (Over-control) | Balance, Enjoyment, Secure | Generational, Wealth |
| Fear (Self-sabotage) | Secure, Stabilize, Balance | Generational, Wealth, Business |

**Intensity Scaling (from Tool 3 disconnection score):**

| Disconnection Range | Modifier Multiplier |
|--------------------|---------------------|
| 0-25% | 0.5x (mild) |
| 25-50% | 0.75x (moderate) |
| 50-75% | 1.0x (standard) |
| 75-100% | 1.25x (intense) |

### 4.4 Final Classification

| Score Range | Indicator |
|-------------|-----------|
| ≥ 50 | "recommended" |
| -50 to 50 | "available" |
| ≤ -50 | "challenging" |

---

## 5. Allocation Calculation Engine (V1)

Located in `Tool4.js` function `calculateAllocationV1()`.

### 5.1 Base Weights by Priority

Each priority has predetermined M/E/F/J starting percentages:

| Priority | M | E | F | J |
|----------|---|---|---|---|
| Build Long-Term Wealth | 40 | 25 | 20 | 15 |
| Get Out of Debt | 15 | 25 | 45 | 15 |
| Feel Financially Secure | 25 | 35 | 30 | 10 |
| Enjoy Life Now | 20 | 20 | 15 | 45 |
| Save for a Big Goal | 15 | 25 | 45 | 15 |
| Stabilize to Survive | 5 | 45 | 40 | 10 |
| Build or Stabilize Business | 20 | 30 | 35 | 15 |
| Create Generational Wealth | 45 | 25 | 20 | 10 |
| Create Life Balance | 15 | 25 | 25 | 35 |
| Reclaim Financial Control | 10 | 35 | 40 | 15 |

### 5.2 Modifier Application Order

```
1. Start with base weights from priority
2. Apply Financial Modifiers (+/- per bucket)
3. Apply Satisfaction Amplification (multiply positive mods)
4. Apply Behavioral Modifiers (+/- per bucket)
5. Apply Motivational Modifiers (+/- per bucket)
6. Cap each modifier at -20 to +50
7. Calculate raw = base + mods
8. Normalize: percentage = (raw / total_raw) × 100
9. Round and ensure sum = 100%
```

### 5.3 Financial Modifiers

| Condition | Bucket | Change | Note |
|-----------|--------|--------|------|
| incomeRange = A | Multiply | -5 | Low income reduces capacity |
| incomeRange = E | Multiply | +10 | High income boosts capacity |
| debtLoad = D | Freedom | +10 | Moderate debt prioritize payoff |
| debtLoad = E | Freedom | +15 | Severe debt aggressive payoff |
| interestLevel = High | Freedom | +10 | High-interest debt urgency |
| interestLevel = Low | Freedom | -5 | Low-interest less urgent |
| emergencyFund = A/B | Freedom | +10 | Build emergency fund |
| emergencyFund = D/E | Freedom | -10 | Sufficient fund |
| incomeStability = Unstable | Essentials | +5 | Buffer needed |
| incomeStability = Unstable | Freedom | +5 | Buffer needed |
| incomeStability = Very Stable | Multiply | +5 | Invest confidently |

### 5.4 Satisfaction Amplification

**Critical mechanism:** Low satisfaction (financial stress) amplifies positive modifiers.

```javascript
satFactor = 1 + max(0, 5 - satisfaction) × 0.1
satFactor = min(satFactor, 1.3)  // Cap at 30% boost

// Apply only to positive modifiers
if (modifier > 0) {
    modifier = modifier × satFactor
}
```

| Satisfaction Score | Amplification |
|-------------------|---------------|
| 1 (very stressed) | 1.3x (capped) |
| 2 | 1.3x (capped) |
| 3 | 1.2x |
| 4 | 1.1x |
| 5 (neutral) | 1.0x (no change) |
| 6-10 (satisfied) | 1.0x (no change) |

**Rationale:** Students experiencing financial stress are motivated for change; the system gives them more aggressive recommendations.

### 5.5 Behavioral Modifiers

| Condition | Bucket | Change |
|-----------|--------|--------|
| discipline ≥ 8 | Multiply | +10 |
| discipline ≤ 3 | Multiply | -10 |
| impulse ≥ 8 | Enjoyment | +5 |
| impulse ≤ 3 | Enjoyment | -10 |
| longTerm ≥ 8 | Multiply | +10 |
| longTerm ≤ 3 | Multiply | -10 |

### 5.6 Motivational Modifiers

| Condition | Bucket | Change |
|-----------|--------|--------|
| lifestyle ≥ 8 | Enjoyment | +10 |
| lifestyle ≤ 3 | Enjoyment | -5 |
| growth ≥ 8 | Multiply | +10 |
| stability ≥ 8 | Freedom | +10 |
| goalTimeline = short (≤12mo) | Freedom | +10 |
| dependents = Yes | Essentials | +5 |
| autonomy ≥ 8 | Multiply | +5 |
| autonomy ≤ 3 | Essentials | +5 |
| autonomy ≤ 3 | Freedom | +5 |

### 5.7 Modifier Caps

```javascript
maxPositiveMod = 50
maxNegativeMod = 20

// Per bucket:
modifier = max(-20, min(modifier, 50))
```

This prevents extreme swings even with many factors stacking.

### 5.8 Normalization Formula

```javascript
raw.Multiply   = base.M + mods.Multiply
raw.Essentials = base.E + mods.Essentials
raw.Freedom    = base.F + mods.Freedom
raw.Enjoyment  = base.J + mods.Enjoyment

totalRaw = raw.Multiply + raw.Essentials + raw.Freedom + raw.Enjoyment

percentage.Multiply   = (raw.Multiply / totalRaw) × 100
percentage.Essentials = (raw.Essentials / totalRaw) × 100
percentage.Freedom    = (raw.Freedom / totalRaw) × 100
percentage.Enjoyment  = (raw.Enjoyment / totalRaw) × 100
```

### 5.9 Validation Warnings

The system checks if the recommended Essentials percentage is realistic:

```javascript
if (percentage.Essentials < actualEssentialsPct - 5) {
    warn("Your recommended Essentials is lower than current spending")
}
```

---

## 6. Tier Mapping Functions

### 6.1 Income to Tier

```javascript
mapIncomeToTier(monthlyIncome):
    if monthlyIncome < 2500:  return 'A'  // < $2,500/mo
    if monthlyIncome < 5000:  return 'B'  // $2,500-$5,000/mo
    if monthlyIncome < 10000: return 'C'  // $5,000-$10,000/mo
    if monthlyIncome < 20000: return 'D'  // $10,000-$20,000/mo
    return 'E'                             // > $20,000/mo
```

### 6.2 Essentials Percentage to Tier

```javascript
mapEssentialsPctToTier(pct):
    if pct < 10: return 'A'   // < 10%
    if pct < 20: return 'B'   // 10-20%
    if pct < 30: return 'C'   // 20-30%
    if pct < 40: return 'D'   // 30-40%
    if pct < 50: return 'E'   // 40-50%
    return 'F'                 // > 50%
```

### 6.3 Debt to Tier (Debt-to-Income Ratio)

```javascript
mapDebtToTier(totalDebt, monthlyIncome):
    annualIncome = monthlyIncome × 12
    ratio = totalDebt / annualIncome

    if ratio < 0.10: return 'A'  // < 10% of annual income (minimal)
    if ratio < 0.30: return 'B'  // 10-30% (low)
    if ratio < 1.00: return 'C'  // 30-100% (moderate)
    if ratio < 2.00: return 'D'  // 100-200% (high)
    return 'E'                    // > 200% (severe)
```

### 6.4 Emergency Fund to Tier (Months of Coverage)

```javascript
mapEmergencyFundToTier(emergencyFund, monthlyEssentials):
    months = emergencyFund / monthlyEssentials

    if months < 0.5: return 'A'  // < 2 weeks
    if months < 1.0: return 'B'  // 2 weeks - 1 month
    if months < 3.0: return 'C'  // 1-3 months
    if months < 6.0: return 'D'  // 3-6 months
    return 'E'                    // 6+ months (excellent)
```

---

## 7. Tool 1/2/3 Data Integration

### 7.1 Data Retrieval

```javascript
tool1Data = DataService.getLatestResponse(clientId, 'tool1')
tool2Data = DataService.getLatestResponse(clientId, 'tool2')
tool3Data = DataService.getLatestResponse(clientId, 'tool3')
```

### 7.2 Tool 2 Derivation Functions

**Growth Orientation (0-10):**
```javascript
deriveGrowthFromTool2(formData):
    avg = (investmentActivity + savingsRegularity + retirementFunding) / 3
    // Tool 2 uses -5 to +5 scale, convert to 0-10
    return round(((avg + 5) / 10) × 10)
```

**Stability Orientation (0-10):**
```javascript
deriveStabilityFromTool2(formData):
    avg = (emergencyFundMaintenance + insuranceConfidence + debtTrending) / 3
    // Tool 2 uses -5 to +5 scale, convert to 0-10
    return round(((avg + 5) / 10) × 10)
```

### 7.3 Fallback Chain

```
1. Try Tool 1/2/3 data from DataService
2. If missing, use backup questions from pre-survey
3. If still missing, use neutral defaults (5 for sliders)
```

---

## 8. Configuration Constants

Located at top of `calculateAllocationV1()`:

```javascript
CONFIG = {
    satisfaction: {
        neutralScore: 5,    // Score at which no amplification
        step: 0.1,          // Amplification per point below neutral
        maxBoost: 0.3       // Maximum 30% amplification
    },
    essentialPctMap: {
        A: 5, B: 15, C: 25, D: 35, E: 45, F: 55
    },
    minEssentialsAbsolutePct: 40,
    maxRecommendedEssentialsPct: 35,
    maxPositiveMod: 50,     // Cap positive modifiers
    maxNegativeMod: 20      // Cap negative modifiers
}
```

---

## 9. Example Calculation Walkthrough

### Input Profile

```
Monthly Income: $5,000
Monthly Essentials: $2,500
Total Debt: $8,000
Emergency Fund: $3,000
Satisfaction: 3 (stressed)
Discipline: 7
Impulse: 6
Long-term: 8
Lifestyle: 4
Autonomy: 6
Selected Priority: "Feel Financially Secure"
Goal Timeline: "6-12 months"
```

### Step 1: Tier Mapping

```
incomeRange = C ($5,000 → $5K-$10K)
essentialsPct = 2500/5000 = 50% → essentialsRange = E
debtLoad = 8000 / 60000 = 13.3% → B (low)
emergencyFund = 3000 / 2500 = 1.2 months → C
interestLevel = Low (from debtLoad B)
```

### Step 2: Base Weights

Priority "Feel Financially Secure":
```
base = { M: 25, E: 35, F: 30, J: 10 }
```

### Step 3: Financial Modifiers

```
incomeRange C: no modifier
debtLoad B: no modifier
emergencyFund C: no modifier
incomeStability (assumed Stable): no modifier

mods = { Multiply: 0, Essentials: 0, Freedom: 0, Enjoyment: 0 }
```

### Step 4: Satisfaction Amplification

```
satisfaction = 3
satFactor = 1 + (5 - 3) × 0.1 = 1.2

No positive mods to amplify yet
mods = { Multiply: 0, Essentials: 0, Freedom: 0, Enjoyment: 0 }
```

### Step 5: Behavioral Modifiers

```
discipline 7: not ≥8, no modifier
longTerm 8: Multiply +10
impulse 6: not extreme, no modifier

mods = { Multiply: 10, Essentials: 0, Freedom: 0, Enjoyment: 0 }
```

### Step 6: Motivational Modifiers

```
lifestyle 4: not extreme, no modifier
goalTimeline "6-12 months": Freedom +10

mods = { Multiply: 10, Essentials: 0, Freedom: 10, Enjoyment: 0 }
```

### Step 7: Apply Caps

All modifiers within -20 to +50, no changes.

### Step 8: Calculate Raw

```
raw.Multiply   = 25 + 10 = 35
raw.Essentials = 35 + 0  = 35
raw.Freedom    = 30 + 10 = 40
raw.Enjoyment  = 10 + 0  = 10
total = 120
```

### Step 9: Normalize to Percentages

```
Multiply:   35/120 × 100 = 29.2% → 29%
Essentials: 35/120 × 100 = 29.2% → 29%
Freedom:    40/120 × 100 = 33.3% → 33%
Enjoyment:  10/120 × 100 = 8.3%  → 8%
Sum = 99%, adjust largest (Freedom) → 34%
```

### Final Allocation

```
Multiply:   29% ($1,450/mo)
Essentials: 29% ($1,450/mo)  ⚠️ Warning: actual is 50%
Freedom:    34% ($1,700/mo)
Enjoyment:   8% ($400/mo)
```

### Validation Warning

```
Recommended Essentials (29%) < Actual (50%)
Warning: "Your recommended Essentials is lower than current spending.
         You may need to reduce expenses or adjust allocation."
```

### Notes Generated

```
Multiply: "Strong long-term focus."
Essentials: "Standard Essentials allocation applied."
Freedom: "Short-term goal timeline."
Enjoyment: "Standard Enjoyment allocation applied."
```

---

## File References

| File | Purpose |
|------|---------|
| [Tool4.js](../../tools/tool4/Tool4.js) | Main entry point, allocation engine, input mapping |
| [Tool4ProgressiveUnlock.js](../../tools/tool4/Tool4ProgressiveUnlock.js) | Priority definitions, unlock logic, recommendation |
| [Tool4BaseWeights.js](../../tools/tool4/Tool4BaseWeights.js) | Base M/E/F/J percentages per priority |
| [Tool4Categories.js](../../tools/tool4/Tool4Categories.js) | Spending category validation |
| [Tool4GPTAnalysis.js](../../tools/tool4/Tool4GPTAnalysis.js) | GPT report generation |
| [Tool4Fallbacks.js](../../tools/tool4/Tool4Fallbacks.js) | Fallback reports when GPT unavailable |

---

## Key Design Decisions

1. **Satisfaction as amplifier, not direct modifier** — People in distress are motivated; amplify their path to change.

2. **Modifier caps prevent extremes** — Even with many stacking factors, no bucket can swing more than ±50 points.

3. **Progressive unlock prevents aspirational overreach** — Students cannot select "Build Generational Wealth" while in crisis.

4. **Trauma patterns inform priority, not allocation** — Trauma affects which priority is recommended, but once selected, allocation is purely financial/behavioral.

5. **Validation catches impossible plans** — If recommended Essentials < actual spending, warn immediately.

6. **Graceful degradation** — Missing Tool 1/2/3 data falls back to backup questions, then to neutral defaults.
