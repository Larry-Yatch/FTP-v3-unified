# Tool 4: Implementation Details - Critical Specifications

**Date:** November 25, 2025
**Purpose:** Define all implementation details missing from main spec
**Status:** ✅ Complete - Ready for Development

---

## 🎯 Purpose

This document fills critical gaps in the Tool 4 specification by providing exact implementation details for:
- Surplus calculation
- Category validation rules
- Modifier calculation order
- Custom allocation validation
- Scenario naming conventions
- Error handling strategies

**This is required reading before starting implementation.**

---

## 📐 1. Surplus Calculation (CRITICAL)

### **Definition**

```javascript
/**
 * Surplus is the amount of income remaining after current essentials.
 * Used for progressive unlock of priorities.
 *
 * Formula: Surplus = Monthly Income - Current Essentials
 *
 * Where:
 * - Monthly Income: Student's self-reported monthly income
 * - Current Essentials: What student actually spends on essentials now
 *
 * NOT:
 * - Recommended essentials (target allocation)
 * - Income minus (essentials + debt payments)
 * - Any other variation
 */
function calculateSurplus(income, currentEssentials) {
  return income - currentEssentials;
}
```

### **Why This Definition**

1. **Simple to understand:** "Money left after bills"
2. **Based on current state:** Uses actual spending, not targets
3. **Unlocks are realistic:** Tied to what student has today, not aspirational
4. **Avoids circular dependency:** Surplus doesn't depend on priority selection

### **Example**

```javascript
Student enters:
  Monthly Income: $5,000
  Current Essentials: $2,700

Surplus = $5,000 - $2,700 = $2,300

This surplus unlocks priorities requiring:
  ✅ $500 surplus: "Feel Financially Secure"
  ✅ $800 surplus: "Build Long-Term Wealth"
  ✅ $1,500 surplus: "Save for Big Goal"
  ✅ $2,000 surplus: "Create Generational Wealth"
```

---

## 📊 2. Category Spending Estimate Validation

### **Validation Rules**

```javascript
/**
 * Category estimates must approximately match current essentials.
 * Allows small tolerance to avoid frustrating exact-match requirement.
 */

const CATEGORY_VALIDATION = {
  // Tolerance: $50 OR 2% of essentials (whichever is larger)
  getTolerance(essentials) {
    return Math.max(50, essentials * 0.02);
  },

  validate(categories, essentials) {
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    const tolerance = this.getTolerance(essentials);
    const difference = Math.abs(total - essentials);

    return {
      isValid: difference <= tolerance,
      difference: difference,
      tolerance: tolerance,
      total: total,
      expected: essentials
    };
  }
};
```

### **User Experience**

**Scenario A: Within tolerance**
```
Essentials: $2,500
Categories total: $2,480 (diff: $20)
Tolerance: $50
Result: ✅ No warning
```

**Scenario B: Outside tolerance**
```
Essentials: $2,500
Categories total: $2,350 (diff: $150)
Tolerance: $50
Result: ⚠️ Warning shown

UI Display:
┌────────────────────────────────────────┐
│ ⚠️ Category Total Doesn't Match        │
│                                        │
│ Your categories total: $2,350          │
│ Current essentials: $2,500             │
│ Difference: $150 unaccounted for       │
│                                        │
│ [Auto-Distribute $150] [Continue]     │
└────────────────────────────────────────┘
```

**Auto-Distribute Logic:**
```javascript
function autoDistribute(categories, essentials) {
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
  const difference = essentials - total;

  if (difference === 0) return categories;

  // Distribute proportionally to non-zero categories
  const nonZeroCategories = Object.entries(categories).filter(([k, v]) => v > 0);
  const totalNonZero = nonZeroCategories.reduce((sum, [k, v]) => sum + v, 0);

  const adjusted = {...categories};
  nonZeroCategories.forEach(([key, value]) => {
    const proportion = value / totalNonZero;
    adjusted[key] = Math.round(value + (difference * proportion));
  });

  return adjusted;
}
```

### **Pre-Population Strategy**

When student enters "Current Essentials" amount, suggest typical breakdown:

```javascript
const TYPICAL_SPLITS = {
  // Based on income tier
  lowIncome: { // <$3,500/mo
    rent: 0.45,      // 45% of essentials
    groceries: 0.20,
    dining: 0.05,
    transport: 0.15,
    utilities: 0.08,
    insurance: 0.05,
    subscriptions: 0.02,
    other: 0.00
  },
  midIncome: { // $3,500-$7,000/mo
    rent: 0.40,
    groceries: 0.18,
    dining: 0.08,
    transport: 0.15,
    utilities: 0.07,
    insurance: 0.08,
    subscriptions: 0.04,
    other: 0.00
  },
  highIncome: { // >$7,000/mo
    rent: 0.35,
    groceries: 0.15,
    dining: 0.10,
    transport: 0.15,
    utilities: 0.06,
    insurance: 0.12,
    subscriptions: 0.05,
    other: 0.02
  }
};

function suggestCategorySplit(income, essentials) {
  const tier = income < 3500 ? 'lowIncome'
             : income < 7000 ? 'midIncome'
             : 'highIncome';

  const splits = TYPICAL_SPLITS[tier];
  const suggested = {};

  Object.entries(splits).forEach(([category, percentage]) => {
    suggested[category] = Math.round(essentials * percentage);
  });

  return suggested;
}
```

---

## 🧮 3. Modifier Calculation Order

### **Step-by-Step Process**

```javascript
function calculateModifiers(inputs, toolData) {
  // STEP 1: Initialize modifier object
  const mods = { M: 0, E: 0, F: 0, J: 0 };
  const notes = { M: [], E: [], F: [], J: [] };

  // STEP 2: Apply Financial Modifiers (6 modifiers)
  applyFinancialModifiers(mods, notes, inputs);
  // Example: Low income → M -5

  // STEP 3: Apply Behavioral Modifiers (9 modifiers)
  applyBehavioralModifiers(mods, notes, toolData);
  // Example: High discipline → M +10

  // STEP 4: Apply Motivational Modifiers (8 modifiers)
  applyMotivationalModifiers(mods, notes, inputs, toolData);
  // Example: Growth orientation → M +10

  // At this point: M = -5 + 10 + 10 = +15 (for example)

  // STEP 5: Apply Satisfaction Amplifier (trauma-informed)
  const satisfaction = inputs.satisfaction || toolData.tool1?.satisfaction || 5;

  if (satisfaction >= 7) {
    // Check for overwhelm trauma patterns
    const traumaWinner = toolData.tool1?.winner;
    const fearScore = toolData.tool1?.scores?.Fear || 0;
    const controlScore = toolData.tool1?.scores?.Control || 0;

    const isOverwhelmed =
      traumaWinner === 'Fear' || traumaWinner === 'Control' ||
      fearScore > 10 || controlScore > 10;

    if (isOverwhelmed) {
      // High dissatisfaction + trauma = BOOST STABILITY (not amplify)
      mods.E += 10;
      mods.F += 10;
      notes.E.push('Trauma-informed: Boosting stability due to overwhelm');
      notes.F.push('Trauma-informed: Boosting safety due to high stress');
    } else {
      // High dissatisfaction + no overwhelm = AMPLIFY POSITIVE MODIFIERS
      const satFactor = 1 + Math.min((satisfaction - 5) * 0.1, 0.3); // Max 1.3x

      Object.keys(mods).forEach(bucket => {
        if (mods[bucket] > 0) {
          const original = mods[bucket];
          mods[bucket] = Math.round(mods[bucket] * satFactor);
          notes[bucket].push(`Satisfaction amplifier: ${original} → ${mods[bucket]}`);
        }
      });
    }
  }

  // STEP 6: Apply Caps (±50/±20)
  Object.keys(mods).forEach(bucket => {
    if (mods[bucket] > 50) {
      notes[bucket].push(`Capped at +50 (was ${mods[bucket]})`);
      mods[bucket] = 50;
    } else if (mods[bucket] < -20) {
      notes[bucket].push(`Capped at -20 (was ${mods[bucket]})`);
      mods[bucket] = -20;
    }
  });

  return { modifiers: mods, notes: notes };
}
```

### **Example Calculation**

