# Tier 1 Execution Plan: Performance + Zero-Risk Extractions

> **Goal:** Improve application speed and extract duplicated code — without changing any tool behavior.
> **Risk level:** Zero for all 6 phases. No logic changes, only caching, payload reduction, and code relocation.

---

## Phase 1: Data Layer Caching (HIGHEST IMPACT)

### The Problem
`ResponseManager.getLatestResponse()` at `core/ResponseManager.js:46` calls `sheet.getDataRange().getValues()` — loading the ENTIRE RESPONSES sheet every time. Tool 6 makes 10+ of these calls per render (lines 84-89, 8275-8276, 8610-8611, 8758).

A caching utility already exists at `core/SpreadsheetCache.js:66` (`getSheetData()`) with cache invalidation (`invalidateSheetData()`) — but **no file in the codebase uses it**.

### Files to Modify

**`core/ResponseManager.js`** (9 call sites)
- Lines 46, 110, 163, 369, 442, 503, 591, 623, 679
- Replace: `const data = sheet.getDataRange().getValues();`
- With: `const data = SpreadsheetCache.getSheetData(CONFIG.SHEETS.RESPONSES);`
- For methods that write data, add `SpreadsheetCache.invalidateSheetData(CONFIG.SHEETS.RESPONSES);` after the write

**`core/DataService.js`** (7 call sites)
- Lines 111, 179, 218, 270, 315, 342, 421
- Same replacement pattern
- Identify which methods write vs read — add invalidation after writes

**`core/Authentication.js`** (2 call sites)
- Lines 44, 132
- Replace with `SpreadsheetCache.getSheetData(CONFIG.SHEETS.STUDENTS)` (or whatever sheet name)

**`core/ToolAccessControl.js`** (3 call sites)
- Lines 243, 273, 325
- Replace with cached version

**`core/InsightsPipeline.js`** (3 call sites)
- Lines 111, 283, 334
- Replace with cached version

### Key Consideration
Some methods in ResponseManager need the sheet object (not just data) because they write rows. For these:
- Keep `SpreadsheetCache.getSheet()` for the write operation
- But use `SpreadsheetCache.getSheetData()` for the read portion
- Call `invalidateSheetData()` after any write

### Verification
1. Load Tool 6 for a test client — should render correctly with all upstream data
2. Submit a tool response — verify it saves and appears in subsequent loads
3. Check SpreadsheetCache stats (call `SpreadsheetCache.getStats()`) — should show cache hits

---

## Phase 2: HTML Payload Reduction

### The Problem
Every page includes `shared/history-manager.html` (40,593 lines / ~40KB). Report pages and single-page tools never use history management.

### Files to Modify

**`core/FormUtils.js` → `buildStandardPage()` (~line 363)**
- Add `options.includeHistoryManager` parameter (default: `true`)
- When false, skip the history-manager include

**`core/Router.js`**
- For report page renders, pass `includeHistoryManager: false`
- Dashboard and multi-page tool forms keep the default (true)

**Optional: `shared/history-manager.html`**
- Evaluate if it can be split: lightweight stub (always included) + full implementation (on demand)
- This is optional — even just skipping it for reports is a significant win

### Verification
1. Load dashboard — history/back button navigation works
2. Navigate through a multi-page tool (e.g., Tool 3) — back button works
3. Load a report page — renders correctly, loads faster
4. Load Tool 6 (single-page) — evaluate if history manager is needed

---

## Phase 3: Logger Cleanup

### The Problem
265+ `Logger.log()` calls across production code. Tool 6 alone has 145. Each has overhead in GAS.

### Files to Create

**`shared/LogUtils.js`** (~20 lines)
```javascript
const LogUtils = {
  DEBUG: false,  // Set true when debugging

  debug(msg) {
    if (this.DEBUG) Logger.log(msg);
  },

  error(msg) {
    Logger.log('[ERROR] ' + msg);
  },

  info(msg) {
    Logger.log(msg);
  }
};
```

### Files to Modify

Across all tool and core files:
- Replace verbose debug logging (`Logger.log('Getting tool1Data...')`) with `LogUtils.debug()`
- Keep error logging as `LogUtils.error()`
- Keep important info logging as `LogUtils.info()`

**Priority files (most logs):**
- `tools/tool6/Tool6.js` — 145 calls
- `core/ResponseManager.js` — 51 calls
- `core/grounding/GroundingGPT.js` — 44 calls
- `tools/tool6/Tool6GPTAnalysis.js` — 25 calls

### Verification
1. With DEBUG=false: tools work normally, console output is minimal
2. With DEBUG=true: full logging appears (useful for troubleshooting)

