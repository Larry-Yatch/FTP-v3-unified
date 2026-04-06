# Financial TruPath v3 -- Complete System Description

## 1. Overview

Financial TruPath v3 (FTP-v3) is a trauma-informed financial planning platform built entirely on Google Apps Script (GAS). It guides clients through an 8-tool progressive assessment and planning sequence that first uncovers the psychological patterns driving their financial decisions, then uses those discoveries to personalize concrete financial tools -- budgets, retirement blueprints, and investment plans.

The system is deployed as a single Google Apps Script web app backed by a Google Sheets data store. It integrates OpenAI GPT-4o for real-time narrative analysis, generates downloadable PDF reports, and provides both client-facing dashboards and an administrative interface.

**Scale:** ~69,000 lines of production JavaScript across 89 files, plus 11,700 lines of HTML templates. Eight interconnected tools, a cross-tool insights engine, a capstone integration layer, and a full admin system.

---

## 2. Purpose & Philosophy

### What Problem It Solves

Traditional financial planning treats money as a purely rational domain. Clients receive budgets, projections, and recommendations -- and then don't follow them. FTP-v3 is built on the premise that **financial behavior is driven by unconscious psychological strategies** formed in childhood. Until those strategies are surfaced and understood, financial plans remain disconnected from the person they're meant to serve.

### The Core Insight

FTP-v3 identifies six childhood survival strategies that show up as adult financial patterns:

| Strategy | Core Pattern | Financial Manifestation |
|----------|-------------|------------------------|
| **False Self-View (FSV)** | Attaching to negative self-beliefs | Undervaluing yourself, undercharging, accepting less |
| **External Validation (ExVal)** | Needing acceptance to feel safe | Spending to impress, financial people-pleasing |
| **Issues Showing Love** | Suffering when caring for others | Over-giving, financial self-sacrifice |
| **Issues Receiving Love** | Emotional disconnection | Rejecting help, financial isolation |
| **Control Leading to Isolation** | Must control environment to feel safe | Hoarding, micromanaging money, refusing delegation |
| **Fear Leading to Isolation** | Nothing is safe, worst-case defaults | Financial paralysis, inaction, avoidance |

Every client has a dominant strategy. FTP-v3 identifies it in Tool 1, explores its roots through three grounding assessments (Tools 3, 5, 7), and then weaves that psychological understanding into three financial planning tools (Tools 4, 6, 8) that adapt their guidance accordingly.

### The Client Journey

The system enforces a linear progression -- each tool must be completed before the next unlocks. This is intentional: psychological readiness builds sequentially.

```
PSYCHOLOGICAL FOUNDATION          FINANCIAL APPLICATION
========================          =====================

Tool 1: Core Trauma Strategy  --> Tool 2: Financial Clarity & Values
  (identify dominant pattern)       (consolidate financial picture)
                                         |
Tool 3: Identity & Validation --> Tool 4: Financial Freedom Framework
  (FSV + ExVal grounding)          (trauma-informed budget calculator)
                                         |
Tool 5: Love & Connection    --> Tool 6: Retirement Blueprint
  (Showing + Receiving grounding)  (investment vehicle allocation)
                                         |
Tool 7: Security & Control   --> Tool 8: Investment Planning
  (Control + Fear grounding)       (retirement investment calculator)
                                         |
                              CAPSTONE INTEGRATION
                              (AI-synthesized narrative connecting
                               all psychological + financial data)
```

---

## 3. Architecture

### Platform & Runtime

- **Runtime:** Google Apps Script (V8 engine)
- **Deployment:** Web app via `doGet(e)` entry point
- **Data Store:** Google Sheets (single spreadsheet, multiple tabs)
- **AI Integration:** OpenAI GPT-4o / GPT-4o-mini via REST API
- **Output:** HTML dashboards, interactive calculators, PDF reports, email delivery

### Plugin Architecture

FTP-v3 uses a modular, registry-based architecture. No tool-specific code lives in the framework core.

