# Progress Over Time Feature

## What This Is

A new page in Financial TruPath v3 that shows students (and coaches) how their assessment results have changed across multiple completions of the same tool over time.

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
core/ProgressHistory.js     — Data layer (read/write PROGRESS_HISTORY sheet)
shared/ProgressPage.js      — UI layer (HTML generation for the progress page)
```

**Hook point:** `DataService.saveToolResponse()` calls `ProgressHistory.recordCompletion()` on every COMPLETED save.

**Navigation:** Button next to "View Results Summary" on the student dashboard. "View Progress" button in admin student detail panel.

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

- **Grounding tools (3, 5, 7) use inverted scoring** — Lower quotient = healthier. The UI must show decreases as improvement (green) and increases as regression (red).
- **GAS constraints apply** — No npm packages, no `window.location.reload()`, no escaped apostrophes in template literals. Follow all rules in CLAUDE.md.
- **Migration required** — A one-time `migrateFromResponses()` function backfills history from existing RESPONSES rows. Safe to run multiple times (idempotent).
