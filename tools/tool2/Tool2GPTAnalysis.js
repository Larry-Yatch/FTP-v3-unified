/**
 * Tool2GPTAnalysis.js
 * GPT-powered analysis for Tool 2 Financial Mirror
 * Phase 4: Consolidated single-call system with gap analysis context
 *
 * Architecture:
 * - One consolidated background call fires on page 4 save
 * - Result cached in DraftService under 'tool2_gpt' key
 * - At submission: retrieve cached result or run consolidated analysis
 * - 3-tier fallback: cached -> sync retry -> deterministic fallback
 * - Cost: ~$0.005 per student (single gpt-4o-mini call)
 * - Reliability: 100% via fallback system
 */

const Tool2GPTAnalysis = {

  // Human-readable labels for GPT prompts (never pass raw keys to GPT)
  DOMAIN_LABELS: {
    moneyFlow: 'Money Flow (income and spending)',
    obligations: 'Obligations (debt and emergency fund)',
    liquidity: 'Liquidity (accessible savings)',
    growth: 'Growth (retirement and investments)',
    protection: 'Protection (insurance coverage)'
  },

  GAP_LABELS: {
    UNDERESTIMATING: 'significantly underestimating financial health',
    SLIGHTLY_UNDER: 'slightly underestimating financial health',
    ALIGNED: 'perception aligned with reality',
    SLIGHTLY_OVER: 'slightly overestimating financial health',
    OVERESTIMATING: 'significantly overestimating financial health'
  },

  /**
   * Start background analysis — called from savePageData on page 4
   * Computes scores and runs consolidated GPT call, caches result in DraftService
   */
  startBackgroundAnalysis(clientId) {
    try {
      LogUtils.debug('[GPT] Starting background analysis for ' + clientId);

      var allData = DraftService.getDraft('tool2', clientId);
      if (!allData) {
        LogUtils.debug('[GPT] No draft data found, skipping');
        return;
      }

      var mode = allData.assessmentMode || 'full';
      var domains = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
      var objectiveScores = {};
      var subjectiveScores = {};
      var gapClassifications = {};
      domains.forEach(function(d) {
        objectiveScores[d] = Tool2.computeObjectiveHealthScore(d, allData);
        subjectiveScores[d] = Tool2.computeSubjectiveScore(d, allData, mode);
        var gap = Tool2.computeGapIndex(objectiveScores[d], subjectiveScores[d]);
        gapClassifications[d] = Tool2.classifyGap(gap);
      });

      var traumaData = Tool2.getTool1TraumaData(clientId);
      var scarcityFlag = Tool2.computeScarcityFlag(allData);
      var profile = Tool2.detectTool1ProfileType(traumaData.traumaScores);

      var results = {
        objectiveHealthScores: objectiveScores,
        subjectiveScores: subjectiveScores,
        gapClassifications: gapClassifications,
        scarcityFlag: scarcityFlag,
        tool1Profile: profile
      };

      var insight = this.runConsolidatedAnalysis(clientId, allData, results, traumaData);

      DraftService.saveDraft('tool2_gpt', clientId, 0, { insight: insight });
      LogUtils.debug('[GPT] Background analysis cached for ' + clientId);

    } catch(e) {
      LogUtils.error('[GPT] Background analysis failed: ' + e.message);
    }
  },

  /**
   * Run consolidated GPT analysis — single call with full context
   */
  runConsolidatedAnalysis(clientId, allData, results, traumaData) {
    var profile = results.tool1Profile || {};
    var objScores = results.objectiveHealthScores || {};
    var subScores = results.subjectiveScores || {};
    var gapClass = results.gapClassifications || {};
    var winnerName = this.getPatternName(profile.winner);

    // Build human-readable domain summary
    var domainSummary = '';
    var self = this;
    ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'].forEach(function(d) {
      var label = self.DOMAIN_LABELS[d] || d;
      var gapLabel = self.GAP_LABELS[gapClass[d]] || 'unknown';
      domainSummary += '- ' + label + ': Reality ' + (objScores[d] || 0) + '/100, Perception ' + (subScores[d] || 0) + '/100 -- ' + gapLabel + '\n';
    });

    // Gather free-text responses
    var freeText = '';
    if (allData.incomeNarrative) freeText += 'Income Sources: ' + allData.incomeNarrative + '\n\n';
    if (allData.spendingNarrative) freeText += 'Spending Areas: ' + allData.spendingNarrative + '\n\n';
    // Backward compat: old combined field
    if (!allData.incomeNarrative && allData.incomeAndSpendingNarrative) freeText += 'Income and Spending: ' + allData.incomeAndSpendingNarrative + '\n\n';
    if (allData.debtNarrative) freeText += 'Debt Situation: ' + allData.debtNarrative + '\n\n';
    if (allData.savingsGrowthNarrative) freeText += 'Savings and Growth: ' + allData.savingsGrowthNarrative + '\n\n';
    if (allData.financialEmotionsNarrative) freeText += 'Overall Financial Feelings: ' + allData.financialEmotionsNarrative + '\n\n';
    if (allData.adaptiveImpact) freeText += 'Pattern Impact: ' + allData.adaptiveImpact + '\n\n';

    var systemPrompt = 'You are a trauma-informed financial coach generating personalized insights for a student who has completed a financial clarity and reality assessment. You have their psychological pattern scores and their actual financial data.\n\n' +
      'Your role: connect their psychological pattern to their financial reality. Avoid generic financial advice. Every insight must reference the gap between their perception and their reality, and explain what their specific psychological pattern suggests about WHY that gap exists.\n\n' +
      'Write in second person. Warm but direct. Do not soften important findings. Do not moralize. Treat financial struggles as predictable outcomes of psychological patterns, not character flaws.';

    var userPrompt = 'Student Profile:\n' +
      '- Primary psychological pattern: ' + winnerName + ' (' + (profile.type || 'unknown') + ')\n' +
      '- Scarcity flag: ' + (results.scarcityFlag || 'unknown') + '\n\n' +
      'Domain Results:\n' + domainSummary + '\n' +
      (freeText ? 'Student Responses:\n' + freeText + '\n' : '') +
      'Generate your analysis with these exact section headers:\n\n' +
      'GAP NARRATIVE\n(1-2 paragraphs: Most significant gap + pattern connection. Reference their specific words where possible.)\n\n' +
      'PATTERN CONNECTIONS\n- (3 bullet points: Specific ways their ' + winnerName + ' pattern shows up in the financial data)\n\n' +
      'PRIORITY ACTIONS\n- (3-5 bullets: Targeted to highest-priority domain + their pattern)\n\n' +
      'STOP after PRIORITY ACTIONS. Do not add conclusions.';

    // Tier 1: Try GPT
    try {
      LogUtils.debug('[GPT] Tier 1: Attempting consolidated call for ' + clientId);
      var result = this.callGPT({
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 600
      });

      var parsed = this.parseConsolidatedResponse(result);
      if (parsed.overview && parsed.overview.length > 50) {
        LogUtils.debug('[GPT] Tier 1 success for ' + clientId);
        parsed.source = 'gpt';
        parsed.timestamp = new Date().toISOString();
        return parsed;
      }
      throw new Error('Incomplete consolidated GPT response (overview: ' + (parsed.overview ? parsed.overview.length : 0) + ' chars)');
    } catch(err) {
      LogUtils.debug('[GPT] Tier 1 failed: ' + err.message);

      // Check if background analysis already cached a result
      var cached = DraftService.getDraft('tool2_gpt', clientId);
      if (cached && cached.insight && cached.insight.overview && cached.insight.overview.length > 50) {
        LogUtils.debug('[GPT] Using cached background analysis for ' + clientId);
        return cached.insight;
      }

      // Tier 2: Retry
      try {
        Utilities.sleep(1500);
        LogUtils.debug('[GPT] Tier 2: Retrying for ' + clientId);
        var result2 = this.callGPT({
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 600
        });
        var parsed2 = this.parseConsolidatedResponse(result2);
        if (parsed2.overview && parsed2.overview.length > 50) {
          LogUtils.debug('[GPT] Tier 2 success for ' + clientId);
          parsed2.source = 'gpt_retry';
          parsed2.timestamp = new Date().toISOString();
          return parsed2;
        }
        throw new Error('Incomplete on retry');
      } catch(retryErr) {
        LogUtils.debug('[GPT] Tier 2 failed: ' + retryErr.message);
        this.logFallbackUsage(clientId, 'consolidated', retryErr.message);
        return null;
      }
    }
  },

  /**
   * Parse consolidated GPT response with section headers
   * Flexible matching — handles variations in formatting (colons, extra newlines, etc.)
   */
  parseConsolidatedResponse(text) {
    if (!text) return {};

    LogUtils.debug('[GPT] Raw response length: ' + text.length);
    LogUtils.debug('[GPT] Raw response preview: ' + text.substring(0, 200));

    // Flexible regex — allow optional colon, whitespace variations
    var gapMatch = text.match(/GAP NARRATIVE[:\s]*\n([\s\S]*?)(?=\n\s*PATTERN CONNECTIONS|$)/i);
    var patternMatch = text.match(/PATTERN CONNECTIONS[:\s]*\n([\s\S]*?)(?=\n\s*PRIORITY ACTIONS|$)/i);
    var actionMatch = text.match(/PRIORITY ACTIONS[:\s]*\n([\s\S]*?)$/i);

    var result = {
      overview: gapMatch ? gapMatch[1].trim() : '',
      topPatterns: patternMatch ? patternMatch[1].trim() : '',
      priorityActions: actionMatch ? actionMatch[1].trim() : ''
    };

    LogUtils.debug('[GPT] Parsed overview length: ' + result.overview.length);
    LogUtils.debug('[GPT] Parsed patterns length: ' + result.topPatterns.length);
    LogUtils.debug('[GPT] Parsed actions length: ' + result.priorityActions.length);

    return result;
  },

  getPatternName(key) {
    var names = {
      FSV: 'False Self-View', ExVal: 'External Validation',
      Showing: 'Issues Showing Love', Receiving: 'Issues Receiving Love',
      Control: 'Control Leading to Isolation', Fear: 'Fear Leading to Isolation'
    };
    return names[key] || key || 'Unknown';
  },

  // ============================================================
  // GPT API CALL
  // ============================================================

  /**
   * Call OpenAI GPT API
   */
  callGPT(params) {
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
        model: params.model,
        messages: [
          {role: 'system', content: params.systemPrompt},
          {role: 'user', content: params.userPrompt}
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens
      }),
      muteHttpExceptions: true,
      timeout: 15000
    });

    var responseCode = response.getResponseCode();
    var json = JSON.parse(response.getContentText());

    if (responseCode !== 200) {
      throw new Error('OpenAI API HTTP ' + responseCode + ': ' + (json.error ? json.error.message : 'Unknown error'));
    }

    if (json.error) {
      throw new Error('OpenAI API Error: ' + json.error.message);
    }

    if (!json.choices || !json.choices[0] || !json.choices[0].message) {
      throw new Error('Invalid OpenAI API response structure');
    }

    var content = json.choices[0].message.content;
    if (!content || content.trim().length === 0) {
      throw new Error('OpenAI API returned empty content');
    }

    return content;
  },

  // ============================================================
  // TRAUMA CONTEXT HELPERS
  // ============================================================

  getTraumaContext(traumaData) {
    if (!traumaData || !traumaData.topTrauma) return '';

    var contexts = {
      FSV: 'This person uses False Self-View as protection, often hiding their true financial situation.',
      Control: 'This person seeks control to manage anxiety. They may over-detail finances or show rigidity.',
      ExVal: 'This person seeks external validation for financial decisions.',
      Fear: 'This person experiences financial paralysis from fear.',
      Receiving: 'This person struggles to receive help or financial support.',
      Showing: 'This person over-gives financially at their own expense.'
    };

    return contexts[traumaData.topTrauma] || '';
  },

  getTraumaHealingFocus(traumaType) {
    var healing = {
      FSV: 'transparency and authentic self-expression',
      Control: 'flexibility and trust in uncertainty',
      ExVal: 'internal values clarification and self-trust',
      Fear: 'small, safe steps to build confidence',
      Receiving: 'gradual openness to support and help',
      Showing: 'balance between giving and self-care'
    };

    return healing[traumaType] || 'self-awareness and growth';
  },

  // ============================================================
  // FALLBACK SYNTHESIS
  // ============================================================

  /**
   * Generic synthesis fallback — used when GPT fails
   */
  getGenericSynthesis(scores, traumaData) {
    var lowest = this.findLowestDomain(scores);
    var highest = this.findHighestDomain(scores);
    var lowestKey = this.domainKeyFromName(lowest);
    var highestKey = this.domainKeyFromName(highest);

    return {
      overview: 'Your Financial Mirror reveals varying levels of financial health across five key domains. Your strongest area is ' + highest + ' (' + (scores[highestKey] || 0) + '/100) while ' + lowest + ' (' + (scores[lowestKey] || 0) + '/100) presents the greatest opportunity for growth. The gap between your financial reality and your perception of it is where your psychological patterns most shape your financial decisions.',
      topPatterns: '- Opportunities exist to strengthen awareness in multiple domains\n- Building systematic tracking habits would benefit overall clarity\n- Connecting financial behaviors to underlying goals and values could increase motivation',
      priorityActions: '1. Focus on strengthening ' + lowest + ' first - this domain will have the most immediate impact\n2. Set up a monthly 15-minute financial review ritual to build awareness consistently\n3. Track one key metric in your weakest domain for the next 30 days\n4. Identify one emotional trigger around money and create a grounding practice\n5. Connect with a trusted person about your financial goals for accountability and support'
    };
  },

  findLowestDomain(scores) {
    var domainNames = { moneyFlow: 'Money Flow', obligations: 'Obligations', liquidity: 'Liquidity', growth: 'Growth', protection: 'Protection' };
    var lowest = 'Money Flow';
    var lowestScore = 101;
    Object.keys(scores).forEach(function(key) {
      if (domainNames[key] && scores[key] < lowestScore) {
        lowestScore = scores[key];
        lowest = domainNames[key];
      }
    });
    return lowest;
  },

  findHighestDomain(scores) {
    var domainNames = { moneyFlow: 'Money Flow', obligations: 'Obligations', liquidity: 'Liquidity', growth: 'Growth', protection: 'Protection' };
    var highest = 'Protection';
    var highestScore = -1;
    Object.keys(scores).forEach(function(key) {
      if (domainNames[key] && scores[key] > highestScore) {
        highestScore = scores[key];
        highest = domainNames[key];
      }
    });
    return highest;
  },

  domainKeyFromName(name) {
    var mapping = { 'Money Flow': 'moneyFlow', 'Obligations': 'obligations', 'Liquidity': 'liquidity', 'Growth': 'growth', 'Protection': 'protection' };
    return mapping[name] || 'moneyFlow';
  },

  // ============================================================
  // MONITORING & LOGGING
  // ============================================================

  logFallbackUsage(clientId, responseType, error) {
    try {
      var ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      var logSheet = ss.getSheetByName('GPT_FALLBACK_LOG');

      if (!logSheet) {
        logSheet = ss.insertSheet('GPT_FALLBACK_LOG');
        logSheet.appendRow(['Timestamp', 'Client_ID', 'Response_Type', 'Error_Message', 'User_Email']);
      }

      logSheet.appendRow([
        new Date(),
        clientId,
        responseType,
        error,
        Session.getActiveUser().getEmail()
      ]);

    } catch (logError) {
      LogUtils.error('Failed to log fallback usage: ' + logError.message);
    }
  }
};
