# Phase 2 Testing Guide - Pre-Survey UI

**Purpose:** Test Phase 2 pre-survey implementation in Google Apps Script

---

## Quick Start

### Run Phase 2 Test Suite

**In Apps Script Editor:**

1. Navigate to: **tests/Tool4Tests.js**
2. Select function: **`runPhase2Tests`**
3. Click **Run** (▶️)
4. View **Execution Log**

Expected: **3/3 tests pass** ✅

---

## Test Functions

### Main Test Runner

**`runPhase2Tests()`** - Runs all Phase 2 tests
- Test 1: Pre-Survey Save/Retrieve
- Test 2: Pre-Survey → V1 Allocation Flow
- Test 3: Pre-Survey UI Rendering

### Individual Tests

**`testPreSurveySaveRetrieve()`**
- Tests `savePreSurvey()` and `getPreSurvey()`
- Validates data persistence in PropertiesService
- Checks data integrity after save/retrieve
- Tests null return for non-existent client

**`testPreSurveyToAllocationFlow()`**
- Simulates complete user journey
- Steps:
  1. Check initial state (no pre-survey)
  2. Create pre-survey data
  3. Save pre-survey
  4. Build V1 input
  5. Calculate allocation
  6. Validate results
- Tests the exact flow users experience

**`testPreSurveyRendering()`**
- Tests `buildPreSurveyPage()` function
- Validates HTML generation (~25,000 chars)
- Checks for required elements:
  - Form tag
  - Submit button
  - Question inputs
  - Progress bar
  - Optional section

---

## Expected Output

When all tests pass:

```
╔════════════════════════════════════════════════════════════╗
║            PHASE 2 TEST SUITE - Pre-Survey UI             ║
╚════════════════════════════════════════════════════════════╝

TEST 1: Pre-Survey Save/Retrieve
════════════════════════════════════════════════════════════
=== Testing Pre-Survey Save/Retrieve ===
Step 1: Save pre-survey data
  Save result: {"success":true}
  ✅ Pre-survey saved

Step 2: Retrieve pre-survey data
  Retrieved: {satisfaction:7, discipline:8, ...}
  ✅ Pre-survey retrieved

Step 3: Validate data integrity
  ✅ All fields match

Step 4: Test with non-existent client
  Non-existent result: null
  ✅ Returns null for non-existent client

=== Pre-Survey Save/Retrieve Test Complete ===
✅ All tests passed

TEST 2: Pre-Survey → V1 Allocation Flow
════════════════════════════════════════════════════════════
=== Testing Pre-Survey → V1 Allocation Flow ===
Step 1: Check initial state
  Initial pre-survey: null
  ✅ No pre-survey exists (returns null)

Step 2: User completes pre-survey
  Pre-survey data collected

Step 3: Save pre-survey
  ✅ Pre-survey saved

Step 4: Build V1 input from pre-survey
  V1 Input created:
    Priority: Build Long-Term Wealth
    Satisfaction: 8
    Income Range: D
    Essentials Range: C
  ✅ V1 input built successfully

Step 5: Calculate V1 allocation
  Allocation calculated:
    Multiply:   45%
    Essentials: 40%
    Freedom:    4%
    Enjoyment:  11%
    Sum: 100%
    Satisfaction Boost: 30%
  ✅ Allocation calculated

Step 6: Validate results
  Sum = 100%: ✅
  Has light notes: ✅
  Has details: ✅

=== Complete Flow Test Summary ===
✅ All validations passed

This simulates the exact flow a user experiences:
  1. Open Tool 4 (no pre-survey) → Show pre-survey form
  2. Fill and submit pre-survey → Save data
  3. Reload Tool 4 (has pre-survey) → Calculate V1 allocation
  4. Show calculator with personalized percentages

TEST 3: Pre-Survey UI Rendering
════════════════════════════════════════════════════════════
=== Testing Pre-Survey UI Rendering ===
Step 1: Build pre-survey page
  HTML generated: 25432 characters
  ✅ Pre-survey page built successfully

Step 2: Validate HTML structure
  Has form: ✅
  Has submit button: ✅
  Has questions: ✅
  Has progress bar: ✅
  Has optional section: ✅

=== Pre-Survey Rendering Test Complete ===
✅ All validations passed

╔════════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝
Total Tests: 3
✅ Passed: 3
❌ Failed: 0

🎉 ALL PHASE 2 TESTS PASSED!

Phase 2 is ready for user testing:
  1. Open Tool 4 as a new user
  2. Fill out the pre-survey form
  3. Submit and watch it calculate allocations
  4. See the calculator with personalized values
```

