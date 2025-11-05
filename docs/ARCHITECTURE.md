# Financial TruPath v3 - Architecture Documentation

**Last Updated:** November 5, 2025
**Version:** v3.8.1

## 🎯 Core Principles

### **1. Core Never Changes**
Once built, the core framework should not need modification when adding new tools.

### **2. Tools are Plugins**
Each tool is a self-contained module implementing `ToolInterface`.

### **3. Configuration Over Code**
Insights and cross-tool intelligence defined in spreadsheet, not hardcoded.

### **4. Registry-Based Discovery**
Tools register themselves; framework discovers them dynamically.

### **5. AI-Enhanced Intelligence** *(NEW)*
GPT integration provides personalized insights while maintaining standardized scoring.

### **6. Data Integrity First** *(v3.3.0)*
All tool responses MUST use DataService.saveToolResponse() to ensure proper version control and Is_Latest column management.

### **7. User Gesture Preservation** *(v3.3.0)*
Navigation must happen IMMEDIATELY from user action (button click) to preserve browser user gesture. Server actions execute AFTER navigation via URL parameters.

---

## ⚠️ Critical Architectural Patterns

### **Navigation Pattern: Immediate Navigation with URL Parameters**

**Problem Solved:** Chrome's user gesture/activation requirement for iframe navigation.

**Pattern:**
```javascript
// Dashboard button (Router.js)
function editResponse() {
  // Navigate IMMEDIATELY (preserves user gesture)
  window.top.location.href = toolUrl + '?editMode=true';
  // NO async callback before navigation!
}

// Tool render() method
render(params) {
  const editMode = params.editMode === 'true';

  // Execute action AFTER navigation (page 1 only)
  if (editMode && page === 1) {
    DataService.loadResponseForEditing(clientId, this.id);
  }
}
```

**Why It Works:**
- User gesture preserved (navigation is synchronous from click)
- No white screen / security errors
- Server actions execute safely after page loads
- Consistent across all tools

**Bug Fixed:** Deploy @56 (99d0eeb) - User gesture navigation fix

---

### **Data Service Pattern: ALWAYS Use DataService for Saves**

**Problem Solved:** Manual sheet saves were missing Is_Latest column, breaking version control.

**Anti-Pattern (NEVER DO THIS):**
```javascript
// ❌ WRONG: Manual save (only 6 columns)
const row = [timestamp, clientId, toolId, data, version, status];
responseSheet.appendRow(row);
// Missing 7th column: Is_Latest
// Multiple rows have Is_Latest = true (BREAKS EVERYTHING)
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Use DataService
DataService.saveToolResponse(clientId, toolId, {
  data: formData,
  results: results,
  timestamp: new Date().toISOString()
});
// Automatically handles:
// - Is_Latest column (7 columns total)
// - Marks old versions as Is_Latest = false
// - Sets new version as Is_Latest = true
// - Version cleanup
```

**Why It Matters:**
- `getLatestResponse()` queries by `Is_Latest = true`
- Only ONE row per client/tool should have `Is_Latest = true`
- Manual saves create multiple `Is_Latest = true` rows
- Results in wrong data loaded for edit mode
- Version control completely broken

**Bug Fixed:** Deploy @58 (ec82987) - Tool1 missing Is_Latest column

---

### **Response Version Control: Is_Latest Column**

**Schema:**
```
RESPONSES Sheet Columns:
1. Timestamp
2. Client_ID
3. Tool_ID
4. Data (JSON)
5. Version
6. Status (COMPLETED | DRAFT | EDIT_DRAFT)
7. Is_Latest (true | false)  ← CRITICAL!
```

**Version Control Rules:**
1. Only ONE row per client/tool has `Is_Latest = true`
2. When saving new version:
   - Mark ALL old rows as `Is_Latest = false`
   - Set new row as `Is_Latest = true`
3. Keep last 2 COMPLETED versions (automatic cleanup)
4. DRAFT and EDIT_DRAFT rows don't count toward version limit

