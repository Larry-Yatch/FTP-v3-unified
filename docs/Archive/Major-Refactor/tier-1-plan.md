# Tier 1 Execution Plan: Performance + Zero-Risk Extractions

> **Goal:** Improve application speed and extract duplicated code — without changing any tool behavior.
> **Risk level:** Zero for all 6 phases. No logic changes, only caching, payload reduction, and code relocation.

---

## Phase 1: Data Layer Caching (HIGHEST IMPACT) — COMPLETE

> **Status:** Done (commits `68be458`, `0a1fe70`, `5b263bc`)
> **Completed:** Phase 1a (ResponseManager), 1b (DataService), 1c (remaining core files)

### The Problem
`ResponseManager.getLatestResponse()` at `core/ResponseManager.js:46` calls `sheet.getDataRange().getValues()` — loading the ENTIRE RESPONSES sheet every time. Tool 6 makes 10+ of these calls per render (lines 84-89, 8275-8276, 8610-8611, 8758).

A caching utility already exists at `core/SpreadsheetCache.js:66` (`getSheetData()`) with cache invalidation (`invalidateSheetData()`) — but **no file in the codebase uses it**.

### Files to Modify

**`core/ResponseManager.js`** (9 call sites)
- Lines 46, 110, 163, 369, 442, 503, 591, 623, 679
- Replace: `const data = sheet.getDataRange().getValues();`
- With: `const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);`
- For methods that write data, add `SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);` after the write

**`core/DataService.js`** (7 call sites)
- Lines 111, 179, 218, 270, 315, 342, 421
- Same replacement pattern
- Identify which methods write vs read — add invalidation after writes

**`core/Authentication.js`** (2 call sites)
- Lines 44, 132
- Replace with `SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS)` (or whatever sheet name)

**`core/ToolAccessControl.js`** (3 call sites)
- Lines 243, 273, 325
- Replace with cached version

**`core/InsightsPipeline.js`** (3 call sites)
- Lines 111, 283, 334
- Replace with cached version

### Key Consideration
Some methods in ResponseManager need the sheet object (not just data) because they write rows. For these:
- Keep `SpreadsheetCache.getSheet()` for the write operation
- But use `SpreadsheetCache.getSheetData()` for the read portion
- Call `invalidateSheetData()` after any write

### Verification
1. Load Tool 6 for a test client — should render correctly with all upstream data
2. Submit a tool response — verify it saves and appears in subsequent loads
3. Check SpreadsheetCache stats (call `SpreadsheetCache.getStats()`) — should show cache hits

---

## Phase 2: HTML Payload Reduction — COMPLETE

> **Status:** Done (commit `aca1e65`)
> Added `includeHistoryManager` option to `buildStandardPage()` (default: true). Report pages pass false.

### The Problem
Every page includes `shared/history-manager.html` (40,593 lines / ~40KB). Report pages and single-page tools never use history management.

### Files to Modify

**`core/FormUtils.js` → `buildStandardPage()` (~line 363)**
- Add `options.includeHistoryManager` parameter (default: `true`)
- When false, skip the history-manager include

**`core/Router.js`**
- For report page renders, pass `includeHistoryManager: false`
- Dashboard and multi-page tool forms keep the default (true)

**Optional: `shared/history-manager.html`**
- Evaluate if it can be split: lightweight stub (always included) + full implementation (on demand)
- This is optional — even just skipping it for reports is a significant win

### Verification
1. Load dashboard — history/back button navigation works
2. Navigate through a multi-page tool (e.g., Tool 3) — back button works
3. Load a report page — renders correctly, loads faster
4. Load Tool 6 (single-page) — evaluate if history manager is needed

---

## Phase 3: Logger Cleanup — COMPLETE

> **Status:** Done (commits `0bacf68` Phase 3a, `4b51fe7` Phase 3b)
> Created `shared/LogUtils.js` with PropertiesService-backed toggle.
> Admin debug toggle button deployed and tested in AdminDashboard.
> All server-side Logger.log/console.log calls converted across 30 files.

### The Problem
265+ `Logger.log()` calls across production code. Tool 6 alone has 145. Each has overhead in GAS.

### What Was Built

