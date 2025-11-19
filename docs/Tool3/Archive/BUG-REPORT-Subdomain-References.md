# Bug Report: Subdomain References Using Technical Keys Instead of User-Friendly Labels

**Date:** November 18, 2025
**Severity:** High - UX Issue
**Status:** ✅ RESOLVED - Fixed in commit 931126e
**Resolution Date:** November 18, 2025
**Affects:** Tool 3 & Tool 5
**Fixed In:** core/grounding/GroundingGPT.js

---

## 🐛 Issue Description

GPT syntheses are referencing subdomains using technical keys (e.g., `subdomain_2_2`) instead of user-friendly labels (e.g., "What Will They Think?"). This makes the reports confusing and unhelpful for students.

---

## 📋 Example from Production

**Client:** 6123LY
**Tool:** Tool 3
**Location:** Domain 2 synthesis - Priority Focus

**What's Shown:**
> "The critical pattern in subdomain_2_2 should be the starting point, addressing the tendency to overly rely on others' opinions in financial decisions."

**What Should Be Shown:**
> "The critical pattern in 'What Will They Think?' should be the starting point, addressing the tendency to overly rely on others' opinions in financial decisions."

---

## 📊 Full Example from Client 6123LY

### Domain 2 Synthesis (External Validation)

**Summary:**
> "The External Validation domain reveals a mild pattern of financial decisions influenced by others' opinions, with a critical issue in one subdomain. While two subdomains show healthy patterns, the critical subdomain indicates a significant tendency to prioritize external opinions over personal financial needs."

**Key Themes:**
- Theme 1: Over-reliance on external opinions in financial decision-making, particularly evident in **subdomain_2_2**. ❌
- Theme 2: A general ability to maintain personal financial priorities in most areas, as seen in **subdomains_2_1 and 2_3**. ❌
- Theme 3: Resilience in some financial aspects, indicating potential for improvement and self-reliance.

**Priority Focus:**
> "The critical pattern in **subdomain_2_2** should be the starting point, addressing the tendency to overly rely on others' opinions in financial decisions." ❌

---

## 🎯 Root Cause

GPT prompts are providing subdomain data with technical keys (`subdomain_2_2`) but not providing the user-friendly labels that correspond to those keys.

**Example:** GPT sees:
```
subdomain_2_2: {
  pattern: "...",
  insight: "...",
  action: "...",
  rootBelief: "..."
}
```

But it doesn't know that `subdomain_2_2` corresponds to:
- **Label:** "What Will They Think?"
- **Description:** "Fear of judgment - hiding choices and seeking approval"

---

## 📍 Affected Locations

### 1. Domain Synthesis Prompts
**File:** `core/grounding/GroundingGPT.js`
**Function:** `buildDomainSynthesisPrompt()` (lines 358-396)
**Function:** `buildDomainUserPrompt()` (lines 401-410)

Currently sends:
```
subdomain_1_1:
- Pattern: ...
- Insight: ...
- Root Belief: ...
```

Should send:
```
"I'm Not Worthy of Financial Freedom" (subdomain_1_1):
- Pattern: ...
- Insight: ...
- Root Belief: ...
```

### 2. Overall Synthesis Prompts
**File:** `core/grounding/GroundingGPT.js`
**Function:** `buildOverallSynthesisPrompt()` (lines 415-452)
**Function:** `buildOverallUserPrompt()` (lines 457-466)

Same issue - references domains without names.

### 3. Fallback Text
**File:** `core/grounding/GroundingFallbacks.js`
**Function:** `getDomainFallback()` (lines 275-353)
**Function:** `getOverallFallback()` (lines 358-467)

Fallback text also uses technical keys like `subdomain_1_1` instead of labels.

---

## 🔍 How GPT Receives Data

### Current: Domain Synthesis
```javascript
buildDomainUserPrompt(subdomainInsights) {
  return Object.entries(subdomainInsights)
    .map(([key, insight]) => `
${key}:  // ❌ Technical key like "subdomain_1_1"
- Pattern: ${insight.pattern}
- Insight: ${insight.insight}
- Root Belief: ${insight.rootBelief || 'N/A'}
    `)
    .join('\n');
}
```

**GPT sees:**
```
subdomain_2_1:
- Pattern: ...
subdomain_2_2:
- Pattern: ...
subdomain_2_3:
- Pattern: ...
```

