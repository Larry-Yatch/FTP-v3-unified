# Progress Over Time Feature

> **Status:** **LIVE** end-to-end as of 2026-04-20. Student view has been live since commit `28e384f`; the coach-view "View Progress Over Time" button was added to the admin dashboard on 2026-04-20, closing the last open item from the original plan. Data infrastructure, both UIs, write hooks in `DataService` and `ResponseManager`, and a GPT-powered narrative layer are all active. The Feb 18 2026 "coming soon" stub (commit `35ecdcb`) was superseded.
> **Type:** Reference document — describes the feature architecture and implementation decisions.
> **Doc last synced to code:** 2026-04-20

## What This Is

A page in Financial TruPath v3 that shows students (and coaches) how their assessment results have changed across multiple completions of the same tool over time.

## Scope

**Tools covered:** 1, 2, 3, 5, 7 (psychological assessments + financial clarity)
**Not included:** Tools 4, 6, 8 (calculators with scenario-based storage — they track parallel "what-if" plans, not sequential retakes)

## Why This Feature Exists

Students retake assessments 3-4 times over a course year. Currently, only the latest results are visible — previous completions are overwritten in the UI (and actively pruned from RESPONSES after 2 versions by `ResponseManager._cleanupOldVersions()`). Students and coaches have no way to see progress or regression.

## Key Design Decisions

1. **Dedicated `PROGRESS_HISTORY` sheet** — One shared sheet for all 5 tools (not per-tool sheets). Needed because the existing RESPONSES sheet only keeps the last 2 completed rows per client/tool.

2. **Extracted scores only** — History rows store a compact JSON of key metrics (~200-500 chars), not the full response payload. Keeps the sheet fast and avoids hitting cell size limits.

3. **10-version cap per client+tool** — FIFO deletion (oldest removed when 11th saved), matching the calculator scenario pattern.

4. **Inline SVG trend lines** — No external chart library (GAS constraint). Pure `<svg>` elements with `<polyline>` and `<circle>` for sparkline-style trend charts.

5. **Both student and coach access** — Students see their own progress from the dashboard. Coaches see any student's progress from the admin panel.

## Architecture

```
core/ProgressHistory.js     — Data layer (read/write PROGRESS_HISTORY sheet, FIFO cap, migration)
core/ProgressNarrative.js   — AI narrative layer (cross-tool synthesis + per-tool deep-dive,
                              GPT → retry → template fallback, cached in PropertiesService)
shared/ProgressPage.js      — UI layer (HTML page, inline SVG sparklines, overview strip,
                              collapsible tool sections, client-side chain-loader JS)
```

**Hook points:** Two write hooks, both active:
- `DataService.saveToolResponse()` → `ProgressHistory.recordCompletion()` on every COMPLETED save (`core/DataService.js:65–68`)
- `ResponseManager.submitEditedResponse()` → `ProgressHistory.recordCompletion()` on every edit-resubmit (`core/ResponseManager.js:424–427`)

**Navigation:**
- Student — "Progress Over Time" button renders beside "View Collective Results" in the Results Summary card on the student dashboard, but only when `completedToolCount > 0` (`core/Router.js:902`). Click invokes `viewProgress()` (`core/Router.js:1108–1124`), which hits `google.script.run.getProgressPage(clientId)`.
- Coach — "View Progress Over Time" button in the per-student Reports panel (`html/AdminDashboard.html`, next to "View Consolidated Dashboard") invokes `viewProgressOverTime()` → `google.script.run.getStudentProgressPage(clientId)` → `AdminRouter.handleGetStudentProgressRequest` → `ProgressPage.render(clientId, { isCoach: true, studentName })`.
- Direct URL — `?route=progress&client=<id>` also works (route is whitelisted at `core/Router.js:48`).

## Documentation

- `IMPLEMENTATION-PLAN.md` — Full implementation plan with schema, file changes, phases, and verification steps

## Data Flow

```
Student completes tool
  → DataService.saveToolResponse(status='COMPLETED')
    → ProgressHistory.recordCompletion(clientId, toolId, data)
      → Extracts key scores (tool-type-aware)
      → Appends row to PROGRESS_HISTORY
      → Enforces 10-version cap

Student views progress page
  → ProgressHistory.getAllHistory(clientId)
    → Reads PROGRESS_HISTORY, groups by Tool_ID
    → Returns sorted entries per tool
  → ProgressPage.render(clientId)
    → Generates SVG trend charts per metric
    → Returns full HTML page
```

## What Scores Are Tracked

| Tool | Metrics Tracked |
|------|----------------|
| Tool 1 | 6 strategy scores (FSV, ExVal, Showing, Receiving, Control, Fear) + dominant strategy |
| Tool 2 | 5 domain scores (moneyFlow, obligations, liquidity, growth, protection) + archetype |
| Tool 3 | Overall quotient + 2 domain quotients + 6 subdomain quotients |
| Tool 5 | Same as Tool 3 |
| Tool 7 | Same as Tool 3 |

## Important Notes for Future Development

- **Grounding tools (3, 5, 7) use inverted scoring** — Lower quotient = healthier. The UI must show decreases as improvement (green) and increases as regression (red). Enforced via `ProgressNarrative.INVERTED_TOOLS = ['tool3', 'tool5', 'tool7']` and the matching rendering logic in `ProgressPage.js`.
- **GAS constraints apply** — No npm packages, no `window.location.reload()`, no escaped apostrophes in template literals. Follow all rules in CLAUDE.md.
- **Migration is idempotent** — `migrateFromResponses()` backfills history from existing RESPONSES rows and tracks migrated pairs, so running it multiple times is safe. Exposed as `migrateProgressHistory()` in `Code.js` for on-demand dev use.
- **AI narratives layer** — `core/ProgressNarrative.js` adds GPT-generated commentary on top of the raw charts: a cross-tool synthesis paragraph and a per-tool "What Changed / Why It Matters / Focus Next" deep dive. Cached per client in `PropertiesService`; the cache is invalidated on each new `recordCompletion` so narratives stay in sync with the latest data.
- **No feature flag** — There is no `ENABLE_PROGRESS` or similar toggle. The two write hooks use a `typeof ProgressHistory !== 'undefined'` guard against load-order issues, but that is not a kill switch. To re-disable the feature, the button at `core/Router.js:902` and the `viewProgress()` function at `core/Router.js:1108–1124` would need to be stubbed (the approach used in the reverted commit `35ecdcb`).
- **Coach UI shipped 2026-04-20.** The "View Progress Over Time" button in `html/AdminDashboard.html` (next to "View Consolidated Dashboard") calls `google.script.run.getStudentProgressPage(clientId)` via `viewProgressOverTime()`. All phases of the original plan are now complete.
