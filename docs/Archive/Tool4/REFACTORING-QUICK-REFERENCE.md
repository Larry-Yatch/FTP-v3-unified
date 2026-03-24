# Tool4 Refactoring Quick Reference

**Created:** 2025-11-29
**For:** Quick lookup during implementation

---

## 🎯 What We're Doing

**Goal:** Reduce Tool4.js from 4,807 lines → 950 lines by using existing FTP-v3 infrastructure

**Strategy:** Replace custom code with proven patterns from Tools 1, 2, 3, and 5

---

## 📋 Priority Order (Start Here)

### ✅ Phase 1: Quick Wins (6-8 hours)
**Impact:** Remove ~500 lines | **Risk:** Very Low

1. Replace custom loading with `<?!= include('shared/loading-animation') ?>`
2. Replace custom form handlers with `FormUtils.getFormSubmissionScript()`
3. Implement `savePageData()` to match Code.js interface
4. Remove duplicate `returnToDashboard()` function

### ✅ Phase 2: Module Extraction (8-10 hours)
**Impact:** Remove ~1,000 lines | **Risk:** Low

1. Move priority logic to `Tool4ProgressiveUnlock.js`
2. Create `AllocationEngineV1.js` module
3. Use `Tool4BaseWeights.js` instead of duplicate baseMap
4. Remove dead code (buildPreSurveyPage, buildCalculatorPage)

### ✅ Phase 3: CSS & Templates (6-8 hours)
**Impact:** Remove ~1,200 lines | **Risk:** Low-Medium

1. Extract CSS to `shared/styles/tool4.css`
2. Refactor to `FormUtils.buildStandardPage()` pattern

---

## 🔧 Code Patterns to Use

### Loading Animation (Shared)
```javascript
// OLD (55 lines in Tool4.js):
.loading-overlay { /* custom CSS */ }
function showLoading(message) { /* custom JS */ }

// NEW (1 line):
<?!= include('shared/loading-animation') ?>
// Provides: showLoading(), hideLoading(), navigateToDashboard()
```

---

### Form Submission (FormUtils)
```javascript
// OLD (200 lines of custom handlers):
google.script.run
  .withSuccessHandler(function(result) {
    document.open();
    document.write(result.nextPageHtml);
    document.close();
  })
  .savePreSurvey(clientId, formData);

// NEW (Use FormUtils):
${FormUtils.getFormSubmissionScript('tool4', baseUrl)}

// In HTML:
<form onsubmit="return submitToolPage('preSurveyForm', 1)">
```

---

### Page Building (FormUtils)
```javascript
// OLD (1,200 lines):
buildUnifiedPage(...) {
  return `
    <!DOCTYPE html>
    <html><head><style>...</style></head>
    <body>...</body>
    </html>
  `;
}

// NEW (Following Tool1 pattern):
render(params) {
  const content = this.renderUnifiedContent(clientId, toolStatus, preSurveyData, allocation);

  return FormUtils.buildStandardPage({
    toolName: 'Financial Freedom Framework',
    toolId: 'tool4',
    page: 1,
    totalPages: 1,
    clientId: clientId,
    baseUrl: baseUrl,
    pageContent: content,  // Just HTML, no wrappers
    isFinalPage: false
  });
}

renderUnifiedContent(clientId, toolStatus, preSurveyData, allocation) {
  // Returns ONLY HTML content, no <html>/<body> tags
  return this.renderPreSurveySection(preSurveyData) +
         this.renderPriorityPickerSection(priorities, preSurveyData) +
         this.renderCalculatorSection(allocation, preSurveyData);
}
```

---

### Standard Tool Interface (Code.js)
```javascript
// Code.js expects all tools to implement:
Tool4.savePageData(clientId, page, data) {
  // Save form data
  // Return { success: true, nextPageHtml: ... }
}

Tool4.processFinalSubmission(clientId) {
  // Process final page
  // Return { success: true }
}

// Then Code.js generic handlers work automatically:
// - saveToolPageData(toolId, data)
// - completeToolSubmission(toolId, data)
```

