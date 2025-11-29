# Priority Recommendation Logic

**Purpose:** Analyze pre-survey + Tool 2 data to recommend, caution, or neutrally present the 10 financial priorities.

**Created:** 2025-11-29
**Status:** Design Phase

---

## The 10 Priorities & Base Allocations

| Priority | M | E | F | J | Focus |
|----------|---|---|---|---|-------|
| Build Long-Term Wealth | 40% | 25% | 20% | 15% | Investment growth |
| Get Out of Debt | 15% | 25% | 45% | 15% | Debt elimination |
| Feel Financially Secure | 25% | 35% | 30% | 10% | Stability & safety |
| Enjoy Life Now | 20% | 20% | 15% | 45% | Present enjoyment |
| Save for a Big Goal | 15% | 25% | 45% | 15% | Targeted saving |
| Stabilize to Survive | 5% | 45% | 40% | 10% | Crisis management |
| Build/Stabilize Business | 20% | 30% | 35% | 15% | Business growth |
| Create Generational Wealth | 45% | 25% | 20% | 10% | Long-term legacy |
| Create Life Balance | 15% | 25% | 25% | 35% | Balanced approach |
| Reclaim Financial Control | 10% | 35% | 40% | 15% | Reset & rebuild |

---

## Data Available for Analysis

### From Pre-Survey (8 questions)
- `monthlyIncome` (number) → Derived tier: A-E
- `monthlyEssentials` (number) → Derived tier: A-F
- `satisfaction` (0-10)
- `discipline` (0-10)
- `impulse` (0-10)
- `longTerm` (0-10)
- `lifestyle` (0-10)
- `autonomy` (0-10)

### From Tool 2 (if available)
- `debtLoad` (A-E) → Derived from debt text + stress
- `interestLevel` (High/Medium/Low) → Derived from debt stress
- `emergencyFund` (A-E) → 0-6+ months
- `incomeStability` (Unstable/Variable/Stable/Very stable)
- `dependents` (Yes/No)
- `age` → Life stage
- `growth` (0-10) → Derived from investment/savings/retirement
- `stability` (0-10) → Derived from emergency fund/insurance

---

## Recommendation Algorithm

For each priority, calculate a **recommendation score** (-100 to +100):
- **+100 to +50**: ⭐ **Recommended** - "Based on your situation, this is a great fit"
- **+49 to -49**: ⚪ **Available** - Neutral presentation
- **-50 to -100**: ⚠️ **Challenging** - "May be difficult given current constraints"

---

## Priority-Specific Logic

### 1. Build Long-Term Wealth

**Recommended (+):**
- High discipline (7-10): +30
- High long-term focus (7-10): +30
- Low/no debt (A-B): +20
- Stable income: +15
- High growth orientation (7-10): +20
- Sufficient emergency fund (D-E): +15
- High autonomy (7-10): +10

**Cautioned (-):**
- Low discipline (0-3): -40
- Low long-term focus (0-3): -30
- Severe debt load (D-E): -40
- Unstable income: -30
- Low emergency fund (A-B): -25
- High lifestyle priority (7-10): -20

**One-line reason:**
- Recommended: "Your discipline and long-term focus make this achievable"
- Cautioned: "Consider addressing debt/stability first before aggressive wealth building"

---

### 2. Get Out of Debt

**Recommended (+):**
- High debt load (D-E): +50
- High-interest debt: +30
- Low satisfaction (0-3): +20
- High stability orientation (7-10): +20
- Low emergency fund (A-B): +15
- Short-term timeline preference: +10

**Cautioned (-):**
- No/low debt (A-B): -60
- Sufficient emergency fund (D-E): -20
- High lifestyle priority (7-10): -25

**One-line reason:**
- Recommended: "Your debt level suggests this should be your primary focus"
- Cautioned: "This priority is for those with significant debt to eliminate"

---

### 3. Feel Financially Secure

**Recommended (+):**
- Unstable income: +40
- Low emergency fund (A-B): +40
- Has dependents: +25
- High emotional safety need (inferred from low satisfaction + high stability): +20
- Low impulse control (0-3): +15
- Low discipline (0-3): +15

**Cautioned (-):**
- Very stable income: -25
- High emergency fund (D-E): -30
- No dependents: -10
- High growth orientation (7-10): -20

**One-line reason:**
- Recommended: "Building security first will give you a stable foundation"
- Cautioned: "You may be ready for more growth-focused priorities"

---

### 4. Enjoy Life Now

**Recommended (+):**
- Low satisfaction (0-3): +30
- High lifestyle priority (7-10): +40
- Stable income: +25
- Low/no debt (A-B): +30
- Sufficient emergency fund (D-E): +20
- High impulse control (7-10): +15

