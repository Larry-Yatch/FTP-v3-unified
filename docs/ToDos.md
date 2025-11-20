# Financial TruPath v3 - Active TODOs

**Last Updated:** November 11, 2025
**Status:** Post-v3.9.0 Refactoring

---

Bugs:
- Add access to the investment tool - tool 8 now
- Tool 5: last two domains have the same consequence look into that
- Turn off automatic unlocking of tools.
- I am worried that the subdomain insights are not being called or shown correctly - or maybe we do not need them for tool 3

Nov 19, 2025, 7:58:19 PM	Debug	✅ Tool registered: tool1 (Core Trauma Strategy Assessment)
Nov 19, 2025, 7:58:19 PM	Debug	✅ Tool registered: tool2 (Financial Clarity & Values Assessment)
Nov 19, 2025, 7:58:19 PM	Debug	✅ Tool registered: tool3 (Identity & Validation Grounding Tool)
Nov 19, 2025, 7:58:19 PM	Debug	✅ Tool registered: tool5 (Love & Connection Grounding Tool)
Nov 19, 2025, 7:58:19 PM	Debug	Tools registered successfully (Tool 1, Tool 2, Tool 3, Tool 5)
Nov 19, 2025, 7:58:19 PM	Info	Saving final page 7 data before processing
Nov 19, 2025, 7:58:19 PM	Info	[DraftService] Found draft for 6123LY on tool3
Nov 19, 2025, 7:58:19 PM	Info	[DraftService] Saved tool3 page 7 data for 6123LY
Nov 19, 2025, 7:58:19 PM	Info	[DraftService] Found draft for 6123LY on tool3
Nov 19, 2025, 7:58:19 PM	Debug	SpreadsheetCache MISS - Opening spreadsheet (0 hits, 1 misses)
Nov 19, 2025, 7:58:20 PM	Info	[Tool3] Skipping DRAFT save/update - already in edit mode with EDIT_DRAFT
Nov 19, 2025, 7:58:20 PM	Info	[Tool3] Processing final submission for 6123LY
Nov 19, 2025, 7:58:20 PM	Debug	SpreadsheetCache HIT (1 hits, 1 misses)
Nov 19, 2025, 7:58:21 PM	Info	[Tool3] Found active draft with status: EDIT_DRAFT
Nov 19, 2025, 7:58:21 PM	Info	[DraftService] Found draft for 6123LY on tool3
Nov 19, 2025, 7:58:21 PM	Info	[Tool3] Scoring complete: Overall=24.305555555555554
Nov 19, 2025, 7:58:21 PM	Info	⚠️ No cached insight for subdomain_1_1, will use fallback
Nov 19, 2025, 7:58:21 PM	Info	⚠️ No cached insight for subdomain_1_2, will use fallback
Nov 19, 2025, 7:58:21 PM	Info	⚠️ No cached insight for subdomain_1_3, will use fallback
Nov 19, 2025, 7:58:21 PM	Info	⚠️ No cached insight for subdomain_2_1, will use fallback
Nov 19, 2025, 7:58:21 PM	Info	⚠️ No cached insight for subdomain_2_2, will use fallback
Nov 19, 2025, 7:58:21 PM	Info	⚠️ No cached insight for subdomain_2_3, will use fallback
Nov 19, 2025, 7:58:21 PM	Info	[SYNTHESIS] Domain: 6123LY - False Self-View
Nov 19, 2025, 7:58:25 PM	Info	✅ [SYNTHESIS] Domain success: False Self-View
Nov 19, 2025, 7:58:25 PM	Info	[SYNTHESIS] Domain: 6123LY - External Validation
Nov 19, 2025, 7:58:29 PM	Info	✅ [SYNTHESIS] Domain success: External Validation
Nov 19, 2025, 7:58:29 PM	Info	[SYNTHESIS] Overall: 6123LY - tool3


Future features:
- add persistance over time and trends over time


## 🎯 Immediate Actions (This Week)

### 1. ⏳ Set Up Daily Feedback Email Trigger
**Priority:** Medium
**Effort:** 5 minutes
**Steps:**
1. Open Apps Script Editor
2. Go to Triggers (clock icon)
3. Add trigger:
   - Function: `sendDailyFeedbackSummary`
   - Event source: Time-driven
   - Type: Day timer
   - Time: 9-10am (recommended)