**Data Flow:**
```
New Submission:
1. Mark old COMPLETED row: Is_Latest = false
2. Save new COMPLETED row: Is_Latest = true
3. Delete DRAFT rows (if any)

Edit Mode:
1. Create EDIT_DRAFT: Is_Latest = true
2. Mark old COMPLETED: Is_Latest = false
3. On submit: Save new COMPLETED: Is_Latest = true
4. Delete EDIT_DRAFT row

Cancel Edit:
1. Restore old COMPLETED: Is_Latest = true
2. Delete EDIT_DRAFT row
```

**Why This Architecture:**
- Simple query: `WHERE Is_Latest = true` (fast, reliable)
- No MAX(Timestamp) queries (prone to errors)
- Version history preserved (last 2)
- Edit mode doesn't break production data
- Cancel edit safely restores original

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│              Main Entry Point (Code.js)         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              Router (Router.js)                 │
│  - Route matching                               │
│  - System vs. Tool routes                       │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
┌──────────────┐      ┌──────────────────┐
│ System Routes│      │   Tool Routes    │
│  - Login     │      │  - tool1, tool2  │
│  - Dashboard │      │  - Dynamic       │
│  - Admin     │      └────────┬─────────┘
└──────────────┘               │
                               ▼
                   ┌─────────────────────┐
                   │  ToolRegistry       │
                   │  - Discover tools   │
                   │  - Route matching   │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  FrameworkCore      │
                   │  - Initialize tool  │
                   │  - Process submission│
                   └──────────┬──────────┘
                              │
              ┌───────────────┼───────────────────┐
              ▼               ▼                   ▼
      ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐
      │ToolAccess    │ │ Insights     │ │  DataService    │
      │Control       │ │ Pipeline     │ │  (Persistence)  │
      └──────────────┘ └──────┬───────┘ └────────┬────────┘
                              │                   │
                              │                   ▼
                              │         ┌──────────────────┐
                              │         │ ResponseManager  │
                              │         │ (Version Control)│
                              │         │ - View/Edit      │
                              │         │ - Version History│
                              │         │ - Draft Mgmt     │
                              │         └────────┬─────────┘
                              │                  │
                    ┌─────────┴─────────┬────────┘
                    ▼                   ▼
         ┌─────────────────┐  ┌──────────────────┐
         │ OpenAI Service  │  │  Google Sheets   │
         │ (GPT-4o-mini)   │  │ - Insights       │
         │ (v3.2.0)        │  │ - Mappings       │
         └─────────────────┘  │ - RESPONSES      │
                              │   • Is_Latest ✓  │
                              │   • Status       │
                              │   • Version Data │
                              └──────────────────┘
