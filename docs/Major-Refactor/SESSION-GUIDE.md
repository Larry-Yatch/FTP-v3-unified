# SESSION GUIDE - Start Here

> Last updated: Feb 15, 2026
> Status: **Tier 2 COMPLETE — all 4 phases done**

## Current State

Tier 2 (Form Tool Consolidation) is complete. All 4 phases delivered: FormToolBase, GroundingToolBase + Tools 3/5/7 migration, Tool 1 migration, Tool 2 migration. ~1,800 lines of duplicate boilerplate eliminated.

## What To Work On Next

**Tier 3: Cross-Cutting Standardization** — Standardize error handling, reduce inline CSS, standardize report patterns. Plan needs to be written before execution.

## Quick Reference

| Doc | When to Read |
|-----|-------------|
| `tier-1-plan.md` | Executing Tier 1 — self-contained, read this + SESSION-GUIDE only |
| `codebase-audit.md` | Need raw line counts, file sizes, architecture overview |
| `performance-analysis.md` | Need details on specific bottlenecks |
| `duplication-analysis.md` | Need details on code patterns across tools |
| `README.md` | Need the full 4-tier roadmap and principles |

## Critical Rules (Always Apply)

1. **NEVER** use `window.location.reload()` or `window.location.href` — see `docs/Navigation/GAS-NAVIGATION-RULES.md`
2. **NEVER** use escaped apostrophes in template literals — use "do not" not "don't"
3. **NEVER** remove Tool 6 slider CSS (`::-webkit-slider-runnable-track`)
4. Tool `render()` MUST return `HtmlService.createHtmlOutput()` — raw strings break `google.script.run`
5. One phase at a time, commit after each, test before and after

## Completed Phases

### Phase 1: Data Layer Caching (Feb 14, 2026)
- Wired `SpreadsheetCache.getSheetData()` into 12 read-only call sites across 5 files
- Added 14 `invalidateSheetData()` calls after all write operations
- Files modified: ResponseManager.js, DataService.js, Authentication.js, ToolAccessControl.js, InsightsPipeline.js
- Fixed TDZ bug: renamed `const data` to `const sheetData` in `submitEditedResponse()` to avoid shadowing the `data` parameter
- Verified: login, dashboard, upstream data loading, tool submission, completion status, locked tool display

### Phase 2: HTML Payload Reduction (Feb 14, 2026)
- Added `includeHistoryManager` option (default: `true`) to `FormUtils.buildStandardPage()`
- When `false`, skips the 40KB `shared/history-manager.html` include and its init script
- Finding: only Tool8Report.js included history-manager unnecessarily among reports; all tool pages need it
- File modified: FormUtils.js

### Phase 3: Logger Cleanup (Feb 14, 2026)
- Created `shared/LogUtils.js` with PropertiesService-backed debug toggle
- Admin debug toggle button in AdminDashboard
- Phase 3a: Converted all Logger.log/console.log calls in 10 core files
- Phase 3b: Converted all server-side calls in 20 tool files (~276 + 86 + 30 + 45 calls)
- 83 client-side console calls in template strings left untouched (correct)
- Bug fix: Added lazy-init in `debug()` so `google.script.run` calls see the flag

### Phase 4: Shared Utility Extraction (Feb 15, 2026)
- Created `shared/FormatUtils.js` with `currency()`, `percentage()`, `escapeHtml()`
- Tool4 server-side `formatDollars` (line 6676, in `generateComparisonNarrative`) now uses `FormatUtils.currency()`
- Audit finding: Tool4 line 2714 is client-side (kept), Tool6 formatCurrency/escapeHtml are client-side singletons (kept)
- FormatUtils available for future server-side use across all tools and reports

### Phase 5: PDF Wrapper Consolidation (Feb 15, 2026)
- Created `_generatePDFForTool(clientId, toolId, generatorFn)` shared helper in Code.js
- 9 PDF wrappers (Tools 1,2,3,4,5,7,8) consolidated from 150+ lines to 1-2 line delegations
- Helper uses no-arg closures so any argument signature works (clientId-only, extra args, different generators)
- Uses `LogUtils.error` (not `Logger.log`), adds try/catch to all wrappers
- Admin wrappers unchanged (unique server-side data-fetching logic)

### Phase 6: Constants Extraction (Feb 15, 2026)
- Created `tools/tool2/Tool2Constants.js` — 5 config objects (domain questions, max scores, stress weights, archetypes, required insights)
- Created `tools/tool4/Tool4Constants.js` — 4 config objects (allocation config, base weights, default weights, trauma priority map)
- Tool2.js: 4 methods + 1 variable updated to reference Tool2Constants
- Tool4.js: 2 methods updated to reference Tool4Constants
- ~95 lines of inline config relocated to dedicated files

### Tier 2, Phase 1: FormToolBase (Feb 15, 2026)
- Created `core/FormToolBase.js` (188 lines) — shared render(), getExistingData(), savePageData()
- Config resolution: `this.formConfig` (Tool1/2) OR fallback to `this.config` (Tool3/5/7)
- Handles editMode/clearDraft URL params, EditModeBanner, page validation, FormUtils wrapping
- Optional hooks: getCustomValidation(), onPageSaved()

### Tier 2, Phase 2: GroundingToolBase + Tools 3, 5, 7 (Feb 15, 2026)
- Created `core/grounding/GroundingToolBase.js` (390 lines) extending FormToolBase
- Shared: renderPageContent, onPageSaved (GPT trigger), processFinalSubmission, scoring helpers, report generation
- Tool3.js: 987→488 lines, Tool5.js: 986→488 lines, Tool7.js: 986→487 lines
- ~1,500 lines of duplicate code eliminated
- Bug fix: ResponseManager.cancelEditDraft stale row index + orphaned DRAFT cleanup in saveToolResponse

### Tier 2, Phase 3: Tool 1 Migration (Feb 15, 2026)
- Tool1.js migrated to Object.assign({}, FormToolBase, {...})
- Added formConfig, getCustomValidation (page 5 ranking validation)
- Removed render(), getExistingData(), savePageData(), EditModeBanner from renderPageContent
- Tool1.js: 700→547 lines (~153 lines removed)

### Tier 2, Phase 4: Tool 2 Migration (Feb 15, 2026)
- Tool2.js migrated to Object.assign({}, FormToolBase, {...})
- Added formConfig, removed render() and EditModeBanner from renderPageContent
- Kept savePageData() override (extra DraftService args + GPT trigger)
- Kept getExistingData() override (different merge order: EDIT_DRAFT → Props → DRAFT)
- Tool2.js: 1,857→1,764 lines (~93 lines removed)

## Phase Tracking

- [x] Tier 1, Phase 1: Data layer caching
- [x] Tier 1, Phase 2: HTML payload reduction (history-manager conditional loading)
- [x] Tier 1, Phase 3: Logger cleanup (LogUtils utility)
- [x] Tier 1, Phase 4: Shared utility extraction (FormatUtils)
- [x] Tier 1, Phase 5: Code.js PDF wrapper consolidation
- [x] Tier 1, Phase 6: Constants extraction
- **Tier 1 COMPLETE**
- [x] Tier 2, Phase 1: FormToolBase (shared render/getExistingData/savePageData)
- [x] Tier 2, Phase 2: GroundingToolBase + Tools 3, 5, 7 migration
- [x] Tier 2, Phase 3: Tool 1 migration
- [x] Tier 2, Phase 4: Tool 2 migration
- **Tier 2 COMPLETE**
