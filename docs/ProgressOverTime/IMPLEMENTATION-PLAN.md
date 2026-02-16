# Progress Over Time — Implementation Plan

## Context

Students retake psychological assessments (Tools 1, 2, 3, 5, 7) as they progress through the course — typically 3-4 times over a year. Currently, the app only shows the latest results. There is no way to see how scores have changed over time. This feature adds a "Progress Over Time" page that visualizes score trends across completions, accessible by both students and coaches.

**Why dedicated history sheets?** The existing `ResponseManager._cleanupOldVersions()` keeps only the last 2 COMPLETED rows in RESPONSES per client/tool. Historical data gets actively deleted on edit-resubmit, so we need a separate store.

**Scope:** Tools 1, 2, 3, 5, 7 only (not calculators 4, 6, 8).

---

## Architecture Decisions

### Single `PROGRESS_HISTORY` sheet (not per-tool sheets)
All 5 tools share one sheet with a `Tool_ID` column, matching the existing RESPONSES sheet pattern. Avoids 5 separate sheets and duplicated sheet-management code.

### Store extracted scores only (not full JSON blobs)
Each history row stores a small `Scores_JSON` object (~200-500 chars) with just the key metrics needed for comparison. No raw form data, no GPT insights. This keeps the sheet fast and avoids the 50,000-char cell limit.

### 10-version cap per client+tool, FIFO deletion
Matches the calculator scenario pattern. Oldest entry deleted when an 11th is saved.

### Inline SVG trend lines (not CSS bars)
With 3-4+ data points expected over a year, sparkline-style trend charts are more appropriate than side-by-side bars. Pure `<svg>` elements — no external chart library, fully compatible with GAS `document.write()` pattern.

---

## Sheet Schema: `PROGRESS_HISTORY`

| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When completion occurred |
| B | Client_ID | Student identifier |
| C | Tool_ID | tool1, tool2, tool3, tool5, tool7 |
| D | Version_Number | Sequential per client+tool (1, 2, 3...) |
| E | Scores_JSON | Extracted key metrics (see below) |
| F | Summary | One-line human-readable summary |
| G | Source | 'completion' or 'migration' |

### Scores_JSON per tool type:

**Tool 1:**
```json
{
  "scores": { "FSV": 8.2, "ExVal": 5.4, "Showing": 6.1, "Receiving": 3.8, "Control": 7.1, "Fear": 4.2 },
  "winner": "FSV"
}
```

**Tool 2:**
```json
{
  "domainScores": { "moneyFlow": 62, "obligations": 48, "liquidity": 35, "growth": 28, "protection": 55 },
  "archetype": "The Builder"
}
```

**Tools 3/5/7:**
```json
{
  "overallQuotient": 42,
  "domainQuotients": { "domain1": 38, "domain2": 46 },
  "subdomainQuotients": {
    "subdomain_1_1": 35, "subdomain_1_2": 40, "subdomain_1_3": 39,
    "subdomain_2_1": 50, "subdomain_2_2": 42, "subdomain_2_3": 46
  }
}
```

---

## Files to Create

### 1. `core/ProgressHistory.js` — Data layer

| Function | Purpose |
|----------|---------|
| `recordCompletion(clientId, toolId, data)` | Extract scores, append row, enforce cap |
| `extractScores(toolId, data)` | Tool-type-aware score extraction |
| `getAllHistory(clientId)` | Read all entries grouped by tool (for the page) |
| `getHistory(clientId, toolId)` | Read entries for one tool |
| `getNextVersion(clientId, toolId)` | Determine next version number |
| `enforceVersionCap(clientId, toolId, maxVersions)` | Delete oldest if > 10 |
| `initSheet()` | Create sheet with headers if missing |
| `migrateFromResponses()` | One-time backfill from existing RESPONSES data |

### 2. `shared/ProgressPage.js` — UI layer

| Function | Purpose |
|----------|---------|
| `render(clientId, options)` | Full HTML page (options: `{ isCoach, studentName }`) |
| `_renderToolSection(toolId, entries, toolMeta)` | One tool's trend section |
| `_renderTrendChart(dataPoints, label, options)` | SVG sparkline for one metric |
| `_renderEmptyState(toolId, toolMeta)` | "Not yet completed" / "Complete again to track" |
| `_getStyles()` | CSS for progress page |
| `_getScripts()` | Client-side JS (section expand/collapse, navigation) |

### Visualization Details

Each metric gets a small inline SVG trend chart:
- X-axis = completion dates (3-4+ points expected over a year)
- Y-axis = score value
- `<polyline>` for the trend line, `<circle>` for each data point
- Latest point highlighted with a larger dot + score label
- Overall delta shown (first vs latest) with arrow indicator
- Color: green trend for improvement, red for regression
- For grounding tools, lower = better (inverted: decrease = green, increase = red)

### Page Layout

Single scrollable page with collapsible tool sections. Each tool section shows:
- Header with tool name + overall trend indicator (improving/declining/stable)
- Headline metric chart (e.g., overall quotient for grounding, dominant strategy for Tool 1)
- Expandable detail section with sub-metric charts
- Date labels on each data point

---

## Files to Modify

### 3. `Config.js` — Add sheet name
Add to `CONFIG.SHEETS` (after line 32):
```javascript
PROGRESS_HISTORY: 'PROGRESS_HISTORY'
```

