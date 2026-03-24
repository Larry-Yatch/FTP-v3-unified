// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Application configuration settings
 */
const CONFIG = {
  ADMIN_EMAIL: 'Sarah.L@TruPathMastery.com',
  SPREADSHEET_ID: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
  /**
   * Minimum savings rate for "ideal" allocation recommendations.
   * This ensures all users see an ideal scenario of at least 20% savings rate,
   * even if they request less. The "actual" allocation respects their request,
   * while "ideal" enforces this minimum.
   * Adjust this value to tune recommendations for real user testing.
   */
  OPTIMIZED_SAVINGS_RATE: 0.20,
  ANNUAL_CESA_LIMIT: 2000
};

/**
 * Future Value calculation configuration
 */
const FV_CONFIG = {
  // Base annual rate when investment score = 1 (8%)
  BASE_RATE: 0.08,
  
  // Additional rate range based on score (12% max additional)
  // Score 1 = 8%, Score 7 = 20%
  MAX_ADDITIONAL_RATE: 0.12,
  
  // Use monthly compounding for more accurate projections
  USE_MONTHLY_COMPOUNDING: true
};

/**
 * Create custom menus when the spreadsheet opens
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Simple test menu first
    ui.createMenu('🔧 Quick Test')
      .addItem('Test Alert', 'testMenuCreation')
      .addToUi();
    
    // Document Generation menu
    ui.createMenu('📄 Document Generation')
      .addItem('🎨 Generate Branded Blueprint', 'generateDocumentBranded')
      .addItem('Generate Safe Blueprint', 'generateDocumentSafe')
      .addSeparator()
      .addItem('Test Document Generation', 'runDocumentGenerationTest')
      .addItem('Test Branding', 'testBranding')
      .addSeparator()
      .addSubMenu(ui.createMenu('🖼️ Logo Setup')
        .addItem('Test Logo Setup', 'testLogoSetup')
        .addItem('Create Sample Logo', 'setupSampleLogo')
        .addItem('Get Logo URL', 'getLogoSharingUrl'))
      .addSeparator()
      .addItem('Legacy: Complete Version', 'generateDocumentComplete')
      .addToUi();
    
    // Reprocess menu - Enhanced with email options
    ui.createMenu('🔄 Reprocess Allocations')
      .addItem('⚡ Quick Test (No Doc/Email)', 'quickTestReprocess')
      .addItem('📝 Test with Options...', 'testReprocessWithPrompt')
      .addSeparator()
      .addItem('🎯 Reprocess Current Row (No Doc)', 'reprocessCurrentRow')
      .addItem('📄 Reprocess + Doc (No Email)', 'testReprocessSingleRow')
      .addSeparator()
      .addItem('⚠️ Reprocess ALL Rows', 'reprocessAllRows')
      .addItem('📄 Regenerate ALL Documents', 'regenerateAllDocuments')
      .addToUi();
    
    // Testing menu
    ui.createMenu('🧪 Testing')
      .addItem('Test All Profiles', 'testAllProfiles')
      .addSeparator()
      .addItem('Profile 2: W-2 Employee', 'testProfile2W2')
      .addItem('Profile 2: Self-Employed', 'testProfile2Self')
      .addItem('Profile 2: All Scenarios', 'testProfile2All')
      .addSeparator()
      .addItem('Profile 4: High Income', 'testProfile4HighIncome')
      .addItem('Profile 4: Low Income', 'testProfile4LowIncome')
      .addItem('Profile 4: All Scenarios', 'testProfile4All')
      .addSeparator()
      .addItem('Profile 7: Young Pro', 'testProfile7YoungPro')
      .addItem('Profile 7: Family', 'testProfile7Family')
      .addItem('Profile 7: All Scenarios', 'testProfile7All')
      .addSeparator()
      .addItem('Test Universal Engine', 'testUniversalEngine')
      .addItem('Verify Columns', 'verifyWorkingSheetColumns')
      .addItem('Validate Headers', 'validateHeaders')
      .addToUi();
  } catch (error) {
    console.error('Error in onOpen:', error);
  }
}

// Simple test function
function testMenuCreation() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Menu Test', 'The menu system is working!', ui.ButtonSet.OK);
}

/**
 * IRS contribution limits for various investment vehicles
 */
const LIMITS = {
  RETIREMENT: {
    EMPLOYEE_401K: 23500,
    CATCHUP_401K_50: 7500,
    CATCHUP_401K_60: 11250,
    TOTAL_401K_457_403B: 70000,
    TOTAL_50_59_64: 77500,
    TOTAL_60_63: 81250,
    TRADITIONAL_IRA: 7000,
    ROTH_IRA: 7000,
    CATCHUP_IRA: 1000,
    DEFINED_BENEFIT: 280000,
    // Roth IRA income phase-out limits for 2025
    ROTH_IRA_PHASE_OUT: {
      SINGLE: {
        START: 146000,
        END: 161000
      },
      MARRIED_FILING_JOINTLY: {
        START: 230000,
        END: 240000
      }
    }
  },
  EDUCATION: {
    CESA_COMBINED: Infinity
  },
  HEALTH: {
    HSA: {
      INDIVIDUAL: 4300,
      FAMILY: 8550,
      CATCHUP: 1000
    }
  },
  OTHER: {
    ALTERNATIVE_INVESTMENTS: Infinity,
    ROTH_CONVERSION: Infinity
  },
  DEFAULTS: {
    ANNUAL_PROFIT_DISTRIBUTION: 100000,
    GROSS_ANNUAL_INCOME: 100000,
    QCD_ANNUAL_LIMIT: 100000
  }
};


/**
 * For each ProfileID, defines:
 *  • title           — for narrative
 *  • description     — for Phase 2 form description
 *  • extraQuestions  — prompts to re-pair with answers
 *  • formId          — your Phase 2 form’s ID
 *  • entryToken      — the prefill entry.<token>
 *  • Vehicle Order   — the optional vehicles and order of funding
 */
