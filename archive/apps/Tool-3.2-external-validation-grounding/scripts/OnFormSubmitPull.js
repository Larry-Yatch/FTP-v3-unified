
function onFormSubmit(e) {
  FinancialTruPathFunctionLibrary.copyAndNotifySubmission({
    srcSheetName:          'Form Responses 1',
    destSheetName:         'Working Sheet',
    highlightColor:        '#FFCCCC',
    notificationEmail:     'Sarah@TruPathMastery.com',
    successSubject:        'New External Validation Grounding exercise Submission',
    successBody:           'A student has completed the exercise and has been marked in the tracker.  It needs to be processed here https://docs.google.com/spreadsheets/d/1OKWjMJELp21616A7WQQmsELr_J4RmY3xqChaoNMQjao/edit?gid=1399862622#gid=1399862622',
    failureSubject:        'New External Validation Grounding exercise Submission ⚠️ Student ID Not Found: External Validation Exercise',
    failureBody:           'The submitted Student ID could not be found please indicate submission manually here: https://docs.google.com/spreadsheets/d/104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo/edit?gid=2054833600#gid=2054833600. AND process here: https://docs.google.com/spreadsheets/d/1OKWjMJELp21616A7WQQmsELr_J4RmY3xqChaoNMQjao/edit?gid=1399862622#gid=1399862622.',
    trackingSpreadsheetId: '104pHxIgsGAcOrktL75Hi7WlEd8j0BoeadntLR9PrGYo',
    trackingSheetName:     'Financial',
    lookupColumn:          'G',
    markColumn:            'X',
    missingHighlightColor: '#FFFF00'
  }, e);
}
