# Tool 4: Financial Freedom Framework - FINAL SPECIFICATION

**Date:** November 25, 2025
**Status:** ✅ Ready for Implementation
**Version:** 3.0 (Finalized after design review)

---

## 🎯 Executive Summary

**Tool 4 is an interactive budget allocation calculator** that helps students discover their optimal financial allocation across 4 buckets (M/E/F/J) based on:
- Their financial priority (10 priorities, progressively unlocked)
- 29 trauma-informed modifiers from Tools 1/2/3
- Current financial reality (income, debt, emergency fund, spending)
- Student agency (can customize recommendations)

**Key Design Principle:** Calculator + Report model (like Tool 8), NOT multi-page form.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────┐
│  PART 1: Interactive Calculator (Single Page)│
│  - Real-time calculations (client-side JS)  │
│  - Input sliders (income, debt, etc.)       │
│  - Category spending estimates (NEW)        │
│  - Progressive unlock (priority filtering)  │
│  - Save/load scenarios                      │
│  - Backup questions (if Tools 1/2/3 missing)│
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  PART 2: Comprehensive Report (Generated)   │
│  - Allocation summary                       │
│  - Recommendation rationale (WHY this works)│
│  - Bucket education (M/E/F/J definitions)   │
│  - Gap analysis with category breakdown     │
│  - Implementation steps                     │
│  - Downloadable PDF                         │
└─────────────────────────────────────────────┘
```

---

## 🧮 Calculator Component (Part 1)

### **Student ID Gate**
- Validates student via roster lookup
- Checks Tools 1/2/3 completion status
- Shows conditional modal if missing tools

### **Inputs Section**

**Financial Inputs:**
```
1. Monthly Income: $[____] (number)
2. Current Essentials: $[____] (number - what they actually spend)
3. Debt Balance: $[____] (number)
4. Interest Rate: [High/Medium/Low] (dropdown)
5. Emergency Fund: $[____] (number)
6. Income Stability: [Very Stable/Stable/Variable/Unstable] (dropdown)
```

**Category Spending Estimates (NEW):**
```
Break down your essentials:
- Rent/Mortgage: $[____]
- Groceries: $[____]
- Dining/Takeout: $[____]
- Transportation: $[____]
- Utilities: $[____]
- Insurance: $[____]
- Subscriptions: $[____]
- Other: $[____]

Total: $[____] (should match Current Essentials - validated)
```

**Why Category Estimates?**
- Solves Tool 2 integration gap (Tool 2 doesn't capture this data)
- Enables specific cut suggestions in report
- Students need this breakdown for implementation anyway

### **Progressive Priority Unlock**

**Available Priorities Display:**
```html
<div class="priority-selector">
  <h4>📊 Your Available Priorities</h4>

  <!-- Always Available (Tier 1) -->
  <div class="priority available">
    ✅ Stabilize to Survive
    <span class="priority-hint">Focus on immediate stability</span>
  </div>

  <div class="priority available">
    ✅ Reclaim Financial Control
    <span class="priority-hint">Trauma recovery focus</span>
  </div>

  <div class="priority available">
    ✅ Get Out of Debt
    <span class="priority-hint">Debt: $25,000</span>
  </div>

  <!-- Locked (Tier 2) -->
  <div class="priority locked">
    🔒 Feel Financially Secure
    <span class="unlock-requirement">
      Need: Emergency fund ≥ $6,000 | You have: $500
    </span>
  </div>

  <div class="priority locked">
    🔒 Build Long-Term Wealth
    <span class="unlock-requirement">
      Need: Emergency fund ≥ $18,000 + $800 surplus
    </span>
  </div>

  <!-- More locked priorities... -->
</div>

<select id="priorityDropdown">
  <option value="">-- Select your priority --</option>
  <!-- Only populated with UNLOCKED priorities -->
  <option value="stabilize">Stabilize to Survive</option>
  <option value="reclaim">Reclaim Financial Control</option>
  <option value="debt">Get Out of Debt</option>
