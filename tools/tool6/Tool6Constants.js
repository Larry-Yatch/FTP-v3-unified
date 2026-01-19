/**
 * Tool6Constants.js
 * Central configuration for Tool 6: Retirement Blueprint Calculator
 *
 * Contains all IRS limits, profile definitions, vehicle configurations,
 * and projection parameters. This is pure data - no logic.
 *
 * Source: Tool6-Consolidated-Specification.md v1.2
 */

// ============================================================================
// IRS LIMITS 2025
// ============================================================================

const IRS_LIMITS_2025 = {
  // 401(k) Limits
  EMPLOYEE_401K: 23500,
  CATCHUP_401K_50: 7500,           // Standard catch-up for ages 50-59 and 64+
  CATCHUP_401K_60: 11250,          // SECURE 2.0 super catch-up for ages 60-63
  TOTAL_401K: 70000,               // Employee + employer combined
  TOTAL_401K_50: 77500,            // With standard catch-up
  TOTAL_401K_60: 81250,            // With super catch-up

  // IRA Limits
  TRADITIONAL_IRA: 7000,
  ROTH_IRA: 7000,
  CATCHUP_IRA: 1000,               // Available at 50+

  // HSA Limits (catch-up at 55+, not 50+)
  HSA_INDIVIDUAL: 4300,
  HSA_FAMILY: 8550,
  HSA_CATCHUP: 1000,               // Available at 55+

  // Other Limits
  DEFINED_BENEFIT: 280000,         // Annual benefit limit
  SEP_IRA_MAX: 70000,
  SEP_IRA_PCT: 0.25,               // 25% of compensation
  COVERDELL_ESA: 2000,

  // Roth IRA Income Phase-Out Limits
  ROTH_PHASE_OUT: {
    SINGLE: { start: 150000, end: 165000 },
    MFJ: { start: 236000, end: 246000 },
    MFS: { start: 0, end: 10000 }
  }
};

// Monthly equivalents for allocation calculations
const MONTHLY_LIMITS_2025 = {
  '401(k) Traditional': IRS_LIMITS_2025.EMPLOYEE_401K / 12,
  '401(k) Roth': IRS_LIMITS_2025.EMPLOYEE_401K / 12,
  'IRA Traditional': IRS_LIMITS_2025.TRADITIONAL_IRA / 12,
  'IRA Roth': IRS_LIMITS_2025.ROTH_IRA / 12,
  'HSA Individual': IRS_LIMITS_2025.HSA_INDIVIDUAL / 12,
  'HSA Family': IRS_LIMITS_2025.HSA_FAMILY / 12,
  'Coverdell ESA': IRS_LIMITS_2025.COVERDELL_ESA / 12
};

// ============================================================================
// PROFILE DEFINITIONS
// ============================================================================

const PROFILE_DEFINITIONS = {
  1: {
    id: 1,
    name: 'ROBS-In-Use Strategist',
    description: 'Using Rollover for Business Startups structure',
    characteristics: [
      'Has active ROBS structure',
      'Business funded by retirement accounts',
      'Solo 401(k) through C-corp'
    ],
    primaryVehicles: ['ROBS Distribution', '401(k) Traditional', 'HSA'],
    icon: '🏢'
  },
  2: {
    id: 2,
    name: 'ROBS-Curious Candidate',
    description: 'Interested in ROBS and qualifies for setup',
    characteristics: [
      'Has $50k+ in rollover-eligible retirement accounts',
      'New or restructurable business',
      'Can fund $5-10k setup costs'
    ],
    primaryVehicles: ['IRA Rollover to ROBS', '401(k) Employer Match', 'HSA'],
    icon: '🔍'
  },
  3: {
    id: 3,
    name: 'Business Owner with Employees',
    description: 'Self-employed with W-2 employees (excluding spouse)',
    characteristics: [
      'Has W-2 employees',
      'May have SEP-IRA, SIMPLE, or 401(k)',
      'Employer contribution obligations'
    ],
    primaryVehicles: ['SEP-IRA', 'SIMPLE IRA', '401(k) Traditional', 'HSA'],
    icon: '👥'
  },
  4: {
    id: 4,
    name: 'Solo 401(k) Optimizer',
    description: 'Self-employed with no employees',
    characteristics: [
      'Self-employed or contractor',
      'No W-2 employees (spouse OK)',
      'High contribution limits available'
    ],
    primaryVehicles: ['Solo 401(k) Employee (Roth)', 'Solo 401(k) Employee (Traditional)', 'Solo 401(k) Employer', 'HSA', 'IRA Roth'],
    icon: '💼'
  },
  5: {
    id: 5,
    name: 'Bracket Strategist',
    description: 'Focused on current tax reduction (Traditional priority)',
    characteristics: [
      'Higher current tax bracket',
      'Expects lower bracket in retirement',
      'Prioritizes pre-tax contributions'
    ],
    primaryVehicles: ['401(k) Traditional', 'IRA Traditional', 'HSA'],
    icon: '📊'
  },
  6: {
    id: 6,
    name: 'Catch-Up Contributor',
    description: 'Age 50+ and feeling behind on retirement savings',
    characteristics: [
      'Age 50 or older',
      'Wants to maximize catch-up contributions',
      'Accelerating retirement savings'
    ],
    primaryVehicles: ['401(k) Traditional', '401(k) Roth', 'IRA Traditional', 'HSA'],
    icon: '⏰'
  },
  7: {
    id: 7,
    name: 'Foundation Builder',
    description: 'Standard investor building retirement foundation with employer plan',
    characteristics: [
      'W-2 employee with employer 401(k)',
      'Standard income (not high earner)',
      'Building long-term wealth'
    ],
    primaryVehicles: ['401(k) Employer Match', '401(k) Roth', 'IRA Roth', 'HSA'],
    icon: '🏗️'
  },
  8: {
    id: 8,
    name: 'Roth Maximizer',
    description: 'Focused on tax-free retirement (Roth priority)',
    characteristics: [
      'Lower current tax bracket',
      'Expects higher bracket in retirement',
      'Prioritizes Roth contributions'
    ],
    primaryVehicles: ['401(k) Roth', 'IRA Roth', 'HSA'],
    icon: '🌟'
  },
  9: {
    id: 9,
    name: 'Late-Stage Growth',
    description: 'Within 5-10 years of retirement',
    characteristics: [
      'Near retirement',
      'Focus on catch-up and preservation',
      'Roth conversion ladder consideration'
    ],
    primaryVehicles: ['401(k) Traditional', '401(k) Roth', 'HSA', 'IRA Traditional'],
    icon: '🎯'
  }
};

