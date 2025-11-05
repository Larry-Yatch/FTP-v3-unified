# Navigation Checklist for Tool Development

**Version:** 1.0.0
**Last Updated:** November 4, 2024
**Status:** ✅ Validated with Tool 1

---

## 🎯 Purpose

This checklist ensures all navigation patterns are correctly implemented to avoid white screens, iframe errors, and navigation bugs.

**Critical Rule:** Once `document.write()` is used, the chain must continue or explicitly break.

---

## 📋 Pre-Development Checklist

Before building a new tool, review these rules:

### **Rule 1: Know Your Navigation Pattern**
- [ ] Dashboard ↔ Report = `document.write()` (SPA-like)
- [ ] Dashboard → Form = `window.location.href` (break chain)
- [ ] Form → Form (pages) = `window.location.href` (sequential)
- [ ] Form → Dashboard = `navigateToDashboard()` (rejoin SPA)
- [ ] Logout = `window.top.location.replace()` (full reset)

### **Rule 2: Server-Side Functions Required**
- [ ] `getDashboardPage(clientId)` - Returns HTML string
- [ ] `getReportPage(clientId, toolId)` - Returns HTML string
- [ ] Both must call `Router.route()` with fake request

### **Rule 3: Client-Side Functions Required**
- [ ] `navigateToDashboard(clientId, message)` in `loading-animation.html`
- [ ] `viewReport()` in dashboard (uses `document.write()`)
- [ ] `logout()` in dashboard (uses `window.top.location.replace()`)

---

## ✅ Tool Development Checklist

### **Phase 1: Tool Structure**

#### **1. Tool Module (tools/toolN/ToolN.js)**
- [ ] `render(params)` method exists
- [ ] `renderPageContent(page, data, clientId)` method exists
- [ ] `savePageData(clientId, page, data)` method exists
- [ ] `processFinalSubmission(clientId)` method exists
- [ ] `getExistingData(clientId)` checks EDIT_DRAFT first

#### **2. Tool Report (tools/toolN/ToolNReport.js)**
- [ ] All inline scripts wrapped in IIFE: `(function() { ... })()`
- [ ] Navigation functions available:
  - [ ] `navigateToDashboard()` - from `loading-animation.html`
  - [ ] Edit button uses `loadResponseForEditing()`
  - [ ] All buttons have loading indicators
- [ ] No variable redeclaration (`const baseUrl`, etc.)

#### **3. Tool Registration (Code.js)**
- [ ] Tool manifest defined
- [ ] Tool registered in `registerTools()`
- [ ] Report route added to Router.js `_isSystemRoute()`

---

### **Phase 2: Navigation Implementation**

#### **4. Dashboard Integration (Router.js)**

**CRITICAL: User Gesture Preservation**
❌ **Do NOT use async callbacks for navigation** - they lose user gesture!
✅ **Navigate IMMEDIATELY from click handler** - preserves user gesture

```javascript
// ✅ CORRECT: View Report Button (uses document.write)
function viewReport() {
  showLoading('Loading Report');
  google.script.run
    .withSuccessHandler(function(reportHtml) {
      document.open();
      document.write(reportHtml);
      document.close();
    })
    .withFailureHandler(function(error) {
      hideLoading();
      alert('Error: ' + error.message);
    })
    .getReportPage(clientId, 'toolN');
}

// ✅ CORRECT: Edit Response Button (navigate immediately)
function editResponse() {
  showLoading('Loading your responses...');
  // Navigate IMMEDIATELY - preserves user gesture
  window.top.location.href = baseUrl + '?route=toolN&client=' + clientId + '&page=1&editMode=true';
}

// ✅ CORRECT: Start Fresh Button (navigate immediately)
function retakeTool() {
  if (confirm('Start a completely fresh assessment?')) {
    showLoading('Preparing fresh assessment...');
    // Navigate IMMEDIATELY - preserves user gesture
    window.top.location.href = baseUrl + '?route=toolN&client=' + clientId + '&page=1&clearDraft=true';
  }
}
```