---

## Phase 4: Shared Utility Extraction

### The Problem
- `formatDollars()` defined **twice** in Tool 4 (lines 2714 and 6676)
- `formatCurrency()` in Tool 6 (line 5750) — same concept, different name
- `escapeHtml()` in Tool 6 (line 6228) — generic utility stuck in tool-specific file

### Files to Create

**`shared/FormatUtils.js`** (~40 lines)
```javascript
const FormatUtils = {
  currency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    return '$' + Math.round(amount).toLocaleString();
  },

  percentage(value, decimals) {
    decimals = decimals || 0;
    return (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)) + '%';
  },

  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
```

### Files to Modify

**`tools/tool4/Tool4.js`**
- Line 2714: Replace `formatDollars` definition with `FormatUtils.currency` usage
- Line 6676: Remove duplicate `formatDollars` definition, use `FormatUtils.currency`
- **Note:** These are inside client-side `<script>` blocks in template literals — they cannot call server-side `FormatUtils`. Instead, consolidate the two definitions into one at the top of the client-side script.

**`tools/tool6/Tool6.js`**
- Line 5750: Same client-side constraint applies for `formatCurrency`
- Line 6228: Same for `escapeHtml`
- **Server-side usages** can use `FormatUtils` directly

**Important:** Client-side functions inside `<script>` tags cannot access server-side GAS globals. The shared `FormatUtils` is for server-side code. Client-side duplicates should be consolidated within each tool's script block (one definition, not two).

### Verification
1. Tool 4 guardrail messages display correct dollar amounts
2. Tool 6 projection values display correctly
3. Tool 6 scenario names escape HTML properly

---

## Phase 5: Code.js PDF Wrapper Consolidation

### The Problem
Code.js has ~10 nearly identical PDF generation wrapper functions taking ~150 lines.

### Files to Modify

**`Code.js`**
- Create one shared implementation:
```javascript
function _generatePDFForTool(clientId, toolId, generatorFn) {
  try {
    const result = generatorFn(clientId);
    if (result.success) {
      DataService.logActivity(clientId, 'pdf_downloaded', {
        toolId: toolId,
        details: 'Downloaded ' + toolId + ' PDF'
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error generating ' + toolId + ' PDF: ' + error);
    return { success: false, error: error.toString() };
  }
}
```

- Reduce each wrapper to 1 line:
```javascript
function generateTool1PDF(clientId) {
  return _generatePDFForTool(clientId, 'tool1', PDFGenerator.generateTool1PDF.bind(PDFGenerator));
}
```

**Note:** Named global functions MUST stay (GAS requires them for `google.script.run`). Only the body changes.

### Verification
1. Generate PDF for Tool 1 and Tool 6 — verify PDFs are correct
2. Check activity log — verify pdf_downloaded entries appear

---

## Phase 6: Constants Extraction

### The Problem
Only Tools 6 and 8 have dedicated Constants files. Other tools embed configuration inline.

### Files to Create

**`tools/tool2/Tool2Constants.js`** — Extract scoring categories, domain definitions, thresholds
**`tools/tool4/Tool4Constants.js`** — Extract MEFJ bucket definitions, priority thresholds, unlock rules

**Note:** Tools 1, 3, 5, 7 may not need individual constants files:
- Tool 1 has `Tool1Templates.js` (306 lines) which serves a similar purpose
- Tools 3, 5, 7 share the Grounding framework — their config lives in `core/grounding/`

### Files to Modify
- Tool 2 and Tool 4 main files: replace inline config with references to new Constants files

### Verification
1. Tool 2 scoring produces same results
2. Tool 4 allocation buckets and guardrails work identically

---

## Execution Rules

1. **Complete one phase before starting the next**
2. **Commit after each phase** with message format: `refactor(tier1): Phase X - description`
3. **Test Tool 6 after every phase** (most complex, touches most upstream data)
4. **Test Tool 4 after Phases 1, 4, 5, 6** (affected by those changes)
5. **If something breaks, revert the phase** — do not debug forward
6. **Update `SESSION-GUIDE.md`** after each phase completes

## What Tier 1 Does NOT Include

- Consolidating form-tool boilerplate into a base class (Tier 2)
- Standardizing error handling patterns (Tier 3)
- Reducing inline CSS in calculator tools (Tier 3)
- Breaking up Tool 6's 9K-line file (Tier 4)
- Breaking up Tool 4's 7K-line file (Tier 4)
- Adding missing manifest files (Tier 3)
- Modifying GPT call patterns (Tier 3+)
