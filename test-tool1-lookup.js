function testTool1Data() {
  const clientId = '6123LY';
  const SPREADSHEET_ID = '1yXdW2Z7_8dFxDMlmJ5SD4gVRSJJE7sKqupT-e8tEJjo';
  
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RESPONSES');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const toolIdCol = headers.indexOf('Tool_ID');
    const clientCol = headers.indexOf('Client_ID');
    const isLatestCol = headers.indexOf('Is_Latest');
    const responseCol = headers.indexOf('Response_Data');
    
    console.log('Headers found at columns:', {
      toolIdCol,
      clientCol,
      isLatestCol,
      responseCol
    });
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][clientCol] === clientId) {
        console.log('Found row for client', clientId, 'at row', i+1);
        console.log('Tool_ID:', data[i][toolIdCol]);
        console.log('Is_Latest:', data[i][isLatestCol]);
        
        if (data[i][toolIdCol] === 'tool1' && data[i][isLatestCol] === true) {
          const responseData = JSON.parse(data[i][responseCol]);
          console.log('Tool1 response structure keys:', Object.keys(responseData));
          console.log('Winner:', responseData.winner);
          console.log('Scores:', responseData.scores);
          return;
        }
      }
    }
    
    console.log('No Tool1 data found for client', clientId);
  } catch (e) {
    console.log('Error:', e.toString());
  }
}
