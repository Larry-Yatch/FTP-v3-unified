#!/usr/bin/env node
/**
 * Debug utility for Financial TruPath V2 Google Sheets
 * Usage: node debug-sheets.js [command] [options]
 */

const sheets = require('./sheets');

// Simple sheet display helper
function displaySheet(name, data) {
  console.log(`📋 ${name} Sheet:`);
  console.table(data);
  console.log(`Total rows: ${data.length}`);
}

// Parse JSON data helper
function parseResponseData(data) {
  return data.map(row => {
    if (row.Data) {
      try {
        row.Data = JSON.parse(row.Data);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }
    return row;
  });
}

// Watch helpers
function hasChanges(current, last) {
  return current.sessions !== last.sessions || current.responses !== last.responses;
}

function logChanges(current, last) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] Sessions: ${current.sessions} | Responses: ${current.responses}`);
  
  if (current.sessions > last.sessions) {
    console.log('  🆕 New session detected!');
  }
  if (current.responses > last.responses) {
    console.log('  🆕 New response detected!');
  }
}

// Commands
const commands = {
  async sessions() {
    const data = await sheets.fetchV2Sheet('SESSIONS');
    displaySheet('SESSIONS', data);
  },
  
  async responses() {
    const data = await sheets.fetchV2Sheet('RESPONSES');
    const parsedData = parseResponseData(data);
    displaySheet('RESPONSES', parsedData);
  },
  
  async status() {
    const data = await sheets.fetchV2Sheet('TOOL_STATUS');
    displaySheet('TOOL_STATUS', data);
  },
  
  async students() {
    const data = await sheets.fetchV2Sheet('STUDENTS');
    displaySheet('STUDENTS', data);
  },
  
  async summary() {
    console.log('📊 Database Summary:\n');
    
    for (const sheetName of sheets.REQUIRED_SHEETS) {
      const info = await sheets.checkV2Sheet(sheetName);
      if (info.exists) {
        console.log(`  ${sheetName.padEnd(15)} ${info.rows} rows × ${info.cols} columns`);
      } else {
        console.log(`  ${sheetName.padEnd(15)} ❌ ${info.error}`);
      }
    }
  },
  
  async watch() {
    console.log('👁️  Watching for changes (refresh every 5 seconds)...\n');
    console.log('Press Ctrl+C to stop\n');
    
    let lastCounts = { sessions: 0, responses: 0 };
    
    const checkForChanges = async () => {
      try {
        const currentCounts = {
          sessions: await sheets.getV2SheetRowCount('SESSIONS'),
          responses: await sheets.getV2SheetRowCount('RESPONSES')
        };
        
        if (hasChanges(currentCounts, lastCounts)) {
          logChanges(currentCounts, lastCounts);
          lastCounts = currentCounts;
        }
      } catch (e) {
        console.error('Watch error:', e.message);
      }
    };
    
    setInterval(checkForChanges, 5000);
  },
  
  async help() {
    console.log(`
Financial TruPath V2 - Sheets Debug Tool

Usage: node debug-sheets.js [command]

Commands:
  sessions  - Show all sessions
  responses - Show all responses (with parsed JSON)
  status    - Show tool completion status
  students  - Show student roster
  summary   - Show database overview
  watch     - Watch for changes in real-time
  help      - Show this help message

Examples:
  node debug-sheets.js summary
  node debug-sheets.js sessions
  node debug-sheets.js watch
    `);
  }
};

// Main execution
async function main() {
  const command = process.argv[2] || 'help';
  
  if (commands[command]) {
    try {
      await commands[command]();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    await commands.help();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}