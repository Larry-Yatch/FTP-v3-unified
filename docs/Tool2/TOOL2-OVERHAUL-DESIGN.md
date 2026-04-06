# Tool 2 Overhaul Design Document
**For AI Coding Agent Implementation**

---

## Agent Session Protocol

**You are an autonomous coding agent executing this plan. The human is present, watching, and will confirm before you move to the next phase.**

### Before Starting Any Phase
1. **Verify clasp is authorized**: Run `clasp status` in the terminal. If it fails or returns an auth error, stop and ask the human to run `clasp login` before proceeding.
2. **Read the current state** of every file listed in that phase's "Read before starting" block. Do not rely on memory or previous reads — files may have changed since this document was written.
3. **Re-read the phase's full task list.**
4. **Reassess**: Does anything in the current file state conflict with or require adjusting the plan? If yes, state the conflict clearly before writing any code. Do not silently adapt and proceed.
5. **Confirm with the human** that you are ready to begin.

### After Completing Any Phase
1. Run the test protocol listed in the phase.
2. If any test step fails, fix it and re-run the test protocol. Repeat until all steps pass. Do not move on with known failures.
3. Report results to the human: what passed, what required iteration, what was unexpected.
4. **Update the Phase Status table** in Section 13 — change the phase status to `✅ COMPLETE`.
5. **Wait for human confirmation** before starting the next phase. The human will do their own manual check before giving the go-ahead.

### If You Hit a Problem Mid-Phase
- Stop and report to the human immediately. Do not silently work around the design doc.
- If the design doc is wrong or outdated for the current codebase, flag it. The human will decide whether to update the doc or adjust the approach.

### Testing Infrastructure (Desktop Claude Code)

**Deploying code:**
- Run `clasp push` from the terminal in the project root.
- `clasp push` updates the HEAD deployment only. The stable versioned deployment that students use is unaffected — you can push and test freely without touching live student traffic.
- Get the HEAD deployment URL by running `clasp deployments` — use the entry marked `@HEAD`.

**Verifying response data (use MCP, not the browser):**
- Master Sheet ID: found in `Config.js` as `CONFIG.MASTER_SHEET_ID`
- Use the MCP Google Drive tools (`mcp__google-drive__getGoogleSheetContent`) to read the RESPONSES sheet directly — faster and more reliable than browser navigation.
- RESPONSES sheet column order (zero-indexed): `Timestamp(0)`, `Client_ID(1)`, `Tool_ID(2)`, `Data(3)`, `Status(4)`, `Is_Latest(5)`
- Filter by `Client_ID` and `Tool_ID` = `tool2`, then parse the `Data` column as JSON to inspect saved fields.

**Browser testing (web app):**
- Navigate to the `@HEAD` deployment URL in the browser.
- The app is deployed as public (anyone can access). Login is via student ID on the login screen — no Google account switching needed. Enter the test student ID directly.
- Use browser DevTools console to check for JavaScript errors after each page load.

**Test student for this implementation session:** `0000AI` (AI Test Student) — created fresh with tool1 unlocked, tools 2–8 locked, zero history. After Tool 1 implementation is complete and `0000AI` has completed Tool 1, tool2 will auto-unlock and this same student can be used for all Tool 2 testing.

---

## 0. Before You Start

### GAS Execution Context
All scoring and data processing functions run **server-side** in Google Apps Script. There is no client-side JavaScript for scoring. The rendering pipeline is:
1. Server: `processFinalSubmission()` computes all scores → saves JSON to RESPONSES sheet
2. Server: `Tool2Report.render(clientId)` reads saved JSON → returns HTML string
3. Client: receives the HTML string via `document.write()` pattern

Never put scoring logic in client-side `<script>` tags. Never use `window.*` or DOM APIs in scoring functions.

### Template Literal Safety
All HTML generation happens inside GAS template literals (backticks). Per CLAUDE.md rules:
- Use `"do not"` not `"don't"` in strings
- Use double quotes for strings that need apostrophes: `"user's score"`
- Never use escaped apostrophes: `'user\'s'` will cause syntax errors

### Navigation Pattern
All page transitions use `document.write()`. Never use `window.location.reload()` or `window.location.href`. See `docs/Navigation/GAS-NAVIGATION-RULES.md`.

If navigation must break out of the GAS iframe entirely (e.g., "Return to Dashboard" after a document.write() chain), use `window.top.location.href`, NOT `window.location.href`.

### Back Navigation (Required on All Pages 2–5)
Every page except Page 1 must include a back button using the `document.write()` pattern. Never use `history.back()` or `window.location.href` for back navigation. Use this pattern:
```javascript
function goBackToPageX(clientId) {
  showLoading('Loading Page X...');
  google.script.run
    .withSuccessHandler(function(pageHtml) {
      if (pageHtml) { document.open(); document.write(pageHtml); document.close(); }
      else { hideLoading(); alert('Error loading page.'); }
    })
    .withFailureHandler(function(err) { hideLoading(); alert('Navigation error: ' + err.message); })
    .getToolPageHtml('tool2', clientId, X);
}
```
Reference: `docs/TOOL-DEVELOPMENT-PATTERNS.md` back navigation section.

### Required HTML Includes
Every page rendered by Tool 2 MUST include these in the HTML head:
```
<?!= include('shared/styles') ?>
<?!= include('shared/loading-animation') ?>
```
Missing `loading-animation` causes `ReferenceError: navigateToDashboard is not defined` and `showLoading is not defined` in production. This has broken tools before.

### Draft Saving Pattern
Tool 2 is a multi-page form. Drafts MUST be saved on every page transition, not just final submission. Use `DraftService`, not `PropertiesService` directly:
```javascript
DraftService.saveDraft('tool2', clientId, page, formData);  // ✅ correct
PropertiesService.getUserProperties().setProperty(...);     // ❌ wrong — bypasses shared utility
```
LESSONS-LEARNED: "Multi-page form tools must call saveDraft() on every page transition, not just page 1."

### Edit Mode (Existing Behavior — Do Not Break)
When a student re-submits Tool 2 in edit mode, the EDIT_DRAFT row in the RESPONSES sheet must be **deleted** (`sheet.deleteRow()`), not marked inactive. Marking it inactive causes infinite "draft in progress" loops. Do not change this behavior.

### google.script.run null-check (Required)
All `withSuccessHandler` callbacks must null-check before accessing properties:
```javascript
.withSuccessHandler(function(result) {
  if (!result) { alert('Server returned no data. Please refresh.'); return; }
  // ... rest of logic
})
```

### File to Read Before Any Phase
Always read the current version of the file you are modifying before editing. Read `core/FormUtils.js` to understand the `buildStandardPage()` pipeline before modifying form pages.

---

## 1. Overview & Context

### What Tool 2 Is Becoming
Tool 2 is being redesigned from a pure subjective clarity assessment into the **Financial Mirror** — a dual-track assessment that captures both objective financial reality and subjective emotional perception per domain, then surfaces the gap between them as the primary diagnostic insight.

The gap between what a person believes about their finances and what their finances actually show is where trauma patterns manifest. This tool quantifies that gap and cross-references it against the student's Tool 1 psychological profile to produce personalized, trauma-informed financial insights.

### Why This Overhaul
- Tool 2 was built before Tools 4, 6, and 8 were designed. It collected no actual financial data, forcing those tools to re-ask for financial facts.
- The correlations layer (`core/CollectiveResults.js`) currently has no objective financial data to work with — only subjective domain scores.
- The current 57-question format is too long and does not produce the gap analysis that gives this tool its unique value.

### Scope of This Document
- Full vs. Light mode architecture
- Complete question specification (field names, types, page layout)
- Financial benchmarks used for objective scoring
- Scoring algorithm for all three tracks (objective, subjective, gap)
- Tool 1 integration specification
- Scarcity flag logic
- Report structure and gap narrative templates
- GPT prompt specification
- Data model (exact fields saved to RESPONSES sheet)
- Downstream pre-population spec for Tools 4, 6, 8
- Changes required in `CollectiveResults.js`
- Implementation phases with per-phase reading lists and test fixtures

### Cross-Reference
Tool 1 report improvements designed alongside this overhaul are in `docs/Tool1/TOOL1-IMPROVEMENTS-DESIGN.md`. Combination narrative templates in that doc are also used by Tool 2's report. Do not duplicate them — reference `Tool1Templates.COMBINATION_NARRATIVES` directly from `Tool2Report.js`.

---

## 2. Full vs. Light Mode Architecture

### Mode Toggle
- Presented on Page 1 after demographics, before financial questions
- Default: Full mode
- Toggle label: **"Switch to Quick Check-In (~15 min)"** / **"Switch to Full Assessment (~30 min)"**
- When toggled, Page 1 re-renders client-side (via JavaScript visibility toggle on subsequent page questions). The mode value is saved in the draft immediately on toggle.
- Mode is saved in draft data as field `assessmentMode: "full" | "light"`
- Both modes produce a complete report. The light report includes a callout: *"Complete the full assessment for deeper narrative insights."*

### Mode Toggle Mid-Form Behavior
If a student has saved draft data on pages 2+ in full mode and then toggles to light mode:
- Draft data already saved is **preserved** — do not delete full-mode fields from draft
- Light mode simply skips displaying the full-mode-only questions on remaining pages
- On submission, `assessmentMode` in the saved data determines which fields are used for scoring
- Full-mode fields that were answered before the toggle are still saved and scored if present

### Critical Architecture Rule
**Light mode always collects all objective financial data fields.** The "light" reduction comes from fewer subjective scale questions and no domain-specific free-text (except Page 5). Skipping objective data would break pre-population for Tools 4, 6, and 8.

