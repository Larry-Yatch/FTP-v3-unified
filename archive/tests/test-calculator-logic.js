/**
 * Test Interactive Calculator Redistribution Logic
 * Tests edge cases for Phase 3B implementation
 */

// Mock calculator state
let calculatorState = {
  buckets: {
    Multiply: 25,
    Essentials: 35,
    Freedom: 25,
    Enjoyment: 15
  },
  locked: {
    Multiply: false,
    Essentials: false,
    Freedom: false,
    Enjoyment: false
  }
};

// Helper: Get total of locked buckets
function getLockedTotal() {
  let total = 0;
  for (let key in calculatorState.locked) {
    if (calculatorState.locked[key]) {
      total += calculatorState.buckets[key];
    }
  }
  return total;
}

// Helper: Normalize allocations to sum to exactly 100%
function normalizeAllocations() {
  // First, round all values to whole numbers
  for (let key in calculatorState.buckets) {
    calculatorState.buckets[key] = Math.round(calculatorState.buckets[key]);
  }

  // Then check if total is exactly 100%
  let total = 0;
  for (let key in calculatorState.buckets) {
    total += calculatorState.buckets[key];
  }

  // If not exactly 100%, adjust the largest unlocked bucket
  if (total !== 100) {
    const diff = 100 - total;
    let largestUnlocked = null;
    let largestValue = -1;

    for (let key in calculatorState.buckets) {
      if (!calculatorState.locked[key] && calculatorState.buckets[key] > largestValue) {
        largestValue = calculatorState.buckets[key];
        largestUnlocked = key;
      }
    }

    if (largestUnlocked) {
      calculatorState.buckets[largestUnlocked] = Math.max(0, calculatorState.buckets[largestUnlocked] + diff);
    }
  }
}

// Main: Adjust bucket with proportional redistribution
function adjustBucket(bucketName, newValue) {
  newValue = parseFloat(newValue);
  const oldValue = calculatorState.buckets[bucketName];
  const delta = newValue - oldValue;

  // Update the adjusted bucket
  calculatorState.buckets[bucketName] = newValue;

  // Find unlocked buckets (excluding the one being adjusted)
  const unlockedBuckets = [];
  let unlockedTotal = 0;

  for (let key in calculatorState.buckets) {
    if (key !== bucketName && !calculatorState.locked[key]) {
      unlockedBuckets.push(key);
      unlockedTotal += calculatorState.buckets[key];
    }
  }

  // If there are unlocked buckets, redistribute proportionally
  if (unlockedBuckets.length > 0 && unlockedTotal > 0) {
    unlockedBuckets.forEach(key => {
      const proportion = calculatorState.buckets[key] / unlockedTotal;
      const adjustment = delta * proportion;
      calculatorState.buckets[key] = Math.max(0, calculatorState.buckets[key] - adjustment);
    });
  } else if (unlockedBuckets.length > 0) {
    // If all unlocked buckets are at 0, distribute evenly
    const evenShare = Math.max(0, (100 - newValue - getLockedTotal()) / unlockedBuckets.length);
    unlockedBuckets.forEach(key => {
      calculatorState.buckets[key] = evenShare;
    });
  }

  // Normalize to ensure total is exactly 100%
  normalizeAllocations();
}

// Helper: Print state
function printState(description) {
  const total = calculatorState.buckets.Multiply + calculatorState.buckets.Essentials +
                calculatorState.buckets.Freedom + calculatorState.buckets.Enjoyment;
  console.log(`\n${description}:`);
  console.log(`  M: ${calculatorState.buckets.Multiply}% ${calculatorState.locked.Multiply ? '🔒' : '🔓'}`);
  console.log(`  E: ${calculatorState.buckets.Essentials}% ${calculatorState.locked.Essentials ? '🔒' : '🔓'}`);
  console.log(`  F: ${calculatorState.buckets.Freedom}% ${calculatorState.locked.Freedom ? '🔒' : '🔓'}`);
  console.log(`  J: ${calculatorState.buckets.Enjoyment}% ${calculatorState.locked.Enjoyment ? '🔒' : '🔓'}`);
  console.log(`  Total: ${total}% ${total === 100 ? '✅' : '❌'}`);
}

