# Tool 4: Interactive Calculator Architecture

**Version:** 2.0 (Complete Redesign)
**Date:** November 17, 2025
**Status:** Final Architecture - Ready for Implementation
**Replaces:** Static multi-page form approach

---

## 🎯 **Core Vision**

**Tool 4 is an INTERACTIVE FINANCIAL CALCULATOR, not a static form.**

### **Key Principles:**

1. ✅ **Real-time feedback** - Allocations update instantly as students adjust inputs
2. ✅ **Progressive enhancement** - Start simple (4 inputs), expand for accuracy
3. ✅ **Graceful degradation** - Works without Tool 2, better WITH Tool 2
4. ✅ **Scenario-based** - Create multiple scenarios, compare, choose optimal
5. ✅ **Never block progression** - Tool 5 unlocks when optimal scenario selected

---

## 📋 **Decisions Finalized**

| Decision | Final Choice | Rationale |
|----------|--------------|-----------|
| **Tool 4 Required?** | ✅ YES (Option A) | Core planning exercise, needed for Tool 5+ personalization |
| **Tool 2 Fallback** | ✅ Inline questions + soft prompt (Option A + B) | Ask 2-3 key questions inline, encourage Tool 2 completion with benefits |
| **Minimum Inputs** | 🔄 TBD - Analyze legacy form first | Need to review 26 legacy inputs to determine essential vs optional |
| **Shareable Calculator** | ❌ NO (Option: Keep in platform) | All functionality within authenticated platform |
| **UI Pattern** | ✅ Single-page interactive calculator | Real-time sliders, instant allocation updates |
| **Calculation Location** | ✅ Client-side JavaScript | Instant feedback, server only for save/GPT/PDF |
| **GPT Integration** | ✅ On-demand (button click) | Template guidance default, GPT upgrade optional |

---

## 🏗️ **Architecture Overview**

### **High-Level Flow:**

```
┌────────────────────────────────────────────────────┐
│  Student Enters Tool 4                             │
│  • Load Tool 1/2/3 insights (server-side)          │
│  • Check if Tool 2 completed                       │
│  • Render interactive calculator (client-side)     │
└─────────────────┬──────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────────┐
│  Interactive Calculator Interface                  │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │ LEFT: Inputs     │  │ RIGHT: Live Results  │   │
│  │ • Sliders        │  │ • Allocation bars    │   │
│  │ • Dropdowns      │  │ • Warnings           │   │
│  │ • Collapsible    │  │ • AI insights        │   │
│  └──────────────────┘  └──────────────────────┘   │
│                                                    │
│  ALL calculations happen client-side (instant!)   │
└─────────────────┬──────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────────┐
│  Student Experiments                               │
│  • Adjust income slider → see allocation change    │
│  • Change priorities → see impact                  │
│  • Try "what if I paid off debt?" scenarios        │
│  • Click "Get AI Analysis" (optional GPT call)     │
└─────────────────┬──────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────────┐
│  Save Scenarios (Server-Side)                      │
│  • Name scenario → save to TOOL4_SCENARIOS sheet   │
│  • Repeat 3-5 times with different inputs          │
│  • All scenarios stored with full input history    │
└─────────────────┬──────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────────┐
│  Compare Scenarios                                 │
│  • Select 2 scenarios → side-by-side view          │
│  • GPT analysis: which is better for your profile? │
│  • Show dollar differences, trade-offs             │
└─────────────────┬──────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────────┐
│  Select Optimal Scenario                           │
│  • Mark one as "optimal" (star icon)               │
│  • Update RESPONSES sheet                          │
│  • Unlock Tool 5                                   │
│  • Dashboard shows "Tool 4: COMPLETED"             │
└────────────────────────────────────────────────────┘
```

---

## 🎨 **UI Structure**

