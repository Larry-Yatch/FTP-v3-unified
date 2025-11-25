# Tool 4: Server-Side API Documentation

**Date:** November 25, 2025
**Purpose:** Define all Code.js server functions for Tool 4
**Status:** ✅ Complete - Ready for Implementation

---

## 🎯 Overview

This document specifies all server-side functions (Code.js) required for Tool 4. Each function includes:
- Purpose
- Parameters
- Return structure
- Error handling
- Example usage

---

## 📋 Function Index

1. [checkToolCompletion](#1-checktoolcompletion) - Check Tools 1/2/3 status
2. [saveScenario](#2-savescenario) - Save scenario to TOOL4_SCENARIOS
3. [getUserScenarios](#3-getuserscenarios) - Load all scenarios for student
4. [loadScenario](#4-loadscenario) - Load specific scenario
5. [deleteScenario](#5-deletescenario) - Delete scenario
6. [generateTool4Report](#6-generatetool4report) - Generate report HTML
7. [generateTool4PDF](#7-generatetool4pdf) - Generate downloadable PDF
8. [getTool4DashboardData](#8-gettool4dashboarddata) - Dashboard display data

---

## 1. checkToolCompletion

**Purpose:** Check which Tools 1/2/3 student has completed and load their data

```javascript
/**
 * Check Tools 1/2/3 completion status
 * @param {string} clientId - Student ID
 * @returns {Object} Status and data for each tool
 */
function checkToolCompletion(clientId) {
  try {
    const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
    const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
    const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

    return {
      success: true,
      hasTool1: !!tool1Data,
      hasTool2: !!tool2Data,
      hasTool3: !!tool3Data,
      tool1Data: tool1Data || null,
      tool2Data: tool2Data || null,
      tool3Data: tool3Data || null,
      missingCount: [tool1Data, tool2Data, tool3Data].filter(d => !d).length
    };
  } catch (error) {
    Logger.log(`Error checking tool completion: ${error}`);
    return {
      success: false,
      error: error.toString(),
      hasTool1: false,
      hasTool2: false,
      hasTool3: false
    };
  }
}
```

**Return Structure:**
```json
{
  "success": true,
  "hasTool1": true,
  "hasTool2": false,
  "hasTool3": true,
  "tool1Data": {
    "formData": {...},
    "scores": {...},
    "winner": "Fear"
  },
  "tool2Data": null,
  "tool3Data": {
    "overallQuotient": 65,
    ...
  },
  "missingCount": 1
}
```

---

## 2. saveScenario

**Purpose:** Save scenario to TOOL4_SCENARIOS sheet and update RESPONSES on first save

```javascript
/**
 * Save Tool 4 scenario
 * @param {Object} scenarioData - Complete scenario data
 * @returns {Object} Success status and scenario ID
 */
function saveScenario(scenarioData) {
  try {
    const {
      clientId,
      scenarioName,
      priority,
      // Financial inputs
      income,
      essentials,
      debt,
      interestRate,
      emergencyFund,
      stability,
      // Categories
      categories,
      // Allocations
      recommended,
      custom,
      isCustom,
      // Metadata
      toolSources,
      backupData
    } = scenarioData;

    // Validate required fields
    if (!clientId || !income) {
      throw new Error('Missing required fields');
    }

    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('TOOL4_SCENARIOS');

    if (!sheet) {
      throw new Error('TOOL4_SCENARIOS sheet not found');
    }

    // Generate scenario ID
    const scenarioId = `TOOL4_${clientId}_${Date.now()}`;
    const timestamp = new Date();

    // Append row
    sheet.appendRow([
      timestamp,                                    // A: Timestamp
      clientId,                                     // B: Client_ID
      scenarioName || `Scenario (${timestamp.toLocaleDateString()})`, // C: Scenario_Name
      priority,                                     // D: Priority_Selected
      income,                                       // E: Monthly_Income
      essentials,                                   // F: Current_Essentials
      debt || 0,                                    // G: Debt_Balance
      interestRate || 'Medium',                     // H: Interest_Rate
      emergencyFund || 0,                           // I: Emergency_Fund
      stability || 'Stable',                        // J: Income_Stability
      categories.rent || 0,                         // K: Rent_Mortgage
      categories.groceries || 0,                    // L: Groceries
      categories.dining || 0,                       // M: Dining_Takeout
      categories.transport || 0,                    // N: Transportation
      categories.utilities || 0,                    // O: Utilities
      categories.insurance || 0,                    // P: Insurance
      categories.subscriptions || 0,                // Q: Subscriptions
      categories.other || 0,                        // R: Other_Essentials
      recommended.M,                                // S: Rec_M_Percent
      recommended.E,                                // T: Rec_E_Percent
      recommended.F,                                // U: Rec_F_Percent
      recommended.J,                                // V: Rec_J_Percent
      Math.round((recommended.M / 100) * income),   // W: Rec_M_Dollars
      Math.round((recommended.E / 100) * income),   // X: Rec_E_Dollars
      Math.round((recommended.F / 100) * income),   // Y: Rec_F_Dollars
      Math.round((recommended.J / 100) * income),   // Z: Rec_J_Dollars
      isCustom ? custom.M : recommended.M,          // AA: Custom_M_Percent
      isCustom ? custom.E : recommended.E,          // AB: Custom_E_Percent
      isCustom ? custom.F : recommended.F,          // AC: Custom_F_Percent
      isCustom ? custom.J : recommended.J,          // AD: Custom_J_Percent
      isCustom,                                     // AE: Is_Custom
      false,                                        // AF: Report_Generated
      toolSources.tool1,                            // AG: Tool1_Source
      toolSources.tool2,                            // AH: Tool2_Source
      toolSources.tool3,                            // AI: Tool3_Source
      backupData ? JSON.stringify(backupData) : ''  // AJ: Backup_Data
    ]);

    // Check if this is first scenario
    const scenarioCount = getScenarioCount(clientId);

    if (scenarioCount === 1) {
      // Update RESPONSES sheet to mark Tool 4 as completed
      DataService.saveToolResponse(clientId, 'tool4', {
        scenarioCount: 1,
        latestScenario: scenarioName,
        latestPriority: priority,
        dataSource: toolSources,
        backupData: backupData
      }, 'COMPLETED');

      Logger.log(`[Tool4] First scenario saved - marked Tool 4 as COMPLETED for ${clientId}`);
    }

    return {
      success: true,
      scenarioId: scenarioId,
      scenarioCount: scenarioCount
    };

  } catch (error) {
    Logger.log(`Error saving scenario: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Helper: Count scenarios for client
 */
function getScenarioCount(clientId) {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const sheet = ss.getSheetByName('TOOL4_SCENARIOS');
  const data = sheet.getDataRange().getValues();

  let count = 0;
  for (let i = 1; i < data.length; i++) { // Skip header
    if (data[i][1] === clientId) { // Column B = Client_ID
      count++;
    }
  }
  return count;
}
```

---

## 3. getUserScenarios

**Purpose:** Get all scenarios for a student (for dropdown list)

```javascript
/**
 * Get all scenarios for student
 * @param {string} clientId - Student ID
 * @returns {Array} Array of scenario objects
 */
function getUserScenarios(clientId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('TOOL4_SCENARIOS');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const scenarios = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === clientId) { // Column B = Client_ID
        scenarios.push({
          row: i + 1, // For loading later
          timestamp: data[i][0],
          scenarioName: data[i][2],
          priority: data[i][3],
          income: data[i][4],
          essentials: data[i][5]
        });
      }
    }

    // Sort by timestamp descending (newest first)
    scenarios.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      success: true,
      scenarios: scenarios,
      count: scenarios.length
    };

  } catch (error) {
    Logger.log(`Error getting user scenarios: ${error}`);
    return {
      success: false,
      error: error.toString(),
      scenarios: []
    };
  }
}
```

**Return Structure:**
```json
{
  "success": true,
  "scenarios": [
    {
      "row": 5,
      "timestamp": "2025-11-25T10:30:00",
      "scenarioName": "Debt Payoff Plan",
      "priority": "Get Out of Debt",
      "income": 5000,
      "essentials": 2700
    },
    {
      "row": 3,
      "timestamp": "2025-11-24T15:20:00",
      "scenarioName": "Security Focus",
      "priority": "Feel Financially Secure",
      "income": 5000,
      "essentials": 2500
    }
  ],
  "count": 2
}
```

---

## 4. loadScenario

**Purpose:** Load complete scenario data by row number

```javascript
/**
 * Load complete scenario data
 * @param {number} row - Row number from TOOL4_SCENARIOS sheet
 * @returns {Object} Complete scenario data
 */
function loadScenario(row) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('TOOL4_SCENARIOS');
    const data = sheet.getRange(row, 1, 1, 36).getValues()[0]; // All columns A-AJ

    return {
      success: true,
      scenario: {
        timestamp: data[0],
        clientId: data[1],
        scenarioName: data[2],
        priority: data[3],
        income: data[4],
        essentials: data[5],
        debt: data[6],
        interestRate: data[7],
        emergencyFund: data[8],
        stability: data[9],
        categories: {
          rent: data[10],
          groceries: data[11],
          dining: data[12],
          transport: data[13],
          utilities: data[14],
          insurance: data[15],
          subscriptions: data[16],
          other: data[17]
        },
        recommended: {
          M: data[18],
          E: data[19],
          F: data[20],
          J: data[21]
        },
        recommendedDollars: {
          M: data[22],
          E: data[23],
          F: data[24],
          J: data[25]
        },
        custom: {
          M: data[26],
          E: data[27],
          F: data[28],
          J: data[29]
        },
        isCustom: data[30],
        reportGenerated: data[31],
        toolSources: {
          tool1: data[32],
          tool2: data[33],
          tool3: data[34]
        },
        backupData: data[35] ? JSON.parse(data[35]) : null
      }
    };

  } catch (error) {
    Logger.log(`Error loading scenario: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

---

## 5. deleteScenario

**Purpose:** Delete a scenario (soft delete - mark as deleted)

```javascript
/**
 * Delete scenario
 * @param {number} row - Row number from TOOL4_SCENARIOS sheet
 * @param {string} clientId - Client ID (for verification)
 * @returns {Object} Success status
 */
function deleteScenario(row, clientId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('TOOL4_SCENARIOS');

    // Verify ownership
    const ownerCell = sheet.getRange(row, 2).getValue(); // Column B = Client_ID
    if (ownerCell !== clientId) {
      throw new Error('Unauthorized: Scenario belongs to different user');
    }

    // Option 1: Hard delete (remove row)
    sheet.deleteRow(row);

    // OR Option 2: Soft delete (add deleted flag - would need new column)
    // sheet.getRange(row, 37).setValue(true); // Column AK = Is_Deleted

    return {
      success: true,
      message: 'Scenario deleted successfully'
    };

  } catch (error) {
    Logger.log(`Error deleting scenario: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

---

## 6. generateTool4Report

**Purpose:** Generate HTML report page

```javascript
/**
 * Generate Tool 4 report HTML
 * @param {string} clientId - Student ID
 * @param {number} scenarioRow - Row number of scenario
 * @returns {HtmlOutput} Report HTML page
 */
function generateTool4Report(clientId, scenarioRow) {
  try {
    // Load scenario data
    const scenarioResult = loadScenario(scenarioRow);
    if (!scenarioResult.success) {
      throw new Error('Could not load scenario');
    }

    const scenario = scenarioResult.scenario;

    // Generate report using Tool4Report.js
    return Tool4Report.render(clientId, scenario);

  } catch (error) {
    Logger.log(`Error generating report: ${error}`);
    return HtmlService.createHtmlOutput(
      `<h1>Error</h1><p>${error.toString()}</p>`
    );
  }
}
```

---

## 7. generateTool4PDF

**Purpose:** Generate downloadable PDF report (using Google Docs API like Tool 8)

```javascript
/**
 * Generate PDF report
 * @param {string} clientId - Student ID
 * @param {number} scenarioRow - Row number of scenario
 * @returns {Object} PDF URL and success status
 */
function generateTool4PDF(clientId, scenarioRow) {
  try {
    // Load scenario
    const scenarioResult = loadScenario(scenarioRow);
    if (!scenarioResult.success) {
      throw new Error('Could not load scenario');
    }

    const scenario = scenarioResult.scenario;

    // Create temporary Google Doc
    const docName = `Tool4 Report - ${scenario.scenarioName} - ${new Date().toLocaleDateString()}`;
    const doc = DocumentApp.create(docName);
    const docId = doc.getId();
    const body = doc.getBody();

    // Build report content (similar to Tool 8 pattern)
    Tool4Report.buildPDFContent(body, clientId, scenario);

    // Save and close doc
    doc.saveAndClose();

    // Convert to PDF
    const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
    pdfBlob.setName(docName + '.pdf');

    // Save to reports folder
    const folder = DriveApp.getFolderById(CONFIG.REPORTS_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Make accessible
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Delete temp doc
    DriveApp.getFileById(docId).setTrashed(true);

    // Update scenario to mark report as generated
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName('TOOL4_SCENARIOS');
    sheet.getRange(scenarioRow, 32).setValue(true); // Column AF = Report_Generated

    return {
      success: true,
      pdfUrl: pdfFile.getUrl(),
      pdfId: pdfFile.getId()
    };

  } catch (error) {
    Logger.log(`Error generating PDF: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

---

## 8. getTool4DashboardData

**Purpose:** Get data for dashboard display

```javascript
/**
 * Get dashboard display data for Tool 4
 * @param {string} clientId - Student ID
 * @returns {Object} Dashboard data
 */
function getTool4DashboardData(clientId) {
  try {
    // Check RESPONSES sheet for tool status
    const response = DataService.getLatestResponse(clientId, 'tool4');

    if (!response) {
      return {
        success: true,
        status: 'not_started',
        scenarioCount: 0,
        latestScenario: null
      };
    }

    // Get scenario count and latest
    const scenariosResult = getUserScenarios(clientId);
    const scenarios = scenariosResult.success ? scenariosResult.scenarios : [];

    return {
      success: true,
      status: scenarios.length > 0 ? 'completed' : 'in_progress',
      scenarioCount: scenarios.length,
      latestScenario: scenarios.length > 0 ? scenarios[0] : null,
      dataSource: response.data.dataSource || null
    };

  } catch (error) {
    Logger.log(`Error getting dashboard data: ${error}`);
    return {
      success: false,
      error: error.toString(),
      status: 'error'
    };
  }
}
```

**Return Structure:**
```json
{
  "success": true,
  "status": "completed",
  "scenarioCount": 3,
  "latestScenario": {
    "scenarioName": "Debt Payoff Plan",
    "priority": "Get Out of Debt",
    "timestamp": "2025-11-25T10:30:00"
  },
  "dataSource": {
    "tool1": "completed",
    "tool2": "backup",
    "tool3": "completed"
  }
}
```

---

## 📋 Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `checkToolCompletion(clientId)` | Check Tools 1/2/3 status | Object with hasTool1/2/3 + data |
| `saveScenario(scenarioData)` | Save scenario | {success, scenarioId, scenarioCount} |
| `getUserScenarios(clientId)` | List all scenarios | {success, scenarios[], count} |
| `loadScenario(row)` | Load specific scenario | {success, scenario{}} |
| `deleteScenario(row, clientId)` | Delete scenario | {success, message} |
| `generateTool4Report(clientId, row)` | Generate HTML report | HtmlOutput |
| `generateTool4PDF(clientId, row)` | Generate PDF | {success, pdfUrl, pdfId} |
| `getTool4DashboardData(clientId)` | Dashboard data | {success, status, scenarioCount} |

---

**Document Complete:** November 25, 2025
**Status:** ✅ Ready for Implementation
**Next:** Implement these functions in Code.js during Week 1
