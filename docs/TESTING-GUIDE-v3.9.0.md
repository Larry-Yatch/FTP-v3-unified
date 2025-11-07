# Testing Guide for v3.9.0 Refactoring

**Version:** v3.9.0
**Date:** January 7, 2025
**Purpose:** Systematic testing protocol for Phase 1 & Phase 2 refactoring
**Estimated Time:** 2-3 hours

---

## 📋 Overview

This guide provides a systematic approach to testing the v3.9.0 refactoring, which includes:
- 7 new shared utilities
- Code.js reduced by 36% (1,086 → 696 lines)
- Updated Tool1 and Tool2 implementations
- 17 automated validation tests

**⚠️ IMPORTANT:** Complete ALL sections before declaring the refactoring production-ready.

---

## Pre-Deployment Checklist

Before running `clasp push`, verify:

- [ ] All git changes committed to `claude/refactor-code-011CUsbw3c8MbaJw1oWyjiBB`
- [ ] All git changes pushed to remote
- [ ] Working tree is clean (`git status` shows no uncommitted changes)
- [ ] You have `clasp` installed and authenticated
- [ ] You're in the correct project directory (`/home/user/FTP-v3-unified`)

---

## 1. Deployment

### Step 1.1: Deploy to Google Apps Script

```bash
# Navigate to project directory
cd /home/user/FTP-v3-unified

# Push to Google Apps Script
clasp push

# Verify push was successful
# You should see: "Pushed X files"
```

**Expected Output:**
```
└─ appsscript.json
└─ Code.js
└─ Config.js
└─ shared/EditModeBanner.js
└─ shared/ReportBase.js
└─ shared/DraftService.js
└─ shared/ErrorHandler.js
└─ shared/Validator.js
└─ shared/NavigationHelpers.js
└─ shared/PDFGenerator.js
└─ tools/tool1/Tool1.js
└─ tools/tool1/Tool1Report.js
└─ tools/tool2/Tool2.js
└─ tools/tool2/Tool2Report.js
... [and other files]
Pushed XX files.
```

**✅ CHECKPOINT:** If push fails, check `.clasp.json` and `.claspignore` configuration.

### Step 1.2: Verify Deployment in Google Apps Script

