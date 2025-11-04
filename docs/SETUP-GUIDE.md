# Financial TruPath v3 - Setup Guide

## 🚀 Getting Started with v3

This guide walks you through setting up the v3 platform from scratch.

---

## Step 1: Create Google Spreadsheet

### **1.1 Create New Spreadsheet**
1. Go to Google Sheets: https://sheets.google.com
2. Create new spreadsheet
3. Name it: **"FTP-v3-Mastersheet"**
4. Copy the Spreadsheet ID from the URL

```
URL: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
                                            ^^^^^^^^^^^^^^^^^^^^
                                            Copy this part
```

### **1.2 Update Config.js**
```bash
# Edit Config.js
nano /Users/Larry/code/Financial-TruPath-v3/Config.js
```

Replace `YOUR_SHEET_ID_HERE` with your actual Spreadsheet ID.

---

## Step 2: Initialize Google Apps Script Project

### **2.1 Install Dependencies**
```bash
cd /Users/Larry/code/Financial-TruPath-v3
npm install
```

### **2.2 Login to clasp**
```bash
npx clasp login
```

### **2.3 Create New GAS Project**
```bash
npx clasp create --type standalone --title "Financial TruPath v3"
```

This creates a `.clasp.json` file with your script ID.

### **2.4 Push Code to Google Apps Script**
```bash
npx clasp push
```

### **2.5 Open in Browser**
```bash
npx clasp open
```

---

## Step 3: Initialize Spreadsheet

### **3.1 Run Initialization**

In the Google Apps Script editor:
1. Select function: `initializeAllSheets`
2. Click **Run**
3. Authorize the script when prompted

This creates all required sheets with headers.

### **3.2 Add Default Insight Mappings**

In the Google Apps Script editor:
1. Select function: `addDefaultInsightMappings`
2. Click **Run**

This adds example insight mappings for Tool 1.

### **3.3 Verify Sheets Created**

Your spreadsheet should now have these tabs:
- SESSIONS
- RESPONSES
- TOOL_STATUS
- TOOL_ACCESS
- CrossToolInsights
- InsightMappings (with 3 example rows)
- ACTIVITY_LOG
- ADMINS
- CONFIG
- Students

---

## Step 4: Deploy Web App

### **4.1 Create Deployment**
```bash
npx clasp deploy --description "v3 Initial Deployment"
```

### **4.2 Get Deployment URL**
```bash
npx clasp deployments
```

Copy the Web App URL.

### **4.3 Test Deployment**
Open the URL in your browser. You should see the login page.

---

## Step 5: Test the Framework

### **5.1 Run Test Function**

In the Google Apps Script editor:
1. Select function: `testFramework`
2. Click **Run**
3. Check **View > Logs** for output

Should show:
```
=== Testing Framework ===
Config validation: { valid: true, errors: [] }
Registered tools: 0
✅ Connected to spreadsheet: FTP-v3-Mastersheet
=== Test Complete ===
```

---

## Step 6: Add Your First Tool

Now you're ready to add Tool 1! See the next section.

---

## 📦 Tool 1 Migration Workflow

### **Create Tool 1 Structure**

```bash
# Create tool1 directory
mkdir -p /Users/Larry/code/Financial-TruPath-v3/tools/tool1

# Create tool files
touch tools/tool1/tool.manifest.json
touch tools/tool1/Tool1.js
touch tools/tool1/Tool1Insights.js
touch tools/tool1/tool1-form.html
```

### **Create Manifest**

`tools/tool1/tool.manifest.json`:
```json
{
  "id": "tool1",
  "name": "Orientation Assessment",
  "version": "1.0.0",
  "pattern": "form",
  "routes": ["/tool1", "/orientation"],
  "prerequisites": [],
  "unlocks": ["tool2"],
  "insights": {
    "generates": ["demographic", "financial", "behavioral"],
    "targetsTools": ["tool2", "tool6"]
  }
}
```

### **Create Tool Module**

`tools/tool1/Tool1.js` - See template below.

### **Register Tool**

Add to `Code.js` (after the includes):
```javascript
// Register tools
if (typeof Tool1 !== 'undefined') {
  ToolRegistry.register('tool1', Tool1, Tool1Manifest);
}
```

### **Push and Test**
```bash
npx clasp push
```

Open deployment URL: `https://[YOUR_URL]/exec?route=tool1&client=TEST001`

---

## 🧪 Development Workflow

### **Make Changes**
```bash
# Edit files
nano core/SomeFile.js

# Push to GAS
npx clasp push

# Watch for live changes (if using)
npx clasp push --watch
```

