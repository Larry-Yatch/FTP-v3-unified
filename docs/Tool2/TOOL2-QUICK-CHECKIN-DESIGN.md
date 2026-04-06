# Tool 2 Quick Check-In Features Design Document
**For AI Coding Agent Implementation**

---

## Agent Session Protocol

**You are an autonomous coding agent executing this plan. The human is present, watching, and will confirm before you move to the next phase.**

### Before Starting Any Phase
1. **Verify clasp is authorized**: Run `clasp status` in the terminal. If it fails or returns an auth error, stop and ask the human to run `clasp login` before proceeding.
2. **Read the current state** of every file listed in that phase's "Read before starting" block. Do not rely on memory or previous reads — files may have changed since this document was written.
3. **Re-read the phase's full task list.**
4. **Reassess**: Does anything in the current file state conflict with or require adjusting the plan? If yes, state the conflict clearly before writing any code. Do not silently adapt and proceed.
5. **Confirm with the human** that you are ready to begin.

### After Completing Any Phase
1. Run the test protocol listed in the phase.
2. If any test step fails, fix it and re-run the test protocol. Repeat until all steps pass. Do not move on with known failures.
3. Report results to the human: what passed, what required iteration, what was unexpected.
4. **Update the Phase Status table** in Section 5 — change the phase status to COMPLETE.
5. **Wait for human confirmation** before starting the next phase. The human will do their own manual check before giving the go-ahead.

### If You Hit a Problem Mid-Phase
- Stop and report to the human immediately. Do not silently work around the design doc.
- If the design doc is wrong or outdated for the current codebase, flag it. The human will decide whether to update the doc or adjust the approach.

### Testing Infrastructure
- `clasp push` from the main repo root (not the worktree).
- Write GAS test functions in Code.js that verify both data flow and HTML rendering.
- Test with student `0000AI` (has new-schema Tool 2 data).
- Test backward compatibility with student `5978RH` (old-schema or no Tool 2 data).
- Remove test functions before final commit.

---

## 0. Context

These features build on the Tool 2 Financial Mirror overhaul (6 phases, completed 2026-04-06). Tool 2 now collects objective financial data and subjective perception, computes gap scores, and renders a 9-section report. Students who have completed the full assessment can use a Quick Check-In to re-assess faster, and see a delta-focused report showing what changed.

### Cross-Reference
- Tool 2 overhaul design: `docs/Tool2/TOOL2-OVERHAUL-DESIGN.md` (Sections 1-14)
- Future features list: `docs/Tool2/TOOL2-OVERHAUL-DESIGN.md` (Section 15)

### Prerequisites
- Student must have at least one COMPLETED Tool 2 response with new schema (`results.objectiveHealthScores` present)
- Quick Check-In button only appears when Tool 2 status is "completed"

---

## 1. Quick Check-In Dashboard Button (Feature 15.1)

### 1.1 User Flow

1. Student opens dashboard, sees Tool 2 card showing "Completed"
2. Card shows existing buttons (View Report, Edit Answers) plus new **"Quick Check-In (~15 min)"** button
3. Student clicks Quick Check-In
4. Tool 2 loads on Page 1 with:
   - `assessmentMode = 'light'` pre-set (toggle shows "Quick Check-In")
   - ALL form fields pre-populated from their most recent completed submission
   - Banner: "Quick Check-In: Review your previous answers and update what has changed."
   - Mode toggle still available (student can switch to full if desired)
5. Student reviews pre-filled answers, updates what changed, navigates through pages, submits
6. System creates a NEW completed response (does not overwrite previous)
7. Student sees the Quick Check-In report (delta-focused — see Section 2)

### 1.2 Key Design Decisions

**New submission, not an edit.** Quick Check-In creates a new COMPLETED row in RESPONSES. The previous response is marked `Is_Latest = false` by `DataService.saveToolResponse()`. This preserves both submissions for delta comparison.

**Pre-fill source.** Use the latest COMPLETED response's `data` field (the raw form data). Do not use drafts, EDIT_DRAFTs, or computed results.

**Draft collision.** Before seeding the draft, check `DataService.getActiveDraft(clientId, 'tool2')`. If an active DRAFT or EDIT_DRAFT exists, the Quick Check-In should warn: "You have an in-progress Tool 2 draft. Starting a Quick Check-In will replace it. Continue?" This warning is rendered client-side before the server call.

**`_quickCheckIn` flag.** Set `data._quickCheckIn = true` in the seeded draft. This:
- Tells `renderPage1Content` to show the Quick Check-In banner
- Gets saved with the response for future analytics
- Does NOT trigger edit mode behavior (no EDIT_DRAFT row)

### 1.3 Navigation Pattern

The dashboard button uses the same `getToolPageWithOptions` pattern as Edit mode:

```javascript
// Client-side (in Router.js dashboard HTML)
function quickCheckInTool2() {
  showLoading('Loading Quick Check-In...');
  google.script.run
    .withSuccessHandler(function(pageHtml) {
      if (pageHtml) {
        document.open();
        document.write(pageHtml);
        document.close();
        window.scrollTo(0, 0);
      } else {
        hideLoading();
        alert('Error loading Quick Check-In.');
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      alert('Error: ' + error.message);
    })
    .getToolPageWithOptions('tool2', clientId, 1, { quickCheckIn: true });
}
```

Server-side, `getToolPageWithOptions` passes `quickCheckIn: true` through to `FormToolBase.render()`, which calls the `onQuickCheckIn(clientId)` hook before rendering page 1.

---

## 2. Quick Check-In Report (Feature 15.2)

### 2.1 Report Layout

When `assessmentMode === 'light'`, `buildNewReportHTML` renders a delta-focused layout instead of the full 9-section report:

| Section | Content | Source |
|---------|---------|--------|
| Header | "[Name]'s Financial Mirror — Check-In" with date and "Quick Check-In" label | Same as Section 1 |
| Delta Summary | Domain-by-domain comparison: previous score -> current score with delta arrows | New method |
| Scarcity & Mindset | Holistic vs financial scarcity (same as full report Section 2) | Reuse existing |
| Financial Reality | 5 objective health score cards with benchmarks (same as Section 3) | Reuse existing |
| Growth Archetype | Archetype card (same as Section 9) | Reuse existing |
| Full Assessment Callout | "Want deeper insights? Complete the full assessment for gap analysis, pattern synthesis, and AI-powered insights." | New method |
| GPT Insights | If GPT ran successfully, show the personalized insights (same as Section 8) | Reuse existing |
| Footer + Action Buttons | Same as full report | Reuse existing |

**Sections SKIPPED in light mode:** Section 4 (Subjective Perception — limited data), Section 5 (Gap Analysis — needs full subjective data), Section 6 (Priority Map — less meaningful with fewer inputs), Section 7 (Pattern Synthesis — same as previous, no new insight).

### 2.2 Delta Summary Hero

The primary new section. Shows what changed since the last assessment.

```
Since your last assessment on [previous date]:

  Money Flow        85 -> 85  (→ No change)     [gray]
  Obligations       75 -> 88  (+13 improvement)  [green]
  Liquidity         60 -> 45  (-15 decline)      [red]
  Growth            90 -> 90  (→ No change)     [gray]
  Protection        67 -> 100 (+33 improvement)  [green]
```

**Data access:**
- Current scores: `results.objectiveHealthScores` from the just-submitted response
- Previous scores: Fetch the previous COMPLETED Tool 2 response (same logic as existing `buildProgressComparison` in Tool2Report.js)
- If no previous response exists: show "First assessment — your scores will be your baseline for future check-ins"

**Delta color coding:**
- Positive delta (improvement): `#10b981` (green)
- Negative delta (decline): `#ef4444` (red)
- Zero / no change: `#94a3b8` (gray)

### 2.3 Full Assessment Callout

```html
<div class="full-assessment-callout">
  <h3>Want Deeper Insights?</h3>
  <p>Your Quick Check-In captures the essentials. Complete the full assessment
     to unlock detailed gap analysis, pattern synthesis, and personalized
     AI-powered insights across all five financial domains.</p>
</div>
```

Styled with a blue highlight border (not gold — visually distinct from report sections).

### 2.4 Edge Cases

**First light-mode submission (no previous data):** Delta Summary shows absolute scores only with message: "This is your first Financial Mirror submission. Complete another check-in in the future to see your progress over time."

**Previous response is old schema:** If the previous response has no `objectiveHealthScores`, show: "Your previous assessment used an earlier format. This check-in establishes your new baseline for future comparisons."

**PDF generation:** The existing `generateTool2PDF` renders from the same HTML pipeline. No changes needed — the light-mode HTML will naturally produce a delta-focused PDF.

---

## 3. Submission Type Tracking

When `processFinalSubmission` runs and `allData._quickCheckIn === true`:
- Add `submissionType: 'quick-check-in'` to the saved results object
- This enables future analytics (how many students use Quick Check-In vs full)
- Does not change any scoring or reporting logic

---

## 4. File Changes

| File | Action | Phase |
|------|--------|-------|
| `core/Router.js` | Add "Quick Check-In" button to `_buildTool2Card` completed state | 1 |
| `shared/NavigationHelpers.js` | Add `quickCheckIn` option to `getToolPageWithOptions` | 1 |
| `core/FormToolBase.js` | Add `onQuickCheckIn` hook call in `render()` when `params.quickCheckIn` and page 1 | 1 |
| `tools/tool2/Tool2.js` | Implement `onQuickCheckIn(clientId)`, add Quick Check-In banner to page 1, add `submissionType` tracking | 1 |
| `tools/tool2/Tool2Report.js` | Branch `buildNewReportHTML` on mode, add `buildDeltaSummaryHero()`, add `buildFullAssessmentCallout()`, add CSS | 2 |

---

## 5. Implementation Phases

