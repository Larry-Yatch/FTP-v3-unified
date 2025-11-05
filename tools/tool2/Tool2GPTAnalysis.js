/**
 * Tool2GPTAnalysis.js
 * GPT-powered analysis for Tool 2 free-text responses
 * Implements 3-tier fallback: GPT → Retry → Hard-coded Fallback
 *
 * Architecture:
 * - Background processing during form (8 calls async)
 * - Final synthesis at submission (1 call sync)
 * - Cost: ~$0.023 per student
 * - Speed: ~3 second user wait time
 * - Reliability: 100% via fallback system
 */

const Tool2GPTAnalysis = {

  /**
   * Analyze response with automatic 3-tier fallback
   * @param {object} params - Analysis parameters
   * @returns {object} Insight with source attribution
   */
  analyzeResponse({clientId, responseType, responseText, previousInsights, formData, domainScores}) {
    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Attempting GPT: ${clientId} - ${responseType}`);

      const systemPrompt = this.getPromptForType(responseType, previousInsights);
      const userPrompt = this.buildUserPrompt(responseText, previousInsights);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 300
      });

      const parsed = this.parseResponse(result);

      if (this.isValidInsight(parsed)) {
        Logger.log(`✅ [TIER 1] GPT success: ${responseType}`);
        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`⚠️ [TIER 1] GPT failed: ${responseType} - ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);  // Wait 2 seconds before retry
        Logger.log(`[TIER 2] Retrying GPT: ${clientId} - ${responseType}`);

        const systemPrompt = this.getPromptForType(responseType, previousInsights);
        const userPrompt = this.buildUserPrompt(responseText, previousInsights);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o-mini',
          temperature: 0.2,
          maxTokens: 300
        });

        const parsed = this.parseResponse(result);

        if (this.isValidInsight(parsed)) {
          Logger.log(`✅ [TIER 2] GPT retry success: ${responseType}`);
          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`❌ [TIER 2] GPT retry failed: ${responseType} - ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Hard-coded Fallback
        // ============================================================
        Logger.log(`[TIER 3] Using fallback: ${responseType}`);

        const fallback = Tool2Fallbacks.getFallbackInsight(
          responseType,
          formData,
          domainScores
        );

        this.logFallbackUsage(clientId, responseType, retryError.message);

        return {
          ...fallback,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        };
      }
    }
  },

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

  /**
   * Parse plain-text GPT response
   */
  parseResponse(text) {
    return {
      pattern: this.extractSection(text, 'Pattern:'),
      insight: this.extractSection(text, 'Insight:'),
      action: this.extractSection(text, 'Action:')
    };
  },

  /**
   * Extract section from plain-text response
   */
  extractSection(text, sectionName) {
    const regex = new RegExp(
      sectionName + '\\s*([\\s\\S]*?)(?=\\n\\n[A-Z][a-z]+:|$)',
      'i'
    );
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  },

  /**
   * Validate insight completeness
   */
  isValidInsight(insight) {
    return (
      insight &&
      insight.pattern && insight.pattern.length > 10 &&
      insight.insight && insight.insight.length > 10 &&
      insight.action && insight.action.length > 10
    );
  },

  /**
   * Get system prompt for response type
   */
  getPromptForType(responseType, previousInsights) {
    const prompts = {
      income_sources: this.getIncomeSourcesPrompt(previousInsights),
      major_expenses: this.getMajorExpensesPrompt(previousInsights),
      wasteful_spending: this.getWastefulSpendingPrompt(previousInsights),
      debt_list: this.getDebtListPrompt(previousInsights),
      investments: this.getInvestmentsPrompt(previousInsights),
      emotions: this.getEmotionsPrompt(previousInsights),
      adaptive_trauma: this.getAdaptiveTraumaPrompt(previousInsights)
    };

    return prompts[responseType] || this.getGenericPrompt();
  },

  /**
   * Build user prompt with context
   */
  buildUserPrompt(responseText, previousInsights) {
    let prompt = '';

    // Add previous insights as context (if available)
    if (previousInsights && Object.keys(previousInsights).length > 0) {
      prompt += 'Previous Financial Insights:\n';
      Object.entries(previousInsights).forEach(([key, insight]) => {
        if (insight.pattern) {
          prompt += `- ${key}: ${insight.pattern}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `Student's Response:\n"${responseText}"`;

    return prompt;
  },

  // ============================================================
  // PROMPT FUNCTIONS - One for each response type
  // ============================================================

  /**
   * Income sources prompt (Q18)
   */
  getIncomeSourcesPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's income sources.

