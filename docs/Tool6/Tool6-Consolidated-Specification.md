# Tool 6: Retirement Blueprint Calculator - Consolidated Specification

> **Version:** 1.8
> **Date:** January 17, 2026
> **Status:** Approved for Implementation
> **Consolidates:** Tool-6-Design-Spec.md + Tool6-Technical-Specification.md + Legacy Tool 6

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.8 | Jan 17, 2026 | **Phase 5 Complete - Calculator UI with Coupled Sliders:** Added Sprint 5.7 for coupled slider behavior. Sliders use ORIGINAL algorithm proportions for redistribution (preserves algorithm intelligence). Lock/unlock buttons exclude vehicles from redistribution. Editable budget field recalculates effective limits (min of IRS limit and budget). Reset to Recommended button restores original output. IRS limits stored separately in data attributes for dynamic limit recalculation. |
| 1.7 | Jan 17, 2026 | **Ambition Quotient Enhancement:** Replaced simple 1-2-3 priority ranking with rich psychological assessment (9 questions: importance/anxiety/motivation on 1-7 scales per domain + tie-breaker). Added Phase C to questionnaire flow. Made tax preference question (`a2b_taxPreference`) required for ALL profiles in Phase B. Added `computeDomainsAndWeights()` function aligned with legacy algorithm. Adaptive design: only asks about active domains (Retirement always, Education if hasChildren, Health if hsaEligible). |
| 1.6 | Jan 11, 2026 | **Education Domain Enhancement:** Added Q14 (numChildren), Q20 (currentEducationBalance), Q24 (monthlyEducationContribution); uses "Combined CESA" approach (total across all children, not per-child); renumbered questions to **24 total**; fixed ROBS qualifiers to only show for "Interested"; added `calculateEducationProjections()` algorithm; expanded TOOL6_SCENARIOS schema (15 columns A-O); updated Sprints 5.1, 6.1, 6.2, 7.1 with education domain requirements |
| 1.5 | Jan 11, 2026 | Added UI Style Requirements section (Tool 4 alignment), added Q1/Q2 as required Tool 6 questions (gross income, years to retirement), renumbered questions to 22 total |
| 1.4 | Jan 9, 2026 | Added HSA coverage type inference from filing status (Section 7 under Advanced Allocation Logic) - MFJ infers Family coverage, Single/MFS infers Individual coverage |
| 1.3 | Jan 9, 2026 | **Agentic coding optimizations:** Added explicit monthly budget calculation formula, shared 401(k)/IRA limit algorithm with slider coupling, employer match seeding implementation, scenario comparison metrics table, GPT prompt template with API call pattern, fixed Profile 7 mapping in Appendix A, added implementation order note for Phase 4 |
| 1.2 | Jan 8, 2026 | Fixed investment score return rates (8%-20%), updated IRS limits to 2025 ($23,500), added cross-references between allocation sections, updated profile IDs in non-discretionary seeds, expanded Sprint 4.3-4.5 with advanced allocation test cases, fixed calculateProjections to use safeguarded futureValue() |
| 1.1 | Jan 5, 2026 | Added Advanced Allocation Logic section (cascade, cross-domain tracking, seeds), 31 detailed sprints, IRS 2025 limits with SECURE 2.0, Family Bank appendix, Narrative templates, Legacy code reference |
| 1.0 | Jan 4, 2026 | Initial consolidated specification |

---

## Executive Summary

Tool 6 transforms the legacy two-phase Google Forms retirement planning system into an interactive single-page calculator. It pulls data from Tools 1-5 to minimize user input, auto-classifies users into 1 of 9 investor profiles, and provides real-time vehicle allocation with interactive sliders.

### Position in User Journey

```
Tool 4: WHERE DOES IT GO?  → Income → M/E/F/J buckets (Retirement $ determined)
Tool 6: HOW DO I SAVE IT?  → Retirement $ → Which accounts/vehicles?
Tool 8: HOW DO I INVEST IT? → Inside accounts → What investments?
```

### Key Innovation: Ambition Quotient

Tool 6 preserves the legacy system's innovative **Ambition Quotient** algorithm that weights allocations based on:
- **Importance**: User-rated importance of each domain on 1-7 scale
- **Anxiety**: User-rated anxiety about each domain on 1-7 scale
- **Motivation**: User-rated motivation to take action on 1-7 scale
- **Time-discounted urgency**: Closer deadlines = higher weight
- **Blended formula**: `weight = (importance + normalized_urgency) / 2`, then normalize

**Adaptive Design (v1.7):** Only asks about domains relevant to the user:
- Retirement: Always asked (3 questions)
- Education: Only if hasChildren = Yes (3 questions)
- Health: Only if hsaEligible = Yes (3 questions)
- Tie-breaker: Only if all 3 domains are active (1 question)

---

## Architecture Overview

### UI Pattern: Single-Page Calculator

