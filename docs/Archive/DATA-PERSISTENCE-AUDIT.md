# Data Persistence Audit - Complete System Analysis
**Date:** January 19, 2025
**Auditor:** Claude Code
**Trigger:** Critical data loss bug in Tool 2 (student 7343 RW)

## Executive Summary

### Critical Bugs Found
1. **🔴 CRITICAL - Tool 1**: DRAFT rows never updated (same bug as Tool 2)
2. **🔴 CRITICAL - Tool 1**: PropertiesService not cleaned up after submission (memory leak)
3. **🟡 MEDIUM - Tool 3/5**: DRAFT rows never updated (but getExistingData merges correctly)
4. **🟢 FIXED - Tool 2**: All three issues now fixed

### Data Loss Risk Assessment
- **Tool 1**: 🔴 HIGH RISK - Same data loss vulnerability as Tool 2
- **Tool 2**: 🟢 FIXED - All issues resolved
- **Tool 3/5**: 🟡 LOW RISK - Merge logic prevents loss, but DRAFT rows incomplete
- **Tool 4-8**: ⚪ NOT IMPLEMENTED YET

---

## Storage Architecture

### Two-Tier Storage System
1. **PropertiesService (UserProperties)** - Fast, session-scoped cache
   - Key format: `{toolId}_draft_{clientId}`
   - Purpose: Page-to-page navigation, complete merged data
   - Scope: Per-user (temporary)
   - Lifecycle: Created on page 1, updated on each page, should be deleted after submission

2. **RESPONSES Sheet** - Persistent database
   - Columns: Timestamp, Client_ID, Tool_ID, Data (JSON), Version, Status, Is_Latest
   - Status values: DRAFT, EDIT_DRAFT, COMPLETED
   - Purpose: Dashboard detection, edit mode, permanent storage
   - Lifecycle: DRAFT created on page 1, should be updated on each page, marked not latest on completion

---

## Tool-by-Tool Analysis

### Tool 1: Core Trauma Strategy Assessment (5 pages)

#### savePageData() - [Tool1.js:442-453](tools/tool1/Tool1.js#L442-L453)
```javascript
savePageData(clientId, page, formData) {
  // Save to PropertiesService ✓
  DraftService.saveDraft('tool1', clientId, page, formData);

  // RESPONSES sheet - ONLY PAGE 1 ❌
  if (page === 1) {
    DataService.saveDraft(clientId, 'tool1', formData);
  }

  return { success: true };
}
```

**🔴 BUG 1: DRAFT rows only have page 1 data**
- Pages 2-5 data never written to RESPONSES sheet
- DRAFT row remains incomplete
- Dashboard shows stale data

#### getExistingData() - [Tool1.js:459-493](tools/tool1/Tool1.js#L459-L493)
```javascript
getExistingData(clientId) {
  let data = null;

  // Check RESPONSES for EDIT_DRAFT or DRAFT ✓
  const activeDraft = DataService.getActiveDraft(clientId, 'tool1');
  if (activeDraft) {
    data = activeDraft.data;
  }

  // CRITICAL: Merge with PropertiesService ✓
  const propData = DraftService.getDraft('tool1', clientId);
  if (propData) {
    data = data ? {...data, ...propData} : propData;
  }

  return data;
}
```

**✓ GOOD: Merge logic prevents data loss**
- Even though DRAFT row is incomplete, PropertiesService data is merged
- Submission gets complete data

#### processFinalSubmission() - [Tool1.js:500-574](tools/tool1/Tool1.js#L500-L574)
```javascript
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);
  // ... process data ...
  DataService.saveToolResponse(clientId, 'tool1', dataPackage, 'COMPLETED');

  // NO CLEANUP ❌
  // PropertiesService draft remains in memory
}
```

**🔴 BUG 2: PropertiesService not cleaned up**
- Draft data remains after submission
- Memory leak (accumulates over time)
- Could cause confusion if user retakes assessment

---

### Tool 2: Financial Clarity & Values Assessment (5 pages)

#### Current State (AFTER FIX)

