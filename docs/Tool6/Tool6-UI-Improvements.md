# Tool 6 UI Improvements

> **Purpose:** Document UI/UX improvements needed to make Tool 6 more user-friendly for students unfamiliar with financial planning concepts.
> **Created:** January 24, 2026
> **Status:** Planning

---

## Table of Contents
1. [User Feedback & Observations](#user-feedback--observations)
2. [AI Analysis Observations](#ai-analysis-observations)
3. [Prioritized Improvements](#prioritized-improvements)
4. [Bug Fixes Required](#bug-fixes-required)
5. [Implementation Plan](#implementation-plan)

---

## User Feedback & Observations

### 1. Guided Walkthrough Like Tool 4
**Issue:** Tool 6 doesn't guide users through sections the way Tool 4 does.

**Current State:** All sections are collapsible but users must figure out the flow themselves.

**Desired State:** Mirror Tool 4's interface that "walks" users through each section by:
- Auto-opening the current section
- Auto-closing completed sections
- Showing clear instructions on what to do
- Indicating what comes next

**Reasoning:** Tool 4's guided approach reduces cognitive load and keeps students focused on one task at a time.

---

### 2. Separate Profile ID Section from Follow-on Questions
**Issue:** Profile classification (Phase A) and allocation inputs (Phase B) feel merged together.

**Current State:**
- Phase A asks 2-4 classification questions
- Once profile is determined, user clicks "Continue to Allocation Details"
- Phase B shows all remaining questions in one long form

**Desired State:**
- Section 1 should END once profile is identified via the question tree
- Profile should display prominently in a banner at the top (persistent)
- Banner should include a "Change Profile" option
- Section 2 (allocation inputs) should be clearly separate

**Reasoning:** Clear separation helps students understand they've completed a milestone (profile identification) before moving to the detailed questions.

---

### 3. Skip Savings Priorities Section When Not Applicable
**Issue:** Ambition Quotient (Phase C) asks about Education and Health domains even when user doesn't have access to those vehicles.

**Current State:**
- Education questions show if `hasChildren === 'Yes'`
- Health questions show if `hsaEligible === 'Yes'`
- But the whole Phase C still appears with just Retirement questions

**Desired State:**
- If user has NO children AND is NOT HSA-eligible, skip Phase C entirely
- Retirement domain would be the only domain, so weighting is meaningless (100% to Retirement)
- Go directly from Phase B to calculation

**Reasoning:** Asking "prioritize between retirement, education, and health" when only retirement applies creates confusion and wastes time.

---

### 4. Investment Risk Profile Section Needs Description
**Issue:** Investment score (1-7 scale) is presented without context.

**Current State:** Shows "Investment Score: 4/7 (Moderate)" from Tool 4 with no explanation.

**Desired State:** Add educational content:
- What the score means (conservative to aggressive)
- How it affects projected returns (8% to 20%)
- Why it matters for retirement planning
- If using backup questions, explain how to answer

**Reasoning:** Students don't understand what "Moderate" means or how it impacts their projections.

---

### 5. Tax Strategy Section Needs Description
**Issue:** "When would you prefer to minimize taxes?" question is too abstract.

**Current State:** Three options (Now/Later/Both) with minimal explanation.

**Desired State:** Add educational content:
- What "minimize taxes now" means (Traditional accounts - reduce current taxable income)
- What "minimize taxes later" means (Roth accounts - tax-free withdrawals in retirement)
- What "both" means (balanced approach)
- Help students understand their likely tax bracket situation
- Maybe include income-based recommendation hint

**Reasoning:** Students don't understand tax brackets or how Roth vs Traditional affects their retirement. This is THE most important financial decision in the tool.

---

### 6. Recalculate Allocation Button - Purpose Unclear
**Issue:** There's a "Recalculate Allocation" button under the sliders. Users don't know why it's there.

**Questions to answer:**
- What does this button do?
- Why is it needed if sliders update in real-time?
- Should it be removed or renamed?

**Current Understanding:**
- Sliders provide real-time visual feedback (amount/percentage display)
- But some coupled slider behavior and waterfall recalculations require server round-trip
- Button triggers full recalculation with IRS limit validation

**Desired State:** Either:
- Remove the button if not needed (sliders should auto-recalc)
- OR add clear explanation of what it does and when to use it
- OR rename to something clearer like "Update Projections"

**Reasoning:** Unexplained buttons create confusion and distrust in the interface.

---

### 7. Solo 401(k) Roth Not Updating Tax Graph
**Issue:** Bug - Solo 401(k) Roth contributions don't appear to affect the tax treatment graph.

**Current State:** User reports 100% allocation to Solo 401(k) Roth but graph shows 0% tax-free.

**Root Cause (to investigate):**
- The `calculateTaxBreakdown()` function may not include Solo 401(k) Roth in the Roth allocation calculation
- Looking at the code, it checks for `'401(k) Roth'` but Solo 401(k) has different names: `'Solo 401(k) Employee (Roth)'` and `'Solo 401(k) Employee (Traditional)'`

**Fix Required:** Update `calculateTaxBreakdown()` to include Solo 401(k) Roth variant.

---

### 8. Scenario Management Section Needs Instructions
**Issue:** Scenario management section lacks guidance.

**Current State:**
- Save scenario input and button
- List of saved scenarios below
- Compare dropdown at bottom
- No explanation of what scenarios are or why to save them

**Desired State:**
- Add introductory text explaining scenarios
- "Scenarios let you save different allocation strategies and compare them side-by-side"
- Explain when you might want to save a scenario (e.g., "after adjusting sliders to see a Roth-heavy vs Traditional-heavy approach")

---

### 9. Action Buttons Location (Mirror Tool 4)
**Issue:** Action buttons are buried in the saved scenarios section.

**Current State:** Save/Compare buttons are at the bottom of Section 4.

**Desired State:** Mirror Tool 4's interface with action buttons at the TOP of the calculator section:
- Save Scenario button
- Reset to Recommended button
- Compare Scenarios button
- Download PDF button

**Reasoning:** Important actions should be visible and accessible without scrolling. Tool 4's pattern works well.

---

### 10. Visual Section Styling (Mirror Tool 4)
**Issue:** Tool 6 sections lack the polished visual treatment of Tool 4.

**Current State:** Basic section styling without consistent visual hierarchy.

**Desired State:** Match Tool 4's visual patterns:
- **Section headers:** Consistent styling with icons in headers
- **Transparent card backgrounds:** Semi-transparent boxes behind each section for visual separation
- **Header icons:** Meaningful icons that represent each section's purpose
- **Visual hierarchy:** Clear distinction between sections

**Reasoning:** Tool 4's visual design creates a professional, approachable feel that reduces cognitive load and improves scannability.

---

### 11. Navigation & Help Buttons
**Issue:** Tool 6 lacks standard navigation elements present in other tools.

**Current State:** No easy way to return to dashboard or get help.

**Desired State:** Add consistent navigation elements (like Tool 4 and Tool 5):
- **Return to Dashboard button:** Prominent button to go back to main dashboard
- **Get Help button:** Access to help resources (like on dashboard and Tool 5)
- **Placement:** Top of tool, consistent with other tools

**Reasoning:** Users need easy escape routes and help access. Consistency across tools reduces learning curve.

---

## AI Analysis Observations

### 10. No Welcome/Orientation Screen
**Issue:** Tool 6 jumps straight into the first question (ROBS status) without context.

**Current State:** User sees "Are you using or interested in ROBS?" immediately.

**Desired State:** Brief welcome screen explaining:
- What Tool 6 does ("helps you figure out how to allocate your retirement savings")
- What they'll learn ("your investor profile and recommended account allocation")
- Estimated time ("takes about 5 minutes")
- What data is pulled from previous tools

**Reasoning:** Students need orientation before diving into unfamiliar territory.

---

### 11. No Progress Indicator
**Issue:** Users don't know how far along they are in the questionnaire.

**Current State:** No visual progress indicator.

**Desired State:** Add progress bar or step indicator:
- "Step 1 of 3: Determine Your Profile"
- "Step 2 of 3: Your Financial Details"
- "Step 3 of 3: Your Priorities"
- Visual progress bar filling as they go

**Reasoning:** Progress indicators reduce anxiety and improve completion rates.

---

### 12. Jargon Overload
**Issue:** Financial terms used without explanation.

**Terms that need tooltips or explanations:**
- ROBS (Rollover for Business Startups)
- 401(k) Traditional vs Roth
- IRA Traditional vs Roth
- HSA (Health Savings Account)
- Phase-out limits
- Employer match
- Tax-deferred vs tax-free
- Catch-up contributions

**Desired State:** Add info icons (ℹ️) next to terms that expand to show definitions.

**Reasoning:** Students unfamiliar with financial terms get lost immediately.

---

### 13. One Question at a Time Option
**Issue:** Phase B presents many questions at once in a grid layout.

**Current State:** 12-20 questions displayed in a grid, can be overwhelming.

**Desired State:** Consider wizard-style flow for Phase B:
- One question (or related question group) at a time
- Clear "Next" button to proceed
- Progress indicator showing position
- Ability to go back

**Reasoning:** Dense forms create cognitive overload. Wizard style is more approachable.

**Trade-off:** Wizard style takes longer for experienced users. Could offer "Show all questions" toggle.

---

### 14. No Celebration on Profile Reveal
**Issue:** Profile assignment feels anticlimactic.

**Current State:** Profile card appears with icon and name, "Continue" button.

**Desired State:** Make profile reveal more engaging:
- Brief animation or highlight effect
- Explain what the profile means in plain English
- List 2-3 key characteristics
- Show which account types are recommended

**Reasoning:** This is a key moment - students should feel they've learned something valuable.

---

### 15. Slider Behavior Not Explained
**Issue:** Coupled sliders and shared limits are confusing.

**Current State:**
- Some sliders affect each other (401k Trad + Roth share $23,500 limit)
- Lock buttons exist without explanation
- Max values change dynamically

**Desired State:** Add guided tutorial or explanation:
- "Some accounts share contribution limits - when you increase one, the other decreases"
- "Lock a slider to prevent it from changing when you adjust others"
- Visual indicator when sliders are coupled (group them together?)

**Reasoning:** Unexpected behavior creates distrust and confusion.

---

### 16. Results Summary in Plain English
**Issue:** Results are presented as numbers without interpretation.

**Current State:** Shows projected balance, monthly income, percentages.

**Desired State:** Add "What This Means" section:
- "By saving $X/month across these accounts, you're projected to have $Y at retirement"
- "This could provide about $Z/month in retirement income"
- "Your mix is X% tax-free, which gives you flexibility in retirement"
- Comparison to "doing nothing" baseline

**Reasoning:** Numbers alone don't create understanding or motivation.

---

### 17. Domain Weight Transparency
**Issue:** Ambition Quotient calculates weights silently.

**Current State:** User answers importance/anxiety/motivation questions, but never sees the resulting weights.

**Desired State:** After Phase C, show computed weights:
- "Based on your answers, we're allocating your budget as:"
- "60% to Retirement, 25% to Education, 15% to Health"
- Option to manually adjust if desired

**Reasoning:** Transparency builds trust. "Magic" calculations feel arbitrary.

---

## Bug Fixes Required

### BUG-1: Solo 401(k) Roth Tax Graph ✅ FIXED (Jan 24, 2026)
**Priority:** High
**Issue:** Solo 401(k) Roth not counted in tax-free allocation percentage.
**Location:** `calculateTaxBreakdown()` function in Tool6.js (lines 1848-1893)
**Root Cause:** Server-side function was using hardcoded vehicle names that did not include all variants.
**Fix Applied:** Updated `calculateTaxBreakdown()` to include ALL vehicle types:
- **Roth (tax-free):** Added `Solo 401(k) Employee (Roth)`, `Mega Backdoor Roth`
- **Traditional (tax-deferred):** Added `Solo 401(k) Employee (Traditional)`, `Solo 401(k) Employer`, `401(k) Employer Match`, `ROBS Distribution`, `Defined Benefit Plan`
- **Note:** Client-side code already uses smart pattern matching (`indexOf('Roth')`) and was not affected.

### BUG-2: Backup Questions Save Not Working ✅ FIXED (Jan 24, 2026)
**Priority:** High
**Issue:** Backup questions "Save & Continue" button collected empty data, causing page to reload with blank answers.
**Location:** `saveBackupQuestions()` function and `hasBackupAnswers` check in Tool6.js
**Root Cause:** Multiple issues:
1. `saveBackupQuestions()` was looking for wrong field IDs for Tool 1 tier (`backup_investmentScore`, `backup_riskComfort`) instead of actual fields (`backup_stressResponse`, `backup_coreBelief`, `backup_consequence`)
2. `hasBackupAnswers` check only looked for Tool 4/2 fields, missing Tool 1 fields
**Fix Applied:**
- Updated `saveBackupQuestions()` to collect correct field names for all 3 tiers
- Updated `hasBackupAnswers` to check for backup fields from ALL tiers (Tool 1, 2, and 4)

### BUG-3: (Add others as discovered)

---

## Prioritized Improvements

### P0 - Critical (Fix Before Class Use)
1. ~~**BUG-1:** Solo 401(k) Roth tax graph fix~~ ✅ FIXED
2. **Guided walkthrough:** Mirror Tool 4's section-by-section flow
3. **Profile banner:** Persistent profile display with change option

### P1 - High Priority (Major UX Wins)
4. **Tax strategy explanation:** Educational content for Roth vs Traditional decision
5. **Investment score explanation:** What the score means and how it affects projections
6. **Action buttons relocation:** Move to top of calculator section like Tool 4
7. **Skip Phase C when single domain:** Don't ask priorities when only Retirement applies
8. **Visual section styling:** Match Tool 4's headers, icons, and transparent card backgrounds
9. **Navigation buttons:** Add Return to Dashboard and Get Help buttons

### P2 - Medium Priority (Polish)
10. **Progress indicator:** Step 1/2/3 with visual progress bar
11. **Scenario management instructions:** Explain what scenarios are and why to save
12. **Recalculate button:** Clarify purpose or remove
13. **Welcome screen:** Brief orientation before first question

### P3 - SKIP (Not Implementing)
14. ~~**Jargon tooltips:**~~ SKIP - Time-consuming, minimal student value
15. ~~**One-question-at-a-time option:**~~ SKIP - Major restructure, slows experienced users
16. ~~**Profile reveal celebration:**~~ SKIP - Polish only, not essential
17. ~~**Domain weight transparency:**~~ SKIP - Could confuse more than help
18. ~~**Auto-save draft:**~~ SKIP - Tool 6 is single-page, less needed than Tool 5

---

## Implementation Plan

### Sprint 11.1: Foundation & Navigation ✅ COMPLETE (Jan 24, 2026)
- [x] Fix Solo 401(k) Roth tax graph bug ✅ FIXED
- [x] Add Return to Dashboard button (top of page, gold `.btn-nav` style) ✅ COMPLETE
- [x] Add Get Help button (use FeedbackWidget from Tool 5) ✅ COMPLETE - Already integrated
- [x] Implement Tool 4-style guided walkthrough (auto-open/close sections) ✅ COMPLETE - Added intro section
- [x] Add section headers with icons (📊 Profile, 💼 Details, ⚖️ Priorities, 💰 Allocation) ✅ COMPLETE - Already had icons
- [x] Apply transparent card backgrounds (`rgba(255, 255, 255, 0.03)`) ✅ COMPLETE - Already applied

### Sprint 11.2: Profile & Flow Improvements ✅ COMPLETE (Jan 26, 2026)
- [x] Create "Your Settings" panel consolidating all adjustable inputs ✅ COMPLETE
  - Monthly Budget, Years to Retirement, Risk Profile, Tax Strategy, Change Profile button
- [x] Reorder Section 2: Current State → Settings → Sliders → Trauma Insights ✅ COMPLETE
- [x] Create persistent profile banner (shows after classification) ✅ COMPLETE
  - Shows profile icon, name, budget, years, risk score; updates dynamically
- [x] Skip Phase C when only Retirement domain applies ✅ COMPLETE
  - Skips directly to submit when hasChildren=No AND hsaEligible=No
- [x] Add collapsible section summaries (show values when collapsed) ✅ COMPLETE
  - Section 2: Total Allocated, Tax Strategy, Vehicle count
  - Section 3: Projected Balance, Monthly Income, Return Rate
  - Section 4: Saved Scenarios count
- [x] ~~Separate profile classification into distinct section~~ SKIPPED (banner provides context)

### Sprint 11.3: Educational Content ✅ COMPLETE (Jan 26, 2026)
- [x] Add welcome/intro section (explain tool purpose, time estimate, data sources) ✅ COMPLETE (Jan 24, 2026)
- [x] Add tax strategy explanation (Roth vs Traditional decision - THE key decision) ✅ COMPLETE
- [x] Add investment score explanation (what 1-7 means, 8%-20% returns) ✅ COMPLETE
- [x] Add scenario management instructions ✅ COMPLETE
- [x] Add slider behavior explanation (coupled limits, lock buttons) ✅ COMPLETE

### Sprint 11.4: Progress & Actions ✅ COMPLETE (Jan 26, 2026)
- [x] ~~Add progress indicator~~ SKIPPED (user decision - not needed)
- [x] Move action buttons to top of calculator section ✅ COMPLETE
  - Added Quick Actions bar after Settings panel with Recalculate button
  - Kept secondary Recalculate at bottom for convenience after slider adjustments
- [x] Investigate/clarify recalculate button purpose ✅ COMPLETE
  - Added hint text explaining what Recalculate does
  - Top: "Changed your settings above? Click to re-optimize your vehicle allocation."
  - Bottom: "Re-runs the optimization algorithm with your current slider values and settings."
- [x] Add plain English results summary ("What This Means") ✅ COMPLETE
  - New `.results-summary` section with green gradient border
  - Shows: monthly/annual savings, tax strategy in plain English, 10-year projection
  - Updates dynamically when sliders or investment score changes

### Sprint 11.5: SKIP (Not Implementing)
- ~~Jargon tooltips~~ - Time-consuming, minimal value
- ~~Wizard-style Phase B~~ - Major restructure, slows experienced users
- ~~Profile reveal celebration~~ - Polish only
- ~~Domain weight transparency~~ - Could confuse more than help
- ~~Auto-save draft~~ - Single-page tool, less needed

---

## Reference: Tool 4 & Tool 5 Patterns to Mirror

### Tool 4 Patterns (Verified in Code)

| Pattern | Tool 4 Implementation | Tool 6 Status |
|---------|----------------------|---------------|
| **Welcome Section** | Intro with transparent background `rgba(79, 70, 229, 0.1)`, explains what tool does, 2-3 min estimate | ❌ Missing |
| **Section Headers with Icons** | Emoji icons (📊, 🎯, 💰), clickable headers, expand/collapse indicators | ❌ Missing |
| **Collapsible Sections** | Auto-collapse completed sections, show summary when collapsed | ❌ Missing |
| **Return to Dashboard Button** | Top of page, gold button `.btn-nav`, "← Return to Dashboard" | ❌ Missing |
| **Action Buttons at Top** | Calculator controls: Reset, Check Plan, Save, Download Report | ❌ Buttons at bottom |
| **Progress Summary** | Shows completed values when section collapsed (Income, Essentials, etc.) | ❌ Missing |
| **Loading Overlay** | Full-screen with spinner, contextual messages ("Loading Tool 1...") | ⚠️ Partial |
| **Lock Buttons for Sliders** | 🔓/🔒 toggle to prevent slider changes | ✅ Has locks |
| **Slider Visual Feedback** | Fill gradient, real-time dollar amounts in gold | ✅ Has this |
| **Helper Text** | `.question-help` italic text explaining each input | ⚠️ Some present |
| **Validation Results Display** | Color-coded warnings (red errors, blue info) | ⚠️ Partial |
| **Priority Cards** | Selectable cards with recommended/challenging indicators | N/A |
| **Transparent Card Backgrounds** | `rgba(255, 255, 255, 0.03)` with subtle borders | ❌ Missing |

### Tool 5 Patterns (Verified in Code)

| Pattern | Tool 5 Implementation | Tool 6 Status |
|---------|----------------------|---------------|
| **Welcome/Intro Page** | Full intro page explaining domains, time estimate (20-25 min), tips | ❌ Missing |
| **Dashboard Button** | Top-left "← Dashboard" button in page header | ❌ Missing |
| **Get Help Button** | Floating bottom-right "💬 Get Help" via FeedbackWidget | ❌ Missing |
| **Back Button** | "← Back to Page X" below form, saves before navigating | ❌ Missing |
| **Progress Bar** | Visual progress fill with "Page X of Y" text | ❌ Missing |
| **Edit Mode Banner** | Yellow banner when editing previous responses | N/A |
| **Empathy Tip Box** | Warm-toned box with 💡 icon for sensitive content | Could use for tax/investment |
| **Loading States** | `showLoading('Saving your responses')` with contextual text | ⚠️ Partial |
| **Auto-Save Draft** | Debounced auto-save on input change | ❌ Missing |

### Patterns MISSING from Tool 6 (Action Items)

**Critical (Add to Sprint 11.1-11.3):**
1. ❌ **Welcome/Intro Section** - Neither Tool 4 nor Tool 5 start cold
2. ❌ **Dashboard Navigation Button** - Both tools have this prominently
3. ❌ **Get Help Button** - Tool 5 has floating FeedbackWidget
4. ❌ **Progress Indicator** - Tool 5 has progress bar, Tool 4 has summary
5. ❌ **Section Headers with Icons** - Tool 4 uses emoji icons (📊, 🎯, 💰)
6. ❌ **Transparent Card Backgrounds** - Tool 4's visual hierarchy
7. ❌ **Collapsible Section Summaries** - Tool 4 shows values when collapsed

**Nice to Have (Sprint 11.4+):**
8. ⚠️ **Auto-Save Draft** - Tool 5 has this, useful for long forms
9. ⚠️ **Back Button** - Tool 5 allows going back with data saved
10. ⚠️ **Empathy/Tip Boxes** - Tool 5's warm-toned guidance boxes

---

## Recommended Section Icons (Mirror Tool 4)

| Section | Suggested Icon | Reasoning |
|---------|---------------|-----------|
| Welcome/Intro | 🎯 or 📋 | Goal-setting, getting started |
| Profile Classification | 👤 or 📊 | Personal profile |
| Allocation Inputs | 💼 or 📝 | Work/financial details |
| Savings Priorities | ⚖️ or 🎚️ | Balancing priorities |
| Your Allocation | 💰 or 📈 | Money/results |
| Scenarios | 💾 or 📊 | Saving/comparing |

---

## Notes

- Keep changes incremental and testable
- Maintain existing functionality while improving UX
- Test with actual students to validate improvements
- Document any new patterns for future tools
- **Use shared utilities where possible** (FeedbackWidget, loading patterns)
