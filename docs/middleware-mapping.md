# Tool Input/Output Mapping for Middleware Layer

**Document Purpose:** Foundation for middleware design to enable data flow between Tools 1, 2, and 3

**Created:** 2025-11-28
**Status:** Analysis Complete

---

## 🎯 Executive Summary

This document maps the **student inputs** (what users enter) and **system outputs** (insights/data generated) across Tools 1, 2, and 3. This mapping will enable the middleware layer to pass information between tools, pre-fill data, and create composite insights.

---

## 📊 Tool 1: Core Trauma Strategy Assessment

**Purpose:** Top-level psychological assessment to identify core trauma strategies
**Flow:** 5 pages, 26 questions
**Time:** 15-20 minutes

### Student Inputs

#### Page 1: Identity (2 questions)
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `name` | Text | "John Smith" | Used to pre-fill Tool 2 |
| `email` | Email | "john@example.com" | Used to pre-fill Tool 2 |

#### Page 2: FSV & Control - Section 1 (6 questions)
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `q3` | Dropdown | -5 to +5 | "I am destined to fail because I am not good enough" |
| `q4` | Dropdown | -5 to +5 | "I need to take on big things to prove that I am good enough" |
| `q5` | Dropdown | -5 to +5 | "I often feel distant from others, which makes me question my worthiness" |
| `q6` | Dropdown | -5 to +5 | "To feel safe, I must gain the approval of others" |
| `q7` | Dropdown | -5 to +5 | "When someone does not recognize my value, I feel like I have to retreat" |
| `q8` | Dropdown | -5 to +5 | "When I am not accepted by others I feel unsafe" |

#### Page 3: Showing & Receiving - Section 2 (6 questions)
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `q10` | Dropdown | -5 to +5 | "I will sacrifice my happiness to serve others" |
| `q11` | Dropdown | -5 to +5 | "It is ok for me to do things for others, but I am uncomfortable receiving" |
| `q12` | Dropdown | -5 to +5 | "I need to be valuable to others in order to be loved" |
| `q13` | Dropdown | -5 to +5 | "I know that others will hurt me in some way, so I must keep my distance" |
| `q14` | Dropdown | -5 to +5 | "Those around me are unable to express their love for me" |
| `q15` | Dropdown | -5 to +5 | "The isolation I feel proves that I will never be loved" |

#### Page 4: Control & Fear - Section 3 (6 questions)
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `q17` | Dropdown | -5 to +5 | "If I do not control my world, I know I will suffer" |
| `q18` | Dropdown | -5 to +5 | "To avoid emotions I do not like, I distract myself by staying busy" |
| `q19` | Dropdown | -5 to +5 | "When I feel alone, I feel like I am out of control / not safe" |
| `q20` | Dropdown | -5 to +5 | "I know that I will have experiences that will cause me pain" |
| `q21` | Dropdown | -5 to +5 | "To be safe, I have to keep distance between myself and others" |
| `q22` | Dropdown | -5 to +5 | "I live in constant fear of things going wrong for me" |

#### Page 5: Rankings (12 questions)
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `thought_fsv` | Dropdown | 1-10 | "I have to do something / be someone better to be safe" |
| `thought_exval` | Dropdown | 1-10 | "I need others to value me to be safe" |
| `thought_showing` | Dropdown | 1-10 | "I need to suffer or sacrifice for others to be safe" |
| `thought_receiving` | Dropdown | 1-10 | "I have to keep distance from others to be safe" |
| `thought_control` | Dropdown | 1-10 | "I need to control my environment to be safe" |
| `thought_fear` | Dropdown | 1-10 | "I need to protect myself to be safe" |
| `feeling_fsv` | Dropdown | 1-10 | "I feel insufficient" |
| `feeling_exval` | Dropdown | 1-10 | "I feel like I am not good enough for them" |
| `feeling_showing` | Dropdown | 1-10 | "I feel the need to sacrifice for others" |
| `feeling_receiving` | Dropdown | 1-10 | "I feel like nobody loves me" |
| `feeling_control` | Dropdown | 1-10 | "I feel out of control of my world" |
| `feeling_fear` | Dropdown | 1-10 | "I feel like I am in danger" |

### System Outputs

#### Calculated Scores (6 categories)
```javascript
{
  FSV: number,        // False Self-View score
  ExVal: number,      // External Validation score
  Showing: number,    // Showing/Giving score
  Receiving: number,  // Receiving/Distance score
  Control: number,    // Control score
  Fear: number        // Fear/Protection score
}
```

**Formula:** `score = sum(3 statements) + (2 × normalized_thought_ranking)`

#### Winner Category
```javascript
{
  winner: string  // One of: "FSV", "ExVal", "Showing", "Receiving", "Control", "Fear"
}
```

**Determination:** Highest score wins; ties broken by feeling ranking

#### Data Package Saved
```javascript
{
  formData: {...},  // All student inputs
  scores: {...},    // Calculated category scores
  winner: "..."     // Winning category
}
```

### 🔍 Tool 1: Output Interpretation Guide

#### Understanding Category Scores

**Score Range:** -25 to +25 (theoretical range, practical range typically -20 to +23)

**Score Interpretation:**
- **Negative scores (-25 to -1):** Pattern is ABSENT or OPPOSITE behavior is present
  - Example: FSV = -11 means student shows confidence, NOT false self-view
- **Low positive (1-7):** Pattern is EMERGING or MILD
  - Pattern exists but isn't dominant in student's life
- **Medium positive (8-14):** Pattern is MODERATE and ACTIVE
  - Pattern significantly influences behavior and decisions
- **High positive (15+):** Pattern is DOMINANT and SEVERE
  - Pattern is primary driver of trauma responses

#### Category Meanings

**FSV (False Self-View):**
- **High (+):** "I'm not good enough" - feelings of inadequacy, proving oneself, striving for worthiness
- **Low (-):** Strong self-acceptance, comfort with authentic self
- **Financial Manifestation:** Hiding financial reality, minimizing successes, exaggerating struggles

**ExVal (External Validation):**
- **High (+):** "I need others to value me to be safe" - approval-seeking, fear of judgment
- **Low (-):** Self-directed, internally validated
- **Financial Manifestation:** Spending for status, seeking approval for financial decisions, financial secrecy

**Showing:**
- **High (+):** "I need to suffer/sacrifice for others to be safe" - over-giving, martyrdom
- **Low (-):** Healthy boundaries with giving
- **Financial Manifestation:** Over-giving money to others, guilt about self-care spending, financial enabling

