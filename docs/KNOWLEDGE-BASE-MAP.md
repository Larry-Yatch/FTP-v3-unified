# TruPath Knowledge Base Map

**Purpose:** This document is the front door to the TruPath knowledge base. It tells a reader (human or AI) which doc to open for a given question, which doc is the canonical source when topics overlap, and which docs are stale or dormant.

**How to use this doc:**
- Humans — scan the Tier Framework and Routing Table by Topic. Jump to a specific doc's entry when you're about to read it.
- AI agents — read this map at the start of any TruPath-related conversation. Use Tiers 1–2 as baseline context; escalate into Tier 3–4 docs only when the conversation demands that depth.

**Last rebuilt:** 2026-04-20. Refresh this map after any major doc addition, rename, or structural change. Minor content edits to individual docs don't require a full rebuild — just update the affected entry.

**Recent updates:**
- 2026-04-20 — Map synthesized from deep-research pass; memory pointer saved.
- 2026-04-20 — Foundational Docs encoding cleanup (removed double-encoded UTF-8 mojibake across 6 files). See Known Gaps.
- 2026-04-20 — Progress Over Time status corrected: feature is LIVE, not dormant. Map Tier assignments, per-doc entries, and Staleness Register updated accordingly.
- 2026-04-20 — **Google Drive consolidation.** Local copies of the Business Vision and Structural Design docs already existed in `Business Docs/` and are identical to the Drive versions. Going forward, the local `Business Docs/` copies are canonical for all TruPath work; Drive versions are not consulted. If Drive sync is re-enabled in the future for sharing, local remains authoritative — Drive becomes an outbound mirror only.

---

## 1. Tier Framework

Docs are tiered by *how often they should be consulted and at what altitude*, not by folder. An AI assistant deciding what to load into working memory should treat Tiers 1–2 as near-default, Tier 3 as situational, Tier 4 as coder-only, Tier 5 as ignore-unless-asked.

### Tier 1 — The Canon (always orient here first)
Defines what TruPath is at its core. Any conversation about TruPath strategy, identity, or the 6-pattern framework starts here.
- `TruPath_Master_System_Overview.md` — company-level identity, core IP, dual-sided system
- `Business Docs/TruPath AI — Business Vision (30,000-Foot) - Local Copy.md` — TruPath AI Business Vision (30,000-Foot)
- `Foundational Docs/Financial_TruPath_Core_Framework_Overview.md` — the 6-pattern framework in teaching voice
- `Financial-TruPath-Tool-Descriptions.md` — per-tool client-facing descriptions + dashboard

### Tier 2 — System Architecture (always load for technical/system questions)
How things work mechanically, one altitude below the canon.
- `SYSTEM-DESCRIPTION.md` — engineering source of truth for FTP-v3
- `Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md` — TruPath AI Structural Design (10,000-Foot)
- `Foundational Docs/Financial_Trauma_Patterns_Clinical_Design_Document_1.md` — clinical authority for the 6 patterns
- `README.md` — the folder's own index

### Tier 3 — Deep-Dive References (open when the topic demands)
Rich source material. Pull in only when the conversation enters that territory.
- `Foundational Docs/Financial_Trauma_Masterdoc_Reorganized.md` — long-form per-pattern deep dive
- `Foundational Docs/Financial_Trauma_Assessment_Content_Development_Guide.md` — how to translate patterns into assessment items
- `Foundational Docs/Co-Occurring_Pattern_Matrix.md` — which patterns co-occur and why
- `Foundational Docs/Tool_1_Core_Assessment_Form_Structure.md` — Tool 1 question bank
- `Foundational Docs/Tool_3_Identity_Validation_Assessment_Content.md` — Tool 3 content
- `Foundational Docs/Tool_5_Love_Connection_Assessment_Content.md` — Tool 5 content
- `Foundational Docs/Tool_7_Security_Control_Assessment_Content.md` — Tool 7 content
- `Middleware/middleware-mapping.md` — field-level I/O schema across all 8 tools

### Tier 4 — Engineering Specialist (open when writing code or doing ops)
- `TOOL-DEVELOPMENT-GUIDE.md` — shared utilities, tool types, build-a-new-tool manual
- `LESSONS-LEARNED.md` — hard-won footguns
- `Navigation/GAS-NAVIGATION-RULES.md` — non-negotiable GAS navigation rules
- `DESIGN-SYSTEM.md` — CSS tokens, brand palette, components
- `COHORT-MANAGEMENT-GUIDE.md` — operational runbook (admin + student flows)
- `ProgressOverTime/README.md` + `ProgressOverTime/IMPLEMENTATION-PLAN.md` — Progress Over Time feature (LIVE student view; coach-UI button is the open work item)
- All `Tool1/`, `Tool2/`, `Tool4/`, `Tool6/` subfolder docs — per-tool specs (see per-tool sub-maps below)

