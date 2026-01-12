# Tool 6: Development Startup Guide

> **Purpose:** Get any AI coder up to speed quickly for multi-session development
> **Last Updated:** January 11, 2026
> **Current Sprint:** Sprint 1.1 Complete, Ready for Sprint 1.2

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

### 3. Ambition Quotient
Weights allocation across Retirement/Education/Health domains based on:
- User ranking of priorities
- Time-discounted urgency

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

### Phase 1: Data Layer 🔄 IN PROGRESS
- [x] Sprint 1.1: Upstream Data Pull - ✅ **COMPLETE** (Jan 11, 2026)
- [ ] Sprint 1.2: Fallback/Backup Questions
- [ ] Sprint 1.3: TOOL6_SCENARIOS Sheet

### Phase 2: Profile Classification
- [ ] Sprint 2.1: Classification Input Gathering
- [ ] Sprint 2.2: Decision Tree Implementation
- [ ] Sprint 2.3: ROBS Qualification Flow
- [ ] Sprint 2.4: Profile Display UI

### Phase 3: Ambition Quotient
- [ ] Sprint 3.1: Priority Ranking UI
- [ ] Sprint 3.2: Ambition Quotient Algorithm

### Phase 4: Vehicle Allocation
- [ ] Sprint 4.1: Vehicle Eligibility
- [ ] Sprint 4.2: Vehicle Priority Order
- [ ] Sprint 4.3: Waterfall Allocation (Core)
- [ ] Sprint 4.4: Tax Strategy Reordering & Roth Phase-Out
- [ ] Sprint 4.5: IRS Limit Validation

### Phase 5: Calculator UI
- [ ] Sprint 5.1: Current State Inputs
- [ ] Sprint 5.2: Investment Score Display
- [ ] Sprint 5.3: Tax Strategy Toggle
- [ ] Sprint 5.4: Employer Match UI
- [ ] Sprint 5.5: Vehicle Sliders
- [ ] Sprint 5.6: Calculate Button & Recalc

### Phase 6: Projections
- [ ] Sprint 6.1: Projections Calculation
- [ ] Sprint 6.2: Projections Display
- [ ] Sprint 6.3: Tax Breakdown Display

### Phase 7: Scenario Management
- [ ] Sprint 7.1: Save Scenario
- [ ] Sprint 7.2: Load Scenario
- [ ] Sprint 7.3: Compare Scenarios
- [ ] Sprint 7.4: PDF Generation

### Phase 8: Trauma Integration
- [ ] Sprint 8.1: Trauma Insights Display

### Phase 9: GPT Integration
- [ ] Sprint 9.1: GPT Analysis
- [ ] Sprint 9.2: Fallbacks

### Phase 10: Polish
- [ ] Sprint 10.1: Error Handling
- [ ] Sprint 10.2: Edge Cases
- [ ] Sprint 10.3: Performance & Polish

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

### Design Patterns Established
1. **Single-page calculator** - Same as Tool 4, not multi-phase like Tools 1-3
2. **Pre-survey → Calculate → Adjust** - User answers questions, gets recommendation, can adjust with sliders
3. **Server-side classification, client-side recalc** - Heavy lifting on server, sliders are instant JS
4. **Scenario persistence** - Save to TOOL6_SCENARIOS sheet, load/compare later

---

## Session Handoff Protocol

When ending a session, update this section:

### Last Session Summary
- **Date:** January 11, 2026
- **What was done:**
  - ✅ **FIXED Sprint 1.1 data mapping bug** - root cause was double-nested data structures
  - Updated `mapUpstreamFields()` to handle different tool save patterns
  - Fixed Tool 3/5 subdomain scores path (`scoring.subdomainQuotients` not `results.subdomainScores`)
  - Deployed version @279 with all fixes
  - Verified all data categories now display correctly for client 6123LY
- **Current state:** Sprint 1.1 COMPLETE - ready for Sprint 1.2
- **Next task:** Sprint 1.2 - Fallback/Backup Questions UI
- **Blockers:** None

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

### Files Modified This Session
- `tools/tool6/Tool6.js` - Fixed `mapUpstreamFields()` method (lines 138-215)
  - Added proper nesting handling for each tool
  - Fixed Tool 3/5 subdomain scores path
  - Added detailed comments documenting each tool's save structure
- `docs/Tool6/Tool6-Consolidated-Specification.md` - Updated Data Sources table
  - Corrected subdomain scores path to `scoring.subdomainQuotients`
  - Added reference to middleware-mapping.md

### Notes for Next Session (Sprint 1.2: Fallback/Backup Questions)

**Goal:** Build UI for backup questions when upstream data is missing

**Tasks:**
1. Create fallback question components for each data category
2. Implement conditional rendering based on data availability
3. Add form validation for fallback inputs
4. Save fallback answers to client record
5. Update `mapUpstreamFields()` to use fallback values

**Reference:** Spec section "New Questions Required" (lines 132-178)

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
