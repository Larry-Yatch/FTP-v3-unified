/**
 * Tool8GPTAnalysis.js
 * GPT-enhanced analysis for Tool 8 Investment Planning reports
 *
 * Provides personalized narrative for single-scenario and comparison PDFs.
 * Follows Tool6GPTAnalysis.js pattern: 3-tier fallback (GPT -> Retry -> Fallback).
 *
 * Phase 8: GPT-Enhanced Reports
 */

var Tool8GPTAnalysis = {

  // ============================================================
  // SINGLE SCENARIO REPORT INSIGHTS
  // ============================================================

  /**
   * Generate personalized insights for a single-scenario PDF.
   * 3-tier: GPT -> Retry -> Fallback
   *
   * @param {Object} params
   * @param {Object} params.scenario - Scenario data from calculator
   * @param {Object} params.resolvedData - From Tool8.resolveClientData()
   * @returns {Object} {overview, keyInsights, nextSteps, source}
   */
  generateSingleReportInsights: function(params) {
    var scenario = params.scenario;
    var resolvedData = params.resolvedData;

    // TIER 1: Try GPT
    try {
      LogUtils.debug('[Tool8GPT] Tier 1: Attempting GPT for single report');
      var systemPrompt = this.buildSingleSystemPrompt(scenario, resolvedData);
      var userPrompt = this.buildSingleUserPrompt(scenario);

      var raw = this.callGPT({
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 800
      });

      var parsed = this.parseSingleResponse(raw);
      if (this.isValidSingleInsight(parsed)) {
        parsed.source = 'gpt';
        LogUtils.debug('[Tool8GPT] Tier 1 success');
        return parsed;
      }
      LogUtils.debug('[Tool8GPT] Tier 1 parsed but invalid, trying Tier 2');
    } catch (e) {
      LogUtils.debug('[Tool8GPT] Tier 1 error: ' + e);
    }

    // TIER 2: Retry after delay
    try {
      LogUtils.debug('[Tool8GPT] Tier 2: Retrying GPT');
      Utilities.sleep(2000);
      var systemPrompt2 = this.buildSingleSystemPrompt(scenario, resolvedData);
      var userPrompt2 = this.buildSingleUserPrompt(scenario);

      var raw2 = this.callGPT({
        systemPrompt: systemPrompt2,
        userPrompt: userPrompt2,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 800
      });

      var parsed2 = this.parseSingleResponse(raw2);
      if (this.isValidSingleInsight(parsed2)) {
        parsed2.source = 'gpt_retry';
        LogUtils.debug('[Tool8GPT] Tier 2 success');
        return parsed2;
      }
      LogUtils.debug('[Tool8GPT] Tier 2 parsed but invalid, falling back');
    } catch (e2) {
      LogUtils.debug('[Tool8GPT] Tier 2 error: ' + e2);
    }

    // TIER 3: Fallback
    LogUtils.debug('[Tool8GPT] Tier 3: Using fallback');
    this.logFallbackUsage(scenario.clientId || '', 'single_report', 'GPT unavailable');
    return Tool8Fallbacks.getSingleReportFallback(scenario);
  },

  // ============================================================
  // COMPARISON REPORT INSIGHTS
  // ============================================================

  /**
   * Generate personalized insights for a comparison PDF.
   * 3-tier: GPT -> Retry -> Fallback
   *
   * @param {Object} params
   * @param {Object} params.s1 - First scenario
   * @param {Object} params.s2 - Second scenario
   * @param {Object} params.resolvedData - From Tool8.resolveClientData()
   * @returns {Object} {synthesis, guidance, tradeoffs, source}
   */
  generateComparisonInsights: function(params) {
    var s1 = params.s1;
    var s2 = params.s2;
    var resolvedData = params.resolvedData;

    // TIER 1: Try GPT
    try {
      LogUtils.debug('[Tool8GPT] Tier 1: Attempting GPT for comparison');
      var systemPrompt = this.buildComparisonSystemPrompt(s1, s2, resolvedData);
      var userPrompt = this.buildComparisonUserPrompt(s1, s2);

      var raw = this.callGPT({
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 750
      });

      var parsed = this.parseComparisonResponse(raw);
      if (this.isValidComparisonInsight(parsed)) {
        parsed.source = 'gpt';
        LogUtils.debug('[Tool8GPT] Comparison Tier 1 success');
        return parsed;
      }
      LogUtils.debug('[Tool8GPT] Comparison Tier 1 invalid, trying Tier 2');
    } catch (e) {
      LogUtils.debug('[Tool8GPT] Comparison Tier 1 error: ' + e);
    }

    // TIER 2: Retry after delay
    try {
      LogUtils.debug('[Tool8GPT] Tier 2: Retrying GPT for comparison');
      Utilities.sleep(2000);
      var systemPrompt2 = this.buildComparisonSystemPrompt(s1, s2, resolvedData);
      var userPrompt2 = this.buildComparisonUserPrompt(s1, s2);

      var raw2 = this.callGPT({
        systemPrompt: systemPrompt2,
        userPrompt: userPrompt2,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 750
      });

      var parsed2 = this.parseComparisonResponse(raw2);
      if (this.isValidComparisonInsight(parsed2)) {
        parsed2.source = 'gpt_retry';
        LogUtils.debug('[Tool8GPT] Comparison Tier 2 success');
        return parsed2;
      }
      LogUtils.debug('[Tool8GPT] Comparison Tier 2 invalid, falling back');
    } catch (e2) {
      LogUtils.debug('[Tool8GPT] Comparison Tier 2 error: ' + e2);
    }

    // TIER 3: Fallback
    LogUtils.debug('[Tool8GPT] Comparison Tier 3: Using fallback');
    this.logFallbackUsage('', 'comparison_report', 'GPT unavailable');
    return Tool8Fallbacks.getComparisonFallback(s1, s2, resolvedData);
  },

  // ============================================================
  // TRAUMA CONTEXT BUILDER
  // ============================================================

  /**
   * Build trauma-informed context string for GPT prompts.
   * Uses TOOL8_TRAUMA_INSIGHTS constants + resolvedData scoring.
   *
   * @param {Object} resolvedData - From Tool8.resolveClientData()
   * @returns {string} Context paragraph for system prompt (empty string if no data)
   */
  buildTraumaContext: function(resolvedData) {
    if (!resolvedData) return '';

    var sections = [];

    // Primary trauma pattern
    if (resolvedData.traumaPattern && TOOL8_TRAUMA_INSIGHTS[resolvedData.traumaPattern]) {
      var insight = TOOL8_TRAUMA_INSIGHTS[resolvedData.traumaPattern];
      sections.push(
        'TRAUMA-INFORMED CONTEXT:',
        'Primary Pattern: ' + insight.name + ' (' + insight.type + ')',
        'Investment Manifestation: ' + insight.pattern,
        'Watch For: ' + insight.watchFor,
        'Healing Direction: ' + insight.healing
      );

      // Secondary pattern (second-highest score)
      if (resolvedData.traumaScores) {
        var scores = resolvedData.traumaScores;
        var sorted = Object.keys(scores)
          .filter(function(k) { return k !== resolvedData.traumaPattern; })
          .sort(function(a, b) { return (scores[b] || 0) - (scores[a] || 0); });
        if (sorted.length > 0 && scores[sorted[0]] > 0) {
          var secondary = TOOL8_TRAUMA_INSIGHTS[sorted[0]];
          if (secondary) {
            sections.push('Secondary Pattern: ' + secondary.name + ' (score: ' + scores[sorted[0]] + ')');
          }
        }
      }
    }

    // High subdomain scores (action barrier context)
    var toolScorings = [
      { key: 'tool3Scoring', label: 'Grounding' },
      { key: 'tool5Scoring', label: 'Relational' },
      { key: 'tool7Scoring', label: 'Control/Purpose' }
    ];
    var highSubdomains = [];

    for (var i = 0; i < toolScorings.length; i++) {
      var scoring = resolvedData[toolScorings[i].key];
      if (scoring && scoring.subdomainQuotients) {
        var keys = Object.keys(scoring.subdomainQuotients);
        for (var j = 0; j < keys.length; j++) {
          var q = Number(scoring.subdomainQuotients[keys[j]] || 0);
          if (q > 60) {
            highSubdomains.push(toolScorings[i].label + ' ' + keys[j] + ': ' + q);
          }
        }
      }
    }

    if (highSubdomains.length > 0) {
      sections.push('High-scoring subdomains (above 60): ' + highSubdomains.join(', '));
    }

    return sections.join('\n');
  },

  // ============================================================
  // PROMPT BUILDERS - SINGLE REPORT
  // ============================================================

  /**
   * Build system prompt for single-scenario GPT analysis
   */
  buildSingleSystemPrompt: function(scenario, resolvedData) {
    var riskBand = Tool8Report.getRiskBand(scenario.risk || 0);
    var mode = scenario.mode || 'contrib';
    var modeLabels = { contrib: 'Monthly Savings Required', return: 'Returns Required', time: 'Years Required' };

    var prompt = [
      'You are a trauma-informed financial education coach writing a personalized analysis for a student who just completed an investment planning calculator.',
      '',
      'STUDENT SCENARIO:',
      '- Monthly Retirement Income Goal: $' + Math.round(scenario.M_real || 0).toLocaleString(),
      '- Years Until Retirement: ' + (scenario.T || 0),
      '- Monthly Savings Capacity: $' + Math.round(scenario.C_cap || 0).toLocaleString(),
      '- Current Investment Balance: $' + Math.round(scenario.A0 || 0).toLocaleString(),
      '- Risk Level: ' + Number(scenario.risk || 0).toFixed(1) + '/10 (' + riskBand.label + ')',
      '- Calculation Mode: ' + (modeLabels[mode] || mode),
      ''
    ];

    // Mode-specific results
    if (mode === 'contrib' && scenario.Creq !== '') {
      prompt.push('- Required Monthly Savings: $' + Math.round(Number(scenario.Creq) || 0).toLocaleString());
      var gap = Number(scenario.C_cap) - Number(scenario.Creq);
      prompt.push('- Surplus/Shortfall: $' + Math.round(gap).toLocaleString() + '/month (' + (gap >= 0 ? 'FEASIBLE' : 'NEEDS ADJUSTMENT') + ')');
    }
    if (mode === 'return' && scenario.rSolved !== '') {
      prompt.push('- Required Annual Return: ' + (Number(scenario.rSolved) * 100).toFixed(2) + '%');
      prompt.push('- Feasibility: ' + (Number(scenario.rSolved) <= 0.25 ? 'WITHIN RANGE' : 'EXCEEDS TYPICAL RETURNS'));
    }
    if (mode === 'time' && scenario.tSolved !== '') {
      prompt.push('- Years Needed: ' + Math.round(Number(scenario.tSolved)));
    }

    prompt.push('- Required Nest Egg: $' + Math.round(scenario.Areq || 0).toLocaleString());
    prompt.push('- Effective Accumulation Return: ' + (Number(scenario.rAccEff || 0) * 100).toFixed(1) + '%');
    prompt.push('');

    // Student context from upstream tools
    if (resolvedData) {
      if (resolvedData.age) {
        prompt.push('STUDENT CONTEXT:');
        prompt.push('- Age: ' + resolvedData.age);
      }
    }

    // Trauma context
    var traumaContext = this.buildTraumaContext(resolvedData);
    if (traumaContext) {
      prompt.push('');
      prompt.push(traumaContext);
    }

    prompt.push('');
    prompt.push('WRITING GUIDELINES:');
    prompt.push('- Address the student directly ("you", "your")');
    prompt.push('- Ground EVERY insight in THEIR specific numbers');
    prompt.push('- If trauma data is available, weave awareness naturally — do not label or diagnose');
    prompt.push('- Be encouraging but honest about feasibility');
    prompt.push('- NO markdown formatting (no **, no #, no bullets with *)');
    prompt.push('- BE CONCISE — this must fit on a PDF');
    prompt.push('- Use "do not" instead of "don\'t", "cannot" instead of "can\'t"');

    return prompt.join('\n');
  },

  /**
   * Build user prompt for single-scenario GPT analysis
   */
  buildSingleUserPrompt: function(scenario) {
    return [
      'Write a personalized investment analysis using EXACTLY this format:',
      '',
      'Overview:',
      '(3-4 sentences interpreting what the numbers mean for this student. Reference their specific income goal, timeline, and feasibility result. If trauma data exists, weave in how their pattern might interact with this plan.)',
      '',
      'Key Insights:',
      '1. [Feasibility interpretation — what the gap or surplus means practically. 2-3 sentences.]',
      '2. [Risk/return insight — what their risk level implies for their timeline. 2-3 sentences.]',
      '3. [Timeline insight — how time works for or against them given their specific numbers. 2-3 sentences.]',
      '',
      'Next Steps:',
      '1. [Immediate concrete action they can take this week. One sentence.]',
      '2. [A 30-day setup or automation action. One sentence.]',
      '3. [An ongoing quarterly review habit. One sentence.]'
    ].join('\n');
  },

  // ============================================================
  // PROMPT BUILDERS - COMPARISON REPORT
  // ============================================================

  /**
   * Build system prompt for comparison GPT analysis
   */
  buildComparisonSystemPrompt: function(s1, s2, resolvedData) {
    var band1 = Tool8Report.getRiskBand(s1.risk || 0);
    var band2 = Tool8Report.getRiskBand(s2.risk || 0);

    var prompt = [
      'You are a trauma-informed financial education coach writing a comparison analysis for a student who is evaluating two investment planning scenarios.',
      '',
      'SCENARIO 1: "' + (s1.name || 'Scenario A') + '"',
      '- Monthly Income Goal: $' + Math.round(s1.M_real || 0).toLocaleString(),
      '- Years to Retirement: ' + (s1.T || 0),
      '- Risk Level: ' + Number(s1.risk || 0).toFixed(1) + '/10 (' + band1.label + ')',
      '- Savings Capacity: $' + Math.round(s1.C_cap || 0).toLocaleString() + '/mo',
      '- Current Assets: $' + Math.round(s1.A0 || 0).toLocaleString(),
      '- Required Nest Egg: $' + Math.round(s1.Areq || 0).toLocaleString(),
      '- Effective Return: ' + (Number(s1.rAccEff || 0) * 100).toFixed(1) + '%',
      ''
    ];

    // S1 mode-specific
    if (s1.Creq !== '') prompt.push('- Required Monthly Savings: $' + Math.round(Number(s1.Creq) || 0).toLocaleString());
    if (s1.rSolved !== '') prompt.push('- Required Return: ' + (Number(s1.rSolved) * 100).toFixed(2) + '%');
    if (s1.tSolved !== '') prompt.push('- Years Needed: ' + Math.round(Number(s1.tSolved)));

    prompt.push('');
    prompt.push('SCENARIO 2: "' + (s2.name || 'Scenario B') + '"');
    prompt.push('- Monthly Income Goal: $' + Math.round(s2.M_real || 0).toLocaleString());
    prompt.push('- Years to Retirement: ' + (s2.T || 0));
    prompt.push('- Risk Level: ' + Number(s2.risk || 0).toFixed(1) + '/10 (' + band2.label + ')');
    prompt.push('- Savings Capacity: $' + Math.round(s2.C_cap || 0).toLocaleString() + '/mo');
    prompt.push('- Current Assets: $' + Math.round(s2.A0 || 0).toLocaleString());
    prompt.push('- Required Nest Egg: $' + Math.round(s2.Areq || 0).toLocaleString());
    prompt.push('- Effective Return: ' + (Number(s2.rAccEff || 0) * 100).toFixed(1) + '%');

    // S2 mode-specific
    if (s2.Creq !== '') prompt.push('- Required Monthly Savings: $' + Math.round(Number(s2.Creq) || 0).toLocaleString());
    if (s2.rSolved !== '') prompt.push('- Required Return: ' + (Number(s2.rSolved) * 100).toFixed(2) + '%');
    if (s2.tSolved !== '') prompt.push('- Years Needed: ' + Math.round(Number(s2.tSolved)));

    // Trauma context
    var traumaContext = this.buildTraumaContext(resolvedData);
    if (traumaContext) {
      prompt.push('');
      prompt.push(traumaContext);
    }

    prompt.push('');
    prompt.push('WRITING GUIDELINES:');
    prompt.push('- Use ACTUAL SCENARIO NAMES ("' + (s1.name || 'Scenario A') + '" and "' + (s2.name || 'Scenario B') + '"), never generic A/B');
    prompt.push('- Reference specific numbers from BOTH scenarios');
    prompt.push('- If trauma data exists, consider how patterns might affect the choice between scenarios');
    prompt.push('- Be clear on trade-offs without being prescriptive');
    prompt.push('- For each trade-off, show the long-term compounding impact — how the difference between scenarios grows over time, with approximate dollar amounts');
    prompt.push('- Reference the timeline to show how small differences become large through compounding');
    prompt.push('- NO markdown formatting');
    prompt.push('- BE CONCISE');
    prompt.push('- Use "do not" instead of "don\'t", "cannot" instead of "can\'t"');

    return prompt.join('\n');
  },

  /**
   * Build user prompt for comparison GPT analysis
   */
  buildComparisonUserPrompt: function(s1, s2) {
    return [
      'Write a comparison analysis using EXACTLY this format:',
      '',
      'Synthesis:',
      '(3-4 sentences explaining the key differences between "' + (s1.name || 'Scenario A') + '" and "' + (s2.name || 'Scenario B') + '". Use scenario names. Reference specific numbers.)',
      '',
      'Decision Guidance:',
      '(2-3 sentences on which scenario might work better and why. Consider any psychological patterns if data is available. Use scenario names.)',
      '',
      'Key Trade-offs:',
      '1. [First trade-off with specific numbers. Show how this difference compounds over the full timeline with approximate dollar impact. 2-3 sentences.]',
      '2. [Second trade-off with compounding impact over time. 2-3 sentences.]',
      '3. [Third trade-off with long-term dollar impact. 2-3 sentences.]'
    ].join('\n');
  },

  // ============================================================
  // RESPONSE PARSERS
  // ============================================================

  /**
   * Parse single-report GPT response
   */
  parseSingleResponse: function(text) {
    return {
      overview: this.extractSection(text, 'Overview'),
      keyInsights: this.extractNumberedList(text, 'Key Insights'),
      nextSteps: this.extractNumberedList(text, 'Next Steps')
    };
  },

  /**
   * Parse comparison GPT response
   */
  parseComparisonResponse: function(text) {
    return {
      synthesis: this.extractSection(text, 'Synthesis'),
      guidance: this.extractSection(text, 'Decision Guidance'),
      tradeoffs: this.extractNumberedList(text, 'Key Trade-offs')
    };
  },

  /**
   * Extract a section from plain-text response.
   * Handles optional ** markdown and colon after header.
   */
  extractSection: function(text, sectionName) {
    var escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp(
      '\\*{0,2}' + escapedName + '\\*{0,2}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\n\\*{0,2}[A-Z][a-z\\s]+\\*{0,2}\\s*:?\\s*|$)',
      'i'
    );
    var match = text.match(regex);
    var extracted = match ? match[1].trim() : '';

    // Strip markdown formatting
    extracted = extracted.replace(/\*\*/g, '');
    extracted = extracted.replace(/\*/g, '');
    extracted = extracted.replace(/_/g, '');

    return extracted.trim();
  },

  /**
   * Extract numbered list from a section
   */
  extractNumberedList: function(text, sectionName) {
    var sectionText = this.extractSection(text, sectionName);
    var lines = sectionText.split('\n')
      .filter(function(line) { return line.trim().match(/^\d+\./); })
      .map(function(line) { return line.replace(/^\d+\.\s*/, '').trim(); });

    return lines.length > 0 ? lines : ['Analysis not available'];
  },

  // ============================================================
  // VALIDATORS
  // ============================================================

  /**
   * Validate single-report insight completeness
   */
  isValidSingleInsight: function(insight) {
    return (
      insight &&
      insight.overview && insight.overview.length > 50 &&
      insight.keyInsights && insight.keyInsights.length >= 1 &&
      insight.nextSteps && insight.nextSteps.length >= 1
    );
  },

  /**
   * Validate comparison insight completeness
   */
  isValidComparisonInsight: function(insight) {
    return (
      insight &&
      insight.synthesis && insight.synthesis.length > 50 &&
      insight.guidance && insight.guidance.length > 30
    );
  },

  // ============================================================
  // GPT API
  // ============================================================

  /**
   * Call OpenAI GPT API
   * Uses same API key as Tool 6 (OPENAI_API_KEY in Script Properties)
   */
  callGPT: function(opts) {
    var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in Script Properties');
    }

    var response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify({
        model: opts.model,
        messages: [
          { role: 'system', content: opts.systemPrompt },
          { role: 'user', content: opts.userPrompt }
        ],
        temperature: opts.temperature,
        max_tokens: opts.maxTokens
      }),
      muteHttpExceptions: true
    });

    var json = JSON.parse(response.getContentText());

    if (json.error) {
      throw new Error('OpenAI API Error: ' + json.error.message);
    }

    return json.choices[0].message.content;
  },

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage: function(clientId, reportType, errorMessage) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('GPT_FALLBACK_LOG');
      if (!sheet) {
        sheet = ss.insertSheet('GPT_FALLBACK_LOG');
        sheet.appendRow(['Timestamp', 'ClientID', 'Tool', 'ReportType', 'Error']);
      }
      sheet.appendRow([
        new Date().toISOString(),
        clientId,
        'tool8',
        reportType,
        errorMessage
      ]);
    } catch (logErr) {
      LogUtils.error('[Tool8GPT] Failed to log fallback: ' + logErr);
    }
  }
};
