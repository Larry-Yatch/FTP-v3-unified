# Phase 1 Testing in Google Apps Script

**Purpose:** Validate Phase 1 implementation in the actual deployment environment

---

## Quick Start

### 1. Open Apps Script Editor

Go to your Google Apps Script project:
```
https://script.google.com/home/projects/YOUR_PROJECT_ID
```

Or use the spreadsheet Apps Script menu:
```
Extensions → Apps Script
```

### 2. Find the Test Function

In the Apps Script Editor:
1. Click the file dropdown (top left)
2. Navigate to: **tests/Phase1ValidationSuite.js**
3. Find the function: `runPhase1ValidationSuite`

### 3. Run the Test

1. Make sure `runPhase1ValidationSuite` is selected in the function dropdown (top center)
2. Click the **Run** button (▶️ play icon)
3. If prompted, authorize the script to access your data
4. Click **View Execution Log** to see results

---

## What the Tests Validate

The validation suite runs 5 comprehensive tests:

### Test 1: Function Existence ✅
Verifies all 9 Phase 1 functions exist on the Tool4 object:
- `calculateAllocationV1`
- `buildV1Input`
- `deriveGrowthFromTool2`
- `deriveStabilityFromTool2`
- `deriveStageOfLife`
- `mapEmergencyFundMonths`
- `mapIncomeStability`
- `deriveDebtLoad`
- `deriveInterestLevel`

### Test 2: V1 Engine ✅
Validates the allocation engine:
- Accepts valid input format
- Produces percentages that sum to 100%
- Returns proper structure (percentages, lightNotes, details)
- Satisfaction amplification working
- All 4 buckets have values

### Test 3: Helper Functions ✅
Verifies all 7 helper functions are callable:
- Each function returns expected data types
- No errors when called with valid inputs
- Defaults work for missing data

### Test 4: Input Mapper ✅
Tests `buildV1Input()` integration:
- Accepts clientId and pre-survey data
- Returns all required V1 input fields
- Handles missing Tool 2 data with safe defaults
- Maps pre-survey values correctly

### Test 5: End-to-End Flow ✅
Complete integration test:
1. Pre-survey data → `buildV1Input()`
2. V1 input → `calculateAllocationV1()`
3. Allocation percentages sum to 100%
4. All data flows correctly

---

## Expected Output

When all tests pass, you should see:

```
╔════════════════════════════════════════════════════════════╗
║   PHASE 1 VALIDATION SUITE - Tool 4 V1 Engine Integration ║
╚════════════════════════════════════════════════════════════╝

TEST 1: Verify All Functions Exist
═══════════════════════════════════════════════════════════
  ✅ calculateAllocationV1
  ✅ buildV1Input
  ✅ deriveGrowthFromTool2
  ✅ deriveStabilityFromTool2
  ✅ deriveStageOfLife
  ✅ mapEmergencyFundMonths
  ✅ mapIncomeStability
  ✅ deriveDebtLoad
  ✅ deriveInterestLevel

✅ All 9 functions exist on Tool4 object

TEST 2: V1 Allocation Engine
═══════════════════════════════════════════════════════════
  Percentages:
    Multiply:   41%
    Essentials: 40%
    Freedom:    8%
    Enjoyment:  11%
  Sum: 100%
  Satisfaction Boost: 20%

✅ V1 engine produces valid allocations

TEST 3: Helper Functions
═══════════════════════════════════════════════════════════
  ✅ deriveGrowthFromTool2: 8
  ✅ deriveStabilityFromTool2: 6
  ✅ deriveStageOfLife: Mid-Career
  ✅ mapEmergencyFundMonths: C
  ✅ mapIncomeStability: Very stable
  ✅ deriveDebtLoad: D
  ✅ deriveInterestLevel: High

✅ All 7 helper functions are callable and return values

TEST 4: V1 Input Mapper (Mock Data)
═══════════════════════════════════════════════════════════
  ✅ All required fields present in V1 input
  Priority: Build Long-Term Wealth
  Satisfaction: 7
  Growth: 5
  Stability: 5

✅ Input mapper produces valid V1 input

TEST 5: End-to-End Flow (Mock Data)
═══════════════════════════════════════════════════════════
  Step 1: Build V1 input from pre-survey
    ✅ V1 input created
  Step 2: Calculate allocation
    ✅ Allocation calculated
  Step 3: Validate results
    Multiply:   45%
    Essentials: 40%
    Freedom:    4%
    Enjoyment:  11%
    Sum: 100%
    ✅ Sum equals 100%

✅ End-to-end flow working: Pre-survey → Mapping → Allocation

╔════════════════════════════════════════════════════════════╗
║                        TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════════╝
Total Tests: 5
✅ Passed: 5
❌ Failed: 0

🎉 ALL TESTS PASSED - Phase 1 is ready for Phase 2!
```

