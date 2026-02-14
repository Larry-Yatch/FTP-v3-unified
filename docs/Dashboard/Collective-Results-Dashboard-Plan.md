# Collective Results Dashboard - Implementation Plan

## Context

All 8 tools are working. Results are currently siloed — students must click into each tool's report individually. This feature creates a unified summary page organized into three meaningful sections that tell the full story: psychological landscape, financial structure, and their integration.

**Audience:** Both students (see their own results) and admins (can view any student's results)

**Access Point:** New card at the top of the main dashboard linking to the summary page

**Incomplete Tools:** Shown as gray locked/pending placeholders ("Not yet completed")

---

## Three-Section Architecture

### Section 1 — "Your Psychological Landscape" (Tools 1, 3, 5, 7)

The odd-numbered tools assess trauma patterns. Tool 1 identifies the dominant strategy across 6 categories. Tools 3, 5, 7 each deep-dive into a pair of those strategies:

| Tool | Strategies Covered | Key Metrics |
|------|-------------------|-------------|
| Tool 1 | All 6 strategies | Winner category + 6 strategy scores (-25 to +25) |
| Tool 3 | FSV + ExVal (Identity & Validation) | Overall quotient (0-100) + 6 subdomain quotients (3 per domain) |
| Tool 5 | Showing + Receiving (Love & Connection) | Overall quotient (0-100) + 6 subdomain quotients (3 per domain) |
| Tool 7 | Control + Fear (Security & Control) | Overall quotient (0-100) + 6 subdomain quotients (3 per domain) |

**Tool 1** serves as the overview — it identifies which of the 6 trauma strategies is dominant. **Tools 3, 5, 7** then go deeper into each pair, showing the overall quotient (how strongly that pattern manifests) and the 3 subdomain quotients within each domain.

### Section 2 — "Your Financial Structure" (Tools 2, 4, 6, 8)

The even-numbered tools assess financial reality. They tell a progressive story:

**Clarity → Allocation → Strategy → Projection**

| Tool | Role in Flow | Key Metrics |
|------|-------------|-------------|
| Tool 2 | "Where do you stand?" | 5 domain clarity scores (0-100%), archetype classification, top priority area |
| Tool 4 | "How should you allocate?" | M/E/F/J allocation percentages (stacked bar), selected financial priority, monthly income |
| Tool 6 | "What is your investment approach?" | Investor profile classification, vehicle allocations, feasibility status (OK/Warning/Critical) |
| Tool 8 | "Where does that take you?" | Projected retirement balance, monthly contribution, feasibility status |

The through-line shows how each tool supports the next: clarity informs allocation, allocation feeds strategy, strategy produces projections.

### Section 3 — "The Integration" (Psychological <-> Financial)

How trauma patterns drive financial behaviors.

**Status:** UI shell built with placeholder. Real pattern content will come from a separate deep analysis project that examines the actual student base data to discover evidence-based correlations grounded in the cycle of psychology framework.

The goal is not AI-generated-on-the-fly insights, but AI-*discovered* patterns from real data that get built into the product as validated, structural connections between psychological and financial results.

---

## Verified Data Structures (Field Paths)

These are the exact field paths from the saved RESPONSES sheet data, verified against the source code:

### Tool 1: Core Trauma Strategy Assessment
```
data.winner          → string: 'FSV' | 'ExVal' | 'Showing' | 'Receiving' | 'Control' | 'Fear'
data.scores          → { FSV: num, ExVal: num, Showing: num, Receiving: num, Control: num, Fear: num }
                       Range: -25 to +25
data.formData        → raw form responses
```

### Tool 2: Financial Clarity & Values
```
data.results.benchmarks[domain] → { raw, max, percentage (0-100), level ('High'|'Medium'|'Low') }
  Domains: moneyFlow, obligations, liquidity, growth, protection
data.results.archetype          → string (e.g., 'Money Flow Optimizer')
data.results.priorityList       → [{ domain, weight }] sorted by priority
data.results.domainScores       → raw sums per domain
```

### Tool 3: Identity & Validation Grounding
```
data.scoring.overallQuotient       → 0-100
data.scoring.domainQuotients       → { domain1 (FSV), domain2 (ExVal) }
data.scoring.subdomainQuotients    → 6 keys, 0-100 each (3 per domain)
```

### Tool 4: Financial Freedom Framework
```
data.multiply        → % allocation (NOTE: field is 'multiply' NOT 'multiplyAmount')
data.essentials      → % allocation
data.freedom         → % allocation
data.enjoyment       → % allocation
data.monthlyIncome   → number
data.priority        → selected financial priority string
```

### Tool 5: Love & Connection Grounding
```
Same structure as Tool 3:
data.scoring.overallQuotient       → 0-100
data.scoring.domainQuotients       → { domain1 (ISL), domain2 (IRL) }
data.scoring.subdomainQuotients    → 6 keys, 0-100 each
```

### Tool 6: Retirement Blueprint Calculator
```
data.investorProfile      → classification string
data.feasibility          → status (OK/Warning/Critical) — may also be data.feasibilityStatus
data.vehicleAllocations   → object with vehicle types and amounts
```

### Tool 7: Security & Control Grounding
```
Same structure as Tool 3/5:
data.scoring.overallQuotient       → 0-100
data.scoring.domainQuotients       → { domain1 (CLI), domain2 (FLI) }
data.scoring.subdomainQuotients    → 6 keys, 0-100 each
```

### Tool 8: Investment Planning Tool
```
data.projectedBalance      → retirement projection number
data.monthlyContribution   → monthly savings amount
data.feasibilityStatus     → OK/Warning/Critical
```

---

## Page Layout

```
+---------------------------------------------+
| Header: "Your TruPath Results"              |
| Student ID | X of 8 Complete | Progress Bar |
+---------------------------------------------+

  SECTION 1: YOUR PSYCHOLOGICAL LANDSCAPE
  +-------------------------------------+
  | Tool 1: Trauma Strategy Overview    |
  | Winner badge + 6 horizontal bars    |
  | (-25 to +25 range per strategy)     |
  +-------------------------------------+
  +-----------------+ +-----------------+
  | Tool 3          | | Tool 5          |
  | Overall: ##/100 | | Overall: ##/100 |
  | D1: FSV  ##     | | D1: ISL  ##     |
  |  Sub1  ##       | |  Sub1  ##       |
  |  Sub2  ##       | |  Sub2  ##       |
  |  Sub3  ##       | |  Sub3  ##       |
  | D2: ExVal ##    | | D2: IRL ##      |
  |  Sub4  ##       | |  Sub4  ##       |
  |  Sub5  ##       | |  Sub5  ##       |
  |  Sub6  ##       | |  Sub6  ##       |
  +-----------------+ +-----------------+
  +-------------------------------------+
  | Tool 7: Overall: ##/100             |
  | D1: CLI ## | Sub1/Sub2/Sub3         |
  | D2: FLI ## | Sub4/Sub5/Sub6         |
  +-------------------------------------+

  SECTION 2: YOUR FINANCIAL STRUCTURE
  Clarity -> Allocation -> Strategy -> Projection
  +-----------------+ +-----------------+
  | Tool 2          | | Tool 4          |
  | Archetype badge | | M/E/F/J bar     |
  | 5 domain bars   | | Priority        |
  | Top priority    | | Monthly income  |
  +-----------------+ +-----------------+
  +-----------------+ +-----------------+
  | Tool 6          | | Tool 8          |
  | Profile badge   | | Projected $     |
  | Vehicles        | | Monthly contrib |
  | Feasibility     | | Feasibility     |
  +-----------------+ +-----------------+

  SECTION 3: THE INTEGRATION (placeholder)
  +-------------------------------------+
  | Integration insights coming soon.   |
  | Patterns being analyzed across your |
  | psychological and financial data.   |
  +-------------------------------------+

  [Back to Dashboard]
```

**Completed tools:** Each card includes a "View Full Report" link that navigates to the tool's report page
- Tools 1, 2, 3, 5, 7, 8 → `getReportPage(clientId, toolId)` (dedicated report pages)
- Tools 4, 6 → `getToolPageHtml(toolId, clientId, 1)` (open calculator with saved data)

**Incomplete tools:** Gray card, 50% opacity, tool name + "Not yet completed"
**In-progress tools:** Amber border + "In Progress" badge

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `core/CollectiveResults.js` | Data aggregation, per-tool card rendering, page HTML generation |

### Files to Modify

| File | Change |
|------|--------|
| `core/Router.js` | Add `results_summary` to `_isSystemRoute()` array (line 48) and `_handleSystemRoute()` switch (line 91). Insert summary card in `_createDashboard()` between welcome card (line 730) and "Your Tools" card (line 732). Add `viewResultsSummary()` to dashboard IIFE script block. |
| `Code.js` | Add `getResultsSummaryPage(clientId)` wrapper function for `google.script.run` |
| `shared/NavigationHelpers.js` | Add `getResultsSummaryPage(clientId)` following the `getReportPage()` pattern |

**No changes needed to:** ToolAccessControl, DataService, ToolRegistry, AdminRouter (all generic by design)

### Data Aggregation Strategy

`CollectiveResults.getStudentSummary(clientId)` does a **single-pass sheet read** using `ReportBase.getSheet()` + `ReportBase.getHeaders()` (following the pattern in `ReportBase.getAllResults()` at shared/ReportBase.js:97-125). This avoids 8 separate `DataService.getLatestResponse()` calls, keeping us well within GAS's 30-second execution limit.

### Navigation Pattern

All navigation follows the standard GAS document.write() pattern:
```javascript
google.script.run
  .withSuccessHandler(function(html) {
    document.open();
    document.write(html);
    document.close();
    window.scrollTo(0, 0);
  })
  .getResultsSummaryPage(clientId);
```

### Key Patterns to Follow

| Pattern | Source Reference |
|---------|----------------|
| Single-pass sheet read | `shared/ReportBase.js:97-125` (getAllResults) |
| Navigation helper | `shared/NavigationHelpers.js:69-95` (getReportPage) |
| Dashboard card HTML | `core/Router.js:518-550` (tool4 card) |
| Score bar rendering | `tools/tool2/Tool2Report.js:264-322` |
| System route wiring | `core/Router.js:47-95` |

### Admin Access

Same `google.script.run.getResultsSummaryPage(clientId)` call from admin student detail view. No separate route needed — admin already has clientId in context.

---

## Implementation Phases

1. **Phase 1: Data Aggregation** — Create `CollectiveResults.js` with `getStudentSummary()` (single-pass sheet read, per-tool data extraction with defensive optional chaining)
2. **Phase 2: Page Rendering** — Add `render(clientId)` building the three-section HTML with per-tool card renderers
3. **Phase 3: Route Wiring** — Add route to Router.js, wrapper to Code.js, helper to NavigationHelpers.js, summary card to dashboard
4. **Phase 4: Admin Access** — Add "View Summary" button to admin student detail view
5. **Phase 5: Polish** — Animations, responsive layout, edge cases, template literal safety

---

## Edge Cases

- **0 tools completed:** All cards are gray placeholders. Section 3 hidden. Dashboard card says "Complete your first tool to see results here."
- **Partial data / malformed JSON:** Optional chaining on every field access. Show "Data unavailable" fallback in card rather than crash.
- **Template literal safety:** No contractions ("do not" not "don't"), no escaped apostrophes in JS inside backticks.
- **GAS navigation rules:** All navigation via `document.write()` pattern. No `window.location.reload()` or `window.location.href`.

---

## Verification Checklist

- [ ] `?route=results_summary&client=TEST_ID` renders without error
- [ ] Dashboard shows summary card with correct completion count
- [ ] "View Collective Results" button navigates via document.write()
- [ ] "Back to Dashboard" button works
- [ ] Test with 0, 1, 4, and 8 completed tools
- [ ] `grep -rn "window.location.reload\|location.reload" core/CollectiveResults.js` returns empty
- [ ] No escaped apostrophes in template literals
- [ ] Cards stack to single column on mobile (768px breakpoint)
- [ ] Admin can view any student's summary
- [ ] Section 3 shows placeholder message cleanly

---

## Dependency: Deep Analysis Project

Section 3 (The Integration) depends on a separate project that will:
1. Pull all completed student data from the existing base
2. Analyze real structural correlations between psychological scores and financial behaviors
3. Ground discovered patterns in the cycle of psychology framework
4. Identify where trauma patterns show up structurally in financial decisions

Those discovered patterns will be wired into Section 3 once validated.
