# Tool 4: Financial Freedom Framework - Implementation Plan

**Version:** 1.0
**Date:** November 17, 2025
**Status:** Planning Phase
**Estimated Total Time:** 40-60 hours
**Dependencies:** TOOL4-SPECIFICATION.md (approved)

---

## Table of Contents

1. [Development Phases Overview](#1-development-phases-overview)
2. [Phase 1: Foundation & Core Calculator](#2-phase-1-foundation--core-calculator)
3. [Phase 2: Data Storage & Scenario Management](#3-phase-2-data-storage--scenario-management)
4. [Phase 3: GPT Integration](#4-phase-3-gpt-integration)
5. [Phase 4: User Interface & Interactivity](#5-phase-4-user-interface--interactivity)
6. [Phase 5: PDF Generation](#6-phase-5-pdf-generation)
7. [Phase 6: Testing & Bug Fixes](#7-phase-6-testing--bug-fixes)
8. [Phase 7: Documentation & Launch](#8-phase-7-documentation--launch)
9. [Development Environment Setup](#9-development-environment-setup)
10. [Risk Management](#10-risk-management)
11. [Success Criteria & Acceptance](#11-success-criteria--acceptance)

---

## 1. Development Phases Overview

### 1.1 Phase Summary

| Phase | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| **Phase 1** | Foundation & Core Calculator | 8-10 hours | Spec approval |
| **Phase 2** | Data Storage & Scenario Mgmt | 6-8 hours | Phase 1 complete |
| **Phase 3** | GPT Integration | 6-8 hours | Phase 1, 2 complete |
| **Phase 4** | UI & Interactivity | 10-12 hours | Phase 1, 2 complete |
| **Phase 5** | PDF Generation | 4-6 hours | Phase 1, 2, 3 complete |
| **Phase 6** | Testing & Bug Fixes | 8-10 hours | Phase 1-5 complete |
| **Phase 7** | Documentation & Launch | 2-4 hours | Phase 6 complete |
| **TOTAL** | | **44-58 hours** | |

### 1.2 Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| M1: Core Calculator Working | TBD | AllocationFunction.js tested, accurate |
| M2: Scenario Save/Load Working | TBD | Can create, save, load scenarios |
| M3: GPT Integration Working | TBD | Personalized guidance generated |
| M4: Full UI Functional | TBD | Interactive SPA, all features working |
| M5: PDF Generation Working | TBD | Can generate scenario + comparison PDFs |
| M6: Testing Complete | TBD | Zero critical bugs, UAT passed |
| M7: Production Launch | TBD | Tool 4 live in production |

### 1.3 Team & Roles

| Role | Responsibility | Estimated Hours |
|------|----------------|-----------------|
| **Developer** | Implementation, debugging | 40-50 hours |
| **Tester** | Manual testing, UAT | 4-8 hours |
| **Reviewer** | Code review, spec validation | 2-4 hours |
| **Stakeholder** | Requirements approval, UAT | 2-4 hours |

---

## 2. Phase 1: Foundation & Core Calculator

**Duration:** 8-10 hours
**Goal:** Build and test the allocation calculation engine

### 2.1 Tasks

#### Task 1.1: Set Up Tool 4 File Structure
**Time:** 30 minutes

**Actions:**
1. Create `/tools/tool4/` directory
2. Create placeholder files:
   - `Tool4.js`
   - `Tool4AllocationEngine.js`
   - `Tool4GPT.js`
   - `Tool4Scenarios.js`
   - `Tool4Report.js`
   - `Tool4Templates.js`

**Deliverable:** File structure in place

---

#### Task 1.2: Implement AllocationEngine Core Logic
**Time:** 4-5 hours

**File:** `Tool4AllocationEngine.js`

**Sub-tasks:**
1. **Base Weights Calculation** (1 hour)
   ```javascript
   AllocationEngine.calculateBaseWeights = function(priority1, priority2, priority3) {
     const weights = {
       priority1: 0.5,
       priority2: 0.3,
       priority3: 0.2
     };

     // Weighted average of 3 priorities
     return {
       M: weights.priority1 * PRIORITIES[priority1].M +
          weights.priority2 * PRIORITIES[priority2].M +
          weights.priority3 * PRIORITIES[priority3].M,
       E: // similar
       F: // similar
       J: // similar
     };
   };
   ```

2. **Financial Modifiers** (1 hour)
   - Income range modifiers
   - Debt load modifiers
   - Interest level modifiers
   - Emergency fund modifiers
   - Income stability modifiers

3. **Behavioral Modifiers** (1 hour)
   - Discipline modifiers
   - Impulse control modifiers
   - Long-term focus modifiers
   - Emotional spending modifiers
   - Financial avoidance modifiers
   - Financial confidence modifiers

4. **Motivational Modifiers** (1 hour)
   - Lifestyle priority modifiers
   - Growth orientation modifiers
   - Stability orientation modifiers
   - Goal timeline modifiers
   - Dependents modifiers
   - Autonomy modifiers
   - Stage of life modifiers

5. **Normalization & Constraints** (30 min)
   - Sum to 100%
   - Apply essentials floor (warning system)
   - Check red flags

6. **Red Flag Detection** (30 min)
   - Low emergency fund
   - High debt + low income
   - Multiply < 10%
   - Enjoyment > 40%

**Deliverable:** Working AllocationEngine.js with all modifiers

**Testing:**
- Unit test with sample inputs
- Verify output sums to 100%
- Verify red flags trigger correctly

---

#### Task 1.3: Create CONFIG Entry for Tool 4
**Time:** 30 minutes

**File:** `Config.js`

**Actions:**
1. Add `CONFIG.TOOLS.TOOL4` object
2. Define all constants (max scenarios, thresholds, etc.)
3. Add priority definitions
4. Add modifier configurations

**Deliverable:** CONFIG.TOOLS.TOOL4 complete

---

#### Task 1.4: Implement Tool4 Manifest & Registration
**Time:** 1 hour

**File:** `Tool4.js`

**Actions:**
1. Create Tool4 object with manifest
2. Implement skeleton `render()` method (returns placeholder HTML)
3. Register in `Code.js` using ToolRegistry
4. Test that `/tool4` route works (even if placeholder)

**Deliverable:** Tool 4 accessible via Router

**Testing:**
- Visit `/tool4` URL
- Verify "Tool 4 placeholder" message appears
- Verify no errors in Apps Script logs

---

#### Task 1.5: Test Allocation Calculations
**Time:** 2 hours

**Actions:**
1. Create test data sets (10 different profiles)
2. Run through AllocationEngine
3. Verify allocations make sense
4. Document edge cases
5. Fix any calculation bugs

**Test Cases:**
```javascript
// Test Case 1: Conservative Profile
{
  priorities: ['Feel Financially Secure', 'Get Out of Debt', 'Build Long-Term Wealth'],
  incomeRange: 'C',
  debtLoad: 'D',
  emergencyFund: 'B',
  satisfaction: 3,
  discipline: 5,
  // ... all inputs
}
// Expected: High E+F, low M

// Test Case 2: Aggressive Profile
{
  priorities: ['Build Long-Term Wealth', 'Create Generational Wealth', 'Enjoy Life Now'],
  incomeRange: 'E',
  debtLoad: 'A',
  emergencyFund: 'E',
  satisfaction: 8,
  discipline: 9,
  // ... all inputs
}
// Expected: High M, low F

// ... 8 more test cases
```

**Deliverable:** Documented test results, bug-free calculations

---

### 2.2 Phase 1 Acceptance Criteria

- ✅ AllocationEngine.calculateAllocations() returns valid allocations (M+E+F+J = 100%)
- ✅ All 10 test cases pass with expected ranges
- ✅ Red flags trigger correctly
- ✅ Modifiers apply in correct order
- ✅ Zero calculation errors in logs
- ✅ Tool 4 route accessible (even if placeholder UI)

---

## 3. Phase 2: Data Storage & Scenario Management

**Duration:** 6-8 hours
**Goal:** Implement RESPONSES + TOOL4_SCENARIOS dual storage system

### 3.1 Tasks

#### Task 2.1: Create TOOL4_SCENARIOS Sheet
**Time:** 30 minutes

**Actions:**
1. Create new sheet in master spreadsheet
2. Add header row with all 60 columns (see spec Section 4.5)
3. Set column formats (text, number, date, boolean)
4. Add data validation where applicable
5. Protect sheet (only script can write)

**Deliverable:** TOOL4_SCENARIOS sheet ready

---

#### Task 2.2: Implement saveScenario() Function
**Time:** 2 hours

**File:** `Tool4Scenarios.js`

**Sub-tasks:**
1. **Generate UUID** (if new scenario)
   ```javascript
   const scenarioId = scenarioData.scenarioId || Utilities.getUuid();
   ```

2. **Check if existing scenario** (editing vs creating)
   ```javascript
   const existingRow = findScenarioRow(sheet, scenarioId);
   ```

3. **Handle scenario count limit** (max 10)
   ```javascript
   const count = getScenarioCount(sheet, clientId);
   if (count >= 10 && !existingRow) {
     deleteOldestScenario(sheet, clientId);
   }
   ```

4. **Append or update row**
   ```javascript
   if (existingRow) {
     updateScenarioRow(sheet, existingRow, scenarioData);
   } else {
     appendScenarioRow(sheet, clientId, scenarioId, scenarioData);
   }
   ```

**Deliverable:** saveScenario() working, tested

**Testing:**
- Save 1st scenario → verify row added
- Save 2nd scenario → verify 2nd row added
- Save 11th scenario → verify oldest deleted
- Edit scenario → verify update, not duplicate

---

#### Task 2.3: Implement getUserScenarios() Function
**Time:** 1 hour

**File:** `Tool4Scenarios.js`

**Logic:**
```javascript
Tool4Scenarios.getUserScenarios = function(clientId, limit = 10) {
  const sheet = getScenarioSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const scenarios = data.slice(1)
    .filter(row => normalizeId(row[clientIdCol]) === normalizeId(clientId))
    .map(row => parseScenarioRow(row, headers))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  return scenarios;
};
```

**Deliverable:** getUserScenarios() returns correct scenarios

**Testing:**
- Student with 0 scenarios → returns []
- Student with 5 scenarios → returns 5 (newest first)
- Student with 15 scenarios → returns 10 (oldest 5 excluded)

---

#### Task 2.4: Implement setOptimalScenario() Function
**Time:** 2 hours

**File:** `Tool4Scenarios.js`

**Sub-tasks:**
1. **Clear all Is_Optimal flags** for student
2. **Set selected scenario** Is_Optimal = TRUE
3. **Update RESPONSES sheet** with optimal scenario data
4. **Unlock Tool 5** via ToolAccessControl

**Logic:**
```javascript
Tool4Scenarios.setOptimalScenario = function(clientId, scenarioId) {
  const scenarioSheet = getScenarioSheet();

  // 1. Clear all
  clearOptimalFlags(scenarioSheet, clientId);

  // 2. Set selected
  const row = findScenarioRow(scenarioSheet, scenarioId);
  setIsOptimal(scenarioSheet, row, true);

  // 3. Get scenario data
  const scenario = getScenarioByRow(scenarioSheet, row);

  // 4. Update RESPONSES
  DataService.saveToolResponse(clientId, 'tool4', {
    optimalScenarioId: scenarioId,
    scenarioName: scenario.name,
    allocations: scenario.allocations,
    lastModified: new Date().toISOString()
  }, 'COMPLETED');

  // 5. Unlock Tool 5
  ToolAccessControl.adminUnlockTool(clientId, 'tool5', 'system', 'Tool 4 completed');

  return {ok: true};
};
```

**Deliverable:** setOptimalScenario() working end-to-end

**Testing:**
- Mark scenario A as optimal → verify RESPONSES updated, Tool 5 unlocked
- Mark scenario B as optimal → verify scenario A no longer optimal
- Check dashboard → should show "Tool 4: COMPLETED"

---

#### Task 2.5: Implement Helper Functions
**Time:** 1-2 hours

**File:** `Tool4Scenarios.js`

**Functions to implement:**
- `findScenarioRow(sheet, scenarioId)` - Find row number by UUID
- `getScenarioCount(sheet, clientId)` - Count scenarios for student
- `deleteOldestScenario(sheet, clientId)` - Remove oldest by timestamp
- `deleteScenario(clientId, scenarioId)` - Manual delete
- `parseScenarioRow(row, headers)` - Convert sheet row to object
- `normalizeId(id)` - Clean student ID for matching

**Deliverable:** All helper functions tested

---

### 3.2 Phase 2 Acceptance Criteria

- ✅ Can save scenario to TOOL4_SCENARIOS sheet
- ✅ Can load scenarios for a student (newest first)
- ✅ Max 10 scenarios enforced (oldest auto-deleted)
- ✅ Can mark scenario as optimal
- ✅ Optimal scenario updates RESPONSES sheet correctly
- ✅ Tool 5 unlocks when optimal set
- ✅ Dashboard shows "Tool 4: COMPLETED" after optimal set

---

## 4. Phase 3: GPT Integration

**Duration:** 6-8 hours
**Goal:** Integrate OpenAI GPT-4 for personalized guidance

### 4.1 Tasks

#### Task 3.1: Set Up OpenAI API Connection
**Time:** 1 hour

**File:** `Tool4GPT.js`

**Actions:**
1. Store API key in Script Properties (or CONFIG)
2. Implement `callOpenAI()` wrapper function
3. Handle authentication, headers, error responses
4. Test with simple prompt

**Code:**
```javascript
Tool4GPT.callOpenAI = function(messages, options = {}) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

  const payload = {
    model: options.model || 'gpt-4-turbo-preview',
    messages: messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 500,
    response_format: options.response_format || {type: 'json_object'}
  };

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());

  if (json.error) {
    throw new Error(`OpenAI API error: ${json.error.message}`);
  }

  return json;
};
```

**Deliverable:** Working OpenAI API connection

**Testing:**
- Send test prompt → verify response
- Test error handling (invalid API key, quota exceeded, etc.)

---

#### Task 3.2: Implement getToolInsights() Function
**Time:** 1 hour

**File:** `Tool4GPT.js`

**Logic:**
```javascript
Tool4GPT.getToolInsights = function(clientId) {
  const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
  const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
  const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

  return {
    tool1: {
      winner: tool1Data?.data?.winner || null,
      scores: tool1Data?.data?.scores || {},
      topThought: tool1Data?.data?.formData?.thought_ranking?.[0] || null,
      topFeeling: tool1Data?.data?.formData?.feeling_ranking?.[0] || null
    },
    tool2: {
      archetype: tool2Data?.data?.results?.archetype || null,
      topDomain: tool2Data?.data?.results?.topDomain || null,
      domainScores: tool2Data?.data?.results?.domainScores || {},
      stressLevel: tool2Data?.data?.results?.stressLevel || null
    },
    tool3: {
      overallQuotient: tool3Data?.data?.results?.overallQuotient || null,
      externalValidation: tool3Data?.data?.results?.domain1Quotient || null,
      falseSelfView: tool3Data?.data?.results?.domain2Quotient || null
    }
  };
};
```

**Deliverable:** getToolInsights() returns structured insights

**Testing:**
- Test with student who completed Tools 1-3 → verify data
- Test with student missing Tool 1 → verify graceful handling (null values)

---

#### Task 3.3: Create GPT Prompt Templates
**Time:** 2 hours

**File:** `Tool4GPT.js`

**Sub-tasks:**
1. **Write System Prompt** (30 min)
   - Define GPT's role (financial psychology expert)
   - Set tone (empathetic, non-judgmental, plain language)
   - Set constraints (200-300 words, actionable)

2. **Write User Prompt Template** (1 hour)
   - Include student profile placeholders
   - Include insights from Tools 1-3
   - Include scenario data
   - Include specific questions for GPT

3. **Write Comparison Prompt Template** (30 min)
   - Compare two scenarios
   - Recommend which aligns better
   - Suggest middle path if appropriate

**Deliverable:** Prompt templates documented, tested with sample data

**Example System Prompt:**
```
You are a financial psychology expert integrated into the Financial TruPath system.
Your role is to help students understand how their trauma patterns and behavioral
tendencies should inform their budget allocation across 4 buckets: Multiply (M),
Essentials (E), Freedom (F), Enjoyment (J).

You have access to:
1. Tool 1 (Trauma Assessment): 6 trauma categories with scores
2. Tool 2 (Financial Clarity): 5 behavioral domains and archetype
3. Tool 3 (Identity & Validation): Self-view alignment scores
4. Current scenario: Student's inputs and calculated allocations

Your guidance should:
- Be empathetic and non-judgmental
- Connect trauma patterns to financial behaviors
- Explain WHY certain allocations make sense for them
- Suggest adjustments based on psychological insights
- Be concise (200-300 words max)
- Avoid jargon, use plain language
- Return response as JSON with structure: {guidance, alignmentScore, suggestedAdjustments, psychologicalInsights, affirmations}
```

---

#### Task 3.4: Implement generateGPTGuidance() Function
**Time:** 2 hours

**File:** `Tool4GPT.js`

**Logic:**
```javascript
Tool4GPT.generateGPTGuidance = function(clientId, scenarioData) {
  const insights = this.getToolInsights(clientId);
  const student = getStudentProfile(clientId);

  const systemPrompt = GPT_PROMPTS.SYSTEM;
  const userPrompt = buildUserPrompt(student, insights, scenarioData);

  try {
    const response = this.callOpenAI([
      {role: 'system', content: systemPrompt},
      {role: 'user', content: userPrompt}
    ], {
      model: CONFIG.TOOLS.TOOL4.gptModel,
      temperature: CONFIG.TOOLS.TOOL4.gptTemperature,
      max_tokens: CONFIG.TOOLS.TOOL4.gptMaxTokens,
      response_format: {type: 'json_object'}
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    return {
      ok: true,
      guidance: parsed.guidance,
      alignmentScore: parsed.alignmentScore || null,
      suggestions: parsed.suggestedAdjustments || [],
      insights: parsed.psychologicalInsights || [],
      affirmations: parsed.affirmations || []
    };

  } catch (error) {
    Logger.log(`GPT error: ${error.message}`);
    // Fallback to template
    return generateTemplateGuidance(clientId, scenarioData);
  }
};
```

**Deliverable:** generateGPTGuidance() working with real API

**Testing:**
- Test with valid student data → verify JSON response
- Test with API error → verify fallback works
- Test guidance quality (review 5 samples manually)

---

#### Task 3.5: Implement Trauma-Based Modifiers
**Time:** 1-2 hours

**File:** `Tool4AllocationEngine.js` (update)

**Actions:**
1. Add trauma modifier calculations to AllocationEngine
2. Use Tool 1 winner to apply +/- modifiers (see spec Section 5.7)
3. Use Tool 2 top domain to apply modifiers
4. Use Tool 3 quotient to apply modifiers

**Code:**
```javascript
// Add to calculateAllocations()
const insights = Tool4GPT.getToolInsights(clientId);

// Tool 1 modifiers
if (insights.tool1.winner === 'Fear') {
  mods.Multiply -= 10;
  mods.Essentials += 10;
  mods.Freedom += 10;
  notes.Multiply.Trauma = 'Fear pattern reduces risk tolerance. ';
  // ... etc
}

// Tool 2 modifiers
if (insights.tool2.topDomain === 'Money Vigilance') {
  mods.Freedom += 10;
  notes.Freedom.Trauma = 'Money Vigilance suggests high savings priority. ';
}

// Tool 3 modifiers
if (insights.tool3.overallQuotient < -2.0) {
  mods.Essentials += 10;
  notes.Essentials.Trauma = 'Low self-view suggests grounding in basics first. ';
}
```

**Deliverable:** Trauma modifiers integrated, tested

**Testing:**
- Student with Fear winner → verify M reduced, E+F increased
- Student with high Tool 3 quotient → verify appropriate adjustments

---

### 4.2 Phase 3 Acceptance Criteria

- ✅ OpenAI API connection working
- ✅ getToolInsights() returns correct data from Tools 1-3
- ✅ generateGPTGuidance() returns personalized guidance
- ✅ Trauma modifiers apply correctly to allocations
- ✅ GPT fallback works when API fails
- ✅ Guidance is helpful and actionable (manual review)

---

## 5. Phase 4: User Interface & Interactivity

**Duration:** 10-12 hours
**Goal:** Build the complete single-page application UI

### 5.1 Tasks

#### Task 4.1: Create Base HTML Structure
**Time:** 2 hours

**File:** `Tool4Templates.js`

**Sub-tasks:**
1. **Header** (30 min)
   - Logo
   - Student welcome message
   - Tutorial button (modal)

2. **GPT Personalization Panel** (30 min)
   - Collapsible section
   - Display welcome message
   - "Apply Suggestions" button

3. **Two-Column Layout** (1 hour)
   - Left: Input controls
   - Right: Results & actions
   - Responsive grid

**Deliverable:** HTML skeleton with all sections

---

#### Task 4.2: Implement Input Controls
**Time:** 3 hours

**File:** `Tool4Templates.js`

**Sub-tasks:**
1. **Section 1: Priorities** (30 min)
   - 3 dropdowns for ranking priorities
   - Validation: can't select same priority twice

2. **Section 2: Financial Situation** (30 min)
   - 6 dropdowns (income range, essentials, debt, interest, emergency fund, stability)

3. **Section 3: Behavioral Patterns** (1 hour)
   - 12 range sliders with number inputs (synced)
   - Labels for each end of scale
   - Real-time value display

4. **Section 4: Goals & Context** (30 min)
   - Goal timeline dropdown
   - Dependents radio
   - Stage of life dropdown
   - Life events multi-select checkboxes

5. **Advanced Settings** (30 min)
   - Collapsible section
   - Optional income, investment balance, debt amount

**Deliverable:** All input controls functional

**Testing:**
- All inputs render correctly
- Sliders sync with number inputs
- Validation prevents invalid selections

---

#### Task 4.3: Implement Results Display
**Time:** 2 hours

**File:** `Tool4Templates.js`

**Sub-tasks:**
1. **Allocation Display** (1 hour)
   - 4 horizontal bars (M, E, F, J)
   - Percentage labels
   - Color-coded (see spec Section 7.4.1)
   - Alignment score (from GPT)

2. **Modifier Breakdown** (30 min)
   - Expandable section
   - Show base + modifiers for each bucket
   - Calculate final %

3. **Red Flags Panel** (30 min)
   - Warning icon + messages
   - Dynamic (show only relevant warnings)

**Deliverable:** Results display updates with data

**Testing:**
- Verify allocations display correctly
- Verify modifiers show correct calculations
- Verify red flags appear when conditions met

---

#### Task 4.4: Implement Real-Time Calculation
**Time:** 2 hours

**File:** `Tool4Templates.js` (JavaScript section)

**Logic:**
```javascript
// Debounced recalculation (300ms)
let recalcTimeout;
function recalc() {
  clearTimeout(recalcTimeout);
  recalcTimeout = setTimeout(() => {
    const inputs = gatherInputs();
    const results = calculateAllocations(inputs);
    updateDisplay(results);
  }, 300);
}

// Attach listeners to all inputs
document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('change', recalc);
  el.addEventListener('input', recalc);
});
```

**Deliverable:** Allocations update in real-time as user adjusts dials

**Testing:**
- Change priority → verify allocations update
- Move slider → verify allocations update smoothly (debounced)
- No lag or jank

---

#### Task 4.5: Implement Scenario Management UI
**Time:** 2 hours

**File:** `Tool4Templates.js`

**Sub-tasks:**
1. **Save Scenario** (30 min)
   - Input for scenario name
   - "Save" button
   - Calls google.script.run.saveScenario()
   - Success feedback

2. **Load Scenario** (30 min)
   - Dropdown populated with user's scenarios
   - "Load" button
   - Populates form with scenario data

3. **Scenario List** (1 hour)
   - Cards for each saved scenario
   - Shows: name, allocations, timestamp
   - Actions: Load, Set Optimal, PDF, Delete
   - Visual indicator for optimal (⭐)

**Deliverable:** Can save, load, list scenarios

**Testing:**
- Save scenario → verify appears in list
- Load scenario → verify form populates
- Set optimal → verify star appears
- Delete scenario → verify removed from list

---

#### Task 4.6: Implement Comparison UI
**Time:** 1 hour

**File:** `Tool4Templates.js`

**Sub-tasks:**
1. **Scenario Selectors** (30 min)
   - Two dropdowns for selecting scenarios to compare
   - "Compare" button (enabled only when 2 selected)

2. **Comparison View** (30 min)
   - Side-by-side display (modal or inline)
   - Show input differences
   - Show allocation differences
   - Show GPT comparison analysis
   - "Generate Comparison PDF" button

**Deliverable:** Can compare 2 scenarios visually

**Testing:**
- Select 2 scenarios → comparison appears
- GPT comparison loads
- PDF button works

---

### 5.2 Phase 4 Acceptance Criteria

- ✅ All input controls render and work
- ✅ Real-time allocation updates (debounced)
- ✅ Results display updates correctly
- ✅ Can save scenarios with name
- ✅ Can load scenarios (form populates)
- ✅ Can set optimal scenario (star badge)
- ✅ Can compare 2 scenarios (visual + GPT)
- ✅ Responsive design (desktop + tablet + mobile)
- ✅ Zero UI bugs or visual glitches

---

## 6. Phase 5: PDF Generation

**Duration:** 4-6 hours
**Goal:** Generate professional PDF reports

### 6.1 Tasks

#### Task 5.1: Implement Single Scenario PDF
**Time:** 2-3 hours

**File:** `PDFGenerator.js` (add method)

**Sub-tasks:**
1. **Create PDF Template** (1 hour)
   - Header with logo, student name, date
   - Allocation summary table
   - Financial situation section
   - Priorities & goals section
   - Behavioral profile section
   - Modifier breakdown
   - GPT personalization
   - Red flags & action steps

2. **Implement generateTool4PDF()** (1 hour)
   - Fetch scenario data
   - Build HTML using template
   - Convert to PDF via Google Docs API
   - Save to Drive
   - Return PDF URL

3. **Test & Refine** (1 hour)
   - Generate test PDFs
   - Check formatting
   - Verify all data appears
   - Fix styling issues

**Deliverable:** generateTool4PDF() creates clean, professional PDF

**Testing:**
- Generate PDF for 3 different scenarios
- Verify all sections render correctly
- Check PDF opens in Drive, looks professional

---

#### Task 5.2: Implement Comparison PDF
**Time:** 2-3 hours

**File:** `PDFGenerator.js` (add method)

**Sub-tasks:**
1. **Create Comparison Template** (1 hour)
   - Side-by-side table format
   - Allocation comparison chart
   - Input differences table
   - GPT comparison analysis
   - Recommendation section

2. **Implement generateTool4ComparisonPDF()** (1 hour)
   - Fetch both scenarios
   - Call GPT comparison
   - Build HTML
   - Convert to PDF

3. **Test & Refine** (1 hour)
   - Generate test comparison PDFs
   - Verify side-by-side layout works
   - Check GPT analysis appears

**Deliverable:** generateTool4ComparisonPDF() creates comparison PDF

**Testing:**
- Generate comparison PDF for 2 scenarios
- Verify differences highlighted
- Verify GPT analysis included

---

### 6.2 Phase 5 Acceptance Criteria

- ✅ Single scenario PDF generates successfully
- ✅ PDF includes all sections (allocation, inputs, GPT, red flags)
- ✅ PDF is professionally formatted, readable
- ✅ Comparison PDF generates successfully
- ✅ Comparison PDF shows differences clearly
- ✅ PDFs saved to correct Drive folder
- ✅ PDF URLs returned to client for download

---

## 7. Phase 6: Testing & Bug Fixes

**Duration:** 8-10 hours
**Goal:** Comprehensive testing, zero critical bugs

### 7.1 Tasks

#### Task 6.1: Unit Testing (Manual)
**Time:** 3 hours

**Test Coverage:**
- AllocationEngine calculations (10 test cases)
- Data storage (save, load, delete scenarios)
- GPT integration (guidance generation, fallback)
- PDF generation (single, comparison)

**Actions:**
1. Create test spreadsheet for each component
2. Run tests, document results
3. Fix bugs immediately
4. Re-test until 100% pass

**Deliverable:** All unit tests pass

---

#### Task 6.2: Integration Testing
**Time:** 2-3 hours

**Test Scenarios:**
1. **Happy Path** - New student completes Tools 1-3 → Tool 4 → Optimal set → Tool 5 unlocks
2. **No Prerequisites** - Student enters Tool 4 without Tools 1-3 → Error or graceful degradation
3. **10 Scenarios Limit** - Student creates 11 scenarios → Oldest deleted
4. **GPT Failure** - Mock API error → Fallback template used
5. **Edit Mode** - Student edits completed Tool 4 → Can update optimal or create new

**Deliverable:** All integration tests pass

---

#### Task 6.3: User Acceptance Testing (UAT)
**Time:** 2-3 hours

**Participants:** 5-10 beta testers (real students or stakeholders)

**Test Protocol:**
1. Provide test accounts with completed Tools 1-3
2. Ask users to complete Tool 4 (create 3 scenarios, compare, set optimal)
3. Observe for confusion, errors, usability issues
4. Collect feedback (survey)

**Metrics:**
- Time to complete (target: < 45 min)
- Scenarios created (target: 3-5)
- Comparison used (target: >60%)
- Satisfaction (target: ≥4.0/5)

**Deliverable:** UAT report with feedback, bug list

---

#### Task 6.4: Bug Fixes & Refinements
**Time:** 2-3 hours

**Actions:**
1. Prioritize bugs (critical, high, medium, low)
2. Fix critical bugs immediately
3. Fix high-priority bugs
4. Document medium/low bugs for future release

**Deliverable:** Zero critical bugs, all high-priority bugs fixed

---

#### Task 6.5: Performance Testing
**Time:** 1 hour

**Tests:**
- Initial page load time (target: < 3 sec)
- Allocation recalculation (target: < 100ms)
- GPT guidance generation (target: < 5 sec)
- Save scenario (target: < 2 sec)
- Load scenarios (target: < 2 sec)
- Generate PDF (target: < 10 sec)

**Actions:**
1. Use browser DevTools to measure times
2. Optimize slow operations
3. Re-test until targets met

**Deliverable:** All performance targets met

---

### 7.2 Phase 6 Acceptance Criteria

- ✅ All unit tests pass (100%)
- ✅ All integration tests pass (100%)
- ✅ UAT satisfaction ≥ 4.0/5
- ✅ Zero critical bugs
- ✅ All high-priority bugs fixed
- ✅ Performance targets met
- ✅ Browser compatibility tested (Chrome, Safari, Firefox, Edge)

---

## 8. Phase 7: Documentation & Launch

**Duration:** 2-4 hours
**Goal:** Finalize documentation, deploy to production

### 8.1 Tasks

#### Task 7.1: Code Documentation
**Time:** 1 hour

**Actions:**
1. Add JSDoc comments to all public functions
2. Document complex logic with inline comments
3. Add README.md to `/tools/tool4/` directory

**Example:**
```javascript
/**
 * Calculate budget allocations based on student profile and priorities
 * @param {Object} inputs - Student's input data
 * @param {string} inputs.priority1 - Top financial priority
 * @param {string} inputs.incomeRange - Income bracket (A-E)
 * @param {number} inputs.discipline - Discipline level (1-10)
 * // ... all params
 * @returns {Object} Allocation results {allocations, modifiers, warnings}
 */
AllocationEngine.calculateAllocations = function(inputs) {
  // ...
};
```

**Deliverable:** All code documented

---

#### Task 7.2: User Guide Creation
**Time:** 1-2 hours

**File:** `docs/Tool4/TOOL4-USER-GUIDE.md`

**Sections:**
1. Introduction (what is Tool 4?)
2. How to use Tool 4 (step-by-step)
3. Understanding your allocation (explain M, E, F, J)
4. Creating scenarios (best practices)
5. Comparing scenarios (how to decide)
6. Setting your optimal scenario
7. FAQ
8. Troubleshooting

**Deliverable:** TOOL4-USER-GUIDE.md complete

---

#### Task 7.3: Admin Documentation
**Time:** 30 minutes

**File:** `docs/Tool4/TOOL4-ADMIN-GUIDE.md`

**Sections:**
1. How to access TOOL4_SCENARIOS sheet
2. How to manually edit/delete scenarios
3. How to troubleshoot student issues
4. How to monitor GPT API usage
5. How to regenerate PDFs

**Deliverable:** TOOL4-ADMIN-GUIDE.md complete

---

#### Task 7.4: Production Deployment
**Time:** 30 minutes

**Actions:**
1. Merge development branch to main (if using Git)
2. Deploy to production Apps Script project (via clasp or manual)
3. Verify production URLs work
4. Test one end-to-end scenario in production
5. Monitor Apps Script logs for errors

**Deliverable:** Tool 4 live in production, zero errors

---

#### Task 7.5: Launch Communication
**Time:** 30 minutes

**Actions:**
1. Notify students via email: "Tool 4 now available!"
2. Update dashboard with Tool 4 card
3. Update system documentation
4. Monitor first 10 students for issues

**Deliverable:** Tool 4 launched, students notified

---

### 8.2 Phase 7 Acceptance Criteria

- ✅ Code fully documented
- ✅ User guide complete and clear
- ✅ Admin guide complete
- ✅ Tool 4 deployed to production
- ✅ No errors in production logs
- ✅ Students successfully using Tool 4
- ✅ Launch communication sent

---

## 9. Development Environment Setup

### 9.1 Prerequisites

**Required Tools:**
- Google account with access to Apps Script
- clasp CLI (for local development): `npm install -g @google/clasp`
- Text editor (VS Code recommended)
- Git (optional but recommended)
- OpenAI API account + API key

### 9.2 Setup Steps

**Step 1: Create Development Spreadsheet**
1. Duplicate production master spreadsheet
2. Rename to "FTP-v3 Development"
3. Create TOOL4_SCENARIOS sheet
4. Update CONFIG with dev spreadsheet ID

**Step 2: Clone Apps Script Project**
```bash
clasp login
clasp clone <SCRIPT_ID>
cd FTP-v3
```

**Step 3: Create Tool 4 Files**
```bash
mkdir tools/tool4
touch tools/tool4/Tool4.js
touch tools/tool4/Tool4AllocationEngine.js
touch tools/tool4/Tool4GPT.js
touch tools/tool4/Tool4Scenarios.js
touch tools/tool4/Tool4Report.js
touch tools/tool4/Tool4Templates.js
```

**Step 4: Set Up OpenAI API**
1. Create OpenAI account
2. Generate API key
3. Store in Script Properties:
   ```javascript
   PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', 'sk-...');
   ```

**Step 5: Configure clasp for Development**
```bash
clasp push  # Push local changes to Apps Script
clasp open  # Open in browser
```

### 9.3 Development Workflow

**Recommended Workflow:**
1. Edit files locally in VS Code
2. `clasp push` to deploy changes
3. Test in browser at Apps Script web app URL
4. Check logs with `clasp logs`
5. Repeat

**Alternative (Web-Based):**
1. Edit directly in Apps Script editor
2. Test immediately
3. Manually copy to local files for version control

---

## 10. Risk Management

### 10.1 Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **GPT API quota exceeded** | Medium | High | Implement caching, fallback templates, rate limiting |
| **Calculation bugs in AllocationEngine** | Medium | High | Extensive unit testing, manual validation |
| **TOOL4_SCENARIOS sheet performance** | Low | Medium | Use getRange() instead of getDataRange(), cache results |
| **Student data privacy** | Low | Critical | Never log PII, secure API keys, limit data access |
| **Browser compatibility issues** | Medium | Medium | Test on all major browsers, use standard APIs |
| **UI complexity confuses students** | Medium | Medium | UAT testing, simplify where possible, add tutorial |
| **PDF generation failures** | Low | Medium | Error handling, retry logic, manual fallback |
| **Scenario limit (10) too restrictive** | Low | Low | Monitor usage, consider increasing if needed |

### 10.2 Rollback Plan

**If Critical Bug Found in Production:**
1. Disable Tool 4 route in Router (comment out)
2. Show maintenance message to students
3. Fix bug in development
4. Test thoroughly
5. Re-deploy
6. Re-enable route

**If GPT API Issues:**
1. Enable template fallback permanently (config flag)
2. Monitor API status
3. Re-enable GPT when stable

---

## 11. Success Criteria & Acceptance

### 11.1 Technical Acceptance

**Tool 4 is ready for production when:**
- ✅ All 7 phases complete
- ✅ Zero critical bugs
- ✅ All acceptance criteria met
- ✅ Code review approved
- ✅ Performance targets met
- ✅ Security review passed (no PII leaks)

### 11.2 Business Acceptance

**Tool 4 is successful when:**
- ✅ 80%+ of students complete Tool 4
- ✅ Average time to complete < 45 minutes
- ✅ Student satisfaction ≥ 4.0/5
- ✅ 70%+ of students use comparison feature
- ✅ 90%+ of students set optimal scenario
- ✅ Tool 5 unlocks correctly for 100% of completers
- ✅ GPT guidance rated helpful (≥ 4.0/5)

### 11.3 Launch Checklist

**Before Launch:**
- [ ] All phases complete
- [ ] Code reviewed and approved
- [ ] UAT completed with positive feedback
- [ ] Documentation complete (code, user guide, admin guide)
- [ ] Production deployment tested
- [ ] Monitoring in place (logs, API usage)
- [ ] Rollback plan documented
- [ ] Support team trained on Tool 4

**Launch Day:**
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Monitor first 10 students
- [ ] Send launch email to students
- [ ] Update website/dashboard

**Post-Launch (Week 1):**
- [ ] Review logs daily
- [ ] Collect student feedback
- [ ] Fix any bugs reported
- [ ] Monitor GPT API usage
- [ ] Monitor performance metrics

---

## Appendix A: Task Tracking Template

Use this template to track progress during implementation:

| Task ID | Phase | Task Name | Assignee | Status | Hours | Completed Date |
|---------|-------|-----------|----------|--------|-------|----------------|
| 1.1 | 1 | Set Up File Structure | - | Not Started | 0.5 | - |
| 1.2 | 1 | Implement AllocationEngine | - | Not Started | 4-5 | - |
| 1.3 | 1 | Create CONFIG Entry | - | Not Started | 0.5 | - |
| 1.4 | 1 | Implement Manifest | - | Not Started | 1 | - |
| 1.5 | 1 | Test Allocations | - | Not Started | 2 | - |
| 2.1 | 2 | Create TOOL4_SCENARIOS Sheet | - | Not Started | 0.5 | - |
| ... | ... | ... | ... | ... | ... | ... |

---

## Appendix B: Quick Reference - Key Functions

### AllocationEngine
- `calculateAllocations(inputs)` → `{allocations, modifiers, warnings}`
- `calculateBaseWeights(p1, p2, p3)` → `{M, E, F, J}`
- `applyModifiers(inputs)` → `{M, E, F, J} adjustments`
- `checkRedFlags(allocations, inputs)` → `[warnings]`

### Tool4Scenarios
- `saveScenario(clientId, scenarioData)` → `{ok, scenarioId}`
- `getUserScenarios(clientId, limit)` → `[scenarios]`
- `setOptimalScenario(clientId, scenarioId)` → `{ok}`
- `deleteScenario(clientId, scenarioId)` → `{ok}`

### Tool4GPT
- `getToolInsights(clientId)` → `{tool1, tool2, tool3}`
- `generateGPTGuidance(clientId, scenario)` → `{guidance, score, suggestions}`
- `compareScenarios(clientId, s1, s2)` → `{comparison, recommendation}`
- `callOpenAI(messages, options)` → GPT response

### PDFGenerator
- `generateTool4PDF(clientId, scenarioId)` → `{pdfUrl, fileName}`
- `generateTool4ComparisonPDF(clientId, id1, id2)` → `{pdfUrl, fileName}`

---

## Appendix C: Development Timeline (Sample)

**Assuming 1 developer, 8 hours/day:**

| Week | Days | Tasks | Milestones |
|------|------|-------|------------|
| **Week 1** | Mon-Tue | Phase 1: Foundation | M1: Core Calculator Working |
|  | Wed-Thu | Phase 2: Data Storage | M2: Scenario Save/Load Working |
|  | Fri | Phase 3 Start: GPT Setup | API connection tested |
| **Week 2** | Mon-Tue | Phase 3: GPT Integration | M3: GPT Guidance Working |
|  | Wed-Fri | Phase 4: UI Development | M4: Full UI Functional |
| **Week 3** | Mon | Phase 5: PDF Generation | M5: PDFs Working |
|  | Tue-Thu | Phase 6: Testing | M6: Testing Complete |
|  | Fri | Phase 7: Launch | M7: Production Live |

**Total:** ~3 weeks (120 hours) if working full-time
**Total:** ~6-8 weeks if working part-time (20 hours/week)

---

## End of Implementation Plan

**Document Status:** DRAFT v1.0
**Prerequisites:** TOOL4-SPECIFICATION.md (approved)
**Next Steps:**
1. Review and approve this plan
2. Assign developer(s)
3. Set target launch date
4. Begin Phase 1

**Questions or feedback? Please review and approve before starting implementation.**
