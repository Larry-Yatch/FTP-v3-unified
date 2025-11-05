# Tool 1: Scale Update Task - Convert to -5 to +5 (No Zero)

**Date:** November 4, 2024
**Priority:** Medium (Complete before Tool 2 deployment)
**Estimated Time:** 30-45 minutes
**Status:** 📋 Planned

---

## 🎯 Objective

Update Tool 1 (Core Trauma Strategy Assessment) to use the standardized **-5 to +5 scale (no zero)** instead of the current -5 to +5 **with zero** (11-point scale).

This standardization ensures consistency across all v3 tools and forces intentional responses (no neutral fence-sitting).

---

## 📊 Current State

**Tool 1 Current Scale:** -5 to +5 **with 0** (11 points)
- Pages 2-4: 18 trauma strategy questions
- Page 5: 6 ranking questions (not affected)

**Scale Options Currently:**
```javascript
<option value="-5">-5 (Not relevant at all)</option>
<option value="-4">-4</option>
<option value="-3">-3</option>
<option value="-2">-2</option>
<option value="-1">-1</option>
<option value="0">0</option>  // ← REMOVE THIS
<option value="1">1</option>
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5 (Very relevant)</option>
```

---

## ✅ Tasks

### **1. Update Tool1.js - Question Rendering**

**Files to Edit:**
- `/Users/Larry/Documents/agent-girl/v3-fin-nav/tools/tool1/Tool1.js`

**Pages to Update:**
- `renderPage2Content()` - Lines 92-133 (6 questions)
- `renderPage3Content()` - Lines 138-179 (6 questions)
- `renderPage4Content()` - Lines 184-225 (6 questions)

**Change Required:**
Remove the zero option from all select dropdowns:

**Before:**
```javascript
<select name="${q.name}" required>
  <option value="">Select a response</option>
  <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Not relevant at all)</option>
  <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
  <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
  <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
  <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
  <option value="0" ${selected === '0' ? 'selected' : ''}>0</option>  // ← REMOVE
  <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
  <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
  <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
  <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
  <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Very relevant)</option>
</select>
```

**After:**
```javascript
<select name="${q.name}" required>
  <option value="">Select a response</option>
  <option value="-5" ${selected === '-5' ? 'selected' : ''}>-5 (Not relevant at all)</option>
  <option value="-4" ${selected === '-4' ? 'selected' : ''}>-4</option>
  <option value="-3" ${selected === '-3' ? 'selected' : ''}>-3</option>
  <option value="-2" ${selected === '-2' ? 'selected' : ''}>-2</option>
  <option value="-1" ${selected === '-1' ? 'selected' : ''}>-1</option>
  <option value="1" ${selected === '1' ? 'selected' : ''}>1</option>
  <option value="2" ${selected === '2' ? 'selected' : ''}>2</option>
  <option value="3" ${selected === '3' ? 'selected' : ''}>3</option>
  <option value="4" ${selected === '4' ? 'selected' : ''}>4</option>
  <option value="5" ${selected === '5' ? 'selected' : ''}>5 (Very relevant)</option>
</select>
```

**Pro Tip:** Use find-replace in your editor:
- Find: `<option value="0" ${selected === '0' ? 'selected' : ''}>0</option>\n`
- Replace: *(empty)*

---

### **2. Update Scoring Logic (If Needed)**

**File:** `/Users/Larry/Documents/agent-girl/v3-fin-nav/tools/tool1/Tool1.js`

**Check:** `processResults()` function (around line 250+)

**Current Behavior:**
- Sums trauma category scores
- Zero was a valid value

**Action Required:**
✅ **NO CHANGES NEEDED** - Scoring logic already handles the range correctly. Removing zero doesn't break calculations.

**Verification:**
```javascript
// Example current scoring
const fsvScore = parseInt(data.q3 || 0) + parseInt(data.q4 || 0) + ...;
// This works with or without zero in the scale
```

---

### **3. Update Documentation**

**Files to Update:**

**A. Tool Manifest**
- `/Users/Larry/Documents/agent-girl/v3-fin-nav/tools/tool1/tool.manifest.json`

Current scale note (if any) → Update to reflect new range

**B. Implementation Doc**
- `/Users/Larry/Documents/agent-girl/v3-fin-nav/docs/TOOL1-IMPLEMENTATION-COMPLETE.md`

Add note in "Changes from Original Design" section:
```markdown
### Scale Standardization (Nov 4, 2024)
- **Changed:** -5 to +5 with zero (11 points) → -5 to +5 without zero (10 points)
- **Rationale:** Forces intentional responses, cleaner interpretation, matches Tool 2+ standard
- **Impact:** Minimal - scoring logic unchanged, user experience improved
```

---

