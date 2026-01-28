# Tool6 Refactoring Plan

**Created:** January 26, 2026
**Status:** Planning
**Priority:** Medium (Technical Debt Reduction)

---

## Executive Summary

Tool6 has grown to 16,000+ lines across 7 files, with the main `Tool6.js` at 11,252 lines. While functional and well-tested, the codebase would benefit from modularization to improve maintainability, testability, and developer experience.

**Goal:** Reduce `Tool6.js` from 11,252 lines to ~4,000 lines by extracting client-side JavaScript, HTML templates, and allocation logic into dedicated modules.

---

## Current State Analysis

### File Inventory

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| Tool6.js | 11,252 | Core engine (all logic + HTML + client JS) | **Needs splitting** |
| Tool6Constants.js | 1,454 | Configuration & definitions | Good |
| Tool6Report.js | 1,033 | PDF generation | Good |
| Tool6GPTAnalysis.js | 824 | AI insights with fallbacks | Good |
| Tool6Fallbacks.js | 404 | Profile-aware narratives | Good |
| Tool6Tests.js | 1,003 | Manual test suite | Adequate |
| tool6.manifest.json | 70 | Tool metadata | Good |
| **TOTAL** | **16,040** | | |

### Tool6.js Breakdown

| Section | Lines | Content |
|---------|-------|---------|
| 1-250 | Upstream data mapping | `mapUpstreamFields()` |
| 251-600 | Profile classification | `classifyProfile()` decision tree |
| 601-1200 | Vehicle eligibility & allocation | `getEligibleVehicles()`, `coreAllocate()` |
| 1201-1700 | IRS validation & waterfall | `validateAllocations()`, `calculateAllocation()` |
| 1701-2200 | Ambition Quotient | `computeDomainsAndWeights()` |
| 2201-3000 | Projection engine | `calculateProjections()`, `futureValue()` |
| 3001-5000 | HTML generation | `buildUnifiedPage()`, questionnaire sections |
| 5001-8000 | Client-side JavaScript | Sliders, validation, state management |
| 8001-10900 | Scenario management | Save/load/compare/delete |
| 10901-11252 | Server wrappers & tests | Global functions |

### Identified Issues

1. **Mixed Concerns:** Server logic, HTML generation, and client-side JS in one file
2. **Large Functions:** `buildUnifiedPage()` is ~2,500 lines
3. **Code Duplication:** Shared limit enforcement repeated 3x, slider logic repeated 5x
4. **Complexity Hotspots:** `coreAllocate()` handles 5+ special cases in one function
5. **Test Gaps:** No tests for Ambition Quotient, slider interactions, or full integration

---

## Refactoring Phases

### Phase 1: DRY Up Repeated Patterns (Quick Wins)

**Effort:** 2-3 hours | **Risk:** Low | **Impact:** Medium

#### 1.1 Extract Shared Limit Utility

**Problem:** Same logic for 401k Trad+Roth and IRA Trad+Roth coupling appears 3 times.

**Solution:** Create utility function:

```javascript
// In Tool6.js (or future Tool6Utils.js)
function enforceSharedLimit(newValue, otherValue, combinedLimit) {
  const combined = newValue + otherValue;
  if (combined > combinedLimit) {
    return Math.max(0, combinedLimit - otherValue);
  }
  return newValue;
}

// Usage
const adjusted401kTrad = enforceSharedLimit(newTradValue, current401kRoth, IRS_LIMITS.ANNUAL_401K);
const adjustedIRATrad = enforceSharedLimit(newTradValue, currentIRARoth, IRS_LIMITS.ANNUAL_IRA);
```

**Files:** Tool6.js (lines ~800, ~1050, ~5700)

#### 1.2 Extract Slider Update Handler

**Problem:** 5 vehicle sliders (401k Trad, 401k Roth, IRA Trad, IRA Roth, HSA) have similar update logic.

**Solution:** Create generic handler:

```javascript
function handleVehicleSliderChange(vehicleId, newMonthlyValue, state, config) {
  // 1. Validate against IRS limit
  const annualValue = newMonthlyValue * 12;
  const limit = config.irsLimits[vehicleId];
  if (annualValue > limit) {
    newMonthlyValue = limit / 12;
  }

  // 2. Check shared limits if applicable
  if (config.sharedLimitGroup) {
    newMonthlyValue = enforceSharedLimit(
      newMonthlyValue,
      state[config.sharedLimitPartner],
      config.sharedLimitMax / 12
    );
  }

  // 3. Update state
  state[vehicleId] = newMonthlyValue;

  // 4. Trigger recalculation
  recalculateProjections(state);
  updateSliderDisplay(vehicleId, newMonthlyValue);
}
```

