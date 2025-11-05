# Tool 2 Implementation Tracker

**Tool:** Financial Clarity & Values Assessment
**Total Questions:** 57 across 5 pages
**Strategy:** Small, testable incremental steps
**Started:** November 5, 2025

---

## 📊 Overall Progress

- **Phase 2a:** Page 1 (13 questions) - ✅ **COMPLETE**
- **Phase 2b:** Pages 2-5 (44 questions) - 🚧 **IN PROGRESS**
- **Phase 2c:** Scoring Logic - ⏳ **NOT STARTED**
- **Phase 2d:** Report Generation - ⏳ **NOT STARTED**
- **Phase 2e:** GPT Integration - ⏳ **NOT STARTED**

---

## ✅ Phase 2a: Page 1 - Demographics & Mindset (COMPLETE)

**Status:** ✅ **COMPLETE**
**Commit:** `bd8653a` - Fix Tool 1 pre-fill data access + swap Q8/Q9
**Date Completed:** November 4, 2025

### Implemented:
- ✅ Q1-Q3: Identity fields (pre-filled from Tool 1)
- ✅ Q4-Q7: Life stage context
- ✅ Q8-Q10: Employment & income context (with conditional business stage)
- ✅ Q11-Q13: Mindset baseline (scarcity & money relationship)
- ✅ Conditional logic for business stage
- ✅ Edit mode support
- ✅ Draft auto-save

### Test Results:
- ✅ Page 1 loads correctly
- ✅ Tool 1 data pre-fills name/email
- ✅ Conditional business stage shows/hides correctly
- ✅ Draft saves and resumes correctly
- ✅ Navigate to Page 2 works

---

## 🚧 Phase 2b: Pages 2-5 Implementation

### **Step 1: Page 2 - Income Section Only** ✅ **COMPLETE**

**Estimated Time:** 30 minutes
**Status:** ✅ **COMPLETE**
**Completed:** November 5, 2025
**Commit:** `fdb844c` - feat: Implement Tool 2 Page 2 Income Section (Q14-Q18)

#### Tasks:
- [x] Add Q14: Income clarity level (-5 to +5)
- [x] Add Q15: Income sufficiency (-5 to +5)
- [x] Add Q16: Income consistency (-5 to +5)
- [x] Add Q17: Income stress level (-5 to +5)
- [x] Add Q18: List income sources (paragraph text)

#### Test Checklist:
- [x] Navigate from Page 1 → Page 2
- [x] All 5 questions render correctly
- [x] Draft saves Page 2 data to PropertiesService
- [x] Back button loads saved data
- [x] Navigate Page 2 → Page 3
- [x] Edit mode loads Page 2 correctly

#### Deployment:
- [x] Commit code
- [x] Push with `clasp push`
- [x] Test in production
- [x] Document any issues

**Testing Notes:** All tests passed successfully. No issues found.

---

### **Step 2: Page 2 - Add Spending Section** ✅ **COMPLETE**

**Estimated Time:** 30 minutes
**Status:** ✅ **COMPLETE**
**Completed:** November 5, 2025
**Commit:** `8da0f59` - feat: Complete Tool 2 Page 2 with Spending Section (Q19-Q24)

#### Tasks:
- [x] Add Q19: Spending clarity level (-5 to +5)
- [x] Add Q20: Spending consistency (-5 to +5)
- [x] Add Q21: Spending review detail (-5 to +5)
- [x] Add Q22: Spending stress level (-5 to +5)
- [x] Add Q23: Major expense categories (paragraph text)
- [x] Add Q24: Wasteful spending (paragraph text)

#### Test Checklist:
- [x] All 11 questions on Page 2 save correctly
- [x] Draft persists both income and spending sections
- [x] Can navigate back from Page 3 and see all data
- [x] Edit mode loads full Page 2 correctly

#### Deployment:
- [x] Commit code
- [x] Push with `clasp push`
- [x] Test in production
- [x] Document any issues

**Testing Notes:** All tests passed successfully. No issues found.

---

### **Step 3: Page 3 - Debt Section Only** ✅ **COMPLETE**

**Estimated Time:** 30 minutes
**Status:** ✅ **COMPLETE**
**Completed:** November 5, 2025
**Commit:** `61bd407` - feat: Implement Tool 2 Page 3 Debt Section (Q25-Q29)

#### Tasks:
- [x] Add Q25: Debt clarity level (-5 to +5)
- [x] Add Q26: Debt trending direction (-5 to +5)
- [x] Add Q27: Debt review frequency (-5 to +5)
- [x] Add Q28: Debt stress level (-5 to +5)
- [x] Add Q29: List current debts (paragraph text)

