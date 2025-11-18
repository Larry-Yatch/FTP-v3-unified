# Grounding Tools Implementation Plan
## Tools 3, 5, and 7 - Complete Build Strategy

**Created:** November 17, 2025
**Version:** 1.0
**Status:** Ready for Implementation
**Estimated Total Time:** 80-100 hours (2-3 weeks)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Grounding Utilities Foundation](#phase-1-grounding-utilities-foundation)
4. [Phase 2: Tool 3 Core Implementation](#phase-2-tool-3-core-implementation)
5. [Phase 3: GPT Integration & Progressive Chaining](#phase-3-gpt-integration--progressive-chaining)
6. [Phase 4: Testing & Validation](#phase-4-testing--validation)
7. [Phase 5: Tools 5 & 7 Cloning](#phase-5-tools-5--7-cloning)
8. [Phase 6: Cross-Tool Testing](#phase-6-cross-tool-testing)
9. [Phase 7: Production Deployment](#phase-7-production-deployment)
10. [Success Criteria](#success-criteria)
11. [Risk Mitigation](#risk-mitigation)

---

## 🎯 Executive Summary

### Objective
Build three grounding tools (Tool 3, 5, 7) using a shared utility foundation, following the proven Tool 2 pattern with GPT integration from day one.

### Strategy
1. **Build Foundation First:** Create 5 reusable grounding utilities
2. **Validate with Tool 3:** Implement and thoroughly test first tool
3. **Clone for Scale:** Replicate proven pattern to Tools 5 & 7
4. **Test Together:** Ensure all 3 tools work harmoniously

### Key Principles
- ✅ **Testable at every step** - No big heroic coding sessions
- ✅ **Reusability first** - Shared utilities reduce duplication
- ✅ **Follow proven patterns** - Tool 2 established the blueprint
- ✅ **GPT from day one** - Background processing during form completion

---

## 🏗️ Architecture Overview

### File Structure

```
/Users/Larry/code/FTP-v3/
├── core/
│   ├── FormUtils.js (existing)
│   ├── DataService.js (existing)
│   ├── ToolRegistry.js (existing)
│   └── CONFIG.js (existing - will extend)
│
├── shared/
│   ├── grounding/
│   │   ├── GroundingFormBuilder.js (NEW)
│   │   ├── GroundingScoring.js (NEW)
│   │   ├── GroundingGPT.js (NEW)
│   │   ├── GroundingReport.js (NEW)
│   │   └── GroundingFallbacks.js (NEW)
│
├── tools/
│   ├── tool3/
│   │   ├── Tool3.js (NEW)
│   │   ├── Tool3Report.js (NEW)
│   │   └── tool3.manifest.json (NEW)
│   │
│   ├── tool5/
│   │   ├── Tool5.js (NEW)
│   │   ├── Tool5Report.js (NEW)
│   │   └── tool5.manifest.json (NEW)
│   │
│   └── tool7/
│       ├── Tool7.js (NEW)
│       ├── Tool7Report.js (NEW)
│       └── tool7.manifest.json (NEW)
│
└── docs/
    ├── GROUNDING-TOOLS-IMPLEMENTATION-PLAN.md (this file)
    ├── Tool3/ (existing content docs)
    ├── testing/
    │   ├── grounding-utilities-tests.md (NEW)
    │   └── grounding-tools-e2e-tests.md (NEW)
    └── PROJECT-STATUS.md (will update)
```

### Technology Stack
- **Platform:** Google Apps Script
- **Storage:** Google Sheets (RESPONSES, CrossToolInsights)
- **AI:** OpenAI GPT-4o-mini (subdomain analysis) + GPT-4o (synthesis)
- **Pattern:** Multi-page forms with progressive GPT chaining
- **Testing:** Manual E2E + Unit tests for scoring logic

### Data Flow

```
Student completes subdomain page
  ↓
Tool3.savePageData() → Store in PropertiesService
  ↓
Tool3.triggerBackgroundGPT() → GroundingGPT.analyzeSubdomain()
  ↓
  → Try GPT call (subdomain analysis)
  → On failure: GroundingFallbacks.getSubdomainFallback()
  ↓
Store result in PropertiesService (keyed by clientId + toolId)
  ↓
Student continues to next page (no blocking wait)
  ↓
[Repeat for all 6 subdomains]
  ↓
Student submits final page
  ↓
Tool3.processFinalSubmission()
  ↓
  → Check for missing subdomain analyses, run if needed
  → GroundingGPT.synthesizeDomain() × 2 (Domain 1, Domain 2)
  → GroundingGPT.synthesizeOverall() × 1 (Overall tool)
  ↓
Save to RESPONSES sheet with complete scoring + GPT insights
  ↓
Generate report → Tool3Report.render()
```

---

## 📦 Phase 1: Grounding Utilities Foundation

**Estimated Time:** 20-24 hours
**Goal:** Build 5 reusable utilities that all 3 tools will share

### Deliverables

#### 1.1: GroundingFormBuilder.js (6 hours)

**Purpose:** Render subdomain pages with 4 scale questions + 1 open response

**API Specification:**

```javascript
const GroundingFormBuilder = {
  /**
   * Render a subdomain page (5 questions: 4 scales + 1 open response)
   * @param {Object} config
   * @param {string} config.toolId - 'tool3', 'tool5', 'tool7'
   * @param {string} config.clientId - Student ID
   * @param {number} config.pageNumber - 2-7 (page 1 is intro)
   * @param {Object} config.subdomain - Subdomain metadata
   * @param {Object} config.existingData - Pre-filled data from draft
   * @returns {string} HTML page
   */
  renderSubdomainPage(config) { ... },

  /**
   * Render intro page (page 1)
   */
  renderIntroPage(config) { ... },

  /**
   * Build scale question HTML (-3 to +3 radio buttons)
   */
  buildScaleQuestion(question) { ... },

  /**
   * Build open response textarea
   */
  buildOpenResponse(question) { ... }
};
```

**Key Features:**
- Pre-fills form from draft data (resume functionality)
- Uses FormUtils.buildStandardPage() for wrapper
- Includes FeedbackWidget automatically
- Handles -3 to +3 scales (6 options, no zero)
- Multi-line textarea for open responses

**Testing Checkpoint:**
```javascript
function testGroundingFormBuilder() {
  const testConfig = {
    toolId: 'tool3',
    clientId: 'TEST001',
    pageNumber: 2,
    subdomain: {
      key: 'fsv_not_worthy',
      title: "I'm Not Worthy of Financial Freedom",
      questions: { /* ... */ }
    },
    existingData: {}
  };

  const html = GroundingFormBuilder.renderSubdomainPage(testConfig);
  Logger.log(html.length > 1000 ? 'PASS' : 'FAIL');
}
```

---

#### 1.2: GroundingScoring.js (8 hours)

**Purpose:** Calculate all 4 levels of quotients + gap analysis

**API Specification:**

```javascript
const GroundingScoring = {
  /**
   * Normalize raw score (-3 to +3) to problem score (0-100)
   * @param {number} rawScore - Value from -3 to +3
   * @returns {number} Normalized score 0-100 (higher = more problems)
   */
  normalizeScore(rawScore) {
    // ((3 - rawScore) / 6) * 100
    // -3 → 100 (worst), +3 → 0 (best)
    return ((3 - rawScore) / 6) * 100;
  },

  /**
   * Calculate all scores for a tool submission
   * @param {Object} responses - All form responses (24 scale + 6 open)
   * @param {Object} toolConfig - Tool configuration (domains, subdomains)
   * @returns {Object} Complete scoring hierarchy
   */
  calculateAllScores(responses, toolConfig) {
    return {
      aspects: this._calculateAspectScores(responses, toolConfig),
      subdomains: this._calculateSubdomainQuotients(responses, toolConfig),
      domains: this._calculateDomainQuotients(responses, toolConfig),
      overall: this._calculateOverallQuotient(responses, toolConfig),
      gaps: this._analyzeGaps(responses, toolConfig)
    };
  },

  /**
   * Analyze gaps (subdomain and domain level)
   * @returns {Object} Gap analysis with classifications
   */
  _analyzeGaps(responses, toolConfig) {
    return {
      subdomain: {
        domain1: this._analyzeSubdomainGap('domain1', ...),
        domain2: this._analyzeSubdomainGap('domain2', ...)
      },
      domain: this._analyzeDomainGap(...)
    };
  },

  /**
   * Analyze subdomain gap within a domain
   * @returns {Object} { highest, highestScore, gap, pattern }
   */
  _analyzeSubdomainGap(domainKey, subdomainQuotients) {
    const highest = this._findHighest(subdomainQuotients);
    const average = this._calculateAverage(subdomainQuotients);
    const gap = highest.value - average;

    return {
      highest: highest.key,
      highestScore: highest.value,
      averageScore: average,
      gap: gap,
      pattern: gap < 5 ? 'DIFFUSE' : (gap <= 15 ? 'FOCUSED' : 'HIGHLY FOCUSED')
    };
  },

  /**
   * Compare belief vs behavior scores
   * @returns {string} 'BELIEF_DRIVES_BEHAVIOR' | 'BEHAVIOR_WITHOUT_BELIEF' | 'BELIEF_WITHOUT_MANIFESTATION'
   */
  analyzeBeliefBehaviorMapping(beliefScore, behaviorScore) {
    if (beliefScore >= 60 && behaviorScore >= 60) return 'BELIEF_DRIVES_BEHAVIOR';
    if (behaviorScore >= 60 && beliefScore < 40) return 'BEHAVIOR_WITHOUT_BELIEF';
    if (beliefScore >= 60 && behaviorScore < 40) return 'BELIEF_WITHOUT_MANIFESTATION';
    return 'MODERATE';
  }
};
```

**Data Structures:**

```javascript
// Example scoring output
{
  aspects: {
    'fsv_not_worthy': {
      belief: 83.33,      // Raw -2 → 83.33/100
      behavior: 66.67,    // Raw -1 → 66.67/100
      feeling: 100.0,     // Raw -3 → 100/100
      consequence: 50.0   // Raw 0 → N/A (no zero in our scale!)
    },
    // ... 5 more subdomains
  },
  subdomains: {
    'fsv_not_worthy': 75.0,  // Average of 4 aspects
    // ... 5 more
  },
  domains: {
    'fsv': 68.5,    // Average of 3 subdomains
    'exval': 42.0   // Average of 3 subdomains
  },
  overall: 55.25,   // Average of 2 domains
  gaps: {
    subdomain: {
      domain1: {
        highest: 'fsv_not_worthy',
        highestScore: 75.0,
        averageScore: 68.5,
        gap: 6.5,
        pattern: 'FOCUSED'
      },
      domain2: { ... }
    },
    domain: {
      highest: 'fsv',
      highestScore: 68.5,
      averageScore: 55.25,
      gap: 13.25,
      pattern: 'FOCUSED'
    }
  }
}
```

**Testing Checkpoint:**
```javascript
function testGroundingScoring() {
  // Test normalization
  assert(GroundingScoring.normalizeScore(-3) === 100);
  assert(GroundingScoring.normalizeScore(+3) === 0);
  assert(GroundingScoring.normalizeScore(0) === 50);

  // Test full scoring
  const mockResponses = { /* 24 scale responses */ };
  const mockConfig = { /* Tool 3 config */ };
  const scores = GroundingScoring.calculateAllScores(mockResponses, mockConfig);

  assert(scores.overall >= 0 && scores.overall <= 100);
  assert(scores.gaps.domain.pattern in ['DIFFUSE', 'FOCUSED', 'HIGHLY FOCUSED']);
}
```

---

#### 1.3: GroundingGPT.js (6 hours)

**Purpose:** GPT analysis with 9-call progressive chaining

**API Specification:**

```javascript
const GroundingGPT = {
  /**
   * Analyze single subdomain (called 6x during form completion)
   * @param {Object} params
   * @param {string} params.clientId
   * @param {string} params.toolId
   * @param {string} params.subdomainKey
   * @param {Object} params.subdomainData - {belief, behavior, feeling, consequence, openResponse}
   * @param {Object} params.previousInsights - Insights from earlier subdomains
   * @returns {Object} {pattern, insight, action, source, timestamp}
   */
  analyzeSubdomain(params) {
    try {
      const prompt = this._buildSubdomainPrompt(params);
      const response = this._callGPT({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 300
      });

      const parsed = this._parseSubdomainResponse(response);

      if (this._isValidInsight(parsed)) {
        return { ...parsed, source: 'gpt', timestamp: new Date().toISOString() };
      }
      throw new Error('Invalid GPT response');

    } catch (error) {
      Logger.log(`GPT failed for ${params.subdomainKey}: ${error}`);
      // Fallback handled by caller
      throw error;
    }
  },

  /**
   * Synthesize domain analysis (called 2x at final submission)
   */
  synthesizeDomain(params) {
    // params: { clientId, toolId, domainKey, subdomainInsights, domainScore, gapAnalysis }
    const prompt = this._buildDomainSynthesisPrompt(params);
    // Similar structure to analyzeSubdomain
  },

  /**
   * Synthesize overall tool analysis (called 1x at final submission)
   */
  synthesizeOverall(params) {
    // params: { clientId, toolId, domainInsights, overallScore, domainGap }
    const prompt = this._buildOverallSynthesisPrompt(params);
    // Returns: { summary, topPatterns, priorityActions }
  },

  /**
   * Call OpenAI API
   */
  _callGPT({ systemPrompt, userPrompt, model, temperature, maxTokens }) {
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      payload: JSON.stringify({
        model, temperature, max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());
    if (json.error) throw new Error(json.error.message);
    return json.choices[0].message.content;
  },

  /**
   * Build prompt for subdomain analysis
   */
  _buildSubdomainPrompt(params) {
    return {
      system: `You are analyzing the subdomain "${params.subdomainKey}" for a financial trauma assessment.

The student scored:
- Belief: ${params.subdomainData.belief}/100 (higher = stronger problem)
- Behavior: ${params.subdomainData.behavior}/100
- Feeling: ${params.subdomainData.feeling}/100
- Consequence: ${params.subdomainData.consequence}/100

They wrote: "${params.subdomainData.openResponse}"

${params.previousInsights ? 'Context from earlier subdomains:\n' + JSON.stringify(params.previousInsights) : ''}

Analyze their pattern and provide:
1. Pattern: One sentence identifying the key pattern
2. Insight: One sentence about what this means
3. Action: One specific, actionable step

Return plain text in this format:

Pattern:
[one sentence]

Insight:
[one sentence]

Action:
[one specific step]`,

      user: `Analyze this subdomain for the student.`
    };
  }
};
```

**Testing Checkpoint:**
```javascript
function testGroundingGPT() {
  const mockParams = {
    clientId: 'TEST001',
    toolId: 'tool3',
    subdomainKey: 'fsv_not_worthy',
    subdomainData: {
      belief: 83.33,
      behavior: 66.67,
      feeling: 100.0,
      consequence: 50.0,
      openResponse: 'I always feel like I don\'t deserve to have money...'
    },
    previousInsights: {}
  };

  const result = GroundingGPT.analyzeSubdomain(mockParams);
  assert(result.pattern.length > 10);
  assert(result.insight.length > 10);
  assert(result.action.length > 10);
  assert(result.source === 'gpt');
}
```

---

#### 1.4: GroundingFallbacks.js (4 hours)

**Purpose:** Subdomain-specific fallbacks when GPT fails

**API Specification:**

```javascript
const GroundingFallbacks = {
  /**
   * Get fallback insight for a subdomain
   * @param {string} toolId - 'tool3', 'tool5', 'tool7'
   * @param {string} subdomainKey - e.g., 'fsv_not_worthy'
   * @param {Object} subdomainData - Scores and open response
   * @param {Object} domainScores - For context
   * @returns {Object} {pattern, insight, action}
   */
  getSubdomainFallback(toolId, subdomainKey, subdomainData, domainScores) {
    const fallbackKey = `${toolId}_${subdomainKey}`;

    if (this.fallbacks[fallbackKey]) {
      return this.fallbacks[fallbackKey](subdomainData, domainScores);
    }

    return this.getGenericFallback(subdomainData);
  },

  /**
   * Fallback definitions (18 total: 6 subdomains × 3 tools)
   */
  fallbacks: {
    'tool3_fsv_not_worthy': (data, scores) => {
      const avgScore = (data.belief + data.behavior + data.feeling + data.consequence) / 4;

      if (avgScore >= 70) {
        return {
          pattern: "You experience strong feelings of unworthiness around financial freedom, leading to avoidance and scattered resources.",
          insight: "This belief creates a self-fulfilling cycle where avoiding finances reinforces the sense that you're not capable of managing them.",
          action: "This week, spend 5 minutes looking at one financial account without judgment—just observe what's there."
        };
      } else if (avgScore >= 40) {
        return {
          pattern: "You sometimes struggle with feelings that financial freedom isn't for you, which occasionally shows up in avoidance.",
          insight: "These patterns are present but not dominant—you have moments of both doubt and capability.",
          action: "Notice when avoidance shows up—what triggers it? Keep a simple log for 7 days."
        };
      } else {
        return {
          pattern: "You generally feel capable of achieving financial freedom and maintain awareness of your resources.",
          insight: "This subdomain is not a primary driver for you—your challenge may lie in other patterns.",
          action: "Continue your current practices of staying aware and organized with your finances."
        };
      }
    },

    // ... 17 more fallback functions for all subdomains across 3 tools
  },

  /**
   * Generic fallback when no specific one exists
   */
  getGenericFallback(subdomainData) {
    const avgScore = (subdomainData.belief + subdomainData.behavior +
                     subdomainData.feeling + subdomainData.consequence) / 4;
    return {
      pattern: `Your responses show ${avgScore >= 60 ? 'significant' : avgScore >= 40 ? 'moderate' : 'minimal'} engagement with this pattern.`,
      insight: "Building awareness in this area will support more confident financial decision-making.",
      action: "Take one small step this week to increase your understanding of this pattern in your life."
    };
  }
};
```

**Testing Checkpoint:**
```javascript
function testGroundingFallbacks() {
  const mockData = {
    belief: 75, behavior: 65, feeling: 80, consequence: 60,
    openResponse: 'test response'
  };
  const mockScores = { fsv: 70, exval: 45 };

  const fallback = GroundingFallbacks.getSubdomainFallback(
    'tool3', 'fsv_not_worthy', mockData, mockScores
  );

  assert(fallback.pattern.length > 20);
  assert(fallback.insight.length > 20);
  assert(fallback.action.length > 20);
}
```

---

#### 1.5: GroundingReport.js (6 hours)

**Purpose:** Generate multi-level reports with GPT insights

**API Specification:**

```javascript
const GroundingReport = {
  /**
   * Build complete HTML report
   * @param {Object} reportData - All scores, GPT insights, form data
   * @param {Object} toolConfig - Tool metadata
   * @returns {HtmlOutput}
   */
  render(reportData, toolConfig) {
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${toolConfig.name} Report</title>
        <?!= include('shared/styles') ?>
        <style>${this.getReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          ${this.buildHeader(reportData, toolConfig)}
          ${this.buildOverallScoreCard(reportData.scores.overall)}
          ${this.buildDomainScoreCards(reportData.scores.domains)}
          ${this.buildGapAnalysis(reportData.scores.gaps)}
          ${this.buildGPTSynthesis(reportData.gptInsights.overall)}
          ${this.buildSubdomainDetails(reportData.scores.subdomains, reportData.gptInsights.subdomains)}
          ${this.buildNextSteps(reportData)}
          ${this.buildNavigation(reportData.clientId, toolConfig.nextTool)}
        </div>
      </body>
      </html>
    `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /**
   * Build overall score card with visual gauge
   */
  buildOverallScoreCard(overallScore) {
    const interpretation = this._interpretScore(overallScore);
    return `
      <div class="score-card overall">
        <h2>Overall Pattern Strength</h2>
        <div class="score-gauge">
          <div class="score-fill" style="width: ${overallScore}%"></div>
        </div>
        <div class="score-value">${overallScore.toFixed(1)}/100</div>
        <p class="score-interpretation">${interpretation}</p>
      </div>
    `;
  },

  /**
   * Build subdomain detail cards with GPT insights
   */
  buildSubdomainDetails(subdomainScores, subdomainInsights) {
    let html = '<div class="subdomain-details"><h2>Subdomain Analysis</h2>';

    Object.entries(subdomainScores).forEach(([key, score]) => {
      const insight = subdomainInsights[key] || {};
      const sourceTag = insight.source === 'gpt'
        ? '<span class="source-tag gpt">✨ Personalized</span>'
        : '<span class="source-tag fallback">📋 General Guidance</span>';

      html += `
        <div class="subdomain-card">
          ${sourceTag}
          <h3>${this._formatSubdomainName(key)}</h3>
          <div class="subdomain-score">${score.toFixed(1)}/100</div>

          ${insight.pattern ? `
            <div class="insight-section">
              <strong>Pattern:</strong>
              <p>${insight.pattern}</p>
            </div>
          ` : ''}

          ${insight.insight ? `
            <div class="insight-section">
              <strong>Insight:</strong>
              <p>${insight.insight}</p>
            </div>
          ` : ''}

          ${insight.action ? `
            <div class="insight-section action">
              <strong>Your Next Step:</strong>
              <p>${insight.action}</p>
            </div>
          ` : ''}
        </div>
      `;
    });

    html += '</div>';
    return html;
  }
};
```

---

### Phase 1 Completion Checklist

- [ ] GroundingFormBuilder.js created and tested
- [ ] GroundingScoring.js created with all 4 levels + gap analysis
- [ ] GroundingGPT.js created with 9-call pattern
- [ ] GroundingFallbacks.js created with 18 subdomain fallbacks
- [ ] GroundingReport.js created with all report sections
- [ ] All utility test functions pass
- [ ] Documentation comments added to all methods
- [ ] Code pushed to repository
- [ ] **TIME CHECKPOINT:** 20-24 hours

---

## 🔨 Phase 2: Tool 3 Core Implementation

**Estimated Time:** 16-20 hours
**Goal:** Build Tool 3 using the utilities (NO GPT YET - just forms & scoring)

### 2.1: Tool3.js Main File (8 hours)

**File:** `/tools/tool3/Tool3.js`

**Structure:**

```javascript
const Tool3 = {
  manifest: null,  // Will be loaded from JSON

  /**
   * Main render method (called by Router)
   */
  render(params) {
    const clientId = params.client || params.clientId;
    const page = parseInt(params.page) || 1;

    // Get existing draft data
    const draftData = this.getExistingData(clientId);

    if (page === 1) {
      return this.renderIntroPage(clientId);
    } else if (page >= 2 && page <= 7) {
      return this.renderSubdomainPage(page, clientId, draftData);
    } else {
      throw new Error(`Invalid page: ${page}`);
    }
  },

  /**
   * Render intro page (page 1)
   */
  renderIntroPage(clientId) {
    return GroundingFormBuilder.renderIntroPage({
      toolId: 'tool3',
      clientId: clientId,
      toolName: 'Identity & Validation Grounding',
      description: 'Explore how you see yourself and how others\' opinions influence your financial decisions.',
      estimatedTime: '15-20 minutes',
      totalPages: 7,
      onContinue: 'navigateToPage2'
    });
  },

  /**
   * Render subdomain page (pages 2-7)
   */
  renderSubdomainPage(page, clientId, draftData) {
    const subdomainIndex = page - 2;  // 0-5
    const subdomain = this.getSubdomainConfig(subdomainIndex);

    return GroundingFormBuilder.renderSubdomainPage({
      toolId: 'tool3',
      clientId: clientId,
      pageNumber: page,
      subdomain: subdomain,
      existingData: draftData,
      isFinalPage: (page === 7)
    });
  },

  /**
   * Get subdomain configuration
   */
  getSubdomainConfig(index) {
    const subdomains = [
      {
        key: 'fsv_not_worthy',
        domain: 'fsv',
        title: "I'm Not Worthy of Financial Freedom",
        description: 'Unworthiness leads to avoidance and scattering',
        questions: this._getSubdomain1Questions()
      },
      {
        key: 'fsv_never_enough',
        domain: 'fsv',
        title: "I'll Never Have Enough",
        description: 'Believing "never enough" leads to selective attention',
        questions: this._getSubdomain2Questions()
      },
      // ... 4 more subdomains
    ];

    return subdomains[index];
  },

  /**
   * Get questions for subdomain 1
   */
  _getSubdomain1Questions() {
    return {
      belief: {
        text: "I'm not the kind of person who gets to have financial freedom",
        scale: [
          { value: -3, label: "Strongly agree - I'm absolutely certain financial freedom is not for someone like me" },
          { value: -2, label: "Agree - I believe financial freedom is for other kinds of people, not me" },
          { value: -1, label: "Slightly agree - I often feel like I'm not the type who gets financial freedom" },
          { value: +1, label: "Slightly disagree - I'm learning I can be the kind of person who has financial freedom" },
          { value: +2, label: "Disagree - I generally believe I can be someone who has financial freedom" },
          { value: +3, label: "Strongly disagree - I absolutely know I'm the kind of person who gets financial freedom" }
        ]
      },
      behavior: {
        text: "I avoid looking at my financial accounts and/or have money scattered across multiple places where I can't easily access it",
        scale: [ /* ... similar 6-point scale ... */ ]
      },
      feeling: { /* ... */ },
      consequence: { /* ... */ },
      openResponse: {
        text: "What specifically are you afraid you'd find or have to face if you looked at your finances clearly right now?",
        placeholder: "Take your time to reflect and write as much as feels true for you..."
      }
    };
  },

  /**
   * Save page data (called when user submits a page)
   */
  savePageData(clientId, page, formData) {
    const draftKey = `tool3_draft_${clientId}`;
    const existingData = this.getExistingData(clientId) || {};

    // Merge new data
    Object.assign(existingData, formData);
    existingData.lastPage = page;
    existingData.lastUpdate = new Date().toISOString();

    // Save to PropertiesService
    PropertiesService.getUserProperties().setProperty(
      draftKey,
      JSON.stringify(existingData)
    );

    Logger.log(`Tool 3 page ${page} data saved for ${clientId}`);
  },

  /**
   * Process final submission (called when user submits page 7)
   */
  processFinalSubmission(clientId, finalPageData) {
    try {
      // 1. Save final page
      this.savePageData(7, clientId, finalPageData);

      // 2. Get all data
      const allData = this.getExistingData(clientId);

      // 3. Calculate scores using GroundingScoring utility
      const scores = GroundingScoring.calculateAllScores(allData, this.getToolConfig());

      // 4. Save to RESPONSES sheet
      this.saveToResponses(clientId, allData, scores);

      // 5. Unlock next tool (Tool 4)
      ToolAccessControl.adminUnlockTool(
        clientId,
        'tool4',
        'system',
        'Auto-unlocked after Tool 3 completion'
      );

      // 6. Clean up draft
      PropertiesService.getUserProperties().deleteProperty(`tool3_draft_${clientId}`);

      // 7. Return report URL
      const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool3_report&client=${clientId}`;
      return { redirectUrl: reportUrl };

    } catch (error) {
      Logger.log(`Tool 3 submission error: ${error}`);
      throw error;
    }
  },

  /**
   * Save to RESPONSES sheet
   */
  saveToResponses(clientId, formData, scores) {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    sheet.appendRow([
      new Date().toISOString(),  // Timestamp
      clientId,                  // Client_ID
      'tool3',                   // Tool_ID
      JSON.stringify({           // Data
        formData: formData,
        scores: scores
      }),
      '1.0.0',                   // Version
      'COMPLETED'                // Status
    ]);
  },

  /**
   * Get existing draft data
   */
  getExistingData(clientId) {
    const draftKey = `tool3_draft_${clientId}`;
    const stored = PropertiesService.getUserProperties().getProperty(draftKey);
    return stored ? JSON.parse(stored) : {};
  },

  /**
   * Get tool configuration
   */
  getToolConfig() {
    return {
      toolId: 'tool3',
      domains: {
        fsv: {
          key: 'fsv',
          name: 'False Self-View',
          subdomains: ['fsv_not_worthy', 'fsv_never_enough', 'fsv_cant_see']
        },
        exval: {
          key: 'exval',
          name: 'External Validation',
          subdomains: ['exval_worth', 'exval_what_think', 'exval_prove']
        }
      }
    };
  }
};
```

---

### 2.2: Tool3Report.js (6 hours)

**File:** `/tools/tool3/Tool3Report.js`

```javascript
const Tool3Report = {
  /**
   * Render report for Tool 3
   */
  render(clientId) {
    try {
      const reportData = this.getReportData(clientId);

      if (!reportData) {
        return this.renderNotFound(clientId);
      }

      return GroundingReport.render(reportData, {
        toolId: 'tool3',
        name: 'Identity & Validation Grounding',
        nextTool: 'tool4',
        nextToolName: 'Next Assessment'
      });

    } catch (error) {
      Logger.log(`Tool 3 report error: ${error}`);
      return this.renderError(error);
    }
  },

  /**
   * Get report data from RESPONSES sheet
   */
  getReportData(clientId) {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find most recent Tool 3 entry
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      if (row[1] === clientId && row[2] === 'tool3') {
        const responseData = JSON.parse(row[3]);

        return {
          clientId: clientId,
          formData: responseData.formData,
          scores: responseData.scores,
          gptInsights: responseData.gptInsights || {},  // Will be empty for Phase 2
          timestamp: row[0]
        };
      }
    }

    return null;
  },

  /**
   * Render "not found" page
   */
  renderNotFound(clientId) {
    return HtmlService.createHtmlOutput(`
      <h1>Report Not Found</h1>
      <p>No Tool 3 results found for client ${clientId}</p>
      <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}">
        Return to Dashboard
      </a>
    `);
  }
};
```

---

### 2.3: Tool3 Manifest (2 hours)

**File:** `/tools/tool3/tool3.manifest.json`

```json
{
  "id": "tool3",
  "version": "1.0.0",
  "name": "Identity & Validation Grounding",
  "pattern": "grounding",
  "route": "tool3",
  "routes": ["/tool3"],
  "description": "Explore disconnection from self through false self-view and external validation patterns",
  "icon": "🪞",
  "estimatedTime": "15-20 minutes",
  "pages": 7,
  "dependencies": ["tool1", "tool2"],
  "unlocks": ["tool4"],
  "domains": [
    {
      "key": "fsv",
      "name": "False Self-View",
      "description": "Confusion and lack of clarity as primary mechanism"
    },
    {
      "key": "exval",
      "name": "External Validation",
      "description": "Misrepresentation and image management as primary mechanism"
    }
  ],
  "subdomains": [
    {
      "key": "fsv_not_worthy",
      "domain": "fsv",
      "name": "I'm Not Worthy of Financial Freedom",
      "page": 2
    },
    {
      "key": "fsv_never_enough",
      "domain": "fsv",
      "name": "I'll Never Have Enough",
      "page": 3
    },
    {
      "key": "fsv_cant_see",
      "domain": "fsv",
      "name": "I Can't See My Financial Reality",
      "page": 4
    },
    {
      "key": "exval_worth",
      "domain": "exval",
      "name": "Money Shows My Worth",
      "page": 5
    },
    {
      "key": "exval_what_think",
      "domain": "exval",
      "name": "What Will They Think?",
      "page": 6
    },
    {
      "key": "exval_prove",
      "domain": "exval",
      "name": "I Need to Prove Myself",
      "page": 7
    }
  ]
}
```

---

### 2.4: Register Tool 3 in Code.js (1 hour)

```javascript
// In Code.js - registerTools() function

// Load Tool 3 Manifest
try {
  const Tool3Manifest = JSON.parse(
    HtmlService.createHtmlOutputFromFile('tools/tool3/tool3.manifest').getContent()
  );

  Tool3.manifest = Tool3Manifest;

  ToolRegistry.register('tool3', Tool3, Tool3Manifest);

  Logger.log('Tool 3 registered successfully');

} catch (error) {
  Logger.log('Error registering Tool 3: ' + error);
}
```

---

### 2.5: Update Router.js (1 hour)

```javascript
// In Router.js - Add Tool 3 routes

case 'tool3':
  return Tool3.render(params);

case 'tool3_report':
  return Tool3Report.render(params.client || params.clientId);
```

---

### Phase 2 Completion Checklist

- [ ] Tool3.js created with all 6 subdomain question sets
- [ ] Tool3Report.js created (basic version without GPT)
- [ ] tool3.manifest.json created
- [ ] Tool 3 registered in Code.js
- [ ] Router.js updated with Tool 3 routes
- [ ] **Manual Test:** Can navigate through all 7 pages
- [ ] **Manual Test:** Form pre-fills from draft data
- [ ] **Manual Test:** Final submission calculates scores correctly
- [ ] **Manual Test:** Report displays all subdomain scores
- [ ] **Manual Test:** Tool 4 unlocks after completion
- [ ] **TIME CHECKPOINT:** 16-20 hours (36-44 hours total)

---

## 🤖 Phase 3: GPT Integration & Progressive Chaining

**Estimated Time:** 12-16 hours
**Goal:** Add GPT analysis with background processing

### 3.1: Background GPT Trigger in Tool3.js (4 hours)

Add to `Tool3.js`:

```javascript
// Add after savePageData() method

/**
 * Trigger background GPT analysis after page save
 */
triggerBackgroundGPTAnalysis(page, clientId, formData, allData) {
  // Only run GPT on subdomain pages (2-7), not intro (1)
  if (page < 2 || page > 7) return;

  const subdomainIndex = page - 2;
  const subdomain = this.getSubdomainConfig(subdomainIndex);

  // Extract subdomain data from formData
  const subdomainData = this._extractSubdomainData(formData, subdomain.key);

  if (!subdomainData.openResponse || subdomainData.openResponse.trim().length < 10) {
    Logger.log(`Skipping GPT for ${subdomain.key} - insufficient open response`);
    return;
  }

  // Get previous insights for context
  const previousInsights = this._getStoredGPTInsights(clientId);

  // Calculate scores for this subdomain
  const scores = this._calculateSubdomainScores(subdomainData);

  try {
    // Call GroundingGPT (with automatic fallback on failure)
    const insight = GroundingGPT.analyzeSubdomain({
      clientId: clientId,
      toolId: 'tool3',
      subdomainKey: subdomain.key,
      subdomainData: { ...subdomainData, ...scores },
      previousInsights: previousInsights
    });

    // Store insight
    this._storeGPTInsight(clientId, subdomain.key, insight);

    Logger.log(`✅ GPT analysis complete: ${subdomain.key} (source: ${insight.source})`);

  } catch (error) {
    // GPT failed, use fallback
    Logger.log(`⚠️ GPT failed for ${subdomain.key}, using fallback`);

    const fallback = GroundingFallbacks.getSubdomainFallback(
      'tool3',
      subdomain.key,
      { ...subdomainData, ...scores },
      {} // domain scores not yet calculated
    );

    fallback.source = 'fallback';
    fallback.timestamp = new Date().toISOString();
    fallback.error = error.toString();

    this._storeGPTInsight(clientId, subdomain.key, fallback);
  }
},

/**
 * Extract subdomain data from form submission
 */
_extractSubdomainData(formData, subdomainKey) {
  return {
    belief: parseInt(formData[`${subdomainKey}_belief`]),
    behavior: parseInt(formData[`${subdomainKey}_behavior`]),
    feeling: parseInt(formData[`${subdomainKey}_feeling`]),
    consequence: parseInt(formData[`${subdomainKey}_consequence`]),
    openResponse: formData[`${subdomainKey}_open`] || ''
  };
},

/**
 * Calculate scores for subdomain
 */
_calculateSubdomainScores(subdomainData) {
  return {
    beliefScore: GroundingScoring.normalizeScore(subdomainData.belief),
    behaviorScore: GroundingScoring.normalizeScore(subdomainData.behavior),
    feelingScore: GroundingScoring.normalizeScore(subdomainData.feeling),
    consequenceScore: GroundingScoring.normalizeScore(subdomainData.consequence),
    subdomainQuotient: GroundingScoring.normalizeScore(
      (subdomainData.belief + subdomainData.behavior +
       subdomainData.feeling + subdomainData.consequence) / 4
    )
  };
},

/**
 * Store GPT insight in PropertiesService
 */
_storeGPTInsight(clientId, subdomainKey, insight) {
  const storageKey = `tool3_gpt_${clientId}`;
  const existing = this._getStoredGPTInsights(clientId);
  existing[subdomainKey] = insight;

  PropertiesService.getUserProperties().setProperty(
    storageKey,
    JSON.stringify(existing)
  );
},

/**
 * Get stored GPT insights
 */
_getStoredGPTInsights(clientId) {
  const storageKey = `tool3_gpt_${clientId}`;
  const stored = PropertiesService.getUserProperties().getProperty(storageKey);
  return stored ? JSON.parse(stored) : {};
},
```

**Update `savePageData()` to trigger GPT:**

```javascript
savePageData(clientId, page, formData) {
  // Existing save logic
  const draftKey = `tool3_draft_${clientId}`;
  const existingData = this.getExistingData(clientId) || {};
  Object.assign(existingData, formData);
  existingData.lastPage = page;
  existingData.lastUpdate = new Date().toISOString();
  PropertiesService.getUserProperties().setProperty(
    draftKey,
    JSON.stringify(existingData)
  );

  // NEW: Trigger background GPT
  this.triggerBackgroundGPTAnalysis(page, clientId, formData, existingData);

  Logger.log(`Tool 3 page ${page} data saved for ${clientId}`);
},
```

---

### 3.2: Final Synthesis in processFinalSubmission() (4 hours)

Update `processFinalSubmission()` in `Tool3.js`:

```javascript
processFinalSubmission(clientId, finalPageData) {
  try {
    // 1. Save final page (triggers GPT for last subdomain)
    this.savePageData(7, clientId, finalPageData);

    // 2. Get all data
    const allData = this.getExistingData(clientId);

    // 3. Calculate scores
    const scores = GroundingScoring.calculateAllScores(allData, this.getToolConfig());

    // 4. Get GPT insights (may need to retry failed ones)
    const subdomainInsights = this._getStoredGPTInsights(clientId);
    const missingSubdomains = this._checkMissingInsights(subdomainInsights);

    if (missingSubdomains.length > 0) {
      Logger.log(`⚠️ Retrying ${missingSubdomains.length} missing insights`);
      missingSubdomains.forEach(key => {
        // Retry logic similar to triggerBackgroundGPTAnalysis
      });
    }

    // 5. Run domain syntheses (2 calls)
    const domainInsights = {
      fsv: this._synthesizeDomain('fsv', subdomainInsights, scores),
      exval: this._synthesizeDomain('exval', subdomainInsights, scores)
    };

    // 6. Run overall synthesis (1 call)
    const overallInsight = this._synthesizeOverall(domainInsights, scores);

    // 7. Package all GPT results
    const gptInsights = {
      subdomains: subdomainInsights,
      domains: domainInsights,
      overall: overallInsight
    };

    // 8. Save to RESPONSES sheet (including GPT insights)
    this.saveToResponses(clientId, allData, scores, gptInsights);

    // 9. Unlock next tool
    ToolAccessControl.adminUnlockTool(clientId, 'tool4', 'system',
      'Auto-unlocked after Tool 3 completion');

    // 10. Clean up PropertiesService
    PropertiesService.getUserProperties().deleteProperty(`tool3_draft_${clientId}`);
    PropertiesService.getUserProperties().deleteProperty(`tool3_gpt_${clientId}`);

    // 11. Return report URL
    const reportUrl = `${ScriptApp.getService().getUrl()}?route=tool3_report&client=${clientId}`;
    return { redirectUrl: reportUrl };

  } catch (error) {
    Logger.log(`Tool 3 submission error: ${error}`);
    throw error;
  }
},

/**
 * Synthesize domain insights
 */
_synthesizeDomain(domainKey, subdomainInsights, scores) {
  const domain = this.getToolConfig().domains[domainKey];
  const domainSubdomains = domain.subdomains.map(sk => subdomainInsights[sk]).filter(Boolean);

  try {
    return GroundingGPT.synthesizeDomain({
      clientId: this.currentClientId,
      toolId: 'tool3',
      domainKey: domainKey,
      domainName: domain.name,
      subdomainInsights: domainSubdomains,
      domainScore: scores.domains[domainKey],
      gapAnalysis: scores.gaps.subdomain[domainKey]
    });
  } catch (error) {
    Logger.log(`Domain synthesis failed for ${domainKey}: ${error}`);
    return this._getGenericDomainSynthesis(domainKey, scores.domains[domainKey]);
  }
},

/**
 * Synthesize overall insights
 */
_synthesizeOverall(domainInsights, scores) {
  try {
    return GroundingGPT.synthesizeOverall({
      clientId: this.currentClientId,
      toolId: 'tool3',
      domainInsights: domainInsights,
      overallScore: scores.overall,
      domainGap: scores.gaps.domain
    });
  } catch (error) {
    Logger.log(`Overall synthesis failed: ${error}`);
    return this._getGenericOverallSynthesis(scores.overall, scores.gaps.domain);
  }
}
```

---

### 3.3: Update Tool3Report.js to Display GPT Insights (2 hours)

The report should now automatically display GPT insights since `GroundingReport.render()` handles them. Just ensure the data structure is correct:

```javascript
// In Tool3Report.js - getReportData()

getReportData(clientId) {
  // ... existing code to fetch from RESPONSES sheet ...

  const responseData = JSON.parse(row[3]);

  return {
    clientId: clientId,
    formData: responseData.formData,
    scores: responseData.scores,
    gptInsights: {
      subdomains: responseData.gptInsights?.subdomains || {},
      domains: responseData.gptInsights?.domains || {},
      overall: responseData.gptInsights?.overall || {}
    },
    timestamp: row[0]
  };
}
```

---

### 3.4: Testing GPT Integration (2 hours)

Create test function:

```javascript
function testTool3GPTIntegration() {
  const testClientId = 'TEST_GPT_001';

  // Simulate completing pages 2-7
  for (let page = 2; page <= 7; page++) {
    const mockData = generateMockSubdomainData(page);
    Tool3.savePageData(testClientId, page, mockData);

    // Check that GPT insight was stored
    const insights = Tool3._getStoredGPTInsights(testClientId);
    const subdomainKey = Tool3.getSubdomainConfig(page - 2).key;

    if (!insights[subdomainKey]) {
      Logger.log(`FAIL: No insight for ${subdomainKey}`);
      return;
    }

    Logger.log(`PASS: Page ${page} - ${subdomainKey} - source: ${insights[subdomainKey].source}`);
  }

  // Test final submission
  const finalData = generateMockSubdomainData(7);
  const result = Tool3.processFinalSubmission(testClientId, finalData);

  Logger.log(`Final submission result: ${JSON.stringify(result)}`);
  Logger.log('✅ All GPT integration tests passed');
}

function generateMockSubdomainData(page) {
  const subdomain = Tool3.getSubdomainConfig(page - 2);
  return {
    [`${subdomain.key}_belief`]: -2,
    [`${subdomain.key}_behavior`]: -1,
    [`${subdomain.key}_feeling`]: -3,
    [`${subdomain.key}_consequence`]: 0,
    [`${subdomain.key}_open`]: 'This is a test response for GPT analysis. I struggle with financial confidence and often avoid looking at my accounts because I feel ashamed.'
  };
}
```

---

### Phase 3 Completion Checklist

- [ ] Background GPT trigger added to Tool3.js
- [ ] savePageData() updated to trigger GPT
- [ ] processFinalSubmission() updated with syntheses
- [ ] Domain synthesis logic implemented
- [ ] Overall synthesis logic implemented
- [ ] Tool3Report.js displays GPT insights
- [ ] Test function passes for all 6 subdomains
- [ ] **Manual Test:** GPT insights appear in report with "✨ Personalized" tag
- [ ] **Manual Test:** Fallbacks work when API key is invalid
- [ ] **Manual Test:** Overall synthesis connects patterns across domains
- [ ] **TIME CHECKPOINT:** 12-16 hours (48-60 hours total)

---

## ✅ Phase 4: Testing & Validation

**Estimated Time:** 8-12 hours
**Goal:** Comprehensive testing of Tool 3

### 4.1: Unit Tests (4 hours)

Create `/docs/testing/grounding-utilities-tests.md` with test results:

```markdown
# Grounding Utilities Test Results

## GroundingScoring Tests

### Test: normalizeScore()
- ✅ Input: -3 → Output: 100.0
- ✅ Input: -2 → Output: 83.33
- ✅ Input: -1 → Output: 66.67
- ✅ Input: +1 → Output: 33.33
- ✅ Input: +2 → Output: 16.67
- ✅ Input: +3 → Output: 0.0

### Test: calculateAllScores()
- ✅ Aspect scores calculated correctly (24 scores)
- ✅ Subdomain quotients calculated (6 quotients)
- ✅ Domain quotients calculated (2 quotients)
- ✅ Overall quotient calculated
- ✅ Gap analysis returns correct pattern classifications

## GroundingGPT Tests

### Test: analyzeSubdomain()
- ✅ Returns valid insight with pattern, insight, action
- ✅ Source marked as 'gpt'
- ✅ Timestamp included
- ✅ Handles API errors gracefully

### Test: synthesizeDomain()
- ✅ Combines multiple subdomain insights
- ✅ References gap analysis
- ✅ Returns coherent domain summary

### Test: synthesizeOverall()
- ✅ Connects both domains
- ✅ Identifies top patterns
- ✅ Provides priority actions

## GroundingFallbacks Tests

### Test: getSubdomainFallback()
- ✅ All 6 Tool 3 subdomains have fallbacks
- ✅ Fallbacks adapt to score levels (high/medium/low)
- ✅ Generic fallback works for unmapped subdomains
- ✅ All fallbacks return pattern, insight, action
```

---

### 4.2: E2E Tests (4 hours)

Create test document: `/docs/testing/tool3-e2e-tests.md`

**Test Cases:**

```markdown
# Tool 3 End-to-End Test Results

## Test 1: Happy Path (New Student)
**ClientID:** TEST_E2E_001

Steps:
1. Navigate to Tool 3 intro page → ✅ Displays correctly
2. Click "Start Assessment" → ✅ Navigates to page 2
3. Complete subdomain 1.1 (all 5 questions) → ✅ Submits successfully
4. Verify background GPT triggered → ✅ Insight stored in PropertiesService
5. Repeat for pages 3-7 → ✅ All pages work
6. Submit final page → ✅ Redirects to report
7. View report → ✅ All scores displayed
8. Check GPT insights → ✅ 6 subdomain insights + 2 domain + 1 overall
9. Verify Tool 4 unlocked → ✅ Appears on dashboard
10. Check RESPONSES sheet → ✅ Data saved correctly

**Result:** PASS ✅

---

## Test 2: Resume After Abandonment
**ClientID:** TEST_E2E_002

Steps:
1. Complete pages 1-4
2. Close browser (abandon)
3. Return to Tool 3 → ✅ Resumes at page 5
4. Verify pages 2-4 data pre-filled → ✅ All data present
5. Complete pages 5-7 → ✅ Submission successful
6. Check report → ✅ All data intact

**Result:** PASS ✅

---

## Test 3: GPT Failure Fallback
**ClientID:** TEST_E2E_003

Steps:
1. Temporarily set invalid API key
2. Complete all pages
3. Check PropertiesService → ✅ Fallback insights stored
4. View report → ✅ Insights show "📋 General Guidance" tag
5. Verify fallbacks are subdomain-specific → ✅ Not generic
6. Restore API key

**Result:** PASS ✅

---

## Test 4: Navigation (Back Button)
**ClientID:** TEST_E2E_004

Steps:
1. Complete page 2
2. Click "Back to Dashboard" → ✅ Navigates without error
3. Return to Tool 3 → ✅ Resumes at page 3
4. Data from page 2 preserved → ✅ Pre-filled

**Result:** PASS ✅

---

## Test 5: Scoring Accuracy
**ClientID:** TEST_E2E_005

Input: All responses = -3 (worst case)
Expected Overall Score: 100
Actual Overall Score: ___
Result: ___

Input: All responses = +3 (best case)
Expected Overall Score: 0
Actual Overall Score: ___
Result: ___

Input: Mixed responses (see detailed scoring doc)
Expected Subdomain Quotient: ___
Actual: ___
Result: ___

---

## Test 6: Gap Analysis
**ClientID:** TEST_E2E_006

Setup: Make subdomain 1.1 much higher than others
Expected: Gap pattern = "HIGHLY FOCUSED"
Actual: ___
Result: ___

---

## Test 7: Report Formatting
**ClientID:** TEST_E2E_007

Checklist:
- [ ] Overall score card displays
- [ ] Domain score cards display
- [ ] Gap analysis section displays
- [ ] GPT overall synthesis displays
- [ ] All 6 subdomain detail cards display
- [ ] Source tags correct (GPT vs fallback)
- [ ] "Next Steps" section displays
- [ ] Navigation buttons work
- [ ] Mobile responsive
- [ ] No console errors

**Result:** ___
```

---

### 4.3: Performance Testing (2 hours)

Test timing at each stage:

```markdown
# Tool 3 Performance Benchmarks

## Background GPT Timing
- Page 2 submission → GPT call → Page 3 load: ___ seconds (target: <3s)
- Page 3 submission → GPT call → Page 4 load: ___ seconds
- ... (test all pages)

**Average background GPT time:** ___ seconds
**User-perceived delay:** None (non-blocking)

## Final Submission Timing
- Submit page 7 → Domain syntheses (2 calls) → Report load: ___ seconds (target: <10s)

**Breakdown:**
- Domain 1 synthesis: ___ seconds
- Domain 2 synthesis: ___ seconds
- Overall synthesis: ___ seconds
- Data save: ___ seconds
- Report render: ___ seconds
- **Total:** ___ seconds

## API Cost per Student
- 6 subdomain analyses (gpt-4o-mini): ~300 tokens each × $0.00015/1K = $0.00027 each = $0.00162
- 2 domain syntheses (gpt-4o): ~500 tokens each × $0.0025/1K = $0.00125 each = $0.0025
- 1 overall synthesis (gpt-4o): ~600 tokens × $0.0025/1K = $0.0015
- **Total per student:** ~$0.0056 (target: <$0.01)

## Sheet Write Performance
- Draft saves (7 pages): ___ ms average
- Final RESPONSES write: ___ ms
- Tool unlock: ___ ms
```

---

### 4.4: Edge Case Testing (2 hours)

```markdown
# Edge Case Test Results

## Test: Minimal Open Responses
Input: Very short open responses (< 10 characters)
Expected: Skip GPT, use fallback immediately
Result: ___

## Test: Maximum Open Responses
Input: 5000 character open responses
Expected: GPT handles without error
Result: ___

## Test: Special Characters
Input: Open responses with emojis, quotes, line breaks
Expected: Properly escaped in JSON
Result: ___

## Test: Concurrent Users
Setup: 5 users simultaneously completing Tool 3
Expected: No data crossover, all complete successfully
Result: ___

## Test: PropertiesService Limits
Setup: Complete tool, leave draft data
Check: Draft cleaned up after submission
Result: ___

## Test: Invalid Input
Input: Non-numeric values for scale questions
Expected: Validation error
Result: ___
```

---

### Phase 4 Completion Checklist

- [ ] All unit tests documented and passing
- [ ] All 7 E2E test scenarios pass
- [ ] Performance benchmarks meet targets
- [ ] Edge cases handled gracefully
- [ ] Test documentation complete
- [ ] **DECISION POINT:** Is Tool 3 stable enough to clone?
- [ ] **TIME CHECKPOINT:** 8-12 hours (56-72 hours total)

---

## 📋 Phase 5: Tools 5 & 7 Cloning

**Estimated Time:** 12-16 hours
**Goal:** Replicate Tool 3 pattern for Tools 5 & 7

### 5.1: Clone Tool 3 → Tool 5 (6-8 hours)

**Strategy:** Copy Tool3.js → Tool5.js and replace content

Steps:
1. Copy `/tools/tool3/Tool3.js` → `/tools/tool5/Tool5.js`
2. Global find/replace: `Tool3` → `Tool5`, `tool3` → `tool5`
3. Update subdomain configurations (6 new subdomains from Tool 5 content doc)
4. Update question text for all 30 questions
5. Copy `/tools/tool3/Tool3Report.js` → `/tools/tool5/Tool5Report.js`
6. Update manifest: `tool3.manifest.json` → `tool5.manifest.json`
7. Register Tool 5 in Code.js
8. Add routes to Router.js

**New Tool 5 Subdomains:**
- Domain 1: Issues Showing Love
  - 1.1: "I Must Give to Be Loved"
  - 1.2: "Their Needs > My Needs"
  - 1.3: "I Can't Accept Help"
- Domain 2: Issues Receiving Love
  - 2.1: "I Can't Make It Alone"
  - 2.2: "I Owe Them Everything"
  - 2.3: "If They Stop Giving, I'm Abandoned"

**Testing Checklist (Tool 5):**
- [ ] All 7 pages render correctly
- [ ] Questions match Tool 5 content document
- [ ] Form submission works
- [ ] Background GPT triggers
- [ ] Final synthesis completes
- [ ] Report displays correctly
- [ ] Unlocks next tool (Tool 6)

---

### 5.2: Clone Tool 3 → Tool 7 (6-8 hours)

**Strategy:** Same as Tool 5

**New Tool 7 Subdomains:**
- Domain 1: Control Leading to Isolation
  - 1.1: "I Must Control Everything"
  - 1.2: "I Can't Trust Others"
  - 1.3: "Asking for Help Is Weakness"
- Domain 2: Fear Leading to Isolation
  - 2.1: "Everything Will Go Wrong"
  - 2.2: "Better the Devil I Know"
  - 2.3: "I Always Trust the Wrong People"

**Testing Checklist (Tool 7):**
- [ ] All 7 pages render correctly
- [ ] Questions match Tool 7 content document
- [ ] Form submission works
- [ ] Background GPT triggers
- [ ] Final synthesis completes
- [ ] Report displays correctly
- [ ] Unlocks next tool (Tool 8)

---

### 5.3: Update GroundingFallbacks.js (2 hours)

Add fallbacks for all 12 new subdomains (6 from Tool 5 + 6 from Tool 7):

```javascript
// In GroundingFallbacks.js - Add to fallbacks object

// TOOL 5 FALLBACKS
'tool5_isl_give_loved': (data, scores) => { /* ... */ },
'tool5_isl_needs': (data, scores) => { /* ... */ },
'tool5_isl_accept_help': (data, scores) => { /* ... */ },
'tool5_irl_alone': (data, scores) => { /* ... */ },
'tool5_irl_owe': (data, scores) => { /* ... */ },
'tool5_irl_abandoned': (data, scores) => { /* ... */ },

// TOOL 7 FALLBACKS
'tool7_cli_control': (data, scores) => { /* ... */ },
'tool7_cli_trust': (data, scores) => { /* ... */ },
'tool7_cli_weakness': (data, scores) => { /* ... */ },
'tool7_fli_wrong': (data, scores) => { /* ... */ },
'tool7_fli_devil': (data, scores) => { /* ... */ },
'tool7_fli_wrong_people': (data, scores) => { /* ... */ }
```

---

### Phase 5 Completion Checklist

- [ ] Tool 5 fully implemented
- [ ] Tool 5 tested (7 scenarios from Phase 4)
- [ ] Tool 7 fully implemented
- [ ] Tool 7 tested (7 scenarios from Phase 4)
- [ ] All 18 subdomain fallbacks added
- [ ] All 3 tools registered in ToolRegistry
- [ ] All routes added to Router.js
- [ ] **TIME CHECKPOINT:** 12-16 hours (68-88 hours total)

---

## 🧪 Phase 6: Cross-Tool Testing

**Estimated Time:** 6-8 hours
**Goal:** Ensure all 3 tools work together harmoniously

### 6.1: Sequential Flow Test (2 hours)

**Test:** Complete Tools 3 → 5 → 7 in sequence

```markdown
# Sequential Flow Test

**ClientID:** TEST_SEQ_001

1. Complete Tool 3
   - [ ] Completes successfully
   - [ ] Report displays
   - [ ] Tool 5 unlocked (if dependency chain allows)

2. Complete Tool 5
   - [ ] Starts fresh (no Tool 3 data crossover)
   - [ ] Completes successfully
   - [ ] Report displays
   - [ ] Tool 7 unlocked

3. Complete Tool 7
   - [ ] Starts fresh
   - [ ] Completes successfully
   - [ ] Report displays

4. Check RESPONSES sheet
   - [ ] 3 separate entries for TEST_SEQ_001
   - [ ] Each has complete data
   - [ ] No data corruption

**Result:** ___
```

---

### 6.2: Data Isolation Test (2 hours)

**Test:** Ensure tools don't interfere with each other

```markdown
# Data Isolation Test

## Test 1: Concurrent Drafts
1. Start Tool 3 (complete page 2-4)
2. Abandon and start Tool 5 (complete page 2-3)
3. Return to Tool 3 → ✅ Resumes at page 5
4. Return to Tool 5 → ✅ Resumes at page 4
5. Both drafts intact → ✅

## Test 2: GPT Insight Isolation
1. Complete Tool 3 (generates 9 GPT insights)
2. Start Tool 5
3. Check PropertiesService → ✅ Tool 3 insights cleaned up
4. Tool 5 insights separate → ✅

## Test 3: Report Data Isolation
1. Complete all 3 tools
2. View Tool 3 report → ✅ Shows only Tool 3 data
3. View Tool 5 report → ✅ Shows only Tool 5 data
4. View Tool 7 report → ✅ Shows only Tool 7 data
```

---

### 6.3: Performance at Scale (2 hours)

**Test:** Multiple users across all tools

```markdown
# Performance at Scale Test

## Setup
- 3 concurrent users
- Each user completes a different tool simultaneously

**User 1:** TEST_SCALE_001 → Tool 3
**User 2:** TEST_SCALE_002 → Tool 5
**User 3:** TEST_SCALE_003 → Tool 7

## Metrics
- Background GPT timing: ___
- Final synthesis timing: ___
- No PropertiesService conflicts → ✅
- All complete successfully → ✅
- RESPONSES sheet has 3 entries → ✅

## API Rate Limiting
- Total GPT calls: 27 (9 per tool × 3 users)
- Any rate limit errors: ___
- Fallback rate: ___% (target: <10%)
```

---

### 6.4: Shared Utility Validation (1 hour)

**Test:** Verify utilities work consistently across all 3 tools

```markdown
# Shared Utility Validation

## GroundingScoring
- Tool 3 scores calculated correctly → ✅
- Tool 5 scores calculated correctly → ✅
- Tool 7 scores calculated correctly → ✅
- Gap analysis consistent → ✅

## GroundingGPT
- Tool 3 GPT calls successful → ✅
- Tool 5 GPT calls successful → ✅
- Tool 7 GPT calls successful → ✅
- Progressive chaining works for all → ✅

## GroundingFallbacks
- All 18 subdomain fallbacks exist → ✅
- Fallbacks specific to each tool → ✅
- Generic fallback works → ✅

## GroundingReport
- Tool 3 reports render → ✅
- Tool 5 reports render → ✅
- Tool 7 reports render → ✅
- Consistent styling → ✅
```

---

### Phase 6 Completion Checklist

- [ ] Sequential flow test passes
- [ ] Data isolation verified
- [ ] Performance at scale acceptable
- [ ] Shared utilities validated
- [ ] No cross-tool contamination
- [ ] All reports display correctly
- [ ] **TIME CHECKPOINT:** 6-8 hours (74-96 hours total)

---

## 🚀 Phase 7: Production Deployment

**Estimated Time:** 6-8 hours
**Goal:** Deploy to production and monitor

### 7.1: Pre-Deployment Checklist (2 hours)

- [ ] All Phase 4 tests pass (Tool 3)
- [ ] All Phase 5 tests pass (Tools 5 & 7)
- [ ] All Phase 6 tests pass (cross-tool)
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Backup created of current production

---

### 7.2: Configuration (1 hour)

**Update CONFIG.js:**

```javascript
// In CONFIG.js - Add grounding tool configuration

CONFIG.GROUNDING = {
  // Scoring thresholds
  SCORING: {
    DIFFUSE_THRESHOLD: 5,
    FOCUSED_THRESHOLD: 15,
    HIGH_PROBLEM_THRESHOLD: 70,
    MODERATE_PROBLEM_THRESHOLD: 40
  },

  // GPT configuration
  GPT: {
    SUBDOMAIN_MODEL: 'gpt-4o-mini',
    SYNTHESIS_MODEL: 'gpt-4o',
    SUBDOMAIN_TEMPERATURE: 0.2,
    SYNTHESIS_TEMPERATURE: 0.3,
    SUBDOMAIN_MAX_TOKENS: 300,
    SYNTHESIS_MAX_TOKENS: 600
  },

  // Tool IDs
  TOOLS: ['tool3', 'tool5', 'tool7']
};
```

---

### 7.3: Deploy to Google Apps Script (1 hour)

```bash
# Push to Apps Script
clasp push

# Create versioned deployment
clasp deploy --description "v4.0.0 - Grounding Tools (3, 5, 7) Complete"

# Get deployment URL
clasp deployments

# Update deployment info
```

---

### 7.4: Production Testing (2 hours)

**Test with real OpenAI API key:**

```markdown
# Production Testing Checklist

## Tool 3
- [ ] Complete with real API key
- [ ] GPT insights personalized
- [ ] Report displays correctly
- [ ] Mobile responsive
- [ ] No console errors

## Tool 5
- [ ] Complete with real API key
- [ ] GPT insights personalized
- [ ] Report displays correctly

## Tool 7
- [ ] Complete with real API key
- [ ] GPT insights personalized
- [ ] Report displays correctly

## Monitoring
- [ ] Check API costs in OpenAI dashboard
- [ ] Verify <$0.01 per student
- [ ] Check GPT_FALLBACK_LOG sheet for errors
- [ ] Fallback rate <10%
```

---

### 7.5: Documentation Updates (2 hours)

Update project documentation:

**PROJECT-STATUS.md:**
```markdown
## Current Status (November 2025)

### ✅ Completed Tools
- Tool 1: Financial Trauma Assessment ✅
- Tool 2: Financial Clarity & Values ✅
- **Tool 3: Identity & Validation Grounding ✅ (NEW)**
- **Tool 5: Love & Connection Grounding ✅ (NEW)**
- **Tool 7: Security & Control Grounding ✅ (NEW)**

### 🏗️ Infrastructure
- Grounding utilities framework ✅
- GPT progressive chaining ✅
- 9-call analysis pattern ✅
- Shared fallback system ✅

### 📊 Statistics
- Total Tools: 5 (was 2)
- Total Questions: 287 (was 170)
- Average Completion Time: 15-20 min per grounding tool
- GPT Cost per Student: ~$0.015 (Tools 2, 3, 5, 7 combined)
- Test Coverage: 95%
```

**REFACTORING-CLOSEOUT.md:**
```markdown
## v4.0.0 - Grounding Tools Suite (November 2025)

### New Utilities (5)
- GroundingFormBuilder.js
- GroundingScoring.js
- GroundingGPT.js
- GroundingFallbacks.js
- GroundingReport.js

### New Tools (3)
- Tool 3: Identity & Validation
- Tool 5: Love & Connection
- Tool 7: Security & Control

### Code Reuse
- 3 tools share 5 utilities
- ~70% code reuse vs. building separately
- Consistent UX across all grounding tools
```

---

### Phase 7 Completion Checklist

- [ ] Configuration updated
- [ ] Deployed to production
- [ ] Production tests pass
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Team notified
- [ ] Users can access all 3 tools
- [ ] **FINAL TIME CHECKPOINT:** 6-8 hours (80-104 hours total)

---

## ✅ Success Criteria

### Technical Success
- [ ] All 3 tools (3, 5, 7) deployed and functional
- [ ] 5 shared utilities working across tools
- [ ] GPT integration with <10% fallback rate
- [ ] <$0.01 cost per student per tool
- [ ] 95% test coverage maintained
- [ ] Zero data corruption or crossover
- [ ] Reports load in <10 seconds

### User Experience Success
- [ ] Form completion rate >90%
- [ ] Users find insights valuable (qualitative feedback)
- [ ] Mobile experience smooth
- [ ] No navigation issues
- [ ] Resume functionality works reliably
- [ ] Clear "what to do next" guidance in reports

### Development Success
- [ ] Total build time 80-100 hours (as estimated)
- [ ] Utilities reused successfully (avoided duplication)
- [ ] Pattern established for future grounding tools
- [ ] Documentation comprehensive
- [ ] Team can maintain and extend

---

## 🔧 Risk Mitigation

### Risk 1: GPT API Failures
**Probability:** Medium
**Impact:** Low (fallbacks exist)
**Mitigation:** 3-tier fallback system already implemented

### Risk 2: PropertiesService Limits
**Probability:** Low
**Impact:** High (data loss)
**Mitigation:**
- Clean up drafts after submission
- Monitor PropertiesService usage
- Implement data size limits

### Risk 3: Performance Degradation
**Probability:** Low
**Impact:** Medium (user frustration)
**Mitigation:**
- Background GPT processing (non-blocking)
- Optimize Sheet writes
- Cache tool configurations

### Risk 4: Scope Creep
**Probability:** High
**Impact:** High (timeline)
**Mitigation:**
- Stick to plan phases
- No new features during build
- Log enhancement ideas for v4.1

### Risk 5: Testing Fatigue
**Probability:** Medium
**Impact:** High (bugs in production)
**Mitigation:**
- Phase-by-phase testing
- Automated test scripts where possible
- Required sign-offs at each phase

---

## 📅 Implementation Timeline

| Phase | Description | Hours | Cumulative | Calendar Days* |
|-------|-------------|-------|------------|----------------|
| 1 | Grounding Utilities Foundation | 20-24 | 20-24 | 3-4 days |
| 2 | Tool 3 Core Implementation | 16-20 | 36-44 | +2-3 days |
| 3 | GPT Integration | 12-16 | 48-60 | +2 days |
| 4 | Testing & Validation | 8-12 | 56-72 | +1-2 days |
| 5 | Tools 5 & 7 Cloning | 12-16 | 68-88 | +2 days |
| 6 | Cross-Tool Testing | 6-8 | 74-96 | +1 day |
| 7 | Production Deployment | 6-8 | 80-104 | +1 day |

**Total Estimated Time:** 80-104 hours
**Total Calendar Time:** 12-15 days (at 6-8 hours/day)

*Assumes dedicated focus with minimal context switching

---

## 🎯 Next Steps After Completion

1. **Monitor for 1 week:**
   - Track fallback rates
   - Monitor API costs
   - Gather user feedback
   - Watch for errors

2. **Iterate if needed:**
   - Refine fallback text based on feedback
   - Adjust GPT prompts if insights too generic
   - Fix any bugs discovered

3. **Plan Tool 4, 6, 8:**
   - Tool 4: Next assessment (non-grounding)
   - Tool 6: Next assessment (non-grounding)
   - Tool 8+: Additional assessments

4. **Consider enhancements:**
   - Cross-tool insights (how Tool 3 informs Tool 4)
   - Longitudinal tracking (retake tools, show growth)
   - Coach dashboard (aggregate insights across students)

---

**END OF IMPLEMENTATION PLAN**

*This plan is a living document. Update as you progress through phases.*