**Files:** Tool6.js (lines ~5500-5800)

#### 1.3 Extract Projection Display Template

**Problem:** Three similar blocks for Retirement, Education, Health projections.

**Solution:** Single parameterized function:

```javascript
function buildProjectionCard(domain, data) {
  return `
    <div class="projection-card projection-${domain.toLowerCase()}">
      <h4>${domain} Projection</h4>
      <div class="projection-value">${formatCurrency(data.projectedBalance)}</div>
      <div class="projection-details">
        <span>Monthly: ${formatCurrency(data.monthlyContribution)}</span>
        <span>Years: ${data.yearsToGoal}</span>
        <span>Rate: ${(data.returnRate * 100).toFixed(1)}%</span>
      </div>
    </div>
  `;
}
```

**Files:** Tool6.js (lines ~6000-6500)

---

### Phase 2: Extract Client-Side JavaScript

**Effort:** 4-6 hours | **Risk:** Low | **Impact:** High

**Goal:** Create `Tool6Client.js` with all browser-executed code (~3,000 lines)

#### What to Extract

| Category | Estimated Lines | Functions |
|----------|-----------------|-----------|
| Slider handlers | ~500 | `updateSlider()`, `onSliderInput()`, `onSliderChange()` |
| State management | ~300 | `getAllocationState()`, `setAllocationState()`, `syncToLocalStorage()` |
| Form validation | ~200 | `validateInput()`, `showError()`, `clearErrors()` |
| UI interactions | ~400 | `toggleCollapsible()`, `switchTab()`, `showTooltip()` |
| Scenario handlers | ~300 | `onSaveScenario()`, `onCompareScenarios()`, `onDeleteScenario()` |
| Recalculation | ~400 | `recalculateProjections()`, `updateDisplayValues()` |
| Utility functions | ~200 | `formatCurrency()`, `formatPercent()`, `debounce()` |

#### File Structure

```javascript
// Tool6Client.js

/**
 * Tool6 Client-Side Module
 * Handles all browser-executed JavaScript for the calculator interface
 */

const Tool6Client = (function() {
  'use strict';

  // Private state
  let allocationState = {};
  let irsLimits = {};
  let inputs = {};

  // === INITIALIZATION ===
  function init(initialState, limits, userInputs) {
    allocationState = initialState;
    irsLimits = limits;
    inputs = userInputs;
    bindEventListeners();
    syncFromLocalStorage();
  }

  // === SLIDER HANDLERS ===
  function handleSliderChange(vehicleId, newValue) { /* ... */ }
  function enforceSharedLimit(newValue, otherValue, limit) { /* ... */ }

  // === STATE MANAGEMENT ===
  function getAllocationState() { return { ...allocationState }; }
  function updateAllocationState(vehicleId, value) { /* ... */ }

  // === RECALCULATION ===
  function recalculateProjections() { /* ... */ }
  function updateDisplayValues() { /* ... */ }

  // === SCENARIO MANAGEMENT ===
  function saveScenario(name) { /* ... */ }
  function loadScenario(scenarioId) { /* ... */ }
  function compareScenarios(ids) { /* ... */ }

  // === UI UTILITIES ===
  function formatCurrency(value) { /* ... */ }
  function formatPercent(value) { /* ... */ }
  function showError(elementId, message) { /* ... */ }

  // Public API
  return {
    init,
    handleSliderChange,
    getAllocationState,
    saveScenario,
    loadScenario,
    compareScenarios,
    recalculateProjections
  };
})();
```

#### Integration Pattern

In `buildUnifiedPage()`, inject the client module:

```javascript
function buildUnifiedPage(inputs, allocation, projections) {
  return `
    <!DOCTYPE html>
    <html>
    <head>...</head>
    <body>
      <!-- HTML content -->

      <script>
        ${Tool6Client.toString()}

        // Initialize with server-computed data
        Tool6Client.init(
          ${JSON.stringify(allocation)},
          ${JSON.stringify(IRS_LIMITS_2025)},
          ${JSON.stringify(inputs)}
        );
      </script>
    </body>
    </html>
  `;
}
```

