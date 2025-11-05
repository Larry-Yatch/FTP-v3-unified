/**
 * fix-is-latest-column.js
 * Fixes RESPONSES sheet rows that are missing Is_Latest values
 *
 * HOW TO USE:
 * 1. Copy this file to your Google Apps Script project
 * 2. Run: fixIsLatestColumn()
 * 3. Review the output in execution log
 *
 * WHAT IT DOES:
 * - Finds all rows with empty/undefined Is_Latest (column G)
 * - For each client/tool combination:
 *   - Marks the MOST RECENT COMPLETED response as Is_Latest = true
 *   - Marks all other responses as Is_Latest = false
 * - Preserves DRAFT and EDIT_DRAFT status handling
 */

function fixIsLatestColumn() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  FIX IS_LATEST COLUMN - RESPONSES SHEET       ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    if (!sheet) {
      console.log('❌ RESPONSES sheet not found');
      return { success: false, error: 'RESPONSES sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const timestampCol = headers.indexOf('Timestamp');
    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const statusCol = headers.indexOf('Status');
    const isLatestCol = headers.indexOf('Is_Latest');

    if (isLatestCol === -1) {
      console.log('❌ Is_Latest column not found in headers');
      return { success: false, error: 'Is_Latest column not found' };
    }

    console.log(`📊 Found ${data.length - 1} total rows (excluding header)`);
    console.log(`📍 Is_Latest column index: ${isLatestCol} (Column ${String.fromCharCode(65 + isLatestCol)})\n`);

    // Group responses by client + tool
    const groups = {};
    let emptyCount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const clientId = row[clientIdCol];
      const toolId = row[toolIdCol];
      const status = row[statusCol];
      const isLatest = row[isLatestCol];
      const timestamp = row[timestampCol];

      // Check if Is_Latest is empty/undefined
      if (isLatest === '' || isLatest === null || isLatest === undefined) {
        emptyCount++;
      }

      // Group by client + tool
      const key = `${clientId}_${toolId}`;
      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({
        rowIndex: i + 1, // 1-indexed for sheet
        timestamp: timestamp,
        status: status,
        isLatest: isLatest,
        clientId: clientId,
        toolId: toolId
      });
    }

    console.log(`⚠️  Found ${emptyCount} rows with empty Is_Latest\n`);

    // Process each group
    let fixedCount = 0;
    const updates = [];

    for (const [key, rows] of Object.entries(groups)) {
      console.log(`\n📦 Processing group: ${key}`);
      console.log(`   Total rows: ${rows.length}`);

      // Sort by timestamp DESC (newest first)
      rows.sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return dateB - dateA;
      });

      // Find the most recent COMPLETED response
      let latestSet = false;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const shouldBeLatest = !latestSet && row.status === 'COMPLETED';

        // Determine what Is_Latest should be
        let correctValue;
        if (row.status === 'DRAFT' || row.status === 'EDIT_DRAFT') {
          correctValue = 'true'; // Drafts can have Is_Latest = true
        } else if (shouldBeLatest) {
          correctValue = 'true';
          latestSet = true;
        } else {
          correctValue = 'false';
        }

        // Check if it needs fixing
        const currentValue = String(row.isLatest).toLowerCase();
        const needsFix = (currentValue === '' || currentValue === 'null' || currentValue === 'undefined') ||
                         (currentValue !== correctValue);

        if (needsFix) {
          updates.push({
            rowIndex: row.rowIndex,
            colIndex: isLatestCol + 1, // 1-indexed for sheet
            currentValue: row.isLatest || '(empty)',
            newValue: correctValue,
            status: row.status
          });

          console.log(`   ✏️  Row ${row.rowIndex}: ${row.isLatest || '(empty)'} → ${correctValue} (${row.status})`);
          fixedCount++;
        } else {
          console.log(`   ✅ Row ${row.rowIndex}: Already correct (${row.isLatest})`);
        }
      }
    }

    // Apply updates
    if (updates.length > 0) {
      console.log(`\n📝 Applying ${updates.length} updates...\n`);

      for (const update of updates) {
        sheet.getRange(update.rowIndex, update.colIndex).setValue(update.newValue);
        console.log(`   ✅ Updated row ${update.rowIndex}: ${update.currentValue} → ${update.newValue}`);
      }

      SpreadsheetApp.flush();
      console.log(`\n✅ Successfully fixed ${fixedCount} rows`);
    } else {
      console.log('\n✅ No updates needed - all Is_Latest values are correct!');
    }

    // Verify integrity
    console.log('\n🔍 Verifying Is_Latest integrity...');
    validateIsLatestIntegrity();

    return {
      success: true,
      fixedCount: fixedCount,
      totalRows: data.length - 1,
      emptyCount: emptyCount
    };

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    console.log(error.stack);
    return { success: false, error: error.toString() };
  }
}

/**
 * Preview what will be fixed without making changes
 */
function previewIsLatestFix() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  PREVIEW IS_LATEST FIXES (NO CHANGES)        ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const clientIdCol = headers.indexOf('Client_ID');
    const toolIdCol = headers.indexOf('Tool_ID');
    const statusCol = headers.indexOf('Status');
    const isLatestCol = headers.indexOf('Is_Latest');

    let emptyCount = 0;
    const problems = [];

    for (let i = 1; i < data.length; i++) {
      const isLatest = data[i][isLatestCol];

      if (isLatest === '' || isLatest === null || isLatest === undefined) {
        emptyCount++;
        problems.push({
          row: i + 1,
          clientId: data[i][clientIdCol],
          toolId: data[i][toolIdCol],
          status: data[i][statusCol],
          issue: 'Empty Is_Latest'
        });
      }
    }

    console.log(`📊 Total rows: ${data.length - 1}`);
    console.log(`⚠️  Rows with empty Is_Latest: ${emptyCount}\n`);

    if (problems.length > 0) {
      console.log('Problems found:');
      problems.forEach(p => {
        console.log(`   Row ${p.row}: ${p.clientId}/${p.toolId} (${p.status}) - ${p.issue}`);
      });

      console.log(`\n💡 Run fixIsLatestColumn() to fix these issues`);
    } else {
      console.log('✅ No problems found!');
    }

    return { totalRows: data.length - 1, emptyCount: emptyCount, problems: problems };

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.toString() };
  }
}
