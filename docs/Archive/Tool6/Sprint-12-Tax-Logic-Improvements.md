# Sprint 12: Tax Logic Improvements

**Created:** January 26, 2026
**Completed:** January 26, 2026
**Status:** Complete
**Priority:** High (Backdoor Roth), Medium (Solo 401k)

---

## Overview

Two tax calculation gaps identified in Tool 6 that could lead to incorrect recommendations:

1. **Backdoor Roth Pro-Rata Rule** - HIGH priority, potential tax liability impact
2. **Solo 401(k) Employer Limits** - MEDIUM priority, overestimates contribution room

---

## Sprint 12.1: Backdoor Roth Pro-Rata Warning (HIGH) - COMPLETE

### Problem
Tool 6 recommends Backdoor Roth for high-income users but doesn't check for existing Traditional IRA balances. The pro-rata rule means conversions are partially taxable if user has pre-tax IRA funds.

**Risk:** User with $100k Traditional IRA follows advice → ~93% of conversion is taxable.

### Tasks

- [x] **12.1.1** Add backup question: "Do you have an existing Traditional IRA balance?"
  - Options: No / Yes, under $10k / Yes, $10k+ / Not sure
  - Store in `a13b_tradIRABalance` field
  - Added to balances section in questionnaire

- [x] **12.1.2** Add pro-rata warning in Backdoor Roth recommendation
  - If `tradIRABalance > 0` AND Backdoor Roth recommended:
  - Show warning banner: "Pro-rata taxation applies to Backdoor Roth conversions when you have existing Traditional IRA funds."
  - Suggest: "Consider rolling your Traditional IRA to your 401(k) first (if your plan accepts rollovers)."

- [x] **12.1.3** Add execution guidance to Backdoor Roth vehicle display
  - Clean backdoor: "1) Contribute to Trad IRA (non-deductible) → 2) Convert to Roth immediately"
  - With IRA balance: "Consult tax advisor - pro-rata rule applies. File Form 8606."
  - With rollover available: Shows 3-step rollover process

- [x] **12.1.4** Add 401(k) rollover question
  - Added `a13c_401kAcceptsRollovers` question
  - Conditionally shown when user has Trad IRA balance

### Files Modified
- `tools/tool6/Tool6.js` - Added pro-rata warning logic in `getEligibleVehicles()`, CSS for `.vehicle-warning`
- `tools/tool6/Tool6Constants.js` - Added `BACKDOOR_ROTH_WARNINGS` object, new questions

### Acceptance Criteria
- [x] User with Trad IRA balance sees pro-rata warning (yellow banner)
- [x] User without Trad IRA balance sees clean execution steps
- [x] User with 401(k) that accepts rollovers sees rollover suggestion + action item

---

## Sprint 12.2: Solo 401(k) Dynamic Limits (MEDIUM) - COMPLETE

### Problem
Tool 6 shows static $46,500 employer contribution cap. Actual limit is MIN(25% of income, remaining room after employee deferrals).

**Impact:** Most self-employed users can't actually contribute $46,500 - requires ~$186k+ income.

### Tasks

- [x] **12.2.1** Add self-employment income question to backup questions
  - "What is your estimated annual self-employment income?"
  - Only show if user indicates self-employed/business owner
  - Store in `a13d_selfEmploymentIncome` field

- [x] **12.2.2** Modify limit calculation for Solo 401(k) Employer
  - Uses 20% of SE income (Sole Prop/LLC formula)
  - Falls back to grossIncome when SE income not provided
  - Respects combined $70k limit (minus employee deferrals)

- [x] **12.2.3** Update Solo 401(k) Employer vehicle display
  - Shows calculated limit based on income (e.g., "Your limit: $16,000/year")
  - Add note: "Limited to 20% of self-employment income"

- [x] **12.2.4** Added entity type constants (deferred full implementation)
  - `SOLO_401K_EMPLOYER_NOTES.SOLE_PROP_LLC` (20%)
  - `SOLO_401K_EMPLOYER_NOTES.S_CORP_C_CORP` (25%)
  - Currently uses 20% for all; entity distinction can be added later

### Files Modified
- `tools/tool6/Tool6.js` - Dynamic calculation in `getEligibleVehicles()` for Profile 4
- `tools/tool6/Tool6Constants.js` - Added `SOLO_401K_EMPLOYER_NOTES`, new question

