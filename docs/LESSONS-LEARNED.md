# FTP-v3 Lessons Learned

**Last Updated:** 2025-12-01
**Purpose:** Capture design decisions, bugs, and patterns discovered during development

---

## Navigation in Google Apps Script

### The Core Problem

Google Apps Script runs inside an iframe sandbox. Chrome requires a **user gesture** (recent click) for top-level navigation. Async callbacks lose this gesture.

### What Didn't Work

**Async navigation pattern:**
```javascript
// User clicks button
google.script.run
  .withSuccessHandler(function(result) {
    window.location.href = url;  // FAILS - gesture expired during async wait
  })
  .doSomething();
```

**Error:** `Unsafe attempt to initiate navigation... has no user activation`

### What Works

**Pattern 1: document.write() for SPA-like navigation**
```javascript
google.script.run
  .withSuccessHandler(function(html) {
    document.open();
    document.write(html);
    document.close();
  })
  .getPageHtml(clientId);
```
- No navigation = no gesture requirement
- Faster UX (no page reload)
- Used for: dashboard, reports, tool pages

**Pattern 2: Immediate navigation with URL parameters**
```javascript
// Navigate IMMEDIATELY (preserves gesture)
function editResponse() {
  window.top.location.href = baseUrl + '?editMode=true';
}

// Execute action AFTER navigation (on page load)
if (params.editMode === 'true') {
  DataService.loadResponseForEditing(clientId, toolId);
}
```
- Used for: edit mode, retake, form transitions

**Pattern 3: window.top.location.href to break out of iframe**
```javascript
// After document.write(), regular navigation fails
window.location.href = url;      // WHITE SCREEN

// Must use window.top to escape iframe context
window.top.location.href = url;  // Works
```

### The Navigation Rules

1. **document.write() chains must continue** - Once you start, keep using it
2. **Breaking out requires window.top** - Regular window.location fails in iframe
3. **Navigation must be synchronous** - No async callbacks before navigation
4. **Server actions execute AFTER navigation** - Via URL parameters

---

## Template Literals and String Escaping

### The Core Problem

Tool code uses JavaScript template literals to generate HTML. User data or embedded files can break the template.

### What Didn't Work

**Direct JSON embedding:**
```javascript
const html = `<script>const data = ${JSON.stringify(userData)};</script>`;
// If userData contains quotes or backticks, template breaks
```

**Escaped apostrophes in generated JavaScript:**
```javascript
message: 'You\'re at ' + value + '%'
// Double-escaping in document.write() causes: Unexpected identifier 're'
```

### What Works

**Base64 encoding for JSON:**
```javascript
// Server-side
const dataBase64 = Utilities.base64Encode(JSON.stringify(userData));
const html = `<script>const data = JSON.parse(atob('${dataBase64}'));</script>`;

// Client-side decodes safely
```

**Avoid contractions in generated code:**
```javascript
// BAD
message: 'You\'re at ' + value + '%. Don\'t exceed 50%.'

// GOOD
message: 'You are at ' + value + '%. Do not exceed 50%.'
```

**Use server-side template variables for URLs:**
```javascript
// GOOD - evaluated at render time
window.top.location.href = '${baseUrl}?route=dashboard'

// BAD - depends on client-side variable existing
window.top.location.href = BASE_URL + '?route=dashboard'
```

---

## Data Persistence

### The Core Problem

Multiple tools save responses. Edit mode and reports need to find the "current" version reliably.

### What Didn't Work

**Manual sheet saves:**
```javascript
const row = [timestamp, clientId, toolId, data, version, status];
sheet.appendRow(row);  // Missing Is_Latest column - breaks version control
```

**Case-sensitive boolean checks:**
```javascript
if (data[i][col] === 'true') { ... }  // Fails - Sheets stores "TRUE"
```

### What Works

**Always use DataService.saveToolResponse():**
```javascript
DataService.saveToolResponse(clientId, toolId, {
  data: formData,
  results: results
});
// Automatically manages Is_Latest column
// Only ONE row per client/tool has Is_Latest = true
```

**Type-coerce booleans:**
```javascript
_isTrue(value) {
  return value === 'true' || value === 'TRUE' || value === true;
}
```