**Receiving:**
- **High (+):** "I have to keep distance from others to be safe" - isolation, rejecting help
- **Low (-):** Comfortable accepting help and support
- **Financial Manifestation:** Refusing financial advice, not seeking help when struggling, isolated financial decisions

**Control:**
- **High (+):** "I need to control my environment to be safe" - hyper-vigilance, rigidity
- **Low (-):** Comfortable with uncertainty, flexible
- **Financial Manifestation:** Obsessive tracking OR complete avoidance (both ends of control spectrum)

**Fear:**
- **High (+):** "I need to protect myself to be safe" - anxiety, hypervigilance about threats
- **Low (-):** Trust, optimism about future
- **Financial Manifestation:** Hoarding, extreme emergency fund focus, or avoidance of financial planning

#### Winner Interpretation

**The "winner" is the PRIMARY trauma strategy** - the main way this person unconsciously tries to feel safe.

**Why this matters for middleware:**
- Winner predicts which Tool 2 financial behaviors will be most prominent
- Winner suggests which interventions will be most effective
- Winner indicates which Tool 3 domains will score highest

**Tie-Breaking Logic:**
When multiple categories have the same score, the feeling ranking (1-10) breaks the tie. Higher feeling ranking = stronger emotional attachment to that pattern.

#### Score Combination Patterns

**"Dual Dominance"** (2+ scores above 15):
- More complex trauma presentation
- Patterns reinforce each other
- Example: High Showing + High ExVal = "I give to others to gain their approval"

**"Inverse Patterns"** (high positive + high negative in related categories):
- Internal conflict present
- Example: High Showing (+18) + Low Receiving (-10) = "I give but can't receive"

**"Flat Profile"** (all scores between -5 and +5):
- Either very healthy OR disconnected from self-awareness
- Requires Tool 2 context to interpret

---

## 💰 Tool 2: Financial Clarity & Values Assessment

**Purpose:** Comprehensive financial clarity assessment with psychological patterns
**Flow:** 5 pages, 56 questions (13 + 11 + 10 + 13 + 9)
**Time:** 20-30 minutes

### Student Inputs

#### Page 1: Demographics & Mindset Foundation (13 questions)

**Identity (Auto-filled from Tool 1)**
| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `name` | Text (readonly) | Tool 1 | Pre-filled, read-only |
| `email` | Email (readonly) | Tool 1 | Pre-filled, read-only |
| `studentId` | Text (readonly) | clientId | Auto-generated |

**Life Stage Context**
| Field | Type | Options/Range |
|-------|------|---------------|
| `age` | Number | 18-100 |
| `marital` | Dropdown | single, dating, married, divorced, widowed |
| `dependents` | Number | 0-20 |
| `living` | Dropdown | rent, own-mortgage, own-paid, family |

**Employment & Income Context**
| Field | Type | Options/Range | Conditional |
|-------|------|---------------|-------------|
| `incomeStreams` | Number | 0-10 | Number of additional income sources |
| `employment` | Dropdown | 9 options | See full list below |
| `businessStage` | Dropdown | 5 stages | Only if employment includes business |

**Employment Options:**
- full-time, part-time
- full-time-with-business, part-time-with-business
- self-employed, business-owner
- unemployed, retired, not-working

**Business Stage Options (conditional):**
- idea, startup, early, growth, established

**Mindset Baseline**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `holisticScarcity` | Dropdown | -5 to +5 | Holistic scarcity vs abundance mindset |
| `financialScarcity` | Dropdown | -5 to +5 | Financial scarcity vs abundance mindset |
| `moneyRelationship` | Dropdown | -5 to +5 | Relationship with money (combat to great) |

#### Page 2: Money Flow Domain - Income & Spending (11 questions)

**Income Clarity**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `incomeClarity` | Dropdown | -5 to +5 | Level of clarity on income |
| `incomeSufficiency` | Dropdown | -5 to +5 | How sufficient is current income |
| `incomeConsistency` | Dropdown | -5 to +5 | How consistent is monthly income |
| `incomeStress` | Dropdown | -5 to +5 | Stress level around income |
| `incomeSources` | Textarea | Free text | List of income sources (comma-separated) |

**Spending Clarity**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `spendingClarity` | Dropdown | -5 to +5 | Level of clarity on spending |
| `spendingConsistency` | Dropdown | -5 to +5 | How consistent is monthly spending |
| `spendingReview` | Dropdown | -5 to +5 | How detailed is spending review |
| `spendingStress` | Dropdown | -5 to +5 | Stress level around spending |
| `majorExpenses` | Textarea | Free text | Major expense categories |
| `wastefulSpending` | Textarea | Free text | Wasteful spending to reduce |

#### Page 3: Obligations Domain - Debt & Emergency Fund (10 questions)

**Debt Position**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `debtClarity` | Dropdown | -5 to +5 | Level of clarity on debt |
| `debtTrending` | Dropdown | -5 to +5 | Is debt trending up or down |
| `debtReview` | Dropdown | -5 to +5 | How often review debt position |
| `debtStress` | Dropdown | -5 to +5 | Stress level around debt |
| `currentDebts` | Textarea | Free text | List of current debts with amounts |

**Emergency Fund**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `emergencyFundMaintenance` | Dropdown | -5 to +5 | Do you maintain separate emergency fund |
| `emergencyFundMonths` | Dropdown | -5 to +5 | Months of expenses covered |
| `emergencyFundFrequency` | Dropdown | -5 to +5 | How often tap into fund |
| `emergencyFundReplenishment` | Dropdown | -5 to +5 | How quickly can replenish |
| `emergencyFundStress` | Dropdown | -5 to +5 | Stress around emergency preparedness |

#### Page 4: Growth Domain - Savings, Investments, Retirement (13 questions)

**Savings**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `savingsLevel` | Dropdown | -5 to +5 | Level of savings beyond emergency fund |
| `savingsRegularity` | Dropdown | -5 to +5 | How regularly contribute to savings |
| `savingsClarity` | Dropdown | -5 to +5 | Level of clarity on savings |
| `savingsStress` | Dropdown | -5 to +5 | Stress level around savings |

**Investments**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `investmentActivity` | Dropdown | -5 to +5 | Do you invest outside your business |
| `investmentClarity` | Dropdown | -5 to +5 | Level of clarity on investments |
| `investmentConfidence` | Dropdown | -5 to +5 | Confidence in investment strategy |
| `investmentStress` | Dropdown | -5 to +5 | Stress level around investments |
| `investmentTypes` | Textarea | Free text | Main investment types with amounts |

