# Tool 4 Redesign Specification: Hybrid V1 + Calculator Architecture

**Created:** 2025-11-28
**Last Updated:** 2025-11-28
**Status:** Phase 1 In Progress (Week 4)
**Purpose:** Complete architectural specification for Tool 4 redesign combining V1's personalization engine with interactive calculator

---

## 🎯 Executive Summary

Tool 4 will evolve from a simple priority-selection calculator into a **guided discovery system** that combines:
- **V1's sophisticated modifier engine** (personalized allocation based on behavioral traits)
- **Interactive calculator** (student agency + real-time exploration)
- **Contextual safety rails** (intelligent helpers when students get stuck)
- **Scenario comparison** (Tool 8 pattern for exploring multiple approaches)
- **Implementation bridge** (from "here's your plan" to "do these 3 things today")

**Core Philosophy:** This is not just about numbers. It's about reclaiming internal power and rewriting financial patterns trauma may have left behind.

---

## 📋 Decision Log

### **Critical Decisions Made**

1. **V1 Engine Integration: Option A (Port into Tool 4)**
   - Port V1's `calculateAllocations()` directly into `Tool4.js`
   - Adapt to accept Tool 1/2/3 data + 12 new behavioral questions
   - Keeps all logic in one place for maintainability

2. **Pre-Survey Pattern: Option C (Hybrid)**
   - Ask 5-7 critical questions upfront (satisfaction, discipline, impulse, timeline)
   - Calculator loads with those answers
   - "Want better recommendations? Answer 5 more optional questions" link for refinement

3. **Calculator Loading: Option B (Skip straight to calculator with pre-filled values)**
   - Calculator loads with V1's calculated M/E/F/J already filled in
   - V1's reasoning appears as tooltips/sidebar ("Why these numbers?")
   - Students can immediately start adjusting

4. **Lock Feature: Option A (Lock icon + fixed input)**
   - Lock icon toggles on/off for each bucket
   - Locked input becomes read-only
   - Visual indicator shows locked state

5. **Redistribution Logic: Option A (Proportional to current values)**
   - When bucket locked and another adjusted, remaining buckets redistribute proportionally
   - Preserves relative relationships student has established
   - Example: If F=25% and J=15% (total 40%), and student adds 10% to M, F loses 6.25% and J loses 3.75%

6. **Safety Rails Trigger: Scenario A + Always-available helpers**
   - Student adjusts buckets freely
   - "Check My Plan" button triggers validation
   - All validation types offered (financial rules, behavioral flags, values alignment)

7. **Insights Sidebar: Option C (Progressive disclosure)**
   - Starts simple: "📊 Your Allocation: M25% | E35% | F35% | J15%"
   - Expandable: "[Why these numbers? ▼]"
   - Second level: "Based on 'Build Wealth' priority + 3 adjustments"
   - Third level: "[Show detailed breakdown ▼]" → Full V1 modifier notes

8. **Scenario Management: Option A (Tool 8 pattern - Explicit "Save Scenario")**
   - Student adjusts buckets
   - Clicks "Save as Scenario" → names it "Aggressive Debt Payoff"
   - Resets calculator → adjusts again → saves "Balanced Plan"
   - Compare button shows all scenarios side-by-side

---

## 🔄 Student Journey Flow

### **Phase 1: Data Gathering (Pre-Calculator)**

**What Happens:**
1. Tool 4 pulls completed Tool 1/2/3 data
2. Shows pre-survey: 7 critical behavioral questions
3. Runs V1 calculation engine server-side
4. Shows loading: "Building your personalized plan based on your unique profile..."

**Data Sources:**

#### **From Tool 1** (via middleware)
- `winner` → Informs which modifiers to emphasize
- `scores.FSV` → Maps to avoidance behaviors
- `scores.ExVal` → Maps to approval-seeking patterns
- `scores.Showing` → Maps to over-giving tendencies
- `scores.Control` → Maps to rigidity or chaos
- `scores.Fear` → Maps to anxiety-driven decisions
- `formData.name`, `formData.email` → Pre-fill identity