### Acceptance Criteria
- [x] User with $80k income sees ~$16k employer limit (not $46.5k)
- [x] User with $250k income sees $46.5k limit (hits cap)
- [x] Falls back to grossIncome when SE income not provided

---

## Sprint 12.3: Documentation & Testing - COMPLETE

- [x] **12.3.1** Add test scenarios to Tool6Tests.js
  - `testSprint12()` function with 7 test cases
  - High-income with/without Trad IRA balance
  - Self-employed with $80k, $100k, $250k incomes
  - All tests passing (7/7)

- [x] **12.3.2** Update this document with completion status

- [x] **12.3.3** Update ToDos.md - mark items complete

---

## Sprint 12.4: Educational Help Section - COMPLETE

- [x] **12.4.1** Add collapsible Backdoor Roth explainer
  - Uses native HTML5 `<details>`/`<summary>` elements
  - Collapsible "What is Backdoor Roth?" section on vehicle display
  - Explains: The Strategy, Why It Works, Pro-Rata Rule, How to Avoid Pro-Rata Tax, Required Tax Filing

- [x] **12.4.2** Add `BACKDOOR_ROTH_EDUCATION` constant
  - Structured educational content with sections
  - Includes formula box and tip box styling
  - Income thresholds for reference

### Files Modified
- `tools/tool6/Tool6.js` - Added `buildVehicleEducationHelp()` method, CSS for `.vehicle-help`
- `tools/tool6/Tool6Constants.js` - Added `BACKDOOR_ROTH_EDUCATION` object

### Acceptance Criteria
- [x] Backdoor Roth vehicle shows collapsible "What is Backdoor Roth?" help
- [x] Collapsible expands/collapses on click
- [x] Content explains pro-rata rule, Form 8606, and rollover strategy

---

## Test Results

Run `testSprint12()` in Apps Script Editor:

```
=== Sprint 12 Test Summary ===
Passed: 7/7
Failed: 0/7

✓ ALL SPRINT 12 TESTS PASSED
```

| Test | Description | Result |
|------|-------------|--------|
| 1 | Backdoor Roth - Clean (no Trad IRA) | PASSED |
| 2 | Backdoor Roth - Pro-Rata Warning | PASSED |
| 3 | Backdoor Roth - Rollover Suggestion | PASSED |
| 4 | Solo 401(k) - Low Income ($80k) | PASSED |
| 5 | Solo 401(k) - High Income ($250k) | PASSED |
| 6 | Solo 401(k) - Falls back to grossIncome | PASSED |
| 7 | No Backdoor when income below phase-out | PASSED |

---

## Bug Fixes (Same Day)

During Sprint 12 testing, the following bugs were discovered and fixed:

### 1. Return to Dashboard Button Stuck
- **Issue:** Button showed loading spinner but never navigated
- **Cause:** Calling `getDashboardHtml()` but function is named `getDashboardPage()`
- **Fix:** Changed function call in `returnToDashboard()` to use correct name

### 2. Continue to Priorities Button Not Working
- **Issue:** When user has no HSA and no children, clicking "Continue to Priorities" did nothing
- **Cause:** When skipping Phase C, code set wrong field names (`aq_ret_*` instead of `aq_retirement_*`)
- **Fix:** Corrected field names to match `AMBITION_QUESTIONS` and added DOM input updates

### 3. Vehicle Sliders Not Draggable
- **Issue:** Users could only click on sliders, not drag them
- **Cause:** Visual `.slider-track` and `.slider-fill` elements were intercepting mouse events
- **Fix:** Added `pointer-events: none` to slider-track and slider-fill CSS

---

## Reference

### Backdoor Roth Pro-Rata Rule
```
Pro-rata % = Pre-tax IRA balance / Total IRA balance (all accounts)

Example: $100k Trad IRA + $7k new contribution = $107k total
Convert $7k → Taxable portion = $7k × ($100k / $107k) = $6,542 taxable
```

### Solo 401(k) Limits (2025)
```
Employee Deferral: $23,500 (+ $7,500 catch-up if 50+, + $11,250 if 60-63)
Employer Profit Sharing: MIN(20% of SE income, $46,500)
Combined Maximum: $70,000 (or $77,500 with standard catch-up)
```

### IRS Income Phase-Outs (2025)
```
Roth IRA Direct:
  Single: $150,000 - $165,000
  MFJ: $236,000 - $246,000

Above these = Backdoor Roth required
```
