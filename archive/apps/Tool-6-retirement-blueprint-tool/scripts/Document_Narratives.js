// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCED NARRATIVE FUNCTIONS FOR DOCUMENT GENERATION
// Full-length, personalized narratives for retirement blueprints
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate opening narrative based on client data
 */
function generateOpeningNarrative(rowData, hdr) {
  const firstName = (rowData[hdr['Full_Name']] || '').split(' ')[0];
  const age = rowData[hdr['Current_Age']];
  const workSituation = rowData[hdr['Work_Situation']];
  const profileId = rowData[hdr['ProfileID']];
  const profileConfig = PROFILE_CONFIG[profileId] || { title: 'Retirement Strategist' };
  
  let narrative = `Dear ${firstName},\n\n`;
  
  // Age-based opening
  if (age < 35) {
    narrative += `At ${age}, you're at an ideal stage to build a powerful financial foundation. `;
  } else if (age < 50) {
    narrative += `At ${age}, you're in your peak earning years with significant opportunities to accelerate your wealth building. `;
  } else if (age < 60) {
    narrative += `At ${age}, you've entered a critical phase where strategic decisions can dramatically impact your retirement security. `;
  } else {
    narrative += `At ${age}, you're approaching or in retirement with important opportunities to optimize and protect your wealth. `;
  }
  
  // Work situation context
  if (workSituation === 'Self-employed') {
    narrative += `As a self-employed professional, you have unique control over your retirement strategy. `;
  } else if (workSituation === 'W-2 employee') {
    narrative += `As an employee, you have access to valuable workplace benefits that we'll help you maximize. `;
  } else if (workSituation === 'Both') {
    narrative += `With both employment and self-employment income, you have exceptional opportunities to diversify your retirement savings. `;
  }
  
  narrative += `\n\nThis personalized Retirement Blueprint has been crafted specifically for your situation as a ${profileConfig.title}. `;
  narrative += `We've analyzed your current financial position, understood your priorities, and designed a strategy that aligns with your goals.`;
  
  // Add more context about the process
  narrative += `\n\nThrough our comprehensive analysis, we've examined over 15 different investment vehicles, calculated personalized growth projections based on your unique profile, and identified specific opportunities that could significantly enhance your financial future. `;
  narrative += `This isn't a generic plan – every recommendation has been tailored to your specific circumstances, tax situation, and long-term objectives.`;
  
  // Add urgency or encouragement based on age
  if (age < 40) {
    narrative += `\n\nThe decisions you make today will compound exponentially over the next ${65 - age} years. `;
    narrative += `By taking action now, you're positioning yourself for extraordinary long-term wealth building that many people miss by waiting too long.`;
  } else if (age < 55) {
    narrative += `\n\nYou're in a powerful position to make strategic moves that can dramatically improve your retirement readiness. `;
    narrative += `The next decade represents your peak earning and saving opportunity – let's make it count.`;
  } else {
    narrative += `\n\nWhile others might think it's too late to make meaningful changes, we know better. `;
    narrative += `Strategic optimization at this stage can still create substantial improvements in your retirement security and legacy planning.`;
  }
  
  return narrative;
}

/**
 * Generate Phase 1 narrative - Current Situation Story
 */
