# Tool 4: Input Field Analysis

**Purpose:** Analyze 26 legacy form inputs to determine minimum required vs optional fields for interactive calculator

**Date:** November 17, 2025

---

## 📊 **Legacy Form Summary (26 Total Questions)**

### **Category Breakdown:**

| Category | Count | Questions |
|----------|-------|-----------|
| **Identity** | 3 | Name, Email, Student ID |
| **Financial Situation** | 6 | Income, Essentials, Debt, Interest, Emergency Fund, Stability |
| **Life Context** | 3 | Life Stage, Financial Confidence, Goal Timeline, Dependents, Autonomy |
| **Behavioral (Scales)** | 12 | Satisfaction, Discipline, Impulse, Long-term, Emotional Spending, Emotional Safety, Avoidance, Lifestyle, Growth, Stability, Autonomy |
| **Motivational** | 1 | Primary Priority |
| **TOTAL** | **26** | |

---

## 🎯 **Minimum Required Inputs (TIER 1: Essential)**

**These are REQUIRED for basic allocation calculation:**

| # | Input | Type | Why Required | Source |
|---|-------|------|--------------|--------|
| 1 | Monthly Income | Slider ($1K-$20K) | Calculate allocation dollars | Q5 |
| 2 | Essentials Spending | Slider ($500-$15K) | Calculate essentials % | Q6 |
| 3 | Priority #1 | Dropdown | Base allocation weights | Q20 |
| 4 | Priority #2 | Dropdown | Weighted average (30%) | NEW |
| 5 | Priority #3 | Dropdown | Weighted average (20%) | NEW |
| 6 | Satisfaction | Slider (1-10) | Trauma-informed amplifier | Q13 |

**Total Tier 1:** **6 inputs** (Interactive calculator works with just these)

**Calculation Possible:** YES ✅
- Base weights from priorities
- Essentials % from income/spending
- Satisfaction amplifier applied
- Basic allocation generated

---

## 🔧 **Enhanced Inputs (TIER 2: Financial Details)**

**Collapsible section - adds accuracy to modifiers:**

| # | Input | Type | Impact | Source |
|---|-------|------|--------|--------|
| 7 | Debt Amount | Slider ($0-$100K) | Freedom modifier (+10 to +15) | Q7 |
| 8 | Interest Rate | Dropdown (Low/Med/High) | Freedom modifier (+5 to +10) | Q8 |
| 9 | Emergency Fund | Slider ($0-$50K) | Freedom modifier (+10 if low) | Q9 |
| 10 | Income Stability | Dropdown (Stable/Unstable) | Essentials/Freedom modifiers | Q10 |

**Total Tier 2:** **4 inputs**

**Calculation Improvement:** Adds 15-25 points of modifiers across buckets

---

## 🧠 **Behavioral Inputs (TIER 3: Auto-Filled from Tool 2 OR Manual)**

**If Tool 2 completed → Auto-filled | If Tool 2 missing → Manual entry OR fallback questions:**

| # | Input | Type | Impact | Tool 2 Source | Fallback? |
|---|-------|------|--------|---------------|-----------|
| 11 | Satisfaction | Slider (1-10) | ✅ TIER 1 (already required) | N/A | N/A |
| 12 | Discipline | Slider (1-10) | Multiply modifier (+/-10) | N/A | Manual |
| 13 | Impulse Control | Slider (1-10) | Enjoyment modifier (+/-10) | N/A | Manual |
| 14 | Long-term Focus | Slider (1-10) | Multiply modifier (+/-10) | N/A | Manual |
| 15 | Emotional Spending | Slider (1-10) | Enjoyment modifier (+/-10) | N/A | Manual |
| 16 | Emotional Safety | Slider (1-10) | Essentials/Freedom mod (+5) | N/A | Manual |
| 17 | Financial Avoidance | Slider (1-10) | Multiply/Freedom mod (+/-5) | N/A | Manual |
| 18 | Spending Clarity | Slider (1-10) | **Essentials analysis** | ✅ Q19 | ✅ Fallback Q1 |
| 19 | Income Sufficiency | Slider (1-10) | **Essentials analysis** | ✅ Q15 | ✅ Fallback Q2 |
| 20 | Wasteful Spending | Text (optional) | **Essentials analysis** | ✅ Q24 | ✅ Fallback Q3 |

**Total Tier 3:** **10 inputs** (8 behavioral scales + 2 Tool 2 insights)

**Calculation Improvement:** Adds 30-50 points of modifiers, enables smart essentials