### Tier 5 — Archival / Dormant (ignore unless explicitly asked)
- `Middleware/IMPLEMENTATION-PLAN-Middleware-AI.md` — superseded by the TruPath AI vision docs in `Business Docs/`
- `Foundational Docs/Complete_Refinement_Summary.md` — backward-looking change log
- `ToDos.md` — living backlog, but purely tactical
- `Archive/` folder — skip entirely

---

## 2. Routing Table by Topic (Question → Doc)

When you don't know which doc to open, match the question to the nearest row.

| If the question is about… | Open first |
|---|---|
| What TruPath is, as a company / identity / IP | `TruPath_Master_System_Overview.md` |
| What TruPath AI (the product) is, strategy, moat, rollout | `Business Docs/TruPath AI — Business Vision (30,000-Foot) - Local Copy.md` |
| How TruPath AI is structured at the system level | `Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md` |
| The 6 patterns / 3 domains in teaching voice | `Foundational Docs/Financial_TruPath_Core_Framework_Overview.md` |
| The 6 patterns — clinical / diagnostic framing | `Foundational Docs/Financial_Trauma_Patterns_Clinical_Design_Document_1.md` |
| The 6 patterns — deep narrative per pattern | `Foundational Docs/Financial_Trauma_Masterdoc_Reorganized.md` |
| Pattern combinations / co-occurrence | `Foundational Docs/Co-Occurring_Pattern_Matrix.md` |
| Writing new assessment items | `Foundational Docs/Financial_Trauma_Assessment_Content_Development_Guide.md` |
| Client-facing description of any tool / dashboard | `Financial-TruPath-Tool-Descriptions.md` |
| FTP-v3 architecture, sheets, plugin system, GPT tiers | `SYSTEM-DESCRIPTION.md` |
| Building or modifying a tool (framework-level) | `TOOL-DEVELOPMENT-GUIDE.md` |
| Avoiding known bugs / footguns | `LESSONS-LEARNED.md` |
| Any GAS navigation code | `Navigation/GAS-NAVIGATION-RULES.md` |
| CSS / styling / brand / PDF styling | `DESIGN-SYSTEM.md` |
| Cohort setup, batch imports, student-support ops | `COHORT-MANAGEMENT-GUIDE.md` |
| Exact question text for a tool (1, 3, 5, 7) | `Foundational Docs/Tool_*_Assessment_Content.md` |
| Field-level I/O across all 8 tools | `Middleware/middleware-mapping.md` |
| Tool 1 report/narrative/PDF | `Tool1/TOOL1-IMPROVEMENTS-DESIGN.md` |
| Tool 2 overhaul / Financial Mirror | `Tool2/TOOL2-OVERHAUL-DESIGN.md` |
| Tool 2 Quick Check-In mode | `Tool2/TOOL2-QUICK-CHECKIN-DESIGN.md` |
| Tool 4 authoritative shape | `Tool4/TOOL4-FINAL-SPECIFICATION.md` |
| Tool 4 calculation math | `Tool4/TOOL4-TECHNICAL-ARCHITECTURE.md` |
| Tool 4 server-side API | `Tool4/TOOL4-SERVER-API.md` |
| Tool 4 priority weights / unlock logic | `Tool4/TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md` |
| Tool 6 anything | `Tool6/Tool6-Consolidated-Specification.md` |
| Starting a Tool 6 dev session | `Tool6/TOOL6-DEV-STARTUP.md` |
| Tool 8 | **No spec doc exists** — fall back to `SYSTEM-DESCRIPTION.md` § 4 + code. See Known Gaps. |
| Progress Over Time feature | `ProgressOverTime/README.md` (feature is LIVE; coach UI pending) |

---

## 3. Canonical Authority Hierarchy

When two or more docs cover overlapping territory, these are the rules for which doc wins.

- **TruPath-the-company / identity / moat** → Canon: `TruPath_Master_System_Overview.md`. Supporting: `Business Docs/TruPath AI — Business Vision (30,000-Foot) - Local Copy.md` (AI product specifics), `Financial-TruPath-Tool-Descriptions.md` (client voice).
- **The 6 patterns — conceptual** → Canon: `Financial_TruPath_Core_Framework_Overview.md`. Supporting: `Financial_Trauma_Masterdoc_Reorganized.md` (depth), `TruPath_Master_System_Overview.md` § 3 (summary).
- **The 6 patterns — clinical / diagnostic** → Canon: `Financial_Trauma_Patterns_Clinical_Design_Document_1.md` (explicitly named "Authority Document" by Tool 3/5/7 content specs). Supporting: `Financial_Trauma_Assessment_Content_Development_Guide.md`.
- **Pattern co-occurrence** → Canon: `Co-Occurring_Pattern_Matrix.md`. Downstream: Integration Profiles + Belief Locks in `Financial-TruPath-Tool-Descriptions.md`, combination-narratives in `Tool1/TOOL1-IMPROVEMENTS-DESIGN.md`.
- **FTP-v3 technical architecture** → Canon: `SYSTEM-DESCRIPTION.md`. Supporting: `README.md`, `TOOL-DEVELOPMENT-GUIDE.md`, `LESSONS-LEARNED.md`, `Middleware/middleware-mapping.md`.
- **Per-tool implementation** → Canon per tool:
  - Tool 1 → `Tool1/TOOL1-IMPROVEMENTS-DESIGN.md`
  - Tool 2 → `Tool2/TOOL2-OVERHAUL-DESIGN.md` (Quick Check-In is a feature add-on)
  - Tool 4 → `Tool4/TOOL4-FINAL-SPECIFICATION.md` at the top; other 7 Tool4 docs are supporting deep-dives
  - Tool 6 → `Tool6/Tool6-Consolidated-Specification.md`
  - Tools 3/5/7 → no per-tool folder; content lives in `Foundational Docs/Tool_*_Assessment_Content.md` (they share `GroundingToolBase`)
  - Tool 8 → no design doc exists
