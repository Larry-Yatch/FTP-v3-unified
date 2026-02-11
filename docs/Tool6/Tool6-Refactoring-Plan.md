# Tool6 Refactoring Plan

**Created:** January 26, 2026
**Updated:** January 28, 2026
**Status:** In Progress - Phase 1 Complete ✓
**Priority:** Medium (Technical Debt Reduction)

---

## Executive Summary

Tool6 has grown to **20,700+ lines across 7 files**, a 29% increase since the original plan was written. The main `Tool6.js` now sits at **12,193 lines** (up from 11,252), with `buildUnifiedPage()` ballooning to **6,856 lines** - a single monolithic function.

**Recent Wins (Jan 26-28):**
- Comprehensive test suite added (1,606+ lines, 1,000+ test cases)
- Tax preference logic for shared-limit vehicles implemented
- Filing status persistence bugs fixed
- PDF generation hardened with proper error handling
- **Phase 1 Complete:** CSS extracted to `tool6-styles.html` (3,198 lines)

**Primary Goal:** Split `buildUnifiedPage()` from 6,856 lines into 5-6 phase-based component functions to enable testing and maintainability.

**Secondary Goal:** Reduce `Tool6.js` from 12,193 lines to ~5,000 lines by extracting client-side JavaScript and HTML templates.

---

## Current State Analysis (Updated Jan 28)

### File Inventory

| File | Lines (Jan 26) | Lines (Now) | Change | Status |
|------|----------------|-------------|--------|--------|
| Tool6.js | 11,252 | 8,998 | -2,254 | **Phase 1 done - needs Phase 2 splitting** |
| tool6-styles.html | - | 3,198 | +3,198 | **NEW - CSS extracted from buildUnifiedPage** |
| Tool6Tests.js | 1,003 | 2,609 | +1,606 | **Greatly improved** |
| Tool6Report.js | 1,033 | 2,427 | +1,394 | **Enhanced** |
| Tool6Constants.js | 1,454 | 1,758 | +304 | Good |
| Tool6GPTAnalysis.js | 824 | 1,135 | +311 | Good |
| Tool6Fallbacks.js | 404 | 579 | +175 | Good |
| tool6.manifest.json | 70 | 70 | 0 | Good |
| **TOTAL** | **16,040** | **20,774** | **+4,734** | |

### Tool6.js Breakdown (Updated)

| Section | Lines | Content |
|---------|-------|---------|
| 29-711 | ~680 | **Data Input & Resolution** - Upstream tool integration, resolveClientData() |
| 753-930 | ~180 | **Profile Classification** - Decision tree, domain weighting |
| 1,043-1,753 | ~710 | **Vehicle Allocation** - Eligibility, priority ordering, coreAllocate() |
| 1,847-2,295 | ~450 | **Projections & Validation** - Future value, constraints |
| 2,295-10,956 | ~8,660 | **HTML Generation** - buildUnifiedPage() monster + helpers |
| 11,011-11,653 | ~640 | **Scenario Management** - Save/load/compare/delete |
| 10,977-11,863 | ~900 | **Utilities & Error Handling** - PDF triggers, name fallbacks |

### Top 10 Largest Functions

| Function | Lines | Notes |
|----------|-------|-------|
| buildUnifiedPage() | 6,856 | **CRITICAL** - Must be split |
| buildCalculatorSection() | 576 | Good candidate for extraction |
| buildBackupQuestionsHtml() | 388 | Self-contained |
| buildQuestionnaireHtml() | 371 | Self-contained |
| getEligibleVehicles() | 339 | 10+ embedded rules |
| getClientName() | 330 | Complex fallback chain |
| generatePDF() | 264 | Integration point |
| saveScenario() | 214 | Scenario persistence |
| buildProjectionsSection() | 198 | Self-contained |
| classifyProfile() | 176 | Decision tree |

### Critical Issues Identified

#### 1. The buildUnifiedPage Monster (6,856 lines)

**Structure:**
```
Lines 3313-3380:   Opening & setup (67 lines)
Lines 3380-4000:   CSS styles (620 lines) - EMBEDDED IN FUNCTION
Lines 4000-6735:   Conditional content selection (2,735 lines)
Lines 6735-10159:  Dynamic HTML construction (3,424 lines)
Lines 10159+:      Closing tags & dependencies
```