**Retirement**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `retirementAccounts` | Dropdown | -5 to +5 | What retirement accounts maintained |
| `retirementFunding` | Dropdown | -5 to +5 | How well funded for retirement |
| `retirementConfidence` | Dropdown | -5 to +5 | Confidence in retirement plan |
| `retirementStress` | Dropdown | -5 to +5 | Stress around retirement preparedness |

#### Page 5: Protection + Psychological (9 questions)

**Insurance Protection (4 questions)**
| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `insurancePolicies` | Dropdown | -5 to +5 | What insurance policies maintained |
| `insuranceClarity` | Dropdown | -5 to +5 | Level of clarity on coverage |
| `insuranceConfidence` | Dropdown | -5 to +5 | Confidence in insurance protection |
| `insuranceStress` | Dropdown | -5 to +5 | Stress level around insurance/protection |

**Psychological Clarity (3 questions)**
| Field | Type | Options/Range | Description |
|-------|------|---------------|-------------|
| `financialEmotions` | Textarea | Free text | Emotions when thinking about reviewing finances |
| `primaryObstacle` | Dropdown | 11 options | PRIMARY obstacle to gaining financial clarity |
| `goalConfidence` | Dropdown | -5 to +5 | Confidence in achieving financial goals |

**Primary Obstacle Options:**
- lack-of-time, overwhelming-complexity, emotional-avoidance
- lack-of-knowledge, inconsistent-income, too-much-debt
- past-trauma, dont-trust-myself, fear-of-discovery
- partner-resistance, other

**Trauma-Adaptive Questions (2 questions)**
*These questions link Tool 1 trauma winner to Tool 2 financial impact*

| Field | Type | Scale | Description |
|-------|------|-------|-------------|
| `adaptiveScale` | Dropdown | -5 to +5 | How Tool 1 pattern shows up financially |
| `adaptiveImpact` | Textarea | Free text | Specific impact of Tool 1 pattern on finances |

**Adaptive Scale Meaning:**
- **-5 to -1:** Tool 1 trauma pattern HURTS financial life
- **+1 to +5:** Tool 1 trauma pattern HELPS in some way (often Showing pattern)

### System Outputs

#### Domain Scores (Calculated)
```javascript
{
  domainScores: {
    moneyFlow: number,      // Raw score (max 80)
    obligations: number,    // Raw score (max 90)
    liquidity: number,      // Raw score (max 40)
    growth: number,         // Raw score (max 80)
    protection: number      // Raw score (max 40)
  },
  benchmarks: {
    moneyFlow: {
      raw: number,
      max: 80,
      percentage: number,   // (raw/max) × 100
      level: string         // "Low" | "Medium" | "High"
    },
    obligations: {
      raw: number,
      max: 90,
      percentage: number,
      level: string
    },
    liquidity: {
      raw: number,
      max: 40,
      percentage: number,
      level: string
    },
    growth: {
      raw: number,
      max: 80,
      percentage: number,
      level: string
    },
    protection: {
      raw: number,
      max: 40,
      percentage: number,
      level: string
    }
  },
  weightedScores: {
    moneyFlow: number,      // raw × 5
    obligations: number,    // raw × 4
    liquidity: number,      // raw × 2
    growth: number,         // raw × 1
    protection: number      // raw × 1
  },
  priorityList: [
    {
      domain: string,       // Domain name
      weightedScore: number // Weighted score
    }
    // Sorted by weightedScore ASCENDING (lowest = highest priority)
  ],
  archetype: string,        // "Protection Planner" | "Security Seeker" | "Wealth Architect"
  timestamp: string
}
```

#### Domain Score Calculation Formulas

**Money Flow (max 80 points):**
```javascript
moneyFlow =
  incomeClarity + incomeSufficiency + incomeConsistency + incomeStress +
  spendingClarity + spendingConsistency + spendingReview + spendingStress
// 8 questions × 10 point range (-5 to +5) = 80 max
```

**Obligations (max 90 points):**
```javascript
obligations =
  // Debt section (40 points)
  debtClarity + debtTrending + debtReview + debtStress +
  // Emergency Fund section (50 points)
  emergencyFundMaintenance + emergencyFundMonths +
  emergencyFundFrequency + emergencyFundReplenishment + emergencyFundStress
// 9 questions × 10 point range = 90 max
```

**Liquidity (max 40 points):**
```javascript
liquidity =
  emergencyFundMaintenance + emergencyFundMonths +
  emergencyFundFrequency + emergencyFundReplenishment
// 4 questions × 10 point range = 40 max
```

**Growth (max 80 points):**
```javascript
growth =
  // Savings (40 points)
  savingsLevel + savingsRegularity + savingsClarity + savingsStress +
  // Investments (40 points)
  investmentActivity + investmentClarity + investmentConfidence + investmentStress +
  // Retirement (40 points - subset)
  retirementAccounts + retirementFunding + retirementConfidence + retirementStress
// Note: Only 8 unique questions counted (some overlap with savings/investments)
```

**Protection (max 40 points):**
```javascript
protection =
  insurancePolicies + insuranceClarity + insuranceConfidence + insuranceStress
// 4 questions × 10 point range = 40 max
```

#### Archetype Determination

**Algorithm:**
```javascript
if (obligations > 60 && protection > 25) {
  archetype = "Protection Planner"
} else if (growth > 50 && moneyFlow > 45) {
  archetype = "Wealth Architect"
} else {
  archetype = "Security Seeker"
}
```

**Archetype Meanings:**
- **Protection Planner:** Focuses on safety, security, risk mitigation
- **Security Seeker:** Balances stability with growth opportunities
- **Wealth Architect:** Growth-oriented, strategic, future-focused

#### GPT Insights (Generated)

```javascript
{
  gptInsights: {},  // Reserved for future GPT-based insights per domain
  overallInsight: {
    overview: string,          // How Tool 1 pattern shows up in financial life
    topPatterns: string,       // 3 specific pattern manifestations
    priorityActions: string,   // 5 concrete next steps
    source: "gpt",
    timestamp: string
  }
}
```

**GPT Insight Generation:**
- Pulls Tool 1 winner category
- Analyzes all Tool 2 responses
- Identifies how trauma pattern manifests financially
- Provides trauma-informed action recommendations
- Links specific Tool 2 scores to Tool 1 pattern

**Example GPT Insight Structure:**
```javascript
{
  overview: "Your [Tool1 Winner] pattern shows up as [specific behaviors].
             This impacts your [lowest domains] scores of [percentages]...",

  topPatterns: "
    - Pattern 1: [Specific manifestation from responses]
    - Pattern 2: [Secondary manifestation]
    - Pattern 3: [Strength to leverage]
  ",

  priorityActions: "
    1. For [lowest domain], [specific gentle action]
    2. To shift [pattern], [concrete step]
    3. Leverage [strength] by [application]
    4. Practice [mindset shift]
    5. Long-term, [transformational goal]
  "
}
```