// Reset state
function resetState() {
  calculatorState = {
    buckets: { Multiply: 25, Essentials: 35, Freedom: 25, Enjoyment: 15 },
    locked: { Multiply: false, Essentials: false, Freedom: false, Enjoyment: false }
  };
}

// ============ TESTS ============

console.log('='.repeat(60));
console.log('INTERACTIVE CALCULATOR REDISTRIBUTION TESTS');
console.log('='.repeat(60));

// Test 1: No locks - all buckets adjust proportionally
console.log('\n\n📋 TEST 1: No locks - increase Multiply from 25% to 40%');
resetState();
printState('Initial');
adjustBucket('Multiply', 40);
printState('After adjusting Multiply to 40%');
console.log('Expected: E, F, J decrease proportionally (roughly E:29%, F:21%, J:12%)');

// Test 2: One lock - locked bucket stays fixed
console.log('\n\n📋 TEST 2: Lock Essentials - increase Multiply from 25% to 40%');
resetState();
calculatorState.locked.Essentials = true;
printState('Initial (Essentials locked)');
adjustBucket('Multiply', 40);
printState('After adjusting Multiply to 40%');
console.log('Expected: E:35% (locked), F and J decrease proportionally');

// Test 3: Multiple locks - only unlocked buckets adjust
console.log('\n\n📋 TEST 3: Lock Multiply & Essentials - increase Freedom from 25% to 50%');
resetState();
calculatorState.locked.Multiply = true;
calculatorState.locked.Essentials = true;
printState('Initial (M & E locked)');
adjustBucket('Freedom', 50);
printState('After adjusting Freedom to 50%');
console.log('Expected: M:25% & E:35% locked, only J adjusts to 0% (or negative prevented)');

// Test 4: Edge case - adjust to 100% (all others become 0)
console.log('\n\n📋 TEST 4: Edge case - set Multiply to 100%');
resetState();
printState('Initial');
adjustBucket('Multiply', 100);
printState('After adjusting Multiply to 100%');
console.log('Expected: M:100%, E:0%, F:0%, J:0%');

// Test 5: Lock 3 buckets, adjust the 4th
console.log('\n\n📋 TEST 5: Lock M, E, F - adjust Enjoyment');
resetState();
calculatorState.locked.Multiply = true;
calculatorState.locked.Essentials = true;
calculatorState.locked.Freedom = true;
printState('Initial (M, E, F locked)');
adjustBucket('Enjoyment', 40);
printState('After adjusting Enjoyment to 40%');
console.log('Expected: J:40%, locked buckets sum to 85%, total = 125% → Should normalize!');
console.log('Note: This is an impossible scenario - user can\'t lock 3 and adjust 4th to >100%');

// Test 6: All at zero except one
console.log('\n\n📋 TEST 6: Start with all at 0 except Multiply at 100%, reduce Multiply to 40%');
resetState();
calculatorState.buckets = { Multiply: 100, Essentials: 0, Freedom: 0, Enjoyment: 0 };
printState('Initial (M:100%, others:0%)');
adjustBucket('Multiply', 40);
printState('After adjusting Multiply to 40%');
console.log('Expected: M:40%, E/F/J distribute 60% evenly (20% each)');

// Test 7: Proportional distribution maintains relative ratios
console.log('\n\n📋 TEST 7: Test proportional distribution (M:10%, E:60%, F:20%, J:10%)');
resetState();
calculatorState.buckets = { Multiply: 10, Essentials: 60, Freedom: 20, Enjoyment: 10 };
printState('Initial (unbalanced: E is 3x F, F is 2x M/J)');
adjustBucket('Multiply', 30);
printState('After increasing Multiply by 20%');
console.log('Expected: E loses most (75% of 20% = 15%), F loses 5%, J loses 2.5%');
console.log('Ratio preserved: E:45%, F:15%, J:7.5% (E still 3x F, F still 2x J)');

console.log('\n\n' + '='.repeat(60));
console.log('ALL TESTS COMPLETE');
console.log('='.repeat(60));