- **Tool content / question text** → Canon: the per-tool `Foundational Docs/Tool_*_Assessment_Content.md` for Tools 1, 3, 5, 7. Tool 2 content is embedded in `Tool2/TOOL2-OVERHAUL-DESIGN.md` (no standalone doc). Tools 4/6/8 are calculators, not assessments.
- **Per-tool client-facing description** → Canon: `Financial-TruPath-Tool-Descriptions.md`.
- **Per-tool engineering description** → Canon: `SYSTEM-DESCRIPTION.md` § 4. Supporting: the tool subfolder.
- **GAS navigation rules** → Canon: `Navigation/GAS-NAVIGATION-RULES.md`. Derivative: `LESSONS-LEARNED.md` § Navigation, `TOOL-DEVELOPMENT-GUIDE.md` § Critical Patterns.
- **Design / CSS / visual** → Canon: `DESIGN-SYSTEM.md`. Supporting: `SYSTEM-DESCRIPTION.md` § 8.
- **Student / cohort admin** → Canon: `COHORT-MANAGEMENT-GUIDE.md` (no overlap).
- **Cross-tool I/O / field schema** → Canon: `Middleware/middleware-mapping.md`. Supporting: `SYSTEM-DESCRIPTION.md` per-tool entries.
- **TruPath AI twin product** → Canon: the two `Business Docs/` files (Business Vision for 30k-foot strategy, Structural Design for 10k-foot system design). `Middleware/IMPLEMENTATION-PLAN-Middleware-AI.md` is **superseded** — treat as archival.
- **Progress Over Time feature** → Canon: `ProgressOverTime/README.md` (current state + architecture summary). `IMPLEMENTATION-PLAN.md` is the deeper architectural record, now including a "Post-Plan Additions" section covering the AI narrative layer, second write hook, and SpreadsheetCache integration. Feature is LIVE for students; the admin-dashboard "View Progress" button is the open work item.

---

## 4. Per-Document Routing Rules

One entry per doc. Each entry: location → what it covers → altitude → open this when → staleness.

### Strategic (altitude: vision / positioning / business framing)

**`TruPath_Master_System_Overview.md`**
Company-level identity: what TruPath is, the behavioral pattern engine, 3 domains, 6 patterns, 4 Doors model, dual-sided (Side A/B) system. **Open when:** someone needs the canonical "what is TruPath?" explanation or the IP/moat story. **Staleness:** Low (2026-03-24, current).

**`Business Docs/TruPath AI — Business Vision (30,000-Foot) - Local Copy.md`**
TruPath AI (the product) at 30,000 feet: problem, build-vs-buy, 3-time-horizons product insight, IP moat (4 layers), phased rollout, open questions. **Open when:** the conversation is about the AI product vision, defensibility, or rollout strategy. **Staleness:** Medium — Section 2 Data Layer is superseded by an April 8 addendum (Supabase/hybrid DB).

**`Financial-TruPath-Tool-Descriptions.md`**
Client-voice descriptions of all 8 tools + the consolidated dashboard with Integration Profiles, Belief Locks, Awareness Gap, Belief-Behavior Gaps, Cross-Tool Warning Patterns. **Open when:** writing marketing/teaching copy, explaining a tool to a client, or needing dashboard framing. **Staleness:** Low (April 2026, reflects Tool 2 Financial Mirror).

### System-level (altitude: how things work, conceptually)

**`SYSTEM-DESCRIPTION.md`**
Engineering source of truth for FTP-v3: runtime, plugin arch, 14-tab Sheets model, 3-tier GPT fallback, tool-by-tool spec, InsightsPipeline, Integration/Capstone GPT, CSS layers, technical constraints. **Open when:** any architecture, sheets, GPT, or wiring question. **Staleness:** Low (April 2026).

**`Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md`**
TruPath AI at 10,000 feet: data layer, conversation engine (Know/Gap/Fill), first-conversation flow, momentum scoring, auto-write, RAG tiers (CLIENT/COACH/LARRY), persona, build sequence, hybrid-DB addendum. **Open when:** designing the AI twin's behavior or build order. **Staleness:** Medium — Section 2 superseded by Addendum A; Open Design Questions in Section 9 unresolved.

