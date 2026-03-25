# TruPath Lead Gen — Tool 1 Standalone

Standalone Google Apps Script version of Tool 1 for lead generation.

## Flow

1. Assessment (5 steps)
2. Teaser result reveal
3. Name + email gate
4. Full report shown on screen
5. Full report emailed immediately via `MailApp`

## Files

- `Code.js` — routing, page rendering, GAS server functions
- `Config.js` — branding, sheet config, CTA config
- `Scoring.js` — Tool 1 scoring + winner logic
- `Templates.js` — all 6 report templates + teaser copy + sales CTA placeholder
- `Styles.js` — shared TruPath styles
- `DataService.js` — draft storage + lead sheet writes
- `EmailService.js` — HTML email generation + send
- `appsscript.json` — GAS manifest

## Data destination

Google Sheet ID:
`1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ`

Tab:
`Leads`

Columns:
1. Timestamp
2. Name
3. Email
4. Primary_Pattern
5. Score_FSV
6. Score_ExVal
7. Score_Showing
8. Score_Receiving
9. Score_Control
10. Score_Fear
11. All_Responses_JSON
12. Source

## Required one-time setup before push/deploy

### 1) Enable Apps Script API for the authenticated `clasp` Google account
Visit:
https://script.google.com/home/usersettings

Turn **Google Apps Script API** ON.

Without this, `clasp create` / Apps Script project creation will fail.

### 2) Create or link a GAS project
From this folder:

```bash
cd ftp-leadgen
clasp create --type webapp --title "TruPath Lead Gen Tool 1"
```

or, if a project already exists:

```bash
clasp clone <SCRIPT_ID>
```

### 3) Optional: set script property
Project Settings → Script Properties:

- `LEADS_SHEET_ID` = `1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ`

The code already falls back to that ID if the property is missing.

### 4) Push + deploy

```bash
clasp push
clasp deploy --description "Initial lead-gen deployment"
```

## Notes

- Navigation intentionally uses `google.script.run` + `document.write()` to comply with the GAS iframe rule.
- The report CTA block contains placeholder copy for Russel.
- Tracking is stored as a combined `Source` string (UTM + referrer + landing URL when available).
