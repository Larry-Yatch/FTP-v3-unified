# Tool Development Guide - Financial TruPath v3

**Last Updated:** January 7, 2025
**Version:** v3.9.0
**For:** Building Tools 3-8

---

## 🎯 Purpose

This guide provides **everything you need** to build a new tool in the v3 framework, based on proven patterns from Tool 1 and Tool 2.

**⚡ NEW in v3.9.0:** Major refactoring completed! This guide now includes:
- 7 new shared utilities to eliminate code duplication
- Updated patterns using EditModeBanner, DraftService, ReportBase
- ErrorHandler and Validator patterns for consistency
- NavigationHelpers and PDFGenerator utilities
- CONFIG constant usage (no more hardcoded values!)

**What's Included:**
- Multi-page form patterns (with FormUtils)
- GPT integration (when/how to use)
- Adaptive questions (pulling from previous tools)
- Scale standards (-5 to +5, no zero)
- Draft auto-save and resume
- Report generation patterns
- Complete working code templates

---

## 📚 Before You Start

### **Read First:**
1. **ARCHITECTURE.md** - Understand the framework and shared utilities
2. **REFACTORING_DOCUMENTATION.md** - Learn about the 7 new shared utilities
3. **Tool 1 code** (`tools/tool1/Tool1.js`) - Pure algorithmic example
4. **Tool 2 code** (`tools/tool2/Tool2.js`) - Hybrid (algo + GPT) example

### **Reference During Development:**
- **Shared Utilities** (`/shared/` directory) - Reusable components for all tools
- **TOOL2-QUESTION-MASTER-LIST.md** - Scale labeling examples
- **MultiPageToolTemplate.js** - Working code template
- **FormUtils.js** - Form helper functions
- **Config.js** - Use CONFIG constants instead of hardcoded values

---

## 🛠️ Shared Utilities (NEW in v3.9.0)

The v3 framework now provides **7 shared utilities** to eliminate code duplication and ensure consistency across all tools. **ALWAYS use these utilities** instead of writing your own implementations!

### **1. EditModeBanner** (`/shared/EditModeBanner.js`)
**Purpose:** Standard edit mode UI with cancel functionality
**When to use:** Whenever a user is editing a previous response

```javascript
// ✅ DO THIS: Use EditModeBanner utility
const banner = EditModeBanner.render(originalDate, clientId, 'toolN');
content = banner + pageContent;

// ❌ DON'T: Write your own edit banner HTML
```

**Eliminates:** 40+ lines of duplicate HTML/CSS per tool

---

### **2. DraftService** (`/shared/DraftService.js`)
**Purpose:** Consistent draft storage and retrieval using PropertiesService
**When to use:** Saving/loading draft data, merging with edit data

```javascript
// ✅ DO THIS: Use DraftService
DraftService.saveDraft('toolN', clientId, page, formData);
const draft = DraftService.getDraft('toolN', clientId);
DraftService.clearDraft('toolN', clientId);

// ❌ DON'T: Access PropertiesService directly
// PropertiesService.getUserProperties().setProperty(...); // WRONG!
```

**Key Methods:**
- `saveDraft(toolId, clientId, page, formData, excludeKeys)` - Save draft
- `getDraft(toolId, clientId)` - Retrieve draft
- `clearDraft(toolId, clientId)` - Clear draft
- `hasDraft(toolId, clientId)` - Check if draft exists
- `mergeWithEditData(editData, toolId, clientId)` - Merge for edit mode

**Eliminates:** 35+ lines of duplicate draft logic per tool

---

### **3. ReportBase** (`/shared/ReportBase.js`)
**Purpose:** Common report retrieval logic from RESPONSES sheet
**When to use:** Building tool reports that fetch latest data

```javascript
// ✅ DO THIS: Use ReportBase
const results = ReportBase.getResults(clientId, 'toolN', (resultData, cId) => {
  return {
    clientId: cId,
    scores: resultData.scores,
    formData: resultData.formData
  };
}, false); // checkIsLatest parameter

// ❌ DON'T: Write your own sheet retrieval logic
```

**Key Methods:**
- `getResults(clientId, toolId, parseFunction, checkIsLatest)` - Get latest results
- `getSheet()` - Get RESPONSES sheet
- `getHeaders(responseSheet)` - Get column headers
- `findLatestRow(data, columnIndexes, clientId, toolId, checkIsLatest)` - Find latest row

**Eliminates:** 25+ lines of duplicate retrieval logic per tool

---

### **4. ErrorHandler** (`/shared/ErrorHandler.js`)
**Purpose:** Consistent error handling and response formatting
**When to use:** All error scenarios and success responses

```javascript
// ✅ DO THIS: Use ErrorHandler
throw new AppError('Invalid input', ErrorCodes.INVALID_INPUT, { field: 'email' });

// Wrap functions for automatic error handling
const safeFunction = ErrorHandler.wrap(riskyFunction, 'Process Data');

// Standard response formats
return ErrorHandler.createSuccessResponse(data, 'Success!');
return ErrorHandler.createErrorResponse('Error message', ErrorCodes.UNKNOWN);

// ❌ DON'T: Use plain Error objects or inconsistent response formats
```

**Key Classes/Functions:**
- `AppError(message, code, details)` - Custom error class
- `ErrorCodes` - Standard error code constants
- `wrap(fn, contextName)` - Wrap functions for auto error handling
- `createSuccessResponse(data, message)` - Standard success format
- `createErrorResponse(message, code, details)` - Standard error format

**Eliminates:** Inconsistent error handling patterns

---

### **5. Validator** (`/shared/Validator.js`)
**Purpose:** Input validation with consistent error messages
**When to use:** Validating user input, form data, parameters

```javascript
// ✅ DO THIS: Use Validator
const name = Validator.requireString(data.name, 'Name');
const age = Validator.requireNumber(data.age, 'Age', { min: 0, max: 150 });
const toolId = Validator.validateToolId(params.toolId);
const email = Validator.validateEmail(data.email);

// ❌ DON'T: Write validation from scratch
// if (!name || name.trim() === '') throw new Error('Name required'); // WRONG!
```

**Key Methods:**
- `requireString(value, fieldName)` - Validate required string (trims whitespace)
- `requireNumber(value, fieldName, options)` - Validate number with min/max
- `validateToolId(toolId)` - Validate tool ID format
- `validateClientId(clientId)` - Validate client ID format
- `validateEmail(email)` - Validate email format
- `validateScaleValue(value, fieldName)` - Validate -5 to +5 scale (no zero)

**Eliminates:** Inconsistent validation patterns

---

### **6. NavigationHelpers** (`/shared/NavigationHelpers.js`)
**Purpose:** Client-side navigation without white flash
**When to use:** Navigating between pages (used internally by Code.js, rarely needed in tools)

```javascript
// ✅ Internal use (Code.js uses this)
const html = NavigationHelpers.getDashboardPage(clientId);
const html = NavigationHelpers.getReportPage(clientId, 'toolN');
const html = NavigationHelpers.getToolPageHtml('toolN', clientId, page);
```

**Note:** Tool developers rarely call this directly. It's used by Code.js for navigation.

**Eliminates:** 100+ lines of duplicate navigation code

---

### **7. PDFGenerator** (`/shared/PDFGenerator.js`)
**Purpose:** PDF generation for tool reports
**When to use:** Adding PDF download for your tool's report

