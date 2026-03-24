# Tool6 Comprehensive Testing Plan

## Purpose

This document defines a systematic testing approach for Tool6's vehicle allocation logic. The complexity of 9 profiles × multiple input variations makes manual testing impractical. This plan combines **invariant-based testing** (rules that must always be true) with **golden file testing** (known-good outputs for specific scenarios).

---

## Part 1: Invariant-Based Tests

Invariants are rules that must **always** be true regardless of inputs. Run these against thousands of random input combinations to catch logic errors.

### 1.1 Tax Preference Invariants

| ID | Rule | Description |
|----|------|-------------|
| TAX-001 | If `taxPreference === 'Now'` and both IRA Roth and IRA Traditional are eligible, then `allocation['IRA Roth'] >= allocation['IRA Traditional']` | Roth-heavy should prioritize Roth |
| TAX-002 | If `taxPreference === 'Later'` and both IRA Roth and IRA Traditional are eligible, then `allocation['IRA Traditional'] >= allocation['IRA Roth']` | Traditional-heavy should prioritize Traditional |
| TAX-003 | If `taxPreference === 'Now'` and both 401(k) Roth and 401(k) Traditional are eligible, then `allocation['401(k) Roth'] >= allocation['401(k) Traditional']` | Roth-heavy should prioritize 401k Roth |
| TAX-004 | If `taxPreference === 'Later'` and both 401(k) Roth and 401(k) Traditional are eligible, then `allocation['401(k) Traditional'] >= allocation['401(k) Roth']` | Traditional-heavy should prioritize 401k Traditional |
| TAX-005 | If `taxPreference === 'Both'`, shared-limit vehicles should have roughly equal allocations (within 1% tolerance) | Balanced should split 50/50 |

### 1.2 Shared Limit Invariants

| ID | Rule | Description |
|----|------|-------------|
| LIMIT-001 | `allocation['IRA Roth'] + allocation['IRA Traditional'] + allocation['Backdoor Roth IRA'] <= IRA_ANNUAL_LIMIT / 12` | IRA family cannot exceed $7,000/year ($583.33/mo base, $666.67/mo with catch-up) |
| LIMIT-002 | `allocation['401(k) Roth'] + allocation['401(k) Traditional'] <= 401K_ANNUAL_LIMIT / 12` | 401k family cannot exceed $23,500/year ($1,958.33/mo base) |
| LIMIT-003 | `allocation['Solo 401(k) Employee (Roth)'] + allocation['Solo 401(k) Employee (Traditional)'] <= SOLO_401K_EMPLOYEE_LIMIT / 12` | Solo 401k employee contributions share limit |
| LIMIT-004 | For any vehicle with a defined `monthlyLimit`, `allocation[vehicle] <= monthlyLimit` | No vehicle exceeds its individual limit |

### 1.3 Eligibility Invariants

| ID | Rule | Description |
|----|------|-------------|
| ELIG-001 | If `hsaEligible !== 'Yes'`, then `allocation['HSA'] === 0` or HSA not in allocation | HSA requires HDHP eligibility |
| ELIG-002 | If `hasChildren !== 'Yes'`, then `allocation['529 Plan'] === 0` AND `allocation['Coverdell ESA'] === 0` | Education vehicles require children |
| ELIG-003 | If `has401k !== 'Yes'`, then no 401(k) vehicles should have allocation > 0 | 401k requires employer plan |
| ELIG-004 | If `hasRoth401k !== 'Yes'` AND `has401k === 'Yes'`, then `allocation['401(k) Roth'] === 0` | Roth 401k requires employer to offer it |
| ELIG-005 | If `profileId !== 1`, then `allocation['ROBS Distribution'] === 0` | ROBS only for Profile 1 |
| ELIG-006 | If `profileId !== 4`, then Solo 401(k) vehicles should have allocation === 0 | Solo 401k only for Profile 4 |
| ELIG-007 | If `profileId !== 3`, then SEP-IRA and SIMPLE IRA should have allocation === 0 | SEP/SIMPLE only for Profile 3 |