### **Single-Page Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Financial Freedom Framework - Interactive Calculator   │
│  [Tutorial] [Your Profile] [Save Progress]                      │
└─────────────────────────────────────────────────────────────────┘
┌──────────────────────────┬──────────────────────────────────────┐
│  LEFT PANEL (40% width)  │  RIGHT PANEL (60% width)             │
│  Input Controls          │  Live Results & Actions              │
├──────────────────────────┼──────────────────────────────────────┤
│                          │                                      │
│  ┌────────────────────┐  │  ┌──────────────────────────────┐   │
│  │ 💰 INCOME & COSTS  │  │  │ YOUR ALLOCATION              │   │
│  │  (Always Visible)  │  │  │                              │   │
│  │                    │  │  │  Multiply:    25%            │   │
│  │ Monthly Income:    │  │  │  ████████████                │   │
│  │ [────●────] $5,000│  │  │                              │   │
│  │                    │  │  │  Essentials:  40%            │   │
│  │ Essentials:        │  │  │  ████████████████            │   │
│  │ [──●──────] $2,700│  │  │                              │   │
│  │ 💡 Tool 2 suggests │  │  │  Freedom:     25%            │   │
│  │    $800 lifestyle  │  │  │  ████████████                │   │
│  └────────────────────┘  │  │                              │   │
│                          │  │  Enjoyment:   10%            │   │
│  ┌────────────────────┐  │  │  ████                        │   │
│  │ 🎯 PRIORITIES      │  │  └──────────────────────────────┘   │
│  │  (Always Visible)  │  │                                      │
│  │                    │  │  ┌──────────────────────────────┐   │
│  │ 1st [Secure ▼]    │  │  │ 💡 AI INSIGHTS (Collapsed)   │   │
│  │ 2nd [Wealth ▼]    │  │  │  [Expand for Analysis ▼]     │   │
│  │ 3rd [Debt ▼]      │  │  └──────────────────────────────┘   │
│  └────────────────────┘  │                                      │
│                          │  ┌──────────────────────────────┐   │
│  ┌────────────────────┐  │  │ ⚠️ WARNINGS & FLAGS          │   │
│  │ 💵 FINANCIAL ▼     │  │  │                              │   │
│  │  (Collapsible)     │  │  │ • Low emergency fund         │   │
│  │                    │  │  │ • Essentials seem high       │   │
│  │ Debt: $15,000      │  │  └──────────────────────────────┘   │
│  │ Emergency: $3,000  │  │                                      │
│  │ Stability: Stable  │  │  ┌──────────────────────────────┐   │
│  └────────────────────┘  │  │ 💾 SCENARIOS                 │   │
│                          │  │                              │   │
│  ┌────────────────────┐  │  │ ⭐ Conservative (Optimal)    │   │
│  │ 🧠 BEHAVIORAL ▼    │  │  │ ☆  Aggressive Growth         │   │
│  │  (Auto from Tool 2)│  │  │ ☆  Debt Focused              │   │
│  │                    │  │  │                              │   │
│  │ Satisfaction: 4/10 │  │  │ [Save Current as Scenario]   │   │
│  │ Discipline: 6/10   │  │  │ [Compare Selected (0/2)]     │   │
│  │ [Show All ▼]       │  │  │ [Generate PDF]               │   │
│  └────────────────────┘  │  └──────────────────────────────┘   │
│                          │                                      │
│  [Advanced Settings ▼]   │  [What-If Scenarios ▼]               │
│                          │  [Export to Spreadsheet]             │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 🔄 **Tool 2 Integration & Fallback System**

### **3-Tier System:**

#### **Tier 1: Full Enhancement (Tool 2 Completed) ⭐⭐⭐⭐⭐**