**`shared/LogUtils.js`** — Enhanced version with PropertiesService persistence:
- `LogUtils.init()` — reads debug flag from ScriptProperties (called once per request in doGet/doPost)
- `LogUtils.toggle()` — flips the flag (called from admin dashboard button)
- `LogUtils.getStatus()` — returns current state
- `LogUtils.debug(msg)` — only logs when enabled
- `LogUtils.error(msg)` — always logs with [ERROR] prefix
- `LogUtils.warn(msg)` — always logs with [WARN] prefix
- `LogUtils.info(msg)` — always logs

**Admin UI** — Debug toggle card in AdminDashboard.html (ON/OFF button, persists across sessions)

### Phase 3a — COMPLETE
Converted all Logger.log/console.log/console.error calls in 10 core files:
- `core/ResponseManager.js`, `core/DataService.js`, `core/Authentication.js`
- `core/FrameworkCore.js`, `core/InsightsPipeline.js`, `core/Router.js`
- `core/ToolAccessControl.js`, `core/ToolRegistry.js`, `core/SpreadsheetCache.js`
- `Code.js` (entry points + wrapper functions)

### Phase 3b — COMPLETE
Converted all server-side calls in 20 tool files:
- 8 main tool files (Tool1-8.js): ~276 server-side calls converted
- 4 GPT analysis files (Tool2/4/6/8GPTAnalysis.js): ~86 calls
- 6 report files (Tool1-8Report.js + GroundingReport): ~30 calls
- 2 grounding files (GroundingGPT.js, GroundingFallbacks.js): ~45 calls
- 83 client-side console calls in template strings left untouched (correct)

### Verification
1. With toggle OFF: tools work normally, console output is minimal
2. With toggle ON: full debug logging appears in GAS Execution log
3. Admin dashboard toggle tested and working

---

## Phase 4: Shared Utility Extraction — COMPLETE

> **Status:** Done
> Created `shared/FormatUtils.js` with `currency()`, `percentage()`, `escapeHtml()`.
> Tool4 server-side `formatDollars` (line 6676, in `generateComparisonNarrative`) now uses `FormatUtils.currency()`.

### The Problem
- `formatDollars()` defined twice in Tool 4 (lines 2714 and 6676)
- `formatCurrency()` in Tool 6 (line 5750) — same concept, different name
- `escapeHtml()` in Tool 6 (line 6228) — generic utility stuck in tool-specific file

### What Was Built

**`shared/FormatUtils.js`** — Server-side formatting utilities:
- `FormatUtils.currency(amount)` — returns `'$1,250'`
- `FormatUtils.percentage(value, decimals)` — returns `'25%'`
- `FormatUtils.escapeHtml(text)` — regex-based HTML entity escaping

### Audit Findings

| Function | Location | Context | Action |
|----------|----------|---------|--------|
| `formatDollars` | Tool4.js:2714 | Client-side | Kept (only definition in its script scope) |
| `formatDollars` | Tool4.js:6676 | **Server-side** (`generateComparisonNarrative`) | Replaced with `FormatUtils.currency()` |
| `formatCurrency` | Tool6.js:5750 | Client-side | Kept (only definition in its script scope) |
| `escapeHtml` | Tool6.js:6228 | Client-side | Kept (only definition in its scope) |
| `escapeHtml` | GroundingFormBuilder.js:617 | Server-side | Kept (class method, FormatUtils available for future use) |
| `escapeHtml` | AdminDashboard.html:1127 | Client-side | Kept |

**Key finding:** The plan originally assumed both Tool4 `formatDollars` definitions were client-side. The second (line 6676) is actually server-side and was directly updated to use `FormatUtils.currency()`. Tool6's `formatCurrency` and `escapeHtml` are each defined once in their client-side scope, so no consolidation was needed.

### Verification
1. Tool 4 guardrail messages display correct dollar amounts
2. Tool 6 projection values display correctly
3. Tool 6 scenario names escape HTML properly

---

## Phase 5: Code.js PDF Wrapper Consolidation — COMPLETE

> **Status:** Done
> Created `_generatePDFForTool(clientId, toolId, generatorFn)` shared helper.
> 9 PDF wrapper functions (150+ lines) consolidated to ~30 lines + 23-line helper.
> Uses `LogUtils.error` (not `Logger.log`). Admin wrappers unchanged (unique logic).

### The Problem
Code.js had 9 nearly identical PDF generation wrapper functions taking ~150 lines.

