# Tool 2 Implementation Guide - Financial TruPath v3

**Date:** November 4, 2024 (Updated After Design Finalization)
**Status:** 🎯 **Design Complete** - Ready for Implementation
**Estimated Time:** 4-6 hours
**Complexity:** Medium (proven patterns, new content)

---

## 🚀 Implementation Summary

### **What's Ready:**
- ✅ All 52 questions finalized ([TOOL2-QUESTION-MASTER-LIST.md](./TOOL2-QUESTION-MASTER-LIST.md))
- ✅ Legacy scoring analyzed ([LEGACY-CLARITY-SCORING-ALGORITHM.md](./LEGACY-CLARITY-SCORING-ALGORITHM.md))
- ✅ Domain structure defined (5 consolidated domains)
- ✅ Scale standardized (-5 to +5, no zero)
- ✅ Adaptive psychological section designed
- ✅ Scaffolding exists (Tool2.js template from previous session)

### **What Needs Building:**
- 🔨 Replace placeholder questions with real questions (52 total)
- 🔨 Implement domain scoring logic (5 domains)
- 🔨 Build adaptive psychological section (Tool 1 integration)
- 🔨 Create report generation with insights
- 🔨 Test and deploy

---

## 📋 Implementation Checklist

### **Phase 1: Review & Prepare** ⏱️ 15 min

- [ ] Read [TOOL2-QUESTION-MASTER-LIST.md](./TOOL2-QUESTION-MASTER-LIST.md) completely
- [ ] Review current Tool2.js scaffolding
- [ ] Check clasp authentication (`clasp login`)
- [ ] Open reference files side-by-side

---

### **Phase 2: Page 1 - Demographics** ⏱️ 30 min

**Goal:** 10 questions (3 pre-filled + 7 new)

**File:** `tools/tool2/Tool2.js` → `renderPage1Content()`

**Tasks:**
1. Pre-fill name, email, studentId from Tool 1
2. Add Q4-Q10 from question master list
3. Implement conditional logic for Q10 (business stage, only if business owner)
4. Test page rendering

**Code Pattern:**
```javascript
renderPage1Content(data, clientId) {
  // Get Tool 1 data for pre-filling
  const tool1Data = DataService.getToolResponse(clientId, 'tool1');
  const name = tool1Data?.data?.name || data?.name || '';
  const email = tool1Data?.data?.email || data?.email || '';

  return `
    <h2>Demographics & Foundation</h2>
    <p class="muted mb-20">Help us understand your life context</p>

    <!-- Q1-Q3: Pre-filled -->
    <div class="form-group">
      <label class="form-label">First and Last Name *</label>
      <input type="text" name="name" value="${name}" readonly required>
    </div>

    <!-- Q4-Q9: Select dropdowns -->
    <div class="form-group">
      <label class="form-label">Age Range *</label>
      <select name="ageRange" required>
        <option value="">Select...</option>
        <option value="18-30">18-30 years old</option>
        ...
      </select>
    </div>

    <!-- Q10: Conditional business stage -->
    <div class="form-group" id="businessStageGroup" style="display:none;">
      <label class="form-label">If Business Owner: Business Stage</label>
      <select name="businessStage">...</select>
    </div>

    <script>
      // Show/hide business stage based on employment status
      document.querySelector('[name="employmentStatus"]').addEventListener('change', (e) => {
        const showBiz = e.target.value && e.target.value.includes('Business owner');
        document.getElementById('businessStageGroup').style.display = showBiz ? 'block' : 'none';
      });

      // Trigger on page load if resuming
      const currentValue = document.querySelector('[name="employmentStatus"]').value;
      if (currentValue && currentValue.includes('Business owner')) {
        document.getElementById('businessStageGroup').style.display = 'block';
      }
    </script>
  `;
}
```

**Testing:**
- [ ] Pre-fill works (name/email from Tool 1)
- [ ] All dropdowns render
- [ ] Business stage shows/hides correctly
- [ ] Form validation works
- [ ] Draft save/resume works

