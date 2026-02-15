# Major Refactor Roadmap

## Why

All 8 tools are built and working. The application is slow and the codebase has accumulated duplication and inconsistency across tools built over many months. This refactor improves performance, reduces duplication, and standardizes patterns — without breaking existing functionality.

## Strategy: 4 Tiers of Risk

Each tier completes and is verified before the next begins. Never refactor and add features simultaneously.

### Tier 1: Performance + Zero-Risk Extractions (CURRENT)
**Risk: None** — No behavior changes. Cache data, reduce payloads, move duplicated code to shared locations.
- Data layer caching (biggest performance win)
- HTML payload reduction
- Logger cleanup
- Shared utility extraction (FormatUtils)
- Code.js PDF wrapper consolidation
- Constants extraction

### Tier 2: Form Tool Consolidation
**Risk: Low** — Tools 1, 2, 3, 5, 7 share 95% identical boilerplate. Extract to base class/shared module.
- Common `render()` method
- Common `getExistingData()` method
- Common `processFinalSubmission()` method
- EditMode banner standardization
- Saves 500+ lines of duplicate code

### Tier 3: Cross-Cutting Standardization
**Risk: Medium** — Touches more files but each change is isolated.
- Standardize error handling across all 8 tools
- Reduce inline CSS in Tools 4, 6, 8 (currently 58-243 inline styles each)
- Standardize report generation patterns
- Add missing manifest files for Tools 2, 3, 5

### Tier 4: Individual Tool Surgery
**Risk: High** — Internal refactoring of the largest tools. Each tool is its own project.
- Tool 6 (9,086 lines) — break into smaller modules
- Tool 4 (7,224 lines) — break into smaller modules
- Tool 8 (2,594 lines) — evaluate if needed
- Requires baseline output capture and verification

## Key Principles

1. **One tier at a time** — complete and verify before moving on
2. **One phase at a time within each tier** — commit after each
3. **Test before AND after** — capture outputs as baselines, verify they match
4. **Never modify tool logic during refactoring** — only move code, add caching, reduce payloads
5. **Never refactor and add features at the same time**
6. **Small, reversible commits** — easy to roll back if something breaks

## Tier Status

| Tier | Status | Phases | Notes |
|------|--------|--------|-------|
| Tier 1 | **Not Started** | 6 phases | See `tier-1-plan.md` |
| Tier 2 | Planned | TBD | Plan after Tier 1 completes |
| Tier 3 | Planned | TBD | Plan after Tier 2 completes |
| Tier 4 | Planned | TBD | Plan after Tier 3 completes |

## Architecture Context

The codebase has two distinct architectures:

**Form-based tools (1, 2, 3, 5, 7):**
- Multi-page, FormUtils-driven
- ~700-1,900 lines each
- Share 95% identical boilerplate (render, getExistingData, processFinalSubmission)
- Use shared styles via `shared/styles.html`

**Calculator tools (4, 6, 8):**
- Single-page, custom-built
- 2,594-9,086 lines each
- Custom navigation, styling, state management
- Heavy inline CSS (58-243 styles per tool)
- More complex data dependencies (pull from multiple upstream tools)

## File Index

| File | Purpose |
|------|---------|
| `SESSION-GUIDE.md` | Start here for any new session |
| `README.md` | This file — full roadmap |
| `codebase-audit.md` | Raw data: line counts, file sizes, architecture |
| `performance-analysis.md` | Bottleneck analysis with file paths |
| `duplication-analysis.md` | Code patterns duplicated across tools |
| `tier-1-plan.md` | Detailed Tier 1 execution plan |
| `completed/` | Finished phase docs move here |