### 1.4 Priority Order Invariants

| ID | Rule | Description |
|----|------|-------------|
| PRIO-001 | If `401(k) Employer Match` is eligible and `monthlyBudget > 0`, it should be allocated before other discretionary vehicles | Match is always first priority |
| PRIO-002 | `Family Bank` should only have allocation > 0 if all other eligible vehicles are maxed OR `monthlyBudget` exceeds all vehicle limits | Family Bank is overflow only |
| PRIO-003 | If HSA is eligible, it should be allocated before IRA vehicles (HSA has triple tax advantage) | HSA priority over IRAs |
| PRIO-004 | If both Coverdell ESA and 529 Plan are eligible, Coverdell should be funded before 529 (Coverdell has $2k limit, 529 is unlimited) | Coverdell fills first in education waterfall |

### 1.5 Budget Invariants

| ID | Rule | Description |
|----|------|-------------|
| BUDGET-001 | `sum(all allocations) === monthlyBudget + sum(non-discretionary seeds)` | Total allocation equals available budget |
| BUDGET-002 | No allocation should be negative | All allocations >= 0 |
| BUDGET-003 | If `monthlyBudget === 0`, only non-discretionary seeds (employer match, ROBS Distribution) should have allocations. Seeds are pre-allocated regardless of discretionary budget. | Zero budget means no discretionary allocation, but seeds still apply |
| BUDGET-004 | Unspent Education budget cascades to Health, unspent Health budget cascades to Retirement, final overflow goes to Family Bank | Domain waterfall cascade verification |

### 1.6 Profile-Specific Invariants

| ID | Profile | Rule | Description |
|----|---------|------|-------------|
| PROF-001 | 8 (Roth Maximizer) | Roth vehicles should appear before Traditional in priority order | Profile 8 prioritizes Roth |
| PROF-002 | 5 (Bracket Strategist) | Traditional vehicles should appear before Roth in priority order | Profile 5 prioritizes Traditional |
| PROF-003 | 4 (Solo 401k) | Solo 401(k) vehicles should be present and prioritized | Profile 4 uses Solo 401k |
| PROF-004 | 6 (Catch-Up) | If age >= 50, catch-up limits should be applied | Catch-up contributor gets higher limits |
| PROF-005 | 9 (Late-Stage) | If age >= 55, HSA catch-up ($1,000 extra) should be applied | Late-stage gets HSA catch-up |

---

## Part 2: Golden File Test Matrix

These are specific scenarios with known-correct expected outputs. Store as JSON files and compare on each test run.

### 2.1 Test Scenario Structure

```javascript
{
  "scenarioId": "PROFILE8_NO401K_NOHSA_NOCHILDREN_ROTHHEAVY",
  "description": "Roth Maximizer with no employer benefits, Roth-heavy preference",
  "inputs": {
    "profileId": 8,
    "grossIncome": 80000,
    "monthlyBudget": 1950,
    "age": 35,
    "yearsToRetirement": 30,
    "filingStatus": "Single",
    "taxPreference": "Now",
    "has401k": "No",
    "hsaEligible": "No",
    "hasChildren": "No",
    "hasRoth401k": "No",
    "tradIRABalance": "none"
  },
  "expectedVehicleOrder": [
    "IRA Roth",
    "Family Bank"
  ],
  "expectedAllocations": {
    "IRA Roth": 583.33,
    "IRA Traditional": 0,
    "Family Bank": 1366.67
  },
  "expectedTotals": {
    "Retirement": 583.33,
    "Education": 0,
    "Health": 0,
    "Overflow": 1366.67
  }
}
```

### 2.2 Required Test Scenarios

#### Profile 7: Foundation Builder (Default)

