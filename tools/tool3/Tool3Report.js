/**
 * Tool3Report.js
 * Report wrapper for Identity & Validation Grounding Tool
 *
 * Delegates to GroundingReport.js for actual report generation
 * Exists to follow pattern and allow tool-specific customizations if needed
 */

const Tool3Report = {

  /**
   * Render report (called by Code.js completeToolSubmission)
   * CRITICAL: Method name and signature must match Code.js expectation
   * @param {string} clientId
   * @returns {HtmlOutput}
   */
  render(clientId) {
    try {
      // Retrieve saved assessment data
      const savedData = DataService.getToolResponse(clientId, 'tool3');

      if (!savedData || !savedData.scoring || !savedData.gpt_insights || !savedData.syntheses) {
        return HtmlService.createHtmlOutput(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>TruPath - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <?!= include('shared/styles') ?>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <h1 style="color: #dc3545;">Error</h1>
                <p>Assessment data not found or incomplete for client ${clientId}</p>
                <p class="muted">Please complete the assessment to view your report.</p>
                <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}"
                   class="btn-primary" style="display: inline-block; margin-top: 20px;">
                  ← Back to Dashboard
                </a>
              </div>
            </div>
          </body>
          </html>
        `);
      }

      // Reconstruct GPT insights
      const gptInsights = {
        subdomains: savedData.gpt_insights.subdomains || {},
        domain1: savedData.syntheses.domain1,
        domain2: savedData.syntheses.domain2,
        overall: savedData.syntheses.overall
      };

      // Generate report HTML
      const reportHtml = GroundingReport.generateReport({
        toolId: 'tool3',
        toolConfig: Tool3.config,
        clientId: clientId,
        baseUrl: ScriptApp.getService().getUrl(),
        scoringResult: savedData.scoring,
        gptInsights: gptInsights
      });

      return HtmlService.createHtmlOutput(reportHtml);

    } catch (error) {
      Logger.log(`[Tool3Report] Error rendering: ${error.message}`);
      return HtmlService.createHtmlOutput(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TruPath - Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <?!= include('shared/styles') ?>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1 style="color: #dc3545;">Error</h1>
              <p>Failed to generate report: ${error.message}</p>
              <a href="${ScriptApp.getService().getUrl()}?route=dashboard&client=${clientId}"
                 class="btn-primary" style="display: inline-block; margin-top: 20px;">
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  },

  /**
   * Generate Tool 3 report (legacy method, kept for compatibility)
   * Delegates to GroundingReport
   */
  generate(clientId, scoringResult, gptInsights) {
    const baseUrl = ScriptApp.getService().getUrl();

    return GroundingReport.generateReport({
      toolId: 'tool3',
      toolConfig: Tool3.config,
      clientId: clientId,
      baseUrl: baseUrl,
      scoringResult: scoringResult,
      gptInsights: gptInsights
    });
  },

  /**
   * Regenerate report from saved data (legacy method, kept for compatibility)
   */
  regenerate(clientId) {
    try {
      // Retrieve saved assessment data
      const savedData = DataService.getToolResponse(clientId, 'tool3');

      if (!savedData || !savedData.scoring || !savedData.gpt_insights || !savedData.syntheses) {
        throw new Error('Assessment data not found or incomplete');
      }

      // Reconstruct GPT insights object
      const gptInsights = {
        subdomains: savedData.gpt_insights.subdomains || {},
        domain1: savedData.syntheses.domain1,
        domain2: savedData.syntheses.domain2,
        overall: savedData.syntheses.overall
      };

      // Generate report
      return this.generate(clientId, savedData.scoring, gptInsights);

    } catch (error) {
      Logger.log(`Error regenerating Tool 3 report: ${error.message}`);
      throw error;
    }
  }
};
