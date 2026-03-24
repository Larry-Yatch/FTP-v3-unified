# Deployment Information - Financial TruPath v3

**Last Updated:** 2025-11-29
**Branch:** feature/grounding-tools
**Phase:** Tool 4 Phase 2 Complete - Pre-Survey UI

---

## Active Deployment

**Deployment URL (Auto-updating @HEAD):**
```
https://script.google.com/macros/s/AKfycbxLCd4P9XY20NpAhwg7zucFE_BgwTnhjRqYRTgQ1QY/exec
```

**Deployment ID:** `AKfycbxLCd4P9XY20NpAhwg7zucFE_BgwTnhjRqYRTgQ1QY`

**Type:** @HEAD (Auto-updates with every `clasp push`)

**Note:** There are 21 versioned deployments (like @267), but @HEAD is the one that stays current.

---

## Latest Features

### Tool 4: Financial Freedom Framework

**Phase 1: V1 Engine Integration** ✅
- V1 allocation engine with 3-tier modifiers
- 8 integration functions for Tool 1/2/3 data mapping
- Comprehensive test suite (Phase1ValidationSuite.js)

**Phase 2: Pre-Survey UI** ✅
- Trauma-informed 8-question pre-survey
- Real-time progress tracking
- Interactive sliders with live feedback
- Loading overlay with allocation calculation
- PropertiesService data persistence
- Auto-reload to calculator after submission

**Testing:**
- Phase 1 tests: `runPhase1ValidationSuite()` - 5/5 passing
- Phase 2 tests: `runPhase2Tests()` - 3/3 passing

---

## Recent Commits (Pushed to GitHub)

```
16dbe9c - test(tool4): Add Phase 2 test suite for pre-survey validation
e32f8ab - feat(tool4): Phase 2 - Complete pre-survey UI implementation
ed47e84 - test(tool4): Add Phase 1 validation suite for Apps Script testing
bd055dc - fix(tool4): Add missing Phase 1 integration functions to production code
7628aae - feat(tool4): Complete Phase 1 - V1 Engine Integration Layer
```

**GitHub:** https://github.com/Larry-Yatch/FTP-v3-unified/tree/feature/grounding-tools

---

## How to Access

### For Testing Tool 4 Pre-Survey:

1. **Open the deployment URL** (above)
2. **Login** with your Google account
3. **Navigate to:** TruPath Menu → Tool 4: Financial Freedom Framework
4. **First visit:** You'll see the pre-survey form
5. **Fill out 8 required questions**
6. **Submit** and watch the loading overlay
7. **Second visit:** Calculator loads with V1 allocations calculated

### For Running Tests:

**In Apps Script Editor:**
1. Open: https://script.google.com/home
2. Find project: "Financial-TruPath-v3"
3. Navigate to: tests/Tool4Tests.js
4. Run: `runPhase2Tests`
5. View Execution Log for results

---

## Deployment Commands

### Push Latest Code
```bash
clasp push
```

### List Deployments
```bash
clasp deployments
```

### Create New Deployment (if needed)
```bash
clasp deploy --description "Your description"
```

**Note:** Currently at 21/20 deployments. Must undeploy old versions before creating new ones.

---

## File Structure

**Core Files:**
- `tools/tool4/Tool4.js` - Main Tool 4 implementation
  - Lines 27-57: Render flow (pre-survey check)
  - Lines 121-804: Pre-survey UI
  - Lines 1521-1741: V1 allocation engine
  - Lines 1751-1937: Integration functions

**Test Files:**
- `tests/Tool4Tests.js` - All Tool 4 tests
- `tests/Phase1ValidationSuite.js` - Phase 1 validation

**Documentation:**
- `docs/Tool4/TOOL4-REDESIGN-SPECIFICATION.md` - Complete spec
- `docs/Tool4/PHASE1-COMPLETE.md` - Phase 1 summary
- `docs/Tool4/PHASE2-COMPLETE.md` - Phase 2 summary
- `docs/Tool4/PHASE2-TESTING-GUIDE.md` - Testing instructions

---

## Current Status

**Production Ready:**
- ✅ Tool 1: Financial Trauma Assessment
- ✅ Tool 2: Financial Clarity Grounding
- ✅ Tool 3: Reconnection Assessment
- ✅ Tool 4: Financial Freedom Framework (Phase 1 & 2)
- ✅ Tool 5: Reconnection Synthesis

**In Progress:**
- ⏳ Tool 4 Phase 3: Calculator integration with V1 allocations

---

## Next Deployment

**Phase 3 Features:**
- Display V1 allocations in calculator
- Pre-fill sliders with calculated percentages
- Add insights sidebar ("Why these numbers?")
- Implement slider adjustments with lock feature
- Add scenario comparison

**Expected:** Week 5

---

**Maintained By:** Claude Code & Larry Yatch
**Project:** Financial TruPath v3
**Repository:** https://github.com/Larry-Yatch/FTP-v3-unified
