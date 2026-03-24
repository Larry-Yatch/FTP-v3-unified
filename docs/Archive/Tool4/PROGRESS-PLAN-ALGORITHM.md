# Tool 4: Progress Plan Algorithm (30-60-90 Day Milestones)

**Date:** November 18, 2025
**Purpose:** Define algorithm for Path 2 (Gradual Progress) milestone generation
**Status:** ✅ COMPLETE

---

## 🎯 **Context**

When students select **Path 2: Start Adjusted, Progress Over Time**, the system needs to generate a realistic progress plan with monthly milestones that help them bridge the gap between their current spending and the recommended allocation.

**The Challenge:**
- Current allocation: What they can execute TODAY (based on actual essentials)
- Target allocation: Recommended (based on priority + modifiers)
- Gap: What needs to change month-by-month

---

## 📊 **Progress Plan Components**

### **1. Gap Calculation**

```javascript
function calculateGap(current, target, income) {
  return {
    // Dollar amounts that need to change
    essentials: {
      current: current.E_dollars,
      target: target.E_dollars,
      gap: current.E_dollars - target.E_dollars,  // Amount to REDUCE
      gapPercent: ((current.E_dollars - target.E_dollars) / current.E_dollars) * 100
    },

    freedom: {
      current: current.F_dollars,
      target: target.F_dollars,
      gap: target.F_dollars - current.F_dollars,  // Amount to INCREASE
      gapPercent: ((target.F_dollars - current.F_dollars) / current.F_dollars) * 100
    },

    enjoyment: {
      current: current.J_dollars,
      target: target.J_dollars,
      gap: target.J_dollars - current.J_dollars,  // Amount to INCREASE (or decrease)
      gapPercent: current.J_dollars > 0 ?
        ((target.J_dollars - current.J_dollars) / current.J_dollars) * 100 : 0
    },

    multiply: {
      current: current.M_dollars,
      target: target.M_dollars,
      gap: target.M_dollars - current.M_dollars,  // Usually increase
      gapPercent: current.M_dollars > 0 ?
        ((target.M_dollars - current.M_dollars) / current.M_dollars) * 100 : 0
    }
  };
}
```

**Example:**
```javascript
// Student: $5,000 income, "Feel Financially Secure" priority
Current: { M: $1,250, E: $2,700, F: $750,  J: $300 }
Target:  { M: $1,250, E: $1,750, F: $1,500, J: $500 }

Gap:
  E: -$950  (need to reduce by $950)
  F: +$750  (need to increase by $750)
  J: +$200  (need to increase by $200)
  M: $0     (already at target)
```

---

## 📅 **Monthly Milestone Algorithm**

### **Decision: Progressive Reduction Strategy**

**Key Principles:**
1. **Essentials reduction should be gradual** - Large cuts are unsustainable
2. **Timeline should be realistic** - 3-6 months for most gaps
3. **Early wins matter** - Start with easy cuts (subscriptions), progress to harder cuts (habits)
4. **One focus per month** - Don't overwhelm with multiple changes

---

### **Timeline Calculation**

```javascript
function calculateTimelineMonths(gap) {
  const totalReduction = Math.abs(gap.essentials.gap);

  // Base timeline on total reduction amount
  if (totalReduction < 300) {
    return 2;  // Small adjustment - 2 months
  } else if (totalReduction < 600) {
    return 3;  // Moderate adjustment - 3 months
  } else if (totalReduction < 1000) {
    return 4;  // Significant adjustment - 4 months
  } else if (totalReduction < 1500) {
    return 5;  // Large adjustment - 5 months
  } else {
    return 6;  // Major lifestyle change - 6 months
  }
}
```

**Rationale:**
- $300/month reduction = ~$10/day = Very achievable (cancel 2-3 subscriptions)
- $600/month reduction = ~$20/day = Moderate effort (subscriptions + dining habits)
- $1,000/month reduction = ~$33/day = Significant lifestyle changes
- $1,500+/month reduction = ~$50+/day = Major overhaul needed

---

### **Monthly Reduction Strategy**

```javascript
function calculateMonthlyReductions(totalGap, months) {
  const reductions = [];
  const baseReduction = totalGap / months;

  // Progressive reduction: Start smaller, increase slightly
  // Pattern: 70%, 100%, 110%, 120%, 130%, 140% of base
  const progressionFactors = [0.7, 1.0, 1.1, 1.2, 1.3, 1.4];

  for (let i = 0; i < months; i++) {
    const factor = progressionFactors[i] || 1.0;
    reductions.push(Math.round(baseReduction * factor));
  }

  // Adjust final month to hit exact target
  const totalPlanned = reductions.reduce((a, b) => a + b, 0);
  const adjustment = totalGap - totalPlanned;
  reductions[reductions.length - 1] += adjustment;

  return reductions;
}
```

