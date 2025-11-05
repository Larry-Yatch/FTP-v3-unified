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
  analyzeResponse({clientId, responseType, responseText, previousInsights, formData, domainScores, traumaData}) {
    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Attempting GPT: ${clientId} - ${responseType}`);

      const systemPrompt = this.getPromptForType(responseType, previousInsights, traumaData);
      const userPrompt = this.buildUserPrompt(responseText, previousInsights, traumaData);

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
          domainScores,
          traumaData  // NEW: Pass trauma data to fallbacks
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
  getPromptForType(responseType, previousInsights, traumaData) {
    const prompts = {
      income_sources: this.getIncomeSourcesPrompt(previousInsights, traumaData),
      major_expenses: this.getMajorExpensesPrompt(previousInsights, traumaData),
      wasteful_spending: this.getWastefulSpendingPrompt(previousInsights, traumaData),
      debt_list: this.getDebtListPrompt(previousInsights, traumaData),
      investments: this.getInvestmentsPrompt(previousInsights, traumaData),
      emotions: this.getEmotionsPrompt(previousInsights, traumaData),
      adaptive_trauma: this.getAdaptiveTraumaPrompt(previousInsights, traumaData)
    };

    return prompts[responseType] || this.getGenericPrompt();
  },

  /**
   * Build user prompt with context
   */
  buildUserPrompt(responseText, previousInsights, traumaData) {
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
  // TRAUMA CONTEXT HELPER
  // ============================================================
  
  /**
   * Get trauma-specific context for prompts
   */
  getTraumaContext(traumaData) {
    if (!traumaData || !traumaData.topTrauma) {
      return '';
    }
    
    const contexts = {
      FSV: `This person uses False Self-View as protection, often hiding their true financial situation. They may minimize successes or exaggerate struggles. Look for patterns of self-deprecation, identity masks, or downplaying their true financial reality.`,
      
      Control: `This person seeks control to manage anxiety. They may over-detail finances or show rigidity. Look for perfectionism, micromanagement, overwhelm from too many details, or catastrophizing about losing control.`,
      
      ExVal: `This person seeks external validation for financial decisions. They may reference others' opinions frequently. Look for people-pleasing, status-seeking, comparison to others, or decision paralysis without approval.`,
      
      Fear: `This person experiences financial paralysis from fear. They may avoid specifics or show analysis paralysis. Look for vague language, future catastrophizing, frozen inaction, or avoiding financial reality.`,
      
      Receiving: `This person struggles to receive help or financial support. They may minimize problems or reject assistance. Look for isolation, excessive self-reliance, pride, or "I should handle this alone" patterns.`,
      
      Showing: `This person over-gives financially at their own expense. They may focus on others' needs over their own. Look for self-sacrifice, financial enabling of others, guilt about self-care, or depleting themselves to help others.`
    };
    
    return contexts[traumaData.topTrauma] || '';
  },
  
  /**
   * Get trauma-informed action guidance
   */
  getTraumaHealingFocus(traumaType) {
    const healing = {
      FSV: `transparency and authentic self-expression`,
      Control: `flexibility and trust in uncertainty`,
      ExVal: `internal values clarification and self-trust`,
      Fear: `small, safe steps to build confidence`,
      Receiving: `gradual openness to support and help`,
      Showing: `balance between giving and self-care`
    };
    
    return healing[traumaType] || 'self-awareness and growth';
  },

  // ============================================================
  // PROMPT FUNCTIONS - One for each response type
  // ============================================================

  /**
   * Income sources prompt (Q18)
   */
  getIncomeSourcesPrompt(previousInsights, traumaData) {
    const traumaConnection = traumaData?.topTrauma ? `

**${traumaData.topTrauma} PATTERN CONNECTION**:
${this.getTraumaContext(traumaData)}

Look for how their ${traumaData.topTrauma} pattern shows up in how they describe income:
${traumaData.topTrauma === 'FSV' ? '- Are they minimizing success or exaggerating struggles?\n- Do they downplay reliable income or hide income sources?' : ''}${traumaData.topTrauma === 'Control' ? '- Do they over-detail or show anxiety about income variability?\n- Are they trying to control/predict every income stream?' : ''}${traumaData.topTrauma === 'ExVal' ? '- Do they reference what others think about their income?\n- Are income choices driven by status or comparison?' : ''}${traumaData.topTrauma === 'Fear' ? '- Do they avoid specifics or show paralysis about income?\n- Is there catastrophizing about income loss?' : ''}${traumaData.topTrauma === 'Receiving' ? '- Do they minimize help or struggle to receive?\n- Is there excessive self-reliance in income?' : ''}${traumaData.topTrauma === 'Showing' ? '- Do they prioritize others over their own income needs?\n- Is there guilt about earning or keeping money?' : ''}` : '';

    return `
You are a financial clarity expert analyzing a student's income sources.

**CRITICAL - QUOTE THEIR WORDS AND CONNECT TO PATTERN**:
- Reference their exact words and specific income sources (name them!)
- If they said "I work at Starbucks and sell crafts on Etsy", mention Starbucks and Etsy
- Then connect HOW they described it to ${traumaData?.topTrauma ? `their ${traumaData.topTrauma} pattern` : 'their emotional pattern'}
- Example: "Your primary income from [specific source] combined with [specific side income] shows how your ${traumaData?.topTrauma || 'pattern'} manifests in..."
${traumaConnection}

Analyze their response for:
1. Pattern: Name THEIR SPECIFIC income sources + how ${traumaData?.topTrauma ? `${traumaData.topTrauma}` : 'their pattern'} shows up in it
2. Insight: What does THIS setup + ${traumaData?.topTrauma ? `${traumaData.topTrauma} pattern` : 'pattern'} reveal about their income clarity?
3. Action: One step that addresses both the financial behavior AND ${traumaData?.topTrauma ? `${traumaData.topTrauma}` : 'the pattern'}

Return plain-text only:

Pattern:
(One sentence: name their specific sources + how ${traumaData?.topTrauma || 'their pattern'} shows up)

Insight:
(One sentence connecting their setup to ${traumaData?.topTrauma || 'the pattern'} and clarity)

Action:
(One specific step that shifts both behavior and ${traumaData?.topTrauma || 'pattern'})
    `.trim();
  },

  /**
   * Major expenses prompt (Q23)
   */
  getMajorExpensesPrompt(previousInsights, traumaData) {
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
  getWastefulSpendingPrompt(previousInsights, traumaData) {
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
  getDebtListPrompt(previousInsights, traumaData) {
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
  getInvestmentsPrompt(previousInsights, traumaData) {
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
  getEmotionsPrompt(previousInsights, traumaData) {
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
  getAdaptiveTraumaPrompt(previousInsights, traumaData) {
    return `
You are a financial clarity expert analyzing a student's reflection on emotional patterns.

**CRITICAL**: This is a vulnerable share. Reference their exact words
with care and respect. This is about THEIR specific experience, not generic advice.

${previousInsights && Object.keys(previousInsights).length > 0 ? 'Gently connect this to the financial behaviors you\'ve identified, if relevant.' : ''}

Analyze their response for:
1. Pattern: What emotional or behavioral pattern do they describe in their financial life?
2. Insight: What might this pattern be helping them manage or avoid?
3. Action: One gentle, practical step to begin shifting this pattern

Consider:
- How this pattern shows up in their financial behaviors
- What need or protection this pattern might be serving
- A realistic, compassionate action step that honors where they are
- Keep the focus on financial empowerment, not therapy

**Compassionate approach:**
- Acknowledge patterns with understanding (behaviors made sense at one time)
- Recognize the courage it takes to see and shift patterns
- Offer small, practical actions (not dramatic changes)
- Frame changes as building financial confidence and clarity

Return plain-text only:

Pattern:
(One sentence identifying the behavioral or emotional pattern in their financial life)

Insight:
(One sentence about what this pattern might be helping them manage)

Action:
(One gentle, specific step toward greater financial clarity and confidence)
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
  synthesizeOverall(clientId, allInsights, domainScores, traumaData) {
    // Trauma as connecting thread - explains WHY financial behaviors exist
    const traumaContext = traumaData?.topTrauma ? `

CONNECTING CONTEXT:
This person has a ${traumaData.topTrauma} pattern. Use this as the KEY to understanding WHY their financial behaviors exist the way they do. Connect their financial patterns TO this strategy - show how this pattern shapes their relationship with money, income, spending, saving, etc.

${this.getTraumaContext(traumaData)}

Your job: Show how ${traumaData.topTrauma} shows up in their specific financial behaviors. This helps them understand the "why" behind their money patterns.` : '';

    const systemPrompt = `
You are synthesizing a comprehensive Financial Clarity report for a student.
${traumaContext}

Domain Scores (0-100%):
- Money Flow: ${domainScores.moneyFlow}%
- Obligations: ${domainScores.obligations}%
- Liquidity: ${domainScores.liquidity}%
- Growth: ${domainScores.growth}%
- Protection: ${domainScores.protection}%

Individual Insights (containing THEIR specific responses):
${JSON.stringify(allInsights, null, 2)}

**CRITICAL - USE THEIR SPECIFIC EXAMPLES AND CONNECT TO ${traumaData?.topTrauma || 'PATTERN'}**:
- The Individual Insights contain specific examples from their responses
- You MUST reference these specific examples in your synthesis
- DO NOT write generic statements like "your spending might be influenced by..."
- INSTEAD write "you mentioned [specific thing] - this reflects how your ${traumaData?.topTrauma || 'pattern'} shows up in..."
- Show the CONNECTION: "Your ${traumaData?.topTrauma || 'pattern'} pattern appears in how you described [specific example]..."
- ${traumaData?.topTrauma ? `Every financial behavior should be connected back to their ${traumaData.topTrauma} strategy` : 'Connect behaviors to underlying patterns'}

Create a cohesive narrative that:
- Starts with their ACTUAL financial behaviors from specific examples
- Shows how ${traumaData?.topTrauma ? `their ${traumaData.topTrauma} pattern explains these behaviors` : 'emotional patterns shape their financial decisions'}
- Connects specific behaviors → ${traumaData?.topTrauma || 'pattern'} → domain scores
- Makes the ${traumaData?.topTrauma || 'pattern'} the KEY to understanding their financial life
- Uses practical, empowering language (not clinical or therapy-focused)
- Helps them see WHY they do what they do, not just WHAT they do

**TONE BALANCE**:
- Focus: Their specific financial behaviors and clarity
- Connection: How ${traumaData?.topTrauma || 'their pattern'} explains and links these behaviors
- Language: Practical and empowering, not clinical

Return plain-text only:

Overview:
(2-3 paragraphs: Start with specific examples from their responses - "You described [specific income/expenses/behaviors]..." Then connect these to ${traumaData?.topTrauma || 'the pattern'} - "This reflects how your ${traumaData?.topTrauma || 'pattern'} shows up in [domain]..." Finally link to scores. Make ${traumaData?.topTrauma || 'the pattern'} the connecting thread that explains WHY their financial life looks the way it does.)

Top Patterns:
- Pattern 1: [How ${traumaData?.topTrauma || 'their pattern'} shows up most strongly - reference specific financial behavior and connect to ${traumaData?.topTrauma || 'pattern'}]
- Pattern 2: [Secondary way ${traumaData?.topTrauma || 'the pattern'} manifests - specific behavior + connection to ${traumaData?.topTrauma || 'pattern'}]
- Pattern 3: [Strength or resource that can help shift ${traumaData?.topTrauma || 'the pattern'} - must be from their actual situation]

Priority Actions:
1. [Action for their lowest domain that addresses how ${traumaData?.topTrauma || 'their pattern'} shows up there - based on specific examples]
2. [Action that helps shift ${traumaData?.topTrauma || 'the pattern'} in a specific financial area they mentioned]
3. [Action building on their specific strengths to support new ${traumaData?.topTrauma ? 'ways of relating to' : 'patterns in'} money]
4. [Practice or mindset shift related to ${traumaData?.topTrauma || 'the pattern'} - practical, not therapeutic]
5. [Long-term action that supports healing ${traumaData?.topTrauma || 'the pattern'} through financial empowerment]

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
      return this.getGenericSynthesis(domainScores, traumaData);
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
  getGenericSynthesis(domainScores, traumaData) {
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
