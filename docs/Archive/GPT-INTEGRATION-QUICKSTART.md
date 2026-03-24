# GPT Integration Quick Start Guide

**Version:** 1.0
**Created:** November 5, 2025
**Based On:** Tool 2 Production Implementation

---

## 🎯 Overview

This guide shows you **exactly** how to add GPT-powered personalized insights to any tool, based on the proven pattern from Tool 2.

**What You Get:**
- ✅ Personalized insights from free-text responses
- ✅ Background processing (user doesn't wait)
- ✅ 3-tier fallback system (100% reliability)
- ✅ Smart caching (no duplicate API calls)
- ✅ Cost-effective (~$0.02-0.03 per student)
- ✅ Professional PDF export with insights

**Time to Implement:** 6-8 hours per tool

---

## 📚 Architecture Pattern

### **Tool-Specific Files (Not Centralized)**

Each tool gets its own GPT files:

```
tools/
└── toolN/
    ├── ToolN.js                    # Main tool (existing)
    ├── ToolNReport.js              # Report display (existing)
    ├── ToolNFallbacks.js          # NEW: Domain-specific fallbacks
    └── ToolNGPTAnalysis.js        # NEW: GPT prompts + 3-tier fallback
```

**Why Tool-Specific?**
- ✅ Each tool has unique prompts and fallback logic
- ✅ No shared dependencies (true plugin architecture)
- ✅ Easy to test independently
- ✅ Clear code ownership

---

## 🚀 Implementation Steps

### **Step 1: Create Fallbacks File** (2 hours)

**File:** `tools/toolN/ToolNFallbacks.js`

**Purpose:** Domain-specific fallback insights when GPT fails

**Template:**
```javascript
const ToolNFallbacks = {

  getFallbackInsight(responseType, formData, domainScores) {
    const fallbacks = {
      response_type_1: {
        pattern: this.getPattern1(formData, domainScores),
        insight: this.getInsight1(formData, domainScores),
        action: this.getAction1(formData, domainScores)
      },
      response_type_2: {
        pattern: this.getPattern2(formData, domainScores),
        insight: this.getInsight2(formData, domainScores),
        action: this.getAction2(formData, domainScores)
      }
    };

    return fallbacks[responseType] || this.getGenericFallback();
  },

  getPattern1(formData, scores) {
    // Use domain scores to provide contextual fallback
    if (scores.domainX < 30) {
      return "Your clarity in this area shows opportunity for growth...";
    } else if (scores.domainX >= 60) {
      return "Your understanding of this area is strong...";
    } else {
      return "Your awareness in this area shows moderate clarity...";
    }
  },

  // Add more domain-specific helpers...

  getGenericFallback() {
    return {
      pattern: "Your response reflects your current relationship with this area.",
      insight: "Building awareness here will support more confident decisions.",
      action: "Take one small step this week to strengthen this area."
    };
  }
};
```

**Key Principles:**
- NOT generic ("increase your income") ❌
- Domain-aware (uses scores to tailor message) ✅
- Actionable (specific next steps) ✅
- Compassionate tone ✅

**Example:** See `tools/tool2/Tool2Fallbacks.js` (21 KB, 7 domains)

---

### **Step 2: Create GPT Analysis File** (2 hours)

**File:** `tools/toolN/ToolNGPTAnalysis.js`

**Purpose:** GPT prompts + 3-tier fallback system

**Template:**
```javascript
const ToolNGPTAnalysis = {

  /**
   * Analyze response with 3-tier fallback
   */
  analyzeResponse({clientId, responseType, responseText, previousInsights, formData, domainScores}) {
    // TIER 1: Try GPT
    try {
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
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response');
      }

    } catch (error) {
      // TIER 2: Retry GPT
      try {
        Utilities.sleep(2000);
        // ... same GPT call logic ...
        return {
          ...parsed,
          source: 'gpt_retry',
          timestamp: new Date().toISOString()
        };

      } catch (retryError) {
        // TIER 3: Use Fallback
        const fallback = ToolNFallbacks.getFallbackInsight(
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
   * Call OpenAI API
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
   * Parse plain-text response
   */
  parseResponse(text) {
    return {
      pattern: this.extractSection(text, 'Pattern:'),
      insight: this.extractSection(text, 'Insight:'),
      action: this.extractSection(text, 'Action:')
    };
  },

  extractSection(text, sectionName) {
    const regex = new RegExp(
      sectionName + '\\s*([\\s\\S]*?)(?=\\n\\n[A-Z][a-z]+:|$)',
      'i'
    );
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  },

  isValidInsight(insight) {
    return (
      insight &&
      insight.pattern && insight.pattern.length > 10 &&
      insight.insight && insight.insight.length > 10 &&
      insight.action && insight.action.length > 10
    );
  },

  /**
   * Get prompt for specific response type
   */
  getPromptForType(responseType, previousInsights) {
    const prompts = {
      response1: this.getPrompt1(previousInsights),
      response2: this.getPrompt2(previousInsights),
      // Add all your response types...
    };

    return prompts[responseType] || this.getGenericPrompt();
  },

  getPrompt1(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's response.

**CRITICAL**: Reference the student's exact words and specific examples from
their response. Ground your insights in what THEY said, not generic advice.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Build upon previous insights to create continuity.' : ''}

Analyze their response for:
1. Pattern: What pattern emerges from their specific answer?
2. Insight: What does this reveal about their situation?
3. Action: One concrete step based on THEIR situation (not generic advice)

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means for their situation)

Action:
(One specific, actionable step based on their situation)
    `.trim();
  },

  /**
   * Build user prompt with context
   */
  buildUserPrompt(responseText, previousInsights) {
    let prompt = '';

    // Add previous insights as context
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
   * Final synthesis (combines all insights)
   */
  synthesizeOverall(clientId, allInsights, domainScores) {
    const systemPrompt = `
You are synthesizing a comprehensive report for a student.

Domain Scores (0-100%):
${Object.entries(domainScores).map(([k, v]) => `- ${k}: ${v}%`).join('\n')}

Individual Insights:
${JSON.stringify(allInsights, null, 2)}

Create a cohesive narrative that:
- Connects scores to personal stories
- Identifies top 2-3 patterns
- Provides 3-5 prioritized actions

Return plain-text only:

Overview:
(2-3 paragraphs connecting everything)

Top Patterns:
- Pattern 1
- Pattern 2
- Pattern 3

Priority Actions:
1. Action 1
2. Action 2
3. Action 3
    `.trim();

    const userPrompt = 'Synthesize the above insights.';

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
      return this.getGenericSynthesis(domainScores);
    }
  },

  parseSynthesis(text) {
    return {
      overview: this.extractSection(text, 'Overview:'),
      topPatterns: this.extractSection(text, 'Top Patterns:'),
      priorityActions: this.extractSection(text, 'Priority Actions:')
    };
  },

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
      Logger.log(`Failed to log fallback: ${logError.message}`);
    }
  }
};
```

**Example:** See `tools/tool2/Tool2GPTAnalysis.js` (22 KB, 8 prompts)

---

### **Step 3: Add Background Processing** (1 hour)

**File:** `tools/toolN/ToolN.js`

**Add to your main tool file:**

```javascript
const ToolN = {

  // ... existing code ...

  /**
   * Save page data (EXISTING - UPDATE THIS)
   */
  savePageData(clientId, page, formData) {
    // Step 1: Save form data (existing code)
    const draftKey = `toolN_draft_${clientId}`;
    const existingData = this.getExistingData(clientId) || {};
    const mergedData = Object.assign({}, existingData, formData);
    PropertiesService.getUserProperties().setProperty(draftKey, JSON.stringify(mergedData));

    // Step 2: Trigger background GPT analysis (NEW)
    this.triggerBackgroundGPTAnalysis(page, clientId, formData, mergedData);
  },

  /**
   * Trigger background GPT for pages with free-text (NEW)
   */
  triggerBackgroundGPTAnalysis(page, clientId, formData, allData) {
    const triggers = {
      2: [
        {field: 'q1_freetext', type: 'response1'},
        {field: 'q2_freetext', type: 'response2'}
      ],
      3: [
        {field: 'q3_freetext', type: 'response3'}
      ]
      // Map pages to their free-text fields...
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
   * Analyze single response in background (NEW)
   */
  analyzeResponseInBackground(clientId, responseType, responseText, allData) {
    try {
      // Check if already analyzed (avoid duplicates)
      const existingInsights = this.getExistingInsights(clientId);
      if (existingInsights[responseType] && !existingInsights[`${responseType}_error`]) {
        Logger.log(`✓ Insight already exists for ${responseType}, skipping`);
        return;
      }

      const domainScores = this.getPartialDomainScores(allData);

      const insight = ToolNGPTAnalysis.analyzeResponse({
        clientId,
        responseType,
        responseText,
        previousInsights: existingInsights,
        formData: allData,
        domainScores
      });

      // Store in PropertiesService
      const insightKey = `toolN_gpt_${clientId}`;
      existingInsights[responseType] = insight;
      existingInsights[`${responseType}_timestamp`] = new Date().toISOString();

      PropertiesService.getUserProperties().setProperty(
        insightKey,
        JSON.stringify(existingInsights)
      );

      Logger.log(`✅ Background GPT complete: ${clientId} - ${responseType}`);

    } catch (error) {
      Logger.log(`⚠️ Background GPT failed: ${clientId} - ${responseType}: ${error.message}`);
    }
  },

  /**
   * Get existing GPT insights (NEW)
   */
  getExistingInsights(clientId) {
    const insightKey = `toolN_gpt_${clientId}`;
    const stored = PropertiesService.getUserProperties().getProperty(insightKey);
    return stored ? JSON.parse(stored) : {};
  },

  /**
   * Get partial domain scores (NEW)
   */
  getPartialDomainScores(formData) {
    // Return best estimate from partial data
    // These guide fallback logic
    return {
      domain1: 50,
      domain2: 50,
      domain3: 50
    };
  }
};
```

---

### **Step 4: Update Final Submission** (1 hour)

**File:** `tools/toolN/ToolN.js`

**Update processFinalSubmission:**

```javascript
processFinalSubmission(clientId) {
  // Step 1: Get all submitted data
  const allData = this.getExistingData(clientId);

  // Step 2: Calculate domain scores (existing - algorithmic)
  const results = this.calculateScores(allData);

  // Step 3: Retrieve pre-computed GPT insights (NEW)
  const gptInsights = this.getExistingInsights(clientId);

  // Step 4: Check for missing/failed insights (NEW)
  const requiredInsights = [
    'response1',
    'response2',
    'response3'
    // List all your response types...
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
        const insight = ToolNGPTAnalysis.analyzeResponse({
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
  const overallInsight = ToolNGPTAnalysis.synthesizeOverall(
    clientId,
    gptInsights,
    results.domainScores
  );

  // Step 7: Save everything to RESPONSES sheet
  DataService.saveToolResponse(clientId, 'toolN', {
    data: allData,
    results: results,
    gptInsights: gptInsights,           // NEW
    overallInsight: overallInsight,     // NEW
    timestamp: new Date().toISOString()
  });

  // Step 8: Clean up PropertiesService (NEW)
  PropertiesService.getUserProperties().deleteProperty(`toolN_draft_${clientId}`);
  PropertiesService.getUserProperties().deleteProperty(`toolN_gpt_${clientId}`);

  // Step 9: Return report URL
  return {
    redirectUrl: `${ScriptApp.getService().getUrl()}?route=toolN_report&client=${clientId}`
  };
}
```

---

### **Step 5: Display GPT Insights in Report** (1 hour)

**File:** `tools/toolN/ToolNReport.js`

**Update getResults:**

```javascript
getResults(clientId) {
  // ... existing code to find latest response ...

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
```

**Add insight display functions:**

```javascript
/**
 * Build overall insights section
 */
buildOverallInsights(overallInsight) {
  if (!overallInsight.overview) return '';

  return `
    <section class="overall-insights">
      <h2>Your Journey</h2>
      <div class="overview">
        ${this.formatParagraphs(overallInsight.overview)}
      </div>
      ${overallInsight.topPatterns ? `
        <h3>Key Patterns</h3>
        ${this.formatBulletList(overallInsight.topPatterns)}
      ` : ''}
      ${overallInsight.priorityActions ? `
        <h3>Your Next Steps</h3>
        ${this.formatNumberedList(overallInsight.priorityActions)}
      ` : ''}
    </section>
  `;
},

/**
 * Build detailed insights by domain
 */
buildDetailedInsights(gptInsights) {
  if (Object.keys(gptInsights).length === 0) return '';

  const insightSections = [
    {key: 'response1', title: '📊 Response 1 Analysis'},
    {key: 'response2', title: '💡 Response 2 Analysis'},
    // Map all your response types...
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
},

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
},

formatParagraphs(text) {
  if (!text) return '';
  return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
},

formatBulletList(text) {
  if (!text) return '';
  const items = text.split('\n').filter(line => line.trim().startsWith('-'));
  return '<ul>' + items.map(item => `<li>${item.substring(1).trim()}</li>`).join('') + '</ul>';
},

formatNumberedList(text) {
  if (!text) return '';
  const items = text.split('\n').filter(line => /^\d+\./.test(line.trim()));
  return '<ol>' + items.map(item => `<li>${item.replace(/^\d+\.\s*/, '').trim()}</li>`).join('') + '</ol>';
}
```

**Add CSS styles:**

```css
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
  top: 20px;
  right: 20px;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.source-tag.gpt {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.source-tag.fallback {
  background: rgba(173, 145, 104, 0.2);
  color: #ad9168;
}

.insight-section {
  margin: 15px 0;
}

.insight-section strong {
  color: #ad9168;
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  text-transform: uppercase;
}

.insight-section.action {
  background: rgba(173, 145, 104, 0.1);
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #ad9168;
  margin-top: 20px;
}
```

---

### **Step 6: Add PDF Generation** (30 min)

**File:** `Code.js`

**Add PDF generation function:**

```javascript
/**
 * Generate PDF for ToolN Report
 */
function generateToolNPDF(clientId) {
  try {
    const results = ToolNReport.getResults(clientId);
    if (!results) {
      return { success: false, error: 'No results found' };
    }

    const studentName = results.formData?.name || 'Student';
    const domainScores = results.results?.domainScores || {};
    const gptInsights = results.gptInsights || {};
    const overallInsight = results.overallInsight || {};

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e192b; border-bottom: 3px solid #ad9168; }
          h2 { color: #ad9168; margin-top: 30px; }
          .insight-card { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #ad9168; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <h1>TruPath Financial - ToolN Report</h1>
        <p><strong>${studentName}</strong></p>
        <p>${new Date().toLocaleDateString()}</p>

        <!-- Domain Scores -->
        <h2>Your Scores</h2>
        ${Object.entries(domainScores).map(([k, v]) => `
          <p><strong>${k}:</strong> ${Math.round(v)}%</p>
        `).join('')}

        <!-- GPT Insights -->
        ${overallInsight.overview ? `
          <div class="page-break"></div>
          <h2>Your Journey</h2>
          ${overallInsight.overview.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        ` : ''}

        <!-- Detailed Insights -->
        ${Object.entries(gptInsights).map(([key, insight]) => {
          if (!insight.pattern) return '';
          return `
            <div class="insight-card">
              <h3>${key}</h3>
              <p><strong>Pattern:</strong> ${insight.pattern}</p>
              <p><strong>Insight:</strong> ${insight.insight}</p>
              <p><strong>Action:</strong> ${insight.action}</p>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf');
    const base64 = Utilities.base64Encode(pdf.getBytes());
    const fileName = `TruPath_ToolN_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      success: true,
      pdf: base64,
      fileName: fileName,
      mimeType: 'application/pdf'
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

**Update ToolNReport.js download button:**

```javascript
function downloadPDF() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Generating PDF...';
  document.getElementById('loadingOverlay').style.display = 'flex';

  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success) {
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,' + result.pdf;
        link.download = result.fileName;
        link.click();

        btn.disabled = false;
        btn.textContent = '📥 Download PDF Report';
        document.getElementById('loadingOverlay').style.display = 'none';
        alert('PDF downloaded successfully!');
      } else {
        alert('Error generating PDF: ' + result.error);
        btn.disabled = false;
        btn.textContent = '📥 Download PDF Report';
        document.getElementById('loadingOverlay').style.display = 'none';
      }
    })
    .withFailureHandler(function(error) {
      alert('Error: ' + error.message);
      btn.disabled = false;
      btn.textContent = '📥 Download PDF Report';
      document.getElementById('loadingOverlay').style.display = 'none';
    })
    .generateToolNPDF(clientId);
}
```

---

## 📊 Cost & Performance

### **Expected Performance:**

| Metric | Target | Tool 2 Actual |
|--------|--------|---------------|
| Background processing | < 30s | ~24s |
| User wait at submission | < 5s | ~3s |
| Cost per student | < $0.05 | $0.023 |
| Fallback rate | < 10% | < 5% |
| Reliability | 100% | 100% |

### **Cost Breakdown (per student):**

```
8 individual analyses × gpt-4o-mini ($0.0025 each) = $0.020
1 synthesis × gpt-4o ($0.003) = $0.003
─────────────────────────────────────────────────────
Total per student = $0.023
```

### **Monitoring:**

1. **Check fallback rate:** GPT_FALLBACK_LOG sheet (should be < 10%)
2. **Check costs:** https://platform.openai.com/usage
3. **Check logs:** View → Execution log (look for "✅ Background GPT complete")

---

## ✅ Testing Checklist

### **Test 1: Fallbacks Only (No API Key)**
```javascript
function testFallbacks() {
  const insight = ToolNFallbacks.getFallbackInsight('response1', {}, {domain1: 45});
  Logger.log(insight.pattern);
  Logger.log(insight.insight);
  Logger.log(insight.action);
}
```

### **Test 2: Single GPT Call**
```javascript
function testGPT() {
  const insight = ToolNGPTAnalysis.analyzeResponse({
    clientId: 'TEST_001',
    responseType: 'response1',
    responseText: 'Test response text here...',
    previousInsights: {},
    formData: {},
    domainScores: {domain1: 45}
  });
  Logger.log('Source: ' + insight.source); // Should be 'gpt'
  Logger.log('Pattern: ' + insight.pattern);
}
```

### **Test 3: Duplicate Prevention**
```javascript
function testDuplicates() {
  ToolN.analyzeResponseInBackground('TEST', 'response1', 'Text', {});
  // Should see: "✅ Background GPT complete"

  ToolN.analyzeResponseInBackground('TEST', 'response1', 'Text', {});
  // Should see: "✓ Insight already exists, skipping"
}
```

### **Test 4: End-to-End**
1. Complete tool assessment with detailed free-text responses
2. Check execution logs for "✅ Background GPT complete" messages
3. Submit and verify report shows insights
4. Check PDF downloads with insights
5. Verify source tags (✨ Personalized or 📋 General Guidance)

---

## 🎯 Success Criteria

Your GPT integration is complete when:

✅ **All insights display** in web report
✅ **Source attribution** shows correctly (GPT vs fallback)
✅ **PDF includes** all insights
✅ **Cost stays** under $0.05 per student
✅ **Fallback rate** < 10%
✅ **No blocking delays** during form
✅ **User wait** < 5 seconds at submission
✅ **100% reliability** (fallbacks ensure completion)

---

## 📚 Reference Examples

**Complete Working Code:**
- `tools/tool2/Tool2Fallbacks.js` (21 KB)
- `tools/tool2/Tool2GPTAnalysis.js` (22 KB)
- `tools/tool2/Tool2.js` (background processing section)
- `tools/tool2/Tool2Report.js` (insights display section)
- `Code.js` (generateTool2PDF function)

**Documentation:**
- `docs/GPT-IMPLEMENTATION-GUIDE.md` (comprehensive)
- `docs/GPT-IMPLEMENTATION-CHECKLIST.md` (step-by-step)

---

## 💡 Pro Tips

1. **Test fallbacks first** - Ensure they're domain-specific and valuable
2. **Use clear prompt structure** - Pattern / Insight / Action format works well
3. **Build context progressively** - Pass previous insights to later prompts
4. **Monitor fallback rate** - Should stay < 10% with good API key
5. **Profile timing** - Ensure background processing doesn't slow form
6. **Cache aggressively** - Check for existing insights before calling GPT
7. **Log everything** - Helps debug issues in production

---

**Last Updated:** November 5, 2025
**Based On:** Tool 2 v3.8.1 (Production)
**Status:** ✅ Proven in Production