#### **From Tool 2** (via middleware)
- `formData.dependents` → V1 input: `dependents`
- `formData.age` + `formData.marital` + `formData.employment` → Derive: `stageOfLife`
- `formData.goalConfidence` → V1 input: `literacyLevel`
- `formData.emergencyFundMonths` → V1 input: `emergencyFund`
- `formData.incomeConsistency` → Map to: `incomeStability`
- `formData.currentDebts` → Derive: `debtLoad` (or ask in pre-survey)
- `formData.debtStress` → Derive: `interestLevel` (or ask in pre-survey)

#### **From Tool 3** (via middleware)
- `overallQuotient` → General disconnection severity
- `domain1` (FSV quotient) → Validates Tool 1 FSV score
- `domain2` (ExVal quotient) → Validates Tool 1 ExVal score

#### **Pre-Survey Questions (7 critical + 5 optional)**

**Critical Questions (must answer):**
1. **Satisfaction** (1-10): "How dissatisfied are you with your current financial situation?"
   - *Why critical:* Amplifies ALL positive modifiers (V1's satisfaction boost)
2. **Discipline** (1-10): "How would you rate your financial discipline?"
   - *Maps to:* V1 Multiply bucket modifier
3. **Impulse Control** (1-10): "How strong is your impulse control with spending?"
   - *Maps to:* V1 Enjoyment bucket modifier
4. **Long-term Focus** (1-10): "How focused are you on long-term financial goals?"
   - *Maps to:* V1 Multiply bucket modifier
5. **Goal Timeline** (Dropdown): "When do you want to reach your primary financial goal?"
   - Options: "Within 6 months", "6-12 months", "1-2 years", "3-5 years", "5+ years"
   - *Maps to:* V1 Freedom bucket modifier
6. **Monthly Income Range** (Dropdown): "What is your monthly net income?"
   - Options: "A: < $2,500", "B: $2,500-$5,000", "C: $5,000-$10,000", "D: $10,000-$20,000", "E: > $20,000"
   - *Maps to:* V1 `incomeRange`
7. **Current Essentials** (Dropdown): "What percentage of income goes to essentials?"
   - Options: "A: < 10%", "B: 10-20%", "C: 20-30%", "D: 30-40%", "E: 40-50%", "F: > 50%"
   - *Maps to:* V1 `essentialsRange`

**Optional Questions (for refinement):**
8. **Emotional Spending** (1-10): "How often do you spend money to manage emotions?"
9. **Emotional Safety** (1-10): "How much do you need financial safety to feel secure?"
10. **Financial Avoidance** (1-10): "How often do you avoid looking at your finances?"
11. **Lifestyle Priority** (1-10): "How important is enjoying life now vs. saving?"
12. **Autonomy Preference** (1-10): "Do you prefer following expert advice or making your own choices?"

---

### **Phase 2: Calculator Screen (Main Interface)**

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Financial Freedom Framework Calculator                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Left Panel (60% width):                                    │
│  ┌────────────────────────────────────┐                     │
│  │ 💰 Multiply: 25% ($1,250/mo) [🔒] │                     │
│  │ [=================|            ]   │                     │
│  │                                    │                     │
│  │ 🏠 Essentials: 35% ($1,750/mo)    │                     │
│  │ [========================|     ]   │                     │
│  │                                    │                     │
│  │ 🚀 Freedom: 25% ($1,250/mo)       │                     │
│  │ [=================|            ]   │                     │
│  │                                    │                     │
│  │ 🎉 Enjoyment: 15% ($750/mo)       │                     │
│  │ [===========|                  ]   │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  Right Sidebar (40% width):                                 │
│  ┌────────────────────────────────────┐                     │
│  │ 📊 Why These Numbers?              │                     │
│  │                                    │                     │
│  │ We started with your "Build Wealth"│                     │
│  │ priority, then adjusted for:       │                     │
│  │                                    │                     │
│  │ ✓ High debt load → +15% Freedom   │                     │
│  │ ✓ Unstable income → +5% Essentials│                     │
│  │ ✓ Low discipline → -10% Multiply  │                     │
│  │                                    │                     │
│  │ [Show detailed breakdown ▼]        │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  Bottom Actions:                                            │
│  [Check My Plan] [Save Scenario] [Compare Scenarios]       │
└─────────────────────────────────────────────────────────────┘
```

**Interaction Behaviors:**

1. **Slider Adjustment:**
   - Drag slider or click increment/decrement buttons
   - Real-time updates to both % and $ amounts
   - If NO buckets locked: All 4 buckets adjust to maintain 100%
   - If bucket(s) locked: Only unlocked buckets redistribute

2. **Lock Feature:**
   - Click 🔒 icon to lock/unlock bucket
   - Locked bucket: Input grayed out, slider disabled
   - Multiple buckets can be locked simultaneously
   - Must have at least 1 unlocked bucket

3. **Progressive Disclosure Sidebar:**
   - Collapsed by default: "Why These Numbers? ▼"
   - First expansion: 3-bullet summary of major adjustments
   - Second expansion: Full V1 modifier breakdown per bucket
   - Third expansion: Mathematical trace (base → raw → normalized → final)

---

### **Phase 3: Safety Rails & Contextual Helpers**

**"Check My Plan" Button Triggers:**

#### **Financial Rules Validation**
```javascript
// Red flags from V1
- Essentials > 35% of income → "⚠️ High essentials spending"
- Multiply < 10% → "⚠️ Low investment allocation"
- Enjoyment > 40% → "⚠️ High discretionary spending"
- Emergency fund < 2 months (from Tool 2) → "⚠️ Build emergency fund"
- High debt (Tool 2) + low Freedom → "⚠️ Debt/Freedom mismatch"
```

#### **Behavioral Flags Validation**
```javascript
// Cross-reference with pre-survey
- High satisfaction (8-10) but Enjoyment 45% → "Are you sure?"
- Low discipline (1-3) but Multiply 40% → "This might be too aggressive"
- High emotional spending (8-10) but Enjoyment 10% → "May lead to binge spending"
```

#### **Values Alignment Validation**
```javascript
// Priority vs. allocation mismatch
- Priority: "Get Out of Debt" but Freedom < 30% → "Mismatch detected"
- Priority: "Build Wealth" but Multiply < 20% → "Consider increasing"
- Priority: "Feel Secure" but Essentials < 30% → "May need more safety"
```

**Helper Modules (contextual pop-ups):**

1. **Budget Reality Check**
   - Triggers when: Enjoyment > 40% OR user clicks helper
   - Shows: "$900/mo fun money = $450 dining + $200 hobbies + $150 entertainment + $100 shopping"
   - Action: "Try our category breakdown tool →"

2. **Gap Analysis**
   - Triggers when: Any validation fails OR user requests
   - Shows: Visual comparison of recommended vs. current allocation
   - Action: "See what's different →"

3. **Priority Re-Check**
   - Triggers when: Values mismatch detected
   - Shows: "Your allocation suggests [inferred priority]. Did you mean to select [selected priority]?"
   - Action: "Change priority" or "Keep current"

---

### **Phase 4: Category Breakdown (Safety Rail Helper)**

**When Activated:**
- From "Check My Plan" if Enjoyment > 40%
- From manual "Show Categories" button
- After scenario comparison if gaps detected

**Current Implementation (Week 3 - KEEP THIS):**
- 8 categories: Housing, Food, Transportation, Healthcare, Debt, Savings, Discretionary, Personal
- Income-tier based percentages (low/mid/high income)
- Real-time validation (±$50 or ±2% tolerance)
- Gap analysis visualization
- Auto-distribute button
- Save to TOOL4_SCENARIOS sheet

**Enhancement Needed:**
- Make this OPTIONAL, not automatic
- Trigger based on safety rail detection
- Show as "Would you like to see how this breaks down into categories?"

---

### **Phase 5: Scenario Comparison (Tool 8 Pattern)**

**Workflow:**
1. Student adjusts calculator
2. Clicks "Save as Scenario" button
3. Modal appears: "Name this scenario:"
4. Student enters: "Aggressive Debt Payoff"
5. Scenario saved to TOOL4_SCENARIOS sheet
6. Calculator resets to V1 recommendation
7. Student adjusts again
8. Saves as "Balanced Plan"
9. Clicks "Compare Scenarios" button
10. Side-by-side comparison table appears

**Comparison View:**

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Scenario Comparison                                      │
├───────────────┬──────────────────┬──────────────────────────┤
│               │ Aggressive Debt  │ Balanced Plan            │
├───────────────┼──────────────────┼──────────────────────────┤
│ Multiply      │ 15%              │ 25%  (+10%)              │
│ Essentials    │ 35%              │ 35%  (same)              │
│ Freedom       │ 40%              │ 25%  (-15%)              │
│ Enjoyment     │ 10%              │ 15%  (+5%)               │
├───────────────┼──────────────────┼──────────────────────────┤
│ Debt payoff   │ 24 months        │ 36 months                │
│ Emergency $   │ $5,000 (3mo)     │ $7,500 (4.5mo)           │
├───────────────┼──────────────────┼──────────────────────────┤
│ [ Choose ]    │ [ Choose ]       │                          │
└───────────────┴──────────────────┴──────────────────────────┘
```

**Actions:**
- "Choose This Plan" → Sets as active scenario
- "Edit Scenario" → Loads into calculator
- "Delete Scenario" → Removes from saved list
- "Generate Report" → Creates final implementation plan

---

## 🔧 Technical Architecture

### **V1 Modifier Engine Integration**

**File:** `/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationFunction.js`

**Port this function into `/tools/tool4/Tool4.js`:**

```javascript
/**
 * V1 Allocation Engine (ported from standalone app)
 * Calculates personalized M/E/F/J allocation based on:
 * - Financial reality (income, debt, emergency fund)
 * - Behavioral traits (discipline, impulse, satisfaction)
 * - Motivational drivers (lifestyle, growth, stability)
 * - Life context (dependents, timeline, stage of life)
 */
function calculatePersonalizedAllocation(input) {
  // This is V1's calculateAllocations() function
  // Adapted to work within Tool 4 architecture

  // 1) Base weights by priority (same as current BASE_WEIGHTS)
  const baseMap = {
    'wealth':   { M:40, E:25, F:20, J:15 },
    'debt':     { M:15, E:25, F:45, J:15 },
    'secure':   { M:25, E:35, F:30, J:10 },
    'enjoy':    { M:20, E:20, F:15, J:45 },
    // ... all 10 priorities
  };

  // 2) Apply Financial Modifiers
  // - Income level → Multiply adjustment
  // - Debt load → Freedom boost
  // - Interest level → Freedom boost
  // - Emergency fund → Freedom/Essentials adjustment
  // - Income stability → Essentials/Freedom buffer

  // 3) Apply Satisfaction Amplifier (V1's secret sauce)
  const satFactor = 1 + Math.max(0, input.satisfaction - 5) * 0.1;
  // Amplifies ALL positive modifiers

  // 4) Apply Behavioral Modifiers
  // - Discipline → Multiply
  // - Impulse → Enjoyment
  // - Long-term focus → Multiply
  // - Emotional spending → Enjoyment
  // - Emotional safety → Essentials + Freedom
  // - Financial avoidance → Multiply (negative) + Freedom

  // 5) Apply Motivational Modifiers
  // - Lifestyle priority → Enjoyment
  // - Growth orientation → Multiply
  // - Stability orientation → Freedom
  // - Goal timeline → Freedom (short term) vs Multiply (long term)
  // - Dependents → Essentials
  // - Autonomy preference → Multiply vs Essentials/Freedom

  // 6) Apply Life Stage Modifiers
  // - Pre-retirement → Multiply (reduce), Freedom (increase)
  // - Variable income → Essentials + Freedom buffer
  // - Low financial confidence → Focus basics (Essentials + Freedom)

  // 7) Enforce Safety Rails
  const essentialMinPct = Math.max(
    CONFIG.essentialPctMap[input.essentialsRange],
    CONFIG.minEssentialsAbsolutePct  // 40% floor
  );

  // 8) Normalize to 100%

  // 9) Build modifier notes for each bucket
  const notes = {
    Multiply: {
      financial: "...",
      behavioral: "...",
      motivational: "..."
    },
    // ... for all 4 buckets
  };

  return {
    percentages: { M: 25, E: 35, F: 25, J: 15 },
    notes: notes,
    trace: {
      basePriority: "Build Long-Term Wealth",
      baseWeights: "M40%, E25%, F20%, J15%",
      rawScores: "M25%, E35%, F35%, J15%",
      satBoostPct: 20,  // 20% boost from satisfaction=7
      finalScores: "M25%, E35%, F25%, J15%"
    }
  };
}
```

**Input Mapper Function:**

```javascript
/**
 * Maps Tool 1/2/3 data + pre-survey answers → V1 input format
 */
function buildV1Input(clientId, preSurveyAnswers) {
  // Get Tool 1/2/3 data via DataService
  const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
  const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
  const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

  // Map to V1 input structure
  return {
    // From pre-survey (critical)
    incomeRange: preSurveyAnswers.incomeRange,
    essentialsRange: preSurveyAnswers.essentialsRange,
    satisfaction: preSurveyAnswers.satisfaction,
    discipline: preSurveyAnswers.discipline,
    impulse: preSurveyAnswers.impulse,
    longTerm: preSurveyAnswers.longTerm,
    goalTimeline: preSurveyAnswers.goalTimeline,

    // From pre-survey (optional - use defaults if not provided)
    emotionSpend: preSurveyAnswers.emotionSpend || 5,
    emotionSafety: preSurveyAnswers.emotionSafety || 5,
    avoidance: preSurveyAnswers.avoidance || 5,
    lifestyle: preSurveyAnswers.lifestyle || 5,
    autonomy: preSurveyAnswers.autonomy || 5,
    growth: deriveGrowthFromTool2(tool2Data),
    stability: deriveStabilityFromTool2(tool2Data),

    // From Tool 2
    dependents: tool2Data?.formData?.dependents || 0,
    emergencyFund: mapEmergencyFundMonths(tool2Data?.formData?.emergencyFundMonths),
    incomeStability: mapIncomeStability(tool2Data?.formData?.incomeConsistency),
    stageOfLife: deriveStageOfLife(tool2Data?.formData),
    literacyLevel: tool2Data?.formData?.goalConfidence || 0,

    // From Tool 2 or pre-survey
    debtLoad: deriveDebtLoad(tool2Data?.formData?.currentDebts, tool2Data?.formData?.debtStress),
    interestLevel: deriveInterestLevel(tool2Data?.formData?.debtStress),

    // From Tool 4
    priority: preSurveyAnswers.selectedPriority  // User's priority selection
  };
}
```

---

### **Calculator UI Components**

**Bucket Slider Component:**

```javascript
function renderBucketSlider(bucket, percentage, dollars, isLocked) {
  return `
    <div class="bucket-slider ${isLocked ? 'locked' : ''}">
      <div class="bucket-header">
        <span class="bucket-icon">${bucket.icon}</span>
        <span class="bucket-name">${bucket.name}</span>
        <span class="bucket-amount">${percentage}% ($${dollars.toLocaleString()}/mo)</span>
        <button class="lock-btn" onclick="toggleLock('${bucket.id}')">
          ${isLocked ? '🔒' : '🔓'}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value="${percentage}"
        class="slider ${isLocked ? 'disabled' : ''}"
        ${isLocked ? 'disabled' : ''}
        oninput="adjustBucket('${bucket.id}', this.value)"
      />
    </div>
  `;
}
```

**Redistribution Logic:**

```javascript
function adjustBucket(bucketId, newPercentage) {
  const lockedBuckets = getLockedBuckets();
  const unlockedBuckets = getAllBuckets().filter(b =>
    !lockedBuckets.includes(b.id) && b.id !== bucketId
  );

  // Calculate how much needs to be redistributed
  const oldTotal = getAllBuckets().reduce((sum, b) => sum + b.percentage, 0);
  const oldValue = getBucket(bucketId).percentage;
  const delta = newPercentage - oldValue;

  // Calculate total of unlocked buckets (excluding the one being adjusted)
  const unlockedTotal = unlockedBuckets.reduce((sum, b) => sum + b.percentage, 0);

  // Proportional redistribution
  unlockedBuckets.forEach(bucket => {
    const proportion = bucket.percentage / unlockedTotal;
    const adjustment = delta * proportion;
    bucket.percentage -= adjustment;

    // Ensure no negative values
    bucket.percentage = Math.max(0, bucket.percentage);
  });

  // Update the adjusted bucket
  getBucket(bucketId).percentage = newPercentage;

  // Re-render UI
  renderAllSliders();
}
```

---

### **Insights Sidebar Component**

```javascript
function renderInsightsSidebar(v1Result, isExpanded) {
  if (!isExpanded) {
    return `
      <div class="insights-sidebar collapsed">
        <h3>📊 Why These Numbers?</h3>
        <button onclick="toggleInsights()">Show Details ▼</button>
      </div>
    `;
  }

  // First expansion level: Simple summary
  if (isExpanded === 'simple') {
    return `
      <div class="insights-sidebar">
        <h3>📊 Why These Numbers?</h3>
        <p>We started with your "${v1Result.trace.basePriority}" priority, then adjusted for:</p>
        <ul>
          ${v1Result.topModifiers.map(mod => `<li>${mod.icon} ${mod.description}</li>`).join('')}
        </ul>
        <button onclick="toggleInsights('detailed')">Show Detailed Breakdown ▼</button>
      </div>
    `;
  }

  // Second expansion: Full breakdown
  return `
    <div class="insights-sidebar detailed">
      <h3>📊 Complete Breakdown</h3>
      ${renderBucketDetails(v1Result.notes.Multiply, 'Multiply')}
      ${renderBucketDetails(v1Result.notes.Essentials, 'Essentials')}
      ${renderBucketDetails(v1Result.notes.Freedom, 'Freedom')}
      ${renderBucketDetails(v1Result.notes.Enjoyment, 'Enjoyment')}
      <details>
        <summary>Mathematical Trace</summary>
        <pre>${JSON.stringify(v1Result.trace, null, 2)}</pre>
      </details>
      <button onclick="toggleInsights('simple')">Collapse ▲</button>
    </div>
  `;
}
```

---

## 📊 Data Schema Extensions

### **TOOL4_SCENARIOS Sheet (Enhanced)**

Add columns for V1 engine outputs:

```
Existing columns (A-AJ): 35 columns
New columns (AK-AZ): 15 columns

AK: V1_BasePriority (string)
AL: V1_BaseWeights (string)
AM: V1_RawScores (string)
AN: V1_SatBoostPct (number)
AO: V1_Multiply_Financial_Mods (string)
AP: V1_Multiply_Behavioral_Mods (string)
AQ: V1_Multiply_Motivational_Mods (string)
AR: V1_Essentials_Financial_Mods (string)
AS: V1_Essentials_Behavioral_Mods (string)
AT: V1_Essentials_Motivational_Mods (string)
AU: V1_Freedom_Financial_Mods (string)
AV: V1_Freedom_Behavioral_Mods (string)
AW: V1_Freedom_Motivational_Mods (string)
AX: V1_Enjoyment_Financial_Mods (string)
AY: V1_Enjoyment_Behavioral_Mods (string)
AZ: V1_Enjoyment_Motivational_Mods (string)
BA: PreSurvey_Satisfaction (number 1-10)
BB: PreSurvey_Discipline (number 1-10)
BC: PreSurvey_Impulse (number 1-10)
BD: PreSurvey_LongTerm (number 1-10)
BE: PreSurvey_GoalTimeline (string)
BF: PreSurvey_IncomeRange (string)
BG: PreSurvey_EssentialsRange (string)
```

---

## 🚀 Implementation Roadmap

### **Phase 1: V1 Engine Port (Week 4)** ✅ IN PROGRESS

**Tasks:**
1. ✅ Copy `AllocationFunction.js` from V1 app
2. ✅ Adapt `calculateAllocations()` → `calculateAllocationV1()` (Tool4.js:1292-1512)
3. ✅ Create test function `testAllocationEngine()` (tests/Tool4Tests.js:1211-1288)
4. ⏳ Build `buildV1Input()` mapper function
5. ⏳ Build helper functions:
   - `deriveGrowthFromTool2()`
   - `deriveStabilityFromTool2()`
   - `deriveStageOfLife()`
   - `mapEmergencyFundMonths()`
   - `mapIncomeStability()`
   - `deriveDebtLoad()`
   - `deriveInterestLevel()`
6. ⏳ Test with sample Tool 1/2/3 data
7. ⏳ Validate outputs match V1 expectations

**Success Criteria:**
- ✅ V1 engine runs server-side in Tool 4
- ✅ Given same inputs, produces same M/E/F/J percentages as V1
- ✅ Modifier notes correctly categorized (Financial/Behavioral/Motivational)
- ⏳ Integration with Tools 1/2/3 data working
- ⏳ All helper functions tested

**Current Implementation Status:**
- **File:** `/tools/tool4/Tool4.js` (lines 1292-1512)
- **Function:** `calculateAllocationV1(input)`
- **Test Suite:** `/tests/Tool4Tests.js` (lines 1211-1288)
- **Test Results:** ✅ Both test cases passing (100% sum, satisfaction amplification working)
- **Deployed:** ✅ Version pushed to Apps Script
- **Committed:** ✅ Commit 9a818c9 "refactor(tool4): Move test function to proper test file"

**Test Case 1 Results (Build Long-Term Wealth):**
- Percentages: M:41%, E:40%, F:8%, J:11%
- Satisfaction Boost: 20%
- Modifiers: High discipline, strong long-term focus, high growth orientation

**Test Case 2 Results (Get Out of Debt):**
- Percentages: M:8%, E:40%, F:52%, J:0%
- Satisfaction Boost: 0% (low satisfaction)
- Modifiers: Severe debt load, high-interest debt, unstable income

---

### **Phase 2: Pre-Survey UI (Week 4)**

**Tasks:**
1. Design pre-survey page (7 critical questions)
2. Add "Optional Questions" section (5 additional)
3. Build form validation
4. Save pre-survey responses to session
5. Call `calculatePersonalizedAllocation()` on submission
6. Show loading screen: "Building your personalized plan..."
7. Transition to calculator with pre-filled values

**Success Criteria:**
- All 7 critical questions required
- Optional questions show/hide toggle
- Validation prevents submission with missing critical fields
- Calculator loads with V1-calculated percentages

---

### **Phase 3: Interactive Calculator (Week 5)**

**Tasks:**
1. Build bucket slider component
2. Add lock/unlock functionality
3. Implement proportional redistribution logic
4. Build insights sidebar (progressive disclosure)
5. Add "Reset to Recommended" button
6. Add "Check My Plan" button
7. Add "Save Scenario" button

**Success Criteria:**
- Sliders adjust smoothly
- Lock feature works correctly
- Redistribution maintains 100% total
- Insights sidebar shows V1 reasoning
- All buttons functional

---

### **Phase 4: Safety Rails & Helpers (Week 5)**

**Tasks:**
1. Build validation engine (financial rules + behavioral flags + values alignment)
2. Create "Budget Reality Check" helper
3. Create "Gap Analysis" helper (use existing Week 3 code)
4. Create "Priority Re-Check" helper
5. Build contextual popup system
6. Wire "Check My Plan" to validation engine

**Success Criteria:**
- All 3 validation types detect issues correctly
- Helpers trigger at appropriate times
- User can dismiss or engage with helpers
- Validation results clear and actionable

---

### **Phase 5: Scenario Comparison (Week 6)**

**Tasks:**
1. Build "Save as Scenario" modal
2. Extend TOOL4_SCENARIOS sheet schema (add V1 columns)
3. Build scenario list UI
4. Build side-by-side comparison table
5. Add "Edit" and "Delete" scenario actions
6. Add "Generate Report" functionality

**Success Criteria:**
- Multiple scenarios saved correctly
- Comparison table shows differences clearly
- User can switch between scenarios
- Report generation works (PDF or Google Doc)

---

## 📚 Reference Documents

- **V1 Allocation Engine:** `/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationFunction.js`
- **Tool 1/2/3 Data Schema:** `/docs/middleware-mapping.md`
- **Current Tool 4 Implementation:** `/tools/tool4/Tool4.js`
- **Week 3 Category Breakdown:** Lines 443-536 in `/tools/tool4/Tool4.js`
- **Tool 8 Scenario Pattern:** `/apps/Tool-8-investment-tool/` (legacy reference)

---

## 🎯 Success Metrics

**User Experience:**
- [ ] Student sees personalized allocation based on their unique profile
- [ ] Student understands WHY recommendations are what they are
- [ ] Student has agency to adjust and explore scenarios
- [ ] Student receives contextual help when stuck
- [ ] Student can compare multiple approaches
- [ ] Student gets actionable implementation plan

**Technical:**
- [ ] V1 engine produces consistent results
- [ ] Calculator maintains 100% allocation
- [ ] Lock feature works without bugs
- [ ] Progressive disclosure reveals appropriate detail levels
- [ ] All validations detect correct conditions
- [ ] Scenarios save/load correctly

**Pedagogical:**
- [ ] Students explore WITHOUT feeling judged
- [ ] Students learn through experimentation
- [ ] Students connect allocation to values
- [ ] Students see trade-offs clearly
- [ ] Students feel empowered, not overwhelmed

---

## 🔑 Key Design Principles

1. **Agency with Guardrails** - Student control + intelligent assistance
2. **Progressive Disclosure** - Simple → Complex as needed
3. **Trauma-Informed** - No shame, permission to explore, celebrate progress
4. **Transparency** - Show the "why" behind recommendations
5. **Experimentation** - Scenarios encourage exploration
6. **Implementation Bridge** - From plan to action

---

## 📝 Implementation Progress Log

### **2025-11-28: Phase 1 Kickoff**

**Completed:**
1. ✅ Ported V1 allocation engine from `/apps/Tool-4-financial-freedom-framework-tool/scripts/AllocationFunction.js`
2. ✅ Created `calculateAllocationV1()` function in Tool4.js (lines 1292-1512)
3. ✅ Implemented 3-tier modifier system:
   - Financial modifiers (income, debt, emergency fund, stability)
   - Behavioral modifiers (discipline, impulse, long-term focus) with satisfaction amplification
   - Motivational modifiers (lifestyle, growth, stability, timeline, dependents, autonomy)
4. ✅ Created test suite in `/tests/Tool4Tests.js` (lines 1211-1288)
5. ✅ Validated engine with 2 test cases:
   - Test 1: Build Long-Term Wealth (high discipline) → M:41%, E:40%, F:8%, J:11%
   - Test 2: Get Out of Debt (severe debt) → M:8%, E:40%, F:52%, J:0%
6. ✅ Deployed to Apps Script and committed to GitHub (9a818c9)

**In Progress:**
- Building mapper functions to integrate with Tools 1/2/3 data
- Creating pre-survey UI for 7 critical behavioral questions

**Next Steps:**
1. Build `buildV1Input()` mapper function
2. Create helper functions for Tool 2 data derivation
3. Design and implement pre-survey UI
4. Test end-to-end flow with real Tool 1/2/3 data

**Technical Notes:**
- V1 engine successfully ported with zero errors
- Satisfaction amplification working correctly (20% boost at satisfaction=7)
- Modifier notes properly categorized for progressive disclosure
- Test function moved to proper test file for code organization
- Essentials floor enforcement working (40% minimum)

---

**Document Maintained By:** Claude Code
**Next Update:** After Phase 2 completion
**Version:** 1.1
