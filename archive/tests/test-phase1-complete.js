/**
 * Phase 1 Completion Test - Verify Integration Functions Exist
 *
 * This test validates that all 8 integration functions have been added to Tool4.js
 * and are accessible as methods on the Tool4 object.
 */

const fs = require('fs');
const path = require('path');

console.log('=== Phase 1 Integration Functions Verification ===\n');

// Read Tool4.js file
const tool4Path = path.join(__dirname, 'tools/tool4/Tool4.js');
const tool4Content = fs.readFileSync(tool4Path, 'utf8');

// List of required functions
const requiredFunctions = [
  'calculateAllocationV1',
  'buildV1Input',
  'deriveGrowthFromTool2',
  'deriveStabilityFromTool2',
  'deriveStageOfLife',
  'mapEmergencyFundMonths',
  'mapIncomeStability',
  'deriveDebtLoad',
  'deriveInterestLevel'
];

console.log('Checking for required functions in Tool4.js:\n');

let allFound = true;
const results = [];

requiredFunctions.forEach((funcName) => {
  // Check for function definition in the Tool4 object
  const pattern1 = new RegExp(`\\s+${funcName}\\s*\\([^)]*\\)\\s*{`, 'm');
  const pattern2 = new RegExp(`\\s+${funcName}:\\s*function`, 'm');

  const found = pattern1.test(tool4Content) || pattern2.test(tool4Content);

  if (found) {
    // Find line number
    const lines = tool4Content.split('\n');
    let lineNumber = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(funcName + '(') || lines[i].includes(funcName + ':')) {
        lineNumber = i + 1;
        break;
      }
    }

    results.push({
      name: funcName,
      found: true,
      line: lineNumber
    });
    console.log(`✅ ${funcName.padEnd(30)} - Line ${lineNumber}`);
  } else {
    results.push({
      name: funcName,
      found: false,
      line: -1
    });
    console.log(`❌ ${funcName.padEnd(30)} - NOT FOUND`);
    allFound = false;
  }
});

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));

const foundCount = results.filter(r => r.found).length;
console.log(`Functions found: ${foundCount}/${requiredFunctions.length}`);

if (allFound) {
  console.log('\n✅ Phase 1 COMPLETE - All integration functions exist!');
  console.log('\nFunction locations:');
  console.log(`  - calculateAllocationV1: Line ${results[0].line}`);
  console.log(`  - buildV1Input: Line ${results[1].line}`);
  console.log(`  - Helper functions: Lines ${results[2].line}-${results[8].line}`);

  console.log('\n📋 Next Steps:');
  console.log('  1. Run tests in Apps Script editor:');
  console.log('     - testAllocationEngine()');
  console.log('     - testV1InputMapper()');
  console.log('     - testHelperFunctions()');
  console.log('     - testEndToEndIntegration()');
  console.log('  2. Test with real student data');
  console.log('  3. Update specification with correct line numbers');
  console.log('  4. Proceed to Phase 2: Pre-Survey UI');

  process.exit(0);
} else {
  console.log('\n❌ Phase 1 INCOMPLETE - Missing functions detected!');
  console.log('\nMissing functions:');
  results.filter(r => !r.found).forEach(r => {
    console.log(`  - ${r.name}`);
  });
  process.exit(1);
}