// ============================================================================
// VEHICLE DEFINITIONS
// ============================================================================

const VEHICLE_DEFINITIONS = {
  '401(k) Employer Match': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax (free money)',
    hasLimit: false,
    isNonDiscretionary: true,
    description: 'Employer matching contribution - always take this first'
  },
  '401(k) Traditional': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax',
    annualLimit: IRS_LIMITS_2025.EMPLOYEE_401K,
    catchUpAge: 50,
    catchUpAmount: IRS_LIMITS_2025.CATCHUP_401K_50,
    superCatchUpAge: 60,
    superCatchUpAmount: IRS_LIMITS_2025.CATCHUP_401K_60,
    description: 'Traditional 401(k) - tax-deferred growth'
  },
  '401(k) Roth': {
    domain: 'Retirement',
    taxTreatment: 'After-tax, tax-free growth',
    annualLimit: IRS_LIMITS_2025.EMPLOYEE_401K,
    catchUpAge: 50,
    catchUpAmount: IRS_LIMITS_2025.CATCHUP_401K_50,
    superCatchUpAge: 60,
    superCatchUpAmount: IRS_LIMITS_2025.CATCHUP_401K_60,
    sharesLimitWith: '401(k) Traditional',
    description: 'Roth 401(k) - tax-free withdrawals in retirement'
  },
  'IRA Traditional': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax (if eligible)',
    annualLimit: IRS_LIMITS_2025.TRADITIONAL_IRA,
    catchUpAge: 50,
    catchUpAmount: IRS_LIMITS_2025.CATCHUP_IRA,
    description: 'Traditional IRA - tax-deferred growth'
  },
  'IRA Roth': {
    domain: 'Retirement',
    taxTreatment: 'After-tax, tax-free growth',
    annualLimit: IRS_LIMITS_2025.ROTH_IRA,
    catchUpAge: 50,
    catchUpAmount: IRS_LIMITS_2025.CATCHUP_IRA,
    incomePhaseOut: IRS_LIMITS_2025.ROTH_PHASE_OUT,
    sharesLimitWith: 'IRA Traditional',
    description: 'Roth IRA - tax-free withdrawals in retirement'
  },
  'Backdoor Roth IRA': {
    domain: 'Retirement',
    taxTreatment: 'After-tax, tax-free growth',
    annualLimit: IRS_LIMITS_2025.ROTH_IRA,
    catchUpAge: 50,
    catchUpAmount: IRS_LIMITS_2025.CATCHUP_IRA,
    requiresHighIncome: true,
    description: 'Backdoor Roth - for high earners above phase-out'
  },
  'HSA': {
    domain: 'Health',
    taxTreatment: 'Triple tax-free',
    annualLimitIndividual: IRS_LIMITS_2025.HSA_INDIVIDUAL,
    annualLimitFamily: IRS_LIMITS_2025.HSA_FAMILY,
    catchUpAge: 55,  // Note: HSA catch-up is at 55, not 50
    catchUpAmount: IRS_LIMITS_2025.HSA_CATCHUP,
    requiresHDHP: true,
    description: 'HSA - triple tax advantage (deductible, grows tax-free, tax-free for medical)'
  },
  'Solo 401(k) Employee': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax or Roth',
    annualLimit: IRS_LIMITS_2025.EMPLOYEE_401K,
    catchUpAge: 50,
    catchUpAmount: IRS_LIMITS_2025.CATCHUP_401K_50,
    superCatchUpAge: 60,
    superCatchUpAmount: IRS_LIMITS_2025.CATCHUP_401K_60,
    requiresSelfEmployed: true,
    description: 'Solo 401(k) employee contribution'
  },
  'Solo 401(k) Employer': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax',
    annualLimit: IRS_LIMITS_2025.TOTAL_401K - IRS_LIMITS_2025.EMPLOYEE_401K,
    percentOfCompensation: 0.25,
    requiresSelfEmployed: true,
    description: 'Solo 401(k) employer contribution (up to 25% of compensation)'
  },
  'SEP-IRA': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax',
    annualLimit: IRS_LIMITS_2025.SEP_IRA_MAX,
    percentOfCompensation: IRS_LIMITS_2025.SEP_IRA_PCT,
    requiresSelfEmployed: true,
    description: 'SEP-IRA - simplified retirement for self-employed'
  },
  'SIMPLE IRA': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax',
    annualLimit: 16000,  // 2025 limit
    catchUpAge: 50,
    catchUpAmount: 3500,
    description: 'SIMPLE IRA - for small businesses with employees'
  },
  '529 Plan': {
    domain: 'Education',
    taxTreatment: 'Tax-free for education',
    hasLimit: false,  // State-dependent
    description: '529 Plan - tax-free growth for qualified education expenses'
  },
  'Coverdell ESA': {
    domain: 'Education',
    taxTreatment: 'Tax-free for education',
    annualLimit: IRS_LIMITS_2025.COVERDELL_ESA,
    description: 'Coverdell ESA - flexible education savings'
  },
  'ROBS Distribution': {
    domain: 'Retirement',
    taxTreatment: 'Tax-deferred',
    hasLimit: false,
    isNonDiscretionary: true,
    requiresROBS: true,
    description: 'ROBS profit distribution - mandatory business structure payment'
  },
  'Defined Benefit Plan': {
    domain: 'Retirement',
    taxTreatment: 'Pre-tax',
    annualLimit: IRS_LIMITS_2025.DEFINED_BENEFIT,
    isNonDiscretionary: true,
    description: 'Defined Benefit Plan - actuarially determined contributions'
  },
  'Family Bank': {
    domain: 'Overflow',
    taxTreatment: 'Tax-advantaged loans',
    hasLimit: false,
    growthRate: 0.05,  // Conservative 5% growth rate
    description: 'Family Bank - whole life policies with cash value for tax-free borrowing'
  },
  'Mega Backdoor Roth': {
    domain: 'Retirement',
    taxTreatment: 'After-tax → Roth conversion',
    annualLimit: IRS_LIMITS_2025.TOTAL_401K - IRS_LIMITS_2025.EMPLOYEE_401K, // ~$46,500
    requiresMegaBackdoor: true,
    note: 'Requires plan to allow after-tax contributions and in-service conversions',
    description: 'After-tax 401(k) contributions converted to Roth - up to $46,500 additional'
  },
  'IRA Rollover to ROBS': {
    domain: 'Retirement',
    taxTreatment: 'Tax-deferred',
    hasLimit: false,
    isOneTime: true,
    requiresROBS: true,
    description: 'Rollover existing IRA to fund ROBS C-corp structure'
  },
  'IRA Rollover to 401k': {
    domain: 'Retirement',
    taxTreatment: 'Tax-deferred',
    hasLimit: false,
    isActionItem: true,
    description: 'Roll Traditional IRA to 401(k) to enable tax-free backdoor Roth conversions'
  }
};