### 🔍 Tool 2: Output Interpretation Guide

#### Understanding Domain Scores

**Raw Score → Percentage Conversion:**
- Each domain has a maximum possible raw score
- Percentage = (raw score / max score) × 100
- **Benchmark Levels:** Low (0-33%), Medium (34-66%), High (67-100%)

**Domain Score Meanings:**

**Money Flow (max: 80 points)**
- **What it measures:** Clarity and stress around income AND spending
- **High (67%+):** Strong awareness of cash flow, organized tracking, low stress
- **Medium (34-66%):** Some awareness, moderate organization, variable stress
- **Low (0-33%):** Avoidance, disorganization, high stress or complete disconnect
- **Key insight:** This is about AWARENESS, not amount of money

**Obligations (max: 90 points)**
- **What it measures:** Debt management + Emergency fund preparedness
- **High (67%+):** Debt declining or well-managed, solid emergency fund (3+ months)
- **Medium (34-66%):** Debt stable or slowly improving, some emergency savings
- **Low (0-33%):** Debt increasing, no emergency fund, crisis mode
- **Key insight:** Combines both burden (debt) and safety net (emergency fund)

**Liquidity (max: 40 points)**
- **What it measures:** Emergency fund maintenance and accessibility
- **High (67%+):** 6+ months expenses, separate account, rarely touched
- **Medium (34-66%):** 2-5 months expenses, some separation, occasional use
- **Low (0-33%):** 0-1 month expenses, no separation, frequent depletion
- **Key insight:** This is about IMMEDIATE access to cash for crises

**Growth (max: 80 points)**
- **What it measures:** Savings, Investments, Retirement preparation
- **High (67%+):** Regular saving, strategic investing, retirement on track
- **Medium (34-66%):** Sporadic saving, some investments, retirement awareness
- **Low (0-33%):** No saving, no investing, no retirement planning
- **Key insight:** This is about FUTURE wealth building, not current wealth

**Protection (max: 40 points)**
- **What it measures:** Insurance coverage adequacy and clarity
- **High (67%+):** Comprehensive insurance, understands coverage, confident
- **Medium (34-66%):** Basic insurance, some understanding, moderate confidence
- **Low (0-33%):** Minimal/no insurance, poor understanding, high vulnerability
- **Key insight:** This is about risk management and safety nets

#### Weighted Score & Priority List

**Weighted Score Formula:**
- Money Flow × 5
- Obligations × 4
- Liquidity × 2
- Growth × 1
- Protection × 1

**Why weighted?**
- Reflects importance hierarchy: cash flow > debt management > emergency funds > growth > protection
- Helps middleware prioritize interventions

**Priority List:**
- Domains sorted by weighted score (LOWEST first)
- **Lowest weighted score = highest intervention priority**
- Example: If Liquidity is lowest, focus on building emergency fund FIRST

#### Archetype Meanings

**Protection Planner:**
- Strong on obligations management
- Focus on safety and security
- May sacrifice growth for stability
- **Common with:** Control, Fear, Showing trauma patterns

**Security Seeker:**
- Balance between stability and growth
- Moderate risk tolerance
- Seeks both safety and opportunity
- **Common with:** ExVal, FSV trauma patterns

**Wealth Architect:**
- High growth orientation
- Strategic long-term thinking
- Comfortable with calculated risk
- **Less common:** Usually indicates lower trauma scores overall

#### Key Field Interpretations

**adaptiveScale (-5 to +5):**
- **Negative:** Tool 1 pattern HURTS financial life
  - -5: "This pattern has devastated my finances"
  - -1: "This pattern occasionally creates problems"
- **Positive:** Tool 1 pattern HELPS in some way
  - +1: "I see some benefits from this pattern"
  - +5: "This pattern serves me well financially"
- **Middleware use:** Negative scales = urgent intervention needed

**adaptiveImpact (open text):**
- **Rich qualitative data** - look for themes:
  - Isolation words: "alone," "isolated," "no one to turn to"
  - Shame words: "ashamed," "embarrassed," "hiding"
  - Control words: "overwhelmed," "out of control," "managing everything"
  - Avoidance words: "don't look," "avoid," "ignore"
- **Middleware use:** NLP analysis can extract trauma markers

**financialEmotions (open text):**
- **Emotion clustering:**
  - Fear cluster: anxiety, fear, panic, dread, terror
  - Shame cluster: shame, guilt, embarrassment, humiliation
  - Anger cluster: frustration, resentment, anger, rage
  - Hope cluster: hope, optimism, excitement, possibility
- **Middleware use:** Emotion detection can flag crisis states

**primaryObstacle (categorical):**
- Maps directly to intervention strategies:
  - "lack-of-time" → time management tools, automation
  - "overwhelming-complexity" → simplified tracking, education
  - "emotional-avoidance" → trauma-informed interventions
  - "past-trauma" → therapeutic support, gentle approaches
  - "lack-of-knowledge" → educational resources
  - "dont-trust-myself" → guided decision-making, accountability

**wastefulSpending (open text):**
- **Pattern detection opportunities:**
  - "impulse" → Control or Fear patterns
  - "others," "gifts," "helping" → Showing pattern
  - "brands," "status," "appearance" → ExVal pattern
  - "comfort," "escape," "cope" → Self-soothing behaviors
- **Middleware use:** Categorize spending patterns for targeted interventions

#### Cross-Domain Pattern Recognition

**High Obligations + Low Liquidity:**
- Debt burden preventing emergency fund building
- **Intervention:** Debt snowball while building minimal emergency fund

**High Money Flow + Low Growth:**
- Good at managing day-to-day but not planning future
- **Intervention:** Automate savings, retirement contributions

**Low across all domains + High stress emotions:**
- Crisis state or complete financial avoidance
- **Intervention:** Urgent support, basic financial stabilization

**High Protection + High Growth + Medium Money Flow:**
- Strategic planner struggling with daily execution
- **Intervention:** Cash flow automation, budgeting tools

---

## 🎭 Tool 3: Identity & Validation Grounding Tool

**Purpose:** Reveals patterns of disconnection from authentic self through false self-view and external validation
**Flow:** 7 pages (1 intro + 6 subdomains), 30 questions
**Time:** 20-25 minutes

### Student Inputs

#### Page 1: Introduction
- No data collection (orientation page)