**Problems:**
- Impossible to test individual sections
- CSS embedded in function (620 lines)
- 3,424 lines of template literal HTML
- Complex nested conditionals for section visibility
- No separation of concerns

#### 2. Data Resolution Complexity (156 lines)

`resolveClientData()` has a complex fallback chain:
1. Fetch from upstream tools (Tool 1-5)
2. Merge with saved pre-survey data
3. Calculate fallback values for missing data
4. Tool 2 uses `data.data.marital`, Tool 4 uses flat `data` structure

**Problem:** Hard to trace which value came from where, duplicate fallback logic.

#### 3. Critical CSS Rules (DO NOT REMOVE)

The vehicle sliders require exact CSS rules (lines 5431-5506):
```css
.vehicle-slider::-webkit-slider-runnable-track { ... }
.vehicle-slider::-moz-range-track { ... }
.vehicle-slider::-webkit-slider-thumb { margin-top: -7px; ... }
```

**Has broken 5+ times** when CSS was refactored. Must be preserved.

#### 4. Dual Filing Status Fields

Bug fixed Jan 27-28: Filing status must be set in BOTH places:
- `formData.filingStatus`
- `formData.a6_filingStatus`

Any code touching filing status must update both fields.

---

## Recent Changes (Jan 26-28, 2026)

### Major Commits

| Commit | Description | Impact |
|--------|-------------|--------|
| 5dd91f3 | Add comprehensive test suite | +1,606 lines of tests |
| 7ee1be9 | Respect tax preference for shared-limit vehicles | Core allocation logic |
| fae74b4, cb4dc0a | Fix filing status persistence | Data integrity |
| 656cca5 | No hardcoded defaults in PDF | Error handling |
| 07554b6 | Comparison PDF enhancements, loading overlays | UX |

### Test Coverage Improvements

**Before (Jan 26):**
- Basic tests only
- No golden file scenarios
- No random invariant testing

**After (Jan 28):**
- 6 main test functions
- 30+ golden file scenarios (deterministic cases for all 9 profiles)
- 1,000+ random test combinations via invariant checking
- Strong allocation algorithm coverage

### What's Now Well-Tested

| Area | Coverage | Notes |
|------|----------|-------|
| Profile classification | Strong | All 9 profiles in testSprint12 |
| Allocation algorithm | Very Strong | 1,000+ random tests |
| Shared limit enforcement | Strong | Bidirectional testing |
| Tax preference logic | Strong | Now/Later/Both tested |
| Data input layer | Strong | testSprint1_1 |

### What Still Needs Tests

| Area | Coverage | Notes |
|------|----------|-------|
| HTML generation | Weak | Only existence checks |
| Scenario save/load | Weak | No dedicated tests |
| PDF generation | Weak | Manual verification only |
| Client-side JavaScript | None | Embedded in HTML |

---

## Revised Refactoring Phases

### Phase 1: Extract CSS to Separate File ✓ COMPLETE

**Effort:** 2-4 hours | **Risk:** Low | **Impact:** Medium
**Completed:** January 28, 2026

**Goal:** Move ~3,200 lines of CSS out of buildUnifiedPage into a dedicated file.

**Result:** Tool6.js reduced from 12,193 to 8,998 lines (26% reduction).

#### What We Tried (and What Failed)

**Attempt 1: JS Constant in separate file** ❌
```javascript
// Tool6Styles.js
const TOOL6_STYLES = `...css...`;

// Tool6.js - buildUnifiedPage()
<style>${TOOL6_STYLES}</style>
```
**Problem:** GAS file loading order meant `TOOL6_STYLES` was undefined when `buildUnifiedPage()` executed. Sliders could only click, not drag.

**Attempt 2: HTML file with HtmlService** ✓
```javascript
// tool6-styles.html
<style>...css...</style>

// Tool6.js - buildUnifiedPage()
const tool6Styles = HtmlService.createHtmlOutputFromFile('tools/tool6/tool6-styles').getContent();
// In template:
${tool6Styles}
```
**Result:** Works correctly. Follows same pattern as `shared/styles.html`.