---

### **Phase 3: Page 2 - Money Flow** ⏱️ 40 min

**Goal:** 11 questions (Income 5, Spending 6)

**File:** `tools/tool2/Tool2.js` → `renderPage2Content()`

**Tasks:**
1. Add Q11-Q14: Income clarity scales (-5 to +5)
2. Add Q15: Income sources (paragraph text)
3. Add Q16-Q19: Spending clarity scales (-5 to +5)
4. Add Q20-Q21: Spending lists (paragraph text)
5. Test page rendering

**Code Pattern:**
```javascript
renderPage2Content(data, clientId) {
  const incomeQuestions = [
    {name: 'incomeClarity', text: 'What level of clarity do you hold on your income?'},
    {name: 'incomeSufficiency', text: 'How sufficient is your current income?'},
    {name: 'incomeConsistency', text: 'How consistent is your monthly income?'},
    {name: 'incomeReview', text: 'How often do you review your income?'}
  ];

  let html = `
    <h2>💰 Money Flow Domain</h2>
    <p class="muted mb-20">Understanding your income and spending patterns</p>

    <h3 class="section-divider">Income Clarity</h3>
  `;

  // Render income questions
  incomeQuestions.forEach(q => {
    const selected = data?.[q.name] || '';
    html += `
      <div class="form-group">
        <label class="form-label">${q.text} *</label>
        <select name="${q.name}" required>
          <option value="">Select a response</option>
          <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Most negative)</option>
          <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
          <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
          <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
          <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
          <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
          <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
          <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
          <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
          <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Most positive)</option>
        </select>
      </div>
    `;
  });

  // Add free-text income sources
  html += `
    <div class="form-group">
      <label class="form-label">List your income sources *</label>
      <textarea name="incomeSources" rows="3" required placeholder="Example: Salary from ABC Corp, rental property income, freelance consulting">${data?.incomeSources || ''}</textarea>
    </div>
  `;

  // Spending questions follow same pattern...

  return html;
}
```

**Note:** See TOOL2-QUESTION-MASTER-LIST.md for exact label text for each scale point.

**Testing:**
- [ ] All 11 questions render
- [ ] Scale dropdowns work (-5 to +5, no zero)
- [ ] Free-text fields save drafts
- [ ] Navigation to next page works

---

### **Phase 4: Page 3 - Obligations** ⏱️ 40 min

**Goal:** 11 questions (Debt 5, Emergency Fund 6)

**File:** `tools/tool2/Tool2.js` → `renderPage3Content()`

**Tasks:**
1. Add Q22-Q25: Debt position scales
2. Add Q26: Current debts (paragraph text)
3. Add Q27-Q31: Emergency fund scales + free text
4. Add Q32: Emergency stress scale
5. Test page rendering

**Pattern:** Same as Page 2, just different questions. Reference TOOL2-QUESTION-MASTER-LIST.md Q22-Q32.

**Testing:**
- [ ] All 11 questions render
- [ ] Debt questions before emergency fund questions
- [ ] Free-text for debt list works
- [ ] Navigation works

---

### **Phase 5: Page 4 - Growth** ⏱️ 40 min

**Goal:** 11 questions (Savings 4, Investments 4, Retirement 3)

**File:** `tools/tool2/Tool2.js` → `renderPage4Content()`

**Tasks:**
1. Add Q33-Q35: Savings scales
2. Add Q36: Last 3 savings withdrawals (paragraph text)
3. Add Q37-Q39: Investment scales
4. Add Q40: Investment types (paragraph text)
5. Add Q41-Q43: Retirement scales
6. Test page rendering

**Pattern:** Same as Pages 2-3. Reference TOOL2-QUESTION-MASTER-LIST.md Q33-Q43.

**Testing:**
- [ ] All 11 questions render across 3 sub-sections
- [ ] Clear visual separation (h3 headers between sections)
- [ ] Free-text fields work
- [ ] Navigation works

---