### Question Count Targets
| Layer | Full Mode | Light Mode |
|-------|-----------|------------|
| Demographics | 8 | 5 |
| Global mindset (scarcity + relationship) | 3 | 2 |
| Objective financial data | 13 | 13 (same — required) |
| Subjective scales | 15 (3/domain) | 5 (1/domain) |
| Free-text | 4 | 1 |
| **Total** | **~43** | **~26** |

---

## 3. Page Structure

All pages use the existing `FormToolBase` / `FormUtils.buildStandardPage()` pipeline. Navigation uses the `document.write()` pattern per GAS navigation rules.

### Page Layout

| Page | Name | Full Mode Content | Light Mode Content |
|------|------|-------------------|--------------------|
| 1 | Identity & Foundation | Demographics (8Q) + mode toggle + scarcity/mindset (3Q) | Demographics (5Q) + mode toggle + scarcity (2Q) |
| 2 | Money Flow | Objective income/spending (3Q) + subjective scales (3Q) + free-text (1Q) | Objective (3Q) + 1 subjective scale |
| 3 | Obligations & Security | Objective debt/emergency (3Q) + subjective scales (3Q) + free-text (1Q) | Objective (3Q) + 1 subjective scale |
| 4 | Liquidity & Growth | Objective savings/retirement (3Q) + subjective scales (6Q) + free-text (1Q) | Objective (3Q) + 2 subjective scales |
| 5 | Protection & Reflection | Objective insurance (4 checkboxes) + subjective (3Q) + free-text (1Q) + adaptive (full only) | Objective (4 checkboxes) + 1 subjective scale + free-text (1Q) |

---

## 4. Complete Question Specification

All scale questions use a **-5 to +5 range with no zero** (existing convention — the UI renders -5, -4, -3, -2, -1, 1, 2, 3, 4, 5 with no zero option). Numeric dollar-amount fields accept integers only, `type="number"`, `min="0"`.

### PAGE 1 — Identity & Foundation

| Field Name | Label | Type | Range/Options | Modes |
|------------|-------|------|---------------|-------|
| `name` | Full Name | text | — | Both |
| `email` | Email Address | email | — | Both |
| `age` | Age | number | 18–99 | Both |
| `employment` | Employment Type | select | `w2-employee`, `self-employed`, `business-owner`, `full-time-with-business`, `part-time-with-business`, `retired`, `other` | Both |
| `businessStage` | Business Stage | select | `idea`, `startup`, `growing`, `established` | Both (conditional: show only if employment includes business) |
| `marital` | Marital Status | select | `single`, `married`, `partnered`, `divorced`, `widowed` | Full only |
| `dependents` | Number of Dependents | number | 0–20 | Full only |
| `living` | Living Situation | select | `own-home`, `renting`, `with-family`, `other` | Full only |
| `assessmentMode` | (hidden field) | hidden | `"full"` or `"light"` | Both |
| `holisticScarcity` | "In general, my overall sense of life feels..." (-5 = deeply scarce, +5 = deeply abundant) | scale | -5 to +5, no zero | Both |
| `financialScarcity` | "When it comes to money specifically, I feel..." (-5 = constant scarcity, +5 = abundant) | scale | -5 to +5, no zero | Both |
| `moneyRelationship` | "My overall relationship with money is..." (-5 = constant struggle, +5 = healthy partnership) | scale | -5 to +5, no zero | Full only |

---

### PAGE 2 — Money Flow

**Objective Financial Data (both modes — required)**

| Field Name | Label | Type | Notes |
|------------|-------|------|-------|
| `grossAnnualIncome` | Gross Annual Income (before taxes) | number | Integer dollars. Min 0. |
| `monthlyTakeHome` | Monthly Take-Home Pay (after taxes) | number | Integer dollars. Min 0. |
| `monthlySpending` | Estimated Monthly Total Spending (all expenses combined) | number | Integer dollars. Min 0. |

**Subjective Scales (full: 3, light: 1)**

| Field Name | Label | Type | Modes |
|------------|-------|------|-------|
| `incomeClarity` | "How clear are you on your total income picture?" (-5 = no idea, +5 = fully clear) | scale | Both |
| `spendingClarity` | "How clear are you on where your money goes each month?" (-5 = no idea, +5 = fully clear) | scale | Full only |
| `moneyFlowStress` | "How stressed do you feel about your income and spending?" (-5 = extremely stressed, +5 = completely at ease) | scale | Full only |

**Free-Text (full: 1, light: none)**

| Field Name | Label | Modes |
|------------|-------|-------|
| `incomeAndSpendingNarrative` | "Describe your primary income sources. What do you consider your biggest or most wasteful spending areas?" | Full only |

---

### PAGE 3 — Obligations & Security

**Objective Financial Data (both modes — required)**

| Field Name | Label | Type | Notes |
|------------|-------|------|-------|
| `totalDebtBalance` | Total Outstanding Debt Balance (do not include your mortgage) | number | Integer dollars. Enter 0 if none. |
| `monthlyDebtPayments` | Monthly Minimum Debt Payments (do not include mortgage payment) | number | Integer dollars. Enter 0 if none. |
| `emergencyFundBalance` | Emergency Fund Balance (money set aside specifically for emergencies) | number | Integer dollars. Enter 0 if none. |

**Subjective Scales (full: 3, light: 1)**

| Field Name | Label | Type | Modes |
|------------|-------|------|-------|
| `debtClarity` | "How clear are you on your total debt situation?" (-5 = no idea, +5 = fully clear) | scale | Both |
| `debtTrending` | "Your debt balance is currently..." (-5 = growing quickly, +5 = shrinking quickly) | scale | Full only |
| `obligationsStress` | "How stressed do you feel about your debt and emergency fund?" (-5 = extremely stressed, +5 = completely at ease) | scale | Full only |

**Free-Text (full: 1, light: none)**

| Field Name | Label | Modes |
|------------|-------|-------|
| `debtNarrative` | "List your significant debts (type and approximate balance). Describe your current strategy for managing them." | Full only |

---

### PAGE 4 — Liquidity & Growth

**Objective Financial Data (both modes — required)**

| Field Name | Label | Type | Notes |
|------------|-------|------|-------|
| `liquidSavings` | Liquid Savings beyond your emergency fund (accessible within 1-2 days) | number | Integer dollars. Enter 0 if none. |
| `totalRetirementBalance` | Total Retirement Account Balance (all accounts combined: 401k, IRA, etc.) | number | Integer dollars. Enter 0 if none. |
| `monthlyRetirementContribution` | Total Monthly Retirement Contributions (all accounts combined) | number | Integer dollars. Enter 0 if none. |

**Subjective Scales (full: 6 across liquidity + growth, light: 2)**

| Field Name | Label | Domain | Modes |
|------------|-------|--------|-------|
| `savingsClarity` | "How clear are you on your savings position?" (-5 = no idea, +5 = fully clear) | Liquidity | Both |
| `savingsStress` | "How stressed do you feel about your savings reserves?" (-5 = extremely stressed, +5 = completely at ease) | Liquidity | Full only |
| `investmentClarity` | "How clear are you on your investments and retirement picture?" (-5 = no idea, +5 = fully clear) | Growth | Both |
| `retirementConfidence` | "How confident do you feel about your retirement trajectory?" (-5 = not at all confident, +5 = very confident) | Growth | Full only |
| `retirementFunding` | "My retirement savings contributions are..." (-5 = not contributing at all, +5 = fully on track) | Growth | Full only |
| `growthStress` | "How stressed do you feel about your long-term financial growth?" (-5 = extremely stressed, +5 = completely at ease) | Growth | Full only |

**Free-Text (full: 1, light: none)**

| Field Name | Label | Modes |
|------------|-------|-------|
| `savingsGrowthNarrative` | "Describe your current investment or retirement vehicles and your overall approach to building long-term wealth." | Full only |

---

### PAGE 5 — Protection & Reflection

**Objective Financial Data (both modes — required)**

Render as a single grouped checkbox question: *"Which of the following do you currently have active coverage for? (select all that apply)"*

| Field Name | Coverage Type | Type |
|------------|--------------|------|
| `hasHealthInsurance` | Health Insurance | checkbox → boolean |
| `hasLifeInsurance` | Life Insurance | checkbox → boolean |
| `hasDisabilityInsurance` | Disability Insurance (short or long-term) | checkbox → boolean |
| `hasPropertyInsurance` | Property and/or Auto Insurance | checkbox → boolean |

**Subjective Scales (full: 3, light: 1)**

| Field Name | Label | Modes |
|------------|-------|-------|
| `insuranceClarity` | "How clear are you on your insurance coverage?" (-5 = no idea, +5 = fully clear) | Both |
| `insuranceConfidence` | "How adequate do you feel your overall financial protection is?" (-5 = very exposed, +5 = fully protected) | Full only |
| `protectionStress` | "How stressed do you feel about your financial protection?" (-5 = extremely stressed, +5 = completely at ease) | Full only |

**Free-Text (both modes — same question)**

| Field Name | Label | Modes |
|------------|-------|-------|
| `financialEmotionsNarrative` | "How do you feel about your financial situation overall? What is your biggest financial concern right now?" | Both |

**Tool 1 Adaptive Question (full mode only)**

Render after `financialEmotionsNarrative`. Uses existing adaptive question logic based on `topTrauma` from Tool 1. See existing `Tool2.js` adaptive question map — do not change the question content, only retain it.

| Field Name | Notes | Modes |
|------------|-------|-------|
| `adaptiveImpact` | Dynamic textarea — label from existing adaptive question map by `topTrauma` | Full only |
| `adaptiveScale` | Dynamic scale (-5 to +5, no zero) paired with adaptive question | Full only |

