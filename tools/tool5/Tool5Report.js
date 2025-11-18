/**
 * Tool5Report.js
 * Report wrapper for Love & Connection Grounding Tool
 *
 * Delegates to GroundingReport.js for actual report generation
 * Exists to follow pattern and allow tool-specific customizations if needed
 */

const Tool5Report = {

  /**
   * Generate Tool 5 report
   * Delegates to GroundingReport
   */
  generate(clientId, scoringResult, gptInsights) {
    const baseUrl = ScriptApp.getService().getUrl();

    return GroundingReport.generateReport({
      toolId: 'tool5',
      toolConfig: Tool5.config,
      clientId: clientId,
      baseUrl: baseUrl,
      scoringResult: scoringResult,
      gptInsights: gptInsights
    });
  },

  /**
   * Regenerate report from saved data
   */
  regenerate(clientId) {
    try {
      // Retrieve saved assessment data
      const savedData = DataService.getToolResponse(clientId, 'tool5');

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
      Logger.log(`Error regenerating Tool 5 report: ${error.message}`);
      throw error;
    }
  }
};