// ============================================================================
// VEHICLE PRIORITY ORDER BY PROFILE
// ============================================================================

const VEHICLE_PRIORITY_BY_PROFILE = {
  1: [  // ROBS-In-Use Strategist
    '401(k) Employer Match',
    'HSA',
    'ROBS Distribution',
    '401(k) Traditional',
    '401(k) Roth',
    'IRA Roth',
    'Family Bank'
  ],
  2: [  // ROBS-Curious Candidate
    'IRA Rollover to ROBS',
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    'IRA Roth',
    'Family Bank'
  ],
  3: [  // Business Owner with Employees
    '401(k) Employer Match',
    'HSA',
    'SEP-IRA',
    'SIMPLE IRA',
    '401(k) Traditional',
    'IRA Traditional',
    'Family Bank'
  ],
  4: [  // Solo 401(k) Optimizer
    'HSA',
    'Solo 401(k) Employee (Roth)',       // These get filtered by eligibility
    'Solo 401(k) Employee (Traditional)', // based on user's tax preference
    'Solo 401(k) Employer',
    'IRA Roth',
    'IRA Traditional',
    'Family Bank'
  ],
  5: [  // Bracket Strategist (Traditional Focus)
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    'IRA Traditional',
    '401(k) Roth',
    'IRA Roth',
    'Family Bank'
  ],
  6: [  // Catch-Up Contributor
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    'IRA Traditional',
    '401(k) Roth',
    'Family Bank'
  ],
  7: [  // Foundation Builder (Standard W-2 Employee)
    '401(k) Employer Match',
    'HSA',
    '401(k) Roth',
    '401(k) Traditional',
    'IRA Roth',
    'IRA Traditional',
    'Family Bank'
  ],
  8: [  // Roth Maximizer
    '401(k) Employer Match',
    'HSA',
    '401(k) Roth',
    'IRA Roth',
    '401(k) Traditional',
    'IRA Traditional',
    'Family Bank'
  ],
  9: [  // Late-Stage Growth
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    '401(k) Roth',
    'IRA Traditional',
    'Family Bank'
  ]
};

// ============================================================================
// DOMAIN CONFIGURATION
// ============================================================================

const DOMAIN_DEFINITIONS = {
  Retirement: {
    name: 'Retirement',
    description: 'Tax-advantaged retirement savings',
    defaultWeight: 0.60,
    vehicles: [
      '401(k) Employer Match', '401(k) Traditional', '401(k) Roth',
      'IRA Traditional', 'IRA Roth', 'Backdoor Roth IRA',
      'Solo 401(k) Employee (Roth)', 'Solo 401(k) Employee (Traditional)', 'Solo 401(k) Employer',
      'SEP-IRA', 'SIMPLE IRA', 'ROBS Distribution', 'Defined Benefit Plan',
      'Mega Backdoor Roth', 'IRA Rollover to ROBS', 'IRA Rollover to 401k',
      'HSA'  // HSA is triple-tax-advantaged and can serve as retirement vehicle
    ]
  },
  Education: {
    name: 'Education',
    description: 'Education savings for children',
    defaultWeight: 0.20,
    vehicles: ['529 Plan', 'Coverdell ESA']
  },
  Health: {
    name: 'Health',
    description: 'Health savings with retirement benefits',
    defaultWeight: 0.20,
    vehicles: ['HSA']
  },
  Overflow: {
    name: 'Overflow',
    description: 'Taxable investments after tax-advantaged limits',
    defaultWeight: 0,
    vehicles: ['Family Bank']
  }
};

// ============================================================================
// PROJECTION CONFIGURATION
// ============================================================================

const PROJECTION_CONFIG = {
  // Investment score to return rate mapping
  BASE_RATE: 0.08,              // Score 1 = 8% annual return
  MAX_ADDITIONAL_RATE: 0.12,    // Score 7 = 8% + 12% = 20% annual return

  // Calculation method
  USE_MONTHLY_COMPOUNDING: true,

  // Safeguards against unrealistic projections
  MAX_YEARS: 70,                // Maximum timeline
  MAX_RATE: 0.25,               // Maximum 25% annual return
  MAX_FV: 100000000,            // Cap at $100 million

  // Minimum savings rate for "ideal" scenario
  OPTIMIZED_SAVINGS_RATE: 0.20, // 20% minimum for recommendations

  // Family Bank uses conservative growth
  FAMILY_BANK_RATE: 0.05,       // 5% for overflow/taxable

  // Default inflation rate
  DEFAULT_INFLATION: 0.025      // 2.5%
};

