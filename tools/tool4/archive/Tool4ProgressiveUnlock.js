/**
 * Tool4ProgressiveUnlock.js
 * Progressive unlock logic for 10 financial priorities
 *
 * Week 2 Feature: Priorities lock/unlock based on financial reality
 */

const Tool4ProgressiveUnlock = {

  /**
   * All 10 priorities with unlock requirements
   */
  PRIORITIES: [
    {
      id: 'stabilize',
      name: 'Stabilize to Survive',
      icon: '🚨',
      tier: 1,
      description: 'Stop the bleeding - immediate crisis mode',
      unlockRequirement: () => true, // Always available
      hint: (data) => 'Focus on immediate stability'
    },

    {
      id: 'reclaim',
      name: 'Reclaim Financial Control',
      icon: '🎯',
      tier: 1,
      description: 'Trauma recovery and regaining agency',
      unlockRequirement: () => true, // Always available
      hint: (data) => 'Trauma recovery focus'
    },

    {
      id: 'debt',
      name: 'Get Out of Debt',
      icon: '💳',
      tier: 1,
      description: 'Aggressive debt payoff priority',
      unlockRequirement: (data) => data.debt > 0,
      hint: (data) => data.debt > 0 ? `Debt: $${data.debt.toLocaleString()}` : 'No debt',
      lockReason: 'Need debt balance > $0'
    },

    {
      id: 'secure',
      name: 'Feel Financially Secure',
      icon: '🛡️',
      tier: 2,
      description: 'Build emergency fund and stability',
      unlockRequirement: (data) => {
        // Unlock if: Emergency fund ≥ $6,000 OR surplus ≥ $500
        return data.emergencyFund >= 6000 || data.surplus >= 500;
      },
      hint: (data) => `Emergency fund: $${data.emergencyFund.toLocaleString()}`,
      lockReason: (data) => `Need: Emergency fund ≥ $6,000 OR surplus ≥ $500 | You have: $${data.emergencyFund.toLocaleString()} fund, $${data.surplus.toLocaleString()} surplus`
    },

    {
      id: 'enjoy',
      name: 'Enjoy Life More',
      icon: '🎉',
      tier: 2,
      description: 'Increase enjoyment and quality of life',
      unlockRequirement: (data) => {
        // Unlock if: Surplus ≥ $200 (minimal threshold)
        return data.surplus >= 200;
      },
      hint: (data) => `Surplus: $${data.surplus.toLocaleString()}/mo`,
      lockReason: (data) => `Need: $200+ surplus | You have: $${data.surplus.toLocaleString()}`
    },

    {
      id: 'reduce_hours',
      name: 'Reduce Working Hours',
      icon: '⏰',
      tier: 2,
      description: 'Work less while maintaining lifestyle',
      unlockRequirement: (data) => {
        // Unlock if: Emergency fund ≥ $6,000 AND surplus ≥ $400
        return data.emergencyFund >= 6000 && data.surplus >= 400;
      },
      hint: (data) => data.emergencyFund >= 6000 && data.surplus >= 400
        ? 'Ready to scale back'
        : 'Building foundation',
      lockReason: (data) => `Need: $6,000 emergency fund + $400 surplus | You have: $${data.emergencyFund.toLocaleString()} fund, $${data.surplus.toLocaleString()} surplus`
    },

    {
      id: 'kids_education',
      name: 'Save for Kids\' Education',
      icon: '🎓',
      tier: 3,
      description: 'College savings and education fund',
      unlockRequirement: (data) => {
        // Unlock if: Emergency fund ≥ $12,000 AND surplus ≥ $600
        return data.emergencyFund >= 12000 && data.surplus >= 600;
      },
      hint: (data) => data.emergencyFund >= 12000 && data.surplus >= 600
        ? 'Ready to invest in future'
        : 'Building base first',
      lockReason: (data) => `Need: $12,000 emergency fund + $600 surplus | You have: $${data.emergencyFund.toLocaleString()} fund, $${data.surplus.toLocaleString()} surplus`
    },

    {
      id: 'wealth',
      name: 'Build Long-Term Wealth',
      icon: '📈',
      tier: 3,
      description: 'Invest for retirement and long-term growth',
      unlockRequirement: (data) => {
        // Unlock if: Emergency fund ≥ $18,000 (6 months) AND surplus ≥ $800
        return data.emergencyFund >= 18000 && data.surplus >= 800;
      },
      hint: (data) => data.emergencyFund >= 18000 && data.surplus >= 800
        ? 'Ready to build wealth'
        : 'Foundation incomplete',
      lockReason: (data) => `Need: $18,000 emergency fund (6 months) + $800 surplus | You have: $${data.emergencyFund.toLocaleString()} fund, $${data.surplus.toLocaleString()} surplus`
    },

    {
      id: 'lifestyle',
      name: 'Upgrade My Lifestyle',
      icon: '✨',
      tier: 3,
      description: 'Elevate quality of life and experiences',
      unlockRequirement: (data) => {
        // Unlock if: Emergency fund ≥ $12,000 AND surplus ≥ $1,000
        return data.emergencyFund >= 12000 && data.surplus >= 1000;
      },
      hint: (data) => data.emergencyFund >= 12000 && data.surplus >= 1000
        ? 'Ready to upgrade'
        : 'Building stability',
      lockReason: (data) => `Need: $12,000 emergency fund + $1,000 surplus | You have: $${data.emergencyFund.toLocaleString()} fund, $${data.surplus.toLocaleString()} surplus`
    },

    {
      id: 'generational',
      name: 'Create Generational Wealth',
      icon: '👨‍👩‍👧‍👦',
      tier: 4,
      description: 'Build lasting legacy for family',
      unlockRequirement: (data) => {
        // Unlock if: Emergency fund ≥ $36,000 (12 months) AND surplus ≥ $2,000
        return data.emergencyFund >= 36000 && data.surplus >= 2000;
      },
      hint: (data) => data.emergencyFund >= 36000 && data.surplus >= 2000
        ? 'Ready for legacy building'
        : 'Foundation building',
      lockReason: (data) => `Need: $36,000 emergency fund (12 months) + $2,000 surplus | You have: $${data.emergencyFund.toLocaleString()} fund, $${data.surplus.toLocaleString()} surplus`
    }
  ],

  /**
   * Get all priorities with their unlock status
   */
  evaluatePriorities(financialData) {
    const { income, essentials, debt, emergencyFund, surplus } = financialData;

    return this.PRIORITIES.map(priority => {
      const unlocked = priority.unlockRequirement(financialData);

      return {
        ...priority,
        unlocked: unlocked,
        hint: typeof priority.hint === 'function' ? priority.hint(financialData) : priority.hint,
        lockReason: unlocked
          ? null
          : (typeof priority.lockReason === 'function' ? priority.lockReason(financialData) : priority.lockReason)
      };
    });
  },

  /**
   * Recommend best priority based on financial situation
   */
  recommendPriority(financialData) {
    const priorities = this.evaluatePriorities(financialData);
    const unlocked = priorities.filter(p => p.unlocked);

    if (unlocked.length === 0) {
      return null; // Shouldn't happen - stabilize is always unlocked
    }

    const { surplus, debt, emergencyFund, income } = financialData;

    // Recommendation logic

    // Critical: Negative surplus = Stabilize
    if (surplus < 0) {
      return unlocked.find(p => p.id === 'stabilize');
    }

    // High debt with high interest = Get Out of Debt
    if (debt > income * 0.5 && unlocked.find(p => p.id === 'debt')) {
      return unlocked.find(p => p.id === 'debt');
    }

    // Low emergency fund + positive surplus = Feel Secure
    if (emergencyFund < income * 3 && unlocked.find(p => p.id === 'secure')) {
      return unlocked.find(p => p.id === 'secure');
    }

    // Good emergency fund + high surplus = Build Wealth
    if (emergencyFund >= income * 6 && surplus >= 800 && unlocked.find(p => p.id === 'wealth')) {
      return unlocked.find(p => p.id === 'wealth');
    }

    // Excellent foundation = Generational
    if (emergencyFund >= income * 12 && surplus >= 2000 && unlocked.find(p => p.id === 'generational')) {
      return unlocked.find(p => p.id === 'generational');
    }

    // Default: Return highest tier unlocked priority
    return unlocked.sort((a, b) => b.tier - a.tier)[0];
  },

  /**
   * Render priority selection UI
   */
  renderPriorityGrid(priorities, recommendedId) {
    return priorities.map(priority => {
      const isRecommended = priority.id === recommendedId;
      const cssClass = priority.unlocked ? 'priority-card available' : 'priority-card locked';
      const badge = isRecommended ? '<span class="recommended-badge">⭐ Recommended</span>' : '';

      return `
        <div class="${cssClass}" ${priority.unlocked ? `onclick="selectPriority('${priority.id}')"` : ''}>
          <div class="priority-icon">${priority.unlocked ? '✅' : '🔒'} ${priority.icon}</div>
          <div class="priority-title">${priority.name} ${badge}</div>
          <div class="${priority.unlocked ? 'priority-hint' : 'unlock-requirement'}">
            ${priority.unlocked ? priority.hint : priority.lockReason}
          </div>
        </div>
      `;
    }).join('');
  }
};
