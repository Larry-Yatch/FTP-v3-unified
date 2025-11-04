# Tool Implementation Template

## 📦 Complete Tool Example

This template shows how to create a tool that implements `ToolInterface`.

---

## File Structure

```
tools/toolN/
├── tool.manifest.json    # Tool configuration
├── ToolN.js             # Main tool implementation
├── ToolNInsights.js     # Insight generation logic
└── toolN-form.html      # (Optional) Custom form HTML
```

---

## 1. Tool Manifest (`tool.manifest.json`)

```json
{
  "id": "toolN",
  "name": "Tool Display Name",
  "version": "1.0.0",
  "pattern": "form",
  "routes": ["/toolN", "/alternate-route"],
  "prerequisites": ["tool1", "tool2"],
  "unlocks": ["toolN+1"],
  "insights": {
    "generates": ["insight_type1", "insight_type2"],
    "targetsTools": ["tool2", "tool3"]
  },
  "dataSchema": {
    "fields": ["field1", "field2", "field3"]
  }
}
```

---

## 2. Main Tool Module (`ToolN.js`)

```javascript
/**
 * Tool N: Tool Description
 *
 * Implements ToolInterface for v3 framework
 */

const ToolN = {
  // Tool identifier
  id: 'toolN',

  // Tool manifest (loaded from JSON)
  manifest: null,

  // Dependencies injected by framework
  dataService: null,
  accessControl: null,
  insightsPipeline: null,

  /**
   * REQUIRED: Initialize tool with dependencies and insights
   * @param {Object} dependencies - Framework services
   * @param {Array} previousInsights - Insights from completed tools
   * @returns {Object} { success: boolean, error?: string }
   */
  initialize(dependencies, previousInsights) {
    try {
      // Store dependencies
      this.dataService = dependencies.dataService;
      this.accessControl = dependencies.accessControl;
      this.insightsPipeline = dependencies.insightsPipeline;

      // Store insights for later use
      this.previousInsights = previousInsights;

      console.log(`ToolN initialized with ${previousInsights.length} insights`);

      return { success: true };

    } catch (error) {
      console.error('ToolN initialization error:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * REQUIRED: Validate form data
   * @param {Object} data - Form data to validate
   * @returns {Object} { valid: boolean, errors: Array<string> }
   */
  validate(data) {
    const errors = [];

    // Required field validation
    if (!data.field1 || data.field1.trim() === '') {
      errors.push('Field 1 is required');
    }

    if (!data.field2) {
      errors.push('Field 2 is required');
    }

    // Type validation
    if (data.field3 && isNaN(data.field3)) {
      errors.push('Field 3 must be a number');
    }

    // Range validation
    if (data.field3 && (data.field3 < 0 || data.field3 > 100)) {
      errors.push('Field 3 must be between 0 and 100');
    }

    // Custom validation
    if (data.email && !this._isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * REQUIRED: Process tool submission
   * @param {string} clientId - Client/student ID
   * @param {Object} data - Validated form data
   * @returns {Object} { success: boolean, result: any, error?: string }
   */
  process(clientId, data) {
    try {
      console.log(`Processing ToolN for ${clientId}`);

      // Add metadata
      const processedData = {
        ...data,
        clientId: clientId,
        toolId: this.id,
        timestamp: new Date(),
        version: this.manifest.version
      };

      // Perform any calculations
      const calculations = this._performCalculations(processedData);

      // Generate report
      const report = this._generateReport(processedData, calculations);

      return {
        success: true,
        result: {
          data: processedData,
          calculations: calculations,
          report: report
        }
      };

    } catch (error) {
      console.error('ToolN processing error:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * REQUIRED: Generate insights for other tools
   * @param {Object} data - Submitted form data
   * @param {string} clientId - Client/student ID
   * @returns {Array<Object>} Array of insight objects
   */
  generateInsights(data, clientId) {
    // Use separate insights module
    return ToolNInsights.generate(data, clientId);
  },

  /**
   * REQUIRED: Get tool configuration
   * @returns {Object} Tool manifest
   */
  getConfig() {
    return this.manifest;
  },

  /**
   * OPTIONAL: Adapt tool based on previous insights
   * @param {Array} insights - Relevant insights
   * @returns {Object} Adaptations to apply
   */
  adaptBasedOnInsights(insights) {
    const adaptations = {
      sectionsToEmphasize: [],
      questionsToAdd: [],
      questionsToSkip: [],
      customGuidance: []
    };

    insights.forEach(insight => {
      // High priority insights
      if (insight.priority === 'HIGH' || insight.priority === 'CRITICAL') {
        adaptations.customGuidance.push({
          section: 'intro',
          message: `Note: ${insight.content}`
        });
      }

      // Tool-specific adaptations
      if (insight.insightType === 'specific_condition') {
        adaptations.sectionsToEmphasize.push('relevant_section');
      }
    });

    return adaptations;
  },

  /**
   * OPTIONAL: Get current progress
   * @param {Object} data - Current form data
   * @returns {Object} { percent: number, section: string }
   */
  getProgress(data) {
    const totalFields = Object.keys(this.manifest.dataSchema.fields).length;
    const filledFields = Object.keys(data).filter(key => {
      const value = data[key];
      return value !== null && value !== undefined && value !== '';
    }).length;

    return {
      percent: Math.round((filledFields / totalFields) * 100),
      section: this._getCurrentSection(data)
    };
  },

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Perform tool-specific calculations
   * @private
   */
  _performCalculations(data) {
    // Example: Calculate a score
    return {
      score: this._calculateScore(data),
      category: this._determineCategory(data)
    };
  },

  /**
   * Calculate score
   * @private
   */
  _calculateScore(data) {
    // Tool-specific scoring logic
    return 0;
  },

  /**
   * Determine category
   * @private
   */
  _determineCategory(data) {
    // Tool-specific categorization logic
    return 'default';
  },

  /**
   * Generate report
   * @private
   */
  _generateReport(data, calculations) {
    return {
      summary: 'Report summary here',
      details: 'Detailed analysis',
      recommendations: ['Recommendation 1', 'Recommendation 2']
    };
  },

  /**
   * Get current section based on filled data
   * @private
   */
  _getCurrentSection(data) {
    // Logic to determine which section user is on
    return 'section1';
  },

  /**
   * Validate email format
   * @private
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
```

