/**
 * Logs the column number for each new header to confirm they’re found correctly.
 */
function testHeaderMappings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const testKeys = [
    'NarrativeFetched','Intro_Para2','Intro_Para3',
    'Growth_Archetype_Title','Growth_Archetype_Body',
    'Priority_High','Priority_Medium','Priority_Low',
    'Insight_Income','Action_Income','Lift_Income',
    'Insight_Spending','Action_Spending','Lift_Spending',
    'Insight_Debt','Action_Debt','Lift_Debt',
    'Insight_EmergencyFund','Action_EmergencyFund','Lift_EmergencyFund',
    'Insight_Savings','Action_Savings','Lift_Savings',
    'Insight_Investments','Action_Investments','Lift_Investments',
    'Insight_Retirement','Action_Retirement','Lift_Retirement',
    'Insight_Insurance','Action_Insurance','Lift_Insurance',
    'NarrativeMerged','ReportDocLink','ReportPDFLink','Emailed'
  ];
  testKeys.forEach(key => {
    const idx = headers.indexOf(key);
    Logger.log(`${key} → column ${ idx >= 0 ? idx+1 : 'NOT FOUND' }`);
  });
}