</select>
```

**Priority Selection:** Single priority (NOT Top 2 ranking - removed for simplicity)

### **Real-Time Output**

```html
<div class="allocation-output">
  <h4>📊 Your Recommended Allocation</h4>

  <div class="allocation-bars">
    <div class="bar multiply" style="width: 15%">
      <span>💰 Multiply</span>
      <strong>15%</strong>
      <span class="dollars">$750/mo</span>
    </div>

    <div class="bar essentials" style="width: 35%">
      <span>🏠 Essentials</span>
      <strong>35%</strong>
      <span class="dollars">$1,750/mo</span>
    </div>

    <div class="bar freedom" style="width: 40%">
      <span>🦅 Freedom</span>
      <strong>40%</strong>
      <span class="dollars">$2,000/mo</span>
    </div>

    <div class="bar enjoyment" style="width: 10%">
      <span>🎉 Enjoyment</span>
      <strong>10%</strong>
      <span class="dollars">$500/mo</span>
    </div>
  </div>

  <button class="btn-secondary" onclick="toggleCustomize()">
    🎛️ Customize This Allocation
  </button>

  <button class="btn-primary" onclick="generateReport()">
    📊 Generate Full Report
  </button>
</div>
```

**Customization Option:**
```html
<!-- Shows when "Customize" clicked -->
<div id="customAllocation" style="display:none;">
  <h5>🎛️ Create Your Own Allocation</h5>
  <p class="muted">Adjust sliders - must total 100%</p>

  <div class="slider-group">
    <label>💰 Multiply: <span id="mPercent">15</span>%</label>
    <input type="range" id="mSlider" min="0" max="100" value="15">
  </div>

  <!-- Similar for E, F, J -->

  <div class="total-check">
    Total: <span id="totalPercent" class="ok">100%</span> ✓
  </div>

  <div class="comparison">
    <h6>How Your Custom Compares:</h6>
    <ul>
      <li>Multiply: You chose 10% (Recommended: 15%) - <span class="warn">-5%</span></li>
      <li>Enjoyment: You chose 15% (Recommended: 10%) - <span class="info">+5%</span></li>
    </ul>
  </div>
</div>
```

### **Scenario Management**

```html
<div class="scenario-section">
  <h4>💾 Scenarios</h4>

  <input id="scenarioName" placeholder="Name this scenario"
         value="My Debt Payoff Plan" class="form-input">

  <button class="btn-primary" onclick="saveScenario()">
    💾 Save Scenario
  </button>

  <select id="scenarioList" class="form-select">
    <option value="">-- Load saved scenario --</option>
    <!-- Dynamically populated -->
  </select>

  <button class="btn-secondary" onclick="loadScenario()">
    📂 Load
  </button>
</div>
```

### **Backup Questions (If Missing Tools 1/2/3)**

**Conditional Modal on Load:**
```javascript
// Check completion status
const toolStatus = {
  hasTool1: false,  // Missing
  hasTool2: true,   // Completed
  hasTool3: false   // Missing
};