### **Phase 6: Page 5 - Protection + Psychological** ⏱️ 70 min

**Goal:** 9 questions (Insurance 3, Base psych 3, Adaptive 2-3)

**File:** `tools/tool2/Tool2.js` → `renderPage5Content()`

**This is the complex page with adaptive logic**

**Tasks:**
1. Add Q44-Q46: Insurance protection scales
2. Add Q47-Q49: Base psychological questions (everyone)
3. Implement adaptive logic:
   - Query Tool 1 trauma scores
   - Identify top 2-3 trauma categories
   - Render 2-3 corresponding adaptive questions (Q50a-f)
4. Add review section
5. Test thoroughly

**Code Pattern:**
```javascript
renderPage5Content(data, clientId) {
  let html = `
    <h2>🛡️ Protection & Psychological Depth</h2>
    <p class="muted mb-20">Final section: Protection and deeper insights</p>

    <h3 class="section-divider">Insurance Protection</h3>
  `;

  // Q44-Q46: Insurance (standard scales)
  html += this.renderInsuranceQuestions(data);

  // Q47-Q49: Base psychological (everyone)
  html += `
    <h3 class="section-divider mt-40">Psychological Clarity</h3>

    <div class="form-group">
      <label class="form-label">What emotions arise when you think about reviewing your finances? *</label>
      <textarea name="emotionsFinances" rows="4" required placeholder="Be honest: anxiety, guilt, fear, excitement, confidence, overwhelm...">${data?.emotionsFinances || ''}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label">What is your PRIMARY obstacle to gaining financial clarity? *</label>
      <select name="primaryObstacle" required>
        <option value="">Select...</option>
        <option value="time" ${data?.primaryObstacle === 'time' ? 'selected' : ''}>Lack of time / too busy</option>
        <option value="complexity" ${data?.primaryObstacle === 'complexity' ? 'selected' : ''}>Overwhelming complexity</option>
        <option value="emotional" ${data?.primaryObstacle === 'emotional' ? 'selected' : ''}>Emotional avoidance (fear, shame, anxiety)</option>
        <option value="knowledge" ${data?.primaryObstacle === 'knowledge' ? 'selected' : ''}>Lack of knowledge or skills</option>
        <option value="income" ${data?.primaryObstacle === 'income' ? 'selected' : ''}>Inconsistent income makes planning impossible</option>
        <option value="debt" ${data?.primaryObstacle === 'debt' ? 'selected' : ''}>Too much debt to face</option>
        <option value="trauma" ${data?.primaryObstacle === 'trauma' ? 'selected' : ''}>Past financial trauma or mistakes</option>
        <option value="trust" ${data?.primaryObstacle === 'trust' ? 'selected' : ''}>Don't trust myself with money</option>
        <option value="fear" ${data?.primaryObstacle === 'fear' ? 'selected' : ''}>Fear of what I'll discover</option>
        <option value="partner" ${data?.primaryObstacle === 'partner' ? 'selected' : ''}>Partner/spouse doesn't want to discuss</option>
      </select>
    </div>

    <!-- Q49: Confidence scale -->
    <div class="form-group">
      <label class="form-label">How confident are you in achieving your financial goals? *</label>
      <select name="goalConfidence" required>
        <option value="">Select a response</option>
        <option value="-5" ${data?.goalConfidence === '-5' ? 'selected' : ''}>-5 (No chance, impossible)</option>
        ...same pattern...
        <option value="5" ${data?.goalConfidence === '5' ? 'selected' : ''}>5 (100% certain)</option>
      </select>
    </div>
  `;

  // ADAPTIVE SECTION: Query Tool 1 and add trauma-specific questions
  try {
    const tool1Data = DataService.getToolResponse(clientId, 'tool1');
    if (tool1Data && tool1Data.results) {
      html += `<h3 class="section-divider mt-40">Personalized Depth Questions</h3>`;
      html += `<p class="muted mb-20">Based on your Tool 1 assessment, we'd like to understand a bit more:</p>`;

      const traumaScores = tool1Data.results;

      // Sort traumas by absolute value, get top 2
      const sortedTraumas = Object.entries(traumaScores)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 2);

      // Render corresponding questions
      sortedTraumas.forEach(([category, score]) => {
        if (Math.abs(score) > 5) { // Threshold for showing adaptive question
          if (category === 'FSV') {
            html += this.renderAdaptiveQ50a(data);
          } else if (category === 'Control') {
            html += this.renderAdaptiveQ50b(data);
          } else if (category === 'ExVal') {
            html += this.renderAdaptiveQ50c(data);
          } else if (category === 'Fear') {
            html += this.renderAdaptiveQ50d(data);
          } else if (category === 'Receiving') {
            html += this.renderAdaptiveQ50e(data);
          } else if (category === 'Showing') {
            html += this.renderAdaptiveQ50f(data);
          }
        }
      });
    }
  } catch (e) {
    Logger.log('Could not load Tool 1 data for adaptive questions: ' + e);
    // Graceful degradation - page still works without adaptive questions
  }

  // Review section
  html += `
    <h3 class="section-divider mt-40">Review Your Answers</h3>
    <p class="muted mb-20">Before submitting, please review your responses:</p>
    <div class="insight-box" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
      <p><strong>📋 Review Note</strong></p>
      <p>You can use your browser's back button to review and edit any previous pages.</p>
      <p>When ready, click "Complete Assessment" below to generate your personalized report.</p>
    </div>
  `;

  return html;
}

