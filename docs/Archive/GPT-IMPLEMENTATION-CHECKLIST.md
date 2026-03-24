# GPT Integration Implementation Checklist

**Version:** 1.0
**Date:** November 5, 2025
**Tool:** Tool 2 (Financial Clarity & Values Assessment)
**Estimated Time:** 6-8 hours

---

## 📋 Overview

This checklist provides step-by-step instructions for implementing GPT analysis in Tool 2, following the patterns documented in `GPT-IMPLEMENTATION-GUIDE.md`.

**Strategy:** Background processing during form + 3-tier fallback system
**Expected Cost:** ~$0.023 per student
**Expected Speed:** 3 second report generation

---

## ✅ Pre-Implementation Checklist

Before starting implementation:

- [ ] Read `GPT-IMPLEMENTATION-GUIDE.md` completely
- [ ] Review `tool2-implementation-tracker.md` (current Tool 2 status)
- [ ] Confirm OpenAI API key is in Script Properties
- [ ] Verify Tool 2 has all 57 questions implemented
- [ ] Verify Tool 2 scoring logic is working
- [ ] Verify Tool 2 report displays correctly (without GPT)
- [ ] Create git branch: `git checkout -b tool2-gpt-integration`

---

## 📂 STEP 1: Create Tool2Fallbacks.js File

**Time:** 2 hours
**Difficulty:** Medium
**Purpose:** Hard-coded fallbacks for when GPT fails

### 1.1 Create File

```bash
cd /Users/Larry/code/Financial-TruPath-v3
touch tools/tool2/Tool2Fallbacks.js
```

### 1.2 Implement File Structure

```javascript
/**
 * Tool2Fallbacks.js
 * Domain-specific fallback insights when GPT analysis fails
 * These are NOT generic - they're tailored to each financial domain
 */

const Tool2Fallbacks = {

  /**
   * Get fallback insight based on domain scores
   * @param {string} responseType - Type of response (income_sources, major_expenses, etc.)
   * @param {object} formData - All form data
   * @param {object} domainScores - Calculated domain scores (0-100%)
   * @returns {object} Fallback insight {pattern, insight, action}
   */
  getFallbackInsight(responseType, formData, domainScores) {
    const fallbacks = {
      income_sources: {
        pattern: this.getIncomePattern(formData.q18_income_sources, domainScores),
        insight: this.getIncomeInsight(formData.q18_income_sources, domainScores),
        action: this.getIncomeAction(formData.q18_income_sources, domainScores)
      },
      major_expenses: {
        pattern: this.getExpensePattern(formData.q23_major_expenses, domainScores),
        insight: this.getExpenseInsight(formData.q23_major_expenses, domainScores),
        action: this.getExpenseAction(formData.q23_major_expenses, domainScores)
      },
      wasteful_spending: {
        pattern: this.getWastefulPattern(formData.q24_wasteful_spending, domainScores),
        insight: this.getWastefulInsight(formData.q24_wasteful_spending, domainScores),
        action: this.getWastefulAction(formData.q24_wasteful_spending, domainScores)
      },
      debt_list: {
        pattern: this.getDebtPattern(formData.q29_debt_list, domainScores),
        insight: this.getDebtInsight(formData.q29_debt_list, domainScores),
        action: this.getDebtAction(formData.q29_debt_list, domainScores)
      },
      investments: {
        pattern: this.getInvestmentPattern(formData.q43_investment_types, domainScores),
        insight: this.getInvestmentInsight(formData.q43_investment_types, domainScores),
        action: this.getInvestmentAction(formData.q43_investment_types, domainScores)
      },
      emotions: {
        pattern: this.getEmotionPattern(formData.q52_emotions, domainScores),
        insight: this.getEmotionInsight(formData.q52_emotions, domainScores),
        action: this.getEmotionAction(formData.q52_emotions, domainScores)
      },
      adaptive_trauma: {
        pattern: this.getTraumaPattern(formData, domainScores),
        insight: this.getTraumaInsight(formData, domainScores),
        action: this.getTraumaAction(formData, domainScores)
      }
    };

    return fallbacks[responseType] || this.getGenericFallback();
  },

  // ============================================================
  // INCOME SOURCES FALLBACKS (Q18)
  // ============================================================

  getIncomePattern(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;
    const responseLength = (response || '').length;

    if (responseLength < 50) {
      return "Your income structure appears straightforward with limited detail provided about income sources.";
    } else if (moneyFlowScore < 30) {
      return "Your income clarity score suggests there may be inconsistency or uncertainty in your income streams.";
    } else if (moneyFlowScore >= 60) {
      return "Your income clarity score indicates a solid understanding of your income sources and their reliability.";
    } else {
      return "Your income structure shows moderate clarity with room to strengthen your understanding of income patterns.";
    }
  },

  getIncomeInsight(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Building clarity around income is foundational to financial stability. Understanding exactly what comes in, when, and how reliably helps you plan with confidence.";
    } else if (moneyFlowScore >= 60) {
      return "Your strong income clarity creates a solid foundation for financial planning. This awareness allows you to make informed decisions about saving, spending, and investing.";
    } else {
      return "Increasing your income clarity will help reduce financial stress and enable more confident decision-making about your money.";
    }
  },

  getIncomeAction(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Create a simple income log for the next 30 days. Track every dollar that comes in, its source, and when you received it. This builds awareness and reveals patterns.";
    } else if (moneyFlowScore >= 60) {
      return "Review your income sources quarterly to identify opportunities for growth, diversification, or increased stability in your highest-earning streams.";
    } else {
      return "Set up a monthly income review ritual. Spend 15 minutes on the 1st of each month reviewing last month's income by source, noting any surprises or changes.";
    }
  },

  // ============================================================
  // TODO: Implement remaining fallback functions
  // Copy pattern from getIncomePattern/Insight/Action for:
  // - getExpensePattern/Insight/Action
  // - getWastefulPattern/Insight/Action
  // - getDebtPattern/Insight/Action
  // - getInvestmentPattern/Insight/Action
  // - getEmotionPattern/Insight/Action
  // - getTraumaPattern/Insight/Action
  // ============================================================
  // See GPT-IMPLEMENTATION-GUIDE.md for complete implementations

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  detectTraumaType(formData) {
    if (formData.q55a_fsv_hiding) return 'fsv';
    if (formData.q55b_control_anxiety) return 'control';
    if (formData.q55c_exval_influence) return 'exval';
    if (formData.q55d_fear_paralysis) return 'fear';
    if (formData.q55e_receiving_discomfort) return 'receiving';
    if (formData.q55f_showing_overserving) return 'showing';
    return 'control';  // Default
  },

  calculateAverageScore(scores) {
    const allScores = Object.values(scores).filter(s => typeof s === 'number');
    if (allScores.length === 0) return 50;
    return allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
  },

  getGenericFallback() {
    return {
      pattern: "Your responses reflect your current relationship with this aspect of your financial life.",
      insight: "Building awareness and clarity in this area will support more confident decision-making and reduced financial stress.",
      action: "Take one small step this week to increase your understanding or engagement with this financial domain."
    };
  }
};
```