**Cautioned (-):**
- High debt load (D-E): -50
- Unstable income: -40
- Low emergency fund (A-B): -35
- Has dependents (3+): -25
- Low impulse control (0-3): -30
- Low income (A): -20

**One-line reason:**
- Recommended: "Your stable situation allows room for present enjoyment"
- Cautioned: "Consider addressing financial stability before increasing enjoyment spending"

---

### 5. Save for a Big Goal

**Recommended (+):**
- Short-term timeline (6-12 months): +30
- Moderate debt (C): +10
- Sufficient emergency fund (D-E): +20
- High discipline (7-10): +25
- Stable income: +20

**Cautioned (-):**
- Severe debt (E): -35
- Unstable income: -25
- Low emergency fund (A-B): -30
- Low discipline (0-3): -25

**One-line reason:**
- Recommended: "Your discipline and timeline align well with targeted saving"
- Cautioned: "Build emergency fund and stabilize income before big goal saving"

---

### 6. Stabilize to Survive

**Recommended (+):**
- Severe debt load (E): +40
- Unstable income: +50
- Low emergency fund (A): +50
- Has dependents: +30
- Low satisfaction (0-3): +25
- Low income (A): +30

**Cautioned (-):**
- No debt (A-B): -40
- Very stable income: -40
- High emergency fund (D-E): -40
- No dependents: -20
- High income (E): -25

**One-line reason:**
- Recommended: "Your situation calls for crisis-mode focus on stability"
- Cautioned: "This is for urgent financial crisis situations"

---

### 7. Build or Stabilize a Business

**Recommended (+):**
- High autonomy (7-10): +30
- High growth orientation (7-10): +25
- Moderate emergency fund (C): +20
- Stable income: +15
- High discipline (7-10): +20
- Medium-term timeline (1-2 years): +15

**Cautioned (-):**
- Severe debt (E): -35
- Unstable income: -30
- Low emergency fund (A-B): -40
- Low autonomy (0-3): -25
- Low discipline (0-3): -30
- Has dependents (3+): -20

**One-line reason:**
- Recommended: "Your autonomy and discipline support entrepreneurial goals"
- Cautioned: "Stabilize personal finances before business investments"

---

### 8. Create Generational Wealth

**Recommended (+):**
- High income (E): +30
- High growth orientation (7-10): +35
- Very long timeline (5+ years): +30
- High discipline (7-10): +30
- Sufficient emergency fund (D-E): +25
- Low/no debt (A-B): +25
- Has dependents: +20

**Cautioned (-):**
- Low income (A-B): -40
- Severe debt (D-E): -40
- Short timeline (< 1 year): -35
- Low discipline (0-3): -40
- Low emergency fund (A-B): -30
- Low long-term focus (0-3): -35

**One-line reason:**
- Recommended: "Your long-term vision and resources support legacy building"
- Cautioned: "This requires financial stability and long-term commitment"

---

### 9. Create Life Balance

**Recommended (+):**
- Medium satisfaction (4-6): +20
- Moderate lifestyle priority (4-6): +15
- Stable income: +20
- Moderate debt (B-C): +10
- Moderate emergency fund (C): +15
- Medium-term timeline (1-2 years): +15

**Cautioned (-):**
- Extreme debt (A or E): -25
- Very low satisfaction (0-2): -20
- Unstable income: -20
- Low emergency fund (A): -25

**One-line reason:**
- Recommended: "Balanced priorities fit your moderate risk profile"
- Cautioned: "Consider more focused priorities given your current situation"

---

### 10. Reclaim Financial Control

**Recommended (+):**
- Low satisfaction (0-3): +40
- High debt load (D-E): +30
- Low discipline (0-3): +30
- Low emergency fund (A-B): +25
- Unstable income: +25
- Low impulse control (0-3): +20

**Cautioned (-):**
- High satisfaction (7-10): -30
- No debt (A): -25
- High discipline (7-10): -25
- Sufficient emergency fund (D-E): -20
- Very stable income: -20

**One-line reason:**
- Recommended: "Time to reset and rebuild your financial foundation"
- Cautioned: "This is for those needing a fresh start after struggle"

---

## Implementation Function

