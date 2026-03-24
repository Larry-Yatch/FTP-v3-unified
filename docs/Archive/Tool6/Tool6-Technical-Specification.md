# **Tool 6: Retirement Blueprint Calculator - Technical Specification**

## **Document Control**
- **Version:** 1.0
- **Date:** December 31, 2024
- **Author:** Agent Girl (Architecture Team)
- **Status:** Draft for Review
- **Target Release:** Q1 2025

---

## **Table of Contents**
1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Data Models](#3-data-models)
4. [Core Algorithms](#4-core-algorithms)
5. [User Interface Specification](#5-user-interface-specification)
6. [Integration Points](#6-integration-points)
7. [Development Phases](#7-development-phases)
8. [Testing Strategy](#8-testing-strategy)
9. [Appendices](#9-appendices)

---

## **1. Executive Summary**

### **1.1 Purpose**
Transform the existing Tool 6 (Retirement Blueprint) from a two-phase Google Forms system with backend processing into an interactive, real-time calculator integrated into the FTP-v3 framework.

### **1.2 Goals**
- **Reduce User Burden:** 90+ questions → ~20 questions + interactive sliders
- **Increase Engagement:** Real-time feedback and validation
- **Improve Accuracy:** Cross-tool data integration eliminates redundant questions
- **Enhance Understanding:** Visual projections and scenario comparison
- **Maintain Quality:** Preserve sophisticated allocation logic from legacy system

### **1.3 Success Metrics**
- Completion rate > 80% (vs current ~45% for two-phase system)
- Time to complete < 20 minutes (vs current 35+ minutes)
- User satisfaction score > 4.5/5
- Allocation accuracy maintained at 100% (IRS compliance)
- GPT insight generation > 95% success rate

### **1.4 Key Features**
1. ✅ **Auto-classification** into 9 retirement profiles
2. ✅ **Interactive allocation** with real-time sliders
3. ✅ **Cross-tool data integration** from Tools 1-5
4. ✅ **Trauma-informed** progressive disclosure
5. ✅ **IRS limit validation** with catch-up rules
6. ✅ **Future value projections** with charts
7. ✅ **Scenario management** (save/compare multiple strategies)
8. ✅ **PDF blueprint generation** with personalized narratives

---

## **2. System Architecture**

### **2.1 Component Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    FTP-v3 Framework Core                     │
├─────────────────────────────────────────────────────────────┤
│  ToolRegistry  │  InsightsPipeline  │  DataService  │ Router│
└────────┬────────────────────┬───────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                         Tool 6                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Tool6.js    │  │ Tool6Validation  │  │Tool6Vehicles │ │
│  │  (Main Logic) │  │  (IRS Rules)     │  │  (Profiles)  │ │
│  └───────┬───────┘  └────────┬─────────┘  └──────┬───────┘ │
│          │                   │                    │          │
│          └───────────────────┴────────────────────┘          │
│                              │                                │
│          ┌───────────────────┴─────────────────┐            │
│          │                                       │            │
│  ┌───────▼──────┐  ┌────────────┐  ┌──────────▼────────┐  │
│  │Tool6GPT      │  │Tool6       │  │Tool6PDF          │  │
│  │Analysis      │  │Projections │  │Generator         │  │
│  └──────────────┘  └────────────┘  └───────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **2.2 File Structure**

```
/tools/tool6/
├── Tool6.js                      // Main calculator controller (2500 lines)
│   ├── Class Tool6 extends BaseTool
│   ├── Page rendering methods
│   ├── State management
│   ├── Event handlers
│   └── Cross-tool integration
│
├── Tool6VehicleHelpers.js        // Profile & vehicle logic (1500 lines)
│   ├── profileClassifier()       // Auto-classify into 9 profiles
│   ├── getProfileVehicles()      // Return relevant vehicles per profile
│   ├── buildVehicleOrder()       // Priority ordering per profile
│   ├── PROFILE_DEFINITIONS       // 9 profile configurations
│   └── VEHICLE_CATALOG           // 15+ vehicle definitions
│
├── Tool6Validation.js            // IRS rules & validation (800 lines)
│   ├── validateVehicleAmount()   // Check against IRS limits
│   ├── checkCatchUpEligibility() // Age-based catch-up rules
│   ├── validateRothPhaseOut()    // Income-based Roth limits
│   ├── checkEmployerMatch()      // Employer match calculations
│   ├── IRS_LIMITS_2025           // Hardcoded annual limits
│   └── generateWarnings()        // User-facing validation messages
│
├── Tool6Projections.js           // Future value calculations (600 lines)
│   ├── calculateFutureValue()    // Compound growth projections
│   ├── estimateRetirementIncome()// 4% rule calculations
│   ├── calculateInvestmentScore()// Risk/involvement/confidence
│   ├── projectScenario()         // Project specific allocation
│   └── generateChartData()       // Data for visualization
│
├── Tool6GPTAnalysis.js           // AI insights (500 lines)
│   ├── analyzeProfile()          // GPT profile insights
│   ├── analyzeAllocation()       // GPT allocation feedback
│   ├── analyzeTaxStrategy()      // GPT tax optimization advice
│   ├── generateActionPlan()      // GPT implementation steps
│   └── 3-tier fallback system    // GPT → Retry → Fallback
│
├── Tool6Fallbacks.js             // Non-GPT analysis (400 lines)
│   ├── scoreBasedProfileInsights()
│   ├── ruleBasedAllocationAdvice()
│   ├── templateBasedActionPlan()
│   └── Static templates for common scenarios
│
├── Tool6PDFGenerator.js          // Blueprint document (800 lines)
│   ├── generateBlueprint()       // Master PDF generation
│   ├── buildNarrative()          // Personalized story sections
│   ├── buildAllocationTable()    // Vehicle recommendations table
│   ├── buildProjectionCharts()   // Future value visualizations
│   └── buildActionPlan()         // Step-by-step implementation
│
├── tool6.manifest.json           // Tool configuration
└── README.md                     // Documentation
```

### **2.3 Technology Stack**

- **Language:** JavaScript (ES6+)
- **Framework:** FTP-v3 Custom Framework (Google Apps Script compatible)
- **Data Storage:** Google Sheets via DataService abstraction
- **UI:** Vanilla JS + CSS (no external dependencies)
- **AI:** OpenAI GPT-4 via framework integration
- **PDF:** Google Docs API for document generation
- **Charts:** HTML5 Canvas for projections

---

## **3. Data Models**

### **3.1 Primary State Object**

```javascript
Tool6State = {
  // ===== SESSION METADATA =====
  sessionId: String,              // From framework
  userId: String,                 // Student identifier
  startedAt: Timestamp,
  completedAt: Timestamp | null,
  currentPage: String,            // 'pre-survey' | 'profile' | 'priorities' | etc.

  // ===== CROSS-TOOL INSIGHTS =====
  insights: {
    tool1: {
      age: Number,                // Required
      workSituation: String,      // 'W-2 employee' | 'Self-employed' | 'Both'
      ownsBusiness: Boolean,
      hasEmployees: Boolean,
      hasRothIRA: Boolean,
      hasTraditionalIRA: Boolean
    },
    tool2: {
      financialDiscipline: Number,  // 1-7 scale
      longTermThinking: Number,
      riskTolerance: Number,
      impulsiveSpending: Number,
      scarcityMindset: Number
    },
    tool3: {
      // Trauma modifiers if needed
    },
    tool4: {
      monthlyNetIncome: Number,   // Required
      filingStatus: String,       // 'Single' | 'Married Filing Jointly'
      emergencyFundMonths: Number,
      debtPayoffMonths: Number,
      multiplyPercentage: Number  // Current savings rate
    }
  },

  // ===== PRE-SURVEY =====
  preSurvey: {
    // Auto-populated (readonly)
    age: Number,
    monthlyIncome: Number,
    filingStatus: String,
    workSituation: String,
    ownsBusiness: Boolean,
    hasEmployees: Boolean,

    // User inputs (new)
    retirementAge: Number,        // Target retirement age (50-80)
    yearsToRetirement: Number,    // Calculated: retirementAge - age
    desiredRetirementIncome: Number, // Monthly goal in today's dollars

    // Employment details (conditionally shown)
    hasEmployer401k: Boolean,
    employerMatchesContributions: Boolean,
    employerMatchFormula: String, // e.g., "50% up to 6%"
    employer401kHasRoth: Boolean,

    // Business details (conditionally shown)
    businessType: String,         // 'Sole Prop' | 'LLC' | 'S-Corp' | 'C-Corp'
    businessIncome: Number,       // Annual gross

    // Health & Education
    hsaEligible: Boolean,
    hasChildren: Boolean,
    numberOfChildren: Number,
    yearsUntilCollegeFunding: Number
  },

  // ===== PROFILE CLASSIFICATION =====
  profile: {
    calculatedProfileId: String,  // Auto-classified (1_ROBS_In_Use, 2_ROBS_Curious, etc.)
    confirmedProfileId: String,   // User confirmed or overridden
    profileTitle: String,         // "ROBS-In-Use Strategist"
    profileDescription: String,   // Long description
    profileIcon: String,          // Emoji
    characteristics: Array<String>, // Bullet points
    confidenceScore: Number,      // 0-100

    // Why this profile?
    classificationReasons: Array<{
      factor: String,             // e.g., "You own a business"
      weight: Number,             // Contribution to classification
      description: String
    }>
  },

  // ===== DOMAIN PRIORITIES =====
  priorities: {
    retirement: {
      // Ambition Quotient inputs
      importance: Number,         // 1-7 scale
      anxiety: Number,            // 1-7 scale
      motivation: Number,         // 1-7 scale

      // Urgency calculation
      yearsUntilNeed: Number,
      urgencyScore: Number,       // Calculated: importance × anxiety × motivation × timeWeight

      // Weight allocation
      calculatedWeight: Number,   // 0.0-1.0 (auto-calculated)
      userWeight: Number,         // 0.0-1.0 (user can override)
      isUserOverride: Boolean
    },

    education: {
      importance: Number,
      anxiety: Number,
      motivation: Number,
      yearsUntilNeed: Number,
      urgencyScore: Number,
      calculatedWeight: Number,
      userWeight: Number,
      isUserOverride: Boolean,

      // Education-specific
      hasChildren: Boolean,
      numberOfChildren: Number,
      estimatedCostPerChild: Number
    },

    health: {
      importance: Number,
      anxiety: Number,
      motivation: Number,
      yearsUntilNeed: Number,
      urgencyScore: Number,
      calculatedWeight: Number,
      userWeight: Number,
      isUserOverride: Boolean,

      // Health-specific
      hsaEligible: Boolean,
      targetHSABalance: Number
    }
  },

  // ===== CURRENT CONTRIBUTIONS =====
  currentContributions: {
    // Key: vehicleId, Value: monthly amount
    traditional401k: Number,
    roth401k: Number,
    traditionalIRA: Number,
    rothIRA: Number,
    hsa: Number,
    solo401kEmployee: Number,
    solo401kEmployer: Number,
    cesa: Number,
    // ... etc for all vehicles

    totalMonthly: Number,         // Sum of all
    savingsRatePercentage: Number // totalMonthly / monthlyIncome
  },

  // ===== NON-DISCRETIONARY CONTRIBUTIONS =====
  nonDiscretionary: {
    employerMatch: {
      monthlyAmount: Number,
      annualAmount: Number,
      formula: String,            // "50% up to 6% of salary"
      calculation: String,        // "($5,000/mo × 6%) × 50% = $150/mo"
      isLocked: true,
      category: 'free-money'
    },

    robsProfitDistribution: {
      monthlyAmount: Number,
      annualAmount: Number,
      isLocked: true,
      category: 'business-required'
    },

    solo401kEmployerContribution: {
      monthlyAmount: Number,
      annualAmount: Number,
      calculation: String,        // "Business net income × 20%"
      isLocked: true,
      category: 'business-required'
    }
  },

  // ===== ALLOCATION CALCULATOR =====
  allocation: {
    // Pool calculation
    monthlyNetIncome: Number,
    targetSavingsRate: Number,      // From Tool 4 or default 0.20
    discretionaryPool: Number,      // monthlyNetIncome × targetSavingsRate
    nonDiscretionaryTotal: Number,  // Sum of locked contributions
    totalPool: Number,              // discretionaryPool + nonDiscretionaryTotal

    // Allocation tracking
    allocatedAmount: Number,        // Sum of all vehicle allocations
    remainingAmount: Number,        // totalPool - allocatedAmount
    allocationPercentage: Number,   // allocatedAmount / totalPool

    // Vehicle allocations
    vehicles: Array<{
      // Identity
      id: String,                   // 'hsa', 'traditional401k', etc.
      name: String,                 // "HSA (Health Savings Account)"
      category: String,             // 'retirement' | 'education' | 'health'
      domain: String,               // Same as category (legacy naming)

      // Priority
      priority: Number,             // 1-15 (display order)
      isRelevant: Boolean,          // Show for this profile?
      isRequired: Boolean,          // Must contribute (e.g., employer match)

      // Amounts
      currentAmount: Number,        // What they contribute now
      recommendedAmount: Number,    // Algorithm's suggestion
      userAmount: Number,           // User's actual allocation

      // Limits
      monthlyLimit: Number,         // IRS monthly cap
      annualLimit: Number,          // IRS annual cap
      isAtLimit: Boolean,           // userAmount >= monthlyLimit

      // UI State
      isLocked: Boolean,            // Slider locked?
      isCollapsed: Boolean,         // Details collapsed?

      // Education
      taxTreatment: String,         // 'pre-tax' | 'post-tax' | 'triple' | 'tax-free'
      explanation: String,          // Short description
      detailedExplanation: String,  // Long description
      actionItems: Array<String>,   // Implementation steps

      // IRS Rules
      irsRules: {
        requiresHDHP: Boolean,      // For HSA
        combinedLimit: Boolean,     // e.g., Trad + Roth 401k share limit
        catchUpAge: Number,         // Age when catch-up available
        catchUpAmount: Number,      // Additional annual limit
        phaseOutStart: Number,      // Income phase-out start
        phaseOutEnd: Number,        // Income phase-out end
        requiresC-Corp: Boolean,    // For ROBS
        requiresSelfEmployment: Boolean
      },

      // Warnings
      warnings: Array<{
        type: String,               // 'error' | 'warning' | 'info'
        message: String,
        resolution: String          // How to fix
      }>
    }>,

    // Validation
    isValid: Boolean,
    errors: Array<String>,
    warnings: Array<String>,
    suggestions: Array<String>
  },

  // ===== TAX STRATEGY =====
  taxStrategy: {
    // Preference
    preference: String,             // 'traditional' | 'roth' | 'balanced'
    inferredPreference: String,     // What algorithm suggests
    isUserOverride: Boolean,

    // Tax situation
    currentTaxBracket: Number,      // 0.10, 0.12, 0.22, 0.24, etc.
    estimatedRetirementBracket: Number,
    bracketDifferential: Number,    // Positive = save with Traditional

    // Roth vs Traditional balance
    rothPercentage: Number,         // 0.0-1.0 of retirement savings
    traditionalPercentage: Number,  // 1.0 - rothPercentage
    recommendedRothPercentage: Number,

    // Phase-out warnings
    rothIRAPhaseOut: {
      isPhaseOutRange: Boolean,
      phaseOutPercentage: Number,   // 0-100
      reducedLimit: Number          // Actual limit after phase-out
    }
  },

  // ===== PROJECTIONS =====
  projections: {
    // Investment assumptions
    investmentScore: Number,        // 1-7 calculated from involvement/time/confidence
    annualReturnRate: Number,       // 0.08-0.20 based on score
    inflationRate: Number,          // Default 0.03
    yearsToRetirement: Number,

    // Current path (what they're doing now)
    current: {
      retirement: {
        monthlyContribution: Number,
        startingBalance: Number,
        futureValue: Number,
        retirementIncome: Number    // At 4% withdrawal rate
      },
      education: {
        monthlyContribution: Number,
        startingBalance: Number,
        futureValue: Number
      },
      health: {
        monthlyContribution: Number,
        startingBalance: Number,
        futureValue: Number
      },
      totalFutureValue: Number
    },

    // Recommended path (algorithm's suggestion)
    recommended: {
      retirement: { /* same structure */ },
      education: { /* same structure */ },
      health: { /* same structure */ },
      totalFutureValue: Number
    },

    // User scenario (their interactive allocation)
    userScenario: {
      retirement: { /* same structure */ },
      education: { /* same structure */ },
      health: { /* same structure */ },
      totalFutureValue: Number
    },

    // Comparison
    improvement: {
      recommendedVsCurrent: Number, // Dollar difference
      userVsCurrent: Number,
      recommendedVsUser: Number
    },

    // Chart data
    chartData: {
      years: Array<Number>,         // [0, 1, 2, ..., 30]
      currentPath: Array<Number>,   // FV at each year
      recommendedPath: Array<Number>,
      userPath: Array<Number>
    }
  },

  // ===== SCENARIOS =====
  scenarios: Array<{
    id: String,                     // UUID
    name: String,                   // "Conservative", "Aggressive", etc.
    description: String,
    isActive: Boolean,              // Currently viewing?
    createdAt: Timestamp,

    // Snapshot of entire allocation state
    snapshot: {
      allocation: { /* copy of allocation object */ },
      projections: { /* copy of projections object */ }
    }
  }>,

  // ===== GPT ANALYSIS =====
  gptAnalysis: {
    profileInsights: {
      content: String,              // Markdown formatted
      generatedAt: Timestamp,
      usedFallback: Boolean,
      tier: Number                  // 1=GPT, 2=Retry, 3=Fallback
    },

    allocationInsights: {
      content: String,
      generatedAt: Timestamp,
      usedFallback: Boolean,
      tier: Number
    },

    taxStrategyInsights: {
      content: String,
      generatedAt: Timestamp,
      usedFallback: Boolean,
      tier: Number
    },

    actionPlan: {
      immediate: Array<String>,     // Week 1 actions
      thirtyDay: Array<String>,     // 30-day actions
      ninetyDay: Array<String>,     // 90-day actions
      ongoing: Array<String>,       // Quarterly/annual
      generatedAt: Timestamp,
      usedFallback: Boolean
    }
  },

  // ===== COMPLETION =====
  completion: {
    isComplete: Boolean,
    completedAt: Timestamp,
    pdfUrl: String,                 // Google Docs URL
    pdfGeneratedAt: Timestamp,
    emailSent: Boolean,
    emailSentAt: Timestamp
  }
}
```

---

## **4. Core Algorithms**

### **4.1 Profile Classification Algorithm**

**Purpose:** Auto-classify user into 1 of 9 retirement profiles based on cross-tool insights and pre-survey answers.

**Input:**
- `insights` (Tools 1-4 data)
- `preSurvey` (Tool 6 specific inputs)

**Output:**
- `profileId` (1_ROBS_In_Use, 2_ROBS_Curious, etc.)
- `confidenceScore` (0-100)
- `classificationReasons` (array of factors)

**Algorithm:**

```javascript
function classifyProfile(insights, preSurvey) {
  const scores = {
    '1_ROBS_In_Use': 0,
    '2_ROBS_Curious': 0,
    '3_Solo401k_Builder': 0,
    '4_Roth_Reclaimer': 0,
    '5_Bracket_Strategist': 0,
    '6_Catch_Up': 0,
    '7_Foundation_Builder': 0,
    '8_Biz_Owner_Group': 0,
    '9_Late_Stage_Growth': 0
  };

  const reasons = [];

  // === RULE 1: ROBS Detection ===
  if (preSurvey.usesROBS === true) {
    scores['1_ROBS_In_Use'] += 100;
    reasons.push({
      factor: 'Currently using ROBS structure',
      weight: 100,
      description: 'You indicated you have an active ROBS (Rollover for Business Startups) plan'
    });
    // Early return - ROBS In Use is definitive
    return {
      profileId: '1_ROBS_In_Use',
      confidenceScore: 100,
      reasons
    };
  }

  if (preSurvey.interestedInROBS === true &&
      preSurvey.ownsBusiness === true &&
      preSurvey.hasRolloverAccount === true) {
    scores['2_ROBS_Curious'] += 80;
    reasons.push({
      factor: 'Interested in ROBS with qualifying factors',
      weight: 80,
      description: 'You have business ownership and rollover funds available'
    });
  }

  // === RULE 2: Self-Employment Detection ===
  const isSelfEmployed = insights.tool1.workSituation === 'Self-employed';
  const hasBusiness = insights.tool1.ownsBusiness === true;
  const hasEmployees = insights.tool1.hasEmployees === true;

  if (isSelfEmployed && hasBusiness && !hasEmployees) {
    scores['3_Solo401k_Builder'] += 70;
    reasons.push({
      factor: 'Self-employed without employees',
      weight: 70,
      description: 'Solo 401(k) is your optimal vehicle'
    });
  }

  if (hasBusiness && hasEmployees) {
    scores['8_Biz_Owner_Group'] += 90;
    reasons.push({
      factor: 'Business owner with W-2 employees',
      weight: 90,
      description: 'Group retirement plans and advanced strategies available'
    });
  }

  // === RULE 3: High Income / Backdoor Roth ===
  const income = insights.tool4.monthlyNetIncome * 12; // Annualize
  const filingStatus = insights.tool4.filingStatus;
  const rothPhaseOutStart = filingStatus === 'Single' ? 146000 : 230000;

  if (income > rothPhaseOutStart) {
    scores['4_Roth_Reclaimer'] += 60;
    reasons.push({
      factor: 'Income exceeds Roth IRA limits',
      weight: 60,
      description: 'Backdoor Roth IRA strategy recommended'
    });
  }

  // === RULE 4: Age-Based Detection ===
  const age = insights.tool1.age;

  if (age >= 50 && age < 60) {
    scores['6_Catch_Up'] += 50;
    reasons.push({
      factor: 'Age 50+ with catch-up eligibility',
      weight: 50,
      description: 'Additional $8,500/year in contribution room available'
    });
  }

  if (age >= 60) {
    scores['9_Late_Stage_Growth'] += 60;
    reasons.push({
      factor: 'Late-stage (age 60+)',
      weight: 60,
      description: 'Focus on final accumulation and RMD planning'
    });
  }

  // === RULE 5: Tax Strategy Focus ===
  if (preSurvey.taxMinimization === 'Now') {
    scores['5_Bracket_Strategist'] += 40;
    reasons.push({
      factor: 'Focus on current tax reduction',
      weight: 40,
      description: 'Traditional accounts prioritized'
    });
  }

  // === RULE 6: Default (Foundation Builder) ===
  // If no strong signals, this is the default
  scores['7_Foundation_Builder'] += 30;
  reasons.push({
    factor: 'Standard retirement saver profile',
    weight: 30,
    description: 'Building solid retirement foundation'
  });

  // === FINAL CLASSIFICATION ===
  // Find highest scoring profile
  let maxScore = 0;
  let selectedProfile = '7_Foundation_Builder'; // Default

  for (const [profileId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedProfile = profileId;
    }
  }

  // Calculate confidence (normalize to 0-100)
  const totalPossibleScore = 100;
  const confidenceScore = Math.min(100, Math.round((maxScore / totalPossibleScore) * 100));

  // Filter reasons to only include those that contributed
  const relevantReasons = reasons.filter(r => {
    // Check if this reason contributed to the selected profile
    return r.weight > 0;
  }).sort((a, b) => b.weight - a.weight);

  return {
    profileId: selectedProfile,
    confidenceScore,
    reasons: relevantReasons.slice(0, 5) // Top 5 reasons
  };
}
```

---

### **4.2 Domain Priority Weighting Algorithm**

**Purpose:** Calculate optimal allocation percentages across Retirement, Education, and Health domains based on urgency scoring.

**Input:**
- `priorities` object with ambition quotient scores
- `preSurvey` data for time horizons

**Output:**
- `weights` object with Retirement/Education/Health percentages (sum to 1.0)

**Algorithm:**

```javascript
function calculateDomainWeights(priorities, preSurvey) {
  // === STEP 1: Calculate Urgency Scores ===

  function calculateUrgency(domain) {
    const { importance, anxiety, motivation } = priorities[domain];
    const yearsUntilNeed = priorities[domain].yearsUntilNeed || 30;

    // Ambition quotient: average of importance, anxiety, motivation (1-7 scale)
    const ambitionQuotient = (importance + anxiety + motivation) / 3;

    // Time-based urgency multiplier
    // Closer deadlines = higher multiplier
    // Uses exponential decay: urgency increases as years decrease
    let timeMultiplier;
    if (yearsUntilNeed <= 5) {
      timeMultiplier = 2.0; // Critical urgency
    } else if (yearsUntilNeed <= 10) {
      timeMultiplier = 1.5; // High urgency
    } else if (yearsUntilNeed <= 20) {
      timeMultiplier = 1.2; // Moderate urgency
    } else {
      timeMultiplier = 1.0; // Standard urgency
    }

    // Final urgency score (1-14 scale after multiplier)
    const urgencyScore = ambitionQuotient * timeMultiplier;

    return urgencyScore;
  }

  const retirementUrgency = calculateUrgency('retirement');
  const educationUrgency = priorities.education.hasChildren ?
    calculateUrgency('education') : 0;
  const healthUrgency = priorities.health.hsaEligible ?
    calculateUrgency('health') : 0;

  // === STEP 2: Normalize to Weights ===

  const totalUrgency = retirementUrgency + educationUrgency + healthUrgency;

  // Prevent division by zero
  if (totalUrgency === 0) {
    return {
      retirement: 1.0,
      education: 0.0,
      health: 0.0
    };
  }

  let weights = {
    retirement: retirementUrgency / totalUrgency,
    education: educationUrgency / totalUrgency,
    health: healthUrgency / totalUrgency
  };

  // === STEP 3: Apply Floor Constraints ===

  // Retirement should be at least 50% (unless education is urgent)
  if (weights.retirement < 0.50 && educationUrgency < retirementUrgency) {
    weights.retirement = 0.50;
    // Redistribute remaining
    const remaining = 0.50;
    const eduHealthTotal = educationUrgency + healthUrgency;
    if (eduHealthTotal > 0) {
      weights.education = (educationUrgency / eduHealthTotal) * remaining;
      weights.health = (healthUrgency / eduHealthTotal) * remaining;
    }
  }

  // HSA should get at least 10% if eligible (triple tax advantage!)
  if (priorities.health.hsaEligible && weights.health < 0.10) {
    weights.health = 0.10;
    // Reduce others proportionally
    const reduction = 0.10 / (weights.retirement + weights.education);
    weights.retirement *= (1 - reduction);
    weights.education *= (1 - reduction);
  }

  // === STEP 4: Round and Ensure Sum = 1.0 ===

  weights.retirement = Math.round(weights.retirement * 100) / 100;
  weights.education = Math.round(weights.education * 100) / 100;
  weights.health = 1.0 - weights.retirement - weights.education; // Force exact sum

  return weights;
}
```

---

### **4.3 Vehicle Allocation Algorithm (Waterfall)**

**Purpose:** Distribute available monthly savings across investment vehicles in priority order, respecting IRS limits.

**Input:**
- `totalPool` (monthly dollars available)
- `vehicleOrder` (array of vehicles in priority sequence)
- `seeds` (non-discretionary contributions already allocated)

**Output:**
- `allocation` object mapping vehicle IDs to dollar amounts

**Algorithm:**

```javascript
function allocateWaterfall(totalPool, vehicleOrder, seeds = {}) {
  // === STEP 1: Initialize Allocations with Seeds ===

  const allocation = {};
  let remainingPool = totalPool;

  // Pre-fill with non-discretionary amounts (employer match, ROBS, etc.)
  for (const [vehicleId, seedAmount] of Object.entries(seeds)) {
    allocation[vehicleId] = seedAmount;
    // Seeds don't reduce the discretionary pool
  }

  // === STEP 2: Waterfall Allocation ===

  for (const vehicle of vehicleOrder) {
    const vehicleId = vehicle.id;

    // Skip if not relevant to this profile
    if (!vehicle.isRelevant) continue;

    // Get current allocation (may have seed)
    const currentAllocation = allocation[vehicleId] || 0;

    // Calculate remaining capacity for this vehicle
    const monthlyLimit = vehicle.monthlyLimit || Infinity;
    const availableCapacity = Math.max(0, monthlyLimit - currentAllocation);

    // Allocate as much as possible from remaining pool
    const amountToAllocate = Math.min(availableCapacity, remainingPool);

    if (amountToAllocate > 0) {
      allocation[vehicleId] = currentAllocation + amountToAllocate;
      remainingPool -= amountToAllocate;
    }

    // Stop if pool exhausted
    if (remainingPool <= 0) break;
  }

  // === STEP 3: Overflow to Family Bank ===

  if (remainingPool > 0) {
    allocation['familyBank'] = (allocation['familyBank'] || 0) + remainingPool;
  }

  // === STEP 4: Round All Values ===

  for (const vehicleId in allocation) {
    allocation[vehicleId] = Math.round(allocation[vehicleId]);
  }

  return allocation;
}
```

**Cross-Domain Allocation:**

For domains (Retirement, Education, Health), allocate sequentially with overflow:

```javascript
function allocateDomains(totalPool, domainWeights, vehicleOrders, seeds) {
  const domainPools = {
    retirement: totalPool * domainWeights.retirement,
    education: totalPool * domainWeights.education,
    health: totalPool * domainWeights.health
  };

  // Allocate Education first (highest priority, shortest timeline)
  const educationAllocation = allocateWaterfall(
    domainPools.education,
    vehicleOrders.education,
    seeds.education
  );

  // Calculate education overflow
  const educationSpent = Object.values(educationAllocation).reduce((a,b) => a+b, 0);
  const educationOverflow = Math.max(0, domainPools.education - educationSpent);

  // Allocate Health next (with education overflow)
  const healthAllocation = allocateWaterfall(
    domainPools.health + educationOverflow,
    vehicleOrders.health,
    seeds.health
  );

  // Calculate health overflow
  const healthSpent = Object.values(healthAllocation).reduce((a,b) => a+b, 0);
  const healthOverflow = Math.max(0, domainPools.health + educationOverflow - healthSpent);

  // Allocate Retirement last (with all overflow)
  const retirementAllocation = allocateWaterfall(
    domainPools.retirement + healthOverflow,
    vehicleOrders.retirement,
    seeds.retirement
  );

  return {
    retirement: retirementAllocation,
    education: educationAllocation,
    health: healthAllocation
  };
}
```

---

### **4.4 IRS Limit Validation Algorithm**

**Purpose:** Validate vehicle allocations against IRS limits, accounting for catch-up contributions, combined limits, and phase-outs.

**Input:**
- `vehicle` object with allocation amount
- `age` of user
- `filingStatus` of user
- `grossIncome` of user

**Output:**
- `validation` object with errors, warnings, and adjusted limits

**Algorithm:**

```javascript
// IRS Limits for 2025 (hardcoded, update annually)
const IRS_LIMITS_2025 = {
  EMPLOYEE_401K: 23500,
  CATCHUP_401K_50: 7500,
  CATCHUP_401K_60: 11250,
  TOTAL_401K: 70000,

  TRADITIONAL_IRA: 7000,
  ROTH_IRA: 7000,
  CATCHUP_IRA: 1000,

  HSA_INDIVIDUAL: 4300,
  HSA_FAMILY: 8550,
  HSA_CATCHUP: 1000,

  CESA: 2000, // Per child

  ROTH_IRA_PHASE_OUT: {
    SINGLE: { start: 146000, end: 161000 },
    MARRIED: { start: 230000, end: 240000 }
  }
};

function validateVehicle(vehicle, age, filingStatus, grossIncome) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    adjustedLimit: vehicle.monthlyLimit,
    reasoning: []
  };

  const annualAmount = vehicle.userAmount * 12;

  // === VALIDATION 1: Basic Limit Check ===

  if (vehicle.userAmount > vehicle.monthlyLimit) {
    validation.isValid = false;
    validation.errors.push({
      type: 'EXCEEDS_LIMIT',
      message: `Monthly contribution of ${formatCurrency(vehicle.userAmount)} exceeds IRS limit of ${formatCurrency(vehicle.monthlyLimit)}`,
      resolution: `Reduce to ${formatCurrency(vehicle.monthlyLimit)} or less`
    });
  }

  // === VALIDATION 2: Catch-Up Contributions ===

  if (vehicle.irsRules.catchUpAge && age >= vehicle.irsRules.catchUpAge) {
    const catchUpAmount = vehicle.irsRules.catchUpAmount;
    const enhancedLimit = vehicle.monthlyLimit + (catchUpAmount / 12);

    validation.adjustedLimit = enhancedLimit;
    validation.reasoning.push({
      factor: `Age ${age} catch-up eligible`,
      adjustment: `+${formatCurrency(catchUpAmount / 12)}/month`,
      newLimit: formatCurrency(enhancedLimit)
    });

    // Re-validate against enhanced limit
    if (vehicle.userAmount > enhancedLimit) {
      validation.isValid = false;
      validation.errors.push({
        type: 'EXCEEDS_CATCHUP_LIMIT',
        message: `Even with catch-up, ${formatCurrency(vehicle.userAmount)} exceeds limit of ${formatCurrency(enhancedLimit)}`,
        resolution: `Reduce to ${formatCurrency(enhancedLimit)} or less`
      });
    }
  }

  // === VALIDATION 3: Combined Limits (401k Trad + Roth) ===

  if (vehicle.irsRules.combinedLimit) {
    // This vehicle shares a limit with another vehicle
    // (e.g., Traditional 401k and Roth 401k both count toward $23,500)

    validation.warnings.push({
      type: 'COMBINED_LIMIT',
      message: `This vehicle shares an annual limit with other accounts`,
      resolution: `Ensure total across Traditional + Roth 401(k) doesn't exceed ${formatCurrency(IRS_LIMITS_2025.EMPLOYEE_401K)}`
    });
  }

  // === VALIDATION 4: Roth IRA Phase-Out ===

  if (vehicle.id === 'rothIRA') {
    const phaseOut = IRS_LIMITS_2025.ROTH_IRA_PHASE_OUT[
      filingStatus === 'Single' ? 'SINGLE' : 'MARRIED'
    ];

    if (grossIncome >= phaseOut.end) {
      // Fully phased out
      validation.isValid = false;
      validation.errors.push({
        type: 'ROTH_PHASED_OUT',
        message: `Income of ${formatCurrency(grossIncome)} exceeds Roth IRA limit`,
        resolution: `Consider Backdoor Roth IRA strategy instead`
      });
      validation.adjustedLimit = 0;

    } else if (grossIncome >= phaseOut.start) {
      // Partial phase-out
      const phaseOutRange = phaseOut.end - phaseOut.start;
      const incomeIntoRange = grossIncome - phaseOut.start;
      const phaseOutPercentage = incomeIntoRange / phaseOutRange;

      const reducedLimit = IRS_LIMITS_2025.ROTH_IRA * (1 - phaseOutPercentage);
      validation.adjustedLimit = reducedLimit / 12;

      validation.warnings.push({
        type: 'ROTH_PHASE_OUT',
        message: `Income reduces Roth IRA limit to ${formatCurrency(reducedLimit)} annually`,
        resolution: `Contribution limit adjusted to ${formatCurrency(validation.adjustedLimit)}/month`
      });

      if (vehicle.userAmount > validation.adjustedLimit) {
        validation.isValid = false;
        validation.errors.push({
          type: 'EXCEEDS_PHASED_LIMIT',
          message: `${formatCurrency(vehicle.userAmount)} exceeds phased-out limit of ${formatCurrency(validation.adjustedLimit)}`,
          resolution: `Reduce to ${formatCurrency(validation.adjustedLimit)} or use Backdoor Roth`
        });
      }
    }
  }

  // === VALIDATION 5: HDIP Requirement (HSA) ===

  if (vehicle.irsRules.requiresHDHP && vehicle.id === 'hsa') {
    if (!vehicle.userHasHDHP) {
      validation.warnings.push({
        type: 'HSA_REQUIRES_HDHP',
        message: `HSA contributions require enrollment in a High Deductible Health Plan (HDHP)`,
        resolution: `Confirm you have an HDHP before contributing`
      });
    }
  }

  // === VALIDATION 6: Self-Employment Requirement ===

  if (vehicle.irsRules.requiresSelfEmployment) {
    if (!vehicle.userIsSelfEmployed) {
      validation.isValid = false;
      validation.errors.push({
        type: 'REQUIRES_SELF_EMPLOYMENT',
        message: `${vehicle.name} requires self-employment income`,
        resolution: `This vehicle is only available to self-employed individuals`
      });
    }
  }

  return validation;
}
```

---

### **4.5 Future Value Projection Algorithm**

**Purpose:** Calculate compound growth projections for retirement wealth.

**Input:**
- `monthlyContribution` (constant monthly amount)
- `startingBalance` (current savings)
- `annualReturnRate` (0.08-0.20 based on investment score)
- `yearsToRetirement` (time horizon)
- `inflationRate` (default 0.03)

**Output:**
- `futureValue` (inflated dollars)
- `futureValueRealDollars` (today's purchasing power)
- `monthlyRetirementIncome` (at 4% withdrawal rate)

**Algorithm:**

```javascript
function calculateFutureValue(params) {
  const {
    monthlyContribution,
    startingBalance = 0,
    annualReturnRate,
    yearsToRetirement,
    inflationRate = 0.03
  } = params;

  // Convert annual rate to monthly
  const monthlyRate = annualReturnRate / 12;
  const totalMonths = yearsToRetirement * 12;

  // === FORMULA: Future Value of Annuity + Lump Sum ===
  // FV = PV(1+r)^n + PMT × [((1+r)^n - 1) / r]

  // Future value of starting balance
  const fvStartingBalance = startingBalance * Math.pow(1 + monthlyRate, totalMonths);

  // Future value of monthly contributions (growing annuity)
  const fvContributions = monthlyContribution *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  // Total future value (nominal dollars)
  const futureValueNominal = fvStartingBalance + fvContributions;

  // Adjust for inflation (real purchasing power)
  const inflationAdjustment = Math.pow(1 + inflationRate, yearsToRetirement);
  const futureValueReal = futureValueNominal / inflationAdjustment;

  // Calculate sustainable retirement income (4% rule)
  const monthlyRetirementIncome = (futureValueReal * 0.04) / 12;

  // Generate year-by-year breakdown for chart
  const yearlyProjection = [];
  for (let year = 0; year <= yearsToRetirement; year++) {
    const months = year * 12;
    const fvStart = startingBalance * Math.pow(1 + monthlyRate, months);
    const fvContribs = monthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const totalFV = fvStart + fvContribs;
    const realFV = totalFV / Math.pow(1 + inflationRate, year);

    yearlyProjection.push({
      year,
      nominalValue: Math.round(totalFV),
      realValue: Math.round(realFV)
    });
  }

  return {
    futureValueNominal: Math.round(futureValueNominal),
    futureValueReal: Math.round(futureValueReal),
    monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
    yearlyProjection
  };
}

// Calculate investment score (1-7 scale)
function calculateInvestmentScore(involvement, time, confidence) {
  // involvement: 1-7 (how involved in managing investments)
  // time: 1-7 (how much time dedicated to research)
  // confidence: 1-7 (knowledge and experience level)

  // Simple average
  const avgScore = (involvement + time + confidence) / 3;

  // Map to return rate: 1 = 8%, 7 = 20%
  // Linear interpolation
  const returnRate = 0.08 + ((avgScore - 1) / 6) * 0.12;

  return {
    score: avgScore,
    returnRate
  };
}
```

---

## **5. User Interface Specification**

### **5.1 Page Flow Diagram**

```
┌─────────────┐
│ Pre-Survey  │ (5-7 questions, auto-populated)
└──────┬──────┘
       ↓
┌──────────────────┐
│ Profile          │ (Auto-classified, can override)
│ Confirmation     │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Domain Priorities│ (3 sliders: R/E/H weights)
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Current          │ (Input current contributions)
│ Contributions    │
└──────┬───────────┘
       ↓
┌──────────────────────────────────┐
│ Interactive Allocation Calculator│ ← MAIN PAGE
│ - Non-discretionary (locked)     │
│ - Vehicle sliders                │
│ - Tax strategy toggle            │
│ - Real-time validation           │
└──────┬───────────────────────────┘
       ↓
┌──────────────────┐
│ Future           │ (Charts, projections)
│ Projections      │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Scenarios        │ (Save/compare allocations)
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Completion       │ (Generate PDF, action plan)
└──────────────────┘
```

---

## **6. Integration Points**

### **6.1 Cross-Tool Data Flow**

**Tool 1 → Tool 6:**
- Age (for catch-up eligibility)
- Work situation (W-2, self-employed, both)
- Business ownership
- Employee status
- Existing retirement accounts (Roth IRA, Traditional IRA)

**Tool 2 → Tool 6:**
- Financial discipline (modifies urgency scoring)
- Long-term thinking (modifies retirement weight)
- Risk tolerance (modifies investment return rate)
- Impulsive spending (validation warnings)
- Scarcity mindset (messaging adjustments)

**Tool 3 → Tool 6:**
- Trauma modifiers (if applicable)

**Tool 4 → Tool 6:**
- Monthly net income (allocation pool)
- Filing status (IRS limits)
- Emergency fund status (validation)
- Current savings rate (baseline)
- Debt payoff timeline (validation)

**Tool 6 → Tool 7/8:**
- Retirement savings strategy
- Estate planning needs
- Investment approach

---

### **6.2 InsightsPipeline Configuration**

**Tool 6 Insights Generated:**

```javascript
Tool6Insights = {
  // Basic classification
  profileId: String,
  profileTitle: String,
  confidenceScore: Number,

  // Allocation summary
  monthlyRetirementSavings: Number,
  monthlyEducationSavings: Number,
  monthlyHealthSavings: Number,
  totalMonthlySavings: Number,
  savingsRate: Number, // Percentage of income

  // Future projections
  projectedRetirementWealth: Number,
  projectedRetirementIncome: Number,
  yearsToRetirement: Number,

  // Vehicle usage
  usesHSA: Boolean,
  uses401k: Boolean,
  usesSolo401k: Boolean,
  usesBackdoorRoth: Boolean,
  usesROBS: Boolean,

  // Tax strategy
  taxStrategy: String, // 'traditional' | 'roth' | 'balanced'
  rothPercentage: Number,
  traditionalPercentage: Number,

  // Domain priorities
  retirementPriority: Number, // 0.0-1.0
  educationPriority: Number,
  healthPriority: Number,

  // Validation flags
  hasEmployerMatch: Boolean,
  employerMatchAmount: Number,
  catchUpEligible: Boolean,
  rothPhaseOut: Boolean,

  // Completion metadata
  isComplete: Boolean,
  completedAt: Timestamp,
  blueprintUrl: String
}
```

---

## **7. Development Phases**

### **PHASE 1: Foundation & Integration** (Week 1-2)
**Goal:** Set up framework integration, manifest, and basic structure.

**Tasks:**
1.1. Create `tool6.manifest.json` with all configuration
1.2. Create skeleton `Tool6.js` extending `BaseTool`
1.3. Implement cross-tool data integration in `initialize()`
1.4. Build state management structure
1.5. Create routing for 8 pages
1.6. Implement basic CSS styling framework

**Acceptance Criteria:**
- ✅ Tool 6 appears in tool registry
- ✅ Tool 6 loads without errors
- ✅ Can navigate between empty pages
- ✅ Cross-tool insights are successfully pulled and logged to console
- ✅ State object initializes with all expected properties

**Testing:**
- Manual: Navigate to Tool 6 URL, verify it loads
- Unit: Test `initialize()` returns correct insights from Tools 1-4
- Integration: Verify ToolRegistry recognizes Tool 6 manifest

---

### **PHASE 2: Profile Classification Engine** (Week 2-3)
**Goal:** Build and test the 9-profile classification algorithm.

**Tasks:**
2.1. Create `Tool6VehicleHelpers.js`
2.2. Define `PROFILE_DEFINITIONS` constant (9 profiles with metadata)
2.3. Implement `classifyProfile()` algorithm
2.4. Create confidence scoring logic
2.5. Build classification reasons generator
2.6. Create profile override modal UI

**Acceptance Criteria:**
- ✅ Given test data, algorithm correctly classifies into expected profile
- ✅ Confidence score accurately reflects classification certainty
- ✅ Can manually override profile and system respects override
- ✅ Classification reasons are clear and accurate

**Testing:**
- Unit: Test classification with 20+ test cases covering all profiles
- Edge cases: Test with minimal data, ambiguous cases, tied scores
- Manual: Review classification reasons for clarity

---

### **PHASE 3: Page 1 - Pre-Survey** (Week 3)
**Goal:** Build and test the first interactive page with auto-population.

**Tasks:**
3.1. Implement `renderPreSurvey()` method
3.2. Build read-only field rendering for cross-tool data
3.3. Implement conditional section logic (W-2 vs self-employed)
3.4. Add real-time calculation (years to retirement)
3.5. Build validation for user inputs
3.6. Create `confirmPreSurvey()` handler to advance to next page

**Acceptance Criteria:**
- ✅ Locked fields display with gray background and tool source label
- ✅ Conditional sections show/hide based on work situation
- ✅ Years to retirement calculates and displays in real-time
- ✅ Cannot proceed without required fields
- ✅ State updates correctly when advancing

**Testing:**
- Manual: Complete pre-survey with various work situations
- Edge cases: Test with missing cross-tool data
- Validation: Try to proceed with empty required fields
- State: Verify `state.preSurvey` object matches form inputs

---

### **PHASE 4: Page 2 - Profile Display** (Week 3-4)
**Goal:** Display classified profile with rich UI and override capability.

**Tasks:**
4.1. Implement `renderProfileClassification()` method
4.2. Build profile card UI with icon, title, description, characteristics
4.3. Display confidence score with color coding
4.4. Render classification reasons with weights
4.5. Build profile override modal with all 9 profiles as cards
4.6. Implement profile selection and confirmation handlers

**Acceptance Criteria:**
- ✅ Profile displays immediately upon entering page
- ✅ Confidence score color-coded (green/yellow/orange)
- ✅ Can click "Choose different" and see all 9 profiles
- ✅ Selected profile updates UI and state
- ✅ Cannot proceed without confirming profile

**Testing:**
- Manual: Test all 9 profiles display correctly
- UI: Verify confidence score colors match thresholds
- Interaction: Override profile and verify state updates
- Accessibility: Test keyboard navigation through profile modal

---

### **PHASE 5: Vehicle System Foundation** (Week 4)
**Goal:** Build vehicle catalog and profile-specific filtering.

**Tasks:**
5.1. Define `VEHICLE_CATALOG` constant (15+ vehicles with metadata)
5.2. Implement `getProfileVehicles()` to filter by profile
5.3. Build vehicle ordering logic per profile
5.4. Create `VEHICLE_ORDERS` configuration
5.5. Implement non-discretionary detection (employer match, ROBS, etc.)
5.6. Build helpers for vehicle metadata lookup

**Acceptance Criteria:**
- ✅ Each profile returns correct subset of vehicles (5-8)
- ✅ Vehicles returned in correct priority order
- ✅ Non-discretionary vehicles correctly identified
- ✅ Vehicle limits (monthly/annual) accurately reflect IRS rules

**Testing:**
- Unit: Test each profile returns expected vehicles
- Validation: Verify IRS limits match 2025 official limits
- Edge cases: Test with catch-up eligible ages (50, 55, 60)

---

### **PHASE 6: IRS Validation Engine** (Week 4-5)
**Goal:** Build comprehensive IRS limit validation with warnings/errors.

**Tasks:**
6.1. Create `Tool6Validation.js` file
6.2. Define `IRS_LIMITS_2025` constant
6.3. Implement `validateVehicle()` function
6.4. Build catch-up contribution logic
6.5. Implement Roth IRA phase-out calculator
6.6. Build combined limit checker (401k Trad + Roth)
6.7. Create validation message generator
6.8. Implement employer match calculator

**Acceptance Criteria:**
- ✅ Correctly identifies when allocation exceeds limits
- ✅ Catch-up contributions adjust limits for age 50+, 60+
- ✅ Roth IRA phase-out correctly reduces limit based on income
- ✅ Warns when Traditional + Roth 401k exceed combined limit
- ✅ Error messages are clear and actionable

---

### **PHASE 7: Domain Priority Weighting** (Week 5)
**Goal:** Implement ambition quotient and domain weight calculation.

**Tasks:**
7.1. Implement `calculateDomainWeights()` algorithm
7.2. Build urgency scoring with time-based multipliers
7.3. Implement floor constraints (min 50% retirement, min 10% HSA)
7.4. Create Page 3 UI for domain priorities
7.5. Build slider interaction with real-time normalization
7.6. Implement manual override toggle
7.7. Add dollar amount display (70% = $1,400/mo)

---

### **PHASE 8: Current Contributions Page** (Week 5-6)
**Goal:** Collect user's current contribution amounts.

---

### **PHASE 9: Waterfall Allocation Engine** (Week 6)
**Goal:** Build core allocation algorithm with domain cascading.

---

### **PHASE 10: Interactive Allocation Calculator UI** (Week 6-7)
**Goal:** Build the main calculator page with sliders and real-time updates.

---

### **PHASE 11: Future Value Projections** (Week 7)
**Goal:** Calculate and display wealth projections with charts.

---

### **PHASE 12: Scenario Management** (Week 7-8)
**Goal:** Save, load, and compare multiple allocation strategies.

---

### **PHASE 13: GPT Analysis Integration** (Week 8)
**Goal:** Generate AI-powered insights with 3-tier fallback.

---

### **PHASE 14: PDF Blueprint Generation** (Week 8-9)
**Goal:** Generate comprehensive PDF blueprint document.

---

### **PHASE 15: Completion & Polish** (Week 9)
**Goal:** Build completion page, implement email, and polish UI.

---

### **PHASE 16: Testing & Bug Fixes** (Week 9-10)
**Goal:** Comprehensive testing and bug resolution.

---

### **PHASE 17: Documentation & Launch** (Week 10)
**Goal:** Complete documentation and deploy to production.

---

## **8. Testing Strategy**

### **8.1 Unit Testing**

**Framework:** Google Apps Script Testing Framework or Jest

**Coverage Targets:**
- Core Algorithms: 100%
- UI Rendering: 80%
- Data Models: 95%
- Helpers: 90%

---

### **8.2 Integration Testing**

**Focus:** Test interactions between components and external systems.

---

### **8.3 End-to-End Testing**

**Framework:** Playwright or Cypress for automated browser testing

---

### **8.4 Performance Testing**

**Tools:** Lighthouse, WebPageTest, Custom timing scripts

---

### **8.5 Security Testing**

**Focus Areas:**
- Input sanitization
- XSS prevention
- CSRF protection
- Data privacy
- API security

---

### **8.6 User Acceptance Testing (UAT)**

**Participants:** 10 beta users from diverse backgrounds

---

## **9. Appendices**

### **9.1 IRS Limits Reference (2025)**

### **9.2 Profile Classification Decision Tree**

### **9.3 Vehicle Priority Matrix**

### **9.4 GPT Prompt Templates**

### **9.5 Error Messages & User Guidance**

### **9.6 Glossary**

### **9.7 Dependencies & Version Requirements**

### **9.8 Changelog Template**

---

## **10. Summary & Next Steps**

### **10.1 Document Summary**

This technical specification provides:
- ✅ Complete architecture design
- ✅ Detailed data models
- ✅ Core algorithms (classification, allocation, validation, projections)
- ✅ UI wireframes for all 8 pages
- ✅ Integration specifications
- ✅ 17 development phases with clear deliverables
- ✅ Comprehensive testing strategy

### **10.2 Estimated Timeline**

**Total Duration:** 10 weeks (50 working days)

### **10.3 Resource Requirements**

**Team:**
- 1 Lead Developer (full-time, 10 weeks)
- 1 UI/UX Developer (part-time, weeks 3-7)
- 1 QA Engineer (part-time, weeks 8-10)
- 10 Beta Users (UAT week 9)

### **10.4 Success Metrics**

**Launch Targets:**
- Completion rate > 80%
- Time to complete < 20 minutes
- User satisfaction > 4.5/5
- IRS compliance: 100%
- GPT success rate > 95%
- Zero critical bugs

---

**END OF SPECIFICATION**

**Document Version:** 1.0
**Last Updated:** December 31, 2024
**Prepared By:** Agent Girl (Architecture Team)
**Status:** Ready for Development ✅
