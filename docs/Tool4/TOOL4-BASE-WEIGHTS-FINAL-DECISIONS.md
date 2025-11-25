# Tool 4: Base Priority Weightings - Final Decisions

**Date:** November 17-18, 2025
**Sessions:** 1 (Framework) + 2 (Implementation Details) + 3 (Base Weight Validation)
**Status:** ✅ FINALIZED - Ready for Implementation
**Version:** 3.1 (Validated Base Weights)

**🔄 LATEST UPDATE (11/18/25):** Session 3 validated base weights with 20 realistic scenarios. Three priorities adjusted for realistic allocations. See BASE-WEIGHTS-SCENARIO-TESTING.md for full analysis.

**Previous Updates:**
- Session 2: Added complete unlock requirements, recommendation triggers, and Tool 2 fallback questions

---

## 🎯 **Executive Summary**

This document captures ALL final decisions from the base weights optimization session. This is the **source of truth** for Tool 4 implementation.

### **Major Framework Decisions:**

1. ✅ **Progressive Unlock Model** - Priorities lock/unlock based on student's financial data
2. ✅ **Hybrid Priority Selection** - System suggests, student can override (Option B)
3. ✅ **Single Priority Selection** - Students select ONE priority (simplified from Top 2 ranking - see UPDATE below)
4. ✅ **Hybrid Allocation UX** - Show recommended + adjusted allocations, offer 3 paths
5. ✅ **Surplus-Based Unlocks** - Low threshold barriers for access
6. ✅ **Keep All 10 Priorities** - No merging, all serve distinct purposes

**⚠️ UPDATE (Nov 25, 2025):** Decision #3 changed from "Top 2 Priority Ranking" to "Single Priority Selection" for simplicity. Top 2 ranking (70%/30% weighting) was deemed too complex for students. See TOOL4-FINAL-SPECIFICATION.md for implementation details.

### **Key Innovation:**

**Tool 4 is trauma-informed, progressive, and educational:**
- Students can't select inappropriate priorities (locked until data supports it)
- System recommends best fit, but student has final say (agency + guidance)
- Shows BOTH what they should aim for AND what they can do today
- Tracks progress over time as they optimize spending

---

## 📋 **Table of Contents**

