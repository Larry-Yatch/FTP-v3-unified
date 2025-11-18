# Tool 3 Manual Testing Plan
## Identity & Validation Grounding Tool

**Testing Date:** _________________
**Tester Name:** _________________
**Environment:** Production / Staging
**Script Version:** _________________

---

## 📋 Pre-Testing Setup

### Prerequisites
- [ ] Tool 3 deployed via `clasp push`
- [ ] Automated tests passing (100% success rate)
- [ ] OpenAI API key configured in Script Properties
- [ ] Master spreadsheet accessible
- [ ] Test client ID created: `TEST_MANUAL_001`

### Browser Setup
- [ ] Chrome/Firefox latest version
- [ ] Clear cache and cookies
- [ ] Disable browser extensions (or test in Incognito/Private mode)
- [ ] Screen resolution: 1920x1080 or higher

### Data Verification Access
- [ ] Access to RESPONSES sheet in master spreadsheet
- [ ] Access to ACTIVITY_LOG sheet
- [ ] Access to GPT_FALLBACK_LOG sheet (if exists)
- [ ] Apps Script execution logs accessible

---

## 🧪 Test Scenario 1: Happy Path (Full Assessment)

**Objective:** Complete full assessment with realistic data, verify end-to-end flow

### Step 1: Access Tool 3
- [ ] Navigate to dashboard
- [ ] Verify Tool 3 tile displays correctly
  - Icon: 🪞
  - Name: "Identity & Validation Grounding Tool"
  - Description visible
  - Estimated time shown
- [ ] Click on Tool 3 tile
- [ ] Record load time: __________ seconds

**Expected:** Tool 3 intro page (Page 1) loads within 3 seconds

---

### Step 2: Introduction Page (Page 1)

#### Visual Validation
- [ ] Page header shows "Identity & Validation"
- [ ] Progress indicator shows "Page 1 of 7"
- [ ] Welcome message displays correctly
- [ ] Domain descriptions visible:
  - [ ] Domain 1: False Self-View description
  - [ ] Domain 2: External Validation description
- [ ] "How it Works" section displays
- [ ] Tip box with 💡 emoji visible
- [ ] "Continue" button present and styled correctly

#### Content Validation
- [ ] No typos or formatting errors
- [ ] Text is readable (contrast, font size)
- [ ] No escaped characters showing (e.g., `\'`, `\n`)
- [ ] Apostrophes render correctly (not as `\'` or `&apos;`)

#### Interaction
- [ ] Click "Continue" button
- [ ] Page advances to Page 2
- [ ] Transition smooth (no errors)

**Notes:**
_______________________________________________________________
_______________________________________________________________

---

### Step 3: Subdomain 1.1 - "I'm Not Worthy of Financial Freedom" (Page 2)

#### Visual Validation
- [ ] Page header shows "Identity & Validation"
- [ ] Progress indicator shows "Page 2 of 7"
- [ ] Subdomain title displays: "I'm Not Worthy of Financial Freedom"
- [ ] Subdomain description visible
- [ ] "Belief-Behavior Connection" box displays with correct text

#### Question Validation (4 Scale Questions)

**Question 1 (Belief):**
- [ ] Question text displays completely
- [ ] Scale container shows (-3 to +3 range)
- [ ] Left anchor (negative) text readable
- [ ] Right anchor (positive) text readable
- [ ] Radio buttons all clickable
- [ ] Visual feedback when selecting (circle fills)

**Question 2 (Behavior):**
- [ ] Question text displays
- [ ] Scale anchors appropriate
- [ ] All radio buttons functional

**Question 3 (Feeling):**
- [ ] Question text displays
- [ ] Scale anchors appropriate
- [ ] All radio buttons functional

**Question 4 (Consequence):**
- [ ] Question text displays
- [ ] Scale anchors appropriate
- [ ] All radio buttons functional

**Question 5 (Open Response):**
- [ ] Open response question displays
- [ ] Textarea visible and sized appropriately
- [ ] Character counter shows "0 / 2000"
- [ ] Textarea accepts input