// Helper methods for adaptive questions
renderAdaptiveQ50a(data) {
  const selected = data?.hidingFinances || '';
  return `
    <div class="form-group">
      <label class="form-label">How much do you hide your true financial situation from others? *</label>
      <select name="hidingFinances" required>
        <option value="">Select a response</option>
        <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Complete transparency)</option>
        ...
        <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Total hiding, no one knows)</option>
      </select>
    </div>
  `;
}

renderAdaptiveQ50b(data) {
  // Similar pattern for control question...
}

// ... etc for Q50c-f
```

**Testing:**
- [ ] Insurance questions render
- [ ] Base psychological questions render
- [ ] Adaptive logic works (queries Tool 1)
- [ ] Correct 2-3 adaptive questions show
- [ ] Graceful degradation if Tool 1 unavailable
- [ ] Review section displays
- [ ] Final submit works

---

### **Phase 7: Scoring Logic** ⏱️ 1.5 hours

**Goal:** Calculate domain scores, apply benchmarks, prioritize

**File:** `tools/tool2/Tool2.js` → `processResults()` and helper functions

**Tasks:**
1. Implement 5 domain score calculations
2. Define absolute benchmarks (High/Med/Low)
3. Apply stress weights
4. Calculate priority tiers
5. Identify focus domain

**Code Pattern:**
```javascript
processResults(data) {
  // Calculate raw domain scores
  const domainScores = {
    moneyFlow: this.calculateMoneyFlow(data),
    obligations: this.calculateObligations(data),
    liquidity: this.calculateLiquidity(data),
    growth: this.calculateGrowth(data),
    protection: this.calculateProtection(data)
  };

  // Apply absolute benchmarks
  const domains = {};
  Object.keys(domainScores).forEach(domain => {
    domains[domain] = this.applyBenchmark(domainScores[domain], domain);
  });

  // Apply stress weights and prioritize
  const prioritized = this.prioritizeDomains(domains);

  return {
    rawScores: domainScores,
    domains: domains,
    priority: prioritized,
    focusDomain: prioritized.high[0],
    timestamp: new Date().toISOString()
  };
},

