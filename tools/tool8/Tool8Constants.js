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

/**
 * Phase 6: Trauma pattern insight definitions (investment-specific)
 * Each pattern has investment-context content for the collapsible insight section.
 * Based on Integration Plan Section 4.3
 */
const TOOL8_TRAUMA_INSIGHTS = {
  FSV: {
    name: 'False Self-View',
    icon: '\uD83C\uDFAD',
    type: 'Disconnection from Self (Active)',
    pattern: 'You may set unrealistic savings goals to prove your worth, or avoid looking at the numbers when results feel "not good enough." There can be a tendency to swing between over-ambitious targets and complete avoidance.',
    watchFor: 'Contributions you cannot sustain long-term, avoiding the calculator when results feel inadequate, setting goals based on what you think you should do rather than what is realistic.',
    healing: 'Progress matters more than perfection. Any starting point is valid. A plan you can actually follow beats an impressive plan you abandon.'
  },
  ExVal: {
    name: 'External Validation',
    icon: '\uD83D\uDC65',
    type: 'Disconnection from Self (Passive)',
    pattern: 'You may chase returns others brag about or feel inadequate comparing your balance to peers. Investment decisions can be driven by what sounds impressive rather than what fits your situation.',
    watchFor: 'Adjusting your risk dial based on what others are doing, shame about your current balance, difficulty committing to a strategy because someone might know a better one.',
    healing: 'Your timeline is unique. Build for YOUR life, not for the highlight reels of others. The best investment plan is the one aligned with your actual goals.'
  },
  Showing: {
    name: 'Issues Showing Love',
    icon: '\uD83D\uDC9D',
    type: 'Disconnection from Others (Active)',
    pattern: 'You may deprioritize your own investments to fund others. Guilt about building personal wealth while people you love have needs can make it hard to commit to consistent saving.',
    watchFor: 'Setting contributions to zero because others need the money, feeling guilty about saving for yourself, redirecting investment funds to help family or friends.',
    healing: 'Securing your future IS an act of love for those who depend on you. You cannot pour from an empty cup. Building your security enables sustainable generosity.'
  },
  Receiving: {
    name: 'Issues Receiving Love',
    icon: '\uD83D\uDEE1\uFE0F',
    type: 'Disconnection from Others (Passive)',
    pattern: 'You may hoard cash from distrust or refuse professional guidance. Over-emphasis on "safe" low-return options and resistance to accepting the pre-populated data from your earlier work.',
    watchFor: 'Over-emphasis on very low risk options, refusing to use pre-filled data from your earlier tools, resistance to guidance or collaborative planning.',
    healing: 'Receiving support builds strength, not dependency. The data from your earlier tools is here to help you, not control you. Accepting a starting point is wisdom, not weakness.'
  },
  Control: {
    name: 'Control Leading to Isolation',
    icon: '\uD83C\uDFAF',
    type: 'Disconnection from Greater Purpose (Active)',
    pattern: 'You may obsessively run scenarios without committing to one. Tweaking every number, changing every default, and finding that "good enough" is never acceptable can prevent you from taking action.',
    watchFor: 'Running dozens of scenarios without saving any, tweaking every parameter including advanced settings, inability to accept a plan as sufficient.',
    healing: 'A good-enough plan executed consistently beats a perfect plan never started. Set your plan, commit to it, and trust the process.'
  },
  Fear: {
    name: 'Fear Leading to Isolation',
    icon: '\uD83D\uDE30',
    type: 'Disconnection from Greater Purpose (Passive)',
    pattern: 'You may keep the risk dial too low, focus only on worst-case outcomes, or avoid saving a plan because making it real feels too frightening. Long time horizons can feel threatening rather than empowering.',
    watchFor: 'Risk dial locked at 0-2 despite a long time horizon, focusing only on worst-case feasibility messages, closing the tool without saving a scenario.',
    healing: 'Long-term investing has historically rewarded patience. Your time horizon is your greatest asset. Small, consistent steps build both wealth and confidence.'
  }
};