```javascript
// ✅ DO THIS: Add method to PDFGenerator
// In /shared/PDFGenerator.js:
PDFGenerator.generateToolNPDF = function(clientId) {
  const results = ToolNReport.getResults(clientId);
  const html = this.buildToolNHTML(results);
  return this.htmlToPDF(html, this.generateFileName('Tool N', results.data.name));
};

// Then in Code.js, add wrapper:
function generateToolNPDF(clientId) {
  return PDFGenerator.generateToolNPDF(clientId);
}

// ❌ DON'T: Add PDF generation directly to Code.js
```

**Key Methods:**
- `generateTool1PDF(clientId)` - Example: Tool 1 PDF generation
- `generateTool2PDF(clientId)` - Example: Tool 2 PDF generation
- `htmlToPDF(htmlContent, fileName)` - Convert HTML to PDF blob
- `buildHeader(title, studentName)` - Standard header with logo
- `buildFooter(customText)` - Standard footer
- `getCommonStyles()` - Standard PDF styles (uses CONFIG.UI constants)
- `generateFileName(toolName, studentName)` - Standard filename format

**Eliminates:** 320+ lines of duplicate PDF code from Code.js

---

### **Using CONFIG Constants**

**Always use CONFIG constants instead of hardcoded values:**

```javascript
// ✅ DO THIS: Use CONFIG constants
const toolConfig = CONFIG.TOOLS.TOOL1; // { ID: 'tool1', NAME: '...', PAGES: 5 }
const primaryColor = CONFIG.UI.PRIMARY_COLOR; // '#ad9168'
const darkBg = CONFIG.UI.DARK_BG; // '#1e192b'
const gptDelay = CONFIG.TIMING.GPT_ANALYSIS_DELAY; // 2000ms
const colIdx = CONFIG.COLUMN_INDEXES.STUDENTS.CLIENT_ID; // 0

// ❌ DON'T: Hardcode values
const primaryColor = '#ad9168'; // WRONG!
const totalPages = 5; // WRONG!
```

**Available CONFIG sections:**
- `CONFIG.TOOLS` - Tool metadata (ID, NAME, PAGES, QUESTIONS)
- `CONFIG.COLUMN_INDEXES` - Sheet column positions
- `CONFIG.COLUMN_NAMES` - Header name lookups
- `CONFIG.TIMING` - Delays and timeouts
- `CONFIG.UI` - Theme colors, borders, etc.

---

## ⚠️ CRITICAL PATTERNS (Read This First!)

These patterns are **non-negotiable** and prevent major bugs. Follow them religiously!

### **1. ALWAYS Use DataService for Saving Responses**

**❌ NEVER DO THIS:**
```javascript
// WRONG: Manual save to RESPONSES sheet
const row = [timestamp, clientId, toolId, data, version, status];
responseSheet.appendRow(row);
```

**✅ ALWAYS DO THIS:**
```javascript
// CORRECT: Use DataService wrapper
DataService.saveToolResponse(clientId, this.id, {
  data: formData,
  results: results,
  timestamp: new Date().toISOString()
});
```

**Why This Matters:**
- ❌ Manual saves miss the `Is_Latest` column (only 6 columns instead of 7)
- ❌ Multiple rows end up with `Is_Latest = true` (breaks everything!)
- ❌ Version control completely broken
- ✅ DataService automatically marks old versions as `Is_Latest = false`
- ✅ DataService sets new version as `Is_Latest = true`
- ✅ ResponseManager handles version cleanup

**Bug Fixed:** Deploy @58 (ec82987) - Tool1 was missing Is_Latest column

---

### **2. Navigate IMMEDIATELY to Preserve User Gesture**

**❌ NEVER DO THIS:**
```javascript
// WRONG: Async callback loses user gesture
function editResponse() {
  google.script.run
    .withSuccessHandler(function() {
      // TOO LATE! User gesture lost, Chrome blocks navigation
      window.top.location.href = toolUrl;
    })
    .loadResponseForEditing(clientId, toolId);
}
```

**✅ ALWAYS DO THIS:**
```javascript
// CORRECT: Navigate immediately with URL params
function editResponse() {
  // Navigate FIRST (preserves user gesture)
  window.top.location.href = toolUrl + '?editMode=true';
  // Server action executes AFTER navigation completes
}
```

**Why This Matters:**
- ❌ Async callbacks lose user gesture/activation
- ❌ Chrome blocks `window.top.location.href` without gesture
- ❌ Error: "allow-top-navigation-by-user-activation" flag with no gesture
- ✅ Immediate navigation preserves gesture (Chrome allows it)
- ✅ Server actions execute safely after page loads
- ✅ No white screen, no security errors

**Bug Fixed:** Deploy @56 (99d0eeb) - User gesture navigation fix

---

### **3. Handle URL Parameters in render()**

**All tools must check for and handle these URL parameters:**

```javascript
render(params) {
  const editMode = params.editMode === 'true' || params.editMode === true;
  const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

  // Execute server actions on page 1 AFTER navigation
  if (editMode && page === 1) {
    Logger.log(`Edit mode triggered for ${clientId}`);
    DataService.loadResponseForEditing(clientId, this.id);
  }

  if (clearDraft && page === 1) {
    Logger.log(`Clear draft triggered for ${clientId}`);
    DataService.startFreshAttempt(clientId, this.id);
  }

  // Continue with normal rendering...
}
```

**Why This Matters:**
- ✅ Actions execute AFTER navigation (with user gesture)
- ✅ No timing conflicts or race conditions
- ✅ Consistent pattern across all tools
- ✅ Dashboard buttons work reliably

---

### **4. ALWAYS Check for Null in Handlers**

**❌ NEVER DO THIS:**
```javascript
google.script.run
  .withSuccessHandler(function(result) {
    // Assumes result exists - crashes if null!
    if (result.success) { ... }
  })
  .someServerFunction();
```

**✅ ALWAYS DO THIS:**
```javascript
google.script.run
  .withSuccessHandler(function(result) {
    if (!result) {
      alert('Error: No response from server');
      return;
    }
    if (result.success) { ... }
  })
  .withFailureHandler(function(error) {
    alert('Error: ' + (error ? error.message : 'Unknown error'));
  })
  .someServerFunction();
```

**Why This Matters:**
- ✅ Prevents "Cannot read property 'success' of null" errors
- ✅ Graceful error handling
- ✅ Better user experience

---

### **5. Correct Data Priority in getExistingData()**

**CRITICAL:** PropertiesService must be checked FIRST, then EDIT_DRAFT as fallback.

**Updated pattern (v3.7.5+):**

```javascript
getExistingData(clientId) {
  try {
    // FIRST: Check PropertiesService (has live page changes)
    // This is temporary session storage that updates as user edits pages
    const userProperties = PropertiesService.getUserProperties();
    const draftKey = `${this.id}_draft_${clientId}`;
    const draftData = userProperties.getProperty(draftKey);

    if (draftData) {
      Logger.log(`Found PropertiesService draft for ${clientId} (live page data)`);
      return JSON.parse(draftData);
    }

    // FALLBACK: Check for active draft from ResponseManager (EDIT_DRAFT or DRAFT)
    // This is the initial snapshot when edit mode started, before any page changes
    if (typeof DataService !== 'undefined') {
      const activeDraft = DataService.getActiveDraft(clientId, this.id);

      if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
        Logger.log(`Found active draft with status: ${activeDraft.status} (initial data)`);
        return activeDraft.data;
      }
    }
  } catch (error) {
    Logger.log(`Error getting existing data: ${error}`);
  }
  return null;
}
```

