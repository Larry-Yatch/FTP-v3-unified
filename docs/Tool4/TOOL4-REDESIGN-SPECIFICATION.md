# Tool 4 Redesign Specification: Hybrid V1 + Calculator Architecture

**Created:** 2025-11-28
**Last Updated:** 2025-11-29
**Status:** Phase 3 In Progress (Week 5)
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

### **Phase 1: V1 Engine Port (Week 4)** ✅ COMPLETED

**Tasks:**
1. ✅ Copy `AllocationFunction.js` from V1 app
2. ✅ Adapt `calculateAllocations()` → `calculateAllocationV1()` (Tool4.js:1521-1741)
3. ✅ Create test function `testAllocationEngine()` (tests/Tool4Tests.js:1211-1288)
4. ✅ Build `buildV1Input()` mapper function (Tool4.js:1751-1811)
5. ✅ Build helper functions (Tool4.js:1813-1937):
   - `deriveGrowthFromTool2()` - Maps investment/savings/retirement to 0-10 scale (lines 1817-1830)
   - `deriveStabilityFromTool2()` - Maps emergency fund/insurance/debt to 0-10 scale (lines 1836-1848)
   - `deriveStageOfLife()` - Categorizes by age and employment status (lines 1853-1865)
   - `mapEmergencyFundMonths()` - Converts Tool 2 scale to V1 tiers (A-E) (lines 1871-1881)
   - `mapIncomeStability()` - Converts Tool 2 consistency to categorical (lines 1886-1893)
   - `deriveDebtLoad()` - Analyzes debt text + stress to determine tier (A-E) (lines 1899-1924)
   - `deriveInterestLevel()` - Maps debt stress to interest level (High/Medium/Low) (lines 1929-1937)
6. ✅ Test with sample Tool 1/2/3 data
7. ✅ Validate outputs match V1 expectations
8. ✅ All functions added to production code and deployed

**Success Criteria:**
- ✅ V1 engine runs server-side in Tool 4
- ✅ Given same inputs, produces same M/E/F/J percentages as V1
- ✅ Modifier notes correctly categorized (Financial/Behavioral/Motivational)
- ✅ Integration with Tools 1/2/3 data working
- ✅ All helper functions tested
- ✅ All functions exist as Tool4 methods (not just test files)

**Current Implementation Status:**
- **Core Engine:** `/tools/tool4/Tool4.js` (lines 1521-1741)
  - `calculateAllocationV1(input)` - V1 allocation engine with 3-tier modifiers
- **Integration Layer:** `/tools/tool4/Tool4.js` (lines 1751-1937)
  - `buildV1Input(clientId, preSurveyAnswers)` - Maps Tool 1/2/3 + pre-survey to V1 format
  - 7 helper functions for Tool 2 data derivation (all implemented)
- **Test Suite:** `/tests/Tool4Tests.js` (lines 1211-1504)
  - `testAllocationEngine()` - V1 engine unit tests
  - `testV1InputMapper()` - Input mapping tests
  - `testHelperFunctions()` - Helper function validation tests
  - `testEndToEndIntegration()` - Complete flow test
- **Test Results:** ✅ All test cases passing (100% sum, satisfaction amplification working)
- **Deployed:** ✅ Version pushed to Apps Script (2025-11-29 - COMPLETE with all functions)

**Test Case 1 Results (Build Long-Term Wealth):**
- Percentages: M:41%, E:40%, F:8%, J:11%
- Satisfaction Boost: 20%
- Modifiers: High discipline, strong long-term focus, high growth orientation

**Test Case 2 Results (Get Out of Debt):**
- Percentages: M:8%, E:40%, F:52%, J:0%
- Satisfaction Boost: 0% (low satisfaction)
- Modifiers: Severe debt load, high-interest debt, unstable income

**Integration Layer Features:**
- Safe defaults when Tool 2 data missing
- Tool 2 scale conversions (-5 to +5) → V1 formats (A-E tiers, 0-10 scales)
- Text analysis for debt load detection
- Age-based life stage categorization
- Composite scores from multiple Tool 2 fields

---

### **Phase 2: Pre-Survey UI (Week 4)** ✅ COMPLETED

**Tasks:**
1. ✅ Design pre-survey page (8 critical questions) - Tool4.js:121-804
2. ✅ Add "Optional Questions" section (2 questions) - Lines 624-681
3. ✅ Build form validation (client-side) - Lines 748-768
4. ✅ Save pre-survey responses to PropertiesService - Lines 787-798
5. ✅ Call `calculateAllocationV1()` on submission via buildV1Input - Tool4.js:44-45
6. ✅ Show loading screen: "Building your personalized plan..." - Lines 695-702
7. ✅ Transition to calculator with pre-filled values - Lines 789-791 (reload)
8. ✅ Modified render flow to check pre-survey completion - Tool4.js:35-47