**`Foundational Docs/Financial_TruPath_Core_Framework_Overview.md`**
Mid-level narrative of the 6-pattern framework: 3 Domains of Disconnection, active/passive, "Money Is…" paradoxes, truth paths, behavioral signatures. **Open when:** teaching the framework in 2–3 pages, or needing canonical paradox names + truth-path mantras. **Staleness:** Low (content stable; encoding cleanup 2026-04-20).

**`Foundational Docs/Financial_Trauma_Patterns_Clinical_Design_Document_1.md`**
The clinical-voice version of the 6 patterns: Core Strategy, Conscious/Unconscious Goals, Practical/Psychological Prison, Diagnostic Markers, Distinctness. Explicitly "Authority Document" for Tool 3/5/7 content. **Open when:** designing assessment items, checking diagnostic uniqueness. **Staleness:** Low.

**`Foundational Docs/Financial_Trauma_Masterdoc_Reorganized.md`**
Long-form per-pattern deep dive: Core Belief, Untruth Strategy Matrix, Understanding, Truth Path, Financial Exercise. **Open when:** writing deep content for a specific pattern (coaching, curriculum, exercises). **Staleness:** Low (encoding cleanup 2026-04-20).

**`Foundational Docs/Financial_Trauma_Assessment_Content_Development_Guide.md`**
How to translate patterns into assessment items. 4-component scale recommendation, uniqueness principles. **Open when:** drafting or auditing assessment questions. **Staleness:** Low.

**`Foundational Docs/Co-Occurring_Pattern_Matrix.md`**
6×6 co-occurrence matrix + detailed HIGH/Medium/Low/Rare combinations, primary-secondary relationships. **Open when:** interpreting multi-pattern results, designing integration-profile or belief-lock logic. **Staleness:** Low.

**`README.md`**
Folder-level navigational index with task → doc table and folder tree. **Open when:** a brand-new reader needs a quick orientation to the folder layout. **Staleness:** Low-Medium — folder tree accurate, but doesn't emphasize that Middleware is dormant and doesn't reflect that ProgressOverTime is LIVE.

**`COHORT-MANAGEMENT-GUIDE.md`**
Runbook for admin cohort setup, batch imports, student ID conventions ("4521JS"), and student first-time/forgot-ID flows. **Open when:** any ops question about admin panel, cohorts, or student support. **Staleness:** Low (April 2026).

**`ProgressOverTime/README.md`** + **`ProgressOverTime/IMPLEMENTATION-PLAN.md`**
What the Progress Over Time feature is, its schema, data flow, and the engineering spec. Three code files: `core/ProgressHistory.js` (data layer), `core/ProgressNarrative.js` (AI narrative layer added post-plan), `shared/ProgressPage.js` (UI). Two write hooks: `DataService.saveToolResponse` and `ResponseManager.submitEditedResponse`. Student view is LIVE; coach view backend is built but admin-dashboard button is missing. **Open when:** working on Progress Over Time, debugging PROGRESS_HISTORY contents, or wiring the coach-side button. **Staleness:** Low — docs synced to code on 2026-04-20.

### Implementation / coding detail

**`TOOL-DEVELOPMENT-GUIDE.md`**
Build-a-new-tool manual: 7 shared utilities (EditModeBanner, DraftService, ReportBase, ErrorHandler, Validator, NavigationHelpers, PDFGenerator), CONFIG constants, tool types (single/multi-page/hybrid/adaptive), 5 non-negotiable patterns. **Open when:** creating or heavily modifying a tool, or teaching a new agent the framework. **Staleness:** Low-Medium — v3.9.0 reference is slightly behind the Tool 2 Financial Mirror era; header date "January 7, 2025" is a typo (should be 2026).

**`LESSONS-LEARNED.md`**
Every footgun discovered during dev: GAS navigation pitfalls, template literal escaping, data persistence, google.script.run edge cases, testing, GPT integration, batch sheet ops, the `runAllCoreTests()` safety net. **Open when:** about to write GAS navigation, template literal, or data-persistence code — or when a bug smells like any of those categories. **Staleness:** Low (actively maintained).

**`Navigation/GAS-NAVIGATION-RULES.md`**
Non-negotiable GAS nav rules: never use window.location; only navigate via document.write() in a success handler; forbidden patterns; debugging white screens. **Open when:** writing any navigation code or reviewing a PR that touches navigation. **Staleness:** Low — rules current; Phase 3B historical notes at bottom are clutter but not misleading.

