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

      // DataService returns: { data: { scoring, gpt_insights, syntheses }, clientId, toolId, ... }
      // We need to access the nested 'data' property
      const assessmentData = savedData?.data || savedData;

      if (!savedData || !assessmentData.scoring || !assessmentData.gpt_insights || !assessmentData.syntheses) {
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
      LogUtils.debug(`[Tool3Report] Reconstructing gptInsights for ${clientId}`);
      LogUtils.debug(`[Tool3Report] assessmentData.gpt_insights exists: ${!!assessmentData.gpt_insights}`);
      LogUtils.debug(`[Tool3Report] assessmentData.syntheses exists: ${!!assessmentData.syntheses}`);

      const gptInsights = {
        subdomains: assessmentData.gpt_insights?.subdomains || {},
        domain1: assessmentData.syntheses?.domain1,
        domain2: assessmentData.syntheses?.domain2,
        overall: assessmentData.syntheses?.overall
      };

      LogUtils.debug(`[Tool3Report] gptInsights.domain1 exists: ${!!gptInsights.domain1}`);
      LogUtils.debug(`[Tool3Report] gptInsights.domain1.summary exists: ${!!gptInsights.domain1?.summary}`);
      LogUtils.debug(`[Tool3Report] gptInsights.domain1.summary length: ${gptInsights.domain1?.summary?.length || 0}`);
      LogUtils.debug(`[Tool3Report] gptInsights.domain2 exists: ${!!gptInsights.domain2}`);
      LogUtils.debug(`[Tool3Report] gptInsights.domain2.summary exists: ${!!gptInsights.domain2?.summary}`);

      // Generate report HTML
      const reportHtml = GroundingReport.generateReport({
        toolId: 'tool3',
        toolConfig: Tool3.config,
        clientId: clientId,
        baseUrl: ScriptApp.getService().getUrl(),
        scoringResult: assessmentData.scoring,
        gptInsights: gptInsights,
        formData: assessmentData.responses || {}  // Add formData for header
      });

      return HtmlService.createHtmlOutput(reportHtml);

    } catch (error) {
      LogUtils.error(`[Tool3Report] Error rendering: ${error.message}`);
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
   * Get assessment results for report generation (used by PDFGenerator)
   * @param {string} clientId - Client ID
   * @returns {Object} Results object with scoring, gptInsights, formData
   */
  getResults(clientId) {
    try {
      const savedData = DataService.getToolResponse(clientId, 'tool3');
      const assessmentData = savedData?.data || savedData;

      if (!savedData || !assessmentData.scoring || !assessmentData.gpt_insights || !assessmentData.syntheses) {
        return null;
      }

      // Reconstruct GPT insights
      const gptInsights = {
        subdomains: assessmentData.gpt_insights.subdomains || {},
        domain1: assessmentData.syntheses.domain1,
        domain2: assessmentData.syntheses.domain2,
        overall: assessmentData.syntheses.overall
      };

      return {
        clientId: clientId,
        scoring: assessmentData.scoring,
        gptInsights: gptInsights,
        formData: assessmentData.responses || {}
      };
    } catch (error) {
      LogUtils.error(`[Tool3Report] Error getting results: ${error.message}`);
      return null;
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
      LogUtils.error(`Error regenerating Tool 3 report: ${error.message}`);
      throw error;
    }
  }
};
