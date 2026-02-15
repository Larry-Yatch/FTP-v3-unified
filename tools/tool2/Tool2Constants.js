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
   * Missing insights trigger fallback GPT analysis
   */
  REQUIRED_INSIGHTS: [
    'income_sources',
    'major_expenses',
    'wasteful_spending',
    'debt_list',
    'investments',
    'emotions',
    'adaptive_trauma'
  ]
};
