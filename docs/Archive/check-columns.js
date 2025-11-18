/**
 * Check column structure of RESPONSES sheet
 */
function checkColumnStructure() {
  console.log('====================================');
  console.log('CHECKING COLUMN STRUCTURE');
  console.log('====================================\n');
  
  const SPREADSHEET_ID = '1dEcTk-ODdp4mmYqPl4Du8jgmoUjhpnEjOgFfOOdEznc';
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RESPONSES');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  console.log('Total columns:', headers.length);
  console.log('\nColumn headers with indices:');
  console.log('----------------------------');
  
  headers.forEach((header, index) => {
    console.log(`Column ${index}: "${header}"`);
  });
  
  // Check specific important columns
  console.log('\n\nImportant column indices:');
  console.log('-------------------------');
  console.log('Tool_ID:', headers.indexOf('Tool_ID'));
  console.log('Client_ID:', headers.indexOf('Client_ID'));
  console.log('Response_Data:', headers.indexOf('Response_Data'));
  console.log('Is_Latest:', headers.indexOf('Is_Latest'));
  console.log('Timestamp:', headers.indexOf('Timestamp'));
  
  // Check for variations in column names
  console.log('\n\nChecking for column name variations:');
  console.log('------------------------------------');
  
  headers.forEach((header, index) => {
    if (header.toLowerCase().includes('response') || 
        header.toLowerCase().includes('data') ||
        header.toLowerCase().includes('json')) {
      console.log(`Column ${index}: "${header}" (potential data column)`);
    }
  });
  
  // Check row 8 and 12 for 6123LY specifically
  console.log('\n\nChecking specific rows for 6123LY:');
  console.log('-----------------------------------');
  
  const clientCol = headers.indexOf('Client_ID');
  const toolCol = headers.indexOf('Tool_ID');
  
  // Row 8 (index 7)
  if (data[7] && data[7][clientCol] === '6123LY') {
    console.log('\nRow 8 (Tool1 for 6123LY):');
    headers.forEach((header, index) => {
      const value = data[7][index];
      if (value !== '' && value !== null && value !== undefined) {
        const preview = String(value).substring(0, 100);
        console.log(`  ${header}: ${preview}${value.length > 100 ? '...' : ''}`);
      }
    });
  }
  
  // Row 12 (index 11)
  if (data[11] && data[11][clientCol] === '6123LY') {
    console.log('\nRow 12 (Tool1 for 6123LY):');
    headers.forEach((header, index) => {
      const value = data[11][index];
      if (value !== '' && value !== null && value !== undefined) {
        const preview = String(value).substring(0, 100);
        console.log(`  ${header}: ${preview}${value.length > 100 ? '...' : ''}`);
      }
    });
  }
  
  // Check the actual content at the Response_Data column for a specific row
  const responseCol = headers.indexOf('Response_Data');
  console.log('\n\nDirect cell check for row 8:');
  console.log('-----------------------------');
  
  // Check what's actually in column D (index 3, column 4 in sheets)
  console.log('\nColumn D (index 3) check:');
  const columnDValue = sheet.getRange(8, 4).getValue();  // Column D is column 4 (1-indexed)
  console.log('Column D header:', headers[3]);
  console.log('Column D value type:', typeof columnDValue);
  console.log('Column D value length:', columnDValue ? String(columnDValue).length : 0);
  console.log('Column D value preview:', columnDValue ? String(columnDValue).substring(0, 200) : 'empty/null');
  
  if (responseCol >= 0) {
    const cellValue = sheet.getRange(8, responseCol + 1).getValue();
    console.log('\nResponse_Data column (index ' + responseCol + ') check:');
    console.log('Cell value type:', typeof cellValue);
    console.log('Cell value length:', cellValue ? String(cellValue).length : 0);
    console.log('Cell value preview:', cellValue ? String(cellValue).substring(0, 200) : 'empty/null');
  } else {
    console.log('Response_Data column not found in headers!');
  }
}

// Run the check
checkColumnStructure();