# Tool Data Contracts

> **Purpose**: Define the exact data structures passed between tools
> **Status**: Planning Document
> **Related**: [INTEGRATED-SYSTEM-VISION.md](./INTEGRATED-SYSTEM-VISION.md)

---

## Overview

This document defines the **data contracts** between tools - the exact structure of data that each tool:
1. **Requires** from upstream tools
2. **Provides** to downstream tools

These contracts enable:
- Pre-filling forms with previously collected data
- Psychological guardrails based on trauma patterns
- Progressive calculation building on previous results

---

## Tool 1: Core Trauma Strategy Assessment

### Provides (Output Contract)

```typescript
interface Tool1Output {
  // Identity (passed to all downstream tools)
  formData: {
    name: string;
    email: string;
    studentId: string;
  };

  // Trauma scores (0-100 scale)
  scores: {
    FSV: number;        // False Self-View
    Control: number;    // Need for control
    ExVal: number;      // External Validation
    Fear: number;       // Fear-based decisions
    Receiving: number;  // Difficulty receiving
    Showing: number;    // Over-giving/showing love through sacrifice
  };

  // Primary pattern
  winner: TraumaCategory;  // "FSV" | "Control" | "ExVal" | "Fear" | "Receiving" | "Showing"

  // Context for downstream tools
  traumaContext: {
    behaviors: string[];      // Observable behaviors
    triggers: string[];       // What activates this pattern
    healingFocus: string;     // Primary healing direction
  };

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

### Requires (Input Contract)

```typescript
// Tool 1 has no upstream dependencies
interface Tool1Input {
  clientId: string;
}
```

---

## Tool 2: Financial Clarity & Values Assessment

### Requires (Input Contract)

```typescript
interface Tool2Input {
  clientId: string;

