# Tool 6: Development Startup Guide

> **Purpose:** Get any AI coder up to speed quickly for multi-session development
> **Last Updated:** January 19, 2026
> **Current Sprint:** Phase 10 (Polish) - Tool 4 Styling Alignment Complete

---

## FOR AI CODER: Start Here

**Before doing anything else:**
1. Read the "Current Status & Next Steps" section (bottom of this doc)
2. Read the "Session Handoff Protocol" section to see what was done last
3. Check the Sprint Checklist to see what's complete vs pending
4. THEN read the relevant spec sections for the current sprint

**When ending your session:**
1. Update "Session Handoff Protocol" with what you did
2. Update "Sprint Checklist" checkboxes
3. Add any new decisions to "Key Decisions Made"
4. Note any blockers or issues discovered

---

## Quick Start (Read This First)

### 1. Primary Specification Document
```
docs/Tool6/Tool6-Consolidated-Specification.md (v1.4)
```
This is the **single source of truth**. It contains:
- All algorithms with code blocks
- 32 sprints across 10 phases
- Test cases for each sprint
- Reference patterns from Tool 4

### 2. Existing Implementation
```
tools/tool6/
├── Tool6.js              # Main tool - basic skeleton implemented
├── Tool6Constants.js     # COMPLETE - all IRS limits, profiles, vehicles
└── tool6.manifest.json   # COMPLETE - tool metadata
```

### 3. Reference Implementation (Copy Patterns From)
```
tools/tool4/Tool4.js      # Same architecture, copy patterns for:
                          # - checkToolCompletion()
                          # - savePreSurvey() / getPreSurvey()
                          # - saveScenario()
                          # - buildUnifiedPage()
```