// Helper: Calculate Money Flow domain score
calculateMoneyFlow(data) {
  // Sum income questions (Q11-Q14) + spending questions (Q16-Q19)
  const incomeScore =
    parseInt(data.incomeClarity || 0) +
    parseInt(data.incomeSufficiency || 0) +
    parseInt(data.incomeConsistency || 0) +
    parseInt(data.incomeReview || 0);

  const spendingScore =
    parseInt(data.spendingClarity || 0) +
    parseInt(data.spendingConsistency || 0) +
    parseInt(data.spendingReview || 0) +
    parseInt(data.spendingStress || 0);

  const totalScore = incomeScore + spendingScore;

  // Max possible: 8 questions × 5 points = 40 (if all +5)
  // Min possible: 8 questions × -5 points = -40 (if all -5)
  // Range: -40 to +40

  return {
    raw: totalScore,
    income: incomeScore,
    spending: spendingScore,
    questionCount: 8
  };
},

// Helper: Apply absolute benchmark
applyBenchmark(scoreObj, domainName) {
  const score = scoreObj.raw;
  const max = scoreObj.questionCount * 5; // Max possible
  const percentage = (score / max) * 100; // Convert to percentage of max

  let level = 'Low';
  let message = '';

  if (percentage >= 60) {
    level = 'High';
    message = 'Strong clarity and confidence in this domain';
  } else if (percentage >= 20) {
    level = 'Medium';
    message = 'Moderate clarity, room for improvement';
  } else {
    level = 'Low';
    message = 'Needs attention and development';
  }

  return {
    ...scoreObj,
    level: level,
    percentage: Math.round(percentage),
    message: message
  };
},