// Investment score to return rate mapping table
const INVESTMENT_SCORE_RETURNS = {
  1: 0.08,   // Very Conservative - 8%
  2: 0.10,   // Conservative - 10%
  3: 0.12,   // Moderately Conservative - 12%
  4: 0.14,   // Moderate - 14%
  5: 0.16,   // Moderately Aggressive - 16%
  6: 0.18,   // Aggressive - 18%
  7: 0.20    // Very Aggressive - 20%
};

const INVESTMENT_SCORE_LABELS = {
  1: 'Very Conservative',
  2: 'Conservative',
  3: 'Moderately Conservative',
  4: 'Moderate',
  5: 'Moderately Aggressive',
  6: 'Aggressive',
  7: 'Very Aggressive'
};

// ============================================================================
// TAX STRATEGY CONFIGURATION
// ============================================================================

const TAX_STRATEGY_OPTIONS = {
  NOW: {
    id: 'Now',
    name: 'Traditional-Heavy',
    description: 'Current bracket high, expect lower in retirement',
    effect: 'Prioritize Traditional 401(k), Traditional IRA'
  },
  BALANCED: {
    id: 'Balanced',
    name: 'Balanced',
    description: 'Uncertain or similar brackets',
    effect: '50/50 split between Traditional and Roth'
  },
  LATER: {
    id: 'Later',
    name: 'Roth-Heavy',
    description: 'Current bracket low, expect higher in retirement',
    effect: 'Prioritize Roth 401(k), Roth IRA'
  }
};

// Income thresholds for auto-recommending tax strategy
const TAX_STRATEGY_THRESHOLDS = {
  SINGLE: { rothHeavy: 75000, traditionalHeavy: 150000 },
  MFJ: { rothHeavy: 100000, traditionalHeavy: 200000 }
};

// ============================================================================
// EMPLOYER MATCH FORMULAS
// ============================================================================

const EMPLOYER_MATCH_FORMULAS = [
  { label: '100% up to 3%', matchRate: 1.00, matchLimit: 0.03 },
  { label: '100% up to 4%', matchRate: 1.00, matchLimit: 0.04 },
  { label: '100% up to 5%', matchRate: 1.00, matchLimit: 0.05 },
  { label: '100% up to 6%', matchRate: 1.00, matchLimit: 0.06 },
  { label: '50% up to 6%', matchRate: 0.50, matchLimit: 0.06 },
  { label: '50% up to 4%', matchRate: 0.50, matchLimit: 0.04 },
  { label: '25% up to 6%', matchRate: 0.25, matchLimit: 0.06 },
  { label: 'Other (custom)', matchRate: null, matchLimit: null }
];

// ============================================================================
// AMBITION QUOTIENT CONFIGURATION
// ============================================================================

const AMBITION_QUOTIENT_CONFIG = {
  // Discount rate for time-based urgency calculation
  MONTHLY_DISCOUNT_RATE: 0.005,  // ~6% annual

  // Ranking scores (1 = top priority)
  RANK_SCORES: {
    1: 1.0,
    2: 0.5,
    3: 0.25
  },

  // Default domain weights if no ranking provided
  DEFAULT_WEIGHTS: {
    Retirement: 0.50,
    Education: 0.25,
    Health: 0.25
  }
};

// ============================================================================
// QUESTIONNAIRE CONFIGURATION - TWO-PHASE APPROACH
// ============================================================================

/**
 * TWO-PHASE QUESTIONNAIRE DESIGN
 * ==============================
 *
 * Phase A: CLASSIFICATION (Short-Circuit Decision Tree)
 * - Ask questions in decision tree order
 * - STOP as soon as profile is determined (2-4 questions max)
 * - Uses derived values from Tools 1-5 when available
 *
 * Phase B: ALLOCATION INPUTS (Profile-Specific)
 * - Only ask questions relevant to the assigned profile
 * - Skip questions that don't apply to user's situation
 *
 * QUESTION REDUCTION:
 * | Scenario        | Old Approach | New Approach |
 * |-----------------|--------------|--------------|
 * | ROBS In Use     | 31 questions | ~9 questions |
 * | Solo 401k       | 31 questions | ~12 questions|
 * | Standard W-2    | 31 questions | ~16 questions|
 *
 * LEGACY ALIGNMENT: Classification logic matches code.js lines 3127-3152
 */

// ============================================================================
// PHASE A: CLASSIFICATION QUESTIONS
// ============================================================================
// Asked in decision tree order. Stop as soon as profile is determined.
// Most users will answer 2-4 questions max.