**Example:**
```javascript
Total Gap: $950 over 4 months
Base Reduction: $950 / 4 = $237.50

Monthly Reductions:
  Month 1: $237.50 × 0.7  = $166  (Easy wins)
  Month 2: $237.50 × 1.0  = $238  (Build momentum)
  Month 3: $237.50 × 1.1  = $261  (Increase effort)
  Month 4: $237.50 × 1.2  = $285  (Final push)
  Total: $950 ✅
```

**Why Progressive?**
- Start with easier cuts (low-hanging fruit)
- Build confidence and momentum
- Harder lifestyle changes come later when student is motivated by progress

---

### **Monthly Focus Areas**

```javascript
function generateMonthlyFocus(monthNumber, totalMonths, reductionAmount) {
  // Month-specific focus based on progression
  const focusAreas = {
    1: {
      focus: "Identify and Eliminate Waste",
      actions: [
        "Track all spending for 30 days",
        "Cancel unused subscriptions",
        "Identify impulse purchases",
        "Find one area to optimize (e.g., groceries, dining out)"
      ],
      difficulty: "Easy",
      categories: ["Subscriptions", "Streaming Services", "Gym/Memberships"]
    },

    2: {
      focus: "Optimize Daily Habits",
      actions: [
        "Reduce dining out by 50%",
        "Switch to generic brands for groceries",
        "Batch cook meals for the week",
        "Find free/low-cost entertainment alternatives"
      ],
      difficulty: "Moderate",
      categories: ["Food/Dining", "Groceries", "Entertainment"]
    },

    3: {
      focus: "Negotiate and Shop Smart",
      actions: [
        "Negotiate bills (internet, phone, insurance)",
        "Shop for better rates on utilities",
        "Use coupons and cashback apps",
        "Review and optimize transportation costs"
      ],
      difficulty: "Moderate",
      categories: ["Bills", "Utilities", "Transportation"]
    },

    4: {
      focus: "Lifestyle Adjustments",
      actions: [
        "Consider roommate or housing downgrade if needed",
        "Evaluate car vs. public transit costs",
        "Cut remaining non-essential spending",
        "Optimize insurance coverage"
      ],
      difficulty: "Challenging",
      categories: ["Housing", "Transportation", "Insurance"]
    },

    5: {
      focus: "Final Optimizations",
      actions: [
        "Review all categories for remaining cuts",
        "Make final lifestyle adjustments",
        "Lock in new spending habits",
        "Celebrate progress!"
      ],
      difficulty: "Moderate",
      categories: ["All Categories"]
    },

    6: {
      focus: "Reach Target and Maintain",
      actions: [
        "Execute final cuts to reach target",
        "Set up automatic transfers for F bucket",
        "Build accountability system",
        "Plan for long-term maintenance"
      ],
      difficulty: "Easy",
      categories: ["Maintenance", "Automation"]
    }
  };

  return focusAreas[monthNumber] || focusAreas[totalMonths];
}
```

---

## 🏗️ **Complete Progress Plan Structure**

```javascript
function generateProgressPlan(current, target, income, priority) {

  // Step 1: Calculate gap
  const gap = calculateGap(current, target, income);

  // Step 2: Determine timeline
  const months = calculateTimelineMonths(gap);

  // Step 3: Calculate monthly reductions
  const essentialsReductions = calculateMonthlyReductions(
    Math.abs(gap.essentials.gap),
    months
  );

  // Step 4: Generate milestones
  const milestones = [];
  let runningEssentials = current.E_dollars;

  for (let month = 1; month <= months; month++) {
    // Calculate new essentials for this month
    runningEssentials -= essentialsReductions[month - 1];

    // Calculate new allocations (freed up money goes to F and J)
    const freedMoney = current.E_dollars - runningEssentials;
    const freedToF = Math.round(freedMoney * (gap.freedom.gap / (gap.freedom.gap + gap.enjoyment.gap)));
    const freedToJ = freedMoney - freedToF;

    const newF = current.F_dollars + freedToF;
    const newJ = current.J_dollars + freedToJ;

    // Get focus for this month
    const focus = generateMonthlyFocus(month, months, essentialsReductions[month - 1]);

    // Create milestone
    milestones.push({
      month: month,

      // Target allocations for this month
      target: {
        M: current.M_dollars,  // Multiply stays constant
        E: Math.round(runningEssentials),
        F: Math.round(newF),
        J: Math.round(newJ)
      },

      // What needs to change this month
      changes: {
        essentials_reduction: essentialsReductions[month - 1],
        freedom_increase: Math.round(freedToF / month),
        enjoyment_increase: Math.round(freedToJ / month)
      },

      // Focus and actions
      focus: focus.focus,
      actions: focus.actions,
      difficulty: focus.difficulty,
      categories: focus.categories,

      // Progress tracking
      progress: {
        percentComplete: Math.round((month / months) * 100),
        remainingGap: Math.round(target.E_dollars - runningEssentials)
      }
    });
  }

  return {
    summary: {
      startDate: new Date().toISOString().split('T')[0],
      timeline: `${months} months`,
      totalReduction: Math.abs(gap.essentials.gap),
      startingEssentials: current.E_dollars,
      targetEssentials: target.E_dollars
    },

    gap: gap,

    milestones: milestones,

    // Tips for success
    tips: generateSuccessTips(gap, months, priority)
  };
}
```

