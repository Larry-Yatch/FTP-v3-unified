/**
 * IntegrationGPT.js
 * GPT-powered narrative generation for the Integration Report
 *
 * Takes structured detection engine output and produces cohesive
 * narrative sections that read like a coach speaking directly to the student.
 *
 * 3-Tier Fallback:
 * - Tier 1: GPT-4o (single call with full context)
 * - Tier 2: Retry after 2 seconds
 * - Tier 3: Template-based fallback using detection engine data
 *
 * Cost: ~$0.02 per report (single GPT-4o call)
 * Speed: ~4-6 seconds
 */

const IntegrationGPT = {

  /**
   * Generate the full integration narrative for a student.
   *
   * @param {Object} analysisData - Pre-computed detection engine results
   * @param {Object} analysisData.profile - from _detectProfile()
   * @param {Array} analysisData.warnings - from _generateWarnings()
   * @param {Object} analysisData.awarenessGap - from _calculateAwarenessGap()
   * @param {Array} analysisData.locks - from _detectBeliefLocks()
   * @param {Array} analysisData.bbGaps - from _detectBeliefBehaviorGaps()
   * @param {Object} analysisData.summary - the raw student summary
   * @returns {Object} Narrative object with sections + source attribution
   */
  generateNarrative(analysisData) {
    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log('[INTEGRATION_GPT] Tier 1: Attempting GPT narrative generation');

      var systemPrompt = this.buildSystemPrompt();
      var userPrompt = this.buildUserPrompt(analysisData);

      var result = this.callGPT({
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1500
      });

      var parsed = this.parseNarrativeResponse(result);

      if (this.isValidNarrative(parsed)) {
        Logger.log('[INTEGRATION_GPT] Tier 1: GPT success');
        parsed.source = 'gpt';
        parsed.timestamp = new Date().toISOString();
        return parsed;
      } else {
        throw new Error('Incomplete GPT narrative (missing required sections)');
      }

    } catch (error) {
      Logger.log('[INTEGRATION_GPT] Tier 1 failed: ' + error.message);

      // ============================================================
      // TIER 2: Retry GPT
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log('[INTEGRATION_GPT] Tier 2: Retrying GPT');

        var systemPrompt2 = this.buildSystemPrompt();
        var userPrompt2 = this.buildUserPrompt(analysisData);

        var result2 = this.callGPT({
          systemPrompt: systemPrompt2,
          userPrompt: userPrompt2,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 1500
        });

        var parsed2 = this.parseNarrativeResponse(result2);

        if (this.isValidNarrative(parsed2)) {
          Logger.log('[INTEGRATION_GPT] Tier 2: GPT retry success');
          parsed2.source = 'gpt_retry';
          parsed2.timestamp = new Date().toISOString();
          return parsed2;
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log('[INTEGRATION_GPT] Tier 2 failed: ' + retryError.message);

        // ============================================================
        // TIER 3: Template-based Fallback
        // ============================================================
        Logger.log('[INTEGRATION_GPT] Tier 3: Using template fallback');
        return this.generateFallbackNarrative(analysisData);
      }
    }
  },

  // ============================================================
  // PROMPT BUILDERS
  // ============================================================

  buildSystemPrompt() {
    return 'You are a financial psychology coach writing a personalized integration report for a student. ' +
      'The student has completed psychological and financial assessments. Your job is to weave the analytical findings ' +
      'into a cohesive narrative that reads like a coach speaking directly to the student. ' +
      '\n\n' +
      'TONE: Direct but compassionate. Do not soften the truth. These students are used to hearing it straight. ' +
      'Use "you" throughout. No hedging language ("might", "perhaps", "could be"). Say what IS happening. ' +
      '\n\n' +
      'LANGUAGE RULES: ' +
      'Do not use contractions (write "do not" instead of the short form, "you are" instead of the short form). ' +
      'Do not use clinical or diagnostic language. This is coaching, not therapy. ' +
      '\n\n' +
      'STRUCTURE: Return your response in exactly this format with these section markers. ' +
      'IMPORTANT: Some sections may have no data if the student has not completed all tools. ' +
      'Only write sections where data is provided. Skip markers for empty sections. ' +
      'OVERALL_SYNTHESIS and ACTION_ITEMS are always required.' +
      '\n\n' +
      'PROFILE_NARRATIVE: (2-3 sentences connecting their profile name to their lived experience) ' +
      '\n' +
      'WARNING_NARRATIVE: (3-5 sentences weaving the warnings into a cause-and-effect story) ' +
      '\n' +
      'LOCK_NARRATIVE: (2-4 sentences explaining how their beliefs reinforce each other) ' +
      '\n' +
      'GAP_NARRATIVE: (2-3 sentences about their awareness gap and/or belief-behavior gaps) ' +
      '\n' +
      'OVERALL_SYNTHESIS: (3-5 sentences — the big picture. Connect psychological patterns to financial outcomes. End with hope. REQUIRED even with partial data.) ' +
      '\n' +
      'ACTION_ITEMS: (3-5 specific, actionable next steps as a numbered list. If tools are incomplete, include completing specific tools as action items. REQUIRED.)';
  },

  buildUserPrompt(analysisData) {
    var profile = analysisData.profile;
    var warnings = analysisData.warnings;
    var gap = analysisData.awarenessGap;
    var locks = analysisData.locks;
    var bbGaps = analysisData.bbGaps;
    var summary = analysisData.summary;

    var prompt = 'Here is the student analysis data. Write the integration narrative based on these findings.\n\n';

    // Profile
    if (profile) {
      prompt += '=== INTEGRATION PROFILE ===\n';
      prompt += 'Profile: ' + profile.name + ' (' + profile.confidence + ' confidence)\n';
      prompt += 'Description: ' + profile.description + '\n';
      prompt += 'Financial Signature: ' + profile.financialSignature + '\n';
      prompt += 'Sources: ' + profile.sources.join(', ') + '\n\n';
    }

    // Warnings
    if (warnings && warnings.length > 0) {
      prompt += '=== ACTIVE WARNINGS (' + warnings.length + ') ===\n';
      for (var w = 0; w < warnings.length; w++) {
        var warning = warnings[w];
        prompt += '[' + warning.priority + '] ' + warning.type + ': ' + warning.message + '\n';
        prompt += '  Sources: ' + warning.sources.join(' + ') + '\n';
      }
      prompt += '\n';
    }

    // Awareness Gap
    if (gap) {
      prompt += '=== AWARENESS GAP ===\n';
      prompt += 'Psychological Score: ' + gap.psychScore + '/100\n';
      prompt += 'Stress Awareness: ' + gap.stressScore + '/100\n';
      prompt += 'Gap: ' + gap.gapScore + ' points (' + gap.severity + ')\n\n';
    }

    // Belief Locks
    if (locks && locks.length > 0) {
      prompt += '=== BELIEF LOCKS (' + locks.length + ') ===\n';
      for (var l = 0; l < locks.length; l++) {
        var lock = locks[l];
        prompt += lock.name + ' [' + lock.strength + ', avg: ' + lock.avgScore + ']\n';
        for (var b = 0; b < lock.beliefs.length; b++) {
          prompt += '  - "' + lock.beliefs[b].label + '" (' + lock.beliefs[b].score + '/100 via ' + lock.beliefs[b].tool + ')\n';
        }
        prompt += '  Impact: ' + lock.financialImpact + '\n';
      }
      prompt += '\n';
    }

    // Belief-Behavior Gaps
    if (bbGaps && bbGaps.length > 0) {
      prompt += '=== BELIEF-BEHAVIOR GAPS (' + bbGaps.length + ') ===\n';
      for (var g = 0; g < Math.min(bbGaps.length, 5); g++) {
        var bbGap = bbGaps[g];
        prompt += '"' + bbGap.label + '" (' + bbGap.tool + '): Belief=' + bbGap.beliefScore + ', Behavior=' + bbGap.behaviorScore + ', Gap=' + bbGap.gap + ' — ' + bbGap.direction + '\n';
      }
      prompt += '\n';
    }

    // Tool completion context
    prompt += '=== TOOLS COMPLETED: ' + summary.completedCount + ' of 8 ===\n';

    // Tool 1 winner if available
    var t1 = summary.tools.tool1;
    if (t1 && t1.status === 'completed' && t1.data) {
      prompt += 'Dominant Trauma Strategy: ' + t1.data.winner + '\n';
    }

    // Tool 2 archetype if available
    var t2 = summary.tools.tool2;
    if (t2 && t2.status === 'completed' && t2.data) {
      prompt += 'Financial Archetype: ' + (t2.data.archetype || 'Unknown') + '\n';
    }

    // Tool 4 allocations if available
    var t4 = summary.tools.tool4;
    if (t4 && t4.status === 'completed' && t4.data && t4.data.allocations) {
      var alloc = t4.data.allocations;
      prompt += 'Budget Allocation: M=' + alloc.M + '% E=' + alloc.E + '% F=' + alloc.F + '% J=' + alloc.J + '%\n';
    }

    return prompt;
  },

  // ============================================================
  // RESPONSE PARSER
  // ============================================================

  parseNarrativeResponse(text) {
    return {
      profileNarrative: this.extractSection(text, 'PROFILE_NARRATIVE:'),
      warningNarrative: this.extractSection(text, 'WARNING_NARRATIVE:'),
      lockNarrative: this.extractSection(text, 'LOCK_NARRATIVE:'),
      gapNarrative: this.extractSection(text, 'GAP_NARRATIVE:'),
      overallSynthesis: this.extractSection(text, 'OVERALL_SYNTHESIS:'),
      actionItems: this.extractActionItems(text)
    };
  },

  extractSection(text, marker) {
    if (!text) return '';
    var idx = text.indexOf(marker);
    if (idx === -1) return '';

    var start = idx + marker.length;
    // Find the next section marker or end of text
    var markers = ['PROFILE_NARRATIVE:', 'WARNING_NARRATIVE:', 'LOCK_NARRATIVE:', 'GAP_NARRATIVE:', 'OVERALL_SYNTHESIS:', 'ACTION_ITEMS:'];
    var end = text.length;

    for (var i = 0; i < markers.length; i++) {
      if (markers[i] === marker) continue;
      var nextIdx = text.indexOf(markers[i], start);
      if (nextIdx !== -1 && nextIdx < end) {
        end = nextIdx;
      }
    }

    return text.substring(start, end).trim();
  },

  extractActionItems(text) {
    var section = this.extractSection(text, 'ACTION_ITEMS:');
    if (!section) return [];

    // Parse numbered list (1. xxx, 2. xxx, etc.)
    var items = [];
    var lines = section.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var match = line.match(/^\d+[\.\)]\s*(.+)/);
      if (match) {
        items.push(match[1].trim());
      }
    }
    return items;
  },

  isValidNarrative(parsed) {
    // Need at least overallSynthesis to be considered valid.
    // We do NOT require every section — a student with incomplete tools
    // will have fewer engine outputs, so GPT will produce fewer sections.
    // But we always need a synthesis and action items to call it valid.
    return parsed &&
      parsed.overallSynthesis &&
      parsed.overallSynthesis.length > 50 &&
      parsed.actionItems &&
      parsed.actionItems.length >= 2;
  },

  // ============================================================
  // TIER 3: TEMPLATE FALLBACK
  // ============================================================

  /**
   * Generate a narrative without GPT using templates and detection engine data.
   * Not as fluid as GPT but functional and always available.
   *
   * SPARSE DATA HANDLING:
   * Each section checks whether its engine data exists before generating text.
   * If a section has no data, its narrative is an empty string — the PDF
   * renderer will skip it or show a "missing section" placeholder.
   * The overall synthesis and action items always generate content, even
   * with minimal data, because they are the most important parts of the report.
   */
  generateFallbackNarrative(analysisData) {
    var profile = analysisData.profile;
    var warnings = analysisData.warnings || [];
    var gap = analysisData.awarenessGap;
    var locks = analysisData.locks || [];

    // Profile narrative — empty string if no profile (Tool 1 not completed)
    var profileNarrative = '';
    if (profile) {
      profileNarrative = 'Your integration profile is ' + profile.name + '. ' + profile.description;
      if (profile.financialSignature) {
        profileNarrative += ' In your financial data, this shows up as: ' + profile.financialSignature;
      }
    }

    // Warning narrative — empty string if no warnings triggered
    var warningNarrative = '';
    if (warnings.length > 0) {
      var criticalCount = warnings.filter(function(w) { return w.priority === 'CRITICAL'; }).length;

      warningNarrative = 'Your analysis identified ' + warnings.length + ' active pattern' + (warnings.length > 1 ? 's' : '') +
        ' affecting your financial behavior.';

      if (criticalCount > 0) {
        warningNarrative += ' ' + criticalCount + ' of these are critical patterns that need immediate attention.';
      }

      // Include top warning message
      warningNarrative += ' The most significant: ' + warnings[0].message;
    }

    // Lock narrative — empty string if no locks detected
    var lockNarrative = '';
    if (locks.length > 0) {
      lockNarrative = locks.length + ' belief lock' + (locks.length > 1 ? 's were' : ' was') +
        ' detected in your assessment data. ';

      var strongLocks = locks.filter(function(l) { return l.strength === 'strong'; });
      if (strongLocks.length > 0) {
        lockNarrative += strongLocks.length + ' of these are strong locks, meaning the beliefs are deeply reinforcing each other. ';
        lockNarrative += 'The strongest is your ' + strongLocks[0].name + '. ' + strongLocks[0].financialImpact;
      } else {
        lockNarrative += 'Your strongest lock is ' + locks[0].name + '. ' + locks[0].financialImpact;
      }
    }

    // Gap narrative — empty string if no gap or gap is "normal"
    var gapNarrative = '';
    if (gap && gap.severity !== 'normal') {
      gapNarrative = 'Your awareness gap is ' + gap.severity + ' at ' + gap.gapScore + ' points. ' +
        'Your psychological patterns score ' + gap.psychScore + '/100 but your stress awareness is only ' +
        gap.stressScore + '/100. This means you are likely not seeing the full financial impact of your patterns.';
    }

    // Overall synthesis — ALWAYS generates content even with sparse data
    // This is the most important section and must work with any combination
    var overallSynthesis = '';
    if (profile) {
      overallSynthesis = 'As a ' + profile.name + ', your core pattern shapes how you relate to money at every level. ';
    } else {
      overallSynthesis = 'Based on the tools you have completed so far, some important patterns are emerging. ';
    }
    if (warnings.length > 0) {
      overallSynthesis += 'The ' + warnings.length + ' active warning' + (warnings.length > 1 ? 's' : '') + ' in your analysis show' + (warnings.length === 1 ? 's' : '') + ' specific ways these patterns are currently affecting your financial decisions. ';
    }
    if (locks.length > 0) {
      overallSynthesis += 'Your ' + locks.length + ' belief lock' + (locks.length > 1 ? 's make' : ' makes') +
        ' these patterns resistant to change without targeted work. ';
    }
    if (gap && gap.severity !== 'normal') {
      overallSynthesis += 'Your awareness gap of ' + gap.gapScore + ' points suggests there are financial impacts you are not yet seeing clearly. ';
    }
    overallSynthesis += 'The fact that you are looking at this report means you are already moving in the right direction. Awareness is the first step, and now you have a clear map of where to focus your energy.';

    // Action items — ALWAYS generates at least 2 items (required for isValidNarrative)
    // Items are context-aware: only suggest tool-specific actions if relevant data exists
    var actionItems = [];
    if (gap && gap.severity !== 'normal') {
      actionItems.push('Address your awareness gap first. Review your financial stress scores in Tool 2 and ask yourself honestly whether you have been underreporting.');
    }
    if (warnings.length > 0 && warnings[0].priority === 'CRITICAL') {
      actionItems.push('Discuss your critical warning pattern with your coach before making major financial decisions.');
    }
    if (locks.length > 0) {
      actionItems.push('Focus on the weakest belief in your strongest lock. That is the most likely place to break the pattern.');
    }

    // Check which tools are still incomplete and suggest completing them
    var summary = analysisData.summary;
    if (summary) {
      var t1 = summary.tools.tool1;
      var t2 = summary.tools.tool2;
      if (!t1 || t1.status !== 'completed') {
        actionItems.push('Complete Tool 1 (Core Trauma Assessment) to unlock your full integration profile and cross-tool warnings.');
      }
      if (!t2 || t2.status !== 'completed') {
        actionItems.push('Complete Tool 2 (Financial Clarity) to see how your psychological patterns map to financial stress.');
      }
    }

    // Always include these two as baseline actions
    actionItems.push('Revisit your Tool 4 budget allocation with these insights in mind. Your psychological patterns likely influenced the numbers you chose.');
    actionItems.push('Schedule a check-in with your coach to review this integration report together.');

    return {
      profileNarrative: profileNarrative,
      warningNarrative: warningNarrative,
      lockNarrative: lockNarrative,
      gapNarrative: gapNarrative,
      overallSynthesis: overallSynthesis,
      actionItems: actionItems,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // GPT API CALL (matches GroundingGPT.callGPT pattern)
  // ============================================================

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
  }
};
