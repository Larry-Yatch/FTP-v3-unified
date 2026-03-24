/**
 * Trigger: on form submit (or manual run), copy the new row from
 * "Form Responses 1" into "Working Sheet" (columns A–W),
 * highlight that row in light red, and notify Sarah.
 */
function onFormSubmit(e) {
  FinancialTruPathFunctionLibrary.copyAndNotifySubmission({
    srcSheetName:        'Form Responses 1',
    destSheetName:       'Working Sheet',
    highlightColor:      '#FFCCCC',
    notificationEmail:   'Sarah@TruPathMastery.com',
    notificationSubject: 'New Issue Showing Love Grounding exercise Submission',     //change email subj line and email body with updated link
    notificationBody:    'Someone has submitted a response please go and process their response here: https://docs.google.com/spreadsheets/d/1Y5pGllwbS7ub5sn7RCKMsHsHkTYr86qpvsff_dpigQ4/edit?gid=2067018553#gid=2067018553'
  }, e);
}