### 1.3 Test Fallbacks

```javascript
// Test in Apps Script console
function testFallbacks() {
  const testData = {
    q18_income_sources: 'Full-time salary',
    q23_major_expenses: 'Rent, food, car'
  };

  const testScores = {
    moneyFlow: 45,
    obligations: 60,
    liquidity: 30,
    growth: 50,
    protection: 55
  };

  const income = Tool2Fallbacks.getFallbackInsight('income_sources', testData, testScores);
  Logger.log('Income Fallback:');
  Logger.log(`Pattern: ${income.pattern}`);
  Logger.log(`Insight: ${income.insight}`);
  Logger.log(`Action: ${income.action}`);
}
```

### 1.4 Checklist

- [ ] File created at `tools/tool2/Tool2Fallbacks.js`
- [ ] All 7 fallback types implemented (income, expenses, wasteful, debt, investments, emotions, trauma)
- [ ] Helper functions implemented (detectTraumaType, calculateAverageScore)
- [ ] Generic fallback implemented
- [ ] Test function runs successfully
- [ ] All fallbacks return pattern, insight, and action
- [ ] Commit: `git commit -m "feat: Add Tool2Fallbacks.js with domain-specific fallback insights"`

---

## 📂 STEP 2: Create Tool2GPTAnalysis.js File

**Time:** 2 hours
**Difficulty:** High
**Purpose:** GPT analysis functions with 3-tier fallback system

### 2.1 Create File

```bash
touch tools/tool2/Tool2GPTAnalysis.js
```

### 2.2 Implement Core Structure