```javascript
// Check for Tool 2 data
const tool2Data = DataService.getLatestResponse(clientId, 'tool2');

if (tool2Data && tool2Data.status === 'COMPLETED') {
  // PRE-FILL behavioral inputs
  inputs.spendingClarity = tool2Data.data.spendingClarity;
  inputs.spendingConsistency = tool2Data.data.spendingConsistency;
  inputs.spendingReview = tool2Data.data.spendingReview;
  inputs.spendingStress = tool2Data.data.spendingStress;
  inputs.incomeSufficiency = tool2Data.data.incomeSufficiency;
  inputs.wastefulSpending = tool2Data.data.wastefulSpending;

  // INTELLIGENT ESSENTIALS ANALYSIS
  const essentialsAnalysis = analyzeEssentialsWithTool2Data(inputs, tool2Data);

  // Show in UI
  ui.showEnhancedGuidance = true;
  ui.essentialsEstimate = essentialsAnalysis.estimated.dollars;
  ui.overspendWarning = essentialsAnalysis.indicators.overspendingLikelihood;
  ui.confidenceLevel = 'high';

  // No fallback questions needed
  ui.showFallbackQuestions = false;
}
```

**UI Message:**
```
✅ Enhanced Guidance Enabled
We're using your Tool 2 insights to provide smart recommendations!
```

---

#### **Tier 2: Lite Enhancement (Inline Fallback Questions) ⭐⭐⭐**

```javascript
if (!tool2Data || tool2Data.status !== 'COMPLETED') {
  // Show inline fallback questions
  ui.showFallbackQuestions = true;
  ui.fallbackMode = 'inline';

  ui.fallbackQuestions = [
    {
      id: 'spendingClarity',
      text: 'How well do you track your spending?',
      type: 'scale',
      min: 1,
      max: 10,
      labels: {
        1: 'Never track - complete avoidance',
        5: 'Occasional tracking',
        10: 'Track every dollar'
      },
      tooltip: 'This helps us determine if your reported essentials are accurate'
    },
    {
      id: 'incomeSufficiency',
      text: 'Is your income sufficient for your needs?',
      type: 'scale',
      min: 1,
      max: 10,
      labels: {
        1: 'Completely insufficient',
        5: 'Covers needs, tight',
        10: 'More than sufficient'
      },
      tooltip: 'Helps us validate your essentials percentage'
    },
    {
      id: 'wastefulSpending',
      text: 'Any spending you consider wasteful? (Optional)',
      type: 'textarea',
      optional: true,
      placeholder: 'E.g., unused subscriptions, impulse purchases...',
      tooltip: 'Helps identify non-essential spending'
    }
  ];

  // Show soft prompt for Tool 2
  ui.showTool2Prompt = true;
  ui.tool2Benefits = [
    'More accurate essentials calculation',
    'Behavioral insights auto-filled',
    'Smart overspending detection',
    'Deeper GPT analysis'
  ];
}
```

**UI Display:**