```

---

## 📦 Core Components

### **1. ToolRegistry (`core/ToolRegistry.js`)**
**Purpose:** Central registry for all tools.

**Responsibilities:**
- Tool registration and validation
- Route matching (URL → Tool)
- Tool discovery
- Pattern-based queries

**Key Methods:**
- `register(toolId, toolModule, manifest)` - Register a tool
- `get(toolId)` - Get tool by ID
- `findByRoute(route)` - Find tool by URL route
- `getAllTools()` - Get all registered tools

### **2. FrameworkCore (`core/FrameworkCore.js`)**
**Purpose:** Generic tool lifecycle management.

**Responsibilities:**
- Tool initialization
- Submission processing
- Progress tracking
- Next tool recommendation

**Key Methods:**
- `initializeTool(toolId, clientId)` - Setup tool with insights
- `processToolSubmission(toolId, clientId, data)` - Handle submission
- `getNextTool(clientId, currentToolId)` - Recommend next

**NO tool-specific code here!**

### **3. InsightsPipeline (`core/InsightsPipeline.js`)**
**Purpose:** Configuration-driven cross-tool intelligence.

**Responsibilities:**
- Generate insights based on `InsightMappings` configuration
- Store insights in `CrossToolInsights`
- Provide insights to downstream tools
- Apply adaptations

**Key Methods:**
- `processToolCompletion(toolId, clientId, data)` - Generate insights
- `prepareToolLaunch(toolId, clientId)` - Load insights
- `adaptToolForInsights(toolId, insights)` - Apply adaptations

**Data Sources:**
- Reads from: `InsightMappings` sheet (configuration)
- Writes to: `CrossToolInsights` sheet (runtime data)

### **4. DataService (`core/DataService.js`)**
**Purpose:** Data persistence layer with version control.

**Responsibilities:**
- Save/retrieve tool responses with Is_Latest management
- Manage sessions
- Track tool status
- Log activities
- Wrapper for ResponseManager (version control)

**⚠️ CRITICAL: All tool saves MUST go through DataService.saveToolResponse()**

**Why This Is Non-Negotiable:**
- Manual sheet saves miss the Is_Latest column (only 6 columns instead of 7)
- Creates data integrity issues (multiple rows with Is_Latest = true)
- Breaks version control, edit mode, and report display
- Bug reference: Deploy @58 (ec82987)

**Key Methods:**
- `saveToolResponse(clientId, toolId, data, status)` - **USE THIS FOR ALL SAVES**
  - Marks old versions as Is_Latest = false
  - Sets new version as Is_Latest = true
  - Handles version cleanup (keeps last 2)
  - Manages DRAFT/EDIT_DRAFT/COMPLETED states
- `getToolResponse(clientId, toolId)` - Get response (legacy)
- `getLatestResponse(clientId, toolId)` - Get current version (WHERE Is_Latest = true)
- `getPreviousResponse(clientId, toolId)` - Get old version (WHERE Is_Latest = false)
- `getActiveDraft(clientId, toolId)` - Check for DRAFT or EDIT_DRAFT
- `updateToolStatus(clientId, toolId, status)` - Update status
- `validateSession(sessionId)` - Check session validity
- `loadResponseForEditing(clientId, toolId)` - Load for edit (creates EDIT_DRAFT)
- `submitEditedResponse(clientId, toolId, data)` - Save edited (via ResponseManager)
- `cancelEditDraft(clientId, toolId)` - Cancel editing (restore original)
- `startFreshAttempt(clientId, toolId)` - Clear drafts (for retake)

### **5. ResponseManager (`core/ResponseManager.js`)** *(NEW v3.3.0)*
**Purpose:** Response lifecycle and version management.

**Responsibilities:**
- View/Edit/Retake functionality for all tools
- Version control (keeps last 2 versions)
- Draft management (DRAFT, EDIT_DRAFT, COMPLETED)
- Automatic cleanup of old versions
- Audit trail with `Is_Latest` flags

**Key Methods:**
- `getLatestResponse(clientId, toolId)` - Get current (COMPLETED or DRAFT)
- `getPreviousResponse(clientId, toolId)` - Get previous version
- `getAllResponses(clientId, toolId, limit)` - Get history
- `getActiveDraft(clientId, toolId)` - Check for in-progress edits
- `loadResponseForEditing(clientId, toolId)` - Create EDIT_DRAFT
- `submitEditedResponse(clientId, toolId, data)` - Save edited version
- `cancelEditDraft(clientId, toolId)` - Restore original
- `startFreshAttempt(clientId, toolId)` - Clear drafts

**Version Control Logic:**
- Marks old versions as `Is_Latest = false`
- New versions always `Is_Latest = true`
- Only ONE row per client/tool has `Is_Latest = true`
- Automatically deletes versions beyond last 2 COMPLETED

**Status Types:**
- `COMPLETED` - Finished assessment (visible on reports)
- `DRAFT` - In-progress new assessment
- `EDIT_DRAFT` - In-progress editing of completed assessment

**Data Flow - Edit Mode:**
```
1. Student clicks "Edit Answers"
2. ResponseManager.loadResponseForEditing()
   - Gets latest COMPLETED response
   - Creates new row: Status='EDIT_DRAFT', Is_Latest='true'
   - Marks old as Is_Latest='false'
   - Adds metadata: _editMode, _originalTimestamp
3. Form loads with edit banner + pre-filled data
4. Student makes changes, navigates pages
5. Student submits
6. Tool detects _editMode=true
7. ResponseManager.submitEditedResponse()
   - Saves new COMPLETED row with Is_Latest='true'
   - Old versions remain with Is_Latest='false'
   - Cleans up (keeps last 2)
