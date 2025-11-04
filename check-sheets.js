#!/usr/bin/env node
/**
 * Quick check of all sheets in the spreadsheet
 * Run with: node check-sheets.js
 */

const sheets = require('./sheets');

// Sheets that might be deletable
const LEGACY_SHEETS = ['Sheet1', 'CrossToolInsights', 'SystemLogs'];

async function checkRequiredSheets() {
  console.log('✅ Required Sheets (Should Keep):');
  
  for (const sheetName of sheets.REQUIRED_SHEETS) {
    const info = await sheets.checkV2Sheet(sheetName);
    if (info.exists) {
      console.log(`   ${sheetName.padEnd(20)} ${info.rows} rows`);
    } else {
      console.log(`   ${sheetName.padEnd(20)} ❌ Not found`);
    }
  }
}

async function checkLegacySheets() {
  console.log('\n🤔 Possibly Delete:');
  
  for (const sheetName of LEGACY_SHEETS) {
    const info = await sheets.checkV2Sheet(sheetName);
    if (info.exists) {
      const status = info.hasData ? '⚠️ HAS DATA' : '✅ Empty (safe to delete)';
      console.log(`   ${sheetName.padEnd(20)} ${info.rows} rows ${status}`);
    } else {
      console.log(`   ${sheetName.padEnd(20)} ✅ Already deleted or doesn't exist`);
    }
  }
}

async function checkAllSheets() {
  console.log('📋 Checking ALL sheets in Financial TruPath V2 Spreadsheet\n');
  
  await checkRequiredSheets();
  await checkLegacySheets();
  
  
  console.log('\n📊 Summary:');
  console.log('- Keep all required sheets listed above');
  console.log('- Delete Sheet1 if it exists and is empty');
  console.log('- Review CrossToolInsights and SystemLogs for any important data');
  console.log('\nTo delete sheets, run executeSheetAnalysis() in Apps Script');
}

// Run the check
checkAllSheets().catch(console.error);