### 4. Legacy Code (Algorithm Reference Only)
```
apps/Tool-6-retirement-blueprint-tool/scripts/
├── code.js               # 170KB - allocation algorithms, FV calculations
└── Document_Narratives.js # Personalized messaging patterns
```
**Warning:** Do NOT copy legacy code directly. Use spec algorithms which fix known bugs.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Tool 6: Single-Page Calculator                   │
├─────────────────────────────┬───────────────────────────────────────┤
│      INPUT PANEL (Left)     │        OUTPUT PANEL (Right)           │
├─────────────────────────────┼───────────────────────────────────────┤
│ Pre-Survey (Collapsible)    │ Profile Classification                │
│ Current State (Required)    │ Vehicle Allocation Sliders            │
│ Investment Score            │ Projections                           │
│ Tax Strategy Toggle         │ Scenario Management                   │
└─────────────────────────────┴───────────────────────────────────────┘
```

**Data Flow:**
1. Tools 1-5 data pulled → Pre-populate fields
2. User answers 7-20 questions → Profile classification
3. Ambition Quotient calculated → Domain weights
4. Waterfall allocation → Vehicle recommendations
5. User adjusts sliders → Real-time recalculation
6. Save scenario → TOOL6_SCENARIOS sheet

---

## Key Concepts to Understand

### 1. Monthly Budget Source
Tool 4's `multiply` field = Monthly retirement savings budget (M bucket from M/E/F/J)
```javascript
const monthlyBudget = toolStatus.tool4Data?.multiply || 0;
```

### 2. Profile Classification (9 Profiles)
Decision tree - first match wins. See spec section "Profile Classification System".

### 3. Ambition Quotient (Phase C)
Weights allocation across Retirement/Education/Health domains based on:
- **Importance**: 1-7 scale rating per domain
- **Anxiety**: 1-7 scale rating per domain
- **Motivation**: 1-7 scale rating per domain
- **Time-discounted urgency**: Using monthly discount rate formula
- **Tie-breaker**: Asked only when all 3 domains are active

**Adaptive Logic**: Only asks about active domains:
- Retirement: Always asked (3 questions)
- Education: Only if hasChildren = Yes (3 questions)
- Health: Only if hsaEligible = Yes (3 questions)
- Tie-breaker: Only if all 3 domains active (1 question)

### 4. Waterfall Allocation
1. Non-discretionary seeds first (employer match)
2. Domain budgets from Ambition Quotient
3. Leftover cascade: Education → Health → Retirement
4. Overflow to Taxable Brokerage (Family Bank)

### 5. Shared Limits
- 401(k) Traditional + Roth share $23,500 limit
- IRA Traditional + Roth share $7,000 limit
- Sliders must enforce combined limits

### 6. HSA Coverage Inference
Inferred from filing status (added in v1.4):
- MFJ → Family ($8,550/yr)
- Single/MFS → Individual ($4,300/yr)

### 7. Questionnaire Summary (24 Questions)

| Section | Questions | Notes |
|---------|-----------|-------|
| Core (9) | Q1-Q9 | Q7 conditional on Q6=Yes, Q8 conditional on Q5=Yes |
| ROBS Qualifiers (3) | Q10-Q12 | Only show if Q4="Interested" (not "Yes") |
| Education Domain (4) | Q13-Q16 | Q14-Q15 conditional on Q13=Yes |
| Current Balances (4) | Q17-Q20 | Q17 on Q5=Yes, Q19 on Q9=Yes, Q20 on Q13=Yes |
| Current Contributions (4) | Q21-Q24 | Q21 on Q5=Yes, Q23 on Q9=Yes, Q24 on Q13=Yes |

**Education Domain Design:** "Combined CESA" approach - tracks total education savings across ALL children (529, Coverdell ESA, UTMA), not per-child accounts.

---

## Critical Files to Read Before Coding

| Priority | File | Why |
|----------|------|-----|
| 1 | `docs/Tool6/Tool6-Consolidated-Specification.md` | Complete spec with all algorithms |
| 2 | `docs/Middleware/middleware-mapping.md` | **Data structure reference for Tools 1-5** |
| 3 | `tools/tool6/Tool6Constants.js` | All constants already implemented |
| 4 | `tools/tool6/Tool6.js` | Current implementation state |
| 5 | `tools/tool4/Tool4.js` | Reference patterns (same architecture) |
| 6 | `CLAUDE.md` | GAS navigation rules (CRITICAL) |

---

## GAS Navigation Rules (MUST FOLLOW)

From CLAUDE.md - **NEVER** use:
```javascript
// WRONG - Will break in GAS
window.location.reload();
window.location.href = '...';
```

**ALWAYS** use:
```javascript
// CORRECT - GAS pattern
google.script.run
  .withSuccessHandler(function(result) {
    if (result && result.nextPageHtml) {
      document.open();
      document.write(result.nextPageHtml);
      document.close();
      window.scrollTo(0, 0);
    }
  })
  .serverFunction(params);