| Scenario ID | 401k | HSA | Children | Tax Pref | Key Validation |
|-------------|------|-----|----------|----------|----------------|
| P7_FULL_BENEFITS_BALANCED | Yes+Roth | Yes | Yes | Both | All vehicles present, 50/50 split on shared limits |
| P7_FULL_BENEFITS_ROTH | Yes+Roth | Yes | Yes | Now | Roth prioritized over Traditional |
| P7_FULL_BENEFITS_TRAD | Yes+Roth | Yes | Yes | Later | Traditional prioritized over Roth |
| P7_NO_401K | No | Yes | Yes | Both | No 401k vehicles, IRA vehicles used |
| P7_NO_HSA | Yes+Roth | No | Yes | Both | No HSA, education vehicles present |
| P7_NO_CHILDREN | Yes+Roth | Yes | No | Both | No education vehicles |
| P7_MINIMAL | No | No | No | Both | Only IRA + Family Bank |

#### Profile 8: Roth Maximizer

| Scenario ID | 401k | HSA | Children | Tax Pref | Key Validation |
|-------------|------|-----|----------|----------|----------------|
| P8_FULL_BENEFITS | Yes+Roth | Yes | No | Now | Roth 401k maxed before Traditional |
| P8_NO_401K | No | No | No | Now | IRA Roth maxed, Traditional = 0 |
| P8_HIGH_INCOME_BACKDOOR | No | No | No | Now | Backdoor Roth used (income > phase-out) |
| P8_WITH_TRAD_IRA_BALANCE | No | No | No | Now | Pro-rata warning for backdoor |

#### Profile 4: Solo 401(k) Optimizer

| Scenario ID | HSA | Children | Tax Pref | Key Validation |
|-------------|-----|----------|----------|----------------|
| P4_ROTH_PREFERENCE | Yes | No | Now | Solo 401k Employee (Roth) only |
| P4_TRAD_PREFERENCE | Yes | No | Later | Solo 401k Employee (Traditional) only |
| P4_BALANCED | Yes | No | Both | Both Solo 401k Employee types, 50/50 |
| P4_WITH_EMPLOYER | Yes | No | Now | Solo 401k Employer contribution included |

**Solo 401(k) Employer Limit Scenarios** (test `MIN(20% of SE income, remaining room, $46.5k cap)`):

| Scenario ID | SE Income | Age | Key Validation |
|-------------|-----------|-----|----------------|
| P4_LOW_SE_INCOME | $50,000 | 35 | Employer = $10,000/yr (20%), room available |
| P4_HIGH_SE_INCOME | $300,000 | 35 | Employer capped at remaining room after $23.5k employee deferrals |
| P4_COMBINED_LIMIT | $250,000 | 35 | Employee + Employer total ≤ $70,000 |
| P4_CATCHUP_COMBINED | $250,000 | 55 | Employee + Employer total ≤ $77,500 (with catch-up) |

#### Profile 5: Bracket Strategist

| Scenario ID | 401k | HSA | Tax Pref | Key Validation |
|-------------|------|-----|----------|----------------|
| P5_FULL_BENEFITS | Yes | Yes | Later | Traditional prioritized |
| P5_NO_401K | No | Yes | Later | IRA Traditional maxed first |

#### Profile 6: Catch-Up Contributor (Age 50+)

| Scenario ID | Age | 401k | HSA | Key Validation |
|-------------|-----|------|-----|----------------|
| P6_AGE_50 | 50 | Yes+Roth | Yes | 401k limit = $2,583/mo ($31k/yr) |
| P6_AGE_55 | 55 | Yes+Roth | Yes | HSA limit includes $1k catch-up |
| P6_AGE_60 | 60 | Yes+Roth | Yes | 401k super catch-up ($34,750/yr) |
| P6_AGE_63 | 63 | Yes+Roth | Yes | 401k super catch-up still applies |
| P6_AGE_64 | 64 | Yes+Roth | Yes | Super catch-up ends, back to $31k |

#### Profile 9: Late-Stage Growth (Age 55+ or ≤5 years to retirement)

| Scenario ID | Age | Years to Ret | Key Validation |
|-------------|-----|--------------|----------------|
| P9_AGE_55 | 55 | 10 | HSA catch-up applied |
| P9_NEAR_RETIREMENT | 45 | 5 | Qualifies via years, not age |