```javascript
Input:
  Income: $5,000
  Satisfaction: 8 (high dissatisfaction)
  Tool 1 Winner: "Grounding" (no trauma)
  Discipline: 9/10
  Long-Term Focus: 8/10

Step 1: mods = {M:0, E:0, F:0, J:0}

Step 2-4: Apply modifiers
  Discipline 9: M +10
  Long-Term Focus 8: M +10
  mods = {M:20, E:0, F:0, J:0}

Step 5: Satisfaction amplifier (no trauma)
  satFactor = 1 + (8-5)*0.1 = 1.3
  M = 20 × 1.3 = 26
  mods = {M:26, E:0, F:0, J:0}

Step 6: Apply caps
  M = 26 (within ±50, no cap)

Final: {M:+26, E:0, F:0, J:0}
```

---

## 🎛️ 4. Custom Allocation Validation

### **Validation Rules**

```javascript
const CUSTOM_ALLOCATION_RULES = {
  // Must total 100% (allow ±1% for rounding)
  totalRange: { min: 99, max: 101 },

  // Minimum per bucket (realistic constraints)
  minimums: {
    M: 0,   // Can allocate 0% if in crisis
    E: 15,  // Must have SOME essentials (unrealistic to go below 15%)
    F: 0,   // Can allocate 0% if no debt/goal
    J: 0    // Can allocate 0% if in crisis
  },

  // Maximum per bucket (prevent absurd allocations)
  maximums: {
    M: 60,  // Don't allocate more than 60% to investments
    E: 80,  // If above 80%, probably not truly essential
    F: 80,  // Max 80% to freedom bucket
    J: 50   // Max 50% to enjoyment (unrealistic above this)
  },

  // Validation function
  validate(allocation) {
    const {M, E, F, J} = allocation;
    const total = M + E + F + J;
    const errors = [];
    const warnings = [];

    // Check total
    if (total < this.totalRange.min || total > this.totalRange.max) {
      errors.push(`Total must be 100% (currently ${total}%)`);
    }

    // Check minimums
    if (E < this.minimums.E) {
      errors.push(`Essentials must be at least ${this.minimums.E}% (you have ${E}%)`);
    }

    // Check maximums
    Object.keys(this.maximums).forEach(bucket => {
      if (allocation[bucket] > this.maximums[bucket]) {
        warnings.push(`${bucket} allocation of ${allocation[bucket]}% seems very high (max recommended: ${this.maximums[bucket]}%)`);
      }
    });

    // Realistic warnings
    if (E < 25) {
      warnings.push(`Essentials at ${E}% may be unrealistic for most people. Can you truly live on ${E}% of income?`);
    }

    if (J > 30) {
      warnings.push(`Enjoyment at ${J}% is quite high. Consider if this aligns with your stated financial priority.`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }
};
```

### **User Experience**

```html
<!-- Real-time feedback as student adjusts sliders -->
<div class="validation-feedback">
  <div class="total-display">
    Total: <span id="totalPercent" class="ok">100%</span> ✓
  </div>

  <!-- If errors -->
  <div class="errors" style="display: none;">
    <div class="error">❌ Total must be 100% (currently 103%)</div>
  </div>

  <!-- If warnings -->
  <div class="warnings" style="display: none;">
    <div class="warning">⚠️ Essentials at 18% may be unrealistic</div>
  </div>
</div>
```

---

## 📝 5. Scenario Naming Convention

### **Rules**

```javascript
const SCENARIO_NAMING = {
  // Default if student doesn't provide name
  getDefaultName(count) {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return `Scenario ${count + 1} (${date})`;
  },

  // Character limit
  maxLength: 50,

  // Allow duplicates (append timestamp if duplicate)
  handleDuplicate(name, existingNames) {
    const isDuplicate = existingNames.includes(name);
    if (!isDuplicate) return name;

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${name} (${timestamp})`;
  },

  // Sanitize input
  sanitize(name) {
    return name
      .trim()
      .slice(0, this.maxLength)
      .replace(/[<>]/g, ''); // Remove HTML chars
  }
};
```

### **Examples**

```javascript
// Student leaves name blank
→ "Scenario 1 (Nov 25)"

// Student enters "My Debt Plan" (unique)
→ "My Debt Plan"

// Student enters "My Debt Plan" again (duplicate)
→ "My Debt Plan (02:15 PM)"

