TruPath AI — Structural Design  
10,000-Foot Document  
March 2026 — Working Draft

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
1\. SYSTEM OVERVIEW  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TruPath AI is built as a standalone system that integrates with the existing FTP-v3 platform via Google Sheets API. No modifications to FTP-v3's codebase are required. Both systems share a data store; the AI twin reads and writes to it.

High-level stack:  
  — Data layer: Google Sheets (FTP-v3 data model, extended with new tabs)  
  — AI twin: Separate Node.js system, serverless or hosted  
  — Knowledge base: RAG infrastructure (TruPath framework docs, Larry's voice corpus)  
  — Interfaces: Client chat, Coach dashboard, Agent query endpoint  
  — Connection to FTP-v3: Google Sheets API via service account (same pattern already in use)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
2\. DATA LAYER  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Existing FTP-v3 sheets the AI twin reads:

  STUDENTS          — client roster, status, enrollment  
  RESPONSES         — all 8 tool submissions as JSON (versioned, Is\_Latest flag)  
  TOOL\_STATUS       — completion grid per client  
  CROSS\_TOOL\_INSIGHTS — generated insights from InsightsPipeline  
  PROGRESS\_HISTORY  — score snapshots, 10-version cap per client+tool  
  INSIGHT\_MAPPINGS  — configuration rules for cross-tool intelligence

New sheets to be added (AI twin writes):

  CONVERSATION\_HISTORY  
    Fields: Session\_ID, Client\_ID, Timestamp, Opening\_Friction, Pattern\_Mapped,  
            Gaps\_Targeted, Insights\_Surfaced, Momentum\_Score (Forward/Neutral/Backwards),  
            Profile\_Updates\_Written, Session\_Summary (GPT narrative)

  MOMENTUM\_LOG  
    Fields: Client\_ID, Timestamp, Score, Score\_Rationale, Coach\_Alerted (Y/N)

Design constraint: follow the Is\_Latest versioning pattern already established in RESPONSES.  
Design constraint: PROGRESS\_HISTORY snapshot pattern is the model for CONVERSATION\_HISTORY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
3\. THE CONVERSATION ENGINE  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The conversation engine runs a three-step loop on every exchange:

STEP 1 — KNOW  
Load the client's current state:  
  — Completed tool data from RESPONSES (Is\_Latest only)  
  — CROSS\_TOOL\_INSIGHTS for this client  
  — PROGRESS\_HISTORY trajectory  
  — Recent CONVERSATION\_HISTORY (last N sessions)  
  — Which tools are complete vs. locked (TOOL\_STATUS)

STEP 2 — GAP  
Compute what is missing:  
  — Diff completed tool data against full tool schema  
  — Identify dimensions not yet surfaced (unanswered or low-confidence)  
  — Map gaps to the client's dominant pattern (Tool 1 output)  
  — Rank gaps by: (a) relevance to stated friction, (b) tool-progression proximity,  
    (c) framework-predicted importance given this pattern  
  — Output: prioritized gap list for this session

Gap priority logic (working foundation — to be refined with Larry):  
  — Opening question: "What problem / friction are you facing right now?"  
  — Response maps to pattern → framework predicts which dimensions are likely involved  
  — Highest-priority gap \= the missing dimension most likely to illuminate the stated friction  
  — Tool-proximity constraint: only reference completed tools; steer toward next unlock frontier

STEP 3 — FILL  
Run the coaching conversation:  
  — Use RAG knowledge base (TruPath framework \+ Larry's voice corpus) for response generation  
  — Steer naturally toward highest-priority gap without the client experiencing it as an assessment  
  — One gap per conversation thread — do not stack  
  — After meaningful exchange: extract insight, write to CROSS\_TOOL\_INSIGHTS and RESPONSES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
4\. FIRST CONVERSATION FLOW (NO PROFILE)  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When TOOL\_STATUS shows Tool 1 incomplete:

  1\. Open with friction question: "What problem are you facing / what friction do you have right now?"  
  2\. Use response as entry point — do not pivot abruptly to an assessment  
  3\. Follow conversational Tool 1 process: identify dominant strategy through natural dialogue  
     (mirrors the 6-pattern, 26-question structure but experienced as a coaching conversation)  
  4\. Write identified pattern to RESPONSES as a CONVERSATION\_TOOL1 entry  
     (separate from the formal Tool 1 — does not unlock Tool 2, but seeds the AI twin's profile)  
  5\. Subsequent conversations use this seed until the client completes formal Tool 1

Design question: Does a CONVERSATION\_TOOL1 entry count toward Tool 1 completion  
in FTP-v3, or is it treated as a parallel track? (Needs Larry's decision)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
5\. MOMENTUM SCORING  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every conversation is scored Forward / Neutral / Backwards at session close.

Scoring is computed by the AI against the momentum signal vocabulary — a set of behavioral and language indicators defined by Larry and encoded into the system.

Framework for scoring (working — to be finalized with Larry):

  FORWARD signals:  
    — Client names a belief they previously held as now feeling different  
    — Client describes a behavior change and connects it to their pattern  
    — New domain of self-awareness opened  
    — Client expresses reduced identification with their dominant pattern  
    — \[Larry to expand\]

  NEUTRAL signals:  
    — Conversation covered familiar ground without new insight integration  
    — Client processed but did not shift  
    — Maintenance / accountability conversation  
    — \[Larry to expand\]

  BACKWARDS signals:  
    — Client reinforces the core belief of their dominant pattern as truth  
    — Behavior described consistent with pattern loop tightening  
    — Client rejects framework framing or coaching direction  
    — Increased emotional constriction or avoidance language  
    — \[Larry to expand\]

Score written to MOMENTUM\_LOG after each session.  
Backwards score triggers coach alert — written to coach-facing dashboard queue.

Design question: Is scoring done by the AI alone, or does the human coach  
have the ability to override / adjust a session's score?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
6\. AUTO-WRITE LOGIC  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Confirmed: no human approval gate. Insights write directly.

After each meaningful exchange, the system:  
  1\. Extracts insight (pattern observation, belief surfaced, behavioral connection made)  
  2\. Maps it to the relevant tool dimension  
  3\. Writes to CROSS\_TOOL\_INSIGHTS (follows existing InsightsPipeline format)  
  4\. If it fills a formal tool question: also writes to RESPONSES as a CONVERSATION\_FILL entry  
     with source tagged 'ai\_conversation' (not 'client\_form')  
  5\. Logs session summary to CONVERSATION\_HISTORY

Design question: Does a CONVERSATION\_FILL entry count toward unlocking the next tool,  
or does the client still need to complete the formal tool interface?  
(Likely: no — formal tool completion requires the full structured process.  
But AI-filled data enriches the profile and informs coaching.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
7\. KNOWLEDGE BASE (RAG LAYER)  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The AI twin's response generation draws from two sources:

SOURCE 1 — Client-specific context (FTP-v3 data layer, as above)  
  Dynamic, per-conversation, loaded fresh each session

SOURCE 2 — TruPath knowledge base (RAG infrastructure)  
  Static corpus, chunked and embedded, queried by semantic similarity  
  Contents:  
    — TruPath behavioral framework documentation (6 patterns, full structure)  
    — FTP-v3 tool content (questions, scoring logic, intervention rationale)  
    — Larry's coaching voice corpus (transcripts, written content, teaching materials)  
    — Delphi knowledge base (to be migrated — all Google Drive content)  
    — FTP-v3 system description and markdown docs (already have)

Access segmentation (three tiers):  
  CLIENT tier — framework explanations, coaching responses, tool-relevant content  
  COACH tier — CLIENT tier \+ pattern interaction logic, intervention strategies,  
               case-level insights, coach guidance content  
  LARRY tier — full access including raw data, aggregate behavioral analysis,  
               system-level queries

RAG infrastructure is Project 2 in the current build roadmap.  
The AI twin is Project 3 and depends on Project 2 being live.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
8\. PERSONA LAYER  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The AI speaks as Larry — specifically as Larry applying the TruPath framework.

Calibration sources:  
  — IntegrationGPT.js and CapstoneGPT.js narrative outputs (existing voice baseline)  
  — Larry's coaching transcripts and teaching content (to be ingested into RAG)  
  — TruPath framework documentation (tone \+ conceptual vocabulary)

The AI identifies itself as AI to clients. (Confirmed — exact disclosure language TBD)

Persona constraints (to be defined):  
  — Questions the AI declines and escalates to a human coach  
  — Emotional safety boundaries (what it does when a client presents crisis signals)  
  — Larry's communication style rules (what he says vs. doesn't say, how he frames things)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
9\. OPEN DESIGN QUESTIONS (STRUCTURAL)  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These must be answered before Boris starts. They define the spec.

  \[ \] Does CONVERSATION\_TOOL1 (AI-identified pattern) count toward formal Tool 1 completion?

  \[ \] Does CONVERSATION\_FILL data unlock next tools, or is formal tool completion still required?

  \[ \] Is momentum scoring AI-only, or can coaches override?

  \[ \] What questions / topics does the AI decline and escalate to a human coach?

  \[ \] What are the emotional safety protocols? (crisis detection, escalation path)

  \[ \] What is Larry's communication style guide? (phrases he uses, framing he prefers,  
      what he never says)

  \[ \] Does the AI twin serve all TruPath domains (Finance, Relationships, Health, Purpose)  
      from day one, or does Phase 1 focus on Financial TruPath only?

  \[ \] What does the client onboarding flow look like — does the AI twin replace the  
      FTP-v3 web app intake or run alongside it?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
10\. BUILD SEQUENCE AND DEPENDENCIES  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE BORIS STARTS:  
  1\. Larry answers the open design questions (Section 9\)  
  2\. Larry defines momentum signal vocabulary (Section 5\)  
  3\. Larry provides communication style guide for persona layer (Section 8\)  
  4\. RAG infrastructure (Project 2\) is live and accepting ingestion

PHASE 1 DEPENDENCIES:  
  — Google Sheets service account connector  
  — Conversation engine (Know/Gap/Fill)  
  — First-conversation flow (conversational Tool 1\)  
  — Auto-write to CROSS\_TOOL\_INSIGHTS and CONVERSATION\_HISTORY  
  — Basic momentum scoring (simplified until signal vocabulary is finalized)  
  — Client chat interface

PHASE 2 DEPENDENCIES:  
  — Phase 1 live  
  — Coach dashboard UI  
  — Momentum triage queue  
  — Longitudinal delta computation

PHASE 3 DEPENDENCIES:  
  — Phase 2 live  
  — Streaming STT integration (AssemblyAI or equivalent)  
  — Real-time coach overlay interface

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS: Working draft — built from conversation of March 20, 2026\.  
Next step: Design session with Larry to answer Section 9 open questions.  
These answers produce the Boris build spec.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
ADDENDUM A: Data Layer Evolution — Hybrid Database Architecture  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
Added: 2026-04-08  
Source: FTP-v3 codebase analysis \+ architectural review

This addendum supersedes Section 2 (Data Layer) for the TruPath AI system. FTP-v3 continues to use Google Sheets unchanged.

REVISED DATA ARCHITECTURE

The original design (Section 2\) describes TruPath AI reading and writing directly to Google Sheets via service account. After a full codebase analysis of FTP-v3 (104K lines, 14 sheet tabs, 8 tools), this approach has a shelf life. TruPath AI will generate significantly more write volume than FTP-v3 — every conversation logs history, every insight writes to the profile, momentum scores log continuously. Google Sheets API rate limits (60 writes/user/minute for service accounts, 300 reads/minute) become a constraint at scale.

The revised architecture introduces a real database as the primary data store for TruPath AI, with a sync layer bridging FTP-v3's Google Sheets.

THE HYBRID MODEL

  FTP-v3 (GAS) — no changes. Continues writing to Google Sheets as it does today.  
  Sync Layer — lightweight service that mirrors Sheet changes into the database.  
  TruPath AI (Node.js) — reads and writes exclusively to the database.  
  Reverse Sync — selected data (momentum scores, conversation summaries, alerts) syncs back to designated Sheets tabs for coach visibility.

FTP-v3 changes required: zero. The sync is external. Students notice nothing.

DATABASE: SUPABASE (POSTGRES)

Supabase is the recommended platform because it provides:  
  — Postgres with native JSON column support (tool response data stays flexible)  
  — Built-in auth (maps to Client/Coach/Larry access tiers when ready)  
  — Real-time subscriptions (coach dashboard gets live momentum updates without polling)  
  — Auto-generated REST API (simplifies sync layer)  
  — Row-level security (access tiers from Section 7 map directly to RLS policies)  
  — pgvector extension (RAG embeddings can live in the same database)  
  — Free tier covers current scale; paid tier is $25/month

SCHEMA MAPPING

Core tables (migrated from existing sheets):  
  students            — from STUDENTS sheet  
  responses           — from RESPONSES sheet (JSON data column preserved)  
  tool\_status         — from TOOL\_STATUS sheet  
  tool\_access         — from TOOL\_ACCESS sheet  
  sessions            — from SESSIONS sheet  
  activity\_log        — from ACTIVITY\_LOG sheet  
  cohorts             — from COHORTS sheet  
  config              — from CONFIG sheet

Cross-tool tables:  
  insight\_mappings     — from INSIGHT\_MAPPINGS  
  cross\_tool\_insights  — from CROSS\_TOOL\_INSIGHTS  
  progress\_history     — from PROGRESS\_HISTORY

Scenario tables:  
  tool4\_scenarios      — from TOOL4\_SCENARIOS  
  tool6\_scenarios      — from TOOL6\_SCENARIOS  
  tool8\_scenarios      — from TOOL8\_SCENARIOS

New tables (TruPath AI native — never existed in Sheets):  
  conversation\_history — sessions, transcripts, gap targets, momentum scores  
  momentum\_log         — per-client momentum scoring over time  
  knowledge\_chunks     — RAG vector embeddings (using pgvector)

Key design decision: the responses table keeps a JSON data column. Postgres has native JSON querying (response\_data-\>\>'profileType'), so TruPath AI gets the query power of SQL without requiring schema normalization of every tool's response format.

SYNC LAYER OPTIONS

Option A — GAS Trigger \+ Webhook (simplest, minimal FTP-v3 change):  
  A single onChange trigger in FTP-v3 fires when any sheet is modified. It sends the changed row to a webhook endpoint on the TruPath AI server via UrlFetchApp. The TruPath AI server writes to Postgres. This is the only code change to FTP-v3: one webhook call when data is written.

Option B — External Sync Service (zero FTP-v3 changes):  
  A small Node.js service polls the Sheets API on interval (or uses Google Sheets push notifications), diffs against the database, and writes new/changed rows to Postgres. FTP-v3 is completely untouched.

Recommendation: Option A for Phase 1 (simpler, near-real-time), with Option B as a fallback if the GAS trigger proves unreliable.

REVERSE SYNC (DB TO SHEETS — SELECTIVE)

Not everything in the database syncs back. Only data coaches actively use:  
  — Momentum scores to a new MOMENTUM tab in the mastersheet  
  — Conversation summaries to a new AI\_SESSIONS tab (one row per conversation)  
  — Coach alerts to a new ALERTS tab (Backwards-momentum clients surface here)

Coaches keep their spreadsheet command center. The database handles the heavy lifting underneath.

WHAT THIS CHANGES IN THE BUILD SEQUENCE

Section 10 (Build Sequence) Phase 1 dependencies are revised:  
  — REMOVE: "Google Sheets service account connector" as the primary data interface  
  — ADD: Supabase/Postgres setup with schema migration from Sheets  
  — ADD: Sync layer (Option A or B)  
  — ADD: Reverse sync for coach-visible data

The conversation engine, auto-write logic, and momentum scoring all target the database instead of Sheets directly. This simplifies the TruPath AI codebase (standard SQL queries instead of Sheets API with caching and rate limit handling) and adds approximately half a Boris day to Phase 1 while saving more than that in reduced Sheets API complexity.

LONG-TERM STRATEGIC VALUE

Once the database exists and the sync is running, FTP-v3 can migrate to the database incrementally, one feature at a time, if and when needed:  
  — Point DataService.getLatestResponse() at the database instead of Sheets: one function change.  
  — Subscribe to Supabase real-time for tool unlock notifications instead of polling sheet rows.  
  — Eventually modernize the FTP-v3 frontend with the database already in place.

The database becomes the system of record. Sheets become a read-only view. FTP-v3 transitions at its own pace — or never, if it does not need to.