function generatePhase1Narrative(rowData, hdr) {
  const income = formatCurrency(rowData[hdr['gross_annual_income']]);
  const netMonthly = formatCurrency(rowData[hdr['Net_Monthly_Income']]);
  const savingsRate = rowData[hdr['Allocation_Percentage']] + '%';
  const filingStatus = rowData[hdr['filing_status']];
  const retirementTimeframe = rowData[hdr['Retirement_Timeframe']];
  const actionMotivation = rowData[hdr['Action_Motivation']];
  
  let narrative = `With an annual income of ${income} and monthly net income of ${netMonthly}, `;
  narrative += `you've committed to saving ${savingsRate} of your income for the future. `;
  
  // Tax situation
  if (filingStatus === 'Single') {
    narrative += `As a single filer, we'll help you maximize individual contribution limits and tax advantages. `;
  } else if (filingStatus === 'Married Filing Jointly') {
    narrative += `Filing jointly provides opportunities for higher contribution limits and coordinated tax strategies. `;
  }
  
  // Urgency and motivation
  if (retirementTimeframe === 'Less than 5 years') {
    narrative += `\n\nWith retirement approaching soon, every decision counts. `;
  } else if (retirementTimeframe === '5-10 years') {
    narrative += `\n\nWith 5-10 years until retirement, you're in the critical accumulation phase. `;
  } else {
    narrative += `\n\nWith over 10 years until retirement, time is your greatest asset. `;
  }
  
  if (actionMotivation === 'Urgent - Need to act now') {
    narrative += `Your sense of urgency is well-founded, and we're here to help you take immediate, effective action.`;
  } else {
    narrative += `Your proactive approach to planning will pay significant dividends over time.`;
  }
  
  // Add current savings analysis
  const actualTotal = calculateTotalMonthly(rowData, hdr, 'actual');
  const netIncome = Number(rowData[hdr['Net_Monthly_Income']]) || 0;
  const currentSavingsRate = netIncome > 0 ? (actualTotal / netIncome * 100).toFixed(1) : 0;
  
  narrative += `\n\nCurrently, you're saving approximately ${currentSavingsRate}% of your net income toward retirement. `;
  
  if (currentSavingsRate >= 15) {
    narrative += `This puts you well ahead of most Americans, but there's still room to optimize where these dollars go for maximum tax efficiency and growth. `;
  } else if (currentSavingsRate >= 10) {
    narrative += `While this is a solid foundation, increasing your savings rate even modestly can have dramatic long-term impacts on your wealth. `;
  } else {
    narrative += `There's significant opportunity to accelerate your wealth building by gradually increasing this percentage and optimizing your vehicle selection. `;
  }
  
  // Add context about their current tax situation  
  narrative += `\n\nYour current tax situation provides specific opportunities we'll leverage. `;
  const age = Number(rowData[hdr['Current_Age']]) || 0;
  if (age >= 50) {
    narrative += `Being ${age} years old, you have access to valuable catch-up contribution limits that can accelerate your wealth building in these critical years. `;
  }
  
  return narrative;
}

/**
 * Generate Phase 2 narrative - Priorities and Goals
 */
function generatePhase2Narrative(rowData, hdr) {
  const retirementImportance = rowData[hdr['retirement_importance']];
  const educationImportance = rowData[hdr['education_importance']];
  const healthImportance = rowData[hdr['health_importance']];
  const hasChildren = rowData[hdr['cesa_num_children']] > 0;
  const hsaEligible = rowData[hdr['hsa_eligibility']] === 'Yes';
  const investmentConfidence = rowData[hdr['investment_confidence']];
  
  let narrative = ``;
  
  // Investment philosophy
  const confidenceLevel = parseInt(investmentConfidence) || 4;
  if (confidenceLevel >= 6) {
    narrative += `Your high investment confidence (${confidenceLevel}/7) indicates you're ready for sophisticated strategies. `;
  } else if (confidenceLevel >= 4) {
    narrative += `Your moderate investment confidence (${confidenceLevel}/7) suggests a balanced approach with room for growth. `;
  } else {
    narrative += `We'll help build your investment confidence (currently ${confidenceLevel}/7) through education and gradual implementation. `;
  }
  
  // Domain priorities
  const priorities = [
    { domain: 'retirement', importance: parseInt(retirementImportance) || 0 },
    { domain: 'education', importance: parseInt(educationImportance) || 0 },
    { domain: 'health', importance: parseInt(healthImportance) || 0 }
  ].sort((a, b) => b.importance - a.importance);
  
  narrative += `\n\nYour priorities are clear: `;
  
  if (priorities[0].domain === 'retirement') {
    narrative += `Retirement security is your top priority, `;
  } else if (priorities[0].domain === 'education' && hasChildren) {
    narrative += `Funding your children's education is your top priority, `;
  } else if (priorities[0].domain === 'health') {
    narrative += `Health security and medical expense planning is your top priority, `;
  }
  
  narrative += `and we've designed your strategy accordingly. `;
  
  // Specific goals
  const desiredRetirement = rowData[hdr['retirement_desired_monthly_income']];
  if (desiredRetirement) {
    narrative += `Your goal of ${formatCurrency(desiredRetirement)} monthly retirement income guides our recommendations. `;
  }
  
  // Add more context about their priorities
  narrative += `\n\nUnderstanding these priorities allows us to create a strategy that balances your immediate needs with long-term wealth building. `;
  
  // Add investment time and involvement context
  const invTime = Number(rowData[hdr['investment_time']]) || 4;
  const invInvolvement = Number(rowData[hdr['investment_involvement']]) || 4;
  
  if (invTime >= 5 && invInvolvement >= 5) {
    narrative += `Your willingness to dedicate time and be actively involved in your investments opens doors to more sophisticated strategies that can significantly enhance returns. `;
  } else if (invTime <= 3 || invInvolvement <= 3) {
    narrative += `We've designed a streamlined approach that respects your time constraints while still maximizing growth opportunities. `;
  }
  
  // HSA context if eligible
  if (hsaEligible) {
    narrative += `\n\nYour HSA eligibility is a hidden gem in your retirement strategy. This "triple tax advantage" vehicle can serve as a powerful supplemental retirement account, growing tax-free for decades. `;
  }
  
  // Children/education context
  if (hasChildren) {
    const numChildren = Number(rowData[hdr['cesa_num_children']]) || 0;
    narrative += `\n\nBalancing retirement savings with education funding for your ${numChildren} ${numChildren === 1 ? 'child' : 'children'} requires careful planning. `;
    narrative += `We'll show you how to optimize both goals without sacrificing your own financial security. `;
  }
  
  return narrative;
}