```

**Why Separate from DataService:**
- Cleaner separation of concerns
- Version logic isolated and testable
- Reusable across all 8 tools without modification
- Easy to extend (e.g., add "Compare Versions" later)

### **6. ToolAccessControl (`core/ToolAccessControl.js`)**
**Purpose:** Access control and progression.

**Responsibilities:**
- Linear progression enforcement
- Admin lock/unlock capabilities
- Auto-unlock when prerequisites met
- Student initialization

**Key Methods:**
- `canAccessTool(clientId, toolId)` - Check access
- `adminUnlockTool(clientId, toolId, admin, reason)` - Manual unlock
- `adminLockTool(clientId, toolId, admin, reason)` - Manual lock
- `initializeStudent(clientId)` - Setup new student

### **7. Router (`core/Router.js`)**
**Purpose:** Registry-based routing with user gesture preservation.

**Responsibilities:**
- Route incoming requests
- Differentiate system vs. tool routes
- Load appropriate handler
- Session validation
- Dynamic dashboard generation based on tool status
- **CRITICAL:** Navigate immediately with URL params (preserves user gesture)

**Dashboard Logic (Updated v3.3.0):**
- Checks ResponseManager for tool status
- Shows different UI based on state:
  - Not started: "Start Assessment" button
  - In Progress (draft): "Continue" + "Discard Draft"
  - Completed: "View Report" + "Edit Answers" + "Start Fresh"

**Navigation Pattern (CRITICAL):**
```javascript
// ✅ CORRECT: Immediate navigation
function editResponse() {
  window.top.location.href = toolUrl + '?editMode=true';
}

function retakeTool() {
  window.top.location.href = toolUrl + '?clearDraft=true';
}

// ❌ WRONG: Async callback (loses user gesture)
function editResponse() {
  google.script.run
    .withSuccessHandler(() => {
      window.top.location.href = toolUrl; // TOO LATE!
    })
    .loadResponseForEditing(...);
}
```

**Why This Matters:**
- Chrome requires user gesture for iframe → top navigation
- Async callbacks lose user gesture/activation
- Results in white screen + security error
- Bug reference: Deploy @56 (99d0eeb)

**No hardcoded tool routes!**

### **8. GPT Integration Pattern** *(UPDATED v3.8.0)*
**Purpose:** Tool-specific GPT integration for personalized insights.

**Architecture Decision:** Each tool creates its own GPT files (not centralized service)

**Tool-Specific Files:**
```
tools/toolN/
├── ToolN.js                    # Main tool (adds background processing)
├── ToolNReport.js              # Report display (adds insight sections)
├── ToolNFallbacks.js          # Domain-specific fallback insights
└── ToolNGPTAnalysis.js        # GPT prompts + 3-tier fallback system
```

**Why Tool-Specific (Not Centralized):**
- ✅ Each tool has unique prompts and fallback logic
- ✅ True plugin architecture (no shared dependencies)
- ✅ Easy to test independently
- ✅ Clear code ownership per tool
- ✅ No "god object" service

**3-Tier Fallback System:**
```
TIER 1: Try GPT (gpt-4o-mini) → Success? Return personalized insight
   ↓
TIER 2: Retry GPT after 2s → Success? Return personalized insight
   ↓
