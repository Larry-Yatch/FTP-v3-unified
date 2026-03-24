# Documentation Guide

## Where to Start

| If you want to... | Read this |
|-------------------|-----------|
| Understand the full system | [SYSTEM-DESCRIPTION.md](SYSTEM-DESCRIPTION.md) |
| Understand TruPath as a company and product | [TruPath_Master_System_Overview.md](TruPath_Master_System_Overview.md) |
| Learn from past mistakes and decisions | [LESSONS-LEARNED.md](LESSONS-LEARNED.md) |
| Build or modify a tool | [TOOL-DEVELOPMENT-GUIDE.md](TOOL-DEVELOPMENT-GUIDE.md) |
| Write GAS navigation code | [Navigation/GAS-NAVIGATION-RULES.md](Navigation/GAS-NAVIGATION-RULES.md) |
| See what needs doing | [ToDos.md](ToDos.md) |

---

## Folder Structure

```
docs/
├── SYSTEM-DESCRIPTION.md              # Complete technical overview (architecture, all 8 tools, AI, data)
├── TruPath_Master_System_Overview.md   # Business context, core IP, behavioral engine, what makes it unique
├── LESSONS-LEARNED.md                  # Hard-won patterns: navigation, data persistence, GAS pitfalls
├── TOOL-DEVELOPMENT-GUIDE.md          # How to build a new tool in the framework
├── ToDos.md                           # Active bugs, feature ideas, backlog
│
├── Foundational Docs/                 # Core intellectual property and assessment content
│   ├── Financial_TruPath_Core_Framework_Overview.md    # Three domains, six patterns
│   ├── Financial_Trauma_Masterdoc_Reorganized.md       # Deep pattern definitions
│   ├── Financial_Trauma_Patterns_Clinical_Design_Document_1.md  # Clinical analysis
│   ├── Financial_Trauma_Assessment_Content_Development_Guide.md # Content design framework
│   ├── Co-Occurring_Pattern_Matrix.md                  # Pattern co-occurrence mapping
│   ├── Complete_Refinement_Summary.md                  # Grounding tool refinement
│   ├── Tool_1_Core_Assessment_Form_Structure.md        # Tool 1 question content
│   ├── Tool_3_Identity_Validation_Assessment_Content.md # Tool 3 question content
│   ├── Tool_5_Love_Connection_Assessment_Content.md    # Tool 5 question content
│   └── Tool_7_Security_Control_Assessment_Content.md   # Tool 7 question content
│
├── Tool4/                             # Budget Framework — dev specs
│   ├── TOOL4-FINAL-SPECIFICATION.md          # Authority spec
│   ├── TOOL4-REDESIGN-SPECIFICATION.md       # Hybrid architecture (all 7 phases)
│   ├── TOOL4-TECHNICAL-ARCHITECTURE.md       # Calculation logic and data flow
│   ├── TOOL4-IMPLEMENTATION-DETAILS.md       # Surplus, validation, modifiers
│   ├── TOOL4-SERVER-API.md                   # Code.js server functions
│   ├── TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md # Priority weight decisions
│   ├── TOOL4-BACKUP-MAPPING-TABLES.md        # Fallback data mappings
│   └── TOOL4-TEST-DATA.md                    # 8 test profiles
│
├── Tool6/                             # Retirement Blueprint — dev specs
│   ├── Tool6-Consolidated-Specification.md   # Authority spec (v2.0)
│   └── TOOL6-DEV-STARTUP.md                  # Developer onboarding
│
├── Navigation/                        # GAS navigation constraints
│   └── GAS-NAVIGATION-RULES.md               # Critical — referenced in CLAUDE.md
│
├── ProgressOverTime/                  # Reference — feature built but disabled
│   ├── README.md                             # Feature overview and design decisions
│   └── IMPLEMENTATION-PLAN.md                # Architecture and schema
│
├── Middleware/                        # Reference — future cross-tool AI integration
│   ├── IMPLEMENTATION-PLAN-Middleware-AI.md   # Architecture roadmap
│   └── middleware-mapping.md                 # Complete 8-tool I/O mapping
│
└── Archive/                           # Historical documentation artifacts
    ├── Animation/                     # Completed animation system docs
    ├── Dashboard/                     # Completed dashboard phase docs
    ├── Major-Refactor/                # Completed refactoring docs
    ├── Navigation/                    # Old navigation fix docs
    ├── Testing/                       # Completed test plans
    ├── Tool3/ ... Tool8/              # Tool build artifacts, session handoffs
    └── ...                            # Bug reports, GPT guides, admin setup, etc.

Note: Code artifacts (test files, legacy apps, migration scripts) are in /archive/ at the project root.
```

---

## Document Types

**Active docs** (top-level + folders) — current reference for development and understanding the system. These are kept up to date.

**Reference docs** (ProgressOverTime/, Middleware/) — planned or paused features. Marked with status banners. Useful when those features are picked back up.

**Foundational Docs/** — core IP that defines the TruPath behavioral framework and assessment content. These are the source of truth for what the tools measure and why.

**Archive/** — completed build artifacts, session handoffs, phase completion docs, fixed bug reports, and teaching materials. Nothing was deleted — everything is preserved here for historical reference if needed.
