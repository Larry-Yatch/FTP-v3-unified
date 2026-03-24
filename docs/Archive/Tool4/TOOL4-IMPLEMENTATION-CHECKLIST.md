# Tool 4: Implementation Checklist

**Date:** November 25, 2025
**Status:** Ready to Build
**Est. Timeline:** 8-10 weeks total

---

## 📋 Phase 1: Core Calculator (Weeks 1-5)

### **Week 1: Setup & UI Foundation**

**Files to Create:**
- [ ] `/tools/tool4/tool.manifest.json`
- [ ] `/tools/tool4/Tool4.js` (main render function)
- [ ] `/tools/tool4/Tool4Calculator.js` (client-side calculation engine)
- [ ] `/tools/tool4/tool4-styles.html` (shared styles)
- [ ] `/tools/tool4/tool4-calculator.html` (main UI template)

**Tasks:**
- [ ] Register Tool 4 in `Code.js` (`registerTools()`)
- [ ] Add Tool 4 route to `Router.js`
- [ ] Create TOOL4_SCENARIOS sheet in Master Spreadsheet
  - Columns: A-AJ (see spec)
  - Headers: Timestamp, Client_ID, Scenario_Name, etc.
- [ ] Create student ID gate (roster validation)
- [ ] Build basic single-page layout (following Tool 8 pattern)

**Testing:**
- [ ] Navigate to `?route=tool4&client=TEST001`
- [ ] Verify ID gate works
- [ ] Verify roster lookup

---

### **Week 2: Input Forms & Category Estimates**

**Tasks:**
- [ ] Financial inputs section
  - Income field (number, validated)
  - Current essentials field (number)
  - Debt balance field (number)
  - Interest rate dropdown (High/Medium/Low)
  - Emergency fund field (number)
  - Income stability dropdown (4 options)
- [ ] Category spending estimates section
  - 8 category fields (Rent, Groceries, Dining, Transport, Utilities, Insurance, Subscriptions, Other)
  - Real-time total calculation
  - Validation: Total must match "Current Essentials"
  - Warning if mismatch
- [ ] Suggested category values (pre-populate common splits)
- [ ] Input persistence (save to PropertiesService as draft)

**Testing:**
- [ ] Enter financial data
- [ ] Category total validates correctly
- [ ] Shows error if totals don't match
- [ ] Draft auto-saves (refresh page, data persists)

---

### **Week 3: Base Weights & Priority System**

**Files to Create:**
- [ ] `/tools/tool4/Tool4BaseWeights.js` (10 priorities with base weights)
- [ ] `/tools/tool4/Tool4ProgressiveUnlock.js` (unlock logic)

**Tasks:**
- [ ] Implement all 10 priority base weights
- [ ] Implement progressive unlock logic
  - Calculate surplus (income - essentials)
  - Check emergency fund requirements
  - Check debt requirements
  - Filter available priorities
- [ ] Display unlocked priorities (green checkmark)
- [ ] Display locked priorities with requirements
- [ ] Priority dropdown (only show unlocked)

**Testing:**
- [ ] Enter low income, high essentials → Only Tier 1 priorities unlocked
- [ ] Increase emergency fund → More priorities unlock
- [ ] Verify unlock thresholds match spec

---

### **Week 4: Modifier System & Algorithm**

**Files to Create:**
- [ ] `/tools/tool4/Tool4Modifiers.js` (29 modifiers)
- [ ] `/tools/tool4/Tool4TraumaIntegration.js` (Tools 1/2/3 data pull + mapping)

**Tasks:**
- [ ] Implement all 29 modifiers
- [ ] Implement modifier caps (±50/±20)
- [ ] Pull Tools 1/2/3 data from RESPONSES sheet
- [ ] Map Tool 1/2/3 data to modifiers
- [ ] Complete calculation flow
- [ ] Display recommended allocation (bar chart)
- [ ] Real-time recalculation on any input change

**Testing:**
- [ ] Enter different financial scenarios
- [ ] Verify modifiers apply correctly
- [ ] Verify trauma-informed amplifier works
- [ ] Check caps prevent runaway values
- [ ] Test with different Tools 1/2/3 data

---

### **Week 5: Tools 1/2/3 Integration & Backup Questions**

**Files to Create:**
- [ ] `/tools/tool4/tool4-backup-questions.html` (modal + form)
- [ ] `/tools/tool4/Tool4BackupMapping.js` (map backup answers to modifiers)

**Tasks:**
- [ ] Check Tools 1/2/3 completion on page load
- [ ] Show conditional modal if tools missing
- [ ] Implement 13-question backup form
- [ ] Map backup answers to approximate Tool 1/2/3 data
- [ ] Merge real data + backup data
- [ ] Store backup data in TOOL4_SCENARIOS sheet

**Testing:**
- [ ] Test with all 3 tools completed → No modal
- [ ] Test with Tool 1 missing → Modal shows, 6 backup questions
- [ ] Test with all missing → Modal shows, 13 backup questions
- [ ] Verify backup mapping produces reasonable modifiers

---

### **Week 6: Custom Allocation & Scenario Management**

**Tasks:**
- [ ] Custom allocation toggle
- [ ] Scenario naming input
- [ ] Save scenario button
- [ ] Server-side save to TOOL4_SCENARIOS sheet
- [ ] Update RESPONSES sheet on first scenario
- [ ] Load scenarios dropdown
- [ ] Load scenario button

**Testing:**
- [ ] Save scenario → Appears in TOOL4_SCENARIOS sheet
- [ ] Save first scenario → RESPONSES sheet updates to COMPLETED
- [ ] Load saved scenario → All inputs populate correctly

---

## 📋 Phase 2: Report Generation (Weeks 7-8)

### **Week 7: Report Structure & Content**

**Files to Create:**
- [ ] `/tools/tool4/Tool4Report.js` (report renderer)
- [ ] `/tools/tool4/tool4-report.html` (report template)

**Tasks:**
- [ ] Report route in Router.js
- [ ] All 8 report sections (see spec)
- [ ] PDF generation
- [ ] Download functionality

**Testing:**
- [ ] Generate report → All sections render
- [ ] Data populates correctly
- [ ] PDF downloads

---

## 📋 Phase 3: Integration & Polish (Weeks 9-10)

**Tasks:**
- [ ] Dashboard integration
- [ ] Admin tracking
- [ ] Edge case testing
- [ ] Production deployment

---

**Next Step:** Begin Week 1 tasks!
