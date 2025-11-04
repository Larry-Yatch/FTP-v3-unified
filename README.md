# Financial TruPath v3 - Modular Architecture

**Version:** 3.2.5 (Deploy @33)
**Status:** ✅ Production Ready - Tool 1 Complete + Two-Path Auth
**Architecture:** Plugin-based with configuration-driven insights
**Last Updated:** November 4, 2024

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
- ✅ Core framework complete and production-ready
- ✅ Tool 1 (Orientation Assessment) fully implemented and tested
- ✅ Navigation system rock-solid (all iframe issues resolved)
- ✅ FormUtils pattern proven and documented
- 🚧 Tool 2 ready to develop (2-4 hours estimated)
- ⏳ Tools 3-8 pending (templates ready)

## 📝 Version History

**v3.2.4** (November 4, 2024) - **Current Production**
- ✅ All iframe navigation issues resolved
- ✅ document.write() pattern for seamless navigation
- ✅ Loading animations on all navigation points
- ✅ Zero console errors or warnings
- ✅ Tool 1 complete with PDF reports

**v3.2.1** (November 4, 2024)
- Comprehensive iframe navigation fixes
- Standardized on document.write() pattern
- Added getDashboardPage() server function

**v3.1.0** (November 3, 2024)
- Fixed Tool 1 navigation (all 5 pages)
- Built reusable FormUtils framework
- Created MultiPageToolTemplate

**v3.0.1** (November 3, 2024)
- TruPath brand identity applied
- Complete UI styling system
- Login and dashboard pages

**v3.0.0** (November 3, 2024)
- Initial foundation deployment
- Core framework complete
- Configuration-driven insights system

---

## 🔗 Quick Links

- **Production URL (v3.2.5 @33):** https://script.google.com/macros/s/AKfycby2jz_X7tegGyK_yH1sea0ktd6KlvjIEnphrbrJADax3cttBkjNz96mXRkaCyeh-dB2/exec
- **Session Handoff:** [docs/SESSION-HANDOFF.md](docs/SESSION-HANDOFF.md) - Start here for current status
- **GitHub:** https://github.com/Larry-Yatch/FTP-v3-unified

---

*For v2 reference system, see: `/Users/Larry/code/FTP-v2/`*