**CRITICAL**: Reference the student's exact words and specific examples from
their response. Ground your insights in what THEY said, not generic advice.

Analyze their response for:
1. Pattern: What pattern emerges from their specific income sources?
2. Insight: What does this reveal about their income clarity and stability?
3. Action: One concrete step based on THEIR situation (not generic advice)

Consider:
- Number of income sources (diversification vs simplicity)
- Predictability and consistency
- Clarity about amounts and timing
- Active vs passive income mix

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)
    `.trim();
  },

  /**
   * Major expenses prompt (Q23)
   */
  getMajorExpensesPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's major expense categories.

**CRITICAL**: Reference the student's exact words and specific examples.
Ground your insights in what THEY said, not generic budgeting advice.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Build upon their income insights to understand the full money flow picture.' : ''}

Analyze their response for:
1. Pattern: What pattern emerges from their expense structure?
2. Insight: What does this reveal about their spending clarity and priorities?
3. Action: One concrete step based on THEIR situation

Consider:
- Fixed vs variable expense ratio
- Alignment between expenses and stated values
- Clarity about where money actually goes
- Opportunities for intentional optimization

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)
    `.trim();
  },

  /**
   * Wasteful spending prompt (Q24)
   */
  getWastefulSpendingPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's wasteful spending patterns.

**CRITICAL**: Reference the student's exact words. This is about THEIR specific
triggers and patterns, not generic advice about cutting lattes.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Connect this to their income and expense patterns already identified.' : ''}

Analyze their response for:
1. Pattern: What specific wasteful spending pattern do they identify?
2. Insight: What emotional or situational trigger underlies this pattern?
3. Action: One concrete step to address THEIR specific trigger

Consider:
- Emotional triggers (boredom, stress, celebration)
- Situational triggers (location, time of day, people)
- The function this spending serves (what need does it meet?)
- Opportunities to meet that need differently

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what drives this pattern)

Action:
(One specific, actionable step to address their trigger)
    `.trim();
  },

  /**
   * Debt list prompt (Q29)
   */
  getDebtListPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's debt situation.

**CRITICAL**: Reference the student's exact words about their specific debts.
This is about THEIR obligations, not generic debt payoff advice.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Connect debt obligations to their income and spending patterns.' : ''}

Analyze their response for:
1. Pattern: What pattern emerges from their debt structure?
2. Insight: What does this reveal about their obligations clarity and strategy?
3. Action: One concrete step based on THEIR specific debt situation

Consider:
- Types of debt (student loans, credit cards, mortgage, etc.)
- Clarity about balances, rates, and terms
- Emotional weight of debt (stress, avoidance, empowerment)
- Strategic opportunities (highest rate, smallest balance, refinancing)

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)
    `.trim();
  },

  /**
   * Investments prompt (Q43)
   */
  getInvestmentsPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's investment strategy.

**CRITICAL**: Reference the student's exact words about their specific investments.
This is about THEIR growth strategy, not generic investment advice.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Connect investment strategy to their overall financial foundation.' : ''}

Analyze their response for:
1. Pattern: What pattern emerges from their investment approach?
2. Insight: What does this reveal about their growth clarity and confidence?
3. Action: One concrete step based on THEIR specific investment situation

Consider:
- Level of engagement (active, passive, avoiding)
- Clarity about what they own and why
- Alignment between investments and goals/timeline
- Confidence vs confusion about strategy

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means for their financial clarity)

