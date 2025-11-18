# Bug Report: Tool 3 Submission Error - "Assessment data not found"

**Date:** November 17, 2025
**Reporter:** Larry Yatch
**Severity:** CRITICAL - Blocks Tool 3/5 from being usable
**Status:** UNRESOLVED after multiple fix attempts

---

## 🔴 Symptoms

### Primary Error
When submitting the final page (page 7) of Tool 3, after a long delay, user receives:

```
<?!= include('shared/styles') ?>
Error
Assessment data not found or incomplete for client 6123LY

Please complete the assessment to view your report.

← Back to Dashboard
```

### Observable Behaviors
1. **Long Delay**: Processing takes noticeably longer than expected (suggests timeout or heavy processing)
2. **White Page**: Error page shows unbranded styling (HTML template not rendering)
3. **No Data Saved**: Subsequent attempts show same error (data never persisted)
4. **Client ID Known**: Error message correctly identifies client (6123LY)

---

## 🔍 Error Source Analysis

### Error Location
File: `/Users/Larry/code/ftp-v3/tools/tool3/Tool3Report.js`
Lines: 22-35

```javascript
render(clientId) {
  try {
    // Retrieve saved assessment data
    const savedData = DataService.getToolResponse(clientId, 'tool3');

    if (!savedData || !savedData.scoring || !savedData.gpt_insights || !savedData.syntheses) {
      return HtmlService.createHtmlOutput(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TruPath - Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <?!= include('shared/styles') ?>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1 style="color: #dc3545;">Error</h1>
              <p>Assessment data not found or incomplete for client ${clientId}</p>
              ...
```

**Key Observation**: The `<?!= include('shared/styles') ?>` is NOT being processed, appearing as literal text. This means the HTML is NOT being rendered as a template.

---

## 🔄 Complete Submission Flow

### Expected Flow
```
USER SUBMITS PAGE 7
    ↓
FormUtils.buildStandardPage() [Client-side form submission]
    ↓
google.script.run.completeToolSubmission('tool3', formData) [Client→Server]
    ↓
Code.js: completeToolSubmission()
    ↓
Tool3.processFinalSubmission(clientId)
    ↓
├─ getExistingData(clientId)           // Get draft data
├─ extractResponses(allData)           // Filter responses (skip _label)
├─ GroundingScoring.calculateScores()  // Score 24 scale questions
├─ collectGPTInsights(clientId)        // Get cached insights (6 subdomains)
├─ runFinalSyntheses()                 // Run 3 GPT calls (2 domains + 1 overall)
├─ saveAssessmentData()                // Save to RESPONSES sheet
│   └─ DataService.saveToolResponse(clientId, 'tool3', dataToSave)
└─ Return { success: true }
    ↓
Code.js: Redirect to tool3_report
    ↓
Router.js: Route to Tool3Report.render(clientId)
    ↓
Tool3Report.render(clientId)
    ↓
DataService.getToolResponse(clientId, 'tool3')
    ↓
Parse and display report
```

### Where It's Failing
The error occurs at `Tool3Report.render()`, which means:
- **Either**: `processFinalSubmission()` threw an error BEFORE saving
- **Or**: `saveAssessmentData()` failed silently
- **Or**: `DataService.saveToolResponse()` failed silently
- **Or**: `DataService.getToolResponse()` is looking in wrong place
- **Or**: Data is saved but with incomplete/wrong structure

---

## 🛠️ Fixes Already Attempted

### Fix 1: Added triggerGroundingGPTAnalysis() Function
**Commit:** 19d0884 (Nov 17, 2025)
**File:** Code.js (lines 340-447)
**Problem Addressed:** Missing server-side function to handle background GPT analysis
**Status:** ✅ Deployed

### Fix 2: Added Duplicate Prevention Check
**Commit:** 0b2161e (Nov 17, 2025)
**File:** Code.js (lines 399-409)
**Problem Addressed:** Prevent redundant API calls on back/forward navigation
**Status:** ✅ Deployed