#### Test Checklist:
- [ ] Navigate Page 2 → Page 3
- [ ] All 5 debt questions render
- [ ] Draft saves correctly
- [ ] Can go back to Page 2 and forward again
- [ ] All previous page data persists

#### Deployment:
- [x] Commit code
- [x] Push with `clasp push`
- [ ] Test in production
- [ ] Document any issues

---

### **Step 4: Page 3 - Add Emergency Fund Section** ⏳ **NOT STARTED**

**Estimated Time:** 30 minutes
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add Q30: Emergency fund maintenance (-5 to +5)
- [ ] Add Q31: Months of expenses covered (-5 to +5)
- [ ] Add Q32: Frequency of tapping fund (-5 to +5)
- [ ] Add Q33: Replenishment speed (-5 to +5)
- [ ] Add Q34: Emergency preparedness stress (-5 to +5)

#### Test Checklist:
- [ ] All 11 Page 3 questions save correctly
- [ ] Navigate Page 3 → Page 4
- [ ] Draft persists all Page 3 data
- [ ] Edit mode loads Page 3 correctly

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test in production
- [ ] Document any issues

---

### **Step 5: Page 4 - Savings Section Only** ⏳ **NOT STARTED**

**Estimated Time:** 20 minutes
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add Q35: Savings level beyond emergency fund (-5 to +5)
- [ ] Add Q36: Savings contribution regularity (-5 to +5)
- [ ] Add Q37: Savings clarity (-5 to +5)
- [ ] Add Q38: Savings stress level (-5 to +5)

#### Test Checklist:
- [ ] Navigate to Page 4
- [ ] All 4 savings questions render
- [ ] Draft saves Page 4 data
- [ ] Can navigate back to Page 3

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test in production
- [ ] Document any issues

---

### **Step 6: Page 4 - Add Investments Section** ⏳ **NOT STARTED**

**Estimated Time:** 30 minutes
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add Q39: Investment activity (-5 to +5)
- [ ] Add Q40: Investment clarity (-5 to +5)
- [ ] Add Q41: Investment confidence (-5 to +5)
- [ ] Add Q42: Investment stress level (-5 to +5)
- [ ] Add Q43: List investment types (paragraph text)

#### Test Checklist:
- [ ] All 9 questions on Page 4 render (savings + investments)
- [ ] Draft saves correctly
- [ ] Free-text investment list saves
- [ ] Navigate forward to Page 5

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test in production
- [ ] Document any issues

---

### **Step 7: Page 4 - Add Retirement Section** ⏳ **NOT STARTED**

**Estimated Time:** 30 minutes
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add Q44: Retirement accounts maintenance (-5 to +5)
- [ ] Add Q45: Retirement funding regularity (-5 to +5)
- [ ] Add Q46: Retirement confidence (-5 to +5)
- [ ] Add Q47: Retirement preparedness stress (-5 to +5)

#### Test Checklist:
- [ ] All 13 Page 4 questions work correctly
- [ ] Draft saves all three sections (savings, investments, retirement)
- [ ] Navigate Page 4 → Page 5
- [ ] Can navigate back and data persists

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test in production
- [ ] Document any issues

---

### **Step 8: Page 5 - Base Questions (No Adaptive Yet)** ⏳ **NOT STARTED**

**Estimated Time:** 30 minutes
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add Q48: Insurance policies maintained (-5 to +5)
- [ ] Add Q49: Insurance coverage clarity (-5 to +5)
- [ ] Add Q50: Insurance confidence (-5 to +5)
- [ ] Add Q51: Insurance stress level (-5 to +5)
- [ ] Add Q52: Emotions about reviewing finances (paragraph text)
- [ ] Add Q53: Primary obstacle to financial clarity (dropdown)
- [ ] Add Q54: Confidence in achieving goals (-5 to +5)

#### Test Checklist:
- [ ] Page 5 loads
- [ ] All 7 base questions render
- [ ] Draft saves Page 5 data
- [ ] Can navigate back to Page 4
- [ ] Can submit (will test after scoring logic added)

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test in production
- [ ] Document any issues

---

### **Step 9: Page 5 - Add Adaptive Trauma Questions** ⏳ **NOT STARTED**