TIER 3: Use domain-specific fallback → Always succeeds (100% reliability)
```

**Background Processing Pattern:**
- GPT calls triggered during form completion (async, non-blocking)
- Stored in PropertiesService until submission
- Final synthesis at submission (~3 second wait)
- User never waits for background processing

**Configuration (per tool):**
- Model: `gpt-4o-mini` (individual insights), `gpt-4o` (synthesis)
- Temperature: 0.2-0.3 (factual, consistent)
- Max tokens: 300 (insights), 600 (synthesis)
- Cost: ~$0.02-0.03 per student
- Reliability: 100% via fallback system

**Complete Implementation Guide:**
📘 See `docs/GPT-INTEGRATION-QUICKSTART.md` (60KB comprehensive guide)

**Production Example:**
- Tool 2: `tools/tool2/Tool2GPTAnalysis.js` (22 KB)
- Tool 2: `tools/tool2/Tool2Fallbacks.js` (21 KB)
- Status: ✅ Production-proven (v3.8.0)

---

## 🛠️ Tool Interface Contract

Every tool MUST implement:

```javascript
const ToolN = {
  id: 'toolN',              // Unique identifier

  // REQUIRED METHODS
  render(params) {
    // CRITICAL: Handle URL parameters for navigation
    const editMode = params.editMode === 'true';
    const clearDraft = params.clearDraft === 'true';
    const page = parseInt(params.page) || 1;

    // Execute actions on page 1 AFTER navigation (with user gesture)
    if (editMode && page === 1) {
      DataService.loadResponseForEditing(clientId, this.id);
    }
    if (clearDraft && page === 1) {
      DataService.startFreshAttempt(clientId, this.id);
    }

    // Render UI...
    // Returns: HtmlOutput
  },

  initialize(dependencies, insights) {
    // Setup tool with framework services and previous insights
    // NOTE: GPT integration is tool-specific (ToolNGPTAnalysis.js), not via dependencies
    // Returns: { success: boolean, error?: string }
  },

  validate(data) {
    // Validate form data
    // Returns: { valid: boolean, errors: Array<string> }
  },

  process(clientId, data) {
    // Process submission
    // CRITICAL: Check _editMode flag before unlocking next tool
    const isEditMode = data._editMode === true;

    // CRITICAL: Use DataService.saveToolResponse() - NEVER manual sheet.appendRow()
    DataService.saveToolResponse(clientId, this.id, {
      data: data,
      results: results
    });

    // Returns: { success: boolean, result: any, error?: string }
  },

  getExistingData(clientId) {
    // CRITICAL: Check DataService.getActiveDraft() FIRST
    if (typeof DataService !== 'undefined') {
      const draft = DataService.getActiveDraft(clientId, this.id);
      if (draft) return draft.data;
    }
    // Fallback to legacy method...
    // Returns: Object or null
  },

  generateInsights(data, clientId) {
    // Generate insights for other tools
    // Can use OpenAIService for enhanced insights
    // Returns: Array<Insight>
  },

  getConfig() {
    // Return tool manifest
    // Returns: Object (manifest)
  },

  // OPTIONAL METHODS
  adaptBasedOnInsights(insights) {
    // Adapt based on previous tool insights
    // Returns: Object (adaptations)
  }
};
```

---

## 📊 Configuration-Driven Insights

### **InsightMappings Sheet Structure**

| Column | Purpose | Example |
|--------|---------|---------|
| Tool_ID | Source tool | `tool1` |
| Insight_Type | Type of insight | `age_urgency` |
| Condition | Human-readable | `age >= 55` |
| Condition_Logic | JSON config | `{"field":"age","operator":">=","value":55}` |
| Priority | Importance | `HIGH` |
| Content_Template | Message with placeholders | `Near retirement age ({age})` |
| Target_Tools | JSON array | `["tool2","tool6"]` |
| Adaptation_Type | How to adapt | `emphasize_section` |
| Adaptation_Details | JSON config | `{"section":"retirement"}` |

### **Adding New Insights**

To add insights for a new tool, simply **add rows** to `InsightMappings` sheet. No code changes needed!

```
Tool 3 row example:
tool3 | false_self_high | falseSelfScore > 7 | {...} | HIGH | ... | ["tool4"] | custom_guidance | {...}
```

Framework automatically:
- Evaluates conditions
- Generates insights
- Stores in `CrossToolInsights`
- Provides to target tools

---

## 🔄 Tool Lifecycle

### **1. Tool Registration (Startup)**
```javascript
// Tool registers itself
ToolRegistry.register('tool1', Tool1Module, Tool1Manifest);
```

### **2. Tool Launch**
```
User → Route → ToolRegistry.findByRoute() → FrameworkCore.initializeTool()
                                              ↓
                                    InsightsPipeline.prepareToolLaunch()
                                              ↓
                                    Tool.initialize(deps, insights)
                                              ↓
                                    Tool.adaptBasedOnInsights(insights)
                                              ↓
                                    UI rendered with adaptations
```

### **3. Tool Submission**
```
Form Submit → FrameworkCore.processToolSubmission()
                      ↓
              Tool.validate(data)
                      ↓
              Tool.process(clientId, data)
                      ↓
              DataService.saveToolResponse()
                      ↓
              Tool.generateInsights(data)
                      ↓
              [OPTIONAL] OpenAIService.batchAnalyze() - Enhanced insights
                      ↓
              InsightsPipeline.processToolCompletion()
                      ↓
              Insights saved to CrossToolInsights
                      ↓
              Auto-unlock next tool