```javascript
/**
 * Tool2GPTAnalysis.js
 * GPT-powered analysis for Tool 2 free-text responses
 * Implements 3-tier fallback: GPT → Retry → Fallback
 */

const Tool2GPTAnalysis = {

  /**
   * Analyze response with automatic 3-tier fallback
   * @param {object} params - Analysis parameters
   * @returns {object} Insight with source attribution
   */
  analyzeResponse({clientId, responseType, responseText, previousInsights, formData, domainScores}) {
    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Attempting GPT: ${clientId} - ${responseType}`);

      const systemPrompt = this.getPromptForType(responseType, previousInsights);
      const userPrompt = this.buildUserPrompt(responseText, previousInsights);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 300
      });

      const parsed = this.parseResponse(result);

      if (this.isValidInsight(parsed)) {
        Logger.log(`✅ [TIER 1] GPT success: ${responseType}`);
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response');
      }

    } catch (error) {
      Logger.log(`⚠️ [TIER 1] GPT failed: ${responseType} - ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Retrying GPT: ${clientId} - ${responseType}`);

        const systemPrompt = this.getPromptForType(responseType, previousInsights);
        const userPrompt = this.buildUserPrompt(responseText, previousInsights);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o-mini',
          temperature: 0.2,
          maxTokens: 300
        });

        const parsed = this.parseResponse(result);

        if (this.isValidInsight(parsed)) {
          Logger.log(`✅ [TIER 2] GPT retry success: ${responseType}`);
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`❌ [TIER 2] GPT retry failed: ${responseType} - ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Hard-coded Fallback
        // ============================================================
        Logger.log(`[TIER 3] Using fallback: ${responseType}`);

        const fallback = Tool2Fallbacks.getFallbackInsight(
          responseType,
          formData,
          domainScores
        );

        this.logFallbackUsage(clientId, responseType, retryError.message);

        return {
          ...fallback,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

  /**
   * Call OpenAI GPT API
   */
  callGPT({systemPrompt, userPrompt, model, temperature, maxTokens}) {
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in Script Properties');
    }

    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify({
        model,
        messages: [
          {role: 'system', content: systemPrompt},
          {role: 'user', content: userPrompt}
        ],
        temperature,
        max_tokens: maxTokens
      }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());

    if (json.error) {
      throw new Error(`OpenAI API Error: ${json.error.message}`);
    }

    return json.choices[0].message.content;
  },

  /**
   * Parse plain-text GPT response
   */
  parseResponse(text) {
    return {
      pattern: this.extractSection(text, 'Pattern:'),
      insight: this.extractSection(text, 'Insight:'),
      action: this.extractSection(text, 'Action:')
    };
  },

  /**
   * Extract section from plain-text response
   */
  extractSection(text, sectionName) {
    const regex = new RegExp(
      sectionName + '\\s*([\\s\\S]*?)(?=\\n\\n[A-Z][a-z]+:|$)',
      'i'
    );
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  },

  /**
   * Validate insight completeness
   */
  isValidInsight(insight) {
    return (
      insight &&
      insight.pattern && insight.pattern.length > 10 &&
      insight.insight && insight.insight.length > 10 &&
      insight.action && insight.action.length > 10
    );
  },

  /**
   * Get system prompt for response type
   */
  getPromptForType(responseType, previousInsights) {
    const prompts = {
      income_sources: this.getIncomeSourcesPrompt(previousInsights),
      major_expenses: this.getMajorExpensesPrompt(previousInsights),
      wasteful_spending: this.getWastefulSpendingPrompt(previousInsights),
      debt_list: this.getDebtListPrompt(previousInsights),
      investments: this.getInvestmentsPrompt(previousInsights),
      emotions: this.getEmotionsPrompt(previousInsights),
      adaptive_trauma: this.getAdaptiveTraumaPrompt(previousInsights)
    };

    return prompts[responseType] || this.getGenericPrompt();
  },

  /**
   * Build user prompt with context
   */
  buildUserPrompt(responseText, previousInsights) {
    let prompt = '';

    // Add previous insights as context (if available)
    if (previousInsights && Object.keys(previousInsights).length > 0) {
      prompt += 'Previous Financial Insights:\n';
      Object.entries(previousInsights).forEach(([key, insight]) => {
        if (insight.pattern) {
          prompt += `- ${key}: ${insight.pattern}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `Student's Response:\n"${responseText}"`;

    return prompt;
  },

  /**
   * Income sources prompt
   */
  getIncomeSourcesPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's income sources.

**CRITICAL**: Reference the student's exact words and specific examples from
their response. Ground your insights in what THEY said, not generic advice.

Analyze their response for:
1. Pattern: What pattern emerges from their specific income sources?
2. Insight: What does this reveal about their income clarity and stability?
3. Action: One concrete step based on THEIR situation (not generic advice)

Consider:
- Number of income sources (diversification vs simplicity)
- Predictability and consistency
- Clarity about amounts and timing
- Active vs passive income mix

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)
    `.trim();
  },

  // ============================================================
  // TODO: Implement remaining prompt functions
  // - getMajorExpensesPrompt()
  // - getWastefulSpendingPrompt()
  // - getDebtListPrompt()
  // - getInvestmentsPrompt()
  // - getEmotionsPrompt()
  // - getAdaptiveTraumaPrompt()
  // ============================================================
  // See GPT-IMPLEMENTATION-GUIDE.md for prompt templates

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage(clientId, responseType, error) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      let logSheet = ss.getSheetByName('GPT_FALLBACK_LOG');

      if (!logSheet) {
        logSheet = ss.insertSheet('GPT_FALLBACK_LOG');
        logSheet.appendRow(['Timestamp', 'Client_ID', 'Response_Type', 'Error', 'User_Email']);
      }

      logSheet.appendRow([
        new Date(),
        clientId,
        responseType,
        error,
        Session.getActiveUser().getEmail()
      ]);

    } catch (logError) {
      Logger.log(`Failed to log fallback usage: ${logError.message}`);
    }
  },

  /**
   * Synthesize overall insights from all individual analyses
   */
  synthesizeOverall(clientId, allInsights, domainScores) {
    const systemPrompt = `
You are synthesizing a comprehensive Financial Clarity report for a student.

Domain Scores (0-100%):
- Money Flow: ${domainScores.moneyFlow}%
- Obligations: ${domainScores.obligations}%
- Liquidity: ${domainScores.liquidity}%
- Growth: ${domainScores.growth}%
- Protection: ${domainScores.protection}%

Individual Insights:
${JSON.stringify(allInsights, null, 2)}

Create a cohesive narrative that:
- Connects numeric scores to personal stories
- Identifies top 2-3 patterns across domains
- Provides 3-5 prioritized actions

Return plain-text only:

Overview:
(2-3 paragraphs connecting scores to stories)

Top Patterns:
- Pattern 1
- Pattern 2
- Pattern 3