### Fix 3: Filter _label Fields from Scoring
**Commit:** 56cfae7 (Nov 17, 2025)
**Files:** Tool3.js, Tool5.js (extractResponses method)
**Problem Addressed:** Label fields were being passed to scoring engine causing parseInt() errors
**Status:** ✅ Deployed

**ISSUE**: Error persists after all three fixes

---

## 🔎 Potential Root Causes

### Category A: Data Collection Issues

#### A1. Draft Data Not Being Saved
**Location**: Tool3.js `savePageData()` (lines 560-570)
**Hypothesis**: Draft data is not being saved during form progression
**Check**: 
```javascript
// In Apps Script console, run:
function checkDraftData() {
  const clientId = '6123LY';
  const draftData = Tool3.getExistingData(clientId);
  Logger.log('Draft Data:');
  Logger.log(JSON.stringify(draftData, null, 2));
  
  // Check PropertiesService
  const props = PropertiesService.getUserProperties();
  const draftKey = `tool3_draft_${clientId}`;
  const propData = props.getProperty(draftKey);
  Logger.log('PropertiesService Data:');
  Logger.log(propData);
}
```

#### A2. Draft Data Incomplete
**Hypothesis**: Some pages are not saving their data
**Expected Fields**: 
- 24 scale responses: `subdomain_X_Y_belief`, `subdomain_X_Y_behavior`, etc.
- 24 label fields: `subdomain_X_Y_belief_label`, etc. (should be filtered out)
- 6 open responses: `subdomain_X_Y_open_response`
**Check**: Count fields in draft data (should have 30+ fields)

#### A3. DraftService vs DataService Mismatch
**Location**: Tool3.js uses both
- `DraftService.saveDraft()` - Page-to-page (PropertiesService)
- `DataService.saveDraft()` - Page 1 only (RESPONSES sheet)
**Hypothesis**: Data split between two storage systems incorrectly
**Check**: Verify both systems have data and are being merged correctly in `getExistingData()`

### Category B: Scoring Issues

#### B1. GroundingScoring Validation Failing
**Location**: GroundingScoring.js `extractAspectScores()` (lines 64-85)
**Validation**: 
```javascript
if (isNaN(rawScore) || rawScore === 0 || rawScore > 3) {
  throw new Error(`Invalid score for ${fieldName}: ${responses[fieldName]}`);
}
```
**Hypothesis**: One or more scores are:
- NaN (not a number)
- 0 (zero not allowed in scale)
- Missing entirely
- Still containing label text despite filter

**Check**:
```javascript
function debugScoring() {
  const clientId = '6123LY';
  const allData = Tool3.getExistingData(clientId);
  const responses = Tool3.extractResponses(allData);
  
  Logger.log('=== RESPONSES FOR SCORING ===');
  Object.keys(responses).forEach(key => {
    Logger.log(`${key}: ${responses[key]} (type: ${typeof responses[key]})`);
  });
  
  // Try to score
  try {
    const scoringResult = GroundingScoring.calculateScores(
      responses,
      Tool3.config.subdomains
    );
    Logger.log('Scoring SUCCESS');
    Logger.log(JSON.stringify(scoringResult, null, 2));
  } catch (error) {
    Logger.log('Scoring FAILED');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}
```

#### B2. Missing Scale Responses
**Hypothesis**: User navigated backward and forward, causing some responses to be lost
**Check**: Verify all 24 scale questions have responses (6 subdomains × 4 aspects)

### Category C: GPT Processing Issues

#### C1. collectGPTInsights() Finding Nothing
**Location**: Tool3.js `collectGPTInsights()` (lines 686-701)
**Hypothesis**: Background GPT calls never ran, cache is empty
**Expected**: 6 cached insights in PropertiesService with keys like:
- `tool3_6123LY_subdomain_1_1_insight`
- `tool3_6123LY_subdomain_1_2_insight`
- etc.