### **Test Locally (Monitoring)**
```bash
# In separate terminal, watch sheets
npm run watch

# This monitors Google Sheets for changes in real-time
```

### **Deploy New Version**
```bash
# Create new deployment
npx clasp deploy --description "v3.1 - Added Tool 1"

# Get latest deployment
npx clasp deployments
```

### **Debug**
- Google Apps Script Editor → **View > Logs**
- Chrome DevTools → Network tab
- Monitoring: `npm run watch`

---

## 📊 Monitoring & Debugging

### **Watch Google Sheets**
```bash
npm run watch
```

Shows real-time updates to SESSIONS and RESPONSES sheets.

### **Check Sheets Status**
```bash
npm run check
```

Quick verification of sheet connection.

### **View Sheet Summary**
```bash
node debug-sheets.js summary
```

Shows row counts for all sheets.

---

## 🔐 Adding Admin User

### **Manual Entry**
1. Open your FTP-v3-Mastersheet
2. Go to **ADMINS** tab
3. Add row:
   ```
   Email              | Name       | Role  | Created_At | Last_Login | Status
   your@email.com     | Your Name  | admin | [today]    |            | active
   ```

### **Via Script** (future enhancement)
```javascript
function addAdmin(email, name) {
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
    .getSheetByName('ADMINS');

  sheet.appendRow([
    email,
    name,
    'admin',
    new Date(),
    '',
    'active'
  ]);
}
```

---

## 👥 Adding Test Student

### **Manual Entry**
1. Open TOOL_ACCESS tab
2. Add rows for each tool:
   ```
   Client_ID | Tool_ID | Status   | Prerequisites | Unlocked_Date | Locked_By | Lock_Reason
   TEST001   | tool1   | unlocked | []            | [today]       |           |
   TEST001   | tool2   | pending  | ["tool1"]     |               |           |
   TEST001   | tool3   | pending  | ["tool1","tool2"] |           |           |
   ```

### **Via Framework** (recommended)
```javascript
// In GAS Editor, run this function:
function setupTestStudent() {
  ToolAccessControl.initializeStudent('TEST001');
}
```

---

## 🔄 Migration from v1

### **What to Copy**
- ✅ Tool questions/content
- ✅ Tool validation logic
- ✅ Tool insight generation logic
- ✅ UI styles (if desired)

### **What to Rewrite**
- ❌ Tool structure (use new interface)
- ❌ Data saving (use DataService)
- ❌ Insight logic (use InsightsPipeline)
- ❌ Routing (handled by Router)

### **Migration Steps**
1. Copy Tool 1 questions from v1
2. Create Tool1.js implementing ToolInterface
3. Define insights in InsightMappings sheet
4. Test with TEST001
5. Repeat for Tool 2
6. Test cross-tool intelligence
7. Continue with remaining tools

---

## 🎯 Next Steps

After completing setup:

1. **Migrate Tool 1** - Use v1 content, new structure
2. **Test thoroughly** - Use TEST001 client
3. **Add insight mappings** - Configure Tool 1 → Tool 2 flow
4. **Migrate Tool 2** - Prove cross-tool intelligence works
5. **Document learnings** - Update this guide as you go

---

## 📞 Troubleshooting

### **Error: "Config.js MASTER_SHEET_ID not set"**
- Update Config.js with your Spreadsheet ID

### **Error: "Cannot connect to spreadsheet"**
- Verify Spreadsheet ID is correct
- Check script has permissions (run initializeAllSheets)

### **Error: "Tool not found"**
- Tool not registered
- Check ToolRegistry.register() was called
- Run testFramework() to see registered tools

### **Deployment URL shows 404**
- Redeploy: `npx clasp deploy`
- Check deployment is active: `npx clasp deployments`

### **Sheets not updating**
- Check monitoring: `npm run watch`
- Verify sheet names match Config.js
- Check DataService is being called

---

## ✅ Setup Checklist

- [ ] Created FTP-v3-Mastersheet
- [ ] Updated Config.js with Spreadsheet ID
- [ ] Ran `npm install`
- [ ] Created GAS project with `clasp create`
- [ ] Pushed code with `clasp push`
- [ ] Ran `initializeAllSheets()` in GAS
- [ ] Ran `addDefaultInsightMappings()` in GAS
- [ ] Deployed with `clasp deploy`
- [ ] Tested deployment URL
- [ ] Ran `testFramework()` - all passed
- [ ] Can access monitoring with `npm run watch`

---

**You're ready to build!** 🎉

Next: Create your first tool following the ToolInterface contract.