**Extract formData before spreading:**
```javascript
// Response structure: {formData: {...}, scores: {...}}
const formFields = responseData.formData || responseData;
const editData = { ...formFields, _editMode: true };
```

---

## google.script.run Edge Cases

### What Didn't Work

**Assuming result is always an object:**
```javascript
.withSuccessHandler(function(result) {
  if (result.success) { ... }  // Crashes if result is null
})
```

### What Works

**Always null-check:**
```javascript
.withSuccessHandler(function(result) {
  if (!result) {
    alert('Server returned no data. Please refresh.');
    return;
  }
  // ... rest of logic
})
```

---

## Code Organization

### What Didn't Work

**Tool4 grew to 4,807 lines** by:
- Reinventing form handling (FormUtils already existed)
- Reinventing loading UI (shared/loading-animation.html already existed)
- Inline HTML/CSS/JS instead of using buildStandardPage()
- Dead code from abandoned approaches

### What Works

**Use shared infrastructure:**
- FormUtils.js for multi-page forms
- loading-animation.html for loading states
- DataService for persistence
- PDFGenerator for reports

**Comparison:**
| Tool | Lines | Approach |
|------|-------|----------|
| Tool1 | 697 | Uses FormUtils |
| Tool4 | 4,807 | Custom everything |

**Lesson:** Check for existing patterns before writing custom code.

---

## Testing

### What Didn't Work

**Test files duplicating production logic:**
```javascript
// Test file had its own simulateUnlock() that duplicated Tool4.js
// When Tool4.js was fixed, tests still passed but tested WRONG logic
```

### What Works

**Tests should call production code, not simulate it:**
```javascript
// Call the actual function
const result = Tool4.checkEnjoyUnlock(testData);
expect(result).toBe(true);
```

**Or clearly document simulation-based tests:**
```javascript
// SIMULATION: Mirrors Tool4.js v261 logic
// Update if Tool4.js changes
function simulateUnlock(data) { ... }
```

---

## GPT Integration

### What Works

**3-tier fallback for reliability:**
```
TIER 1: Try GPT → Success? Return insight
  ↓
TIER 2: Retry after 2s → Success? Return insight
  ↓
TIER 3: Score-aware fallback → Always succeeds
```

**Background processing during form completion:**
- User fills out form (20-30 seconds)
- GPT analyzes in background
- By submission, insights ready
- User waits ~3 seconds max (final synthesis only)

**Cost management:**
- gpt-4o-mini for individual analyses (~$0.0025 each)
- gpt-4o for synthesis (~$0.003)
- Total per student: ~$0.02-0.03

---

## Design Decisions That Worked

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| document.write() SPA pattern | Avoids iframe navigation issues | Zero white screens |
| URL parameters for server actions | Preserves user gesture | Edit/retake works reliably |
| DataService abstraction | Single source of truth | Clean version control |
| FormUtils for all tools | Consistent patterns | Fast tool development |
| Tool-specific GPT files | No god object | Easy to test/modify |
| 3-tier GPT fallback | 100% reliability | Never blocks user |

---

## Design Decisions We Skipped

| Feature | Why Skipped | Alternative |
|---------|-------------|-------------|
| Progressive Priority Unlock | Added complexity without proportional value | Validation warnings guide users |
| Phase 4C bucket-level indicators | Polish, not essential | Current validation UI sufficient |
| Centralized GPT service | Would become god object | Tool-specific GPT files |

---

## Recurring Themes

1. **Async is the enemy of certainty** - Navigation must be synchronous in GAS iframe
2. **Template literals are dangerous** - Always encode user data
3. **Use existing infrastructure** - Don't reinvent FormUtils, DataService, etc.
4. **Version control must be automatic** - Manual Is_Latest management fails
5. **Tests must use production code** - Duplicated logic drifts

---

## Quick Reference: Common Mistakes

| Mistake | Fix |
|---------|-----|
| `window.location.href` after document.write() | Use `window.top.location.href` |
| Navigate in async callback | Navigate immediately, pass params in URL |
| `sheet.appendRow()` for responses | Use `DataService.saveToolResponse()` |
| `data === 'true'` | Use `data === 'true' \|\| data === 'TRUE'` |
| Escaped apostrophes in template literals | Use full words or double quotes |
| JSON.stringify in template | Base64 encode first |
| Custom form handling | Use FormUtils.buildStandardPage() |