#### Interaction Testing
- [ ] Select middle value (0) for Belief question
- [ ] Select -2 for Behavior question
- [ ] Select -1 for Feeling question
- [ ] Select +1 for Consequence question
- [ ] Type 75+ characters in open response:
  ```
  I avoid looking at my bank accounts because I'm afraid of what I'll find. I feel like if I truly saw my financial situation, I'd have to face my failures.
  ```
- [ ] Character counter updates correctly
- [ ] Click "Continue" button
- [ ] Page advances to Page 3

**Validation Errors to Test:**
- [ ] Try clicking Continue without answering all scale questions
  - Expected: Error message or validation prevents submission
- [ ] Try selecting 0 (middle value) for all questions
  - Expected: Allowed (0 is valid in the middle)
- [ ] Try leaving open response empty
  - Expected: Warning or validation message

**Notes:**
_______________________________________________________________
_______________________________________________________________

---

### Step 4: Subdomain 1.2 - "I'll Never Have Enough" (Page 3)

#### Quick Validation
- [ ] Progress shows "Page 3 of 7"
- [ ] Subdomain title: "I'll Never Have Enough"
- [ ] 4 scale questions + 1 open response present
- [ ] All questions display correctly
- [ ] No content from previous page visible

#### Test Responses
- [ ] Answer all scale questions (vary selections: -3, -2, +1, +2)
- [ ] Provide open response (50+ characters)
- [ ] Click Continue
- [ ] Advance to Page 4

**Notes:**
_______________________________________________________________

---

### Step 5: Subdomain 1.3 - "I Can't See It" (Page 4)

#### Quick Validation
- [ ] Progress shows "Page 4 of 7"
- [ ] Subdomain title: "I Can't See It"
- [ ] 4 scale questions + 1 open response present
- [ ] All rendering correctly

#### Test Responses
- [ ] Complete all questions (vary responses)
- [ ] Advance to Page 5

**Notes:**
_______________________________________________________________

---

### Step 6: Subdomain 2.1 - "Money = My Worth" (Page 5)

#### Quick Validation
- [ ] Progress shows "Page 5 of 7"
- [ ] Subdomain title: "Money = My Worth"
- [ ] All questions present and functional

#### Test Responses
- [ ] Complete all questions
- [ ] Advance to Page 6

**Notes:**
_______________________________________________________________

---

### Step 7: Subdomain 2.2 - "I Must Hide My Choices" (Page 6)

#### Quick Validation
- [ ] Progress shows "Page 6 of 7"
- [ ] Subdomain title: "I Must Hide My Choices"
- [ ] All questions functional

#### Test Responses
- [ ] Complete all questions
- [ ] Advance to Page 7

**Notes:**
_______________________________________________________________

---

### Step 8: Subdomain 2.3 - "I Have to Prove Myself" (Page 7)

#### Final Page Validation
- [ ] Progress shows "Page 7 of 7"
- [ ] Subdomain title: "I Have to Prove Myself"
- [ ] All questions present
- [ ] Button text changes to "Complete Assessment" or similar

#### Test Responses
- [ ] Complete all questions
- [ ] Note submission time: __________
- [ ] Click final submit button
- [ ] Loading indicator appears
- [ ] Wait for processing (may take 30-60 seconds for GPT calls)

**Expected Processing:**
- Background GPT synthesis calls execute
- Scoring calculations run
- Report generation starts

**Notes:**
_______________________________________________________________

---

### Step 9: Report Generation & Display

#### Report Access
- [ ] Report page loads automatically after submission
- [ ] OR redirect to dashboard with "View Report" option
- [ ] Total time from submit to report: __________ seconds

#### Report Header
- [ ] Tool name: "Identity & Validation Assessment"
- [ ] Client ID visible
- [ ] Assessment date/time displayed
- [ ] Overall score displayed prominently (0-100 range)

#### Overall Score Section
- [ ] Overall quotient number shows (with decimals, e.g., 83.33)
- [ ] Score interpretation text present
- [ ] Visual indicator (gauge, color, icon) displays

#### Domain Scores
**Domain 1: False Self-View**
- [ ] Domain score displays (0-100)
- [ ] Domain summary/description present
- [ ] Key themes listed
- [ ] Priority focus stated