/**
 * Generate results interpretation narrative
 */
function generateResultsNarrative(rowData, hdr) {
  const actualTotal = calculateTotalMonthly(rowData, hdr, 'actual');
  const idealTotal = calculateTotalMonthly(rowData, hdr, 'ideal');
  const improvement = idealTotal - actualTotal;
  const improvementPct = actualTotal > 0 ? ((improvement / actualTotal) * 100).toFixed(0) : 100;
  
  let narrative = `Our comprehensive analysis reveals `;
  
  if (improvement > 0) {
    narrative += `significant opportunities to enhance your retirement strategy. `;
    narrative += `By optimizing your vehicle allocation, you could increase your monthly retirement contributions by ${formatCurrency(improvement)} – `;
    narrative += `that's a ${improvementPct}% improvement without changing your overall savings amount. `;
  } else {
    narrative += `that your current allocation is already well-optimized. `;
    narrative += `We've identified strategies to maintain this excellent positioning while potentially improving tax efficiency. `;
  }
  
  // Long-term impact
  const years = Number(rowData[hdr['retirement_years_until_target']]) || 20;
  const annualImprovement = improvement * 12;
  const rate = (Number(rowData[hdr['personalized_annual_rate']]) || 7) / 100;
  
  if (improvement > 0 && years > 0 && rate > 0) {
    // Calculate future value of the improvement
    const futureValue = annualImprovement * ((Math.pow(1 + rate, years) - 1) / rate) * (1 + rate);
    
    narrative += `\n\nOver the next ${years} years, this optimization could generate an additional ${formatCurrency(futureValue)} in retirement wealth. `;
    narrative += `That's the power of strategic vehicle selection combined with compound growth. `;
  }
  
  // Tax efficiency context
  const age = Number(rowData[hdr['Current_Age']]) || 0;
  if (age >= 50) {
    narrative += `\n\nYour catch-up contribution eligibility provides extra power to accelerate wealth building. `;
  }
  
  // Business owner context
  const workSituation = rowData[hdr['Work_Situation']];
  if (workSituation === 'Self-employed' || workSituation === 'Both') {
    narrative += `As a business owner, you have access to contribution limits that most employees can only dream about. `;
    narrative += `We'll help you leverage these opportunities fully. `;
  }
  
  // Risk and confidence building
  narrative += `\n\nThis isn't about taking more risk – it's about being smarter with the dollars you're already saving. `;
  narrative += `Every recommendation is designed to maximize tax advantages while aligning with your risk tolerance and time horizon.`;
  
  return narrative;
}

