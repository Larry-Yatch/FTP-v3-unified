# Tool 1 Improvements Design Document
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
4. **Update the Phase Status table** in Section 10 — change the phase status to `✅ COMPLETE`.
5. **Wait for human confirmation** before starting the next phase. The human will do their own manual check before giving the go-ahead.

### If You Hit a Problem Mid-Phase
- Stop and report to the human immediately. Do not silently work around the design doc.
- If the design doc is wrong or outdated for the current codebase, flag it. The human will decide whether to update the doc or adjust the approach.

### Testing Infrastructure (Desktop Claude Code)

**Deploying code:**
- Run `clasp push` from the terminal in the project root.
- `clasp push` updates the HEAD deployment only. The stable versioned deployment that students use is unaffected — you can push and test freely without touching live student traffic.
- Get the HEAD deployment URL by running `clasp deployments` — use the entry marked `@HEAD`.

**Verifying response data (use MCP, not the browser):**
- Master Sheet ID: found in `Config.js` as `CONFIG.MASTER_SHEET_ID`
- Use the MCP Google Drive tools (`mcp__google-drive__getGoogleSheetContent`) to read the RESPONSES sheet directly — faster and more reliable than browser navigation.
- RESPONSES sheet column order (zero-indexed): `Timestamp(0)`, `Client_ID(1)`, `Tool_ID(2)`, `Data(3)`, `Status(4)`, `Is_Latest(5)`
- Filter by `Client_ID` and `Tool_ID` = `tool1`, then parse the `Data` column as JSON to inspect saved fields.

**Browser testing (web app):**
- Navigate to the `@HEAD` deployment URL in the browser.
- The app is deployed as public (anyone can access). Login is via student ID on the login screen — no Google account switching needed. Enter the test student ID directly.
- Use browser DevTools console to check for JavaScript errors after each page load.

**Test student for this implementation session:** `0000AI` (AI Test Student) — created fresh with tool1 unlocked, tools 2–8 locked, zero history. Use this for all Tool 1 testing. Known profile-type test students (for verifying score classification logic) are listed in the Section 10 Phase Status table.

---

## 0. Before You Start

### GAS Execution Context
All processing runs server-side in Google Apps Script. No scoring or classification logic goes in client-side `<script>` tags.

### Template Literal Safety
HTML is generated inside GAS template literals (backticks). Per CLAUDE.md:
- Use `"do not"` not `"don't"` in user-facing strings
- Use double quotes for strings that need apostrophes: `"student's pattern"`
- Never use escaped apostrophes — `'student\'s'` causes syntax errors in `document.write()` context

### Tool1Constants.js Does Not Exist Yet
Neither `tools/tool1/Tool1Constants.js` nor `tools/tool1/PDFGenerator.js` (it lives at `shared/PDFGenerator.js`) exist at the expected paths. The agent must:
- **Create** `tools/tool1/Tool1Constants.js` as a new file
- **Edit** `shared/PDFGenerator.js` for PDF changes (not a Tool1-specific file)

### Template Access Pattern
`Tool1Templates` is a plain object (not module.exports). Access via `Tool1Templates.getTemplate(strategy)`, `Tool1Templates.commonIntro`, `Tool1Templates.commonFooter`. New properties (`COMBINATION_NARRATIVES`, `STRENGTH_STATEMENTS`, etc.) are added directly to this object.

### Report Access Pattern
`Tool1Report.render(clientId)` calls `this.getResults(clientId)` (via `ReportBase`) to get saved response data, then accesses `results.winner`, `results.scores`, `results.profileType`. The `render()` function returns an `HtmlOutput` object.

### Navigation Pattern (Report Buttons)
Any report button calling `google.script.run` must use `document.write()` in the success handler. Never use `window.location.href` — use `window.top.location.href` to break out of the GAS iframe. All `withSuccessHandler` callbacks must null-check: `if (!result) { alert('Server returned no data.'); return; }`.

### Required HTML Includes (Report Page)
The rendered HTML must include `<?!= include('shared/loading-animation') ?>`. Without it, `showLoading()` and `navigateToDashboard()` throw `ReferenceError` in production.

### Threshold Operator Consistency
Use `>=` consistently for all score threshold comparisons. Mixed `>` and `>=` causes edge-case bugs where a score exactly on a boundary behaves unexpectedly. The `classifyPatternScore()` function in this document uses `>` for HIGH and `<` for LOW — exact boundary values fall into MODERATE. Document this if intentional.

