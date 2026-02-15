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
      LogUtils.debug(`[TIER 1] Attempting GPT: ${clientId} - ${subdomainKey}`);

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
        LogUtils.debug(`✅ [TIER 1] GPT success: ${subdomainKey}`);

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
      LogUtils.debug(`⚠️ [TIER 1] GPT failed: ${subdomainKey} - ${error.message}`);

      // ============================================================
      // TIER 2: Retry GPT Analysis
      // ============================================================
      try {
        Utilities.sleep(2000);
        LogUtils.debug(`[TIER 2] Retrying GPT: ${clientId} - ${subdomainKey}`);

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
          LogUtils.debug(`✅ [TIER 2] GPT retry success: ${subdomainKey}`);

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
        LogUtils.debug(`❌ [TIER 2] GPT retry failed: ${subdomainKey} - ${retryError.message}`);

        // ============================================================
        // TIER 3: Use Subdomain-Specific Fallback
        // ============================================================
        LogUtils.debug(`[TIER 3] Using fallback: ${subdomainKey}`);

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
      LogUtils.debug(`[SYNTHESIS] Domain: ${clientId} - ${domainConfig.name}`);

      const systemPrompt = this.buildDomainSynthesisPrompt(
        domainConfig,
        subdomainScores,
        domainScore,
        subdomainConfigs
      );

      const userPrompt = this.buildDomainUserPrompt(subdomainInsights, subdomainConfigs);

      LogUtils.debug(`[SYNTHESIS] Calling GPT for domain synthesis...`);
      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 500
      });

      LogUtils.debug(`[SYNTHESIS] Raw GPT response length: ${result ? result.length : 0} characters`);
      LogUtils.debug(`[SYNTHESIS] Raw GPT response preview: ${result ? result.substring(0, 200) : 'NULL'}...`);

      const parsed = this.parseDomainSynthesis(result);

      LogUtils.debug(`[SYNTHESIS] Parsed result:`);
      LogUtils.debug(`  - summary length: ${parsed.summary ? parsed.summary.length : 0}`);
      LogUtils.debug(`  - keyThemes count: ${parsed.keyThemes ? parsed.keyThemes.length : 0}`);
      LogUtils.debug(`  - priorityFocus length: ${parsed.priorityFocus ? parsed.priorityFocus.length : 0}`);

      // Validate content is not empty
      if (!this.isValidDomainSynthesis(parsed)) {
        LogUtils.debug(`❌ [SYNTHESIS] Validation failed - parsed content is empty or incomplete`);
        LogUtils.debug(`   Summary: "${parsed.summary}"`);
        LogUtils.debug(`   KeyThemes: ${JSON.stringify(parsed.keyThemes)}`);
        LogUtils.debug(`   PriorityFocus: "${parsed.priorityFocus}"`);
        throw new Error('Empty synthesis content - GPT returned malformed response');
      }

      LogUtils.debug(`✅ [SYNTHESIS] Domain success: ${domainConfig.name}`);

      return {
        ...parsed,
        source: 'gpt',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      LogUtils.debug(`❌ [SYNTHESIS] Domain failed: ${domainConfig.name} - ${error.message}`);
      LogUtils.debug(`   Error stack: ${error.stack}`);

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
      allScores,
      subdomainInsights = {}  // ADD: Accept subdomain insights for context
    } = params;

    try {
      LogUtils.debug(`[SYNTHESIS] Overall: ${clientId} - ${toolId}`);

      const systemPrompt = this.buildOverallSynthesisPrompt(
        toolConfig,
        allScores
      );

      const userPrompt = this.buildOverallUserPrompt(domainSyntheses, allScores, toolConfig, subdomainInsights);

      LogUtils.debug(`[SYNTHESIS] Calling GPT for overall synthesis...`);
      const result = this.callGPT({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 700
      });

      LogUtils.debug(`[SYNTHESIS] Raw GPT response length: ${result ? result.length : 0} characters`);
      LogUtils.debug(`[SYNTHESIS] Raw GPT response preview: ${result ? result.substring(0, 200) : 'NULL'}...`);

      const parsed = this.parseOverallSynthesis(result);

      LogUtils.debug(`[SYNTHESIS] Parsed result:`);
      LogUtils.debug(`  - overview length: ${parsed.overview ? parsed.overview.length : 0}`);
      LogUtils.debug(`  - integration length: ${parsed.integration ? parsed.integration.length : 0}`);
      LogUtils.debug(`  - coreWork length: ${parsed.coreWork ? parsed.coreWork.length : 0}`);
      LogUtils.debug(`  - nextSteps count: ${parsed.nextSteps ? parsed.nextSteps.length : 0}`);

      // Validate content is not empty
      if (!this.isValidOverallSynthesis(parsed)) {
        LogUtils.debug(`❌ [SYNTHESIS] Validation failed - parsed content is empty or incomplete`);
        LogUtils.debug(`   Overview: "${parsed.overview}"`);
        LogUtils.debug(`   Integration: "${parsed.integration}"`);
        LogUtils.debug(`   CoreWork: "${parsed.coreWork}"`);
        LogUtils.debug(`   NextSteps: ${JSON.stringify(parsed.nextSteps)}`);
        throw new Error('Empty synthesis content - GPT returned malformed response');
      }

      LogUtils.debug(`✅ [SYNTHESIS] Overall success: ${toolId}`);

      return {
        ...parsed,
        source: 'gpt',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      LogUtils.debug(`❌ [SYNTHESIS] Overall failed: ${toolId} - ${error.message}`);

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

    // Calculate average to determine overall tone
    const avgScore = (beliefScore + behaviorScore + feelingScore + consequenceScore) / 4;
    const isHealthy = avgScore >= 1.5; // Average of +2 or better
    const isProblematic = avgScore <= -1.5; // Average of -2 or worse

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
- Average: ${avgScore.toFixed(1)} (${isHealthy ? 'HEALTHY PATTERN' : isProblematic ? 'PROBLEMATIC PATTERN' : 'MIXED PATTERN'})

RESPONSE TONE BASED ON SCORES:
${isHealthy ? `These are HEALTHY scores (+2 or better average). Your response should:
- Acknowledge their strength and positive grounding in this area
- Validate what they're doing well
- Suggest ways to maintain or deepen this healthy pattern
- Use affirming, encouraging language
- Focus on "keep doing X" rather than "fix Y"` : ''}${isProblematic ? `These are PROBLEMATIC scores (-2 or worse average). Your response should:
- Address the disconnection and struggle compassionately
- Identify the specific pattern causing difficulty
- Provide corrective, actionable guidance
- Use supportive but clear language about what needs to change
- Focus on "transform X into Y" rather than just validation` : ''}${!isHealthy && !isProblematic ? `These are MIXED scores (between -1.5 and +1.5 average). Your response should:
- Acknowledge both strengths and challenges
- Identify which aspects are working and which need attention
- Provide balanced guidance that builds on strengths while addressing gaps
- Use language that recognizes complexity and partial grounding` : ''}

YOUR TASK:
Analyze the student's open response in the context of these scores and the belief→behavior connection.
Write your response as if you are speaking directly to the student (use "you" and "your").
CRITICAL: Ensure your tone and content match the score severity above.

CRITICAL OUTPUT FORMAT:
- Return ONLY plain text with NO markdown formatting whatsoever
- DO NOT use ** (bold), * (italic), _ (underline), or any other markdown
- DO NOT repeat section headers in your response (they are ONLY labels for you)
- Start each section immediately with your content, not with the section name

Pattern:
(One sentence: What specific pattern appears in your response related to "${label}"? Tone should match score severity.)

Insight:
(One sentence: What does this pattern + scores reveal? For healthy scores, focus on strengths. For problematic scores, focus on disconnection.)

Action:
(One specific, actionable step. For healthy scores, suggest ways to maintain/deepen. For problematic scores, suggest corrective changes.)

Root Belief:
(One sentence: What underlying belief drives this pattern? For healthy scores, identify the empowering belief. For problematic scores, identify the limiting belief.)
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

    // Determine domain-level tone
    const isHealthy = domainScore < 25; // 0-24 is healthy
    const isProblematic = domainScore >= 65; // 65+ is problematic
    const isMixed = !isHealthy && !isProblematic;

    return `
You are synthesizing insights for the "${domainConfig.name}" domain from a financial grounding assessment.

DOMAIN DESCRIPTION:
${domainConfig.description}

SUBDOMAIN SCORES (0-100, where 100 is most problematic, 0 is healthiest):
${subdomainList}

DOMAIN AVERAGE: ${Math.round(domainScore)} (${this.interpretNormalizedScore(domainScore)})

DOMAIN-LEVEL PATTERN: ${isHealthy ? 'HEALTHY (0-24)' : isProblematic ? 'PROBLEMATIC (65+)' : 'MIXED (25-64)'}

RESPONSE TONE BASED ON DOMAIN SCORE:
${isHealthy ? `This domain shows HEALTHY patterns (score < 25). Your synthesis should:
- Celebrate the overall grounding and strengths in this area
- Acknowledge what's working well across the subdomains
- Suggest ways to maintain and deepen these healthy patterns
- Use affirming, validating language
- Focus on "continue building on X" rather than "fix Y"` : ''}${isProblematic ? `This domain shows PROBLEMATIC patterns (score 65+). Your synthesis should:
- Address the significant disconnection compassionately but clearly
- Identify how the subdomain patterns reinforce each other negatively
- Provide clear, actionable corrective guidance
- Use supportive but direct language about what needs transformation
- Focus on "transform X to Y" with specific starting points` : ''}${isMixed ? `This domain shows MIXED patterns (score 25-64). Your synthesis should:
- Acknowledge both the strengths and the areas needing work
- Identify which subdomains are grounded and which need attention
- Provide balanced guidance that leverages strengths while addressing gaps
- Use nuanced language that recognizes complexity
- Focus on "build on X while addressing Y"` : ''}

SUBDOMAIN INSIGHTS (from previous analysis):
[Will be provided in user prompt]

YOUR TASK:
Synthesize the subdomain insights into a cohesive domain-level understanding.
Write your response as if you are speaking directly to the student (use "you" and "your").
CRITICAL: Ensure your tone and content match the domain score severity above.

Focus on:
1. Common themes across the 3 subdomains
2. How these patterns reinforce each other (positively or negatively)
3. The overall impact on their ${domainConfig.name}
4. Priority starting point based on subdomain scores

IMPORTANT: When referencing subdomains in your synthesis, use their descriptive
names (e.g., "I'm Not Worthy of Financial Freedom") rather than technical
identifiers (e.g., subdomain_1_1). Students need to understand which patterns
you're referring to.

CRITICAL OUTPUT FORMAT:
- Return ONLY plain text with NO markdown formatting whatsoever
- DO NOT use ** (bold), * (italic), _ (underline), or any other markdown
- DO NOT repeat section headers in your response (they are ONLY labels for you)
- Start each section immediately with your content, not with the section name

Summary:
(2-3 sentences synthesizing the domain pattern. Tone should match domain score: affirming for healthy, corrective for problematic, balanced for mixed.)

Key Themes:
- Theme 1: [Most prominent pattern - acknowledge strength if healthy, address problem if problematic]
- Theme 2: [Secondary pattern - maintain nuance based on subdomain scores]
- Theme 3: [Strength, resource, or opportunity - every domain has something to work with]

Priority Focus:
(One sentence: Where should you start? For healthy domains, suggest deepening. For problematic domains, identify the highest-scoring subdomain. For mixed domains, balance building on strengths while addressing gaps.)
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
    // Determine overall tone
    const overallScore = allScores.overallQuotient;
    const isHealthy = overallScore < 25; // 0-24 is healthy overall
    const isProblematic = overallScore >= 65; // 65+ is problematic overall
    const isMixed = !isHealthy && !isProblematic;

    const domain1Score = allScores.domainQuotients.domain1;
    const domain2Score = allScores.domainQuotients.domain2;

    return `
You are creating the overall synthesis for the "${toolConfig.name}" assessment.

ASSESSMENT PURPOSE:
${toolConfig.purpose}

OVERALL SCORE: ${Math.round(overallScore)} (${this.interpretNormalizedScore(overallScore)})

DOMAIN SCORES:
- ${toolConfig.domain1Name}: ${Math.round(domain1Score)} (${this.interpretNormalizedScore(domain1Score)})
- ${toolConfig.domain2Name}: ${Math.round(domain2Score)} (${this.interpretNormalizedScore(domain2Score)})

OVERALL PATTERN: ${isHealthy ? 'HEALTHY (0-24)' : isProblematic ? 'PROBLEMATIC (65+)' : 'MIXED (25-64)'}

RESPONSE TONE BASED ON OVERALL SCORE:
${isHealthy ? `This is a HEALTHY overall score (< 25). Your synthesis should:
- Celebrate the overall grounding and strengths across both domains
- Acknowledge what's working well in their financial identity and relationships
- Suggest ways to continue building on this solid foundation
- Use affirming, empowering language throughout
- Focus on "maintain and deepen X" rather than "fix Y"
- Position next steps as opportunities for growth, not corrections` : ''}${isProblematic ? `This is a PROBLEMATIC overall score (65+). Your synthesis should:
- Address the significant disconnection compassionately but clearly
- Identify how both domains contribute to the overall struggle
- Provide clear, actionable corrective guidance with specific starting points
- Use supportive but direct language about what needs transformation
- Focus on "transform X to Y" with concrete steps
- Position next steps as essential corrective actions, not optional enhancements` : ''}${isMixed ? `This is a MIXED overall score (25-64). Your synthesis should:
- Acknowledge both the strengths and the areas needing work across domains
- Identify which domain is more grounded and which needs more attention
- Provide balanced guidance that leverages strengths while addressing gaps
- Use nuanced language that recognizes partial grounding and complexity
- Focus on "build on X while addressing Y"
- Position next steps as a balanced mix of maintaining strengths and addressing gaps` : ''}

DOMAIN BALANCE:
${Math.abs(domain1Score - domain2Score) < 15 ? 'Both domains are relatively balanced.' : domain1Score > domain2Score + 15 ? `${toolConfig.domain1Name} is significantly more problematic (${Math.round(domain1Score - domain2Score)} points higher). Focus heavily on this domain. ${domain2Score < 25 ? `NOTE: ${toolConfig.domain2Name} is HEALTHY (score ${Math.round(domain2Score)}) - treat it as a STRENGTH, not a problem.` : ''}` : `${toolConfig.domain2Name} is significantly more problematic (${Math.round(domain2Score - domain1Score)} points higher). Focus heavily on this domain. ${domain1Score < 25 ? `NOTE: ${toolConfig.domain1Name} is HEALTHY (score ${Math.round(domain1Score)}) - treat it as a STRENGTH, not a problem.` : ''}`}

YOUR TASK:
Create a cohesive narrative that connects both domains and provides an integrated understanding.
Write your response as if you are speaking directly to the student (use "you" and "your").
CRITICAL: Ensure your tone and content match the overall score severity above.

CRITICAL CONTEXT ALIGNMENT:
You will receive the EXISTING subdomain insights (pattern, insight, root belief, action) that have
already been shared with this student. Your overall synthesis MUST align with and build upon these
existing narratives. DO NOT contradict or ignore what the subdomains already established.

If subdomain insights show healthy patterns, acknowledge those strengths in your overview.
If subdomain insights show problematic patterns, address those issues in your overview.
Your job is to CREATE A COHERENT WHOLE from the existing pieces, not to rewrite them.

Focus on:
1. The relationship between the two domains
2. How patterns in one domain affect the other (positively or negatively)
3. The core disconnection this assessment addresses (or core strengths if healthy)
4. A clear, specific path forward based on THEIR scores, responses, AND existing subdomain narratives

CRITICAL OUTPUT FORMAT:
- Return ONLY plain text with NO markdown formatting whatsoever
- DO NOT use ** (bold), * (italic), _ (underline), or any other markdown
- DO NOT repeat section headers in your response (they are ONLY labels for you)
- Start each section immediately with your content, not with the section name

Overview:
(2-3 paragraphs connecting both domains. CRITICAL: If one domain is HEALTHY (score < 25), present it as a STRENGTH and resource, NOT as a problem. Only discuss problematic patterns for domains scoring 25+. Acknowledge which specific domain(s) need work.)

Integration:
(How do the two domains interact and influence each other in your financial life? Tone should match overall score: celebrate synergy if healthy, address vicious cycles if problematic, acknowledge mixed dynamics if mixed.)

Core Work:
(What is the fundamental shift you need? For healthy scores, suggest deepening practices. For problematic scores, identify the core transformation needed. For mixed scores, balance maintaining and transforming.)

Next Steps:
IMPORTANT: Provide 5 concrete, personalized action steps based on this student's specific scores, highest domains, and responses. Make each step specific and actionable, NOT generic advice.

Tone of steps should match overall score:
- HEALTHY scores: Suggest practices to maintain/deepen strengths
- PROBLEMATIC scores: Provide corrective actions to address disconnections
- MIXED scores: Balance building on strengths while addressing gaps

1. [Specific action for your highest scoring subdomain - reference the actual subdomain name and score]
2. [Concrete practice for building awareness of your specific pattern - reference actual patterns from their responses]
3. [Specific boundary or experiment to try this week based on their situation]
4. [Daily or weekly reflection practice tailored to their core work]
5. [30-day milestone or progress check specific to their work]
    `.trim();
  },

  /**
   * Build user prompt for overall synthesis
   */
  buildOverallUserPrompt(domainSyntheses, allScores, toolConfig, subdomainInsights = {}) {
    // Build subdomain insights with full context (not just scores)
    let subdomainContextText = '\n\nSUBDOMAIN INSIGHTS (ensure overall narrative aligns with these existing narratives):\n';
    if (allScores && allScores.subdomainQuotients && toolConfig && toolConfig.subdomains) {
      toolConfig.subdomains.forEach(subdomain => {
        const score = Math.round(allScores.subdomainQuotients[subdomain.key]);
        const insight = subdomainInsights[subdomain.key];

        subdomainContextText += `\n"${subdomain.label}" (Score: ${score}):\n`;
        if (insight) {
          subdomainContextText += `  Pattern: ${insight.pattern}\n`;
          subdomainContextText += `  Insight: ${insight.insight}\n`;
          subdomainContextText += `  Root Belief: ${insight.rootBelief}\n`;
          subdomainContextText += `  Action: ${insight.action}\n`;
        } else {
          subdomainContextText += `  [No insight available - using fallback]\n`;
        }
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

    return domainSynthesesText + subdomainContextText;
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
    // More flexible regex that handles markdown in section headers
    // Matches: "Overview:", "**Overview:**", "Overview", etc.
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      '\\*{0,2}' + escapedName + '\\*{0,2}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\n\\*{0,2}[A-Z][a-z\\s]+\\*{0,2}\\s*:?\\s*|$)',
      'i'
    );
    const match = text.match(regex);
    let extracted = match ? match[1].trim() : '';

    // Strip ALL markdown formatting (**, *, _)
    extracted = extracted.replace(/\*\*/g, '');  // Remove bold **
    extracted = extracted.replace(/\*/g, '');    // Remove italic *
    extracted = extracted.replace(/_/g, '');     // Remove italic _

    // Remove any embedded section headers that GPT might include
    // Match patterns like "**Integration:**", "Integration:", etc.
    extracted = extracted.replace(/\*{0,2}[A-Z][a-z\s]+\*{0,2}:\s*/g, '');

    // Remove any leading/trailing colons that might remain
    extracted = extracted.replace(/^:\s*/, '').replace(/\s*:$/, '');

    return extracted.trim();
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
      LogUtils.debug(`[CACHE] Stored insight: ${cacheKey}`);
    } catch (error) {
      LogUtils.error(`[CACHE] Failed to store insight: ${error.message}`);
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
      LogUtils.error(`[CACHE] Failed to retrieve insight: ${error.message}`);
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

      LogUtils.debug(`[CACHE] Cleared cache for ${toolId} - ${clientId}`);
    } catch (error) {
      LogUtils.error(`[CACHE] Failed to clear cache: ${error.message}`);
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
      LogUtils.error(`Failed to log fallback usage: ${logError.message}`);
    }
  }
};