// Helper: Prioritize domains with stress weighting
prioritizeDomains(domains) {
  // Stress weights (from legacy analysis)
  const stressWeights = {
    moneyFlow: 5,      // High emotional impact (spending)
    obligations: 4,    // Debt stress
    liquidity: 2,      // Savings anxiety
    growth: 1,         // Investments/retirement (less immediate)
    protection: 1      // Insurance (background concern)
  };

  // Calculate weighted scores (lower = higher priority)
  // Negative scores (struggle) weighted more heavily
  const weighted = [];
  Object.keys(domains).forEach(domainName => {
    const domain = domains[domainName];
    const weight = stressWeights[domainName];
    const weightedScore = domain.raw * weight;

    weighted.push({
      name: domainName,
      raw: domain.raw,
      level: domain.level,
      weightedScore: weightedScore
    });
  });

  // Sort by weighted score (ascending = most negative = highest priority)
  weighted.sort((a, b) => a.weightedScore - b.weightedScore);

  return {
    high: [weighted[0], weighted[1]].map(d => d.name),
    medium: [weighted[2], weighted[3]].map(d => d.name),
    low: [weighted[4]].map(d => d.name),
    sorted: weighted
  };
}
```

**Testing:**
- [ ] Domain scores calculate correctly
- [ ] Benchmarks assign High/Med/Low properly
- [ ] Stress weighting works
- [ ] Priority tiers make sense
- [ ] Focus domain identified

---

### **Phase 8: Report Generation** ⏱️ 1 hour

**Goal:** Build personalized report with insights

**File:** `tools/tool2/Tool2Report.js` → `buildReportHTML()`

**Tasks:**
1. Update report structure
2. Implement priority focus areas
3. Create domain-specific insights
4. Add Growth Archetype (simple version)
5. Test report rendering

**Reference:** See [Clarity-Output-Base.md](../../Financial-TruPath-v3/docs/Clarity-Output-Base.md) for report template.

**Simplified First Version:**
```javascript
buildReportHTML(results) {
  const priority = results.priority;
  const domains = results.domains;
  const focusDomain = results.focusDomain;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Financial Clarity Report</title>
      ${this.getReportStyles()}
    </head>
    <body>
      <div class="report-container">
        <h1>Financial Clarity Assessment Report</h1>

        <div class="section">
          <h2>Priority Focus Areas</h2>
          <p>Based on your responses and stress-weighted analysis:</p>

          <h3>High Priority (Address First)</h3>
          ${this.renderPriorityDomain(priority.high[0], domains)}
          ${this.renderPriorityDomain(priority.high[1], domains)}

          <h3>Medium Priority (Next Steps)</h3>
          ${this.renderPriorityDomain(priority.medium[0], domains)}
          ${this.renderPriorityDomain(priority.medium[1], domains)}

          <h3>Low Priority (Maintain)</h3>
          ${this.renderPriorityDomain(priority.low[0], domains)}
        </div>

        <div class="section">
          <h2>Your Focus Domain: ${focusDomain}</h2>
          ${this.getFocusDomainInsight(focusDomain, domains)}
        </div>

        <div class="section">
          <h2>Domain-Specific Insights</h2>
          ${Object.keys(domains).map(d => this.renderDomainInsight(d, domains[d])).join('')}
        </div>

        <div class="section">
          <h2>Next Steps</h2>
          <p>Focus on your high-priority domains first. Small improvements in ${focusDomain} will have the biggest impact on your overall financial clarity.</p>
        </div>
      </div>
    </body>
    </html>
  `;
},

renderPriorityDomain(domainName, domains) {
  const domain = domains[domainName];
  const displayName = this.getDomainDisplayName(domainName);

  return `
    <div class="priority-item">
      <h4>${displayName}</h4>
      <p><strong>Level:</strong> ${domain.level} (${domain.percentage}%)</p>
      <p>${domain.message}</p>
    </div>
  `;
},

getDomainDisplayName(domainName) {
  const names = {
    moneyFlow: 'Money Flow (Income & Spending)',
    obligations: 'Obligations (Debt & Emergency Fund)',
    liquidity: 'Liquidity (Savings)',
    growth: 'Growth (Investments & Retirement)',
    protection: 'Protection (Insurance)'
  };
  return names[domainName] || domainName;
}
```

**Testing:**
- [ ] Report generates without errors
- [ ] All sections render
- [ ] Priorities display correctly
- [ ] Domain insights appear
- [ ] PDF download works (if implemented)

---

### **Phase 9: Testing** ⏱️ 30 min

**Complete End-to-End Test:**

1. **Fresh Start:**
   - [ ] Login as TEST001
   - [ ] Complete Tool 1 (if not already)
   - [ ] Tool 2 shows as available on dashboard

2. **Page-by-Page:**
   - [ ] Page 1: Demographics pre-fill works, business conditional works
   - [ ] Page 2: Money Flow renders, scales work, free-text saves
   - [ ] Page 3: Obligations renders, all questions work
   - [ ] Page 4: Growth renders, 3 sub-sections clear
   - [ ] Page 5: Protection + adaptive questions, submit works

3. **Draft Resume:**
   - [ ] Exit mid-assessment
   - [ ] Re-enter Tool 2
   - [ ] Answers restored correctly
   - [ ] Can continue from where left off

4. **Report:**
   - [ ] Submit generates report
   - [ ] Report shows on dashboard
   - [ ] All sections present
   - [ ] Priority tiers make sense
   - [ ] Focus domain identified

5. **Tool Progression:**
   - [ ] Tool 3 unlocks after completion (if Tool 3 exists)

---

### **Phase 10: Deploy** ⏱️ 15 min

**Deployment Steps:**

```bash
cd /Users/Larry/Documents/agent-girl/v3-fin-nav

# Check authentication
clasp login

# Push code
clasp push

# Deploy new version
clasp deploy --description "v3.3.0 - Tool 2 Financial Clarity Assessment complete"

# Get deployment ID
clasp deployments

# Test in production
# Visit production URL and complete as TEST001
```

**Git Workflow:**
```bash
git status
git add tools/tool2/
git add docs/
git commit -m "feat(tool2): Complete Financial Clarity Assessment - 52 questions, 5 domains, adaptive psychology"
git push
```

---

## 📊 Success Criteria

**Definition of Done:**
- [ ] All 52 questions implemented correctly
- [ ] All 5 pages render without errors
- [ ] Pre-filling from Tool 1 works
- [ ] Conditional logic works (business stage)
- [ ] Adaptive psychological section works
- [ ] Draft auto-save/resume works
- [ ] Form validation works (all required fields)
- [ ] Scoring calculates correctly
- [ ] Report generates with insights
- [ ] Priority tiers make sense
- [ ] Tested end-to-end with TEST001
- [ ] Deployed to production
- [ ] Git committed and pushed
- [ ] Documentation updated

---

## 🚀 Quick Reference

### **Key Files:**

**Implementation:**
- `tools/tool2/Tool2.js` - Main tool logic
- `tools/tool2/Tool2Report.js` - Report generation
- `tools/tool2/tool.manifest.json` - Metadata

**Reference:**
- `docs/TOOL2-QUESTION-MASTER-LIST.md` - All questions
- `docs/LEGACY-CLARITY-SCORING-ALGORITHM.md` - Scoring analysis
- `tools/tool1/Tool1.js` - Working example
- `docs/Clarity-Output-Base.md` - Report template

### **Test Commands:**

```bash
# Check working directory
pwd
# Should be: /Users/Larry/Documents/agent-girl/v3-fin-nav

# Test clasp
clasp push --dry-run

# View current deployments
clasp deployments

# Open production URL
open https://script.google.com/macros/s/AKfycbwRWkym_TzkbX5jULJJ0PKc0rqtuvdUjqM6rVhTdeL_0egXidur3LZZURnImiqYc6w/exec
```

### **Question Count by Page:**
- Page 1: 10 (Demographics)
- Page 2: 11 (Money Flow)
- Page 3: 11 (Obligations)
- Page 4: 11 (Growth)
- Page 5: 9 (Protection + Psych)
- **Total: 52**

---

## 💡 Pro Tips

1. **Build incrementally** - Don't code all 5 pages then test. Build one page, test, commit, repeat.

2. **Reference Tool 1** - It's a working implementation. Copy patterns liberally.

3. **Use TOOL2-QUESTION-MASTER-LIST.md** - Copy-paste scale labels exactly.

4. **Test adaptive logic separately** - Make sure you can query Tool 1 data before building Page 5.

5. **Start with simple scoring** - Get basic calculation working, refine later.

6. **Minimal viable report** - Don't over-engineer on first pass. Get something working, iterate.

7. **Commit often** - After each page, commit to git. Makes debugging easier.

8. **Use Logger.log()** - For debugging scoring and adaptive logic.

---

## 🎯 Estimated Timeline

| Phase | Task | Time | Cumulative |
|-------|------|------|------------|
| 1 | Review & Prepare | 15 min | 15 min |
| 2 | Page 1: Demographics | 30 min | 45 min |
| 3 | Page 2: Money Flow | 40 min | 1h 25m |
| 4 | Page 3: Obligations | 40 min | 2h 5m |
| 5 | Page 4: Growth | 40 min | 2h 45m |
| 6 | Page 5: Protection + Psych | 70 min | 4h |
| 7 | Scoring Logic | 90 min | 5h 30m |
| 8 | Report Generation | 60 min | 6h 30m |
| 9 | Testing | 30 min | 7h |
| 10 | Deploy | 15 min | 7h 15m |

**Total:** ~7 hours (conservative estimate)
**Realistic:** 4-6 hours with focused work

---

## ❓ Troubleshooting

**Issue: Pre-fill not working**
- Check `DataService.getToolResponse(clientId, 'tool1')` is accessible
- Verify Tool 1 was completed
- Check data structure matches expected format

**Issue: Adaptive questions not showing**
- Verify Tool 1 results are being retrieved
- Check trauma score threshold (currently > 5)
- Add Logger.log() to debug trauma scores
- Ensure graceful fallback if Tool 1 unavailable

**Issue: Scoring feels wrong**
- Double-check question name mappings
- Verify scale direction (negative = struggle)
- Test with known values
- Log intermediate calculations

**Issue: Report not generating**
- Check all required data is present
- Verify no undefined values in template
- Look for HTML syntax errors
- Test report HTML separately

---

**Ready to implement!** 🚀

**Last Updated:** November 4, 2024, 11:15 PM
