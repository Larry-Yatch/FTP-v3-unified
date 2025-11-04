# Financial TruPath v3 - Modular Architecture

**Version:** 3.0.0
**Status:** 🚧 In Development
**Architecture:** Plugin-based with configuration-driven insights

## 🎯 Project Goals

This is a ground-up rewrite of Financial TruPath with:
- **Modular tool system** - Add tools without touching core
- **Configuration-driven insights** - Define cross-tool intelligence via spreadsheet
- **Clean separation** - Core framework vs. tool implementations
- **Admin panel** - Full student & tool management
- **Linear progression** - Sequential tool access with admin overrides

## 📁 Project Structure

```
Financial-TruPath-v3/
├── core/                    # Core framework (don't touch after built)
│   ├── ToolRegistry.js      # Dynamic tool registration
│   ├── FrameworkCore.js     # Core framework logic
│   ├── InsightsPipeline.js  # Configuration-driven insights
│   ├── DataService.js       # Google Sheets integration
│   ├── Router.js            # Dynamic routing
│   └── ToolAccessControl.js # Access & permissions
│
├── tools/                   # Tool modules (completely independent)
│   ├── tool1/               # Each tool is self-contained
│   │   ├── tool.manifest.json
│   │   ├── Tool1.js
│   │   └── Tool1Insights.js
│   └── tool2/
│
├── admin/                   # Admin interface
│   ├── AdminDashboard.html
│   └── StudentManager.js
│
├── shared/                  # Shared UI components
│   ├── styles.html
│   └── ui-components.html
│
├── Code.js                  # Main entry point
└── Config.js                # System configuration
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create new Google Apps Script project
clasp create --type standalone --title "Financial TruPath v3"

# Push to Google Apps Script
npm run push

# Deploy
npm run deploy "Initial v3 deployment"

# Watch for changes (monitoring)
npm run watch
```

## 📊 Google Sheets Setup

**Required Spreadsheet:** Create "FTP-v3-Mastersheet" with these tabs:
- SESSIONS
- RESPONSES
- TOOL_STATUS
- TOOL_ACCESS
- CrossToolInsights (insights storage)
- InsightMappings (configuration/schema)
- ACTIVITY_LOG
- ADMINS
- CONFIG
- Students

Run initialization: `initializeAllSheets()` in Code.js

## 🏗️ Architecture Principles

### **1. Core Never Changes**
Once built, core framework shouldn't need modification when adding tools.

### **2. Tools are Plugins**
Each tool is a self-contained module that implements `ToolInterface`.

### **3. Configuration Over Code**
Insights and adaptations defined in `InsightMappings` spreadsheet, not hardcoded.

### **4. Registry-Based**
Tools register themselves; framework discovers them dynamically.

## 🔧 Adding a New Tool

1. Create `tools/toolN/` directory
2. Create `tool.manifest.json`
3. Implement `ToolN.js` following `ToolInterface`
4. Add insight mappings to `InsightMappings` sheet
5. Tool automatically discovered and routed

**No core code changes needed!**

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Migration Plan](docs/MIGRATION-PLAN.md)
- [Tool Development Guide](docs/TOOL-DEVELOPMENT-GUIDE.md)

## 🔄 Migration from v1

See [MIGRATION-PLAN.md](docs/MIGRATION-PLAN.md) for detailed migration strategy.

**Current Status:**
- ✅ Project structure created
- 🚧 Core framework in development
- ⏳ Tool 1 migration pending
- ⏳ Tool 2 migration pending

## 📝 Version History

**v3.0.0** (In Development)
- Complete architectural rewrite
- Modular plugin system
- Configuration-driven insights
- Full admin panel

---

*For v1 system, see: `/Users/Larry/code/Financial-TruPath-Unified-Platform/`*
