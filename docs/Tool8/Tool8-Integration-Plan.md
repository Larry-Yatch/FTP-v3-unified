# Tool8 Investment Planning Tool - Integration Plan

## Executive Summary

This document outlines the plan to integrate the legacy Tool8 Investment Planning Tool into the FTP-v3 framework. The goal is **minimal changes** to the working calculation engine while achieving:
- Consistent look and feel with Tool4/Tool6 calculators
- Integration with the FTP-v3 routing and tool registry
- Reuse of existing scenario persistence (it already works well)
- **Pre-population of financial data** from earlier tools (no redundant data entry)
- **Trauma-informed investment guidance** using data from Tools 1, 3, 5, and 7
- **Personalized action barriers** in PDF reports based on subdomain-level behavioral data

**Approach:** 7 small phases, each independently testable. No heroic coding sessions.

---

## 1. Current State Analysis

### 1.1 Legacy Tool8 Architecture

**Location:** `/apps/Tool-8-investment-tool/scripts/`

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~1,700 | Full UI (HTML + CSS + JS calculations) |
| `Code.js` | ~1,850 | Server functions (roster, scenarios, PDF) |

**Key Characteristics:**
- **Standalone web app** with own `doGet()` entry point
- **Client ID gate** with 3 auth sections (ID lookup, name lookup, gate card)
- **Scenario persistence** to own spreadsheet (`SS_ID`)
- **PDF report generation** via Google Docs API (single + comparison)
- **Three calculation modes:** Monthly Savings, Returns Required, Years Required
- **Client-side calculations** (bisection solver, sigmoid risk mapping, all math in browser)
- **Advanced Settings** section (collapsible) for inflation, draw years, maintenance return, deployment drag
- **Tutorial modal** with embedded Guidde video
- **Comparison UI** with inline side-by-side table

### 1.2 Legacy Code Inventory

#### Server Functions (Code.js)

| Function | Lines | Port? | Notes |
|----------|-------|-------|-------|
| `doGet()` | 48-51 | DELETE | Replace with FTP-v3 Router |
| `normalizeId_(s)` | 54-60 | MAYBE | May already exist in FTP-v3 |
| `getRosterSheet_()` | 63-69 | DELETE | Not needed |
| `lookupStudentById()` | 72-101 | DELETE | FTP-v3 handles auth |
| `lookupStudentByName()` | 104-196 | DELETE | FTP-v3 handles auth |
| `ensureScenariosHeader_(sh)` | 199-225 | PORT | Keep as-is |
| `getUserScenarios(clientId)` | 227-282 | PORT | Minimal changes |
| `saveScenario(scn)` | 284-327 | PORT | Minimal changes |
| `ReportFormatters` | 329-368 | PORT | `money()`, `percent()`, `years()`, `riskLevel()`, `date()`, `annualFromMonthly()` |
| `ReportStyles` | 370-484 | PORT | `addHeader()`, `addSection()`, `addCompactSection()`, `addField()`, `addStyledTable()`, `addHighlightBox()` |
| `generateReport(scn)` | 490-1079 | PORT | ~600 lines, multi-section PDF via Google Docs API |
| `generateComparisonReport(s1, s2)` | 1085-1841 | PORT | ~750 lines, side-by-side comparison PDF |

#### Client Functions (index.html JavaScript)

| Function/Section | Lines | Port? | Notes |
|-----------------|-------|-------|-------|
| SETTINGS object | 651-663 | PORT | Sigmoid params, risk bands, solve ranges, drag coefficients |
| `fmtUSD()`, `fmtPct()`, etc. | 666-687 | PORT | Formatting utilities |
| `returnFromRisk()` / `riskFromReturn()` | 674-690 | PORT | Sigmoid risk-return mapping |
| `effectiveAccReturn()` | ~695 | PORT | 25% deployment drag formula |
| `requiredNestEgg()` | ~700 | PORT | Growing annuity formula |
| `fvA0()` / `fvContrib()` | ~710 | PORT | Future value calculations |
| `requiredContribution()` | ~720 | PORT | Solve for monthly savings |
| `solveBisection()` | ~725 | PORT | Generic bisection solver (100 iter max) |
| `bindPair()` | 881-946 | PORT | Slider/number input bidirectional sync |
| `recalc()` | 1009-1176 | PORT | Master calculation + feasibility analysis |
| Gate/auth handlers | 799-877 | DELETE | 3 auth sections, not needed |
| Scenario management | 1210-1399 | PORT | Load/save/PDF generation calls |
| Comparison UI | 1401-1607 | PORT | Inline comparison table builder |
| Tutorial modal | 1689-1706 | DECIDE | Keep video? Remove? Replace? |

#### Scenarios Spreadsheet Schema (Columns A-V)

```
A: Timestamp       B: First_Name     C: Last_Name      D: Email
E: Client_ID       F: Scenario_Name  G: Monthly_Income  H: Years_To_Goal
I: Risk_Dial       J: Target_Return  K: Effective_Return L: Contribution_Capacity
M: Current_Assets  N: Inflation      O: Draw_Years      P: Maintenance_Return
Q: Nominal_Income  R: Required_Nest  S: Required_Contrib T: Solved_Return
U: Solved_Years    V: Mode
```

### 1.3 What Needs to Change

1. **Entry point** - Remove standalone `doGet()`, use FTP-v3 Router
2. **Client ID handling** - Remove 3 gate/auth sections, use FTP-v3's `params.clientId`
3. **Styling** - Update CSS to match Tool4/Tool6 visual language
4. **File structure** - Move to `/tools/tool8/` folder structure
5. **Dashboard** - Add Tool8 card to Router.js dashboard
6. **Data pre-population** - Pull forward financial data from Tools 2, 4, 6
7. **Trauma integration** - Add insight section, contextual warnings, PDF action barriers