```
Code.js (Entry Point)
  |
  +-- registerTools()          # Registers all 8 tools with manifests
  |
  +-- doGet(e)
        |
        +-- Router.route(e)
              |
              +-- System Routes    # login, dashboard, admin, reports
              |
              +-- Tool Routes      # Resolved via ToolRegistry.findByRoute()
                    |
                    +-- ToolAccessControl.canAccessTool()
                    |
                    +-- FrameworkCore.initializeTool()
                    |     +-- InsightsPipeline.prepareToolLaunch()
                    |
                    +-- tool.module.render()
```

**Key Design Principle:** The framework knows nothing about individual tools. Each tool registers itself with a manifest (JSON configuration) and a module (JavaScript object implementing `ToolInterface`). The framework handles lifecycle, routing, access control, and cross-tool intelligence generically.

### Core Framework Files

| File | Role |
|------|------|
| `Code.js` | GAS entry point, tool registration, global function wrappers |
| `core/Router.js` | URL routing, dashboard rendering, login/logout, admin routing |
| `core/ToolRegistry.js` | Central tool registry with route matching and pattern grouping |
| `core/ToolInterface.js` | Contract definition (required: `render()`; optional: `validate()`, `process()`, `generateInsights()`, etc.) |
| `core/FrameworkCore.js` | Tool lifecycle: initialization, submission processing, progress tracking |
| `core/DataService.js` | Data persistence layer (CRUD for responses, sessions, activity logs) |
| `core/ResponseManager.js` | Response versioning: drafts, edits, version history |
| `core/ToolAccessControl.js` | Linear progression enforcement, admin lock/unlock overrides |
| `core/InsightsPipeline.js` | Cross-tool intelligence: condition evaluation, insight generation, downstream adaptation |
| `core/Authentication.js` | Client ID lookup with name/email fallback matching |
| `core/SpreadsheetCache.js` | Per-request spreadsheet instance caching (prevents API throttling) |

### Data Model (Google Sheets Tabs)

| Sheet | Purpose |
|-------|---------|
| `STUDENTS` | Client roster: ID, Name, Email, Status, Enrolled_Date, Last_Activity, Tools_Completed |
| `RESPONSES` | All tool submissions: Timestamp, Client_ID, Tool_ID, Data (JSON), Version, Status, Is_Latest |
| `TOOL_STATUS` | Completion status grid: one row per student, columns for each tool's status + date |
| `TOOL_ACCESS` | Access control records: Client_ID, Tool_ID, Status (locked/unlocked), Prerequisites, Locked_By, Lock_Reason |
| `SESSIONS` | Session management: Session_ID, Client_ID, Created, Expires, Last_Activity |
| `ACTIVITY_LOG` | Audit trail: every login, tool start, completion, edit, admin action |
| `INSIGHT_MAPPINGS` | Configuration-driven cross-tool insight rules |
| `CROSS_TOOL_INSIGHTS` | Generated insights from completed tools |
| `PROGRESS_HISTORY` | Score snapshots for trend tracking (10-version cap per client+tool) |
| `CAPSTONE_GPT_CACHE` | Cached GPT narratives for the capstone report |
| `TOOL4_SCENARIOS` | Saved budget allocation scenarios |
| `TOOL6_SCENARIOS` | Saved retirement vehicle scenarios |
| `TOOL8_SCENARIOS` | Saved investment planning scenarios |
| `ADMINS` | Admin credentials and status |

---

## 4. The Eight Tools

### Tool Categories

Tools fall into three architectural patterns, each with a shared base class:

**Assessment Tools (Tools 1, 2)** -- extend `FormToolBase`
- Multi-page questionnaires with 5-point Likert scales
- Draft auto-save between pages
- GPT-powered response analysis running in background

**Grounding Tools (Tools 3, 5, 7)** -- extend `GroundingToolBase`
- 7-page structure: 1 intro + 6 subdomain deep-dives
- Each subdomain explores Belief / Behavior / Feeling / Consequence dimensions
- Per-subdomain GPT analysis triggered on page save
- Final submission synthesizes domain-level and overall narratives
- Shared scoring engine (`GroundingScoring.js`) computes subdomain quotients

**Calculator Tools (Tools 4, 6, 8)** -- standalone implementations
- Single-page interactive calculators with real-time sliders
- Pre-populated from upstream tool data
- Multi-scenario save/compare capability
- Dedicated PDF report generation

