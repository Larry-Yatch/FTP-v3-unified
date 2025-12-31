/**
 * Tool4Fallbacks.js
 * Score-aware fallbacks for Tool 4 GPT analysis
 *
 * Provides meaningful, personalized content when GPT fails
 * Uses behavioral scores and allocation data to build relevant fallbacks
 */

const Tool4Fallbacks = {

  // ============================================================
  // MAIN REPORT FALLBACK
  // ============================================================

  /**
   * Generate fallback insights for Main Report
   *
   * @param {Object} preSurveyData - Behavioral profile data
   * @param {Object} allocation - Allocation percentages and strategy
   * @returns {Object} { overview, strategicInsights, recommendation }
   */
  getMainReportFallback(preSurveyData, allocation) {
    const profile = this.analyzeProfile(preSurveyData);
    const strategy = this.detectStrategy(allocation?.percentages || {});
    const percentages = allocation?.percentages || {};

    // Build personalized overview
    const overview = this.buildOverview(profile, strategy, percentages, preSurveyData);

    // Build strategic insights based on allocation characteristics
    const strategicInsights = this.buildStrategicInsights(profile, percentages, preSurveyData);

    // Build recommendation based on highest priority area
    const recommendation = this.buildRecommendation(profile, strategy, percentages, preSurveyData);

    return {
      overview,
      strategicInsights,
      recommendation
    };
  },

  /**
   * Analyze behavioral profile for fallback content
   */
  analyzeProfile(preSurveyData) {
    if (!preSurveyData) {
      return {
        satisfactionLevel: 'moderate',
        disciplineLevel: 'moderate',
        readyForChange: false,
        needsStructure: false,
        futureOriented: false
      };
    }

    const satisfaction = Number(preSurveyData.satisfaction) || 5;
    const discipline = Number(preSurveyData.discipline) || 5;
    const impulse = Number(preSurveyData.impulse) || 5;
    const longTerm = Number(preSurveyData.longTerm) || 5;
    const lifestyle = Number(preSurveyData.lifestyle) || 5;

    return {
      satisfactionLevel: satisfaction < 4 ? 'low' : satisfaction > 7 ? 'high' : 'moderate',
      disciplineLevel: discipline < 4 ? 'low' : discipline > 7 ? 'high' : 'moderate',
      readyForChange: satisfaction < 5,
      needsStructure: discipline < 5 || impulse < 5,
      futureOriented: longTerm > 6,
      lifestyleFocused: lifestyle > 6,
      satisfaction,
      discipline,
      impulse,
      longTerm,
      lifestyle
    };
  },

  /**
   * Detect strategy from percentages
   *
   * NOTE: Three implementations exist for different contexts:
   *   1. detectStrategyClient() in Tool4.js - returns rich object for comparison modal
   *   2. Tool4.detectStrategy() - server-side rich object for narratives
   *   3. This function - returns simple string for GPT fallback content
   * If changing strategy logic, consider updating all three.
   */
  detectStrategy(percentages) {
    const { Multiply = 0, Freedom = 0, Enjoyment = 0 } = percentages;

    if (Freedom >= 35) return 'Security First';
    if (Multiply >= 30) return 'Wealth Builder';
    if (Enjoyment >= 30) return 'Lifestyle Balance';
    if (Freedom >= 25 && Multiply >= 20) return 'Balanced Growth';
    return 'Balanced';
  },

  /**
   * Build personalized overview
   */
  buildOverview(profile, strategy, percentages, preSurveyData) {
    const priority = preSurveyData?.selectedPriority || 'general financial health';
    const monthlyIncome = Number(preSurveyData?.monthlyIncome) || 0;

    let overview = '';

    // Opening paragraph - connect profile to allocation
    if (profile.readyForChange) {
      overview += `Your financial satisfaction score indicates you are ready for meaningful change, and your allocation reflects that intention. `;
    } else if (profile.satisfactionLevel === 'high') {
      overview += `Your relatively high financial satisfaction suggests your current approach is working in many ways. This allocation aims to optimize what is already going well. `;
    } else {
      overview += `Your allocation has been designed to help you make steady progress toward your financial goals. `;
    }

    // Strategy explanation
    overview += this.getStrategyExplanation(strategy, priority);
    overview += '\n\n';

    // Second paragraph - behavioral considerations
    if (profile.needsStructure) {
      overview += `Given your behavioral profile, having clear structures and automatic systems will be important for success. Consider setting up automatic transfers on payday so decisions are made in advance rather than in the moment. `;
    } else if (profile.disciplineLevel === 'high') {
      overview += `Your strong discipline score suggests you have the self-control to stick with this allocation even when it feels restrictive. This gives you more flexibility to pursue aggressive goals. `;
    }

    if (profile.futureOriented && percentages.Multiply < 20) {
      overview += `While you show strong long-term thinking, your current allocation prioritizes near-term goals. This is appropriate given your selected priority, but you may want to increase Multiply as circumstances allow.`;
    } else if (!profile.futureOriented && percentages.Multiply >= 25) {
      overview += `Your allocation includes significant wealth-building, which is excellent. Consider setting up visual reminders of your long-term goals to maintain motivation.`;
    }

    return overview.trim();
  },

  /**
   * Get strategy-specific explanation
   */
  getStrategyExplanation(strategy, priority) {
    const explanations = {
      'Security First': `Your "Security First" approach dedicates substantial resources to debt elimination and emergency reserves. This aligns with your ${priority} goal and prioritizes stability over growth in the near term.`,
      'Wealth Builder': `Your "Wealth Builder" approach emphasizes long-term wealth accumulation. This forward-thinking allocation can generate significant compound returns over time, supporting your goal of ${priority}.`,
      'Lifestyle Balance': `Your "Lifestyle Balance" approach acknowledges that sustainable financial plans must include room for enjoyment. This allocation supports your ${priority} goal while maintaining quality of life.`,
      'Balanced Growth': `Your "Balanced Growth" approach splits resources between security and wealth-building. This measured strategy progresses on multiple fronts while supporting your ${priority} goal.`,
      'Balanced': `Your balanced allocation distributes resources across all financial priorities. This flexible approach allows you to make progress toward ${priority} while maintaining optionality.`
    };

    return explanations[strategy] || explanations['Balanced'];
  },

  /**
   * Build strategic insights based on allocation
   */
  buildStrategicInsights(profile, percentages, preSurveyData) {
    const insights = [];
    const monthlyIncome = Number(preSurveyData?.monthlyIncome) || 0;
    const monthlyEssentials = Number(preSurveyData?.monthlyEssentials) || 0;
    const totalDebt = Number(preSurveyData?.totalDebt) || 0;
    const emergencyFund = Number(preSurveyData?.emergencyFund) || 0;

    // Essentials margin insight
    if (monthlyIncome > 0 && percentages.Essentials) {
      const essentialsDollars = Math.round(monthlyIncome * percentages.Essentials / 100);
      const margin = essentialsDollars - monthlyEssentials;
      if (margin < 100 && monthlyEssentials > 0) {
        insights.push(`Your ${percentages.Essentials}% Essentials allocation ($${essentialsDollars.toLocaleString()}/month) leaves limited buffer above your actual spending. Building in margin helps handle unexpected costs.`);
      } else if (margin > monthlyEssentials * 0.2) {
        insights.push(`Your Essentials allocation includes healthy margin above current spending. This buffer provides flexibility for cost increases or unexpected needs.`);
      }
    }

    // Freedom allocation insight
    if (percentages.Freedom >= 30 && totalDebt > 0) {
      const freedomDollars = Math.round(monthlyIncome * percentages.Freedom / 100);
      insights.push(`With ${percentages.Freedom}% going to Freedom ($${freedomDollars.toLocaleString()}/month), you are prioritizing debt elimination and security building. This aggressive approach can significantly accelerate your timeline.`);
    } else if (percentages.Freedom < 15 && totalDebt > 10000) {
      insights.push(`Your ${percentages.Freedom}% Freedom allocation is modest given your debt level. Consider whether increasing this percentage would help you reach debt-free status faster.`);
    }

    // Multiply insight for future growth
    if (percentages.Multiply >= 25) {
      const multiplyDollars = Math.round(monthlyIncome * percentages.Multiply / 100);
      insights.push(`Your ${percentages.Multiply}% Multiply allocation ($${multiplyDollars.toLocaleString()}/month) demonstrates commitment to wealth-building. Consistent contributions at this level can grow substantially over time.`);
    } else if (percentages.Multiply < 10 && profile.futureOriented) {
      insights.push(`Your Multiply allocation is conservative. Given your long-term thinking orientation, consider gradually increasing this as debt decreases or income grows.`);
    }

    // Enjoyment and discipline interaction
    if (percentages.Enjoyment < 15 && profile.disciplineLevel === 'low') {
      insights.push(`Your tight ${percentages.Enjoyment}% Enjoyment allocation requires discipline. Consider tracking your discretionary spending carefully to avoid overspending in other categories.`);
    } else if (percentages.Enjoyment >= 25 && profile.disciplineLevel === 'high') {
      insights.push(`Your ${percentages.Enjoyment}% Enjoyment allocation is generous, but your strong discipline suggests you will use it intentionally rather than impulsively.`);
    }

    // Emergency fund insight
    if (emergencyFund < monthlyEssentials * 2 && percentages.Freedom >= 20) {
      insights.push(`Your current emergency fund provides limited coverage. Your Freedom allocation can help build this reserve while also addressing other security goals.`);
    }

    // Ensure we have at least 2 insights
    if (insights.length < 2) {
      insights.push(`Your allocation reflects your selected priority and creates a framework for consistent progress. Review quarterly to ensure it still matches your circumstances.`);
    }

    return insights.slice(0, 3);
  },

  /**
   * Build personalized recommendation
   */
  buildRecommendation(profile, strategy, percentages, preSurveyData) {
    const totalDebt = Number(preSurveyData?.totalDebt) || 0;
    const emergencyFund = Number(preSurveyData?.emergencyFund) || 0;
    const monthlyEssentials = Number(preSurveyData?.monthlyEssentials) || 0;

    // Prioritize based on financial situation
    if (emergencyFund < monthlyEssentials * 2 && emergencyFund < 2000) {
      return `Your most important focus should be building your emergency fund. Even a small cushion of $1,000-2,000 provides significant peace of mind and prevents debt accumulation when unexpected expenses arise. Direct your Freedom allocation here until you have at least two months of essential expenses saved.`;
    }

    if (totalDebt > 10000 && strategy !== 'Security First') {
      return `With significant debt, your primary focus should be consistent debt reduction. Every dollar directed to Freedom should target your highest-interest debt first. Consider the debt avalanche method (highest interest first) to minimize total interest paid, or debt snowball (smallest balance first) if you need the motivation of quick wins.`;
    }

    if (profile.needsStructure) {
      return `Your most important focus should be automation. Set up automatic transfers immediately after each paycheck so your allocation happens without requiring willpower. When saving and investing happen automatically, you remove the decision points where impulse spending often occurs. Start with just one automated transfer this week.`;
    }

    if (profile.lifestyleFocused && percentages.Multiply >= 20) {
      return `Your most important focus should be maintaining balance between current enjoyment and future security. You have built wealth-building into your allocation, which is excellent. Now focus on ensuring your Enjoyment spending goes toward experiences that genuinely enhance your life rather than mindless consumption.`;
    }

    // Default recommendation
    return `Your most important focus should be consistency. The best allocation is one you can maintain month after month. Track your actual spending against these percentages for the first 30 days, then adjust as needed. Small, consistent progress beats aggressive plans that fail within weeks.`;
  },

  // ============================================================
  // COMPARISON REPORT FALLBACK
  // ============================================================

  /**
   * Generate fallback insights for Comparison Report
   *
   * @param {Object} scenario1 - First scenario
   * @param {Object} scenario2 - Second scenario
   * @param {Object} preSurveyData - Current profile data
   * @returns {Object} { synthesis, decisionGuidance }
   */
  getComparisonFallback(scenario1, scenario2, preSurveyData) {
    const synthesis = this.buildComparisonSynthesis(scenario1, scenario2, preSurveyData);
    const decisionGuidance = this.buildDecisionGuidance(scenario1, scenario2, preSurveyData);

    return {
      synthesis,
      decisionGuidance
    };
  },

  /**
   * Build comparison synthesis
   */
  buildComparisonSynthesis(scenario1, scenario2, preSurveyData) {
    const alloc1 = scenario1?.allocations || {};
    const alloc2 = scenario2?.allocations || {};
    const name1 = scenario1?.name || 'Scenario A';
    const name2 = scenario2?.name || 'Scenario B';

    // Calculate key differences
    const freedomDiff = (alloc2.Freedom || 0) - (alloc1.Freedom || 0);
    const multiplyDiff = (alloc2.Multiply || 0) - (alloc1.Multiply || 0);
    const enjoymentDiff = (alloc2.Enjoyment || 0) - (alloc1.Enjoyment || 0);

    let synthesis = '';

    // Opening paragraph - describe what differs
    if (Math.abs(freedomDiff) >= 10) {
      const moreAggressive = freedomDiff > 0 ? name2 : name1;
      const lessAggressive = freedomDiff > 0 ? name1 : name2;
      synthesis += `The primary difference between these scenarios is your approach to debt and security. "${moreAggressive}" takes a more aggressive stance with ${Math.abs(freedomDiff)}% more allocated to Freedom, while "${lessAggressive}" provides more room for other priorities. `;
    } else if (Math.abs(multiplyDiff) >= 10) {
      const wealthFocused = multiplyDiff > 0 ? name2 : name1;
      synthesis += `These scenarios differ significantly in wealth-building emphasis. "${wealthFocused}" prioritizes long-term growth with a ${Math.abs(multiplyDiff)}% higher Multiply allocation. `;
    } else if (Math.abs(enjoymentDiff) >= 10) {
      const lifestyleFocused = enjoymentDiff > 0 ? name2 : name1;
      synthesis += `The key difference is in lifestyle allocation. "${lifestyleFocused}" provides ${Math.abs(enjoymentDiff)}% more for Enjoyment, offering greater flexibility for discretionary spending. `;
    } else {
      synthesis += `These scenarios are relatively similar, with differences of less than 10% in each bucket. The choice between them comes down to subtle trade-offs rather than dramatically different approaches. `;
    }

    synthesis += '\n\n';

    // Second paragraph - implications
    const profile = this.analyzeProfile(preSurveyData);
    if (profile.needsStructure) {
      synthesis += `Given your behavioral profile, the scenario with clearer constraints may be easier to maintain. Tighter limits on discretionary spending can actually reduce decision fatigue.`;
    } else if (profile.disciplineLevel === 'high') {
      synthesis += `Your strong discipline gives you flexibility to succeed with either approach. Consider which scenario better aligns with your current priorities and life circumstances.`;
    } else {
      synthesis += `Both scenarios can work if followed consistently. The best choice depends on which trade-offs feel more sustainable for your specific situation and goals.`;
    }

    return synthesis.trim();
  },

  /**
   * Build decision guidance
   */
  buildDecisionGuidance(scenario1, scenario2, preSurveyData) {
    const alloc1 = scenario1?.allocations || {};
    const alloc2 = scenario2?.allocations || {};
    const name1 = scenario1?.name || 'Scenario A';
    const name2 = scenario2?.name || 'Scenario B';

    const totalDebt = Number(preSurveyData?.totalDebt) || 0;
    const profile = this.analyzeProfile(preSurveyData);

    // Calculate which is more aggressive on Freedom
    const freedom1 = alloc1.Freedom || 0;
    const freedom2 = alloc2.Freedom || 0;
    const moreSecurityFocused = freedom1 > freedom2 ? name1 : name2;
    const moreFlexible = freedom1 > freedom2 ? name2 : name1;

    let guidance = '';

    if (totalDebt > 15000) {
      guidance = `Given your debt level, "${moreSecurityFocused}" may accelerate your path to debt freedom. However, if the tighter allocation feels unsustainable, "${moreFlexible}" with consistent execution will outperform an aggressive plan you cannot maintain.`;
    } else if (profile.readyForChange && profile.disciplineLevel !== 'low') {
      guidance = `Your readiness for change suggests you could handle the more aggressive option. Choose the scenario that addresses your most pressing concern. You can always adjust after a few months of data.`;
    } else if (profile.disciplineLevel === 'low') {
      guidance = `Consider starting with the more flexible scenario. Sustainable progress beats aggressive plans that lead to frustration. Once you build confidence with consistent execution, you can revisit the more aggressive option.`;
    } else {
      guidance = `Both scenarios represent valid approaches. If uncertain, start with the one that feels more achievable and commit to reviewing after 90 days. Real-world experience will clarify which trade-offs matter most to you.`;
    }

    return guidance;
  }
};
