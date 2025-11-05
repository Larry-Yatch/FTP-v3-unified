# Testing Current System - Pre-Tool 2 Validation

**Version:** v3.3.0
**Date:** November 4, 2024
**Purpose:** Validate all navigation and data persistence before building Tool 2

---

## 🎯 Testing Objective

Ensure Tool 1 + Response Management System is **100% stable** before building Tool 2.

**Success Criteria:**
- ✅ All navigation paths work without white screens
- ✅ Edit mode loads data correctly
- ✅ Version control works (keeps last 2 versions)
- ✅ Is_Latest flags are correct
- ✅ No console errors

---

## 📋 Pre-Test Setup

### **Step 1: Run Validation Script**

In Google Apps Script editor:

```javascript
// Run this first
runAllValidations();
```

**Expected Result:** All checks pass (or pass with minor warnings)

If any CRITICAL failures, **STOP** and fix before proceeding.

---

### **Step 2: Verify Test User Exists**

```javascript
// Check if TEST001 exists
checkStudentAccess('TEST001');

// If not found, create it
addTestUser();
```

**Expected Result:** TEST001 exists and has Tool 1 unlocked

---

### **Step 3: Clear Test Data (Optional)**

If you want to start fresh:

```javascript
// Delete all TEST001 responses
function clearTestUserData() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === 'TEST001') {  // Client_ID column
      sheet.deleteRow(i + 1);
    }
  }

  console.log('✅ Cleared all TEST001 data');
}

clearTestUserData();
```

---

## 🧪 Manual Test Flows

### **Test Flow 1: New User Complete Assessment**

**Goal:** Verify basic flow works end-to-end

1. **Login**
   - [ ] Go to your web app URL
   - [ ] Enter `TEST001` as Student ID
   - [ ] Click "Sign In"
   - [ ] **Expected:** Dashboard loads (no white screen)
   - [ ] **Expected:** Tool 1 card shows "Ready" badge

2. **Start Tool 1**
   - [ ] Click "Start Assessment" on Tool 1 card
   - [ ] **Expected:** Loading animation appears
   - [ ] **Expected:** Page 1 loads with empty form

3. **Complete All Pages**
   - [ ] Fill out Page 1 (name, email)
   - [ ] Click "Next" → **Expected:** Page 2 loads
   - [ ] Fill out Page 2 (questions 3-8)
   - [ ] Click "Next" → **Expected:** Page 3 loads
   - [ ] Fill out Page 3 (questions 10-15)
   - [ ] Click "Next" → **Expected:** Page 4 loads
   - [ ] Fill out Page 4 (questions 17-22)
   - [ ] Click "Next" → **Expected:** Page 5 loads
   - [ ] Fill out Page 5 (rankings)
   - [ ] Click "Submit Assessment"
   - [ ] **Expected:** Report page loads with scores

4. **Report Page**
   - [ ] **Expected:** See scores and winner
   - [ ] **Expected:** "Return to Dashboard" button visible
   - [ ] **Expected:** "Edit Answers" button visible
   - [ ] Click "Return to Dashboard"
   - [ ] **Expected:** Dashboard loads (no white screen)

5. **Dashboard After Completion**
   - [ ] **Expected:** Tool 1 card shows "✓ Completed" badge (green border)
   - [ ] **Expected:** Three buttons: "📊 View Report", "✏️ Edit Answers", "🔄 Start Fresh"
   - [ ] **Expected:** Completion date displayed

**✅ Test Flow 1 Complete**

---

### **Test Flow 2: View Report (Critical - Tests document.write Chain)**

**Goal:** Verify 2nd report view doesn't white screen

1. **From Dashboard**
   - [ ] Click "📊 View Report"
   - [ ] **Expected:** Loading animation
   - [ ] **Expected:** Report loads (no white screen)
   - [ ] **Expected:** All scores visible

2. **Return to Dashboard**
   - [ ] Click "Return to Dashboard"
   - [ ] **Expected:** Dashboard loads

3. **View Report Again (THE CRITICAL TEST)**
   - [ ] Click "📊 View Report" **again**
   - [ ] **Expected:** Report loads (NO WHITE SCREEN!)
   - [ ] **Expected:** Same scores as before

4. **Repeat 2-3 Times**
   - [ ] Dashboard → View Report → Dashboard → View Report
   - [ ] **Expected:** Works every time

**✅ Test Flow 2 Complete** (If this fails, document.write chain is broken)

---

### **Test Flow 3: Edit Mode**

**Goal:** Verify edit mode loads data correctly

1. **From Dashboard**
   - [ ] Click "✏️ Edit Answers"
   - [ ] **Expected:** Loading message: "Loading your responses..."
   - [ ] **Expected:** Form loads on Page 1

