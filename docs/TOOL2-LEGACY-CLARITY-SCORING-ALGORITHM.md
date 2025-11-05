# Legacy Clarity Tool - Scoring & Insights Algorithm

**Source:** Tool 2 Financial Clarity (v2 Apps Script backend)
**Purpose:** Document the exact scoring logic for potential v3 implementation

---

## 🎯 Overview

The legacy Clarity tool uses a **3-tier scoring system**:
1. **Domain Scores** - Raw scores per financial domain
2. **Cohort Comparison** - Individual vs group average (gap analysis)
3. **Priority Ranking** - Weighted gaps determine High/Medium/Low priority domains

---

## 📊 Part 1: Domain Score Calculation

### **8 Financial Domains**

Each domain is scored by **summing specific column ranges** from the Google Sheet:

| Domain | Column Range | Max Possible Score | Calculation |
|--------|--------------|-------------------|-------------|
| **Income** | D, E, F, G, BC | 5 questions × 5 points = 25 | Sum(D, E, F, G, BC) |
| **Spending** | L, O | 2 questions × 5 points = 10 | Sum(L, O) |
| **Debt** | U, V, W, X, BD | 5 questions × 5 points = 25 | Sum(U, V, W, X, BD) |
| **Emergency Fund** | AB, AE | 2 questions × 5 points = 10 | Sum(AB, AE) |
| **Savings** | AG, AJ | 2 questions × 5 points = 10 | Sum(AG, AJ) |
| **Investments** | AL, AO | 2 questions × 5 points = 10 | Sum(AL, AO) |
| **Retirement** | AQ, AR, AS, AT, BE | 5 questions × 5 points = 25 | Sum(AQ, AR, AS, AT, BE) |
| **Insurance** | AV, AY, AZ, BA | 4 questions × 5 points = 20 | Sum(AV, AY, AZ, BA) |

**Note:** The column mapping seems arbitrary - columns BC, BD, BE appear to be "bonus" questions added later or pulled from another section.

### **Scoring Logic (ProcessingScript.js lines 68-82)**

```javascript
function sumColumnsForDomain(sheet, row, cols) {
  let total = 0;
  if (cols.length === 2) {
    // Contiguous range [start, end]
    for (let c = cols[0]; c <= cols[1]; c++) {
      total += Number(sheet.getRange(row, c).getValue()) || 0;
    }
  } else {
    // Explicit list [col1, col2, col3, ...]
    cols.forEach(c => {
      total += Number(sheet.getRange(row, c).getValue()) || 0;
    });
  }
  return total;
}
```

**Result:** Each student has 8 domain scores (raw points)

---

## 📈 Part 2: Cohort Comparison (Gap Analysis)

### **Step 1: Calculate Cohort Mean for Each Domain**

For each domain, calculate the average score across **all students**:

```javascript
const cohortMeans = {};
Object.entries(domainCols).forEach(([domain, cols]) => {
  let sumAll = 0;
  dataRows.forEach(rArr => sumAll += sumColsInArray(rArr, cols));
  cohortMeans[domain] = sumAll / dataRows.length;
});
```

**Example:**
- Student A: Income score = 18
- Student B: Income score = 22
- Student C: Income score = 20
- **Cohort mean for Income = (18 + 22 + 20) / 3 = 20**

### **Step 2: Calculate Individual Gap**

For each student, calculate **gap = student score - cohort mean**:

```javascript
const gaps = {};
Object.keys(scores).forEach(d => {
  gaps[d] = scores[d] - cohortMeans[d];
});
```

**Example:**
- Student A: Income = 18, Cohort mean = 20
- **Gap = 18 - 20 = -2** (below average)

**Interpretation:**
- **Negative gap** = Below cohort average (needs attention)
- **Positive gap** = Above cohort average (doing well)
- **Zero gap** = At cohort average

---

## ⚖️ Part 3: Stress-Weighted Gap (Priority Scoring)