4. Save

**Why:** Automates feedback delivery to support@trupathmastery.com

---

### 2. ⏳ Performance Test 7.2 (Optional)
**Priority:** Low
**Effort:** 3 minutes
**Steps:**
1. Open webapp in browser
2. Press F12 (DevTools)
3. Go to Network tab
4. Navigate to dashboard
5. Check total load time (should be < 2000ms)

**Why:** Final validation test (deferred from refactoring)

---

## 🚀 Short-Term (Next 2-4 Weeks)

### 1. 🎯 Tool 3 Planning & Design
**Priority:** High
**Effort:** 2-4 hours
**Steps:**
1. Define Tool 3 scope and questions
2. Determine scoring algorithm
3. Plan adaptive logic (if any)
4. Design report layout
5. Document in `docs/Archive/Tool3/` folder

**Resources:**
- [TOOL-DEVELOPMENT-GUIDE.md](TOOL-DEVELOPMENT-GUIDE.md)
- [TOOL-DEVELOPMENT-PATTERNS.md](TOOL-DEVELOPMENT-PATTERNS.md)
- Tool1 and Tool2 as examples

---

### 2. 📊 Monitor Student Feedback (If Deployed)
**Priority:** Medium (if in production)
**Effort:** Ongoing
**Actions:**
- Check FEEDBACK sheet weekly
- Review daily email summaries
- Address critical issues promptly
- Document patterns/common issues

---

## 📋 Medium-Term (Next 1-3 Months)

### 1. 🎯 Tool 3 Implementation
**Priority:** High
**Effort:** 6-10 hours
**Follow:**
- Use shared utilities (DraftService, EditModeBanner, etc.)
- Follow TOOL-DEVELOPMENT-PATTERNS.md
- Run automated tests from `manual-tests.js`
- Test thoroughly before deployment

---

### 2. 🔄 Cross-Tool Insights Implementation
**Priority:** Medium
**Effort:** 4-6 hours
**Scope:**
- Activate InsightsPipeline.js
- Create insight mappings for Tools 1-2
- Test adaptive questions in Tool 3
- Document patterns

---

### 3. 🎨 Dashboard Enhancements
**Priority:** Low
**Effort:** 2-4 hours
**Ideas:**
- Add progress visualization
- Show completion percentages
- Display insights summary
- Add "Resume Journey" section

---

## 🎓 Long-Term (Next 3-6 Months)

### 1. 🎯 Complete Tools 4-8
**Priority:** High
**Effort:** 30-50 hours total
**Approach:**
- Design all tools first (batch planning)
- Implement one at a time
- Test each thoroughly
- Deploy incrementally

---

### 2. 🚀 Production Student Deployment
**Priority:** High (when tools ready)
**Effort:** 2-4 hours
**Prerequisites:**
- All 8 tools complete
- Comprehensive testing
- Student onboarding materials
- Support system ready

**Steps:**
1. Create production student accounts
2. Send invitation emails
3. Monitor initial usage
4. Gather feedback
5. Iterate based on feedback

---

## ✅ Recently Completed

### November 11, 2025
- ✅ v3.9.0 refactoring complete
- ✅ Merged refactor branch to main
- ✅ Feedback system implemented
- ✅ 6 critical bugs fixed
- ✅ Documentation updated
- ✅ 95% test coverage achieved

### November 2025
- ✅ Tool2 Q32/Q33 clarifications
- ✅ Feedback widget integration
- ✅ Daily email summary function
- ✅ Error handling validation

### October 2025
- ✅ Tool2 Priority × Clarity matrix
- ✅ Tool2 GPT integration
- ✅ Phase 2 refactoring (7 shared utilities)

---

## 🗑️ Archived/Resolved

### ~~Explore RESPONSES Sheet Structure~~
**Resolved:** November 2024
**Decision:** Use single RESPONSES sheet with Tool_ID column
**Rationale:**
- Simpler queries
- Easier cross-tool insights
- Better version control
- Centralized data management

---

## 📝 Notes

- Keep this file updated as priorities shift
- Archive completed items monthly
- Link to relevant documentation
- Update effort estimates based on actual time

---

**Next Review Date:** December 1, 2025
