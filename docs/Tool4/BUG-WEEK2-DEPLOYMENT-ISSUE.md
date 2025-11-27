# Tool 4 Week 2 Deployment Bug Report

**Date:** November 27, 2025
**Status:** UNRESOLVED
**Severity:** CRITICAL - Blocks Week 2 testing

---

## 🐛 **Bug Summary**

Tool 4 fails to render in the browser with two distinct errors:

1. **Syntax Error (Primary):**
   ```
   Uncaught SyntaxError: Failed to execute 'write' on 'Document': Unexpected string
   at line 274 of Google Apps Script internal code
   ```

2. **Reference Error (Secondary):**
   ```
   Uncaught ReferenceError: calculateSurplusAndUnlock is not defined
   at HTMLButtonElement.onclick
   ```

The page does not render at all - shows blank white screen with errors in console.

---

## 📋 **Expected Behavior**

Tool 4 should:
1. Render the Financial Freedom Framework calculator UI
2. Display input fields for income, essentials, debt, emergency fund
3. Show "Calculate Available Priorities" button that calls `window.calculateSurplusAndUnlock()`
4. Progressive unlock logic should evaluate and display 10 priorities based on financial data

---

## 🔍 **Actual Behavior**

1. Browser receives HTML from Apps Script deployment
2. HTML contains malformed JavaScript that fails to parse
3. Page crashes during document.write() execution
4. White screen with console errors
5. Functions like `calculateSurplusAndUnlock` are never defined because script fails to execute

---

## 🎯 **Root Cause Analysis**

### **Primary Issue: Template Literal Syntax Conflict**

Tool4.js uses JavaScript template literals (backticks) to build the entire HTML page:

```javascript
buildCalculatorPage(clientId, baseUrl, toolStatus) {
  const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();
  const loadingAnimation = HtmlService.createHtmlOutputFromFile('shared/loading-animation').getContent();

  return `
<!DOCTYPE html>
<html>
  ${styles}  // <-- PROBLEM: If styles contain backticks or ${}, breaks template literal
  <script>
    const clientId = '${clientId}';  // <-- PROBLEM: Evaluated during buildCalculatorPage()
    const toolStatus = ${JSON.stringify(toolStatus)};  // <-- PROBLEM: JSON may contain quotes
  </script>
</html>
  `;
}
```

**Why it breaks:**
- `shared/styles.html` or `shared/loading-animation.html` may contain backticks or `${}` in comments or CSS
- When embedded via `${styles}`, these break the outer template literal
- Tool 2/3 data in `toolStatus` may contain user-entered text with quotes/apostrophes
- `JSON.stringify(toolStatus)` embedded directly can break JavaScript syntax

### **Comparison with Working Tools (1/2/3/5)**

Other tools use a **different pattern**:

```javascript
// Tools 1/2/3/5 pattern:
render() {
  const template = HtmlService.createTemplate(
    FormUtils.buildStandardPage({...})  // Returns string with <?= ?> syntax
  );
  return template.evaluate();  // Apps Script processes <?= ?> server-side
}
```

**Key difference:**
- Tools 1/2/3/5 use **Apps Script template syntax** (`<?= ?>` and `<?!= ?>`)
- Templates are processed **server-side** by `template.evaluate()`
- Values are substituted **before** HTML is sent to browser
- `include()` directives work properly

**Tool 4's broken pattern:**
- Uses **JavaScript template literals** (`` ` ` ``)
- Templates are evaluated **during code execution** on Apps Script server
- Values are embedded **into the string** before being sent to browser
- No `include()` support, must use `.getContent()`

---

## 🔧 **Attempted Fixes (Chronological)**

### **Attempt 1: Function Scope Fix**
**Commit:** `7de19ce` - "Fix function scope - make onclick handlers globally accessible"

**Change:**
```javascript
// Before:
function calculateSurplusAndUnlock() { ... }

// After:
window.calculateSurplusAndUnlock = function() { ... };
```

**Result:** ❌ FAILED - This would fix the ReferenceError BUT the page never renders due to syntax error, so functions never execute

---

### **Attempt 2: Remove createTemplate() Call**
**Commit:** `d516ce5` - "Remove unnecessary createTemplate() call"

**Change:**
```javascript
// Before:
const template = HtmlService.createTemplate(html);
return template.evaluate();

// After:
return HtmlService.createHtmlOutput(html);
```

**Rationale:** Template is already complete string, no need for template processing

**Result:** ❌ FAILED - Same syntax error persists

---

### **Attempt 3: JSON Escaping**
**Commit:** `9276ab9` - "Add JSON escaping for safe HTML script embedding"