**Check**:
```javascript
function checkGPTCache() {
  const clientId = '6123LY';
  const toolId = 'tool3';
  const props = PropertiesService.getUserProperties();
  
  Tool3.config.subdomains.forEach(subdomain => {
    const cacheKey = `${toolId}_${clientId}_${subdomain.key}_insight`;
    const cached = props.getProperty(cacheKey);
    Logger.log(`${subdomain.key}: ${cached ? 'FOUND' : 'MISSING'}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      Logger.log(`  Source: ${parsed.source}`);
    }
  });
}
```

#### C2. runFinalSyntheses() Timing Out
**Location**: Tool3.js `runFinalSyntheses()` (lines 706-750)
**Hypothesis**: 3 synthesis GPT calls (2 domains + 1 overall) exceed Apps Script timeout
**Timeout Limits**:
- Custom functions: 30 seconds
- Simple triggers: 6 minutes
- Installable triggers: 6 minutes
- Web app: 6 minutes (but UI may timeout sooner)

**Issue**: Running 3 sequential GPT-4o calls could take:
- Domain 1 synthesis: ~3-5 seconds
- Domain 2 synthesis: ~3-5 seconds  
- Overall synthesis: ~3-5 seconds
- **Total: 9-15 seconds** (should be OK, but may hit edge cases)

**Check**: Look for timeout errors in execution logs

#### C3. synthesizeDomain() or synthesizeOverall() Failing
**Location**: GroundingGPT.js
**Hypothesis**: GPT API errors or parsing failures
**Expected Behavior**: Should fall back gracefully, but may not be

### Category D: Data Persistence Issues

#### D1. saveAssessmentData() Failing Silently
**Location**: Tool3.js `saveAssessmentData()` (lines 785-804)
```javascript
saveAssessmentData(clientId, data) {
  const dataToSave = {
    responses: data.responses,
    scoring: data.scoringResult,
    gpt_insights: data.gptInsights,
    syntheses: data.syntheses,
    timestamp: new Date().toISOString(),
    tool_version: '1.0.0'
  };

  // Use DataService to save
  DataService.saveToolResponse(
    clientId,
    this.config.id,
    dataToSave
  );

  // Clear GPT cache
  GroundingGPT.clearCache(this.config.id, clientId);
}
```

**Hypothesis**: No error handling, so if DataService fails, we don't know

**Check**:
```javascript
function debugSaveData() {
  const clientId = '6123LY';
  
  try {
    // Get what would be saved
    const allData = Tool3.getExistingData(clientId);
    const responses = Tool3.extractResponses(allData);
    const scoringResult = GroundingScoring.calculateScores(responses, Tool3.config.subdomains);
    const gptInsights = Tool3.collectGPTInsights(clientId);
    
    const dataToSave = {
      responses: responses,
      scoring: scoringResult,
      gpt_insights: gptInsights,
      syntheses: { /* mock */ },
      timestamp: new Date().toISOString(),
      tool_version: '1.0.0'
    };
    
    Logger.log('=== DATA TO SAVE ===');
    Logger.log(JSON.stringify(dataToSave, null, 2));
    
    // Try to save
    DataService.saveToolResponse(clientId, 'tool3', dataToSave);
    Logger.log('Save SUCCESS');
    
    // Try to retrieve
    const retrieved = DataService.getToolResponse(clientId, 'tool3');
    Logger.log('=== RETRIEVED DATA ===');
    Logger.log(JSON.stringify(retrieved, null, 2));
    
  } catch (error) {
    Logger.log('ERROR:');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}
```

#### D2. DataService.saveToolResponse() Structure Mismatch
**Location**: core/DataService.js
**Hypothesis**: DataService expects different data structure than Tool3 provides
**Expected by Tool3Report.render()**:
```javascript
{
  scoring: { /* scores */ },
  gpt_insights: { 
    subdomains: { /* subdomain insights */ }
  },
  syntheses: {
    domain1: { /* synthesis */ },
    domain2: { /* synthesis */ },
    overall: { /* synthesis */ }
  }
}
```

**Check**: Verify DataService saves and retrieves in expected format

#### D3. RESPONSES Sheet Write Failure
**Hypothesis**: Permissions, quota, or corruption preventing write
**Check**: 
- Open RESPONSES sheet manually
- Check for any existing rows for client 6123LY
- Verify sheet structure matches expectations

### Category E: Report Rendering Issues

#### E1. Tool3Report.render() Template Not Processing
**Observation**: `<?!= include('shared/styles') ?>` appears as literal text
**Hypothesis**: Using `HtmlService.createHtmlOutput()` instead of `HtmlService.createTemplate()`

**Current Code**:
```javascript
return HtmlService.createHtmlOutput(`
  <?!= include('shared/styles') ?>
  ...
`);
```

**Should Be**:
```javascript
const template = HtmlService.createTemplate(`
  <?!= include('shared/styles') ?>
  ...
`);
return template.evaluate();
```

**Impact**: Even if this is just a display issue, it indicates the error path is being hit

#### E2. Router Not Catching Errors
**Location**: core/Router.js
**Hypothesis**: If Tool3Report.render() throws exception, Router may not handle gracefully

### Category F: Form Submission Flow Issues

#### F1. completeToolSubmission() Not Being Called
**Hypothesis**: Form is calling wrong function (saveToolPageData instead of completeToolSubmission)
**Check**: Look at FormUtils.buildStandardPage() for final page (isFinalPage=true)

#### F2. Wrong Tool ID
**Hypothesis**: Form passing 'tool_3' instead of 'tool3' or vice versa
**Check**: Verify tool ID consistency across all files

#### F3. processFinalSubmission() Exception Not Caught
**Location**: Code.js `completeToolSubmission()` (lines 442+)
**Check**: Verify proper error handling and logging

---

## 🔬 Debugging Steps (Priority Order)

### Step 1: Check Execution Logs
```javascript
// In Apps Script: View → Execution log
// Or run this to see recent logs:
function viewRecentLogs() {
  const log = Logger.getLog();
  console.log(log);
}
```
**Look For**:
- `[Tool3] Processing final submission for 6123LY`
- `[Tool3] Scoring complete: Overall=XX`
- `[Tool3] GPT syntheses complete`
- `[Tool3] Assessment data saved`
- Any ERROR messages
- Stack traces

### Step 2: Verify Draft Data Exists
Run `checkDraftData()` function (see A1 above)

### Step 3: Test Scoring Independently
Run `debugScoring()` function (see B1 above)

### Step 4: Check GPT Cache
Run `checkGPTCache()` function (see C1 above)

### Step 5: Test Save/Retrieve
Run `debugSaveData()` function (see D1 above)

### Step 6: Manual Submission Test
```javascript
function manualSubmissionTest() {
  const clientId = '6123LY';
  
  try {
    Logger.log('=== STARTING MANUAL TEST ===');
    
    const result = Tool3.processFinalSubmission(clientId);
    
    Logger.log('=== RESULT ===');
    Logger.log(JSON.stringify(result, null, 2));
    
    // Now try to render report
    const report = Tool3Report.render(clientId);
    Logger.log('Report render SUCCESS');
    
  } catch (error) {
    Logger.log('=== EXCEPTION ===');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}
```

### Step 7: Check RESPONSES Sheet Directly
1. Open Google Sheet
2. Go to RESPONSES tab
3. Filter for Client_ID = '6123LY' and Tool_ID = 'tool3'
4. Check if any rows exist
5. If yes, examine Data column (JSON)

---

## 📋 Data Structure Reference

### Expected Draft Data Structure
```javascript
{
  // Subdomain 1.1 (I'm Not Worthy of Financial Freedom)
  "subdomain_1_1_belief": "-3",
  "subdomain_1_1_belief_label": "Strongly agree - I'm absolutely certain...",
  "subdomain_1_1_behavior": "-2",
  "subdomain_1_1_behavior_label": "Very often - I regularly...",
  "subdomain_1_1_feeling": "-1",
  "subdomain_1_1_feeling_label": "Often - I frequently...",
  "subdomain_1_1_consequence": "-2",
  "subdomain_1_1_consequence_label": "Very often - I regularly...",
  "subdomain_1_1_open_response": "User's detailed response...",
  
  // Repeat for subdomains 1.2, 1.3, 2.1, 2.2, 2.3
  // Total: 24 scale responses + 24 labels + 6 open responses = 54 fields
  
  // Metadata
  "lastPage": 7,
  "lastUpdate": "2025-11-17T..."
}
```

### Expected Responses After extractResponses()
```javascript
{
  // 24 scale responses (numeric only, labels filtered out)
  "subdomain_1_1_belief": "-3",
  "subdomain_1_1_behavior": "-2",
  "subdomain_1_1_feeling": "-1",
  "subdomain_1_1_consequence": "-2",
  // ... (repeat for all 6 subdomains)
  
  // 6 open responses
  "subdomain_1_1_open_response": "User's detailed response...",
  "subdomain_1_2_open_response": "...",
  "subdomain_1_3_open_response": "...",
  "subdomain_2_1_open_response": "...",
  "subdomain_2_2_open_response": "...",
  "subdomain_2_3_open_response": "..."
  
  // Total: 30 fields (24 scale + 6 open)
}
```

### Expected Final Saved Data Structure
```javascript
{
  "responses": { /* 30 fields from above */ },
  "scoring": {
    "aspectScores": { /* 24 aspect scores */ },
    "subdomainQuotients": { /* 6 subdomain scores */ },
    "domainQuotients": { 
      "domain1": 65.5,
      "domain2": 42.3
    },
    "overallQuotient": 53.9,
    "domainGaps": { /* gap analysis */ },
    "beliefBehaviorAnalysis": { /* belief-behavior gaps */ }
  },
  "gpt_insights": {
    "subdomains": {
      "subdomain_1_1": {
        "pattern": "...",
        "insight": "...",
        "action": "...",
        "rootBelief": "...",
        "source": "gpt" // or "gpt_retry" or "fallback"
      },
      // ... repeat for all 6 subdomains
    }
  },
  "syntheses": {
    "domain1": {
      "summary": "...",
      "keyThemes": "...",
      "priorityFocus": "..."
    },
    "domain2": { /* same structure */ },
    "overall": {
      "overview": "...",
      "topPatterns": "...",
      "priorityActions": "..."
    }
  },
  "timestamp": "2025-11-17T...",
  "tool_version": "1.0.0"
}
```

---

## 🎯 Most Likely Causes (Ranked)

1. **HIGH**: processFinalSubmission() throwing exception before saving data
   - Could be scoring validation failure
   - Could be GPT synthesis timeout
   - Could be missing required data

2. **HIGH**: DataService.saveToolResponse() failing silently
   - No error handling in saveAssessmentData()
   - Would explain why report can't find data

3. **MEDIUM**: GPT cache empty causing collectGPTInsights() to fail
   - Background GPT calls never ran
   - Or cache was cleared prematurely

4. **MEDIUM**: Missing open responses causing issues
   - Required for GPT analysis
   - Validation may fail if responses too short

5. **LOW**: Template rendering issue
   - Symptom not cause
   - Error page should still work even with bad styling

---

## 🔧 Recommended Investigation Path

1. **Immediate**: Run `manualSubmissionTest()` in Apps Script console
2. **If that fails**: Run `debugScoring()` to find exact validation error
3. **If scoring works**: Run `checkGPTCache()` to verify insights exist
4. **If cache empty**: Check browser console for GPT trigger messages
5. **If everything works in manual test**: Issue is with web app flow, not logic

---

## 📝 Notes for Next Session

- User has already filled out complete form (all 7 pages)
- Draft data should exist in PropertiesService
- No need to re-fill form if data is there
- Can debug directly with manual functions
- Consider adding more logging/error handling throughout flow
- May need to add transaction rollback if save fails partway through

---

## 🚨 Critical Questions to Answer

1. Does draft data exist in PropertiesService for client 6123LY?
2. Can we extract and score that data successfully?
3. Does GPT cache have 6 subdomain insights?
4. Can we run synthesis calls successfully?
5. Can we save data to RESPONSES sheet?
6. Can we retrieve data from RESPONSES sheet?
7. At which exact step does the flow fail?

**Once we identify the exact failure point, the fix will be straightforward.**

---

**End of Bug Report**
