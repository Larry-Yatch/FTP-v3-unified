/**
 * CapstoneGPT.js
 * AI-powered capstone insights for the Collective Results page.
 *
 * Two GPT-4o calls that synthesize data from ALL completed tools:
 *   1. "Your Financial Story" — cohesive narrative connecting psychology to finances
 *   2. "Capstone Insights" — cross-tool patterns, contradictions, and priority actions
 *
 * Uses IntegrationGPT.callGPT() for the actual API call.
 * Results are cached in CAPSTONE_GPT_CACHE sheet and invalidated when tools change.
 *
 * Phase II will feed these results into PDFGenerator for the downloadable report.
 */

const CapstoneGPT = {

  // ============================================================
  // ENTRY POINT
  // ============================================================

  /**
   * Generate both capstone GPT outputs for a student.
   * Checks cache first, calls GPT only when stale.
   * @param {string} clientId
   * @returns {Object} { success, story, insights } or { success: false, error }
   */
  generate(clientId, forceRefresh) {
    var summary = CollectiveResults.getStudentSummary(clientId);

    if (!this.meetsMinimumRequirements(summary)) {
      return {
        success: false,
        error: 'Complete Tool 1, Tool 2, and at least one grounding tool (3, 5, or 7) to unlock your capstone analysis.'
      };
    }

    var story, insights;

    // Check cache (skip if forceRefresh)
    var cachedStory = forceRefresh ? null : this.getCachedResult(clientId, 'financial_story', summary);
    var cachedInsights = forceRefresh ? null : this.getCachedResult(clientId, 'capstone_insights', summary);

    if (cachedStory) {
      Logger.log('[CapstoneGPT] Cache hit: financial_story for ' + clientId);
      story = cachedStory;
    } else {
      story = this.generateFinancialStory(summary);
      this.cacheResult(clientId, 'financial_story', story, summary);
    }

    if (cachedInsights) {
      Logger.log('[CapstoneGPT] Cache hit: capstone_insights for ' + clientId);
      insights = cachedInsights;
    } else {
      insights = this.generateCapstoneInsights(summary);
      this.cacheResult(clientId, 'capstone_insights', insights, summary);
    }

    return {
      success: true,
      story: story,
      insights: insights
    };
  },

  /**
   * Gate: require Tool 1 + Tool 2 + at least one grounding tool
   */
  meetsMinimumRequirements(summary) {
    var t1 = summary.tools.tool1 && summary.tools.tool1.status === 'completed';
    var t2 = summary.tools.tool2 && summary.tools.tool2.status === 'completed';
    var hasGrounding = (summary.tools.tool3 && summary.tools.tool3.status === 'completed') ||
                       (summary.tools.tool5 && summary.tools.tool5.status === 'completed') ||
                       (summary.tools.tool7 && summary.tools.tool7.status === 'completed');
    return t1 && t2 && hasGrounding;
  },

  // ============================================================
  // DATA ASSEMBLY
  // ============================================================

  /**
   * Build structured text payload from all completed tools for GPT prompts.
   * @param {Object} summary - from CollectiveResults.getStudentSummary()
   * @returns {string} structured text
   */
  buildCapstonePayload(summary) {
    var lines = [];
    lines.push('=== STUDENT ASSESSMENT DATA ===');
    lines.push('Tools Completed: ' + summary.completedCount + ' of ' + summary.totalTools);
    lines.push('');

    // --- Tool 1: Core Trauma Strategy ---
    var t1 = summary.tools.tool1;
    if (t1 && t1.status === 'completed' && t1.data) {
      lines.push('=== TOOL 1: CORE TRAUMA STRATEGY ===');
      lines.push('What it measures: Which of 6 childhood survival strategies now drives financial decisions.');
      lines.push('Scoring: Ranges from -25 to +25. Higher score = strategy is MORE dominant and active.');
      lines.push('A low or negative score means that strategy is NOT active for this person.');
      var winner = t1.data.winner || 'Unknown';
      var stratLabel = CollectiveResults.STRATEGY_LABELS[winner] || winner;
      var stratInsight = CollectiveResults.STRATEGY_INSIGHTS[winner] || '';
      lines.push('Dominant Strategy: ' + stratLabel);
      if (stratInsight) {
        lines.push('What this means: ' + stratInsight);
      }
      if (t1.data.scores) {
        lines.push('All Strategy Scores (higher = more active):');
        var stratDescriptions = {
          FSV: 'Using a false, negative self-image as armor — beliefs like "I am not worthy" or "I am not good enough"',
          ExVal: 'Needing external acceptance and recognition to feel safe — giving up authenticity to be what others value',
          Showing: 'Suffering or sacrificing when showing love — believing everyone deserves happiness except themselves',
          Receiving: 'Emotional disconnection — avoiding emotions or emotional people because love has meant pain',
          Control: 'Must maintain control of environment to stay safe — the more control, the more fear demands more control',
          Fear: 'Feeling like nothing is safe and nothing can be controlled — defaulting to worst-case scenarios and inaction'
        };
        for (var sk in t1.data.scores) {
          var sLabel = CollectiveResults.STRATEGY_LABELS[sk] || sk;
          var sDesc = stratDescriptions[sk] || '';
          lines.push('  ' + sLabel + ': ' + t1.data.scores[sk] + (sDesc ? ' — ' + sDesc : ''));
        }
      }
      lines.push('');
    }

    // --- Tool 2: Financial Clarity ---
    var t2 = summary.tools.tool2;
    if (t2 && t2.status === 'completed' && t2.data) {
      lines.push('=== TOOL 2: FINANCIAL CLARITY ===');
      lines.push('What it measures: Clarity across 5 financial domains — how well you see your financial reality');
      var results = t2.data.results || {};
      lines.push('Archetype: ' + (results.archetype || 'Not determined'));
      var benchmarks = results.benchmarks || {};
      for (var dk in benchmarks) {
        var b = benchmarks[dk];
        var label = CollectiveResults.DOMAIN_LABELS[dk] || dk;
        lines.push('  ' + label + ': ' + Math.round(b.percentage || 0) + '% (' + (b.level || 'Unknown') + ')');
      }
      if (results.priorityList && results.priorityList.length > 0) {
        lines.push('Top Priority: ' + (CollectiveResults.DOMAIN_LABELS[results.priorityList[0].domain] || results.priorityList[0].domain));
      }
      lines.push('');
    }

    // --- Grounding Tools (3, 5, 7) ---
    // Scoring key (applies to ALL grounding tools):
    // 0-100 scale where LOW = pattern is NOT active (healthy), HIGH = pattern IS strongly active (problematic)
    // 0-19: Minimal — healthy, pattern not active
    // 20-39: Low — mild pattern, good foundations
    // 40-59: Moderate — pattern is present, room for growth
    // 60-79: High — significant active pattern, needs focused work
    // 80-100: Critical — highly active, needs immediate attention

    var groundingTools = [
      {
        key: 'tool3', name: 'IDENTITY & VALIDATION',
        desc: 'Measures disconnection from your authentic self. Domain 1 (False Self-View) captures beliefs that distort how you see yourself and your financial reality. Domain 2 (External Validation) captures how much you let others opinions drive your financial decisions.',
        domainContext: {
          domain1: 'False Self-View — active disconnection from who you really are through negative self-beliefs',
          domain2: 'External Validation — passive disconnection where others opinions replace your own financial judgment'
        },
        subdomainContext: {
          subdomain_1_1: 'Measures the belief that you do not deserve financial freedom — high score means this person actively believes they are unworthy of wealth',
          subdomain_1_2: 'Measures scarcity mindset — high score means a persistent conviction that there will never be enough money no matter what',
          subdomain_1_3: 'Measures financial fog — high score means actively avoiding or unable to see their true financial picture',
          subdomain_2_1: 'Measures tying net worth to self-worth — high score means this person equates their bank balance with their personal value',
          subdomain_2_2: 'Measures image management — high score means financial decisions are driven by how others will perceive them',
          subdomain_2_3: 'Measures proving behavior — high score means compulsive spending or striving to demonstrate success to others'
        }
      },
      {
        key: 'tool5', name: 'LOVE & CONNECTION',
        desc: 'Measures disconnection from others through relationship patterns. Domain 1 (Issues Showing Love) captures compulsive giving and self-sacrifice that drains finances. Domain 2 (Issues Receiving Love) captures unhealthy dependence and inability to receive support.',
        domainContext: {
          domain1: 'Issues Showing Love — active disconnection through compulsive giving, people-pleasing, and financial self-sacrifice',
          domain2: 'Issues Receiving Love — passive disconnection through dependence, obligation, and inability to accept help without guilt'
        },
        subdomainContext: {
          subdomain_1_1: 'Measures love-equals-giving belief — high score means this person compulsively gives money to earn love or approval',
          subdomain_1_2: 'Measures self-neglect — high score means consistently putting everyone else financial needs above their own',
          subdomain_1_3: 'Measures rejection of support — high score means refusing financial help even when desperately needed',
          subdomain_2_1: 'Measures financial dependence — high score means believing they cannot manage money independently',
          subdomain_2_2: 'Measures obligation debt — high score means feeling they owe others financially for love or support received',
          subdomain_2_3: 'Measures perpetual indebtedness — high score means a cycle of borrowing and owing that feels inescapable'
        }
      },
      {
        key: 'tool7', name: 'SECURITY & CONTROL',
        desc: 'Measures disconnection from trust in life. Domain 1 (Control Leading to Isolation) captures self-imposed financial suffering through over-control. Domain 2 (Fear Leading to Isolation) captures creating financial disasters through under-protection and self-sabotage.',
        domainContext: {
          domain1: 'Control Leading to Isolation — active disconnection through hoarding, undercharging, and refusing to delegate or trust others with money',
          domain2: 'Fear Leading to Isolation — passive disconnection through lack of financial protection, self-sabotage at success, and trusting the wrong people'
        },
        subdomainContext: {
          subdomain_1_1: 'Measures undervaluing yourself — high score means systematically undercharging, doing free work, and not collecting money owed',
          subdomain_1_2: 'Measures financial hoarding — high score means having money but refusing to spend it, even on necessities or growth',
          subdomain_1_3: 'Measures micro-control — high score means inability to delegate financial tasks, trusting nobody else to handle money',
          subdomain_2_1: 'Measures financial exposure — high score means failing to protect themselves financially (no insurance, no contracts, no boundaries)',
          subdomain_2_2: 'Measures success sabotage — high score means repeatedly undermining their own financial progress right when things improve',
          subdomain_2_3: 'Measures betrayal expectation — high score means expecting financial betrayal and either attracting it or seeing it where it does not exist'
        }
      }
    ];

    for (var gi = 0; gi < groundingTools.length; gi++) {
      var gt = groundingTools[gi];
      var toolNum = gt.key.replace('tool', '');
      var td = summary.tools[gt.key];
      if (td && td.status === 'completed' && td.data) {
        lines.push('=== TOOL ' + toolNum + ': ' + gt.name + ' ===');
        lines.push('What it measures: ' + gt.desc);
        lines.push('SCORING KEY: 0-100 where LOW (0-19) = pattern NOT active, HIGH (80-100) = pattern critically active.');
        var scoring = td.data.scoring || {};
        var oq = Math.round(scoring.overallQuotient || 0);
        var oqLevel = oq >= 80 ? 'CRITICAL' : (oq >= 60 ? 'HIGH' : (oq >= 40 ? 'MODERATE' : (oq >= 20 ? 'LOW' : 'MINIMAL')));
        lines.push('Overall Quotient: ' + oq + '/100 (' + oqLevel + ' — ' + (oq >= 60 ? 'this pattern IS significantly active' : (oq >= 40 ? 'this pattern is moderately active' : 'this pattern is NOT strongly active')) + ')');
        var config = CollectiveResults.GROUNDING_CONFIG[gt.key];
        if (scoring.domainQuotients && config) {
          var d1 = Math.round(scoring.domainQuotients.domain1 || 0);
          var d2 = Math.round(scoring.domainQuotients.domain2 || 0);
          lines.push('  ' + config.domain1Name + ': ' + d1 + '/100 — ' + (gt.domainContext ? gt.domainContext.domain1 : ''));
          lines.push('  ' + config.domain2Name + ': ' + d2 + '/100 — ' + (gt.domainContext ? gt.domainContext.domain2 : ''));
        }
        // Include key subdomain scores with interpretive context
        if (scoring.subdomainQuotients && config && config.subdomains) {
          lines.push('  Subdomain Breakdown:');
          for (var sdKey in scoring.subdomainQuotients) {
            var sdLabel = config.subdomains[sdKey] || sdKey;
            var sdScore = Math.round(scoring.subdomainQuotients[sdKey] || 0);
            var sdContext = (gt.subdomainContext && gt.subdomainContext[sdKey]) || '';
            var sdActive = sdScore >= 60 ? ' [ACTIVE]' : (sdScore >= 40 ? ' [moderate]' : ' [not active]');
            lines.push('    "' + sdLabel + '": ' + sdScore + '/100' + sdActive + (sdContext ? ' — ' + sdContext : ''));
          }
        }
        lines.push('');
      }
    }

    // --- Tool 4: Budget Framework ---
    var t4 = summary.tools.tool4;
    if (t4 && t4.status === 'completed' && t4.data) {
      lines.push('=== TOOL 4: BUDGET FRAMEWORK ===');
      lines.push('What it measures: How income is allocated across Multiply, Essentials, Freedom, and Enjoyment');
      var d4 = t4.data;
      lines.push('Monthly Income: $' + Number(d4.monthlyIncome || 0).toLocaleString('en-US'));
      lines.push('Allocation: Multiply=' + (d4.multiply || 0) + '%, Essentials=' + (d4.essentials || 0) + '%, Freedom=' + (d4.freedom || 0) + '%, Enjoyment=' + (d4.enjoyment || 0) + '%');
      lines.push('Priority: ' + (d4.priority || 'Not selected'));
      lines.push('');
    }

    // --- Tool 6: Retirement Blueprint ---
    var t6 = summary.tools.tool6;
    if (t6 && t6.status === 'completed') {
      lines.push('=== TOOL 6: RETIREMENT BLUEPRINT ===');
      lines.push('What it measures: Retirement savings strategy — vehicles, contributions, and projected outcomes');
      var d6 = t6.data || {};
      // Try enriched data from scenarios
      var t6Full = null;
      try {
        var t6Scenarios = typeof Tool6 !== 'undefined' && Tool6.getScenarios ? Tool6.getScenarios(summary.clientId) : [];
        if (t6Scenarios && t6Scenarios.length > 0) {
          t6Full = t6Scenarios.find(function(s) { return s.isLatest; }) || t6Scenarios[0];
        }
      } catch (e) { /* ignore */ }

      var monthlyBudget = (t6Full && t6Full.monthlyBudget) || d6.monthlyBudget || 0;
      var projectedBalance = (t6Full && t6Full.projectedBalance) || d6.projectedBalance || 0;
      var yearsToRet = t6Full ? t6Full.yearsToRetirement : null;
      var age = t6Full ? t6Full.age : null;
      var taxStrategy = (t6Full && t6Full.taxStrategy) || d6.taxStrategy || 'Not set';
      var investScore = (t6Full && t6Full.investmentScore) || d6.investmentScore || 0;

      lines.push('Monthly Contribution: $' + Number(monthlyBudget).toLocaleString('en-US'));
      lines.push('Projected Nest Egg: $' + Number(Math.round(projectedBalance)).toLocaleString('en-US'));
      if (yearsToRet) lines.push('Years to Retirement: ' + yearsToRet + (age ? ' (current age ' + age + ')' : ''));
      lines.push('Tax Strategy: ' + taxStrategy);
      lines.push('Investment Score: ' + investScore + '/7');
      lines.push('');
    }

    // --- Tool 8: Investment Planning ---
    var t8 = summary.tools.tool8;
    if (t8 && t8.status === 'completed') {
      lines.push('=== TOOL 8: INVESTMENT PLANNING ===');
      lines.push('What it measures: Investment scenario modeling — returns, risk, and goal feasibility');
      var d8 = t8.data || {};
      // Try enriched data from scenarios
      var t8Full = null;
      try {
        var t8Scenarios = typeof Tool8 !== 'undefined' && Tool8.getUserScenarios ? Tool8.getUserScenarios(summary.clientId) : [];
        if (t8Scenarios && t8Scenarios.length > 0) {
          t8Full = t8Scenarios.find(function(s) { return s.isLatest; }) || t8Scenarios[0];
        }
      } catch (e) { /* ignore */ }

      var monthlyInvest = (t8Full && t8Full.M_real) || d8.M_real || 0;
      var timeHorizon = (t8Full && t8Full.T) || d8.T || 0;
      var risk8 = (t8Full && t8Full.risk) || d8.risk || 0;
      var reqNestEgg = t8Full ? (t8Full.Areq || 0) : 0;
      var monthlyRetIncome = t8Full ? (t8Full.M0 || 0) : 0;
      var currentAssets = t8Full ? (t8Full.A0 || 0) : 0;
      var scenarioName = (t8Full && t8Full.name) || d8.scenarioName || '';

      if (scenarioName) lines.push('Scenario: ' + scenarioName);
      lines.push('Monthly Investment: $' + Number(Math.round(monthlyInvest)).toLocaleString('en-US'));
      lines.push('Time Horizon: ' + timeHorizon + ' years');
      lines.push('Risk Level: ' + risk8 + '/10');
      if (reqNestEgg > 0) lines.push('Required Nest Egg: $' + Number(Math.round(reqNestEgg)).toLocaleString('en-US'));
      if (monthlyRetIncome > 0) lines.push('Monthly Retirement Income Goal: $' + Number(Math.round(monthlyRetIncome)).toLocaleString('en-US'));
      if (currentAssets > 0) lines.push('Current Savings: $' + Number(Math.round(currentAssets)).toLocaleString('en-US'));
      lines.push('');
    }

    // --- Detection Engine Summary ---
    lines.push('=== CROSS-TOOL DETECTION ENGINE FINDINGS ===');
    try {
      var profile = CollectiveResults._detectProfile(summary);
      if (profile) {
        lines.push('Integration Profile: ' + profile.name + ' (confidence: ' + profile.confidence + ')');
        lines.push('  Financial Signature: ' + profile.financialSignature);
      }
    } catch (e) { /* ignore */ }

    try {
      var warnings = CollectiveResults._generateWarnings(summary);
      if (warnings && warnings.length > 0) {
        lines.push('Active Warnings:');
        var warnCount = Math.min(warnings.length, 4);
        for (var wi = 0; wi < warnCount; wi++) {
          lines.push('  [' + warnings[wi].priority + '] ' + warnings[wi].type + ': ' + warnings[wi].message);
        }
      }
    } catch (e) { /* ignore */ }

    try {
      var gap = CollectiveResults._calculateAwarenessGap(summary);
      if (gap) {
        lines.push('Awareness Gap: ' + gap.severity + ' (psych=' + Math.round(gap.psychScore) + ', stress=' + Math.round(gap.stressScore) + ', gap=' + Math.round(gap.gapScore) + ')');
      }
    } catch (e) { /* ignore */ }

    try {
      var locks = CollectiveResults._detectBeliefLocks(summary);
      if (locks && locks.length > 0) {
        lines.push('Belief Locks:');
        for (var li = 0; li < locks.length; li++) {
          lines.push('  ' + locks[li].name + ' [' + locks[li].strength + '] — ' + locks[li].financialImpact);
        }
      }
    } catch (e) { /* ignore */ }

    try {
      var bbGaps = CollectiveResults._detectBeliefBehaviorGaps(summary);
      if (bbGaps && bbGaps.length > 0) {
        lines.push('Top Belief-Behavior Gaps:');
        var bbCount = Math.min(bbGaps.length, 3);
        for (var bi = 0; bi < bbCount; bi++) {
          var bb = bbGaps[bi];
          lines.push('  "' + bb.label + '" (' + bb.tool + '): belief=' + bb.beliefScore.toFixed(1) + ', behavior=' + bb.behaviorScore.toFixed(1) + ', gap=' + bb.gap.toFixed(1) + ' — ' + bb.direction);
        }
      }
    } catch (e) { /* ignore */ }

    return lines.join('\n');
  },

  // ============================================================
  // GPT CALL 1: FINANCIAL STORY (NARRATIVE)
  // ============================================================

  STORY_SYSTEM_PROMPT:
    'You are a financial psychology coach writing a concise, personal narrative about ' +
    'a student who has completed multiple financial and psychological assessments.\n\n' +

    'Your task is to write exactly 3 SHORT paragraphs (3-4 sentences each) that tell ' +
    'the story of WHO this person is with money. Not a clinical diagnosis, but a mirror ' +
    'they will recognize themselves in. Keep it tight and impactful — every sentence ' +
    'must earn its place.\n\n' +

    'CRITICAL SCORING CONTEXT:\n' +
    '- Tools 3, 5, 7 use a 0-100 quotient scale where LOW = pattern NOT active (healthy) ' +
    'and HIGH = pattern IS actively problematic. A score of 20 means virtually no issue. ' +
    'A score of 75 means that pattern is significantly driving their financial life.\n' +
    '- Tool 1 scores range -25 to +25. The highest score is the dominant strategy. Low or ' +
    'negative scores mean that strategy is NOT active.\n' +
    '- Do NOT treat all scores as concerning. Only discuss patterns that are actually active ' +
    '(quotient 40+ for Tools 3/5/7, or the dominant strategy for Tool 1).\n\n' +

    'TONE: Direct, compassionate, unflinching. Like a coach who knows them. Use "you" ' +
    'throughout.\n\n' +

    'LANGUAGE RULES:\n' +
    '- Do not use contractions (write "do not" not "don\'t")\n' +
    '- Do not use markdown formatting (no bold, no headers, no bullets)\n' +
    '- Reference SPECIFIC data (scores, percentages, strategy names)\n' +
    '- Every paragraph connects a psychological pattern to a financial behavior\n' +
    '- Write in flowing paragraphs, not lists\n\n' +

    'STRUCTURE: Return your response with exactly these markers on their own line:\n' +
    'FINANCIAL_STORY_P1: (Who they are with money — their dominant strategy and how it ' +
    'shaped their financial identity. 3-4 sentences.)\n' +
    'FINANCIAL_STORY_P2: (Where this shows up — the most significant patterns from their ' +
    'data, connecting psychology to financial decisions. Reference specific numbers. 3-4 sentences.)\n' +
    'FINANCIAL_STORY_P3: (Where this can go — contradictions that reveal growth potential, ' +
    'ending with grounded, realistic hope. 3-4 sentences.)\n',

  STORY_MARKERS: [
    'FINANCIAL_STORY_P1:', 'FINANCIAL_STORY_P2:', 'FINANCIAL_STORY_P3:'
  ],

  /**
   * Generate the "Your Financial Story" narrative.
   * 3-tier fallback: Try → Retry → Template
   * @param {Object} summary
   * @returns {Object} { paragraphs: string[], source: string, timestamp: string }
   */
  generateFinancialStory(summary) {
    var payload = this.buildCapstonePayload(summary);
    var userPrompt = 'Here is the complete assessment data for this student across all completed tools. Write their financial story.\n\n' + payload;

    // Tier 1
    try {
      Logger.log('[CapstoneGPT] Generating financial story (Tier 1)...');
      var text = IntegrationGPT.callGPT({
        systemPrompt: this.STORY_SYSTEM_PROMPT,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.4,
        maxTokens: 1000
      });
      var parsed = this.parseFinancialStory(text);
      if (parsed.paragraphs.length >= 2) {
        parsed.source = 'gpt';
        parsed.timestamp = new Date().toISOString();
        return parsed;
      }
      Logger.log('[CapstoneGPT] Tier 1 story validation failed, trying Tier 2');
    } catch (e) {
      Logger.log('[CapstoneGPT] Tier 1 story error: ' + e.message);
    }

    // Tier 2: Retry after delay
    try {
      Utilities.sleep(2000);
      Logger.log('[CapstoneGPT] Generating financial story (Tier 2)...');
      var text2 = IntegrationGPT.callGPT({
        systemPrompt: this.STORY_SYSTEM_PROMPT,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.4,
        maxTokens: 1000
      });
      var parsed2 = this.parseFinancialStory(text2);
      if (parsed2.paragraphs.length >= 2) {
        parsed2.source = 'gpt_retry';
        parsed2.timestamp = new Date().toISOString();
        return parsed2;
      }
      Logger.log('[CapstoneGPT] Tier 2 story validation failed, falling back');
    } catch (e) {
      Logger.log('[CapstoneGPT] Tier 2 story error: ' + e.message);
    }

    // Tier 3: Template fallback
    Logger.log('[CapstoneGPT] Using fallback story');
    return this.generateFallbackStory(summary);
  },

  // ============================================================
  // GPT CALL 2: CAPSTONE INSIGHTS (CONCLUSIONS)
  // ============================================================

  INSIGHTS_SYSTEM_PROMPT:
    'You are a financial psychology analyst producing a capstone insight report for ' +
    'a student who has completed multiple assessments. Your job is to identify the ' +
    'cross-tool patterns, contradictions, and opportunities that no single tool can reveal.\n\n' +

    'CRITICAL SCORING CONTEXT:\n' +
    '- Tools 3, 5, 7 use a 0-100 quotient where LOW = pattern NOT active (healthy) and ' +
    'HIGH = pattern IS actively problematic. A score of 20 is fine. A score of 70+ is significant.\n' +
    '- Tool 1 scores -25 to +25. Only the dominant (highest) strategy matters.\n' +
    '- Do NOT flag low scores as concerns. Only discuss patterns that are actually active.\n\n' +

    'ANALYSIS FOCUS:\n' +
    '- Cross-tool patterns: Where do 2+ tools tell the same story?\n' +
    '- Contradictions: Where do tools disagree? (e.g., high retirement savings but high fear scores)\n' +
    '- Blind spots: What is the student likely NOT seeing?\n' +
    '- Leverage points: Where would one change cascade across multiple areas?\n\n' +

    'TONE: Analytical but accessible. Like a coach presenting findings. Use "you" throughout.\n\n' +

    'LANGUAGE RULES:\n' +
    '- Do not use contractions (write "do not" not "don\'t", "cannot" not "can\'t")\n' +
    '- Do not use markdown formatting (no bold, no headers, no bullet points)\n' +
    '- Do not use clinical or diagnostic language\n' +
    '- Every insight MUST reference specific data from at least 2 different tools\n' +
    '- Action steps must be concrete and achievable within 30 days\n\n' +

    'STRUCTURE: Return your response with exactly these section markers on their own line:\n' +
    'INSIGHT_1: (First cross-tool pattern or contradiction — 2-3 sentences)\n' +
    'INSIGHT_2: (Second pattern — 2-3 sentences)\n' +
    'INSIGHT_3: (Third pattern — 2-3 sentences)\n' +
    'INSIGHT_4: (Fourth pattern — 2-3 sentences, only if data clearly supports it)\n' +
    'ACTION_1: (First priority action step — 1-2 sentences, specific and concrete)\n' +
    'ACTION_2: (Second action step — 1-2 sentences)\n' +
    'ACTION_3: (Third action step — 1-2 sentences)\n',

  INSIGHTS_MARKERS: [
    'INSIGHT_1:', 'INSIGHT_2:', 'INSIGHT_3:', 'INSIGHT_4:',
    'ACTION_1:', 'ACTION_2:', 'ACTION_3:'
  ],

  /**
   * Generate "Capstone Insights" — cross-tool patterns and actions.
   * 3-tier fallback.
   * @param {Object} summary
   * @returns {Object} { insights: string[], actions: string[], source: string, timestamp: string }
   */
  generateCapstoneInsights(summary) {
    var payload = this.buildCapstonePayload(summary);
    var userPrompt = 'Here is the complete assessment data for this student across all completed tools. Identify cross-tool patterns, contradictions, and opportunities. Then provide prioritized action steps.\n\n' + payload;

    // Tier 1
    try {
      Logger.log('[CapstoneGPT] Generating capstone insights (Tier 1)...');
      var text = IntegrationGPT.callGPT({
        systemPrompt: this.INSIGHTS_SYSTEM_PROMPT,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1200
      });
      var parsed = this.parseCapstoneInsights(text);
      if (parsed.insights.length >= 3 && parsed.actions.length >= 2) {
        parsed.source = 'gpt';
        parsed.timestamp = new Date().toISOString();
        return parsed;
      }
      Logger.log('[CapstoneGPT] Tier 1 insights validation failed, trying Tier 2');
    } catch (e) {
      Logger.log('[CapstoneGPT] Tier 1 insights error: ' + e.message);
    }

    // Tier 2
    try {
      Utilities.sleep(2000);
      Logger.log('[CapstoneGPT] Generating capstone insights (Tier 2)...');
      var text2 = IntegrationGPT.callGPT({
        systemPrompt: this.INSIGHTS_SYSTEM_PROMPT,
        userPrompt: userPrompt,
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1200
      });
      var parsed2 = this.parseCapstoneInsights(text2);
      if (parsed2.insights.length >= 3 && parsed2.actions.length >= 2) {
        parsed2.source = 'gpt_retry';
        parsed2.timestamp = new Date().toISOString();
        return parsed2;
      }
      Logger.log('[CapstoneGPT] Tier 2 insights validation failed, falling back');
    } catch (e) {
      Logger.log('[CapstoneGPT] Tier 2 insights error: ' + e.message);
    }

    // Tier 3
    Logger.log('[CapstoneGPT] Using fallback insights');
    return this.generateFallbackInsights(summary);
  },

  // ============================================================
  // PARSING
  // ============================================================

  /**
   * Generic section extractor that works with any marker set.
   * @param {string} text - GPT response text
   * @param {string} marker - The marker to extract (e.g., "INSIGHT_1:")
   * @param {string[]} allMarkers - All possible markers for boundary detection
   * @returns {string} extracted text, trimmed
   */
  extractSection(text, marker, allMarkers) {
    if (!text) return '';

    // Handle optional markdown bold around markers
    var cleanText = text.replace(/\*\*/g, '');
    var idx = cleanText.indexOf(marker);
    if (idx === -1) return '';

    var start = idx + marker.length;
    var end = cleanText.length;

    for (var i = 0; i < allMarkers.length; i++) {
      if (allMarkers[i] === marker) continue;
      var nextIdx = cleanText.indexOf(allMarkers[i], start);
      if (nextIdx !== -1 && nextIdx < end) {
        end = nextIdx;
      }
    }

    return cleanText.substring(start, end).trim();
  },

  /**
   * Parse GPT response into Financial Story structure.
   * @param {string} text
   * @returns {Object} { paragraphs: string[] }
   */
  parseFinancialStory(text) {
    var paragraphs = [];
    for (var i = 0; i < this.STORY_MARKERS.length; i++) {
      var section = this.extractSection(text, this.STORY_MARKERS[i], this.STORY_MARKERS);
      if (section && section.length > 20) {
        paragraphs.push(section);
      }
    }
    return { paragraphs: paragraphs };
  },

  /**
   * Parse GPT response into Capstone Insights structure.
   * @param {string} text
   * @returns {Object} { insights: string[], actions: string[] }
   */
  parseCapstoneInsights(text) {
    var insights = [];
    var actions = [];

    for (var i = 0; i < this.INSIGHTS_MARKERS.length; i++) {
      var marker = this.INSIGHTS_MARKERS[i];
      var section = this.extractSection(text, marker, this.INSIGHTS_MARKERS);
      if (section && section.length > 15) {
        if (marker.indexOf('INSIGHT_') === 0) {
          insights.push(section);
        } else if (marker.indexOf('ACTION_') === 0) {
          actions.push(section);
        }
      }
    }

    return { insights: insights, actions: actions };
  },

  // ============================================================
  // FALLBACKS
  // ============================================================

  /**
   * Template-based financial story when GPT fails.
   */
  generateFallbackStory(summary) {
    var paragraphs = [];

    // P1: Who they are with money — strategy + identity
    var t1 = summary.tools.tool1;
    var t2 = summary.tools.tool2;
    var p1Parts = [];
    if (t1 && t1.status === 'completed' && t1.data) {
      var stratName = CollectiveResults.STRATEGY_LABELS[t1.data.winner] || t1.data.winner;
      var stratInsight = CollectiveResults.STRATEGY_INSIGHTS[t1.data.winner] || '';
      p1Parts.push('Your dominant trauma strategy is ' + stratName + '. ' + stratInsight);
    }
    if (t2 && t2.status === 'completed' && t2.data && t2.data.results) {
      p1Parts.push('As a "' + (t2.data.results.archetype || 'your archetype') + '," this strategy has been quietly shaping how you see and interact with money.');
    }
    if (p1Parts.length > 0) {
      paragraphs.push(p1Parts.join(' '));
    }

    // P2: Where it shows up — most active patterns + financial structure
    var p2Parts = [];
    var groundingKeys = ['tool3', 'tool5', 'tool7'];
    var groundingNames = { tool3: 'Identity & Validation', tool5: 'Love & Connection', tool7: 'Security & Control' };
    for (var gk = 0; gk < groundingKeys.length; gk++) {
      var gKey = groundingKeys[gk];
      var gTool = summary.tools[gKey];
      if (gTool && gTool.status === 'completed' && gTool.data && gTool.data.scoring) {
        var oq = Math.round(gTool.data.scoring.overallQuotient || 0);
        if (oq >= 40) {
          var level = oq >= 65 ? 'significantly active' : 'moderately active';
          p2Parts.push('Your ' + groundingNames[gKey] + ' patterns score ' + oq + '/100 (' + level + ').');
        }
      }
    }
    var t4 = summary.tools.tool4;
    if (t4 && t4.status === 'completed' && t4.data) {
      var d4 = t4.data;
      p2Parts.push('Your budget allocates ' + (d4.multiply || 0) + '% to wealth-building, ' +
        (d4.essentials || 0) + '% to Essentials, ' + (d4.freedom || 0) + '% to Freedom, and ' +
        (d4.enjoyment || 0) + '% to Enjoyment.');
    }
    if (p2Parts.length > 0) {
      paragraphs.push(p2Parts.join(' '));
    }

    // P3: Where this can go — closing with hope
    paragraphs.push(
      'The fact that you are examining these patterns is itself significant. ' +
      'You now have a map of where your psychological wiring meets your financial reality. ' +
      'The next step is not to change everything at once but to notice these patterns as they happen in real time.'
    );

    return {
      paragraphs: paragraphs,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Template-based capstone insights when GPT fails.
   */
  generateFallbackInsights(summary) {
    var insights = [];
    var actions = [];

    // Run detection engines for data
    var profile = null;
    var warnings = [];
    var gap = null;
    var locks = [];

    try { profile = CollectiveResults._detectProfile(summary); } catch (e) { /* ignore */ }
    try { warnings = CollectiveResults._generateWarnings(summary) || []; } catch (e) { /* ignore */ }
    try { gap = CollectiveResults._calculateAwarenessGap(summary); } catch (e) { /* ignore */ }
    try { locks = CollectiveResults._detectBeliefLocks(summary) || []; } catch (e) { /* ignore */ }

    // Insight from profile + archetype
    var t2 = summary.tools.tool2;
    if (profile && t2 && t2.status === 'completed' && t2.data && t2.data.results) {
      insights.push(
        'Your integration profile (' + profile.name + ') combined with your financial archetype (' +
        t2.data.results.archetype + ') suggests ' + profile.financialSignature + '.'
      );
    }

    // Insight from awareness gap
    if (gap && gap.severity !== 'normal') {
      insights.push(
        'Your awareness gap is ' + gap.severity + ': your psychological impact scores average ' +
        Math.round(gap.psychScore) + ' while your reported financial stress sits at ' +
        Math.round(gap.stressScore) + '. This ' + Math.round(gap.gapScore) +
        '-point gap suggests you may not be fully seeing how your patterns affect your finances.'
      );
    }

    // Insight from strongest belief lock
    if (locks.length > 0) {
      var topLock = locks[0];
      insights.push(
        'Your strongest belief lock is the "' + topLock.name + '" pattern (' + topLock.strength +
        '). This means ' + topLock.financialImpact
      );
    }

    // Insight from top warning
    if (warnings.length > 0) {
      insights.push(
        'Your highest-priority warning is ' + warnings[0].type.replace(/_/g, ' ').toLowerCase() +
        ': ' + warnings[0].message
      );
    }

    // Fallback insight if we have few
    if (insights.length < 3) {
      insights.push(
        'With ' + summary.completedCount + ' of 8 tools completed, your data reveals patterns that ' +
        'become clearer with each additional assessment. Complete remaining tools for deeper cross-tool insights.'
      );
    }

    // Actions
    actions.push('Review your Tool 2 Financial Clarity results and identify one domain below 50% to focus on this month.');
    if (summary.tools.tool4 && summary.tools.tool4.status === 'completed' && summary.tools.tool4.data) {
      var mult = summary.tools.tool4.data.multiply || 0;
      if (mult < 15) {
        actions.push('Your Multiply allocation is only ' + mult + '%. Explore increasing it by even 2-3% to accelerate wealth-building.');
      }
    }
    actions.push('Spend 10 minutes this week noticing when your dominant trauma strategy shows up in a financial decision. Do not try to change it yet — just notice.');

    return {
      insights: insights,
      actions: actions,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // CACHING
  // ============================================================

  /**
   * Compute a hash string from completed tools and their timestamps.
   * Changes when a student completes or re-completes a tool.
   */
  computeToolsHash(summary) {
    var parts = [];
    var toolIds = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8'];
    for (var i = 0; i < toolIds.length; i++) {
      var t = summary.tools[toolIds[i]];
      if (t && t.status === 'completed') {
        parts.push(toolIds[i] + ':' + (t.timestamp || 'none'));
      }
    }
    return parts.join('|');
  },

  /**
   * Get cached result if still valid (tools hash matches).
   * @returns {Object|null} parsed result or null if cache miss/stale
   */
  getCachedResult(clientId, callType, summary) {
    try {
      var ss = SpreadsheetApp.openById(
        PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') ||
        SpreadsheetApp.getActiveSpreadsheet().getId()
      );
      var sheet = ss.getSheetByName(CONFIG.SHEETS.CAPSTONE_GPT_CACHE);
      if (!sheet) return null;

      var data = sheet.getDataRange().getValues();
      if (data.length < 2) return null;

      var currentHash = this.computeToolsHash(summary);

      // Search from bottom (most recent first)
      for (var i = data.length - 1; i >= 1; i--) {
        var row = data[i];
        if (String(row[1]).trim() === clientId &&
            String(row[2]).trim() === callType &&
            String(row[6]).trim() === 'TRUE') {
          // Check hash
          if (String(row[5]).trim() === currentHash) {
            try {
              return JSON.parse(row[3]);
            } catch (e) {
              return null;
            }
          }
          return null; // Hash mismatch = stale
        }
      }
    } catch (e) {
      Logger.log('[CapstoneGPT] Cache read error: ' + e.message);
    }
    return null;
  },

  /**
   * Write result to cache sheet. Marks previous entries as not latest.
   */
  cacheResult(clientId, callType, result, summary) {
    try {
      var ss = SpreadsheetApp.openById(
        PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') ||
        SpreadsheetApp.getActiveSpreadsheet().getId()
      );
      var sheet = ss.getSheetByName(CONFIG.SHEETS.CAPSTONE_GPT_CACHE);

      // Auto-create sheet if missing
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.SHEETS.CAPSTONE_GPT_CACHE);
        sheet.appendRow(['Timestamp', 'Client_ID', 'Call_Type', 'Data', 'Source', 'Tools_Hash', 'Is_Latest']);
        sheet.setFrozenRows(1);
      }

      var data = sheet.getDataRange().getValues();

      // Mark previous entries for this client+callType as not latest
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][1]).trim() === clientId &&
            String(data[i][2]).trim() === callType &&
            String(data[i][6]).trim() === 'TRUE') {
          sheet.getRange(i + 1, 7).setValue('FALSE');
        }
      }

      // Append new row
      var hash = this.computeToolsHash(summary);
      sheet.appendRow([
        new Date().toISOString(),
        clientId,
        callType,
        JSON.stringify(result),
        result.source || 'unknown',
        hash,
        'TRUE'
      ]);

    } catch (e) {
      Logger.log('[CapstoneGPT] Cache write error: ' + e.message);
    }
  }

};