1. [Core Framework Decisions](#1-core-framework-decisions)
2. [Priority Selection System](#2-priority-selection-system)
3. [Allocation Model - Recommended vs Adjusted](#3-allocation-model)
4. [The 10 Priorities - Complete Specifications](#4-the-10-priorities)
5. [Progressive Unlock Logic](#5-progressive-unlock-logic)
6. [Hybrid Allocation UX - 3 Paths](#6-hybrid-allocation-ux)
7. [Surplus Calculation & Thresholds](#7-surplus-calculation)
8. [Tool 2 Integration](#8-tool-2-integration)
9. [Modifiers System](#9-modifiers-system)
10. [Still To Be Defined](#10-still-to-be-defined)

---

## 1. Core Framework Decisions

### **Decision 1.1: Progressive Unlock Model** ✅

**Question:** Should all priorities be available to all students?

**Answer:** NO - Priorities unlock based on financial data.

**Rationale:**
- Prevents students from selecting unrealistic priorities
- Maintains agency within appropriate choices
- Educational - shows what they need to achieve to unlock new options
- Trauma-informed - guides without forcing

**Example:**
```
Student: $3,000 income, $2,500 essentials, $0 emergency fund

Available:
✅ Stabilize to Survive
✅ Reclaim Financial Control
✅ Get Out of Debt (if debt exists)

Locked:
🔒 Build Long-Term Wealth (need $800 surplus + 6mo emergency fund)
🔒 Create Generational Wealth (need $2,000 surplus + 12mo emergency fund)
```

---

### **Decision 1.2: Priority Selection System** ✅

**Question:** How do students select their priority?

**Answer:** **Option B - Hybrid (Suggested + Manual Override)**

**How It Works:**
1. Student enters financial data (income, essentials, debt, emergency fund, etc.)
2. System analyzes data and RECOMMENDS a priority
3. Shows WHY that priority is recommended
4. Student can ACCEPT recommendation OR choose different priority from unlocked options
5. If student chooses different priority, show comparison side-by-side

**Rationale:**
- Balances guidance with autonomy
- Educates student on their financial situation
- Trauma-informed: empowers choice while providing safety
- Reduces decision paralysis with expert recommendation

**Rejected Alternatives:**
- ❌ Option A (Auto-calculate only): Removes all agency
- ❌ Option C (Pure manual): No guidance, students may choose poorly

---

### **Decision 1.3: Single Priority vs Top 3 Ranking** ✅

**Question:** Should students select one priority or rank multiple?

**Answer:** **Rank Top 2 Priorities** (70%/30% weighting)

**Rationale:**
- More nuanced than single priority
- Not overwhelming like top 3
- 70%/30% gives clear hierarchy (primary priority dominant)
- Reflects reality: "I'm focused on debt BUT also building emergency fund"

**Calculation:**
```javascript
Priority #1: "Get Out of Debt"    → M:15, E:30, F:40, J:15
Priority #2: "Feel Secure"        → M:25, E:35, F:30, J:10

Weighted Base Weights (70%/30%):
M = (15 × 0.7) + (25 × 0.3) = 10.5 + 7.5 = 18%
E = (30 × 0.7) + (35 × 0.3) = 21 + 10.5 = 31.5%
F = (40 × 0.7) + (30 × 0.3) = 28 + 9 = 37%
J = (15 × 0.7) + (10 × 0.3) = 10.5 + 3 = 13.5%
```

**Rejected Alternative:**
- ❌ Top 3 (50%/30%/20%): Too complex, dilutes primary priority too much

---

### **Decision 1.4: Allocation Model** ✅

**Question:** Do we allocate the full income or just the surplus?

**Answer:** **Option A - Allocate Full Income**

**How It Works:**
```
Student Input:
- Income: $5,000/month
- Essentials (actual): $3,000/month
- Surplus: $2,000

System Shows:
Recommended Allocation (based on priority):
M: 40% × $5,000 = $2,000
E: 25% × $5,000 = $1,250 ⚠️ (they spend $3,000)
F: 20% × $5,000 = $1,000
J: 15% × $5,000 = $750

⚠️ Alert: You spend $1,750 MORE on essentials than recommended.
   Tool 2 suggests: Subscriptions ($200), Dining ($400), Shopping ($500)
```

**Rationale:**
- Shows student what they SHOULD be spending vs what they ARE spending
- Tool 2 integration helps identify overspending
- Educational: "Your essentials aren't really essentials"
- Challenges lifestyle creep
- Gives target to work toward

**Rejected Alternative:**
- ❌ Option B (Allocate surplus only): Accepts their essentials as fixed, misses optimization opportunity

---

### **Decision 1.5: Keep All 10 Priorities** ✅

**Question:** Should we merge similar priorities?

**Answer:** NO - Keep all 10 priorities (they're distinct enough)

**Analysis:**

**"Feel Financially Secure" vs "Reclaim Financial Control"**
- Different weights (M:25 vs M:10, F:30 vs F:40)
- Different unlock (basic stability vs always available)
- Different use case (moving from crisis to stability vs trauma recovery)
- **DECISION: Keep both** ✅

**"Enjoy Life Now" vs "Create Life Balance"**
- Different weights (J:45 vs J:35, E:20 vs E:25)
- Different unlock (very strict vs moderate)
- Different use case (extreme enjoyment focus vs balanced living)
- **DECISION: Keep both** ✅

---

## 2. Priority Selection System

### **Complete Flow:**

```
┌─────────────────────────────────────────────────┐
│ STEP 1: Student Enters Data                    │
├─────────────────────────────────────────────────┤
│ • Income: $5,000/month                         │
│ • Essentials: $2,700/month                     │
│ • Debt: $15,000                                │
│ • Emergency Fund: $2,000                       │
│ • (Plus Tool 2 data auto-filled if available)  │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: System Calculates Surplus & Analyzes   │
├─────────────────────────────────────────────────┤
│ Surplus = $5,000 - $2,700 = $2,300             │
│ Emergency Fund = 0.74 months expenses          │
│ Debt-to-Income Ratio = 3:1                     │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: Determine Available Priorities         │
├─────────────────────────────────────────────────┤
│ Available (5):                                 │
│ ✅ Stabilize to Survive                        │
│ ✅ Reclaim Financial Control                   │
│ ✅ Get Out of Debt                             │
│ ✅ Feel Financially Secure                     │
│ ✅ Save for a Big Goal                         │
│                                                │
│ Locked (5):                                    │
│ 🔒 Build Long-Term Wealth                      │
│    Need: $800 surplus ✅ + 6mo emergency ❌    │
│ 🔒 Create Life Balance                         │
│ 🔒 Enjoy Life Now                              │
│ 🔒 Build/Stabilize Business                    │
│ 🔒 Create Generational Wealth                  │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ STEP 4: System Recommends Priority             │
├─────────────────────────────────────────────────┤
│ 💡 RECOMMENDED: "Feel Financially Secure"      │
│                                                │
│ Why:                                           │
│ • You have 0.74 months emergency fund          │
│ • Building to 3 months should be priority      │
│ • Debt is manageable (3:1 ratio)              │
│ • You have $2,300 surplus to work with         │
│                                                │
│ [Use This Recommendation]                      │
│ [Choose Different Priority ▼]                  │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ STEP 5: Student Makes Choice                   │
├─────────────────────────────────────────────────┤
│ Option A: Accept recommendation                │
│ Option B: Select from dropdown (5 available)   │
│                                                │
│ If Option B:                                   │
│ → Show comparison (recommended vs chosen)      │
│ → Explain trade-offs                           │
│ → Student confirms choice                      │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ STEP 6: Rank Top 2                             │
├─────────────────────────────────────────────────┤
│ Your Top 2 Priorities:                         │
│ 1st (70%): [Feel Financially Secure ▼]        │
│ 2nd (30%): [Get Out of Debt ▼]               │
│                                                │
│ Combined Base Weights:                         │
│ M: 20%, E: 34%, F: 33%, J: 13%                │
└─────────────────────────────────────────────────┘
```

---

## 3. Allocation Model - Recommended vs Adjusted

### **Decision 3.1: Show Both Allocations** ✅

**The Problem:**
Student's current spending doesn't match recommended allocation.

**The Solution:**
Show BOTH allocations + offer 3 paths forward.

---

### **Allocation Display:**

```
┌─────────────────────────────────────────────────┐
│ YOUR ALLOCATION                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📊 RECOMMENDED (Your Target):                  │
│ Based on "Feel Financially Secure" priority     │
│                                                 │
│ M: 25% = $1,250/month (Investing)              │
│ E: 35% = $1,750/month (Essentials)             │
│ F: 30% = $1,500/month (Emergency Fund)         │
│ J: 10% = $500/month (Enjoyment)                │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ ⚠️ YOUR CURRENT REALITY:                       │
│ Income:     $5,000                             │
│ Essentials: $2,700 (you report)                │
│ Surplus:    $2,300 available                   │
│                                                 │
│ 💡 GAP ANALYSIS:                                │
│ • Essentials: $950 OVER recommended            │
│ • Freedom: Can fund recommended ✅             │
│ • Multiply: Can fund recommended ✅            │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ ✏️ ADJUSTED FOR YOUR SITUATION:                │
│ (What you can execute TODAY)                   │
│                                                 │
│ M: 25% = $1,250/month ✅                       │
│ E: 54% = $2,700/month (your current spending)  │
│ F: 15% = $750/month (reduced from $1,500)      │
│ J: 6% = $300/month (reduced from $500)         │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ 💡 TO REACH RECOMMENDED:                        │
│ → Reduce essentials by $950/month               │
│   (Tool 2 suggests: Subscriptions, Dining out) │
│ → This frees up $950 for Freedom + Enjoyment   │
│                                                 │
│ Next: Choose your path →                       │
└─────────────────────────────────────────────────┘
```

---

### **Decision 3.2: Offer 3 Paths Forward** ✅

After showing both allocations, present 3 clear options:

#### **PATH 1: Optimize Now (Aspirational)** ⭐

```
┌─────────────────────────────────────────────────┐
│ [1] OPTIMIZE TO MEET RECOMMENDED                │
├─────────────────────────────────────────────────┤
│                                                 │
│ Adjust your essentials now to match target:    │
│                                                 │
│ Essentials: [$2,700] → [$1,750] 💡            │
│             (Interactive slider)                │
│                                                 │
│ 💡 Tool 2 suggests cutting:                     │
│ • Subscriptions you don't use: ~$150/month     │
│ • Reduce dining out 50%: ~$400/month           │
│ • Shop sales for groceries: ~$200/month        │
│ • Cancel unused gym membership: ~$50/month     │
│ • Switch to generic brands: ~$150/month        │
│ Total savings: ~$950/month ✅                  │
│                                                 │
│ New allocation after optimization:              │
│ M: $1,250, E: $1,750, F: $1,500, J: $500 ✅    │
│                                                 │
│ [Use This Plan - Optimize Now]                 │
└─────────────────────────────────────────────────┘
```

**Who this is for:** Motivated students ready to make changes immediately

---

#### **PATH 2: Start Adjusted, Progress Over Time (Realistic)** ⭐⭐

```
┌─────────────────────────────────────────────────┐
│ [2] START WITH ADJUSTED, IMPROVE GRADUALLY      │
├─────────────────────────────────────────────────┤
│                                                 │
│ Use a realistic plan based on your current      │
│ spending, then improve month-by-month:          │
│                                                 │
│ MONTH 1 (Starting Today):                       │
│ M: $1,250, E: $2,700, F: $750, J: $300         │
│                                                 │
│ Action: Track all spending, identify waste     │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ MONTH 2 (30 days):                              │
│ M: $1,250, E: $2,400, F: $1,050, J: $300       │
│                                                 │
│ Goal: Cut $300/month from essentials           │
│ Focus: Cancel subscriptions, reduce dining     │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ MONTH 3 (60 days):                              │
│ M: $1,250, E: $2,000, F: $1,350, J: $400       │
│                                                 │
│ Goal: Cut another $400/month                    │
│ Focus: Shop smarter, generic brands            │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ MONTH 4+ (90 days):                             │
│ M: $1,250, E: $1,750, F: $1,500, J: $500 ✅    │
│                                                 │
│ Goal: Reach recommended allocation!             │
│                                                 │
│ 📊 We'll track your progress and prompt you    │
│    to update your allocation monthly.          │
│                                                 │
│ [Use Gradual Plan - Start Realistic]           │
└─────────────────────────────────────────────────┘
```

**Who this is for:** Most students (especially trauma survivors who need gradual change)

---

#### **PATH 3: Choose Different Priority (Redirect)**

```
┌─────────────────────────────────────────────────┐
│ [3] CHOOSE A DIFFERENT PRIORITY                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ "Feel Financially Secure" doesn't fit your     │
│ current situation well.                         │
│                                                 │
│ Try one of these instead:                       │
│                                                 │
│ • "Get Out of Debt" (better fit) ✅            │
│   Focus: Pay down $15K debt aggressively       │
│   Works with your $2,300 surplus               │
│                                                 │
│ • "Stabilize to Survive"                        │
│   Focus: Cover essentials + build basic buffer │
│   If current spending feels essential          │
│                                                 │
│ [View Other Available Priorities]               │
└─────────────────────────────────────────────────┘
```

**Who this is for:** Students who can't close the gap yet

---

### **Decision 3.3: Save Both Allocations** ✅

**When student chooses Path 2 (Gradual), we save:**

```javascript
scenario = {
  name: "My Plan - Feel Financially Secure",
  priority1: "Feel Financially Secure",
  priority2: "Get Out of Debt",

  // Current (what they're doing TODAY)
  current: {
    M: 25%, E: 54%, F: 15%, J: 6%,
    dollars: { M: 1250, E: 2700, F: 750, J: 300 }
  },

  // Target (what they're working TOWARD)
  target: {
    M: 25%, E: 35%, F: 30%, J: 10%,
    dollars: { M: 1250, E: 1750, F: 1500, J: 500 }
  },

  // Gap (what needs to change)
  gap: {
    essentials: -950,  // Reduce by $950
    freedom: +750,     // Increase by $750
    enjoyment: +200    // Increase by $200
  },

  // Progress Plan
  progressPlan: [
    { month: 1, action: "Track spending, identify $300 to cut",
      target: { E: 2700, F: 750 } },
    { month: 2, action: "Cut $300 from essentials",
      target: { E: 2400, F: 1050 } },
    { month: 3, action: "Cut another $400 from essentials",
      target: { E: 2000, F: 1350 } },
    { month: 4, action: "Reach recommended allocation!",
      target: { E: 1750, F: 1500 } }
  ],

  createdAt: "2025-11-17",
  lastUpdated: "2025-11-17",
  isOptimal: false  // Not optimal yet (using adjusted)
};
```

---

## 4. The 10 Priorities - Complete Specifications

For each priority, we define:
1. **Base Weights** (M/E/F/J percentages)
2. **Unlock Requirements** (what makes it available)
3. **Recommendation Triggers** (when to auto-suggest)
4. **Target Student** (who this serves)

---

### **Priority 1: Stabilize to Survive**

**Base Weights:**
```
M:  5%  (Minimum wealth-building)
E: 60%  (High essentials for crisis mode - UPDATED 11/18/25)
F: 30%  (Build emergency fund - UPDATED 11/18/25)
J:  5%  (Minimal enjoyment - UPDATED 11/18/25)
```

**📝 Update Note (11/18/25):** Base weights adjusted based on scenario testing. Students in crisis mode with income < $4K need higher E% to reflect reality of limited optimization opportunities (childcare, housing constraints, etc.).

**Unlock Requirements:**
```javascript
// ALWAYS AVAILABLE (no requirements)
unlocked = true;
```

**Recommendation Triggers:**
```javascript
if (emergencyFund < 1_month_expenses &&
    surplus < 500) {
  recommend = "Stabilize to Survive";
}
```

**Target Student:**
- Income: $2,000-$3,500/month
- Emergency Fund: $0-$1,000
- Debt: Any amount
- Situation: Crisis mode, recovering from trauma
- Duration: 0-6 months, then transition to "Feel Secure"

---

### **Priority 2: Reclaim Financial Control**

**Base Weights:**
```
M: 10%  (Minimal investing)
E: 45%  (Trauma-informed essentials - UPDATED 11/18/25)
F: 35%  (Freedom focus - UPDATED 11/18/25)
J: 10%  (Reduced for control focus - UPDATED 11/18/25)
```

**📝 Update Note (11/18/25):** Base weights adjusted for trauma-informed approach. Recovery requires sustainable essentials, not aggressive cuts that trigger trauma responses.

**Unlock Requirements:**
```javascript
// ALWAYS AVAILABLE (trauma recovery priority)
unlocked = true;
```

**Recommendation Triggers:**
```javascript
if (tool1Winner === 'Fear' || tool1Winner === 'Control' ||
    tool2Archetype === 'Money Vigilance' ||
    satisfaction >= 7) {  // High dissatisfaction
  recommend = "Reclaim Financial Control";
}
```

**Target Student:**
- Recovering from financial trauma/abuse
- High Fear or Control trauma pattern (Tool 1)
- Need to rebuild sense of agency
- Any income level

---

### **Priority 3: Get Out of Debt**

**Base Weights:**
```
M: 15%  (Minimum investing)
E: 35%  (Sustainable essentials - UPDATED 11/18/25)
F: 40%  (Aggressive debt payoff)
J: 10%  (Reduced to maintain F - UPDATED 11/18/25)
```

**📝 Update Note (11/18/25):** E increased from 30% to 35% for sustainability. 30% E created unrealistic gaps for low-income debt payoff scenarios, risking burnout and failure.

**Unlock Requirements:**
```javascript
if (debtAmount > 5000 &&  // Has significant debt
    surplus >= 200) {      // Can make some progress
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
if (debtAmount > income * 6 &&
    interestRate === 'High' &&
    emergencyFund >= 1_month_expenses) {
  recommend = "Get Out of Debt";
}
```

**Target Student:**
- Debt: $5,000+ (especially high-interest)
- Emergency Fund: At least 1 month (basic safety)
- Ready to prioritize debt elimination
- Surplus: Enough to make meaningful progress

---

### **Priority 4: Feel Financially Secure**

**Base Weights:**
```
M: 25%  (Balanced wealth-building)
E: 35%  (Comfortable essentials)
F: 30%  (Build robust emergency fund)
J: 10%  (Low enjoyment, security-focused)
```

**Unlock Requirements:**
```javascript
if (emergencyFund >= 1_month_expenses &&
    essentials <= income * 0.6 &&  // Not overspending
    surplus >= 300) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
if (emergencyFund >= 1_month_expenses &&
    emergencyFund < 3_months_expenses &&
    debtAmount < income * 4) {
  recommend = "Feel Financially Secure";
}
```

**Target Student:**
- Emergency Fund: 1-3 months expenses
- Debt: Manageable or none
- Moving from crisis to stability
- Focus: Build 3-6 month emergency fund

---

### **Priority 5: Create Life Balance**

**Base Weights:**
```
M: 15%  (Minimum investing)
E: 25%  (Efficient essentials)
F: 25%  (Moderate emergency fund)
J: 35%  (High enjoyment - life balance)
```

**Unlock Requirements:**
```javascript
if (emergencyFund >= 2_months_expenses &&
    debtAmount < income * 3 &&
    essentials <= income * 0.5 &&  // Room for enjoyment
    surplus >= 500) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
if (satisfaction >= 7 &&  // Dissatisfied with work-life balance
    income >= 4000 &&
    emergencyFund >= 2_months_expenses &&
    debtAmount < income * 2) {
  recommend = "Create Life Balance";
}
```

**Target Student:**
- Stable financial situation
- Values work-life balance over aggressive growth
- Can afford higher enjoyment spending
- Emergency fund established

---

### **Priority 6: Build/Stabilize Business**

**Base Weights:**
```
M: 20%  (Moderate - includes business reinvestment)
E: 30%  (Moderate personal essentials)
F: 35%  (High - business emergency fund critical)
J: 15%  (Moderate enjoyment)
```

**Unlock Requirements:**
```javascript
if (isBusinessOwner || planningBusiness) {
  unlocked = true;  // Self-reported
}
```

**Recommendation Triggers:**
```javascript
if (isBusinessOwner &&
    incomeStability === 'Unstable / irregular') {
  recommend = "Build/Stabilize Business";
}
```

**Target Student:**
- Business owner or entrepreneur
- Variable income from business
- Need business emergency fund (6-12 months operating costs)
- Reinvestment focus

**Note:** Multiply includes both personal investing AND business reinvestment

---

### **Priority 7: Save for a Big Goal**

**Base Weights:**
```
M: 25%  (Moderate - savings can grow in investments)
E: 25%  (Efficient essentials)
F: 40%  (High - saving for specific goal)
J: 10%  (Low - sacrifice for goal)
```

**Unlock Requirements:**
```javascript
if (emergencyFund >= 3_months_expenses &&
    debtAmount < income * 3 &&
    surplus >= 500) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// Mostly manual selection
// OR if student enters specific goal
if (hasBigGoalEntered &&  // House, car, wedding, etc.
    emergencyFund >= 3_months_expenses) {
  recommend = "Save for a Big Goal";
}
```

**Target Student:**
- Emergency Fund: 3+ months (solid)
- Debt: Low or none
- Specific goal: House down payment, car, wedding, etc.
- Timeline: 1-5 years
- Willing to sacrifice enjoyment for goal

**Difference from "Get Out of Debt":**
- "Debt" = Paying OFF past (elimination)
- "Big Goal" = Saving FOR future (accumulation with growth)

---

### **Priority 8: Build Long-Term Wealth**

**Base Weights:**
```
M: 40%  (High investing - wealth focus)
E: 25%  (Efficient essentials)
F: 20%  (Moderate - already have emergency fund)
J: 15%  (Low - delayed gratification)
```

**Unlock Requirements:**
```javascript
if (emergencyFund >= 6_months_expenses &&
    debtAmount < income * 2 &&
    surplus >= 800) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
if (emergencyFund >= 6_months_expenses &&
    debtAmount === 0 &&
    surplus >= 1200 &&
    age < 50) {  // Time for compounding
  recommend = "Build Long-Term Wealth";
}
```

**Target Student:**
- Emergency Fund: 6+ months (solid)
- Debt: Minimal or none
- Surplus: $800+ (can fund 40% Multiply)
- Ready for aggressive wealth building
- Long time horizon (20+ years to retirement)

---

### **Priority 9: Enjoy Life Now**

**Base Weights:**
```
M: 20%  (Moderate investing)
E: 20%  (Low essentials - only for those who CAN)
F: 15%  (Low - already stable)
J: 45%  (Very high enjoyment - lifestyle priority)
```

**Unlock Requirements:**
```javascript
if (emergencyFund >= 3_months_expenses &&
    debtAmount < income * 2 &&
    essentials <= income * 0.35 &&  // Can sustain 20% E
    surplus >= 1000) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
// RARELY auto-recommend (conscious choice)
if (satisfaction >= 8 &&  // Very dissatisfied with life quality
    tool3Quotient === 'High' &&  // Strong financial identity
    emergencyFund >= 6_months_expenses &&
    debtAmount === 0 &&
    essentials <= income * 0.3) {
  recommend = "Enjoy Life Now";  // "You've earned it"
}
```

**Target Student:**
- Very stable financial foundation
- Low actual essentials (roommates, LCOL area, efficient lifestyle)
- High income relative to needs
- Values present experiences over future wealth
- Can realistically live on 20% E

**NOTE:** This priority is INTENTIONALLY hard to unlock because 20% E is only realistic for specific situations (e.g., $8K income, $1.6K rent in shared house, efficient lifestyle).

---

### **Priority 10: Create Generational Wealth**

**Base Weights:**
```
M: 50%  (Maximum investing - legacy focus)
E: 20%  (Low - established efficiency)
F: 20%  (Low - already have safety net)
J: 10%  (Low - sacrifice for legacy)
```

**Unlock Requirements:**
```javascript
if (emergencyFund >= 12_months_expenses &&
    debtAmount === 0 &&
    surplus >= 2000) {
  unlocked = true;
}
```

**Recommendation Triggers:**
```javascript
if (surplus >= 3000 &&
    emergencyFund >= 12_months_expenses &&
    debtAmount === 0 &&
    age < 55) {  // Time to build legacy
  recommend = "Create Generational Wealth";
}
```

**Target Student:**
- Surplus: $2,000+ (can fund 50% Multiply)
- Emergency Fund: 12+ months (extremely stable)
- Debt: $0 (completely clear)
- Focus: Building legacy for children/family
- High earner with lifestyle efficiency

---

## 5. Progressive Unlock Logic

### **Surplus Calculation:**

```javascript
const monthlySurplus = income - essentials;
```

**This is the key unlock metric.**

---

### **Final Surplus Thresholds:**

| Priority | Min Surplus | Rationale |
|----------|-------------|-----------|
| **Stabilize to Survive** | $0 | Always available |
| **Reclaim Financial Control** | $0 | Always available (trauma recovery) |
| **Get Out of Debt** | $200 | Can make some debt progress |
| **Feel Financially Secure** | $300 | Can start emergency fund |
| **Create Life Balance** | $500 | Can afford some enjoyment |
| **Build/Stabilize Business** | $0 | Self-reported (business owner) |
| **Save for a Big Goal** | $500 | Can save meaningfully toward goal |
| **Build Long-Term Wealth** | $800 | Can start investing 40% |
| **Enjoy Life Now** | $1,000 | Can sustain moderate enjoyment |
| **Create Generational Wealth** | $2,000 | Serious capacity for 50% investing |

**Philosophy:**
- Thresholds are LOW (accessible)
- Represent minimum to make SOME progress
- Not required to perfectly execute allocation
- System shows gap between current and recommended

---

### **Unlock Display:**

```
Available Priorities (3):
✅ Stabilize to Survive
✅ Reclaim Financial Control
✅ Get Out of Debt

Locked Priorities (7):
🔒 Feel Financially Secure
   ↳ Need: Emergency fund ≥ $2,700 (1 month)
   ↳ Progress: 74% complete ($2,000 / $2,700)

🔒 Build Long-Term Wealth
   ↳ Need: Emergency fund ≥ $16,200 (6 months)
   ↳ Progress: 12% complete ($2,000 / $16,200)

🔒 Create Generational Wealth
   ↳ Need: Emergency fund ≥ $32,400 (12 months)
   ↳ Need: Pay off $15,000 debt
   ↳ Progress: 6% complete
```

**Shows:**
- ✅ What's available NOW
- 🔒 What's locked and WHY
- 📊 Progress toward unlocking

---

## 6. Hybrid Allocation UX - 3 Paths

See [Section 3](#3-allocation-model---recommended-vs-adjusted) for complete details.

**Summary:**
1. **Path 1: Optimize Now** - Adjust essentials immediately, execute recommended
2. **Path 2: Gradual Progress** - Start with adjusted, improve over 30-90 days
3. **Path 3: Different Priority** - Choose better-fitting priority

**Default Recommendation:** Path 2 (Gradual) for most students

---

## 7. Surplus Calculation & Thresholds

### **Surplus Formula:**

```javascript
const surplus = monthlyIncome - monthlyEssentials;
```

**Why surplus, not income?**
- Captures true financial capacity
- Accounts for actual spending, not just earning
- Prevents lifestyle creep from hiding vulnerability
- Example: $10K income + $9K essentials = $1K surplus (tight)
- Example: $4K income + $2K essentials = $2K surplus (comfortable)

---

### **Validation Example:**

**Student A:**
- Income: $3,000
- Essentials: $2,000
- **Surplus: $1,000**

**Can unlock:**
- ✅ Get Out of Debt ($200 threshold)
- ✅ Feel Secure ($300 threshold)
- ✅ Life Balance ($500 threshold)
- ✅ Save for Goal ($500 threshold)
- ✅ Build Wealth ($800 threshold)
- ❌ Enjoy Life ($1,000 threshold - just barely)
- ❌ Generational Wealth ($2,000 threshold)

---

**Student B:**
- Income: $8,000
- Essentials: $6,500
- **Surplus: $1,500**

**Can unlock:**
- ✅ All of Student A's options
- ✅ Enjoy Life ($1,000 threshold)
- ❌ Generational Wealth ($2,000 threshold - close!)

**Even with higher income, Student B has lifestyle creep and can't unlock top tier.**

---

## 8. Tool 2 Integration

### **What We Pull from Tool 2:**

```javascript
const tool2Data = {
  spendingClarity: -3,        // Scale -5 to +5
  spendingConsistency: 2,     // Scale -5 to +5
  incomeSufficiency: 1,       // Scale -5 to +5
  wastefulSpending: "Subscriptions I don't use, eating out too much",

  // Derived from Tool 2
  archetype: "Money Vigilance",
  topDomain: "Spending Control"
};
```

---

### **Use Case 1: Intelligent Essentials Detection**

```javascript
function detectOverspending(reportedEssentials, income, tool2Data) {
  const reportedPct = (reportedEssentials / income) * 100;

  // Calculate spending control score
  const spendingControl =
    (tool2Data.spendingClarity + tool2Data.spendingConsistency) / 2;

  let overspendingFactor = 0;

  // Indicator 1: Poor spending control
  if (spendingControl < -2) {
    overspendingFactor += 0.30;  // 30% likely overspending
  } else if (spendingControl < 0) {
    overspendingFactor += 0.15;  // 15% likely overspending
  }

  // Indicator 2: Income sufficiency + high essentials = lifestyle creep
  if (tool2Data.incomeSufficiency >= 3 && reportedPct > 50) {
    overspendingFactor += 0.20;  // 20% lifestyle creep
  }

  // Indicator 3: Self-reported wasteful spending
  if (tool2Data.wastefulSpending &&
      tool2Data.wastefulSpending.length > 50) {
    overspendingFactor += 0.10;  // 10% acknowledged waste
  }

  // Calculate estimated true essentials
  const estimatedOverspend = reportedEssentials * overspendingFactor;
  const trueEssentials = reportedEssentials - estimatedOverspend;
  const truePct = (trueEssentials / income) * 100;

  return {
    reported: { dollars: reportedEssentials, percent: reportedPct },
    estimated: {
      dollars: Math.round(trueEssentials),
      percent: Math.round(truePct)
    },
    overspend: {
      dollars: Math.round(estimatedOverspend),
      percent: Math.round(overspendingFactor * 100)
    },
    confidence: spendingControl > 2 ? 'high' : 'medium',
    suggestions: parseWastefulSpending(tool2Data.wastefulSpending)
  };
}
```

---

### **Use Case 2: Suggested Cuts**

When showing Path 1 (Optimize Now), parse Tool 2 wasteful spending:

```javascript
function parseWastefulSpending(text) {
  // Extract categories from freeform text
  const suggestions = [];

  if (/subscription/i.test(text)) {
    suggestions.push({
      category: "Subscriptions",
      estimatedSavings: 150,
      action: "Cancel unused subscriptions"
    });
  }

  if (/eat.*out|dining|restaurant/i.test(text)) {
    suggestions.push({
      category: "Dining Out",
      estimatedSavings: 400,
      action: "Reduce dining out by 50%"
    });
  }

  if (/shopping|impulse|amazon/i.test(text)) {
    suggestions.push({
      category: "Impulse Shopping",
      estimatedSavings: 300,
      action: "30-day rule for non-essential purchases"
    });
  }

  return suggestions;
}
```

---

### **Fallback: No Tool 2 Data**

If Tool 2 not completed, show 3 inline questions:

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Quick Questions for Better Accuracy (1 min)  │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. How well do you track your spending?        │
│    [────────●──] 6/10                          │
│    1 = Never  |  10 = Track every dollar       │
│                                                 │
│ 2. Is your income sufficient for your needs?   │
│    [─────●─────] 5/10                          │
│    1 = Insufficient  |  10 = More than enough  │
│                                                 │
│ 3. Any wasteful spending? (Optional)           │
│    [_______________________________________]    │
│                                                 │
│ [Continue]                                      │
│                                                 │
│ 💡 For better results, complete Tool 2 first   │
│    (15-20 minutes, unlocks smart insights)     │
│ [Go to Tool 2]                                  │
└─────────────────────────────────────────────────┘
```

---

## 9. Modifiers System

### **Legacy Modifiers (Still Apply):**

The legacy AllocationFunction.js has modifiers that adjust base weights:

**Categories:**
1. **Financial Modifiers** (income level, debt, emergency fund, stability)
2. **Behavioral Modifiers** (discipline, impulse control, satisfaction)
3. **Motivational Modifiers** (lifestyle priority, growth orientation, etc.)

---

### **Decision 9.1: Modifiers Apply to RECOMMENDED Allocation** ✅

**How it works:**
1. Start with base weights from Top 2 priorities (70%/30% weighted)
2. Apply modifiers (±50 points max)
3. Normalize to 100%
4. This becomes the RECOMMENDED allocation
5. Calculate ADJUSTED allocation separately (based on current reality)

**Example:**
```javascript
// Base weights from "Feel Secure"
const base = { M: 25, E: 35, F: 30, J: 10 };

// Apply modifiers
const mods = {
  financial: { M: +5, E: 0, F: +10, J: 0 },    // Low emergency fund
  behavioral: { M: +10, E: 0, F: 0, J: -5 },   // High discipline
  motivational: { M: 0, E: 0, F: +5, J: 0 }    // Stability orientation
};

// Raw scores
const raw = {
  M: 25 + 5 + 10 + 0 = 40,
  E: 35 + 0 + 0 + 0 = 35,
  F: 30 + 10 + 0 + 5 = 45,
  J: 10 + 0 - 5 + 0 = 5
};

// Normalize to 100%
const total = 40 + 35 + 45 + 5 = 125;
const recommended = {
  M: 40/125 * 100 = 32%,
  E: 35/125 * 100 = 28%,
  F: 45/125 * 100 = 36%,
  J: 5/125 * 100 = 4%
};
```

---

### **Decision 9.2: Trauma-Informed Satisfaction Amplifier** ✅

**Legacy behavior:** Satisfaction score (1-10) amplifies all positive modifiers by up to 1.3x

**New trauma-informed approach:**

```javascript
function applySatisfactionAmplifier(mods, satisfaction, trauma) {
  const dissatisfaction = satisfaction;  // Higher = more dissatisfied

  if (dissatisfaction < 7) {
    // Low dissatisfaction = no amplification needed
    return mods;
  }

  // High dissatisfaction (7+)
  // Check trauma context
  if (trauma.winner === 'Fear' ||
      trauma.winner === 'Control' ||
      trauma.tool2Archetype === 'Money Vigilance') {
    // Overwhelmed, NOT motivated
    // BOOST stability instead of growth
    mods.Essentials += 10;
    mods.Freedom += 10;
    // NO amplification on positive modifiers
    return mods;
  }

  // Other trauma patterns or no high trauma
  // High dissatisfaction = Motivated for change
  const satFactor = 1 + Math.min((dissatisfaction - 5) * 0.1, 0.3);

  Object.keys(mods).forEach(bucket => {
    if (mods[bucket] > 0) {
      mods[bucket] = Math.round(mods[bucket] * satFactor);
    }
  });

  return mods;
}
```

**Philosophy:**
- High dissatisfaction usually = motivation
- BUT high dissatisfaction + Fear/Control trauma = overwhelm
- Trauma-informed system detects difference

---

## 10. Still To Be Defined

### **Items Deferred to Implementation Phase:**

1. **Complete Unlock Requirements** - Need to finalize ALL factors beyond surplus
   - Emergency fund thresholds for each priority
   - Debt limits for each priority
   - Any other factors (age, income stability, Tool 1 patterns)

2. **Recommendation Trigger Rules** - Full decision tree
   - When to recommend each priority
   - Priority ranking when multiple fit
   - Handling edge cases

3. **Progress Plan Algorithm** - 30-60-90 day milestones
   - How to calculate realistic monthly targets
   - How to track progress
   - When to prompt updates

4. **Modifiers Validation** - Review legacy modifier system
   - Are all legacy modifiers still relevant?
   - Should trauma patterns affect modifiers more?
   - Cap limits (±50 points still appropriate?)

5. **Edge Case Handling**
   - What if NO priorities unlock? (shouldn't happen)
   - What if situation degrades? (lock priorities again?)
   - Conflicting Top 2 priorities? (warning or allow?)

6. **Testing & Validation**
   - Test with 20+ sample scenarios
   - Validate allocations "feel right"
   - Test unlock progression
   - User testing feedback

---

## ✅ Summary - What's LOCKED IN

### **Framework:**
✅ Progressive unlock model
✅ Hybrid priority selection (suggested + override)
✅ Top 2 ranking (70%/30%)
✅ Hybrid allocation (recommended + adjusted + 3 paths)
✅ Surplus-based unlock thresholds
✅ Keep all 10 priorities

### **Base Weights:**
✅ All 10 priorities defined with M/E/F/J percentages
✅ Distinct enough to serve different purposes
✅ Tested against research (50/30/20 rule, advisor standards)

### **Unlock Requirements:**
✅ Surplus thresholds defined
🔄 Other factors (emergency fund, debt) - need validation

### **UX:**
✅ 3-path choice (optimize/gradual/different)
✅ Show both recommended + adjusted allocations
✅ Progress tracking for gradual path
✅ Tool 2 integration for overspending detection

---

## 🚀 Next Steps

1. **Validate remaining unlock requirements** (emergency fund, debt thresholds)
2. **Define recommendation trigger decision tree**
3. **Test with 10+ sample student scenarios**
4. **Update all Tool4 specification documents**
5. **Create implementation checklist**
6. **Begin development**

---

**This document is the COMPLETE record of all base weight optimization decisions. Use this as the source of truth for implementation.**

**Last Updated:** November 17, 2025
**Session:** Base Weights Deep Dive Completed
**Status:** Ready for Implementation ✅