```

---

## Sprint Checklist

### Phase 0: Foundation ✅ COMPLETE
- [x] Sprint 0.1: Directory & Manifest
- [x] Sprint 0.2: Skeleton Tool & Registration
- [x] Sprint 0.3: Basic Page Layout

### Phase 1: Data Layer ✅ COMPLETE
- [x] Sprint 1.1: Upstream Data Pull - ✅ **COMPLETE** (Jan 11, 2026)
- [x] Sprint 1.2: Fallback/Backup Questions - ✅ **COMPLETE** (Jan 11, 2026)

### Phase 2: Profile Classification ✅ COMPLETE
- [x] Sprint 2.1: Classification Input Gathering - ⏭️ **SKIPPED** (covered by Sprint 1.2)
- [x] Sprint 2.2: Decision Tree Implementation - ✅ **COMPLETE** (Jan 11, 2026)
- [x] Sprint 2.3: ROBS Qualification Flow - ⏭️ **SKIPPED** (covered by Sprint 2.2)
- [x] Sprint 2.4: Profile Display UI - ✅ **COMPLETE** (Jan 11, 2026) - Two-phase questionnaire with profile cards

### Phase 3: Ambition Quotient ✅ COMPLETE
- [x] Sprint 3.1: Priority Ranking UI - ✅ **REPLACED** with Ambition Quotient UI (Phase C)
- [x] Sprint 3.2: Ambition Quotient Algorithm - ✅ **COMPLETE** (Jan 17, 2026) - `computeDomainsAndWeights()`

### Phase 4: Vehicle Allocation ✅ COMPLETE
- [x] Sprint 4.1: Vehicle Eligibility - ✅ **COMPLETE** (Jan 16, 2026)
- [x] Sprint 4.2: Vehicle Priority Order - ✅ **COMPLETE** (Jan 16, 2026)
- [x] Sprint 4.3: Waterfall Allocation (Core) - ✅ **COMPLETE** (Jan 16, 2026)
- [x] Sprint 4.4: Tax Strategy Reordering & Roth Phase-Out - ✅ **COMPLETE** (Jan 16, 2026)
- [x] Sprint 4.5: IRS Limit Validation - ✅ **COMPLETE** (Jan 16, 2026)

### Phase 5: Calculator UI ✅ COMPLETE
- [x] Sprint 5.1: Current State Inputs - ✅ **COMPLETE** (Jan 17, 2026)
- [x] Sprint 5.2: Investment Score Display - ✅ **COMPLETE** (Jan 17, 2026)
- [x] Sprint 5.3: Tax Strategy Toggle - ✅ **COMPLETE** (Jan 17, 2026)
- [x] Sprint 5.4: Employer Match UI - ✅ **COMPLETE** (Jan 17, 2026)
- [x] Sprint 5.5: Vehicle Sliders - ✅ **COMPLETE** (Jan 17, 2026) - With coupled slider behavior
- [x] Sprint 5.6: Calculate Button & Recalc - ✅ **COMPLETE** (Jan 17, 2026)
- [x] **Sprint 5.7: Coupled Slider Behavior** - ✅ **COMPLETE** (Jan 17, 2026) - Added post-spec

### Phase 6: Projections ✅ COMPLETE
- [x] Sprint 6.1: Projections Calculation - ✅ **COMPLETE** (Jan 17, 2026)
- [x] Sprint 6.2: Projections Display - ✅ **COMPLETE** (Jan 17, 2026)
- [x] Sprint 6.3: Tax Breakdown Display - ✅ **COMPLETE** (Jan 17, 2026)

### Phase 7: Scenario Management ✅ COMPLETE
- [x] Sprint 7.1: Save Scenario - ✅ **COMPLETE** (Jan 18, 2026) - TOOL6_SCENARIOS sheet, `saveScenario()` function
- [x] Sprint 7.2: Load Scenario - ✅ **COMPLETE** (Jan 18, 2026) - `getScenarios()`, dropdown selection, restore state
- [x] Sprint 7.3: Compare Scenarios - ✅ **COMPLETE** (Jan 18, 2026) - Side-by-side comparison with comprehensive insights
- [x] Sprint 7.4: PDF Generation - ✅ **COMPLETE** (Jan 18, 2026) - Single + Comparison reports with GPT integration

### Phase 8: Trauma Integration
- [ ] Sprint 8.1: Trauma Insights Display

### Phase 9: GPT Integration ✅ MERGED INTO PHASE 7.4
- [x] Sprint 9.1: GPT Analysis - ✅ **MERGED** into Sprint 7.4 (Tool6GPTAnalysis.js)
- [x] Sprint 9.2: Fallbacks - ✅ **MERGED** into Sprint 7.4 (Tool6Fallbacks.js)

### Phase 10: Polish
- [ ] Sprint 10.1: Error Handling
- [ ] Sprint 10.2: Edge Cases
- [x] Sprint 10.3: UI Polish - ✅ **COMPLETE** (Jan 19, 2026) - Tool 4 styling alignment

---

## Current Status & Next Steps

### What's Done (Phase 0 Complete)

| Sprint | Status | Evidence |
|--------|--------|----------|
| 0.1 Directory & Manifest | ✅ Complete | `tools/tool6/` exists, `tool6.manifest.json` complete |
| 0.2 Skeleton & Registration | ✅ Complete | `Tool6.js` exists, registered in `Code.js:177-199` |
| 0.3 Basic Page Layout | ✅ Complete | `buildUnifiedPage()` with 4 collapsible sections |

**Tool6Constants.js** - FULLY COMPLETE with:
- All IRS 2025 limits (401k, IRA, HSA, catch-ups, phase-outs)
- 9 profile definitions with characteristics
- Vehicle definitions with tax treatment and limits
- Vehicle priority order by profile
- Domain definitions (Retirement/Education/Health/Overflow)
- Projection config, tax strategy options, employer match formulas

**Tool6.js** - Skeleton with working patterns:
- `render()` - Returns full HTML page with styles
- `checkToolCompletion()` - Pulls Tools 1-5 data via DataService
- `getPreSurvey()` / `savePreSurvey()` - Pre-survey persistence
- `getPrefillData()` - Extracts age, income, budget from Tool 2/4
- `classifyProfile()` - **STUB** returns Profile 7 (needs Sprint 2)
- `calculateAllocation()` - **STUB** returns empty (needs Sprint 4)
- `buildUnifiedPage()` - 4 collapsible sections with placeholder content
- `renderError()` - Error page rendering

### What's NOT Done

| Component | Status | Sprint |
|-----------|--------|--------|
| Upstream data field mapping | Partial | 1.1 |
| Backup questions UI | Not started | 1.2 |
| TOOL6_SCENARIOS sheet | Not started | 1.3 |
| Profile classification logic | Stub only | 2.1-2.4 |
| Ambition Quotient | Not started | 3.1-3.2 |
| Waterfall allocation | Stub only | 4.1-4.5 |
| Vehicle sliders | Not started | 5.5 |
| Projections engine | Not started | 6.1-6.3 |
| Scenario save/load/compare | Stub only | 7.1-7.4 |
| GPT integration | Not started | 9.1-9.2 |

### Next Session: Start Phase 1

**Sprint 1.1: Upstream Data Pull**

Goal: Map all fields from Tools 1-5 per spec Data Sources table

Tasks:
1. Update `checkToolCompletion()` to return mapped fields:
   ```javascript
   return {
     // Existing flags
     hasTool1, hasTool2, hasTool3, hasTool4, hasTool5,
     // NEW: Mapped fields per spec
     age: tool2Data?.age,
     income: tool2Data?.income,
     employmentType: tool2Data?.employmentType,
     businessOwner: tool2Data?.businessOwner,
     filingStatus: tool2Data?.maritalStatus === 'Married' ? 'MFJ' : 'Single',
     monthlyTakeHome: tool4Data?.monthlyIncome,
     yearsToRetirement: tool4Data?.goalTimeline,
     monthlyBudget: tool4Data?.multiply,
     investmentScore: tool4Data?.investmentScore || 4,
     traumaPattern: tool1Data?.winningPattern,
     // ... etc
   };
   ```
2. Create `getDataStatus(clientId)` to return availability summary
3. Update `buildUnifiedPage()` to show status badges (green/yellow/red)

Test Cases:
- Client with all Tool 1-5 data → all fields populated, green badges
- Client with partial data → some fields null, yellow badges
- New client → all null, red badges

Reference: Spec section "Data Sources" (lines 96-111) and "Cross-Tool Data Pull"

---

## Testing Commands

```bash
# Navigate to tool in browser
# Add ?route=tool6&clientId=TEST001 to your GAS web app URL

