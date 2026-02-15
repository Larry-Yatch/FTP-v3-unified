# Collective Results Dashboard — Implementation Roadmap

## Overview

This roadmap breaks the Section 3 (Integration) build into 9 phases. Each phase is a self-contained coding session with its own document, test criteria, and no dependency on future phases.

**Rule:** Each phase must pass its tests before moving to the next.

## Architecture Summary

Two views of the same detection engines:

| View | Who | Where | Tone |
|------|-----|-------|------|
| **Student View** | Student logged in | `CollectiveResults.js` Section 3 | Direct, profiles, warnings |
| **Coach View** | Admin/coach logged in | `AdminRouter.js` student detail | Full analytics, coaching recs |

## Phase Documents

| Phase | Document | What It Does | Estimated Size |
|-------|----------|-------------|----------------|
| 1 | `01-PHASE-Constants-and-Profile-Engine.md` | Add profile constants + detection function | ~60 lines of code |
| 2 | `02-PHASE-Warning-Engine.md` | Add warning detection function | ~120 lines of code |
| 3 | `03-PHASE-Belief-Lock-and-Gap-Engines.md` | Add belief lock + awareness gap + belief-behavior gap functions | ~150 lines of code |
| 4 | `04-PHASE-Render-Profile-and-Warnings.md` | Replace Section 3 placeholder with profile card + warning cards. Creates `engines` object pattern (run engines once, pass results) | ~200 lines of code + CSS |
| 5 | `05-PHASE-Render-Locks-and-Gaps.md` | Add belief lock chains + awareness gap bars + gap table. Uncomments remaining engines in `engines` object | ~200 lines of code + CSS |
| 6 | `06-PHASE-Coach-View.md` | Add coach integration analysis page to admin section (separate page, runs engines independently) | ~250 lines across multiple files |
| 7 | `07-PHASE-Polish-and-Edge-Cases.md` | Responsive layout, animations, edge cases, final testing | Modifications only |
| 8 | `08-PHASE-Integration-Report-GPT-Engine.md` | GPT narrative engine with 3-tier fallback. Handles sparse data (sections may be empty) | ~250 lines (new file) |
| 9 | `09-PHASE-Report-Rendering-PDF-Button.md` | Report HTML + PDF + download button + `_checkReportReadiness()` + incomplete data handling | ~280 lines across 3 files |

## Dependency Chain

```
Phase 1 (Profile Engine)
    |
Phase 2 (Warning Engine)
    |
Phase 3 (Lock + Gap Engines)
    |
    +---> Phase 4 (Render Profile + Warnings)
    |         |
    |     Phase 5 (Render Locks + Gaps)
    |         |                \
    |     Phase 7 (Polish)      \
    |                            \
    +---> Phase 6 (Coach View) ---+---> Phase 7 (Polish)
    |
    +---> Phase 8 (GPT Narrative Engine)  <-- only needs Phases 1-3
              |
          Phase 9 (PDF Report + Button)   <-- needs Phase 5 + Phase 8
```

Phases 4-5 and Phase 6 can run in parallel once Phase 3 is done.
Phase 8 can run after Phases 1-3 (it only needs the detection engines, not the UI).
Phase 9 runs after Phase 5 + Phase 8 (it adds the download button to the rendered Section 3).

## File Modification Map

| File | Phase(s) |
|------|----------|
| `core/CollectiveResults.js` | 1, 2, 3, 4, 5, 7, 9 |
| `AdminRouter.js` | 6 |
| `Code.js` | 9 |
| `core/IntegrationGPT.js` | 8 (new file) |
| `shared/PDFGenerator.js` | 9 |

## Coding Session Rules

When starting a coding session for any phase:

1. **Load only that phase document** — do not load other phase docs
2. **Read the file(s) listed** in "Files to Read First" section of that phase
3. **Build the code** following the spec
4. **Run the test function** listed at the bottom of the phase doc
5. **Verify the checklist** — every box must pass before moving on

## Key Architecture Decisions

1. **Engine-based gating (not tool count):** Section 3 visibility is based on whether detection engines produce output, not on `completedCount`. This means Tool 1 + Tool 3 (2 tools) shows full content, but Tool 2 + Tool 4 + Tool 6 (3 tools, all financial) shows "Almost there."

2. **Engines run once per page load:** `_renderSection3()` computes all engine results into an `engines` object at the top. Phases 5 and 9 use this object instead of re-calling engines. Server-side PDF generation uses `_checkReportReadiness()` which runs engines fresh (separate request).

3. **Report readiness = 2+ populated sections:** The download button is active when at least 2 of 5 report sections have data. The PDF includes explanatory "missing section" boxes for incomplete sections, and an "Unlock More Insights" summary at the bottom.

4. **Sparse data handling flows through all layers:**
   - GPT system prompt says: skip sections with no data, ALWAYS generate synthesis + actions
   - Fallback narrative: generates "Based on tools completed so far..." when profile is null
   - PDF body builder: shows dashed-border placeholders for missing sections
   - Action items: include "Complete Tool X" suggestions when tools are missing

## GAS Safety Reminders (Apply to Every Phase)

- No `window.location.reload()` or `location.href` — use `document.write()` pattern
- No escaped apostrophes in template literals — use full words ("do not" not "don't")
- No contractions in user-facing messages
- All field access uses optional chaining or null checks
- Test with students who have 0, 1, 2, 3, and 8 tools completed
- Test with students who have only financial tools (no Tool 1) — engines should produce nothing
