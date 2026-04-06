/**
 * Tool2Constants.js - Scoring configuration for Financial Clarity Tool
 *
 * Extracted from Tool2.js to centralize domain definitions, scoring
 * parameters, and archetype mappings. All values are pure data —
 * no logic or function references.
 */
const Tool2Constants = {

  /**
   * Domain → question field mapping
   * Each domain's score = sum of normalized scale values for its questions
   */
  DOMAIN_QUESTIONS: {
    moneyFlow: [
      'incomeClarity', 'incomeSufficiency', 'incomeConsistency', 'incomeStress',
      'spendingClarity', 'spendingConsistency', 'spendingReview', 'spendingStress'
    ],
    obligations: [
      'debtClarity', 'debtTrending', 'debtReview', 'debtStress',
      'emergencyFundMaintenance', 'emergencyFundMonths', 'emergencyFundFrequency',
      'emergencyFundReplenishment', 'emergencyFundStress'
    ],
    liquidity: [
      'savingsLevel', 'savingsRegularity', 'savingsClarity', 'savingsStress'
    ],
    growth: [
      'investmentActivity', 'investmentClarity', 'investmentConfidence', 'investmentStress',
      'retirementAccounts', 'retirementFunding', 'retirementConfidence', 'retirementStress'
    ],
    protection: [
      'insurancePolicies', 'insuranceClarity', 'insuranceConfidence', 'insuranceStress'
    ]
  },

  /**
   * Maximum possible points per domain
   * Each question normalizes to 0-10 scale, so max = questionCount * 10
   */
  MAX_SCORES: {
    moneyFlow: 80,
    obligations: 90,
    liquidity: 40,
    growth: 80,
    protection: 40
  },

  /**
   * Stress weights — higher weight = more impact on priority ranking
   * Lower weighted score = higher priority for improvement
   */
  STRESS_WEIGHTS: {
    moneyFlow: 5,
    obligations: 4,
    liquidity: 2,
    growth: 1,
    protection: 1
  },

  /**
   * Domain → growth archetype display label
   */
  ARCHETYPES: {
    moneyFlow: 'Money Flow Optimizer',
    obligations: 'Debt Freedom Builder',
    liquidity: 'Security Seeker',
    growth: 'Wealth Architect',
    protection: 'Protection Planner'
  },

  /**
   * Insight types required for final submission
   * Phase 4 consolidates to a single GPT call — only one key needed
   */
  REQUIRED_INSIGHTS: ['consolidated_insight'],

  /**
   * Subjective scale fields per domain — Full mode
   */
  FULL_MODE_FIELDS: {
    moneyFlow:   ['incomeClarity', 'spendingClarity', 'moneyFlowStress'],
    obligations: ['debtClarity', 'debtTrending', 'obligationsStress'],
    liquidity:   ['savingsClarity', 'savingsStress'],
    growth:      ['investmentClarity', 'retirementConfidence', 'retirementFunding', 'growthStress'],
    protection:  ['insuranceClarity', 'insuranceConfidence', 'protectionStress']
  },

  /**
   * Subjective scale fields per domain — Light mode
   */
  LIGHT_MODE_FIELDS: {
    moneyFlow:   ['incomeClarity'],
    obligations: ['debtClarity'],
    liquidity:   ['savingsClarity'],
    growth:      ['investmentClarity'],
    protection:  ['insuranceClarity']
  },

  /**
   * Human-readable benchmark standards for report display
   */
  BENCHMARK_STANDARDS: {
    moneyFlow:   'Financial planners recommend saving at least 20% of take-home income.',
    obligations: 'Financial planners recommend a debt-to-income ratio below 36% and an emergency fund of 3-6 months of expenses.',
    liquidity:   'Financial planners recommend 3+ months of expenses in liquid savings beyond your emergency fund.',
    growth:      'Financial planners recommend saving 15% of income for retirement.',
    protection:  'Adequate protection includes health, disability, and property coverage for all adults, plus life insurance for those with dependents.'
  },

  /**
   * Pattern thresholds from cohort data (n=70)
   * Same values as Tool1Constants.TOOL1_PATTERN_THRESHOLDS
   * Duplicated here because GAS does not support imports
   */
  PATTERN_THRESHOLDS: {
    FSV:       { low: -5,  high: 11 },
    ExVal:     { low: -7,  high: 12 },
    Showing:   { low: -4,  high: 16 },
    Receiving: { low: -10, high: 3  },
    Control:   { low: -5,  high: 12 },
    Fear:      { low: -10, high: 14 }
  }
};