**Domain 2: External Validation**
- [ ] Domain score displays (0-100)
- [ ] Domain summary/description present
- [ ] Key themes listed
- [ ] Priority focus stated

#### Subdomain Details (6 sections)
For each subdomain section:
- [ ] Subdomain name displays
- [ ] Subdomain score shows
- [ ] Pattern identified (GPT-generated or fallback)
- [ ] Insight provided
- [ ] Recommended action stated
- [ ] Root belief addressed

#### Gap Analysis
- [ ] Gap classification shown (FOCUSED, MODERATE, DIFFUSE)
- [ ] Gap magnitude displayed
- [ ] Most problematic subdomain identified
- [ ] Interpretation provided

#### Overall Insights & Integration
- [ ] Overview of complete assessment
- [ ] Integration between domains discussed
- [ ] Core work identified
- [ ] Next steps provided (3-5 action items)

#### Report Functionality
- [ ] Report is readable (good contrast, spacing)
- [ ] No escaped HTML showing
- [ ] No JavaScript errors in console
- [ ] "Download PDF" button present (if implemented)
- [ ] "Return to Dashboard" button present
- [ ] Report can be accessed again from dashboard

**Notes:**
_______________________________________________________________
_______________________________________________________________

---

## 🧪 Test Scenario 2: Edge Cases

### Test 2.1: Extreme Negative Responses
**Objective:** Test system with all -3 responses

- [ ] Start new assessment with test client: `TEST_EDGE_NEGATIVE`
- [ ] Answer ALL scale questions with -3 (most negative)
- [ ] Provide meaningful open responses (75+ characters each)
- [ ] Complete assessment
- [ ] Verify report generates
- [ ] Check overall score: Should be very low (near 0)
- [ ] Verify critical-level insights appear
- [ ] Confirm fallbacks work if GPT unavailable

**Expected Results:**
- Overall Quotient: ~0-10
- Critical language in insights
- Urgent recommendations
- No calculation errors

**Notes:**
_______________________________________________________________

---

### Test 2.2: Extreme Positive Responses
**Objective:** Test system with all +3 responses

- [ ] Start new assessment with test client: `TEST_EDGE_POSITIVE`
- [ ] Answer ALL scale questions with +3 (most positive)
- [ ] Provide positive open responses
- [ ] Complete assessment
- [ ] Verify report generates
- [ ] Check overall score: Should be very high (near 100)
- [ ] Verify healthy-level insights appear

**Expected Results:**
- Overall Quotient: ~90-100
- Positive/affirming language
- Maintenance recommendations
- No issues flagged

**Notes:**
_______________________________________________________________

---

### Test 2.3: Mixed Responses (Realistic Pattern)
**Objective:** Test realistic user pattern with variance

- [ ] Start new assessment with test client: `TEST_EDGE_MIXED`
- [ ] Domain 1 Subdomains: Mix of -2, -1, 0
- [ ] Domain 2 Subdomains: Mix of +1, +2, +3
- [ ] Complete assessment
- [ ] Verify gap analysis identifies Domain 1 as problematic
- [ ] Verify Domain 2 shows as healthier
- [ ] Check that insights reflect this imbalance

**Expected Results:**
- Clear domain gap identified
- Focused recommendations on Domain 1
- Acknowledgment of Domain 2 strengths

**Notes:**
_______________________________________________________________

---

### Test 2.4: Validation Testing
**Objective:** Test form validation rules

#### Missing Required Fields
- [ ] Start subdomain page
- [ ] Leave 1 scale question unanswered
- [ ] Try to submit
- **Expected:** Validation error, cannot proceed

#### Zero Value Testing
- [ ] Select 0 (neutral) for all questions in one subdomain
- [ ] Try to submit
- **Expected:** Should allow (0 is valid)

#### Open Response Minimum
- [ ] Enter only 10 characters in open response
- [ ] Try to continue
- **Expected:** May warn but should allow (no strict minimum in tests)

#### Character Limit Testing
- [ ] Paste 3,000 characters into open response field
- **Expected:** Field limits to 2,000 characters or shows error