**Checklist:**
- [ ] View Report button uses `getReportPage()` + `document.write()`
- [ ] Edit Response: Navigate immediately with `?editMode=true` parameter
- [ ] Start Fresh: Navigate immediately with `?clearDraft=true` parameter
- [ ] All buttons show loading indicators
- [ ] NO async `google.script.run` before navigation (loses gesture!)

#### **5. Tool Module URL Parameter Handling (tools/toolN/ToolN.js)**

Handle immediate navigation parameters on page load:

```javascript
render(params) {
  const clientId = params.clientId;
  const page = parseInt(params.page) || 1;

  // Check for immediate navigation actions
  const editMode = params.editMode === 'true' || params.editMode === true;
  const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

  // Execute actions on page load (after navigation with user gesture)
  if (editMode && page === 1) {
    Logger.log(`Edit mode triggered for ${clientId}`);
    DataService.loadResponseForEditing(clientId, 'toolN');
  }

  if (clearDraft && page === 1) {
    Logger.log(`Clear draft triggered for ${clientId}`);
    DataService.startFreshAttempt(clientId, 'toolN');
  }

  // Continue with normal render...
  const existingData = this.getExistingData(clientId);
  // ...
}
```

**Checklist:**
- [ ] Check `params.editMode` on load → Call `loadResponseForEditing()`
- [ ] Check `params.clearDraft` on load → Call `startFreshAttempt()`
- [ ] Only execute on page 1
- [ ] Log action for debugging

#### **6. Router Pass-Through (core/Router.js)**

Ensure Router passes URL parameters to tool:

```javascript
const renderParams = {
  clientId: clientId,
  sessionId: sessionId,
  insights: initResult.insights || [],
  adaptations: initResult.adaptations || {},
  page: parseInt(params.page) || 1,
  // Pass through URL parameters for immediate navigation actions
  editMode: params.editMode,
  clearDraft: params.clearDraft
};
```

**Checklist:**
- [ ] Router passes `editMode` param to tool
- [ ] Router passes `clearDraft` param to tool

#### **7. Report Page Navigation**
```javascript
// ✅ CORRECT: Return to Dashboard
<button onclick="navigateToDashboard('${clientId}', 'Loading Dashboard')">
  Return to Dashboard
</button>

// ✅ CORRECT: Edit Response (navigate immediately)
<button onclick="editResponse()">Edit Answers</button>
<script>
  (function() {
    const baseUrl = '<?= baseUrl ?>';
    const clientId = '<?= clientId ?>';

    window.editResponse = function() {
      showLoading('Loading form...');
      // Navigate IMMEDIATELY - preserves user gesture
      window.top.location.href = baseUrl + '?route=toolN&client=' + clientId + '&page=1&editMode=true';
    };
  })();
</script>
```

**Checklist:**
- [ ] "Return to Dashboard" uses `navigateToDashboard()`
- [ ] "Edit Response" navigates immediately with `?editMode=true`
- [ ] All navigation wrapped in IIFE
- [ ] No `setTimeout()` before navigation
- [ ] NO async callbacks for navigation

#### **6. Form Page Navigation**

**Cancel Edit Banner:**
```javascript
// ✅ CORRECT: Cancel Edit
function cancelEdit() {
  if (confirm('Cancel editing and discard changes?')) {
    showLoading('Canceling edit...');
    google.script.run
      .withSuccessHandler(function() {
        navigateToDashboard('${clientId}', 'Loading Dashboard');
      })
      .cancelEditDraft('${clientId}', 'toolN');
  }
}
```

**Checklist:**
- [ ] Cancel Edit uses `cancelEditDraft()` → `navigateToDashboard()`
- [ ] Page navigation uses `window.location.href` (FormUtils handles this)
- [ ] Final submission returns `{nextPageHtml: reportHtml}`
- [ ] No direct redirects from server-side