---

## Alternative: Individual Test Functions

If you prefer to run tests individually, you can also use these functions from `tests/Tool4Tests.js`:

### Test V1 Engine Only
```javascript
testAllocationEngine()
```

### Test Input Mapper
```javascript
testV1InputMapper()
```

### Test Helper Functions
```javascript
testHelperFunctions()
```

### Test End-to-End
```javascript
testEndToEndIntegration()
```

---

## Troubleshooting

### Error: "Tool4 is not defined"

**Cause:** Tool4.js not loaded properly

**Solution:**
1. Check that Tool4.js is in `tools/tool4/Tool4.js`
2. Make sure it was pushed to Apps Script
3. Try refreshing the Apps Script editor

### Error: "Tool4.buildV1Input is not a function"

**Cause:** Integration functions missing from Tool4 object

**Solution:**
1. Verify you're on the latest version (run `clasp pull` locally to check)
2. Check that Tool4.js contains the functions (lines 1751-1937)
3. Re-push with `clasp push --force`

### Error: "DataService is not defined"

**Cause:** DataService module not loaded

**Solution:**
1. Check that `core/DataService.js` exists
2. Make sure it's included in the Apps Script project
3. Try running from a different file/function

### Test Fails with "Sum is not 100%"

**Cause:** Rounding or calculation issue

**Solution:**
1. Check the actual percentages in the log
2. If off by 1%, this is likely a rounding edge case
3. Report the exact input values that caused the issue

---

## Next Steps After Testing

Once all tests pass:

✅ **Phase 1 is confirmed complete**

You can proceed to:
1. **Phase 2: Pre-Survey UI** - Build the 7-question form
2. **Test with real student data** - Use actual clientIds from RESPONSES sheet
3. **Validate allocations** - Compare outputs with V1 standalone app (if available)

---

## Manual Testing (Optional)

If you want to test with a real student's data:

```javascript
function testWithRealStudent() {
  // Get a real student ID from your RESPONSES sheet
  const clientId = '0391ES'; // Example: Evelia Salazar

  // Mock pre-survey (would come from actual form in Phase 2)
  const preSurvey = {
    incomeRange: 'B',
    essentialsRange: 'D',
    satisfaction: 3,
    discipline: 4,
    impulse: 3,
    longTerm: 5,
    goalTimeline: 'Within 6 months',
    selectedPriority: 'Feel Financially Secure'
  };

  // Test the flow
  const v1Input = Tool4.buildV1Input(clientId, preSurvey);
  Logger.log('V1 Input:', v1Input);

  const allocation = Tool4.calculateAllocationV1(v1Input);
  Logger.log('Allocation:', allocation.percentages);
  Logger.log('Notes:', allocation.lightNotes);
}
```

---

## Success Criteria

Phase 1 is ready when:

- ✅ All 5 validation tests pass
- ✅ No errors in execution log
- ✅ Percentages always sum to 100%
- ✅ Satisfaction amplification working (visible in logs)
- ✅ Helper functions return expected data types
- ✅ Input mapper handles missing data gracefully

---

**Created:** 2025-11-29
**Purpose:** Phase 1 validation in Google Apps Script
**Status:** Ready to test