**Success Criteria:**
- ✅ All 8 critical questions required (7 behavioral + 1 priority)
- ✅ Optional questions show/hide toggle (collapsible section)
- ✅ Validation prevents submission with missing critical fields
- ✅ Calculator loads with V1-calculated percentages (flow implemented)
- ✅ Progress indicator tracks completion

**Implementation Details:**

**Pre-Survey Page Structure (Lines 121-804):**
- **Header:** Trauma-informed intro explaining the purpose
- **Progress Bar:** Real-time tracking of completion (0-100%)
- **8 Critical Questions:**
  1. Satisfaction (0-10 slider with labels)
  2. Discipline (0-10 slider)
  3. Impulse Control (0-10 slider)
  4. Long-term Focus (0-10 slider)
  5. Goal Timeline (dropdown: 6mo, 6-12mo, 1-2yr, 2-5yr, 5+yr)
  6. Income Range (dropdown: A-E, $2.5k to $20k+)
  7. Essentials % (dropdown: A-F, <10% to 50%+)
  8. Priority Selection (dropdown: 10 priorities)
- **2 Optional Questions:**
  1. Lifestyle Priority (0-10 slider: save vs. enjoy)
  2. Autonomy Preference (0-10 slider: expert vs. own choice)
- **Loading Overlay:** Spinner + "Building your plan..." message
- **Error Handling:** Inline validation messages

**Features Implemented:**
- ✅ Interactive sliders with real-time value display
- ✅ Smooth animations and transitions
- ✅ Mobile-responsive design (max-width: 800px)
- ✅ Trauma-informed language (non-judgmental, empowering)
- ✅ Color-coded badges (REQUIRED in red, OPTIONAL in gray)
- ✅ Inline help text explaining each question
- ✅ Auto-save on submission via `google.script.run.savePreSurvey()`
- ✅ Auto-reload to show calculator after save
- ✅ Error recovery with user-friendly messages

**Data Flow:**
```
User opens Tool 4 → render()
  ↓
Check getPreSurvey(clientId)
  ↓
IF NULL → buildPreSurveyPage()
  ↓
User fills 8 required questions
  ↓
Submit → savePreSurvey(clientId, formData)
  ↓
Reload page
  ↓
IF NOT NULL → buildV1Input() → calculateAllocationV1()
  ↓
buildCalculatorPage(clientId, baseUrl, toolStatus, allocation, preSurveyData)
```

**Current Status:**
- **Pre-Survey UI:** ✅ Complete and ready to test
- **Calculator Integration:** ⏳ Next step - update calculator to display V1 allocations

---

### **Phase 3: Interactive Calculator (Week 5)** 🔄 IN PROGRESS

**Tasks:**
1. ✅ Build unified page (pre-survey + calculator single view) - Tool4.js:813-1433
2. ✅ Add collapsible pre-survey section - Lines 1123-1291
3. ✅ Display V1 allocation cards (4 buckets) - Lines 1303-1324
4. ✅ Add "Why These Numbers?" insights - Lines 1326-1334
5. ✅ Add "Recalculate" functionality - Lines 1375-1428
6. ⏳ Build interactive sliders for bucket adjustment
7. ⏳ Add lock/unlock functionality per bucket
8. ⏳ Implement proportional redistribution logic
9. ⏳ Add "Reset to Recommended" button
10. ⏳ Add "Check My Plan" validation button
11. ⏳ Add "Save Scenario" button

**Success Criteria:**
- ✅ Pre-survey collapses after first calculation
- ✅ Pre-survey summary bar shows key values when collapsed
- ✅ Click header to expand/collapse pre-survey
- ✅ V1 allocations display correctly (Multiply, Essentials, Freedom, Enjoyment)
- ✅ Insights explain reasoning for each bucket
- ✅ Recalculate updates allocations after pre-survey changes
- ⏳ Sliders adjust smoothly with real-time feedback
- ⏳ Lock feature prevents bucket from changing
- ⏳ Redistribution maintains 100% total
- ⏳ All buttons functional

**Implementation Details:**

**Unified Page Structure (Lines 813-1433):**
- **Single-page layout** with collapsible pre-survey + static allocation display
- **Pre-Survey Section:**
  - Header with toggle button (📊 icon + title)
  - Summary bar (shows Priority, Income, Essentials, Timeline when collapsed)
  - Collapsible form body (8 required + 2 optional questions)
  - Submit button changes text: "Calculate" → "Recalculate"