// === PROFILE CONFIGURATION ===
/*** PROFILE CONFIGURATION ***/
const PROFILE_CONFIG = {
  '1_ROBS_In_Use': {
    title:       'ROBS-In-Use Strategist',
    description: 'Already has a C-corp + ROBS retirement plan, funding a Solo 401(k) with business revenue.',
    extraQuestions: [
      'Describe how your ROBS strategy is currently structured:',
      'How are your business profits routed into your Solo 401(k)?',
      'Which type of contributions are you making? (Roth only / Traditional only / Both)',
      'How often do you contribute to your Solo 401(k)? (Monthly, Quarterly, etc.)',
      'Do you also contribute to a Roth IRA? If yes, how much per year to each?',
      'Approximately how much do you expect your business to distribute to your Solo 401(k) each year?'
    ],
    formId:     '1FAIpQLSfnAJLDoJHGOJx0LdAVrue-6vn00enirAx4Wz_mWcjnELoRCw',
    entryToken: 'entry.641505166',
    vehicleOrder_Retirement: [
      { name: 'ROBS Solo 401(k) – Profit Distribution', capMonthly: Infinity },
      { name: 'ROBS Solo 401(k) – Roth',                capMonthly: LIMITS.RETIREMENT.EMPLOYEE_401K / 12 },
      { name: 'HSA',                                    capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL  / 12 },
      { name: 'ROBS Solo 401(k) – Traditional',         capMonthly: LIMITS.RETIREMENT.EMPLOYEE_401K / 12 },
      { name: 'Roth IRA',                               capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
      
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },  // overwritten at runtime
      { name: 'Roth IRA',      capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '2_ROBS_Curious': {
    title:       'ROBS-Curious Builder',
    description: 'Interested in ROBS but has not implemented it yet; wants to leverage business income for retirement growth.',
    extraQuestions: [
      'What is the approximate balance you plan to rollover initially into your ROBS-funded C-corp?',
      'What is your expected annual business income available for retirement savings? (Enter total amount you can save from your business)',
      'Do you have access to an employer-sponsored retirement plan (401k, 403b, etc.)?',
      'If yes, does your employer offer matching contributions?',
      'If yes, what percentage does your employer match?',
      'Does your plan offer a Roth 401(k) option?',
      'If you have a business, does your spouse work in your business (or plan to)?'
    ],
    formId:     '1FAIpQLSchOqMFkphypcStnZ92i-oWhQ_Oysn4gIiWimJYVt3e-sjhXQ',
    entryToken: 'entry.110058618',
    // Note: vehicleOrder_Retirement is dynamically generated in profile helper based on employment situation
    vehicleOrder_Retirement: [
      // Dynamic - see profileHelpers['2_ROBS_Curious'] for logic
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'Roth IRA',      capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '3_Solo401k_Builder': {
    title:       'Solo 401(k) Builder',
    description: 'Self-employed or 1099 contractor who wants to set up or optimize a Solo 401(k).',
    extraQuestions: [
      'What kind of business do you run? (Sole Prop / LLC / S-Corp / C-Corp)',
      'Do you have any employees besides yourself (and your spouse)?',
      'Have you already set up a Solo 401(k) plan?',
      'If yes, how much per year will you contribute as employee? (USD)',
      'If yes, how much per year will your business contribute as employer? (USD)',
      'About how much can you put into this plan from your business each year?'
    ],
    formId:     '1FAIpQLSdU_sA5SmTnGffw4Nqy2p7c0KuLh7kZoLj94Ctm0h4ojRoFfw',
    entryToken: 'entry.79994550',
    vehicleOrder_Retirement: [
      { name: 'Solo 401(k) – Employee', capMonthly: LIMITS.RETIREMENT.EMPLOYEE_401K / 12 },
      { name: 'Solo 401(k) – Employer', capMonthly: LIMITS.RETIREMENT.TOTAL_401K_457_403B / 12 },
      { name: 'HSA',                    capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 },
      { name: 'Roth IRA',               capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'Roth IRA',      capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '4_Roth_Reclaimer': {
    title:       'Roth IRA Reclaimer',
    description: 'High-earner who seeks backdoor Roth or IRA consolidation.',
    extraQuestions: [
      'What is the current balance in your Traditional IRA or other old retirement account?',
      'Does your employer 401(k) plan accept incoming IRA rollovers?',
      'Does your employer offer a 401(k) retirement plan?',
      'Does your employer match your 401(k) contributions?',
      'What percentage does your employer match?',
      'Does your employer 401(k) plan have a Roth option?'
    ],
    formId:     '1FAIpQLSdbKrRSMkQNnlS-Sv5eHADLRCLV29UH7KXLkYdXQVJ689ZSpQ',
    entryToken: 'entry.1488387721',
    vehicleOrder_Retirement: [
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 },
      { name: 'HSA',               capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA',       capMonthly: Infinity },
      { name: 'Backdoor Roth IRA',   capMonthly: LIMITS.RETIREMENT.ROTH_IRA   / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '5_Bracket_Strategist': {
    title:       'Bracket-Balanced Strategist',
    description: 'Focus on current tax reduction with flexibility for future Roth conversions.',
    extraQuestions: [
      'Do you have access to an employer-sponsored retirement plan (401k, 403b, etc.)?',
      'If yes, does your employer offer matching contributions?',
      'If yes, what percentage does your employer match?',
      'Does your plan offer a Roth 401(k) option?'
    ],
    formId:     '1FAIpQLSc10zXxJ-aWWzjp8Dk70joUiPOCT47EWvYqrOWMdI0J9WMUYA',
    entryToken: 'entry.383767276',
    vehicleOrder_Retirement: [
      { name: 'Traditional 401(k)', capMonthly: LIMITS.RETIREMENT.EMPLOYEE_401K     / 12 },
      { name: 'Traditional IRA',    capMonthly: LIMITS.RETIREMENT.TRADITIONAL_IRA / 12 },
      { name: 'HSA',                capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL   / 12 },
      { name: 'Roth IRA',           capMonthly: LIMITS.RETIREMENT.ROTH_IRA       / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'Traditional IRA', capMonthly: LIMITS.RETIREMENT.TRADITIONAL_IRA / 12 },
      { name: 'Roth IRA',        capMonthly: LIMITS.RETIREMENT.ROTH_IRA       / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '6_Catch_Up': {
    title:       'Catch-Up Visionary',
    description: 'Age 50+ who wants aggressive, tax-smart catch-up planning.',
    extraQuestions: [
      'Do you have access to an employer-sponsored retirement plan (401k, 403b, etc.)?',
      'If yes, does your employer offer matching contributions?',
      'If yes, what percentage does your employer match?',
      'Does your plan offer a Roth 401(k) option?'
    ],
    formId:     '1FAIpQLSeTZgJ05mFpsu8dkckLEvHjXtKaPCg0-TOPMMYafjl1_XZwPg',
    entryToken: 'entry.859920868',
    vehicleOrder_Retirement: [
      { name: '401(k) Catch-Up', capMonthly: (LIMITS.RETIREMENT.EMPLOYEE_401K + LIMITS.RETIREMENT.CATCHUP_401K_50) / 12 },
      { name: 'IRA Catch-Up',    capMonthly: (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12 },
      { name: 'HSA',             capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL                      / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'IRA Catch-Up',  capMonthly: (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '7_Foundation_Builder': {
    title:       'Foundation Builder',
    description: 'Standard investor building retirement foundation. May have employer 401(k) or Roth accounts.',
    extraQuestions: [
      'Do you have access to an employer-sponsored retirement plan (401k, 403b, etc.)?',
      'If yes, does your employer offer matching contributions?',
      'If yes, what percentage does your employer match?',
      'Does your plan offer a Roth 401(k) option?'
    ],
    formId:     '1FAIpQLSc4oMG-yUnGnucmWLcx9trxMXIp2DWwVZijbp0OfTtQ3f8wqg',
    entryToken: 'entry.188501795',
    vehicleOrder_Retirement: [
      // Note: Employer 401(k) vehicles are dynamically added if available
      { name: 'Roth IRA',            capMonthly: LIMITS.RETIREMENT.ROTH_IRA                / 12 },
      { name: 'Traditional IRA',     capMonthly: LIMITS.RETIREMENT.TRADITIONAL_IRA          / 12 },
      { name: 'Backdoor Roth IRA',   capMonthly: LIMITS.RETIREMENT.ROTH_IRA                / 12 },
      { name: 'HSA',                 capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL              / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'Roth IRA',      capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA', capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '8_Biz_Owner_Group': {
    title:       'Business Owner with Employee Group',
    description: 'Owns one or more businesses with W-2 employees; seeking advanced or defined-benefit strategies.',
    extraQuestions: [
      'How many W-2 employees do you have (not including you or your spouse)? [This helps determine plan requirements and administrative complexity]',
      'What is the average age of your employees? [Age differences between you and employees can unlock powerful defined benefit strategies worth $100k+ in annual tax savings]',
      'What is the average annual salary of your employees? [This helps calculate discrimination testing requirements and optimal contribution strategies]',
      'Do you currently have a retirement plan for your business? (Yes/No) [We\'ll build on existing plans or recommend new ones]',
      'What type of retirement plan(s) do you currently have? (None, 401(k), Profit Sharing, Defined Benefit, Cash Balance, SEP-IRA, SIMPLE-IRA, Other) [Different plans have different rules and combination opportunities]',
      'How much do you contribute annually to retirement plans (employer + employee contributions)? [We\'ll optimize from your current baseline]'
    ],
    formId:     '1FAIpQLScWP0EfDPcO46vRywpc0rkzuorCQJh0DCzeJs8EcDxAMrPC7A',
    entryToken: 'entry.568866179',
    vehicleOrder_Retirement: [
      { name: 'Group 401(k) – Employee', capMonthly: LIMITS.RETIREMENT.EMPLOYEE_401K / 12 },
      { name: 'Group 401(k) – Employer', capMonthly: LIMITS.RETIREMENT.TOTAL_401K_457_403B / 12 },
      { name: 'Defined Benefit Plan',    capMonthly: LIMITS.RETIREMENT.DEFINED_BENEFIT   / 12 },
      { name: 'HSA',                     capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL       / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'Roth IRA',      capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA',          capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  },

  '9_Late_Stage_Growth': {
    title:       'Late-Stage Growth Strategist',
    description: 'Near-retirement with sizable savings; interested in alts like real estate or private equity.',
    extraQuestions: [
      'Do you have access to an employer-sponsored retirement plan (401k, 403b, etc.)?',
      'If yes, does your employer offer matching contributions?',
      'If yes, what percentage does your employer match?',
      'Does your plan offer a Roth 401(k) option?'
    ],
    formId:     '1FAIpQLSeuw5G3w75vLZl0uJtA9zEs4GuEF5XYoNc3h0zz0fB8mBVh2A',
    entryToken: 'entry.58001264',
    vehicleOrder_Retirement: [
      { name: '401(k) Catch-Up', capMonthly: (LIMITS.RETIREMENT.EMPLOYEE_401K + LIMITS.RETIREMENT.CATCHUP_401K_50) / 12 },
      { name: 'IRA Catch-Up',    capMonthly: (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12 },
      { name: 'HSA',                        capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ],
    vehicleOrder_Education: [
      { name: 'Combined CESA', capMonthly: Infinity },
      { name: 'Roth IRA',      capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12 },
      { name: 'Backdoor Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA     / 12 }
    ],
    vehicleOrder_Health: [
      { name: 'HSA',          capMonthly: LIMITS.HEALTH.HSA.INDIVIDUAL / 12 }
    ]
  }
};

// end PROFILE_CONFIG

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT FORM DATA - EMBEDDED EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Current form structures exported from Google Forms
 * This section gets automatically updated by updateEmbeddedFormData()
 * DO NOT EDIT MANUALLY - Use updateEmbeddedFormData() to refresh
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT FORMS SUMMARY - OPTIMIZATION DATA
// ═══════════════════════════════════════════════════════════════════════════════

const CURRENT_FORMS_SUMMARY = {
  lastAnalyzed: "2025-08-12T06:18:55.748Z",
  totalForms: 10,
  phase1Questions: 46,
  phase2QuestionsPerProfile: "46-50 questions each",
  
  universalQuestions: [
    "Full Name", "Email", "Student Identifier", "Current Age", "Gross Annual Income",
    "Net Monthly Income", "Filing Status", "Tax Minimization Preference",
    "HSA Eligibility", "Number of Children", "Retirement Catch-up Eligibility",
    "Investment Involvement", "Investment Time Horizon", "Investment Confidence",
    "Retirement Importance", "Years Until Retirement", "Education Importance",
    "Years Until Education Need", "Health Importance", "Years Until Health Need"
  ],
  
  profileSpecificSeeds: {
    "1_ROBS_In_Use": ["Current ROBS Profit", "Monthly HSA Contribution", "Monthly CESA Contribution"],
    "2_ROBS_Curious": ["Monthly HSA Contribution", "Monthly CESA Contribution"],
    "3_Solo401k_Builder": ["Solo 401k Employee Contribution", "Monthly HSA Contribution"],
    "4_Roth_Reclaimer": ["Current Roth IRA Balance", "Monthly HSA Contribution"],
    "5_Bracket_Strategist": ["Current 401k Balance", "Monthly HSA Contribution", "Monthly CESA Contribution"],
    "6_Catch_Up": ["Current Retirement Balance", "Monthly HSA Contribution"],
    "7_Foundation_Builder": ["Emergency Fund Amount", "Monthly HSA Contribution"],
    "8_Biz_Owner_Group": ["Business Retirement Plan", "Monthly HSA Contribution", "Monthly CESA Contribution"],
    "9_Late_Stage_Growth": ["Total Retirement Assets", "Monthly HSA Contribution", "Monthly CESA Contribution"]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT FORMS - REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════
// Complete CURRENT_FORMS data is available from Current_Forms_Full.js
// (In Google Apps Script, all files share global scope)

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE FORMS MANAGEMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Configuration for all forms in the system
 * Add Phase 1 form ID and any additional Phase 2 forms here
 */
const FORM_CONFIG = {
  // Phase 1 form
  PHASE_1: {
    formId: '1w4aPniYDM3oxiT-crPghmn9sYxYaw51sSexktoZJE8A',
    name: 'Phase 1 - Profile Classification',
    type: 'phase1'
  },
  
  // Phase 2 forms - using ACTUAL form IDs (not prefilled response IDs)
  '1_ROBS_In_Use': {
    formId: '1jv_rpG_i6O26BB0TcTtF_pxjYyvIXfA5qXTNPT8uzec',
    name: 'Phase 2 - ROBS-In-Use Strategist',
    type: 'phase2',
    profileId: '1_ROBS_In_Use'
  },
  '2_ROBS_Curious': {
    formId: '1XjpC0o75D4Lgu07hegkK1c5LD47TU6M78Kdywhj8Ao8',
    name: 'Phase 2 - ROBS-Curious Builder',
    type: 'phase2',
    profileId: '2_ROBS_Curious'
  },
  '3_Solo401k_Builder': {
    formId: '1ur5MAwKetidU52v1xQDZSMn5LjefpIQqGbngxLR8dOE',
    name: 'Phase 2 - Solo 401(k) Builder',
    type: 'phase2',
    profileId: '3_Solo401k_Builder'
  },
  '4_Roth_Reclaimer': {
    formId: '1B1VaZanAkzb6QB86knxk9eWhlNFpH-st65pdX__CvnE',
    name: 'Phase 2 - Roth IRA Reclaimer',
    type: 'phase2',
    profileId: '4_Roth_Reclaimer'
  },
  '5_Bracket_Strategist': {
    formId: '15clxf7SsHDxz05m5GetbCRToxb48eMrNk9Dpz4dVFO8',
    name: 'Phase 2 - Bracket-Balanced Strategist',
    type: 'phase2',
    profileId: '5_Bracket_Strategist'
  },
  '6_Catch_Up': {
    formId: '1_GPFDAOkM0QQuJxWfTRNJjLfIW8IwRxwQrfiMvqgJK4',
    name: 'Phase 2 - Catch-Up Visionary',
    type: 'phase2',
    profileId: '6_Catch_Up'
  },
  '7_Foundation_Builder': {
    formId: '1zv6LiVaeW0D9NbsKkCMgo40zcYhzSDlIQq5Zw7IXhuw',
    name: 'Phase 2 - Foundation Builder',
    type: 'phase2',
    profileId: '7_Foundation_Builder'
  },
  '8_Biz_Owner_Group': {
    formId: '1CXFEpBy4XA49CXA7R66lHAosEE5CzANH9Vl6B1opxYQ',
    name: 'Phase 2 - Business Owner with Employee Group',
    type: 'phase2',
    profileId: '8_Biz_Owner_Group'
  },
  '9_Late_Stage_Growth': {
    formId: '1kGGt6z6dovWvzHkSPfmeTg3E5-Lv3gT1hhlDOwUyiik',
    name: 'Phase 2 - Late-Stage Growth Strategist',
    type: 'phase2',
    profileId: '9_Late_Stage_Growth'
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// FORM TEMPLATE SYSTEM - DEFINE IDEAL FORM STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Universal questions that appear in every Phase 2 form
 * These map to the P2_* HEADERS and collect standard data for all profiles
 */
const UNIVERSAL_QUESTIONS = [
  // Personal Information Section
  {
    type: 'SECTION_HEADER',
    title: 'Personal Information',
    helpText: 'Basic information to help us customize your recommendations'
  },
  {
    type: 'TEXT',
    title: 'Full Name',
    helpText: 'Please enter your full name as it appears on your financial accounts',
    required: true,
    headerMapping: 'P2_FULL_NAME'
  },
  {
    type: 'TEXT',
    title: 'Email Address',
    helpText: 'We\'ll use this to send your personalized recommendations',
    required: true,
    headerMapping: 'P2_EMAIL'
  },
  {
    type: 'TEXT',
    title: 'Student Identifier',
    helpText: 'Your unique student identifier (last 4 digits)',
    required: true,
    headerMapping: 'P2_STUDENT_IDENTIFIER'
  },
  {
    type: 'TEXT',
    title: 'Current Age',
    helpText: 'Your current age in years',
    required: true,
    headerMapping: 'P2_CURRENT_AGE'
  },
  {
    type: 'TEXT',
    title: 'Target Retirement Age',
    helpText: 'At what age do you plan to retire?',
    required: true,
    headerMapping: 'P2_TARGET_RETIREMENT_AGE'
  },

  // Investment Profile Section
  {
    type: 'SECTION_HEADER',
    title: 'Investment Profile',
    helpText: 'Help us understand your investment approach and risk tolerance'
  },
  {
    type: 'SCALE',
    title: 'Investment Involvement',
    helpText: 'How involved do you want to be in managing your investments? (1=Hands-off, 7=Very hands-on)',
    lowerBound: 1,
    upperBound: 7,
    leftLabel: 'Hands-off',
    rightLabel: 'Very hands-on',
    required: true,
    headerMapping: 'P2_INV_INVOLVEMENT'
  },
  {
    type: 'SCALE',
    title: 'Time for Investment Research',
    helpText: 'How much time can you dedicate to investment research? (1=No time, 7=Lots of time)',
    lowerBound: 1,
    upperBound: 7,
    leftLabel: 'No time',
    rightLabel: 'Lots of time',
    required: true,
    headerMapping: 'P2_INV_TIME'
  },
  {
    type: 'SCALE',
    title: 'Investment Confidence',
    helpText: 'How confident are you in making investment decisions? (1=Not confident, 7=Very confident)',
    lowerBound: 1,
    upperBound: 7,
    leftLabel: 'Not confident',
    rightLabel: 'Very confident',
    required: true,
    headerMapping: 'P2_INV_CONFIDENCE'
  },

  // Health Savings Account Section
  {
    type: 'SECTION_HEADER',
    title: 'Health Savings Account (HSA)',
    helpText: 'Information about your HSA eligibility and goals'
  },
  {
    type: 'MULTIPLE_CHOICE',
    title: 'HSA Eligibility',
    helpText: 'Are you currently eligible for an HSA (High Deductible Health Plan)?',
    choices: ['Yes', 'No', 'Not sure'],
    required: true,
    headerMapping: 'P2_HSA_ELIGIBILITY'
  },
  {
    type: 'TEXT',
    title: 'Current HSA Balance',
    helpText: 'What is your current HSA balance? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_HSA_CURRENT_BALANCE'
  },
  {
    type: 'TEXT',
    title: 'Current Monthly HSA Contribution',
    helpText: 'How much do you currently contribute to your HSA per month? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_HSA_MONTHLY_CONTRIB'
  },
  {
    type: 'TEXT',
    title: 'Years Until HSA Need',
    helpText: 'In how many years do you expect to start using your HSA for medical expenses?',
    required: false,
    headerMapping: 'P2_HSA_YEARS_UNTIL_NEED'
  },
  {
    type: 'TEXT',
    title: 'HSA Target Balance',
    helpText: 'What HSA balance would you like to have at retirement?',
    required: false,
    headerMapping: 'P2_HSA_TARGET_BALANCE'
  },

  // Education Savings Section
  {
    type: 'SECTION_HEADER',
    title: 'Education Savings (CESA)',
    helpText: 'Information about education savings for children'
  },
  {
    type: 'MULTIPLE_CHOICE',
    title: 'Children or Planning for Children',
    helpText: 'Do you have children or plan to have children whose education you want to fund?',
    choices: ['Yes', 'No'],
    required: true,
    headerMapping: 'P2_HAS_CHILDREN'
  },
  {
    type: 'TEXT',
    title: 'Number of Children',
    helpText: 'How many children do you have or plan to have? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_CESA_NUM_CHILDREN'
  },
  {
    type: 'TEXT',
    title: 'Current CESA Balance',
    helpText: 'What is your current Coverdell ESA balance? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_CESA_CURRENT_BALANCE'
  },
  {
    type: 'TEXT',
    title: 'Current Monthly CESA Contribution',
    helpText: 'How much do you currently contribute to CESA per month? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_CESA_MONTHLY_CONTRIB'
  },
  {
    type: 'TEXT',
    title: 'Total Education Goal',
    helpText: 'What is your total education savings goal across all children?',
    required: false,
    headerMapping: 'P2_CESA_TOTAL_GOAL'
  },
  {
    type: 'TEXT',
    title: 'Years Until First Education Need',
    helpText: 'In how many years will you need to start using education funds?',
    required: false,
    headerMapping: 'P2_CESA_YEARS_UNTIL_FIRST'
  },

  // Retirement Savings Section
  {
    type: 'SECTION_HEADER',
    title: 'Retirement Savings',
    helpText: 'Information about your retirement planning and current savings'
  },
  {
    type: 'TEXT',
    title: 'Current Retirement Balance',
    helpText: 'What is your current total retirement account balance? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_RETIREMENT_CURRENT_BAL'
  },
  {
    type: 'TEXT',
    title: 'Current Monthly Retirement Contribution',
    helpText: 'How much do you currently contribute to retirement accounts per month? (Enter 0 if none)',
    required: false,
    headerMapping: 'P2_RETIREMENT_PERSONAL'
  },
  {
    type: 'TEXT',
    title: 'Years Until Retirement',
    helpText: 'In how many years do you plan to retire?',
    required: true,
    headerMapping: 'P2_RETIREMENT_YEARS'
  },
  {
    type: 'TEXT',
    title: 'Desired Monthly Retirement Income',
    helpText: 'What monthly income would you like to have in retirement?',
    required: false,
    headerMapping: 'P2_RETIREMENT_DESIRED_INC'
  },

  // Goal Importance Section
  {
    type: 'SECTION_HEADER',
    title: 'Goal Priorities',
    helpText: 'Help us understand how important each financial goal is to you'
  },
  {
    type: 'SCALE',
    title: 'Retirement Importance',
    helpText: 'How important is retirement savings to you? (1=Not important, 7=Extremely important)',
    lowerBound: 1,
    upperBound: 7,
    leftLabel: 'Not important',
    rightLabel: 'Extremely important',
    required: true,
    headerMapping: 'P2_RETIREMENT_IMPORTANCE'
  },
  {
    type: 'SCALE',
    title: 'Education Importance',
    helpText: 'How important is education savings to you? (1=Not important, 7=Extremely important)',
    lowerBound: 1,
    upperBound: 7,
    leftLabel: 'Not important',
    rightLabel: 'Extremely important',
    required: true,
    headerMapping: 'P2_EDUCATION_IMPORTANCE'
  },
  {
    type: 'SCALE',
    title: 'Health Importance',
    helpText: 'How important is health savings to you? (1=Not important, 7=Extremely important)',
    lowerBound: 1,
    upperBound: 7,
    leftLabel: 'Not important',
    rightLabel: 'Extremely important',
    required: true,
    headerMapping: 'P2_HEALTH_IMPORTANCE'
  }
];


/**
 * Universal Roth IRA phase-out function
 * Replaces direct Roth IRA with Backdoor Roth when income exceeds limits
 * @param {Array} vehicleOrder - Current vehicle order
 * @param {Object} params - Parameters including grossIncome, filingStatus, taxFocus
 * @returns {Array} Updated vehicle order with appropriate Roth strategy
 */
function applyRothIRAPhaseOut(vehicleOrder, params) {
  const { grossIncome, filingStatus, taxFocus } = params;
  
  // Phase-out limits apply regardless of tax preference - it's an IRS rule
  // Get phase-out limits based on filing status
  const limits = filingStatus === 'Single' 
    ? LIMITS.RETIREMENT.ROTH_IRA_PHASE_OUT.SINGLE
    : LIMITS.RETIREMENT.ROTH_IRA_PHASE_OUT.MARRIED_FILING_JOINTLY;
  
  // If income is below phase-out start, keep regular Roth IRA
  if (grossIncome < limits.START) {
    return vehicleOrder;
  }
  
  // If income is above phase-out start, remove direct Roth IRA
  const updatedOrder = vehicleOrder.filter(v => v.name !== 'Roth IRA');
  
  // Ensure Backdoor Roth IRA is present (if not already)
  const hasBackdoor = updatedOrder.some(v => v.name === 'Backdoor Roth IRA');
  if (!hasBackdoor) {
    // Find where to insert Backdoor Roth (after Traditional IRA if present)
    const tradIndex = updatedOrder.findIndex(v => v.name === 'Traditional IRA');
    const insertIndex = tradIndex >= 0 ? tradIndex + 1 : 0;
    
    updatedOrder.splice(insertIndex, 0, {
      name: 'Backdoor Roth IRA',
      capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12
    });
  }
  
  return updatedOrder;
}

/**
 * Universal employer 401(k) function
 * Adds employer 401(k) vehicles based on user responses
 * @param {Array} baseOrder - Existing vehicle order
 * @param {Object} params - Parameters including rowArr, hdr, age, grossIncome
 * @returns {Array} Updated vehicle order with employer 401(k) vehicles
 */
function addEmployer401kVehicles(baseOrder, params) {
  const { rowArr, hdr, age, grossIncome } = params;
  
  // Get employer 401(k) information from extra questions
  const employer401kAnswer = getValue(hdr, rowArr, HEADERS.P2_EX_Q1);
  
  // Safety check - if ex_q1 doesn't contain valid Yes/No answer, skip
  if (employer401kAnswer !== 'Yes' && employer401kAnswer !== 'No') {
    console.log('Warning: No valid employer 401k data in ex_q1, skipping employer 401k vehicles');
    return baseOrder;
  }
  
  const hasEmployer401k = employer401kAnswer === 'Yes';
  const hasEmployerMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
  const matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q3); // e.g. "50% up to 6%"
  const hasRoth401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
  
  if (!hasEmployer401k) {
    return baseOrder; // No changes if no employer 401(k)
  }
  
  const updatedOrder = [...baseOrder];
  
  // Calculate 401(k) limits with catch-up
  let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
  if (age >= 50) {
    const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
    employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
  }
  
  // Add employer match vehicle first if they offer matching
  if (hasEmployerMatch) {
    // Calculate match cap based on the match percentage answer
    let matchCap = 500; // Default fallback
    
    if (matchPercentage) {
      // Extract the employee contribution percentage that gets matched
      const matchUpToMatch = matchPercentage.match(/up to (\d+)%/);
      if (matchUpToMatch) {
        const matchUpToPct = parseInt(matchUpToMatch[1]) / 100;
        // Calculate monthly cap as the amount needed to maximize match
        matchCap = Math.round((grossIncome * matchUpToPct) / 12);
      }
    }
    
    // Insert match at the beginning - employer match is highest priority (free money!)
    const matchVehicle = { 
      name: '401(k) Match Traditional', 
      capMonthly: matchCap
    };
    updatedOrder.unshift(matchVehicle); // Add to beginning of array
  }
  
  // Optionally add full 401(k) contributions based on business rules
  // For now, we're limiting to match only to encourage self-directed accounts
  
  return updatedOrder;
}

/**
 * Tax preference utility functions
 */
function prioritizeTraditionalAccounts(vehicleOrder) {
  // Move Traditional/401k accounts higher in priority for current tax savings
  const traditional = [];
  const roth = [];
  const other = [];
  
  vehicleOrder.forEach(v => {
    if (v.name.includes('Traditional') || (v.name.includes('401') && !v.name.includes('Roth'))) {
      traditional.push(v);
    } else if (v.name.includes('Roth')) {
      roth.push(v);
    } else {
      other.push(v);
    }
  });
  
  // Order: Traditional first, then other, then Roth
  return [...traditional, ...other, ...roth];
}

function prioritizeRothAccounts(vehicleOrder) {
  // Move Roth accounts higher in priority for tax-free growth
  const roth = [];
  const traditional = [];
  const other = [];
  
  vehicleOrder.forEach(v => {
    if (v.name.includes('Roth')) {
      roth.push(v);
    } else if (v.name.includes('Traditional') || (v.name.includes('401') && !v.name.includes('Roth'))) {
      traditional.push(v);
    } else {
      other.push(v);
    }
  });
  
  // Order: Roth first, then other, then Traditional
  return [...roth, ...other, ...traditional];
}

/**
 * HSA/CESA calculation utility functions
 */
function calculateHsaMonthlyCapacity(hsaEligible, age, filingStatus) {
  if (!hsaEligible) return 0;
  
  const type = (filingStatus === 'Married Filing Jointly') ? 'FAMILY' : 'INDIVIDUAL';
  const base = LIMITS.HEALTH.HSA[type];
  const catchup = age >= 55 ? LIMITS.HEALTH.HSA.CATCHUP : 0;
  
  return (base + catchup) / 12;
}

function calculateCesaMonthlyCapacity(numChildren) {
  return (CONFIG.ANNUAL_CESA_LIMIT * numChildren) / 12;
}

// Stub helpers object—one entry per profileId
/**
 * Per-profile configuration helpers.
 * Each helper returns:
 *  • seeds:       { Education: {}, Health: {}, Retirement: {} }
 *  • vehicleOrders: { Education: [...], Health: [...], Retirement: [...] }
 */
const profileHelpers = {
'3_Solo401k_Builder': function(rowArr, hdr) {
  // Get business structure and Solo 401(k) information
  const businessType  = getValue(hdr, rowArr, HEADERS.P2_EX_Q1) || 'LLC'; // Sole Prop/LLC/S-Corp/C-Corp
  const hasEmployees  = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
  const hasPlan       = getValue(hdr, rowArr, HEADERS.P2_EX_Q3) === 'Yes';
  const annualEmployee= Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q4)) || 0;
  const annualEmployer= Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q5)) || 0;
  const annualFuture  = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q6)) || 0;

  // Get standard information
  const hsaElig = getValue(hdr,rowArr,HEADERS.P2_HSA_ELIGIBILITY)==='Yes';
  const numKids = Number(getValue(hdr,rowArr,HEADERS.P2_CESA_NUM_CHILDREN))||0;
  const age     = Number(getValue(hdr,rowArr,HEADERS.CURRENT_AGE));
  const filing  = getValue(hdr,rowArr,HEADERS.FILING_STATUS);
  
  // Get tax preference for vehicle ordering
  const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
  
  // Get gross income for phase-out calculations
  const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 75000;
  
  // Calculate monthly capacities using utility functions
  const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
  const cesaCap = calculateCesaMonthlyCapacity(numKids);

  // Seed map: decide which bucket to prefill
  const seeds = { Education: {}, Health: {}, Retirement: {} };
  if (hasPlan) {
    // existing plan → seed employee & employer
    seeds.Retirement['Solo 401(k) – Employee'] = annualEmployee/12;
    seeds.Retirement['Solo 401(k) – Employer'] = annualEmployer/12;
  } else {
    // future plan → seed only the employee bucket from ex_q6
    seeds.Retirement['Solo 401(k) – Employee'] = annualFuture/12;
  }

  // Build vehicleOrders + banks
  const cfg = PROFILE_CONFIG['3_Solo401k_Builder'];
  const educationOrder = (numKids>0
    ? cfg.vehicleOrder_Education.map(v=>({
        name:v.name,
        capMonthly:v.name==='Combined CESA'?cesaCap:v.capMonthly
      }))
    : []
  ).concat({ name:'Education Bank', capMonthly:Infinity });

  const healthOrder = cfg.vehicleOrder_Health
    .map(v=>({
      name:v.name,
      capMonthly:v.name==='HSA'?hsaCap:v.capMonthly
    }))
    .filter(v=>!(v.name==='HSA'&&!hsaElig))
    .concat({ name:'Health Bank', capMonthly:Infinity });

  // Build base retirement order with business structure considerations
  let baseRetirementOrder = cfg.vehicleOrder_Retirement
    .map(v => {
      let adjustedCap = v.capMonthly;
      
      // Handle Solo 401(k) vehicles
      if (v.name === 'Solo 401(k) – Employee') {
        // Employee contribution limit with catch-up
        const baseLimit = LIMITS.RETIREMENT.EMPLOYEE_401K;
        if (age >= 50) {
          const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
          adjustedCap = (baseLimit + catchup401k) / 12;
        } else {
          adjustedCap = baseLimit / 12;
        }
      } else if (v.name === 'Solo 401(k) – Employer') {
        // Employer contribution depends on business structure
        // S-Corp and C-Corp: up to 25% of W-2 wages
        // Sole Prop and LLC: up to 20% of net self-employment income
        // Maximum is total limit minus employee contributions
        const totalLimit = age >= 60 ? LIMITS.RETIREMENT.TOTAL_60_63 : 
                          age >= 50 ? LIMITS.RETIREMENT.TOTAL_50_59_64 : 
                          LIMITS.RETIREMENT.TOTAL_401K_457_403B;
        adjustedCap = totalLimit / 12;
      } else if (v.name === 'HSA') {
        adjustedCap = hsaCap;
      } else if (v.name.includes('IRA') && age >= 50) {
        // IRA catch-up: $1,000 for 50+
        adjustedCap = (v.capMonthly * 12 + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
      }
      
      return { name: v.name, capMonthly: adjustedCap };
    });
  
  // Move HSA higher in priority (after Solo 401k contributions)
  const hsaIndex = baseRetirementOrder.findIndex(v => v.name === 'HSA');
  if (hsaIndex > 2) {
    const hsaVehicle = baseRetirementOrder.splice(hsaIndex, 1)[0];
    baseRetirementOrder.splice(2, 0, hsaVehicle);
  }
  
  // Apply Roth IRA phase-out rules
  baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
    grossIncome,
    filingStatus: filing,
    taxFocus
  });
  
  // Adjust order based on tax preference
  if (taxFocus === 'Now') {
    // Prioritize Traditional over Roth for current tax savings
    baseRetirementOrder = prioritizeTraditionalAccounts(baseRetirementOrder);
  } else if (taxFocus === 'Later') {
    // Prioritize Roth over Traditional for tax-free growth
    baseRetirementOrder = prioritizeRothAccounts(baseRetirementOrder);
  }
  // For 'Both' or undefined, keep original order (balanced approach)
  
  // Alert if they have employees (shouldn't be using Solo 401k)
  if (hasEmployees) {
    console.warn('Profile 3 selected but client has employees - consider Profile 8 instead');
  }
  
  const retirementOrder = baseRetirementOrder.concat({ name:'Family Bank', capMonthly:Infinity });

  return {
    seeds,
    vehicleOrders: {
      Education:  educationOrder,
      Health:     healthOrder,
      Retirement: retirementOrder
    }
  };
},







  '1_ROBS_In_Use': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    
    // Get tax preference
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    
    // Get gross income for phase-out calculations
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 72000;
    
    // Get ROBS-specific information from extra questions
    const robsStructure = getValue(hdr, rowArr, HEADERS.P2_EX_Q1) || ''; // How ROBS is structured
    const profitRouting = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) || ''; // How profits are routed
    const contributionType = getValue(hdr, rowArr, HEADERS.P2_EX_Q3) || 'Both'; // Roth/Traditional/Both
    const contributionFrequency = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) || 'Monthly';
    const rothIRAContribution = getValue(hdr, rowArr, HEADERS.P2_EX_Q5) === 'Yes';
    const annualProfitDistribution = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q6)) || LIMITS.DEFAULTS.ANNUAL_PROFIT_DISTRIBUTION;
    
    // Calculate monthly capacities using universal functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);

    // Seeds: Pre-fill ROBS profit distribution
    const seeds = { Education: {}, Health: {}, Retirement: {} };
    
    // Seed the profit distribution if provided
    if (annualProfitDistribution > 0) {
      seeds.Retirement['ROBS Solo 401(k) – Profit Distribution'] = annualProfitDistribution / 12;
    }
    
    const cfg = PROFILE_CONFIG['1_ROBS_In_Use'];
    
    // Build base retirement order with dynamic adjustments
    let baseRetirementOrder = cfg.vehicleOrder_Retirement
      .map(v => {
        let adjustedCap = v.capMonthly;
        
        // Special handling for ROBS vehicles
        if (v.name === 'ROBS Solo 401(k) – Profit Distribution') {
          // This has infinite capacity but we'll let seeds handle the actual amount
          adjustedCap = Infinity;
        } else if (v.name.includes('ROBS Solo 401(k)')) {
          // Apply catch-up contributions for age 50+
          if (age >= 50) {
            const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
            adjustedCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
          }
        } else if (v.name === 'HSA') {
          adjustedCap = hsaCap;
        } else if (v.name.includes('IRA') && age >= 50) {
          // IRA catch-up: $1,000 for 50+
          adjustedCap = (v.capMonthly * 12 + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
        }
        
        return { name: v.name, capMonthly: adjustedCap };
      });
    
    // Filter vehicles based on contribution type preference
    if (contributionType === 'Roth only') {
      baseRetirementOrder = baseRetirementOrder.filter(v => 
        !v.name.includes('Traditional') || v.name.includes('Profit Distribution')
      );
    } else if (contributionType === 'Traditional only') {
      baseRetirementOrder = baseRetirementOrder.filter(v => 
        !v.name.includes('Roth') || v.name === 'Roth IRA' || v.name.includes('Profit Distribution')
      );
    }
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Remove regular Roth IRA if not contributing to it
    if (!rothIRAContribution) {
      baseRetirementOrder = baseRetirementOrder.filter(v => v.name !== 'Roth IRA');
    }
    
    // Move HSA higher in priority (after profit distribution and employee contributions)
    const hsaIndex = baseRetirementOrder.findIndex(v => v.name === 'HSA');
    if (hsaIndex > 3) {
      const hsaVehicle = baseRetirementOrder.splice(hsaIndex, 1)[0];
      baseRetirementOrder.splice(3, 0, hsaVehicle);
    }
    
    const educationOrder = (numKids > 0
      ? cfg.vehicleOrder_Education.map(v => ({
          name: v.name,
          capMonthly: v.name === 'Combined CESA' ? cesaCap : v.capMonthly
        }))
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    const healthOrder = cfg.vehicleOrder_Health
      .map(v => ({
        name: v.name,
        capMonthly: v.name === 'HSA' ? hsaCap : v.capMonthly
      }))
      .filter(v => !(v.name === 'HSA' && !hsaElig))
      .concat({ name: 'Health Bank', capMonthly: Infinity });

    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '2_ROBS_Curious': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || LIMITS.DEFAULTS.GROSS_ANNUAL_INCOME;
    
    // Get tax preference and employment info
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    const workSituation = getValue(hdr, rowArr, HEADERS.WORK_SITUATION);
    const isSelfEmployed = workSituation === 'Self-employed' || workSituation === 'Both';
    const isW2Employee = workSituation === 'W-2 employee' || workSituation === 'Both';
    
    // Get ROBS planning info from extra questions
    const plannedRollover = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q1)) || 0;
    const businessSavingsCapacity = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q2)) || 0;
    const spouseInBusiness = getValue(hdr, rowArr, HEADERS.P2_EX_Q7) === 'Yes';
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);
    
    // Initialize seeds - could use rollover info for seeding
    const seeds = { Education: {}, Health: {}, Retirement: {} };
    if (plannedRollover > 0) {
      // Note: This is informational - actual ROBS rollover happens later
      seeds.Retirement['Planned ROBS Rollover'] = plannedRollover;
    }
    
    // Education vehicles (unchanged)
    const educationOrder = (numKids > 0
      ? [{ name: 'Combined CESA', capMonthly: cesaCap }]
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    // Health vehicles (unchanged)
    const healthOrder = (hsaElig
      ? [{ name: 'HSA', capMonthly: hsaCap }]
      : []
    ).concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build retirement order based on employment situation
    let baseRetirementOrder = [];
    
    // HSA goes first if eligible (triple tax advantage)
    if (hsaElig) {
      baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
    }
    
    // Calculate 401(k) employee limits with catch-up
    let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
    if (age >= 50) {
      const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
      employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
    }
    
    // Add appropriate 401(k) vehicles based on employment
    if (isSelfEmployed) {
      // Solo 401(k) options for self-employed
      if (taxFocus === 'Now') {
        baseRetirementOrder.push({ name: 'Solo 401(k) – Traditional', capMonthly: employee401kCap });
        baseRetirementOrder.push({ name: 'Solo 401(k) – Roth', capMonthly: employee401kCap });
      } else {
        baseRetirementOrder.push({ name: 'Solo 401(k) – Roth', capMonthly: employee401kCap });
        baseRetirementOrder.push({ name: 'Solo 401(k) – Traditional', capMonthly: employee401kCap });
      }
      
      // Add employer portion if expecting business contributions
      if (businessSavingsCapacity > 0) {
        // Simplified calculation based on total business savings capacity
        // Account for spouse if working in business
        const participants = spouseInBusiness ? 2 : 1;
        
        // Calculate limits based on number of participants
        const employeeMaxPerPerson = age >= 50 ? 30500 : 23000;
        const totalMaxPerPerson = age >= 50 ? 76500 : 69000;
        
        // Total business 401(k) limits
        const employeeMaxTotal = employeeMaxPerPerson * participants;
        const totalMaxTotal = totalMaxPerPerson * participants;
        
        // Simple allocation: fill employee first, then employer
        const employeeAmount = Math.min(businessSavingsCapacity, employeeMaxTotal);
        const employerAmount = Math.min(
          businessSavingsCapacity - employeeAmount,
          totalMaxTotal - employeeAmount
        );
        
        // Adjust employee vehicle capacity if spouse is included
        if (spouseInBusiness && employeeAmount > 0) {
          // Override the standard employee cap to account for both spouses
          const adjustedEmployeeCap = employeeAmount / 12;
          // Find and update the Solo 401(k) employee vehicles
          baseRetirementOrder.forEach(vehicle => {
            if (vehicle.name.includes('Solo 401(k)') && !vehicle.name.includes('Employer')) {
              vehicle.capMonthly = Math.round(adjustedEmployeeCap);
              vehicle.note = 'Includes spouse contributions';
            }
          });
        }
        
        // Add employer vehicle if there's capacity
        if (employerAmount > 0) {
          baseRetirementOrder.push({ 
            name: 'Solo 401(k) – Employer', 
            capMonthly: Math.round(employerAmount / 12),
            note: spouseInBusiness ? 
              'Family business - includes both spouses. Consult tax advisor for exact splits.' :
              'Simplified calculation - consult tax advisor for exact limits.'
          });
        }
      }
    }
    
    // Add employer 401(k) vehicles if W-2 employee
    if (isW2Employee) {
      // Profile 2 has employer questions in different positions
      const hasEmployer401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q3) === 'Yes';
      const hasEmployerMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
      const matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q5); // e.g. "50% up to 6%"
      const hasRoth401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q6) === 'Yes';
      
      if (hasEmployer401k && hasEmployerMatch) {
        // Calculate match amount using the universal function
        const matchCap = calculateEmployerMatch(grossIncome, matchPercentage);
        
        // Insert 401(k) Match at the beginning (free money)
        baseRetirementOrder.unshift({ 
          name: '401(k) Match Traditional', 
          capMonthly: matchCap,
          note: matchPercentage // Store percentage as metadata
        });
      }
      
      // Calculate 401(k) employee limits with catch-up
      let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
      if (age >= 50) {
        const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
        employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
      }
      
      // Add based on tax preference
      if (taxFocus === 'Now') {
        baseRetirementOrder.push({ name: '401(k) Traditional', capMonthly: employee401kCap });
        if (hasRoth401k) {
          baseRetirementOrder.push({ name: '401(k) Roth', capMonthly: employee401kCap });
        }
      } else {
        if (hasRoth401k) {
          baseRetirementOrder.push({ name: '401(k) Roth', capMonthly: employee401kCap });
        }
        baseRetirementOrder.push({ name: '401(k) Traditional', capMonthly: employee401kCap });
      }
    }
    
    // Calculate IRA limits with catch-up
    let iraCap = LIMITS.RETIREMENT.TRADITIONAL_IRA / 12;
    if (age >= 50) {
      iraCap = (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
    }
    
    // Add Traditional IRA (important for future ROBS rollover)
    baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
    
    // Add Roth IRA with phase-out check
    baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: LIMITS.RETIREMENT.ROTH_IRA / 12 });
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Family Bank is the final overflow vehicle
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '4_Roth_Reclaimer': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 95000;
    
    // Get tax preference and backdoor Roth info
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    const tradIRABalance = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q1)) || 0;
    const can401kAcceptRollins = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
    
    // Get employment situation
    const workSituation = getValue(hdr, rowArr, HEADERS.WORK_SITUATION);
    const isSelfEmployed = workSituation === 'Self-employed' || workSituation === 'Both';
    const isW2Employee = workSituation === 'W-2 employee' || workSituation === 'Both';
    const isBoth = workSituation === 'Both';
    
    // Get employer 401(k) info
    const hasEmployer401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q5) === 'Yes';
    const hasEmployerMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q6) === 'Yes';
    const matchPercentage = getValue(hdr, rowArr, HEADERS.P2_EX_Q7) || '';
    const hasRoth401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q8) === 'Yes';
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);
    
    // Initialize seeds
    const seeds = { Education: {}, Health: {}, Retirement: {} };
    if (tradIRABalance > 0) {
      seeds.Retirement['Traditional IRA Balance'] = tradIRABalance;
    }
    
    // Education vehicles (simplified)
    const educationOrder = (numKids > 0
      ? [{ name: 'Combined CESA', capMonthly: cesaCap }]
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    // Health vehicles
    const healthOrder = (hsaElig
      ? [{ name: 'HSA', capMonthly: hsaCap }]
      : []
    ).concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build retirement order based on employment situation
    let baseRetirementOrder = [];
    
    // Calculate 401(k) employee limits with catch-up
    let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
    if (age >= 50) {
      const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
      employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
    }
    
    // Calculate IRA limits with catch-up
    let iraCap = LIMITS.RETIREMENT.TRADITIONAL_IRA / 12;
    if (age >= 50) {
      iraCap = (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
    }
    
    // Determine if backdoor Roth is viable
    const canDoBackdoor = tradIRABalance === 0 || hasEmployer401k;
    
    // Check if income allows direct Roth contributions
    const rothPhaseout = applyRothIRAPhaseOut([{ name: 'Roth IRA', capMonthly: iraCap }], {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    const canDoDirectRoth = rothPhaseout.some(v => v.name === 'Roth IRA');
    
    // Branch based on employment situation
    if (isW2Employee && !isBoth) {
      // W-2 Employee only
      // 1. Get employer match first (free money)
      if (hasEmployer401k && hasEmployerMatch && matchPercentage) {
        // Profile 4 specific: Calculate match from ex_q7
        let matchCap = 0;
        const match = matchPercentage.match(/(\d+)%\s*up to\s*(\d+)%/);
        if (match) {
          const matchRate = Number(match[1]) / 100;
          const matchLimit = Number(match[2]) / 100;
          matchCap = Math.round(grossIncome * matchLimit / 12);
        }
        
        if (matchCap > 0) {
          baseRetirementOrder.push({ 
            name: '401(k) Match Traditional',
            capMonthly: matchCap
          });
        }
      }
      
      // 2. HSA (triple tax advantage)
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. Backdoor Roth IRA (prioritized for Roth-focused profile)
      if (!canDoDirectRoth) {
        // Need backdoor due to income limits
        if (tradIRABalance > 0) {
          if (can401kAcceptRollins) {
            baseRetirementOrder.push({ 
              name: 'Backdoor Roth IRA', 
              capMonthly: iraCap,
              note: 'Backdoor Roth: 1) Contribute to Traditional IRA (non-deductible) 2) Roll existing IRA to 401(k) 3) Convert to Roth tax-free'
            });
          } else {
            baseRetirementOrder.push({ 
              name: 'Backdoor Roth IRA', 
              capMonthly: iraCap,
              note: 'Backdoor Roth with pro-rata tax: 1) Contribute to Traditional IRA 2) Convert to Roth (taxable due to existing IRA balance)'
            });
          }
        } else {
          // Clean backdoor possible - no IRA balance
          baseRetirementOrder.push({ 
            name: 'Backdoor Roth IRA', 
            capMonthly: iraCap,
            note: 'Backdoor Roth: 1) Contribute to Traditional IRA (non-deductible) 2) Convert to Roth immediately (tax-free)'
          });
        }
      } else if (canDoDirectRoth) {
        // Income allows direct Roth
        baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: iraCap });
      }
      
      // 4. 401(k) Roth (if available)
      if (hasEmployer401k && hasRoth401k) {
        baseRetirementOrder.push({ name: '401(k) Roth', capMonthly: employee401kCap });
      }
      
      // 5. Traditional 401(k) for additional tax-deferred savings
      if (hasEmployer401k) {
        baseRetirementOrder.push({ name: 'Traditional 401(k)', capMonthly: employee401kCap });
      }
      
      // 6. Traditional IRA as fallback
      baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
      
    } else if (isSelfEmployed && !isBoth) {
      // Self-Employed only
      // 1. HSA first
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 2. Solo 401(k) – Employee Roth (Roth-focused profile)
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee Roth', capMonthly: employee401kCap });
      
      // 3. Solo 401(k) – Employer
      const employerCap = Math.round(grossIncome * 0.20 / 12); // Simplified 20% calculation
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 4. Backdoor Roth IRA (prioritized above traditional vehicles)
      if (!canDoDirectRoth) {
        // Need backdoor due to income limits
        if (tradIRABalance > 0) {
          baseRetirementOrder.push({ 
            name: 'Backdoor Roth IRA', 
            capMonthly: iraCap,
            note: 'Backdoor Roth with pro-rata: Consider Solo 401(k) with rollover feature to avoid taxes'
          });
        } else {
          // Clean backdoor possible
          baseRetirementOrder.push({ 
            name: 'Backdoor Roth IRA', 
            capMonthly: iraCap,
            note: 'Backdoor Roth: 1) Contribute to Traditional IRA 2) Convert to Roth immediately (tax-free)'
          });
        }
      } else if (canDoDirectRoth) {
        // Income allows direct Roth
        baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: iraCap });
      }
      
      // 5. SEP IRA alternative
      baseRetirementOrder.push({ name: 'SEP IRA', capMonthly: employerCap });
      
      // 6. Traditional IRA
      baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
      
    } else if (isBoth) {
      // Both W-2 and Self-Employed
      // 1. 401(k) Match (W-2)
      if (hasEmployer401k && hasEmployerMatch && matchPercentage) {
        // Profile 4 specific: Calculate match from ex_q7
        let matchCap = 0;
        const match = matchPercentage.match(/(\d+)%\s*up to\s*(\d+)%/);
        if (match) {
          const matchRate = Number(match[1]) / 100;
          const matchLimit = Number(match[2]) / 100;
          matchCap = Math.round(grossIncome * matchLimit / 12);
        }
        
        if (matchCap > 0) {
          baseRetirementOrder.push({ 
            name: '401(k) Match Traditional',
            capMonthly: matchCap
          });
        }
      }
      
      // 2. HSA
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. 401(k) Roth (W-2) - Split employee limit
      if (hasEmployer401k && hasRoth401k) {
        const w2Portion = Math.round(employee401kCap * 0.6); // 60% to W-2
        baseRetirementOrder.push({ name: '401(k) Roth', capMonthly: w2Portion });
      }
      
      // 4. Solo 401(k) – Employee (Self-employed) - Remaining employee limit
      const soloPortion = Math.round(employee401kCap * 0.4); // 40% to Solo
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee', capMonthly: soloPortion });
      
      // 5. Solo 401(k) – Employer (Self-employed)
      const employerCap = Math.round(grossIncome * 0.20 / 12);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 6. Backdoor Roth IRA (prioritized above traditional vehicles)
      if (!canDoDirectRoth) {
        // Need backdoor due to income limits
        if (tradIRABalance > 0) {
          if (can401kAcceptRollins) {
            baseRetirementOrder.push({ 
              name: 'Backdoor Roth IRA', 
              capMonthly: iraCap,
              note: 'Backdoor Roth: 1) Roll IRA to employer 401(k) 2) Contribute to Traditional IRA 3) Convert tax-free'
            });
          } else {
            baseRetirementOrder.push({ 
              name: 'Backdoor Roth IRA', 
              capMonthly: iraCap,
              note: 'Backdoor Roth with pro-rata tax: Consider Solo 401(k) with rollover feature'
            });
          }
        } else {
          baseRetirementOrder.push({ 
            name: 'Backdoor Roth IRA', 
            capMonthly: iraCap,
            note: 'Backdoor Roth: 1) Contribute to Traditional IRA 2) Convert immediately (tax-free)'
          });
        }
      } else if (canDoDirectRoth) {
        baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: iraCap });
      }
      
      // 7. Traditional IRA
      baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
      
      // 8. Traditional 401(k) for additional savings (last resort)
      if (hasEmployer401k) {
        const w2TraditionalPortion = Math.round(employee401kCap * 0.6); // 60% to W-2
        baseRetirementOrder.push({ name: 'Traditional 401(k)', capMonthly: w2TraditionalPortion });
      }
    }
    
    // Add rollover action item if beneficial for backdoor strategy
    if (tradIRABalance > 0 && can401kAcceptRollins && !canDoDirectRoth) {
      const hasRolloverNote = baseRetirementOrder.some(v => v.name === 'IRA → 401(k) Rollover');
      if (!hasRolloverNote) {
        baseRetirementOrder.push({ 
          name: 'IRA → 401(k) Rollover', 
          capMonthly: 0,
          note: 'Action item: Roll Traditional IRA to 401(k) to enable tax-free backdoor Roth conversions'
        });
      }
    }
    
    // Family Bank is the final overflow vehicle
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '5_Bracket_Strategist': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    
    // Get tax preference for vehicle ordering
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    
    // Get gross income for phase-out calculations
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 65000;
    
    // Get employment situation
    const workSituation = getValue(hdr, rowArr, HEADERS.WORK_SITUATION);
    const isSelfEmployed = workSituation === 'Self-employed' || workSituation === 'Both';
    const isW2Employee = workSituation === 'W-2 employee' || workSituation === 'Both';
    const isBoth = workSituation === 'Both';
    
    // Get employer 401(k) info
    const hasEmployer401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q1) === 'Yes';
    const hasEmployerMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
    const hasRoth401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);

    const seeds = { Education: {}, Health: {}, Retirement: {} };
    
    // Education vehicles
    const educationOrder = (numKids > 0
      ? [{ name: 'Combined CESA', capMonthly: cesaCap }]
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    // Health vehicles
    const healthOrder = (hsaElig
      ? [{ name: 'HSA', capMonthly: hsaCap }]
      : []
    ).concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build retirement order based on employment situation
    let baseRetirementOrder = [];
    
    // Calculate 401(k) employee limits with catch-up
    let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
    if (age >= 50) {
      const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
      employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
    }
    
    // Calculate IRA limits with catch-up
    let iraCap = LIMITS.RETIREMENT.TRADITIONAL_IRA / 12;
    if (age >= 50) {
      iraCap = (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
    }
    
    // Branch based on employment situation
    if (isW2Employee && !isBoth) {
      // W-2 Employee only
      // 1. Get employer match first (free money)
      if (hasEmployer401k && hasEmployerMatch) {
        baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
          rowArr,
          hdr,
          age,
          grossIncome
        });
      }
      
      // 2. HSA (triple tax advantage - moved up!)
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. Traditional 401(k) (tax reduction focus)
      if (hasEmployer401k) {
        baseRetirementOrder.push({ name: 'Traditional 401(k)', capMonthly: employee401kCap });
      }
      
      // 4. Traditional IRA
      baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
      
      // 5. Roth IRA or Backdoor Roth IRA (based on income)
      baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: iraCap });
      
    } else if (isSelfEmployed && !isBoth) {
      // Self-Employed only
      // 1. HSA first (triple tax advantage)
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 2. Solo 401(k) – Employee Traditional (tax reduction focus)
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee Traditional', capMonthly: employee401kCap });
      
      // 3. Solo 401(k) – Employer
      const employerCap = Math.round(grossIncome * 0.20 / 12); // Simplified 20% calculation
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 4. SEP IRA (alternative)
      baseRetirementOrder.push({ name: 'SEP IRA', capMonthly: employerCap });
      
      // 5. Traditional IRA
      baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
      
      // 6. Roth IRA or Backdoor Roth IRA
      baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: iraCap });
      
    } else if (isBoth) {
      // Both W-2 and Self-Employed
      // 1. 401(k) Match (W-2)
      if (hasEmployer401k && hasEmployerMatch) {
        baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
          rowArr,
          hdr,
          age,
          grossIncome
        });
      }
      
      // 2. HSA (triple tax advantage)
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. Traditional 401(k) (W-2) - Split employee limit
      if (hasEmployer401k) {
        const w2Portion = Math.round(employee401kCap * 0.6); // 60% to W-2
        baseRetirementOrder.push({ name: 'Traditional 401(k)', capMonthly: w2Portion });
      }
      
      // 4. Solo 401(k) – Employee (Self) - Remaining employee limit
      const soloPortion = Math.round(employee401kCap * 0.4); // 40% to Solo
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee', capMonthly: soloPortion });
      
      // 5. Solo 401(k) – Employer (Self)
      const employerCap = Math.round(grossIncome * 0.20 / 12);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 6. Traditional IRA
      baseRetirementOrder.push({ name: 'Traditional IRA', capMonthly: iraCap });
      
      // 7. Roth IRA or Backdoor Roth IRA
      baseRetirementOrder.push({ name: 'Roth IRA', capMonthly: iraCap });
    }
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Adjust order based on tax preference
    if (taxFocus === 'Now') {
      // Prioritize Traditional over Roth for current tax savings
      baseRetirementOrder = prioritizeTraditionalAccounts(baseRetirementOrder);
    } else if (taxFocus === 'Later') {
      // Prioritize Roth over Traditional for tax-free growth
      baseRetirementOrder = prioritizeRothAccounts(baseRetirementOrder);
    }
    // For 'Both' or undefined, keep original order (balanced approach)
    
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '6_Catch_Up': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    
    // Get tax preference for vehicle ordering
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    
    // Get gross income for phase-out calculations
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 78000;
    
    // Get employment situation
    const workSituation = getValue(hdr, rowArr, HEADERS.WORK_SITUATION);
    const isSelfEmployed = workSituation === 'Self-employed' || workSituation === 'Both';
    const isW2Employee = workSituation === 'W-2 employee' || workSituation === 'Both';
    const isBoth = workSituation === 'Both';
    
    // Get employer 401(k) info
    const hasEmployer401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q1) === 'Yes';
    const hasEmployerMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
    const hasRoth401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);

    const seeds = { Education: {}, Health: {}, Retirement: {} };
    
    // Education vehicles
    const educationOrder = (numKids > 0
      ? [{ name: 'Combined CESA', capMonthly: cesaCap }]
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    // Health vehicles
    const healthOrder = (hsaElig
      ? [{ name: 'HSA', capMonthly: hsaCap }]
      : []
    ).concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build retirement order based on employment situation
    let baseRetirementOrder = [];
    
    // Calculate 401(k) employee limits with catch-up (REQUIRED for 50+)
    let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
    if (age >= 50) {
      const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
      employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
    }
    
    // Calculate IRA limits with catch-up (REQUIRED for 50+)
    let iraCap = (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
    
    // Branch based on employment situation
    if (isW2Employee && !isBoth) {
      // W-2 Employee only
      // 1. Get employer match first (free money)
      if (hasEmployer401k && hasEmployerMatch) {
        baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
          rowArr,
          hdr,
          age,
          grossIncome
        });
      }
      
      // 2. HSA (triple tax advantage - moved up!)
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. 401(k) Catch-Up (key vehicle for this profile)
      if (hasEmployer401k) {
        baseRetirementOrder.push({ name: '401(k) Catch-Up', capMonthly: employee401kCap });
      }
      
      // 4. IRA Catch-Up
      baseRetirementOrder.push({ name: 'IRA Catch-Up', capMonthly: iraCap });
      
      // 5. Backdoor Roth IRA Catch-Up (if high income)
      baseRetirementOrder.push({ name: 'Backdoor Roth IRA Catch-Up', capMonthly: iraCap });
      
    } else if (isSelfEmployed && !isBoth) {
      // Self-Employed only
      // 1. HSA first
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 2. Solo 401(k) – Employee Catch-Up
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee Catch-Up', capMonthly: employee401kCap });
      
      // 3. Solo 401(k) – Employer
      const employerCap = Math.round(grossIncome * 0.20 / 12);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 4. SEP IRA (alternative with catch-up)
      baseRetirementOrder.push({ name: 'SEP IRA', capMonthly: iraCap });
      
      // 5. IRA Catch-Up
      baseRetirementOrder.push({ name: 'IRA Catch-Up', capMonthly: iraCap });
      
      // 6. Backdoor Roth IRA Catch-Up
      baseRetirementOrder.push({ name: 'Backdoor Roth IRA Catch-Up', capMonthly: iraCap });
      
    } else if (isBoth) {
      // Both W-2 and Self-Employed
      // 1. 401(k) Match (W-2)
      if (hasEmployer401k && hasEmployerMatch) {
        baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
          rowArr,
          hdr,
          age,
          grossIncome
        });
      }
      
      // 2. HSA
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. 401(k) Catch-Up (W-2) - Split limit
      if (hasEmployer401k) {
        const w2Portion = Math.round(employee401kCap * 0.6);
        baseRetirementOrder.push({ name: '401(k) Catch-Up', capMonthly: w2Portion });
      }
      
      // 4. Solo 401(k) – Employee (Self) - Remaining limit
      const soloPortion = Math.round(employee401kCap * 0.4);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee', capMonthly: soloPortion });
      
      // 5. Solo 401(k) – Employer (Self)
      const employerCap = Math.round(grossIncome * 0.20 / 12);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 6. IRA Catch-Up
      baseRetirementOrder.push({ name: 'IRA Catch-Up', capMonthly: iraCap });
      
      // 7. Backdoor Roth IRA Catch-Up
      baseRetirementOrder.push({ name: 'Backdoor Roth IRA Catch-Up', capMonthly: iraCap });
    }
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Adjust order based on tax preference
    if (taxFocus === 'Now') {
      baseRetirementOrder = prioritizeTraditionalAccounts(baseRetirementOrder);
    } else if (taxFocus === 'Later') {
      baseRetirementOrder = prioritizeRothAccounts(baseRetirementOrder);
    }
    
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '7_Foundation_Builder': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    
    // Get tax preference for vehicle ordering
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);

    const seeds = { Education: {}, Health: {}, Retirement: {} };
    
    const cfg = PROFILE_CONFIG['7_Foundation_Builder'];
    const educationOrder = (numKids > 0
      ? cfg.vehicleOrder_Education.map(v => ({
          name: v.name,
          capMonthly: v.name === 'Combined CESA' ? cesaCap : v.capMonthly
        }))
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    const healthOrder = cfg.vehicleOrder_Health
      .map(v => ({
        name: v.name,
        capMonthly: v.name === 'HSA' ? hsaCap : v.capMonthly
      }))
      .filter(v => !(v.name === 'HSA' && !hsaElig))
      .concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build base retirement order from config
    let baseRetirementOrder = cfg.vehicleOrder_Retirement
      .map(v => {
        let adjustedCap = v.capMonthly;
        
        // Apply catch-up contributions for age 50+
        if (age >= 50 && v.name.includes('IRA')) {
          // IRA catch-up: $1,000 for 50+
          adjustedCap = (v.capMonthly * 12 + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
        }
        
        return { name: v.name, capMonthly: adjustedCap };
      });
    
    // Add employer 401(k) vehicles using universal function
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 75000;
    baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
      rowArr,
      hdr,
      age,
      grossIncome
    });
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Adjust order based on tax preference using universal functions
    if (taxFocus === 'Now') {
      // Prioritize Traditional over Roth for current tax savings
      baseRetirementOrder = prioritizeTraditionalAccounts(baseRetirementOrder);
    } else if (taxFocus === 'Later') {
      // Prioritize Roth over Traditional for tax-free growth
      baseRetirementOrder = prioritizeRothAccounts(baseRetirementOrder);
    }
    // For 'Both' or undefined, keep original order (balanced approach)
    
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '8_Biz_Owner_Group': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    
    // Get tax preference for vehicle ordering
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    
    // Get gross income for phase-out calculations
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 144000;
    
    // Get business owner specific information
    const numEmployees = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q1)) || 5;
    const avgEmployeeAge = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q2)) || 35;
    const avgEmployeeSalary = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q3)) || 50000;
    const hasRetirementPlan = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
    const planType = getValue(hdr, rowArr, HEADERS.P2_EX_Q5) || '401(k)';
    const annualContribution = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q6)) || 0;
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);

    const seeds = { Education: {}, Health: {}, Retirement: {} };
    
    // Seed existing retirement plan contributions
    if (hasRetirementPlan && annualContribution > 0) {
      if (planType.includes('401')) {
        seeds.Retirement['Group 401(k) – Employee'] = annualContribution / 12;
      } else if (planType.includes('Defined Benefit')) {
        seeds.Retirement['Defined Benefit Plan'] = annualContribution / 12;
      }
    }
    
    const cfg = PROFILE_CONFIG['8_Biz_Owner_Group'];
    const educationOrder = (numKids > 0
      ? cfg.vehicleOrder_Education.map(v => ({
          name: v.name,
          capMonthly: v.name === 'Combined CESA' ? cesaCap : v.capMonthly
        }))
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    const healthOrder = cfg.vehicleOrder_Health
      .map(v => ({
        name: v.name,
        capMonthly: v.name === 'HSA' ? hsaCap : v.capMonthly
      }))
      .filter(v => !(v.name === 'HSA' && !hsaElig))
      .concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build base retirement order with sophisticated vehicles for business owners
    let baseRetirementOrder = [];
    
    // Calculate 401(k) employee limits with catch-up
    let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
    if (age >= 50) {
      const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
      employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
    }
    
    // Calculate IRA limits with catch-up
    let iraCap = LIMITS.RETIREMENT.TRADITIONAL_IRA / 12;
    if (age >= 50) {
      iraCap = (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
    }
    
    // 1. Defined Benefit Plan (highest contribution potential)
    // Only recommend if owner is significantly older than employees
    if (age > avgEmployeeAge + 10) {
      // Age-based DB contribution limits (approximate)
      const dbContribution = age >= 60 ? 20833 :    // ~$250k/year
                           age >= 55 ? 16667 :      // ~$200k/year
                           age >= 50 ? 12500 :      // ~$150k/year
                           age >= 45 ? 8333 :       // ~$100k/year
                           6250;                    // ~$75k/year
      
      baseRetirementOrder.push({ 
        name: 'Defined Benefit Plan', 
        capMonthly: dbContribution,
        note: 'Age-based contribution limit, consult actuary for exact amount'
      });
    }
    
    // 2. HSA (moved up for triple tax advantage)
    if (hsaElig) {
      baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
    }
    
    // 3. Group 401(k) – Employee
    baseRetirementOrder.push({ 
      name: 'Group 401(k) – Employee', 
      capMonthly: employee401kCap,
      note: 'Consider safe harbor to avoid discrimination testing'
    });
    
    // 4. Group 401(k) – Employer Profit Sharing
    const employerProfitSharing = (LIMITS.RETIREMENT.TOTAL_401K_457_403B - LIMITS.RETIREMENT.EMPLOYEE_401K) / 12;
    baseRetirementOrder.push({ 
      name: 'Group 401(k) – Employer Profit Sharing', 
      capMonthly: employerProfitSharing,
      note: '3% safe harbor or up to 25% discretionary'
    });
    
    // 5. Cash Balance Plan (modern DB alternative)
    if (age >= 45 && age > avgEmployeeAge + 5) {
      // Simplified Cash Balance calculation based on age
      const cashBalanceCap = age >= 60 ? 23333 : age >= 55 ? 16667 : age >= 50 ? 12500 : 8333;
      baseRetirementOrder.push({ 
        name: 'Cash Balance Plan', 
        capMonthly: cashBalanceCap,
        note: 'Modern DB alternative, consult actuary for exact limits'
      });
    }
    
    // 6. Backdoor Roth IRA (high earners likely phased out of direct Roth)
    baseRetirementOrder.push({ name: 'Backdoor Roth IRA', capMonthly: iraCap });
    
    // 7. After-Tax 401(k) → Mega Backdoor Roth (NEW)
    const megaBackdoorCap = employerProfitSharing; // Simplified - same as profit sharing space
    baseRetirementOrder.push({ 
      name: 'After-Tax 401(k) → Mega Backdoor Roth', 
      capMonthly: megaBackdoorCap,
      note: 'Requires plan to allow after-tax contributions and in-service conversions'
    });
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Adjust order based on tax preference
    if (taxFocus === 'Now') {
      // Prioritize Traditional over Roth for current tax savings
      baseRetirementOrder = prioritizeTraditionalAccounts(baseRetirementOrder);
    } else if (taxFocus === 'Later') {
      // Prioritize Roth over Traditional for tax-free growth
      baseRetirementOrder = prioritizeRothAccounts(baseRetirementOrder);
    }
    // For 'Both' or undefined, keep original order (balanced approach)
    
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  },
  '9_Late_Stage_Growth': function(rowArr, hdr) {
    const hsaElig = getValue(hdr, rowArr, HEADERS.P2_HSA_ELIGIBILITY) === 'Yes';
    const numKids = Number(getValue(hdr, rowArr, HEADERS.P2_CESA_NUM_CHILDREN)) || 0;
    const age = Number(getValue(hdr, rowArr, HEADERS.CURRENT_AGE));
    const filing = getValue(hdr, rowArr, HEADERS.FILING_STATUS);
    
    // Get tax preference for vehicle ordering
    const taxFocus = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
    
    // Get gross income for phase-out calculations
    const grossIncome = Number(getValue(hdr, rowArr, HEADERS.GROSS_ANNUAL_INCOME)) || 110000;
    
    // Get employment situation (may be phased retirement)
    const workSituation = getValue(hdr, rowArr, HEADERS.WORK_SITUATION);
    const isSelfEmployed = workSituation === 'Self-employed' || workSituation === 'Both';
    const isW2Employee = workSituation === 'W-2 employee' || workSituation === 'Both';
    const isBoth = workSituation === 'Both';
    
    // Get employer 401(k) info
    const hasEmployer401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q1) === 'Yes';
    const hasEmployerMatch = getValue(hdr, rowArr, HEADERS.P2_EX_Q2) === 'Yes';
    const hasRoth401k = getValue(hdr, rowArr, HEADERS.P2_EX_Q4) === 'Yes';
    
    // Calculate monthly capacities using utility functions
    const hsaCap = calculateHsaMonthlyCapacity(hsaElig, age, filing);
    const cesaCap = calculateCesaMonthlyCapacity(numKids);

    const seeds = { Education: {}, Health: {}, Retirement: {} };
    
    // Education vehicles
    const educationOrder = (numKids > 0
      ? [{ name: 'Combined CESA', capMonthly: cesaCap }]
      : []
    ).concat({ name: 'Education Bank', capMonthly: Infinity });

    // Health vehicles
    const healthOrder = (hsaElig
      ? [{ name: 'HSA', capMonthly: hsaCap }]
      : []
    ).concat({ name: 'Health Bank', capMonthly: Infinity });

    // Build retirement order based on employment situation
    let baseRetirementOrder = [];
    
    // Calculate 401(k) employee limits with catch-up (CRITICAL for this profile)
    let employee401kCap = LIMITS.RETIREMENT.EMPLOYEE_401K / 12;
    if (age >= 50) {
      const catchup401k = age >= 60 ? LIMITS.RETIREMENT.CATCHUP_401K_60 : LIMITS.RETIREMENT.CATCHUP_401K_50;
      employee401kCap = (LIMITS.RETIREMENT.EMPLOYEE_401K + catchup401k) / 12;
    }
    
    // Calculate IRA limits with catch-up
    let iraCap = (LIMITS.RETIREMENT.TRADITIONAL_IRA + LIMITS.RETIREMENT.CATCHUP_IRA) / 12;
    
    // Branch based on employment situation
    if (isW2Employee && !isBoth) {
      // W-2 Employee (still working near retirement)
      // 1. Get employer match first
      if (hasEmployer401k && hasEmployerMatch) {
        baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
          rowArr,
          hdr,
          age,
          grossIncome
        });
      }
      
      // 2. HSA (critical for Medicare bridge ages 62-65)
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. 401(k) Catch-Up
      if (hasEmployer401k) {
        baseRetirementOrder.push({ name: '401(k) Catch-Up', capMonthly: employee401kCap });
      }
      
      // 4. Roth Conversions (strategy placeholder)
      baseRetirementOrder.push({ 
        name: 'Roth Conversions', 
        capMonthly: 0,
        note: 'Strategic conversions to fill tax brackets'
      });
      
      // 5. IRA Catch-Up
      baseRetirementOrder.push({ name: 'IRA Catch-Up', capMonthly: iraCap });
      
      // 6. Backdoor Roth IRA Catch-Up
      baseRetirementOrder.push({ name: 'Backdoor Roth IRA Catch-Up', capMonthly: iraCap });
      
    } else if (isSelfEmployed && !isBoth) {
      // Self-Employed (consulting in retirement common)
      // 1. HSA first
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 2. Solo 401(k) – Employee Catch-Up
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee Catch-Up', capMonthly: employee401kCap });
      
      // 3. Solo 401(k) – Employer
      const employerCap = Math.round(grossIncome * 0.20 / 12);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 4. Roth Conversions
      baseRetirementOrder.push({ 
        name: 'Roth Conversions', 
        capMonthly: 0,
        note: 'Strategic conversions in low-income years'
      });
      
      // 5. IRA Catch-Up
      baseRetirementOrder.push({ name: 'IRA Catch-Up', capMonthly: iraCap });
      
      // 6. Backdoor Roth IRA Catch-Up
      baseRetirementOrder.push({ name: 'Backdoor Roth IRA Catch-Up', capMonthly: iraCap });
      
    } else if (isBoth) {
      // Both (common for phased retirement)
      // 1. 401(k) Match (W-2)
      if (hasEmployer401k && hasEmployerMatch) {
        baseRetirementOrder = addEmployer401kVehicles(baseRetirementOrder, {
          rowArr,
          hdr,
          age,
          grossIncome
        });
      }
      
      // 2. HSA
      if (hsaElig) {
        baseRetirementOrder.push({ name: 'HSA', capMonthly: hsaCap });
      }
      
      // 3. 401(k) Catch-Up (W-2) - partial
      if (hasEmployer401k) {
        const w2Portion = Math.round(employee401kCap * 0.5);
        baseRetirementOrder.push({ name: '401(k) Catch-Up', capMonthly: w2Portion });
      }
      
      // 4. Solo 401(k) – Employee (Self) - remaining
      const soloPortion = Math.round(employee401kCap * 0.5);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employee', capMonthly: soloPortion });
      
      // 5. Solo 401(k) – Employer
      const employerCap = Math.round(grossIncome * 0.20 / 12);
      baseRetirementOrder.push({ name: 'Solo 401(k) – Employer', capMonthly: employerCap });
      
      // 6. Roth Conversions
      baseRetirementOrder.push({ 
        name: 'Roth Conversions', 
        capMonthly: 0,
        note: 'Strategic conversions to optimize lifetime taxes'
      });
      
      // 7. IRA Catch-Up
      baseRetirementOrder.push({ name: 'IRA Catch-Up', capMonthly: iraCap });
      
      // 8. Backdoor Roth IRA Catch-Up
      baseRetirementOrder.push({ name: 'Backdoor Roth IRA Catch-Up', capMonthly: iraCap });
    }
    
    // Add QCD Planning for age 70.5+
    if (age >= 70.5) {
      baseRetirementOrder.push({ 
        name: 'Qualified Charitable Distribution Planning', 
        capMonthly: Math.min(LIMITS.DEFAULTS.QCD_ANNUAL_LIMIT/12, 8333), // Up to $100k/year
        note: 'Satisfy RMDs tax-free through charity'
      });
    }
    
    // Apply Roth IRA phase-out rules
    baseRetirementOrder = applyRothIRAPhaseOut(baseRetirementOrder, {
      grossIncome,
      filingStatus: filing,
      taxFocus
    });
    
    // Adjust order based on tax preference
    if (taxFocus === 'Now') {
      baseRetirementOrder = prioritizeTraditionalAccounts(baseRetirementOrder);
    } else if (taxFocus === 'Later') {
      baseRetirementOrder = prioritizeRothAccounts(baseRetirementOrder);
    }
    
    const retirementOrder = baseRetirementOrder.concat({ name: 'Family Bank', capMonthly: Infinity });

    return {
      seeds,
      vehicleOrders: {
        Education: educationOrder,
        Health: healthOrder,
        Retirement: retirementOrder
      }
    };
  }
};