Action:
(One specific, actionable step based on their situation)
    `.trim();
  },

  /**
   * Emotions prompt (Q52)
   */
  getEmotionsPrompt(previousInsights) {
    return `
You are a financial clarity expert analyzing a student's emotional relationship with financial review.

**CRITICAL**: Reference the student's exact words about their specific emotions.
Honor whatever they shared without judgment.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Connect their emotions to the patterns you\'ve identified across domains.' : ''}

Analyze their response for:
1. Pattern: What emotional pattern emerges when they review their finances?
2. Insight: What does this emotion reveal about their money story or beliefs?
3. Action: One concrete step to shift this emotional pattern

Consider:
- Specific emotions named (anxiety, overwhelm, shame, hope, etc.)
- Whether emotion drives avoidance or compulsive checking
- What the emotion is protecting them from feeling
- How this emotion connects to their financial behaviors

Return plain-text only:

Pattern:
(One sentence identifying the emotional pattern)

Insight:
(One sentence about what this emotion reveals or protects)

Action:
(One specific, actionable step to work with this emotion)
    `.trim();
  },

  /**
   * Adaptive trauma prompt (Q55/Q56 - varies by trauma type)
   */
  getAdaptiveTraumaPrompt(previousInsights) {
    return `
You are a financial trauma expert analyzing a student's adaptive trauma response.

**CRITICAL**: This is their most vulnerable share. Reference their exact words
with care and respect. This is about THEIR specific trauma pattern, not generic advice.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Connect this trauma pattern to all the financial behaviors you\'ve identified.' : ''}

Analyze their response for:
1. Pattern: What specific trauma-driven pattern do they describe?
2. Insight: What is this pattern protecting them from or helping them avoid?
3. Action: One gentle, trauma-informed step to begin shifting this pattern

Consider:
- The protective function of this pattern (what did it help them survive?)
- How this pattern shows up across their financial life
- The cost of continuing this pattern vs the risk of changing it
- A safe, small step that honors their pace

**Trauma-informed approach:**
- Validate the pattern as adaptive (it helped at one time)
- Acknowledge the courage it takes to recognize and shift it
- Offer small, safe actions (not dramatic changes)
- Connect to self-compassion and worthiness

Return plain-text only:

Pattern:
(One sentence identifying the trauma pattern with compassion)

Insight:
(One sentence about what this pattern protected them from)

Action:
(One gentle, specific step to begin healing this pattern)
    `.trim();
  },

  /**
   * Generic prompt (fallback if type not found)
   */
  getGenericPrompt() {
    return `
You are a financial clarity expert analyzing a student's response.

Analyze their response for:
1. Pattern: What pattern emerges from their response?
2. Insight: What does this reveal about their financial clarity?
3. Action: One concrete step based on their situation

Return plain-text only:

Pattern:
(One sentence identifying the key pattern)

Insight:
(One sentence about what this means)

Action:
(One specific, actionable step)
    `.trim();
  },

  // ============================================================
  // SYNTHESIS FUNCTION
  // ============================================================

  /**
   * Synthesize overall insights from all individual analyses
   */
  synthesizeOverall(clientId, allInsights, domainScores) {
    const systemPrompt = `
You are synthesizing a comprehensive Financial Clarity report for a student.

Domain Scores (0-100%):
- Money Flow: ${domainScores.moneyFlow}%
- Obligations: ${domainScores.obligations}%
- Liquidity: ${domainScores.liquidity}%
- Growth: ${domainScores.growth}%
- Protection: ${domainScores.protection}%

Individual Insights:
${JSON.stringify(allInsights, null, 2)}

Create a cohesive narrative that:
- Connects numeric scores to personal stories
- Identifies top 2-3 patterns across domains
- Provides 3-5 prioritized actions
- References specific examples from their responses

Return plain-text only:

Overview:
(2-3 paragraphs connecting scores to stories and identifying key themes)

Top Patterns:
- Pattern 1: [Most significant pattern across domains]
- Pattern 2: [Secondary pattern or reinforcing behavior]
- Pattern 3: [Opportunity or strength to leverage]