**`DESIGN-SYSTEM.md`**
CSS source of truth: colors (#1e192b / #ad9168), typography (Radley/Rubik), spacing, components, animations, accessibility, responsive breakpoints. **Open when:** writing any CSS, building reports/PDFs/decks, or checking brand alignment. **Staleness:** Low (March 31, 2026; generated from live CSS).

**`Middleware/middleware-mapping.md`**
Exhaustive per-tool input/output field schema, including cross-tool pre-population (Tool 2 → Tool 4, Tool 6 → Tool 8). **Open when:** looking up exact field names or cross-tool data flow. **Staleness:** Medium — dated Feb 14, 2026, predates the April Tool 2 overhaul. Tool 2 section may reference old "Financial Clarity & Values" schema.

**`Foundational Docs/Tool_1_Core_Assessment_Form_Structure.md`**
Literal Tool 1 question bank: 26 questions, types, options, ranking grids. **Open when:** auditing Tool 1 question wording or item-to-pattern mapping. **Staleness:** Low.

**`Foundational Docs/Tool_3_Identity_Validation_Assessment_Content.md`**
Tool 3 (Identity & Validation grounding) content: 24 scale questions + 6 open-response, -3 to +3 scale, 6 subdomains. **Open when:** editing Tool 3 content. **Staleness:** Low.

**`Foundational Docs/Tool_5_Love_Connection_Assessment_Content.md`**
Tool 5 (Love & Connection) content — same template as Tool 3. **Open when:** editing Tool 5 content. **Staleness:** Low.

**`Foundational Docs/Tool_7_Security_Control_Assessment_Content.md`**
Tool 7 (Security & Control) content — same template as Tool 3. **Open when:** editing Tool 7 content. **Staleness:** Low.

**`Tool1/TOOL1-IMPROVEMENTS-DESIGN.md`**
Data-driven Tool 1 improvements: PATTERN_THRESHOLDS, profile types (STRONG_SINGLE / BORDERLINE_DUAL / NEGATIVE_DOMINANT), combination narratives, PDF/report changes. **Open when:** working on Tool 1 report/PDF or profile classification. **Staleness:** Low (April 2026).

**`Tool2/TOOL2-OVERHAUL-DESIGN.md`**
Full Tool 2 "Financial Mirror" redesign: objective-vs-subjective dual-track, 5 domains (Money Flow, Obligations, Liquidity, Growth, Protection), gap classification (UNDERESTIMATING/ALIGNED/OVERESTIMATING), scarcity flag, 9-section report. **Open when:** any Tool 2 work. **Staleness:** Low.

**`Tool2/TOOL2-QUICK-CHECKIN-DESIGN.md`**
Quick Check-In feature (pre-fill from prior, delta-focused report, `assessmentMode = 'light'`). **Open when:** touching Quick Check-In flow. **Staleness:** Low.

**`Tool4/TOOL4-FINAL-SPECIFICATION.md`**
Top-line Tool 4 authority: M/E/F/J buckets, 10 priorities with progressive unlock, 29 trauma modifiers, Calculator + Report architecture. **Open when:** first reading Tool 4 or resolving "what is the authoritative shape of Tool 4." **Staleness:** Medium (Nov 2025; code has evolved past spec).

**`Tool4/TOOL4-REDESIGN-SPECIFICATION.md`**
7-phase architectural spec combining V1 personalization with calculator UI. Includes GPT integration and PDF styling phases. **Open when:** understanding how V1 engine and calculator were blended, or auditing PDF styling. **Staleness:** Medium (Dec 2025; phases marked complete).

**`Tool4/TOOL4-TECHNICAL-ARCHITECTURE.md`**
`buildV1Input()` normalizer, tier mapping, 10-priority ranking logic, V1 allocation algorithm, example walkthrough. **Open when:** changing allocation math or priority ranking. **Staleness:** Medium.

**`Tool4/TOOL4-IMPLEMENTATION-DETAILS.md`**
Surplus formula (Income − Current Essentials), category validation, modifier order, scenario naming, error handling. **Open when:** touching surplus, modifier ordering, or scenarios. **Staleness:** Medium.

**`Tool4/TOOL4-SERVER-API.md`**
Server-side API surface for Tool 4 (Code.js entry points). **Open when:** writing or extending Tool 4 server code. **Staleness:** Medium.

**`Tool4/TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md`**
Priority weight decisions, Single-Priority pivot, Hybrid Allocation UX (3 paths), the 10 priorities full specs. **Open when:** questioning any weight, unlock rule, or priority-selection decision. **Staleness:** Medium; contains a "Still To Be Defined" section.

**`Tool4/TOOL4-BACKUP-MAPPING-TABLES.md`**
Lookup tables mapping backup-question answers to approximate Tool 1/2/3 data (TRAUMA_PATTERN_SCORES). **Open when:** adjusting the fallback path for incomplete tool data. **Staleness:** Medium.

**`Tool4/TOOL4-TEST-DATA.md`**
8 test student profiles + expected unlock/allocation outputs. **Open when:** running Tool 4 regression tests. **Staleness:** Medium.

**`Tool6/Tool6-Consolidated-Specification.md`**
Tool 6 (Retirement Blueprint) authority: Ambition Quotient, 9 Investor Profiles, 32 sprints / 10 phases, coupled-slider behavior, 529/Coverdell education logic, IRS 2025 limits. Detailed changelog built in. **Open when:** anything Tool 6 — profile classification, vehicle allocation, slider behavior, education logic, reports/PDFs. **Staleness:** Low (Jan 2026 v2.0 with changelog).

**`Tool6/TOOL6-DEV-STARTUP.md`**
Tool 6 session-handoff guide: start-here pointers, sprint checklist, handoff protocol, key decisions. **Open when:** starting a fresh Tool 6 dev session. **Staleness:** Low.

**`ToDos.md`**
Active bug/feature backlog. **Open when:** planning the next dev session or checking if a reported bug is tracked. **Staleness:** Medium — dated March 2026; items may be fixed but unstruck.

### Archival / superseded

**`Middleware/IMPLEMENTATION-PLAN-Middleware-AI.md`**
Older roadmap for config-driven cross-tool analytics + AI inside FTP-v3, supplanted by the TruPath AI twin architecture. **Open when:** investigating what was originally planned, or deciding whether any pieces should be salvaged. **Staleness:** **High** — explicitly "not implemented, reference only."

**`Foundational Docs/Complete_Refinement_Summary.md`**
Change log from the Nov 2025 refinement that eliminated pattern-framework overlap. **Open when:** auditing framework evolution. **Staleness:** Low for content, but inherently backward-looking.

---

## 5. Concept Glossary

Canonical definition location in parentheses.

- **TruPath** — the company built on a proprietary behavioral pattern engine (`TruPath_Master_System_Overview.md`)
- **TruPath AI / AI twin** — the behavioral intelligence platform with a coaching interface; the new AI product built on FTP-v3 data (`Business Docs/TruPath AI — Business Vision (30,000-Foot) - Local Copy.md`)
- **FTP-v3 / Financial TruPath v3** — the financial-domain 8-tool Google Apps Script web app (`SYSTEM-DESCRIPTION.md`)
- **Behavioral Pattern Engine** — TruPath's core IP (`TruPath_Master_System_Overview.md` § 3)
- **Three Domains of Disconnection** — Self / Others / All That's Greater (`Financial_TruPath_Core_Framework_Overview.md`)
- **Six Core Patterns** — False Self-View (FSV), External Validation (ExVal), Issues Showing Love (ISL), Issues Receiving Love (IRL), Control Leading to Isolation (CLI), Fear Leading to Isolation (FLI) (`Financial_TruPath_Core_Framework_Overview.md`)
- **Active vs Passive** — within each domain, one pattern is active (doing) and one is passive (allowing) (same doc)
- **"Money Is…" paradox** — each pattern attaches a concept (Safety/Acceptance/Sacrifice/Evil/Control/Fear) to money (same doc)
- **Truth path** — the opposite/corrective statement breaking a pattern's loop (same doc)
- **Pattern structure: Belief / Behavior / Feeling / Consequence** — four components of every pattern (`TruPath_Master_System_Overview.md` § 3.3)
- **Reinforcing loop** — Belief → Behavior → Outcome → Reinforces Belief (same doc)
- **4 Doors / Entry Point Model** — Finance / Relationships / Health / Purpose as entry points revealing the same underlying patterns (`TruPath_Master_System_Overview.md` § 5)
- **Dual-Sided System (Side A / Side B)** — Side A direct coaching impact; Side B continuously-updated behavioral intelligence (`TruPath_Master_System_Overview.md` § 8)
- **8-Tool System** — Tools 1–8, alternating psychological and financial, culminating in Capstone (`SYSTEM-DESCRIPTION.md` § 2)
- **Tool 1 / Core Trauma Strategy Assessment** — identifies dominant of 6 strategies (`SYSTEM-DESCRIPTION.md`, `Tool_1_Core_Assessment_Form_Structure.md`)
- **Tool 2 / Financial Mirror** — post-April-2026 rename; objective vs subjective financial reality gap (`Tool2/TOOL2-OVERHAUL-DESIGN.md`)
- **Tool 3 / Identity & Validation Grounding** — FSV + ExVal subdomains (`Foundational Docs/Tool_3_*`)
- **Tool 5 / Love & Connection Grounding** — ISL + IRL subdomains (`Foundational Docs/Tool_5_*`)
- **Tool 7 / Security & Control Grounding** — CLI + FLI subdomains (`Foundational Docs/Tool_7_*`)
- **Tool 4 / Financial Freedom Framework** — M/E/F/J budget calculator (`Tool4/TOOL4-FINAL-SPECIFICATION.md`)
- **Tool 6 / Retirement Blueprint** — vehicle-allocation calculator with 9 investor profiles (`Tool6/Tool6-Consolidated-Specification.md`)
- **Tool 8 / Investment Planning** — three-mode retirement calculator (`SYSTEM-DESCRIPTION.md` § 4)
- **M/E/F/J** — Multiply / Essentials / Freedom / Enjoyment (Tool 4's four buckets)
- **Grounding tool** — Tools 3/5/7; 7-page structure (1 intro + 6 subdomain deep-dives) (`SYSTEM-DESCRIPTION.md` § 4)
- **Quotient score** — grounding-tool score 0–100 where lower = healthier (`ProgressOverTime/README.md`)
- **Ambition Quotient** — Tool 6 weighting algorithm (importance + anxiety + motivation + time-discounted urgency) (`Tool6-Consolidated-Specification.md`)
- **9 Investor Profiles** — ROBS-In-Use Strategist, ROBS-Curious Candidate, Business Owner with Employees, Solo 401(k) Optimizer, Bracket Strategist, Catch-Up Contributor, Foundation Builder, Roth Maximizer, Late-Stage Growth (same doc)
- **Capstone / Integration Layer** — cross-tool synthesis after minimum tools complete (`SYSTEM-DESCRIPTION.md` § 5)
- **IntegrationGPT vs CapstoneGPT** — IntegrationGPT generates 8-section narrative; CapstoneGPT produces "Your Financial Story" + "Capstone Insights" (same doc)
- **3-tier GPT fallback** — GPT → retry at 2s → pre-written score-aware template, with `source` tagging (`SYSTEM-DESCRIPTION.md` § 5)
- **InsightsPipeline** — configuration-driven cross-tool intelligence engine (`SYSTEM-DESCRIPTION.md`)
- **Integration Profile** — named archetype from Tool 1 pattern + grounding scores: Guardian / Provider / Achiever / Protector / Connector (`Financial-TruPath-Tool-Descriptions.md`)
- **Belief Lock** — interlocking cross-tool pattern (Scarcity + Shame, Caretaker Trap, Control + Isolation, Fear + Paralysis) (same doc)
- **Belief-Behavior Gap** — mismatch between stated belief and observed behavior within a grounding subdomain (same doc)
- **Awareness Gap** — psychological stress exceeds reported financial stress (blind spot) (same doc)
- **Know / Gap / Fill loop** — TruPath AI twin's conversation loop (`Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md`)
- **Momentum Signal (Forward/Neutral/Backwards)** — per-conversation scoring; Backwards triggers coach alert (`Business Docs/` — both Vision and Structural Design)
- **Gap priority logic** — ranks which profile dimension to fill next based on friction + pattern + tool history (`Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md`)
- **Student ID** — last 4 phone digits + 2–3 initials, e.g. "4521JS" (`COHORT-MANAGEMENT-GUIDE.md`)
- **PROGRESS_HISTORY** — dedicated sheet storing score snapshots for Tools 1, 2, 3, 5, 7 with 10-version FIFO cap (`ProgressOverTime/`)
- **CONVERSATION_HISTORY / CONVERSATION_TOOL1 / CONVERSATION_FILL / MOMENTUM_LOG** — new sheets the TruPath AI twin writes (`Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md`)
- **Scarcity flag** — Tool 2 boolean for global vs targeted scarcity profile (`Tool2/TOOL2-OVERHAUL-DESIGN.md`)
- **Gap index / gap classification** — Tool 2's objective − subjective metric (UNDERESTIMATING/ALIGNED/OVERESTIMATING) (same doc)
- **Profile Type (Tool 1)** — STRONG_SINGLE / BORDERLINE_DUAL / NEGATIVE_DOMINANT (`Tool1/TOOL1-IMPROVEMENTS-DESIGN.md`)
- **Quick Check-In** — Tool 2 delta-focused re-assessment mode, `assessmentMode = 'light'` (`Tool2/TOOL2-QUICK-CHECKIN-DESIGN.md`)
- **Progressive Priority Unlock** — Tool 4 mechanism where priorities unlock based on financial data (`Tool4/TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md`)
- **Surplus** — in Tool 4: Monthly Income − Current Essentials (`Tool4/TOOL4-IMPLEMENTATION-DETAILS.md`)
- **document.write() navigation pattern** — the only safe post-interaction navigation in GAS (`Navigation/GAS-NAVIGATION-RULES.md`)
- **Is_Latest** — column in RESPONSES sheet; only one row per client+tool may be TRUE (`SYSTEM-DESCRIPTION.md`, `LESSONS-LEARNED.md`)
- **EDIT_DRAFT** — in-progress edit row status; must be deleted (not marked) on completion (`LESSONS-LEARNED.md`)
- **v3.9.0 refactor / 7 shared utilities** — EditModeBanner, DraftService, ReportBase, ErrorHandler, Validator, NavigationHelpers, PDFGenerator (`TOOL-DEVELOPMENT-GUIDE.md`)

---

## 6. Known Gaps & Documentation Debt

Things that are *not* in the knowledge base but probably should be. Flag these when a conversation hits them.

- **Tool 8 has no design/spec doc.** Tool 8 is a production tool (~6,342 lines per SYSTEM-DESCRIPTION), has three calculation modes, and is the capstone of the calculator sequence — but has no dedicated folder or spec. Anyone modifying Tool 8 must rely on `SYSTEM-DESCRIPTION.md` § 4 + `middleware-mapping.md` § Tool 8 + the code itself. `ToDos.md` notes Larry is considering a rebuild.
- **Tool 2 has no standalone question-content doc.** Unlike Tools 1/3/5/7, Tool 2's question text lives inside `Tool2/TOOL2-OVERHAUL-DESIGN.md` and in code. This is a consequence of the April 2026 overhaul.
- **No single concept glossary lived outside this map.** Integration Profile, Belief Lock, Quotient, Awareness Gap, 4 Doors, etc. were scattered across 3–4 docs each. Section 5 of this map is now the consolidated glossary.
- **Foundational Docs encoding artifacts — FIXED 2026-04-20.** Previously, six docs had double-encoded UTF-8 mojibake (em-dashes appeared as `â€"`, arrows as `â†'`, etc.) from a UTF-8 → cp1252 → UTF-8 round-trip somewhere upstream. All six were cleaned via cp1252 reverse round-trip and `ftfy`, with an HTML-comment marker added at the top of each cleaned file. Files affected: `Co-Occurring_Pattern_Matrix.md`, `Tool_5_Love_Connection_Assessment_Content.md`, `Financial_TruPath_Core_Framework_Overview.md`, `Complete_Refinement_Summary.md`, `Financial_Trauma_Assessment_Content_Development_Guide.md`, `Financial_Trauma_Masterdoc_Reorganized.md`.
- **Progress Over Time coach UI is missing.** The backend (`AdminRouter.handleGetStudentProgressRequest` + `getStudentProgressPage` in `Code.js`) is built and tested. The admin dashboard (`html/AdminDashboard.html`) has no button that calls it. Adding a "View Progress" button next to the existing student-detail controls is the only remaining work item from the original Progress Over Time implementation plan.
- **The `TOOL-DEVELOPMENT-GUIDE.md` header date** reads "January 7, 2025" — this is a typo for 2026.

---

## 7. Staleness Register (prioritized)

For quick reference. Details are in each doc's Per-Document Routing entry above.

| Severity | Doc | Issue |
|---|---|---|
| **High** | `Middleware/IMPLEMENTATION-PLAN-Middleware-AI.md` | Superseded by the `Business Docs/` vision docs. Reference only. |
| **Medium** | `Business Docs/TruPath AI — Business Vision (30,000-Foot) - Local Copy.md` | Section 2 superseded by April 8 Supabase/hybrid addendum. |
| **Medium** | `Business Docs/TruPath AI — Structural Design (10,000-Foot) - local copy.md` | Section 2 superseded by Addendum A; Section 9 Open Design Questions unresolved. |
| **Medium** | `Middleware/middleware-mapping.md` | Feb 2026 — predates April Tool 2 overhaul. |
| ~~Medium~~ → **Low** | `ProgressOverTime/*` | ~~Feature built but disabled since March 2026.~~ Resolved 2026-04-20: feature is LIVE for students; docs synced to code. Coach-UI button is the only open work item (tracked in Known Gaps). |
| **Medium** | `ToDos.md` | March 2026 — some items may be done but unstruck. |
| **Medium** | `Tool4/*` (all 8 docs) | Nov–Dec 2025 — Tool 4 has shipped and evolved. Reference only. |
| **Low-Medium** | `README.md` | Folder tree accurate; doesn't flag Middleware as dormant or ProgressOverTime as LIVE. |
| **Low-Medium** | `TOOL-DEVELOPMENT-GUIDE.md` | Header date typo; post-v3.9 Tool 2 overhaul not fully reflected. |
| **Low** | `Foundational Docs/*` | Nov 2025 content, still current. Encoding artifacts FIXED 2026-04-20. |
| **Low** | `SYSTEM-DESCRIPTION.md`, `TruPath_Master_System_Overview.md`, `Financial-TruPath-Tool-Descriptions.md`, `LESSONS-LEARNED.md`, `Navigation/GAS-NAVIGATION-RULES.md`, `DESIGN-SYSTEM.md`, `COHORT-MANAGEMENT-GUIDE.md`, `Tool1/*`, `Tool2/*`, `Tool6/*` | Current as of their last update. |

---

## 8. Maintenance

- **After any major doc addition, rename, or restructuring:** regenerate this map by running the deep-research pass again.
- **After a meaningful content edit:** update just the affected entry in Section 4 and any glossary terms the edit touched.
- **When a new tool folder is created:** add entries in Sections 1 (Tier 4), 2 (Routing Table), 3 (Authority), 4 (per-doc), and 5 (glossary if new terms introduced).
- **When a doc is deprecated or moves to Archive:** change its tier to 5 or remove its entry, and update any Routing Table rows that pointed to it.
- **The AI memory system has a pointer to this map.** The memory itself stays thin; this map is the source of truth.