### Phase Status

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Quick Check-In Dashboard Button | COMPLETE |
| 2 | Quick Check-In Report | COMPLETE |

**Rule**: Do not begin Phase 2 until Phase 1 passes manual testing. The student needs to complete a Quick Check-In submission before the delta report can be tested.

---

### Phase 1: Quick Check-In Dashboard Button

**Read before starting**: `core/Router.js` (search for `_buildTool2Card` — read the completed state rendering), `shared/NavigationHelpers.js` (search for `getToolPageWithOptions`), `core/FormToolBase.js` (search for `editMode` handling in `render()`), `tools/tool2/Tool2.js` (Page 1 rendering, `getExistingData`, `processFinalSubmission`)

**Goal**: Quick Check-In button on dashboard that loads Tool 2 with pre-filled data in light mode.

**Tasks**:
1. Add `quickCheckIn` option support to `NavigationHelpers.getToolPageWithOptions()` — follow the exact pattern used for `editMode` and `clearDraft`
2. Add `onQuickCheckIn` hook call in `FormToolBase.render()` — when `params.quickCheckIn === 'true'` and page is 1, call `this.onQuickCheckIn(clientId)` if the method exists
3. Implement `onQuickCheckIn(clientId)` in `Tool2.js`:
   - Fetch latest COMPLETED response via `DataService.getLatestResponse(clientId, 'tool2')`
   - Extract form data from `response.data.data`
   - Set `assessmentMode = 'light'` and `_quickCheckIn = true`
   - Seed draft via `DraftService.saveDraft('tool2', clientId, 1, sourceData)`
4. Update `renderPage1Content` in `Tool2.js` — when `data._quickCheckIn === true`, show banner: "Quick Check-In: Review your previous answers and update what has changed."
5. Add "Quick Check-In" button to `Router.js` `_buildTool2Card` completed state — with draft collision check (client-side confirm dialog)
6. Update `processFinalSubmission` in `Tool2.js` — when `allData._quickCheckIn === true`, add `submissionType: 'quick-check-in'` to results

**Do not change**: Report rendering, scoring, GPT analysis — those are unchanged in Phase 1.

**Test protocol**:
1. Deploy to GAS
2. Write GAS test function that:
   - Verifies `onQuickCheckIn` seeds draft with correct data and flags
   - Verifies `renderPage1Content` shows Quick Check-In banner when `_quickCheckIn = true`
   - Verifies `renderPage1Content` does NOT show banner for normal submissions
   - Renders the dashboard `_buildTool2Card` for a completed student and verifies "Quick Check-In" button is in HTML
   - Renders for a student with no Tool 2 completion and verifies button is NOT present
3. Browser test: Click Quick Check-In on dashboard, verify pre-filled data, submit, verify new COMPLETED row in RESPONSES

---

### Phase 2: Quick Check-In Report

**Read before starting**: `tools/tool2/Tool2Report.js` (full file — specifically `buildNewReportHTML`, `buildProgressComparison`, `buildSection3Objective`, `buildSection2Scarcity`, `buildSection9Archetype`, `getNewReportCSS`)

**Prerequisite**: Phase 1 complete. A Quick Check-In submission must exist for the test student (from Phase 1 browser test).

**Goal**: Delta-focused report for light-mode submissions.

**Tasks**:
1. Add `buildDeltaSummaryHero(clientId, currentResults)` to `Tool2Report.js`:
   - Fetch previous COMPLETED response (non-current, with `objectiveHealthScores`)
   - Compute domain-by-domain deltas
   - Render comparison cards with color-coded arrows
   - Handle edge cases: no previous response, old-schema previous response
2. Add `buildFullAssessmentCallout()` to `Tool2Report.js`
3. Branch `buildNewReportHTML` on `mode === 'light'`:
   - Light: Header (with "Check-In" label) + Delta Summary + Scarcity + Financial Reality + Archetype + Full Assessment Callout + GPT Insights + Footer
   - Full: Unchanged (existing 9-section layout)
4. Add CSS for delta summary cards in `getNewReportCSS()`

**Do not change**: Full-mode report layout, scoring, GPT analysis, PDF pipeline.

**Test protocol**:
1. Write GAS test function that:
   - Renders Tool 2 report for the Quick Check-In submission (light mode)
   - Verifies Delta Summary appears with correct previous and current scores
   - Verifies "Want Deeper Insights?" callout appears
   - Verifies Sections 4, 5, 6, 7 are NOT present (gap analysis, priority map, pattern synthesis)
   - Verifies Sections 2, 3, 9 ARE present (scarcity, reality, archetype)
   - Renders for a full-mode submission and verifies full 9-section report (no delta hero)
   - Renders for old-schema student and verifies legacy report (no crash)
   - Tests edge case: light-mode submission with no previous response
2. Browser test: View the Quick Check-In report, verify visual appearance, verify PDF download works

---

*Document version: 1.1 | Last updated: 2026-04-06 | Status: Both phases complete*