Following the proven Tool 4 and Tool 8 patterns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Tool 6: Retirement Blueprint                  │
├─────────────────────────────────┬───────────────────────────────────┤
│         INPUT PANEL (Left)      │        OUTPUT PANEL (Right)       │
├─────────────────────────────────┼───────────────────────────────────┤
│ ┌─────────────────────────────┐ │ ┌─────────────────────────────┐   │
│ │ Pre-Survey Section          │ │ │ Your Profile                │   │
│ │ (Collapsible)               │ │ │ - Classification result     │   │
│ │ - New questions (7 core)    │ │ │ - Key characteristics       │   │
│ │ - ROBS qualifiers (if appl) │ │ │ - Trauma-informed insights  │   │
│ │ - Priority ranking (2-3 Q)  │ │ └─────────────────────────────┘   │
│ └─────────────────────────────┘ │                                   │
│                                 │ ┌─────────────────────────────┐   │
│ ┌─────────────────────────────┐ │ │ Vehicle Allocation          │   │
│ │ Current State Section       │ │ │ - Interactive sliders       │   │
│ │ (Required)                  │ │ │ - Real-time updates         │   │
│ │ - Current balances          │ │ │ - IRS limit validation      │   │
│ │ - Current contributions     │ │ └─────────────────────────────┘   │
│ └─────────────────────────────┘ │                                   │
│                                 │ ┌─────────────────────────────┐   │
│ ┌─────────────────────────────┐ │ │ Projections                 │   │
│ │ Investment Score            │ │ │ - Balance at retirement     │   │
│ │ - Display from Tool 4       │ │ │ - Tax-free vs taxable       │   │
│ │ - Adjustable (1-7)          │ │ │ - Comparison to baseline    │   │
│ │ - Impact notes              │ │ └─────────────────────────────┘   │
│ └─────────────────────────────┘ │                                   │
│                                 │ ┌─────────────────────────────┐   │
│ ┌─────────────────────────────┐ │ │ Scenario Management         │   │
│ │ Tax Strategy Toggle         │ │ │ - Save scenario             │   │
│ │ ○ Traditional-Heavy         │ │ │ - Load scenario             │   │
│ │ ● Balanced                  │ │ │ - Compare scenarios         │   │
│ │ ○ Roth-Heavy                │ │ │ - Generate PDF              │   │
│ └─────────────────────────────┘ │ └─────────────────────────────┘   │
│                                 │                                   │
│ [  Calculate My Blueprint  ]    │                                   │
└─────────────────────────────────┴───────────────────────────────────┘
```

### Calculation Flow

1. **Button Click** → Initial calculation (pulls Tool 1-5 data, runs classification, Ambition Quotient, allocation)
2. **Slider Adjustments** → Real-time recalculation (client-side JS)
3. **Scenario Save** → Persists to TOOL6_SCENARIOS sheet

### UI Style Requirements (Tool 4 Alignment)

**IMPORTANT:** Tool 6 must follow Tool 4's established UI patterns for consistency across the application. Reference `tools/tool4/Tool4.js` for implementation details.

#### CSS Classes (Must Match Tool 4)

| Element | Class | Key Styles |
|---------|-------|------------|
| Submit Button | `.submit-btn` | Gold background (`var(--gold, #ffc107)`), dark text, 50px border-radius, hover transform |
| Form Inputs | `.form-input` | `background: rgba(0, 0, 0, 0.3)`, white text, 8px border-radius |
| Loading Overlay | `.loading-overlay` | Fixed position, `rgba(0,0,0,0.8)` background, uses `.show` class toggle |
| Error Message | `.error-message` | Red border/background, uses `.show` class toggle (not inline style) |
| Spinner | `.spinner` | 50px circle, purple border-top, spin animation |

#### JavaScript Patterns (Must Match Tool 4)

```javascript
// Loading overlay - use existing element, toggle .show class
var loadingOverlay = document.getElementById('loadingOverlay');
loadingOverlay.classList.add('show');    // Show
loadingOverlay.classList.remove('show'); // Hide

// Error messages - use .show class, not inline display
var errorDiv = document.getElementById('errorMessage');
errorDiv.classList.add('show');          // Show
errorDiv.classList.remove('show');       // Hide

// Button disable pattern
submitBtn.disabled = true;
submitBtn.style.opacity = '0.5';

// Navigation - use document.write() pattern (GAS requirement)
if (result && result.nextPageHtml) {
  document.open();
  document.write(result.nextPageHtml);
  document.close();
  window.scrollTo(0, 0);
}
```

#### HTML Structure (Must Match Tool 4)

Loading overlay must be a static element in the body (not dynamically created):

```html
<div class="loading-overlay" id="loadingOverlay">
  <div class="loading-content">
    <div class="spinner"></div>
    <div class="loading-text" id="loadingText">Loading...</div>
    <div class="loading-subtext" id="loadingSubtext"></div>
  </div>
</div>
```

---

## Data Sources

### Cross-Tool Data Pull

| Field | Source | Tool | Path |
|-------|--------|------|------|
| Age | Tool 2 | `tool2` | `data.age` |
| Employment Type | Tool 2 | `tool2` | `data.employmentType` |
| **Gross Annual Income** | **Tool 6 Question** | `tool6` | **NOT in Tools 1-5** (Tool 2 only has clarity scores, not amounts) |
| Business Owner | Tool 2 | `tool2` | `data.businessOwner` |
| Filing Status | Tool 2 | `tool2` | `data.maritalStatus` → infer (Married = MFJ) |
| Monthly Take-Home | Tool 4 | `tool4` | `data.monthlyIncome` |
| **Years to Retirement** | **Tool 6 Question** | `tool6` | **NOT in Tools 1-5** (Tool 4 goalTimeline is categorical goal timeline, not retirement years) |
| Monthly Retirement Budget | Tool 4 | `tool4` | `data.multiply` (M bucket $ amount) |
| Investment Score | Tool 4 | `tool4` | `data.investmentScore` (1-7) |
| Trauma Pattern | Tool 1 | `tool1` | `data.winningPattern` |
| Identity Subdomain Scores | Tool 3 | `tool3` | `scoring.subdomainQuotients` |
| Connection Subdomain Scores | Tool 5 | `tool5` | `scoring.subdomainQuotients` |
| **Number of Children** | **Tool 6 Question** | `tool6` | Asked when Q13=Yes |
| **Current Education Balance** | **Tool 6 Question** | `tool6` | Combined across all 529/CESA/UTMA accounts |
| **Monthly Education Contribution** | **Tool 6 Question** | `tool6` | Combined across all children |

> **Important:** For detailed data structure documentation for all tools, see `docs/Middleware/middleware-mapping.md`. This document defines the canonical save formats and response schemas for Tools 1-5.

### Monthly Budget Calculation

**IMPORTANT:** Tool 4's `multiply` field contains the **dollar amount** allocated to the M (Multiply/Retirement) bucket, NOT a percentage. This is the user's monthly retirement savings budget.

```javascript
function getMonthlyBudget(toolStatus) {
  // Tool 4's multiply field is the dollar amount for retirement savings
  // This is the M bucket allocation from the M/E/F/J framework
  const monthlyBudget = toolStatus.tool4Data?.multiply || 0;

  // Validation: Tool 4 is REQUIRED for Tool 6
  if (!toolStatus.hasTool4 || monthlyBudget <= 0) {
    throw new Error('Tool 4 must be completed with a retirement savings allocation');
  }

  return monthlyBudget;
}
```

### New Questions Required

#### Core Questions (9 - Always Asked)

| # | Question | Type | Purpose |
|---|----------|------|---------|
| 1 | What is your gross annual income (before taxes)? | Currency | Roth phase-out, tax strategy, employer match calc |
| 2 | How many years until you plan to retire? | Number (1-50) | Projections, catch-up eligibility, Profile 9 detection |
| 3 | Do you have W-2 employees (excluding yourself/spouse)? | Y/N | Profile classification |
| 4 | Are you currently using or interested in ROBS? | Y/N/Interested | Profile 1-3 detection |
| 5 | Does your employer offer a 401(k) plan? | Y/N | Vehicle eligibility |
| 6 | Does your employer offer matching contributions? | Y/N | Non-discretionary calc |
| 7 | What is your employer match formula? | Select | e.g., "50% up to 6%" |
| 8 | Does your plan offer a Roth 401(k) option? | Y/N | Vehicle eligibility |
| 9 | Are you HSA eligible (HDHP enrolled)? | Y/N | Vehicle eligibility |

> **Note:** Questions 1-2 (Gross Income and Years to Retirement) are NOT available from Tools 1-5. Tool 2 only captures income clarity/stress scores, not actual dollar amounts. Tool 4's goalTimeline is a categorical field for the selected financial priority, not years until retirement.

#### ROBS Qualifier Questions (3 - Conditional on Q4 = Interested ONLY)

> **Note:** These questions only appear when user selects "Interested" in ROBS. If user already uses ROBS ("Yes"), they don't need to qualify.

| # | Question | Type | Purpose |
|---|----------|------|---------|
| 10 | Is this a new business (or one you could restructure under a new C-corp)? | Y/N/N/A | ROBS eligibility |
| 11 | Do you have at least $50,000 in a rollover-eligible retirement account? | Y/N/N/A | ROBS eligibility |
| 12 | Can you fund the estimated $5,000-$10,000 setup cost? | Y/N/N/A | ROBS eligibility |

#### Ambition Quotient Questions (4 - Education domain)

| # | Question | Type | Purpose |
|---|----------|------|---------|
| 13 | Do you have children or plan to save for education? | Y/N | Education domain activation |
| 14 | How many children/dependents are you saving for? | Number (1-10) | Education planning (if Q13=Y) |
| 15 | Years until first child needs education funds | Number (0-25) | Education urgency (if Q13=Y) |
| 16 | Rank your savings priorities (drag to reorder) | Ranking | Relative importance |

Options for Q16:
- Retirement security
- Children's education
- Health/medical expenses

> **Education Domain Design:** Uses "Combined CESA" approach from legacy Tool 6 - tracks total education savings across ALL children (529, Coverdell ESA, UTMA), not per-child accounts. This simplifies UI and matches how most families think about education savings.

#### Current State Questions (8 total)

> **Note:** Total retirement balance is calculated from Q17+Q18+Q19 (no separate question). Education balances are combined across all children.

| # | Question | Type | Purpose |
|---|----------|------|---------|
| 17 | Current 401(k) balance | Currency | Vehicle-specific (conditional on Q5=Yes) |
| 18 | Current IRA balance (Traditional + Roth) | Currency | Vehicle-specific (always shown) |
| 19 | Current HSA balance | Currency | Vehicle-specific (conditional on Q9=Yes) |
| 20 | Current education savings balance (all children combined) | Currency | 529/CESA/UTMA total (conditional on Q13=Yes) |
| 21 | Current monthly 401(k) contribution | Currency | Baseline (conditional on Q5=Yes) |
| 22 | Current monthly IRA contribution | Currency | Baseline (always shown) |
| 23 | Current monthly HSA contribution | Currency | Baseline (conditional on Q9=Yes) |
| 24 | Current monthly education contribution (all children) | Currency | Combined (conditional on Q13=Yes) |

---

## Question Conditional Logic

### Visibility Rules

```javascript
const QUESTION_VISIBILITY = {
  // Q1-2: Always shown (gross income, years to retirement)
  // These are REQUIRED and cannot be pre-filled from other tools

  // Q7: Match formula - only show if Q6 = Yes
  q7_matchFormula: (answers) => answers.q6_hasMatch === 'Yes',

  // Q8: Roth 401k option - only show if Q5 = Yes
  q8_hasRoth401k: (answers) => answers.q5_has401k === 'Yes',

  // Q10-12: ROBS qualifiers - only show if Q4 = "Interested" (not "Yes" - already using)
  q10_robsNewBusiness: (answers) => answers.q4_robsInterest === 'Interested',
  q11_robsBalance: (answers) => answers.q4_robsInterest === 'Interested',
  q12_robsSetupCost: (answers) => answers.q4_robsInterest === 'Interested',

  // Q14-15: Education domain - only show if Q13 = Yes
  q14_numChildren: (answers) => answers.q13_hasChildren === 'Yes',
  q15_yearsToEducation: (answers) => answers.q13_hasChildren === 'Yes',

  // Q17: 401k balance - show if has 401k
  q17_current401kBalance: (answers) => answers.q5_has401k === 'Yes',

  // Q18: IRA balance - always show
  q18_currentIRABalance: () => true,

  // Q19: HSA balance - show if HSA eligible
  q19_currentHSABalance: (answers) => answers.q9_hsaEligible === 'Yes',

  // Q20: Education balance - show if has children
  q20_currentEducationBalance: (answers) => answers.q13_hasChildren === 'Yes',

  // Q21: 401k contribution - show if has 401k
  q21_monthly401kContribution: (answers) => answers.q5_has401k === 'Yes',

  // Q22: IRA contribution - always show
  q22_monthlyIRAContribution: () => true,

  // Q23: HSA contribution - show if HSA eligible
  q23_monthlyHSAContribution: (answers) => answers.q9_hsaEligible === 'Yes',

  // Q24: Education contribution - show if has children
  q24_monthlyEducationContribution: (answers) => answers.q13_hasChildren === 'Yes'
};
```

### Default Values When Hidden

| Question | Default When Hidden |
|----------|---------------------|
| Q7 (match formula) | null (no match) |
| Q8 (Roth 401k) | false |
| Q10-12 (ROBS qualifiers) | 'N/A' |
| Q14 (num children) | 0 |
| Q15 (years to education) | 99 (effectively disables Education domain) |
| Q17, Q21 (401k balance/contrib) | 0 |
| Q19, Q23 (HSA balance/contrib) | 0 |
| Q20, Q24 (Education balance/contrib) | 0 |

---

## Profile Classification System

### Decision Tree (First Match Wins)

```
START
  │
  ├─► Using ROBS currently? ──YES──► Profile 1: ROBS-In-Use Strategist
  │
  ├─► Interested in ROBS + Qualifies? ──YES──► Profile 2: ROBS-Curious Candidate
  │
  ├─► Business Owner + Employees? ──YES──► Profile 3: Business Owner with Employees
  │
  ├─► Business Owner + No Employees (Solo)? ──YES──► Profile 4: Solo 401(k) Optimizer
  │
  ├─► Tax focus = "Now" (higher current bracket)? ──YES──► Profile 5: Bracket Strategist
  │
  ├─► Age 50+ AND feels behind? ──YES──► Profile 6: Catch-Up Contributor
  │
  ├─► Tax focus = "Later" (lower current bracket)? ──YES──► Profile 8: Roth Maximizer
  │
  ├─► Within 5-10 years of retirement? ──YES──► Profile 9: Late-Stage Growth
  │
  └─► Default ──────────────────────► Profile 7: Foundation Builder
```

### ROBS Qualification Check

```javascript
function checkROBSEligibility(answers) {
  // All three must be 'Yes' to qualify
  const qualifies =
    answers.q8_robsNewBusiness === 'Yes' &&
    answers.q9_robsBalance === 'Yes' &&
    answers.q10_robsSetupCost === 'Yes';

  return {
    qualifies,
    reasons: qualifies ? [] : [
      answers.q8_robsNewBusiness !== 'Yes' && 'Business structure not eligible',
      answers.q9_robsBalance !== 'Yes' && 'Insufficient rollover balance',
      answers.q10_robsSetupCost !== 'Yes' && 'Cannot fund setup costs'
    ].filter(Boolean)
  };
}
```

### Profile Details

| ID | Profile Name | Key Characteristics | Primary Vehicles |
|----|--------------|---------------------|------------------|
| 1 | ROBS-In-Use Strategist | Using ROBS structure | ROBS, 401(k), HSA |
| 2 | ROBS-Curious Candidate | Interested + qualifies for ROBS | ROBS setup, IRA rollover |
| 3 | Business Owner w/ Employees | Has W-2 employees | SEP-IRA, SIMPLE, 401(k) |
| 4 | Solo 401(k) Optimizer | Self-employed, no employees | Solo 401(k), SEP-IRA |
| 5 | Bracket Strategist | Tax focus on "Now" (higher current bracket) | Traditional 401(k), Traditional IRA |
| 6 | Catch-Up Contributor | Age 50+, feels behind | Catch-up contributions |
| 7 | Foundation Builder | Standard W-2 employee (default) | 401(k) Roth, IRA Roth, HSA |
| 8 | Roth Maximizer | Tax focus on "Later" (lower current bracket) | Roth 401(k), Roth IRA |
| 9 | Late-Stage Growth | 5-10 years to retirement | Conservative allocation, catch-up |

---

## Vehicle Priority Order by Profile

Each profile has a specific priority order for vehicle allocation. Vehicles not listed are not recommended for that profile.

### Profile 1: ROBS-In-Use Strategist
```javascript
const PROFILE_1_PRIORITY = [
  '401(k) Employer Match',  // Always first (free money)
  'HSA',                     // Triple tax advantage
  'ROBS Distribution',       // Required ROBS salary
  '401(k) Traditional',      // Tax deferral
  '401(k) Roth',            // If available
  'IRA Roth',               // Backdoor if high income
  'Taxable Brokerage'       // Overflow
];
```

### Profile 2: ROBS-Curious Candidate
```javascript
const PROFILE_2_PRIORITY = [
  'IRA Rollover to ROBS',   // Setup phase
  '401(k) Employer Match',  // Keep getting match
  'HSA',
  '401(k) Traditional',     // Continue contributions
  'IRA Roth',
  'Taxable Brokerage'
];
```

### Profile 3: Business Owner with Employees
```javascript
const PROFILE_3_PRIORITY = [
  '401(k) Employer Match',
  'HSA',
  'SEP-IRA',                // High limits for biz owners
  'SIMPLE IRA',             // If SEP not available
  '401(k) Traditional',
  'IRA Traditional',
  'Taxable Brokerage'
];
```

### Profile 4: Solo 401(k) Optimizer
```javascript
const PROFILE_4_PRIORITY = [
  'HSA',
  'Solo 401(k) Employee',   // $23k limit
  'Solo 401(k) Employer',   // Up to 25% of comp
  'IRA Roth',               // If income eligible
  'IRA Traditional',
  'Taxable Brokerage'
];
```

### Profile 5: Bracket Strategist (Traditional Focus)
```javascript
const PROFILE_5_PRIORITY = [
  '401(k) Employer Match',
  'HSA',
  '401(k) Traditional',     // Prioritize traditional for current tax savings
  'IRA Traditional',
  '401(k) Roth',            // Only if traditional maxed
  'IRA Roth',
  'Taxable Brokerage'
];
```

### Profile 6: Catch-Up Contributor
```javascript
const PROFILE_6_PRIORITY = [
  '401(k) Employer Match',
  'HSA',                    // Including catch-up at 55+
  '401(k) Traditional',     // Including catch-up ($31,000 at 50+)
  'IRA Traditional',        // Including catch-up ($8,000 at 50+)
  '401(k) Roth',
  'Taxable Brokerage'
];
```

### Profile 7: Foundation Builder
```javascript
const PROFILE_7_PRIORITY = [
  '401(k) Employer Match',
  'HSA',
  '401(k) Roth',            // Standard employee, Roth-leaning
  '401(k) Traditional',
  'IRA Roth',
  'IRA Traditional',
  'Taxable Brokerage'
];
```

### Profile 8: Roth Maximizer
```javascript
const PROFILE_8_PRIORITY = [
  '401(k) Employer Match',
  'HSA',
  '401(k) Roth',            // Prioritize Roth
  'IRA Roth',
  '401(k) Traditional',     // Only if Roth maxed
  'IRA Traditional',
  'Taxable Brokerage'
];
```

### Profile 9: Late-Stage Growth
```javascript
const PROFILE_9_PRIORITY = [
  '401(k) Employer Match',
  'HSA',                    // Including catch-up
  '401(k) Traditional',     // Including catch-up, maximize tax deferral
  '401(k) Roth',            // Roth conversion ladder prep
  'IRA Traditional',        // Including catch-up
  'Taxable Brokerage'
];
```

---

## Ambition Quotient Algorithm

### Purpose

Weights allocation across three domains (Retirement, Education, Health) based on psychological assessment and time urgency.

### Phase C Questions (Adaptive)

Each active domain asks 3 questions on a 1-7 scale:
- **Importance**: "How important is saving for [domain] at this point in your life?"
- **Anxiety**: "How much anxiety do you feel about [domain]?"
- **Motivation**: "How motivated are you to take action toward [domain]?"

**Domain Activation Logic:**
- Retirement: Always active
- Education: Active if `hasChildren === 'Yes'`
- Health: Active if `hsaEligible === 'Yes'`
- Tie-breaker: Asked only if all 3 domains active

### Scale to Score Conversion

```javascript
// Convert 1-7 scale to 0-1 importance score
function scaleToImportance(score) {
  return (score - 1) / 6;  // 1→0.0, 4→0.5, 7→1.0
}
```

### Formula (computeDomainsAndWeights)

```javascript
function computeDomainsAndWeights(preSurveyData) {
  const r = 0.005; // Monthly discount rate (~6% annual)

  // 1. Determine active domains
  const activeDomains = ['Retirement']; // Always active
  if (preSurveyData.a8_hasChildren === 'Yes') activeDomains.push('Education');
  if (preSurveyData.a7_hsaEligible === 'Yes') activeDomains.push('Health');

  // 2. If only retirement active, return 100% retirement
  if (activeDomains.length === 1) {
    return { Retirement: 1.0, Education: 0, Health: 0, activeDomains };
  }

  // 3. Get time horizons (months)
  const yearsToRetirement = parseInt(preSurveyData.a2_yearsToRetirement) || 30;
  const yearsToEducation = parseInt(preSurveyData.a10_yearsToEducation) || 18;
  const timeHorizons = {
    Retirement: yearsToRetirement * 12,
    Education: yearsToEducation * 12,
    Health: yearsToRetirement * 12  // Health uses retirement timeline
  };

  // 4. Calculate weights for each active domain
  const rawWeights = {};
  for (const domain of activeDomains) {
    // Get importance from 1-7 scale question
    const importanceScore = parseInt(preSurveyData[`aq_${domain.toLowerCase()}_importance`]) || 4;
    const importance = (importanceScore - 1) / 6;  // Normalize to 0-1

    // Calculate time-based urgency
    const months = timeHorizons[domain];
    const urgency = 1 / Math.pow(1 + r, months);

    // Blend importance and urgency
    rawWeights[domain] = (importance + urgency) / 2;
  }

  // 5. Normalize to sum = 1
  const total = Object.values(rawWeights).reduce((a, b) => a + b, 0);
  const weights = { Retirement: 0, Education: 0, Health: 0 };
  for (const domain of activeDomains) {
    weights[domain] = rawWeights[domain] / total;
  }

  return { ...weights, activeDomains };
}
```

### Tie-Breaker Handling

When all 3 domains are active and weights are close (within 5%), use the tie-breaker answer to boost the chosen domain by 10%:

```javascript
if (activeDomains.length === 3 && preSurveyData.aq_tiebreaker) {
  const chosen = preSurveyData.aq_tiebreaker;
  weights[chosen] += 0.10;
  // Re-normalize
  const newTotal = Object.values(weights).reduce((a, b) => a + b, 0);
  for (const d of activeDomains) {
    weights[d] = weights[d] / newTotal;
  }
}
```

### Domain to Vehicle Mapping

```javascript
const DOMAIN_VEHICLE_MAP = {
  Retirement: [
    '401(k) Employer Match',
    '401(k) Traditional',
    '401(k) Roth',
    'IRA Traditional',
    'IRA Roth',
    'Solo 401(k) Employee',
    'Solo 401(k) Employer',
    'SEP-IRA',
    'SIMPLE IRA',
    'ROBS Distribution'
  ],
  Education: [
    '529 Plan',
    'Coverdell ESA',
    'UTMA/UGMA'
  ],
  Health: [
    'HSA'
  ]
};
```

---

## Vehicle Allocation Engine

### Retirement Vehicles (Priority Order by Profile)

**Note:** All limits are 2025 IRS limits. See Appendix B for complete reference including age 60-63 super catch-up.

| Vehicle | Annual Limit (2025) | Catch-Up (50+) | Tax Treatment | Domain |
|---------|---------------------|----------------|---------------|--------|
| 401(k) Employer Match | Varies | N/A | Pre-tax (free money) | Retirement |
| HSA | $4,300 / $8,550 family | +$1,000 (55+) | Triple tax-free | Health |
| 401(k) Traditional | $23,500 | +$7,500 | Pre-tax | Retirement |
| 401(k) Roth | $23,500 | +$7,500 | After-tax, tax-free growth | Retirement |
| IRA Traditional | $7,000 | +$1,000 | Pre-tax (if eligible) | Retirement |
| IRA Roth | $7,000 | +$1,000 | After-tax, tax-free growth | Retirement |
| Solo 401(k) | $70,000 total | +$7,500 | Pre-tax or Roth | Retirement |
| SEP-IRA | 25% of comp, max $70,000 | N/A | Pre-tax | Retirement |
| 529 Plan | Varies by state | N/A | Tax-free for education | Education |
| Coverdell ESA | $2,000/year | N/A | Tax-free for education | Education |
| ROBS | No limit (investment) | N/A | Tax-deferred | Retirement |
| Taxable Brokerage | No limit | N/A | Capital gains | Overflow |

### Waterfall Allocation Algorithm

**Important:** This section provides a conceptual overview. The complete implementation with leftover cascade, cross-domain tracking, and non-discretionary seeds is documented in the **"Advanced Allocation Logic"** section below. Implementers should use the `coreAllocate()` pattern from that section.

```javascript
// CONCEPTUAL OVERVIEW - see "Advanced Allocation Logic" for complete implementation
function allocateToVehicles(monthlyBudget, profile, eligibility, domainWeights) {
  const allocations = {};
  let remaining = monthlyBudget;

  // Step 1: Allocate non-discretionary (employer match) first
  // See "Non-Discretionary vs Discretionary Seeds" section for full logic
  if (eligibility.hasEmployerMatch) {
    const matchAmount = eligibility.employerMatchAmount;
    allocations['401(k) Employer Match'] = matchAmount;
    // Note: Match doesn't come from user's budget
  }

  // Step 2: Calculate domain budgets based on weights
  const domainBudgets = {
    Retirement: remaining * domainWeights.Retirement,
    Education: remaining * domainWeights.Education,
    Health: remaining * domainWeights.Health
  };

  // Step 3: Allocate within each domain with LEFTOVER CASCADE
  // Education → Health → Retirement (unused $ flows to next domain)
  // See "Leftover Cascade Between Domains" section
  const vehicleOrder = getVehiclePriorityOrder(profile, eligibility);

  for (const vehicle of vehicleOrder) {
    if (remaining <= 0) break;

    const domain = getVehicleDomain(vehicle);
    const domainBudget = domainBudgets[domain];
    const monthlyLimit = getMonthlyLimit(vehicle, eligibility);

    // Allocate minimum of: domain budget, vehicle limit, remaining total
    const allocation = Math.min(domainBudget, monthlyLimit, remaining);

    if (allocation > 0) {
      allocations[vehicle] = allocation;
      remaining -= allocation;
      domainBudgets[domain] -= allocation;
    }
  }

  // Step 4: Overflow goes to taxable (Family Bank)
  // See "Appendix D: Family Bank / Overflow Concept"
  if (remaining > 0) {
    allocations['Taxable Brokerage'] = remaining;
  }

  return allocations;
}
```

### Slider Coupling Algorithm

```javascript
function handleSliderChange(changedVehicle, newValue, allocations, limits) {
  const oldValue = allocations[changedVehicle] || 0;
  const delta = newValue - oldValue;

  // Validate against IRS limit
  const limit = limits[changedVehicle] || Infinity;
  const constrainedValue = Math.min(newValue, limit);
  const actualDelta = constrainedValue - oldValue;

  if (actualDelta === 0) return allocations;

  const updatedAllocations = { ...allocations };
  updatedAllocations[changedVehicle] = constrainedValue;

  // Get other vehicles (excluding the changed one)
  const others = Object.keys(allocations).filter(v => v !== changedVehicle);
  const totalOthers = others.reduce((sum, v) => sum + allocations[v], 0);

  if (actualDelta > 0 && totalOthers > 0) {
    // Increasing this vehicle: reduce others proportionally
    for (const vehicle of others) {
      const proportion = allocations[vehicle] / totalOthers;
      const reduction = actualDelta * proportion;
      updatedAllocations[vehicle] = Math.max(0, allocations[vehicle] - reduction);
    }
  } else if (actualDelta < 0) {
    // Decreasing this vehicle: add to next priority vehicle with headroom
    const freed = Math.abs(actualDelta);
    let remaining = freed;

    for (const vehicle of others) {
      if (remaining <= 0) break;
      const headroom = (limits[vehicle] || Infinity) - updatedAllocations[vehicle];
      const addition = Math.min(remaining, headroom);
      updatedAllocations[vehicle] += addition;
      remaining -= addition;
    }
  }

  return updatedAllocations;
}
```

---

## Advanced Allocation Logic (Preserved from Legacy)

The legacy Tool 6 contains sophisticated allocation algorithms that must be preserved. This section documents the key patterns.

### 1. Leftover Cascade Between Domains

When a domain can't use all its allocated pool (e.g., Education vehicles are maxed), the leftover cascades to the next domain:

```javascript
function coreAllocate({ domains, pool, seeds, vehicleOrders }) {
  const vehicles = initializeVehicles(vehicleOrders, seeds);
  const cumulativeAllocations = {};

  // Education gets its weighted share
  const eduPool = domains.Education.w * pool;
  const eduAlloc = cascadeWaterfall(vehicleOrders.Education, eduPool, vehicles.Education, cumulativeAllocations);
  vehicles.Education = eduAlloc;
  const leftoverEdu = eduPool - sumValues(eduAlloc);

  // Health gets its share PLUS leftover from Education
  const healthPool = domains.Health.w * pool + leftoverEdu;
  const hlthAlloc = cascadeWaterfall(vehicleOrders.Health, healthPool, vehicles.Health, cumulativeAllocations);
  vehicles.Health = hlthAlloc;
  const leftoverHealth = healthPool - sumValues(hlthAlloc);

  // Retirement gets its share PLUS leftover from Health
  const retPool = domains.Retirement.w * pool + leftoverHealth;
  const retAlloc = cascadeWaterfall(vehicleOrders.Retirement, retPool, vehicles.Retirement, cumulativeAllocations);
  vehicles.Retirement = retAlloc;

  return vehicles;
}
```

**Why this matters:** If someone has no children (Education weight = 0 or vehicles maxed quickly), those dollars flow to Health, then to Retirement. Money is never wasted.

### 2. Cross-Domain Vehicle Tracking

Some vehicles can appear in multiple domain contexts. The allocator tracks cumulative allocations to prevent over-allocation:

```javascript
function cascadeWaterfallWithTracking(order, pool, initial, cumulativeAllocations) {
  const alloc = { ...initial };
  let remaining = pool;

  for (const v of order) {
    const already = alloc[v.name] || 0;
    const cumulativeAlready = cumulativeAllocations[v.name] || 0;

    // Check BOTH domain-specific AND cumulative against the cap
    const totalAlready = cumulativeAlready + already;
    const available = Math.max(0, (v.capMonthly || Infinity) - totalAlready);
    const take = Math.min(available, remaining);

    if (take > 0) {
      alloc[v.name] = already + take;
      // Update cumulative tracking for cross-domain awareness
      cumulativeAllocations[v.name] = totalAlready + take;
      remaining -= take;
    }
    if (remaining <= 0) break;
  }
  return alloc;
}
```

**Example:** HSA appears in Health domain but benefits Retirement too. If HSA is partially filled in Health, Retirement knows not to exceed the remaining cap.

### 3. Non-Discretionary vs Discretionary Seeds

The allocation distinguishes between:
- **Non-discretionary:** Contributions the user must make or automatically receives (employer match, ROBS distributions, DB plan minimums)
- **Discretionary:** Contributions the user can adjust with sliders

```javascript
// Uses v3 Profile IDs (see Appendix A for legacy mapping)
const NON_DISCRETIONARY_BY_PROFILE = {
  // Profile 1: ROBS-In-Use Strategist
  1: {
    // ROBS profit distributions are locked - business structure requires it
    'ROBS Solo 401(k) – Profit Distribution': (data) => data.robsProfitDistribution / 12
  },

  // Profile 4: Solo 401(k) Optimizer
  4: {
    // Employer portion of Solo 401k (if already contributing)
    'Solo 401(k) – Employer': (data) => data.solo401kEmployerAnnual / 12
  },

  // Profile 3: Business Owner with Employees
  3: {
    // Defined Benefit or Safe Harbor contributions are mandatory
    'Defined Benefit Plan': (data) => data.dbPlanAnnual / 12,
    'Safe Harbor 401(k)': (data) => data.safeHarborAnnual / 12
  },

  // W-2 profiles with employer match
  2: { '401(k) Match Traditional': calculateEmployerMatch },  // ROBS-Curious
  5: { '401(k) Match Traditional': calculateEmployerMatch },  // High Earner
  6: { '401(k) Match Traditional': calculateEmployerMatch },  // Catch-Up
  7: { '401(k) Match Traditional': calculateEmployerMatch },  // Bracket Strategist
  8: { '401(k) Match Traditional': calculateEmployerMatch },  // Roth Maximizer
  9: { '401(k) Match Traditional': calculateEmployerMatch }   // Late-Stage Growth
};
```

**Treatment in allocation:**
1. Non-discretionary seeds are added BEFORE the waterfall runs
2. They count against vehicle caps
3. They are displayed separately in UI ("Employer contributes: $X")
4. Sliders only control discretionary amounts

### 4. Tax Strategy Vehicle Reordering

Based on tax focus (Now/Later/Both), the vehicle priority order is dynamically adjusted:

```javascript
function prioritizeRothAccounts(vehicleOrder) {
  // Move Roth variants before Traditional variants
  const rothVehicles = vehicleOrder.filter(v =>
    v.name.includes('Roth') || v.name.includes('HSA')
  );
  const traditionalVehicles = vehicleOrder.filter(v =>
    v.name.includes('Traditional') && !v.name.includes('Roth')
  );
  const otherVehicles = vehicleOrder.filter(v =>
    !v.name.includes('Roth') && !v.name.includes('Traditional') && !v.name.includes('HSA')
  );

  return [...rothVehicles, ...traditionalVehicles, ...otherVehicles];
}

function prioritizeTraditionalAccounts(vehicleOrder) {
  // Move Traditional variants before Roth variants
  const traditionalVehicles = vehicleOrder.filter(v =>
    v.name.includes('Traditional')
  );
  const rothVehicles = vehicleOrder.filter(v =>
    v.name.includes('Roth')
  );
  const otherVehicles = vehicleOrder.filter(v =>
    !v.name.includes('Roth') && !v.name.includes('Traditional')
  );

  // HSA stays high priority regardless (triple tax advantage)
  const hsaVehicle = otherVehicles.find(v => v.name === 'HSA');
  const nonHsaOther = otherVehicles.filter(v => v.name !== 'HSA');

  return [hsaVehicle, ...traditionalVehicles, ...rothVehicles, ...nonHsaOther].filter(Boolean);
}
```

**Application per profile:**
```javascript
// In allocation engine, after getting base vehicle order
if (taxFocus === 'Now') {
  // User wants tax savings now → prioritize Traditional
  vehicleOrder = prioritizeTraditionalAccounts(vehicleOrder);
} else if (taxFocus === 'Later') {
  // User wants tax-free retirement → prioritize Roth
  vehicleOrder = prioritizeRothAccounts(vehicleOrder);
}
// 'Both' or undefined keeps the profile's default order
```

### 5. Roth IRA Phase-Out Handling

High earners may be ineligible for direct Roth IRA contributions. The allocator handles this:

```javascript
function applyRothIRAPhaseOut(vehicleOrder, { grossIncome, filingStatus, taxFocus }) {
  // 2025 Roth IRA income phase-out limits
  const limits = {
    'Single': { start: 150000, end: 165000 },
    'MFJ': { start: 236000, end: 246000 },
    'MFS': { start: 0, end: 10000 }
  };

  const limit = limits[filingStatus] || limits['Single'];

  return vehicleOrder.map(v => {
    if (v.name === 'IRA Roth') {
      if (grossIncome >= limit.end) {
        // Completely phased out - replace with Backdoor Roth
        return { name: 'Backdoor Roth IRA', capMonthly: v.capMonthly };
      } else if (grossIncome > limit.start) {
        // Partial phase-out - reduce cap proportionally
        const phaseOutRatio = (limit.end - grossIncome) / (limit.end - limit.start);
        return { ...v, capMonthly: v.capMonthly * phaseOutRatio };
      }
    }
    return v;
  });
}
```

### 6. Age-Based Catch-Up Adjustments

Vehicle caps automatically increase for users 50+ (HSA catch-up starts at 55):

```javascript
// 2025 IRS Limits - see Appendix B for complete reference
function getVehicleCap(vehicleName, age, filingStatus) {
  const baseCaps = {
    '401(k) Traditional': 23500 / 12,  // $1,958.33/mo
    '401(k) Roth': 23500 / 12,
    'IRA Traditional': 7000 / 12,       // $583.33/mo
    'IRA Roth': 7000 / 12,
    'HSA Individual': 4300 / 12,        // $358.33/mo
    'HSA Family': 8550 / 12             // $712.50/mo
  };

  // SECURE 2.0 super catch-up for ages 60-63
  const catchUpAmounts = {
    '401(k) Traditional': age >= 60 && age <= 63 ? 11250 : (age >= 50 ? 7500 : 0),
    '401(k) Roth': age >= 60 && age <= 63 ? 11250 : (age >= 50 ? 7500 : 0),
    'IRA Traditional': age >= 50 ? 1000 : 0,
    'IRA Roth': age >= 50 ? 1000 : 0,
    'HSA Individual': age >= 55 ? 1000 : 0,  // HSA catch-up at 55, not 50
    'HSA Family': age >= 55 ? 1000 : 0
  };

  const base = baseCaps[vehicleName] || Infinity;
  const catchUp = (catchUpAmounts[vehicleName] || 0) / 12;

  return base + catchUp;
}
```

**Key Notes:**
- **HSA catch-up starts at 55**, not 50 (different from retirement accounts)
- **SECURE 2.0 super catch-up (ages 60-63):** $11,250 for 401(k) plans
- Super catch-up expires at age 64 (reverts to standard $7,500 catch-up)

### 7. HSA Coverage Type Inference

HSA limits differ significantly between individual ($4,300) and family ($8,550) coverage. Rather than adding another question, **infer coverage type from filing status**:

```javascript
/**
 * Infer HSA coverage type from filing status
 * @param {string} filingStatus - 'Single', 'MFJ', or 'MFS'
 * @returns {string} 'Individual' or 'Family'
 */
function inferHSACoverageType(filingStatus) {
  // MFJ (Married Filing Jointly) implies family coverage
  // Single and MFS (Married Filing Separately) default to individual
  return filingStatus === 'MFJ' ? 'Family' : 'Individual';
}

/**
 * Get HSA monthly limit based on filing status and age
 * @param {string} filingStatus - 'Single', 'MFJ', or 'MFS'
 * @param {number} age - User's age for catch-up calculation
 * @returns {number} Monthly HSA contribution limit
 */
function getHSALimit(filingStatus, age) {
  const coverageType = inferHSACoverageType(filingStatus);
  const baseLimit = coverageType === 'Family'
    ? IRS_LIMITS_2025.HSA_FAMILY
    : IRS_LIMITS_2025.HSA_INDIVIDUAL;

  // HSA catch-up at 55+ (not 50 like retirement accounts)
  const catchUp = age >= 55 ? IRS_LIMITS_2025.HSA_CATCHUP : 0;

  return (baseLimit + catchUp) / 12;
}

// Examples:
// Single, age 45 → Individual → $4,300/yr → $358.33/mo
// MFJ, age 45 → Family → $8,550/yr → $712.50/mo
// MFJ, age 57 → Family + catch-up → $9,550/yr → $795.83/mo
```

**Inference Logic:**
| Filing Status | Inferred Coverage | Annual Limit | With Catch-Up (55+) |
|---------------|-------------------|--------------|---------------------|
| Single | Individual | $4,300 | $5,300 |
| MFJ | Family | $8,550 | $9,550 |
| MFS | Individual | $4,300 | $5,300 |

**Why This Works:**
- MFJ filers are married and typically have family health coverage
- Single filers have individual coverage by definition
- MFS is rare and conservative default to individual is appropriate
- Users can manually override in advanced settings if needed (Phase 10)

---

## Investment Score Integration

### Source
- Pulled from Tool 4: `investmentScore` (1-7 scale)
- Displayed in UI with adjustment capability
- Shows impact notes when changed

### Return Rate Mapping

**Note:** These rates map to the `PROJECTION_CONFIG` in the Projections Engine section. Formula: `rate = 0.08 + ((score - 1) / 6) * 0.12`

| Score | Risk Level | Assumed Annual Return |
|-------|------------|----------------------|
| 1 | Very Conservative | 8% |
| 2 | Conservative | 10% |
| 3 | Moderately Conservative | 12% |
| 4 | Moderate | 14% |
| 5 | Moderately Aggressive | 16% |
| 6 | Aggressive | 18% |
| 7 | Very Aggressive | 20% |

### UI Display

```
Investment Risk Tolerance
┌─────────────────────────────────────────┐
│  1   2   3   4   [5]  6   7            │
│  ○   ○   ○   ○   ●   ○   ○            │
│                                         │
│  Current: Moderately Aggressive (12%)   │
│                                         │
│  ⚠️ Impact: Higher scores assume        │
│  higher returns but come with more      │
│  volatility. Your actual returns may    │
│  vary significantly.                    │
└─────────────────────────────────────────┘
```

---

## Tax Strategy Toggle

### Options

| Option | Description | Effect on Allocation |
|--------|-------------|---------------------|
| Traditional-Heavy | Current bracket high, expect lower in retirement | Prioritize Traditional 401(k), Traditional IRA |
| Balanced | Uncertain or similar brackets | 50/50 split between Traditional and Roth |
| Roth-Heavy | Current bracket low, expect higher in retirement | Prioritize Roth 401(k), Roth IRA |

### Auto-Recommendation

```javascript
function recommendTaxStrategy(grossIncome, filingStatus) {
  const threshold = filingStatus === 'MFJ' ? 100000 : 75000;
  const highThreshold = filingStatus === 'MFJ' ? 200000 : 150000;

  if (grossIncome < threshold) {
    return 'Roth-Heavy';
  } else if (grossIncome > highThreshold) {
    return 'Traditional-Heavy';
  } else {
    return 'Balanced';
  }
}
```

---

## Employer Match Calculation

### Input Format

Dropdown options:
- "100% up to 3%"
- "100% up to 4%"
- "100% up to 5%"
- "100% up to 6%"
- "50% up to 6%"
- "50% up to 4%"
- "25% up to 6%"
- "Other (custom)"

### Calculation

```javascript
function calculateEmployerMatch(grossAnnualIncome, matchFormula) {
  // Parse formula: "50% up to 6%"
  const match = matchFormula.match(/(\d+)%\s*up to\s*(\d+)%/);
  if (!match) return 0;

  const matchRate = parseInt(match[1]) / 100;  // 0.50
  const matchLimit = parseInt(match[2]) / 100; // 0.06

  // Annual match = income * limit * rate
  const annualMatch = grossAnnualIncome * matchLimit * matchRate;

  // Monthly match
  return annualMatch / 12;
}

// Example: $100,000 income, "50% up to 6%"
// Match = $100,000 * 0.06 * 0.50 = $3,000/year = $250/month
```

### Treatment in Allocation

- Employer match is **non-discretionary** (free money)
- Always allocated first, before user contributions
- Shown separately in UI: "Your contribution" vs "Employer match"
- Not counted against user's monthly budget

---

## Projections Engine

### Configuration Constants

```javascript
const PROJECTION_CONFIG = {
  // Investment score → return rate mapping
  BASE_RATE: 0.08,              // Score 1 = 8% annual return
  MAX_ADDITIONAL_RATE: 0.12,    // Score 7 = 8% + 12% = 20% annual return

  // Calculation method
  USE_MONTHLY_COMPOUNDING: true,

  // Safeguards against unrealistic projections
  MAX_YEARS: 70,                // Maximum timeline
  MAX_RATE: 0.25,               // Maximum 25% annual return
  MAX_FV: 100000000,            // Cap at $100 million

  // Minimum savings rate for "ideal" scenario
  OPTIMIZED_SAVINGS_RATE: 0.20, // 20% minimum for recommendations

  // Family Bank uses conservative growth
  FAMILY_BANK_RATE: 0.05        // 5% for overflow/taxable
};
```

### Actual vs Ideal Scenarios

The legacy system calculates TWO scenarios:

| Scenario | Description | Savings Rate |
|----------|-------------|--------------|
| **Actual** | Current contributions | User's actual rate |
| **Ideal** | Optimized recommendations | MAX(user rate, 20%) |

This allows showing "Here's where you are" vs "Here's where you could be".

### Investment Score → Return Rate

```javascript
function calculatePersonalizedRate(investmentScore) {
  // investmentScore is 1-7 scale from Tool 4
  // Maps to 8% - 20% annual return
  const score = Math.max(1, Math.min(7, investmentScore || 4));
  return PROJECTION_CONFIG.BASE_RATE +
         ((score - 1) / 6) * PROJECTION_CONFIG.MAX_ADDITIONAL_RATE;
}

// Examples:
// Score 1 → 8%
// Score 4 → 14%
// Score 7 → 20%
```

### Domain-Specific Timelines

Each domain has its own timeline for FV calculations:

```javascript
const timelines = {
  retirement: yearsToRetirement,           // From Tool 4 or user input
  education: yearsUntilFirstEducation,     // From Q12 (or 99 if no kids)
  health: yearsToRetirement,               // HSA for retirement healthcare
  familyBank: yearsToRetirement            // Overflow uses retirement timeline
};
```

### Inputs

| Field | Source |
|-------|--------|
| Current Balance | User input (required) |
| Monthly Contribution | Calculated allocation |
| Years to Retirement | Tool 4 `goalTimeline` |
| Expected Return | Investment score mapping |
| Inflation Rate | Default 2.5% (adjustable) |

### Future Value Calculation with Safeguards

```javascript
function futureValue(monthlyContribution, annualRate, years) {
  // Input validation
  if (!monthlyContribution || monthlyContribution <= 0 || years <= 0) {
    return 0;
  }

  // Handle "no children" indicator
  if (years >= 99) {
    return 0;
  }

  // Apply safeguards
  years = Math.min(years, PROJECTION_CONFIG.MAX_YEARS);
  annualRate = Math.min(annualRate, PROJECTION_CONFIG.MAX_RATE);

  // Monthly compounding formula
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  // Check for overflow before calculation
  const growthFactor = Math.pow(1 + monthlyRate, months);
  if (!isFinite(growthFactor) || growthFactor > 1000000) {
    return PROJECTION_CONFIG.MAX_FV;
  }

  // FV = PMT × ((1 + r)^n - 1) / r
  let fv;
  if (monthlyRate === 0) {
    fv = monthlyContribution * months;
  } else {
    fv = monthlyContribution * ((growthFactor - 1) / monthlyRate);
  }

  // Apply maximum cap
  return Math.min(Math.round(fv), PROJECTION_CONFIG.MAX_FV);
}
```

### Complete Projection Calculation

```javascript
function calculateProjections(inputs) {
  const {
    currentBalance,
    monthlyContribution,
    yearsToRetirement,
    annualReturn,
    inflationRate = 0.025  // Default 2.5%
  } = inputs;

  // Use safeguarded futureValue() for contribution growth
  // This applies MAX_FV, MAX_RATE, MAX_YEARS caps automatically
  const fvContributions = futureValue(monthlyContribution, annualReturn, yearsToRetirement);

  // Future value of current balance (lump sum growth)
  // Apply same safeguards
  const cappedYears = Math.min(yearsToRetirement, PROJECTION_CONFIG.MAX_YEARS);
  const cappedRate = Math.min(annualReturn, PROJECTION_CONFIG.MAX_RATE);
  const fvBalance = currentBalance * Math.pow(1 + cappedRate, cappedYears);

  // Total projected balance (capped at $100M)
  const projectedBalance = Math.min(
    fvBalance + fvContributions,
    PROJECTION_CONFIG.MAX_FV
  );

  // Real (inflation-adjusted) balance
  const realBalance = projectedBalance / Math.pow(1 + inflationRate, cappedYears);

  // Baseline (if they did nothing - just current balance growing)
  const baseline = currentBalance * Math.pow(1 + cappedRate, cappedYears);

  // Improvement from following the plan
  const improvement = projectedBalance - baseline;

  return {
    projectedBalance,
    realBalance,
    baseline,
    improvement,
    monthlyRetirementIncome: realBalance / (25 * 12), // 4% rule approximation
    yearsUsed: cappedYears,
    rateUsed: cappedRate
  };
}
```

### Tax-Free vs Taxable Breakdown

```javascript
function calculateTaxBreakdown(allocations, projections) {
  // Sum Roth allocations
  const rothAllocation = (allocations['401(k) Roth'] || 0) +
                         (allocations['IRA Roth'] || 0) +
                         (allocations['HSA'] || 0); // HSA is tax-free if used for medical

  const totalAllocation = Object.values(allocations).reduce((a, b) => a + b, 0);
  const rothPercentage = totalAllocation > 0 ? rothAllocation / totalAllocation : 0;

  return {
    taxFreeAtRetirement: projections.projectedBalance * rothPercentage,
    taxableAtRetirement: projections.projectedBalance * (1 - rothPercentage),
    rothPercentage: rothPercentage * 100
  };
}
```

### Education Domain Projections

Education projections use the same `futureValue()` function but with education-specific inputs:

```javascript
function calculateEducationProjections(inputs) {
  const {
    currentEducationBalance,      // Q20: Combined across all 529/CESA/UTMA
    monthlyEducationContribution, // Q24: Combined monthly for all children
    yearsToEducation,             // Q15: Years until first child needs funds
    numChildren,                  // Q14: Number of children (for context)
    annualReturn = 0.07           // More conservative than retirement (default 7%)
  } = inputs;

  // Skip if no children or no education savings
  if (yearsToEducation >= 99 || numChildren === 0) {
    return {
      projectedBalance: 0,
      improvement: 0,
      baseline: 0,
      yearsUsed: 0,
      numChildren: 0
    };
  }

  // Future value of monthly contributions
  const fvContributions = futureValue(monthlyEducationContribution, annualReturn, yearsToEducation);

  // Future value of current balance
  const cappedYears = Math.min(yearsToEducation, PROJECTION_CONFIG.MAX_YEARS);
  const fvBalance = currentEducationBalance * Math.pow(1 + annualReturn, cappedYears);

  // Total projected
  const projectedBalance = Math.min(fvBalance + fvContributions, PROJECTION_CONFIG.MAX_FV);

  // Baseline (if they did nothing)
  const baseline = currentEducationBalance * Math.pow(1 + annualReturn, cappedYears);

  return {
    projectedBalance,
    baseline,
    improvement: projectedBalance - baseline,
    yearsUsed: cappedYears,
    numChildren,
    perChildEstimate: numChildren > 0 ? Math.round(projectedBalance / numChildren) : 0
  };
}
```

> **Note:** Education projections are shown separately from retirement projections. The "Combined CESA" approach tracks total across all children - the `perChildEstimate` divides by `numChildren` for informational purposes only.

---

## Scenario Management

### Save Scenario

Saves to `TOOL6_SCENARIOS` sheet:

| Column | Field | Notes |
|--------|-------|-------|
| A | Timestamp | ISO format |
| B | Client_ID | |
| C | Scenario_Name | User-defined or auto-generated |
| D | Profile_ID | 1-9 |
| E | Monthly_Budget | From Tool 4 multiply |
| F | Domain_Weights (JSON) | `{ Retirement, Education, Health }` |
| G | Allocations (JSON) | Vehicle allocations |
| H | Investment_Score | 1-7 |
| I | Tax_Strategy | Traditional/Balanced/Roth |
| J | Projected_Balance | Retirement projection |
| K | Current_Balances (JSON) | `{ '401k', ira, hsa, education }` |
| L | Current_Contributions (JSON) | `{ '401k', ira, hsa, education }` |
| M | Education_Inputs (JSON) | `{ numChildren, yearsToEducation }` |
| N | Education_Projection | Education domain projection |
| O | Is_Latest | Boolean |

> **v1.6 Update:** Added columns L-N for education domain data. The `Current_Balances` and `Current_Contributions` JSON objects now include `education` field for combined 529/CESA/UTMA totals.

### Load Scenario

- Dropdown populated with user's saved scenarios
- Loading restores all inputs and recalculates

### Compare Scenarios

Side-by-side comparison (like Tool 8):
- Key metrics table
- Feasibility comparison
- Quick recommendation

---

## Trauma-Informed Insights

### Integration Points

| Trauma Pattern | Tool 6 Adaptation |
|----------------|-------------------|
| Scarcity | Emphasize guaranteed vehicles (employer match), show "safety net" messaging |
| Avoidance | Simplify display, highlight automation, reduce overwhelm |
| Perfectionism | Show multiple valid options, reduce "right answer" pressure |
| Self-Worth | Connect savings to self-care, not just numbers |
| Control | Emphasize user choice in sliders, show impact of their decisions |
| Trust | Explain each vehicle clearly, show IRS limits as validation |

### Insight Display

In Profile section:
```
Based on your responses, we notice you may benefit from:
• [Trauma-specific insight 1]
• [Trauma-specific insight 2]

This is reflected in your allocation recommendations.
```

---

## Edge Cases & Error Handling

### Missing Upstream Data

| Scenario | Handling |
|----------|----------|
| No Tool 1-5 data (new user) | Show all backup questions; use defaults for classification |
| Partial data (e.g., Tool 2 only) | Pull what's available; show backup questions for missing fields |
| Tool 4 missing (no income/timeline) | BLOCK: Require Tool 4 completion first (income is critical) |

### Backup Questions for Missing Data

```javascript
const BACKUP_QUESTIONS = {
  // If Tool 2 missing
  age: { type: 'number', label: 'What is your current age?', default: 35 },
  income: { type: 'currency', label: 'What is your gross annual income?', default: 75000 },
  employmentType: { type: 'select', label: 'Employment type?', options: ['W-2', 'Self-employed', 'Both'] },
  filingStatus: { type: 'select', label: 'Tax filing status?', options: ['Single', 'Married Filing Jointly'] },

  // If Tool 4 missing - BLOCK, don't allow backup
  // Tool 4 is required because it determines retirement savings budget

  // If Tool 1 missing
  traumaPattern: null // Use "Balanced" default messaging
};
```

### Edge Case Handling

| Edge Case | Handling |
|-----------|----------|
| Income = $0 | Show warning; allow manual budget entry; skip employer match |
| Age missing | Require input; affects catch-up eligibility |
| Years to retirement = 0 | Show "already retired" message; focus on withdrawal strategy |
| No eligible vehicles | Only show taxable brokerage |
| Budget > all limits | Allocate to limits; overflow to taxable |
| Negative projection | Show warning; likely unrealistic return assumption |

### Error Display

```javascript
function showError(errorType, message) {
  // User-friendly error messages
  const errorMessages = {
    'missing_tool4': 'Please complete Tool 4 (Financial Freedom Framework) first to determine your retirement savings budget.',
    'invalid_income': 'Please enter a valid income amount.',
    'no_vehicles': 'Based on your inputs, no tax-advantaged vehicles are available. Your savings will go to a taxable brokerage account.',
    'calculation_error': 'There was an error calculating your allocation. Please try again.',
    'save_failed': 'Could not save your scenario. Please check your connection and try again.'
  };

  return errorMessages[errorType] || message;
}
```

---

## File Structure

```
tools/tool6/
├── Tool6.js              # Main tool class + HTML generation
├── Tool6Profiles.js      # Profile classification logic
├── Tool6Allocation.js    # Vehicle allocation engine + Ambition Quotient
├── Tool6Projections.js   # Projection calculations
├── Tool6Report.js        # Report generation + PDF
├── Tool6GPTAnalysis.js   # GPT integration (Phase 2)
├── Tool6Fallbacks.js     # Fallback content for GPT failures
├── Tool6Validation.js    # IRS limit validation
└── tool6.manifest.json   # Tool metadata
```

### File Dependencies

```
Tool6.js (main)
  ├── imports: Tool6Profiles.js
  ├── imports: Tool6Allocation.js
  ├── imports: Tool6Projections.js
  ├── imports: Tool6Validation.js
  ├── imports: Tool6Report.js
  └── imports: Tool6Fallbacks.js (for GPT failures)

Tool6Allocation.js
  └── imports: Tool6Validation.js (for limit checking)

Tool6Report.js
  ├── imports: Tool6GPTAnalysis.js
  └── imports: Tool6Fallbacks.js
```

---

## Reference Code Locations

### Patterns to Follow from Tool 4

| Feature | Tool 4 Location | Notes |
|---------|-----------------|-------|
| Manifest structure | `tools/tool4/tool4.manifest.json` | Copy and modify |
| Registration | `Code.js:126-149` | Add Tool 6 after Tool 5 |
| Collapsible sections | `Tool4.js:754-812` | Pre-survey header pattern |
| Scenario save | `Tool4.js:203-402` | `saveScenario()` function |
| Scenario load | `Tool4.js:408-417` | `getScenarios()` function |
| Slider coupling | `Tool4.js` (client-side JS) | Real-time updates |
| PDF generation | Uses `shared/PDFGenerator.js` | Standard pattern |
| DataService calls | `Tool4.js:69-91` | `checkToolCompletion()` |
| Error handling | Uses `shared/ErrorHandler.js` | Standard pattern |

### Patterns to Follow from Tool 8 (Legacy)

| Feature | Tool 8 Location | Notes |
|---------|-----------------|-------|
| Investment dial | `apps/Tool-8.../index.html:420-456` | Risk slider UI |
| Mode selection | `apps/Tool-8.../index.html:377-392` | Radio button modes |
| Scenario comparison | `apps/Tool-8.../index.html:556-584` | Side-by-side view |
| Advanced settings | `apps/Tool-8.../index.html:587-645` | Collapsible details |
| Real-time recalc | `apps/Tool-8.../index.html:1009-1176` | `recalc()` function |

---

## Implementation Sprints

### Sprint Overview

| Phase | Sprints | Total Effort |
|-------|---------|--------------|
| 0: Foundation | 0.1, 0.2, 0.3 | 1 day |
| 1: Data Layer | 1.1, 1.2, 1.3 | 1-2 days |
| 2: Profile Classification | 2.1, 2.2, 2.3, 2.4 | 1-2 days |
| 3: Ambition Quotient | 3.1, 3.2 | 1 day |
| 4: Vehicle Allocation | 4.1, 4.2, 4.3, 4.4, 4.5 | 2-3 days |
| 5: Calculator UI | 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 | 3-4 days |
| 6: Projections | 6.1, 6.2, 6.3 | 1 day |
| 7: Scenario Management | 7.1, 7.2, 7.3, 7.4 | 2-3 days |
| 8: Trauma Integration | 8.1 | 0.5 day |
| 9: GPT Integration | 9.1, 9.2 | 1-2 days |
| 10: Polish | 10.1, 10.2, 10.3 | 1-2 days |

**Total Estimated: 16-22 days** (32 sprints)

**Phase 4 Note:** Sprint 4.3 now includes all advanced allocation logic from legacy (cascade, cross-domain tracking, seeds). Sprint 4.4 handles tax strategy reordering and Roth phase-outs. Sprint 4.5 handles IRS validation and shared limit tracking.

**⚠️ Implementation Order:** The employer match calculation (documented in Sprint 4.3) must be implemented before the waterfall allocation can run correctly. If implementing UI in Phase 5, ensure Sprint 5.4 (Employer Match UI) collects the match formula BEFORE testing Sprint 4.3's allocation engine with real data.

---

### Phase 0: Foundation

#### Sprint 0.1: Directory & Manifest
**Goal:** Create file structure and manifest

**Tasks:**
1. Create `tools/tool6/` directory
2. Create `tool6.manifest.json` (copy Tool 4 pattern, modify for Tool 6)

**Test:**
```bash
ls tools/tool6/
# Expected: tool6.manifest.json
```

**Deliverable:** Empty directory with manifest

---

#### Sprint 0.2: Skeleton Tool & Registration
**Goal:** Tool 6 appears in registry and renders placeholder

**Tasks:**
1. Create `Tool6.js` with minimal structure:
```javascript
const Tool6 = {
  manifest: null,

  render(params) {
    const clientId = params.clientId;
    return HtmlService.createHtmlOutput(`
      <html>
        <head><title>Tool 6: Retirement Blueprint</title></head>
        <body>
          <h1>Tool 6: Retirement Blueprint Calculator</h1>
          <p>Coming Soon - Client: ${clientId}</p>
        </body>
      </html>
    `).setTitle('TruPath - Retirement Blueprint');
  }
};
```

2. Add Tool 6 registration to `Code.js` (after Tool 5, line ~176):
```javascript
// Tool 6: Retirement Blueprint Calculator
const tool6Manifest = {
  id: "tool6",
  version: "1.0.0",
  name: "Retirement Blueprint Calculator",
  pattern: "calculator",
  route: "tool6",
  routes: ["/tool6"],
  description: "Interactive retirement vehicle allocation calculator",
  icon: "🏦",
  estimatedTime: "20-30 minutes",
  categories: ["retirement", "allocation"],
  outputs: {
    report: true,
    pdf: true,
    scenarios: true
  },
  dependencies: ["tool5"],
  unlocks: ["tool7"]
};

Tool6.manifest = tool6Manifest;
ToolRegistry.register('tool6', Tool6, tool6Manifest);
```

3. Update Tool 5's `unlocks` to include `tool6`
4. Update Tool 7's `dependencies` to include `tool6`

**Test:**
- Navigate to `?route=tool6` → see placeholder page
- Check console for registration success

**Deliverable:** Routable placeholder

---

#### Sprint 0.3: Basic Page Layout
**Goal:** Single-page layout with left/right panels (empty sections)

**Tasks:**
1. Update `Tool6.render()` to return two-column layout
2. Add collapsible section containers (empty)
3. Include shared styles
4. Add "Calculate My Blueprint" button (non-functional)

**Test:**
- Page loads with visible 40/60 split layout
- Sections show headers
- Collapse/expand works on sections

**Deliverable:** Static layout shell

---

### Phase 1: Data Layer

#### Sprint 1.1: Upstream Data Pull
**Goal:** Pull and display data from Tools 1-5

**Tasks:**
1. Create `Tool6.pullUpstreamData(clientId)`:
```javascript
pullUpstreamData(clientId) {
  const data = {
    tool1: DataService.getLatestResponse(clientId, 'tool1'),
    tool2: DataService.getLatestResponse(clientId, 'tool2'),
    tool3: DataService.getLatestResponse(clientId, 'tool3'),
    tool4: DataService.getLatestResponse(clientId, 'tool4'),
    tool5: DataService.getLatestResponse(clientId, 'tool5')
  };

  return {
    age: data.tool2?.age,
    income: data.tool2?.income,
    employmentType: data.tool2?.employmentType,
    // ... map all fields per spec
    hasAllData: !!(data.tool1 && data.tool2 && data.tool3 && data.tool4 && data.tool5)
  };
}
```

2. Create `Tool6.getDataStatus(clientId)` to check availability
3. Display status badges in UI

**Test:**
- Client with all Tool 1-5 data → all fields populated, green badges
- Client with partial data → some fields null, yellow badges
- New client → all null, red badges

**Deliverable:** Working data pull with status display

---

#### Sprint 1.2: Fallback/Backup Questions
**Goal:** Show backup questions when upstream data missing

**Tasks:**
1. Define backup question UI for each field that can be missing
2. Show backup questions only when data is missing
3. Merge backup answers with pulled data

**Test:**
- Client with all data → no backup questions visible
- Client missing Tool 2 → age/income backup questions appear
- After filling backup → data object includes backup values

**Deliverable:** Graceful degradation for missing data

---

#### Sprint 1.3: TOOL6_SCENARIOS Sheet
**Goal:** Sheet exists and can be written to

**Tasks:**
1. Add `TOOL6_SCENARIOS: 'TOOL6_SCENARIOS'` to `Config.js` SHEETS
2. Create `Tool6.initializeSheet()`:
```javascript
initializeSheet() {
  const ss = SpreadsheetCache.getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.TOOL6_SCENARIOS);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);
    sheet.appendRow([
      'Timestamp', 'Client_ID', 'Scenario_Name', 'Profile_ID',
      'Monthly_Budget', 'Domain_Weights', 'Allocations',
      'Investment_Score', 'Tax_Strategy', 'Projected_Balance',
      'Current_Balances', 'Is_Latest'
    ]);
  }
  return sheet;
}
```

3. Test write/read cycle

**Test:**
- Run `Tool6.initializeSheet()` → sheet created with headers
- Write test row → row appears
- Read test row → data matches

**Deliverable:** Storage layer ready

---

### Phase 2: Profile Classification

#### Sprint 2.1: Classification Input Gathering
**Goal:** Gather all inputs needed for classification

**Tasks:**
1. Create classification input structure
2. Add 7 core questions to pre-survey UI
3. Wire up form collection

**Test:**
- Fill pre-survey form
- Call `getClassificationInputs()` → returns complete object with all answers

**Deliverable:** Classification inputs ready

---

#### Sprint 2.2: Decision Tree Implementation
**Goal:** Implement the decision tree, return correct profile

**Tasks:**
1. Create `Tool6Profiles.js`
2. Implement `classifyProfile(inputs)`:
```javascript
function classifyProfile(inputs) {
  // Decision tree - first match wins
  if (inputs.usingROBS === 'Yes') {
    return { id: 1, name: 'ROBS-In-Use Strategist', ... };
  }

  if (inputs.robsInterest === 'Yes' || inputs.robsInterest === 'Interested') {
    const robsEligible = checkROBSEligibility(inputs);
    if (robsEligible.qualifies) {
      return { id: 2, name: 'ROBS-Curious Candidate', ... };
    }
  }

  // ... continue decision tree

  // Default
  return { id: 7, name: 'Foundation Builder', ... };
}
```

3. Add unit test function

**Test:**
```javascript
// Test cases
testClassification({ usingROBS: 'Yes' }) // → Profile 1
testClassification({ businessOwner: true, hasEmployees: true }) // → Profile 3
testClassification({ age: 55, feelsBehind: true }) // → Profile 6
testClassification({}) // → Profile 7 (default)
```

**Deliverable:** Working classification

---

#### Sprint 2.3: ROBS Qualification Flow
**Goal:** Conditional ROBS questions and qualification check

**Tasks:**
1. Show Q8-10 only when Q2 = Yes/Interested
2. Implement `checkROBSEligibility()` per spec
3. Route to Profile 7 if interested but doesn't qualify

**Test:**
- Q2 = No → Q8-10 hidden
- Q2 = Interested, all Yes → Profile 2
- Q2 = Interested, one No → Profile 7 with message "ROBS not available because..."

**Deliverable:** Complete ROBS logic

---

#### Sprint 2.4: Profile Display UI
**Goal:** Show classification result in right panel

**Tasks:**
1. Create profile display section in right panel
2. Show: icon, name, description, characteristics
3. Add "Why this profile?" explanation based on matching criteria

**Test:**
- After Calculate click → profile section shows correct profile
- Displays all required fields

**Deliverable:** Visual profile feedback

---

### Phase 3: Ambition Quotient ✅ COMPLETE

#### Sprint 3.1: Priority Ranking UI → Phase C Ambition UI ✅
**Goal:** ~~Drag-to-reorder priority ranking~~ → Rich psychological assessment

**Implementation (Jan 17, 2026):**
1. Created `AMBITION_QUESTIONS` in Tool6Constants.js (10 questions total)
2. Added 1-7 scale input type with clickable buttons
3. Adaptive visibility based on Phase B answers (hasChildren, hsaEligible)
4. Domain-based grouping with conditional rendering

**Questions per Domain:**
- Importance: "How important is saving for [domain]?"
- Anxiety: "How much anxiety do you feel about [domain]?"
- Motivation: "How motivated are you to take action?"

**Deliverable:** Phase C Ambition UI with adaptive question flow ✅

---

#### Sprint 3.2: Ambition Quotient Algorithm ✅
**Goal:** Calculate domain weights from inputs

**Implementation (Jan 17, 2026):**
1. Added `computeDomainsAndWeights()` to Tool6.js
2. Algorithm aligned with legacy code.js lines 3512-3551
3. Returns normalized weights that sum to 1

**Test Cases:**
```javascript
// Only retirement active (no kids, no HSA)
computeDomainsAndWeights({ a8_hasChildren: 'No', a7_hsaEligible: 'No' })
// → { Retirement: 1.0, Education: 0, Health: 0 }

// All 3 domains, high education importance, 5 years out
computeDomainsAndWeights({
  a8_hasChildren: 'Yes', a7_hsaEligible: 'Yes',
  a2_yearsToRetirement: 30, a10_yearsToEducation: 5,
  aq_retirement_importance: 5,
  aq_education_importance: 7,
  aq_health_importance: 4
})
// → Education weight highest due to importance + urgency
```

**Deliverable:** Working Ambition Quotient ✅

---

### Phase 4: Vehicle Allocation

#### Sprint 4.1: Vehicle Eligibility
**Goal:** Determine which vehicles are available to user

**Tasks:**
1. Create `getEligibleVehicles(profile, inputs)` in `Tool6Allocation.js`
2. Check each vehicle against eligibility criteria
3. Return list with monthly limits

**Test:**
- HSA eligible = No → HSA not in list
- Age 52 → limits include catch-up amounts
- Self-employed → Solo 401k in list, employer 401k not in list

**Deliverable:** Eligibility engine

---

#### Sprint 4.2: Vehicle Priority Order
**Goal:** Implement priority order per profile

**Tasks:**
1. Create `VEHICLE_PRIORITY_BY_PROFILE` constant per spec
2. Implement `getVehiclePriorityOrder(profileId, eligibleVehicles)`
3. Filter to only include eligible vehicles

**Test:**
- Profile 1 → ROBS near top
- Profile 8 → Roth vehicles before Traditional
- Ineligible vehicle → filtered out even if in priority list

**Deliverable:** Profile-specific ordering

---

#### Sprint 4.3: Waterfall Allocation (Core Implementation)
**Goal:** Implement full allocation engine including all advanced patterns from legacy

**Tasks:**
1. Implement `coreAllocate()` per "Advanced Allocation Logic" section
2. **Leftover Cascade:** Education → Health → Retirement (unused $ flows to next domain)
3. **Cross-Domain Vehicle Tracking:** Track cumulative allocations to prevent over-allocation (e.g., HSA in both Health and Retirement)
4. **Non-Discretionary Seeds:** Pre-fill employer match, ROBS distributions, mandatory plan contributions BEFORE waterfall
5. Apply domain weights from Ambition Quotient
6. Respect monthly limits with age-based catch-ups
7. Overflow to taxable brokerage (Family Bank)

**Key Functions to Implement:**
- `coreAllocate({ domains, pool, seeds, vehicleOrders })`
- `cascadeWaterfallWithTracking(order, pool, initial, cumulativeAllocations)`
- `getNonDiscretionarySeeds(profileId, userData)`
- `initializeVehicles(vehicleOrders, seeds)`

### Employer Match Seeding (Non-Discretionary)

**CRITICAL:** Employer match must be calculated and seeded BEFORE the waterfall allocation runs. The match:
- Does NOT come from user's monthly budget (it's "free money")
- DOES count toward total 401(k) limit ($70,000 employer + employee combined)
- Is displayed separately in UI as "Employer contributes: $X/month"

