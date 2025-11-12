function Normalize1() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  const statusSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Function Status Update Sheet");


FinancialTruPathFunctionLibrary.normalizeColumns({
  sheet: sheet,
 // statusSheetName: "Function Status Update Sheet",  // ✅ Use the name, not the object
  columnsToNormalize: [10],
  startRow: 4,
  statusColumn: 61,
  normalizationMap: {
    '1': 0, '2': 3, '3': 4, '4': 5, '5': 5, '6': 5, '7': 5, '8': 5, '9': 5,
    '10': 5, '11': 5, '12': 5, '13': 5, '14': 5, '15': 5
  }
});
}