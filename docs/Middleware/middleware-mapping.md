# Complete Tool Input/Output Mapping & Data Flow Reference

**Document Purpose:** Comprehensive mapping of every user input, system output, GPT insight, and cross-tool data flow across all 8 FTP tools. Foundation document for middleware design, cross-tool analytics, and future development.

**Created:** 2025-11-28
**Last Updated:** 2026-02-14
**Version:** 2.0 (Complete 8-tool mapping with cross-pollination flows)
**Status:** Production Reference

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tool 1: Core Trauma Strategy Assessment](#tool-1)
3. [Tool 2: Financial Clarity & Values Assessment](#tool-2)
4. [Tool 3: Identity & Validation Grounding Tool](#tool-3)
5. [Tool 4: Financial Allocation Calculator](#tool-4)
6. [Tool 5: Love & Connection Grounding Tool](#tool-5)
7. [Tool 6: Investment Vehicle Allocation Calculator](#tool-6)
8. [Tool 7: Security & Control Grounding Tool](#tool-7)
9. [Tool 8: Investment Planning Calculator](#tool-8)
10. [Cross-Tool Data Flow & Pre-Population](#cross-tool-data-flow)
11. [Data Collection Summary](#data-collection-summary)

---

## Executive Summary

The FTP-v3 platform collects data through **8 sequential tools** totaling approximately **250+ user-facing questions** across psychological assessment, financial clarity, grounding exercises, allocation planning, and investment modeling.

### Tool Dependency Chain
```
Tool 1 → Tool 2 → Tool 3 → Tool 4 → Tool 5 → Tool 6 → Tool 7 → Tool 8
```

### Tool Categories

| Tool | Name | Category | Questions | Scale | Time |
|------|------|----------|-----------|-------|------|
| 1 | Core Trauma Strategy Assessment | Psychological | 26 | -5 to +5, 1-10 | 15-20 min |
| 2 | Financial Clarity & Values Assessment | Financial | 56 | -5 to +5 | 20-30 min |
| 3 | Identity & Validation Grounding | Grounding | 30 | -3 to +3 | 20-25 min |
| 4 | Financial Allocation Calculator | Financial | 10-29* | 0-10, dollars | 15-20 min |
| 5 | Love & Connection Grounding | Grounding | 30 | -3 to +3 | 20-25 min |
| 6 | Investment Vehicle Allocation | Financial | 30-40* | Various | 20-30 min |
| 7 | Security & Control Grounding | Grounding | 30 | -3 to +3 | 20-25 min |
| 8 | Investment Planning Calculator | Financial | 5-12* | Various | 15-20 min |

*Variable count due to conditional/backup questions

### Data Storage
- **Draft data:** PropertiesService (per-page saves during form completion)
- **Completed responses:** RESPONSES sheet (JSON in Data column)
- **Scenarios:** TOOL4_SCENARIOS, TOOL6_SCENARIOS, TOOL8_SCENARIOS sheets
- **GPT fallback logs:** GPT_FALLBACK_LOG sheet

---

<a id="tool-1"></a>
## Tool 1: Core Trauma Strategy Assessment

**Purpose:** Top-level psychological assessment to identify core trauma strategies
**Flow:** 5 pages, 26 questions
**Time:** 15-20 minutes
**Manifest:** `tools/tool1/tool.manifest.json`
**Dependencies:** None
**Unlocks:** Tool 2

### User-Facing Questions

#### Page 1: Personal Information (2 questions)
| Field | Type | Question Text | Required |
|-------|------|---------------|----------|
| `name` | Text | "First and Last Name" | Yes |
| `email` | Email | "Email Address" | Yes |

#### Page 2: FSV & External Validation (6 questions)
**Scale:** -5 to +5 dropdown
**Instructions:** "-5: I never think/feel/experience this" to "+5: I think/feel/experience this very regularly"

| Field | Question Text | Category |
|-------|---------------|----------|
| `q3` | "I am destined to fail because I am not good enough." | FSV |
| `q4` | "I need to take on big things to prove that I am good enough." | FSV |
| `q5` | "I often feel distant from others, which makes me question my worthiness." | FSV |
| `q6` | "To feel safe, I must gain the approval of others and be accepted by them." | ExVal |
| `q7` | "When someone does not recognize my value, I feel like I have to retreat into myself to be safe." | ExVal |
| `q8` | "When I am not accepted by others I feel unsafe and question if I will be loved." | ExVal |

#### Page 3: Showing & Receiving (6 questions)
**Scale:** -5 to +5 dropdown

| Field | Question Text | Category |
|-------|---------------|----------|
| `q10` | "I will sacrifice my happiness to serve others." | Showing |
| `q11` | "It is ok for me to do things for others, but I am uncomfortable receiving from them." | Showing |
| `q12` | "I need to be valuable to others in order to be loved." | Showing |
| `q13` | "I know that others will hurt me in some way, so I must keep my distance." | Receiving |
| `q14` | "Those around me are unable to express their love for me." | Receiving |
| `q15` | "The isolation I feel proves that I will never be loved." | Receiving |

#### Page 4: Control & Fear (6 questions)
**Scale:** -5 to +5 dropdown

| Field | Question Text | Category |
|-------|---------------|----------|
| `q17` | "If I do not control my world, I know I will suffer." | Control |
| `q18` | "To avoid emotions I do not like, I distract myself by staying busy." | Control |
| `q19` | "When I feel alone, I feel like I am out of control / not safe." | Control |
| `q20` | "I know that I will have experiences that will cause me pain, so I must act to protect myself." | Fear |
| `q21` | "To be safe, I have to keep distance between myself and others, yet feel alone." | Fear |
| `q22` | "I live in constant fear of things going wrong for me." | Fear |

#### Page 5: Rankings (12 questions)
**Scale:** 1-10 dropdown (unique values required per group)
**Validation:** No duplicates within thoughts or feelings groups

**Thought Rankings:**
| Field | Statement | Category |
|-------|-----------|----------|
| `thought_fsv` | "I have to do something / be someone better to be safe." | FSV |
| `thought_exval` | "I need others to value me to be safe." | ExVal |
| `thought_showing` | "I need to suffer or sacrifice for others to be safe." | Showing |
| `thought_receiving` | "I have to keep distance from others to be safe." | Receiving |
| `thought_control` | "I need to control my environment to be safe." | Control |
| `thought_fear` | "I need to protect myself to be safe." | Fear |

**Feeling Rankings:**
| Field | Statement | Category |
|-------|-----------|----------|
| `feeling_fsv` | "I feel insufficient." | FSV |
| `feeling_exval` | "I feel like I am not good enough for them." | ExVal |
| `feeling_showing` | "I feel the need to sacrifice for others." | Showing |
| `feeling_receiving` | "I feel like nobody loves me." | Receiving |
| `feeling_control` | "I feel out of control of my world." | Control |
| `feeling_fear` | "I feel like I am in danger." | Fear |

### System Outputs

#### Score Calculation Formula
```
Category_Score = Sum(3 Statements) + (2 x Normalized_Thought_Ranking)

Normalization: rank 1-5 → (rank - 6), rank 6-10 → (rank - 5)
  1→-5, 2→-4, 3→-3, 4→-2, 5→-1, 6→1, 7→2, 8→3, 9→4, 10→5

Score Range: -25 to +25
```

**Category-to-Question Mapping:**
| Category | Statement Fields | Thought Field |
|----------|-----------------|---------------|
| FSV | q3, q4, q5 | thought_fsv |
| ExVal | q6, q7, q8 | thought_exval |
| Showing | q10, q11, q12 | thought_showing |
| Receiving | q13, q14, q15 | thought_receiving |
| Control | q17, q18, q19 | thought_control |
| Fear | q20, q21, q22 | thought_fear |

#### Winner Determination
1. Category with highest score wins
2. Ties broken by feeling ranking (highest feeling rank value wins)

#### Saved Data Structure
```javascript
{
  formData: {
    name, email,
    q3-q8, q10-q15, q17-q22,
    thought_fsv...thought_fear,
    feeling_fsv...feeling_fear
  },
  scores: { FSV, ExVal, Showing, Receiving, Control, Fear },
  winner: "FSV"|"ExVal"|"Showing"|"Receiving"|"Control"|"Fear"
}
```

### GPT/AI Insights
**None.** Tool 1 uses static report templates per winner category (6 templates in Tool1Templates.js).

### Cross-Tool Data
**Pulls from:** None (first tool in chain)
**Provides to:** Tool 2 (name, email, winner, scores), Tool 4 (winner, scores), Tool 8 (winner, scores)

---

<a id="tool-2"></a>
## Tool 2: Financial Clarity & Values Assessment

**Purpose:** Comprehensive financial clarity assessment with psychological patterns
**Flow:** 5 pages, 56 questions (13 + 11 + 10 + 13 + 9)
**Time:** 20-30 minutes
**Manifest:** `tools/tool2/tool.manifest.json`
**Dependencies:** Tool 1
**Unlocks:** Tool 3

### User-Facing Questions

#### Page 1: Demographics & Mindset Foundation (13 questions)

**Identity (Pre-filled from Tool 1):**
| Field | Type | Source |
|-------|------|--------|
| `name` | Text (readonly) | Tool 1 |
| `email` | Email (readonly) | Tool 1 |
| `studentId` | Text (readonly) | clientId (auto) |

**Life Stage Context:**
| Field | Type | Options/Range |
|-------|------|---------------|
| `age` | Number | 18-100 |
| `marital` | Dropdown | single, dating, married, divorced, widowed |
| `dependents` | Number | 0-20 |
| `living` | Dropdown | rent, own-mortgage, own-paid, family |
| `incomeStreams` | Number | 0-10 |
| `employment` | Dropdown | full-time, part-time, full-time-with-business, part-time-with-business, self-employed, business-owner, unemployed, retired, not-working |
| `businessStage` | Dropdown (conditional) | idea, startup, early, growth, established (shown if employment includes business) |

**Mindset Baseline (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `holisticScarcity` | Holistic scarcity vs abundance mindset |
| `financialScarcity` | Financial scarcity vs abundance mindset |
| `moneyRelationship` | Relationship with money (combat to great) |

#### Page 2: Money Flow Domain (11 questions)

**Income Clarity (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `incomeClarity` | What level of clarity do you hold on your income? |
| `incomeSufficiency` | How sufficient is your current income? |
| `incomeConsistency` | How consistent is your monthly income? |
| `incomeStress` | What is your stress level around income? |

| Field | Type | Question Text |
|-------|------|---------------|
| `incomeSources` | Textarea | List your income sources |

**Spending Clarity (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `spendingClarity` | What level of clarity do you hold on your spending? |
| `spendingConsistency` | How consistent is your monthly spending? |
| `spendingReview` | How detailed is your spending review? |
| `spendingStress` | What is your stress level around spending? |

| Field | Type | Question Text |
|-------|------|---------------|
| `majorExpenses` | Textarea | List your major expense categories |
| `wastefulSpending` | Textarea | What spending do you consider wasteful or want to reduce? |

#### Page 3: Obligations Domain (10 questions)

**Debt Position (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `debtClarity` | What level of clarity do you hold on your debt? |
| `debtTrending` | Is your total debt trending up or down? |
| `debtReview` | How often do you review your debt position? |
| `debtStress` | What is your stress level around debt? |

| Field | Type | Question Text |
|-------|------|---------------|
| `currentDebts` | Textarea | List your current debts |

**Emergency Fund (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `emergencyFundMaintenance` | Do you maintain a separate emergency fund? |
| `emergencyFundMonths` | How many months of expenses does your emergency fund cover? |
| `emergencyFundFrequency` | How often do you tap into your emergency fund? |
| `emergencyFundReplenishment` | How quickly can you replenish your emergency fund after use? |
| `emergencyFundStress` | What is your stress level around emergency preparedness? |

#### Page 4: Growth Domain (13 questions)

**Savings (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `savingsLevel` | What level of savings do you maintain beyond your emergency fund? |
| `savingsRegularity` | How regularly do you contribute to savings? |
| `savingsClarity` | What level of clarity do you maintain on savings? |
| `savingsStress` | What is your stress level around savings? |

**Investments (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `investmentActivity` | Do you invest outside your own business? |
| `investmentClarity` | What level of clarity do you maintain on investments? |
| `investmentConfidence` | How confident are you in your investment strategy? |
| `investmentStress` | What is your stress level around investments? |

| Field | Type | Question Text |
|-------|------|---------------|
| `investmentTypes` | Textarea | List your main investment types |

**Retirement (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `retirementAccounts` | What retirement accounts do you maintain? |
| `retirementFunding` | How regularly and fully do you fund retirement accounts? |
| `retirementConfidence` | How confident are you in your retirement strategy? |
| `retirementStress` | What is your stress level around retirement preparedness? |

#### Page 5: Protection + Psychological + Adaptive (9 questions)

**Insurance Protection (scale -5 to +5):**
| Field | Question Text |
|-------|---------------|
| `insurancePolicies` | What insurance policies do you maintain? |
| `insuranceClarity` | What level of clarity do you have on your coverage? |
| `insuranceConfidence` | How confident are you in your insurance protection? |
| `insuranceStress` | What is your stress level around insurance and protection? |

**Psychological Clarity:**
| Field | Type | Question Text |
|-------|------|---------------|
| `financialEmotions` | Textarea | What emotions arise when you think about reviewing your finances? |
| `primaryObstacle` | Dropdown | What is your PRIMARY obstacle to gaining financial clarity? |
| `goalConfidence` | Scale -5 to +5 | How confident are you in achieving your financial goals? |

**Primary Obstacle Options:** lack-of-time, overwhelming-complexity, emotional-avoidance, lack-of-knowledge, inconsistent-income, too-much-debt, past-trauma, dont-trust-myself, fear-of-discovery, partner-resistance, other

**Trauma-Adaptive Questions (varies by Tool 1 winner):**
| Field | Type | Description |
|-------|------|-------------|
| `adaptiveScale` | Scale -5 to +5 | Trauma-specific question (see variants below) |
| `adaptiveImpact` | Textarea | Specific impact of Tool 1 pattern on finances |

**Q55 Adaptive Variants (based on Tool 1 winner):**
| Winner | Question Text |
|--------|---------------|
| FSV | "How much do you hide your true financial situation from others?" |
| Control | "How much does lack of financial control create anxiety for you?" |
| ExVal | "How much do others' opinions about your money affect your financial decisions?" |
| Fear | "How much does financial fear paralyze your decision-making?" |
| Receiving | "How comfortable are you receiving help or support around money?" |
| Showing | "How much do you sacrifice your financial security to serve or help others?" |

### System Outputs

#### Domain Score Calculation
**Normalization:** Each -5 to +5 value converted to 0-10: `normalized = value + 5`

| Domain | Fields | Max Points |
|--------|--------|------------|
| Money Flow | incomeClarity, incomeSufficiency, incomeConsistency, incomeStress, spendingClarity, spendingConsistency, spendingReview, spendingStress | 80 |
| Obligations | debtClarity, debtTrending, debtReview, debtStress, emergencyFundMaintenance, emergencyFundMonths, emergencyFundFrequency, emergencyFundReplenishment, emergencyFundStress | 90 |
| Liquidity | savingsLevel, savingsRegularity, savingsClarity, savingsStress | 40 |
| Growth | investmentActivity, investmentClarity, investmentConfidence, investmentStress, retirementAccounts, retirementFunding, retirementConfidence, retirementStress | 80 |
| Protection | insurancePolicies, insuranceClarity, insuranceConfidence, insuranceStress | 40 |

#### Benchmark Levels
- **High:** ≥60% of max
- **Medium:** 20-59%
- **Low:** <20%

#### Stress-Weighted Scores
| Domain | Weight |
|--------|--------|
| Money Flow | 5x |
| Obligations | 4x |
| Liquidity | 2x |
| Growth | 1x |
| Protection | 1x |

**Priority List:** Domains sorted by weighted score ascending (lowest = highest priority)

#### Growth Archetype
Determined by top-priority domain (lowest weighted score):

| Top Domain | Archetype |
|-----------|-----------|
| Money Flow | Money Flow Optimizer |
| Obligations | Debt Freedom Builder |
| Liquidity | Security Seeker |
| Growth | Wealth Architect |
| Protection | Protection Planner |
| Default | Financial Clarity Seeker |

### GPT/AI Insights

**3-Tier Fallback System:**
1. GPT-4o-mini call (7 individual response analyses)
2. Retry after 2-second delay
3. Hard-coded domain-specific fallbacks

**7 Individual Analyses:**
| Type | Source Field | Output |
|------|-------------|--------|
| income_sources | incomeSources | pattern, insight, action |
| major_expenses | majorExpenses | pattern, insight, action |
| wasteful_spending | wastefulSpending | pattern, insight, action |
| debt_list | currentDebts | pattern, insight, action |
| investments | investmentTypes | pattern, insight, action |
| emotions | financialEmotions | pattern, insight, action |
| adaptive_trauma | adaptiveScale + adaptiveImpact | pattern, insight, action |

**Overall Synthesis (GPT-4o):**
```javascript
{
  overview: "2-3 paragraphs synthesizing all insights",
  topPatterns: "3 key patterns",
  priorityActions: "5 numbered priority actions",
  source: "gpt"|"fallback",
  timestamp: ISO
}
```

### Cross-Tool Data
**Pulls from:** Tool 1 (name, email, winner/topTrauma, scores)
**Provides to:** Tool 4 (age, dependents, employment, income data), Tool 6 (age, marital, employment), Tool 8 (age, investmentConfidence)

---

<a id="tool-3"></a>
## Tool 3: Identity & Validation Grounding Tool

**Purpose:** Reveals patterns of disconnection from authentic self through false self-view and external validation
**Flow:** 7 pages (1 intro + 6 subdomains), 30 questions (24 scale + 6 open)
**Time:** 20-25 minutes
**Manifest:** `tools/tool3/tool3.manifest.json`
**Dependencies:** Tool 2
**Unlocks:** Tool 4

### Grounding Tool Question Structure

Tools 3, 5, and 7 share identical structure (via GroundingFormBuilder):
- **2 domains**, each with **3 subdomains**
- Each subdomain has **4 scale questions** (Belief, Behavior, Feeling, Consequence) + **1 open response**
- **Scale:** -3 to +3 (no zero), with detailed descriptive labels per option
- **Open responses:** Textarea, minimum 20 characters

### Tool 3 Domains & Subdomains

**Domain 1: False Self-View (Disconnection from Self)**

| Page | Subdomain | Key | Theme |
|------|-----------|-----|-------|
| 2 | 1.1 | `subdomain_1_1` | "I am Not Worthy of Financial Freedom" |
| 3 | 1.2 | `subdomain_1_2` | "I will Never Have Enough" |
| 4 | 1.3 | `subdomain_1_3` | "I Cannot See My Financial Reality" |

**Domain 2: External Validation (Disconnection from Self)**

| Page | Subdomain | Key | Theme |
|------|-----------|-----|-------|
| 5 | 2.1 | `subdomain_2_1` | "Money Shows My Worth" |
| 6 | 2.2 | `subdomain_2_2` | "What Will They Think?" |
| 7 | 2.3 | `subdomain_2_3` | "I Need to Prove Myself" |

### Scale Question Details (All 24)

**Subdomain 1.1: "I am Not Worthy of Financial Freedom"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_1_belief` | "I am not the kind of person who gets to have financial freedom" |
| Behavior | `subdomain_1_1_behavior` | "I avoid looking at my financial accounts and/or have money scattered across multiple places where I cannot easily access it" |
| Feeling | `subdomain_1_1_feeling` | "I feel deep shame and unworthiness about my financial situation" |
| Consequence | `subdomain_1_1_consequence` | "Believing I am not the kind of person who gets financial freedom has caused me to miss opportunities or make poor financial decisions" |

**Open Response:** `subdomain_1_1_open_response`
"What specifically are you afraid you would find or have to face if you looked at your finances clearly right now?"

**Subdomain 1.2: "I will Never Have Enough"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_2_belief` | "I will never have enough money, no matter how much I earn" |
| Behavior | `subdomain_1_2_behavior` | "I ignore income and focus only on spending, or ignore spending and focus only on income - never paying attention to both at once" |
| Feeling | `subdomain_1_2_feeling` | "I feel constant anxiety that there is never enough and/or confusion about whether I will have enough money" |
| Consequence | `subdomain_1_2_consequence` | "I have made financial decisions in panic mode that made things worse, or missed opportunities because I did not realize I had the resources" |

**Open Response:** `subdomain_1_2_open_response`
"Describe a specific time you made a financial decision in panic mode because you felt there would never be enough..."

**Subdomain 1.3: "I Cannot See My Financial Reality"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_3_belief` | "Finances are too complex/overwhelming for me to understand" |
| Behavior | `subdomain_1_3_behavior` | "I do not look at my full financial picture; I focus on one small piece at a time and ignore the rest" |
| Feeling | `subdomain_1_3_feeling` | "I feel overwhelmed and helpless about understanding money" |
| Consequence | `subdomain_1_3_consequence` | "I have been blindsided by financial crises that I should have seen coming if I had been paying attention" |

**Open Response:** `subdomain_1_3_open_response`
"What financial information do you deliberately avoid looking at right now, and what specifically do you fear you would discover if you looked?"

**Subdomain 2.1: "Money Shows My Worth"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_1_belief` | "How much money I have (or appear to have) determines my worth and value" |
| Behavior | `subdomain_2_1_behavior` | "I spend money to look successful/worthy to others, even when it strains my actual finances" |
| Feeling | `subdomain_2_1_feeling` | "I feel anxiety and shame when I think others might see my real financial situation" |
| Consequence | `subdomain_2_1_consequence` | "I have gone into debt or damaged my finances to maintain an image or impress others" |

**Open Response:** `subdomain_2_1_open_response`
"What image are you currently trying to project with money, and what is a specific example of something expensive you have bought or done primarily to maintain that image?"

**Subdomain 2.2: "What Will They Think?"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_2_belief` | "Others' opinions about how I spend and what I share about money matter more than my own judgment" |
| Behavior | `subdomain_2_2_behavior` | "I hide my financial choices from people in my life because I am afraid of their judgment" |
| Feeling | `subdomain_2_2_feeling` | "I feel trapped between what I want to do and what others expect me to do financially" |
| Consequence | `subdomain_2_2_consequence` | "I have made financial choices I regret because I was trying to please someone or avoid their disapproval" |

**Open Response:** `subdomain_2_2_open_response`
"Whose judgment about your finances do you fear most, and describe a specific financial choice you have made (or are making) primarily to please them or avoid their disapproval?"

**Subdomain 2.3: "I Need to Prove Myself"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_3_belief` | "I need to prove I am successful/worthy through money and possessions" |
| Behavior | `subdomain_2_3_behavior` | "I buy status symbols and make financial moves to show others I have 'made it'" |
| Feeling | `subdomain_2_3_feeling` | "I feel pressure to show I am doing well financially, and inadequate when I cannot" |
| Consequence | `subdomain_2_3_consequence` | "I have damaged my finances by buying things or making choices to prove my success to others" |

**Open Response:** `subdomain_2_3_open_response`
"What specifically are you trying to prove with money, and who are you trying to prove it to?"

### System Outputs

#### Scoring Hierarchy (4 Levels)

**Level 1 - Aspect Scores:** Raw -3 to +3 values (24 scores)

**Level 2 - Subdomain Quotients (0-100):**
```
rawAvg = (belief + behavior + feeling + consequence) / 4
quotient = ((3 - rawAvg) / 6) * 100
```
Mapping: -3 → 100 (most problematic), +3 → 0 (healthiest)

**Level 3 - Domain Quotients (0-100):**
- Domain 1 = average of subdomain_1_1, subdomain_1_2, subdomain_1_3
- Domain 2 = average of subdomain_2_1, subdomain_2_2, subdomain_2_3

**Level 4 - Overall Quotient (0-100):**
- Overall = average of Domain 1 and Domain 2

**Interpretation Scale:**
| Range | Level | Label |
|-------|-------|-------|
| 0-19 | MINIMAL | Healthy Pattern |
| 20-39 | LOW | Mild Pattern |
| 40-59 | MODERATE | Moderate Pattern |
| 60-79 | HIGH | Significant Pattern |
| 80-100 | CRITICAL | Critical Pattern |

#### Gap Analysis
- **Domain Gap:** highestSubdomain - domainAverage → DIFFUSE (<5), FOCUSED (5-15), HIGHLY_FOCUSED (>15)
- **Belief-Behavior:** |belief - behavior| → ALIGNED (<1), SLIGHT_MISALIGNMENT (1), BELIEF_DRIVES_DYSFUNCTION (≥2, belief<behavior), BEHAVIOR_EXCEEDS_BELIEF (≥2, behavior<belief)

### GPT/AI Insights
- **6 subdomain insights** (GPT-4o-mini, non-blocking, after each page)
- **2 domain syntheses** (GPT-4o, at final submission)
- **1 overall synthesis** (GPT-4o, at final submission)
- **3-tier fallback:** GPT → retry → GroundingFallbacks

### Cross-Tool Data
**Pulls from:** None
**Provides to:** Tool 4 (subdomainQuotients for disconnection score), Tool 6 (subdomainQuotients), Tool 8 (subdomainQuotients for contextual warnings)

---

<a id="tool-4"></a>
## Tool 4: Financial Allocation Calculator

**Purpose:** Creates personalized M/E/F/J (Multiply/Essentials/Freedom/Enjoyment) allocations based on financial priorities, behavioral data, and trauma-informed insights
**Flow:** Pre-survey (10-29 questions) → Priority selection → Interactive calculator → Report
**Time:** 15-20 minutes
**Manifest:** `tools/tool4/tool4.manifest.json`
**Dependencies:** Tool 3
**Unlocks:** Tool 5

### User-Facing Questions

#### Pre-Survey: Core Questions (10 questions, always shown)

| # | Field | Type | Range | Question Text |
|---|-------|------|-------|---------------|
| 1 | `monthlyIncome` | Currency | $0+ | "What is your average monthly take-home income?" |
| 2 | `monthlyEssentials` | Currency | $0+ | "What is your monthly essentials spending?" |
| 3 | `totalDebt` | Currency | $0+ | "What is your total debt (excluding mortgage)?" |
| 4 | `emergencyFund` | Currency | $0+ | "How much money do you currently have in an emergency fund?" |
| 5 | `satisfaction` | Slider | 0-10 | "How satisfied are you with your current financial situation?" |
| 6 | `discipline` | Slider | 0-10 | "How would you rate your financial discipline?" |
| 7 | `impulse` | Slider | 0-10 | "How strong is your impulse control with spending?" |
| 8 | `longTerm` | Slider | 0-10 | "How focused are you on long-term financial goals?" |
| 9 | `lifestyle` | Slider | 0-10 | "How do you prioritize enjoying life now versus saving for later?" |
| 10 | `autonomy` | Slider | 0-10 | "Do you prefer following expert guidance or making your own financial choices?" |

#### Backup Questions (Conditional: shown if Tools 1/2/3 incomplete)

**Tool 1 Backup (3 questions, multi-choice with 6 options each):**
| Field | Question Text |
|-------|---------------|
| `backupStressResponse` | "When money stress hits, what is your typical first response?" |
| `backupCoreBelief` | "Which statement feels most true about money for you?" |
| `backupConsequence` | "What financial pattern do you notice repeating in your life?" |

Options map to: FSV, ExVal, Showing, Receiving, Control, Fear

**Tool 3 Backup (6 sliders, 0-10):**
| Field | Question Text |
|-------|---------------|
| `backupWorthiness` | "How worthy do you feel of financial abundance?" |
| `backupScarcity` | "How often do you feel there is not enough?" |
| `backupAvoidance` | "How much do you avoid looking at your finances?" |
| `backupWorthMoney` | "How much does money define your worth as a person?" |
| `backupOthersJudgment` | "How much do you worry about what others think of your finances?" |
| `backupProving` | "How often do you feel you need to prove your worth through money?" |

**Tool 2 Backup (5 questions):**
| Field | Type | Question Text |
|-------|------|---------------|
| `backupGrowthOrientation` | Slider 0-10 | "How focused are you on growing your money for the future?" |
| `backupStabilityOrientation` | Slider 0-10 | "How focused are you on protecting what you have?" |
| `backupIncomeConsistency` | Radio | "How consistent is your monthly income?" (unstable/stable/very-stable) |
| `backupDependents` | Radio | "Do you have dependents?" (yes/no) |
| `backupLifeStage` | Radio | "What best describes your current stage of life?" (Early/Mid/Late Career, Pre-Retirement, Retirement) |

#### Priority Selection
| Field | Type | Question Text |
|-------|------|---------------|
| `selectedPriority` | Radio | "Choose Your Financial Priority" (10 options, grouped: Recommended/Available/Challenging) |
| `goalTimeline` | Dropdown | "When do you want to reach this goal?" (6mo, 6-12mo, 1-2yr, 2-5yr, 5+yr) |

**10 Financial Priorities:** Build Long-Term Wealth, Get Out of Debt, Feel Financially Secure, Enjoy Life Now, Save for a Big Goal, Stabilize to Survive, Build or Stabilize a Business, Create Generational Wealth, Create Life Balance, Reclaim Financial Control

### System Outputs

#### M/E/F/J Allocation
```javascript
{
  percentages: { Multiply: 0-100, Essentials: 0-100, Freedom: 0-100, Enjoyment: 0-100 },
  lightNotes: { Multiply: "...", Essentials: "...", Freedom: "...", Enjoyment: "..." },
  validationWarnings: [{ message, recommended, actual }]
}
```

**Base Allocation Map (before modifiers):**
| Priority | Multiply | Essentials | Freedom | Enjoyment |
|----------|----------|------------|---------|-----------|
| Build Long-Term Wealth | 40% | 25% | 20% | 15% |
| Get Out of Debt | 15% | 25% | 45% | 15% |
| Feel Financially Secure | 25% | 35% | 30% | 10% |
| Enjoy Life Now | 20% | 20% | 15% | 45% |
| Save for a Big Goal | 15% | 25% | 45% | 15% |
| Stabilize to Survive | 5% | 45% | 40% | 10% |
| Build/Stabilize Business | 20% | 30% | 35% | 15% |
| Create Generational Wealth | 45% | 25% | 20% | 10% |
| Create Life Balance | 15% | 25% | 25% | 35% |
| Reclaim Financial Control | 10% | 35% | 40% | 15% |

**3-Tier Modifier System:**
1. **Financial:** Income range, debt load, emergency fund, income stability
2. **Behavioral:** Discipline, impulse, longTerm scores with satisfaction amplification
3. **Motivational:** Goal timeline, dependents, autonomy

**Satisfaction Amplification:** `satFactor = min(1 + max(0, 5 - satisfaction) * 0.1, 1.3)`

### GPT/AI Insights
- **Main report:** GPT-4o, temp 0.3, 800 tokens (overview, strategic insights, recommendation)
- **Comparison report:** GPT synthesis of 2 scenarios
- **3-tier fallback:** GPT → retry → Tool4Fallbacks.js score-aware generation

### Key Data Note
**CRITICAL:** Field name is `multiply` NOT `multiplyAmount` (Tool4.js:376)

### Cross-Tool Data
**Pulls from:** Tool 1 (winner, scores), Tool 2 (age, dependents, employment, income data, debt data), Tool 3 (subdomainQuotients for disconnection score)
**Provides to:** Tool 6 (monthlyIncome, multiply percentage, investmentScore, goalTimeline), Tool 8 (monthlyIncome, multiply, investmentScore)

---

<a id="tool-5"></a>
## Tool 5: Love & Connection Grounding Tool

**Purpose:** Reveals patterns of disconnection from others through showing love and receiving love
**Flow:** 7 pages (1 intro + 6 subdomains), 30 questions (24 scale + 6 open)
**Time:** 20-25 minutes
**Manifest:** `tools/tool5/tool5.manifest.json`
**Dependencies:** Tool 4
**Unlocks:** Tool 6

### Tool 5 Domains & Subdomains

**Domain 1: Showing Love (Disconnection from Others - Active)**

| Page | Subdomain | Key | Theme |
|------|-----------|-----|-------|
| 2 | 1.1 | `subdomain_1_1` | "I Must Give to Be Loved" |
| 3 | 1.2 | `subdomain_1_2` | "Their Needs > My Needs" |
| 4 | 1.3 | `subdomain_1_3` | "I Cannot Accept Help" |

**Domain 2: Receiving Love (Disconnection from Others - Passive)**

| Page | Subdomain | Key | Theme |
|------|-----------|-----|-------|
| 5 | 2.1 | `subdomain_2_1` | "I Cannot Survive Alone" |
| 6 | 2.2 | `subdomain_2_2` | "I Owe Them Everything" |
| 7 | 2.3 | `subdomain_2_3` | "I Stay in Debt" |

### Scale Questions (24 total)

Each subdomain follows the same Belief/Behavior/Feeling/Consequence pattern as Tool 3.

**Field naming:** `subdomain_X_Y_{aspect}` where aspect = belief, behavior, feeling, consequence
**Open responses:** `subdomain_X_Y_open_response`

**Subdomain 1.1 Questions:**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_1_belief` | "I need to give financially to others or I will lose their love and connection" |
| Behavior | `subdomain_1_1_behavior` | "I give money, pay for things, or financially support others even when I cannot afford to" |
| Feeling | `subdomain_1_1_feeling` | "I feel guilty or anxious when I spend money on myself instead of others" |
| Consequence | `subdomain_1_1_consequence` | "My giving has damaged my own financial stability, savings, or ability to meet my own needs" |
| Open | `subdomain_1_1_open_response` | "Who in your life do you feel you must give money to..." |

**Subdomain 1.2 Questions:**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_2_belief` | "Other people's financial needs are more important and more urgent than mine" |
| Behavior | `subdomain_1_2_behavior` | "I postpone my own financial goals (saving, investing, debt payoff) to help others with theirs" |
| Feeling | `subdomain_1_2_feeling` | "I feel selfish or uncomfortable when I prioritize my financial needs over someone else's" |
| Consequence | `subdomain_1_2_consequence` | "I have fallen behind on my own financial goals because I keep redirecting resources to others" |
| Open | `subdomain_1_2_open_response` | "Think of a time you prioritized someone else's financial needs over your own..." |

**Subdomain 1.3 Questions:**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_3_belief` | "Accepting financial help means I am weak, incapable, or will owe something I cannot repay" |
| Behavior | `subdomain_1_3_behavior` | "I refuse financial help, turn down offers, or insist on handling everything myself even when struggling" |
| Feeling | `subdomain_1_3_feeling` | "I feel shame, vulnerability, or loss of control when someone helps me financially" |
| Consequence | `subdomain_1_3_consequence` | "My refusal to accept help has kept me stuck or made financial problems worse" |
| Open | `subdomain_1_3_open_response` | "Describe a time you refused financial help you actually needed..." |

**Subdomain 2.1 Questions:**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_1_belief` | "I cannot financially survive or thrive without support" |
| Behavior | `subdomain_2_1_behavior` | "I rely on others to cover my expenses or make financial decisions for me" |
| Feeling | `subdomain_2_1_feeling` | "I feel helpless and incapable of managing money on my own" |
| Consequence | `subdomain_2_1_consequence` | "I have stayed in unhealthy relationships because of financial dependence" |
| Open | `subdomain_2_1_open_response` | "Who do you currently depend on financially..." |

**Subdomain 2.2 Questions:**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_2_belief` | "I believe that when someone helps me financially, I owe them and can never fully repay them" |
| Behavior | `subdomain_2_2_behavior` | "I let others control my financial decisions because they have helped me, even when I disagree" |
| Feeling | `subdomain_2_2_feeling` | "I feel trapped and obligated by others' financial help; the weight of owing them is heavy" |
| Consequence | `subdomain_2_2_consequence` | "I have let people control me or made choices I regret because I felt I 'owed' them for their help" |
| Open | `subdomain_2_2_open_response` | "Who do you feel most indebted to..." |

**Subdomain 2.3 Questions:**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_3_belief` | "I will always be in debt; no matter what I do, I cannot get ahead financially" |
| Behavior | `subdomain_2_3_behavior` | "I accumulate debt — credit cards, loans, personal borrowing — or spend money before I have it" |
| Feeling | `subdomain_2_3_feeling` | "I feel shame, stress, and anxiety about my debt — trapped in a cycle I cannot escape" |
| Consequence | `subdomain_2_3_consequence` | "My debt has kept me financially unstable — unable to build savings, create independence, or feel secure" |
| Open | `subdomain_2_3_open_response` | "What is your biggest source of debt right now, and what keeps you from getting out from under it?" |

### System Outputs
Identical scoring hierarchy to Tool 3: Aspect Scores → Subdomain Quotients (0-100) → Domain Quotients → Overall Quotient

### GPT/AI Insights
Same architecture as Tool 3: 6 subdomain + 2 domain + 1 overall synthesis, 3-tier fallback

### Cross-Tool Data
**Pulls from:** None
**Provides to:** Tool 6 (subdomainQuotients), Tool 8 (subdomainQuotients for contextual warnings)

---

<a id="tool-6"></a>
## Tool 6: Investment Vehicle Allocation Calculator

**Purpose:** Profile-based investment vehicle allocation using 9 investor profiles, IRS limits, and ambition quotient scoring
**Flow:** 3 phases (Classification → Allocation inputs → Ambition Quotient) → Calculator → Report
**Time:** 20-30 minutes
**Manifest:** `tools/tool6/tool6.manifest.json`
**Dependencies:** Tool 5
**Unlocks:** Tool 7

### User-Facing Questions

#### Phase A: Classification Questions (2-7 questions)

| Field | Type | Question Text | Options |
|-------|------|---------------|---------|
| `c1_robsStatus` | Radio | ROBS plan status | "not-using", "interested", "using" |
| `c2_robsQualifier1` | Radio (conditional) | ROBS qualifier 1 | Yes/No |
| `c3_robsQualifier2` | Radio (conditional) | ROBS qualifier 2 | Yes/No |
| `c4_robsQualifier3` | Radio (conditional) | ROBS qualifier 3 | Yes/No |
| `c5_workSituation` | Radio | Work situation | "W-2", "Self-employed", "BizWithEmployees", "Both" |
| `c6_hasTradIRA` | Radio (conditional) | Has Traditional IRA? | Yes/No |
| `c7_taxFocus` | Radio (conditional) | Tax focus preference | "Now", "Later", "Both" |

**9 Investor Profiles:**
1. ROBS-In-Use
2. ROBS-Curious
3. Business Owner w/ Employees
4. Solo 401(k) Optimizer
5. Bracket Strategist
6. Catch-Up Contributor (age ≥50, low retirement confidence)
7. Foundation Builder (default W-2)
8. Roth Maximizer
9. Late-Stage Growth (age ≥55 or ≤5 years to retirement)

#### Phase B: Allocation Input Questions (16+ conditional)

**Income & Timeline (always asked):**
| Field | Type | Range |
|-------|------|-------|
| `a1_grossIncome` | Currency | $0+ |
| `a2_yearsToRetirement` | Number | 1-50 |
| `a2b_taxPreference` | Select | Now (Roth) / Later (Traditional) / Both |

**Employer Plans (W-2 only, skipped for Profiles 1-4):**
| Field | Type | Conditional |
|-------|------|-------------|
| `a3_has401k` | Yes/No | Always (W-2) |
| `a4_hasMatch` | Yes/No | If has 401(k) |
| `a5_matchFormula` | Select | If has match (8 options) |
| `a6_hasRoth401k` | Yes/No | If has 401(k) |

**HSA & Education:**
| Field | Type | Conditional |
|-------|------|-------------|
| `a7_hsaEligible` | Yes/No | Always |
| `a8_hasChildren` | Yes/No | Always |
| `a9_numChildren` | Number 1-10 | If has children |
| `a10_yearsToEducation` | Number 0-25 | If has children |
| `a11_educationVehicle` | Select | If has children (529/Coverdell/Both) |

**Current Balances:**
| Field | Type | Conditional |
|-------|------|-------------|
| `a12_current401kBalance` | Currency | If has 401(k) |
| `a13_currentIRABalance` | Currency | Always |
| `a13b_tradIRABalance` | Select | Backdoor Roth pro-rata (none/under10k/over10k/unsure) |
| `a13c_401kAcceptsRollovers` | Select | If has 401(k) + Trad IRA |
| `a13d_selfEmploymentIncome` | Currency | Self-employed only |
| `a14_currentHSABalance` | Currency | If HSA eligible |
| `a15_currentEducationBalance` | Currency | If has children |

**Monthly Contributions:**
| Field | Type | Conditional |
|-------|------|-------------|
| `a16_monthly401kContribution` | Currency | If has 401(k) |
| `a17_monthlyIRAContribution` | Currency | Always |
| `a18_monthlyHSAContribution` | Currency | If HSA eligible |
| `a19_monthlyEducationContribution` | Currency | If has children |

#### Phase C: Ambition Quotient Questions (7-10 questions)

**Retirement Domain (always asked, scale 1-7):**
| Field | Question Text |
|-------|---------------|
| `aq_retirement_importance` | "How important is saving for retirement at this point in your life?" |
| `aq_retirement_anxiety` | "How much anxiety do you currently feel about your retirement outlook?" |
| `aq_retirement_motivation` | "How motivated are you to take action toward your retirement goals?" |

**Education Domain (if hasChildren, scale 1-7):**
| Field | Question Text |
|-------|---------------|
| `aq_education_importance` | "How important is saving for education at this point in your life?" |
| `aq_education_anxiety` | "How much anxiety do you feel about funding education expenses?" |
| `aq_education_motivation` | "How motivated are you to take action toward education savings?" |

**Health Domain (if HSA eligible, scale 1-7):**
| Field | Question Text |
|-------|---------------|
| `aq_health_importance` | "How important is saving for future healthcare costs?" |
| `aq_health_anxiety` | "How much anxiety do you feel about affording healthcare expenses?" |
| `aq_health_motivation` | "How motivated are you to set aside money for health-related expenses?" |

**Tie-Breaker (if all 3 domains active):**
| Field | Type | Options |
|-------|------|---------|
| `aq_tiebreaker` | Select | "Retirement security" / "Education savings" / "Health/medical expenses" |

### System Outputs

**Domain Weights (Ambition Quotient):**
```
importance = (score - 1) / 6
urgency = 1 / (1 + 0.005)^(years * 12)
raw_weight = (importance + urgency_normalized) / 2
final_weight = raw_weight / sum(all_raw_weights)
```

**Vehicle Allocation Waterfall:** Budget cascades through eligible vehicles by domain priority, respecting IRS limits

**Investment Score → Return Rate:**
```
annualReturn = 0.08 + ((score - 1) / 6) * 0.12
Score 1 → 8%, Score 4 → 14%, Score 7 → 20%
```

**Future Value Projections:** Monthly compounding with inflation adjustment

### GPT/AI Insights
- Single report: GPT-4o (overview, key observations, implementation steps)
- Comparison report: GPT-4o (synthesis, decision guidance, tradeoffs)
- 3-tier fallback with profile-aware narratives

### Cross-Tool Data
**Pulls from:** Tool 1 (traumaPattern, scores), Tool 2 (age, income, employment, marital), Tool 3 (subdomainQuotients), Tool 4 (monthlyIncome, multiply, investmentScore, goalTimeline), Tool 5 (subdomainQuotients)
**Provides to:** Tool 8 (investmentScore, yearsToRetirement, monthlyBudget, pre-survey balances a12-a15)

### Key Data Notes
- Tool 4 data is FLAT: `tool4Data.data.multiply` (not double-nested)
- Tool 2 data is at `tool2Data.data.data.age`
- Pre-survey retirement balances (a12-a15) stored in TOOL6_SCENARIOS sheet
- `a13_currentIRABalance` is COMBINED Traditional + Roth total

---

<a id="tool-7"></a>
## Tool 7: Security & Control Grounding Tool

**Purpose:** Reveals patterns of disconnection from greater purpose through control and fear leading to isolation
**Flow:** 7 pages (1 intro + 6 subdomains), 30 questions (24 scale + 6 open)
**Time:** 20-25 minutes
**Manifest:** `tools/tool7/tool7.manifest.json`
**Dependencies:** Tool 6
**Unlocks:** Tool 8

### Tool 7 Domains & Subdomains

**Domain 1: Control Leading to Isolation (Disconnection from Greater Purpose - Active)**

| Page | Subdomain | Key | Theme |
|------|-----------|-----|-------|
| 2 | 1.1 | `subdomain_1_1` | "I Undercharge and Give Away" |
| 3 | 1.2 | `subdomain_1_2` | "I Have Money But Will Not Use It" |
| 4 | 1.3 | `subdomain_1_3` | "Only I Can Do It Right" |

**Domain 2: Fear Leading to Isolation (Disconnection from Greater Purpose - Passive)**

| Page | Subdomain | Key | Theme |
|------|-----------|-----|-------|
| 5 | 2.1 | `subdomain_2_1` | "I Do Not Protect Myself" |
| 6 | 2.2 | `subdomain_2_2` | "I Sabotage Success" |
| 7 | 2.3 | `subdomain_2_3` | "I Trust the Wrong People" |

### Scale Questions (24 total)

**Subdomain 1.1: "I Undercharge and Give Away"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_1_belief` | "I do not deserve to be paid what I am worth, or asking for more would make me greedy or selfish" |
| Behavior | `subdomain_1_1_behavior` | "I undercharge for my work, give away my skills for free, or let people take advantage of me financially" |
| Feeling | `subdomain_1_1_feeling` | "I feel guilty, uncomfortable, or afraid when I consider charging what I am actually worth" |
| Consequence | `subdomain_1_1_consequence` | "I have earned significantly less than I could have because I consistently undervalue my work" |
| Open | `subdomain_1_1_open_response` | "What do you give away for free or undercharge for..." |

**Subdomain 1.2: "I Have Money But Will Not Use It"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_2_belief` | "Spending money on myself or deploying savings is dangerous, even when I have the resources" |
| Behavior | `subdomain_1_2_behavior` | "I hoard money, resist spending even when I can afford to, or keep resources frozen that could be working for me" |
| Feeling | `subdomain_1_2_feeling` | "I feel intense anxiety about spending or deploying money, even when it is clearly the right move" |
| Consequence | `subdomain_1_2_consequence` | "My refusal to use money has cost me opportunities, growth, or quality of life" |
| Open | `subdomain_1_2_open_response` | "What money are you sitting on that you know you should deploy..." |

**Subdomain 1.3: "Only I Can Do It Right"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_1_3_belief` | "If I do not personally control every financial detail, things will go wrong" |
| Behavior | `subdomain_1_3_behavior` | "I refuse to delegate financial tasks, micromanage every detail, or redo others' financial work" |
| Feeling | `subdomain_1_3_feeling` | "I feel anxious and unable to let go when someone else handles financial matters" |
| Consequence | `subdomain_1_3_consequence` | "My need to control every detail has kept me stuck, burned out, or created more chaos than it prevented" |
| Open | `subdomain_1_3_open_response` | "What financial tasks or responsibilities do you refuse to delegate..." |

**Subdomain 2.1: "I Do Not Protect Myself"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_1_belief` | "I would not know what protection to ask for or whether I was doing it correctly, so I avoid it" |
| Behavior | `subdomain_2_1_behavior` | "I enter financial agreements without contracts, do not claim benefits I qualify for, or skip basic protective measures" |
| Feeling | `subdomain_2_1_feeling` | "I feel overwhelmed or paralyzed when I think about protecting myself, so I avoid it" |
| Consequence | `subdomain_2_1_consequence` | "I have lost money or opportunities because I did not have contracts, did not protect myself, or did not claim what I was entitled to" |
| Open | `subdomain_2_1_open_response` | "Describe a financial situation where you knew you should have gotten something in writing..." |

**Subdomain 2.2: "I Sabotage Success"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_2_belief` | "When things start going well financially, I feel like something bad is about to happen or I do not deserve it" |
| Behavior | `subdomain_2_2_behavior` | "I create problems when things are going well, quit projects before they succeed, or turn down opportunities that could help me" |
| Feeling | `subdomain_2_2_feeling` | "I feel anxious, unworthy, or filled with dread when I am on the verge of financial success" |
| Consequence | `subdomain_2_2_consequence` | "I have a pattern of almost succeeding financially but sabotaging it, quitting too soon, or refusing chances that could have changed things" |
| Open | `subdomain_2_2_open_response` | "Describe a time you were close to a financial breakthrough or success but something went wrong..." |

**Subdomain 2.3: "I Trust the Wrong People"**
| Aspect | Field | Question Text |
|--------|-------|---------------|
| Belief | `subdomain_2_3_belief` | "I am destined to be betrayed financially; I always end up trusting people who hurt me" |
| Behavior | `subdomain_2_3_behavior` | "I ignore red flags and trust people with money even when I have a bad feeling about them" |
| Feeling | `subdomain_2_3_feeling` | "I feel resigned to being betrayed — it always happens, so why try to prevent it" |
| Consequence | `subdomain_2_3_consequence` | "I have been financially burned multiple times by people I knew had red flags but trusted anyway" |
| Open | `subdomain_2_3_open_response` | "Describe a specific time you trusted someone with money despite warning signs you noticed..." |

### System Outputs
Identical scoring hierarchy to Tools 3 and 5

### GPT/AI Insights
Same architecture as Tools 3 and 5

### Cross-Tool Data
**Pulls from:** None (despite manifest requiring Tool 6, no actual data pulls)
**Provides to:** Tool 8 (subdomainQuotients for contextual warnings)

---

<a id="tool-8"></a>
## Tool 8: Investment Planning Calculator

**Purpose:** Retirement investment planning with 3 calculation modes, trauma-informed warnings, and scenario comparison
**Flow:** Data review → Calculator (3 modes) → Scenario save → PDF report
**Time:** 15-20 minutes
**Manifest:** `tools/tool8/tool8.manifest.json`
**Dependencies:** Tool 7
**Unlocks:** None (final tool)

### User-Facing Inputs

#### Primary Calculator Inputs (5 inputs, pre-populated from upstream tools)

| Field (HTML ID) | Type | Range | Default Source | Question/Label |
|-----------------|------|-------|----------------|----------------|
| `income` / `incomeN` | Slider + Number | $0-50,000/mo | Tool 6 or Tool 4 | "Retirement Income Goal (today's dollars)" |
| `years` / `yearsN` | Slider + Number | 1-50 years | Tool 6 or (65 - Tool 2 age) | "Years Until Retirement" |
| `risk` / `riskN` | Slider + Number | 0-10 | Tool 6 investmentScore or Tool 4 | "Risk Tolerance" (maps to return via sigmoid) |
| `capN` | Number | $0-50,000/mo | Tool 6 monthlyBudget or Tool 4 | "Monthly Savings Capacity" |
| `a0N` | Number | $0+ | Sum of Tool 6 a12-a15 | "Current Investment Balance" |

#### Advanced Settings (4 inputs, collapsible)
| Field | Type | Range | Default | Label |
|-------|------|-------|---------|-------|
| `inflAdv` / `inflAdvN` | Range + Number | 0-10% | 2.5% | Inflation Rate |
| `drawAdv` / `drawAdvN` | Range + Number | 10-50 years | 30 | Retirement Duration |
| `rRetAdv` / `rRetAdvN` | Range + Number | 0-20% | 10% | Maintenance Return |
| `dragAdv` / `dragAdvN` | Range + Number | 0-50% | 20% | Deployment Drag |

#### Return Override (conditional)
| Field | Type | Condition |
|-------|------|-----------|
| `overrideToggle` | Checkbox | Manual return override |
| `rAccOverride` / `rAccOverrideN` | Range + Number | Active when toggle checked (0.01-30%) |

#### Backup Questions (if Tool 1 data missing, 3 questions)

Same 3 backup questions as Tool 4:
| Field | Question Text |
|-------|---------------|
| `backupStressResponse` | "When money stress hits, what is your typical first response?" |
| `backupCoreBelief` | "Which statement feels most true about money for you?" |
| `backupConsequence` | "What financial pattern do you notice repeating in your life?" |

Pattern determined by majority vote across 3 answers.

### 3 Calculation Modes

**Mode 1: Contribution (default)**
"How much do I need to save monthly?"
- Solves for: Required monthly contribution (`Creq`)

**Mode 2: Return**
"What return do I need?"
- Solves for: Required annual return (`rSolved`) using bisection

**Mode 3: Time**
"How long will it take?"
- Solves for: Required years (`tSolved`) using bisection

### System Outputs

#### Core Formulas
```
Risk-to-Return (Sigmoid): r = rMin + (rMax - rMin) * sigmoid(k * (R - m))
  rMin=0.045, rMax=0.25, k=0.6, m=5.0

Effective Return: rAccEff = rAcc * (1 - drag) + cashOnDrag * drag
  drag=0.20, cashOnDrag=0.05

Required Nest Egg (Growing Annuity):
  M0 = M_real * (1 + infl)^T
  Areq = 12 * M0 * (1 - ((1+g)/(1+j))^(12*D)) / (rRet - infl)

Future Value: FV = A0*(1+rEff)^T + C*((1+i)^(12T) - 1)/i

Required Contribution: Creq = (Areq - FV_A0) / FV_factor
```

#### Risk Bands
| Risk Range | Band Name | Explain |
|-----------|-----------|---------|
| 0.0 - 2.0 | Very Low Risk/Low Returns | Cash/T-bills/IG credit; low vol; high liquidity |
| 2.0 - 4.0 | Steady Returns | Fixed Funds |
| 4.0 - 6.0 | Growth Backed by Hard Assets | Multi-Family Real Estate |
| 6.0 - 8.0 | High Growth | Hedge Fund |
| 8.0 - 10.1 | High Risk/High Reward | Private Equity |

### Trauma Integration (4-Layer System)

**Layer 1: Primary Pattern Detection** (from Tool 1 winner)
6 trauma-specific investment manifestation insights (FSV, ExVal, Showing, Receiving, Control, Fear)

**Layer 2: Contextual Warnings** (from Tools 3/5/7 subdomain scores)
18 warning definitions triggered when subdomain quotient > 50 and specific calculator behaviors detected (e.g., zero contribution, max risk, override all prepopulated values)

**Layer 3: Backup Questions** (if Tool 1 missing)
3 multi-choice questions with majority voting

**Layer 4: Action Barriers** (PDF only)
8 barriers tied to subdomains scoring > 60, with specific messages, first steps, and healing connections

### Scenario Management
- Save up to 10 scenarios per client (FIFO)
- Compare 2 scenarios side-by-side
- PDF generation for single and comparison reports

### GPT/AI Insights
- Single report: GPT-4o (overview, key insights, next steps)
- Comparison report: GPT-4o (synthesis, decision guidance, tradeoffs)
- 3-tier fallback with mode/feasibility-aware templates

### Saved Data Structure (TOOL8_SCENARIOS, 22 columns)
```
Timestamp, Client_ID, Scenario_Name,
M_real, T, Risk_Dial, rAccTarget, rAccEff,
C_cap, A0, Inflation, Draw_Years, rRet,
M0, Areq, Creq, rSolved, tSolved,
Mode, Is_Latest, First_Name, Last_Name
```

### Cross-Tool Data
**Pulls from:** Tool 1 (winner, scores), Tool 2 (age → years calc), Tool 3 (subdomainQuotients), Tool 4 (monthlyIncome, multiply, investmentScore), Tool 5 (subdomainQuotients), Tool 6 (investmentScore, yearsToRetirement, monthlyBudget, pre-survey balances a12-a15, vehicleAllocations), Tool 7 (subdomainQuotients)
**Provides to:** None (final tool)

---

<a id="cross-tool-data-flow"></a>
## Cross-Tool Data Flow & Pre-Population

### Complete Data Flow Map

```
Tool 1 ──────────────────────────────────────────────────────────────────┐
│ name, email → Tool 2 (pre-fill)                                       │
│ winner, scores → Tool 2 (adaptive Q55/Q56)                            │
│ winner, scores → Tool 4 (trauma-aware priority modifiers)             │
│ winner, scores → Tool 6 (GPT context)                                 │
│ winner, scores → Tool 8 (Layer 1 trauma insights, backup questions)   │
└───────────────────────────────────────────────────────────────────────┘

Tool 2 ──────────────────────────────────────────────────────────────────┐
│ age → Tool 6 (catch-up eligibility, profile classification)           │
│ age → Tool 8 (years to retirement fallback: 65 - age)                 │
│ marital → Tool 6 (filing status inference)                            │
│ employment → Tool 6 (profile classification)                          │
│ dependents → Tool 4 (modifier)                                        │
│ investmentConfidence → Tool 8 (risk dial fallback)                    │
│ incomeConsistency → Tool 4 (income stability derivation)              │
└───────────────────────────────────────────────────────────────────────┘

Tool 3 ──────────────────────────────────────────────────────────────────┐
│ subdomainQuotients → Tool 4 (disconnection score for priority mods)   │
│ subdomainQuotients → Tool 6 (GPT context)                             │
│ subdomainQuotients → Tool 8 (Layer 2 contextual warnings, barriers)   │
└───────────────────────────────────────────────────────────────────────┘

Tool 4 ──────────────────────────────────────────────────────────────────┐
│ monthlyIncome → Tool 6 (backup gross income)                          │
│ multiply (%) → Tool 6 (monthly budget = income * multiply / 100)      │
│ multiply (%) → Tool 8 (savings capacity fallback)                     │
│ investmentScore → Tool 6 (return rate, projections)                   │
│ investmentScore → Tool 8 (risk dial fallback: (score-1)/6 * 10)      │
│ goalTimeline → Tool 6 (years to retirement backup)                    │
└───────────────────────────────────────────────────────────────────────┘

Tool 5 ──────────────────────────────────────────────────────────────────┐
│ subdomainQuotients → Tool 6 (GPT context)                             │
│ subdomainQuotients → Tool 8 (Layer 2 contextual warnings, barriers)   │
└───────────────────────────────────────────────────────────────────────┘

Tool 6 ──────────────────────────────────────────────────────────────────┐
│ investmentScore → Tool 8 (primary risk dial)                          │
│ yearsToRetirement → Tool 8 (primary years value)                      │
│ monthlyBudget → Tool 8 (primary savings capacity)                     │
│ Pre-survey a12-a15 → Tool 8 (current balance: sum of 401k+IRA+HSA+ed)│
│ vehicleAllocations → Tool 8 (display context)                         │
│ scenarioTimestamp → Tool 8 (attribution)                               │
└───────────────────────────────────────────────────────────────────────┘

Tool 7 ──────────────────────────────────────────────────────────────────┐
│ subdomainQuotients → Tool 8 (Layer 2 contextual warnings, barriers)   │
└───────────────────────────────────────────────────────────────────────┘

Tool 8 ── Final tool, provides to: None
```

### Pre-Survey / Draft Data Sources

| Tool | Draft Storage Key | Pre-Survey Fields | Source |
|------|-------------------|-------------------|--------|
| Tool 1 | `tool1_draft_{clientId}` | None (first tool) | N/A |
| Tool 2 | `tool2_draft_{clientId}` | name, email | Tool 1 |
| Tool 3 | `tool3_draft_{clientId}` | None | N/A |
| Tool 4 | `tool4_presurvey_{clientId}` | All 10 core + backup questions | User entry |
| Tool 5 | `tool5_draft_{clientId}` | None | N/A |
| Tool 6 | `tool6_presurvey_{clientId}` | Classification + allocation + AQ answers, a12-a15 balances | User + upstream |
| Tool 7 | `tool7_draft_{clientId}` | None | N/A |
| Tool 8 | N/A (no pre-survey) | Pre-populated from Tools 2,4,6 | Upstream tools |

### Tool 8 Pre-Population Priority Chain

Tool 8 resolves each input field from multiple upstream sources with a priority chain:

| Calculator Field | Priority 1 (Primary) | Priority 2 (Fallback) | Priority 3 |
|-----------------|---------------------|----------------------|------------|
| Monthly Savings | Tool 6 scenario `monthlyBudget` | Tool 4: `monthlyIncome * multiply / 100` | Manual entry |
| Current Balance | Tool 6 pre-survey: sum(a12+a13+a14+a15) | None | Manual entry |
| Years to Retire | Tool 6 scenario `yearsToRetirement` | Tool 2: `65 - age` | Manual entry |
| Risk Tolerance | Tool 6 `investmentScore` (0-10) | Tool 4: `(investmentScore-1)/6 * 10` | Tool 2 `investmentConfidence` |

### Backup Question System (Tools 4 & 8)

When upstream tools are incomplete, Tools 4 and 8 ask backup questions:

| Missing Tool | Backup Questions | Purpose |
|-------------|-----------------|---------|
| Tool 1 | 3 stress/belief/pattern questions (6 options each) | Derive trauma pattern via majority vote |
| Tool 2 | 5 questions (growth, stability, income consistency, dependents, life stage) | Derive financial context |
| Tool 3 | 6 sliders (worthiness, scarcity, avoidance, worth-money, judgment, proving) | Derive disconnection score via `10 - score` inversion |

### Cross-Tool Data Access Patterns

**Direct field access:**
```javascript
// Tool 1 → others
tool1Data = DataService.getLatestResponse(clientId, 'tool1')
winner = tool1Data.data.winner
scores = tool1Data.data.scores

// Tool 2 → others
tool2Data = DataService.getLatestResponse(clientId, 'tool2')
age = tool2Data.data.data.age  // Note: double .data
marital = tool2Data.data.data.marital

// Tool 3/5/7 → others
toolXData = DataService.getLatestResponse(clientId, 'toolX')
quotients = toolXData.data.scoring.subdomainQuotients

// Tool 4 → others
tool4Data = DataService.getLatestResponse(clientId, 'tool4')
multiply = tool4Data.data.multiply  // FLAT, not double-nested
monthlyIncome = tool4Data.data.monthlyIncome

// Tool 6 pre-survey → Tool 8
draftData = DraftService.getDraft('tool6', clientId)
a12 = draftData.a12_current401kBalance
```

---

<a id="data-collection-summary"></a>
## Data Collection Summary

### Total Questions by Tool

| Tool | Scale Questions | Text/Select Questions | Open Response | Conditional | Total |
|------|----------------|----------------------|---------------|-------------|-------|
| 1 | 18 (q3-q22) | 2 (name, email) | 0 | 0 | 26* |
| 2 | 37 | 12 (demographics + obstacle) | 7 (free text) | 1 (businessStage) | 56 |
| 3 | 24 | 0 | 6 | 0 | 30 |
| 4 | 6 (sliders) | 4 (currency) | 0 | 0-19 (backup) | 10-29 |
| 5 | 24 | 0 | 6 | 0 | 30 |
| 6 | 9 (AQ) | 20+ (classification, allocation) | 0 | Many (profile-based) | ~35 |
| 7 | 24 | 0 | 6 | 0 | 30 |
| 8 | 0 | 5 (calculator) + 4 (advanced) | 0 | 3 (backup) | 5-12 |

*Tool 1 includes 12 ranking questions (1-10 scale)

### All Field Names by Tool

**Tool 1 (32 fields):**
```
name, email, q3-q8, q10-q15, q17-q22,
thought_fsv, thought_exval, thought_showing, thought_receiving, thought_control, thought_fear,
feeling_fsv, feeling_exval, feeling_showing, feeling_receiving, feeling_control, feeling_fear
```

**Tool 2 (56 fields):**
```
name, email, studentId, age, marital, dependents, living, incomeStreams, employment, businessStage,
holisticScarcity, financialScarcity, moneyRelationship,
incomeClarity, incomeSufficiency, incomeConsistency, incomeStress, incomeSources,
spendingClarity, spendingConsistency, spendingReview, spendingStress, majorExpenses, wastefulSpending,
debtClarity, debtTrending, debtReview, debtStress, currentDebts,
emergencyFundMaintenance, emergencyFundMonths, emergencyFundFrequency, emergencyFundReplenishment, emergencyFundStress,
savingsLevel, savingsRegularity, savingsClarity, savingsStress,
investmentActivity, investmentClarity, investmentConfidence, investmentStress, investmentTypes,
retirementAccounts, retirementFunding, retirementConfidence, retirementStress,
insurancePolicies, insuranceClarity, insuranceConfidence, insuranceStress,
financialEmotions, primaryObstacle, goalConfidence, adaptiveScale, adaptiveImpact
```

**Tools 3, 5, 7 (30 fields each, same pattern):**
```
subdomain_1_1_belief, subdomain_1_1_behavior, subdomain_1_1_feeling, subdomain_1_1_consequence, subdomain_1_1_open_response,
subdomain_1_2_belief, subdomain_1_2_behavior, subdomain_1_2_feeling, subdomain_1_2_consequence, subdomain_1_2_open_response,
subdomain_1_3_belief, subdomain_1_3_behavior, subdomain_1_3_feeling, subdomain_1_3_consequence, subdomain_1_3_open_response,
subdomain_2_1_belief, subdomain_2_1_behavior, subdomain_2_1_feeling, subdomain_2_1_consequence, subdomain_2_1_open_response,
subdomain_2_2_belief, subdomain_2_2_behavior, subdomain_2_2_feeling, subdomain_2_2_consequence, subdomain_2_2_open_response,
subdomain_2_3_belief, subdomain_2_3_behavior, subdomain_2_3_feeling, subdomain_2_3_consequence, subdomain_2_3_open_response
```

**Tool 4 (10 core + 19 backup fields):**
```
Core: monthlyIncome, monthlyEssentials, totalDebt, emergencyFund, satisfaction, discipline, impulse, longTerm, lifestyle, autonomy
Priority: selectedPriority, goalTimeline
Output: multiply, essentials, freedom, enjoyment
Backup T1: backupStressResponse, backupCoreBelief, backupConsequence
Backup T3: backupWorthiness, backupScarcity, backupAvoidance, backupWorthMoney, backupOthersJudgment, backupProving
Backup T2: backupGrowthOrientation, backupStabilityOrientation, backupIncomeConsistency, backupDependents, backupLifeStage
```

**Tool 6 (40+ fields):**
```
Classification: c1_robsStatus, c2-c4_robsQualifier, c5_workSituation, c6_hasTradIRA, c7_taxFocus
Allocation: a1_grossIncome, a2_yearsToRetirement, a2b_taxPreference, a3_has401k, a4_hasMatch, a5_matchFormula, a6_hasRoth401k
HSA/Education: a7_hsaEligible, a8_hasChildren, a9_numChildren, a10_yearsToEducation, a11_educationVehicle
Balances: a12_current401kBalance, a13_currentIRABalance, a13b_tradIRABalance, a13c_401kAcceptsRollovers, a13d_selfEmploymentIncome, a14_currentHSABalance, a15_currentEducationBalance
Contributions: a16_monthly401kContribution, a17_monthlyIRAContribution, a18_monthlyHSAContribution, a19_monthlyEducationContribution
AQ: aq_retirement_importance/anxiety/motivation, aq_education_importance/anxiety/motivation, aq_health_importance/anxiety/motivation, aq_tiebreaker
```

**Tool 8 (9+ fields):**
```
Calculator: income, years, risk, capN, a0N
Advanced: inflAdv, drawAdv, rRetAdv, dragAdv
Override: rAccOverride, overrideToggle
Scenario: scnName
Backup: backupStressResponse, backupCoreBelief, backupConsequence
```

### System-Generated Outputs by Tool

| Tool | Scores | GPT Insights | Syntheses | Other |
|------|--------|-------------|-----------|-------|
| 1 | 6 category scores + winner | None | None | Report template selection |
| 2 | 5 domain scores + benchmarks + weighted + archetype | 7 individual + 1 overall | 1 overall | Priority list |
| 3 | 6 subdomain + 2 domain + 1 overall quotients | 6 subdomain | 2 domain + 1 overall | Gap + belief-behavior analysis |
| 4 | M/E/F/J percentages + dollars | 1 main report | 1 comparison | Priority recommendations, validation warnings |
| 5 | 6 subdomain + 2 domain + 1 overall quotients | 6 subdomain | 2 domain + 1 overall | Gap + belief-behavior analysis |
| 6 | Domain weights + vehicle allocations + projections | 1 single + 1 comparison | None | Profile classification, IRS limit validation |
| 7 | 6 subdomain + 2 domain + 1 overall quotients | 6 subdomain | 2 domain + 1 overall | Gap + belief-behavior analysis |
| 8 | Areq + Creq/rSolved/tSolved + feasibility | 1 single + 1 comparison | None | Risk bands, milestone tables, action barriers |

---

**Document maintained by:** Claude Code
**Last updated:** 2026-02-14
**Version:** 2.0 (Complete 8-tool mapping)