---

## 2. Target Architecture

### 2.1 File Structure

```
/tools/tool8/
  Tool8.js              # Main tool (render, data resolution, calculator UI, server functions)
  Tool8Report.js        # PDF generation with trauma-informed action barriers
  Tool8Constants.js     # SETTINGS object, risk bands, trauma insight definitions, subdomain maps
  tool8.manifest.json   # Tool metadata for registry
```

### 2.2 All Integration Points

| Component | File to Modify | Change Type | Effort |
|-----------|---------------|-------------|--------|
| Tool registration | `Code.js` → `registerTools()` | Add manifest + register call | Low |
| Wrapper functions | `Code.js` (top level) | Add 5 wrapper functions for `google.script.run` | Low |
| Dashboard card | `core/Router.js` | Add `_buildTool8Card()` method (~150 lines) | Medium |
| System routes | `core/Router.js` → `_isSystemRoute()` | Add `'tool8_report'` to array | Low |
| Report route handler | `core/Router.js` → `_handleSystemRoute()` | Add `case 'tool8_report'` | Low |
| Tool access control | `core/ToolAccessControl.js` | **NO CHANGE** — already supports 8 tools | None |
| Data service | `core/DataService.js` | **NO CHANGE** — generic for all tools | None |
| Admin panel | `AdminRouter.js` | **NO CHANGE** — generic, auto-discovers tools | None |
| Config | `Config.js` | **NO CHANGE** — TOOL8 already defined | None |

### 2.3 Manifest Definition

```javascript
// In Code.js registerTools()
const tool8Manifest = {
  id: "tool8",
  version: "1.0.0",
  name: "Investment Planning Tool",
  pattern: "calculator",
  route: "tool8",
  routes: ["/tool8"],
  description: "Retirement investment calculator with scenario planning and comparison",
  icon: "📈",
  estimatedTime: "15-20 minutes",
  categories: ["investment", "retirement", "planning"],
  outputs: { report: true, pdf: true, scenarios: true },
  dependencies: ["tool6"],
  unlocks: []  // Last tool in sequence
};
```

---

## 3. Verified Upstream Data Paths

**IMPORTANT:** These paths were verified against actual source code, not documentation.

### 3.1 Data Pre-Population Map

All pre-populated fields are **editable** with a **"Reset to my data"** button if changed.

A small confirmation section appears at the top of the calculator (not a gate):
> "We found your data from earlier tools. Please review and update anything that has changed:"

| Tool8 Input | Source | Verified Data Path | Type | Notes |
|-------------|--------|-------------------|------|-------|
| Monthly Income | Tool 4 | `tool4Data.data.monthlyIncome` | number | Verified at Tool4.js:380 |
| Monthly Savings Capacity | Tool 4 | `tool4Data.data.multiply` | number | **NOT `multiplyAmount`** — verified at Tool4.js:376 |
| Current Assets | Tool 6 | Pre-survey fields (see below) | number | **NOT in completion response** |
| Risk Tolerance | Derived | `tool6Data.data.investmentScore` OR `tool2Data.data.investmentConfidence` | number | **Tool 4 does NOT save a `riskTolerance` field** |
| Years to Retirement | Derived | Calculate from `tool2Data.data.age` | number | Default: `65 - age` |
| Age | Tool 2 | `tool2Data.data.age` | number | Direct field, verified at Tool2.js:134 |
| Employment | Tool 2 | `tool2Data.data.employment` | string | Direct field, verified at Tool2.js:138 |
| Investment Confidence | Tool 2 | `tool2Data.data.investmentConfidence` | string | Scale -5 to +5, verified at Tool2.js:728 |
| Inflation Assumption | — | Default 2.5% (matches legacy SETTINGS) | number | Editable |

### 3.2 Tool 6 Balance Access (Special Case)

Tool 6 retirement balances are stored in **pre-survey data**, not the completion response.

**Access pattern:**
```javascript
// Option 1: Via DraftService (PropertiesService)
const tool6PreSurvey = DraftService.getDraft('tool6', clientId);
const currentAssets = (
  parseFloat(tool6PreSurvey?.a12_current401kBalance || 0) +
  parseFloat(tool6PreSurvey?.a13_currentIRABalance || 0) +
  parseFloat(tool6PreSurvey?.a14_currentHSABalance || 0) +
  parseFloat(tool6PreSurvey?.a15_currentEducationBalance || 0)
);
```

**Ref:** `tools/tool6/Tool6.js` lines 470-473

### 3.3 Risk Tolerance Derivation

