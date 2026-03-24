# Calculator Tools Draft Persistence Plan

## Tools Covered
- **Tool 4:** Financial Freedom Framework (Budget Allocation Calculator)
- **Tool 6:** Retirement Blueprint Calculator
- **Tool 8:** Investment Planning Tool

---

## 1. Current State Analysis

### 1.1 Comparison Matrix

| Aspect | Tool 4 | Tool 6 | Tool 8 |
|--------|--------|--------|--------|
| **Has pre-survey/questionnaire** | Yes | Yes (+ backup questions) | No |
| **Draft in RESPONSES sheet** | No | No | N/A (uses Scenarios sheet) |
| **PropertiesService storage** | Yes (pre-survey only) | Yes (pre-survey + backup) | No |
| **Scenario save/load** | No | No | Yes (up to 10) |
| **Dashboard visibility** | No "in progress" shown | No "in progress" shown | N/A (standalone) |
| **Can resume from dashboard** | No | No | N/A |

### 1.2 Current Data Flow

**Tool 4:**
```
Pre-survey form → PropertiesService → Calculator renders
                     ↓
              Lost on session clear
```

**Tool 6:**
```
Pre-survey + Backup questions → PropertiesService → Calculator renders
                                      ↓
                               Lost on session clear
```

**Tool 8:**
```
Calculator inputs → "Save Scenario" button → Scenarios spreadsheet
                                                    ↓
                                            Persisted forever
```

### 1.3 Key Gaps

| Gap | Impact | Affected Tools |
|-----|--------|----------------|
| No RESPONSES sheet tracking | Dashboard can't show "in progress" | 4, 6 |
| Pre-survey data only in PropertiesService | Data lost if session clears | 4, 6 |
| No scenario history | Can't compare past configurations | 4, 6 |
| Inconsistent persistence model | Tool8 has scenarios, others don't | 4, 6 |

---

## 2. Design Options

### Option A: Minimal Dashboard Visibility (Recommended for Phase 1)

**Goal:** Let dashboard show "in progress" for calculator tools without major refactoring.

**Implementation:**
- When pre-survey is saved, create/update a DRAFT row in RESPONSES
- When calculator is submitted/completed, convert to COMPLETED
- No scenario save/load functionality

**Pros:**
- Minimal code changes
- Consistent with multi-page tools' draft model
- Dashboard can show tool status

**Cons:**
- No scenario comparison
- No history of past calculations

**Effort:** Low (1-2 days per tool)

---

### Option B: Full Scenario System (Like Tool 8)

**Goal:** Give Tool4/Tool6 the same scenario save/load/compare as Tool8.

**Implementation:**
- Each tool gets its own Scenarios sheet (or shared sheet with Tool_ID column)
- Add scenario management UI (save name, load dropdown, compare)
- Keep PDF generation for scenarios

**Pros:**
- Powerful user feature
- Consistent across all calculator tools
- Users can track progress over time

**Cons:**
- Significant UI changes
- More code to maintain
- May be overkill for Tool4/Tool6 use cases

**Effort:** High (3-5 days per tool)

---

### Option C: Hybrid Approach (Recommended)

**Goal:** Dashboard visibility + optional scenario save for power users.

**Implementation:**
- **Baseline:** Auto-save current state to RESPONSES (DRAFT/COMPLETED)
- **Optional:** "Save as Scenario" button for users who want history
- Tool8 keeps its existing scenario system unchanged

**Pros:**
- Dashboard visibility (baseline)
- Power users get scenarios (optional)
- Tool8 unchanged
- Incremental implementation possible

**Cons:**
- Two storage mechanisms (RESPONSES + Scenarios)
- Slightly more complex

**Effort:** Medium (2-3 days per tool)

---

## 3. Recommended Approach: Hybrid (Option C)

