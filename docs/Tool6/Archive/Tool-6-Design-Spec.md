# Tool 6: Retirement Account Allocation Calculator

## Design Specification Document

**Version:** 1.0.0
**Created:** December 31, 2025
**Status:** Draft - Pending Approval
**Author:** Claude (AI Assistant) with Larry (Product Owner)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tool Purpose & Position in Journey](#2-tool-purpose--position-in-journey)
3. [Data Contracts](#3-data-contracts)
4. [Profile Classification System](#4-profile-classification-system)
5. [Vehicle Allocation Engine](#5-vehicle-allocation-engine)
6. [UI Architecture](#6-ui-architecture)
7. [Trauma-Informed Integration](#7-trauma-informed-integration)
8. [Slider Coupling Algorithm](#8-slider-coupling-algorithm)
9. [Scenario Management](#9-scenario-management)
10. [GPT Integration](#10-gpt-integration)
11. [Report Generation](#11-report-generation)
12. [Implementation Phases](#12-implementation-phases)
13. [Testing Strategy](#13-testing-strategy)
14. [Known Issues & Risks](#14-known-issues--risks)

---

## 1. Executive Summary

### What We're Building

Transform the legacy Tool 6 (two-phase Google Forms + spreadsheet processing) into an interactive single-page calculator that:

1. **Pulls data forward** from Tools 1-5 (89% reduction in user inputs)
2. **Auto-classifies** users into 1 of 9 investor profiles
3. **Provides real-time** vehicle allocation with interactive sliders
4. **Integrates trauma patterns** from Tools 1, 3, and 5
5. **Generates personalized** PDF reports with GPT narratives

### Key Metrics

| Metric | Legacy Tool 6 | New Tool 6 |
|--------|---------------|------------|
| User Inputs | ~92 questions | 10 questions |
| Time to Complete | 25-35 minutes | 5-10 minutes |
| Real-time Feedback | None | Full interactivity |
| Trauma Integration | None | Medium-deep |
| Framework Integration | Standalone | Full FTP-v3 |

---

## 2. Tool Purpose & Position in Journey

### The Savings Cascade

```
Tool 2: WHERE AM I?        -> Financial clarity snapshot
Tool 4: WHERE DOES IT GO?  -> Income -> M/E/F/J buckets (Retirement $ determined)
Tool 6: HOW DO I SAVE IT?  -> Retirement $ -> Which accounts/vehicles?
Tool 8: HOW DO I INVEST IT? -> Inside accounts -> What investments?
```

### Tool Manifest

```javascript
const tool6Manifest = {
  id: "tool6",
  version: "1.0.0",
  name: "Retirement Account Allocation",
  description: "Optimize retirement savings across tax-advantaged vehicles",
  pattern: "calculator",
  route: "tool6",
  routes: ["/tool6", "/retirement-allocation"],
  dependencies: ["tool4"],  // Requires Tool 4 (provides savings capacity)
  unlocks: ["tool8"],       // Unlocks Tool 8 (investment planning)

  // Data requirements
  requiresFromTools: {
    tool1: ["winner", "allScores"],
    tool2: ["grossAnnualIncome", "netMonthlyIncome", "employmentType", "age", "dependents", "maritalStatus"],
    tool3: ["fsvQuotient", "exvalQuotient", "subdomainScores"],
    tool4: ["jDollars", "goalTimeline", "selectedPriority"],
    tool5: ["islQuotient", "irlQuotient", "subdomainScores"]
  },

  // What this tool outputs
  outputs: [
    "profileId",
    "domainWeights",
    "vehicleAllocations",
    "futureProjections",
    "traumaInsights",
    "scenarios"
  ]
};
```

---

## 3. Data Contracts

### 3.1 Inputs from Prior Tools (Auto-Pulled)

| Data | Source Tool | Field Path | Required |
|------|-------------|------------|----------|
| **Demographics** |
| Age | Tool 2 | `tool2.age` | Yes |
| Marital Status | Tool 2 | `tool2.maritalStatus` | Yes |
| Dependents | Tool 2 | `tool2.dependents` | Yes |
| Filing Status | Tool 2 | Derived from maritalStatus | Yes |
| **Income** |
| Gross Annual Income | Tool 2 | `tool2.grossAnnualIncome` | Yes |
| Net Monthly Income | Tool 2 | `tool2.netMonthlyIncome` | Yes |
| Employment Type | Tool 2 | `tool2.employmentType` | Yes |
| Business Stage | Tool 2 | `tool2.businessStage` | No |
| **Savings Capacity** |
| Monthly Retirement Savings | Tool 4 | `tool4.jDollars` | Yes |
| Goal Timeline (years) | Tool 4 | `tool4.goalTimeline` | Yes |
| Selected Priority | Tool 4 | `tool4.selectedPriority` | No |
| **Trauma Patterns** |
| Primary Pattern | Tool 1 | `tool1.winner` | Yes |
| All Pattern Scores | Tool 1 | `tool1.allScores` | Yes |
| FSV Quotient | Tool 3 | `tool3.fsvQuotient` | Yes |
| ExVal Quotient | Tool 3 | `tool3.exvalQuotient` | Yes |
| Tool 3 Subdomains | Tool 3 | `tool3.subdomainScores` | Yes |
| ISL Quotient | Tool 5 | `tool5.islQuotient` | Yes |
| IRL Quotient | Tool 5 | `tool5.irlQuotient` | Yes |
| Tool 5 Subdomains | Tool 5 | `tool5.subdomainScores` | Yes |

### 3.2 New Inputs (Quick Setup - 10 Questions Max)

| Field ID | Label | Type | Options | Required | Condition |
|----------|-------|------|---------|----------|-----------|
| `hsaEligible` | HSA Eligibility | Select | Yes / No / Not Sure | Yes | Always |
| `currentRetirementBalance` | Current Retirement Balance | Slider | $0 - $2,000,000+ | Yes | Always |
| `hasTraditionalIRA` | Traditional IRA Balance > $0? | Boolean | Yes / No | Yes | Always |
| `hasEmployer401k` | Employer offers 401(k)/403(b)? | Select | Yes / No / N/A | Yes | If W-2 employment |
| `employerMatch` | Employer Match | Compound | % of salary up to % | Conditional | If hasEmployer401k = Yes |
| `hasRoth401k` | Roth 401(k) Option Available? | Select | Yes / No / Not Sure | Conditional | If hasEmployer401k = Yes |
| `robsStatus` | ROBS Status | Select | Using / Interested / Not Interested | Conditional | If self-employed/business owner |
| `hasW2Employees` | Have W-2 Employees (besides spouse)? | Boolean | Yes / No | Conditional | If self-employed/business owner |
| `investmentInvolvement` | Investment Time/Interest | Scale | 1-7 | Yes | Always |
| `investmentConfidence` | Investment Confidence | Scale | 1-7 | Yes | Always |

### 3.3 Outputs (Saved to DataService)

| Output ID | Type | Description | Used By |
|-----------|------|-------------|---------|
| `profileId` | String | Assigned investor profile (1-9) | Tool 8, Reports |
| `domainWeights` | Object | `{Retirement: 0.75, Education: 0.15, Health: 0.10}` | Calculations |
| `vehicleAllocations` | Object | Per-vehicle monthly amounts | Tool 8, Reports |
| `futureProjections` | Object | 10/20/30-year projections by domain | Reports |
| `traumaInsights` | Array | Generated insights from patterns | Reports |
| `scenarios` | Array | Saved scenario snapshots | Comparison |
| `gptNarrative` | String | GPT-generated personalized narrative | PDF Report |

---

## 4. Profile Classification System

### 4.1 The Nine Profiles

| ID | Name | Key Differentiator | Primary Vehicles |
|----|------|-------------------|------------------|
| `1_ROBS_In_Use` | ROBS-In-Use Strategist | Currently using ROBS | ROBS Solo 401(k), HSA |
| `2_ROBS_Curious` | ROBS-Curious Builder | Interested in ROBS | Solo 401(k), Backdoor Roth |
| `3_Solo401k_Builder` | Solo 401(k) Builder | Self-employed, no employees | Solo 401(k), HSA, SEP |
| `4_Roth_Reclaimer` | Roth IRA Reclaimer | High earner, needs backdoor | Backdoor Roth, 401(k) Roth |
| `5_Bracket_Strategist` | Bracket-Balanced | Tax reduction focus | Traditional 401(k), HSA |
| `6_Catch_Up` | Catch-Up Visionary | Age 50+, behind on savings | Max catch-up contributions |
| `7_Foundation_Builder` | Foundation Builder | Standard investor | 401(k), Roth IRA, HSA |
| `8_Biz_Owner_Group` | Business Owner Group | Has W-2 employees | DB Plan, Cash Balance, Group 401(k) |
| `9_Late_Stage_Growth` | Late-Stage Growth | Near retirement, high assets | Conservative, income-focused |

### 4.2 Auto-Classification Algorithm

```javascript
function autoClassifyProfile(data) {
  // data = merged from Tools 1-5 + Quick Setup

  const isSelfEmployed = data.employmentType.includes('Self-Employed') ||
                         data.employmentType.includes('Business Owner');
  const isW2 = data.employmentType.includes('W-2');
  const age = data.age;
  const grossIncome = data.grossAnnualIncome;
  const currentBalance = data.currentRetirementBalance;
  const yearsToRetirement = data.goalTimeline;

  // Roth phase-out limits (2025)
  const rothPhaseOutLimit = data.maritalStatus === 'Married' ? 230000 : 146000;

  // "Behind" benchmark: rough rule of age × $10,000
  const behindOnRetirement = currentBalance < (age * 10000);

  // Decision Tree (order matters - first match wins)

  // 1. ROBS In Use
  if (data.robsStatus === 'Using') {
    return { profileId: '1_ROBS_In_Use', confidence: 'high', reason: 'Currently using ROBS' };
  }

  // 2. ROBS Curious
  if (data.robsStatus === 'Interested') {
    return { profileId: '2_ROBS_Curious', confidence: 'high', reason: 'Interested in ROBS strategy' };
  }

  // 8. Business Owner with Employees (check before Solo 401k)
  if (isSelfEmployed && data.hasW2Employees) {
    return { profileId: '8_Biz_Owner_Group', confidence: 'high', reason: 'Business owner with W-2 employees' };
  }

  // 3. Solo 401k Builder (self-employed, no employees)
  if (isSelfEmployed && !data.hasW2Employees && !isW2) {
    return { profileId: '3_Solo401k_Builder', confidence: 'high', reason: 'Self-employed without employees' };
  }

  // 4. Roth Reclaimer (high earner, needs backdoor)
  if (grossIncome > rothPhaseOutLimit) {
    return { profileId: '4_Roth_Reclaimer', confidence: 'high', reason: 'Income exceeds Roth IRA limit' };
  }

  // 9. Late-Stage Growth (near retirement with assets)
  if (yearsToRetirement <= 10 && currentBalance > 500000) {
    return { profileId: '9_Late_Stage_Growth', confidence: 'medium', reason: 'Near retirement with significant assets' };
  }

  // 6. Catch-Up Visionary (50+, behind on retirement)
  if (age >= 50 && behindOnRetirement) {
    return { profileId: '6_Catch_Up', confidence: 'medium', reason: 'Age 50+ and behind on retirement savings' };
  }

  // 5. Bracket Strategist (high Control pattern = tax control focus)
  // Use trauma pattern as tiebreaker
  if (data.allScores && data.allScores.CLI > 15) {
    return { profileId: '5_Bracket_Strategist', confidence: 'low', reason: 'Control pattern suggests tax optimization focus' };
  }

  // 7. Foundation Builder (default)
  return { profileId: '7_Foundation_Builder', confidence: 'medium', reason: 'Standard investor profile' };
}
```

### 4.3 Profile Override UI

Users can override the auto-classification:

```
Your Profile: SOLO 401(K) BUILDER                    [Change Profile ▼]
"Self-employed professional maximizing tax-advantaged retirement savings"

Confidence: HIGH - Based on your employment type (Self-Employed) and
                   no W-2 employees.
```

Clicking "Change Profile" opens a modal with all 9 profiles, descriptions, and suitability indicators.

---

## 5. Vehicle Allocation Engine

### 5.1 Domain Structure

```javascript
const DOMAINS = {
  Retirement: { defaultWeight: 0.75, minWeight: 0.50, maxWeight: 1.00 },
  Education:  { defaultWeight: 0.15, minWeight: 0.00, maxWeight: 0.40 },
  Health:     { defaultWeight: 0.10, minWeight: 0.00, maxWeight: 0.30 }
};
```

### 5.2 Vehicle Definitions (2025 IRS Limits)

```javascript
const VEHICLES = {
  // Retirement Vehicles
  '401k_Traditional':      { domain: 'Retirement', annualCap: 23500, catchUp50: 7500, catchUp60: 11250 },
  '401k_Roth':             { domain: 'Retirement', annualCap: 23500, catchUp50: 7500, catchUp60: 11250 },
  '401k_Match':            { domain: 'Retirement', annualCap: null }, // Employer-specific
  'Solo_401k_Employee':    { domain: 'Retirement', annualCap: 23500, catchUp50: 7500, catchUp60: 11250 },
  'Solo_401k_Employer':    { domain: 'Retirement', annualCap: 46500 }, // 25% of net self-employment
  'Traditional_IRA':       { domain: 'Retirement', annualCap: 7000, catchUp50: 1000 },
  'Roth_IRA':              { domain: 'Retirement', annualCap: 7000, catchUp50: 1000, phaseOut: true },
  'Backdoor_Roth_IRA':     { domain: 'Retirement', annualCap: 7000, catchUp50: 1000 },
  'SEP_IRA':               { domain: 'Retirement', annualCap: 69000 }, // 25% of net self-employment
  'Defined_Benefit':       { domain: 'Retirement', annualCap: 280000 },
  'Cash_Balance':          { domain: 'Retirement', annualCap: 280000 },
  'Group_401k_Employee':   { domain: 'Retirement', annualCap: 23500, catchUp50: 7500, catchUp60: 11250 },
  'Group_401k_Employer':   { domain: 'Retirement', annualCap: 46500 },
  'ROBS_Solo_401k':        { domain: 'Retirement', annualCap: null }, // Business-specific
  'Family_Bank':           { domain: 'Retirement', annualCap: Infinity }, // Overflow

  // Health Vehicles
  'HSA':                   { domain: 'Health', annualCap: { individual: 4300, family: 8550 }, catchUp55: 1000 },
  'Health_Bank':           { domain: 'Health', annualCap: Infinity },

  // Education Vehicles
  'CESA':                  { domain: 'Education', annualCap: 2000 }, // Per child
  'Education_Bank':        { domain: 'Education', annualCap: Infinity }
};
```

### 5.3 Profile Vehicle Order (Port from Legacy)

Each profile has a specific vehicle priority order. This is ported directly from `profileHelpers` in the legacy code.

```javascript
const PROFILE_VEHICLE_ORDERS = {
  '7_Foundation_Builder': {
    Retirement: [
      { name: '401k_Match', priority: 1 },        // Free money first
      { name: 'HSA', priority: 2 },               // Triple tax advantage
      { name: '401k_Roth', priority: 3 },         // Tax-free growth
      { name: 'Roth_IRA', priority: 4 },          // Additional Roth
      { name: '401k_Traditional', priority: 5 },  // Tax-deferred
      { name: 'Traditional_IRA', priority: 6 },   // Fallback
      { name: 'Family_Bank', priority: 99 }       // Overflow
    ],
    Education: [
      { name: 'CESA', priority: 1 },
      { name: 'Education_Bank', priority: 99 }
    ],
    Health: [
      { name: 'HSA', priority: 1 },
      { name: 'Health_Bank', priority: 99 }
    ]
  },
  // ... other profiles follow same pattern
};
```

### 5.4 Cascade Waterfall Algorithm

Port the `coreAllocate` function from legacy:

```javascript
function coreAllocate({ domains, pool, seeds, vehicleOrders }) {
  const vehicles = initializeVehicles(vehicleOrders, seeds);
  const cumulativeAllocations = {};

  // 1. Allocate to Education domain
  const eduPool = domains.Education.weight * pool;
  const eduAlloc = cascadeWaterfall(vehicleOrders.Education, eduPool, vehicles.Education, cumulativeAllocations);
  const leftoverEdu = eduPool - sumValues(eduAlloc);

  // 2. Allocate to Health domain (+ Education leftover)
  const healthPool = domains.Health.weight * pool + leftoverEdu;
  const healthAlloc = cascadeWaterfall(vehicleOrders.Health, healthPool, vehicles.Health, cumulativeAllocations);
  const leftoverHealth = healthPool - sumValues(healthAlloc);

  // 3. Allocate to Retirement domain (+ Health leftover)
  const retPool = domains.Retirement.weight * pool + leftoverHealth;
  const retAlloc = cascadeWaterfall(vehicleOrders.Retirement, retPool, vehicles.Retirement, cumulativeAllocations);

  return { Education: eduAlloc, Health: healthAlloc, Retirement: retAlloc };
}

function cascadeWaterfall(order, pool, initial, cumulative) {
  const alloc = { ...initial };
  let remaining = pool;

  for (const vehicle of order) {
    const alreadyAllocated = alloc[vehicle.name] || 0;
    const cumulativeAllocated = cumulative[vehicle.name] || 0;
    const totalAllocated = alreadyAllocated + cumulativeAllocated;

    const available = Math.max(0, (vehicle.capMonthly || Infinity) - totalAllocated);
    const take = Math.min(available, remaining);

    if (take > 0) {
      alloc[vehicle.name] = alreadyAllocated + take;
      cumulative[vehicle.name] = totalAllocated + take;
      remaining -= take;
    }

    if (remaining <= 0) break;
  }

  return alloc;
}
```

---

## 6. UI Architecture

### 6.1 Three-Panel Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOOL 6: RETIREMENT ACCOUNT ALLOCATION                                       │
│ "Where should your retirement savings go?"                                  │
├───────────────────────┬─────────────────────────┬───────────────────────────┤
│    INPUT PANEL        │   ALLOCATION PANEL      │     OUTPUT PANEL          │
│    (Left - 25%)       │   (Center - 45%)        │     (Right - 30%)         │
│                       │                         │                           │
│  Profile Setup        │  Domain Weights         │  Projections              │
│  Quick Setup Qs       │  Vehicle Sliders        │  Trauma Insights          │
│  Domain Weights       │  Lock/Unlock Controls   │  Action Items             │
│                       │                         │                           │
├───────────────────────┴─────────────────────────┴───────────────────────────┤
│ [Save Scenario]    [Compare Scenarios]    [Download Report]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Component Hierarchy

```
Tool6.js
├── render(params)                    // Main entry point
├── buildQuickSetupSection()          // 10 new questions (collapsible if data exists)
├── buildProfileSection()             // Auto-classified profile with override
├── buildDomainWeightSection()        // 3 sliders for Retirement/Education/Health
├── buildVehicleAllocationSection()   // Per-vehicle sliders with caps
├── buildOutputPanel()                // Projections + trauma insights
├── buildActionBar()                  // Save/Compare/Download buttons
│
├── Client-Side Functions (in HTML)
│   ├── calculateAllocations()        // Real-time recalc
│   ├── updateDomainWeights()         // Handle domain slider changes
│   ├── updateVehicleAllocation()     // Handle vehicle slider changes
│   ├── updateProjections()           // Update future value calculations
│   ├── updateTraumaInsights()        // Refresh insight callouts
│   ├── saveScenario()                // Save current state
│   └── compareScenarios()            // Open comparison modal
│
├── Server-Side Functions
│   ├── Tool6.saveScenario()          // Persist to TOOL6_SCENARIOS sheet
│   ├── Tool6.loadScenarios()         // Retrieve saved scenarios
│   ├── Tool6.generateReport()        // Create PDF via PDFGenerator
│   └── Tool6.getTraumaInsights()     // Generate insights from Tools 1,3,5
```

### 6.3 Visual Component Specifications

#### Domain Weight Sliders

```html
<div class="domain-weight-slider">
  <label>Retirement</label>
  <input type="range" min="50" max="100" value="75" step="1"
         id="weight-retirement" onchange="updateDomainWeights('retirement')">
  <span class="weight-value">75%</span>
  <span class="weight-dollars">$630/mo</span>
</div>
```

- Total must equal 100%
- When one slider moves, others adjust proportionally (see Section 8)
- Show both percentage and dollar amounts

#### Vehicle Allocation Cards

```html
<div class="vehicle-card">
  <div class="vehicle-header">
    <span class="vehicle-name">401(k) Match</span>
    <span class="vehicle-badge">FREE MONEY</span>
  </div>
  <div class="vehicle-slider">
    <input type="range" min="0" max="200" value="200"
           id="vehicle-401k-match" disabled>
    <span class="allocation">$200/mo</span>
    <span class="cap">(max $200)</span>
  </div>
  <div class="vehicle-bar">
    <div class="bar-filled" style="width: 100%"></div>
  </div>
  <div class="vehicle-note">Auto-maxed - this is free money from your employer</div>
</div>
```

- Visual progress bar showing % of cap used
- Lock icon for non-adjustable vehicles (e.g., employer match)
- Notes explain vehicle-specific considerations

---

## 7. Trauma-Informed Integration

### 7.1 Insight Generation Rules

| Source | Pattern | Threshold | Insight Generated |
|--------|---------|-----------|-------------------|
| Tool 1 | FSV (False Self-View) | Score > 15 | "Your pattern suggests you may under-invest due to 'not worthy' beliefs. Your savings capacity may be higher than you realize." |
| Tool 1 | ExVal (External Validation) | Score > 15 | "Focus on tax efficiency over prestige. The 'boring' accounts often perform best." |
| Tool 1 | ISL (Issues Showing Love) | Score > 15 | "Ensure your retirement is funded before children's education. You cannot pour from an empty cup." |
| Tool 1 | IRL (Issues Receiving Love) | Score > 15 | "Employer match is earned compensation, not charity. Take the free money." |
| Tool 1 | CLI (Control) | Score > 15 | "Your Control pattern may cause under-charging or under-collecting. Your true capacity may be higher." |
| Tool 1 | FLI (Fear) | Score > 15 | "Automate contributions to prevent self-sabotage. Use established custodians with strong protections." |
| Tool 3 | sd1_3 (Avoidance) | Score > 1.5 | "We've simplified your options. Focus on just the top 3 vehicles." |
| Tool 3 | sd2_1 (Image Spending) | Score > 1.5 | "Flashy investments often underperform. Index funds beat 80% of active managers." |
| Tool 5 | sd1_1 (Compulsive Giving) | Score > 1.5 | "Warning: Your CESA allocation may be too high relative to your retirement needs." |
| Tool 5 | sd2_3 (Chronic Debt) | Score > 1.5 | "Consider focusing on employer match + HSA only until debt is addressed." |

### 7.2 Insight Display Locations

1. **Output Panel** - Always-visible sidebar with top 3 relevant insights
2. **Vehicle Cards** - Inline notes on specific vehicles when pattern applies
3. **PDF Report** - Full section with all applicable insights + GPT narrative

### 7.3 Insight Priority Logic

```javascript
function generateTraumaInsights(toolData) {
  const insights = [];

  // Tool 1 patterns
  const winner = toolData.tool1.winner;
  const scores = toolData.tool1.allScores;

  // Always include primary pattern insight
  insights.push({
    source: 'tool1',
    pattern: winner,
    priority: 'HIGH',
    message: PATTERN_INSIGHTS[winner]
  });

  // Check for secondary patterns (within 20% of winner)
  const winnerScore = scores[winner];
  Object.entries(scores).forEach(([pattern, score]) => {
    if (pattern !== winner && score >= winnerScore * 0.8) {
      insights.push({
        source: 'tool1',
        pattern: pattern,
        priority: 'MEDIUM',
        message: PATTERN_INSIGHTS[pattern]
      });
    }
  });

  // Tool 3 subdomain insights
  if (toolData.tool3.subdomainScores) {
    Object.entries(toolData.tool3.subdomainScores).forEach(([subdomain, score]) => {
      if (score > 1.5 && SUBDOMAIN_INSIGHTS[subdomain]) {
        insights.push({
          source: 'tool3',
          pattern: subdomain,
          priority: 'MEDIUM',
          message: SUBDOMAIN_INSIGHTS[subdomain]
        });
      }
    });
  }

  // Tool 5 subdomain insights
  if (toolData.tool5.subdomainScores) {
    Object.entries(toolData.tool5.subdomainScores).forEach(([subdomain, score]) => {
      if (score > 1.5 && SUBDOMAIN_INSIGHTS[subdomain]) {
        insights.push({
          source: 'tool5',
          pattern: subdomain,
          priority: 'MEDIUM',
          message: SUBDOMAIN_INSIGHTS[subdomain]
        });
      }
    });
  }

  // Sort by priority, limit to top 5
  return insights
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 5);
}
```

---

## 8. Slider Coupling Algorithm

### 8.1 Domain Weight Coupling

When a user changes one domain weight, the others adjust proportionally to maintain 100% total:

```javascript
function updateDomainWeights(changedDomain, newValue) {
  const current = {
    Retirement: getSliderValue('weight-retirement'),
    Education: getSliderValue('weight-education'),
    Health: getSliderValue('weight-health')
  };

  // Calculate how much we need to redistribute
  const oldValue = current[changedDomain];
  const delta = newValue - oldValue;

  // Get the other two domains
  const otherDomains = Object.keys(current).filter(d => d !== changedDomain);

  // Calculate their relative weights
  const otherTotal = otherDomains.reduce((sum, d) => sum + current[d], 0);

  if (otherTotal === 0) {
    // Edge case: both others are at 0, split equally
    otherDomains.forEach(d => {
      current[d] = (100 - newValue) / 2;
    });
  } else {
    // Distribute delta proportionally based on current relative weights
    otherDomains.forEach(d => {
      const proportion = current[d] / otherTotal;
      current[d] = Math.max(0, current[d] - (delta * proportion));
    });
  }

  // Set the changed domain to its new value
  current[changedDomain] = newValue;

  // Ensure total is exactly 100 (handle rounding)
  const total = Object.values(current).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    current.Retirement += (100 - total); // Put rounding error in Retirement
  }

  // Update all sliders
  Object.entries(current).forEach(([domain, value]) => {
    setSliderValue(`weight-${domain.toLowerCase()}`, value);
    updateDomainDisplay(domain, value);
  });

  // Recalculate vehicle allocations
  recalculateVehicleAllocations();
}
```

### 8.2 Vehicle Allocation Coupling

When a vehicle's allocation changes, excess/deficit cascades to lower-priority vehicles:

```javascript
function updateVehicleAllocation(vehicleId, newValue) {
  const domain = getVehicleDomain(vehicleId);
  const vehicleOrder = getVehicleOrder(domain);
  const domainPool = getDomainPool(domain);

  // Find the changed vehicle's position
  const changedIndex = vehicleOrder.findIndex(v => v.id === vehicleId);
  const changedVehicle = vehicleOrder[changedIndex];

  // Enforce cap
  const cap = changedVehicle.capMonthly;
  if (newValue > cap) {
    newValue = cap;
  }

  // Lock in the new value
  changedVehicle.locked = true;
  changedVehicle.allocation = newValue;

  // Calculate remaining pool for subsequent vehicles
  let usedBefore = 0;
  for (let i = 0; i < changedIndex; i++) {
    usedBefore += vehicleOrder[i].allocation;
  }

  let remaining = domainPool - usedBefore - newValue;

  // Cascade remaining to subsequent vehicles
  for (let i = changedIndex + 1; i < vehicleOrder.length; i++) {
    const vehicle = vehicleOrder[i];
    if (vehicle.locked) continue; // Skip locked vehicles

    const vehicleCap = vehicle.capMonthly || Infinity;
    const take = Math.min(vehicleCap, remaining);
    vehicle.allocation = take;
    remaining -= take;

    if (remaining <= 0) break;
  }

  // Update all vehicle displays
  vehicleOrder.forEach(v => updateVehicleDisplay(v.id, v.allocation));

  // Update projections
  updateProjections();
}
```

---

## 9. Scenario Management

### 9.1 Scenario Data Structure

```javascript
const scenarioSchema = {
  id: "string",           // UUID
  clientId: "string",     // User identifier
  createdAt: "timestamp",
  name: "string",         // User-provided or auto-generated

  // Inputs
  profileId: "string",
  domainWeights: {
    Retirement: "number",
    Education: "number",
    Health: "number"
  },

  // Allocations
  vehicleAllocations: {
    // Per-vehicle monthly amounts
  },
  lockedVehicles: ["array of vehicle IDs"],

  // Outputs
  futureProjections: {
    years10: { Retirement: "number", Education: "number", Health: "number" },
    years20: { Retirement: "number", Education: "number", Health: "number" },
    years30: { Retirement: "number", Education: "number", Health: "number" }
  },

  // Context
  traumaInsights: ["array"],
  notes: "string"
};
```

### 9.2 Scenario Comparison View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO COMPARISON                                              [Close X] │
├─────────────────────────────────────────────────────────────────────────────┤
│                      │ Scenario A           │ Scenario B          │ Delta  │
│                      │ "Conservative"       │ "Aggressive Roth"   │        │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOMAIN WEIGHTS       │                      │                     │        │
│ Retirement           │ 70%                  │ 80%                 │ +10%   │
│ Education            │ 20%                  │ 15%                 │ -5%    │
│ Health               │ 10%                  │ 5%                  │ -5%    │
├─────────────────────────────────────────────────────────────────────────────┤
│ KEY VEHICLES         │                      │                     │        │
│ 401(k) Roth          │ $200/mo              │ $450/mo             │ +$250  │
│ Traditional 401(k)   │ $300/mo              │ $100/mo             │ -$200  │
│ HSA                  │ $358/mo              │ $358/mo             │ $0     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 30-YEAR PROJECTIONS  │                      │                     │        │
│ Retirement           │ $1.8M                │ $2.1M               │ +$300K │
│ Tax-Free Portion     │ $420K (23%)          │ $980K (47%)         │ +24%   │
│ Education            │ $89K                 │ $52K                │ -$37K  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Download Comparison PDF]    [Select Scenario A]    [Select Scenario B]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. GPT Integration

### 10.1 When GPT Is Called

1. **On Report Generation** - Personalized narrative for PDF
2. **NOT on real-time calculations** - Too slow for interactive UX

### 10.2 GPT Prompt Template

```javascript
const gptPromptTemplate = `
You are a financial trauma-informed retirement planning advisor. Generate a personalized
narrative for a retirement account allocation report.

USER PROFILE:
- Name: {{name}}
- Age: {{age}}
- Profile Type: {{profileName}}
- Primary Trauma Pattern: {{winner}} ({{winnerDescription}})
- Years to Retirement: {{yearsToRetirement}}

FINANCIAL SITUATION:
- Monthly Retirement Budget: ${{monthlyBudget}}
- Current Retirement Balance: ${{currentBalance}}
- Employment: {{employmentType}}

ALLOCATION SUMMARY:
{{#each vehicleAllocations}}
- {{name}}: ${{amount}}/month
{{/each}}

TRAUMA INSIGHTS TO ADDRESS:
{{#each traumaInsights}}
- {{pattern}}: {{message}}
{{/each}}

INSTRUCTIONS:
1. Write a warm, encouraging 2-3 paragraph narrative
2. Acknowledge their specific trauma pattern and how it may affect their financial behavior
3. Explain why their vehicle allocation makes sense for their situation
4. End with a specific, actionable next step

TONE: Supportive but professional. Acknowledge challenges without being preachy.
Do not use phrases like "I understand" or "I know this is hard."
`;
```

### 10.3 GPT Response Caching

```javascript
// Cache GPT responses to avoid redundant API calls
function generateGPTNarrative(clientId, scenarioId) {
  const cacheKey = `gpt_narrative_${clientId}_${scenarioId}`;
  const cached = CacheService.getUserCache().get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const narrative = callGPT(buildPrompt(clientId, scenarioId));

  // Cache for 24 hours
  CacheService.getUserCache().put(cacheKey, JSON.stringify(narrative), 86400);

  return narrative;
}
```

---

## 11. Report Generation

### 11.1 PDF Structure

1. **Cover Page** - Client name, date, profile badge
2. **Executive Summary** - One-paragraph overview with key numbers
3. **Your Investor Profile** - Profile description and why it fits
4. **Recommended Allocation** - Visual breakdown with vehicle cards
5. **30-Year Projections** - Charts showing growth by domain
6. **Trauma-Informed Insights** - Personalized pattern analysis
7. **Action Steps** - Week 1, 30-day, 90-day actions
8. **Appendix** - IRS limits reference, disclaimers

### 11.2 PDF Generation Flow

```javascript
Tool6.generateReport = function(clientId, scenarioId) {
  // 1. Load scenario data
  const scenario = loadScenario(clientId, scenarioId);

  // 2. Load upstream tool data
  const toolData = loadToolData(clientId, ['tool1', 'tool2', 'tool3', 'tool4', 'tool5']);

  // 3. Generate GPT narrative (or use cached)
  const gptNarrative = generateGPTNarrative(clientId, scenarioId);

  // 4. Build HTML template
  const html = buildReportHTML(scenario, toolData, gptNarrative);

  // 5. Convert to PDF
  const pdf = HtmlService.createHtmlOutput(html)
    .getBlob()
    .getAs('application/pdf')
    .setName(`Retirement_Blueprint_${scenario.name}_${new Date().toISOString().split('T')[0]}.pdf`);

  // 6. Save to Drive and return URL
  const file = DriveApp.getFolderById(CONFIG.REPORTS_FOLDER_ID).createFile(pdf);
  return file.getUrl();
};
```

---

## 12. Implementation Phases

### Phase 0: Foundation (Pre-Development)
**Duration:** 1-2 sessions
**Goal:** Set up infrastructure and verify data availability

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 0.1 | Create `tools/tool6/` directory structure | Directory exists with placeholder files | None |
| 0.2 | Create `tool.manifest.json` | Valid JSON, passes schema validation | 0.1 |
| 0.3 | Register Tool 6 in `Code.js` | Tool appears in registry, route works | 0.2 |
| 0.4 | Create `TOOL6_SCENARIOS` sheet in master spreadsheet | Sheet exists with correct headers | None |
| 0.5 | Verify data availability from Tools 1-5 | Can read all required fields via DataService | 0.3 |
| 0.6 | Port IRS limits constants from legacy | `LIMITS` object matches legacy exactly | 0.1 |

**Test:** Navigate to `/tool6`, see "Tool 6 - Coming Soon" placeholder.

---

### Phase 1: Data Layer
**Duration:** 2-3 sessions
**Goal:** All data flows working (pull from Tools 1-5, new inputs, save scenarios)

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 1.1 | Create `Tool6DataService.js` | Module loads without errors | 0.5 |
| 1.2 | Implement `pullUpstreamData(clientId)` | Returns merged object from Tools 1-5 | 1.1 |
| 1.3 | Implement `saveQuickSetupData(clientId, data)` | Data persists to UserProperties | 1.1 |
| 1.4 | Implement `saveScenario(clientId, scenario)` | Row appears in TOOL6_SCENARIOS | 1.1 |
| 1.5 | Implement `loadScenarios(clientId)` | Returns array of saved scenarios | 1.4 |
| 1.6 | Implement `getLatestScenario(clientId)` | Returns most recent scenario or null | 1.5 |

**Test:** Console log shows correct data from prior tools; scenario saves and loads.

---

### Phase 2: Profile Classification
**Duration:** 1-2 sessions
**Goal:** Auto-classify users into correct profile

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 2.1 | Port `PROFILE_CONFIG` from legacy | 9 profiles with correct metadata | 0.6 |
| 2.2 | Implement `autoClassifyProfile(data)` | Returns { profileId, confidence, reason } | 2.1, 1.2 |
| 2.3 | Create unit tests for profile classification | All 9 profiles can be triggered | 2.2 |
| 2.4 | **Test Profile 8 (Biz Owner)** specifically | Known legacy bug - verify logic | 2.2 |
| 2.5 | Implement `getProfileVehicleOrder(profileId)` | Returns correct vehicle order per profile | 2.1 |

**Test:** Given test user data, correct profile is assigned. Profile 8 works correctly.

---

### Phase 3: Allocation Engine
**Duration:** 2-3 sessions
**Goal:** Core allocation algorithm working with all vehicle types

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 3.1 | Port `cascadeWaterfall()` from legacy | Matches legacy output for test cases | 0.6 |
| 3.2 | Port `coreAllocate()` from legacy | Distributes across 3 domains correctly | 3.1 |
| 3.3 | Implement `calculateVehicleCaps(profile, age, income)` | Returns correct caps with catch-up | 0.6 |
| 3.4 | Implement `applyRothPhaseOut(vehicles, income, filing)` | Roth → Backdoor swap when needed | 3.3 |
| 3.5 | Create integration test with all 9 profiles | Each profile produces valid allocation | 3.1-3.4 |
| 3.6 | Implement `calculateFutureValue(allocations, years, rate)` | Matches legacy projections | 3.2 |

**Test:** Given $840/month budget, Profile 7, age 42 - allocation matches expected output.

---

### Phase 4: Basic UI (Read-Only)
**Duration:** 2-3 sessions
**Goal:** Calculator displays correctly (no interactivity yet)

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 4.1 | Create `Tool6.render(params)` | Returns valid HTML | 2.2, 3.2 |
| 4.2 | Build Input Panel - Profile Display | Shows auto-classified profile | 4.1 |
| 4.3 | Build Input Panel - Data Summary | Shows pulled data from Tools 1-5 | 4.1 |
| 4.4 | Build Input Panel - Quick Setup Questions | Shows 10 new questions | 4.1 |
| 4.5 | Build Allocation Panel - Domain Weights | Shows 3 weight displays | 4.1 |
| 4.6 | Build Allocation Panel - Vehicle Cards | Shows all applicable vehicles | 4.1 |
| 4.7 | Build Output Panel - Projections | Shows 10/20/30-year numbers | 4.1 |
| 4.8 | Build Output Panel - Trauma Insights | Shows top 3 insights | 4.1 |
| 4.9 | Apply styling from `shared/styles.html` | Matches FTP-v3 design system | 4.1-4.8 |

**Test:** Page loads, displays correct data, looks professional.

---

### Phase 5: Interactive Sliders
**Duration:** 2-3 sessions
**Goal:** Real-time interactivity working

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 5.1 | Implement domain weight sliders | Sliders move, values display | 4.5 |
| 5.2 | Implement domain coupling algorithm | Other sliders adjust proportionally | 5.1 |
| 5.3 | Implement vehicle allocation sliders | Sliders move within caps | 4.6 |
| 5.4 | Implement vehicle cascade algorithm | Lower-priority vehicles adjust | 5.3 |
| 5.5 | Implement real-time projection updates | Numbers update on slider change | 5.2, 5.4 |
| 5.6 | Implement vehicle lock/unlock | Locked vehicles don't cascade | 5.4 |
| 5.7 | Add "Reset to Recommended" button | Reverts to auto-calculated values | 5.1-5.6 |

**Test:** Move sliders, see real-time updates across all panels.

---

### Phase 6: Quick Setup Flow
**Duration:** 1-2 sessions
**Goal:** New user questions working correctly

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 6.1 | Implement conditional question display | ROBS questions only for self-employed | 4.4 |
| 6.2 | Implement employer match input (compound) | Captures "X% up to Y%" correctly | 4.4 |
| 6.3 | Auto-collapse Quick Setup when data exists | Section minimized if returning user | 4.4 |
| 6.4 | Implement profile override modal | Can change from auto-classified | 4.2 |
| 6.5 | Re-run allocation on profile change | New profile = new vehicle order | 6.4 |

**Test:** New user sees all 10 questions; returning user sees collapsed section.

---

### Phase 7: Scenario Management
**Duration:** 1-2 sessions
**Goal:** Save, load, compare scenarios

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 7.1 | Implement "Save Scenario" button | Scenario persists to sheet | 1.4, 5.5 |
| 7.2 | Implement scenario naming | User can name or auto-generate | 7.1 |
| 7.3 | Implement "Load Scenario" dropdown | Previous scenarios can be loaded | 1.5 |
| 7.4 | Implement "Compare Scenarios" modal | Side-by-side comparison view | 7.3 |
| 7.5 | Implement delta highlighting | Differences highlighted in red/green | 7.4 |

**Test:** Save 2 scenarios, compare them, see differences highlighted.

---

### Phase 8: Trauma Integration
**Duration:** 1-2 sessions
**Goal:** Pattern-based insights displayed correctly

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 8.1 | Create `Tool6TraumaInsights.js` | Module loads without errors | 1.2 |
| 8.2 | Implement `generateTraumaInsights(toolData)` | Returns array of insights | 8.1 |
| 8.3 | Map insights to specific vehicles | Inline notes on relevant vehicles | 8.2, 4.6 |
| 8.4 | Display top 3 insights in Output Panel | Always visible in sidebar | 8.2, 4.8 |
| 8.5 | Test with high ISL pattern | Education over-allocation warning | 8.2 |
| 8.6 | Test with high CLI pattern | Capacity prompt displays | 8.2 |

**Test:** User with high ISL score sees CESA warning; user with high CLI sees capacity insight.

---

### Phase 9: GPT Narrative
**Duration:** 1-2 sessions
**Goal:** Personalized narrative generation for reports

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 9.1 | Create `Tool6GPTAnalysis.js` | Module loads without errors | 8.2 |
| 9.2 | Implement GPT prompt builder | Prompt includes all relevant data | 9.1 |
| 9.3 | Implement GPT API call with error handling | Returns narrative or fallback | 9.2 |
| 9.4 | Implement response caching (24 hours) | Cached responses returned | 9.3 |
| 9.5 | Create fallback narratives by profile | Fallback available if GPT fails | 9.1 |

**Test:** Generate narrative for test user; verify personalization; verify caching.

---

### Phase 10: Report Generation
**Duration:** 2-3 sessions
**Goal:** Professional PDF reports

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 10.1 | Create report HTML template | Valid HTML with placeholders | 4.1-4.8 |
| 10.2 | Implement cover page | Client name, date, profile badge | 10.1 |
| 10.3 | Implement executive summary | Key numbers, one paragraph | 10.1, 9.3 |
| 10.4 | Implement allocation breakdown | Visual vehicle cards | 10.1, 3.2 |
| 10.5 | Implement projection charts | 30-year growth visualization | 10.1, 3.6 |
| 10.6 | Implement trauma insights section | Full insight list with context | 10.1, 8.2 |
| 10.7 | Implement action steps | Week 1, 30-day, 90-day | 10.1 |
| 10.8 | Implement PDF conversion | Clean PDF output | 10.1-10.7 |
| 10.9 | Implement scenario comparison PDF | Side-by-side format | 10.1, 7.4 |
| 10.10 | Save PDFs to Drive folder | Files accessible via URL | 10.8 |

**Test:** Generate PDF, verify all sections render correctly, PDF opens cleanly.

---

### Phase 11: Integration & Polish
**Duration:** 1-2 sessions
**Goal:** Full framework integration, edge cases handled

| Step | Task | Test Criteria | Dependencies |
|------|------|---------------|--------------|
| 11.1 | Update `ToolAccessControl` for Tool 6 | Tool 6 unlocks after Tool 4 | All phases |
| 11.2 | Update `InsightsPipeline` with Tool 6 outputs | Insights flow to Tool 8 | All phases |
| 11.3 | Handle edit mode (returning user) | Can modify existing allocation | All phases |
| 11.4 | Handle missing upstream data gracefully | Clear error messages | All phases |
| 11.5 | Add loading states | Spinner during calculations | All phases |
| 11.6 | Add error boundaries | Graceful error handling | All phases |
| 11.7 | Cross-browser testing | Works in Chrome, Firefox, Safari | All phases |
| 11.8 | Mobile responsiveness check | Usable on tablet (not required for phone) | All phases |

**Test:** Complete user journey from Tool 1 → Tool 6 → PDF download.

---

## 13. Testing Strategy

### 13.1 Unit Tests (Per Phase)

Create test functions in `tests/tool6-tests.js`:

```javascript
function testProfileClassification() {
  const testCases = [
    { input: { robsStatus: 'Using' }, expected: '1_ROBS_In_Use' },
    { input: { robsStatus: 'Interested' }, expected: '2_ROBS_Curious' },
    { input: { employmentType: ['Self-Employed'], hasW2Employees: false }, expected: '3_Solo401k_Builder' },
    { input: { grossAnnualIncome: 250000, maritalStatus: 'Single' }, expected: '4_Roth_Reclaimer' },
    { input: { age: 55, currentRetirementBalance: 100000 }, expected: '6_Catch_Up' },
    { input: { employmentType: ['Business Owner'], hasW2Employees: true }, expected: '8_Biz_Owner_Group' },
    { input: { goalTimeline: 8, currentRetirementBalance: 800000 }, expected: '9_Late_Stage_Growth' },
    { input: {}, expected: '7_Foundation_Builder' } // Default
  ];

  testCases.forEach((tc, i) => {
    const result = autoClassifyProfile(tc.input);
    console.assert(result.profileId === tc.expected,
      `Test ${i} failed: expected ${tc.expected}, got ${result.profileId}`);
  });

  console.log('Profile classification tests complete');
}

function testAllocationEngine() {
  // Test case: Profile 7, age 42, $840/month
  const input = {
    profileId: '7_Foundation_Builder',
    age: 42,
    grossAnnualIncome: 95000,
    monthlyBudget: 840,
    hsaEligible: true,
    hasEmployer401k: true,
    employerMatch: { rate: 0.5, upTo: 0.06 }
  };

  const result = coreAllocate(buildAllocationInput(input));

  // Verify employer match is maxed
  console.assert(result.Retirement['401k_Match'] === 237.50,
    'Employer match should be $237.50 (50% of 6% of $95K / 12)');

  // Verify HSA is included
  console.assert(result.Health['HSA'] > 0, 'HSA should have allocation');

  console.log('Allocation engine tests complete');
}
```

### 13.2 Integration Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| INT-01 | New user, complete journey | Tool 1 → 2 → 3 → 4 → 6 | PDF generated successfully |
| INT-02 | Returning user, edit scenario | Load → modify sliders → save | Updated scenario saved |
| INT-03 | Profile override | Auto-classify → override → recalculate | New allocation matches override |
| INT-04 | Missing Tool 3 data | Skip Tool 3, complete others | Tool 6 works with fallback |
| INT-05 | Profile 8 (Biz Owner) | Self-employed + employees | Correct advanced vehicles shown |
| INT-06 | High earner (backdoor Roth) | Income > $230K MFJ | Roth IRA → Backdoor Roth swap |
| INT-07 | Catch-up eligible | Age 55, various balances | Catch-up contributions shown |

### 13.3 Regression Tests for Legacy Bug

**Profile 8 (Business Owner Group) Bug:**

The legacy system had a documented bug with Profile 8 that was reportedly fixed. Testing strategy:

```javascript
function testProfile8BizOwner() {
  const testCases = [
    {
      name: 'Basic business owner with employees',
      input: {
        employmentType: ['Business Owner'],
        hasW2Employees: true,
        numEmployees: 5,
        avgEmployeeAge: 35,
        avgEmployeeSalary: 50000,
        hasRetirementPlan: true,
        planType: '401(k)',
        annualContribution: 24000,
        age: 52,
        grossAnnualIncome: 200000
      },
      expected: {
        profileId: '8_Biz_Owner_Group',
        hasDBPlan: true,  // Age 52 > avgAge 35 + 10
        hasGroupEmployee: true,
        hasCashBalance: true // Age 52 > 45 and > avgAge + 5
      }
    },
    {
      name: 'Young business owner (no DB eligible)',
      input: {
        employmentType: ['Business Owner'],
        hasW2Employees: true,
        numEmployees: 3,
        avgEmployeeAge: 35,
        age: 38, // Not > avgAge + 10
        grossAnnualIncome: 150000
      },
      expected: {
        profileId: '8_Biz_Owner_Group',
        hasDBPlan: false, // Age difference too small
        hasGroupEmployee: true
      }
    }
  ];

  testCases.forEach(tc => {
    const result = profileHelpers['8_Biz_Owner_Group'](tc.input);

    // Verify profile assignment
    console.assert(autoClassifyProfile(tc.input).profileId === tc.expected.profileId,
      `${tc.name}: Wrong profile`);

    // Verify DB Plan presence
    const hasDB = result.vehicleOrders.Retirement.some(v => v.name === 'Defined Benefit Plan');
    console.assert(hasDB === tc.expected.hasDBPlan,
      `${tc.name}: DB Plan mismatch`);

    // Verify Group 401(k) presence
    const hasGroup = result.vehicleOrders.Retirement.some(v => v.name.includes('Group 401(k)'));
    console.assert(hasGroup === tc.expected.hasGroupEmployee,
      `${tc.name}: Group 401(k) mismatch`);
  });

  console.log('Profile 8 regression tests complete');
}
```

---

## 14. Known Issues & Risks

### 14.1 Known Legacy Issues

| Issue | Description | Mitigation |
|-------|-------------|------------|
| **Profile 8 Bug** | Business Owner Group allocation was broken in legacy | Comprehensive test suite in Phase 2.4 |
| **Employer Match Calculation** | Legacy had inconsistent match parsing | Standardize compound input format |
| **Roth Phase-Out Edge Cases** | Edge cases near phase-out limits | Add explicit tests for boundary cases |

### 14.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **GPT API Rate Limits** | Medium | Medium | Caching, fallback narratives |
| **Large Scenario Data** | Low | Medium | Limit to 10 scenarios per user |
| **Real-time Calc Performance** | Medium | High | Client-side calculations, debounce |
| **Cross-browser Slider Behavior** | Medium | Medium | Test in Phase 11, use polyfills |

### 14.3 Data Quality Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Missing Tool 1-5 Data** | Low | High | Graceful fallbacks, error messages |
| **Inconsistent Employment Type** | Medium | Medium | Normalize in data pull function |
| **Stale Cached Data** | Low | Medium | Clear cache on upstream tool re-submit |

---

## Appendix A: File Structure

```
tools/tool6/
├── Tool6.js                    # Main tool (render, orchestration)
├── Tool6DataService.js         # Data pull/save functions
├── Tool6AllocationEngine.js    # Core allocation algorithm
├── Tool6ProfileClassifier.js   # Auto-classification logic
├── Tool6TraumaInsights.js      # Pattern-based insight generation
├── Tool6GPTAnalysis.js         # GPT narrative generation
├── Tool6Report.js              # PDF generation
├── Tool6Fallbacks.js           # Fallback content
├── Tool6Constants.js           # IRS limits, profile configs
├── tool.manifest.json          # Tool manifest
└── templates/
    ├── calculator.html         # Main calculator template
    ├── report.html             # PDF report template
    └── comparison.html         # Scenario comparison template
```

---

## Appendix B: Quick Reference - IRS Limits 2025

| Vehicle | Annual Limit | Catch-Up 50+ | Catch-Up 60-63 |
|---------|--------------|--------------|----------------|
| 401(k) Employee | $23,500 | +$7,500 | +$11,250 |
| Total 401(k) | $70,000 | - | - |
| Traditional IRA | $7,000 | +$1,000 | - |
| Roth IRA | $7,000 | +$1,000 | - |
| SEP IRA | $69,000 | - | - |
| HSA Individual | $4,300 | +$1,000 (55+) | - |
| HSA Family | $8,550 | +$1,000 (55+) | - |
| CESA | $2,000/child | - | - |
| Defined Benefit | $280,000 | - | - |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Larry | | |
| Developer | Claude | December 31, 2025 | _AI-generated_ |

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-31 | Claude | Initial draft |
