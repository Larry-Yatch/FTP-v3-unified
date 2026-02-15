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
    name: 'Tool 3: Identity & Validation',
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain financial freedom is not for someone like me; people like me don\'t get that' },
              { value: -2, label: 'Agree - I believe financial freedom is for other kinds of people, not someone like me' },
              { value: -1, label: 'Slightly agree - I often feel like I\'m not the type who gets financial freedom, though I\'m questioning this' },
              { value: 1, label: 'Slightly disagree - I\'m learning I can be the kind of person who has financial freedom, though doubts linger' },
              { value: 2, label: 'Disagree - I generally believe I can be someone who has financial freedom, though I occasionally question it' },
              { value: 3, label: 'Strongly disagree - I absolutely know I\'m the kind of person who gets to have financial freedom' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I avoid looking at my financial accounts and/or have money scattered across multiple places where I can\'t easily access it',
            scale: [
              { value: -3, label: 'Always - This describes me completely; I consistently avoid looking at accounts and have money scattered everywhere' },
              { value: -2, label: 'Very often - I regularly avoid my financial reality and have money scattered that I can\'t easily access' },
              { value: -1, label: 'Often - I frequently avoid looking at accounts and/or have money in places I forget about' },
              { value: 1, label: 'Occasionally - I sometimes avoid my accounts or have some scattered money, noticing this pattern' },
              { value: 2, label: 'Rarely - I occasionally avoid looking or have slight disorganization, but generally stay aware' },
              { value: 3, label: 'Never - I consistently look at my accounts and keep my money organized and accessible' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel deep shame and unworthiness about my financial situation',
            scale: [
              { value: -3, label: 'Always - Deep shame and unworthiness dominate my emotional experience with finances' },
              { value: -2, label: 'Very often - Shame and unworthiness are heavy, recurring feelings about money' },
              { value: -1, label: 'Often - I frequently feel shame and unworthiness about my financial situation' },
              { value: 1, label: 'Occasionally - I sometimes feel shame creeping in, though I\'m working to release it' },
              { value: 2, label: 'Rarely - I occasionally feel slight discomfort, but shame and unworthiness are rare' },
              { value: 3, label: 'Never - I feel no shame about my finances; I accept where I am without judgment' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'Believing I\'m not the kind of person who gets financial freedom has caused me to miss opportunities or make poor financial decisions',
            scale: [
              { value: -3, label: 'Always - I\'ve missed massive opportunities and made devastating decisions; the cost has been severe' },
              { value: -2, label: 'Very often - I regularly sabotage myself through missed opportunities and poor choices' },
              { value: -1, label: 'Often - I frequently miss opportunities or make poor decisions because of this unworthiness' },
              { value: 1, label: 'Occasionally - I\'ve noticed some missed opportunities or confused decisions, working to change' },
              { value: 2, label: 'Rarely - I\'ve occasionally missed something, but generally make good decisions' },
              { value: 3, label: 'Never - I seize appropriate opportunities and make sound financial decisions aligned with my goals' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m certain I\'ll never have enough, no matter what I do or earn' },
              { value: -2, label: 'Agree - I believe no amount will ever be enough; there\'s always something missing' },
              { value: -1, label: 'Slightly agree - I often feel like I\'ll never have enough, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning that "enough" is possible, though scarcity thinking still surfaces' },
              { value: 2, label: 'Disagree - I believe I can have enough with conscious effort and choices' },
              { value: 3, label: 'Strongly disagree - I know I can have enough; sufficiency is absolutely possible for me' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I ignore income and focus only on spending, or ignore spending and focus only on income - never paying attention to both at once',
            scale: [
              { value: -3, label: 'Always - This perfectly describes my pattern; I never pay attention to both simultaneously' },
              { value: -2, label: 'Very often - I regularly exhibit this selective attention pattern; it\'s become automatic' },
              { value: -1, label: 'Often - I frequently focus on only one side (income OR spending) while ignoring the other' },
              { value: 1, label: 'Occasionally - I sometimes notice this pattern of selective blindness, working to change it' },
              { value: 2, label: 'Rarely - I occasionally have selective attention, but generally maintain balanced awareness' },
              { value: 3, label: 'Never - I consistently pay attention to both income and spending simultaneously' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel constant anxiety that there\'s never enough and/or confusion about whether I will have enough money',
            scale: [
              { value: -3, label: 'Always - Constant anxiety and deep confusion about having enough dominate my experience' },
              { value: -2, label: 'Very often - Persistent anxiety about sufficiency and regular confusion about whether I\'ll have enough' },
              { value: -1, label: 'Often - Frequent anxiety that there\'s never enough and confusion about having sufficient money' },
              { value: 1, label: 'Occasionally - I sometimes feel anxious or confused about having enough, though I\'m learning to see more clearly' },
              { value: 2, label: 'Rarely - Occasional worry or brief confusion, but generally feel grounded about sufficiency' },
              { value: 3, label: 'Never - I feel clear and calm about my finances; I trust I will have enough' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve made financial decisions in panic mode that made things worse, or missed opportunities because I didn\'t realize I had the resources',
            scale: [
              { value: -3, label: 'Always - I\'ve repeatedly made panic-driven decisions and missed countless opportunities; the pattern is devastating' },
              { value: -2, label: 'Very often - I regularly make fear-based decisions and miss opportunities due to this confusion' },
              { value: -1, label: 'Often - I frequently act from panic or miss chances because I can\'t see my resources clearly' },
              { value: 1, label: 'Occasionally - I\'ve made some panic decisions or missed opportunities, working to break this pattern' },
              { value: 2, label: 'Rarely - I\'ve had occasional missteps, but generally make grounded decisions from clarity' },
              { value: 3, label: 'Never - I consistently make calm, informed decisions and recognize available opportunities' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain finances are beyond my ability to understand; it\'s all too complex' },
              { value: -2, label: 'Agree - I believe finances are too complicated; I\'m not capable of making sense of them' },
              { value: -1, label: 'Slightly agree - I often feel overwhelmed and think finances are too complex, though I\'m questioning this' },
              { value: 1, label: 'Slightly disagree - I\'m learning I can understand finances, though complexity still feels intimidating' },
              { value: 2, label: 'Disagree - I believe I can understand finances with effort and support' },
              { value: 3, label: 'Strongly disagree - I know I\'m fully capable of understanding finances; complexity is manageable' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I don\'t look at my full financial picture; I focus on one small piece at a time and ignore the rest',
            scale: [
              { value: -3, label: 'Always - I completely avoid seeing the whole picture; I only ever look at tiny fragments' },
              { value: -2, label: 'Very often - I regularly focus on one small piece and deliberately ignore everything else' },
              { value: -1, label: 'Often - I frequently compartmentalize and avoid seeing the full reality' },
              { value: 1, label: 'Occasionally - I sometimes fragment my view, though I\'m working to see the whole picture' },
              { value: 2, label: 'Rarely - I occasionally focus too narrowly, but generally maintain comprehensive awareness' },
              { value: 3, label: 'Never - I consistently look at my complete financial picture and understand how pieces connect' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel overwhelmed and helpless about understanding money',
            scale: [
              { value: -3, label: 'Always - Overwhelming helplessness about finances is constant and crushing' },
              { value: -2, label: 'Very often - I regularly feel overwhelmed and powerless when thinking about money' },
              { value: -1, label: 'Often - I frequently feel helpless and overwhelmed by financial matters' },
              { value: 1, label: 'Occasionally - I sometimes feel overwhelmed, though I\'m building confidence and capability' },
              { value: 2, label: 'Rarely - Occasional brief overwhelm, but generally feel capable and empowered' },
              { value: 3, label: 'Never - I feel confident and capable; money is manageable and understandable' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve been blindsided by financial crises that I should have seen coming if I\'d been paying attention',
            scale: [
              { value: -3, label: 'Always - I\'ve been repeatedly blindsided by predictable crises; the pattern keeps repeating' },
              { value: -2, label: 'Very often - I regularly face "surprise" crises that clear warning signs would have revealed' },
              { value: -1, label: 'Often - I frequently encounter crises I should have anticipated with fuller awareness' },
              { value: 1, label: 'Occasionally - I\'ve been surprised a few times, learning to pay better attention' },
              { value: 2, label: 'Rarely - I\'ve had occasional surprises, but generally see challenges coming' },
              { value: 3, label: 'Never - I consistently see financial challenges coming and prepare; no blindsiding' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I\'m certain my worth is directly determined by money; without it I have no value' },
              { value: -2, label: 'Agree - I strongly believe money equals worth; I judge myself and others by financial appearance' },
              { value: -1, label: 'Slightly agree - I often feel my value rises and falls with money, though I\'m questioning this connection' },
              { value: 1, label: 'Slightly disagree - I\'m learning my worth is separate from money, though old beliefs surface' },
              { value: 2, label: 'Disagree - I generally know my worth isn\'t determined by finances, though society\'s messages creep in' },
              { value: 3, label: 'Strongly disagree - I absolutely know my worth is inherent and completely independent of money' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I spend money to look successful/worthy to others, even when it strains my actual finances',
            scale: [
              { value: -3, label: 'Always - I constantly spend to maintain an image, regardless of the financial strain it causes' },
              { value: -2, label: 'Very often - I regularly sacrifice financial stability to appear successful to others' },
              { value: -1, label: 'Often - I frequently spend beyond my means to project success and worthiness' },
              { value: 1, label: 'Occasionally - I sometimes spend for image, though I\'m working to make authentic choices' },
              { value: 2, label: 'Rarely - I occasionally feel pressure to spend for appearance, but generally choose authentically' },
              { value: 3, label: 'Never - I consistently spend based on my actual needs and values, not others\' opinions' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxiety and shame when I think others might see my real financial situation',
            scale: [
              { value: -3, label: 'Always - Constant, overwhelming anxiety and shame about others discovering my financial truth' },
              { value: -2, label: 'Very often - Persistent anxiety and heavy shame about my real financial situation being revealed' },
              { value: -1, label: 'Often - Frequent anxiety and shame about the gap between appearance and reality' },
              { value: 1, label: 'Occasionally - I sometimes feel anxious or ashamed, learning to be more authentic' },
              { value: 2, label: 'Rarely - Occasional discomfort about finances, but generally comfortable with transparency' },
              { value: 3, label: 'Never - I feel no shame about my real finances; I\'m comfortable being authentic' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve gone into debt or damaged my finances to maintain an image or impress others',
            scale: [
              { value: -3, label: 'Always - I\'ve created massive debt and severe financial damage maintaining a false image' },
              { value: -2, label: 'Very often - I regularly harm my finances significantly for the sake of appearance' },
              { value: -1, label: 'Often - I frequently damage my financial health trying to impress or project success' },
              { value: 1, label: 'Occasionally - I\'ve made some image-based choices that hurt me, working to change this' },
              { value: 2, label: 'Rarely - I\'ve had occasional lapses, but generally prioritize authentic financial health' },
              { value: 3, label: 'Never - I consistently make financial decisions based on reality, not image; no debt for appearance' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - Others\' opinions completely determine how I spend and what I share; my judgment is irrelevant' },
              { value: -2, label: 'Agree - I heavily weight others\' opinions over my own about spending and sharing financial info' },
              { value: -1, label: 'Slightly agree - I often prioritize others\' views about my spending and what I share, though I\'m questioning why' },
              { value: 1, label: 'Slightly disagree - I\'m learning to trust my judgment about spending and sharing, though others\' opinions still influence me' },
              { value: 2, label: 'Disagree - I generally trust my own judgment about spending and what to share, though I occasionally seek validation' },
              { value: 3, label: 'Strongly disagree - I completely trust my judgment about how I spend and what I share; others\' opinions are just data, not directives' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I hide my financial choices from people in my life because I\'m afraid of their judgment',
            scale: [
              { value: -3, label: 'Always - I constantly hide all financial choices; fear of judgment controls my transparency completely' },
              { value: -2, label: 'Very often - I regularly conceal financial decisions from most people due to fear of criticism' },
              { value: -1, label: 'Often - I frequently hide money choices, worried about others\' reactions and judgment' },
              { value: 1, label: 'Occasionally - I sometimes hide choices, working toward more authentic financial transparency' },
              { value: 2, label: 'Rarely - I occasionally withhold details, but generally share financial decisions appropriately' },
              { value: 3, label: 'Never - I\'m completely open about my financial choices with appropriate people; no hiding' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel trapped between what I want to do and what others expect me to do financially',
            scale: [
              { value: -3, label: 'Always - Constant, painful conflict between my desires and others\' expectations paralyzes me' },
              { value: -2, label: 'Very often - I regularly feel trapped and torn between my needs and others\' judgments' },
              { value: -1, label: 'Often - I frequently feel stuck between authentic choices and external expectations' },
              { value: 1, label: 'Occasionally - I sometimes feel this conflict, learning to honor my own needs' },
              { value: 2, label: 'Rarely - Occasional tension between desires and expectations, but generally choose authentically' },
              { value: 3, label: 'Never - I feel free to make my own financial choices; no conflict between internal and external' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve made financial choices I regret because I was trying to please someone or avoid their disapproval',
            scale: [
              { value: -3, label: 'Always - I\'ve made countless regrettable choices seeking approval; the cost has been devastating' },
              { value: -2, label: 'Very often - I regularly make people-pleasing financial decisions I later regret deeply' },
              { value: -1, label: 'Often - I frequently choose based on others\' approval rather than my authentic needs' },
              { value: 1, label: 'Occasionally - I\'ve made some people-pleasing choices, working to trust myself more' },
              { value: 2, label: 'Rarely - I\'ve had occasional lapses, but generally make decisions aligned with my values' },
              { value: 3, label: 'Never - I consistently make financial choices based on my judgment; no people-pleasing regrets' }
            ]
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
            scale: [
              { value: -3, label: 'Strongly agree - I desperately need to prove my success and worth through money; it\'s my only validation' },
              { value: -2, label: 'Agree - I strongly feel I must demonstrate worth through finances; proving myself drives my choices' },
              { value: -1, label: 'Slightly agree - I often feel compelled to prove myself financially, though I\'m questioning this need' },
              { value: 1, label: 'Slightly disagree - I\'m learning I don\'t need to prove anything, though old patterns emerge' },
              { value: 2, label: 'Disagree - I generally know I don\'t need financial proof of worth, though occasional doubts surface' },
              { value: 3, label: 'Strongly disagree - I absolutely don\'t need to prove myself through money; my worth is inherent' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I buy status symbols and make financial moves to show others I\'ve \'made it\'',
            scale: [
              { value: -3, label: 'Always - I constantly purchase status symbols and make visible financial moves for others\' validation' },
              { value: -2, label: 'Very often - I regularly buy things and make choices primarily to demonstrate success to others' },
              { value: -1, label: 'Often - I frequently spend on status and make proving moves, seeking external validation' },
              { value: 1, label: 'Occasionally - I sometimes buy for status, working toward more authentic spending' },
              { value: 2, label: 'Rarely - I occasionally feel the pull of status spending, but generally choose based on real needs' },
              { value: 3, label: 'Never - I consistently buy what I actually need and want; no purchases to prove anything' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel pressure to show I\'m doing well financially, and inadequate when I can\'t',
            scale: [
              { value: -3, label: 'Always - Constant crushing pressure to demonstrate success; profound inadequacy when I can\'t' },
              { value: -2, label: 'Very often - Regular heavy pressure to show financial success; deep inadequacy dominates' },
              { value: -1, label: 'Often - Frequent pressure to prove I\'m doing well; inadequacy when appearances slip' },
              { value: 1, label: 'Occasionally - Sometimes feel pressure or inadequacy, learning to release need for proof' },
              { value: 2, label: 'Rarely - Occasional brief pressure or inadequacy, but generally comfortable with my path' },
              { value: 3, label: 'Never - I feel no pressure to prove financial success; completely comfortable with my authentic reality' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve damaged my finances by buying things or making choices to prove my success to others',
            scale: [
              { value: -3, label: 'Always - I\'ve created severe financial damage through constant status-driven purchases and proving behavior' },
              { value: -2, label: 'Very often - I regularly harm my finances significantly trying to demonstrate success' },
              { value: -1, label: 'Often - I frequently damage my financial health with status purchases and proving moves' },
              { value: 1, label: 'Occasionally - I\'ve made some status-driven choices that hurt me, working to stop this' },
              { value: 2, label: 'Rarely - I\'ve had occasional proving purchases, but generally make grounded decisions' },
              { value: 3, label: 'Never - I consistently make authentic financial choices; no damage from trying to prove anything' }
            ]
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
      LogUtils.debug(`[Tool3] Edit mode detected for ${clientId} - creating EDIT_DRAFT`);
      DataService.loadResponseForEditing(clientId, 'tool3');
    }

    if (clearDraft && page === 1) {
      LogUtils.debug(`[Tool3] Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'tool3');
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

        pageContent = EditModeBanner.render(originalDate, clientId, 'tool3') + pageContent;
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
      LogUtils.error(`[Tool3] Error rendering page ${page}: ${error.message}`);
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

    // Get the complete merged data (includes all pages)
    const draftData = DraftService.getDraft('tool3', clientId);

    // Also save/update RESPONSES sheet for dashboard detection
    // BUT: Don't create/update if we're in edit mode (EDIT_DRAFT already exists)
    const activeDraft = DataService.getActiveDraft(clientId, 'tool3');
    const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

    if (!isEditMode) {
      // Use complete draft data so RESPONSES sheet has ALL pages
      if (page === 1) {
        // Page 1: Create new DRAFT row with complete data
        DataService.saveDraft(clientId, 'tool3', draftData);
      } else {
        // Page 2: Update existing DRAFT row with complete merged data
        DataService.updateDraft(clientId, 'tool3', draftData);
      }
    } else {
      // EDIT MODE: Also update EDIT_DRAFT row to keep RESPONSES sheet in sync
      // This ensures data isn't lost if PropertiesService gets cleared mid-session
      LogUtils.debug(`[Tool3] Updating EDIT_DRAFT with current data`);
      DataService.updateDraft(clientId, 'tool3', draftData);
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
          LogUtils.debug(`[Tool3] Triggering GPT analysis for ${subdomain.key}`);

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
            LogUtils.debug(`[Tool3] GPT insight already cached for ${subdomain.key} - skipping`);
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

            LogUtils.debug(`[Tool3] GPT analysis completed for ${subdomain.key}`);
          }
        } else {
          LogUtils.debug(`[Tool3] Skipping GPT - insufficient open response for ${subdomain.key} (length: ${openResponse ? openResponse.length : 0})`);
        }
      } catch (error) {
        // Don't let GPT failures block navigation
        LogUtils.error(`[Tool3] GPT trigger failed (non-blocking): ${error.message}`);
        LogUtils.error(error.stack);
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
        const activeDraft = DataService.getActiveDraft(clientId, 'tool3');

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          LogUtils.debug(`[Tool3] Found active draft with status: ${activeDraft.status}`);
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

      return data || null;

    } catch (error) {
      LogUtils.error(`[Tool3] Error getting existing data: ${error}`);
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
      LogUtils.debug(`[Tool3] Processing final submission for ${clientId}`);

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

      LogUtils.debug(`[Tool3] Scoring complete: Overall=${scoringResult.overallQuotient}`);

      // Collect all GPT insights (from cache)
      const gptInsights = this.collectGPTInsights(clientId);

      // Run final 3 synthesis calls
      const syntheses = this.runFinalSyntheses(clientId, scoringResult, gptInsights);

      LogUtils.debug(`[Tool3] GPT syntheses complete`);

      // Save complete assessment data
      this.saveAssessmentData(clientId, {
        responses,
        scoringResult,
        gptInsights,
        syntheses
      });

      LogUtils.debug(`[Tool3] Assessment data saved`);

      // Return success (Code.js will handle report generation)
      return { success: true };

    } catch (error) {
      LogUtils.error(`[Tool3] Error processing submission: ${error.message}`);
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
        LogUtils.debug(`No cached insight for ${subdomain.key}, will use fallback`);
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