---

## 1. Overview & Context

### Scope
Tool 1 (Core Trauma Strategy Assessment) is not being rebuilt. This document specifies targeted improvements to the **report, PDF, and narrative system** based on insights gathered during the Tool 2 overhaul planning process. The assessment questions may also be reviewed (see Section 8).

### What Is Changing
1. Data-driven score classification thresholds (replacing assumed -5/+5/+15 breakpoints)
2. Profile type detection: strong single, borderline dual, negative-dominant
3. Combination narratives for two-pattern profiles
4. High-negative (LOW classification) positive strength framing
5. Report structure to surface secondary patterns and profile type
6. PDF mirroring the updated report structure
7. Scarcity flag integration (from Tool 2 data, where available)
8. Optional: question refinement based on data analysis

### Cross-Reference
This document is referenced by `docs/Tool2/TOOL2-OVERHAUL-DESIGN.md` Section 7. The combination narratives and profile classification logic defined here are also used by Tool 2's gap analysis report. Do not duplicate the narrative templates — Tool 2 imports them from Tool1Templates.js or a shared location.

### Why These Changes
Analysis of 70 completed Tool 1 responses revealed:
- 57% of students have a margin of victory under 5 points (top two patterns nearly tied)
- 27% of students are negative-dominant (4+ patterns below threshold — "winner" is least-negative)
- The current report narrates only the winner and ignores all other pattern information
- HIGH negative scores (LOW classification) are meaningful positive signals that are never surfaced
- The Showing-Receiving opposition is the strongest structural anti-correlation in the dataset; this is never named

---

## 2. Data-Driven Score Classification Thresholds

These thresholds are derived from the actual cohort dataset (n=70, Tool 1 completed, Is_Latest=TRUE). Replace any hardcoded threshold assumptions in the codebase with these values.

```javascript
// In Tool1Constants.js or Tool1.js — add or update PATTERN_THRESHOLDS
const PATTERN_THRESHOLDS = {
  FSV:       { low: -5,  high: 11 },
  ExVal:     { low: -7,  high: 12 },
  Showing:   { low: -4,  high: 16 },
  Receiving: { low: -10, high: 3  },
  Control:   { low: -5,  high: 12 },
  Fear:      { low: -10, high: 14 }
};

// Receiving note: This pattern is structurally skewed negative in the cohort
// (mean -3.3, only 39% score positive). A score > 3 is genuinely top-quartile.
// This does NOT mean Receiving is less important — it means the cohort
// (primarily entrepreneurs and business owners) skews toward Showing over Receiving.

function classifyPatternScore(pattern, score) {
  const t = PATTERN_THRESHOLDS[pattern];
  if (score > t.high) return 'HIGH';    // Pattern strongly active
  if (score < t.low)  return 'LOW';     // Pattern largely absent — healthy signal
  return 'MODERATE';                     // Pattern present but not dominant
}
```

---

## 3. Profile Type Detection

Add `detectProfileType()` function to `Tool1.js`. Call it in `processFinalSubmission()` and save the result in the response data.

```javascript
function detectProfileType(scores, winner) {
  const classified = {};
  Object.keys(scores).forEach(p => {
    classified[p] = classifyPatternScore(p, scores[p]);
  });

  const highPatterns = Object.keys(classified).filter(p => classified[p] === 'HIGH');
  const lowPatterns  = Object.keys(classified).filter(p => classified[p] === 'LOW');

  // Negative-dominant: 4 or more patterns below their LOW threshold
  if (lowPatterns.length >= 4) {
    // Find the "least negative" winner for framing
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return {
      type: 'NEGATIVE_DOMINANT',
      winner: sorted[0][0],
      highPatterns: [],
      lowPatterns,
      classified,
      note: 'Winner is least-negative, not a strong positive signal'
    };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const margin = sorted[0][1] - sorted[1][1];

  // Borderline dual: top two within 5 points
  if (margin <= 5) {
    return {
      type: 'BORDERLINE_DUAL',
      winner: sorted[0][0],
      secondary: sorted[1][0],
      margin,
      highPatterns,
      lowPatterns,
      classified
    };
  }

  // Strong single: margin > 10 and winner is HIGH classification
  if (margin > 10 && classified[winner] === 'HIGH') {
    return {
      type: 'STRONG_SINGLE',
      winner,
      margin,
      highPatterns,
      lowPatterns,
      classified
    };
  }

  // Default: moderate single
  return {
    type: 'MODERATE_SINGLE',
    winner,
    margin,
    highPatterns,
    lowPatterns,
    classified
  };
}
```

