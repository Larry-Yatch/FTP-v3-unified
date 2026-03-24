# Browser Refresh Recovery - Test Plan

## Overview
This test plan validates the browser refresh recovery feature that restores users to their correct location when they press the browser refresh button in the Google Apps Script (GAS) application.

## Key Components
- `shared/history-manager.html` - Core refresh detection and recovery logic
- `core/FormUtils.js` - Location persistence during form navigation
- `core/Router.js` - Location persistence during dashboard navigation

---

## Manual Testing Scenarios

### Test Group 1: Multi-Page Tool Navigation (Tool 1, 2, 3, 5, 7)

#### Test 1.1: Refresh on Page 2+ of a Tool
**Steps:**
1. Login and go to Dashboard
2. Start Tool 1 (or any multi-page tool)
3. Complete Page 1, navigate to Page 2
4. Complete Page 2, navigate to Page 3
5. Press browser Refresh button (F5 or Cmd+R)

**Expected Result:**
- Should show "Restoring your place..." loading message
- Should return to Page 3 (not Page 1)
- Console should log: `[HistoryManager] Refresh detected! User was on page 3 but URL loaded page 1`

#### Test 1.2: Refresh on Page 1 (No Recovery Needed)
**Steps:**
1. Login and go to Dashboard
2. Start Tool 1
3. On Page 1, press browser Refresh button

**Expected Result:**
- Should reload Page 1 normally
- Should NOT show "Restoring your place..." message
- No redirect should occur (stored page = current page)

#### Test 1.3: Refresh After Going Back to Earlier Page
**Steps:**
1. Login and start Tool 1
2. Navigate to Page 3
3. Use "Back to Page 2" button to go back
4. Press browser Refresh button

**Expected Result:**
- Should stay on Page 2 (not redirect to Page 3)
- The stored location should have been updated when navigating back

---

### Test Group 2: Report Page Refresh

#### Test 2.1: Refresh on Report Page
**Steps:**
1. Login and complete Tool 1 (or any tool with reports)
2. From Dashboard, click "View Report"
3. On the report page, press browser Refresh button

**Expected Result:**
- Should show "Restoring your place..." loading message
- Should return to the Report page
- Console should log: `[HistoryManager] Refresh detected! User was viewing report but URL loaded tool page`

#### Test 2.2: Refresh Report After Edit Navigation
**Steps:**
1. View a completed tool's report
2. Click "Edit Response" (goes to tool page)
3. Press browser Refresh button

**Expected Result:**
- Should stay on the tool edit page (not go back to report)
- Location was updated when Edit was clicked

---

### Test Group 3: Dashboard Refresh

#### Test 3.1: Refresh on Dashboard
**Steps:**
1. Login and navigate to Dashboard
2. Press browser Refresh button

**Expected Result:**
- Should reload Dashboard normally
- No redirect should occur
- Dashboard should display correctly

#### Test 3.2: Dashboard After Tool Completion
**Steps:**
1. Complete a tool and return to Dashboard
2. Press browser Refresh button

**Expected Result:**
- Should stay on Dashboard
- Location was updated when returning to Dashboard

---

### Test Group 4: Calculator Tools (Tool 4, Tool 6)

#### Test 4.1: Refresh on Calculator Tool
**Steps:**
1. From Dashboard, open Tool 4 (Financial Calculator)
2. Enter some values in the calculator
3. Press browser Refresh button

