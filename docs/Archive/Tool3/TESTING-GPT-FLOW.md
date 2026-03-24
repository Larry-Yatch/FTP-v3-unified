# Testing Tool 3/5 GPT Flow

**Created:** November 18, 2025
**Purpose:** Validate that GPT calls are working correctly through the entire assessment flow

---

## 🎯 Overview

Tool 3/5 make **9 GPT calls per assessment**:
- **6 subdomain analyses** (background, during form) → cached in PropertiesService
- **3 syntheses** (blocking, at final submission) → saved to RESPONSES sheet
  - Domain 1 synthesis
  - Domain 2 synthesis
  - Overall synthesis

This testing suite validates every step.

---

## 📋 Quick Start

### 1. Copy Test File to Apps Script

1. Open your Google Apps Script editor (Extensions → Apps Script)
2. Create new file: `test-tool3-gpt-flow.js`
3. Copy contents from `/Users/Larry/code/ftp-v3/tests/test-tool3-gpt-flow.js`
4. Save

### 2. Run Complete Flow Test

```javascript
// In Apps Script, run:
testCompleteFlow()
```

This will:
- ✅ Test all 6 subdomain GPT analyses
- ✅ Verify caching works
- ✅ Test final submission with 3 syntheses
- ✅ Verify data is saved to RESPONSES sheet
- ✅ Show detailed logs of every step

### 3. Check Execution Log

Click **View → Logs** (or Ctrl/Cmd + Enter) to see detailed output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING COMPLETE TOOL 3 GPT FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client ID: test_gpt_flow_1700000000000

STEP 1: Testing 6 subdomain analyses (background calls)
─────────────────────────────────────────────────

[1/6] Testing subdomain_1_1: Unworthiness
  ✅ Success - Source: gpt
  ✅ Cached successfully
     Pattern: You consistently describe...
     Insight: This pattern of self-judgment...
     Action: Start by writing down...
     Root Belief: I am fundamentally flawed...

[2/6] Testing subdomain_1_2: Scarcity Mindset
  ✅ Success - Source: gpt
  ...
```

---

## 🔍 What to Look For

### ✅ SUCCESS Indicators

**Subdomain Analyses (6 calls):**
- Each shows: `✅ Success - Source: gpt` or `gpt_retry`
- Each shows: `✅ Cached successfully`
- Each has 4 fields populated: pattern, insight, action, rootBelief
- Fields contain actual content (not empty, not "N/A", not placeholders)

**Syntheses (3 calls):**
- Domain 1: `✅ Domain 1 Synthesis Found` with summary, keyThemes, priorityFocus
- Domain 2: `✅ Domain 2 Synthesis Found` with same fields
- Overall: `✅ Overall Synthesis Found` with overview, integration, coreWork, nextSteps

**Final Summary:**
```
📊 TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subdomain Analyses: 6/6 completed
  - GPT: 6
  - Fallback: 0

Syntheses:
  - Domain 1: ✅ (gpt)
  - Domain 2: ✅ (gpt)
  - Overall: ✅ (gpt)

✅ ALL TESTS PASSED!
```

### ⚠️ WARNING Indicators

**Fallback Usage:**
```
[1/6] Testing subdomain_1_1: Unworthiness
  ✅ Success - Source: fallback  ← Using fallback, not GPT
```
This means GPT failed and fallback content is being used. Check:
- OpenAI API key is set in Script Properties
- API key has sufficient credits
- Rate limits not exceeded

**Empty Content:**
```
  Pattern: ...
  Insight: ...
  Action: ...
  Root Belief: ...
```
If fields show `...` with nothing before, content is missing. Check:
- GPT validation functions (`isValidSubdomainInsight`, `isValidDomainSynthesis`)
- Parser functions (`parseSubdomainResponse`, `parseDomainSynthesis`)
- Fallback content structure matches expected format

### ❌ ERROR Indicators

**Cache Failures:**
```
  ✅ Success - Source: gpt
  ⚠️ WARNING: Not found in cache!  ← Data not being cached!
```
Means GPT ran but caching failed. Check:
- PropertiesService quota not exceeded
- Cache key format is correct
- `cacheInsight()` function working

**Missing Syntheses:**
```
  ⚠️ Domain 1 synthesis missing!
```
Means synthesis call failed. Check:
- `synthesizeDomain()` throwing errors
- Validation too strict
- OpenAI API issues

**Data Not Saved:**
```
  ❌ Data not found in RESPONSES sheet!
```
Means `DataService.saveToolResponse()` failed. Check:
- RESPONSES sheet exists
- Sheet permissions
- `processFinalSubmission()` completing

---

## 🛠️ Individual Component Tests

### Test Single Subdomain Analysis

```javascript
testSingleSubdomainAnalysis()
```

Tests just one GPT subdomain call. Useful for:
- Debugging GPT prompt issues
- Checking API connectivity
- Validating response parsing

### Test Domain Synthesis

```javascript
testDomainSynthesis()
```

Tests domain-level synthesis with mock data. Useful for:
- Debugging synthesis prompts
- Checking synthesis validation
- Testing without running full flow

### Test Overall Synthesis

```javascript
testOverallSynthesis()
```

Tests overall synthesis with mock data.

### Test Cache Operations

```javascript
testCacheOperations()
```

Tests PropertiesService cache:
- Storing insights
- Retrieving insights
- Clearing cache

---

## 🔧 Diagnostic Functions

### Inspect Cache

```javascript
inspectCache()
```

Shows what's currently in cache for test client:
```
✅ subdomain_1_1:
   Source: gpt
   Pattern: You consistently describe...
✅ subdomain_1_2:
   Source: gpt
   Pattern: There's a persistent belief...