2. **Check Edit Banner**
   - [ ] **Expected:** Yellow/gold banner at top: "✏️ Edit Mode"
   - [ ] **Expected:** Banner shows original completion date
   - [ ] **Expected:** "Cancel Edit" button in banner

3. **Check Pre-filled Data**
   - [ ] **Expected:** Name field has original value
   - [ ] **Expected:** Email field has original value
   - [ ] Click "Next" to Page 2
   - [ ] **Expected:** All dropdowns show previously selected values
   - [ ] Continue through all pages
   - [ ] **Expected:** Page 5 rankings show previous selections

4. **Make Changes**
   - [ ] Change name to "TEST001 EDITED"
   - [ ] Change one question response
   - [ ] Navigate to Page 5
   - [ ] Click "Submit Assessment"

5. **Verify New Version**
   - [ ] **Expected:** Report loads with updated data
   - [ ] Return to Dashboard
   - [ ] Click "View Report"
   - [ ] **Expected:** Report shows "TEST001 EDITED"

**✅ Test Flow 3 Complete**

---

### **Test Flow 4: Cancel Edit**

**Goal:** Verify cancel restores original data

1. **From Dashboard**
   - [ ] Click "✏️ Edit Answers"
   - [ ] **Expected:** Form loads with edit banner

2. **Cancel from Banner**
   - [ ] Click "Cancel Edit" button in banner
   - [ ] **Expected:** Confirmation dialog: "Cancel editing and discard changes?"
   - [ ] Click "OK"
   - [ ] **Expected:** Loading message
   - [ ] **Expected:** Dashboard loads (no white screen)

3. **Verify Original Data Restored**
   - [ ] **Expected:** Tool 1 shows "✓ Completed"
   - [ ] Click "View Report"
   - [ ] **Expected:** Report shows original data (not edited)

**✅ Test Flow 4 Complete**

---

### **Test Flow 5: Start Fresh**

**Goal:** Verify fresh start creates new attempt

1. **From Dashboard**
   - [ ] Click "🔄 Start Fresh"
   - [ ] **Expected:** Confirmation: "Start a completely fresh assessment?"
   - [ ] Click "OK"
   - [ ] **Expected:** Loading message
   - [ ] **Expected:** Form loads on Page 1

2. **Check Fresh Form**
   - [ ] **Expected:** NO edit banner (fresh start)
   - [ ] **Expected:** All fields empty
   - [ ] **Expected:** No pre-filled data

3. **Complete New Assessment**
   - [ ] Fill out all pages with different data
   - [ ] Submit
   - [ ] **Expected:** Report shows new data

4. **Verify Version Management**
   - [ ] Open Google Sheet (RESPONSES tab)
   - [ ] Filter by TEST001 + tool1
   - [ ] **Expected:** See multiple COMPLETED rows
   - [ ] **Expected:** Exactly ONE has Is_Latest = TRUE
   - [ ] **Expected:** Only last 2 COMPLETED versions kept

**✅ Test Flow 5 Complete**

---

### **Test Flow 6: Draft Management**

**Goal:** Verify draft save/resume works

1. **Start Assessment**
   - [ ] From Dashboard → "Start Assessment"
   - [ ] Fill out Page 1
   - [ ] Click "Next" to Page 2
   - [ ] Fill out Page 2 (partially)

2. **Abandon (Close Browser)**
   - [ ] Close the browser tab (or go to Dashboard via URL)
   - [ ] **DO NOT** click any submit buttons

3. **Return to Dashboard**
   - [ ] Open app URL
   - [ ] Login as TEST001
   - [ ] **Expected:** Tool 1 card shows "⏸️ In Progress" badge (orange)
   - [ ] **Expected:** Message: "You have a draft in progress"
   - [ ] **Expected:** Two buttons: "▶️ Continue" and "❌ Discard Draft"

4. **Resume Draft**
   - [ ] Click "▶️ Continue"
   - [ ] **Expected:** Form loads on last page (Page 2 or wherever you left off)
   - [ ] **Expected:** Page 1 data is saved
   - [ ] **Expected:** Page 2 partial data is saved

5. **Discard Draft**
   - [ ] Return to Dashboard
   - [ ] Click "❌ Discard Draft"
   - [ ] **Expected:** Confirmation dialog
   - [ ] Click "OK"
   - [ ] **Expected:** Dashboard refreshes
   - [ ] **Expected:** Tool 1 shows previous state (Completed or Ready)

**✅ Test Flow 6 Complete**

---

### **Test Flow 7: Logout**

**Goal:** Verify logout fully resets application

1. **From Dashboard**
   - [ ] Click "Logout" button
   - [ ] **Expected:** Loading message
   - [ ] **Expected:** Returns to login page
   - [ ] **Expected:** No dashboard visible