### **4. Test Thoroughly**

**Test Cases:**

**A. New Response Flow:**
1. Start Tool 1 as TEST001
2. Complete Pages 1-4
3. Verify no "0" option appears on Pages 2-4
4. Submit and verify scores calculate correctly

**B. Resume Flow (Existing Data):**
1. If any existing responses have "0" values:
   - They should NOT crash the system
   - Dropdown should show "Select a response" (no pre-selection)
   - User must select -5 to +5 to continue

**C. Scoring Verification:**
1. Complete Tool 1 with various negative/positive scores
2. Verify report generates correctly
3. Check that Tool 2 unlocks properly

**Testing Checklist:**
- [ ] Pages 2-4 render correctly with 10-point scale
- [ ] No "0" option visible in any dropdown
- [ ] Form validation works (all questions required)
- [ ] Draft auto-save works
- [ ] Resume from draft works
- [ ] Final submission succeeds
- [ ] Scores calculate correctly
- [ ] Report generates without errors
- [ ] Tool 2 unlocks properly

---

### **5. Deploy**

**Deployment Steps:**

```bash
# Navigate to project
cd /Users/Larry/Documents/agent-girl/v3-fin-nav

# Test clasp connection
clasp push --dry-run

# Push changes
clasp push

# Create new deployment
clasp deploy --description "v3.2.7 - Tool 1 scale standardization (-5 to +5, no zero)"

# Test in production
# Login as TEST001 and complete Tool 1
```

**Git Workflow:**
```bash
git add tools/tool1/Tool1.js
git add docs/TOOL1-IMPLEMENTATION-COMPLETE.md
git commit -m "fix(tool1): Standardize scale to -5 to +5 (no zero) for consistency"
git push
```

---

## 🔍 Edge Cases to Consider

### **Existing Student Data with Zero Values**

**Scenario:** Students who completed Tool 1 before this update may have "0" responses stored.

**Handling:**
1. **Report Generation:** Scores with 0 are still valid, reports generate fine
2. **Re-editing:** If student tries to resume/edit:
   - Zero values are technically still in database
   - Form won't show "0" option
   - Student sees "Select a response" and must choose -1 or +1
   - On save, new value overwrites old zero

**Action:** ✅ No special migration needed, graceful degradation works

---

### **Scoring Impact Analysis**

**Question:** Does removing zero change score distributions?

**Answer:** Slightly, but predictably:

**Before (11-point scale):**
- Range: -5 to +5
- Midpoint: 0
- Students who felt "neutral" selected 0

**After (10-point scale):**
- Range: -5 to +5 (skipping 0)
- No midpoint
- Students must choose slight negative (-1) or slight positive (+1)

**Impact on Insights:**
- ✅ Better data quality (forces decision)
- ✅ Clearer trauma identification (no fence-sitting)
- ⚠️ Scores may shift slightly higher or lower (not neutral)

**Mitigation:** This is DESIRED behavior. Neutral responses hide true patterns.

---

## 📋 Acceptance Criteria

**Definition of Done:**
- [ ] All three pages (2, 3, 4) show 10-point scale (no zero)
- [ ] Form validation works correctly
- [ ] Existing draft data doesn't break
- [ ] Scores calculate correctly with new scale
- [ ] Report generation works
- [ ] Tool 2 unlocks properly
- [ ] Documentation updated
- [ ] Tested with TEST001 user
- [ ] Deployed to production
- [ ] Git committed and pushed

---

## 🚀 Estimated Timeline

| Task | Time | Complexity |
|------|------|------------|
| Update Tool1.js (3 pages) | 15 min | Low |
| Test locally | 10 min | Low |
| Update documentation | 5 min | Low |
| Deploy & test production | 10 min | Low |
| **Total** | **40 min** | **Low** |

---

## 📞 Questions Before Starting?

**Q: What if a student is currently mid-assessment when we deploy?**
**A:** Draft data is saved with old values, form shows new options. On next page, they see new scale. No issue.

**Q: Should we notify existing students?**
**A:** No. This is a backend change. Most students haven't started Tool 1 yet. Those who have won't notice (no "0" in their data likely).

**Q: Does this affect Tool 1 Report generation?**
**A:** No. Scoring logic is sum-based, zero or no zero doesn't matter mathematically.

**Q: Should we update scale labels too?**
**A:** Current labels are fine:
- -5: "Not relevant at all"
- +5: "Very relevant"
- These still make sense without zero

---

## ✅ Ready to Execute

Once you're ready:
1. Read this document fully
2. Make the 3-line change (remove zero option) in Tool1.js
3. Test with TEST001
4. Deploy
5. Mark as complete in handoff doc

**Simple, low-risk, high-value change.** 🚀

---

**End of Document**