### Save Profile Type in Response
Update `processFinalSubmission()` to save profileType data alongside existing scores and winner:

```javascript
// In the data object saved to RESPONSES sheet
{
  formData: { ... },          // unchanged
  scores: { ... },            // unchanged
  winner: string,             // unchanged
  profileType: {              // NEW
    type: string,             // STRONG_SINGLE | MODERATE_SINGLE | BORDERLINE_DUAL | NEGATIVE_DOMINANT
    secondary: string | null, // set if BORDERLINE_DUAL
    margin: number,
    highPatterns: [],
    lowPatterns: []
  }
}
```

---

## 4. Combination Narratives

These narratives are used in both the Tool 1 report and the Tool 2 gap analysis report. They describe what specific pattern combinations mean for the student's psychological and financial behavior.

Store these in `Tool1Templates.js` under a new export `COMBINATION_NARRATIVES`. Each key is a sorted two-pattern string (alphabetical, e.g., `"ExVal_FSV"` not `"FSV_ExVal"`).

### Same-Domain Combinations (Highest Signal)

**`"ExVal_FSV"`** — The hidden financial life
> "You score high in both False Self-View and External Validation. These two patterns operate in opposing directions from the same wound: FSV drives you to create genuine internal scarcity (financial confusion, hidden accounts, manufactured crises), while ExVal drives you to perform a different financial reality to the outside world. The result is a life where your inner financial experience and your presented financial identity are completely disconnected. You may not know your real financial situation — and others definitely don't. Financial situations driven by this combination tend to collapse suddenly and 'without warning,' even though the warning signs were always there, hidden from yourself first."

**`"Receiving_Showing"`** — The codependency loop
> "You score high in both Issues Showing Love and Issues Receiving Love. These patterns form a codependent loop: you give money, time, and financial support compulsively — while simultaneously staying financially dependent on others yourself. The two patterns often involve the same relationships. You may be the person who always picks up the check AND the person who periodically needs to be bailed out. Financial independence feels threatening from both directions: stopping giving would mean you don't love; accepting support would mean you're a burden. Building your own financial foundation requires untangling both sides of this loop simultaneously."

**`"Control_Fear"`** — The hoarder-saboteur
> "You score high in both Control and Fear. These are the two safety-domain patterns, and together they create a specific destructive cycle: Control drives you to obsessively accumulate and manage — tracking every dollar, building reserves, maintaining systems. Fear drives you to unconsciously destroy or abandon financial progress once it reaches a certain threshold of visibility or success. You have likely experienced this cycle before: built something up, then made an unexplained decision that knocked it back. The Control side gives you the discipline to rebuild; the Fear side ensures you keep having to. True financial progress requires understanding why thriving feels dangerous."

---

### Cross-Domain Combinations (Common in Dataset)

**`"Control_FSV"`** — The analyst who never acts
> "You score high in both False Self-View and Control. FSV creates a belief that you are not yet worthy of financial success — any current financial situation confirms this inadequacy. Control gives you a compulsion to manage every detail as compensation. The combination produces endless analysis, planning, and optimization without implementation. Your financial plan is perpetually being refined because committing to it would mean accepting your current situation as real, which feels like accepting your inadequacy as permanent. More information does not provide relief — because information was never the actual problem."

**`"Fear_FSV"`** — The perpetually unprepared
> "You score high in both False Self-View and Fear. This combination is one of the most consistent predictors of financial stagnation that doesn't respond to conventional coaching. FSV says 'I am not worthy of financial success.' Fear says 'Thriving makes me a target — staying small is safer.' Together, they produce the person who will charge less than their value, avoid visible opportunities, and remain perpetually 'preparing to start.' Income stays below capability level regardless of skills or market. This is not a knowledge or skills problem. The underlying beliefs need to shift before financial behavior can change durably."

**`"ExVal_Showing"`** — The performance spender
> "You score high in both External Validation and Issues Showing Love. ExVal drives spending on image and status — the expensive item, the impressive lifestyle. Showing drives spending on others — always picking up the check, covering others' expenses, proving love financially. You overspend in both directions simultaneously. The resulting debt is typically hidden from both audiences: friends don't know about the credit cards; the image doesn't show the stress. High income is common with this combination; accumulated wealth is rare."

