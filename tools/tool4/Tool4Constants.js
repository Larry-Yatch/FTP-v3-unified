/**
 * Tool4Constants.js - Configuration for Financial Freedom Framework
 *
 * Extracted from Tool4.js to centralize allocation algorithm parameters,
 * priority-to-bucket mappings, and trauma modifier definitions.
 * All values are pure data — no logic or function references.
 */
const Tool4Constants = {

  /**
   * Allocation algorithm configuration (V1)
   */
  ALLOCATION_CONFIG: {
    satisfaction: { neutralScore: 5, step: 0.1, maxBoost: 0.3 },
    essentialPctMap: { A: 5, B: 15, C: 25, D: 35, E: 45, F: 55 },
    minEssentialsAbsolutePct: 40,
    maxRecommendedEssentialsPct: 35,
    maxPositiveMod: 50,
    maxNegativeMod: 20
  },

  /**
   * Base MEFJ allocation weights per priority (V1)
   * M = Multiply, E = Essentials, F = Freedom, J = Enjoyment (aJoy)
   * Values are percentages that sum to 100
   */
  BASE_WEIGHTS: {
    'Build Long-Term Wealth':        { M: 40, E: 25, F: 20, J: 15 },
    'Get Out of Debt':               { M: 15, E: 25, F: 45, J: 15 },
    'Feel Financially Secure':       { M: 25, E: 35, F: 30, J: 10 },
    'Enjoy Life Now':                { M: 20, E: 20, F: 15, J: 45 },
    'Save for a Big Goal':           { M: 15, E: 25, F: 45, J: 15 },
    'Stabilize to Survive':          { M: 5,  E: 45, F: 40, J: 10 },
    'Build or Stabilize a Business': { M: 20, E: 30, F: 35, J: 15 },
    'Create Generational Wealth':    { M: 45, E: 25, F: 20, J: 10 },
    'Create Life Balance':           { M: 15, E: 25, F: 25, J: 35 },
    'Reclaim Financial Control':     { M: 10, E: 35, F: 40, J: 15 }
  },

  /** Default allocation when priority not found in BASE_WEIGHTS */
  DEFAULT_WEIGHTS: { M: 25, E: 25, F: 25, J: 25 },

  /**
   * Trauma pattern → priority boost/penalty modifiers
   * Boosts increase priority score, penalties decrease it
   */
  TRAUMA_PRIORITY_MAP: {
    'FSV': {
      boosts: ['Feel Financially Secure', 'Create Life Balance', 'Stabilize to Survive'],
      penalties: ['Create Generational Wealth']
    },
    'ExVal': {
      boosts: ['Build Long-Term Wealth', 'Feel Financially Secure', 'Reclaim Financial Control'],
      penalties: ['Enjoy Life Now', 'Create Life Balance']
    },
    'Showing': {
      boosts: ['Create Life Balance', 'Enjoy Life Now', 'Build Long-Term Wealth'],
      penalties: ['Create Generational Wealth']
    },
    'Receiving': {
      boosts: ['Build Long-Term Wealth', 'Feel Financially Secure', 'Reclaim Financial Control'],
      penalties: []
    },
    'Control': {
      boosts: ['Create Life Balance', 'Enjoy Life Now', 'Feel Financially Secure'],
      penalties: ['Create Generational Wealth', 'Build Long-Term Wealth']
    },
    'Fear': {
      boosts: ['Feel Financially Secure', 'Stabilize to Survive', 'Create Life Balance'],
      penalties: ['Create Generational Wealth', 'Build Long-Term Wealth', 'Build or Stabilize a Business']
    }
  }
};
