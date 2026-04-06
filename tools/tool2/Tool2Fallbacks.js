/**
 * Tool2Fallbacks.js
 * Gap-aware fallback insights when GPT analysis fails
 * Phase 4: Updated for consolidated insight structure with gap language
 *
 * Part of 3-tier fallback system: GPT -> Retry -> Fallback
 * Ensures 100% reliability - users always get valuable insights
 */

const Tool2Fallbacks = {

  /**
   * Get consolidated fallback insight based on gap data and trauma profile
   * @param {object} results - Full results object with objectiveHealthScores, subjectiveScores, gapClassifications, tool1Profile
   * @param {object} formData - All form data
   * @param {object} traumaData - Tool1 trauma assessment data
   * @returns {object} Fallback insight {overview, topPatterns, priorityActions}
   */
  getConsolidatedFallback(results, formData, traumaData) {
    var objScores = results.objectiveHealthScores || {};
    var subScores = results.subjectiveScores || {};
    var gapClass = results.gapClassifications || {};
    var profile = results.tool1Profile || {};
    var patternName = this.getPatternName(profile.winner);

    // Find the domain with the largest gap
    var biggestGapDomain = this.findBiggestGap(objScores, subScores);
    var biggestGapLabel = this.DOMAIN_LABELS[biggestGapDomain] || biggestGapDomain;
    var biggestGapDirection = gapClass[biggestGapDomain] || 'UNKNOWN';

    // Find lowest objective domain
    var lowestDomain = this.findLowestDomain(objScores);
    var lowestLabel = this.DOMAIN_LABELS[lowestDomain] || lowestDomain;
    var lowestScore = objScores[lowestDomain] || 0;

    // Build overview
    var overview = 'Your Financial Mirror reveals a pattern worth examining. ';
    if (biggestGapDirection === 'UNDERESTIMATING' || biggestGapDirection === 'SLIGHTLY_UNDER') {
      overview += 'In ' + biggestGapLabel + ', your financial reality is stronger than your perception suggests. ';
      overview += 'Your objective score (' + (objScores[biggestGapDomain] || 0) + '/100) exceeds your perceived clarity (' + (subScores[biggestGapDomain] || 0) + '/100). ';
      overview += 'For someone with a ' + patternName + ' pattern, this gap often reflects a tendency to underestimate your own financial position.';
    } else if (biggestGapDirection === 'OVERESTIMATING' || biggestGapDirection === 'SLIGHTLY_OVER') {
      overview += 'In ' + biggestGapLabel + ', your perception is more confident than your numbers support. ';
      overview += 'Your perceived clarity (' + (subScores[biggestGapDomain] || 0) + '/100) exceeds your objective reality (' + (objScores[biggestGapDomain] || 0) + '/100). ';
      overview += 'For someone with a ' + patternName + ' pattern, this gap often reflects a blind spot worth exploring.';
    } else {
      overview += 'Your perception across most domains is reasonably aligned with your financial reality. ';
      overview += 'Your lowest objective area is ' + lowestLabel + ' at ' + lowestScore + '/100. ';
      overview += 'Building clarity here will have the most immediate impact on your overall financial confidence.';
    }

    // Build pattern connections
    var topPatterns = '- Your ' + patternName + ' pattern appears to influence how you perceive your financial position across domains\n';
    topPatterns += '- The gap between reality and perception in ' + biggestGapLabel + ' is the strongest signal of where this pattern is active\n';
    topPatterns += '- Building objective awareness (tracking actual numbers) helps counteract pattern-driven distortions';

    // Build priority actions
    var priorityActions = '1. Focus on ' + lowestLabel + ' first — at ' + lowestScore + '/100, this domain will benefit most from attention\n';
    priorityActions += '2. Compare your perception to reality in ' + biggestGapLabel + ' — notice where your ' + patternName + ' pattern may be shaping what you see\n';
    priorityActions += '3. Set up a monthly 15-minute financial check-in to build objective awareness\n';
    priorityActions += '4. Track one key metric in your lowest domain for the next 30 days\n';
    priorityActions += '5. Share your Financial Mirror results with a trusted person for outside perspective';

    return {
      overview: overview,
      topPatterns: topPatterns,
      priorityActions: priorityActions
    };
  },

  DOMAIN_LABELS: {
    moneyFlow: 'Money Flow',
    obligations: 'Obligations',
    liquidity: 'Liquidity',
    growth: 'Growth',
    protection: 'Protection'
  },

  getPatternName(key) {
    var names = {
      FSV: 'False Self-View', ExVal: 'External Validation',
      Showing: 'Issues Showing Love', Receiving: 'Issues Receiving Love',
      Control: 'Control Leading to Isolation', Fear: 'Fear Leading to Isolation'
    };
    return names[key] || key || 'Unknown';
  },

  findBiggestGap(objScores, subScores) {
    var biggest = 'moneyFlow';
    var biggestGap = 0;
    Object.keys(objScores).forEach(function(d) {
      var obj = objScores[d] || 0;
      var sub = subScores[d] || 0;
      var gap = Math.abs(obj - sub);
      if (gap > biggestGap) {
        biggestGap = gap;
        biggest = d;
      }
    });
    return biggest;
  },

  findLowestDomain(scores) {
    var lowest = 'moneyFlow';
    var lowestScore = 101;
    Object.keys(scores).forEach(function(d) {
      if (scores[d] < lowestScore) {
        lowestScore = scores[d];
        lowest = d;
      }
    });
    return lowest;
  }
};