---

## 5. Financial Benchmarks

Standard financial planning benchmarks. Display in report with: *"This score is based on the financial planning standard that [benchmark description]."*

### Money Flow Benchmark
**Savings Rate** = `(monthlyTakeHome - monthlySpending) / monthlyTakeHome × 100`

| Savings Rate | Objective Score | Label |
|-------------|-----------------|-------|
| ≥ 20% | 85 | Strong |
| 10–19% | 65 | Moderate |
| 1–9% | 35 | Tight |
| ≤ 0% | 10 | Deficit |

Standard displayed: *"Financial planners recommend saving at least 20% of take-home income."*

### Obligations Benchmark
**DTI** = `monthlyDebtPayments / monthlyTakeHome × 100`

| DTI | DTI Score | Label |
|-----|-----------|-------|
| ≤ 15% | 85 | Healthy |
| 15–28% | 60 | Moderate |
| 28–36% | 30 | Stressed |
| > 36% | 10 | High Risk |

**Emergency Fund Months** = `emergencyFundBalance / monthlySpending`

| Months | EF Score | Label |
|--------|----------|-------|
| ≥ 6 months | 90 | Fully Funded |
| 3–5.9 months | 65 | Adequate |
| 1–2.9 months | 35 | Building |
| < 1 month | 10 | At Risk |

**Domain Score** = `Math.round((dtiScore + efScore) / 2)`

Standard displayed: *"Financial planners recommend a debt-to-income ratio below 36% and an emergency fund of 3–6 months of expenses."*

### Liquidity Benchmark
**Liquid Buffer** = `liquidSavings / monthlySpending` (in months)

| Months | Objective Score | Label |
|--------|-----------------|-------|
| ≥ 3 months | 85 | Strong |
| 1–2.9 months | 60 | Building |
| 0.1–0.99 months | 30 | Minimal |
| 0 | 5 | None |

Standard displayed: *"Financial planners recommend 3+ months of expenses in accessible liquid savings beyond your emergency fund."*

### Growth Benchmark
**Retirement Savings Rate** = `monthlyRetirementContribution / incomeBase × 100`
where `incomeBase = monthlyTakeHome || (grossAnnualIncome / 12)`

| Rate | Objective Score | Label |
|------|-----------------|-------|
| ≥ 15% | 90 | On Track |
| 10–14% | 65 | Building |
| 5–9% | 35 | Starting |
| < 5% | 10 | Not Saving |

Standard displayed: *"Financial planners recommend saving 15% of income for retirement."*

### Protection Benchmark
Count of insurance types covered vs. applicable.
- Health, Disability, Property are always applicable (3 types).
- Life is applicable only if `parseInt(dependents) > 0`. (Note: "primary income earner" is not collected as a field — life insurance applicability uses dependents only.)

**Coverage Score** = `Math.round(coveredCount / applicableCount * 100)`

| Coverage | Label |
|----------|-------|
| 100% | Fully Covered |
| 67–99% | Mostly Covered |
| 34–66% | Partially Covered |
| < 34% | Underprotected |

Standard displayed: *"Adequate protection includes health, disability, and property coverage for all adults, plus life insurance for those with dependents."*

---

## 6. Scoring Algorithm

### 6.0 Constants (define in `Tool2Constants.js`)

**IMPORTANT — File structure**: `Tool2Constants.js` is a single object: `const Tool2Constants = { ... }`. Add all new constants as **properties inside that object**, NOT as standalone `const` declarations at module level. Standalone declarations create an inconsistency with how the rest of `Tool2.js` accesses `Tool2Constants.PROPERTY_NAME`.

Also: the existing `Tool2Constants.STRESS_WEIGHTS` and the new `STRESS_WEIGHTS` below contain identical values. **Do not create a second copy** — rename `STRESS_WEIGHTS` to `STRESS_WEIGHTS` (keep the existing property name) and add the other new properties alongside it. The new scoring functions reference these as `Tool2Constants.FULL_MODE_FIELDS`, etc.

```javascript
// Add these inside the Tool2Constants = { ... } object:

FULL_MODE_FIELDS: {
  moneyFlow:   ['incomeClarity', 'spendingClarity', 'moneyFlowStress'],
  obligations: ['debtClarity', 'debtTrending', 'obligationsStress'],
  liquidity:   ['savingsClarity', 'savingsStress'],
  growth:      ['investmentClarity', 'retirementConfidence', 'retirementFunding', 'growthStress'],
  protection:  ['insuranceClarity', 'insuranceConfidence', 'protectionStress']
},

LIGHT_MODE_FIELDS: {
  moneyFlow:   ['incomeClarity'],
  obligations: ['debtClarity'],
  liquidity:   ['savingsClarity'],
  growth:      ['investmentClarity'],
  protection:  ['insuranceClarity']
},

// NOTE: STRESS_WEIGHTS already exists with identical values — do not add a duplicate.
// Leave existing STRESS_WEIGHTS as-is. New scoring functions use Tool2Constants.STRESS_WEIGHTS.

BENCHMARK_STANDARDS: {
  moneyFlow:   'Financial planners recommend saving at least 20% of take-home income.',
  obligations: 'Financial planners recommend a debt-to-income ratio below 36% and an emergency fund of 3-6 months of expenses.',
  liquidity:   'Financial planners recommend 3+ months of expenses in liquid savings beyond your emergency fund.',
  growth:      'Financial planners recommend saving 15% of income for retirement.',
  protection:  'Adequate protection includes health, disability, and property coverage for all adults, plus life insurance for those with dependents.'
},

// REPLACE existing REQUIRED_INSIGHTS (7 keys) with this single-entry version.
// The old 7 keys matched the old per-field GPT system (income_sources, major_expenses, etc.).
// Phase 4 replaces that with one consolidated call — only one result key is needed.
REQUIRED_INSIGHTS: ['consolidated_insight']
```

In scoring functions, reference as `Tool2Constants.FULL_MODE_FIELDS`, `Tool2Constants.BENCHMARK_STANDARDS`, etc.

### 6.1 Objective Health Score (0–100)

**IMPORTANT**: Use block braces `{}` on every `case` to avoid GAS strict-mode `const` scoping errors.

```javascript
function computeObjectiveHealthScore(domain, data) {
  const takeHome = parseFloat(data.monthlyTakeHome) || 0;
  const spending = parseFloat(data.monthlySpending) || 0;
  const debtPay  = parseFloat(data.monthlyDebtPayments) || 0;
  const efBal    = parseFloat(data.emergencyFundBalance) || 0;
  const liquid   = parseFloat(data.liquidSavings) || 0;
  const retContr = parseFloat(data.monthlyRetirementContribution) || 0;
  const annualInc = parseFloat(data.grossAnnualIncome) || 0;
  const deps     = parseInt(data.dependents) || 0;

  switch (domain) {
    case 'moneyFlow': {
      if (takeHome <= 0) return 10; // Cannot compute — treat as deficit
      const savingsRate = (takeHome - spending) / takeHome * 100;
      if (savingsRate >= 20) return 85;
      if (savingsRate >= 10) return 65;
      if (savingsRate >= 1)  return 35;
      return 10;
    }
    case 'obligations': {
      const dtiScore = (function() {
        if (takeHome <= 0) return 10;
        const dti = debtPay / takeHome * 100;
        if (dti <= 15) return 85;
        if (dti <= 28) return 60;
        if (dti <= 36) return 30;
        return 10;
      })();
      const efScore = (function() {
        if (spending <= 0) return efBal > 0 ? 65 : 10; // Cannot compute months — give partial credit
        const months = efBal / spending;
        if (months >= 6) return 90;
        if (months >= 3) return 65;
        if (months >= 1) return 35;
        return 10;
      })();
      return Math.round((dtiScore + efScore) / 2);
    }
    case 'liquidity': {
      if (spending <= 0) return liquid > 0 ? 60 : 5;
      const months = liquid / spending;
      if (months >= 3)   return 85;
      if (months >= 1)   return 60;
      if (months >= 0.1) return 30;
      return 5;
    }
    case 'growth': {
      const incomeBase = takeHome > 0 ? takeHome : (annualInc / 12);
      if (incomeBase <= 0) return 10;
      const rate = retContr / incomeBase * 100;
      if (rate >= 15) return 90;
      if (rate >= 10) return 65;
      if (rate >= 5)  return 35;
      return 10;
    }
    case 'protection': {
      // IMPORTANT: Google Sheets returns boolean fields as "TRUE"/"FALSE" strings.
      // "FALSE" is truthy in JS — filter(Boolean) would miscount coverage.
      // Always coerce with _isTrue() before Boolean comparison.
      function _isTrue(v) { return v === true || v === 'true' || v === 'TRUE'; }
      const applicable = [
        _isTrue(data.hasHealthInsurance),
        _isTrue(data.hasDisabilityInsurance),
        _isTrue(data.hasPropertyInsurance),
        deps > 0 ? _isTrue(data.hasLifeInsurance) : null
      ].filter(v => v !== null);
      if (applicable.length === 0) return 50;
      const coveredCount = applicable.filter(Boolean).length;
      return Math.round(coveredCount / applicable.length * 100);
    }
    default:
      return 50;
  }
}
```

### 6.2 Subjective Clarity Score (0–100)
Scale normalization: `(value + 5) / 10 * 100` maps -5→0, +5→100.

```javascript
function computeSubjectiveScore(domain, data, mode) {
  const fieldMap = mode === 'full' ? TOOL2_FULL_MODE_FIELDS : TOOL2_LIGHT_MODE_FIELDS;
  const fields = fieldMap[domain] || [];
  const values = fields
    .map(f => parseFloat(data[f]))
    .filter(v => !isNaN(v) && v !== 0); // exclude 0 (no-zero scale — 0 = unanswered)
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round((avg + 5) / 10 * 100);
}
```