Priority Actions:
1. Action 1
2. Action 2
3. Action 3
4. Action 4
5. Action 5
    `.trim();

    const userPrompt = 'Synthesize the above insights into a cohesive report.';

    try {
      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',  // Better model for synthesis
        temperature: 0.3,
        maxTokens: 600
      });

      return this.parseSynthesis(result);

    } catch (error) {
      Logger.log(`Synthesis failed: ${error.message}`);
      return this.getGenericSynthesis(domainScores);
    }
  },

  /**
   * Parse synthesis response
   */
  parseSynthesis(text) {
    return {
      overview: this.extractSection(text, 'Overview:'),
      topPatterns: this.extractSection(text, 'Top Patterns:'),
      priorityActions: this.extractSection(text, 'Priority Actions:')
    };
  },

  /**
   * Generic synthesis fallback
   */
  getGenericSynthesis(domainScores) {
    const lowest = this.findLowestDomain(domainScores);

    return {
      overview: `Your financial clarity assessment reveals varying levels of understanding across five key domains. Your strongest area is ${this.findHighestDomain(domainScores)} while ${lowest} presents the greatest opportunity for growth. Building clarity in these areas will support more confident financial decision-making.`,
      topPatterns: '- Opportunities exist to strengthen awareness in multiple domains\n- Building systematic tracking habits would benefit overall clarity\n- Connecting financial behaviors to underlying goals and values',
      priorityActions: `1. Focus on strengthening ${lowest} clarity first\n2. Set up monthly financial review ritual (15 minutes)\n3. Track one key metric in your weakest domain\n4. Identify one emotional trigger around money\n5. Connect with a trusted person about your financial goals`
    };
  },

  findLowestDomain(scores) {
    let lowest = 'Money Flow';
    let lowestScore = 100;

    Object.entries(scores).forEach(([domain, score]) => {
      if (score < lowestScore) {
        lowestScore = score;
        lowest = domain;
      }
    });

    return lowest;
  },

  findHighestDomain(scores) {
    let highest = 'Protection';
    let highestScore = 0;

    Object.entries(scores).forEach(([domain, score]) => {
      if (score > highestScore) {
        highestScore = score;
        highest = domain;
      }
    });

    return highest;
  }
};
```

### 2.3 Test GPT Analysis

```javascript
// Test in Apps Script console
function testGPTAnalysis() {
  const testInsight = Tool2GPTAnalysis.analyzeResponse({
    clientId: 'TEST_001',
    responseType: 'income_sources',
    responseText: 'I work full-time as a software engineer with a stable salary. I also do some freelance web design on weekends when I have time.',
    previousInsights: {},
    formData: {},
    domainScores: {moneyFlow: 45, obligations: 60, liquidity: 30, growth: 50, protection: 55}
  });

  Logger.log('Test Results:');
  Logger.log(`Source: ${testInsight.source}`);
  Logger.log(`Pattern: ${testInsight.pattern}`);
  Logger.log(`Insight: ${testInsight.insight}`);
  Logger.log(`Action: ${testInsight.action}`);
}
```

### 2.4 Checklist

- [ ] File created at `tools/tool2/Tool2GPTAnalysis.js`
- [ ] Core analyzeResponse() function implemented with 3-tier fallback
- [ ] callGPT() function implemented
- [ ] parseResponse() and extractSection() functions implemented
- [ ] All 7 prompt functions implemented
- [ ] synthesizeOverall() function implemented
- [ ] Test function runs successfully
- [ ] API key verified in Script Properties
- [ ] Commit: `git commit -m "feat: Add Tool2GPTAnalysis.js with 3-tier fallback system"`

---

## 📂 STEP 3: Update Tool2.js with Background Processing

**Time:** 1 hour
**Difficulty:** Medium
**Purpose:** Trigger GPT analysis during form completion

### 3.1 Add Background Analysis Functions

Add to `tools/tool2/Tool2.js`:

```javascript
// In Tool2.js - Add these new methods

/**
 * Trigger background GPT analysis for page with free-text responses
 */
triggerBackgroundGPTAnalysis(page, clientId, formData, allData) {
  const triggers = {
    2: [
      {field: 'q18_income_sources', type: 'income_sources'},
      {field: 'q23_major_expenses', type: 'major_expenses'},
      {field: 'q24_wasteful_spending', type: 'wasteful_spending'}
    ],
    3: [
      {field: 'q29_debt_list', type: 'debt_list'}
    ],
    4: [
      {field: 'q43_investment_types', type: 'investments'}
    ],
    5: [
      {field: 'q52_emotions', type: 'emotions'},
      {field: this.getAdaptiveTraumaField(allData), type: 'adaptive_trauma'}
    ]
  };

  const pageTriggers = triggers[page] || [];

  pageTriggers.forEach(trigger => {
    if (formData[trigger.field]) {
      this.analyzeResponseInBackground(
        clientId,
        trigger.type,
        formData[trigger.field],
        allData
      );
    }
  });
},

/**
 * Analyze single response in background (non-blocking)
 */
analyzeResponseInBackground(clientId, responseType, responseText, allData) {
  try {
    const domainScores = this.getPartialDomainScores(allData);
    const previousInsights = this.getExistingInsights(clientId);

    const insight = Tool2GPTAnalysis.analyzeResponse({
      clientId,
      responseType,
      responseText,
      previousInsights,
      formData: allData,
      domainScores
    });

    // Store result in PropertiesService
    const insightKey = `tool2_gpt_${clientId}`;
    const existingInsights = this.getExistingInsights(clientId) || {};
    existingInsights[responseType] = insight;
    existingInsights[`${responseType}_timestamp`] = new Date().toISOString();

    PropertiesService.getUserProperties().setProperty(
      insightKey,
      JSON.stringify(existingInsights)
    );

    Logger.log(`✅ Background GPT complete: ${clientId} - ${responseType}`);

  } catch (error) {
    Logger.log(`⚠️ Background GPT failed: ${clientId} - ${responseType}: ${error.message}`);

    // Store error for retry at submission
    const insightKey = `tool2_gpt_${clientId}`;
    const existingInsights = this.getExistingInsights(clientId) || {};
    existingInsights[`${responseType}_error`] = {
      message: error.message,
      timestamp: new Date().toISOString()
    };

    PropertiesService.getUserProperties().setProperty(
      insightKey,
      JSON.stringify(existingInsights)
    );
  }
},

/**
 * Get existing GPT insights from PropertiesService
 */
getExistingInsights(clientId) {
  const insightKey = `tool2_gpt_${clientId}`;
  const stored = PropertiesService.getUserProperties().getProperty(insightKey);
  return stored ? JSON.parse(stored) : {};
},

/**
 * Get partial domain scores (for background analysis before submission)
 */
getPartialDomainScores(formData) {
  // Return best estimate of domain scores from partial data
  // These don't have to be perfect - just guide the fallback logic
  return {
    moneyFlow: 50,      // Placeholder
    obligations: 50,
    liquidity: 50,
    growth: 50,
    protection: 50
  };
},

/**
 * Get adaptive trauma field name based on Tool 1 data
 */
getAdaptiveTraumaField(formData) {
  // Detect which Q55/Q56 was shown
  if (formData.q55a_fsv_hiding) return 'q55a_fsv_hiding';
  if (formData.q55b_control_anxiety) return 'q55b_control_anxiety';
  if (formData.q55c_exval_influence) return 'q55c_exval_influence';
  if (formData.q55d_fear_paralysis) return 'q55d_fear_paralysis';
  if (formData.q55e_receiving_discomfort) return 'q55e_receiving_discomfort';
  if (formData.q55f_showing_overserving) return 'q55f_showing_overserving';
  return 'q55b_control_anxiety';  // Default
}
```

### 3.2 Update savePageData() to Trigger Background Analysis

Modify existing `savePageData()` method in `Tool2.js`:

```javascript
// BEFORE (existing code):
savePageData(page, clientId, formData) {
  const draftKey = `tool2_draft_${clientId}`;
  const existingData = this.getExistingData(clientId) || {};
  const mergedData = Object.assign({}, existingData, formData);
  PropertiesService.getUserProperties().setProperty(draftKey, JSON.stringify(mergedData));
}

// AFTER (add background trigger):
savePageData(page, clientId, formData) {
  // Step 1: Save form data (existing)
  const draftKey = `tool2_draft_${clientId}`;
  const existingData = this.getExistingData(clientId) || {};
  const mergedData = Object.assign({}, existingData, formData);
  PropertiesService.getUserProperties().setProperty(draftKey, JSON.stringify(mergedData));

  // Step 2: Trigger background GPT analysis (NEW)
  this.triggerBackgroundGPTAnalysis(page, clientId, formData, mergedData);
}
```

### 3.3 Checklist

- [ ] Background analysis functions added to Tool2.js
- [ ] savePageData() updated to trigger GPT
- [ ] getExistingInsights() implemented
- [ ] getPartialDomainScores() implemented
- [ ] getAdaptiveTraumaField() implemented
- [ ] Test background processing by filling out pages 2-5
- [ ] Verify insights stored in PropertiesService
- [ ] Commit: `git commit -m "feat: Add background GPT processing during form completion"`

---

## 📂 STEP 4: Update processFinalSubmission() to Use Pre-Computed Insights

**Time:** 1 hour
**Difficulty:** Medium
**Purpose:** Use background insights at submission, retry failed ones

### 4.1 Update processFinalSubmission()

Modify existing `processFinalSubmission()` in `Tool2.js`:

```javascript
// In Tool2.js - Update processFinalSubmission()

processFinalSubmission(clientId, finalPageData) {
  // Step 1: Save final page data
  this.savePageData(5, clientId, finalPageData);

  // Step 2: Calculate domain scores (existing - already working)
  const allData = this.getExistingData(clientId);
  const results = this.calculateScores(allData);

  // Step 3: Retrieve pre-computed GPT insights (NEW)
  const gptInsights = this.getExistingInsights(clientId);

  // Step 4: Check for missing or failed insights (NEW)
  const requiredInsights = [
    'income_sources',
    'major_expenses',
    'wasteful_spending',
    'debt_list',
    'investments',
    'emotions',
    'adaptive_trauma'
  ];

  const missingInsights = requiredInsights.filter(key =>
    !gptInsights[key] || gptInsights[`${key}_error`]
  );

  // Step 5: Run missing analyses synchronously (NEW)
  if (missingInsights.length > 0) {
    Logger.log(`⚠️ Missing ${missingInsights.length} insights, running now...`);

    missingInsights.forEach(key => {
      const responseText = this.getResponseTextForKey(key, allData);

      if (responseText) {
        const insight = Tool2GPTAnalysis.analyzeResponse({
          clientId,
          responseType: key,
          responseText,
          previousInsights: gptInsights,
          formData: allData,
          domainScores: results.domainScores
        });

        gptInsights[key] = insight;
      }
    });
  }

  // Step 6: Run final synthesis (NEW)
  const overallInsight = Tool2GPTAnalysis.synthesizeOverall(
    clientId,
    gptInsights,
    results.domainScores
  );

  // Step 7: Save everything to RESPONSES sheet (UPDATED)
  const submissionData = {
    data: allData,
    results: results,
    gptInsights: gptInsights,
    overallInsight: overallInsight,
    submittedAt: new Date().toISOString()
  };

  DataService.saveToolResponse(clientId, 'tool2', submissionData);

  // Step 8: Clean up PropertiesService (NEW)
  PropertiesService.getUserProperties().deleteProperty(`tool2_draft_${clientId}`);
  PropertiesService.getUserProperties().deleteProperty(`tool2_gpt_${clientId}`);

  // Step 9: Return report (existing)
  return Tool2Report.render(clientId);
}
```

### 4.2 Add Helper Function

Add to `Tool2.js`:

```javascript
/**
 * Get response text for a given insight type
 */
getResponseTextForKey(key, formData) {
  const mapping = {
    income_sources: 'q18_income_sources',
    major_expenses: 'q23_major_expenses',
    wasteful_spending: 'q24_wasteful_spending',
    debt_list: 'q29_debt_list',
    investments: 'q43_investment_types',
    emotions: 'q52_emotions',
    adaptive_trauma: this.getAdaptiveTraumaField(formData)
  };

  return formData[mapping[key]] || '';
}
```

### 4.3 Checklist

- [ ] processFinalSubmission() updated to use pre-computed insights
- [ ] Missing insight detection implemented
- [ ] Synchronous retry logic for failed insights
- [ ] Overall synthesis call added
- [ ] GPT insights saved to RESPONSES sheet
- [ ] PropertiesService cleanup added
- [ ] getResponseTextForKey() helper implemented
- [ ] Test end-to-end submission with background processing
- [ ] Commit: `git commit -m "feat: Update submission to use pre-computed GPT insights"`

---

## 📂 STEP 5: Update Tool2Report.js to Display GPT Insights

**Time:** 1 hour
**Difficulty:** Easy
**Purpose:** Show GPT insights in the report

### 5.1 Update getResults() to Include GPT Data

Modify `Tool2Report.js`:

```javascript
// In Tool2Report.js - Update getResults()

getResults(clientId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    const data = responseSheet.getDataRange().getValues();
    const headers = data[0];

    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const dataCol = headers.indexOf('Data');
    const isLatestCol = headers.indexOf('Is_Latest');

    // Find most recent Tool 2 result for this client
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][clientIdCol] === clientId &&
          data[i][toolIdCol] === 'tool2' &&
          data[i][isLatestCol] === true) {

        const resultData = JSON.parse(data[i][dataCol]);

        return {
          clientId: clientId,
          results: resultData.results,
          data: resultData.data,
          formData: resultData.data,
          gptInsights: resultData.gptInsights || {},        // NEW
          overallInsight: resultData.overallInsight || {}   // NEW
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log(`Error getting results: ${error}`);
    return null;
  }
}
```

### 5.2 Add GPT Insights Section to Report

Add to `Tool2Report.js` in `buildReportHTML()`:

```javascript
// In Tool2Report.js - Add to buildReportHTML()

buildReportHTML(clientId, results) {
  const studentName = results.formData?.name || 'Student';
  const domainScores = results.results?.domainScores || {};
  const archetype = results.results?.archetype || 'Financial Clarity Seeker';
  const gptInsights = results.gptInsights || {};
  const overallInsight = results.overallInsight || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Financial Clarity Report</title>
      <style>${this.getReportStyles()}</style>
    </head>
    <body>
      <!-- Domain Scores (existing) -->
      ${this.buildDomainScoreCards(domainScores)}

      <!-- Archetype Display (existing) -->
      ${this.buildArchetypeDisplay(archetype)}

      <!-- NEW: Overall GPT Insights -->
      ${this.buildOverallInsights(overallInsight)}

      <!-- NEW: Detailed GPT Insights by Domain -->
      ${this.buildDetailedInsights(gptInsights)}

      <!-- Navigation (existing) -->
      ${this.buildNavigationButtons(clientId)}
    </body>
    </html>
  `;
}
```

### 5.3 Add Insight Display Functions

Add to `Tool2Report.js`:

```javascript
/**
 * Build overall insights section
 */
buildOverallInsights(overallInsight) {
  if (!overallInsight.overview) return '';

  return `
    <section class="overall-insights">
      <h2>Your Financial Clarity Journey</h2>

      <div class="overview">
        ${this.formatParagraphs(overallInsight.overview)}
      </div>

      ${overallInsight.topPatterns ? `
        <div class="top-patterns">
          <h3>Key Patterns</h3>
          ${this.formatBulletList(overallInsight.topPatterns)}
        </div>
      ` : ''}

      ${overallInsight.priorityActions ? `
        <div class="priority-actions">
          <h3>Your Next Steps</h3>
          ${this.formatNumberedList(overallInsight.priorityActions)}
        </div>
      ` : ''}
    </section>
  `;
}