**`"ExVal_Receiving"`** — Dependency as performed identity
> "You score high in both External Validation and Issues Receiving Love. Financial dependency has become part of your curated identity — 'I don't handle money; my partner does' or 'I've never been good with finances.' The ExVal pattern means this story is maintained partly for others' consumption. Financial learned helplessness that has been socially legitimized. This combination is particularly resistant to change because shifting it threatens both the relationship structure AND the identity. Genuine financial engagement requires separating your worth from your financial dependency narrative."

**`"Control_Showing"`** — Controlled for self, depleted for others
> "You score high in both Control and Issues Showing Love. You maintain strict, disciplined financial control in your personal life — tracking, planning, building reserves. But financial discipline breaks down entirely in the context of relationships. When someone you care about needs money, the controlled self disappears and you give freely, often from savings you've worked hard to build. The pattern repeats: build it up, give it away, rebuild. Your own financial security is being maintained for others rather than for yourself."

**`"Fear_Receiving"`** — Dependency as camouflage
> "You score high in both Fear and Issues Receiving Love. This is the most complete form of financial invisibility: Fear says thriving or being visible with money attracts danger, so staying small is safe. Receiving provides the structural mechanism for staying small — remaining financially dependent means you never have to be the one with money, never the visible target. The relationship provides cover; financial change requires both building your own capability AND tolerating the visibility that comes with it. This combination produces the lowest objective financial scores in the cohort and is the most likely to report low distress about those scores — the dependency has been normalized."

---

### Notable Single-Pattern Negatives (Strength Framing)

When a student scores LOW (below threshold) on a pattern, surface this as a strength in the report. Use these statements in a "Your Financial Strengths" callout section.

```javascript
const STRENGTH_STATEMENTS = {
  FSV: "You show low activation of the False Self-View pattern. You don't tend to create financial confusion for yourself or manufacture scarcity as a form of unconscious self-punishment. Your financial decisions are more likely to reflect your actual situation rather than distorted self-perception.",
  ExVal: "You show low activation of the External Validation pattern. You make financial decisions based on your own values rather than others' perception of you. This independence from external judgment is a significant financial strength — your spending and saving choices are authentically yours.",
  Showing: "You show low activation of the Issues Showing Love pattern. You maintain financial boundaries in relationships and don't habitually sacrifice your own financial stability to prove care for others. You can be generous from a place of choice rather than compulsion.",
  Receiving: "You show low activation of the Issues Receiving Love pattern. You are able to accept financial help, advice, and collaboration when it genuinely serves you. This openness to support — financial coaching, investment partnerships, professional advice — is an accelerator for financial progress.",
  Control: "You show low activation of the Control pattern. You don't over-manage or hoard resources out of anxiety. You can delegate financial decisions, trust others with money management, and use resources rather than simply accumulating them. Financial flexibility is available to you.",
  Fear: "You show low activation of the Fear pattern. You don't habitually self-sabotage financial progress or shrink from financial visibility. You can pursue opportunities, accept recognition, and allow yourself to thrive financially without unconscious interference."
};
```

---

## 5. High-Positive + High-Negative Combination Framing

When a student has HIGH classification on one or more patterns AND LOW classification on the opposite domain pattern, add a specific callout.

**Known anti-correlations from cohort data (strongest to weakest):**
1. Showing HIGH + Receiving LOW (spread up to 39 points) — most extreme
2. Control HIGH + Receiving LOW — second strongest
3. Showing HIGH + Fear LOW — noted in multiple profiles
4. ExVal HIGH + Receiving LOW — consistent pattern

For these anti-correlations, add a "Polarity Insight" callout in the report:

```javascript
const POLARITY_INSIGHTS = {
  'Showing_high_Receiving_low': "Your profile shows one of the clearest polarities we see: you score high in giving financially but low in receiving. This means you have developed strong capacity to extend financial generosity and sacrifice for others, while simultaneously being highly resistant to accepting help, resources, or support for yourself. The strength of the Showing pattern is real — and so is the cost of the Receiving block. Both sides of this polarity are worth understanding.",
  'Control_high_Receiving_low': "You score high in financial Control while scoring low in Receiving. You build strong financial structures and self-sufficiency, but have significant difficulty accepting outside help, advice, or financial support. This polarity often produces capable, independent individuals who are quietly struggling to access the external resources that would accelerate their progress — because receiving those resources conflicts with the Control pattern's need for self-sufficiency.",
  'Showing_high_Fear_low': "You score high in financial giving (Showing) but low in Fear. This means you give generously and without significant self-sabotage anxiety — the motivation to give is genuine rather than fear-driven. This is a meaningful distinction: your generosity is not avoidance behavior."
};

function getPolarityInsight(profile) {
  const h = profile.highPatterns;
  const l = profile.lowPatterns;
  if (h.includes('Showing') && l.includes('Receiving')) return POLARITY_INSIGHTS['Showing_high_Receiving_low'];
  if (h.includes('Control') && l.includes('Receiving')) return POLARITY_INSIGHTS['Control_high_Receiving_low'];
  if (h.includes('Showing') && l.includes('Fear')) return POLARITY_INSIGHTS['Showing_high_Fear_low'];
  return null;
}
```

---

## 6. Negative-Dominant Profile Framing

When `profileType.type === 'NEGATIVE_DOMINANT'`, replace the standard winner narrative with this framing:

```javascript
const NEGATIVE_DOMINANT_INTRO = `Your assessment results show low activation across most financial trauma patterns. Rather than a single dominant strategy driving your financial behavior, you appear to operate with relatively low intensity across all six patterns. 

There are two interpretations of this result, and both may be partially true:

**The strength interpretation**: Low scores indicate that these defensive strategies are not strongly active in your life — you don't habitually create financial confusion for yourself (low FSV), you don't make decisions based on others' judgment (low ExVal), and you don't chronically self-sabotage (low Fear). This reflects genuine psychological flexibility.

**The suppression interpretation**: The patterns may be present but not consciously recognized, or may express subtly in ways that the assessment questions didn't fully capture for your specific situation. 

Your financial data — the objective numbers from your financial assessment — will be the most reliable signal of where attention is needed. The domain scores in your Financial Mirror assessment carry more weight for your profile than pattern-specific interpretation.

Your highest-scoring pattern is [WINNER], which scored [SCORE]. While this is your relative high point rather than a strong absolute signal, we have included a brief note on this pattern below.`;
```

Then render a condensed (2-paragraph) version of the winner's template, prefaced with: *"Note: The following reflects your relative tendency rather than a dominant pattern."*

---

## 7. Updated Tool 1 Report Structure

The current report renders: header → intro → winner template → scores grid → footer.

### New Report Structure

**Section 1: Header** (unchanged)
Name, email, date, cohort.

**Section 2: Your Profile Type**
New section. Render before the pattern narrative. One of four frames:
- STRONG_SINGLE: *"Your assessment shows a clear dominant pattern: [Pattern Name]. Your score of [X] is significantly higher than your next-highest score ([Pattern B] at [Y]), indicating this strategy is strongly active in your life."*
- BORDERLINE_DUAL: *"Your assessment shows two patterns that are closely matched: [Pattern A] ([score]) and [Pattern B] ([score]). This is common and meaningful — it suggests both strategies are active, and the tension between them shapes your financial behavior in specific ways. Both are described below."*
- MODERATE_SINGLE: *"Your assessment shows [Pattern Name] as your primary pattern, with moderate intensity. The strategies described below are present in your life but may not dominate every financial decision."*
- NEGATIVE_DOMINANT: Use `NEGATIVE_DOMINANT_INTRO` from Section 6.

**Section 3: Your Psychological Patterns (Primary)**
- STRONG_SINGLE / MODERATE_SINGLE: Full template for winner (unchanged from current)
- BORDERLINE_DUAL: Full template for primary, condensed template for secondary, then combination narrative from Section 4

**Section 4: Pattern Tensions & Combinations**
Render only when applicable:
- If BORDERLINE_DUAL: render the combination narrative for the pair
- If multiple HIGH patterns (non-borderline): render relevant combination narratives

**Section 5: Your Strengths** (NEW)
Render LOW classification strength statements (Section 4) for any patterns classified as LOW.
Title: *"Patterns You Don't Show: Your Financial Strengths"*
Intro: *"Low scores on a pattern indicate that the associated behaviors are largely absent from your financial life. These are meaningful positive signals."*

**Section 6: Polarity Insight** (NEW, conditional)
Render `getPolarityInsight()` result if non-null.