```javascript
/**
 * Calculates recommendation score for each priority
 * @param {Object} preSurveyData - Pre-survey responses
 * @param {Object} tool2Data - Tool 2 responses (optional)
 * @returns {Array} Array of priorities with scores and indicators
 */
function calculatePriorityRecommendations(preSurveyData, tool2Data) {
  // Derive tiers from pre-survey
  const incomeRange = mapIncomeToRange(preSurveyData.monthlyIncome);
  const essentialsRange = mapEssentialsToRange(preSurveyData.monthlyEssentials);

  // Get Tool 2 derived data (or use safe defaults)
  const debtLoad = tool2Data ? deriveDebtLoad(tool2Data) : 'C';
  const interestLevel = tool2Data ? deriveInterestLevel(tool2Data) : 'Medium';
  const emergencyFund = tool2Data ? mapEmergencyFundMonths(tool2Data.emergencyFundMonths) : 'C';
  const incomeStability = tool2Data ? mapIncomeStability(tool2Data.incomeConsistency) : 'Stable';
  const dependents = tool2Data?.dependents || 'No';
  const growth = tool2Data ? deriveGrowthFromTool2(tool2Data) : 5;
  const stability = tool2Data ? deriveStabilityFromTool2(tool2Data) : 5;

  // Extract pre-survey values
  const { satisfaction, discipline, impulse, longTerm, lifestyle, autonomy } = preSurveyData;

  // Calculate scores for each priority
  const priorities = [
    {
      name: 'Build Long-Term Wealth',
      score: scoreWealthPriority({ discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle }),
      baseAllocation: { M:40, E:25, F:20, J:15 }
    },
    {
      name: 'Get Out of Debt',
      score: scoreDebtPriority({ debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle }),
      baseAllocation: { M:15, E:25, F:45, J:15 }
    },
    {
      name: 'Feel Financially Secure',
      score: scoreSecurityPriority({ incomeStability, emergencyFund, dependents, satisfaction, stability, impulse, discipline, growth }),
      baseAllocation: { M:25, E:35, F:30, J:10 }
    },
    {
      name: 'Enjoy Life Now',
      score: scoreEnjoymentPriority({ satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, impulse, incomeRange, dependents }),
      baseAllocation: { M:20, E:20, F:15, J:45 }
    },
    {
      name: 'Save for a Big Goal',
      score: scoreBigGoalPriority({ debtLoad, emergencyFund, discipline, incomeStability }),
      baseAllocation: { M:15, E:25, F:45, J:15 }
    },
    {
      name: 'Stabilize to Survive',
      score: scoreSurvivalPriority({ debtLoad, incomeStability, emergencyFund, dependents, satisfaction, incomeRange }),
      baseAllocation: { M:5, E:45, F:40, J:10 }
    },
    {
      name: 'Build or Stabilize a Business',
      score: scoreBusinessPriority({ autonomy, growth, emergencyFund, incomeStability, discipline, debtLoad, dependents }),
      baseAllocation: { M:20, E:30, F:35, J:15 }
    },
    {
      name: 'Create Generational Wealth',
      score: scoreGenerationalPriority({ incomeRange, growth, discipline, emergencyFund, debtLoad, longTerm, dependents }),
      baseAllocation: { M:45, E:25, F:20, J:10 }
    },
    {
      name: 'Create Life Balance',
      score: scoreBalancePriority({ satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund }),
      baseAllocation: { M:15, E:25, F:25, J:35 }
    },
    {
      name: 'Reclaim Financial Control',
      score: scoreControlPriority({ satisfaction, debtLoad, discipline, emergencyFund, incomeStability, impulse }),
      baseAllocation: { M:10, E:35, F:40, J:15 }
    }
  ];

  // Add indicators and reasons
  return priorities.map(p => ({
    ...p,
    indicator: p.score >= 50 ? 'recommended' : p.score <= -50 ? 'challenging' : 'available',
    icon: p.score >= 50 ? '⭐' : p.score <= -50 ? '⚠️' : '⚪',
    reason: getPriorityReason(p.name, p.indicator)
  })).sort((a, b) => b.score - a.score); // Sort by recommendation strength
}
```

---

## UI Presentation

After pre-survey submission, show priorities in this order:
1. **Recommended priorities** (⭐) - Top of list with green highlighting
2. **Available priorities** (⚪) - Middle section, neutral styling
3. **Challenging priorities** (⚠️) - Bottom with yellow/orange highlighting

Each priority card shows:
- Icon + Priority name
- One-line reason (medium explanation)
- Base allocation preview: "Starting point: M:40%, E:25%, F:20%, J:15%"
- Expandable "Why this recommendation?" for full logic

---

## Edge Cases

1. **No Tool 2 data**: Use moderate defaults (C/Medium tiers)
2. **Conflicting signals**: Tie-breaker = most recent/severe concern wins
3. **All neutral scores**: Default to "Create Life Balance" as recommended
4. **Tied scores**: Alphabetical order

---

## Next Steps

1. Implement individual scoring functions (`scoreWealthPriority()`, etc.)
2. Create helper functions (`mapIncomeToRange()`, `getPriorityReason()`)
3. Build UI component for priority picker
4. Test with edge cases and real student data
5. Integrate into Phase 3 unified page architecture