**Why This Order Matters:**
- ✅ **PropertiesService = live session data** (changes as user edits pages)
- ✅ **EDIT_DRAFT = initial snapshot** (copied from COMPLETED when edit started)
- ✅ **Priority must be: Live data first, snapshot second**
- ❌ **Reversed order = edit changes lost!** (Bug @91)

**Data Flow in Edit Mode:**
1. User clicks "Edit Answers" → EDIT_DRAFT created with original data
2. User edits Page 1 → Changes saved to PropertiesService
3. User clicks "Next" → Changes saved to PropertiesService (cumulative)
4. User submits → **getExistingData() must return PropertiesService data (live changes)**
5. Submission saves → PropertiesService data becomes new COMPLETED row

**Bug Fixed:** Deploy @91 (9c114d3) - Reversed priority order to prevent data loss

---

### **Quick Reference: Critical Mistakes to Avoid**

| ❌ NEVER Do This | ✅ ALWAYS Do This (v3.9.0 Updated) |
|-----------------|-------------------|
| `responseSheet.appendRow([...])` | `DataService.saveToolResponse(...)` |
| Navigate in async callback | Navigate immediately with URL params |
| Skip editMode/clearDraft params | Check params in render(), execute on page 1 |
| Assume result exists | Check `if (!result)` in all handlers |
| Check EDIT_DRAFT first | Check DraftService first (live data priority!) |
| Unlock tools when editing | Check `!isEditMode` before unlock |
| Write own edit banner HTML | Use `EditModeBanner.render(...)` |
| Access PropertiesService directly | Use `DraftService.saveDraft(...)` |
| Write own validation | Use `Validator.requireString(...)` etc. |
| Add PDF code to Code.js | Add to `PDFGenerator.js`, wrapper in Code.js |
| Hardcode colors/values | Use `CONFIG.UI.*` and `CONFIG.TOOLS.*` |
| Write own error handling | Use `ErrorHandler` and `AppError` |
| Manual report data retrieval | Use `ReportBase.getResults(...)` |

---

## 🏗️ Tool Types

### **Type 1: Single-Page Form**
**Use when:** < 10 questions, simple scoring, no conditional logic
**Example:** (None yet in v3)
**Complexity:** Low

### **Type 2: Multi-Page Form (Pure Algorithmic)**
**Use when:** 10-30 questions, algorithmic scoring, no free-text analysis
**Example:** Tool 1 (26 questions, 5 pages, 6 trauma scores)
**Complexity:** Medium

### **Type 3: Multi-Page Form (Hybrid with GPT)**
**Use when:** 30+ questions with free-text, need personalized insights
**Example:** Tool 2 (57 questions, 5 pages, algo scoring + GPT insights)
**Complexity:** High
**Cost:** ~$0.01-0.05 per report

### **Type 4: Multi-Page with Adaptive Questions**
**Use when:** Questions depend on previous tool data
**Example:** Tool 2 Page 5 (shows 2 questions based on Tool 1 trauma scores)
**Complexity:** High

---

## 🎨 Multi-Page Tool Pattern (Step-by-Step)

### **File Structure**

```
tools/toolN/
├── tool.manifest.json      # Tool configuration
├── ToolN.js                # Main tool implementation
├── ToolNReport.js          # Report generation
└── ToolNStyles.js          # (Optional) Custom styles
```

### **Step 1: Create Manifest**

**File:** `tools/toolN/tool.manifest.json`

```json
{
  "id": "toolN",
  "name": "Your Tool Name",
  "description": "Brief description for dashboard",
  "version": "1.0.0",
  "pattern": "multipage-form",
  "totalPages": 5,
  "estimatedTime": "15-20 minutes",
  "routes": ["/toolN", "/tool-name-slug"],
  "prerequisites": ["tool1", "tool2"],
  "unlocks": ["toolN+1"],
  "usesGPT": false,
  "estimatedCost": 0,
  "dataSchema": {
    "requiredFields": ["field1", "field2"],
    "optionalFields": ["field3"]
  }
}
```

**Key Fields:**
- `usesGPT`: Set to `true` if using OpenAI service
- `estimatedCost`: In dollars (e.g., 0.03 for 3 cents)
- `totalPages`: Number of pages in your form
- `prerequisites`: Tools that must be completed first

---

### **Step 2: Implement Main Tool Module**

**File:** `tools/toolN/ToolN.js`