### 4. `core/DataService.js` — Hook history recording
Inside `saveToolResponse()`, after line 57 (end of COMPLETED block), add:
```javascript
// Record in progress history for Progress Over Time feature
if (typeof ProgressHistory !== 'undefined') {
  ProgressHistory.recordCompletion(clientId, toolId, data);
}
```

### 5. `core/Router.js` — Add route + dashboard button
- Add `'progress'` to `_isSystemRoute()` whitelist
- Add case in `_handleSystemRoute()` to call `ProgressPage.render(params.client)`
- Add "Progress Over Time" button next to "View Results Summary" in `_createDashboard()`

### 6. `shared/NavigationHelpers.js` — Add navigation helper
- `getProgressPage(clientId)` following the existing `getResultsSummaryPage()` pattern

### 7. `Code.js` — Add global functions
- `getProgressPage(clientId)` — student access
- `getStudentProgressPage(clientId)` — coach access (via AdminRouter)

### 8. `AdminRouter.js` — Add coach handler
- `handleGetStudentProgressRequest(clientId)` calls `ProgressPage.render(clientId, { isCoach: true, studentName })`
- Add "View Progress" button to admin student detail panel

---

## Implementation Phases

### Phase 1: Data Infrastructure
1. Add `PROGRESS_HISTORY` to Config.js
2. Create `core/ProgressHistory.js` (sheet init, score extraction, read/write, version cap)
3. Hook `recordCompletion` into `DataService.saveToolResponse()`
4. Write migration function for existing RESPONSES data

### Phase 2: Progress Page (Student View)
1. Create `shared/ProgressPage.js` (HTML generation, SVG charts, CSS, client JS)
2. Add route to Router.js
3. Add `getProgressPage` to NavigationHelpers.js and Code.js
4. Add button next to "View Results Summary" on student dashboard

### Phase 3: Coach View
1. Add handler to AdminRouter.js
2. Add global function to Code.js
3. Add "View Progress" button to admin student detail panel

### Phase 4: Migration and Testing
1. Run `migrateFromResponses()` to backfill history from existing RESPONSES data
2. Test student view with 0, 1, and 2+ completions
3. Test coach view
4. Verify version cap enforcement
5. Verify new completions create history entries

---

## Key Patterns to Reuse

| Pattern | Source File | Reuse For |
|---------|------------|-----------|
| TOOL_META constant (tool names, IDs) | `core/CollectiveResults.js` | Tool section headers |
| `ReportStyles.getBaseCSS()` | `shared/ReportStyles.js` | Dark theme CSS |
| `NavigationHelpers.getResultsSummaryPage()` | `shared/NavigationHelpers.js` | Navigation wiring pattern |
| `document.write()` navigation | `core/CollectiveResults.js` `_getScripts()` | Back button, tool links |
| Calculator `saveScenario()` FIFO pattern | `tools/tool6/Tool6.js` | Version cap enforcement |
| `SpreadsheetCache.getSheet()` | `core/SpreadsheetCache.js` | Sheet access |

---

## Student vs Coach View

| Aspect | Student View | Coach View |
|--------|-------------|------------|
| Access | Dashboard button (next to Results Summary) | Admin panel student detail |
| Header | "Your Progress Over Time" | "Student Progress: [Name] ([ID])" |
| Back button | Goes to student dashboard | Goes to admin student view |
| Data shown | Own data only | Selected student's data |
| Code path | `getProgressPage(clientId)` | `getStudentProgressPage(clientId)` via AdminRouter |

Same rendering code (`ProgressPage.render`) with `options.isCoach` flag.

---

## Edge Cases and GAS Constraints

- **30-second timeout:** Progress page read is lightweight (one sheet read, JSON parse, no GPT calls). Well within limits.
- **document.write pattern:** All navigation uses `google.script.run` -> `document.write()`. No `window.location.reload()`.
- **Template literal apostrophes:** All user-facing strings use full words (no contractions) per CLAUDE.md rules.
- **Grounding inversion:** Tools 3/5/7 use 0-100 where lower = better. Delta arrows and colors must invert.
- **Empty states:** Handle 0 completions ("Not yet completed"), 1 completion ("Complete again to see progress"), and 2+ completions (show trend).
- **Score methodology changes:** If scoring logic changes between versions, historical entries use old scales. Page should note this possibility.
- **Sheet size:** With 10-version cap, PROGRESS_HISTORY grows linearly with student count (~50 students x 5 tools x 10 versions = 2,500 rows max).
- **Cache invalidation:** After writing to PROGRESS_HISTORY, call `SpreadsheetCache.invalidateSheetData('PROGRESS_HISTORY')`.

---

## Verification Plan

1. Deploy to GAS, complete a tool, verify history row appears in PROGRESS_HISTORY sheet
2. Complete the same tool again, verify version 2 appears with correct scores
3. Navigate to Progress page from student dashboard — verify SVG trend charts render
4. Navigate from admin dashboard — verify coach view shows correct student
5. Check a student with 0 completions — verify empty states render cleanly
6. Grounding tools show "improvement" when quotient decreases (lower = better)
7. Save 11th version — verify version 1 gets deleted (FIFO cap)
8. GAS safety: `grep -rn "window.location.reload\|location.reload"` on new files returns nothing
