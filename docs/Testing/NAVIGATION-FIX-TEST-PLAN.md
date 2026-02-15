# Navigation Fix Testing Plan

**Created:** 2026-02-04
**Purpose:** Validate all navigation fixes from commits e3a75ed, 27246d2, 9610639

---

## Summary of Fixes

1. **Tool7 PDF Generation** - Fixed routing to correct PDF function
2. **Error Page Navigation** - Replaced `window.location.href` in Tool3/5/7 error pages
3. **Dashboard Navigation** - Replaced 30+ `window.top.location.href` instances in Router.js

---

## Test Environment Setup

### Prerequisites
- Access to the deployed GAS web app
- Test client account with various tool states (completed, draft, not started)
- Browser DevTools open (Console tab) to monitor for errors

### Expected Behavior
- **NO** `SecurityError` messages in console
- **NO** white screens after button clicks
- Smooth transitions between pages

---

## Part 1: PDF Generation Tests

### Test 1.1: Tool3 PDF Download
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Complete Tool3 assessment (or use existing completion) | Tool3 marked complete |
| 2 | Navigate to Tool3 Report | Report displays correctly |
| 3 | Click "Download PDF" button | PDF downloads |
| 4 | Open downloaded PDF | **Content is Tool3-specific** (Identity & Validation themes) |

### Test 1.2: Tool5 PDF Download
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Complete Tool5 assessment (or use existing completion) | Tool5 marked complete |
| 2 | Navigate to Tool5 Report | Report displays correctly |
| 3 | Click "Download PDF" button | PDF downloads |
| 4 | Open downloaded PDF | **Content is Tool5-specific** (Love & Connection themes) |

### Test 1.3: Tool7 PDF Download (PRIMARY FIX)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Complete Tool7 assessment (or use existing completion) | Tool7 marked complete |
| 2 | Navigate to Tool7 Report | Report displays correctly |
| 3 | Click "Download PDF" button | PDF downloads |
| 4 | Open downloaded PDF | **Content is Tool7-specific** (Security & Control themes) |

**CRITICAL CHECK:** Tool7 PDF must NOT contain Tool5 content. Look for:
- Tool7-specific category names
- "Security & Control" terminology (not "Love & Connection")

---

## Part 2: Dashboard Navigation Tests

### Test 2.1: Tool1 Navigation (All States)

#### 2.1a: Completed State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | From dashboard, click "View Report" on Tool1 | Report loads, no console errors |
| 2 | Return to dashboard | Dashboard loads smoothly |
| 3 | Click "Edit Response" | Tool1 loads in edit mode |
| 4 | Return to dashboard | Dashboard loads smoothly |
| 5 | Click "Start Fresh" | Confirmation dialog appears |
| 6 | Confirm | Tool1 page 1 loads with cleared draft |

#### 2.1b: Draft State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start Tool1, answer some questions, return to dashboard | Draft state shown |
| 2 | Click "Continue" | Tool1 loads with draft data |
| 3 | Return to dashboard | Dashboard loads smoothly |
| 4 | Click "Discard Draft" | Confirmation dialog appears |
| 5 | Confirm | Dashboard reloads, Tool1 shows "Ready" state |

#### 2.1c: Not Started State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Start Assessment" | Tool1 page 1 loads |

### Test 2.2: Tool2 Navigation
_Repeat same test pattern as 2.1 for Tool2_

| State | Buttons to Test |
|-------|-----------------|
| Completed | View Report, Edit Response, Start Fresh |
| Draft | Continue, Discard Draft |
| Not Started | Start Assessment |

### Test 2.3: Tool3 Navigation
_Repeat same test pattern as 2.1 for Tool3_

### Test 2.4: Tool4 Navigation

#### 2.4a: Completed State (has saved scenario)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "View Calculator" | Calculator loads with saved data |

#### 2.4b: Ready State (no saved scenario)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Open Calculator" | Calculator loads fresh |

### Test 2.5: Tool5 Navigation
_Repeat same test pattern as 2.1 for Tool5_

### Test 2.6: Tool6 Navigation

| State | Buttons to Test | Expected Result |
|-------|-----------------|-----------------|
| Completed | View Results, Open Calculator | Loads without white screen |
| Ready | Open Calculator | Calculator loads |

### Test 2.7: Tool7 Navigation
_Repeat same test pattern as 2.1 for Tool7_

---

## Part 3: Error Page Navigation Tests

These tests require triggering error conditions. Options:
1. Temporarily modify server code to throw errors
2. Use browser DevTools to simulate network failures

### Test 3.1: Tool3 Error Page
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Trigger error in Tool3 | Error page displays |
| 2 | Click "Return to Dashboard" | Dashboard loads (no white screen) |
| 3 | Check console | No SecurityError messages |

### Test 3.2: Tool5 Error Page
_Same as 3.1 for Tool5_

### Test 3.3: Tool7 Error Page
_Same as 3.1 for Tool7_

---

## Part 4: Logout Navigation Test

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | From any page, click Logout | Login page loads |
| 2 | Check console | No SecurityError messages |