#### Profile 1: ROBS-In-Use

| Scenario ID | Key Validation |
|-------------|----------------|
| P1_WITH_ROBS | ROBS Distribution appears in allocation |
| P1_WITH_401K | Can have both ROBS and 401k from W-2 job |

#### Profile 3: Business Owner with Employees

| Scenario ID | Key Validation |
|-------------|----------------|
| P3_SEP_IRA | SEP-IRA available |
| P3_SIMPLE_IRA | SIMPLE IRA available |

### 2.3 Edge Case Scenarios

| Scenario ID | Description | Key Validation |
|-------------|-------------|----------------|
| EDGE_ZERO_BUDGET | monthlyBudget = 0 | Only non-discretionary allocations (seeds still apply) |
| EDGE_TINY_BUDGET | monthlyBudget = 50 | Proper waterfall with small amount |
| EDGE_HUGE_BUDGET | monthlyBudget = 50000 | All vehicles maxed, overflow to Family Bank |
| EDGE_HIGH_INCOME_SINGLE | income = 200000, Single | Roth IRA phased out, use Backdoor |
| EDGE_HIGH_INCOME_MFJ | income = 300000, MFJ | Roth IRA phased out, use Backdoor |
| EDGE_INCOME_AT_PHASEOUT | income at exact phase-out threshold | Partial Roth eligibility |
| EDGE_TIEBREAKER_MAX_WEIGHT | User has 75%+ weight in one domain, selects it as tie-breaker | Weight caps at 80%, boost redistributes correctly |

**Roth IRA Phase-Out Edge Cases** (2025 limits: Single $150k-$165k, MFJ $236k-$246k):

| Scenario ID | Income | Filing Status | Key Validation |
|-------------|--------|---------------|----------------|
| EDGE_PHASEOUT_START_SINGLE | $150,000 | Single | Roth IRA at full limit, no Backdoor needed |
| EDGE_PHASEOUT_MID_SINGLE | $157,500 | Single | Roth IRA at ~50% limit (partial phase-out) |
| EDGE_PHASEOUT_END_SINGLE | $165,000 | Single | Roth IRA = $0, automatically switches to Backdoor |
| EDGE_PHASEOUT_START_MFJ | $236,000 | MFJ | Roth IRA at full limit |
| EDGE_PHASEOUT_MID_MFJ | $241,000 | MFJ | Roth IRA at ~50% limit |
| EDGE_PHASEOUT_END_MFJ | $246,000 | MFJ | Roth IRA = $0, switches to Backdoor |

### 2.4 Tax Preference Comparison Tests

These tests verify the **same user** produces different allocations based solely on tax preference. Run all three variations and compare results.

```javascript
{
  "scenarioId": "TAX_COMPARE_WITH_401K",
  "description": "Same user with 401k, testing all three tax preferences",
  "baseInputs": {
    "profileId": 7,
    "grossIncome": 100000,
    "monthlyBudget": 3000,
    "age": 35,
    "filingStatus": "Single",
    "has401k": "Yes",
    "hasRoth401k": "Yes",
    "hsaEligible": "Yes",
    "hasChildren": "No"
  },
  "variations": [
    {
      "taxPreference": "Now",
      "expectedBehavior": "401k Roth maxed ($1,958.33), 401k Trad = $0"
    },
    {
      "taxPreference": "Later",
      "expectedBehavior": "401k Trad maxed ($1,958.33), 401k Roth = $0"
    },
    {
      "taxPreference": "Both",
      "expectedBehavior": "401k Roth = $979.17, 401k Trad = $979.17 (50/50)"
    }
  ]
}
```

| Scenario ID | Base Profile | Key Validation |
|-------------|--------------|----------------|
| TAX_COMPARE_WITH_401K | Profile 7, has 401k + Roth 401k | 401k split changes with tax preference |
| TAX_COMPARE_IRA_ONLY | Profile 7, no 401k | IRA Roth vs IRA Trad changes with tax preference |
| TAX_COMPARE_SOLO_401K | Profile 4, self-employed | Solo 401k Employee (Roth) vs (Traditional) based on preference |

