/**
 * ProgressNarrative.js - AI-generated progress narratives for Progress Over Time
 *
 * Two GPT call types:
 * 1. Cross-tool synthesis - overview paragraph connecting changes across all retaken tools
 * 2. Per-tool deep dive - detailed analysis with open-text comparison (on demand per section)
 *
 * Uses 3-tier fallback: GPT -> retry after 2s -> score-aware template.
 * Caches via PropertiesService.getUserProperties() to avoid duplicate calls.
 */

const ProgressNarrative = {

  // ─── Tool Metadata ──────────────────────────────────────────────

  TOOL_NAMES: {
    tool1: 'Core Trauma Strategy Assessment',
    tool2: 'Financial Clarity & Values',
    tool3: 'Identity & Validation',
    tool5: 'Love & Connection',
    tool7: 'Security & Control'
  },

  TOOL_SHORT_NAMES: {
    tool1: 'Trauma Strategy',
    tool2: 'Financial Clarity',
    tool3: 'Identity & Validation',
    tool5: 'Love & Connection',
    tool7: 'Security & Control'
  },

  // Tools where lower scores = healthier (grounding tools)
  INVERTED_TOOLS: ['tool3', 'tool5', 'tool7'],

  // Open-text field keys per tool
  OPEN_TEXT_FIELDS: {
    tool2: [
      { key: 'incomeNarrative', label: 'Income Sources' },
      { key: 'spendingNarrative', label: 'Spending Areas' },
      { key: 'debtNarrative', label: 'Debt Situation' },
      { key: 'savingsGrowthNarrative', label: 'Savings and Growth' },
      { key: 'financialEmotionsNarrative', label: 'Overall Financial Feelings' },
      { key: 'adaptiveImpact', label: 'Pattern Impact' }
    ],
    tool3: [
      { key: 'subdomain_1_1_open_response', label: 'Self-Worth and Money' },
      { key: 'subdomain_1_2_open_response', label: 'Scarcity Patterns' },
      { key: 'subdomain_1_3_open_response', label: 'Overwhelm Response' },
      { key: 'subdomain_2_1_open_response', label: 'External Validation' },
      { key: 'subdomain_2_2_open_response', label: 'Approval Seeking' },
      { key: 'subdomain_2_3_open_response', label: 'Status and Proof' }
    ],
    tool5: [
      { key: 'subdomain_1_1_open_response', label: 'Love Sacrifice' },
      { key: 'subdomain_1_2_open_response', label: 'Others Needs Priority' },
      { key: 'subdomain_1_3_open_response', label: 'Must Be Giver' },
      { key: 'subdomain_2_1_open_response', label: 'Independence Fears' },
      { key: 'subdomain_2_2_open_response', label: 'Help Creates Debt' },
      { key: 'subdomain_2_3_open_response', label: 'Chronic Debt' }
    ],
    tool7: [
      { key: 'subdomain_1_1_open_response', label: 'Control and Hoarding' },
      { key: 'subdomain_1_2_open_response', label: 'Micromanagement' },
      { key: 'subdomain_1_3_open_response', label: 'Delegation Refusal' },
      { key: 'subdomain_2_1_open_response', label: 'Nothing Is Safe' },
      { key: 'subdomain_2_2_open_response', label: 'Worst-Case Default' },
      { key: 'subdomain_2_3_open_response', label: 'Financial Paralysis' }
    ]
  },

  STRATEGY_LABELS: {
    FSV: 'False Self-View',
    ExVal: 'External Validation',
    Showing: 'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control: 'Control Leading to Isolation',
    Fear: 'Fear Leading to Isolation'
  },

  // ─── Public API ─────────────────────────────────────────────────

  /**
   * Generate cross-tool synthesis narrative.
   * @param {string} clientId
   * @returns {Object} { narrative: string, source: 'gpt'|'gpt_retry'|'fallback' }
   */
  generateCrossToolSynthesis(clientId) {
    // Check cache
    var cached = this._getCached(clientId, 'crossTool');
    if (cached) {
      LogUtils.debug('[ProgressNarrative] Cross-tool cache hit for ' + clientId);
      return cached;
    }

    // Gather data
    var history = ProgressHistory.getAllHistory(clientId);
    var scoreComparisons = {};
    var toolsWithProgress = [];

    for (var t = 0; t < ProgressHistory.TRACKED_TOOLS.length; t++) {
      var toolId = ProgressHistory.TRACKED_TOOLS[t];
      var entries = history[toolId];
      if (entries && entries.length >= 2) {
        scoreComparisons[toolId] = this._compareScores(toolId, entries);
        toolsWithProgress.push(toolId);
      }
    }

    if (toolsWithProgress.length === 0) {
      return { narrative: '', source: 'none' };
    }

    // Build prompts
    var systemPrompt = this._buildCrossToolSystemPrompt(scoreComparisons);
    var userPrompt = this._buildCrossToolUserPrompt(history, scoreComparisons);

    // 3-tier GPT call
    var result = this._callWithFallback(
      systemPrompt,
      userPrompt,
      500,
      function() { return ProgressNarrative._generateCrossToolFallback(history, scoreComparisons); }
    );

    // Cache and return
    this._setCache(clientId, 'crossTool', result);
    return result;
  },

  /**
   * Generate per-tool deep dive narrative.
   * @param {string} clientId
   * @param {string} toolId
   * @returns {Object} { sections: { whatChanged, whyItMatters, focusNext }, source: string }
   */
  generateToolDeepDive(clientId, toolId) {
    // Check cache
    var cached = this._getCached(clientId, toolId + '_deepDive');
    if (cached) {
      LogUtils.debug('[ProgressNarrative] Deep dive cache hit for ' + clientId + '/' + toolId);
      return cached;
    }

    var entries = ProgressHistory.getHistory(clientId, toolId);
    if (!entries || entries.length < 2) {
      return { sections: null, source: 'none' };
    }

    var scoreComparison = this._compareScores(toolId, entries);
    var openTexts = this._getOpenTextResponses(clientId, toolId);
    var hasOpenText = openTexts.length > 0 && this.OPEN_TEXT_FIELDS[toolId];

    // Build prompts
    var systemPrompt = this._buildToolDeepDiveSystemPrompt(toolId, hasOpenText);
    var userPrompt = this._buildToolDeepDiveUserPrompt(toolId, entries, scoreComparison, openTexts);

    // 3-tier GPT call
    var self = this;
    var result = this._callWithFallback(
      systemPrompt,
      userPrompt,
      600,
      function() { return self._generateToolDeepDiveFallback(toolId, entries, scoreComparison); }
    );

    // Parse sections from GPT response
    if (result.source !== 'fallback') {
      var sections = this._parseToolDeepDiveResponse(result.narrative);
      result.sections = sections;
    }

    // Cache and return
    this._setCache(clientId, toolId + '_deepDive', result);
    return result;
  },

  // ─── Score Comparison ───────────────────────────────────────────

  /**
   * Compare latest vs previous scores for a tool.
   * @param {string} toolId
   * @param {Array} entries - Sorted by version ascending
   * @returns {Object} { deltas, direction, biggestChange, latest, previous }
   */
  _compareScores(toolId, entries) {
    var latest = entries[entries.length - 1].scores;
    var previous = entries[entries.length - 2].scores;
    var inverted = this.INVERTED_TOOLS.indexOf(toolId) !== -1;
    var deltas = {};
    var improvements = 0;
    var declines = 0;
    var biggestChange = { metric: '', delta: 0, direction: '' };

    if (toolId === 'tool1') {
      // Compare strategy scores
      var stratKeys = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
      for (var i = 0; i < stratKeys.length; i++) {
        var key = stratKeys[i];
        var latVal = (latest.scores && latest.scores[key]) || 0;
        var prevVal = (previous.scores && previous.scores[key]) || 0;
        var d = Math.round((latVal - prevVal) * 10) / 10;
        deltas[key] = d;

        // For Tool 1, lower dominant score is generally better (less reactive)
        if (d < -0.5) improvements++;
        else if (d > 0.5) declines++;

        if (Math.abs(d) > Math.abs(biggestChange.delta)) {
          biggestChange = { metric: key, delta: d, direction: d < 0 ? 'decreased' : 'increased' };
        }
      }
      // Track strategy shift
      deltas._strategyShift = (latest.winner !== previous.winner);
      deltas._previousWinner = previous.winner;
      deltas._latestWinner = latest.winner;

    } else if (toolId === 'tool2') {
      // Compare domain scores (higher = better)
      var domainKeys = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
      for (var j = 0; j < domainKeys.length; j++) {
        var dk = domainKeys[j];
        var latD = (latest.domainScores && latest.domainScores[dk]) || 0;
        var prevD = (previous.domainScores && previous.domainScores[dk]) || 0;
        var dd = Math.round(latD - prevD);
        deltas[dk] = dd;

        if (dd > 2) improvements++;
        else if (dd < -2) declines++;

        if (Math.abs(dd) > Math.abs(biggestChange.delta)) {
          biggestChange = { metric: dk, delta: dd, direction: dd > 0 ? 'improved' : 'declined' };
        }
      }
      deltas._archetypeShift = (latest.archetype !== previous.archetype);
      deltas._previousArchetype = previous.archetype;
      deltas._latestArchetype = latest.archetype;

    } else {
      // Grounding tools (lower = better)
      // Overall quotient
      var latOQ = latest.overallQuotient || 0;
      var prevOQ = previous.overallQuotient || 0;
      var oqDelta = Math.round(latOQ - prevOQ);
      deltas.overallQuotient = oqDelta;

      // For inverted: decrease = improvement
      if (oqDelta < -2) improvements++;
      else if (oqDelta > 2) declines++;

      if (Math.abs(oqDelta) > Math.abs(biggestChange.delta)) {
        biggestChange = { metric: 'overallQuotient', delta: oqDelta, direction: oqDelta < 0 ? 'improved' : 'increased concern' };
      }

      // Domain quotients
      var domNames = ['domain1', 'domain2'];
      for (var di = 0; di < domNames.length; di++) {
        var dn = domNames[di];
        var latDom = (latest.domainQuotients && latest.domainQuotients[dn]) || 0;
        var prevDom = (previous.domainQuotients && previous.domainQuotients[dn]) || 0;
        var domDelta = Math.round(latDom - prevDom);
        deltas[dn] = domDelta;

        if (domDelta < -2) improvements++;
        else if (domDelta > 2) declines++;

        if (Math.abs(domDelta) > Math.abs(biggestChange.delta)) {
          biggestChange = { metric: dn, delta: domDelta, direction: domDelta < 0 ? 'improved' : 'increased concern' };
        }
      }
    }

    // Determine overall direction
    var direction = 'stable';
    if (improvements > 0 && declines === 0) direction = 'improving';
    else if (declines > 0 && improvements === 0) direction = 'declining';
    else if (improvements > 0 && declines > 0) direction = 'mixed';

    return {
      deltas: deltas,
      direction: direction,
      biggestChange: biggestChange,
      latest: latest,
      previous: previous,
      inverted: inverted
    };
  },

  // ─── Open-Text Retrieval ────────────────────────────────────────

  /**
   * Get open-text responses for the latest 2 versions of a tool.
   * @param {string} clientId
   * @param {string} toolId
   * @returns {Array} [{ version: 'previous', texts: {...} }, { version: 'latest', texts: {...} }]
   */
  _getOpenTextResponses(clientId, toolId) {
    var fields = this.OPEN_TEXT_FIELDS[toolId];
    if (!fields) return [];

    try {
      // Get recent responses and filter to COMPLETED only
      var allResponses = ResponseManager.getAllResponses(clientId, toolId, 10);
      var responses = [];
      for (var ri = 0; ri < allResponses.length; ri++) {
        if (allResponses[ri].status === 'COMPLETED') {
          responses.push(allResponses[ri]);
          if (responses.length >= 2) break;
        }
      }
      if (responses.length < 2) return [];

      var result = [];
      // responses are newest-first, so [0] = latest, [1] = previous
      var labels = ['latest', 'previous'];
      for (var r = 0; r < 2; r++) {
        var data = responses[r].data;
        if (!data) continue;

        // Navigate to the correct nested path for open-text fields:
        // Tool 2 stores form data under data.data
        // Tools 3/5/7 store responses under data.responses
        var textSource = data;
        if (toolId === 'tool2' && data.data) {
          textSource = data.data;
        } else if (data.responses) {
          textSource = data.responses;
        }

        var texts = {};
        var hasAny = false;
        for (var f = 0; f < fields.length; f++) {
          var val = textSource[fields[f].key] || '';
          if (val && val.length > 0) {
            // Truncate to 300 chars
            texts[fields[f].label] = val.length > 300 ? val.substring(0, 297) + '...' : val;
            hasAny = true;
          }
        }

        if (hasAny) {
          result.push({
            version: labels[r],
            timestamp: responses[r].timestamp,
            texts: texts
          });
        }
      }

      return result;

    } catch (error) {
      LogUtils.error('[ProgressNarrative] Error getting open-text responses: ' + error);
      return [];
    }
  },

  // ─── Prompt Builders ────────────────────────────────────────────

  _buildCrossToolSystemPrompt(scoreComparisons) {
    // Determine dominant direction
    var improving = 0;
    var declining = 0;
    for (var toolId in scoreComparisons) {
      if (scoreComparisons[toolId].direction === 'improving') improving++;
      else if (scoreComparisons[toolId].direction === 'declining') declining++;
    }

    var toneInstruction = '';
    if (improving > declining) {
      toneInstruction = 'The overall trajectory is positive. Use affirming language. Acknowledge the work the student is doing. Celebrate specific improvements while noting any areas still needing attention.';
    } else if (declining > improving) {
      toneInstruction = 'The overall trajectory shows some regression. Use compassionate but direct language. Name the patterns without shame. Position this as information, not failure. End with a concrete next step.';
    } else {
      toneInstruction = 'The trajectory is mixed. Use balanced language. Highlight the bright spots and name the concerns. Help the student see the full picture without minimizing either direction.';
    }

    return 'You are a financial psychology coach reviewing a student who has completed assessments multiple times. ' +
      'You are writing a brief progress summary connecting changes across their different tools.\n\n' +
      'TONE: Direct but compassionate. Do not soften the truth. Use "you" throughout. ' +
      'No hedging language ("might", "perhaps", "could be"). Say what IS happening. ' +
      'Do not use contractions (write "do not" instead of the short form, "you are" instead of the short form). ' +
      'Do not use clinical or diagnostic language. This is coaching, not therapy.\n\n' +
      toneInstruction + '\n\n' +
      'SCORE CONTEXT:\n' +
      '- Tool 1 (Trauma Strategy): Tracks which of 6 financial defense strategies dominates. Lower scores = less reactive.\n' +
      '- Tool 2 (Financial Clarity): 5 domain scores where higher = healthier financial clarity.\n' +
      '- Tools 3, 5, 7 (Grounding): Quotient scores 0-100 where LOWER = healthier. A decrease is improvement.\n\n' +
      'OUTPUT: Write exactly 3-5 sentences as a single paragraph. Connect changes across tools where you see patterns. ' +
      'Reference specific tools by name where changes are notable. End with one forward-looking sentence about what to focus on next.';
  },

  _buildCrossToolUserPrompt(history, scoreComparisons) {
    var prompt = 'Here is the student progress data across their assessments.\n\n';
    prompt += '=== TOOL STATUS ===\n';

    for (var t = 0; t < ProgressHistory.TRACKED_TOOLS.length; t++) {
      var toolId = ProgressHistory.TRACKED_TOOLS[t];
      var entries = history[toolId] || [];
      var name = this.TOOL_NAMES[toolId];

      if (entries.length === 0) {
        prompt += name + ': Not started\n';
      } else if (entries.length === 1) {
        prompt += name + ': 1 completion (no comparison available)\n';
      } else {
        var comp = scoreComparisons[toolId];
        prompt += name + ': ' + entries.length + ' completions, direction: ' + comp.direction + '\n';
      }
    }

    prompt += '\n=== SCORE CHANGES (latest vs previous) ===\n';

    for (var toolId2 in scoreComparisons) {
      var comp2 = scoreComparisons[toolId2];
      var name2 = this.TOOL_NAMES[toolId2];
      prompt += '\n' + name2 + ':\n';

      if (toolId2 === 'tool1') {
        prompt += '  Previous dominant strategy: ' + (this.STRATEGY_LABELS[comp2.deltas._previousWinner] || comp2.deltas._previousWinner) + '\n';
        prompt += '  Latest dominant strategy: ' + (this.STRATEGY_LABELS[comp2.deltas._latestWinner] || comp2.deltas._latestWinner) + '\n';
        if (comp2.deltas._strategyShift) {
          prompt += '  ** Strategy shift detected **\n';
        }
        var stratKeys = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
        for (var s = 0; s < stratKeys.length; s++) {
          var sk = stratKeys[s];
          if (Math.abs(comp2.deltas[sk] || 0) > 0.3) {
            prompt += '  ' + (this.STRATEGY_LABELS[sk] || sk) + ': ' + (comp2.deltas[sk] > 0 ? '+' : '') + comp2.deltas[sk] + '\n';
          }
        }
      } else if (toolId2 === 'tool2') {
        var domKeys = ['moneyFlow', 'obligations', 'liquidity', 'growth', 'protection'];
        for (var d = 0; d < domKeys.length; d++) {
          var dKey = domKeys[d];
          var dDelta = comp2.deltas[dKey] || 0;
          if (Math.abs(dDelta) > 1) {
            prompt += '  ' + dKey + ': ' + (dDelta > 0 ? '+' : '') + dDelta + ' (higher = healthier)\n';
          }
        }
        if (comp2.deltas._archetypeShift) {
          prompt += '  Archetype shifted from "' + comp2.deltas._previousArchetype + '" to "' + comp2.deltas._latestArchetype + '"\n';
        }
      } else {
        // Grounding tools
        var oqDelta = comp2.deltas.overallQuotient || 0;
        prompt += '  Overall Quotient: ' + (oqDelta > 0 ? '+' : '') + oqDelta + ' (lower = healthier)\n';
        var d1Delta = comp2.deltas.domain1 || 0;
        var d2Delta = comp2.deltas.domain2 || 0;
        if (Math.abs(d1Delta) > 1) {
          prompt += '  Domain 1: ' + (d1Delta > 0 ? '+' : '') + d1Delta + '\n';
        }
        if (Math.abs(d2Delta) > 1) {
          prompt += '  Domain 2: ' + (d2Delta > 0 ? '+' : '') + d2Delta + '\n';
        }
      }

      prompt += '  Direction: ' + comp2.direction + '\n';
      if (comp2.biggestChange.metric) {
        prompt += '  Biggest change: ' + comp2.biggestChange.metric + ' (' + comp2.biggestChange.direction + ' by ' + Math.abs(comp2.biggestChange.delta) + ')\n';
      }
    }

    prompt += '\nWrite the cross-tool synthesis narrative.';
    return prompt;
  },

  _buildToolDeepDiveSystemPrompt(toolId, hasOpenText) {
    var toolContext = '';
    if (toolId === 'tool1') {
      toolContext = 'This tool identifies which of 6 financial defense strategies dominates: False Self-View, External Validation, Issues Showing Love, Issues Receiving Love, Control Leading to Isolation, and Fear Leading to Isolation. Lower scores indicate less reactive patterns. A shift in dominant strategy is significant.';
    } else if (toolId === 'tool2') {
      toolContext = 'This tool measures financial clarity across 5 domains: Money Flow, Obligations, Liquidity, Growth, and Protection. Higher domain scores indicate healthier financial awareness. The tool also identifies a financial archetype.';
    } else {
      var groundingNames = { tool3: 'Identity & Validation', tool5: 'Love & Connection', tool7: 'Security & Control' };
      toolContext = 'This is the ' + groundingNames[toolId] + ' grounding tool. It measures disconnection patterns on a 0-100 scale where LOWER quotients indicate healthier grounding. A decrease in scores means the student is building healthier patterns. It has an overall quotient, 2 domain quotients, and 6 subdomain quotients.';
    }

    var openTextInstruction = '';
    if (hasOpenText) {
      openTextInstruction = '\n\nThe student also wrote open-ended reflections during each completion. ' +
        'When you see meaningful shifts in their language or awareness between versions, reference or paraphrase their own words. ' +
        'Do not quote more than one phrase per section. Focus on shifts in perspective, not just different words.';
    } else {
      openTextInstruction = '\n\nThis tool does not collect open-ended reflections. Focus purely on score movements and what strategic shifts they suggest.';
    }

    return 'You are a financial psychology coach writing a progress analysis for one specific assessment tool. ' +
      'The student has taken this tool multiple times and you are analyzing their journey.\n\n' +
      'TONE: Direct but compassionate. Do not soften the truth. Use "you" throughout. ' +
      'No hedging language ("might", "perhaps", "could be"). Say what IS happening. ' +
      'Do not use contractions (write "do not" instead of the short form, "you are" instead of the short form). ' +
      'Do not use clinical or diagnostic language. This is coaching, not therapy.\n\n' +
      'TOOL: ' + this.TOOL_NAMES[toolId] + '\n' +
      toolContext +
      openTextInstruction + '\n\n' +
      'OUTPUT FORMAT - Return exactly three sections with these markers:\n\n' +
      'WHAT_CHANGED:\n(2-3 sentences describing the most significant score shifts and what they mean)\n\n' +
      'WHY_IT_MATTERS:\n(2-3 sentences connecting the changes to the student psychological or financial patterns)\n\n' +
      'FOCUS_NEXT:\n(1-2 sentences with specific guidance on what to work on before the next retake)';
  },

  _buildToolDeepDiveUserPrompt(toolId, entries, scoreComparison, openTexts) {
    var prompt = '=== TOOL: ' + this.TOOL_NAMES[toolId] + ' ===\n';
    prompt += 'Completions: ' + entries.length + '\n\n';

    // Version history with scores
    prompt += '=== VERSION HISTORY ===\n';
    for (var v = 0; v < entries.length; v++) {
      var entry = entries[v];
      var ts = entry.timestamp;
      var dateStr = '';
      try {
        var d = new Date(ts);
        dateStr = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
      } catch (e) {
        dateStr = 'unknown date';
      }

      prompt += '\nVersion ' + entry.versionNumber + ' (' + dateStr + '):\n';

      if (toolId === 'tool1' && entry.scores) {
        prompt += '  Dominant: ' + (this.STRATEGY_LABELS[entry.scores.winner] || entry.scores.winner) + '\n';
        if (entry.scores.scores) {
          var sKeys = ['FSV', 'ExVal', 'Showing', 'Receiving', 'Control', 'Fear'];
          for (var sk = 0; sk < sKeys.length; sk++) {
            prompt += '  ' + (this.STRATEGY_LABELS[sKeys[sk]] || sKeys[sk]) + ': ' + (entry.scores.scores[sKeys[sk]] || 0) + '\n';
          }
        }
      } else if (toolId === 'tool2' && entry.scores) {
        if (entry.scores.archetype) prompt += '  Archetype: ' + entry.scores.archetype + '\n';
        if (entry.scores.domainScores) {
          for (var dk in entry.scores.domainScores) {
            prompt += '  ' + dk + ': ' + entry.scores.domainScores[dk] + '\n';
          }
        }
      } else if (entry.scores) {
        prompt += '  Overall Quotient: ' + (entry.scores.overallQuotient || 0) + '/100 (lower = healthier)\n';
        if (entry.scores.domainQuotients) {
          prompt += '  Domain 1: ' + (entry.scores.domainQuotients.domain1 || 0) + '\n';
          prompt += '  Domain 2: ' + (entry.scores.domainQuotients.domain2 || 0) + '\n';
        }
      }
    }

    // Open-text reflections
    if (openTexts.length >= 2) {
      prompt += '\n=== STUDENT REFLECTIONS ===\n';
      // Show previous first, then latest for comparison
      for (var ot = openTexts.length - 1; ot >= 0; ot--) {
        var otEntry = openTexts[ot];
        prompt += '\n' + (otEntry.version === 'previous' ? 'Previous' : 'Latest') + ' reflections:\n';
        for (var label in otEntry.texts) {
          prompt += '  ' + label + ': "' + otEntry.texts[label] + '"\n';
        }
      }
    }

    // Score comparison summary
    prompt += '\n=== SCORE COMPARISON (latest vs previous) ===\n';
    for (var metric in scoreComparison.deltas) {
      if (metric.charAt(0) === '_') continue; // skip metadata keys
      var delta = scoreComparison.deltas[metric];
      if (Math.abs(delta) > 0) {
        prompt += metric + ': ' + (delta > 0 ? '+' : '') + delta + '\n';
      }
    }
    prompt += 'Overall direction: ' + scoreComparison.direction + '\n';
    if (scoreComparison.biggestChange.metric) {
      prompt += 'Biggest change: ' + scoreComparison.biggestChange.metric + ' (' + scoreComparison.biggestChange.direction + ')\n';
    }

    prompt += '\nWrite the deep dive analysis with WHAT_CHANGED, WHY_IT_MATTERS, and FOCUS_NEXT sections.';
    return prompt;
  },

  // ─── GPT Call ───────────────────────────────────────────────────

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
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt }
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens
      }),
      muteHttpExceptions: true
    });

    var json = JSON.parse(response.getContentText());

    if (json.error) {
      throw new Error('OpenAI API Error: ' + json.error.message);
    }

    return json.choices[0].message.content;
  },

  /**
   * 3-tier call: GPT -> retry after 2s -> fallback
   */
  _callWithFallback(systemPrompt, userPrompt, maxTokens, fallbackFn) {
    // Tier 1: Try GPT
    try {
      var content = this.callGPT({
        model: 'gpt-4o',
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        temperature: 0.3,
        maxTokens: maxTokens
      });
      if (content && content.length > 20) {
        return { narrative: content, source: 'gpt' };
      }
    } catch (err1) {
      LogUtils.debug('[ProgressNarrative] Tier 1 GPT failed: ' + err1);
    }

    // Tier 2: Retry after 2s
    try {
      Utilities.sleep(2000);
      var content2 = this.callGPT({
        model: 'gpt-4o',
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        temperature: 0.3,
        maxTokens: maxTokens
      });
      if (content2 && content2.length > 20) {
        return { narrative: content2, source: 'gpt_retry' };
      }
    } catch (err2) {
      LogUtils.debug('[ProgressNarrative] Tier 2 GPT retry failed: ' + err2);
    }

    // Tier 3: Template fallback
    LogUtils.debug('[ProgressNarrative] Using template fallback');
    var fallbackResult = fallbackFn();
    fallbackResult.source = 'fallback';
    return fallbackResult;
  },

  // ─── Response Parsers ──────────────────────────────────────────

  _parseToolDeepDiveResponse(text) {
    if (!text) return { whatChanged: '', whyItMatters: '', focusNext: '' };

    return {
      whatChanged: this._extractSection(text, 'WHAT_CHANGED'),
      whyItMatters: this._extractSection(text, 'WHY_IT_MATTERS'),
      focusNext: this._extractSection(text, 'FOCUS_NEXT')
    };
  },

  _extractSection(text, marker) {
    var markerWithColon = marker + ':';
    var startIdx = text.indexOf(markerWithColon);
    if (startIdx === -1) {
      // Try without colon
      startIdx = text.indexOf(marker);
      if (startIdx === -1) return '';
      startIdx += marker.length;
    } else {
      startIdx += markerWithColon.length;
    }

    // Find the next section marker
    var markers = ['WHAT_CHANGED', 'WHY_IT_MATTERS', 'FOCUS_NEXT'];
    var endIdx = text.length;
    for (var m = 0; m < markers.length; m++) {
      if (markers[m] === marker) continue;
      var nextIdx = text.indexOf(markers[m], startIdx);
      if (nextIdx !== -1 && nextIdx < endIdx) {
        endIdx = nextIdx;
      }
    }

    return text.substring(startIdx, endIdx).trim();
  },

  // ─── Caching ────────────────────────────────────────────────────

  _getCacheKey(clientId, type) {
    return 'progress_' + clientId + '_' + type;
  },

  _getCached(clientId, type) {
    try {
      var key = this._getCacheKey(clientId, type);
      var cached = PropertiesService.getUserProperties().getProperty(key);
      if (!cached) return null;

      var parsed = JSON.parse(cached);
      // Check if cache is less than 30 minutes old
      var age = Date.now() - (parsed._timestamp || 0);
      if (age > 30 * 60 * 1000) {
        return null; // Stale
      }

      delete parsed._timestamp;
      return parsed;
    } catch (error) {
      return null;
    }
  },

  _setCache(clientId, type, data) {
    try {
      var key = this._getCacheKey(clientId, type);
      var toStore = {};
      for (var k in data) {
        toStore[k] = data[k];
      }
      toStore._timestamp = Date.now();
      PropertiesService.getUserProperties().setProperty(key, JSON.stringify(toStore));
    } catch (error) {
      LogUtils.error('[ProgressNarrative] Cache write error: ' + error);
    }
  },

  _clearCache(clientId) {
    try {
      var props = PropertiesService.getUserProperties();
      var allKeys = props.getKeys();
      var prefix = 'progress_' + clientId + '_';
      for (var i = 0; i < allKeys.length; i++) {
        if (allKeys[i].indexOf(prefix) === 0) {
          props.deleteProperty(allKeys[i]);
        }
      }
      LogUtils.debug('[ProgressNarrative] Cleared cache for ' + clientId);
    } catch (error) {
      LogUtils.error('[ProgressNarrative] Cache clear error: ' + error);
    }
  },

  // ─── Fallback Templates ─────────────────────────────────────────

  _generateCrossToolFallback(history, scoreComparisons) {
    var toolsImproving = [];
    var toolsDeclining = [];
    var toolsMixed = [];

    for (var toolId in scoreComparisons) {
      var shortName = this.TOOL_SHORT_NAMES[toolId];
      var comp = scoreComparisons[toolId];

      if (comp.direction === 'improving') toolsImproving.push(shortName);
      else if (comp.direction === 'declining') toolsDeclining.push(shortName);
      else if (comp.direction === 'mixed') toolsMixed.push(shortName);
    }

    var narrative = '';

    if (toolsImproving.length > 0 && toolsDeclining.length === 0) {
      narrative = 'Across your assessments, you are moving in a positive direction. ';
      narrative += 'Your ' + toolsImproving.join(' and ') + ' scores show meaningful improvement since your previous completion. ';
      narrative += 'This pattern suggests the work you are doing is translating into real shifts in how you relate to money. ';
      narrative += 'Continue the practices that are driving these changes and consider retaking any tools you have not revisited recently.';
    } else if (toolsDeclining.length > 0 && toolsImproving.length === 0) {
      narrative = 'Your recent retakes show some areas that need attention. ';
      narrative += 'Your ' + toolsDeclining.join(' and ') + ' scores have moved in a direction that suggests increased struggle. ';
      narrative += 'This is not a step backward if you use it as information about where to focus your energy. ';
      narrative += 'Consider what may have shifted in your life recently and discuss these results with your coach.';
    } else if (toolsImproving.length > 0 && toolsDeclining.length > 0) {
      narrative = 'Your progress is uneven, which is completely normal in this work. ';
      narrative += toolsImproving.join(' and ') + ' show real growth, ';
      narrative += 'while ' + toolsDeclining.join(' and ') + ' need more attention. ';
      narrative += 'Focus your energy on the areas showing regression while maintaining the habits driving your improvements.';
    } else {
      narrative = 'Your scores have remained relatively stable since your previous completions. ';
      narrative += 'Stability can mean you are maintaining healthy patterns, or it can mean you have not yet engaged with the areas that need change. ';
      narrative += 'Discuss with your coach which interpretation fits your experience.';
    }

    return { narrative: narrative };
  },

  _generateToolDeepDiveFallback(toolId, entries, scoreComparison) {
    var latest = entries[entries.length - 1];
    var previous = entries[entries.length - 2];
    var comp = scoreComparison;
    var inverted = comp.inverted;
    var toolName = this.TOOL_SHORT_NAMES[toolId];

    // whatChanged
    var whatChanged = '';
    if (comp.biggestChange.metric) {
      var metricLabel = comp.biggestChange.metric;
      if (this.STRATEGY_LABELS[metricLabel]) metricLabel = this.STRATEGY_LABELS[metricLabel];

      whatChanged = 'Your biggest shift in ' + toolName + ' was in ' + metricLabel + ', ';
      whatChanged += 'which ' + comp.biggestChange.direction + ' by ' + Math.abs(comp.biggestChange.delta) + ' points. ';
    }

    if (toolId === 'tool1' && comp.deltas._strategyShift) {
      whatChanged += 'Your dominant strategy shifted from ' +
        (this.STRATEGY_LABELS[comp.deltas._previousWinner] || comp.deltas._previousWinner) + ' to ' +
        (this.STRATEGY_LABELS[comp.deltas._latestWinner] || comp.deltas._latestWinner) + '. ';
      whatChanged += 'A strategy shift indicates a meaningful change in how you relate to financial stress.';
    } else if (toolId === 'tool2' && comp.deltas._archetypeShift) {
      whatChanged += 'Your financial archetype shifted from "' + comp.deltas._previousArchetype + '" to "' + comp.deltas._latestArchetype + '". ';
    } else {
      whatChanged += 'Overall, your scores moved in a ' + comp.direction + ' direction.';
    }

    // whyItMatters
    var whyItMatters = '';
    if (comp.direction === 'improving') {
      if (inverted) {
        whyItMatters = 'A decrease in your grounding quotient means you are building healthier patterns in this area. ';
      } else if (toolId === 'tool2') {
        whyItMatters = 'Higher financial clarity scores indicate you are developing a more accurate picture of your financial reality. ';
      } else {
        whyItMatters = 'The reduction in your dominant strategy scores suggests you are becoming less reactive in your financial behaviors. ';
      }
      whyItMatters += 'This kind of shift typically reflects genuine internal work, not just intellectual understanding.';
    } else if (comp.direction === 'declining') {
      if (inverted) {
        whyItMatters = 'An increase in your grounding quotient suggests increased disconnection in this area. ';
      } else if (toolId === 'tool2') {
        whyItMatters = 'Lower financial clarity scores may indicate new financial stressors or increased avoidance. ';
      } else {
        whyItMatters = 'Higher strategy scores suggest increased reactivity, which often happens during periods of stress or change. ';
      }
      whyItMatters += 'Use this as a signal to pay closer attention to this area, not as a measure of failure.';
    } else {
      whyItMatters = 'Your scores show a mix of improvement and regression, which is normal during active growth. ';
      whyItMatters += 'The areas where you improved likely reflect conscious effort, while the areas of regression may need more focused attention.';
    }

    // focusNext
    var focusNext = '';
    if (comp.biggestChange.metric && (comp.direction === 'declining' || comp.direction === 'mixed')) {
      var focusMetric = comp.biggestChange.metric;
      if (this.STRATEGY_LABELS[focusMetric]) focusMetric = this.STRATEGY_LABELS[focusMetric];
      focusNext = 'Before your next retake, focus specifically on ' + focusMetric + ', as this showed the most significant change needing attention.';
    } else {
      focusNext = 'Continue the work you are doing. When you retake this tool, pay attention to whether your lived experience matches the direction your scores are moving.';
    }

    return {
      narrative: whatChanged + '\n\n' + whyItMatters + '\n\n' + focusNext,
      sections: {
        whatChanged: whatChanged,
        whyItMatters: whyItMatters,
        focusNext: focusNext
      }
    };
  }

};
