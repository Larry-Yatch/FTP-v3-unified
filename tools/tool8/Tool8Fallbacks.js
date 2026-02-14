/**
 * Tool8Fallbacks.js
 * Fallback content for Tool 8 GPT analysis when OpenAI is unavailable
 *
 * Provides meaningful, mode-aware and feasibility-aware content
 * using the student's actual numbers without GPT personalization.
 *
 * Phase 8: GPT-Enhanced Reports
 */

var Tool8Fallbacks = {

  // ============================================================
  // SINGLE REPORT FALLBACK
  // ============================================================

  /**
   * Generate fallback insights for single-scenario PDF
   * Keyed by calculation mode and feasibility result.
   *
   * @param {Object} scenario - Scenario data from calculator
   * @returns {Object} {overview, keyInsights, nextSteps, source: 'fallback'}
   */
  getSingleReportFallback: function(scenario) {
    var mode = scenario.mode || 'contrib';
    var riskBand = Tool8Report.getRiskBand(scenario.risk || 0);
    var feasible = this._isFeasible(scenario);

    var overview = this._buildOverview(scenario, mode, feasible, riskBand);
    var keyInsights = this._buildKeyInsights(scenario, mode, feasible, riskBand);
    var nextSteps = this._buildNextSteps(scenario, mode, feasible);

    return {
      overview: overview,
      keyInsights: keyInsights,
      nextSteps: nextSteps,
      source: 'fallback'
    };
  },

  // ============================================================
  // COMPARISON REPORT FALLBACK
  // ============================================================

  /**
   * Generate fallback insights for comparison PDF
   *
   * @param {Object} s1 - First scenario
   * @param {Object} s2 - Second scenario
   * @returns {Object} {synthesis, guidance, tradeoffs, source: 'fallback'}
   */
  getComparisonFallback: function(s1, s2) {
    var name1 = s1.name || 'Scenario A';
    var name2 = s2.name || 'Scenario B';
    var f1 = this._isFeasible(s1);
    var f2 = this._isFeasible(s2);

    var synthesis = 'Your two scenarios, "' + name1 + '" and "' + name2 + '", explore different approaches to reaching your retirement goals. ' +
      '"' + name1 + '" targets $' + Math.round(s1.M_real || 0).toLocaleString() + '/month in retirement income with a risk level of ' + Number(s1.risk || 0).toFixed(1) + '/10, ' +
      'while "' + name2 + '" targets $' + Math.round(s2.M_real || 0).toLocaleString() + '/month at risk level ' + Number(s2.risk || 0).toFixed(1) + '/10. ' +
      'The required nest eggs differ by $' + Math.round(Math.abs((s1.Areq || 0) - (s2.Areq || 0))).toLocaleString() + '.';

    var guidance;
    if (f1 && !f2) {
      guidance = '"' + name1 + '" is currently the more achievable path based on your numbers. Consider what adjustments to "' + name2 + '" would bring it within reach.';
    } else if (!f1 && f2) {
      guidance = '"' + name2 + '" is currently the more achievable path based on your numbers. Consider what adjustments to "' + name1 + '" would bring it within reach.';
    } else if (f1 && f2) {
      guidance = 'Both scenarios are feasible given your current capacity. Your choice comes down to which trade-offs align better with your priorities and comfort level.';
    } else {
      guidance = 'Neither scenario is fully feasible with current inputs. Consider increasing your savings capacity, extending your timeline, or adjusting your retirement income goal.';
    }

    var tradeoffs = [];
    // Income goal difference
    if (Math.abs((s1.M_real || 0) - (s2.M_real || 0)) > 100) {
      tradeoffs.push('"' + name1 + '" targets $' + Math.round(s1.M_real).toLocaleString() + '/month while "' + name2 + '" targets $' + Math.round(s2.M_real).toLocaleString() + '/month. A higher income goal requires a larger nest egg and either more savings or higher returns.');
    }
    // Risk difference
    if (Math.abs((s1.risk || 0) - (s2.risk || 0)) > 1) {
      tradeoffs.push('Risk levels differ: ' + Number(s1.risk).toFixed(1) + '/10 versus ' + Number(s2.risk).toFixed(1) + '/10. Higher risk may increase potential returns but also increases the chance of significant short-term losses.');
    }
    // Timeline difference
    if (Math.abs((s1.T || 0) - (s2.T || 0)) > 2) {
      tradeoffs.push('Timelines differ by ' + Math.abs((s1.T || 0) - (s2.T || 0)) + ' years. A longer timeline gives compound growth more time to work but delays the transition to retirement.');
    }
    // Generic if no specific differences
    if (tradeoffs.length === 0) {
      tradeoffs.push('Both scenarios share similar parameters. Small differences in savings capacity or risk level can compound significantly over time.');
      tradeoffs.push('Consider which scenario you are most likely to follow through on consistently. The best plan is the one you actually execute.');
    }

    return {
      synthesis: synthesis,
      guidance: guidance,
      tradeoffs: tradeoffs,
      source: 'fallback'
    };
  },

  // ============================================================
  // INTERNAL HELPERS
  // ============================================================

  /**
   * Determine if a scenario is feasible
   */
  _isFeasible: function(scenario) {
    var mode = scenario.mode || 'contrib';
    if (mode === 'contrib' && scenario.Creq !== '') {
      return Number(scenario.C_cap) >= Number(scenario.Creq);
    }
    if (mode === 'return' && scenario.rSolved !== '') {
      return Number(scenario.rSolved) <= 0.25;
    }
    if (mode === 'time' && scenario.tSolved !== '') {
      return isFinite(Number(scenario.tSolved));
    }
    return false;
  },

  /**
   * Build overview paragraph based on mode and feasibility
   */
  _buildOverview: function(scenario, mode, feasible, riskBand) {
    var income = Math.round(scenario.M_real || 0).toLocaleString();
    var years = scenario.T || 0;
    var nestEgg = Math.round(scenario.Areq || 0).toLocaleString();

    if (mode === 'contrib') {
      if (feasible) {
        var surplus = Math.round(Number(scenario.C_cap) - Number(scenario.Creq)).toLocaleString();
        return 'Your plan to generate $' + income + '/month in retirement income is achievable within your current savings capacity. ' +
          'Over ' + years + ' years, you need to build a nest egg of $' + nestEgg + ', and your capacity exceeds the requirement by $' + surplus + '/month. ' +
          'Your ' + riskBand.label.toLowerCase() + ' risk approach provides a realistic path to this goal.';
      } else {
        var shortfall = Math.round(Math.abs(Number(scenario.C_cap) - Number(scenario.Creq))).toLocaleString();
        return 'Your goal of $' + income + '/month in retirement income requires more than your current savings capacity can support. ' +
          'The shortfall is $' + shortfall + '/month. This does not mean the goal is out of reach — adjusting your timeline, income target, or risk level can close the gap. ' +
          'Understanding where you stand is the essential first step.';
      }
    }

    if (mode === 'return') {
      var reqReturn = scenario.rSolved !== '' ? (Number(scenario.rSolved) * 100).toFixed(1) + '%' : 'N/A';
      if (feasible) {
        return 'To reach your goal of $' + income + '/month in retirement with your current savings plan, you need an average annual return of ' + reqReturn + '. ' +
          'This is within the range of historical market returns, making your plan achievable with disciplined investing and appropriate asset allocation.';
      } else {
        return 'The return required to meet your goal (' + reqReturn + ' annually) exceeds what typical diversified portfolios have historically delivered. ' +
          'Consider increasing your monthly contributions, extending your timeline, or adjusting your income target to bring the required return into an achievable range.';
      }
    }

    // mode === 'time'
    var yearsSolved = scenario.tSolved !== '' ? Math.round(Number(scenario.tSolved)) : 'N/A';
    return 'Based on your current savings rate and investment approach, you would need approximately ' + yearsSolved + ' years to build the $' + nestEgg + ' nest egg required for $' + income + '/month in retirement income. ' +
      'This timeline gives you a concrete target to plan around and adjust as your circumstances change.';
  },

  /**
   * Build key insights array based on scenario data
   */
  _buildKeyInsights: function(scenario, mode, feasible, riskBand) {
    var insights = [];

    // Insight 1: Feasibility interpretation
    if (mode === 'contrib') {
      if (feasible) {
        insights.push('Your savings capacity of $' + Math.round(scenario.C_cap).toLocaleString() + '/month exceeds the $' + Math.round(Number(scenario.Creq)).toLocaleString() + '/month required. This surplus gives you a buffer against months when saving is harder and allows for potential acceleration of your timeline.');
      } else {
        insights.push('The gap between your $' + Math.round(scenario.C_cap).toLocaleString() + '/month capacity and the $' + Math.round(Number(scenario.Creq)).toLocaleString() + '/month requirement is a starting point, not a verdict. Even partial progress toward this goal builds meaningful wealth over time.');
      }
    } else if (mode === 'return') {
      insights.push('The calculator solved for the return rate needed to reach your goal. This helps you understand what kind of investment strategy would be required and whether it aligns with your risk tolerance of ' + Number(scenario.risk).toFixed(1) + '/10.');
    } else {
      insights.push('Knowing you need approximately ' + Math.round(Number(scenario.tSolved)) + ' years gives you a concrete milestone. You can use this as a benchmark and revisit as your savings capacity or investment returns change.');
    }

    // Insight 2: Risk context
    insights.push('Your risk level of ' + Number(scenario.risk).toFixed(1) + '/10 (' + riskBand.label + ') maps to an effective return of ' + (Number(scenario.rAccEff) * 100).toFixed(1) + '% after conservative pacing. ' + riskBand.explain);

    // Insight 3: Time and compounding
    var years = scenario.T || 0;
    if (years >= 20) {
      insights.push('With ' + years + ' years until retirement, compound growth is your greatest asset. Even modest consistent contributions can grow substantially over this timeframe. Starting now — even with less than ideal amounts — matters more than waiting for a perfect plan.');
    } else if (years >= 10) {
      insights.push('With ' + years + ' years, you have meaningful time for growth but less room for recovery from market downturns. Consistency in contributions matters more than trying to time the market.');
    } else {
      insights.push('With ' + years + ' years to retirement, capital preservation becomes increasingly important alongside growth. Consider balancing your allocation between growth assets and more stable options as you approach your target date.');
    }

    return insights;
  },

  /**
   * Build next steps array based on scenario data
   */
  _buildNextSteps: function(scenario, mode, feasible) {
    var steps = [];

    if (feasible) {
      steps.push('This week, review your current retirement account contributions and verify they match or exceed $' + Math.round(Number(scenario.Creq || scenario.C_cap)).toLocaleString() + '/month.');
      steps.push('Within 30 days, set up automatic transfers so contributions happen before you can redirect the money to other expenses.');
      steps.push('Every quarter, log in to review your balance growth and compare it against your $' + Math.round(scenario.Areq).toLocaleString() + ' target nest egg.');
    } else {
      steps.push('This week, identify one area where you could increase your monthly savings — even $50/month moves the needle over ' + (scenario.T || 0) + ' years.');
      steps.push('Within 30 days, run a new scenario with an adjusted income goal or extended timeline to find a plan that fits your current capacity.');
      steps.push('Every quarter, revisit this calculator as your income or expenses change — a plan that does not work today may become feasible with small adjustments over time.');
    }

    return steps;
  }
};