---

## Manual User Testing

### Test 1: First-Time User Experience

**Steps:**
1. Open your spreadsheet
2. Go to TruPath menu → Tool 4: Financial Freedom Framework
3. Should see **pre-survey page** (not calculator)

**Expected:**
- Beautiful, modern UI with progress bar
- 8 required questions visible
- Optional questions hidden (collapsible)
- Progress bar at 0%
- Submit button enabled

### Test 2: Form Interaction

**Steps:**
1. Move satisfaction slider → Value updates in real-time
2. Fill some fields → Progress bar increases
3. Click "Want better recommendations?" → Optional section expands
4. Fill all required fields → Progress bar reaches 100%

**Expected:**
- Sliders smooth and responsive
- Progress updates correctly
- Optional section animates smoothly
- All visual feedback working

### Test 3: Validation

**Steps:**
1. Leave some required fields empty
2. Click "Build My Personalized Budget"

**Expected:**
- Error message appears: "Please answer all required questions"
- Empty fields highlighted in red
- Form does not submit

### Test 4: Successful Submission

**Steps:**
1. Fill all 8 required questions
2. Optionally fill optional questions
3. Click "Build My Personalized Budget"

**Expected:**
- Loading overlay appears with spinner
- Message: "Building Your Personalized Plan..."
- Page reloads after ~1-2 seconds
- Calculator appears (Phase 3 - will show old UI for now)

### Test 5: Return Visit

**Steps:**
1. Close and reopen Tool 4
2. Should see calculator immediately (not pre-survey)

**Expected:**
- Pre-survey skipped
- Calculator loads directly
- V1 allocations calculated (but not yet displayed - Phase 3)

---

## Troubleshooting

### Error: "Pre-survey already exists"

**Cause:** Pre-survey data saved from previous test

**Solution:**
```javascript
// In Apps Script, run this to clear:
function clearPreSurvey() {
  const clientId = 'YOUR_CLIENT_ID';
  const key = 'tool4_presurvey_' + clientId;
  PropertiesService.getUserProperties().deleteProperty(key);
  Logger.log('Pre-survey cleared for: ' + clientId);
}
```

### Error: "Tool4.buildPreSurveyPage is not a function"

**Cause:** Code not deployed

**Solution:**
1. Run `clasp push` locally
2. Or manually paste code into Apps Script editor

### Error: "Cannot read property 'percentages' of undefined"

**Cause:** V1 allocation calculation failed

**Solution:**
1. Check `buildV1Input()` is working
2. Run `testV1InputMapper()` test
3. Check logs for V1 engine errors

### Test Fails: HTML length too small

**Cause:** Pre-survey page not building correctly

**Solution:**
1. Check `buildPreSurveyPage()` exists
2. Verify shared/styles.html is accessible
3. Check for template literal syntax errors

---

## Validation Checklist

Before moving to Phase 3:

**Pre-Survey UI:**
- [ ] Pre-survey shows on first visit
- [ ] All 8 questions render correctly
- [ ] Sliders update values in real-time
- [ ] Progress bar tracks completion
- [ ] Optional section expands/collapses
- [ ] Validation prevents empty submissions
- [ ] Error messages display correctly

**Data Flow:**
- [ ] Form data saves to PropertiesService
- [ ] Page reloads after submission
- [ ] Calculator shows on second visit
- [ ] Pre-survey data persists correctly
- [ ] V1 allocation calculates successfully

**Integration:**
- [ ] `savePreSurvey()` works
- [ ] `getPreSurvey()` works
- [ ] `buildV1Input()` works
- [ ] `calculateAllocationV1()` works
- [ ] All data mapping correct

**User Experience:**
- [ ] Trauma-informed language throughout
- [ ] Mobile responsive
- [ ] Smooth animations
- [ ] Clear instructions
- [ ] Loading states clear
- [ ] Error recovery works

---

## Success Criteria

Phase 2 is complete when:

✅ All 3 automated tests pass
✅ Pre-survey renders correctly
✅ Form validation works
✅ Data saves and persists
✅ V1 allocation calculates
✅ Calculator loads on second visit
✅ User experience is smooth

---

## Next Steps

After Phase 2 tests pass:

**Phase 3: Calculator Integration**
1. Display V1 allocations in calculator
2. Pre-fill sliders with percentages
3. Add insights sidebar
4. Implement slider adjustments
5. Add lock/unlock feature

---

**Created:** 2025-11-29
**Purpose:** Phase 2 testing in Google Apps Script
**Status:** Ready to test
