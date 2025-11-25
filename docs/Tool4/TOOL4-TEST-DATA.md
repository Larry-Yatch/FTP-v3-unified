# Tool 4: Test Data and Expected Outputs

**Date:** November 25, 2025
**Purpose:** Provide test student profiles with expected results for validation
**Status:** ✅ Complete - Ready for Testing

---

## 🎯 Purpose

This document provides 8 test student profiles covering:
- Different income levels (low, mid, high)
- Different financial situations (debt, no debt, emergency fund levels)
- Edge cases (zero income, massive debt, etc.)
- Expected unlock/allocation results for each

Use these to validate Tool 4 implementation.

---

## 👤 Test Profile 1: Crisis Mode Student

### **Input Data**
```javascript
{
  clientId: 'TEST001',
  income: 2500,
  essentials: 2200,
  debt: 15000,
  interestRate: 'High',
  emergencyFund: 0,
  stability: 'Unstable',
  categories: {
    rent: 1000,
    groceries: 450,
    dining: 200,
    transport: 300,
    utilities: 150,
    insurance: 50,
    subscriptions: 50,
    other: 0
  }
}
```

### **Expected Calculations**
- **Surplus:** $2,500 - $2,200 = **$300**
- **Emergency Fund (months):** $0 / $2,200 = **0 months**

### **Expected Unlocked Priorities**
```
✅ Stabilize to Survive (Always available)
✅ Reclaim Financial Control (Always available)
✅ Get Out of Debt (Debt > $5,000)
🔒 Feel Financially Secure (Need: $300 surplus ✅, 1mo emergency ❌)
🔒 All others (Higher requirements)
```

### **Expected Recommended Priority**
**"Stabilize to Survive"** (Crisis mode: low income, no emergency fund)

### **Expected Base Allocation** (Stabilize to Survive)
```
M: 5%
E: 60%
F: 30%
J: 5%
```

### **Expected Modifiers**
- Low income (A): M -5
- High interest debt: F +10
- No emergency fund: F +10
- Unstable income: E +5, F +5

### **Expected Final Allocation** (after modifiers + normalization)
```
M: 0% ($0)
E: 65% ($1,625)
F: 30% ($750)
J: 5% ($125)
```

### **Expected Gap Analysis**
```
Current E: $2,200
Recommended E: $1,625
Gap: Need to reduce $575
```

---

## 👤 Test Profile 2: Debt Payoff Focus

### **Input Data**
```javascript
{
  clientId: 'TEST002',
  income: 5000,
  essentials: 2700,
  debt: 25000,
  interestRate: 'High',
  emergencyFund: 3000,
  stability: 'Stable'
}
```

### **Expected Calculations**
- **Surplus:** $5,000 - $2,700 = **$2,300**
- **Emergency Fund (months):** $3,000 / $2,700 = **1.1 months**

### **Expected Unlocked Priorities**
```
✅ Stabilize to Survive
✅ Reclaim Financial Control
✅ Get Out of Debt (Debt > $5,000 ✅)
✅ Feel Financially Secure (Surplus ✅, 1mo emergency ✅)
✅ Save for Big Goal (Surplus > $1,500 ✅, Need 3mo emergency ❌)
🔒 Build Long-Term Wealth (Need: 6mo emergency + $800 surplus)
```

### **Expected Recommended Priority**
**"Get Out of Debt"** (High debt, high interest, basic emergency fund in place)

### **Expected Final Allocation**
```
M: 15% ($750)
E: 35% ($1,750)
F: 40% ($2,000)
J: 10% ($500)
```

### **Expected Gap**
```
Current E: $2,700
Recommended E: $1,750
Gap: Reduce $950
```

---

## 👤 Test Profile 3: Stable Mid-Income

### **Input Data**
```javascript
{
  clientId: 'TEST003',
  income: 5500,
  essentials: 2000,
  debt: 8000,
  interestRate: 'Medium',
  emergencyFund: 12000,
  stability: 'Very Stable'
}
```

### **Expected Calculations**
- **Surplus:** $5,500 - $2,000 = **$3,500**
- **Emergency Fund (months):** $12,000 / $2,000 = **6 months**

### **Expected Unlocked Priorities**
```
✅ All Tier 1-2 priorities
✅ Feel Financially Secure (6mo emergency ✅)
✅ Build Long-Term Wealth (6mo emergency ✅, surplus ✅)
✅ Save for Big Goal (3mo emergency ✅)
🔒 Create Generational Wealth (Need: 12mo emergency, $2,000 surplus)
```

### **Expected Recommended Priority**
**"Build Long-Term Wealth"** (Strong foundation, ready for growth)

### **Expected Final Allocation**
```
M: 40% ($2,200)
E: 25% ($1,375)
F: 20% ($1,100)
J: 15% ($825)
```

---

## 👤 Test Profile 4: High Earner, No Debt

### **Input Data**
```javascript
{
  clientId: 'TEST004',
  income: 10000,
  essentials: 3000,
  debt: 0,
  interestRate: 'N/A',
  emergencyFund: 50000,
  stability: 'Very Stable'
}
```

### **Expected Calculations**
- **Surplus:** $10,000 - $3,000 = **$7,000**
- **Emergency Fund (months):** $50,000 / $3,000 = **16.7 months**

### **Expected Unlocked Priorities**
```
✅ ALL priorities unlocked (meets all requirements)
```

### **Expected Recommended Priority**
**"Create Generational Wealth"** (High income, strong foundation, no debt)

### **Expected Final Allocation**
```
M: 50% ($5,000)
E: 20% ($2,000)
F: 20% ($2,000)
J: 10% ($1,000)
```

---

