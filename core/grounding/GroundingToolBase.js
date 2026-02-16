/**
 * GroundingToolBase.js - Shared base for grounding tools (3, 5, 7)
 *
 * Extends FormToolBase with grounding-specific methods:
 *   - renderPageContent via GroundingFormBuilder
 *   - onPageSaved GPT analysis trigger
 *   - processFinalSubmission with GroundingScoring + GroundingGPT
 *   - Helper methods: extractResponses, collectGPTInsights, runFinalSyntheses, etc.
 *
 * Each grounding tool provides:
 *   - config: { id, name, subdomains, domain1Name, domain1Key, domain1Description, ... }
 *   - getIntroContent() — returns HTML string for the intro page
 *
 * Usage:
 *   const Tool3 = Object.assign({}, GroundingToolBase, {
 *     manifest: null,
 *     config: { ... },
 *     getIntroContent() { return `...`; }
 *   });
 */
var GroundingToolBase = Object.assign({}, FormToolBase, {

  /** Total pages for all grounding tools: 1 intro + 6 subdomains */
  _totalPages: 7,

  // ============================================================
  // PAGE RENDERING
  // ============================================================

  /**
   * Render page content via GroundingFormBuilder.
   * Called by FormToolBase.render() — returns HTML string.
   */
  renderPageContent(page, existingData, clientId) {
    return GroundingFormBuilder.renderPageContent({
      toolId: this.config.id,
      pageNum: page,
      clientId: clientId,
      subdomains: this.config.subdomains,
      intro: this.getIntroContent(),
      existingData: existingData
    });
  },

  // ============================================================
  // POST-SAVE GPT TRIGGER
  // ============================================================

  /**
   * Trigger background GPT analysis after page save (pages 2-7).
   * Called by FormToolBase.savePageData() via onPageSaved hook.
   */
  onPageSaved(clientId, page, formData, draftData) {
    if (page < 2 || page > 7) return;

    var toolId = this.config.id;
    var subdomainIndex = page - 2; // 0-5
    var subdomain = this.config.subdomains[subdomainIndex];

    try {
      // Extract open response for this subdomain
      var openResponseKey = subdomain.key + '_open_response';
      var openResponse = formData[openResponseKey];

      // Need sufficient data for GPT analysis
      if (!openResponse || openResponse.trim().length < 10) {
        LogUtils.debug('[' + toolId + '] Skipping GPT - insufficient open response for ' + subdomain.key + ' (length: ' + (openResponse ? openResponse.length : 0) + ')');
        return;
      }

      LogUtils.debug('[' + toolId + '] Triggering GPT analysis for ' + subdomain.key);

      // Extract aspect scores for GPT context
      var aspects = ['belief', 'behavior', 'feeling', 'consequence'];
      var responses = {};
      var aspectScores = {};

      aspects.forEach(function(aspect) {
        var fieldName = subdomain.key + '_' + aspect;
        var score = parseInt(formData[fieldName]);
        responses[fieldName] = score;
        responses[fieldName + '_label'] = formData[fieldName + '_label'] || '';
        aspectScores[aspect] = score;
      });
      responses[openResponseKey] = openResponse;

      // Check for duplicate (prevent redundant API calls on back/forward navigation)
      var existingInsight = GroundingGPT.getCachedInsight(toolId, clientId, subdomain.key);

      if (existingInsight) {
        LogUtils.debug('[' + toolId + '] GPT insight already cached for ' + subdomain.key + ' - skipping');
      } else {
        GroundingGPT.analyzeSubdomain({
          toolId: toolId,
          clientId: clientId,
          subdomainKey: subdomain.key,
          subdomainConfig: subdomain,
          responses: responses,
          aspectScores: aspectScores,
          previousInsights: {}
        });

        LogUtils.debug('[' + toolId + '] GPT analysis completed for ' + subdomain.key);
      }
    } catch (error) {
      // GPT failures must not block navigation
      LogUtils.error('[' + toolId + '] GPT trigger failed (non-blocking): ' + error.message);
      LogUtils.error(error.stack);
    }
  },

  // ============================================================
  // FINAL SUBMISSION
  // ============================================================

  /**
   * Process final submission for grounding tools.
   * Scores responses, collects GPT insights, runs syntheses, saves data.
   */
  processFinalSubmission(clientId) {
    var toolId = this.config.id;

    try {
      LogUtils.debug('[' + toolId + '] Processing final submission for ' + clientId);

      // Get all data from draft storage
      var allData = this.getExistingData(clientId);

      if (!allData) {
        throw new Error('No data found. Please start the assessment again.');
      }

      // Extract all responses (24 scale + 6 open responses = 30 total)
      var responses = this.extractResponses(allData);

      // Calculate scores using GroundingScoring
      var scoringResult = GroundingScoring.calculateScores(
        responses,
        this.config.subdomains
      );

      LogUtils.debug('[' + toolId + '] Scoring complete: Overall=' + scoringResult.overallQuotient);

      // Collect all GPT insights (from cache)
      var gptInsights = this.collectGPTInsights(clientId);

      // Run final 3 synthesis calls
      var syntheses = this.runFinalSyntheses(clientId, scoringResult, gptInsights);

      LogUtils.debug('[' + toolId + '] GPT syntheses complete');

      // Save complete assessment data
      this.saveAssessmentData(clientId, {
        responses: responses,
        scoringResult: scoringResult,
        gptInsights: gptInsights,
        syntheses: syntheses
      });

      LogUtils.debug('[' + toolId + '] Assessment data saved');

      // Return success (Code.js will handle report generation)
      return { success: true };

    } catch (error) {
      LogUtils.error('[' + toolId + '] Error processing submission: ' + error.message);
      throw error;
    }
  },

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Extract responses from form data, filtering out metadata and label fields.
   */
  extractResponses(formData) {
    var responses = {};

    Object.keys(formData).forEach(function(key) {
      // Skip metadata fields
      if (['client', 'page', 'subdomain_index', 'subdomain_key'].indexOf(key) !== -1) {
        return;
      }
      // Skip label fields (used for GPT context, not scoring)
      if (key.indexOf('_label', key.length - 6) !== -1) {
        return;
      }
      responses[key] = formData[key];
    });

    return responses;
  },

  /**
   * Collect GPT insights from cache (created during form navigation).
   */
  collectGPTInsights(clientId) {
    var toolId = this.config.id;
    var insights = { subdomains: {} };

    this.config.subdomains.forEach(function(subdomain) {
      var cached = GroundingGPT.getCachedInsight(toolId, clientId, subdomain.key);
      if (cached) {
        insights.subdomains[subdomain.key] = cached;
      } else {
        LogUtils.debug('No cached insight for ' + subdomain.key + ', will use fallback');
      }
    });

    return insights;
  },

  /**
   * Run final 3 synthesis calls (2 domain + 1 overall).
   */
  runFinalSyntheses(clientId, scoringResult, gptInsights) {
    var syntheses = {};

    // Domain 1 synthesis
    syntheses.domain1 = GroundingGPT.synthesizeDomain({
      toolId: this.config.id,
      clientId: clientId,
      domainConfig: {
        key: this.config.domain1Key,
        name: this.config.domain1Name,
        description: this.config.domain1Description
      },
      subdomainInsights: this.extractDomainInsights(gptInsights.subdomains, 0, 3),
      subdomainScores: this.extractDomainScores(scoringResult.subdomainQuotients, 0, 3),
      domainScore: scoringResult.domainQuotients.domain1,
      subdomainConfigs: this.config.subdomains.slice(0, 3)
    });

    // Domain 2 synthesis
    syntheses.domain2 = GroundingGPT.synthesizeDomain({
      toolId: this.config.id,
      clientId: clientId,
      domainConfig: {
        key: this.config.domain2Key,
        name: this.config.domain2Name,
        description: this.config.domain2Description
      },
      subdomainInsights: this.extractDomainInsights(gptInsights.subdomains, 3, 6),
      subdomainScores: this.extractDomainScores(scoringResult.subdomainQuotients, 3, 6),
      domainScore: scoringResult.domainQuotients.domain2,
      subdomainConfigs: this.config.subdomains.slice(3, 6)
    });

    // Overall synthesis
    syntheses.overall = GroundingGPT.synthesizeOverall({
      toolId: this.config.id,
      clientId: clientId,
      toolConfig: this.config,
      domainSyntheses: {
        [this.config.domain1Name]: syntheses.domain1,
        [this.config.domain2Name]: syntheses.domain2
      },
      allScores: scoringResult,
      subdomainInsights: gptInsights.subdomains
    });

    return syntheses;
  },

  /**
   * Extract insights for a specific domain (subdomains startIdx..endIdx).
   */
  extractDomainInsights(allInsights, startIdx, endIdx) {
    var domainInsights = {};
    var subdomains = this.config.subdomains.slice(startIdx, endIdx);

    subdomains.forEach(function(subdomain) {
      if (allInsights[subdomain.key]) {
        domainInsights[subdomain.key] = allInsights[subdomain.key];
      }
    });

    return domainInsights;
  },

  /**
   * Extract scores for a specific domain (subdomains startIdx..endIdx).
   */
  extractDomainScores(allScores, startIdx, endIdx) {
    var domainScores = {};
    var subdomains = this.config.subdomains.slice(startIdx, endIdx);

    subdomains.forEach(function(subdomain) {
      domainScores[subdomain.key] = allScores[subdomain.key];
    });

    return domainScores;
  },

  /**
   * Save assessment data to RESPONSES sheet, clear drafts and GPT cache.
   */
  saveAssessmentData(clientId, data) {
    var dataToSave = {
      responses: data.responses,
      scoring: data.scoringResult,
      gpt_insights: data.gptInsights,
      syntheses: data.syntheses,
      timestamp: new Date().toISOString(),
      tool_version: '1.0.0'
    };

    DataService.saveToolResponse(clientId, this.config.id, dataToSave);
    DraftService.clearDraft(this.config.id, clientId);
    GroundingGPT.clearCache(this.config.id, clientId);
  },

  /**
   * Generate report HTML via GroundingReport.
   */
  generateReport(clientId, scoringResult, gptInsights) {
    var baseUrl = ScriptApp.getService().getUrl();

    var htmlString = GroundingReport.generateReport({
      toolId: this.config.id,
      toolConfig: this.config,
      clientId: clientId,
      baseUrl: baseUrl,
      scoringResult: scoringResult,
      gptInsights: gptInsights
    });

    return HtmlService.createHtmlOutput(htmlString);
  },

  /**
   * Render error page with return-to-dashboard navigation.
   */
  renderErrorPage(error, clientId, baseUrl) {
    return NavigationHelpers.renderErrorPage('Error', error, clientId, { styled: true, navigable: true });
  }
});