### Tool-by-Tool Detail

*File sizes and subdomain names verified directly from the codebase (March 2026).*

#### Tool 1: Core Trauma Strategy Assessment
- **Status:** Production-complete — reference implementation for the framework
- **Duration:** 15-20 minutes | 5 pages | 26 questions
- **What It Does:** Identifies which of the six childhood survival strategies is dominant. Scores each strategy from -25 to +25. The "winner" becomes the lens through which all subsequent tools interpret the client's behavior.
- **Output:** Detailed report with strategy explanation, personalized narratives, cross-tool insights
- **Key Files:** `tools/tool1/Tool1.js`, `Tool1Report.js`, `Tool1Templates.js`, `tool.manifest.json` (1,107 lines total)

#### Tool 2: Financial Mirror
- **Status:** Production-complete (overhauled April 2026)
- **Duration:** 15-30 minutes | 5 pages | 43 questions (full) / 26 questions (quick check-in)
- **What It Does:** Dual-track assessment capturing objective financial reality (income, debt, savings, retirement, insurance) and subjective emotional perception per domain. Surfaces the gap between reality and perception as the primary diagnostic insight. Full/light mode toggle. Quick Check-In pre-fills from previous submission for fast re-assessment.
- **Scoring:** Objective health scores (0-100 per domain from financial benchmarks), subjective clarity scores (0-100 from scale normalization), gap index (-100 to +100), gap classification (UNDERESTIMATING/ALIGNED/OVERESTIMATING), scarcity flag, Tool 1 profile type detection
- **Domains:** Money Flow, Obligations, Liquidity, Growth, Protection
- **Output:** 9-section Financial Mirror report (full mode) or delta-focused check-in report (light mode) with gap analysis, pattern synthesis, GPT-powered personalized insights, PDF download. Pre-populates financial data into Tools 4, 6, and 8.
- **Key Files:** `tools/tool2/Tool2.js`, `Tool2Report.js`, `Tool2GPTAnalysis.js`, `Tool2Constants.js`, `Tool2Fallbacks.js`, `tool.manifest.json`

#### Tool 3: Identity & Validation Grounding
- **Status:** Production-complete
- **Duration:** 25 minutes | 7 pages | 30 questions (6 subdomains × 4 dimensions × 1-2 questions each)
- **What It Does:** Deep dive into False Self-View (FSV) and External Validation (ExVal) patterns — how identity distortions and approval-seeking show up in financial decisions.
- **Subdomains:** "I'm Not Worthy of Financial Freedom", "I'll Never Have Enough", "Money Shows My Worth" (FSV) | "What Will They Think?", "I Need to Prove Myself", "I Can't See My Financial Reality" (ExVal)
- **Output:** Subdomain quotient scores (Disconnection from Self Quotient), GPT narratives per subdomain, domain synthesis
- **Key Files:** `tools/tool3/Tool3.js`, `Tool3Report.js`, `tool3.manifest.json` (670 lines total)

#### Tool 4: Financial Freedom Framework
- **Status:** Production-complete
- **Duration:** 30 minutes | Single-page calculator with pre-survey
- **What It Does:** Discovers optimal budget allocation across four financial categories (Multiply/Essentials/Freedom/Enjoyment) based on a client pre-survey, 10 progressively unlocked financial priorities, and 29 trauma-informed modifiers drawn from Tools 1-3. Supports multiple saved scenarios.
- **Data Sources:** Pre-survey (income, balances, financial situation), Tool 1/2/3 psychological modifiers, client priority selection
- **Output:** Personalized M/E/F/J allocation percentages, scenario comparison, PDF report with GPT narrative
- **Key Files:** `tools/tool4/Tool4.js`, `Tool4GPTAnalysis.js`, `Tool4Constants.js`, `Tool4Fallbacks.js`, `tool4-styles.html`, `tool4.manifest.json` (9,336 lines total)