### 2.5 Backdoor Roth Warning Tests

These verify the correct warning message appears based on Traditional IRA balance and 401k rollover availability.

| Scenario ID | tradIRABalance | has401k | has401kAcceptsRollovers | Expected Warning |
|-------------|----------------|---------|-------------------------|------------------|
| BACKDOOR_NO_BALANCE | none | No | N/A | No warning |
| BACKDOOR_PRORATA_NO_ROLLOVER | over10k | No | N/A | PRO_RATA warning |
| BACKDOOR_ROLLOVER_AVAILABLE | over10k | Yes | Yes | ROLLOVER_AVAILABLE warning + action item |
| BACKDOOR_PRORATA_NO_ACCEPT | under10k | Yes | No | PRO_RATA warning |
| BACKDOOR_SMALL_BALANCE | under10k | No | N/A | PRO_RATA warning (still applies) |

---

## Part 3: Implementation Specification

### 3.1 File Structure

**Note:** Google Apps Script does not support separate JSON files or a `/tests/` directory structure well. All test code and scenarios should be embedded in the existing test file.

```
/tools/tool6/
  Tool6.js               # Main tool implementation
  Tool6Constants.js      # Constants and limits
  Tool6Tests.js          # ALL test code goes here (expand this file)
```

**Inside Tool6Tests.js, organize as:**

```javascript
// ========== TEST SCENARIOS (as JS objects) ==========
const GOLDEN_FILE_SCENARIOS = {
  profile7: [
    { scenarioId: 'P7_FULL_BENEFITS_BALANCED', inputs: {...}, expected: {...} },
    { scenarioId: 'P7_MINIMAL', inputs: {...}, expected: {...} },
    // ...
  ],
  profile8: [...],
  profile4: [...],
  // ... other profiles
  edgeCases: [...],
  taxComparison: [...],
  backdoorWarnings: [...]
};

// ========== INVARIANT CHECKERS ==========
function checkTaxPreferenceInvariants(inputs, allocation) { ... }
function checkSharedLimitInvariants(inputs, allocation) { ... }
function checkEligibilityInvariants(inputs, allocation) { ... }
function checkPriorityOrderInvariants(inputs, allocation) { ... }
function checkBudgetInvariants(inputs, allocation) { ... }
function checkProfileSpecificInvariants(inputs, allocation) { ... }

// ========== TEST UTILITIES ==========
function generateRandomInputs() { ... }
function checkAllInvariants(inputs, allocation) { ... }

// ========== TEST RUNNERS ==========
function runInvariantTests(iterations) { ... }
function runGoldenFileTests() { ... }
function runAllTool6Tests() { ... }  // Main entry point
```

### 3.2 Test Runner Implementation

#### 3.2.1 Invariant Test Runner

```javascript
/**
 * Run invariant tests against N random input combinations
 *
 * @param {number} iterations - Number of random inputs to test (default: 1000)
 * @returns {Object} Test results with pass/fail counts and failures
 */
function runInvariantTests(iterations = 1000) {
  const results = {
    passed: 0,
    failed: 0,
    failures: []
  };

  for (let i = 0; i < iterations; i++) {
    const inputs = generateRandomInputs();
    const allocation = Tool6.calculateAllocation(clientId, inputs, toolStatus);

    const invariantResults = checkAllInvariants(inputs, allocation);

    for (const result of invariantResults) {
      if (result.passed) {
        results.passed++;
      } else {
        results.failed++;
        results.failures.push({
          iteration: i,
          invariantId: result.id,
          inputs: inputs,
          allocation: allocation,
          message: result.message
        });
      }
    }
  }

  return results;
}
```

#### 3.2.2 Random Input Generator

