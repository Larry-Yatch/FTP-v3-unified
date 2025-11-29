/**
 * Local test script for Tool4 integration layer
 * Run with: node test-integration.js
 */

// Simulate the Tool4 helper functions
const Tool4Helpers = {
  deriveGrowthFromTool2(tool2FormData) {
    if (!tool2FormData) return 5;
    const investmentActivity = tool2FormData.investmentActivity || 0;
    const savingsRegularity = tool2FormData.savingsRegularity || 0;
    const retirementFunding = tool2FormData.retirementFunding || 0;
    const avgScore = (investmentActivity + savingsRegularity + retirementFunding) / 3;
    return Math.round(((avgScore + 5) / 10) * 10);
  },

  deriveStabilityFromTool2(tool2FormData) {
    if (!tool2FormData) return 5;
    const emergencyFundMaintenance = tool2FormData.emergencyFundMaintenance || 0;
    const insuranceConfidence = tool2FormData.insuranceConfidence || 0;
    const debtTrending = tool2FormData.debtTrending || 0;
    const avgScore = (emergencyFundMaintenance + insuranceConfidence + debtTrending) / 3;
    return Math.round(((avgScore + 5) / 10) * 10);
  },

  deriveStageOfLife(tool2FormData) {
    if (!tool2FormData) return 'Adult';
    const age = tool2FormData.age || 30;
    const employment = tool2FormData.employment || 'full-time';
    if (employment === 'retired') return 'Retirement';
    if (age < 25) return 'Young Adult';
    if (age < 40) return 'Adult';
    if (age < 55) return 'Mid-Career';
    return 'Pre-Retirement';
  },

  mapEmergencyFundMonths(emergencyFundMonths) {
    if (!emergencyFundMonths && emergencyFundMonths !== 0) return 'C';
    if (emergencyFundMonths <= -3) return 'A';
    if (emergencyFundMonths <= -1) return 'B';
    if (emergencyFundMonths <= 1) return 'C';
    if (emergencyFundMonths <= 3) return 'D';
    return 'E';
  },

  mapIncomeStability(incomeConsistency) {
    if (!incomeConsistency && incomeConsistency !== 0) return 'Stable';
    if (incomeConsistency <= -2) return 'Unstable / irregular';
    if (incomeConsistency <= 2) return 'Stable';
    return 'Very stable';
  },

  deriveDebtLoad(currentDebts, debtStress) {
    if ((!currentDebts || currentDebts.trim() === '') && debtStress >= 3) {
      return 'A';
    }
    if (!currentDebts || currentDebts.trim() === '') {
      if (debtStress <= -3) return 'E';
      if (debtStress <= -1) return 'D';
      if (debtStress <= 1) return 'C';
      return 'B';
    }
    const debtText = currentDebts.toLowerCase();
    const hasMultipleDebts = (debtText.match(/,|;|and/g) || []).length >= 2;
    const hasMortgage = debtText.includes('mortgage') || debtText.includes('house');
    const hasCards = debtText.includes('card') || debtText.includes('credit');
    const hasStudent = debtText.includes('student') || debtText.includes('loan');
    const debtCount = (hasCards ? 1 : 0) + (hasStudent ? 1 : 0) + (hasMultipleDebts ? 1 : 0);
    if (debtStress <= -3 || debtCount >= 3) return 'E';
    if (debtStress <= -1 || debtCount === 2) return 'D';
    if (debtCount === 1 || hasMortgage) return 'C';
    return 'B';
  },

  deriveInterestLevel(debtStress) {
    if (!debtStress && debtStress !== 0) return 'Medium';
    if (debtStress <= -2) return 'High';
    if (debtStress <= 2) return 'Medium';
    return 'Low';
  }
};

// Test cases
console.log('=== Testing Tool4 Integration Helper Functions ===\n');

// Test 1: Growth derivation
console.log('Test 1: deriveGrowthFromTool2');
const testData1 = {
  investmentActivity: 4,
  savingsRegularity: 3,
  retirementFunding: 2
};
const growth = Tool4Helpers.deriveGrowthFromTool2(testData1);
console.log(`  Input: investmentActivity=4, savingsRegularity=3, retirementFunding=2`);
console.log(`  Average: ${(4+3+2)/3} → Normalized: ${growth}/10`);
console.log(`  Expected: 8-9, Got: ${growth}`);
console.log(`  ✓ ${growth >= 8 && growth <= 9 ? 'PASS' : 'FAIL'}\n`);