---

## Part 5: Console Error Monitoring

### What to Watch For

**PASS Criteria:**
- No `SecurityError` messages
- No `Failed to set a named property 'href' on 'Location'` errors
- No white screens after any button click

**Known Acceptable Patterns:**
- The logout function has a fallback `window.top.location.replace()` that may show briefly if the primary method fails - this is intentional

### Quick Validation Script (Browser Console)

Paste this in browser console before testing to monitor navigation errors:

```javascript
// Monitor for navigation security errors
(function() {
  const originalError = console.error;
  console.error = function(...args) {
    const msg = args.join(' ');
    if (msg.includes('SecurityError') || msg.includes('Location')) {
      alert('NAVIGATION ERROR DETECTED: ' + msg);
    }
    originalError.apply(console, args);
  };
  console.log('Navigation error monitor active');
})();
```

---

## Part 6: Programmatic Testing Options

### Option A: GAS Unit Tests (Server-Side)

Create test functions in GAS to verify NavigationHelpers return valid HTML:

```javascript
function testNavigationHelpers() {
  const testClientId = 'TEST_CLIENT_ID'; // Use a real test client

  const tests = [
    { name: 'getDashboardPage', fn: () => NavigationHelpers.getDashboardPage(testClientId) },
    { name: 'getLoginPage', fn: () => NavigationHelpers.getLoginPage('test') },
    { name: 'getReportPage tool1', fn: () => NavigationHelpers.getReportPage(testClientId, 'tool1') },
    { name: 'getReportPage tool7', fn: () => NavigationHelpers.getReportPage(testClientId, 'tool7') },
    { name: 'getToolPageHtml tool7', fn: () => NavigationHelpers.getToolPageHtml('tool7', testClientId, 1) },
  ];

  const results = [];
  tests.forEach(test => {
    try {
      const html = test.fn();
      const hasContent = html && html.length > 100;
      const hasDoctype = html.includes('<!DOCTYPE') || html.includes('<html');
      results.push({
        name: test.name,
        pass: hasContent && hasDoctype,
        length: html ? html.length : 0
      });
    } catch (e) {
      results.push({ name: test.name, pass: false, error: e.toString() });
    }
  });

  Logger.log(JSON.stringify(results, null, 2));
  return results;
}
```

### Option B: Puppeteer/Playwright E2E Tests

For automated browser testing, create a test suite that:

1. Logs into the application
2. Clicks each navigation button
3. Verifies no console errors
4. Verifies page content loaded

Example structure (would need implementation):

```javascript
// e2e/navigation.test.js
describe('Navigation Tests', () => {
  beforeEach(async () => {
    await page.goto(APP_URL);
    await login(TEST_USER);
  });

  test('Tool7 report navigation works', async () => {
    // Setup: ensure Tool7 is completed
    await page.click('[data-tool="tool7"] .view-report');
    await page.waitForSelector('.report-content');

    // Verify no console errors
    const errors = await getConsoleErrors();
    expect(errors.filter(e => e.includes('SecurityError'))).toHaveLength(0);
  });

  test('Tool7 PDF downloads correct content', async () => {
    await navigateToTool7Report();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('.download-pdf')
    ]);

    const content = await parsePDF(download);
    expect(content).toContain('Security & Control');
    expect(content).not.toContain('Love & Connection');
  });
});
```

### Option C: Static Code Analysis

Run these grep checks to verify no forbidden patterns exist:

```bash
# Check for forbidden navigation patterns
echo "=== Checking for forbidden patterns ==="
grep -rn "window\.location\.reload\|location\.reload" tools/ core/

# Check for window.location.href (should be minimal/none)
echo "=== Checking for window.location.href ==="
grep -rn "window\.location\.href" tools/ core/

# Check for window.top.location (should only be logout fallback)
echo "=== Checking for window.top.location ==="
grep -rn "window\.top\.location" core/Router.js

# Verify NavigationHelpers has all required functions
echo "=== Verifying NavigationHelpers functions ==="
grep -n "getDashboardPage\|getLoginPage\|getReportPage\|getToolPageHtml\|getToolPageWithOptions\|discardDraftAndGetDashboard" shared/NavigationHelpers.js
```

---

## Quick Smoke Test Checklist

For rapid validation, test these critical paths:

- [ ] Tool7 PDF downloads with correct content (not Tool5)
- [ ] Tool7 "View Report" button works from dashboard
- [ ] Tool7 "Edit Response" button works from dashboard
- [ ] Tool7 "Discard Draft" button works (if draft exists)
- [ ] Logout button works
- [ ] No SecurityError messages in console during any navigation
- [ ] No white screens on any button click

---

## Test Results Template

```
Date: ___________
Tester: ___________
Environment: ___________

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| 1.3 Tool7 PDF | | |
| 2.7 Tool7 Nav | | |
| 4. Logout | | |
| 5. No Console Errors | | |

Issues Found:
-

Overall Result: PASS / FAIL
```