```
┌─────────────────────────────────────────────────────────────┐
│  ℹ️ Quick Questions for Better Accuracy                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  To provide accurate recommendations, we need a few insights│
│  (Takes 1 minute):                                          │
│                                                             │
│  1. How well do you track your spending?                    │
│     [──────●───] 6/10 (Occasional tracking)                │
│                                                             │
│  2. Is your income sufficient for your needs?               │
│     [─────●────] 5/10 (Covers needs, tight)                │
│                                                             │
│  3. Any wasteful spending? (Optional)                       │
│     [_____________________________________________]          │
│                                                             │
│  [Continue with These Answers]                              │
│                                                             │
│  ─── OR ───                                                 │
│                                                             │
│  💡 Complete Tool 2 (Financial Clarity) First               │
│                                                             │
│  Benefits:                                                  │
│  ✓ More accurate essentials calculation                     │
│  ✓ Behavioral insights auto-filled                          │
│  ✓ Smart overspending detection                             │
│  ✓ Deeper AI-powered analysis                               │
│                                                             │
│  Estimated time: 15-20 minutes                              │
│                                                             │
│  [Go to Tool 2 Now] [Skip - Use Basic Calculator]          │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Tier 3: Basic Calculator (No Tool 2, Skip Questions) ⭐⭐**

```javascript
if (ui.skipFallbackQuestions === true) {
  // Use basic calculation
  ui.useBasicCalculation = true;
  ui.showEnhancedGuidance = false;
  ui.confidenceLevel = 'low';

  // All behavioral inputs manual
  // No intelligent essentials analysis
  // Simple warnings only (no GPT)
}
```

**UI Message:**
```
⚠️ Basic Calculator Mode
Enter your information manually. For smarter recommendations,
complete Tool 2 or answer the quick questions above.
```

---

## 💻 **Client-Side Calculation Engine**

### **Core Architecture:**

**All allocation calculations happen in the browser for instant feedback.**

```javascript
// Embedded in Tool4.html
class Tool4Calculator {
  constructor(tool1Data, tool2Data, tool3Data) {
    // Store trauma insights
    this.trauma = {
      winner: tool1Data?.data?.winner || null,
      scores: tool1Data?.data?.scores || {},
      tool2Archetype: tool2Data?.data?.results?.archetype || null,
      tool2TopDomain: tool2Data?.data?.results?.topDomain || null,
      tool3Quotient: tool3Data?.data?.results?.overallQuotient || null
    };

    // Store Tool 2 spending insights (if available)
    this.tool2Available = !!tool2Data;
    this.spendingInsights = tool2Data ? {
      clarity: parseInt(tool2Data.data.spendingClarity) || 0,
      consistency: parseInt(tool2Data.data.spendingConsistency) || 0,
      incomeSufficiency: parseInt(tool2Data.data.incomeSufficiency) || 0,
      wastefulSpending: tool2Data.data.wastefulSpending || ''
    } : null;

    // Load base priority weights
    this.baseWeights = this.loadBasePriorityWeights();
  }

