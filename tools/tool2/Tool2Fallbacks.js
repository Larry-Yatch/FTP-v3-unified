/**
 * Tool2Fallbacks.js
 * Domain-specific fallback insights when GPT analysis fails
 * These are NOT generic - they're tailored to each financial domain
 *
 * Part of 3-tier fallback system: GPT → Retry → Fallback
 * Ensures 100% reliability - users always get valuable insights
 */

const Tool2Fallbacks = {

  /**
   * Get fallback insight based on domain scores
   * @param {string} responseType - Type of response (income_sources, major_expenses, etc.)
   * @param {object} formData - All form data
   * @param {object} domainScores - Calculated domain scores (0-100%)
   * @returns {object} Fallback insight {pattern, insight, action}
   */
  getFallbackInsight(responseType, formData, domainScores) {
    const fallbacks = {
      income_sources: {
        pattern: this.getIncomePattern(formData.q18_income_sources, domainScores),
        insight: this.getIncomeInsight(formData.q18_income_sources, domainScores),
        action: this.getIncomeAction(formData.q18_income_sources, domainScores)
      },
      major_expenses: {
        pattern: this.getExpensePattern(formData.q23_major_expenses, domainScores),
        insight: this.getExpenseInsight(formData.q23_major_expenses, domainScores),
        action: this.getExpenseAction(formData.q23_major_expenses, domainScores)
      },
      wasteful_spending: {
        pattern: this.getWastefulPattern(formData.q24_wasteful_spending, domainScores),
        insight: this.getWastefulInsight(formData.q24_wasteful_spending, domainScores),
        action: this.getWastefulAction(formData.q24_wasteful_spending, domainScores)
      },
      debt_list: {
        pattern: this.getDebtPattern(formData.q29_debt_list, domainScores),
        insight: this.getDebtInsight(formData.q29_debt_list, domainScores),
        action: this.getDebtAction(formData.q29_debt_list, domainScores)
      },
      investments: {
        pattern: this.getInvestmentPattern(formData.q43_investment_types, domainScores),
        insight: this.getInvestmentInsight(formData.q43_investment_types, domainScores),
        action: this.getInvestmentAction(formData.q43_investment_types, domainScores)
      },
      emotions: {
        pattern: this.getEmotionPattern(formData.q52_emotions, domainScores),
        insight: this.getEmotionInsight(formData.q52_emotions, domainScores),
        action: this.getEmotionAction(formData.q52_emotions, domainScores)
      },
      adaptive_trauma: {
        pattern: this.getTraumaPattern(formData, domainScores),
        insight: this.getTraumaInsight(formData, domainScores),
        action: this.getTraumaAction(formData, domainScores)
      }
    };

    return fallbacks[responseType] || this.getGenericFallback();
  },

  // ============================================================
  // INCOME SOURCES FALLBACKS (Q18)
  // ============================================================

  getIncomePattern(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;
    const responseLength = (response || '').length;

    if (responseLength < 50) {
      return "Your income structure appears straightforward with limited detail provided about income sources.";
    } else if (moneyFlowScore < 30) {
      return "Your income clarity score suggests there may be inconsistency or uncertainty in your income streams.";
    } else if (moneyFlowScore >= 60) {
      return "Your income clarity score indicates a solid understanding of your income sources and their reliability.";
    } else {
      return "Your income structure shows moderate clarity with room to strengthen your understanding of income patterns.";
    }
  },

  getIncomeInsight(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Building clarity around income is foundational to financial stability. Understanding exactly what comes in, when, and how reliably helps you plan with confidence.";
    } else if (moneyFlowScore >= 60) {
      return "Your strong income clarity creates a solid foundation for financial planning. This awareness allows you to make informed decisions about saving, spending, and investing.";
    } else {
      return "Increasing your income clarity will help reduce financial stress and enable more confident decision-making about your money.";
    }
  },

  getIncomeAction(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Create a simple income log for the next 30 days. Track every dollar that comes in, its source, and when you received it. This builds awareness and reveals patterns.";
    } else if (moneyFlowScore >= 60) {
      return "Review your income sources quarterly to identify opportunities for growth, diversification, or increased stability in your highest-earning streams.";
    } else {
      return "Set up a monthly income review ritual. Spend 15 minutes on the 1st of each month reviewing last month's income by source, noting any surprises or changes.";
    }
  },

  // ============================================================
  // MAJOR EXPENSES FALLBACKS (Q23)
  // ============================================================

  getExpensePattern(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;
    const responseLength = (response || '').length;

    if (responseLength < 50) {
      return "Your expense tracking appears basic with limited categorization of spending.";
    } else if (moneyFlowScore < 30) {
      return "Your spending clarity score suggests uncertainty about where your money goes each month.";
    } else if (moneyFlowScore >= 60) {
      return "Your spending clarity score indicates strong awareness of your major expense categories.";
    } else {
      return "Your expense tracking shows moderate awareness with opportunity to increase precision.";
    }
  },

  getExpenseInsight(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Clarity about expenses is as important as income awareness. Knowing exactly where money goes reveals opportunities to align spending with your true priorities.";
    } else if (moneyFlowScore >= 60) {
      return "Your strong expense awareness gives you power to make intentional choices about how you allocate resources toward what matters most.";
    } else {
      return "Strengthening your expense tracking will reveal patterns and opportunities to optimize your spending.";
    }
  },

  getExpenseAction(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Track all expenses for 30 days in 3-5 categories (housing, food, transportation, discretionary, other). This simple system reveals patterns without overwhelming detail.";
    } else if (moneyFlowScore >= 60) {
      return "Review your expense categories against your values. For each major category, ask: 'Does this spending reflect what I care about most?' Adjust one category this month.";
    } else {
      return "Set up a weekly 10-minute expense review. Download transactions, categorize them, and note any surprises. This builds awareness without becoming a burden.";
    }
  },

  // ============================================================
  // WASTEFUL SPENDING FALLBACKS (Q24)
  // ============================================================

  getWastefulPattern(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;
    const responseLength = (response || '').length;

    if (responseLength < 30) {
      return "Your awareness of wasteful spending appears limited or you may have strong spending discipline.";
    } else if (moneyFlowScore < 30) {
      return "Your spending patterns suggest opportunities to reduce waste and align expenses with your priorities.";
    } else if (moneyFlowScore >= 60) {
      return "Your spending awareness suggests you're conscious of wasteful patterns and working to address them.";
    } else {
      return "You've identified wasteful spending patterns, which is the first step toward more intentional choices.";
    }
  },

  getWastefulInsight(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Identifying wasteful spending isn't about shame—it's about redirecting resources toward what truly matters to you. Small changes compound into significant impact.";
    } else if (moneyFlowScore >= 60) {
      return "Your awareness of spending patterns empowers you to make choices aligned with your values rather than habits or impulses.";
    } else {
      return "Recognizing wasteful spending patterns gives you the opportunity to redirect those resources toward more meaningful goals.";
    }
  },

  getWastefulAction(response, scores) {
    const moneyFlowScore = scores.moneyFlow || 0;

    if (moneyFlowScore < 30) {
      return "Identify your top wasteful spending trigger (boredom, stress, social pressure). For the next 2 weeks, before making a purchase, pause and ask: 'What do I actually need right now?'";
    } else if (moneyFlowScore >= 60) {
      return "Calculate how much you've spent on your most wasteful category this year. Visualize what else that money could fund that aligns with your deeper values.";
    } else {
      return "Pick your biggest wasteful spending category. Create a simple rule to reduce it by 25% next month (e.g., 'No impulse buys over $20 without 24-hour wait').";
    }
  },

  // ============================================================
  // DEBT LIST FALLBACKS (Q29)
  // ============================================================

  getDebtPattern(response, scores) {
    const obligationsScore = scores.obligations || 0;
    const responseLength = (response || '').length;

    if (responseLength < 30) {
      return "Your debt situation appears minimal or you may have limited clarity about your obligations.";
    } else if (obligationsScore < 30) {
      return "Your obligations score suggests debt may be causing stress or uncertainty about your financial situation.";
    } else if (obligationsScore >= 60) {
      return "Your obligations score indicates strong awareness and management of your debt situation.";
    } else {
      return "Your debt awareness shows moderate clarity with opportunity to strengthen your repayment strategy.";
    }
  },

  getDebtInsight(response, scores) {
    const obligationsScore = scores.obligations || 0;

    if (obligationsScore < 30) {
      return "Debt clarity reduces anxiety and enables strategic action. Understanding exactly what you owe, to whom, and at what rates is the foundation for financial freedom.";
    } else if (obligationsScore >= 60) {
      return "Your strong debt awareness positions you to make strategic decisions about acceleration, refinancing, or balance between debt paydown and other goals.";
    } else {
      return "Increasing your debt clarity will reduce stress and reveal the most effective strategy for reducing obligations.";
    }
  },

  getDebtAction(response, scores) {
    const obligationsScore = scores.obligations || 0;

    if (obligationsScore < 30) {
      return "Create a debt inventory spreadsheet. List each debt, balance, interest rate, minimum payment, and payoff date. This clarity reveals your true situation and informs strategy.";
    } else if (obligationsScore >= 60) {
      return "Calculate the total interest you'll pay on current debts. Explore refinancing or acceleration strategies for your highest-rate debt. Even $50/month extra can save thousands.";
    } else {
      return "Identify your smallest debt. Commit to paying an extra $25-50/month toward it while maintaining minimums on others. Quick wins build momentum.";
    }
  },

  // ============================================================
  // INVESTMENT FALLBACKS (Q43)
  // ============================================================

  getInvestmentPattern(response, scores) {
    const growthScore = scores.growth || 0;
    const responseLength = (response || '').length;

    if (responseLength < 30) {
      return "Your investment activity appears limited or you may be in the early stages of building investment knowledge.";
    } else if (growthScore < 30) {
      return "Your growth score suggests uncertainty or limited engagement with investment strategies.";
    } else if (growthScore >= 60) {
      return "Your growth score indicates active investment engagement and clarity about your growth strategy.";
    } else {
      return "Your investment awareness shows moderate engagement with opportunity to strengthen your growth strategy.";
    }
  },

  getInvestmentInsight(response, scores) {
    const growthScore = scores.growth || 0;

    if (growthScore < 30) {
      return "Investment clarity doesn't require expertise—it requires understanding what you own, why you own it, and how it fits your goals. Small, consistent action builds confidence.";
    } else if (growthScore >= 60) {
      return "Your investment engagement positions you for long-term wealth building. Continued clarity and discipline in this area will compound over time.";
    } else {
      return "Strengthening your investment clarity will increase confidence and help you make decisions aligned with your long-term goals.";
    }
  },

  getInvestmentAction(response, scores) {
    const growthScore = scores.growth || 0;

    if (growthScore < 30) {
      return "Start simple: Open a low-cost target-date retirement fund with even $25/month. Automate it. This single action builds the habit and confidence for future growth.";
    } else if (growthScore >= 60) {
      return "Review your investment allocation against your risk tolerance and timeline. Rebalance if needed. Schedule quarterly 15-minute check-ins to maintain alignment.";
    } else {
      return "List all your investments with their purposes (retirement, emergency backup, house down payment). Ensure each aligns with a specific goal and timeline.";
    }
  },

  // ============================================================
  // EMOTIONS FALLBACKS (Q52)
  // ============================================================

  getEmotionPattern(response, scores) {
    const avgScore = this.calculateAverageScore(scores);
    const responseLength = (response || '').length;

    if (responseLength < 30) {
      return "Your emotional relationship with money reviewing appears minimal or you may prefer to focus on practical actions.";
    } else if (avgScore < 30) {
      return "Your clarity scores suggest financial review may trigger stress, anxiety, or avoidance patterns.";
    } else if (avgScore >= 60) {
      return "Your clarity scores suggest a relatively balanced emotional relationship with financial review.";
    } else {
      return "Your emotional responses to financial review show a mix of confidence and concern, which is completely normal.";
    }
  },

  getEmotionInsight(response, scores) {
    const avgScore = this.calculateAverageScore(scores);

    if (avgScore < 30) {
      return "Emotions around money are valid and informative. They reveal values, fears, and opportunities for growth. Acknowledging feelings is the first step to changing patterns.";
    } else if (avgScore >= 60) {
      return "Your emotional awareness around money is a strength. This self-knowledge allows you to make financial decisions from clarity rather than reaction.";
    } else {
      return "Understanding your emotional patterns around money helps you recognize triggers and make more intentional financial choices.";
    }
  },

  getEmotionAction(response, scores) {
    const avgScore = this.calculateAverageScore(scores);

    if (avgScore < 30) {
      return "Before your next financial review, write down 3 feelings you notice (e.g., anxiety, overwhelm, shame). Then write: 'This feeling is information, not truth.' Review anyway.";
    } else if (avgScore >= 60) {
      return "Create a pre-review ritual that grounds you (tea, music, deep breaths). Pair financial review with something positive to reinforce the habit.";
    } else {
      return "Notice when financial stress appears. Create a simple grounding practice (5 deep breaths, walk around the block) to reset before making financial decisions.";
    }
  },

  // ============================================================
  // ADAPTIVE TRAUMA FALLBACKS (Q55/Q56)
  // ============================================================

  getTraumaPattern(formData, scores) {
    const traumaType = this.detectTraumaType(formData);
    const avgScore = this.calculateAverageScore(scores);

    const patterns = {
      fsv: "Your responses suggest patterns of financial secrecy or hiding that may be protective but limiting.",
      control: "Your responses suggest patterns of control or anxiety around financial uncertainty.",
      exval: "Your responses suggest patterns of external validation or others' opinions influencing financial decisions.",
      fear: "Your responses suggest patterns of fear or paralysis around financial decisions and action.",
      receiving: "Your responses suggest patterns of discomfort receiving financial support or abundance.",
      showing: "Your responses suggest patterns of over-giving or difficulty showing up for your own financial needs."
    };

    return patterns[traumaType] || patterns.control;
  },

  getTraumaInsight(formData, scores) {
    const traumaType = this.detectTraumaType(formData);
    const avgScore = this.calculateAverageScore(scores);

    const insights = {
      fsv: "Financial secrecy often develops as protection from judgment or conflict. Healing comes through safe, gradual transparency with trusted people.",
      control: "Control patterns around money often stem from deep uncertainty about safety. Healing comes through building systems that create genuine security.",
      exval: "Seeking external validation with money decisions is common. Healing comes through reconnecting with your own values and trusting your judgment.",
      fear: "Financial fear and paralysis are protective responses. Healing comes through small, safe actions that build confidence over time.",
      receiving: "Discomfort receiving often reflects beliefs about worthiness. Healing comes through practicing receiving in small ways and questioning old stories.",
      showing: "Over-giving financially often masks fear of not being enough. Healing comes through recognizing your worth isn't tied to what you give."
    };

    return insights[traumaType] || insights.control;
  },

  getTraumaAction(formData, scores) {
    const traumaType = this.detectTraumaType(formData);
    const avgScore = this.calculateAverageScore(scores);

    const actions = {
      fsv: "Identify one trusted person. Share one small financial truth with them this week (doesn't have to be dramatic). Notice what happens when you're seen.",
      control: "Identify one area where you over-control money. This week, practice relaxing that control in a small, safe way. Notice what emotions arise.",
      exval: "Make one financial decision this week based solely on YOUR values, not what others might think. Notice the resistance and do it anyway.",
      fear: "Identify the smallest financial task you've been avoiding. Break it into a 5-minute action. Do just that. Build confidence through micro-wins.",
      receiving: "Practice receiving without immediately reciprocating. Next time someone offers to pay for coffee or helps you, simply say 'Thank you' and sit with it.",
      showing: "Before saying yes to the next financial request, pause. Ask yourself: 'Am I doing this from love or from fear of not being enough?'"
    };

    return actions[traumaType] || actions.control;
  },

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  detectTraumaType(formData) {
    if (formData.q55a_fsv_hiding) return 'fsv';
    if (formData.q55b_control_anxiety) return 'control';
    if (formData.q55c_exval_influence) return 'exval';
    if (formData.q55d_fear_paralysis) return 'fear';
    if (formData.q55e_receiving_discomfort) return 'receiving';
    if (formData.q55f_showing_overserving) return 'showing';
    return 'control';  // Default
  },

  calculateAverageScore(scores) {
    const allScores = Object.values(scores).filter(s => typeof s === 'number');
    if (allScores.length === 0) return 50;
    return allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
  },

  getGenericFallback() {
    return {
      pattern: "Your responses reflect your current relationship with this aspect of your financial life.",
      insight: "Building awareness and clarity in this area will support more confident decision-making and reduced financial stress.",
      action: "Take one small step this week to increase your understanding or engagement with this financial domain."
    };
  }
};
