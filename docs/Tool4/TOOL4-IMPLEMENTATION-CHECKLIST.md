# Tool 4: Implementation Checklist

**Version:** 3.0 (Progressive Unlock Model)
**Date:** November 17, 2025
**Status:** Ready for Development
**Reference:** See TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md for complete specifications

---

## 🎯 **Overview**

This checklist provides a quick reference for implementing Tool 4's progressive unlock model with hybrid allocation UX.

**Total Phases:** 5
**Estimated Timeline:** 6-8 weeks

---

## **Phase 1: Core Algorithm & Data Structures** ⏱️ 2 weeks

### **1.1 Priority System**
- [ ] Define base weights for all 10 priorities (M/E/F/J percentages)
- [ ] Implement Top 2 ranking with 70%/30% weighting calculation
- [ ] Create priority configuration object (weights + metadata)
- [ ] Test weighted average calculation

### **1.2 Surplus Calculation**
- [ ] Implement surplus formula: `income - essentials`
- [ ] Add validation (surplus can't be negative)
- [ ] Calculate as percentage of income for analytics
- [ ] Test with edge cases (zero income, zero essentials)

### **1.3 Progressive Unlock Logic**
- [ ] Implement unlock requirements for all 10 priorities
  - [ ] Surplus thresholds
  - [ ] Emergency fund requirements
  - [ ] Debt limits
  - [ ] Other factors (income stability, business owner flag)
- [ ] Create `checkPriorityUnlock(studentData, priority)` function
- [ ] Return available vs locked priorities
- [ ] Calculate progress toward locked priorities (% complete)
- [ ] Test unlock logic with 10+ scenarios

### **1.4 Recommendation Engine**
- [ ] Define recommendation triggers for all 10 priorities
- [ ] Create decision tree logic
- [ ] Handle multiple matching priorities (prioritization rules)
- [ ] Integrate Tool 1/2/3 data for trauma-informed recommendations
- [ ] Test recommendation accuracy

### **1.5 Data Structures**
- [ ] Design `TOOL4_SCENARIOS` sheet schema
  - [ ] Student identifier, scenario name, timestamp
  - [ ] Priority 1 & 2 selections
  - [ ] Base weights (weighted average)
  - [ ] Input data (income, essentials, debt, etc.)
  - [ ] Recommended allocation (M/E/F/J percentages + dollars)
  - [ ] Adjusted allocation (current reality)
  - [ ] Gap analysis
  - [ ] Progress plan (JSON or separate columns)
  - [ ] Is_Optimal flag
- [ ] Design `RESPONSES` sheet entry (optimal scenario only)
- [ ] Create draft storage in PropertiesService

---

## **Phase 2: Allocation Calculation Engine** ⏱️ 1.5 weeks

### **2.1 Base Allocation Calculator**
- [ ] Implement base weight calculation (Top 2 weighted 70%/30%)
- [ ] Apply modifiers system (financial, behavioral, motivational, trauma)
- [ ] Normalize to 100%
- [ ] Calculate dollar amounts from percentages
- [ ] Test with all 10 priorities

### **2.2 Recommended vs Adjusted**
- [ ] Calculate recommended allocation (ideal)
- [ ] Calculate adjusted allocation (current reality)
  - [ ] Use actual essentials spending
  - [ ] Distribute surplus across M/F/J
  - [ ] Apply constraints (can't allocate more than surplus)
- [ ] Generate gap analysis (difference between recommended and adjusted)
- [ ] Test with 20+ student scenarios

### **2.3 Modifiers System**
- [ ] Migrate legacy financial modifiers
  - [ ] Income level (±5 to ±10 points)
  - [ ] Debt load (±10 to ±15 points)
  - [ ] Emergency fund (±10 points)
  - [ ] Income stability (±5 points)
- [ ] Migrate legacy behavioral modifiers
  - [ ] Discipline (±10 points)
  - [ ] Impulse control (±10 points)
  - [ ] Long-term focus (±10 points)
  - [ ] Emotional spending (±10 points)
  - [ ] Satisfaction amplifier (trauma-informed)
- [ ] Migrate legacy motivational modifiers
  - [ ] Lifestyle priority (±10 points)
  - [ ] Growth orientation (±10 points)
  - [ ] Stability orientation (±10 points)
  - [ ] Goal timeline (±10 points)
- [ ] Implement trauma-informed satisfaction amplifier
  - [ ] Check Tool 1 winner (Fear/Control = overwhelm)
  - [ ] Apply 1.3x boost OR stability boost
- [ ] Apply modifier caps (±50 max positive, ±20 max negative)
- [ ] Test modifier combinations

### **2.4 Tool 2 Integration**
- [ ] Fetch Tool 2 data (DataService)
- [ ] Implement intelligent essentials detection
  - [ ] Calculate spending control score
  - [ ] Detect overspending likelihood (30% factors)
  - [ ] Estimate true essentials
  - [ ] Generate confidence level (high/medium/low)
- [ ] Parse wasteful spending text for suggestions
  - [ ] Extract categories (subscriptions, dining, shopping)
  - [ ] Estimate savings per category
  - [ ] Generate actionable recommendations
- [ ] Fallback: Show 3 inline questions if Tool 2 missing
- [ ] Test with Tool 2 data present and absent

---

## **Phase 3: Hybrid Allocation UX** ⏱️ 2 weeks

### **3.1 Interactive Calculator Interface**
- [ ] Design single-page layout (input panel + results panel)
- [ ] Implement input fields
  - [ ] Income slider ($1K - $20K)
  - [ ] Essentials slider ($500 - $15K)
  - [ ] Debt amount input
  - [ ] Emergency fund input
  - [ ] Income stability dropdown
  - [ ] Other inputs (collapsible sections)
- [ ] Real-time calculation on input change (300ms debounce)
- [ ] Update available priorities dynamically as inputs change
- [ ] Show lock/unlock animations

### **3.2 Priority Selection UI**
- [ ] Show available priorities (unlocked only)
- [ ] Show locked priorities with requirements + progress bars
- [ ] Display system recommendation with rationale
- [ ] "Accept Recommendation" button
- [ ] "Choose Different Priority" dropdown
- [ ] Top 2 ranking dropdowns (70%/30% weighting shown)
- [ ] Comparison view if student overrides recommendation

### **3.3 Allocation Display**
- [ ] Show recommended allocation
  - [ ] Percentages + dollar amounts
  - [ ] Visual bars/charts
  - [ ] Bucket descriptions
- [ ] Show gap analysis
  - [ ] Highlight differences (over/under)
  - [ ] Color coding (green = on track, yellow = close, red = gap)
  - [ ] Specific dollar amounts needed to close gap
- [ ] Show adjusted allocation (current reality)
  - [ ] What they can execute TODAY
  - [ ] Based on actual essentials spending
- [ ] Tool 2 insights panel
  - [ ] Overspending detection results
  - [ ] Suggested cuts with dollar amounts
  - [ ] Confidence level indicator

### **3.4 Three-Path Choice UI**
- [ ] **Path 1: Optimize Now**
  - [ ] Interactive essentials slider to adjust
  - [ ] Show Tool 2 suggested cuts
  - [ ] Real-time recalculation as they adjust
  - [ ] "Use Optimized Plan" button
- [ ] **Path 2: Start Adjusted, Progress Over Time**
  - [ ] Show current (adjusted) allocation
  - [ ] Show 30-60-90 day milestones
  - [ ] Month-by-month progress plan
  - [ ] "Use Gradual Plan" button
- [ ] **Path 3: Choose Different Priority**
  - [ ] Show alternative priorities that fit better
  - [ ] "View Other Priorities" button
- [ ] Clear visual distinction between the 3 paths
- [ ] Allow switching between paths before finalizing

### **3.5 Scenario Management**
- [ ] "Save Scenario" button (name the scenario)
- [ ] List saved scenarios (max 10)
- [ ] FIFO cleanup (delete oldest when 11th saved)
- [ ] "Load Scenario" to edit/compare
- [ ] "Select Optimal" star icon (marks scenario as final choice)
- [ ] Comparison view (side-by-side 2 scenarios)
- [ ] Generate PDF for scenario

---

## **Phase 4: Progress Tracking System** ⏱️ 1 week

### **4.1 Progress Plan Generation**
- [ ] Auto-generate 30-60-90 day milestones (for Path 2)
- [ ] Calculate monthly targets
  - [ ] How much to reduce essentials each month
  - [ ] How much to increase Freedom/Enjoyment each month
  - [ ] Milestone: When they reach recommended allocation
- [ ] Store progress plan in scenario data
- [ ] Allow manual editing of milestones

### **4.2 Progress Dashboard**
- [ ] Visual progress indicators
  - [ ] Freedom: $X ━━━━░░░░ $Y (progress bar)
  - [ ] Essentials: $A ░░░━━━━ $B (progress bar)
  - [ ] Current vs Target comparison
- [ ] "Update My Progress" button
  - [ ] Student enters new income/essentials/etc.
  - [ ] System recalculates adjusted allocation
  - [ ] Shows progress toward recommended
  - [ ] Unlocks next milestone if achieved
- [ ] Achievement notifications
  - [ ] "🎉 You reduced essentials by $300! Milestone 1 complete"
  - [ ] "✨ New priority unlocked: Build Long-Term Wealth"

### **4.3 Update Prompts**
- [ ] Time-based: "It's been 30 days - time to update your allocation"
- [ ] Event-based: "Your emergency fund increased - new priorities may be available"
- [ ] Dashboard badge: "Tool 4: Update Available"
- [ ] Email reminder (optional)

---

## **Phase 5: Integration & Polish** ⏱️ 1.5 weeks

### **5.1 Tool Registry Integration**
- [ ] Register Tool 4 in ToolRegistry.js
- [ ] Define access control rules
  - [ ] Requires Tool 1 completion (trauma assessment)
  - [ ] Recommends Tool 2 completion (clarity, but not required)
  - [ ] Tool 3 optional
- [ ] Define unlock conditions for Tool 5
  - [ ] Requires optimal scenario selected
  - [ ] Mark Tool 4 as COMPLETED in RESPONSES sheet

### **5.2 Data Service Integration**
- [ ] Implement DataService methods
  - [ ] `getLatestResponse(clientId, 'tool4')` - Get optimal scenario
  - [ ] `getAllScenarios(clientId)` - Get all saved scenarios
  - [ ] `saveScenario(clientId, scenarioData)` - Save new scenario
  - [ ] `setOptimalScenario(clientId, scenarioId)` - Mark as optimal
  - [ ] `updateScenarioProgress(clientId, scenarioId, progressData)` - Track progress
- [ ] Handle FIFO cleanup (10 scenario limit)
- [ ] Update Is_Latest column logic

### **5.3 GPT Integration**
- [ ] Implement on-demand GPT analysis
  - [ ] Button: "Get AI Insights"
  - [ ] Prompt template with full student profile (Tools 1-3 data)
  - [ ] Context: Current vs recommended allocation + gap
  - [ ] Response: Personalized guidance (3-5 paragraphs)
  - [ ] Display in collapsible panel
- [ ] Scenario comparison GPT analysis
  - [ ] "Which scenario is better for me?" button
  - [ ] Input: 2 scenarios + student profile
  - [ ] Output: Comparative analysis + recommendation
- [ ] Rate limiting and caching

### **5.4 PDF Report Generation**
- [ ] Update report template for v3.0
  - [ ] Show both recommended + adjusted allocations
  - [ ] Include gap analysis
  - [ ] Include progress plan (if Path 2 chosen)
  - [ ] Include Tool 2 overspending insights
  - [ ] Include GPT personalized guidance
- [ ] Generate PDF on "Save Scenario" or "Download Report"
- [ ] Store in Google Drive with proper naming
- [ ] Email to student (optional)

### **5.5 Mobile Responsiveness**
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Adjust layout for small screens
  - [ ] Stack input/results panels vertically
  - [ ] Collapsible sections default closed on mobile
  - [ ] Touch-friendly sliders and dropdowns
- [ ] Test interactive features on touch devices

### **5.6 Error Handling & Edge Cases**
- [ ] Handle missing Tool 1 data (require completion)
- [ ] Handle missing Tool 2 data (show fallback questions)
- [ ] Handle zero income (validation error)
- [ ] Handle negative surplus (essentials > income) - special warning
- [ ] Handle no priorities unlocked (shouldn't happen, but safety check)
- [ ] Handle concurrent edits (PropertiesService locks)
- [ ] Handle API failures (GPT, data service)

---

## **Phase 6: Testing & Validation** ⏱️ 1 week

### **6.1 Unit Testing**
- [ ] Test surplus calculation
- [ ] Test unlock logic for all 10 priorities
- [ ] Test Top 2 weighting calculation (70%/30%)
- [ ] Test recommended allocation calculation
- [ ] Test adjusted allocation calculation
- [ ] Test gap analysis
- [ ] Test modifier application
- [ ] Test Tool 2 integration (present and absent)
- [ ] Test FIFO cleanup

### **6.2 Integration Testing**
- [ ] Test full user flow (data entry → priority selection → allocation → save)
- [ ] Test Path 1 (optimize now)
- [ ] Test Path 2 (gradual progress)
- [ ] Test Path 3 (different priority)
- [ ] Test scenario management (save, load, compare, optimal)
- [ ] Test progress tracking updates
- [ ] Test Tool 5 unlock

### **6.3 Scenario Testing**
Create 20+ test students covering:
- [ ] Crisis mode (low income, no emergency fund)
- [ ] Debt-focused (high debt, moderate income)
- [ ] Wealth-building (high surplus, established)
- [ ] Lifestyle-focused (high income, high enjoyment)
- [ ] Business owner (variable income)
- [ ] High trauma (Fear/Control winners)
- [ ] Various income levels ($2K, $5K, $10K, $20K)
- [ ] Various essentials % (30%, 50%, 70%)
- [ ] Edge cases (zero debt, zero emergency fund, etc.)

**For each scenario:**
- [ ] Verify correct priorities unlock
- [ ] Verify recommendation makes sense
- [ ] Verify allocations feel realistic
- [ ] Verify gap analysis is accurate
- [ ] Verify progress plan is achievable

### **6.4 User Acceptance Testing**
- [ ] Test with 5-10 real students (beta group)
- [ ] Collect feedback on:
  - [ ] UI clarity (do they understand the 3 paths?)
  - [ ] Recommendation accuracy (does it feel right?)
  - [ ] Allocation usefulness (can they execute it?)
  - [ ] Progress tracking motivation (does it help?)
- [ ] Iterate based on feedback

### **6.5 Performance Testing**
- [ ] Test with 100+ saved scenarios (database load)
- [ ] Test real-time calculation speed (should be <300ms)
- [ ] Test GPT response time (acceptable <5 seconds)
- [ ] Test PDF generation time (acceptable <10 seconds)
- [ ] Test concurrent users (Google Apps Script quotas)

---

## **Phase 7: Documentation & Deployment** ⏱️ 3 days

### **7.1 Developer Documentation**
- [ ] Code comments for all major functions
- [ ] API documentation (DataService methods)
- [ ] Configuration guide (how to adjust base weights, thresholds)
- [ ] Troubleshooting guide

### **7.2 User Documentation**
- [ ] Tutorial/walkthrough for first-time users
- [ ] FAQ (common questions about priorities, allocations)
- [ ] Video tutorial (optional, 5-10 minutes)
- [ ] Help tooltips in UI (? icons with explanations)

### **7.3 Deployment**
- [ ] Deploy to staging environment
- [ ] Final QA testing
- [ ] Deploy to production
- [ ] Monitor for errors (first 48 hours)
- [ ] Collect initial user feedback

### **7.4 Post-Launch**
- [ ] Monitor usage analytics
  - [ ] Which priorities are selected most often?
  - [ ] Which paths are chosen (optimize vs gradual vs different)?
  - [ ] How many scenarios per student?
  - [ ] Dropout points (where do students abandon?)
- [ ] Iterate based on data
- [ ] Plan v3.1 improvements

---

## **✅ Definition of Done**

**Tool 4 is complete when:**
- ✅ All 10 priorities implemented with correct base weights
- ✅ Progressive unlock logic working correctly
- ✅ Hybrid allocation UX (3 paths) functional
- ✅ Tool 2 integration detecting overspending
- ✅ Progress tracking system operational
- ✅ Scenario management (save, compare, optimal) working
- ✅ GPT integration providing personalized insights
- ✅ PDF reports generating correctly
- ✅ Tested with 20+ scenarios, all passing
- ✅ User testing completed with positive feedback
- ✅ Zero critical bugs
- ✅ Tool 5 unlocks when optimal scenario selected
- ✅ Documentation complete

---

## **🚧 Known Deferred Items**

These items are documented but NOT required for v3.0 launch:

1. **Complete unlock requirement validation** - Emergency fund and debt thresholds need real-world testing and adjustment
2. **Recommendation trigger optimization** - Decision tree may need refinement based on usage data
3. **Progress plan algorithm tuning** - Monthly milestone calculations may need adjustment
4. **Additional trauma-informed modifiers** - May add more Tool 1/2/3 integrations in v3.1
5. **Advanced analytics** - Deeper insights into allocation effectiveness over time

These will be addressed in v3.1 or later based on user feedback and data.

---

## **📞 Key Contacts**

- **Product Owner:** [Name]
- **Lead Developer:** [Name]
- **Clinical Advisor:** [Name] (for trauma-informed validation)
- **Financial Advisor:** [Name] (for allocation validation)

---

**Last Updated:** November 17, 2025
**Version:** 3.0
**Status:** Ready for Development ✅
