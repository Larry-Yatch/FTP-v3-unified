# Tool Development Guide - Financial TruPath v3

**Last Updated:** November 4, 2024
**Version:** v3.3.0
**For:** Building Tools 3-8

---

## 🎯 Purpose

This guide provides **everything you need** to build a new tool in the v3 framework, based on proven patterns from Tool 1 and Tool 2.

**What's Included:**
- Multi-page form patterns (with FormUtils)
- GPT integration (when/how to use)
- Adaptive questions (pulling from previous tools)
- Scale standards (-5 to +5, no zero)
- Draft auto-save and resume
- Report generation patterns
- Complete working code templates

---

## 📚 Before You Start

### **Read First:**
1. **ARCHITECTURE.md** - Understand the framework
2. **Tool 1 code** (`tools/tool1/Tool1.js`) - Pure algorithmic example
3. **Tool 2 code** (`tools/tool2/Tool2.js`) - Hybrid (algo + GPT) example

### **Reference During Development:**
- **TOOL2-QUESTION-MASTER-LIST.md** - Scale labeling examples
- **MultiPageToolTemplate.js** - Working code template
- **FormUtils.js** - Form helper functions

---

## 🏗️ Tool Types

### **Type 1: Single-Page Form**
**Use when:** < 10 questions, simple scoring, no conditional logic
**Example:** (None yet in v3)
**Complexity:** Low

### **Type 2: Multi-Page Form (Pure Algorithmic)**
**Use when:** 10-30 questions, algorithmic scoring, no free-text analysis
**Example:** Tool 1 (26 questions, 5 pages, 6 trauma scores)
**Complexity:** Medium

### **Type 3: Multi-Page Form (Hybrid with GPT)**
**Use when:** 30+ questions with free-text, need personalized insights
**Example:** Tool 2 (57 questions, 5 pages, algo scoring + GPT insights)
**Complexity:** High
**Cost:** ~$0.01-0.05 per report

### **Type 4: Multi-Page with Adaptive Questions**
**Use when:** Questions depend on previous tool data
**Example:** Tool 2 Page 5 (shows 2 questions based on Tool 1 trauma scores)
**Complexity:** High

---

## 🎨 Multi-Page Tool Pattern (Step-by-Step)

### **File Structure**

```
tools/toolN/
├── tool.manifest.json      # Tool configuration
├── ToolN.js                # Main tool implementation
├── ToolNReport.js          # Report generation
└── ToolNStyles.js          # (Optional) Custom styles
```

### **Step 1: Create Manifest**

**File:** `tools/toolN/tool.manifest.json`

```json
{
  "id": "toolN",
  "name": "Your Tool Name",
  "description": "Brief description for dashboard",
  "version": "1.0.0",
  "pattern": "multipage-form",
  "totalPages": 5,
  "estimatedTime": "15-20 minutes",
  "routes": ["/toolN", "/tool-name-slug"],
  "prerequisites": ["tool1", "tool2"],
  "unlocks": ["toolN+1"],
  "usesGPT": false,
  "estimatedCost": 0,
  "dataSchema": {
    "requiredFields": ["field1", "field2"],
    "optionalFields": ["field3"]
  }
}
```

**Key Fields:**
- `usesGPT`: Set to `true` if using OpenAI service
- `estimatedCost`: In dollars (e.g., 0.03 for 3 cents)
- `totalPages`: Number of pages in your form
- `prerequisites`: Tools that must be completed first

---

### **Step 2: Implement Main Tool Module**

**File:** `tools/toolN/ToolN.js`