---

### **Phase 3: Data Integration**

#### **7. Edit Mode Support**

**getExistingData() pattern:**
```javascript
getExistingData(clientId) {
  // ✅ Check EDIT_DRAFT first
  const activeDraft = DataService.getActiveDraft(clientId, 'toolN');
  if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
    return activeDraft.data;
  }

  // Fallback to PropertiesService
  const draftKey = `toolN_draft_${clientId}`;
  const draftData = PropertiesService.getUserProperties().getProperty(draftKey);
  return draftData ? JSON.parse(draftData) : null;
}
```

**Checklist:**
- [ ] Check EDIT_DRAFT before PropertiesService
- [ ] Return `activeDraft.data` (not full object)
- [ ] Handle both EDIT_DRAFT and DRAFT statuses

#### **8. Edit Banner Rendering**

```javascript
// ✅ CORRECT: Edit Banner
if (existingData && existingData._editMode) {
  content += `
    <div class="edit-mode-banner">
      <div>
        <strong>✏️ Edit Mode</strong>
        <p>You're editing your response from ${originalDate}</p>
      </div>
      <button onclick="cancelEdit()">Cancel Edit</button>
    </div>
    <script>
      function cancelEdit() {
        if (confirm('Cancel editing?')) {
          showLoading('Canceling...');
          google.script.run
            .withSuccessHandler(function() {
              navigateToDashboard('${clientId}');
            })
            .cancelEditDraft('${clientId}', 'toolN');
        }
      }
    </script>
  `;
}
```

**Checklist:**
- [ ] Check `existingData._editMode === true`
- [ ] Show original date from `_originalTimestamp`
- [ ] Cancel button uses `navigateToDashboard()` (not `window.location`)
- [ ] Script wrapped in IIFE if multiple scripts on page

#### **9. Final Submission Handling**

```javascript
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);
  const isEditMode = allData._editMode === true;

  // Calculate scores, generate report data
  const dataPackage = { formData: allData, scores, winner };

  if (isEditMode) {
    // ✅ Use ResponseManager for edits
    const result = DataService.submitEditedResponse(clientId, 'toolN', dataPackage);
  } else {
    // ✅ Use traditional save for new submissions
    this.saveToResponses(clientId, allData, scores, winner);
  }

  // ✅ Return for client-side navigation
  return {
    redirectUrl: `${ScriptApp.getService().getUrl()}?route=toolN_report&client=${clientId}`
  };
}
```

**Checklist:**
- [ ] Detect edit mode: `allData._editMode === true`
- [ ] Use `DataService.submitEditedResponse()` for edits
- [ ] Use traditional save for new submissions
- [ ] Return `{redirectUrl}` (not HTML)
- [ ] `completeToolSubmission()` in Code.js handles HTML generation

---

## 🔍 Code Review Checklist

Before deploying, check all navigation code:

### **Pattern Detection**
Run the validation script: `validateNavigationPatterns()`

- [ ] No `window.location` used after `document.write()` pages
- [ ] All inline scripts wrapped in IIFE
- [ ] No `setTimeout()` before navigation calls
- [ ] All navigation functions available in scope

### **Variable Declarations**
- [ ] No duplicate `const baseUrl` declarations
- [ ] No duplicate function declarations
- [ ] All global functions exposed via `window.functionName`

### **Type Safety**
- [ ] Use `String(value)` for dropdown comparisons
- [ ] Use `_isTrue(value)` for boolean checks
- [ ] Parse integers with `parseInt(value, 10)`

### **Loading Indicators**
- [ ] All buttons call `showLoading()` before navigation
- [ ] All `google.script.run` calls have `withFailureHandler()`
- [ ] Failures call `hideLoading()`