#### Tool 5: Love & Connection Grounding
- **Status:** Production-complete
- **Duration:** 25 minutes | 7 pages | 30 questions (6 subdomains × 4 dimensions × 1-2 questions each)
- **What It Does:** Explores Issues Showing Love (ISL) and Issues Receiving Love (IRL) patterns — how compulsive giving, self-sacrifice, emotional disconnection, and difficulty accepting help shape financial behavior.
- **Subdomains:** "I Must Give to Be Loved", "Their Needs > My Needs", "I Can't Accept Help" (ISL) | "I Can't Make It Alone", "I Owe Them Everything", "I Stay in Debt" (IRL)
- **Output:** Subdomain quotient scores (Disconnection from Others Quotient), GPT narratives per subdomain, domain synthesis
- **Key Files:** `tools/tool5/Tool5.js`, `Tool5Report.js`, `tool5.manifest.json` (664 lines total)

#### Tool 6: Retirement Blueprint Calculator
- **Status:** Production-complete — largest file in the codebase
- **Duration:** 25 minutes | Single-page calculator with pre-survey
- **What It Does:** Classifies clients into one of 9 investor profiles, computes an Ambition Quotient, and allocates retirement savings across tax-advantaged vehicles (401k, IRA, Roth, HSA, Solo 401k, ROBS, etc.) using a waterfall algorithm with IRS limit enforcement. Includes future value projections and employer match calculations.
- **Profiles:** ROBS-In-Use Strategist, ROBS-Curious Candidate, Business Owner with Employees, Solo 401(k) Optimizer, Bracket Strategist, Catch-Up Contributor, Foundation Builder, Roth Maximizer, Late-Stage Growth
- **Output:** Vehicle allocation breakdown, projections, scenario comparison, PDF report with GPT narrative
- **Key Files:** `tools/tool6/Tool6.js`, `Tool6Report.js`, `Tool6GPTAnalysis.js`, `Tool6Constants.js`, `Tool6Fallbacks.js`, `Tool6Tests.js`, `tool6-styles.html`, `tool6.manifest.json` (20,886 lines total)