#### savePageData() - [Tool2.js:1577-1613](tools/tool2/Tool2.js#L1577-L1613)
```javascript
savePageData(clientId, page, formData) {
  // Save to PropertiesService ✓
  DraftService.saveDraft('tool2', clientId, page, formData, ['client', 'page']);

  // Get complete merged data ✓
  const draftData = DraftService.getDraft('tool2', clientId);

  // Check edit mode ✓
  const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
  const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

  if (!isEditMode) {
    if (page === 1) {
      DataService.saveDraft(clientId, 'tool2', draftData);  // ✓ Create with complete data
    } else {
      DataService.updateDraft(clientId, 'tool2', draftData); // ✓ Update with complete data
    }
  }
}
```

**✓ FIXED: DRAFT rows now updated with complete data**

#### getExistingData() - [Tool2.js:1619-1647](tools/tool2/Tool2.js#L1619-L1647)
```javascript
getExistingData(clientId) {
  // FIRST: Check PropertiesService (source of truth) ✓
  const propertiesData = DraftService.getDraft('tool2', clientId);
  if (propertiesData) {
    return propertiesData;
  }

  // FALLBACK: Check RESPONSES sheet ✓
  const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
  if (activeDraft) {
    return activeDraft.data;
  }

  return null;
}
```

**✓ FIXED: PropertiesService checked first**

#### processFinalSubmission() - [Tool2.js:1652-1758](tools/tool2/Tool2.js#L1652-L1758)
```javascript
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);
  // ... process data ...
  DataService.saveToolResponse(clientId, 'tool2', {...});

  // CLEANUP ✓
  PropertiesService.getUserProperties().deleteProperty(`tool2_draft_${clientId}`);
  PropertiesService.getUserProperties().deleteProperty(`tool2_gpt_${clientId}`);
}
```

**✓ GOOD: PropertiesService cleaned up**

---

### Tool 3: Identity & Validation Grounding (2 pages)

#### savePageData() - [Tool3.js:572-591](tools/tool3/Tool3.js#L572-L591)
```javascript
savePageData(clientId, page, formData) {
  // Save to PropertiesService ✓
  DraftService.saveDraft('tool3', clientId, page, formData);

  // RESPONSES sheet - ONLY PAGE 1 ❌
  if (page === 1) {
    const activeDraft = DataService.getActiveDraft(clientId, 'tool3');
    const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

    if (!isEditMode) {
      DataService.saveDraft(clientId, 'tool3', formData); // ❌ Only page 1 data
    }
  }
}
```

**🟡 ISSUE: DRAFT rows only have page 1 data**
- Page 2 data never written to RESPONSES
- Dashboard shows incomplete DRAFT

#### getExistingData() - [Tool3.js:597-629](tools/tool3/Tool3.js#L597-L629)
```javascript
getExistingData(clientId) {
  let data = null;

  // Check RESPONSES ✓
  const activeDraft = DataService.getActiveDraft(clientId, 'tool3');
  if (activeDraft) {
    data = activeDraft.data;
  }

  // Merge with PropertiesService ✓
  const propData = DraftService.getDraft('tool3', clientId);
  if (propData) {
    data = data ? {...data, ...propData} : propData;
  }

  return data || {};
}
```

**✓ GOOD: Merge logic prevents data loss**

#### processFinalSubmission() - [Tool3.js:636+](tools/tool3/Tool3.js#L636)
```javascript
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);
  // ... process data ...
  DataService.saveToolResponse(clientId, 'tool3', responseData, 'COMPLETED');

  // CLEANUP ✓
  DraftService.clearDraft(this.config.id, clientId);
}
```

**✓ GOOD: PropertiesService cleaned up**

---

### Tool 5: Relationships & Receiving Grounding (2 pages)

**IDENTICAL PATTERN TO TOOL 3**
- Same savePageData issue (DRAFT row only has page 1)
- Same getExistingData merge logic (prevents data loss)
- Same cleanup (PropertiesService cleared)

---

## Critical Vulnerabilities Summary