### **Null Safety (CRITICAL)**
- [ ] **ALWAYS check for null** in `google.script.run` success handlers
- [ ] google.script.run can return `null` in edge cases (timing, serialization)
- [ ] Pattern: `if (!result) { hideLoading(); alert('Error...'); return; }`

### **User Gesture Preservation (CRITICAL)**
- [ ] **NO async callbacks before navigation** - they lose user gesture
- [ ] Navigate IMMEDIATELY from click handlers using `window.top.location.href`
- [ ] Pass actions as URL parameters (`?editMode=true`, `?clearDraft=true`)
- [ ] Execute server actions AFTER navigation completes

---

## 🧪 Testing Protocol

### **Manual Testing Flow**

Test **ALL** navigation paths for each tool:

#### **Flow 1: Complete New Assessment**
1. [ ] Login → Dashboard
2. [ ] Dashboard → Start Tool
3. [ ] Page 1 → Page 2 (repeat for all pages)
4. [ ] Final Page → Report
5. [ ] Report → Dashboard
6. [ ] Dashboard → View Report (2nd time - critical!)
7. [ ] Report → Dashboard (2nd time)

#### **Flow 2: Edit Mode**
1. [ ] Dashboard → Edit Answers
2. [ ] Form loads with data pre-filled
3. [ ] Edit Banner displays
4. [ ] Cancel Edit → Dashboard
5. [ ] Edit again → Make changes → Submit
6. [ ] Report → Dashboard
7. [ ] Dashboard → View Report (should show edited version)

#### **Flow 3: Start Fresh**
1. [ ] Dashboard → Start Fresh
2. [ ] Confirm dialog
3. [ ] Form loads empty
4. [ ] Complete assessment
5. [ ] Report shows new version

#### **Flow 4: Draft Management**
1. [ ] Start tool → Fill page 1 → Close browser
2. [ ] Reopen → Should show "In Progress"
3. [ ] Continue → Should load page 1 data
4. [ ] Discard Draft → Should clear draft
5. [ ] Dashboard shows "Ready" state

#### **Flow 5: Logout**
1. [ ] From Dashboard → Logout
2. [ ] Should return to login page
3. [ ] Login again → Should work normally

---

## 🚨 Common Mistakes to Avoid

### **❌ WRONG: Mixing Patterns**
```javascript
// Dashboard loads via document.write()
document.write(dashboardHtml);

// Then trying to navigate with window.location
window.location.href = reportUrl;  // ❌ WHITE SCREEN
```

### **✅ CORRECT: Stay in document.write() Chain**
```javascript
document.write(dashboardHtml);

// Use getReportPage() + document.write()
google.script.run
  .withSuccessHandler(function(html) {
    document.open();
    document.write(html);
    document.close();
  })
  .getReportPage(clientId, 'tool1');
```

---

### **❌ WRONG: setTimeout Before Navigation**
```javascript
setTimeout(() => {
  window.location.href = url;  // ❌ Breaks user gesture chain
}, 100);
```

### **✅ CORRECT: Direct Navigation**
```javascript
showLoading('Navigating...');
google.script.run
  .withSuccessHandler(function(html) {
    document.write(html);
  })
  .getDashboardPage(clientId);
```

---

### **❌ WRONG: Variable Redeclaration**
```javascript
// Page 1
<script>
  const baseUrl = '...';
</script>

// Page 2 (loaded via document.write)
<script>
  const baseUrl = '...';  // ❌ ERROR
</script>
```

### **✅ CORRECT: IIFE Scoping**
```javascript
// Page 1
<script>
  (function() {
    const baseUrl = '...';
    window.myGlobalFunction = function() { ... };
  })();
</script>

// Page 2
<script>
  (function() {
    const baseUrl = '...';  // ✅ Scoped, no conflict
  })();
</script>
```

---

### **❌ WRONG: Missing Null Check** (CRITICAL)
```javascript
google.script.run
  .withSuccessHandler(function(result) {
    if (result.success) { ... }  // ❌ Crashes if result is null
  })
  .someServerFunction();
```