```javascript
/**
 * Calculate non-discretionary seeds that are pre-filled before waterfall
 * @param {number} profileId - User's profile ID
 * @param {Object} userData - User data from Tool 2/4 and pre-survey
 * @returns {Object} Seeds by domain { Retirement: {}, Education: {}, Health: {} }
 */
function getNonDiscretionarySeeds(profileId, userData) {
  const seeds = {
    Retirement: {},
    Education: {},
    Health: {}
  };

  // Employer match (for W-2 employees with employer 401k)
  if (userData.hasEmployerMatch && userData.grossIncome && userData.matchFormula) {
    const monthlyMatch = calculateEmployerMatch(userData.grossIncome, userData.matchFormula);
    if (monthlyMatch > 0) {
      seeds.Retirement['401(k) Employer Match'] = monthlyMatch;
    }
  }

  // ROBS distributions (Profile 1 only)
  if (profileId === 1 && userData.robsProfitDistribution) {
    seeds.Retirement['ROBS Distribution'] = userData.robsProfitDistribution / 12;
  }

  // Defined Benefit Plan minimums (Profile 3 - Business Owner with Employees)
  if (profileId === 3 && userData.dbPlanAnnual) {
    seeds.Retirement['Defined Benefit Plan'] = userData.dbPlanAnnual / 12;
  }

  return seeds;
}

/**
 * Calculate monthly employer match based on formula
 * @param {number} grossAnnualIncome - User's gross annual income
 * @param {string} matchFormula - e.g., "50% up to 6%"
 * @returns {number} Monthly match amount in dollars
 */
function calculateEmployerMatch(grossAnnualIncome, matchFormula) {
  // Parse formula: "50% up to 6%"
  const match = matchFormula.match(/(\d+)%\s*up to\s*(\d+)%/);
  if (!match) return 0;

  const matchRate = parseInt(match[1]) / 100;  // 0.50
  const matchLimit = parseInt(match[2]) / 100; // 0.06

  // Annual match = income * limit * rate
  const annualMatch = grossAnnualIncome * matchLimit * matchRate;

  // Monthly match
  return annualMatch / 12;
}

// Example: $100,000 income, "50% up to 6%"
// Match = $100,000 * 0.06 * 0.50 = $3,000/year = $250/month
```