### 3.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RESPONSES Sheet                          │
│  (Source of truth for dashboard status)                     │
│                                                             │
│  Tool4 DRAFT/COMPLETED rows (auto-saved)                    │
│  Tool6 DRAFT/COMPLETED rows (auto-saved)                    │
│  Tool8: Not used (has own Scenarios sheet)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Scenarios Sheet(s)                       │
│  (Optional: named scenarios for comparison)                 │
│                                                             │
│  Tool8: Existing Scenarios sheet (keep as-is)               │
│  Tool4/6: Future enhancement (Phase 2)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PropertiesService                        │
│  (Fast temporary storage for session)                       │
│                                                             │
│  Tool4: Pre-survey data (page-to-page)                      │
│  Tool6: Pre-survey + backup data (page-to-page)             │
│  Tool8: Not used                                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Phase 1: Dashboard Visibility (Minimal)

#### Tool 4 Changes

**When to save DRAFT:**
- After pre-survey is submitted (before priority selection)
- After priority is selected (before final calculation)

**When to save COMPLETED:**
- After final allocation is calculated and user views results

**Data structure:**
```javascript
{
  status: 'DRAFT' | 'COMPLETED',
  data: {
    // Pre-survey fields
    monthlyIncome: 5000,
    monthlyEssentials: 3000,
    satisfaction: 7,
    discipline: 6,
    // ... other pre-survey fields

    // Calculator state (if priority selected)
    selectedPriority: 'emergency_fund',
    goalTimeline: 12,

    // Results (if calculated)
    allocation: { M: 50, E: 30, F: 15, J: 5 }
  }
}
```

**Code changes:**
1. `savePreSurvey()` → Also call `DataService.saveDraft(clientId, 'tool4', data)`
2. `savePrioritySelection()` → Call `DataService.updateDraft(clientId, 'tool4', data)`
3. After calculation → Call `DataService.saveResponse(clientId, 'tool4', data)` with COMPLETED

---

#### Tool 6 Changes

**When to save DRAFT:**
- After pre-survey/backup questions submitted
- After profile classification is determined

**When to save COMPLETED:**
- After vehicle allocation is calculated and user views results

**Data structure:**
```javascript
{
  status: 'DRAFT' | 'COMPLETED',
  data: {
    // Pre-survey fields
    age: 35,
    grossIncome: 75000,
    retirementAge: 65,
    // ... other pre-survey fields

    // Backup question answers (if provided)
    backup_monthlyIncome: 6000,
    backup_riskTolerance: 6,

    // Profile classification
    profile: 'Growth_Maximizer',
    profileScore: 78,

    // Vehicle allocation results
    allocation: {
      traditional401k: 19500,
      rothIRA: 6000,
      // ...
    }
  }
}
```

**Code changes:**
1. `savePreSurvey()` → Also call `DataService.saveDraft(clientId, 'tool6', data)`
2. After profile classification → Call `DataService.updateDraft(clientId, 'tool6', data)`
3. After calculation → Call `DataService.saveResponse(clientId, 'tool6', data)` with COMPLETED

---

#### Tool 8 Changes

**No changes for Phase 1.**

Tool 8 already has robust scenario persistence. Its scenarios are user-initiated saves (explicit action), not auto-drafts.

For dashboard integration (if needed later):
- Could add a RESPONSES row when user first loads Tool8
- Update to COMPLETED when they save their first scenario
- But this is optional - Tool8 works fine standalone

---

### 3.3 Phase 2: Scenario System (Future Enhancement)

**Defer to future:** Add scenario save/load/compare to Tool4 and Tool6.

This would involve:
1. Creating a shared Scenarios sheet (or per-tool sheets)
2. Adding scenario management UI (similar to Tool8)
3. PDF comparison reports

**Not needed for MVP** - the baseline draft tracking gives dashboard visibility.

---

## 4. Implementation Details

### 4.1 Tool 4 Implementation

#### Step 1: Modify savePreSurvey()

**Current code (Tool4.js ~line 114):**
```javascript
savePreSurvey(clientId, preSurveyData) {
  const preSurveyKey = `tool4_presurvey_${clientId}`;
  PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));
  // ... rest of function
}
```

**New code:**
```javascript
savePreSurvey(clientId, preSurveyData) {
  // Save to PropertiesService (fast, for session)
  const preSurveyKey = `tool4_presurvey_${clientId}`;
  PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));

  // Also save to RESPONSES sheet (for dashboard visibility)
  const draftData = {
    preSurvey: preSurveyData,
    stage: 'pre_survey_complete',
    lastUpdate: new Date().toISOString()
  };

  // Check if draft already exists
  const existingDraft = DataService.getActiveDraft(clientId, 'tool4');
  if (existingDraft) {
    DataService.updateDraft(clientId, 'tool4', draftData);
  } else {
    DataService.saveDraft(clientId, 'tool4', draftData);
  }

  // ... rest of function
}
```

