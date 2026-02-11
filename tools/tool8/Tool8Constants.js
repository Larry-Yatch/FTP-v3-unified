/**
 * Tool8Constants.js - Constants for the Investment Planning Tool
 *
 * Ported from legacy /apps/Tool-8-investment-tool/scripts/index.html lines 651-663
 * Plus risk band definitions, trauma insight definitions (Phase 6),
 * and action barrier content (Phase 7).
 */

const TOOL8_SETTINGS = {
  // Default assumptions
  inflation: 0.025,
  rRet: 0.10,          // Default maintenance return in retirement
  drawYears: 30,       // Default draw-down period

  // Deployment drag coefficients
  deploymentDrag: 0.20,
  cashOnDrag: 0.05,

  // Sigmoid risk-return mapping parameters
  riskMap: {
    rMin: 0.045,       // Minimum return (risk dial = 0)
    rMax: 0.25,        // Maximum return (risk dial = 10)
    k: 0.6,            // Steepness
    m: 5               // Midpoint
  },

  // Bisection solver ranges
  rSolveRange: [0.0001, 0.30],   // Return solve bounds
  tSolveRange: [0.01, 60],       // Time solve bounds (years)

  // Risk bands for display
  riskBands: [
    { min: 0,   max: 2,    label: 'Very Low Risk/Low Returns', explain: 'Cash/T-bills/IG credit; low vol; high liquidity.' },
    { min: 2,   max: 4,    label: 'Steady Returns',            explain: 'Fixed Funds' },
    { min: 4,   max: 6,    label: 'Growth Backed by Hard Assets', explain: 'Multi-Family Real Estate' },
    { min: 6,   max: 8,    label: 'High Growth',               explain: 'Hedge Fund' },
    { min: 8,   max: 10.1, label: 'High Risk/High Reward',     explain: 'Private Equity' }
  ]
};

/**
 * Calculation modes for the investment calculator
 */
const TOOL8_MODES = {
  CONTRIBUTION: 'contribution',  // Solve for monthly savings needed
  RETURN: 'return',              // Solve for required return rate
  TIME: 'time'                   // Solve for years needed
};