#### Pages 2-7: Six Subdomains (5 questions each)

Each subdomain follows the same structure:

**Question Structure per Subdomain:**
| Aspect | Type | Scale | Description |
|--------|------|-------|-------------|
| Belief | Dropdown | -3 to +3 | Core belief statement |
| Behavior | Dropdown | -3 to +3 | Behavioral manifestation |
| Feeling | Dropdown | -3 to +3 | Emotional experience |
| Consequence | Dropdown | -3 to +3 | Impact/results of pattern |
| Open Response | Textarea | Free text | Reflection question |

**Subdomain 1: "I'm Not Worthy of Financial Freedom" (Domain 1: False Self-View)**
- Field prefix: `subdomain_1_1_`
- Fields: `belief`, `behavior`, `feeling`, `consequence`, `open_response`
- Open Q: "What specifically are you afraid you'd find or have to face if you looked at your finances clearly right now?"

**Subdomain 2: "I'll Never Have Enough" (Domain 1: False Self-View)**
- Field prefix: `subdomain_1_2_`
- Fields: `belief`, `behavior`, `feeling`, `consequence`, `open_response`
- Open Q: "Describe a specific time you made a financial decision in panic mode..."

**Subdomain 3: "I Can't See My Financial Reality" (Domain 1: False Self-View)**
- Field prefix: `subdomain_1_3_`
- Fields: `belief`, `behavior`, `feeling`, `consequence`, `open_response`
- Open Q: "What financial information do you deliberately avoid looking at right now..."

**Subdomain 4: "Money Shows My Worth" (Domain 2: External Validation)**
- Field prefix: `subdomain_2_1_`
- Fields: `belief`, `behavior`, `feeling`, `consequence`, `open_response`
- Open Q: "What image are you currently trying to project with money..."

**Subdomain 5: "What Will They Think?" (Domain 2: External Validation)**
- Field prefix: `subdomain_2_2_`
- Fields: `belief`, `behavior`, `feeling`, `consequence`, `open_response`
- Open Q: "Whose judgment about your finances do you fear most..."

**Subdomain 6: "I Need to Prove Myself" (Domain 2: External Validation)**
- Field prefix: `subdomain_2_3_`
- Fields: `belief`, `behavior`, `feeling`, `consequence`, `open_response`
- Open Q: "What specifically are you trying to prove with money..."

### System Outputs

#### Subdomain Quotients (6 subdomains)
```javascript
{
  subdomain_1_1: number,  // "I'm Not Worthy of Financial Freedom"
  subdomain_1_2: number,  // "I'll Never Have Enough"
  subdomain_1_3: number,  // "I Can't See My Financial Reality"
  subdomain_2_1: number,  // "Money Shows My Worth"
  subdomain_2_2: number,  // "What Will They Think?"
  subdomain_2_3: number   // "I Need to Prove Myself"
}
```

**Formula:** Average of 4 aspect scores (-3 to +3 scale)

#### Domain Quotients (2 domains)
```javascript
{
  domain1: number,  // False Self-View (average of subdomains 1-3)
  domain2: number   // External Validation (average of subdomains 4-6)
}
```

#### Overall Quotient
```javascript
{
  overallQuotient: number  // "Disconnection from Self Quotient" (average of 2 domains)
}
```

#### GPT Insights (6 subdomain insights)
```javascript
{
  subdomains: {
    subdomain_1_1: {
      pattern: string,      // Pattern identified
      rootCause: string,    // Why this shows up
      impact: string,       // How it affects finances
      actionSteps: string[] // 2-3 concrete actions
    },
    // ... repeated for all 6 subdomains
  }
}
```

#### GPT Syntheses (3 synthesis levels)
```javascript
{
  domain1: {
    dominantPattern: string,
    crossPatternAnalysis: string,
    strategicFocus: string,
    priorityActions: string[]
  },
  domain2: {
    dominantPattern: string,
    crossPatternAnalysis: string,
    strategicFocus: string,
    priorityActions: string[]
  },
  overall: {
    coreDisconnection: string,
    howDomainsInteract: string,
    transformationPath: string,
    nextSteps: string[]
  }
}
```

### 🔍 Tool 3: Output Interpretation Guide

#### Understanding Subdomain Quotients

**Score Range:** -3 to +3 (average of 4 aspect scores)

**Score Interpretation:**
- **Strongly Negative (-3 to -2):** Pattern is OPPOSITE - healthy behavior in this area
  - Example: "I'm Not Worthy of Financial Freedom" = -3 means strong sense of worthiness
- **Mildly Negative (-1.99 to -0.5):** Pattern mostly absent, some healthy behaviors
- **Neutral (-0.49 to +0.49):** Mixed or transitional state
- **Mildly Positive (+0.5 to +1.99):** Pattern is EMERGING - awareness and some manifestation
- **Strongly Positive (+2 to +3):** Pattern is DOMINANT - severe impact on financial life

**Why different scale than Tool 1?**
- Tool 3 uses -3 to +3 for more nuanced grounding work
- Each question has more detailed answer options
- Allows finer-grained detection of patterns

#### Domain Quotient Interpretation

**Domain 1: False Self-View (average of 3 subdomains)**
- Measures: Confusion and lack of clarity about financial reality
- **High (+2 to +3):** Severe disconnection from financial truth
  - Can't see finances clearly
  - Avoidance and willful ignorance dominant
  - Scarcity mindset controls decisions
- **Medium (+0.5 to +1.99):** Moderate confusion
  - Some blind spots in financial reality
  - Occasional avoidance
  - Intermittent scarcity thinking
- **Low/Negative (-3 to +0.49):** Clear self-perception
  - Can see financial reality accurately
  - Engages with full financial picture
  - Sufficiency mindset

**Domain 2: External Validation (average of 3 subdomains)**
- Measures: Decisions driven by others' opinions vs. authentic needs
- **High (+2 to +3):** Severe external focus
  - Money = worth equation is strong
  - Fear of judgment dominates choices
  - Constant need to prove success
- **Medium (+0.5 to +1.99):** Moderate approval-seeking
  - Some status-driven spending
  - Occasional fear of others' opinions
  - Intermittent proving behaviors
- **Low/Negative (-3 to +0.49):** Internal validation
  - Self-worth separate from money
  - Authentic financial choices
  - Comfortable with transparency

**Overall Quotient (average of 2 domains)**
- **"Disconnection from Self Quotient"**
- Measures: How separated from authentic financial self
- **High (+2 to +3):** Severe disconnection - urgent intervention needed
- **Medium (+0.5 to +1.99):** Moderate disconnection - active healing required
- **Low/Negative:** Connected to authentic financial self

