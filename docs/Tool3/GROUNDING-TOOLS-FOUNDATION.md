# Grounding Tools Foundation - Financial TruPath v3

**Version:** 1.0.0
**Created:** November 10, 2025
**Status:** 🏗️ Architecture Design Phase
**Target Tools:** Tool 3 (False Self/External Validation), Tool 5 (Issues Showing Love), Tool 7 (Control/Fear)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Philosophy & Design Principles](#philosophy--design-principles)
3. [The Grounding Tool Pattern](#the-grounding-tool-pattern)
4. [Architecture Overview](#architecture-overview)
5. [Shared Utilities Specification](#shared-utilities-specification)
6. [Tool Implementation Pattern](#tool-implementation-pattern)
7. [Integration with v3 Framework](#integration-with-v3-framework)
8. [Migration from v2](#migration-from-v2)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Benefits & ROI Analysis](#benefits--roi-analysis)
11. [Testing Strategy](#testing-strategy)
12. [Future Extensibility](#future-extensibility)

---

## 🎯 Executive Summary

### **The Challenge**

Tools 3, 5, and 7 from v2 share a common "grounding tool" pattern:
- Multi-domain psychological assessments (2-7 domains each)
- Standardized 4-aspect framework (Belief, Behavior, Feeling, Consequence)
- Scale-based questions (-3 to +3)
- Domain quotient calculations
- Progressive GPT analysis with chaining
- Cohort-based narrative generation

**Current State (v2):**
- 3 separate implementations (~1,500 lines each)
- Significant code duplication (60-70%)
- Hardcoded column numbers
- Inconsistent patterns
- Total: ~4,500 lines of mostly duplicated code

**Proposed State (v3):**
- 4 shared grounding utilities (~1,200 lines total)
- 3 tool implementations (~250 lines each)
- Total: ~1,950 lines (57% reduction)
- Consistent patterns across all grounding tools
- Dynamic column mapping
- CONFIG-driven values

### **The Solution**

Create specialized shared utilities for grounding tools that follow v3's proven architectural patterns from the v3.9.0 refactoring, where 7 shared utilities eliminated 400+ lines of duplicate code across Tool 1 and Tool 2.

**Key Innovation:** Treat grounding tools as a **specialized tool category** with their own shared infrastructure, just as v3 has shared utilities for all tools (EditModeBanner, DraftService, etc.).

---

## 🧠 Philosophy & Design Principles

### **1. Core Never Changes**

**Principle:** The v3 framework core remains untouched when adding new tool types.

**Application to Grounding Tools:**
- ✅ Grounding utilities live in `/shared/grounding/` (not core)
- ✅ Tools register themselves via ToolRegistry (existing pattern)
- ✅ Use existing DataService, ResponseManager, FormUtils
- ✅ No modifications to FrameworkCore or Router

**Why This Matters:**
- Core stability preserved
- New developers can add tools without risk
- Framework scales to 50+ tools without core changes

---

### **2. Don't Repeat Yourself (DRY)**

**Principle:** Write shared code once, use it everywhere.

**Proven Success:** v3.9.0 refactoring (January 2025)
- Created 7 shared utilities (EditModeBanner, DraftService, etc.)
- Eliminated 400+ lines of duplicate code
- Reduced Code.js from 1,086 → 696 lines (-36%)
- Consistent patterns across all tools

**Application to Grounding Tools:**
- ✅ 60-70% of grounding tool code is identical across Tools 3, 5, 7
- ✅ Create 4 specialized utilities for grounding tools
- ✅ Each tool becomes ~250 lines of configuration + assembly
- ✅ Save 2,500+ lines of duplicate code

**ROI Calculation:**
```
Without Foundation:
- Tool 3: ~500 lines
- Tool 5: ~500 lines
- Tool 7: ~500 lines
- Total: 1,500 lines × 3 = 4,500 lines

With Foundation:
- Foundation utilities: ~1,200 lines (write once)
- Tool 3 config: ~250 lines
- Tool 5 config: ~250 lines
- Tool 7 config: ~250 lines
- Total: 1,200 + (250 × 3) = 1,950 lines

Savings: 2,550 lines (57% reduction)
Development time: 22-32 hours vs 50-60 hours (40-50% faster)
```

---

### **3. Configuration Over Code**

**Principle:** Define behavior in configuration, not implementation.

**Application to Grounding Tools:**
- ✅ Domain definitions as config objects (not hardcoded logic)
- ✅ Scale labels as arrays (reusable, swappable)
- ✅ GPT prompts in tool-specific files (not embedded)
- ✅ Cohort thresholds calculated from data (not hardcoded)

**Example:**
```javascript
// ✅ GOOD: Configuration
const domainConfig = {
  Suffering: {
    name: 'Suffering',
    belief: {
      title: 'How much do you believe...',
      choices: ['-3 = ...', '+3 = ...']
    }
  }
};

// ❌ BAD: Hardcoded implementation
function renderSufferingBelief() {
  return '<select>...</select>'; // Locked in code
}
```

---

### **4. Consistency Through Shared Patterns**

**Principle:** Users should have identical experiences across similar tools.

**Application to Grounding Tools:**
- ✅ All grounding tools render questions the same way
- ✅ All calculate quotients identically
- ✅ All use same GPT analysis pattern
- ✅ All generate reports with same structure
- ✅ All handle errors consistently

**User Experience:**
- Student completes Tool 3 → learns pattern
- Tool 5 feels familiar → faster completion
- Tool 7 reinforces pattern → confidence

---

### **5. Learn from v2, Improve in v3**

**Principle:** Preserve what worked, fix what didn't.

**v2 Strengths to Preserve:**
- ✅ 4-aspect framework (Belief, Behavior, Feeling, Consequence)
- ✅ Domain quotient calculations
- ✅ Progressive GPT chaining (each domain builds on previous)
- ✅ 3-tier fallback system (100% reliability)
- ✅ Cohort-based narratives

**v2 Weaknesses to Fix:**
- ❌ Hardcoded column numbers → ✅ Dynamic column mapping (Tool 7 pattern)
- ❌ Manual sheet operations → ✅ Use DataService (Is_Latest column)
- ❌ Hardcoded values → ✅ Use CONFIG constants
- ❌ Copy/paste code → ✅ Shared utilities
- ❌ Inconsistent error handling → ✅ Use ErrorHandler utility

---

### **6. Progressive Enhancement**

**Principle:** Build foundation incrementally, validate at each step.

**Implementation Strategy:**
1. **Phase 1:** Build GroundingFormBuilder (basic rendering)
   - Test with 1 domain, 4 questions
   - Validate before moving forward

2. **Phase 2:** Add GroundingScoring (calculations)
   - Test quotient calculations
   - Validate cohort narratives

3. **Phase 3:** Add GroundingGPT (AI analysis)
   - Test single domain analysis
   - Test progressive chaining
   - Validate fallback system

4. **Phase 4:** Add GroundingReport (presentation)
   - Test report sections
   - Validate PDF generation

**Why This Approach:**
- ✅ Catch issues early
- ✅ Each phase delivers value
- ✅ Can use partially-complete foundation
- ✅ Lower risk than "big bang" approach

---

### **7. Tool-Specific Intelligence, Shared Infrastructure**

**Principle:** Utilities provide infrastructure, tools provide intelligence.

**Shared Infrastructure (Grounding Utilities):**
- Form rendering mechanics
- Scoring calculations
- GPT calling patterns
- Report structure generation

**Tool-Specific Intelligence:**
- Domain definitions and names
- Question wording and scales
- GPT prompts and fallback content
- Narrative customization

**Boundary Example:**
```javascript
// ✅ Utility provides mechanics:
GroundingFormBuilder.renderDomain(domainConfig, data, domainKey);

// ✅ Tool provides content:
const domainConfig = {
  Suffering: {
    name: 'Suffering',  // Tool-specific
    belief: { /* Tool-specific question */ }
  }
};
```

---

## 🏗️ The Grounding Tool Pattern

### **What Defines a Grounding Tool?**

A grounding tool is characterized by:

1. **Multi-Domain Structure**
   - Assesses 2-7 psychological/behavioral domains
   - Each domain represents a distinct pattern (e.g., Suffering, Control, False Self)

2. **4-Aspect Framework**
   - Every domain measures the same 4 aspects:
     - **Belief/Type:** Core belief or worldview
     - **Behavior:** Observable actions
     - **Feeling/Emotional State:** Internal experience
     - **Consequence/Impact:** Results and effects

3. **Scale-Based Questions**
   - Uses -3 to +3 scale (no zero)
   - Forces intentionality (no fence-sitting)
   - Cleaner interpretation (negative = struggle, positive = strength)

4. **Domain Quotients**
   - Calculate average of 4 aspects per domain
   - Overall quotient = average of all domains
   - Identify highest impact domain

5. **Optional Open-Ended Responses**
   - 1-2 reflection questions per domain
   - Provides context for GPT analysis

6. **Progressive GPT Analysis**
   - Each domain analyzed individually
   - Analysis builds on previous domain (chaining)
   - Final synthesis connects all domains
   - 3-tier fallback ensures 100% reliability

7. **Cohort-Based Narrative**
   - Compare to cohort (5th/95th percentile)
   - Classify as Low/Medium/High
   - Generate coaching narrative

### **Why These Tools Are Different**

**Comparison to Other Tool Types:**

| Aspect | Simple Tools (Tool 1) | Hybrid Tools (Tool 2) | Grounding Tools (3, 5, 7) |
|--------|----------------------|---------------------|--------------------------|
| **Structure** | Custom | Custom | **Standardized 4-aspect** |
| **Domains** | 1-6 varied | 5 custom | **2-7 identical structure** |
| **Scoring** | Algorithmic | Hybrid | **Quotient-based** |
| **GPT Pattern** | None | Per response | **Progressive chaining** |
| **Code Overlap** | Low | Low | **High (60-70%)** |
| **Shared Utilities?** | General (FormUtils) | General + GPT | **Need specialized** |

**Conclusion:** Grounding tools share enough patterns to warrant specialized infrastructure.

---

## 🏛️ Architecture Overview

### **High-Level Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                    v3 Framework Core                        │
│  (Router, ToolRegistry, DataService, FormUtils, etc.)      │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
      ▼                             ▼
┌─────────────────┐         ┌──────────────────────┐
│ General Shared  │         │ Grounding Shared     │
│ Utilities       │         │ Utilities (NEW)      │
│ (v3.9.0)        │         │                      │
├─────────────────┤         ├──────────────────────┤
│ EditModeBanner  │         │ GroundingFormBuilder │
│ DraftService    │         │ GroundingScoring     │
│ ReportBase      │         │ GroundingGPT         │
│ ErrorHandler    │         │ GroundingReport      │
│ Validator       │         │                      │
│ NavigationHelp  │         │                      │
│ PDFGenerator    │         │                      │
└─────────────────┘         └──────────────────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     ▼               ▼               ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │ Tool 3   │    │ Tool 5   │    │ Tool 7   │
              │ (Config) │    │ (Config) │    │ (Config) │
              └──────────┘    └──────────┘    └──────────┘
```

### **Component Relationships**

1. **Framework Core** (unchanged)
   - Router handles requests
   - ToolRegistry discovers tools
   - DataService manages persistence
   - FormUtils provides form infrastructure

2. **General Shared Utilities** (existing v3.9.0)
   - Used by ALL tools
   - Examples: EditModeBanner, DraftService, Validator

3. **Grounding Shared Utilities** (new)
   - Used by grounding tools (3, 5, 7)
   - Specialized for 4-aspect domain pattern
   - Optional for other tools

4. **Individual Tools** (plugins)
   - Implement ToolInterface
   - Provide configuration and content
   - Assemble using shared utilities

### **Data Flow**

```
User Completes Form
    ↓
Tool renders using GroundingFormBuilder
    ↓
User submits → Tool.processFinalSubmission()
    ↓
Calculate scores using GroundingScoring
    ↓
Analyze with GPT using GroundingGPT (progressive chaining)
    ↓
Save via DataService (Is_Latest column management)
    ↓
Generate report using GroundingReport
    ↓
Display to user
```

---

## 🔧 Shared Utilities Specification

### **1. GroundingFormBuilder.js**

**Purpose:** Render standardized 4-aspect domain questions

**Core Responsibilities:**
- Render complete domains (4 questions + optional open responses)
- Handle -3 to +3 scale rendering
- Support custom scale labels per question
- Pre-fill existing data for resume/edit
- Generate consistent HTML structure

**Key Methods:**
```javascript
// Render complete domain (4 aspects + open responses)
renderDomain(domainConfig, existingData, domainKey): string

// Render single aspect question with scale
renderAspectQuestion(question, fieldName, existingData): string

// Render open-ended reflection question
renderOpenResponse(question, fieldName, existingData): string

// Render scale options (reusable across questions)
renderScaleOptions(choices, selectedValue): string
```

**Configuration Schema:**
```javascript
domainConfig = {
  name: string,              // Display name
  description?: string,      // Optional intro text
  belief: {
    title: string,          // Question text
    choices: string[]       // ['-3 = ...', ..., '+3 = ...']
  },
  behavior: { /* same */ },
  feeling: { /* same */ },
  consequence: { /* same */ },
  openResponses?: string[]  // Optional reflection questions
}
```

**Dependencies:**
- None (pure rendering utility)
- Uses CONFIG.UI for styling

**Testing Strategy:**
- Unit test: Single domain rendering
- Unit test: Pre-fill with existing data
- Unit test: Custom vs. default scale labels
- Integration test: Full page with multiple domains

---

### **2. GroundingScoring.js**

**Purpose:** Calculate domain quotients and identify patterns

**Core Responsibilities:**
- Normalize scale values (-3 to +3 → 0 to 100)
- Calculate domain quotients (avg of 4 aspects)
- Calculate overall quotient (avg of all domains)
- Identify highest impact domain
- Generate cohort-based classifications
- Produce narrative text

**Key Methods:**
```javascript
// Normalize single scale value
normalizeScale(value: string|number): number|null

// Calculate quotient for one domain
calculateDomainQuotient(formData, domainKey): number|null

// Calculate all domain quotients
calculateAllQuotients(formData, domainKeys[]): Object

// Calculate overall quotient
calculateOverallQuotient(domainQuotients): number|null

// Find highest impact domain
identifyHighestImpactDomain(domainQuotients): {domain, score}

// Generate cohort-based narrative
generateCohortNarrative(overallQuotient, highestDomain, allScores): Object

// Get narrative text templates
getInsightText(level, gapLabel, domainName): Object
```

**Algorithm Details:**

**Scale Normalization:**
```
Input: -3, -2, -1, 1, 2, 3 (no zero)
Formula: ((value + 3) / 6) * 100
Output: 0, 16.67, 33.33, 66.67, 83.33, 100
```

**Domain Quotient:**
```
Quotient = (belief + behavior + feeling + consequence) / 4
Higher score = greater impact/struggle
```

**Cohort Classification:**
```
1. Collect all student scores for cohort
2. Calculate 5th percentile (p5) and 95th percentile (p95)
3. Calculate range = p95 - p5
4. Low threshold = p5 + (range × 0.33)
5. High threshold = p5 + (range × 0.66)
6. Classify:
   - score < low threshold → Low
   - score < high threshold → Medium
   - score ≥ high threshold → High
```

**Gap Analysis:**
```
Gap = highest_domain_score - overall_score
- Gap ≤ 7 → "Close Match" (consistent across domains)
- Gap ≤ 14 → "Moderate Gap" (one domain slightly elevated)
- Gap > 14 → "Isolated Spike" (one domain driving pattern)
```

**Dependencies:**
- None (pure calculation utility)
- Optionally uses CONFIG for thresholds

**Testing Strategy:**
- Unit test: Scale normalization (-3→0, +3→100)
- Unit test: Domain quotient calculation
- Unit test: Highest domain identification
- Unit test: Cohort classification (mock data)
- Unit test: Gap analysis labels

---

### **3. GroundingGPT.js**

**Purpose:** Progressive GPT analysis with 3-tier fallback

**Core Responsibilities:**
- Analyze individual domains with GPT
- Progressive chaining (each domain builds on previous)
- 3-tier fallback (GPT → Retry → Fallback)
- Final synthesis across all domains
- Integration with OpenAIService

**Key Methods:**
```javascript
// Analyze single domain
analyzeDomain(config): {analysis, summary, reflectionPrompt, source}

// Analyze all domains with progressive chaining
analyzeAllDomains(config): Object<domainKey, analysis>

// Final synthesis of all insights
synthesizeOverall(domainAnalyses): {overallAnalysis, overallSuggestions, overallReflection}

// Build system prompt for domain
buildSystemPrompt(domainKey, demographics): string

// Build user prompt with chaining
buildUserPrompt(scores, openResponses, previousAnalysis): string

// Call GPT with error handling
callGPT(config): Object

// Validate GPT response
isValidInsight(result): boolean

// Extract domain scores from form data
extractDomainScores(formData, domainKey): Object

// Extract open responses
extractOpenResponses(formData, domainKey): string[]
```

**Progressive Chaining Pattern:**
```javascript
// Domain 1: No previous context
analysis1 = analyzeDomain({
  domainKey: 'Suffering',
  previousAnalysis: null
});

// Domain 2: Builds on Domain 1
analysis2 = analyzeDomain({
  domainKey: 'Sacrificing',
  previousAnalysis: {
    analysis: analysis1.analysis,
    summary: analysis1.summary,
    reflection: analysis1.reflectionPrompt
  }
});

// Domain 3: Builds on Domain 2, etc.
```

**3-Tier Fallback System:**
```
TIER 1: Try GPT (gpt-4o-mini)
   ↓ Success? Return personalized insight
   ↓ Fail? Log error, continue
TIER 2: Retry GPT after 2s
   ↓ Success? Return personalized insight
   ↓ Fail? Log error, continue
TIER 3: Use domain-specific fallback
   ↓ Always succeeds (100% reliability)
```

**GPT Configuration:**
```javascript
{
  model: 'gpt-4o-mini',      // Individual domain analysis
  temperature: 0.2,           // Low for consistency
  maxTokens: 900,            // ~300 words per insight
  // Final synthesis uses gpt-4o for better coherence
}
```

**Cost Estimates (per student):**
```
Tool 5 (5 domains):
- 5 domain analyses × gpt-4o-mini (~$0.003 each) = $0.015
- 1 synthesis × gpt-4o (~$0.005) = $0.005
- Total: ~$0.020 per student

Tool 7 (4 domains):
- 4 domain analyses × gpt-4o-mini = $0.012
- 1 synthesis × gpt-4o = $0.005
- Total: ~$0.017 per student
```

**Dependencies:**
- OpenAIService (existing v3 service)
- DraftService (for caching insights during form)
- ErrorHandler (for consistent error handling)
- Logger (for fallback tracking)

**Testing Strategy:**
- Unit test: Single domain analysis (mock GPT)
- Unit test: Progressive chaining (3 domains)
- Integration test: 3-tier fallback (force failures)
- Integration test: Synthesis generation
- Production test: Real GPT calls with test data

---

### **4. GroundingReport.js**

**Purpose:** Generate consistent report sections for grounding tools

**Core Responsibilities:**
- Build domain scores visualization
- Build cohort narrative section
- Build detailed domain insights
- Format GPT analysis for display
- Generate PDF-friendly HTML
- Source attribution (✨ GPT vs 📋 Fallback)

**Key Methods:**
```javascript
// Build visual domain scores section
buildDomainScoresSection(domainQuotients, domainNames): string

// Build cohort classification section
buildCohortSection(cohortNarrative): string

// Build detailed insights per domain
buildDomainInsightsSection(domainAnalyses, domainNames): string

// Build overall synthesis section
buildOverallSection(synthesis): string

// Format suggestions as bullet list
formatSuggestions(summaryText): string

// Get score color based on percentage
getScoreColor(percentage): string

// Build complete report HTML
buildCompleteReport(results, clientId): string

// Build PDF version (optimized for print)
buildPDFReport(results, clientId): string
```

**Report Structure:**
```html
<div class="report-container">
  <!-- 1. Summary Overview -->
  <section>
    <h1>Your Pattern Overview</h1>
    <p>Overall Score: X/100 (Level: Low/Medium/High)</p>
  </section>

  <!-- 2. Domain Scores (Visual) -->
  <section>
    <h2>Domain Scores</h2>
    [Progress bars for each domain]
  </section>

  <!-- 3. Cohort Narrative -->
  <section>
    <h2>Your Pattern Level</h2>
    [Cohort-based coaching narrative]
  </section>

  <!-- 4. Detailed Insights (per domain) -->
  <section>
    <h2>Detailed Insights</h2>
    [Analysis, Suggestions, Reflection per domain]
  </section>

  <!-- 5. Overall Synthesis -->
  <section>
    <h2>Overall Insights</h2>
    [GPT synthesis connecting all domains]
  </section>

  <!-- 6. Action Steps -->
  <section>
    <h2>Next Steps</h2>
    [Prioritized action items]
  </section>
</div>
```

**Visual Elements:**
```css
/* Score bars with color coding */
.score-bar {
  0-39: green (low impact)
  40-69: yellow (moderate impact)
  70-100: red (high impact)
}

/* Source attribution */
✨ = GPT-generated (personalized)
📋 = Fallback (general guidance)
```

**Dependencies:**
- ReportBase (existing v3 utility for data retrieval)
- CONFIG.UI (for consistent colors)
- PDFGenerator (for PDF export integration)

**Testing Strategy:**
- Unit test: Each section builder method
- Visual test: Complete report rendering
- PDF test: Print layout and formatting
- Accessibility test: Screen reader compatibility

---

## 🛠️ Tool Implementation Pattern

### **Standard Tool Structure**

Every grounding tool follows this pattern:

```javascript
// tools/toolN/ToolN.js

const ToolN = {
  // ===== CONFIGURATION =====
  id: 'toolN',
  manifest: null,  // Injected by ToolRegistry

  // Domain definitions (tool-specific)
  domainConfig: {
    Domain1: {
      name: 'Domain Display Name',
      description: 'Brief description',
      belief: { title: '...', choices: [...] },
      behavior: { title: '...', choices: [...] },
      feeling: { title: '...', choices: [...] },
      consequence: { title: '...', choices: [...] },
      openResponses: ['Question 1?', 'Question 2?']
    },
    // ... more domains
  },

  // ===== REQUIRED: INITIALIZE =====
  initialize(deps, insights) {
    this.dataService = deps.dataService;
    this.previousInsights = insights || [];
    return { success: true };
  },

  // ===== REQUIRED: RENDER =====
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;

    // Handle URL parameters (edit mode, clear draft)
    if (params.editMode === 'true' && page === 1) {
      DataService.loadResponseForEditing(clientId, this.id);
    }
    if (params.clearDraft === 'true' && page === 1) {
      DataService.startFreshAttempt(clientId, this.id);
    }

    // Get existing data
    const existingData = this.getExistingData(clientId);

    // Render page content using GroundingFormBuilder
    const pageContent = this.renderPageContent(page, existingData, clientId);

    // Use FormUtils for standard structure
    return FormUtils.buildStandardPage({
      toolName: this.manifest.name,
      toolId: this.id,
      page: page,
      totalPages: this.manifest.totalPages,
      clientId: clientId,
      pageContent: pageContent,
      isFinalPage: (page === this.manifest.totalPages)
    });
  },

  // ===== PAGE ROUTING =====
  renderPageContent(page, data, clientId) {
    const domains = Object.keys(this.domainConfig);

    // Example: 1 domain per page
    if (page <= domains.length) {
      const domainKey = domains[page - 1];
      // ✅ USE: GroundingFormBuilder utility
      return GroundingFormBuilder.renderDomain(
        this.domainConfig[domainKey],
        data,
        domainKey
      );
    }

    // Final page: Review
    return this.renderReviewPage(data);
  },

  // ===== DATA MANAGEMENT =====
  getExistingData(clientId) {
    // ✅ USE: DraftService utility
    const draft = DraftService.getDraft(this.id, clientId);
    if (draft) return draft;

    // Fallback to ResponseManager
    if (typeof DataService !== 'undefined') {
      const activeDraft = DataService.getActiveDraft(clientId, this.id);
      if (activeDraft) return activeDraft.data;
    }

    return null;
  },

  savePageData(clientId, page, formData) {
    // ✅ USE: DraftService utility
    DraftService.saveDraft(this.id, clientId, page, formData);
    return { success: true };
  },

  // ===== VALIDATION =====
  validate(data) {
    const errors = [];

    // ✅ USE: Validator utility
    Object.keys(this.domainConfig).forEach(domainKey => {
      ['belief', 'behavior', 'feeling', 'consequence'].forEach(aspect => {
        const fieldName = `${domainKey}_${aspect}`;
        try {
          Validator.validateScaleValue(data[fieldName], fieldName);
        } catch (error) {
          errors.push(error.message);
        }
      });
    });

    return { valid: errors.length === 0, errors };
  },

  // ===== PROCESSING =====
  processFinalSubmission(clientId) {
    const allData = this.getExistingData(clientId);
    const isEditMode = allData._editMode === true;

    // ✅ USE: GroundingScoring utility
    const domainKeys = Object.keys(this.domainConfig);
    const quotients = GroundingScoring.calculateAllQuotients(allData, domainKeys);
    const overall = GroundingScoring.calculateOverallQuotient(quotients);
    const highest = GroundingScoring.identifyHighestImpactDomain(quotients);

    // ✅ USE: GroundingGPT utility (if GPT enabled)
    let gptAnalyses = {};
    let synthesis = {};

    if (this.manifest.usesGPT) {
      gptAnalyses = GroundingGPT.analyzeAllDomains({
        domainKeys,
        formData: allData,
        domainQuotients: quotients,
        demographics: this.getDemographics(clientId),
        fallbacks: this.getFallbacks()  // Tool-specific
      });

      synthesis = GroundingGPT.synthesizeOverall(gptAnalyses);
    }

    // ✅ USE: DataService for saving (handles Is_Latest column)
    DataService.saveToolResponse(clientId, this.id, {
      data: allData,
      results: {
        domainQuotients: quotients,
        overallQuotient: overall,
        highestImpactDomain: highest
      },
      gptAnalyses,
      synthesis,
      timestamp: new Date().toISOString()
    });

    // Unlock next tool (only if not editing)
    if (!isEditMode) {
      const nextTool = this.manifest.unlocks[0];
      if (nextTool) {
        ToolAccessControl.adminUnlockTool(
          clientId,
          nextTool,
          'system',
          `Auto-unlocked after ${this.manifest.name} completion`
        );
      }
    }

    // Redirect to report
    return {
      redirectUrl: `${ScriptApp.getService().getUrl()}?route=${this.id}_report&client=${clientId}`
    };
  },

  // ===== TOOL-SPECIFIC METHODS =====

  getDemographics(clientId) {
    // Get demographics from Tool 1/2 for GPT context
    const tool1 = DataService.getLatestResponse(clientId, 'tool1');
    const tool2 = DataService.getLatestResponse(clientId, 'tool2');

    return {
      currentFinancialSituation: tool2?.data?.currentSituation,
      biggestObstacle: tool2?.data?.biggestObstacle,
      topTrauma: tool1?.results?.topTrauma
    };
  },

  getFallbacks() {
    // Return tool-specific fallback object
    // This is defined in ToolNFallbacks.js
    return ToolNFallbacks;
  },

  // ===== INSIGHTS GENERATION =====
  generateInsights(data, clientId) {
    // Optional: Generate insights for downstream tools
    return [];
  },

  getConfig() {
    return this.manifest;
  }
};
```

### **File Structure per Tool**

```
tools/toolN/
├── tool.manifest.json      # Tool configuration
├── ToolN.js               # Main implementation (250 lines)
├── ToolNReport.js         # Report generation (150 lines)
├── ToolNFallbacks.js      # Domain-specific fallbacks (200 lines)
└── ToolNConfig.js         # Domain definitions (can be separate)
```

**Total per tool:** ~600 lines (vs ~1,500 without utilities)

---

## 🔗 Integration with v3 Framework

### **1. Registration**

Grounding tools register like any other tool:

```javascript
// In Code.js or tool file
const tool3Manifest = {
  id: 'tool3',
  name: 'False Self & External Validation Assessment',
  version: '1.0.0',
  pattern: 'grounding-multipage',  // New pattern type
  totalPages: 3,
  routes: ['/tool3', '/false-self'],
  prerequisites: ['tool1', 'tool2'],
  unlocks: ['tool4'],
  usesGPT: true,
  estimatedCost: 0.03,
  estimatedTime: '15-20 minutes',
  // Grounding-specific metadata
  groundingTool: true,
  domainCount: 2,
  aspectsPerDomain: 4
};

Tool3.manifest = tool3Manifest;
ToolRegistry.register('tool3', Tool3, tool3Manifest);
```

### **2. Dependencies Injection**

Framework injects standard dependencies:

```javascript
// FrameworkCore.initializeTool()
const deps = {
  dataService: DataService,
  accessControl: ToolAccessControl,
  insightsPipeline: InsightsPipeline,
  openAI: OpenAIService  // If tool.manifest.usesGPT
};

const result = tool.initialize(deps, insights);
```

Grounding utilities are available globally (like FormUtils):
- No injection needed
- Tools import/use directly

### **3. Lifecycle Compatibility**

Grounding tools follow standard lifecycle:

```
1. Registration → ToolRegistry.register()
2. Access Check → ToolAccessControl.canAccessTool()
3. Launch → FrameworkCore.initializeTool()
4. Render → Tool.render()
5. Submit → Tool.processFinalSubmission()
6. Save → DataService.saveToolResponse()
7. Insights → Tool.generateInsights()
8. Unlock → ToolAccessControl.adminUnlockTool()
```

**No changes to core lifecycle required!**

### **4. Data Storage**

Grounding tools use standard RESPONSES sheet:

```
Columns:
1. Timestamp
2. Client_ID
3. Tool_ID
4. Data (JSON) ← Contains formData, results, gptAnalyses, synthesis
5. Version
6. Status (COMPLETED | DRAFT | EDIT_DRAFT)
7. Is_Latest (true | false)
```

**Grounding-specific data structure:**
```json
{
  "data": {
    "Suffering_belief": "-3",
    "Suffering_behavior": "-2",
    "Suffering_feeling": "-1",
    "Suffering_consequence": "1",
    "Suffering_open1": "Text response...",
    // ... all form fields
  },
  "results": {
    "domainQuotients": {
      "Suffering": 45.5,
      "Sacrificing": 52.3,
      // ...
    },
    "overallQuotient": 48.9,
    "highestImpactDomain": {
      "domain": "Sacrificing",
      "score": 52.3
    }
  },
  "gptAnalyses": {
    "Suffering": {
      "analysis": "...",
      "summary": "...",
      "reflectionPrompt": "...",
      "source": "gpt"
    },
    // ...
  },
  "synthesis": {
    "overallAnalysis": "...",
    "overallSuggestions": "...",
    "overallReflection": "...",
    "source": "gpt"
  }
}
```

### **5. Report Generation**

Reports use existing PDFGenerator pattern:

```javascript
// In /shared/PDFGenerator.js - add method for each grounding tool

PDFGenerator.generateTool3PDF = function(clientId) {
  // ✅ USE: ReportBase to get data
  const results = ReportBase.getResults(clientId, 'tool3', parseFunction);

  // ✅ USE: GroundingReport to build sections
  const html = `
    ${this.buildHeader('Tool 3 Assessment', results.data.name)}
    ${GroundingReport.buildDomainScoresSection(results.domainQuotients, domainNames)}
    ${GroundingReport.buildCohortSection(results.cohortNarrative)}
    ${GroundingReport.buildDomainInsightsSection(results.gptAnalyses, domainNames)}
    ${GroundingReport.buildOverallSection(results.synthesis)}
    ${this.buildFooter()}
  `;

  return this.htmlToPDF(html, this.generateFileName('Tool 3', results.data.name));
};

// In Code.js - add wrapper
function generateTool3PDF(clientId) {
  return PDFGenerator.generateTool3PDF(clientId);
}
```

### **6. Edit Mode Compatibility**

Grounding tools fully support edit mode via ResponseManager:

```javascript
// In render()
if (params.editMode === 'true' && page === 1) {
  DataService.loadResponseForEditing(clientId, this.id);
}

// In renderPageContent()
if (existingData && existingData._editMode) {
  const banner = EditModeBanner.render(originalDate, clientId, this.id);
  content = banner + pageContent;
}

// In processFinalSubmission()
const isEditMode = allData._editMode === true;

if (isEditMode) {
  DataService.submitEditedResponse(clientId, this.id, dataPackage);
} else {
  DataService.saveToolResponse(clientId, this.id, dataPackage);
}

// Don't unlock next tool when editing
if (!isEditMode) {
  ToolAccessControl.adminUnlockTool(...);
}
```

---

## 🔄 Migration from v2

### **What to Preserve**

✅ **Domain Definitions**
- Question wording (proven effective)
- Scale labels (carefully crafted)
- Reflection prompts
- Domain names and structures

✅ **Algorithms**
- Scale normalization formula
- Quotient calculations
- Cohort threshold logic
- Gap analysis thresholds

✅ **GPT Prompts**
- System prompts (tool expertise)
- Domain definitions
- Output format instructions
- Progressive chaining pattern

✅ **Fallback Content**
- Domain-specific fallback insights
- Pattern/Insight/Action structure
- Coaching language and tone

### **What to Upgrade**

❌ → ✅ **Column Management**
```javascript
// v2: Hardcoded
const beliefCol = 30;
const beliefLabelCol = 31;

// v3: Dynamic mapping (Tool 7 pattern)
const cols = ColumnMapper.findDomainColumns(sheet, 'Suffering');
const beliefScore = cols.scores[0];
const beliefLabel = cols.labels[0];
```

❌ → ✅ **Data Saving**
```javascript
// v2: Manual sheet operations
responseSheet.appendRow([timestamp, clientId, toolId, data, version, status]);
// Missing Is_Latest column!

// v3: Use DataService
DataService.saveToolResponse(clientId, toolId, {
  data: data,
  results: results
});
// Handles Is_Latest automatically
```

❌ → ✅ **Configuration**
```javascript
// v2: Hardcoded values
const primaryColor = '#ad9168';
const gptDelay = 1500;

// v3: CONFIG constants
const primaryColor = CONFIG.UI.PRIMARY_COLOR;
const gptDelay = CONFIG.TIMING.GPT_ANALYSIS_DELAY;
```

❌ → ✅ **Error Handling**
```javascript
// v2: Inconsistent
try {
  // ...
} catch (error) {
  console.log('Error:', error);
  return { error: error.toString() };
}

// v3: Use ErrorHandler
try {
  // ...
} catch (error) {
  throw new AppError('Processing failed', ErrorCodes.PROCESSING_ERROR, {
    clientId,
    toolId,
    error: error.message
  });
}
```

### **Migration Steps**

**Phase 1: Extract Configuration**
1. Copy domain configs from v2 → v3 config objects
2. Extract GPT prompts to separate file
3. Move fallback content to ToolNFallbacks.js

**Phase 2: Build v3 Implementation**
1. Create tool directory structure
2. Implement Tool3.js using grounding utilities
3. Implement Tool3Report.js using GroundingReport
4. Implement Tool3Fallbacks.js (copy from v2)

**Phase 3: Testing**
1. Unit test domain rendering
2. Unit test scoring calculations
3. Test GPT integration
4. Test complete submission flow
5. Test edit mode
6. Compare v2 vs v3 reports (validate consistency)

**Phase 4: Deploy**
1. Deploy to test environment
2. Test with TEST001 client
3. Compare results to v2 version
4. Fix any discrepancies
5. Deploy to production

### **Validation Checklist**

Before declaring migration complete:

- [ ] Domain scores match v2 calculations (±1%)
- [ ] Cohort classifications match v2 logic
- [ ] GPT prompts identical (or intentionally improved)
- [ ] Fallback content identical
- [ ] Report structure includes all v2 sections
- [ ] PDF generation works correctly
- [ ] Edit mode fully functional
- [ ] Draft save/resume works
- [ ] Next tool unlocks correctly
- [ ] Data saves to RESPONSES with Is_Latest
- [ ] No hardcoded column numbers
- [ ] All CONFIG constants used
- [ ] Error handling consistent

---

## 📅 Implementation Roadmap

### **Phase 1: Foundation Development (10-14 days)**

**Week 1: Core Utilities**

**Days 1-2: GroundingFormBuilder.js**
- [ ] Implement renderDomain()
- [ ] Implement renderAspectQuestion()
- [ ] Implement renderOpenResponse()
- [ ] Unit tests (4 tests)
- [ ] Visual test with sample domain

**Days 3-4: GroundingScoring.js**
- [ ] Implement normalizeScale()
- [ ] Implement calculateDomainQuotient()
- [ ] Implement calculateAllQuotients()
- [ ] Implement identifyHighestImpactDomain()
- [ ] Implement generateCohortNarrative()
- [ ] Unit tests (8 tests)

**Days 5-8: GroundingGPT.js**
- [ ] Implement analyzeDomain()
- [ ] Implement analyzeAllDomains() with chaining
- [ ] Implement synthesizeOverall()
- [ ] Implement 3-tier fallback system
- [ ] Integration tests with mock GPT (6 tests)
- [ ] Integration tests with real GPT (3 tests)

**Days 9-10: GroundingReport.js**
- [ ] Implement buildDomainScoresSection()
- [ ] Implement buildCohortSection()
- [ ] Implement buildDomainInsightsSection()
- [ ] Implement buildOverallSection()
- [ ] Visual tests (4 tests)
- [ ] PDF rendering test

**Days 11-12: Integration & Documentation**
- [ ] Test all utilities working together
- [ ] Write API documentation
- [ ] Create usage examples
- [ ] Update ARCHITECTURE.md

**Days 13-14: Buffer & Code Review**
- [ ] Address any issues found
- [ ] Code review with team
- [ ] Performance optimization
- [ ] Final testing

**Deliverable:** 4 production-ready shared utilities, fully tested and documented

---

### **Phase 2: Tool 3 Implementation (6-8 days)**

**Tool 3: False Self & External Validation (2 domains)**

**Days 1-2: Configuration & Setup**
- [ ] Create tools/tool3/ directory
- [ ] Create tool.manifest.json
- [ ] Extract domain configs from v2
- [ ] Create Tool3Config.js
- [ ] Extract fallback content → Tool3Fallbacks.js
- [ ] Extract GPT prompts

**Days 3-4: Main Implementation**
- [ ] Implement Tool3.js using grounding utilities
- [ ] Implement page rendering (2 domains)
- [ ] Implement processFinalSubmission()
- [ ] Integrate with GroundingFormBuilder
- [ ] Integrate with GroundingScoring
- [ ] Integrate with GroundingGPT

**Days 5-6: Report & Testing**
- [ ] Implement Tool3Report.js using GroundingReport
- [ ] Add PDF generation to PDFGenerator
- [ ] End-to-end testing with TEST001
- [ ] Compare results to v2 version
- [ ] Test edit mode
- [ ] Test draft save/resume

**Days 7-8: Refinement & Deploy**
- [ ] Fix any issues found
- [ ] Optimize GPT prompts if needed
- [ ] Final testing
- [ ] Deploy to production
- [ ] Monitor for first 10 real submissions

**Deliverable:** Tool 3 fully functional in production

---

### **Phase 3: Tool 5 Implementation (5-7 days)**

**Tool 5: Issues Showing Love (5 domains)**

**Days 1-2: Configuration**
- [ ] Create tools/tool5/ directory
- [ ] Extract 5 domain configs from v2
- [ ] Create Tool5Fallbacks.js
- [ ] Extract GPT prompts

**Days 3-4: Implementation**
- [ ] Implement Tool5.js (mostly config + utility calls)
- [ ] Implement page rendering (5 domains)
- [ ] Implement Tool5Report.js
- [ ] Add PDF generation

**Days 5-6: Testing & Deploy**
- [ ] End-to-end testing
- [ ] Compare to v2 results
- [ ] Deploy to production

**Day 7: Buffer**
- [ ] Address any issues
- [ ] Monitor initial submissions

**Deliverable:** Tool 5 fully functional in production

---

### **Phase 4: Tool 7 Implementation (5-7 days)**

**Tool 7: Control & Fear (4 domains)**

**Days 1-2: Configuration**
- [ ] Create tools/tool7/ directory
- [ ] Extract 4 domain configs from v2
- [ ] Create Tool7Fallbacks.js
- [ ] Extract GPT prompts
- [ ] Adapt dynamic column mapping pattern

**Days 3-4: Implementation**
- [ ] Implement Tool7.js
- [ ] Implement dynamic column mapper
- [ ] Implement Tool7Report.js
- [ ] Add PDF generation

**Days 5-6: Testing & Deploy**
- [ ] End-to-end testing
- [ ] Compare to v2 results
- [ ] Deploy to production

**Day 7: Buffer**
- [ ] Address any issues
- [ ] Monitor initial submissions

**Deliverable:** Tool 7 fully functional in production

---

### **Phase 5: Final Integration & Documentation (3-5 days)**

**Days 1-2: Cross-Tool Testing**
- [ ] Test Tool 3 → Tool 5 flow
- [ ] Test Tool 5 → Tool 7 flow
- [ ] Verify insights propagation
- [ ] Test edit mode across all tools
- [ ] Performance testing (100 concurrent users)

**Days 3-4: Documentation**
- [ ] Update TOOL-DEVELOPMENT-GUIDE.md
- [ ] Create GROUNDING-TOOLS-API.md
- [ ] Add examples to documentation
- [ ] Update README.md

**Day 5: Final Review**
- [ ] Code review all implementations
- [ ] Security audit
- [ ] Performance optimization
- [ ] Final approval

**Deliverable:** All 3 grounding tools in production, fully documented

---

### **Total Timeline: 29-41 days (6-8 weeks)**

**Confidence Level:** High
- Foundation well-defined
- Patterns proven in v2
- v3 framework stable
- Team experienced with similar refactoring (v3.9.0)

---

## 💰 Benefits & ROI Analysis

### **Code Reduction**

**Before (v2 Pattern):**
```
Tool 3: ~1,500 lines
Tool 5: ~1,500 lines
Tool 7: ~1,500 lines
Total: 4,500 lines
```

**After (v3 with Foundation):**
```
Foundation utilities: ~1,200 lines (write once)
Tool 3: ~600 lines (config + assembly)
Tool 5: ~600 lines
Tool 7: ~600 lines
Total: 3,000 lines
```

**Savings: 1,500 lines (33% reduction)**

### **Development Time**

**Before (v2 Pattern):**
```
Tool 3: 2 weeks
Tool 5: 2 weeks
Tool 7: 2 weeks
Total: 6 weeks (30 days)
```

**After (v3 with Foundation):**
```
Foundation: 2 weeks (10 days, write once)
Tool 3: 1.5 weeks (8 days, includes learning curve)
Tool 5: 1 week (5 days, pattern established)
Tool 7: 1 week (5 days, pattern mastered)
Total: 5.5 weeks (28 days)
```

**Savings: 2 days (7% faster overall)**

**But... if building Tool 8, 9, 10 in future:**
```
Each additional tool: 5 days (vs 10 days without foundation)
Savings: 50% per future tool
```

### **Maintenance Cost**

**Before:**
- Bug in form rendering → Fix in 3 places
- GPT pattern change → Update 3 times
- Scoring algorithm tweak → Modify 3 files
- **Average maintenance:** 3x effort

**After:**
- Bug in form rendering → Fix once in GroundingFormBuilder
- GPT pattern change → Update once in GroundingGPT
- Scoring algorithm tweak → Modify once in GroundingScoring
- **Average maintenance:** 1x effort

**Savings: 67% less maintenance effort**

### **Quality Improvements**

**Consistency:**
- Before: 3 slightly different implementations (bugs diverge)
- After: 1 tested implementation (bugs fixed once)

**Testing:**
- Before: Test 4,500 lines across 3 tools
- After: Test 1,200 utility lines + 1,800 config lines
- **Focus testing on utilities (high reuse)** → Better coverage

**Onboarding:**
- Before: New developer learns 3 different patterns
- After: New developer learns 1 pattern + config format
- **Faster ramp-up time**

### **Flexibility**

**Adding New Domain:**
- Before: Copy/paste entire implementation, modify
- After: Add domain config object (50 lines)
- **10x faster**

**Changing GPT Model:**
- Before: Update 3 tool files
- After: Update GroundingGPT.js once
- **Instant propagation to all tools**

**Changing Scale:**
- Before: Update renderPageContent in 3 tools
- After: Update GroundingFormBuilder.renderScaleOptions()
- **Single change point**

### **Financial ROI**

**Development Costs (one-time):**
```
Foundation: 10 days × $X/day = $10X
Tool 3: 8 days × $X/day = $8X
Tool 5: 5 days × $X/day = $5X
Tool 7: 5 days × $X/day = $5X
Total: 28 days = $28X
```

**vs Without Foundation:**
```
Tool 3: 10 days × $X/day = $10X
Tool 5: 10 days × $X/day = $10X
Tool 7: 10 days × $X/day = $10X
Total: 30 days = $30X
```

**Savings: $2X** (7% cost reduction)

**But... Maintenance Costs (recurring):**
```
Annual bug fixes: ~5 incidents
Without foundation: 5 × 3 tools × 2 hours = 30 hours
With foundation: 5 × 1 fix × 2 hours = 10 hours
Savings: 20 hours/year
```

**5-Year TCO:**
```
Development: $28X vs $30X (-$2X)
Maintenance: $20X vs $60X (-$40X) @ $X/hour
Total savings: $42X over 5 years
```

**Break-even point: Immediate** (development cost lower + maintenance savings)

---

## 🧪 Testing Strategy

### **1. Unit Testing - Utilities**

**GroundingFormBuilder.js**
```javascript
// Test: Render single domain
test_renderDomain_singleDomain()
test_renderDomain_withExistingData()
test_renderDomain_customScaleLabels()
test_renderDomain_withOpenResponses()

// Test: Scale rendering
test_renderScaleOptions_defaultLabels()
test_renderScaleOptions_customLabels()
test_renderScaleOptions_selectedValue()
```

**GroundingScoring.js**
```javascript
// Test: Scale normalization
test_normalizeScale_negativeThree() // -3 → 0
test_normalizeScale_positiveThree() // +3 → 100
test_normalizeScale_invalidInput() // null handling

// Test: Quotient calculations
test_calculateDomainQuotient_validInputs()
test_calculateDomainQuotient_missingData()
test_calculateOverallQuotient_multipleDomains()

// Test: Pattern identification
test_identifyHighestImpactDomain_clear()
test_identifyHighestImpactDomain_tie()

// Test: Cohort classification
test_generateCohortNarrative_low()
test_generateCohortNarrative_medium()
test_generateCohortNarrative_high()
test_generateCohortNarrative_gapAnalysis()
```

**GroundingGPT.js**
```javascript
// Test: Single domain analysis
test_analyzeDomain_success()
test_analyzeDomain_gptFails_retrySucceeds()
test_analyzeDomain_bothFail_useFallback()

// Test: Progressive chaining
test_analyzeAllDomains_chain2Domains()
test_analyzeAllDomains_chain5Domains()

// Test: Synthesis
test_synthesizeOverall_validInput()
test_synthesizeOverall_fallback()

// Test: Validation
test_isValidInsight_complete()
test_isValidInsight_missing()
```

**GroundingReport.js**
```javascript
// Test: Section builders
test_buildDomainScoresSection_3domains()
test_buildCohortSection_lowLevel()
test_buildDomainInsightsSection_gptSource()
test_buildOverallSection_complete()

// Test: Formatting
test_formatSuggestions_bulletPoints()
test_getScoreColor_ranges()
```

**Test Coverage Goal:** 85%+ on shared utilities

---

### **2. Integration Testing - Tools**

**Tool 3 Integration**
```javascript
// Test: Complete flow
test_tool3_completeSubmission()
test_tool3_draftSaveResume()
test_tool3_editMode()

// Test: Scoring
test_tool3_scoringMatchesV2()

// Test: GPT integration
test_tool3_gptAnalysis_success()
test_tool3_gptAnalysis_fallback()

// Test: Report generation
test_tool3_reportContainsAllSections()
test_tool3_pdfGeneration()
```

**Cross-Tool Integration**
```javascript
// Test: Tool flow
test_tool3_to_tool5_unlocks()
test_tool5_to_tool7_unlocks()

// Test: Insights propagation
test_tool3_generatesInsights()
test_tool5_receivesInsights()
```

---

### **3. Performance Testing**

**Load Testing**
```javascript
// Test: Concurrent users
test_100_concurrent_tool3_submissions()
test_50_concurrent_gpt_calls()

// Test: Response times
test_page_load_under_2seconds()
test_gpt_analysis_under_10seconds()
test_report_generation_under_3seconds()

// Test: Memory usage
test_utilities_memory_efficient()
```

**GPT Performance**
```javascript
// Test: Rate limiting
test_gpt_handles_rate_limit_gracefully()

// Test: Fallback activation
test_fallback_rate_under_5percent()

// Test: Cost tracking
test_per_student_cost_under_budget()
```

---

### **4. Validation Testing**

**v2 Comparison**
```javascript
// Test: Score accuracy
test_tool3_scores_match_v2_within_1percent()
test_tool5_scores_match_v2_within_1percent()
test_tool7_scores_match_v2_within_1percent()

// Test: Cohort classification
test_cohort_classifications_match_v2()

// Test: Report content
test_report_includes_all_v2_sections()
```

---

### **5. User Acceptance Testing**

**Manual Testing Checklist**
- [ ] Complete Tool 3 as TEST001 (happy path)
- [ ] Close browser mid-assessment, resume (draft save)
- [ ] Complete, then edit answers (edit mode)
- [ ] Cancel edit (verify revert works)
- [ ] Start fresh (verify draft cleared)
- [ ] View report (verify all sections present)
- [ ] Download PDF (verify formatting)
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test in different browsers (Chrome, Safari, Firefox)

**Accessibility Testing**
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators

---

### **6. Monitoring & Logging**

**Production Monitoring**
```javascript
// Log: GPT usage
Logger.log(`GPT call: ${domainKey}, cost: ${estimatedCost}, source: ${source}`);

// Log: Fallback activation
Logger.log(`Fallback activated: ${domainKey}, reason: ${error.message}`);

// Log: Performance
Logger.log(`Tool ${toolId} completion time: ${duration}ms`);

// Alert: Error rates
if (errorRate > 0.05) {
  sendAlert('High error rate detected in grounding tools');
}
```

**Dashboard Metrics**
- Total submissions per tool
- GPT success rate
- Fallback activation rate
- Average completion time
- Cost per student
- Error rates by tool

---

## 🔮 Future Extensibility

### **Adding Tool 8, 9, 10...**

If future tools follow grounding pattern:

**Effort per tool:**
```
1. Create domain configs: 2-3 hours
2. Implement ToolN.js: 1-2 hours (mostly config!)
3. Create fallbacks: 2-3 hours
4. Test: 1-2 hours
Total: 6-10 hours per tool
```

**vs without foundation:** 20-30 hours per tool

**Savings: 60-70% per additional tool**

---

### **Extending the Foundation**

**Scenario: New question type (slider instead of dropdown)**

**Without foundation:**
- Update Tool 3 code
- Update Tool 5 code
- Update Tool 7 code
- Test all 3 tools

**With foundation:**
- Add `renderSliderQuestion()` to GroundingFormBuilder
- Tools opt-in via config: `{type: 'slider', ...}`
- Test once, works everywhere

**Effort: 1/3 vs without foundation**

---

### **Adapting for New Tool Categories**

If future tools share patterns (e.g., "goal-setting tools"):

**Copy the Pattern:**
```
shared/
├── grounding/              # For Tools 3, 5, 7
│   ├── GroundingFormBuilder.js
│   ├── GroundingScoring.js
│   ├── GroundingGPT.js
│   └── GroundingReport.js
└── goal-setting/           # For Tools X, Y, Z (future)
    ├── GoalFormBuilder.js
    ├── GoalTracking.js
    ├── GoalGPT.js
    └── GoalReport.js
```

**Benefits:**
- Proven pattern to follow
- Clear separation of concerns
- No impact on existing tools
- Framework scales elegantly

---

### **AI/LLM Evolution**

**Scenario: GPT-5 released with better performance**

**Changes needed:**
```javascript
// In GroundingGPT.js - ONE LINE CHANGE
model: 'gpt-5o-mini',  // Was: 'gpt-4o-mini'
```

**Immediate benefit to all 3 grounding tools**

---

**Scenario: Alternative LLM (Claude, Gemini)**

**Changes needed:**
```javascript
// In GroundingGPT.js
callLLM(config) {
  const provider = CONFIG.LLM_PROVIDER;  // 'openai' | 'claude' | 'gemini'

  if (provider === 'claude') {
    return this.callClaude(config);
  } else if (provider === 'gemini') {
    return this.callGemini(config);
  }

  return this.callGPT(config);  // Default
}
```

**All grounding tools switch providers instantly**

---

### **Feature Flags**

**Enable/disable features without code changes:**

```javascript
// In CONFIG.js
GROUNDING_TOOLS: {
  ENABLE_GPT_ANALYSIS: true,
  ENABLE_PROGRESSIVE_CHAINING: true,
  ENABLE_COHORT_NARRATIVE: true,
  GPT_MODEL: 'gpt-4o-mini',
  FALLBACK_THRESHOLD: 0.05,  // Trigger fallback at 5% rate
  MAX_GPT_RETRIES: 2
}

// In GroundingGPT.js
if (!CONFIG.GROUNDING_TOOLS.ENABLE_GPT_ANALYSIS) {
  return this.getFallback(domainKey);  // Skip GPT entirely
}
```

**Use cases:**
- A/B testing (GPT vs no GPT)
- Cost management (disable GPT during high load)
- Debugging (isolate issues)

---

## 📚 Appendix

### **A. Glossary**

**Grounding Tool:** A multi-domain psychological assessment following the 4-aspect framework pattern

**Domain:** A distinct behavioral/psychological pattern being assessed (e.g., Suffering, Control)

**Aspect:** One of four dimensions of a domain: Belief, Behavior, Feeling, Consequence

**Quotient:** A calculated score representing the intensity/impact of a domain (0-100 scale)

**Progressive Chaining:** GPT analysis pattern where each domain builds on previous domain's insights

**3-Tier Fallback:** Reliability pattern: Try GPT → Retry GPT → Use fallback (always succeeds)

**Cohort Narrative:** Classification and coaching based on percentile ranking within student cohort

---

### **B. References**

**v2 Implementations:**
- `/Users/Larry/code/ftp-v2/apps/Tool-5-issues-showing-love-grounding/`
- `/Users/Larry/code/ftp-v2/apps/Tool-7-control-fear-grounding/`

**v3 Framework Docs:**
- `ARCHITECTURE.md` - Core framework architecture
- `TOOL-DEVELOPMENT-GUIDE.md` - General tool development
- `GPT-INTEGRATION-QUICKSTART.md` - GPT integration patterns
- `REFACTORING_DOCUMENTATION.md` - v3.9.0 shared utilities

**v3 Shared Utilities:**
- `/shared/EditModeBanner.js`
- `/shared/DraftService.js`
- `/shared/ReportBase.js`
- `/shared/ErrorHandler.js`
- `/shared/Validator.js`
- `/shared/NavigationHelpers.js`
- `/shared/PDFGenerator.js`

---

### **C. Change Log**

**v1.0.0 - November 10, 2025**
- Initial architecture document
- Philosophy and design principles established
- 4 shared utilities specified
- Integration with v3 framework defined
- Implementation roadmap created
- Testing strategy outlined

---

### **D. Approvals**

**Architecture Review:**
- [ ] Lead Developer
- [ ] Framework Architect
- [ ] Product Owner

**Implementation Approval:**
- [ ] Technical Lead
- [ ] Project Manager

**Status:** 🏗️ Architecture Design Phase - Pending Approval

---

**Next Steps:**
1. Review and approve this architecture document
2. Create GitHub issues for Phase 1 (Foundation Development)
3. Assign developers to grounding utilities implementation
4. Schedule kickoff meeting for foundation development

---

**Document End**

For questions or clarifications, contact: [Your Contact Info]
