/**
 * Tool4BaseWeights.js
 * Base allocation weights for 10 financial priorities
 *
 * Week 2 Feature: M/E/F/J base percentages for each priority
 * Source: TOOL4-BASE-WEIGHTS-FINAL-DECISIONS.md (validated 11/18/25)
 */

const Tool4BaseWeights = {

  /**
   * Base allocation weights for all 10 priorities
   * M = Multiply (wealth-building/investing)
   * E = Essentials (living expenses)
   * F = Freedom (emergency fund/debt payoff)
   * J = Enjoyment (joy/quality of life)
   */
  WEIGHTS: {
    stabilize: {
      M:  5,  // Minimum wealth-building
      E: 60,  // High essentials for crisis mode
      F: 30,  // Build emergency fund
      J:  5   // Minimal enjoyment
    },

    reclaim: {
      M: 10,  // Minimal investing
      E: 45,  // Trauma-informed essentials
      F: 35,  // Freedom focus
      J: 10   // Reduced for control focus
    },

    debt: {
      M: 15,  // Minimum investing
      E: 35,  // Sustainable essentials
      F: 40,  // Aggressive debt payoff
      J: 10   // Reduced to maintain F
    },

    secure: {
      M: 25,  // Balanced wealth-building
      E: 35,  // Comfortable essentials
      F: 30,  // Build robust emergency fund
      J: 10   // Low enjoyment, security-focused
    },

    enjoy: {
      M: 15,  // Minimum investing
      E: 25,  // Efficient essentials
      F: 25,  // Moderate emergency fund
      J: 35   // High enjoyment - life balance
    },

    reduce_hours: {
      M: 20,  // Moderate - includes business reinvestment
      E: 30,  // Moderate personal essentials
      F: 35,  // High - business emergency fund critical
      J: 15   // Moderate enjoyment
    },

    kids_education: {
      M: 25,  // Moderate - savings can grow in investments
      E: 25,  // Efficient essentials
      F: 40,  // High - saving for specific goal
      J: 10   // Low - sacrifice for goal
    },

    wealth: {
      M: 40,  // High investing - wealth focus
      E: 25,  // Efficient essentials
      F: 20,  // Moderate - already have emergency fund
      J: 15   // Low - delayed gratification
    },

    lifestyle: {
      M: 20,  // Moderate investing
      E: 20,  // Low essentials - only for those who CAN
      F: 15,  // Low - already stable
      J: 45   // Very high enjoyment - lifestyle priority
    },

    generational: {
      M: 50,  // Maximum investing - legacy focus
      E: 20,  // Low - established efficiency
      F: 20,  // Low - already have safety net
      J: 10   // Low - sacrifice for legacy
    }
  },

  /**
   * Get base weights for a priority
   */
  getWeights(priorityId) {
    return this.WEIGHTS[priorityId] || null;
  },

  /**
   * Validate that weights sum to 100%
   */
  validateWeights(weights) {
    const total = weights.M + weights.E + weights.F + weights.J;
    return Math.abs(total - 100) < 0.01; // Allow tiny floating point errors
  },

  /**
   * Convert percentage weights to dollar amounts
   */
  toDollars(weights, income) {
    return {
      M: Math.round((weights.M / 100) * income),
      E: Math.round((weights.E / 100) * income),
      F: Math.round((weights.F / 100) * income),
      J: Math.round((weights.J / 100) * income)
    };
  },

  /**
   * Format allocation for display
   */
  formatAllocation(weights, income) {
    const dollars = this.toDollars(weights, income);

    return {
      percentages: {
        M: weights.M,
        E: weights.E,
        F: weights.F,
        J: weights.J
      },
      dollars: {
        M: dollars.M,
        E: dollars.E,
        F: dollars.F,
        J: dollars.J
      },
      formatted: {
        M: { percent: `${weights.M}%`, dollars: `$${dollars.M.toLocaleString()}` },
        E: { percent: `${weights.E}%`, dollars: `$${dollars.E.toLocaleString()}` },
        F: { percent: `${weights.F}%`, dollars: `$${dollars.F.toLocaleString()}` },
        J: { percent: `${weights.J}%`, dollars: `$${dollars.J.toLocaleString()}` }
      }
    };
  },

  /**
   * Get bucket details (for UI labels and colors)
   */
  BUCKETS: {
    M: {
      key: 'M',
      label: 'Multiply',
      icon: '💰',
      color: '#fbbf24',
      description: 'Wealth-building and investments'
    },
    E: {
      key: 'E',
      label: 'Essentials',
      icon: '🏠',
      color: '#60a5fa',
      description: 'Living expenses and necessities'
    },
    F: {
      key: 'F',
      label: 'Freedom',
      icon: '🦅',
      color: '#34d399',
      description: 'Emergency fund and debt payoff'
    },
    J: {
      key: 'J',
      label: 'Enjoyment',
      icon: '🎉',
      color: '#f472b6',
      description: 'Joy, experiences, quality of life'
    }
  }
};