#### Key Lesson Learned

> **GAS Global Constants:** Don't rely on JS constants defined in separate files being available during template literal evaluation. Use `HtmlService.createHtmlOutputFromFile()` for any content that needs to be injected into HTML templates.

**Pre-commit check (now checks HTML file):**
```bash
grep -n "webkit-slider-runnable-track\|moz-range-track" tools/tool6/tool6-styles.html
```

**Verification (all passed):**
1. ✓ Page renders correctly
2. ✓ All styles applied
3. ✓ Sliders draggable (not just clickable)

---

### Phase 2: Split buildUnifiedPage (HIGHEST PRIORITY)

**Effort:** 8-12 hours | **Risk:** Medium-High | **Impact:** Critical

**Goal:** Break the 6,856-line monster into phase-based component functions.

---

#### Risk Assessment

**Why this is Medium-High risk:**

| Risk Factor | Concern |
|-------------|---------|
| **6,856 lines** | Massive surface area for mistakes |
| **Slider CSS** | Has broken 5+ times before - any CSS reorganization is dangerous |
| **No HTML tests** | Only existence checks, no structural validation |
| **Embedded state** | Client-side JS is tightly coupled to HTML structure |
| **Form field naming** | 4 different conventions (`a1_`, `a2_`, `backup_`, plain) - easy to miss one |
| **Navigation pattern** | `document.write()` is fragile and non-standard |
| **Filing status dual-field** | Must update both `filingStatus` AND `a6_filingStatus` |

**What could break:**
1. Sliders become unresponsive (click-only, no drag)
2. Form values lost during page transitions
3. Navigation stops working entirely
4. Phase visibility logic breaks (wrong section shows)
5. Client JS loses reference to DOM elements

**What makes it survivable:**
1. Natural boundaries exist - Phases A-E are already conceptually separate
2. Helpers already exist - `buildCalculatorSection()`, `buildQuestionnaireHtml()` can stay as-is
3. Strong allocation tests - Core logic won't silently break
4. Can do incrementally - one section at a time
5. Revert is easy - Single file, git makes rollback trivial

---

#### Recommended Approach: 5 Mini-Phases

Split Phase 2 into incremental steps:

| Step | Extract | Lines | Risk | Verification |
|------|---------|-------|------|--------------|
| 2a | `buildStyles()` | ~620 | Low | ✓ Done in Phase 1 |
| 2b | `buildHeader()` | ~77 | Low | ✓ Done - Loading overlay, nav, welcome, profile banner, blocker extracted |
| 2c | `buildAmbitionSection()` | ~300 | Medium | Phase C questions render, submit works |
| 2d | `buildClientScripts()` | ~3,000 | **High** | Sliders drag, navigation works, forms submit |
| 2e | Refactor orchestrator | ~200 | Medium | All phases render correctly |

**After each extraction:**
1. Deploy to test environment
2. Test slider drag functionality manually
3. Test form submission and navigation
4. If anything breaks, you know exactly which change caused it

---

#### Proposed Structure

```javascript
// Tool6.js - buildUnifiedPage becomes orchestrator

function buildUnifiedPage(inputs, allocation, projections, profile) {
  const state = this.computePageState(inputs, allocation, projections, profile);

  return this.buildPageShell({
    styles: this.buildStyles(),
    header: this.buildHeader(state),
    content: this.buildPhaseContent(state),
    scripts: this.buildClientScripts(state)
  });
}

function buildPhaseContent(state) {
  // Phase A: Backup questions (if needed)
  if (state.needsBackupQuestions) {
    return this.buildBackupQuestionsHtml(state);
  }

  // Phase B: Questionnaire
  if (!state.hasProfile) {
    return this.buildQuestionnaireHtml(state);
  }

  // Phase C: Ambition Quotient (optional)
  if (state.needsAmbitionQuotient) {
    return this.buildAmbitionSection(state);
  }

  // Phase D: Calculator
  if (state.showCalculator) {
    return this.buildCalculatorSection(state);
  }

  // Phase E: Projections & Scenarios
  return this.buildProjectionsSection(state);
}
```