---

## 💡 **Success Tips Generator**

```javascript
function generateSuccessTips(gap, months, priority) {
  const tips = [];

  // Tip 1: Based on gap size
  if (Math.abs(gap.essentials.gap) > 1000) {
    tips.push({
      category: "Lifestyle Change",
      tip: "You're making a significant lifestyle adjustment. Consider getting an accountability partner or joining a financial support group.",
      icon: "👥"
    });
  }

  // Tip 2: Based on priority
  const priorityTips = {
    "Get Out of Debt": {
      tip: "Use the avalanche method: Pay minimums on all debts, put extra toward highest interest rate first.",
      icon: "⛰️"
    },
    "Feel Financially Secure": {
      tip: "Keep your emergency fund in a high-yield savings account (4-5% APY) so it grows while you build it.",
      icon: "🏦"
    },
    "Save for a Big Goal": {
      tip: "Open a separate savings account for your goal and automate transfers on payday.",
      icon: "🎯"
    }
  };

  if (priorityTips[priority]) {
    tips.push(priorityTips[priority]);
  }

  // Tip 3: Automation
  tips.push({
    category: "Automation",
    tip: "Set up automatic transfers to your Freedom bucket on payday. Pay yourself first!",
    icon: "🤖"
  });

  // Tip 4: Tracking
  tips.push({
    category: "Tracking",
    tip: "Use a budgeting app (Mint, YNAB, EveryDollar) to track progress in real-time.",
    icon: "📊"
  });

  // Tip 5: Motivation
  if (months >= 4) {
    tips.push({
      category: "Motivation",
      tip: "This is a marathon, not a sprint. Celebrate small wins along the way!",
      icon: "🎉"
    });
  }

  return tips;
}
```

---

## 📋 **Update Prompt Triggers**

### **When to Prompt Student for Updates**

```javascript
function shouldPromptUpdate(milestone, lastUpdateDate) {
  const daysSinceUpdate = getDaysSince(lastUpdateDate);
  const daysInMonth = 30;

  // Trigger 1: Time-based (every 30 days)
  if (daysSinceUpdate >= daysInMonth) {
    return {
      trigger: "time",
      message: "It's been 30 days! Time to update your progress.",
      urgency: "normal"
    };
  }

  // Trigger 2: Approaching milestone date
  const daysUntilMilestone = getDaysUntil(milestone.dueDate);
  if (daysUntilMilestone <= 7 && daysUntilMilestone > 0) {
    return {
      trigger: "milestone_approaching",
      message: `You're 1 week away from Month ${milestone.month} target. How's it going?`,
      urgency: "normal"
    };
  }

  // Trigger 3: Overdue milestone
  if (daysUntilMilestone < 0) {
    return {
      trigger: "milestone_overdue",
      message: `Month ${milestone.month} target has passed. Let's check in and adjust if needed.`,
      urgency: "high"
    };
  }

  return null;  // No prompt needed
}
```

### **Update Flow**

```javascript
function handleProgressUpdate(studentResponse) {
  const {
    actualEssentials,     // What did you actually spend on essentials?
    hitTarget,            // Did you hit your target? (Yes/No/Close)
    challenges,           // What made it difficult? (freeform)
    confidenceNextMonth   // How confident for next month? (1-10)
  } = studentResponse;

  // Analyze progress
  const milestone = getCurrentMilestone();
  const variance = actualEssentials - milestone.target.E;

  if (hitTarget === "Yes" || Math.abs(variance) < 50) {
    // SUCCESS - Move to next milestone
    return {
      status: "success",
      message: "Great job! You hit your target. Let's move to Month " + (milestone.month + 1),
      action: "advance_milestone",
      encouragement: getEncouragement("success")
    };

  } else if (variance > 0 && variance <= 200) {
    // CLOSE - Keep same target, try again
    return {
      status: "close",
      message: "You're close! You were $" + variance + " over target. Let's refine and try again this month.",
      action: "retry_milestone",
      suggestions: getSuggestions(challenges),
      encouragement: getEncouragement("close")
    };

  } else if (variance > 200) {
    // STRUGGLING - Adjust plan
    return {
      status: "struggling",
      message: "It looks like this target was too aggressive. Let's adjust your plan to be more realistic.",
      action: "adjust_plan",
      newPlan: recalculateProgressPlan(actualEssentials, milestone.target.E, confidenceNextMonth),
      encouragement: getEncouragement("struggling")
    };
  }
}
```

---

## 🎯 **Example: Complete Progress Plan**

### **Student Scenario:**
```javascript
Income: $5,000/month
Priority: "Feel Financially Secure" (M:25%, E:35%, F:30%, J:10%)