/*** HEADER-NAME CONSTANTS ***/
const HEADERS = {
  // ── Phase 1 raw inputs (Form Responses 1 → Working Sheet) ──
  TIMESTAMP:                      'Timestamp',
  FULL_NAME:                      'Full_Name',
  EMAIL:                          'Email',
  STUDENT_ID_LAST4:               'Student_ID_Last4',
  CURRENT_AGE:                    'Current_Age',
  WORK_SITUATION:                 'Work_Situation',
  OWNS_BIZ:                       'Owns_Biz',
  PLANS_BIZ:                      'Plans_Biz',
  W2_EMPLOYEES:                   'W2_Employees',
  ROTH_IRA_HOLDER:                'Roth_IRA_Holder',
  TRADITIONAL_RETIREMENT:         'Traditional_Retirement',
  USING_ROBS:                     'Using_ROBS',
  INTERESTED_IN_ROBS:             'Interested_in_ROBS',
  ROBS_NEW_BUSINESS:              'ROBS_New_Business',
  ROLLOVER_ACCOUNT_50K:           'Rollover_Account_50k',
  SETUP_COST_FUNDING:             'Setup_Cost_Funding',
  TAX_MINIMIZATION:               'Tax_Minimization',
  RETIREMENT_CATCHUP:             'Retirement_Catchup',
  RETIREMENT_TIMEFRAME:           'Retirement_Timeframe',
  ACTION_MOTIVATION:              'Action_Motivation',
  GROSS_ANNUAL_INCOME:            'gross_annual_income',
  FILING_STATUS:                  'filing_status',

  // ── Phase 1 computed & tag fields ──
  NET_MONTHLY_INCOME:             'Net_Monthly_Income',
  ALLOCATION_PERCENTAGE:          'Allocation_Percentage',
  TOTAL_MONTHLY_SAVINGS_CAPACITY: 'Total_Monthly_Savings_Capacity',
  PROFILE_ID:                     'ProfileID',
  USES_ROBS:                      'USES_ROBS',
  INTREST_ROBS:                   'INTREST_ROBS',
  ROBS_READY:                     'ROBS_READY',
  SELF_EMPLOYED:                  'SELF_EMPLOYED',
  HAS_BIZ:                        'HAS_BIZ',
  PLANS_BIZ_RAW:                  'Plans_Biz',
  PLANS_BIZ:                      'PLANS_BIZ',
  HAS_EMPLOYEES:                  'HAS_EMPLOYEES',
  SOLO401K_AVAILABLE:             'SOLO401K_AVAILABLE',
  NEEDS_BACKDOOR_ROTH:            'NEEDS_BACKDOOR_ROTH',
  CATCH_UP_ELIGIBLE:              'CATCH_UP_ELIGIBLE',
  LATE_STAGE_ELIGIBLE:            'LATE_STAGE_ELIGIBLE',
  TAX_FOCUS_NOW:                  'TAX_FOCUS_NOW',
  TAX_FOCUS_LATER:                'TAX_FOCUS_LATER',
  TAX_FOCUS_BOTH:                 'TAX_FOCUS_BOTH',
  URGENT_ACTION:                  'URGENT_ACTION',

  // ── Phase 2 link ──
  PHASE_2_LINK_SENT:              'Phase_2_Link_Sent',
  PHASE_2_LINK:                   'Phase_2_Link',

  // ── Phase 2 raw inputs ──
  P2_TIMESTAMP:                   'timestamp',
  P2_FULL_NAME:                   'full_name',
  P2_EMAIL:                       'email',
  P2_STUDENT_IDENTIFIER:          'student_identifier',
  P2_CURRENT_AGE:                 'current_age',
  P2_TARGET_RETIREMENT_AGE:       'target_retirement_age',
  P2_HAS_CHILDREN:                'has_children_or_plan_children_education',
  P2_YEARS_UNTIL_FUNDS:           'years_until_use_of_funds',
  P2_HSA_ELIGIBILITY:             'hsa_eligibility',
  P2_INV_INVOLVEMENT:             'investment_involvement',
  P2_INV_TIME:                    'investment_time',
  P2_INV_CONFIDENCE:              'investment_confidence',
  P2_HSA_CURRENT_BALANCE:         'current_hsa_balance',
  P2_HSA_MONTHLY_CONTRIB:         'current_monthly_hsa_contribution',
  P2_HSA_YEARS_UNTIL_NEED:        'hsa_years_until_need',
  P2_HSA_TARGET_BALANCE:          'hsa_target_balance',
  P2_CESA_CURRENT_BALANCE:        'cesa_current_balance',
  P2_CESA_MONTHLY_CONTRIB:        'cesa_monthly_contribution',
  P2_CESA_NUM_CHILDREN:           'cesa_num_children',
  P2_CESA_TOTAL_GOAL:             'cesa_total_goal',
  P2_CESA_YEARS_UNTIL_FIRST:      'cesa_years_until_first_need',
  P2_RETIREMENT_CURRENT_BAL:      'retirement_current_balance',
  P2_RETIREMENT_PERSONAL:         'retirement_personal_contribution',
  P2_RETIREMENT_YEARS:            'retirement_years_until_target',
  P2_RETIREMENT_DESIRED_INC:      'retirement_desired_monthly_income',
  P2_RETIREMENT_IMPORTANCE:       'retirement_importance',
  P2_RETIREMENT_ANXIETY:          'retirement_anxiety',
  P2_RETIREMENT_MOTIVATION:       'retirement_motivation',
  P2_EDUCATION_IMPORTANCE:        'education_importance',
  P2_EDUCATION_ANXIETY:           'education_anxiety',
  P2_EDUCATION_MOTIVATION:        'education_motivation',
  P2_HEALTH_IMPORTANCE:           'health_importance',
  P2_HEALTH_ANXIETY:              'health_anxiety',
  P2_HEALTH_MOTIVATION:           'health_motivation',
  P2_TIE_FUND_CHOICE:             'tie_fund_choice',
  P2_TIE_PAINFUL_CHOICE:          'tie_painful_choice',
  P2_TIE_RANK_RETIREMENT:         'tie_rank_retirement',
  P2_TIE_RANK_EDUCATION:          'tie_rank_education',
  P2_TIE_RANK_HEALTH:             'tie_rank_health',
  P2_EX_Q1:                       'ex_q1',
  P2_EX_Q2:                       'ex_q2',
  P2_EX_Q3:                       'ex_q3',
  P2_EX_Q4:                       'ex_q4',
  P2_EX_Q5:                       'ex_q5',
  P2_EX_Q6:                       'ex_q6',
  P2_EX_Q7:                       'ex_q7',
  P2_EX_Q8:                       'ex_q8',
  P2_EX_Q9:                       'ex_q9',
  P2_EX_Q10:                      'ex_q10',
  
  // ── Phase 2 output columns ──
  // Retirement IRA top-ups (education piggy-backed here)
  RETIREMENT_TRADITIONAL_IRA_ACTUAL: 'retirement_traditional_ira_actual',
  RETIREMENT_TRADITIONAL_IRA_IDEAL:  'retirement_traditional_ira_ideal',
  RETIREMENT_ROTH_IRA_ACTUAL:        'retirement_roth_ira_actual',
  RETIREMENT_ROTH_IRA_IDEAL:         'retirement_roth_ira_ideal',
  RETIREMENT_BACKDOOR_ROTH_IRA_ACTUAL: 'retirement_backdoor_roth_ira_actual',
  RETIREMENT_BACKDOOR_ROTH_IRA_IDEAL:  'retirement_backdoor_roth_ira_ideal',

  // Group 401(k) vehicles
  RETIREMENT_GROUP_401K_EMPLOYEE_ACTUAL: 'retirement_group_401k_employee_actual',
  RETIREMENT_GROUP_401K_EMPLOYEE_IDEAL: 'retirement_group_401k_employee_ideal',
  RETIREMENT_GROUP_401K_EMPLOYER_ACTUAL: 'retirement_group_401k_employer_actual',
  RETIREMENT_GROUP_401K_EMPLOYER_IDEAL: 'retirement_group_401k_employer_ideal',
  
  // Defined Benefit Plan
  RETIREMENT_DEFINED_BENEFIT_PLAN_ACTUAL: 'retirement_defined_benefit_plan_actual',
  RETIREMENT_DEFINED_BENEFIT_PLAN_IDEAL: 'retirement_defined_benefit_plan_ideal',
  
  // Cash Balance Plan
  RETIREMENT_CASH_BALANCE_PLAN_ACTUAL: 'retirement_cash_balance_plan_actual',
  RETIREMENT_CASH_BALANCE_PLAN_IDEAL: 'retirement_cash_balance_plan_ideal',
  
  // Solo 401(k) vehicles
  RETIREMENT_SOLO_401K_EMPLOYEE_ACTUAL: 'retirement_solo_401k_employee_actual',
  RETIREMENT_SOLO_401K_EMPLOYEE_IDEAL: 'retirement_solo_401k_employee_ideal',
  RETIREMENT_SOLO_401K_EMPLOYER_ACTUAL: 'retirement_solo_401k_employer_actual',
  RETIREMENT_SOLO_401K_EMPLOYER_IDEAL: 'retirement_solo_401k_employer_ideal',
  RETIREMENT_SOLO_401K_ROTH_ACTUAL: 'retirement_solo_401k_roth_actual',
  RETIREMENT_SOLO_401K_ROTH_IDEAL: 'retirement_solo_401k_roth_ideal',
  RETIREMENT_SOLO_401K_TRADITIONAL_ACTUAL: 'retirement_solo_401k_traditional_actual',
  RETIREMENT_SOLO_401K_TRADITIONAL_IDEAL: 'retirement_solo_401k_traditional_ideal',
  RETIREMENT_SOLO_401K_EMPLOYEE_ROTH_ACTUAL: 'retirement_solo_401k_employee_roth_actual',
  RETIREMENT_SOLO_401K_EMPLOYEE_ROTH_IDEAL: 'retirement_solo_401k_employee_roth_ideal',
  RETIREMENT_SOLO_401K_EMPLOYEE_TRADITIONAL_ACTUAL: 'retirement_solo_401k_employee_traditional_actual',
  RETIREMENT_SOLO_401K_EMPLOYEE_TRADITIONAL_IDEAL: 'retirement_solo_401k_employee_traditional_ideal',
  RETIREMENT_SOLO_401K_EMPLOYEE_CATCHUP_ACTUAL: 'retirement_solo_401k_employee_catch_up_actual',
  RETIREMENT_SOLO_401K_EMPLOYEE_CATCHUP_IDEAL: 'retirement_solo_401k_employee_catch_up_ideal',
  
  // ROBS Solo 401(k) vehicles
  RETIREMENT_ROBS_SOLO_401K_PROFIT_DISTRIBUTION_ACTUAL: 'retirement_robs_solo_401k_profit_distribution_actual',
  RETIREMENT_ROBS_SOLO_401K_PROFIT_DISTRIBUTION_IDEAL: 'retirement_robs_solo_401k_profit_distribution_ideal',
  RETIREMENT_ROBS_SOLO_401K_ROTH_ACTUAL: 'retirement_robs_solo_401k_roth_actual',
  RETIREMENT_ROBS_SOLO_401K_ROTH_IDEAL: 'retirement_robs_solo_401k_roth_ideal',
  RETIREMENT_ROBS_SOLO_401K_TRADITIONAL_ACTUAL: 'retirement_robs_solo_401k_traditional_actual',
  RETIREMENT_ROBS_SOLO_401K_TRADITIONAL_IDEAL: 'retirement_robs_solo_401k_traditional_ideal',
  
  // Regular 401(k) vehicles
  RETIREMENT_401K_TRADITIONAL_ACTUAL: 'retirement_401k_traditional_actual',
  RETIREMENT_401K_TRADITIONAL_IDEAL: 'retirement_401k_traditional_ideal',
  RETIREMENT_401K_ROTH_ACTUAL: 'retirement_401k_roth_actual',
  RETIREMENT_401K_ROTH_IDEAL: 'retirement_401k_roth_ideal',
  RETIREMENT_TRADITIONAL_401K_ACTUAL: 'retirement_traditional_401k_actual',
  RETIREMENT_TRADITIONAL_401K_IDEAL: 'retirement_traditional_401k_ideal',
  RETIREMENT_401K_CATCHUP_ACTUAL: 'retirement_401k_catch_up_actual',
  RETIREMENT_401K_CATCHUP_IDEAL: 'retirement_401k_catch_up_ideal',
  RETIREMENT_401K_MATCH_TRADITIONAL_ACTUAL: 'retirement_401k_match_traditional_actual',
  RETIREMENT_401K_MATCH_TRADITIONAL_IDEAL: 'retirement_401k_match_traditional_ideal',
  
  // IRA catch-up
  RETIREMENT_IRA_CATCHUP_ACTUAL: 'retirement_ira_catch_up_actual',
  RETIREMENT_IRA_CATCHUP_IDEAL: 'retirement_ira_catch_up_ideal',
  RETIREMENT_BACKDOOR_ROTH_IRA_CATCHUP_ACTUAL: 'retirement_backdoor_roth_ira_catch_up_actual',
  RETIREMENT_BACKDOOR_ROTH_IRA_CATCHUP_IDEAL: 'retirement_backdoor_roth_ira_catch_up_ideal',
  
  // SEP IRA
  RETIREMENT_SEP_IRA_ACTUAL: 'retirement_sep_ira_actual',
  RETIREMENT_SEP_IRA_IDEAL: 'retirement_sep_ira_ideal',
  
  // HSA (cross-domain)
  RETIREMENT_HSA_ACTUAL: 'retirement_hsa_actual',
  RETIREMENT_HSA_IDEAL: 'retirement_hsa_ideal',
  HEALTH_HSA_ACTUAL: 'health_hsa_actual',
  HEALTH_HSA_IDEAL: 'health_hsa_ideal',

  // Education CESA bucket
  EDUCATION_COMBINED_CESA_ACTUAL:    'education_combined_cesa_actual',
  EDUCATION_COMBINED_CESA_IDEAL:     'education_combined_cesa_ideal',
  RETIREMENT_COMBINED_CESA_ACTUAL:   'retirement_combined_cesa_actual',
  RETIREMENT_COMBINED_CESA_IDEAL:    'retirement_combined_cesa_ideal',

  // Family Bank
  FAMILY_BANK_IDEAL:                 'family_bank_ideal',
  // Vehicle Recommendations
  VEHICLE_RECOMMENDATIONS:           'vehicle_recommendations',
  
  // ── Future Value Calculations ──
  PERSONALIZED_ANNUAL_RATE:          'personalized_annual_rate',
  RETIREMENT_STARTING_BALANCE:       'retirement_starting_balance',
  EDUCATION_STARTING_BALANCE:        'education_starting_balance', 
  HEALTH_STARTING_BALANCE:           'health_starting_balance',
  FAMILY_BANK_STARTING_BALANCE:      'family_bank_starting_balance',
  RETIREMENT_FV_ACTUAL:              'retirement_fv_actual',
  RETIREMENT_FV_IDEAL:               'retirement_fv_ideal',
  EDUCATION_FV_ACTUAL:               'education_fv_actual',
  EDUCATION_FV_IDEAL:                'education_fv_ideal',
  HEALTH_FV_ACTUAL:                  'health_fv_actual',
  HEALTH_FV_IDEAL:                   'health_fv_ideal',
  FAMILY_BANK_FV_ACTUAL:             'family_bank_fv_actual',
  FAMILY_BANK_FV_IDEAL:              'family_bank_fv_ideal'
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM QUESTION MAPPING - Update when changing form questions
// ═══════════════════════════════════════════════════════════════════════════════
const FORM_EX_Q_MAPPING = {
  '2_ROBS_Curious': {
    // No mapping needed - form puts answers in ex_q1-7 sequentially
    // Code needs to be updated to read from the correct positions
  },
  '4_Roth_Reclaimer': {
    44: 'ex_q1',   // trad IRA balance
    45: 'ex_q2',   // 401k accepts IRA rollovers
    46: 'ex_q5',   // employer 401k
    47: 'ex_q6',   // employer match
    48: 'ex_q7',   // match percentage
    49: 'ex_q8'    // roth 401k option
  },
  '5_Bracket_Strategist': {
    44: 'ex_q1',   // employer 401k
    45: 'ex_q2',   // employer match
    46: 'ex_q3',   // match percentage
    47: 'ex_q4'    // roth option
  },
  '6_Catch_Up': {
    87: 'ex_q1',   // employer 401k
    88: 'ex_q2',   // employer match
    89: 'ex_q3',   // match percentage
    90: 'ex_q4'    // roth option
  },
  '7_Foundation_Builder': {
    44: 'ex_q1',   // employer 401k
    45: 'ex_q2',   // employer match
    46: 'ex_q3',   // match percentage
    47: 'ex_q4'    // roth 401k option
  },
  '9_Late_Stage_Growth': {
    // Form puts answers in ex_q1-4 sequentially - no mapping needed
  }
  // Profiles 1, 3, 8 don't need mapping (no changes or already correct)
};

/**
 * Remap form values to correct ex_q positions based on profile
 */
function remapFormValues(vals, profileId, startCol, hdr) {
  const mapping = FORM_EX_Q_MAPPING[profileId];
  if (!mapping) return vals; // No remapping needed
  
  // Create array to hold remapped values
  const remapped = [...vals];
  
  // Apply each mapping
  Object.entries(mapping).forEach(([sourcePos, targetExQ]) => {
    const sourcePosNum = parseInt(sourcePos);
    const targetHeader = `P2_${targetExQ.toUpperCase()}`;
    
    if (sourcePosNum < vals.length && HEADERS[targetHeader]) {
      const targetCol = hdr[HEADERS[targetHeader]] - startCol;
      if (targetCol >= 0 && targetCol < remapped.length) {
        remapped[targetCol] = vals[sourcePosNum];
      }
    }
  });
  
  return remapped;
}

/**
 * Test function to verify form mapping configuration
 * This is a simple wrapper that calls the full test in Testing.js
 */
function testFormMapping() {
  // Call the test function from Testing.js
  console.log('Testing form mapping configuration...');
  console.log('Current mappings:', FORM_EX_Q_MAPPING);
  
  // For detailed tests, the functions are in Testing.js:
  // - testFormQuestionMapping() - Full mapping test
  // - testEmployer401kIntegration() - Employer 401k test
}

/**
 * CORE ALLOCATOR
 * Pure waterfall allocator across three domains.
 *
 * @param {{Education:{w:number},Health:{w:number},Retirement:{w:number}}} domains
 * @param {number} pool
 * @param {{Education:Object,Health:Object,Retirement:Object}} seeds
 * @param {{Education:Array,Health:Array,Retirement:Array}} vehicleOrders
 * @returns {{Education:Object,Health:Object,Retirement:Object}}
 */
function coreAllocate({ domains, pool, seeds, vehicleOrders }) {
  // 1) Initialize vehicles with seeds or zero
  const vehicles = {
    Education: Object.fromEntries(
      vehicleOrders.Education.map(v => [v.name, seeds.Education[v.name] || 0])
    ),
    Health: Object.fromEntries(
      vehicleOrders.Health.map(v => [v.name, seeds.Health[v.name] || 0])
    ),
    Retirement: Object.fromEntries(
      vehicleOrders.Retirement.map(v => [v.name, seeds.Retirement[v.name] || 0])
    )
  };

  // Track cumulative allocations across all domains to handle shared vehicles
  const cumulativeAllocations = {};

  // 2) Education
  const eduPool = domains.Education.w * pool;
  const eduAlloc = cascadeWaterfallWithTracking(vehicleOrders.Education, eduPool, vehicles.Education, cumulativeAllocations);
  vehicles.Education = eduAlloc;
  const leftoverEdu = eduPool - sumValues(eduAlloc);

  // 3) Health (include leftover from Education)
  const healthPool = domains.Health.w * pool + leftoverEdu;
  const hlthAlloc = cascadeWaterfallWithTracking(vehicleOrders.Health, healthPool, vehicles.Health, cumulativeAllocations);
  vehicles.Health = hlthAlloc;
  const leftoverHealth = healthPool - sumValues(hlthAlloc);

  // 4) Retirement (include leftover from Health)
  const retPool = domains.Retirement.w * pool + leftoverHealth;
  const retAlloc = cascadeWaterfallWithTracking(vehicleOrders.Retirement, retPool, vehicles.Retirement, cumulativeAllocations);
  vehicles.Retirement = retAlloc;

  return vehicles;
}





/*** HELPERS ***/

/**
 * Map headers (row 2) → column index
 */
function getHeaderMap(sheet) {
  const headers = sheet
    .getRange(2, 1, 1, sheet.getLastColumn())
    .getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    if (h) map[h.trim()] = i + 1;
  });
  return map;
}


