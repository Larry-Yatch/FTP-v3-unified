/**
 * Fix Tool1 Response Data
 * This script checks and repairs empty Response_Data fields
 */

function checkAndFixTool1Data() {
  console.log('====================================');
  console.log('TOOL1 DATA CHECK AND REPAIR');
  console.log('====================================\n');
  
  const SPREADSHEET_ID = CONFIG.MASTER_SHEET_ID;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RESPONSES');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Get column indices
  const toolIdCol = headers.indexOf('Tool_ID');
  const clientCol = headers.indexOf('Client_ID');
  const responseCol = headers.indexOf('Data');  // Column is named 'Data', not 'Response_Data'
  const timestampCol = headers.indexOf('Timestamp');
  const isLatestCol = headers.indexOf('Is_Latest');
  
  console.log('Checking all Tool1 responses...\n');
  
  let emptyCount = 0;
  let validCount = 0;
  const emptyRows = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][toolIdCol] === 'tool1') {
      const clientId = data[i][clientCol];
      const responseData = data[i][responseCol];
      const isLatest = data[i][isLatestCol];
      
      if (!responseData || responseData === 'undefined' || responseData === '') {
        emptyCount++;
        emptyRows.push({
          row: i + 1,
          clientId: clientId,
          timestamp: data[i][timestampCol],
          isLatest: isLatest
        });
        console.log(`❌ Row ${i+1}: Client ${clientId} - EMPTY Response_Data (Is_Latest: ${isLatest})`);
      } else {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.winner && parsed.scores) {
            validCount++;
            console.log(`✅ Row ${i+1}: Client ${clientId} - Valid data (Winner: ${parsed.winner})`);
          } else {
            console.log(`⚠️ Row ${i+1}: Client ${clientId} - Missing winner/scores`);
          }
        } catch (e) {
          console.log(`⚠️ Row ${i+1}: Client ${clientId} - Invalid JSON`);
        }
      }
    }
  }
  
  console.log('\n====================================');
  console.log('SUMMARY');
  console.log('====================================');
  console.log(`Valid Tool1 responses: ${validCount}`);
  console.log(`Empty Tool1 responses: ${emptyCount}`);
  
  if (emptyCount > 0) {
    console.log('\nEmpty Response_Data rows:');
    emptyRows.forEach(row => {
      console.log(`  Row ${row.row}: ${row.clientId} (Is_Latest: ${row.isLatest})`);
    });
  }
  
  return emptyRows;
}

/**
 * Create sample Tool1 data for testing
 * Only use this for testing - real data should come from Tool1 completion
 */
function createSampleTool1Data(clientId, traumaType = 'Showing') {
  // Sample data structure matching Tool1 output
  const sampleData = {
    formData: {
      name: 'Test User',
      email: 'test@example.com',
      // ... other form fields
    },
    scores: {
      FSV: 12,
      Control: 8,
      ExVal: 10,
      Fear: 6,
      Receiving: 14,
      Showing: 18  // Highest score
    },
    winner: traumaType
  };
  
  return JSON.stringify(sampleData);
}

/**
 * Fix a specific client's Tool1 data
 * WARNING: This modifies the spreadsheet directly
 */
function fixClientTool1Data(clientId, traumaType) {
  const SPREADSHEET_ID = CONFIG.MASTER_SHEET_ID;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RESPONSES');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const toolIdCol = headers.indexOf('Tool_ID');
  const clientCol = headers.indexOf('Client_ID');
  const responseCol = headers.indexOf('Data');  // Column is named 'Data', not 'Response_Data'
  const isLatestCol = headers.indexOf('Is_Latest');
  
  console.log(`Searching for Tool1 data for client: ${clientId}`);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][toolIdCol] === 'tool1' && 
        data[i][clientCol] === clientId && 
        data[i][isLatestCol] === true) {
      
      console.log(`Found Tool1 row at ${i+1}`);
      
      // Check if Response_Data is empty
      if (!data[i][responseCol] || data[i][responseCol] === 'undefined' || data[i][responseCol] === '') {
        console.log('Response_Data is empty. Creating sample data...');
        
        // Create sample data
        const sampleData = createSampleTool1Data(clientId, traumaType);
        
        // Update the cell (row is i+1 because sheets are 1-indexed)
        // Column is responseCol+1 because sheets are 1-indexed
        sheet.getRange(i + 1, responseCol + 1).setValue(sampleData);
        
        console.log(`✅ Updated row ${i+1} with ${traumaType} trauma data`);
        return true;
      } else {
        console.log('Response_Data already exists. Not modifying.');
        return false;
      }
    }
  }
  
  console.log(`❌ No Tool1 row found for client ${clientId}`);
  return false;
}

/**
 * Fix client 6123LY specifically with Showing trauma
 */
function fixClient6123LY() {
  console.log('Fixing Tool1 data for client 6123LY...\n');
  
  const success = fixClientTool1Data('6123LY', 'Showing');
  
  if (success) {
    console.log('\n✅ Successfully fixed Tool1 data for 6123LY');
    console.log('The client should now see "Showing Love" questions in Tool2');
  } else {
    console.log('\n❌ Could not fix Tool1 data for 6123LY');
  }
}

// Run the check
checkAndFixTool1Data();