#### Subdomain-Specific Meanings

**Subdomain 1.1: "I'm Not Worthy of Financial Freedom"**
- **Pattern:** Unworthiness → avoidance → scattered resources
- **High score manifestations:**
  - Won't look at financial accounts
  - Money scattered across multiple inaccessible places
  - Deep shame about finances
  - Missed opportunities due to unworthiness belief
- **Middleware opportunity:** Flag account consolidation need + shame-informed support

**Subdomain 1.2: "I'll Never Have Enough"**
- **Pattern:** Scarcity → selective blindness (income OR spending, not both)
- **High score manifestations:**
  - Focuses only on income OR only on spending
  - Never sees full financial picture
  - Constant anxiety about sufficiency
  - Panic-mode financial decisions
- **Middleware opportunity:** Build holistic view tools, anxiety management

**Subdomain 1.3: "I Can't See My Financial Reality"**
- **Pattern:** Overwhelm → fragmented view → willful ignorance
- **High score manifestations:**
  - Focuses on one small piece at a time
  - Ignores rest of financial picture
  - Feels helpless about understanding money
  - Blindsided by predictable crises
- **Middleware opportunity:** Create simplified financial dashboard, education

**Subdomain 2.1: "Money Shows My Worth"**
- **Pattern:** Worth = money → image spending → financial strain
- **High score manifestations:**
  - Spends to look successful regardless of strain
  - Anxiety when others might see real finances
  - Debt for image maintenance
  - Status symbol purchasing
- **Middleware opportunity:** Track image spending, self-worth interventions

**Subdomain 2.2: "What Will They Think?"**
- **Pattern:** Living for approval → financial hiding → fear of judgment
- **High score manifestations:**
  - Hides financial choices from loved ones
  - Feels trapped between wants and others' expectations
  - People-pleasing financial decisions
  - Regret about approval-seeking choices
- **Middleware opportunity:** Transparency tools, boundary-setting support

**Subdomain 2.3: "I Need to Prove Myself"**
- **Pattern:** Need for proof → status spending → financial damage
- **High score manifestations:**
  - Buys status symbols to show success
  - Pressure to demonstrate doing well
  - Inadequacy when can't show success
  - Financial damage from proving behaviors
- **Middleware opportunity:** Success redefinition tools, authentic spending tracking

#### GPT Insight Interpretation

**Subdomain Insights (6 total):**
Each insight contains:
- **pattern:** What specific behavior manifests (use for pattern library)
- **rootCause:** Why this shows up (use for educational content)
- **impact:** How it affects finances (use for consequence awareness)
- **actionSteps:** 2-3 concrete actions (use for intervention recommendations)

**Quality indicators for GPT insights:**
- Specificity: Does it reference actual student responses?
- Actionability: Are steps concrete and achievable?
- Empathy: Is tone trauma-informed and non-judgmental?
- Connection: Does it link belief → behavior → feeling → consequence?

**Domain Syntheses (2 total):**
Each synthesis contains:
- **dominantPattern:** Which subdomain is strongest (use for prioritization)
- **crossPatternAnalysis:** How 3 subdomains reinforce each other (use for complexity assessment)
- **strategicFocus:** What to address first (use for intervention sequencing)
- **priorityActions:** Next steps (use for action plan)

**Overall Synthesis:**
- **coreDisconnection:** Root of all patterns (use for therapeutic framing)
- **howDomainsInteract:** How FSV and ExVal reinforce each other (use for system understanding)
- **transformationPath:** Long-term healing journey (use for goal-setting)
- **nextSteps:** Immediate actions (use for client engagement)

#### Open Response Analysis

**What to extract from open responses:**

1. **Concrete examples:** Specific incidents student describes
   - Use for: Case studies, pattern validation

2. **Emotional intensity:** Language strength and frequency
   - Use for: Crisis detection, urgency assessment

3. **Awareness level:** Do they connect belief → behavior → consequence?
   - Use for: Readiness for intervention assessment

4. **Specificity:** Vague vs. detailed responses
   - Use for: Engagement level, authenticity assessment

5. **Themes across responses:**
   - Isolation mentions → Receiving pattern confirmation
   - Approval mentions → ExVal pattern confirmation
   - Shame mentions → FSV pattern confirmation
   - Control mentions → Control/Fear pattern confirmation

#### Score Combination Patterns

**Both Domains High (+2 to +3):**
- Severe disconnection from authentic financial self
- False reality + approval-seeking = double bind
- **Intervention:** Intensive support, start with smallest subdomain

**One Domain High, One Low:**
- Imbalanced disconnection
- Focus intervention on high domain
- **Example:** High FSV + Low ExVal = can't see reality but makes own choices

**Both Domains Low/Negative:**
- Strong connection to authentic financial self
- May still have Tool 1/Tool 2 challenges
- **Intervention:** Focus on practical skills, not identity work

**Subdomain Score Variance:**
- If 3 subdomains vary widely (e.g., +2.5, +0.5, -1.5):
  - Complex, nuanced presentation
  - Target highest subdomain first
  - Build on strengths in negative subdomains

---

## 🔄 Middleware Data Flow Opportunities

### 1. **Tool 1 → Tool 2 Pre-filling**

**Current Implementation:** ✅ Active
```javascript
// Tool 2 pulls from Tool 1
const tool1Response = DataService.getLatestResponse(clientId, 'tool1');
const name = data?.name || tool1Data?.name || '';
const email = data?.email || tool1Data?.email || '';
```

**Fields Auto-filled:**
- `name` (readonly)
- `email` (readonly)
- `studentId` (auto-generated from clientId)

### 2. **Tool 1 → Tool 3 Psychological Context**

**Opportunity:** Use Tool 1 winner category to pre-contextualize Tool 3
```javascript
// Middleware enhancement
if (tool1.winner === 'FSV') {
  // User scored high on False Self-View in Tool 1
  // Could emphasize Domain 1 questions in Tool 3
}
if (tool1.winner === 'ExVal') {
  // User scored high on External Validation in Tool 1
  // Could emphasize Domain 2 questions in Tool 3
}
```

### 3. **Tool 2 → Tool 3 Financial Clarity Mapping**

**Opportunity:** Map financial clarity/stress to psychological patterns

```javascript
// Example correlation
{
  spendingClarity: -5,        // Complete avoidance (Tool 2)
  subdomain_1_1_behavior: -3  // "I avoid looking at accounts" (Tool 3)
  // These should align - validation opportunity
}
```

