/**
 * GroundingScoring.js
 * Hierarchical scoring for grounding tools (Tools 3, 5, 7)
 *
 * Scoring Hierarchy:
 * Level 1: 24 Aspect Scores (raw -3 to +3 from form)
 * Level 2: 6 Subdomain Quotients (avg of 4 aspects, normalized 0-100)
 * Level 3: 2 Domain Quotients (avg of 3 subdomains, normalized 0-100)
 * Level 4: 1 Overall Quotient (avg of 2 domains, normalized 0-100)
 *
 * Gap Analysis:
 * - Compares highest subdomain to domain average
 * - Classifications: DIFFUSE (<5), FOCUSED (5-15), HIGHLY FOCUSED (>15)
 * - Identifies belief→behavior disconnection
 */

const GroundingScoring = {

  /**
   * Calculate complete scoring hierarchy from form responses
   *
   * @param {Object} responses - Form responses with raw scale scores
   * @param {Array} subdomains - Subdomain configuration (keys and structure)
   * @returns {Object} Complete scoring hierarchy with gap analysis
   */
  calculateScores(responses, subdomains) {
    if (!responses || !subdomains || subdomains.length !== 6) {
      throw new Error('GroundingScoring.calculateScores: Invalid responses or subdomain config');
    }

    // Level 1: Extract aspect scores (raw -3 to +3)
    const aspectScores = this.extractAspectScores(responses, subdomains);

    // Level 2: Calculate subdomain quotients (0-100)
    const subdomainQuotients = this.calculateSubdomainQuotients(aspectScores, subdomains);

    // Level 3: Calculate domain quotients (0-100)
    const domainQuotients = this.calculateDomainQuotients(subdomainQuotients, subdomains);

    // Level 4: Calculate overall quotient (0-100)
    const overallQuotient = this.calculateOverallQuotient(domainQuotients);

    // Gap Analysis: Domain-level
    const domainGaps = this.analyzeDomainGaps(subdomainQuotients, domainQuotients, subdomains);

    // Belief → Behavior Analysis
    const beliefBehaviorAnalysis = this.analyzeBeliefBehaviorGaps(aspectScores, subdomains);

    return {
      aspectScores,           // Level 1: 24 raw scores
      subdomainQuotients,     // Level 2: 6 subdomain quotients
      domainQuotients,        // Level 3: 2 domain quotients
      overallQuotient,        // Level 4: 1 overall quotient
      domainGaps,             // Gap analysis per domain
      beliefBehaviorAnalysis, // Belief→Behavior disconnection
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Extract aspect scores from form responses
   * Returns raw scale values (-3 to +3) for each aspect
   */
  extractAspectScores(responses, subdomains) {
    const aspects = ['belief', 'behavior', 'feeling', 'consequence'];
    const scores = {};

    subdomains.forEach(subdomain => {
      const key = subdomain.key;
      scores[key] = {};

      aspects.forEach(aspect => {
        const fieldName = `${key}_${aspect}`;
        const rawScore = parseInt(responses[fieldName]);

        if (isNaN(rawScore) || rawScore === 0 || rawScore < -3 || rawScore > 3) {
          throw new Error(`Invalid score for ${fieldName}: ${responses[fieldName]}`);
        }

        scores[key][aspect] = rawScore;
      });
    });

    return scores;
  },

  /**
   * Calculate subdomain quotients (Level 2)
   * Average of 4 aspects, normalized to 0-100
   */
  calculateSubdomainQuotients(aspectScores, subdomains) {
    const quotients = {};

    subdomains.forEach(subdomain => {
      const key = subdomain.key;
      const aspects = aspectScores[key];

      // Average the 4 aspect scores
      const rawAvg = (
        aspects.belief +
        aspects.behavior +
        aspects.feeling +
        aspects.consequence
      ) / 4;

      // Normalize to 0-100 (lower is better)
      // -3 → 100 (worst), +3 → 0 (best)
      quotients[key] = this.normalizeScore(rawAvg);
    });

    return quotients;
  },

  /**
   * Calculate domain quotients (Level 3)
   * Average of 3 subdomain quotients per domain
   */
  calculateDomainQuotients(subdomainQuotients, subdomains) {
    // Group subdomains by domain
    const domain1Keys = subdomains.slice(0, 3).map(s => s.key);
    const domain2Keys = subdomains.slice(3, 6).map(s => s.key);

    // Calculate domain averages
    const domain1Avg = this.average(domain1Keys.map(k => subdomainQuotients[k]));
    const domain2Avg = this.average(domain2Keys.map(k => subdomainQuotients[k]));

    return {
      domain1: Math.round(domain1Avg),
      domain2: Math.round(domain2Avg)
    };
  },

  /**
   * Calculate overall quotient (Level 4)
   * Average of 2 domain quotients
   */
  calculateOverallQuotient(domainQuotients) {
    return Math.round(this.average([
      domainQuotients.domain1,
      domainQuotients.domain2
    ]));
  },

  /**
   * Analyze gaps within each domain
   * Identifies which subdomain is most problematic and by how much
   */
  analyzeDomainGaps(subdomainQuotients, domainQuotients, subdomains) {
    const domain1Keys = subdomains.slice(0, 3).map(s => s.key);
    const domain2Keys = subdomains.slice(3, 6).map(s => s.key);

    return {
      domain1: this.analyzeGapForDomain(domain1Keys, subdomainQuotients, domainQuotients.domain1),
      domain2: this.analyzeGapForDomain(domain2Keys, subdomainQuotients, domainQuotients.domain2)
    };
  },

  /**
   * Analyze gap for a single domain
   */
  analyzeGapForDomain(subdomainKeys, subdomainQuotients, domainAverage) {
    // Find highest subdomain (most problematic)
    let highestKey = null;
    let highestScore = -1;

    subdomainKeys.forEach(key => {
      const score = subdomainQuotients[key];
      if (score > highestScore) {
        highestScore = score;
        highestKey = key;
      }
    });

    // Calculate gap
    const gap = highestScore - domainAverage;

    // Classify gap
    let classification;
    if (gap < 5) {
      classification = 'DIFFUSE';
    } else if (gap >= 5 && gap <= 15) {
      classification = 'FOCUSED';
    } else {
      classification = 'HIGHLY_FOCUSED';
    }

    return {
      highestSubdomain: highestKey,
      highestScore: Math.round(highestScore),
      domainAverage: Math.round(domainAverage),
      gap: Math.round(gap),
      classification,
      recommendation: this.getGapRecommendation(classification)
    };
  },

  /**
   * Get recommendation based on gap classification
   */
  getGapRecommendation(classification) {
    const recommendations = {
      DIFFUSE: 'Address the domain as a whole - all subdomains show similar patterns',
      FOCUSED: 'Focus primarily on the highest subdomain, with attention to the domain overall',
      HIGHLY_FOCUSED: 'Concentrate specifically on the highest subdomain - this is where the most significant work is needed'
    };
    return recommendations[classification];
  },

  /**
   * Analyze belief → behavior disconnection
   * Identifies subdomains where belief and behavior scores diverge significantly
   */
  analyzeBeliefBehaviorGaps(aspectScores, subdomains) {
    const analysis = {};

    subdomains.forEach(subdomain => {
      const key = subdomain.key;
      const belief = aspectScores[key].belief;
      const behavior = aspectScores[key].behavior;

      const gap = Math.abs(belief - behavior);

      let pattern = 'ALIGNED';
      let description = 'Belief and behavior are aligned';

      if (gap >= 2) {
        if (belief < behavior) {
          // Belief is more negative (problematic) than behavior
          pattern = 'BELIEF_DRIVES_DYSFUNCTION';
          description = 'Problematic belief is not yet fully reflected in behavior - early warning sign';
        } else {
          // Behavior is more negative (problematic) than belief
          pattern = 'BEHAVIOR_EXCEEDS_BELIEF';
          description = 'Behavior is more problematic than stated belief - possible blind spot';
        }
      } else if (gap === 1) {
        pattern = 'SLIGHT_MISALIGNMENT';
        description = 'Minor disconnection between belief and behavior';
      }

      analysis[key] = {
        beliefScore: belief,
        behaviorScore: behavior,
        gap,
        pattern,
        description
      };
    });

    return analysis;
  },

  /**
   * Normalize raw score (-3 to +3) to problem score (0-100)
   * Formula: ((3 - rawScore) / 6) * 100
   *
   * -3 → 100 (worst/most problematic)
   * -2 → 83.33
   * -1 → 66.67
   * +1 → 33.33
   * +2 → 16.67
   * +3 → 0 (best/healthiest)
   */
  normalizeScore(rawScore) {
    return ((3 - rawScore) / 6) * 100;
  },

  /**
   * Calculate average of an array of numbers
   */
  average(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
  },

  /**
   * Get scoring interpretation for a quotient (0-100)
   */
  interpretQuotient(quotient) {
    if (quotient >= 80) {
      return {
        level: 'CRITICAL',
        label: 'Critical Pattern',
        description: 'This area shows a highly problematic pattern requiring immediate attention',
        color: '#dc3545'
      };
    } else if (quotient >= 60) {
      return {
        level: 'HIGH',
        label: 'Significant Pattern',
        description: 'This area shows a significant pattern that would benefit from focused work',
        color: '#ffc107'
      };
    } else if (quotient >= 40) {
      return {
        level: 'MODERATE',
        label: 'Moderate Pattern',
        description: 'This area shows a moderate pattern with room for growth',
        color: '#17a2b8'
      };
    } else if (quotient >= 20) {
      return {
        level: 'LOW',
        label: 'Mild Pattern',
        description: 'This area shows a mild pattern with good foundations',
        color: '#28a745'
      };
    } else {
      return {
        level: 'MINIMAL',
        label: 'Healthy Pattern',
        description: 'This area shows a healthy pattern with strong awareness',
        color: '#20c997'
      };
    }
  },

  /**
   * Generate scoring summary for display
   */
  generateScoringSummary(scoringResult, toolConfig) {
    const {
      subdomainQuotients,
      domainQuotients,
      overallQuotient,
      domainGaps
    } = scoringResult;

    return {
      overall: {
        score: overallQuotient,
        interpretation: this.interpretQuotient(overallQuotient)
      },
      domains: [
        {
          name: toolConfig.domain1Name,
          score: domainQuotients.domain1,
          interpretation: this.interpretQuotient(domainQuotients.domain1),
          gap: domainGaps.domain1
        },
        {
          name: toolConfig.domain2Name,
          score: domainQuotients.domain2,
          interpretation: this.interpretQuotient(domainQuotients.domain2),
          gap: domainGaps.domain2
        }
      ],
      subdomains: toolConfig.subdomains.map(subdomain => ({
        key: subdomain.key,
        label: subdomain.label,
        score: subdomainQuotients[subdomain.key],
        interpretation: this.interpretQuotient(subdomainQuotients[subdomain.key])
      }))
    };
  }
};