const CLASSIFICATION_QUESTIONS = {
  // Step 1: ROBS Check (Profile 1 or continue)
  c1_robsStatus: {
    id: 'c1_robsStatus',
    label: 'Are you using or interested in ROBS (Rollover for Business Startups)?',
    type: 'select',
    required: true,
    options: [
      { value: '', label: '-- Select --' },
      { value: 'using', label: 'Yes, I am currently using ROBS' },
      { value: 'interested', label: 'Interested - I would like to learn more' },
      { value: 'no', label: 'No, not applicable to me' }
    ],
    helpText: 'ROBS allows using retirement funds to start or buy a business tax-free',
    terminatesAt: {
      'using': 1  // Profile 1: ROBS-In-Use Strategist
    },
    nextQuestion: {
      'using': null,      // Stop - Profile 1
      'interested': 'c2_robsQualifier1',  // Continue to qualifiers
      'no': 'c5_workSituation'  // Skip to work situation
    }
  },

  // Steps 2-4: ROBS Qualifiers (only if "interested")
  c2_robsQualifier1: {
    id: 'c2_robsQualifier1',
    label: 'Is this a new business (or one you could restructure under a new C-corp)?',
    type: 'yesno',
    required: true,
    showIf: (answers) => answers.c1_robsStatus === 'interested',
    nextQuestion: {
      'Yes': 'c3_robsQualifier2',
      'No': 'c5_workSituation'  // Doesn't qualify, continue tree
    }
  },
  c3_robsQualifier2: {
    id: 'c3_robsQualifier2',
    label: 'Do you have at least $50,000 in a rollover-eligible retirement account?',
    type: 'yesno',
    required: true,
    showIf: (answers) => answers.c1_robsStatus === 'interested' && answers.c2_robsQualifier1 === 'Yes',
    nextQuestion: {
      'Yes': 'c4_robsQualifier3',
      'No': 'c5_workSituation'  // Doesn't qualify, continue tree
    }
  },
  c4_robsQualifier3: {
    id: 'c4_robsQualifier3',
    label: 'Can you fund the estimated $5,000-$10,000 ROBS setup cost?',
    type: 'yesno',
    required: true,
    showIf: (answers) => answers.c1_robsStatus === 'interested' &&
                         answers.c2_robsQualifier1 === 'Yes' &&
                         answers.c3_robsQualifier2 === 'Yes',
    terminatesAt: {
      'Yes': 2  // Profile 2: ROBS-Curious Candidate (all 3 qualifiers passed)
    },
    nextQuestion: {
      'Yes': null,  // Stop - Profile 2
      'No': 'c5_workSituation'  // Doesn't qualify, continue tree
    }
  },

  // Step 5: Work/Business Situation (Profiles 3, 4, or continue)
  c5_workSituation: {
    id: 'c5_workSituation',
    label: 'What best describes your work situation?',
    type: 'select',
    required: true,
    options: [
      { value: '', label: '-- Select --' },
      { value: 'W-2', label: 'W-2 Employee only' },
      { value: 'Self-employed', label: 'Self-employed / 1099 (no W-2 employees)' },
      { value: 'Both', label: 'Both W-2 job + self-employment income' },
      { value: 'BizWithEmployees', label: 'Business owner with W-2 employees' }
    ],
    helpText: 'This determines which retirement account types are available',
    terminatesAt: {
      'Self-employed': 4,      // Profile 4: Solo 401(k) Optimizer
      'Both': 4,               // Profile 4: Solo 401(k) Optimizer
      'BizWithEmployees': 3    // Profile 3: Business Owner with Employees
    },
    nextQuestion: {
      'W-2': 'c6_hasTradIRA',
      'Self-employed': null,   // Stop - Profile 4
      'Both': null,            // Stop - Profile 4
      'BizWithEmployees': null // Stop - Profile 3
    }
  },

  // Step 6: Traditional IRA Check (Profile 5 or continue)
  c6_hasTradIRA: {
    id: 'c6_hasTradIRA',
    label: 'Do you have a Traditional IRA?',
    type: 'yesno',
    required: true,
    showIf: (answers) => answers.c5_workSituation === 'W-2',
    helpText: 'This affects backdoor Roth and conversion strategies',
    terminatesAt: {
      'Yes': 5  // Profile 5: Bracket Strategist (has Trad IRA)
    },
    nextQuestion: {
      'Yes': null,  // Stop - Profile 5
      'No': 'c7_derivedChecks'  // Continue to derived checks
    }
  },

  // Step 7: Tax Focus (Profiles 7 or 8)
  // Note: Profiles 6 and 9 are determined by DERIVED values (age, nearRetirement)
  // which are checked in classifyProfile() before asking this question
  c7_taxFocus: {
    id: 'c7_taxFocus',
    label: 'When would you prefer to minimize taxes?',
    type: 'select',
    required: true,
    showIf: (answers) => answers.c5_workSituation === 'W-2' && answers.c6_hasTradIRA === 'No',
    options: [
      { value: '', label: '-- Select --' },
      { value: 'Now', label: 'Now - Reduce my current tax bill' },
      { value: 'Later', label: 'Later - Pay taxes now for tax-free retirement' },
      { value: 'Both', label: 'Both - Balance current and future savings' }
    ],
    helpText: 'Affects whether we prioritize Traditional or Roth accounts',
    terminatesAt: {
      'Now': 8,   // Profile 8: Roth Maximizer (tax focus now = traditional priority)
      'Both': 8,  // Profile 8: Roth Maximizer
      'Later': 7  // Profile 7: Foundation Builder (default)
    }
  }
};

// Order to ask classification questions (decision tree order)
const CLASSIFICATION_ORDER = [
  'c1_robsStatus',
  'c2_robsQualifier1',
  'c3_robsQualifier2',
  'c4_robsQualifier3',
  'c5_workSituation',
  'c6_hasTradIRA',
  'c7_taxFocus'
];

// ============================================================================
// PHASE B: ALLOCATION INPUT QUESTIONS
// ============================================================================
// Asked AFTER profile is determined. Only relevant questions shown.