---

## 🗺️ Module Locations

### Move Priority Logic
**From:** Tool4.js lines 4050-4653 (604 lines)
**To:** `tools/tool4/Tool4ProgressiveUnlock.js`

Functions to move:
- `scoreWealthPriority(data)`
- `scoreDebtPriority(data)`
- `scoreSecurityPriority(data)`
- `scoreEnjoymentPriority(data)`
- `scoreBigGoalPriority(data)`
- `scoreSurvivalPriority(data)`
- `scoreBusinessPriority(data)`
- `scoreGenerationalPriority(data)`
- `scoreBalancePriority(data)`
- `scoreControlPriority(data)`
- `calculatePriorityRecommendations(preSurveyData, tool2Data)`
- `getPriorityReason(priorityName, indicator)`
- `getPersonalizedReason(priorityName, indicator, data)`

Then in Tool4.js just call:
```javascript
const priorities = Tool4ProgressiveUnlock.calculatePriorityRecommendations(preSurveyData, tool2Data);
```

---

### Create Allocation Engine Module
**From:** Tool4.js lines 3539-3937 (399 lines)
**To:** `core/allocations/AllocationEngineV1.js` (NEW FILE)

Functions to move:
- `calculateAllocationV1(input)` → `AllocationEngineV1.calculate(input)`
- `buildV1Input(clientId, preSurveyAnswers)` → `AllocationEngineV1.buildInput(...)`
- All helper functions (derive*, map*)

Then in Tool4.js just call:
```javascript
const v1Input = AllocationEngineV1.buildInput(clientId, preSurveyData);
const allocation = AllocationEngineV1.calculate(v1Input);
```

---

### Use Existing Base Weights
**Remove:** Tool4.js lines 3551-3562 (duplicate baseMap)
**Use:** `Tool4BaseWeights.js` (already exists)

```javascript
// OLD (duplicate):
const baseMap = {
  'Build Long-Term Wealth': { M:40, E:25, F:20, J:15 },
  // ...
};

// NEW (use existing module):
const PRIORITY_KEYS = {
  'Build Long-Term Wealth': 'wealth',
  'Get Out of Debt': 'debt',
  // ...
};

const priorityKey = PRIORITY_KEYS[input.priority];
const base = Tool4BaseWeights.getWeights(priorityKey);
```

---

## 🧪 Testing Commands

### Run Existing Tests
```bash
# Priority recommendations
node test-priority-recommendations.js

# V1 allocation engine
node test-integration.js
node test-e2e-integration.js

# Tool4 complete flow
node test-phase1-complete.js
```

### Manual Testing Checklist
- [ ] Open Tool4 fresh
- [ ] Complete pre-survey
- [ ] See priority recommendations
- [ ] Select priority + timeline
- [ ] View allocation results
- [ ] Return to dashboard
- [ ] Reopen Tool4 (data persists)

---

## 📁 File Structure After Refactoring

```
tools/tool4/
├── Tool4.js (~950 lines)
│   ├── render()
│   ├── renderUnifiedContent()
│   ├── renderPreSurveySection()
│   ├── renderPriorityPickerSection()
│   ├── renderCalculatorSection()
│   ├── savePageData()
│   └── utilities
│
├── Tool4ProgressiveUnlock.js (~850 lines)
│   ├── All 10 scoring functions
│   ├── calculatePriorityRecommendations()
│   └── reason generators
│
├── Tool4BaseWeights.js (~180 lines - existing)
│   └── Base M/E/F/J allocations
│
└── Tool4Categories.js (~165 lines - existing)
    └── Category validation

core/allocations/
└── AllocationEngineV1.js (~400 lines - new)
    ├── calculate()
    ├── buildInput()
    └── helper functions

shared/styles/
└── tool4.css (~400 lines - new)
    └── Tool4-specific CSS
```

