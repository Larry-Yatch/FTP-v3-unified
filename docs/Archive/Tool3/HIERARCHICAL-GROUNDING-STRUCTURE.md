# Hierarchical Grounding Tool Structure
## Financial TruPath v3 - Design Proposal

**Created:** November 10, 2025
**Updated:** November 10, 2025
**Purpose:** Define the 2-domain × 3-subdomain structure for Tools 3, 5, and 7

---

## 🎯 Core Concept

**Use a hierarchical structure with 3 subdomains per domain:**

```
Tool (e.g., Identity & Validation)
├── Domain 1 (Core Construct - e.g., External Validation)
│   ├── Subdomain 1.1 (Specific Manifestation)
│   │   ├── Belief (scale -3 to +3)
│   │   ├── Behavior (scale -3 to +3)
│   │   ├── Feeling (scale -3 to +3)
│   │   ├── Consequence (scale -3 to +3)
│   │   └── Open Responses (2 questions)
│   ├── Subdomain 1.2
│   └── Subdomain 1.3
│
└── Domain 2 (Core Construct - e.g., False Self-View)
    ├── Subdomain 2.1
    ├── Subdomain 2.2
    └── Subdomain 2.3
```

**Total per tool:** 6 subdomains × 6 questions each = **36 questions**

---

## 📊 Scoring Hierarchy

### **Level 1: Aspect Scores** (Raw Data)
Each of the 4 aspects gets a score from -3 to +3, normalized to 0-100.

**Example:**
```
Subdomain 1.1: Judgment of Financial Status
├── Belief: -3 → 0
├── Behavior: -2 → 16.67
├── Feeling: -1 → 33.33
└── Consequence: 1 → 66.67
```

### **Level 2: Subdomain Quotients** (Average of 4 Aspects)
```
Subdomain 1.1 Quotient = (0 + 16.67 + 33.33 + 66.67) / 4 = 29.17
```

### **Level 3: Domain Quotients** (Average of 3 Subdomains in Domain)
```
Domain 1: External Validation
├── Subdomain 1.1: 29.17
├── Subdomain 1.2: 45.50
└── Subdomain 1.3: 52.00

Domain 1 Quotient = (29.17 + 45.50 + 52.00) / 3 = 42.22
```

### **Level 4: Overall Quotient** (Average of Both Domains)
```
Domain 1 (External Validation): 42.22
Domain 2 (False Self-View): 68.50

Overall Quotient = (42.22 + 68.50) / 2 = 55.36
```

---

## 🔍 Gap Analysis at Multiple Levels

### **Subdomain-Level Gap Analysis**
Within each domain, identify which subdomain is highest:

```
Domain 1: External Validation (Overall: 42.22)
├── Subdomain 1.1: 29.17
├── Subdomain 1.2: 45.50
└── Subdomain 1.3: 52.00 ← HIGHEST

Gap = 52.00 - 42.22 = 9.78 → FOCUSED

Insight: "Within External Validation, Judgment of Financial Decisions
is your primary driver (10-point gap). Start there."
```

### **Domain-Level Gap Analysis**
Between the two domains, identify which is highest:

```
Domain 1 (External Validation): 42.22
Domain 2 (False Self-View): 68.50 ← HIGHEST

Gap = 68.50 - 55.36 = 13.14 → FOCUSED

Insight: "False Self-View is elevated above External Validation
(13-point gap). Both domains are contributing, but start with False Self-View."
```

---

## 📝 Example: Tool 3 (Identity & Validation Grounding)

### **Domain 1: External Validation**
*"How much do others' opinions of your finances impact your decisions?"*

---

#### **Subdomain 1.1: Judgment of Financial Status**
*"Judgment about how much money you have"*

**Belief Scale (-3 to +3):**
> "I believe others judge me for having too much or too little money"

- -3 = Strongly disagree - I don't believe this at all
- -2 = Disagree
- -1 = Slightly disagree
- 1 = Slightly agree
- 2 = Agree
- 3 = Strongly agree - This is definitely true

**Behavior Scale (-3 to +3):**
> "I make financial decisions to avoid others' judgment of my financial status"