const ALLOCATION_QUESTIONS = {
  // --- Income & Timeline (Always asked - not available from Tools 1-5) ---
  a1_grossIncome: {
    id: 'a1_grossIncome',
    label: 'What is your gross annual income (before taxes)?',
    type: 'currency',
    required: true,
    placeholder: 'e.g., 85000',
    helpText: 'Your total annual income before any deductions',
    category: 'income'
  },
  a2_yearsToRetirement: {
    id: 'a2_yearsToRetirement',
    label: 'How many years until you plan to retire?',
    type: 'number',
    required: true,
    min: 1,
    max: 50,
    placeholder: 'e.g., 20',
    helpText: 'Approximate years until your planned retirement',
    category: 'income'
  },

  // --- Tax Strategy (All profiles - affects Traditional vs Roth allocation) ---
  a2b_taxPreference: {
    id: 'a2b_taxPreference',
    label: 'When would you prefer to pay taxes on your retirement savings?',
    type: 'select',
    required: true,
    options: [
      { value: '', label: '-- Select --' },
      { value: 'Now', label: 'Now - Pay taxes now for tax-free retirement (Roth focus)' },
      { value: 'Later', label: 'Later - Reduce my current tax bill (Traditional focus)' },
      { value: 'Both', label: 'Both - Balance between current and future tax savings' }
    ],
    helpText: 'Affects whether we prioritize Traditional (tax-deferred) or Roth (tax-free) accounts',
    category: 'income'
  },

  // --- Employer Plans (W-2 employees only, not ROBS/Solo profiles) ---
  a3_has401k: {
    id: 'a3_has401k',
    label: 'Do you have access to an employer 401(k) or 403(b)?',
    type: 'yesno',
    required: true,
    helpText: 'Employer-sponsored retirement plan',
    category: 'employer',
    skipForProfiles: [1, 2, 3, 4]  // ROBS and self-employed profiles
  },
  a4_hasMatch: {
    id: 'a4_hasMatch',
    label: 'Does your employer offer matching contributions?',
    type: 'yesno',
    required: false,
    helpText: 'Free money - employer matches your contributions',
    category: 'employer',
    showIf: (answers) => answers.a3_has401k === 'Yes',
    skipForProfiles: [1, 2, 3, 4]
  },
  a5_matchFormula: {
    id: 'a5_matchFormula',
    label: 'What is your employer match formula?',
    type: 'select',
    required: false,
    options: [
      { value: '', label: '-- Select match formula --' },
      { value: '100_3', label: '100% up to 3%' },
      { value: '100_4', label: '100% up to 4%' },
      { value: '100_5', label: '100% up to 5%' },
      { value: '100_6', label: '100% up to 6%' },
      { value: '50_6', label: '50% up to 6%' },
      { value: '50_4', label: '50% up to 4%' },
      { value: '25_6', label: '25% up to 6%' },
      { value: 'other', label: 'Other / Not sure' }
    ],
    category: 'employer',
    showIf: (answers) => answers.a3_has401k === 'Yes' && answers.a4_hasMatch === 'Yes',
    skipForProfiles: [1, 2, 3, 4]
  },
  a6_hasRoth401k: {
    id: 'a6_hasRoth401k',
    label: 'Does your plan offer a Roth 401(k) option?',
    type: 'yesno',
    required: false,
    helpText: 'After-tax contributions that grow tax-free',
    category: 'employer',
    showIf: (answers) => answers.a3_has401k === 'Yes',
    skipForProfiles: [1, 2, 3, 4]
  },

  // --- HSA Eligibility (All profiles) ---
  a7_hsaEligible: {
    id: 'a7_hsaEligible',
    label: 'Are you enrolled in a High Deductible Health Plan (HDHP)?',
    type: 'yesno',
    required: true,
    helpText: 'Required for HSA eligibility - triple tax advantage',
    category: 'hsa'
  },

  // --- Education Domain (Ambition Quotient) ---
  a8_hasChildren: {
    id: 'a8_hasChildren',
    label: 'Do you have children or plan to save for education?',
    type: 'yesno',
    required: true,
    helpText: 'Affects allocation between retirement and education',
    category: 'education'
  },
  a9_numChildren: {
    id: 'a9_numChildren',
    label: 'How many children/dependents are you saving for?',
    type: 'number',
    required: false,
    min: 1,
    max: 10,
    placeholder: 'e.g., 2',
    category: 'education',
    showIf: (answers) => answers.a8_hasChildren === 'Yes',
    defaultWhenHidden: 0
  },
  a10_yearsToEducation: {
    id: 'a10_yearsToEducation',
    label: 'Years until first child needs education funds',
    type: 'number',
    required: false,
    min: 0,
    max: 25,
    placeholder: 'e.g., 10',
    helpText: 'Years until oldest child starts college',
    category: 'education',
    showIf: (answers) => answers.a8_hasChildren === 'Yes',
    defaultWhenHidden: 99
  },
  a11_educationVehicle: {
    id: 'a11_educationVehicle',
    label: 'Which education savings vehicle do you prefer?',
    type: 'select',
    required: false,
    options: [
      { value: '529', label: '529 Plan - No income limits, higher contribution room, college focus' },
      { value: 'coverdell', label: 'Coverdell ESA - K-12 + college flexible, $2,000/child/year limit' },
      { value: 'both', label: 'Both - Use Coverdell first, overflow to 529' }
    ],
    helpText: '529: No income limits, college expenses. Coverdell: $2k/child limit, phases out at $110k+ income, but covers K-12.',
    category: 'education',
    showIf: (answers) => answers.a8_hasChildren === 'Yes',
    defaultWhenHidden: '529'
  },

  // --- Current Balances (For projections) ---
  a12_current401kBalance: {
    id: 'a12_current401kBalance',
    label: 'Current 401(k)/403(b) balance',
    type: 'currency',
    required: false,
    placeholder: 'e.g., 75000',
    category: 'balances',
    showIf: (answers) => answers.a3_has401k === 'Yes',
    defaultWhenHidden: 0
  },
  a13_currentIRABalance: {
    id: 'a13_currentIRABalance',
    label: 'Current IRA balance (Traditional + Roth combined)',
    type: 'currency',
    required: true,
    placeholder: 'e.g., 25000',
    category: 'balances'
  },
  a14_currentHSABalance: {
    id: 'a14_currentHSABalance',
    label: 'Current HSA balance',
    type: 'currency',
    required: false,
    placeholder: 'e.g., 5000',
    category: 'balances',
    showIf: (answers) => answers.a7_hsaEligible === 'Yes',
    defaultWhenHidden: 0
  },
  a15_currentEducationBalance: {
    id: 'a15_currentEducationBalance',
    label: 'Current education savings (all children combined)',
    type: 'currency',
    required: false,
    placeholder: 'e.g., 25000',
    helpText: 'Total across 529, Coverdell ESA, UTMA',
    category: 'balances',
    showIf: (answers) => answers.a8_hasChildren === 'Yes',
    defaultWhenHidden: 0
  },

  // --- Current Monthly Contributions ---
  a16_monthly401kContribution: {
    id: 'a16_monthly401kContribution',
    label: 'Current monthly 401(k) contribution',
    type: 'currency',
    required: false,
    placeholder: 'e.g., 500',
    category: 'contributions',
    showIf: (answers) => answers.a3_has401k === 'Yes',
    defaultWhenHidden: 0
  },
  a17_monthlyIRAContribution: {
    id: 'a17_monthlyIRAContribution',
    label: 'Current monthly IRA contribution',
    type: 'currency',
    required: true,
    placeholder: 'e.g., 200',
    category: 'contributions'
  },
  a18_monthlyHSAContribution: {
    id: 'a18_monthlyHSAContribution',
    label: 'Current monthly HSA contribution',
    type: 'currency',
    required: false,
    placeholder: 'e.g., 100',
    category: 'contributions',
    showIf: (answers) => answers.a7_hsaEligible === 'Yes',
    defaultWhenHidden: 0
  },
  a19_monthlyEducationContribution: {
    id: 'a19_monthlyEducationContribution',
    label: 'Current monthly education contribution',
    type: 'currency',
    required: false,
    placeholder: 'e.g., 200',
    helpText: 'Combined for all children',
    category: 'contributions',
    showIf: (answers) => answers.a8_hasChildren === 'Yes',
    defaultWhenHidden: 0
  }
};