Priority Actions:
1. [Action based on lowest domain score - specific to their situation]
2. [Action based on most impactful pattern - references their examples]
3. [Action for building momentum - leverages their strengths]
4. [Action for emotional/psychological support - addresses feelings they shared]
5. [Action for long-term transformation - connects to their values]

STOP after Priority Actions. Do not add conclusions or additional text.
    `.trim();

    const userPrompt = 'Synthesize the above insights into a cohesive report.';

    try {
      Logger.log(`[SYNTHESIS] Running overall synthesis for ${clientId}`);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',  // Use better model for synthesis
        temperature: 0.3,
        maxTokens: 600
      });

      const parsed = this.parseSynthesis(result);

      Logger.log(`✅ [SYNTHESIS] Synthesis success for ${clientId}`);

      return {
        ...parsed,
        source: 'gpt',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      Logger.log(`❌ [SYNTHESIS] Failed: ${error.message}, using fallback`);
      return this.getGenericSynthesis(domainScores);
    }
  },

  /**
   * Parse synthesis response
   */
  parseSynthesis(text) {
    return {
      overview: this.extractSection(text, 'Overview:'),
      topPatterns: this.extractSection(text, 'Top Patterns:'),
      priorityActions: this.extractSection(text, 'Priority Actions:')
    };
  },

  /**
   * Generic synthesis fallback
   */
  getGenericSynthesis(domainScores) {
    const lowest = this.findLowestDomain(domainScores);
    const highest = this.findHighestDomain(domainScores);

    return {
      overview: `Your financial clarity assessment reveals varying levels of understanding across five key domains. Your strongest area is ${highest} (${domainScores[this.domainKeyFromName(highest)]}%) while ${lowest} (${domainScores[this.domainKeyFromName(lowest)]}%) presents the greatest opportunity for growth. Building clarity in these areas will support more confident financial decision-making and reduced stress.`,
      topPatterns: '- Opportunities exist to strengthen awareness in multiple domains\n- Building systematic tracking habits would benefit overall clarity\n- Connecting financial behaviors to underlying goals and values could increase motivation',
      priorityActions: `1. Focus on strengthening ${lowest} clarity first - this domain will have the most immediate impact\n2. Set up a monthly 15-minute financial review ritual to build awareness consistently\n3. Track one key metric in your weakest domain for the next 30 days\n4. Identify one emotional trigger around money and create a grounding practice\n5. Connect with a trusted person about your financial goals for accountability and support`
    };
  },

  findLowestDomain(scores) {
    const domainNames = {
      moneyFlow: 'Money Flow',
      obligations: 'Obligations',
      liquidity: 'Liquidity',
      growth: 'Growth',
      protection: 'Protection'
    };

    let lowest = 'Money Flow';
    let lowestScore = 100;

    Object.entries(scores).forEach(([key, score]) => {
      if (score < lowestScore) {
        lowestScore = score;
        lowest = domainNames[key] || key;
      }
    });

    return lowest;
  },

  findHighestDomain(scores) {
    const domainNames = {
      moneyFlow: 'Money Flow',
      obligations: 'Obligations',
      liquidity: 'Liquidity',
      growth: 'Growth',
      protection: 'Protection'
    };

    let highest = 'Protection';
    let highestScore = 0;

    Object.entries(scores).forEach(([key, score]) => {
      if (score > highestScore) {
        highestScore = score;
        highest = domainNames[key] || key;
      }
    });

    return highest;
  },

  domainKeyFromName(name) {
    const mapping = {
      'Money Flow': 'moneyFlow',
      'Obligations': 'obligations',
      'Liquidity': 'liquidity',
      'Growth': 'growth',
      'Protection': 'protection'
    };
    return mapping[name] || 'moneyFlow';
  },

  // ============================================================
  // MONITORING & LOGGING
  // ============================================================

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage(clientId, responseType, error) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      let logSheet = ss.getSheetByName('GPT_FALLBACK_LOG');

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
      Logger.log(`Failed to log fallback usage: ${logError.message}`);
    }
  }
};