/**
 * Build detailed insights by domain
 */
buildDetailedInsights(gptInsights) {
  if (Object.keys(gptInsights).length === 0) return '';

  const insightSections = [
    {key: 'income_sources', title: 'Income Sources'},
    {key: 'major_expenses', title: 'Major Expenses'},
    {key: 'wasteful_spending', title: 'Spending Patterns'},
    {key: 'debt_list', title: 'Debt Management'},
    {key: 'investments', title: 'Investment Strategy'},
    {key: 'emotions', title: 'Emotional Relationship with Money'},
    {key: 'adaptive_trauma', title: 'Growth Opportunities'}
  ];

  let html = '<section class="detailed-insights"><h2>Personalized Insights</h2>';

  insightSections.forEach(section => {
    const insight = gptInsights[section.key];
    if (insight && insight.pattern) {
      html += this.buildInsightCard(section.title, insight);
    }
  });

  html += '</section>';
  return html;
}

/**
 * Build single insight card
 */
buildInsightCard(title, insight) {
  const sourceTag = insight.source === 'fallback'
    ? '<span class="source-tag fallback">📋 General Guidance</span>'
    : '<span class="source-tag gpt">✨ Personalized</span>';

  return `
    <div class="insight-card">
      ${sourceTag}
      <h3>${title}</h3>

      <div class="insight-section">
        <strong>Pattern:</strong>
        <p>${insight.pattern}</p>
      </div>

      <div class="insight-section">
        <strong>Insight:</strong>
        <p>${insight.insight}</p>
      </div>

      <div class="insight-section action">
        <strong>Next Step:</strong>
        <p>${insight.action}</p>
      </div>
    </div>
  `;
}

/**
 * Format paragraphs with proper spacing
 */
formatParagraphs(text) {
  return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
}

/**
 * Format bullet list
 */
formatBulletList(text) {
  const items = text.split('\n').filter(line => line.trim().startsWith('-'));
  return '<ul>' + items.map(item => `<li>${item.substring(1).trim()}</li>`).join('') + '</ul>';
}

/**
 * Format numbered list
 */
formatNumberedList(text) {
  const items = text.split('\n').filter(line => /^\d+\./.test(line.trim()));
  return '<ol>' + items.map(item => `<li>${item.replace(/^\d+\.\s*/, '').trim()}</li>`).join('') + '</ol>';
}
```

### 5.4 Add CSS Styles

Add to `getReportStyles()` in `Tool2Report.js`:

```css
/* GPT Insights Styling */
.overall-insights, .detailed-insights {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(30, 25, 43, 0.4), rgba(30, 25, 43, 0.2));
  border-radius: 15px;
  border: 1px solid rgba(173, 145, 104, 0.2);
}

.insight-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 25px;
  margin: 20px 0;
  border-left: 4px solid #ad9168;
  position: relative;
}

.source-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(173, 145, 104, 0.2);
  color: #ad9168;
}

