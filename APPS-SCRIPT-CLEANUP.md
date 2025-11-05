# Apps Script Files - Manual Cleanup Guide

**Date:** November 4, 2025

---

## ✅ Files That SHOULD Be In Apps Script (Keep These)

### Root Files (5)
- ✅ appsscript.json
- ✅ Code.js
- ✅ Config.js
- ✅ cleanup-edit-drafts.js
- ✅ validate-navigation.js
- ✅ validate-setup.js

### Core Modules (10)
- ✅ core/Authentication.js
- ✅ core/DataService.js
- ✅ core/FormUtils.js
- ✅ core/FrameworkCore.js
- ✅ core/InsightsPipeline.js
- ✅ core/ResponseManager.js
- ✅ core/Router.js
- ✅ core/ToolAccessControl.js
- ✅ core/ToolInterface.js
- ✅ core/ToolRegistry.js

### Shared Resources (3)
- ✅ shared/loading-animation.html
- ✅ shared/styles.html
- ✅ examples/animation-demo.html (optional - could delete)

### Tools (6)
- ✅ tools/MultiPageToolTemplate.js
- ✅ tools/tool1/Tool1.js
- ✅ tools/tool1/Tool1Report.js
- ✅ tools/tool1/Tool1Templates.js
- ✅ tools/tool2/Tool2.js (skeleton - ready for development)
- ✅ tools/tool2/Tool2Report.js (skeleton - ready for development)

**Total: 26 files**

---

## ❌ Files That Should Be DELETED From Apps Script

Go to [Apps Script Editor](https://script.google.com/d/1MiCHoXZfXwjrqrRhaXAvfagae9hC32RbmPHItHzANdkKlxJ6Hm81MPuQ/edit) and manually delete these if they exist:

### Old Fix Scripts (Already Archived Locally)
- ❌ check-responses.js
- ❌ check-sheets.js
- ❌ debug-sheets.js
- ❌ sheets.js
- ❌ fix-is-latest-column.js
- ❌ fix-responses-sheet.js

### Other Files to Check For
- ❌ Any test files (test-*.js)
- ❌ Any backup files (*-backup.js, *-old.js)
- ❌ Any .DS_Store files
- ❌ examples/animation-demo.html (optional - not needed in production)

---

## 📋 Manual Cleanup Steps

### Step 1: Open Apps Script Editor
```
https://script.google.com/d/1MiCHoXZfXwjrqrRhaXAvfagae9hC32RbmPHItHzANdkKlxJ6Hm81MPuQ/edit
```

### Step 2: Check File List
Look in the left sidebar for any files not in the "Keep These" list above.

### Step 3: Delete Old Files
For each file to delete:
1. Click the 3-dot menu next to the file
2. Select "Delete"
3. Confirm deletion

### Step 4: Verify Clean State
After cleanup, your Apps Script project should have exactly:
- **5 root files** (Code, Config, cleanup-edit-drafts, validate-navigation, validate-setup)
- **10 core/ files**
- **2-3 shared/ files** (can delete animation-demo if you want)
- **6 tools/ files**

**Total: 23-24 files**

---

## 🔍 How to Check What's Currently There

Unfortunately, `clasp` doesn't have a command to list remote files. You must:

1. Open Apps Script Editor in browser
2. Look at file tree in left sidebar
3. Compare with "Keep These" list above
4. Delete any extras manually

---

## ⚠️ IMPORTANT

**Do NOT delete these commonly confused files:**
- cleanup-edit-drafts.js ← **KEEP** (current utility, still useful)
- validate-navigation.js ← **KEEP** (validation tool)
- validate-setup.js ← **KEEP** (setup validation)

**Only delete:**
- check-responses.js ← **DELETE** (archived)
- check-sheets.js ← **DELETE** (archived)
- debug-sheets.js ← **DELETE** (archived)
- sheets.js ← **DELETE** (archived)
- fix-is-latest-column.js ← **DELETE** (archived, bug fixed)
- fix-responses-sheet.js ← **DELETE** (archived, bug fixed)

---

## ✅ After Cleanup

Once Apps Script is clean:

1. ✅ Files match local project structure
2. ✅ No old fix scripts cluttering the editor
3. ✅ Ready for Tool 2 development
4. ✅ Clean, professional codebase

---

*Last Updated: November 4, 2025*