**Notes:**
_______________________________________________________________

---

## 🧪 Test Scenario 3: GPT Integration Testing

### Test 3.1: Normal GPT Flow
**Objective:** Verify GPT insights generate successfully

- [ ] Ensure OpenAI API key is set in Script Properties
- [ ] Start assessment: `TEST_GPT_NORMAL`
- [ ] Complete all subdomains with varied, realistic responses
- [ ] Include detailed open responses (100+ characters each)
- [ ] Submit final page
- [ ] Monitor Apps Script execution log for GPT calls
- [ ] Verify report shows GPT-generated content (not fallbacks)

**How to Identify GPT vs Fallback:**
- GPT insights are personalized to responses
- Fallbacks are generic/templated
- Check GPT_FALLBACK_LOG sheet for entries

**Expected:**
- 6 subdomain mini-insights (from during-form calls)
- 3 synthesis insights (domain1, domain2, overall)
- No entries in GPT_FALLBACK_LOG
- Processing time: 30-90 seconds

**Notes:**
_______________________________________________________________

---

### Test 3.2: Fallback System Testing
**Objective:** Verify fallbacks work when GPT unavailable

#### Setup
- [ ] Open Apps Script editor
- [ ] Go to Project Settings → Script Properties
- [ ] Temporarily remove or rename OpenAI API key
  - Option 1: Rename key to `OPENAI_API_KEY_DISABLED`
  - Option 2: Delete key temporarily

#### Test
- [ ] Start assessment: `TEST_GPT_FALLBACK`
- [ ] Complete all subdomains
- [ ] Submit
- [ ] Verify report still generates (using fallbacks)
- [ ] Check GPT_FALLBACK_LOG sheet for entries
- [ ] Verify fallback content is appropriate for score levels

**Expected:**
- Report generates successfully
- Fallback insights present (generic but relevant)
- GPT_FALLBACK_LOG shows 9 entries (6 subdomain + 2 domain + 1 overall)
- Faster processing time (<10 seconds)

#### Cleanup
- [ ] Restore OpenAI API key to original value

**Notes:**
_______________________________________________________________

---

## 🧪 Test Scenario 4: Data Persistence & Retrieval

### Test 4.1: Data Saves Correctly
**Objective:** Verify responses save to spreadsheet

- [ ] Open Master Spreadsheet
- [ ] Navigate to RESPONSES sheet
- [ ] Note current row count: __________
- [ ] Complete assessment: `TEST_DATA_SAVE`
- [ ] After submission, check RESPONSES sheet
- [ ] Verify new row(s) added
- [ ] Check data fields:
  - [ ] Client ID correct
  - [ ] Tool ID = 'tool3'
  - [ ] Timestamp present
  - [ ] All scale responses saved (24 values)
  - [ ] All open responses saved (6 values)
  - [ ] Scoring results saved (JSON)
  - [ ] GPT insights saved (JSON)

**Notes:**
_______________________________________________________________

---

### Test 4.2: Report Regeneration
**Objective:** Test report regeneration from saved data

- [ ] From dashboard, find completed Tool 3 assessment
- [ ] Click "View Report" or "Regenerate Report"
- [ ] Verify report loads from saved data
- [ ] Compare to original report (should be identical)
- [ ] Check all scores match
- [ ] Verify insights preserved

**Notes:**
_______________________________________________________________

---

## 🧪 Test Scenario 5: UI/UX & Accessibility

### Visual Design
- [ ] Color scheme consistent across all pages
- [ ] TruPath branding visible (logo, colors)
- [ ] Dark theme applied correctly (if applicable)
- [ ] Text contrast meets WCAG AA standards
- [ ] Spacing and padding appropriate
- [ ] No layout shifts during loading

### Responsive Design
Test on multiple screen sizes:

**Desktop (1920x1080)**
- [ ] All content visible without horizontal scroll
- [ ] Forms laid out properly
- [ ] Buttons accessible

**Tablet (768x1024)**
- [ ] Layout adapts gracefully
- [ ] Touch targets large enough (44x44px minimum)
- [ ] Text remains readable