**Estimated Time:** 1 hour
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Query Tool 1 trauma scores for client
- [ ] Identify top 1 trauma category (highest absolute value)
- [ ] Implement conditional rendering for Q55-Q56:
  - [ ] If FSV: Q55a (hiding) + Q56a (impact of hiding)
  - [ ] If Control: Q55b (control anxiety) + Q56b (impact)
  - [ ] If ExVal: Q55c (external influence) + Q56c (impact)
  - [ ] If Fear: Q55d (paralysis) + Q56d (impact)
  - [ ] If Receiving: Q55e (discomfort receiving) + Q56e (impact)
  - [ ] If Showing: Q55f (over-serving) + Q56f (impact)
- [ ] Store which adaptive questions were shown

#### Test Checklist:
- [ ] Correct trauma questions show based on Tool 1 data
- [ ] All 11 questions on Page 5 work (7 base + 2 adaptive + 2 review)
- [ ] Draft saves adaptive question responses
- [ ] Can complete all 5 pages end-to-end
- [ ] Different trauma types show different questions

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test with different Tool 1 trauma profiles
- [ ] Document any issues

---

## ⏳ Phase 2c: Scoring Logic (NOT STARTED)

### **Step 10: Implement Basic Scoring** ⏳ **NOT STARTED**

**Estimated Time:** 1 hour
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add `calculateDomainScores()` method
  - [ ] Money Flow: Sum Q14-Q24 scales (exclude free-text)
  - [ ] Obligations: Sum Q25-Q34 scales
  - [ ] Liquidity: Sum Q35-Q38 scales
  - [ ] Growth: Sum Q39-Q47 scales (exclude free-text)
  - [ ] Protection: Sum Q48-Q51 scales
- [ ] Add `applyBenchmarks()` method
  - [ ] High: 60% or above
  - [ ] Medium: 20-59%
  - [ ] Low: Below 20%
- [ ] Add `applyStressWeights()` method
  - [ ] Money Flow: weight 5
  - [ ] Obligations: weight 4
  - [ ] Liquidity: weight 2
  - [ ] Growth: weight 1
  - [ ] Protection: weight 1
- [ ] Add `sortByPriority()` method
- [ ] Add `determineArchetype()` method (simple domain-based)
- [ ] Add `processFinalSubmission()` method
- [ ] Save scores to RESPONSES sheet via DataService

#### Test Checklist:
- [ ] Final submission works
- [ ] All 5 domain scores calculated correctly
- [ ] Benchmarks applied correctly (High/Med/Low)
- [ ] Stress weights applied correctly
- [ ] Priorities sorted correctly
- [ ] Archetype determined correctly
- [ ] Data saved to RESPONSES sheet with Is_Latest = true
- [ ] DRAFT deleted after submission
- [ ] EDIT_DRAFT deleted after edit submission
- [ ] Dashboard shows Tool 2 as completed

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test fresh submission
- [ ] Test edit mode submission
- [ ] Check RESPONSES sheet for correct data
- [ ] Document any issues

---

## ⏳ Phase 2d: Report Generation (NOT STARTED)

### **Step 11: Create Basic Report Structure** ⏳ **NOT STARTED**

**Estimated Time:** 1 hour
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Copy `tools/tool1/Tool1Report.js` → `tools/tool2/Tool2Report.js`
- [ ] Update tool name and branding
- [ ] Show raw domain scores (no insights yet)
- [ ] Add progress bars for 5 domains
- [ ] Add High/Med/Low labels
- [ ] Add "View Report" button to dashboard
- [ ] Update Router.js to handle tool2-report route

#### Test Checklist:
- [ ] Report displays after submission
- [ ] Dashboard shows "View Report" button
- [ ] Clicking button loads report
- [ ] Report shows all 5 domain scores
- [ ] Progress bars display correctly
- [ ] High/Med/Low labels are correct
- [ ] Report is branded correctly

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test report display
- [ ] Document any issues

---

### **Step 12: Add Report Details** ⏳ **NOT STARTED**

**Estimated Time:** 1 hour
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add domain breakdown section
- [ ] Add priority tiers (High/Med/Low focus areas)
- [ ] Add growth archetype display
- [ ] Add archetype description
- [ ] Add recommended next steps section
- [ ] Add scarcity quotient display (avg of Q11-Q12)
- [ ] Add money relationship indicator (Q13)
- [ ] Style report for readability

#### Test Checklist:
- [ ] Report shows all sections
- [ ] Domain breakdowns are accurate
- [ ] Priority tiers are correct
- [ ] Growth archetype displays correctly
- [ ] Recommended next steps are relevant
- [ ] Scarcity quotient calculated correctly
- [ ] Money relationship shows correctly
- [ ] Report is visually appealing

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test full report
- [ ] Document any issues

---

