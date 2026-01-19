/**
 * Tool6Fallbacks.js
 * Profile-aware fallbacks for Tool 6 GPT analysis
 *
 * Provides meaningful, personalized content when GPT fails
 * Uses profile ID, allocation data, and projections to build relevant fallbacks
 */

const Tool6Fallbacks = {

  // ============================================================
  // PROFILE-SPECIFIC NARRATIVES
  // ============================================================

  PROFILE_NARRATIVES: {
    1: { // ROBS-In-Use Strategist
      overviewTemplate: 'Your ROBS structure represents a unique retirement strategy where your business IS your retirement vehicle. This integration of business ownership and retirement planning requires careful balance.',
      keyInsights: [
        'Your retirement account is actively funding your business, which creates both opportunity and concentration risk. Diversifying some retirement savings outside the business helps protect against business volatility.',
        'As a ROBS user, you can establish employer match through your own company. This is essentially self-funding but provides tax advantages and increases your total contribution capacity.',
        'Consider building retirement assets outside ROBS as the business matures. A Solo 401(k) or SEP-IRA from business profits can complement your ROBS structure.'
      ],
      focusArea: 'Your primary focus should be establishing retirement vehicles outside your ROBS structure to diversify your retirement assets beyond business equity.'
    },
    2: { // ROBS-Curious Candidate
      overviewTemplate: 'You have shown interest in using retirement funds to start or fund a business through ROBS. This strategy can be powerful but requires significant assets and commitment.',
      keyInsights: [
        'ROBS requires $50,000+ in rollover-eligible retirement accounts. Ensure you have sufficient qualified funds before proceeding with setup.',
        'The $5,000-10,000 setup cost is an investment in your business structure. Factor this into your overall business planning budget.',
        'While exploring ROBS, continue maximizing traditional retirement vehicles. You can always redirect these funds to ROBS later if you qualify.'
      ],
      focusArea: 'Your primary focus should be determining whether ROBS is right for your situation while continuing to build retirement assets in traditional vehicles.'
    },
    3: { // Business Owner with Employees
      overviewTemplate: 'As a business owner with employees, your retirement planning involves balancing personal contribution maximization with employee benefit obligations. This dual responsibility creates both constraints and opportunities.',
      keyInsights: [
        'Your choice of retirement plan (SEP, SIMPLE, or 401k) affects both your contribution limits and your obligations to employees. Each has different contribution and administration requirements.',
        'SEP-IRA offers the simplest administration but requires you to contribute the same percentage for all eligible employees. SIMPLE IRA has lower employer costs but lower contribution limits.',
        'Consider whether a 401(k) plan might offer better flexibility despite higher administration costs, especially if you want to maximize your personal contributions.'
      ],
      focusArea: 'Your primary focus should be selecting the retirement plan type that best balances your personal contribution goals with sustainable employee benefit costs.'
    },
    4: { // Solo 401(k) Optimizer
      overviewTemplate: 'As a self-employed individual with no employees, you have access to the powerful Solo 401(k) structure. This allows both employee and employer contributions, significantly increasing your retirement contribution capacity.',
      keyInsights: [
        'Your Solo 401(k) allows up to $23,500 in employee contributions (plus catch-up if 50+) AND up to 25% of net self-employment income as employer contributions.',
        'You can split your employee contributions between Traditional (pre-tax) and Roth (after-tax) based on your tax preference. This flexibility lets you optimize for current or future tax situations.',
        'The employer contribution portion is always pre-tax, which provides current-year tax deductions regardless of your Roth vs Traditional employee contribution choice.'
      ],
      focusArea: 'Your primary focus should be maximizing both employee and employer contribution buckets of your Solo 401(k) to capture the full tax advantage available to you.'
    },
    5: { // Bracket Strategist (Traditional Priority)
      overviewTemplate: 'Your focus on Traditional (pre-tax) contributions reflects a strategy to reduce current taxes while building retirement wealth. This approach works best when you expect a lower tax bracket in retirement.',
      keyInsights: [
        'Pre-tax contributions reduce your current taxable income dollar-for-dollar. At higher tax brackets, this immediate tax savings can be substantial.',
        'Consider your expected retirement income sources. If you anticipate lower income in retirement (and thus a lower bracket), Traditional contributions maximize your tax efficiency.',
        'Remember that Required Minimum Distributions (RMDs) from Traditional accounts begin at age 73. Plan for these mandatory withdrawals in your retirement income strategy.'
      ],
      focusArea: 'Your primary focus should be maximizing Traditional contributions while you are in a higher tax bracket, then potentially shifting to Roth in lower-income years.'
    },
    6: { // Catch-Up Contributor
      overviewTemplate: 'At 50+, you have access to valuable catch-up contribution limits that can accelerate your retirement savings. This extra capacity is designed specifically for people like you who want to intensify their retirement preparation.',
      keyInsights: [
        'Catch-up contributions add $7,500 to your 401(k) limit (or $11,250 if 60-63 under SECURE 2.0 super catch-up) and $1,000 to IRA limits. These extras can compound significantly.',
        'If you feel behind on retirement savings, catch-up contributions let you save more aggressively now. Do not let past regret prevent current action - every dollar counts.',
        'HSA catch-up begins at 55, not 50. If you have HSA access and are 55+, you can contribute an extra $1,000 annually for triple-tax-advantaged growth.'
      ],
      focusArea: 'Your primary focus should be maximizing every available catch-up contribution to accelerate your retirement savings in these critical years.'
    },
    7: { // Foundation Builder
      overviewTemplate: 'As a W-2 employee building your retirement foundation, your employer 401(k) is your most powerful tool. Combining employer match with personal contributions creates a strong base for long-term wealth.',
      keyInsights: [
        'Your employer match is literally free money - ensure you contribute enough to capture the full match before directing funds elsewhere. This is the highest guaranteed return available.',
        'After capturing the match, consider whether additional 401(k) contributions or a Roth IRA make more sense based on your tax situation and investment options.',
        'Building wealth is a marathon, not a sprint. Consistent contributions over decades, combined with compound growth, create substantial retirement security.'
      ],
      focusArea: 'Your primary focus should be capturing your full employer match, then systematically increasing contributions as your income grows.'
    },
    8: { // Roth Maximizer
      overviewTemplate: 'Your preference for Roth contributions reflects a strategy to build tax-free retirement income. This approach works best when you expect higher taxes in retirement or want tax diversification.',
      keyInsights: [
        'Roth contributions use after-tax dollars but grow completely tax-free. Every dollar you contribute, plus all growth, comes out tax-free in retirement.',
        'If you expect higher income (and tax bracket) in retirement, or believe tax rates will rise generally, Roth contributions lock in your tax rate today.',
        'Roth accounts have no Required Minimum Distributions during your lifetime, offering flexibility in retirement income planning and potential estate planning benefits.'
      ],
      focusArea: 'Your primary focus should be maximizing Roth contributions while you qualify and while your current tax bracket is manageable.'
    },
    9: { // Late-Stage Growth
      overviewTemplate: 'Within 5-10 years of retirement, your strategy shifts toward balancing continued growth with risk management. This critical period requires thoughtful positioning of your retirement assets.',
      keyInsights: [
        'With a shorter time horizon, you have less time to recover from market downturns. Consider your risk tolerance carefully when selecting investments.',
        'Catch-up contributions are especially valuable now - they represent a larger percentage of your remaining working years and have meaningful impact on your final balance.',
        'Consider Roth conversions if your current income allows. Converting Traditional assets to Roth before retirement can reduce RMDs and create tax-free income sources.'
      ],
      focusArea: 'Your primary focus should be maximizing contributions while managing risk appropriately for your shorter time horizon.'
    }
  },

  // ============================================================
  // SINGLE REPORT FALLBACK
  // ============================================================

  /**
   * Generate fallback insights for Single Scenario Report
   *
   * @param {Object} profile - Profile definition
   * @param {Object} allocation - Vehicle allocation amounts
   * @param {Object} projections - Projection results
   * @param {Object} inputs - User inputs
   * @returns {Object} { overview, keyObservations, focus, implementationSteps }
   */
  getSingleReportFallback(profile, allocation, projections, inputs) {
    const profileId = profile?.id || 7;
    const narratives = this.PROFILE_NARRATIVES[profileId] || this.PROFILE_NARRATIVES[7];

    // Build overview with personalization
    const overview = this.buildOverview(narratives, profile, allocation, projections, inputs);

    // Build key observations
    const keyObservations = this.buildKeyObservations(narratives, profile, allocation, inputs);

    // Get focus area
    const focus = this.buildFocus(narratives, profile, inputs);

    // Build implementation steps
    const implementationSteps = this.buildImplementationSteps(profile, allocation, inputs);

    return {
      overview,
      keyObservations,
      focus,
      implementationSteps
    };
  },

  /**
   * Build personalized overview
   */
  buildOverview(narratives, profile, allocation, projections, inputs) {
    let overview = narratives.overviewTemplate + ' ';

    // Add age context
    const age = inputs?.age || 40;
    if (age < 35) {
      overview += 'At your age, time is your greatest asset. Even modest contributions now will grow substantially through compound interest.';
    } else if (age < 50) {
      overview += 'You are in your peak earning years with significant opportunity to build wealth. Strategic vehicle selection can maximize your growth potential.';
    } else if (age < 60) {
      overview += 'With catch-up contributions available, you can accelerate your retirement preparation in these critical years.';
    } else {
      overview += 'As you approach retirement, every contribution counts. Focus on maximizing what you can while managing risk appropriately.';
    }

    // Add projection context if available
    if (projections?.projectedBalance > 0) {
      overview += ` Your current trajectory projects to $${projections.projectedBalance.toLocaleString()} at retirement.`;
    }

    return overview;
  },

  /**
   * Build key observations from profile narratives and allocation data
   */
  buildKeyObservations(narratives, profile, allocation, inputs) {
    const observations = [...narratives.keyInsights];

    // Add allocation-specific observation
    const totalMonthly = Object.values(allocation || {}).reduce((sum, v) => sum + (v || 0), 0);
    if (totalMonthly > 0) {
      const monthlyBudget = inputs?.monthlyBudget || totalMonthly;
      const utilizationPct = Math.round((totalMonthly / monthlyBudget) * 100);

      if (utilizationPct >= 95) {
        observations.push(`Your allocation utilizes ${utilizationPct}% of your monthly retirement budget. This disciplined approach maximizes your savings potential.`);
      } else if (utilizationPct < 80) {
        observations.push(`Your allocation uses ${utilizationPct}% of your available budget. Consider directing the remaining ${100 - utilizationPct}% to your next priority vehicle.`);
      }
    }

    return observations.slice(0, 3);
  },

  /**
   * Build focus recommendation
   */
  buildFocus(narratives, profile, inputs) {
    let focus = narratives.focusArea;

    // Add urgency if near retirement
    const yearsToRetirement = inputs?.yearsToRetirement || 25;
    if (yearsToRetirement < 10) {
      focus += ' With less than 10 years to retirement, every contribution has amplified importance.';
    }

    return focus;
  },

  /**
   * Build implementation steps based on profile
   */
  buildImplementationSteps(profile, allocation, inputs) {
    const profileId = profile?.id || 7;

    // Profile-specific immediate actions
    const thisWeekActions = {
      1: ['Contact your ROBS administrator to review current structure', 'Research Solo 401(k) options for business profits'],
      2: ['Verify your rollover-eligible retirement account balances', 'Research ROBS setup providers and costs'],
      3: ['Review your current employee retirement plan costs', 'Compare SEP, SIMPLE, and 401(k) administration requirements'],
      4: ['Set up or review your Solo 401(k) contribution schedule', 'Calculate your maximum employer contribution based on net self-employment income'],
      5: ['Review your current tax bracket and projected retirement bracket', 'Increase Traditional contribution rate by at least 1%'],
      6: ['Confirm your catch-up contribution eligibility with your plan administrator', 'Increase 401(k) contribution to include full catch-up amount'],
      7: ['Verify you are contributing enough to capture full employer match', 'Set up automatic contribution increases for future raises'],
      8: ['Confirm Roth contribution eligibility based on income', 'Increase Roth 401(k) or IRA contribution rate'],
      9: ['Review your investment allocation for appropriate risk level', 'Research Roth conversion strategies for your situation']
    };

    const thirtyDayActions = {
      1: ['Open a Solo 401(k) if not already established', 'Set up automatic monthly contribution to diversification accounts'],
      2: ['Schedule consultation with ROBS provider if moving forward', 'Continue maximizing current retirement contributions'],
      3: ['Finalize retirement plan type selection', 'Communicate any plan changes to employees'],
      4: ['Make your first employer contribution of the year', 'Set up quarterly contribution calendar'],
      5: ['Implement IRA contribution strategy (Traditional vs Backdoor)', 'Review HSA contribution if eligible'],
      6: ['Set up HSA catch-up if 55+', 'Review investment allocations across all accounts'],
      7: ['Open Roth IRA if not already established', 'Research your 401(k) investment options'],
      8: ['Max out Roth IRA annual contribution', 'Review Roth 401(k) vs Roth IRA for additional contributions'],
      9: ['Complete Roth conversion analysis', 'Rebalance portfolio for retirement timeframe']
    };

    return {
      thisWeek: thisWeekActions[profileId] || thisWeekActions[7],
      thirtyDays: thirtyDayActions[profileId] || thirtyDayActions[7]
    };
  },

  // ============================================================
  // COMPARISON REPORT FALLBACK
  // ============================================================

  /**
   * Generate fallback insights for Comparison Report
   *
   * @param {Object} scenario1 - First scenario data
   * @param {Object} scenario2 - Second scenario data
   * @param {Object} inputs - User inputs
   * @returns {Object} { synthesis, decisionGuidance, tradeoffs }
   */
  getComparisonFallback(scenario1, scenario2, inputs) {
    const synthesis = this.buildComparisonSynthesis(scenario1, scenario2);
    const decisionGuidance = this.buildDecisionGuidance(scenario1, scenario2, inputs);
    const tradeoffs = this.buildTradeoffs(scenario1, scenario2);

    return {
      synthesis,
      decisionGuidance,
      tradeoffs
    };
  },

  /**
   * Build comparison synthesis
   */
  buildComparisonSynthesis(scenario1, scenario2) {
    const name1 = scenario1?.name || 'Scenario A';
    const name2 = scenario2?.name || 'Scenario B';

    const balance1 = scenario1?.projectedBalance || 0;
    const balance2 = scenario2?.projectedBalance || 0;
    const balanceDiff = balance2 - balance1;

    const taxFree1 = scenario1?.taxFreePercent || 0;
    const taxFree2 = scenario2?.taxFreePercent || 0;
    const taxFreeDiff = taxFree2 - taxFree1;

    let synthesis = `These two scenarios represent different approaches to your retirement strategy. `;

    // Balance comparison
    if (Math.abs(balanceDiff) > 10000) {
      const higher = balanceDiff > 0 ? name2 : name1;
      synthesis += `"${higher}" projects to a balance $${Math.abs(balanceDiff).toLocaleString()} higher at retirement. `;
    } else {
      synthesis += `Both scenarios project to similar balances at retirement. `;
    }

    // Tax-free comparison
    if (Math.abs(taxFreeDiff) > 5) {
      const moreRoth = taxFreeDiff > 0 ? name2 : name1;
      synthesis += `"${moreRoth}" provides ${Math.abs(taxFreeDiff)}% more in tax-free retirement assets, which can significantly impact your after-tax retirement income.`;
    } else {
      synthesis += `Both scenarios have similar tax diversification profiles.`;
    }

    return synthesis;
  },

  /**
   * Build decision guidance
   */
  buildDecisionGuidance(scenario1, scenario2, inputs) {
    const taxFree1 = scenario1?.taxFreePercent || 0;
    const taxFree2 = scenario2?.taxFreePercent || 0;
    const balance1 = scenario1?.projectedBalance || 0;
    const balance2 = scenario2?.projectedBalance || 0;

    let guidance = '';

    // Tax bracket consideration
    const age = inputs?.age || 40;
    if (age < 45 && Math.abs(taxFree2 - taxFree1) > 10) {
      const rothHeavy = taxFree2 > taxFree1 ? scenario2?.name : scenario1?.name;
      guidance = `Given your age and long time horizon, "${rothHeavy}" with higher Roth allocation may provide greater flexibility and tax-free growth. `;
    } else if (age >= 55 && balance2 !== balance1) {
      const higher = balance2 > balance1 ? scenario2?.name : scenario1?.name;
      guidance = `With retirement approaching, "${higher}" with the higher projected balance may provide more security. `;
    } else {
      guidance = `Both scenarios are viable approaches. Consider which better aligns with your current priorities and tax situation. `;
    }

    guidance += 'Remember that you can adjust your strategy over time as circumstances change.';

    return guidance;
  },

  /**
   * Build tradeoff list
   */
  buildTradeoffs(scenario1, scenario2) {
    const tradeoffs = [];

    const taxFree1 = scenario1?.taxFreePercent || 0;
    const taxFree2 = scenario2?.taxFreePercent || 0;
    const balance1 = scenario1?.projectedBalance || 0;
    const balance2 = scenario2?.projectedBalance || 0;
    const budget1 = scenario1?.monthlyBudget || 0;
    const budget2 = scenario2?.monthlyBudget || 0;

    // Tax diversification trade-off
    if (Math.abs(taxFree2 - taxFree1) > 5) {
      const rothHeavy = taxFree2 > taxFree1 ? scenario2?.name : scenario1?.name;
      const tradHeavy = taxFree2 > taxFree1 ? scenario1?.name : scenario2?.name;
      tradeoffs.push(`Tax Strategy: "${rothHeavy}" prioritizes tax-free growth (better if taxes rise), while "${tradHeavy}" provides more current tax deductions (better if you expect lower retirement taxes).`);
    }

    // Balance trade-off
    if (Math.abs(balance2 - balance1) > 10000) {
      tradeoffs.push(`Projected Balance: The $${Math.abs(balance2 - balance1).toLocaleString()} difference in projected balances reflects different vehicle choices and growth assumptions.`);
    }

    // Budget utilization trade-off
    if (Math.abs(budget2 - budget1) > 100) {
      tradeoffs.push(`Monthly Commitment: The scenarios require different monthly contribution amounts, which affects your current cash flow.`);
    }

    // Add generic trade-off if needed
    if (tradeoffs.length < 2) {
      tradeoffs.push(`Flexibility vs Structure: Consider which approach better matches your ability to maintain consistent contributions over time.`);
      tradeoffs.push(`Current vs Future: Every retirement decision involves balancing current lifestyle with future security.`);
    }

    return tradeoffs.slice(0, 3);
  },

  // ============================================================
  // AGE-BASED NARRATIVES
  // ============================================================

  getAgeBasedOpening(age) {
    if (age < 30) {
      return 'In your twenties, you have the incredible advantage of time. Even small contributions now will grow substantially through decades of compound interest.';
    } else if (age < 40) {
      return 'In your thirties, you are likely hitting your stride in career and earning potential. This is an ideal time to ramp up retirement savings.';
    } else if (age < 50) {
      return 'In your forties, you are in peak earning years with significant capacity to build wealth. Strategic vehicle selection matters more than ever.';
    } else if (age < 60) {
      return 'In your fifties, catch-up contributions open additional doors. These extra contributions can have meaningful impact on your final retirement balance.';
    } else {
      return 'With retirement on the horizon, every contribution counts. Focus on maximizing available vehicles while managing risk appropriately for your timeline.';
    }
  },

  // ============================================================
  // TAX STRATEGY NARRATIVES
  // ============================================================

  getTaxStrategyNarrative(taxPreference, age, income) {
    if (taxPreference === 'Roth-Heavy') {
      if (age < 40) {
        return 'Your Roth preference is well-suited for your age. Decades of tax-free growth can create substantial tax-free retirement income.';
      } else if (income > 150000) {
        return 'Your Roth preference with higher income means paying taxes now at elevated rates, but locks in tax-free growth regardless of future rate changes.';
      } else {
        return 'Your Roth preference builds tax diversification. Having tax-free income sources in retirement provides flexibility.';
      }
    } else if (taxPreference === 'Traditional-Heavy') {
      if (income > 150000) {
        return 'Your Traditional preference makes sense at higher income levels. Pre-tax contributions reduce current taxes when the savings are most valuable.';
      } else {
        return 'Your Traditional preference provides current tax deductions. Ensure you expect lower taxes in retirement to maximize this strategy.';
      }
    } else {
      return 'Your balanced tax approach provides flexibility. Having both pre-tax and after-tax retirement assets gives you options in retirement.';
    }
  }
};