1. Open [Google Apps Script Editor](https://script.google.com)
2. Find your project: "Financial TruPath v3"
3. Verify new files appear in file tree:
   - [ ] `shared/EditModeBanner.js`
   - [ ] `shared/ReportBase.js`
   - [ ] `shared/DraftService.js`
   - [ ] `shared/ErrorHandler.js`
   - [ ] `shared/Validator.js`
   - [ ] `shared/NavigationHelpers.js`
   - [ ] `shared/PDFGenerator.js`
   - [ ] `test-refactoring.js`
4. Check `Code.js` file size is significantly smaller

**✅ CHECKPOINT:** All new files visible in Apps Script editor.

---

## 2. Automated Validation Tests

### Step 2.1: Run Test Suite

**In Google Apps Script Editor:**

1. Open `test-refactoring.js`
2. Select function: `runRefactoringValidationTests`
3. Click **Run** (▶️ button)
4. Wait for execution to complete (~30-60 seconds)
5. Check **Execution Log** (View → Logs)

### Step 2.2: Verify Test Results

**Expected Output (17/17 tests passing):**

```
=== REFACTORING VALIDATION TEST SUITE ===
Running 17 tests...

✓ Test 1/17: EditModeBanner.render() generates HTML
✓ Test 2/17: ReportBase.getSheet() returns RESPONSES sheet
✓ Test 3/17: DraftService.saveDraft() saves to PropertiesService
✓ Test 4/17: DraftService.getDraft() retrieves saved draft
✓ Test 5/17: DraftService.clearDraft() removes draft
✓ Test 6/17: Config.TOOLS contains tool1 configuration
✓ Test 7/17: Config.UI contains theme colors
✓ Test 8/17: Config.COLUMN_INDEXES contains sheet mappings
✓ Test 9/17: ErrorHandler.createErrorResponse() formats correctly
✓ Test 10/17: ErrorHandler.createSuccessResponse() formats correctly
✓ Test 11/17: Validator.requireString() validates strings
✓ Test 12/17: Validator.requireNumber() validates numbers
✓ Test 13/17: Validator.validateScaleValue() enforces -5 to +5 (no zero)
✓ Test 14/17: NavigationHelpers.getDashboardPage() exists and returns HTML
✓ Test 15/17: NavigationHelpers.getReportPage() exists and returns HTML
✓ Test 16/17: PDFGenerator.generateTool1PDF() exists
✓ Test 17/17: PDFGenerator.generateTool2PDF() exists

=== RESULTS ===
✅ ALL 17 TESTS PASSED
```

### Step 2.3: Handle Test Failures

**If ANY test fails:**

1. **DO NOT PROCEED** to manual testing
2. Note which test(s) failed
3. Check execution log for error details
4. Common issues:
   - **Test 2 fails**: RESPONSES sheet not found → Check sheet name
   - **Test 3-5 fail**: PropertiesService access → Check permissions
   - **Test 6-8 fail**: Config.js not loaded → Check file deployment
   - **Test 9-13 fail**: Utilities not loaded → Check shared/ files
   - **Test 14-17 fail**: Functions missing → Check Code.js deployment

5. Fix issues locally, re-deploy (`clasp push`), re-run tests

**✅ CHECKPOINT:** All 17 tests passing before proceeding.

---

## 3. Manual Testing - Shared Utilities

### Test 3.1: EditModeBanner

**Purpose:** Verify edit mode banner renders correctly

**Steps:**
1. Open Apps Script editor
2. Go to **Tools** → **Script editor**
3. In console, run:
   ```javascript
   const html = EditModeBanner.render('January 1, 2025', 'TEST001', 'tool1');
   Logger.log(html);
   ```
4. Check log output

**Expected Result:**
- HTML string contains "Edit Mode" text
- Contains "Cancel Edit" button
- Contains client ID and date

**✅ PASS / ❌ FAIL:** __________

---

### Test 3.2: DraftService

**Purpose:** Verify draft save/retrieve cycle

**Steps:**
1. In Apps Script console, run:
   ```javascript
   // Save draft
   DraftService.saveDraft('tool1', 'TEST001', 1, {name: 'Test User', q1: '3'});
   Logger.log('Draft saved');

   // Retrieve draft
   const draft = DraftService.getDraft('tool1', 'TEST001');
   Logger.log('Retrieved draft:', draft);

   // Check data
   Logger.log('Name:', draft.name);
   Logger.log('Q1:', draft.q1);
   ```

**Expected Result:**
- "Draft saved" logged
- Draft object retrieved with correct data
- `draft.name === 'Test User'`
- `draft.q1 === '3'`

**✅ PASS / ❌ FAIL:** __________

---

### Test 3.3: ReportBase

**Purpose:** Verify report retrieval from RESPONSES sheet

**Prerequisites:**
- Tool1 must have at least one completed response for TEST001

**Steps:**
1. Complete Tool1 with TEST001 (if not already done)
2. In Apps Script console, run:
   ```javascript
   const results = ReportBase.getResults('TEST001', 'tool1', (resultData, cId) => {
     return {
       clientId: cId,
       data: resultData
     };
   }, false);

   Logger.log('Results found:', results ? 'Yes' : 'No');
   Logger.log('Client ID:', results?.clientId);
   ```

**Expected Result:**
- "Results found: Yes"
- Client ID matches 'TEST001'
- No errors thrown

**✅ PASS / ❌ FAIL:** __________

---

### Test 3.4: ErrorHandler

**Purpose:** Verify error handling and response formatting

**Steps:**
1. In Apps Script console, run:
   ```javascript
   // Test success response
   const success = ErrorHandler.createSuccessResponse({foo: 'bar'}, 'It worked!');
   Logger.log('Success response:', success);

   // Test error response
   const error = ErrorHandler.createErrorResponse('Something failed', ErrorCodes.INVALID_INPUT);
   Logger.log('Error response:', error);

   // Test AppError
   try {
     throw new AppError('Test error', ErrorCodes.TOOL_NOT_FOUND, {toolId: 'tool99'});
   } catch (e) {
     Logger.log('AppError caught:', e.message);
     Logger.log('Error code:', e.code);
   }
   ```

**Expected Result:**
- Success response has `success: true`
- Error response has `success: false`
- AppError has correct code and message

**✅ PASS / ❌ FAIL:** __________

---

### Test 3.5: Validator

**Purpose:** Verify input validation

**Steps:**
1. In Apps Script console, run:
   ```javascript
   try {
     // Should pass
     const name = Validator.requireString('John Doe', 'Name');
     Logger.log('✓ Valid string accepted:', name);

     // Should pass
     const age = Validator.requireNumber(25, 'Age', {min: 0, max: 150});
     Logger.log('✓ Valid number accepted:', age);

     // Should fail
     Validator.requireString('', 'Name');
   } catch (e) {
     Logger.log('✓ Empty string rejected:', e.message);
   }

   try {
     // Should fail (zero not allowed)
     Validator.validateScaleValue(0, 'Q1');
   } catch (e) {
     Logger.log('✓ Zero scale value rejected:', e.message);
   }
   ```

**Expected Result:**
- Valid inputs accepted
- Empty string rejected with error
- Zero scale value rejected with error

**✅ PASS / ❌ FAIL:** __________

---

### Test 3.6: NavigationHelpers

**Purpose:** Verify navigation functions exist and return HTML

**Steps:**
1. In Apps Script console, run:
   ```javascript
   const dashboard = NavigationHelpers.getDashboardPage('TEST001');
   Logger.log('Dashboard HTML length:', dashboard.length);
   Logger.log('Contains script tag:', dashboard.includes('<script>'));

   const report = NavigationHelpers.getReportPage('TEST001', 'tool1');
   Logger.log('Report HTML length:', report.length);
   ```

**Expected Result:**
- Dashboard HTML returned (length > 0)
- Contains script tags
- Report HTML returned (length > 0)

**✅ PASS / ❌ FAIL:** __________

---

### Test 3.7: PDFGenerator

**Purpose:** Verify PDF generation functions

**Prerequisites:**
- Tool1 must have at least one completed response for TEST001

**Steps:**
1. In Apps Script console, run:
   ```javascript
   try {
     const pdf = PDFGenerator.generateTool1PDF('TEST001');
     Logger.log('PDF generated successfully');
     Logger.log('PDF type:', typeof pdf);
     Logger.log('Has getAs method:', typeof pdf.getAs === 'function');
   } catch (e) {
     Logger.log('Error generating PDF:', e.message);
   }
   ```

**Expected Result:**
- "PDF generated successfully"
- PDF is a Blob object
- Has `getAs` method

**✅ PASS / ❌ FAIL:** __________

---

## 4. End-to-End Testing - Tool 1

### Test 4.1: Complete New Tool1 Assessment

**Purpose:** Verify Tool1 works end-to-end with refactored code

**Steps:**

1. **Open Web App**
   - Get deployment URL from Apps Script (Deploy → Test deployments)
   - Open in browser

2. **Login as TEST001**
   - Should see dashboard

3. **Start Tool 1**
   - Click "Start Assessment" for Tool 1
   - Should load Page 1

4. **Complete Page 1**
   - Fill in name: "Refactor Test User"
   - Fill in email: "test@example.com"
   - Click "Next"
   - **Verify:** Draft saved (check via DraftService.getDraft('tool1', 'TEST001'))

5. **Complete Pages 2-5**
   - Fill in all required fields
   - Click "Next" after each page
   - **Verify:** No errors, smooth navigation

6. **Submit Assessment**
   - Complete final page
   - Click "Complete Assessment"
   - **Verify:** Redirects to report page

7. **View Report**
   - **Verify:** Report displays with scores
   - **Verify:** "Download PDF" button present
   - **Verify:** "Edit Answers" button present

**✅ PASS / ❌ FAIL:** __________

**Notes/Issues:** _________________________________

---

### Test 4.2: Edit Tool1 Response

**Purpose:** Verify edit mode works with EditModeBanner

**Steps:**

1. **Click "Edit Answers"** on Tool1 report
   - Should navigate to Tool1 Page 1

2. **Verify Edit Banner**
   - [ ] Edit mode banner visible at top
   - [ ] Shows original completion date
   - [ ] "Cancel Edit" button present
   - [ ] Banner uses consistent styling

3. **Edit Page 1**
   - Change name to: "Refactor Test User (Edited)"
   - Click "Next"

4. **Skip to Final Page**
   - Use browser navigation to jump to page 5
   - Click "Complete Assessment"

5. **Verify Updated Report**
   - Report shows updated name
   - No errors or data loss

**✅ PASS / ❌ FAIL:** __________

**Notes/Issues:** _________________________________

---

### Test 4.3: Draft Resume (Tool1)

**Purpose:** Verify draft auto-save and resume

**Steps:**

1. **Start Fresh Tool1 Assessment**
   - Delete TEST001's Tool1 data (or use different client ID)
   - Start Tool1

2. **Complete Page 1, Close Browser**
   - Fill in page 1
   - Click "Next"
   - **Close browser tab** (simulating interruption)

3. **Re-open Tool1**
   - Login as same client
   - Click "Continue" on Tool1

4. **Verify Draft Restored**
   - [ ] Page 1 data pre-filled
   - [ ] Can continue from Page 2
   - [ ] No data loss

**✅ PASS / ❌ FAIL:** __________

---

### Test 4.4: Tool1 PDF Download

**Purpose:** Verify PDF generation with PDFGenerator

**Steps:**

1. **Open Tool1 Report** for TEST001

2. **Click "Download PDF"**
   - Should trigger download

3. **Verify PDF**
   - [ ] PDF file downloads
   - [ ] Filename format: "Tool1-[StudentName]-[Date].pdf"
   - [ ] PDF opens without errors
   - [ ] Contains student name
   - [ ] Contains scores
   - [ ] Contains TruPath branding/header
   - [ ] Contains footer

**✅ PASS / ❌ FAIL:** __________

---

## 5. End-to-End Testing - Tool 2

### Test 5.1: Complete New Tool2 Assessment

**Purpose:** Verify Tool2 works with refactored code (including GPT)

**Prerequisites:**
- Tool1 must be completed for TEST001 (for adaptive questions)

**Steps:**

1. **Start Tool 2**
   - Click "Start Assessment"
   - Should load Page 1

2. **Complete All Pages**
   - Fill in all required fields
   - **Pay attention to adaptive questions on Page 5**
   - Click "Next" after each page

3. **Submit Assessment**
   - Complete final page
   - Click "Complete Assessment"
   - **Note:** May take 3-5 seconds (GPT synthesis)

4. **View Report**
   - **Verify:** Report displays with domain scores
   - **Verify:** GPT insights displayed (or fallback insights)
   - **Verify:** Source attribution shown (✨ Personalized or 📋 General)
   - **Verify:** "Download PDF" button present

**✅ PASS / ❌ FAIL:** __________

**GPT Insights Generated:** ✅ Yes / ❌ No (fallback used)

---

### Test 5.2: Edit Tool2 Response

**Purpose:** Verify edit mode with EditModeBanner for Tool2

**Steps:**

1. **Click "Edit Answers"** on Tool2 report

2. **Verify Edit Banner**
   - [ ] Edit mode banner visible
   - [ ] Shows original date
   - [ ] "Cancel Edit" button works

3. **Edit a Response**
   - Change one free-text response
   - Submit

4. **Verify Report Updated**
   - Report reflects changes
   - No errors

**✅ PASS / ❌ FAIL:** __________

---

### Test 5.3: Tool2 PDF Download

**Purpose:** Verify PDF with GPT insights

**Steps:**

1. **Download Tool2 PDF**

2. **Verify PDF Contents**
   - [ ] Domain scores included
   - [ ] GPT insights included (if generated)
   - [ ] Source attribution visible
   - [ ] Formatting correct
   - [ ] Multi-page PDF if needed

**✅ PASS / ❌ FAIL:** __________

---

## 6. Regression Testing

### Test 6.1: Dashboard Functionality

**Purpose:** Verify dashboard still works correctly

**Steps:**

1. **Login as TEST001**

2. **Verify Dashboard Display**
   - [ ] All completed tools show "View Report"
   - [ ] Completed tools show "Edit Answers"
   - [ ] Incomplete tools show "Continue" or "Start"
   - [ ] Tool unlock logic works (can't access Tool3 without Tool1+2)

3. **Test Navigation**
   - [ ] "View Report" buttons work
   - [ ] "Edit Answers" buttons work
   - [ ] "Start Assessment" buttons work
   - [ ] No white screen flashing

**✅ PASS / ❌ FAIL:** __________

---

### Test 6.2: Config Constants

**Purpose:** Verify CONFIG is used consistently

**Steps:**

1. **In Apps Script, check Code.js**
   - Search for hardcoded values like `'#ad9168'`
   - Should find NONE (or minimal)

2. **Verify CONFIG usage**
   ```javascript
   Logger.log('Primary color:', CONFIG.UI.PRIMARY_COLOR);
   Logger.log('Tool1 pages:', CONFIG.TOOLS.TOOL1.PAGES);
   ```

**Expected Result:**
- CONFIG values returned correctly
- No hardcoded colors/values in refactored code

**✅ PASS / ❌ FAIL:** __________

---

### Test 6.3: Error Handling

**Purpose:** Verify errors don't break the app

**Steps:**

1. **Test Invalid Client ID**
   - Try accessing: `[webapp-url]?route=dashboard&client=INVALID999`
   - Should show error page (not crash)

2. **Test Missing Tool**
   - Try: `[webapp-url]?route=tool99&client=TEST001`
   - Should show "Tool not found" error

3. **Test Invalid PDF Request**
   ```javascript
   try {
     PDFGenerator.generateTool1PDF('NONEXISTENT999');
   } catch (e) {
     Logger.log('Error handled:', e.message);
   }
   ```
   - Should catch error gracefully

**✅ PASS / ❌ FAIL:** __________

---

## 7. Performance Testing

### Test 7.1: Code.js Size Reduction

**Purpose:** Verify Code.js was reduced as expected

**Steps:**

1. **In Apps Script editor**
   - Open `Code.js`
   - Check line count (bottom right of editor)

2. **Verify Reduction**
   - **Before:** ~1,086 lines
   - **After:** ~696 lines
   - **Reduction:** ~36%

**Actual Line Count:** __________ lines

**✅ PASS / ❌ FAIL:** __________

---

### Test 7.2: Page Load Performance

**Purpose:** Verify refactoring didn't slow down the app

**Steps:**

1. **Open webapp in browser**
2. Open browser DevTools (F12)
3. Go to Network tab
4. Navigate to dashboard
5. Note page load time

**Dashboard Load Time:** __________ ms

**Expected:** < 2000ms (typical)

**✅ PASS / ❌ FAIL:** __________

---

## 8. Final Sign-Off Checklist

**Complete this checklist before declaring v3.9.0 production-ready:**

### Deployment
- [ ] `clasp push` completed successfully
- [ ] All files visible in Apps Script editor
- [ ] No deployment errors

### Automated Tests
- [ ] All 17 validation tests passing
- [ ] No test failures or warnings

### Shared Utilities
- [ ] EditModeBanner renders correctly
- [ ] DraftService saves/retrieves drafts
- [ ] ReportBase fetches data from RESPONSES
- [ ] ErrorHandler formats responses correctly
- [ ] Validator validates inputs correctly
- [ ] NavigationHelpers returns HTML
- [ ] PDFGenerator generates PDFs

### Tool 1 Testing
- [ ] New assessment completes successfully
- [ ] Edit mode works with EditModeBanner
- [ ] Draft save/resume works
- [ ] PDF download works
- [ ] Report displays correctly

### Tool 2 Testing
- [ ] New assessment completes successfully
- [ ] GPT insights generated (or fallback used)
- [ ] Edit mode works with EditModeBanner
- [ ] PDF with insights downloads correctly
- [ ] Adaptive questions work

### Regression Testing
- [ ] Dashboard navigation works
- [ ] CONFIG constants used correctly
- [ ] Error handling works
- [ ] No white screen issues
- [ ] No data loss

### Performance
- [ ] Code.js reduced by ~36%
- [ ] Page load times acceptable
- [ ] No performance degradation

### Documentation
- [ ] ARCHITECTURE.md updated
- [ ] TOOL-DEVELOPMENT-GUIDE.md updated
- [ ] REFACTORING_DOCUMENTATION.md exists
- [ ] This testing guide completed

---

## 9. Issue Tracking

**If you encounter issues during testing, document them here:**

### Issue 1
**Test:** ___________________________
**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low
**Description:** _____________________
**Steps to Reproduce:** ______________
**Expected:** ________________________
**Actual:** __________________________
**Status:** ⏳ Open / ✅ Resolved

### Issue 2
**Test:** ___________________________
**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low
**Description:** _____________________
**Steps to Reproduce:** ______________
**Expected:** ________________________
**Actual:** __________________________
**Status:** ⏳ Open / ✅ Resolved

*(Add more as needed)*

---

## 10. Production Deployment Decision

**After completing all tests:**

**Total Tests Passed:** _____ / 17 (automated) + _____ / 20 (manual)

**Recommendation:**

- ✅ **APPROVE for Production** - All tests passed, no critical issues
- ⚠️ **APPROVE with Caution** - Minor issues found, acceptable for production
- ❌ **DO NOT DEPLOY** - Critical issues found, needs fixes

**Sign-Off:**

**Tester:** _________________________
**Date:** ___________________________
**Time:** ___________________________
**Notes:** __________________________
______________________________________
______________________________________

---

## Appendix A: Quick Reference Commands

### Deploy Code
```bash
clasp push
```

### Run Test Suite (in Apps Script console)
```javascript
runRefactoringValidationTests();
```

### Check Draft for Client (in Apps Script console)
```javascript
const draft = DraftService.getDraft('tool1', 'TEST001');
Logger.log(draft);
```

### Clear Draft (if needed)
```javascript
DraftService.clearDraft('tool1', 'TEST001');
```

### Generate PDF Manually
```javascript
const pdf = PDFGenerator.generateTool1PDF('TEST001');
Logger.log('PDF generated');
```

### Check Config Values
```javascript
Logger.log(CONFIG.TOOLS.TOOL1);
Logger.log(CONFIG.UI.PRIMARY_COLOR);
```

---

## Appendix B: Rollback Procedure

**If critical issues are found and you need to rollback:**

### Option 1: Git Revert (Recommended)
```bash
# Find the commit before refactoring
git log --oneline

# Revert to previous commit
git checkout <commit-hash-before-refactoring>

# Deploy old version
clasp push
```

### Option 2: Use Previous Deployment
1. In Apps Script editor
2. Click "Deploy" → "Manage deployments"
3. Select previous working version
4. Click "Install add-on" or promote to HEAD

---

**End of Testing Guide**
**Version:** v3.9.0
**Last Updated:** January 7, 2025
