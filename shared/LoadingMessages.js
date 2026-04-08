/**
 * LoadingMessages.js - Centralized message registry for cycling loading tips
 *
 * Server-side file. Messages are injected into template literals via JSON.stringify()
 * and consumed by client-side showLoadingWithTips() in loading-animation.html.
 *
 * All messages MUST avoid contractions (no apostrophes) — GAS template literal
 * double-escaping will break them. Use full words: "do not" not "don't".
 *
 * Usage in render functions:
 *   const tips = JSON.stringify(LOADING_MESSAGES.get('tool1_launch'));
 *   // In template literal: showLoadingWithTips(${tips});
 */

const LOADING_MESSAGES = {

  // ─── Login → Dashboard ───────────────────────────────────────────

  login: [
    'Welcome to TruPath Financial...',
    'Your financial journey is deeply personal and worth exploring...',
    'TruPath connects your inner patterns to your financial decisions...',
    'Understanding yourself is the first step to financial freedom...',
    'Every person has a unique relationship with money...',
    'Preparing your personalized dashboard...'
  ],

  // ─── Dashboard → Tool Launch ─────────────────────────────────────

  tool1_launch: [
    'Preparing your Core Strategy Assessment...',
    'This tool reveals how early experiences shape financial decisions...',
    'Everyone has a dominant pattern — yours holds the key to change...',
    'Understanding your core strategy is the foundation of everything...',
    'Take your time with each question — there are no wrong answers...',
    'Loading your personalized assessment...'
  ],

  tool2_launch: [
    'Preparing your Financial Clarity Assessment...',
    'This tool maps your relationship with money across five domains...',
    'Honest reflection creates the clearest financial insights...',
    'Your numbers tell a story — we are here to help you read it...',
    'Financial clarity is the first step to lasting change...',
    'Loading your personalized assessment...'
  ],

  tool3_launch: [
    'Preparing your Identity and Validation Assessment...',
    'This tool explores the beliefs that drive your financial choices...',
    'Who you believe you are shapes every dollar decision you make...',
    'Self-worth and money are more connected than most people realize...',
    'Understanding your authentic self unlocks financial clarity...',
    'Loading your personalized assessment...'
  ],

  tool4_launch: [
    'Preparing your Financial Freedom Calculator...',
    'This tool builds your personalized budget allocation...',
    'Your ideal money split is unique to your situation and values...',
    'Financial freedom starts with intentional allocation...',
    'Every dollar has a purpose — we are helping you find it...',
    'Loading your personalized calculator...'
  ],

  tool5_launch: [
    'Preparing your Love and Connection Assessment...',
    'This tool reveals how relationships shape your finances...',
    'How you give and receive love directly affects how you handle money...',
    'Healthy financial boundaries start with healthy connections...',
    'Understanding your relational patterns unlocks financial wholeness...',
    'Loading your personalized assessment...'
  ],

  tool6_launch: [
    'Preparing your Retirement Blueprint Calculator...',
    'This tool designs your tax-optimized retirement strategy...',
    'The right vehicle choice can save tens of thousands in taxes...',
    'Your investor profile shapes your optimal allocation...',
    'Smart retirement planning is built on self-awareness...',
    'Loading your personalized calculator...'
  ],

  tool7_launch: [
    'Preparing your Security and Control Assessment...',
    'This tool explores how control patterns shape your finances...',
    'The need for control often creates the opposite of security...',
    'Understanding your relationship with trust opens new possibilities...',
    'Fear-based decisions limit growth — awareness changes everything...',
    'Loading your personalized assessment...'
  ],

  tool8_launch: [
    'Preparing your Investment Planning Tool...',
    'This tool helps you build a plan you will actually follow...',
    'The best investment plan accounts for your psychology, not just math...',
    'Time and consistency matter more than perfect timing...',
    'Your pattern wants to interfere — we are planning for that...',
    'Loading your personalized calculator...'
  ],

  // ─── Form Page Submissions ───────────────────────────────────────

  tool1_submit: [
    'Saving your responses...',
    'Your honesty creates more accurate insights...',
    'Each answer adds depth to your financial profile...',
    'Processing your input...',
    'Preparing the next section...',
    'Your progress is being saved securely...'
  ],

  tool2_submit: [
    'Saving your financial reflections...',
    'Your clarity creates better recommendations...',
    'Processing your responses...',
    'Every detail contributes to your financial picture...',
    'Preparing the next section...',
    'Your insights are being recorded...'
  ],

  tool3_submit: [
    'Saving your responses...',
    'Processing your identity reflections...',
    'Your authenticity leads to deeper insights...',
    'Preparing the next section...',
    'Recording your grounding assessment...',
    'Your progress is being saved...'
  ],

  tool5_submit: [
    'Saving your responses...',
    'Processing your connection reflections...',
    'Your openness leads to meaningful insights...',
    'Preparing the next section...',
    'Recording your grounding assessment...',
    'Your progress is being saved...'
  ],

  tool7_submit: [
    'Saving your responses...',
    'Processing your security reflections...',
    'Your awareness creates space for growth...',
    'Preparing the next section...',
    'Recording your grounding assessment...',
    'Your progress is being saved...'
  ],

  // ─── Final Submission → Report Generation ────────────────────────

  tool1_report: [
    'Analyzing your core strategy patterns...',
    'Connecting your responses to financial behaviors...',
    'Building your personalized insight report...',
    'Identifying key areas for growth and awareness...',
    'Generating actionable recommendations...',
    'Preparing your comprehensive results...'
  ],

  tool2_report: [
    'Analyzing your financial clarity patterns...',
    'Mapping emotional patterns to money behaviors...',
    'Building your personalized financial reflection...',
    'Identifying your key financial strengths...',
    'Generating your detailed report...',
    'Preparing actionable next steps...'
  ],

  tool3_report: [
    'Analyzing your identity and validation patterns...',
    'Mapping how self-perception affects financial choices...',
    'Building your personalized grounding report...',
    'Identifying disconnection patterns worth addressing...',
    'Generating your detailed insights...',
    'Preparing your comprehensive results...'
  ],

  tool5_report: [
    'Analyzing your love and connection patterns...',
    'Mapping how relational dynamics affect financial choices...',
    'Building your personalized grounding report...',
    'Identifying connection patterns worth exploring...',
    'Generating your detailed insights...',
    'Preparing your comprehensive results...'
  ],

  tool7_report: [
    'Analyzing your security and control patterns...',
    'Mapping how trust dynamics affect financial choices...',
    'Building your personalized grounding report...',
    'Identifying control patterns worth examining...',
    'Generating your detailed insights...',
    'Preparing your comprehensive results...'
  ],

  // ─── PDF Downloads ───────────────────────────────────────────────

  tool1_pdf: [
    'Formatting your Core Strategy report for download...',
    'Laying out your personalized insights...',
    'Building charts and visual summaries...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool2_pdf: [
    'Formatting your Financial Clarity report for download...',
    'Laying out your financial domain analysis...',
    'Building charts and visual summaries...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool3_pdf: [
    'Formatting your Identity and Validation report...',
    'Laying out your grounding assessment results...',
    'Building subdomain analysis charts...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool4_pdf: [
    'Formatting your Financial Freedom report...',
    'Laying out your budget allocation analysis...',
    'Building priority and scenario comparisons...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool5_pdf: [
    'Formatting your Love and Connection report...',
    'Laying out your grounding assessment results...',
    'Building subdomain analysis charts...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool6_pdf: [
    'Formatting your Retirement Blueprint report...',
    'Laying out your vehicle allocation strategy...',
    'Building projection charts and comparisons...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool7_pdf: [
    'Formatting your Security and Control report...',
    'Laying out your grounding assessment results...',
    'Building subdomain analysis charts...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  tool8_pdf: [
    'Formatting your Investment Planning report...',
    'Laying out your scenario analysis...',
    'Building projection charts and comparisons...',
    'Generating your downloadable PDF...',
    'Finalizing your report document...',
    'Almost ready for download...'
  ],

  // ─── Dashboard Return ────────────────────────────────────────────

  dashboard_return: [
    'Saving your progress...',
    'Your work is safely stored...',
    'Preparing your dashboard overview...',
    'Updating your completion status...',
    'Loading your personalized view...',
    'Almost there...'
  ],

  // ─── Collective Results / Capstone ────────────────────────────────

  capstone_analysis: [
    'Analyzing patterns across all your tools...',
    'Connecting psychological strategies to financial decisions...',
    'Identifying cross-tool contradictions and opportunities...',
    'Building your personalized financial story...',
    'Drawing conclusions from your complete assessment data...',
    'Generating actionable insights...'
  ],

  integration_pdf: [
    'Analyzing your psychological patterns...',
    'Did you know? Your dominant trauma strategy shapes how you budget, save, and invest.',
    'Cross-referencing your financial behaviors with your beliefs...',
    'Tip: Awareness of your patterns is the first step to changing them.',
    'Building your personalized narrative...',
    'Insight: The gap between what you believe and how you act reveals where growth happens.',
    'Assembling your capstone report...',
    'Tip: Share this report with your coach to get the most out of your next session.',
    'Finalizing your PDF...'
  ],

  // ─── Helper ──────────────────────────────────────────────────────

  /**
   * Safe accessor with fallback
   * @param {string} category - Message category key
   * @param {string} [fallback] - Fallback message if category not found
   * @returns {Array<string>} Message array
   */
  get: function(category, fallback) {
    return this[category] || [fallback || 'Loading...'];
  }
};