---

### Phase 3: Extract HTML Templates

**Effort:** 6-8 hours | **Risk:** Medium | **Impact:** High

**Goal:** Create `Tool6Templates.js` with all HTML generation (~2,500 lines)

#### What to Extract

| Template | Estimated Lines | Purpose |
|----------|-----------------|---------|
| `buildPageShell()` | ~100 | DOCTYPE, head, body wrapper |
| `buildStyles()` | ~400 | All CSS (could also be separate file) |
| `buildQuestionnaireSection()` | ~600 | Phase A, B, C questions |
| `buildCalculatorSection()` | ~500 | Slider interface, totals |
| `buildVehicleCard()` | ~150 | Single vehicle display |
| `buildProjectionSection()` | ~300 | Domain projections, charts |
| `buildScenarioManager()` | ~250 | Save/load/compare UI |
| `buildEducationHelp()` | ~200 | Collapsible explainers |

#### File Structure

```javascript
// Tool6Templates.js

/**
 * Tool6 HTML Template Builders
 * Pure functions that take data and return HTML strings
 */

const Tool6Templates = {

  /**
   * Build complete page HTML
   */
  buildPage: function(data) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Retirement Blueprint Calculator</title>
        <style>${this.buildStyles()}</style>
      </head>
      <body>
        ${this.buildHeader(data.profile)}
        ${this.buildQuestionnaireSection(data.questions, data.answers)}
        ${this.buildCalculatorSection(data.allocation, data.irsLimits)}
        ${this.buildProjectionSection(data.projections)}
        ${this.buildScenarioManager(data.scenarios)}
        <script>${data.clientScript}</script>
      </body>
      </html>
    `;
  },

  /**
   * Build questionnaire HTML for all phases
   */
  buildQuestionnaireSection: function(questions, answers) {
    let html = '<div class="questionnaire-container">';

    // Phase A: Classification
    html += this.buildQuestionPhase('A', questions.classification, answers);

    // Phase B: Allocation-specific
    html += this.buildQuestionPhase('B', questions.allocation, answers);

    // Phase C: Ambition Quotient
    html += this.buildQuestionPhase('C', questions.ambition, answers);

    html += '</div>';
    return html;
  },

  /**
   * Build single vehicle card
   */
  buildVehicleCard: function(vehicle, allocation, limit, inputs) {
    const monthlyValue = allocation[vehicle.id] || 0;
    const annualValue = monthlyValue * 12;
    const utilizationPct = limit > 0 ? (annualValue / limit * 100).toFixed(0) : 0;

    return `
      <div class="vehicle-card" data-vehicle="${vehicle.id}">
        <div class="vehicle-header">
          <h4>${vehicle.displayName}</h4>
          <span class="vehicle-limit">Limit: ${this.formatCurrency(limit)}/yr</span>
        </div>
        <div class="vehicle-slider">
          <input type="range"
                 id="slider-${vehicle.id}"
                 min="0"
                 max="${limit / 12}"
                 value="${monthlyValue}"
                 step="50">
          <div class="slider-labels">
            <span>$0</span>
            <span>${this.formatCurrency(limit / 12)}/mo</span>
          </div>
        </div>
        <div class="vehicle-values">
          <span class="monthly">${this.formatCurrency(monthlyValue)}/mo</span>
          <span class="annual">${this.formatCurrency(annualValue)}/yr</span>
          <span class="utilization">${utilizationPct}% of limit</span>
        </div>
        ${vehicle.warnings ? this.buildVehicleWarnings(vehicle.warnings) : ''}
        ${vehicle.education ? this.buildEducationHelp(vehicle.education) : ''}
      </div>
    `;
  },

  // ... additional template methods

  // Utility methods
  formatCurrency: function(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
};
```

#### Integration

In `Tool6.js`, the main render becomes much cleaner:

```javascript
function buildUnifiedPage(inputs, allocation, projections, profile) {
  return Tool6Templates.buildPage({
    profile: profile,
    questions: {
      classification: CLASSIFICATION_QUESTIONS,
      allocation: ALLOCATION_QUESTIONS,
      ambition: AMBITION_QUESTIONS
    },
    answers: inputs,
    allocation: allocation,
    irsLimits: IRS_LIMITS_2025,
    projections: projections,
    scenarios: getSavedScenarios(),
    clientScript: Tool6Client.toString()
  });
}
```

---

### Phase 4: Extract Allocation Engine

**Effort:** 8-12 hours | **Risk:** Higher | **Impact:** Medium

**Goal:** Create `Tool6Allocation.js` with waterfall logic (~1,200 lines)

#### Current Structure (Monolithic)

```javascript
function calculateAllocation(inputs, profile) {
  // 200+ lines handling:
  // - Non-discretionary seeding
  // - Priority ordering
  // - Budget cascading
  // - Shared limits
  // - Catch-up contributions
  // - Overflow handling
}
```

#### Proposed Structure (Modular)

```javascript
// Tool6Allocation.js

