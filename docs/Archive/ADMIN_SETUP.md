# Admin System Setup Guide

## Overview

The Financial TruPath v3 admin system provides a web-based interface for managing students, controlling tool access, and monitoring activity. This replaces the previous command-line admin functions that required manual parameter entry.

## Features

✅ **Web-Based Interface** - Modern, user-friendly dashboard accessible from any browser
✅ **Student Management** - Add, view, and manage student accounts with forms
✅ **Tool Access Control** - Unlock/lock tools for students with visual interface
✅ **Activity Monitoring** - View real-time activity logs with filtering
✅ **Secure Authentication** - Admin login with session management
✅ **Mobile Responsive** - Works on desktop, tablet, and mobile devices

## Quick Start

### Step 1: Initialize Admin System

Run this function in the Apps Script editor:

```javascript
initializeAdminSystem()
```

This will:
1. Create the `ADMINS` sheet if it doesn't exist
2. Add a default admin account (only if sheet is being created)
3. Display the default credentials

**Note:** Safe to run multiple times - it won't duplicate the admin account if the sheet already exists.

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

### Step 2: Access Admin Dashboard

1. Deploy your web app (if not already deployed)
2. Visit: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?route=admin`
3. Log in with the credentials from Step 1
4. You'll be redirected to the admin dashboard

### Step 3: Change Default Password

1. Open your Google Sheet
2. Go to the `ADMINS` sheet
3. Find the admin user row
4. Update the password in column B
5. Save the sheet

⚠️ **Security Note:** In production, implement proper password hashing (bcrypt, etc.)

## Admin Dashboard Features

### 📊 Overview Page

View system-wide statistics:
- Total students
- Active students
- Tool completions
- Recent activity

### 👥 Students Page

**Add New Student:**
1. Fill in the form:
   - Student ID (e.g., `STU001`)
   - Full Name
   - Email Address
2. Click "Add Student"
3. Student is automatically created with Tool 1 unlocked

**Manage Existing Students:**
- View all students in a table
- See status, email, and progress
- Activate/Deactivate accounts
- View tool access for any student

### 🔐 Tool Access Page

**Control Tool Access:**
1. Select a student from the dropdown
2. View all 8 tools and their current status
3. Unlock locked tools (bypass normal progression)
4. Lock unlocked tools (prevent access)
5. See unlock dates and history

**Use Cases:**
- Give early access for testing
- Skip tools for special cases
- Lock tools for compliance reasons
- Grant demo access

### 📝 Activity Log Page

**Monitor System Activity:**
- View all user actions in real-time
- Filter by:
  - Student ID
  - Action type (unlocked, completed, started, etc.)
- See timestamps and details
- Track 100 most recent activities

## Admin Functions Reference

While the web dashboard is recommended, these backend functions are available:

### Student Management

```javascript
// Add a student (used by dashboard)
handleAddStudentRequest(sessionToken, {
  clientId: 'STU001',
  name: 'John Doe',
  email: 'john@example.com'
})

// Get all students
handleGetStudentsRequest(sessionToken)

// Update student status
handleUpdateStudentStatusRequest(sessionToken, 'STU001', 'inactive')
```

### Tool Access Control

```javascript
// Get student's tool access
handleGetStudentAccessRequest(sessionToken, 'STU001')

// Unlock a tool
handleUnlockToolRequest(sessionToken, 'STU001', 'tool2')

// Lock a tool
handleLockToolRequest(sessionToken, 'STU001', 'tool2', 'Testing purposes')
```

### Activity & Authentication

```javascript
// Get activity log
handleGetActivityLogRequest(sessionToken, {
  clientId: 'STU001',
  action: 'tool_completed',
  limit: 50
})

// Login
handleAdminLogin('admin', 'password')

