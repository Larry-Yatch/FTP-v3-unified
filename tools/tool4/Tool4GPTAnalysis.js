/**
 * Tool4GPTAnalysis.js
 * GPT-powered personalized insights for Tool 4 reports
 *
 * Single GPT call per report (blocking, not background)
 * 3-Tier Fallback: GPT → Retry → Score-aware Fallback
 *
 * Cost: ~$0.02-0.03 per report (GPT-4o)
 * Speed: ~3-5 seconds per call
 */

const Tool4GPTAnalysis = {

  // ============================================================
  // MAIN REPORT INSIGHTS
  // ============================================================

  /**
   * Generate personalized insights for Main Report PDF
   *
   * @param {Object} params - Analysis parameters
   * @returns {Object} { overview, strategicInsights, recommendation, source }
   */
  generateMainReportInsights(params) {
    const {
      clientId,
      preSurveyData,
      allocation,
      validationResults,
      helperInsights,
      tool1Data,
      tool2Data
    } = params;

    // Validate required params
    if (!preSurveyData || !allocation || !allocation.percentages) {
      Logger.log('[Tool4GPT] Missing required data for main report');
      return Tool4Fallbacks.getMainReportFallback(preSurveyData, allocation);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Tool4 GPT: Main report for ${clientId}`);

      const systemPrompt = this.buildMainReportSystemPrompt(preSurveyData, allocation, tool1Data, tool2Data);
      const userPrompt = this.buildMainReportUserPrompt(preSurveyData, allocation, validationResults, helperInsights);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 600
      });

      const parsed = this.parseMainReportResponse(result);

      if (this.isValidMainInsight(parsed)) {
        Logger.log('[TIER 1] Tool4 GPT success: Main report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`[TIER 1] Tool4 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Tool4 GPT retry: Main report for ${clientId}`);

        const systemPrompt = this.buildMainReportSystemPrompt(preSurveyData, allocation, tool1Data, tool2Data);
        const userPrompt = this.buildMainReportUserPrompt(preSurveyData, allocation, validationResults, helperInsights);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 600
        });

        const parsed = this.parseMainReportResponse(result);

        if (this.isValidMainInsight(parsed)) {
          Logger.log('[TIER 2] Tool4 GPT retry success: Main report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`[TIER 2] Tool4 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Score-aware Fallback
        // ============================================================
        Logger.log('[TIER 3] Using fallback: Main report');
        this.logFallbackUsage(clientId, 'main_report', retryError.message);

        return {
          ...Tool4Fallbacks.getMainReportFallback(preSurveyData, allocation),
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

  // ============================================================
  // COMPARISON REPORT INSIGHTS
  // ============================================================

  /**
   * Generate personalized insights for Comparison Report PDF
   *
   * @param {Object} params - Comparison parameters
   * @returns {Object} { synthesis, decisionGuidance, source }
   */
  generateComparisonInsights(params) {
    const {
      clientId,
      scenario1,
      scenario2,
      preSurveyData,
      comparisonData
    } = params;

    // Validate required params
    if (!scenario1 || !scenario2) {
      Logger.log('[Tool4GPT] Missing scenarios for comparison');
      return Tool4Fallbacks.getComparisonFallback(scenario1, scenario2, preSurveyData);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Tool4 GPT: Comparison report for ${clientId}`);

      const systemPrompt = this.buildComparisonSystemPrompt(preSurveyData, scenario1, scenario2);
      const userPrompt = this.buildComparisonUserPrompt(scenario1, scenario2, preSurveyData, comparisonData);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 450
      });

      const parsed = this.parseComparisonResponse(result);

      if (this.isValidComparisonInsight(parsed)) {
        Logger.log('[TIER 1] Tool4 GPT success: Comparison report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`[TIER 1] Tool4 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Tool4 GPT retry: Comparison report for ${clientId}`);

        const systemPrompt = this.buildComparisonSystemPrompt(preSurveyData, scenario1, scenario2);
        const userPrompt = this.buildComparisonUserPrompt(scenario1, scenario2, preSurveyData, comparisonData);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 450
        });

        const parsed = this.parseComparisonResponse(result);

        if (this.isValidComparisonInsight(parsed)) {
          Logger.log('[TIER 2] Tool4 GPT retry success: Comparison report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`[TIER 2] Tool4 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Score-aware Fallback
        // ============================================================
        Logger.log('[TIER 3] Using fallback: Comparison report');
        this.logFallbackUsage(clientId, 'comparison_report', retryError.message);

        return {
          ...Tool4Fallbacks.getComparisonFallback(scenario1, scenario2, preSurveyData),
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

  // ============================================================
  // PROMPT BUILDERS - MAIN REPORT
  // ============================================================

  /**
   * Build system prompt for Main Report
   */
  buildMainReportSystemPrompt(preSurveyData, allocation, tool1Data, tool2Data) {
    const satisfaction = preSurveyData.satisfaction || 5;
    const discipline = preSurveyData.discipline || 5;
    const impulse = preSurveyData.impulse || 5;
    const longTerm = preSurveyData.longTerm || 5;
    const lifestyle = preSurveyData.lifestyle || 5;
    const autonomy = preSurveyData.autonomy || 5;

    const monthlyIncome = Number(preSurveyData.monthlyIncome) || 0;
    const percentages = allocation.percentages || {};
    const strategy = allocation.strategyName || this.detectStrategy(percentages);

    // Calculate dollar amounts
    const multiplyDollars = Math.round(monthlyIncome * (percentages.Multiply || 0) / 100);
    const essentialsDollars = Math.round(monthlyIncome * (percentages.Essentials || 0) / 100);
    const freedomDollars = Math.round(monthlyIncome * (percentages.Freedom || 0) / 100);
    const enjoymentDollars = Math.round(monthlyIncome * (percentages.Enjoyment || 0) / 100);

    // Build optional Tool 1/2/3 context
    let toolContext = '';
    if (tool1Data && tool1Data.winner) {
      const traumaNames = {
        'FSV': 'False Self-View',
        'ExVal': 'External Validation',
        'Showing': 'Issues Showing Love',
        'Receiving': 'Issues Receiving Love',
        'Control': 'Control Leading to Isolation',
        'Fear': 'Fear Leading to Isolation'
      };
      toolContext += `\nCORE PATTERN (from Tool 1): ${traumaNames[tool1Data.winner] || tool1Data.winner}`;
    }
    if (tool2Data && tool2Data.archetype) {
      toolContext += `\nFINANCIAL ARCHETYPE (from Tool 2): ${tool2Data.archetype}`;
    }

    return `You are a financial coach writing a personalized analysis for a student's budget allocation report.

STUDENT BEHAVIORAL PROFILE:
- Financial Satisfaction: ${satisfaction}/10 ${satisfaction < 4 ? '(very low - ready for change)' : satisfaction < 6 ? '(moderate - some concerns)' : '(relatively content)'}
- Spending Discipline: ${discipline}/10 ${discipline < 4 ? '(struggles with discipline)' : discipline > 7 ? '(strong self-control)' : '(moderate discipline)'}
- Impulse Control: ${impulse}/10 ${impulse < 4 ? '(prone to impulse spending)' : impulse > 7 ? '(good impulse control)' : '(average impulse control)'}
- Long-term Thinking: ${longTerm}/10 ${longTerm < 4 ? '(focused on present)' : longTerm > 7 ? '(future-oriented)' : '(balanced time horizon)'}
- Lifestyle Priority: ${lifestyle}/10 ${lifestyle < 4 ? '(minimal lifestyle focus)' : lifestyle > 7 ? '(values quality of life)' : '(moderate lifestyle needs)'}
- Financial Autonomy: ${autonomy}/10 ${autonomy < 4 ? '(seeks guidance)' : autonomy > 7 ? '(prefers independence)' : '(open to guidance)'}
${toolContext}

SELECTED PRIORITY: ${preSurveyData.selectedPriority || 'General Financial Health'}
GOAL TIMELINE: ${preSurveyData.goalTimeline || 'Not specified'}

THEIR ALLOCATION:
- Strategy Type: ${strategy}
- Multiply (Wealth Building): ${percentages.Multiply || 0}% ($${multiplyDollars.toLocaleString()}/month)
- Essentials (Needs): ${percentages.Essentials || 0}% ($${essentialsDollars.toLocaleString()}/month)
- Freedom (Debt/Security): ${percentages.Freedom || 0}% ($${freedomDollars.toLocaleString()}/month)
- Enjoyment (Lifestyle): ${percentages.Enjoyment || 0}% ($${enjoymentDollars.toLocaleString()}/month)

INCOME: $${monthlyIncome.toLocaleString()}/month
ESSENTIALS SPENDING: $${(Number(preSurveyData.monthlyEssentials) || 0).toLocaleString()}/month
TOTAL DEBT: $${(Number(preSurveyData.totalDebt) || 0).toLocaleString()}
EMERGENCY FUND: $${(Number(preSurveyData.emergencyFund) || 0).toLocaleString()}

WRITING GUIDELINES:
- Write as if speaking directly to the student (use "you" and "your")
- Ground EVERY insight in THEIR specific numbers and scores - never generic advice
- Acknowledge tensions between their profile and allocation where they exist
- Be encouraging but honest about challenges they may face
- Do NOT use markdown formatting (no **, no *, no bullets with -)
- BE CONCISE - this must fit on one PDF page

Return PLAIN TEXT ONLY in this exact format:

Overview:
(ONE paragraph, 3-4 sentences max. Connect their profile to their allocation. Highlight the most important tension or strength.)

Strategic Insights:
1. [First specific observation - 1-2 sentences]
2. [Second specific observation - 1-2 sentences]
3. [Third observation - 1-2 sentences]

Recommendation:
(2-3 sentences: The single most important focus area for this person.)`;
  },

  /**
   * Build user prompt for Main Report
   */
  buildMainReportUserPrompt(preSurveyData, allocation, validationResults, helperInsights) {
    let prompt = 'Please analyze this student\'s allocation and provide personalized insights.\n\n';

    // Add validation results if present
    if (validationResults && validationResults.length > 0) {
      prompt += 'VALIDATION ALERTS:\n';
      validationResults.forEach(v => {
        prompt += `- ${v.severity}: ${v.message}\n`;
      });
      prompt += '\n';
    }

    // Add helper insights if present
    if (helperInsights && helperInsights.length > 0) {
      prompt += 'FINANCIAL PROJECTIONS:\n';
      helperInsights.forEach(h => {
        prompt += `- ${h.title}: ${h.message}\n`;
      });
      prompt += '\n';
    }

    // Add allocation notes if present
    if (allocation.lightNotes) {
      prompt += 'ALLOCATION RATIONALE:\n';
      Object.entries(allocation.lightNotes).forEach(([bucket, note]) => {
        if (note) prompt += `- ${bucket}: ${note}\n`;
      });
      prompt += '\n';
    }

    prompt += 'Based on all this information, provide personalized insights for their report.';

    return prompt;
  },

  // ============================================================
  // PROMPT BUILDERS - COMPARISON REPORT
  // ============================================================

  /**
   * Build system prompt for Comparison Report
   */
  buildComparisonSystemPrompt(preSurveyData, scenario1, scenario2) {
    const satisfaction = preSurveyData ? (preSurveyData.satisfaction || 5) : 5;
    const discipline = preSurveyData ? (preSurveyData.discipline || 5) : 5;

    return `You are a financial coach helping a student compare two budget allocation scenarios.

STUDENT CONTEXT:
- Financial Satisfaction: ${satisfaction}/10
- Spending Discipline: ${discipline}/10
- Current Priority: ${preSurveyData?.selectedPriority || 'General Financial Health'}

SCENARIO A: "${scenario1.name || 'Scenario A'}"
- Priority: ${scenario1.priority || 'Not specified'}
- Multiply: ${scenario1.allocations?.Multiply || 0}%
- Essentials: ${scenario1.allocations?.Essentials || 0}%
- Freedom: ${scenario1.allocations?.Freedom || 0}%
- Enjoyment: ${scenario1.allocations?.Enjoyment || 0}%

SCENARIO B: "${scenario2.name || 'Scenario B'}"
- Priority: ${scenario2.priority || 'Not specified'}
- Multiply: ${scenario2.allocations?.Multiply || 0}%
- Essentials: ${scenario2.allocations?.Essentials || 0}%
- Freedom: ${scenario2.allocations?.Freedom || 0}%
- Enjoyment: ${scenario2.allocations?.Enjoyment || 0}%

WRITING GUIDELINES:
- Write as if speaking directly to the student (use "you" and "your")
- Explain what the differences MEAN for this specific person
- Connect to their behavioral profile (satisfaction, discipline)
- Be balanced - acknowledge trade-offs of each approach
- Do NOT use markdown formatting
- BE CONCISE - keep it brief and focused

Return PLAIN TEXT ONLY in this exact format:

Synthesis:
(ONE paragraph, 4-5 sentences max. What do these differences mean for this student? Focus on the most significant trade-off.)

Decision Guidance:
(2-3 sentences. Which scenario might work better and why, acknowledging the key trade-off.)`;
  },

  /**
   * Build user prompt for Comparison Report
   */
  buildComparisonUserPrompt(scenario1, scenario2, preSurveyData, comparisonData) {
    let prompt = 'Please compare these two scenarios for this student.\n\n';

    // Calculate key differences
    const alloc1 = scenario1.allocations || {};
    const alloc2 = scenario2.allocations || {};
    const diffs = {
      Multiply: (alloc2.Multiply || 0) - (alloc1.Multiply || 0),
      Freedom: (alloc2.Freedom || 0) - (alloc1.Freedom || 0),
      Enjoyment: (alloc2.Enjoyment || 0) - (alloc1.Enjoyment || 0),
      Essentials: (alloc2.Essentials || 0) - (alloc1.Essentials || 0)
    };

    prompt += 'KEY DIFFERENCES (Scenario B vs A):\n';
    Object.entries(diffs).forEach(([bucket, diff]) => {
      if (Math.abs(diff) >= 3) {
        prompt += `- ${bucket}: ${diff > 0 ? '+' : ''}${diff}%\n`;
      }
    });
    prompt += '\n';

    // Add strategy info if available
    if (comparisonData) {
      if (comparisonData.strategy1 && comparisonData.strategy1.name) {
        prompt += `Scenario A Strategy: ${comparisonData.strategy1.name}\n`;
      }
      if (comparisonData.strategy2 && comparisonData.strategy2.name) {
        prompt += `Scenario B Strategy: ${comparisonData.strategy2.name}\n`;
      }
    }

    prompt += '\nProvide synthesis and decision guidance for this comparison.';

    return prompt;
  },

  // ============================================================
  // RESPONSE PARSERS
  // ============================================================

  /**
   * Parse Main Report GPT response
   */
  parseMainReportResponse(text) {
    return {
      overview: this.extractSection(text, 'Overview:'),
      strategicInsights: this.extractNumberedList(text, 'Strategic Insights:'),
      recommendation: this.extractSection(text, 'Recommendation:')
    };
  },

  /**
   * Parse Comparison Report GPT response
   */
  parseComparisonResponse(text) {
    return {
      synthesis: this.extractSection(text, 'Synthesis:'),
      decisionGuidance: this.extractSection(text, 'Decision Guidance:')
    };
  },

  /**
   * Extract section from plain-text response
   */
  extractSection(text, sectionName) {
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      '\\*{0,2}' + escapedName + '\\*{0,2}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\n\\*{0,2}[A-Z][a-z\\s]+\\*{0,2}\\s*:?\\s*|$)',
      'i'
    );
    const match = text.match(regex);
    let extracted = match ? match[1].trim() : '';

    // Strip markdown formatting
    extracted = extracted.replace(/\*\*/g, '');
    extracted = extracted.replace(/\*/g, '');
    extracted = extracted.replace(/_/g, '');

    return extracted.trim();
  },

  /**
   * Extract numbered list from response
   */
  extractNumberedList(text, sectionName) {
    const sectionText = this.extractSection(text, sectionName);
    const lines = sectionText.split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    return lines.length > 0 ? lines : ['Analysis not available'];
  },

  // ============================================================
  // VALIDATORS
  // ============================================================

  /**
   * Validate Main Report insight completeness
   */
  isValidMainInsight(insight) {
    return (
      insight &&
      insight.overview && insight.overview.length > 50 &&
      insight.strategicInsights && insight.strategicInsights.length >= 1 &&
      insight.recommendation && insight.recommendation.length > 30
    );
  },

  /**
   * Validate Comparison insight completeness
   */
  isValidComparisonInsight(insight) {
    return (
      insight &&
      insight.synthesis && insight.synthesis.length > 50 &&
      insight.decisionGuidance && insight.decisionGuidance.length > 30
    );
  },

  // ============================================================
  // GPT API
  // ============================================================

  /**
   * Call OpenAI GPT API
   */
  callGPT({systemPrompt, userPrompt, model, temperature, maxTokens}) {
    const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in Script Properties');
    }

    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify({
        model,
        messages: [
          {role: 'system', content: systemPrompt},
          {role: 'user', content: userPrompt}
        ],
        temperature,
        max_tokens: maxTokens
      }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());

    if (json.error) {
      throw new Error(`OpenAI API Error: ${json.error.message}`);
    }

    return json.choices[0].message.content;
  },

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Detect strategy from allocation percentages
   */
  detectStrategy(percentages) {
    const { Multiply = 0, Freedom = 0, Enjoyment = 0 } = percentages;

    if (Freedom >= 35) return 'Security First';
    if (Multiply >= 30) return 'Wealth Builder';
    if (Enjoyment >= 30) return 'Lifestyle Balance';
    if (Freedom >= 25 && Multiply >= 20) return 'Balanced Growth';
    return 'Balanced';
  },

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage(clientId, reportType, errorMessage) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName('GPT_FALLBACK_LOG');

      if (!sheet) {
        sheet = ss.insertSheet('GPT_FALLBACK_LOG');
        sheet.appendRow(['Timestamp', 'ClientID', 'Tool', 'ReportType', 'Error']);
      }

      sheet.appendRow([
        new Date().toISOString(),
        clientId || 'unknown',
        'tool4',
        reportType,
        errorMessage
      ]);
    } catch (e) {
      Logger.log(`[Tool4GPT] Could not log fallback: ${e.message}`);
    }
  }
};
