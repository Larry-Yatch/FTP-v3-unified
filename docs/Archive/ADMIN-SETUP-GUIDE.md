# Admin Setup Guide - Financial TruPath v3

## 🎯 Quick Start: Create TEST001 User

The easiest way to get started is to run **one function** in Google Apps Script:

### Step 1: Open Google Apps Script Editor
```
https://script.google.com/d/1MiCHoXZfXwjrqrRhaXAvfagae9hC32RbmPHItHzANdkKlxJ6Hm81MPuQ/edit
```

### Step 2: Run `quickAdminSetup`
1. In the function dropdown, select: **`quickAdminSetup`**
2. Click **Run** ▶️
3. Check **View > Logs** for output

**This will:**
- Create TEST001 user
- Set up tool access (Tool 1 unlocked, rest locked)
- Display your web app URL
- Verify everything works

### Step 3: Test Login
1. Visit your web app URL (shown in logs)
2. Enter Student ID: `TEST001`
3. Enter any password (auth not implemented yet)
4. Click **Sign In**

**You should see:**
- Welcome dashboard
- Tool 1 card (Ready/Unlocked)
- Tool 2 card (Locked)
- Professional TruPath branding

---

## 📋 Available Admin Functions

All these functions can be run from the GAS Editor:

### **Add Students**

#### `addTestUser()`
Creates TEST001 user quickly.
```javascript
// Just run this function - no parameters needed
addTestUser()
```

#### `addStudent(clientId, name, email)`
Add a specific student.
```javascript
// Example: Add a custom test user
addStudent('STUDENT_123', 'John Doe', 'john@example.com')
```

#### `addTestUsers()`
Create 3 test users at once (TEST001, TEST002, TEST003).
```javascript
addTestUsers()
```

---

### **View Students**

#### `listStudents()`
See all students in the system.
```javascript
listStudents()
```

**Output:**
```
=== Students List ===

ID: TEST001
Name: Test Student
Email: test@trupath.com
Status: active
Enrolled: [date]
Tools Completed: 0
Current Tool: tool1
---

Total: 1 students
```

---

### **Manage Tool Access**

#### `checkStudentAccess(clientId)`
See which tools a student can access.
```javascript
checkStudentAccess('TEST001')
```

**Output:**
```
=== Access Status for TEST001 ===

tool1: unlocked
  Unlocked: [date]
tool2: pending
tool3: pending
...
```

#### `unlockToolForStudent(clientId, toolId)`
Manually unlock a tool (admin override).
```javascript
// Example: Unlock Tool 2 for TEST001
unlockToolForStudent('TEST001', 'tool2')
```

#### `initializeStudentAccess(clientId)`
Set up tool access if missing (usually not needed).
```javascript
initializeStudentAccess('TEST001')
```

---

## 🔍 Verify Setup in Google Sheets

After running `quickAdminSetup()`, check your spreadsheet:

### **Students Sheet**
Should have a row with:
- Client_ID: TEST001
- Name: Test Student
- Email: test@trupath.com
- Status: active
- Tools_Completed: 0
- Current_Tool: tool1

### **TOOL_ACCESS Sheet**
Should have rows for TEST001:
- tool1: unlocked
- tool2-8: pending

---

## 🧪 Testing the Login Flow

### **Test 1: Login Page**
```
URL: [Your Web App URL]

Expected:
- See "TruPath Financial" logo in gold
- Dark purple gradient background
- Login form with Student ID and Password fields
- "Your Journey to Financial Clarity" subtitle
```

### **Test 2: Dashboard**
```
URL: [Your Web App URL]?route=dashboard&client=TEST001

Expected:
- "Welcome to TruPath Financial" header
- Tool 1 card with "Ready" badge
- Tool 2 card with "Locked" badge
- "Start Assessment" button on Tool 1
- Logout button at bottom
```

### **Test 3: Tool 1 Access** (Once Tool 1 is built)
```
URL: [Your Web App URL]?route=tool1&client=TEST001

Expected:
- Tool 1 loads successfully
- No "access denied" error
```

---

## 🛠️ Common Admin Tasks

### **Add a Real Student**
```javascript
addStudent('STUD_2024_001', 'Jane Smith', 'jane.smith@email.com')
```

### **Check If a Student Exists**
```javascript
listStudents()  // Look for the student ID in the output
```

### **Give a Student Early Access to Tool 2**
```javascript
unlockToolForStudent('TEST001', 'tool2')
```

### **See All Students and Their Progress**
```javascript
listStudents()
```

---

## 📊 Sheet Structure Reference

### **Students Sheet Columns:**
1. Client_ID (e.g., "TEST001")
2. Name
3. Email
4. Status ("active", "paused", "completed")
5. Enrolled_Date
6. Last_Activity
7. Tools_Completed (number)
8. Current_Tool (e.g., "tool1")

### **TOOL_ACCESS Sheet Columns:**
1. Client_ID
2. Tool_ID (tool1-tool8)
3. Status ("pending", "unlocked", "locked")
4. Prerequisites (JSON array)
5. Unlocked_Date
6. Locked_By (for admin locks)
7. Lock_Reason

---

## 🚨 Troubleshooting

### **Problem: "Student already exists" error**
**Solution:** The student is already in the system. Use `listStudents()` to see all students.

### **Problem: No access records found**
**Solution:** Run `initializeStudentAccess('STUDENT_ID')` to create access records.

### **Problem: Can't see dashboard after login**
**Solution:**
1. Check that student exists: `listStudents()`
2. Verify access: `checkStudentAccess('STUDENT_ID')`
3. Make sure you're using the correct web app URL

### **Problem: Tool 1 shows "Access Denied"**
**Solution:**
1. Check access: `checkStudentAccess('STUDENT_ID')`
2. Tool 1 should show "unlocked"
3. If not, run: `initializeStudentAccess('STUDENT_ID')`

---

## 🎯 Next Steps After Setup

Once TEST001 is created and working:

1. ✅ **Verify login flow** - Can you see the dashboard?
2. ✅ **Check tool access** - Is Tool 1 unlocked?
3. ✅ **Test navigation** - Click around the interface
4. ✅ **Verify branding** - Does it look like TruPath?

Then you're ready to:
- Build Tool 1 (migration from v1)
- Test the full user journey
- Add real students when ready for production

---

## 📞 Quick Reference

**Web App URL:**
```
https://script.google.com/macros/s/AKfycbx4Db59S_aORDt3arVenyUhc6qQqCwFfokGXkfQk6QTVkzp6Zy6FOysOZv_HMbwMlaI/exec
```

**GAS Editor:**
```
https://script.google.com/d/1MiCHoXZfXwjrqrRhaXAvfagae9hC32RbmPHItHzANdkKlxJ6Hm81MPuQ/edit
```

**Spreadsheet:**
```
https://docs.google.com/spreadsheets/d/1dEcTk-ODdp4mmYqPl4Du8jgmoUjhpnEjOgFfOOdEznc/edit
```

---

*Last Updated: November 3, 2024 - v3.0.1*