2. **Login Again**
   - [ ] Enter TEST001
   - [ ] Click "Sign In"
   - [ ] **Expected:** Dashboard loads normally
   - [ ] **Expected:** Tool 1 state is preserved

**✅ Test Flow 7 Complete**

---

## 🔍 Backend Validation Tests

### **Test 8: Data Integrity**

Run these in Apps Script:

```javascript
// 1. Check Is_Latest integrity
validateIsLatestIntegrity();
// Expected: All groups have exactly 1 Is_Latest=true

// 2. Check version count
function checkVersionCount() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName('RESPONSES');
  const data = sheet.getDataRange().getValues();

  const clientId = 'TEST001';
  const toolId = 'tool1';

  let completedCount = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === clientId && data[i][2] === toolId && data[i][5] === 'COMPLETED') {
      completedCount++;
    }
  }

  console.log(`TEST001/tool1 has ${completedCount} COMPLETED versions`);
  if (completedCount <= 2) {
    console.log('✅ Version cleanup working (keeps last 2)');
  } else {
    console.log('⚠️ Version cleanup may not be working');
  }
}

checkVersionCount();

// 3. Check data structure
function checkDataStructure() {
  const latest = ResponseManager.getLatestResponse('TEST001', 'tool1');

  if (!latest) {
    console.log('ℹ️ No data found');
    return;
  }

  console.log('Status: ' + latest.status);
  console.log('Is Latest: ' + latest.isLatest);
  console.log('Has formData: ' + (latest.data.formData ? 'Yes' : 'No'));
  console.log('Has scores: ' + (latest.data.scores ? 'Yes' : 'No'));
  console.log('Has winner: ' + (latest.data.winner ? 'Yes' : 'No'));

  if (latest.data.formData && latest.data.scores && latest.data.winner) {
    console.log('✅ Data structure correct');
  } else {
    console.log('⚠️ Data structure unexpected');
  }
}

checkDataStructure();
```

**✅ Test 8 Complete**

---

## 📊 Test Results Summary

After completing all tests, fill out this summary:

| Test Flow | Status | Notes |
|-----------|--------|-------|
| 1. New User Complete | ⬜ | |
| 2. View Report (2nd time) | ⬜ | **CRITICAL** |
| 3. Edit Mode | ⬜ | |
| 4. Cancel Edit | ⬜ | |
| 5. Start Fresh | ⬜ | |
| 6. Draft Management | ⬜ | |
| 7. Logout | ⬜ | |
| 8. Data Integrity | ⬜ | |

**Overall Status:** ⬜ PASS / ⬜ FAIL

---

## 🚨 Known Issues & Workarounds

### **Issue 1: White Screen on 2nd Report View**
**Status:** ✅ FIXED in v3.3.0 (commit 031ee46)
**If you see this:** Check that `viewReport()` uses `getReportPage()` + `document.write()`

### **Issue 2: Rankings Empty in Edit Mode**
**Status:** ✅ FIXED in v3.3.0 (commit 031ee46)
**If you see this:** Check that dropdowns use `String(selected)` comparison

### **Issue 3: Variable Redeclaration Error**
**Status:** ✅ FIXED in v3.3.0 (commit 031ee46)
**If you see this:** Wrap all inline scripts in IIFE `(function(){...})()`

---

## ✅ Go/No-Go Decision

**Before building Tool 2:**

- [ ] All 8 test flows PASS
- [ ] No white screens in any navigation
- [ ] Edit mode loads data correctly
- [ ] Is_Latest integrity validated
- [ ] No console errors
- [ ] `runAllValidations()` returns PASS

**If ALL checkboxes are checked:** ✅ **FOUNDATION IS SOLID - BUILD TOOL 2**

**If ANY checkbox is unchecked:** ⚠️ **FIX ISSUES BEFORE TOOL 2**

---

## 📝 Test Log Template

```
Test Date: _______________
Tester: _______________
Version: v3.3.0 (commit 031ee46)

RESULTS:
- Test 1: □ PASS  □ FAIL  Notes: _____________________
- Test 2: □ PASS  □ FAIL  Notes: _____________________
- Test 3: □ PASS  □ FAIL  Notes: _____________________
- Test 4: □ PASS  □ FAIL  Notes: _____________________
- Test 5: □ PASS  □ FAIL  Notes: _____________________
- Test 6: □ PASS  □ FAIL  Notes: _____________________
- Test 7: □ PASS  □ FAIL  Notes: _____________________
- Test 8: □ PASS  □ FAIL  Notes: _____________________

OVERALL: □ PASS  □ FAIL

RECOMMENDATION: □ Ready for Tool 2  □ Fix issues first

ISSUES FOUND:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

```

---

**Created by:** Agent Girl
**For Version:** v3.3.0
**Purpose:** Pre-Tool 2 validation