/**
 * Phase 6: Contextual warning definitions (subdomain-triggered)
 * Warnings fire when a specific subdomain quotient > 50 AND user exhibits the trigger behavior.
 * Based on Integration Plan Appendix D
 *
 * Key structure:
 *   tool: which tool scoring to check (tool3Scoring, tool5Scoring, tool7Scoring)
 *   subdomain: the subdomainQuotients key to check
 *   threshold: quotient value that must be exceeded (default 50)
 *   message: the warning text shown to the user
 *   trigger: description of what user action triggers this (for client-side detection)
 */
var TOOL8_CONTEXTUAL_WARNINGS = {
  // Tool 3 subdomains (FSV / ExVal behaviors)
  '3_1_1': {
    tool: 'tool3Scoring',
    subdomain: 'subdomain_1_1',
    theme: 'I am Not Worthy of Financial Freedom',
    trigger: 'avoidance',
    message: 'In your earlier work, you identified a pattern of feeling unworthy of financial security. Building this plan is direct evidence that you ARE worthy of a secure future.'
  },
  '3_1_2': {
    tool: 'tool3Scoring',
    subdomain: 'subdomain_1_2',
    theme: 'I will Never Have Enough',
    trigger: 'unrealistic_target',
    message: 'In your grounding work, you explored the belief that it will never be enough. This plan does not need to be perfect — it needs to be real and achievable.'
  },
  '3_1_3': {
    tool: 'tool3Scoring',
    subdomain: 'subdomain_1_3',
    theme: 'I Cannot See My Financial Reality',
    trigger: 'skip_review',
    message: 'You have done the work of building financial clarity. Trust the numbers from your earlier tools — they are YOUR reality.'
  },
  '3_2_1': {
    tool: 'tool3Scoring',
    subdomain: 'subdomain_2_1',
    theme: 'Money Shows My Worth',
    trigger: 'inflate_assets',
    message: 'In your grounding work, you explored the connection between money and self-worth. Accurate numbers serve you better than impressive ones.'
  },
  '3_2_2': {
    tool: 'tool3Scoring',
    subdomain: 'subdomain_2_2',
    theme: 'What Will They Think?',
    trigger: 'hesitate_save',
    message: 'This plan is for you, not for anyone else\'s approval. Save it — no one sees it but you.'
  },
  '3_2_3': {
    tool: 'tool3Scoring',
    subdomain: 'subdomain_2_3',
    theme: 'I Need to Prove Myself',
    trigger: 'max_risk',
    message: 'In your earlier work, you identified a pattern of needing to prove yourself. A sustainable plan proves more than an aggressive one.'
  },

  // Tool 5 subdomains (Showing / Receiving behaviors)
  '5_1_1': {
    tool: 'tool5Scoring',
    subdomain: 'subdomain_1_1',
    theme: 'I Must Give to Be Loved',
    trigger: 'zero_contribution',
    message: 'In your grounding work, you explored the pattern of giving to others before yourself. Investing in your future IS an act of love for those who depend on you.'
  },
  '5_1_2': {
    tool: 'tool5Scoring',
    subdomain: 'subdomain_1_2',
    theme: 'Their Needs > My Needs',
    trigger: 'low_contribution',
    message: 'You identified a pattern of putting others\' needs first. Even a small amount directed toward your own future matters.'
  },
  '5_1_3': {
    tool: 'tool5Scoring',
    subdomain: 'subdomain_1_3',
    theme: 'I Cannot Accept Help',
    trigger: 'override_all_prepop',
    message: 'In your earlier work, you explored difficulty accepting help. The data from your earlier tools is here to support you — not control you.'
  },
  '5_2_1': {
    tool: 'tool5Scoring',
    subdomain: 'subdomain_2_1',
    theme: 'I Cannot Make It Alone',
    trigger: 'instant_save',
    message: 'You have the knowledge to customize this plan. Trust your own judgment — review the numbers and make them yours.'
  },
  '5_2_2': {
    tool: 'tool5Scoring',
    subdomain: 'subdomain_2_2',
    theme: 'I Owe Them Everything',
    trigger: 'pdf_only',
    message: 'Context available for PDF report only.'
  },
  '5_2_3': {
    tool: 'tool5Scoring',
    subdomain: 'subdomain_2_3',
    theme: 'I Stay in Debt',
    trigger: 'pdf_only',
    message: 'Context available for PDF report only.'
  },

  // Tool 7 subdomains (Control / Fear behaviors)
  '7_1_1': {
    tool: 'tool7Scoring',
    subdomain: 'subdomain_1_1',
    theme: 'I Undercharge and Give Away',
    trigger: 'lower_income',
    message: 'In your grounding work, you explored undervaluing yourself. Your Tool 4 income data reflects your real earning power — trust it.'
  },
  '7_1_2': {
    tool: 'tool7Scoring',
    subdomain: 'subdomain_1_2',
    theme: 'I Have Money But Will Not Use It',
    trigger: 'zero_assets',
    message: 'You identified a pattern of having resources but not deploying them. Your existing assets are the foundation of this plan.'
  },
  '7_1_3': {
    tool: 'tool7Scoring',
    subdomain: 'subdomain_1_3',
    theme: 'Only I Can Do It Right',
    trigger: 'change_everything',
    message: 'You explored the need to control everything yourself. The pre-populated values are a starting point — not a cage.'
  },
  '7_2_1': {
    tool: 'tool7Scoring',
    subdomain: 'subdomain_2_1',
    theme: 'I Do Not Protect Myself',
    trigger: 'zero_inflation',
    message: 'In your earlier work, you identified a pattern of not protecting yourself. Running a conservative scenario is an act of self-protection.'
  },
  '7_2_2': {
    tool: 'tool7Scoring',
    subdomain: 'subdomain_2_2',
    theme: 'I Sabotage Success',
    trigger: 'reset_after_plan',
    message: 'You identified a pattern of pulling back when things start working. This plan IS the breakthrough — staying with it is the work.'
  },
  '7_2_3': {
    tool: 'tool7Scoring',
    subdomain: 'subdomain_2_3',
    theme: 'I Trust the Wrong People',
    trigger: 'pdf_only',
    message: 'Context available for PDF report only.'
  }
};