#### Component Functions to Create

| Function | Lines | Purpose |
|----------|-------|---------|
| buildPageShell() | ~100 | DOCTYPE, head, body wrapper |
| buildStyles() | ~620 | Extract CSS from function (Phase 1) |
| buildHeader() | ~150 | Profile banner, settings |
| buildBackupQuestionsHtml() | ~388 | Already exists - keep as is |
| buildQuestionnaireHtml() | ~371 | Already exists - keep as is |
| buildAmbitionSection() | ~300 | Extract from buildUnifiedPage |
| buildCalculatorSection() | ~576 | Already exists - enhance |
| buildProjectionsSection() | ~200 | Already exists - keep as is |
| buildClientScripts() | ~3,000 | Extract client-side JS |

#### Critical Rules During Split

1. **Preserve slider CSS exactly** (lines 5431-5506)
2. **Keep navigation pattern** (`document.write()` not `location.reload()`)
3. **Maintain form field naming** (`a1_`, `a2_`, `backup_`, plain names)
4. **Test each section independently** before integration

---

### Phase 3: Extract Client-Side JavaScript

**Effort:** 6-8 hours | **Risk:** Medium | **Impact:** High

**Goal:** Create `Tool6Client.js` with all browser-executed code (~3,000 lines)

#### What to Extract

| Category | Lines | Functions |
|----------|-------|-----------|
| Slider handlers | ~500 | updateSlider(), onSliderInput(), onSliderChange() |
| State management | ~300 | getAllocationState(), setAllocationState() |
| Form validation | ~200 | validateInput(), showError(), clearErrors() |
| UI interactions | ~400 | toggleCollapsible(), switchTab(), showTooltip() |
| Scenario handlers | ~300 | onSaveScenario(), onCompareScenarios() |
| Recalculation | ~400 | recalculateProjections(), updateDisplayValues() |
| Navigation | ~500 | recalculateAllocation() (document.write pattern) |
| Utility functions | ~200 | formatCurrency(), formatPercent(), debounce() |

#### Module Structure

```javascript
// Tool6Client.js

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
  }

  // === SLIDER HANDLERS ===
  // Includes shared limit enforcement (401k Trad+Roth, IRA Trad+Roth)
  function handleSliderChange(vehicleId, newValue) { /* ... */ }
  function enforceSharedLimit(newValue, otherValue, limit) { /* ... */ }

  // === STATE MANAGEMENT ===
  function getAllocationState() { return { ...allocationState }; }
  function updateAllocationState(vehicleId, value) { /* ... */ }

  // === NAVIGATION (CRITICAL - USE document.write PATTERN) ===
  function navigateToRecalculate(formData) {
    google.script.run
      .withSuccessHandler(function(result) {
        if (result && result.nextPageHtml) {
          document.open();
          document.write(result.nextPageHtml);
          document.close();
          window.scrollTo(0, 0);
        }
      })
      .recalculateAllocation(formData);
  }

  // Public API
  return {
    init,
    handleSliderChange,
    getAllocationState,
    navigateToRecalculate
  };
})();
```

---

### Phase 4: Consolidate Data Resolution

**Effort:** 4-6 hours | **Risk:** Medium | **Impact:** High

**Goal:** Create single source of truth for data resolution with clear precedence rules.

#### Current Problem

Data comes from 8+ sources with inconsistent field names:
- Tool 2: `data.data.marital`, `annualIncome`
- Tool 4: `data.multiply`, `monthlyIncome`
- Pre-survey: `a1_grossIncome`, `a6_filingStatus`
- Backup: `backup_filingStatus`

#### Proposed Structure

```javascript
// Tool6DataResolver.js (or section in Tool6.js)

const DATA_FIELD_MAP = {
  grossIncome: {
    sources: ['tool4.multiply.annualIncome', 'tool2.data.annualIncome', 'preSurvey.a1_grossIncome'],
    transform: (val) => parseFloat(val) || 0
  },
  filingStatus: {
    sources: ['tool4.filingStatus', 'preSurvey.a6_filingStatus', 'preSurvey.backup_filingStatus'],
    transform: (val) => val || 'single'
  },
  // ... other fields
};

function resolveField(fieldName, toolData, preSurveyData) {
  const config = DATA_FIELD_MAP[fieldName];
  if (!config) return null;

  for (const source of config.sources) {
    const value = getNestedValue(source, { toolData, preSurveyData });
    if (value !== undefined && value !== null && value !== '') {
      return config.transform(value);
    }
  }

  return null; // No value found
}
```