### Integration with Waterfall

```javascript
function calculateAllocation(clientId, preSurveyData, profile, toolStatus) {
  // 1. Get non-discretionary seeds FIRST
  const userData = {
    grossIncome: toolStatus.tool2Data?.income,
    hasEmployerMatch: preSurveyData.hasEmployerMatch,
    matchFormula: preSurveyData.matchFormula,
    robsProfitDistribution: preSurveyData.robsProfitDistribution,
    dbPlanAnnual: preSurveyData.dbPlanAnnual
  };
  const seeds = getNonDiscretionarySeeds(profile.id, userData);

  // 2. Get user's discretionary budget (from Tool 4)
  const monthlyBudget = toolStatus.tool4Data?.multiply || 0;

  // 3. Run waterfall with seeds pre-filled
  const allocation = coreAllocate({
    domains: domainWeights,
    pool: monthlyBudget,  // User's budget only
    seeds: seeds,         // Pre-filled with employer match, etc.
    vehicleOrders: getVehicleOrders(profile.id)
  });

  // 4. Add employer match to display (it's in seeds but track separately)
  allocation.employerMatch = seeds.Retirement['401(k) Employer Match'] || 0;

  return allocation;
}
```

**Test:**
- $2000 budget, standard profile → splits across 3-5 vehicles
- High budget → some vehicles hit limits, overflow to taxable (Family Bank)
- Domain weights affect distribution
- **Leftover cascade:** Education domain maxed (no kids) → Health/Retirement get extra
- **Cross-domain tracking:** HSA allocated in Health → Retirement doesn't exceed remaining HSA cap
- **Non-discretionary seeds:** Employer match pre-filled before user discretionary allocation
- Age 55 user → HSA catch-up included ($1,000 extra annual)
- Age 62 user → 401(k) super catch-up included ($11,250 extra annual)