**Section 7: All Pattern Scores** (unchanged from current)
The score cards grid showing all 6 patterns. Keep existing styling.
Add a note under the grid: *"Scores above [threshold] indicate strong activation. Scores below [low threshold] indicate the pattern is largely absent — a positive signal."*

**Section 8: What This Means for Your Finances**
New section. 2–3 sentences connecting the profile type to what the student will see in their Financial Mirror (Tool 2). Example:
*"In Tool 2, you'll see how this [FSV] pattern tends to show up in specific financial domains. Pay particular attention to the gap between your perceived financial clarity and your actual financial picture — for [FSV] patterns, this gap most commonly appears in income and money flow."*

This section is only shown if Tool 2 has NOT been completed. If Tool 2 IS completed, replace with a link to the Tool 2 report.

---

## 8. PDF Changes

The PDF generator (`PDFGenerator.js`, function `generateTool1PDF`) should mirror the new report structure.

Changes:
1. Add profile type statement after header (Section 2 above)
2. Add combination narrative section when applicable (Section 4)
3. Add strengths section (Section 5)
4. Add polarity insight when applicable (Section 6)
5. Add "What This Means for Your Finances" teaser (Section 8)
6. Update scores grid footer note with threshold explanations

The existing PDF content structure (header → intro → winner → scores → footer) is extended, not replaced.

---

## 9. Question Refinement (Optional Phase)

This phase is lower priority than the report improvements and should be deferred until after Tool 2's overhaul is complete and a new cohort has been observed.

### Findings from Data Analysis

**Receiving pattern questions may be weakly calibrated for this cohort.**
The Receiving pattern's structural negative skew (mean -3.3) and low win rate (7.1%) in a cohort of entrepreneurs is expected — entrepreneurs tend to be self-sufficient. However, the questions may not be capturing subtle Receiving behaviors that are common in this population (e.g., resistance to taking on investment partners, refusing mentorship, building redundant systems rather than delegating). Consider adding or replacing one Receiving question that addresses financial self-sufficiency as a form of isolation.

**Margin of victory concern.**
57% of profiles have a margin under 5 points. This may indicate that 3 statement questions + 1 thought ranking is insufficient to differentiate patterns reliably. Consider whether the assessment would benefit from 4 statement questions per pattern (adding one question per pattern, increasing total from 18 to 24 statement questions). Do not implement without user approval.

**Fear and Control co-occurrence.**
The data shows these patterns co-activate frequently. The current questions may not sufficiently distinguish between them. Review the question bank to ensure Fear questions are clearly about "staying small and invisible" rather than "controlling outcomes" (which overlaps with Control). Any revision requires re-validation with a new cohort.

### If Question Refinement Is Approved
- Create a new version of `Tool1.js` form pages with modified questions
- Bump version in `tool.manifest.json`
- Old responses remain valid under v3.x schema; new responses save under v4.x
- Report rendering must handle both schema versions

---

## 10. Implementation Phases

### Phase Status

Update this table as you complete each phase. Do not start the next phase until the human confirms the current one.

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Score Classification & Profile Detection | ⬜ NOT STARTED |
| 2 | Report Structure Update | ⬜ NOT STARTED |
| 3 | PDF Update | ⬜ NOT STARTED |
| 4 | Backward Compatibility Audit | ⬜ NOT STARTED |

**Rule**: Do not begin a phase until the previous phase passes manual testing in the deployed GAS environment.

### Test Student Reference
Use these specific student IDs to test each profile type — their scores are known:

| Profile Type | Client ID | Pattern | Key Scores |
|-------------|-----------|---------|------------|
| STRONG_SINGLE | `5978RH` | FSV winner, margin=27 | FSV=20, ExVal=-7 |
| BORDERLINE_DUAL | `1126AP` | ExVal+Showing, margin=2 | ExVal=19, Showing=17 |
| BORDERLINE_DUAL | `1505MU` | Showing+ExVal, margin=1 | Showing=19, ExVal=18 |
| BORDERLINE_DUAL | `5629GV` | Fear+Control, margin=5 | Fear=19, Control=14 |
| NEGATIVE_DOMINANT | `5792RS` | All 6 below threshold | FSV=-13, ExVal=-17, Showing=-17, Receiving=-13, Control=-18, Fear=-25 |
| NEGATIVE_DOMINANT | `8563ML` | All 6 below threshold | FSV=-24, ExVal=-21, Showing=-18, Receiving=-18, Control=-16, Fear=-13 |

---

### Phase 1: Score Classification & Profile Detection