### 6.3 Gap Index (-100 to +100)
```javascript
function computeGapIndex(objectiveScore, subjectiveScore) {
  if (objectiveScore === null || subjectiveScore === null) return null;
  return objectiveScore - subjectiveScore;
}

// Threshold operator note: uses strict > (not >=) at the 10 and 20 boundaries.
// gapIndex = exactly 20 → SLIGHTLY_UNDER (not UNDERESTIMATING)
// gapIndex = exactly 10 → ALIGNED (not SLIGHTLY_UNDER)
// gapIndex = exactly -10 → ALIGNED (not SLIGHTLY_OVER)
// gapIndex = exactly -20 → SLIGHTLY_OVER (not OVERESTIMATING)
// This is intentional — edge values sit in the milder bucket.
function classifyGap(gapIndex) {
  if (gapIndex === null) return 'UNKNOWN';
  if (gapIndex > 20)  return 'UNDERESTIMATING'; // Reality stronger than perception
  if (gapIndex > 10)  return 'SLIGHTLY_UNDER';
  if (gapIndex >= -10) return 'ALIGNED';
  if (gapIndex >= -20) return 'SLIGHTLY_OVER';
  return 'OVERESTIMATING'; // Perception stronger than reality
}
```

### 6.4 Priority Score
```javascript
function computePriorityScore(domain, objectiveScore) {
  const weight = TOOL2_STRESS_WEIGHTS[domain] || 1;
  const healthScore = objectiveScore !== null ? objectiveScore : 50;
  return weight * (100 - healthScore); // Higher number = more urgent
}
// Sort domains descending by priorityScore → priorityList[0] = highest priority
```

### 6.5 Scarcity Flag
```javascript
function computeScarcityFlag(data) {
  const holistic  = parseFloat(data.holisticScarcity);
  const financial = parseFloat(data.financialScarcity);
  if (isNaN(holistic) || isNaN(financial)) return 'UNKNOWN';

  // Check targeted cases first (before averaging)
  if (holistic >= 2 && financial <= -2) return 'TARGETED_FINANCIAL_SCARCITY';
  if (holistic <= -2 && financial >= 2)  return 'DISSOCIATED_FINANCIAL';

  const avg = (holistic + financial) / 2;
  if (avg <= -2) return 'GLOBAL_SCARCITY';
  if (avg >= 2)  return 'GLOBAL_ABUNDANCE';
  return 'MIXED';
}
```

**Scarcity flag report behavior:**
- `GLOBAL_SCARCITY`: Top-level callout: *"Your responses suggest a global sense of scarcity — a feeling that there is not enough in life broadly. This pattern typically forms early and shapes financial decision-making at a deep level."*
- `TARGETED_FINANCIAL_SCARCITY`: *"You report a generally abundant life outlook but significant scarcity around money specifically. This often points to a specific formative financial experience rather than a global worldview."*
- `GLOBAL_ABUNDANCE`: Note as a protective factor in gap narratives where relevant. No top-level callout.
- `DISSOCIATED_FINANCIAL`, `MIXED`: No top-level callout. Reference contextually in domain narratives where relevant.

### 6.6 Test Fixtures — Verify Scoring Implementation

Run these manually after implementing Section 6 functions to confirm correctness before Phase 3:

**Fixture 1 — Strong saver with good emergency fund:**
```
monthlyTakeHome: 5000, monthlySpending: 3500, monthlyDebtPayments: 300,
emergencyFundBalance: 21000, liquidSavings: 10000, monthlyRetirementContribution: 750,
grossAnnualIncome: 72000, dependents: 2,
hasHealthInsurance: true, hasLifeInsurance: true, hasDisabilityInsurance: true, hasPropertyInsurance: true
```
**Calculations:**
- moneyFlow: savings rate = (5000-3500)/5000 × 100 = 30% → ≥20% → **85**
- obligations: DTI = 300/5000 × 100 = 6% → ≤15% → 85. EF = 21000/3500 = 6.0 months → ≥6 → 90. Avg = (85+90)/2 = 87.5 → **88**
- liquidity: 10000/3500 = 2.86 months → ≥1 and <3 → **60**
- growth: 750/5000 × 100 = 15% → ≥15% → **90**
- protection: deps=2 so all 4 applicable, all 4 covered → 4/4 = **100**

Expected scores: `{ moneyFlow: 85, obligations: 88, liquidity: 60, growth: 90, protection: 100 }`

**Fixture 2 — Deficit spender, no emergency fund:**
```
monthlyTakeHome: 3000, monthlySpending: 3500, monthlyDebtPayments: 800,
emergencyFundBalance: 0, liquidSavings: 500, monthlyRetirementContribution: 0,
grossAnnualIncome: 48000, dependents: 0
```
Expected: moneyFlow=10 (deficit), obligations=10 (DTI=800/3000=26.7%→30, EF=0→10, avg=20→rounds to 20), liquidity=30 (500/3500=0.14mo → 0.1-0.99 → 30), growth=10 (0% → 10), protection=5 (no dependents so 3 applicable, 0 covered → 0... rounds to 0)

Wait: protection: 0/3=0, round=0. But spec says <34%→"Underprotected". Score=0. That's correct.
Obligations: (30+10)/2=20 ✓

Expected: `{ moneyFlow: 10, obligations: 20, liquidity: 30, growth: 10, protection: 0 }`

**Fixture 3 — Zero income guard:**
```
monthlyTakeHome: 0, monthlySpending: 0
```
Expected: moneyFlow=10 (takeHome≤0 guard), obligations=10, liquidity=5 (spending≤0 and liquidSavings=0), growth=10

---

## 7. Tool 1 Integration Specification

### 7.1 Data Access (no changes needed)
The existing `getTool1TraumaData()` function in `Tool2.js` returns `{ topTrauma, traumaScores }` with all 6 scores. No changes to data access.

### 7.2 Pattern Thresholds (define in `Tool2Constants.js`)

These are data-driven thresholds from the actual cohort (n=70). The same thresholds are defined in `Tool1Constants.js` (which must be created — see `docs/Tool1/TOOL1-IMPROVEMENTS-DESIGN.md`). Do not duplicate the logic — define in `Tool2Constants.js` and `Tool1Constants.js` separately since GAS does not support imports.

```javascript
const TOOL2_PATTERN_THRESHOLDS = {
  FSV:       { low: -5,  high: 11 },
  ExVal:     { low: -7,  high: 12 },
  Showing:   { low: -4,  high: 16 },
  Receiving: { low: -10, high: 3  }, // Skewed negative in entrepreneur cohort
  Control:   { low: -5,  high: 12 },
  Fear:      { low: -10, high: 14 }
};

function classifyPatternScore(pattern, score) {
  const t = TOOL2_PATTERN_THRESHOLDS[pattern];
  if (!t) return 'MODERATE';
  if (score > t.high) return 'HIGH';  // Pattern strongly active
  if (score < t.low)  return 'LOW';   // Pattern largely absent — healthy signal
  return 'MODERATE';
}
```

### 7.3 Profile Type Detection

```javascript
function detectTool1ProfileType(traumaScores) {
  const classified = {};
  Object.keys(traumaScores).forEach(p => {
    classified[p] = classifyPatternScore(p, traumaScores[p]);
  });

  const highPatterns = Object.keys(classified).filter(p => classified[p] === 'HIGH');
  const lowPatterns  = Object.keys(classified).filter(p => classified[p] === 'LOW');
  const sorted = Object.entries(traumaScores).sort((a, b) => b[1] - a[1]);
  const margin = sorted.length >= 2 ? sorted[0][1] - sorted[1][1] : 25;
  const topWinner = sorted[0][0];

  // Negative-dominant: 4+ patterns below their LOW threshold
  if (lowPatterns.length >= 4) {
    return {
      type: 'NEGATIVE_DOMINANT',
      winner: topWinner,   // least-negative — framed differently in report
      secondary: null,
      margin,
      highPatterns: [],
      lowPatterns,
      classified
    };
  }

  // Borderline dual: top two within 5 points
  if (margin <= 5) {
    return {
      type: 'BORDERLINE_DUAL',
      winner: sorted[0][0],
      secondary: sorted[1][0],
      margin,
      highPatterns,
      lowPatterns,
      classified
    };
  }

  // Strong single: margin > 10 and winner is HIGH
  if (margin > 10 && classified[topWinner] === 'HIGH') {
    return {
      type: 'STRONG_SINGLE',
      winner: topWinner,
      secondary: sorted[1][0],
      margin,
      highPatterns,
      lowPatterns,
      classified
    };
  }

  // Moderate single: default
  return {
    type: 'MODERATE_SINGLE',
    winner: topWinner,
    secondary: sorted[1][0],
    margin,
    highPatterns,
    lowPatterns,
    classified
  };
}
```

**IMPORTANT**: `winner` is always set in all 4 profile types. Never access `profile.winner` without first verifying this function has run.

### 7.4 Combination Narrative Lookup
Combination narratives are defined in `Tool1Templates.COMBINATION_NARRATIVES` (see `docs/Tool1/TOOL1-IMPROVEMENTS-DESIGN.md` Section 4). Reference them directly:

```javascript
function getCombinationNarrative(pattern1, pattern2) {
  const key = [pattern1, pattern2].sort().join('_'); // Always alphabetical
  return Tool1Templates.COMBINATION_NARRATIVES[key] || null;
}
```

### 7.5 Negative-Dominant Profile Framing