```

---

## 🔐 Access Control Flow

### **Linear Progression**
- Tool 1 always accessible
- Tool N requires Tool N-1 completed
- Automatic unlock when prerequisite met

### **Admin Override**
- Admin can manually unlock any tool
- Admin can lock completed tools
- All actions logged to `ACTIVITY_LOG`

### **Check Flow**
```
ToolAccessControl.canAccessTool(client, tool)
    ↓
Check TOOL_ACCESS sheet for explicit status
    ↓
If 'unlocked' → Allow
If 'locked' → Deny
If 'pending' → Check prerequisites
    ↓
If prerequisites met → Auto-unlock → Allow
Else → Deny with reason
```

---

## 🎨 Adding a New Tool

### **Step 1: Create Tool Module**
```javascript
// tools/tool3/Tool3.js
const Tool3 = {
  id: 'tool3',

  initialize(deps, insights) {
    // deps.openAI available if needed
    /* ... */
  },
  validate(data) { /* ... */ },
  process(clientId, data) { /* ... */ },
  generateInsights(data, clientId) {
    // Can use OpenAIService for enhanced insights
    const aiInsights = await deps.openAI.chat(prompt);
    /* ... */
  },
  getConfig() { return Tool3Manifest; }
};
```

### **Step 2: Create Manifest**
```json
// tools/tool3/tool.manifest.json
{
  "id": "tool3",
  "name": "False Self / External Validation",
  "version": "1.0.0",
  "pattern": "form",
  "routes": ["/tool3", "/false-self"],
  "prerequisites": ["tool1", "tool2"],
  "usesGPT": true,
  "estimatedCost": 0.03
}
```

### **Step 3: Register Tool**
```javascript
// In Code.js or tool file
ToolRegistry.register('tool3', Tool3, Tool3Manifest);
```

### **Step 4: Add Insight Mappings**
Add rows to `InsightMappings` sheet defining what insights Tool 3 generates.

### **That's it!**
- Framework automatically discovers tool
- Routes requests to it
- Handles lifecycle
- Manages insights
- Provides OpenAI service if needed

---

## 🤖 GPT Integration Architecture (v3.8.0 Production Pattern)

### **Design Philosophy**

**Hybrid Approach:**
- **Quantitative scoring** (algorithmic, standardized, comparable)
- **Qualitative insights** (GPT-powered, personalized, actionable)

**Why This Works:**
- Scores provide objective measurement and progress tracking
- GPT provides personalized context and recommendations
- 3-tier fallback ensures 100% reliability
- Best of both worlds: data + narrative

### **When to Use GPT**

**Good Use Cases:**
✅ Analyzing free-text responses for patterns
✅ Generating personalized recommendations from student's specific examples
✅ Creating narrative insights that connect domain scores to stories
✅ Trauma-informed coaching language
✅ Synthesizing insights across multiple domains

**Bad Use Cases:**
❌ Replacing scoring logic (always use algorithms for scores)
❌ Making access control decisions (security risk)
❌ Storing sensitive PII (privacy concern)
❌ Real-time form interactions (too slow, use background processing)
❌ Generating generic advice (use domain-specific fallbacks instead)

### **Production GPT Pattern (Tool-Specific)**

**Architecture:** Each tool creates its own GPT files (not centralized)

**Step 1: Background Processing During Form**
```javascript
// In ToolN.js - savePageData()
savePageData(clientId, page, formData) {
  // Save form data
  PropertiesService.getUserProperties().setProperty(draftKey, JSON.stringify(mergedData));

  // Trigger background GPT (non-blocking)
  this.triggerBackgroundGPTAnalysis(page, clientId, formData, mergedData);
}