**Change:**
```javascript
escapeJsonForScript(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/"/g, '\\u0022');
}

// Usage:
window.toolStatus = JSON.parse('${escapedToolStatus}');
```

**Result:** ❌ FAILED - Escaping quotes inside template literal that's already inside quotes creates nested escape issues

---

### **Attempt 4: Switch to Apps Script Template Syntax**
**Commit:** `4e4a8db` - "Use Apps Script template syntax instead of JS template literals"

**Change:**
```javascript
// In buildCalculatorPage():
return `
  <?!= include('shared/styles') ?>
  <script>
    window.clientId = '<?= clientId ?>';
    window.toolStatus = <?!= toolStatusJson ?>;
  </script>
`;

// In render():
template.clientId = clientId;
template.toolStatusJson = JSON.stringify(toolStatus);
return template.evaluate();
```

**Result:** ❌ FAILED - `<?= ?>` syntax sent literally to browser, not processed by Apps Script

**Why:** `HtmlService.createTemplate(string)` doesn't process `<?= ?>` or `include()` directives when given a plain string. These only work in `.html` files or with `createTemplateFromFile()`

---

### **Attempt 5: Remove loadingAnimation Variable**
**Commit:** `391c907` - "Remove undefined loadingAnimation variable"

**Change:** Removed `${loadingAnimation}` reference since variable was undefined

**Result:** ❌ FAILED - Fixed one error but syntax error persists

---

### **Attempt 6: Restore to Last Known Working Version**
**Commit:** `1bfb0db` - "Restore working version with scope fixes only"

**Action:** Reverted to commit `7de19ce` which had scope fixes but before template experiments

**Result:** ❌ STILL FAILING - Same syntax error

**This proves:** The original code (even before our fixes) has the syntax error. The issue exists in the baseline Week 2 integration.

---

## 🔬 **Diagnostic Information**

### **Error Location**
- Error occurs at **line 274** of Google Apps Script internal code
- Error type: `SyntaxError: Failed to execute 'write' on 'Document': Unexpected string`
- This means the HTML string itself is malformed

### **Deployment Info**
- Deployment ID: `AKfycbwO6Q4Gtaja3qHr9TrOW8PmLlv2WlJpABwxn9yE0cv99kGMVlZACYrgkbPV4nSQ_rHi`
- Latest version: @248
- URL: `https://script.google.com/macros/s/AKfycbwO6Q4Gtaja3qHr9TrOW8PmLlv2WlJpABwxn9yE0cv99kGMVlZACYrgkbPV4nSQ_rHi/exec`

### **Browsers Tested**
- Chrome (incognito mode)
- Multiple hard refreshes (Cmd+Shift+R)
- New deployment URLs
- Same error across all attempts

### **What We Know**
1. ✅ Code pushes successfully to Apps Script (`clasp push`)
2. ✅ Deployments create successfully (`clasp deploy`)
3. ✅ Deployment URL is accessible
4. ❌ HTML received by browser is malformed
5. ❌ JavaScript never executes due to syntax error

### **What We Don't Know**
- Exact character/line causing the syntax error
- Whether the issue is in `shared/styles.html` or `shared/loading-animation.html`
- Whether this ever worked (Week 2 integration was never tested end-to-end)

---

## 🎯 **Recommended Next Steps**

### **Option 1: Inspect Actual HTML (RECOMMENDED)**

**Action:** View page source in browser to see the actual malformed HTML

**Steps:**
1. Open deployment URL in browser
2. Right-click → "View Page Source"
3. Search for line ~274 or look for obvious syntax errors
4. Look for unescaped quotes, unclosed tags, malformed JavaScript

**This will reveal:** The exact character sequence breaking the HTML

---

### **Option 2: Test Styles/Loading Animation Independently**

**Action:** Check if `shared/styles.html` or `shared/loading-animation.html` contain problematic characters

