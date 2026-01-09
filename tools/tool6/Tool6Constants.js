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
    primaryVehicles: ['Solo 401(k) Employee', 'Solo 401(k) Employer', 'HSA', 'IRA Roth'],
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
  'Taxable Brokerage': {
    domain: 'Overflow',
    taxTreatment: 'Capital gains',
    hasLimit: false,
    description: 'Taxable brokerage - no limits, no tax advantages'
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
    'Taxable Brokerage'
  ],
  2: [  // ROBS-Curious Candidate
    'IRA Rollover to ROBS',
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    'IRA Roth',
    'Taxable Brokerage'
  ],
  3: [  // Business Owner with Employees
    '401(k) Employer Match',
    'HSA',
    'SEP-IRA',
    'SIMPLE IRA',
    '401(k) Traditional',
    'IRA Traditional',
    'Taxable Brokerage'
  ],
  4: [  // Solo 401(k) Optimizer
    'HSA',
    'Solo 401(k) Employee',
    'Solo 401(k) Employer',
    'IRA Roth',
    'IRA Traditional',
    'Taxable Brokerage'
  ],
  5: [  // Bracket Strategist (Traditional Focus)
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    'IRA Traditional',
    '401(k) Roth',
    'IRA Roth',
    'Taxable Brokerage'
  ],
  6: [  // Catch-Up Contributor
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    'IRA Traditional',
    '401(k) Roth',
    'Taxable Brokerage'
  ],
  7: [  // Foundation Builder (Standard W-2 Employee)
    '401(k) Employer Match',
    'HSA',
    '401(k) Roth',
    '401(k) Traditional',
    'IRA Roth',
    'IRA Traditional',
    'Taxable Brokerage'
  ],
  8: [  // Roth Maximizer
    '401(k) Employer Match',
    'HSA',
    '401(k) Roth',
    'IRA Roth',
    '401(k) Traditional',
    'IRA Traditional',
    'Taxable Brokerage'
  ],
  9: [  // Late-Stage Growth
    '401(k) Employer Match',
    'HSA',
    '401(k) Traditional',
    '401(k) Roth',
    'IRA Traditional',
    'Taxable Brokerage'
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
      'Solo 401(k) Employee', 'Solo 401(k) Employer',
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
    vehicles: ['Taxable Brokerage']
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
  UI_CONFIG,
  STORAGE_KEYS
};