  // From Tool 1 (optional but enhances experience)
  tool1Data?: {
    formData: {
      name: string;
      email: string;
      studentId: string;
    };
    winner: TraumaCategory;
    scores: Record<TraumaCategory, number>;
    traumaContext: {
      behaviors: string[];
      healingFocus: string;
    };
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool2Output {
  // Domain scores (0-100 percentage)
  domainScores: {
    moneyFlow: number;      // Income + spending clarity
    obligations: number;    // Debt + emergency fund
    liquidity: number;      // Savings beyond emergency
    growth: number;         // Investments + retirement
    protection: number;     // Insurance coverage
  };

  // Detailed benchmarks
  benchmarks: {
    [domain: string]: {
      percentage: number;
      level: "High" | "Medium" | "Low";
      raw: number;
      max: number;
    };
  };

  // Stress-weighted priorities (lower score = higher priority)
  priorityList: Array<{
    domain: string;
    weightedScore: number;
    priority: number;  // 1 = highest priority
  }>;

  // Free-text responses (valuable for downstream pre-fill)
  freeText: {
    incomeSources: string;      // Q18: "Salary, rental, freelance"
    majorExpenses: string;      // Q23: "Mortgage, childcare, car"
    wastefulSpending: string;   // Q24: "Dining out, subscriptions"
    currentDebts: string;       // Q29: "Credit card $8k, student loans $35k"
    investmentTypes: string;    // Q43: "401k, some stocks, crypto"
    financialEmotions: string;  // Q52: Free-text emotional response
  };

  // Mindset baselines (-5 to +5 scale)
  mindset: {
    holisticScarcity: number;     // Overall scarcity/abundance
    financialScarcity: number;    // Money-specific scarcity
    moneyRelationship: number;    // Relationship with money
  };

  // Life context
  demographics: {
    age: number;
    maritalStatus: string;
    dependents: number;
    livingArrangement: string;
    incomeStreams: number;
    employmentStatus: string;
    businessStage?: string;
  };

  // Growth archetype
  archetype: string;  // "Money Flow Optimizer", "Security Seeker", etc.

  // GPT insights (if generated)
  gptInsights?: {
    overview: string;
    topPatterns: string[];
    priorityActions: string[];
  };

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

---

## Tool 3: Identity & Validation Grounding

### Requires (Input Contract)

```typescript
interface Tool3Input {
  clientId: string;

  // From Tool 1 (required)
  tool1Data: {
    scores: {
      FSV: number;
      ExVal: number;
    };
    winner: TraumaCategory;
    traumaContext: {
      healingFocus: string;
    };
  };

  // From Tool 2 (optional, enhances context)
  tool2Data?: {
    domainScores: Record<string, number>;
    freeText: {
      wastefulSpending: string;  // May reveal ExVal spending
    };
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool3Output {
  // FSV deep dive
  fsvDeepDive: {
    score: number;                    // 0-100
    primaryPattern: string;           // "Minimizing accomplishments"
    financialImpact: string;          // "Undervalues earning potential"
    groundingProgress: number;        // 0-100 (% through exercises)
    keyInsights: string[];
  };

  // ExVal deep dive
  exvalDeepDive: {
    score: number;
    primaryPattern: string;           // "Seeking approval through purchases"
    financialImpact: string;          // "Lifestyle inflation for appearances"
    groundingProgress: number;
    keyInsights: string[];
  };

  // Combined identity insights
  identityInsights: string[];         // Array of personalized insights

  // Readiness indicators
  readinessForBudget: {
    ready: boolean;
    concerns: string[];               // Issues to address in Tool 4
    strengths: string[];              // Assets to leverage
  };

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

---

## Tool 4: Financial Freedom Framework (Budget Allocation)

### Requires (Input Contract)

```typescript
interface Tool4Input {
  clientId: string;

  // From Tool 1 (for guardrails)
  tool1Data?: {
    scores: Record<TraumaCategory, number>;
    winner: TraumaCategory;
  };

  // From Tool 2 (for pre-fill and validation)
  tool2Data?: {
    freeText: {
      incomeSources: string;
      majorExpenses: string;
      wastefulSpending: string;
      currentDebts: string;
    };
    domainScores: Record<string, number>;
    priorityList: Array<{ domain: string; priority: number }>;
    demographics: {
      dependents: number;
      employmentStatus: string;
    };
  };

  // From Tool 3 (for psychological guardrails)
  tool3Data?: {
    fsvDeepDive: {
      score: number;
      financialImpact: string;
    };
    exvalDeepDive: {
      score: number;
      financialImpact: string;
    };
    readinessForBudget: {
      concerns: string[];
    };
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool4Output {
  // Core allocation
  allocation: {
    Multiply: {
      percent: number;      // 0-100
      dollars: number;      // Monthly amount
    };
    Essentials: {
      percent: number;
      dollars: number;
    };
    Freedom: {
      percent: number;
      dollars: number;
    };
    Enjoyment: {
      percent: number;
      dollars: number;
    };
  };

  // Critical for Tool 6
  multiplyBudget: number;           // Monthly $ available for wealth building

  // Planning context
  selectedPriority: string;          // "Build Wealth", "Pay Off Debt", etc.
  goalTimeline: string;              // "6 months", "1-2 years", "5+ years"

  // Financial context
  monthlyIncome: number;
  monthlyEssentials: number;

  // Debt context (for Tool 6 recommendations)
  debtContext: {
    totalDebt: number;
    monthlyDebtPayment: number;
    highInterestDebt: boolean;
    debtToIncomeRatio: number;
  };

  // Emergency fund context
  emergencyFund: {
    current: number;
    target: number;                  // 6 months of essentials
    gap: number;
    monthsOfCoverage: number;
  };

  // Trauma alignment (how well allocation honors psychology)
  traumaAlignment?: {
    score: number;                   // 0-100
    warnings: Array<{
      type: string;
      pattern: TraumaCategory;
      message: string;
      acknowledged: boolean;
    }>;
  };

  // Scenario info (if saved)
  scenarioName?: string;
  scenarioId?: string;

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

---

## Tool 5: Love & Connection Grounding

### Requires (Input Contract)

```typescript
interface Tool5Input {
  clientId: string;

  // From Tool 1 (required)
  tool1Data: {
    scores: {
      Showing: number;
      Receiving: number;
    };
    winner: TraumaCategory;
  };

  // From Tool 4 (optional, provides financial context)
  tool4Data?: {
    allocation: {
      Enjoyment: { dollars: number };
    };
    multiplyBudget: number;
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool5Output {
  // Showing deep dive
  showingDeepDive: {
    score: number;                    // 0-100
    primaryPattern: string;           // "Financial caretaking of family"
    financialImpact: string;          // "Depletes savings for others"
    boundaryAwareness: number;        // 0-100 (low = poor boundaries)
    keyInsights: string[];
  };

  // Receiving deep dive
  receivingDeepDive: {
    score: number;
    primaryPattern: string;           // "Refuses help even when struggling"
    financialImpact: string;          // "Misses employer match"
    deservingScore: number;           // 0-100 (low = feels undeserving)
    keyInsights: string[];
  };

  // Relationship insights
  relationshipInsights: string[];

  // Giving boundary plan (critical for Tool 6)
  givingBoundaryPlan: {
    monthlyGivingCap: number;         // Max $ to give to others monthly
    emergencyFundProtection: boolean; // Commit to protect emergency fund
    retirementProtection: boolean;    // Commit to protect retirement
    specificBoundaries: string[];     // "No loans to siblings", etc.
  };

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

---

## Tool 6: Retirement Blueprint (Vehicle Optimization)

### Requires (Input Contract)

```typescript
interface Tool6Input {
  clientId: string;

  // From Tool 4 (critical - provides budget)
  tool4Data: {
    multiplyBudget: number;           // $ to allocate across vehicles
    goalTimeline: string;
    monthlyIncome: number;
    debtContext: {
      totalDebt: number;
      highInterestDebt: boolean;
    };
    emergencyFund: {
      monthsOfCoverage: number;
    };
  };

  // From Tool 2 (provides financial context)
  tool2Data?: {
    demographics: {
      age: number;
      employmentStatus: string;
      dependents: number;
    };
    freeText: {
      investmentTypes: string;        // Current investments
    };
  };

  // From Tool 1 (for guardrails)
  tool1Data?: {
    scores: Record<TraumaCategory, number>;
    winner: TraumaCategory;
  };

  // From Tool 5 (for relationship-aware recommendations)
  tool5Data?: {
    showingDeepDive: {
      score: number;
    };
    receivingDeepDive: {
      score: number;
    };
    givingBoundaryPlan: {
      retirementProtection: boolean;
    };
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool6Output {
  // Profile classification (1 of 9)
  profile: {
    id: ProfileId;                    // "1_ROBS_In_Use", "7_Foundation_Builder", etc.
    title: string;
    description: string;
  };

  // Vehicle allocations
  vehicleAllocations: {
    [vehicleName: string]: {
      monthly: number;                // Monthly contribution
      annual: number;                 // Annual contribution
      limit: number;                  // IRS limit
      atLimit: boolean;               // True if maxed out
      priority: number;               // 1 = highest priority vehicle
    };
  };

  // Summary
  totalMonthlyContribution: number;
  totalAnnualContribution: number;

  // Current assets (from profile questions)
  currentAssets: {
    rothIRA: number;
    traditionalIRA: number;
    traditional401k: number;
    roth401k: number;
    hsa: number;
    taxable: number;
    other: number;
    total: number;
  };

  // Employer context
  employerBenefits: {
    has401k: boolean;
    hasMatch: boolean;
    matchFormula?: string;            // "100% up to 3%, 50% up to 5%"
    annualMatchValue?: number;
    hasRoth401k: boolean;
    hasHSA: boolean;
  };

  // Timeline
  yearsToRetirement: number;
  targetRetirementAge: number;
  currentAge: number;

  // Trauma-aware recommendations
  traumaAwareNotes?: {
    showingWarning?: string;          // "Protect retirement from giving"
    receivingNote?: string;           // "Employer match is earned, not charity"
    controlNote?: string;             // "Automate to avoid over-management"
  };

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}

type ProfileId =
  | "1_ROBS_In_Use"
  | "2_ROBS_Curious"
  | "3_Solo401k_Builder"
  | "4_Roth_Reclaimer"
  | "5_Bracket_Strategist"
  | "6_Catch_Up"
  | "7_Foundation_Builder"
  | "8_Biz_Owner_Group"
  | "9_Late_Stage_Growth";
```

---

## Tool 7: Security & Control Grounding

### Requires (Input Contract)

```typescript
interface Tool7Input {
  clientId: string;

  // From Tool 1 (required)
  tool1Data: {
    scores: {
      Fear: number;
      Control: number;
    };
    winner: TraumaCategory;
  };

  // From Tool 6 (provides investment context)
  tool6Data?: {
    vehicleAllocations: Record<string, { monthly: number }>;
    yearsToRetirement: number;
    currentAssets: { total: number };
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool7Output {
  // Fear deep dive
  fearDeepDive: {
    score: number;                    // 0-100
    primaryPattern: string;           // "Catastrophic thinking about retirement"
    financialImpact: string;          // "Avoids investing, misses growth"
    futureTrustScore: number;         // 0-100 (low = high anxiety)
    keyInsights: string[];
  };

  // Control deep dive
  controlDeepDive: {
    score: number;
    primaryPattern: string;           // "Cannot delegate financial decisions"
    financialImpact: string;          // "Over-manages, excessive cash"
    flexibilityScore: number;         // 0-100 (low = rigid)
    keyInsights: string[];
  };

  // Future insights
  futureInsights: string[];

  // Risk tolerance adjustment (critical for Tool 8)
  riskToleranceAdjustment: {
    userStatedRisk: number;           // What they'd select (0-10)
    adjustedRisk: number;             // After psychology adjustment
    adjustmentReason: string;
    confidenceInAdjustment: number;   // 0-100
  };

  // Behavioral predictions
  behavioralPredictions: {
    likelyToSellInDownturn: number;   // 0-100 probability
    likelyToOverManage: number;
    likelyToHoardCash: number;
    automationRecommended: boolean;
  };

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

---

## Tool 8: Investment Projections

### Requires (Input Contract)

```typescript
interface Tool8Input {
  clientId: string;

  // From Tool 6 (critical - provides investment plan)
  tool6Data: {
    vehicleAllocations: Record<string, {
      monthly: number;
      annual: number;
    }>;
    totalMonthlyContribution: number;
    currentAssets: {
      total: number;
      [vehicle: string]: number;
    };
    yearsToRetirement: number;
    employerBenefits: {
      annualMatchValue?: number;
    };
  };

  // From Tool 7 (for risk adjustment)
  tool7Data?: {
    riskToleranceAdjustment: {
      adjustedRisk: number;
      adjustmentReason: string;
    };
    fearDeepDive: {
      score: number;
    };
    controlDeepDive: {
      score: number;
    };
    behavioralPredictions: {
      likelyToSellInDownturn: number;
      automationRecommended: boolean;
    };
  };

  // From Tool 4 (for income context)
  tool4Data?: {
    monthlyIncome: number;
    goalTimeline: string;
  };

  // From Tool 1 (for overall context)
  tool1Data?: {
    winner: TraumaCategory;
    scores: Record<TraumaCategory, number>;
  };
}
```

### Provides (Output Contract)

```typescript
interface Tool8Output {
  // Core projection
  projection: {
    nestEggAtRetirement: number;
    monthlyRetirementIncome: number;
    annualRetirementIncome: number;
    incomeReplacementRate: number;    // vs current income
    totalContributions: number;
    totalGrowth: number;
  };

  // Assumptions used
  assumptions: {
    yearsToRetirement: number;
    retirementDuration: number;       // Years in retirement
    inflationRate: number;
    accumulationReturn: number;       // During working years
    distributionReturn: number;       // During retirement
    deploymentDrag: number;           // Conservative pacing adjustment
  };

  // Risk profile
  riskProfile: {
    dial: number;                     // 0-10
    expectedReturn: number;           // Annual %
    psychologicallyAdjusted: boolean;
    adjustmentDetails?: string;
  };

  // Scenarios
  scenarios: Array<{
    name: string;                     // "Current Plan", "Aggressive", etc.
    monthlyContribution: number;
    nestEgg: number;
    monthlyIncome: number;
    feasibility: "comfortable" | "tight" | "challenging";
  }>;

  // Comparison (if two scenarios selected)
  comparison?: {
    scenario1: string;
    scenario2: string;
    nestEggDifference: number;
    incomeDifference: number;
    recommendation: string;
    tradeoffs: string[];
  };

  // Readiness scores
  readinessScore: {
    financial: number;                // 0-100 based on numbers
    psychological: number;            // 0-100 based on Tools 1,3,5,7
    integrated: number;               // Combined score
    interpretation: string;           // "Well prepared", "Some concerns", etc.
  };

  // Psychological integration
  psychologicalNotes: {
    fearNote?: string;                // "Worst case scenario shown below"
    controlNote?: string;             // "Consider automation to reduce anxiety"
    overallReadiness: string;         // Summary of psychological readiness
  };

  // Action items
  actionItems: Array<{
    priority: number;
    action: string;
    rationale: string;
    psychologicalContext?: string;
  }>;

  // Metadata
  timestamp: string;
  completionStatus: "COMPLETED" | "PARTIAL";
}
```

---

## Cross-Tool Data Service Interface

```typescript
interface CrossToolDataService {
  // Get specific tool output
  getToolOutput<T>(clientId: string, toolId: ToolId): Promise<T | null>;

  // Get all required inputs for a tool
  getToolInputs(clientId: string, toolId: ToolId): Promise<Record<string, any>>;

  // Check if tool has required data
  canStartTool(clientId: string, toolId: ToolId): Promise<{
    canStart: boolean;
    missingRequired: ToolId[];
    missingOptional: ToolId[];
  }>;

  // Get trauma profile (compiled from T1 + T3 + T5 + T7)
  getTraumaProfile(clientId: string): Promise<{
    scores: Record<TraumaCategory, number>;
    topPattern: TraumaCategory;
    deepDives: {
      fsv?: Tool3Output['fsvDeepDive'];
      exval?: Tool3Output['exvalDeepDive'];
      showing?: Tool5Output['showingDeepDive'];
      receiving?: Tool5Output['receivingDeepDive'];
      fear?: Tool7Output['fearDeepDive'];
      control?: Tool7Output['controlDeepDive'];
    };
  }>;

  // Get financial profile (compiled from T2 + T4 + T6 + T8)
  getFinancialProfile(clientId: string): Promise<{
    clarity: Tool2Output['domainScores'];
    budget: Tool4Output['allocation'];
    vehicles: Tool6Output['vehicleAllocations'];
    projection: Tool8Output['projection'];
  }>;

  // Get journey progress
  getJourneyProgress(clientId: string): Promise<{
    completed: ToolId[];
    inProgress: ToolId | null;
    locked: ToolId[];
    overallProgress: number;        // 0-100
  }>;
}

type ToolId = 'tool1' | 'tool2' | 'tool3' | 'tool4' | 'tool5' | 'tool6' | 'tool7' | 'tool8';
type TraumaCategory = 'FSV' | 'Control' | 'ExVal' | 'Fear' | 'Receiving' | 'Showing';
```

---

## Guardrail Trigger Thresholds

```typescript
const GUARDRAIL_THRESHOLDS = {
  // When to show warnings based on trauma scores
  trauma: {
    warning: 70,        // Show soft warning
    strong: 85,         // Show strong warning, require acknowledgment
    block: 95           // Block action until addressed
  },

  // Budget allocation limits based on patterns
  budgetLimits: {
    // If ExVal > 70, warn when Enjoyment exceeds:
    exvalEnjoymentWarning: 20,
    exvalEnjoymentBlock: 30,

    // If Showing > 70, warn when Multiply below:
    showingMultiplyWarning: 15,
    showingMultiplyBlock: 10,

    // If Control > 70, warn when Freedom exceeds:
    controlFreedomWarning: 30,
    controlFreedomBlock: 40,

    // If Fear > 70, warn when Multiply exceeds:
    fearMultiplyWarning: 30,
    fearMultiplyBlock: 40
  },

  // Risk adjustment based on Fear/Control
  riskAdjustment: {
    // Reduce stated risk by X points per 10 points of Fear/Control above 50
    fearReductionPer10: 0.5,
    controlReductionPer10: 0.3,
    maxReduction: 3
  }
};
```

---

*This document defines the contracts. Implementation details are in the main vision document.*