**Deliverable:** Complete allocation engine with all advanced patterns

---

#### Sprint 4.4: Tax Strategy Reordering & Roth Phase-Out
**Goal:** Implement tax strategy vehicle reordering and income-based Roth eligibility

**Tasks:**
1. Implement `prioritizeRothAccounts(vehicleOrder)` per "Tax Strategy Vehicle Reordering" section
2. Implement `prioritizeTraditionalAccounts(vehicleOrder)` per spec
3. Implement `applyRothIRAPhaseOut(vehicleOrder, { grossIncome, filingStatus })` per spec
4. Apply tax strategy based on user toggle (Now/Later/Both)
5. Handle Backdoor Roth IRA substitution for high earners

**Test:**
- Tax focus = "Later" → Roth vehicles moved before Traditional
- Tax focus = "Now" → Traditional vehicles moved before Roth (HSA stays high priority)
- Income $160k single → partial Roth IRA cap (phase-out)
- Income $170k single → Backdoor Roth IRA replaces direct Roth IRA
- Income $250k MFJ → Backdoor Roth IRA recommended

**Deliverable:** Tax-aware vehicle ordering

---

#### Sprint 4.5: IRS Limit Validation
**Goal:** Validate allocations against IRS limits with complete 2025 rules

**Tasks:**
1. Create `Tool6Validation.js`
2. Implement `validateAllocations(allocations, age, filingStatus)`
3. Implement `IRS_LIMITS_2025` constant per Appendix B
4. Apply SECURE 2.0 super catch-up logic (ages 60-63)
5. **Implement shared limit tracking** (see below)
6. Return warnings for exceeded limits