#### Step 2: Add savePrioritySelection()

```javascript
savePrioritySelection(clientId, priority, timeline) {
  // Get existing pre-survey data
  const preSurveyData = this.getPreSurvey(clientId);

  // Merge with priority selection
  const updatedData = {
    ...preSurveyData,
    selectedPriority: priority,
    goalTimeline: timeline
  };

  // Save to PropertiesService
  const preSurveyKey = `tool4_presurvey_${clientId}`;
  PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(updatedData));

  // Update RESPONSES draft
  const draftData = {
    preSurvey: updatedData,
    stage: 'priority_selected',
    lastUpdate: new Date().toISOString()
  };
  DataService.updateDraft(clientId, 'tool4', draftData);

  return { success: true };
}
```

#### Step 3: Mark COMPLETED after calculation

When the allocation is calculated and displayed:

```javascript
completeCalculation(clientId, allocation) {
  const preSurveyData = this.getPreSurvey(clientId);

  const completedData = {
    preSurvey: preSurveyData,
    allocation: allocation,
    completedAt: new Date().toISOString()
  };

  // Save as COMPLETED (this will handle draft cleanup)
  DataService.saveResponse(clientId, 'tool4', completedData);

  // Clear PropertiesService
  const preSurveyKey = `tool4_presurvey_${clientId}`;
  PropertiesService.getUserProperties().deleteProperty(preSurveyKey);

  return { success: true };
}
```

---

### 4.2 Tool 6 Implementation

Similar pattern to Tool4, but with additional backup question handling.

#### Step 1: Modify savePreSurvey()

```javascript
savePreSurvey(clientId, preSurveyData) {
  // Save to PropertiesService
  const preSurveyKey = `tool6_presurvey_${clientId}`;
  PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));

  // Save to RESPONSES sheet
  const draftData = {
    preSurvey: preSurveyData,
    stage: 'pre_survey_complete',
    hasBackupData: !!(preSurveyData.backup_monthlyIncome || preSurveyData.backup_age),
    lastUpdate: new Date().toISOString()
  };

  const existingDraft = DataService.getActiveDraft(clientId, 'tool6');
  if (existingDraft) {
    DataService.updateDraft(clientId, 'tool6', draftData);
  } else {
    DataService.saveDraft(clientId, 'tool6', draftData);
  }

  // ... rest of function
}
```

#### Step 2: Update after profile classification

```javascript
saveProfileClassification(clientId, profile, profileScore) {
  const preSurveyData = this.getPreSurvey(clientId);

  const draftData = {
    preSurvey: preSurveyData,
    profile: profile,
    profileScore: profileScore,
    stage: 'profile_classified',
    lastUpdate: new Date().toISOString()
  };

  DataService.updateDraft(clientId, 'tool6', draftData);
}
```

#### Step 3: Mark COMPLETED after allocation

```javascript
completeCalculation(clientId, profile, allocation) {
  const preSurveyData = this.getPreSurvey(clientId);

  const completedData = {
    preSurvey: preSurveyData,
    profile: profile,
    allocation: allocation,
    completedAt: new Date().toISOString()
  };

  DataService.saveResponse(clientId, 'tool6', completedData);

  // Clear PropertiesService
  const preSurveyKey = `tool6_presurvey_${clientId}`;
  PropertiesService.getUserProperties().deleteProperty(preSurveyKey);
}
```

---

### 4.3 Tool 8 Implementation

**Phase 1: No changes needed.**

Tool 8's scenario system is already more sophisticated than what we're adding to Tool4/Tool6. It has:
- Named scenarios (user-chosen names)
- Up to 10 scenarios per user
- Load/compare functionality
- PDF generation for comparisons

**Optional future enhancement:** Add a RESPONSES row for dashboard visibility:
- Create DRAFT when user first loads Tool8
- Update to COMPLETED when user saves their first scenario
- This would let dashboard show "Tool 8: In Progress" or "Tool 8: Complete"

