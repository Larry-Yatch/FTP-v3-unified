# Tool 7 Restructure Implementation Plan

**Created:** 2026-02-04
**Purpose:** Complete implementation guide for restructuring Tool 7 to properly align with clinical documentation
**Status:** Ready for implementation

---

## Executive Summary

Tool 7 (Security & Control) currently measures the wrong behaviors. The clinical documents define Control as **self-imposed suffering through undercharging, not collecting, and giving away** - but the current questions measure trust/help issues that overlap with Tool 5.

This document provides the complete specification for restructuring Tool 7 to properly capture the Control and Fear patterns.

---

## Reference Documents

- `/docs/Foundational Docs/Financial_Trauma_Patterns_Clinical_Design_Document_1.md`
- `/docs/Foundational Docs/Financial_Trauma_Assessment_Content_Development_Guide.md`
- Current implementation: `/tools/tool7/Tool7.js`

---

## Current Problems (What We're Fixing)

### Problem 1: Control Domain Measures Wrong Behaviors

**Current Control subdomains measure:**
- 1_1: "I Must Control Everything" - rejecting systems/help
- 1_2: "I Can't Trust Others" - refusing to rely on anyone
- 1_3: "Asking for Help Is Weakness" - struggling in silence

**Clinical document says Control should measure:**
- Not charging what you're worth
- Uncollected accounts receivable
- Giving things away for free
- Having money but refusing to use it
- Refusing to invest
- Won't delegate (control of outcomes, not receiving help)

### Problem 2: Overlap with Tool 5

Current Tool 7 subdomains 1_2 and 1_3 overlap significantly with Tool 5's "I Can't Accept Help" subdomain. All three measure "refusing help/shame about need."

### Problem 3: Fear Domain Missing Key Markers

Current Fear subdomains are close but:
- "Better the Devil I Know" (2_2) doesn't match Fear pattern - it's about fear of change, not ensuring things go wrong
- Missing: No contracts/legal protection, not claiming benefits

---

## New Structure

### Domain 1: Control Leading to Isolation

| Subdomain | Key | Label | Focus |
|-----------|-----|-------|-------|
| 1_1 | `subdomain_1_1` | "I Undercharge and Give Away" | Not charging worth, not collecting, free work |
| 1_2 | `subdomain_1_2` | "I Have Money But Won't Use It" | Hoarding while living in lack, refusing to invest |
| 1_3 | `subdomain_1_3` | "Only I Can Do It Right" | Won't delegate, obsessive control of tasks |

### Domain 2: Fear Leading to Isolation

| Subdomain | Key | Label | Focus |
|-----------|-----|-------|-------|
| 2_1 | `subdomain_2_1` | "I Don't Protect Myself" | No contracts, not claiming benefits, entering deals unprotected |
| 2_2 | `subdomain_2_2` | "I Sabotage Success" | Problems at threshold, quitting before breakthrough |
| 2_3 | `subdomain_2_3` | "I Trust the Wrong People" | Ignoring red flags, predictable betrayals |

---

## Detailed Subdomain Specifications

### Subdomain 1_1: "I Undercharge and Give Away"

**Clinical Markers Being Measured:**
- Not charging what you're worth (keeping fees artificially low)
- Accounts receivable piling up (not collecting owed money)
- Giving services or products away for free
- Lost income from free work that should have been paid

**Belief/View Question:**
- Core belief: "If I charge what I'm worth or pursue money owed to me, something bad will happen / I'll lose control"
- Sample: "Charging full price or collecting money owed to me feels dangerous or wrong"

**Behavior Question:**
- Focus: Undercharging, not collecting, giving away
- Sample: "I charge less than my work is worth, have uncollected money owed to me, or give away work for free"

**Feeling Question:**
- Focus: Anxiety about charging/collecting, guilt about asking for fair pay
- Sample: "I feel anxious or guilty about charging what I'm worth or asking people to pay what they owe me"

**Consequence Question:**
- Focus: Underearning despite capability, uncollected receivables
- Sample: "I've earned significantly less than I could have because I undercharge, don't collect what's owed, or give work away"

**Open Response Question:**
- "What money is currently owed to you that you haven't collected, and what stops you from pursuing it? Or describe a time you significantly undercharged or gave away work for free - what were you afraid would happen if you charged full price?"

---

### Subdomain 1_2: "I Have Money But Won't Use It"