**Feeling Scale (-3 to +3):**
> "I feel anxious or ashamed about what others think of my financial situation"

**Consequence Scale (-3 to +3):**
> "This concern about judgment has caused me to make poor financial decisions"

**Open Responses:**
1. "Describe a time when concern about judgment of your financial status influenced a decision"
2. "What do you fear others will think about how much money you have?"

---

#### **Subdomain 1.2: Judgment of Financial Skill**
*"Judgment about your competence with money"*

**Belief Scale (-3 to +3):**
> "I believe others judge my skill and competence with money"

**Behavior Scale (-3 to +3):**
> "I hide my financial mistakes or lack of knowledge to avoid looking incompetent"

**Feeling Scale (-3 to +3):**
> "I feel judged or inadequate regarding my financial skills"

**Consequence Scale (-3 to +3):**
> "This has prevented me from learning or asking for help with finances"

**Open Responses:**
1. "How would you rate your financial skill, and how do you think others see it?"
2. "Describe a situation where concern about being judged for your skill impacted you"

---

#### **Subdomain 1.3: Judgment of Financial Decisions**
*"Judgment about your spending and financial choices"*

**Belief Scale (-3 to +3):**
> "I believe others judge how I spend my money"

**Behavior Scale (-3 to +3):**
> "I make spending decisions based on what others will think"

**Feeling Scale (-3 to +3):**
> "I feel judged when others see how I spend money"

**Consequence Scale (-3 to +3):**
> "This has led me to spend in ways that aren't aligned with my values"

**Open Responses:**
1. "Describe your relationship with spending and others' opinions about it"
2. "What spending decisions have you made (or avoided) because of others' judgment?"

---

### **Domain 2: False Self-View**
*"How authentic are you about your financial reality?"*

---

#### **Subdomain 2.1: Misrepresenting Financial Status**
*"Actively presenting a different financial reality"*

**Belief Scale (-3 to +3):**
> "I believe I need to present my financial situation differently than it really is"

**Behavior Scale (-3 to +3):**
> "I actively misrepresent my financial situation to others (letting them think I'm better or worse off)"

**Feeling Scale (-3 to +3):**
> "I feel the need to maintain a financial facade with others"

**Consequence Scale (-3 to +3):**
> "This misrepresentation has created problems or stress in my financial life"

**Open Responses:**
1. "How do you present your financial situation to others vs. what's actually true?"
2. "What would happen if people knew your real financial situation?"

---

#### **Subdomain 2.2: Hiding Financial Reality**
*"Concealing the truth about finances"*

**Belief Scale (-3 to +3):**
> "I believe I must keep my true financial situation hidden"

**Behavior Scale (-3 to +3):**
> "I actively hide financial information, statements, or decisions from others"

**Feeling Scale (-3 to +3):**
> "I feel anxious about my financial reality being discovered"

**Consequence Scale (-3 to +3):**
> "This secrecy has isolated me or prevented me from getting help"

**Open Responses:**
1. "What financial information do you keep hidden, and from whom?"
2. "Describe a time when hiding your financial reality caused a problem"

---

#### **Subdomain 2.3: Discrepancy Between Self-View and Reality**
*"Gap between who you are financially and who you present yourself to be"*

**Belief Scale (-3 to +3):**
> "I believe there's a significant gap between who I am financially and who I present myself to be"

**Behavior Scale (-3 to +3):**
> "I act in ways that maintain an image that doesn't match my financial reality"

**Feeling Scale (-3 to +3):**
> "I feel like a fraud or imposter in my financial life"

**Consequence Scale (-3 to +3):**
> "This discrepancy has created stress, debt, or poor financial decisions"

**Open Responses:**
1. "Describe the gap between how you present yourself financially and who you really are"
2. "What behaviors do you engage in to maintain this gap?"

---

## 📈 Student Experience

### **Page 1: Introduction**
"This assessment explores two core areas of your financial identity:
1. External Validation - How much others' opinions influence your financial decisions
2. False Self-View - How authentic you are about your financial reality"

### **Page 2: Domain 1 - Subdomain 1.1**
"Let's start with External Validation.