**Fallback Strategy:**
- If Tool 2 completed → Auto-fill all
- If Tool 2 missing → Show 3 inline questions (#18, #19, #20) + manual entry for others

---

## 🎨 **Motivational Inputs (TIER 4: Optional/Advanced)**

**Collapsible "Advanced Settings" - adds nuance:**

| # | Input | Type | Impact | Source |
|---|-------|------|--------|--------|
| 21 | Lifestyle Priority | Slider (1-10) | Enjoyment modifier (+/-10) | Q21 |
| 22 | Growth Orientation | Slider (1-10) | Multiply modifier (+/-10) | Q22 |
| 23 | Stability Orientation | Slider (1-10) | Freedom modifier (+/-10) | Q23 |
| 24 | Goal Timeline | Dropdown (<6mo to 3+yrs) | Freedom modifier (+10 short-term) | Q24 |
| 25 | Dependents | Radio (Yes/No) | Essentials modifier (+5) | Q25 |
| 26 | Autonomy Preference | Slider (1-10) | Multiply/Essentials mod (+/-5) | Q26 |
| 27 | Life Stage | Dropdown (5 options) | Multiply/Freedom mod (+/-10) | Q11 |
| 28 | Financial Confidence | Slider (1-10) | Multiply/Essentials mod (+/-5) | Q12 |

**Total Tier 4:** **8 inputs**

**Calculation Improvement:** Adds 20-40 points of modifiers

---

## 🏗️ **Recommended UI Structure**

### **Always Visible (TIER 1: 6 inputs)**
```
┌──────────────────────────────────────┐
│ 💰 Income & Spending                 │
│  • Monthly Income: [slider] $5,000  │
│  • Essentials: [slider] $2,700      │
│                                      │
│ 🎯 Priorities (Rank Top 3)           │
│  • 1st: [dropdown]                  │
│  • 2nd: [dropdown]                  │
│  • 3rd: [dropdown]                  │
│                                      │
│ 📊 Financial Satisfaction            │
│  • [slider] 4/10 (Dissatisfied)     │
└──────────────────────────────────────┘

✅ Calculator works with just these!
Expand sections below for better accuracy ▼
```

### **Collapsible Sections (TIERS 2-4)**

```
┌──────────────────────────────────────┐
│ [+] Financial Details (4 inputs) ▼   │
│  → Adds accuracy for debt & savings  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [+] Behavioral Profile (10 inputs) ▼ │
│  → Auto-filled from Tool 2           │
│  → Or enter manually                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [+] Advanced Settings (8 inputs) ▼   │
│  → For maximum personalization       │
└──────────────────────────────────────┘
```

---

## 🔄 **Tool 2 Fallback Questions (When Tool 2 Missing)**

**Show these 3 questions INLINE before main calculator:**

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Quick Questions for Accurate Results (1 min) │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. How well do you track your spending?        │
│    [────────●──] 6/10                          │
│    1 = Never track  |  10 = Track every dollar │
│                                                 │
│ 2. Is your income sufficient for your needs?   │
│    [─────●─────] 5/10                          │
│    1 = Insufficient  |  10 = More than enough  │
│                                                 │
│ 3. Any wasteful spending? (Optional)           │
│    [_______________________________________]    │
│                                                 │
│ [Continue] or [Complete Tool 2 First]          │
└─────────────────────────────────────────────────┘
```

**These 3 questions enable:**
- Smart essentials analysis (detect overspending)
- Confidence scoring
- Better AI insights

---

## 📋 **Final Recommendation**

### **Minimum Viable Calculator:**
**6 inputs (Tier 1)** - Works immediately, basic accuracy

### **Recommended Experience:**
**Tier 1 (6) + Tier 2 (4) + Fallback (3) = 13 inputs total**

This gives:
- ✅ Basic calculation (Tier 1)
- ✅ Financial situation modifiers (Tier 2)
- ✅ Smart essentials analysis (Fallback questions)
- ✅ Behavioral modifiers either from Tool 2 OR manual

### **Progressive Enhancement Path:**
```
Start: 6 inputs (Tier 1) → Works, basic allocation
  ↓
Add: 4 inputs (Tier 2) → Better accuracy
  ↓
Add: 3 fallback questions → Smart essentials
  ↓
(Optional) Expand behavioral → More modifiers
  ↓
(Optional) Advanced settings → Maximum personalization
```

---

## ✅ **Decision for Q3**

**Minimum Required:** **6 inputs** (Tier 1)

**Recommended Default:** **13 inputs** (Tier 1 + Tier 2 + Fallback)

**Maximum Personalization:** **28 inputs** (All tiers)

**UI Strategy:** Start with 6 visible, progressive enhancement via collapsible sections

---

## 🎯 **Next Steps**

1. ✅ Input analysis complete
2. 🔄 Update TOOL4-SPECIFICATION.md with:
   - Interactive calculator architecture
   - Final input structure (6 required, progressive enhancement)
   - Tool 2 fallback system (3 questions)
3. 🔄 Create implementation checklist
4. 🔄 Design mockups based on structure above

**Ready to finalize specification document!**
