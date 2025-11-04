# Tool Development Patterns - Financial TruPath v3

**Version:** 1.0
**Last Updated:** November 3, 2024
**Status:** ✅ Production Ready

---

## 🎯 **Purpose**

This document defines the **standard patterns** for building multi-page form-based tools in Financial TruPath v3. Following these patterns ensures:

- ✅ **No navigation issues** - Uses google.script.run + GET (avoids POST iframe sandbox)
- ✅ **Consistent UX** - All tools look and behave the same
- ✅ **Auto-save/resume** - Never lose user data
- ✅ **Proper error handling** - Graceful failures with user feedback
- ✅ **Easy maintenance** - Standard structure across all tools

---

## 📋 **Quick Start: Building a New Tool**

### **1. Use the Template**

```bash
cp tools/MultiPageToolTemplate.js tools/tool2/Tool2.js
```

### **2. Find & Replace**

- `ToolN` → `Tool2`
- `toolN` → `tool2`
- Update tool name, pages, questions

### **3. Register Tool**

In `Code.js`, add to `registerTools()`:

```javascript
const tool2Manifest = {
  id: "tool2",
  version: "1.0.0",
  name: "Your Tool Name",
  pattern: "multi-phase",
  route: "tool2",
  routes: ["/tool2"],
  description: "Description here",
  icon: "📊",
  estimatedTime: "10-15 minutes",
  sections: 3,
  dependencies: ["tool1"],
  unlocks: ["tool3"]
};

Tool2.manifest = tool2Manifest;
ToolRegistry.register('tool2', Tool2, tool2Manifest);
```

### **4. Test**

```
https://your-gas-url.com/exec?route=tool2&client=TEST001
```

---

## 🏗️ **Architecture Overview**

### **The Foundation Stack**

```
┌─────────────────────────────────────────┐
│  Your Tool (Tool2.js)                   │
│  - Defines pages & content              │
│  - Business logic                        │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│  FormUtils.js (Reusable Framework)      │
│  - Form submission (google.script.run)  │
│  - Page structure                        │
│  - Error handling                        │
│  - Loading animations                    │
└──────────────┬──────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────┐
│  Code.js (Server-Side Handlers)         │
│  - saveToolPageData(toolId, data)       │
│  - completeToolSubmission(toolId, data) │
└─────────────────────────────────────────┘
```

---

## 📐 **Standard Tool Structure**

Every tool follows this structure:

```javascript
const ToolN = {
  manifest: null,

  // REQUIRED: Render pages
  render(params) { ... },

  // REQUIRED: Route to page content
  renderPageContent(page, data, clientId) { ... },

  // REQUIRED: Save page data
  savePageData(clientId, page, formData) { ... },

  // REQUIRED: Process final submission
  processFinalSubmission(clientId) { ... },

  // OPTIONAL: Helper methods
  getExistingData(clientId) { ... },
  processResults(data) { ... },
  saveToResponses(...) { ... }
};
```

---

## 🔄 **Form Submission Flow**

### **Page Navigation (Pages 1-N)**

```
User fills form → Clicks "Continue"
  ↓
FormUtils.submitToolPage() intercepts
  ↓
google.script.run.saveToolPageData('toolN', data)
  ↓
Server: Code.js → ToolN.savePageData()
  ↓
Success callback: window.top.location.href (GET)
  ↓
Next page loads ✅
```

### **Final Submission (Last Page)**

```
User fills final page → Clicks "Submit"
  ↓
FormUtils.submitFinalPage() intercepts
  ↓
google.script.run.completeToolSubmission('toolN', data)
  ↓
Server: Code.js → ToolN.processFinalSubmission()
  ↓
Returns {redirectUrl: 'report_url'}
  ↓
Client navigates to report ✅
```

---

## ✅ **Do's and Don'ts**

### **✅ DO**

1. **Use FormUtils.buildStandardPage()** for all pages
2. **Return only form fields** from renderPageContent()
3. **Use google.script.run** for all form submissions
4. **Return {redirectUrl}** from processFinalSubmission()
5. **Save drafts** in PropertiesService
6. **Throw errors** for problems (Code.js handles them)
7. **Log important events** with Logger.log()