.source-tag.gpt {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.insight-section {
  margin: 15px 0;
}

.insight-section strong {
  color: #ad9168;
  display: block;
  margin-bottom: 5px;
}

.insight-section.action {
  background: rgba(173, 145, 104, 0.1);
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #ad9168;
}

.top-patterns ul, .priority-actions ol {
  margin: 15px 0;
  padding-left: 25px;
}

.top-patterns li, .priority-actions li {
  margin: 10px 0;
  line-height: 1.6;
}
```

### 5.5 Checklist

- [ ] getResults() updated to include GPT data
- [ ] buildOverallInsights() implemented
- [ ] buildDetailedInsights() implemented
- [ ] buildInsightCard() implemented
- [ ] Formatting helper functions implemented
- [ ] CSS styles added for insights
- [ ] Test report displays with GPT insights
- [ ] Test report displays with fallback insights
- [ ] Test source tags show correctly (GPT vs fallback)
- [ ] Commit: `git commit -m "feat: Display GPT insights in Tool 2 report"`

---

## 📂 STEP 6: Testing & Validation

**Time:** 1 hour
**Difficulty:** Easy
**Purpose:** Ensure everything works end-to-end

### 6.1 Test Scenarios

**Scenario 1: Normal Operation (GPT Success)**
- [ ] Complete Tool 2 pages 1-5 with detailed free-text responses
- [ ] Check PropertiesService during form (should see insights accumulating)
- [ ] Submit form
- [ ] Verify report loads in ~3 seconds
- [ ] Check all insights show "✨ Personalized" tag
- [ ] Verify insights reference specific details from responses

**Scenario 2: API Failure (Fallback Test)**
- [ ] Temporarily break API key in Script Properties
- [ ] Complete Tool 2 pages 1-5
- [ ] Submit form
- [ ] Verify report still loads successfully
- [ ] Check insights show "📋 General Guidance" tag
- [ ] Verify fallbacks are domain-specific (not generic)
- [ ] Check GPT_FALLBACK_LOG sheet for error tracking
- [ ] Restore API key

**Scenario 3: Edit Mode**
- [ ] Complete Tool 2 submission
- [ ] Click "Edit Answers" from dashboard
- [ ] Modify some free-text responses
- [ ] Submit edits
- [ ] Verify new insights generated for changed responses
- [ ] Verify old insights retained for unchanged responses

**Scenario 4: Performance Test**
- [ ] Time background processing (should be ~24s total during form)
- [ ] Time final submission (should be ~3s for synthesis)
- [ ] Check logs for processing times
- [ ] Verify no blocking delays during form navigation

### 6.2 Validation Checklist

- [ ] All 7 individual insights display correctly
- [ ] Overall synthesis displays with overview, patterns, and actions
- [ ] Source attribution works (GPT vs fallback)
- [ ] Report layout looks professional
- [ ] Mobile responsive (test on phone)
- [ ] No console errors or warnings
- [ ] PropertiesService cleanup happens after submission
- [ ] RESPONSES sheet has complete data (formData + results + gptInsights + overallInsight)

### 6.3 Monitoring Setup

- [ ] GPT_FALLBACK_LOG sheet created with headers
- [ ] Check fallback log has entries when GPT fails
- [ ] Create weekly monitoring script (see guide)
- [ ] Set up alert for >10% fallback rate
- [ ] Document API key location for team

---

## 📂 STEP 7: Documentation & Deployment

**Time:** 30 minutes
**Difficulty:** Easy
**Purpose:** Document and deploy to production

### 7.1 Update Documentation

- [ ] Update `tool2-implementation-tracker.md` with GPT integration complete
- [ ] Mark Step 14 (GPT Integration) as ✅ COMPLETE
- [ ] Update `V3-DEPLOYMENT-INFO.md` with new version
- [ ] Document any issues or learnings

### 7.2 Create Deployment

```bash
# Commit final changes
git add -A
git commit -m "feat: Complete Tool 2 GPT integration with 3-tier fallback"

# Push to Apps Script
clasp push

# Create versioned deployment
clasp deploy --description "v3.8.0 - Tool 2 GPT Integration Complete"

# Get deployment URL
clasp deployments

# Update V3-DEPLOYMENT-INFO.md with new URL
```

### 7.3 Production Testing

- [ ] Test with real OpenAI API key
- [ ] Complete full assessment as real student
- [ ] Verify insights are high quality
- [ ] Check mobile experience
- [ ] Test multiple concurrent users
- [ ] Monitor API costs for first 10 students
- [ ] Verify fallback rate <5%

### 7.4 Team Handoff

- [ ] Share new deployment URL
- [ ] Document GPT features for users
- [ ] Train team on monitoring dashboard
- [ ] Set up cost alerts in OpenAI dashboard
- [ ] Create user guide for interpreting insights

---

## 📊 Final Checklist

### Code Deliverables

- [ ] `tools/tool2/Tool2Fallbacks.js` - Complete with all 7 fallback types
- [ ] `tools/tool2/Tool2GPTAnalysis.js` - Complete with 3-tier system
- [ ] `tools/tool2/Tool2.js` - Updated with background processing
- [ ] `tools/tool2/Tool2Report.js` - Updated to display insights

### Testing Complete

- [ ] Normal operation (GPT success)
- [ ] API failure (fallback activation)
- [ ] Edit mode with GPT
- [ ] Performance benchmarks met
- [ ] Mobile responsive
- [ ] Multiple concurrent users

### Documentation Updated

- [ ] tool2-implementation-tracker.md
- [ ] V3-DEPLOYMENT-INFO.md
- [ ] GPT-IMPLEMENTATION-GUIDE.md (this stays for future tools)
- [ ] GPT-IMPLEMENTATION-CHECKLIST.md (this stays for future tools)

### Production Ready

- [ ] Deployed to production
- [ ] OpenAI API key configured
- [ ] Monitoring dashboard active
- [ ] Cost tracking enabled
- [ ] Team trained
- [ ] Users notified

---

## 🎉 Success Criteria

When complete, Tool 2 should:

✅ Generate personalized insights for 7 free-text responses
✅ Build progressive context (later insights reference earlier ones)
✅ Complete report generation in ~3 seconds (user wait time)
✅ Cost ~$0.023 per student
✅ Have <5% fallback rate under normal operation
✅ Always deliver complete report (100% reliability)
✅ Show clear attribution (GPT vs fallback)
✅ Reference specific student examples in insights
✅ Provide actionable recommendations

---

## 🔄 Future Tools

For implementing GPT in Tool 3, Tool 4, etc.:

1. ✅ Copy `Tool2GPTAnalysis.js` → `Tool3GPTAnalysis.js`
2. ✅ Copy `Tool2Fallbacks.js` → `Tool3Fallbacks.js`
3. ✅ Update prompts for tool-specific questions
4. ✅ Update fallback logic for tool-specific domains
5. ✅ Follow same background processing pattern
6. ✅ Use same 3-tier fallback system
7. ✅ Reuse monitoring and logging infrastructure

Estimated time for subsequent tools: **4-6 hours** (vs 6-8 for first implementation)

---

**Last Updated:** November 5, 2025
**Version:** 1.0
**Status:** Ready for Implementation

See `GPT-IMPLEMENTATION-GUIDE.md` for comprehensive technical details and patterns.