**Mobile (375x667)**
- [ ] Single column layout
- [ ] All interactive elements accessible
- [ ] No content cut off
- [ ] Scrolling smooth

### Keyboard Navigation
- [ ] Tab through all form fields in logical order
- [ ] Radio buttons selectable via keyboard (arrow keys)
- [ ] Textarea accessible via tab
- [ ] Submit button reachable via tab
- [ ] Enter key submits form
- [ ] No keyboard traps

### Loading States
- [ ] Loading animation displays during processing
- [ ] User cannot double-submit during processing
- [ ] Progress indication clear
- [ ] Timeout handling (if processing takes >2 minutes)

**Notes:**
_______________________________________________________________

---

## 🧪 Test Scenario 6: Error Handling

### Test 6.1: Network Interruption
- [ ] Start assessment
- [ ] Complete 3 subdomains
- [ ] Disconnect internet
- [ ] Try to submit next subdomain
- **Expected:** Error message, opportunity to retry
- [ ] Reconnect internet
- [ ] Verify can resume/retry

**Notes:**
_______________________________________________________________

---

### Test 6.2: Session Timeout
- [ ] Start assessment
- [ ] Complete 2 subdomains
- [ ] Wait 30+ minutes (or trigger session timeout)
- [ ] Try to submit next subdomain
- **Expected:** Session warning or re-authentication prompt
- [ ] Verify data not lost after re-auth

**Notes:**
_______________________________________________________________

---

### Test 6.3: Invalid Page Access
- [ ] Try to access page 0: `?route=tool3&client=TEST&page=0`
  - **Expected:** Error message
- [ ] Try to access page 8: `?route=tool3&client=TEST&page=8`
  - **Expected:** Error message
- [ ] Try to access page without client ID: `?route=tool3&page=2`
  - **Expected:** Error or redirect

**Notes:**
_______________________________________________________________

---

## 📊 Data Verification Checklist

### Spreadsheet Validation
After completing test assessments, verify in Master Spreadsheet:

**RESPONSES Sheet:**
- [ ] All test client IDs present
- [ ] Row structure correct (no misaligned columns)
- [ ] No duplicate entries for same assessment
- [ ] Timestamps accurate
- [ ] JSON data parseable (no malformed JSON)

**ACTIVITY_LOG Sheet:**
- [ ] Assessment start logged
- [ ] Page submissions logged
- [ ] Assessment completion logged
- [ ] No error entries (or expected errors only)

**GPT_FALLBACK_LOG Sheet (if exists):**
- [ ] Fallback entries logged when API disabled
- [ ] No entries during normal GPT operation
- [ ] Timestamps and reasons recorded

**Notes:**
_______________________________________________________________

---

## 🐛 Bug Tracking

### Issues Found

| # | Severity | Page/Feature | Description | Reproducible? | Status |
|---|----------|--------------|-------------|---------------|---------|
| 1 |          |              |             | Y/N           |         |
| 2 |          |              |             | Y/N           |         |
| 3 |          |              |             | Y/N           |         |
| 4 |          |              |             | Y/N           |         |
| 5 |          |              |             | Y/N           |         |

**Severity Levels:**
- **Critical:** Blocks completion, data loss, security issue
- **High:** Major feature broken, poor user experience
- **Medium:** Minor feature issue, workaround available
- **Low:** Cosmetic, documentation, enhancement

---

## ✅ Final Sign-Off

### Test Summary

**Total Test Scenarios:** 6
**Scenarios Passed:** ____ / 6
**Total Checks:** ~150+
**Checks Passed:** ____ / ____
**Success Rate:** ______%

### Critical Issues
- [ ] No critical issues found
- [ ] Critical issues documented above

### Recommendation
- [ ] ✅ **APPROVED for Production** - All tests passed, no critical issues
- [ ] ⚠️ **APPROVED with Minor Issues** - Can deploy, track issues for future fix
- [ ] ❌ **NOT APPROVED** - Critical issues must be resolved before deployment

### Tester Sign-Off
**Name:** _______________________________
**Date:** _______________________________
**Signature:** _______________________________

### Additional Notes
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

**END OF MANUAL TESTING PLAN**