First, we'll explore how judgment about your financial status impacts you."

[4 scale questions + 2 open responses]

### **Page 3: Domain 1 - Subdomain 1.2**
"Next, let's look at judgment about your financial skill..."

[4 scale questions + 2 open responses]

### **Page 4: Domain 1 - Subdomain 1.3**
"Finally for External Validation, let's explore judgment about your financial decisions..."

[4 scale questions + 2 open responses]

### **Pages 5-7: Domain 2 - Subdomains 2.1 through 2.3**
[Same pattern for False Self-View]

### **Page 8: Processing**
"Thank you for your responses. We're now analyzing your patterns..."

---

## 🤖 GPT Processing Flow

### **Step 1: Subdomain Analysis (6 analyses)**
For each subdomain:
- Input: 4 scale scores + 2 open responses + subdomain quotient
- Output: Analysis, suggestions, reflection prompt
- Progressive chaining: Each subdomain builds on previous

**Example for Subdomain 1.1:**
```
Previous context: None (this is first)

Current subdomain: Judgment of Financial Status
- Belief: 0/100
- Behavior: 16.67/100
- Feeling: 33.33/100
- Consequence: 66.67/100
- Quotient: 29.17/100
- Open response 1: "I avoid telling friends I can't afford things..."
- Open response 2: "I fear they'll think I'm irresponsible..."

Analysis: "You show an emerging pattern around judgment of financial
status (29/100). While you don't strongly believe others judge you,
the consequences have been significant. This suggests internalized
judgment that's creating real impacts..."

Suggestions:
• Practice being honest about financial boundaries with one trusted person
• Notice when you make decisions to avoid judgment vs. for your values
• Reflect on where this fear of judgment originated
```

### **Step 2: Domain Synthesis (2 syntheses)**
For each domain:
- Input: All 3 subdomain analyses + domain quotient + gap analysis
- Output: Domain-level insights

**Example for Domain 1:**
```
Subdomain analyses: [1.1, 1.2, 1.3]
Domain quotient: 42.22/100
Highest subdomain: 1.3 (52/100) - Judgment of Decisions
Gap: 9.78 (FOCUSED)

Domain synthesis: "Your External Validation pattern shows ACTIVE impact
(42/100). Within this domain, Judgment of Financial Decisions is your
primary driver (FOCUSED pattern, 10-point gap). This suggests how you
spend money weighs heavily on you, more than your overall status or
skill..."
```

### **Step 3: Overall Synthesis (1 final synthesis)**
- Input: Both domain syntheses + overall quotient + domain gap
- Output: Complete picture connecting both domains

**Example:**
```
Domain 1 (External Validation): 42.22/100
Domain 2 (False Self-View): 68.50/100
Overall: 55.36/100
Gap: 13.14 (FOCUSED)

Overall synthesis: "Your Identity & Validation pattern shows ACTIVE
impact overall (55/100). False Self-View is elevated above
External Validation (FOCUSED pattern, 13-point gap).

Here's what's happening: You're presenting a version of yourself
financially that doesn't match reality (Domain 2: 68/100). This is
partly driven by concern about others' judgment (Domain 1: 42/100),
but the false self has taken on a life of its own.

The good news: External Validation isn't as dominant as your False
Self-View. This means if you work on being more authentic (Domain 2),
the concern about judgment (Domain 1) will likely soften naturally..."
```

---

## 📊 Report Structure

### **Section 1: Overview**
```
Your Identity & Validation Pattern

Overall Impact: 55/100 (ACTIVE)
Your pattern is actively influencing your financial decisions and behavior.

Pattern Type: FOCUSED
False Self-View is your primary driver (13-point gap above External Validation).
```

### **Section 2: Domain Scores**
```
Domain 1: External Validation - 42/100
Domain 2: False Self-View - 69/100 ← Primary Focus
```

### **Section 3: Subdomain Breakdown**
```
Domain 1: External Validation (42/100)
├── Judgment of Financial Status: 29/100
├── Judgment of Financial Skill: 46/100
└── Judgment of Financial Decisions: 52/100 ← Highest in this domain

Domain 2: False Self-View (69/100)
├── Misrepresenting Financial Status: 72/100 ← Highest overall
├── Hiding Financial Reality: 65/100
└── Discrepancy Between Self-View and Reality: 70/100
```

