/**
 * Debug script to check Tool2 trauma mapping
 * Run this in Google Apps Script to see what's happening with client 6123LY
 */

function debugTool2TraumaMapping() {
  console.log('=================================');
  console.log('TOOL2 TRAUMA MAPPING DEBUG');
  console.log('=================================\n');
  
  const clientId = '6123LY';
  const SPREADSHEET_ID = CONFIG.MASTER_SHEET_ID;
  
  console.log('Testing client:', clientId);
  console.log('Spreadsheet ID:', SPREADSHEET_ID);
  console.log('');
  
  // Step 1: Check what Tool1 saved
  console.log('STEP 1: Checking Tool1 saved data');
  console.log('----------------------------------');
  
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RESPONSES');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const toolIdCol = headers.indexOf('Tool_ID');
    const clientCol = headers.indexOf('Client_ID');
    const isLatestCol = headers.indexOf('Is_Latest');
    const responseCol = headers.indexOf('Data');  // Column is named 'Data', not 'Response_Data'
    const timestampCol = headers.indexOf('Timestamp');
    
    let tool1Found = false;
    let tool2Found = false;
    
    // Find both Tool1 and Tool2 data
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][clientCol] === clientId && data[i][isLatestCol] === true) {
        
        if (data[i][toolIdCol] === 'tool1' && !tool1Found) {
          tool1Found = true;
          console.log('✅ Found Tool1 response at row', i+1);
          console.log('   Timestamp:', data[i][timestampCol]);
          
          // Check if response data exists
          const rawData = data[i][responseCol];
          console.log('   Raw Response_Data type:', typeof rawData);
          console.log('   Raw Response_Data length:', rawData ? String(rawData).length : 0);
          console.log('   First 100 chars:', rawData ? String(rawData).substring(0, 100) : 'null/undefined');
          
          if (!rawData || rawData === 'undefined' || rawData === '') {
            console.log('   ❌ Response_Data is empty or undefined!');
            continue;
          }
          
          const responseData = JSON.parse(data[i][responseCol]);
          console.log('   Response structure keys:', Object.keys(responseData));
          console.log('   Winner field:', responseData.winner);
          console.log('   Scores:', JSON.stringify(responseData.scores, null, 2));
          
          // Check specific score values
          if (responseData.scores) {
            console.log('\n   Score breakdown:');
            console.log('   - FSV:', responseData.scores.FSV);
            console.log('   - Control:', responseData.scores.Control);
            console.log('   - ExVal:', responseData.scores.ExVal);
            console.log('   - Fear:', responseData.scores.Fear);
            console.log('   - Receiving:', responseData.scores.Receiving);
            console.log('   - Showing:', responseData.scores.Showing);
          }
        }
        
        if (data[i][toolIdCol] === 'tool2' && !tool2Found) {
          tool2Found = true;
          console.log('\n✅ Found Tool2 response at row', i+1);
          console.log('   Timestamp:', data[i][timestampCol]);
          
          // Check if response data exists
          const rawData = data[i][responseCol];
          console.log('   Raw Response_Data type:', typeof rawData);
          console.log('   Raw Response_Data length:', rawData ? String(rawData).length : 0);
          console.log('   First 100 chars:', rawData ? String(rawData).substring(0, 100) : 'null/undefined');
          
          if (!rawData || rawData === 'undefined' || rawData === '') {
            console.log('   ❌ Response_Data is empty or undefined!');
            continue;
          }
          
          const responseData = JSON.parse(data[i][responseCol]);
          // Check which adaptive fields were saved
          console.log('   Adaptive fields present:');
          if (responseData.q55a_fsv_hiding !== undefined) console.log('   - q55a_fsv_hiding (FSV)');
          if (responseData.q55b_control_anxiety !== undefined) console.log('   - q55b_control_anxiety (Control)');
          if (responseData.q55c_exval_influence !== undefined) console.log('   - q55c_exval_influence (ExVal)');
          if (responseData.q55d_fear_paralysis !== undefined) console.log('   - q55d_fear_paralysis (Fear)');
          if (responseData.q55e_receiving_discomfort !== undefined) console.log('   - q55e_receiving_discomfort (Receiving)');
          if (responseData.q55f_showing_overserving !== undefined) console.log('   - q55f_showing_overserving (Showing)');
          
          // Check the generic adaptive fields
          if (responseData.adaptiveScale !== undefined) {
            console.log('   - adaptiveScale:', responseData.adaptiveScale);
          }
          if (responseData.adaptiveImpact !== undefined) {
            console.log('   - adaptiveImpact:', responseData.adaptiveImpact.substring(0, 50) + '...');
          }
        }
      }
    }
    
    if (!tool1Found) {
      console.log('❌ No Tool1 data found for client', clientId);
    }
    if (!tool2Found) {
      console.log('\nℹ️ No Tool2 data found yet for client', clientId);
    }
    
  } catch (e) {
    console.log('❌ Error checking database:', e.toString());
  }
  
  // Step 2: Test getTool1TraumaData function
  console.log('\n\nSTEP 2: Testing getTool1TraumaData function');
  console.log('--------------------------------------------');
  
  try {
    const result = Tool2.getTool1TraumaData(clientId);
    console.log('Function returned:', JSON.stringify(result, null, 2));
    
    // Step 3: Test which questions would be shown
    console.log('\n\nSTEP 3: Testing question selection');
    console.log('-----------------------------------');
    
    const topTrauma = result.topTrauma;
    console.log('Top trauma type:', topTrauma);
    
    // Map of what questions should show
    const questionMap = {
      'FSV': 'Q55: Hiding financial situation / Q56: Impact of hiding',
      'Control': 'Q55: Financial control anxiety / Q56: Impact of control need',
      'ExVal': 'Q55: Others\' opinions influence / Q56: Impact of validation seeking',
      'Fear': 'Q55: Fear paralysis / Q56: Impact of fear',
      'Receiving': 'Q55: Receiving help comfort / Q56: Impact of not receiving',
      'Showing': 'Q55: Sacrificing for others / Q56: Impact of over-serving'
    };
    
    console.log('Expected questions:', questionMap[topTrauma] || 'DEFAULT TO FSV');
    
    // Check if the key exists in Tool2's question object
    const validKeys = ['FSV', 'Control', 'ExVal', 'Fear', 'Receiving', 'Showing'];
    if (!validKeys.includes(topTrauma)) {
      console.log('\n⚠️ WARNING: topTrauma "' + topTrauma + '" not in valid keys:', validKeys);
      console.log('This would cause fallback to FSV questions!');
    }
    
  } catch (e) {
    console.log('❌ Error testing getTool1TraumaData:', e.toString());
  }
  
  // Step 4: Check current draft/session data
  console.log('\n\nSTEP 4: Checking current draft/session');
  console.log('---------------------------------------');
  
  try {
    // Check PropertiesService
    const draftKey = `tool2_draft_${clientId}`;
    const draftData = PropertiesService.getUserProperties().getProperty(draftKey);
    
    if (draftData) {
      const draft = JSON.parse(draftData);
      console.log('✅ Found draft in PropertiesService');
      console.log('   Last page:', draft.lastPage);
      console.log('   Last update:', draft.lastUpdate);
      
      // Check adaptive fields
      if (draft.adaptiveScale !== undefined) {
        console.log('   adaptiveScale value:', draft.adaptiveScale);
      }
      if (draft.adaptiveImpact !== undefined) {
        console.log('   adaptiveImpact present:', 'Yes (' + draft.adaptiveImpact.length + ' chars)');
      }
    } else {
      console.log('ℹ️ No draft found in PropertiesService');
    }
    
    // Check DataService if available
    if (typeof DataService !== 'undefined') {
      const activeDraft = DataService.getActiveDraft(clientId, 'tool2');
      if (activeDraft) {
        console.log('\n✅ Found active draft in DataService');
        console.log('   Status:', activeDraft.status);
        console.log('   Adaptive fields:', {
          adaptiveScale: activeDraft.data.adaptiveScale,
          adaptiveImpact: activeDraft.data.adaptiveImpact ? 'Present' : 'Missing'
        });
      }
    }
    
  } catch (e) {
    console.log('❌ Error checking draft:', e.toString());
  }
  
  console.log('\n=================================');
  console.log('DEBUG COMPLETE');
  console.log('=================================');
}

// Run the debug function
debugTool2TraumaMapping();