Current Allocation:
  M: $1,250 (25%)
  E: $2,700 (54%) ⚠️
  F: $750  (15%)
  J: $300  (6%)

Target Allocation:
  M: $1,250 (25%)
  E: $1,750 (35%)
  F: $1,500 (30%)
  J: $500  (10%)

Gap: Need to reduce E by $950
```

### **Generated Progress Plan:**

```json
{
  "summary": {
    "startDate": "2025-11-18",
    "timeline": "4 months",
    "totalReduction": 950,
    "startingEssentials": 2700,
    "targetEssentials": 1750
  },

  "milestones": [
    {
      "month": 1,
      "target": {
        "M": 1250,
        "E": 2534,
        "F": 876,
        "J": 340
      },
      "changes": {
        "essentials_reduction": 166,
        "freedom_increase": 126,
        "enjoyment_increase": 40
      },
      "focus": "Identify and Eliminate Waste",
      "actions": [
        "Track all spending for 30 days",
        "Cancel unused subscriptions",
        "Identify impulse purchases",
        "Find one area to optimize (e.g., groceries, dining out)"
      ],
      "difficulty": "Easy",
      "categories": ["Subscriptions", "Streaming Services", "Gym/Memberships"],
      "progress": {
        "percentComplete": 25,
        "remainingGap": 784
      }
    },

    {
      "month": 2,
      "target": {
        "M": 1250,
        "E": 2296,
        "F": 1064,
        "J": 390
      },
      "changes": {
        "essentials_reduction": 238,
        "freedom_increase": 188,
        "enjoyment_increase": 50
      },
      "focus": "Optimize Daily Habits",
      "actions": [
        "Reduce dining out by 50%",
        "Switch to generic brands for groceries",
        "Batch cook meals for the week",
        "Find free/low-cost entertainment alternatives"
      ],
      "difficulty": "Moderate",
      "categories": ["Food/Dining", "Groceries", "Entertainment"],
      "progress": {
        "percentComplete": 50,
        "remainingGap": 546
      }
    },

    {
      "month": 3,
      "target": {
        "M": 1250,
        "E": 2035,
        "F": 1261,
        "J": 454
      },
      "changes": {
        "essentials_reduction": 261,
        "freedom_increase": 197,
        "enjoyment_increase": 64
      },
      "focus": "Negotiate and Shop Smart",
      "actions": [
        "Negotiate bills (internet, phone, insurance)",
        "Shop for better rates on utilities",
        "Use coupons and cashback apps",
        "Review and optimize transportation costs"
      ],
      "difficulty": "Moderate",
      "categories": ["Bills", "Utilities", "Transportation"],
      "progress": {
        "percentComplete": 75,
        "remainingGap": 285
      }
    },

    {
      "month": 4,
      "target": {
        "M": 1250,
        "E": 1750,
        "F": 1500,
        "J": 500
      },
      "changes": {
        "essentials_reduction": 285,
        "freedom_increase": 239,
        "enjoyment_increase": 46
      },
      "focus": "Lifestyle Adjustments",
      "actions": [
        "Consider roommate or housing downgrade if needed",
        "Evaluate car vs. public transit costs",
        "Cut remaining non-essential spending",
        "Optimize insurance coverage"
      ],
      "difficulty": "Challenging",
      "categories": ["Housing", "Transportation", "Insurance"],
      "progress": {
        "percentComplete": 100,
        "remainingGap": 0
      }
    }
  ],

  "tips": [
    {
      "category": "Automation",
      "tip": "Set up automatic transfers to your Freedom bucket on payday. Pay yourself first!",
      "icon": "🤖"
    },
    {
      "category": "Tracking",
      "tip": "Use a budgeting app (Mint, YNAB, EveryDollar) to track progress in real-time.",
      "icon": "📊"
    },
    {
      "category": "Priority-Specific",
      "tip": "Keep your emergency fund in a high-yield savings account (4-5% APY) so it grows while you build it.",
      "icon": "🏦"
    },
    {
      "category": "Motivation",
      "tip": "This is a marathon, not a sprint. Celebrate small wins along the way!",
      "icon": "🎉"
    }
  ]
}
```

---

## 🔄 **Plan Adjustment Algorithm**

### **When Student Struggles:**

```javascript
function adjustProgressPlan(currentMilestone, actualSpending, targetSpending) {
  const variance = actualSpending - targetSpending;

  // If variance is significant (>$200), extend timeline
  if (variance > 200) {
    // Recalculate remaining milestones with gentler slope
    const remainingMonths = getRemainingMilestones().length;
    const newTimeline = remainingMonths + 1;  // Add one month

    const remainingGap = actualSpending - targetSpending;
    const newMonthlyReduction = remainingGap / newTimeline;

    return {
      action: "extend_timeline",
      message: "Let's add an extra month to make this more achievable.",
      newTimeline: newTimeline,
      newMonthlyTarget: newMonthlyReduction,
      encouragement: "It's better to take a bit longer and succeed than to rush and fail!"
    };
  }

  // If variance is moderate (<$200), suggest specific help
  if (variance > 50 && variance <= 200) {
    return {
      action: "provide_support",
      message: "You're close! Let's identify specific cuts to close the gap.",
      suggestions: [
        "Review your biggest spending categories this month",
        "Are there any one-time expenses we can avoid next month?",
        "Consider the 30-day rule: Wait 30 days before non-essential purchases"
      ],
      keepCurrentTarget: true
    };
  }

  return null;  // On track, no adjustment needed
}
```

---

## 📊 **Data Storage for Progress Tracking**

```javascript
// Store in TOOL4_SCENARIOS sheet
progressPlan = {
  scenarioId: "ABC123",
  clientId: "STUDENT001",
  createdAt: "2025-11-18",

  // Plan details
  timeline: 4,  // months
  currentMonth: 1,
  status: "active",  // active, completed, paused, adjusted

  // Milestones
  milestones: [ /* array of milestones */ ],

  // Progress tracking
  completedMilestones: [],
  currentMilestone: 1,

  // Update history
  updates: [
    {
      date: "2025-12-18",
      month: 1,
      reported: {
        essentials: 2550,
        hitTarget: "Close",
        challenges: "Unexpected car repair"
      },
      variance: 16,  // $2,550 vs $2,534 target
      action: "advance_milestone",  // success!
      notes: "Great job handling unexpected expense!"
    }
  ],

  // Next update reminder
  nextUpdatePrompt: "2025-12-18",

  // Adjustments made
  adjustments: []
};
```

---

## ✅ **ALGORITHM SUMMARY**

### **Step-by-Step Process:**

1. **Calculate Gap** - Determine difference between current and target allocations
2. **Determine Timeline** - 2-6 months based on gap size (larger gaps = longer timeline)
3. **Generate Monthly Reductions** - Progressive strategy (70%, 100%, 110%, 120%...)
4. **Assign Monthly Focus** - Match reduction difficulty to month (easy → challenging)
5. **Create Milestones** - Define targets, actions, and categories for each month
6. **Generate Tips** - Provide priority-specific and general success tips
7. **Set Update Triggers** - Prompt at 30 days, 1 week before milestone, or when overdue
8. **Handle Updates** - Advance, retry, or adjust based on student progress

### **Key Design Decisions:**

✅ **Progressive reduction** (not linear) - Builds confidence with early wins
✅ **Timeline based on gap size** - Realistic expectations
✅ **Specific monthly focus** - One main area per month prevents overwhelm
✅ **Flexible adjustment** - Can extend timeline if student struggles
✅ **Concrete actions** - Not just "reduce spending" but specific tactics
✅ **Encouragement system** - Positive reinforcement throughout journey

---

## 🎯 **Success Criteria**

A good progress plan should:
- ✅ Feel achievable (not overwhelming)
- ✅ Start with easy wins (build momentum)
- ✅ Have clear monthly focus (not vague "spend less")
- ✅ Provide specific actions (tactical, not aspirational)
- ✅ Allow flexibility (can adjust if life happens)
- ✅ Track progress (monthly check-ins with feedback)
- ✅ Celebrate wins (positive reinforcement)

---

**Algorithm Complete:** November 18, 2025
**Status:** ✅ Ready for Implementation
**Next:** Item 5 - Validate Modifiers System
