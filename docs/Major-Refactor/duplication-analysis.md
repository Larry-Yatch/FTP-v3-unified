# Duplication Analysis — Feb 2026

## Summary

The 5 form-based tools (1, 2, 3, 5, 7) share ~95% identical boilerplate in 4 key methods. The 3 calculator tools (4, 6, 8) have scattered helper function duplication. Code.js has ~150 lines of repetitive PDF wrapper functions. Total saveable: ~800+ lines.

---

## Duplicated Methods in Form Tools

### render() — ~40 lines x 5 tools = 200 lines duplicated

**Locations:**
| Tool | File | Lines |
|------|------|-------|
| 1 | `tools/tool1/Tool1.js` | 14-62 |
| 2 | `tools/tool2/Tool2.js` | 20-65 |
| 3 | `tools/tool3/Tool3.js` | 449-515 |
| 5 | `tools/tool5/Tool5.js` | 449-515 |
| 7 | `tools/tool7/Tool7.js` | 448-514 |

**Pattern (95% identical):**
- Parse clientId, page, editMode, clearDraft from params
- Handle editMode on page 1 (load draft)
- Get existing data
- Render page content
- Return `HtmlService.createHtmlOutput(FormUtils.buildStandardPage(...))`

**Only difference:** tool ID string and tool-specific page count

### getExistingData() — ~30 lines x 5 tools = 150 lines duplicated

**Locations:**
| Tool | File | Line |
|------|------|------|
| 1 | `tools/tool1/Tool1.js` | 477 |
| 2 | `tools/tool2/Tool2.js` | 1526 |
| 3 | `tools/tool3/Tool3.js` | 667 |
| 5 | `tools/tool5/Tool5.js` | 667 |
| 7 | `tools/tool7/Tool7.js` | 666 |

**Pattern:** Check DraftService for active draft → if exists return with `_editMode: true` → else get latest response → fallback to empty object

### processFinalSubmission() — ~50 lines x 5 tools = 250 lines duplicated

**Locations:**
| Tool | File | Line |
|------|------|------|
| 1 | `tools/tool1/Tool1.js` | 518 |
| 2 | `tools/tool2/Tool2.js` | 1581 |
| 3 | `tools/tool3/Tool3.js` | 706 |
| 5 | `tools/tool5/Tool5.js` | 706 |
| 7 | `tools/tool7/Tool7.js` | 705 |

**Pattern:** Get existing data → check isEditMode → call tool-specific processResults() → save via DataService → return success/error

### EditMode Banner — ~10 lines x 5 tools = 50 lines duplicated

All 5 form tools have identical editMode banner logic in `renderPageContent()`. Already uses `EditModeBanner.render()` but the surrounding check logic is duplicated.

---

## Helper Function Duplication

### formatDollars() — Defined TWICE in Tool 4

| Location | Line | Context |
|----------|------|---------|
| `tools/tool4/Tool4.js` | 2714 | Inside client-side validation function |
| `tools/tool4/Tool4.js` | 6676 | Inside server-side guardrails function |

Both convert a percentage to dollar format. Same logic, different scopes (client vs server).

### formatCurrency() — Tool 6 only

| Location | Line |
|----------|------|
| `tools/tool6/Tool6.js` | 5750 |

Client-side function, used 14 times in projection display code.

### escapeHtml() — Tool 6 only

| Location | Line |
|----------|------|
| `tools/tool6/Tool6.js` | 6228 |

Used 8 times in scenario management code. Should be shared utility.

---

## Code.js PDF Wrapper Duplication

**~150 lines of near-identical try/catch/log/return patterns**

Code.js has individual PDF generation functions for each tool. Each follows:
```
function generateToolXPDF(clientId) {
  try {
    const result = PDFGenerator.generateToolXPDF(clientId);
    if (result.success) {
      DataService.logActivity(clientId, 'pdf_downloaded', {...});
    }
    return result;
  } catch(error) {
    Logger.log('Error generating Tool X PDF: ' + error);
    return { success: false, error: error.toString() };
  }
}
```

**Note:** GAS requires named global functions for `google.script.run` — cannot replace these with a single generic function. But can make each a 1-line wrapper calling a shared implementation.

---

## Inconsistency Matrix

| Pattern | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 |
|---------|----|----|----|----|----|----|----|----|
| Multi-page FormUtils | Y | Y | Y | N | Y | N | Y | N |
| Shared styles.html | Y | Y | Y | partial | Y | partial | Y | partial |
| Edit mode support | Y | Y | Y | N | Y | N | Y | N |
| Error → return object | Y | Y | Y | N | Y | N | Y | N |
| Error → renderError() | N | N | N | Y | N | Y | N | Y |
| Constants file | N | N | N | N | N | Y | N | Y |
| Manifest file | Y | N | N | Y | N | Y | Y | Y |
| google.script.run calls | FormUtils | FormUtils | FormUtils | 10 custom | FormUtils | 19 custom | FormUtils | 5 custom |

**Key insight:** Tools split cleanly into two groups. Form tools (1,2,3,5,7) are highly standardized. Calculator tools (4,6,8) are each unique.

---

## Consolidation Opportunities Summary

| Opportunity | Lines Saved | Risk | Tier |
|------------|-------------|------|------|
| Form tool render() base class | ~200 | Low | 2 |
| Form tool getExistingData() | ~150 | Low | 2 |
| Form tool processFinalSubmission() | ~250 | Low | 2 |
| Code.js PDF wrappers | ~120 | Zero | 1 |
| formatDollars duplicate in Tool 4 | ~20 | Zero | 1 |
| Shared FormatUtils (currency, escapeHtml) | ~30 | Zero | 1 |
| Report template standardization (Tools 3,5,7) | ~400 | Medium | 3 |
| **Total** | **~1,170** | | |
