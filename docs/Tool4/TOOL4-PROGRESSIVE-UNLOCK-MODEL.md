# Tool 4: Progressive Priority Unlock Model

**Date:** November 17, 2025
**Status:** New Framework - Replaces Static Priority Selection
**Key Insight:** Not all priorities should be available to all students. Financial health determines access.

---

## 🎯 **Core Concept**

**Priorities are UNLOCKED based on financial health indicators.**

Instead of asking "What's your priority?" and letting anyone choose anything, we:

1. **Analyze student's financial data** (income, debt, emergency fund, etc.)
2. **Unlock appropriate priorities** (3-5 priorities available based on their situation)
3. **Lock inappropriate priorities** (with clear requirements to unlock them)
4. **Recommend the best fit** (from available priorities)
5. **Update dynamically** (as they adjust sliders, priorities unlock/lock in real-time)

---

## 📊 **For Each Priority, We Define Three Things:**

### **1. Base Weights (M/E/F/J percentages)**
The allocation percentages when this priority is selected.

### **2. Unlock Requirements**
What conditions must be met for this priority to appear as an option?

### **3. Recommendation Triggers**
When should we auto-suggest this priority (from the unlocked set)?

---

## 🔓 **The 10 Priorities - Progressive Unlock Framework**

### **TIER 1: Always Available (Crisis/Entry Level)**

These priorities are available to EVERYONE, regardless of financial situation.

---

#### **Priority 1: Stabilize to Survive**

**Base Weights:**
```
M: 5%   (Minimum wealth-building, focus on present)
E: 60%  (High essentials for crisis mode - UPDATED 11/18/25)
F: 30%  (Build emergency fund - UPDATED 11/18/25)
J: 5%   (Minimal enjoyment - UPDATED 11/18/25)
```

**Unlock Requirements:**
```javascript
// ALWAYS AVAILABLE (no requirements)
unlocked = true;
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (emergencyFund < 1_month_expenses &&
    (income < 3500 || essentials > income * 0.7)) {
  recommend = "Stabilize to Survive";
}
```

**Target Student:**
- Income: $2,000-$3,500/month
- Emergency Fund: $0-$1,000
- Debt: Any amount
- Situation: Crisis mode, tight budget, recovering from trauma

---

#### **Priority 2: Reclaim Financial Control**

**Base Weights:**
```
M: 10%  (Minimal investing, focus on stability)
E: 45%  (Trauma-informed essentials - UPDATED 11/18/25)
F: 35%  (Freedom focus - UPDATED 11/18/25)
J: 10%  (Reduced for control focus - UPDATED 11/18/25)
```

**Unlock Requirements:**
```javascript
// ALWAYS AVAILABLE (especially for trauma recovery)
// But may be RECOMMENDED based on Tool 1/2/3 data
unlocked = true;
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (tool1Winner === 'Fear' || tool1Winner === 'Control' ||
    tool2Archetype === 'Money Vigilance' ||
    satisfaction >= 7) { // High dissatisfaction = need for control
  recommend = "Reclaim Financial Control";
}
```

**Target Student:**
- Recovering from financial trauma/abuse
- High Fear or Control trauma pattern (Tool 1)
- Need to rebuild sense of agency
- Any income level

---

#### **Priority 3: Get Out of Debt**

**Base Weights:**
```
M: 15%  (Minimum investing, focus on debt)
E: 35%  (Sustainable essentials - UPDATED 11/18/25)
F: 40%  (Aggressive debt payoff focus)
J: 10%  (Reduced to maintain F - UPDATED 11/18/25)
```

**Unlock Requirements:**
```javascript
// Available when debt exists
if (debtAmount > 5000) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (debtAmount > income * 6 &&
    interestRate === 'High' &&
    emergencyFund >= 1_month_expenses) { // Has minimal safety net
  recommend = "Get Out of Debt";
}
```

**Target Student:**
- Debt: $5,000+ (especially high-interest)
- Emergency Fund: At least 1 month (basic safety)
- Income: Sufficient to make progress
- Ready to prioritize debt elimination

---

### **TIER 2: Requires Basic Stability**

These priorities unlock when student has achieved basic financial stability.

---

#### **Priority 4: Feel Financially Secure**

**Base Weights:**
```
M: 25%  (Balanced wealth-building)
E: 35%  (Comfortable essentials)
F: 30%  (Build robust emergency fund)
J: 10%  (Low enjoyment, security-focused)
```

**Unlock Requirements:**
```javascript
// Requires basic stability
if (emergencyFund >= 1_month_expenses &&
    essentials <= income * 0.6) { // Not overspending on essentials
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (emergencyFund >= 1_month_expenses &&
    emergencyFund < 3_months_expenses &&
    debtAmount < income * 4) { // Manageable debt
  recommend = "Feel Financially Secure";
}
```