```javascript
/**
 * Generate random valid inputs for testing
 * Ensures inputs are internally consistent (e.g., no Roth 401k without 401k)
 */
function generateRandomInputs() {
  const profileId = randomInt(1, 9);
  const age = randomInt(22, 70);
  const income = randomChoice([50000, 80000, 120000, 180000, 250000, 400000]);
  const has401k = randomChoice(['Yes', 'No']);
  const hasRoth401k = has401k === 'Yes' ? randomChoice(['Yes', 'No']) : 'No';
  const hsaEligible = randomChoice(['Yes', 'No']);
  const hasChildren = randomChoice(['Yes', 'No']);
  const taxPreference = randomChoice(['Now', 'Later', 'Both']);
  const filingStatus = randomChoice(['Single', 'MFJ', 'MFS', 'HoH']);
  const monthlyBudget = randomInt(500, 10000);

  // Profile-specific adjustments
  if (profileId === 4) {
    // Solo 401k profile shouldn't have employer 401k
    has401k = 'No';
  }

  return {
    profileId,
    age,
    grossIncome: income,
    monthlyBudget,
    yearsToRetirement: Math.max(1, 65 - age),
    filingStatus,
    taxPreference,
    a3_has401k: has401k,
    a6_hasRoth401k: hasRoth401k,
    a7_hsaEligible: hsaEligible,
    a8_hasChildren: hasChildren,
    a13b_tradIRABalance: randomChoice(['none', 'under10k', 'over10k'])
  };
}
```

#### 3.2.3 Invariant Checker

```javascript
/**
 * Check all invariants against an allocation result
 */
function checkAllInvariants(inputs, allocation) {
  const results = [];

  // TAX-001: Roth-heavy should prioritize Roth IRA
  if (inputs.taxPreference === 'Now') {
    const rothIRA = allocation.vehicles['IRA Roth'] || 0;
    const tradIRA = allocation.vehicles['IRA Traditional'] || 0;
    results.push({
      id: 'TAX-001',
      passed: rothIRA >= tradIRA,
      message: `Roth IRA (${rothIRA}) should be >= Traditional IRA (${tradIRA}) when taxPreference=Now`
    });
  }

  // LIMIT-001: IRA family limit
  const iraTotal = (allocation.vehicles['IRA Roth'] || 0) +
                   (allocation.vehicles['IRA Traditional'] || 0) +
                   (allocation.vehicles['Backdoor Roth IRA'] || 0);
  const iraLimit = getIRAMonthlyLimit(inputs.age);
  results.push({
    id: 'LIMIT-001',
    passed: iraTotal <= iraLimit + 0.01, // Small tolerance for rounding
    message: `IRA total (${iraTotal}) should be <= limit (${iraLimit})`
  });

  // ELIG-001: HSA eligibility
  if (inputs.a7_hsaEligible !== 'Yes') {
    const hsaAlloc = allocation.vehicles['HSA'] || 0;
    results.push({
      id: 'ELIG-001',
      passed: hsaAlloc === 0,
      message: `HSA allocation (${hsaAlloc}) should be 0 when not eligible`
    });
  }

  // ... continue for all invariants

  return results;
}
```

### 3.3 Golden File Test Runner

```javascript
/**
 * Run all golden file tests
 */
function runGoldenFileTests() {
  const scenarioFiles = loadAllScenarioFiles();
  const results = { passed: 0, failed: 0, failures: [] };

  for (const scenario of scenarioFiles) {
    const allocation = Tool6.calculateAllocation(
      'test-client',
      scenario.inputs,
      buildToolStatus(scenario.inputs)
    );

    // Compare vehicle order
    const actualOrder = Object.keys(allocation.vehicles)
      .filter(v => allocation.vehicles[v] > 0);

    // Compare allocations (with tolerance)
    for (const [vehicle, expected] of Object.entries(scenario.expectedAllocations)) {
      const actual = allocation.vehicles[vehicle] || 0;
      const tolerance = 1; // $1 tolerance for rounding

      if (Math.abs(actual - expected) > tolerance) {
        results.failed++;
        results.failures.push({
          scenarioId: scenario.scenarioId,
          vehicle: vehicle,
          expected: expected,
          actual: actual
        });
      } else {
        results.passed++;
      }
    }
  }

  return results;
}
```