### **Emotional Stress Weights**

Not all domains have equal psychological impact. The system applies **stress multipliers**:

```javascript
const feltStress = {
  Income:        2,
  Spending:      5,  // HIGHEST - Most emotionally charged
  Debt:          4,
  EmergencyFund: 3,
  Savings:       2,
  Investments:   1,
  Retirement:    1,
  Insurance:     1
};
```

**Rationale:**
- **Spending (5)** - Daily decisions, guilt, judgment, visible to others
- **Debt (4)** - Constant pressure, fear, shame
- **Emergency Fund (3)** - Safety anxiety, "what if" scenarios
- **Income (2)** - Stress but often stable/unchangeable short-term
- **Rest (1)** - Less immediate emotional impact

### **Calculate Weighted Gap**

```javascript
const weighted = {};
Object.keys(scores).forEach(d => {
  weighted[d] = gaps[d] * feltStress[d];
});
```

**Example:**
- **Income:** Gap = -2, Stress = 2 → **Weighted = -4**
- **Spending:** Gap = -3, Stress = 5 → **Weighted = -15** ⚠️
- **Debt:** Gap = -1, Stress = 4 → **Weighted = -4**

**Key Insight:** Even small gaps in high-stress domains get amplified.

---

## 🎖️ Part 4: Priority Buckets

### **Sorting by Weighted Gap**

Domains are sorted **ascending** by weighted gap (most negative = highest priority):

```javascript
const sortedDomains = Object.keys(scores)
  .sort((a, b) => weighted[a] - weighted[b]);
```

**Example Sorted List:**
1. Spending: -15 (most negative)
2. Debt: -4
3. Income: -4
4. Emergency Fund: -2
5. Savings: +1
6. Investments: +3
7. Retirement: +5
8. Insurance: +8 (most positive)

### **Assign Priority Tiers**

```javascript
const high   = sortedDomains.slice(0, 2);   // Top 2 = HIGH
const medium = sortedDomains.slice(2, 5);   // Next 3 = MEDIUM
const low    = sortedDomains.slice(5);      // Rest = LOW
```

**Result:**
- **High Priority:** Spending, Debt
- **Medium Priority:** Income, Emergency Fund, Savings
- **Low Priority:** Investments, Retirement, Insurance

---

## 🎯 Part 5: Focus Domain

The **single most critical domain** to address:

```javascript
const focusDomain = high[0];  // First item in High Priority
```

In our example: **Spending**

---

## 📝 Part 6: Insight Generation (Current System)

### **Report Structure (Clarity-Output-Base.md)**

The report uses these calculated values to populate:

1. **Priority Focus Areas**
   - Lists all 8 domains in High/Medium/Low buckets
   - Each with: Action item + Expected outcome

2. **Growth Archetype**
   - Based on "domain-pair" analysis
   - Looks at **complementary domains** (Emergency Fund ↔ Savings, Spending ↔ Debt)
   - Selects pair with largest combined gap

3. **Domain-Specific Insights**
   - One paragraph per domain
   - References: individual score, gap from mean, priority tier

---

## 🔄 Legacy Algorithm Flow (Complete)

```
Step 1: Student completes 64 questions
         ↓
Step 2: Calculate 8 domain raw scores
         ↓
Step 3: Calculate cohort means (all students)
         ↓
Step 4: Calculate gaps (student - mean)
         ↓
Step 5: Apply stress weights
         ↓
Step 6: Sort by weighted gap
         ↓
Step 7: Assign High/Medium/Low tiers
         ↓
Step 8: Identify focus domain
         ↓
Step 9: Generate report with insights
```

---

## 💡 What Works Well

1. **Stress Weighting** - Acknowledges emotional reality of finances
2. **Focus Domain** - Gives clear "start here" guidance
3. **Priority Tiers** - Manageable roadmap (not 8 simultaneous projects)
4. **Domain-Pair Archetypes** - Recognizes interconnected financial behaviors

