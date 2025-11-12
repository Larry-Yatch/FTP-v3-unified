function runImport() {
 const ss     = SpreadsheetApp.getActiveSpreadsheet();
 //Target sheet destination
 const calcSh = ss.getSheetByName("Form Responses 1");


 FinancialTruPathFunctionLibrary.importCore({
   targetSheet:         calcSh,                   
   sourceSpreadsheetId: "1SnDrt6ubL00nCob9BDbkfz-b-vLToKOZaqkjmYBmWnU",  // external file ID
   sourceSheetName:     "Form Responses 1",       // tab in external file
   matchColumnSource:   3,                        // student ID in Source
   sourceColumns:       [4],                  // read from columns of Source


   matchColumnTarget:   2,                        // student ID in Target
   destinationColumns:  [38],                  // write into columns
   checkColumnTarget:   39,                        // success column mark “yes”
   pauseFlagColumn:     40,                        // Pause Flag column mark “X” if no match
   highlightRangeWidth: 2                         // highlight columns on miss
 });
}