### What Was Built

**`Code.js`** — Added `_generatePDFForTool(clientId, toolId, generatorFn)`:
- Accepts a no-arg closure as `generatorFn` (enables any argument signature)
- Handles activity logging on success
- Wraps in try/catch with `LogUtils.error`
- Returns `{ success: false, error }` on failure

**9 wrappers consolidated:**

| Function | Before | After |
|----------|--------|-------|
| `generateTool1PDF` | 12 lines | 1-line delegation |
| `generateTool2PDF` | 12 lines | 1-line delegation |
| `generateTool3PDF` | 12 lines | 1-line delegation |
| `generateTool5PDF` | 12 lines | 1-line delegation |
| `generateTool7PDF` | 12 lines | 1-line delegation |
| `generateTool4MainPDF` | 12 lines | 1-line delegation |
| `generateTool4ComparisonPDF` | 12 lines | 1-line delegation |
| `generateTool8PDF` | 18 lines | 2-line delegation (registerTools + helper) |
| `generateTool8ComparisonPDF` | 18 lines | 2-line delegation (registerTools + helper) |

**Not changed:** Admin wrappers (`adminGenerateTool4PDF`, `adminGenerateTool6PDF`, `adminGenerateTool8PDF`) — these have unique server-side data-fetching logic.

### Verification
1. Generate PDF for Tool 1 and Tool 6 — verify PDFs are correct
2. Check activity log — verify pdf_downloaded entries appear

---

## Phase 6: Constants Extraction — COMPLETE

> **Status:** Done
> Created `Tool2Constants.js` (5 config objects) and `Tool4Constants.js` (4 config objects).
> Tool2.js and Tool4.js updated to reference constants. ~95 lines of inline config relocated.

### The Problem
Only Tools 6 and 8 had dedicated Constants files. Tools 2 and 4 embedded configuration inline.

### What Was Built

**`tools/tool2/Tool2Constants.js`:**
- `DOMAIN_QUESTIONS` — 5 domains with their question field arrays
- `MAX_SCORES` — max possible points per domain
- `STRESS_WEIGHTS` — priority weighting factors
- `ARCHETYPES` — domain-to-archetype display labels
- `REQUIRED_INSIGHTS` — insight types needed for final submission

**`tools/tool4/Tool4Constants.js`:**
- `ALLOCATION_CONFIG` — V1 algorithm parameters (satisfaction, essential tiers, mod limits)
- `BASE_WEIGHTS` — 10 priorities with MEFJ allocation percentages
- `DEFAULT_WEIGHTS` — fallback when priority not found
- `TRAUMA_PRIORITY_MAP` — 6 trauma patterns with boost/penalty priority lists

### Files Modified
- `tools/tool2/Tool2.js` — 4 methods updated: `calculateDomainScores`, `applyBenchmarks`, `applyStressWeights`, `determineArchetype`, plus `requiredInsights` in `processFinalSubmission`
- `tools/tool4/Tool4.js` — 2 methods updated: `calculateAllocationV1`, `getTraumaPriorityModifiers`

### Not Extracted (correct)
- Tools 1, 3, 5, 7: Tool 1 has `Tool1Templates.js`, Tools 3/5/7 use shared `core/grounding/` config
- Client-side config (inside template literals): cannot reference server-side constants

### Verification
1. Tool 2 scoring produces same results
2. Tool 4 allocation buckets and guardrails work identically

---

## Execution Rules

1. **Complete one phase before starting the next**
2. **Commit after each phase** with message format: `refactor(tier1): Phase X - description`
3. **Test Tool 6 after every phase** (most complex, touches most upstream data)
4. **Test Tool 4 after Phases 1, 4, 5, 6** (affected by those changes)
5. **If something breaks, revert the phase** — do not debug forward
6. **Update `SESSION-GUIDE.md`** after each phase completes

## What Tier 1 Does NOT Include

- Consolidating form-tool boilerplate into a base class (Tier 2)
- Standardizing error handling patterns (Tier 3)
- Reducing inline CSS in calculator tools (Tier 3)
- Breaking up Tool 6's 9K-line file (Tier 4)
- Breaking up Tool 4's 7K-line file (Tier 4)
- Adding missing manifest files (Tier 3)
- Modifying GPT call patterns (Tier 3+)