# Check for forbidden navigation patterns before committing
grep -rn "window.location.reload\|location.reload" tools/tool6/

# Check for escaped apostrophe issues in template literals
grep -n "\\\\'.*message:" tools/tool6/
```

---

## Common Pitfalls

### 1. Tool 4 is REQUIRED
Tool 6 cannot function without Tool 4 data (monthly budget comes from there).
```javascript
if (!toolStatus.hasTool4 || monthlyBudget <= 0) {
  throw new Error('Tool 4 must be completed first');
}
```

### 2. Employer Match is Non-Discretionary
Employer match does NOT come from user's budget - it's "free money".
- Add to allocation display separately
- Does count against 401(k) total limit

### 3. HSA Catch-Up Age is 55, Not 50
Different from retirement accounts!

### 4. Shared Limits Between Vehicles
401(k) Trad + Roth = $23,500 combined
IRA Trad + Roth = $7,000 combined

### 5. Template Literal Apostrophes
In GAS with document.write(), avoid escaped apostrophes:
```javascript
// BAD - will break
message: 'You\'re at ' + value

// GOOD - use full words
message: 'You are at ' + value
```

---

## Cross-Session Memory

### Using This Document
This startup doc serves as persistent memory across sessions. **Always update the "Session Handoff Protocol" section before ending a session.**

### Key Decisions Made
| Decision | Rationale | Date |
|----------|-----------|------|
| HSA coverage inferred from filing status | Avoids extra question; MFJ=Family, Single/MFS=Individual | Jan 9, 2026 |
| Tool 4 is REQUIRED (no backup) | Monthly budget must come from Tool 4's M bucket allocation | Jan 9, 2026 |
| Profile 7 is default | Foundation Builder is the catch-all for standard W-2 employees | Jan 9, 2026 |
| Use spec algorithms, not legacy code | Legacy has known bugs (e.g., Profile 8 classification) | Jan 9, 2026 |
| **Always consult middleware-mapping.md** | Canonical reference for tool data structures; prevents data path bugs | Jan 11, 2026 |
| **Gross Income & Years to Retirement must be asked in Tool 6** | Tool 2 only has clarity scores (not dollar amounts); Tool 4 goalTimeline is categorical goal priority, not retirement years | Jan 11, 2026 |
| **Education uses "Combined CESA" approach** | Track total education savings across ALL children (529, Coverdell ESA, UTMA), not per-child accounts; matches legacy Tool 6 and simplifies UI | Jan 11, 2026 |
| **ROBS qualifiers only for "Interested"** | If user already uses ROBS ("Yes"), they don't need qualification questions; qualifiers only show for "Interested" | Jan 11, 2026 |
| **Combined balances (no Trad/Roth split)** | Keep 401k and IRA balances combined for MVP; Tool 6 allocates FUTURE contributions, not existing funds; same growth rate for projections; can add "Advanced Mode" later if needed | Jan 11, 2026 |
| **Tax preference asked for ALL profiles** | Required for allocation calculations - determines Roth vs Traditional prioritization. Previously only asked as classification tie-breaker for W-2 employees. | Jan 17, 2026 |
| **Rich Ambition Quotient over simple ranking** | Legacy algorithm used 9 questions (importance/anxiety/motivation per domain) + 3 tie-breakers. Simple 1-2-3 ranking lacked psychological depth. Adaptive design skips irrelevant domains. | Jan 17, 2026 |
| **Always render Phase A (hidden when profile exists)** | Fixes bug where "Change" button did nothing. Elements must exist in DOM for JS handlers to work. | Jan 17, 2026 |
| **Coupled sliders use ORIGINAL proportions** | When one slider moves, redistribute delta among others using ORIGINAL algorithm proportions, not current amounts. Preserves algorithm's intelligence. | Jan 17, 2026 |
| **Zero vehicles can re-enter at original proportion** | When user sets vehicle to $0, it's effectively "paused". Moving it up re-enters it with its original algorithm-calculated proportion. | Jan 17, 2026 |
| **Locked vehicles excluded from redistribution** | Locked sliders don't participate in coupled adjustment. Remaining unlocked vehicles' proportions are renormalized. | Jan 17, 2026 |
| **Store IRS limits separately from effective limits** | IRS limits are static per vehicle. Effective limits = min(IRS limit, budget). When budget changes, recalculate effective limits and update slider max values. | Jan 17, 2026 |
| **Education vehicle choice (529 vs Coverdell)** | User selects preferred vehicle: 529 (no income limit, college), Coverdell ($2k/child, K-12+college), or Both. Dynamic Coverdell limit = $2,000 × numChildren. | Jan 17, 2026 |
| **Family Bank is overflow (lowest priority)** | When increasing a vehicle, pull from Family Bank first. When decreasing, redistribute to other vehicles first (up to their limits), only overflow goes to Family Bank. | Jan 17, 2026 |

### Design Patterns Established
1. **Single-page calculator** - Same as Tool 4, not multi-phase like Tools 1-3
2. **Pre-survey → Calculate → Adjust** - User answers questions, gets recommendation, can adjust with sliders
3. **Server-side classification, client-side recalc** - Heavy lifting on server, sliders are instant JS
4. **Scenario persistence** - Save to TOOL6_SCENARIOS sheet, load/compare later

### UI Style Alignment with Tool 4

**CRITICAL:** All UI components must match Tool 4 patterns for consistency. See spec section "UI Style Requirements (Tool 4 Alignment)" for full details.

| Pattern | Tool 4 Way | NOT This |
|---------|------------|----------|
| Submit button | `.submit-btn` (gold, pill shape) | `.btn-primary` (purple, square) |
| Form input background | `rgba(0, 0, 0, 0.3)` | `rgba(255, 255, 255, 0.05)` |
| Loading overlay | Static HTML + `.show` class toggle | Dynamically created element |
| Error messages | `.error-message` + `.show` class | Inline `style.display` |
| Button disable | `disabled = true` + `opacity = 0.5` | Just `disabled` |

**Reference files:**
- `tools/tool4/Tool4.js` - Lines 1393-1479 (CSS), Lines 4483-4534 (JS patterns)
- `docs/Tool6/Tool6-Consolidated-Specification.md` - Section "UI Style Requirements"

---

## Session Handoff Protocol

When ending a session, update this section:

### Last Session Summary
- **Date:** January 19, 2026
- **What was done:**
  - ✅ **Sprint 10.3: UI Polish - Tool 4 Styling Alignment**
  - Applied Tool 4 styling to Tool 6 for consistency across the application:
    - **Gold pill buttons:** btn-primary, btn-secondary with hover effects
    - **Vehicle slider containers:** Card-style with padding (20px), border-radius (10px)
    - **Slider header layout:** New vehicle-slider-header, vehicle-slider-title, vehicle-slider-value structure
    - **Larger slider thumb:** 24px (vs 18px) with 3px border
    - **Gradient fill:** linear-gradient(90deg, #4f46e5, #7c3aed)
    - **Locked state:** Gold gradient fill, gold thumb, "🔒 Locked" text
    - **Lock button:** Tool 4 style with text (Locked/Unlocked)
    - **Vehicle descriptions:** Italic helper text explaining tax treatment for each vehicle
  - Removed conflicting duplicate CSS definitions that were causing layout issues
  - Updated responsive styling for new card-based layout
- **Current state:** Phase 10 Polish in progress. UI now matches Tool 4 styling.
- **Next task:** Continue Phase 10 (Polish) or Phase 8 (Trauma Integration)
- **Blockers:** None

### Previous Session (January 18, 2026 PM)
- ✅ Phase 7 Complete - Sprint 7.4 PDF Generation
- Created Tool6GPTAnalysis.js, Tool6Fallbacks.js, Tool6Report.js
- GPT integration with trauma-informed context and 3-tier fallback

### Earlier Session (January 17, 2026 PM)
- ✅ Phase 6 Complete - Projections Engine
- Server-side: `calculatePersonalizedRate()`, `futureValue()`, `calculateProjections()`
- Client-side real-time updates, tax breakdown visualization

### Earlier Session (January 17, 2026 AM)
- ✅ Phase 5 Complete - Calculator UI with coupled sliders
- Vehicle sliders, investment score, tax strategy, employer match display
- Coupled slider behavior, lock/unlock, budget editing, reset to recommended

### Earlier Session (January 16, 2026)
- ✅ Phase 4 Complete - Vehicle Allocation Engine
- `getEligibleVehicles()`, `getVehiclePriorityOrder()`, `coreAllocate()`, `validateAllocations()`
- Waterfall allocation, shared limits, non-discretionary seeds

### Earlier Session (January 17, 2026 AM)
- ✅ Phase 3 Complete - Three-Phase Questionnaire with Ambition Quotient
- Added `AMBITION_QUESTIONS`, `computeDomainsAndWeights()`, Phase C UI
- Added `a2b_taxPreference` to Phase B for all profiles

### Decision Tree Order (Legacy Aligned)
```
Profile 1 (ROBS in use)
  → Profile 2 (ROBS interested + qualifies)
    → Profile 3 (Business owner + employees)
      → Profile 4 (Self-employed/Both, no employees)
        → Profile 5 (Has Traditional IRA)
          → Profile 9 (age >= 55 OR nearRetirement)
            → Profile 6 (age >= 50 AND catchUpFeeling)
              → Profile 8 (taxFocus = Now/Both)
                → Profile 7 (default)