// Student enters very long name
→ Truncated to 50 characters
```

---

## ⚠️ 6. Error Handling Strategy

### **Input Validation Errors**

```javascript
function validateInputs(inputs) {
  const errors = [];

  // Income validation
  if (!inputs.income || inputs.income <= 0) {
    errors.push({
      field: 'income',
      message: 'Income must be greater than $0',
      suggestion: 'Enter your monthly take-home income'
    });
  }

  if (inputs.income > 1000000) {
    errors.push({
      field: 'income',
      message: 'Income seems unusually high',
      suggestion: 'Enter monthly income (not annual)'
    });
  }

  // Essentials validation
  if (inputs.essentials < 0) {
    errors.push({
      field: 'essentials',
      message: 'Essentials cannot be negative'
    });
  }

  if (inputs.essentials > inputs.income * 1.5) {
    errors.push({
      field: 'essentials',
      message: 'Essentials exceed 150% of income',
      suggestion: 'This may include non-essential spending. Review categories.'
    });
  }

  // Debt validation
  if (inputs.debt < 0) {
    errors.push({
      field: 'debt',
      message: 'Debt cannot be negative (enter 0 if no debt)'
    });
  }

  // Emergency fund validation
  if (inputs.emergencyFund < 0) {
    errors.push({
      field: 'emergencyFund',
      message: 'Emergency fund cannot be negative (enter 0 if none)'
    });
  }

  return errors;
}
```

### **Calculation Errors**

```javascript
function handleCalculationError(error) {
  console.error('Calculation error:', error);

  // Show user-friendly message
  showError({
    title: 'Calculation Error',
    message: 'We encountered an issue calculating your allocation. This has been logged.',
    actions: [
      { label: 'Try Again', action: 'recalculate' },
      { label: 'Reset Inputs', action: 'reset' }
    ]
  });

  // Log to server for debugging
  google.script.run
    .withFailureHandler(() => {})
    .logError('Tool4', 'calculation', error.toString(), getUserInputs());
}
```

### **Save Errors**

```javascript
function handleSaveError(error) {
  let userMessage = 'We couldn't save your scenario. ';

  if (error.message.includes('timeout')) {
    userMessage += 'The server took too long to respond. Please try again.';
  } else if (error.message.includes('permission')) {
    userMessage += 'You may not have permission. Contact support.';
  } else {
    userMessage += 'An unexpected error occurred. Your work is saved locally - try again in a moment.';
  }

  showError({
    title: 'Save Failed',
    message: userMessage,
    actions: [
      { label: 'Retry Save', action: 'retrySave' },
      { label: 'Download Backup', action: 'downloadJSON' }
    ]
  });

  // Save to localStorage as backup
  localStorage.setItem('tool4_backup', JSON.stringify({
    timestamp: new Date().toISOString(),
    data: getCurrentScenarioData()
  }));
}
```

### **Missing Tool Data Errors**

```javascript
function handleMissingToolData(toolId) {
  // This shouldn't happen if backup questions work correctly
  console.warn(`Missing ${toolId} data even after backup check`);

  // Use safe defaults
  const defaults = {
    tool1: {
      winner: 'Grounding',
      scores: { Fear: 3, Control: 3, FSV: 3, ExVal: 3, Showing: 3, Receiving: 3 },
      satisfaction: 5
    },
    tool2: {
      archetype: 'Financial Clarity Seeker',
      spendingClarity: 0,
      discipline: 5
    },
    tool3: {
      overallQuotient: 50
    }
  };

  return defaults[toolId];
}
```

---

## 🎯 7. Summary - Quick Reference

**For developers:**

| Topic | Rule |
|-------|------|
| **Surplus** | Income - Current Essentials |
| **Category Tolerance** | ±$50 or ±2% (whichever larger) |
| **Category UX** | Warning + auto-distribute option |
| **Modifier Order** | Sum → Amplify → Cap |
| **Custom Total** | 99-101% acceptable |
| **Custom E Minimum** | 15% minimum |
| **Scenario Naming** | Auto-generate if blank |
| **Duplicate Names** | Append timestamp |
| **Error Strategy** | User-friendly + log + backup |

---

**Document Complete:** November 25, 2025
**Status:** ✅ Ready for Implementation
**Next:** Review TOOL4-SERVER-API.md for function signatures
