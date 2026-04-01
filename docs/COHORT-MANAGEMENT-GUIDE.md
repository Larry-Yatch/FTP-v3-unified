# Cohort Management Guide

## Table of Contents
- [Admin: Setting Up a New Cohort](#admin-setting-up-a-new-cohort)
- [Admin: Batch Importing Students](#admin-batch-importing-students)
- [Admin: Managing Students Across Cohorts](#admin-managing-students-across-cohorts)
- [Admin: Manual Student Operations](#admin-manual-student-operations)
- [Student: First-Time Login](#student-first-time-login)
- [Student: Returning Login](#student-returning-login)
- [Student: Forgot Your ID](#student-forgot-your-id)

---

## Admin: Setting Up a New Cohort

1. Open the **Admin Dashboard** → click **Cohorts** in the left sidebar
2. Fill in the form:
   - **Name** — e.g., `Cohort 2`
   - **Start Month** — select from dropdown
   - **Start Year** — enter the 4-digit year
3. Click **Create Cohort**
4. The new cohort appears in the table and is immediately available in all cohort dropdowns

> Do not add cohorts directly to the COHORTS sheet — always use the dashboard so the ID is generated correctly.

---

## Admin: Batch Importing Students

### Prepare the Google Sheet

Create a Google Sheet with exactly these three columns (no header row required, but one is fine):

| First Name | Last Name | Email |
|------------|-----------|-------|
| Jane       | Doe       | jane@example.com |
| John       | Smith     | john@example.com |

Make sure the sheet is accessible to the GAS script — either:
- **"Anyone with the link can view"**, or
- Owned by or shared with the Google account that runs the script

### Run the Import

1. Open **Admin Dashboard** → **Students** tab → scroll to **Batch Import**
2. Paste the **Google Sheet URL**
3. Select the **cohort** from the dropdown
4. Click **Preview** — review the results before anything is written:
   - Green rows = will be imported
   - Error rows = duplicates or missing data (will be skipped)
5. Click **Confirm Import** to write the valid rows

### After Import

Students appear in the Students table with status **⏳ Pending setup**. They have no Client ID yet — they create it themselves on first login.

> Students who are already enrolled from a prior cohort will be flagged as duplicates and skipped. To move them to the new cohort, simply update their Cohort column directly in the STUDENTS sheet.

---

## Admin: Managing Students Across Cohorts

### Filtering by Cohort

Every tab in the Admin Dashboard has a **Cohort Filter** dropdown:
- **Students tab** — filter the student list
- **Analytics tab** — filter analytics data
- **Attendance tab** — filter attendance records

Select a cohort from the dropdown to narrow the view. Select **All Cohorts** to see everyone.

### Moving a Student to a Different Cohort

1. Open the **STUDENTS** sheet directly in Google Sheets
2. Find the student's row
3. Update **column I (Cohort)** to the new cohort ID (e.g., `cohort_2`)

This is a display/filter change only — it does not affect login, tool access, or progress data.

---

## Admin: Manual Student Operations

These are run from the **Apps Script Editor** (open the script → select function → click Run).

### Add a single student manually
```javascript
addStudent('', 'Jane Doe', 'jane@example.com', 'cohort_2')
```
Pass an empty string for the ID to create a pending student (recommended). Pass an actual ID to create an active student immediately.

### Check a student's tool access
```javascript
checkStudentAccess('4521JS')
```

### Manually unlock a tool for a student
```javascript
unlockToolForStudent('4521JS', 'tool2')
```

### Initialize missing tool access records
```javascript
initializeStudentAccess('4521JS')
```

### List all students
```javascript
listStudents()
```

---

## Student: First-Time Login

If you were added to the system by your coach, you do not have a Student ID yet. You will create one on your first visit.

1. Go to the TruPath app URL provided by your coach
2. Click **"First time here or forgot your ID?"**
3. Enter your **First Name**, **Last Name**, and **Email** — you only need to match 2 of the 3
4. Click **Look Me Up**
5. If found, you will be prompted to **create your Student ID**

### Creating Your Student ID

Your ID is built from two pieces of information you will always remember:

- **Last 4 digits of your phone number** + **Your initials**

**Examples:**
- Phone ends in `4521`, name is John Smith → `4521JS`
- Phone ends in `9032`, name is Maria Elena Reyes → `9032MER`

**Rules:**
- Must be exactly 4 digits followed by 2 or 3 letters
- Letters will be saved in uppercase automatically
- Must be unique — if your ID is taken, try a variation (e.g., use middle initial)

6. Enter your chosen ID and click **Set My ID & Enter**
7. You will land directly on your dashboard

> Write your Student ID down somewhere safe — you will use it every time you log in.

---

## Student: Returning Login

1. Go to the TruPath app URL
2. Enter your **Student ID** (e.g., `4521JS`)
3. Click **Login**

---

## Student: Forgot Your ID

1. Click **"First time here or forgot your ID?"**
2. Enter your **First Name**, **Last Name**, and **Email** — match any 2 of the 3
3. Click **Look Me Up**
4. You will be logged in and your Student ID will be shown on your dashboard

> If you still cannot get in, contact your coach.