// Allocation question sections for rendering
const ALLOCATION_SECTIONS = [
  {
    id: 'income',
    title: 'Income & Timeline',
    description: 'Required for accurate projections',
    fields: ['a1_grossIncome', 'a2_yearsToRetirement', 'a2b_taxPreference']
  },
  {
    id: 'employer',
    title: 'Employer Retirement Plan',
    description: 'Your workplace retirement benefits',
    fields: ['a3_has401k', 'a4_hasMatch', 'a5_matchFormula', 'a6_hasRoth401k'],
    skipForProfiles: [1, 2, 3, 4]  // Skip entire section for ROBS/self-employed
  },
  {
    id: 'hsa',
    title: 'Health Savings Account',
    description: 'Triple tax-advantaged health savings',
    fields: ['a7_hsaEligible']
  },
  {
    id: 'education',
    title: 'Education Savings',
    description: 'Saving for children education',
    fields: ['a8_hasChildren', 'a9_numChildren', 'a10_yearsToEducation', 'a11_educationVehicle']
  },
  {
    id: 'balances',
    title: 'Current Balances',
    description: 'Your starting point for projections',
    fields: ['a12_current401kBalance', 'a13_currentIRABalance', 'a14_currentHSABalance', 'a15_currentEducationBalance']
  },
  {
    id: 'contributions',
    title: 'Current Monthly Contributions',
    description: 'What you are contributing now',
    fields: ['a16_monthly401kContribution', 'a17_monthlyIRAContribution', 'a18_monthlyHSAContribution', 'a19_monthlyEducationContribution']
  }
];

// ============================================================================
// DERIVED VALUES FROM UPSTREAM TOOLS
// ============================================================================
// These values can short-circuit classification without asking questions

const DERIVED_CLASSIFICATION_CHECKS = {
  // Profile 9: Late-Stage Growth
  // Triggered if age >= 55 OR yearsToRetirement <= 5
  profile9: {
    check: (upstream) => {
      const age = upstream.age || 0;
      const yearsToRetirement = upstream.yearsToRetirement || 99;
      return age >= 55 || yearsToRetirement <= 5;
    },
    profile: 9,
    reason: 'Near retirement - focus on catch-up and preservation'
  },

  // Profile 6: Catch-Up Contributor
  // Triggered if age >= 50 AND retirementConfidence < 0 (from Tool 2)
  // retirementConfidence is used as a proxy for "catch-up feeling"
  profile6: {
    check: (upstream) => {
      const age = upstream.age || 0;
      const retirementConfidence = upstream.retirementConfidence;
      // Only trigger if we have the data
      if (age >= 50 && retirementConfidence !== null && retirementConfidence !== undefined) {
        return retirementConfidence < 0;
      }
      return false;
    },
    profile: 6,
    reason: 'Age 50+ and behind on retirement savings'
  }
};

// ============================================================================
// PHASE C: AMBITION QUOTIENT QUESTIONS
// ============================================================================
// Adaptive psychological assessment - only asks about ACTIVE domains
// Domain is active if: Retirement (always), Education (hasChildren), Health (hsaEligible)