### **❌ DON'T**

1. **❌ Use POST forms** - Causes iframe sandbox errors
2. **❌ Return HtmlOutput** from processFinalSubmission()
3. **❌ Hardcode URLs** - Use ScriptApp.getService().getUrl()
4. **❌ Use location.href** - Always use window.top.location.href
5. **❌ Skip error handling** - Always use try/catch
6. **❌ Forget to unlock next tool** - Call ToolAccessControl.adminUnlockTool()
7. **❌ Mix patterns** - Use FormUtils consistently across all pages

---

## 📝 **Page Content Guidelines**

### **What to Return from renderPageContent()**

```javascript
// ✅ GOOD - Just the form fields
renderPage1Content(data, clientId) {
  return `
    <h2>Title</h2>
    <p class="muted">Instructions</p>

    <div class="form-group">
      <label class="form-label">Question *</label>
      <input type="text" name="answer" required>
    </div>
  `;
}

// ❌ BAD - Includes <form> tag, buttons, etc.
renderPage1Content(data, clientId) {
  return `
    <form method="POST" action="...">  ← NO!
      ...
      <button type="submit">Submit</button>  ← NO!
    </form>
  `;
}
```

FormUtils automatically wraps your content in:
- `<form>` tag with proper onsubmit handler
- Progress bar
- Submit button with correct text
- Hidden fields (client, page)

---

## 🎨 **Custom Validation**

For complex forms (like ranking grids), add custom validation:

### **1. Add validation script to page content:**

```javascript
renderPage3Content(data, clientId) {
  return `
    <h2>Rankings</h2>
    ...form fields...

    <script>
      function validateMyForm() {
        // Your validation logic
        if (somethingWrong) {
          alert('Error message');
          return false;
        }
        return true;
      }
    </script>
  `;
}
```

### **2. Pass validation function name to FormUtils:**

```javascript
render(params) {
  ...
  FormUtils.buildStandardPage({
    ...
    isFinalPage: (page === 3),
    customValidation: (page === 3) ? 'validateMyForm' : null
  })
}
```

FormUtils will call your function before submission.

---

## 💾 **Data Persistence Pattern**

### **Draft Storage (PropertiesService)**

```javascript
savePageData(clientId, page, formData) {
  const userProperties = PropertiesService.getUserProperties();
  const draftKey = `tool2_draft_${clientId}`;

  let draftData = {};
  const existing = userProperties.getProperty(draftKey);
  if (existing) {
    draftData = JSON.parse(existing);
  }

  // Merge new data
  Object.assign(draftData, formData);
  draftData.lastPage = page;
  draftData.lastUpdate = new Date().toISOString();

  userProperties.setProperty(draftKey, JSON.stringify(draftData));
}
```

**Benefits:**
- User can close browser and resume later
- Auto-saves after each page
- No database writes until final submission

### **Final Storage (RESPONSES Sheet)**

```javascript
saveToResponses(clientId, formData, results) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

  sheet.appendRow([
    new Date().toISOString(),  // Timestamp
    clientId,                  // Client_ID
    'tool2',                   // Tool_ID
    JSON.stringify({           // Data (JSON blob)
      formData: formData,
      results: results
    }),
    '1.0.0',                   // Version
    'COMPLETED'                // Status
  ]);
}
```

---

## 🔓 **Tool Unlocking Pattern**

After completing a tool, unlock the next one:

```javascript
processFinalSubmission(clientId) {
  ...
  // Save results
  this.saveToResponses(...);

  // Unlock next tool
  ToolAccessControl.adminUnlockTool(
    clientId,
    'tool3',              // Next tool ID
    'system',             // Admin (use 'system' for auto-unlock)
    'Auto-unlocked after Tool 2 completion'
  );

  return {redirectUrl: reportUrl};
}
```

---

## 📊 **Report Page Pattern**

Create a separate report file `ToolNReport.js`:

```javascript
const Tool2Report = {
  render(clientId) {
    const results = this.getResults(clientId);

    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tool 2 Results</title>
        <?!= include('shared/styles') ?>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1>Your Results</h1>
            <p>Score: ${results.score}</p>
            ...
          </div>
        </div>
      </body>
      </html>
    `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  getResults(clientId) {
    // Query RESPONSES sheet
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    // Find latest tool2 entry for this client
    ...
  }
};
```

Register report route in `Router.js`:

```javascript
case 'tool2_report':
  return Tool2Report.render(params.client || params.clientId);
```

---

## 🧪 **Testing Checklist**

Before deploying a new tool:

- [ ] **Page 1** loads correctly
- [ ] **Page 1 → 2** navigation works
- [ ] **All pages** can be navigated
- [ ] **Final page** submits successfully
- [ ] **Report page** displays results
- [ ] **Resume** from middle page works
- [ ] **Validation** catches errors properly
- [ ] **Next tool** unlocks after completion
- [ ] **RESPONSES sheet** receives data
- [ ] **No POST errors** in browser console

---

## 🚀 **Deployment Workflow**

```bash
# 1. Create tool files
cp tools/MultiPageToolTemplate.js tools/tool2/Tool2.js

# 2. Customize tool
# Edit Tool2.js...

# 3. Register in Code.js
# Add to registerTools()...

# 4. Push to GAS
clasp push

# 5. Test
# Visit: ?route=tool2&client=TEST001

# 6. Deploy new version
clasp deploy --description "v3.x.x - Added Tool 2"
```

---

## 📚 **Reference Files**

| File | Purpose |
|------|---------|
| `core/FormUtils.js` | Reusable form handling utilities |
| `tools/MultiPageToolTemplate.js` | Template for new tools |
| `tools/tool1/Tool1.js` | Working example (5 pages) |
| `Code.js` | Server-side handlers |
| `TOOL-DEVELOPMENT-PATTERNS.md` | This document |

---

## 🆘 **Common Issues & Solutions**

### **Issue: "SecurityError: Blocked a frame with origin..."**

**Cause:** Using POST form submission
**Fix:** Use FormUtils pattern (google.script.run + GET)

### **Issue: Form doesn't submit**

**Cause:** Missing `return false;` in onsubmit
**Fix:** FormUtils handles this automatically

### **Issue: Lost data between pages**

**Cause:** Not calling savePageData()
**Fix:** Use FormUtils.submitToolPage() - it calls saveToolPageData()

### **Issue: "Tool not found" error**

**Cause:** Tool not registered
**Fix:** Add to registerTools() in Code.js

### **Issue: Can't navigate to next tool**

**Cause:** Forgot to unlock next tool
**Fix:** Call ToolAccessControl.adminUnlockTool() in processFinalSubmission()

---

## 💡 **Best Practices**

1. **Start with the template** - Don't build from scratch
2. **Test early, test often** - Check each page as you build
3. **Use consistent naming** - toolN, ToolN, tool_n_draft
4. **Log important events** - Makes debugging easier
5. **Handle errors gracefully** - Show user-friendly messages
6. **Keep pages focused** - One concept per page
7. **Provide clear instructions** - Users should know what to do
8. **Show progress** - Progress bar is automatic with FormUtils
9. **Allow resume** - Draft storage is automatic
10. **Document custom logic** - Explain complex algorithms

---

## 🎓 **Learning Path**

1. **Read this document** ✅
2. **Study Tool1.js** - Working 5-page example
3. **Copy MultiPageToolTemplate.js** - Start Tool 2
4. **Customize for your needs** - Questions, logic, etc.
5. **Test thoroughly** - Use TEST001 user
6. **Deploy** - clasp push & deploy
7. **Iterate** - Gather feedback, improve

---

## 📞 **Getting Help**

**Questions?** Check these resources:

1. This document
2. `tools/tool1/Tool1.js` - Working example
3. `tools/MultiPageToolTemplate.js` - Commented template
4. `core/FormUtils.js` - Read the source
5. Git commit history - See how issues were fixed

---

**Created:** November 3, 2024
**Author:** Agent Girl
**Status:** ✅ Production Ready - Use this for Tool 2+

**Happy Building! 🚀**