```

### ✅ RESOLVED: Data Not Mapping from Tools 1-5 (Jan 11, 2026)

**Root Cause Identified:**
Different tools save data with different nesting structures:
- **Tool 1** saves: `{ formData, scores, winner }` → access via `.data.winner`, `.data.scores`
- **Tools 2/3/5** save: `{ data: formData, results, scoring }` → form data at `.data.data` (double-nested)
- **Tool 4** saves flat: `{ scenarioName, multiply, monthlyIncome }` → access via `.data` directly
- **Tool 3/5 subdomain scores** are at `scoring.subdomainQuotients`, NOT `results.subdomainScores`

**Fix Applied in `mapUpstreamFields()` (lines 138-215):**
```javascript
// Extract actual form/result data from each response
const t1Raw = tool1Data?.data || {};
const t1Winner = t1Raw.winner || t1Raw.winningPattern || null;
const t1Scores = t1Raw.scores || {};

const t2 = tool2Data?.data?.data || {};
const t3 = tool3Data?.data?.data || {};
const t3Scoring = tool3Data?.data?.scoring || {};  // subdomainQuotients here
const t4 = tool4Data?.data || {};  // Tool 4 saves flat
const t5 = tool5Data?.data?.data || {};
const t5Scoring = tool5Data?.data?.scoring || {};  // subdomainQuotients here
```

**Key Discovery:**
The `docs/Middleware/middleware-mapping.md` document is the **canonical reference** for all tool data structures. Always consult it when pulling cross-tool data.

**Test Results (Client 6123LY):**
| Category | Status | Data Showing |
|----------|--------|--------------|
| Demographics | ✅ Yellow | age: 49 |
| Financial Data | ✅ Yellow | monthlyBudget: $1,950 |
| Investment Profile | ✅ Green | investmentScore: 4 |
| Trauma Insights | ✅ Green | traumaPattern present |
| Identity Insights | ✅ Green | subdomainQuotients mapped |
| Connection Insights | ✅ Green | subdomainQuotients mapped |

### Files Modified This Session (Jan 18, 2026 PM)
- `tools/tool6/Tool6GPTAnalysis.js` - **NEW** - GPT integration with trauma-informed context
- `tools/tool6/Tool6Fallbacks.js` - **NEW** - Profile-aware fallback narratives
- `tools/tool6/Tool6Report.js` - **NEW** - PDF HTML generation
- `tools/tool6/Tool6.js`:
  - Added `generatePDF()`, `generateComparisonPDF()`, `getClientName()`
  - Added global wrappers: `generateTool6PDF()`, `generateTool6ComparisonPDF()`
  - Added PDF buttons to scenario cards and comparison section
  - Added CSS for PDF button styling
  - Added client-side `downloadScenarioPDF()`, `downloadComparisonPDF()`, `downloadBase64PDF()`
- `docs/Tool6/Tool6-Dev-Startup.md` - Updated for Sprint 7.4 completion

### Files Modified Earlier (Jan 18, 2026 AM)
- `tools/tool6/Tool6.js`:
  - Sprint 7.1: `saveScenario()`, TOOL6_SCENARIOS sheet creation
  - Sprint 7.2: `getScenarios()`, `loadScenario()`, dropdown UI
  - Sprint 7.3: `compareScenarios()`, side-by-side comparison UI
  - Solo 401(k) Employee split into Roth/Traditional based on tax preference

### Files Modified Previous Session (Jan 17, 2026)
- `tools/tool6/Tool6Constants.js`:
  - Added `AMBITION_QUESTIONS` (10 questions with conditional showIf logic)
  - Added `AMBITION_QUESTION_ORDER` for domain-based rendering
  - Added `a2b_taxPreference` to ALLOCATION_QUESTIONS (all profiles)
- `tools/tool6/Tool6.js`:
  - Added `computeDomainsAndWeights()` function (legacy algorithm alignment)
  - Added Phase C HTML generation to `buildQuestionnaireHtml()`
  - Phase 6: Projections engine with real-time updates
- `docs/Tool6/Tool6-Consolidated-Specification.md` - Updated Ambition Quotient section

### Notes for Next Session

## Phase 10 - UI Polish Complete

**Sprint 10.3 Complete:** Tool 4 styling alignment applied to Tool 6.

### Styling Changes Applied (Jan 19, 2026)
- **Gold pill buttons:** btn-primary, btn-secondary with hover lift effects
- **Vehicle slider containers:** Card-style layout (padding: 20px, border-radius: 10px)
- **Slider header:** New structure with vehicle-slider-header, title, value
- **Larger slider thumb:** 24px (vs 18px) with 3px border
- **Gradient fill:** Purple gradient, gold when locked
- **Lock button:** Shows "🔒 Locked" / "🔓 Unlocked" text
- **Vehicle descriptions:** Italic helper text explaining tax treatment

## Next Steps Options

**Option A: Phase 8 - Trauma Integration**
- Sprint 8.1: Display trauma-informed messaging in the UI (not just reports)
- Pull Tool 1 pattern and show specific guidance

**Option B: Continue Phase 10 - Polish**
- Sprint 10.1: Error handling improvements
- Sprint 10.2: Edge case testing

**Recommendation:** Phase 10.1/10.2 for robustness, or Phase 8 for feature completeness.

## Projection Functions Reference

| Function | Location | Purpose |
|----------|----------|---------|
| `calculatePersonalizedRate(score)` | Tool6.js:1412 | Score 1-7 → 8%-20% return |
| `futureValue(pmt, rate, years)` | Tool6.js:1428 | FV with safeguards |
| `calculateProjections(inputs)` | Tool6.js:1477 | Retirement projections |
| `calculateEducationProjections(inputs)` | Tool6.js:1550 | Education projections |
| `calculateTaxBreakdown(alloc, proj)` | Tool6.js:1607 | Tax-free vs taxable split |
| `calculateCompleteProjections(...)` | Tool6.js:1663 | Combines all projections |

## Client-Side Projection Functions

| Function | Purpose |
|----------|---------|
| `calculateClientProjections()` | Mirrors server logic for instant UI updates |
| `updateProjectionDisplay()` | Updates all projection DOM elements |
| `calculatePersonalizedRate(score)` | Client-side return rate calculation |
| `futureValue(pmt, rate, years)` | Client-side FV calculation |

## Coupled Slider Reference (for maintenance)

### Redistribution Logic (Family Bank aware)
- **INCREASE vehicle**: Pull from Family Bank first (lowest priority), then other vehicles
- **DECREASE vehicle**: Redistribute to other vehicles first (up to limits), overflow to Family Bank

### State Object
```javascript
var allocationState = {
  vehicles: {},           // Current amounts
  originalAllocation: {}, // Algorithm output (for proportions)
  limits: {},             // Effective max (min of IRS and budget)
  irsLimits: {},          // True IRS limits
  locked: {},             // Lock status
  budget: 0,
  originalBudget: 0
};
```

---

## Quick Reference Links

| Resource | Location |
|----------|----------|
| Main Spec | `docs/Tool6/Tool6-Consolidated-Specification.md` |
| **Data Structures** | `docs/Middleware/middleware-mapping.md` |
| Constants | `tools/tool6/Tool6Constants.js` |
| Main Tool | `tools/tool6/Tool6.js` |
| Tool 4 Reference | `tools/tool4/Tool4.js` |
| Legacy Algorithms | `apps/Tool-6-retirement-blueprint-tool/scripts/code.js` |
| GAS Rules | `CLAUDE.md` (Navigation section) |
| This Guide | `docs/Tool6/TOOL6-DEV-STARTUP.md` |
