/**
 * Tool3.js
 * Identity & Validation Grounding Tool
 *
 * Addresses: Disconnection from Self
 * Domains: False Self-View (FSV) / External Validation (ExVal)
 * Core Question: "How do you see yourself, and how do others' opinions influence you?"
 *
 * Uses: All 5 grounding utilities from core/grounding/
 */

const Tool3 = {

  // ============================================================
  // TOOL CONFIGURATION
  // ============================================================

  config: {
    id: 'tool3',
    name: 'Identity & Validation Grounding Tool',
    shortName: 'Identity & Validation',
    scoreName: 'Disconnection from Self Quotient',
    purpose: 'Reveals patterns of disconnection from your authentic self through false self-view and external validation',

    // Domain configuration
    domain1Name: 'False Self-View',
    domain1Key: 'domain1',
    domain1Description: 'Confusion and lack of clarity about your financial reality',

    domain2Name: 'External Validation',
    domain2Key: 'domain2',
    domain2Description: 'Financial decisions driven by others\' opinions rather than your needs',

    // Subdomain configurations (6 total: 3 per domain)
    subdomains: [
      // ========================================
      // DOMAIN 1: FALSE SELF-VIEW
      // ========================================
      {
        key: 'subdomain_1_1',
        label: "I'm Not Worthy of Financial Freedom",
        description: 'Exploring patterns of unworthiness that lead to financial avoidance and self-sabotage',
        beliefBehaviorConnection: 'Believing you\'re not worthy of financial freedom leads to avoiding financial reality and scattering resources',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I\'m not the kind of person who gets to have financial freedom',
            scale: {
              negative: 'Strongly Agree (I\'m certain financial freedom is not for someone like me)',
              positive: 'Strongly Disagree (I absolutely know I\'m the kind of person who gets to have financial freedom)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I avoid looking at my financial accounts and/or have money scattered across multiple places where I can\'t easily access it',
            scale: {
              negative: 'Always (This describes me completely)',
              positive: 'Never (I consistently look at my accounts and keep my money organized and accessible)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel deep shame and unworthiness about my financial situation',
            scale: {
              negative: 'Always (Deep shame and unworthiness dominate)',
              positive: 'Never (I feel no shame; I accept where I am without judgment)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'Believing I\'m not the kind of person who gets financial freedom has caused me to miss opportunities or make poor financial decisions',
            scale: {
              negative: 'Always (I\'ve missed massive opportunities; the cost has been severe)',
              positive: 'Never (I seize appropriate opportunities and make sound financial decisions aligned with my goals)'
            }
          },
          // Open Response
          {
            text: 'What specifically are you afraid you\'d find or have to face if you looked at your finances clearly right now?'
          }
        ]
      },

      {
        key: 'subdomain_1_2',
        label: 'I\'ll Never Have Enough',
        description: 'Exploring patterns of scarcity thinking that create selective financial blindness',
        beliefBehaviorConnection: 'Believing there will never be enough leads to focusing on only income OR spending, never seeing the full picture',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I\'ll never have enough money, no matter how much I earn',
            scale: {
              negative: 'Strongly Agree (I\'m certain I\'ll never have enough, no matter what I do)',
              positive: 'Strongly Disagree (I know I can have enough; sufficiency is absolutely possible for me)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I ignore income and focus only on spending, or ignore spending and focus only on income - never paying attention to both at once',
            scale: {
              negative: 'Always (This perfectly describes my pattern)',
              positive: 'Never (I consistently pay attention to both income and spending simultaneously)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel constant anxiety that there\'s never enough and/or confusion about whether I will have enough money',
            scale: {
              negative: 'Always (Constant anxiety and deep confusion dominate)',
              positive: 'Never (I feel clear and calm about my finances; I trust I will have enough)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve made financial decisions in panic mode that made things worse, or missed opportunities because I didn\'t realize I had the resources',
            scale: {
              negative: 'Always (The pattern is devastating)',
              positive: 'Never (I consistently make calm, informed decisions and recognize available opportunities)'
            }
          },
          // Open Response
          {
            text: 'Describe a specific time you made a financial decision in panic mode because you felt there would never be enough—what was happening, and what stories were you telling yourself in that moment?'
          }
        ]
      },

      {
        key: 'subdomain_1_3',
        label: 'I Can\'t See My Financial Reality',
        description: 'Exploring patterns of overwhelm that lead to willful ignorance about finances',
        beliefBehaviorConnection: 'Believing finances are too complex leads to fragmenting your view and avoiding the full picture',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Finances are too complex/overwhelming for me to understand',
            scale: {
              negative: 'Strongly Agree (I\'m absolutely certain finances are beyond my ability to understand)',
              positive: 'Strongly Disagree (I know I\'m fully capable of understanding finances; complexity is manageable)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I don\'t look at my full financial picture; I focus on one small piece at a time and ignore the rest',
            scale: {
              negative: 'Always (I only ever look at tiny fragments)',
              positive: 'Never (I consistently look at my complete financial picture and understand how pieces connect)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel overwhelmed and helpless about understanding money',
            scale: {
              negative: 'Always (Overwhelming helplessness is constant and crushing)',
              positive: 'Never (I feel confident and capable; money is manageable and understandable)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve been blindsided by financial crises that I should have seen coming if I\'d been paying attention',
            scale: {
              negative: 'Always (I\'ve been repeatedly blindsided; the pattern keeps repeating)',
              positive: 'Never (I consistently see financial challenges coming and prepare; no blindsiding)'
            }
          },
          // Open Response
          {
            text: 'What financial information do you deliberately avoid looking at right now, and what specifically do you fear you\'d discover if you looked?'
          }
        ]
      },

      // ========================================
      // DOMAIN 2: EXTERNAL VALIDATION
      // ========================================

      {
        key: 'subdomain_2_1',
        label: 'Money Shows My Worth',
        description: 'Exploring patterns of equating self-worth with money that drive image spending',
        beliefBehaviorConnection: 'Believing your worth is determined by money leads to spending to project success regardless of the strain',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'How much money I have (or appear to have) determines my worth and value',
            scale: {
              negative: 'Strongly Agree (I\'m certain my worth is directly determined by money; without it I have no value)',
              positive: 'Strongly Disagree (I absolutely know my worth is inherent and completely independent of money)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I spend money to look successful/worthy to others, even when it strains my actual finances',
            scale: {
              negative: 'Always (I constantly spend to maintain an image, regardless of the financial strain)',
              positive: 'Never (I consistently spend based on my actual needs and values, not others\' opinions)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxiety and shame when I think others might see my real financial situation',
            scale: {
              negative: 'Always (Constant, overwhelming anxiety and shame)',
              positive: 'Never (I feel no shame about my real finances; I\'m comfortable being authentic)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve gone into debt or damaged my finances to maintain an image or impress others',
            scale: {
              negative: 'Always (I\'ve created massive debt and severe financial damage maintaining a false image)',
              positive: 'Never (I consistently make financial choices based on reality, not image; no debt for appearance)'
            }
          },
          // Open Response
          {
            text: 'What image are you currently trying to project with money, and what\'s a specific example of something expensive you\'ve bought or done primarily to maintain that image?'
          }
        ]
      },

      {
        key: 'subdomain_2_2',
        label: 'What Will They Think?',
        description: 'Exploring patterns of seeking approval that lead to financial hiding and people-pleasing',
        beliefBehaviorConnection: 'Living for others\' approval leads to hiding your financial choices out of fear of judgment',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Others\' opinions about how I spend and what I share about money matter more than my own judgment',
            scale: {
              negative: 'Strongly Agree (Others\' opinions completely determine how I spend; my judgment is irrelevant)',
              positive: 'Strongly Disagree (I completely trust my judgment; others\' opinions are just data, not directives)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I hide my financial choices from people in my life because I\'m afraid of their judgment',
            scale: {
              negative: 'Always (Fear of judgment controls my transparency completely)',
              positive: 'Never (I\'m completely open about my financial choices with appropriate people; no hiding)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel trapped between what I want to do and what others expect me to do financially',
            scale: {
              negative: 'Always (Constant, painful conflict paralyzes me)',
              positive: 'Never (I feel free to make my own financial choices; no conflict between internal and external)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve made financial choices I regret because I was trying to please someone or avoid their disapproval',
            scale: {
              negative: 'Always (I\'ve made countless regrettable choices seeking approval; the cost has been devastating)',
              positive: 'Never (I consistently make financial choices based on my judgment; no people-pleasing regrets)'
            }
          },
          // Open Response
          {
            text: 'Whose judgment about your finances do you fear most, and describe a specific financial choice you\'ve made (or are making) primarily to please them or avoid their disapproval?'
          }
        ]
      },

      {
        key: 'subdomain_2_3',
        label: 'I Need to Prove Myself',
        description: 'Exploring patterns of needing external proof that drive status spending',
        beliefBehaviorConnection: 'Needing to prove your worth through money leads to buying status symbols to demonstrate you\'ve "made it"',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I need to prove I\'m successful/worthy through money and possessions',
            scale: {
              negative: 'Strongly Agree (I desperately need to prove my success through money; it\'s my only validation)',
              positive: 'Strongly Disagree (I absolutely don\'t need to prove myself through money; my worth is inherent)'
            }
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I buy status symbols and make financial moves to show others I\'ve \'made it\'',
            scale: {
              negative: 'Always (I constantly purchase status symbols for others\' validation)',
              positive: 'Never (I consistently buy what I actually need and want; no purchases to prove anything)'
            }
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel pressure to show I\'m doing well financially, and inadequate when I can\'t',
            scale: {
              negative: 'Always (Constant crushing pressure; profound inadequacy when I can\'t)',
              positive: 'Never (I feel no pressure to prove financial success; completely comfortable with my authentic reality)'
            }
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve damaged my finances by buying things or making choices to prove my success to others',
            scale: {
              negative: 'Always (I\'ve created severe financial damage through constant status-driven purchases)',
              positive: 'Never (I consistently make authentic financial choices; no damage from trying to prove anything)'
            }
          },
          // Open Response
          {
            text: 'What specifically are you trying to prove with money, and who are you trying to prove it to? Give a concrete example of how this shows up in your financial choices.'
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
   * @param {Object} params - Render parameters from Router
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // Handle URL parameters for immediate navigation (preserves user gesture)
    const editMode = params.editMode === 'true' || params.editMode === true;
    const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

    // Page validation
    const totalPages = 7; // 1 intro + 6 subdomains
    if (page < 1 || page > totalPages) {
      throw new Error(`Invalid page number: ${page}. Must be 1-${totalPages}`);
    }

    // Execute actions on page load (after navigation completes with user gesture)
    if (editMode && page === 1) {
      Logger.log(`[Tool3] Edit mode detected for ${clientId} - creating EDIT_DRAFT`);
      DataService.loadResponseForEditing(clientId, 'tool3');
    }

    if (clearDraft && page === 1) {
      Logger.log(`[Tool3] Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'tool3');
    }

    try {
      // Get existing data if resuming
      const existingData = this.getExistingData(clientId);

      // Get page content (just the form fields, not full HTML)
      const pageContent = GroundingFormBuilder.renderPageContent({
        toolId: this.config.id,
        pageNum: page,
        clientId: clientId,
        subdomains: this.config.subdomains,
        intro: this.getIntroContent(),
        existingData: existingData
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
      Logger.log(`[Tool3] Error rendering page ${page}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get custom intro content for Tool 3
   */
  getIntroContent() {
    return `
      <div class="card">
        <h2>Welcome to the Identity & Validation Assessment</h2>
        <p class="muted" style="margin-bottom: 20px;">
          This assessment explores how you see yourself and how others' opinions influence your financial decisions.
          It reveals patterns of disconnection from your authentic self.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">What This Assessment Explores</h3>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 1: False Self-View</strong><br>
          How confusion and lack of clarity create blind spots in your financial reality—patterns like
          unworthiness, scarcity mindset, and willful ignorance that keep you from seeing your finances clearly.
        </p>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 2: External Validation</strong><br>
          How others' opinions drive your financial decisions—patterns like equating money with worth,
          hiding choices out of fear, and spending to prove yourself rather than meet authentic needs.
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
            💡 <strong>Tip:</strong> Find a quiet space where you can be honest with yourself.
            The more authentic your responses, the more valuable your insights will be.
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Save page data (called after each page submission)
   * Required by Code.js saveToolPageData()
   */
  savePageData(clientId, page, formData) {
    // Save to PropertiesService for fast page-to-page navigation
    DraftService.saveDraft('tool3', clientId, page, formData);

    // Also save to RESPONSES sheet on first page to create DRAFT row
    if (page === 1) {
      DataService.saveDraft(clientId, 'tool3', formData);
    }

    return { success: true };
  },

  /**
   * Get existing data for a client
   * Checks both EDIT_DRAFT (from RESPONSES sheet) and PropertiesService drafts
   */
  getExistingData(clientId) {
    try {
      let data = null;

      // First check if there's an active draft in RESPONSES sheet
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool3');

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`[Tool3] Found active draft with status: ${activeDraft.status}`);
          data = activeDraft.data;
        }
      }

      // Also check PropertiesService and merge
      const propData = DraftService.getDraft('tool3', clientId);

      if (propData) {
        if (data) {
          // Merge: PropertiesService takes precedence for newer page data
          data = {...data, ...propData};
        } else {
          data = propData;
        }
      }

      return data || {};

    } catch (error) {
      Logger.log(`[Tool3] Error getting existing data: ${error}`);
      return {};
    }
  },

  /**
   * Process final submission (called by Code.js completeToolSubmission)
   * CRITICAL: Method name must match Code.js expectation
   * CRITICAL: Signature must be (clientId) not (clientId, formData)
   */
  processFinalSubmission(clientId) {
    try {
      Logger.log(`[Tool3] Processing final submission for ${clientId}`);

      // Get all data from draft storage (like Tool 1/2)
      const allData = this.getExistingData(clientId);

      if (!allData) {
        throw new Error('No data found. Please start the assessment again.');
      }

      // Extract all responses (24 scale + 6 open responses = 30 total)
      const responses = this.extractResponses(allData);

      // Calculate scores using GroundingScoring
      const scoringResult = GroundingScoring.calculateScores(
        responses,
        this.config.subdomains
      );

      Logger.log(`[Tool3] Scoring complete: Overall=${scoringResult.overallQuotient}`);

      // Collect all GPT insights (from cache)
      const gptInsights = this.collectGPTInsights(clientId);

      // Run final 3 synthesis calls
      const syntheses = this.runFinalSyntheses(clientId, scoringResult, gptInsights);

      Logger.log(`[Tool3] GPT syntheses complete`);

      // Save complete assessment data
      this.saveAssessmentData(clientId, {
        responses,
        scoringResult,
        gptInsights,
        syntheses
      });

      Logger.log(`[Tool3] Assessment data saved`);

      // Return success (Code.js will handle report generation)
      return { success: true };

    } catch (error) {
      Logger.log(`[Tool3] Error processing submission: ${error.message}`);
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
