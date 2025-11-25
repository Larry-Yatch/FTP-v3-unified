/**
 * GroundingGPT.js
 * GPT analysis for grounding tools (Tools 3, 5, 7)
 *
 * Progressive Chaining Pattern:
 * - 6 calls during form (background, one per subdomain)
 * - 3 calls at submission (synthesis: 2 domains + 1 overall)
 * - Total: 9 calls per assessment
 *
 * 3-Tier Fallback:
 * - Tier 1: GPT-4o-mini (subdomain) or GPT-4o (synthesis)
 * - Tier 2: Retry after 2 seconds
 * - Tier 3: Subdomain-specific fallback from GroundingFallbacks
 *
 * Cost: ~$0.015 per assessment (6 mini + 3 full)
 * Speed: ~3 seconds user wait (only synthesis is blocking)
 */

const GroundingGPT = {

  /**
   * Analyze subdomain response (background call during form)
   *
   * @param {Object} params - Analysis parameters
   * @returns {Object} Insight with source attribution
   */
  analyzeSubdomain(params) {
    const {
      toolId,
      clientId,
      subdomainKey,
      subdomainConfig,
      responses,
      aspectScores,
      previousInsights
    } = params;

    // Validate params
    if (!toolId || !clientId || !subdomainKey || !subdomainConfig || !responses || !aspectScores) {
      throw new Error('GroundingGPT.analyzeSubdomain: Missing required parameters');
    }

    // ============================================================
    // TIER 1: Try GPT Analysis
    // ============================================================
    try {
      Logger.log(`[TIER 1] Attempting GPT: ${clientId} - ${subdomainKey}`);

      const systemPrompt = this.buildSubdomainSystemPrompt(subdomainConfig, aspectScores);
      const userPrompt = this.buildSubdomainUserPrompt(responses, aspectScores, previousInsights);

      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 400
      });

      const parsed = this.parseSubdomainResponse(result);

      if (this.isValidSubdomainInsight(parsed)) {
        Logger.log(`✅ [TIER 1] GPT success: ${subdomainKey}`);

        // Store in properties service (temporary cache)
        this.cacheInsight(toolId, clientId, subdomainKey, {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        });

        return {
          ...parsed,
          source: 'gpt',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Incomplete GPT response (missing required sections)');
      }

    } catch (error) {
      Logger.log(`⚠️ [TIER 1] GPT failed: ${subdomainKey} - ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        Logger.log(`[TIER 2] Retrying GPT: ${clientId} - ${subdomainKey}`);

        const systemPrompt = this.buildSubdomainSystemPrompt(subdomainConfig, aspectScores);
        const userPrompt = this.buildSubdomainUserPrompt(responses, aspectScores, previousInsights);

        const result = this.callGPT({
          systemPrompt,
          userPrompt,
          model: 'gpt-4o-mini',
          temperature: 0.2,
          maxTokens: 400
        });

        const parsed = this.parseSubdomainResponse(result);

        if (this.isValidSubdomainInsight(parsed)) {
          Logger.log(`✅ [TIER 2] GPT retry success: ${subdomainKey}`);

          this.cacheInsight(toolId, clientId, subdomainKey, {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          });

          return {
            ...parsed,
            source: 'gpt_retry',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Incomplete GPT response on retry');
        }

      } catch (retryError) {
        Logger.log(`❌ [TIER 2] GPT retry failed: ${subdomainKey} - ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Subdomain-Specific Fallback
        // ============================================================
        Logger.log(`[TIER 3] Using fallback: ${subdomainKey}`);

        const fallback = GroundingFallbacks.getSubdomainFallback(
          toolId,
          subdomainKey,
          aspectScores,
          responses
        );

        this.logFallbackUsage(clientId, toolId, subdomainKey, retryError.message);

        this.cacheInsight(toolId, clientId, subdomainKey, {
          ...fallback,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          gpt_error: retryError.message
        });

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
   * Synthesize domain-level insights (blocking call at submission)
   *
   * @param {Object} params - Synthesis parameters
   * @returns {Object} Domain synthesis
   */
  synthesizeDomain(params) {
    const {
      toolId,
      clientId,
      domainConfig,
      subdomainInsights,
      subdomainScores,
      domainScore,
      subdomainConfigs  // ADD: subdomain configurations with labels
    } = params;

    try {
      Logger.log(`[SYNTHESIS] Domain: ${clientId} - ${domainConfig.name}`);

      const systemPrompt = this.buildDomainSynthesisPrompt(
        domainConfig,
        subdomainScores,
        domainScore,
        subdomainConfigs
      );

      const userPrompt = this.buildDomainUserPrompt(subdomainInsights, subdomainConfigs);

      Logger.log(`[SYNTHESIS] Calling GPT for domain synthesis...`);
      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 500
      });

      Logger.log(`[SYNTHESIS] Raw GPT response length: ${result ? result.length : 0} characters`);
      Logger.log(`[SYNTHESIS] Raw GPT response preview: ${result ? result.substring(0, 200) : 'NULL'}...`);

      const parsed = this.parseDomainSynthesis(result);

      Logger.log(`[SYNTHESIS] Parsed result:`);
      Logger.log(`  - summary length: ${parsed.summary ? parsed.summary.length : 0}`);
      Logger.log(`  - keyThemes count: ${parsed.keyThemes ? parsed.keyThemes.length : 0}`);
      Logger.log(`  - priorityFocus length: ${parsed.priorityFocus ? parsed.priorityFocus.length : 0}`);

      // Validate content is not empty
      if (!this.isValidDomainSynthesis(parsed)) {
        Logger.log(`❌ [SYNTHESIS] Validation failed - parsed content is empty or incomplete`);
        Logger.log(`   Summary: "${parsed.summary}"`);
        Logger.log(`   KeyThemes: ${JSON.stringify(parsed.keyThemes)}`);
        Logger.log(`   PriorityFocus: "${parsed.priorityFocus}"`);
        throw new Error('Empty synthesis content - GPT returned malformed response');
      }

      Logger.log(`✅ [SYNTHESIS] Domain success: ${domainConfig.name}`);

      return {
        ...parsed,
        source: 'gpt',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      Logger.log(`❌ [SYNTHESIS] Domain failed: ${domainConfig.name} - ${error.message}`);
      Logger.log(`   Error stack: ${error.stack}`);

      return GroundingFallbacks.getDomainFallback(
        toolId,
        domainConfig,
        subdomainScores,
        domainScore
      );
    }
  },

  /**
   * Synthesize overall insights (blocking call at submission)
   *
   * @param {Object} params - Overall synthesis parameters
   * @returns {Object} Overall synthesis
   */
  synthesizeOverall(params) {
    const {
      toolId,
      clientId,
      toolConfig,
      domainSyntheses,
      allScores
    } = params;

    try {
      Logger.log(`[SYNTHESIS] Overall: ${clientId} - ${toolId}`);

      const systemPrompt = this.buildOverallSynthesisPrompt(
        toolConfig,
        allScores
      );

      const userPrompt = this.buildOverallUserPrompt(domainSyntheses, allScores, toolConfig);

      Logger.log(`[SYNTHESIS] Calling GPT for overall synthesis...`);
      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 700
      });

      Logger.log(`[SYNTHESIS] Raw GPT response length: ${result ? result.length : 0} characters`);
      Logger.log(`[SYNTHESIS] Raw GPT response preview: ${result ? result.substring(0, 200) : 'NULL'}...`);

      const parsed = this.parseOverallSynthesis(result);

      Logger.log(`[SYNTHESIS] Parsed result:`);
      Logger.log(`  - overview length: ${parsed.overview ? parsed.overview.length : 0}`);
      Logger.log(`  - integration length: ${parsed.integration ? parsed.integration.length : 0}`);
      Logger.log(`  - coreWork length: ${parsed.coreWork ? parsed.coreWork.length : 0}`);
      Logger.log(`  - nextSteps count: ${parsed.nextSteps ? parsed.nextSteps.length : 0}`);

      // Validate content is not empty
      if (!this.isValidOverallSynthesis(parsed)) {
        Logger.log(`❌ [SYNTHESIS] Validation failed - parsed content is empty or incomplete`);
        Logger.log(`   Overview: "${parsed.overview}"`);
        Logger.log(`   Integration: "${parsed.integration}"`);
        Logger.log(`   CoreWork: "${parsed.coreWork}"`);
        Logger.log(`   NextSteps: ${JSON.stringify(parsed.nextSteps)}`);
        throw new Error('Empty synthesis content - GPT returned malformed response');
      }

      Logger.log(`✅ [SYNTHESIS] Overall success: ${toolId}`);

      return {
        ...parsed,
        source: 'gpt',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      Logger.log(`❌ [SYNTHESIS] Overall failed: ${toolId} - ${error.message}`);

      return GroundingFallbacks.getOverallFallback(
        toolId,
        toolConfig,
        allScores
      );
    }
  },

  // ============================================================
  // PROMPT BUILDERS
  // ============================================================

  /**
   * Build system prompt for subdomain analysis
   */
  buildSubdomainSystemPrompt(subdomainConfig, aspectScores) {
    const {label, description, beliefBehaviorConnection} = subdomainConfig;

    const beliefScore = aspectScores.belief;
    const behaviorScore = aspectScores.behavior;
    const feelingScore = aspectScores.feeling;
    const consequenceScore = aspectScores.consequence;

    return `
You are analyzing the "${label}" subdomain from a financial grounding assessment.

SUBDOMAIN DESCRIPTION:
${description}

BELIEF → BEHAVIOR CONNECTION:
${beliefBehaviorConnection}

STUDENT'S SCORES (raw scale -3 to +3, where -3 is most problematic, +3 is healthiest):
- Belief: ${beliefScore} (${this.interpretRawScore(beliefScore)})
- Behavior: ${behaviorScore} (${this.interpretRawScore(behaviorScore)})
- Feeling: ${feelingScore} (${this.interpretRawScore(feelingScore)})
- Consequence: ${consequenceScore} (${this.interpretRawScore(consequenceScore)})

YOUR TASK:
Analyze the student's open response in the context of these scores and the belief→behavior connection.
Write your response as if you are speaking directly to the student (use "you" and "your").
Focus on:
1. How their words reveal the pattern described in this subdomain
2. The relationship between their belief and behavior scores
3. Concrete, specific guidance based on their situation

Return plain-text only:

Pattern:
(One sentence: What specific pattern appears in your response related to "${label}"?)

Insight:
(One sentence: What does this pattern + scores reveal about your disconnection?)

Action:
(One specific, actionable step you can take based on your response and scores)

Root Belief:
(One sentence: What underlying belief might be driving this pattern for you?)
    `.trim();
  },

  /**
   * Build user prompt for subdomain analysis
   */
  buildSubdomainUserPrompt(responses, aspectScores, previousInsights) {
    const openResponseKey = Object.keys(responses).find(k => k.includes('open_response'));
    const openResponseText = responses[openResponseKey] || 'No response provided';

    let prompt = '';

    // Add previous insights as context (if available)
    if (previousInsights && Object.keys(previousInsights).length > 0) {
      prompt += 'Previous Subdomain Insights:\n';
      Object.entries(previousInsights).forEach(([key, insight]) => {
        if (insight.pattern) {
          prompt += `- ${key}: ${insight.pattern}\n`;
        }
      });
      prompt += '\n';
    }

    prompt += `Student's Reflection:\n"${openResponseText}"`;

    return prompt;
  },

  /**
   * Build system prompt for domain synthesis
   */
  buildDomainSynthesisPrompt(domainConfig, subdomainScores, domainScore, subdomainConfigs) {
    // Build subdomain list with labels
    const subdomainList = subdomainConfigs ? subdomainConfigs.map((config, index) => {
      const key = config.key;
      const score = subdomainScores[key];
      return `- "${config.label}": ${Math.round(score)} (${this.interpretNormalizedScore(score)})`;
    }).join('\n') : Object.entries(subdomainScores).map(([key, score]) =>
      `- ${key}: ${Math.round(score)} (${this.interpretNormalizedScore(score)})`
    ).join('\n');

    return `
You are synthesizing insights for the "${domainConfig.name}" domain from a financial grounding assessment.

DOMAIN DESCRIPTION:
${domainConfig.description}

SUBDOMAIN SCORES (0-100, where 100 is most problematic):
${subdomainList}

DOMAIN AVERAGE: ${Math.round(domainScore)} (${this.interpretNormalizedScore(domainScore)})

SUBDOMAIN INSIGHTS (from previous analysis):
[Will be provided in user prompt]

YOUR TASK:
Synthesize the subdomain insights into a cohesive domain-level understanding.
Write your response as if you are speaking directly to the student (use "you" and "your").
Focus on:
1. Common themes across the 3 subdomains
2. How these patterns reinforce each other
3. The overall impact on their ${domainConfig.name}
4. Priority starting point based on highest subdomain

IMPORTANT: When referencing subdomains in your synthesis, use their descriptive
names (e.g., "I'm Not Worthy of Financial Freedom") rather than technical
identifiers (e.g., subdomain_1_1). Students need to understand which patterns
you're referring to.

Return plain-text only:

Summary:
(2-3 sentences synthesizing the domain pattern as you see it in this student's results)

Key Themes:
- Theme 1: [Most prominent pattern you see across subdomains]
- Theme 2: [Secondary pattern you notice]
- Theme 3: [Strength or resource you have]

Priority Focus:
(One sentence: Where should you start based on your subdomain scores and insights?)
    `.trim();
  },

  /**
   * Build user prompt for domain synthesis
   */
  buildDomainUserPrompt(subdomainInsights, subdomainConfigs) {
    // Create a map of key -> label for quick lookup
    const labelMap = {};
    if (subdomainConfigs) {
      subdomainConfigs.forEach(config => {
        labelMap[config.key] = config.label;
      });
    }

    return Object.entries(subdomainInsights)
      .map(([key, insight]) => {
        const label = labelMap[key] || key;  // Fallback to key if no label found
        return `
"${label}":
- Pattern: ${insight.pattern}
- Insight: ${insight.insight}
- Root Belief: ${insight.rootBelief || 'N/A'}
      `;
      })
      .join('\n');
  },

  /**
   * Build system prompt for overall synthesis
   */
  buildOverallSynthesisPrompt(toolConfig, allScores) {
    return `
You are creating the overall synthesis for the "${toolConfig.name}" assessment.

ASSESSMENT PURPOSE:
${toolConfig.purpose}

OVERALL SCORE: ${Math.round(allScores.overallQuotient)} (${this.interpretNormalizedScore(allScores.overallQuotient)})

DOMAIN SCORES:
- ${toolConfig.domain1Name}: ${Math.round(allScores.domainQuotients.domain1)} (${this.interpretNormalizedScore(allScores.domainQuotients.domain1)})
- ${toolConfig.domain2Name}: ${Math.round(allScores.domainQuotients.domain2)} (${this.interpretNormalizedScore(allScores.domainQuotients.domain2)})

YOUR TASK:
Create a cohesive narrative that connects both domains and provides an integrated understanding.
Write your response as if you are speaking directly to the student (use "you" and "your").
Focus on:
1. The relationship between the two domains
2. How patterns in one domain affect the other
3. The core disconnection this assessment addresses
4. A clear, specific path forward based on THEIR scores and responses

Return plain-text only:

Overview:
(2-3 paragraphs connecting both domains and explaining the core disconnection you're experiencing)

Integration:
(How do the two domains interact and influence each other in your financial life?)

Core Work:
(What is the fundamental shift you need to address this disconnection?)

Next Steps:
IMPORTANT: Provide 5 concrete, personalized action steps based on this student's specific scores, highest domains, and responses. Make each step specific and actionable, NOT generic advice.

1. [Specific action for your highest scoring subdomain - reference the actual subdomain name and score]
2. [Concrete practice for building awareness of your specific pattern - reference actual patterns from their responses]
3. [Specific boundary or experiment to try this week based on their situation]
4. [Daily or weekly reflection practice tailored to their core disconnection]
5. [30-day milestone or progress check specific to their work]
    `.trim();
  },

  /**
   * Build user prompt for overall synthesis
   */
  buildOverallUserPrompt(domainSyntheses, allScores, toolConfig) {
    // Build subdomain scores breakdown for context
    let subdomainScoresText = '\n\nSUBDOMAIN SCORES (for reference in creating specific action steps):\n';
    if (allScores && allScores.subdomainQuotients && toolConfig && toolConfig.subdomains) {
      toolConfig.subdomains.forEach(subdomain => {
        const score = Math.round(allScores.subdomainQuotients[subdomain.key]);
        subdomainScoresText += `- "${subdomain.label}": ${score}\n`;
      });
    }

    const domainSynthesesText = Object.entries(domainSyntheses)
      .map(([domain, synthesis]) => `
${domain}:
Summary: ${synthesis.summary}
Key Themes: ${synthesis.keyThemes ? synthesis.keyThemes.join('; ') : 'N/A'}
Priority Focus: ${synthesis.priorityFocus}
      `)
      .join('\n\n');

    return domainSynthesesText + subdomainScoresText;
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
  // RESPONSE PARSERS
  // ============================================================

  /**
   * Parse subdomain response
   */
  parseSubdomainResponse(text) {
    return {
      pattern: this.extractSection(text, 'Pattern:'),
      insight: this.extractSection(text, 'Insight:'),
      action: this.extractSection(text, 'Action:'),
      rootBelief: this.extractSection(text, 'Root Belief:')
    };
  },

  /**
   * Parse domain synthesis
   */
  parseDomainSynthesis(text) {
    const keyThemesText = this.extractSection(text, 'Key Themes:');
    const keyThemes = keyThemesText.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());

    return {
      summary: this.extractSection(text, 'Summary:'),
      keyThemes,
      priorityFocus: this.extractSection(text, 'Priority Focus:')
    };
  },

  /**
   * Parse overall synthesis
   */
  parseOverallSynthesis(text) {
    const nextStepsText = this.extractSection(text, 'Next Steps:');
    const nextSteps = nextStepsText.split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    return {
      overview: this.extractSection(text, 'Overview:'),
      integration: this.extractSection(text, 'Integration:'),
      coreWork: this.extractSection(text, 'Core Work:'),
      nextSteps
    };
  },

  /**
   * Extract section from plain-text response
   */
  extractSection(text, sectionName) {
    const regex = new RegExp(
      sectionName + '\\s*([\\s\\S]*?)(?=\\n\\n[A-Z][a-z\\s]+:|$)',
      'i'
    );
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  },

  /**
   * Validate subdomain insight completeness
   */
  isValidSubdomainInsight(insight) {
    return (
      insight &&
      insight.pattern && insight.pattern.length > 10 &&
      insight.insight && insight.insight.length > 10 &&
      insight.action && insight.action.length > 10 &&
      insight.rootBelief && insight.rootBelief.length > 10
    );
  },

  /**
   * Validate domain synthesis completeness
   */
  isValidDomainSynthesis(synthesis) {
    return (
      synthesis &&
      synthesis.summary && synthesis.summary.trim().length > 10 &&
      synthesis.keyThemes && synthesis.keyThemes.length > 0 &&
      synthesis.priorityFocus && synthesis.priorityFocus.trim().length > 10
    );
  },

  /**
   * Validate overall synthesis completeness
   */
  isValidOverallSynthesis(synthesis) {
    return (
      synthesis &&
      synthesis.overview && synthesis.overview.trim().length > 10 &&
      synthesis.integration && synthesis.integration.trim().length > 10 &&
      synthesis.coreWork && synthesis.coreWork.trim().length > 10 &&
      synthesis.nextSteps && synthesis.nextSteps.length > 0
    );
  },

  // ============================================================
  // SCORE INTERPRETATION HELPERS
  // ============================================================

  /**
   * Interpret raw score (-3 to +3)
   */
  interpretRawScore(score) {
    if (score <= -2) return 'highly problematic';
    if (score === -1) return 'somewhat problematic';
    if (score === 1) return 'generally healthy';
    if (score >= 2) return 'very healthy';
    return 'neutral';
  },

  /**
   * Interpret normalized score (0-100)
   */
  interpretNormalizedScore(score) {
    if (score >= 80) return 'critical pattern';
    if (score >= 60) return 'significant pattern';
    if (score >= 40) return 'moderate pattern';
    if (score >= 20) return 'mild pattern';
    return 'healthy pattern';
  },

  // ============================================================
  // CACHING & LOGGING
  // ============================================================

  /**
   * Cache insight in PropertiesService for later retrieval
   */
  cacheInsight(toolId, clientId, subdomainKey, insight) {
    try {
      const cacheKey = `${toolId}_${clientId}_${subdomainKey}_insight`;
      PropertiesService.getUserProperties().setProperty(
        cacheKey,
        JSON.stringify(insight)
      );
      Logger.log(`[CACHE] Stored insight: ${cacheKey}`);
    } catch (error) {
      Logger.log(`[CACHE] Failed to store insight: ${error.message}`);
    }
  },

  /**
   * Retrieve cached insight
   */
  getCachedInsight(toolId, clientId, subdomainKey) {
    try {
      const cacheKey = `${toolId}_${clientId}_${subdomainKey}_insight`;
      const cached = PropertiesService.getUserProperties().getProperty(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      Logger.log(`[CACHE] Failed to retrieve insight: ${error.message}`);
      return null;
    }
  },

  /**
   * Clear cached insights for a client
   */
  clearCache(toolId, clientId) {
    try {
      const props = PropertiesService.getUserProperties();
      const prefix = `${toolId}_${clientId}_`;

      // Note: GAS doesn't support listing all properties, so we clear known keys
      const subdomainKeys = [
        'subdomain_1_1', 'subdomain_1_2', 'subdomain_1_3',
        'subdomain_2_1', 'subdomain_2_2', 'subdomain_2_3'
      ];

      subdomainKeys.forEach(key => {
        props.deleteProperty(`${prefix}${key}_insight`);
      });

      Logger.log(`[CACHE] Cleared cache for ${toolId} - ${clientId}`);
    } catch (error) {
      Logger.log(`[CACHE] Failed to clear cache: ${error.message}`);
    }
  },

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage(clientId, toolId, subdomainKey, error) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      let logSheet = ss.getSheetByName('GPT_FALLBACK_LOG');

      if (!logSheet) {
        logSheet = ss.insertSheet('GPT_FALLBACK_LOG');
        logSheet.appendRow(['Timestamp', 'Client_ID', 'Tool_ID', 'Subdomain_Key', 'Error_Message', 'User_Email']);
      }

      logSheet.appendRow([
        new Date(),
        clientId,
        toolId,
        subdomainKey,
        error,
        Session.getActiveUser().getEmail()
      ]);

    } catch (logError) {
      Logger.log(`Failed to log fallback usage: ${logError.message}`);
    }
  }
};