---

## 5. Dashboard Integration

### 5.1 Current Dashboard Behavior

The dashboard queries RESPONSES sheet to determine tool status:
- **Not started:** No DRAFT or COMPLETED row exists
- **In progress:** DRAFT row exists
- **Completed:** COMPLETED row exists (Is_Latest = true)

### 5.2 Expected Behavior After Implementation

| Tool | User Action | RESPONSES Status | Dashboard Shows |
|------|-------------|------------------|-----------------|
| Tool 4 | Opens tool | (nothing yet) | "Start" |
| Tool 4 | Submits pre-survey | DRAFT | "Resume" |
| Tool 4 | Views final allocation | COMPLETED | "View Report" / "Edit" |
| Tool 6 | Opens tool | (nothing yet) | "Start" |
| Tool 6 | Submits pre-survey | DRAFT | "Resume" |
| Tool 6 | Views final allocation | COMPLETED | "View Report" / "Edit" |
| Tool 8 | Opens tool | (no change) | Depends on integration level |

---

## 6. Data Cleanup Considerations

### 6.1 When to Clear PropertiesService

| Event | Action |
|-------|--------|
| Tool marked COMPLETED | Clear PropertiesService draft |
| User clicks "Start Fresh" | Clear PropertiesService draft |
| Edit mode canceled | Clear PropertiesService draft |

### 6.2 When to Delete DRAFT Row

| Event | Action |
|-------|--------|
| Tool marked COMPLETED | DRAFT row deleted (or converted) |
| User clicks "Start Fresh" | DRAFT row deleted |
| Edit mode: Cancel | EDIT_DRAFT deleted, restore previous COMPLETED |

---

## 7. Implementation Timeline

### Phase 1: Dashboard Visibility (Recommended First)

| Task | Tool | Effort | Priority |
|------|------|--------|----------|
| Add DRAFT tracking to savePreSurvey | Tool 4 | 0.5 day | High |
| Add DRAFT tracking to priority selection | Tool 4 | 0.5 day | High |
| Add COMPLETED save after calculation | Tool 4 | 0.5 day | High |
| Add DRAFT tracking to savePreSurvey | Tool 6 | 0.5 day | High |
| Add DRAFT tracking to profile classification | Tool 6 | 0.5 day | High |
| Add COMPLETED save after calculation | Tool 6 | 0.5 day | High |
| Testing and edge cases | Both | 1 day | High |
| **Total Phase 1** | | **4 days** | |

### Phase 2: Scenario System (Future/Optional)

| Task | Tool | Effort | Priority |
|------|------|--------|----------|
| Design shared Scenarios sheet schema | All | 0.5 day | Low |
| Add scenario save UI | Tool 4 | 1 day | Low |
| Add scenario load/compare UI | Tool 4 | 1.5 days | Low |
| Add scenario save UI | Tool 6 | 1 day | Low |
| Add scenario load/compare UI | Tool 6 | 1.5 days | Low |
| PDF comparison reports | Both | 2 days | Low |
| **Total Phase 2** | | **7.5 days** | |

---

## 8. Open Questions

1. **Tool 8 dashboard integration:** Should Tool 8 also write to RESPONSES for dashboard visibility, or remain standalone?

2. **Scenario naming:** If we add scenarios to Tool4/Tool6, should scenario names be auto-generated or user-provided?

3. **Scenario limits:** Tool 8 keeps 10 scenarios. Should Tool4/Tool6 have the same limit?

4. **Cross-tool scenarios:** Should scenarios from Tool4 feed into Tool6 automatically? (e.g., budget allocation informs retirement planning)

---

## 9. Recommendation Summary

| Tool | Phase 1 (Now) | Phase 2 (Future) |
|------|---------------|------------------|
| **Tool 4** | Add DRAFT/COMPLETED to RESPONSES | Add scenario save/load/compare |
| **Tool 6** | Add DRAFT/COMPLETED to RESPONSES | Add scenario save/load/compare |
| **Tool 8** | No changes (already has scenarios) | Optional: RESPONSES integration for dashboard |

**Start with Phase 1** - it's the minimal change that provides dashboard visibility. Phase 2 can be evaluated after Tool 8 integration is complete.