const AMBITION_QUESTIONS = {
  // ========== RETIREMENT DOMAIN (Always asked) ==========
  aq_retirement_importance: {
    id: 'aq_retirement_importance',
    domain: 'Retirement',
    dimension: 'importance',
    label: 'How important is saving for retirement at this point in your life?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'Not at all important',
    rightLabel: 'Absolutely essential',
    required: true
  },
  aq_retirement_anxiety: {
    id: 'aq_retirement_anxiety',
    domain: 'Retirement',
    dimension: 'anxiety',
    label: 'How much anxiety do you currently feel about your retirement outlook?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'No anxiety at all',
    rightLabel: 'Constant anxiety and concern',
    required: true
  },
  aq_retirement_motivation: {
    id: 'aq_retirement_motivation',
    domain: 'Retirement',
    dimension: 'motivation',
    label: 'How motivated are you to take action toward your retirement goals?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'Not motivated at all',
    rightLabel: 'Extremely motivated',
    required: true
  },

  // ========== EDUCATION DOMAIN (Only if hasChildren === 'Yes') ==========
  aq_education_importance: {
    id: 'aq_education_importance',
    domain: 'Education',
    dimension: 'importance',
    label: 'How important is saving for education at this point in your life?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'Not at all important',
    rightLabel: 'Absolutely essential',
    required: true,
    showIf: (answers) => answers.a8_hasChildren === 'Yes'
  },
  aq_education_anxiety: {
    id: 'aq_education_anxiety',
    domain: 'Education',
    dimension: 'anxiety',
    label: 'How much anxiety do you feel about funding education expenses?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'No anxiety at all',
    rightLabel: 'Constant anxiety and concern',
    required: true,
    showIf: (answers) => answers.a8_hasChildren === 'Yes'
  },
  aq_education_motivation: {
    id: 'aq_education_motivation',
    domain: 'Education',
    dimension: 'motivation',
    label: 'How motivated are you to take action toward education savings?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'Not motivated at all',
    rightLabel: 'Extremely motivated',
    required: true,
    showIf: (answers) => answers.a8_hasChildren === 'Yes'
  },

  // ========== HEALTH DOMAIN (Only if hsaEligible === 'Yes') ==========
  aq_health_importance: {
    id: 'aq_health_importance',
    domain: 'Health',
    dimension: 'importance',
    label: 'How important is saving for future healthcare costs at this point in your life?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'Not at all important',
    rightLabel: 'Absolutely essential',
    required: true,
    showIf: (answers) => answers.a7_hsaEligible === 'Yes'
  },
  aq_health_anxiety: {
    id: 'aq_health_anxiety',
    domain: 'Health',
    dimension: 'anxiety',
    label: 'How much anxiety do you feel about affording healthcare expenses?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'No anxiety at all',
    rightLabel: 'Constant anxiety and concern',
    required: true,
    showIf: (answers) => answers.a7_hsaEligible === 'Yes'
  },
  aq_health_motivation: {
    id: 'aq_health_motivation',
    domain: 'Health',
    dimension: 'motivation',
    label: 'How motivated are you to set aside money for health-related expenses?',
    type: 'scale',
    min: 1,
    max: 7,
    leftLabel: 'Not motivated at all',
    rightLabel: 'Extremely motivated',
    required: true,
    showIf: (answers) => answers.a7_hsaEligible === 'Yes'
  },

  // ========== TIE-BREAKER (Only if 3 domains active) ==========
  aq_tiebreaker: {
    id: 'aq_tiebreaker',
    label: 'If you could only fully fund ONE area this year, which would you choose?',
    type: 'select',
    options: [
      { value: '', label: '-- Select one --' },
      { value: 'Retirement', label: 'Retirement security' },
      { value: 'Education', label: 'Education savings' },
      { value: 'Health', label: 'Health/medical expenses' }
    ],
    required: true,
    showIf: (answers) => answers.a7_hsaEligible === 'Yes' && answers.a8_hasChildren === 'Yes'
  }
};

// Order for rendering ambition questions by domain
const AMBITION_QUESTION_ORDER = {
  Retirement: ['aq_retirement_importance', 'aq_retirement_anxiety', 'aq_retirement_motivation'],
  Education: ['aq_education_importance', 'aq_education_anxiety', 'aq_education_motivation'],
  Health: ['aq_health_importance', 'aq_health_anxiety', 'aq_health_motivation']
};

// ============================================================================
// LEGACY COMPATIBILITY - QUESTIONNAIRE_FIELDS (flattened view)
// ============================================================================
// For backwards compatibility, combine all questions into flat structure

const QUESTIONNAIRE_FIELDS = {
  ...CLASSIFICATION_QUESTIONS,
  ...ALLOCATION_QUESTIONS,
  ...AMBITION_QUESTIONS
};

// Legacy sections structure (for backwards compatibility)
const QUESTIONNAIRE_SECTIONS = [
  {
    id: 'classification',
    title: 'Profile Classification',
    description: 'Determining your investor profile',
    fields: CLASSIFICATION_ORDER
  },
  ...ALLOCATION_SECTIONS
];

// ============================================================================
// UI CONFIGURATION
// ============================================================================

const UI_CONFIG = {
  // Slider settings
  SLIDER_MIN: 0,
  SLIDER_STEP: 50,

  // Currency formatting
  CURRENCY_LOCALE: 'en-US',
  CURRENCY_OPTIONS: { style: 'currency', currency: 'USD', minimumFractionDigits: 0 },

  // Update debounce for real-time calculations
  RECALC_DEBOUNCE_MS: 100
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  SHEET_NAME: 'TOOL6_SCENARIOS',
  PRE_SURVEY_PREFIX: 'tool6_presurvey_',
  SCENARIOS_PREFIX: 'tool6_scenarios_'
};

// ============================================================================
// EXPORTS (for use in other Tool 6 files)
// ============================================================================

// Note: In Google Apps Script, these are global. Export pattern for reference.
const Tool6Constants = {
  IRS_LIMITS_2025,
  MONTHLY_LIMITS_2025,
  PROFILE_DEFINITIONS,
  VEHICLE_DEFINITIONS,
  VEHICLE_PRIORITY_BY_PROFILE,
  DOMAIN_DEFINITIONS,
  PROJECTION_CONFIG,
  INVESTMENT_SCORE_RETURNS,
  INVESTMENT_SCORE_LABELS,
  TAX_STRATEGY_OPTIONS,
  TAX_STRATEGY_THRESHOLDS,
  EMPLOYER_MATCH_FORMULAS,
  AMBITION_QUOTIENT_CONFIG,
  // Two-phase questionnaire exports
  CLASSIFICATION_QUESTIONS,
  CLASSIFICATION_ORDER,
  ALLOCATION_QUESTIONS,
  ALLOCATION_SECTIONS,
  DERIVED_CLASSIFICATION_CHECKS,
  // Phase C: Ambition Quotient
  AMBITION_QUESTIONS,
  AMBITION_QUESTION_ORDER,
  // Legacy compatibility
  QUESTIONNAIRE_FIELDS,
  QUESTIONNAIRE_SECTIONS,
  UI_CONFIG,
  STORAGE_KEYS
};
