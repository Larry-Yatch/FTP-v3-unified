# SESSION GUIDE - Start Here

> Last updated: Feb 15, 2026
> Status: **Tier 1 COMPLETE — all 6 phases done**

## Current State

Tier 1 (Performance + Zero-Risk Extractions) is complete. All 6 phases delivered: data caching, payload reduction, logger cleanup, shared utilities, PDF wrapper consolidation, and constants extraction.

## What To Work On Next

**Tier 2: Form Tool Consolidation** — Extract shared boilerplate from form-based tools (1, 2, 3, 5, 7) into a base class or shared module. Plan needs to be written before execution.

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

## Phase Tracking

- [x] Tier 1, Phase 1: Data layer caching
- [x] Tier 1, Phase 2: HTML payload reduction (history-manager conditional loading)
- [x] Tier 1, Phase 3: Logger cleanup (LogUtils utility)
- [x] Tier 1, Phase 4: Shared utility extraction (FormatUtils)
- [x] Tier 1, Phase 5: Code.js PDF wrapper consolidation
- [x] Tier 1, Phase 6: Constants extraction
- **Tier 1 COMPLETE**
