# Dashboard Plan — Known Issues & Inconsistencies

Found during pre-implementation review. Reference this document during each phase to avoid introducing these bugs.

---

## MUST FIX (Will cause bugs if not addressed)

### Issue 1: Belief-Behavior Gaps Not Rendered in PDF ✅ FIXED
- **Phases:** 9
- **Problem:** `_checkReportReadiness()` counts `beliefBehaviorGaps` as 1 of 5 report sections, but `buildIntegrationReportBody()` never renders a BB gaps section in the PDF. A student could have `ready: true` based partly on BB gap data that never appears in the report.
- **Fix:** Either add a BB gaps section to `buildIntegrationReportBody()`, or remove `beliefBehaviorGaps` from the readiness count (making it 4 total sections instead of 5).
- **Resolution:** Added BB gaps rendering section to `buildIntegrationReportBody()` in Phase 9 doc. Shows a table with belief, tool, belief score, action score, gap magnitude, and direction. Limited to 6 rows with overflow message. Added `bbGaps` variable extraction from `analysisData`. Added `.bb-gap-table` CSS to `getIntegrationStyles()`.

### Issue 2: `clientId` Not in Scope for Download Button ✅ FIXED
- **Phases:** 9
- **Problem:** The download script calls `.generateIntegrationPDF(clientId)` but `clientId` is not defined within `window.downloadIntegrationReport`. It must be injected into `_getScripts()` — e.g., `var clientId = '` + summary.clientId + `';`
- **Fix:** Verify how existing scripts in `_getScripts()` access `clientId` and follow the same pattern.
- **Resolution:** Added `var clientId` injection line to Phase 9 Section 4 (`_getScripts()`) with comment explaining the pattern. The variable is declared before the `downloadIntegrationReport` function so it is in scope when the function calls `.generateIntegrationPDF(clientId)`.

### Issue 3: Warnings Can Fire Without Tool 1 ⚠️ DESIGN DECISION NEEDED
- **Phases:** 2, 4
- **Problem:** Phase 2 single-trigger warnings fire on grounding tool subdomain scores alone — no Tool 1 required. A student with only Tool 7 (subdomain scores > 60) gets HIGH warnings but no profile. Phase 4 gating (`!hasProfile && !hasWarnings`) lets these warnings through, showing a partial Section 3 with warnings but no profile card.
- **Decision needed:** Is this intended? Options:
  1. **Require Tool 1:** Add `if (!hasT1) return [];` at the top of `_generateWarnings`. Warnings only show alongside a profile. Cleaner UX but delays feedback.
  2. **Allow warnings alone:** Keep current behavior. Students with only grounding tools see warnings without a profile card. Faster feedback but potentially confusing.
  3. **Show warnings with note:** Allow warnings without Tool 1, but add a note above them: "Complete Tool 1 to see your full integration profile and how these patterns connect." Compromise approach.
- **Status:** Not yet resolved. Must decide before Phase 2 implementation.

### Issue 4: Pipeline Comment Contradicts Code ✅ FIXED
- **Phase:** 6
- **Problem:** Comment says "Pipeline A active when both T3 and T7 are elevated." Code says `if (t3Overall < 40 && t7Overall < 40) return null;` — which activates the pipeline when EITHER is above 40, not both.
- **Fix:** Either change the code to `if (t3Overall < 40 || t7Overall < 40) return null;` (both must be elevated), or update the comment to say "when at least one is elevated."
- **Resolution:** Updated comments for both Pipeline A and Pipeline B in Phase 6 doc to say "active when at least one of T3 or T7/T5 is elevated (above 40)." Code logic is correct as-is — the comment was wrong.

---

## SHOULD FIX (Correctness / clarity improvements)

### Issue 5: Threshold Operator Inconsistency ✅ FIXED
- **Phases:** 1, 2
- **Problem:** `_detectProfile` uses `>=` for subdomain threshold checks. `_generateWarnings` uses `>` (strict). A score of exactly 50 triggers a profile but not a warning with the same threshold.
- **Fix:** Pick one operator and use it consistently. Recommend `>=` everywhere.
- **Resolution:** Standardized all grounding tool subdomain threshold checks to `>=` in Phase 2 doc. This includes: single-trigger warnings (`score >= trigger.threshold`), compound pattern grounding checks (all changed from `> 50` to `>= 50`), and the CRITICAL awareness gap grounding check (`>= 50`). Tool 1 score checks (`> 10`) kept as `>` because they use a different scale (-25 to +25) and represent "clearly elevated." Added checklist items to Phase 2 verification.

### Issue 6: Misleading "Almost there" Message ✅ FIXED
- **Phase:** 4
- **Problem:** Says "Complete Tool 1 and at least one other tool." But "other tool" must be a grounding tool (3, 5, or 7). Completing Tool 2, 4, 6, or 8 alongside Tool 1 produces warnings from Tool 1 data only (if any single triggers fire), but the message implies any tool will do.
- **Fix:** Change to: "Complete Tool 1 (Core Trauma Assessment) and at least one grounding tool (Identity, Love and Connection, or Financial Security) to unlock your integration insights."
- **Resolution:** Updated Phase 4 doc placeholder message to specify "at least one grounding tool (Identity, Love and Connection, or Financial Security)". Updated checklist to verify grounding tools are mentioned by name.