**Target Student:**
- Emergency Fund: 1-3 months expenses
- Debt: Manageable or none
- Moving from crisis to stability
- Focus: Build safety net

---

#### **Priority 5: Create Life Balance**

**Base Weights:**
```
M: 15%  (Minimum investing)
E: 25%  (Efficient essentials)
F: 25%  (Moderate emergency fund)
J: 35%  (High enjoyment - life balance priority)
```

**Unlock Requirements:**
```javascript
// Requires stability + low debt
if (emergencyFund >= 2_months_expenses &&
    debtAmount < income * 3 &&
    essentials <= income * 0.5) { // Room for enjoyment
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (satisfaction >= 7 && // High dissatisfaction with current balance
    income >= 4000 &&
    emergencyFund >= 2_months_expenses) {
  recommend = "Create Life Balance";
}
```

**Target Student:**
- Stable financial situation
- Values work-life balance
- Can afford higher enjoyment spending
- Not in growth/debt-focus mode

---

#### **Priority 6: Build/Stabilize Business**

**Base Weights:**
```
M: 20%  (Moderate investing - includes business reinvestment)
E: 30%  (Moderate personal essentials)
F: 35%  (High freedom - business emergency fund critical)
J: 15%  (Moderate enjoyment)
```

**Unlock Requirements:**
```javascript
// Requires business ownership OR intent to start
// (Could be triggered by question: "Do you own/plan to start a business?")
if (isBusiness Owner || planningBusiness) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (isBusinessOwner &&
    incomeStability === 'Unstable / irregular') { // Variable income
  recommend = "Build/Stabilize Business";
}
```

**Target Student:**
- Business owner or entrepreneur
- Variable income from business
- Need business emergency fund
- Reinvestment focus

---

### **TIER 3: Requires Strong Financial Foundation**

These priorities unlock when student has solid emergency fund + manageable debt.

---

#### **Priority 7: Save for a Big Goal**

**Base Weights:**
```
M: 25%  (Moderate investing - savings can grow)
E: 25%  (Efficient essentials)
F: 40%  (High freedom - saving for specific goal)
J: 10%  (Low enjoyment - sacrifice for goal)
```

**Unlock Requirements:**
```javascript
// Requires emergency fund + manageable debt
if (emergencyFund >= 3_months_expenses &&
    debtAmount < income * 3) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
// (This one might be manual selection only - hard to auto-detect "big goal")
// OR if student enters a goal in form: "Saving for: [House/Car/Wedding/etc.]"
if (hasBigGoalEntered &&
    emergencyFund >= 3_months_expenses) {
  recommend = "Save for a Big Goal";
}
```

**Target Student:**
- Emergency Fund: 3+ months
- Debt: Low or none
- Specific goal: House down payment, car, wedding, etc.
- Timeline: 1-5 years

---

#### **Priority 8: Build Long-Term Wealth**

**Base Weights:**
```
M: 40%  (High investing - wealth focus)
E: 25%  (Efficient essentials)
F: 20%  (Moderate freedom - already have emergency fund)
J: 15%  (Low enjoyment - delayed gratification)
```

**Unlock Requirements:**
```javascript
// Requires strong foundation
if (emergencyFund >= 6_months_expenses &&
    debtAmount < income * 2 &&
    income >= 4000) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (emergencyFund >= 6_months_expenses &&
    debtAmount === 0 &&
    income >= 5000 &&
    age < 50) { // Time for compounding
  recommend = "Build Long-Term Wealth";
}
```

**Target Student:**
- Emergency Fund: 6+ months (solid)
- Debt: Minimal or none
- Income: $4,000+/month
- Ready for aggressive wealth building

---

#### **Priority 9: Enjoy Life Now**

**Base Weights:**
```
M: 20%  (Moderate investing)
E: 20%  (Low essentials - ONLY available to those who can sustain this)
F: 15%  (Low freedom - already stable)
J: 45%  (Very high enjoyment - lifestyle priority)
```

**Unlock Requirements:**
```javascript
// Requires ability to sustain low essentials + high enjoyment
if (emergencyFund >= 3_months_expenses &&
    debtAmount < income * 2 &&
    essentials <= income * 0.35 && // Can actually live on 20% E
    income >= 5000) { // High enough income
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// RARELY auto-recommend (this is a conscious choice)
// Only if:
if (satisfaction >= 8 && // Very dissatisfied
    tool3Quotient === 'High' && // Strong financial self-view
    emergencyFund >= 6_months_expenses &&
    debtAmount === 0) {
  recommend = "Enjoy Life Now"; // "You've earned it"
}
```

**Target Student:**
- Very stable financial foundation
- Low actual essentials (roommates, LCOL area, efficient lifestyle)
- High income relative to needs
- Values present experiences over future wealth

**NOTE:** This priority is INTENTIONALLY hard to unlock because 20% E is only realistic for specific situations.

---

