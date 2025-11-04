# V3 Validation Checklist
## Comparing V2 (Working) vs V3 (New)

---

## ✅ ARCHITECTURE COMPARISON

### **V2 Pattern (Working):**
- Simple routing: Check route → Load tool directly
- No registry: Tools called by name directly
- Full page navigation: `window.top.location.href`
- No validation layers
- Direct database access

### **V3 Pattern (New):**
- Registry-based routing: Route → Registry → Tool
- Tool registration required
- Multiple validation layers
- Framework initialization
- Abstracted data access

### **Key Differences to Validate:**
1. ✅ Tool must be registered in ToolRegistry
2. ✅ Manifest must have required fields
3. ✅ Navigation must use window.top
4. ⏳ Tool must implement ToolInterface methods
5. ⏳ Router must pass correct params format
6. ⏳ Forms must POST to correct handlers

---

## 🔍 VALIDATION CHECKS

### **1. Tool Registration (CRITICAL)**

**Check:** Is Tool1 actually registering?
```javascript
// In Code.js registerTools():
console.log('Registering Tool1...');
const result = ToolRegistry.register('tool1', Tool1, tool1Manifest);
console.log('Registration result:', result);
```

**Validate:**
- [ ] Tool1 object exists in global scope
- [ ] Manifest has all required fields: id, name, version, pattern
- [ ] routes array is defined
- [ ] ToolInterface validation passes
- [ ] No console errors during registration

---

### **2. Route Resolution (CRITICAL)**

**Check:** Does route 'tool1' find the tool?
```javascript
// In Router.js:
console.log('Looking for route:', route);
const tool = ToolRegistry.findByRoute(route);
console.log('Found tool:', tool ? tool.id : 'NOT FOUND');
```

**Validate:**
- [ ] Route matches manifest.routes array
- [ ] findByRoute() checks both routes array and /${toolId} pattern
- [ ] Tool object is returned (not null)

---

### **3. Navigation Pattern (CRITICAL)**

**Check:** All navigation uses window.top.location
```bash
# Should return ONLY window.top.location.href
grep -r "location\.href" core/ --exclude="*window.top*"
```

**Validate:**
- [ ] Login → Dashboard: window.top.location.href
- [ ] Dashboard → Tool: window.top.location.href
- [ ] Tool → Next page: window.top.location.href (or POST)
- [ ] Back buttons: window.top.location.href
- [ ] NO bare location.href anywhere

---

### **4. Form Submission (CRITICAL)**

**Check:** Forms POST to correct handler
```javascript
// In Tool1.js forms:
<form method="POST" action="${ScriptApp.getService().getUrl()}">
  <input type="hidden" name="route" value="tool1_submit">
```

**Validate:**
- [ ] All forms have method="POST"
- [ ] All forms have correct action URL
- [ ] All forms have route parameter
- [ ] doPost() handler exists in Code.js
- [ ] doPost() routes to correct tool method

---

### **5. Parameter Passing (IMPORTANT)**

**Check:** Router passes params correctly to tool
```javascript
// Router._loadTool should pass:
{
  clientId: params.client || params.clientId,
  sessionId: params.session || params.sessionId,
  page: parseInt(params.page) || 1,
  insights: [...],
  adaptations: {...}
}
```

**Validate:**
- [ ] clientId is passed through all navigation
- [ ] page parameter is parsed as integer
- [ ] Tool.render() receives correct format
- [ ] Tool can access all needed params

---

### **6. Tool Interface Compliance**

**Check:** Tool1 implements required methods
```javascript
// Required by ToolInterface:
Tool1.render(params)      // REQUIRED
Tool1.handleSubmit(data)  // If tool has forms
```

**Validate:**
- [ ] Tool1.render() exists and returns HtmlOutput
- [ ] Tool1.render() sets XFrameOptionsMode.ALLOWALL
- [ ] Tool1.handleSubmit() exists for form handling
- [ ] Methods match interface signature

---

### **7. Data Storage Paths**

**Check:** Save/load functions work
```javascript
// PropertiesService for drafts
PropertiesService.getUserProperties().setProperty(key, value)

// Sheets for final data
SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
```

**Validate:**
- [ ] Draft key format: `tool1_draft_{clientId}`
- [ ] Draft saves to PropertiesService
- [ ] Final saves to RESPONSES sheet
- [ ] Column headers match data structure
- [ ] JSON stringify/parse works correctly

---

