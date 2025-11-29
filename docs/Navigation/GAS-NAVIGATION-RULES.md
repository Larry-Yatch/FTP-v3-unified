# GAS Navigation Rules - NEVER BREAK THESE

**Created:** 2025-11-29
**Purpose:** Prevent recurring iframe navigation bugs in Google Apps Script

---

## 🚨 THE GOLDEN RULE

**NEVER use `window.location.reload()` or `window.location.href` after user interaction in Google Apps Script.**

---

## ✅ THE ONLY CORRECT PATTERN

After `google.script.run` calls following user interaction (button clicks, form submissions):

```javascript
google.script.run
  .withSuccessHandler(function(result) {
    // ✅ CORRECT - Preserves GAS iframe chain
    if (result && result.nextPageHtml) {
      document.open();
      document.write(result.nextPageHtml);
      document.close();
      window.scrollTo(0, 0);
    }
  })
  .withFailureHandler(function(error) {
    // Handle error
  })
  .serverFunction(params);
```

**Reference:** `core/FormUtils.js` lines 54-75

---

## ❌ FORBIDDEN PATTERNS

```javascript
// ❌ NEVER DO THIS - Breaks iframe chain → white screen
window.location.reload();

// ❌ NEVER DO THIS - Same problem
window.location.href = someUrl;

// ❌ NEVER DO THIS - Breaks chain
location.reload();
```

---

## 🔍 HOW TO CHECK BEFORE COMMITTING

**Before pushing ANY navigation code:**

```bash
# Search for forbidden patterns
grep -rn "window.location.reload\|location.reload" tools/

# If ANY results → FIX IMMEDIATELY
# Replace with document.write() pattern
```

---

## 📋 CHECKLIST FOR NEW NAVIGATION CODE

When adding ANY button that calls a server function:

- [ ] Does it use `google.script.run`? ✅ Good
- [ ] Does `.withSuccessHandler()` use `document.write()`? ✅ Good
- [ ] Does it include `window.scrollTo(0, 0)`? ✅ Good
- [ ] Does it use `window.location.*`? ❌ **FIX IT**
- [ ] Did you copy from FormUtils or existing working code? ✅ Good

---

## 🎯 WHEN IN DOUBT

**Copy-paste from a working example:**

1. **FormUtils pattern** - `core/FormUtils.js:54-75`
2. **Tool 1 form submission** - `tools/tool1/Tool1.js`
3. **Tool 4 profile button** - `tools/tool4/Tool4.js:1993-2011` (working)

**DO NOT write navigation code from memory - always copy from working code.**

---

## 🐛 WHY THIS HAPPENS

Google Apps Script serves web apps in sandboxed iframes. User interactions create an "iframe chain" that must be preserved for navigation to work. Using `window.location.*` breaks this chain, causing white screens.

**Technical Details:** [TEST-CURRENT-SYSTEM.md](TEST-CURRENT-SYSTEM.md#L125)

---

## 🛠️ DEBUGGING WHITE SCREENS

If you see a white screen after clicking a button:

1. **Search for the anti-pattern:**
   ```bash
   grep -n "window.location" tools/tool*/Tool*.js
   ```

2. **Compare with working code:**
   - Find a similar working button
   - Diff the two handlers
   - Copy the working pattern

3. **Don't theorize - compare and fix**

---

## 📝 COMMIT MESSAGE TEMPLATE

When fixing a navigation bug:

```
fix(toolN): Use document.write() pattern instead of window.location

Replaced window.location.reload() with document.write(result.nextPageHtml)
to preserve GAS iframe chain.

Reference: docs/Navigation/GAS-NAVIGATION-RULES.md
```

---

## 🎓 FOR CLAUDE CODE DEVELOPERS

**Before writing ANY navigation code:**

1. Read this file FIRST
2. Copy from FormUtils or working examples
3. Search for forbidden patterns before committing
4. When debugging "X works but Y doesn't", immediately diff X and Y

**Never write navigation from memory - always copy from working code.**

---

## 📍 CURRENT STATUS (2025-11-29)

### **Phase 3B Interactive Calculator - Deployed but NOT Manually Tested**

**What Was Deployed:**
- Interactive sliders for M/E/F/J bucket adjustment
- Lock/unlock functionality for individual buckets
- Proportional redistribution logic (maintains 100% sum)
- Reset to Recommended button
- Check My Plan validation
- Save Scenario functionality

**Code Compliance Check:**
- ✅ Static code analysis passed (no forbidden patterns found)
- ✅ All navigation uses correct `document.write()` pattern
- ✅ `saveScenario()` doesn't navigate (just shows alert)
- ✅ Existing `returnToDashboard()` uses correct pattern

**What Has NOT Been Done:**
- ⚠️ **MANUAL TESTING IN PRODUCTION** - This is the critical next step
- ⚠️ **User interaction flow testing** - Need to verify all buttons work
- ⚠️ **Edge case testing in GAS environment** - Local tests passed, but GAS may behave differently

### **🚨 NEXT STEPS - START HERE:**

1. **Manual Testing Checklist:**
   - [ ] Open Tool 4 in production GAS environment
   - [ ] Complete pre-survey → verify calculator loads
   - [ ] Drag each slider → verify redistribution works
   - [ ] Lock a bucket → verify it stays fixed when adjusting others
   - [ ] Click "Reset to Recommended" → verify values restore
   - [ ] Click "Check My Plan" → verify validation alert appears
   - [ ] Click "Save Scenario" → verify prompt, loading, and success message
   - [ ] Click "Return to Dashboard" → verify no white screen
   - [ ] Test on mobile device → verify responsive design works

2. **If ANY button causes white screen:**
   - Immediately run: `grep -n "window.location" tools/tool4/Tool4.js`
   - Compare the failing button handler with a working one
   - Apply the fix from this document

3. **If sliders don't update correctly:**
   - Check browser console for JavaScript errors
   - Verify element IDs match between HTML and JavaScript
   - Test normalization logic with edge cases

**Files to Monitor:**
- [tools/tool4/Tool4.js](../../tools/tool4/Tool4.js) - Lines 2124-2615 (interactive calculator)
- [test-calculator-logic.js](../../test-calculator-logic.js) - Local redistribution tests (all passing)

**Last Code Review:** 2025-11-29 (all checks passed)
**Last Deployment:** 2025-11-29 via `clasp push`
**Production Testing:** ⚠️ **NOT YET DONE - THIS IS THE PRIORITY**

---

## ⚠️ IMPORTANT: Testing Before Marking Complete

**DO NOT mark Phase 3B as complete until:**
1. Manual testing in production environment is complete
2. All interactive features verified working
3. No white screens on any button click
4. Mobile responsiveness confirmed
5. Edge cases tested (lock 3 buckets, set to 100%, etc.)

**Remember:** Code that works locally may still fail in GAS due to iframe sandboxing. Always test in production.
