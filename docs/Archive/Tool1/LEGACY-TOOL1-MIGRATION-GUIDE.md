# Legacy Tool 1 Migration Guide

**Version:** v3.0.0
**Date:** November 5, 2025
**Purpose:** One-time migration of v2 Tool 1 responses to v3 RESPONSES format

---

## 📋 Overview

This migration script transfers 93 legacy Tool 1 student responses from the v2 spreadsheet to the new v3 system format.

**What it does:**
- ✅ Maps legacy email addresses to v3 Client_IDs
- ✅ Transforms 18 legacy questions + 5 rankings to v3 format (26 total fields)
- ✅ Generates missing feeling rankings (uses thought rankings as proxy)
- ✅ Calculates scores and determines trauma category winner
- ✅ Writes properly formatted JSON to RESPONSES sheet
- ✅ Skips students who already have Tool 1 data
- ✅ Preserves original timestamps

---

## 🎯 Prerequisites

Before running the migration:

1. **Backup the spreadsheet** - Make a copy of the v3 master spreadsheet
2. **Verify legacy data access** - Ensure AdminMigration.js can read the legacy spreadsheet
3. **Deploy the code** - Push AdminMigration.js to Apps Script
4. **Refresh the spreadsheet** - Reload to see the Admin Tools menu

---

## 🔧 Step-by-Step Migration Process

### **Step 1: Preview the Migration (REQUIRED)**

**Purpose:** See what will happen without writing any data.

1. Open the v3 Master Spreadsheet
2. Click **"🔧 Admin Tools"** menu (top menu bar)
3. Select **"📊 Preview Legacy Tool 1 Migration"**
4. Review the preview dialog:
   - Shows first 5 records that will be migrated
   - Shows counts: Total, Will Process, Will Skip, Errors
   - Shows winner trauma category for each student

**What to check:**
- ✅ Email addresses are mapping correctly to Client_IDs
- ✅ Names match expected students
- ✅ Skip count makes sense (students who already have Tool 1)
- ✅ No unexpected errors

**Preview Dialog Example:**
```
PREVIEW MODE - No data written

Total records: 93
Will process: 85
Will skip: 8
Errors: 0

First 5 records:

✓ 2798AM - Adrian Marrero
  Winner: ExVal
  Scores: FSV=18, ExVal=29

✓ 1126AP - Albert Pacal
  Winner: ExVal
  Scores: FSV=5, ExVal=23

⚠️ test@example.com - Email not found in Students sheet

...
```

### **Step 2: Review Logs (OPTIONAL)**

For more detailed information:

1. Go to **Extensions → Apps Script**
2. Click **"View → Logs"** (or press Ctrl+Enter / Cmd+Enter)
3. Review detailed processing logs

**What to look for:**
- Mapping statistics
- Individual student processing results
- Any warnings or errors

### **Step 3: Run the Migration**

**⚠️ WARNING: This writes data. Only run once!**

1. Open the v3 Master Spreadsheet
2. Click **"🔧 Admin Tools"** menu
3. Select **"✅ Run Legacy Tool 1 Migration"**
4. Read the confirmation dialog carefully
5. Click **"Yes"** to proceed or **"No"** to cancel

**What happens:**
- Reads all 93 legacy records
- Maps emails to Client_IDs
- Transforms data to v3 format
- Calculates scores and winner for each
- Writes to RESPONSES sheet with proper JSON structure
- Logs all activity to ACTIVITY_LOG

**Completion Dialog Example:**
```
Migration Complete!

Total records: 93
Migrated: 85
Skipped: 8
Errors: 0

✓ All records migrated successfully!
```

### **Step 4: Verify the Results**

1. **Check RESPONSES Sheet:**
   - Open RESPONSES sheet
   - Filter by `Tool_ID = tool1`
   - Verify count matches "Migrated" count from dialog
   - Spot-check a few records:
     - JSON structure looks correct
     - Status = COMPLETED
     - Is_Latest = TRUE

2. **Check Sample Student:**
   - Pick a migrated student (e.g., Adrian Marrero → 2798AM)
   - Login as that student (or check their data directly)
   - Navigate to Tool 1 report
   - Verify scores and winner display correctly

3. **Test Tool 2 Integration:**
   - Login as a migrated student
   - Start Tool 2
   - Verify Page 1 pre-fills name and email from Tool 1

---

## 📊 Data Transformation Details

### **Legacy Format (v2):**
```
Columns:
- Email, Timestamp, Name
- 18 questions (q3-q22) as individual columns
- 5 thought rankings (thought_fsv, thought_control, thought_showing, thought_exval, thought_fear)
- Missing: 6 feeling rankings
```