```javascript
// In Tool2Report.js — render this section when profile.type === 'NEGATIVE_DOMINANT'
const winnerName = Tool1Templates.getTemplate(profile.winner).name;
const negDomText = 'Your psychological assessment results show low activation across most ' +
  'financial trauma patterns. This can indicate genuine psychological flexibility, OR it can ' +
  'reflect a suppression dynamic where patterns are present but not consciously recognized. ' +
  'Your financial data from this assessment is the most reliable signal of where attention is needed. ' +
  'Focus on the domain scores below rather than pattern-specific narratives. ' +
  'Your highest relative pattern is ' + winnerName + ', noted briefly below.';
```

### 7.6 Gap Narrative Templates

These templates drive Section 5 of the report (The Gap Analysis). The narrative connects a domain's gap classification to the student's psychological profile.

**Template structure per domain × gap direction:**

For each domain, if gap is `UNDERESTIMATING` (reality stronger than perception), the narrative frame is:
> *"Your [domain] numbers are stronger than your perception suggests. For someone with a [pattern] pattern, this gap often reflects [pattern-specific reason for underestimating]. Your actual [metric] is [value], but you rate your clarity at [subjective]/100."*

For each domain, if gap is `OVERESTIMATING` (perception stronger than reality), the frame is:
> *"Your perception of your [domain] situation is more confident than your numbers support. This is a common signal for [pattern] pattern — [pattern-specific reason for overestimating]. Your actual [metric] is [value], while your perceived clarity is [subjective]/100."*

**Pattern-specific reasons by domain and gap direction (use in template generation):**

| Pattern | Domain | UNDERESTIMATING (reality > perception) | OVERESTIMATING (perception > reality) |
|---------|--------|----------------------------------------|---------------------------------------|
| FSV | moneyFlow | "FSV pattern creates persistent feelings of financial insufficiency even when objective income is adequate. The scarcity feels real even when the numbers do not support it." | "FSV sometimes produces financial blindness — avoiding looking at actual numbers. If perception feels better than reality, check whether avoidance of income tracking is masking the real picture." |
| ExVal | moneyFlow | "Rarely occurs — ExVal typically produces overestimation." | "ExVal pattern often produces a performance of financial adequacy. The perception of a strong money flow may reflect a curated narrative rather than actual numbers." |
| Showing | obligations | "Habitual financial giving to others depletes savings and increases stress, creating an emotional sense of financial burden even when objective debt levels are manageable." | "Showing pattern sometimes produces denial about debt accumulation — the emotional focus is on giving, not tracking what you owe." |
| Control | liquidity | "Control pattern drives obsessive awareness of what you have, which can feel exposing rather than reassuring. High clarity + high stress produces a perception of inadequacy despite adequate reserves." | "Control pattern rarely produces overestimation of liquidity — the tracking is usually accurate." |
| Fear | growth | "Fear pattern produces avoidance of retirement/investment information — you may have more accumulated than you realize because you avoid looking." | "Fear pattern can produce a false sense of security through avoidance — not engaging with retirement data means the gaps are not consciously registered." |
| Receiving | protection | "Receiving pattern correlates with not accessing available resources, including insurance. You may be more covered than you feel, because accepting coverage requires acknowledging dependency on systems." | "Rarely occurs for protection domain." |

**Fallback template (use when pattern × domain combination is not in the matrix above):**
> *"There is a gap between your [domain] reality ([objective score]/100) and your perception ([subjective score]/100). This type of gap often reflects how your psychological patterns shape what you notice and what you avoid about your finances."*

**ALIGNED gap framing:**
> *"Your perception of your [domain] situation closely matches your actual financial position. This alignment is a genuine strength — it means you are seeing this area of your finances clearly, without significant distortion from your psychological patterns."*

---

## 8. Report Structure

`Tool2Report.js` `render(clientId)` returns an HTML string. All sections are rendered server-side. The existing pipeline (`ReportBase.getResults()`, CSS from `ReportStyles.js`) is unchanged.

### Section 1: Financial Mirror Header
```
[Student Name]'s Financial Mirror
[Date] | [Assessment Mode: Full Assessment / Quick Check-In]
[If repeat submission]: "Previous: [prior date] | View progress comparison"
```

### Section 2: Scarcity & Mindset Foundation
- Render scarcity flag callout using Section 6.5 language
- Show holistic vs. financial scarcity scores side by side as two labeled values
- If `|holistic - financial| > 3`: add note — *"There is a meaningful gap between your overall life outlook and your financial outlook specifically — see the pattern analysis below for what this may indicate."*

### Section 3: Your Financial Reality (Objective Health)
Five domain cards. Each card shows:
- Domain name
- Objective Health Score badge (0–100) with label (Strong / Moderate / Tight / At Risk)
- The benchmark standard (from `TOOL2_BENCHMARK_STANDARDS`)
- The computed metric shown transparently: e.g., *"Your savings rate: 7% | Standard: 20%+"*

### Section 4: Your Financial Perception (Subjective Clarity)
Five domain cards. Each card shows:
- Subjective Clarity Score (0–100)
- The scale question(s) that produced it
- One-line interpretation: score ≥ 70 = "High clarity", 40–69 = "Moderate clarity", < 40 = "Low clarity"

### Section 5: The Gap Analysis (Primary Report Value)
Five domain cards. Each card shows:
- Objective score vs. Subjective score as a two-bar comparison
- Gap index value with direction arrow (↑ = underestimating, ↓ = overestimating, → = aligned)
- Gap classification label
- **Gap narrative** generated from Section 7.6 templates, personalized by pattern

### Section 6: Priority Map
Domains ranked by `priorityScore` (descending). Show top 3. Each item:
- Domain name + priority label
- One sentence on why this is a priority (objective score + stress weight)
- One action sentence targeted to this domain + the student's top pattern

### Section 7: Pattern Synthesis
- Profile type statement (see Section 7.3–7.5 framing)
- Combination narrative if `BORDERLINE_DUAL` (from `Tool1Templates.COMBINATION_NARRATIVES`)
- Strength callouts for any `LOW` classified patterns (from `Tool1Templates.STRENGTH_STATEMENTS`)
- Polarity insight if applicable (from `Tool1Templates.POLARITY_INSIGHTS`)

### Section 8: Personalized Insights (GPT)
GPT-generated content (see Section 9). Falls back to deterministic template from `Tool2Fallbacks.js` on failure.

### Section 9: Your Growth Archetype
Unchanged from current logic. Archetype = highest-priority domain name mapped to archetype label.

### Progress Comparison (conditional)
If this is a repeat submission (previous Tool 2 response exists for this `clientId`):
- Render a comparison panel after Section 3: shows previous vs. current objective scores per domain as delta values (e.g., "Money Flow: +12 since [date]")
- Delta = `currentObjectiveScore - previousObjectiveScore`
- Positive delta = green, negative = red, 0 = neutral
- Only show if previous response uses new schema (has `objectiveHealthScores` field)
- If previous response is old schema: show *"Baseline comparison available after completing this assessment — your first full Financial Mirror submission becomes your progress baseline."*

---

## 9. GPT Prompt Specification

### Context Object
```javascript
const gptContext = {
  studentName: data.name,
  assessmentMode: data.assessmentMode,
  tool1Profile: {
    profileType: profile.type,
    winner: profile.winner,
    winnerName: Tool1Templates.getTemplate(profile.winner).name,
    allScores: traumaScores,
    highPatterns: profile.highPatterns,
    lowPatterns: profile.lowPatterns
  },
  scarcityFlag: scarcityFlag,
  domainResults: {
    moneyFlow:   { objectiveScore, subjectiveScore, gapIndex, gapClassification },
    obligations: { objectiveScore, subjectiveScore, gapIndex, gapClassification },
    liquidity:   { objectiveScore, subjectiveScore, gapIndex, gapClassification },
    growth:      { objectiveScore, subjectiveScore, gapIndex, gapClassification },
    protection:  { objectiveScore, subjectiveScore, gapIndex, gapClassification }
  },
  priorityDomain: priorityList[0].domain,
  freeTextResponses: {
    incomeAndSpendingNarrative: data.incomeAndSpendingNarrative || '',
    debtNarrative:              data.debtNarrative || '',
    savingsGrowthNarrative:     data.savingsGrowthNarrative || '',
    financialEmotionsNarrative: data.financialEmotionsNarrative || '',
    adaptiveImpact:             data.adaptiveImpact || ''
  }
};
```

### System Prompt
```
You are a trauma-informed financial coach generating personalized insights for a student who has completed a financial clarity and reality assessment. You have their psychological pattern scores and their actual financial data.

Your role: connect their psychological pattern to their financial reality. Avoid generic financial advice. Every insight must reference the gap between their perception and their reality, and explain what their specific psychological pattern suggests about WHY that gap exists.

Write in second person. Warm but direct. Do not soften important findings. Do not moralize. Treat financial struggles as predictable outcomes of psychological patterns, not character flaws.
```

### Output Structure (3 sections)
Plain-text output — do NOT ask GPT for JSON. JSON output is fragile (one malformed field breaks the entire response). Parse by section headers instead.

1. **Gap narrative** (1–2 paragraphs): Most significant gap + pattern connection
2. **Pattern-financial connections** (3 bullet points): Specific ways their top pattern shows up in the financial data
3. **Priority actions** (3–5 bullets): Targeted to highest-priority domain + pattern

Section headers GPT should output:
```
GAP NARRATIVE
[paragraph text]

PATTERN CONNECTIONS
- [bullet]
- [bullet]
- [bullet]

PRIORITY ACTIONS
- [bullet]
```
Parse with regex: `/GAP NARRATIVE\n([\s\S]*?)\n\nPATTERN CONNECTIONS/` etc.