#### Tool 7: Security & Control Grounding
- **Status:** Production-complete
- **Duration:** 25 minutes | 7 pages | 30 questions (6 subdomains × 4 dimensions × 1-2 questions each)
- **What It Does:** Final grounding tool exploring Control Leading to Isolation (CLI) and Fear Leading to Isolation (FLI) — how security-seeking behaviors and fear responses drive financial choices.
- **Subdomains:** "I Undercharge and Give Away", "I Have Money But Will Not Use It", "Only I Can Do It Right" (CLI) | "I Do Not Protect Myself", "I Sabotage Success", "I Trust the Wrong People" (FLI)
- **Output:** Subdomain quotient scores (Disconnection from All That's Greater Quotient), GPT narratives per subdomain, domain synthesis
- **Key Files:** `tools/tool7/Tool7.js`, `Tool7Report.js`, `tool7.manifest.json` (663 lines total)

#### Tool 8: Investment Planning Tool
- **Status:** Production-complete
- **Duration:** 20 minutes | Single-page calculator
- **What It Does:** Three calculation modes for retirement investment analysis — Required Contribution (what to save monthly to hit a target), Required Return (what return rate achieves the goal), and Required Time (how long to reach target). Pre-populates from all upstream tools (1-7), especially Tool 6 scenarios. Supports scenario comparison and risk-return mapping.
- **Output:** Mode-specific projections, scenario reports, PDF reports with GPT narratives
- **Key Files:** `tools/tool8/Tool8.js`, `Tool8Report.js`, `Tool8GPTAnalysis.js`, `Tool8Constants.js`, `Tool8Fallbacks.js`, `Tool8Tests.js`, `tool8-styles.html`, `tool8.manifest.json` (6,342 lines total)

---

## 5. AI Integration

### GPT Architecture

Every GPT interaction follows a universal **3-tier fallback pattern** ensuring 100% reliability:

1. **Tier 1:** Call GPT (primary model)
2. **Tier 2:** Wait 2 seconds, retry
3. **Tier 3:** Use pre-written, data-driven template fallbacks

All calls route through a single shared implementation (`GroundingGPT.callGPT()`) using the OpenAI REST API with key stored in GAS Script Properties.

### GPT Usage by Context

| Context | Model | Tokens | Cost | When |
|---------|-------|--------|------|------|
| Tool 2 response analysis (x8) | gpt-4o-mini | 300 | $0.023 total | Background during form |
| Tool 2 synthesis | gpt-4o | 600 | included above | On submission |
| Grounding subdomain analysis (x6) | gpt-4o-mini | 400 | $0.015 total | Background per page |
| Grounding domain + overall synthesis (x3) | gpt-4o | 500-700 | included above | On submission |
| Tool 4 report narrative | gpt-4o | 800 | $0.02-0.03 | Report generation |
| Tool 6 scenario narrative | gpt-4o | 1,000-1,500 | $0.02-0.03 | Report generation |
| Tool 8 scenario narrative | gpt-4o | 750-800 | $0.02-0.03 | Report generation |
| Capstone integration (8 sections) | gpt-4o | 2,500 | $0.04 | Capstone report |
| Capstone financial story | gpt-4o | 1,000 | $0.03 | Capstone report |
| Capstone insights | gpt-4o | 1,200 | $0.03 | Capstone report |

**Average total cost per client (all 8 tools + capstone):** ~$0.23

### Fallback System

Each tool has a dedicated Fallbacks file (`Tool2Fallbacks.js`, `GroundingFallbacks.js`, `Tool4Fallbacks.js`, `Tool6Fallbacks.js`, `Tool8Fallbacks.js`) containing deterministic, data-driven template narratives. Fallbacks are never "dumb defaults" -- they adapt to the client's actual scores and patterns. All results include a `source` field (`'gpt'`, `'gpt_retry'`, or `'fallback'`) for auditability.

### Cross-Tool Intelligence

The `InsightsPipeline` is a configuration-driven engine that:
1. **On tool completion:** Evaluates condition rules from the `INSIGHT_MAPPINGS` sheet against response data
2. **Generates insights:** Stores triggered insights in `CROSS_TOOL_INSIGHTS`
3. **On tool launch:** Retrieves relevant insights for the next tool to adapt its content
4. **Downstream tools** can call `adaptBasedOnInsights()` to modify their behavior based on upstream discoveries

### Capstone Integration

When enough tools are completed (Tool 1 + Tool 2 + at least one grounding tool), two AI synthesis layers activate:

- **IntegrationGPT:** Generates an 8-section narrative connecting psychological patterns to financial behavior. Uses a detection engine that identifies belief locks, awareness gaps, belief-behavior gaps, and warning patterns.
- **CapstoneGPT:** Produces "Your Financial Story" (cohesive cross-tool narrative) and "Capstone Insights" (patterns, contradictions, priority actions). Results are cached and invalidated when tool data changes.

---

## 6. Client Experience

### Authentication

Clients log in with their Student ID (assigned by administrator). A fallback flow allows lookup by first name + last name + email (requires 2 of 3 matching). No passwords -- the ID itself is the credential. Sessions are tracked in the SESSIONS sheet with configurable expiration.

### Dashboard

After login, clients see a card-based dashboard showing:
- **Progress summary:** Completion percentage across all 8 tools with visual progress bar
- **8 tool cards**, each displaying one of four states:
  - **Completed:** Shows completion date, buttons for "View Report", "Edit Answers", "Start Fresh"
  - **In Progress (Draft):** Shows "Continue" button to resume, "Discard Draft" option
  - **Ready:** Unlocked and available to start
  - **Locked:** Greyed out with prerequisite message ("Complete Tool 3 to unlock")
- **Collective Results** button (unlocks after minimum tools completed)
- **Progress Over Time** button (trend charts across retakes)

### Navigation

GAS imposes a critical constraint: `window.location.reload()` and `window.location.href` do not work after user interaction. All navigation uses a `document.write()` pattern where the server returns complete HTML pages that replace the current document.

### Reports & PDFs

Each tool generates a web-based report accessible from the dashboard. Calculator tools (4, 6, 8) also generate downloadable PDF reports via `PDFGenerator.js` (2,919 lines). The Capstone Report synthesizes all tool data into a comprehensive narrative document.

### Edit & Retake

Clients can edit completed tools (creates an EDIT_DRAFT that preserves the original response) or start fresh (clears drafts, begins a new attempt). The `ResponseManager` handles version control, ensuring previous responses are preserved and the latest is always identifiable.

---

## 7. Administration

### Admin Interface

Administrators access a separate login at the `/admin` route. The admin dashboard provides:
- **Student management:** Add, edit, view student roster
- **Tool access control:** Manually lock/unlock tools per student (overrides linear progression)
- **Activity monitoring:** Full audit trail of logins, tool starts, completions, edits
- **Response viewing:** Access any student's responses and reports

### Admin Authentication

Uses `PropertiesService.getUserProperties()` for session storage. Credentials stored in ADMINS sheet. Sessions auto-expire.

### Data Management

All data lives in a single Google Spreadsheet. The `SpreadsheetCache` prevents API throttling by caching the spreadsheet instance within each request execution. Cache invalidation is handled explicitly after writes.

---

## 8. Styling & UI Architecture

### Three-Layer CSS System

1. **`shared/styles.html`** (base): CSS custom properties (design tokens), font imports (Radley for headings, Rubik for body), base components (`.btn`, `.tool-card`, `.badge`, `.container`), animation system with `prefers-reduced-motion` respect
2. **`shared/calculator-styles.html`** (calculator override): Gold pill buttons, collapsible sections, calculator-specific layout overrides
3. **Tool-specific styles** (e.g., `tool6-styles.html`): Highest specificity, tool-unique components

### Design Language

- Dark theme with gold accent (`--accent`, `--gold`)
- Card-based layouts with subtle shadows and border treatments
- Animated transitions (hardware-accelerated transforms)
- Responsive design via viewport meta tags
- No external CSS frameworks -- custom utility classes inspired by Tailwind methodology

---

## 9. What Makes It Unique

### 1. Psychology-First Financial Planning
No other financial planning tool starts with childhood trauma strategies. FTP-v3 doesn't ask "what's your risk tolerance?" -- it discovers why you have that risk tolerance and how it connects to deeper patterns of control, fear, self-worth, or validation-seeking.

### 2. Adaptive Tool Intelligence
Each tool adapts based on what was discovered in previous tools. The `InsightsPipeline` ensures that a client identified as having a strong Control strategy in Tool 1 sees different emphasis in their budget allocation (Tool 4), different retirement vehicle recommendations (Tool 6), and different investment guidance (Tool 8).

### 3. Four-Layer Trauma Integration
The grounding tools (3, 5, 7) don't just identify patterns -- they explore them through four psychological dimensions: **Belief** (what you think), **Behavior** (what you do), **Feeling** (what you feel), and **Consequence** (what results). This creates a rich, multi-dimensional profile that feeds into the financial tools.

### 4. AI as Coach, Not Calculator
GPT isn't used for number-crunching -- it's used to speak to the client in the voice of a coach who understands both their psychology and their finances. Every narrative reads as direct, empathetic guidance: "You scored high in External Validation, which means your spending patterns may be driven by a need for others' approval. Here's what that looks like in your budget..."

### 5. 100% Reliability AI with Source Attribution
The 3-tier fallback system ensures every client gets a narrative, whether GPT is available or not. Every AI-generated text is tagged with its source (`gpt`, `gpt_retry`, or `fallback`) so practitioners can see exactly what was AI-generated vs. template-based.

### 6. Progressive Unlocking
The linear progression isn't arbitrary -- it mirrors therapeutic practice where foundational self-awareness must precede behavioral change. Clients can't skip to the calculator tools without doing the psychological groundwork first.

### 7. Scenario Planning with Memory
Calculator tools (4, 6, 8) support saving multiple scenarios, enabling clients to explore "what if" variations of their financial plans. Scenarios persist and can be compared side-by-side, encouraging iterative refinement rather than one-shot planning.

### 8. Complete Audit Trail
Every action -- login, tool start, page save, completion, edit, admin override -- is logged to the ACTIVITY_LOG with timestamps and details. This supports both practitioner oversight and client accountability.

### 9. Zero-Infrastructure Deployment
The entire system runs on Google's free infrastructure (Apps Script + Sheets). No servers to manage, no databases to maintain, no deployment pipelines. A single `clasp push` deploys the entire application.

### 10. Capstone Synthesis
The system doesn't just generate 8 independent reports -- it synthesizes everything into a unified narrative. The detection engine identifies belief locks (where stated beliefs contradict behaviors), awareness gaps (blind spots between perceived and actual financial stress), and cross-tool contradictions that no single tool could surface alone.

---

## 10. File Structure

```
FTP-v3/
|-- Code.js                          # GAS entry point, tool registration
|-- AdminMigration.js                # Data migration utilities
|-- AdminRouter.js                   # Admin interface routing
|-- appsscript.json                  # GAS configuration & OAuth scopes
|
|-- core/                            # Framework (tool-agnostic)
|   |-- Router.js                    # URL routing & dashboard rendering
|   |-- ToolRegistry.js              # Plugin registry
|   |-- ToolInterface.js             # Tool contract definition
|   |-- FrameworkCore.js             # Tool lifecycle management
|   |-- DataService.js               # Data persistence layer
|   |-- ResponseManager.js           # Response versioning & edit lifecycle
|   |-- ToolAccessControl.js         # Linear progression & admin overrides
|   |-- InsightsPipeline.js          # Cross-tool intelligence engine
|   |-- Authentication.js            # Client ID & detail-based login
|   |-- SpreadsheetCache.js          # API throttle prevention
|   |-- FormToolBase.js              # Base class for form tools (1, 2)
|   |-- FormUtils.js                 # Shared form rendering utilities
|   |-- CollectiveResults.js         # Unified results dashboard
|   |-- IntegrationGPT.js            # Capstone narrative generation
|   |-- CapstoneGPT.js               # Capstone insights & caching
|   |-- ProgressHistory.js           # Score snapshot tracking
|   |-- grounding/                   # Grounding tool framework
|       |-- GroundingToolBase.js      # Base class for tools 3, 5, 7
|       |-- GroundingFormBuilder.js   # Subdomain page generator
|       |-- GroundingScoring.js       # Quotient scoring engine
|       |-- GroundingGPT.js           # GPT integration + shared callGPT()
|       |-- GroundingFallbacks.js     # Tier 3 fallback narratives
|       |-- GroundingReport.js        # Shared grounding report renderer
|
|-- tools/                           # Individual tool implementations
|   |-- tool1/                       # Core Trauma Strategy Assessment
|   |-- tool2/                       # Financial Clarity & Values
|   |-- tool3/                       # Identity & Validation Grounding
|   |-- tool4/                       # Financial Freedom Framework
|   |-- tool5/                       # Love & Connection Grounding
|   |-- tool6/                       # Retirement Blueprint Calculator
|   |-- tool7/                       # Security & Control Grounding
|   |-- tool8/                       # Investment Planning Tool
|
|-- shared/                          # Shared UI assets
|   |-- styles.html                  # Base design tokens & components
|   |-- calculator-styles.html       # Calculator tool overrides
|   |-- PDFGenerator.js              # PDF report generation
|
|-- html/                            # HTML templates
|-- apps/                            # Legacy v2 tool code (reference only)
|-- docs/                            # Documentation
|-- tests/                           # Test suites
```

---

## 11. Technical Constraints & Design Decisions

| Constraint | Decision |
|-----------|----------|
| GAS has no `import`/`require` | All files are global scope; load order managed by GAS project config |
| GAS `HtmlService` sandboxes client-side JS | Navigation uses `document.write()` pattern, not `location.reload()` |
| GAS execution time limit (6 minutes) | GPT calls use background processing where possible; only synthesis is blocking |
| Google Sheets API rate limits | `SpreadsheetCache` reuses spreadsheet instance per request |
| No persistent server state | Sessions stored in Sheets; client state in `sessionStorage` |
| Template literals in GAS | No escaped apostrophes in JS inside backticks (use full words or double quotes) |
| Range input styling across browsers | Tool 6 requires explicit `::-webkit-slider-runnable-track` CSS (breaks without it) |

---

*This document describes Financial TruPath v3 as of March 2026. The system represents the third major iteration of the platform, rebuilt from the ground up with a modular plugin architecture, AI-powered narrative generation, and a trauma-informed approach to financial planning that is, to our knowledge, unique in the industry.*
