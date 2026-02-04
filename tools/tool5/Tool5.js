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
    name: 'Tool 5: Love & Connection',
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m certain love only comes through financial sacrifice; without giving I have no value' },
              { value: -2, label: 'Agree - I strongly believe I must financially give and sacrifice to be loved; it\'s required for connection' },
              { value: -1, label: 'Slightly agree - I often feel I must give money to be loved, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning love isn\'t earned through giving, though old patterns persist' },
              { value: 2, label: 'Disagree - I generally know love isn\'t transactional, though occasional fears of losing love surface' },
              { value: 3, label: 'Strongly disagree - I absolutely know I\'m loved for who I am, not what I give; love isn\'t bought' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I give money to people even when I can\'t afford it, unable to say no',
            scale: [
              { value: -3, label: 'Always - I constantly give beyond my means; I\'m completely unable to decline any request' },
              { value: -2, label: 'Very often - I regularly sacrifice my financial security by giving when I shouldn\'t' },
              { value: -1, label: 'Often - I frequently give when I can\'t afford it, unable to set boundaries' },
              { value: 1, label: 'Occasionally - I sometimes over-give, working on healthy boundaries and self-preservation' },
              { value: 2, label: 'Rarely - I occasionally give beyond my means, but generally maintain healthy limits' },
              { value: 3, label: 'Never - I consistently give from abundance, not deprivation; I can say no when necessary' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel guilty and fearful when I don\'t give, and anxious about losing love if I stop',
            scale: [
              { value: -3, label: 'Always - Constant overwhelming guilt and fear about not giving; terror of abandonment dominates' },
              { value: -2, label: 'Very often - Persistent guilt when I don\'t sacrifice; heavy anxiety about losing relationships' },
              { value: -1, label: 'Often - Frequent guilt and fear about not giving; anxiety that love will disappear' },
              { value: 1, label: 'Occasionally - Sometimes feel guilty not giving, learning that love isn\'t conditional on sacrifice' },
              { value: 2, label: 'Rarely - Occasional guilt or anxiety, but generally know relationships don\'t require financial sacrifice' },
              { value: 3, label: 'Never - I feel no guilt about healthy boundaries; completely secure that love isn\'t transactional' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve put myself in financial hardship by giving to others, and/or enabled others\' dysfunction',
            scale: [
              { value: -3, label: 'Always - I\'ve created severe hardship through compulsive giving; I\'ve significantly enabled dysfunction repeatedly' },
              { value: -2, label: 'Very often - I regularly harm myself financially while enabling others\' problematic patterns' },
              { value: -1, label: 'Often - I frequently sacrifice my stability by giving and enable unhealthy behaviors' },
              { value: 1, label: 'Occasionally - I\'ve over-given and enabled at times, working toward healthier patterns' },
              { value: 2, label: 'Rarely - I\'ve had occasional lapses, but generally give wisely without enabling' },
              { value: 3, label: 'Never - I consistently give sustainably and support others\' growth, not dysfunction; I\'m financially stable' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain others\' needs always matter more; mine are irrelevant' },
              { value: -2, label: 'Agree - I believe others\' needs clearly come first; prioritizing myself is selfish' },
              { value: -1, label: 'Slightly agree - I often feel others\' needs are more important, though I\'m questioning this' },
              { value: 1, label: 'Slightly disagree - I\'m learning my needs matter too, though putting myself first feels wrong' },
              { value: 2, label: 'Disagree - I generally balance needs appropriately, though occasional guilt about self-care emerges' },
              { value: 3, label: 'Strongly disagree - I know my needs and others\' needs are equally valid; balance is essential' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I sacrifice my own financial needs or goals because I believe others deserve help more than I deserve to meet my own needs',
            scale: [
              { value: -3, label: 'Always - I always sacrifice my financial wellbeing because I believe others\' needs are more legitimate than mine' },
              { value: -2, label: 'Very often - I frequently go without to help others because I believe their needs matter more' },
              { value: -1, label: 'Often - I sometimes sacrifice my financial needs because I feel others deserve it more than I do' },
              { value: 1, label: 'Occasionally - I occasionally put others\' needs above mine, but I\'m learning my needs are equally valid' },
              { value: 2, label: 'Rarely - I usually balance helping others with meeting my own needs without sacrificing either' },
              { value: 3, label: 'Never - I consistently honor both my needs and others\' needs as equally important' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel selfish when I prioritize my financial needs over others\'',
            scale: [
              { value: -3, label: 'Always - Crushing guilt and selfishness dominate whenever I consider my own needs' },
              { value: -2, label: 'Very often - Heavy shame about prioritizing myself; feels fundamentally wrong' },
              { value: -1, label: 'Often - Frequent feelings of selfishness when I focus on my needs first' },
              { value: 1, label: 'Occasionally - Sometimes feel selfish about self-care, learning it\'s necessary not selfish' },
              { value: 2, label: 'Rarely - Occasional guilt about prioritizing myself, but generally know it\'s healthy' },
              { value: 3, label: 'Never - I feel no guilt about appropriate self-care; know my needs are valid and necessary' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve suffered financially by always putting others first, while they didn\'t reciprocate',
            scale: [
              { value: -3, label: 'Always - I\'ve experienced severe suffering through constant self-abandonment; reciprocation never comes' },
              { value: -2, label: 'Very often - I regularly suffer significant hardship putting others first without mutual care' },
              { value: -1, label: 'Often - I frequently experience financial pain from unreciprocated sacrifice' },
              { value: 1, label: 'Occasionally - I\'ve suffered at times from imbalance, working toward healthier boundaries' },
              { value: 2, label: 'Rarely - I\'ve experienced occasional imbalance, but generally receive care too' },
              { value: 3, label: 'Never - I maintain healthy balance; relationships are reciprocal and I\'m cared for' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - Accepting help absolutely makes me weak and worthless; it\'s shameful and creates unbearable debt' },
              { value: -2, label: 'Agree - I strongly believe accepting help diminishes me and creates inescapable obligation' },
              { value: -1, label: 'Slightly agree - I often feel weak or indebted accepting help, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning accepting help is strength, though it still feels uncomfortable' },
              { value: 2, label: 'Disagree - I generally know accepting help is healthy, though occasional discomfort surfaces' },
              { value: 3, label: 'Strongly disagree - I completely know accepting help is strength; interdependence is beautiful, not shameful' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I refuse money/help when offered, even when I desperately need it',
            scale: [
              { value: -3, label: 'Always - I always refuse help regardless of desperation; accepting is impossible for me' },
              { value: -2, label: 'Very often - I regularly turn down help even in desperate circumstances' },
              { value: -1, label: 'Often - I frequently refuse needed help, unable to let myself receive' },
              { value: 1, label: 'Occasionally - I sometimes refuse help, working on allowing myself to receive' },
              { value: 2, label: 'Rarely - I occasionally struggle accepting, but generally allow appropriate help' },
              { value: 3, label: 'Never - I graciously accept help when offered and needed; I can receive openly' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel shame and vulnerability about needing help; I must be the strong one',
            scale: [
              { value: -3, label: 'Always - Overwhelming shame about any vulnerability; I must always be the provider, never the receiver' },
              { value: -2, label: 'Very often - Deep shame about needing anything; can\'t tolerate being vulnerable' },
              { value: -1, label: 'Often - Frequent shame about need; believe I should always be strong and giving' },
              { value: 1, label: 'Occasionally - Sometimes feel shame about vulnerability, learning it\'s okay to need help' },
              { value: 2, label: 'Rarely - Occasional discomfort with need, but generally comfortable with vulnerability' },
              { value: 3, label: 'Never - I feel no shame about appropriate vulnerability; know asking for help is strength' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve suffered unnecessarily by refusing help that was offered, and relationships suffered from my inability to receive',
            scale: [
              { value: -3, label: 'Always - I\'ve experienced severe unnecessary suffering and relationship damage through refusing help repeatedly' },
              { value: -2, label: 'Very often - I regularly suffer and damage connections by refusing offered help' },
              { value: -1, label: 'Often - I frequently suffer and hurt relationships by my inability to receive' },
              { value: 1, label: 'Occasionally - I\'ve refused help at times to my detriment, working on receiving' },
              { value: 2, label: 'Rarely - I\'ve occasionally refused help unnecessarily, but generally accept appropriately' },
              { value: 3, label: 'Never - I accept help when offered and needed; relationships are reciprocal and healthy' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m certain I absolutely can\'t survive alone; I\'m completely incapable of financial independence' },
              { value: -2, label: 'Agree - I strongly believe I need support; independence is impossible' },
              { value: -1, label: 'Slightly agree - I often feel unable to make it alone, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning I can manage independently, though dependence feels safer' },
              { value: 2, label: 'Disagree - I generally know I can be financially independent, though occasional doubt surfaces' },
              { value: 3, label: 'Strongly disagree - I absolutely know I can thrive independently; I\'m fully capable' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I rely on others to cover my expenses or make financial decisions for me',
            scale: [
              { value: -3, label: 'Always - I completely rely on others for financial support or decisions; I\'m totally dependent' },
              { value: -2, label: 'Very often - I regularly depend on others for expenses or decision-making; minimal independence' },
              { value: -1, label: 'Often - I frequently rely on others financially rather than managing independently' },
              { value: 1, label: 'Occasionally - I sometimes lean on others, working toward greater independence' },
              { value: 2, label: 'Rarely - I occasionally accept support, but generally manage independently' },
              { value: 3, label: 'Never - I consistently handle my own finances and decisions; I\'m financially independent' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel helpless and incapable of managing money on my own',
            scale: [
              { value: -3, label: 'Always - Constant overwhelming helplessness about finances; complete incapability to manage' },
              { value: -2, label: 'Very often - Persistent feelings of helplessness and incapacity with money' },
              { value: -1, label: 'Often - Frequent helplessness about financial management; feel incapable' },
              { value: 1, label: 'Occasionally - Sometimes feel helpless, building confidence in capability' },
              { value: 2, label: 'Rarely - Occasional brief helplessness, but generally feel capable' },
              { value: 3, label: 'Never - I feel confident and capable managing finances; empowered and independent' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve stayed in unhealthy relationships because of financial dependence',
            scale: [
              { value: -3, label: 'Always - I\'ve remained in severely damaging relationships repeatedly due to financial dependence; trapped' },
              { value: -2, label: 'Very often - I regularly stay in unhealthy situations due to financial reliance' },
              { value: -1, label: 'Often - I frequently remain in problematic relationships because of financial dependence' },
              { value: 1, label: 'Occasionally - I\'ve stayed too long at times due to finances, working toward independence' },
              { value: 2, label: 'Rarely - I\'ve had occasional financial considerations in relationships, but generally maintain independence' },
              { value: 3, label: 'Never - I consistently maintain financial independence; relationship choices are never driven by dependence' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I deeply believe any financial help creates permanent, unpayable debt that defines the relationship' },
              { value: -2, label: 'Agree - I strongly believe financial help creates lasting obligation I can never fully satisfy' },
              { value: -1, label: 'Slightly agree - I often believe I owe people when they help me financially' },
              { value: 1, label: 'Slightly disagree - I sometimes feel indebted, but I\'m learning help doesn\'t create permanent obligation' },
              { value: 2, label: 'Disagree - I usually understand that help given freely doesn\'t create endless debt' },
              { value: 3, label: 'Strongly disagree - I consistently believe genuine help is given without creating permanent obligation' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I let others control my financial decisions because they\'ve helped me, even when I disagree',
            scale: [
              { value: -3, label: 'Always - I completely surrender all financial autonomy to anyone who helps; total control by others' },
              { value: -2, label: 'Very often - I regularly allow others to control my decisions due to their help' },
              { value: -1, label: 'Often - I frequently relinquish control and comply due to feeling indebted' },
              { value: 1, label: 'Occasionally - I sometimes allow control due to obligation, working toward autonomy' },
              { value: 2, label: 'Rarely - I occasionally feel pressured but generally maintain decision-making authority' },
              { value: 3, label: 'Never - I consistently maintain full financial autonomy; help doesn\'t mean control' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel trapped and obligated by others\' financial help; the weight of owing them is heavy',
            scale: [
              { value: -3, label: 'Always - Constant crushing weight of obligation; feel completely trapped by others\' help' },
              { value: -2, label: 'Very often - Persistent heavy burden of debt; regularly feel trapped and controlled' },
              { value: -1, label: 'Often - Frequent feelings of obligation and being trapped by financial help received' },
              { value: 1, label: 'Occasionally - Sometimes feel obligated, learning to separate help from control' },
              { value: 2, label: 'Rarely - Occasional sense of obligation, but generally feel free and autonomous' },
              { value: 3, label: 'Never - I feel no obligation or burden from help; free and grateful without weight' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve let people control me or made choices I regret because I felt I \'owed\' them for their help',
            scale: [
              { value: -3, label: 'Always - I\'ve repeatedly surrendered control and made devastating choices due to obligation; severe consequences' },
              { value: -2, label: 'Very often - I regularly allow control and make regrettable choices from feeling indebted' },
              { value: -1, label: 'Often - I frequently compromise autonomy and make poor choices due to obligation' },
              { value: 1, label: 'Occasionally - I\'ve made some obligation-based choices, working toward healthy boundaries' },
              { value: 2, label: 'Rarely - I\'ve had occasional lapses, but generally maintain autonomy despite help' },
              { value: 3, label: 'Never - I consistently maintain autonomy; no regretted choices from obligation' }
            ]
          },
          // Open Response
          {
            text: 'Who do you feel most indebted to, what do you think they expect from you in return for their help, and what specific financial choices have you made (or avoided making) because you felt you \'owed\' them?'
          }
        ]
      },

      {
        key: 'subdomain_2_3',
        label: 'I Stay in Debt',
        description: 'Exploring patterns of chronic debt accumulation that keep you financially trapped',
        beliefBehaviorConnection: 'Believing you can never get ahead financially leads to accumulating debt that keeps you trapped in instability',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I will always be in debt; no matter what I do, I can not get ahead financially',
            scale: [
              { value: -3, label: 'Strongly agree - I am certain I will never escape debt; getting ahead financially is impossible for someone like me' },
              { value: -2, label: 'Agree - I believe I will always owe money; no matter what I try, I end up back in debt' },
              { value: -1, label: 'Slightly agree - I often feel like I will never get out of debt, though I hope things could change' },
              { value: 1, label: 'Slightly disagree - I am starting to believe I can become debt-free, though old patterns still pull at me' },
              { value: 2, label: 'Disagree - I generally believe I can get ahead financially, though occasional doubt surfaces' },
              { value: 3, label: 'Strongly disagree - I know I can be debt-free and financially stable; my past does not determine my future' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I accumulate debt—credit cards, loans, personal borrowing—or spend money before I have it, keeping myself in a financial hole',
            scale: [
              { value: -3, label: 'Always - I constantly accumulate debt across credit cards, loans, and personal borrowing; I am always in a financial hole' },
              { value: -2, label: 'Very often - I regularly take on new debt or spend beyond my means, keeping myself financially behind' },
              { value: -1, label: 'Often - I frequently rely on credit or borrowing, struggling to stay ahead of what I owe' },
              { value: 1, label: 'Occasionally - I sometimes take on debt I should not, but I am working toward living within my means' },
              { value: 2, label: 'Rarely - I occasionally use credit but generally manage it responsibly without accumulating debt' },
              { value: 3, label: 'Never - I live within my means and use credit as a tool, not a crutch; I do not accumulate unnecessary debt' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel shame, stress, and anxiety about my debt—trapped in a cycle I can not escape',
            scale: [
              { value: -3, label: 'Always - Constant shame, stress, and anxiety about my debt; I feel completely trapped with no way out' },
              { value: -2, label: 'Very often - Persistent shame and anxiety about what I owe; I regularly feel stressed and stuck in a cycle I cannot break' },
              { value: -1, label: 'Often - Frequent shame, stress, and anxiety about my debt; the weight of it feels overwhelming' },
              { value: 1, label: 'Occasionally - I sometimes feel stress or anxiety about debt, but I am building hope for change' },
              { value: 2, label: 'Rarely - I occasionally feel concern about debt, but I generally feel calm and capable of managing it' },
              { value: 3, label: 'Never - I feel no shame or anxiety about my financial situation; I am in control and at peace' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'My debt has kept me financially unstable—unable to build savings, create independence, or feel secure',
            scale: [
              { value: -3, label: 'Always - My debt has created severe instability; I have no savings, no independence, and constant financial insecurity' },
              { value: -2, label: 'Very often - My debt regularly prevents me from saving or feeling secure; I am stuck in financial instability' },
              { value: -1, label: 'Often - My debt frequently blocks my ability to build savings or create financial stability' },
              { value: 1, label: 'Occasionally - My debt has sometimes limited me, but I am working toward stability and independence' },
              { value: 2, label: 'Rarely - I have occasional debt concerns, but they do not prevent me from building savings and security' },
              { value: 3, label: 'Never - I am financially stable with savings and security; debt does not control my life' }
            ]
          },
          // Open Response
          {
            text: 'What is your biggest source of debt right now, and what keeps you from getting out from under it—go deeper than the money itself?'
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
      Logger.log(`[Tool5] Edit mode detected for ${clientId} - creating EDIT_DRAFT`);
      DataService.loadResponseForEditing(clientId, 'tool5');
    }

    if (clearDraft && page === 1) {
      Logger.log(`[Tool5] Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'tool5');
    }

    try {
      // Get existing data if resuming
      const existingData = this.getExistingData(clientId);

      // Get page content (just the form fields, not full HTML)
      let pageContent = GroundingFormBuilder.renderPageContent({
        toolId: this.config.id,
        pageNum: page,
        clientId: clientId,
        subdomains: this.config.subdomains,
        intro: this.getIntroContent(),
        existingData: existingData
      });

      // Add edit mode banner if editing previous response
      if (existingData && existingData._editMode) {
        const originalDate = existingData._originalTimestamp ?
          new Date(existingData._originalTimestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'previous submission';

        pageContent = EditModeBanner.render(originalDate, clientId, 'tool5') + pageContent;
      }

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
   * Get custom intro content for Tool 5
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
   * Save page data (called after each page submission)
   * Required by Code.js saveToolPageData()
   */
  savePageData(clientId, page, formData) {
    // Save to PropertiesService for fast page-to-page navigation
    DraftService.saveDraft('tool5', clientId, page, formData);

    // Get the complete merged data (includes all pages)
    const draftData = DraftService.getDraft('tool5', clientId);

    // Also save/update RESPONSES sheet for dashboard detection
    // BUT: Don't create/update if we're in edit mode (EDIT_DRAFT already exists)
    const activeDraft = DataService.getActiveDraft(clientId, 'tool5');
    const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

    if (!isEditMode) {
      // Use complete draft data so RESPONSES sheet has ALL pages
      if (page === 1) {
        // Page 1: Create new DRAFT row with complete data
        DataService.saveDraft(clientId, 'tool5', draftData);
      } else {
        // Page 2: Update existing DRAFT row with complete merged data
        DataService.updateDraft(clientId, 'tool5', draftData);
      }
    } else {
      // EDIT MODE: Also update EDIT_DRAFT row to keep RESPONSES sheet in sync
      // This ensures data isn't lost if PropertiesService gets cleared mid-session
      Logger.log(`[Tool5] Updating EDIT_DRAFT with current data`);
      DataService.updateDraft(clientId, 'tool5', draftData);
    }

    // ============================================================
    // BACKGROUND GPT ANALYSIS (Server-Side)
    // Trigger GPT analysis for subdomain pages (2-7) after save
    // ============================================================
    if (page >= 2 && page <= 7) {
      const subdomainIndex = page - 2; // 0-5
      const subdomain = this.config.subdomains[subdomainIndex];

      try {
        // Extract responses for this subdomain
        const openResponseKey = `${subdomain.key}_open_response`;
        const openResponse = formData[openResponseKey];

        // Check if we have enough data for GPT analysis
        if (openResponse && openResponse.trim().length >= 10) {
          Logger.log(`[Tool5] Triggering GPT analysis for ${subdomain.key}`);

          // Extract aspect scores for GPT context
          const aspects = ['belief', 'behavior', 'feeling', 'consequence'];
          const responses = {};
          const aspectScores = {};

          aspects.forEach(aspect => {
            const fieldName = `${subdomain.key}_${aspect}`;
            const score = parseInt(formData[fieldName]);
            responses[fieldName] = score;
            responses[`${fieldName}_label`] = formData[`${fieldName}_label`] || '';
            aspectScores[aspect] = score;
          });
          responses[openResponseKey] = openResponse;

          // Check for duplicate (prevent redundant API calls on back/forward navigation)
          const existingInsight = GroundingGPT.getCachedInsight(this.config.id, clientId, subdomain.key);

          if (existingInsight) {
            Logger.log(`[Tool5] GPT insight already cached for ${subdomain.key} - skipping`);
          } else {
            // Trigger GPT analysis (non-blocking - uses try-catch internally)
            GroundingGPT.analyzeSubdomain({
              toolId: this.config.id,
              clientId: clientId,
              subdomainKey: subdomain.key,
              subdomainConfig: subdomain,
              responses: responses,
              aspectScores: aspectScores,
              previousInsights: {} // No cross-subdomain context for now
            });

            Logger.log(`[Tool5] GPT analysis completed for ${subdomain.key}`);
          }
        } else {
          Logger.log(`[Tool5] Skipping GPT - insufficient open response for ${subdomain.key} (length: ${openResponse ? openResponse.length : 0})`);
        }
      } catch (error) {
        // Don't let GPT failures block navigation
        Logger.log(`[Tool5] GPT trigger failed (non-blocking): ${error.message}`);
        Logger.log(error.stack);
      }
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
        const activeDraft = DataService.getActiveDraft(clientId, 'tool5');

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`[Tool5] Found active draft with status: ${activeDraft.status}`);
          data = activeDraft.data;
        }
      }

      // Also check PropertiesService and merge
      const propData = DraftService.getDraft('tool5', clientId);

      if (propData) {
        if (data) {
          // Merge: PropertiesService takes precedence for newer page data
          data = {...data, ...propData};
        } else {
          data = propData;
        }
      }

      return data || null;

    } catch (error) {
      Logger.log(`[Tool5] Error getting existing data: ${error}`);
      return null;
    }
  },

  /**
   * Process final submission (called by Code.js completeToolSubmission)
   * CRITICAL: Method name must match Code.js expectation
   * CRITICAL: Signature must be (clientId) not (clientId, formData)
   */
  processFinalSubmission(clientId) {
    try {
      Logger.log(`[Tool5] Processing final submission for ${clientId}`);

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

      // Return success (Code.js will handle report generation)
      return { success: true };

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

      // Skip label fields (used for GPT context, not scoring)
      // Labels are like: subdomain_1_1_belief_label
      if (key.endsWith('_label')) {
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
      domainScore: scoringResult.domainQuotients.domain1,
      subdomainConfigs: this.config.subdomains.slice(0, 3)  // Pass first 3 subdomain configs
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
      domainScore: scoringResult.domainQuotients.domain2,
      subdomainConfigs: this.config.subdomains.slice(3, 6)  // Pass last 3 subdomain configs
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
      allScores: scoringResult,
      subdomainInsights: gptInsights.subdomains  // ADD: Pass subdomain insights for context
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

    // Clear draft data from PropertiesService
    DraftService.clearDraft(this.config.id, clientId);

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
            <button class="btn-primary" onclick="returnToDashboard()">
              Return to Dashboard →
            </button>
          </div>
        </div>
        <script>
          function returnToDashboard() {
            google.script.run
              .withSuccessHandler(function(dashboardHtml) {
                if (dashboardHtml) {
                  // Save dashboard location BEFORE document.write() to prevent refresh recovery loop
                  try {
                    sessionStorage.setItem('_ftpCurrentLocation', JSON.stringify({
                      view: 'dashboard',
                      toolId: null,
                      page: null,
                      clientId: '${clientId}',
                      timestamp: Date.now()
                    }));
                  } catch(e) {}
                  document.open();
                  document.write(dashboardHtml);
                  document.close();
                  window.scrollTo(0, 0);
                } else {
                  alert('Error loading dashboard');
                }
              })
              .withFailureHandler(function(error) {
                console.error('Navigation error:', error);
                alert('Error returning to dashboard: ' + error.message);
              })
              .getDashboardPage('${clientId}');
          }
        </script>
      </body>
      </html>
    `;
  }
};