/**
 * Phase 6: Backup question definitions (when Tool 1 is missing)
 * Same 3 questions used by Tool 4 and Tool 6, with majority voting.
 */
var TOOL8_BACKUP_QUESTIONS = [
  {
    field: 'backup_stressResponse',
    label: 'When money stress hits, what is your typical first response?',
    help: 'Think about your automatic reaction when finances feel tight or uncertain.',
    options: [
      { value: 'FSV', text: 'I create confusion or ignore the numbers to avoid seeing how bad things are' },
      { value: 'ExVal', text: 'I worry about what others will think or hide my situation from people' },
      { value: 'Showing', text: 'I find ways to help others anyway, even if it hurts my own finances' },
      { value: 'Receiving', text: 'I look to others to fix it or take over my financial decisions' },
      { value: 'Control', text: 'I tighten control on everything, even going without things I need' },
      { value: 'Fear', text: 'I freeze up or make decisions that seem to make things worse' }
    ]
  },
  {
    field: 'backup_coreBelief',
    label: 'Which statement feels most true about money for you?',
    help: 'Choose the one that resonates most deeply, even if uncomfortable.',
    options: [
      { value: 'FSV', text: 'If I had more money, I would finally feel safe' },
      { value: 'ExVal', text: 'How much money I have affects how others see me' },
      { value: 'Showing', text: 'Giving to others, even when it hurts me, is how I show love' },
      { value: 'Receiving', text: 'I need others to help with my finances because I cannot handle it alone' },
      { value: 'Control', text: 'I must control every dollar or things will fall apart' },
      { value: 'Fear', text: 'No matter what I do, something bad will probably happen with money' }
    ]
  },
  {
    field: 'backup_consequence',
    label: 'What financial pattern do you notice repeating in your life?',
    help: 'Look at the outcomes that keep showing up, not what you intend to happen.',
    options: [
      { value: 'FSV', text: 'I never seem to have money when I need it, even when I earn enough' },
      { value: 'ExVal', text: 'I spend money on image or hide my situation to manage how others see me' },
      { value: 'Showing', text: 'I take on other people\'s financial burdens or refuse repayment when offered' },
      { value: 'Receiving', text: 'I become dependent on others or rack up debt that creates obligation' },
      { value: 'Control', text: 'I have money but do not charge my worth, collect what I am owed, or spend on myself' },
      { value: 'Fear', text: 'I trust the wrong people or skip protections, and then bad things happen' }
    ]
  }
];