**Read before starting**: `tools/tool1/Tool1.js` (specifically `processFinalSubmission()` and `determineWinner()`), `tools/tool1/Tool1Templates.js` (understand existing structure before adding to it)

**Goal**: Compute and save `profileType` alongside existing data. No visible report changes yet.

**Tasks**:
1. **Create** `tools/tool1/Tool1Constants.js` as a new file containing:
   ```javascript
   const TOOL1_PATTERN_THRESHOLDS = {
     FSV:       { low: -5,  high: 11 },
     ExVal:     { low: -7,  high: 12 },
     Showing:   { low: -4,  high: 16 },
     Receiving: { low: -10, high: 3  },
     Control:   { low: -5,  high: 12 },
     Fear:      { low: -10, high: 14 }
   };
   ```
2. Add `classifyPatternScore(pattern, score)` to `Tool1.js` — uses `TOOL1_PATTERN_THRESHOLDS`
3. Add `detectProfileType(scores, winner)` to `Tool1.js` — see Section 3 for exact implementation. **Critical**: all 4 return paths must include a `winner` field.
4. Update `processFinalSubmission()` in `Tool1.js` to call `detectProfileType()` and save `profileType` in the response data object alongside existing `scores` and `winner`

**Note on `Tool1Constants.js` registration**: No action needed. GAS V8 runtime auto-discovers all `.js` files pushed via clasp — there is no file list in `appsscript.json`. Do not edit `appsscript.json` for this.

**Test protocol**:
1. Deploy to GAS (`clasp push`)
2. Navigate to the `@HEAD` deployment URL and log in as `0000AI`
3. Complete Tool 1 in full
4. Use MCP Google Drive tools to read the RESPONSES sheet — find the `0000AI` / `tool1` row and parse the `Data` JSON
5. Verify `profileType` is present with fields: `type`, `winner`, `secondary`, `margin`, `highPatterns`, `lowPatterns`
6. To verify classification logic is correct, cross-check against known students using MCP — read their existing RESPONSES rows and verify `profileType` matches expected values from the Test Student Reference table above:
   - `5978RH` → `type: "STRONG_SINGLE"`, `winner: "FSV"`
   - `5792RS` → `type: "NEGATIVE_DOMINANT"`
   - `1126AP` → `type: "BORDERLINE_DUAL"`, `winner: "ExVal"`

---

### Phase 2: Report Structure Update

**Read before starting**: `tools/tool1/Tool1Report.js` (full file), `tools/tool1/Tool1Templates.js` (full file — understand all existing template names before adding new ones), `shared/ReportStyles.js` (existing CSS classes), `docs/Navigation/GAS-NAVIGATION-RULES.md`

**Navigation reminder**: Any button in the report that calls `google.script.run` must use the `document.write()` pattern. All `withSuccessHandler` callbacks must null-check the result before accessing properties (`if (!result) { alert('...'); return; }`). Do not use `window.location.href` — use `window.top.location.href` if breaking out of the iframe is needed.

**Goal**: Updated HTML report with all new sections. Old report path preserved for backward compatibility.

**Tasks**:
1. Add to `Tool1Templates` object in `Tool1Templates.js`:
   - `COMBINATION_NARRATIVES` object (see Section 4 — all 7 entries, keyed alphabetically)
   - `STRENGTH_STATEMENTS` object (see Section 4 — all 6 pattern entries)
   - `POLARITY_INSIGHTS` object (see Section 5 — all 3 entries)
   - `NEGATIVE_DOMINANT_INTRO` as a **function** (not string) that takes `(winnerName, winnerScore)` and returns the narrative string — this avoids bracket-token substitution bugs
2. Update `Tool1Report.js` `render()` to implement 8-section structure from Section 7
3. Add backward compatibility: if `results.profileType` is absent, call `detectProfileType(results.scores, results.winner)` on the fly before rendering

**Implementation note for `NEGATIVE_DOMINANT_INTRO`**:
```javascript
// In Tool1Templates — use a function, not a string with [TOKENS]
NEGATIVE_DOMINANT_INTRO: function(winnerName, winnerScore) {
  return 'Your assessment results show low activation across most financial trauma patterns. ' +
    'Rather than a single dominant strategy driving your financial behavior, you appear to operate ' +
    'with relatively low intensity across all six patterns.\n\n' +
    'There are two interpretations of this result, and both may be partially true:\n\n' +
    'The strength interpretation: Low scores indicate that these defensive strategies are not strongly ' +
    'active in your life. This reflects genuine psychological flexibility.\n\n' +
    'The suppression interpretation: The patterns may be present but not consciously recognized.\n\n' +
    'Your highest relative pattern is ' + winnerName + ' (score: ' + winnerScore + '). ' +
    'While this is a relative high point rather than a strong absolute signal, a brief note on this pattern follows.';
}
```

