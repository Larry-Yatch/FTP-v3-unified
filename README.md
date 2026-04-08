# Financial TruPath v3

**Status:** Production
**Architecture:** Plugin-based Google Apps Script web app
**Repository:** https://github.com/Larry-Yatch/FTP-v3-unified

---

## What This Is

Financial TruPath v3 (FTP-v3) is a trauma-informed financial planning platform that guides clients through an 8-tool progressive assessment and planning sequence. It first uncovers the psychological patterns driving financial decisions, then uses those discoveries to personalize concrete financial tools — budgets, retirement blueprints, and investment plans.

Built entirely on Google Apps Script with a Google Sheets data store and OpenAI GPT-4o integration for real-time narrative analysis.

**Scale:** ~69,000 lines of production JavaScript across 89 files, plus 11,700 lines of HTML templates.

---

## The 8-Tool System

```
PSYCHOLOGICAL FOUNDATION          FINANCIAL APPLICATION
========================          =====================
Tool 1: Core Pattern Assessment → Tool 2: Financial Clarity
Tool 3: Identity Grounding      → Tool 4: Budget Framework
Tool 5: Love & Connection       → Tool 6: Retirement Blueprint
Tool 7: Security & Control      → Tool 8: Investment Planning

                    ↓
            Capstone AI Integration
```

Tools enforce linear progression — each must be completed before the next unlocks.

---

## Project Structure

```
FTP-v3/
├── Code.js                  # GAS entry point, tool registration
├── Config.js                # System configuration
├── core/                    # Framework (generic, tool-agnostic)
│   ├── Router.js            # URL routing + dashboard rendering
│   ├── ToolRegistry.js      # Plugin registration and discovery
│   ├── FrameworkCore.js     # Tool lifecycle management
│   ├── DataService.js       # Persistence layer
│   ├── ResponseManager.js   # Version control (Is_Latest)
│   ├── Authentication.js    # Client lookup + sessions
│   ├── ToolAccessControl.js # Linear progression + batch access checks
│   ├── SpreadsheetCache.js  # Per-request caching with batch preload
│   ├── InsightsPipeline.js  # Cross-tool intelligence
│   ├── IntegrationGPT.js    # Capstone narrative generation
│   ├── CapstoneGPT.js       # Financial story synthesis
│   └── ...
├── tools/                   # 8 self-contained tool plugins
│   ├── tool1/ ... tool8/    # Each: ToolX.js, ToolXReport.js, manifest
├── shared/                  # Reusable utilities + HTML templates
│   ├── FormToolBase.js      # Base class for assessment tools
│   ├── DraftService.js      # Draft auto-save via PropertiesService
│   ├── PDFGenerator.js      # PDF report generation
│   ├── styles.html          # Design tokens + base CSS
│   └── ...
├── tests/                   # GAS-native regression tests (135 tests)
│   ├── TestRunner.js              # runAllCoreTests() entry point
│   └── ...                        # SpreadsheetCache, DataService, ResponseManager, etc.
├── docs/                    # Documentation
│   ├── SYSTEM-DESCRIPTION.md       # Complete technical overview
│   ├── TruPath_Master_System_Overview.md  # Business + system context
│   ├── LESSONS-LEARNED.md          # Hard-won patterns and pitfalls
│   ├── TOOL-DEVELOPMENT-GUIDE.md   # Building new tools
│   ├── Foundational Docs/          # Core IP + assessment content
│   └── Archive/                    # Historical documentation artifacts
└── archive/                 # Historical code artifacts
    ├── tests/                      # Legacy test suites, validation scripts
    ├── apps/                       # Pre-v3 standalone GAS projects
    ├── migration-scripts/          # One-time data migration utilities
    └── tool4-legacy/               # Old Tool 4 implementation files
```

---

## Key Technical Patterns

- **Navigation:** `document.write()` pattern (GAS iframe constraint — never use `window.location.reload()`)
- **Data:** Google Sheets with `Is_Latest` column for version control via `DataService.saveToolResponse()`
- **AI:** GPT-4o/4o-mini with universal 3-tier fallback (GPT → retry → deterministic templates)
- **Tool architecture:** Three patterns — FormToolBase (assessments), GroundingToolBase (grounding tools), standalone calculators
- **CSS:** Three-layer system — base design tokens → calculator overrides → tool-specific styles

---

## Documentation

| Document | Purpose |
|----------|---------|
| [SYSTEM-DESCRIPTION.md](docs/SYSTEM-DESCRIPTION.md) | Complete technical overview of the entire system |
| [TruPath_Master_System_Overview.md](docs/TruPath_Master_System_Overview.md) | Business context, core IP, behavioral engine |
| [LESSONS-LEARNED.md](docs/LESSONS-LEARNED.md) | Critical patterns, pitfalls, and design decisions |
| [TOOL-DEVELOPMENT-GUIDE.md](docs/TOOL-DEVELOPMENT-GUIDE.md) | Guide for building new tools |
| [Navigation Rules](docs/Navigation/GAS-NAVIGATION-RULES.md) | GAS navigation constraints |
| [Foundational Docs/](docs/Foundational%20Docs/) | Core IP — trauma framework and assessment content |

---

## Data Store

Google Sheets with 14 tabs: STUDENTS, RESPONSES, TOOL_STATUS, TOOL_ACCESS, SESSIONS, ACTIVITY_LOG, INSIGHT_MAPPINGS, CROSS_TOOL_INSIGHTS, PROGRESS_HISTORY, CAPSTONE_GPT_CACHE, TOOL4_SCENARIOS, TOOL6_SCENARIOS, TOOL8_SCENARIOS, ADMINS.

---

*For the TruPath behavioral framework and company context, see [TruPath_Master_System_Overview.md](docs/TruPath_Master_System_Overview.md).*
