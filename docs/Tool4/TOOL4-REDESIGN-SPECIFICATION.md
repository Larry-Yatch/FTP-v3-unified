# Tool 4 Redesign Specification: Hybrid V1 + Calculator Architecture

**Created:** 2025-11-28
**Last Updated:** 2025-11-30 (Phase 4B Extended - 6 Helpers Complete)
**Status:** Phase 4B Extended Complete ✅ | 6 Helpers Deployed ✅ | Production Ready 🚀
**Purpose:** Complete architectural specification for Tool 4 redesign combining V1's personalization engine with interactive calculator

---

## 🔔 Session Notes (2025-11-30 - Phase 4B Extended: Additional Helpers)

**Phase 4B Extended: Debt Payoff Timeline + Lifestyle Inflation Check Helpers - COMPLETE ✅**

**What Was Implemented:**
- ✅ **Debt Payoff Timeline Helper** (Helper #5)
  - **Triggers:** totalDebt > 0 AND Freedom < 30%
  - **Shows:** Current vs suggested debt payoff timelines with full interest calculations
  - **Displays:**
    - Current debt amount with 15% average interest assumption
    - Timeline at current Freedom allocation (months to payoff, years + months)
    - Timeline at suggested 30% Freedom allocation
    - Total interest paid in both scenarios
    - Time saved (months faster) and money saved (interest reduction)
  - **Actions:** "Adjust Freedom to 30%" button
  - **Severity:** Warning (🟡)
  - **Special handling:** Detects if payment cannot cover interest ("Debt grows indefinitely")
  - **Implementation:** ~90 lines (loan payoff formula: `n = -log(1 - r*P/M) / log(1 + r)`)

- ✅ **Lifestyle Inflation Check Helper** (Helper #6)
  - **Triggers:** monthlyIncome > $5,000 AND Enjoyment > 30% AND Multiply < 15%
  - **Shows:** Income level analysis + wealth projection comparison
  - **Displays:**
    - Income classification (Very High/High/Above Average/Average/Below Average)
    - Income percentile range (Top 5%, Top 15%, etc.)
    - Current Enjoyment vs Multiply allocation comparison
    - 10-year wealth projection at 7% average return:
      - Current path (existing Multiply %)
      - Suggested path (20% Enjoyment, higher Multiply)
      - **Wealth gap** highlighting cost of lifestyle inflation
    - Thought-provoking question: "Are you living like you earn $X/month, or building wealth like someone who earns that much?"
  - **Actions:** "Shift to X% Multiply" button (dynamically calculated)
  - **Severity:** Warning (🟡)
  - **Implementation:** ~105 lines (future value formula with compound interest)

**New Action Function:**
- ✅ `shiftEnjoymentToMultiply(targetEnjoyment, targetMultiply)` - Adjusts both buckets simultaneously, redistributes remainder proportionally to Essentials/Freedom, normalizes to 100%, updates UI, closes helper, re-validates

**Integration:**
- ✅ Added to `getHelperTitle()` (2 new titles)
- ✅ Added to `renderHelperByType()` (2 new cases)
- ✅ Added `detectDebtPayoffTimeline()` function
- ✅ Added `detectLifestyleInflation()` function
- ✅ Integrated into `checkMyPlan()` validation flow
- ✅ Debt Payoff added to Financial Reality tier (warning severity)
- ✅ Lifestyle Inflation added to Behavioral Alignment tier (warning severity)

**Code Statistics:**
- Debt Payoff Timeline Helper: ~90 lines
- Lifestyle Inflation Check Helper: ~105 lines
- Action function: ~48 lines
- Detection functions: ~26 lines
- Integration code: ~34 lines
- **Total Phase 4B Extended: ~288 lines**
- **Cumulative Phase 4B (all 6 helpers): ~821 lines**

**Testing Results:**
- ✅ Debt Payoff Timeline triggers correctly with debt > 0 and Freedom < 30%
- ✅ Lifestyle Inflation triggers correctly with income > $5k, Enjoyment > 30%, Multiply < 15%
- ✅ Both helpers can appear together in validation results
- ✅ Debt payoff calculations accurate (tested with $25k debt scenarios)
- ✅ Wealth projection calculations accurate (tested with $10k income scenarios)
- ✅ Action buttons work correctly (adjust allocations, close helper, re-validate)
- ✅ No apostrophe escaping issues (follows CLAUDE.md guidelines)
- ✅ Production deployed and verified

**Current Stable State:**
- Commit: `a8da9e9` - "feat(tool4): Add Debt Payoff Timeline and Lifestyle Inflation Check helpers"
- Deployed to Apps Script: ✅ (clasp push complete)
- Pushed to GitHub: ✅ (origin/feature/grounding-tools)

**Complete Helper Inventory (6 Total):**
1. ✅ Emergency Fund Timeline Helper (Phase 4B)
2. ✅ Gap Analysis Helper (Phase 4B)
3. ✅ Priority Re-Check Helper (Phase 4B)
4. ✅ Enjoyment Reality Check Helper (Phase 4B)
5. ✅ Debt Payoff Timeline Helper (Phase 4B Extended)
6. ✅ Lifestyle Inflation Check Helper (Phase 4B Extended)

**Phase 4B Extended Status:** ✅ **COMPLETE, TESTED, AND PRODUCTION READY**

**Ready for Next Phase:**
- Phase 4C: Validation UX Refinement (bucket-level indicators, progressive disclosure, severity-based visual design)
- Or: Consider Phases 5-7 (Progressive Unlock, Scenario Comparison, Report Generation)

---

## 🔔 Session Notes (2025-11-30 - Phase 4B Initial Implementation)

**Phase 4B: Interactive Helpers - COMPLETE ✅**

**What Was Implemented:**
- ✅ 4 interactive helpers with expandable "Learn More" buttons
- ✅ Emergency Fund Timeline Helper (triggers: emergency fund < 3 months AND Freedom < 20%)
  - Shows current coverage, 4-month target, gap analysis
  - Compares current Freedom % timeline vs suggested 25% timeline
  - One-click "Adjust Freedom to 25%" button
- ✅ Gap Analysis Helper (triggers: 15+ percentage point drift from recommended)
  - Side-by-side table: Recommended → Current → Difference
  - Red highlighting for 15pp+ differences
  - One-click "Reset to Recommended" button
- ✅ Priority Re-Check Helper (triggers: 2+ buckets out of expected range)
  - Priority-specific explanations for all 10 priorities
  - Strategic reasoning for each allocation pattern
  - Options: Keep setup, adjust to match priority, or reset
- ✅ Enjoyment Reality Check Helper (triggers: Enjoyment > 35%)
  - Monthly/weekly breakdown of spending
  - Split: dining/entertainment vs hobbies/shopping
  - Actions: "Keep It" or "Adjust Enjoyment" (focuses slider)

**UX Features:**
- ✅ User-toggleable helpers (click "Learn More" to expand/collapse)
- ✅ One helper open at a time
- ✅ Color-coded buttons matching severity (red/yellow/blue)
- ✅ Auto-adjust + re-validate + collapse on action buttons
- ✅ Severity-based display order (Critical → Warning → Suggestion)
- ✅ Trauma-informed language throughout
- ✅ White background sections with proper text color (#374151)

**Bug Fixes:**
- ✅ Fixed resetToRecommended() to close helper and re-run validation
- ✅ Fixed white-on-white text in Emergency Fund and Enjoyment helpers
- ✅ Fixed Priority Re-Check detection to count values warnings correctly
- ✅ Fixed Values Alignment to detect over-maximum violations (not just under-minimum)
- ✅ Added priority-specific explanations to Priority Re-Check helper

**Testing Results:**
- ✅ All 4 helpers trigger correctly based on conditions
- ✅ Helpers collapse after action buttons clicked
- ✅ Text visible in all white background sections
- ✅ Priority explanations display for all 10 priorities
- ✅ No apostrophe escaping issues (pre-deployment check passed)
- ✅ Production tested and working

**Code Statistics:**
- Helper functions: ~420 lines
- Priority explanations: ~23 lines
- Detection logic: ~30 lines
- Display integration: ~60 lines
- **Total Phase 4B: ~533 lines of production code**

**Current Stable State:**
- Commit: `14970f9` - "feat(tool4): Add priority-specific explanations to Priority Re-Check helper"
- Deployed to Apps Script: ✅ (latest deployment)
- Pushed to GitHub: ✅ (origin/feature/grounding-tools)

**Phase 4B Status:** ✅ **COMPLETE, TESTED, AND PRODUCTION READY**

**Ready for Next Phase:**
- Phase 4C: Validation UX Refinement (bucket-level indicators, progressive disclosure, severity-based visual design)

---

## 🔔 Session Notes (2025-11-30 - Phase 4A Implementation)

**Phase 4A: Enhanced Validation Engine - COMPLETE ✅**

**What Was Implemented:**
- ✅ Added 2 new pre-survey questions (Q3: Total Debt, Q4: Emergency Fund)
- ✅ Reordered questions: Q1-4 financial dollar inputs, Q5-10 behavioral sliders
- ✅ Enhanced helper text with "Enter 0 if none" guidance for financial inputs
- ✅ Simplified slider helper text to avoid redundancy with dynamic labels
- ✅ Three-tier validation system implemented:
  1. Behavioral Validation (4 rules: discipline/impulse vs allocations)
  2. Values Alignment (10 priority mappings with expected ranges)
  3. Financial Reality Checks (debt-to-income, emergency fund coverage)
- ✅ Helper functions for tier mapping (debt, emergency fund, interest level)
- ✅ Updated buildV1Input() to use direct debt/emergency fund inputs
- ✅ Severity categorization: Critical (🔴), Warning (🟡), Suggestion (🔵)
- ✅ Calculator state extended with preSurvey data object
- ✅ All validation messages use trauma-informed language

**Bug Fixes:**
- ✅ Fixed apostrophe escaping issue in template literals (you're → you are)
- ✅ Added CLAUDE.md guidelines for JavaScript in template literals
- ✅ Pre-deployment check command for escaped apostrophes

**Testing Results:**
- ✅ Deployed to production without errors
- ✅ Pre-survey form validation working with 10 questions
- ✅ New questions collecting debt and emergency fund data correctly

**Current Stable State:**
- Commit: `61bee37` - "refactor(tool4): Simplify slider helper text to avoid redundancy"
- Deployed to Apps Script: ✅ (latest deployment)
- Pushed to GitHub: ✅ (origin/feature/grounding-tools)

**Phase 4A Status:** ✅ **COMPLETE, TESTED, AND PRODUCTION READY**

**Ready for Next Phase:**
- Phase 4B: Interactive Helpers (4 helpers: Enjoyment Reality Check, Gap Analysis, Priority Re-Check, Emergency Fund Timeline)

---

## 🔔 Session Notes (2025-11-29 - Phase 3B Implementation & Debugging)

**Phase 3B: Interactive Calculator - COMPLETE ✅**

**What Was Implemented:**
- ✅ Interactive sliders for M/E/F/J bucket adjustment (lines 2142-2252)
- ✅ Lock/unlock functionality for individual buckets (toggleLock function)
- ✅ Proportional redistribution logic maintaining 100% sum (adjustBucket function)
- ✅ Reset to Recommended button (resetToRecommended function)
- ✅ Check My Plan validation with 4 financial rules (checkMyPlan function)
- ✅ Save Scenario functionality with server-side persistence (saveScenario method)
- ✅ Color-coded total display (green=100%, red=error)
- ✅ Visual lock indicators (yellow borders/fills)
- ✅ UX improvements: helper text, dollar amounts, 2x2 grid, inline validation
- ✅ Spreadsheet persistence to TOOL4_SCENARIOS tab with all 36 columns

**Bug Fixes & Improvements:**
- ✅ Fixed normalization rounding bug (was causing 101% totals)
  - Root cause: Rounding after checking totals
  - Solution: Round first, then adjust largest unlocked bucket
  - All 7 edge case tests now passing
- ✅ Fixed BASE_URL navigation error in Router.js (used undefined variable)
  - Solution: Changed to server-side ${baseUrl} template variable
- ✅ Fixed saveScenario spreadsheet writing
  - Added SpreadsheetApp.flush() calls after sheet creation and row appends
  - Added comprehensive debug logging for troubleshooting
  - Verified data persistence with read-back verification
- ✅ Changed "budget" terminology to "allocation" throughout
- ✅ Added Essentials validation warning with dollar amounts
- ✅ Moved collapse/expand helper text to far right of headers
- ✅ Added gold-colored percentages and dollar amounts to allocation cards

**Testing Results:**
- ✅ Local edge case tests: 7/7 passing (test-calculator-logic.js)
- ✅ Static code analysis: No forbidden navigation patterns
- ✅ Navigation compliance: All patterns follow GAS-NAVIGATION-RULES.md
- ✅ **Production testing: ALL FEATURES WORKING IN GAS** 🎉
- ✅ **Scenario persistence: Data confirmed writing to TOOL4_SCENARIOS sheet**

**Current Stable State:**
- Commit: `37e5331` - "debug(tool4): Add comprehensive logging to saveScenario"
- Deployed to Apps Script: ✅ (latest deployment)
- Pushed to GitHub: ✅ (origin/feature/grounding-tools)
- Production URL: `https://script.google.com/macros/s/AKfycbxLCd4P9XY20NpAhwg7zucFE_BgwTnhjRqYRTgQ1QY/exec`

**All Features Working:**
1. ✅ Pre-survey (8 behavioral questions) with collapsible helper text
2. ✅ Priority Picker (10 priorities with ⭐/⚪/⚠️ indicators)
3. ✅ V1 Allocation Display (M/E/F/J percentages in 2x2 grid with gold styling)
4. ✅ Interactive Calculator (sliders, locks, redistribution, dollar amounts)
5. ✅ Reset to Recommended
6. ✅ Check My Plan validation (inline display with color coding)
7. ✅ Save Scenario (persisting to TOOL4_SCENARIOS sheet)
8. ✅ Return to Dashboard (GAS-safe navigation)

**Code Statistics:**
- CSS: ~180 lines (interactive calculator styles)
- HTML: ~130 lines (sliders, buttons, controls)
- JavaScript: ~260 lines (state management, redistribution, validation)
- Server-side: ~100 lines (saveScenario + debug logging + getScenarios methods)
- **Total: ~670 lines of production code**

**Known Issues Resolved:**
- ✅ TOOL4_SCENARIOS sheet checkbox auto-fill causing row skipping
  - Solution: Manual cleanup of empty checkbox rows (user responsibility)
  - appendRow() now correctly appends to next available row after last data

**Phase 3B Status:** ✅ **COMPLETE, TESTED, AND PRODUCTION READY**

**Ready for Next Phase:**
- Phase 4: Safety Rails & Helpers (validation engine, gap analysis, priority re-check)
- All Phase 3B components deployed, tested, and working in production

---

## 🎯 Executive Summary

Tool 4 will evolve from a simple priority-selection calculator into a **guided discovery system** that combines:
- **V1's sophisticated modifier engine** (personalized allocation based on behavioral traits)
- **Interactive calculator** (student agency + real-time exploration)
- **Contextual safety rails** (intelligent helpers when students get stuck)
- **Scenario comparison** (Tool 8 pattern for exploring multiple approaches)
- **Implementation bridge** (from "here's your plan" to "do these 3 things today")

**Core Philosophy:** This is not just about numbers. It's about reclaiming internal power and rewriting financial patterns trauma may have left behind.

---

## 📋 Decision Log

### **Critical Decisions Made**

1. **V1 Engine Integration: Option A (Port into Tool 4)**
   - Port V1's `calculateAllocations()` directly into `Tool4.js`
   - Adapt to accept Tool 1/2/3 data + 12 new behavioral questions
   - Keeps all logic in one place for maintainability

2. **Pre-Survey Pattern: Option C (Hybrid)**
   - Ask 5-7 critical questions upfront (satisfaction, discipline, impulse, timeline)
   - Calculator loads with those answers
   - "Want better recommendations? Answer 5 more optional questions" link for refinement

3. **Calculator Loading: Option B (Skip straight to calculator with pre-filled values)**
   - Calculator loads with V1's calculated M/E/F/J already filled in
   - V1's reasoning appears as tooltips/sidebar ("Why these numbers?")
   - Students can immediately start adjusting

4. **Lock Feature: Option A (Lock icon + fixed input)**
   - Lock icon toggles on/off for each bucket
   - Locked input becomes read-only
   - Visual indicator shows locked state

5. **Redistribution Logic: Option A (Proportional to current values)**
   - When bucket locked and another adjusted, remaining buckets redistribute proportionally
   - Preserves relative relationships student has established
   - Example: If F=25% and J=15% (total 40%), and student adds 10% to M, F loses 6.25% and J loses 3.75%

6. **Safety Rails Trigger: Scenario A + Always-available helpers**
   - Student adjusts buckets freely
   - "Check My Plan" button triggers validation
   - All validation types offered (financial rules, behavioral flags, values alignment)

7. **Insights Sidebar: Option C (Progressive disclosure)**
   - Starts simple: "📊 Your Allocation: M25% | E35% | F35% | J15%"
   - Expandable: "[Why these numbers? ▼]"
   - Second level: "Based on 'Build Wealth' priority + 3 adjustments"
   - Third level: "[Show detailed breakdown ▼]" → Full V1 modifier notes

8. **Scenario Management: Option A (Tool 8 pattern - Explicit "Save Scenario")**
   - Student adjusts buckets
   - Clicks "Save as Scenario" → names it "Aggressive Debt Payoff"
   - Resets calculator → adjusts again → saves "Balanced Plan"
   - Compare button shows all scenarios side-by-side

---

## 🔄 Student Journey Flow

### **Phase 1: Data Gathering (Pre-Calculator)**

**What Happens:**
1. Tool 4 pulls completed Tool 1/2/3 data
2. Shows pre-survey: 7 critical behavioral questions
3. Runs V1 calculation engine server-side
4. Shows loading: "Building your personalized plan based on your unique profile..."

**Data Sources:**

#### **From Tool 1** (via middleware)
- `winner` → Informs which modifiers to emphasize
- `scores.FSV` → Maps to avoidance behaviors
- `scores.ExVal` → Maps to approval-seeking patterns
- `scores.Showing` → Maps to over-giving tendencies
- `scores.Control` → Maps to rigidity or chaos
- `scores.Fear` → Maps to anxiety-driven decisions
- `formData.name`, `formData.email` → Pre-fill identity

#### **From Tool 2** (via middleware)
- `formData.dependents` → V1 input: `dependents`
- `formData.age` + `formData.marital` + `formData.employment` → Derive: `stageOfLife`
- `formData.goalConfidence` → V1 input: `literacyLevel`
- `formData.emergencyFundMonths` → V1 input: `emergencyFund`
- `formData.incomeConsistency` → Map to: `incomeStability`
- `formData.currentDebts` → Derive: `debtLoad` (or ask in pre-survey)
- `formData.debtStress` → Derive: `interestLevel` (or ask in pre-survey)

#### **From Tool 3** (via middleware)
- `overallQuotient` → General disconnection severity
- `domain1` (FSV quotient) → Validates Tool 1 FSV score
- `domain2` (ExVal quotient) → Validates Tool 1 ExVal score

#### **Pre-Survey Questions (7 critical + 5 optional)**

**Critical Questions (must answer):**
1. **Satisfaction** (1-10): "How dissatisfied are you with your current financial situation?"
   - *Why critical:* Amplifies ALL positive modifiers (V1's satisfaction boost)
2. **Discipline** (1-10): "How would you rate your financial discipline?"
   - *Maps to:* V1 Multiply bucket modifier
3. **Impulse Control** (1-10): "How strong is your impulse control with spending?"
   - *Maps to:* V1 Enjoyment bucket modifier
4. **Long-term Focus** (1-10): "How focused are you on long-term financial goals?"
   - *Maps to:* V1 Multiply bucket modifier
5. **Goal Timeline** (Dropdown): "When do you want to reach your primary financial goal?"
   - Options: "Within 6 months", "6-12 months", "1-2 years", "3-5 years", "5+ years"
   - *Maps to:* V1 Freedom bucket modifier
6. **Monthly Income Range** (Dropdown): "What is your monthly net income?"
   - Options: "A: < $2,500", "B: $2,500-$5,000", "C: $5,000-$10,000", "D: $10,000-$20,000", "E: > $20,000"
   - *Maps to:* V1 `incomeRange`
7. **Current Essentials** (Dropdown): "What percentage of income goes to essentials?"
   - Options: "A: < 10%", "B: 10-20%", "C: 20-30%", "D: 30-40%", "E: 40-50%", "F: > 50%"
   - *Maps to:* V1 `essentialsRange`

**Optional Questions (for refinement):**
8. **Emotional Spending** (1-10): "How often do you spend money to manage emotions?"
9. **Emotional Safety** (1-10): "How much do you need financial safety to feel secure?"
10. **Financial Avoidance** (1-10): "How often do you avoid looking at your finances?"
11. **Lifestyle Priority** (1-10): "How important is enjoying life now vs. saving?"
12. **Autonomy Preference** (1-10): "Do you prefer following expert advice or making your own choices?"

---

### **Phase 2: Calculator Screen (Main Interface)**

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Financial Freedom Framework Calculator                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Left Panel (60% width):                                    │
│  ┌────────────────────────────────────┐                     │
│  │ 💰 Multiply: 25% ($1,250/mo) [🔒] │                     │
│  │ [=================|            ]   │                     │
│  │                                    │                     │
│  │ 🏠 Essentials: 35% ($1,750/mo)    │                     │
│  │ [========================|     ]   │                     │
│  │                                    │                     │
│  │ 🚀 Freedom: 25% ($1,250/mo)       │                     │
│  │ [=================|            ]   │                     │
│  │                                    │                     │
│  │ 🎉 Enjoyment: 15% ($750/mo)       │                     │
│  │ [===========|                  ]   │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  Right Sidebar (40% width):                                 │
│  ┌────────────────────────────────────┐                     │
│  │ 📊 Why These Numbers?              │                     │
│  │                                    │                     │
│  │ We started with your "Build Wealth"│                     │
│  │ priority, then adjusted for:       │                     │
│  │                                    │                     │
│  │ ✓ High debt load → +15% Freedom   │                     │
│  │ ✓ Unstable income → +5% Essentials│                     │
│  │ ✓ Low discipline → -10% Multiply  │                     │
│  │                                    │                     │
│  │ [Show detailed breakdown ▼]        │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  Bottom Actions:                                            │
│  [Check My Plan] [Save Scenario] [Compare Scenarios]       │
└─────────────────────────────────────────────────────────────┘
```

**Interaction Behaviors:**

1. **Slider Adjustment:**
   - Drag slider or click increment/decrement buttons
   - Real-time updates to both % and $ amounts
   - If NO buckets locked: All 4 buckets adjust to maintain 100%
   - If bucket(s) locked: Only unlocked buckets redistribute

2. **Lock Feature:**
   - Click 🔒 icon to lock/unlock bucket
   - Locked bucket: Input grayed out, slider disabled
   - Multiple buckets can be locked simultaneously
   - Must have at least 1 unlocked bucket

3. **Progressive Disclosure Sidebar:**
   - Collapsed by default: "Why These Numbers? ▼"
   - First expansion: 3-bullet summary of major adjustments
   - Second expansion: Full V1 modifier breakdown per bucket
   - Third expansion: Mathematical trace (base → raw → normalized → final)

---

### **Phase 3: Safety Rails & Contextual Helpers**

**"Check My Plan" Button Triggers:**

#### **Financial Rules Validation**
```javascript
// Red flags from V1
- Essentials > 35% of income → "⚠️ High essentials spending"
- Multiply < 10% → "⚠️ Low investment allocation"
- Enjoyment > 40% → "⚠️ High discretionary spending"
- Emergency fund < 2 months (from Tool 2) → "⚠️ Build emergency fund"
- High debt (Tool 2) + low Freedom → "⚠️ Debt/Freedom mismatch"
```

#### **Behavioral Flags Validation**
```javascript
// Cross-reference with pre-survey
- High satisfaction (8-10) but Enjoyment 45% → "Are you sure?"
- Low discipline (1-3) but Multiply 40% → "This might be too aggressive"
- High emotional spending (8-10) but Enjoyment 10% → "May lead to binge spending"
```

#### **Values Alignment Validation**
```javascript
// Priority vs. allocation mismatch
- Priority: "Get Out of Debt" but Freedom < 30% → "Mismatch detected"
- Priority: "Build Wealth" but Multiply < 20% → "Consider increasing"
- Priority: "Feel Secure" but Essentials < 30% → "May need more safety"
```

**Helper Modules (contextual pop-ups):**

1. **Budget Reality Check**
   - Triggers when: Enjoyment > 40% OR user clicks helper
   - Shows: "$900/mo fun money = $450 dining + $200 hobbies + $150 entertainment + $100 shopping"
   - Action: "Try our category breakdown tool →"

2. **Gap Analysis**
   - Triggers when: Any validation fails OR user requests
   - Shows: Visual comparison of recommended vs. current allocation
   - Action: "See what's different →"

3. **Priority Re-Check**
   - Triggers when: Values mismatch detected
   - Shows: "Your allocation suggests [inferred priority]. Did you mean to select [selected priority]?"
   - Action: "Change priority" or "Keep current"

---

### **Phase 4: Category Breakdown (Safety Rail Helper)**

**When Activated:**
- From "Check My Plan" if Enjoyment > 40%
- From manual "Show Categories" button
- After scenario comparison if gaps detected

**Current Implementation (Week 3 - KEEP THIS):**
- 8 categories: Housing, Food, Transportation, Healthcare, Debt, Savings, Discretionary, Personal
- Income-tier based percentages (low/mid/high income)
- Real-time validation (±$50 or ±2% tolerance)
- Gap analysis visualization
- Auto-distribute button
- Save to TOOL4_SCENARIOS sheet

**Enhancement Needed:**
- Make this OPTIONAL, not automatic
- Trigger based on safety rail detection
- Show as "Would you like to see how this breaks down into categories?"

---

### **Phase 5: Scenario Comparison (Tool 8 Pattern)**

**Workflow:**
1. Student adjusts calculator
2. Clicks "Save as Scenario" button
3. Modal appears: "Name this scenario:"
4. Student enters: "Aggressive Debt Payoff"
5. Scenario saved to TOOL4_SCENARIOS sheet
6. Calculator resets to V1 recommendation
7. Student adjusts again
8. Saves as "Balanced Plan"
9. Clicks "Compare Scenarios" button
10. Side-by-side comparison table appears

**Comparison View:**

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Scenario Comparison                                      │
├───────────────┬──────────────────┬──────────────────────────┤
│               │ Aggressive Debt  │ Balanced Plan            │
├───────────────┼──────────────────┼──────────────────────────┤
│ Multiply      │ 15%              │ 25%  (+10%)              │
│ Essentials    │ 35%              │ 35%  (same)              │
│ Freedom       │ 40%              │ 25%  (-15%)              │
│ Enjoyment     │ 10%              │ 15%  (+5%)               │
├───────────────┼──────────────────┼──────────────────────────┤
│ Debt payoff   │ 24 months        │ 36 months                │
│ Emergency $   │ $5,000 (3mo)     │ $7,500 (4.5mo)           │
├───────────────┼──────────────────┼──────────────────────────┤
│ [ Choose ]    │ [ Choose ]       │                          │
└───────────────┴──────────────────┴──────────────────────────┘
```

**Actions:**
- "Choose This Plan" → Sets as active scenario
- "Edit Scenario" → Loads into calculator
- "Delete Scenario" → Removes from saved list
- "Generate Report" → Creates final implementation plan

---

## 🔧 Technical Architecture

### **V1 Modifier Engine Integration**

**File:** `/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationFunction.js`

**Port this function into `/tools/tool4/Tool4.js`:**

```javascript
/**
 * V1 Allocation Engine (ported from standalone app)
 * Calculates personalized M/E/F/J allocation based on:
 * - Financial reality (income, debt, emergency fund)
 * - Behavioral traits (discipline, impulse, satisfaction)
 * - Motivational drivers (lifestyle, growth, stability)
 * - Life context (dependents, timeline, stage of life)
 */
function calculatePersonalizedAllocation(input) {
  // This is V1's calculateAllocations() function
  // Adapted to work within Tool 4 architecture

  // 1) Base weights by priority (same as current BASE_WEIGHTS)
  const baseMap = {
    'wealth':   { M:40, E:25, F:20, J:15 },
    'debt':     { M:15, E:25, F:45, J:15 },
    'secure':   { M:25, E:35, F:30, J:10 },
    'enjoy':    { M:20, E:20, F:15, J:45 },
    // ... all 10 priorities
  };

  // 2) Apply Financial Modifiers
  // - Income level → Multiply adjustment
  // - Debt load → Freedom boost
  // - Interest level → Freedom boost
  // - Emergency fund → Freedom/Essentials adjustment
  // - Income stability → Essentials/Freedom buffer

  // 3) Apply Satisfaction Amplifier (V1's secret sauce)
  const satFactor = 1 + Math.max(0, input.satisfaction - 5) * 0.1;
  // Amplifies ALL positive modifiers

  // 4) Apply Behavioral Modifiers
  // - Discipline → Multiply
  // - Impulse → Enjoyment
  // - Long-term focus → Multiply
  // - Emotional spending → Enjoyment
  // - Emotional safety → Essentials + Freedom
  // - Financial avoidance → Multiply (negative) + Freedom

  // 5) Apply Motivational Modifiers
  // - Lifestyle priority → Enjoyment
  // - Growth orientation → Multiply
  // - Stability orientation → Freedom
  // - Goal timeline → Freedom (short term) vs Multiply (long term)
  // - Dependents → Essentials
  // - Autonomy preference → Multiply vs Essentials/Freedom

  // 6) Apply Life Stage Modifiers
  // - Pre-retirement → Multiply (reduce), Freedom (increase)
  // - Variable income → Essentials + Freedom buffer
  // - Low financial confidence → Focus basics (Essentials + Freedom)

  // 7) Enforce Safety Rails
  const essentialMinPct = Math.max(
    CONFIG.essentialPctMap[input.essentialsRange],
    CONFIG.minEssentialsAbsolutePct  // 40% floor
  );

  // 8) Normalize to 100%

  // 9) Build modifier notes for each bucket
  const notes = {
    Multiply: {
      financial: "...",
      behavioral: "...",
      motivational: "..."
    },
    // ... for all 4 buckets
  };

  return {
    percentages: { M: 25, E: 35, F: 25, J: 15 },
    notes: notes,
    trace: {
      basePriority: "Build Long-Term Wealth",
      baseWeights: "M40%, E25%, F20%, J15%",
      rawScores: "M25%, E35%, F35%, J15%",
      satBoostPct: 20,  // 20% boost from satisfaction=7
      finalScores: "M25%, E35%, F25%, J15%"
    }
  };
}
```

**Input Mapper Function:**

```javascript
/**
 * Maps Tool 1/2/3 data + pre-survey answers → V1 input format
 */
function buildV1Input(clientId, preSurveyAnswers) {
  // Get Tool 1/2/3 data via DataService
  const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
  const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
  const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

  // Map to V1 input structure
  return {
    // From pre-survey (critical)
    incomeRange: preSurveyAnswers.incomeRange,
    essentialsRange: preSurveyAnswers.essentialsRange,
    satisfaction: preSurveyAnswers.satisfaction,
    discipline: preSurveyAnswers.discipline,
    impulse: preSurveyAnswers.impulse,
    longTerm: preSurveyAnswers.longTerm,
    goalTimeline: preSurveyAnswers.goalTimeline,

    // From pre-survey (optional - use defaults if not provided)
    emotionSpend: preSurveyAnswers.emotionSpend || 5,
    emotionSafety: preSurveyAnswers.emotionSafety || 5,
    avoidance: preSurveyAnswers.avoidance || 5,
    lifestyle: preSurveyAnswers.lifestyle || 5,
    autonomy: preSurveyAnswers.autonomy || 5,
    growth: deriveGrowthFromTool2(tool2Data),
    stability: deriveStabilityFromTool2(tool2Data),

    // From Tool 2
    dependents: tool2Data?.formData?.dependents || 0,
    emergencyFund: mapEmergencyFundMonths(tool2Data?.formData?.emergencyFundMonths),
    incomeStability: mapIncomeStability(tool2Data?.formData?.incomeConsistency),
    stageOfLife: deriveStageOfLife(tool2Data?.formData),
    literacyLevel: tool2Data?.formData?.goalConfidence || 0,

    // From Tool 2 or pre-survey
    debtLoad: deriveDebtLoad(tool2Data?.formData?.currentDebts, tool2Data?.formData?.debtStress),
    interestLevel: deriveInterestLevel(tool2Data?.formData?.debtStress),

    // From Tool 4
    priority: preSurveyAnswers.selectedPriority  // User's priority selection
  };
}
```

---

### **Calculator UI Components**

**Bucket Slider Component:**

```javascript
function renderBucketSlider(bucket, percentage, dollars, isLocked) {
  return `
    <div class="bucket-slider ${isLocked ? 'locked' : ''}">
      <div class="bucket-header">
        <span class="bucket-icon">${bucket.icon}</span>
        <span class="bucket-name">${bucket.name}</span>
        <span class="bucket-amount">${percentage}% ($${dollars.toLocaleString()}/mo)</span>
        <button class="lock-btn" onclick="toggleLock('${bucket.id}')">
          ${isLocked ? '🔒' : '🔓'}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value="${percentage}"
        class="slider ${isLocked ? 'disabled' : ''}"
        ${isLocked ? 'disabled' : ''}
        oninput="adjustBucket('${bucket.id}', this.value)"
      />
    </div>
  `;
}
```

**Redistribution Logic:**

```javascript
function adjustBucket(bucketId, newPercentage) {
  const lockedBuckets = getLockedBuckets();
  const unlockedBuckets = getAllBuckets().filter(b =>
    !lockedBuckets.includes(b.id) && b.id !== bucketId
  );

  // Calculate how much needs to be redistributed
  const oldTotal = getAllBuckets().reduce((sum, b) => sum + b.percentage, 0);
  const oldValue = getBucket(bucketId).percentage;
  const delta = newPercentage - oldValue;

  // Calculate total of unlocked buckets (excluding the one being adjusted)
  const unlockedTotal = unlockedBuckets.reduce((sum, b) => sum + b.percentage, 0);

  // Proportional redistribution
  unlockedBuckets.forEach(bucket => {
    const proportion = bucket.percentage / unlockedTotal;
    const adjustment = delta * proportion;
    bucket.percentage -= adjustment;

    // Ensure no negative values
    bucket.percentage = Math.max(0, bucket.percentage);
  });

  // Update the adjusted bucket
  getBucket(bucketId).percentage = newPercentage;

  // Re-render UI
  renderAllSliders();
}
```

---

### **Insights Sidebar Component**

```javascript
function renderInsightsSidebar(v1Result, isExpanded) {
  if (!isExpanded) {
    return `
      <div class="insights-sidebar collapsed">
        <h3>📊 Why These Numbers?</h3>
        <button onclick="toggleInsights()">Show Details ▼</button>
      </div>
    `;
  }

  // First expansion level: Simple summary
  if (isExpanded === 'simple') {
    return `
      <div class="insights-sidebar">
        <h3>📊 Why These Numbers?</h3>
        <p>We started with your "${v1Result.trace.basePriority}" priority, then adjusted for:</p>
        <ul>
          ${v1Result.topModifiers.map(mod => `<li>${mod.icon} ${mod.description}</li>`).join('')}
        </ul>
        <button onclick="toggleInsights('detailed')">Show Detailed Breakdown ▼</button>
      </div>
    `;
  }

  // Second expansion: Full breakdown
  return `
    <div class="insights-sidebar detailed">
      <h3>📊 Complete Breakdown</h3>
      ${renderBucketDetails(v1Result.notes.Multiply, 'Multiply')}
      ${renderBucketDetails(v1Result.notes.Essentials, 'Essentials')}
      ${renderBucketDetails(v1Result.notes.Freedom, 'Freedom')}
      ${renderBucketDetails(v1Result.notes.Enjoyment, 'Enjoyment')}
      <details>
        <summary>Mathematical Trace</summary>
        <pre>${JSON.stringify(v1Result.trace, null, 2)}</pre>
      </details>
      <button onclick="toggleInsights('simple')">Collapse ▲</button>
    </div>
  `;
}
```

---

## 📊 Data Schema Extensions

### **TOOL4_SCENARIOS Sheet (Enhanced)**

Add columns for V1 engine outputs:

```
Existing columns (A-AJ): 35 columns
New columns (AK-AZ): 15 columns

AK: V1_BasePriority (string)
AL: V1_BaseWeights (string)
AM: V1_RawScores (string)
AN: V1_SatBoostPct (number)
AO: V1_Multiply_Financial_Mods (string)
AP: V1_Multiply_Behavioral_Mods (string)
AQ: V1_Multiply_Motivational_Mods (string)
AR: V1_Essentials_Financial_Mods (string)
AS: V1_Essentials_Behavioral_Mods (string)
AT: V1_Essentials_Motivational_Mods (string)
AU: V1_Freedom_Financial_Mods (string)
AV: V1_Freedom_Behavioral_Mods (string)
AW: V1_Freedom_Motivational_Mods (string)
AX: V1_Enjoyment_Financial_Mods (string)
AY: V1_Enjoyment_Behavioral_Mods (string)
AZ: V1_Enjoyment_Motivational_Mods (string)
BA: PreSurvey_Satisfaction (number 1-10)
BB: PreSurvey_Discipline (number 1-10)
BC: PreSurvey_Impulse (number 1-10)
BD: PreSurvey_LongTerm (number 1-10)
BE: PreSurvey_GoalTimeline (string)
BF: PreSurvey_IncomeRange (string)
BG: PreSurvey_EssentialsRange (string)
```

---

## 🚀 Implementation Roadmap

### **Phase 1: V1 Engine Port (Week 4)** ✅ COMPLETED

**Tasks:**
1. ✅ Copy `AllocationFunction.js` from V1 app
2. ✅ Adapt `calculateAllocations()` → `calculateAllocationV1()` (Tool4.js:1521-1741)
3. ✅ Create test function `testAllocationEngine()` (tests/Tool4Tests.js:1211-1288)
4. ✅ Build `buildV1Input()` mapper function (Tool4.js:1751-1811)
5. ✅ Build helper functions (Tool4.js:1813-1937):
   - `deriveGrowthFromTool2()` - Maps investment/savings/retirement to 0-10 scale (lines 1817-1830)
   - `deriveStabilityFromTool2()` - Maps emergency fund/insurance/debt to 0-10 scale (lines 1836-1848)
   - `deriveStageOfLife()` - Categorizes by age and employment status (lines 1853-1865)
   - `mapEmergencyFundMonths()` - Converts Tool 2 scale to V1 tiers (A-E) (lines 1871-1881)
   - `mapIncomeStability()` - Converts Tool 2 consistency to categorical (lines 1886-1893)
   - `deriveDebtLoad()` - Analyzes debt text + stress to determine tier (A-E) (lines 1899-1924)
   - `deriveInterestLevel()` - Maps debt stress to interest level (High/Medium/Low) (lines 1929-1937)
6. ✅ Test with sample Tool 1/2/3 data
7. ✅ Validate outputs match V1 expectations
8. ✅ All functions added to production code and deployed

**Success Criteria:**
- ✅ V1 engine runs server-side in Tool 4
- ✅ Given same inputs, produces same M/E/F/J percentages as V1
- ✅ Modifier notes correctly categorized (Financial/Behavioral/Motivational)
- ✅ Integration with Tools 1/2/3 data working
- ✅ All helper functions tested
- ✅ All functions exist as Tool4 methods (not just test files)

**Current Implementation Status:**
- **Core Engine:** `/tools/tool4/Tool4.js` (lines 1521-1741)
  - `calculateAllocationV1(input)` - V1 allocation engine with 3-tier modifiers
- **Integration Layer:** `/tools/tool4/Tool4.js` (lines 1751-1937)
  - `buildV1Input(clientId, preSurveyAnswers)` - Maps Tool 1/2/3 + pre-survey to V1 format
  - 7 helper functions for Tool 2 data derivation (all implemented)
- **Test Suite:** `/tests/Tool4Tests.js` (lines 1211-1504)
  - `testAllocationEngine()` - V1 engine unit tests
  - `testV1InputMapper()` - Input mapping tests
  - `testHelperFunctions()` - Helper function validation tests
  - `testEndToEndIntegration()` - Complete flow test
- **Test Results:** ✅ All test cases passing (100% sum, satisfaction amplification working)
- **Deployed:** ✅ Version pushed to Apps Script (2025-11-29 - COMPLETE with all functions)

**Test Case 1 Results (Build Long-Term Wealth):**
- Percentages: M:41%, E:40%, F:8%, J:11%
- Satisfaction Boost: 20%
- Modifiers: High discipline, strong long-term focus, high growth orientation

**Test Case 2 Results (Get Out of Debt):**
- Percentages: M:8%, E:40%, F:52%, J:0%
- Satisfaction Boost: 0% (low satisfaction)
- Modifiers: Severe debt load, high-interest debt, unstable income

**Integration Layer Features:**
- Safe defaults when Tool 2 data missing
- Tool 2 scale conversions (-5 to +5) → V1 formats (A-E tiers, 0-10 scales)
- Text analysis for debt load detection
- Age-based life stage categorization
- Composite scores from multiple Tool 2 fields

---

### **Phase 2: Pre-Survey UI (Week 4)** ✅ COMPLETED 2025-11-29

**Tasks:**
1. ✅ Design comprehensive pre-survey page (10 required questions)
2. ✅ Build form validation (client-side) with error highlighting
3. ✅ Save pre-survey responses to PropertiesService
4. ✅ Call `calculateAllocationV1()` on submission via buildV1Input
5. ✅ Implement `document.write()` pattern for seamless page updates
6. ✅ Add loading overlay with spinner animation
7. ✅ Modified render flow to check pre-survey completion
8. ✅ Changed all "Budget" references to "Allocation"

**Success Criteria:**
- ✅ All 10 questions required (moved optional to required per user feedback)
- ✅ Priority question moved to #1 (most important first)
- ✅ Dollar inputs instead of range dropdowns (income & essentials)
- ✅ All 11 slider labels (0-10) with detailed trauma-informed descriptions
- ✅ Inline priority descriptions for all 10 options
- ✅ Comprehensive intro section explaining the tool
- ✅ Tool 2 check with banner (safe defaults if incomplete)
- ✅ Validation prevents submission with missing fields
- ✅ Calculator loads with V1-calculated percentages
- ✅ No white screens (uses document.write pattern)
- ✅ Loading animation provides user feedback

**Implementation Details:**

**Pre-Survey Page Structure (buildUnifiedPage):**
- **Comprehensive Intro:**
  - Title: "Welcome to Your Financial Freedom Framework"
  - Explains purpose: personalized allocation across M/E/F/J
  - How it works: 10 questions → customized plan
  - Time estimate: 3-5 minutes

- **10 Required Questions (Reordered):**
  1. **Top Financial Priority** (dropdown) - MOVED TO FIRST
     - 10 options with inline descriptions
     - "Build Long-Term Wealth - Focus on investments, retirement..."
  2. **Goal Timeline** (dropdown: 6mo, 6-12mo, 1-2yr, 2-5yr, 5+yr)
  3. **Monthly Income** (dollar input) - NEW: replaced range dropdown
  4. **Monthly Essentials** (dollar input) - NEW: replaced % dropdown
  5. **Satisfaction** (0-10 slider) - 11 detailed labels
  6. **Discipline** (0-10 slider) - 11 detailed labels
  7. **Impulse Control** (0-10 slider) - 11 detailed labels
  8. **Long-term Focus** (0-10 slider) - 11 detailed labels
  9. **Lifestyle Priority** (0-10 slider) - 11 detailed labels
  10. **Autonomy Preference** (0-10 slider) - 11 detailed labels

- **Tool 2 Banner:** Conditional banner if Tool 2 incomplete
  - "Want Better Recommendations?"
  - Link to Tool 2
  - Safe defaults used if skipped (Option B)

- **Loading Overlay:**
  - Full-screen dark overlay
  - Spinning purple loader
  - Text: "Calculating Your Personalized Allocation..."
  - Subtext: "Analyzing your financial profile"

**Features Implemented:**
- ✅ Interactive sliders with real-time label updates
- ✅ Dynamic dollar-to-tier mapping (auto-calculates A-F tiers)
- ✅ Mobile-responsive design (max-width: 800px)
- ✅ Trauma-informed language throughout
- ✅ Inline help text for each question
- ✅ Progress indicator tracks completion
- ✅ Collapsible pre-survey section (on second visit)
- ✅ Button states (disabled during submission)
- ✅ Error recovery with user-friendly messages

**Data Flow (Fixed Navigation):**
```
User opens Tool 4 → render()
  ↓
Check getPreSurvey(clientId)
  ↓
IF NULL → buildUnifiedPage() (shows pre-survey)
  ↓
User fills 10 required questions
  ↓
Submit → Show loading overlay
  ↓
google.script.run.savePreSurvey(clientId, formData)
  ↓
Server: Save to PropertiesService
        Calculate V1 allocation
        Return { success: true, nextPageHtml: updatedHtml }
  ↓
Client: document.write(nextPageHtml)
  ↓
Calculator appears with V1 allocations displayed
```

**Navigation Fix:**
- ✅ Uses `document.write()` pattern (like FormUtils)
- ✅ No URL navigation = no white screens
- ✅ Page updates in place seamlessly
- ✅ All other tools remain unaffected

**V1 Allocation Engine Improvements:**
- ✅ **Removed Forced Essentials Floor** (Lines 3333-3347)
  - Old approach forced 40-55% minimum, causing negative percentages
  - New approach respects V1 calculation and user's actual data
- ✅ **Added Smart Validation** (Lines 3338-3347)
  - Compares recommended vs actual essentials (from income/expenses)
  - 5% tolerance before triggering warning
  - Returns validation warnings array
- ✅ **Added Validation UI** (Lines 1606-1620)
  - Red warning banner when recommended < actual
  - Two clear options: reduce expenses OR adjust allocation
  - Trauma-informed messaging
- ✅ **Triple-Layer Safety Net**
  - Layer 1: Edge case handling in redistribution logic
  - Layer 2: Negative percentage check (sets to 0%)
  - Layer 3: Ensure sum = 100% (adjusts largest bucket)
- ✅ **Fixed IIFE Issues**
  - Added IIFE wrapper to GroundingReport.js (fixes Tool 2/3/5 white screens)
  - All tools now use proper variable scoping for document.write()

**Bugs Fixed:**
- ✅ **Negative Percentages**: Fixed -3% Enjoyment issue with comprehensive safety checks
- ✅ **White Screens**: Fixed all navigation issues using document.write() pattern
- ✅ **Variable Redeclaration**: Fixed with IIFE wrappers in all reports
- ✅ **Rounding Errors**: Ensure all allocations sum to exactly 100%

**Current Status:**
- **Pre-Survey UI:** ✅ 100% Complete - Production ready
- **V1 Integration:** ✅ Complete - Allocations calculating correctly with smart validation
- **Navigation:** ✅ Fixed - No white screens across all tools
- **UX Polish:** ✅ Complete - Loading animation, button states, validation warnings
- **V1 Engine:** ✅ Hardened - No forced floors, smart validation, comprehensive safety checks
- **Calculator Integration:** ⏳ Next - Display allocations in calculator UI

---

### **Phase 3: Smart Priority Picker + Interactive Calculator (Week 5)** 🔄 IN PROGRESS

**UPDATED DESIGN DECISION (2025-11-29):**
After user feedback, we've redesigned the flow to include an **intelligent priority recommendation system** that guides users to the most appropriate priorities based on their pre-survey data.

**New UX Flow:**
1. Pre-survey (8 behavioral questions) → "Calculate My Available Priorities"
2. **Priority Picker** (NEW) → Shows all 10 priorities with smart indicators
3. User selects priority + timeline → "Calculate My Allocation"
4. Calculator displays M/E/F/J allocations with priority/timeline editable at top

**Goals:**
- Guide users to appropriate priorities before calculation (not after)
- Show WHY certain priorities are recommended vs challenging
- Preserve agency (show all priorities with warnings, don't hide)
- Allow priority/timeline changes without re-doing pre-survey
- Enable interactive allocation adjustment and scenario comparison

**Phase 3A: Smart Priority Picker** ✅ **100% COMPLETE** (Logic + UI + Integration)

**Tasks:**
1. ✅ Design priority recommendation logic - PRIORITY-RECOMMENDATION-LOGIC.md
2. ✅ Implement 10 priority scoring functions (Tool4.js:4044-4359)
   - scoreWealthPriority, scoreDebtPriority, scoreSecurityPriority
   - scoreEnjoymentPriority, scoreBigGoalPriority, scoreSurvivalPriority
   - scoreBusinessPriority, scoreGenerationalPriority, scoreBalancePriority
   - scoreControlPriority
3. ✅ Implement income/essentials tier mapping with cash flow analysis
4. ✅ Implement recommendation calculator (calculatePriorityRecommendations - Tool4.js:4450-4541)
5. ✅ Implement personalized reason generator with cash flow context (Tool4.js:4424-4519)
6. ✅ Test with sample data - All tests passing
7. ✅ Build priority picker UI component (buildPriorityPickerHtml - Tool4.js:4654-4725)
8. ✅ Integrate into unified page flow (Tool4.js:1806-1819)
9. ✅ Priority/timeline moved to picker (no longer in initial pre-survey)
10. ✅ Priority selection with timeline in collapsible picker interface

**Phase 3B: Interactive Calculator** ✅ **100% COMPLETE** (Production Tested)

**Tasks:**
1. ✅ Build unified page (pre-survey + calculator single view) - Tool4.js:841-1740
2. ✅ Display V1 allocation cards (4 buckets) - Lines 1583-1604
3. ✅ Add "Why These Numbers?" insights - Lines 1622-1630
4. ✅ Add validation warnings for Essentials mismatch - Lines 1606-1620
5. ✅ Build interactive sliders for bucket adjustment - Lines 2142-2252
6. ✅ Add lock/unlock functionality per bucket - toggleLock() Lines 2379-2404
7. ✅ Implement proportional redistribution logic (maintains 100% sum) - adjustBucket() Lines 2407-2446
8. ✅ Add "Reset to Recommended" button - resetToRecommended() Lines 2518-2533
9. ✅ Add "Check My Plan" validation button with helpers - checkMyPlan() Lines 2536-2572
10. ✅ Add "Save Scenario" functionality - saveScenario() Lines 2575-2613 (client) + Lines 206-251 (server)
11. ⏳ Add scenario comparison view - Future enhancement (Phase 5)

**Success Criteria:**
- ✅ Pre-survey collapses after first calculation
- ✅ Pre-survey summary bar shows key values when collapsed
- ✅ Click header to expand/collapse pre-survey
- ✅ V1 allocations display correctly (Multiply, Essentials, Freedom, Enjoyment)
- ✅ Insights explain reasoning for each bucket
- ✅ Recalculate updates allocations after pre-survey changes
- ✅ Sliders adjust smoothly with real-time feedback
- ✅ Lock feature prevents bucket from changing
- ✅ Redistribution maintains 100% total (with normalization fix)
- ✅ All buttons functional (tested in production GAS)
- ✅ No white screens on any interaction
- ✅ Color-coded total display (green=100%, red=error)
- ✅ Visual lock indicators (yellow theme)

**Production Testing Results:**
- ✅ Sliders: Smooth dragging, real-time updates working
- ✅ Lock buttons: Toggle working, visual feedback correct
- ✅ Redistribution: Proportional adjustments working correctly
- ✅ Reset button: Restores recommended values, unlocks all buckets
- ✅ Check My Plan: Validation alerts displaying correctly
- ✅ Save Scenario: Prompts for name, saves successfully
- ✅ Navigation: Return to Dashboard working (no white screens)

**Implementation Details:**

**Unified Page Structure (Lines 813-1433):**
- **Single-page layout** with collapsible pre-survey + static allocation display
- **Pre-Survey Section:**
  - Header with toggle button (📊 icon + title)
  - Summary bar (shows Priority, Income, Essentials, Timeline when collapsed)
  - Collapsible form body (8 required + 2 optional questions)
  - Submit button changes text: "Calculate" → "Recalculate"
- **Calculator Section:**
  - 4 allocation bucket cards (displays V1 recommended percentages)
  - "Why These Numbers?" insights box
  - ✅ Interactive sliders with visual progress bars
  - ✅ Lock/unlock toggles with yellow visual indicators
  - ✅ Real-time redistribution maintaining 100% total
  - ✅ Reset, Check My Plan, and Save Scenario buttons

**Current UX Flow:**
```
First Visit:
  Pre-survey EXPANDED → Fill form → Click "Calculate My Available Priorities"
  ↓
  Priority Picker appears → Select priority + timeline → Click "Calculate My Allocation"
  ↓
  Calculator loads with V1 allocations → Sliders pre-filled
  ↓
  User can:
    - Drag sliders to adjust allocation (auto-redistributes)
    - Lock buckets to prevent changes
    - Reset to recommended values
    - Check plan for validation warnings
    - Save custom allocation as scenario
    - Return to dashboard
```

**Implementation Complete:**
All Phase 3B features implemented and tested in production:
1. ✅ Interactive sliders below allocation cards
2. ✅ Pre-filled sliders with V1 percentages
3. ✅ Real-time adjustment with sum validation (always = 100%)
4. ✅ Lock icons to freeze individual buckets
5. ✅ Proportional redistribution when adjusting with locks
6. ✅ "Reset to Recommended" restores V1 values
7. ✅ "Check My Plan" validation with 4 financial rules
8. ✅ "Save Scenario" with server-side persistence

**Priority Recommendation System Details:**

**Scoring Algorithm:**
- Each priority receives a score from -100 to +100
- ⭐ **Recommended** (50+): Based on user's discipline, debt, income stability, etc.
- ⚪ **Available** (-49 to +49): Neutral option, no strong indicators either way
- ⚠️ **Challenging** (-50 or below): May be difficult given current constraints

**Data Sources:**
- Pre-survey: income, essentials, satisfaction, discipline, impulse, long-term focus, lifestyle, autonomy
- Tool 2 (optional): debt load, interest level, emergency fund, income stability, dependents, growth, stability
- Safe defaults used when Tool 2 data unavailable

**Example Recommendations:**
- High debt (E tier) + unstable income → ⭐ "Get Out of Debt" (score: +135)
- High discipline (8/10) + low debt (A tier) → ⭐ "Build Long-Term Wealth" (score: +140)
- Low discipline (3/10) + high debt (E tier) → ⚠️ "Build Long-Term Wealth" (score: -135)

**Implementation Files:**
- Logic: Tool4.js lines 3651-4067 (13 methods, 416 lines)
- Documentation: docs/Tool4/PRIORITY-RECOMMENDATION-LOGIC.md
- Tests: test-priority-recommendations.js (all passing ✅)

**Current Status:**
- **Priority Recommendation Logic:** ✅ Complete - All 10 priorities scored with cash flow + behavioral analysis
- **Priority Picker UI:** ✅ Complete - Collapsible section with ⭐/⚪/⚠️ indicators, selection, timeline
- **Static Allocation Display:** ✅ Complete - Shows V1 allocations with insights and validation warnings
- **Interactive Adjustment:** ✅ Complete - Sliders, locks, proportional redistribution all working
- **Validation:** ✅ Complete - "Check My Plan" with 4 financial rules implemented
- **Scenarios:** ✅ Saving Complete - Save functionality working, comparison view future enhancement

**Updated UX Flow (Single Page with 3 Collapsible Sections):**
```
┌────────────────────────────────────────────────────────────┐
│ 1. PRE-SURVEY SECTION (Initially Expanded)                │
│    8 behavioral questions                                  │
│    Button: "Calculate My Available Priorities"            │
│    → Collapses to summary bar after submission            │
├────────────────────────────────────────────────────────────┤
│ 2. PRIORITY PICKER SECTION (Expands after pre-survey)     │
│    ⭐ Recommended Priorities (green)                       │
│       - "Your debt level suggests this should be your..."  │
│    ⚪ Available Priorities (neutral)                       │
│    ⚠️ Challenging Priorities (yellow/orange)              │
│       - "Consider addressing stability first..."           │
│    Timeline selector                                       │
│    Button: "Calculate My Allocation"                      │
│    → Stays visible but compacts after selection           │
├────────────────────────────────────────────────────────────┤
│ 3. CALCULATOR SECTION (Expands after priority selection)  │
│    Selected priority/timeline at top (editable)           │
│    M/E/F/J allocation cards                               │
│    "Why These Numbers?" insights                          │
│    [Future: Interactive sliders, locks, scenarios]        │
└────────────────────────────────────────────────────────────┘
```

**Key Design Choices:**
1. **Single-page architecture** - All sections on one page, no navigation
2. **Progressive disclosure** - Sections expand as user completes previous step
3. **Collapsible sections** - Pre-survey collapses to summary, priority picker compacts
4. **Priority first, timeline second** - Most important decision gets most guidance
5. **Show all priorities** - Don't hide challenging ones, just warn (preserves agency)
6. **Medium explanations** - One-line reasons (not full detail, not just icons)
7. **Recalculation without re-survey** - Can change priority/timeline without re-doing behavioral questions

---

### **Phase 4: Safety Rails & Helpers (Week 5)** 🚀 **READY TO START**

**Overview:**
Phase 4 enhances the basic validation system with behavioral analysis, values alignment checking, and interactive helpers that guide users when issues are detected.

**Pre-Implementation Changes:**
- ✅ Add 2 new pre-survey questions (total: 12 questions)
  - Question 9: "Total Debt (excluding mortgage)" - Dollar input
  - Question 10: "Emergency Fund Amount" - Dollar input
  - These provide critical data for validation and future tools

---

#### **Phase 4A: Enhanced Validation Engine** ⏳ **NEXT**

**Goal:** Expand validation beyond basic financial rules to include behavioral patterns and values alignment

**Current State:**
- ✅ Basic financial validation (5 rules in `checkMyPlan()`)
- ✅ Essentials vs actual spending comparison
- ✅ Inline results display with warnings/suggestions

**What to Add:**

**1. Behavioral Validation System**
```javascript
// Cross-reference allocations with pre-survey behavioral data
function validateBehavioralAlignment(allocations, preSurveyData) {
  var warnings = [];

  // Low discipline + high Multiply = risky
  if (preSurveyData.discipline <= 3 && allocations.Multiply >= 30) {
    warnings.push({
      severity: 'warning',
      message: 'Your Multiply allocation (${Multiply}%) is ambitious given your discipline level. Consider starting lower and increasing as habits strengthen.',
      bucket: 'Multiply'
    });
  }

  // Low impulse control + high Enjoyment = danger
  if (preSurveyData.impulse <= 3 && allocations.Enjoyment >= 30) {
    warnings.push({
      severity: 'warning',
      message: 'With lower impulse control, a ${Enjoyment}% Enjoyment allocation may lead to overspending. Consider starting with a smaller amount.',
      bucket: 'Enjoyment'
    });
  }

  // High satisfaction but low Enjoyment = burnout risk
  if (preSurveyData.satisfaction >= 8 && allocations.Enjoyment <= 10) {
    warnings.push({
      severity: 'suggestion',
      message: 'You report high financial stress. Consider allocating more to Enjoyment (currently ${Enjoyment}%) to avoid burnout.',
      bucket: 'Enjoyment'
    });
  }

  // Low long-term focus + high Multiply = mismatch
  if (preSurveyData.longTerm <= 3 && allocations.Multiply >= 25) {
    warnings.push({
      severity: 'warning',
      message: 'Your long-term focus score suggests wealth-building may feel challenging. Start small or work on building this skill first.',
      bucket: 'Multiply'
    });
  }

  return warnings;
}
```

**2. Values Alignment Validation**
```javascript
// Detect mismatches between selected priority and actual allocation
function validateValuesAlignment(allocations, priority, preSurveyData) {
  var warnings = [];
  var expectedRanges = {
    'wealth': { Multiply: [25, 100], Freedom: [0, 30] },
    'debt': { Freedom: [30, 100], Multiply: [0, 20] },
    'secure': { Essentials: [30, 50], Freedom: [20, 40] },
    'enjoy': { Enjoyment: [30, 100] },
    'biggoal': { Freedom: [25, 100] },
    'survival': { Essentials: [40, 100], Freedom: [15, 40] },
    'business': { Multiply: [20, 50], Freedom: [15, 30] },
    'generational': { Multiply: [35, 100], Essentials: [20, 35] },
    'balance': { /* all buckets 15-35% */ },
    'control': { Freedom: [25, 100] }
  };

  var expected = expectedRanges[priority];
  if (!expected) return warnings;

  // Check each bucket against expected range
  Object.keys(expected).forEach(function(bucket) {
    var [min, max] = expected[bucket];
    var actual = allocations[bucket];

    if (actual < min) {
      warnings.push({
        severity: 'suggestion',
        message: 'Your "${priority}" priority typically allocates ${min}%+ to ${bucket}, but you\'re at ${actual}%. Consider adjusting or re-evaluating your priority.',
        bucket: bucket,
        action: 'priority-recheck'
      });
    }
  });

  return warnings;
}
```

**3. Financial Reality Checks (Enhanced)**
```javascript
// Add debt and emergency fund validation using new pre-survey questions
function validateFinancialReality(allocations, preSurveyData) {
  var warnings = [];

  // Calculate key metrics
  var monthlyIncome = preSurveyData.monthlyIncome || 0;
  var totalDebt = preSurveyData.totalDebt || 0;
  var emergencyFund = preSurveyData.emergencyFund || 0;
  var monthlyEssentials = preSurveyData.monthlyEssentials || 0;

  // Emergency fund coverage
  var monthsOfCoverage = monthlyEssentials > 0 ? emergencyFund / monthlyEssentials : 0;

  // Critical: No emergency fund + low Freedom allocation
  if (monthsOfCoverage < 1 && allocations.Freedom < 20) {
    warnings.push({
      severity: 'critical',
      message: 'You have less than 1 month emergency coverage ($${emergencyFund}). Your Freedom allocation (${Freedom}%) may be too low to build a safety net quickly.',
      bucket: 'Freedom',
      action: 'emergency-fund-helper'
    });
  }

  // Warning: High debt + low Freedom allocation
  if (totalDebt > monthlyIncome * 3 && allocations.Freedom < 25) {
    warnings.push({
      severity: 'warning',
      message: 'With $${totalDebt} in debt, consider allocating more to Freedom (currently ${Freedom}%) for debt paydown.',
      bucket: 'Freedom',
      action: 'debt-helper'
    });
  }

  // Suggestion: Good emergency fund but still high Freedom
  if (monthsOfCoverage >= 6 && totalDebt < monthlyIncome && allocations.Freedom > 40) {
    warnings.push({
      severity: 'suggestion',
      message: 'Your emergency fund is solid (${monthsOfCoverage.toFixed(1)} months). You might redirect some Freedom allocation to Multiply for growth.',
      bucket: 'Freedom'
    });
  }

  return warnings;
}
```

**4. Consolidated Validation Function**
```javascript
function checkMyPlanEnhanced() {
  var allWarnings = {
    critical: [],
    warning: [],
    suggestion: []
  };

  // Run all validation types
  var financialWarnings = validateFinancialReality(calculatorState.buckets, preSurveyData);
  var behavioralWarnings = validateBehavioralAlignment(calculatorState.buckets, preSurveyData);
  var valuesWarnings = validateValuesAlignment(calculatorState.buckets, calculatorState.priority, preSurveyData);

  // Categorize by severity
  [].concat(financialWarnings, behavioralWarnings, valuesWarnings).forEach(function(warning) {
    allWarnings[warning.severity].push(warning);
  });

  // Display with severity levels
  displayValidationResults(allWarnings);
}
```

**Success Criteria:**
- ✅ All 3 validation types working (Financial, Behavioral, Values)
- ✅ Warnings categorized by severity (Critical, Warning, Suggestion)
- ✅ Each warning includes bucket reference and optional action
- ✅ Trauma-informed language (no shaming)
- ✅ New pre-survey questions integrated

---

#### **Phase 4B: Interactive Helpers** ⏳ **AFTER 4A**

**Goal:** Build lightweight inline helpers that appear when validation triggers specific issues

**Helpers to Build:**

**1. Enjoyment Reality Check Helper**
```
Triggers: When Enjoyment > 35%
Shows: Simple breakdown prompt
  "Your $X/month Enjoyment allocation breaks down to about:"
  - $X/week for dining/entertainment
  - $X/week for hobbies/shopping
  - Does this feel realistic for your lifestyle?
Action: "Adjust Enjoyment" or "Keep It"
```

**2. Gap Analysis Helper**
```
Triggers: When current allocation differs from recommended by >20% in any bucket
Shows: Side-by-side comparison
  Recommended → Current → Difference
  M: 25% → 15% → -10%
  E: 35% → 40% → +5%
  F: 25% → 35% → +10%
  J: 15% → 10% → -5%
Action: "Reset to Recommended" or "Keep My Changes"
```

**3. Priority Re-Check Helper**
```
Triggers: When values alignment detects major mismatch
Shows: Inferred vs selected priority
  "Your allocation (M:15% F:45%) suggests 'Get Out of Debt'"
  "But you selected 'Build Wealth'"
  "Would you like to:"
  - Change priority to "Get Out of Debt"
  - Adjust allocation to match "Build Wealth"
  - Keep current setup (I have my reasons)
```

**4. Emergency Fund Timeline Helper**
```
Triggers: When emergency fund < 3 months AND Freedom < 20%
Shows: Timeline calculator
  "Current: $${emergencyFund} (${monthsOfCoverage} months)"
  "Recommended: $${monthlyEssentials * 4} (4 months)"
  "Gap: $${gap}"

  "At ${Freedom}% Freedom allocation:"
  "Timeline: ${timelineMonths} months to reach 4-month fund"

  "If you increased to 25% Freedom:"
  "Timeline: ${fasterTimeline} months (${savings} months faster!)"
Action: "Adjust Freedom" or "Keep Current Plan"
```

**Implementation Approach:**
- Helpers appear as expandable sections within validation results
- Each helper has "Learn More" button (not auto-expanded)
- Helpers provide calculations and context, not just warnings
- Users can dismiss helpers or take suggested actions

**Success Criteria:**
- ✅ 4 core helpers implemented
- ✅ Helpers trigger at appropriate thresholds
- ✅ Each helper provides actionable insights
- ✅ "Learn More" pattern (not forced)
- ✅ One-click actions where applicable

---

#### **Phase 4C: Validation UX Refinement** ⏳ **POLISH PHASE**

**Goal:** Make validation results more scannable and actionable

**Enhancements:**

**1. Severity-Based Visual Design**
```
🔴 CRITICAL (Red accent)
  - Mathematical impossibility or crisis situation
  - Example: Essentials allocation < actual spending
  - Example: No emergency fund + very low Freedom

🟡 WARNING (Yellow/Orange accent)
  - Likely to cause problems
  - Example: Low discipline + aggressive Multiply
  - Example: High debt + low Freedom

🔵 SUGGESTION (Blue accent)
  - Optimization opportunities
  - Example: Good emergency fund, could shift to growth

✅ LOOKS GOOD (Green accent)
  - All validations passed
```

**2. Bucket-Level Indicators**
```
Add small status icon to each allocation card:
  Multiply: ✅ (no issues)
  Essentials: 🔴 (critical issue)
  Freedom: 🟡 (warning)
  Enjoyment: 🔵 (suggestion available)
```

**3. Progressive Disclosure**
```
Collapsed: "🔴 1 Critical | 🟡 2 Warnings | 🔵 1 Suggestion - Click to Review"
Expanded: Full list with helper buttons
Deep Dive: Click warning → opens relevant helper
```

**Success Criteria:**
- ✅ Color-coded severity system
- ✅ Bucket-level status indicators
- ✅ Scannable summary view
- ✅ Progressive disclosure working

---

**Phase 4 Overall Success Criteria:**

**Validation Quality:**
- ✅ 12 pre-survey questions (2 new: debt, emergency fund)
- ✅ 15+ validation rules across 3 categories (Financial, Behavioral, Values)
- ✅ No false positives (smart tolerance thresholds)
- ✅ Trauma-informed language throughout

**UX Quality:**
- ✅ Severity-based visual hierarchy
- ✅ Actionable helpers (not just warnings)
- ✅ Optional engagement (Learn More pattern)
- ✅ One-click fixes where possible

**Technical Quality:**
- ✅ All validation functions properly categorize severity
- ✅ Helpers trigger based on data conditions
- ✅ New pre-survey questions saved and accessible
- ✅ No white screens, GAS-safe navigation

---

### **Phase 5: Scenario Comparison (Week 6)**

**Tasks:**
1. Build "Save as Scenario" modal
2. Extend TOOL4_SCENARIOS sheet schema (add V1 columns)
3. Build scenario list UI
4. Build side-by-side comparison table
5. Add "Edit" and "Delete" scenario actions
6. Add "Generate Report" functionality

**Success Criteria:**
- Multiple scenarios saved correctly
- Comparison table shows differences clearly
- User can switch between scenarios
- Report generation works (PDF or Google Doc)

---

## 📚 Reference Documents

- **V1 Allocation Engine:** `/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationFunction.js`
- **Tool 1/2/3 Data Schema:** `/docs/middleware-mapping.md`
- **Current Tool 4 Implementation:** `/tools/tool4/Tool4.js`
- **Week 3 Category Breakdown:** Lines 443-536 in `/tools/tool4/Tool4.js`
- **Tool 8 Scenario Pattern:** `/apps/Tool-8-investment-tool/` (legacy reference)

---

## 🎯 Success Metrics

**User Experience:**
- [ ] Student sees personalized allocation based on their unique profile
- [ ] Student understands WHY recommendations are what they are
- [ ] Student has agency to adjust and explore scenarios
- [ ] Student receives contextual help when stuck
- [ ] Student can compare multiple approaches
- [ ] Student gets actionable implementation plan

**Technical:**
- [ ] V1 engine produces consistent results
- [ ] Calculator maintains 100% allocation
- [ ] Lock feature works without bugs
- [ ] Progressive disclosure reveals appropriate detail levels
- [ ] All validations detect correct conditions
- [ ] Scenarios save/load correctly

**Pedagogical:**
- [ ] Students explore WITHOUT feeling judged
- [ ] Students learn through experimentation
- [ ] Students connect allocation to values
- [ ] Students see trade-offs clearly
- [ ] Students feel empowered, not overwhelmed

---

## 🔑 Key Design Principles

1. **Agency with Guardrails** - Student control + intelligent assistance
2. **Progressive Disclosure** - Simple → Complex as needed
3. **Trauma-Informed** - No shame, permission to explore, celebrate progress
4. **Transparency** - Show the "why" behind recommendations
5. **Experimentation** - Scenarios encourage exploration
6. **Implementation Bridge** - From plan to action

---

## 📝 Implementation Progress Log

### **2025-11-28: Phase 1 Kickoff**

**Completed:**
1. ✅ Ported V1 allocation engine from `/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationFunction.js`
2. ✅ Created `calculateAllocationV1()` function in Tool4.js (lines 1292-1512)
3. ✅ Implemented 3-tier modifier system:
   - Financial modifiers (income, debt, emergency fund, stability)
   - Behavioral modifiers (discipline, impulse, long-term focus) with satisfaction amplification
   - Motivational modifiers (lifestyle, growth, stability, timeline, dependents, autonomy)
4. ✅ Created test suite in `/tests/Tool4Tests.js` (lines 1211-1288)
5. ✅ Validated engine with 2 test cases:
   - Test 1: Build Long-Term Wealth (high discipline) → M:41%, E:40%, F:8%, J:11%
   - Test 2: Get Out of Debt (severe debt) → M:8%, E:40%, F:52%, J:0%
6. ✅ Deployed to Apps Script and committed to GitHub (9a818c9)

**Completed (2025-11-29 - Session 1):**
1. ✅ Built `buildV1Input()` mapper function
   - Maps Tool 1/2/3 data + pre-survey to V1 format
   - Safe defaults when Tool 2 data missing
   - Error handling with fallback values
2. ✅ Created 7 helper functions for Tool 2 data derivation:
   - `deriveGrowthFromTool2()` - Investment/savings/retirement → 0-10 scale
   - `deriveStabilityFromTool2()` - Emergency fund/insurance/debt → 0-10 scale
   - `deriveStageOfLife()` - Age + employment → life stage categories
   - `mapEmergencyFundMonths()` - Tool 2 scale (-5 to +5) → V1 tiers (A-E)
   - `mapIncomeStability()` - Tool 2 consistency → categorical stability
   - `deriveDebtLoad()` - Text analysis + stress → debt tier (A-E)
   - `deriveInterestLevel()` - Debt stress → interest level (High/Medium/Low)
3. ✅ Built comprehensive test suite (3 new test functions):
   - `testV1InputMapper()` - Tests mapper with missing data
   - `testHelperFunctions()` - Validates all 7 helper functions
   - `testEndToEndIntegration()` - Complete pre-survey → allocation flow
4. ✅ Deployed and tested in Apps Script environment
5. ✅ Local validation complete with real student data:
   - 29 test cases passing (all helper functions)
   - 2 real student profiles validated (Evelia, Greg)
   - Edge cases handled (missing data, empty strings, zero values)
   - See: `docs/Tool4/PHASE1-TEST-RESULTS.md`

**Completed (2025-11-29 - Session 2 - Phase 1 FINALIZED):**
1. ✅ **Phase 1 Review completed** - Identified critical gap in integration functions
   - Review document created: `docs/Tool4/PHASE1-REVIEW.md`
   - Found: Functions existed only in test files, not production code
2. ✅ **Added all 8 integration functions to Tool4.js**:
   - `buildV1Input()` - Tool4.js:1751-1811 (61 lines)
   - `deriveGrowthFromTool2()` - Tool4.js:1817-1830 (14 lines)
   - `deriveStabilityFromTool2()` - Tool4.js:1836-1848 (13 lines)
   - `deriveStageOfLife()` - Tool4.js:1853-1865 (13 lines)
   - `mapEmergencyFundMonths()` - Tool4.js:1871-1881 (11 lines)
   - `mapIncomeStability()` - Tool4.js:1886-1893 (8 lines)
   - `deriveDebtLoad()` - Tool4.js:1899-1924 (26 lines)
   - `deriveInterestLevel()` - Tool4.js:1929-1937 (9 lines)
   - **Total:** 196 lines of production-ready integration code
3. ✅ **Deployed to Apps Script** - All functions now available as Tool4 methods
4. ✅ **Verification complete** - All 9 functions confirmed in production code
5. ✅ **Specification updated** - Corrected all line number references

**Technical Notes:**
- V1 engine successfully ported with zero errors
- Satisfaction amplification working correctly (20% boost at satisfaction=7)
- Modifier notes properly categorized for progressive disclosure
- Test function moved to proper test file for code organization
- Essentials floor enforcement working (40% minimum)
- Integration layer complete with robust error handling
- All helper functions handle edge cases (null values, missing data)
- Text parsing for debt load uses multiple heuristics (keywords + stress level)
- Local test scripts created for rapid validation (`test-integration.js`, `test-e2e-integration.js`)
- **Phase 1 NOW COMPLETE** - All integration functions exist in production code

**Completed (2025-11-29 - Session 3 - Phase 2 Pre-Survey UI):**
1. ✅ **Pre-Survey Page Built** - Complete trauma-informed UI
   - 8 critical questions (7 behavioral + 1 priority)
   - 2 optional questions (lifestyle, autonomy)
   - ~700 lines of HTML/CSS/JavaScript
   - Location: Tool4.js:121-804
2. ✅ **Interactive Features**:
   - Real-time progress bar (tracks completion percentage)
   - Live slider value displays
   - Collapsible optional questions section
   - Client-side validation with error messages
   - Loading overlay with spinner animation
3. ✅ **Modified Render Flow**:
   - Check pre-survey completion (Tool4.js:35-36)
   - Conditional rendering: pre-survey OR calculator (lines 38-47)
   - Auto-calculation of V1 allocations (line 44-45)
   - Pass allocations to calculator (line 46)
4. ✅ **Data Persistence**:
   - Save via `google.script.run.savePreSurvey()` (line 788-798)
   - Auto-reload after save (line 791)
   - PropertiesService integration working
5. ✅ **Documentation Updated**:
   - Phase 2 section marked complete
   - Implementation details added
   - Data flow diagram updated

**Next Steps:**
- Update calculator UI to display V1 allocations
- Add insights sidebar showing "Why these numbers?"
- Implement slider adjustments with lock feature
- Build scenario comparison functionality

---

**Document Maintained By:** Claude Code
**Completed (2025-11-29 - Session 4 - Phase 3 Started):**
1. ✅ **Unified Page Architecture** - Single-page pre-survey + calculator
   - Created `buildUnifiedPage()` function: Tool4.js:813-1433 (620 lines)
   - Replaced two-page flow with collapsible single-page experience
   - Pre-survey starts expanded (first visit) or collapsed (return visit)
2. ✅ **Collapsible Pre-Survey Section**:
   - Header click toggles expand/collapse
   - Summary bar shows key values when collapsed (Priority, Income, Essentials, Timeline)
   - Smooth CSS transitions for expand/collapse animations
   - "Edit Pre-Survey" pattern - click header to modify values
3. ✅ **V1 Allocation Display**:
   - 4 allocation bucket cards (Multiply, Essentials, Freedom, Enjoyment)
   - Static percentage display with visual styling
   - Descriptive labels for each bucket purpose
   - Fixed case sensitivity bug (percentages.Multiply vs percentages.multiply)
4. ✅ **"Why These Numbers?" Insights Box**:
   - Displays V1 lightNotes for each bucket
   - Explains reasoning behind allocations
   - Fixed data structure bug (object vs array)
5. ✅ **Recalculate Functionality**:
   - Button text changes: "Calculate My Personalized Budget" → "Recalculate My Budget"
   - Page reload updates allocations after pre-survey changes
   - Seamless edit-recalculate workflow
6. ✅ **Bug Fixes**:
   - Fixed: `google.script.run.savePreSurvey is not a function` - Added global wrapper functions
   - Fixed: Blank white page after submission - Changed reload strategy
   - Fixed: `allocation.lightNotes.join is not a function` - Handled object structure
   - Fixed: "undefined%" in allocation cards - Corrected property case (Multiply vs multiply)
7. ✅ **Improved UX**:
   - No more "go back to main menu" - all actions on one page
   - Pre-survey collapses to summary after calculation
   - Clear visual hierarchy and interaction patterns

**Technical Improvements:**
- Modified `render()` to always call `buildUnifiedPage()` instead of conditional routing
- Pre-survey data pre-fills form on return visits
- V1 allocations calculated server-side, displayed client-side
- Window.reload() works within single-page context

**Current Limitations:**
- ⏳ No interactive sliders yet - allocations are static display only
- ⏳ No lock/unlock feature - can't freeze individual buckets
- ⏳ No manual adjustment - must recalculate via pre-survey changes
- ⏳ No scenario saving - can't compare multiple approaches

---

## 📊 Phase 2 Completion Summary (2025-11-29)

### What Was Accomplished

**Phase 2: Pre-Survey UI & V1 Integration** - ✅ 100% COMPLETE

**Major Deliverables:**
1. ✅ **Comprehensive Pre-Survey** (10 required questions with trauma-informed UX)
2. ✅ **V1 Allocation Engine** (3-tier modifier system calculating personalized allocations)
3. ✅ **Smart Validation System** (replaces forced floors with intelligent warnings)
4. ✅ **Seamless Navigation** (document.write pattern eliminates all white screens)
5. ✅ **Production-Ready UI** (loading animations, error handling, mobile responsive)

**Key Improvements Over Original Plan:**
- Changed from 8+2 questions to 10 required (moved optional to main)
- Priority question moved to #1 (most important first)
- Dollar inputs replace range dropdowns (more intuitive)
- All 11 slider labels (0-10) with detailed descriptions
- Removed forced Essentials floor (now uses smart validation)
- Added comprehensive safety checks (no negative %, always sums to 100%)

**Critical Bugs Fixed:**
- ✅ Negative percentages (-3% Enjoyment)
- ✅ White screens on form submission
- ✅ Variable redeclaration errors (IIFE wrappers)
- ✅ Navigation issues across all tools
- ✅ Rounding errors causing sum ≠ 100%

**Architecture Decisions:**
- Uses `document.write()` pattern (proven FormUtils approach)
- Respects user's actual income/expenses data
- Validates recommended vs actual Essentials
- Provides actionable feedback when allocations don't match reality
- Triple-layer safety net prevents calculation errors

### Files Modified

**Core Implementation:**
- `tools/tool4/Tool4.js` - Complete rewrite of pre-survey and V1 engine (~1000 lines)
- `core/grounding/GroundingReport.js` - Added IIFE wrapper
- `core/Router.js` - Added savePending parameter (later removed)

**Documentation:**
- `docs/Tool4/TOOL4-REDESIGN-SPECIFICATION.md` - Updated with Phase 2 completion
- `docs/Tool4/PHASE2-COMPLETE.md` - Detailed completion report
- `docs/Tool4/PHASE2-TESTING-GUIDE.md` - Testing instructions
- `DEPLOYMENT-INFO.md` - Updated deployment status

### What's Ready for Phase 3

**Foundation Complete:**
- ✅ Pre-survey collects all behavioral data
- ✅ V1 engine calculates personalized allocations
- ✅ Static display shows M/E/F/J percentages
- ✅ Insights explain "Why these numbers?"
- ✅ Validation warns when Essentials mismatches
- ✅ All navigation and error handling working

**Next Steps (Phase 3):**
1. **Interactive Sliders** - Let users adjust M/E/F/J percentages
2. **Lock/Unlock** - Freeze buckets during redistribution
3. **Smart Redistribution** - Maintain 100% sum with locked buckets
4. **Validation Helpers** - "Check My Plan" with financial rules
5. **Scenario Management** - Save and compare multiple allocations

### Deployment Status

**Production URL:** `https://script.google.com/macros/s/AKfycbxLCd4P9XY20NpAhwg7zucFE_BgwTnhjRqYRTgQ1QY/exec`

**Latest Deployment:** 2025-11-29 (Auto-updates with every `clasp push`)

**Testing Status:**
- Phase 1 Tests: 5/5 passing ✅
- Phase 2 Tests: 3/3 passing ✅
- Manual Testing: All scenarios working ✅

**Version:** 2.0 (Phase 2 Complete - Pre-Survey & V1 Integration)

---

## 📊 Phase 3A Progress: Smart Priority Picker (2025-11-29)

### What Was Accomplished

**Phase 3A: Priority Recommendation Logic** - ✅ LOGIC COMPLETE + ENHANCED, UI PENDING

**Major Deliverables:**
1. ✅ **Priority Scoring Algorithm** (10 priority-specific functions with 8+ data point analysis each)
2. ✅ **Recommendation Engine** (calculatePriorityRecommendations - sorts priorities by fitness)
3. ✅ **Tier Mapping Functions** (income → A-E, essentials → A-F based on % of income)
4. ✅ **Reason Generator** (trauma-informed one-line explanations for each recommendation)
5. ✅ **Comprehensive Documentation** (PRIORITY-RECOMMENDATION-LOGIC.md with full criteria)
6. ✅ **Test Suite** (test-priority-recommendations.js - all tests passing)
7. ✅ **ENHANCEMENT: Income vs Essentials Analysis** (cash flow logic integrated into all scoring)
8. ✅ **Return to Dashboard Navigation** (with contextual loading animation)

**Design Decision:**
After user feedback, redesigned flow to show priority recommendations BEFORE user selects priority (proactive guidance vs reactive validation).

**New Flow:**
```
Pre-Survey (8 questions)
  ↓
Calculate Priority Recommendations (server-side)
  ↓
Priority Picker (show all 10 with ⭐/⚪/⚠️ indicators)
  ↓
User selects priority + timeline
  ↓
Calculate Allocation (V1 engine with selected priority)
  ↓
Display M/E/F/J allocations (priority/timeline editable at top)
```

**Scoring Examples:**
- High discipline (8/10) + low debt (A) + stable income → Build Long-Term Wealth: **+140** ⭐
- High debt (E) + unstable income + low satisfaction → Get Out of Debt: **+135** ⭐
- Low discipline (3/10) + high debt (E) → Build Long-Term Wealth: **-135** ⚠️
- No debt (A) + high emergency fund (E) → Get Out of Debt: **-80** ⚠️

**Implementation:**
- Tool4.js: Lines 3651-4067 (13 new methods, 416 lines)
  - `mapIncomeToRange()` - Maps dollar amounts to A-E tiers
  - `mapEssentialsToRange()` - Maps essentials % to A-F tiers
  - `scoreWealthPriority()` - Scores "Build Long-Term Wealth" (-100 to +100)
  - `scoreDebtPriority()` - Scores "Get Out of Debt"
  - `scoreSecurityPriority()` - Scores "Feel Financially Secure"
  - `scoreEnjoymentPriority()` - Scores "Enjoy Life Now"
  - `scoreBigGoalPriority()` - Scores "Save for a Big Goal"
  - `scoreSurvivalPriority()` - Scores "Stabilize to Survive"
  - `scoreBusinessPriority()` - Scores "Build or Stabilize a Business"
  - `scoreGenerationalPriority()` - Scores "Create Generational Wealth"
  - `scoreBalancePriority()` - Scores "Create Life Balance"
  - `scoreControlPriority()` - Scores "Reclaim Financial Control"
  - `getPriorityReason()` - Returns appropriate explanation based on indicator
  - `calculatePriorityRecommendations()` - Main function that orchestrates scoring

**Data Integration:**
- Pre-survey provides: income, essentials, satisfaction, discipline, impulse, long-term focus, lifestyle, autonomy
- Tool 2 provides (optional): debt load, interest level, emergency fund, income stability, dependents, growth orientation, stability orientation
- Safe defaults used when Tool 2 unavailable (moderate values: C tier, Medium level, 5/10 scores)

**Test Results:**
```
✅ Test Case 1: High-income, disciplined, low debt
   - Build Wealth: +140 ⭐ RECOMMENDED
   - Get Out of Debt: -80 ⚠️ CHALLENGING

✅ Test Case 2: High debt, low discipline, unstable income
   - Build Wealth: -135 ⚠️ CHALLENGING
   - Get Out of Debt: +135 ⭐ RECOMMENDED

✅ Income Tier Mapping:
   - $2,000/mo → A
   - $7,500/mo → C
   - $25,000/mo → E
```

**Files Created/Modified:**
- `tools/tool4/Tool4.js` - Added 13 priority recommendation methods + cash flow enhancements
- `docs/Tool4/PRIORITY-RECOMMENDATION-LOGIC.md` - Complete specification (10 priorities × 3 indicators)
- `test-priority-recommendations.js` - Test suite with 2 comprehensive test cases
- `docs/Navigation/GAS-NAVIGATION-RULES.md` - Navigation best practices documentation
- `check-navigation.sh` - Pre-deployment validation script
- `CLAUDE.md` - Updated with GAS navigation rules

**Git Commits:**
- Commit b4272d0: "feat(tool4): Add priority recommendation logic for smart priority selection"
- Session work: Enhanced all 10 priority scoring functions with income/essentials cash flow analysis
- 6 files changed, 1200+ insertions(+)

**Next Steps:**
1. Build priority picker UI component (collapsible section)
2. Remove priority question from pre-survey (move to picker)
3. Add timeline to priority picker (currently in pre-survey)
4. Integrate picker into unified page flow
5. Update button text: "Calculate My Personalized Budget" → "Calculate My Available Priorities"
6. Add priority/timeline selector at top of calculator section (for easy editing)

### Income vs Essentials Enhancement (Session 2025-11-29)

**Critical Enhancement Added:**
After initial implementation, user feedback identified a major gap - the scoring logic wasn't considering **cash flow health** (income vs essentials relationship). This was causing incorrect recommendations like suggesting wealth building to someone earning $100k/month but spending $98k on essentials.

**What Was Added:**

1. **Surplus/Deficit Calculations** (Tool4.js:4457-4460)
   ```
   const surplus = monthlyIncome - monthlyEssentials;
   const essentialsPct = (monthlyEssentials / monthlyIncome) * 100;
   const surplusRate = (surplus / monthlyIncome) * 100;
   ```

2. **Cash Flow Logic in All 10 Priority Scoring Functions:**
   - **Build Long-Term Wealth**: +25 if essentialsPct < 50%, -60 if > 90%
   - **Stabilize to Survive**: +80 if surplus < 0 (crisis), +70 if essentialsPct > 100%
   - **Feel Financially Secure**: +30 if essentialsPct 75-90% (tight but not crisis)
   - **Enjoy Life Now**: +30 if surplus >= $1k, -45 if essentialsPct > 85%
   - **All Others**: Appropriate cash flow boosts/penalties based on priority type

3. **Personalized Reasons with Cash Flow Context:**
   - Before: "Your high discipline supports wealth building"
   - After: "Your $2,100 surplus/month gives you excellent wealth-building capacity"
   - Before: "Your situation requires stabilization"
   - After: "With essentials at 96% of income, you're in crisis mode"

**Real-World Impact:**
- ✅ Detects crisis: surplus < 0 or essentialsPct > 100% → "Stabilize to Survive" recommended
- ✅ Prevents bad advice: High income BUT high essentials → wealth building now cautioned
- ✅ Accurate recommendations: $2k+ surplus → wealth building strongly recommended
- ✅ Context-aware reasons: Shows actual dollar amounts and percentages to users

**Current Status:**
- **Recommendation Logic:** ✅ 100% Complete - All 10 priorities scored with cash flow + behavioral analysis
- **Priority Picker UI:** ✅ 100% Complete - Fully functional collapsible picker with all features
- **Integration:** ✅ 100% Complete - Wired into unified page flow (Tool4.js:1806-1819, 4654-4749)
- **Navigation:** ✅ 100% Complete - Return to Dashboard button with contextual loading animation

**What's Already Built:**
- ✅ Priority picker collapsible section (Tool4.js:4654-4725)
- ✅ All 10 priorities displayed with ⭐/⚪/⚠️ indicators sorted by score
- ✅ Personalized one-line cash flow reasons shown for each priority
- ✅ Timeline selector within priority picker
- ✅ "Calculate My Allocation" button triggers V1 calculation
- ✅ Base allocation preview (M/E/F/J %) shown on each priority card
- ✅ Selection state management with visual feedback
- ✅ Collapsed summary view showing selected priority + timeline

---

## 🎯 Next Phase: Phase 3B - Interactive Calculator

**Goal:** Add interactive adjustment capabilities to the allocation display

**Tasks for Next Session:**
1. ⏳ Build interactive sliders for M/E/F/J bucket adjustment
2. ⏳ Display all 10 priorities with ⭐/⚪/⚠️ indicators sorted by score
3. ⏳ Add lock/unlock icons to freeze individual buckets during adjustment
4. ⏳ Implement proportional redistribution logic (maintains 100% sum)
5. ⏳ Add "Reset to Recommended" button to restore V1 values
6. ⏳ Build "Check My Plan" validation with financial rules
7. ⏳ Add scenario save/compare functionality
8. ⏳ Test complete adjustment flow with edge cases

**Design Reference:**
```
┌────────────────────────────────────────────────────────┐
│ ⭐ RECOMMENDED PRIORITIES                              │
├────────────────────────────────────────────────────────┤
│ ⭐ Get Out of Debt                                     │
│    With essentials at 87% of income and high debt,    │
│    stabilizing cash flow is critical                   │
│                                                         │
│ ⭐ Feel Financially Secure                             │
│    Your $450 surplus/month suggests building a buffer  │
├────────────────────────────────────────────────────────┤
│ ⚪ OTHER OPTIONS                                       │
├────────────────────────────────────────────────────────┤
│ ⚪ Save for a Big Goal                                 │
│    Viable with discipline 6/10 and moderate debt       │
├────────────────────────────────────────────────────────┤
│ ⚠️ MAY BE CHALLENGING                                 │
├────────────────────────────────────────────────────────┤
│ ⚠️ Build Long-Term Wealth                             │
│    Your $450 surplus/month makes aggressive investing  │
│    challenging - build buffer first                    │
└────────────────────────────────────────────────────────┘
```

**Success Criteria:**
- User sees personalized priority recommendations after completing pre-survey
- Recommendations show WHY each priority fits (or doesn't fit) their situation
- User can select any priority (preserves agency) but understands trade-offs
- Timeline selection happens alongside priority selection
- Flow feels natural and educational, not restrictive

---

**Version:** 3.0 (Phase 3A Complete - Smart Priority Picker with Cash Flow Analysis)
**Last Updated:** 2025-11-29
**Maintained By:** Claude Code & Larry Yatch
**Repository:** https://github.com/Larry-Yatch/FTP-v3-unified

---

## 📋 Summary of Current State (v3.0)

**What's Working:**
- ✅ Pre-survey: 8 behavioral questions collecting income, essentials, and behavioral data
- ✅ Priority Recommendations: All 10 priorities scored with cash flow + behavioral analysis
- ✅ Priority Picker UI: Fully functional collapsible interface with personalized recommendations
- ✅ Allocation Calculation: V1 engine calculates M/E/F/J percentages based on selected priority
- ✅ Validation: Smart warnings when Essentials allocation doesn't match actual expenses
- ✅ Navigation: GAS-safe navigation throughout, no white screens
- ✅ Return to Dashboard: Button with contextual loading animation

**Ready for Next Phase:**
- Phase 3B: Interactive Calculator with sliders, locks, and redistribution
- Phase 4: Validation helpers and scenario comparison
- Phase 5: Advanced features (reports, exports, insights)