### Issue 7: Stress Normalization Assumption — VERIFY DURING IMPLEMENTATION
- **Phase:** 3
- **Problem:** `_calculateAwarenessGap` normalizes stress using `(avgStress + 10) * 5`, assuming Tool 2 stress ranges from -10 to +10. If the actual range is different, awareness gap scores will be wrong.
- **Fix:** During Phase 3 implementation, verify the actual stress range from Tool 2 benchmark data. Adjust the normalization formula if needed.
- **Status:** Phase 3 doc already acknowledges this assumption in code comments. Sample data in Phase 1 summary shape shows values in the -10 to +10 range. Verify against live Tool 2 data during implementation.

### Issue 8: Tool 4 Data Structure Unverified — VERIFY DURING IMPLEMENTATION
- **Phases:** 1, 8
- **Problem:** Summary shape shows `tool4.data.allocations: { M, E, F, J }`. Phase 8 GPT prompt uses these keys. But MEMORY.md says "Tool 4 saves `multiply` NOT `multiplyAmount`" — the actual keys for allocations may differ.
- **Fix:** During Phase 1 implementation, read Tool4.js to verify the actual data structure for allocations. Update the summary shape and Phase 8 prompt if needed.
- **Status:** Not a code bug yet — it is an assumption in example data. Must be verified by reading Tool4.js during Phase 1 coding session.

### Issue 9: Dependency Chain Inaccuracy ✅ FIXED
- **Phase:** Master Roadmap
- **Problem:** Roadmap says "Phases 8-9 run after Phase 5." Phase 8 (IntegrationGPT) only needs Phases 1-3 (detection engines). Phase 9 needs Phase 5 + Phase 8.
- **Fix:** Update dependency chain: Phase 8 depends on Phases 1-3 only. Phase 9 depends on Phase 5 + Phase 8.
- **Resolution:** Updated Master Roadmap dependency diagram to show Phase 8 branching directly from Phase 3. Updated text to: "Phase 8 can run after Phases 1-3 (it only needs the detection engines, not the UI). Phase 9 runs after Phase 5 + Phase 8."

### Issue 10: NavigationHelpers.js in File Map but Unused ✅ FIXED
- **Phase:** Master Roadmap
- **Problem:** `shared/NavigationHelpers.js` is listed in the file modification map for Phase 6, but nothing is added to it. It only appears in "Files to Read First."
- **Fix:** Remove `shared/NavigationHelpers.js` from the file modification map, or clarify what change is needed.
- **Resolution:** Removed `shared/NavigationHelpers.js` from the file modification map. It is only read as a reference for patterns — no modifications are made to it.

---

## GOOD TO KNOW (May or may not need action)

### Issue 11: `history.back()` After `document.write()` — TEST DURING PHASE 6
- **Phase:** 6
- **Problem:** Coach view "Back" button uses `history.back()`. After `document.write()` replaces the page, browser history behavior is unpredictable in GAS.
- **Action:** Test during Phase 6. If broken, replace with a `google.script.run` call that navigates back to the admin student detail page via `document.write()`.
- **Status:** Valid concern. Cannot be resolved until Phase 6 testing in the actual GAS environment.

### Issue 12: Dead Code in Code.js ✅ FIXED
- **Phase:** 6
- **Problem:** `getIntegrationAnalysisPage(clientId)` is added to Code.js but nothing calls it. The button uses `handleGetIntegrationAnalysisRequest` instead.
- **Action:** Either remove `getIntegrationAnalysisPage` from the Phase 6 plan, or document its intended use.
- **Resolution:** Removed the `getIntegrationAnalysisPage` wrapper from Phase 6 doc (Section 4 is now marked "NOT NEEDED" with explanation). The admin button calls `handleGetIntegrationAnalysisRequest` directly via `google.script.run`. Also removed Code.js from Phase 6 in the Master Roadmap file modification map.

### Issue 13: BB Gap Scale Label Unverified — VERIFY DURING PHASE 3/5
- **Phases:** 3, 5
- **Problem:** Phase 5 renders belief-behavior gap scores as `"/ 10"` but the actual question-level score scale (1-5? 1-7? 1-10?) depends on how grounding tools store aspect data.
- **Action:** Phase 3 doc acknowledges this as a "known variable." During Phase 3 testing, verify the actual scale and update the Phase 5 display label.
- **Status:** Cannot be resolved until testing against live grounding tool data.

### Issue 14: Phase 7 Contraction Grep False Positives — IMPLEMENTATION NOTE
- **Phase:** 7
- **Problem:** The grep pattern for contractions (`don't`, `it's`, etc.) will match code comments and variable names, not just user-facing strings.
- **Action:** Review grep output manually during Phase 7. Only fix matches inside string literals and user-facing messages.
- **Status:** Awareness note for the Phase 7 implementer. No code change needed.