const Tool6Allocation = {

  /**
   * Main entry point - orchestrates the waterfall
   */
  calculate: function(inputs, profile, irsLimits) {
    const allocation = this.initializeAllocation();
    const priorityOrder = this.getPriorityOrder(profile, inputs.taxPreference);

    // Step 1: Seed non-discretionary (employer match, ROBS)
    this.seedNonDiscretionary(allocation, inputs, irsLimits);

    // Step 2: Cascade budget through priority list
    let remainingBudget = inputs.monthlyBudget;
    for (const vehicleId of priorityOrder) {
      if (remainingBudget <= 0) break;
      remainingBudget = this.allocateToVehicle(
        allocation, vehicleId, remainingBudget, inputs, irsLimits
      );
    }

    // Step 3: Apply catch-up contributions
    this.applyCatchUps(allocation, inputs, irsLimits);

    // Step 4: Enforce shared limits
    this.enforceSharedLimits(allocation, irsLimits);

    // Step 5: Handle overflow
    if (remainingBudget > 0) {
      allocation.familyBank = remainingBudget;
    }

    return allocation;
  },

  /**
   * Seed employer match and other non-discretionary amounts
   */
  seedNonDiscretionary: function(allocation, inputs, irsLimits) {
    // Employer 401k match (not from user budget)
    if (inputs.employerMatchPercent > 0 && inputs.employerMatchLimit > 0) {
      const matchAmount = Math.min(
        inputs.grossIncome * inputs.employerMatchPercent / 100 / 12,
        inputs.employerMatchLimit / 12
      );
      allocation['401k_employer_match'] = matchAmount;
    }

    // ROBS (if applicable)
    if (inputs.robsAmount > 0) {
      allocation['robs'] = inputs.robsAmount / 12;
    }
  },

  /**
   * Allocate budget to a single vehicle
   */
  allocateToVehicle: function(allocation, vehicleId, budget, inputs, irsLimits) {
    const vehicle = VEHICLE_DEFINITIONS[vehicleId];
    if (!vehicle) return budget;

    // Check eligibility
    if (!this.isVehicleEligible(vehicleId, inputs)) {
      return budget;
    }

    // Calculate available room
    const annualLimit = this.getVehicleLimit(vehicleId, inputs, irsLimits);
    const currentAnnual = (allocation[vehicleId] || 0) * 12;
    const roomRemaining = Math.max(0, annualLimit - currentAnnual);
    const monthlyRoom = roomRemaining / 12;

    // Allocate up to room or budget
    const toAllocate = Math.min(budget, monthlyRoom);
    allocation[vehicleId] = (allocation[vehicleId] || 0) + toAllocate;

    return budget - toAllocate;
  },

  /**
   * Get priority order based on profile and tax preference
   */
  getPriorityOrder: function(profile, taxPreference) {
    const baseOrder = VEHICLE_PRIORITY_BY_PROFILE[profile.id];

    if (taxPreference === 'traditional') {
      // Move Traditional vehicles before Roth equivalents
      return this.reorderForTraditional(baseOrder);
    } else if (taxPreference === 'roth') {
      // Move Roth vehicles before Traditional equivalents
      return this.reorderForRoth(baseOrder);
    }

    return baseOrder; // Balanced - use default order
  },

  /**
   * Enforce shared IRS limits (401k Trad+Roth, IRA Trad+Roth)
   */
  enforceSharedLimits: function(allocation, irsLimits) {
    // 401k employee deferral limit (Trad + Roth combined)
    const total401k = (allocation['401k_traditional'] || 0) +
                      (allocation['401k_roth'] || 0);
    const max401k = irsLimits.ANNUAL_401K_EMPLOYEE / 12;

    if (total401k > max401k) {
      const ratio = max401k / total401k;
      allocation['401k_traditional'] *= ratio;
      allocation['401k_roth'] *= ratio;
    }

    // IRA limit (Trad + Roth combined)
    const totalIRA = (allocation['ira_traditional'] || 0) +
                     (allocation['ira_roth'] || 0);
    const maxIRA = irsLimits.ANNUAL_IRA / 12;

    if (totalIRA > maxIRA) {
      const ratio = maxIRA / totalIRA;
      allocation['ira_traditional'] *= ratio;
      allocation['ira_roth'] *= ratio;
    }
  },

  /**
   * Apply age-based catch-up contributions
   */
  applyCatchUps: function(allocation, inputs, irsLimits) {
    const age = inputs.age;

    // 401k catch-up (50+)
    if (age >= 50) {
      // Additional room available - handled in getVehicleLimit
    }

    // 401k super catch-up (60-63)
    if (age >= 60 && age <= 63) {
      // Additional room available - handled in getVehicleLimit
    }

    // IRA catch-up (50+)
    if (age >= 50) {
      // Additional room available - handled in getVehicleLimit
    }

    // HSA catch-up (55+)
    if (age >= 55) {
      // Additional room available - handled in getVehicleLimit
    }
  },

  // ... additional helper methods
};
```

#### Testing Strategy

Create dedicated allocation tests:

```javascript
function testAllocationEngine() {
  const tests = [
    {
      name: 'Basic waterfall - fills 401k match first',
      inputs: { monthlyBudget: 1000, employerMatchPercent: 6 },
      expected: { '401k_employer_match': /* calculated */ }
    },
    {
      name: 'Shared limit - 401k Trad + Roth under ceiling',
      inputs: { monthlyBudget: 3000 },
      expected: { /* 401k_traditional + 401k_roth <= limit */ }
    },
    {
      name: 'Overflow to Family Bank',
      inputs: { monthlyBudget: 10000 }, // More than all vehicles
      expected: { familyBank: /* remainder */ }
    }
  ];

  // Run tests...
}
```

---

### Phase 5: Expand Test Coverage

**Effort:** 4-6 hours | **Risk:** Low | **Impact:** Medium

#### Current Coverage

| Area | Tests | Status |
|------|-------|--------|
| Constants validation | 4 | Good |
| Profile classification | 12 | Good |
| Vehicle eligibility | 8 | Basic |
| Allocation waterfall | 7 | Basic |
| Scenario management | 4 | Basic |
| **Sprint 12 features** | 7 | Good |

#### Missing Coverage

| Area | Priority | Tests Needed |
|------|----------|--------------|
| Shared limit enforcement | High | 5-8 tests |
| Ambition Quotient scoring | Medium | 4-6 tests |
| Slider state transitions | Medium | 6-10 tests |
| Catch-up contributions | Medium | 4-6 tests |
| Edge cases (zero/negative) | Low | 3-5 tests |
| Full integration flow | Low | 2-3 tests |

#### New Test Functions

```javascript
// Add to Tool6Tests.js