---

### Phase 5: DRY Up Repeated Patterns (Quick Wins)

**Effort:** 2-3 hours | **Risk:** Low | **Impact:** Medium

#### 5.1 Extract Shared Limit Utility

Currently duplicated 3+ times:

```javascript
// Utility function
function enforceSharedLimit(newValue, otherValue, combinedLimit) {
  const combined = newValue + otherValue;
  if (combined > combinedLimit) {
    return Math.max(0, combinedLimit - otherValue);
  }
  return newValue;
}

// Usage
const adjusted401kTrad = enforceSharedLimit(newTradValue, current401kRoth, IRS_LIMITS.ANNUAL_401K);
```

#### 5.2 Extract Projection Display Template

Three similar blocks for Retirement, Education, Health:

```javascript
function buildProjectionCard(domain, data) {
  return `
    <div class="projection-card projection-${domain.toLowerCase()}">
      <h4>${domain} Projection</h4>
      <div class="projection-value">${formatCurrency(data.projectedBalance)}</div>
      <div class="projection-details">
        <span>Monthly: ${formatCurrency(data.monthlyContribution)}</span>
        <span>Years: ${data.yearsToGoal}</span>
      </div>
    </div>
  `;
}
```

---

### Phase 6: Expand Test Coverage (Lower Priority Now)

**Status:** Most critical tests already added in Sprint 12/13

**Remaining gaps:**

| Area | Priority | Tests Needed |
|------|----------|--------------|
| HTML generation | Medium | Section existence, structure validation |
| Scenario save/load | Medium | Round-trip persistence tests |
| PDF generation | Low | Mock-based validation |
| Client-side JS | Low | Browser-based testing (out of scope for GAS) |

---

## Proposed Final File Structure

```
tools/tool6/
├── Tool6.js              (~5,000 lines)  Server logic, orchestration
├── Tool6Client.js        (~3,000 lines)  Browser JavaScript (NEW)
├── Tool6Templates.js     (~2,500 lines)  HTML builders (OPTIONAL)
├── Tool6Constants.js     (1,758 lines)   No change
├── Tool6Report.js        (2,427 lines)   No change
├── Tool6GPTAnalysis.js   (1,135 lines)   No change
├── Tool6Fallbacks.js     (579 lines)     No change
├── Tool6Tests.js         (2,609 lines)   Continue expanding
└── tool6.manifest.json   (updated)       New dependencies
```

**Note:** Tool6Templates.js is optional - the phase-based split of buildUnifiedPage may be sufficient.

---

## Implementation Sequence (Revised)

### Recommended Order

| Step | Phase | Effort | Dependencies | Priority |
|------|-------|--------|--------------|----------|
| 1 | Phase 1 (Extract CSS) | 2-4 hrs | None | High |
| 2 | Phase 2a-2b (Header extraction) | 2-3 hrs | Phase 1 | High |
| 3 | Phase 2c (Ambition section) | 2-3 hrs | Phase 2b | High |
| 4 | Phase 2d (Client scripts) | 4-6 hrs | Phase 2c | **Critical - High Risk** |
| 5 | Phase 2e (Orchestrator refactor) | 2-3 hrs | Phase 2d | High |
| 6 | Phase 5 (DRY patterns) | 2-3 hrs | Phase 2 | Medium |
| 7 | Phase 4 (Data resolution) | 4-6 hrs | None | Medium |
| 8 | Phase 3 (Extract client JS file) | 6-8 hrs | Phase 2 | Medium |
| 9 | Phase 6 (Expand tests) | 2-4 hrs | Phases 1-5 | Low |

**Total Estimated Effort:** 26-40 hours

### Milestones