---

## Part 4: Execution Instructions

### 4.1 Running Tests in Google Apps Script

Add to `Tool6Tests.js`:

```javascript
/**
 * Main test entry point - run from Script Editor
 */
function runAllTool6Tests() {
  console.log('=== TOOL 6 COMPREHENSIVE TEST SUITE ===\n');

  // Part 1: Invariant Tests
  console.log('--- INVARIANT TESTS (1000 iterations) ---');
  const invariantResults = runInvariantTests(1000);
  console.log(`Passed: ${invariantResults.passed}`);
  console.log(`Failed: ${invariantResults.failed}`);

  if (invariantResults.failures.length > 0) {
    console.log('\nFAILURES:');
    for (const failure of invariantResults.failures.slice(0, 10)) {
      console.log(`  ${failure.invariantId}: ${failure.message}`);
      console.log(`    Inputs: ${JSON.stringify(failure.inputs)}`);
    }
  }

  // Part 2: Golden File Tests
  console.log('\n--- GOLDEN FILE TESTS ---');
  const goldenResults = runGoldenFileTests();
  console.log(`Passed: ${goldenResults.passed}`);
  console.log(`Failed: ${goldenResults.failed}`);

  if (goldenResults.failures.length > 0) {
    console.log('\nFAILURES:');
    for (const failure of goldenResults.failures) {
      console.log(`  ${failure.scenarioId} - ${failure.vehicle}`);
      console.log(`    Expected: ${failure.expected}, Actual: ${failure.actual}`);
    }
  }

  // Summary
  const totalPassed = invariantResults.passed + goldenResults.passed;
  const totalFailed = invariantResults.failed + goldenResults.failed;
  console.log(`\n=== SUMMARY: ${totalPassed} passed, ${totalFailed} failed ===`);

  return totalFailed === 0;
}
```

### 4.2 Running Tests Locally (for development)

```bash
# From project root
cd /Users/Larry/code/FTP-v3

# Run tests via clasp
clasp run runAllTool6Tests
```

---

## Part 5: Maintenance

### 5.1 When to Update Golden Files

- When allocation logic **intentionally** changes
- When limits are updated for new tax year (e.g., 2025 → 2026)
- When new vehicles are added
- When profile behavior is intentionally modified

### 5.2 Adding New Invariants

When a bug is found:
1. Identify the invariant that should have caught it
2. Add the invariant to the appropriate section above
3. Implement the check in `invariant-checker.js`
4. Run the full test suite to ensure no regressions

### 5.3 Bug Found by Tests

The bug fixed on 2026-01-27 (Roth/Traditional 50/50 split ignoring tax preference) would have been caught by:
- **TAX-001**: If `taxPreference === 'Now'`, Roth IRA should be >= Traditional IRA
- **TAX-003**: If `taxPreference === 'Now'`, 401(k) Roth should be >= 401(k) Traditional

---

## Part 6: Quick Reference

### 6.1 Key Constants (2025)

| Limit | Annual | Monthly | With Catch-up (50+) | Super Catch-up (60-63) |
|-------|--------|---------|---------------------|------------------------|
| IRA (Roth/Traditional combined) | $7,000 | $583.33 | $8,000 / $666.67 | N/A |
| 401(k) (Roth/Traditional combined) | $23,500 | $1,958.33 | $31,000 / $2,583.33 | $34,750 / $2,895.83 |
| HSA (Individual) | $4,300 | $358.33 | $5,300 / $441.67 (55+) | N/A |
| HSA (Family) | $8,550 | $712.50 | $9,550 / $795.83 (55+) | N/A |
| Solo 401(k) Employee | $23,500 | $1,958.33 | Same as 401(k) | Same as 401(k) |

### 6.2 Profile Quick Reference