### **8. Report Generation**

**Check:** Report page loads after submission
```javascript
// After final submission:
window.top.location.href = '?route=tool1_report&client=${clientId}'
```

**Validate:**
- [ ] tool1_report is in Router system routes
- [ ] Tool1Report.render() is called
- [ ] Report retrieves data from RESPONSES sheet
- [ ] PDF generation works
- [ ] Download triggers correctly

---

## 🚨 COMMON V2 → V3 MIGRATION ISSUES

### **Issue #1: Missing Global Objects**
**V2:** Everything in global scope
**V3:** Objects must be loaded/registered
**Fix:** Ensure Tool1, Tool1Report, Tool1Templates are global

### **Issue #2: Route Format Mismatch**
**V2:** Route = 'tool' (singular)
**V3:** Route = 'tool1', 'tool2' (with number)
**Fix:** Manifest.routes must match URL route exactly

### **Issue #3: Iframe vs Full Page**
**V2:** Always full page navigation
**V3:** Mixed - caused X-Frame-Options errors
**Fix:** Always use window.top.location.href

### **Issue #4: Manifest Validation**
**V2:** No validation
**V3:** Strict validation with required fields
**Fix:** Include id, name, version, pattern, routes

### **Issue #5: Parameter Format**
**V2:** Direct access to e.parameter
**V3:** Wrapped in params object
**Fix:** Extract from params consistently

---

## 📝 PRE-DEPLOYMENT CHECKLIST

Before creating a new deployment:

### **Code Checks:**
- [ ] Run: `grep -r "location\.href" --exclude-dir=node_modules` - should find only window.top
- [ ] Check: All forms have method="POST"
- [ ] Check: All forms have route parameter
- [ ] Verify: Tool manifest has pattern field
- [ ] Verify: Tool manifest has routes array

### **Manual Testing:**
- [ ] Login works
- [ ] Dashboard loads
- [ ] Tool button navigates (no iframe error)
- [ ] Tool page 1 displays
- [ ] Form submits to page 2
- [ ] Continue through all pages
- [ ] Final submission redirects to report
- [ ] Report displays scores
- [ ] PDF downloads

### **Database Checks:**
- [ ] CONFIG.MASTER_SHEET_ID is correct
- [ ] RESPONSES sheet exists
- [ ] Column headers match expected format
- [ ] Data saves correctly

---

## 🔧 QUICK VALIDATION SCRIPT

Run this in Google Apps Script to validate setup:

```javascript
function validateSetup() {
  console.log('=== VALIDATION START ===\n');

  // 1. Check Tool1 exists
  console.log('1. Tool1 object:', typeof Tool1);
  console.log('   - render method:', typeof Tool1.render);
  console.log('   - handleSubmit:', typeof Tool1.handleSubmit);

  // 2. Register tools
  console.log('\n2. Registering tools...');
  registerTools();

  // 3. Check registry
  console.log('\n3. Registry check:');
  console.log('   - Tool count:', ToolRegistry.count());
  console.log('   - Tool1 registered:', ToolRegistry.isRegistered('tool1'));

  // 4. Check route resolution
  console.log('\n4. Route resolution:');
  const tool = ToolRegistry.findByRoute('tool1');
  console.log('   - Found tool:', tool ? tool.id : 'NOT FOUND');
  if (tool) {
    console.log('   - Tool name:', tool.manifest.name);
    console.log('   - Tool pattern:', tool.manifest.pattern);
  }

  // 5. Check config
  console.log('\n5. Configuration:');
  console.log('   - Sheet ID:', CONFIG.MASTER_SHEET_ID);
  console.log('   - Web App URL:', ScriptApp.getService().getUrl());

  console.log('\n=== VALIDATION END ===');
}
```

---

## 🎯 PRIORITY FIXES (If Found)

### **High Priority:**
1. Tool not registering → Add missing manifest fields
2. Route not found → Check routes array matches URL
3. Iframe errors → Change to window.top.location.href
4. Form not submitting → Check POST handler exists

### **Medium Priority:**
5. Data not saving → Check PropertiesService keys
6. Report not loading → Check tool1_report route
7. PDF not downloading → Check generateTool1PDF function

### **Low Priority:**
8. Styling issues → CSS fixes
9. Progress tracking → UI enhancements
10. Performance → Optimization

---

**Created:** November 3, 2024
**Purpose:** Prevent deployment issues by systematic validation
**Based on:** V2 working patterns
