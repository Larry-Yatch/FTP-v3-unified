# Codebase Audit — Feb 2026

## Scale Summary

- **~53,500 lines** of application JavaScript (excluding tests, docs, legacy)
- **~95,000 lines** total including tests, HTML templates, legacy/archive
- **8 tools** in a plugin-based GAS (Google Apps Script) architecture
- **36 MB** total project size

## Line Counts — Tool Files

| File | Lines | Type |
|------|-------|------|
| `tools/tool6/Tool6.js` | 9,086 | Calculator |
| `tools/tool4/Tool4.js` | 7,224 | Calculator |
| `tools/tool8/Tool8.js` | 2,594 | Calculator |
| `tools/tool2/Tool2.js` | 1,915 | Form |
| `tools/tool3/Tool3.js` | 986 | Form (Grounding) |
| `tools/tool5/Tool5.js` | 986 | Form (Grounding) |
| `tools/tool7/Tool7.js` | 985 | Form (Grounding) |
| `tools/tool1/Tool1.js` | 700 | Form |

### Supporting Files Per Tool

| Tool | Report | GPT Analysis | Fallbacks | Constants | Tests |
|------|--------|-------------|-----------|-----------|-------|
| 1 | 581 | — | — | — (Templates: 306) | — |
| 2 | 1,156 | 805 | 412 | — | — |
| 3 | 189 | (shared Grounding) | (shared) | — | 559 |
| 4 | — (uses PDFGenerator) | 826 | 336 | — | 1,789 |
| 5 | 179 | (shared Grounding) | (shared) | — | 342 |
| 6 | 2,427 | 1,135 | 579 | 1,758 | 2,609 |
| 7 | 179 | (shared Grounding) | (shared) | — | — |
| 8 | 1,155 | 567 | 302 | 376 | 1,280 |

## Line Counts — Core Framework

| File | Lines | Purpose |
|------|-------|---------|
| `core/Router.js` | 1,919 | Page routing, dashboard card building |
| `Code.js` | 1,598 | Entry point, tool registration, 60 wrapper functions |
| `core/AdminRouter.js` | 1,356 | Admin panel routing |
| `core/ResponseManager.js` | 719 | Response lifecycle (9 `getDataRange()` calls!) |
| `core/DataService.js` | 584 | Data persistence and retrieval |
| `core/FormUtils.js` | 436 | Form building (used by Tools 1,2,3,5,7 only) |
| `core/InsightsPipeline.js` | 417 | GPT insights generation |
| `core/ToolAccessControl.js` | 349 | Permission system |
| `core/Authentication.js` | 280 | User authentication |
| `core/ToolRegistry.js` | 240 | Tool discovery |
| `core/FrameworkCore.js` | 239 | Core framework functions |
| `core/ToolInterface.js` | 160 | Tool interface contract |
| `core/SpreadsheetCache.js` | 117 | Caching layer (has unused `getSheetData()`) |

### Grounding Subsystem (used by Tools 3, 5, 7)

| File | Lines |
|------|-------|
| `core/grounding/GroundingGPT.js` | 928 |
| `core/grounding/GroundingReport.js` | 817 |
| `core/grounding/GroundingFormBuilder.js` | 707 |
| `core/grounding/GroundingFallbacks.js` | 675 |
| `core/grounding/GroundingScoring.js` | 357 |

## Line Counts — Shared

| File | Lines | Purpose |
|------|-------|---------|
| `shared/history-manager.html` | 40,593 | Back button / history management |
| `shared/styles.html` | 19,852 | Global CSS |
| `shared/loading-animation.html` | 8,212 | Loading UI |
| `shared/PDFGenerator.js` | 1,461 | PDF export |
| `shared/Validator.js` | 314 | Data validation |
| `shared/FeedbackWidget.js` | 296 | User feedback |
| `shared/ErrorHandler.js` | 260 | Error handling |
| `shared/NavigationHelpers.js` | 239 | Navigation utilities |
| `shared/DraftService.js` | 164 | Draft persistence |
| `shared/ReportBase.js` | 126 | Report base class |
| `shared/EditModeBanner.js` | 85 | Edit mode UI |

## Two Architecture Pattern

The codebase has two distinct tool architectures:

**Form-based tools (1, 2, 3, 5, 7)** — Multi-page surveys
- Use `FormUtils.buildStandardPage()` and `FormUtils.getFormSubmissionScript()`
- Follow `render()` → `renderPageContent()` → `processFinalSubmission()` lifecycle
- Support edit mode via `DraftService`
- Average ~1,100 lines per tool
- Rely on `shared/styles.html` for CSS

**Calculator tools (4, 6, 8)** — Single-page interactive tools
- Custom HTML generation, custom state management
- Custom `google.script.run` calls (Tool 4: 10, Tool 6: 19, Tool 8: 5)
- Heavy inline CSS (Tool 4: ~58 inline styles, Tool 6: ~200+)
- Pull data from multiple upstream tools
- Average ~6,300 lines per tool

## Constants & Manifest Coverage

| Tool | Has Constants File | Has Manifest |
|------|-------------------|-------------|
| 1 | No | Yes (495B) |
| 2 | No | No |
| 3 | No | No |
| 4 | No | Yes (822B) |
| 5 | No | No |
| 6 | Yes (1,758 lines) | Yes (2,250B) |
| 7 | No | Yes (593B) |
| 8 | Yes (376 lines) | Yes (1,567B) |

## Legacy Code

`/apps/` directory contains ~11K lines of pre-v3 standalone GAS scripts. Reference only — not deployed.
