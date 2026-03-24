# Admin System - Quick Start

## 🚀 3-Step Setup

### 1️⃣ Initialize
Open Apps Script Editor → Run this function:
```javascript
initializeAdminSystem()
```

Default credentials will be displayed:
- Username: `admin`
- Password: `admin123`

💡 **Safe to run multiple times** - won't create duplicates

### 2️⃣ Access Dashboard
Visit your web app URL with admin route:
```
https://script.google.com/macros/s/YOUR_ID/exec?route=admin
```

### 3️⃣ Change Password
1. Open Google Sheet → `ADMINS` sheet
2. Edit password in Column B
3. Save

---

## 📋 Common Tasks

### Add a Student
1. Go to **Students** page
2. Fill in form (ID, Name, Email)
3. Click "Add Student"
✅ Student created with Tool 1 unlocked automatically

### Unlock a Tool
1. Go to **Tool Access** page
2. Select student from dropdown
3. Click "Unlock" next to desired tool
✅ Tool immediately accessible to student

### View Activity
1. Go to **Activity Log** page
2. Apply filters if needed
3. See real-time events
✅ Monitor all system actions

### Deactivate Student
1. Go to **Students** page
2. Find student in table
3. Click "Deactivate"
✅ Student can no longer log in

---

## 🔗 Important URLs

Replace `YOUR_ID` with your actual deployment ID:

| Page | URL |
|------|-----|
| Admin Login | `?route=admin` |
| Admin Dashboard | `?route=admin-dashboard` |
| Student Login | `?route=login` |
| Student Dashboard | `?route=dashboard` |

---

## ⚠️ Security Checklist

- [ ] Changed default admin password
- [ ] Using strong password (12+ chars)
- [ ] Limited access to Google Sheet
- [ ] Reviewed ADMINS sheet permissions
- [ ] Tested admin login/logout
- [ ] Created backup admin account (recommended)

---

## 🆘 Troubleshooting

**Can't log in?**
→ Check password in ADMINS sheet (Column B)

**Students not showing?**
→ Refresh page, check STUDENTS sheet exists

**Tool unlock not working?**
→ Check browser console, verify session not expired

**Forgot password?**
→ Edit directly in ADMINS sheet (Column B)

---

## 📞 Need Help?

See full documentation: [ADMIN_SETUP.md](ADMIN_SETUP.md)