### **Section 4: Where to Focus**
```
1. Start with Domain 2 (False Self-View) - Your primary driver
   - Specifically: Misrepresenting Financial Status (72/100)

2. Within Domain 2, work on all three subdomains (they're closely matched)

3. As you heal Domain 2, Domain 1 (External Validation) will likely soften

4. Within Domain 1, pay special attention to Judgment of Decisions (52/100)
```

### **Sections 5-10: Detailed Subdomain Insights**
[One section per subdomain with GPT analysis, suggestions, reflection prompts]

### **Section 11-12: Domain Syntheses**
[Domain 1 synthesis, Domain 2 synthesis]

### **Section 13: Overall Synthesis**
[Final integration of both domains]

---

## 🔧 Technical Implementation

### **Configuration Object**
```javascript
const Tool3Config = {
  domains: {
    externalValidation: {
      name: "External Validation",
      description: "How much others' opinions influence your financial decisions",
      subdomains: {
        status: {
          name: "Judgment of Financial Status",
          description: "Judgment about how much money you have",
          belief: {
            question: "I believe others judge me for having too much or too little money",
            choices: [
              { value: -3, label: "Strongly disagree - I don't believe this at all" },
              { value: -2, label: "Disagree" },
              { value: -1, label: "Slightly disagree" },
              { value: 1, label: "Slightly agree" },
              { value: 2, label: "Agree" },
              { value: 3, label: "Strongly agree - This is definitely true" }
            ]
          },
          behavior: { /* ... */ },
          feeling: { /* ... */ },
          consequence: { /* ... */ },
          openResponses: [
            "Describe a time when concern about judgment of your financial status influenced a decision",
            "What do you fear others will think about how much money you have?"
          ]
        },
        skill: { /* Subdomain 1.2 */ },
        decisions: { /* Subdomain 1.3 */ }
      }
    },
    falseSelfView: {
      name: "False Self-View",
      description: "How authentic you are about your financial reality",
      subdomains: {
        misrepresenting: { /* Subdomain 2.1 */ },
        hiding: { /* Subdomain 2.2 */ },
        discrepancy: { /* Subdomain 2.3 */ }
      }
    }
  }
};
```

### **Rendering Pattern**
```javascript
// Page 2: Domain 1, Subdomain 1
renderPageContent(page, data, clientId) {
  if (page === 1) {
    return this.renderIntroduction();
  }

  // Calculate domain and subdomain from page number
  const { domainKey, subdomainKey } = this.getConfigForPage(page);
  const subdomainConfig = this.domainConfig[domainKey].subdomains[subdomainKey];

  return GroundingFormBuilder.renderSubdomain(
    subdomainConfig,
    data,
    `${domainKey}_${subdomainKey}`
  );
}
```

### **Scoring Pattern**
```javascript
processFinalSubmission(clientId) {
  const allData = this.getExistingData(clientId);

  // Calculate subdomain quotients
  const subdomainQuotients = {};
  for (const [domainKey, domain] of Object.entries(this.domainConfig)) {
    subdomainQuotients[domainKey] = {};
    for (const subdomainKey of Object.keys(domain.subdomains)) {
      const fieldPrefix = `${domainKey}_${subdomainKey}`;
      subdomainQuotients[domainKey][subdomainKey] =
        GroundingScoring.calculateSubdomainQuotient(allData, fieldPrefix);
    }
  }

  // Calculate domain quotients (average of 3 subdomains)
  const domainQuotients = {};
  for (const [domainKey, subdomains] of Object.entries(subdomainQuotients)) {
    const values = Object.values(subdomains);
    domainQuotients[domainKey] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  // Calculate overall quotient (average of 2 domains)
  const overall = GroundingScoring.calculateOverallQuotient(domainQuotients);

  // Gap analysis at domain level
  const highest = GroundingScoring.identifyHighestImpactDomain(domainQuotients);
  const domainGap = GroundingScoring.calculateGap(highest.score, overall);
  const domainPatternType = GroundingScoring.classifyPatternType(domainGap);

  // Gap analysis within each domain (subdomain level)
  const subdomainGaps = {};
  for (const [domainKey, subdomains] of Object.entries(subdomainQuotients)) {
    const domainAvg = domainQuotients[domainKey];
    const highestSubdomain = GroundingScoring.identifyHighestImpactDomain(subdomains);
    const gap = GroundingScoring.calculateGap(highestSubdomain.score, domainAvg);
    subdomainGaps[domainKey] = {
      highest: highestSubdomain,
      gap: gap,
      patternType: GroundingScoring.classifyPatternType(gap)
    };
  }

  // ... continue with GPT analysis and report generation
}
```

