# Performance Analysis — Feb 2026

## Summary

The application feels slow primarily due to **uncached full-sheet scans** and **large HTML payloads**. Code volume (95K lines) does not directly cause runtime slowness in GAS — the bottlenecks are I/O operations.

## Top 3 Fixes (Highest Impact)

| # | Issue | Est. Improvement | Effort |
|---|-------|-----------------|--------|
| 1 | Cache RESPONSES sheet data within a request | 50-80% fewer Sheets API calls | Medium |
| 2 | Conditionally load history-manager.html (40KB) | 40KB less per simple page | Low |
| 3 | Batch sequential getLatestResponse() calls | 80% reduction for Tool 6 render | Medium |

---

## Bottleneck #1: Full Sheet Scans on Every getLatestResponse() (CRITICAL)

**Location:** `core/ResponseManager.js:46`
```javascript
const data = sheet.getDataRange().getValues();  // Loads ENTIRE sheet
```

**Problem:** Every call to `getLatestResponse()` loads the complete RESPONSES sheet into memory. This is O(rows) per call. With 100 students x 8 tools = 800 rows scanned every time.

**How bad:** ResponseManager has **9 separate `getDataRange().getValues()` calls** (lines 46, 110, 163, 369, 442, 503, 591, 623, 679). DataService has 7 more (lines 111, 179, 218, 270, 315, 342, 421).

**Already exists but unused:** `SpreadsheetCache.getSheetData()` at line 66 caches sheet data and serves subsequent calls from cache. But `ResponseManager` calls `sheet.getDataRange().getValues()` directly instead of using it.

**Fix:** Make ResponseManager use `SpreadsheetCache.getSheetData()` instead of direct `getDataRange().getValues()`. One-line change per call site.

---

## Bottleneck #2: 67KB HTML on Every Render (CRITICAL)

**Location:** Every page includes these three shared files:
- `shared/styles.html` — 19,852 lines (always needed)
- `shared/loading-animation.html` — 8,212 lines (always needed)
- `shared/history-manager.html` — 40,593 lines (only needed for multi-page navigation)

**Problem:** Report pages, single-page tools, and simple views load 40KB of history management code they never use.

**Fix:** Add `includeHistoryManager` option to `FormUtils.buildStandardPage()`. Default true for backward compatibility. Report pages and single-page tools opt out.

---

## Bottleneck #3: Sequential getLatestResponse() in Tool 6 (HIGH)

**Location:** `tools/tool6/Tool6.js:84-89`
```javascript
const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
const tool3Data = DataService.getLatestResponse(clientId, 'tool3');
const tool4Data = DataService.getLatestResponse(clientId, 'tool4');
const tool5Data = DataService.getLatestResponse(clientId, 'tool5');
```

**Plus additional calls at:** lines 8275-8276, 8610-8611, 8758 (10+ total calls per render)

**Problem:** Each call is a full sheet scan. 5 sequential scans = O(rows) x 5. If Bottleneck #1 is fixed (caching), this is automatically resolved — one sheet read serves all 10+ calls.

---

## Bottleneck #4: 9 GPT API Calls Per Grounding Tool (HIGH)

**Location:** `core/grounding/GroundingGPT.js:5-8`
- 6 background calls during form (one per subdomain)
- 3 blocking calls at submission (2 domain + 1 overall synthesis)
- Each call: 3-5 seconds
- Retry logic adds `Utilities.sleep(2000)` on failure

**Affected tools:** 3, 5, 7 (all grounding tools)

**Problem:** 3-5 second blocking wait at submission time. Cannot be parallelized in GAS (no native promises/async).

**Fix (future Tier 3+):** Reduce synthesis calls, pre-compute more during background phase, or simplify prompts for faster response.

---

## Bottleneck #5: 26 Uncached getDataRange() Calls Across Core (MEDIUM)

**Full list of uncached calls:**

| File | Line | Sheet |
|------|------|-------|
| `ResponseManager.js` | 46, 110, 163, 369, 442, 503, 591, 623, 679 | RESPONSES |
| `DataService.js` | 111, 179, 218, 270, 315, 342, 421 | Various |
| `Authentication.js` | 44, 132 | STUDENTS |
| `ToolAccessControl.js` | 243, 273, 325 | TOOL_ACCESS |
| `InsightsPipeline.js` | 111, 283, 334 | INSIGHTS |
| `SpreadsheetCache.js` | 80 | (this IS the cache) |

**Fix:** Route all calls through `SpreadsheetCache.getSheetData()`. After writes, call `SpreadsheetCache.invalidateSheetData()`.

---

## Bottleneck #6: Excessive Logger.log() in Production (MEDIUM)

**Counts:**
- Tool6.js: 145 log calls
- ResponseManager.js: 51 log calls
- GroundingGPT.js: 44 log calls
- Tool6GPTAnalysis.js: 25 log calls
- Total across codebase: 265+

**Fix:** Create `shared/LogUtils.js` with debug/error levels. Set debug=false in production.

---

## Bottleneck #7: SpreadsheetCache.getSheetData() Exists But Is Not Used (MEDIUM)

**Location:** `core/SpreadsheetCache.js:66-83`

The caching infrastructure already exists:
- `getSheetData(sheetName)` — caches sheet data, returns from cache on subsequent calls
- `invalidateSheetData(sheetName)` — clears cache after writes
- `clearCache()` — resets everything

**Problem:** No other file in the codebase calls `getSheetData()`. Every file calls `sheet.getDataRange().getValues()` directly.

**This is the single highest-leverage fix:** Wire existing cache into existing callers. No new code needed — just change call sites.