---

## 🔍 Common Pitfalls to Avoid

### ❌ Don't Create Complete HTML Pages
```javascript
// WRONG:
return `<!DOCTYPE html><html><head>...</head><body>...</body></html>`;

// RIGHT (return only content):
return `<div class="presurvey-section">...</div>`;
```

### ❌ Don't Duplicate FormUtils Logic
```javascript
// WRONG:
google.script.run
  .withSuccessHandler(function(result) {
    document.write(result.nextPageHtml);
  })
  .saveCustomData();

// RIGHT:
${FormUtils.getFormSubmissionScript('tool4', baseUrl)}
```

### ❌ Don't Create Custom Global Wrappers
```javascript
// WRONG:
function savePreSurvey(clientId, data) {
  return Tool4.savePreSurvey(clientId, data);
}

// RIGHT (implement standard interface):
Tool4.savePageData(clientId, page, data) { ... }
// Code.js handles the rest automatically
```

---

## 📊 Progress Tracking

### Phase 1 Checklist
- [ ] Shared loading animation included
- [ ] FormUtils submission script used
- [ ] Standard tool interface implemented
- [ ] Duplicate navigation removed
- [ ] All forms submit correctly
- [ ] Loading overlay displays
- [ ] Navigation works

### Phase 2 Checklist
- [ ] Priority logic in Tool4ProgressiveUnlock.js
- [ ] AllocationEngineV1.js created
- [ ] Tool4BaseWeights used consistently
- [ ] Dead code identified and removed
- [ ] All tests passing
- [ ] No regression

### Phase 3 Checklist
- [ ] CSS extracted to shared file
- [ ] Using FormUtils.buildStandardPage()
- [ ] No inline <html>/<body> tags
- [ ] Content renderers return only HTML
- [ ] All styles applied correctly
- [ ] Visual testing complete

---

## 🚨 When Things Break

### Issue: Loading overlay not showing
**Fix:** Verify `<?!= include('shared/loading-animation') ?>` is in <head>

### Issue: Forms not submitting
**Fix:** Check FormUtils script included, verify function names match

### Issue: Navigation white screen
**Fix:** Ensure using `document.write()` pattern, not `window.location.reload()`

### Issue: Data not persisting
**Fix:** Verify `savePageData()` implementation, check PropertiesService

### Issue: Styles not applying
**Fix:** Check CSS file included, verify class names match

### Issue: Module not found
**Fix:** Ensure module file exists, check naming (case-sensitive)

---

## 🔗 Key Reference Files

- **Pattern Examples:** `tools/tool1/Tool1.js` (697 lines - clean example)
- **Form Utilities:** `core/FormUtils.js`
- **Navigation:** `shared/NavigationHelpers.js`
- **Loading UI:** `shared/loading-animation.html`
- **Generic Handlers:** `Code.js` lines 382-644
- **Navigation Rules:** `docs/Navigation/GAS-NAVIGATION-RULES.md`
- **Project Guidelines:** `CLAUDE.md`

---

## ✅ Success Criteria

**You know refactoring is complete when:**
- [ ] Tool4.js is ~950 lines (was 4,807)
- [ ] All tests passing
- [ ] No custom form handling code
- [ ] No duplicate utilities
- [ ] Modules properly separated
- [ ] Matches Tool1 pattern
- [ ] Documentation updated
- [ ] User experience unchanged

---

## 📞 Quick Help

**Stuck on Phase 1?** → Look at Tool1.js lines 1-62 (render method)
**Stuck on Phase 2?** → Check Tool4ProgressiveUnlock.js (238 lines currently)
**Stuck on Phase 3?** → Compare with Tool1.js complete structure

**Remember:** Every other tool (1, 2, 3, 5) uses these patterns successfully!

---

**Last Updated:** 2025-11-29
**Quick Version:** v1.0