### **Step 13: Test Edit Mode End-to-End** ⏳ **NOT STARTED**

**Estimated Time:** 30 minutes
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Test editing from dashboard "Edit Answers" button
- [ ] Verify all 5 pages load in edit mode with saved data
- [ ] Verify edit mode banner shows on all pages
- [ ] Verify "Cancel Edit" button works
- [ ] Verify edit submission updates correctly
- [ ] Verify no duplicate EDIT_DRAFTs created
- [ ] Verify EDIT_DRAFT deleted after submission
- [ ] Verify Is_Latest flags correct

#### Test Checklist:
- [ ] Can click "Edit Answers" from dashboard
- [ ] Page 1 loads with all saved data
- [ ] Page 2 loads with all saved data
- [ ] Page 3 loads with all saved data
- [ ] Page 4 loads with all saved data
- [ ] Page 5 loads with all saved data
- [ ] Edit mode banner shows on all pages
- [ ] Can cancel edit (returns to dashboard)
- [ ] EDIT_DRAFT deleted on cancel
- [ ] Can submit edited response
- [ ] New COMPLETED row created with Is_Latest = true
- [ ] Old COMPLETED row marked Is_Latest = false
- [ ] EDIT_DRAFT deleted after submission
- [ ] Updated report displays
- [ ] No orphaned EDIT_DRAFTs in sheet

#### Deployment:
- [ ] Test thoroughly in production
- [ ] Run cleanup script if needed
- [ ] Document any issues

---

## ⏳ Phase 2e: GPT Integration (NOT STARTED)

### **Step 14: Add GPT Analysis** ⏳ **NOT STARTED**

**Estimated Time:** 1 hour
**Status:** ⏳ **NOT STARTED**

#### Tasks:
- [ ] Add OpenAI API integration (if not already in core)
- [ ] Implement GPT analysis for 8 free-text responses:
  - [ ] Q18: Income sources analysis
  - [ ] Q23: Major expenses analysis
  - [ ] Q24: Wasteful spending analysis
  - [ ] Q29: Debt list analysis
  - [ ] Q43: Investment types analysis
  - [ ] Q52: Emotions about finances analysis
  - [ ] Q56a-f: Trauma impact analysis (whichever shown)
- [ ] Add personalized insights to report
- [ ] Cache GPT results to avoid re-processing

#### Test Checklist:
- [ ] GPT insights generate correctly
- [ ] All 8 free-text responses analyzed
- [ ] Insights are relevant and personalized
- [ ] Report shows GPT-generated content
- [ ] GPT calls don't slow report too much (<10 seconds)
- [ ] GPT errors handled gracefully
- [ ] Cost per report is reasonable ($0.01-0.05)

#### Deployment:
- [ ] Commit code
- [ ] Push with `clasp push`
- [ ] Test with various responses
- [ ] Monitor API costs
- [ ] Document any issues

---

## 🐛 Bug Tracking

### Active Bugs:
*None currently*

### Fixed Bugs:
*Will be added as we encounter and fix them*

---

## 📝 Notes & Learnings

### Design Decisions:
- Using -5 to +5 scale (no zero) for consistency with Tool 1
- Pre-filling Q1-Q3 from Tool 1 data
- Conditional Q10 (business stage) based on Q8 selection
- Adaptive Q55-Q56 based on Tool 1 top trauma score
- Stress weights: Money Flow (5), Obligations (4), Liquidity (2), Growth (1), Protection (1)

### Patterns to Follow:
- Always use `FormUtils.buildStandardPage()` for page rendering
- Always use `DataService.saveToolResponse()` for saving (handles Is_Latest)
- Save final page data BEFORE calling `processFinalSubmission()`
- Delete EDIT_DRAFT on submission (not just mark as not latest)
- Check for null in all async handlers
- Navigate immediately (not in callbacks) to preserve user gesture

### Patterns to Avoid:
- Don't call `loadResponseForEditing()` multiple times
- Don't manually append to sheets (use DataService)
- Don't forget to save final page data before processing
- Don't leave EDIT_DRAFTs in RESPONSES sheet
- Don't navigate in async callbacks

---

## 🎯 Next Session Checklist

Before starting next session:
1. [ ] Read this tracker document
2. [ ] Check last deployment version
3. [ ] Review any bugs in tracking section
4. [ ] Identify next incomplete step
5. [ ] Start implementation!

---

**Last Updated:** November 5, 2025
**Current Step:** Step 4 - Page 3 Emergency Fund Section
**Next Action:** Implement Q30-Q34 for Page 3
