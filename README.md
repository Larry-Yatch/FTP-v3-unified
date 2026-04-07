# Financial TruPath v3

**Status:** Production
**Architecture:** Plugin-based Google Apps Script web app
**Repository:** https://github.com/Larry-Yatch/FTP-v3-unified
**Last Updated:** 2026-04-07

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
Tool 1: Core Pattern Assessment → Tool 2: Financial Mirror
Tool 3: Identity Grounding      → Tool 4: Budget Framework
Tool 5: Love & Connection       → Tool 6: Retirement Blueprint
Tool 7: Security & Control      → Tool 8: Investment Planning

                    ↓
            Capstone AI Integration
```

Tools enforce linear progression — each must be completed before the next unlocks.

---

## Project Status

| Tool | Status | Design Doc | Notes |
|------|--------|------------|-------|
| Tool 1 | **Complete** | [TOOL1-IMPROVEMENTS-DESIGN.md](docs/Tool1/TOOL1-IMPROVEMENTS-DESIGN.md) | Score classification, 7-section report, PDF, narratives |
| Tool 2 | **Complete** | [TOOL2-OVERHAUL-DESIGN.md](docs/Tool2/TOOL2-OVERHAUL-DESIGN.md) | Financial Mirror overhaul (6 phases), gap analysis, PDF rebuilt |
| Tool 2 QCI | Planned | [TOOL2-QUICK-CHECKIN-DESIGN.md](docs/Tool2/TOOL2-QUICK-CHECKIN-DESIGN.md) | Quick check-in mode, prerequisites met |
| Tool 3 | **Complete** | Archive | Identity grounding with subdomain analysis |
| Tool 4 | **Complete** | [TOOL4-REDESIGN-SPECIFICATION.md](docs/Tool4/TOOL4-REDESIGN-SPECIFICATION.md) | Interactive calculator, scenarios, production tested |
| Tool 5 | **Complete** | Archive | Love & connection grounding |
| Tool 6 | **Complete** | [Tool6-Consolidated-Specification.md](docs/Tool6/Tool6-Consolidated-Specification.md) | Retirement blueprint v2.0 |
| Tool 7 | **Complete** | Archive | Security & control grounding |
| Tool 8 | **Complete** | Archive | Investment planning with trauma integration |
| Core Framework | **Stable** | [SYSTEM-DESCRIPTION.md](docs/SYSTEM-DESCRIPTION.md) | Router, data, auth, GPT pipeline |

---

## Documentation Guide

### For AI Coding Agents

Start here in this order:

1. **[CLAUDE.md](CLAUDE.md)** — Development rules, GAS patterns, validation checks. Read this first before any code changes.
2. **[LESSONS-LEARNED.md](docs/LESSONS-LEARNED.md)** — Hard-won patterns and common mistakes. Prevents repeat bugs.
3. **[GAS Navigation Rules](docs/Navigation/GAS-NAVIGATION-RULES.md)** — Read before writing ANY navigation code. Violations cause white screens.
4. **Tool-specific design doc** (see status table above) — Read the relevant design doc before modifying any tool.

### Architecture Reference

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [SYSTEM-DESCRIPTION.md](docs/SYSTEM-DESCRIPTION.md) | Complete technical architecture | Understanding the system, onboarding |
| [TruPath_Master_System_Overview.md](docs/TruPath_Master_System_Overview.md) | Business context, behavioral framework, core IP | Understanding WHY the system exists |
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Visual language — all CSS tokens, colors, typography | Building UI, styling components |
| [TOOL-DEVELOPMENT-GUIDE.md](docs/TOOL-DEVELOPMENT-GUIDE.md) | Step-by-step guide for building new tools | Adding a new tool to the system |
| [COHORT-MANAGEMENT-GUIDE.md](docs/COHORT-MANAGEMENT-GUIDE.md) | Admin operations — adding students, managing cohorts | Admin tasks |

### Tool-Specific Documentation

| Directory | Contents |
|-----------|----------|
| [docs/Tool1/](docs/Tool1/) | Score classification, profile detection, report improvements |
| [docs/Tool2/](docs/Tool2/) | Financial Mirror overhaul, quick check-in design |
| [docs/Tool4/](docs/Tool4/) | Budget framework specification, architecture, API, test data |
| [docs/Tool6/](docs/Tool6/) | Retirement blueprint consolidated spec, dev startup guide |
| [docs/Navigation/](docs/Navigation/) | GAS iframe navigation rules (CRITICAL) |
| [docs/Foundational Docs/](docs/Foundational%20Docs/) | Core IP — trauma framework, clinical design, assessment content |
| [docs/Middleware/](docs/Middleware/) | Future cross-tool AI integration (roadmap) |
| [docs/ProgressOverTime/](docs/ProgressOverTime/) | Progress tracking feature (built, currently disabled) |
| [docs/Archive/](docs/Archive/) | Historical artifacts — past phases, migrations, handoffs |

---

## Project Structure

```
FTP-v3/
├── Code.js                  # GAS entry point, tool registration
├── Config.js                # System configuration (sheet IDs, API keys)
├── CLAUDE.md                # AI agent development guidelines
├── core/                    # Framework (generic, tool-agnostic)
│   ├── Router.js            # URL routing + dashboard card rendering
│   ├── ToolRegistry.js      # Plugin registration and discovery
│   ├── FrameworkCore.js     # Tool lifecycle management
│   ├── DataService.js       # Persistence layer (RESPONSES sheet)
│   ├── ResponseManager.js   # Version control (Is_Latest)
│   ├── Authentication.js    # Client lookup + sessions
│   ├── ToolAccessControl.js # Linear progression enforcement
│   ├── CollectiveResults.js # Cross-tool dashboard + awareness engine
│   ├── InsightsPipeline.js  # Cross-tool intelligence
│   ├── IntegrationGPT.js    # Capstone narrative generation
│   ├── CapstoneGPT.js       # Financial story synthesis
│   └── FormToolBase.js      # Base class for multi-page form tools
├── tools/                   # 8 self-contained tool plugins
│   ├── tool1/               # Core Pattern Assessment
│   ├── tool2/               # Financial Mirror
│   ├── tool3/               # Identity Grounding
│   ├── tool4/               # Budget Framework
│   ├── tool5/               # Love & Connection Grounding
│   ├── tool6/               # Retirement Blueprint
│   ├── tool7/               # Security & Control Grounding
│   └── tool8/               # Investment Planning
├── shared/                  # Reusable utilities + HTML templates
│   ├── DraftService.js      # Draft auto-save via PropertiesService
│   ├── PDFGenerator.js      # PDF report generation (all tools)
│   ├── ReportBase.js        # Shared report data access
│   ├── ReportStyles.js      # Shared report CSS
│   ├── ReportClientJS.js    # Shared report client-side JS
│   ├── styles.html          # Design tokens + base CSS
│   └── ...
├── docs/                    # Documentation (see guide above)
└── archive/                 # Historical code artifacts
```

---

## Key Technical Patterns

- **Navigation:** `document.write()` pattern (GAS iframe constraint — never use `window.location.reload()`)
- **Data:** Google Sheets with `Is_Latest` column for version control via `DataService.saveToolResponse()`
- **AI:** GPT-4o/4o-mini with universal 3-tier fallback (GPT -> retry -> deterministic templates)
- **Tool architecture:** Three patterns — FormToolBase (assessments), GroundingToolBase (grounding tools), standalone calculators
- **CSS:** Three-layer system — base design tokens -> calculator overrides -> tool-specific styles
- **Deployment:** `clasp push` to HEAD (dev), versioned deployments for production

---

## Data Store

Google Sheets with 14 tabs: STUDENTS, RESPONSES, TOOL_STATUS, TOOL_ACCESS, SESSIONS, ACTIVITY_LOG, INSIGHT_MAPPINGS, CROSS_TOOL_INSIGHTS, PROGRESS_HISTORY, CAPSTONE_GPT_CACHE, TOOL4_SCENARIOS, TOOL6_SCENARIOS, TOOL8_SCENARIOS, ADMINS.

---

*For the TruPath behavioral framework and company context, see [TruPath_Master_System_Overview.md](docs/TruPath_Master_System_Overview.md).*
