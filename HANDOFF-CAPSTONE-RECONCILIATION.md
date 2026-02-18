# Capstone Report Reconciliation - Handoff Document

## Current State (Branch: `claude/zealous-shtern` at commit `37a0fd0`)

### What Works
- CapstoneGPT.js is integrated and generating Financial Story + Capstone Insights
- The PDF produces Part 3 "Your Financial Story" and Part 4 "Capstone Insights" + "Your Next Steps"
- The web page has the "Generate Your Financial Story" button and enhanced tool cards
- Code has been clasp-pushed and is live in GAS

### What Is Wrong
The PDF **layout** does not match the target (PDF 11). The per-tool sections use the wrong design.

## The Core Problem

**PDF 11** (the target layout) was generated from code that was **clasp-pushed to GAS but never committed to any git branch**. When we merged `charming-davinci` + `ecstatic-gates` and clasp-pushed, we overwrote that uncommitted layout.

### PDF 14 (current - WRONG layout) vs PDF 11 (target - CORRECT layout)

| Feature | PDF 14 (current) | PDF 11 (target) |
|---------|------------------|-----------------|
| Grounding tool labels | "Strongest Areas" / "Growth Areas" | "Greatest Impact" / "Least Impact" |
| Subdomain layout | Single column list | Two-column table |
| Tool 1 layout | Single column scores | Two-column with descriptions |
| Tool 6 data | Simple (Profile: 8, Investment Score: 1/10) | Rich (Profile name, Scenario, Account Structure bars, Est. Monthly Income) |
| Tool 8 data | Simple (Test 1, Monthly Investment, Risk) | Rich (Required Nest Egg, Funding Progress bar, Contribution Capacity) |
| Tool 6 profile | Shows raw ID number | Shows name (e.g., "Roth Growth Strategist") |

## How to Fix

### Option A: Recover from GAS Version History (Recommended)
1. Open the Apps Script Editor for the project
2. Go to **File > See revision history** (or the clock icon)
3. Find the revision from **before** the latest clasp push (before Feb 18 ~3:00 AM)
4. Look at `PDFGenerator.js` in that revision
5. Copy the per-tool section builders (`_buildTool1Section`, `_buildGroundingSection`, `_buildTool6Section`, `_buildTool8Section`, etc.)
6. Compare with current `shared/PDFGenerator.js` and apply the layout differences

### Option B: Recreate from PDF 11
If GAS history is not available, recreate the layout by examining PDF 11:
- Change "Strongest Areas" / "Growth Areas" to "Greatest Impact" / "Least Impact"
- Convert subdomain displays to two-column tables
- Add profile name lookup to Tool 6 section (the lookup map is already in CollectiveResults.js `_renderTool6Card`)
- Add scenario data enrichment to Tool 6/8 sections (fetch from TOOL6_SCENARIOS / TOOL8_SCENARIOS sheets)
- Add funding progress calculation to Tool 8 section

## Also Broken: Progress Over Time Button

The menu page (Router.js line 760-762) shows the Progress Over Time button as a small side-by-side element. The correct layout (which was also never committed) shows:
- Full-width "View Collective Results" button
- "TRACK CHANGES" divider line
- Full-width "Progress Over Time" button (same gold styling as Collective Results)

This is in `core/Router.js` around line 760. Change the flex layout to stacked.

## Branch/File Map

```
claude/zealous-shtern (current working branch)
  37a0fd0 - feat: Integrate CapstoneGPT narratives (OUR WORK)
  8755709 - fix: Unicode block character bars (from charming-davinci)
  ...back to main at 2f21efa

Key files:
  shared/PDFGenerator.js    - Per-tool sections need layout update
  core/Router.js            - Progress Over Time button needs layout fix
  core/CapstoneGPT.js       - NEW - working, do not modify
  core/CollectiveResults.js - Enhanced cards + GPT button, working
  Code.js                   - generateCapstoneGPT() function, working
  Config.js                 - CAPSTONE_GPT_CACHE sheet name, working
```

## Reference PDFs
- `/Users/Larry/Downloads/TruPath_CapstoneReport_Larry_Yatch_2026-02-18 (11).pdf` - TARGET layout
- `/Users/Larry/Downloads/TruPath_CapstoneReport_Larry_Yatch_2026-02-18 (14).pdf` - Current output (wrong layout, but has CapstoneGPT content)