### What GPT Should See:
```
"Money Shows My Worth":
- Pattern: ...

"What Will They Think?":
- Pattern: ...

"I Need to Prove Myself":
- Pattern: ...
```

---

## 🎯 Solution Requirements

1. **Domain Synthesis Prompts:** Include subdomain labels in the prompt
2. **Overall Synthesis Prompts:** Include domain and subdomain labels
3. **Fallback Text:** Replace all technical keys with user-friendly labels
4. **System Prompt Guidance:** Instruct GPT to use labels, not keys, when referencing subdomains

---

## 📝 Expected Format Changes

### Domain Synthesis User Prompt (Before)
```
subdomain_1_1:
- Pattern: You consistently describe yourself...
- Insight: This pattern of self-judgment...
- Root Belief: I am fundamentally flawed...
```

### Domain Synthesis User Prompt (After)
```
"I'm Not Worthy of Financial Freedom":
- Pattern: You consistently describe yourself...
- Insight: This pattern of self-judgment...
- Root Belief: I am fundamentally flawed...
```

### System Prompt Addition
```
IMPORTANT: When referencing subdomains in your synthesis, use their
descriptive names (e.g., "I'm Not Worthy of Financial Freedom")
rather than technical identifiers (e.g., subdomain_1_1).
```

---

## 🧪 Testing Checklist

After fix, verify:
- [ ] Domain 1 synthesis references subdomain labels, not keys
- [ ] Domain 2 synthesis references subdomain labels, not keys
- [ ] Overall synthesis references domain names and subdomain labels
- [ ] Key Themes use labels
- [ ] Priority Focus uses labels
- [ ] Fallback text uses labels
- [ ] Test with both Tool 3 and Tool 5

---

## 📊 Impact

**Severity:** High
**User Impact:** Critical - Makes reports confusing and unhelpful
**Frequency:** Every synthesis that references specific subdomains
**Workaround:** None - requires code fix

---

## 🔗 Related Files

- **GPT Prompts:** `/Users/Larry/code/ftp-v3/core/grounding/GroundingGPT.js`
- **Fallbacks:** `/Users/Larry/code/ftp-v3/core/grounding/GroundingFallbacks.js`
- **Tool 3 Config:** `/Users/Larry/code/ftp-v3/tools/tool3/Tool3.js` (subdomain labels)
- **Tool 5 Config:** `/Users/Larry/code/ftp-v3/tools/tool5/Tool5.js` (subdomain labels)

---

## 🎯 Subdomain Label Reference

### Tool 3 (Identity & Validation)
**Domain 1: False Self-View**
- `subdomain_1_1` → "I'm Not Worthy of Financial Freedom"
- `subdomain_1_2` → "I'll Never Have Enough"
- `subdomain_1_3` → "I Can't See My Financial Reality"

**Domain 2: External Validation**
- `subdomain_2_1` → "Money Shows My Worth"
- `subdomain_2_2` → "What Will They Think?"
- `subdomain_2_3` → "I Need to Prove Myself"

### Tool 5 (Love & Connection)
**Domain 1: Issues Showing Love**
- `subdomain_1_1` → "I Have to Give Money to Show I Care"
- `subdomain_1_2` → "I Can't Say No Without Guilt"
- `subdomain_1_3` → "If They Pay Me Back, They Don't Care"

**Domain 2: Issues Receiving Love**
- `subdomain_2_1` → "I Can't Be Financially Independent"
- `subdomain_2_2` → "Financial Help Means I Owe Them"
- `subdomain_2_3` → "Money Equals Emotional Love"

---

## 📅 Resolution Steps

1. ✅ Document bug (this file)
2. ✅ Fix domain synthesis prompts to include labels (buildDomainSynthesisPrompt)
3. ✅ Fix domain user prompts to include labels (buildDomainUserPrompt)
4. ✅ Add system prompt guidance ("use descriptive names rather than technical identifiers")
5. ✅ Update synthesizeDomain to pass subdomainConfigs
6. ✅ Verified Tool3.js and Tool5.js already pass configs correctly
7. ⏳ Test with Tool 3 in production
8. ⏳ Test with Tool 5 in production
9. ⏳ Verify with real assessment

**Note:** Fallback text uses generic references ("the subdomain with highest score") rather than specific keys, so no changes needed there.

---

**Created:** November 18, 2025, 2:35 AM
**Discovered By:** Larry (Client 6123LY report review)
**Priority:** High - Fix before next user session