**Steps:**
1. Create minimal test script:
```javascript
function testStylesContent() {
  const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();
  Logger.log('Styles length: ' + styles.length);
  Logger.log('Contains backtick: ' + styles.includes('`'));
  Logger.log('Contains ${: ' + styles.includes('${'));

  const loading = HtmlService.createHtmlOutputFromFile('shared/loading-animation').getContent();
  Logger.log('Loading length: ' + loading.length);
  Logger.log('Contains backtick: ' + loading.includes('`'));
  Logger.log('Contains ${: ' + loading.includes('${'));
}
```

2. Run from Apps Script editor
3. Check if either file contains backticks or `${}`

**If yes:** These break the template literal in `buildCalculatorPage()`

---

### **Option 3: Rewrite Without Template Literals (NUCLEAR OPTION)**

**Action:** Convert entire `buildCalculatorPage()` to string concatenation

**Pros:**
- Avoids all template literal issues
- Full control over escaping
- Matches pattern of `FormUtils.buildStandardPage()` (which works)

**Cons:**
- Very tedious (800+ lines)
- Error-prone
- Loses readability

**Example:**
```javascript
buildCalculatorPage(clientId, baseUrl, toolStatus) {
  const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();

  let html = '<!DOCTYPE html>';
  html += '<html>';
  html += '<head>';
  html += styles;
  html += '<script>';
  html += 'window.clientId = "' + clientId + '";';
  html += 'window.baseUrl = "' + baseUrl + '";';
  html += 'window.toolStatus = ' + JSON.stringify(toolStatus) + ';';
  // ... 800 more lines
  return html;
}
```

---

### **Option 4: Use Separate HTML Template File**

**Action:** Move HTML to `tools/tool4/Tool4Template.html` and use `createTemplateFromFile()`

**Pattern:**
```javascript
// Tool4.js
render(params) {
  const template = HtmlService.createTemplateFromFile('tools/tool4/Tool4Template');
  template.clientId = params.clientId;
  template.baseUrl = ScriptApp.getService().getUrl();
  template.toolStatus = this.checkToolCompletion(params.clientId);
  return template.evaluate();
}

// Tool4Template.html
<!DOCTYPE html>
<html>
<head>
  <?!= include('shared/styles') ?>
</head>
<body>
  <script>
    window.clientId = '<?= clientId ?>';
    window.toolStatus = <?!= JSON.stringify(toolStatus) ?>;
  </script>
</body>
</html>
```

**Pros:**
- Uses proven Apps Script template pattern
- `include()` works properly
- Server-side template evaluation
- Matches Tools 1/2/3/5 architecture

**Cons:**
- Requires restructuring
- Need to create new `.html` file
- May need multiple template files for complex logic

---

## 📊 **Git History**

**Last known "working" state:** Unknown - Week 2 was never tested successfully

**Commits related to this bug:**
```
1bfb0db - fix(tool4): Restore working version with scope fixes only
391c907 - fix(tool4): Remove undefined loadingAnimation variable
4e4a8db - fix(tool4): Use Apps Script template syntax (FAILED)
9276ab9 - fix(tool4): Add JSON escaping (FAILED)
d516ce5 - fix(tool4): Remove unnecessary createTemplate() (FAILED)
7de19ce - fix(tool4): Fix function scope (partial fix)
dc61cb5 - fix(tool4): Add input validation and business ownership
```

**Branch:** `feature/grounding-tools`
**Commits ahead of origin:** 6 commits (unpushed)

---

## 🚨 **Impact**

**Blocking:**
- ❌ Cannot test Week 2 progressive unlock logic
- ❌ Cannot verify dynamic thresholds
- ❌ Cannot test business ownership integration
- ❌ Cannot run automated tests (Tool4Tests.js)
- ❌ Cannot proceed to Week 3-6 features

**Working (not affected):**
- ✅ Week 2 code logic is correct (priorities, weights, unlock requirements)
- ✅ Tool4Tests.js automated tests exist and are comprehensive
- ✅ All other tools (1/2/3/5) work fine
- ✅ Documentation is complete

---

## 💡 **Key Insight**

**The fundamental issue:** Tool 4 uses a **different HTML generation pattern** than Tools 1/2/3/5.

- **Tools 1/2/3/5:** Multi-page forms using `FormUtils.buildStandardPage()` → Apps Script templates
- **Tool 4:** Single-page calculator using JavaScript template literals → Direct HTML output

**This difference** is likely why the syntax error exists - the template literal approach is incompatible with embedding HTML content that may contain special characters.

---

## 📝 **Files Involved**

- `/tools/tool4/Tool4.js` (lines 87-850 - `buildCalculatorPage()`)
- `/shared/styles.html` (embedded content)
- `/shared/loading-animation.html` (embedded content)
- `/tests/Tool4Tests.js` (automated tests - ready to run once bug fixed)

---

## 🎬 **Recommended Starting Point for New Session**

1. **View page source** to identify exact syntax error
2. **Check if styles/loading contain backticks** using test script above
3. **Choose approach:**
   - If backticks found → Option 4 (separate template file)
   - If no backticks → Option 1 (inspect HTML further)
4. **Test incrementally** - start with minimal HTML and add sections until it breaks
5. **Use automated tests** once page renders

---

**Good luck with the fresh eyes approach! 🍀**