/**
 * Generate personalized action steps narrative
 */
function generateActionStepsNarrative(rowData, hdr, recommendations) {
  const workSituation = rowData[hdr['Work_Situation']];
  const age = Number(rowData[hdr['Current_Age']]) || 0;
  const actionMotivation = rowData[hdr['Action_Motivation']];
  
  let narrative = `Your personalized roadmap to implementation:\n\n`;
  
  // Opening based on urgency
  if (actionMotivation === 'Urgent - Need to act now') {
    narrative += `Given your urgency, here's your fast-track implementation plan:\n\n`;
  } else {
    narrative += `Here's your strategic implementation plan, designed for steady progress:\n\n`;
  }
  
  // Immediate actions (Week 1)
  narrative += `**Immediate Actions (This Week):**\n`;
  
  if (recommendations && recommendations.length > 0) {
    // First recommendation
    const topRec = recommendations[0];
    if (topRec.ideal > topRec.actual) {
      narrative += `1. **${topRec.name}**: Contact your provider to increase contributions to ${formatCurrency(topRec.ideal)} per month\n`;
    }
  }
  
  // Add HSA if eligible
  const hsaEligible = rowData[hdr['hsa_eligibility']] === 'Yes';
  if (hsaEligible) {
    narrative += `2. **HSA Setup**: Open an HSA account if you haven't already – this is your triple tax advantage opportunity\n`;
  }
  
  // 30-day actions
  narrative += `\n**30-Day Actions:**\n`;
  
  if (workSituation === 'W-2 employee') {
    narrative += `• Review your employer's retirement plan documents for matching formulas and vesting schedules\n`;
    narrative += `• Schedule a meeting with HR to update your contribution elections\n`;
  } else if (workSituation === 'Self-employed') {
    narrative += `• Contact a Solo 401(k) provider to establish your plan (if not already in place)\n`;
    narrative += `• Set up automatic monthly contributions from your business account\n`;
  }
  
  if (recommendations && recommendations.length > 2) {
    narrative += `• Implement your top 3 vehicle recommendations to capture 80% of the optimization benefit\n`;
  }
  
  // 90-day actions
  narrative += `\n**90-Day Actions:**\n`;
  
  if (age >= 50) {
    narrative += `• Ensure all catch-up contributions are maximized across eligible accounts\n`;
  }
  
  const hasChildren = rowData[hdr['cesa_num_children']] > 0;
  if (hasChildren) {
    narrative += `• Open Coverdell ESA accounts for education savings with tax-free growth\n`;
  }
  
  // Profile-specific actions
  const profileId = rowData[hdr['ProfileID']];
  narrative += `\n**Profile-Specific Strategies:**\n`;
  
  switch(profileId) {
    case '1_ROBS_In_Use':
      narrative += `• Ensure ROBS compliance while maximizing other retirement vehicles\n`;
      narrative += `• Document all ROBS transactions for annual compliance review\n`;
      break;
    case '3_Solo401k_Builder':
      narrative += `• Calculate maximum employer profit-sharing contribution based on net business income\n`;
      narrative += `• Consider Roth vs Traditional allocations based on current year income\n`;
      break;
    case '4_Roth_Reclaimer':
      narrative += `• Execute backdoor Roth IRA conversion before year-end\n`;
      narrative += `• Plan multi-year conversion strategy for existing Traditional IRA\n`;
      break;
    case '8_Biz_Owner_Group':
      narrative += `• Explore Cash Balance Plan feasibility with a pension actuary\n`;
      narrative += `• Review group 401(k) plan design for mega backdoor Roth capability\n`;
      break;
    default:
      narrative += `• Review and optimize your specific profile advantages\n`;
      narrative += `• Schedule quarterly reviews to track progress\n`;
  }
  
  // Closing motivation
  narrative += `\n\n**Remember:** The difference between those who retire comfortably and those who struggle isn't luck – `;
  narrative += `it's taking action on a well-designed plan. You have that plan. Now it's time to execute.\n\n`;
  narrative += `Start with step one today. Your future self will thank you.`;
  
  return narrative;
}