Since Tool 4 does not save `riskTolerance`, we derive it with this priority:
1. `tool6Data.data.investmentScore` (0-10 scale, best match for Tool8's risk dial)
2. `tool2Data.data.investmentConfidence` (scale -5 to +5, map to 0-10)
3. Fall back to Tool8 default (5, middle of dial)

### 3.4 Data Freshness

Each pre-filled field shows its source and date:
> "Monthly Income: $5,200 (from Tool 4, completed Jan 15) — Is this still accurate?"

Soft inline prompt, not blocking.

### 3.5 Fallback When Upstream Data Missing

Fields start blank; student fills manually. Calculator works fully standalone.

---

## 4. Trauma-Informed Investment Guidance

### 4.1 Overview — Four Layers

| Layer | Location | Trigger | Purpose |
|-------|----------|---------|---------|
| **Insight Section** | Top of calculator (collapsible) | Always present if Tool 1 exists | Show primary + secondary pattern with investment context |
| **Contextual Warnings** | Inline during tool use | Specific user actions + subdomain quotient > 50 | Gentle, dismissable nudges referencing earlier grounding work |
| **Action Barriers (PDF)** | PDF report only | On report generation | Personalized "here is what will try to stop you" section |
| **Backup Questions** | Before calculator if Tool 1 missing | Tool 1 data absent | 3 questions to derive pattern; lighter version of layers 1-2 |

### 4.2 Data Sources

```
Tool 1 → Primary trauma pattern (winner) + all 6 category scores
Tool 3 → HOW FSV/ExVal manifest (6 subdomains, 0-100 quotients)
         Access: tool3Data.data.scoring.subdomainQuotients
Tool 5 → HOW Showing/Receiving manifest (6 subdomains, 0-100 quotients)
         Access: tool5Data.data.scoring.subdomainQuotients
Tool 7 → HOW Control/Fear manifest (6 subdomains, 0-100 quotients)
         Access: tool7Data.data.scoring.subdomainQuotients
```

**Key insight:** Tools 3, 5, and 7 reveal **which specific behaviors** drive each pattern, enabling subdomain-specific guidance instead of generic warnings.

### 4.3 Layer 1: Collapsible Insight Section

Same UI pattern as Tool6 (`buildTraumaInsightSection` at Tool6.js:3185-3320) — collapsible card at top of calculator.

**Primary pattern definitions (investment-specific):**

| Pattern | Icon | Investment-Specific Insight | Watch For | Healing Direction |
|---------|------|---------------------------|-----------|-------------------|
| **FSV** | 🎭 | You may set unrealistic savings goals to prove your worth, or avoid looking at the numbers altogether. | Setting contribution levels you cannot sustain, avoiding the calculator when results feel "not good enough." | Your investment journey is valid at any starting point. Progress matters more than perfection. |
| **ExVal** | 👥 | You may chase returns others brag about or feel inadequate comparing your numbers to peers. | Adjusting risk dial based on what others are doing, feeling shame about your current balance. | Your financial timeline is unique. Build a plan that fits YOUR life, not someone else's highlight reel. |
| **Showing** | 💝 | You may deprioritize your own investments to fund the needs of others, feeling guilty about building personal wealth. | Setting contributions to zero because others need the money more, guilt about saving for yourself. | Securing your financial future IS an act of love for those who depend on you. |
| **Receiving** | 🛡️ | You may hoard savings in cash out of distrust, or refuse professional investment advice because accepting help feels unsafe. | Over-emphasis on "safe" low-return options, refusing to use the tool's guidance or pre-populated data. | Receiving support in building your plan does not create dependency — it builds strength. |
| **Control** | 🎯 | You may obsessively run scenarios without ever committing to one, or be so rigid in your parameters that no plan feels acceptable. | Running dozens of scenarios without saving any, inability to accept "good enough," tweaking every number. | A good-enough plan executed consistently beats a perfect plan never started. |
| **Fear** | 😰 | You may set the risk dial too low out of market fears, catastrophize investment scenarios, or avoid planning entirely. | Risk dial stuck at 0-2, focusing only on worst-case outcomes, closing the tool without saving. | Long-term investing has historically rewarded patience. You can handle appropriate risk. |

**Secondary pattern:** Faded card (opacity: 0.8) if second-highest Tool 1 score > 0.

### 4.4 Layer 2: Contextual Warnings (Subdomain-Specific)

Gentle, dismissable info alerts. **Only fire when relevant subdomain quotient > 50.** Each warning shown **max once per session**. Warnings **explicitly reference earlier grounding work**.

Full trigger tables are in **Appendix D**.

### 4.5 Layer 3: Action Barriers in PDF Report

**This is the most important layer.** The real battle is whether students take action after closing the browser.

PDF report includes a personalized **"Your Action Barrier"** section that:
1. Names the specific barrier they are most likely to face
2. Breaks the first action into the smallest possible step
3. Connects investing to their healing journey

Full content map is in **Appendix E**.

**Implementation:** Check highest subdomain quotients from Tools 3/5/7. Include up to 2 barriers (highest-scoring subdomains above 60).

### 4.6 Layer 4: Backup Questions (When Tool 1 Missing)

Same pattern as Tool4 (lines 5920-5954) and Tool6 (lines 290-327):

| Question | Field | Options |
|----------|-------|---------|
| "How do you typically respond under financial stress?" | `backup_stressResponse` | FSV, ExVal, Showing, Receiving, Control, Fear |
| "What is your core belief about money?" | `backup_coreBelief` | Same 6 options |
| "What is the most common consequence of your money patterns?" | `backup_consequence` | Same 6 options |

Majority voting derives pattern. Enables lighter versions of Layers 1 and 2 (pattern-level only, no subdomain specificity).

---

## 5. Implementation Phases

### Phase 1: Scaffold, Register, and Render a Blank Page ✅ COMPLETE

**Goal:** Tool8 exists in the framework and renders a "Hello World" page when accessed.
**Completed:** Commits `7cb5639`, `078db17`

| Step | File | Change |
|------|------|--------|
| 1.1 | — | Create `/tools/tool8/` directory |
| 1.2 | `tools/tool8/Tool8.js` | Create skeleton with `render(params)` that returns a basic HTML page showing `clientId` |
| 1.3 | `tools/tool8/Tool8Constants.js` | Create with SETTINGS object ported from legacy index.html:651-663 (risk bands, sigmoid params) |
| 1.4 | `tools/tool8/tool8.manifest.json` | Create manifest JSON |
| 1.5 | `Code.js` → `registerTools()` | Add Tool8 manifest + `ToolRegistry.register()` call |
| 1.6 | `Code.js` (top level) | Add wrapper functions: `tool8SaveScenario`, `tool8GetUserScenarios`, `tool8GenerateReport`, `tool8GenerateComparisonReport`, `generateTool8PDF` |
| 1.7 | `core/Router.js` → `_isSystemRoute()` | Add `'tool8_report'` to system routes array |
| 1.8 | `core/Router.js` → `_handleSystemRoute()` | Add `case 'tool8_report'` handler |

**Test gate:** Navigate to Tool8 via direct URL with `?route=tool8&clientId=TEST`. Confirm blank page renders with client ID displayed. Confirm no errors in GAS logs.

---

### Phase 2: Dashboard Card + Navigation ✅ COMPLETE

**Goal:** Tool8 appears on the dashboard with correct access control and students can navigate to it.
**Completed:** Commit `1d61156`

| Step | File | Change |
|------|------|--------|
| 2.1 | `core/Router.js` → `_createDashboard()` | Add Tool8 status check variables (follows pattern at lines 479-610) |
| 2.2 | `core/Router.js` | Create `_buildTool8Card()` method following Tool6/Tool7 card pattern (~150 lines) |
| 2.3 | `core/Router.js` → `_createDashboard()` | Add `${this._buildTool8Card(...)}` to dashboard HTML output |

**Ref:** Study `_buildTool7Card()` in Router.js as the template.

**Test gate:**
- Load dashboard for a student who has completed Tool7 → Tool8 card shows "Not Started"
- Load dashboard for a student who has NOT completed Tool7 → Tool8 card shows locked
- Click Tool8 card → navigates to Tool8 blank page from Phase 1

---

### Phase 3: Port Core Calculator (No Upstream Data, No Trauma) ✅ COMPLETE

**Goal:** The full calculator works as a standalone tool — all 3 modes, sliders, calculations, feasibility analysis. No upstream data, no trauma features yet.
**Completed:** Full calculator ported with all 3 modes, 4 dials, advanced settings, feasibility analysis, slider sync, scenario save/load/compare UI wired to server functions. Used string concatenation (not template literals) to avoid GAS double-escaping issues.

| Step | File | Change |
|------|------|--------|
| 3.1 | `tools/tool8/Tool8.js` | Port CSS from legacy index.html:7-309, update to match Tool4/Tool6 tokens |
| 3.2 | `tools/tool8/Tool8.js` | Port HTML structure from legacy index.html:359-646 (calculator sections only, skip gate/auth sections) |
| 3.3 | `tools/tool8/Tool8.js` | Port all calculation JavaScript from legacy index.html:651-1176 (SETTINGS, formatters, core math, `recalc()`, `bindPair()`, mode switching) |
| 3.4 | `tools/tool8/Tool8.js` | Port Advanced Settings UI + reset defaults button |
| 3.5 | `tools/tool8/Tool8.js` | Port feasibility badge/message system |
| 3.6 | `tools/tool8/Tool8.js` | Port button loading states (Saving..., Saved checkmark, etc.) |

**CSS Critical Notes:**
- Copy slider track/thumb CSS from Tool6.js (`::-webkit-slider-runnable-track`, `::-moz-range-track`, thumb with `margin-top: -7px`)
- Use Tool6's CSS variable names where possible for consistency

**Template Literal Safety:** Per CLAUDE.md rules — no escaped apostrophes in template literals. Use full words ("do not" not "don't") or double quotes.

**Test gate:**
- All 3 calculation modes produce correct results (verify against legacy tool with same inputs)
- Sliders sync bidirectionally with number inputs
- Feasibility messages display correctly
- Advanced Settings expand/collapse and reset properly
- Mode switching works (contrib → return → time)

---

### Phase 4: Port Scenario Management + PDF Generation

**Goal:** Students can save, load, and compare scenarios. PDF reports generate correctly.

| Step | File | Change |
|------|------|--------|
| 4.1 | `tools/tool8/Tool8.js` | Port `getUserScenarios()`, `saveScenario()`, `ensureScenariosHeader_()` from legacy Code.js:199-327 |
| 4.2 | `tools/tool8/Tool8.js` | Port scenario load/save UI from legacy index.html:1210-1399 |
| 4.3 | `tools/tool8/Tool8.js` | Port scenario comparison UI from legacy index.html:1401-1607 |
| 4.4 | `tools/tool8/Tool8.js` | Update all `google.script.run` calls to use `tool8` prefix |
| 4.5 | `tools/tool8/Tool8Report.js` | Port `ReportFormatters` + `ReportStyles` from legacy Code.js:329-484 |
| 4.6 | `tools/tool8/Tool8Report.js` | Port `generateReport()` from legacy Code.js:490-1079 |
| 4.7 | `tools/tool8/Tool8Report.js` | Port `generateComparisonReport()` from legacy Code.js:1085-1841 |

**Test gate:**
- Save a scenario → appears in spreadsheet with correct schema (columns A-V)
- Load a scenario → all controls populate correctly
- Save 3 scenarios → dropdown shows all 3
- Generate single PDF → downloads correctly, all sections present
- Select 2 scenarios → comparison PDF generates with side-by-side table
- Legacy scenarios still load (backward compatibility)

---

### Phase 5: Upstream Data Pre-Population

**Goal:** Calculator pre-fills from Tools 2, 4, 6 with source attribution and "Reset to my data" functionality.

| Step | File | Change |
|------|------|--------|
| 5.1 | `tools/tool8/Tool8.js` | Implement `resolveClientData(clientId)` — pulls from DataService + DraftService |
| 5.2 | `tools/tool8/Tool8.js` | Implement `sumRetirementBalances()` — reads Tool 6 pre-survey fields a12-a15 |
| 5.3 | `tools/tool8/Tool8.js` | Implement risk tolerance derivation (investmentScore → investmentConfidence → default 5) |
| 5.4 | `tools/tool8/Tool8.js` | Build `buildDataReviewSection(resolvedData)` — inline confirmation with source dates |
| 5.5 | `tools/tool8/Tool8.js` | Add client-side "Reset to my data" button logic per field |
| 5.6 | `tools/tool8/Tool8.js` | Wire pre-populated values into calculator initial state |

**resolveClientData() implementation:**
```javascript
resolveClientData(clientId) {
  const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
  const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
  const tool3Data = DataService.getLatestResponse(clientId, 'tool3');
  const tool4Data = DataService.getLatestResponse(clientId, 'tool4');
  const tool5Data = DataService.getLatestResponse(clientId, 'tool5');
  const tool6Data = DataService.getLatestResponse(clientId, 'tool6');
  const tool6PreSurvey = DraftService.getDraft('tool6', clientId);
  const tool7Data = DataService.getLatestResponse(clientId, 'tool7');

  return {
    // Pre-population fields (verified paths)
    monthlyIncome: tool4Data?.data?.monthlyIncome || null,
    savingsCapacity: tool4Data?.data?.multiply || null,           // NOT multiplyAmount
    currentAssets: this.sumRetirementBalances(tool6PreSurvey),    // From pre-survey
    riskTolerance: tool6Data?.data?.investmentScore              // Primary
      || this.mapConfidenceToRisk(tool2Data?.data?.investmentConfidence) // Fallback
      || null,
    age: tool2Data?.data?.age || null,
    yearsToRetirement: tool2Data?.data?.age ? (65 - tool2Data.data.age) : null,
    employment: tool2Data?.data?.employment || null,

    // Source timestamps
    tool2Timestamp: tool2Data?.timestamp || null,
    tool4Timestamp: tool4Data?.timestamp || null,
    tool6Timestamp: tool6Data?.timestamp || null,

    // Trauma data (for Phase 6)
    traumaPattern: tool1Data?.data?.winner || null,
    traumaScores: tool1Data?.data?.scores || null,
    tool3Scoring: tool3Data?.data?.scoring || null,
    tool5Scoring: tool5Data?.data?.scoring || null,
    tool7Scoring: tool7Data?.data?.scoring || null,

    // Flags
    hasTool1: !!tool1Data,
    hasTool3: !!tool3Data,
    hasTool5: !!tool5Data,
    hasTool7: !!tool7Data,
    hasFinancialData: !!(tool4Data || tool6Data)
  };
}
```

**Test gate:**
- Load Tool8 for student with completed Tools 2/4/6 → fields pre-populate with correct values
- Source dates display next to each field
- Change a value → "Reset to my data" button appears
- Click reset → original value restores
- Load for student with NO prior tools → fields blank, calculator works standalone
- Load for student with partial data (e.g., Tool 4 but no Tool 6) → available fields populate, others blank

---

### Phase 6: Trauma Integration (Insight Section + Contextual Warnings + Backup Questions)

**Goal:** Collapsible trauma insight section, subdomain-specific contextual warnings, and backup questions when Tool 1 is missing.

| Step | File | Change |
|------|------|--------|
| 6.1 | `tools/tool8/Tool8Constants.js` | Add `TOOL8_TRAUMA_INSIGHTS` object (6 patterns, investment-specific — see Section 4.3) |
| 6.2 | `tools/tool8/Tool8Constants.js` | Add `TOOL8_CONTEXTUAL_WARNINGS` object (18 subdomain triggers — see Appendix D) |
| 6.3 | `tools/tool8/Tool8.js` | Implement `buildTraumaInsightSection(resolvedData)` following Tool6.js:3185-3320 pattern |
| 6.4 | `tools/tool8/Tool8.js` | Add secondary pattern card (faded, if second-highest score > 0) |
| 6.5 | `tools/tool8/Tool8.js` | Implement backup questions UI (3 questions before calculator when Tool 1 missing) |
| 6.6 | `tools/tool8/Tool8.js` | Implement backup question majority voting (follow Tool6.js:290-327 pattern) |
| 6.7 | `tools/tool8/Tool8.js` | Implement contextual warning system in client-side JavaScript |
| 6.8 | `tools/tool8/Tool8.js` | Add warning CSS (gentle info-style, dismissable, not error-style) |

**Contextual warning architecture (client-side):**
```javascript
// Receive subdomain data as JSON in a data attribute
const traumaData = JSON.parse(document.getElementById('traumaData').dataset.trauma);

// Track which warnings have been shown this session
const shownWarnings = new Set();

function checkWarning(warningId, subdomainKey, quotientValue) {
  if (shownWarnings.has(warningId)) return;
  if (quotientValue <= 50) return;
  showWarning(warningId, TOOL8_WARNINGS[warningId]);
  shownWarnings.add(warningId);
}
```

**Test gate:**
- Load for student with Tool 1 data → insight section shows correct pattern + icon
- Expand/collapse insight section works
- Secondary pattern card shows (faded) when second score > 0
- Load without Tool 1 → 3 backup questions appear
- Answer backup questions → pattern derived, insight section shows
- Trigger a contextual warning (e.g., max risk dial with Fear pattern + Tool 7 subdomain_2_2 > 50) → gentle warning appears
- Dismiss warning → does not reappear
- Warning does NOT fire when subdomain < 50

---

### Phase 7: PDF Action Barriers + Polish

**Goal:** PDF reports include personalized action barrier section. Final polish and edge case testing.

| Step | File | Change |
|------|------|--------|
| 7.1 | `tools/tool8/Tool8Constants.js` | Add `TOOL8_ACTION_BARRIERS` object (barrier/step/healing per subdomain — see Appendix E) |
| 7.2 | `tools/tool8/Tool8Report.js` | Implement `buildActionBarrierSection(resolvedData)` |
| 7.3 | `tools/tool8/Tool8Report.js` | Integrate action barrier into `generateReport()` (single-scenario PDF only) |
| 7.4 | `tools/tool8/Tool8Report.js` | Pass `resolvedData` through wrapper function to report generator |
| 7.5 | — | Decision: Keep or remove tutorial modal/Guidde video |
| 7.6 | — | Full end-to-end testing (see Section 6) |
| 7.7 | — | Mobile responsiveness verification |
| 7.8 | — | Style audit against Tool4/Tool6 |

**Test gate:**
- Generate PDF for student with trauma data (subdomain > 60) → "Your Action Barrier" section present with correct content
- Generate PDF for student with 2+ high subdomains → 2 barrier sections, highest first
- Generate PDF without trauma data → report generates normally, no barrier section
- Comparison PDF still works (no barrier section in comparisons)
- All edge cases: no upstream data, partial data, missing Tool 1, missing Tools 3/5/7

---

## 6. Comprehensive Test Matrix

### Core Calculator

| Test | Phase | Steps | Expected |
|------|-------|-------|----------|
| Basic render | 1 | Navigate via `?route=tool8&clientId=TEST` | Page renders |
| Dashboard access | 2 | Complete Tool7, check dashboard | Tool8 card shows "Not Started" |
| Dashboard locked | 2 | Check dashboard without Tool7 | Tool8 card locked |
| Contrib mode | 3 | Set income/years/risk, check output | Required monthly savings calculated |
| Return mode | 3 | Switch to return mode | Required return + risk level shown |
| Time mode | 3 | Switch to time mode | Required years calculated |
| Slider sync | 3 | Move slider | Number input updates and vice versa |
| Feasibility | 3 | Set infeasible params | Warning badge + explanation |
| Advanced settings | 3 | Expand, change inflation | Recalculation with new value |
| Reset defaults | 3 | Click reset | All advanced settings revert |

### Scenarios

| Test | Phase | Steps | Expected |
|------|-------|-------|----------|
| Save scenario | 4 | Name + save | Appears in dropdown + spreadsheet |
| Load scenario | 4 | Select + load | All controls populate |
| Multiple scenarios | 4 | Save 3 | All 3 in dropdown |
| Single PDF | 4 | Click generate | PDF downloads, all sections |
| Comparison PDF | 4 | Select 2, compare | Side-by-side PDF |
| Legacy compat | 4 | Load old scenario | Populates correctly |

### Data Pre-Population

| Test | Phase | Steps | Expected |
|------|-------|-------|----------|
| Full upstream data | 5 | Student with Tools 2/4/6 | Fields pre-filled with source dates |
| Partial data | 5 | Student with only Tool 4 | Available fields filled, others blank |
| No data | 5 | Student with no prior tools | All fields blank, works standalone |
| Reset button | 5 | Change value, click reset | Original restored |
| Freshness display | 5 | Check dates | Shows correct completion dates |

### Trauma Integration

| Test | Phase | Steps | Expected |
|------|-------|-------|----------|
| Insight section | 6 | Student with Tool 1 | Collapsible card, correct pattern |
| Secondary pattern | 6 | Student with 2 high scores | Faded secondary card |
| No Tool 1 | 6 | Student without Tool 1 | Backup questions appear |
| Backup voting | 6 | Answer 3 questions | Pattern derived correctly |
| High subdomain warning | 6 | Trigger + subdomain > 50 | Gentle warning with reference |
| Low subdomain | 6 | Trigger + subdomain < 50 | No warning |
| Warning dismiss | 6 | Dismiss warning | Does not reappear |
| PDF barrier (high) | 7 | Generate PDF, subdomain > 60 | Action barrier section present |
| PDF barrier (none) | 7 | Generate PDF, no trauma data | No barrier, normal report |
| PDF 2 barriers | 7 | 2+ subdomains > 60 | 2 barriers, highest first |

---

## 7. Risk Assessment

### Low Risk
- Scenario persistence (already works, same spreadsheet)
- Calculation logic (already works, porting unchanged)
- Tool registration + access control (framework supports 8 tools)

### Medium Risk
- CSS styling (may need iteration to match Tool4/Tool6)
- Data path mapping (verified but Tool 2/6 structures are complex)
- Dashboard card (following existing pattern, but ~150 lines of new code)

### Higher Risk
- Tool 6 pre-survey balance access (different access pattern than completion data)
- Contextual warning trigger accuracy (may need threshold tuning)
- PDF action barrier content (needs facilitator review)

### Mitigation
- **Keep legacy app running** during integration for fallback
- **Test after every phase** — never more than ~1 day of work before testing
- **Copy patterns from Tool6** rather than inventing new ones
- **Verify data paths** with real student data before building UI
- **Review action barrier copy** with program facilitators before deployment

---

## 8. Out of Scope (Deferred)

1. **Dashboard draft visibility** — Tool8 scenarios are self-contained in own spreadsheet
2. **RESPONSES sheet integration** — Tool8 uses own Scenarios sheet
3. **Edit mode / EDIT_DRAFT** — Not applicable to calculator pattern
4. **GPT-generated insights** — Tool8 uses formula-based calculations, not GPT analysis
5. **Tutorial video** — Decision deferred to Phase 7 (keep/remove/replace)

---

## 9. Success Criteria

| Criteria | Metric |
|----------|--------|
| Functional | All 3 calculation modes work correctly |
| Scenarios | Save/load/compare scenarios work |
| PDF | Single + comparison PDFs generate (with action barriers when applicable) |
| Styling | Visually consistent with Tool4/Tool6 |
| Dashboard | Card renders with correct status and access control |
| Navigation | Accessible from dashboard after Tool7 completion |
| No regressions | Legacy scenarios still loadable |
| Data pre-population | Fields populated from Tools 2/4/6 with source attribution + reset |
| Trauma insight | Collapsible section renders with correct pattern data |
| Contextual warnings | Subdomain-specific warnings fire at correct thresholds |
| Action barriers | PDF includes personalized barrier section when trauma data exists |
| Backup questions | Pattern derived correctly when Tool 1 missing |

---

## Appendix A: Files to Create

| File | Source | Notes |
|------|--------|-------|
| `/tools/tool8/Tool8.js` | Port from legacy + new data/trauma integration | Main file |
| `/tools/tool8/Tool8Report.js` | Port from legacy + action barrier section | PDF generation |
| `/tools/tool8/Tool8Constants.js` | New + ported SETTINGS | Constants, risk bands, trauma definitions |
| `/tools/tool8/tool8.manifest.json` | New | Tool metadata for registry |

## Appendix B: Files to Modify

| File | Changes | Phase |
|------|---------|-------|
| `Code.js` | Add Tool8 registration + 5 wrapper functions | 1 |
| `core/Router.js` | Add `tool8_report` to system routes, add case handler, add `_buildTool8Card()`, add card to dashboard | 1, 2 |

## Appendix C: Files NOT to Migrate

| File/Function | Reason |
|------|--------|
| Legacy `doGet()` | Using FTP-v3 Router |
| `lookupStudentById()` | FTP-v3 handles auth |
| `lookupStudentByName()` | FTP-v3 handles auth |
| `getRosterSheet_()` | Not needed |
| Client ID gate HTML (3 sections) | Not needed |
| Roster constants (ROSTER_SPREADSHEET_ID, etc.) | Not needed |

## Appendix D: Contextual Warning Trigger Tables

### Tool 3 Subdomains (FSV / ExVal) → Investment Behavior Triggers

| Subdomain | Theme | Trigger | Warning (if quotient > 50) |
|-----------|-------|---------|----------------------------|
| 3_1_1 | "I am Not Worthy of Financial Freedom" | Avoids the calculator, closes without saving | "In your earlier work, you identified a pattern of feeling unworthy of financial security. Building this plan is direct evidence that you ARE worthy of a secure future." |
| 3_1_2 | "I will Never Have Enough" | Sets unrealistically high targets | "In your grounding work, you explored the belief that it will never be enough. This plan does not need to be perfect — it needs to be real and achievable." |
| 3_1_3 | "I Cannot See My Financial Reality" | Skips data review section, ignores pre-populated values | "You have done the work of building financial clarity. Trust the numbers from your earlier tools — they are YOUR reality." |
| 3_2_1 | "Money Shows My Worth" | Inflates current assets beyond Tool 6 data | "In your grounding work, you explored the connection between money and self-worth. Accurate numbers serve you better than impressive ones." |
| 3_2_2 | "What Will They Think?" | Hesitates to save a scenario | "This plan is for you, not for anyone else's approval. Save it — no one sees it but you." |
| 3_2_3 | "I Need to Prove Myself" | Maxes risk dial (9-10) | "In your earlier work, you identified a pattern of needing to prove yourself. A sustainable plan proves more than an aggressive one." |

### Tool 5 Subdomains (Showing / Receiving) → Investment Behavior Triggers

| Subdomain | Theme | Trigger | Warning (if quotient > 50) |
|-----------|-------|---------|----------------------------|
| 5_1_1 | "I Must Give to Be Loved" | Sets contribution to $0 | "In your grounding work, you explored the pattern of giving to others before yourself. Investing in your future IS an act of love for those who depend on you." |
| 5_1_2 | "Their Needs > My Needs" | Contribution far below capacity (< 25% of multiply) | "You identified a pattern of putting others' needs first. Even a small amount directed toward your own future matters." |
| 5_1_3 | "I Cannot Accept Help" | Overrides all pre-populated values within first 30 seconds | "In your earlier work, you explored difficulty accepting help. The data from your earlier tools is here to support you — not control you." |
| 5_2_1 | "I Cannot Make It Alone" | Accepts all defaults without reviewing (saves within 60 seconds) | "You have the knowledge to customize this plan. Trust your own judgment — review the numbers and make them yours." |
| 5_2_2 | "I Owe Them Everything" | — | Context available for PDF report only (hard to detect in UI) |
| 5_2_3 | "I Stay in Debt" | — | Context available for PDF report only (requires qualitative assessment) |

### Tool 7 Subdomains (Control / Fear) → Investment Behavior Triggers

| Subdomain | Theme | Trigger | Warning (if quotient > 50) |
|-----------|-------|---------|----------------------------|
| 7_1_1 | "I Undercharge and Give Away" | Sets income lower than Tool 4 value | "In your grounding work, you explored undervaluing yourself. Your Tool 4 income data reflects your real earning power — trust it." |
| 7_1_2 | "I Have Money But Will Not Use It" | Has Tool 6 assets but sets current balance to $0 | "You identified a pattern of having resources but not deploying them. Your existing assets are the foundation of this plan." |
| 7_1_3 | "Only I Can Do It Right" | Changes every pre-populated value + Advanced Settings | "You explored the need to control everything yourself. The pre-populated values are a starting point — not a cage." |
| 7_2_1 | "I Do Not Protect Myself" | Sets inflation to 0% | "In your earlier work, you identified a pattern of not protecting yourself. Running a conservative scenario is an act of self-protection." |
| 7_2_2 | "I Sabotage Success" | Builds a plan then clicks reset/clears inputs | "You identified a pattern of pulling back when things start working. This plan IS the breakthrough — staying with it is the work." |
| 7_2_3 | "I Trust the Wrong People" | — | Context available for PDF report only |

## Appendix E: PDF Action Barrier Content Map

| Subdomain (if highest) | Barrier Named | Smallest First Step | Healing Connection |
|------------------------|---------------|--------------------|--------------------|
| 3_1_1 "Not Worthy" | "A voice will tell you that people like you do not build wealth. That is the pattern talking, not the truth." | "This week, log into your retirement account. Just log in. That is it." | "Every time you look at your plan, you are proving that voice wrong." |
| 3_1_2 "Never Enough" | "You may look at this plan and think it is not enough — that the numbers are too small to matter. They are not." | "Set up a $25 automatic monthly transfer. The amount does not matter. The habit does." | "Sufficiency is not a number. It is a practice." |
| 3_1_3 "Cannot See Reality" | "The urge to close this report and not think about it again will be strong. That is the pattern of avoidance." | "Put a recurring 15-minute calendar reminder to review this plan monthly." | "Seeing your financial reality clearly is the foundation of every other change." |
| 5_1_1 "Must Give to Be Loved" | "When someone asks for money, you will want to redirect your investment dollars to them. That is the pattern." | "Before giving away money this month, open this report and read your plan." | "You cannot pour from an empty cup. Building your security enables sustainable generosity." |
| 5_1_2 "Their Needs > Mine" | "You will find reasons why others need the money more than your retirement account does. They always will." | "Automate your contribution so it happens before you can redirect it." | "Prioritizing yourself is not selfish. It is the foundation that lets you help others long-term." |
| 7_1_2 "Have Money, Will Not Use It" | "You have the resources to start. The barrier is not the money — it is the permission to use it." | "Move one dollar from savings to an investment account. Break the seal." | "Money sitting idle is not safety. Money working for your future IS safety." |
| 7_2_2 "Sabotage Success" | "When this plan starts working — and it will — you will feel the pull to change it, abandon it, or find a flaw. That is the pattern." | "Commit to not changing your plan for 90 days. Write the date on this report." | "Staying with a working plan IS the healing. The urge to quit is the pattern losing its grip." |
| **Fear (general)** | "The news will scare you. The market will dip. Someone will tell you a horror story. You will want to pull everything out." | "Write this on a sticky note and put it on your monitor: 'I do not react. I review quarterly.'" | "Courage is not the absence of fear. It is investing anyway." |

**Rule:** Include up to 2 barriers. Only include subdomains scoring above 60. Start with highest.

## Appendix F: Legacy Code Reference

| What | Where |
|------|-------|
| Legacy entry point | `/apps/Tool-8-investment-tool/scripts/Code.js` line 48 |
| Scenario schema (A-V) | `/apps/Tool-8-investment-tool/scripts/Code.js` lines 1-30 |
| Report formatters | `/apps/Tool-8-investment-tool/scripts/Code.js` lines 329-368 |
| Report styles | `/apps/Tool-8-investment-tool/scripts/Code.js` lines 370-484 |
| Single report generation | `/apps/Tool-8-investment-tool/scripts/Code.js` lines 490-1079 |
| Comparison report | `/apps/Tool-8-investment-tool/scripts/Code.js` lines 1085-1841 |
| CSS design tokens | `/apps/Tool-8-investment-tool/scripts/index.html` lines 7-22 |
| Slider CSS | `/apps/Tool-8-investment-tool/scripts/index.html` lines 72-97 |
| Calculator HTML | `/apps/Tool-8-investment-tool/scripts/index.html` lines 359-646 |
| SETTINGS object | `/apps/Tool-8-investment-tool/scripts/index.html` lines 651-663 |
| Core math functions | `/apps/Tool-8-investment-tool/scripts/index.html` lines 666-730 |
| bindPair (slider sync) | `/apps/Tool-8-investment-tool/scripts/index.html` lines 881-946 |
| recalc (master calc) | `/apps/Tool-8-investment-tool/scripts/index.html` lines 1009-1176 |
| Scenario management | `/apps/Tool-8-investment-tool/scripts/index.html` lines 1210-1399 |
| Comparison UI | `/apps/Tool-8-investment-tool/scripts/index.html` lines 1401-1607 |
| Tutorial modal | `/apps/Tool-8-investment-tool/scripts/index.html` lines 1689-1706 |
| Tool6 trauma section (template) | `/tools/tool6/Tool6.js` lines 3185-3320 |
| Tool6 backup questions (template) | `/tools/tool6/Tool6.js` lines 290-327 |
| Tool4 trauma modifiers (template) | `/tools/tool4/Tool4.js` lines 6109-6204 |
| Tool6 slider CSS (CRITICAL) | `/tools/tool6/Tool6.js` line ~5188 |
| Dashboard card pattern | `core/Router.js` → `_buildTool7Card()` method |