### Shared Limit Algorithm (401(k) Traditional + Roth)

**CRITICAL:** 401(k) Traditional and 401(k) Roth share the same employee contribution limit ($23,500 in 2025). The combined allocation to both cannot exceed this limit.

```javascript
/**
 * Get effective limit for a vehicle, accounting for shared limits
 * @param {string} vehicle - Vehicle name
 * @param {Object} currentAllocations - Current allocations by vehicle name
 * @param {number} age - User's age for catch-up calculations
 * @param {string} filingStatus - 'Single' or 'MFJ'
 * @returns {number} Monthly limit available for this vehicle
 */
function getEffectiveLimit(vehicle, currentAllocations, age, filingStatus) {
  const def = VEHICLE_DEFINITIONS[vehicle];
  const baseLimit = getVehicleCap(vehicle, age, filingStatus);

  // Check if this vehicle shares a limit with another
  if (def.sharesLimitWith) {
    const sharedVehicle = def.sharesLimitWith;
    const alreadyAllocatedToShared = currentAllocations[sharedVehicle] || 0;
    // Effective limit is base limit minus what's already in the shared vehicle
    return Math.max(0, baseLimit - alreadyAllocatedToShared);
  }

  return baseLimit;
}

// Shared limit pairs (from Tool6Constants.js):
// - '401(k) Roth' shares limit with '401(k) Traditional' ($23,500 combined)
// - 'IRA Roth' shares limit with 'IRA Traditional' ($7,000 combined)

// Example:
// User allocates $15,000/year to 401(k) Roth
// getEffectiveLimit('401(k) Traditional', {'401(k) Roth': 1250}, 45, 'Single')
// → Returns ($23,500 - $15,000) / 12 = $708.33/month
```

### Slider Coupling with Shared Limits

When adjusting a slider for a vehicle with a shared limit:

```javascript
function handleSharedLimitSlider(changedVehicle, newValue, allocations) {
  const def = VEHICLE_DEFINITIONS[changedVehicle];

  if (def.sharesLimitWith) {
    const sharedVehicle = def.sharesLimitWith;
    const combinedLimit = getVehicleCap(changedVehicle, age, filingStatus);
    const sharedValue = allocations[sharedVehicle] || 0;

    // Enforce combined limit
    if (newValue + sharedValue > combinedLimit) {
      // Option 1: Cap the changed vehicle
      newValue = combinedLimit - sharedValue;

      // Option 2: Reduce the shared vehicle (if user is increasing this one)
      // allocations[sharedVehicle] = combinedLimit - newValue;
    }
  }

  return newValue;
}
```

**Test:**
- Allocation within limits → no warnings
- $25k to 401k (over $23,500 limit) → warning returned
- Age 50 → standard catch-up limits applied
- Age 62 → super catch-up ($34,750 total 401k) applied
- HSA + age 55 → $5,300 individual limit applied
- **401(k) Roth at $15k → 401(k) Traditional capped at $8.5k**
- **IRA Roth at $5k → IRA Traditional capped at $2k**
- **Combined 401(k) slider shows remaining headroom**

**Deliverable:** Complete IRS limit validation with shared limit support

---

### Phase 5: Calculator UI

#### Sprint 5.1: Current State Inputs
**Goal:** Current balances and contributions section

> **v1.6 Note:** This sprint is largely complete from Sprint 1.2 questionnaire. The Current Balances (Q17-Q20) and Current Contributions (Q21-Q24) sections are already built with education fields included. This sprint focuses on the calculator UI integration.

**Tasks:**
1. Create current state section (collapsible, required)
2. Add balance inputs (401k, IRA, HSA, **education**)
3. Add monthly contribution inputs (401k, IRA, HSA, **education**)
4. Add validation (required fields, numeric)
5. **Education fields conditional on Q13=Yes** (visibility already handled in questionnaire)

**Test:**
- Q13=Yes → education balance/contribution fields visible
- Q13=No → education fields hidden, default to 0
- All visible fields required → validation error if blank
- Fill all → values accessible via `getCurrentState()`

**Deliverable:** Current state UI with education domain support

---

#### Sprint 5.2: Investment Score Display
**Goal:** Show and adjust investment score

**Tasks:**
1. Pull `investmentScore` from Tool 4 data
2. Create 1-7 selector with labels
3. Show return rate based on score
4. Allow user adjustment
5. Show impact warning when changed

**Test:**
- Tool 4 has score 5 → displays "Moderately Aggressive (12%)"
- User changes to 3 → updates to "Moderately Conservative (8%)"
- Warning shown about volatility

**Deliverable:** Investment score integration

---

#### Sprint 5.3: Tax Strategy Toggle
**Goal:** Three-way toggle for tax strategy

**Tasks:**
1. Create radio button group (Traditional / Balanced / Roth)
2. Auto-select based on income
3. Allow override
4. Update recommendation text based on income

**Test:**
- Income $40k → Roth-Heavy pre-selected
- Income $100k → Balanced pre-selected
- Income $200k → Traditional-Heavy pre-selected
- User can override

**Deliverable:** Tax strategy toggle

---

#### Sprint 5.4: Employer Match UI
**Goal:** Calculate and display employer match

**Tasks:**
1. Show Q5 (match formula) only if Q4 = Yes
2. Implement `calculateEmployerMatch()` per spec
3. Display: "Your employer will contribute: $X/month"
4. Show as non-discretionary in allocation

**Test:**
- Q4 = No → match formula hidden, match = $0
- Q4 = Yes, "50% up to 6%", $100k income → $250/mo displayed
- Match shown separately from user contribution

**Deliverable:** Employer match calculation

---

#### Sprint 5.5: Vehicle Sliders
**Goal:** Interactive sliders for each vehicle

**Tasks:**
1. Create slider component with $ amount and % display
2. Generate sliders only for eligible vehicles
3. Implement coupling algorithm
4. Show IRS limit indicators
5. Real-time update on slide

**Test:**
- Only eligible vehicles shown
- Increase 401k slider → others decrease proportionally
- Slider stops at IRS limit
- Total always equals budget

**Deliverable:** Interactive allocation sliders

---

#### Sprint 5.6: Calculate Button & Recalc
**Goal:** Wire up calculation flow

**Tasks:**
1. "Calculate My Blueprint" button triggers:
   - Pull upstream data
   - Run classification
   - Calculate Ambition Quotient
   - Run allocation
   - Update all UI sections
2. After initial calc, slider changes trigger `recalc()` immediately
3. Show loading state during initial calculation

**Test:**
- Click Calculate → loading shown → all sections populate
- Move slider → projections update in <100ms
- No flicker during updates

**Deliverable:** Full calculation flow

---

#### Sprint 5.7: Coupled Slider Behavior (Added v1.8)
**Goal:** Implement Tool 4-style coupled sliders with intelligent redistribution

> **v1.8 Note:** This sprint was added during implementation to specify the coupled slider behavior that makes Tool 6's allocation adjustment intelligent.

**Architecture:**

```javascript
var allocationState = {
  vehicles: {},           // Current allocation amounts by vehicle
  originalAllocation: {}, // Original algorithm output (for proportions)
  limits: {},             // Effective max limits (min of IRS and budget)
  irsLimits: {},          // True IRS limits per vehicle (static)
  locked: {},             // Which vehicles are locked
  budget: 0,              // Total monthly budget
  originalBudget: 0       // Original budget from Tool 4
};
```

**Tasks:**
1. Store original algorithm output separately from current values
2. When slider X moves, redistribute delta among OTHER vehicles using ORIGINAL proportions
3. Renormalize proportions to exclude the moved slider and locked vehicles
4. Add lock/unlock button for each vehicle
5. Add editable budget field that recalculates all limits
6. Add "Reset to Recommended" button
7. Store IRS limits in data attributes for budget recalculation

**Redistribution Algorithm:**
```javascript
function adjustVehicleAllocation(vehicleName, newValue) {
  // 1. Calculate delta
  var delta = newValue - allocationState.vehicles[vehicleId];

  // 2. Get ORIGINAL proportions for unlocked vehicles (excluding moved one)
  var proportions = getOriginalProportions(vehicleId);

  // 3. Distribute -delta among other vehicles by proportion
  for (var id in proportions) {
    if (!allocationState.locked[id]) {
      var share = delta * proportions[id];
      var newVal = allocationState.vehicles[id] - share;
      // Clamp to [0, effective limit]
      newVal = Math.max(0, Math.min(newVal, allocationState.limits[id]));
      allocationState.vehicles[id] = newVal;
    }
  }

  // 4. Update all displays
  updateAllVehicleDisplays();
  updateTotalAllocated();
}

function getOriginalProportions(excludeVehicleId) {
  // Sum original allocations for unlocked, non-excluded vehicles
  var totalOriginal = 0;
  for (var id in allocationState.originalAllocation) {
    if (id !== excludeVehicleId && !allocationState.locked[id]) {
      totalOriginal += allocationState.originalAllocation[id] || 0;
    }
  }

  // Calculate renormalized proportions
  var proportions = {};
  for (var id in allocationState.originalAllocation) {
    if (id !== excludeVehicleId && !allocationState.locked[id]) {
      proportions[id] = (allocationState.originalAllocation[id] || 0) / totalOriginal;
    }
  }
  return proportions;
}
```

**Test:**
- Algorithm recommends: 401k=$1000, IRA=$500, HSA=$300
- User moves 401k to $700 (delta=-300)
- IRA has proportion 500/800 = 62.5%, HSA has proportion 300/800 = 37.5%
- IRA gets +$187.50, HSA gets +$112.50
- Result: 401k=$700, IRA=$687.50, HSA=$412.50
- Total unchanged: $1800

**Test - Zero and Re-entry:**
- User sets IRA to $0 → redistribution occurs
- User moves IRA back to $200 → re-enters with original proportion
- IRA's original proportion preserved, not lost

**Test - Lock:**
- User locks HSA at $300
- User moves 401k from $1000 to $800 → HSA stays at $300
- Only IRA absorbs the delta ($500 → $700)

**Test - Budget Change:**
- Original budget $2000, slider max for IRA = $583 (IRS limit)
- User changes budget to $5000
- IRA slider max stays at $583 (IRS limit < budget)
- Family Bank slider max increases to $5000 (unlimited IRS limit)

**Deliverable:** Fully coupled slider system matching Tool 4 behavior

---

### Phase 6: Projections

#### Sprint 6.1: Projections Calculation
**Goal:** Calculate future balance projections for **both retirement and education domains**

> **v1.6 Note:** Education projections are now separate from retirement projections. Use `calculateEducationProjections()` for the education domain with its own inputs (Q14-15, Q20, Q24).

**Tasks:**
1. Create `Tool6Projections.js`
2. Implement `calculateProjections()` per spec (retirement domain)
3. **Implement `calculateEducationProjections()` per spec (education domain)**
4. Handle edge cases (0 years, 0 contribution, no children, etc.)

**Test - Retirement:**
- $50k current, $1k/mo, 20 years, 10% → ~$1.2M projected
- 0 years → projected = current
- 0 contribution → just growth on current

**Test - Education (v1.6):**
- Q13=No → education projections return 0
- Q13=Yes, $20k current, $300/mo, 10 years, 7% → ~$75k projected
- `numChildren=2` → perChildEstimate = projection / 2
- `yearsToEducation=99` → projection returns 0 (education disabled)

**Deliverable:** Projection engine for both domains

---

#### Sprint 6.2: Projections Display
**Goal:** Show projections in right panel for **both retirement and education**

> **v1.6 Note:** Education projections should be displayed separately when Q13=Yes.

**Tasks:**
1. Create projections section
2. Display retirement: projected balance, real balance, baseline, improvement
3. Display estimated monthly retirement income
4. **Display education projections (if hasChildren):**
   - Projected education balance at first child's college
   - Per-child estimate (informational)
   - Years until needed
5. Format as currency

**Test:**
- All retirement metrics displayed
- **If Q13=Yes: education metrics also displayed**
- **If Q13=No: education section hidden**
- Updates when sliders change
- Currency formatting correct

**Deliverable:** Projections UI with education domain

---

#### Sprint 6.3: Tax Breakdown Display
**Goal:** Show tax-free vs taxable split

**Tasks:**
1. Calculate Roth % from allocations
2. Apply to projected balance
3. Display as visual (simple bar or text)

**Test:**
- 60% in Roth vehicles → "60% tax-free ($X), 40% taxable ($Y)"
- Updates when allocation changes

**Deliverable:** Tax breakdown visualization

---

### Phase 7: Scenario Management

#### Sprint 7.1: Save Scenario
**Goal:** Save current state to sheet

> **v1.6 Note:** Schema expanded to 15 columns (A-O) to include education domain data. See "Scenario Management" section for full schema.

**Tasks:**
1. Implement `Tool6.saveScenario(clientId, scenarioName)`
2. Collect all current values including:
   - Current_Balances JSON (401k, ira, hsa, **education**)
   - Current_Contributions JSON (401k, ira, hsa, **education**)
   - **Education_Inputs JSON (numChildren, yearsToEducation)**
   - **Education_Projection (if applicable)**
3. Write to TOOL6_SCENARIOS sheet (15 columns)
4. Handle duplicate names (overwrite or version)

**Test:**
- Click Save → row appears in sheet
- All 15 columns populated correctly (A-O)
- **Q13=Yes: education fields populated with values**
- **Q13=No: education fields have defaults (0, 99)**
- Success message shown

**Deliverable:** Scenario persistence with education support

---

#### Sprint 7.2: Load Scenario
**Goal:** Load saved scenario and restore state

**Tasks:**
1. Implement `Tool6.getScenarios(clientId)`
2. Populate dropdown with user's scenarios
3. On selection, restore all inputs
4. Trigger recalculation

**Test:**
- User with 3 scenarios → dropdown shows 3 options
- Select scenario → all values restored
- Projections update

**Deliverable:** Scenario loading

---

#### Sprint 7.3: Compare Scenarios
**Goal:** Side-by-side comparison

**Tasks:**
1. Add two scenario dropdowns
2. Create comparison view (table)
3. Show key metrics side-by-side
4. Highlight differences

### Scenario Comparison Metrics

Display these metrics in the comparison table:

| Metric | Description | Format |
|--------|-------------|--------|
| **Scenario Name** | User-given name | Text |
| **Profile** | Investor profile classification | Profile name |
| **Monthly Contribution** | Total user contribution | Currency |
| **Employer Match** | Monthly employer match (if applicable) | Currency |
| **Tax Strategy** | Traditional-Heavy / Balanced / Roth-Heavy | Text |
| **Investment Score** | Risk tolerance (1-7) | Number with label |
| **Projected Balance** | Balance at retirement | Currency |
| **Real Balance** | Inflation-adjusted balance | Currency |
| **Tax-Free %** | Percentage in Roth/HSA vehicles | Percentage |
| **Est. Monthly Income** | Projected retirement income (4% rule) | Currency |

### Difference Highlighting

```javascript
function highlightDifference(valueA, valueB, type) {
  const diff = valueA - valueB;
  const pctDiff = valueB !== 0 ? (diff / valueB) * 100 : 0;

  // Highlight if difference > 5%
  if (Math.abs(pctDiff) > 5) {
    return {
      highlight: true,
      better: type === 'higher_is_better' ? (diff > 0 ? 'A' : 'B') : (diff < 0 ? 'A' : 'B'),
      diffText: diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
    };
  }
  return { highlight: false };
}

// Metrics where higher is better: Projected Balance, Tax-Free %, Est. Monthly Income
// Metrics where lower is better: (none currently)
// Neutral metrics: Profile, Tax Strategy, Investment Score
```

**Test:**
- Select two scenarios → table appears
- Shows all metrics from table above
- Differences > 5% highlighted with winner indicated
- Scenario with higher projected balance shown as "better" option

**Deliverable:** Scenario comparison with visual difference indicators

---

#### Sprint 7.4: PDF Generation
**Goal:** Generate PDF report

**Tasks:**
1. Create `Tool6Report.js`
2. Use `shared/PDFGenerator.js` pattern
3. Include: profile, allocations, projections, recommendations

**Test:**
- Click Generate PDF → download starts
- PDF contains all sections
- Branding correct

**Deliverable:** PDF export

---

### Phase 8: Trauma Integration