### Human-Readable Label Mapping
GPT prompts must never pass raw technical keys — GPT outputs them verbatim and students see jargon. Map all keys to labels in the context object or system prompt:

```javascript
// Domain labels
const DOMAIN_LABELS = {
  moneyFlow: 'Money Flow (income and spending)',
  obligations: 'Obligations (debt and emergency fund)',
  liquidity: 'Liquidity (accessible savings)',
  growth: 'Growth (retirement and investments)',
  protection: 'Protection (insurance coverage)'
};

// Gap classification labels
const GAP_LABELS = {
  UNDERESTIMATING: 'significantly underestimating financial health',
  SLIGHTLY_UNDER: 'slightly underestimating financial health',
  ALIGNED: 'perception aligned with reality',
  SLIGHTLY_OVER: 'slightly overestimating financial health',
  OVERESTIMATING: 'significantly overestimating financial health'
};
```
Build the human-readable version of the context before passing to GPT.

### Background Processing Trigger
Tier 1 background call fires during the Page 4 → Page 5 transition (the last page load before submission). This gives 15–30 seconds for GPT to process before the student clicks Submit.

```javascript
// In Tool2.js savePageData() — add this at the end of page 4 save:
if (page === 4) {
  // Fire and forget — result cached in DraftService under key 'tool2_gpt_draft_{clientId}'
  // (DraftService.getDraftKey('tool2_gpt', clientId) generates this key automatically)
  Tool2GPTAnalysis.startBackgroundAnalysis(clientId);
}
```

In `processFinalSubmission()`, retrieve cached result:
```javascript
const cachedGpt = DraftService.getDraft('tool2_gpt', clientId);
const gptInsight = cachedGpt ? cachedGpt.insight : null;
// If null, Tier 2 retry runs here, then Tier 3 fallback
```

### Fallback Tiers (unchanged from current)
- Tier 1: GPT-4o-mini, async during form (trigger: page 4 save — see above)
- Tier 2: Retry after 2s at submission time if Tier 1 result not cached
- Tier 3: `Tool2Fallbacks.js` — update templates to include gap language and reference objective vs. subjective scores

---

## 10. Data Model

### New Fields Added to `data` Object
```javascript
// Objective financial (all new):
grossAnnualIncome: number,
monthlyTakeHome: number,
monthlySpending: number,
totalDebtBalance: number,
monthlyDebtPayments: number,
emergencyFundBalance: number,
liquidSavings: number,
totalRetirementBalance: number,
monthlyRetirementContribution: number,
hasHealthInsurance: boolean,
hasLifeInsurance: boolean,
hasDisabilityInsurance: boolean,
hasPropertyInsurance: boolean,
assessmentMode: 'full' | 'light',

// Renamed subjective fields (old → new):
// moneyFlowStress    (was: spendingStress)
// obligationsStress  (was: debtStress)
// growthStress       (was: retirementStress)
// protectionStress   (was: insuranceStress)

// Consolidated free-text (replaces multiple old fields):
incomeAndSpendingNarrative: string,  // replaces: incomeSources, majorExpenses, wastefulSpending
debtNarrative: string,               // replaces: currentDebts
savingsGrowthNarrative: string,      // replaces: investmentTypes
financialEmotionsNarrative: string,  // replaces: financialEmotions, primaryObstacle
```

### New Fields Added to `results` Object
```javascript
objectiveHealthScores: { moneyFlow, obligations, liquidity, growth, protection },  // 0-100 each
subjectiveScores:      { moneyFlow, obligations, liquidity, growth, protection },  // 0-100 each
gapIndexes:            { moneyFlow, obligations, liquidity, growth, protection },  // -100 to +100
gapClassifications:    { moneyFlow, obligations, liquidity, growth, protection },  // string enum
scarcityFlag: string,
tool1Profile: { type, winner, secondary, highPatterns, lowPatterns },
assessmentMode: string
```

### Preserved Existing Fields
`domainScores`, `benchmarks`, `weightedScores`, `priorityList`, `archetype` — kept for backward compatibility with `CollectiveResults.js` and admin views.

### Fields Removed
`incomeSources`, `majorExpenses`, `wastefulSpending`, `currentDebts`, `investmentTypes`, `financialEmotions`, `primaryObstacle`, `goalConfidence`, `incomeStreams` (count), `incomeConsistency`, `incomeSufficiency`, `emergencyFundMaintenance`, `emergencyFundFrequency`, `emergencyFundReplenishment`, `emergencyFundMonths`, `retirementAccounts`, `investmentActivity`, `investmentConfidence`, `insurancePolicies`

### Migration Rule for Old Responses
In `Tool2Report.js` and all downstream tools: check `results.objectiveHealthScores !== undefined` before using new schema fields. If absent → old schema → fall back to existing rendering logic. Do not attempt to back-fill old responses.

---

## 11. Downstream Tool Pre-Population

### Access Pattern (same for all three tools)
```javascript
// In Tool4.js / Tool6.js / Tool8.js — add at form render time:
const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
const tool2 = tool2Data && tool2Data.data ? tool2Data.data : null;
const isNewSchema = tool2Data && tool2Data.results && tool2Data.results.objectiveHealthScores;
// Only pre-populate if new schema — old schema has no reliable numeric fields
```

### Tool 4 Mapping

Tool 4 uses a **pre-survey data layer** (`preSurveyData`). The fields below are pre-survey fields, not main form fields. Pre-populate by providing suggested values when the pre-survey renders.

| Tool 4 Pre-Survey Field | Source | Fallback if no Tool 2 |
|------------------------|--------|----------------------|
| `preSurveyData.monthlyIncome` | `tool2.monthlyTakeHome` | Keep existing question |
| `preSurveyData.debtBalance` | `tool2.totalDebtBalance` | Keep existing question |
| `preSurveyData.emergencyFund` | `tool2.emergencyFundBalance` | Keep existing question |

Pre-populated fields: show value as pre-filled with note *"From your Financial Mirror — update if needed"* and an Edit link that unhides the input.

### Tool 6 Mapping

Tool 6 also uses a **pre-survey data layer** (`preSurveyData`). Fields `a1_grossIncome`, `a12_current401kBalance`, `a6_filingStatus`, and `a16_monthly401kContribution` are pre-survey fields — see the Tool 6 pre-survey render function (search for `preSurveyData` in `Tool6.js`, around lines 450–510) to understand how to inject suggested values.

| Tool 6 Pre-Survey Field | Source | Fallback |
|------------------------|--------|---------|
| `preSurveyData.a1_grossIncome` | `tool2.grossAnnualIncome` | Keep existing question |
| `preSurveyData.a12_current401kBalance` | `tool2.totalRetirementBalance` | Keep existing question |
| `preSurveyData.a16_monthly401kContribution` | `tool2.monthlyRetirementContribution` | Keep existing question |
| `preSurveyData.a6_filingStatus` | Derived: `marital === 'single'` → `'single'`; `married/partnered` → `'married_filing_jointly'` | Keep existing question |

Note: Tool 6 still asks for employer match, HSA, education details — these are not collected in Tool 2.

### Tool 8 Mapping
| Tool 8 Field | Source | Fallback |
|-------------|--------|---------|
| Current investment balance | `tool2.totalRetirementBalance` (use Tool 6 if available: prefer `tool6Data.data.currentBalances`) | Keep existing |
| Years to retirement | Computed: `65 - parseInt(tool2.age)` — treat as suggestion only, student must confirm | Keep existing |

---

## 12. CollectiveResults.js Changes

**Read `core/CollectiveResults.js` before editing** — it is 5,238 lines. Locate the "Financial Structure" section (search for `tool2Data` or `domainScores` within it).

### New Subsection: Financial Reality vs. Perception
After the existing domain score cards, add a 5-domain comparison panel:
- Each domain: two horizontal bars — Objective Health (blue) vs. Subjective Clarity (gray)
- Gap label below each bar (UNDERESTIMATING / ALIGNED / OVERESTIMATING) with color coding
  - UNDERESTIMATING = green
  - ALIGNED = neutral gray
  - OVERESTIMATING = amber

Data access: `tool2Results.objectiveHealthScores`, `tool2Results.subjectiveScores`, `tool2Results.gapClassifications`

Only render this subsection if `tool2Results.objectiveHealthScores` is present (new schema guard).

### Awareness Gap Engine Update
Search for the awareness gap engine in `CollectiveResults.js`. Add Tool 2 gap data as additional input:
- Any domain with `OVERESTIMATING` gap → strengthen denial signal
- Any domain with `UNDERESTIMATING` gap → strengthen self-worth gap signal
- `scarcityFlag === 'GLOBAL_SCARCITY'` → amplify warnings for FSV and Fear patterns
- `scarcityFlag === 'GLOBAL_ABUNDANCE'` → note as protective factor in Integration Analysis

This is a **signal enrichment only** — do not change the engine's output structure or existing logic.

---

## 13. Implementation Phases

### Phase Status

Update this table as you complete each phase. Do not start the next phase until the human confirms the current one.

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Data Model & Form Restructure | ⬜ NOT STARTED |
| 2 | Scoring Algorithm | ⬜ NOT STARTED |
| 3 | Report Redesign | ⬜ NOT STARTED |
| 4 | GPT Prompt Update | ⬜ NOT STARTED |
| 5 | Downstream Pre-Population | ⬜ NOT STARTED |
| 6 | CollectiveResults Update | ⬜ NOT STARTED |

**Rule**: Do not begin a phase until the previous phase passes manual testing in the deployed GAS environment. Each phase must be independently deployed and verified before proceeding.

---

### Phase 1: Data Model & Form Restructure