/**
 * Fill‐priority cascade (waterfall) allocator.
 *
 * @param {Array<{name: string, capMonthly: number}>} order
 * @param {number} pool  Total dollars to allocate
 * @param {Object} initial  Optional map of pre‐seeded allocations { [name]: amount }
 * @returns {Object}  Final allocations by vehicle name
 */
function cascadeWaterfall(order, pool, initial = {}) {
  const alloc = { ...initial };
  let remaining = pool;

  for (const v of order) {
    const already = alloc[v.name] || 0;
    // capMonthly might be Infinity
    const available = Math.max(0, (v.capMonthly || Infinity) - already);
    const take = Math.min(available, remaining);
    if (take > 0) {
      alloc[v.name] = already + take;
      remaining -= take;
    }
    if (remaining <= 0) break;
  }

  return alloc;
}

/**
 * Enhanced cascade allocator with cross-domain tracking
 * Tracks cumulative allocations to prevent over-allocation of shared vehicles
 *
 * @param {Array<{name: string, capMonthly: number}>} order
 * @param {number} pool  Total dollars to allocate
 * @param {Object} initial  Optional map of pre‐seeded allocations { [name]: amount }
 * @param {Object} cumulativeAllocations  Running total of allocations across all domains
 * @returns {Object}  Final allocations by vehicle name
 */
