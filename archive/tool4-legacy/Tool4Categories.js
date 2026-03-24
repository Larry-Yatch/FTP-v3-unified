/**
 * Tool4Categories.js
 * Category spending breakdown and validation logic
 *
 * Week 2 Feature: 8-category spending estimates with validation
 */

const Tool4Categories = {

  /**
   * The 8 essential spending categories
   */
  CATEGORIES: [
    { key: 'rent', label: 'Rent/Mortgage', placeholder: '1200' },
    { key: 'groceries', label: 'Groceries', placeholder: '400' },
    { key: 'dining', label: 'Dining/Takeout', placeholder: '200' },
    { key: 'transport', label: 'Transportation', placeholder: '300' },
    { key: 'utilities', label: 'Utilities', placeholder: '150' },
    { key: 'insurance', label: 'Insurance', placeholder: '200' },
    { key: 'subscriptions', label: 'Subscriptions', placeholder: '50' },
    { key: 'other', label: 'Other Essentials', placeholder: '0' }
  ],

  /**
   * Get validation tolerance: $50 OR 2% of essentials (whichever is larger)
   */
  getTolerance(essentials) {
    return Math.max(50, essentials * 0.02);
  },

  /**
   * Validate category totals against current essentials
   */
  validateCategories(categories, essentials) {
    const total = Object.values(categories).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const tolerance = this.getTolerance(essentials);
    const difference = Math.abs(total - essentials);

    return {
      isValid: difference <= tolerance,
      difference: Math.round(difference),
      tolerance: Math.round(tolerance),
      total: Math.round(total),
      expected: essentials,
      percentDiff: essentials > 0 ? Math.round((difference / essentials) * 100) : 0
    };
  },

  /**
   * Auto-distribute difference proportionally across non-zero categories
   */
  autoDistribute(categories, essentials) {
    const total = Object.values(categories).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const difference = essentials - total;

    if (Math.abs(difference) < 1) return categories;

    // Get non-zero categories
    const nonZeroCategories = Object.entries(categories).filter(([k, v]) => parseFloat(v) > 0);
    const totalNonZero = nonZeroCategories.reduce((sum, [k, v]) => sum + parseFloat(v), 0);

    if (totalNonZero === 0) {
      // All categories are zero - distribute equally
      const perCategory = Math.round(essentials / Object.keys(categories).length);
      const adjusted = {};
      Object.keys(categories).forEach(key => {
        adjusted[key] = perCategory;
      });
      return adjusted;
    }

    // Distribute proportionally
    const adjusted = {...categories};
    nonZeroCategories.forEach(([key, value]) => {
      const proportion = parseFloat(value) / totalNonZero;
      adjusted[key] = Math.round(parseFloat(value) + (difference * proportion));
    });

    return adjusted;
  },

  /**
   * Suggest reasonable category split based on essentials amount
   * Uses typical budget percentages as starting point
   */
  suggestCategorySplit(income, essentials) {
    const splits = {
      rent: 0.48,           // ~48% Rent/Mortgage
      groceries: 0.16,      // ~16% Groceries
      utilities: 0.06,      // ~6% Utilities
      transport: 0.12,      // ~12% Transportation
      insurance: 0.08,      // ~8% Insurance
      dining: 0.06,         // ~6% Dining
      subscriptions: 0.02,  // ~2% Subscriptions
      other: 0.02           // ~2% Other
    };

    const suggested = {};
    Object.entries(splits).forEach(([category, percentage]) => {
      suggested[category] = Math.round(essentials * percentage);
    });

    return suggested;
  },

  /**
   * Render category breakdown form HTML
   */
  renderCategoryForm(essentials) {
    const suggested = this.suggestCategorySplit(0, essentials);

    return `
      <div class="calculator-section">
        <h2 class="section-header">🏠 Category Breakdown (Optional)</h2>
        <p class="muted" style="margin-bottom: 20px;">
          Break down your $${essentials.toLocaleString()} essentials into categories.
          This helps us give more specific recommendations.
        </p>

        <div style="margin-bottom: 15px;">
          <button type="button" class="btn btn-secondary" onclick="fillSuggestedCategories()">
            💡 Fill With Suggested Values
          </button>
          <button type="button" class="btn btn-secondary" onclick="clearCategories()">
            Clear All
          </button>
        </div>

        <div class="form-grid" id="categoriesGrid">
          ${this.CATEGORIES.map(cat => `
            <div class="form-field">
              <label class="form-label">${cat.label}</label>
              <input
                type="number"
                id="cat_${cat.key}"
                class="form-input category-input"
                placeholder="${cat.placeholder}"
                min="0"
                step="10"
                oninput="updateCategoryTotal()"
                data-suggested="${suggested[cat.key]}"
              >
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Category Total:</strong>
              <span id="categoryTotal" style="font-size: 1.2rem; color: var(--color-primary);">$0</span>
            </div>
            <div>
              <strong>Current Essentials:</strong>
              <span style="font-size: 1.2rem;">$${essentials.toLocaleString()}</span>
            </div>
            <div id="categoryDifference"></div>
          </div>
          <div id="categoryWarning" style="display: none; margin-top: 10px;"></div>
        </div>
      </div>
    `;
  }
};