**Read before starting**: `tools/tool2/Tool2.js` (full file), `tools/tool2/Tool2Constants.js`, `core/FormUtils.js` (buildStandardPage pipeline), `shared/DraftService.js` (draft API), `docs/TOOL-DEVELOPMENT-PATTERNS.md` (back navigation pattern)

**Goal**: New question set collecting objective financial data. Old scoring temporarily preserved unchanged. Report temporarily unchanged.

**Tasks**:
1. Update `Tool2Constants.js` — add new constants **inside the `Tool2Constants` object** (not as standalone `const` variables — see Section 6.0 note on file structure): `FULL_MODE_FIELDS`, `LIGHT_MODE_FIELDS`, `BENCHMARK_STANDARDS`, `PATTERN_THRESHOLDS`. Do NOT create a second `STRESS_WEIGHTS` — the existing one has the same values. Also **replace** `REQUIRED_INSIGHTS` with the new single-entry version from Section 6.0 — the old 7-key list is obsolete after the GPT consolidation in Phase 4.
2. Rewrite Pages 2–5 in `Tool2.js` to render new question sets per Section 4
3. Add mode toggle to Page 1 (client-side JS shows/hides full-mode questions)
4. Update `processFinalSubmission()` to save new field names alongside existing ones
5. Save `assessmentMode` in draft and final submission using `DraftService.saveDraft('tool2', clientId, page, formData)` — NOT `PropertiesService` directly
6. Verify `savePageData()` calls `DraftService.saveDraft()` on **every** page (2, 3, 4, 5) — not just page 1 or final submission. This is required to enable resume and back-navigation.
7. Add `goBackToPageX()` back navigation functions to Pages 2–5 using `document.write()` pattern (see Section 0 — Back Navigation). Each page needs its own function. Do NOT use `window.location.href` or `history.back()`.
8. Ensure every page's rendered HTML includes `<?!= include('shared/loading-animation') ?>` — without it, `showLoading()` and `navigateToDashboard()` throw ReferenceError in production.

**Do not change**: Scoring algorithm, report rendering, GPT analysis — those come in later phases.

**Edit mode — do not break**: Tool 2 already has edit mode functionality. When a student re-submits in edit mode, the EDIT_DRAFT row in the RESPONSES sheet must be **deleted** (`sheet.deleteRow()`), not marked inactive. If you see any code that marks an EDIT_DRAFT row as not-latest instead of deleting it, that is a bug — do not replicate the pattern. Reference: `docs/LESSONS-LEARNED.md` — "Edit Mode Cleanup: DELETE, Don't Mark."

**Test protocol**:
1. Deploy to GAS
2. Complete the full assessment using test student login
3. Open RESPONSES sheet → find the new row → inspect the Data column JSON
4. Verify these fields are present with non-null values: `grossAnnualIncome`, `monthlyTakeHome`, `monthlySpending`, `totalDebtBalance`, `monthlyDebtPayments`, `emergencyFundBalance`, `liquidSavings`, `totalRetirementBalance`, `monthlyRetirementContribution`, `hasHealthInsurance`, `hasLifeInsurance`, `hasDisabilityInsurance`, `hasPropertyInsurance`, `assessmentMode`
5. Repeat with light mode toggle — verify `assessmentMode: "light"` saves and that full-mode-only fields are absent or null
6. Test back navigation: on Page 3, click back → verify Page 2 loads with no white screen and draft data still present
7. Test resume: complete Page 2, close browser, reopen Tool 2 — verify it resumes from Page 2 with data pre-filled
8. Verify existing report still renders (old report code path, old data shape preserved)
9. Check browser console — zero JavaScript errors expected

**Test student to use**: Create a new test submission — use a student account that has completed Tool 1 and can access Tool 2.

---

### Phase 2: Scoring Algorithm

**Read before starting**: `tools/tool2/Tool2.js` (specifically `processFinalSubmission()`), `tools/tool2/Tool2Constants.js` (as updated in Phase 1)

**Goal**: Compute and save all three score tracks. Verify with test fixtures before proceeding.

**Tasks**:
1. Add `computeObjectiveHealthScore()` to `Tool2.js` (see Section 6.1 — use exact code with block braces)
2. Add `computeSubjectiveScore()` to `Tool2.js` (see Section 6.2)
3. Add `computeGapIndex()` and `classifyGap()` to `Tool2.js` (see Section 6.3)
4. Add `computePriorityScore()` to `Tool2.js` (see Section 6.4)
5. Add `computeScarcityFlag()` to `Tool2.js` (see Section 6.5)
6. Add `detectTool1ProfileType()` to `Tool2.js` (see Section 7.3)
7. Update `processFinalSubmission()` to compute and save all new `results` fields

**CRITICAL — Both scoring pipelines must run**: The existing `processFinalSubmission()` computes `domainScores`, `benchmarks`, `weightedScores`, `priorityList`, and `archetype` using the old scale-based method. These fields are **preserved for backward compatibility** (see Section 10) — `CollectiveResults.js` (5,238 lines) and admin views read them directly. Do **NOT** remove or replace the old scoring. Instead, run both scoring pipelines inside `processFinalSubmission()` and save both sets of fields to the `results` object:

```javascript
// KEEP existing scoring (produces domainScores, benchmarks, weightedScores, priorityList, archetype)
const legacyResults = this.processResults(data);  // existing function — do not delete

// ADD new scoring (produces objectiveHealthScores, subjectiveScores, gapIndexes, etc.)
const domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
const objectiveHealthScores = {};
const subjectiveScores = {};
const gapIndexes = {};
const gapClassifications = {};
domains.forEach(d => {
  objectiveHealthScores[d] = computeObjectiveHealthScore(d, data);
  subjectiveScores[d] = computeSubjectiveScore(d, data, data.assessmentMode || 'full');
  gapIndexes[d] = computeGapIndex(objectiveHealthScores[d], subjectiveScores[d]);
  gapClassifications[d] = classifyGap(gapIndexes[d]);
});

// Save both sets together
const results = {
  ...legacyResults,           // domainScores, benchmarks, weightedScores, priorityList, archetype
  objectiveHealthScores,      // new
  subjectiveScores,           // new
  gapIndexes,                 // new
  gapClassifications,         // new
  scarcityFlag: computeScarcityFlag(data),   // new
  tool1Profile: detectTool1ProfileType(traumaScores),  // new
  assessmentMode: data.assessmentMode || 'full'        // new
};
```

**Test protocol**:
1. Run the three test fixtures from Section 6.6 using `Logger.log()` in GAS to verify scoring output
2. Submit a real assessment for student `5978RH` (STRONG_SINGLE FSV profile) — inspect saved JSON, verify `tool1Profile.type === 'STRONG_SINGLE'` and `tool1Profile.winner === 'FSV'`
3. Submit for student `1126AP` (BORDERLINE_DUAL ExVal+Showing) — verify `type === 'BORDERLINE_DUAL'`, `winner === 'ExVal'`, `secondary === 'Showing'`
4. Submit for student `5792RS` (NEGATIVE_DOMINANT — 6 patterns below threshold) — verify `type === 'NEGATIVE_DOMINANT'`
5. Verify `scarcityFlag` field is present and a valid string (not `undefined`)
6. Verify `gapIndexes` object is present with 5 domain keys, values between -100 and +100
7. Verify no `NaN` or `Infinity` values in any score field (use `JSON.stringify` in Logger.log)

---

### Phase 3: Report Redesign

**Prerequisite**: Tool 1 Phase 2 must be complete before starting this phase. `Tool2Report.js` directly references `Tool1Templates.COMBINATION_NARRATIVES`, `Tool1Templates.STRENGTH_STATEMENTS`, and `Tool1Templates.POLARITY_INSIGHTS`. These properties do not exist until Tool 1 Phase 2 adds them to `Tool1Templates.js`. Starting Phase 3 before Tool 1 Phase 2 will cause `ReferenceError` on every report load in production.

**Read before starting**: `tools/tool2/Tool2Report.js` (full file), `tools/tool1/Tool1Templates.js` (to understand template access pattern — and verify COMBINATION_NARRATIVES, STRENGTH_STATEMENTS, POLARITY_INSIGHTS are present before proceeding), `shared/ReportStyles.js` (for existing CSS classes to reuse)

**Goal**: New 9-section report replacing the existing report. Old report code can be kept in comments temporarily as fallback reference.

**Tasks**:
1. Rewrite `Tool2Report.js` `render()` to implement Sections 1–9 from Section 8 of this doc
2. Implement progress comparison panel (see Section 8 — progress comparison)
3. Implement gap narrative generation using templates from Section 7.6
4. Implement scarcity flag callout
5. Implement strength callouts from `Tool1Templates.STRENGTH_STATEMENTS`
6. Implement combination narrative from `Tool1Templates.COMBINATION_NARRATIVES`
7. Add schema detection: if `results.objectiveHealthScores` is absent → render old report via preserved old code path

**Test protocol**:
1. View report for student with new-schema submission (from Phase 2 test)
2. Verify all 9 sections render without JavaScript errors
3. View report for student `5978RH` — verify STRONG_SINGLE narrative appears in Section 7, no combination narrative renders, 1+ strength callouts appear for LOW patterns
4. View report for student `1126AP` — verify BORDERLINE_DUAL narrative + combination narrative `ExVal_Showing` appears
5. View report for student `5792RS` — verify NEGATIVE_DOMINANT framing appears, no pattern-specific narratives, domain scores are prominent
6. View report for an old-schema student (anyone who completed Tool 2 before this deployment) — verify old report still renders without errors
7. Check for apostrophe syntax errors: open browser console — zero JS errors expected

---

### Phase 4: GPT Prompt Update