// Show modal with options:
// 1. Go back and complete missing tools (recommended)
// 2. Continue and answer backup questions (6 + 0 + 1 = 7 questions)
```

**Backup Questions (See expanded set above):**
- **Tool 1:** 6 questions (pattern + satisfaction + 4 intensity ratings)
- **Tool 2:** 6 questions (spending + emotional + discipline + impulse + long-term + lifestyle)
- **Tool 3:** 1 question (financial confidence)
- **Total if all missing:** 13 questions (~5 minutes)

---

## 📄 Report Component (Part 2)

### **Report Structure**

**Generated when student clicks "📊 Generate Report"**

```
┌─────────────────────────────────────────┐
│  YOUR FINANCIAL FREEDOM PLAN            │
│  [Student Name] - [Scenario Name]      │
├─────────────────────────────────────────┤
│                                         │
│ 1. ALLOCATION SUMMARY                   │
│    - Priority: Get Out of Debt         │
│    - Monthly Income: $5,000            │
│    - Recommended vs Custom             │
│    - Visual bar chart                  │
│                                         │
│ 2. WHY THIS WORKS FOR YOU              │
│    ✅ Trauma pattern consideration     │
│    ✅ Debt situation analysis          │
│    ✅ Income level matching            │
│    (Items #1 and #7 from student UX)  │
│                                         │
│ 3. UNDERSTANDING YOUR 4 BUCKETS         │
│    💰 Multiply - What it means         │
│    🏠 Essentials - What counts         │
│    🦅 Freedom - How to split it        │
│    🎉 Enjoyment - Permission to live   │
│    (Full definitions with examples)    │
│                                         │
│ 4. YOUR SPENDING BREAKDOWN              │
│    Current vs Recommended by category: │
│    - Rent: $1,200 (fixed)             │
│    - Groceries: $400 → $300 (-$100)   │
│    - Dining: $300 → $150 (-$150)      │
│    - Subscriptions: $150 → $50 (-$100)│
│    (Uses category estimates)           │
│                                         │
│ 5. IMPLEMENTATION STEPS                 │
│    ✅ Step 1: Set Up Buckets (30 min)  │
│    ✅ Step 2: Automate (1 hour)        │
│    ✅ Step 3: Track for 30 Days        │
│    (Items #2 and #3 from student UX)  │
│                                         │
│ 6. IF GAP FEELS TOO BIG                 │
│    Alternative paths if needed         │
│    (Item #2 from student UX)           │
│                                         │
│ 7. DATA SOURCES                         │
│    ✓ Tool 1: Completed                 │
│    ⚠️ Tool 2: Backup Questions         │
│    ✓ Tool 3: Completed                 │
│                                         │
│ 8. NEXT STEPS                           │
│    - Bring to class discussion         │
│    - Try for 30 days                   │
│    - Create new scenarios as needed    │
│                                         │
│ [Download PDF] [Back to Calculator]    │
└─────────────────────────────────────────┘
```

**Report Generation:**
```javascript
// Server-side (Code.js)
function generateTool4Report(clientId, scenarioId) {
  const scenario = getScenario(clientId, scenarioId);
  const reportHtml = Tool4Report.render(clientId, scenario);
  return reportHtml; // Return URL or open in new window
}
```

**PDF Generation (Like Tool 8):**
- Uses Google Docs API or HTML to PDF
- Styled with consistent branding
- Downloadable for class discussion

---

## 💾 Data Architecture

### **TOOL4_SCENARIOS Sheet**

```
A: Timestamp
B: Client_ID
C: Scenario_Name
D: Priority_Selected

// Financial Inputs
E: Monthly_Income
F: Current_Essentials
G: Debt_Balance
H: Interest_Rate
I: Emergency_Fund
J: Income_Stability

// Category Estimates
K: Rent_Mortgage
L: Groceries
M: Dining_Takeout
N: Transportation
O: Utilities
P: Insurance
Q: Subscriptions
R: Other_Essentials

// Recommended Allocation (from algorithm)
S: Rec_M_Percent
T: Rec_E_Percent
U: Rec_F_Percent
V: Rec_J_Percent

W: Rec_M_Dollars
X: Rec_E_Dollars
Y: Rec_F_Dollars
Z: Rec_J_Dollars

// Custom Allocation (if student adjusted)
AA: Custom_M_Percent
AB: Custom_E_Percent
AC: Custom_F_Percent
AD: Custom_J_Percent
AE: Is_Custom (boolean)

// Metadata
AF: Report_Generated (boolean)
AG: Tool1_Source (completed/backup/missing)
AH: Tool2_Source (completed/backup/missing)
AI: Tool3_Source (completed/backup/missing)
AJ: Backup_Data (JSON - if used backup questions)
```

### **RESPONSES Sheet Integration**

```javascript
// Update RESPONSES sheet when FIRST scenario is saved
DataService.saveToolResponse(clientId, 'tool4', {
  scenarioCount: 1,
  latestScenario: "My Debt Payoff Plan",
  latestPriority: "Get Out of Debt",
  dataSource: {
    tool1: 'completed',
    tool2: 'backup',
    tool3: 'completed'
  },
  backupData: backupAnswers || null
}, 'COMPLETED');

// Mark tool as complete in admin tracking
// (handled automatically by DataService)
```

**Admin Tracking:**
- Tool 4 marked "COMPLETED" after FIRST scenario saved
- Dashboard shows scenario count
- Can track which students used backup questions

---

## 🧮 Core Algorithm

### **Base Weights (10 Priorities)**

See [TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md](TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md) for complete definitions.

**Example: "Get Out of Debt"**
```javascript
{
  M: 15,  // Minimum investing
  E: 35,  // Sustainable essentials
  F: 40,  // Aggressive debt payoff
  J: 10   // Reduced enjoyment
}
```

### **Modifiers (29 Total)**

See [MODIFIERS-SYSTEM-VALIDATION.md](MODIFIERS-SYSTEM-VALIDATION.md) for complete list.

**Categories:**
- **Financial:** 6 modifiers (income level, debt load, interest rate, emergency fund, stability)
- **Behavioral:** 9 modifiers (discipline, impulse, trauma patterns, etc.)
- **Motivational:** 8 modifiers (lifestyle priority, growth orientation, etc.)
- **Trauma-Informed Amplifier:** 1 (satisfaction score with Fear/Control check)

**Caps:**
- Max positive: +50
- Max negative: -20

### **Calculation Flow**

```javascript
function calculateAllocation(inputs, priority, toolData) {
  // 1. Get base weights for priority
  const baseWeights = getBaseWeights(priority);
  // Example: {M: 15, E: 35, F: 40, J: 10}

  // 2. Calculate modifiers from all sources
  const modifiers = calculateModifiers(inputs, toolData);
  // Example: {M: -5, E: +10, F: +15, J: -5}

  // 3. Apply modifiers to base weights
  const rawAllocation = {
    M: baseWeights.M + modifiers.M,
    E: baseWeights.E + modifiers.E,
    F: baseWeights.F + modifiers.F,
    J: baseWeights.J + modifiers.J
  };
  // Example: {M: 10, E: 45, F: 55, J: 5} = 115 total

  // 4. Normalize to 100%
  const total = Object.values(rawAllocation).reduce((a, b) => a + b, 0);
  const normalized = {
    M: Math.round((rawAllocation.M / total) * 100),
    E: Math.round((rawAllocation.E / total) * 100),
    F: Math.round((rawAllocation.F / total) * 100),
    J: Math.round((rawAllocation.J / total) * 100)
  };
  // Example: {M: 9, E: 39, F: 48, J: 4} = 100%

  // 5. Convert to dollar amounts
  const dollars = {
    M: Math.round((normalized.M / 100) * inputs.income),
    E: Math.round((normalized.E / 100) * inputs.income),
    F: Math.round((normalized.F / 100) * inputs.income),
    J: Math.round((normalized.J / 100) * inputs.income)
  };

  return { percentages: normalized, dollars: dollars };
}
```

---

## 🚀 Implementation Phases

### **Phase 1: Core Calculator (4-5 weeks)**

**Week 1-2: Calculator UI & Inputs**
- [ ] Single-page calculator layout (Tool 8 pattern)
- [ ] Student ID gate + roster validation
- [ ] Financial inputs (income, essentials, debt, emergency fund, stability)
- [ ] Category spending estimates (8 categories with validation)
- [ ] Real-time calculation preview

**Week 2-3: Algorithm & Modifiers**
- [ ] Base weights system (10 priorities)
- [ ] Modifier calculation (29 modifiers)
- [ ] Progressive unlock logic
- [ ] Trauma-informed satisfaction amplifier
- [ ] Custom allocation sliders

**Week 3-4: Tool 1/2/3 Integration**
- [ ] Check completion status on load
- [ ] Conditional modal (go back vs backup questions)
- [ ] 13-question backup form (6+6+1)
- [ ] Data merging (real data + backup approximations)
- [ ] Mapping backup answers to modifiers

**Week 4-5: Scenario Management**
- [ ] Save scenario to TOOL4_SCENARIOS sheet
- [ ] Load saved scenarios (dropdown)
- [ ] Update RESPONSES sheet on first save
- [ ] Admin tracking integration

### **Phase 2: Report Generation (2-3 weeks)**

**Week 6-7: Report Content**
- [ ] Report HTML template
- [ ] Allocation summary section
- [ ] Recommendation rationale (personalized)
- [ ] Bucket education (M/E/F/J definitions)
- [ ] Category breakdown with gaps
- [ ] Implementation steps

**Week 7-8: PDF Generation**
- [ ] PDF styling (branded)
- [ ] Google Docs API or HTML-to-PDF
- [ ] Download functionality
- [ ] Data source transparency section

### **Phase 3: Polish & Integration (1-2 weeks)**

**Week 8-9: Dashboard & Testing**
- [ ] Dashboard tile for Tool 4
- [ ] Scenario count display
- [ ] Edit/view scenario links
- [ ] Edge case testing
- [ ] Load testing with backup questions
- [ ] Progressive unlock testing

---

## ✅ Success Criteria

**Tool 4 is complete when:**

1. ✅ Student can enter financial data and get allocation recommendation
2. ✅ Progressive unlock correctly filters priorities based on inputs
3. ✅ Backup questions work for missing Tools 1/2/3 (any combination)
4. ✅ Scenarios save to TOOL4_SCENARIOS sheet
5. ✅ RESPONSES sheet updates on first scenario save
6. ✅ Report generates with all content sections
7. ✅ PDF downloads correctly
8. ✅ Admin tracking shows Tool 4 completion
9. ✅ Zero console errors in production
10. ✅ At least 1 student creates a scenario successfully

**Definition of Success:** Student creates at least 1 scenario.

---

## 🎓 Context: Virtual Classes

**Tool 4 is NOT standalone.** Students will:
- Use calculator to explore allocations
- Save 1-3 scenarios to compare
- Download report PDF
- Bring to virtual class for discussion
- Get implementation support in class
- Create new scenarios as life changes

**Tool 4 provides the NUMBERS. Classes provide the SUPPORT.**

---

## 📊 Key Design Decisions (Finalized)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Architecture** | Single-page calculator + Report | Like Tool 8, not multi-page form |
| **Priority Selection** | Single priority | Simpler than Top 2 ranking |
| **Progress Tracking** | None | No 30-60-90 day check-ins (class handles this) |
| **Tool 2 Integration** | Category estimates in Tool 4 | Tool 2 doesn't capture this data |
| **Backup Questions** | 6+6+1 = 13 questions | Expanded for better modifier accuracy |
| **Scenario Model** | Multiple scenarios (unlimited) | Students experiment and compare |
| **Report Content** | All educational content | Calculator stays clean and focused |
| **Student Agency** | Can customize allocation | System as coach, not dictator |

---

## 📚 Related Documents

- [TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md](TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md) - All 10 priorities with base weights
- [TOOL4-PROGRESSIVE-UNLOCK-MODEL.md](TOOL4-PROGRESSIVE-UNLOCK-MODEL.md) - Unlock requirements for each priority
- [MODIFIERS-SYSTEM-VALIDATION.md](MODIFIERS-SYSTEM-VALIDATION.md) - Complete modifier system (29 modifiers)
- [TOOL-DEVELOPMENT-GUIDE.md](../TOOL-DEVELOPMENT-GUIDE.md) - v3.9.0 framework patterns
- [Tool 8 Code](../../apps/Tool-8-investment-tool/) - Reference implementation for calculator pattern

---

**Document Status:** ✅ Finalized November 25, 2025
**Ready for:** Phase 1 Implementation
**Next Step:** Create implementation checklist and begin coding