❌ subdomain_1_3: Not cached
```

### Inspect RESPONSES Sheet

```javascript
inspectResponsesSheet()
```

Shows what's saved in the RESPONSES sheet:
```
✅ Data found in RESPONSES sheet
   Timestamp: Mon Nov 18 2025 01:57:00
   Status: COMPLETED
   Version: v3.9.3

   Syntheses:
   - Domain 1: ✅
   - Domain 2: ✅
   - Overall: ✅

   Subdomain insights: 6/6
```

### Clean Up Test Data

```javascript
cleanupTestData()
```

Removes test data:
- Clears PropertiesService cache
- Clears draft storage
- (Does NOT delete from RESPONSES sheet - do manually if needed)

---

## 🐛 Troubleshooting

### Issue: All Subdomain Calls Use Fallback

**Symptoms:**
```
[1/6] Testing subdomain_1_1: Unworthiness
  ✅ Success - Source: fallback
[2/6] Testing subdomain_1_2: Scarcity Mindset
  ✅ Success - Source: fallback
...
```

**Causes:**
1. **OpenAI API Key Missing**
   - Go to: Project Settings → Script Properties
   - Add property: `OPENAI_API_KEY` = `sk-...`

2. **API Key Invalid/Expired**
   - Check OpenAI account
   - Verify key is active
   - Check billing/credits

3. **Rate Limiting**
   - Wait 1 minute
   - Run test again
   - Add longer delays in test script

4. **Network/Firewall Issues**
   - Check Apps Script can reach `https://api.openai.com`
   - Check organization firewall settings

### Issue: Empty Domain Synthesis Fields

**Symptoms:**
```
✅ Domain 1 Synthesis Found:
   Summary:
   Key Themes: 0 themes
   Priority Focus:
```

**Causes:**
1. **Validation Too Strict**
   - Check `isValidDomainSynthesis()` in GroundingGPT.js
   - May be rejecting valid but short responses

2. **Parser Not Extracting Content**
   - Check `parseDomainSynthesis()` in GroundingGPT.js
   - Check GPT response format matches expected structure
   - Add logging to see raw GPT response:
     ```javascript
     Logger.log('Raw GPT response: ' + result);
     ```

3. **GPT Returning Empty**
   - Check system/user prompts
   - Verify prompts have sufficient context
   - Test prompts in OpenAI Playground

### Issue: Subdomain Insights Not in Final Data

**Symptoms:**
```
Subdomain insights: 0/6
```

**Causes:**
1. **Not Collected in processFinalSubmission**
   - Check `collectGPTInsights()` in Tool3.js line 692
   - Verify it's calling `GroundingGPT.getCachedInsight()` for each subdomain

2. **Cache Expired**
   - PropertiesService cache has 6-hour limit
   - If assessment takes >6 hours, insights lost
   - Solution: Save insights to RESPONSES as DRAFT after each page

3. **Wrong Client ID**
   - Verify same clientId used throughout
   - Check cache key format matches storage key format

---

## 📊 Expected API Usage & Cost

**Per Complete Assessment:**
- 6 subdomain calls × GPT-4o-mini (~$0.001 each) = ~$0.006
- 2 domain calls × GPT-4o (~$0.003 each) = ~$0.006
- 1 overall call × GPT-4o (~$0.003) = ~$0.003
- **Total: ~$0.015 per assessment**

**Test Script:**
- Same as above (tests with real API calls)
- Use sparingly to avoid unnecessary costs
- Clean up test data after testing

---

## 🎯 Success Criteria

Before considering GPT flow validated:

- [ ] `testCompleteFlow()` shows `✅ ALL TESTS PASSED!`
- [ ] All 6 subdomain analyses use `gpt` or `gpt_retry` source (not `fallback`)
- [ ] All 3 syntheses have complete content (not empty)
- [ ] Cache stores and retrieves correctly
- [ ] RESPONSES sheet contains complete data
- [ ] Manual test: Complete real assessment and verify report shows GPT content

---

## 📝 Next Steps After Validation

Once GPT flow is confirmed working:

1. **Address Empty Domain Boxes** (Issue #1 from handoff doc)
   - Check `renderDomainSection()` in GroundingReport.js
   - Verify it's accessing `gptInsights.domain1.summary` and `.priorityFocus`
   - Add logging to see what data report is receiving

2. **Enhance PDF Reports** (Issue #2 from handoff doc)
   - Compare web report vs PDF structure
   - Add missing subdomain details to PDF
   - Ensure PDF matches web comprehensiveness

3. **Full Manual Testing**
   - Complete Tool 3 assessment as real user
   - Complete Tool 5 assessment as real user
   - Verify reports show all GPT content
   - Test Edit/Start Fresh flows

---

## 🔗 Related Files

- **Test Script:** `/Users/Larry/code/ftp-v3/tests/test-tool3-gpt-flow.js`
- **GPT Logic:** `/Users/Larry/code/ftp-v3/core/grounding/GroundingGPT.js`
- **Tool 3:** `/Users/Larry/code/ftp-v3/tools/tool3/Tool3.js`
- **Tool 5:** `/Users/Larry/code/ftp-v3/tools/tool5/Tool5.js`
- **Server Entry:** `/Users/Larry/code/ftp-v3/Code.js` (line 370, `triggerGroundingGPTAnalysis()`)
- **Form Builder:** `/Users/Larry/code/ftp-v3/core/grounding/GroundingFormBuilder.js` (line 658, `getBackgroundGPTScript()`)
- **Handoff Doc:** `/Users/Larry/code/ftp-v3/docs/tool3/tool3-5-handoff.md`

---

**Happy Testing!** 🧪
