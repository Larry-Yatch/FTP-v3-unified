/**
 * Tool5.js
 * Love & Connection Grounding Tool
 *
 * Addresses: Disconnection from Others
 * Domains: Issues Showing Love (ISL) / Issues Receiving Love (IRL)
 * Core Question: "How do you use money to show and receive love?"
 *
 * Uses: All 5 grounding utilities from core/grounding/
 */

const Tool5 = {

  // ============================================================
  // TOOL CONFIGURATION
  // ============================================================

  config: {
    id: 'tool5',
    name: 'Love & Connection Grounding Tool',
    shortName: 'Love & Connection',
    scoreName: 'Disconnection from Others Quotient',
    purpose: 'Reveals patterns of disconnection from others through issues showing and receiving love',

    // Domain configuration
    domain1Name: 'Issues Showing Love',
    domain1Key: 'domain1',
    domain1Description: 'Patterns of compulsive giving and self-sacrifice in relationships',

    domain2Name: 'Issues Receiving Love',
    domain2Key: 'domain2',
    domain2Description: 'Patterns of unhealthy dependence and difficulty accepting help',

    // Subdomain configurations (6 total: 3 per domain)
    subdomains: [
      // ========================================
      // DOMAIN 1: ISSUES SHOWING LOVE
      // ========================================
      {
        key: 'subdomain_1_1',
        label: "I Must Give to Be Loved",
        description: 'Exploring patterns of believing love requires financial sacrifice',
        beliefBehaviorConnection: 'Believing you must give financially to be loved leads to compulsive giving even when you can\'t afford it',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'If I don\'t give/sacrifice financially, I won\'t be loved or valued',
            scale: {
              negative: 'Strongly Agree (I\'m certain love only comes through financial sacrifice)',
              positive: 'Strongly Disagree (I absolutely know I\'m loved for who I am, not what I give)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I give money to people even when I can\'t afford it, unable to say no',
            scale: {
              negative: 'Always (I constantly give beyond my means; completely unable to decline any request)',
              positive: 'Never (I consistently give from abundance, not deprivation; I can say no when necessary)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel guilty and fearful when I don\'t give, and anxious about losing love if I stop',
            scale: {
              negative: 'Always (Constant overwhelming guilt and fear; terror of abandonment dominates)',
              positive: 'Never (I feel no guilt about healthy boundaries; completely secure that love isn\'t transactional)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve put myself in financial hardship by giving to others, and/or enabled others\' dysfunction',
            scale: {
              negative: 'Always (I\'ve created severe hardship through compulsive giving)',
              positive: 'Never (I consistently give sustainably and support others\' growth, not dysfunction)'
            }
          },
          // Open Response
          {
            text: 'Who in your life do you feel you must give money to, and describe a specific time you gave money you couldn\'t afford to give—what did you fear would happen if you didn\'t, and how did it impact you financially and emotionally?'
          }
        ]
      },

      {
        key: 'subdomain_1_2',
        label: 'Their Needs > My Needs',
        description: 'Exploring patterns of believing others\' needs are more important',
        beliefBehaviorConnection: 'Believing others\' needs are more important leads to self-abandonment',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Others\' financial needs are always more important than my own',
            scale: {
              negative: 'Strongly Agree (I\'m absolutely certain others\' needs always matter more; mine are irrelevant)',
              positive: 'Strongly Disagree (I know my needs and others\' needs are equally valid; balance is essential)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I sacrifice my own financial needs or goals because I believe others deserve help more than I deserve to meet my own needs',
            scale: {
              negative: 'Always (I always sacrifice my financial wellbeing because I believe others\' needs are more legitimate)',
              positive: 'Never (I consistently honor both my needs and others\' needs as equally important)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel selfish when I prioritize my financial needs over others\'',
            scale: {
              negative: 'Always (Crushing guilt and selfishness dominate whenever I consider my own needs)',
              positive: 'Never (I feel no guilt about appropriate self-care; know my needs are valid and necessary)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve suffered financially by always putting others first, while they didn\'t reciprocate',
            scale: {
              negative: 'Always (I\'ve experienced severe suffering through constant self-abandonment)',
              positive: 'Never (I maintain healthy balance; relationships are reciprocal and I\'m cared for)'
            }
          },
          // Open Response
          {
            text: 'Think of a time you prioritized someone else\'s financial needs over your own when you couldn\'t afford to. What made their needs feel more legitimate than yours?'
          }
        ]
      },

      {
        key: 'subdomain_1_3',
        label: 'I Can\'t Accept Help',
        description: 'Exploring patterns of believing you must be the giver',
        beliefBehaviorConnection: 'Believing you must be the giver leads to refusing receiving',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Accepting financial help makes me weak/indebted/less worthy',
            scale: {
              negative: 'Strongly Agree (Accepting help absolutely makes me weak and worthless; it\'s shameful)',
              positive: 'Strongly Disagree (I completely know accepting help is strength; interdependence is beautiful)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I refuse money/help when offered, even when I desperately need it',
            scale: {
              negative: 'Always (I always refuse help regardless of desperation; accepting is impossible)',
              positive: 'Never (I graciously accept help when offered and needed; I can receive openly)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel shame and vulnerability about needing help; I must be the strong one',
            scale: {
              negative: 'Always (Overwhelming shame about any vulnerability; I must always be the provider)',
              positive: 'Never (I feel no shame about appropriate vulnerability; asking for help is strength)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve suffered unnecessarily by refusing help that was offered, and relationships suffered from my inability to receive',
            scale: {
              negative: 'Always (I\'ve experienced severe unnecessary suffering and relationship damage)',
              positive: 'Never (I accept help when offered and needed; relationships are reciprocal and healthy)'
            }
          },
          // Open Response
          {
            text: 'Describe a time you refused financial help you actually needed. What were you protecting by refusing?'
          }
        ]
      },

      // ========================================
      // DOMAIN 2: ISSUES RECEIVING LOVE
      // ========================================

      {
        key: 'subdomain_2_1',
        label: 'I Can\'t Make It Alone',
        description: 'Exploring patterns of believing you can\'t survive independently',
        beliefBehaviorConnection: 'Believing you can\'t survive independently leads to financial dependency',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I can\'t financially survive or thrive without support',
            scale: {
              negative: 'Strongly Agree (I\'m certain I absolutely can\'t survive alone; I\'m completely incapable)',
              positive: 'Strongly Disagree (I absolutely know I can thrive independently; I\'m fully capable)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I rely on others to cover my expenses or make financial decisions for me',
            scale: {
              negative: 'Always (I completely rely on others for financial support or decisions)',
              positive: 'Never (I consistently handle my own finances and decisions; I\'m financially independent)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel helpless and incapable of managing money on my own',
            scale: {
              negative: 'Always (Constant overwhelming helplessness about finances; complete incapability)',
              positive: 'Never (I feel confident and capable managing finances; empowered and independent)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve stayed in unhealthy relationships because of financial dependence',
            scale: {
              negative: 'Always (I\'ve remained in severely damaging relationships repeatedly due to financial dependence)',
              positive: 'Never (I consistently maintain financial independence; relationship choices are never driven by dependence)'
            }
          },
          // Open Response
          {
            text: 'Who do you currently depend on financially, and describe a situation you\'ve stayed in longer than you wanted because of money—what would you need to become financially independent, and what keeps you from taking those steps?'
          }
        ]
      },

      {
        key: 'subdomain_2_2',
        label: 'I Owe Them Everything',
        description: 'Exploring patterns of believing help creates debt',
        beliefBehaviorConnection: 'Believing help creates debt leads to feeling trapped by obligation',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I believe that when someone helps me financially, I owe them and can never fully repay them',
            scale: {
              negative: 'Strongly Agree (Any financial help creates permanent, unpayable debt that defines the relationship)',
              positive: 'Strongly Disagree (I consistently believe genuine help is given without creating permanent obligation)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I let others control my financial decisions because they\'ve helped me, even when I disagree',
            scale: {
              negative: 'Always (I completely surrender all financial autonomy to anyone who helps)',
              positive: 'Never (I consistently maintain full financial autonomy; help doesn\'t mean control)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel trapped and obligated by others\' financial help; the weight of owing them is heavy',
            scale: {
              negative: 'Always (Constant crushing weight of obligation; feel completely trapped by others\' help)',
              positive: 'Never (I feel no obligation or burden from help; free and grateful without weight)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve let people control me or made choices I regret because I felt I \'owed\' them for their help',
            scale: {
              negative: 'Always (I\'ve repeatedly surrendered control and made devastating choices due to obligation)',
              positive: 'Never (I consistently maintain autonomy; no regretted choices from obligation)'
            }
          },
          // Open Response
          {
            text: 'Who do you feel most indebted to, what do you think they expect from you in return for their help, and what specific financial choices have you made (or avoided making) because you felt you \'owed\' them?'
          }
        ]
      },

      {
        key: 'subdomain_2_3',
        label: 'If They Stop Giving, I\'m Abandoned',
        description: 'Exploring patterns of believing you\'ll be abandoned without help',
        beliefBehaviorConnection: 'Believing you\'ll be abandoned without help leads to emotional manipulation',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'If people stop helping me financially, it means they don\'t care and I\'m abandoned',
            scale: {
              negative: 'Strongly Agree (I\'m certain stopping help means complete abandonment; it proves they never cared)',
              positive: 'Strongly Disagree (I absolutely know financial help and love are independent; boundaries aren\'t abandonment)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I seek constant financial reassurance from others to feel secure in my relationships',
            scale: {
              negative: 'Always (I constantly need financial proof that people care; always seeking reassurance)',
              positive: 'Never (I never need financial reassurance to feel secure; I know I\'m valued beyond money)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxious and abandoned when I think about managing financially on my own',
            scale: {
              negative: 'Always (Constant terror and abandonment at the thought of financial independence)',
              positive: 'Never (No anxiety or abandonment feelings about financial independence; I feel secure)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve stayed in unhealthy relationships or situations because I was afraid to lose financial support',
            scale: {
              negative: 'Always (I\'ve repeatedly stayed in harmful situations due to fear of financial abandonment)',
              positive: 'Never (I never stay in unhealthy situations for financial reasons; my wellbeing comes first)'
            }
          },
          // Open Response
          {
            text: 'What do you fear would happen if your financial support stopped? Go deeper than money—what\'s the emotional fear underneath?'
          }
        ]
      }
    ]
  },

  // ============================================================
  // CORE METHODS
  // ============================================================

  /**
   * Main entry point - called by Router
   */
  render(clientId, page = 1) {
    const baseUrl = ScriptApp.getService().getUrl();

    // Page validation
    const totalPages = 7; // 1 intro + 6 subdomains
    if (page < 1 || page > totalPages) {
      throw new Error(`Invalid page number: ${page}. Must be 1-${totalPages}`);
    }

    try {
      // Get page content (just the form fields, not full HTML)
      const pageContent = GroundingFormBuilder.renderPageContent({
        toolId: this.config.id,
        pageNum: page,
        clientId: clientId,
        subdomains: this.config.subdomains,
        intro: this.getIntroContent()
      });

      // Use FormUtils to build standard page (like Tool 1 and Tool 2)
      const template = HtmlService.createTemplate(
        FormUtils.buildStandardPage({
          toolName: this.config.name,
          toolId: this.config.id,
          page: page,
          totalPages: totalPages,
          clientId: clientId,
          baseUrl: baseUrl,
          pageContent: pageContent,
          isFinalPage: (page === 7)
        })
      );

      return template.evaluate()
        .setTitle(`TruPath - ${this.config.name}`)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering Tool5 page ${page}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get custom intro content for Tool 3
   */
  getIntroContent() {
    return `
      <div class="card">
        <h2>Welcome to the Love & Connection Assessment</h2>
        <p class="muted" style="margin-bottom: 20px;">
          This assessment explores how you use money to show and receive love in relationships.
          It reveals patterns of disconnection from others through financial interactions.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">What This Assessment Explores</h3>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 1: Issues Showing Love</strong><br>
          How you use money to maintain relationships—patterns like compulsive giving, self-sacrifice,
          and refusing to accept repayment that deplete your resources while potentially enabling others.
        </p>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 2: Issues Receiving Love</strong><br>
          How you receive financial support—patterns like unhealthy dependence, feeling perpetually indebted,
          and equating financial help with emotional love that trap you or damage relationships.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">How it Works</h3>
        <ul style="line-height: 1.8; color: rgba(255, 255, 255, 0.85);">
          <li>You'll complete <strong>6 sections</strong>, one at a time (about 20-25 minutes total)</li>
          <li>Each section has <strong>4 scale questions</strong> and <strong>1 reflection question</strong></li>
          <li>Answer based on your actual patterns, not how you wish things were</li>
          <li>There are no "right" answers—this is about self-discovery</li>
          <li>AI analysis will provide personalized insights based on your responses</li>
        </ul>

        <div style="background: rgba(173, 145, 104, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ad9168; margin-top: 25px;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
            💡 <strong>Tip:</strong> This assessment may bring up vulnerable feelings about relationships.
            Be gentle with yourself as you explore these patterns.
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Process form submission (called by Router via saveToolPageData)
   */
  processSubmission(clientId, formData) {
    try {
      Logger.log(`[Tool5] Processing submission for ${clientId}`);

      // Extract all responses (24 scale + 6 open responses = 30 total)
      const responses = this.extractResponses(formData);

      // Calculate scores using GroundingScoring
      const scoringResult = GroundingScoring.calculateScores(
        responses,
        this.config.subdomains
      );

      Logger.log(`[Tool5] Scoring complete: Overall=${scoringResult.overallQuotient}`);

      // Collect all GPT insights (from cache)
      const gptInsights = this.collectGPTInsights(clientId);

      // Run final 3 synthesis calls
      const syntheses = this.runFinalSyntheses(clientId, scoringResult, gptInsights);

      Logger.log(`[Tool5] GPT syntheses complete`);

      // Save complete assessment data
      this.saveAssessmentData(clientId, {
        responses,
        scoringResult,
        gptInsights,
        syntheses
      });

      Logger.log(`[Tool5] Assessment data saved`);

      // Generate and return report
      return this.generateReport(clientId, scoringResult, {
        ...gptInsights,
        ...syntheses
      });

    } catch (error) {
      Logger.log(`[Tool5] Error processing submission: ${error.message}`);
      throw error;
    }
  },

  /**
   * Extract responses from form data
   */
  extractResponses(formData) {
    const responses = {};

    // Extract all fields from formData
    Object.keys(formData).forEach(key => {
      // Skip metadata fields
      if (['client', 'page', 'subdomain_index', 'subdomain_key'].includes(key)) {
        return;
      }

      responses[key] = formData[key];
    });

    return responses;
  },

  /**
   * Collect GPT insights from cache (created during form)
   */
  collectGPTInsights(clientId) {
    const insights = {
      subdomains: {}
    };

    this.config.subdomains.forEach(subdomain => {
      const cached = GroundingGPT.getCachedInsight(this.config.id, clientId, subdomain.key);
      if (cached) {
        insights.subdomains[subdomain.key] = cached;
      } else {
        Logger.log(`⚠️ No cached insight for ${subdomain.key}, will use fallback`);
      }
    });

    return insights;
  },

  /**
   * Run final 3 synthesis calls (2 domain + 1 overall)
   */
  runFinalSyntheses(clientId, scoringResult, gptInsights) {
    const syntheses = {};

    // Domain 1 synthesis
    syntheses.domain1 = GroundingGPT.synthesizeDomain({
      toolId: this.config.id,
      clientId: clientId,
      domainConfig: {
        key: this.config.domain1Key,
        name: this.config.domain1Name,
        description: this.config.domain1Description
      },
      subdomainInsights: this.extractDomainInsights(gptInsights.subdomains, 0, 3),
      subdomainScores: this.extractDomainScores(scoringResult.subdomainQuotients, 0, 3),
      domainScore: scoringResult.domainQuotients.domain1
    });

    // Domain 2 synthesis
    syntheses.domain2 = GroundingGPT.synthesizeDomain({
      toolId: this.config.id,
      clientId: clientId,
      domainConfig: {
        key: this.config.domain2Key,
        name: this.config.domain2Name,
        description: this.config.domain2Description
      },
      subdomainInsights: this.extractDomainInsights(gptInsights.subdomains, 3, 6),
      subdomainScores: this.extractDomainScores(scoringResult.subdomainQuotients, 3, 6),
      domainScore: scoringResult.domainQuotients.domain2
    });

    // Overall synthesis
    syntheses.overall = GroundingGPT.synthesizeOverall({
      toolId: this.config.id,
      clientId: clientId,
      toolConfig: this.config,
      domainSyntheses: {
        [this.config.domain1Name]: syntheses.domain1,
        [this.config.domain2Name]: syntheses.domain2
      },
      allScores: scoringResult
    });

    return syntheses;
  },

  /**
   * Extract insights for a specific domain
   */
  extractDomainInsights(allInsights, startIdx, endIdx) {
    const domainInsights = {};
    const subdomains = this.config.subdomains.slice(startIdx, endIdx);

    subdomains.forEach(subdomain => {
      if (allInsights[subdomain.key]) {
        domainInsights[subdomain.key] = allInsights[subdomain.key];
      }
    });

    return domainInsights;
  },

  /**
   * Extract scores for a specific domain
   */
  extractDomainScores(allScores, startIdx, endIdx) {
    const domainScores = {};
    const subdomains = this.config.subdomains.slice(startIdx, endIdx);

    subdomains.forEach(subdomain => {
      domainScores[subdomain.key] = allScores[subdomain.key];
    });

    return domainScores;
  },

  /**
   * Save assessment data to RESPONSES sheet
   */
  saveAssessmentData(clientId, data) {
    const dataToSave = {
      responses: data.responses,
      scoring: data.scoringResult,
      gpt_insights: data.gptInsights,
      syntheses: data.syntheses,
      timestamp: new Date().toISOString(),
      tool_version: '1.0.0'
    };

    // Use DataService to save
    DataService.saveToolResponse(
      clientId,
      this.config.id,
      dataToSave
    );

    // Clear GPT cache
    GroundingGPT.clearCache(this.config.id, clientId);
  },

  /**
   * Generate report HTML
   */
  generateReport(clientId, scoringResult, gptInsights) {
    const baseUrl = ScriptApp.getService().getUrl();

    const htmlString = GroundingReport.generateReport({
      toolId: this.config.id,
      toolConfig: this.config,
      clientId: clientId,
      baseUrl: baseUrl,
      scoringResult: scoringResult,
      gptInsights: gptInsights
    });

    return HtmlService.createHtmlOutput(htmlString);
  },

  /**
   * Render error page
   */
  renderErrorPage(error, clientId, baseUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <?!= include('shared/styles') ?>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 style="color: #dc3545;">Error</h1>
            <p>An error occurred while loading this assessment:</p>
            <p style="background: rgba(220, 53, 69, 0.1); padding: 15px; border-radius: 8px; font-family: monospace;">
              ${error.message}
            </p>
            <button class="btn-primary" onclick="window.location.href='${baseUrl}?route=dashboard&client=${clientId}'">
              Return to Dashboard →
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