function testSharedLimits() {
  console.log('=== Testing Shared Limit Enforcement ===');

  const tests = [
    {
      name: '401k Trad at max, Roth should be 0',
      allocation: { '401k_traditional': 1958.33 }, // $23,500/yr
      newRothValue: 500,
      expected: 0
    },
    {
      name: '401k split 50/50 under limit',
      allocation: { '401k_traditional': 979.17 },
      newRothValue: 979.17,
      expected: 979.17
    },
    // ... more tests
  ];

  // Run and report...
}

function testAmbitionQuotient() {
  console.log('=== Testing Ambition Quotient ===');

  const tests = [
    {
      name: 'Retirement only (no kids, no HSA)',
      answers: { importance_retirement: 7, motivation_retirement: 6, anxiety_retirement: 3 },
      inputs: { hasChildren: false, hsaEligible: false },
      expected: { retirement: 1.0, education: 0, health: 0 }
    },
    {
      name: 'Three domains - weights sum to 1.0',
      answers: { /* all three domains */ },
      inputs: { hasChildren: true, hsaEligible: true },
      validate: (result) => Math.abs(result.retirement + result.education + result.health - 1.0) < 0.001
    },
    // ... more tests
  ];

  // Run and report...
}

function testCatchUpContributions() {
  console.log('=== Testing Catch-Up Contributions ===');

  const tests = [
    { name: 'Age 49 - no catch-up', age: 49, expected401kLimit: 23500 },
    { name: 'Age 50 - standard catch-up', age: 50, expected401kLimit: 31000 },
    { name: 'Age 60 - super catch-up', age: 60, expected401kLimit: 34750 },
    { name: 'Age 64 - back to standard', age: 64, expected401kLimit: 31000 },
    { name: 'HSA age 54 - no catch-up', age: 54, expectedHSALimit: 4300 },
    { name: 'HSA age 55 - catch-up', age: 55, expectedHSALimit: 5300 },
  ];

  // Run and report...
}
```

---

## Proposed Final File Structure

```
tools/tool6/
├── Tool6.js              (~4,000 lines)  Server logic, orchestration
├── Tool6Allocation.js    (~1,200 lines)  Waterfall engine
├── Tool6Client.js        (~3,000 lines)  Browser JavaScript
├── Tool6Templates.js     (~2,500 lines)  HTML builders
├── Tool6Constants.js     (1,454 lines)   No change
├── Tool6Report.js        (1,033 lines)   No change
├── Tool6GPTAnalysis.js   (824 lines)     No change
├── Tool6Fallbacks.js     (404 lines)     No change
├── Tool6Tests.js         (~1,500 lines)  Expanded coverage
└── tool6.manifest.json   (updated)       New dependencies
```

**Total:** ~16,000 lines (same) but better organized across 9 files

---

## Implementation Sequence

### Recommended Order

| Step | Phase | Effort | Dependencies |
|------|-------|--------|--------------|
| 1 | Phase 1 (DRY patterns) | 2-3 hrs | None |
| 2 | Phase 5a (Add missing tests) | 2 hrs | None |
| 3 | Phase 2 (Extract client JS) | 4-6 hrs | Phase 1 |
| 4 | Phase 5b (Client tests) | 2 hrs | Phase 2 |
| 5 | Phase 3 (Extract templates) | 6-8 hrs | Phase 2 |
| 6 | Phase 4 (Extract allocation) | 8-12 hrs | Phases 1-3 |
| 7 | Phase 5c (Integration tests) | 2 hrs | Phase 4 |

**Total Estimated Effort:** 26-35 hours

### Milestones

1. **Milestone 1:** Quick wins complete (Phase 1) - Tool6.js cleaner, no new files
2. **Milestone 2:** Client extraction complete (Phase 2) - Tool6Client.js exists
3. **Milestone 3:** Templates extraction complete (Phase 3) - Tool6Templates.js exists
4. **Milestone 4:** Full modularization (Phase 4) - Tool6Allocation.js exists
5. **Milestone 5:** Test coverage complete (Phase 5) - All new tests passing

---

## What NOT to Do

### Avoid Over-Engineering

- **No TypeScript:** Adds tooling complexity for GAS environment
- **No external template engine:** GAS does not support well
- **No MVC framework:** Overkill for single-page tool
- **No abstract factories:** Current vehicle pattern is clear enough
- **No premature optimization:** Current performance is acceptable

### Preserve Working Patterns

- Keep Constants.js structure (it works well)
- Keep GPT fallback chain (already well-designed)
- Keep PDF generation separate (good isolation)
- Keep test format (manual execution in Apps Script)

---

## Success Criteria

- [ ] Tool6.js reduced to ~4,000 lines
- [ ] All existing tests still pass
- [ ] New test coverage for shared limits, AQ, catch-ups
- [ ] No regression in user-facing functionality
- [ ] Code review confirms improved readability
- [ ] Documentation updated for new file structure

---

## References

- [Tool6-Consolidated-Specification.md](Tool6-Consolidated-Specification.md) - Full feature spec
- [TOOL6-DEV-STARTUP.md](TOOL6-DEV-STARTUP.md) - Development guide
- [Sprint-12-Tax-Logic-Improvements.md](Sprint-12-Tax-Logic-Improvements.md) - Latest sprint