| ID | Name | Key Characteristics |
|----|------|---------------------|
| 1 | ROBS-In-Use | Using ROBS for business, has ROBS Distribution |
| 2 | ROBS-Curious | Interested in ROBS, shows rollover option |
| 3 | Business w/ Employees | SEP-IRA, SIMPLE IRA available |
| 4 | Solo 401(k) | Self-employed, Solo 401(k) vehicles |
| 5 | Bracket Strategist | Has Trad IRA, Traditional preference |
| 6 | Catch-Up | Age 50+, higher limits |
| 7 | Foundation Builder | Default profile |
| 8 | Roth Maximizer | Roth preference |
| 9 | Late-Stage | Near retirement (55+ or ≤5 years) |

---

## Part 7: Known Issues to Investigate

Before implementing tests, investigate these potential issues found during code review:

### 7.1 Profile 8 Classification Logic

In `Tool6.js` around line 869, `taxFocus === 'Both'` maps to Profile 8 (Roth Maximizer). This may be unintentional:

- **Current behavior:** `'Now'` OR `'Both'` → Profile 8 (Roth Maximizer)
- **Expected behavior:** `'Now'` → Profile 8, `'Both'` → Profile 7 (Foundation Builder)?

**Action:** Clarify with stakeholders whether "Both" should default to Roth-heavy (Profile 8) or balanced (Profile 7). Update tests accordingly.

### 7.2 Education Vehicle Priority Order

When user selects "both" Coverdell and 529, both are added to eligible vehicles but the priority order insertion may not guarantee Coverdell fills before 529. Verify in `getVehiclePriorityOrder()` that Coverdell appears before 529.

---

## Appendix: Implementation Checklist

### Phase 1: Setup (in Tool6Tests.js)
- [ ] Add `GOLDEN_FILE_SCENARIOS` object structure
- [ ] Implement `generateRandomInputs()` function
- [ ] Implement helper functions: `randomInt()`, `randomChoice()`

### Phase 2: Invariant Checkers (32 total invariants)
- [ ] `checkTaxPreferenceInvariants()` - TAX-001 through TAX-005
- [ ] `checkSharedLimitInvariants()` - LIMIT-001 through LIMIT-004
- [ ] `checkEligibilityInvariants()` - ELIG-001 through ELIG-007
- [ ] `checkPriorityOrderInvariants()` - PRIO-001 through PRIO-004
- [ ] `checkBudgetInvariants()` - BUDGET-001 through BUDGET-004
- [ ] `checkProfileSpecificInvariants()` - PROF-001 through PROF-005
- [ ] `checkAllInvariants()` - aggregates all checkers

### Phase 3: Golden File Scenarios
- [ ] Profile 7 scenarios (7 tests)
- [ ] Profile 8 scenarios (4 tests)
- [ ] Profile 4 scenarios (8 tests, including employer limit tests)
- [ ] Profile 5 scenarios (2 tests)
- [ ] Profile 6 scenarios (5 tests)
- [ ] Profile 9 scenarios (2 tests)
- [ ] Profile 1 scenarios (2 tests)
- [ ] Profile 3 scenarios (2 tests)
- [ ] Edge case scenarios (13 tests, including phase-out)
- [ ] Tax preference comparison scenarios (3 base cases × 3 variations)
- [ ] Backdoor warning scenarios (5 tests)

### Phase 4: Test Runners
- [ ] `runInvariantTests(iterations)` - random input fuzzing
- [ ] `runGoldenFileTests()` - scenario comparison
- [ ] `runAllTool6Tests()` - main entry point with summary

### Phase 5: Validation
- [ ] Run initial test suite
- [ ] Fix any failures (bugs or incorrect expected values)
- [ ] Document baseline results
- [ ] Investigate Profile 8 classification (Section 7.1)
- [ ] Verify education vehicle priority (Section 7.2)

### Estimated Test Counts
| Category | Count |
|----------|-------|
| Invariants (per iteration) | 32 |
| Invariant iterations | 1,000 |
| Golden file scenarios | ~50 |
| **Total assertions** | ~32,050 |