### **✅ CORRECT: Always Check for Null**
```javascript
google.script.run
  .withSuccessHandler(function(result) {
    // ALWAYS check for null first
    if (!result) {
      hideLoading();
      alert('Error: Server returned no data. Please refresh and try again.');
      return;
    }

    if (result.success) { ... }  // ✅ Safe
  })
  .someServerFunction();
```

**Why:** `google.script.run` can return `null` due to timing conflicts, serialization issues, or large objects.

---

### **❌ WRONG: Async Callback Loses User Gesture** (CRITICAL)
```javascript
function retakeTool() {
  google.script.run
    .withSuccessHandler(function(result) {
      // ❌ User gesture expired - Chrome blocks navigation!
      window.top.location.href = url;  // SecurityError: no user activation
    })
    .startFreshAttempt(...);
}
```

### **✅ CORRECT: Navigate Immediately**
```javascript
// Navigate IMMEDIATELY (preserves user gesture)
function retakeTool() {
  if (confirm('Start fresh?')) {
    showLoading('Preparing...');
    window.top.location.href = baseUrl + '?clearDraft=true';  // ✅ Has gesture
  }
}

// Execute action on page load (after navigation)
Tool.render(params) {
  if (params.clearDraft === 'true') {
    DataService.startFreshAttempt(clientId, 'toolN');
  }
}
```

**Why:** Chrome requires **user activation** (recent gesture) for `window.top.location.href` in sandboxed iframes. Async callbacks lose this activation.

**Reference:** https://www.chromestatus.com/feature/5629582019395584

---

## 📊 Validation Script

Run this before every deployment:

```javascript
// In Code.js
function validateNavigationPatterns() {
  // See validate-navigation.js for full implementation
}
```

---

## 🎓 Quick Reference

| Scenario | Method | Why |
|----------|--------|-----|
| Dashboard → Report | `getReportPage()` + `document.write()` | Continue SPA chain |
| Dashboard → Edit Form | `window.top.location.href` + `?editMode=true` | Preserve user gesture |
| Dashboard → Start Fresh | `window.top.location.href` + `?clearDraft=true` | Preserve user gesture |
| Dashboard → Start Tool | `window.top.location.href` | Direct button |
| Report → Dashboard | `navigateToDashboard()` (uses `document.write()`) | Rejoin SPA chain |
| Report → Edit Form | `window.top.location.href` + `?editMode=true` | Preserve user gesture |
| Form → Dashboard | `navigateToDashboard()` (uses `document.write()`) | Rejoin SPA chain |
| Form → Next Page | `window.location.href` | Sequential form flow |
| Cancel Edit | `navigateToDashboard()` (uses `document.write()`) | Return to SPA |
| Logout | `window.top.location.replace()` | Full reset |

**Critical Rules:**
- ✅ Dashboard ↔ Report: Use `document.write()` (SPA mode)
- ✅ Dashboard/Report → Form: **Navigate IMMEDIATELY** with `window.top.location.href` + URL params
- ❌ **NEVER** use async callbacks before navigation (loses user gesture!)
- ✅ **ALWAYS** check for null in `google.script.run` success handlers

---

## 📝 Notes for Future Tools

- Tool 1: ✅ Validated (5 pages, edit mode, all flows tested)
- Tool 2: 🚧 Use this checklist before implementation
- Tools 3-8: 🚧 Copy patterns from Tool 1

---

**When in doubt:** Check Tool 1 implementation as reference.

**Before deploying:** Run `validateNavigationPatterns()` and manual test all flows.

**If you break it:** Check the navigation pattern - 99% of bugs are mixing patterns.

---

**Created by:** Agent Girl
**Based on:** Navigation fixes from v3.3.0 (@41-@57)
**Last Updated:** November 5, 2024 - Added null checks & user gesture patterns
**Status:** Production-ready checklist with all edge cases documented