**Read before starting**: `tools/tool2/Tool2GPTAnalysis.js` (full file), `tools/tool2/Tool2Fallbacks.js` (full file), `docs/Archive/GPT-IMPLEMENTATION-GUIDE.md` (background processing + fallback architecture)

**Goal**: GPT analysis uses new context object with gap data and Tool 1 profile. Background processing triggers on page 4 save.

**Tasks**:
1. Update `Tool2GPTAnalysis.js` to construct the `gptContext` object from Section 9, using `DOMAIN_LABELS` and `GAP_LABELS` mappings (Section 9 — Human-Readable Label Mapping) to convert technical keys to readable strings before passing to GPT
2. Update system prompt to Section 9 specification
3. **Output format**: GPT must return plain text with section headers (`GAP NARRATIVE`, `PATTERN CONNECTIONS`, `PRIORITY ACTIONS`) — do NOT ask for JSON output. Parse sections with regex (see Section 9 — Output Structure). JSON output breaks on malformed responses; this project has a standing rule against it.
4. **Remove the old GPT trigger system entirely**: The current `savePageData()` calls `this.triggerBackgroundGPTAnalysis(page, clientId, formData, draftData)`. That function fires up to 7 separate GPT calls (one per free-text field) across pages 2–5, storing results at PropertiesService key `tool2_gpt_{clientId}`. This entire system must be removed. **Note:** `Tool2GPTAnalysis.js` already exists (805 lines) — do NOT rewrite the whole file. Remove only the functions listed below and add `startBackgroundAnalysis()`. Preserve `synthesizeOverall()` (handles final synthesis at submission), `analyzeResponse()`, `callGPT()`, `parseResponse()`, `isValidInsight()`, `buildUserPrompt()`, trauma helpers, `parseSynthesis()`, `getGenericSynthesis()`, and `logFallbackUsage()`.
   - Delete the `triggerBackgroundGPTAnalysis()` function from `Tool2.js`
   - Remove the call `this.triggerBackgroundGPTAnalysis(...)` from `savePageData()`
   - Remove `getExistingInsights()` from `Tool2.js` (reads from the old PropertiesService key)
   - The old key `tool2_gpt_{clientId}` is also deleted in `processFinalSubmission()` cleanup — remove that line too
5. **Add consolidated page 4 trigger**: In `savePageData()`, after the DraftService save, add:
   ```javascript
   if (page === 4) {
     // Fire and forget — result cached in DraftService under key 'tool2_gpt_draft_{clientId}'
     Tool2GPTAnalysis.startBackgroundAnalysis(clientId);
   }
   ```
6. **Update `processFinalSubmission()` retrieval**: The old code calls `this.getExistingInsights(clientId)` which reads from PropertiesService. Replace with DraftService retrieval:
   ```javascript
   const cachedGpt = DraftService.getDraft('tool2_gpt', clientId);
   const gptInsight = cachedGpt ? cachedGpt.insight : null;
   // If null → Tier 2 retry → Tier 3 fallback
   ```
   Also remove the `PropertiesService.getUserProperties().deleteProperty('tool2_gpt_' + clientId)` cleanup line, and add DraftService cleanup in its place:
   ```javascript
   DraftService.clearDraft('tool2_gpt', clientId);
   ```
7. Update `Tool2Fallbacks.js` fallback templates to include gap language and reference objective vs. subjective scores
8. Verify fallback templates contain no escaped apostrophes (see CLAUDE.md template literal rules)
9. Verify `withSuccessHandler` in the GPT trigger null-checks the result before accessing `.insight`

**Test protocol**:
1. Complete a full assessment — verify GPT output references pattern + gap (not generic financial advice) and uses human-readable domain names (not `moneyFlow`, `UNDERESTIMATING`)
2. Verify GPT output is plain text, not JSON
3. Intentionally trigger fallback by temporarily disabling GPT call — verify fallback output is coherent and gap-aware
4. Verify fallback output for each profile type (STRONG_SINGLE, BORDERLINE_DUAL, NEGATIVE_DOMINANT)
5. Verify background call fires on page 4 → page 5 transition: add temporary `Logger.log('GPT background triggered')` and check GAS execution logs

---

### Phase 5: Downstream Pre-Population

**Read before starting**: `tools/tool4/Tool4.js` (form rendering section — search for `preSurveyData` to find where pre-survey fields are accessed), `tools/tool6/Tool6.js` (search for `preSurveyData` and `a1_grossIncome` — read around lines 450–510 to understand the pre-survey data layer), `tools/tool8/Tool8.js` (input section)

**Tool 6 architecture note**: Tool 6 uses a **pre-survey data layer** separate from the main assessment form. Fields `a1_grossIncome`, `a12_current401kBalance`, `a6_filingStatus`, and `a16_monthly401kContribution` are pre-survey fields accessed via `preSurveyData` — not the standard form fields. Pre-populating Tool 6 means providing suggested values when the pre-survey form renders, not patching the main form. Read how `preSurveyData` is built and passed to the pre-survey render function before editing.

**Tool 4 actual field names**: Tool 4's pre-survey uses `monthlyIncome`, `debtBalance`, and `emergencyFund` (found in `preSurveyData`). These are the field names to pre-populate.

**Goal**: Tools 4, 6, 8 read Tool 2 financial data and pre-populate fields.

**Tasks**:
1. Update `Tool4.js` — add Tool 2 data access, pre-populate 3 pre-survey fields with schema guard:
   - `preSurveyData.monthlyIncome` ← `tool2.monthlyTakeHome`
   - `preSurveyData.debtBalance` ← `tool2.totalDebtBalance`
   - `preSurveyData.emergencyFund` ← `tool2.emergencyFundBalance`
2. Update `Tool6.js` — add Tool 2 data access, pre-populate 4 pre-survey fields with schema guard:
   - `preSurveyData.a1_grossIncome` ← `tool2.grossAnnualIncome`
   - `preSurveyData.a12_current401kBalance` ← `tool2.totalRetirementBalance`
   - `preSurveyData.a16_monthly401kContribution` ← `tool2.monthlyRetirementContribution`
   - `preSurveyData.a6_filingStatus` ← derived from `tool2.marital` (`'single'` → `'single'`; `'married'/'partnered'` → `'married_filing_jointly'`)
3. Update `Tool8.js` — add Tool 2 data access, pre-populate 2 fields with schema guard
4. Add *"From your Financial Mirror — update if needed"* label + Edit toggle to each pre-populated field
5. Schema guard on all three tools: `const isNewSchema = tool2Data && tool2Data.results && tool2Data.results.objectiveHealthScores;` — only pre-populate if `isNewSchema` is truthy

**Test protocol**:
1. Complete Tool 2 with new schema, then open Tool 4 — verify monthly income, debt balance, emergency fund pre-survey fields are pre-filled with Tool 2 values
2. Edit a pre-filled value — verify edit mode works and overridden value saves correctly
3. Open Tool 4 as a student with only old-schema Tool 2 data — verify no pre-population occurs, original questions show normally
4. Repeat tests for Tools 6 and 8

---

### Phase 6: CollectiveResults Update

**Read before starting**: `core/CollectiveResults.js` — search for "Financial Structure" section and the awareness gap engine. Read both sections fully before editing.

**Goal**: Correlations layer uses gap data and scarcity flag.

**Tasks**:
1. Add Financial Reality vs. Perception subsection after existing domain score cards
2. Update awareness gap engine inputs to include Tool 2 gap classifications
3. Add scarcity flag context modifier to Integration Analysis section
4. Add schema guard: only render new subsection if `tool2Results.objectiveHealthScores` present

**Test protocol**:
1. Complete full tool sequence (Tools 1 → 2 → 4 → 6 → 8) with new-schema Tool 2 data
2. View Collective Results — verify new Financial Reality vs. Perception subsection renders with correct domain bars and gap labels
3. Verify no rendering errors for students who completed Tool 2 under old schema (new subsection should not appear)

---

## 14. Files to Create / Modify

| File | Action | Phase | Notes |
|------|--------|-------|-------|
| `tools/tool2/Tool2Constants.js` | Update (file exists) | 1 | Add new constants from Section 6.0 |
| `tools/tool2/Tool2.js` | Rewrite pages 2–5, mode toggle, scoring, processFinalSubmission | 1, 2 | Add back nav functions; use DraftService |
| `tools/tool2/Tool2Report.js` | Rewrite — 9-section report structure | 3 | Keep old report path for backward compat |
| `tools/tool2/Tool2GPTAnalysis.js` | File already exists (805 lines). Remove `getPromptForType()` + 7 `getXxxPrompt()` functions; add `startBackgroundAnalysis()`; update context object + system prompt. KEEP `synthesizeOverall()`, `analyzeResponse()`, `callGPT()`, and all supporting infrastructure. | 4 | Plain-text output, label mapping, page 4 trigger; `synthesizeOverall()` still runs at submission |
| `tools/tool2/Tool2Fallbacks.js` | Update fallback templates for gap language | 4 | No escaped apostrophes |
| `tools/tool4/Tool4.js` | Add pre-population with schema guard | 5 | |
| `tools/tool6/Tool6.js` | Add pre-population with schema guard | 5 | |
| `tools/tool8/Tool8.js` | Add pre-population with schema guard | 5 | |
| `core/CollectiveResults.js` | Add gap subsection + awareness engine update | 6 | 5,238 lines — read before editing |
| `tools/tool2/tool.manifest.json` | Update question count, version | 1 | |
| `appsscript.json` | Update if Tool2Constants.js is a new registration | 1 | Check if already listed before adding |

---

*Document version: 1.1 | Last updated: 2026-04-05 | Status: Design — ready for implementation*