**Expected Result:**
- Should return to calculator page
- Note: Calculator state may not be preserved (that's a separate feature)

#### Test 4.2: Refresh Tool 6 with Saved Data
**Steps:**
1. From Dashboard, open Tool 6 (Retirement Blueprint)
2. Complete questionnaire, view calculator
3. Press browser Refresh button

**Expected Result:**
- Should return to the calculator view
- Saved data should reload from server

---

### Test Group 5: Edge Cases

#### Test 5.1: Location Expiration (30 minutes)
**Steps:**
1. Navigate to Tool 1 Page 3
2. Wait 30+ minutes (or manually modify sessionStorage timestamp)
3. Press browser Refresh button

**Expected Result:**
- Should NOT redirect (location expired)
- Console should log: `[HistoryManager] Stored location expired, clearing`
- Should load from URL normally

#### Test 5.2: Cross-Tool Navigation (No False Redirect)
**Steps:**
1. Start Tool 1, navigate to Page 3
2. Use Dashboard button to go back to Dashboard
3. Start Tool 2, navigate to Page 2
4. Press browser Refresh button

**Expected Result:**
- Should stay on Tool 2 Page 2
- Should NOT redirect to Tool 1 Page 3

#### Test 5.3: Logout Clears Location
**Steps:**
1. Navigate to Tool 1 Page 3
2. Click Logout button
3. Login again with same or different user
4. Press browser Refresh button

**Expected Result:**
- Should NOT redirect to previous location
- sessionStorage should have been cleared on logout

#### Test 5.4: Different Client ID
**Steps:**
1. Login as User A, navigate to Tool 1 Page 3
2. Logout
3. Login as User B
4. Press browser Refresh button

**Expected Result:**
- Should NOT redirect (clientId mismatch)
- User B should see their own state

---

### Test Group 6: Browser Back Button + Refresh Interaction

#### Test 6.1: Back Button Then Refresh
**Steps:**
1. Dashboard → Tool 1 Page 1 → Page 2 → Page 3
2. Press browser Back button (should go to Page 2)
3. Press browser Refresh button

**Expected Result:**
- Should stay on Page 2 (not Page 3)
- Back button navigation should have updated stored location

#### Test 6.2: Forward Button Then Refresh
**Steps:**
1. Dashboard → Tool 1 Page 1 → Page 2 → Page 3
2. Press browser Back button twice (to Dashboard)
3. Press browser Forward button twice (back to Page 3)
4. Press browser Refresh button

**Expected Result:**
- Should stay on Page 3
- Forward navigation should have updated stored location

---

## Programmatic Testing

### Console-Based Tests

These can be run from browser DevTools console:

```javascript
// Test 1: Verify sessionStorage is being set
// Run after navigating to a tool page
function testLocationSaved() {
  const stored = sessionStorage.getItem('_ftpCurrentLocation');
  if (!stored) {
    console.error('FAIL: No location stored');
    return false;
  }
  const location = JSON.parse(stored);
  console.log('Location stored:', location);
  console.assert(location.view, 'view should be set');
  console.assert(location.timestamp, 'timestamp should be set');
  console.assert(location.clientId, 'clientId should be set');
  console.log('PASS: Location saved correctly');
  return true;
}

// Test 2: Verify location format
function testLocationFormat() {
  const stored = sessionStorage.getItem('_ftpCurrentLocation');
  if (!stored) {
    console.error('FAIL: No location to test');
    return false;
  }
  const location = JSON.parse(stored);

  // Check required fields
  const requiredFields = ['view', 'timestamp', 'clientId'];
  for (const field of requiredFields) {
    if (location[field] === undefined) {
      console.error(`FAIL: Missing required field: ${field}`);
      return false;
    }
  }

  // Check valid view types
  const validViews = ['dashboard', 'tool', 'report'];
  if (!validViews.includes(location.view)) {
    console.error(`FAIL: Invalid view type: ${location.view}`);
    return false;
  }

  // For tool view, check toolId and page
  if (location.view === 'tool') {
    if (!location.toolId) {
      console.error('FAIL: Tool view missing toolId');
      return false;
    }
    if (!location.page) {
      console.error('FAIL: Tool view missing page');
      return false;
    }
  }

  // For report view, check toolId
  if (location.view === 'report') {
    if (!location.toolId) {
      console.error('FAIL: Report view missing toolId');
      return false;
    }
  }

  console.log('PASS: Location format is valid');
  return true;
}

// Test 3: Verify expiration logic
function testExpiration() {
  // Save a location with old timestamp
  const oldLocation = {
    view: 'tool',
    toolId: 'tool1',
    page: 3,
    clientId: 'test-client',
    timestamp: Date.now() - (31 * 60 * 1000) // 31 minutes ago
  };
  sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify(oldLocation));

  // Try to get it (should return null due to expiration)
  // Note: This requires access to getStoredLocation which is private
  // Instead, check if the page redirects or not after refresh
  console.log('Set expired location. Refresh page to verify no redirect occurs.');
  return true;
}

// Test 4: Verify clearStoredLocation works
function testClearLocation() {
  // First save something
  saveLocationForRefresh('tool', 'tool1', 2, 'test-client');

  // Verify it's saved
  if (!sessionStorage.getItem('_ftpCurrentLocation')) {
    console.error('FAIL: Could not save location');
    return false;
  }

  // Clear it
  clearStoredLocation();

  // Verify it's cleared
  if (sessionStorage.getItem('_ftpCurrentLocation')) {
    console.error('FAIL: Location not cleared');
    return false;
  }

  console.log('PASS: clearStoredLocation works');
  return true;
}

// Run all tests
function runAllTests() {
  console.log('=== Running Refresh Recovery Tests ===');
  testLocationSaved();
  testLocationFormat();
  testClearLocation();
  console.log('=== Tests Complete ===');
}

// Execute: runAllTests();
```

### Automated E2E Testing (Puppeteer/Playwright)

If E2E testing framework is available:

```javascript
// Example Playwright test structure
import { test, expect } from '@playwright/test';

test.describe('Browser Refresh Recovery', () => {

  test('should restore tool page after refresh', async ({ page }) => {
    // Login
    await page.goto('YOUR_GAS_URL');
    await page.fill('#email', 'test@example.com');
    await page.click('button[type="submit"]');

    // Navigate to Tool 1
    await page.click('text=Start Assessment');
    await page.waitForSelector('form[id*="Page1"]');

    // Fill and submit Page 1
    // ... fill form fields ...
    await page.click('button[type="submit"]');
    await page.waitForSelector('form[id*="Page2"]');

    // Fill and submit Page 2
    // ... fill form fields ...
    await page.click('button[type="submit"]');
    await page.waitForSelector('form[id*="Page3"]');

    // Get current page indicator
    const beforeRefresh = await page.textContent('.progress-container');
    expect(beforeRefresh).toContain('Page 3');

    // Refresh the page
    await page.reload();

    // Wait for potential redirect
    await page.waitForTimeout(2000);

    // Verify we're still on Page 3
    const afterRefresh = await page.textContent('.progress-container');
    expect(afterRefresh).toContain('Page 3');
  });

  test('should not redirect when on page 1', async ({ page }) => {
    // ... similar structure, verify no redirect on Page 1
  });

  test('should clear location on logout', async ({ page }) => {
    // Navigate deep into a tool
    // Logout
    // Login again
    // Verify no redirect to previous location
  });
});
```

---

## Test Results Template

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| 1.1 | Refresh on Page 2+ | | |
| 1.2 | Refresh on Page 1 | | |
| 1.3 | Refresh after going back | | |
| 2.1 | Refresh on Report | | |
| 2.2 | Refresh after Edit | | |
| 3.1 | Refresh on Dashboard | | |
| 3.2 | Dashboard after completion | | |
| 4.1 | Refresh on Calculator | | |
| 4.2 | Refresh Tool 6 | | |
| 5.1 | Location expiration | | |
| 5.2 | Cross-tool navigation | | |
| 5.3 | Logout clears location | | |
| 5.4 | Different client ID | | |
| 6.1 | Back then Refresh | | |
| 6.2 | Forward then Refresh | | |

---

## Debugging Tips

### Check Current Stored Location
```javascript
JSON.parse(sessionStorage.getItem('_ftpCurrentLocation'))
```

### Clear Stored Location
```javascript
sessionStorage.removeItem('_ftpCurrentLocation')
```

### Force Expired Location (for testing)
```javascript
const loc = JSON.parse(sessionStorage.getItem('_ftpCurrentLocation'));
loc.timestamp = Date.now() - (31 * 60 * 1000);
sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify(loc));
```

### Monitor History Manager Logs
All HistoryManager actions are logged with `[HistoryManager]` prefix. Open Console and filter by "HistoryManager" to see all activity.

---

## Known Limitations

1. **Calculator state not preserved**: Tool 4 and Tool 6 calculator values may not survive refresh (depends on server-side data persistence)

2. **Very fast refresh**: If user refreshes faster than the location save can complete, they may not be redirected

3. **Private/Incognito mode**: sessionStorage works but is cleared when window closes

4. **Cross-tab behavior**: Each tab has its own sessionStorage, so location is per-tab
