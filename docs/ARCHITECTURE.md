# Financial TruPath v3 - Architecture Documentation

## 🎯 Core Principles

### **1. Core Never Changes**
Once built, the core framework should not need modification when adding new tools.

### **2. Tools are Plugins**
Each tool is a self-contained module implementing `ToolInterface`.

### **3. Configuration Over Code**
Insights and cross-tool intelligence defined in spreadsheet, not hardcoded.

### **4. Registry-Based Discovery**
Tools register themselves; framework discovers them dynamically.

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
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
      │ToolAccess    │ │ Insights     │ │ DataService │
      │Control       │ │ Pipeline     │ │             │
      └──────────────┘ └──────────────┘ └─────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Google Sheets      │
                   │  - CrossToolInsights│
                   │  - InsightMappings  │
                   │  - RESPONSES        │
                   └─────────────────────┘
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

**Key Methods:**
- `saveToolResponse(clientId, toolId, data)`
- `getToolResponse(clientId, toolId)`
- `updateToolStatus(clientId, toolId, status)`
- `validateSession(sessionId)`

### **5. ToolAccessControl (`core/ToolAccessControl.js`)**
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

### **6. Router (`core/Router.js`)**
**Purpose:** Registry-based routing.

**Responsibilities:**
- Route incoming requests
- Differentiate system vs. tool routes
- Load appropriate handler
- Session validation

**No hardcoded tool routes!**

---

## 🛠️ Tool Interface Contract

Every tool MUST implement:

```javascript
const ToolN = {
  id: 'toolN',              // Unique identifier

  // REQUIRED METHODS
  initialize(dependencies, insights) {
    // Setup tool with framework services and previous insights
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

  initialize(deps, insights) { /* ... */ },
  validate(data) { /* ... */ },
  process(clientId, data) { /* ... */ },
  generateInsights(data, clientId) { /* ... */ },
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
  "prerequisites": ["tool1", "tool2"]
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

---

## 📈 Scalability

**Current:** 8 tools planned

**Future:** Can support 50+ tools without core changes

**Why it scales:**
- Registry-based (not hardcoded)
- Configuration-driven insights
- Plugin architecture
- Shared framework

---

## 🎯 Key Benefits Over v1

| Aspect | v1 | v3 |
|--------|----|----|
| **Adding tools** | Modify core files | Create folder + config |
| **Insights** | Hardcoded | Configuration sheet |
| **Routing** | if/else chains | Registry lookup |
| **Testing** | Production only | Isolated modules |
| **Maintenance** | High coupling | Low coupling |
| **Onboarding** | Complex | Clear patterns |

---

**Next:** See `SETUP-GUIDE.md` for implementation instructions.
