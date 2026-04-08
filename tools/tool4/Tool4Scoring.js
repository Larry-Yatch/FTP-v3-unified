/**
 * Tool4Scoring.js - Priority scoring functions for Tool 4
 *
 * Extracted from Tool4.js for maintainability.
 * Each function scores one financial priority based on client data.
 * All follow the same pattern: add points for recommended factors,
 * subtract for cautioned factors, return net score.
 *
 * Called by Tool4.calculatePriorityRecommendations() only.
 */

const Tool4Scoring = {

  /**
   * Score: Build Long-Term Wealth
   */
  scoreWealthPriority(data) {
    let score = 0;
    const { discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle, essentialsPct, surplus } = data;

    // Recommended factors
    if (discipline >= 7) score += 30;
    if (longTerm >= 7) score += 30;
    if (['A','B'].includes(debtLoad)) score += 20;
    if (incomeStability === 'Very stable' || incomeStability === 'Stable') score += 15;
    if (growth >= 7) score += 20;
    if (['D','E'].includes(emergencyFund)) score += 15;
    if (autonomy >= 7) score += 10;

    // Cash flow health (critical for wealth building)
    if (essentialsPct < 50) score += 25;  // Large surplus = excellent position
    if (surplus >= 2000) score += 20;     // $2k+/mo surplus = wealth building ready

    // Cautioned factors
    if (discipline <= 3) score -= 40;
    if (longTerm <= 3) score -= 30;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 25;
    if (lifestyle >= 7) score -= 20;

    // Cash flow challenges (major barriers to wealth building)
    if (essentialsPct > 80) score -= 40;  // Tight budget = hard to invest
    if (essentialsPct > 90) score -= 60;  // Paycheck to paycheck = not viable
    if (surplus < 500) score -= 30;       // Less than $500/mo = challenging

    return score;
  },

  /**
   * Score: Get Out of Debt
   */
  scoreDebtPriority(data) {
    let score = 0;
    const { debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle, essentialsPct, surplus } = data;

    // Recommended factors
    if (['D','E'].includes(debtLoad)) score += 50;
    if (interestLevel === 'High') score += 30;
    if (satisfaction <= 3) score += 20;
    if (stability >= 7) score += 20;
    if (['A','B'].includes(emergencyFund)) score += 15;

    // Cash flow impact on debt payoff ability
    if (essentialsPct < 70 && surplus >= 800) score += 25;  // Room to attack debt
    if (essentialsPct > 85) score -= 20;  // Tight budget = harder to pay extra

    // Cautioned factors
    if (['A','B'].includes(debtLoad)) score -= 60;
    if (['D','E'].includes(emergencyFund)) score -= 20;
    if (lifestyle >= 7) score -= 25;

    return score;
  },

  /**
   * Score: Feel Financially Secure
   */
  scoreSecurityPriority(data) {
    let score = 0;
    const { incomeStability, emergencyFund, dependents, satisfaction, stability, impulse, discipline, growth, essentialsPct, surplus } = data;

    // Recommended factors
    if (incomeStability === 'Unstable / irregular') score += 40;
    if (['A','B'].includes(emergencyFund)) score += 40;
    if (dependents === 'Yes') score += 25;
    if (satisfaction <= 3 && stability >= 7) score += 20; // High emotional safety need
    if (impulse <= 3) score += 15;
    if (discipline <= 3) score += 15;

    // Cash flow and security relationship
    if (essentialsPct > 75 && essentialsPct < 90) score += 30;  // Tight but not crisis = security focus
    if (surplus < 800 && surplus >= 200) score += 20;           // Modest surplus = build buffer

    // Cautioned factors
    if (incomeStability === 'Very stable') score -= 25;
    if (['D','E'].includes(emergencyFund)) score -= 30;
    if (dependents === 'No') score -= 10;
    if (growth >= 7) score -= 20;

    // Already very secure cash flow
    if (essentialsPct < 50 && surplus >= 2000) score -= 35;  // Already secure, aim higher

    return score;
  },

  /**
   * Score: Enjoy Life Now
   */
  scoreEnjoymentPriority(data) {
    let score = 0;
    const { satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, impulse, incomeRange, dependents, essentialsPct, surplus } = data;

    // Recommended factors
    if (satisfaction <= 3) score += 30;
    if (lifestyle >= 7) score += 40;
    if (incomeStability === 'Stable' || incomeStability === 'Very stable') score += 25;
    if (['A','B'].includes(debtLoad)) score += 30;
    if (['D','E'].includes(emergencyFund)) score += 20;
    if (impulse >= 7) score += 15;

    // Cash flow enables enjoyment
    if (surplus >= 1000 && essentialsPct < 70) score += 30;  // Ample room for enjoyment

    // Cautioned factors
    if (['D','E'].includes(debtLoad)) score -= 50;
    if (incomeStability === 'Unstable / irregular') score -= 40;
    if (['A','B'].includes(emergencyFund)) score -= 35;
    if (dependents === 'Yes') score -= 25; // Simplified - would check count if available
    if (impulse <= 3) score -= 30;
    if (incomeRange === 'A') score -= 20;

    // Cash flow limits enjoyment
    if (essentialsPct > 85) score -= 45;  // Tight budget = can't enjoy much
    if (surplus < 300) score -= 40;       // Little room for extras

    return score;
  },

  /**
   * Score: Save for a Big Goal
   */
  scoreBigGoalPriority(data) {
    let score = 0;
    const { debtLoad, emergencyFund, discipline, incomeStability, essentialsPct, surplus } = data;

    // Recommended factors
    if (['C'].includes(debtLoad)) score += 10; // Moderate debt ok
    if (['D','E'].includes(emergencyFund)) score += 20;
    if (discipline >= 7) score += 25;
    if (incomeStability === 'Stable' || incomeStability === 'Very stable') score += 20;

    // Cash flow enables goal saving
    if (surplus >= 600 && essentialsPct < 75) score += 25;  // Room to save for goal

    // Cautioned factors
    if (debtLoad === 'E') score -= 35;
    if (incomeStability === 'Unstable / irregular') score -= 25;
    if (['A','B'].includes(emergencyFund)) score -= 30;
    if (discipline <= 3) score -= 25;

    // Cash flow limits goal saving
    if (essentialsPct > 85) score -= 30;  // Tight budget = hard to save
    if (surplus < 400) score -= 25;       // Need surplus to save for goals

    return score;
  },

  /**
   * Score: Stabilize to Survive
   */
  scoreSurvivalPriority(data) {
    let score = 0;
    const { debtLoad, incomeStability, emergencyFund, dependents, satisfaction, incomeRange, essentialsPct, surplus } = data;

    // Recommended factors
    if (debtLoad === 'E') score += 40;
    if (incomeStability === 'Unstable / irregular') score += 50;
    if (emergencyFund === 'A') score += 50;
    if (dependents === 'Yes') score += 30;
    if (satisfaction <= 3) score += 25;
    if (incomeRange === 'A') score += 30;

    // Cash flow crisis indicators (CRITICAL)
    if (essentialsPct > 100) score += 70;  // Spending more than earning = CRISIS
    if (essentialsPct > 95) score += 60;   // Less than 5% breathing room = urgent
    if (essentialsPct > 90) score += 50;   // Paycheck to paycheck = survival mode
    if (surplus < 200) score += 40;        // Less than $200/mo = very tight
    if (surplus < 0) score += 80;          // Negative cash flow = immediate crisis

    // Cautioned factors
    if (['A','B'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Very stable') score -= 40;
    if (['D','E'].includes(emergencyFund)) score -= 40;
    if (dependents === 'No') score -= 20;
    if (incomeRange === 'E') score -= 25;

    // Cash flow health (reduces survival need)
    if (essentialsPct < 60) score -= 40;   // Healthy surplus = not survival mode
    if (surplus >= 1500) score -= 50;      // $1.5k+ surplus = beyond survival

    return score;
  },

  /**
   * Score: Build or Stabilize a Business
   */
  scoreBusinessPriority(data) {
    let score = 0;
    const { autonomy, growth, emergencyFund, incomeStability, discipline, debtLoad, dependents, essentialsPct, surplus } = data;

    // Recommended factors
    if (autonomy >= 7) score += 30;
    if (growth >= 7) score += 25;
    if (emergencyFund === 'C') score += 20; // Moderate reserves
    if (incomeStability === 'Stable') score += 15;
    if (discipline >= 7) score += 20;

    // Cash flow for business investment
    if (surplus >= 1200 && essentialsPct < 70) score += 25;  // Capital available for business

    // Cautioned factors
    if (debtLoad === 'E') score -= 35;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 40;
    if (autonomy <= 3) score -= 25;
    if (discipline <= 3) score -= 30;
    if (dependents === 'Yes') score -= 20; // Simplified

    // Cash flow too tight for business risk
    if (essentialsPct > 90) score -= 45;  // Need buffer for business volatility
    if (surplus < 500) score -= 35;       // Need capital cushion

    return score;
  },

  /**
   * Score: Create Generational Wealth
   */
  scoreGenerationalPriority(data) {
    let score = 0;
    const { incomeRange, growth, discipline, emergencyFund, debtLoad, longTerm, dependents, essentialsPct, surplus } = data;

    // Recommended factors
    if (incomeRange === 'E') score += 30;
    if (growth >= 7) score += 35;
    if (discipline >= 7) score += 30;
    if (['D','E'].includes(emergencyFund)) score += 25;
    if (['A','B'].includes(debtLoad)) score += 25;
    if (longTerm >= 7) score += 30;
    if (dependents === 'Yes') score += 20;

    // Cash flow enables long-term wealth building
    if (surplus >= 2500 && essentialsPct < 50) score += 35;  // Significant capital for generational wealth

    // Cautioned factors
    if (['A','B'].includes(incomeRange)) score -= 40;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (discipline <= 3) score -= 40;
    if (['A','B'].includes(emergencyFund)) score -= 30;
    if (longTerm <= 3) score -= 35;

    // Cash flow insufficient for generational wealth
    if (essentialsPct > 75) score -= 45;  // Need large surplus for generational goals
    if (surplus < 1000) score -= 40;      // Generational wealth needs significant capital

    return score;
  },

  /**
   * Score: Create Life Balance
   */
  scoreBalancePriority(data) {
    let score = 0;
    const { satisfaction, lifestyle, incomeStability, debtLoad, emergencyFund, essentialsPct, surplus } = data;

    // Recommended factors (moderate everything)
    if (satisfaction >= 4 && satisfaction <= 6) score += 20;
    if (lifestyle >= 4 && lifestyle <= 6) score += 15;
    if (incomeStability === 'Stable') score += 20;
    if (['B','C'].includes(debtLoad)) score += 10;
    if (emergencyFund === 'C') score += 15;

    // Moderate cash flow enables balance
    if (essentialsPct >= 60 && essentialsPct <= 75) score += 20;  // Balanced spending
    if (surplus >= 500 && surplus <= 1500) score += 15;           // Moderate surplus

    // Cautioned factors (extremes)
    if (debtLoad === 'A' || debtLoad === 'E') score -= 25;
    if (satisfaction <= 2) score -= 20;
    if (incomeStability === 'Unstable / irregular') score -= 20;
    if (emergencyFund === 'A') score -= 25;

    // Cash flow extremes reduce balance
    if (essentialsPct > 90 || essentialsPct < 40) score -= 20;  // Either too tight or too loose
    if (surplus < 300) score -= 25;                              // Too tight for balance

    return score;
  },

  /**
   * Score: Reclaim Financial Control
   */
  scoreControlPriority(data) {
    let score = 0;
    const { satisfaction, debtLoad, discipline, emergencyFund, incomeStability, impulse, essentialsPct, surplus } = data;

    // Recommended factors
    if (satisfaction <= 3) score += 40;
    if (['D','E'].includes(debtLoad)) score += 30;
    if (discipline <= 3) score += 30;
    if (['A','B'].includes(emergencyFund)) score += 25;
    if (incomeStability === 'Unstable / irregular') score += 25;
    if (impulse <= 3) score += 20;

    // Cash flow out of control indicates need
    if (essentialsPct > 90) score += 35;  // Paycheck to paycheck = need control
    if (surplus < 300) score += 30;       // Very tight = need control
    if (surplus < 0) score += 50;         // Deficit = urgent control needed

    // Cautioned factors
    if (satisfaction >= 7) score -= 30;
    if (debtLoad === 'A') score -= 25;
    if (discipline >= 7) score -= 25;
    if (['D','E'].includes(emergencyFund)) score -= 20;
    if (incomeStability === 'Very stable') score -= 20;

    // Already have control
    if (essentialsPct < 60 && surplus >= 1000) score -= 30;  // Healthy cash flow = already in control

    return score;
  }
};