- **Calculator Section:**
  - 4 allocation bucket cards (static percentages)
  - "Why These Numbers?" insights box
  - ⏳ Interactive sliders (not yet implemented)
  - ⏳ Lock/unlock toggles (not yet implemented)
  - ⏳ Scenario management (not yet implemented)

**Current UX Flow:**
```
First Visit:
  Pre-survey EXPANDED → Fill form → Click "Calculate My Personalized Budget"
  ↓
  Page reloads → Pre-survey COLLAPSED → Allocation cards shown with percentages
  ↓
  Click pre-survey header → EXPAND → Edit values → Click "Recalculate My Budget"
  ↓
  Page reloads → Updated allocations displayed
```

**Next Steps:**
1. Add interactive sliders below allocation cards
2. Pre-fill sliders with V1 percentages
3. Add real-time adjustment with sum validation (must = 100%)
4. Add lock icons to freeze individual buckets
5. Implement proportional redistribution when adjusting with locks
6. Add "Reset to Recommended" to restore V1 values
7. Add "Check My Plan" validation button
8. Add "Save Scenario" functionality

**Current Status:**
- **Static Display:** ✅ Complete - Shows V1 allocations with insights
- **Interactive Adjustment:** ⏳ Not started - Need sliders, locks, redistribution
- **Validation:** ⏳ Not started - Need "Check My Plan" integration
- **Scenarios:** ⏳ Not started - Need save/compare functionality

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

**Completed (2025-11-29 - Session 1):**
1. ✅ Built `buildV1Input()` mapper function
   - Maps Tool 1/2/3 data + pre-survey to V1 format
   - Safe defaults when Tool 2 data missing
   - Error handling with fallback values
2. ✅ Created 7 helper functions for Tool 2 data derivation:
   - `deriveGrowthFromTool2()` - Investment/savings/retirement → 0-10 scale
   - `deriveStabilityFromTool2()` - Emergency fund/insurance/debt → 0-10 scale
   - `deriveStageOfLife()` - Age + employment → life stage categories
   - `mapEmergencyFundMonths()` - Tool 2 scale (-5 to +5) → V1 tiers (A-E)
   - `mapIncomeStability()` - Tool 2 consistency → categorical stability
   - `deriveDebtLoad()` - Text analysis + stress → debt tier (A-E)
   - `deriveInterestLevel()` - Debt stress → interest level (High/Medium/Low)
3. ✅ Built comprehensive test suite (3 new test functions):
   - `testV1InputMapper()` - Tests mapper with missing data
   - `testHelperFunctions()` - Validates all 7 helper functions
   - `testEndToEndIntegration()` - Complete pre-survey → allocation flow
4. ✅ Deployed and tested in Apps Script environment
5. ✅ Local validation complete with real student data:
   - 29 test cases passing (all helper functions)
   - 2 real student profiles validated (Evelia, Greg)
   - Edge cases handled (missing data, empty strings, zero values)
   - See: `docs/Tool4/PHASE1-TEST-RESULTS.md`

**Completed (2025-11-29 - Session 2 - Phase 1 FINALIZED):**
1. ✅ **Phase 1 Review completed** - Identified critical gap in integration functions
   - Review document created: `docs/Tool4/PHASE1-REVIEW.md`
   - Found: Functions existed only in test files, not production code
2. ✅ **Added all 8 integration functions to Tool4.js**:
   - `buildV1Input()` - Tool4.js:1751-1811 (61 lines)
   - `deriveGrowthFromTool2()` - Tool4.js:1817-1830 (14 lines)
   - `deriveStabilityFromTool2()` - Tool4.js:1836-1848 (13 lines)
   - `deriveStageOfLife()` - Tool4.js:1853-1865 (13 lines)
   - `mapEmergencyFundMonths()` - Tool4.js:1871-1881 (11 lines)
   - `mapIncomeStability()` - Tool4.js:1886-1893 (8 lines)
   - `deriveDebtLoad()` - Tool4.js:1899-1924 (26 lines)
   - `deriveInterestLevel()` - Tool4.js:1929-1937 (9 lines)
   - **Total:** 196 lines of production-ready integration code
3. ✅ **Deployed to Apps Script** - All functions now available as Tool4 methods
4. ✅ **Verification complete** - All 9 functions confirmed in production code
5. ✅ **Specification updated** - Corrected all line number references