// Triggers GPT for pages with free-text fields
triggerBackgroundGPTAnalysis(page, clientId, formData, allData) {
  const triggers = {
    2: [{field: 'q1_freetext', type: 'response1'}],
    3: [{field: 'q2_freetext', type: 'response2'}]
  };

  triggers[page]?.forEach(trigger => {
    if (formData[trigger.field]) {
      this.analyzeResponseInBackground(clientId, trigger.type, formData[trigger.field], allData);
    }
  });
}
```

**Step 2: 3-Tier Fallback System**
```javascript
// In ToolNGPTAnalysis.js
analyzeResponse({clientId, responseType, responseText, previousInsights, formData, domainScores}) {
  // TIER 1: Try GPT
  try {
    const result = this.callGPT({systemPrompt, userPrompt, model: 'gpt-4o-mini'});
    if (this.isValidInsight(result)) {
      return {...result, source: 'gpt'};
    }
  } catch (error) {
    // TIER 2: Retry GPT after 2s
    try {
      Utilities.sleep(2000);
      const result = this.callGPT({systemPrompt, userPrompt, model: 'gpt-4o-mini'});
      if (this.isValidInsight(result)) {
        return {...result, source: 'gpt_retry'};
      }
    } catch (retryError) {
      // TIER 3: Use domain-specific fallback (always succeeds)
      const fallback = ToolNFallbacks.getFallbackInsight(responseType, formData, domainScores);
      this.logFallbackUsage(clientId, responseType, retryError.message);
      return {...fallback, source: 'fallback'};
    }
  }
}
```

**Step 3: Final Synthesis at Submission**
```javascript
// In ToolN.js - processFinalSubmission()
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);
  const results = this.calculateScores(allData);

  // Get pre-computed insights from PropertiesService
  const gptInsights = this.getExistingInsights(clientId);

  // Retry any that failed
  const missingInsights = requiredInsights.filter(key => !gptInsights[key]);
  missingInsights.forEach(key => {
    gptInsights[key] = ToolNGPTAnalysis.analyzeResponse({...});
  });

  // Final synthesis (connects all insights)
  const overallInsight = ToolNGPTAnalysis.synthesizeOverall(clientId, gptInsights, results.domainScores);

  // Save everything
  DataService.saveToolResponse(clientId, 'toolN', {
    data: allData,
    results: results,
    gptInsights: gptInsights,
    overallInsight: overallInsight
  });

  // Cleanup
  PropertiesService.getUserProperties().deleteProperty(`toolN_draft_${clientId}`);
  PropertiesService.getUserProperties().deleteProperty(`toolN_gpt_${clientId}`);
}
```

### **Cost Management Strategy**

**Production Costs (Tool 2 actual):**
- 8 individual analyses × gpt-4o-mini ($0.0025 each) = $0.020
- 1 synthesis × gpt-4o ($0.003) = $0.003
- **Total per student: $0.023**

**Optimization Techniques:**
1. **Background Processing:** Analyze during form (user doesn't wait)
2. **Smart Caching:** Check PropertiesService before re-analyzing
3. **Duplicate Prevention:** Skip if insight already exists (back/forward navigation)
4. **Prompt Engineering:** Clear, concise prompts (Pattern/Insight/Action format)
5. **Model Selection:** gpt-4o-mini for insights, gpt-4o for synthesis

**Reliability:**
- 3-tier fallback ensures 100% completion
- Fallback rate: < 5% in production (Tool 2)
- Domain-specific fallbacks (not generic templates)
- Logging: GPT_FALLBACK_LOG sheet tracks failures

**Performance:**
- Background: ~24s total GPT time (during form, non-blocking)
- User wait: ~3s at submission (synthesis only)
- OpenAI rate limit: 500 RPM (can serve ~60 students/minute)

### **Complete Implementation Guide**

📘 **See:** `docs/GPT-INTEGRATION-QUICKSTART.md` (60KB comprehensive guide)

**Working Examples:**
- `tools/tool2/Tool2GPTAnalysis.js` (22 KB, 8 prompts)
- `tools/tool2/Tool2Fallbacks.js` (21 KB, 7 domains)
- Status: ✅ Production-proven in Tool 2 (v3.8.0)

---

## 📈 Scalability

**Current:** 8 tools planned

**Future:** Can support 50+ tools without core changes

**Why it scales:**
- Registry-based (not hardcoded)
- Configuration-driven insights
- Plugin architecture (tools are independent)
- Shared framework
- Tool-specific GPT (no shared bottlenecks)

**Performance Considerations:**
- OpenAI rate limits: 500 RPM (gpt-4o-mini)
- Can serve ~60 students/minute
- Background processing during form (user doesn't wait)
- Smart caching prevents duplicate API calls
- Async processing prevents UI blocking

---

## 🎯 Key Benefits Over v2

| Aspect | v2 | v3 |
|--------|----|----|
| **Adding tools** | Modify core files | Create folder + config |
| **Insights** | Hardcoded | Configuration sheet |
| **Routing** | if/else chains | Registry lookup |
| **Testing** | Production only | Isolated modules |
| **Maintenance** | High coupling | Low coupling |
| **Onboarding** | Complex | Clear patterns |
| **Personalization** | Static templates | AI-enhanced insights |
| **Scalability** | ~8 tools max | 50+ tools supported |

---

## 🔒 Security & Privacy

### **API Key Management**
- OpenAI key stored in Script Properties (encrypted)
- Never exposed to client
- Rotated quarterly

### **Data Privacy**
- Student responses stored in Google Sheets (private)
- GPT prompts contain anonymized data only
- No PII sent to OpenAI
- Insights cached locally, not on OpenAI servers

### **Rate Limiting**
- Per-student: Max 1 report/minute
- System-wide: 500 requests/minute (OpenAI limit)
- Graceful degradation if limits exceeded

---

## 📊 Tool-Specific Architectures

### **Tool 1: Core Trauma Strategy Assessment**
- **Pattern:** Multi-page form (5 pages, 26 questions)
- **Scoring:** Algorithmic (6 trauma categories)
- **GPT:** Not used (pure quantitative)
- **Report:** Template-based with calculated scores

### **Tool 2: Financial Clarity Assessment** *(NEW)*
- **Pattern:** Multi-page form (5 pages, 57 questions)
- **Scoring:** Hybrid (algorithmic + GPT)
  - Domain scores: Algorithmic (5 domains)
  - Stress weighting: Algorithmic (5, 4, 2, 1, 1)
  - Priority tiers: Algorithmic (High/Med/Low)
  - Insights: GPT-enhanced (8 API calls)
- **GPT Usage:**
  - Analyze free-text responses (8 questions)
  - Generate domain-specific insights
  - Create trauma-informed recommendations
  - Synthesize growth archetype narrative
- **Report:** Hybrid (scores + AI insights)
- **Adaptive:** Top 1 trauma from Tool 1 → 2 custom questions
- **Estimated Cost:** $0.01-0.05 per report

### **Tool 3-8:** TBD (follow similar patterns)

---

## 🧪 Testing Strategy

### **Unit Testing**
- Each tool module independently testable
- Mock dependencies (DataService, OpenAI, etc.)
- Validate scoring logic with known inputs

### **Integration Testing**
- Tool lifecycle end-to-end
- Cross-tool insight propagation
- GPT integration with real API (staging)

### **Load Testing**
- Simulate 100 concurrent students
- Measure OpenAI rate limit handling
- Cache effectiveness validation

---

## 🚀 Future Enhancements

### **Phase 1 (Current):** ✅ Core framework + Tools 1-2
### **Phase 2:** Tools 3-8 implementation
### **Phase 3:** Admin dashboard enhancements
### **Phase 4:** Advanced features
- Real-time collaboration (multi-coach access)
- Mobile app integration
- Offline mode with sync
- Advanced analytics dashboard
- White-label deployments

### **AI Enhancements:**
- Voice-to-text for responses
- Image analysis (uploaded financial docs)
- Predictive modeling (financial trajectory)
- Conversational follow-ups (chatbot)

---

**Next:** See `SETUP-GUIDE.md` for implementation instructions.

---

## 📝 Change Log

**v3.3.0 - November 4, 2025:**
- Added Critical Architectural Patterns section
- Documented Navigation Pattern (immediate navigation with URL params)
- Documented Data Service Pattern (ALWAYS use DataService.saveToolResponse)
- Documented Response Version Control (Is_Latest column)
- Updated Tool Interface Contract with critical patterns
- Added bug references: Deploy @56, @57, @58
- Updated DataService documentation with version control details
- Updated Router documentation with user gesture preservation

**v3.2.0 - November 4, 2024:**
- Added OpenAIService architecture and Tool 2 specifications