### 🔴 CRITICAL: Tool 1 Data Loss Risk

**Scenario that causes data loss:**
1. User completes Tool 1 pages 1-5
2. PropertiesService has complete data from all pages ✓
3. RESPONSES DRAFT has only page 1 data ❌
4. User submits
5. `getExistingData()` checks RESPONSES first, finds DRAFT
6. **If DRAFT is returned instead of merged data, pages 2-5 are lost**

**Wait, does this actually happen?**
Let me re-check Tool1.getExistingData():

```javascript
const activeDraft = DataService.getActiveDraft(clientId, 'tool1');
if (activeDraft) {
  data = activeDraft.data;  // Gets incomplete DRAFT data
}

const propData = DraftService.getDraft('tool1', clientId);
if (propData) {
  data = data ? {...data, ...propData} : propData;  // MERGES! ✓
}
```

**SAFE**: The merge saves it! Even though DRAFT is incomplete, it gets merged with PropertiesService.

**However, there's still a problem:**
If PropertiesService cleanup happens BEFORE final submission (race condition), data could be lost.

---

## Bugs Requiring Immediate Fix

### 1. Tool 1 - DRAFT Row Updates (Medium Priority)
**Issue**: DRAFT rows only contain page 1 data
**Impact**: Dashboard shows stale data, confusion for users
**Risk**: Medium (merge logic prevents actual data loss)
**Fix**: Apply same pattern as Tool 2

### 2. Tool 1 - PropertiesService Cleanup (High Priority)
**Issue**: PropertiesService not deleted after submission
**Impact**: Memory leak, possible data conflicts on retake
**Risk**: High (accumulation over time)
**Fix**: Add cleanup like Tool 2/3/5

### 3. Tool 3 - DRAFT Row Updates (Low Priority)
**Issue**: DRAFT rows only contain page 1 data
**Impact**: Dashboard shows incomplete DRAFT
**Risk**: Low (only 2 pages, merge logic works)
**Fix**: Apply same pattern as Tool 2 (use updateDraft on page 2)

### 4. Tool 5 - DRAFT Row Updates (Low Priority)
**Issue**: Same as Tool 3
**Impact**: Same as Tool 3
**Risk**: Low
**Fix**: Same as Tool 3

---

## Recommended Fixes

### Fix 1: Tool 1 - Add DRAFT Updates

```javascript
savePageData(clientId, page, formData) {
  // Save to PropertiesService
  DraftService.saveDraft('tool1', clientId, page, formData);

  // Get complete merged data
  const draftData = DraftService.getDraft('tool1', clientId);

  // Check edit mode
  const activeDraft = DataService.getActiveDraft(clientId, 'tool1');
  const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

  if (!isEditMode) {
    if (page === 1) {
      DataService.saveDraft(clientId, 'tool1', draftData);
    } else {
      DataService.updateDraft(clientId, 'tool1', draftData);  // NEW
    }
  }

  return { success: true };
}
```

### Fix 2: Tool 1 - Add PropertiesService Cleanup

```javascript
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);
  // ... existing processing ...

  // CLEANUP (ADD THIS)
  DraftService.clearDraft('tool1', clientId);

  return { redirectUrl: reportUrl };
}
```

### Fix 3: Tool 3 - Add DRAFT Update on Page 2

```javascript
savePageData(clientId, page, formData) {
  DraftService.saveDraft('tool3', clientId, page, formData);

  // Get complete data
  const draftData = DraftService.getDraft('tool3', clientId);

  const activeDraft = DataService.getActiveDraft(clientId, 'tool3');
  const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

  if (!isEditMode) {
    if (page === 1) {
      DataService.saveDraft(clientId, 'tool3', draftData);
    } else {
      DataService.updateDraft(clientId, 'tool3', draftData);  // NEW
    }
  }

  return { success: true };
}
```

### Fix 4: Tool 5 - Same as Tool 3

---

## Testing Checklist

After applying fixes, test each tool:

- [ ] **Tool 1**: Multi-page draft persistence
  - [ ] Start assessment, fill page 1, check DRAFT row has page 1 data
  - [ ] Fill page 2, check DRAFT row has pages 1-2 data
  - [ ] Fill pages 3-5, check DRAFT row has complete data
  - [ ] Submit, verify COMPLETED has all data
  - [ ] Check PropertiesService is cleared
  - [ ] Verify no data loss in scores/rankings

- [ ] **Tool 2**: Same tests (should already pass)

- [ ] **Tool 3**: Two-page draft persistence
  - [ ] Start assessment, fill page 1, check DRAFT
  - [ ] Fill page 2, check DRAFT has complete data
  - [ ] Submit, verify COMPLETED
  - [ ] Check PropertiesService cleared

- [ ] **Tool 5**: Same as Tool 3

- [ ] **Edit Mode** for all tools:
  - [ ] Complete assessment
  - [ ] Click "Edit Answers"
  - [ ] Verify EDIT_DRAFT created
  - [ ] Make changes on multiple pages
  - [ ] Submit, verify changes saved
  - [ ] Verify EDIT_DRAFT marked not latest
  - [ ] Verify PropertiesService cleared

---

## Architectural Recommendations

### Standardize savePageData Pattern

All tools should use this pattern:

```javascript
savePageData(clientId, page, formData) {
  // 1. Save to PropertiesService (merges with existing data)
  DraftService.saveDraft(toolId, clientId, page, formData, ['client', 'page']);

  // 2. Get complete merged data
  const draftData = DraftService.getDraft(toolId, clientId);

  // 3. Check edit mode
  const activeDraft = DataService.getActiveDraft(clientId, toolId);
  const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

  // 4. Update RESPONSES sheet with complete data
  if (!isEditMode) {
    if (page === 1) {
      DataService.saveDraft(clientId, toolId, draftData);
    } else {
      DataService.updateDraft(clientId, toolId, draftData);
    }
  }

  return { success: true };
}
```

### Standardize getExistingData Pattern

Priority order should be:

1. **PropertiesService FIRST** (most up-to-date, complete data)
2. **RESPONSES sheet FALLBACK** (for initial edit mode loads)

```javascript
getExistingData(clientId) {
  // PropertiesService is source of truth
  const propertiesData = DraftService.getDraft(toolId, clientId);
  if (propertiesData) {
    return propertiesData;
  }

  // Fallback to RESPONSES for edit mode initial load
  const activeDraft = DataService.getActiveDraft(clientId, toolId);
  if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
    return activeDraft.data;
  }

  return null;
}
```

### Standardize Cleanup Pattern

All tools should clean up PropertiesService after submission:

```javascript
processFinalSubmission(clientId) {
  // ... processing ...

  // Cleanup
  DraftService.clearDraft(toolId, clientId);

  return { redirectUrl };
}
```

---

## Impact Assessment

### Students Affected
- **Tool 1**: Unknown (need to audit COMPLETED responses)
- **Tool 2**: Confirmed affected (7343 RW and potentially others)
- **Tool 3**: Likely unaffected (merge logic + only 2 pages)
- **Tool 5**: Likely unaffected (merge logic + only 2 pages)

### Data Recovery
- **Tool 2 affected students**: ❌ Data unrecoverable
- **Tool 1 potential victims**: Need to run diagnostic script

---

## Next Steps

1. **Immediate**: Fix Tool 1 (highest risk)
2. **High Priority**: Audit Tool 1 COMPLETED responses for data loss
3. **Medium Priority**: Fix Tool 3/5 DRAFT updates
4. **Low Priority**: Create diagnostic script for all tools
5. **Documentation**: Update TOOL-DEVELOPMENT-GUIDE with standardized patterns

---

## Audit Conclusion

The data persistence system has **critical inconsistencies** across tools. Tool 2's bug was caught because it was the most broken (no merge logic + incomplete DRAFT rows + wrong retrieval priority).

Tool 1 has the **same savePageData bug** but is saved by merge logic. However, the missing PropertiesService cleanup is a **memory leak** that needs fixing.

All fixes should follow the **standardized patterns** documented in this audit.
