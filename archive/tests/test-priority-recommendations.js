/**
 * Test script for priority recommendation logic
 * Run with: node test-priority-recommendations.js
 */

// Simulate Tool4 object with just the priority recommendation methods
const Tool4Simulator = {
  mapIncomeToRange(monthlyIncome) {
    if (monthlyIncome < 2500) return 'A';
    if (monthlyIncome < 5000) return 'B';
    if (monthlyIncome < 10000) return 'C';
    if (monthlyIncome < 20000) return 'D';
    return 'E';
  },

  scoreWealthPriority(data) {
    let score = 0;
    const { discipline, longTerm, debtLoad, incomeStability, growth, emergencyFund, autonomy, lifestyle } = data;
    if (discipline >= 7) score += 30;
    if (longTerm >= 7) score += 30;
    if (['A','B'].includes(debtLoad)) score += 20;
    if (incomeStability === 'Very stable' || incomeStability === 'Stable') score += 15;
    if (growth >= 7) score += 20;
    if (['D','E'].includes(emergencyFund)) score += 15;
    if (autonomy >= 7) score += 10;
    if (discipline <= 3) score -= 40;
    if (longTerm <= 3) score -= 30;
    if (['D','E'].includes(debtLoad)) score -= 40;
    if (incomeStability === 'Unstable / irregular') score -= 30;
    if (['A','B'].includes(emergencyFund)) score -= 25;
    if (lifestyle >= 7) score -= 20;
    return score;
  },

  scoreDebtPriority(data) {
    let score = 0;
    const { debtLoad, interestLevel, satisfaction, stability, emergencyFund, lifestyle } = data;
    if (['D','E'].includes(debtLoad)) score += 50;
    if (interestLevel === 'High') score += 30;
    if (satisfaction <= 3) score += 20;
    if (stability >= 7) score += 20;
    if (['A','B'].includes(emergencyFund)) score += 15;
    if (['A','B'].includes(debtLoad)) score -= 60;
    if (['D','E'].includes(emergencyFund)) score -= 20;
    if (lifestyle >= 7) score -= 25;
    return score;
  },

  getPriorityReason(priorityName, indicator) {
    const reasons = {
      'Build Long-Term Wealth': {
        recommended: 'Your discipline and long-term focus make this achievable',
        challenging: 'Consider addressing debt/stability first before aggressive wealth building',
        available: 'A solid long-term goal if you have the discipline and stability'
      },
      'Get Out of Debt': {
        recommended: 'Your debt level suggests this should be your primary focus',
        challenging: 'This priority is for those with significant debt to eliminate',
        available: 'Consider this if debt is creating financial stress'
      }
    };
    return reasons[priorityName]?.[indicator] || 'A valid financial priority';
  }
};

// Test Case 1: High-income, disciplined, low debt (should recommend wealth building)
console.log('='.repeat(80));
console.log('TEST CASE 1: High-income, disciplined, low debt');
console.log('='.repeat(80));

const testData1 = {
  discipline: 8,
  longTerm: 9,
  debtLoad: 'A',
  incomeStability: 'Very stable',
  growth: 8,
  emergencyFund: 'E',
  autonomy: 7,
  lifestyle: 4
};

const wealthScore1 = Tool4Simulator.scoreWealthPriority(testData1);
console.log('Build Long-Term Wealth Score:', wealthScore1);
console.log('Indicator:', wealthScore1 >= 50 ? '⭐ RECOMMENDED' : wealthScore1 <= -50 ? '⚠️ CHALLENGING' : '⚪ AVAILABLE');
console.log('Reason:', Tool4Simulator.getPriorityReason('Build Long-Term Wealth', wealthScore1 >= 50 ? 'recommended' : wealthScore1 <= -50 ? 'challenging' : 'available'));
console.log();

const debtData1 = {
  debtLoad: 'A',
  interestLevel: 'Low',
  satisfaction: 7,
  stability: 5,
  emergencyFund: 'E',
  lifestyle: 4
};

const debtScore1 = Tool4Simulator.scoreDebtPriority(debtData1);
console.log('Get Out of Debt Score:', debtScore1);
console.log('Indicator:', debtScore1 >= 50 ? '⭐ RECOMMENDED' : debtScore1 <= -50 ? '⚠️ CHALLENGING' : '⚪ AVAILABLE');
console.log('Reason:', Tool4Simulator.getPriorityReason('Get Out of Debt', debtScore1 >= 50 ? 'recommended' : debtScore1 <= -50 ? 'challenging' : 'available'));
console.log();

// Test Case 2: High debt, low discipline, unstable income (should recommend debt payoff)
console.log('='.repeat(80));
console.log('TEST CASE 2: High debt, low discipline, unstable income');
console.log('='.repeat(80));

const testData2 = {
  discipline: 3,
  longTerm: 4,
  debtLoad: 'E',
  incomeStability: 'Unstable / irregular',
  growth: 3,
  emergencyFund: 'A',
  autonomy: 4,
  lifestyle: 5
};

const wealthScore2 = Tool4Simulator.scoreWealthPriority(testData2);
console.log('Build Long-Term Wealth Score:', wealthScore2);
console.log('Indicator:', wealthScore2 >= 50 ? '⭐ RECOMMENDED' : wealthScore2 <= -50 ? '⚠️ CHALLENGING' : '⚪ AVAILABLE');
console.log('Reason:', Tool4Simulator.getPriorityReason('Build Long-Term Wealth', wealthScore2 >= 50 ? 'recommended' : wealthScore2 <= -50 ? 'challenging' : 'available'));
console.log();

const debtData2 = {
  debtLoad: 'E',
  interestLevel: 'High',
  satisfaction: 2,
  stability: 8,
  emergencyFund: 'A',
  lifestyle: 3
};

const debtScore2 = Tool4Simulator.scoreDebtPriority(debtData2);
console.log('Get Out of Debt Score:', debtScore2);
console.log('Indicator:', debtScore2 >= 50 ? '⭐ RECOMMENDED' : debtScore2 <= -50 ? '⚠️ CHALLENGING' : '⚪ AVAILABLE');
console.log('Reason:', Tool4Simulator.getPriorityReason('Get Out of Debt', debtScore2 >= 50 ? 'recommended' : debtScore2 <= -50 ? 'challenging' : 'available'));
console.log();

// Test income mapping
console.log('='.repeat(80));
console.log('INCOME TIER MAPPING TESTS');
console.log('='.repeat(80));
console.log('$2,000/mo → Tier:', Tool4Simulator.mapIncomeToRange(2000));
console.log('$3,500/mo → Tier:', Tool4Simulator.mapIncomeToRange(3500));
console.log('$7,500/mo → Tier:', Tool4Simulator.mapIncomeToRange(7500));
console.log('$15,000/mo → Tier:', Tool4Simulator.mapIncomeToRange(15000));
console.log('$25,000/mo → Tier:', Tool4Simulator.mapIncomeToRange(25000));
console.log();

console.log('✅ All tests completed!');