---

## ⚠️ Limitations & Issues

### **1. Cohort Comparison Problems**

**Issue:** Early students have no cohort, scores drift over time

**Example:**
- First 10 students: Mostly struggling → Low cohort average
- Student 11 (doing okay): Looks artificially "good" vs struggling cohort
- Months later: New cohort of high-performers joins
- Original Student 11: Now looks "bad" vs new cohort (same scores!)

**Conclusion:** Cohort comparison is **unreliable and unfair**.

### **2. Arbitrary Column Mapping**

The column assignments seem inconsistent:
- Why is Spending only 2 questions but Income is 5?
- BC, BD, BE columns suggest ad-hoc additions
- No clear logic for which questions map to which domain

### **3. No Absolute Benchmarks**

Everything is relative to the group. But what if the whole group is struggling?
- A student with 15/25 on Income might be "above average" in a struggling cohort
- But 15/25 objectively indicates major income clarity issues

### **4. Growth Archetype Logic Unclear**

The report mentions "domain-pair analysis" but the v2 code doesn't show:
- How pairs are defined
- How "largest combined gap" is calculated
- How archetype names/descriptions are generated

---

## 🎯 Recommendations for v3

### **Option A: Individual Benchmarks (No Cohort)**

Replace cohort comparison with **absolute scoring**:

```javascript
// Example for Income domain (max 25 points)
function getIncomeLevel(score) {
  if (score >= 20) return { level: 'High', message: 'Strong income clarity' };
  if (score >= 15) return { level: 'Medium', message: 'Moderate income clarity' };
  return { level: 'Low', message: 'Income clarity needs attention' };
}
```

**Pros:**
- Consistent over time
- Fair to all students
- No cold-start problem

**Cons:**
- Need to define thresholds (requires domain expertise)

### **Option B: Percentile Scoring**

Track historical data, show where student falls in distribution:

```javascript
// "You scored better than 65% of all previous students"
```

**Pros:**
- Comparative context without cohort dependency
- Stable as dataset grows

**Cons:**
- Still requires historical data
- Early students still have no context

### **Option C: Hybrid Approach**

Use absolute benchmarks for scoring, but show percentile as context:

```
Your Income score: 18/25 (Medium)
Historical context: 60th percentile
```

**Pros:**
- Best of both worlds
- Benchmarks provide clarity
- Percentiles provide context

**Cons:**
- More complex to implement

---

## 📊 Simplified v3 Algorithm (Proposed)

```
Step 1: Student completes ~50 questions
         ↓
Step 2: Calculate 5 domain scores (consolidation)
         Money Flow: Income + Spending
         Obligations: Debt + Emergency Fund
         Liquidity: Savings
         Growth: Investments + Retirement
         Protection: Insurance
         ↓
Step 3: Apply absolute benchmarks (High/Med/Low)
         ↓
Step 4: Apply stress weights (adjust for emotional impact)
         ↓
Step 5: Sort by (score × stress weight)
         ↓
Step 6: Assign priority tiers
         ↓
Step 7: Generate insights (GPT-assisted + templates)
         ↓
Step 8: Create Growth Archetype (based on Tool 1 trauma data + domain scores)
```

---

## 🔍 Questions for Larry

1. **Stress Weights:** Do the legacy weights (Spending=5, Debt=4, etc.) feel accurate? Should we adjust?

2. **Absolute Benchmarks:** What defines "good" clarity in each domain?
   - Example: Income - Is 20/25 "good" or does it depend on life stage?

3. **Growth Archetype:** How should we define the domain-pairs and archetype names?
   - Should archetypes tie to Tool 1 trauma strategies?

4. **Scoring Transparency:** Should students see raw scores, or just High/Med/Low labels?

5. **Historical Context:** Show percentiles once we have data, or skip entirely?

---

**End of Document**