**Potential Middleware Functions:**
- Pre-populate Tool 3 based on Tool 2 financial stress levels
- Flag inconsistencies between financial behavior (T2) and psychological patterns (T3)
- Generate cross-tool insights

### 4. **Cross-Tool Analytics**

**Composite Scores to Generate:**
```javascript
{
  // Psychological + Financial alignment
  alignment: {
    fsv_financial_clarity: number,     // Tool 1 FSV vs Tool 2 clarity scores
    exval_spending_patterns: number,   // Tool 1 ExVal vs Tool 2 spending stress
    control_emergency_fund: number     // Tool 1 Control vs Tool 2 emergency fund
  },

  // Stress aggregation
  overallStress: {
    psychological: number,  // From Tool 1 scores
    financial: number,      // From Tool 2 stress questions
    identity: number,       // From Tool 3 quotients
    combined: number        // Weighted average
  },

  // Patterns across tools
  patterns: {
    avoidance: boolean,     // Financial + psychological avoidance
    approval_seeking: boolean,
    control_issues: boolean,
    scarcity_mindset: boolean
  }
}
```

### 5. **Data Validation & Consistency Checks**

**Middleware can flag inconsistencies:**
```javascript
// Example: User says high financial clarity but shows avoidance behavior
if (tool2.incomeClarity > 3 && tool3.subdomain_1_1_behavior < -2) {
  flagInconsistency({
    type: 'clarity_mismatch',
    message: 'Reports high income clarity but shows avoidance patterns',
    tools: ['tool2', 'tool3'],
    severity: 'medium'
  });
}
```

---

## 📋 Data Storage Schema

### Tool 1 Response Schema
```javascript
{
  Client_ID: string,
  Tool_Name: "tool1",
  Timestamp: Date,
  Status: "COMPLETED",
  Data: {
    formData: {
      name: string,
      email: string,
      q3: number, q4: number, ... q22: number,
      thought_fsv: number, ... thought_fear: number,
      feeling_fsv: number, ... feeling_fear: number
    },
    scores: {
      FSV: number,
      ExVal: number,
      Showing: number,
      Receiving: number,
      Control: number,
      Fear: number
    },
    winner: string
  },
  Is_Latest: boolean
}
```

### Tool 2 Response Schema
```javascript
{
  Client_ID: string,
  Tool_Name: "tool2",
  Timestamp: Date,
  Status: "COMPLETED",
  Data: {
    formData: {
      // Page 1: Demographics (13 fields)
      name: string,
      email: string,
      studentId: string,
      age: number,
      marital: string,
      dependents: number,
      living: string,
      incomeStreams: number,
      employment: string,
      businessStage: string,
      holisticScarcity: number,
      financialScarcity: number,
      moneyRelationship: number,

      // Page 2: Money Flow (11 fields)
      incomeClarity: number,
      incomeSufficiency: number,
      incomeConsistency: number,
      incomeStress: number,
      incomeSources: string,
      spendingClarity: number,
      spendingConsistency: number,
      spendingReview: number,
      spendingStress: number,
      majorExpenses: string,
      wastefulSpending: string,

      // Page 3: Obligations (10 fields)
      debtClarity: number,
      debtTrending: number,
      debtReview: number,
      debtStress: number,
      currentDebts: string,
      emergencyFundMaintenance: number,
      emergencyFundMonths: number,
      emergencyFundFrequency: number,
      emergencyFundReplenishment: number,
      emergencyFundStress: number,

      // Page 4: Growth (13 fields)
      savingsLevel: number,
      savingsRegularity: number,
      savingsClarity: number,
      savingsStress: number,
      investmentActivity: number,
      investmentClarity: number,
      investmentConfidence: number,
      investmentStress: number,
      investmentTypes: string,
      retirementAccounts: number,
      retirementFunding: number,
      retirementConfidence: number,
      retirementStress: number,

      // Page 5: Protection + Psychological (9 fields)
      insurancePolicies: number,
      insuranceClarity: number,
      insuranceConfidence: number,
      insuranceStress: number,
      financialEmotions: string,
      primaryObstacle: string,
      goalConfidence: number,
      adaptiveScale: number,
      adaptiveImpact: string
    },
    results: {
      domainScores: {
        moneyFlow: number,
        obligations: number,
        liquidity: number,
        growth: number,
        protection: number
      },
      benchmarks: {...},
      weightedScores: {...},
      priorityList: [...],
      archetype: string,
      timestamp: string
    },
    gptInsights: {},
    overallInsight: {
      overview: string,
      topPatterns: string,
      priorityActions: string,
      source: string,
      timestamp: string
    }
  },
  Is_Latest: boolean
}
```

### Tool 3 Response Schema
```javascript
{
  Client_ID: string,
  Tool_Name: "tool3",
  Timestamp: Date,
  Status: "COMPLETED",
  Data: {
    responses: {
      // 24 scale questions (6 subdomains × 4 aspects)
      subdomain_1_1_belief: number,
      subdomain_1_1_behavior: number,
      subdomain_1_1_feeling: number,
      subdomain_1_1_consequence: number,
      subdomain_1_1_open_response: string,
      // ... repeated for all 6 subdomains
    },
    scoring: {
      subdomainQuotients: {...},
      domainQuotients: {...},
      overallQuotient: number
    },
    gpt_insights: {
      subdomains: {...}
    },
    syntheses: {
      domain1: {...},
      domain2: {...},
      overall: {...}
    },
    timestamp: string,
    tool_version: string
  },
  Is_Latest: boolean
}
```

---

## 🔑 Key Middleware Functions Needed

### 1. **Data Retrieval**
```javascript
// Get latest response from any tool
getLatestToolResponse(clientId, toolId)

// Get all responses for cross-tool analysis
getAllClientResponses(clientId)

// Get specific fields across tools
getFieldsAcrosTools(clientId, fieldMap)
```

### 2. **Pre-filling**
```javascript
// Pre-fill Tool 2 from Tool 1
prefillTool2FromTool1(clientId)

// Smart pre-fill based on patterns
suggestResponsesFromHistory(clientId, toolId, page)
```

### 3. **Validation**
```javascript
// Check consistency across tools
validateCrossToolConsistency(clientId)

// Flag anomalies
detectAnomalies(responses)
```

### 4. **Analytics**
```javascript
// Calculate composite scores
calculateCompositeScores(clientId)

// Generate cross-tool insights
generateCrossToolInsights(clientId)

// Pattern detection
detectPatterns(allResponses)
```

### 5. **Reporting**
```javascript
// Generate unified report
generateUnifiedReport(clientId)

// Export data for analysis
exportClientData(clientId, format)
```

---