// Logout
clearAdminSession()
```

## Security Best Practices

### 1. Change Default Credentials

Immediately change the default admin username and password.

### 2. Use Strong Passwords

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common words or patterns

### 3. Limit Admin Accounts

- Create separate accounts for each admin
- Use principle of least privilege
- Remove unused accounts

### 4. Regular Audits

- Review activity logs weekly
- Check for unauthorized access attempts
- Monitor student additions/changes

### 5. Secure Your Google Sheet

- Limit edit access to authorized personnel only
- Enable version history
- Set up notification rules

### 6. Implement Password Hashing

For production deployment, update `AdminRouter.js` to use proper password hashing:

```javascript
// BEFORE (current - insecure)
if (adminPassword === password) { ... }

// AFTER (recommended)
const Utilities = require('utilities');
const hashedInput = Utilities.computeDigest(
  Utilities.DigestAlgorithm.SHA_256,
  password
);
if (adminPasswordHash === hashedInput) { ... }
```

## Troubleshooting

### Cannot Access Admin Dashboard

**Problem:** "Not authenticated" error

**Solutions:**
1. Clear browser cache and cookies
2. Make sure you ran `initializeAdminSystem()`
3. Check that ADMINS sheet exists
4. Verify credentials are correct

### Admin Login Doesn't Work

**Problem:** Invalid credentials error

**Solutions:**
1. Check spelling of username/password
2. Ensure admin status is 'active' in ADMINS sheet
3. Verify ADMINS sheet has correct headers
4. Try resetting password in the sheet

### Students Not Appearing

**Problem:** Empty student list

**Solutions:**
1. Check STUDENTS sheet exists and has data
2. Verify sheet name matches `CONFIG.SHEETS.STUDENTS`
3. Check for JavaScript errors in browser console
4. Refresh the page

### Tool Access Not Working

**Problem:** Cannot unlock/lock tools

**Solutions:**
1. Verify TOOL_ACCESS sheet exists
2. Check student exists in STUDENTS sheet
3. Ensure admin session is valid (not expired)
4. Check browser console for errors

## URLs Reference

Assuming your web app URL is: `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`

- **Admin Login:** `?route=admin` or `?route=admin-login`
- **Admin Dashboard:** `?route=admin-dashboard`
- **Student Dashboard:** `?route=dashboard`
- **Login:** `?route=login`

## Files Overview

### Backend
- **`AdminRouter.js`** - Admin routing and API endpoints
- **`AdminFunctions.js`** - Legacy admin utilities (still functional)
- **`core/Router.js`** - Main routing with admin route handling

### Frontend
- **`html/AdminLogin.html`** - Admin login page
- **`html/AdminDashboard.html`** - Admin dashboard interface

### Data Sheets
- **`ADMINS`** - Admin user accounts
- **`STUDENTS`** - Student records
- **`TOOL_ACCESS`** - Tool access control
- **`ACTIVITY_LOG`** - System activity history

## Migration from Old System

If you were using the old Apps Script editor functions:

| Old Function | New Method |
|-------------|------------|
| `addStudent('STU001', 'Name', 'email')` | Use "Add New Student" form in dashboard |
| `listStudents()` | View "Students" page in dashboard |
| `checkStudentAccess('STU001')` | Select student in "Tool Access" page |
| `unlockToolForStudent('STU001', 'tool2')` | Click "Unlock" button in Tool Access page |

**Benefits of New System:**
- ✅ No need to type function parameters
- ✅ Visual confirmation of actions
- ✅ No need to check execution logs
- ✅ Real-time data updates
- ✅ Better error messages
- ✅ Mobile accessible

## Next Steps

1. ✅ Initialize admin system
2. ✅ Access admin dashboard
3. ✅ Change default password
4. ✅ Add your first student
5. ✅ Test tool access control
6. ✅ Review activity logs
7. ⚠️ Implement password hashing (production)
8. ⚠️ Set up backup procedures

## Support

For issues or questions:
1. Check this documentation
2. Review the Troubleshooting section
3. Check browser console for errors
4. Review Apps Script execution logs

## Version History

- **v3.9.0** (Nov 19, 2025) - Initial admin system release
  - Web-based admin interface
  - Student management
  - Tool access control
  - Activity monitoring