### **TIER 4: Requires High Income + Established Wealth**

This priority unlocks only for high earners with significant financial foundation.

---

#### **Priority 10: Create Generational Wealth**

**Base Weights:**
```
M: 50%  (Maximum investing - legacy focus)
E: 20%  (Low essentials - established efficiency)
F: 20%  (Low freedom - already have safety net)
J: 10%  (Low enjoyment - sacrifice for legacy)
```

**Unlock Requirements:**
```javascript
// Requires high income + strong foundation
if (emergencyFund >= 12_months_expenses &&
    debtAmount === 0 &&
    income >= 8000) { // High earner
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Recommend when:
if (income >= 10000 &&
    emergencyFund >= 12_months_expenses &&
    debtAmount === 0 &&
    age < 55) { // Time to build legacy
  recommend = "Create Generational Wealth";
}
```

**Target Student:**
- Income: $8,000+/month (high earner)
- Emergency Fund: 12+ months (extremely stable)
- Debt: $0 (completely clear)
- Focus: Building legacy for children/family

---

## 🎮 **How Progressive Unlock Works - User Experience**

### **Example: Student Journey**

**Starting Point:**
```
Income: $3,000/month
Essentials: $2,100/month (70%)
Emergency Fund: $500
Debt: $25,000

Available Priorities (4):
✅ Stabilize to Survive (RECOMMENDED)
✅ Reclaim Financial Control
✅ Get Out of Debt
✅ Feel Financially Secure (barely unlocked)

Locked Priorities (6):
🔒 Build Long-Term Wealth
   ↳ Requires: Emergency fund ≥ $18,000 (6 months)
🔒 Save for a Big Goal
   ↳ Requires: Emergency fund ≥ $9,000 (3 months)
🔒 Create Life Balance
   ↳ Requires: Emergency fund ≥ $6,000 + Debt < $9,000
🔒 Enjoy Life Now
   ↳ Requires: Emergency fund ≥ $9,000 + Essentials ≤ $1,050
🔒 Build/Stabilize Business
   ↳ Requires: Business ownership
🔒 Create Generational Wealth
   ↳ Requires: Income ≥ $8,000 + Emergency fund ≥ $36,000
```

**Student selects: "Stabilize to Survive"**
```
Your Allocation:
M: 5%  = $150/month
E: 50% = $1,500/month (⚠️ You report $2,100 - consider reducing)
F: 35% = $1,050/month (Emergency fund + debt)
J: 10% = $300/month
```

**3 Months Later - Student Updates:**
```
Income: $3,500/month (raise!)
Essentials: $1,800/month (reduced!)
Emergency Fund: $3,200 (saved!)
Debt: $22,000 (paying down!)

✨ New Priority Unlocked:
✅ Create Life Balance (now available!)

Still Locked (but closer):
🔒 Save for a Big Goal
   ↳ Progress: 36% complete (need $5,800 more in emergency fund)
🔒 Build Long-Term Wealth
   ↳ Progress: 15% complete
```

**System Recommendation:**
```
💡 Great progress! You've built emergency savings and reduced essentials.

Consider shifting to: "Feel Financially Secure"
Why: Focus on building 3-month emergency fund ($10,500) before
      aggressive debt payoff. This gives you stability to handle
      unexpected expenses without adding more debt.

[Use Recommendation] [Keep Current Priority]
```

---

## 📋 **Next Steps for Optimization**

Now that we have the progressive unlock framework, we need to:

1. **Validate/Adjust Unlock Requirements** - Are these thresholds realistic?
2. **Validate/Adjust Base Weights** - Do these allocations serve each priority's intent?
3. **Validate/Adjust Recommendation Triggers** - When should we auto-suggest each priority?
4. **Handle Edge Cases** - What if NO priorities are unlocked? (shouldn't happen, but safety)
5. **Test with Real Scenarios** - Does the progression feel natural?

---

## 🎯 **Key Questions to Answer:**

1. **Are the unlock requirements too strict or too loose?**
   - Example: "Build Long-Term Wealth" requires 6 months emergency fund - is that right?

2. **Should some priorities be removed entirely?**
   - Do we need both "Enjoy Life Now" AND "Create Life Balance"?
   - Do we need both "Feel Secure" AND "Reclaim Control"?

3. **Should priorities auto-select on unlock?**
   - When "Save for Big Goal" unlocks, auto-switch to it? Or just make available?

4. **What happens if student's situation degrades?**
   - Lost job, emergency fund depleted - priorities lock again?
   - Should we prompt: "Your situation changed - consider shifting to crisis mode"?

5. **Top 2 ranking - how does unlock work?**
   - Pick top 2 from available priorities only?
   - Weighted 70%/30% or 60%/40%?

---

**This framework ensures students can't select inappropriate priorities, while maintaining agency within appropriate choices.**

**Ready to validate these unlock requirements and base weights?**