## 📈 Next Steps for Middleware Development

1. **Phase 1: Data Access Layer**
   - Standardize data retrieval across tools
   - Create unified response accessor functions
   - Build field mapping dictionary

2. **Phase 2: Pre-filling Enhancement**
   - Extend Tool 1 → Tool 2 model to other tools
   - Implement smart suggestions based on patterns
   - Add validation for pre-filled data

3. **Phase 3: Cross-Tool Analytics**
   - Build composite scoring engine
   - Implement pattern detection algorithms
   - Create consistency validators

4. **Phase 4: Unified Reporting**
   - Design cross-tool report templates
   - Build insight synthesis engine
   - Create export functionality

---

## 📝 Notes

- All scale questions use -5 to +5 (Tool 1, Tool 2) or -3 to +3 (Tool 3)
- Tool 3 uses GPT for qualitative insights; Tools 1 & 2 use formula-based scoring
- Draft data stored in PropertiesService; completed data in RESPONSES sheet
- `Is_Latest` flag ensures only current responses are used
- Tool 2 includes critical trauma-adaptive questions (adaptiveScale, adaptiveImpact) that bridge Tool 1 patterns to Tool 2 financial behaviors

---

## 📊 Real Student Data Examples

Based on actual RESPONSES sheet data (as of Nov 2025):

### Example Student: Evelia Salazar (0391ES)

**Tool 1 Output:**
- Winner: **Receiving** (score: 2)
- Scores: FSV=1, ExVal=-12, Showing=-7, Receiving=2, Control=0, Fear=-3
- Pattern: Struggles with accepting help from others

**Tool 2 Output:**
- Archetype: **Protection Planner**
- Domain Scores: Money Flow=42 (53%), Obligations=38 (42%), Liquidity=19 (48%), Growth=24 (30%), Protection=13 (33%)
- Financial Emotions: "avoidance, guilt, shame, overwhelm, fear of responsibility, hopeful of future, excitement of possibilities"
- Primary Obstacle: emotional-avoidance
- Adaptive Impact: "I loss money due to avoidance, not asking questions, I am ashamed to admit where I am financially, so I don't ask for help, I stay isolated or feel I am not enough to take someone time and ask questions, I do struggle alone, become isolated, fear speaking up because I will be judged"

**Cross-Tool Insight:**
- Tool 1 "Receiving" pattern (difficulty accepting help) **directly correlates** with Tool 2 "adaptiveImpact" field showing isolation and reluctance to ask for help
- Low Protection and Growth scores in Tool 2 align with Receiving pattern
- Middleware could flag this alignment for therapist review

### Example Student: Greg Schulte (2382GS)

**Tool 1 Output:**
- Winner: **Showing** (score: 19)
- Scores: FSV=-8, ExVal=8, Showing=19, Receiving=-5, Control=14, Fear=-10
- Pattern: Over-giving to others

**Tool 2 Output:**
- Archetype: **Protection Planner**
- Domain Scores: Money Flow=34 (43%), Obligations=43 (48%), Liquidity=17 (43%), Growth=45 (56%), Protection=25 (63%)
- Financial Emotions: "Anger, Frustration, Dread, Some Hope, Running out of time to save, Fatigue about working hard and not having proper savings, High Stress meetings with spouse"
- Primary Obstacle: past-trauma
- Adaptive Impact: "Resentment, Lack of abundance, inability to meet my personal goals, Retirement is ALWAYS 10 years away, Exhaustion, Anger"
- Adaptive Scale: +4 (positive - showing helps others)

**Cross-Tool Insight:**
- Tool 1 "Showing" pattern **confirmed** by Tool 2 GPT insight: "prioritizing the financial needs of your family and friends, sometimes at the expense of your own financial stability"
- High Obligations score (48%) aligns with over-giving pattern
- Middleware opportunity: Calculate "self-sacrifice index" from Tool 1 Showing + Tool 2 Obligations + wastefulSpending patterns

### Example Student: Adrian Marrero (2798AM)

**Tool 1 Output:**
- Winner: **ExVal** (score: 18)
- Scores: FSV=15, ExVal=18, Showing=10, Receiving=-10, Control=0, Fear=-6
- Pattern: Seeks external validation

**Tool 2 Output:**
- Archetype: **Security Seeker**
- Domain Scores: Money Flow=52 (65%), Obligations=28 (31%), Liquidity=11 (28%), Growth=53 (66%), Protection=29 (73%)
- Financial Emotions: "Anxiety, guilt and embarrassment"
- Primary Obstacle: inconsistent-income
- Adaptive Impact: "makes me overspend"

**Cross-Tool Insight:**
- Tool 1 "ExVal" pattern **validated** by Tool 2 GPT insight: "feeling hesitant to make financial decisions without consulting friends or family"
- Tool 2 insight: "You mentioned feeling the need to buy certain brands to fit in with your social circle" - direct ExVal manifestation
- Middleware opportunity: Track "approval-seeking behaviors" across spending patterns and decision-making

---

## 🔍 Observed Cross-Tool Patterns

### Pattern 1: Trauma Winner → Financial Behavior
| Tool 1 Winner | Common Tool 2 Manifestations |
|--------------|------------------------------|
| **Showing** | High Obligations, Low Liquidity, wastefulSpending on others, guilt about self-care |
| **Receiving** | Low Protection, low emergencyFundMaintenance, reluctance to seek advice, isolation themes in adaptiveImpact |
| **ExVal** | Spending for status, hiding financial reality, primaryObstacle = "fear-of-discovery", brand-conscious spending |
| **FSV** | Avoidance behaviors, low clarity scores across domains, shame/guilt in financialEmotions |
| **Fear** | High stress across all domains, emergency fund obsession or complete avoidance |
| **Control** | High or very low clarity scores (hyper-controlling or completely avoidant), micromanaging or chaos |

### Pattern 2: Tool 2 Archetypes vs Tool 1 Winners
- **Protection Planner** archetype often correlates with Fear, Control, or Showing winners
- **Security Seeker** archetype often correlates with ExVal or FSV winners
- **Wealth Architect** archetype (when present) may correlate with lower trauma scores overall

### Pattern 3: Adaptive Scale Correlations
- **Positive adaptive scales** (+3 to +5): Often Showing winners who find purpose in helping others
- **Negative adaptive scales** (-3 to -5): Often FSV or Fear winners with avoidance patterns
- **Mid-range** (-2 to +2): Mixed patterns or early awareness of patterns

---

**Document maintained by:** Claude Code
**Last updated:** 2025-11-28
**Version:** 1.1 (Enhanced with real student data examples)
