# Pre-Deployment Checklist

**Purpose:** Run this checklist before EVERY deployment to catch navigation bugs

---

## 🚀 Before Running `clasp push`

### **Step 1: Run Automated Validation**

In Google Apps Script editor, run:

```javascript
runAllValidations();
```

**Required Result:** `status: 'PASS'` or `status: 'PASS_WITH_WARNINGS'`

- [ ] ✅ All critical checks passed
- [ ] ⚠️ Reviewed all warnings (if any)
- [ ] ❌ If FAIL status: **STOP - Fix issues before deploying**

---

### **Step 2: Quick Code Review**

Review your changes for navigation pattern violations:

#### **Navigation Pattern Check**
- [ ] No `window.location` used after `document.write()` pages
- [ ] All dashboard ↔ report navigation uses `getReportPage()` + `document.write()`
- [ ] All form → dashboard navigation uses `navigateToDashboard()`
- [ ] Logout uses `window.top.location.replace()`

#### **JavaScript Scope Check**
- [ ] All inline `<script>` tags wrapped in IIFE: `(function(){...})()`
- [ ] No duplicate `const` declarations across pages
- [ ] Global functions exposed via `window.functionName = ...`

#### **Type Safety Check**
- [ ] Boolean checks use `ResponseManager._isTrue(value)`
- [ ] Dropdown comparisons use `String(value) === String(selected)`
- [ ] Numeric values parsed with `parseInt(value, 10)`

#### **Loading Indicators Check**
- [ ] All navigation buttons call `showLoading('message')`
- [ ] All `google.script.run` calls have `.withFailureHandler()`
- [ ] Failure handlers call `hideLoading()`

---

### **Step 3: Manual Spot Check**

If you changed navigation code, test these flows:

- [ ] Login → Dashboard (no white screen)
- [ ] Dashboard → View Report → Dashboard → View Report **again** (critical!)
- [ ] Dashboard → Edit → Submit → Dashboard (no white screen)
- [ ] Dashboard → Logout → Login (full reset)

---

### **Step 4: Git Commit Message**

Use clear commit messages following pattern:

```
feat: Add [feature name]
fix: Fix [bug description]
docs: Update [documentation]
refactor: Refactor [component]
test: Add [test description]
```

Include in commit message:
- What changed
- Why it changed
- Which deploy number (if deployed)

---

## 📦 Deployment Commands

### **Standard Deployment**

```bash
# 1. Push code
clasp push

# 2. Deploy new version
clasp deploy --description "v3.3.0 - [Your description]"

# 3. Note the deployment ID
# Example output: Created version 50 @50
```

### **Quick Deploy (Updates Existing)**

```bash
# Update head deployment
clasp push
# Changes take effect immediately on existing web app URL
```

---

## ✅ Post-Deployment Verification

After deploying, verify:

- [ ] Web app URL loads (no errors)
- [ ] Login with TEST001 works
- [ ] Dashboard loads correctly
- [ ] Your changes are visible
- [ ] No console errors (open browser DevTools)

---

## 🚨 Emergency Rollback

If deployment breaks production:

```bash
# 1. Find previous working deployment
clasp deployments

# 2. Redeploy specific version
clasp deploy --deploymentId [WORKING_DEPLOYMENT_ID] --description "Rollback to working version"

# 3. Update web app to use that deployment in Apps Script console
```

---

## 📋 Deployment Log Template

Keep a log of deployments:

```
Date: _______________
Version: v3.3.___
Deploy #: @___
Changes:
- ___________________________________
- ___________________________________

Validation: □ PASS  □ FAIL
Manual Test: □ PASS  □ FAIL
Production Status: □ WORKING  □ BROKEN

Issues Found: _______________________
Rollback Required: □ YES  □ NO
```

---

## 🎯 Quick Checklist Summary

**Before EVERY deploy:**

1. [ ] Run `runAllValidations()` - MUST PASS
2. [ ] Review code for navigation patterns
3. [ ] Check variable scoping (IIFE)
4. [ ] Check type safety
5. [ ] Test critical navigation flows
6. [ ] Write clear commit message
7. [ ] Push code: `clasp push`
8. [ ] Deploy: `clasp deploy --description "..."`
9. [ ] Verify in production
10. [ ] Monitor for errors

**If ANY step fails:** Fix before deploying!

---

**Remember:** Navigation bugs cause white screens. Double-check navigation patterns!

**When in doubt:** Check Tool 1 implementation or `NAVIGATION-CHECKLIST.md`

---

**Created by:** Agent Girl
**For Version:** v3.3.0+
**Status:** Required for all deployments