```javascript
/**
 * Tool N: [Tool Name]
 *
 * [Brief description of what this tool assesses]
 *
 * Pattern: Multi-page form with [X] pages, [Y] questions
 * Scoring: [Algorithmic / GPT-enhanced / Hybrid]
 */

const ToolN = {
  // ===== CONFIGURATION =====

  id: 'toolN',
  manifest: null, // Injected by ToolRegistry

  // Dependencies (injected by framework)
  dataService: null,
  openAI: null, // Only if usesGPT: true in manifest

  // ===== REQUIRED: INITIALIZE =====

  /**
   * Initialize tool with dependencies
   * @param {Object} deps - Framework services
   * @param {Array} insights - Previous tool insights
   */
  initialize(deps, insights) {
    try {
      this.dataService = deps.dataService;

      // Only if using GPT
      if (this.manifest.usesGPT) {
        this.openAI = deps.openAI;
      }

      this.previousInsights = insights || [];

      return { success: true };
    } catch (error) {
      Logger.log(`ToolN initialization error: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  // ===== REQUIRED: RENDER =====

  /**
   * Render tool UI
   * @param {Object} params - { clientId, page, editMode, clearDraft, ... }
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // CRITICAL: Handle URL parameters for navigation (preserves user gesture)
    const editMode = params.editMode === 'true' || params.editMode === true;
    const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

    // Execute actions on page 1 AFTER navigation completes (with user gesture)
    if (editMode && page === 1) {
      Logger.log(`Edit mode triggered for ${clientId}`);
      DataService.loadResponseForEditing(clientId, this.id);
    }

    if (clearDraft && page === 1) {
      Logger.log(`Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, this.id);
    }

    // Get existing data (for resume/draft)
    const existingData = this.getExistingData(clientId);

    // Get page content
    const pageContent = this.renderPageContent(page, existingData, clientId);

    // Use FormUtils for standard structure
    const template = HtmlService.createTemplate(
      FormUtils.buildStandardPage({
        toolName: 'Your Tool Name',
        toolId: this.id,
        page: page,
        totalPages: this.manifest.totalPages,
        clientId: clientId,
        baseUrl: baseUrl,
        pageContent: pageContent,
        isFinalPage: (page === this.manifest.totalPages),
        customValidation: null // or 'validateMyForm' for custom
      })
    );

    return template.evaluate()
      .setTitle(`TruPath - ${this.manifest.name}`)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  // ===== PAGE ROUTING =====

  /**
   * Route to appropriate page
   */
  renderPageContent(page, data, clientId) {
    switch(page) {
      case 1: return this.renderPage1Content(data, clientId);
      case 2: return this.renderPage2Content(data, clientId);
      case 3: return this.renderPage3Content(data, clientId);
      // Add more pages as needed
      default: return '<p class="error">Invalid page</p>';
    }
  },

  // ===== PAGE CONTENT METHODS =====

  /**
   * PAGE 1: [Section Name]
   *
   * IMPORTANT: Return ONLY form fields (no <form> tag)
   * FormUtils wraps this automatically
   */
  renderPage1Content(data, clientId) {
    // Example: Pre-fill from previous tool
    const tool1Data = this.dataService.getToolResponse(clientId, 'tool1');
    const name = tool1Data?.data?.name || data?.name || '';

    return `
      <h2>Section Title</h2>
      <p class="muted mb-20">Section description</p>

      <div class="form-group">
        <label class="form-label">Question 1 *</label>
        <input type="text" name="field1" value="${name}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Question 2 *</label>
        <select name="field2" required>
          <option value="">Select...</option>
          <option value="opt1" ${data?.field2 === 'opt1' ? 'selected' : ''}>Option 1</option>
          <option value="opt2" ${data?.field2 === 'opt2' ? 'selected' : ''}>Option 2</option>
        </select>
      </div>
    `;
  },

  /**
   * PAGE 2: [Section Name]
   *
   * Example: -5 to +5 scale questions (standard)
   */
  renderPage2Content(data, clientId) {
    const questions = [
      { name: 'q1', text: 'How would you rate...?' },
      { name: 'q2', text: 'To what extent do you...?' },
      { name: 'q3', text: 'How strongly do you feel...?' }
    ];

    let html = `
      <h2>Assessment Questions</h2>
      <p class="muted mb-20">Rate each statement using the scale below.</p>
    `;

    // Render scale questions
    questions.forEach(q => {
      const selected = data?.[q.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${q.text} *</label>
          <select name="${q.name}" required>
            <option value="">Select a response</option>
            <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Strongly disagree)</option>
            <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
            <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
            <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
            <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
            <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
            <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
            <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
            <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
            <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Strongly agree)</option>
          </select>
          <small class="muted">Note: No zero option - choose the direction that best fits</small>
        </div>
      `;
    });

    return html;
  },

  /**
   * FINAL PAGE: Review & Submit
   *
   * Optional: Show review section before submit
   */
  renderPageFinalContent(data, clientId) {
    return `
      <h2>Review Your Responses</h2>
      <p class="muted mb-20">Please review before submitting.</p>

      <div class="insight-box" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
        <p><strong>📋 Almost Done</strong></p>
        <p>You can use your browser's back button to review and edit any previous pages.</p>
        <p>When ready, click "Complete Assessment" below.</p>
      </div>
    `;
  },

  // ===== DATA MANAGEMENT =====

  /**
   * Get existing data for resume/draft
   * CRITICAL: Check DraftService FIRST (live page data), EDIT_DRAFT second (initial snapshot)
   *
   * ✅ NEW (v3.9.0): Can use DraftService utility for cleaner code
   */
  getExistingData(clientId) {
    try {
      // Option 1: Use DraftService utility (RECOMMENDED)
      const draft = DraftService.getDraft(this.id, clientId);
      if (draft) {
        Logger.log(`Found draft for ${clientId} (live page data)`);
        return draft;
      }

      // Option 2: Manual PropertiesService access (if you need custom logic)
      // const userProperties = PropertiesService.getUserProperties();
      // const draftKey = DraftService.getDraftKey(this.id, clientId);
      // const draftData = userProperties.getProperty(draftKey);
      // if (draftData) return JSON.parse(draftData);

      // FALLBACK: Check for active draft from ResponseManager (EDIT_DRAFT or DRAFT)
      // This is used when first loading edit mode, before any page changes
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, this.id);

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`Found active draft with status: ${activeDraft.status} (initial data)`);
          return activeDraft.data;
        }
      }
    } catch (error) {
      Logger.log(`Error getting existing data: ${error}`);
    }
    return null;
  },

  /**
   * REQUIRED: Save draft (auto-called by FormUtils)
   *
   * ✅ NEW (v3.9.0): Can use DraftService utility directly
   */
  saveDraft(clientId, data) {
    try {
      // Option 1: Use DraftService directly (RECOMMENDED - simpler)
      DraftService.saveDraft(this.id, clientId, null, data);
      return { success: true };

      // Option 2: Use DataService wrapper (traditional method)
      // this.dataService.saveDraft(clientId, this.id, data);
      // return { success: true };
    } catch (error) {
      Logger.log(`Error saving draft: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  // ===== REQUIRED: VALIDATION =====

  /**
   * Validate form data
   *
   * ✅ NEW (v3.9.0): Use Validator utility for consistent validation
   */
  validate(data) {
    const errors = [];

    try {
      // ✅ RECOMMENDED: Use Validator utility for consistency
      Validator.requireString(data.field1, 'Field 1'); // Throws AppError if invalid

      // Numeric validation with options
      if (data.numericField) {
        Validator.requireNumber(data.numericField, 'Numeric Field', { min: 0, max: 100 });
      }

      // Scale validation (for -5 to +5 scale questions)
      const scaleFields = ['q1', 'q2', 'q3'];
      scaleFields.forEach(field => {
        if (data[field]) {
          Validator.validateScaleValue(data[field], field); // Validates -5 to +5, no zero
        }
      });

    } catch (error) {
      // AppError thrown by Validator has descriptive messages
      errors.push(error.message);
    }

    // ❌ OLD WAY (still works, but not recommended):
    // if (!data.field1 || data.field1.trim() === '') {
    //   errors.push('Field 1 is required');
    // }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  // ===== REQUIRED: PROCESS SUBMISSION =====

  /**
   * Process final submission
   * @param {string} clientId
   * @param {Object} data - Validated form data
   */
  process(clientId, data) {
    try {
      Logger.log(`Processing ToolN for ${clientId}`);

      // Check if this is an edit or new submission
      const isEditMode = data._editMode === true;

      // Calculate results
      const results = this.processResults(data);

      // CRITICAL: Always use DataService.saveToolResponse()
      // It handles Is_Latest column, version control, and cleanup
      DataService.saveToolResponse(clientId, this.id, {
        data: data,
        results: results,
        timestamp: new Date().toISOString()
      });

      // Update tool status (only if not editing)
      if (!isEditMode) {
        this.dataService.updateToolStatus(clientId, this.id, 'completed');
      }

      return {
        success: true,
        result: results,
        isEdit: isEditMode
      };

    } catch (error) {
      Logger.log(`Processing error: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Calculate results (tool-specific scoring logic)
   */
  processResults(data) {
    // TOOL-SPECIFIC: Implement your scoring logic here

    // Example: Simple sum of scale questions
    const score = (parseInt(data.q1) || 0) +
                  (parseInt(data.q2) || 0) +
                  (parseInt(data.q3) || 0);

    // Example: Categorization
    let category = 'Low';
    if (score >= 10) category = 'High';
    else if (score >= 5) category = 'Medium';

    return {
      score: score,
      category: category,
      timestamp: new Date().toISOString()
    };
  },

  // ===== REQUIRED: GENERATE INSIGHTS =====

  /**
   * Generate insights for other tools
   * These will be stored in CrossToolInsights sheet
   */
  generateInsights(data, clientId) {
    const insights = [];

    // Example: Threshold-based insight
    if (data.score >= 10) {
      insights.push({
        type: 'high_score',
        priority: 'HIGH',
        content: `High score detected (${data.score})`,
        targetTools: ['toolN+1'],
        data: { score: data.score }
      });
    }

    return insights;
  },

  // ===== REQUIRED: GET CONFIG =====

  getConfig() {
    return this.manifest;
  }
};
```

---

## 🤖 GPT Integration Pattern (v3.8.0)

### **Production-Proven Pattern**

📘 **For complete implementation, see:** `docs/GPT-INTEGRATION-QUICKSTART.md` (60KB comprehensive guide)

**This section provides a quick overview. The Quick Start Guide has:**
- ✅ Complete working code templates
- ✅ Step-by-step implementation (6 steps, 6-8 hours)
- ✅ 3-tier fallback system explained
- ✅ Background processing pattern
- ✅ Testing procedures
- ✅ Cost analysis and monitoring

### **When to Use GPT**

**✅ Good Use Cases:**
- Analyzing free-text responses for patterns
- Generating personalized recommendations from specific student examples
- Creating narrative insights that connect domain scores to stories
- Trauma-informed coaching language
- Synthesizing insights across multiple domains

**❌ Bad Use Cases:**
- Replacing scoring logic (always use algorithms for scores)
- Making access control decisions (security risk)
- Storing sensitive PII (privacy concern)
- Real-time form interactions (too slow - use background processing instead)
- Generating generic advice (use domain-specific fallbacks instead)

### **Quick Implementation Summary**

**Architecture:** Tool-specific files (not centralized service)

```
tools/toolN/
├── ToolN.js                    # Add background GPT processing
├── ToolNReport.js              # Add insights display
├── ToolNFallbacks.js          # Domain-specific fallback insights (NEW)
└── ToolNGPTAnalysis.js        # GPT prompts + 3-tier fallback (NEW)
```

**6 Implementation Steps:**

1. **Create ToolNFallbacks.js** (2 hours)
   - Domain-specific fallback insights (not generic templates)
   - Uses domain scores to tailor messages
   - Provides Pattern / Insight / Action for each response type

2. **Create ToolNGPTAnalysis.js** (2 hours)
   - GPT prompts for each free-text response
   - 3-tier fallback: GPT → Retry → Fallback
   - Final synthesis function

3. **Add Background Processing to ToolN.js** (1 hour)
   - Trigger GPT during form completion (async, non-blocking)
   - Store insights in PropertiesService
   - Smart caching (avoid duplicates on back/forward navigation)

4. **Update processFinalSubmission()** (1 hour)
   - Retrieve pre-computed insights
   - Retry any that failed
   - Run final synthesis
   - Save to RESPONSES sheet

5. **Display Insights in ToolNReport.js** (1 hour)
   - Add overall insights section
   - Add detailed insight cards
   - Show source attribution (✨ Personalized vs 📋 General Guidance)

6. **Add PDF Generation** (30 minutes)
   - ✅ **NEW (v3.9.0):** Add generateToolNPDF() method to **PDFGenerator.js** (NOT Code.js!)
   - Add wrapper function in Code.js that calls PDFGenerator.generateToolNPDF()
   - Update download button in ToolNReport.js
   - See "Shared Utilities #7" section for PDFGenerator examples

### **Production Example (Tool 2)**

```javascript
// Background processing during form
savePageData(clientId, page, formData) {
  // Save data
  PropertiesService.getUserProperties().setProperty(draftKey, JSON.stringify(mergedData));

  // Trigger GPT (non-blocking)
  this.triggerBackgroundGPTAnalysis(page, clientId, formData, mergedData);
}

// 3-tier fallback system
analyzeResponse({clientId, responseType, responseText, ...}) {
  try {
    // TIER 1: Try GPT
    const result = this.callGPT({model: 'gpt-4o-mini', ...});
    return {...result, source: 'gpt'};
  } catch (error) {
    try {
      // TIER 2: Retry after 2s
      Utilities.sleep(2000);
      const result = this.callGPT({model: 'gpt-4o-mini', ...});
      return {...result, source: 'gpt_retry'};
    } catch (retryError) {
      // TIER 3: Domain-specific fallback (always succeeds)
      return {...ToolNFallbacks.getFallbackInsight(...), source: 'fallback'};
    }
  }
}
```

### **Cost & Performance (Tool 2 Actual)**

- **Cost:** $0.023 per student (8 insights + 1 synthesis)
- **Background:** ~24s total GPT time (during form, user doesn't wait)
- **User wait:** ~3s at submission (synthesis only)
- **Reliability:** 100% (via 3-tier fallback)
- **Fallback rate:** < 5% in production

### **Complete Reference**

**Documentation:**
- 📘 `docs/GPT-INTEGRATION-QUICKSTART.md` - Comprehensive implementation guide
- 📘 `docs/GPT-IMPLEMENTATION-GUIDE.md` - Technical architecture details
- 📘 `docs/GPT-IMPLEMENTATION-CHECKLIST.md` - Step-by-step checklist

**Working Code Examples:**
- `tools/tool2/Tool2GPTAnalysis.js` (22 KB, 8 prompts) ✅ Production-proven
- `tools/tool2/Tool2Fallbacks.js` (21 KB, 7 domains) ✅ Production-proven
- `tools/tool2/Tool2.js` (background processing section)
- `tools/tool2/Tool2Report.js` (insights display section)

---

## 🔄 Adaptive Questions Pattern

### **Use Case**
Show different questions based on previous tool data.

**Example:** Tool 2 shows 2 trauma-specific questions based on Tool 1's highest trauma score.

### **Implementation**

```javascript
/**
 * PAGE WITH ADAPTIVE QUESTIONS
 */
renderAdaptivePage(data, clientId) {
  let html = `
    <h2>Personalized Questions</h2>
    <p class="muted mb-20">Based on your previous assessment.</p>

    <!-- Base questions (everyone sees these) -->
    <div class="form-group">
      <label class="form-label">Base question 1 *</label>
      <input type="text" name="base1" value="${data?.base1 || ''}" required>
    </div>
  `;

  // Adaptive section: Query previous tool
  try {
    const tool1Data = this.dataService.getToolResponse(clientId, 'tool1');

    if (tool1Data?.results) {
      const traumaScores = tool1Data.results;

      // Find highest score
      const topTrauma = Object.entries(traumaScores)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

      const [category, score] = topTrauma;

      // Show adaptive questions for that category
      if (Math.abs(score) > 5) { // Threshold
        html += `
          <h3 class="mt-40">Personalized Follow-Up</h3>
          <p class="muted">Based on your ${category} assessment:</p>
        `;

        if (category === 'FSV') {
          html += this.renderFSVQuestions(data);
        } else if (category === 'Control') {
          html += this.renderControlQuestions(data);
        }
        // etc...
      }
    }
  } catch (error) {
    Logger.log(`Error loading adaptive questions: ${error}`);
    // Graceful degradation - page works without adaptive section
  }

  return html;
},

/**
 * Trauma-specific questions
 */
renderFSVQuestions(data) {
  const selected = data?.fsvScale || '';
  return `
    <div class="form-group">
      <label class="form-label">How much do you hide your true situation? *</label>
      <select name="fsvScale" required>
        <option value="">Select...</option>
        <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Complete transparency)</option>
        <!-- ... full scale ... -->
        <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Total hiding)</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">How does this impact your life? *</label>
      <textarea name="fsvImpact" rows="4" required>${data?.fsvImpact || ''}</textarea>
    </div>
  `;
}
```

**Key Points:**
- Always have base questions (don't make entire page conditional)
- Graceful degradation if previous tool data unavailable
- Use try/catch to prevent errors from breaking the page
- Log errors for debugging

---

## 📏 Scale Standards

### **Standard: -5 to +5 (No Zero)**

**Why no zero:**
- Forces intentionality (no fence-sitting)
- Cleaner interpretation (negative = struggle, positive = strength)
- Better data quality

**Scale Labeling Examples:**

**Agreement Scale:**
```
-5: Strongly disagree
-3: Disagree
-1: Slightly disagree
+1: Slightly agree
+3: Agree
+5: Strongly agree
```

**Frequency Scale:**
```
-5: Never
-3: Rarely
-1: Occasionally
+1: Sometimes
+3: Often
+5: Always
```

**Clarity/Confidence Scale:**
```
-5: No clarity/confidence at all
-3: Low clarity/confidence
-1: Slightly unclear/uncertain
+1: Somewhat clear/confident
+3: Clear/confident
+5: Complete clarity/confidence
```

**Custom Labels (Tool-Specific):**
See TOOL2-QUESTION-MASTER-LIST.md for extensive examples.

---

## 💾 Draft Auto-Save Pattern

FormUtils handles this automatically, but here's what happens:

**1. On every "Next Page" click:**
```javascript
// FormUtils automatically calls:
google.script.run
  .withSuccessHandler(navigateToNextPage)
  .withFailureHandler(handleError)
  .saveDraft(clientId, toolId, formData);
```

**2. Your tool must implement:**
```javascript
saveDraft(clientId, data) {
  this.dataService.saveDraft(clientId, this.id, data);
  return { success: true };
}
```

**3. On resume, data is restored:**
```javascript
getExistingData(clientId) {
  const response = this.dataService.getToolResponse(clientId, this.id);
  return response?.draft || response?.data || {};
}
```

**User Experience:**
- Students can close browser and resume later
- All answers preserved
- Progress indicator shows where they left off
- No manual "Save" button needed

---

## 📊 Report Generation Pattern

### **Basic Report (No GPT)**

**✅ NEW (v3.9.0):** Use **ReportBase** utility for fetching data!

```javascript
const ToolNReport = {

  /**
   * ✅ NEW: Use ReportBase.getResults() to fetch data
   */
  getResults(clientId) {
    return ReportBase.getResults(clientId, 'toolN', (resultData, cId) => {
      // Parse function - customize this for your tool
      return {
        clientId: cId,
        scores: resultData.scores,
        formData: resultData.formData,
        category: resultData.category
      };
    }, false); // checkIsLatest = false for most tools (true for Tool2)
  },

  buildReport(results, data, clientId) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assessment Report</title>
        ${this.getStyles()}
      </head>
      <body>
        <div class="report-container">
          <h1>Your Results</h1>

          <div class="section">
            <h2>Summary</h2>
            <p>Your score: ${results.score}</p>
            <p>Category: ${results.category}</p>
          </div>

          <div class="section">
            <h2>Interpretation</h2>
            <p>${this.getInterpretation(results)}</p>
          </div>

          <div class="section">
            <h2>Next Steps</h2>
            <ul>
              ${this.getRecommendations(results).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  getInterpretation(results) {
    if (results.category === 'High') {
      return 'You show strong indicators...';
    } else if (results.category === 'Medium') {
      return 'You show moderate indicators...';
    } else {
      return 'You show low indicators...';
    }
  },

  getRecommendations(results) {
    // Template-based recommendations
    return [
      'Recommendation 1',
      'Recommendation 2',
      'Recommendation 3'
    ];
  },

  getStyles() {
    return `
      <style>
        .report-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .section {
          margin: 40px 0;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        h1 { color: ${CONFIG.UI.PRIMARY_COLOR}; } /* ✅ Use CONFIG constant */
        h2 { color: #333; margin-top: 0; }
      </style>
    `;
  }
};
```

### **PDF Generation for Reports**

**✅ NEW (v3.9.0):** Add PDF generation to **PDFGenerator.js**, NOT Code.js!

**Step 1: Add method to PDFGenerator.js**
```javascript
// In /shared/PDFGenerator.js

/**
 * Generate PDF for Tool N
 * @param {string} clientId - Client ID
 * @returns {Blob} PDF file blob
 */
PDFGenerator.generateToolNPDF = function(clientId) {
  try {
    Logger.log(`Generating Tool N PDF for ${clientId}`);

    // 1. Get results using ReportBase
    const results = ToolNReport.getResults(clientId);
    if (!results) {
      throw new Error('No results found for this client');
    }

    // 2. Build HTML content
    const html = this.buildToolNHTML(results);

    // 3. Convert to PDF
    const fileName = this.generateFileName('Tool N Assessment', results.formData.name);
    return this.htmlToPDF(html, fileName);

  } catch (error) {
    Logger.log(`Error generating Tool N PDF: ${error}`);
    throw error;
  }
};

/**
 * Build HTML for Tool N PDF
 * @param {Object} results - Tool N results
 * @returns {string} HTML content
 */
PDFGenerator.buildToolNHTML = function(results) {
  const styles = this.getCommonStyles();
  const header = this.buildHeader('Tool N Assessment Results', results.formData.name);
  const footer = this.buildFooter();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      ${header}

      <div class="content">
        <h2>Summary</h2>
        <p>Your score: ${results.score}</p>
        <p>Category: ${results.category}</p>

        <h2>Interpretation</h2>
        <p>${ToolNReport.getInterpretation(results)}</p>

        <h2>Next Steps</h2>
        <ul>
          ${ToolNReport.getRecommendations(results).map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      ${footer}
    </body>
    </html>
  `;
};
```

**Step 2: Add wrapper to Code.js**
```javascript
// In Code.js (global function for webapp access)

/**
 * Generate PDF for Tool N
 * Wrapper for PDFGenerator.generateToolNPDF()
 */
function generateToolNPDF(clientId) {
  return PDFGenerator.generateToolNPDF(clientId);
}
```

**Step 3: Add download button to ToolNReport.js**
```javascript
// In report HTML
<button class="btn-primary" onclick="downloadPDF()">📥 Download PDF</button>

<script>
  function downloadPDF() {
    showLoading('Generating PDF...');
    google.script.run
      .withSuccessHandler(function(blob) {
        hideLoading();
        // Blob is returned, browser handles download
      })
      .withFailureHandler(function(error) {
        hideLoading();
        alert('Error generating PDF: ' + error.message);
      })
      .generateToolNPDF('${clientId}');
  }
</script>
```

### **Hybrid Report (With GPT)**

See "GPT Integration Pattern" section above for complete example.

---

## 🧪 Testing Your Tool

### **1. Unit Testing (Manual)**

Add to Code.js:
```javascript
function testToolN() {
  const testData = {
    field1: 'test',
    field2: 'value',
    q1: '3',
    q2: '4',
    q3: '5'
  };

  // Test validation
  const validation = ToolN.validate(testData);
  Logger.log('Validation:', validation);

  // Test processing
  const result = ToolN.process('TEST001', testData);
  Logger.log('Process result:', result);

  // Test insights
  const insights = ToolN.generateInsights(testData, 'TEST001');
  Logger.log('Insights:', insights);
}
```

### **2. End-to-End Testing**

1. **Login as TEST001**
2. **Complete Tool 1** (if prerequisite)
3. **Start your tool** - Check it appears on dashboard
4. **Page 1** - Fill out, click Next
5. **Draft save** - Close browser, reopen, verify data restored
6. **Complete assessment** - Submit final page
7. **Report display** - Check report shows on dashboard
8. **Data verification** - Check RESPONSES sheet for saved data
9. **Insights** - Check CrossToolInsights sheet
10. **Tool unlock** - Verify next tool unlocks

### **3. Edge Cases**

- Empty/null values
- Invalid scale values (0, <-5, >5)
- Very long text inputs
- Special characters
- Previous tool data missing
- GPT API failure (if using AI)

---

## 📚 Complete Working Examples

### **Tool 1: Pure Algorithmic**
**Location:** `tools/tool1/Tool1.js`

**Pattern:**
- 5 pages, 26 questions
- All scale questions (-5 to +5, but with 0 - needs update)
- Calculates 6 trauma category scores
- Template-based report
- No GPT usage
- Generates insights for Tool 2

**Learn From:**
- Multi-page structure
- Scale question rendering
- Algorithmic scoring
- Insight generation without AI

---

### **Tool 2: Hybrid (Algo + GPT)**
**Location:** `tools/tool2/Tool2.js` (when implemented)

**Pattern:**
- 5 pages, 57 questions
- Mix of scales, selects, numeric inputs, free-text
- Pre-fills from Tool 1
- Adaptive questions (2 shown based on Tool 1 trauma)
- Algorithmic domain scoring
- GPT analysis of 8 free-text responses
- Hybrid report (scores + AI insights)
- Cost: ~$0.02 per report

**Learn From:**
- Pre-filling previous tool data
- Adaptive question logic
- Numeric input validation
- GPT integration patterns
- Hybrid scoring (algo + AI)
- Cost-effective AI usage

---

## ✅ Implementation Checklist

When building a new tool:

**Planning:**
- [ ] Define tool purpose and assessment goals
- [ ] Determine if GPT is needed (cost/benefit)
- [ ] Decide on page count and question distribution
- [ ] Identify any adaptive questions needed
- [ ] ✅ **NEW:** Review shared utilities documentation (EditModeBanner, DraftService, ReportBase, etc.)

**Setup:**
- [ ] Create `tools/toolN/` directory
- [ ] Create `tool.manifest.json`
- [ ] Copy `MultiPageToolTemplate.js` to `ToolN.js`
- [ ] Create `ToolNReport.js`
- [ ] ✅ **NEW:** Add tool config to `Config.js` (TOOLS.TOOLN section)

**Implementation:**
- [ ] Update manifest with correct metadata
- [ ] Implement page content methods (1-N)
- [ ] ✅ **NEW:** Use `Validator` utility for input validation
- [ ] ✅ **NEW:** Use `ErrorHandler` for error handling
- [ ] ✅ **NEW:** Use `DraftService` for draft management
- [ ] ✅ **NEW:** Use `EditModeBanner.render()` for edit mode UI
- [ ] Implement scoring logic in `processResults()`
- [ ] ✅ **NEW:** Use `ReportBase.getResults()` in report generation
- [ ] ✅ **NEW:** Add PDF method to `PDFGenerator.js` (not Code.js!)
- [ ] ✅ **NEW:** Add PDF wrapper function in `Code.js`
- [ ] ✅ **NEW:** Use `CONFIG.*` constants instead of hardcoded values
- [ ] Add GPT integration if needed
- [ ] Implement `generateInsights()` for next tools
- [ ] Register tool in `Code.js`

**Testing:**
- [ ] Unit test validation logic
- [ ] Unit test scoring calculations
- [ ] End-to-end test with TEST001
- [ ] Test draft save/resume
- [ ] Test adaptive questions (if any)
- [ ] Test GPT integration (if any)
- [ ] Verify data saves to RESPONSES
- [ ] Verify insights save to CrossToolInsights
- [ ] Test next tool unlock

**Deployment:**
- [ ] `clasp push`
- [ ] `clasp deploy --description "vX.Y.Z - Tool N complete"`
- [ ] Production test with TEST001
- [ ] Git commit and push
- [ ] Update documentation

---

## 🔄 Response Management & Edit Mode (v3.3.0)

**NEW:** All tools now support View/Edit/Retake functionality via ResponseManager.

### **Why This Matters:**
- Students can fix mistakes without retaking entire assessment
- Version history preserved (last 2 versions)
- Dashboard shows appropriate actions based on tool state
- Consistent UX across all 8 tools

### **Implementation Steps:**

#### **Step 1: Update `getExistingData()`**
**CRITICAL:** Check PropertiesService FIRST (live page data), EDIT_DRAFT second (initial snapshot):

```javascript
getExistingData(clientId) {
  try {
    // FIRST: Check PropertiesService (has live page changes)
    const userProperties = PropertiesService.getUserProperties();
    const draftKey = `toolN_draft_${clientId}`;
    const draftData = userProperties.getProperty(draftKey);

    if (draftData) {
      Logger.log(`Found PropertiesService draft for ${clientId} (live page data)`);
      return JSON.parse(draftData);
    }

    // FALLBACK: Check for EDIT_DRAFT from ResponseManager
    // This is used when first loading edit mode, before any page changes
    if (typeof DataService !== 'undefined') {
      const activeDraft = DataService.getActiveDraft(clientId, 'toolN');

      if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
        Logger.log(`Found active draft with status: ${activeDraft.status} (initial data)`);
        return activeDraft.data;
      }
    }
  } catch (error) {
    Logger.log(`Error getting existing data: ${error}`);
  }
  return null;
}
```

**Why This Order:** PropertiesService contains live changes as user edits pages. EDIT_DRAFT is only the initial snapshot. Always prioritize live data! (Bug Fix @91)

#### **Step 2: Add Edit Banner to `renderPageContent()`**
Show banner when in edit mode using the **EditModeBanner** utility:

```javascript
renderPageContent(page, existingData, clientId) {
  let content = '';

  // ✅ NEW: Use EditModeBanner utility (v3.9.0)
  if (existingData && existingData._editMode) {
    const originalDate = existingData._originalTimestamp ?
      new Date(existingData._originalTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'previous submission';

    // Use shared utility instead of manual HTML (40+ lines eliminated!)
    content += EditModeBanner.render(originalDate, clientId, 'toolN');
  }

  // Add page-specific content
  switch(page) {
    case 1:
      content += this.renderPage1Content(existingData, clientId);
      break;
    // ... etc
  }

  return content;
}
```

**What EditModeBanner.render() does:**
- ✅ Renders consistent edit mode UI with cancel button
- ✅ Includes all necessary styles and scripts
- ✅ Handles cancel confirmation and navigation
- ✅ Eliminates 40+ lines of duplicate HTML/CSS
- ✅ Consistent across all tools

#### **Step 3: Update `processFinalSubmission()`**
Detect edit mode and route accordingly:

```javascript
processFinalSubmission(clientId) {
  try {
    const allData = this.getExistingData(clientId);

    if (!allData) {
      throw new Error('No data found. Please start the assessment again.');
    }

    // Check if this is an edit or new submission
    const isEditMode = allData._editMode === true;

    Logger.log(`Processing ${isEditMode ? 'edited' : 'new'} submission for ${clientId}`);

    // Calculate scores/process data
    const results = this.processResults(allData);

    // Prepare data package
    const dataPackage = {
      formData: allData,
      results: results
      // ... any other data
    };

    // Save based on mode
    if (isEditMode && typeof DataService !== 'undefined') {
      // Submit edited response (uses ResponseManager)
      const result = DataService.submitEditedResponse(clientId, 'toolN', dataPackage);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save edited response');
      }

      Logger.log('Edited response submitted successfully');
    } else {
      // Save new response (traditional method)
      this.saveToResponses(clientId, dataPackage);

      Logger.log('New response submitted successfully');
    }

    // Unlock next tool (only on new submission, not edit)
    if (!isEditMode) {
      ToolAccessControl.adminUnlockTool(clientId, 'toolN+1', 'system', 'Auto-unlocked after Tool N completion');
    }

    // Return redirect URL
    const reportUrl = `${ScriptApp.getService().getUrl()}?route=toolN_report&client=${clientId}`;
    return {
      redirectUrl: reportUrl
    };

  } catch (error) {
    Logger.log(`Error processing final submission: ${error}`);
    throw error;
  }
}
```

#### **Step 4: Add Edit Button to Report**
In `ToolNReport.js`:

```javascript
// In action buttons section
<div class="action-buttons">
  <button class="btn-primary" onclick="downloadPDF()">📥 Download PDF</button>
  <button class="btn-secondary" onclick="editResponse()">✏️ Edit My Answers</button>
  <button class="btn-secondary" onclick="backToDashboard()">← Back to Dashboard</button>
</div>

<script>
  function editResponse() {
    if (confirm('Load your responses into the form for editing?')) {
      showLoading('Loading your responses...');

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            window.location.href = baseUrl + '?route=toolN&client=' + clientId + '&page=1';
          } else {
            hideLoading();
            alert('Error loading response: ' + result.error);
          }
        })
        .withFailureHandler(function(error) {
          hideLoading();
          alert('Error: ' + error.message);
        })
        .loadResponseForEditing(clientId, 'toolN');
    }
  }
</script>
```

### **What ResponseManager Does Automatically:**

✅ **Creates EDIT_DRAFT** when user clicks "Edit Answers"
✅ **Marks old version** as `Is_Latest = false`
✅ **Loads pre-filled form** with all previous answers
✅ **Saves new version** on submit with `Is_Latest = true`
✅ **Cleans up old versions** (keeps last 2 automatically)
✅ **Handles cancel** (restores original, deletes EDIT_DRAFT)
✅ **Manages draft persistence** across sessions

### **Dashboard Integration (Automatic):**

Router.js automatically checks tool status and shows:
- **Not Started:** "Start Assessment" button
- **In Progress:** "Continue" + "Discard Draft" buttons
- **Completed:** "View Report" + "Edit Answers" + "Start Fresh" buttons

No additional code needed in your tool!

### **Testing Edit Mode:**

1. Complete your tool with TEST001
2. Go to dashboard → Click "Edit Answers"
3. Form loads with edit banner + all answers
4. Change one answer
5. Submit
6. Check RESPONSES sheet:
   - Old row: `Is_Latest = false`
   - New row: `Is_Latest = true`
7. Click "Edit Answers" again
8. Click "Cancel Edit" in banner
9. Confirm - should return to dashboard (completed state)

### **Common Mistakes to Avoid:**

❌ **Don't** clear draft on edit mode (let ResponseManager handle it)
❌ **Don't** re-unlock tools when editing (check `!isEditMode`)
❌ **Don't** call `saveToolResponse()` directly (use ResponseManager)
❌ **Don't** forget to check `_editMode` flag before saving
❌ **Don't** modify `Is_Latest` flags manually
❌ **Don't** write your own edit banner HTML (use EditModeBanner utility)
❌ **Don't** access PropertiesService directly (use DraftService utility)

✅ **Do** use `DataService` wrapper methods
✅ **Do** use `DraftService.getDraft()` in `getExistingData()`
✅ **Do** use `EditModeBanner.render()` when `_editMode = true`
✅ **Do** route to ResponseManager when editing
✅ **Do** use shared utilities (EditModeBanner, DraftService, ReportBase, etc.)
✅ **Do** test cancel, complete, and fresh start flows

---

## 🎯 Best Practices

### **Code Quality:**
1. **Use shared utilities** - EditModeBanner, DraftService, ReportBase, Validator, ErrorHandler (v3.9.0)
2. **Use FormUtils** - Don't reinvent form handling
3. **Separate concerns** - Report logic in separate file
4. **Validate with Validator utility** - Consistent error messages
5. **Handle errors with ErrorHandler** - AppError class and standard responses
6. **Use CONFIG constants** - No hardcoded values for colors, timing, etc.
7. **Comment non-obvious logic** - Future you will thank you

### **User Experience:**
1. **Progress indicators** - FormUtils provides this
2. **Clear instructions** - Tell users what to expect
3. **Draft auto-save** - Use DraftService utility
4. **Mobile-friendly** - Test on phone/tablet
5. **Encouraging tone** - Positive, supportive language
6. **Consistent UI** - Use EditModeBanner for edit mode

### **Performance:**
1. **Minimize API calls** - Batch GPT requests
2. **Cache where possible** - OpenAI service handles this, DraftService for drafts
3. **Optimize page size** - Don't load all pages at once
4. **Async operations** - Don't block UI
5. **Error fallbacks** - Always have a plan B (3-tier fallback pattern)
6. **Use ReportBase** - Efficient data retrieval from RESPONSES sheet

### **Cost Management (GPT):**
1. **Use GPT-4o-mini** - 90% cheaper than GPT-4
2. **Concise prompts** - Fewer tokens = lower cost
3. **Batch requests** - Parallel API calls
4. **Cache insights** - DraftService prevents duplicate analysis
5. **Fallback templates** - If API fails or budget exceeded

### **Maintenance & Consistency (v3.9.0):**
1. **Add PDF to PDFGenerator.js** - NOT Code.js (keeps Code.js clean)
2. **Use ReportBase pattern** - Consistent report data retrieval
3. **Follow naming conventions** - Match existing tool patterns
4. **Update CONFIG.TOOLS** - Add your tool's metadata
5. **Test with validation suite** - Run test-refactoring.js after changes

---

## 🚀 Next Steps

1. **Review existing tools:**
   - Study Tool 1 code thoroughly
   - Wait for Tool 2 implementation to see GPT patterns

2. **Plan your tool:**
   - Sketch out page flow
   - List all questions
   - Decide on scoring approach

3. **Start building:**
   - Copy MultiPageToolTemplate.js
   - Build page by page
   - Test frequently

4. **Get help:**
   - Reference ARCHITECTURE.md
   - Review this guide
   - Check Tool 1/2 examples

---

**You've got this!** 🎉

The framework does the heavy lifting. You just focus on:
- Good questions
- Smart scoring
- Valuable insights

---

## 📦 Summary of v3.9.0 Refactoring (January 2025)

The v3 framework now includes **7 shared utilities** that eliminate code duplication and ensure consistency:

1. **EditModeBanner** - Standard edit mode UI (saves 40+ lines per tool)
2. **DraftService** - Draft management via PropertiesService (saves 35+ lines per tool)
3. **ReportBase** - Common report retrieval (saves 25+ lines per tool)
4. **ErrorHandler** - Consistent error handling with AppError class
5. **Validator** - Input validation with standard error messages
6. **NavigationHelpers** - Client-side navigation (saves 100+ lines in Code.js)
7. **PDFGenerator** - PDF generation for reports (saves 320+ lines in Code.js)

**Impact:**
- Code.js reduced from 1,086 lines to 696 lines (-36%)
- Eliminated ~200 lines of duplicate code across tools
- Added ~1,600 lines of reusable shared utilities
- Consistent patterns across all tools

**For Tool Developers:**
- ✅ Use these utilities instead of writing your own implementations
- ✅ Add PDFs to PDFGenerator.js (NOT Code.js)
- ✅ Use CONFIG constants instead of hardcoded values
- ✅ Follow examples in Tool1 and Tool2 (both refactored)

**Testing:**
- Run `runRefactoringValidationTests()` in Google Apps Script console
- All 17 tests must pass before deployment

---

**Last Updated:** January 7, 2025 (v3.9.0 - Major Refactoring)
**Next:** Build Tool 3 using this guide and the new shared utilities!