**Technical Notes:**
- V1 engine successfully ported with zero errors
- Satisfaction amplification working correctly (20% boost at satisfaction=7)
- Modifier notes properly categorized for progressive disclosure
- Test function moved to proper test file for code organization
- Essentials floor enforcement working (40% minimum)
- Integration layer complete with robust error handling
- All helper functions handle edge cases (null values, missing data)
- Text parsing for debt load uses multiple heuristics (keywords + stress level)
- Local test scripts created for rapid validation (`test-integration.js`, `test-e2e-integration.js`)
- **Phase 1 NOW COMPLETE** - All integration functions exist in production code

**Completed (2025-11-29 - Session 3 - Phase 2 Pre-Survey UI):**
1. ✅ **Pre-Survey Page Built** - Complete trauma-informed UI
   - 8 critical questions (7 behavioral + 1 priority)
   - 2 optional questions (lifestyle, autonomy)
   - ~700 lines of HTML/CSS/JavaScript
   - Location: Tool4.js:121-804
2. ✅ **Interactive Features**:
   - Real-time progress bar (tracks completion percentage)
   - Live slider value displays
   - Collapsible optional questions section
   - Client-side validation with error messages
   - Loading overlay with spinner animation
3. ✅ **Modified Render Flow**:
   - Check pre-survey completion (Tool4.js:35-36)
   - Conditional rendering: pre-survey OR calculator (lines 38-47)
   - Auto-calculation of V1 allocations (line 44-45)
   - Pass allocations to calculator (line 46)
4. ✅ **Data Persistence**:
   - Save via `google.script.run.savePreSurvey()` (line 788-798)
   - Auto-reload after save (line 791)
   - PropertiesService integration working
5. ✅ **Documentation Updated**:
   - Phase 2 section marked complete
   - Implementation details added
   - Data flow diagram updated

**Next Steps:**
- Update calculator UI to display V1 allocations
- Add insights sidebar showing "Why these numbers?"
- Implement slider adjustments with lock feature
- Build scenario comparison functionality

---

**Document Maintained By:** Claude Code
**Completed (2025-11-29 - Session 4 - Phase 3 Started):**
1. ✅ **Unified Page Architecture** - Single-page pre-survey + calculator
   - Created `buildUnifiedPage()` function: Tool4.js:813-1433 (620 lines)
   - Replaced two-page flow with collapsible single-page experience
   - Pre-survey starts expanded (first visit) or collapsed (return visit)
2. ✅ **Collapsible Pre-Survey Section**:
   - Header click toggles expand/collapse
   - Summary bar shows key values when collapsed (Priority, Income, Essentials, Timeline)
   - Smooth CSS transitions for expand/collapse animations
   - "Edit Pre-Survey" pattern - click header to modify values
3. ✅ **V1 Allocation Display**:
   - 4 allocation bucket cards (Multiply, Essentials, Freedom, Enjoyment)
   - Static percentage display with visual styling
   - Descriptive labels for each bucket purpose
   - Fixed case sensitivity bug (percentages.Multiply vs percentages.multiply)
4. ✅ **"Why These Numbers?" Insights Box**:
   - Displays V1 lightNotes for each bucket
   - Explains reasoning behind allocations
   - Fixed data structure bug (object vs array)
5. ✅ **Recalculate Functionality**:
   - Button text changes: "Calculate My Personalized Budget" → "Recalculate My Budget"
   - Page reload updates allocations after pre-survey changes
   - Seamless edit-recalculate workflow
6. ✅ **Bug Fixes**:
   - Fixed: `google.script.run.savePreSurvey is not a function` - Added global wrapper functions
   - Fixed: Blank white page after submission - Changed reload strategy
   - Fixed: `allocation.lightNotes.join is not a function` - Handled object structure
   - Fixed: "undefined%" in allocation cards - Corrected property case (Multiply vs multiply)
7. ✅ **Improved UX**:
   - No more "go back to main menu" - all actions on one page
   - Pre-survey collapses to summary after calculation
   - Clear visual hierarchy and interaction patterns

**Technical Improvements:**
- Modified `render()` to always call `buildUnifiedPage()` instead of conditional routing
- Pre-survey data pre-fills form on return visits
- V1 allocations calculated server-side, displayed client-side
- Window.reload() works within single-page context

**Current Limitations:**
- ⏳ No interactive sliders yet - allocations are static display only
- ⏳ No lock/unlock feature - can't freeze individual buckets
- ⏳ No manual adjustment - must recalculate via pre-survey changes
- ⏳ No scenario saving - can't compare multiple approaches

**Next Update:** After Phase 3 interactive sliders completion
**Version:** 1.5 (Phase 3 Partial - Static V1 Display Working)
