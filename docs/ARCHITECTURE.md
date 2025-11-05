# Financial TruPath v3 - Architecture Documentation

**Last Updated:** November 4, 2024
**Version:** v3.3.0

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
**Purpose:** Data persistence layer.

**Responsibilities:**
- Save/retrieve tool responses
- Manage sessions
- Track tool status
- Log activities
- Wrapper for ResponseManager (version control)

**Key Methods:**
- `saveToolResponse(clientId, toolId, data, status)` - Save with status
- `getToolResponse(clientId, toolId)` - Get response (legacy)
- `getLatestResponse(clientId, toolId)` - Get current version
- `getPreviousResponse(clientId, toolId)` - Get old version
- `updateToolStatus(clientId, toolId, status)` - Update status
- `validateSession(sessionId)` - Check session validity
- `loadResponseForEditing(clientId, toolId)` - Load for edit
- `submitEditedResponse(clientId, toolId, data)` - Save edited
- `cancelEditDraft(clientId, toolId)` - Cancel editing
- `startFreshAttempt(clientId, toolId)` - Clear drafts

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
**Purpose:** Registry-based routing.

**Responsibilities:**
- Route incoming requests
- Differentiate system vs. tool routes
- Load appropriate handler
- Session validation
- Dynamic dashboard generation based on tool status

**Dashboard Logic (Updated v3.3.0):**
- Checks ResponseManager for tool status
- Shows different UI based on state:
  - Not started: "Start Assessment" button
  - In Progress (draft): "Continue" + "Discard Draft"
  - Completed: "View Report" + "Edit Answers" + "Start Fresh"

**No hardcoded tool routes!**

### **8. OpenAIService (`core/OpenAIService.js`)** *(NEW v3.2.0)*
**Purpose:** Centralized GPT integration for personalized insights.

**Responsibilities:**
- API key management
- Rate limiting and error handling
- Standardized prompt formatting
- Response caching (30-day TTL)
- Cost tracking

**Key Methods:**
- `chat(prompt, options)` - Single completion
- `batchAnalyze(prompts)` - Parallel completions (efficient)
- `getCachedInsight(cacheKey)` - Retrieve cached analysis
- `setCachedInsight(cacheKey, data, ttl)` - Cache for reuse

**Configuration:**
- Model: `gpt-4o-mini` (cost-efficient, fast)
- Max tokens: 500 per insight
- Temperature: 0.7 (balanced creativity)
- Timeout: 10s per request

**Usage Pattern:**
```javascript
// In Tool Report generation
const insights = await OpenAIService.batchAnalyze([
  { prompt: moneyFlowPrompt, cacheKey: `mf_${clientId}` },
  { prompt: obligationsPrompt, cacheKey: `ob_${clientId}` },
  { prompt: traumaPrompt, cacheKey: `tr_${clientId}` }
]);
```

**Cost Management:**
- ~$0.01-0.05 per full report (8 API calls)
- Cached insights reduce repeat costs
- Budget monitoring via usage tracking sheet

**Why Centralized:**
- Consistent error handling across all tools
- Rate limiting prevents API quota exhaustion
- Caching reduces costs and latency
- Easy to swap models or providers later
- Tracks usage for billing/analytics

---

## 🛠️ Tool Interface Contract

Every tool MUST implement:

```javascript
const ToolN = {
  id: 'toolN',              // Unique identifier

  // REQUIRED METHODS
  initialize(dependencies, insights) {
    // Setup tool with framework services and previous insights
    // dependencies.openAI available for tools needing GPT
    // Returns: { success: boolean, error?: string }
  },

  validate(data) {
    // Validate form data
    // Returns: { valid: boolean, errors: Array<string> }
  },

  process(clientId, data) {
    // Process submission
    // Returns: { success: boolean, result: any, error?: string }
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

## 🤖 GPT Integration Architecture

### **Design Philosophy**

**Hybrid Approach:**
- **Quantitative scoring** (standardized, comparable)
- **Qualitative insights** (personalized, actionable)

**Why This Works:**
- Scores provide objective measurement and progress tracking
- GPT provides personalized context and recommendations
- Best of both worlds: data + narrative

### **When to Use GPT**

**Good Use Cases:**
✅ Analyzing free-text responses for patterns
✅ Generating personalized recommendations
✅ Creating narrative insights from data
✅ Trauma-informed coaching language
✅ Growth archetype descriptions

**Bad Use Cases:**
❌ Replacing scoring logic (use algorithms)
❌ Making access control decisions (security risk)
❌ Storing sensitive data (privacy concern)
❌ Real-time form interactions (latency)

### **GPT Integration Pattern**

**In Tool Reports:**
```javascript
// Tool2Report.js example
async buildReport(results, data, clientId) {
  // 1. Calculate objective scores (algorithmic)
  const domainScores = this.calculateDomains(data);
  const priorities = this.prioritizeDomains(domainScores);

  // 2. Generate AI insights (personalized)
  const insights = await OpenAIService.batchAnalyze([
    this.buildMoneyFlowPrompt(data, domainScores.moneyFlow),
    this.buildObligationsPrompt(data, domainScores.obligations),
    this.buildTraumaPrompt(data, traumaData)
  ]);

  // 3. Combine for comprehensive report
  return {
    scores: domainScores,        // Objective
    priorities: priorities,       // Algorithmic
    insights: insights,          // Personalized
    archetype: this.generateArchetype(priorities, insights)
  };
}
```

### **Cost Management Strategy**

**Current Costs (GPT-4o-mini):**
- Input: ~$0.15 / 1M tokens
- Output: ~$0.60 / 1M tokens
- Typical report: 8 prompts × ~200 tokens = ~$0.02

**Optimization:**
1. **Caching:** Store insights for 30 days, reuse if student re-generates
2. **Batching:** Parallel API calls reduce total time
3. **Prompt Engineering:** Clear, concise prompts minimize tokens
4. **Model Choice:** gpt-4o-mini balances cost/quality

**Budget Monitoring:**
- Track usage in `AI_USAGE_LOG` sheet
- Alert if daily costs exceed threshold
- Per-student cost tracking for analytics

**Future-Proofing:**
- Abstracted service layer allows model swapping
- Can upgrade to gpt-4o for premium tier
- Can fall back to templates if API unavailable

---

## 📈 Scalability

**Current:** 8 tools planned

**Future:** Can support 50+ tools without core changes

**Why it scales:**
- Registry-based (not hardcoded)
- Configuration-driven insights
- Plugin architecture
- Shared framework
- Centralized AI service

**Performance Considerations:**
- OpenAI rate limits: 500 RPM (gpt-4o-mini)
- Can serve ~60 students/minute
- Caching reduces API calls by ~40%
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

**Updated:** November 4, 2024 - Added OpenAIService architecture and Tool 2 specifications