  /**
   * Main calculation method - called on every input change
   * Returns allocation instantly (no server call)
   */
  calculate(inputs) {
    // STEP 1: Calculate base weights from top 3 priorities
    const base = this.calculateWeightedPriorities(
      inputs.priority1,
      inputs.priority2,
      inputs.priority3
    );

    // STEP 2: Calculate intelligent essentials
    const essentials = this.tool2Available ?
      this.calculateSmartEssentials(inputs, this.spendingInsights) :
      this.calculateBasicEssentials(inputs);

    // STEP 3: Apply modifiers
    const mods = {
      financial: this.getFinancialModifiers(inputs),
      behavioral: this.getBehavioralModifiers(inputs),
      motivational: this.getMotivationalModifiers(inputs),
      trauma: this.getTraumaModifiers(inputs, this.trauma)
    };

    // STEP 4: Combine raw scores
    const raw = {
      Multiply: base.M + mods.financial.M + mods.behavioral.M + mods.motivational.M + mods.trauma.M,
      Essentials: essentials.percent + mods.behavioral.E + mods.trauma.E,
      Freedom: base.F + mods.financial.F + mods.behavioral.F + mods.motivational.F + mods.trauma.F,
      Enjoyment: base.J + mods.financial.J + mods.behavioral.J + mods.motivational.J + mods.trauma.J
    };

    // STEP 5: Normalize to 100%
    const normalized = this.normalize(raw);

    // STEP 6: Check warnings
    const warnings = this.generateWarnings(normalized, inputs, essentials);

    // STEP 7: Return results INSTANTLY
    return {
      allocations: normalized,
      essentialsAnalysis: essentials,
      modifiers: mods,
      warnings: warnings,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Weighted average of top 3 priorities (50%, 30%, 20%)
   */
  calculateWeightedPriorities(p1, p2, p3) {
    const w1 = this.baseWeights[p1] || {M:25, E:25, F:25, J:25};
    const w2 = this.baseWeights[p2] || {M:25, E:25, F:25, J:25};
    const w3 = this.baseWeights[p3] || {M:25, E:25, F:25, J:25};

    return {
      M: w1.M * 0.5 + w2.M * 0.3 + w3.M * 0.2,
      E: w1.E * 0.5 + w2.E * 0.3 + w3.E * 0.2,
      F: w1.F * 0.5 + w2.F * 0.3 + w3.F * 0.2,
      J: w1.J * 0.5 + w2.J * 0.3 + w3.J * 0.2
    };
  }

  /**
   * Intelligent essentials calculation using Tool 2 data
   */
  calculateSmartEssentials(inputs, spendingInsights) {
    const reportedPct = (inputs.essentialsDollars / inputs.incomeDollars) * 100;

    // Assess spending control
    const spendingControl = (spendingInsights.clarity + spendingInsights.consistency) / 2;

    // Detect overspending likelihood
    let overspendingFactor = 0;

    // Indicator 1: Poor spending control
    if (spendingControl < -2) {
      overspendingFactor += 0.30; // 30% likely overspending
    } else if (spendingControl < 0) {
      overspendingFactor += 0.15; // 15% likely overspending
    }

    // Indicator 2: High income + high essentials % = lifestyle creep
    if (spendingInsights.incomeSufficiency >= 3 && reportedPct > 50) {
      overspendingFactor += 0.20; // 20% lifestyle creep
    }

    // Indicator 3: Self-reported wasteful spending
    if (spendingInsights.wastefulSpending && spendingInsights.wastefulSpending.length > 50) {
      overspendingFactor += 0.10; // 10% acknowledged waste
    }

    // Cap at 50% max overspending
    overspendingFactor = Math.min(overspendingFactor, 0.50);

    // Calculate estimated true essentials
    const estimatedOverspend = inputs.essentialsDollars * overspendingFactor;
    const trueEssentials = inputs.essentialsDollars - estimatedOverspend;
    const truePct = (trueEssentials / inputs.incomeDollars) * 100;

    return {
      reported: {
        dollars: inputs.essentialsDollars,
        percent: reportedPct
      },
      estimated: {
        dollars: Math.round(trueEssentials),
        percent: Math.round(truePct)
      },
      overspend: {
        dollars: Math.round(estimatedOverspend),
        percent: Math.round(overspendingFactor * 100)
      },
      confidence: spendingControl > 2 ? 'high' : 'medium',
      useEstimated: true // Use estimated for allocation
    };
  }

  /**
   * Basic essentials (no Tool 2 data)
   */
  calculateBasicEssentials(inputs) {
    const pct = (inputs.essentialsDollars / inputs.incomeDollars) * 100;

    return {
      reported: { dollars: inputs.essentialsDollars, percent: pct },
      estimated: { dollars: inputs.essentialsDollars, percent: pct },
      overspend: { dollars: 0, percent: 0 },
      confidence: 'low',
      useEstimated: false
    };
  }

  /**
   * Trauma-informed modifiers from Tools 1-3
   */
  getTraumaModifiers(inputs, trauma) {
    const mods = {M: 0, E: 0, F: 0, J: 0};
    const notes = {M: '', E: '', F: '', J: ''};

    // Tool 1 trauma modifiers
    if (trauma.winner === 'Fear') {
      mods.M -= 10;
      mods.E += 10;
      mods.F += 10;
      notes.M = 'Fear pattern reduces risk tolerance. ';
      notes.E = 'Fear pattern increases need for stability. ';
    } else if (trauma.winner === 'FSV') {
      mods.J -= 5;
      mods.E += 5;
      notes.J = 'False self-view pattern suggests reducing status spending. ';
    }
    // ... (all trauma modifiers from spec)

    // Trauma-informed satisfaction amplifier (Decision 1)
    const dissatisfaction = inputs.satisfaction; // 1-10 scale

    if (dissatisfaction >= 7) {
      // High dissatisfaction - check trauma context
      if (trauma.winner === 'Fear' || trauma.winner === 'Control' ||
          trauma.tool2TopDomain === 'Money Vigilance') {
        // Overwhelmed - need stability, NOT aggressive growth
        mods.E += 10;
        mods.F += 10;
        notes.E += `High dissatisfaction + ${trauma.winner} suggests need for stability. `;
      } else {
        // Motivated for change - apply amplification
        const satFactor = 1 + Math.min((dissatisfaction - 5) * 0.1, 0.3);
        Object.keys(mods).forEach(bucket => {
          if (mods[bucket] > 0) {
            mods[bucket] = Math.round(mods[bucket] * satFactor);
          }
        });
        notes.M += `High dissatisfaction (${dissatisfaction}/10) amplified growth focus. `;
      }
    }

    return {modifiers: mods, notes: notes};
  }

  // ... (all other modifier methods)
}

// Initialize calculator when page loads
const calculator = new Tool4Calculator(tool1Data, tool2Data, tool3Data);

// Real-time recalculation
let recalcTimeout;
function recalculate() {
  clearTimeout(recalcTimeout);
  recalcTimeout = setTimeout(() => {
    const inputs = gatherInputsFromForm();
    const results = calculator.calculate(inputs);
    updateUIWithResults(results);
  }, 300); // 300ms debounce
}

// Attach listeners to all inputs
document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', recalculate);
  el.addEventListener('change', recalculate);
});