---

## 3. Insights Module (`ToolNInsights.js`)

```javascript
/**
 * Tool N Insights Generator
 *
 * Separates insight generation logic from main tool module.
 * Makes it easier to manage and test.
 */

const ToolNInsights = {

  /**
   * Generate insights for Tool N
   * @param {Object} data - Tool response data
   * @param {string} clientId - Client/student ID
   * @returns {Array<Object>} Generated insights
   */
  generate(data, clientId) {
    const insights = [];

    // Example insight 1: Threshold-based
    if (data.score >= 8) {
      insights.push({
        type: 'high_score',
        priority: 'HIGH',
        content: `High score (${data.score}/10) indicates strong performance`,
        targetTools: ['toolN+1', 'toolN+2'],
        data: {
          score: data.score,
          threshold: 8
        }
      });
    }

    // Example insight 2: Category-based
    if (data.category === 'urgent') {
      insights.push({
        type: 'urgent_action',
        priority: 'CRITICAL',
        content: 'Urgent action required based on assessment',
        targetTools: ['toolN+1'],
        data: {
          category: data.category,
          urgencyLevel: 'critical'
        }
      });
    }

    // Example insight 3: Combination condition
    if (data.field1 === 'value' && data.field2 > 50) {
      insights.push({
        type: 'combined_condition',
        priority: 'MEDIUM',
        content: 'Special condition detected',
        targetTools: ['toolN+2'],
        data: {
          field1: data.field1,
          field2: data.field2
        }
      });
    }

    return insights;
  }
};
```

---

## 4. Tool Registration (in `Code.js`)

```javascript
/**
 * Load and register Tool N manifest
 */
try {
  const ToolNManifest = JSON.parse(
    HtmlService.createHtmlOutputFromFile('tools/toolN/tool.manifest').getContent()
  );

  ToolN.manifest = ToolNManifest;

  // Register tool
  ToolRegistry.register('toolN', ToolN, ToolNManifest);

} catch (error) {
  console.error('Error registering Tool N:', error);
}
```

---

## 5. Adding Insight Mappings

Add to `InsightMappings` sheet:

| Tool_ID | Insight_Type | Condition | Condition_Logic | Priority | Content_Template | Target_Tools | Adaptation_Type | Adaptation_Details |
|---------|--------------|-----------|-----------------|----------|------------------|--------------|-----------------|-------------------|
| toolN | high_score | score >= 8 | `{"field":"score","operator":">=","value":8}` | HIGH | High score ({score}/10) detected | `["toolN+1"]` | emphasize_section | `{"section":"advanced"}` |

---

## 📝 Implementation Checklist

When creating a new tool:

- [ ] Create `tools/toolN/` directory
- [ ] Create `tool.manifest.json` with all required fields
- [ ] Implement `ToolN.js` with all required methods
- [ ] Create `ToolNInsights.js` for insight generation
- [ ] Register tool in `Code.js`
- [ ] Add insight mappings to `InsightMappings` sheet
- [ ] Test with `TEST001` client
- [ ] Verify data saves to `RESPONSES` sheet
- [ ] Verify insights appear in `CrossToolInsights` sheet
- [ ] Test tool access control
- [ ] Test next tool unlock

---

## 🧪 Testing Your Tool

```javascript
// Test function to add to Code.js
function testToolN() {
  const testData = {
    field1: 'test value',
    field2: 'another value',
    field3: 75
  };

  // Test validation
  console.log('Validation:', ToolN.validate(testData));

  // Test processing
  const result = ToolN.process('TEST001', testData);
  console.log('Process result:', result);

  // Test insights
  const insights = ToolN.generateInsights(testData, 'TEST001');
  console.log('Generated insights:', insights);

  // Test framework integration
  const initResult = FrameworkCore.initializeTool('toolN', 'TEST001');
  console.log('Framework init:', initResult);
}
```

---

## 🎯 Best Practices

1. **Keep tools simple** - Let framework handle complexity
2. **Separate concerns** - Insights in separate module
3. **Validate thoroughly** - Catch errors early
4. **Use private methods** - Prefix with `_` for clarity
5. **Add comments** - Explain non-obvious logic
6. **Test incrementally** - Test each method as you build
7. **Log appropriately** - Use console.log for debugging

---

**Next:** Follow `SETUP-GUIDE.md` to deploy your tool!
