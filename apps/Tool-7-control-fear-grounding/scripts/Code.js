/**
 * Control Fear Grounding Project
 * Main entry point for the Google Apps Script
 */

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Control Fear Grounding')
      .addSubMenu(ui.createMenu('🚀 Quick Actions')
        .addItem('Process New Submission', 'quickProcessNewSubmission')
        .addItem('Run Complete Pipeline (< 10 rows)', 'runCompletePipeline')
        .addItem('Check Pipeline Status', 'checkPipelineStatus'))
      .addSeparator()
      .addSubMenu(ui.createMenu('📋 Step-by-Step Pipeline')
        .addItem('Step 1: Process Responses', 'runStep1_ProcessResponses')
        .addItem('Step 2: Calculate Quotients', 'runStep2_CalculateQuotients')
        .addSeparator()
        .addItem('Step 3A: GPT Batch 1 (Rows 4-8)', 'runStep3A_GPTBatch1')
        .addItem('Step 3B: GPT Batch 2 (Rows 9-13)', 'runStep3B_GPTBatch2')
        .addItem('Step 3C: GPT Batch 3 (Rows 14-18)', 'runStep3C_GPTBatch3')
        .addItem('Step 3D: GPT Batch 4 (Rows 19-23)', 'runStep3D_GPTBatch4')
        .addItem('Step 3E: GPT Batch 5 (Rows 24-28)', 'runStep3E_GPTBatch5')
        .addItem('Step 3F: GPT Batch 6 (Rows 29-33)', 'runStep3F_GPTBatch6')
        .addItem('Step 3G: GPT Batch 7 (Rows 34-38)', 'runStep3G_GPTBatch7')
        .addItem('Step 3H: GPT Batch 8 (Rows 39-43)', 'runStep3H_GPTBatch8')
        .addItem('Step 3I: GPT Batch 9 (Rows 44-48)', 'runStep3I_GPTBatch9')
        .addItem('Step 3J: GPT Batch 10 (Rows 49-53)', 'runStep3J_GPTBatch10')
        .addItem('Step 3K: GPT Batch 11 (Rows 54-55)', 'runStep3K_GPTBatch11')
        .addSeparator()
        .addItem('Step 4: Generate Documents', 'runStep4_GenerateDocuments')
        .addItem('Step 5: Export PDFs & Email', 'runStep5_ExportAndEmail'))
      .addSeparator()
      .addSubMenu(ui.createMenu('🔧 Utilities')
        .addItem('Initialize Status Dashboard', 'initializeStatusDashboard')
        .addItem('Update Status Dashboard', 'updateStatusDashboard')
        .addItem('Validate Configuration', 'validateDocumentGenerationConfig')
        .addItem('Test Single Row Report', 'testSingleRowReport')
        .addItem('Clear Pipeline Markers', 'clearAllStepMarkers'))
      .addSeparator()
      .addItem('Settings', 'showSettings')
      .addToUi();
  } catch (e) {
    // Silently fail if called from a context where UI is not available
    // This can happen during form submissions or time-based triggers
  }
}

function processFormResponses() {
  SpreadsheetApp.getUi().alert('Ready to process form responses');
}

function showSettings() {
  SpreadsheetApp.getUi().alert('Settings coming soon');
}