// Initial calculation
recalculate();
```

---

## 📊 **Data Storage**

### **Dual Storage Model (Unchanged from Spec):**

**1. RESPONSES Sheet (Framework Integration)**
- Stores ONLY optimal scenario
- Used for Tool 5+ integration
- Marks tool as COMPLETED
- Unlocks Tool 5

**2. TOOL4_SCENARIOS Sheet (Scenario History)**
- Stores ALL scenarios (max 10 per student)
- Full input history for each scenario
- Enables comparison feature
- FIFO cleanup (oldest deleted when 11th saved)

---

## 🔄 **Server Interactions**

**Server is called ONLY for:**

1. **Initial Load** - Get Tool 1/2/3 data
2. **Save Scenario** - Store to TOOL4_SCENARIOS
3. **Load Scenarios** - Retrieve student's saved scenarios
4. **Set Optimal** - Update RESPONSES, unlock Tool 5
5. **GPT Analysis** - On-demand AI insights (button click)
6. **Generate PDF** - Create report for download

**ALL allocation calculations happen client-side for instant feedback.**

---

## 🎯 **Next Steps**

### **Immediate (Before End of Session):**

1. ✅ Architecture documented (this file)
2. 🔄 **NEXT:** Analyze legacy form to determine minimum required inputs
3. 🔄 **THEN:** Update TOOL4-SPECIFICATION.md with finalized architecture
4. 🔄 **THEN:** Create final implementation checklist

### **Before Implementation:**

1. Deep dive: Base priority weightings optimization
2. Finalize input field list (essential vs optional)
3. Design UI mockups/wireframes
4. Write client-side AllocationEngine.js
5. Test calculation logic with sample data

---

## 📝 **Open Questions (To Be Resolved)**

1. **Minimum Required Inputs:** Need to analyze 26 legacy inputs to determine which are essential vs nice-to-have
2. **Base Priority Weightings:** Need to review and optimize all 10 priorities (separate deep dive)
3. **Fallback Question Wording:** Exact phrasing for 2-3 inline questions when Tool 2 missing
4. **Visual Design:** Tool 8 style or new design for interactive calculator?

---

## ✅ **Locked In & Ready for Implementation**

- ✅ Interactive calculator (not static form)
- ✅ Client-side real-time calculation
- ✅ 3-tier Tool 2 fallback system
- ✅ Scenario-based approach (create, compare, select optimal)
- ✅ Tool 4 required (not skippable)
- ✅ Tool 5 unlocks on optimal selection
- ✅ No sharing/embedding (platform-only)
- ✅ Trauma-informed satisfaction amplifier
- ✅ Rank top 3 priorities (weighted 50%, 30%, 20%)

---

**This architecture is FINAL and ready for implementation after input analysis.**