function cascadeWaterfallWithTracking(order, pool, initial = {}, cumulativeAllocations = {}) {
  const alloc = { ...initial };
  let remaining = pool;

  for (const v of order) {
    const already = alloc[v.name] || 0;
    const cumulativeAlready = cumulativeAllocations[v.name] || 0;
    
    // Check both domain-specific and cumulative allocations against the cap
    const totalAlready = cumulativeAlready + already;
    const available = Math.max(0, (v.capMonthly || Infinity) - totalAlready);
    const take = Math.min(available, remaining);
    
    if (take > 0) {
      alloc[v.name] = already + take;
      // Update cumulative tracking
      cumulativeAllocations[v.name] = totalAlready + take;
      remaining -= take;
    }
    if (remaining <= 0) break;
  }
  return alloc;
}




/**
 * Initialize Working Sheet and header map
 * @returns {{sheet: Object, hdr: Object}}
 */
function initWS() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  if (!sheet) throw new Error('Working Sheet not found');
  const hdr   = getHeaderMap(sheet);
  return { sheet, hdr };
}

/**
 * Read a cell by header name
 * @param {Object} hdr   headerName→colIndex map
 * @param {Array}  rowArr one row from getValues()[0]
 * @param {string} name  exact header text
 */
function getValue(hdr, rowArr, name) {
  const col = hdr[name];
  if (!col) {
    Logger.log(
      `⚠️ [getValue] missing header "${name}". Available headers: ` +
      Object.keys(hdr).join(', ')
    );
    throw new Error(`Header not found: "${name}"`);
  }
  return rowArr[col - 1];
}