1. **Milestone 1:** Phase 1 complete - CSS extracted to constant
2. **Milestone 2:** Phase 2a-2c complete - Header and Ambition sections extracted
3. **Milestone 3:** Phase 2d complete - Client scripts extracted (highest risk step done)
4. **Milestone 4:** Phase 2e complete - buildUnifiedPage is now an orchestrator - **Major win**
5. **Milestone 5:** Phases 3-6 complete - Full modularization and test coverage

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
- **Keep slider CSS exactly as is** (critical)
- **Keep navigation pattern** (document.write, not location.reload)
- **Keep dual filing status fields** (a6_filingStatus AND filingStatus)

---

## Critical Warnings (DO NOT IGNORE)

### 1. Slider CSS (Lines 5431-5506)

```css
/* CRITICAL: SLIDER DRAG FUNCTIONALITY - DO NOT REMOVE OR MODIFY */
.vehicle-slider::-webkit-slider-runnable-track { ... }
.vehicle-slider::-moz-range-track { ... }
.vehicle-slider::-webkit-slider-thumb { margin-top: -7px; ... }
```

**Pre-commit check:**
```bash
grep -n "webkit-slider-runnable-track\|moz-range-track" tools/tool6/Tool6.js
```

### 2. Navigation Pattern

```javascript
// CORRECT - Use document.write()
google.script.run
  .withSuccessHandler(function(result) {
    document.open();
    document.write(result.nextPageHtml);
    document.close();
  })
  .serverFunction(params);

// WRONG - Do not use
window.location.reload();  // BREAKS IN GAS
window.location.href = x;  // BREAKS IN GAS
```

### 3. No Hardcoded Defaults for PDF

```javascript
// WRONG - Old pattern that caused incorrect advice
const age = inputs.age || 40;  // NO HARDCODED DEFAULTS

// CORRECT - Fail with clear error
if (!inputs.age) {
  throw new Error('Age is required for PDF generation');
}
```

### 4. Dual Filing Status Fields

```javascript
// CORRECT - Set BOTH fields
formData.filingStatus = newStatus;
formData.a6_filingStatus = newStatus;

// WRONG - Only setting one
formData.filingStatus = newStatus;  // Missing a6_ version
```

---

## Success Criteria

- [ ] Tool6.js reduced to ~5,000 lines
- [ ] buildUnifiedPage() split into 5-6 component functions
- [ ] CSS extracted to constant
- [ ] All existing tests still pass
- [ ] Slider drag functionality preserved
- [ ] Navigation pattern preserved
- [ ] No regression in user-facing functionality
- [ ] Code review confirms improved readability

---

## References

- [Tool6-Consolidated-Specification.md](Tool6-Consolidated-Specification.md) - Full feature spec
- [TOOL6-DEV-STARTUP.md](TOOL6-DEV-STARTUP.md) - Development guide
- [Sprint-12-Tax-Logic-Improvements.md](Sprint-12-Tax-Logic-Improvements.md) - Tax preference logic
- [GAS-NAVIGATION-RULES.md](../Navigation/GAS-NAVIGATION-RULES.md) - Navigation patterns

---

## Change Log

| Date | Change |
|------|--------|
| Jan 26, 2026 | Initial plan created |
| Jan 28, 2026 | Major revision after codebase analysis: updated line counts (+4,661 lines), noted test suite improvements (+1,606 lines), revised priorities, added critical warnings, updated buildUnifiedPage analysis (now 6,856 lines) |
| Jan 28, 2026 | Reordered phases: Extract CSS is now Phase 1 (do first), Split buildUnifiedPage is now Phase 2 with mini-phases 2a-2e. Updated implementation sequence to match execution order. |
| Jan 28, 2026 | **Phase 1 Complete:** Extracted 3,198 lines of CSS to `tool6-styles.html`. Initial approach using JS constant failed (GAS loading order issue). Switched to HtmlService pattern. Tool6.js reduced from 12,193 to 8,998 lines. Commits: fa30a50, fe5e393. |
| Jan 28, 2026 | **Phase 2b Complete:** Extracted `buildHeader()` function (~77 lines of HTML). Contains loading overlay, navigation header, welcome message, profile banner, and blocker message. Tool6.js now 9,018 lines (+20 net due to function overhead). Slider CSS verified intact. |