## 👤 Test Profile 5: Edge Case - Zero Income

### **Input Data**
```javascript
{
  clientId: 'TEST005',
  income: 0,
  essentials: 0,
  debt: 0,
  interestRate: 'N/A',
  emergencyFund: 0,
  stability: 'Unstable'
}
```

### **Expected Behavior**
- **Error:** "Income must be greater than $0"
- **Cannot proceed** with calculator until valid income entered
- Show helpful message: "Enter your monthly take-home income"

---

## 👤 Test Profile 6: Edge Case - Essentials Exceed Income

### **Input Data**
```javascript
{
  clientId: 'TEST006',
  income: 3000,
  essentials: 4500,
  debt: 20000,
  emergencyFund: 0,
  stability: 'Unstable'
}
```

### **Expected Calculations**
- **Surplus:** $3,000 - $4,500 = **-$1,500** (negative!)

### **Expected Unlocked Priorities**
```
✅ Stabilize to Survive (Always available)
✅ Reclaim Financial Control (Always available)
🔒 All others (Need positive surplus)
```

### **Expected Warning**
"⚠️ Your essentials ($4,500) exceed your income ($3,000). You're likely going into debt each month. Focus on reducing essentials immediately."

---

## 👤 Test Profile 7: Trauma-Informed Test (Fear Pattern)

### **Input Data**
```javascript
{
  clientId: 'TEST007',
  income: 4000,
  essentials: 2500,
  debt: 10000,
  interestRate: 'Medium',
  emergencyFund: 1000,
  stability: 'Variable',

  // Tool 1 data
  tool1: {
    winner: 'Fear',
    scores: { Fear: 18, Control: 7, FSV: 3, ExVal: 2, Showing: 2, Receiving: 3 },
    satisfaction: 9 // High dissatisfaction + Fear = Overwhelmed
  }
}
```

### **Expected Modifiers**
- Fear winner: Check for overwhelm
- Satisfaction 9 + Fear high: **Trauma-informed boost** (E +10, F +10)
- **No satisfaction amplifier** (overwhelmed, not motivated)

### **Expected Allocation**
```
Priority: "Reclaim Financial Control"
Base: M:10%, E:45%, F:35%, J:10%
After trauma boost: E:55%, F:45%, M:0%, J:0%
(Extreme stability focus due to trauma + dissatisfaction)
```

---

## 👤 Test Profile 8: Backup Questions Test

### **Input Data**
```javascript
{
  clientId: 'TEST008',
  income: 4500,
  essentials: 2200,
  debt: 5000,

  // NO Tools 1/2/3 data
  tool1: null,
  tool2: null,
  tool3: null,

  // Backup answers
  backupAnswers: {
    backup_trauma_pattern: 'FSV',
    backup_fear_intensity: 5,
    backup_control_intensity: 6,
    backup_fsv_intensity: 9,
    backup_showing_intensity: 7,
    backup_satisfaction: 7,

    backup_spending_pattern: 'emotional',
    backup_emotional_spending: 'often',
    backup_discipline: 'medium',
    backup_impulse_control: 4,
    backup_long_term_focus: 5,
    backup_lifestyle_priority: 6,

    backup_financial_confidence: 'medium'
  }
}
```

### **Expected Mapped Data**
```javascript
// Tool 1 (from backup)
{
  winner: 'FSV',
  scores: {
    Fear: 6,  // Adjusted from base + intensity
    Control: 7,
    FSV: 14, // Adjusted from base + intensity
    Showing: 13,
    ExVal: 3,
    Receiving: 2
  },
  satisfaction: 7
}

// Tool 2 (from backup)
{
  archetype: 'Money Avoidance',
  spendingClarity: -2,
  emotionalSpending: 7,
  discipline: 5
}

// Tool 3 (from backup)
{
  overallQuotient: 50
}
```

### **Expected Modifiers**
- FSV winner: J -5 (reduce status spending)
- Emotional spending (7): Apply behavioral modifier
- Discipline (5): Neutral modifier

### **Expected Note in Report**
```
⚠️ Data Sources:
- Tool 1: Backup Questions (6 questions)
- Tool 2: Backup Questions (6 questions)
- Tool 3: Backup Questions (1 question)

For more accurate results, complete the full Tools 1-3.
```

---

## ✅ Testing Checklist

Use these profiles to verify:

- [ ] Surplus calculation correct for all profiles
- [ ] Progressive unlock works correctly
- [ ] Recommended priority matches expected
- [ ] Modifiers apply correctly
- [ ] Trauma-informed amplifier works (Profile 7)
- [ ] Backup question mapping works (Profile 8)
- [ ] Edge cases handled gracefully (Profiles 5, 6)
- [ ] Gap analysis calculates correctly
- [ ] All profiles save to TOOL4_SCENARIOS successfully
- [ ] RESPONSES sheet updates on first save

---

## 🎯 Quick Test Script

```javascript
// Run all test profiles
function runAllTests() {
  const profiles = [
    testProfile1_CrisisMode(),
    testProfile2_DebtPayoff(),
    testProfile3_StableMid(),
    testProfile4_HighEarner(),
    testProfile5_ZeroIncome(),
    testProfile6_ExceedIncome(),
    testProfile7_TraumaInformed(),
    testProfile8_BackupQuestions()
  ];

  const results = profiles.map(profile => {
    const result = calculateAllocation(profile);
    return {
      profile: profile.clientId,
      passed: validateResult(result, profile.expected),
      result: result
    };
  });

  console.log('Test Results:', results);
  return results;
}
```

---

**Document Complete:** November 25, 2025
**Status:** ✅ Ready for Testing
**Next:** Run these tests after Week 4 implementation