// Test 2: Stability derivation
console.log('Test 2: deriveStabilityFromTool2');
const testData2 = {
  emergencyFundMaintenance: 3,
  insuranceConfidence: 2,
  debtTrending: 1
};
const stability = Tool4Helpers.deriveStabilityFromTool2(testData2);
console.log(`  Input: emergencyFundMaintenance=3, insuranceConfidence=2, debtTrending=1`);
console.log(`  Average: ${(3+2+1)/3} → Normalized: ${stability}/10`);
console.log(`  Expected: 6-7, Got: ${stability}`);
console.log(`  ✓ ${stability >= 6 && stability <= 7 ? 'PASS' : 'FAIL'}\n`);

// Test 3: Stage of life
console.log('Test 3: deriveStageOfLife');
const tests3 = [
  { age: 22, employment: 'part-time', expected: 'Young Adult' },
  { age: 35, employment: 'full-time', expected: 'Adult' },
  { age: 50, employment: 'business-owner', expected: 'Mid-Career' },
  { age: 60, employment: 'full-time', expected: 'Pre-Retirement' },
  { age: 70, employment: 'retired', expected: 'Retirement' }
];
tests3.forEach(test => {
  const stage = Tool4Helpers.deriveStageOfLife(test);
  const pass = stage === test.expected;
  console.log(`  Age ${test.age}, ${test.employment}: ${stage} ${pass ? '✓' : '✗ (expected: ' + test.expected + ')'}`);
});
console.log();

// Test 4: Emergency fund mapping
console.log('Test 4: mapEmergencyFundMonths');
const tests4 = [
  { input: -4, expected: 'A', desc: '0-1 months' },
  { input: -2, expected: 'B', desc: '1-2 months' },
  { input: 0, expected: 'C', desc: '2-3 months' },
  { input: 2, expected: 'D', desc: '3-6 months' },
  { input: 5, expected: 'E', desc: '6+ months' }
];
tests4.forEach(test => {
  const tier = Tool4Helpers.mapEmergencyFundMonths(test.input);
  const pass = tier === test.expected;
  console.log(`  Input: ${test.input} → ${tier} (${test.desc}) ${pass ? '✓' : '✗'}`);
});
console.log();

// Test 5: Income stability
console.log('Test 5: mapIncomeStability');
const tests5 = [
  { input: -4, expected: 'Unstable / irregular' },
  { input: 0, expected: 'Stable' },
  { input: 4, expected: 'Very stable' }
];
tests5.forEach(test => {
  const stability = Tool4Helpers.mapIncomeStability(test.input);
  const pass = stability === test.expected;
  console.log(`  Input: ${test.input} → ${stability} ${pass ? '✓' : '✗'}`);
});
console.log();

// Test 6: Debt load
console.log('Test 6: deriveDebtLoad');
const tests6 = [
  { debts: '', stress: 4, expected: 'A', desc: 'No debt' },
  { debts: 'mortgage $200k', stress: 0, expected: 'C', desc: 'Mortgage only' },
  { debts: 'credit card: $5000, student loan: $20000', stress: -2, expected: 'D', desc: 'Multiple debts + stress' },
  { debts: 'credit card, student loan, car loan', stress: -4, expected: 'E', desc: 'Multiple debts + severe stress' }
];
tests6.forEach(test => {
  const load = Tool4Helpers.deriveDebtLoad(test.debts, test.stress);
  const pass = load === test.expected;
  console.log(`  ${test.desc}: ${load} ${pass ? '✓' : '✗ (expected: ' + test.expected + ')'}`);
});
console.log();

// Test 7: Interest level
console.log('Test 7: deriveInterestLevel');
const tests7 = [
  { input: -4, expected: 'High' },
  { input: 0, expected: 'Medium' },
  { input: 4, expected: 'Low' }
];
tests7.forEach(test => {
  const level = Tool4Helpers.deriveInterestLevel(test.input);
  const pass = level === test.expected;
  console.log(`  Debt stress: ${test.input} → ${level} ${pass ? '✓' : '✗'}`);
});
console.log();

console.log('=== All Tests Complete ===');
