/**
 * IntegrationGPT.js
 * GPT-powered narrative generation for the Capstone Report
 *
 * Takes structured detection engine output + per-tool assessment data
 * and produces cohesive narrative sections that read like a coach
 * speaking directly to the student.
 *
 * Phase 10: Expanded from 6 to 8 narrative sections.
 * New sections: psychFoundationNarrative, financialLandscapeNarrative
 *
 * 3-Tier Fallback:
 * - Tier 1: GPT-4o (single call with full context)
 * - Tier 2: Retry after 2 seconds
 * - Tier 3: Template-based fallback using detection engine + per-tool data
 *
 * Cost: ~$0.04 per report (single GPT-4o call, 2500 tokens)
 * Speed: ~4-8 seconds
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
        maxTokens: 2500
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
          maxTokens: 2500
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
    return 'You are a financial psychology coach writing a personalized capstone report for a student. ' +
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
      'OVERALL_SYNTHESIS, ACTION_ITEMS, PSYCH_FOUNDATION_NARRATIVE, and FINANCIAL_LANDSCAPE_NARRATIVE are always required.' +
      '\n\n' +
      'PSYCH_FOUNDATION_NARRATIVE: (3-5 sentences connecting their trauma strategy to their grounding tool patterns. How does their core defense mechanism show up in their identity, relationships, and need for control? This introduces Part 1 of the report.) ' +
      '\n' +
      'FINANCIAL_LANDSCAPE_NARRATIVE: (3-5 sentences connecting their financial clarity to their budget, retirement, and investment choices. How do their clarity gaps shape their financial decisions? This introduces Part 2 of the report.) ' +
      '\n' +
      'PROFILE_NARRATIVE: (2-3 sentences connecting their profile name to their lived experience) ' +
      '\n' +
      'WARNING_NARRATIVE: (3-5 sentences weaving the warnings into a cause-and-effect story) ' +
      '\n' +
      'LOCK_NARRATIVE: (2-4 sentences explaining how their beliefs reinforce each other) ' +
      '\n' +
      'GAP_NARRATIVE: (2-3 sentences about their awareness gap and/or belief-behavior gaps) ' +
      '\n' +
      'OVERALL_SYNTHESIS: (4-6 sentences — the big picture. This is the capstone moment. Connect ALL tools: psychological patterns, financial clarity, budget allocations, retirement projections, and the integration findings. End with a forward-looking, hopeful statement. REQUIRED even with partial data.) ' +
      '\n' +
      'ACTION_ITEMS: (5-7 specific, actionable next steps as a numbered list. Include at least 1 psychological action, 1 financial action, and 1 integration action. If tools are incomplete, include completing specific tools. REQUIRED.)';
  },

  buildUserPrompt(analysisData) {
    var profile = analysisData.profile;
    var warnings = analysisData.warnings;
    var gap = analysisData.awarenessGap;
    var locks = analysisData.locks;
    var bbGaps = analysisData.bbGaps;
    var summary = analysisData.summary;
    var perToolData = analysisData.perToolData;

    var prompt = 'Here is the student analysis data. Write the capstone narrative based on these findings.\n\n';

    // === PER-TOOL ASSESSMENT DATA ===

    // Tool 1: Core Trauma Strategy
    if (perToolData && perToolData.tool1) {
      var pt1 = perToolData.tool1;
      prompt += '=== TOOL 1: CORE TRAUMA STRATEGY ===\n';
      prompt += 'Dominant Strategy: ' + pt1.winner + '\n';
      if (pt1.scores) {
        prompt += 'Scores: ';
        var scoreStrs = [];
        for (var sKey in pt1.scores) {
          scoreStrs.push(sKey + '=' + pt1.scores[sKey]);
        }
        prompt += scoreStrs.join(', ') + '\n';
      }
      prompt += '\n';
    }

    // Grounding Tools (3, 5, 7)
    var groundingToolNames = { tool3: 'IDENTITY & VALIDATION', tool5: 'LOVE & CONNECTION', tool7: 'SECURITY & CONTROL' };
    var groundingToolNumbers = { tool3: 3, tool5: 5, tool7: 7 };
    var groundingKeys = ['tool3', 'tool5', 'tool7'];
    for (var gi = 0; gi < groundingKeys.length; gi++) {
      var gToolKey = groundingKeys[gi];
      if (perToolData && perToolData[gToolKey]) {
        var gt = perToolData[gToolKey];
        prompt += '=== TOOL ' + groundingToolNumbers[gToolKey] + ': ' + groundingToolNames[gToolKey] + ' ===\n';
        if (gt.scoring) {
          prompt += 'Overall Quotient: ' + gt.scoring.overallQuotient + '/100\n';
          if (gt.scoring.domainQuotients) {
            for (var dk in gt.scoring.domainQuotients) {
              prompt += 'Domain "' + dk + '": ' + gt.scoring.domainQuotients[dk] + '/100\n';
            }
          }
        }
        if (gt.syntheses && gt.syntheses.overall) {
          prompt += 'Overall Synthesis: ' + gt.syntheses.overall.summary + '\n';
        }
        prompt += '\n';
      }
    }

    // Tool 2: Financial Clarity
    if (perToolData && perToolData.tool2) {
      var pt2 = perToolData.tool2;
      prompt += '=== TOOL 2: FINANCIAL CLARITY ===\n';
      if (pt2.results) {
        if (pt2.results.archetype) prompt += 'Archetype: ' + pt2.results.archetype + '\n';
        if (pt2.results.domainScores) {
          prompt += 'Domain Scores: ';
          var domStrs = [];
          for (var dom in pt2.results.domainScores) {
            domStrs.push(dom + '=' + pt2.results.domainScores[dom] + '%');
          }
          prompt += domStrs.join(', ') + '\n';
        }
        if (pt2.results.priorityList && pt2.results.priorityList.length > 0) {
          prompt += 'Top Priority: ' + pt2.results.priorityList[0].domain + '\n';
        }
      }
      if (pt2.overallInsight) {
        prompt += 'Overall Insight: ' + pt2.overallInsight.summary + '\n';
      }
      prompt += '\n';
    }

    // Tool 4: Budget Framework
    if (perToolData && perToolData.tool4) {
      var pt4 = perToolData.tool4;
      prompt += '=== TOOL 4: BUDGET FRAMEWORK ===\n';
      prompt += 'Monthly Income: $' + pt4.monthlyIncome + '\n';
      prompt += 'Allocations: Multiply=' + pt4.multiply + '%, Essentials=' + pt4.essentials + '%, Freedom=' + pt4.freedom + '%, Enjoyment=' + pt4.enjoyment + '%\n';
      prompt += 'Priority: ' + pt4.priority + '\n\n';
    }

    // Tool 6: Retirement Blueprint
    if (perToolData && perToolData.tool6) {
      var pt6 = perToolData.tool6;
      prompt += '=== TOOL 6: RETIREMENT BLUEPRINT ===\n';
      if (pt6.profileId) prompt += 'Profile: ' + pt6.profileId + '\n';
      if (pt6.monthlyBudget) prompt += 'Monthly Budget: $' + pt6.monthlyBudget + '\n';
      if (pt6.projectedBalance) prompt += 'Projected Balance: $' + pt6.projectedBalance + '\n';
      if (pt6.investmentScore !== undefined) prompt += 'Investment Score: ' + pt6.investmentScore + '/10\n';
      if (pt6.taxStrategy) prompt += 'Tax Strategy: ' + pt6.taxStrategy + '\n';
      prompt += '\n';
    }

    // Tool 8: Investment Planning
    if (perToolData && perToolData.tool8) {
      var pt8 = perToolData.tool8;
      prompt += '=== TOOL 8: INVESTMENT PLANNING ===\n';
      if (pt8.scenarioName) prompt += 'Scenario: ' + pt8.scenarioName + '\n';
      if (pt8.monthlyInvestment) prompt += 'Monthly Investment: $' + pt8.monthlyInvestment + '\n';
      if (pt8.timeHorizon) prompt += 'Time Horizon: ' + pt8.timeHorizon + ' years\n';
      if (pt8.risk !== undefined) prompt += 'Risk Level: ' + pt8.risk + '/10\n';
      if (pt8.projectedBalance) prompt += 'Projected Balance: $' + pt8.projectedBalance + '\n';
      if (pt8.feasibility) prompt += 'Feasibility: ' + pt8.feasibility + '\n';
      prompt += '\n';
    }

    // === DETECTION ENGINE DATA ===

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
    var toolNames = {
      tool1: 'Core Trauma Strategy',
      tool2: 'Financial Clarity',
      tool3: 'Identity & Validation',
      tool4: 'Budget Framework',
      tool5: 'Love & Connection',
      tool6: 'Retirement Blueprint',
      tool7: 'Security & Control',
      tool8: 'Investment Planning'
    };
    for (var toolKey in toolNames) {
      var tool = summary.tools[toolKey];
      var status = (tool && tool.status === 'completed') ? 'COMPLETED' : 'NOT COMPLETED';
      prompt += toolKey + ' (' + toolNames[toolKey] + '): ' + status + '\n';
    }

    return prompt;
  },

  // ============================================================
  // RESPONSE PARSER
  // ============================================================

  parseNarrativeResponse(text) {
    return {
      psychFoundationNarrative: this.extractSection(text, 'PSYCH_FOUNDATION_NARRATIVE:'),
      financialLandscapeNarrative: this.extractSection(text, 'FINANCIAL_LANDSCAPE_NARRATIVE:'),
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
    var markers = [
      'PSYCH_FOUNDATION_NARRATIVE:', 'FINANCIAL_LANDSCAPE_NARRATIVE:',
      'PROFILE_NARRATIVE:', 'WARNING_NARRATIVE:', 'LOCK_NARRATIVE:',
      'GAP_NARRATIVE:', 'OVERALL_SYNTHESIS:', 'ACTION_ITEMS:'
    ];
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
    // Need overallSynthesis + action items + at least one of the two new part narratives.
    // We do NOT require every section — a student with incomplete tools
    // will have fewer engine outputs, so GPT will produce fewer sections.
    var hasOverall = parsed && parsed.overallSynthesis && parsed.overallSynthesis.length > 50;
    var hasActions = parsed && parsed.actionItems && parsed.actionItems.length >= 2;
    var hasFoundation = parsed && parsed.psychFoundationNarrative && parsed.psychFoundationNarrative.length > 30;
    var hasLandscape = parsed && parsed.financialLandscapeNarrative && parsed.financialLandscapeNarrative.length > 30;
    var hasNewNarrative = hasFoundation || hasLandscape;

    return hasOverall && hasActions && hasNewNarrative;
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
    var perToolData = analysisData.perToolData;

    // --- Psych Foundation Narrative (NEW — introduces Part 1) ---
    var psychFoundationNarrative = '';
    if (perToolData && perToolData.tool1) {
      var strategy = perToolData.tool1.winner || 'your dominant strategy';
      var groundingParts = [];
      if (perToolData.tool3 && perToolData.tool3.scoring) {
        groundingParts.push('your identity patterns (scoring ' + perToolData.tool3.scoring.overallQuotient + '/100)');
      }
      if (perToolData.tool5 && perToolData.tool5.scoring) {
        groundingParts.push('your connection patterns (scoring ' + perToolData.tool5.scoring.overallQuotient + '/100)');
      }
      if (perToolData.tool7 && perToolData.tool7.scoring) {
        groundingParts.push('your security patterns (scoring ' + perToolData.tool7.scoring.overallQuotient + '/100)');
      }

      psychFoundationNarrative = 'Your dominant trauma strategy is ' + strategy +
        '. This core defense mechanism shapes how you approach every financial decision.';
      if (groundingParts.length > 0) {
        psychFoundationNarrative += ' The grounding assessments reveal how this shows up across ' +
          groundingParts.join(' and ') + '. The sections below show your specific scores and what they mean.';
      }
    } else {
      psychFoundationNarrative = 'Your psychological foundation assessments reveal the inner patterns that drive your financial decisions. The sections below show your specific scores and what they mean.';
    }

    // --- Financial Landscape Narrative (NEW — introduces Part 2) ---
    var financialLandscapeNarrative = '';
    var financialParts = [];
    if (perToolData && perToolData.tool2 && perToolData.tool2.results) {
      financialParts.push('your financial clarity profile reveals specific areas of strength and opportunity');
    }
    if (perToolData && perToolData.tool4) {
      financialParts.push('your budget allocation shows how you prioritize your income');
    }
    if (perToolData && perToolData.tool6) {
      financialParts.push('your retirement blueprint maps your long-term trajectory');
    }
    if (perToolData && perToolData.tool8) {
      financialParts.push('your investment plan shows how you are building toward your goals');
    }

    if (financialParts.length > 0) {
      financialLandscapeNarrative = 'Your financial assessments paint a clear picture: ' +
        financialParts.join(', ') + '. Understanding these numbers alongside your psychological patterns is the key to lasting financial change.';
    } else {
      financialLandscapeNarrative = 'Your financial landscape assessments capture how you earn, spend, save, and invest. The sections below show your specific data and what it means for your financial future.';
    }

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

    // Action items — ALWAYS generates at least 3 items
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
      var ft1 = summary.tools.tool1;
      var ft2 = summary.tools.tool2;
      if (!ft1 || ft1.status !== 'completed') {
        actionItems.push('Complete Tool 1 (Core Trauma Assessment) to unlock your full integration profile and cross-tool warnings.');
      }
      if (!ft2 || ft2.status !== 'completed') {
        actionItems.push('Complete Tool 2 (Financial Clarity) to see how your psychological patterns map to financial stress.');
      }
    }

    // Always include these as baseline actions
    actionItems.push('Revisit your Tool 4 budget allocation with these insights in mind. Your psychological patterns likely influenced the numbers you chose.');
    actionItems.push('Compare your Part 1 psychological scores with your Part 2 financial data. Notice where the same patterns appear in both areas.');
    actionItems.push('Schedule a check-in with your coach to review this capstone report together.');

    return {
      psychFoundationNarrative: psychFoundationNarrative,
      financialLandscapeNarrative: financialLandscapeNarrative,
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