#### Sprint 8.1: Trauma Insights Display
**Goal:** Show trauma-informed messaging

**Tasks:**
1. Pull trauma pattern from Tool 1
2. Map pattern to insight messages per spec
3. Display in profile section

**Test:**
- Scarcity pattern → "Consider starting with employer match - it's guaranteed money"
- Avoidance pattern → "We've simplified your options to reduce overwhelm"

**Deliverable:** Trauma insights

---

### Phase 9: GPT Integration

#### Sprint 9.1: GPT Analysis
**Goal:** Generate personalized narratives

**Tasks:**
1. Create `Tool6GPTAnalysis.js`
2. Build prompt with user context
3. Call OpenAI API
4. Parse and display response

### GPT Prompt Template

```javascript
/**
 * Build GPT prompt for personalized retirement insights
 * @param {Object} userData - Compiled user data
 * @returns {string} Prompt for GPT API
 */
function buildTool6GPTPrompt(userData) {
  return `You are a retirement planning advisor providing personalized insights. Based on this client profile, provide 2-3 actionable insights about their retirement strategy.

## Client Profile
- **Investor Profile:** ${userData.profileName} (${userData.profileDescription})
- **Age:** ${userData.age}
- **Years to Retirement:** ${userData.yearsToRetirement}
- **Gross Annual Income:** $${userData.income?.toLocaleString() || 'Not provided'}
- **Monthly Retirement Savings:** $${userData.monthlyBudget?.toLocaleString() || 0}
- **Savings Rate:** ${userData.savingsRate}%
- **Investment Risk Score:** ${userData.investmentScore}/7 (${userData.investmentLabel})
- **Tax Strategy:** ${userData.taxStrategy}

## Current Allocation
${Object.entries(userData.allocations || {})
  .filter(([_, v]) => v > 0)
  .map(([vehicle, amount]) => `- ${vehicle}: $${amount.toLocaleString()}/month`)
  .join('\n')}

## Projections
- **Projected Balance at Retirement:** $${userData.projectedBalance?.toLocaleString() || 0}
- **Tax-Free Percentage:** ${userData.taxFreePercent}%
- **Estimated Monthly Retirement Income:** $${userData.monthlyRetirementIncome?.toLocaleString() || 0}

${userData.traumaPattern ? `## Behavioral Considerations\nClient shows "${userData.traumaPattern}" pattern - consider messaging that addresses this.` : ''}

## Instructions
1. Provide 2-3 specific, actionable insights (not generic advice)
2. Reference their specific numbers and situation
3. Consider their tax strategy and timeline
4. If they have employer match, mention maximizing it
5. Keep response under 200 words
6. Use encouraging but realistic tone
7. Format as bullet points

Do NOT include:
- Disclaimers about seeking professional advice
- Generic retirement tips
- Specific stock or fund recommendations`;
}

/**
 * Parse GPT response into structured insights
 * @param {string} response - Raw GPT response
 * @returns {Array<string>} Array of insight strings
 */
function parseGPTResponse(response) {
  // Split by bullet points or numbered items
  const lines = response.split(/[\n•\-\d\.]+/).filter(line => line.trim().length > 10);
  return lines.slice(0, 3).map(line => line.trim());
}
```

### API Call Pattern

```javascript
function callGPTForInsights(userData) {
  const prompt = buildTool6GPTPrompt(userData);

  try {
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getOpenAIKey(),
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());
    if (json.choices && json.choices[0]) {
      return {
        success: true,
        insights: parseGPTResponse(json.choices[0].message.content)
      };
    }
    throw new Error('Invalid GPT response format');
  } catch (error) {
    Logger.log('GPT API error: ' + error);
    return { success: false, error: error.message };
  }
}
```

**Test:**
- Click "Get Personalized Insights" → GPT response appears
- Response references user's specific numbers (age, income, vehicles)
- Response is relevant to user's profile/situation
- Response is under 200 words
- Bullet points display correctly

**Deliverable:** GPT integration with structured prompts

---

#### Sprint 9.2: Fallbacks
**Goal:** Handle GPT failures gracefully

**Tasks:**
1. Create `Tool6Fallbacks.js`
2. Define fallback content per profile
3. Implement retry → fallback → generic flow

**Test:**
- Simulate API timeout → fallback content appears
- No error shown to user
- Fallback is still relevant to profile

**Deliverable:** Reliable content delivery

---

### Phase 10: Polish

#### Sprint 10.1: Error Handling
**Goal:** Graceful error handling throughout

**Tasks:**
1. Add try/catch to all server functions
2. Create user-friendly error messages
3. Add error logging

**Test:**
- Simulate sheet error → friendly message shown
- Error logged for debugging

**Deliverable:** Robust error handling

---

#### Sprint 10.2: Edge Cases
**Goal:** Handle all edge cases per spec

**Tasks:**
1. Test and handle: $0 income, missing age, 0 years to retirement
2. Test and handle: no eligible vehicles, budget exceeds limits
3. Add appropriate warnings/messages

**Test:**
- Run through all edge cases in spec
- Each handled gracefully

**Deliverable:** Edge case coverage

---

#### Sprint 10.3: Performance & Polish
**Goal:** Fast, smooth experience

**Tasks:**
1. Optimize data pulls (parallel where possible)
2. Add loading indicators
3. Test slider performance
4. UI polish pass

**Test:**
- Page loads in <3s
- Sliders respond in <100ms
- No visual glitches

**Deliverable:** Production-ready tool

---

## Acceptance Criteria

### Minimum Viable Product (Phases 0-7)

- [ ] Single-page calculator loads correctly
- [ ] Pulls data from Tools 1-5 successfully
- [ ] Shows backup questions when data missing
- [ ] Classifies user into correct profile
- [ ] ROBS qualification flow works correctly
- [ ] Ambition Quotient calculates correctly
- [ ] Vehicle allocation respects IRS limits
- [ ] Sliders update in real-time with coupling
- [ ] Projections display accurately
- [ ] Tax breakdown shows correctly
- [ ] Scenarios save and load correctly
- [ ] Scenario comparison works
- [ ] Current balances/contributions are required and used
- [ ] Employer match calculates correctly
- [ ] Investment score is displayed and adjustable
- [ ] Tax strategy toggle works
- [ ] PDF report generates

### Full Feature (Phases 8-10)

- [ ] Trauma insights display based on Tool 1 pattern
- [ ] GPT narratives generate
- [ ] Fallbacks work when GPT fails
- [ ] All edge cases handled gracefully
- [ ] Performance acceptable (<3s load, <100ms slider response)

---

## Test Data

### Test Client IDs

| Client ID | Has Tools | Profile Expected | Notes |
|-----------|-----------|------------------|-------|
| TEST001 | 1,2,3,4,5 | Foundation Builder | Standard case |
| TEST002 | 1,2,3,4,5 | High Earner | Income $200k |
| TEST003 | 1,2,3,4,5 | Catch-Up | Age 55, feels behind |
| TEST004 | 2,4 only | Should use backups | Partial data |
| TEST005 | None | Should block at Tool 4 | New user |

---

## Appendix A: Legacy Profile Mapping

| Legacy Profile ID | Legacy Name | v3 Profile ID | v3 Name |
|-------------------|-------------|---------------|---------|
| 1_ROBS_In_Use | ROBS-In-Use Strategist | 1 | ROBS-In-Use Strategist |
| 2_ROBS_Curious | ROBS-Curious Candidate | 2 | ROBS-Curious Candidate |
| 3_Solo401k_Builder | Solo 401(k) Builder | 4 | Solo 401(k) Optimizer |
| 4_Roth_Reclaimer | Roth Reclaimer | 8 | Roth Maximizer |
| 5_Bracket_Strategist | Bracket Strategist | 5 | Bracket Strategist |
| 6_Catch_Up | Catch-Up Contributor | 6 | Catch-Up Contributor |
| 7_Foundation_Builder | Foundation Builder | 7 | Foundation Builder (default) |
| 8_Biz_Owner_Group | Business Owner w/ Employees | 3 | Business Owner w/ Employees |
| 9_Late_Stage_Growth | Late-Stage Growth | 9 | Late-Stage Growth |

**Note:** v3 Profile IDs are renumbered for clarity:
- Profile 5 = Bracket Strategist (was legacy 5_Bracket_Strategist)
- Profile 7 = Foundation Builder (default profile, was legacy 7_Foundation_Builder)
- These are distinct profiles with different vehicle priorities

### Known Legacy Bug: Profile 8 Classification (FIXED in v3)

**Bug Location:** `code.js` lines 3138-3139

**Problem:** Legacy code classifies Profile 8 (Business Owner with Employees) based ONLY on `hasEmployees === 'Yes'` without verifying the person is actually a business owner.

```javascript
// LEGACY BUG - line 3138
} else if (hasEmployees === 'Yes') {
  profile = '8_Biz_Owner_Group';  // Missing business owner check!
```