```javascript
/**
 * Tool N: [Tool Name]
 *
 * [Brief description of what this tool assesses]
 *
 * Pattern: Multi-page form with [X] pages, [Y] questions
 * Scoring: [Algorithmic / GPT-enhanced / Hybrid]
 */

const ToolN = {
  // ===== CONFIGURATION =====

  id: 'toolN',
  manifest: null, // Injected by ToolRegistry

  // Dependencies (injected by framework)
  dataService: null,
  openAI: null, // Only if usesGPT: true in manifest

  // ===== REQUIRED: INITIALIZE =====

  /**
   * Initialize tool with dependencies
   * @param {Object} deps - Framework services
   * @param {Array} insights - Previous tool insights
   */
  initialize(deps, insights) {
    try {
      this.dataService = deps.dataService;

      // Only if using GPT
      if (this.manifest.usesGPT) {
        this.openAI = deps.openAI;
      }

      this.previousInsights = insights || [];

      return { success: true };
    } catch (error) {
      Logger.log(`ToolN initialization error: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  // ===== REQUIRED: RENDER =====

  /**
   * Render tool UI
   * @param {Object} params - { clientId, page, ... }
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // Get existing data (for resume/draft)
    const existingData = this.getExistingData(clientId);

    // Get page content
    const pageContent = this.renderPageContent(page, existingData, clientId);

    // Use FormUtils for standard structure
    const template = HtmlService.createTemplate(
      FormUtils.buildStandardPage({
        toolName: 'Your Tool Name',
        toolId: this.id,
        page: page,
        totalPages: this.manifest.totalPages,
        clientId: clientId,
        baseUrl: baseUrl,
        pageContent: pageContent,
        isFinalPage: (page === this.manifest.totalPages),
        customValidation: null // or 'validateMyForm' for custom
      })
    );

    return template.evaluate()
      .setTitle(`TruPath - ${this.manifest.name}`)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  // ===== PAGE ROUTING =====

  /**
   * Route to appropriate page
   */
  renderPageContent(page, data, clientId) {
    switch(page) {
      case 1: return this.renderPage1Content(data, clientId);
      case 2: return this.renderPage2Content(data, clientId);
      case 3: return this.renderPage3Content(data, clientId);
      // Add more pages as needed
      default: return '<p class="error">Invalid page</p>';
    }
  },

  // ===== PAGE CONTENT METHODS =====

  /**
   * PAGE 1: [Section Name]
   *
   * IMPORTANT: Return ONLY form fields (no <form> tag)
   * FormUtils wraps this automatically
   */
  renderPage1Content(data, clientId) {
    // Example: Pre-fill from previous tool
    const tool1Data = this.dataService.getToolResponse(clientId, 'tool1');
    const name = tool1Data?.data?.name || data?.name || '';

    return `
      <h2>Section Title</h2>
      <p class="muted mb-20">Section description</p>

      <div class="form-group">
        <label class="form-label">Question 1 *</label>
        <input type="text" name="field1" value="${name}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Question 2 *</label>
        <select name="field2" required>
          <option value="">Select...</option>
          <option value="opt1" ${data?.field2 === 'opt1' ? 'selected' : ''}>Option 1</option>
          <option value="opt2" ${data?.field2 === 'opt2' ? 'selected' : ''}>Option 2</option>
        </select>
      </div>
    `;
  },

  /**
   * PAGE 2: [Section Name]
   *
   * Example: -5 to +5 scale questions (standard)
   */
  renderPage2Content(data, clientId) {
    const questions = [
      { name: 'q1', text: 'How would you rate...?' },
      { name: 'q2', text: 'To what extent do you...?' },
      { name: 'q3', text: 'How strongly do you feel...?' }
    ];

    let html = `
      <h2>Assessment Questions</h2>
      <p class="muted mb-20">Rate each statement using the scale below.</p>
    `;

    // Render scale questions
    questions.forEach(q => {
      const selected = data?.[q.name] || '';
      html += `
        <div class="form-group">
          <label class="form-label">${q.text} *</label>
          <select name="${q.name}" required>
            <option value="">Select a response</option>
            <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Strongly disagree)</option>
            <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
            <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
            <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
            <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
            <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
            <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
            <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
            <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
            <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Strongly agree)</option>
          </select>
          <small class="muted">Note: No zero option - choose the direction that best fits</small>
        </div>
      `;
    });

    return html;
  },

  /**
   * FINAL PAGE: Review & Submit
   *
   * Optional: Show review section before submit
   */
  renderPageFinalContent(data, clientId) {
    return `
      <h2>Review Your Responses</h2>
      <p class="muted mb-20">Please review before submitting.</p>

      <div class="insight-box" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
        <p><strong>📋 Almost Done</strong></p>
        <p>You can use your browser's back button to review and edit any previous pages.</p>
        <p>When ready, click "Complete Assessment" below.</p>
      </div>
    `;
  },

  // ===== DATA MANAGEMENT =====

  /**
   * Get existing data for resume/draft
   */
  getExistingData(clientId) {
    try {
      const response = this.dataService.getToolResponse(clientId, this.id);
      return response?.draft || response?.data || {};
    } catch (error) {
      Logger.log(`Error getting existing data: ${error}`);
      return {};
    }
  },

  /**
   * REQUIRED: Save draft (auto-called by FormUtils)
   */
  saveDraft(clientId, data) {
    try {
      this.dataService.saveDraft(clientId, this.id, data);
      return { success: true };
    } catch (error) {
      Logger.log(`Error saving draft: ${error}`);
      return { success: false, error: error.toString() };
    }
  },

  // ===== REQUIRED: VALIDATION =====

  /**
   * Validate form data
   */
  validate(data) {
    const errors = [];

    // Required field validation
    if (!data.field1 || data.field1.trim() === '') {
      errors.push('Field 1 is required');
    }

    // Type validation
    if (data.numericField && isNaN(data.numericField)) {
      errors.push('Field must be a number');
    }

    // Range validation (for scale questions)
    const scaleFields = ['q1', 'q2', 'q3'];
    scaleFields.forEach(field => {
      const value = parseInt(data[field]);
      if (value !== undefined && (value < -5 || value > 5 || value === 0)) {
        errors.push(`${field} must be between -5 and +5 (excluding 0)`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  // ===== REQUIRED: PROCESS SUBMISSION =====

  /**
   * Process final submission
   * @param {string} clientId
   * @param {Object} data - Validated form data
   */
  process(clientId, data) {
    try {
      Logger.log(`Processing ToolN for ${clientId}`);

      // Calculate results
      const results = this.processResults(data);

      // Save to database
      this.dataService.saveToolResponse(clientId, this.id, {
        data: data,
        results: results,
        timestamp: new Date().toISOString()
      });

      // Update tool status
      this.dataService.updateToolStatus(clientId, this.id, 'completed');

      return {
        success: true,
        result: results
      };

    } catch (error) {
      Logger.log(`Processing error: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Calculate results (tool-specific scoring logic)
   */
  processResults(data) {
    // TOOL-SPECIFIC: Implement your scoring logic here

    // Example: Simple sum of scale questions
    const score = (parseInt(data.q1) || 0) +
                  (parseInt(data.q2) || 0) +
                  (parseInt(data.q3) || 0);

    // Example: Categorization
    let category = 'Low';
    if (score >= 10) category = 'High';
    else if (score >= 5) category = 'Medium';

    return {
      score: score,
      category: category,
      timestamp: new Date().toISOString()
    };
  },

  // ===== REQUIRED: GENERATE INSIGHTS =====

  /**
   * Generate insights for other tools
   * These will be stored in CrossToolInsights sheet
   */
  generateInsights(data, clientId) {
    const insights = [];

    // Example: Threshold-based insight
    if (data.score >= 10) {
      insights.push({
        type: 'high_score',
        priority: 'HIGH',
        content: `High score detected (${data.score})`,
        targetTools: ['toolN+1'],
        data: { score: data.score }
      });
    }

    return insights;
  },

  // ===== REQUIRED: GET CONFIG =====

  getConfig() {
    return this.manifest;
  }
};
```

---

## 🤖 GPT Integration Pattern

### **When to Use GPT**

**✅ Good Use Cases:**
- Analyzing free-text responses
- Generating personalized recommendations
- Creating narrative insights from data
- Trauma-informed coaching language
- Synthesizing complex patterns

**❌ Bad Use Cases:**
- Replacing scoring logic (use algorithms)
- Making access control decisions
- Storing sensitive data
- Real-time form interactions (too slow)

### **Adding GPT to Your Tool**

**1. Update manifest:**
```json
{
  "usesGPT": true,
  "estimatedCost": 0.03
}
```

**2. Check for OpenAI service in initialize:**
```javascript
initialize(deps, insights) {
  this.openAI = deps.openAI;
  if (!this.openAI) {
    Logger.log('Warning: OpenAI service not available');
  }
  // ...
}
```

**3. Create GPT analysis in report generation:**

**File:** `tools/toolN/ToolNReport.js`

```javascript
const ToolNReport = {

  /**
   * Build report with GPT insights
   */
  async buildReport(results, data, clientId, openAI) {
    // 1. Calculate objective scores (always algorithmic)
    const scores = this.calculateScores(data);

    // 2. Generate AI insights (if available)
    let insights = null;
    if (openAI && data.freeTextField) {
      insights = await this.generateGPTInsights(data, scores, openAI);
    }

    // 3. Build report HTML
    return this.renderReport(scores, insights);
  },

  /**
   * Generate GPT insights
   */
  async generateGPTInsights(data, scores, openAI) {
    const prompts = [
      this.buildPrompt1(data, scores),
      this.buildPrompt2(data, scores)
    ];

    try {
      // Parallel API calls for efficiency
      const results = await openAI.batchAnalyze(prompts);

      return {
        analysis1: results[0],
        analysis2: results[1]
      };
    } catch (error) {
      Logger.log(`GPT error: ${error}`);
      // Fallback to template-based insights
      return this.getFallbackInsights(data, scores);
    }
  },

  /**
   * Build GPT prompt
   */
  buildPrompt1(data, scores) {
    return {
      prompt: `
        Analyze this person's response:

        Free text: "${data.freeTextField}"
        Score: ${scores.total}
        Category: ${scores.category}

        Provide:
        1. One key insight about their situation
        2. One specific action they can take

        Keep under 100 words, encouraging tone.
      `,
      cacheKey: `toolN_insight1_${data.clientId}`
    };
  },

  /**
   * Fallback if GPT unavailable
   */
  getFallbackInsights(data, scores) {
    return {
      analysis1: 'Based on your responses, consider...',
      analysis2: 'Your next step could be...'
    };
  }
};
```

**Cost Estimation:**
- GPT-4o-mini: ~$0.15/$0.60 per 1M tokens (input/output)
- Typical insight: 200 tokens = ~$0.002
- 5 insights per report = ~$0.01
- Budget accordingly

---

## 🔄 Adaptive Questions Pattern

### **Use Case**
Show different questions based on previous tool data.

**Example:** Tool 2 shows 2 trauma-specific questions based on Tool 1's highest trauma score.

### **Implementation**

```javascript
/**
 * PAGE WITH ADAPTIVE QUESTIONS
 */
renderAdaptivePage(data, clientId) {
  let html = `
    <h2>Personalized Questions</h2>
    <p class="muted mb-20">Based on your previous assessment.</p>

    <!-- Base questions (everyone sees these) -->
    <div class="form-group">
      <label class="form-label">Base question 1 *</label>
      <input type="text" name="base1" value="${data?.base1 || ''}" required>
    </div>
  `;

  // Adaptive section: Query previous tool
  try {
    const tool1Data = this.dataService.getToolResponse(clientId, 'tool1');

    if (tool1Data?.results) {
      const traumaScores = tool1Data.results;

      // Find highest score
      const topTrauma = Object.entries(traumaScores)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

      const [category, score] = topTrauma;

      // Show adaptive questions for that category
      if (Math.abs(score) > 5) { // Threshold
        html += `
          <h3 class="mt-40">Personalized Follow-Up</h3>
          <p class="muted">Based on your ${category} assessment:</p>
        `;

        if (category === 'FSV') {
          html += this.renderFSVQuestions(data);
        } else if (category === 'Control') {
          html += this.renderControlQuestions(data);
        }
        // etc...
      }
    }
  } catch (error) {
    Logger.log(`Error loading adaptive questions: ${error}`);
    // Graceful degradation - page works without adaptive section
  }

  return html;
},

/**
 * Trauma-specific questions
 */
renderFSVQuestions(data) {
  const selected = data?.fsvScale || '';
  return `
    <div class="form-group">
      <label class="form-label">How much do you hide your true situation? *</label>
      <select name="fsvScale" required>
        <option value="">Select...</option>
        <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Complete transparency)</option>
        <!-- ... full scale ... -->
        <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Total hiding)</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">How does this impact your life? *</label>
      <textarea name="fsvImpact" rows="4" required>${data?.fsvImpact || ''}</textarea>
    </div>
  `;
}
```

**Key Points:**
- Always have base questions (don't make entire page conditional)
- Graceful degradation if previous tool data unavailable
- Use try/catch to prevent errors from breaking the page
- Log errors for debugging

---

## 📏 Scale Standards

### **Standard: -5 to +5 (No Zero)**

**Why no zero:**
- Forces intentionality (no fence-sitting)
- Cleaner interpretation (negative = struggle, positive = strength)
- Better data quality

**Scale Labeling Examples:**

**Agreement Scale:**
```
-5: Strongly disagree
-3: Disagree
-1: Slightly disagree
+1: Slightly agree
+3: Agree
+5: Strongly agree
```

**Frequency Scale:**
```
-5: Never
-3: Rarely
-1: Occasionally
+1: Sometimes
+3: Often
+5: Always
```

**Clarity/Confidence Scale:**
```
-5: No clarity/confidence at all
-3: Low clarity/confidence
-1: Slightly unclear/uncertain
+1: Somewhat clear/confident
+3: Clear/confident
+5: Complete clarity/confidence
```

**Custom Labels (Tool-Specific):**
See TOOL2-QUESTION-MASTER-LIST.md for extensive examples.

---

## 💾 Draft Auto-Save Pattern

FormUtils handles this automatically, but here's what happens:

**1. On every "Next Page" click:**
```javascript
// FormUtils automatically calls:
google.script.run
  .withSuccessHandler(navigateToNextPage)
  .withFailureHandler(handleError)
  .saveDraft(clientId, toolId, formData);
```

**2. Your tool must implement:**
```javascript
saveDraft(clientId, data) {
  this.dataService.saveDraft(clientId, this.id, data);
  return { success: true };
}
```

**3. On resume, data is restored:**
```javascript
getExistingData(clientId) {
  const response = this.dataService.getToolResponse(clientId, this.id);
  return response?.draft || response?.data || {};
}
```

**User Experience:**
- Students can close browser and resume later
- All answers preserved
- Progress indicator shows where they left off
- No manual "Save" button needed

---

## 📊 Report Generation Pattern

### **Basic Report (No GPT)**

```javascript
const ToolNReport = {

  buildReport(results, data, clientId) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assessment Report</title>
        ${this.getStyles()}
      </head>
      <body>
        <div class="report-container">
          <h1>Your Results</h1>

          <div class="section">
            <h2>Summary</h2>
            <p>Your score: ${results.score}</p>
            <p>Category: ${results.category}</p>
          </div>

          <div class="section">
            <h2>Interpretation</h2>
            <p>${this.getInterpretation(results)}</p>
          </div>

          <div class="section">
            <h2>Next Steps</h2>
            <ul>
              ${this.getRecommendations(results).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  getInterpretation(results) {
    if (results.category === 'High') {
      return 'You show strong indicators...';
    } else if (results.category === 'Medium') {
      return 'You show moderate indicators...';
    } else {
      return 'You show low indicators...';
    }
  },

  getRecommendations(results) {
    // Template-based recommendations
    return [
      'Recommendation 1',
      'Recommendation 2',
      'Recommendation 3'
    ];
  },

  getStyles() {
    return `
      <style>
        .report-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .section {
          margin: 40px 0;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        h1 { color: #ad9168; }
        h2 { color: #333; margin-top: 0; }
      </style>
    `;
  }
};
```

### **Hybrid Report (With GPT)**

See "GPT Integration Pattern" section above for complete example.

---

## 🧪 Testing Your Tool

### **1. Unit Testing (Manual)**

Add to Code.js:
```javascript
function testToolN() {
  const testData = {
    field1: 'test',
    field2: 'value',
    q1: '3',
    q2: '4',
    q3: '5'
  };

  // Test validation
  const validation = ToolN.validate(testData);
  Logger.log('Validation:', validation);

  // Test processing
  const result = ToolN.process('TEST001', testData);
  Logger.log('Process result:', result);

  // Test insights
  const insights = ToolN.generateInsights(testData, 'TEST001');
  Logger.log('Insights:', insights);
}
```

### **2. End-to-End Testing**

1. **Login as TEST001**
2. **Complete Tool 1** (if prerequisite)
3. **Start your tool** - Check it appears on dashboard
4. **Page 1** - Fill out, click Next
5. **Draft save** - Close browser, reopen, verify data restored
6. **Complete assessment** - Submit final page
7. **Report display** - Check report shows on dashboard
8. **Data verification** - Check RESPONSES sheet for saved data
9. **Insights** - Check CrossToolInsights sheet
10. **Tool unlock** - Verify next tool unlocks

### **3. Edge Cases**

- Empty/null values
- Invalid scale values (0, <-5, >5)
- Very long text inputs
- Special characters
- Previous tool data missing
- GPT API failure (if using AI)

---

## 📚 Complete Working Examples

### **Tool 1: Pure Algorithmic**
**Location:** `tools/tool1/Tool1.js`

**Pattern:**
- 5 pages, 26 questions
- All scale questions (-5 to +5, but with 0 - needs update)
- Calculates 6 trauma category scores
- Template-based report
- No GPT usage
- Generates insights for Tool 2

**Learn From:**
- Multi-page structure
- Scale question rendering
- Algorithmic scoring
- Insight generation without AI

---

### **Tool 2: Hybrid (Algo + GPT)**
**Location:** `tools/tool2/Tool2.js` (when implemented)

**Pattern:**
- 5 pages, 57 questions
- Mix of scales, selects, numeric inputs, free-text
- Pre-fills from Tool 1
- Adaptive questions (2 shown based on Tool 1 trauma)
- Algorithmic domain scoring
- GPT analysis of 8 free-text responses
- Hybrid report (scores + AI insights)
- Cost: ~$0.02 per report

**Learn From:**
- Pre-filling previous tool data
- Adaptive question logic
- Numeric input validation
- GPT integration patterns
- Hybrid scoring (algo + AI)
- Cost-effective AI usage

---

## ✅ Implementation Checklist

When building a new tool:

**Planning:**
- [ ] Define tool purpose and assessment goals
- [ ] Determine if GPT is needed (cost/benefit)
- [ ] Decide on page count and question distribution
- [ ] Identify any adaptive questions needed

**Setup:**
- [ ] Create `tools/toolN/` directory
- [ ] Create `tool.manifest.json`
- [ ] Copy `MultiPageToolTemplate.js` to `ToolN.js`
- [ ] Create `ToolNReport.js`

**Implementation:**
- [ ] Update manifest with correct metadata
- [ ] Implement page content methods (1-N)
- [ ] Implement scoring logic in `processResults()`
- [ ] Implement report generation
- [ ] Add GPT integration if needed
- [ ] Implement `generateInsights()` for next tools
- [ ] Register tool in `Code.js`

**Testing:**
- [ ] Unit test validation logic
- [ ] Unit test scoring calculations
- [ ] End-to-end test with TEST001
- [ ] Test draft save/resume
- [ ] Test adaptive questions (if any)
- [ ] Test GPT integration (if any)
- [ ] Verify data saves to RESPONSES
- [ ] Verify insights save to CrossToolInsights
- [ ] Test next tool unlock

**Deployment:**
- [ ] `clasp push`
- [ ] `clasp deploy --description "vX.Y.Z - Tool N complete"`
- [ ] Production test with TEST001
- [ ] Git commit and push
- [ ] Update documentation

---

## 🔄 Response Management & Edit Mode (v3.3.0)

**NEW:** All tools now support View/Edit/Retake functionality via ResponseManager.

### **Why This Matters:**
- Students can fix mistakes without retaking entire assessment
- Version history preserved (last 2 versions)
- Dashboard shows appropriate actions based on tool state
- Consistent UX across all 8 tools

### **Implementation Steps:**

#### **Step 1: Update `getExistingData()`**
Check for EDIT_DRAFT before PropertiesService:

```javascript
getExistingData(clientId) {
  try {
    // First check for EDIT_DRAFT from ResponseManager
    if (typeof DataService !== 'undefined') {
      const activeDraft = DataService.getActiveDraft(clientId, 'toolN');

      if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
        Logger.log(`Found active draft with status: ${activeDraft.status}`);
        return activeDraft.data;
      }
    }

    // Fallback to PropertiesService (legacy)
    const userProperties = PropertiesService.getUserProperties();
    const draftKey = `toolN_draft_${clientId}`;
    const draftData = userProperties.getProperty(draftKey);

    if (draftData) {
      return JSON.parse(draftData);
    }
  } catch (error) {
    Logger.log(`Error getting existing data: ${error}`);
  }
  return null;
}
```

#### **Step 2: Add Edit Banner to `renderPageContent()`**
Show banner when in edit mode:

```javascript
renderPageContent(page, existingData, clientId) {
  let content = '';

  // Add edit mode banner if editing
  if (existingData && existingData._editMode) {
    const originalDate = existingData._originalTimestamp ?
      new Date(existingData._originalTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'previous submission';

    content += `
      <div class="edit-mode-banner" style="
        background: rgba(173, 145, 104, 0.1);
        border: 2px solid #ad9168;
        border-radius: 10px;
        padding: 15px 20px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <strong style="color: #ad9168; font-size: 16px;">✏️ Edit Mode</strong>
          <p style="margin: 5px 0 0 0; color: #fff; font-size: 14px;">
            You're editing your response from ${originalDate}
          </p>
        </div>
        <button
          type="button"
          onclick="cancelEdit()"
          style="
            background: transparent;
            color: #ad9168;
            border: 1px solid #ad9168;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          "
          onmouseover="this.style.background='rgba(173, 145, 104, 0.1)'"
          onmouseout="this.style.background='transparent'"
        >
          Cancel Edit
        </button>
      </div>

      <script>
        function cancelEdit() {
          if (confirm('Cancel editing and discard changes?')) {
            google.script.run
              .withSuccessHandler(function() {
                window.location.href = '${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}';
              })
              .withFailureHandler(function(error) {
                alert('Error canceling edit: ' + error.message);
              })
              .cancelEditDraft('${clientId}', 'toolN');
          }
        }
      </script>
    `;
  }

  // Add page-specific content
  switch(page) {
    case 1:
      content += this.renderPage1Content(existingData, clientId);
      break;
    // ... etc
  }

  return content;
}
```

#### **Step 3: Update `processFinalSubmission()`**
Detect edit mode and route accordingly:

```javascript
processFinalSubmission(clientId) {
  try {
    const allData = this.getExistingData(clientId);

    if (!allData) {
      throw new Error('No data found. Please start the assessment again.');
    }

    // Check if this is an edit or new submission
    const isEditMode = allData._editMode === true;

    Logger.log(`Processing ${isEditMode ? 'edited' : 'new'} submission for ${clientId}`);

    // Calculate scores/process data
    const results = this.processResults(allData);

    // Prepare data package
    const dataPackage = {
      formData: allData,
      results: results
      // ... any other data
    };

    // Save based on mode
    if (isEditMode && typeof DataService !== 'undefined') {
      // Submit edited response (uses ResponseManager)
      const result = DataService.submitEditedResponse(clientId, 'toolN', dataPackage);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save edited response');
      }

      Logger.log('Edited response submitted successfully');
    } else {
      // Save new response (traditional method)
      this.saveToResponses(clientId, dataPackage);

      Logger.log('New response submitted successfully');
    }

    // Unlock next tool (only on new submission, not edit)
    if (!isEditMode) {
      ToolAccessControl.adminUnlockTool(clientId, 'toolN+1', 'system', 'Auto-unlocked after Tool N completion');
    }

    // Return redirect URL
    const reportUrl = `${ScriptApp.getService().getUrl()}?route=toolN_report&client=${clientId}`;
    return {
      redirectUrl: reportUrl
    };

  } catch (error) {
    Logger.log(`Error processing final submission: ${error}`);
    throw error;
  }
}
```

#### **Step 4: Add Edit Button to Report**
In `ToolNReport.js`:

```javascript
// In action buttons section
<div class="action-buttons">
  <button class="btn-primary" onclick="downloadPDF()">📥 Download PDF</button>
  <button class="btn-secondary" onclick="editResponse()">✏️ Edit My Answers</button>
  <button class="btn-secondary" onclick="backToDashboard()">← Back to Dashboard</button>
</div>

<script>
  function editResponse() {
    if (confirm('Load your responses into the form for editing?')) {
      showLoading('Loading your responses...');

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            window.location.href = baseUrl + '?route=toolN&client=' + clientId + '&page=1';
          } else {
            hideLoading();
            alert('Error loading response: ' + result.error);
          }
        })
        .withFailureHandler(function(error) {
          hideLoading();
          alert('Error: ' + error.message);
        })
        .loadResponseForEditing(clientId, 'toolN');
    }
  }
</script>
```

### **What ResponseManager Does Automatically:**

✅ **Creates EDIT_DRAFT** when user clicks "Edit Answers"
✅ **Marks old version** as `Is_Latest = false`
✅ **Loads pre-filled form** with all previous answers
✅ **Saves new version** on submit with `Is_Latest = true`
✅ **Cleans up old versions** (keeps last 2 automatically)
✅ **Handles cancel** (restores original, deletes EDIT_DRAFT)
✅ **Manages draft persistence** across sessions

### **Dashboard Integration (Automatic):**

Router.js automatically checks tool status and shows:
- **Not Started:** "Start Assessment" button
- **In Progress:** "Continue" + "Discard Draft" buttons
- **Completed:** "View Report" + "Edit Answers" + "Start Fresh" buttons

No additional code needed in your tool!

### **Testing Edit Mode:**

1. Complete your tool with TEST001
2. Go to dashboard → Click "Edit Answers"
3. Form loads with edit banner + all answers
4. Change one answer
5. Submit
6. Check RESPONSES sheet:
   - Old row: `Is_Latest = false`
   - New row: `Is_Latest = true`
7. Click "Edit Answers" again
8. Click "Cancel Edit" in banner
9. Confirm - should return to dashboard (completed state)

### **Common Mistakes to Avoid:**

❌ **Don't** clear draft on edit mode (let ResponseManager handle it)
❌ **Don't** re-unlock tools when editing (check `!isEditMode`)
❌ **Don't** call `saveToolResponse()` directly (use ResponseManager)
❌ **Don't** forget to check `_editMode` flag before saving
❌ **Don't** modify `Is_Latest` flags manually

✅ **Do** use `DataService` wrapper methods
✅ **Do** check for EDIT_DRAFT in `getExistingData()`
✅ **Do** show edit banner when `_editMode = true`
✅ **Do** route to ResponseManager when editing
✅ **Do** test cancel, complete, and fresh start flows

---

## 🎯 Best Practices

### **Code Quality:**
1. **Use FormUtils** - Don't reinvent form handling
2. **Separate concerns** - Report logic in separate file
3. **Validate thoroughly** - Trust no user input
4. **Handle errors gracefully** - Use try/catch, log errors
5. **Comment non-obvious logic** - Future you will thank you

### **User Experience:**
1. **Progress indicators** - FormUtils provides this
2. **Clear instructions** - Tell users what to expect
3. **Draft auto-save** - Already handled by FormUtils
4. **Mobile-friendly** - Test on phone/tablet
5. **Encouraging tone** - Positive, supportive language

### **Performance:**
1. **Minimize API calls** - Batch GPT requests
2. **Cache where possible** - OpenAI service handles this
3. **Optimize page size** - Don't load all pages at once
4. **Async operations** - Don't block UI
5. **Error fallbacks** - Always have a plan B

### **Cost Management (GPT):**
1. **Use GPT-4o-mini** - 90% cheaper than GPT-4
2. **Concise prompts** - Fewer tokens = lower cost
3. **Batch requests** - Parallel API calls
4. **Cache insights** - Avoid regenerating same analysis
5. **Fallback templates** - If API fails or budget exceeded

---

## 🚀 Next Steps

1. **Review existing tools:**
   - Study Tool 1 code thoroughly
   - Wait for Tool 2 implementation to see GPT patterns

2. **Plan your tool:**
   - Sketch out page flow
   - List all questions
   - Decide on scoring approach

3. **Start building:**
   - Copy MultiPageToolTemplate.js
   - Build page by page
   - Test frequently

4. **Get help:**
   - Reference ARCHITECTURE.md
   - Review this guide
   - Check Tool 1/2 examples

---

**You've got this!** 🎉

The framework does the heavy lifting. You just focus on:
- Good questions
- Smart scoring
- Valuable insights

---

**Last Updated:** November 4, 2024
**Next:** Build Tool 3 using this guide!