**Clinical Markers Being Measured:**
- Having money but refusing to use it (hoarding while living in lack)
- Refusing to invest (can't tolerate market volatility)
- Living far below means despite having resources
- Obsessively tracking every penny while going without necessities

**Belief/View Question:**
- Core belief: "If I spend or invest my money, it will disappear and I'll have no safety"
- Sample: "Spending or investing my savings feels too risky, even when I have enough and could benefit"

**Behavior Question:**
- Focus: Hoarding, refusing to invest, living in artificial scarcity
- Sample: "I have money saved but won't spend it on things I need, or I refuse to invest because I can't control what happens to it"

**Feeling Question:**
- Focus: Anxiety about spending, fear of loss even when secure
- Sample: "I feel anxious spending money even when I have enough, as if any spending threatens my security"

**Consequence Question:**
- Focus: Living in lack despite resources, missed investment growth
- Sample: "I've lived without things I needed or missed investment growth because I couldn't let go of controlling my money"

**Open Response Question:**
- "Describe something you need or want but won't spend money on despite having savings. What do you fear would happen if you spent it? Or describe your relationship with investing - what makes it feel unsafe?"

---

### Subdomain 1_3: "Only I Can Do It Right"

**Clinical Markers Being Measured:**
- Won't hire, delegate, or scale (professional stagnation)
- Creating overly complex systems that actually create chaos
- Exhaustion from carrying everything alone
- Distrust of others' competence (not receiving help - delegating tasks)

**IMPORTANT DISTINCTION:** This is about refusing to DELEGATE TASKS/CONTROL, not refusing to RECEIVE HELP (which is Tool 5). The motivation is control of outcomes, not shame about receiving.

**Belief/View Question:**
- Core belief: "No one else can do this correctly; I must control every detail myself"
- Sample: "If I don't personally handle every financial detail or task, it won't be done right"

**Behavior Question:**
- Focus: Won't delegate, won't hire, micromanages
- Sample: "I refuse to delegate financial tasks or hire help because I don't trust anyone else to do them correctly"

**Feeling Question:**
- Focus: Exhaustion from carrying alone, frustration at inability to let go
- Sample: "I feel exhausted from handling everything myself but unable to let go of control"

**Consequence Question:**
- Focus: Stagnation, burnout, systems that create chaos
- Sample: "My need to control every detail has kept me stuck, burned out, or created more chaos than it prevented"

**Open Response Question:**
- "What financial tasks or responsibilities do you refuse to delegate, and what specifically do you fear would go wrong if someone else handled them? How has this need to control everything affected your growth or wellbeing?"

---

### Subdomain 2_1: "I Don't Protect Myself"

**Clinical Markers Being Measured:**
- No contracts or legal protection
- Not protecting yourself despite knowing better
- Not claiming benefits, programs, or opportunities you qualify for
- Entering business deals without proper documentation

**Belief/View Question:**
- Core belief: "Protection is futile / I don't deserve protection / seeking protection will attract danger"
- Sample: "Getting contracts or legal protection feels pointless, too much trouble, or like it would jinx things"

**Behavior Question:**
- Focus: No contracts, not claiming benefits, entering deals unprotected
- Sample: "I enter financial agreements without contracts, don't claim benefits I qualify for, or skip basic protective measures"

**Feeling Question:**
- Focus: Resignation about protection, fatalism
- Sample: "I feel resigned about protecting myself financially, as if bad things will happen regardless of what I do"

**Consequence Question:**
- Focus: Losses from lack of protection, missed benefits
- Sample: "I've lost money or opportunities because I didn't have contracts, didn't protect myself, or didn't claim what I was entitled to"

**Open Response Question:**
- "Describe a financial situation where you knew you should have gotten something in writing or protected yourself but didn't. What happened? Or what benefits, programs, or opportunities might you qualify for that you haven't claimed - what stops you?"

---

### Subdomain 2_2: "I Sabotage Success"

**Clinical Markers Being Measured:**
- Creating financial problems just as things start going well
- Stopping projects just before completion/breakthrough
- Refusing opportunities out of fear they'll expose you
- Self-sabotage at the threshold of success

**Belief/View Question:**
- Core belief: "Success is dangerous / I don't deserve it / something bad will happen if I succeed"
- Sample: "When things start going well financially, I feel like something bad is about to happen or I don't deserve it"

**Behavior Question:**
- Focus: Sabotage at threshold, quitting before breakthrough, refusing opportunities
- Sample: "I create problems when things are going well, quit projects before they succeed, or turn down opportunities that could help me"

**Feeling Question:**
- Focus: Dread of success, unworthiness, anxiety when thriving
- Sample: "I feel anxious, unworthy, or filled with dread when I'm on the verge of financial success"

**Consequence Question:**
- Focus: Pattern of near-misses, abandoned projects, refused opportunities
- Sample: "I have a pattern of almost succeeding financially but sabotaging it, quitting too soon, or refusing chances that could have changed things"

**Open Response Question:**
- "Describe a time you were close to a financial breakthrough or success but something went wrong - looking back, did you play any role in derailing it? Or describe an opportunity you turned down that could have helped you - what were you really afraid of?"

---

### Subdomain 2_3: "I Trust the Wrong People"

**Clinical Markers Being Measured:**
- Trusting people you knew better than to trust (ignoring obvious red flags)
- Pattern of financial betrayal from predictable sources
- Working with people despite clear warnings
- Repeated "burns" from people you had bad feelings about

**Belief/View Question:**
- Core belief: "I'm destined for betrayal / I can't trust my judgment / this is just how it goes for me"
- Sample: "I'm destined to be betrayed financially; I always end up trusting people who hurt me"

**Behavior Question:**
- Focus: Ignoring red flags, trusting despite warnings
- Sample: "I ignore red flags and trust people with money even when I have a bad feeling about them"

**Feeling Question:**
- Focus: Resignation to betrayal, ignoring instincts
- Sample: "I feel resigned to being betrayed - it always happens, so why try to prevent it"

**Consequence Question:**
- Focus: Pattern of betrayals from people they knew not to trust
- Sample: "I've been financially burned multiple times by people I knew had red flags but trusted anyway"

**Open Response Question:**
- "Describe a specific time you trusted someone with money despite warning signs you noticed. What were the red flags you ignored, and what happened? What made you override your instincts?"

---

## Implementation Steps

### Step 1: Update Tool7.js Config

Replace the entire `subdomains` array in Tool7.js with the new structure. Key changes:
- New subdomain keys remain the same (`subdomain_1_1`, etc.)
- New labels, descriptions, and beliefBehaviorConnection for each
- Completely new questions for all 6 subdomains

### Step 2: Update Intro Content

Update `getIntroContent()` to reflect new domain descriptions:
- Domain 1: "How self-imposed suffering through undercharging, not collecting, and refusing to use resources creates artificial scarcity"
- Domain 2: "How ensuring things go wrong through lack of protection, self-sabotage, and trusting wrong people creates the disasters you fear"

### Step 3: Update Config Descriptions

Update these config values:
- `domain1Description`: 'Self-imposed suffering through going without, undercharging, and refusing to let go of control'
- `domain2Description`: 'Creating disasters through lack of protection, self-sabotage at success, and trusting wrong people'

### Step 4: Test

- Verify all 6 subdomains render correctly
- Verify scoring still works (uses same structure)
- Verify GPT analysis receives correct subdomain labels
- Test full flow through to report generation

---

## Questions Structure Reference

Each subdomain has 5 questions following this pattern:

```javascript
{
  key: 'subdomain_X_X',
  label: "Subdomain Label",
  description: 'Description for UI',
  beliefBehaviorConnection: 'How the belief leads to the behavior',

  questions: [
    { aspect: 'Belief', text: '...', scale: [...] },
    { aspect: 'Behavior', text: '...', scale: [...] },
    { aspect: 'Feeling', text: '...', scale: [...] },
    { aspect: 'Consequence', text: '...', scale: [...] },
    { text: 'Open response question...' }  // No aspect = open response
  ]
}
```

Scale format (same as current):
```javascript
scale: [
  { value: -3, label: 'Strongly agree - ...' },
  { value: -2, label: 'Agree - ...' },
  { value: -1, label: 'Slightly agree - ...' },
  { value: 1, label: 'Slightly disagree - ...' },
  { value: 2, label: 'Disagree - ...' },
  { value: 3, label: 'Strongly disagree - ...' }
]
```

---

## Key Distinctions to Maintain

### Control (1_3) vs Tool 5 "Can't Accept Help"

| Tool 5: Receiving Help | Tool 7: Delegating Tasks |
|------------------------|--------------------------|
| Refusing help OFFERED TO YOU | Refusing to DELEGATE YOUR TASKS |
| Shame about receiving | Need to control outcomes |
| "I can't let them give to me" | "I can't let them do this for me" |

### Control vs False Self-View (Tool 3)

| Tool 3: Confusion | Tool 7: Control |
|-------------------|-----------------|
| Money is SCATTERED and FORGOTTEN | Money is HOARDED and TRACKED |
| Doesn't know where money is | Knows exactly but won't use it |
| Problem is VISIBILITY | Problem is LETTING GO |

---

## Validation Checklist

Before considering implementation complete:

- [ ] All 6 subdomains have unique questions not found in Tool 3 or Tool 5
- [ ] Control domain measures: undercharging, not collecting, giving away, hoarding, not investing, won't delegate
- [ ] Fear domain measures: no protection/contracts, self-sabotage at success, trusting wrong people
- [ ] No questions about "accepting help offered" (that's Tool 5)
- [ ] No questions about "scattered/forgotten money" (that's Tool 3)
- [ ] Intro content updated to reflect new focus
- [ ] Domain descriptions updated
- [ ] Full assessment flow tested

---

## Notes

- The scoring system doesn't need changes - it uses the same subdomain structure
- GPT analysis will automatically use new subdomain labels/descriptions
- Report generation uses config values, so updating config updates reports
- Consider testing with a user who has Control/Fear patterns to validate question clarity