/**
 * Generate enhanced profile-specific narrative
 */
function generateProfileNarrative(profileId, rowData, hdr) {
  const age = Number(rowData[hdr['Current_Age']]) || 0;
  const yearsToRetirement = Number(rowData[hdr['retirement_years_until_target']]) || 20;
  const profileConfig = PROFILE_CONFIG[profileId];
  if (!profileConfig) return '';
  
  let narrative = `As a ${profileConfig.title}, you have unique opportunities that most retirement savers miss:\n\n`;
  
  switch(profileId) {
    case '1_ROBS_In_Use':
      const robsMonthly = Number(rowData[hdr['retirement_robs_distribution_actual']]) || 0;
      narrative += `Your ROBS (Rollover for Business Startups) structure is a powerful tool that few understand. `;
      narrative += `With ${formatCurrency(robsMonthly)} monthly distributions funding your business operations tax-free, `;
      narrative += `you're essentially turning retirement funds into business growth capital without penalties.\n\n`;
      narrative += `**Your ROBS Advantages:**\n`;
      narrative += `• Tax-free access to retirement funds for business use\n`;
      narrative += `• No early withdrawal penalties\n`;
      narrative += `• Business growth directly enhances retirement security\n`;
      narrative += `• Ability to contribute to additional retirement accounts\n\n`;
      narrative += `**Critical Compliance Notes:** Maintain proper ROBS documentation and ensure your C-corp follows all requirements. `;
      narrative += `Your continued compliance protects this valuable strategy from IRS challenges.`;
      break;
      
    case '2_ROBS_Curious':
      narrative += `You've expressed interest in ROBS – a strategy that could revolutionize your retirement and business funding. `;
      narrative += `ROBS allows you to use existing retirement funds to start or buy a business without taxes or penalties.\n\n`;
      narrative += `**Why ROBS Might Be Right for You:**\n`;
      narrative += `• Access $50,000+ in retirement funds penalty-free\n`;
      narrative += `• No debt or interest payments\n`;
      narrative += `• Build business equity inside your retirement plan\n`;
      narrative += `• Maintain ability to contribute to other retirement accounts\n\n`;
      narrative += `**Next Steps:** While exploring ROBS, we're positioning your current savings for maximum flexibility. `;
      narrative += `If you decide to proceed with ROBS, your retirement accounts will be ready for seamless conversion.`;
      break;
      
    case '3_Solo401k_Builder':
      const businessIncome = Number(rowData[hdr['gross_annual_income']]) || 0;
      const maxContribution = Math.min(businessIncome * 0.25, 61000);
      narrative += `Your Solo 401(k) is the Swiss Army knife of retirement accounts – incredibly powerful and flexible. `;
      narrative += `As both employee and employer, you can potentially contribute up to ${formatCurrency(maxContribution)} annually.\n\n`;
      narrative += `**Your Solo 401(k) Superpowers:**\n`;
      narrative += `• Employee deferrals up to $22,500 (plus catch-up if eligible)\n`;
      narrative += `• Employer profit-sharing up to 25% of compensation\n`;
      narrative += `• Roth and Traditional options for tax flexibility\n`;
      narrative += `• Loan provisions for emergency access\n\n`;
      narrative += `**Optimization Strategy:** Time your contributions strategically. `;
      narrative += `Make employee deferrals throughout the year, then calculate employer profit-sharing after knowing your full-year income.`;
      break;
      
    case '4_Roth_Reclaimer':
      const hasTraditionalIRA = rowData[hdr['retirement_traditional_ira_balance']] > 0;
      narrative += `Your Roth conversion strategy is about playing the long game – transforming taxable retirement accounts into tax-free wealth. `;
      if (hasTraditionalIRA) {
        narrative += `With existing Traditional IRA assets, you have immediate conversion opportunities.\n\n`;
      } else {
        narrative += `Even without Traditional IRA assets, the backdoor Roth strategy keeps this powerful option available.\n\n`;
      }
      narrative += `**Your Roth Conversion Playbook:**\n`;
      narrative += `• Annual backdoor Roth IRA contributions ($6,500+)\n`;
      narrative += `• Strategic Traditional-to-Roth conversions in low-income years\n`;
      narrative += `• Mega backdoor Roth through 401(k) if available\n`;
      narrative += `• Tax-free growth and withdrawals in retirement\n\n`;
      narrative += `**Tax Planning Note:** Each conversion is a taxable event. `;
      narrative += `We'll help you convert just enough each year to optimize your tax bracket without pushing into higher rates.`;
      break;
      
    case '5_Bracket_Strategist':
      narrative += `Tax bracket optimization is your secret weapon – it's not about how much you make, but how much you keep. `;
      narrative += `By strategically choosing between Traditional and Roth contributions, you're engineering your current and future tax bills.\n\n`;
      narrative += `**Your Tax Optimization Toolkit:**\n`;
      narrative += `• Traditional contributions in high-income years (immediate deduction)\n`;
      narrative += `• Roth contributions in lower-income years (future tax-free)\n`;
      narrative += `• Strategic conversions to fill up lower tax brackets\n`;
      narrative += `• HSA as a super-charged retirement account\n\n`;
      narrative += `**Dynamic Strategy:** Your approach should shift with your income. `;
      narrative += `We'll review quarterly to ensure you're always optimizing for your current bracket while building tax diversity.`;
      break;
      
    case '6_Catch_Up':
      const catchUpAmounts = age >= 50 ? '$7,500 (401k) + $1,000 (IRA)' : 'Not yet eligible';
      narrative += `At ${age}, you're in the retirement savings acceleration zone. `;
      if (age >= 50) {
        narrative += `Your catch-up provisions add ${catchUpAmounts} in additional annual contribution room – that's pure wealth-building power.\n\n`;
      } else {
        narrative += `When you reach 50, you'll unlock significant additional contribution room. We're preparing for that acceleration now.\n\n`;
      }
      narrative += `**Your Acceleration Strategy:**\n`;
      narrative += `• Maximize every available catch-up provision\n`;
      narrative += `• Front-load contributions early in the year\n`;
      narrative += `• Consider Roth conversions before RMDs begin\n`;
      narrative += `• Build tax-diversified income streams\ナ\n`;
      narrative += `**Time Value Focus:** With ${yearsToRetirement} years to retirement, every dollar saved now has maximum time to compound. `;
      narrative += `Your catch-up contributions could add hundreds of thousands to your retirement wealth.`;
      break;
      
    case '7_Foundation_Builder':
      narrative += `You're at the perfect stage to build lifelong wealth – young enough for massive compound growth, `;
      narrative += `yet experienced enough to commit seriously to your future.\n\n`;
      narrative += `**Your Foundation-Building Blueprint:**\n`;
      narrative += `• Automate everything – "set and forget" contributions\n`;
      narrative += `• Maximize employer match (free money!)\n`;
      narrative += `• Build emergency fund alongside retirement\n`;
      narrative += `• Start HSA for triple tax advantages\n\n`;
      narrative += `**Your Secret Weapon – Time:** With ${yearsToRetirement} years until retirement, `;
      narrative += `you have what money can't buy: time for compound growth. `;
      narrative += `A dollar saved today could be worth $10+ at retirement. Start now, start small, but START.`;
      break;
      
    case '8_Biz_Owner_Group':
      narrative += `As a business owner with employees, you sit at the intersection of personal wealth building and business tax strategy. `;
      narrative += `Your advanced options can create massive tax deductions while accelerating retirement savings.\n\n`;
      narrative += `**Your Advanced Strategy Arsenal:**\n`;
      narrative += `• Cash Balance Plans (up to $300,000+ annual contributions)\n`;
      narrative += `• Profit Sharing with age-weighted formulas\n`;
      narrative += `• Mega Backdoor Roth ($43,500 additional)\n`;
      narrative += `• Defined Benefit plans for maximum deductions\n\n`;
      narrative += `**Integration is Key:** Your personal retirement strategy must coordinate with employee benefits. `;
      narrative += `We'll design plans that maximize your benefits while keeping employee costs reasonable and maintaining compliance.`;
      break;
      
    case '9_Late_Stage_Growth':
      const nearingRMD = age >= 70;
      narrative += `In your final accumulation years, every decision has magnified importance. `;
      if (nearingRMD) {
        narrative += `With Required Minimum Distributions (RMDs) approaching, tax planning becomes critical.\n\n`;
      } else {
        narrative += `You have a narrow but powerful window to optimize before RMDs begin.\n\n`;
      }
      narrative += `**Your Late-Stage Optimization Plan:**\n`;
      narrative += `• Maximize all contributions while still working\n`;
      narrative += `• Strategic Roth conversions before RMDs\n`;
      narrative += `• Qualified Charitable Distributions planning\n`;
      narrative += `• Tax-efficient withdrawal sequencing\n\n`;
      narrative += `**Legacy Considerations:** Beyond your own security, `;
      narrative += `we're positioning your accounts for tax-efficient wealth transfer. `;
      narrative += `Your decisions now impact generations to come.`;
      break;
      
    default:
      narrative += `Your profile provides specific optimization opportunities. `;
      narrative += `We'll leverage every advantage available to maximize your retirement success.`;
  }
  
  return narrative;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate total monthly contributions across all vehicles
 */
function calculateTotalMonthly(rowData, hdr, type) {
  let total = 0;
  
  // Find all columns ending with _actual or _ideal
  Object.entries(hdr).forEach(([header, idx]) => {
    if (header.endsWith(`_${type}`) && !header.includes('_fv_')) {
      const value = parseFloat(rowData[idx]) || 0;
      total += value;
    }
  });
  
  return total;
}

/**
 * Format currency values
 */
function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format percentage values
 */
function formatPercentage(value) {
  const num = parseFloat(value) || 0;
  // If value is already in percentage form (e.g., 0.15 for 15%)
  if (num < 1) {
    return (num * 100).toFixed(1) + '%';
  }
  // If value is already in whole number form (e.g., 15 for 15%)
  return num.toFixed(1) + '%';
}

/**
 * Format values based on field type
 */
function formatValue(header, value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  // Currency fields
  if (header.includes('income') || header.includes('balance') || 
      header.includes('actual') || header.includes('ideal') || 
      header.includes('fv_') || header.includes('contribution')) {
    return formatCurrency(value);
  }
  
  // Percentage fields
  if (header.includes('percentage') || header.includes('rate')) {
    return formatPercentage(value);
  }
  
  // Age fields
  if (header.includes('age')) {
    return `${value} years`;
  }
  
  return String(value);
}

/**
 * Format vehicle recommendations into a structured array
 */
function formatVehicleRecommendations(rowData, hdr) {
  const recommendations = [];
  
  // Define all vehicle types to check
  const vehicleTypes = [
    // Retirement vehicles
    { name: 'ROBS Solo 401(k) - Profit Distribution', actual: 'retirement_robs_solo_401k_profit_distribution_actual', ideal: 'retirement_robs_solo_401k_profit_distribution_ideal' },
    { name: 'ROBS Solo 401(k) - Roth', actual: 'retirement_robs_solo_401k_roth_actual', ideal: 'retirement_robs_solo_401k_roth_ideal' },
    { name: 'ROBS Solo 401(k) - Traditional', actual: 'retirement_robs_solo_401k_traditional_actual', ideal: 'retirement_robs_solo_401k_traditional_ideal' },
    { name: 'Solo 401(k) - Employee', actual: 'retirement_solo_401k_employee_actual', ideal: 'retirement_solo_401k_employee_ideal' },
    { name: 'Solo 401(k) - Employer', actual: 'retirement_solo_401k_employer_actual', ideal: 'retirement_solo_401k_employer_ideal' },
    { name: 'Traditional 401(k)', actual: 'retirement_traditional_401k_actual', ideal: 'retirement_traditional_401k_ideal' },
    { name: '401(k) Match Traditional', actual: 'retirement_401k_match_traditional_actual', ideal: 'retirement_401k_match_traditional_ideal' },
    { name: '401(k) Catch-Up', actual: 'retirement_401k_catch_up_actual', ideal: 'retirement_401k_catch_up_ideal' },
    { name: 'Traditional IRA', actual: 'retirement_traditional_ira_actual', ideal: 'retirement_traditional_ira_ideal' },
    { name: 'Roth IRA', actual: 'retirement_roth_ira_actual', ideal: 'retirement_roth_ira_ideal' },
    { name: 'Backdoor Roth IRA', actual: 'retirement_backdoor_roth_ira_actual', ideal: 'retirement_backdoor_roth_ira_ideal' },
    { name: 'IRA Catch-Up', actual: 'retirement_ira_catch_up_actual', ideal: 'retirement_ira_catch_up_ideal' },
    { name: 'Cash Balance Plan', actual: 'retirement_cash_balance_plan_actual', ideal: 'retirement_cash_balance_plan_ideal' },
    { name: 'Defined Benefit Plan', actual: 'retirement_defined_benefit_plan_actual', ideal: 'retirement_defined_benefit_plan_ideal' },
    { name: 'Group 401(k) - Employee', actual: 'retirement_group_401k_employee_actual', ideal: 'retirement_group_401k_employee_ideal' },
    { name: 'Group 401(k) - Employer', actual: 'retirement_group_401k_employer_actual', ideal: 'retirement_group_401k_employer_ideal' },
    { name: 'Group 401(k) - Employer Profit Sharing', actual: 'retirement_group_401k_employer_profit_sharing_actual', ideal: 'retirement_group_401k_employer_profit_sharing_ideal' },
    { name: 'HSA (Retirement)', actual: 'retirement_hsa_actual', ideal: 'retirement_hsa_ideal' },
    // Education vehicles
    { name: 'Combined CESA', actual: 'education_combined_cesa_actual', ideal: 'education_combined_cesa_ideal' },
    // Health vehicles
    { name: 'HSA (Health)', actual: 'health_hsa_actual', ideal: 'health_hsa_ideal' },
    // Other
    { name: 'Family Bank', actual: '', ideal: 'family_bank_ideal' }
  ];
  
  // Collect vehicles with non-zero recommendations
  vehicleTypes.forEach(vehicle => {
    const actualValue = vehicle.actual && hdr[vehicle.actual] !== undefined ? 
      parseFloat(rowData[hdr[vehicle.actual]]) || 0 : 0;
    const idealValue = vehicle.ideal && hdr[vehicle.ideal] !== undefined ? 
      parseFloat(rowData[hdr[vehicle.ideal]]) || 0 : 0;
    
    if (actualValue > 0 || idealValue > 0) {
      recommendations.push({
        name: vehicle.name,
        actual: actualValue,
        ideal: idealValue,
        difference: idealValue - actualValue
      });
    }
  });
  
  // Sort by ideal value descending
  recommendations.sort((a, b) => b.ideal - a.ideal);
  
  return recommendations;
}

/**
 * Populate vehicle recommendations table
 */
function populateVehicleRecommendationsTable(table, recommendations) {
  if (!recommendations || recommendations.length === 0) {
    const row = table.appendTableRow();
    row.appendTableCell('No vehicle recommendations available.');
    return;
  }
  
  // Header row
  const headerRow = table.appendTableRow();
  headerRow.appendTableCell('Investment Vehicle').getChild(0).asParagraph().setBold(true);
  headerRow.appendTableCell('Current Monthly').getChild(0).asParagraph().setBold(true);
  headerRow.appendTableCell('Recommended Monthly').getChild(0).asParagraph().setBold(true);
  headerRow.appendTableCell('Action Needed').getChild(0).asParagraph().setBold(true);
  
  // Data rows
  recommendations.forEach(rec => {
    const row = table.appendTableRow();
    row.appendTableCell(rec.name);
    row.appendTableCell(formatCurrency(rec.actual));
    row.appendTableCell(formatCurrency(rec.ideal));
    
    let action = '';
    if (rec.difference > 0) {
      action = `Increase by ${formatCurrency(rec.difference)}`;
    } else if (rec.difference < 0) {
      action = `Decrease by ${formatCurrency(Math.abs(rec.difference))}`;
    } else {
      action = 'On track!';
    }
    row.appendTableCell(action);
  });
}