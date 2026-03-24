function runImport() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  //Target sheet destination
  const calcSh = ss.getSheetByName("Form Responses 1");

  FinancialTruPathFunctionLibrary.importCore({
    targetSheet:         calcSh,                   
    sourceSpreadsheetId: "18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0",  // external file ID
    sourceSheetName:     "Form Responses 1",       // tab in external file
    matchColumnSource:   2,                        // student ID in external
    sourceColumns:       [24,25,26,29],                  // read from columns of external

    matchColumnTarget:   4,                        // student ID in Calculations
    destinationColumns:  [55,56,57,58],                  // write into columns
    checkColumnTarget:   55,                        // success column mark “yes” 
    pauseFlagColumn:     59,                        // Pause Flag column mark “X” if no match
    highlightRangeWidth: 4                         // highlight columns on miss
  });
}