**Impact:** A W-2 employee who answers "Yes" to having employees (e.g., they're a manager) would incorrectly be classified as a Business Owner profile.

**v3 Fix:** Our decision tree correctly requires BOTH conditions:
```javascript
// v3 CORRECT - requires business owner AND employees
if ((businessOwner || isSelfEmployed) && hasEmployees === 'Yes') {
  return Profile 3: Business Owner with Employees;
}
```

**Note:** The legacy code collects `ownsBiz` but never uses it in classification - only in tag generation. v3 uses it properly.

---

## Appendix B: IRS Limits (2025)

**Note:** Legacy code uses 2025 limits. Verify these are current before production release.

| Vehicle | Under 50 | Age 50-59 | Age 60-63 | Notes |
|---------|----------|-----------|-----------|-------|
| 401(k) Employee | $23,500 | $31,000 | $34,750 | SECURE 2.0 super catch-up |
| 401(k) Total (incl employer) | $70,000 | $77,500 | $81,250 | Employee + employer |
| IRA | $7,000 | $8,000 | $8,000 | Combined Traditional + Roth |
| HSA Individual | $4,300 | $5,300 | $5,300 | +$1,000 catch-up at 55+ |
| HSA Family | $8,550 | $9,550 | $9,550 | +$1,000 catch-up at 55+ |
| Solo 401(k) | $70,000 | $77,500 | $81,250 | Employee + employer |
| SEP-IRA | $70,000 | $70,000 | $70,000 | 25% of compensation cap |
| Defined Benefit | $280,000 | $280,000 | $280,000 | Annual benefit limit |

### Roth IRA Income Phase-Out Limits (2025)

| Filing Status | Phase-Out Start | Phase-Out End | Backdoor Required |
|---------------|-----------------|---------------|-------------------|
| Single | $150,000 | $165,000 | Above $165k |
| Married Filing Jointly | $236,000 | $246,000 | Above $246k |
| Married Filing Separately | $0 | $10,000 | Above $10k |

### IRS Limits as Code Constants

```javascript
const IRS_LIMITS_2025 = {
  EMPLOYEE_401K: 23500,
  CATCHUP_401K_50: 7500,
  CATCHUP_401K_60: 11250,  // SECURE 2.0 super catch-up for 60-63
  TOTAL_401K: 70000,
  TOTAL_401K_50: 77500,
  TOTAL_401K_60: 81250,

  TRADITIONAL_IRA: 7000,
  ROTH_IRA: 7000,
  CATCHUP_IRA: 1000,

  HSA_INDIVIDUAL: 4300,
  HSA_FAMILY: 8550,
  HSA_CATCHUP: 1000,  // Available at 55+

  DEFINED_BENEFIT: 280000,
  SEP_IRA_MAX: 70000,
  SEP_IRA_PCT: 0.25,

  ROTH_PHASE_OUT: {
    SINGLE: { start: 150000, end: 165000 },
    MFJ: { start: 236000, end: 246000 },
    MFS: { start: 0, end: 10000 }
  }
};
```

---

## Appendix C: Employer Match Examples

| Formula | $75k Income | $100k Income | $150k Income |
|---------|-------------|--------------|--------------|
| 100% up to 3% | $2,250/yr ($188/mo) | $3,000/yr ($250/mo) | $4,500/yr ($375/mo) |
| 100% up to 6% | $4,500/yr ($375/mo) | $6,000/yr ($500/mo) | $9,000/yr ($750/mo) |
| 50% up to 6% | $2,250/yr ($188/mo) | $3,000/yr ($250/mo) | $4,500/yr ($375/mo) |
| 50% up to 4% | $1,500/yr ($125/mo) | $2,000/yr ($167/mo) | $3,000/yr ($250/mo) |

---

## Appendix D: Family Bank / Overflow Concept

The legacy system has a "Family Bank" concept for funds that overflow after all tax-advantaged vehicles are filled.

### What is Family Bank?

- **Definition:** Taxable brokerage account that holds overflow contributions
- **Growth Rate:** Uses conservative 5% (vs personalized rate for retirement vehicles)
- **Timeline:** Uses retirement timeline for FV calculations
- **Purpose:** Ensures all savings are allocated, even when vehicle limits are reached

### When Family Bank is Used

```javascript
// After allocation waterfall completes
const familyBankAmount = totalBudget - sumOfAllVehicleAllocations;

if (familyBankAmount > 0) {
  allocations['Family Bank'] = familyBankAmount;
}
```

### FV Calculation for Family Bank

```javascript
// Family Bank uses conservative growth
const familyBankFV = futureValue(
  familyBankAllocation,
  0.05,  // 5% annual return (conservative)
  yearsToRetirement
);
```

### Display in UI

Family Bank should be displayed as:
- "Taxable Investments" or "Overflow Savings"
- Show separate from tax-advantaged accounts
- Note that it lacks tax benefits but provides flexibility

---

## Appendix E: Narrative Templates (for GPT/Fallbacks)

The legacy Document_Narratives.js contains personalized narrative generation. Key patterns:

### Age-Based Opening

```javascript
if (age < 35) {
  "At ${age}, you're at an ideal stage to build a powerful financial foundation."
} else if (age < 50) {
  "At ${age}, you're in your peak earning years with significant opportunities."
} else if (age < 60) {
  "At ${age}, you've entered a critical phase where strategic decisions matter most."
} else {
  "At ${age}, you're approaching or in retirement with important optimization opportunities."
}
```

### Work Situation Context

```javascript
if (workSituation === 'Self-employed') {
  "As a self-employed professional, you have unique control over your retirement strategy."
} else if (workSituation === 'W-2 employee') {
  "As an employee, you have access to valuable workplace benefits that we'll help you maximize."
} else if (workSituation === 'Both') {
  "With both employment and self-employment income, you have exceptional diversification opportunities."
}
```

### Investment Confidence Messaging

```javascript
if (confidenceLevel >= 6) {
  "Your high investment confidence (${level}/7) indicates you're ready for sophisticated strategies."
} else if (confidenceLevel >= 4) {
  "Your moderate investment confidence (${level}/7) suggests a balanced approach with room for growth."
} else {
  "We'll help build your investment confidence through education and gradual implementation."
}
```

### Savings Rate Assessment

```javascript
if (savingsRate >= 15) {
  "This puts you well ahead of most Americans, but there's still room to optimize."
} else if (savingsRate >= 10) {
  "While this is a solid foundation, increasing even modestly can have dramatic impacts."
} else {
  "There's significant opportunity to accelerate your wealth building."
}
```

### Profile-Specific Narratives

Each profile has specific narrative elements. Example for ROBS:

```javascript
// Profile 1: ROBS-In-Use
"Your ROBS strategy places you among the most sophisticated retirement planners. "
"By using your retirement funds to finance your business, you've created a unique "
"structure that can generate tax-deferred growth through business profits. "
"Our focus will be on maximizing your Solo 401(k) contributions while ensuring "
"your business remains compliant with ROBS regulations."
```

### HSA Triple Tax Advantage

```javascript
if (hsaEligible) {
  "Your HSA eligibility is a hidden gem in your retirement strategy. "
  "This 'triple tax advantage' vehicle can serve as a powerful supplemental "
  "retirement account, growing tax-free for decades."
}
```

---

## Appendix F: Legacy Code Reference

For implementation reference, the legacy files contain:

| File | Size | Key Contents |
|------|------|--------------|
| `code.js` | 170KB | Core allocation engine, profile helpers, FV calculations |
| `Current_Forms_Full.js` | 139KB | Phase 2 form definitions (not needed for v3) |
| `Document_Narratives.js` | 34KB | Personalized narrative generation |
| `Reprocess_Allocations.js` | 24KB | Batch reprocessing utilities |
| `Form_Management.js` | 24KB | Form handling (not needed for v3) |
| `Generate_Document_Safe.js` | 22KB | PDF/Doc generation patterns |

### Key Functions to Reference

| Function | Line | Purpose |
|----------|------|---------|
| `computeDomainsAndWeights` | 3512 | Ambition Quotient algorithm |
| `cascadeWaterfallWithTracking` | 2875 | Core allocation waterfall |
| `coreAllocate` | 2780 | Domain-based allocation orchestrator |
| `calculatePersonalizedRate` | 3650 | Investment score → return rate |
| `futureValue` | 3673 | FV calculation with safeguards |
| `calculateEmployerMatch` | 3625 | Employer match parsing/calculation |
| `applyRothIRAPhaseOut` | 812 | Roth eligibility handling |
| `addEmployer401kVehicles` | 852 | Dynamic vehicle insertion |
| `prioritizeTraditionalAccounts` | 914 | Tax strategy reordering |
| `prioritizeRothAccounts` | 934 | Tax strategy reordering |
| `profileHelpers` | 978-2284 | Per-profile vehicle orders and seeds |

### What NOT to Port

1. **Form handling** - v3 uses single-page calculator
2. **Sheet column mapping** - v3 uses DataService
3. **Email generation** - v3 uses different notification system
4. **Phase 1/2 flow** - v3 is single-page
5. **profileHelpers functions** - Complex, potential bugs; rebuild from spec

---

## Appendix G: Tool 4 Reference Patterns

Tool 6 follows the same single-page calculator architecture as Tool 4. These code patterns from `tools/tool4/Tool4.js` should be used as templates.

### 1. Tool Registration Pattern

**Location:** `Code.js` (add after Tool 5 registration)

```javascript
// Tool 6: Retirement Blueprint Calculator
const tool6Manifest = {
  id: "tool6",
  version: "1.0.0",
  name: "Retirement Blueprint Calculator",
  pattern: "calculator",
  route: "tool6",
  routes: ["/tool6"],
  description: "Interactive retirement vehicle allocation calculator",
  icon: "🏦",
  estimatedTime: "20-30 minutes",
  categories: ["retirement", "allocation"],
  outputs: {
    report: true,
    pdf: true,
    scenarios: true
  },
  dependencies: ["tool5"],
  unlocks: ["tool7"]
};

Tool6.manifest = tool6Manifest;
ToolRegistry.register('tool6', Tool6, tool6Manifest);
```

### 2. Cross-Tool Data Pull Pattern

**Location:** Tool4.js lines 67-91

```javascript
checkToolCompletion(clientId) {
  try {
    const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
    const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
    const tool3Data = DataService.getLatestResponse(clientId, 'tool3');
    const tool4Data = DataService.getLatestResponse(clientId, 'tool4');
    const tool5Data = DataService.getLatestResponse(clientId, 'tool5');

    return {
      hasTool1: !!tool1Data,
      hasTool2: !!tool2Data,
      hasTool3: !!tool3Data,
      hasTool4: !!tool4Data,
      hasTool5: !!tool5Data,
      tool1Data,
      tool2Data,
      tool3Data,
      tool4Data,
      tool5Data,
      missingCount: [tool1Data, tool2Data, tool3Data, tool4Data, tool5Data].filter(d => !d).length
    };
  } catch (error) {
    Logger.log(`Error checking tool completion: ${error}`);
    return { hasTool1: false, hasTool2: false, hasTool3: false, hasTool4: false, hasTool5: false, missingCount: 5 };
  }
}
```

### 3. Pre-Survey Save/Load Pattern

**Location:** Tool4.js lines 114-156

```javascript
savePreSurvey(clientId, preSurveyData) {
  try {
    const preSurveyKey = `tool6_presurvey_${clientId}`;
    PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));
    Logger.log(`Pre-survey saved for client: ${clientId}`);

    // Recalculate and return updated page
    const toolStatus = this.checkToolCompletion(clientId);
    const allocation = this.calculateAllocation(clientId, preSurveyData);
    const htmlContent = this.buildUnifiedPage(clientId, toolStatus, preSurveyData, allocation);

    return { success: true, nextPageHtml: htmlContent };
  } catch (error) {
    Logger.log(`Error saving pre-survey: ${error}`);
    return { success: false, error: error.message };
  }
}

getPreSurvey(clientId) {
  try {
    const preSurveyKey = `tool6_presurvey_${clientId}`;
    const preSurveyData = PropertiesService.getUserProperties().getProperty(preSurveyKey);
    return preSurveyData ? JSON.parse(preSurveyData) : null;
  } catch (error) {
    Logger.log(`Error getting pre-survey: ${error}`);
    return null;
  }
}
```

### 4. Scenario Save Pattern

**Location:** Tool4.js lines 203-402

```javascript
saveScenario(clientId, scenario) {
  try {
    // Validate scenario data
    if (!scenario || !scenario.name || !scenario.allocations) {
      throw new Error('Invalid scenario data');
    }

    // Get or create scenarios sheet
    let scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);

    if (!scenariosSheet) {
      const ss = SpreadsheetCache.getSpreadsheet();
      scenariosSheet = ss.insertSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);
      scenariosSheet.appendRow([
        'Timestamp', 'Client_ID', 'Scenario_Name', 'Profile_ID',
        'Monthly_Budget', 'Domain_Weights', 'Allocations',
        'Investment_Score', 'Tax_Strategy', 'Projected_Balance',
        'Current_Balances', 'Is_Latest'
      ]);
      SpreadsheetApp.flush();
    }

    // Build row data
    const row = [
      new Date(),
      clientId,
      scenario.name,
      scenario.profileId,
      scenario.monthlyBudget,
      JSON.stringify(scenario.domainWeights),
      JSON.stringify(scenario.allocations),
      scenario.investmentScore,
      scenario.taxStrategy,
      scenario.projectedBalance,
      JSON.stringify(scenario.currentBalances),
      true  // Is_Latest
    ];

    scenariosSheet.appendRow(row);
    SpreadsheetApp.flush();

    // Mark Tool6 as completed on first scenario
    const existingScenarios = this.getScenarios(clientId);
    if (existingScenarios.length === 0) {
      DataService.saveToolResponse(clientId, 'tool6', scenario, 'COMPLETED');
    }

    return { success: true, message: 'Scenario saved successfully' };
  } catch (error) {
    Logger.log(`Error saving scenario: ${error}`);
    return { success: false, error: error.message };
  }
}
```

### 5. Collapsible Section HTML Pattern

**Location:** Tool4.js lines 784-802, 1509-1537

```html
<style>
  .section-toggle.collapsed {
    transform: rotate(-90deg);
  }

  .section-body {
    max-height: none;
    opacity: 1;
    transition: opacity 0.3s ease;
    padding: 30px;
  }

  .section-body.collapsed {
    max-height: 0;
    opacity: 0;
    padding: 0 30px;
    overflow: hidden;
  }

  .section-summary {
    padding: 15px 30px;
    display: none;
  }

  .section-summary.show {
    display: block;
  }
</style>

<!-- Section Header -->
<div class="section-header" onclick="toggleSection('presurvey')">
  <div class="section-title">📝 Your Financial Profile</div>
  <div style="display: flex; align-items: center; gap: 15px;">
    <span style="font-size: 12px; color: var(--color-text-muted);">(Click to expand/collapse)</span>
    <div class="section-toggle ${hasData ? 'collapsed' : ''}" id="presurveyToggle">▼</div>
  </div>
</div>

<!-- Summary (shown when collapsed) -->
<div class="section-summary ${hasData ? 'show' : ''}" id="presurveySum">
  <strong>Monthly Budget:</strong> $${budget}
</div>

<!-- Body (hidden when collapsed) -->
<div class="section-body ${hasData ? 'collapsed' : ''}" id="presurveyBody">
  <!-- Form content here -->
</div>

<script>
function toggleSection(sectionId) {
  var body = document.getElementById(sectionId + 'Body');
  var toggle = document.getElementById(sectionId + 'Toggle');
  var summary = document.getElementById(sectionId + 'Sum');

  body.classList.toggle('collapsed');
  toggle.classList.toggle('collapsed');
  if (summary) summary.classList.toggle('show');
}
</script>
```

### 6. Slider Coupling Algorithm (Client-Side JS)

**Location:** Tool4.js lines 2555-2594

```javascript
// Calculator state - adapt for Tool 6 vehicles
var calculatorState = {
  vehicles: {
    '401k_traditional': 0,
    '401k_roth': 0,
    'ira_roth': 0,
    'hsa': 0,
    'taxable': 0
  },
  limits: {
    '401k_traditional': 1958.33,  // $23,500/12
    '401k_roth': 1958.33,
    'ira_roth': 583.33,           // $7,000/12
    'hsa': 358.33,                // $4,300/12
    'taxable': Infinity
  },
  locked: {},
  monthlyBudget: 0
};

function adjustVehicle(vehicleName, newValue) {
  newValue = parseFloat(newValue);
  var oldValue = calculatorState.vehicles[vehicleName];
  var delta = newValue - oldValue;

  // Enforce IRS limit
  var limit = calculatorState.limits[vehicleName] || Infinity;
  newValue = Math.min(newValue, limit);
  delta = newValue - oldValue;

  // Update the adjusted vehicle
  calculatorState.vehicles[vehicleName] = newValue;

  // Find unlocked vehicles (excluding the one being adjusted)
  var unlockedVehicles = [];
  var unlockedTotal = 0;

  for (var key in calculatorState.vehicles) {
    if (key !== vehicleName && !calculatorState.locked[key]) {
      unlockedVehicles.push(key);
      unlockedTotal += calculatorState.vehicles[key];
    }
  }

  // Redistribute proportionally to other unlocked vehicles
  if (unlockedVehicles.length > 0 && unlockedTotal > 0) {
    unlockedVehicles.forEach(function(key) {
      var proportion = calculatorState.vehicles[key] / unlockedTotal;
      var adjustment = delta * proportion;
      var newVal = Math.max(0, calculatorState.vehicles[key] - adjustment);
      // Also enforce limit on redistributed amounts
      var vehicleLimit = calculatorState.limits[key] || Infinity;
      calculatorState.vehicles[key] = Math.min(newVal, vehicleLimit);
    });
  }

  // Normalize to ensure total equals budget
  normalizeAllocations();

  // Update UI
  updateAllVehicleDisplays();

  // Recalculate projections
  recalculateProjections();
}

function normalizeAllocations() {
  var total = 0;
  for (var key in calculatorState.vehicles) {
    total += calculatorState.vehicles[key];
  }

  // If total exceeds budget, scale down proportionally
  if (total > calculatorState.monthlyBudget) {
    var scale = calculatorState.monthlyBudget / total;
    for (var key in calculatorState.vehicles) {
      calculatorState.vehicles[key] = Math.round(calculatorState.vehicles[key] * scale);
    }
  }
}
```

### 7. Real-Time Display Update Pattern

**Location:** Tool4.js lines 2639-2673

```javascript
function updateAllVehicleDisplays() {
  Object.keys(calculatorState.vehicles).forEach(function(vehicleName) {
    var value = calculatorState.vehicles[vehicleName];
    var displayId = vehicleName.replace(/_/g, '') + 'Value';
    var sliderId = vehicleName.replace(/_/g, '') + 'Slider';
    var fillId = vehicleName.replace(/_/g, '') + 'Fill';

    // Update text display
    var display = document.getElementById(displayId);
    if (display) display.textContent = '$' + value.toLocaleString();

    // Update slider position
    var slider = document.getElementById(sliderId);
    if (slider) slider.value = value;

    // Update visual fill bar (percentage of budget)
    var fill = document.getElementById(fillId);
    if (fill && calculatorState.monthlyBudget > 0) {
      var pct = (value / calculatorState.monthlyBudget) * 100;
      fill.style.width = pct + '%';
    }

    // Show limit warning if at or near cap
    var limit = calculatorState.limits[vehicleName];
    var warningId = vehicleName.replace(/_/g, '') + 'Warning';
    var warning = document.getElementById(warningId);
    if (warning) {
      if (value >= limit * 0.95) {
        warning.style.display = 'block';
        warning.textContent = 'At IRS limit';
      } else {
        warning.style.display = 'none';
      }
    }
  });

  // Update total display
  var total = 0;
  for (var key in calculatorState.vehicles) {
    total += calculatorState.vehicles[key];
  }
  var totalElem = document.getElementById('totalAllocation');
  if (totalElem) {
    totalElem.textContent = '$' + total.toLocaleString();
  }
}
```

### 8. Server Communication Pattern (GAS Navigation)

**Reference:** `docs/Navigation/GAS-NAVIGATION-RULES.md`

```javascript
// Submit form and get updated page
function submitPreSurvey() {
  var formData = collectFormData();

  google.script.run
    .withSuccessHandler(function(result) {
      if (result && result.nextPageHtml) {
        document.open();
        document.write(result.nextPageHtml);
        document.close();
        window.scrollTo(0, 0);
      } else if (result && result.error) {
        showError(result.error);
      }
    })
    .withFailureHandler(function(error) {
      showError('Server error: ' + error.message);
    })
    .Tool6.savePreSurvey(clientId, formData);
}

// Save scenario (no page reload)
function saveScenario() {
  var scenario = buildScenarioData();

  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success) {
        showToast('Scenario saved: ' + scenario.name);
        refreshScenarioList();
      } else {
        showError(result.error);
      }
    })
    .withFailureHandler(function(error) {
      showError('Save failed: ' + error.message);
    })
    .Tool6.saveScenario(clientId, scenario);
}
```

### 9. Form Value Collection Pattern

**Location:** Tool4.js (various)

```javascript
function collectFormData() {
  return {
    // Currency inputs - parse and validate
    monthlyBudget: parseCurrency(document.getElementById('monthlyBudget').value),
    currentBalances: {
      // Retirement vehicles (total calculated from these)
      '401k': parseCurrency(document.getElementById('q17_current401kBalance').value),
      ira: parseCurrency(document.getElementById('q18_currentIRABalance').value),
      hsa: parseCurrency(document.getElementById('q19_currentHSABalance').value),
      // Education (combined across all children - "Combined CESA" approach)
      education: parseCurrency(document.getElementById('q20_currentEducationBalance').value)
    },
    currentContributions: {
      '401k': parseCurrency(document.getElementById('q21_monthly401kContribution').value),
      ira: parseCurrency(document.getElementById('q22_monthlyIRAContribution').value),
      hsa: parseCurrency(document.getElementById('q23_monthlyHSAContribution').value),
      education: parseCurrency(document.getElementById('q24_monthlyEducationContribution').value)
    },

    // Select inputs
    employerMatch: document.getElementById('q7_matchFormula').value,
    taxStrategy: document.querySelector('input[name="taxStrategy"]:checked')?.value,

    // Yes/No inputs
    hasEmployees: document.getElementById('q3_hasW2Employees').value === 'Yes',
    hsaEligible: document.getElementById('q9_hsaEligible').value === 'Yes',
    hasChildren: document.getElementById('q13_hasChildren').value === 'Yes',

    // Ranking inputs (drag-and-drop order)
    priorityRanking: getPriorityRanking(),

    // Numeric inputs
    numChildren: parseInt(document.getElementById('q14_numChildren').value) || 0,
    yearsToEducation: parseInt(document.getElementById('q15_yearsToEducation').value) || 99
  };
}

function parseCurrency(value) {
  if (!value) return 0;
  // Remove $ and commas, parse as float
  return parseFloat(value.replace(/[$,]/g, '')) || 0;
}

function getPriorityRanking() {
  var items = document.querySelectorAll('.priority-item');
  var ranking = {};
  items.forEach(function(item, index) {
    ranking[item.dataset.domain] = index + 1;
  });
  return ranking;
}
```

### 10. PDF Generation Integration

**Location:** Uses `shared/PDFGenerator.js`

```javascript
generatePDF(clientId, scenario) {
  try {
    // Build PDF content sections
    const sections = [
      this.buildProfileSection(scenario),
      this.buildAllocationSection(scenario),
      this.buildProjectionsSection(scenario),
      this.buildRecommendationsSection(scenario)
    ];

    // Use shared PDF generator
    const pdfBlob = PDFGenerator.generate({
      title: 'Retirement Blueprint Report',
      clientId: clientId,
      date: new Date(),
      sections: sections,
      branding: true
    });

    return {
      success: true,
      blob: pdfBlob,
      filename: `RetirementBlueprint_${clientId}_${Date.now()}.pdf`
    };
  } catch (error) {
    Logger.log(`PDF generation error: ${error}`);
    return { success: false, error: error.message };
  }
}
```

---

*End of Specification*