**Test protocol**:
1. Deploy to GAS
2. View Tool 1 report for student `5978RH` — verify Section 2 shows "STRONG_SINGLE" framing, Section 5 shows strength callouts for LOW patterns (ExVal=-7 is LOW, Fear=6 is MODERATE — only ExVal should get a strength callout)
3. View report for student `1126AP` — verify Section 2 shows "BORDERLINE_DUAL" framing with ExVal+Showing named, Section 4 shows `ExVal_Showing` combination narrative
4. View report for student `5792RS` — verify NEGATIVE_DOMINANT framing, no pattern-specific narratives, domain scores prominent
5. View report for any student who completed Tool 1 **before** this deployment — verify report still renders (backward compatibility path)
6. Check browser console — zero JavaScript errors expected
7. Verify no apostrophe escaping issues in narrative text (look for `\'` in page source)

---

### Phase 3: PDF Update

**Read before starting**: `shared/PDFGenerator.js` (specifically `generateTool1PDF()` function — read it fully before editing)

**Goal**: PDF output mirrors the updated report structure.

**Tasks**:
1. Update `generateTool1PDF()` in `shared/PDFGenerator.js` to add:
   - Profile type statement after header
   - Combination narrative section (if `BORDERLINE_DUAL` or multiple HIGH patterns)
   - Strengths section (LOW pattern callouts)
   - Polarity insight (if applicable)
   - "What This Means for Your Finances" teaser (if Tool 2 not yet completed)
2. Use the same `detectProfileType()` on-the-fly approach if `profileType` is absent in the data

**Test protocol**:
1. Generate PDF for student `5978RH` — verify profile type section present, strength callouts present
2. Generate PDF for student `1126AP` — verify combination narrative section present
3. Generate PDF for student `5792RS` — verify NEGATIVE_DOMINANT framing, no pattern narratives
4. Verify PDF generates without error for an old-schema student (backward compatibility)

---

### Phase 4: Backward Compatibility Audit

**Read before starting**: Search for all places in the codebase that read Tool 1 `winner` or `scores` fields — run `grep -rn "tool1.*winner\|traumaScores\|topTrauma" tools/ core/` to find all callsites

**Goal**: Confirm all existing consumers of Tool 1 data still work after the response schema addition.

**Tasks**:
1. Verify `Tool2.js` `getTool1TraumaData()` still reads `scores` and `winner` correctly (it should — nothing removed)
2. Verify `CollectiveResults.js` Tool 1 rendering still works with old and new schema responses
3. Verify admin views that display Tool 1 results still render correctly
4. No code changes expected in this phase — this is a verification pass only

**Test protocol**:
1. View Tool 2 report for a student who has completed both Tool 1 (new schema) and Tool 2 — verify Tool 1 pattern data is referenced correctly in Tool 2's Section 7
2. View Collective Results for a student with all tools completed — verify Tool 1 section renders
3. View any admin analytics page that references Tool 1 patterns — verify no errors

---

## 11. Files to Create / Modify

| File | Action | Phase | Notes |
|------|--------|-------|-------|
| `tools/tool1/Tool1Constants.js` | **Create** (does not exist) | 1 | New file — also add to `appsscript.json` file list |
| `tools/tool1/Tool1.js` | Update | 1, 2 | Add `classifyPatternScore()`, `detectProfileType()`, update `processFinalSubmission()` |
| `tools/tool1/Tool1Templates.js` | Update | 2 | Add `COMBINATION_NARRATIVES`, `STRENGTH_STATEMENTS`, `POLARITY_INSIGHTS`, `NEGATIVE_DOMINANT_INTRO` function |
| `tools/tool1/Tool1Report.js` | Major update | 2 | 8-section report structure + backward compat |
| `shared/PDFGenerator.js` | Update | 3 | Lives in `shared/`, not `tools/tool1/` — edit `generateTool1PDF()` function |

---

*Document version: 1.0 | Last updated: 2026-04-05 | Status: Design — pending implementation*