/**
 * Write a value by header name
 * @param {Sheet}  sheet  the Working Sheet
 * @param {Object} hdr    headerName→colIndex map
 * @param {number} rowNum 1-based row number
 * @param {string} name   exact header text
 * @param {*}      value
 */
function setValue(sheet, hdr, rowNum, name, value) {
  const col = hdr[name];
  if (!col) {
    Logger.log(
      `⚠️ [setValue] cannot write to missing header "${name}". ` +
      `Available headers: ${Object.keys(hdr).join(', ')}`
    );
    return; // or: throw new Error(...)
  }
  sheet.getRange(rowNum, col).setValue(value);
}

/**
 * Validates that all expected headers exist in the Working Sheet
 * @param {Array<string>} requiredHeaders - Additional headers to check beyond defaults
 * @returns {Object} { valid: boolean, missing: string[], hdr: Object }
 */
function validateHeaders(requiredHeaders = []) {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  if (!ws) {
    return { 
      valid: false, 
      missing: ['Working Sheet not found'], 
      hdr: {} 
    };
  }
  
  // Get headers from row 2 (standard location)
  const headerRange = ws.getRange(2, 1, 1, ws.getLastColumn());
  const headers = headerRange.getValues()[0];
  const hdr = {};
  const foundHeaders = new Set();
  
  // Build header map
  headers.forEach((header, index) => {
    if (header) {
      hdr[header] = index + 1; // 1-based index
      foundHeaders.add(header);
    }
  });
  
  // Check critical headers that should always exist
  const defaultRequired = [
    HEADERS.PROFILE_ID,
    HEADERS.CURRENT_AGE,
    HEADERS.WORK_SITUATION,
    HEADERS.GROSS_ANNUAL_INCOME
  ];
  
  // Combine with any additional required headers
  const allRequired = [...new Set([...defaultRequired, ...requiredHeaders])];
  const missing = [];
  
  allRequired.forEach(headerName => {
    if (!foundHeaders.has(headerName)) {
      missing.push(headerName);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    hdr,
    foundHeaders: Array.from(foundHeaders)
  };
}

/**
 * Safe getter that validates header exists before accessing
 * @param {Object} hdr - Header map
 * @param {Array} rowArr - Row data array  
 * @param {string} headerConstant - HEADERS constant like HEADERS.CURRENT_AGE
 * @param {*} defaultValue - Default if header not found
 * @returns {*} The value or default
 */
function safeGetValue(hdr, rowArr, headerConstant, defaultValue = '') {
  if (!hdr[headerConstant]) {
    console.warn(`Header not found: ${headerConstant}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return getValue(hdr, rowArr, headerConstant);
}


/*** DISPATCHER ***/
function onAnyFormSubmit(e) {
  const sheetName = e.range.getSheet().getName();
  if (sheetName === 'Form Responses 1') {
    handlePhase1(e);
  } else {
    handlePhase2(e);
  }
}

/*** PHASE 1 ***/
function handlePhase1(e) {
  // 1) Copy & tag the raw Phase 1 submission
  FinancialTruPathFunctionLibrary.copyAndNotifySubmission({
    srcSheetName:       'Form Responses 1',
    destSheetName:      'Working Sheet',
    highlightColor:     '#FFCCCC',
    notificationEmail:  CONFIG.ADMIN_EMAIL,
    successSubject:     'New ISL Retirement Blueprint Phase 1 Submission',
    successBody:        'A student has completed Phase 1 and been marked in the tracker.',
    failureSubject:     'Phase 1 Submission ⚠️ Student Identifier Not Found',
    failureBody:        'The submitted Student Identifier could not be found; please handle updating the tracker manually.',
    trackingSpreadsheetId: CONFIG.SPREADSHEET_ID,
    trackingSheetName:    'Financial',
    lookupColumn:         'G',
    markColumn:           'AH',
    missingHighlightColor:'#FFFF00'
  }, e);

  // 2) Classify Profile & write tags
  classifyClientProfileFromWorkingSheet();

  // 3) Build the Phase 2 prefill URL + email it
  const { sheet: ws, hdr } = initWS();
  const rowNum = ws.getLastRow();
  const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];

  // grab data from the new row
  const profileId    = getValue(hdr, rowArr, HEADERS.PROFILE_ID);
  const studentLast4 = getValue(hdr, rowArr, HEADERS.STUDENT_ID_LAST4);
  const studentEmail = getValue(hdr, rowArr, HEADERS.EMAIL);
  const fullName     = e.values[1];  // assuming e.values = [timestamp, fullName, email, studentId,...]

  // ensure config exists
  const cfg = PROFILE_CONFIG[profileId];
  if (!cfg || !cfg.formId || !cfg.entryToken) {
    MailApp.sendEmail({
      to:      CONFIG.ADMIN_EMAIL,
      subject: '⚠️ Missing Phase 2 config for ' + profileId,
      body:    `Profile ${profileId} is not configured in PROFILE_CONFIG.`
    });
    return;
  }

  // build the prefill URL
  const baseUrl    = `https://docs.google.com/forms/d/e/${cfg.formId}/viewform?usp=pp_url`;
  const prefillUrl = `${baseUrl}&${cfg.entryToken}=${encodeURIComponent(studentLast4)}`;

  // send the email
  MailApp.sendEmail({
    to:      studentEmail,
    subject: 'URGENT - Your Phase 2 Retirement Blueprint Deep-Dive Survey',
    body:    `Hi ${fullName},\n\n` +
             `Thanks for completing Phase 1! To finish your personalized Retirement Blueprint, please complete this follow-up Phase 2 survey:\n\n` +
             `${prefillUrl}\n\n` +
             `– The TruPath Team`
  });

  // 4) Write the sent-timestamp & URL back to the Working Sheet
  const now = new Date();
  setValue(ws, hdr, rowNum, HEADERS.PHASE_2_LINK_SENT, now);
  setValue(ws, hdr, rowNum, HEADERS.PHASE_2_LINK, prefillUrl);
}


function classifyClientProfileFromWorkingSheet() {
  const { sheet: sh, hdr } = initWS();
  const rowNum = sh.getLastRow();
  const rowArr = sh.getRange(rowNum, 1, 1, sh.getLastColumn()).getValues()[0];

  // ——— PHASE 1 fields (use HEADERS constants!) ———
  const ageText        = getValue(hdr, rowArr, HEADERS.CURRENT_AGE);
  const robsInUse      = getValue(hdr, rowArr, HEADERS.USING_ROBS);
  const robsInterest   = getValue(hdr, rowArr, HEADERS.INTERESTED_IN_ROBS);
  const robsNewBiz     = getValue(hdr, rowArr, HEADERS.ROBS_NEW_BUSINESS);
  const robsFunds      = getValue(hdr, rowArr, HEADERS.ROLLOVER_ACCOUNT_50K);
  const robsSetup      = getValue(hdr, rowArr, HEADERS.SETUP_COST_FUNDING);
  const workSituation  = getValue(hdr, rowArr, HEADERS.WORK_SITUATION);
  const ownsBiz        = getValue(hdr, rowArr, HEADERS.OWNS_BIZ);
  const plansBiz = getValue(hdr, rowArr, HEADERS.PLANS_BIZ_RAW);
  const hasEmployees   = getValue(hdr, rowArr, HEADERS.W2_EMPLOYEES);
  const hasTradIRA     = getValue(hdr, rowArr, HEADERS.TRADITIONAL_RETIREMENT);
  const hasRothIRA     = getValue(hdr, rowArr, HEADERS.ROTH_IRA_HOLDER);
  const taxFocus       = getValue(hdr, rowArr, HEADERS.TAX_MINIMIZATION);
  const catchUpFeeling = getValue(hdr, rowArr, HEADERS.RETIREMENT_CATCHUP);
  const nearRetire     = getValue(hdr, rowArr, HEADERS.RETIREMENT_TIMEFRAME);
  const rawAction      = getValue(hdr, rowArr, HEADERS.ACTION_MOTIVATION);
  const urgentAction   = (rawAction === 'Yes');


  const age = parseInt(ageText, 10);

  // Determine ProfileID (unchanged) …
  let profile = '';
  if (robsInUse === 'Yes') {
    profile = '1_ROBS_In_Use';
  } else if (
    robsInterest === 'Yes' &&
    robsNewBiz   === 'Yes' &&
    robsFunds    === 'Yes' &&
    robsSetup    === 'Yes'
  ) {
    profile = '2_ROBS_Curious';
  } else if (hasEmployees === 'Yes') {
    profile = '8_Biz_Owner_Group';
  } else if ((workSituation === 'Self-employed' || workSituation === 'Both') && hasEmployees === 'No') {
    profile = '3_Solo401k_Builder';
  } else if (hasTradIRA === 'Yes') {
    profile = '4_Roth_Reclaimer';
  } else if (age >= 55 || String(nearRetire).startsWith('Yes')) {
    profile = '9_Late_Stage_Growth';
  } else if (age >= 50 && catchUpFeeling === 'Yes') {
    profile = '6_Catch_Up';
  } else if (['Now','Both'].includes(taxFocus)) {
    profile = '5_Bracket_Strategist';
  } else {
    profile = '7_Foundation_Builder';
  }

  // Write ProfileID
  setValue(sh, hdr, rowNum, HEADERS.PROFILE_ID, profile);

  // Build & write tags in sheet order
  const tags = {
    USES_ROBS:           (robsInUse   === 'Yes'),
    INTREST_ROBS:        (profile !== '1_ROBS_In_Use' && robsInterest === 'Yes'),
    ROBS_READY:          (robsInterest === 'Yes' && robsNewBiz === 'Yes' && robsFunds === 'Yes' && robsSetup === 'Yes'),
    SELF_EMPLOYED:       (workSituation === 'Self-employed'),
    HAS_BIZ:             (ownsBiz      === 'Yes'),
    PLANS_BIZ:           (plansBiz     === 'Yes'),
    HAS_EMPLOYEES:       (hasEmployees === 'Yes'),
    NEEDS_BACKDOOR_ROTH: (hasTradIRA   === 'Yes' && hasRothIRA === 'No'),
    SOLO401K_AVAILABLE:    (workSituation === 'Self-employed' && hasEmployees === 'No'),
    CATCH_UP_ELIGIBLE:   (age >= 50),
    LATE_STAGE_ELIGIBLE: (age >= 55 || String(nearRetire).startsWith('Yes')),
    TAX_FOCUS_NOW:       (taxFocus     === 'Now'),
    TAX_FOCUS_LATER:     (taxFocus     === 'Later'),
    TAX_FOCUS_BOTH:      (taxFocus     === 'Both'),
    URGENT_ACTION:       (urgentAction === 'Yes')
  };

   // new: write each tag into its actual header column
  for (const [tagName, isOn] of Object.entries(tags)) {
    // only write if the header actually exists
    if (hdr[tagName]) {
      sh.getRange(rowNum, hdr[tagName])
        .setValue(isOn ? tagName : '');
    }
  }
}

/**
 * Get all vehicle actual column keys from the Working Sheet headers
 * @returns {Array<string>} Array of header names ending with '_actual'
 */
function listAllVehicleActualKeys() {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const headers = ws.getRange(2, 1, 1, ws.getLastColumn()).getValues()[0];
  
  const actualKeys = [];
  headers.forEach(header => {
    if (header && header.toString().endsWith('_actual')) {
      actualKeys.push(header);
    }
  });
  
  return actualKeys;
}

function handlePhase2(e) {
  // 0) Copy & notify into RawPhase2
  const srcName = (e.range && e.range.getSheet && e.range.getSheet().getName())
                  || 'Phase 2 ROBS Curious Raw';
  FinancialTruPathFunctionLibrary.copyAndNotifySubmission({
    srcSheetName:      srcName,
    destSheetName:     'RawPhase2',
    highlightColor:    '#CCFFCC',
    notificationEmail: CONFIG.ADMIN_EMAIL,
    successSubject:    'Phase 2 Complete',
    successBody:       `Copied from "${srcName}" & marked attendance.`,
    failureSubject:    'Phase 2 ⚠️ Student ID Not Found',
    failureBody:       `ID from "${srcName}" not in tracker!`,
    trackingSpreadsheetId: CONFIG.SPREADSHEET_ID,
    trackingSheetName:    'Financial',
    lookupColumn:         'G',
    markColumn:           'AI',
    missingHighlightColor:'#FFFF00'
  }, e);

  // 1) Init & grab values
  const { sheet: ws, hdr } = initWS();
  const vals = e.values;
  if (!vals) throw new Error('handlePhase2: missing e.values');

  // 2) Find the matching row in Working Sheet by Student_ID (col 4)
  const studentId = vals[3];
  const matches = ws.createTextFinder(studentId).matchEntireCell(true).findAll();
  if (!matches.length) throw new Error(`No match for Student ID "${studentId}"`);
  const rowNum = matches[matches.length - 1].getRow();

  // 3) Paste raw Phase 2 answers with intelligent mapping
  const startCol = hdr[HEADERS.PHASE_2_LINK] + 1;
  
  // Get profile ID for this row
  const currentRowData = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
  const profileId = getValue(hdr, currentRowData, HEADERS.PROFILE_ID);
  
  // Remap values if needed
  const finalVals = remapFormValues(vals, profileId, startCol, hdr);
  
  // Paste the (possibly remapped) values
  ws.getRange(rowNum, startCol, 1, finalVals.length).setValues([finalVals]);

  // 4) Run the allocation engine
  const results = runUniversalEngine(rowNum);

  // 5) Read back "actual" inputs - ENHANCED to capture all current contributions
  const rowArr     = ws.getRange(rowNum,1,1,ws.getLastColumn()).getValues()[0];
  // profileId already declared above, reuse it
  
  // Universal current contributions
  const actualHsa  = Number(getValue(hdr,rowArr,HEADERS.P2_HSA_MONTHLY_CONTRIB))||0;
  const actualCesa = Number(getValue(hdr,rowArr,HEADERS.P2_CESA_MONTHLY_CONTRIB))||0;
  const actualRet  = Number(getValue(hdr,rowArr,HEADERS.P2_RETIREMENT_PERSONAL))||0;

  // 6) Build actualMap (all keys default to 0), then override
  const actualMap = {};
  listAllVehicleActualKeys().forEach(key => {
    // skip any family_bank_actual keys
    if (!/family_bank/.test(key)) actualMap[key] = 0;
  });
  
  // Set universal actuals (HSA belongs to Health domain, CESA to Education domain)
  actualMap['health_hsa_actual']       = actualHsa;
  actualMap['education_combined_cesa_actual']  = actualCesa;
  actualMap['retirement_traditional_401k_actual'] = actualRet;
  
  // Define profiles with employer match
  const matchProfiles = ['2_ROBS_Curious', '4_Roth_Reclaimer', '5_Bracket_Strategist', 
                         '6_Catch_Up', '7_Foundation_Builder', '9_Late_Stage_Growth'];
  
  // Profile-specific actual contributions
  let actualDist = 0;
  if (profileId === '1_ROBS_In_Use') {
    actualDist = (Number(getValue(hdr,rowArr,HEADERS.P2_EX_Q6))||0)/12;
    actualMap['retirement_robs_solo_401k_profit_distribution_actual'] = actualDist;
  } else if (profileId === '3_Solo401k_Builder') {
    const annualEmployee = Number(getValue(hdr,rowArr,HEADERS.P2_EX_Q4))||0;
    const annualEmployer = Number(getValue(hdr,rowArr,HEADERS.P2_EX_Q5))||0;
    actualMap['retirement_solo_401k_employee_actual'] = annualEmployee/12;
    actualMap['retirement_solo_401k_employer_actual'] = annualEmployer/12;
  } else if (profileId === '8_Biz_Owner_Group') {
    // Group plan actuals
    const annualContribution = Number(getValue(hdr,rowArr,HEADERS.P2_EX_Q6))||0;
    actualMap['retirement_group_401k_employee_actual'] = annualContribution/12;
  }
  
  // Add employer match actuals for W-2 profiles
  if (matchProfiles.includes(profileId)) {
    // Same logic as ideal to determine if they have match
    let hasMatch = false;
    let matchPercentage = '';
    
    if (profileId === '2_ROBS_Curious') {
      hasMatch = getValue(hdr,rowArr,HEADERS.P2_EX_Q4) === 'Yes';
      matchPercentage = getValue(hdr,rowArr,HEADERS.P2_EX_Q5) || '';
    } else if (['4_Roth_Reclaimer'].includes(profileId)) {
      hasMatch = getValue(hdr,rowArr,HEADERS.P2_EX_Q6) === 'Yes';
      matchPercentage = getValue(hdr,rowArr,HEADERS.P2_EX_Q7) || '';
    } else if (['5_Bracket_Strategist', '6_Catch_Up', '7_Foundation_Builder', '9_Late_Stage_Growth'].includes(profileId)) {
      hasMatch = getValue(hdr,rowArr,HEADERS.P2_EX_Q2) === 'Yes';
      matchPercentage = getValue(hdr,rowArr,HEADERS.P2_EX_Q3) || '';
    }
    
    if (hasMatch && matchPercentage) {
      const grossIncome = Number(getValue(hdr,rowArr,HEADERS.GROSS_ANNUAL_INCOME)) || 0;
      const matchAmount = calculateEmployerMatch(grossIncome, matchPercentage);
      if (matchAmount > 0) {
        actualMap['retirement_401k_match_traditional_actual'] = matchAmount;
      }
    }
  }

  // 7) Write every _actual cell, rounded & formatted
  Object.entries(actualMap).forEach(([hdrName, rawAmt]) => {
    const col = hdr[hdrName];
    if (!col) return;
    const cell = ws.getRange(rowNum, col);
    cell.setValue(Math.round(rawAmt));
    cell.setNumberFormat('$#,##0');
  });

  // 8) Write every _ideal allocation, rounded & formatted
  // MODIFIED: Add non-discretionary seeds to ideal calculations
  const writtenIdeal = new Set();
  let sumIdeal = 0;
  
  // First, determine which seeds are non-discretionary based on profile
  const nonDiscretionarySeeds = { Education: {}, Health: {}, Retirement: {} };
  
  // Profile-specific non-discretionary identification
  // profileId already declared above, reuse it
  
  // Profile 1: ROBS In Use - Profit distributions
  if (profileId === '1_ROBS_In_Use' && actualDist > 0) {
    nonDiscretionarySeeds.Retirement['ROBS Solo 401(k) – Profit Distribution'] = actualDist;
  } 
  
  // Profile 3: Solo 401k Builder - Employer contributions
  else if (profileId === '3_Solo401k_Builder') {
    const annualEmployer = Number(getValue(hdr,rowArr,HEADERS.P2_EX_Q5))||0;
    if (annualEmployer > 0) {
      nonDiscretionarySeeds.Retirement['Solo 401(k) – Employer'] = annualEmployer/12;
    }
  } 
  
  // Profile 8: Business Owner Group - Required contributions
  else if (profileId === '8_Biz_Owner_Group') {
    // Check for safe harbor or other required contributions
    const planType = getValue(hdr,rowArr,HEADERS.P2_EX_Q5) || '';
    if (planType.includes('Defined Benefit')) {
      const annualDB = Number(getValue(hdr,rowArr,HEADERS.P2_EX_Q6))||0;
      if (annualDB > 0) {
        nonDiscretionarySeeds.Retirement['Defined Benefit Plan'] = annualDB/12;
      }
    }
    // Safe harbor contributions would also be non-discretionary
  }
  
  // Check profiles with employer match (already defined above)
  if (matchProfiles.includes(profileId)) {
    // Get employer match info based on profile question mapping
    let hasMatch = false;
    let matchPercentage = '';
    
    if (profileId === '2_ROBS_Curious') {
      hasMatch = getValue(hdr,rowArr,HEADERS.P2_EX_Q4) === 'Yes';
      matchPercentage = getValue(hdr,rowArr,HEADERS.P2_EX_Q5) || '';
    } else if (['4_Roth_Reclaimer'].includes(profileId)) {
      hasMatch = getValue(hdr,rowArr,HEADERS.P2_EX_Q6) === 'Yes';
      matchPercentage = getValue(hdr,rowArr,HEADERS.P2_EX_Q7) || '';
    } else if (['5_Bracket_Strategist', '6_Catch_Up', '7_Foundation_Builder', '9_Late_Stage_Growth'].includes(profileId)) {
      hasMatch = getValue(hdr,rowArr,HEADERS.P2_EX_Q2) === 'Yes';
      matchPercentage = getValue(hdr,rowArr,HEADERS.P2_EX_Q3) || '';
    }
    
    if (hasMatch && matchPercentage) {
      // Calculate employer match amount
      const grossIncome = Number(getValue(hdr,rowArr,HEADERS.GROSS_ANNUAL_INCOME)) || 0;
      const matchAmount = calculateEmployerMatch(grossIncome, matchPercentage);
      if (matchAmount > 0) {
        // Use fixed vehicle name for consistency
        nonDiscretionarySeeds.Retirement['401(k) Match Traditional'] = matchAmount;
        // Store match percentage separately if needed for reporting
        nonDiscretionarySeeds.Retirement['401(k) Match Traditional_note'] = matchPercentage;
      }
    }
  }
  
  // Write ideal allocations (discretionary + non-discretionary)
  ['Retirement','Education','Health'].forEach(domain => {
    // First write discretionary allocations from engine
    for (const [veh, amtRaw] of Object.entries(results.vehicles[domain])) {
      // skip Family Bank here
      if (veh === 'Family Bank') continue;
      const key = veh.toLowerCase().replace(/[()%–]/g,'').replace(/\s+/g,'_');
      const hdrName = `${domain.toLowerCase()}_${key}_ideal`;
      const col = hdr[hdrName];
      if (!col) continue;
      
      // Add non-discretionary amount if applicable
      const nonDiscAmt = nonDiscretionarySeeds[domain][veh] || 0;
      const amt  = Math.round((amtRaw || 0) + nonDiscAmt);
      
      ws.getRange(rowNum, col)
        .setValue(amt)
        .setNumberFormat('$#,##0');
      writtenIdeal.add(hdrName);
      sumIdeal += amt;
    }
    
    // Then add any non-discretionary seeds that weren't in the engine results
    for (const [veh, amtRaw] of Object.entries(nonDiscretionarySeeds[domain])) {
      if (!results.vehicles[domain][veh]) {
        const key = veh.toLowerCase().replace(/[()%–]/g,'').replace(/\s+/g,'_');
        const hdrName = `${domain.toLowerCase()}_${key}_ideal`;
        const col = hdr[hdrName];
        if (!col) continue;
        const amt = Math.round(amtRaw || 0);
        ws.getRange(rowNum, col)
          .setValue(amt)
          .setNumberFormat('$#,##0');
        writtenIdeal.add(hdrName);
        sumIdeal += amt;
      }
    }
  });

  // 9) Dump leftover into single family_bank_ideal
  // MODIFIED: Calculate based on total desired percentage
  const userPercent = Number(getValue(hdr,rowArr,HEADERS.ALLOCATION_PERCENTAGE)) || 0;
  const targetRate = Math.max(userPercent / 100, CONFIG.OPTIMIZED_SAVINGS_RATE);
  const totalPool = Number(getValue(hdr,rowArr,HEADERS.NET_MONTHLY_INCOME)) * targetRate;
  
  // Add non-discretionary seeds to get true total
  const totalNonDiscretionary = sumValues(nonDiscretionarySeeds.Education) +
                                sumValues(nonDiscretionarySeeds.Health) +
                                sumValues(nonDiscretionarySeeds.Retirement);
  const totalIdealPool = totalPool + totalNonDiscretionary;
  
  const leftover  = Math.max(0, Math.round(totalIdealPool - sumIdeal));
  const fbCol = hdr[HEADERS.FAMILY_BANK_IDEAL];
  if (fbCol) {
    ws.getRange(rowNum, fbCol)
      .setValue(leftover)
      .setNumberFormat('$#,##0');
    writtenIdeal.add('family_bank_ideal');
  } else {
    Logger.log('⚠️ Missing header: family_bank_ideal');
  }

  // 10) Collect and store vehicle recommendations with notes
  const recommendations = [];
  ['Retirement','Education','Health'].forEach(domain => {
    // Find vehicles with notes from the original vehicleOrders
    const domainVehicles = results.vehicleOrders[domain];
    if (domainVehicles && Array.isArray(domainVehicles)) {
      domainVehicles.forEach(vehicle => {
        if (vehicle.note) {
          // Only include vehicles that have an allocated amount
          const amtRaw = results.vehicles[domain][vehicle.name];
          if (amtRaw > 0) {
            recommendations.push(`${vehicle.name}: ${vehicle.note}`);
          } else if (vehicle.note.includes('Action item:')) {
            // Include action items even without allocation
            recommendations.push(vehicle.note);
          }
        }
      });
    }
  });
  
  // Write recommendations to new field
  const recCol = hdr[HEADERS.VEHICLE_RECOMMENDATIONS];
  if (recCol && recommendations.length > 0) {
    ws.getRange(rowNum, recCol)
      .setValue(recommendations.join('\n'));
  }

  // 11) Zero-fill any remaining _actual or _ideal
  Object.entries(hdr).forEach(([name, col]) => {
    const cell = ws.getRange(rowNum, col);
    if (name.endsWith('_actual') && !(name in actualMap)) {
      cell.setValue(0).setNumberFormat('$#,##0');
    }
    if (name.endsWith('_ideal') && !writtenIdeal.has(name)) {
      cell.setValue(0).setNumberFormat('$#,##0');
    }
  });

  Logger.log(`✔️ Phase 2 done — wrote ${Object.keys(actualMap).length} actual + ${writtenIdeal.size} ideal`);
  
  // Automatically trigger Phase 3 - Future Value Calculations
  try {
    runPhase3(rowNum);
  } catch (error) {
    Logger.log(`⚠️ Phase 3 failed but Phase 2 completed successfully: ${error.message}`);
    // Don't throw - Phase 2 was successful even if Phase 3 fails
  }
}






/*** DOMAIN WEIGHTS ***/
function computeDomainsAndWeights(rowArr, hdr, rMonthly) {
  // Importance scores (1–7 mapped to 0–1)
  const imp = {
    Retirement: (Number(getValue(hdr, rowArr, HEADERS.P2_RETIREMENT_IMPORTANCE)) - 1) / 6,
    Education:  (Number(getValue(hdr, rowArr, HEADERS.P2_EDUCATION_IMPORTANCE))  - 1) / 6,
    Health:     (Number(getValue(hdr, rowArr, HEADERS.P2_HEALTH_IMPORTANCE))     - 1) / 6
  };

  // Raw urgency: discount factor 1/(1+r)^months
  const domains = {
    Retirement: {
      t: Number(getValue(hdr, rowArr, HEADERS.P2_RETIREMENT_YEARS)) * 12
    },
    Education: {
      // use years until first need for education (CESA)
      t: Number(getValue(hdr, rowArr, HEADERS.P2_CESA_YEARS_UNTIL_FIRST)) * 12
    },
    Health: {
      // use years until HSA need
      t: Number(getValue(hdr, rowArr, HEADERS.P2_HSA_YEARS_UNTIL_NEED)) * 12
    }
  };

  let maxU = 0;
  for (let d in domains) {
    const U = 1 / Math.pow(1 + rMonthly, domains[d].t);
    domains[d].Uraw = U;
    maxU = Math.max(maxU, U);
  }
  // Normalize urgency and blend with importance
  for (let d in domains) {
    domains[d].Ubar = domains[d].Uraw / maxU;
    domains[d].w    = (imp[d] + domains[d].Ubar) / 2;
  }
  // Final normalize so Σw = 1
  const sumW = Object.values(domains).reduce((s,v) => s + v.w, 0);
  for (let d in domains) domains[d].w /= sumW;

  return domains;
}




/*** UTILS ***/
function sumValues(obj) {
  return Object.values(obj).reduce((s, v) => s + v, 0);
}


/**
 * Computes how much “new” savings to allocate each month,
 * treating userPct as an increment over their current savings rate.
 *
 * @param {number} netIncome    — take-home pay per month
 * @param {Object} seeds        — { Education: {...}, Health: {...}, Retirement: {...} }
 * @param {number} userPct      — additional % they want to save (0–100)
 * @param {number} defaultRate  — our guideline rate (e.g. 0.20)
 * @returns {number} netPool    — dollars/month of new allocations
 */
function computeNetPool(netIncome, seeds, userPct, defaultRate) {
  // 1) Sum their existing (seeded) contributions
  const totalSeed = sumValues(seeds.Education)
                  + sumValues(seeds.Health)
                  + sumValues(seeds.Retirement);

  // 2) Compute current savings rate
  const currentPct = netIncome > 0 ? totalSeed / netIncome : 0;

  // 3) Desired total savings rate = current + incremental
  const userTotalPct = currentPct + (userPct / 100);

  // 4) Enforce at least the default guideline
  const targetRate = Math.max(defaultRate, userTotalPct);

  // 5) Compute gross pool then subtract seeds
  const grossPool = netIncome * targetRate;
  const netPool   = grossPool - totalSeed;

  // 6) Never go below zero
  const finalPool = netPool > 0 ? netPool : 0;
  return finalPool;
}

/**
 * NEW: Computes discretionary allocation pool based on TOTAL desired percentage
 * This treats userPct as the TOTAL savings rate, not additional
 * 
 * @param {number} netIncome       — take-home pay per month
 * @param {Object} discretionarySeeds — only discretionary current contributions
 * @param {number} userPct         — TOTAL % they want to save (0–100)
 * @param {number} defaultRate     — our guideline rate (e.g. 0.20)
 * @returns {number} discretionaryPool — dollars/month for discretionary allocations
 */
function computeNetPoolTotal(netIncome, discretionarySeeds, userPct, defaultRate) {
  // 1) User's total desired savings rate
  const targetRate = Math.max(userPct / 100, defaultRate);
  
  // 2) Calculate total discretionary pool
  const discretionaryPool = netIncome * targetRate;
  
  // 3) We do NOT subtract existing discretionary contributions
  // The ideal calculation will replace them entirely
  
  return discretionaryPool;
}

/**
 * Calculate employer match amount based on gross income and match percentage
 * @param {number} grossIncome - Annual gross income
 * @param {string} matchPercentage - Match percentage string e.g. "50% up to 6%"
 * @returns {number} Monthly match amount
 */
function calculateEmployerMatch(grossIncome, matchPercentage) {
  let matchCap = 0;
  
  if (matchPercentage && grossIncome > 0) {
    // Extract the employee contribution percentage that gets matched
    const matchUpToMatch = matchPercentage.match(/up to (\d+)%/);
    if (matchUpToMatch) {
      const matchUpToPct = parseInt(matchUpToMatch[1]) / 100;
      // Calculate monthly cap as the amount needed to maximize match
      matchCap = Math.round((grossIncome * matchUpToPct) / 12);
    } else {
      // Fallback if format doesn't match
      matchCap = 500; // Default estimate
    }
  }
  
  return matchCap;
}

/**
 * Calculate personalized annual interest rate based on investment scoring
 * @param {Object} hdr - Header mapping object
 * @param {Array} rowArr - Row data array
 * @returns {number} Annual interest rate (e.g., 0.12 for 12%)
 */
function calculatePersonalizedRate(hdr, rowArr) {
  // Get investment scoring values (1-7 scale)
  const inv1 = Number(getValue(hdr, rowArr, HEADERS.P2_INV_INVOLVEMENT)) || 4;
  const inv2 = Number(getValue(hdr, rowArr, HEADERS.P2_INV_TIME)) || 4;
  const inv3 = Number(getValue(hdr, rowArr, HEADERS.P2_INV_CONFIDENCE)) || 4;
  
  // Calculate average score
  const avgScore = (inv1 + inv2 + inv3) / 3;
  
  // Convert to annual rate using tunable constants
  // Score 1 = BASE_RATE (8%), Score 7 = BASE_RATE + MAX_ADDITIONAL_RATE (20%)
  const annualRate = FV_CONFIG.BASE_RATE + ((avgScore - 1) / 6) * FV_CONFIG.MAX_ADDITIONAL_RATE;
  
  return annualRate;
}

/**
 * Calculate future value with monthly contributions and safeguards
 * @param {number} monthlyContribution - Monthly contribution amount
 * @param {number} annualRate - Annual interest rate (e.g., 0.12 for 12%)
 * @param {number} years - Number of years
 * @returns {number} Future value (capped at reasonable maximum)
 */
function futureValue(monthlyContribution, annualRate, years) {
  // Input validation
  if (!monthlyContribution || monthlyContribution <= 0 || years <= 0) {
    return 0;
  }
  
  // Special case: 99 years typically means "no children" or "not applicable"
  if (years >= 99) {
    return 0;
  }
  
  // Safeguards against unrealistic calculations
  const MAX_YEARS = 70;  // Maximum reasonable retirement timeline
  const MAX_RATE = 0.25; // Maximum 25% annual return
  const MAX_FV = 100000000; // Cap at $100 million to prevent billions
  
  // Apply reasonable limits
  if (years > MAX_YEARS) {
    Logger.log(`⚠️ FV Warning: Years (${years}) exceeds maximum (${MAX_YEARS}), capping at ${MAX_YEARS}`);
    years = MAX_YEARS;
  }
  
  if (annualRate > MAX_RATE) {
    Logger.log(`⚠️ FV Warning: Rate (${(annualRate * 100).toFixed(2)}%) exceeds maximum (${(MAX_RATE * 100)}%), capping at ${(MAX_RATE * 100)}%`);
    annualRate = MAX_RATE;
  }
  
  try {
    let fv;
    
    if (FV_CONFIG.USE_MONTHLY_COMPOUNDING) {
      // Monthly compounding
      const monthlyRate = annualRate / 12;
      const months = years * 12;
      
      // Check for potential overflow before calculation
      const growthFactor = Math.pow(1 + monthlyRate, months);
      if (!isFinite(growthFactor) || growthFactor > 1000000) {
        Logger.log(`⚠️ FV Warning: Growth factor too large, limiting calculation`);
        return MAX_FV;
      }
      
      // FV = PMT × ((1 + r)^n - 1) / r
      if (monthlyRate === 0) {
        fv = monthlyContribution * months;
      } else {
        fv = monthlyContribution * ((growthFactor - 1) / monthlyRate);
      }
    } else {
      // Annual compounding (simplified)
      if (annualRate === 0) {
        fv = monthlyContribution * 12 * years;
      } else {
        fv = monthlyContribution * 12 * ((Math.pow(1 + annualRate, years) - 1) / annualRate);
      }
    }
    
    // Apply maximum cap
    if (!isFinite(fv) || fv > MAX_FV) {
      Logger.log(`⚠️ FV Warning: Result ($${Math.round(fv).toLocaleString()}) exceeds cap, limiting to $${MAX_FV.toLocaleString()}`);
      return MAX_FV;
    }
    
    return Math.round(fv);
    
  } catch (error) {
    Logger.log(`❌ FV calculation error: ${error.message}`);
    return 0;
  }
}

/**
 * Consolidate contributions by domain
 * @param {Object} hdr - Header mapping object
 * @param {Array} rowArr - Row data array
 * @param {string} type - 'actual' or 'ideal'
 * @returns {Object} Totals by domain
 */
function consolidateByDomain(hdr, rowArr, type) {
  const totals = {
    retirement: 0,
    education: 0,
    health: 0,
    family_bank: 0
  };
  
  // Get all headers that end with _actual or _ideal
  const suffix = `_${type}`;
  
  Object.entries(hdr).forEach(([headerName, colIndex]) => {
    if (headerName.endsWith(suffix)) {
      // Use direct array access since we have the column index
      const value = Number(rowArr[colIndex - 1]) || 0;
      
      // Determine domain from header name
      if (headerName.startsWith('retirement_')) {
        totals.retirement += value;
      } else if (headerName.startsWith('education_')) {
        totals.education += value;
      } else if (headerName.startsWith('health_')) {
        totals.health += value;
      } else if (headerName.startsWith('family_bank')) {  // Changed: removed underscore requirement
        totals.family_bank += value;
      }
    }
  });
  
  return totals;
}

/**
 * Calculate and write future values to the Working Sheet
 * @param {Object} hdr - Header mapping object
 * @param {Array} rowArr - Row data array
 * @param {number} rowNum - Row number in the sheet
 * @param {string} profileId - Profile identifier
 */
function calculateAndWriteFutureValues(hdr, rowArr, rowNum, profileId) {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  
  // 1. Calculate and save personalized annual rate
  const annualRate = calculatePersonalizedRate(hdr, rowArr);
  const rateCol = hdr[HEADERS.PERSONALIZED_ANNUAL_RATE];
  if (rateCol) {
    ws.getRange(rowNum, rateCol)
      .setValue(annualRate)
      .setNumberFormat('0.00%');
  }
  
  // 2. Get timeline data (use retirement timeline for family bank)
  const timelines = {
    retirement: Number(getValue(hdr, rowArr, HEADERS.P2_RETIREMENT_YEARS)) || 30,
    education: Number(getValue(hdr, rowArr, HEADERS.P2_CESA_YEARS_UNTIL_FIRST)) || 99,
    health: Number(getValue(hdr, rowArr, HEADERS.P2_HSA_YEARS_UNTIL_NEED)) || 30,
    family_bank: Number(getValue(hdr, rowArr, HEADERS.P2_RETIREMENT_YEARS)) || 30
  };
  
  // 3. Get current balances (starting points)
  const currentBalances = {
    retirement: Number(getValue(hdr, rowArr, HEADERS.P2_RETIREMENT_CURRENT_BAL)) || 0,
    education: Number(getValue(hdr, rowArr, HEADERS.P2_CESA_CURRENT_BALANCE)) || 0,
    health: Number(getValue(hdr, rowArr, HEADERS.P2_HSA_CURRENT_BALANCE)) || 0,
    family_bank: 0  // Family Bank typically doesn't have a starting balance
  };
  
  // Add profile-specific retirement balances (e.g., Traditional IRA for Profile 4)
  if (profileId === '4_Roth_Reclaimer') {
    const tradIRABalance = Number(getValue(hdr, rowArr, HEADERS.P2_EX_Q1)) || 0;
    currentBalances.retirement += tradIRABalance;
  }
  
  // Write current balances to new columns (for document generation)
  const retStartCol = hdr[HEADERS.RETIREMENT_STARTING_BALANCE];
  if (retStartCol) {
    ws.getRange(rowNum, retStartCol)
      .setValue(currentBalances.retirement)
      .setNumberFormat('$#,##0');
  }
  const eduStartCol = hdr[HEADERS.EDUCATION_STARTING_BALANCE];
  if (eduStartCol) {
    ws.getRange(rowNum, eduStartCol)
      .setValue(currentBalances.education)
      .setNumberFormat('$#,##0');
  }
  const healthStartCol = hdr[HEADERS.HEALTH_STARTING_BALANCE];
  if (healthStartCol) {
    ws.getRange(rowNum, healthStartCol)
      .setValue(currentBalances.health)
      .setNumberFormat('$#,##0');
  }
  const familyStartCol = hdr[HEADERS.FAMILY_BANK_STARTING_BALANCE];
  if (familyStartCol) {
    ws.getRange(rowNum, familyStartCol)
      .setValue(currentBalances.family_bank)
      .setNumberFormat('$#,##0');
  }
  
  // 4. Consolidate monthly contributions by domain
  const actualTotals = consolidateByDomain(hdr, rowArr, 'actual');
  const idealTotals = consolidateByDomain(hdr, rowArr, 'ideal');
  
  // 5. Calculate future values INCLUDING starting balances
  const domains = ['retirement', 'education', 'health', 'family_bank'];
  const errorDetails = {}; // Track errors for admin notification
  
  domains.forEach(domain => {
    try {
      // Use different growth rates: 5% for family bank, personalized rate for others
      const growthRate = (domain === 'family_bank') ? 0.05 : annualRate;
      
      // Skip FV calculation for extremely long timelines or invalid values
      const timeline = timelines[domain];
      if (timeline <= 0 || timeline >= 99 || !timeline || isNaN(timeline)) {
        const errorMsg = `Invalid timeline: ${timeline}`;
        Logger.log(`⚠️ Skipping ${domain} FV calculation - ${errorMsg}`);
        if (timeline !== 99) { // Don't report 99 year timeline as error (expected for no children)
          errorDetails[domain] = errorMsg;
        }
        // Write 0 for domains with no meaningful timeline
        const actualCol = domain === 'family_bank' ? hdr[HEADERS.FAMILY_BANK_FV_ACTUAL] : hdr[HEADERS[`${domain.toUpperCase()}_FV_ACTUAL`]];
        const idealCol = domain === 'family_bank' ? hdr[HEADERS.FAMILY_BANK_FV_IDEAL] : hdr[HEADERS[`${domain.toUpperCase()}_FV_IDEAL`]];
        
        if (actualCol) ws.getRange(rowNum, actualCol).setValue(0).setNumberFormat('$#,##0');
        if (idealCol) ws.getRange(rowNum, idealCol).setValue(0).setNumberFormat('$#,##0');
        return; // Skip to next domain
      }
      
      // Validate growth rate
      if (!growthRate || isNaN(growthRate) || growthRate < 0 || growthRate > 1) {
        const errorMsg = `Invalid growth rate: ${growthRate}`;
        Logger.log(`⚠️ Invalid growth rate for ${domain}: ${growthRate}`);
        errorDetails[domain] = errorMsg;
        return;
      }
    
    // Calculate FV of starting balance grown at the rate (with safeguards)
    let startingFV = 0;
    if (currentBalances[domain] > 0) {
      // Cap timeline for starting balance calculation
      const cappedTimeline = Math.min(timeline, 70);
      const cappedRate = Math.min(growthRate, 0.25);
      
      const growthFactor = Math.pow(1 + cappedRate, cappedTimeline);
      if (!isFinite(growthFactor) || growthFactor > 1000000) {
        Logger.log(`⚠️ Starting balance growth too large for ${domain}, limiting`);
        startingFV = Math.min(currentBalances[domain] * 1000000, 100000000);
      } else {
        startingFV = currentBalances[domain] * growthFactor;
      }
    }
    
    // Calculate FV of monthly contributions (futureValue already has safeguards)
    const actualContribFV = futureValue(actualTotals[domain], growthRate, timeline);
    const idealContribFV = futureValue(idealTotals[domain], growthRate, timeline);
    
    // Total FV = Starting balance FV + Contributions FV (with cap)
    const MAX_TOTAL_FV = 100000000; // $100 million cap
    let actualFV = Math.round(startingFV + actualContribFV);
    let idealFV = Math.round(startingFV + idealContribFV);
    
    // Apply total cap
    if (actualFV > MAX_TOTAL_FV) {
      Logger.log(`⚠️ ${domain} actual FV ($${actualFV.toLocaleString()}) exceeds cap, limiting`);
      actualFV = MAX_TOTAL_FV;
    }
    if (idealFV > MAX_TOTAL_FV) {
      Logger.log(`⚠️ ${domain} ideal FV ($${idealFV.toLocaleString()}) exceeds cap, limiting`);
      idealFV = MAX_TOTAL_FV;
    }
    
    // Write actual FV (handle family_bank specially)
    const actualColKey = domain === 'family_bank' ? 'FAMILY_BANK_FV_ACTUAL' : `${domain.toUpperCase()}_FV_ACTUAL`;
    const actualCol = hdr[HEADERS[actualColKey]];
    if (actualCol) {
      ws.getRange(rowNum, actualCol)
        .setValue(actualFV)
        .setNumberFormat('$#,##0');
    }
    
    // Write ideal FV
    const idealColKey = domain === 'family_bank' ? 'FAMILY_BANK_FV_IDEAL' : `${domain.toUpperCase()}_FV_IDEAL`;
    const idealCol = hdr[HEADERS[idealColKey]];
    if (idealCol) {
      ws.getRange(rowNum, idealCol)
        .setValue(idealFV)
        .setNumberFormat('$#,##0');
    }
    } catch (error) {
      Logger.log(`❌ Error calculating FV for ${domain}: ${error.message}`);
      errorDetails[domain] = error.message;
      
      // Write 0 on error
      const actualCol = domain === 'family_bank' ? hdr[HEADERS.FAMILY_BANK_FV_ACTUAL] : hdr[HEADERS[`${domain.toUpperCase()}_FV_ACTUAL`]];
      const idealCol = domain === 'family_bank' ? hdr[HEADERS.FAMILY_BANK_FV_IDEAL] : hdr[HEADERS[`${domain.toUpperCase()}_FV_IDEAL`]];
      
      if (actualCol) ws.getRange(rowNum, actualCol).setValue(0).setNumberFormat('$#,##0');
      if (idealCol) ws.getRange(rowNum, idealCol).setValue(0).setNumberFormat('$#,##0');
    }
  });
  
  // Send admin notification if there were any errors
  if (Object.keys(errorDetails).length > 0) {
    notifyAdminOfFVError(rowNum, errorDetails);
    Logger.log(`⚠️ FV calculations completed with errors for row ${rowNum} - admin notified`);
  } else {
    Logger.log(`✅ Future values calculated for row ${rowNum} including starting balances and Family Bank at 5% growth`);
  }
}

/**
 * Send admin notification when FV calculation errors occur
 * @param {number} rowNum - Row number with error
 * @param {Object} errorDetails - Details about the errors
 */
function notifyAdminOfFVError(rowNum, errorDetails) {
  try {
    const { sheet: ws, hdr } = initWS();
    const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
    
    // Get user info
    const fullName = getValue(hdr, rowArr, HEADERS.FULL_NAME) || 'Unknown';
    const email = getValue(hdr, rowArr, HEADERS.EMAIL) || 'No email';
    const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID) || 'Unknown';
    
    // Build error summary
    let errorSummary = '';
    Object.entries(errorDetails).forEach(([domain, error]) => {
      if (error) {
        errorSummary += `\n• ${domain}: ${error}`;
      }
    });
    
    // Create email body
    const emailBody = `
Future Value Calculation Error Alert

Row: ${rowNum}
User: ${fullName} (${email})
Profile: ${profileId}
Timestamp: ${new Date().toLocaleString()}

Errors Encountered:${errorSummary}

Debugging Information:
- Spreadsheet: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit#gid=0&range=${rowNum}:${rowNum}
- Check for invalid data in Phase 2 responses
- Verify timeline values (retirement_years_until_target, etc.)
- Check for text in numeric fields
- Verify percentage values are between 0-100

The system has written $0 values for the failed calculations to prevent #NUM! errors.

Please review and correct the data manually.
    `;
    
    // Send email to admin
    GmailApp.sendEmail(
      CONFIG.ADMIN_EMAIL,
      `⚠️ FV Calculation Error - Row ${rowNum} - ${fullName}`,
      emailBody,
      {
        name: 'TruPath Automation',
        replyTo: 'no-reply@trupathmastery.com'
      }
    );
    
    Logger.log(`📧 Admin notified of FV errors for row ${rowNum}`);
  } catch (notifyError) {
    Logger.log(`❌ Failed to notify admin: ${notifyError.message}`);
  }
}

/**
 * Test Phase 3 Future Value calculations
 * Run this after a successful Phase 2 test to verify FV calculations
 */
function testPhase3() {
  try {
    const { sheet: ws, hdr } = initWS();
    
    // Find a row with Phase 2 data (has ideal values)
    let testRow = 3; // Start with row 3
    
    // Try to find a row with Phase 2 data
    for (let row = 3; row <= 30; row++) {
      const testArr = ws.getRange(row, 1, 1, ws.getLastColumn()).getValues()[0];
      const hasData = getValue(hdr, testArr, 'family_bank_ideal') || 
                     getValue(hdr, testArr, 'health_hsa_ideal');
      if (hasData) {
        testRow = row;
        Logger.log(`Found test data in row ${row}`);
        break;
      }
    }
    
    const rowArr = ws.getRange(testRow, 1, 1, ws.getLastColumn()).getValues()[0];
    
    // Check if row has Phase 2 data by looking for any ideal column
    const hasIdealData = getValue(hdr, rowArr, 'retirement_traditional_401k_ideal') || 
                        getValue(hdr, rowArr, 'health_hsa_ideal') ||
                        getValue(hdr, rowArr, 'family_bank_ideal');
    if (!hasIdealData) {
      Logger.log('❌ Test row does not have Phase 2 data. Run Phase 2 first.');
      return;
    }
    
    // Run Phase 3
    Logger.log('🧪 Testing Phase 3 calculations...');
    runPhase3(testRow);
    
    // Read back results
    const updatedRowArr = ws.getRange(testRow, 1, 1, ws.getLastColumn()).getValues()[0];
    
    // Log results
    const rate = getValue(hdr, updatedRowArr, HEADERS.PERSONALIZED_ANNUAL_RATE);
    Logger.log(`📊 Personalized Rate: ${(rate * 100).toFixed(2)}%`);
    
    const domains = ['retirement', 'education', 'health'];
    domains.forEach(domain => {
      const actualFV = getValue(hdr, updatedRowArr, HEADERS[`${domain.toUpperCase()}_FV_ACTUAL`]);
      const idealFV = getValue(hdr, updatedRowArr, HEADERS[`${domain.toUpperCase()}_FV_IDEAL`]);
      Logger.log(`💰 ${domain}: Actual FV = $${actualFV}, Ideal FV = $${idealFV}`);
    });
    
    Logger.log('✅ Phase 3 test complete');
  } catch (error) {
    Logger.log(`❌ Phase 3 test failed: ${error.message}`);
    console.error(error);
  }
}

/**
 * Comprehensive test for Phase 3 edge cases
 */
function testPhase3EdgeCases() {
  Logger.log('\n=== Testing Phase 3 Edge Cases ===');
  
  const { sheet: ws, hdr } = initWS();
  
  // Test 1: Zero contributions
  Logger.log('\n1️⃣ Test: Zero contributions');
  const zeroFV = futureValue(0, 0.12, 20);
  Logger.log(`Zero contribution FV: $${zeroFV} (should be $0)`);
  
  // Test 2: High investment score (7,7,7)
  Logger.log('\n2️⃣ Test: Maximum investment score');
  const maxRate = FV_CONFIG.BASE_RATE + FV_CONFIG.MAX_ADDITIONAL_RATE;
  Logger.log(`Max rate: ${(maxRate * 100).toFixed(2)}% (should be 20%)`);
  
  // Test 3: 99 year timeline (no children)
  Logger.log('\n3️⃣ Test: 99 year timeline');
  const noChildrenFV = futureValue(500, 0.12, 99);
  Logger.log(`99 year FV: $${noChildrenFV} (should be $0)`);
  
  // Test 4: Negative values
  Logger.log('\n4️⃣ Test: Negative contribution');
  const negativeFV = futureValue(-500, 0.12, 20);
  Logger.log(`Negative contribution FV: $${negativeFV} (should be $0)`);
  
  // Test 5: Very high contribution
  Logger.log('\n5️⃣ Test: High contribution ($10,000/month for 30 years at 15%)');
  const highFV = futureValue(10000, 0.15, 30);
  Logger.log(`High contribution FV: $${highFV.toLocaleString()}`);
  
  // Test 6: Domain consolidation with missing headers
  Logger.log('\n6️⃣ Test: Domain consolidation');
  const testRow = 3;
  const rowArr = ws.getRange(testRow, 1, 1, ws.getLastColumn()).getValues()[0];
  const actualTotals = consolidateByDomain(hdr, rowArr, 'actual');
  Logger.log(`Consolidation totals: Retirement=$${actualTotals.retirement}, Education=$${actualTotals.education}, Health=$${actualTotals.health}`);
  
  Logger.log('\n✅ Edge case testing complete');
}

/**
 * Test Phase 3 with specific scenarios
 */
function testPhase3Scenarios() {
  Logger.log('\n=== Testing Phase 3 Scenarios ===');
  
  // Scenario 1: Young professional (25 years to retirement)
  Logger.log('\n📊 Scenario 1: Young Professional');
  const youngFV = futureValue(1000, 0.12, 25);
  Logger.log(`$1,000/month for 25 years at 12%: $${youngFV.toLocaleString()}`);
  
  // Scenario 2: Late starter (10 years to retirement)
  Logger.log('\n📊 Scenario 2: Late Starter');
  const lateFV = futureValue(3000, 0.10, 10);
  Logger.log(`$3,000/month for 10 years at 10%: $${lateFV.toLocaleString()}`);
  
  // Scenario 3: Education planning (15 years)
  Logger.log('\n📊 Scenario 3: Education Planning');
  const eduFV = futureValue(500, 0.08, 15);
  Logger.log(`$500/month for 15 years at 8%: $${eduFV.toLocaleString()}`);
  
  Logger.log('\n✅ Scenario testing complete');
}

/**
 * Run Phase 3: Future Value Calculations
 * Can be called automatically from Phase 2 or manually for specific rows
 * @param {number} rowNum - Row number in the Working Sheet
 */
function runPhase3(rowNum) {
  try {
    Logger.log(`🔮 Phase 3 starting for row ${rowNum}`);
    
    // Initialize and get data
    const { sheet: ws, hdr } = initWS();
    const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
    const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID);
    
    // Run future value calculations
    calculateAndWriteFutureValues(hdr, rowArr, rowNum, profileId);
    
    // Generate retirement blueprint document
    try {
      if (typeof generateRetirementBlueprint === 'function') {
        generateRetirementBlueprint(rowNum);
        Logger.log(`📄 Generated retirement blueprint document for row ${rowNum}`);
      }
    } catch (docError) {
      Logger.log(`⚠️ Document generation error for row ${rowNum}: ${docError.message}`);
      // Don't throw - document generation failure shouldn't stop Phase 3
    }
    
    Logger.log(`✅ Phase 3 complete for row ${rowNum}`);
  } catch (error) {
    Logger.log(`❌ Phase 3 error for row ${rowNum}: ${error.message}`);
    throw error;
  }
}

/**
 * Main processing engine - orchestrates the entire allocation process
 */
function runUniversalEngine(rowNum) {
  Logger.log('runUniversalEngine ▶ START row=%s', rowNum);

  // 1) Read row
  const { sheet: sh, hdr } = initWS();
  const rowArr = sh.getRange(rowNum, 1, 1, sh.getLastColumn()).getValues()[0];

  // 2) Domain weights
  const inv1 = Number(getValue(hdr, rowArr, HEADERS.P2_INV_INVOLVEMENT));
  const inv2 = Number(getValue(hdr, rowArr, HEADERS.P2_INV_TIME));
  const inv3 = Number(getValue(hdr, rowArr, HEADERS.P2_INV_CONFIDENCE));
  const Sbar = (inv1 + inv2 + inv3) / 3;
  const rAnn = 0.08 + ((Sbar - 1) / 6) * 0.12;
  const rMonthly = rAnn / 12;
  const domObj = computeDomainsAndWeights(rowArr, hdr, rMonthly);
  const domains = {
    Education:  { w: domObj.Education.w },
    Health:     { w: domObj.Health.w },
    Retirement: { w: domObj.Retirement.w }
  };

  // 3) Net income & user add‐pct
  const netIncome  = Number(getValue(hdr, rowArr, HEADERS.NET_MONTHLY_INCOME));
  const userAddPct = Number(getValue(hdr, rowArr, HEADERS.ALLOCATION_PERCENTAGE)) || 0;

  // 4) Profile helper
  const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID);
  const helper    = profileHelpers[profileId];
  if (!helper) throw new Error(`No helper for profile '${profileId}'`);
  const { seeds, vehicleOrders } = helper(rowArr, hdr);

  // 5) Net‐pool calculation - MODIFIED FOR NEW LOGIC
  // Check if we're using the new total percentage logic
  const useNewLogic = true; // Feature flag - set to true to enable new logic
  
  let netPool;
  if (useNewLogic) {
    // NEW LOGIC: Treat percentage as TOTAL, not additional
    // For ideal calculations, we'll use empty discretionary seeds
    const emptySeeds = { Education: {}, Health: {}, Retirement: {} };
    netPool = computeNetPoolTotal(netIncome, emptySeeds, userAddPct, CONFIG.OPTIMIZED_SAVINGS_RATE);
  } else {
    // OLD LOGIC: Treat percentage as additional
    netPool = computeNetPool(netIncome, seeds, userAddPct, CONFIG.OPTIMIZED_SAVINGS_RATE);
  }

  // 6) Allocate and round
  // For the new logic, we allocate WITHOUT seeds (they'll be added separately for non-discretionary)
  const allocSeeds = useNewLogic ? { Education: {}, Health: {}, Retirement: {} } : seeds;
  const raw = coreAllocate({ domains, pool: netPool, seeds: allocSeeds, vehicleOrders });
  const vehicles = {};
  for (const domain of Object.keys(raw)) {
    vehicles[domain] = {};
    for (const [veh, amt] of Object.entries(raw[domain])) {
      vehicles[domain][veh] = Math.round(amt);
    }
  }

  Logger.log('runUniversalEngine ▶ COMPLETE row=%s', rowNum);
  return { domains, vehicles, vehicleOrders };
}
