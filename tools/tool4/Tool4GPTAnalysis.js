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
      tool2Data,
      tool3Data
    } = params;

    // Validate required params
    if (!preSurveyData || !allocation || !allocation.percentages) {
      LogUtils.debug('[Tool4GPT] Missing required data for main report');
      return Tool4Fallbacks.getMainReportFallback(preSurveyData, allocation);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      LogUtils.debug(`[TIER 1] Tool4 GPT: Main report for ${clientId}`);

      const systemPrompt = this.buildMainReportSystemPrompt(preSurveyData, allocation, tool1Data, tool2Data, tool3Data);
      const userPrompt = this.buildMainReportUserPrompt(preSurveyData, allocation, validationResults, helperInsights);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 800  // Increased for trauma-informed content
      });

      const parsed = this.parseMainReportResponse(result);

      if (this.isValidMainInsight(parsed)) {
        LogUtils.debug('[TIER 1] Tool4 GPT success: Main report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      LogUtils.debug(`[TIER 1] Tool4 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        LogUtils.debug(`[TIER 2] Tool4 GPT retry: Main report for ${clientId}`);

        const systemPrompt = this.buildMainReportSystemPrompt(preSurveyData, allocation, tool1Data, tool2Data, tool3Data);
        const userPrompt = this.buildMainReportUserPrompt(preSurveyData, allocation, validationResults, helperInsights);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 800  // Increased for trauma-informed content
        });

        const parsed = this.parseMainReportResponse(result);

        if (this.isValidMainInsight(parsed)) {
          LogUtils.debug('[TIER 2] Tool4 GPT retry success: Main report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        LogUtils.debug(`[TIER 2] Tool4 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Score-aware Fallback
        // ============================================================
        LogUtils.debug('[TIER 3] Using fallback: Main report');
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
      comparisonData,
      tool1Data,
      tool3Data
    } = params;

    // Validate required params
    if (!scenario1 || !scenario2) {
      LogUtils.debug('[Tool4GPT] Missing scenarios for comparison');
      return Tool4Fallbacks.getComparisonFallback(scenario1, scenario2, preSurveyData);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      LogUtils.debug(`[TIER 1] Tool4 GPT: Comparison report for ${clientId}`);

      const systemPrompt = this.buildComparisonSystemPrompt(preSurveyData, scenario1, scenario2, tool1Data, tool3Data);
      const userPrompt = this.buildComparisonUserPrompt(scenario1, scenario2, preSurveyData, comparisonData);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 550  // Increased for trauma-informed content
      });

      const parsed = this.parseComparisonResponse(result);

      if (this.isValidComparisonInsight(parsed)) {
        LogUtils.debug('[TIER 1] Tool4 GPT success: Comparison report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      LogUtils.debug(`[TIER 1] Tool4 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        LogUtils.debug(`[TIER 2] Tool4 GPT retry: Comparison report for ${clientId}`);

        const systemPrompt = this.buildComparisonSystemPrompt(preSurveyData, scenario1, scenario2, tool1Data, tool3Data);
        const userPrompt = this.buildComparisonUserPrompt(scenario1, scenario2, preSurveyData, comparisonData);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 550  // Increased for trauma-informed content
        });

        const parsed = this.parseComparisonResponse(result);

        if (this.isValidComparisonInsight(parsed)) {
          LogUtils.debug('[TIER 2] Tool4 GPT retry success: Comparison report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        LogUtils.debug(`[TIER 2] Tool4 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Score-aware Fallback
        // ============================================================
        LogUtils.debug('[TIER 3] Using fallback: Comparison report');
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

  // ============================================================
  // TRAUMA-INFORMED CONTEXT BUILDERS
  // ============================================================

  /**
   * Build rich trauma-informed context from Tool 1 data
   * Maps each trauma pattern to its financial implications
   */
  buildTool1Context(tool1Data) {
    // tool1Data structure: { data: { formData, scores, winner }, clientId, ... }
    const tool1 = tool1Data?.data;
    if (!tool1 || !tool1.winner) return null;

    const traumaFinancialContext = {
      'FSV': {
        name: 'False Self-View',
        disconnection: 'Disconnection from Self (Active)',
        coreStrategy: 'Using a "mask" to feel safe - attaching to negative self-views like "I am not worthy" or assuming protective identities',
        financialPattern: 'May take on excessive financial obligations to prove worth, avoid looking at true financial picture, or use money to maintain a false identity. Often feels like they must "carry the weight" financially.',
        watchFor: 'Over-commitment to Essentials at expense of self-care (Enjoyment), reluctance to invest in self (Multiply), or using spending to maintain image',
        healingDirection: 'Learning that your true self is worthy of financial freedom without needing to prove it through sacrifice or achievement'
      },
      'ExVal': {
        name: 'External Validation',
        disconnection: 'Disconnection from Self (Passive)',
        coreStrategy: 'Needing acceptance and recognition from others to feel safe - giving up authentic self to be valued',
        financialPattern: 'May spend to impress others or gain approval, avoid financial decisions without external input, or feel unworthy of wealth. Often compares finances to others.',
        watchFor: 'Lifestyle inflation to match peers (Enjoyment), reluctance to prioritize own goals (Multiply), or seeking approval for every financial decision',
        healingDirection: 'Building internal self-worth so financial decisions come from your own values, not others\' expectations'
      },
      'Showing': {
        name: 'Issues Showing Love',
        disconnection: 'Disconnection from Others (Active)',
        coreStrategy: 'Suffering or sacrificing when showing care - believing love requires pain, that everyone deserves abundance except you',
        financialPattern: 'May over-give financially to others while neglecting own needs, feel guilty about personal spending, or believe wealth is selfish. Difficulty receiving financial help.',
        watchFor: 'Minimal Enjoyment allocation, over-funding others at expense of Freedom/Multiply, guilt when spending on self',
        healingDirection: 'Recognizing that caring for your financial wellbeing enables you to sustainably support others'
      },
      'Receiving': {
        name: 'Issues Receiving Love',
        disconnection: 'Disconnection from Others (Passive)',
        coreStrategy: 'Emotional disconnection to avoid pain - believing love and connection lead to hurt, so better to stay distant',
        financialPattern: 'May hoard money for safety, avoid financial partnerships or shared goals, or use money to maintain emotional distance. Difficulty accepting financial gifts or help.',
        watchFor: 'Over-emphasis on Freedom (security) at expense of relationship-building, isolation in financial decisions, avoidance of joint financial planning',
        healingDirection: 'Learning to receive support and build financial partnerships without fear of being hurt'
      },
      'Control': {
        name: 'Control Leading to Isolation',
        disconnection: 'Disconnection from Greater Purpose (Active)',
        coreStrategy: 'Maintaining rigid control of environment to feel safe - believing safety requires controlling everything',
        financialPattern: 'May obsessively track every penny, struggle to delegate financial decisions, or freeze when facing uncertainty. Uses financial control as anxiety management.',
        watchFor: 'Rigidity in allocation percentages, difficulty adjusting to life changes, analysis paralysis with financial decisions',
        healingDirection: 'Developing courage to release control and trust that you can handle financial uncertainty'
      },
      'Fear': {
        name: 'Fear Leading to Isolation',
        disconnection: 'Disconnection from Greater Purpose (Passive)',
        coreStrategy: 'Living in constant fear with perceived loss of control - expecting the worst, frozen in inaction',
        financialPattern: 'May catastrophize financial situations, avoid financial decisions entirely, or hoard money out of fear. Worst-case thinking dominates financial planning.',
        watchFor: 'Over-allocation to Freedom (fear-based security), paralysis around Multiply (too risky), avoidance of financial conversations',
        healingDirection: 'Building courage to take calculated financial risks and trust in your ability to recover from setbacks'
      }
    };

    const context = traumaFinancialContext[tool1.winner];
    if (!context) return null;

    // Include secondary patterns if scores are available
    let secondaryContext = '';
    if (tool1.scores) {
      const sortedScores = Object.entries(tool1.scores)
        .filter(([key]) => key !== tool1.winner)
        .sort((a, b) => b[1] - a[1]);

      if (sortedScores.length > 0 && sortedScores[0][1] > 0) {
        const secondary = traumaFinancialContext[sortedScores[0][0]];
        if (secondary) {
          secondaryContext = `\nSecondary Pattern: ${secondary.name} - ${secondary.financialPattern.split('.')[0]}.`;
        }
      }
    }

    return {
      ...context,
      secondaryContext
    };
  },

  /**
   * Build context from Tool 3 grounding assessment
   * Extracts overall score, domain insights, and syntheses
   */
  buildTool3Context(tool3Data) {
    // tool3Data structure: { data: { responses, scoring, gpt_insights, syntheses, ... }, clientId, ... }
    const tool3 = tool3Data?.data;
    if (!tool3) return null;

    const scoring = tool3.scoring || tool3.scoringResult;
    const syntheses = tool3.syntheses;

    if (!scoring) return null;

    const overallScore = scoring.overallQuotient;
    const domain1Score = scoring.domainQuotients?.domain1;
    const domain2Score = scoring.domainQuotients?.domain2;

    // Interpret overall grounding level
    let groundingLevel, groundingImplication;
    if (overallScore < 25) {
      groundingLevel = 'Well-Grounded';
      groundingImplication = 'Strong foundation for financial decisions - can trust their instincts and follow through on commitments';
    } else if (overallScore < 50) {
      groundingLevel = 'Moderately Grounded';
      groundingImplication = 'Some disconnection patterns may interfere with financial follow-through - awareness is key';
    } else if (overallScore < 75) {
      groundingLevel = 'Significant Disconnection';
      groundingImplication = 'Trauma patterns likely affecting financial behavior significantly - allocation may need extra structure and support';
    } else {
      groundingLevel = 'Critical Disconnection';
      groundingImplication = 'Strong trauma patterns requiring compassionate, structured approach - focus on small wins and building trust';
    }

    // Extract synthesis insights if available
    let overallSynthesis = '';
    if (syntheses?.overall?.overview) {
      // Take first 2 sentences of overview
      const sentences = syntheses.overall.overview.split(/[.!?]+/).filter(s => s.trim());
      overallSynthesis = sentences.slice(0, 2).join('. ').trim();
      if (overallSynthesis && !overallSynthesis.endsWith('.')) overallSynthesis += '.';
    }

    let coreWork = '';
    if (syntheses?.overall?.coreWork) {
      coreWork = syntheses.overall.coreWork;
    }

    return {
      overallScore: Math.round(overallScore),
      groundingLevel,
      groundingImplication,
      domain1Score: domain1Score ? Math.round(domain1Score) : null,
      domain2Score: domain2Score ? Math.round(domain2Score) : null,
      overallSynthesis,
      coreWork
    };
  },

  /**
   * Build system prompt for Main Report
   */
  buildMainReportSystemPrompt(preSurveyData, allocation, tool1Data, tool2Data, tool3Data) {
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

    // Build rich trauma-informed context
    let traumaContext = '';
    const tool1Context = this.buildTool1Context(tool1Data);
    const tool3Context = this.buildTool3Context(tool3Data);

    if (tool1Context || tool3Context) {
      traumaContext = '\n\n===== TRAUMA-INFORMED FINANCIAL CONTEXT =====\n';
      traumaContext += 'This student is in a program focused on healing financial trauma patterns. ';
      traumaContext += 'Your insights should weave awareness of their psychological patterns into the financial guidance.\n';

      if (tool1Context) {
        traumaContext += `\nPRIMARY DEFENSE STRATEGY (Tool 1): ${tool1Context.name}`;
        traumaContext += `\n- Type: ${tool1Context.disconnection}`;
        traumaContext += `\n- Core Pattern: ${tool1Context.coreStrategy}`;
        traumaContext += `\n- Financial Manifestation: ${tool1Context.financialPattern}`;
        traumaContext += `\n- Watch For in This Allocation: ${tool1Context.watchFor}`;
        traumaContext += `\n- Healing Direction: ${tool1Context.healingDirection}`;
        if (tool1Context.secondaryContext) {
          traumaContext += tool1Context.secondaryContext;
        }
      }

      if (tool3Context) {
        traumaContext += `\n\nGROUNDING ASSESSMENT (Tool 3): ${tool3Context.groundingLevel} (Score: ${tool3Context.overallScore}/100)`;
        traumaContext += `\n- Implication: ${tool3Context.groundingImplication}`;
        if (tool3Context.domain1Score !== null) {
          traumaContext += `\n- False Self-View Domain: ${tool3Context.domain1Score}/100`;
        }
        if (tool3Context.domain2Score !== null) {
          traumaContext += `\n- External Validation Domain: ${tool3Context.domain2Score}/100`;
        }
        if (tool3Context.overallSynthesis) {
          traumaContext += `\n- Key Insight: ${tool3Context.overallSynthesis}`;
        }
        if (tool3Context.coreWork) {
          traumaContext += `\n- Their Core Work: ${tool3Context.coreWork}`;
        }
      }

      traumaContext += '\n\nINTEGRATION GUIDANCE: Connect their trauma pattern to their allocation choices. ';
      traumaContext += 'Help them see how their defense strategy might show up in their spending, and how this allocation can support their healing journey.';
    }

    // Tool 2 archetype (simpler context)
    // tool2Data structure: { data: { data: allData, results, gptInsights, ... }, clientId, ... }
    let archetypeContext = '';
    const tool2Archetype = tool2Data?.data?.results?.archetype;
    if (tool2Archetype) {
      archetypeContext = `\nFINANCIAL ARCHETYPE (Tool 2): ${tool2Archetype}`;
    }

    return `You are a trauma-informed financial coach writing a personalized analysis for a student's budget allocation report.

IMPORTANT CONTEXT: This student is working through a Financial TruPath program that addresses both financial structures AND underlying psychological patterns. Your insights should honor both dimensions.

STUDENT BEHAVIORAL PROFILE:
- Financial Satisfaction: ${satisfaction}/10 ${satisfaction < 4 ? '(very low - ready for change)' : satisfaction < 6 ? '(moderate - some concerns)' : '(relatively content)'}
- Spending Discipline: ${discipline}/10 ${discipline < 4 ? '(struggles with discipline)' : discipline > 7 ? '(strong self-control)' : '(moderate discipline)'}
- Impulse Control: ${impulse}/10 ${impulse < 4 ? '(prone to impulse spending)' : impulse > 7 ? '(good impulse control)' : '(average impulse control)'}
- Long-term Thinking: ${longTerm}/10 ${longTerm < 4 ? '(focused on present)' : longTerm > 7 ? '(future-oriented)' : '(balanced time horizon)'}
- Lifestyle Priority: ${lifestyle}/10 ${lifestyle < 4 ? '(minimal lifestyle focus)' : lifestyle > 7 ? '(values quality of life)' : '(moderate lifestyle needs)'}
- Financial Autonomy: ${autonomy}/10 ${autonomy < 4 ? '(seeks guidance)' : autonomy > 7 ? '(prefers independence)' : '(open to guidance)'}
${archetypeContext}${traumaContext}

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
- Ground EVERY insight in THEIR specific numbers, scores, AND trauma patterns - never generic advice
- Weave trauma-awareness naturally into financial guidance (do not lecture about trauma, but show understanding)
- Acknowledge tensions between their profile, allocation, and psychological patterns
- Be encouraging but honest about challenges they may face
- Connect their allocation to their healing journey where relevant
- Do NOT use markdown formatting (no **, no *, no bullets with -)
- BE CONCISE - this must fit on one PDF page

Return PLAIN TEXT ONLY in this exact format:

Overview:
(ONE paragraph, 3-4 sentences max. Connect their trauma pattern and behavioral profile to their allocation. Highlight how this allocation supports or challenges their healing journey.)

Strategic Insights:
1. [First insight connecting their pattern to a specific allocation choice - 1-2 sentences]
2. [Second insight about how their defense strategy might show up - 1-2 sentences]
3. [Third insight about an opportunity for growth through this allocation - 1-2 sentences]

Recommendation:
(2-3 sentences: The single most important focus area that addresses both their financial goal AND their psychological pattern.)`;
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
  buildComparisonSystemPrompt(preSurveyData, scenario1, scenario2, tool1Data, tool3Data) {
    const satisfaction = preSurveyData ? (preSurveyData.satisfaction || 5) : 5;
    const discipline = preSurveyData ? (preSurveyData.discipline || 5) : 5;

    // Build trauma context for comparison
    let traumaContext = '';
    const tool1Context = this.buildTool1Context(tool1Data);
    const tool3Context = this.buildTool3Context(tool3Data);

    if (tool1Context || tool3Context) {
      traumaContext = '\n\nTRAUMA-INFORMED CONTEXT:\n';

      if (tool1Context) {
        traumaContext += `Primary Defense Strategy: ${tool1Context.name} (${tool1Context.disconnection})\n`;
        traumaContext += `- Financial Pattern: ${tool1Context.financialPattern.split('.')[0]}.\n`;
        traumaContext += `- Watch For: ${tool1Context.watchFor}\n`;
      }

      if (tool3Context) {
        traumaContext += `Grounding Level: ${tool3Context.groundingLevel} (${tool3Context.overallScore}/100)\n`;
        traumaContext += `- ${tool3Context.groundingImplication}\n`;
      }

      traumaContext += '\nConsider how each scenario might interact with their psychological patterns.';
    }

    return `You are a trauma-informed financial coach helping a student compare two budget allocation scenarios.

STUDENT CONTEXT:
- Financial Satisfaction: ${satisfaction}/10
- Spending Discipline: ${discipline}/10
- Current Priority: ${preSurveyData?.selectedPriority || 'General Financial Health'}
${traumaContext}

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
- Connect to their behavioral profile AND their psychological patterns
- Consider which scenario better supports their healing journey
- Be balanced - acknowledge trade-offs of each approach
- Do NOT use markdown formatting
- BE CONCISE - keep it brief and focused

Return PLAIN TEXT ONLY in this exact format:

Synthesis:
(ONE paragraph, 4-5 sentences max. What do these differences mean for this student given their psychological patterns? Focus on the most significant trade-off and how it relates to their defense strategy.)

Decision Guidance:
(2-3 sentences. Which scenario might work better considering both their financial goals AND their healing journey?)`;
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
      LogUtils.error(`[Tool4GPT] Could not log fallback: ${e.message}`);
    }
  }
};