---

## ✅ Benefits of This Structure

### **1. Better Psychological Validity**
- Captures the hierarchical nature of psychological constructs
- Domains represent core concepts, subdomains represent manifestations
- More clinically accurate assessment

### **2. More Granular Insights**
- Students see which specific manifestation is most problematic
- "Within External Validation, it's specifically judgment about your decisions (not status or skill) that's driving this"

### **3. Preserves v2 Content**
- Tool 3.2 had 7 judgment types → Now 3 External Validation subdomains (core concepts captured)
- Tool 3.1 had clarity/consistency concepts → Now 3 False Self-View subdomains
- Minimal content loss, focused on most important patterns

### **4. Maintains Framework Consistency**
- Still uses 4-aspect pattern (Belief/Behavior/Feeling/Consequence)
- Still uses same shared utilities (GroundingFormBuilder, GroundingScoring, etc.)
- Still uses progressive GPT chaining
- Still uses multi-level gap analysis

### **5. Manageable Length**
- 36 total questions = Same as v2 combined (proven length)
- 15-20 minute completion time
- Not overwhelming for students

### **6. Flexible Structure**
- Can adjust number of subdomains per tool (2-4) if needed
- Can add/remove subdomains without changing framework
- Future tools can use same structure

---

## 🎯 Summary

**Structure:**
- 2 core domains per tool
- 3 subdomains per domain
- 4 aspects per subdomain (Belief/Behavior/Feeling/Consequence)
- 2 open responses per subdomain

**Question Count:**
- 6 subdomains × 4 scale questions = **24 scale questions**
- 6 subdomains × 2 open responses = **12 text questions**
- **Total: 36 questions per tool**

**Scoring Hierarchy:**
- Subdomain quotients (average of 4 aspects)
- Domain quotients (average of 3 subdomains)
- Overall quotient (average of 2 domains)
- Gap analysis at both subdomain and domain levels

**GPT Processing:**
- 6 subdomain analyses (progressive chaining)
- 2 domain syntheses
- 1 overall synthesis
- **Total: 9 GPT calls per student**

**Tool Consistency:**
All three tools follow identical structure:
- Tool 3: 2 domains × 3 subdomains = 6 subdomains = 36 questions
- Tool 5: 2 domains × 3 subdomains = 6 subdomains = 36 questions
- Tool 7: 2 domains × 3 subdomains = 6 subdomains = 36 questions

**Time Estimate:** 15-20 minutes per tool (same as v2)

---

## 📋 Tool 3 Subdomain Summary

**Domain 1: External Validation** (How others' opinions impact you)
1. Judgment of Financial Status (how much money you have)
2. Judgment of Financial Skill (your competence with money)
3. Judgment of Financial Decisions (your spending choices)

**Domain 2: False Self-View** (How authentic you are)
1. Misrepresenting Financial Status (presenting a different reality)
2. Hiding Financial Reality (concealing the truth)
3. Discrepancy Between Self-View and Reality (the gap you maintain)

---

**Next Steps:**
1. Review and refine subdomain definitions for Tool 3
2. Map Tool 5 (Issues Showing Love / Issues Receiving Love) to this structure
3. Map Tool 7 (Fear / Control) to this structure
4. Update Grounding Tools Foundation document with hierarchical structure
5. Implement shared utilities to support subdomain hierarchy