### **v3 Format:**
```json
{
  "formData": {
    "name": "Adrian Marrero",
    "email": "admarrero@hotmail.com",
    "q3": "2", "q4": "3", ... "q22": "4",
    "thought_fsv": "9", "thought_control": "5", ...,
    "feeling_fsv": "9", "feeling_control": "5", ...,
    "_migrated": true,
    "_originalTimestamp": "4/24/2025 13:18:08",
    "_migratedAt": "2025-11-05T19:30:00.000Z"
  },
  "scores": {
    "FSV": 18,
    "ExVal": 29,
    "Showing": 23,
    "Receiving": 10,
    "Control": 12,
    "Fear": 12
  },
  "winner": "ExVal"
}
```

### **Feeling Rankings Generation:**

Since legacy data lacks feeling rankings, the script uses **thought rankings as proxy values**:

```javascript
feeling_fsv = thought_fsv
feeling_exval = thought_exval
feeling_showing = thought_showing
feeling_receiving = thought_receiving (or 6 if missing)
feeling_control = thought_control
feeling_fear = thought_fear
```

**Why this works:**
- Thought and feeling rankings are highly correlated
- This is a one-time migration (not ongoing)
- Acceptable trade-off for data completeness
- Students can always retake Tool 1 if they want to update

---

## 🔍 Troubleshooting

### **Problem: Email not found in Students sheet**

**Symptom:** Preview shows "Email not found in Students sheet"

**Solution:**
1. Check if student exists in Students sheet
2. Verify email addresses match exactly (case-insensitive)
3. Add missing student: `addStudent('CLIENT_ID', 'Name', 'email@example.com')`
4. Run preview again

### **Problem: Tool 1 already completed**

**Symptom:** Preview shows "Tool 1 already completed"

**Solution:**
- This is expected behavior (prevents duplicates)
- If you need to re-migrate a student:
  1. Delete their existing Tool 1 row from RESPONSES sheet
  2. Run migration again

### **Problem: Execution timeout**

**Symptom:** Script times out after 6 minutes

**Solution:**
- Unlikely with only 93 records
- If it happens, check Apps Script logs for progress
- Migration is idempotent - run again and it will skip completed records

### **Problem: Invalid scores/winner**

**Symptom:** Scores look wrong or winner doesn't match expectations

**Solution:**
1. Check legacy data for that student
2. Verify question mapping in AdminMigration.js (q3→FSV, etc.)
3. Manually verify score calculation
4. Report issue if calculation logic is wrong

---

## 📝 Post-Migration Checklist

- [ ] Preview completed successfully
- [ ] Migration completed successfully
- [ ] RESPONSES sheet has expected number of Tool 1 records
- [ ] Spot-checked 3-5 student records
- [ ] Verified Tool 1 report displays correctly for migrated student
- [ ] Verified Tool 2 pre-fills name/email from migrated Tool 1 data
- [ ] Deleted test records (if any)
- [ ] Backed up spreadsheet after successful migration

---

## 🚨 Safety Features

The migration script includes multiple safety layers:

1. **Preview Mode** - See results before committing
2. **Duplicate Detection** - Skips students with existing Tool 1 data
3. **Email Validation** - Only migrates students in Students sheet
4. **Error Isolation** - One bad record doesn't stop the whole migration
5. **Detailed Logging** - Every step logged for debugging
6. **Confirmation Dialog** - Must explicitly confirm before writing data
7. **Idempotent** - Safe to run multiple times (skips completed)

---

## 📈 Expected Results

**Total Legacy Records:** 93
**Expected to Migrate:** ~85-90 (students in Students sheet)
**Expected to Skip:** ~3-8 (already have Tool 1 or email not found)
**Expected Errors:** 0

---

## 🔄 Re-running the Migration

If you need to re-run for specific students:

1. **Delete their Tool 1 record** from RESPONSES sheet:
   - Filter: `Tool_ID = tool1` AND `Client_ID = [STUDENT_ID]`
   - Delete the row

2. **Run migration again** - It will process only students without Tool 1 data

---

## 📞 Support

If you encounter issues:

1. Check the Execution log: `Extensions → Apps Script → View → Logs`
2. Review the Troubleshooting section above
3. Verify legacy spreadsheet access permissions
4. Check that AdminMigration.js deployed correctly

---

## ✅ Migration Complete!

Once migration is complete:

- All legacy Tool 1 students can now access their reports in v3
- Tool 2 will pre-fill data from migrated Tool 1 responses
- Students can edit or retake Tool 1 if they want to update their responses
- New students will complete Tool 1 directly in v3 (no migration needed)

**Next Steps:**
1. Mark this migration as complete in your project notes
2. Archive the legacy Tool 1 spreadsheet (keep for reference)
3. Monitor first few Tool 2 completions to verify integration works

---

**Migration Script Location:** `/AdminMigration.js`
**Menu Location:** `🔧 Admin Tools → Migration Options`
**Last Updated:** November 5, 2025
