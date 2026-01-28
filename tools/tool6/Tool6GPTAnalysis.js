/**
 * Tool6GPTAnalysis.js
 * GPT-powered personalized insights for Tool 6 Retirement Blueprint reports
 *
 * Single GPT call per report (blocking, not background)
 * 3-Tier Fallback: GPT → Retry → Profile-aware Fallback
 *
 * Cost: ~$0.02-0.03 per report (GPT-4o)
 * Speed: ~3-5 seconds per call
 */

const Tool6GPTAnalysis = {

  // ============================================================
  // SINGLE SCENARIO REPORT INSIGHTS
  // ============================================================

  /**
   * Generate personalized insights for Single Scenario Report PDF
   *
   * @param {Object} params - Analysis parameters
   * @returns {Object} { overview, keyObservations, focus, implementationSteps, source }
   */
  generateSingleReportInsights(params) {
    const {
      clientId,
      profile,
      allocation,
      projections,
      inputs,
      tool1Data,
      tool3Data
    } = params;

    // Validate required params
    if (!profile || !allocation) {
      Logger.log('[Tool6GPT] Missing required data for single report');
      return Tool6Fallbacks.getSingleReportFallback(profile, allocation, projections, inputs);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Tool6 GPT: Single report for ${clientId}`);

      const systemPrompt = this.buildSingleReportSystemPrompt(profile, allocation, projections, inputs, tool1Data, tool3Data);
      const userPrompt = this.buildSingleReportUserPrompt(profile, allocation, projections, inputs);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1000
      });

      const parsed = this.parseSingleReportResponse(result);

      if (this.isValidSingleInsight(parsed)) {
        Logger.log('[TIER 1] Tool6 GPT success: Single report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`[TIER 1] Tool6 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Tool6 GPT retry: Single report for ${clientId}`);

        const systemPrompt = this.buildSingleReportSystemPrompt(profile, allocation, projections, inputs, tool1Data, tool3Data);
        const userPrompt = this.buildSingleReportUserPrompt(profile, allocation, projections, inputs);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 1000
        });

        const parsed = this.parseSingleReportResponse(result);

        if (this.isValidSingleInsight(parsed)) {
          Logger.log('[TIER 2] Tool6 GPT retry success: Single report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`[TIER 2] Tool6 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Profile-aware Fallback
        // ============================================================
        Logger.log('[TIER 3] Using fallback: Single report');
        this.logFallbackUsage(clientId, 'single_report', retryError.message);

        return {
          ...Tool6Fallbacks.getSingleReportFallback(profile, allocation, projections, inputs),
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
   * @returns {Object} { synthesis, decisionGuidance, tradeoffs, source }
   */
  generateComparisonInsights(params) {
    const {
      clientId,
      scenario1,
      scenario2,
      inputs,
      tool1Data,
      tool3Data
    } = params;

    // Validate required params
    if (!scenario1 || !scenario2) {
      Logger.log('[Tool6GPT] Missing scenarios for comparison');
      return Tool6Fallbacks.getComparisonFallback(scenario1, scenario2, inputs);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Tool6 GPT: Comparison report for ${clientId}`);

      const systemPrompt = this.buildComparisonSystemPrompt(scenario1, scenario2, inputs, tool1Data, tool3Data);
      const userPrompt = this.buildComparisonUserPrompt(scenario1, scenario2);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 700
      });

      const parsed = this.parseComparisonResponse(result);

      if (this.isValidComparisonInsight(parsed)) {
        Logger.log('[TIER 1] Tool6 GPT success: Comparison report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`[TIER 1] Tool6 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Tool6 GPT retry: Comparison report for ${clientId}`);

        const systemPrompt = this.buildComparisonSystemPrompt(scenario1, scenario2, inputs, tool1Data, tool3Data);
        const userPrompt = this.buildComparisonUserPrompt(scenario1, scenario2);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 700
        });

        const parsed = this.parseComparisonResponse(result);

        if (this.isValidComparisonInsight(parsed)) {
          Logger.log('[TIER 2] Tool6 GPT retry success: Comparison report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`[TIER 2] Tool6 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Profile-aware Fallback
        // ============================================================
        Logger.log('[TIER 3] Using fallback: Comparison report');
        this.logFallbackUsage(clientId, 'comparison_report', retryError.message);

        return {
          ...Tool6Fallbacks.getComparisonFallback(scenario1, scenario2, inputs),
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

  // ============================================================
  // TRAUMA-INFORMED CONTEXT BUILDERS
  // ============================================================

  /**
   * Build rich trauma-informed context from Tool 1 data
   * Maps each trauma pattern to its retirement-specific implications
   */
  buildTool1Context(tool1Data) {
    const tool1 = tool1Data?.data;
    if (!tool1 || !tool1.winner) return null;

    const traumaRetirementContext = {
      'FSV': {
        name: 'False Self-View',
        disconnection: 'Disconnection from Self (Active)',
        coreStrategy: 'Using a mask to feel safe - attaching to negative self-views or assuming protective identities',
        retirementPattern: 'May under-save for themselves while over-providing for others. Tendency to feel undeserving of a comfortable retirement. May avoid looking at retirement numbers.',
        watchFor: 'Under-allocation to personal retirement accounts, over-prioritizing education funding for children, difficulty increasing contribution rates',
        healingDirection: 'Recognizing that building retirement security is self-care, not selfishness. Your future self deserves the same care you give others.'
      },
      'ExVal': {
        name: 'External Validation',
        disconnection: 'Disconnection from Self (Passive)',
        coreStrategy: 'Needing acceptance and recognition from others to feel safe',
        retirementPattern: 'May make retirement decisions based on what others think rather than personal needs. Compares retirement savings to peers. Seeks validation for every financial decision.',
        watchFor: 'Changing allocations based on external opinions, difficulty committing to a strategy, comparing projected balances to others',
        healingDirection: 'Building internal confidence in your retirement plan. Your financial path is unique - what matters is alignment with YOUR values and goals.'
      },
      'Showing': {
        name: 'Issues Showing Love',
        disconnection: 'Disconnection from Others (Active)',
        coreStrategy: 'Suffering or sacrificing when showing care - believing love requires pain',
        retirementPattern: 'May deprioritize own retirement to fund education or help family. Feels guilty about Roth contributions (no immediate tax benefit for others). Difficulty accepting employer match as deserved.',
        watchFor: 'Minimal allocation to retirement domains, over-funding education/529s, guilt about tax-advantaged contributions',
        healingDirection: 'Securing your retirement IS showing love - it means your family will not need to support you later. Self-care enables sustainable generosity.'
      },
      'Receiving': {
        name: 'Issues Receiving Love',
        disconnection: 'Disconnection from Others (Passive)',
        coreStrategy: 'Emotional disconnection to avoid pain - believing connection leads to hurt',
        retirementPattern: 'May hoard retirement savings for security without a clear purpose. Difficulty accepting employer match or HSA employer contributions. Isolated in retirement planning decisions.',
        watchFor: 'Over-emphasis on Freedom/Security without growth orientation, avoiding family financial discussions, resistance to advisor input',
        healingDirection: 'Learning to receive support in retirement planning. Accepting employer match is not dependency - it is wise stewardship.'
      },
      'Control': {
        name: 'Control Leading to Isolation',
        disconnection: 'Disconnection from Greater Purpose (Active)',
        coreStrategy: 'Maintaining rigid control of environment to feel safe',
        retirementPattern: 'May obsessively monitor retirement accounts. Rigid about allocation percentages. Difficulty adapting strategy as circumstances change. Analysis paralysis with vehicle selection.',
        watchFor: 'Excessive checking of balances, difficulty adjusting allocations when life changes, paralysis when market volatility occurs',
        healingDirection: 'Developing trust in your systematic approach. Having a solid retirement plan means you do not need to control every variable.'
      },
      'Fear': {
        name: 'Fear Leading to Isolation',
        disconnection: 'Disconnection from Greater Purpose (Passive)',
        coreStrategy: 'Living in constant fear with perceived loss of control - expecting the worst',
        retirementPattern: 'May under-invest due to market fears. Catastrophizes retirement scenarios. Avoids checking retirement accounts. Over-allocates to conservative vehicles despite long time horizon.',
        watchFor: 'Under-allocation to growth vehicles, excessive focus on worst-case projections, avoidance of retirement conversations',
        healingDirection: 'Building courage to invest for long-term growth. Time horizon is your greatest asset - fear-based under-investing is its own risk.'
      }
    };

    const context = traumaRetirementContext[tool1.winner];
    if (!context) return null;

    // Include secondary patterns if scores are available
    let secondaryContext = '';
    if (tool1.scores) {
      const sortedScores = Object.entries(tool1.scores)
        .filter(([key]) => key !== tool1.winner)
        .sort((a, b) => b[1] - a[1]);

      if (sortedScores.length > 0 && sortedScores[0][1] > 0) {
        const secondary = traumaRetirementContext[sortedScores[0][0]];
        if (secondary) {
          secondaryContext = `\nSecondary Pattern: ${secondary.name} - ${secondary.retirementPattern.split('.')[0]}.`;
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
   */
  buildTool3Context(tool3Data) {
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
      groundingImplication = 'Strong foundation for retirement decisions - can trust instincts and follow through on contribution commitments';
    } else if (overallScore < 50) {
      groundingLevel = 'Moderately Grounded';
      groundingImplication = 'Some disconnection patterns may interfere with retirement commitment - awareness and structure help';
    } else if (overallScore < 75) {
      groundingLevel = 'Significant Disconnection';
      groundingImplication = 'Trauma patterns likely affecting retirement behavior - allocation may need extra structure and automated contributions';
    } else {
      groundingLevel = 'Critical Disconnection';
      groundingImplication = 'Strong trauma patterns requiring compassionate, structured approach - focus on small wins and building trust in the process';
    }

    // Extract synthesis insights if available
    let overallSynthesis = '';
    if (syntheses?.overall?.overview) {
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

  // ============================================================
  // PROMPT BUILDERS - SINGLE REPORT
  // ============================================================

  /**
   * Build system prompt for Single Scenario Report
   */
  buildSingleReportSystemPrompt(profile, allocation, projections, inputs, tool1Data, tool3Data) {
    const age = inputs.age || 40;
    const yearsToRetirement = inputs.yearsToRetirement || 25;
    const income = inputs.income || 0;
    const monthlyBudget = inputs.monthlyBudget || 0;
    const investmentScore = inputs.investmentScore || 4;
    const taxPreference = inputs.taxPreference || 'Balanced';

    // Investment score interpretation
    const investmentLabels = {
      1: 'Very Conservative', 2: 'Conservative', 3: 'Moderately Conservative',
      4: 'Moderate', 5: 'Moderately Aggressive', 6: 'Aggressive', 7: 'Very Aggressive'
    };
    const investmentLabel = investmentLabels[investmentScore] || 'Moderate';

    // Build allocation string
    const allocationStr = Object.entries(allocation)
      .filter(([_, v]) => v > 0)
      .map(([vehicle, amount]) => `- ${vehicle}: $${amount.toLocaleString()}/month`)
      .join('\n');

    // Build trauma-informed context
    let traumaContext = '';
    const tool1Context = this.buildTool1Context(tool1Data);
    const tool3Context = this.buildTool3Context(tool3Data);

    if (tool1Context || tool3Context) {
      traumaContext = '\n\n===== TRAUMA-INFORMED RETIREMENT CONTEXT =====\n';
      traumaContext += 'This student is in a program focused on healing financial trauma patterns. ';
      traumaContext += 'Your insights should weave awareness of their psychological patterns into the retirement guidance.\n';

      if (tool1Context) {
        traumaContext += `\nPRIMARY DEFENSE STRATEGY (Tool 1): ${tool1Context.name}`;
        traumaContext += `\n- Type: ${tool1Context.disconnection}`;
        traumaContext += `\n- Core Pattern: ${tool1Context.coreStrategy}`;
        traumaContext += `\n- Retirement Manifestation: ${tool1Context.retirementPattern}`;
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

      traumaContext += '\n\nINTEGRATION GUIDANCE: Connect their trauma pattern to their retirement allocation choices. ';
      traumaContext += 'Help them see how their defense strategy might show up in savings behavior, and how this allocation can support their healing journey.';
    }

    // Build ambition quotient context if available
    let ambitionContext = '';
    if (inputs.domainWeights) {
      ambitionContext = '\n\nAMBITION QUOTIENT (Domain Priorities):';
      if (inputs.domainWeights.retirement) {
        ambitionContext += `\n- Retirement Weight: ${Math.round(inputs.domainWeights.retirement * 100)}%`;
      }
      if (inputs.domainWeights.education) {
        ambitionContext += `\n- Education Weight: ${Math.round(inputs.domainWeights.education * 100)}%`;
      }
      if (inputs.domainWeights.health) {
        ambitionContext += `\n- Health Weight: ${Math.round(inputs.domainWeights.health * 100)}%`;
      }
    }

    return `You are a trauma-informed retirement planning advisor writing a personalized analysis for a student's Retirement Blueprint report.

IMPORTANT CONTEXT: This student is working through a Financial TruPath program that addresses both financial structures AND underlying psychological patterns. Your insights should honor both dimensions.

STUDENT PROFILE:
- Investor Profile: ${profile.name} (${profile.description})
- Age: ${age}
- Years to Retirement: ${yearsToRetirement}
- Gross Annual Income: $${income.toLocaleString()}
- Monthly Retirement Budget: $${monthlyBudget.toLocaleString()}
- Savings Rate: ${income > 0 ? Math.round((monthlyBudget * 12 / income) * 100) : 0}%
- Investment Risk Score: ${investmentScore}/7 (${investmentLabel})
- Tax Strategy Preference: ${taxPreference}
${ambitionContext}${traumaContext}

CURRENT ALLOCATION:
${allocationStr || 'No allocation data'}

PROJECTIONS:
- Projected Balance at Retirement: $${projections?.projectedBalance?.toLocaleString() || 0}
- Inflation-Adjusted Value: $${projections?.inflationAdjusted?.toLocaleString() || 0}
- Tax-Free Percentage: ${projections?.taxFreePercent || 0}%
- Monthly Retirement Income (4% rule): $${projections?.monthlyRetirementIncome?.toLocaleString() || 0}

WRITING GUIDELINES:
- Write as if speaking directly to the student (use "you" and "your")
- Ground EVERY insight in THEIR specific numbers, profile, AND trauma patterns - never generic advice
- Weave trauma-awareness naturally into retirement guidance (do not lecture about trauma, but show understanding)
- Acknowledge tensions between their profile, allocation, and psychological patterns
- Be encouraging but honest about challenges they may face
- Connect their allocation to their healing journey where relevant
- Do NOT use markdown formatting (no **, no *, no bullets with -)
- BE CONCISE - this must fit on a PDF

Return PLAIN TEXT ONLY in this exact format:

Overview:
(ONE paragraph, 4-5 sentences max. Connect their trauma pattern, investor profile, and ambition quotient to their allocation. Highlight how this retirement blueprint supports or challenges their healing journey.)

Key Observations:
1. [First insight about why this investor profile fits them and what it means for their strategy - 2-3 sentences]
2. [Second insight about how their priorities and ambition quotient shaped this allocation - 2-3 sentences]
3. [Third insight about their tax strategy choice and how it aligns with their situation - 2-3 sentences]

Your Focus:
(2-3 sentences: The single most important focus area that addresses both their retirement goal AND their psychological pattern. What should they pay attention to?)

Implementation Steps:
This Week:
1. [Specific action they can take immediately - 1 sentence]
2. [Second immediate action - 1 sentence]

30 Days:
1. [Action for the first month - 1 sentence]
2. [Second 30-day action - 1 sentence]`;
  },

  /**
   * Build user prompt for Single Scenario Report
   */
  buildSingleReportUserPrompt(profile, allocation, projections, inputs) {
    let prompt = 'Please analyze this student\'s retirement allocation and provide personalized insights for their Retirement Blueprint report.\n\n';

    // Add profile-specific context
    prompt += `PROFILE CHARACTERISTICS:\n`;
    if (profile.characteristics) {
      profile.characteristics.forEach(c => {
        prompt += `- ${c}\n`;
      });
    }
    prompt += '\n';

    // Add education context if applicable
    if (inputs.hasChildren && inputs.numChildren > 0) {
      prompt += `EDUCATION PLANNING:\n`;
      prompt += `- Number of Children: ${inputs.numChildren}\n`;
      prompt += `- Years to Education: ${inputs.yearsToEducation || 'Not specified'}\n`;
      prompt += `- Education Vehicle: ${inputs.educationVehicle || '529 Plan'}\n\n`;
    }

    // Add employer match context if applicable
    if (inputs.hasEmployerMatch && inputs.employerMatchAmount > 0) {
      prompt += `EMPLOYER MATCH:\n`;
      prompt += `- Monthly Match Amount: $${inputs.employerMatchAmount.toLocaleString()}\n`;
      prompt += `- This is FREE money - always capture the full match!\n\n`;
    }

    prompt += 'Based on all this information, provide personalized insights for their Retirement Blueprint report.';

    return prompt;
  },

  // ============================================================
  // PROMPT BUILDERS - COMPARISON REPORT
  // ============================================================

  /**
   * Build system prompt for Comparison Report
   */
  buildComparisonSystemPrompt(scenario1, scenario2, inputs, tool1Data, tool3Data) {
    // Build trauma context (abbreviated for comparison)
    let traumaContext = '';
    const tool1Context = this.buildTool1Context(tool1Data);

    if (tool1Context) {
      traumaContext = `\n\nTRAUMA CONTEXT: ${tool1Context.name} pattern`;
      traumaContext += `\n- Watch for: ${tool1Context.watchFor}`;
      traumaContext += `\n- Growth direction: ${tool1Context.healingDirection}`;
    }

    return `You are comparing two retirement scenarios for a student in a trauma-informed financial program.
${traumaContext}

SCENARIO A: "${scenario1.name}"
- Profile: ${scenario1.profileName || 'Unknown'}
- Monthly Budget: $${scenario1.monthlyBudget?.toLocaleString() || 0}
- Tax Strategy: ${scenario1.taxPreference || 'Balanced'}
- Projected Balance: $${scenario1.projectedBalance?.toLocaleString() || 0}
- Tax-Free %: ${scenario1.taxFreePercent || 0}%
- Monthly Retirement Income: $${scenario1.monthlyRetirementIncome?.toLocaleString() || 0}

SCENARIO B: "${scenario2.name}"
- Profile: ${scenario2.profileName || 'Unknown'}
- Monthly Budget: $${scenario2.monthlyBudget?.toLocaleString() || 0}
- Tax Strategy: ${scenario2.taxPreference || 'Balanced'}
- Projected Balance: $${scenario2.projectedBalance?.toLocaleString() || 0}
- Tax-Free %: ${scenario2.taxFreePercent || 0}%
- Monthly Retirement Income: $${scenario2.monthlyRetirementIncome?.toLocaleString() || 0}

KEY DIFFERENCES:
- Balance Difference: $${Math.abs((scenario1.projectedBalance || 0) - (scenario2.projectedBalance || 0)).toLocaleString()}
- Tax-Free Difference: ${Math.abs((scenario1.taxFreePercent || 0) - (scenario2.taxFreePercent || 0))}%
- Monthly Income Difference: $${Math.abs((scenario1.monthlyRetirementIncome || 0) - (scenario2.monthlyRetirementIncome || 0)).toLocaleString()}

WRITING GUIDELINES:
- Write as if speaking directly to the student
- Reference specific numbers from BOTH scenarios
- Consider psychological patterns in your guidance
- Be clear about trade-offs without being prescriptive
- Do NOT use markdown formatting
- BE CONCISE

Return PLAIN TEXT ONLY in this exact format:

Synthesis:
(ONE paragraph explaining the key differences between these scenarios and what drives those differences. 4-5 sentences.)

Decision Guidance:
(2-3 sentences on which scenario might work better for this student and why, considering both financial and psychological factors. Do not make the decision for them - help them understand the trade-offs.)

Key Trade-offs:
1. [First major trade-off to consider - 1-2 sentences]
2. [Second trade-off - 1-2 sentences]
3. [Third trade-off - 1-2 sentences]`;
  },

  /**
   * Build user prompt for Comparison Report
   */
  buildComparisonUserPrompt(scenario1, scenario2) {
    let prompt = 'Please compare these two retirement scenarios and provide insights to help the student make a decision.\n\n';

    prompt += `SCENARIO A ALLOCATION:\n`;
    if (scenario1.allocation) {
      Object.entries(scenario1.allocation)
        .filter(([_, v]) => v > 0)
        .forEach(([vehicle, amount]) => {
          prompt += `- ${vehicle}: $${amount.toLocaleString()}/month\n`;
        });
    }

    prompt += `\nSCENARIO B ALLOCATION:\n`;
    if (scenario2.allocation) {
      Object.entries(scenario2.allocation)
        .filter(([_, v]) => v > 0)
        .forEach(([vehicle, amount]) => {
          prompt += `- ${vehicle}: $${amount.toLocaleString()}/month\n`;
        });
    }

    prompt += '\nHelp the student understand the implications of each scenario.';

    return prompt;
  },

  // ============================================================
  // RESPONSE PARSERS
  // ============================================================

  /**
   * Parse Single Report GPT response
   */
  parseSingleReportResponse(text) {
    return {
      overview: this.extractSection(text, 'Overview:'),
      keyObservations: this.extractNumberedList(text, 'Key Observations:'),
      focus: this.extractSection(text, 'Your Focus:'),
      implementationSteps: {
        thisWeek: this.extractNumberedListFromSection(text, 'This Week:'),
        thirtyDays: this.extractNumberedListFromSection(text, '30 Days:')
      }
    };
  },

  /**
   * Parse Comparison Report GPT response
   */
  parseComparisonResponse(text) {
    return {
      synthesis: this.extractSection(text, 'Synthesis:'),
      decisionGuidance: this.extractSection(text, 'Decision Guidance:'),
      tradeoffs: this.extractNumberedList(text, 'Key Trade-offs:')
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

  /**
   * Extract numbered list from a subsection (like "This Week:")
   */
  extractNumberedListFromSection(text, sectionName) {
    // Find the section and extract numbered items that follow
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedName + '\\s*([\\s\\S]*?)(?=\\n[A-Z][a-z\\s]*:|$)', 'i');
    const match = text.match(regex);

    if (!match) return ['Action not available'];

    const sectionText = match[1];
    const lines = sectionText.split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    return lines.length > 0 ? lines : ['Action not available'];
  },

  // ============================================================
  // VALIDATORS
  // ============================================================

  /**
   * Validate Single Report insight completeness
   */
  isValidSingleInsight(insight) {
    return (
      insight &&
      insight.overview && insight.overview.length > 50 &&
      insight.keyObservations && insight.keyObservations.length >= 1 &&
      insight.focus && insight.focus.length > 30
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
  // SPRINT 13: ENHANCED REPORT INSIGHTS (Implementation Blueprint)
  // ============================================================

  /**
   * Generate personalized implementation guidance for enhanced report
   * Provides vehicle setup guidance, milestone insights, action plan, calendar reminders, gap analysis
   *
   * 3-Tier: GPT → Retry → Fallback
   *
   * @param {Object} params - { clientId, profile, allocations, userInputs, projections, tool1Data, tool3Data }
   * @returns {Object} { vehicleGuidance, milestoneInsights, actionPlan, calendarReminders, gapAnalysis, source }
   */
  generateEnhancedReportInsights(params) {
    const {
      clientId,
      profile,
      allocations,
      userInputs,
      projections,
      tool1Data,
      tool3Data
    } = params;

    // Validate required params
    if (!profile || !allocations || Object.keys(allocations).length === 0) {
      Logger.log('[Tool6GPT] Missing required data for enhanced report');
      return Tool6Fallbacks.getEnhancedReportFallback(profile, allocations, userInputs, projections);
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Tool6 GPT: Enhanced report for ${clientId}`);

      const systemPrompt = this.buildEnhancedReportSystemPrompt(profile, allocations, userInputs, projections, tool1Data, tool3Data);
      const userPrompt = this.buildEnhancedReportUserPrompt(profile, allocations, userInputs, projections);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1500  // Larger for comprehensive guidance
      });

      const parsed = this.parseEnhancedReportResponse(result);

      if (this.isValidEnhancedInsight(parsed)) {
        Logger.log('[TIER 1] Tool6 GPT success: Enhanced report');
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`[TIER 1] Tool6 GPT failed: ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Tool6 GPT retry: Enhanced report for ${clientId}`);

        const systemPrompt = this.buildEnhancedReportSystemPrompt(profile, allocations, userInputs, projections, tool1Data, tool3Data);
        const userPrompt = this.buildEnhancedReportUserPrompt(profile, allocations, userInputs, projections);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 1500
        });

        const parsed = this.parseEnhancedReportResponse(result);

        if (this.isValidEnhancedInsight(parsed)) {
          Logger.log('[TIER 2] Tool6 GPT retry success: Enhanced report');
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`[TIER 2] Tool6 GPT retry failed: ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Profile-aware Fallback
        // ============================================================
        Logger.log('[TIER 3] Using fallback: Enhanced report');
        this.logFallbackUsage(clientId, 'enhanced_report', retryError.message);

        return {
          ...Tool6Fallbacks.getEnhancedReportFallback(profile, allocations, userInputs, projections),
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

  /**
   * Build system prompt for Enhanced Report
   */
  buildEnhancedReportSystemPrompt(profile, allocations, userInputs, projections, tool1Data, tool3Data) {
    const age = userInputs?.age || 40;
    const yearsToRetirement = userInputs?.yearsToRetirement || 25;
    const grossIncome = userInputs?.income || userInputs?.grossIncome || 0;
    const monthlyBudget = userInputs?.monthlyBudget || 0;
    const filingStatus = userInputs?.filingStatus || 'Single';
    const taxStrategy = userInputs?.taxPreference || 'Balanced';

    // Build allocation list
    const allocationList = Object.entries(allocations)
      .filter(([_, amount]) => amount > 0)
      .map(([vehicle, amount]) => `- ${vehicle}: $${amount.toLocaleString()}/month ($${(amount * 12).toLocaleString()}/year)`)
      .join('\n');

    // Savings rate
    const savingsRate = grossIncome > 0 ? Math.round((monthlyBudget * 12 / grossIncome) * 100) : 0;

    // Build trauma context if available
    let traumaContext = '';
    if (tool1Data?.data?.winner) {
      const traumaTypes = {
        'FSV': 'False Self-View - may take on excessive obligations to prove worth',
        'ExVal': 'External Validation - may seek approval for financial decisions',
        'Showing': 'Issues Showing Love - may over-give financially while neglecting self',
        'Receiving': 'Issues Receiving Love - may hoard money for safety',
        'Control': 'Control Leading to Isolation - may obsessively track every penny',
        'Fear': 'Fear Leading to Isolation - may catastrophize financial situations'
      };
      traumaContext = `\nPrimary Defense Pattern: ${traumaTypes[tool1Data.data.winner] || tool1Data.data.winner}`;
    }

    if (tool3Data?.data?.scoring?.overallQuotient) {
      const score = tool3Data.data.scoring.overallQuotient;
      const level = score < 25 ? 'Well-Grounded' : score < 50 ? 'Moderately Grounded' : score < 75 ? 'Significant Disconnection' : 'Critical Disconnection';
      traumaContext += `\nGrounding Level: ${level} (${Math.round(score)}/100)`;
    }

    return `You are a trauma-informed retirement planning expert creating a personalized implementation blueprint.

IMPORTANT: This is for a student in the TruPath Financial program. Be specific, actionable, and reference their exact numbers.

STUDENT PROFILE:
- Investor Profile: ${profile?.name || 'Foundation Builder'}
- Age: ${age}
- Years to Retirement: ${yearsToRetirement}
- Gross Income: $${grossIncome.toLocaleString()}/year
- Filing Status: ${filingStatus}
- Monthly Budget: $${monthlyBudget.toLocaleString()}
- Current Savings Rate: ${savingsRate}%
- Tax Strategy: ${taxStrategy}
${traumaContext}

THEIR ALLOCATION:
${allocationList}

PROJECTIONS:
- Projected Balance at Retirement: $${(projections?.projectedBalance || projections?.balance || 0).toLocaleString()}
- Inflation-Adjusted Value: $${(projections?.inflationAdjusted || 0).toLocaleString()}
- Monthly Retirement Income (4% rule): $${(projections?.monthlyRetirementIncome || projections?.monthlyIncome || 0).toLocaleString()}

WRITING GUIDELINES:
- Use THEIR exact numbers and vehicle names
- Be specific: "Log into Equity Trust" not "Log into your brokerage"
- For self-directed accounts, use Equity Trust as the provider
- Connect advice to their psychological patterns where relevant
- Do NOT use markdown formatting (no **, no *, no bullets with -)
- Be actionable and concrete with specific dollar amounts

Return PLAIN TEXT ONLY in this exact format:

Vehicle Guidance:
(2-3 sentences per vehicle in their allocation. Prioritize which to set up first and why. Include specific tips for their situation.)

Milestone Insights:
(3-4 sentences explaining what key ages mean for THIS person specifically. Reference their timeline and projected balances.)

Action Plan:
Immediate: (2 specific actions with their dollar amounts - what to do TODAY)
Week 1: (2 specific actions for setting up accounts)
Month 1: (2 specific actions for verifying contributions)
Quarterly: (1-2 ongoing review actions)
Annual: (1-2 annual review actions)

Calendar Reminders:
(3-4 most important deadlines for their specific vehicles. Be specific about dates and what action to take.)

Gap Analysis:
(2-3 sentences on their savings rate vs recommended 15-20%. If behind, give specific catch-up recommendation with dollar amounts. If on track, acknowledge and suggest optimization.)`;
  },

  /**
   * Build user prompt for Enhanced Report
   */
  buildEnhancedReportUserPrompt(profile, allocations, userInputs, projections) {
    let prompt = 'Please create personalized implementation guidance for this student.\n\n';

    // Add vehicle details
    prompt += 'VEHICLES IN THEIR PLAN:\n';
    Object.entries(allocations)
      .filter(([_, amount]) => amount > 0)
      .forEach(([vehicle, amount]) => {
        prompt += `- ${vehicle}: $${amount}/month\n`;
      });
    prompt += '\n';

    // Add any special situations
    if (userInputs?.a13b_tradIRABalance && userInputs.a13b_tradIRABalance !== 'none') {
      prompt += 'NOTE: Student has existing Traditional IRA balance - pro-rata rule applies to Backdoor Roth.\n';
    }

    if (userInputs?.workSituation === 'Self-employed' || userInputs?.workSituation === 'Both') {
      prompt += 'NOTE: Student is self-employed - consider SEP-IRA and Solo 401(k) deadlines.\n';
    }

    prompt += '\nProvide specific, actionable guidance they can follow immediately.';

    return prompt;
  },

  /**
   * Parse Enhanced Report GPT response
   */
  parseEnhancedReportResponse(text) {
    return {
      vehicleGuidance: this.extractSection(text, 'Vehicle Guidance:'),
      milestoneInsights: this.extractSection(text, 'Milestone Insights:'),
      actionPlan: this.extractActionPlanSections(text),
      calendarReminders: this.extractSection(text, 'Calendar Reminders:'),
      gapAnalysis: this.extractSection(text, 'Gap Analysis:')
    };
  },

  /**
   * Extract 5-tier action plan from response
   */
  extractActionPlanSections(text) {
    const actionPlanSection = this.extractSection(text, 'Action Plan:');

    return {
      immediate: this.extractActionItems(actionPlanSection, 'Immediate:'),
      week1: this.extractActionItems(actionPlanSection, 'Week 1:'),
      month1: this.extractActionItems(actionPlanSection, 'Month 1:'),
      quarterly: this.extractActionItems(actionPlanSection, 'Quarterly:'),
      annual: this.extractActionItems(actionPlanSection, 'Annual:')
    };
  },

  /**
   * Extract action items from a subsection
   */
  extractActionItems(text, sectionName) {
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedName + '\\s*([\\s\\S]*?)(?=\\n[A-Z][a-z\\s]*:|$)', 'i');
    const match = text.match(regex);

    if (!match) return null;

    const sectionText = match[1].trim();

    // Try to extract numbered items or sentences
    const numberedItems = sectionText.split('\n')
      .filter(line => line.trim().match(/^\d+\.|^-/))
      .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
      .filter(line => line.length > 5);

    if (numberedItems.length > 0) return numberedItems;

    // If no numbered items, split on periods and take first 2 sentences
    const sentences = sectionText.split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 2);

    return sentences.length > 0 ? sentences : null;
  },

  /**
   * Validate Enhanced Report insight completeness
   */
  isValidEnhancedInsight(insight) {
    return (
      insight &&
      insight.vehicleGuidance && insight.vehicleGuidance.length > 50 &&
      insight.actionPlan && (insight.actionPlan.immediate || insight.actionPlan.week1) &&
      insight.gapAnalysis && insight.gapAnalysis.length > 30
    );
  },

  // ============================================================
  // UTILITIES
  // ============================================================

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
        'tool6',
        reportType,
        errorMessage
      ]);
    } catch (e) {
      Logger.log(`[Tool6GPT] Could not log fallback: ${e.message}`);
    }
  }
};
