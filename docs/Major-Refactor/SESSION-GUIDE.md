# SESSION GUIDE - Start Here

> Last updated: Feb 14, 2026
> Status: **Tier 1 in progress — Phase 1 complete**

## Current State

Phase 1 (Data Layer Caching) complete and verified. 12 read-only sheet calls now served from SpreadsheetCache across 5 core files. 14 invalidation calls added after all write operations. Also fixed a pre-existing temporal dead zone bug in `ResponseManager.submitEditedResponse()`.

## What To Work On Next

**Tier 1, Phase 2: HTML Payload Reduction** — Add `includeHistoryManager` option to `FormUtils.buildStandardPage()`. Skip the 40KB `history-manager.html` include for report pages and single-page tools. See `tier-1-plan.md` Phase 2.

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

## Phase Tracking

- [x] Tier 1, Phase 1: Data layer caching
- [ ] Tier 1, Phase 2: HTML payload reduction (history-manager conditional loading)
- [ ] Tier 1, Phase 3: Logger cleanup (LogUtils utility)
- [ ] Tier 1, Phase 4: Shared utility extraction (FormatUtils)
- [ ] Tier 1, Phase 5: Code.js PDF wrapper consolidation
- [ ] Tier 1, Phase 6: Constants extraction
